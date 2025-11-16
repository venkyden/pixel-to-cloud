import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface Property {
  id: string;
  name: string;
  location: string;
  owner_id: string;
}

interface LeaseTermination {
  id: string;
  status: string;
  notice_date: string;
  termination_date: string;
  document_url?: string;
}

export const EndOfLeaseDocument = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [existingTermination, setExistingTermination] = useState<LeaseTermination | null>(null);
  const [userRole, setUserRole] = useState<'tenant' | 'landlord' | null>(null);
  
  const [formData, setFormData] = useState({
    tenantName: "",
    landlordName: "",
    propertyAddress: "",
    leaseStartDate: "",
    noticeDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: "",
    noticePeriod: "3" as "1" | "3" | "6",
    depositAmount: "",
    reason: ""
  });

  // Fetch user role and properties
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Get user role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (roleData) {
          setUserRole(roleData.role as 'tenant' | 'landlord');
        }

        // Fetch properties based on role
        let propertiesQuery;
        if (roleData?.role === 'landlord') {
          propertiesQuery = supabase
            .from('properties')
            .select('id, name, location, owner_id')
            .eq('owner_id', user.id);
        } else {
          // For tenants, get properties they have applications for
          const { data: applications } = await supabase
            .from('tenant_applications')
            .select('property_id, property:properties(id, name, location, owner_id)')
            .eq('user_id', user.id)
            .eq('status', 'approved');

          if (applications) {
            const props = applications
              .filter(app => app.property)
              .map(app => app.property as Property);
            setProperties(props);
            setLoadingProperties(false);
            return;
          }
        }

        if (propertiesQuery) {
          const { data } = await propertiesQuery;
          if (data) {
            setProperties(data);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load properties",
          variant: "destructive"
        });
      } finally {
        setLoadingProperties(false);
      }
    };

    fetchData();
  }, [user, toast]);

  // Check for existing termination when property is selected
  useEffect(() => {
    const checkExistingTermination = async () => {
      if (!selectedPropertyId || !user) return;

      try {
        const { data } = await supabase
          .from('lease_terminations')
          .select('*')
          .eq('property_id', selectedPropertyId)
          .or(`tenant_id.eq.${user.id},landlord_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          setExistingTermination(data);
          // Pre-fill form with existing data
          setFormData(prev => ({
            ...prev,
            tenantName: data.tenant_name,
            landlordName: data.landlord_name,
            propertyAddress: data.property_address,
            leaseStartDate: data.lease_start_date || "",
            noticeDate: data.notice_date,
            endDate: data.termination_date,
            depositAmount: data.deposit_amount?.toString() || "",
            reason: data.termination_reason || "",
            noticePeriod: data.notice_type === 'tenant_1month' ? '1' : 
                         data.notice_type === 'landlord_6months' ? '6' : '3'
          }));
        } else {
          setExistingTermination(null);
          // Load property data
          const { data: propertyData } = await supabase
            .from('properties')
            .select('name, location, owner_id')
            .eq('id', selectedPropertyId)
            .single();

          if (propertyData) {
            setFormData(prev => ({
              ...prev,
              propertyAddress: `${propertyData.name}, ${propertyData.location}`
            }));

            // Load landlord profile
            const { data: ownerProfile } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', propertyData.owner_id)
              .single();

            if (ownerProfile) {
              setFormData(prev => ({
                ...prev,
                landlordName: `${ownerProfile.first_name} ${ownerProfile.last_name}`
              }));
            }

            // Load tenant profile if tenant
            if (userRole === 'tenant') {
              const { data: tenantProfile } = await supabase
                .from('profiles')
                .select('first_name, last_name')
                .eq('id', user.id)
                .single();

              if (tenantProfile) {
                setFormData(prev => ({
                  ...prev,
                  tenantName: `${tenantProfile.first_name} ${tenantProfile.last_name}`
                }));
              }
            }
          }
        }
      } catch (error) {
        console.error('Error checking termination:', error);
      }
    };

    checkExistingTermination();
  }, [selectedPropertyId, user, userRole]);

  const handleGenerate = async () => {
    if (!user || !selectedPropertyId) {
      toast({
        title: t("documents.endOfLease.requiredFields"),
        description: t("documents.endOfLease.fillRequired"),
        variant: "destructive"
      });
      return;
    }

    if (!formData.tenantName || !formData.endDate || !formData.noticeDate) {
      toast({
        title: t("documents.endOfLease.requiredFields"),
        description: t("documents.endOfLease.fillRequired"),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const selectedProperty = properties.find(p => p.id === selectedPropertyId);
      if (!selectedProperty) throw new Error('Property not found');

      const noticeType = userRole === 'landlord' ? 'landlord_6months' :
                        formData.noticePeriod === '1' ? 'tenant_1month' : 'tenant_3months';

      const terminationData = {
        property_id: selectedPropertyId,
        tenant_id: userRole === 'tenant' ? user.id : selectedProperty.owner_id,
        landlord_id: selectedProperty.owner_id,
        notice_type: noticeType,
        notice_date: formData.noticeDate,
        lease_start_date: formData.leaseStartDate || null,
        termination_date: formData.endDate,
        tenant_name: formData.tenantName,
        landlord_name: formData.landlordName,
        property_address: formData.propertyAddress,
        deposit_amount: formData.depositAmount ? parseFloat(formData.depositAmount) : null,
        termination_reason: formData.reason || null,
        status: 'draft'
      };

      let result;
      if (existingTermination) {
        // Update existing termination
        result = await supabase
          .from('lease_terminations')
          .update(terminationData)
          .eq('id', existingTermination.id)
          .select()
          .single();
      } else {
        // Create new termination
        result = await supabase
          .from('lease_terminations')
          .insert(terminationData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      setExistingTermination(result.data);
      
      toast({
        title: t("documents.endOfLease.generated"),
        description: t("documents.endOfLease.generatedSuccess"),
      });
    } catch (error) {
      console.error('Error generating document:', error);
      toast({
        title: "Error",
        description: "Failed to generate document",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateEndDate = () => {
    if (!formData.noticeDate) return;
    
    const noticeDate = new Date(formData.noticeDate);
    const months = parseInt(formData.noticePeriod);
    noticeDate.setMonth(noticeDate.getMonth() + months);
    
    setFormData(prev => ({
      ...prev,
      endDate: format(noticeDate, 'yyyy-MM-dd')
    }));
  };

  if (loadingProperties) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("documents.endOfLease.title")}
          </CardTitle>
          <Badge variant={existingTermination ? "default" : "secondary"} className="bg-warning/10 text-warning border-warning/20">
            {existingTermination ? 
              existingTermination.status.toUpperCase() : 
              t("documents.endOfLease.subtitle")
            }
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>{t("documents.endOfLease.legalNote")}</strong>
          </AlertDescription>
        </Alert>

        {properties.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {userRole === 'landlord' 
                ? "No properties found. Please add a property first."
                : "No active rental found. You need an approved application to generate a termination notice."
              }
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="space-y-2">
              <Label>{userRole === 'landlord' ? "Select Property" : "Select Rental Property"}</Label>
              <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a property..." />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name} - {property.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPropertyId && (
              <>
                {existingTermination && (
                  <Alert className="bg-primary/5 border-primary/20">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-sm">
                      <strong>Existing termination notice found</strong>
                      <br />
                      Status: <Badge variant="outline" className="ml-1">{existingTermination.status}</Badge>
                      <br />
                      Notice date: {format(new Date(existingTermination.notice_date), 'PP')}
                      <br />
                      End date: {format(new Date(existingTermination.termination_date), 'PP')}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label>{t("documents.endOfLease.noticeType")}</Label>
                  <RadioGroup 
                    value={formData.noticePeriod} 
                    onValueChange={(value: "1" | "3" | "6") => {
                      setFormData({...formData, noticePeriod: value});
                      calculateEndDate();
                    }}
                    disabled={userRole === 'landlord'}
                  >
                    {userRole === 'tenant' && (
                      <>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="3" id="normal" />
                          <Label htmlFor="normal" className="font-normal">
                            {t("documents.endOfLease.normalNotice")}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="1" id="reduced" />
                          <Label htmlFor="reduced" className="font-normal">
                            {t("documents.endOfLease.reducedNotice")}
                          </Label>
                        </div>
                      </>
                    )}
                    {userRole === 'landlord' && (
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="6" id="landlord" checked />
                        <Label htmlFor="landlord" className="font-normal">
                          Landlord notice (6 months with legitimate reason - Art. 15)
                        </Label>
                      </div>
                    )}
                  </RadioGroup>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="tenantName">{t("documents.endOfLease.tenantName")} *</Label>
                  <Input 
                    id="tenantName"
                    placeholder="Jean Dupont"
                    value={formData.tenantName}
                    onChange={(e) => setFormData({...formData, tenantName: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="landlordName">{t("documents.endOfLease.landlordName")}</Label>
                  <Input 
                    id="landlordName"
                    placeholder="Marie Martin"
                    value={formData.landlordName}
                    onChange={(e) => setFormData({...formData, landlordName: e.target.value})}
                    disabled={userRole === 'tenant'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propertyAddress">{t("documents.endOfLease.propertyAddress")}</Label>
                  <Input 
                    id="propertyAddress"
                    placeholder="123 Rue de la Paix, 75001 Paris"
                    value={formData.propertyAddress}
                    onChange={(e) => setFormData({...formData, propertyAddress: e.target.value})}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="leaseStartDate">{t("documents.endOfLease.leaseStartDate")}</Label>
                    <Input 
                      id="leaseStartDate"
                      type="date"
                      value={formData.leaseStartDate}
                      onChange={(e) => setFormData({...formData, leaseStartDate: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="noticeDate">{t("documents.endOfLease.noticeDate")} *</Label>
                    <Input 
                      id="noticeDate"
                      type="date"
                      value={formData.noticeDate}
                      onChange={(e) => {
                        setFormData({...formData, noticeDate: e.target.value});
                        setTimeout(calculateEndDate, 100);
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">{t("documents.endOfLease.endDate")} *</Label>
                  <Input 
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("documents.endOfLease.endDateNote")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="depositAmount">{t("documents.endOfLease.depositAmount")}</Label>
                  <Input 
                    id="depositAmount"
                    type="number"
                    placeholder="1200"
                    value={formData.depositAmount}
                    onChange={(e) => setFormData({...formData, depositAmount: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("documents.endOfLease.depositNote")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">{t("documents.endOfLease.reason")}</Label>
                  <Textarea 
                    id="reason"
                    placeholder={t("documents.endOfLease.reasonPlaceholder")}
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    rows={3}
                  />
                </div>

                <Separator />

                <div className="bg-accent/5 p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold text-sm">{t("documents.endOfLease.nextSteps")}</h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                    <li>{t("documents.endOfLease.checkOut")}</li>
                    <li>{t("documents.endOfLease.returnKeys")}</li>
                    <li>{t("documents.endOfLease.returnDeposit")}</li>
                    <li>{t("documents.endOfLease.finalAccount")}</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={handleGenerate}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        {existingTermination ? "Update Document" : t("documents.endOfLease.generate")}
                      </>
                    )}
                  </Button>
                  {existingTermination && (
                    <Button variant="outline" className="w-full" disabled>
                      <Download className="mr-2 h-4 w-4" />
                      {t("documents.endOfLease.download")}
                    </Button>
                  )}
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  {t("documents.endOfLease.legalCompliance")}
                </p>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

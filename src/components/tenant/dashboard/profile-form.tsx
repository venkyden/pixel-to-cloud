'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/components/providers/language-provider";
import { TenantProfile } from "@/types";
import { ArrowRight, Save } from "lucide-react";
import { toast } from "sonner";
import { useTenantProfile } from "@/hooks/use-tenant-profile";

const amenityKeys = [
    "wifi", "parking", "pool", "gym", "ac", "heating", "washer", "dryer", "elevator", "balcony", "garden", "pets_allowed"
];

interface TenantProfileFormProps {
    initialProfile?: TenantProfile;
    onSave?: (profile: TenantProfile) => void;
}

export const TenantProfileForm = ({ initialProfile, onSave }: TenantProfileFormProps) => {
    const { t } = useLanguage();
    const { profile: fetchedProfile, updateProfile } = useTenantProfile();
    const [profile, setProfile] = useState<TenantProfile>(initialProfile || {
        budget: "600-900",
        location: "paris",
        moveInDate: "2026-01-01",
        amenities: [],
        roomCount: "2",
        employmentStatus: 'cdi',
        guarantor: 'visale'
    });

    useEffect(() => {
        if (fetchedProfile) {
            setProfile(fetchedProfile);
        }
    }, [fetchedProfile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await updateProfile(profile);
        if (success) {
            onSave?.(profile);
        }
    };

    return (
        <Card className="p-8 max-w-2xl mx-auto glass-effect border-border/50">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Your Smart Profile</h2>
                    <p className="text-muted-foreground">Update your preferences to get better AI matches</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleSubmit}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Budget Range (€/month)</Label>
                        <Select value={profile.budget} onValueChange={(value) => setProfile({ ...profile, budget: value })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="300-600">€300 - €600</SelectItem>
                                <SelectItem value="600-900">€600 - €900</SelectItem>
                                <SelectItem value="900-1200">€900 - €1,200</SelectItem>
                                <SelectItem value="1200-1500">€1,200 - €1,500</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Preferred Location</Label>
                        <Select value={profile.location} onValueChange={(value) => setProfile({ ...profile, location: value })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="paris">Paris</SelectItem>
                                <SelectItem value="lyon">Lyon</SelectItem>
                                <SelectItem value="nantes">Nantes</SelectItem>
                                <SelectItem value="marseille">Marseille</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Employment Status (Situation Pro)</Label>
                        <Select
                            value={profile.employmentStatus}
                            onValueChange={(value: any) => setProfile({ ...profile, employmentStatus: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cdi">Permanent (CDI)</SelectItem>
                                <SelectItem value="cdd">Fixed-Term (CDD)</SelectItem>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="freelance">Freelance / Self-Employed</SelectItem>
                                <SelectItem value="retired">Retired</SelectItem>
                                <SelectItem value="unemployed">Unemployed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Guarantor (Garant)</Label>
                        <Select
                            value={profile.guarantor}
                            onValueChange={(value: any) => setProfile({ ...profile, guarantor: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select guarantor type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="visale">Visale (State Guarantee)</SelectItem>
                                <SelectItem value="physical">Physical Person (Parent/Friend)</SelectItem>
                                <SelectItem value="bank">Bank Guarantee</SelectItem>
                                <SelectItem value="none">No Guarantor</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Move-in Date</Label>
                    <Input
                        type="date"
                        value={profile.moveInDate}
                        onChange={(e) => setProfile({ ...profile, moveInDate: e.target.value })}
                    />
                </div>

                <div className="space-y-3">
                    <Label>Desired Amenities</Label>
                    <div className="grid grid-cols-2 gap-3">
                        {amenityKeys.map((key) => (
                            <div key={key} className="flex items-center space-x-2">
                                <Checkbox
                                    id={key}
                                    checked={profile.amenities?.includes(key)}
                                    onCheckedChange={(checked) => {
                                        const newAmenities = checked
                                            ? [...(profile.amenities || []), key]
                                            : profile.amenities?.filter(a => a !== key) || [];
                                        setProfile({ ...profile, amenities: newAmenities });
                                    }}
                                />
                                <label htmlFor={key} className="text-sm cursor-pointer capitalize">
                                    {t(`amenities.${key}`) || key.replace('_', ' ')}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <Button type="submit" className="w-full" size="lg">
                    Update Profile & Find Matches
                    <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </form>
        </Card>
    );
};

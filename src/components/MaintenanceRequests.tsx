import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Wrench, Plus } from "lucide-react";

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  date: string;
}

const mockRequests: MaintenanceRequest[] = [
  {
    id: "1",
    title: "Leaking Faucet",
    description: "Kitchen faucet is dripping constantly",
    status: "in-progress",
    priority: "medium",
    date: "2024-01-15",
  },
  {
    id: "2",
    title: "AC Not Working",
    description: "Air conditioning unit not cooling",
    status: "pending",
    priority: "high",
    date: "2024-01-14",
  },
];

export const MaintenanceRequests = () => {
  const { toast } = useToast();
  const [requests] = useState<MaintenanceRequest[]>(mockRequests);

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      "in-progress": "default",
      completed: "outline",
    } as const;
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: "bg-muted text-muted-foreground",
      medium: "bg-warning/20 text-warning",
      high: "bg-destructive/20 text-destructive",
    };
    return <Badge className={colors[priority as keyof typeof colors]}>{priority}</Badge>;
  };

  const handleSubmit = () => {
    toast({
      title: "Request Submitted",
      description: "We'll review your maintenance request shortly.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Maintenance Requests
          </CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Maintenance Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input placeholder="Brief description of the issue" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Detailed description of the problem" rows={4} />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <div className="flex gap-2">
                    {["Low", "Medium", "High"].map((priority) => (
                      <Button key={priority} variant="outline" className="flex-1">
                        {priority}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button className="w-full" onClick={handleSubmit}>
                  Submit Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="p-4 border rounded-lg space-y-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-semibold text-foreground">{request.title}</h4>
                  <p className="text-sm text-muted-foreground">{request.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(request.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {getPriorityBadge(request.priority)}
                  {getStatusBadge(request.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

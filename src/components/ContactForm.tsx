import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message must be less than 2000 characters")
});

export const ContactForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate input
      contactSchema.parse(formData);
      
      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card className="glass-effect border-border/50 shadow-elegant overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold">
            Contact Support
          </span>
        </CardTitle>
        <CardDescription className="ml-13 text-muted-foreground font-medium">
          Have questions? We're here to help.
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground font-semibold">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="glass-effect border-border/50 focus:ring-2 focus:ring-primary/30 transition-all duration-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-semibold">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="glass-effect border-border/50 focus:ring-2 focus:ring-primary/30 transition-all duration-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-foreground font-semibold">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
              className="glass-effect border-border/50 focus:ring-2 focus:ring-primary/30 transition-all duration-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message" className="text-foreground font-semibold">Message</Label>
            <Textarea
              id="message"
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              className="glass-effect border-border/50 focus:ring-2 focus:ring-primary/30 transition-all duration-300 resize-none"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
          >
            Send Message
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

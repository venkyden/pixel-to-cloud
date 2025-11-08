import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface RoleCardProps {
  icon: string;
  title: string;
  description: string;
  benefits: string[];
  onClick: () => void;
}

export const RoleCard = ({ icon, title, description, benefits, onClick }: RoleCardProps) => {
  return (
    <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer group" onClick={onClick}>
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-2xl font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      <ul className="space-y-3 mb-6">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
            <span className="text-foreground">{benefit}</span>
          </li>
        ))}
      </ul>
      <Button className="w-full group-hover:scale-105 transition-transform">
        Get Started
      </Button>
    </Card>
  );
};

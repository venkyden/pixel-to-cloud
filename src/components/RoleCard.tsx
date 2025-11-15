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
    <Card 
      className="group relative overflow-hidden glass-effect border-border/50 hover:shadow-elegant transition-all duration-500 hover:scale-[1.02] cursor-pointer" 
      onClick={onClick}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative p-8 space-y-6">
        <div className="text-6xl group-hover:scale-110 transition-transform duration-300 floating">
          {icon}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 mb-2">
            {title}
          </h3>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
        <ul className="space-y-3">
          {benefits.map((benefit, index) => (
            <li 
              key={index} 
              className="flex items-center gap-3 text-sm group/item"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-success/20 to-success/10 flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300">
                <CheckCircle2 className="w-4 h-4 text-success" />
              </div>
              <span className="text-foreground font-medium">{benefit}</span>
            </li>
          ))}
        </ul>
        <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg group-hover:scale-105">
          Get Started
        </Button>
      </div>
    </Card>
  );
};

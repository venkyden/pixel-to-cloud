import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

interface ReviewCardProps {
  authorName: string;
  rating: number;
  date: string;
  comment: string;
  propertyName?: string;
}

export const ReviewCard = ({
  authorName,
  rating,
  date,
  comment,
  propertyName,
}: ReviewCardProps) => {
  return (
    <Card className="group glass-effect border-border/50 hover:shadow-elegant transition-all duration-300 hover:scale-[1.01]">
      <CardContent className="pt-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-12 w-12 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
              {authorName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                  {authorName}
                </h4>
                {propertyName && (
                  <p className="text-sm text-muted-foreground font-medium">{propertyName}</p>
                )}
              </div>
              <span className="text-sm text-muted-foreground font-medium">{date}</span>
            </div>
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 transition-all duration-300 ${
                    i < rating
                      ? "fill-primary text-primary group-hover:scale-110"
                      : "fill-muted text-muted"
                  }`}
                />
              ))}
            </div>
            <div className="p-3 rounded-lg glass-effect border border-border/50">
              <p className="text-sm text-muted-foreground leading-relaxed">{comment}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

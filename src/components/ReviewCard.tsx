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
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start space-x-4">
          <Avatar>
            <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-foreground">{authorName}</h4>
                {propertyName && (
                  <p className="text-sm text-muted-foreground">{propertyName}</p>
                )}
              </div>
              <span className="text-sm text-muted-foreground">{date}</span>
            </div>
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < rating
                      ? "fill-primary text-primary"
                      : "fill-muted text-muted"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{comment}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

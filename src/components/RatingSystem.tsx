import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, ThumbsUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface RatingSystemProps {
  targetUserId: string;
  targetUserName: string;
  targetUserRole: "landlord" | "tenant";
  contractId: string;
}

export const RatingSystem = ({
  targetUserId,
  targetUserName,
  targetUserRole,
  contractId,
}: RatingSystemProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingRating, setExistingRating] = useState<any>(null);
  const [allRatings, setAllRatings] = useState<any[]>([]);

  useEffect(() => {
    fetchRatings();
  }, [targetUserId]);

  const fetchRatings = async () => {
    try {
      // Check if user already rated
      const { data: myRating } = await supabase
        .from("ratings")
        .select("*")
        .eq("contract_id", contractId)
        .eq("reviewer_id", user?.id)
        .maybeSingle();

      setExistingRating(myRating);

      // Fetch all ratings for this user
      const { data: ratings } = await supabase
        .from("ratings")
        .select("*, reviewer:profiles!reviewer_id(first_name, last_name)")
        .eq("rated_user_id", targetUserId)
        .order("created_at", { ascending: false });

      setAllRatings(ratings || []);
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  };

  const MAX_COMMENT_LENGTH = 500;

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (comment.trim().length > MAX_COMMENT_LENGTH) {
      toast.error(`Comment must be less than ${MAX_COMMENT_LENGTH} characters`);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("ratings").insert({
        contract_id: contractId,
        reviewer_id: user?.id,
        rated_user_id: targetUserId,
        rating,
        comment: comment.trim() || null,
      });

      if (error) throw error;

      // Send notification
      await supabase.from("notifications").insert({
        user_id: targetUserId,
        title: "New Rating Received",
        message: `You received a ${rating}-star rating from your ${targetUserRole === "landlord" ? "tenant" : "landlord"}`,
        type: "success",
      });

      toast.success("Rating submitted successfully");
      fetchRatings();
    } catch (error: any) {
      console.error("Error submitting rating:", error);
      toast.error("Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  const averageRating = allRatings.length > 0
    ? (allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      {!existingRating ? (
        <Card>
          <CardHeader>
            <CardTitle>Rate {targetUserName}</CardTitle>
            <CardDescription>
              Share your experience as {targetUserRole === "landlord" ? "a tenant" : "a landlord"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-lg font-semibold">{rating}/5</span>
              )}
            </div>

            <div>
              <Textarea
                placeholder="Share details about your experience (optional)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {comment.length}/500 characters
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading || rating === 0}
              className="w-full"
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Submit Rating
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-success/20 bg-success/5">
          <CardHeader>
            <CardTitle className="text-success">Rating Submitted</CardTitle>
            <CardDescription>
              You rated {targetUserName} {existingRating.rating}/5 stars
            </CardDescription>
          </CardHeader>
          {existingRating.comment && (
            <CardContent>
              <p className="text-sm italic">"{existingRating.comment}"</p>
            </CardContent>
          )}
        </Card>
      )}

      {allRatings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Reviews for {targetUserName}
              <Badge variant="secondary">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                {averageRating} ({allRatings.length})
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {allRatings.slice(0, 5).map((review) => (
              <div key={review.id} className="flex gap-3 p-3 border rounded-lg">
                <Avatar>
                  <AvatarFallback>
                    {review.reviewer?.first_name?.[0] || "?"}
                    {review.reviewer?.last_name?.[0] || ""}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {review.reviewer?.first_name} {review.reviewer?.last_name}
                    </span>
                    <div className="flex">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-3 h-3 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(review.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

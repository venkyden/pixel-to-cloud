import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AIPropertySearchProps {
  onSearchResults?: (matches: Array<{ id: number; score: number; reason: string }>) => void;
  properties: any[];
}

export const AIPropertySearch = ({ onSearchResults, properties }: AIPropertySearchProps) => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { language } = useLanguage();

  const handleAISearch = async () => {
    if (!query.trim() || isSearching) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-property-search', {
        body: { query, properties, language }
      });

      if (error) throw error;

      if (data?.error === 'rate_limit') {
        toast.error(language === 'fr' 
          ? 'Limite de taux atteinte. Réessayez plus tard.'
          : 'Rate limit reached. Try again later.'
        );
        return;
      }

      if (data?.error === 'credits_exhausted') {
        toast.error(language === 'fr'
          ? 'Crédits IA épuisés. Ajoutez des crédits.'
          : 'AI credits exhausted. Add credits.'
        );
        return;
      }

      if (data?.matches) {
        onSearchResults?.(data.matches);
        toast.success(language === 'fr'
          ? `${data.matches.length} propriétés trouvées`
          : `${data.matches.length} properties found`
        );
      }
    } catch (error: any) {
      console.error('AI search error:', error);
      toast.error(language === 'fr'
        ? 'Erreur lors de la recherche IA'
        : 'AI search error'
      );
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card className="mb-4 border-primary/20">
      <CardContent className="pt-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
              placeholder={
                language === 'fr'
                  ? 'Ex: Appartement calme avec balcon près du métro...'
                  : 'E.g: Quiet apartment with balcony near metro...'
              }
              className="pl-10"
              disabled={isSearching}
            />
          </div>
          <Button onClick={handleAISearch} disabled={isSearching || !query.trim()}>
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {language === 'fr'
            ? 'Décrivez votre logement idéal en langage naturel'
            : 'Describe your ideal property in natural language'}
        </p>
      </CardContent>
    </Card>
  );
};

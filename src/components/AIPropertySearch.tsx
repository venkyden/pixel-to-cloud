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
    } catch (error: unknown) {
      if (import.meta.env.DEV) console.error('AI search error:', error);
      toast.error(language === 'fr'
        ? 'Erreur lors de la recherche IA'
        : 'AI search error'
      );
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card className="mb-4 glass-effect border-primary/30 shadow-elegant overflow-hidden group hover:shadow-glow transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
      <CardContent className="pt-6 relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary animate-pulse" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
              placeholder={
                language === 'fr'
                  ? 'Ex: Appartement calme avec balcon près du métro...'
                  : 'E.g: Quiet apartment with balcony near metro...'
              }
              className="pl-11 glass-effect border-primary/20 focus:ring-2 focus:ring-primary/30 transition-all duration-300 font-medium"
              disabled={isSearching}
            />
          </div>
          <Button
            onClick={handleAISearch}
            disabled={isSearching || !query.trim()}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3 font-medium flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          {language === 'fr'
            ? 'Décrivez votre logement idéal en langage naturel'
            : 'Describe your ideal property in natural language'}
        </p>
      </CardContent>
    </Card>
  );
};

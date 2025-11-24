import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Bookmark, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PropertyFilters } from "./AdvancedFilters";

interface SavedSearch {
  id: string;
  name: string;
  filters: PropertyFilters;
  created_at: string;
}

interface SavedSearchesProps {
  onLoadSearch: (filters: PropertyFilters) => void;
}

export const SavedSearches = ({ onLoadSearch }: SavedSearchesProps) => {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSearches();
    }
  }, [user]);

  const fetchSearches = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("saved_searches")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      if (import.meta.env.DEV) console.error("Error fetching saved searches:", error);
      return;
    }

    setSearches((data as unknown as SavedSearch[]) || []);
  };

  const handleLoadSearch = (search: SavedSearch) => {
    onLoadSearch(search.filters);
    setIsOpen(false);
    toast({
      title: "Search loaded",
      description: `Applied filters from "${search.name}"`,
    });
  };

  const handleDeleteSearch = async (searchId: string, searchName: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const { error } = await supabase
      .from("saved_searches")
      .delete()
      .eq("id", searchId);

    if (error) {
      if (import.meta.env.DEV) console.error("Error deleting search:", error);
      toast({
        title: "Error",
        description: "Failed to delete search",
        variant: "destructive",
      });
      return;
    }

    setSearches(searches.filter((s) => s.id !== searchId));
    toast({
      title: "Search deleted",
      description: `"${searchName}" has been removed`,
    });
  };

  if (!user) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="glass-effect border-border/50 hover:bg-primary/5 hover:scale-105 transition-all duration-300 shadow-md">
          <Bookmark className="h-4 w-4 mr-2 text-primary" />
          Saved Searches {searches.length > 0 && `(${searches.length})`}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 glass-effect border-border/50 shadow-elegant">
        {searches.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground font-medium">
            No saved searches yet
          </div>
        ) : (
          <>
            {searches.map((search, index) => (
              <div key={search.id}>
                {index > 0 && <DropdownMenuSeparator className="bg-border/50" />}
                <DropdownMenuItem
                  className="flex items-center justify-between cursor-pointer hover:bg-primary/5 transition-all duration-300 rounded-md"
                  onSelect={() => handleLoadSearch(search)}
                >
                  <span className="flex-1 font-medium">{search.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                    onClick={(e) => handleDeleteSearch(search.id, search.name, e)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </DropdownMenuItem>
              </div>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

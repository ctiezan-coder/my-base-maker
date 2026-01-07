import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Send, Trash2, UserCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";

interface ProjectCommentsTabProps {
  projectId: string;
}

export function ProjectCommentsTab({ projectId }: ProjectCommentsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");

  const { data: comments, isLoading } = useQuery({
    queryKey: ["project-comments", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_comments")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addComment = useMutation({
    mutationFn: async () => {
      if (!newComment.trim()) return;
      const { error } = await supabase.from("project_comments").insert([{
        project_id: projectId,
        user_id: user?.id,
        content: newComment.trim(),
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-comments", projectId] });
      setNewComment("");
      toast({ title: "Commentaire ajouté" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("project_comments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-comments", projectId] });
      toast({ title: "Commentaire supprimé" });
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-4">
      {/* Add comment */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Ajouter un commentaire..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={2}
              className="flex-1"
            />
            <Button 
              onClick={() => addComment.mutate()} 
              disabled={!newComment.trim() || addComment.isPending}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <h3 className="font-semibold">Commentaires ({comments?.length || 0})</h3>

      {comments?.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun commentaire pour le moment
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {comments?.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="py-3">
                <div className="flex items-start gap-3">
                  <UserCircle className="w-8 h-8 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">Utilisateur</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {format(new Date(comment.created_at), "dd MMM yyyy à HH:mm", { locale: fr })}
                        </span>
                      </div>
                      {comment.user_id === user?.id && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => deleteComment.mutate(comment.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                    <p className="mt-1 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

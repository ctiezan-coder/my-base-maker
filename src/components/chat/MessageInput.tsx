import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { toast } from "sonner";

interface MessageInputProps {
  receiverId: string;
}

export function MessageInput({ receiverId }: MessageInputProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      if (!user) throw new Error("Non authentifié");

      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          sender_id: user.id,
          receiver_ids: [receiverId],
          message: messageText,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["private-chat-messages", receiverId] });
      setMessage("");
    },
    onError: (error: Error) => {
      toast.error("Erreur lors de l'envoi du message", {
        description: error.message,
      });
    },
  });

  const handleSend = () => {
    if (message.trim()) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2">
      <Textarea
        placeholder="Tapez votre message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        className="resize-none"
        rows={2}
      />
      <Button
        onClick={handleSend}
        disabled={sendMessageMutation.isPending || !message.trim()}
        size="icon"
        className="self-end"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useUnreadMessagesByUser } from "@/hooks/useUnreadMessagesByUser";

interface UserListProps {
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
}

export function UserList({ selectedUserId, onSelectUser }: UserListProps) {
  const { user } = useAuth();
  const { unreadByUser } = useUnreadMessagesByUser();

  const { data: users, isLoading } = useQuery({
    queryKey: ["chat-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .neq("user_id", user?.id || "")
        .order("full_name");

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Aucun utilisateur disponible
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
          UTILISATEURS ({users.length})
        </h3>
        <div className="space-y-1">
          {users.map((u) => {
            const initials = u.full_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            const unreadCount = unreadByUser[u.user_id] || 0;

            return (
              <button
                key={u.user_id}
                onClick={() => onSelectUser(u.user_id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
                  selectedUserId === u.user_id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  {unreadCount > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center bg-secondary text-secondary-foreground text-xs font-bold"
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Badge>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium truncate",
                    unreadCount > 0 && selectedUserId !== u.user_id && "font-bold"
                  )}>
                    {u.full_name}
                  </p>
                  <p className={cn(
                    "text-xs truncate",
                    selectedUserId === u.user_id
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground"
                  )}>
                    {u.email}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}

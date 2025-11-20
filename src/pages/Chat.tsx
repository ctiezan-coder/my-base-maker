import { useState } from "react";
import { Card } from "@/components/ui/card";
import { UserList } from "@/components/chat/UserList";
import { ConversationView } from "@/components/chat/ConversationView";

export default function Chat() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Messagerie</h1>
          <p className="text-muted-foreground mt-2">
            Communiquez en privé avec les membres de l'équipe
          </p>
        </div>

        <Card className="overflow-hidden h-[calc(100vh-250px)]">
          <div className="flex h-full">
            {/* Liste des utilisateurs */}
            <div className="w-80 border-r border-border bg-muted/30">
              <UserList
                selectedUserId={selectedUserId}
                onSelectUser={setSelectedUserId}
              />
            </div>

            {/* Vue de conversation */}
            <div className="flex-1">
              {selectedUserId ? (
                <ConversationView receiverId={selectedUserId} />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <p className="text-lg">Sélectionnez un utilisateur</p>
                    <p className="text-sm">pour commencer une conversation</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

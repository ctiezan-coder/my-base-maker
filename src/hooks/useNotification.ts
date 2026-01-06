import { supabase } from "@/integrations/supabase/client";

interface NotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: string;
  referenceId?: string;
  referenceTable?: string;
}

export async function createNotification({
  userId,
  title,
  message,
  type = "info",
  referenceId,
  referenceTable,
}: NotificationParams) {
  try {
    const { error } = await supabase.from("notifications").insert({
      user_id: userId,
      title,
      message,
      type,
      reference_id: referenceId || null,
      reference_table: referenceTable || null,
    });

    if (error) {
      console.error("Erreur création notification:", error);
    }
  } catch (err) {
    console.error("Erreur notification:", err);
  }
}

export function useNotification() {
  return { createNotification };
}

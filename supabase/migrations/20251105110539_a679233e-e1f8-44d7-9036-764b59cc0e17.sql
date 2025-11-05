-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_ids UUID[] NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chat messages
CREATE POLICY "Users can view messages they sent or received"
  ON public.chat_messages
  FOR SELECT
  USING (
    auth.uid() = sender_id OR 
    auth.uid() = ANY(receiver_ids)
  );

CREATE POLICY "Users can send messages"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Create index for better performance
CREATE INDEX idx_chat_messages_sender ON public.chat_messages(sender_id);
CREATE INDEX idx_chat_messages_receivers ON public.chat_messages USING GIN(receiver_ids);

-- Enable realtime for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Add unique constraint for upsert on session_id + memory_key
CREATE UNIQUE INDEX idx_conversation_memory_upsert ON public.conversation_memory (session_id, memory_key);

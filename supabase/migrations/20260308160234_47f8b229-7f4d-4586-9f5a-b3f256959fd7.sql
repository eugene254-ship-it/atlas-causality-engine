CREATE TABLE public.annotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_type TEXT NOT NULL CHECK (target_type IN ('node', 'edge')),
  target_id TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  color TEXT NOT NULL DEFAULT '#14b8a6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.annotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read annotations" ON public.annotations FOR SELECT USING (true);
CREATE POLICY "Anyone can insert annotations" ON public.annotations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete annotations" ON public.annotations FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.annotations;
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardStore } from '@/store/dashboardStore';
import { MessageSquarePlus, Send, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Annotation {
  id: string;
  target_type: string;
  target_id: string;
  content: string;
  author_name: string;
  color: string;
  created_at: string;
}

const NOTE_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--severity-high))',
  'hsl(var(--domain-economics))',
  'hsl(var(--domain-governance))',
  'hsl(var(--severity-low))',
];

export default function AnnotationsPanel({ targetType, targetId }: { targetType: 'node' | 'edge'; targetId: string }) {
  const { user } = useAuth();
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(NOTE_COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch annotations
  useEffect(() => {
    const fetchAnnotations = async () => {
      const { data } = await supabase
        .from('annotations')
        .select('*')
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .order('created_at', { ascending: false });
      if (data) setAnnotations(data as Annotation[]);
    };
    fetchAnnotations();

    // Realtime subscription
    const channel = supabase
      .channel(`annotations-${targetType}-${targetId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'annotations',
        filter: `target_id=eq.${targetId}`,
      }, () => { fetchAnnotations(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [targetType, targetId]);

  const addAnnotation = async () => {
    if (!newContent.trim() || !user) return;
    setIsLoading(true);
    await supabase.from('annotations').insert({
      target_type: targetType,
      target_id: targetId,
      content: newContent.trim(),
      author_name: user.user_metadata?.display_name || user.email || 'Anonymous',
      color: selectedColor,
      user_id: user.id,
    } as any);
    setNewContent('');
    setIsLoading(false);
  };

  const deleteAnnotation = async (id: string) => {
    await supabase.from('annotations').delete().eq('id', id);
    setAnnotations(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="border-t border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <MessageSquarePlus size={12} />
          <span>Notes</span>
          {annotations.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono">
              {annotations.length}
            </span>
          )}
        </div>
        <span className="text-[10px]">{isOpen ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-2">
              {/* Input */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                  placeholder="Your name…"
                  className="w-full px-2.5 py-1.5 rounded text-[11px] bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <div className="flex gap-1.5">
                  <textarea
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    placeholder="Add a note…"
                    rows={2}
                    className="flex-1 px-2.5 py-1.5 rounded text-[11px] bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addAnnotation(); } }}
                  />
                  <button
                    onClick={addAnnotation}
                    disabled={!newContent.trim() || isLoading}
                    className="px-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 transition-colors"
                  >
                    <Send size={12} />
                  </button>
                </div>
                <div className="flex gap-1">
                  {NOTE_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`w-4 h-4 rounded-full border-2 transition-transform ${selectedColor === c ? 'scale-125 border-foreground' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* List */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {annotations.map(a => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2 rounded-lg bg-muted border-l-2 group"
                    style={{ borderLeftColor: a.color }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-mono text-muted-foreground mb-0.5">
                          {a.author_name} · {new Date(a.created_at).toLocaleDateString()}
                        </div>
                        <p className="text-[11px] text-secondary-foreground leading-relaxed">{a.content}</p>
                      </div>
                      <button
                        onClick={() => deleteAnnotation(a.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </motion.div>
                ))}
                {annotations.length === 0 && (
                  <div className="text-[10px] text-muted-foreground text-center py-2">No notes yet</div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

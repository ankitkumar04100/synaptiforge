import { useAppStore } from '@/store/useAppStore';
import { db } from '@/db/dexie';
import { learnReflex } from '@/api/edge';
import { motion } from 'framer-motion';
import { Zap, Search, Plus, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ReflexesPage() {
  const { reflexes, toggleReflex, addReflex } = useAppStore();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newTrigger, setNewTrigger] = useState('');
  const [newTransform, setNewTransform] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const filtered = reflexes.filter(r =>
    !search || r.triggerPattern.includes(search) || r.transformation.includes(search)
  );

  const handleToggle = async (id: string) => {
    toggleReflex(id);
    const reflex = reflexes.find(r => r.id === id);
    if (reflex) await db.reflexes.update(id, { enabled: !reflex.enabled });
  };

  const handleAddReflex = async () => {
    if (!newTrigger.trim() || !newTransform.trim()) { toast.error('Fill in both fields'); return; }
    setAddLoading(true);
    try {
      const res = await learnReflex({ triggerPattern: newTrigger, transformation: newTransform });
      addReflex(res);
      await db.reflexes.put(res);
      toast.success(`Reflex learned (${Math.round(res.confidence * 100)}% confidence)`);
      setNewTrigger('');
      setNewTransform('');
      setShowAdd(false);
    } catch {
      // Local fallback
      const reflex = {
        id: `ref-${Date.now()}`,
        triggerPattern: newTrigger,
        transformation: newTransform,
        confidence: 0.55,
        enabled: true,
        examples: [],
        createdAt: new Date().toISOString(),
      };
      addReflex(reflex);
      await db.reflexes.put(reflex);
      toast.success('Reflex added locally');
      setNewTrigger('');
      setNewTransform('');
      setShowAdd(false);
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Reflexes</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Learned patterns from your accepted patches</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search patterns..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <Badge variant="outline" className="text-[10px]">{reflexes.filter(r => r.enabled).length} active</Badge>
        <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-3 h-3" /> Add
        </Button>
      </div>

      {/* Add reflex form */}
      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="sf-card p-4 space-y-3">
          <div className="text-xs font-medium text-foreground">Teach a new reflex</div>
          <input
            type="text"
            value={newTrigger}
            onChange={e => setNewTrigger(e.target.value)}
            placeholder="Trigger pattern (e.g. 'if x == None')"
            className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
          <input
            type="text"
            value={newTransform}
            onChange={e => setNewTransform(e.target.value)}
            placeholder="Transformation (e.g. 'Replace with if x is None')"
            className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
          <Button size="sm" className="rounded-xl text-xs gap-1 sf-primary-grad border-0" onClick={handleAddReflex} disabled={addLoading}>
            {addLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
            Learn Reflex
          </Button>
        </motion.div>
      )}

      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">No reflexes found</p>}
        {filtered.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="sf-card p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className={`w-3.5 h-3.5 ${r.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                  <code className="text-xs font-mono font-medium text-foreground">{r.triggerPattern}</code>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${r.confidence >= 0.8 ? 'border-success/30 text-success' : r.confidence >= 0.6 ? 'border-warning/30 text-warning' : 'border-muted-foreground/30'}`}
                  >
                    {r.confidence >= 0.8 ? 'High' : r.confidence >= 0.6 ? 'Med' : 'Low'} {Math.round(r.confidence * 100)}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{r.transformation}</p>
                <button
                  onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                  className="text-[10px] text-primary hover:underline mt-1"
                >
                  {expanded === r.id ? 'Hide' : 'Show'} examples
                </button>
                {expanded === r.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-2 space-y-1">
                    {r.examples.length === 0 && <div className="text-[10px] text-muted-foreground italic">No examples yet</div>}
                    {r.examples.map((ex, ei) => (
                      <div key={ei} className="text-[10px] font-mono text-muted-foreground bg-surface rounded px-2 py-1">{ex}</div>
                    ))}
                  </motion.div>
                )}
              </div>
              <button
                onClick={() => handleToggle(r.id)}
                className={`w-9 h-5 rounded-full transition-colors flex-shrink-0 relative ${r.enabled ? 'bg-success' : 'bg-muted'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-background absolute top-0.5 transition-transform ${r.enabled ? 'left-4.5' : 'left-0.5'}`} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Explanation */}
      <div className="sf-card p-4">
        <h3 className="text-xs font-semibold text-foreground mb-2">How Reflexes Work</h3>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>• When you accept a patch, Synaptiforge mines for trigger/transformation patterns</li>
          <li>• Similar acceptances increase confidence over time (starts at 55%)</li>
          <li>• Reflexes with confidence ≥ 60% auto-suggest in the Editor</li>
          <li>• Toggle reflexes on/off to control suggestions</li>
        </ul>
      </div>
    </div>
  );
}

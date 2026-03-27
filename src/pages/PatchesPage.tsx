import { useAppStore } from '@/store/useAppStore';
import { db } from '@/db/dexie';
import { DiffViewer } from '@/components/DiffViewer';
import { applyUnifiedDiff } from '@/lib/engine';
import { motion, AnimatePresence } from 'framer-motion';
import { FileCode, Play, ExternalLink, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { toast } from 'sonner';

export default function PatchesPage() {
  const { patches, updatePatchStatus, editorContent, setEditorContent } = useAppStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleApply = async (patchId: string) => {
    const patch = patches.find(p => p.id === patchId);
    if (!patch) return;
    const { result, success } = applyUnifiedDiff(editorContent, patch.diff);
    if (success) {
      setEditorContent(result);
      updatePatchStatus(patchId, 'applied');
      await db.patches.update(patchId, { status: 'applied' });
      toast.success('Patch applied locally');
    } else {
      toast.error('Failed to apply patch');
    }
  };

  const handleOpenPR = async (patchId: string) => {
    // In a real implementation, this would call the backend
    toast('GitHub token not configured — apply locally instead', { description: 'Set GITHUB_TOKEN to enable PR creation' });
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-success/10 text-success border-success/20';
      case 'pr_opened': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-warning/10 text-warning border-warning/20';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Patches</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage generated and applied patches</p>
      </div>

      <div className="space-y-3">
        {patches.length === 0 && <p className="text-sm text-muted-foreground">No patches yet. Use the Editor to generate patches.</p>}
        {patches.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="sf-card overflow-hidden"
          >
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface/50 transition-colors"
              onClick={() => setExpanded(expanded === p.id ? null : p.id)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileCode className="w-4 h-4 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-mono font-medium text-foreground truncate">{p.filePath}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{p.explanation}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="outline" className={`text-[10px] ${statusColor(p.status)}`}>{p.status}</Badge>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded === p.id ? 'rotate-180' : ''}`} />
              </div>
            </div>

            <AnimatePresence>
              {expanded === p.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-border"
                >
                  <div className="p-4 space-y-3">
                    <DiffViewer diff={p.diff} explanation={p.explanation} />
                    <div className="flex flex-wrap gap-2">
                      {p.status === 'pending' && (
                        <>
                          <Button size="sm" className="rounded-xl text-xs gap-1 sf-primary-grad border-0" onClick={() => handleApply(p.id)}>
                            <Play className="w-3 h-3" /> Apply Locally
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1" onClick={() => handleOpenPR(p.id)}>
                            <ExternalLink className="w-3 h-3" /> Open PR
                          </Button>
                        </>
                      )}
                      {p.prUrl && (
                        <a href={p.prUrl} target="_blank" rel="noopener" className="text-xs text-primary hover:underline flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> View PR
                        </a>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Created {new Date(p.createdAt).toLocaleString()}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

import { useAppStore } from '@/store/useAppStore';
import { DiffViewer } from '@/components/DiffViewer';
import { generateHeuristicSuggestion, applyUnifiedDiff } from '@/lib/engine';
import { db } from '@/db/dexie';
import { useState, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, FileCode, Undo2, Redo2, Copy, Check, Wand2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const MonacoEditor = lazy(() => import('@monaco-editor/react'));

interface SuggestionResult {
  suggestion: string;
  patch: string;
  explanation: string;
}

export default function EditorPage() {
  const {
    editorContent, setEditorContent, editorLanguage, setEditorLanguage,
    editorFilePath, setEditorFilePath, predictiveEnabled, setPredictiveEnabled,
    aggressiveness, setAggressiveness, signature, provider, addPatch
  } = useAppStore();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SuggestionResult | null>(null);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleSuggest = useCallback(async (intent: 'fix' | 'patch') => {
    setLoading(true);
    try {
      // Use local heuristic fallback
      const res = generateHeuristicSuggestion(editorContent, editorLanguage);
      setResult(res);
      toast.success(intent === 'fix' ? 'Suggestion ready' : 'Patch generated');
    } finally {
      setLoading(false);
    }
  }, [editorContent, editorLanguage]);

  const handleApply = useCallback(() => {
    if (!result) return;
    const { result: newContent, success, error } = applyUnifiedDiff(editorContent, result.patch);
    if (success) {
      setUndoStack(prev => [...prev, editorContent]);
      setRedoStack([]);
      setEditorContent(newContent);
      // Store patch
      const patch = {
        id: `patch-${Date.now()}`,
        filePath: editorFilePath,
        diff: result.patch,
        explanation: result.explanation,
        status: 'applied' as const,
        createdAt: new Date().toISOString(),
      };
      addPatch(patch);
      db.patches.put(patch);
      toast.success('Patch applied');
    } else {
      toast.error(`Failed to apply: ${error}`);
    }
  }, [result, editorContent, editorFilePath, setEditorContent, addPatch]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(rs => [...rs, editorContent]);
    setUndoStack(us => us.slice(0, -1));
    setEditorContent(prev);
    toast('Undo applied');
  }, [undoStack, editorContent, setEditorContent]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(us => [...us, editorContent]);
    setRedoStack(rs => rs.slice(0, -1));
    setEditorContent(next);
    toast('Redo applied');
  }, [redoStack, editorContent, setEditorContent]);

  const handleCopyPatch = useCallback(() => {
    if (!result) return;
    navigator.clipboard.writeText(result.patch);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success('Copied');
  }, [result]);

  const langOptions = [
    { value: 'python', label: 'Python' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'javascript', label: 'JavaScript' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Editor */}
        <div className="flex-1 min-w-0">
          <div className="sf-card overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 p-3 border-b border-border bg-surface/50">
              <input
                type="text"
                value={editorFilePath}
                onChange={e => setEditorFilePath(e.target.value)}
                className="text-xs font-mono px-2 py-1 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring/30 w-48"
                placeholder="File path..."
              />
              <select
                value={editorLanguage}
                onChange={e => setEditorLanguage(e.target.value)}
                className="text-xs px-2 py-1 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring/30"
              >
                {langOptions.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
              <div className="flex-1" />
              <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1" onClick={() => handleSuggest('fix')} disabled={loading}>
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                Suggest Fix
              </Button>
              <Button size="sm" className="rounded-xl text-xs gap-1 sf-primary-grad border-0" onClick={() => handleSuggest('patch')} disabled={loading}>
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileCode className="w-3 h-3" />}
                Generate Patch
              </Button>
            </div>

            {/* Monaco */}
            <div className="h-[500px]">
              <Suspense fallback={<div className="flex items-center justify-center h-full text-muted-foreground text-sm">Loading editor...</div>}>
                <MonacoEditor
                  height="100%"
                  language={editorLanguage}
                  value={editorContent}
                  onChange={v => setEditorContent(v ?? '')}
                  theme="vs"
                  options={{
                    fontSize: 13,
                    fontFamily: 'JetBrains Mono, monospace',
                    minimap: { enabled: false },
                    padding: { top: 12 },
                    scrollBeyondLastLine: false,
                    renderLineHighlight: 'line',
                    lineNumbers: 'on',
                    automaticLayout: true,
                  }}
                />
              </Suspense>
            </div>

            {/* Status bar */}
            <div className="flex items-center gap-4 px-3 py-1.5 border-t border-border bg-surface/50 text-xs text-muted-foreground">
              <span>Lang: {editorLanguage}</span>
              <span>Provider: {provider}</span>
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <span className="text-[10px]">Predictive</span>
                <Switch checked={predictiveEnabled} onCheckedChange={setPredictiveEnabled} className="scale-75" />
              </div>
              {predictiveEnabled && (
                <div className="flex items-center gap-2 w-32">
                  <span className="text-[10px]">Aggressiveness</span>
                  <Slider value={[aggressiveness]} onValueChange={v => setAggressiveness(v[0])} min={0} max={100} step={1} className="flex-1" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Side panel */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full lg:w-96 flex-shrink-0 space-y-3"
            >
              <div className="sf-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-foreground">{result.suggestion}</h3>
                  <Badge variant="outline" className="text-[10px]">Ready</Badge>
                </div>
                <DiffViewer diff={result.patch} explanation={result.explanation} />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="rounded-xl text-xs gap-1 sf-primary-grad border-0" onClick={handleApply}>
                    <Play className="w-3 h-3" /> Apply Patch
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1" onClick={handleCopyPatch}>
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1" onClick={handleUndo} disabled={undoStack.length === 0}>
                    <Undo2 className="w-3 h-3" /> Undo
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1" onClick={handleRedo} disabled={redoStack.length === 0}>
                    <Redo2 className="w-3 h-3" /> Redo
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

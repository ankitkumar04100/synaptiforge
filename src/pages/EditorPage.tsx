import { useAppStore } from '@/store/useAppStore';
import { DiffViewer } from '@/components/DiffViewer';
import { generateHeuristicSuggestion, applyUnifiedDiff } from '@/lib/engine';
import { suggestFix, predictStream } from '@/api/edge';
import { db } from '@/db/dexie';
import { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react';
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
  const [ghostText, setGhostText] = useState('');
  const [ghostConfidence, setGhostConfidence] = useState<number | null>(null);
  const ghostAbortRef = useRef<AbortController | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ghost text prediction
  useEffect(() => {
    if (!predictiveEnabled) {
      setGhostText('');
      setGhostConfidence(null);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && ghostText) {
        e.preventDefault();
        setEditorContent(editorContent + ghostText);
        setGhostText('');
        setGhostConfidence(null);
        toast.success('Ghost text accepted');
      }
      if (e.key === 'Escape' && ghostText) {
        setGhostText('');
        setGhostConfidence(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [predictiveEnabled, ghostText, editorContent, setEditorContent]);

  const triggerPrediction = useCallback(() => {
    if (!predictiveEnabled) return;
    ghostAbortRef.current?.abort();
    setGhostText('');
    setGhostConfidence(null);

    let accumulated = '';
    const temp = aggressiveness / 100;
    const ctrl = predictStream(
      {
        filePath: editorFilePath,
        context: editorContent.slice(-500),
        signatureJson: signature || undefined,
        temperature: temp,
        top_p: Math.max(0.1, 1 - temp * 0.5),
        language: editorLanguage,
      },
      (token) => {
        accumulated += token;
        setGhostText(accumulated);
      },
      (c) => setGhostConfidence(c),
      () => { /* done */ },
    );
    ghostAbortRef.current = ctrl;
  }, [predictiveEnabled, aggressiveness, editorContent, editorFilePath, editorLanguage, signature]);

  const handleEditorChange = useCallback((v: string | undefined) => {
    setEditorContent(v ?? '');
    setGhostText('');
    setGhostConfidence(null);

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (predictiveEnabled) {
      idleTimerRef.current = setTimeout(triggerPrediction, 650);
    }
  }, [setEditorContent, predictiveEnabled, triggerPrediction]);

  const handleSuggest = useCallback(async (intent: 'fix' | 'patch') => {
    setLoading(true);
    try {
      const intentText = intent === 'fix'
        ? 'Suggest minimal changes to improve this code'
        : 'Generate a complete patch with all improvements';

      const res = await suggestFix({
        filePath: editorFilePath,
        context: editorContent,
        signatureJson: signature || undefined,
        language: editorLanguage,
        intent: intentText,
      });
      setResult(res);
      toast.success(intent === 'fix' ? 'Suggestion ready' : 'Patch generated');
    } catch (err) {
      // Fallback to local heuristic
      const res = generateHeuristicSuggestion(editorContent, editorLanguage);
      setResult(res);
      toast.success('Suggestion ready (local heuristic)');
    } finally {
      setLoading(false);
    }
  }, [editorContent, editorLanguage, editorFilePath, signature]);

  const handleApply = useCallback(() => {
    if (!result) return;
    const { result: newContent, success, error } = applyUnifiedDiff(editorContent, result.patch);
    if (success) {
      setUndoStack(prev => [...prev, editorContent]);
      setRedoStack([]);
      setEditorContent(newContent);
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
            <div className="h-[500px] relative">
              <Suspense fallback={<div className="flex items-center justify-center h-full text-muted-foreground text-sm">Loading editor...</div>}>
                <MonacoEditor
                  height="100%"
                  language={editorLanguage}
                  value={editorContent}
                  onChange={handleEditorChange}
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

              {/* Ghost text overlay */}
              <AnimatePresence>
                {ghostText && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute bottom-4 right-4 max-w-sm sf-card p-3 sf-glow"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-medium text-primary">Ghost Prediction</span>
                      {ghostConfidence !== null && (
                        <Badge variant="outline" className="text-[9px]">{Math.round(ghostConfidence * 100)}%</Badge>
                      )}
                    </div>
                    <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap max-h-24 overflow-y-auto">{ghostText}</pre>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                      <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono">Tab</kbd> accept
                      <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono">Esc</kbd> dismiss
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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

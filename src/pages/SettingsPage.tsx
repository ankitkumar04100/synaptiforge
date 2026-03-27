import { useAppStore } from '@/store/useAppStore';
import { db } from '@/db/dexie';
import { clearAllData, exportData, importData } from '@/db/hydrate';
import { redactSecrets } from '@/lib/engine';
import { redactText } from '@/api/edge';
import { motion } from 'framer-motion';
import { Settings, Shield, Database, Info, Download, Upload, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { provider, setProvider } = useAppStore();
  const navigate = useNavigate();
  const [telemetry, setTelemetry] = useState(false);
  const [redactInput, setRedactInput] = useState('');
  const [redactOutput, setRedactOutput] = useState('');
  const [redactLoading, setRedactLoading] = useState(false);

  const handleExport = async () => {
    const data = await exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `synaptiforge-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        await importData(data);
        toast.success('Data imported');
      } catch {
        toast.error('Invalid JSON file');
      }
    };
    input.click();
  };

  const handleClearAll = async () => {
    if (!confirm('This will permanently delete all local data and log you out. Continue?')) return;
    await clearAllData();
    navigate('/auth');
    toast.success('All data cleared');
  };

  const handleRedact = async () => {
    if (!redactInput.trim()) return;
    setRedactLoading(true);
    try {
      const result = await redactText(redactInput);
      setRedactOutput(result.masked);
    } catch {
      // Fallback to local redaction
      setRedactOutput(redactSecrets(redactInput));
    } finally {
      setRedactLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Configuration and privacy controls</p>
      </div>

      {/* Provider */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="sf-card p-5">
        <h2 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" /> AI Provider
        </h2>
        <div className="flex gap-2">
          {(['openai', 'gemini'] as const).map(p => (
            <button
              key={p}
              onClick={() => { setProvider(p); db.settings.update('main', { provider: p }); toast.success(`Provider: ${p}`); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${provider === p ? 'sf-primary-grad' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
            >
              {p === 'openai' ? 'OpenAI' : 'Google Gemini'}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">API keys are stored server-side only. Never exposed to the client.</p>
      </motion.div>

      {/* Privacy */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="sf-card p-5">
        <h2 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-success" /> Privacy
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block flex items-center gap-1">
              <Eye className="w-3 h-3" /> Redaction Tester
            </label>
            <textarea
              value={redactInput}
              onChange={e => setRedactInput(e.target.value)}
              placeholder="Paste text with secrets like sk-abc123... or ghp_xyz..."
              className="w-full h-20 text-xs font-mono p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none"
            />
            <Button variant="outline" size="sm" className="rounded-xl text-xs mt-1" onClick={handleRedact} disabled={redactLoading}>
              {redactLoading ? 'Testing...' : 'Test Redaction'}
            </Button>
            {redactOutput && (
              <div className="mt-2 text-xs font-mono p-2 rounded-lg bg-surface border border-border text-muted-foreground">{redactOutput}</div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Telemetry</div>
              <div className="text-xs text-muted-foreground">Local counters only — no remote tracking</div>
            </div>
            <Switch checked={telemetry} onCheckedChange={setTelemetry} />
          </div>

          <p className="text-xs text-muted-foreground italic">Minimal context sent to models; secrets masked; telemetry off by default.</p>

          <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/5" onClick={handleClearAll}>
            <Trash2 className="w-3 h-3" /> Clear All Data
          </Button>
        </div>
      </motion.div>

      {/* Data */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="sf-card p-5">
        <h2 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" /> Data
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1" onClick={handleExport}>
            <Download className="w-3 h-3" /> Export JSON
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1" onClick={handleImport}>
            <Upload className="w-3 h-3" /> Import JSON
          </Button>
        </div>
      </motion.div>

      {/* About */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="sf-card p-5">
        <h2 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" /> About
        </h2>
        <div className="space-y-1 text-sm text-muted-foreground">
          <div><span className="font-medium text-foreground">Synaptiforge</span> — Your Cognitive Coding Twin</div>
          <div>Version 1.0.0</div>
          <div>An AI that learns your coding style, predicts your next lines, and generates style-aligned patches.</div>
        </div>
      </motion.div>
    </div>
  );
}

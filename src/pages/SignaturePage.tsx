import { useAppStore } from '@/store/useAppStore';
import { db } from '@/db/dexie';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Upload, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { CognitiveSignature } from '@/types';

export default function SignaturePage() {
  const { signature, setSignature } = useAppStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const buildProfile = async () => {
    if (!code.trim()) { toast.error('Paste some code first'); return; }
    setLoading(true);
    try {
      // Local analysis
      const traits = {
        naming: code.includes('snake_case') || code.includes('_') ? 'snake_case preferred' : 'camelCase preferred',
        errorHandling: code.includes('try') ? 'Uses try/catch blocks' : 'Minimal error handling',
        loopPatterns: code.includes('for') ? (code.includes('enumerate') ? 'enumerate() preferred' : 'Standard for loops') : 'Functional style (map/filter)',
        testStyle: code.includes('test') || code.includes('describe') ? 'Test-driven with assertions' : 'No tests detected',
        formatting: code.includes('  ') ? '2-space indent' : '4-space indent',
        frameworkBias: code.includes('React') || code.includes('import') ? 'React/TypeScript ecosystem' : code.includes('def ') ? 'Python ecosystem' : 'General purpose',
      };
      const newSig: CognitiveSignature = {
        id: signature?.id || 'sig-1',
        version: (signature?.version || 0) + 1,
        updatedAt: new Date().toISOString(),
        traits,
        summary: `Developer favors ${traits.naming} with ${traits.errorHandling.toLowerCase()}. ${traits.loopPatterns}. ${traits.frameworkBias}.`,
      };
      await db.signatures.put(newSig);
      setSignature(newSig);
      toast.success(`Signature v${newSig.version} built`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Cognitive Signature</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Build and refine your coding profile</p>
      </div>

      {/* Current signature */}
      {signature && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="sf-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-foreground">v{signature.version}</h2>
              <Badge variant="outline" className="text-[10px]">Updated {new Date(signature.updatedAt).toLocaleDateString()}</Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{signature.summary}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(signature.traits).map(([key, value]) => (
              <div key={key} className="bg-surface rounded-lg p-3">
                <div className="text-xs font-semibold text-primary capitalize mb-1">{key.replace(/([A-Z])/g, ' $1')}</div>
                <div className="text-xs text-muted-foreground">{value}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Build */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="sf-card p-6">
        <h2 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <Upload className="w-4 h-4 text-primary" /> Build Profile
        </h2>
        <p className="text-xs text-muted-foreground mb-3">Paste 2-3 representative code files below to analyze your style:</p>
        <textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          className="w-full h-48 text-xs font-mono p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring/30 resize-y"
          placeholder="Paste your code here..."
        />
        <div className="flex gap-2 mt-3">
          <Button className="rounded-xl text-xs gap-1 sf-primary-grad border-0" onClick={buildProfile} disabled={loading}>
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Brain className="w-3 h-3" />}
            Build Profile
          </Button>
          {signature && (
            <Button variant="outline" className="rounded-xl text-xs gap-1" onClick={buildProfile} disabled={loading}>
              <RefreshCw className="w-3 h-3" /> Rebuild (Merge)
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

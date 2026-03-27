import { useAppStore } from '@/store/useAppStore';
import { StatCard } from '@/components/StatCard';
import { DiffViewer } from '@/components/DiffViewer';
import { motion } from 'framer-motion';
import { Brain, Zap, Lightbulb, FileCode, Shield, ArrowRight, Check, X, ToggleLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function DashboardPage() {
  const { signature, reflexes, suggestions, patches, acceptSuggestion, dismissSuggestion, toggleReflex } = useAppStore();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('all');
  const [filter, setFilter] = useState('');

  const activeReflexes = reflexes.filter(r => r.enabled).length;
  const disabledReflexes = reflexes.length - activeReflexes;
  const pendingPatches = patches.filter(p => p.status === 'pending').length;

  const trendData = [3, 5, 4, 7, 6, 8, 9, 7, 10, 12, 11, 14, 13, 15, 16, 14];

  const filteredPatches = patches.filter(p => !filter || p.filePath.includes(filter) || p.explanation.includes(filter));
  const filteredSuggestions = suggestions.filter(s => !filter || s.filePath.includes(filter) || s.explanation.includes(filter));
  const filteredReflexes = reflexes.filter(r => !filter || r.triggerPattern.includes(filter) || r.transformation.includes(filter));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your cognitive coding overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={() => navigate('/signature')}>Build Profile</Button>
          <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={() => navigate('/editor')}>Open Editor</Button>
          <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={() => navigate('/settings')}>Settings</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Signature" value={`v${signature?.version ?? 0}`} hint={signature ? 'Active' : 'Not built'} icon={<Brain className="w-4 h-4" />} trend={trendData.slice(0, 10)} delay={0} />
        <StatCard title="Reflexes" value={activeReflexes} hint={disabledReflexes > 0 ? `${disabledReflexes} disabled` : 'All active'} icon={<Zap className="w-4 h-4" />} trend={trendData.slice(2, 12)} delay={0.05} />
        <StatCard title="Suggestions" value={suggestions.length} hint="Total generated" icon={<Lightbulb className="w-4 h-4" />} trend={trendData.slice(4, 14)} delay={0.1} />
        <StatCard title="Patches" value={pendingPatches} hint={`${patches.length} total`} icon={<FileCode className="w-4 h-4" />} trend={trendData.slice(6, 16)} delay={0.15} />
      </div>

      {/* Signature Summary + Privacy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 sf-card p-5">
          <h2 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" /> Cognitive Signature
          </h2>
          {signature ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">{signature.summary}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(signature.traits).map(([key, value]) => (
                  <div key={key} className="bg-surface rounded-lg p-2.5">
                    <div className="text-xs font-medium text-primary capitalize mb-1">{key.replace(/([A-Z])/g, ' $1')}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{value}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No signature built yet. <button onClick={() => navigate('/signature')} className="text-primary hover:underline">Build one →</button></p>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="sf-card p-5">
          <h2 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-success" /> Privacy
          </h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-success" /> Local-first data storage</div>
            <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-success" /> Secrets auto-redacted</div>
            <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-success" /> Telemetry off by default</div>
            <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-success" /> Minimal context to models</div>
          </div>
          <button onClick={() => navigate('/settings')} className="text-xs text-primary hover:underline mt-3 flex items-center gap-1">
            Privacy Settings <ArrowRight className="w-3 h-3" />
          </button>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {(['24h', '7d', '30d', 'all'] as const).map(t => (
          <button key={t} onClick={() => setTimeRange(t)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${timeRange === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
            {t}
          </button>
        ))}
        <input
          type="text"
          placeholder="Filter by path or text..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="ml-auto text-xs px-3 py-1.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring/30 w-48"
        />
      </div>

      {/* Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Patches */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="sf-card p-5">
          <h3 className="font-semibold text-foreground text-sm mb-3">Recent Patches</h3>
          <div className="space-y-2">
            {filteredPatches.length === 0 && <p className="text-xs text-muted-foreground">No patches yet</p>}
            {filteredPatches.map(p => (
              <div key={p.id} className="bg-surface rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-foreground truncate">{p.filePath}</span>
                  <Badge variant={p.status === 'applied' ? 'default' : p.status === 'pr_opened' ? 'secondary' : 'outline'} className="text-[10px]">
                    {p.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{p.explanation}</p>
                {p.prUrl && <a href={p.prUrl} target="_blank" rel="noopener" className="text-xs text-primary hover:underline">View PR →</a>}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Suggestions */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="sf-card p-5">
          <h3 className="font-semibold text-foreground text-sm mb-3">Recent Suggestions</h3>
          <div className="space-y-2">
            {filteredSuggestions.length === 0 && <p className="text-xs text-muted-foreground">No suggestions yet</p>}
            {filteredSuggestions.map(s => (
              <div key={s.id} className="bg-surface rounded-lg p-3 space-y-2">
                <p className="text-xs font-medium text-foreground">{s.suggestionText}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{s.explanation}</p>
                {s.accepted === null && (
                  <div className="flex gap-1">
                    <button onClick={() => acceptSuggestion(s.id)} className="text-[10px] px-2 py-0.5 rounded-md bg-success/10 text-success hover:bg-success/20 transition-colors">Accept</button>
                    <button onClick={() => dismissSuggestion(s.id)} className="text-[10px] px-2 py-0.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">Dismiss</button>
                  </div>
                )}
                {s.accepted === true && <Badge className="text-[10px] bg-success/10 text-success">Accepted</Badge>}
                {s.accepted === false && <Badge variant="outline" className="text-[10px]">Dismissed</Badge>}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Reflexes */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="sf-card p-5">
          <h3 className="font-semibold text-foreground text-sm mb-3">Reflexes</h3>
          <div className="space-y-2">
            {filteredReflexes.length === 0 && <p className="text-xs text-muted-foreground">No reflexes yet</p>}
            {filteredReflexes.map(r => (
              <div key={r.id} className="bg-surface rounded-lg p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <code className="text-xs font-mono text-foreground">{r.triggerPattern}</code>
                  <button onClick={() => toggleReflex(r.id)} className={`w-8 h-4.5 rounded-full transition-colors ${r.enabled ? 'bg-success' : 'bg-muted'} relative`}>
                    <div className={`w-3.5 h-3.5 rounded-full bg-background absolute top-0.5 transition-transform ${r.enabled ? 'left-4' : 'left-0.5'}`} />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">{r.transformation}</p>
                <Badge variant="outline" className="text-[10px]">{Math.round(r.confidence * 100)}% confidence</Badge>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

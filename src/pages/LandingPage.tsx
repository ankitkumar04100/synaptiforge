import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Code2, Zap, Shield, FileCode, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/synaptiforge-logo.png';

const features = [
  { icon: Brain, title: 'Cognitive Signature', desc: 'Learns your naming, error handling, and coding patterns to become your twin.' },
  { icon: Zap, title: 'Smart Reflexes', desc: 'Turns repeated fixes into reusable auto-suggestions with growing confidence.' },
  { icon: Code2, title: 'Predictive Ghost Text', desc: 'Streams style-aligned completions as you type. Tab to accept, Esc to dismiss.' },
  { icon: FileCode, title: 'Unified Diff Patches', desc: 'Generates clean patches with explanations. Apply locally or open a GitHub PR.' },
  { icon: Shield, title: 'Privacy First', desc: 'Local-first storage, auto-redacted secrets, telemetry off by default.' },
  { icon: Sparkles, title: 'AI-Powered', desc: 'OpenAI & Gemini adapters with intelligent heuristic fallback when offline.' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-surface to-background" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <img src={logo} alt="Synaptiforge" width={80} height={80} className="mx-auto mb-6" />
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground leading-tight">
              Your Cognitive<br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Coding Twin</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Synaptiforge learns your coding style, predicts your next lines, and generates style-aligned patches — all privacy-first.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button
                size="lg"
                className="rounded-xl sf-primary-grad border-0 gap-2 text-sm font-semibold px-6 hover:opacity-90"
                onClick={() => navigate('/auth')}
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl text-sm font-semibold px-6"
                onClick={() => navigate('/auth')}
              >
                Try as Guest
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="sf-card-hover p-5"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <f.icon className="w-4.5 h-4.5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center">
        <p className="text-xs text-muted-foreground">
          Synaptiforge — Privacy-first AI coding assistant. Minimal context sent to models; secrets masked; telemetry off.
        </p>
      </footer>
    </div>
  );
}

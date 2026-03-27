import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { motion } from 'framer-motion';
import { Github, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/synaptiforge-logo.png';

export default function AuthPage() {
  const navigate = useNavigate();
  const { setAuthenticated, setUser } = useAppStore();

  const handleGuest = () => {
    localStorage.setItem('sf_guest', 'true');
    setAuthenticated(true);
    setUser({ id: 'guest', name: 'Guest', avatar: '', provider: 'guest' });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="sf-card sf-elevated p-8 sm:p-10 max-w-md w-full text-center"
      >
        <img src={logo} alt="Synaptiforge" width={64} height={64} className="mx-auto mb-6 rounded-2xl" />
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">Welcome to Synaptiforge</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Your Cognitive Coding Twin — learns your style, predicts your next lines, and generates style-aligned patches.
        </p>
        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            className="h-12 gap-2 text-sm font-medium rounded-xl border-border hover:bg-surface"
            onClick={handleGuest}
          >
            <Github className="w-4 h-4" />
            Sign in with GitHub
          </Button>
          <Button
            className="h-12 gap-2 text-sm font-medium rounded-xl sf-primary-grad border-0 hover:opacity-90"
            onClick={handleGuest}
          >
            <User className="w-4 h-4" />
            Continue as Guest
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-6">
          Privacy-first: your data stays local. Minimal context sent to models.
        </p>
      </motion.div>
    </div>
  );
}

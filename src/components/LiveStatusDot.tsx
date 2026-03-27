import { motion } from 'framer-motion';

interface LiveStatusDotProps {
  connected: boolean;
  lastUpdated?: string;
}

export function LiveStatusDot({ connected, lastUpdated }: LiveStatusDotProps) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div className="relative flex items-center justify-center w-2.5 h-2.5">
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-success' : 'bg-muted-foreground/40'}`} />
        {connected && (
          <motion.div
            className="absolute inset-0 rounded-full bg-success/40"
            animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>
      <span>{connected ? 'Live' : 'Offline'}</span>
      {lastUpdated && <span className="text-muted-foreground/60">· {lastUpdated}</span>}
    </div>
  );
}

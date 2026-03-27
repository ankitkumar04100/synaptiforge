import { motion } from 'framer-motion';

interface DiffViewerProps {
  diff: string;
  explanation?: string;
}

export function DiffViewer({ diff, explanation }: DiffViewerProps) {
  const lines = diff.split('\n');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-lg border border-border overflow-hidden"
    >
      <div className="bg-surface px-4 py-2 text-xs font-mono text-muted-foreground border-b border-border">
        Unified Diff
      </div>
      <div className="overflow-x-auto">
        <pre className="text-xs font-mono leading-relaxed p-3">
          {lines.map((line, i) => {
            let className = 'text-foreground/70';
            if (line.startsWith('+') && !line.startsWith('+++')) className = 'text-success bg-success/5';
            else if (line.startsWith('-') && !line.startsWith('---')) className = 'text-destructive bg-destructive/5';
            else if (line.startsWith('@@')) className = 'text-primary/70 font-medium';
            else if (line.startsWith('---') || line.startsWith('+++')) className = 'text-muted-foreground font-medium';

            return (
              <div key={i} className={`px-2 -mx-2 ${className}`}>
                {line}
              </div>
            );
          })}
        </pre>
      </div>
      {explanation && (
        <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground bg-surface/50">
          <span className="font-medium text-foreground">Explanation:</span> {explanation}
        </div>
      )}
    </motion.div>
  );
}

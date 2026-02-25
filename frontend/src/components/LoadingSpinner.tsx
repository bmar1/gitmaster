export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-24 animate-gentle-fade relative">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 rounded-full bg-accent/5 blur-[80px] animate-pulse-glow" />
      </div>

      <div className="relative w-16 h-16 mb-10">
        <div className="absolute inset-0 border-2 border-border/50 rounded-full"></div>
        <div className="absolute inset-0 border-2 border-transparent border-t-accent rounded-full animate-spin"></div>
        <div className="absolute inset-2 border border-transparent border-t-ochre/40 rounded-full animate-spin"
             style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>

      <h3 className="font-display text-2xl text-primary mb-3">Analyzing repository&hellip;</h3>
      <p className="text-muted text-sm font-body max-w-sm text-center leading-relaxed">
        Fetching metadata, scanning files, parsing dependencies, and detecting frameworks.
      </p>

      <div className="flex gap-3 mt-10">
        {['Metadata', 'File tree', 'Dependencies', 'Architecture', 'Insights'].map((step, i) => (
          <span
            key={step}
            className="pill text-xs animate-rise"
            style={{ animationDelay: `${i * 0.12}s`, animationFillMode: 'both' }}
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}

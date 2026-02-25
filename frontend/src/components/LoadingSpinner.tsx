export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-24 animate-gentle-fade">
      <div className="relative w-12 h-12 mb-8">
        <div className="absolute inset-0 border-2 border-border rounded-full"></div>
        <div className="absolute inset-0 border-2 border-transparent border-t-accent rounded-full animate-spin"></div>
      </div>

      <h3 className="font-display text-xl text-primary mb-2">Analyzing repository&hellip;</h3>
      <p className="text-muted text-sm font-body max-w-sm text-center leading-relaxed">
        Fetching metadata, scanning files, parsing dependencies, and detecting frameworks.
      </p>

      <div className="flex gap-3 mt-8">
        {['Metadata', 'File tree', 'Dependencies', 'Insights'].map((step, i) => (
          <span
            key={step}
            className="pill text-xs animate-rise"
            style={{ animationDelay: `${i * 0.15}s`, animationFillMode: 'both' }}
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}

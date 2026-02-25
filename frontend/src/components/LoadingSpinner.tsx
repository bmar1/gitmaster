export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-24 animate-gentle-fade">
      <div className="relative w-12 h-12 mb-8">
        <div className="absolute inset-0 border-2 border-linen rounded-full"></div>
        <div className="absolute inset-0 border-2 border-transparent border-t-sienna rounded-full animate-spin"></div>
      </div>

      <h3 className="font-display text-xl text-walnut mb-2">Analyzing repository&hellip;</h3>
      <p className="text-faded text-sm font-body max-w-sm text-center leading-relaxed">
        Fetching metadata, scanning files, parsing dependencies, and detecting frameworks.
      </p>

      <div className="flex gap-3 mt-8">
        {['Metadata', 'File tree', 'Dependencies', 'Insights'].map((step, i) => (
          <span
            key={step}
            className="stat-pill text-xs text-faded animate-rise"
            style={{ animationDelay: `${i * 0.15}s`, animationFillMode: 'both' }}
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}

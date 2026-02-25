import { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';

interface RepoInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

export function RepoInput({ onAnalyze, isLoading }: RepoInputProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) onAnalyze(url.trim());
  };

  return (
    <div className="max-w-3xl mx-auto text-center">
      <div className="animate-rise mb-4">
        <span className="accent-tag mb-6 inline-block">Open Source</span>
      </div>

      <h1 className="font-display text-5xl md:text-7xl font-bold text-walnut mb-6 animate-rise-delay-1 leading-[1.1] tracking-tight">
        Repository<br />
        <span className="italic text-sienna">Analysis</span>
      </h1>

      <p className="font-body text-lg text-bark/70 mb-12 max-w-lg mx-auto animate-rise-delay-2 leading-relaxed">
        Paste a GitHub link. We'll map every file, trace every dependency, and surface the architecture beneath the code.
      </p>

      <form onSubmit={handleSubmit} className="animate-rise-delay-3">
        <div className="paper-card p-2 flex items-center gap-2 max-w-2xl mx-auto transition-shadow duration-300 hover:shadow-card-hover">
          <div className="flex items-center gap-3 flex-1 pl-4">
            <Search className="w-5 h-5 text-faded flex-shrink-0" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/owner/repository"
              disabled={isLoading}
              className="w-full py-3 bg-transparent font-code text-sm text-walnut placeholder-faded/50
                       focus:outline-none disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="px-6 py-3 bg-walnut text-cream rounded-md font-display font-medium text-sm
                     hover:bg-espresso disabled:opacity-40 disabled:cursor-not-allowed
                     transition-all duration-300 flex items-center gap-2 flex-shrink-0"
          >
            {isLoading ? 'Analyzing\u2026' : 'Analyze'}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-faded font-code animate-rise-delay-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sage"></span>
            Public repos
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-ochre"></span>
            Multi-language
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sienna"></span>
            Deep analysis
          </span>
        </div>
      </form>
    </div>
  );
}

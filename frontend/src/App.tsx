import { useState } from 'react';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { RepoInput } from './components/RepoInput';
import { AnalysisView } from './components/AnalysisView';
import { LoadingSpinner } from './components/LoadingSpinner';
import { analyzeRepository } from './services/api';
import { AnalysisResult } from './types';
import { BookOpen, AlertTriangle, RotateCcw } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

function AppContent() {
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const mutation = useMutation({
    mutationFn: analyzeRepository,
    onSuccess: (data) => setResult(data),
  });

  const handleAnalyze = (url: string) => {
    setResult(null);
    mutation.mutate(url);
  };

  const handleReset = () => {
    setResult(null);
    mutation.reset();
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border/60">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={handleReset} className="flex items-center gap-2.5 group">
            <BookOpen className="w-5 h-5 text-accent" />
            <span className="font-display font-bold text-primary text-lg tracking-tight">
              Git<span className="text-accent">Master</span>
            </span>
          </button>

          {result && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-code text-muted
                       hover:text-primary border border-transparent hover:border-border rounded-md transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              New analysis
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6">
        {!result && !mutation.isPending && !mutation.isError && (
          <div className="py-24 md:py-32">
            <RepoInput onAnalyze={handleAnalyze} isLoading={mutation.isPending} />
          </div>
        )}

        {mutation.isPending && (
          <div className="py-16">
            <LoadingSpinner />
          </div>
        )}

        {mutation.isError && (
          <div className="py-24 max-w-lg mx-auto text-center animate-rise">
            <div className="card p-8">
              <AlertTriangle className="w-8 h-8 text-accent mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold text-primary mb-2">Analysis failed</h3>
              <p className="font-body text-secondary mb-6 leading-relaxed">
                {mutation.error instanceof Error ? mutation.error.message : 'An unexpected error occurred.'}
              </p>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-accent text-surface rounded-md font-display font-medium text-sm
                         hover:bg-accent-dim transition-all duration-300"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="py-12">
            <AnalysisView result={result} />
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-auto">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <p className="font-code text-xs text-muted">
            GitMaster v2.0 &middot; Powered by GitHub API
          </p>
          <p className="font-code text-xs text-muted">
            60 req/hr unauthenticated
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

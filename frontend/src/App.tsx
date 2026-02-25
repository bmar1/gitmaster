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
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-cream/80 backdrop-blur-md border-b border-linen/60">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={handleReset} className="flex items-center gap-2.5 group">
            <BookOpen className="w-5 h-5 text-sienna" />
            <span className="font-display font-bold text-walnut text-lg tracking-tight">
              Git<span className="text-sienna">Master</span>
            </span>
          </button>

          {result && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-code text-faded
                       hover:text-walnut border border-transparent hover:border-linen rounded-md transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              New analysis
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6">
        {/* Landing */}
        {!result && !mutation.isPending && !mutation.isError && (
          <div className="py-24 md:py-32">
            <RepoInput onAnalyze={handleAnalyze} isLoading={mutation.isPending} />
          </div>
        )}

        {/* Loading */}
        {mutation.isPending && (
          <div className="py-16">
            <LoadingSpinner />
          </div>
        )}

        {/* Error */}
        {mutation.isError && (
          <div className="py-24 max-w-lg mx-auto text-center animate-rise">
            <div className="paper-card p-8">
              <AlertTriangle className="w-8 h-8 text-sienna mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold text-walnut mb-2">Analysis failed</h3>
              <p className="font-body text-bark/70 mb-6 leading-relaxed">
                {mutation.error instanceof Error ? mutation.error.message : 'An unexpected error occurred.'}
              </p>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-walnut text-cream rounded-md font-display font-medium text-sm
                         hover:bg-espresso transition-all duration-300"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="py-12">
            <AnalysisView result={result} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-linen mt-auto">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <p className="font-code text-xs text-faded">
            GitMaster v2.0 &middot; Powered by GitHub API
          </p>
          <p className="font-code text-xs text-faded">
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

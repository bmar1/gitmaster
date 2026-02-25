/**
 * App — Root component.
 *
 * Manages three top-level states: landing (input), loading, and results.
 * Uses TanStack Query for the analysis mutation and fetches rate-limit
 * info from the backend to display in the footer.
 */

import { useState, useEffect } from 'react';
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
  const [rateInfo, setRateInfo] = useState<{ authenticated: boolean; remaining: number; limit: number } | null>(null);

  useEffect(() => {
    fetch('/api/analyze/status')
      .then(r => r.json())
      .then(d => {
        if (d.success) setRateInfo({
          authenticated: d.data.authenticated,
          remaining: d.data.rateLimit.remaining,
          limit: d.data.rateLimit.limit,
        });
      })
      .catch(() => {});
  }, [result]);

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

  const isLanding = !result && !mutation.isPending && !mutation.isError;

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Ambient background for working page */}
      {result && (
        <>
          <div className="bg-orb w-[600px] h-[600px] -top-60 -right-60 animate-drift"
               style={{ background: 'radial-gradient(circle, rgba(224, 112, 80, 0.06) 0%, transparent 70%)' }} />
          <div className="bg-orb w-[500px] h-[500px] top-[40vh] -left-60 animate-drift-reverse"
               style={{ background: 'radial-gradient(circle, rgba(46, 107, 69, 0.05) 0%, transparent 70%)' }} />
          <div className="bg-orb w-[300px] h-[300px] bottom-20 right-10 animate-float-slower"
               style={{ background: 'radial-gradient(circle, rgba(212, 160, 32, 0.04) 0%, transparent 70%)' }} />
          <div className="noise-overlay" />
        </>
      )}

      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={handleReset} className="flex items-center gap-2.5 group">
            <BookOpen className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
            <span className="font-display font-bold text-primary text-lg tracking-tight">
              Git<span className="text-accent">Master</span>
            </span>
          </button>

          <div className="flex items-center gap-4">
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
        </div>
      </header>

      <main className={`flex-1 relative z-10 ${isLanding ? '' : 'max-w-6xl mx-auto w-full px-6'}`}>
        {isLanding && (
          <RepoInput onAnalyze={handleAnalyze} isLoading={mutation.isPending} />
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
          <div className="py-12 pb-24">
            <AnalysisView result={result} />
          </div>
        )}
      </main>

      <footer className="relative z-10 border-t border-border/40 mt-auto bg-surface/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <p className="font-code text-xs text-muted">
            GitMaster v2.0 &middot; Powered by GitHub API
          </p>
          <p className="font-code text-xs text-muted">
            {rateInfo
              ? `${rateInfo.remaining}/${rateInfo.limit} requests ${rateInfo.authenticated ? '(token)' : '(unauthenticated)'}`
              : '60 req/hr unauthenticated'
            }
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

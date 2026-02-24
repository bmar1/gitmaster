import { useState } from 'react';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { RepoInput } from './components/RepoInput';
import { AnalysisView } from './components/AnalysisView';
import { LoadingSpinner } from './components/LoadingSpinner';
import { analyzeRepository } from './services/api';
import { AnalysisResult } from './types';
import { Terminal, AlertCircle } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppContent() {
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const mutation = useMutation({
    mutationFn: analyzeRepository,
    onSuccess: (data) => {
      setResult(data);
    },
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
    <div className="min-h-screen relative">
      <div className="matrix-bg"></div>
      <div className="scan-line"></div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 text-primary hover:text-secondary transition-colors duration-300"
          >
            <Terminal className="w-6 h-6" />
            <span className="text-sm tracking-wider font-bold">GITMASTER</span>
          </button>

          {result && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm border border-primary/30 rounded-lg
                       hover:border-primary hover:bg-primary/10 transition-all duration-300
                       tracking-wider"
            >
              ← NEW ANALYSIS
            </button>
          )}
        </div>

        {!result && !mutation.isPending && (
          <RepoInput onAnalyze={handleAnalyze} isLoading={mutation.isPending} />
        )}

        {mutation.isPending && <LoadingSpinner />}

        {mutation.isError && (
          <div className="max-w-2xl mx-auto glass-morphism p-6 rounded-xl border border-accent/50 animate-slide-up">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-accent font-bold mb-2 tracking-wider">ERROR</h3>
                <p className="text-gray-300">
                  {mutation.error instanceof Error ? mutation.error.message : 'An unexpected error occurred'}
                </p>
                <button
                  onClick={handleReset}
                  className="mt-4 px-4 py-2 text-sm bg-accent/20 border border-accent/50 rounded
                           hover:bg-accent/30 transition-all duration-300 tracking-wider"
                >
                  TRY AGAIN
                </button>
              </div>
            </div>
          </div>
        )}

        {result && <AnalysisView result={result} />}
      </div>

      <footer className="relative z-10 text-center py-8 text-xs text-gray-700 tracking-wider">
        <p>GITMASTER v1.0.0 · POWERED BY GITHUB API</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;

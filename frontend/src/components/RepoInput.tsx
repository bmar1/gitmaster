/**
 * RepoInput — Landing page with hero section, capabilities grid,
 * "how it works" steps, and bottom CTA. Contains the main URL input form.
 */

import { useState } from 'react';
import {
  Search, ArrowRight, FolderTree, Package, Network,
  Lightbulb, Code2, GitBranch, Layers, Zap
} from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface RepoInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

function FeatureCard({ icon: Icon, title, description, delay, accent }: {
  icon: typeof FolderTree;
  title: string;
  description: string;
  delay: string;
  accent: string;
}) {
  const ref = useScrollReveal();

  return (
    <div ref={ref} className="reveal-on-scroll" style={{ transitionDelay: delay }}>
      <div className="card-glow p-8 h-full relative overflow-hidden group">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
             style={{
               background: `radial-gradient(circle at 50% 0%, ${accent} 0%, transparent 70%)`,
             }}
        />
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center mb-5
                        group-hover:shadow-glow-accent transition-shadow duration-500">
            <Icon className="w-6 h-6 text-accent" />
          </div>
          <h3 className="font-display text-xl font-semibold text-primary mb-3">{title}</h3>
          <p className="font-body text-secondary text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

function StepItem({ number, title, description, delay }: {
  number: string;
  title: string;
  description: string;
  delay: string;
}) {
  const ref = useScrollReveal();

  return (
    <div ref={ref} className="reveal-on-scroll flex gap-6" style={{ transitionDelay: delay }}>
      <div className="flex-shrink-0 w-14 h-14 rounded-full border border-accent/30 flex items-center justify-center
                    font-display text-2xl font-bold text-accent bg-accent/5">
        {number}
      </div>
      <div className="pt-2">
        <h4 className="font-display text-lg font-semibold text-primary mb-1">{title}</h4>
        <p className="font-body text-secondary text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export function RepoInput({ onAnalyze, isLoading }: RepoInputProps) {
  const [url, setUrl] = useState('');
  const featuresRef = useScrollReveal();
  const statsRef = useScrollReveal();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) onAnalyze(url.trim());
  };

  return (
    <div className="relative">
      {/* Background orbs */}
      <div className="bg-orb w-[500px] h-[500px] -top-40 -left-40 animate-drift"
           style={{ background: 'radial-gradient(circle, rgba(224, 112, 80, 0.08) 0%, transparent 70%)' }} />
      <div className="bg-orb w-[400px] h-[400px] -top-20 -right-32 animate-drift-reverse"
           style={{ background: 'radial-gradient(circle, rgba(46, 107, 69, 0.06) 0%, transparent 70%)' }} />
      <div className="bg-orb w-[300px] h-[300px] top-[50vh] left-1/2 -translate-x-1/2 animate-float-slower"
           style={{ background: 'radial-gradient(circle, rgba(212, 160, 32, 0.04) 0%, transparent 70%)' }} />

      <div className="noise-overlay" />
      <div className="grid-pattern" />

      {/* Hero Section */}
      <section className="relative z-10 min-h-[85vh] flex flex-col items-center justify-center text-center px-6">
        <div className="animate-blur-in mb-5">
          <span className="tag">
            <Zap className="w-3 h-3" /> Open Source Repository Analysis
          </span>
        </div>

        <h1 className="font-display text-6xl md:text-8xl lg:text-[7rem] font-bold text-primary mb-8 animate-rise leading-[0.95] tracking-tight max-w-5xl">
          Understand any<br />
          <span className="text-gradient italic">codebase</span>
          <span className="text-accent">.</span>
        </h1>

        <p className="font-body text-xl md:text-2xl text-secondary mb-16 max-w-2xl mx-auto animate-rise-delay-1 leading-relaxed">
          Paste a GitHub link. We map every file, trace every dependency,
          and surface the architecture beneath the code.
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto animate-rise-delay-2">
          <div className="card-glow p-2 flex items-center gap-2 transition-all duration-500 hover:shadow-glow-accent">
            <div className="flex items-center gap-3 flex-1 pl-4">
              <Search className="w-5 h-5 text-muted flex-shrink-0" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/owner/repository"
                disabled={isLoading}
                className="w-full py-3.5 bg-transparent font-code text-sm text-primary placeholder-muted/50
                         focus:outline-none disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="px-8 py-3.5 bg-accent text-surface rounded-md font-display font-medium text-sm
                       hover:bg-accent-dim disabled:opacity-40 disabled:cursor-not-allowed
                       transition-all duration-300 flex items-center gap-2 flex-shrink-0
                       shadow-lg shadow-accent/20 hover:shadow-accent/30"
            >
              {isLoading ? 'Analyzing\u2026' : 'Analyze'}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-8 text-xs text-muted font-code animate-rise-delay-3">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse-glow"></span>
              Public repos
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-ochre animate-pulse-glow" style={{ animationDelay: '0.5s' }}></span>
              Multi-language
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-glow" style={{ animationDelay: '1s' }}></span>
              Deep analysis
            </span>
          </div>
        </form>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 rounded-full border-2 border-border flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 rounded-full bg-muted animate-rise" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-32 px-6 max-w-6xl mx-auto">
        <div ref={featuresRef} className="reveal-on-scroll text-center mb-20">
          <span className="tag mb-4 inline-block">Capabilities</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-6 tracking-tight">
            Every layer,<br /><span className="text-gradient italic">dissected</span>.
          </h2>
          <p className="font-body text-lg text-secondary max-w-xl mx-auto">
            From the root directory to the deepest import chain, nothing stays hidden.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={FolderTree}
            title="File Tree Mapping"
            description="Full recursive file structure with size analysis, extension breakdown, and directory hierarchy visualization."
            delay="0s"
            accent="rgba(224, 112, 80, 0.06)"
          />
          <FeatureCard
            icon={Package}
            title="Dependency Scanning"
            description="Multi-language manifest detection. npm, Maven, pip, Cargo, Go modules, Gemfile, Composer, NuGet — all in one pass."
            delay="0.1s"
            accent="rgba(212, 160, 32, 0.06)"
          />
          <FeatureCard
            icon={Network}
            title="Architecture Graph"
            description="Interactive system map with entry points, hotspot detection, module relationships, and external dependency mapping."
            delay="0.2s"
            accent="rgba(125, 170, 132, 0.06)"
          />
          <FeatureCard
            icon={Code2}
            title="Language Breakdown"
            description="Statistical analysis of language composition by file count and byte size with visual percentage breakdowns."
            delay="0.3s"
            accent="rgba(224, 112, 80, 0.06)"
          />
          <FeatureCard
            icon={Lightbulb}
            title="Framework Detection"
            description="Automatic identification of 50+ frameworks, build tools, testing libraries, databases, and DevOps tools."
            delay="0.4s"
            accent="rgba(212, 160, 32, 0.06)"
          />
          <FeatureCard
            icon={Layers}
            title="Project Insights"
            description="Classifies project type, structure, CI/CD presence, Docker support, documentation coverage, and license compliance."
            delay="0.5s"
            accent="rgba(125, 170, 132, 0.06)"
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <div ref={statsRef} className="reveal-on-scroll text-center mb-20">
            <span className="tag mb-4 inline-block">How it works</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-6 tracking-tight">
              Three steps.<br /><span className="text-gradient italic">Zero config</span>.
            </h2>
          </div>

          <div className="space-y-12">
            <StepItem
              number="1"
              title="Paste a GitHub URL"
              description="Any public repository. We handle monorepos, multi-language stacks, and projects of any size."
              delay="0s"
            />
            <StepItem
              number="2"
              title="We scan everything"
              description="Repository metadata, full file tree, dependency manifests, framework signatures, and project structure — fetched and analyzed in seconds."
              delay="0.15s"
            />
            <StepItem
              number="3"
              title="Explore the results"
              description="Interactive architecture graph, language composition charts, dependency breakdowns, and a comprehensive project summary — all on one page."
              delay="0.3s"
            />
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-ochre/5 to-sage/5 rounded-2xl blur-xl" />
            <div className="relative card p-12 rounded-2xl">
              <GitBranch className="w-10 h-10 text-accent mx-auto mb-6" />
              <h3 className="font-display text-3xl font-bold text-primary mb-4">Ready to dive in?</h3>
              <p className="font-body text-secondary mb-8">
                Scroll up and paste a repository URL to get started. It takes seconds.
              </p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-8 py-3 bg-accent text-surface rounded-md font-display font-medium text-sm
                         hover:bg-accent-dim transition-all duration-300 shadow-lg shadow-accent/20"
              >
                Back to top <ArrowRight className="w-4 h-4 inline ml-2 -rotate-90" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

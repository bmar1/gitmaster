/**
 * AnalysisView — Main results display after a repo is analyzed.
 *
 * Renders the repository header (name, description, stats) and a tabbed
 * interface with five views: Overview, Architecture, Insights, Files, and Dependencies.
 */

import { useState } from 'react';
import { AnalysisResult } from '../types';
import { FileTreeView } from './FileTreeView';
import { DependencyView } from './DependencyView';
import { LanguageBreakdown } from './LanguageBreakdown';
import { ProjectInsights } from './ProjectInsights';
import { ArchitectureGraphView } from './ArchitectureGraph';
import {
  Star, GitFork, Scale, Calendar, ExternalLink, Globe,
  FolderTree, Package, Code2, Lightbulb, BookOpen, Tag, Network
} from 'lucide-react';

type TabType = 'overview' | 'architecture' | 'files' | 'dependencies' | 'insights';

function StatCard({ label, value, sub, delay }: { label: string; value: string; sub: string; delay: string }) {
  return (
    <div className="card-glow p-5 relative overflow-hidden group" style={{ animationDelay: delay }}>
      <div className="absolute top-0 left-0 right-0 h-px shimmer" />
      <p className="text-xs font-code text-muted uppercase tracking-wider mb-1">{label}</p>
      <p className="font-display text-3xl font-bold text-primary group-hover:text-accent transition-colors duration-300">{value}</p>
      <p className="text-xs text-muted font-body mt-1">{sub}</p>
    </div>
  );
}

export function AnalysisView({ result }: { result: AnalysisResult }) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs: { id: TabType; label: string; icon: typeof Star }[] = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'architecture', label: 'Architecture', icon: Network },
    { id: 'insights', label: 'Insights', icon: Lightbulb },
    { id: 'files', label: 'Files', icon: FolderTree },
    { id: 'dependencies', label: 'Dependencies', icon: Package },
  ];

  const repo = result.repository;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10 animate-rise relative">
        <div className="absolute -top-16 -left-32 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-muted font-code text-sm">{repo.owner}</span>
                <span className="text-border">/</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-primary tracking-tight">
                {repo.name}
              </h2>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 mt-2">
              {repo.homepage && (
                <a
                  href={repo.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-code text-accent border border-accent/30 rounded-lg
                           hover:bg-accent/10 hover:border-accent/50 hover:shadow-glow-accent transition-all duration-300"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Live
                </a>
              )}
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm font-code text-secondary border border-border rounded-lg
                         hover:border-border-hi hover:text-primary hover:shadow-card transition-all duration-300"
              >
                GitHub <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {repo.description && (
            <p className="font-body text-lg text-secondary leading-relaxed max-w-3xl mb-6 animate-rise-delay-1">
              {repo.description}
            </p>
          )}

          {repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6 animate-rise-delay-1">
              {repo.topics.slice(0, 8).map(topic => (
                <span key={topic} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-code
                                            bg-sage/10 text-sage border border-sage/20 hover:bg-sage/15 transition-colors">
                  <Tag className="w-3 h-3" /> {topic}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-3 animate-rise-delay-2">
            <span className="pill"><Star className="w-3.5 h-3.5 text-ochre" /> {repo.stars.toLocaleString()}</span>
            <span className="pill"><GitFork className="w-3.5 h-3.5 text-sage" /> {repo.forks.toLocaleString()}</span>
            {repo.language && <span className="pill"><Code2 className="w-3.5 h-3.5 text-accent" /> {repo.language}</span>}
            {repo.license && <span className="pill"><Scale className="w-3.5 h-3.5 text-mist" /> {repo.license}</span>}
            <span className="pill">
              <Calendar className="w-3.5 h-3.5 text-muted" />
              {new Date(repo.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 animate-rise-delay-2">
        <StatCard
          label="Files"
          value={result.fileStats.totalFiles.toLocaleString()}
          sub={`${result.fileStats.totalDirectories} directories`}
          delay="0s"
        />
        <StatCard
          label="Languages"
          value={result.languages.length.toString()}
          sub={result.languages[0]?.name || 'N/A'}
          delay="0.05s"
        />
        <StatCard
          label="Dependencies"
          value={result.dependencies.totalCount.toString()}
          sub={`${result.dependencies.manifests.length} manifest${result.dependencies.manifests.length !== 1 ? 's' : ''}`}
          delay="0.1s"
        />
        <StatCard
          label="Frameworks"
          value={result.insights.frameworks.length.toString()}
          sub={result.insights.projectType}
          delay="0.15s"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-border/60 mb-8 animate-rise-delay-3 relative">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        <nav className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-body font-medium border-b-2 transition-all duration-300 whitespace-nowrap relative
                  ${isActive
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted hover:text-primary hover:border-border'
                  }`}
              >
                {isActive && (
                  <div className="absolute inset-x-0 -bottom-px h-px bg-accent shadow-[0_0_8px_rgba(224,112,80,0.5)]" />
                )}
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="pb-8">
        {activeTab === 'overview' && (
          <div className="space-y-10 animate-rise">
            <div className="card-glow p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px shimmer" />
              <h3 className="font-display text-xl font-semibold text-primary mb-4">Summary</h3>
              <p className="font-body text-secondary leading-relaxed text-[15px]">{result.summary}</p>
            </div>

            {result.languages.length > 0 && (
              <div>
                <h3 className="font-display text-xl font-semibold text-primary mb-6">Language Composition</h3>
                <LanguageBreakdown languages={result.languages} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'architecture' && <ArchitectureGraphView architecture={result.architecture} />}
        {activeTab === 'insights' && <ProjectInsights insights={result.insights} />}
        {activeTab === 'files' && <FileTreeView nodes={result.fileTree} />}
        {activeTab === 'dependencies' && <DependencyView dependencies={result.dependencies} />}
      </div>
    </div>
  );
}

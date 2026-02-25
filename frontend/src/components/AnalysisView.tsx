import { useState } from 'react';
import { AnalysisResult } from '../types';
import { FileTreeView } from './FileTreeView';
import { DependencyView } from './DependencyView';
import { LanguageBreakdown } from './LanguageBreakdown';
import { ProjectInsights } from './ProjectInsights';
import {
  Star, GitFork, Scale, Calendar, ExternalLink,
  FolderTree, Package, Code2, Lightbulb, BookOpen, Tag
} from 'lucide-react';

type TabType = 'overview' | 'files' | 'dependencies' | 'insights';

export function AnalysisView({ result }: { result: AnalysisResult }) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs: { id: TabType; label: string; icon: typeof Star }[] = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'insights', label: 'Insights', icon: Lightbulb },
    { id: 'files', label: 'Files', icon: FolderTree },
    { id: 'dependencies', label: 'Dependencies', icon: Package },
  ];

  const repo = result.repository;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10 animate-rise">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-faded font-code text-sm">{repo.owner}</span>
              <span className="text-linen">/</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-walnut tracking-tight">
              {repo.name}
            </h2>
          </div>
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm font-code text-bark border border-linen rounded-lg
                     hover:border-bark/30 hover:shadow-card transition-all duration-300 flex-shrink-0 mt-2"
          >
            GitHub <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {repo.description && (
          <p className="font-body text-lg text-bark/70 leading-relaxed max-w-3xl mb-6">
            {repo.description}
          </p>
        )}

        {repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {repo.topics.slice(0, 8).map(topic => (
              <span key={topic} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-code
                                          bg-forest/5 text-forest border border-forest/10">
                <Tag className="w-3 h-3" /> {topic}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <span className="stat-pill"><Star className="w-3.5 h-3.5 text-ochre" /> {repo.stars.toLocaleString()}</span>
          <span className="stat-pill"><GitFork className="w-3.5 h-3.5 text-sage" /> {repo.forks.toLocaleString()}</span>
          {repo.language && <span className="stat-pill"><Code2 className="w-3.5 h-3.5 text-sienna" /> {repo.language}</span>}
          {repo.license && <span className="stat-pill"><Scale className="w-3.5 h-3.5 text-mist" /> {repo.license}</span>}
          <span className="stat-pill">
            <Calendar className="w-3.5 h-3.5 text-faded" />
            {new Date(repo.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 animate-rise-delay-1">
        {[
          { label: 'Files', value: result.fileStats.totalFiles.toLocaleString(), sub: `${result.fileStats.totalDirectories} directories` },
          { label: 'Languages', value: result.languages.length.toString(), sub: result.languages[0]?.name || 'N/A' },
          { label: 'Dependencies', value: result.dependencies.totalCount.toString(), sub: `${result.dependencies.manifests.length} manifest${result.dependencies.manifests.length !== 1 ? 's' : ''}` },
          { label: 'Frameworks', value: result.insights.frameworks.length.toString(), sub: result.insights.projectType },
        ].map((stat) => (
          <div key={stat.label} className="paper-card p-5">
            <p className="text-xs font-code text-faded uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="font-display text-3xl font-bold text-walnut">{stat.value}</p>
            <p className="text-xs text-faded font-body mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-linen mb-8 animate-rise-delay-2">
        <nav className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-body font-medium border-b-2 transition-all duration-300
                  ${activeTab === tab.id
                    ? 'border-sienna text-sienna'
                    : 'border-transparent text-faded hover:text-bark hover:border-linen'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="pb-16">
        {activeTab === 'overview' && (
          <div className="space-y-10 animate-rise">
            <div className="paper-card p-8">
              <h3 className="font-display text-xl font-semibold text-walnut mb-4">Summary</h3>
              <p className="font-body text-bark/80 leading-relaxed text-[15px]">{result.summary}</p>
            </div>

            {result.languages.length > 0 && (
              <div>
                <h3 className="font-display text-xl font-semibold text-walnut mb-6">Language Composition</h3>
                <LanguageBreakdown languages={result.languages} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'insights' && <ProjectInsights insights={result.insights} />}
        {activeTab === 'files' && <FileTreeView nodes={result.fileTree} />}
        {activeTab === 'dependencies' && <DependencyView dependencies={result.dependencies} />}
      </div>
    </div>
  );
}

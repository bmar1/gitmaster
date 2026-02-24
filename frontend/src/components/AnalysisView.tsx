import { useState } from 'react';
import { AnalysisResult } from '../types';
import { FileTreeView } from './FileTreeView';
import { DependencyView } from './DependencyView';
import { Star, GitFork, Code2, Calendar, Info } from 'lucide-react';

interface AnalysisViewProps {
  result: AnalysisResult;
}

type TabType = 'overview' | 'files' | 'dependencies';

export function AnalysisView({ result }: AnalysisViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'OVERVIEW' },
    { id: 'files', label: 'FILE_TREE' },
    { id: 'dependencies', label: 'DEPENDENCIES' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="glass-morphism p-6 rounded-xl terminal-glow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold gradient-text mb-2">
              {result.repository.fullName}
            </h2>
            <p className="text-gray-400 text-sm">
              {result.repository.description || 'No description available'}
            </p>
          </div>
          <a
            href={result.repository.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-dark border border-primary/30 rounded-lg
                     hover:border-primary hover:shadow-lg hover:shadow-primary/20
                     transition-all duration-300 text-sm flex items-center space-x-2"
          >
            <span>VIEW ON GITHUB</span>
            <span className="text-primary">↗</span>
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-dark/50 p-4 rounded-lg border border-primary/20">
            <div className="flex items-center space-x-2 text-primary mb-1">
              <Star className="w-4 h-4" />
              <span className="text-xs tracking-wider">STARS</span>
            </div>
            <p className="text-2xl font-bold">{result.repository.stars.toLocaleString()}</p>
          </div>

          <div className="bg-dark/50 p-4 rounded-lg border border-secondary/20">
            <div className="flex items-center space-x-2 text-secondary mb-1">
              <GitFork className="w-4 h-4" />
              <span className="text-xs tracking-wider">FORKS</span>
            </div>
            <p className="text-2xl font-bold">{result.repository.forks.toLocaleString()}</p>
          </div>

          <div className="bg-dark/50 p-4 rounded-lg border border-accent/20">
            <div className="flex items-center space-x-2 text-accent mb-1">
              <Code2 className="w-4 h-4" />
              <span className="text-xs tracking-wider">LANGUAGE</span>
            </div>
            <p className="text-lg font-bold">{result.repository.language || 'N/A'}</p>
          </div>

          <div className="bg-dark/50 p-4 rounded-lg border border-primary/20">
            <div className="flex items-center space-x-2 text-primary mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs tracking-wider">ANALYZED</span>
            </div>
            <p className="text-xs font-bold">
              {new Date(result.analyzedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="glass-morphism rounded-xl overflow-hidden">
        <div className="flex border-b border-primary/20 bg-dark/30">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-bold tracking-widest transition-all duration-300
                       border-b-2 ${
                         activeTab === tab.id
                           ? 'border-primary text-primary bg-primary/5'
                           : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-dark/50'
                       }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-slide-down">
              <div className="code-block">
                <div className="flex items-center space-x-2 text-primary mb-3">
                  <Info className="w-5 h-5" />
                  <h3 className="font-bold tracking-wider">SUMMARY</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">{result.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="code-block">
                  <h4 className="text-secondary font-bold tracking-wider mb-3">REPOSITORY_INFO</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Owner:</dt>
                      <dd className="text-gray-300">{result.repository.owner}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Name:</dt>
                      <dd className="text-gray-300">{result.repository.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Branch:</dt>
                      <dd className="text-primary">{result.repository.defaultBranch}</dd>
                    </div>
                  </dl>
                </div>

                <div className="code-block">
                  <h4 className="text-secondary font-bold tracking-wider mb-3">STATISTICS</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Total Files:</dt>
                      <dd className="text-gray-300">{countFiles(result.fileTree)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Dependencies:</dt>
                      <dd className="text-gray-300">{result.dependencies?.totalCount || 0}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Language:</dt>
                      <dd className="text-primary">{result.repository.language || 'Multiple'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'files' && <FileTreeView nodes={result.fileTree} />}

          {activeTab === 'dependencies' && <DependencyView dependencies={result.dependencies} />}
        </div>
      </div>
    </div>
  );
}

function countFiles(nodes: FileNode[]): number {
  let count = 0;
  
  function traverse(n: FileNode[]) {
    n.forEach(node => {
      if (node.type === 'file') count++;
      if (node.children) traverse(node.children);
    });
  }
  
  traverse(nodes);
  return count;
}

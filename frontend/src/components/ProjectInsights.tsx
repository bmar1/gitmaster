import { ProjectInsight, DetectedFramework } from '../types';
import {
  Layout, Server, TestTube2, Wrench, Database, Cloud, Paintbrush, Settings,
  CheckCircle2, XCircle, FolderTree, FileCode, Terminal
} from 'lucide-react';

const CATEGORY_CONFIG: Record<DetectedFramework['category'], { label: string; icon: typeof Layout; accent: string }> = {
  frontend:  { label: 'Frontend',  icon: Layout,     accent: 'text-sienna' },
  backend:   { label: 'Backend',   icon: Server,     accent: 'text-forest' },
  testing:   { label: 'Testing',   icon: TestTube2,  accent: 'text-ochre' },
  build:     { label: 'Build',     icon: Wrench,     accent: 'text-bark' },
  database:  { label: 'Database',  icon: Database,   accent: 'text-forest' },
  devops:    { label: 'DevOps',    icon: Cloud,      accent: 'text-mist' },
  styling:   { label: 'Styling',   icon: Paintbrush, accent: 'text-sienna' },
  utility:   { label: 'Utility',   icon: Settings,   accent: 'text-faded' },
};

function FrameworkGrid({ frameworks }: { frameworks: DetectedFramework[] }) {
  const grouped = new Map<string, DetectedFramework[]>();
  for (const fw of frameworks) {
    const group = grouped.get(fw.category) || [];
    group.push(fw);
    grouped.set(fw.category, group);
  }

  return (
    <div className="space-y-5">
      {Array.from(grouped.entries()).map(([category, fws]) => {
        const config = CATEGORY_CONFIG[category as DetectedFramework['category']];
        const Icon = config.icon;
        return (
          <div key={category}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${config.accent}`} />
              <span className="text-xs font-code uppercase tracking-wider text-faded">{config.label}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {fws.map(fw => (
                <span key={fw.name} className="accent-tag">
                  {fw.name}
                  {fw.version && <span className="text-faded ml-1">{fw.version}</span>}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BoolIndicator({ value, label }: { value: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {value
        ? <CheckCircle2 className="w-4 h-4 text-sage" />
        : <XCircle className="w-4 h-4 text-linen" />
      }
      <span className={`text-sm font-body ${value ? 'text-walnut' : 'text-faded/60'}`}>{label}</span>
    </div>
  );
}

export function ProjectInsights({ insights }: { insights: ProjectInsight }) {
  return (
    <div className="space-y-8 animate-rise">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="paper-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <FolderTree className="w-5 h-5 text-sienna" />
            <h4 className="font-display font-semibold text-walnut">Project Structure</h4>
          </div>
          <dl className="space-y-3">
            <div className="flex justify-between items-baseline">
              <dt className="text-sm text-faded font-body">Type</dt>
              <dd className="font-code text-sm text-walnut font-medium">{insights.projectType}</dd>
            </div>
            <div className="flex justify-between items-baseline">
              <dt className="text-sm text-faded font-body">Structure</dt>
              <dd className="font-code text-sm text-walnut font-medium">{insights.structure}</dd>
            </div>
            {insights.buildTools.length > 0 && (
              <div className="flex justify-between items-baseline">
                <dt className="text-sm text-faded font-body">Build tools</dt>
                <dd className="font-code text-sm text-walnut">{insights.buildTools.join(', ')}</dd>
              </div>
            )}
          </dl>

          <div className="section-rule !my-4"></div>

          <div className="grid grid-cols-2 gap-2">
            <BoolIndicator value={insights.hasTests} label="Tests" />
            <BoolIndicator value={insights.hasCI} label="CI/CD" />
            <BoolIndicator value={insights.hasDocker} label="Docker" />
            <BoolIndicator value={insights.hasDocs} label="Documentation" />
            <BoolIndicator value={insights.hasLicense} label="License" />
          </div>
        </div>

        <div className="paper-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-sienna" />
            <h4 className="font-display font-semibold text-walnut">Detected Stack</h4>
          </div>
          {insights.frameworks.length > 0 ? (
            <FrameworkGrid frameworks={insights.frameworks} />
          ) : (
            <p className="text-faded text-sm font-body">No specific frameworks detected.</p>
          )}
        </div>
      </div>

      {(insights.entryPoints.length > 0 || insights.keyDirectories.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.entryPoints.length > 0 && (
            <div className="paper-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <FileCode className="w-5 h-5 text-ochre" />
                <h4 className="font-display font-semibold text-walnut text-sm">Entry Points</h4>
              </div>
              <div className="space-y-1">
                {insights.entryPoints.map(ep => (
                  <div key={ep} className="font-code text-sm text-bark py-1 px-2 rounded bg-parchment/50">{ep}</div>
                ))}
              </div>
            </div>
          )}

          {insights.keyDirectories.length > 0 && (
            <div className="paper-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <Terminal className="w-5 h-5 text-ochre" />
                <h4 className="font-display font-semibold text-walnut text-sm">Key Directories</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {insights.keyDirectories.map(dir => (
                  <span key={dir} className="stat-pill text-xs">{dir}/</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { DependencyInfo, DependencyManifest } from '../types';
import { Package, FileCode } from 'lucide-react';

const MANIFEST_LABELS: Record<string, string> = {
  npm: 'npm (package.json)',
  maven: 'Maven (pom.xml)',
  gradle: 'Gradle (build.gradle)',
  pip: 'pip (requirements.txt)',
  pipenv: 'Pipenv (Pipfile)',
  poetry: 'Poetry (pyproject.toml)',
  cargo: 'Cargo (Cargo.toml)',
  go: 'Go Modules (go.mod)',
  gemfile: 'Bundler (Gemfile)',
  composer: 'Composer (composer.json)',
  nuget: 'NuGet (.csproj)',
};

function ManifestCard({ manifest }: { manifest: DependencyManifest }) {
  const prodDeps = Object.entries(manifest.production);
  const devDeps = Object.entries(manifest.development);

  return (
    <div className="paper-card p-6">
      <div className="flex items-start gap-3 mb-5">
        <FileCode className="w-5 h-5 text-sienna mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-display font-semibold text-walnut">
            {MANIFEST_LABELS[manifest.type] || manifest.type}
          </h4>
          <p className="text-xs font-code text-faded mt-0.5">{manifest.path}</p>
        </div>
        <span className="ml-auto stat-pill text-xs">
          {manifest.totalCount} total
        </span>
      </div>

      {prodDeps.length > 0 && (
        <div className="mb-5">
          <h5 className="text-xs font-code text-faded uppercase tracking-wider mb-3">
            Dependencies ({prodDeps.length})
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {prodDeps.map(([name, version]) => (
              <div key={name} className="flex items-center justify-between py-1.5 px-3 rounded bg-parchment/50 group hover:bg-parchment transition-colors">
                <span className="text-sm font-code text-bark truncate group-hover:text-sienna transition-colors">{name}</span>
                <span className="text-xs font-code text-faded ml-2 flex-shrink-0">{version}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {devDeps.length > 0 && (
        <div>
          <h5 className="text-xs font-code text-faded uppercase tracking-wider mb-3">
            Dev Dependencies ({devDeps.length})
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {devDeps.map(([name, version]) => (
              <div key={name} className="flex items-center justify-between py-1.5 px-3 rounded bg-parchment/30 group hover:bg-parchment/60 transition-colors">
                <span className="text-sm font-code text-bark/70 truncate group-hover:text-bark transition-colors">{name}</span>
                <span className="text-xs font-code text-faded/60 ml-2 flex-shrink-0">{version}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function DependencyView({ dependencies }: { dependencies: DependencyInfo }) {
  if (dependencies.manifests.length === 0) {
    return (
      <div className="text-center py-16 animate-rise">
        <Package className="w-10 h-10 mx-auto mb-4 text-linen" />
        <p className="text-faded font-body">No dependency manifests detected in this repository.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-rise">
      <div className="flex items-center justify-between">
        <p className="text-sm text-faded font-body">
          Found <strong className="text-walnut">{dependencies.manifests.length}</strong> manifest{dependencies.manifests.length > 1 ? 's' : ''} with{' '}
          <strong className="text-walnut">{dependencies.totalCount}</strong> total packages
        </p>
      </div>

      {dependencies.manifests.map((manifest, idx) => (
        <ManifestCard key={`${manifest.path}-${idx}`} manifest={manifest} />
      ))}
    </div>
  );
}

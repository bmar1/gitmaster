import { DependencyInfo } from '../types';
import { Package, Wrench } from 'lucide-react';

interface DependencyViewProps {
  dependencies: DependencyInfo | null;
}

export function DependencyView({ dependencies }: DependencyViewProps) {
  if (!dependencies) {
    return (
      <div className="code-block animate-slide-up text-center py-12">
        <Package className="w-12 h-12 mx-auto mb-4 text-gray-600" />
        <p className="text-gray-500">No package.json found in this repository</p>
      </div>
    );
  }

  const prodDeps = Object.entries(dependencies.dependencies);
  const devDeps = Object.entries(dependencies.devDependencies);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="code-block">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-primary/20">
          <h3 className="text-primary font-bold tracking-wider flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>DEPENDENCIES</span>
          </h3>
          <span className="text-xs text-gray-500">
            {prodDeps.length} packages
          </span>
        </div>

        {prodDeps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
            {prodDeps.map(([name, version]) => (
              <div
                key={name}
                className="flex items-center justify-between p-2 bg-dark/50 rounded border border-primary/10
                         hover:border-primary/30 transition-all duration-200 group"
              >
                <span className="text-sm text-gray-300 truncate group-hover:text-primary transition-colors">
                  {name}
                </span>
                <span className="text-xs text-secondary ml-2 flex-shrink-0">
                  {version}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No production dependencies</p>
        )}
      </div>

      <div className="code-block">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-secondary/20">
          <h3 className="text-secondary font-bold tracking-wider flex items-center space-x-2">
            <Wrench className="w-5 h-5" />
            <span>DEV_DEPENDENCIES</span>
          </h3>
          <span className="text-xs text-gray-500">
            {devDeps.length} packages
          </span>
        </div>

        {devDeps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
            {devDeps.map(([name, version]) => (
              <div
                key={name}
                className="flex items-center justify-between p-2 bg-dark/50 rounded border border-secondary/10
                         hover:border-secondary/30 transition-all duration-200 group"
              >
                <span className="text-sm text-gray-300 truncate group-hover:text-secondary transition-colors">
                  {name}
                </span>
                <span className="text-xs text-primary ml-2 flex-shrink-0">
                  {version}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No dev dependencies</p>
        )}
      </div>

      <div className="text-center text-sm text-gray-600">
        Total: {dependencies.totalCount} packages
      </div>
    </div>
  );
}

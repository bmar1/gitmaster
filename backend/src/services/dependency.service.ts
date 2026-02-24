import { DependencyInfo } from '../types';
import { getFileContent } from './github.service';

export async function extractDependencies(
  owner: string,
  repo: string
): Promise<DependencyInfo | null> {
  try {
    const packageJsonContent = await getFileContent(owner, repo, 'package.json');
    const packageJson = JSON.parse(packageJsonContent);
    
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};
    
    const totalCount = Object.keys(dependencies).length + Object.keys(devDependencies).length;
    
    return {
      dependencies,
      devDependencies,
      totalCount
    };
  } catch (error: any) {
    console.log('No package.json found or failed to parse:', error.message);
    return null;
  }
}

export function getDependencyList(dependencies: DependencyInfo | null): string[] {
  if (!dependencies) return [];
  
  return [
    ...Object.keys(dependencies.dependencies),
    ...Object.keys(dependencies.devDependencies)
  ];
}

export function getCriticalDependencies(dependencies: DependencyInfo | null): string[] {
  if (!dependencies) return [];
  
  const critical = ['react', 'vue', 'angular', 'express', 'next', 'nestjs', 
                   'fastify', 'django', 'flask', 'typescript', 'webpack', 'vite'];
  
  return Object.keys(dependencies.dependencies).filter(dep => 
    critical.some(c => dep.toLowerCase().includes(c))
  );
}

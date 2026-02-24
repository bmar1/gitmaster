import { GitHubTreeItem, FileNode } from '../types';

const EXCLUDED_PATHS = [
  '.git',
  'node_modules',
  'dist',
  'build',
  '.next',
  'coverage',
  '__pycache__',
  '.pytest_cache',
  'target',
  'vendor'
];

export function buildFileTree(githubTree: GitHubTreeItem[]): FileNode[] {
  const filteredTree = githubTree.filter(item => {
    return !EXCLUDED_PATHS.some(excluded => 
      item.path.startsWith(excluded + '/') || item.path === excluded
    );
  });
  
  const fileMap = new Map<string, FileNode>();
  const rootNodes: FileNode[] = [];
  
  filteredTree.forEach(item => {
    const pathParts = item.path.split('/');
    const name = pathParts[pathParts.length - 1];
    
    const node: FileNode = {
      path: item.path,
      name: name,
      type: item.type === 'blob' ? 'file' : 'directory',
      size: item.size,
      children: item.type === 'tree' ? [] : undefined
    };
    
    fileMap.set(item.path, node);
  });
  
  filteredTree.forEach(item => {
    const node = fileMap.get(item.path);
    if (!node) return;
    
    const pathParts = item.path.split('/');
    
    if (pathParts.length === 1) {
      rootNodes.push(node);
    } else {
      const parentPath = pathParts.slice(0, -1).join('/');
      const parentNode = fileMap.get(parentPath);
      
      if (parentNode && parentNode.children) {
        parentNode.children.push(node);
      }
    }
  });
  
  return rootNodes;
}

export function getFileTreeStats(fileTree: FileNode[]): {
  totalFiles: number;
  totalDirectories: number;
} {
  let totalFiles = 0;
  let totalDirectories = 0;
  
  function traverse(nodes: FileNode[]) {
    nodes.forEach(node => {
      if (node.type === 'file') {
        totalFiles++;
      } else {
        totalDirectories++;
        if (node.children) {
          traverse(node.children);
        }
      }
    });
  }
  
  traverse(fileTree);
  
  return { totalFiles, totalDirectories };
}

import { useState } from 'react';
import { FileNode } from '../types';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';

interface FileTreeViewProps {
  nodes: FileNode[];
  level?: number;
}

function TreeNode({ node, level = 0 }: { node: FileNode; level?: number }) {
  const [isOpen, setIsOpen] = useState(level < 2);
  const isDirectory = node.type === 'directory';
  const hasChildren = node.children && node.children.length > 0;

  const indent = level * 20;

  return (
    <div>
      <div
        className={`flex items-center py-1.5 px-3 rounded cursor-pointer group
                   hover:bg-primary/10 transition-all duration-200
                   ${isDirectory ? 'font-semibold' : 'text-gray-400'}`}
        style={{ paddingLeft: `${indent + 12}px` }}
        onClick={() => isDirectory && setIsOpen(!isOpen)}
      >
        {isDirectory && hasChildren && (
          <span className="mr-2 text-primary">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </span>
        )}
        
        {!isDirectory && !hasChildren && (
          <span className="mr-2 w-4"></span>
        )}

        {isDirectory ? (
          isOpen ? (
            <FolderOpen className="w-4 h-4 mr-2 text-secondary" />
          ) : (
            <Folder className="w-4 h-4 mr-2 text-secondary" />
          )
        ) : (
          <File className="w-4 h-4 mr-2 text-primary/60" />
        )}

        <span className="text-sm group-hover:text-primary transition-colors">
          {node.name}
        </span>

        {node.size && (
          <span className="ml-auto text-xs text-gray-600 group-hover:text-gray-500">
            {formatFileSize(node.size)}
          </span>
        )}
      </div>

      {isDirectory && isOpen && hasChildren && (
        <div className="border-l border-primary/20 ml-4">
          {node.children?.map((child, idx) => (
            <TreeNode key={`${child.path}-${idx}`} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTreeView({ nodes, level = 0 }: FileTreeViewProps) {
  const totalFiles = countFiles(nodes);

  return (
    <div className="code-block animate-slide-up">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-primary/20">
        <h3 className="text-primary font-bold tracking-wider flex items-center space-x-2">
          <span>▸</span>
          <span>FILE_STRUCTURE</span>
        </h3>
        <span className="text-xs text-gray-500">
          {totalFiles} files
        </span>
      </div>

      <div className="max-h-[500px] overflow-y-auto space-y-0.5">
        {nodes.map((node, idx) => (
          <TreeNode key={`${node.path}-${idx}`} node={node} level={level} />
        ))}
      </div>
    </div>
  );
}

function countFiles(nodes: FileNode[]): number {
  let count = 0;
  
  function traverse(n: FileNode[]) {
    n.forEach(node => {
      if (node.type === 'file') {
        count++;
      }
      if (node.children) {
        traverse(node.children);
      }
    });
  }
  
  traverse(nodes);
  return count;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

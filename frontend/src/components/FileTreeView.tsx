import { useState } from 'react';
import { FileNode } from '../types';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';

function TreeNode({ node, level = 0 }: { node: FileNode; level?: number }) {
  const [isOpen, setIsOpen] = useState(level < 1);
  const isDirectory = node.type === 'directory';
  const hasChildren = node.children && node.children.length > 0;
  const indent = level * 16;

  return (
    <div>
      <div
        className={`flex items-center py-1 px-2 rounded cursor-pointer group transition-colors duration-150
                   hover:bg-surface-alt/60 ${isDirectory ? 'font-medium text-primary' : 'text-secondary'}`}
        style={{ paddingLeft: `${indent + 8}px` }}
        onClick={() => isDirectory && setIsOpen(!isOpen)}
      >
        {isDirectory && hasChildren ? (
          <span className="mr-1.5 text-muted">
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </span>
        ) : (
          <span className="mr-1.5 w-3.5"></span>
        )}

        {isDirectory ? (
          isOpen ? <FolderOpen className="w-4 h-4 mr-2 text-ochre" /> : <Folder className="w-4 h-4 mr-2 text-ochre" />
        ) : (
          <File className="w-4 h-4 mr-2 text-muted/60" />
        )}

        <span className="text-sm font-code group-hover:text-accent transition-colors truncate">
          {node.name}
        </span>

        {node.size !== undefined && node.size > 0 && !isDirectory && (
          <span className="ml-auto text-[11px] text-muted/50 font-code pl-4 flex-shrink-0">
            {formatSize(node.size)}
          </span>
        )}
      </div>

      {isDirectory && isOpen && hasChildren && (
        <div className="border-l border-border/50" style={{ marginLeft: `${indent + 18}px` }}>
          {node.children?.map((child, idx) => (
            <TreeNode key={`${child.path}-${idx}`} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTreeView({ nodes }: { nodes: FileNode[] }) {
  return (
    <div className="animate-rise">
      <div className="code-surface max-h-[600px] overflow-y-auto">
        {nodes.map((node, idx) => (
          <TreeNode key={`${node.path}-${idx}`} node={node} level={0} />
        ))}
      </div>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

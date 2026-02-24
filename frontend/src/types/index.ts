export interface AnalysisRequest {
  url: string;
}

export interface RepositoryInfo {
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  url: string;
  defaultBranch: string;
}

export interface FileNode {
  path: string;
  name: string;
  type: 'file' | 'directory';
  size?: number;
  children?: FileNode[];
}

export interface DependencyInfo {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  totalCount: number;
}

export interface AnalysisResult {
  repository: RepositoryInfo;
  fileTree: FileNode[];
  dependencies: DependencyInfo | null;
  summary: string;
  analyzedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

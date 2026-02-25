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
  openIssues: number;
  language: string | null;
  topics: string[];
  url: string;
  homepage: string | null;
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  size: number;
  license: string | null;
}

export interface FileNode {
  path: string;
  name: string;
  type: 'file' | 'directory';
  size?: number;
  extension?: string;
  children?: FileNode[];
}

export interface LanguageStats {
  name: string;
  fileCount: number;
  totalSize: number;
  percentage: number;
  color: string;
}

export type ManifestType =
  | 'npm' | 'maven' | 'gradle' | 'pip' | 'pipenv' | 'poetry'
  | 'cargo' | 'go' | 'gemfile' | 'composer' | 'nuget' | 'unknown';

export interface DependencyManifest {
  path: string;
  type: ManifestType;
  production: Record<string, string>;
  development: Record<string, string>;
  totalCount: number;
}

export interface DependencyInfo {
  manifests: DependencyManifest[];
  totalDependencies: number;
  totalDevDependencies: number;
  totalCount: number;
}

export interface DetectedFramework {
  name: string;
  category: 'frontend' | 'backend' | 'testing' | 'build' | 'database' | 'devops' | 'styling' | 'utility';
  confidence: number;
  version?: string;
  detectedFrom: string;
}

export interface ProjectInsight {
  projectType: string;
  structure: string;
  frameworks: DetectedFramework[];
  buildTools: string[];
  hasTests: boolean;
  hasCI: boolean;
  hasDocs: boolean;
  hasDocker: boolean;
  hasLicense: boolean;
  entryPoints: string[];
  configFiles: string[];
  keyDirectories: string[];
}

export interface FileStats {
  totalFiles: number;
  totalDirectories: number;
  totalSize: number;
  avgFileSize: number;
  largestFiles: { path: string; size: number }[];
}

export interface ArchitectureNode {
  id: string;
  label: string;
  type: 'module' | 'entry' | 'config' | 'external' | 'root';
  fileCount: number;
  totalSize: number;
  languages: string[];
  frameworks: string[];
  isHotspot: boolean;
}

export interface ArchitectureEdge {
  source: string;
  target: string;
  label?: string;
}

export interface ArchitectureGraph {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
}

export interface AnalysisResult {
  repository: RepositoryInfo;
  fileTree: FileNode[];
  fileStats: FileStats;
  languages: LanguageStats[];
  dependencies: DependencyInfo;
  insights: ProjectInsight;
  architecture: ArchitectureGraph;
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

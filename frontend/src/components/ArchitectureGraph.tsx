import { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  NodeProps,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArchitectureGraph as ArchGraph } from '../types';
import { Flame, Zap, Settings, Box, ArrowDownRight } from 'lucide-react';

const NODE_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  root:     { bg: '#1a1a2a', border: '#e07050', text: '#e8e0d4', glow: 'rgba(224, 112, 80, 0.2)' },
  module:   { bg: '#161620', border: '#3a3a4a', text: '#e8e0d4', glow: 'rgba(0,0,0,0)' },
  entry:    { bg: '#1a2520', border: '#7daa84', text: '#e8e0d4', glow: 'rgba(125, 170, 132, 0.15)' },
  config:   { bg: '#1a1a20', border: '#d4a020', text: '#b0a898', glow: 'rgba(212, 160, 32, 0.1)' },
  external: { bg: '#1e1520', border: '#9070a0', text: '#b0a898', glow: 'rgba(144, 112, 160, 0.1)' },
  hotspot:  { bg: '#201515', border: '#e07050', text: '#e8e0d4', glow: 'rgba(224, 112, 80, 0.25)' },
};

function ArchNode({ data }: NodeProps) {
  const isHotspot = data.isHotspot as boolean;
  const nodeType = data.nodeType as string;
  const colors = isHotspot ? NODE_COLORS.hotspot : (NODE_COLORS[nodeType] || NODE_COLORS.module);

  const IconComponent = nodeType === 'entry' ? Zap
    : nodeType === 'config' ? Settings
    : nodeType === 'external' ? Box
    : nodeType === 'root' ? ArrowDownRight
    : isHotspot ? Flame
    : Box;

  return (
    <div
      className="rounded-lg px-4 py-3 min-w-[140px] max-w-[220px] font-code text-xs"
      style={{
        backgroundColor: colors.bg,
        border: `1.5px solid ${colors.border}`,
        color: colors.text,
        boxShadow: `0 0 16px ${colors.glow}, 0 2px 8px rgba(0,0,0,0.3)`,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: colors.border, border: 'none', width: 6, height: 6 }} />

      <div className="flex items-center gap-2 mb-1">
        <IconComponent className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.border }} />
        <span className="font-medium truncate text-[11px]" style={{ color: colors.text }}>
          {data.label as string}
        </span>
      </div>

      {(data.fileCount as number) > 0 && nodeType !== 'config' && (
        <div className="flex items-center gap-2 mt-1.5" style={{ color: '#706860' }}>
          <span>{data.fileCount as number} {nodeType === 'external' ? 'pkgs' : 'files'}</span>
          {(data.languages as string[])?.length > 0 && (
            <>
              <span className="opacity-40">·</span>
              <span className="truncate">{(data.languages as string[]).slice(0, 2).join(', ')}</span>
            </>
          )}
        </div>
      )}

      {(data.frameworks as string[])?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {(data.frameworks as string[]).map((fw: string) => (
            <span
              key={fw}
              className="px-1.5 py-0 rounded text-[9px]"
              style={{ backgroundColor: 'rgba(224, 112, 80, 0.15)', color: '#e07050' }}
            >
              {fw}
            </span>
          ))}
        </div>
      )}

      {isHotspot && (
        <div className="flex items-center gap-1 mt-1.5 text-[9px]" style={{ color: '#e07050' }}>
          <Flame className="w-3 h-3" /> Hotspot
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: colors.border, border: 'none', width: 6, height: 6 }} />
    </div>
  );
}

const nodeTypes = { archNode: ArchNode };

function layoutNodes(graph: ArchGraph): { nodes: Node[]; edges: Edge[] } {
  const adjacency = new Map<string, string[]>();
  for (const edge of graph.edges) {
    const children = adjacency.get(edge.source) || [];
    children.push(edge.target);
    adjacency.set(edge.source, children);
  }

  const placed = new Map<string, { x: number; y: number }>();
  const nodeMap = new Map(graph.nodes.map(n => [n.id, n]));

  function placeTree(nodeId: string, x: number, y: number, widthBudget: number): number {
    placed.set(nodeId, { x, y });
    const children = (adjacency.get(nodeId) || []).filter(c => nodeMap.has(c) && !placed.has(c));
    if (children.length === 0) return 180;

    const childWidth = Math.max(widthBudget / children.length, 200);
    let currentX = x - (children.length - 1) * childWidth / 2;
    let totalWidth = 0;

    for (const child of children) {
      const usedWidth = placeTree(child, currentX, y + 140, childWidth);
      currentX += Math.max(usedWidth, childWidth);
      totalWidth += Math.max(usedWidth, childWidth);
    }

    return totalWidth || 180;
  }

  placeTree('root', 0, 0, graph.nodes.length * 200);

  for (const node of graph.nodes) {
    if (!placed.has(node.id)) {
      const maxX = Math.max(...Array.from(placed.values()).map(p => p.x), 0);
      placed.set(node.id, { x: maxX + 250, y: 140 });
    }
  }

  const flowNodes: Node[] = graph.nodes.map(n => {
    const pos = placed.get(n.id) || { x: 0, y: 0 };
    return {
      id: n.id,
      type: 'archNode',
      position: pos,
      data: {
        label: n.label,
        nodeType: n.type,
        fileCount: n.fileCount,
        totalSize: n.totalSize,
        languages: n.languages,
        frameworks: n.frameworks,
        isHotspot: n.isHotspot,
      },
    };
  });

  const flowEdges: Edge[] = graph.edges.map((e, i) => ({
    id: `e-${i}`,
    source: e.source,
    target: e.target,
    label: e.label,
    animated: e.label === 'entry',
    style: {
      stroke: e.label === 'entry' ? '#7daa84'
            : e.label?.includes('packages') ? '#9070a0'
            : '#2a2a38',
      strokeWidth: e.label === 'entry' ? 2 : 1.5,
    },
    labelStyle: {
      fill: '#706860',
      fontSize: 10,
      fontFamily: '"Source Code Pro", monospace',
    },
    labelBgStyle: {
      fill: '#0e0e14',
      fillOpacity: 0.9,
    },
  }));

  return { nodes: flowNodes, edges: flowEdges };
}

function GraphInner({ architecture }: { architecture: ArchGraph }) {
  const { fitView } = useReactFlow();

  const { nodes, edges } = useMemo(() => layoutNodes(architecture), [architecture]);

  const onInit = useCallback(() => {
    setTimeout(() => fitView({ padding: 0.2 }), 100);
  }, [fitView]);

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border border-border" style={{ backgroundColor: '#0a0a10' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={onInit}
        fitView
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1a1a28" />
        <Controls
          className="!bg-surface-1 !border-border !rounded-lg !shadow-card"
          style={{
            button: { backgroundColor: '#161620', borderColor: '#2a2a38', color: '#e8e0d4' }
          } as any}
        />
        <MiniMap
          nodeColor={(n) => {
            const type = n.data?.nodeType as string;
            const isHot = n.data?.isHotspot as boolean;
            if (isHot) return '#e07050';
            if (type === 'entry') return '#7daa84';
            if (type === 'external') return '#9070a0';
            if (type === 'config') return '#d4a020';
            if (type === 'root') return '#e07050';
            return '#3a3a4a';
          }}
          maskColor="rgba(14, 14, 20, 0.85)"
          style={{ backgroundColor: '#0a0a10', border: '1px solid #2a2a38', borderRadius: 8 }}
        />
      </ReactFlow>
    </div>
  );
}

export function ArchitectureGraphView({ architecture }: { architecture: ArchGraph }) {
  if (!architecture || architecture.nodes.length === 0) {
    return (
      <div className="text-center py-16 animate-rise">
        <Box className="w-10 h-10 mx-auto mb-4 text-border" />
        <p className="text-muted font-body">No architecture data available.</p>
      </div>
    );
  }

  const hotspots = architecture.nodes.filter(n => n.isHotspot);
  const entryNodes = architecture.nodes.filter(n => n.type === 'entry');
  const externalNodes = architecture.nodes.filter(n => n.type === 'external');

  return (
    <div className="space-y-6 animate-rise">
      <div className="flex flex-wrap gap-4 mb-2">
        <div className="flex items-center gap-2 text-xs font-code text-muted">
          <span className="w-3 h-3 rounded-sm border" style={{ borderColor: '#e07050', backgroundColor: 'rgba(224,112,80,0.15)' }} />
          Root / Hotspot
        </div>
        <div className="flex items-center gap-2 text-xs font-code text-muted">
          <span className="w-3 h-3 rounded-sm border" style={{ borderColor: '#7daa84', backgroundColor: 'rgba(125,170,132,0.15)' }} />
          Entry Point
        </div>
        <div className="flex items-center gap-2 text-xs font-code text-muted">
          <span className="w-3 h-3 rounded-sm border" style={{ borderColor: '#9070a0', backgroundColor: 'rgba(144,112,160,0.1)' }} />
          External Deps
        </div>
        <div className="flex items-center gap-2 text-xs font-code text-muted">
          <span className="w-3 h-3 rounded-sm border" style={{ borderColor: '#d4a020', backgroundColor: 'rgba(212,160,32,0.1)' }} />
          Config
        </div>
        <div className="flex items-center gap-2 text-xs font-code text-muted">
          <span className="w-3 h-3 rounded-sm border" style={{ borderColor: '#3a3a4a', backgroundColor: '#161620' }} />
          Module
        </div>
      </div>

      <ReactFlowProvider>
        <GraphInner architecture={architecture} />
      </ReactFlowProvider>

      {(hotspots.length > 0 || entryNodes.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hotspots.length > 0 && (
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-4 h-4 text-accent" />
                <h4 className="text-xs font-code uppercase tracking-wider text-muted">Hotspots</h4>
              </div>
              <div className="space-y-1.5">
                {hotspots.map(h => (
                  <div key={h.id} className="flex justify-between text-xs font-code">
                    <span className="text-accent truncate">{h.label}</span>
                    <span className="text-muted">{h.fileCount} files</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {entryNodes.length > 0 && (
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-sage" />
                <h4 className="text-xs font-code uppercase tracking-wider text-muted">Entry Points</h4>
              </div>
              <div className="space-y-1.5">
                {entryNodes.map(e => (
                  <div key={e.id} className="text-xs font-code text-sage truncate">{e.label}</div>
                ))}
              </div>
            </div>
          )}

          {externalNodes.length > 0 && (
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Box className="w-4 h-4" style={{ color: '#9070a0' }} />
                <h4 className="text-xs font-code uppercase tracking-wider text-muted">External Deps</h4>
              </div>
              <div className="space-y-1.5">
                {externalNodes.map(e => (
                  <div key={e.id} className="flex justify-between text-xs font-code">
                    <span style={{ color: '#9070a0' }} className="truncate">{e.label}</span>
                    <span className="text-muted">{e.fileCount} pkgs</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

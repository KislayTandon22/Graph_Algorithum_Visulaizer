interface Node {
    id: string;
    x?: number;
    y?: number;
    fx?: number;
    fy?: number;
  }
  
  interface Link {
    source: string | Node;
    target: string | Node;
  }
  
  export const calculateSegmentLineCover = (nodes: Node[], links: Link[]): { seg: number, line: number } => {
    const pathComponents = findPathComponents(nodes, links);
    const remainingGraph = removePathComponents(nodes, links, pathComponents);
  
    const lineCoverNumber = computeLineCover(remainingGraph);
    const segmentNumber = computeSegmentNumber(remainingGraph, lineCoverNumber);
  
    return { seg: segmentNumber + pathComponents.length, line: lineCoverNumber };
  };
  
  const findPathComponents = (nodes: Node[], links: Link[]): Node[] => {
    const visited = new Set<string>();
    const pathComponents: Node[] = [];
  
    for (const node of nodes) {
      if (!visited.has(node.id)) {
        const path = dfs(node, nodes, links, visited);
        if (path.length > 1) {
          pathComponents.push(...path);
        }
      }
    }
  
    return pathComponents;
  };
  
  const dfs = (node: Node, nodes: Node[], links: Link[], visited: Set<string>): Node[] => {
    const path: Node[] = [];
    let current: Node | undefined = node;
  
    while (current && !visited.has(current.id)) {
      visited.add(current.id);
      path.push(current);
  
      const neighbors = links
        .filter(link => link.source === current!.id || link.target === current!.id)
        .map(link => link.source === current!.id ? link.target : link.source)
        .filter(neighborId => !visited.has(neighborId));
  
      if (neighbors.length === 1) {
        current = nodes.find(n => n.id === neighbors[0]);
      } else {
        break;
      }
    }
  
    return path;
  };
  
  const removePathComponents = (nodes: Node[], links: Link[], pathComponents: Node[]): { nodes: Node[], links: Link[] } => {
    const pathNodeIds = new Set(pathComponents.map(n => n.id));
    const remainingNodes = nodes.filter(n => !pathNodeIds.has(n.id));
    const remainingLinks = links.filter(l => 
      !pathNodeIds.has(typeof l.source === 'string' ? l.source : l.source.id) && 
      !pathNodeIds.has(typeof l.target === 'string' ? l.target : l.target.id)
    );
  
    return { nodes: remainingNodes, links: remainingLinks };
  };
  
  const computeLineCover = (graph: { nodes: Node[], links: Link[] }): number => {
    const { nodes, links } = graph;
    let lineCover = 0;
    const coveredNodes = new Set<string>();
  
    while (coveredNodes.size < nodes.length) {
      let bestEdge: Link | null = null;
      let bestCoverage = 0;
  
      for (const link of links) {
        let coverage = 0;
        const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
        const targetId = typeof link.target === 'string' ? link.target : link.target.id;
  
        if (!coveredNodes.has(sourceId)) coverage++;
        if (!coveredNodes.has(targetId)) coverage++;
  
        if (coverage > bestCoverage) {
          bestEdge = link;
          bestCoverage = coverage;
        }
      }
  
      if (bestEdge) {
        const sourceId = typeof bestEdge.source === 'string' ? bestEdge.source : bestEdge.source.id;
        const targetId = typeof bestEdge.target === 'string' ? bestEdge.target : bestEdge.target.id;
        coveredNodes.add(sourceId);
        coveredNodes.add(targetId);
        lineCover++;
      } else {
        lineCover += nodes.length - coveredNodes.size;
        break;
      }
    }
  
    return lineCover;
  };
  
  const computeSegmentNumber = (graph: { nodes: Node[], links: Link[] }, lineCoverNumber: number): number => {
    return Math.min(graph.nodes.length, lineCoverNumber * lineCoverNumber);
  };
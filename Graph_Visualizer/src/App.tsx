import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './App.css';
import { calculateSegmentLineCover } from './calculateSegmentLineCover';
// Define the types for nodes and links
interface Node {
  id: string;
  x?: number;
  y?: number;
  fx?: number; // fixed x (for dragging)
  fy?: number; // fixed y (for dragging)
}

interface Link {
  id: string | number;
  source: string | Node;
  target: string | Node;
}

interface GraphProps {
  nodes: Node[];
  links: Link[];
}


const Graph: React.FC<GraphProps> = ({ nodes, links }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth * 0.7, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth * 0.7, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const width = dimensions.width;
    const height = dimensions.height;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('border', '1px solid black');

    const g = svg.append('g');

    // Add zoom functionality
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const simulation = d3
      .forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Link, Node>(links).id((d) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(20)); // Prevent node overlap

    const link = g
      .append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-width', 2);

    const node = g
      .append('g')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', 10)
      .attr('fill', '#69b3a2')
      .call(d3.drag<SVGCircleElement, Node>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    const label = g
      .append('g')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .text((d) => d.id)
      .attr('x', 15)
      .attr('y', 5)
      .style('fill', 'black');

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (typeof d.source === 'object' ? d.source.x : 0)!)
        .attr('y1', (d) => (typeof d.source === 'object' ? d.source.y : 0)!)
        .attr('x2', (d) => (typeof d.target === 'object' ? d.target.x : 0)!)
        .attr('y2', (d) => (typeof d.target === 'object' ? d.target.y : 0)!);

      node.attr('cx', (d) => d.x!).attr('cy', (d) => d.y!);
      label.attr('x', (d) => d.x! + 10).attr('y', (d) => d.y!);
    });

    return () => simulation.stop();
  }, [nodes, links, dimensions]);

  return <svg ref={svgRef}></svg>;
};

const App: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [segmentNumber, setSegmentNumber] = useState<number | null>(null);
  const [lineCoverNumber, setLineCoverNumber] = useState<number | null>(null);
  const [nodeInput, setNodeInput] = useState('');
  const [linkSource, setLinkSource] = useState('');
  const [linkTarget, setLinkTarget] = useState('');

  const calculateSegmentAndLineCover = () => {
    const { seg, line } = calculateSegmentLineCover(nodes, links);
    setSegmentNumber(seg);
    setLineCoverNumber(line);
  };

  const addNode = () => {
    if (nodeInput && !nodes.find((n) => n.id === nodeInput)) {
      setNodes([...nodes, { id: nodeInput }]);
      setNodeInput('');
    }
  };

  const addLink = () => {
    if (linkSource && linkTarget) {
      const sourceNode = nodes.find((n) => n.id === linkSource);
      const targetNode = nodes.find((n) => n.id === linkTarget);
      if (sourceNode && targetNode) {
        setLinks([...links, {
          source: sourceNode.id, target: targetNode.id,
          id: `${linkSource}-${linkTarget}`
        }]);
        setLinkSource('');
        setLinkTarget('');
      }
    }
  };

  return (
    <div className="App">
      <div className="graph-container">
        <Graph nodes={nodes} links={links} />
      </div>
      <div className="controls">
        <h3>Add Node</h3>
        <input
          type="text"
          value={nodeInput}
          onChange={(e) => setNodeInput(e.target.value)}
          placeholder="Node ID"
        />
        <button onClick={addNode}>Add Node</button>

        <h3>Add Edge</h3>
        <input
          type="text"
          value={linkSource}
          onChange={(e) => setLinkSource(e.target.value)}
          placeholder="Source Node ID"
        />
        <input
          type="text"
          value={linkTarget}
          onChange={(e) => setLinkTarget(e.target.value)}
          placeholder="Target Node ID"
        />
        <button onClick={addLink}>Add Edge</button>

        <h3>Calculate Segment & Line Cover Numbers</h3>
        <button onClick={calculateSegmentAndLineCover}>Calculate</button>
        
        <div className="results">
          <p>Segment Number: {segmentNumber !== null ? segmentNumber : 'Not calculated'}</p>
          <p>Line Cover Number: {lineCoverNumber !== null ? lineCoverNumber : 'Not calculated'}</p>
        </div>
      </div>
    </div>
  );
};

export default App;

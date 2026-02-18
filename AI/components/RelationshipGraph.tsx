import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Agent } from '../types';
import { MOOD_COLORS } from '../constants';

interface RelationshipGraphProps {
  agents: Agent[];
  onAgentClick: (agentId: string) => void;
}

const RelationshipGraph: React.FC<RelationshipGraphProps> = ({ agents, onAgentClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || agents.length === 0) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .style("max-width", "100%")
      .style("height", "auto");

    // Prepare nodes and links
    const nodes = agents.map(a => ({ ...a }));
    const links: any[] = [];

    agents.forEach(source => {
      source.relationships.forEach(rel => {
        // Only draw stronger relationships to avoid clutter
        if (Math.abs(rel.affinity) > 10) {
            // Check if target exists
            if (agents.find(a => a.id === rel.targetAgentId)) {
                links.push({
                    source: source.id,
                    target: rel.targetAgentId,
                    value: rel.affinity
                });
            }
        }
      });
    });

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(40));

    // Draw lines for relationships
    const link = svg.append("g")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", d => Math.max(1, Math.abs(d.value) / 10))
      .attr("stroke", d => d.value > 0 ? "#4ade80" : "#f87171"); // Green for positive, Red for negative

    // Draw nodes
    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call((d3.drag() as any)
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Node circles (Mood color border)
    node.append("circle")
      .attr("r", 25)
      .attr("fill", "#1e293b")
      .attr("stroke", d => MOOD_COLORS[d.mood])
      .attr("stroke-width", 3)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        onAgentClick(d.id);
      });

    // Avatar images inside circles (clipPath would be better but simple image is easier for now)
    // Using simple text initials for robustness if images fail or for cleaner D3
    node.append("text")
        .text(d => d.name.substring(0, 2))
        .attr("x", 0)
        .attr("y", 5)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .style("pointer-events", "none");

    // Labels
    node.append("text")
      .text(d => d.name)
      .attr("x", 0)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .attr("fill", "#e2e8f0")
      .attr("font-size", "12px")
      .clone(true).lower()
      .attr("fill", "none")
      .attr("stroke", "#0f172a")
      .attr("stroke-width", 3);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [agents, onAgentClick]);

  return (
    <div className="w-full h-full bg-slate-900 rounded-lg overflow-hidden border border-slate-700 relative">
        <div className="absolute top-2 left-2 text-xs text-slate-500 font-mono z-10 pointer-events-none">
            Социальный Граф
        </div>
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

export default RelationshipGraph;
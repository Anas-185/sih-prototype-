import React, { useRef, useEffect, useState } from 'react';

export default function NetworkTopology({ nodesData, edgesData, selectedNode, onSelectNode, entityFilter, threatFilter }) {
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(0.9);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState(null);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 });

  const filteredNodes = nodesData.filter(node => {
    const typeMatch = entityFilter === 'ALL' || node.label === entityFilter;
    const threatMatch = (node.threat_score || 0) >= threatFilter;
    return typeMatch && threatMatch;
  });

  const getNodeColor = (label) => {
    switch (label) {
      case 'Person': return '#ff2a5f';
      case 'Phone': return '#00f0ff';
      case 'Vehicle': return '#ffb703';
      case 'Location': return '#00e676';
      case 'Organization': return '#ab47bc';
      default: return '#2d68ff';
    }
  };

  // Canvas Sizing & Layout Measuring
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const measureAndSet = () => {
      if (canvas.parentElement) {
        const rect = canvas.parentElement.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          canvas.width = rect.width;
          canvas.height = rect.height;
          setCanvasDimensions({ width: rect.width, height: rect.height });
        }
      }
    };

    // Immediate & Microtask measurement to guarantee rendering on page load
    measureAndSet();
    const timer1 = setTimeout(measureAndSet, 50);
    const timer2 = setTimeout(measureAndSet, 200);

    const resizeObserver = new ResizeObserver(() => measureAndSet());
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);

    // Prevent laptop trackpad from zooming whole browser webpage
    const handleWheel = (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setScale(s => Math.max(0.4, Math.min(s * zoomFactor, 2.5)));
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      resizeObserver.disconnect();
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Main Render Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Force canvas pixel size matching container
    const width = canvas.parentElement ? canvas.parentElement.clientWidth : canvasDimensions.width;
    const height = canvas.parentElement ? canvas.parentElement.clientHeight : canvasDimensions.height;
    if (width > 0 && height > 0 && (canvas.width !== width || canvas.height !== height)) {
      canvas.width = width;
      canvas.height = height;
    }

    const currentW = canvas.width || 800;
    const currentH = canvas.height || 600;

    ctx.clearRect(0, 0, currentW, currentH);
    ctx.save();
    
    // Dynamically center graph relative to actual canvas width/height
    const translateX = pan.x + (currentW / 2 - 300 * scale);
    const translateY = pan.y + (currentH / 2 - 220 * scale);

    ctx.translate(translateX, translateY);
    ctx.scale(scale, scale);

    // Draw Grid
    ctx.strokeStyle = 'rgba(64, 93, 138, 0.08)';
    ctx.lineWidth = 1;
    for (let x = -1000; x < 2500; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, -1000); ctx.lineTo(x, 2500); ctx.stroke();
    }
    for (let y = -1000; y < 2500; y += 40) {
      ctx.beginPath(); ctx.moveTo(-1000, y); ctx.lineTo(2500, y); ctx.stroke();
    }

    // Draw Edges
    const validIds = new Set(filteredNodes.map(n => n.id));
    edgesData.forEach(edge => {
      const sNode = nodesData.find(n => n.id === edge.source);
      const tNode = nodesData.find(n => n.id === edge.target);

      if (sNode && tNode && validIds.has(sNode.id) && validIds.has(tNode.id)) {
        ctx.beginPath();
        ctx.moveTo(sNode.x, sNode.y);
        ctx.lineTo(tNode.x, tNode.y);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
        ctx.lineWidth = (edge.weight || 0.5) * 3;
        ctx.stroke();

        const midX = (sNode.x + tNode.x) / 2;
        const midY = (sNode.y + tNode.y) / 2;
        ctx.fillStyle = 'rgba(0, 240, 255, 0.85)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(edge.relationship || 'LINK', midX, midY);
      }
    });

    // Draw Nodes
    filteredNodes.forEach(node => {
      const radius = 16 + ((node.threat_score || 50) * 0.14);
      const color = getNodeColor(node.label);

      if ((node.threat_score || 0) >= 80) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 42, 95, 0.25)';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = selectedNode && selectedNode.id === node.id ? 4 : 2;
      ctx.strokeStyle = selectedNode && selectedNode.id === node.id ? '#ffffff' : 'rgba(255,255,255,0.4)';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.name || node.id, node.x, node.y + radius + 15);
    });

    ctx.restore();
  }, [filteredNodes, edgesData, scale, pan, selectedNode, canvasDimensions]);

  // Click & Drag Handler
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    const currentW = canvas.width || 800;
    const currentH = canvas.height || 600;
    const translateX = pan.x + (currentW / 2 - 300 * scale);
    const translateY = pan.y + (currentH / 2 - 220 * scale);

    const mouseX = (e.clientX - rect.left - translateX) / scale;
    const mouseY = (e.clientY - rect.top - translateY) / scale;

    const clicked = filteredNodes.find(node => {
      const radius = 16 + ((node.threat_score || 50) * 0.14);
      const dist = Math.hypot(node.x - mouseX, node.y - mouseY);
      return dist <= radius + 6;
    });

    if (clicked) {
      setDragNode(clicked);
      onSelectNode(clicked);
    } else {
      setIsDragging(true);
      setLastMouse({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (dragNode) {
      const rect = canvas.getBoundingClientRect();
      const currentW = canvas.width || 800;
      const currentH = canvas.height || 600;
      const translateX = pan.x + (currentW / 2 - 300 * scale);
      const translateY = pan.y + (currentH / 2 - 220 * scale);

      dragNode.x = (e.clientX - rect.left - translateX) / scale;
      dragNode.y = (e.clientY - rect.top - translateY) / scale;
      setPan(p => ({ ...p }));
    } else if (isDragging) {
      setPan(prev => ({
        x: prev.x + (e.clientX - lastMouse.x),
        y: prev.y + (e.clientY - lastMouse.y)
      }));
      setLastMouse({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragNode(null);
  };

  return (
    <div class="canvas-container">
      <canvas
        ref={canvasRef}
        id="network-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div class="canvas-controls">
        <button onClick={() => setScale(s => s * 1.2)} title="Zoom In">+</button>
        <button onClick={() => setScale(s => s * 0.8)} title="Zoom Out">-</button>
        <button onClick={() => { setScale(0.9); setPan({ x: 0, y: 0 }); }} title="Fit View">⛶</button>
      </div>
    </div>
  );
}

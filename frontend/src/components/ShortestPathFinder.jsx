import React, { useState } from 'react';

export default function ShortestPathFinder({ nodesData, edgesData }) {
  const [source, setSource] = useState('PER_1001');
  const [target, setTarget] = useState('ORG_5002');
  const [pathResult, setPathResult] = useState(null);

  const tracePath = () => {
    if (!source || !target) return;

    const queue = [[source]];
    const visited = new Set([source]);
    let found = null;

    while (queue.length > 0) {
      const path = queue.shift();
      const curr = path[path.length - 1];

      if (curr === target) {
        found = path;
        break;
      }

      const neighbors = [];
      edgesData.forEach(e => {
        if (e.source === curr) neighbors.push(e.target);
        if (e.target === curr) neighbors.push(e.source);
      });

      for (const n of neighbors) {
        if (!visited.has(n)) {
          visited.add(n);
          queue.push([...path, n]);
        }
      }
    }

    setPathResult(found);
  };

  return (
    <div class="path-finder-panel glass-card">
      <div class="path-inputs">
        <div class="input-box">
          <label>Source Suspect / Entity ID:</label>
          <input type="text" value={source} onChange={(e) => setSource(e.target.value)} />
        </div>
        <div class="path-icon">➔</div>
        <div class="input-box">
          <label>Target Suspect / Entity ID:</label>
          <input type="text" value={target} onChange={(e) => setTarget(e.target.value)} />
        </div>
        <button class="btn btn-danger" onClick={tracePath}>Trace Association Chain</button>
      </div>

      <div class="path-results-area">
        {pathResult ? (
          <div>
            <div style={{ color: '#00e676', fontWeight: 'bold', marginBottom: '12px' }}>
              ✔ Association Chain Discovered ({pathResult.length - 1} Hops):
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {pathResult.map((id, index) => {
                const nodeObj = nodesData.find(n => n.id === id) || { name: id, label: 'Entity' };
                return (
                  <React.Fragment key={id}>
                    <div class="stat-badge" style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid #00f0ff', padding: '8px 12px', borderRadius: '6px' }}>
                      <span class="stat-label">{nodeObj.label}</span>
                      <span class="stat-value">{nodeObj.name} ({id})</span>
                    </div>
                    {index < pathResult.length - 1 && <span style={{ color: '#ff2a5f', fontWeight: 'bold' }}>➔ [LINK] ➔</span>}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ) : (
          <div class="placeholder-msg">Select a Source and Target entity to calculate shortest criminal link chain.</div>
        )}
      </div>
    </div>
  );
}

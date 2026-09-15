import React from 'react';

export default function SuspectDossier({ selectedNode, edgesData, onClose }) {
  if (!selectedNode) {
    return (
      <aside class="inspector-drawer">
        <div class="drawer-header">
          <h3>SUSPECT DOSSIER</h3>
        </div>
        <div class="drawer-body">
          <div class="drawer-placeholder">
            <svg viewBox="0 0 24 24" class="empty-icon"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
            <p>Click any node on the graph canvas or search result to inspect complete criminal history dossier and threat analytics.</p>
          </div>
        </div>
      </aside>
    );
  }

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

  const associations = edgesData.filter(e => e.source === selectedNode.id || e.target === selectedNode.id);

  return (
    <aside class="inspector-drawer">
      <div class="drawer-header">
        <h3>SUSPECT DOSSIER</h3>
        <button class="btn-icon" onClick={onClose}>&times;</button>
      </div>
      <div class="drawer-body">
        <div class="dossier-card">
          <div class="suspect-profile-header">
            <div class="suspect-avatar" style={{ background: getNodeColor(selectedNode.label) }}>
              {selectedNode.name ? selectedNode.name[0] : 'S'}
            </div>
            <div class="suspect-info">
              <h4>{selectedNode.name}</h4>
              <span class="entity-id">{selectedNode.id} &bull; {selectedNode.label}</span>
            </div>
          </div>

          <div class="threat-gauge-box">
            <div class="threat-score-num">{selectedNode.threat_score || 85} / 100</div>
            <div class="threat-score-label">Automated AI Threat Index</div>
          </div>

          <div class="dossier-section">
            <h5>Key Dossier Metadata</h5>
            <div class="detail-row"><span class="label">Entity Type:</span><span class="val">{selectedNode.label}</span></div>
            <div class="detail-row"><span class="label">Primary Alias:</span><span class="val">{selectedNode.alias || 'N/A'}</span></div>
            <div class="detail-row"><span class="label">Contact CDR:</span><span class="val">{selectedNode.phone || 'N/A'}</span></div>
            <div class="detail-row"><span class="label">Classification:</span><span class="val">{selectedNode.type || 'High Priority'}</span></div>
          </div>

          <div class="dossier-section">
            <h5>Known Associations ({associations.length})</h5>
            {associations.map((e, idx) => (
              <div key={idx} class="detail-row">
                <span class="label">{e.relationship}</span>
                <span class="val">{e.source === selectedNode.id ? e.target : e.source}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

import React, { useState } from 'react';

export default function Navbar({ nodesData, onSelectNode, isApiConnected }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filteredMatches = searchQuery.trim()
    ? nodesData.filter(n =>
        n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.alias && n.alias.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const handleSelect = (node) => {
    onSelectNode(node);
    setSearchQuery('');
    setDropdownOpen(false);
  };

  return (
    <header class="top-nav">
      <div class="brand">
        <div class="logo-badge">
          <svg viewBox="0 0 24 24" class="logo-icon"><path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-5.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.54-3.14 8.78-7 9.82-3.86-1.04-7-5.28-7-9.82V6.3l7-3.12zM12 7a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z"/></svg>
        </div>
        <div class="brand-text">
          <h1>NCRB FORENSIC NEXUS (REACT)</h1>
          <p>AI-Powered Criminal Network Intelligence System &bull; PS 26189</p>
        </div>
      </div>

      <div class="search-container">
        <div class="search-input-wrapper">
          <svg class="search-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <input
            type="text"
            placeholder="Search suspects, alias, phone, vehicle plate, location..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setDropdownOpen(true);
            }}
            onFocus={() => setDropdownOpen(true)}
          />
          <button class="btn btn-primary">Pivot Search</button>
        </div>

        {dropdownOpen && searchQuery.trim() !== '' && (
          <div class="search-dropdown">
            {filteredMatches.length > 0 ? (
              filteredMatches.map(m => (
                <div key={m.id} class="search-dropdown-item" onClick={() => handleSelect(m)}>
                  <div>
                    <div class="item-title">{m.name}</div>
                    <div class="item-sub">{m.id} &bull; {m.label} &bull; Threat Index: {m.threat_score || 50}</div>
                  </div>
                  <span class={`badge ${m.threat_score > 75 ? 'badge-high' : 'badge-med'}`}>{m.threat_score || 50}</span>
                </div>
              ))
            ) : (
              <div style={{ padding: '12px', color: '#8b949e', textAlign: 'center' }}>No matching suspect entities found</div>
            )}
          </div>
        )}
      </div>

      <div class="header-status">
        <div class="status-indicator">
          <span class="pulse-dot"></span>
          <span>{isApiConnected ? 'Neo4j Live API Connected' : 'React Sandbox Mode (Preloaded)'}</span>
        </div>
        <div class="stat-badge">
          <span class="stat-label">Suspect Entities</span>
          <span class="stat-value">{nodesData.length}</span>
        </div>
      </div>
    </header>
  );
}

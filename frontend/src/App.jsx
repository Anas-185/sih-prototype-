import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import NetworkTopology from './components/NetworkTopology';
import ShortestPathFinder from './components/ShortestPathFinder';
import EntityResolution from './components/EntityResolution';
import SuspectDossier from './components/SuspectDossier';

const INITIAL_NODES = [
  { id: 'PER_1001', name: 'Rashid Khan @Bhai', label: 'Person', threat_score: 92, type: 'Suspect', alias: 'Shadow King', phone: '+91 9876543210', x: 260, y: 200 },
  { id: 'PER_1002', name: 'Vikram Singh', label: 'Person', threat_score: 85, type: 'Suspect', alias: 'Vicky', phone: '+91 9812345678', x: 120, y: 310 },
  { id: 'PER_1003', name: 'Anil Deshmukh', label: 'Person', threat_score: 64, type: 'Suspect', alias: 'Operator', phone: '+91 9988776655', x: 420, y: 310 },
  { id: 'PHN_9001', name: '+91 9876543210', label: 'Phone', threat_score: 40, type: 'CDR', x: 140, y: 110 },
  { id: 'PHN_9002', name: '+91 9812345678', label: 'Phone', threat_score: 30, type: 'CDR', x: 10, y: 220 },
  { id: 'VEH_4001', name: 'MH-02-CD-9988 (SUV)', label: 'Vehicle', threat_score: 75, type: 'Vehicle', x: 380, y: 100 },
  { id: 'LOC_7001', name: 'Dharavi Safehouse B-4', label: 'Location', threat_score: 80, type: 'Hideout', x: 200, y: 400 },
  { id: 'ORG_5002', name: 'Apex Global Logistics', label: 'Organization', threat_score: 88, type: 'Front Org', x: 520, y: 200 },
  { id: 'PER_1004', name: 'Sanjay Dutt @Sanju', label: 'Person', threat_score: 78, type: 'Suspect', x: 250, y: 50 },
  { id: 'PHN_9003', name: '+91 9123456789', label: 'Phone', threat_score: 50, type: 'CDR', x: 100, y: 20 }
];

const INITIAL_EDGES = [
  { source: 'PER_1001', target: 'PHN_9001', relationship: 'USES_PHONE', weight: 0.9 },
  { source: 'PER_1002', target: 'PHN_9002', relationship: 'USES_PHONE', weight: 0.9 },
  { source: 'PER_1001', target: 'PER_1002', relationship: 'CALL_FREQUENT', weight: 0.85 },
  { source: 'PER_1001', target: 'VEH_4001', relationship: 'SPOTTED_IN', weight: 0.95 },
  { source: 'PER_1002', target: 'LOC_7001', relationship: 'FREQUENTS', weight: 0.75 },
  { source: 'PER_1001', target: 'ORG_5002', relationship: 'BENEFICIAL_OWNER', weight: 0.99 },
  { source: 'PER_1003', target: 'ORG_5002', relationship: 'DIRECTOR', weight: 0.70 },
  { source: 'PER_1004', target: 'PHN_9003', relationship: 'USES_PHONE', weight: 0.80 },
  { source: 'PER_1004', target: 'PER_1001', relationship: 'FINANCIAL_TRANSFER', weight: 0.92 }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('graph-tab');
  const [nodesData, setNodesData] = useState(INITIAL_NODES);
  const [edgesData, setEdgesData] = useState(INITIAL_EDGES);
  const [selectedNode, setSelectedNode] = useState(null);
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [threatFilter, setThreatFilter] = useState(0);
  const [isApiConnected, setIsApiConnected] = useState(false);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/graph')
      .then(res => res.json())
      .then(data => {
        if (data.nodes) setNodesData(data.nodes);
        if (data.edges) setEdgesData(data.edges);
        setIsApiConnected(true);
      })
      .catch(() => setIsApiConnected(false));
  }, []);

  return (
    <div class="app-container">
      <Navbar
        nodesData={nodesData}
        onSelectNode={(node) => setSelectedNode(node)}
        isApiConnected={isApiConnected}
      />

      <div class="main-body">
        <aside class="sidebar">
          <div class="sidebar-section">
            <h3>Intelligence Modules</h3>
            <div class="module-nav">
              <button
                class={`nav-btn ${activeTab === 'graph-tab' ? 'active' : ''}`}
                onClick={() => setActiveTab('graph-tab')}
              >
                Network Topology Visualizer
              </button>
              <button
                class={`nav-btn ${activeTab === 'path-tab' ? 'active' : ''}`}
                onClick={() => setActiveTab('path-tab')}
              >
                Shortest Path & Bottlenecks
              </button>
              <button
                class={`nav-btn ${activeTab === 'resolution-tab' ? 'active' : ''}`}
                onClick={() => setActiveTab('resolution-tab')}
              >
                Entity Resolution & Merges
              </button>
            </div>
          </div>

          <div class="sidebar-section">
            <h3>Graph Filters & Legend</h3>
            <div class="filter-group">
              <label>Filter Entity Type:</label>
              <select value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)}>
                <option value="ALL">All Entities</option>
                <option value="Person">Suspects / Persons</option>
                <option value="Phone">Phone Numbers / CDR</option>
                <option value="Vehicle">Vehicles</option>
                <option value="Location">Locations / Hideouts</option>
                <option value="Organization">Front Orgs / Syndicates</option>
              </select>
            </div>

            <div class="filter-group">
              <label>Threat Level Threshold: {threatFilter}+</label>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={threatFilter}
                onChange={(e) => setThreatFilter(parseInt(e.target.value))}
              />
            </div>

            <div class="entity-legend">
              <div class="legend-item"><span class="dot dot-person"></span> Suspect / Person</div>
              <div class="legend-item"><span class="dot dot-phone"></span> CDR / Phone</div>
              <div class="legend-item"><span class="dot dot-vehicle"></span> Vehicle</div>
              <div class="legend-item"><span class="dot dot-location"></span> Location</div>
              <div class="legend-item"><span class="dot dot-org"></span> Syndicate / Org</div>
            </div>
          </div>
        </aside>

        <main class="workspace">
          {activeTab === 'graph-tab' && (
            <section class="tab-content active">
              <div class="workspace-header">
                <div class="view-title">
                  <h2>Network Topology Canvas (React 18)</h2>
                  <span class="sub-title">Interactive Risk-Weighted Association Mapping</span>
                </div>
              </div>
              <NetworkTopology
                nodesData={nodesData}
                edgesData={edgesData}
                selectedNode={selectedNode}
                onSelectNode={(node) => setSelectedNode(node)}
                entityFilter={entityFilter}
                threatFilter={threatFilter}
              />
            </section>
          )}

          {activeTab === 'path-tab' && (
            <section class="tab-content active">
              <div class="workspace-header">
                <div class="view-title">
                  <h2>Shortest Path & Critical Bottleneck Finder</h2>
                  <span class="sub-title">Trace hidden intermediaries and communication bridges</span>
                </div>
              </div>
              <ShortestPathFinder nodesData={nodesData} edgesData={edgesData} />
            </section>
          )}

          {activeTab === 'resolution-tab' && (
            <section class="tab-content active">
              <div class="workspace-header">
                <div class="view-title">
                  <h2>Entity Resolution & Cluster Audit</h2>
                  <span class="sub-title">Deduplicated master entity records</span>
                </div>
              </div>
              <EntityResolution />
            </section>
          )}
        </main>

        <SuspectDossier
          selectedNode={selectedNode}
          edgesData={edgesData}
          onClose={() => setSelectedNode(null)}
        />
      </div>
    </div>
  );
}

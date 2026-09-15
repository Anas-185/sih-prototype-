import React from 'react';

const RESOLUTIONS = [
  { master_id: 'PER_1001', master_name: 'Rashid Khan', entity_type: 'Person', aliases: ['Shadow King', 'Bhai', 'R. Khan'], confidence: '98.5%' },
  { master_id: 'ORG_5002', master_name: 'Apex Global Logistics', entity_type: 'Organization', aliases: ['Apex Shell Co', 'AGL Ltd'], confidence: '94.2%' },
  { master_id: 'LOC_7001', master_name: 'Dharavi Sector 4 Hideout', entity_type: 'Location', aliases: ['Safehouse B-4', 'Loc-99'], confidence: '91.0%' }
];

export default function EntityResolution() {
  return (
    <div class="resolution-table-container glass-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Master Entity ID</th>
            <th>Resolved Master Name</th>
            <th>EntityType</th>
            <th>Merged Aliases / Records</th>
            <th>Resolution Confidence</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {RESOLUTIONS.map(res => (
            <tr key={res.master_id}>
              <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-cyan)' }}>{res.master_id}</td>
              <td style={{ fontWeight: 'bold' }}>{res.master_name}</td>
              <td>{res.entity_type}</td>
              <td>
                {res.aliases.map(a => (
                  <span key={a} style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', marginRight: '4px', fontSize: '11px' }}>
                    {a}
                  </span>
                ))}
              </td>
              <td><span class="badge badge-high">{res.confidence} Match</span></td>
              <td><button class="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }}>Inspect Master Record</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

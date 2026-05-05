import React, { useState } from 'react';
import axios from 'axios';

function LedgerPage({ chain = [], isValid, refresh }) {
  const [attackResult, setAttackResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runAttack = async (endpoint, payload = {}) => {
    setLoading(true);
    try {
      const res = await axios.post(`http://localhost:5000${endpoint}`, payload);
      setAttackResult(res.data);
      refresh();
    } catch (e) {
      setAttackResult({ m: "Attack failed", error: e.message });
    }
    setLoading(false);
  };

  return (
    <div className="page-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>⛓ Blokzincir Defteri</h2>
      </div>

      {/* Chain Status */}
      <div style={{
        padding: '15px',
        borderRadius: '12px',
        textAlign: 'center',
        color: 'white',
        fontWeight: 'bold',
        marginBottom: '20px',
        background: isValid ? '#22c55e' : '#ef4444'
      }}>
        {isValid ? "✅ ZİNCİR GEÇERLİ VE GÜVENLİ" : "❌ ZİNCİR BOZULDU!"}
      </div>

      {/* Blocks */}
      <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '15px', marginBottom: '30px' }}>
        {chain.map((block, i) => (
          <div key={i} style={{
            minWidth: '200px',
            padding: '15px',
            border: '2px solid ' + (isValid ? '#e2e8f0' : '#ef4444'),
            borderRadius: '12px',
            background: '#f8fafc'
          }}>
            <h4 style={{ margin: '0 0 10px 0' }}>Block #{block.index}</h4>
            <p style={{ fontSize: '11px', margin: '5px 0' }}><b>Hash:</b><br />{block.hash?.slice(0, 20)}...</p>
            <p style={{ margin: '5px 0' }}><b>Nonce:</b> {block.nonce}</p>
            <p style={{ margin: '5px 0' }}><b>TX:</b> {block.transactions?.length || 0}</p>
          </div>
        ))}
      </div>

      {/* Attack Simulations */}
      <div style={{ background: '#fef2f2', border: '2px solid #fecaca', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#dc2626' }}>🔴 Saldırı Simülasyon Merkezi</h3>
        <p style={{ fontSize: '13px', color: '#991b1b', marginBottom: '20px' }}>
          Ağ güvenliğini ve bütünlüğünü test etmek için çeşitli blok zinciri saldırılarını simüle edin.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <button
            onClick={() => runAttack('/attack/tamper-block', { block_index: 1 })}
            disabled={loading || chain.length < 2}
            style={{ background: '#dc2626', color: 'white', padding: '10px', fontSize: '12px', borderRadius: '8px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading || chain.length < 2 ? 0.5 : 1 }}
          >
            🔨 Block Tampering
          </button>

          <button
            onClick={() => {
              const sender = Object.keys(chain[0]?.state_snapshot || {})[0] || "";
              const receivers = Object.keys(chain[0]?.state_snapshot || {});
              runAttack('/attack/double-spend', {
                sender_public_key: sender,
                receiver1: receivers[1] || sender,
                receiver2: receivers[2] || sender,
                amount: 100
              });
            }}
            disabled={loading}
            style={{ background: '#ea580c', color: 'white', padding: '10px', fontSize: '12px', borderRadius: '8px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}
          >
            💸 Double-Spend
          </button>

          <button
            onClick={() => {
              const sender = Object.keys(chain[0]?.state_snapshot || {})[0] || "";
              const receiver = Object.keys(chain[0]?.state_snapshot || {})[1] || sender;
              runAttack('/attack/invalid-signature', {
                sender_public_key: sender,
                receiver_address: receiver,
                amount: 50
              });
            }}
            disabled={loading}
            style={{ background: '#ca8a04', color: 'white', padding: '10px', fontSize: '12px', borderRadius: '8px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}
          >
            ✍️ Invalid Signature
          </button>

          <button
            onClick={() => runAttack('/attack/51-percent')}
            disabled={loading || chain.length < 3}
            style={{ background: '#7c3aed', color: 'white', padding: '10px', fontSize: '12px', borderRadius: '8px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading || chain.length < 3 ? 0.5 : 1 }}
          >
            ⚡ 51% Attack
          </button>

          <button
            onClick={() => runAttack('/attack/fork-chain', { fork_at_block: Math.max(1, chain.length - 2) })}
            disabled={loading || chain.length < 3}
            style={{ background: '#0891b2', color: 'white', padding: '10px', fontSize: '12px', borderRadius: '8px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading || chain.length < 3 ? 0.5 : 1 }}
          >
            🍴 Fork Chain
          </button>
        </div>

        {/* Attack Result */}
        {attackResult && (
          <div style={{ marginTop: '20px', padding: '15px', background: 'white', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Saldırı Sonucu:</h4>
            <pre style={{ fontSize: '11px', background: '#f9fafb', padding: '10px', borderRadius: '6px', overflow: 'auto', margin: 0 }}>
              {JSON.stringify(attackResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default LedgerPage;
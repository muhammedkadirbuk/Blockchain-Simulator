import React, { useState } from 'react';
import axios from 'axios';

function WalletPage({ wallets, setWallets, activeWallet, setActiveWallet, refresh }) {
  const [copiedId, setCopiedId] = useState(null);

  const createWallet = async () => {
    const res = await axios.get('http://localhost:5000/wallet/new');
    const w = {
      id: Date.now(),
      name: `User ${wallets.length + 1}`,
      publicKey: res.data.public_key,
      privateKey: res.data.private_key
    };
    setWallets([...wallets, w]);
    if (!activeWallet) setActiveWallet(w);
    setTimeout(() => refresh(), 500);
  };

  const copyKey = (key, id) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="page-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>👛 Cüzdanlar</h2>
        <button onClick={createWallet} className="btn-primary">+ Yeni Kullanıcı</button>
      </div>
      <div className="wallets-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {wallets.map(w => (
          <div key={w.id} style={{
            padding: '20px',
            border: '2px solid ' + (activeWallet?.id === w.id ? '#6366f1' : '#e2e8f0'),
            borderRadius: '15px',
            background: activeWallet?.id === w.id ? '#f5f7ff' : 'white'
          }}>
            <h4 style={{ margin: '0 0 12px 0' }}>{w.name}</h4>

            {/* Public Key */}
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>PUBLIC KEY</label>
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <textarea
                readOnly
                value={w.publicKey}
                style={{ width: '100%', height: '60px', fontSize: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', resize: 'none', boxSizing: 'border-box', paddingRight: '70px' }}
              />
              <button
                onClick={() => copyKey(w.publicKey, `pub-${w.id}`)}
                style={{
                  position: 'absolute', top: '8px', right: '8px',
                  padding: '4px 10px', fontSize: '11px', borderRadius: '6px',
                  background: copiedId === `pub-${w.id}` ? '#22c55e' : '#6366f1',
                  color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600'
                }}>
                {copiedId === `pub-${w.id}` ? '✓ Kopyalandı' : '📋 Kopyala'}
              </button>
            </div>

            {/* Private Key */}
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>PRIVATE KEY</label>
            <div style={{ position: 'relative', marginBottom: '14px' }}>
              <textarea
                readOnly
                value={w.privateKey}
                style={{ width: '100%', height: '60px', fontSize: '10px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', resize: 'none', boxSizing: 'border-box', paddingRight: '70px' }}
              />
              <button
                onClick={() => copyKey(w.privateKey, `prv-${w.id}`)}
                style={{
                  position: 'absolute', top: '8px', right: '8px',
                  padding: '4px 10px', fontSize: '11px', borderRadius: '6px',
                  background: copiedId === `prv-${w.id}` ? '#22c55e' : '#f59e0b',
                  color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600'
                }}>
                {copiedId === `prv-${w.id}` ? '✓ Kopyalandı' : '📋 Kopyala'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setActiveWallet(w)} className="btn-primary" style={{ flex: 1 }}>Cüzdanı Seç</button>
              <button onClick={() => setWallets(wallets.filter(x => x.id !== w.id))} className="btn-danger">Cüzdanı Sil</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default WalletPage;

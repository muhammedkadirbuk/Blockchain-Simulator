import React, { useState, useCallback } from 'react';
import axios from 'axios';

function ContractsPage({ contracts, activeWallet, wallets, refresh }) {
  const [form, setForm] = useState({ cond: '', th: 0, payTo: '', amount: 0 });
  const [copiedId, setCopiedId] = useState(null);

  const copyKey = (key, id) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const setCond = useCallback((key) => {
    setForm(prev => ({ ...prev, cond: key }));
  }, []);

  const setPayTo = useCallback((key) => {
    setForm(prev => ({ ...prev, payTo: key }));
  }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!activeWallet) return alert("Cüzdan Seç!");
    await axios.post('http://localhost:5000/contracts/new', {
      creator: activeWallet.publicKey,
      condition_receiver: form.cond,
      threshold: Number(form.th),
      payout_receiver: form.payTo,
      payout_amount: Number(form.amount)
    });
    refresh();
    alert("Kontrat Yayınlandı!");
    setForm({ cond: '', th: 0, payTo: '', amount: 0 });
  };

  return (
    <div className="contracts-main-layout">
      <div className="content-left page-card">
        <h2>📜 Smart Contracts</h2>
        <form onSubmit={create}>
          {/* Şart adresi — dolu olduğunda yeşil border */}
          <div style={{ position: 'relative', marginBottom: '4px' }}>
            <input
              placeholder="Condition: If this address gets BTC..."
              value={form.cond}
              onChange={e => setForm(prev => ({ ...prev, cond: e.target.value }))}
              style={{ borderColor: form.cond ? '#22c55e' : undefined, marginBottom: 0 }}
            />
            {form.cond && (
              <span style={{ fontSize: '10px', color: '#22c55e', marginBottom: '10px', display: 'block' }}>
                ✓ {form.cond.substring(0, 30)}...
              </span>
            )}
          </div>
          <input
            type="number"
            placeholder="Threshold Amount"
            value={form.th || ''}
            onChange={e => setForm(prev => ({ ...prev, th: e.target.value }))}
          />
          {/* Ödeme adresi */}
          <div style={{ position: 'relative', marginBottom: '4px' }}>
            <input
              placeholder="Action: Pay to this address..."
              value={form.payTo}
              onChange={e => setForm(prev => ({ ...prev, payTo: e.target.value }))}
              style={{ borderColor: form.payTo ? '#6366f1' : undefined, marginBottom: 0 }}
            />
            {form.payTo && (
              <span style={{ fontSize: '10px', color: '#6366f1', marginBottom: '10px', display: 'block' }}>
                ✓ {form.payTo.substring(0, 30)}...
              </span>
            )}
          </div>
          <input
            type="number"
            placeholder="Payout Amount"
            value={form.amount || ''}
            onChange={e => setForm(prev => ({ ...prev, amount: e.target.value }))}
          />
          <button className="btn-primary">Deploy Contract</button>
        </form>

        <div style={{ marginTop: '30px' }}>
          <h3>Aktif Kontratlar</h3>
          {contracts.length === 0 && <p style={{ color: '#94a3b8', fontSize: '14px' }}>Henüz kontrat yok.</p>}
          {contracts.map((c, i) => (
            <div key={i} className="contract-status-card" style={{ borderLeft: '5px solid #6366f1', padding: '15px', background: '#f8fafc', borderRadius: '12px', marginBottom: '10px' }}>
              <p><b>Şart:</b> {c.condition_receiver.substring(0, 20)}... {'\u2265'} {c.threshold} BTC</p>
              <p><b>Eylem:</b> {c.payout_amount} BTC → {c.payout_receiver.substring(0, 20)}...</p>
              <button
                onClick={async () => { await axios.post('http://localhost:5000/contracts/delete', { index: i }); refresh(); }}
                style={{ background: '#fee2e2', color: '#ef4444', fontSize: '12px', padding: '5px 10px' }}>
                İptal Et
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Adres Defteri — kopyalama butonları ile */}
      <div className="content-right page-card">
        <h3>📋 Adres Defteri</h3>
        <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '15px' }}>
          Butona tıklayarak ilgili alana yapıştır veya 📋 ile kopyala.
        </p>
        {wallets.map(w => (
          <div key={w.id} className="address-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <strong>{w.name}</strong>
              <button
                onClick={() => copyKey(w.publicKey, w.id)}
                style={{
                  padding: '4px 10px', fontSize: '11px', borderRadius: '6px',
                  background: copiedId === w.id ? '#22c55e' : '#64748b',
                  color: 'white', border: 'none', cursor: 'pointer'
                }}>
                {copiedId === w.id ? '✓ Kopyalandı' : '📋 Kopyala'}
              </button>
            </div>
            <code style={{ fontSize: '9px', color: '#64748b', wordBreak: 'break-all', background: '#f1f5f9', padding: '6px', borderRadius: '6px', width: '100%', boxSizing: 'border-box' }}>
              {w.publicKey.substring(0, 60)}...
            </code>
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              {/* useCallback ile sarılmış fonksiyonlar — closure bug yok */}
              <button
                onClick={() => setCond(w.publicKey)}
                className="btn-primary"
                style={{ padding: '6px 12px', fontSize: '11px', flex: 1 }}>
                📥 Kontratın Şartına Ekle
              </button>
              <button
                onClick={() => setPayTo(w.publicKey)}
                className="btn-primary"
                style={{ padding: '6px 12px', fontSize: '11px', flex: 1, background: '#8b5cf6' }}>
                💸 Ödeme Alanına Ekle
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default ContractsPage;

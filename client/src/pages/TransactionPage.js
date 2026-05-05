import React, { useState } from 'react';
import axios from 'axios';

function sanitizeKey(key) {
  if (!key) return key;
  key = key.trim();
  const header = '-----BEGIN PUBLIC KEY-----';
  const footer = '-----END PUBLIC KEY-----';
  if (!key.includes(header)) return key;
  key = key.substring(key.indexOf(header));
  if (key.includes(footer)) {
    key = key.substring(0, key.indexOf(footer) + footer.length);
  }
  const lines = key.split('\n').map(l => l.trim()).filter(l => l);
  let body = '';
  for (const line of lines) {
    if (!line.startsWith('-----')) {
      body += line.replace(/\s/g, '');
    }
  }
  const result = [header];
  for (let i = 0; i < body.length; i += 64) {
    result.push(body.substring(i, i + 64));
  }
  result.push(footer);
  return result.join('\n');
}

function TransactionPage({ myWallet, wallets, refresh }) {
  const [tx, setTx] = useState({ receiver: '', amount: '' });

  const send = async (e) => {
    e.preventDefault();
    if (!myWallet) return alert("Cüzdan seç!");
    try {
      await axios.post('http://localhost:5000/transactions/new', {
        sender_public_key: sanitizeKey(myWallet.publicKey),
        receiver_address: sanitizeKey(tx.receiver),
        amount: Number(tx.amount),
        signature: "mock"
      });
      alert("Havuza eklendi!");
      refresh();
    } catch (e) { alert("Bakiye yetersiz!"); }
  };

  const mine = async () => {
    await axios.get('http://localhost:5000/mine');
    refresh();
    alert("Blok Kazıldı!");
  };

  return (
    <div className="page-card">
      <h2>💸 Transfer</h2>
      <form onSubmit={send}>
        <input
          placeholder="Receiver Public Key"
          value={tx.receiver}
          onChange={(e) => setTx({ ...tx, receiver: e.target.value })}
        />
        <input
          type="number"
          placeholder="Amount"
          value={tx.amount}
          onChange={(e) => setTx({ ...tx, amount: e.target.value })}
        />
        <button className="btn-success">Havuza Gönder</button>
      </form>

      {/* Adres defteri */}
      {wallets && wallets.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>📋 Adres Defteri</h3>
          {wallets.filter(w => w.publicKey !== myWallet?.publicKey).map(w => (
            <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px', marginBottom: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>{w.name}</span>
              <button
                onClick={() => setTx({ ...tx, receiver: w.publicKey })}
                className="btn-primary"
                style={{ padding: '5px 12px', fontSize: '11px' }}>
                Seç
              </button>
            </div>
          ))}
        </div>
      )}

      <button onClick={mine} style={{ marginTop: '30px', background: '#f59e0b', width: '100%', color: 'white' }}>⛏ Blok Kaz</button>
    </div>
  );
}
export default TransactionPage;
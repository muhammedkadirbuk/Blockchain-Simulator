import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import WalletPage from './pages/WalletPage';
import TransactionPage from './pages/TransactionPage';
import ContractsPage from './pages/ContractsPage';
import LedgerPage from './pages/LedgerPage';
import './App.css';

function App() {
  const [blockchain, setBlockchain] = useState({ chain: [], state: {}, contracts: [] });
  const [wallets, setWallets] = useState(JSON.parse(localStorage.getItem('wallets')) || []);
  const [activeWallet, setActiveWallet] = useState(JSON.parse(localStorage.getItem('activeWallet')) || null);
  const [isValid, setIsValid] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/chain');
      setBlockchain(res.data);
      const v = await axios.get('http://localhost:5000/validate');
      setIsValid(v.data.valid);
      return res.data.state;
    } catch (e) {
      console.error("Bağlantı hatası");
      return null;
    }
  };
  const syncWalletsWithBackend = async () => {
    const savedWallets = JSON.parse(localStorage.getItem('wallets')) || [];
    if (savedWallets.length === 0) return;

    setSyncing(true);
    try {
      const res = await axios.get('http://localhost:5000/chain');
      const backendState = res.data.state;

      // Backend'de olmayan cüzdanları tespit et
      const missing = savedWallets.filter(w => !(w.publicKey in backendState));

      if (missing.length > 0) {
        console.warn(`${missing.length} cüzdan backend'de bulunamadı, temizleniyor...`);
        const validWallets = savedWallets.filter(w => w.publicKey in backendState);

        setWallets(validWallets);

        // Aktif cüzdan silinmişse sıfırla
        const savedActive = JSON.parse(localStorage.getItem('activeWallet'));
        if (savedActive && !(savedActive.publicKey in backendState)) {
          setActiveWallet(validWallets.length > 0 ? validWallets[0] : null);
        }

        if (validWallets.length === 0) {
          console.info("Tüm cüzdanlar temizlendi. Yeni cüzdan oluşturun.");
        }
      }

      setBlockchain(res.data);
      const v = await axios.get('http://localhost:5000/validate');
      setIsValid(v.data.valid);
    } catch (e) {
      console.error("Sync hatası:", e);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => { localStorage.setItem('wallets', JSON.stringify(wallets)); }, [wallets]);
  useEffect(() => { localStorage.setItem('activeWallet', JSON.stringify(activeWallet)); }, [activeWallet]);
  useEffect(() => { syncWalletsWithBackend(); }, []);

  return (
    <Router>
      <div className="app-container">
        <nav className="sidebar">
          <div className="logo">Blockchain Simulator</div>
          <ul>
            <li><Link to="/">👛 Cüzdanlar</Link></li>
            <li><Link to="/send">💸 Transfer</Link></li>
            <li><Link to="/contracts">📜 Kontratlar</Link></li>
            <li><Link to="/ledger">⛓ Zincir</Link></li>
          </ul>

          {syncing && (
            <div style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(99,102,241,0.15)', marginBottom: '10px', fontSize: '12px', color: '#a5b4fc' }}>
              🔄 Backend ile sync ediliyor...
            </div>
          )}

          {!syncing && wallets.length === 0 && (
            <div style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', marginBottom: '10px', fontSize: '12px', color: '#fca5a5' }}>
              ⚠️ Cüzdan bulunamadı. Wallets sayfasından yeni cüzdan oluşturun.
            </div>
          )}

          {activeWallet && (
            <div className="active-profile">
              <p>👤 <b>{activeWallet.name}</b></p>
              <p className="bal">{blockchain.state[activeWallet.publicKey] || 0} BTC</p>
            </div>
          )}
        </nav>
        <main className="content">
          <Routes>
            <Route path="/" element={<WalletPage wallets={wallets} setWallets={setWallets} activeWallet={activeWallet} setActiveWallet={setActiveWallet} refresh={fetchData} />} />
            <Route path="/send" element={<TransactionPage myWallet={activeWallet} wallets={wallets} refresh={fetchData} />} />
            <Route path="/contracts" element={<ContractsPage contracts={blockchain.contracts} refresh={fetchData} activeWallet={activeWallet} wallets={wallets} />} />
            <Route path="/ledger" element={<LedgerPage chain={blockchain.chain} isValid={isValid} refresh={fetchData} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
export default App;
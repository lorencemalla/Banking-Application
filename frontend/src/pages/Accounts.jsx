import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { accountAPI } from '../services/api';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newType, setNewType] = useState('SAVINGS');
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchAccounts(); }, []);

  const fetchAccounts = async () => {
    try {
      const res = await accountAPI.getAll();
      setAccounts(res.data?.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      await accountAPI.create({ accountType: newType });
      setMsg('Account created successfully!');
      setShowCreate(false);
      fetchAccounts();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) { setMsg(err.response?.data?.message || 'Failed to create account'); }
  };

  if (loading) return <div className="loading-spinner" />;

  return (
    <div>
      <Header title="Accounts" subtitle="Manage all your bank accounts" />
      {msg && <div className="success-message">{msg}</div>}
      <div style={{ marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Account</button>
      </div>
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Create New Account</h2>
            <div className="form-group">
              <label>Account Type</label>
              <select className="form-control" value={newType} onChange={e => setNewType(e.target.value)}>
                <option value="SAVINGS">Savings</option>
                <option value="CURRENT">Current</option>
                <option value="FIXED_DEPOSIT">Fixed Deposit</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate}>Create Account</button>
            </div>
          </div>
        </div>
      )}
      <div className="stats-grid">
        {accounts.map(acc => (
          <div key={acc.id} className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span className="badge badge-primary">{acc.accountType}</span>
              <span className={`badge ${acc.active ? 'badge-success' : 'badge-danger'}`}>{acc.active ? 'Active' : 'Inactive'}</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 4 }}>Account Number</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: 1, marginBottom: 16 }}>{acc.accountNumber}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 4 }}>Balance</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--green)' }}>₹{parseFloat(acc.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <div style={{ marginTop: 16, display: 'flex', gap: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>{acc.branchName}</span><span>•</span><span>{acc.ifscCode}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Accounts;

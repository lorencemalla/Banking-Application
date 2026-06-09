import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { transactionAPI } from '../services/api';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    transactionAPI.getHistory().then(r => setTransactions(r.data?.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.direction === filter.toUpperCase());

  if (loading) return <div className="loading-spinner" />;

  return (
    <div>
      <Header title="Transactions" subtitle="Complete transaction history" />
      <div className="tabs" style={{ marginBottom: 20 }}>
        {['all', 'credit', 'debit'].map(f => (
          <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div className="glass-card">
        {filtered.length === 0 ? (
          <div className="empty-state"><div className="icon">📄</div><p>No transactions found</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>ID</th><th>Type</th><th>From</th><th>To</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {filtered.map(tx => (
                <tr key={tx.id}>
                  <td style={{ fontWeight: 500, fontSize: '0.85rem' }}>{tx.transactionId}</td>
                  <td><span className="badge badge-info">{tx.type}</span></td>
                  <td>{tx.fromAccount || '—'}</td>
                  <td>{tx.toAccount || '—'}</td>
                  <td className={tx.direction === 'CREDIT' ? 'amount-credit' : 'amount-debit'}>
                    {tx.direction === 'CREDIT' ? '+' : '-'}₹{parseFloat(tx.amount).toLocaleString('en-IN')}
                  </td>
                  <td><span className={`badge ${tx.status === 'COMPLETED' ? 'badge-success' : tx.status === 'FAILED' ? 'badge-danger' : 'badge-warning'}`}>{tx.status}</span></td>
                  <td>{new Date(tx.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Transactions;

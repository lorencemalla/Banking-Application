import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { loanAPI } from '../services/api';

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [tab, setTab] = useState('my-loans');
  const [form, setForm] = useState({ loanType: 'Personal', amount: '', interestRate: '10.5', termMonths: '12' });
  const [emiResult, setEmiResult] = useState(null);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { loanAPI.getAll().then(r => setLoans(r.data?.data || [])).catch(() => {}); }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loanAPI.apply(form);
      setMsg({ text: 'Loan application submitted!', type: 'success' });
      loanAPI.getAll().then(r => setLoans(r.data?.data || []));
      setForm({ ...form, amount: '' });
    } catch (err) { setMsg({ text: err.response?.data?.message || 'Failed', type: 'error' }); }
    finally { setLoading(false); }
  };

  const calcEMI = async () => {
    if (!form.amount || !form.interestRate || !form.termMonths) return;
    try {
      const res = await loanAPI.calculateEMI(form.amount, form.interestRate, form.termMonths);
      setEmiResult(res.data?.data);
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <Header title="Loan Services" subtitle="Apply for loans and track EMIs" />
      <div className="tabs">
        {['my-loans', 'apply', 'emi-calculator'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'my-loans' ? 'My Loans' : t === 'apply' ? 'Apply' : 'EMI Calculator'}
          </button>
        ))}
      </div>
      {msg.text && <div className={msg.type === 'success' ? 'success-message' : 'error-message'}>{msg.text}</div>}

      {tab === 'my-loans' && (
        <div className="glass-card">
          {loans.length === 0 ? <div className="empty-state"><div className="icon">🏦</div><p>No loans found</p></div> : (
            <table className="data-table">
              <thead><tr><th>Loan ID</th><th>Type</th><th>Amount</th><th>EMI</th><th>Term</th><th>Status</th></tr></thead>
              <tbody>
                {loans.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 500 }}>{l.loanId}</td>
                    <td>{l.loanType}</td>
                    <td>₹{parseFloat(l.amount).toLocaleString('en-IN')}</td>
                    <td>₹{parseFloat(l.emi).toLocaleString('en-IN')}</td>
                    <td>{l.termMonths} months</td>
                    <td><span className={`badge ${l.status === 'APPROVED' ? 'badge-success' : l.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>{l.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'apply' && (
        <div className="glass-card" style={{ maxWidth: 600 }}>
          <form onSubmit={handleApply}>
            <div className="form-group">
              <label>Loan Type</label>
              <select className="form-control" value={form.loanType} onChange={e => setForm({ ...form, loanType: e.target.value })}>
                {['Personal', 'Home', 'Education', 'Vehicle', 'Business'].map(t => <option key={t} value={t}>{t} Loan</option>)}
              </select>
            </div>
            <div className="form-group"><label>Amount (₹)</label><input type="number" className="form-control" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required min="1000" /></div>
            <div className="grid-2">
              <div className="form-group"><label>Interest Rate (%)</label><input type="number" step="0.1" className="form-control" value={form.interestRate} onChange={e => setForm({ ...form, interestRate: e.target.value })} required /></div>
              <div className="form-group"><label>Term (Months)</label><input type="number" className="form-control" value={form.termMonths} onChange={e => setForm({ ...form, termMonths: e.target.value })} required min="1" /></div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>{loading ? 'Submitting...' : 'Apply for Loan'}</button>
          </form>
        </div>
      )}

      {tab === 'emi-calculator' && (
        <div className="glass-card" style={{ maxWidth: 600 }}>
          <div className="form-group"><label>Loan Amount (₹)</label><input type="number" className="form-control" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
          <div className="grid-2">
            <div className="form-group"><label>Interest Rate (%)</label><input type="number" step="0.1" className="form-control" value={form.interestRate} onChange={e => setForm({ ...form, interestRate: e.target.value })} /></div>
            <div className="form-group"><label>Term (Months)</label><input type="number" className="form-control" value={form.termMonths} onChange={e => setForm({ ...form, termMonths: e.target.value })} /></div>
          </div>
          <button className="btn btn-primary" onClick={calcEMI}>Calculate EMI</button>
          {emiResult && (
            <div className="stats-grid" style={{ marginTop: 24 }}>
              <div className="stat-card"><div className="stat-value">₹{parseFloat(emiResult.emi).toLocaleString('en-IN')}</div><div className="stat-label">Monthly EMI</div></div>
              <div className="stat-card"><div className="stat-value">₹{parseFloat(emiResult.totalPayment).toLocaleString('en-IN')}</div><div className="stat-label">Total Payment</div></div>
              <div className="stat-card"><div className="stat-value">₹{parseFloat(emiResult.totalInterest).toLocaleString('en-IN')}</div><div className="stat-label">Total Interest</div></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Loans;

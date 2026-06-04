import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { adminAPI } from '../services/api';
import { RiUserLine, RiBankLine, RiExchangeFundsLine, RiCustomerService2Line } from 'react-icons/ri';

const Admin = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [tab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [dashRes, usersRes, ticketsRes] = await Promise.all([
        adminAPI.getDashboard(), adminAPI.getUsers(), adminAPI.getTickets()
      ]);
      setStats(dashRes.data?.data || {});
      setUsers(usersRes.data?.data || []);
      setTickets(ticketsRes.data?.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleToggleUser = async (id) => {
    await adminAPI.toggleUserStatus(id);
    fetchData();
  };

  const handleResolve = async (id) => {
    const response = prompt('Enter resolution response:');
    if (response) {
      await adminAPI.resolveTicket(id, { response });
      fetchData();
    }
  };

  if (loading) return <div className="loading-spinner" />;

  return (
    <div>
      <Header title="Admin Panel" subtitle="Manage users, transactions, and system" />
      <div className="tabs">
        {['dashboard', 'users', 'tickets'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <div className="stats-grid">
          {[
            { icon: <RiUserLine />, value: stats.totalUsers, label: 'Total Users', color: '#818cf8', bg: 'rgba(99,102,241,0.15)' },
            { icon: <RiBankLine />, value: stats.totalAccounts, label: 'Total Accounts', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
            { icon: <RiExchangeFundsLine />, value: stats.totalTransactions, label: 'Total Transactions', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
            { icon: <RiCustomerService2Line />, value: stats.openTickets, label: 'Open Tickets', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div className="stat-value">{s.value ?? 0}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div className="glass-card">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>{u.firstName} {u.lastName}</td>
                  <td>{u.email}</td>
                  <td><span className="badge badge-primary">{u.role}</span></td>
                  <td><span className={`badge ${u.enabled ? 'badge-success' : 'badge-danger'}`}>{u.enabled ? 'Active' : 'Disabled'}</span></td>
                  <td><button className={`btn btn-sm ${u.enabled ? 'btn-danger' : 'btn-success'}`} onClick={() => handleToggleUser(u.id)}>{u.enabled ? 'Disable' : 'Enable'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'tickets' && (
        <div className="glass-card">
          <table className="data-table">
            <thead><tr><th>Ticket</th><th>User</th><th>Subject</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 500 }}>{t.ticketNumber}</td>
                  <td>{t.userName}</td>
                  <td>{t.subject}</td>
                  <td><span className={`badge ${t.status === 'RESOLVED' ? 'badge-success' : 'badge-warning'}`}>{t.status}</span></td>
                  <td>{t.status !== 'RESOLVED' && <button className="btn btn-sm btn-primary" onClick={() => handleResolve(t.id)}>Resolve</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Admin;

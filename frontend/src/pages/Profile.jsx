import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { profileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    profileAPI.get().then(r => { setProfile(r.data?.data); setForm(r.data?.data || {}); }).catch(() => {});
  }, []);

  const handleUpdate = async () => {
    try {
      const res = await profileAPI.update(form);
      setProfile(res.data?.data);
      setEditing(false);
      setMsg({ text: 'Profile updated!', type: 'success' });
      setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    } catch (err) { setMsg({ text: err.response?.data?.message || 'Failed', type: 'error' }); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { setMsg({ text: 'Passwords do not match', type: 'error' }); return; }
    try {
      await profileAPI.changePassword({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
      setMsg({ text: 'Password changed! Please login again.', type: 'success' });
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => logout(), 2000);
    } catch (err) { setMsg({ text: err.response?.data?.message || 'Failed', type: 'error' }); }
  };

  if (!profile) return <div className="loading-spinner" />;

  return (
    <div>
      <Header title="Profile & Settings" subtitle="Manage your account settings" />
      <div className="tabs">
        <button className={`tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>Profile</button>
        <button className={`tab ${tab === 'password' ? 'active' : ''}`} onClick={() => setTab('password')}>Change Password</button>
        <button className={`tab ${tab === 'nominee' ? 'active' : ''}`} onClick={() => setTab('nominee')}>Nominee</button>
      </div>
      {msg.text && <div className={msg.type === 'success' ? 'success-message' : 'error-message'}>{msg.text}</div>}

      {tab === 'profile' && (
        <div className="glass-card" style={{ maxWidth: 600 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 className="section-title" style={{ marginBottom: 0 }}>Personal Information</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditing(!editing)}>{editing ? 'Cancel' : 'Edit'}</button>
          </div>
          {editing ? (
            <>
              <div className="grid-2">
                <div className="form-group"><label>First Name</label><input className="form-control" value={form.firstName || ''} onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
                <div className="form-group"><label>Last Name</label><input className="form-control" value={form.lastName || ''} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Phone</label><input className="form-control" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="form-group"><label>Address</label><input className="form-control" value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
              <button className="btn btn-primary" onClick={handleUpdate}>Save Changes</button>
            </>
          ) : (
            <div>
              {[['Name', `${profile.firstName} ${profile.lastName}`], ['Email', profile.email], ['Phone', profile.phone || '—'], ['Address', profile.address || '—'], ['Role', profile.role], ['Member Since', new Date(profile.createdAt).toLocaleDateString('en-IN')]].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-glass)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{label}</span>
                  <span style={{ fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'password' && (
        <div className="glass-card" style={{ maxWidth: 500 }}>
          <form onSubmit={handleChangePassword}>
            <div className="form-group"><label>Current Password</label><input type="password" className="form-control" value={pwForm.oldPassword} onChange={e => setPwForm({ ...pwForm, oldPassword: e.target.value })} required /></div>
            <div className="form-group"><label>New Password</label><input type="password" className="form-control" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} required /></div>
            <div className="form-group"><label>Confirm Password</label><input type="password" className="form-control" value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} required /></div>
            <button type="submit" className="btn btn-primary">Change Password</button>
          </form>
        </div>
      )}

      {tab === 'nominee' && (
        <div className="glass-card" style={{ maxWidth: 500 }}>
          <div className="form-group"><label>Nominee Name</label><input className="form-control" value={form.nomineeName || ''} onChange={e => setForm({ ...form, nomineeName: e.target.value })} /></div>
          <div className="form-group"><label>Nominee Relation</label><input className="form-control" placeholder="E.g., Spouse, Parent" value={form.nomineeRelation || ''} onChange={e => setForm({ ...form, nomineeRelation: e.target.value })} /></div>
          <button className="btn btn-primary" onClick={handleUpdate}>Save Nominee</button>
        </div>
      )}
    </div>
  );
};

export default Profile;

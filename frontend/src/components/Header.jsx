import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import { RiNotification3Line } from 'react-icons/ri';

const Header = ({ title, subtitle }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    notificationAPI.getUnreadCount().then(res => {
      setUnreadCount(res.data?.data || 0);
    }).catch(() => {});
  }, []);

  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'U';
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="header-actions">
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: 8 }}>{dateStr}</span>
        <button className="notification-btn">
          <RiNotification3Line />
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
        </button>
        <div className="user-avatar">{initials}</div>
      </div>
    </div>
  );
};

export default Header;

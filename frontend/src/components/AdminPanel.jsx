import { useEffect, useState } from 'react';
import { approveUser, fetchPending, fetchAdminStats, fetchAllUsers, clearUserCollection } from '../api';

export default function AdminPanel() {
  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingError, setPendingError] = useState('');
  const [usersError, setUsersError] = useState('');
  const [activeTab, setActiveTab] = useState('approvals');

  const loadPending = async () => {
    try {
      const result = await fetchPending();
      setPending(result.pending);
      setPendingError('');
    } catch (err) {
      setPendingError(err.message);
    }
  };

  const loadStats = async () => {
    try {
      const result = await fetchAdminStats();
      setStats(result);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const result = await fetchAllUsers();
      setUsers(result.users);
      setUsersError('');
    } catch (err) {
      setUsersError(err.message);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      await Promise.all([loadPending(), loadStats(), loadUsers()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  const handleApproval = async (userId, approve) => {
    try {
      await approveUser(userId, approve);
      setPending((current) => current.filter((user) => user.id !== userId));
      if (approve) {
        await loadUsers();
      }
    } catch (err) {
      setPendingError(err.message);
    }
  };

  const handleClearCollection = async (userId) => {
    if (!globalThis.confirm(`Are you sure you want to delete this user's entire collection?`)) return;
    
    try {
      await clearUserCollection(userId);
      alert('Collection cleared successfully!');
      await loadUsers();
    } catch (err) {
      setUsersError(err.message);
    }
  };

  return (
    <div className="card-panel">
      <div className="panel-title">
        <div>
          <h1 className="title-1">Admin Dashboard</h1>
          <p>Manage users, approvals, and settings.</p>
        </div>
      </div>

      {loading ? (
        <div className="loader">Loading admin dashboard…</div>
      ) : (
        <>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8 }}>
            <button
              onClick={() => setActiveTab('approvals')}
              style={{
                padding: '8px 16px',
                background: activeTab === 'approvals' ? 'rgba(64, 128, 255, 0.2)' : 'transparent',
                border: 'none',
                color: '#f4f7ff',
                cursor: 'pointer',
                fontSize: '14px',
                borderBottom: activeTab === 'approvals' ? '2px solid #4080ff' : 'none'
              }}
            >
              Approvals ({pending.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              style={{
                padding: '8px 16px',
                background: activeTab === 'users' ? 'rgba(64, 128, 255, 0.2)' : 'transparent',
                border: 'none',
                color: '#f4f7ff',
                cursor: 'pointer',
                fontSize: '14px',
                borderBottom: activeTab === 'users' ? '2px solid #4080ff' : 'none'
              }}
            >
              Users
            </button>

          </div>

          {/* Stats */}
          {stats && (
            <div className="card-panel" style={{ marginBottom: 24, background: 'rgba(64, 128, 255, 0.1)', borderColor: 'rgba(64, 128, 255, 0.3)' }}>
              <h3 style={{ marginTop: 0 }}>System Stats</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                <div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>Total Users</div>
                  <div style={{ fontSize: '24px', fontWeight: '700' }}>{stats.totalUsers}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>Approved Users</div>
                  <div style={{ fontSize: '24px', fontWeight: '700' }}>{stats.approvedUsers}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>Total Cards</div>
                  <div style={{ fontSize: '24px', fontWeight: '700' }}>{stats.totalCards}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>Collections</div>
                  <div style={{ fontSize: '24px', fontWeight: '700' }}>{stats.totalCollections}</div>
                </div>
              </div>
            </div>
          )}

          {/* Approvals Tab */}
          {activeTab === 'approvals' && (
            <>
              {pendingError && <div className="alert" style={{ color: '#ff6b6b', marginBottom: 16 }}>{pendingError}</div>}
              {pending.length === 0 ? (
                <div className="alert">No pending registrations at the moment.</div>
              ) : (
                <div className="grid" style={{ gap: 16 }}>
                  {pending.map((user) => (
                    <div key={user.id} className="card-item">
                      <div className="card-meta">
                        <h3>{user.username}</h3>
                        <p>{user.email}</p>
                        <p>Registered {new Date(user.createdAt).toLocaleString()}</p>
                        <div className="row" style={{ marginTop: 12 }}>
                          <button className="primary" onClick={() => handleApproval(user.id, true)}>Approve</button>
                          <button className="secondary" onClick={() => handleApproval(user.id, false)}>Deny</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <>
              {usersError && <div className="alert" style={{ color: '#ff6b6b', marginBottom: 16 }}>{usersError}</div>}
              {users.length === 0 ? (
                <div className="alert">No users found.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                        <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Username</th>
                        <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Email</th>
                        <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Status</th>
                        <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Joined</th>
                        <th style={{ textAlign: 'center', padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '12px' }}>{user.username}</td>
                          <td style={{ padding: '12px' }}>{user.email}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ 
                              background: user.approved ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)',
                              color: user.approved ? '#4caf50' : '#ff9800',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}>
                              {user.approved ? 'Approved' : 'Pending'}
                            </span>
                          </td>
                          <td style={{ padding: '12px', fontSize: '12px', opacity: 0.7 }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <button
                              onClick={() => handleClearCollection(user.id)}
                              style={{
                                padding: '6px 12px',
                                background: 'rgba(244, 67, 54, 0.2)',
                                color: '#f44336',
                                border: '1px solid #f44336',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Clear Collection
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}


        </>
      )}
    </div>
  );
}

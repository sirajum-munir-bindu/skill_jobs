import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User, Award, CheckCircle, Clock, XCircle, LayoutDashboard, Lock } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [ambassadorInfo, setAmbassadorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '' });
  const [updateStatus, setUpdateStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const data = localStorage.getItem('user');
    if (data) {
      const parsedUser = JSON.parse(data);
      setUser(parsedUser);
      setEditForm({ name: parsedUser.name, email: parsedUser.email, password: '' });
      // Fetch ambassador application
      fetch('http://localhost:5000/api/ambassadors')
        .then(res => res.json())
        .then(ambs => {
          const myApp = ambs.find(a => a.email === parsedUser.email);
          if (myApp) setAmbassadorInfo(myApp);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateStatus('Updating...');
    try {
      const payload = {
        id: user.id || user._id,
        name: editForm.name,
        email: editForm.email,
        password: editForm.password || undefined
      };
      const res = await fetch('http://localhost:5000/api/auth/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setUpdateStatus('Profile updated successfully!');
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsEditing(false);
        setEditForm(prev => ({ ...prev, password: '' })); // clear password
      } else {
        setUpdateStatus(data.detail || data.message || 'Update failed.');
      }
    } catch (err) {
      console.error(err);
      setUpdateStatus('Failed to connect to server.');
    }
  };

  if (loading) return <div className="loading-screen">Loading Dashboard...</div>;

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Approved': return <CheckCircle size={24} className="status-icon approved" />;
      case 'Rejected': return <XCircle size={24} className="status-icon rejected" />;
      default: return <Clock size={24} className="status-icon pending" />;
    }
  };

  return (
    <div className="ambassador-dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-brand">
          <Award size={28} className="brand-icon" />
          <span>Ambassador Portal</span>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
            style={{ width: '100%', textAlign: 'left', border: 'none', background: activeTab === 'overview' ? 'rgba(67, 97, 238, 0.1)' : 'transparent', cursor: 'pointer' }}
          >
            <LayoutDashboard size={20} />
            Overview
          </button>
          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            style={{ width: '100%', textAlign: 'left', border: 'none', background: activeTab === 'settings' ? 'rgba(67, 97, 238, 0.1)' : 'transparent', cursor: 'pointer' }}
          >
            <User size={20} />
            Profile Settings
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-main">
        <header className="dashboard-header">
          <h2>Welcome, {user.name.split(' ')[0]}!</h2>
          <div className="user-profile">
            <div className="avatar-placeholder">
              <User size={20} />
            </div>
            <span className="user-name">{user.name}</span>
          </div>
        </header>

        <div className="dashboard-content">
          {activeTab === 'overview' ? (
            ambassadorInfo ? (
              <>
                <div className="status-banner">
                  <div className="status-info">
                    {getStatusIcon(ambassadorInfo.status)}
                    <div>
                      <h3>Application Status: <span className={`status-text ${ambassadorInfo.status.toLowerCase()}`}>{ambassadorInfo.status}</span></h3>
                      <p>
                        {ambassadorInfo.status === 'Approved' 
                          ? "Congratulations! You are an active ambassador. Check out your resources below." 
                          : ambassadorInfo.status === 'Rejected'
                          ? "Unfortunately, your application was not accepted at this time."
                          : "Your application is currently under review by our team."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="dashboard-grid">
                  <div className="dashboard-card info-card">
                    <h3>Your Ambassador Profile</h3>
                    <div className="info-list">
                      <div className="info-item">
                        <span className="info-label">University</span>
                        <span className="info-value">{ambassadorInfo.university}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Role Applied For</span>
                        <span className="info-value">{ambassadorInfo.role || 'Campus Ambassador'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Applied On</span>
                        <span className="info-value">{ambassadorInfo.createdAt ? new Date(ambassadorInfo.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="dashboard-card resources-card">
                    <h3>Resources</h3>
                    {ambassadorInfo.status === 'Approved' ? (
                      <div className="resources-list">
                        <a href="#" className="resource-link">Ambassador Guidelines PDF</a>
                        <a href="#" className="resource-link">Marketing Materials Toolkit</a>
                        <a href="#" className="resource-link">Submit Event Report</a>
                      </div>
                    ) : (
                      <div className="locked-resources">
                        <Lock size={32} className="lock-icon" />
                        <p>Resources will be unlocked once your application is approved.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="dashboard-card">
                <h3>Ambassador Program</h3>
                <p style={{ color: 'var(--saas-text-muted)', marginBottom: '1.5rem' }}>You have not applied for the Ambassador program yet.</p>
                <Link to="/ambassador" className="btn btn-primary">Apply Now</Link>
              </div>
            )
          ) : (
            <div className="profile-settings-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', maxWidth: '600px' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>Profile Settings</h3>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                    Edit Profile
                  </button>
                )}
              </div>
              <form onSubmit={handleUpdateProfile} className="dashboard-card" style={{ maxWidth: '600px' }}>
                 {updateStatus && (
                   <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px', background: updateStatus.includes('success') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: updateStatus.includes('success') ? '#10b981' : '#ef4444' }}>
                     {updateStatus}
                   </div>
                 )}
                 <div style={{ marginBottom: '1.5rem' }}>
                   <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--saas-text-muted)', fontSize: '0.9rem' }}>Full Name</label>
                   <input type="text" value={isEditing ? editForm.name : user.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} disabled={!isEditing} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--saas-border)', background: isEditing ? 'white' : '#f8fafc', color: 'var(--saas-text)', fontSize: '1rem' }} />
                 </div>
                 <div style={{ marginBottom: '1.5rem' }}>
                   <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--saas-text-muted)', fontSize: '0.9rem' }}>Email Address</label>
                   <input type="email" value={isEditing ? editForm.email : user.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} disabled={!isEditing} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--saas-border)', background: isEditing ? 'white' : '#f8fafc', color: 'var(--saas-text)', fontSize: '1rem' }} />
                 </div>
                 {isEditing && (
                   <div style={{ marginBottom: '1.5rem' }}>
                     <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--saas-text-muted)', fontSize: '0.9rem' }}>New Password (Optional)</label>
                     <input type="password" value={editForm.password} onChange={(e) => setEditForm({...editForm, password: e.target.value})} placeholder="Leave blank to keep current" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--saas-border)', background: 'white', color: 'var(--saas-text)', fontSize: '1rem' }} />
                   </div>
                 )}
                 {!isEditing && (
                   <div style={{ marginBottom: '1.5rem' }}>
                     <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--saas-text-muted)', fontSize: '0.9rem' }}>Account Role</label>
                     <input type="text" value={user.role} disabled style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--saas-border)', background: '#f8fafc', color: 'var(--saas-text)', fontSize: '1rem' }} />
                   </div>
                 )}
                 {isEditing ? (
                   <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--saas-border)' }}>
                     <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>Save Changes</button>
                     <button type="button" onClick={() => { setIsEditing(false); setEditForm({ name: user.name, email: user.email, password: '' }); setUpdateStatus(''); }} className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem', background: '#f1f5f9', color: '#64748b' }}>Cancel</button>
                   </div>
                 ) : (
                   <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--saas-border)' }}>
                     <p style={{ fontSize: '0.85rem', color: 'var(--saas-text-muted)' }}>Keep your profile updated. An accurate email is important for communications.</p>
                   </div>
                 )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

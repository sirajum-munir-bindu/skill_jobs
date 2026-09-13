import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LogOut, User, Award, CheckCircle, Clock, XCircle, LayoutDashboard, Lock,
  TrendingUp, Target, Zap, Activity, ShieldCheck, DollarSign, Copy, Check,
  ExternalLink, FileText, Calendar, Sparkles, AlertCircle, ClipboardList,
  Plus, Edit2, Trash2, Phone, Mail, Search, School, Menu, X, Home
} from 'lucide-react';
import './Dashboard.css';
import { API_BASE_URL } from '../config/api';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [ambassadorInfo, setAmbassadorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'workreport' | 'settings'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '' });
  const [updateStatus, setUpdateStatus] = useState('');
  const [copied, setCopied] = useState(false);

  // Performance KPI Metrics (Operational Numbers - all 0 initially)
  const [metrics, setMetrics] = useState({
    todayTarget: 0,
    todayAchieved: 0,
    monthlyTarget: 0,
    monthlyAchieved: 0,
    registered: 0,
    verified: 0,
    rejected: 0,
    qaa: 0,
    incentivePerQAA: 0,
    daysRemaining: 0,
    performanceCycle: '',
    announcement: ''
  });

  // Work Reports State (Account Submissions)
  const [workReports, setWorkReports] = useState([]);
  const [reportSearchQuery, setReportSearchQuery] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [reportForm, setReportForm] = useState({
    name: '',
    email: '',
    phone: '',
    institution: ''
  });
  const [reportToast, setReportToast] = useState('');

  const navigate = useNavigate();

  const fetchWorkReports = async (userEmail) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/work-reports?ambassadorEmail=${encodeURIComponent(userEmail)}`);
      if (res.ok) {
        const data = await res.json();
        setWorkReports(data);
      }
    } catch (err) {
      console.error('Error fetching work reports:', err);
    }
  };

  useEffect(() => {
    const data = localStorage.getItem('user');
    if (data) {
      const parsedUser = JSON.parse(data);
      setUser(parsedUser);
      setEditForm({ name: parsedUser.name, email: parsedUser.email, password: '' });
      
      // Fetch latest users (for dynamic permissions), ambassador application, configs, and work reports
      Promise.all([
        fetch(`${API_BASE_URL}/api/users`),
        fetch(`${API_BASE_URL}/api/ambassadors`),
        fetch(`${API_BASE_URL}/api/configs`),
        fetch(`${API_BASE_URL}/api/work-reports?ambassadorEmail=${encodeURIComponent(parsedUser.email)}`)
      ])
        .then(async ([usersRes, ambsRes, configsRes, reportsRes]) => {
          let currentPermissions = parsedUser.permissions || [];
          if (usersRes.ok) {
            const allUsers = await usersRes.json();
            const myDbUser = allUsers.find(u => u.email === parsedUser.email || (parsedUser.id && (u.id === parsedUser.id || u._id === parsedUser.id)));
            if (myDbUser) {
              currentPermissions = myDbUser.permissions || [];
              const merged = { ...parsedUser, ...myDbUser };
              setUser(merged);
              localStorage.setItem('user', JSON.stringify(merged));
            }
          }

          if (ambsRes.ok) {
            const ambs = await ambsRes.json();
            const myApp = ambs.find(a => a.email === parsedUser.email);
            if (myApp) setAmbassadorInfo(myApp);
          }
          if (configsRes && configsRes.ok) {
            const configs = await configsRes.json();
            if (configs.ambassadorMetrics) {
              setMetrics(prev => ({ ...prev, ...configs.ambassadorMetrics }));
            }
          }
          if (reportsRes && reportsRes.ok) {
            const reports = await reportsRes.json();
            setWorkReports(reports);
          }

          // Initial tab selection based on dynamic permissions
          const isSuperAdmin = parsedUser.role === 'Super Admin';
          const canPerf = isSuperAdmin || currentPermissions.includes('ambassador_performance');
          const canWork = isSuperAdmin || currentPermissions.includes('ambassador_workreport');

          if (canPerf) {
            setActiveTab('overview');
          } else if (canWork) {
            setActiveTab('workreport');
          } else {
            setActiveTab('settings');
          }

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

  const userRole = user?.role;
  const userPermissions = Array.isArray(user?.permissions) ? user.permissions : [];
  const isSuperAdmin = userRole === 'Super Admin';

  const canViewPerformance = isSuperAdmin || userPermissions.includes('ambassador_performance');
  const canViewWorkReport = isSuperAdmin || userPermissions.includes('ambassador_workreport');
  const hasAnyAmbassadorAccess = canViewPerformance || canViewWorkReport;

  // Auto-switch tab if current tab is not accessible
  useEffect(() => {
    if (!loading && !hasAnyAmbassadorAccess && activeTab !== 'settings') {
      setActiveTab('settings');
    }
  }, [hasAnyAmbassadorAccess, loading, activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleCopyReferral = () => {
    const refLink = `https://skill.jobs/register?ref=${encodeURIComponent(user?.email || 'ambassador')}`;
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const showToastMsg = (msg) => {
    setReportToast(msg);
    setTimeout(() => setReportToast(''), 3000);
  };

  // Work Report CRUD Handlers
  const handleOpenAddReportModal = () => {
    setCurrentReport(null);
    setReportForm({
      name: '',
      email: '',
      phone: '',
      institution: ambassadorInfo?.university || ''
    });
    setShowReportModal(true);
  };

  const handleOpenEditReportModal = (report) => {
    setCurrentReport(report);
    setReportForm({
      name: report.name || '',
      email: report.email || '',
      phone: report.phone || '',
      institution: report.institution || ''
    });
    setShowReportModal(true);
  };

  const handleReportFormSubmit = async (e) => {
    e.preventDefault();
    const reportId = currentReport ? (currentReport._id || currentReport.id) : null;
    const url = currentReport 
      ? `${API_BASE_URL}/api/work-reports/${reportId}`
      : `${API_BASE_URL}/api/work-reports`;
    const method = currentReport ? 'PUT' : 'POST';

    try {
      const payload = currentReport 
        ? reportForm 
        : { ...reportForm, ambassadorEmail: user.email, ambassadorName: user.name };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowReportModal(false);
        showToastMsg(currentReport ? 'Account record updated successfully!' : 'New account registered to your report!');
        fetchWorkReports(user.email);
      } else {
        const data = await res.json();
        alert(data.detail || data.message || 'Operation failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error saving work report.');
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this registered account entry?')) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/work-reports/${reportId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        showToastMsg('Account entry deleted.');
        fetchWorkReports(user.email);
      } else {
        alert('Failed to delete report.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting work report entry.');
    }
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
      const res = await fetch(`${API_BASE_URL}/api/auth/update`, {
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

  if (loading) return <div className="loading-screen">Loading Ambassador Dashboard...</div>;

  // DYNAMIC OPERATIONAL PERFORMANCE CALCULATIONS
  // Derived directly from the Work Reports created by this ambassador
  const todayDateStr = new Date().toDateString();
  const todayCreatedCount = workReports.filter(r => new Date(r.createdAt).toDateString() === todayDateStr).length;
  const totalCreatedCount = workReports.length;

  const approvedReports = workReports.filter(r => r.status === 'Approved' || r.status === 'Accepted');
  const pendingReports = workReports.filter(r => !r.status || r.status === 'Pending');
  const rejectedReports = workReports.filter(r => r.status === 'Rejected');

  const approvedCount = approvedReports.length;
  const pendingCount = pendingReports.length;
  const rejectedCount = rejectedReports.length;

  const todayApprovedCount = approvedReports.filter(r => new Date(r.createdAt).toDateString() === todayDateStr).length;

  const todayAchieved = todayCreatedCount;
  const todayTarget = metrics.todayTarget || 0;

  const monthlyAchieved = totalCreatedCount;
  const monthlyTarget = metrics.monthlyTarget || (todayTarget * 30);

  const remainingAccounts = Math.max(0, monthlyTarget - monthlyAchieved);
  const daysRemaining = metrics.daysRemaining || 0;
  const requiredRunRate = daysRemaining > 0 ? Math.ceil(remainingAccounts / daysRemaining) : 0;
  const monthlyPct = monthlyTarget > 0 ? Math.round((monthlyAchieved / monthlyTarget) * 100) : 0;
  const todayPct = todayTarget > 0 ? Math.round((todayAchieved / todayTarget) * 100) : 0;
  
  // Incentive per account set by Admin (e.g. ৳50, ৳100)
  // Balance is ONLY added for admin-approved accounts
  const incentiveRate = metrics.incentivePerQAA || 0;
  const estimatedIncentive = (approvedCount * incentiveRate).toLocaleString();
  const pendingIncentive = (pendingCount * incentiveRate).toLocaleString();

  // Filtered work reports for search
  const filteredReports = workReports.filter(r => {
    const q = reportSearchQuery.toLowerCase();
    return (
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.email && r.email.toLowerCase().includes(q)) ||
      (r.phone && r.phone.toLowerCase().includes(q)) ||
      (r.institution && r.institution.toLowerCase().includes(q))
    );
  });


  return (
    <div className="ambassador-dashboard">
      {/* Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          className="dashboard-sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo-wrap">
            <img src="/logo.png" alt="Skill Jobs" className="brand-logo-img" />
          </div>
          <div className="brand-titles">
            <span className="brand-main">Skill Jobs</span>
            <span className="brand-sub">Ambassador Portal</span>
          </div>
          {/* Mobile Close Button */}
          <button 
            className="sidebar-close-btn" 
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {canViewPerformance && (
            <button 
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
            >
              <LayoutDashboard size={19} />
              <span>Performance</span>
            </button>
          )}
          
          {canViewWorkReport && (
            <button 
              className={`nav-item ${activeTab === 'workreport' ? 'active' : ''}`}
              onClick={() => { setActiveTab('workreport'); setSidebarOpen(false); }}
            >
              <ClipboardList size={19} />
              <span>Work Report</span>
              {workReports.length > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  background: '#0284c7',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '10px'
                }}>
                  {workReports.length}
                </span>
              )}
            </button>
          )}

          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
          >
            <User size={19} />
            <span>Profile & Settings</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <div className="dashboard-main">
        {/* Top Header */}
        <header className="dashboard-header">
          <div className="header-left-group">
            {/* Hamburger Toggle Button for Mobile/Tablet */}
            <button 
              className="dashboard-hamburger-btn" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle navigation menu"
            >
              <Menu size={22} />
            </button>

            <div className="header-user-welcome">
              <h2>Welcome, {user.name.split(' ')[0]}!</h2>
              <p className="header-subtitle">
                {ambassadorInfo?.university || 'Campus Ambassador Hub'} • {user.role || 'Active Ambassador'}
              </p>
            </div>
          </div>

          <div className="header-right-actions">
            <Link to="/" className="btn-header-homepage" title="Go to Homepage">
              <Home size={16} />
              <span>Homepage</span>
            </Link>

            <div className="user-profile">
              <div className="avatar-placeholder">
                {user.name[0].toUpperCase()}
              </div>
              <div className="user-text-info">
                <span className="user-name">{user.name}</span>
                <span className="user-role-badge">Ambassador</span>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {!hasAnyAmbassadorAccess && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.06), rgba(6, 182, 212, 0.08))',
              border: '1px solid rgba(2, 132, 199, 0.2)',
              borderRadius: '16px',
              padding: '1.75rem',
              marginBottom: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              flexWrap: 'wrap'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(2, 132, 199, 0.12)',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Clock size={24} />
              </div>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <h4 style={{ margin: '0 0 0.25rem', color: '#0f172a', fontSize: '1.1rem', fontWeight: '800' }}>
                  Ambassador Access Awaiting Admin Approval
                </h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Your account is registered. An administrator must grant you Ambassador Portal access from the Admin Panel before your Performance Hub and Work Report will unlock.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'overview' ? (

            canViewPerformance ? (
              <div className="performance-overview-wrapper">
                
                {/* CORE NUMBERS MATRIX (KPI CARDS) */}
                <div className="kpi-matrix-grid">
                
                {/* 1. Today's Performance */}
                <div className="kpi-card">
                  <div className="kpi-card-header">
                    <div>
                      <span className="kpi-tag blue">Daily Goal</span>
                      <h3 className="kpi-title">Today's Performance</h3>
                    </div>
                    <div className="kpi-header-icon blue">
                      <Activity size={22} />
                    </div>
                  </div>

                  <div className="kpi-metric-row">
                    <div className="metric-box">
                      <span className="metric-lbl">Target</span>
                      <span className="metric-val">{todayTarget}</span>
                    </div>
                    <div className="metric-divider">/</div>
                    <div className="metric-box">
                      <span className="metric-lbl">Achieved</span>
                      <span className="metric-val highlight blue">{todayAchieved}</span>
                    </div>
                  </div>

                  <div className="kpi-mini-progress">
                    <div className="kpi-mini-progress-track">
                      <div className="kpi-mini-progress-fill blue" style={{ width: `${todayPct}%` }} />
                    </div>
                    <span className="kpi-subtext">
                      {todayPct >= 100 ? '🎉 Today’s goal completed!' : `${Math.max(0, todayTarget - todayAchieved)} more account needed today (${todayPct}%)`}
                    </span>
                  </div>
                </div>

                {/* 2. Monthly Performance */}
                <div className="kpi-card">
                  <div className="kpi-card-header">
                    <div>
                      <span className="kpi-tag purple">Cycle Milestone</span>
                      <h3 className="kpi-title">Monthly Performance</h3>
                    </div>
                    <div className="kpi-header-icon purple">
                      <TrendingUp size={22} />
                    </div>
                  </div>

                  <div className="kpi-metric-row">
                    <div className="metric-box">
                      <span className="metric-lbl">Target</span>
                      <span className="metric-val">{monthlyTarget}</span>
                    </div>
                    <div className="metric-divider">/</div>
                    <div className="metric-box">
                      <span className="metric-lbl">Achieved</span>
                      <span className="metric-val highlight purple">{monthlyAchieved}</span>
                    </div>
                  </div>

                  <div className="kpi-mini-progress">
                    <div className="kpi-mini-progress-track">
                      <div className="kpi-mini-progress-fill purple" style={{ width: `${monthlyPct}%` }} />
                    </div>
                    <span className="kpi-subtext">
                      <strong>Performance %: </strong> <span className="text-purple-bold">{monthlyPct}%</span>
                    </span>
                  </div>
                </div>

                {/* 3. Earnings & Incentive */}
                <div className="kpi-card earnings-card">
                  <div className="kpi-card-header">
                    <div>
                      <span className="kpi-tag emerald">Compensation</span>
                      <h3 className="kpi-title">Approved Balance</h3>
                    </div>
                    <div className="kpi-header-icon emerald">
                      <Award size={22} />
                    </div>
                  </div>

                  <div className="earnings-main-box">
                    <span className="earnings-label">Approved Balance</span>
                    <div className="earnings-val-wrap">
                      <span className="earnings-currency">৳</span>
                      <span className="earnings-amount">{estimatedIncentive}</span>
                    </div>
                    <span className="earnings-badge">৳{incentiveRate} / Approved Account</span>
                  </div>

                  <div className="earnings-payout-info">
                    <CheckCircle size={14} className="text-green" />
                    <span>
                      {approvedCount} approved account{approvedCount !== 1 ? 's' : ''}
                      {pendingCount > 0 ? ` • ৳${pendingIncentive} pending admin approval` : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '3rem 2rem',
                textAlign: 'center',
                maxWidth: '600px',
                margin: '2rem auto'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'rgba(245, 158, 11, 0.12)',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem'
                }}>
                  <Lock size={28} />
                </div>
                <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a', fontWeight: '800' }}>Performance Hub Access Restricted</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 1.5rem' }}>
                  Your account is registered, but the <strong>Ambassador Performance Hub</strong> module has not been enabled yet by the Super Administrator.
                </p>
                <div style={{ display: 'inline-flex', gap: '0.75rem' }}>
                  <button onClick={() => setActiveTab('settings')} className="btn btn-secondary" style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>
                    View Profile
                  </button>
                  <Link to="/" style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', background: '#0284c7', color: '#ffffff', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Home size={15} /> Go to Homepage
                  </Link>
                </div>
              </div>
            )
          ) : activeTab === 'workreport' ? (
            canViewWorkReport ? (
              /* WORK REPORT TAB */
              <div className="work-report-wrapper">
              {/* Toast Notification */}
              {reportToast && (
                <div style={{
                  background: '#ecfdf5',
                  border: '1px solid #10b981',
                  color: '#065f46',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '10px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <CheckCircle size={18} color="#10b981" />
                  <span>{reportToast}</span>
                </div>
              )}

              {/* 1. TOP KPI SUMMARY BOXES */}
              <div className="work-report-summary-grid">
                <div className="work-report-kpi-box">
                  <div className="work-report-kpi-icon blue">
                    <Target size={24} />
                  </div>
                  <div className="work-report-kpi-data">
                    <span className="work-report-kpi-label">Total Submitted</span>
                    <span className="work-report-kpi-val">{totalCreatedCount}</span>
                  </div>
                </div>

                <div className="work-report-kpi-box">
                  <div className="work-report-kpi-icon green">
                    <Zap size={24} />
                  </div>
                  <div className="work-report-kpi-data">
                    <span className="work-report-kpi-label">Approved Accounts</span>
                    <span className="work-report-kpi-val" style={{ color: '#059669' }}>{approvedCount}</span>
                  </div>
                </div>

                <div className="work-report-kpi-box">
                  <div className="work-report-kpi-icon amber">
                    <Clock size={24} />
                  </div>
                  <div className="work-report-kpi-data">
                    <span className="work-report-kpi-label">Pending Approval</span>
                    <span className="work-report-kpi-val" style={{ color: '#d97706' }}>{pendingCount}</span>
                  </div>
                </div>

                <div className="work-report-kpi-box">
                  <div className="work-report-kpi-icon purple">
                    <DollarSign size={24} />
                  </div>
                  <div className="work-report-kpi-data">
                    <span className="work-report-kpi-label">Approved Balance</span>
                    <span className="work-report-kpi-val">৳{estimatedIncentive}</span>
                  </div>
                </div>

                <div className="work-report-kpi-box">
                  <div className="work-report-kpi-icon gold">
                    <Award size={24} />
                  </div>
                  <div className="work-report-kpi-data">
                    <span className="work-report-kpi-label">Incentive Rate</span>
                    <span className="work-report-kpi-val" style={{ color: '#b45309' }}>
                      ৳{incentiveRate} <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>/ account</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. MAIN WORK REPORT DATA CARD */}
              <div className="work-report-main-card">
                <div className="work-report-card-header">
                  <div>
                    <h3>Registered Accounts Report</h3>
                    <p>Track all registered student candidate accounts you have created. Balance will only be credited when an admin accepts the account.</p>
                  </div>
                  <div className="work-report-toolbar">
                    <div className="work-report-search-wrap">
                      <Search className="work-report-search-icon" size={16} />
                      <input 
                        type="text" 
                        className="work-report-search-input"
                        placeholder="Search by name, email, phone..."
                        value={reportSearchQuery}
                        onChange={(e) => setReportSearchQuery(e.target.value)}
                      />
                    </div>
                    <button className="btn-add-report" onClick={handleOpenAddReportModal}>
                      <Plus size={18} />
                      <span>Submit New Account</span>
                    </button>
                  </div>
                </div>

                {filteredReports.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                    <ClipboardList size={42} style={{ color: '#cbd5e1', marginBottom: '0.75rem' }} />
                    <h4 style={{ margin: '0 0 0.4rem', color: '#334155', fontWeight: '750' }}>No account entries found</h4>
                    <p style={{ margin: '0 0 1.25rem', fontSize: '0.88rem' }}>
                      {reportSearchQuery ? 'No accounts match your search filter.' : 'Click "Submit New Account" above to log each student or user you create.'}
                    </p>
                    {!reportSearchQuery && (
                      <button className="btn-add-report" onClick={handleOpenAddReportModal}>
                        <Plus size={16} /> Submit First Account
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="work-report-table-wrapper">
                    <table className="work-report-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Candidate Name</th>
                          <th>Email Address</th>
                          <th>Phone Number</th>
                          <th>Institution / Campus</th>
                          <th>Submitted Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReports.map((report, idx) => {
                          const st = report.status || 'Pending';
                          const isApproved = st === 'Approved' || st === 'Accepted';
                          const isRejected = st === 'Rejected';

                          return (
                            <tr key={report._id || report.id || idx}>
                              <td style={{ color: '#94a3b8', fontWeight: '600', width: '30px' }}>
                                {idx + 1}
                              </td>
                              <td>
                                <div className="report-candidate-name">
                                  <div className="report-avatar">
                                    {(report.name || 'U')[0].toUpperCase()}
                                  </div>
                                  <span>{report.name}</span>
                                </div>
                              </td>
                              <td>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#0284c7' }}>
                                  <Mail size={13} color="#94a3b8" />
                                  {report.email}
                                </span>
                              </td>
                              <td>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#334155' }}>
                                  <Phone size={13} color="#94a3b8" />
                                  {report.phone}
                                </span>
                              </td>
                              <td>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#475569' }}>
                                  <School size={13} color="#94a3b8" />
                                  {report.institution || 'Dhaka University'}
                                </span>
                              </td>
                              <td style={{ color: '#64748b', fontSize: '0.82rem' }}>
                                {report.createdAt ? new Date(report.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Today'}
                              </td>
                              <td>
                                {isApproved ? (
                                  <span className="report-status-badge approved">
                                    <Check size={12} /> Accepted
                                  </span>
                                ) : isRejected ? (
                                  <span className="report-status-badge rejected">
                                    <X size={12} /> Rejected
                                  </span>
                                ) : (
                                  <span className="report-status-badge pending">
                                    <Clock size={12} /> Pending Review
                                  </span>
                                )}
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                  <button 
                                    className="report-action-btn edit"
                                    title="Edit Account"
                                    onClick={() => handleOpenEditReportModal(report)}
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button 
                                    className="report-action-btn delete"
                                    title="Delete Account"
                                    onClick={() => handleDeleteReport(report._id || report.id)}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '3rem 2rem',
                textAlign: 'center',
                maxWidth: '600px',
                margin: '2rem auto'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'rgba(245, 158, 11, 0.12)',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem'
                }}>
                  <Lock size={28} />
                </div>
                <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a', fontWeight: '800' }}>Work Report Access Restricted</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 1.5rem' }}>
                  The <strong>Ambassador Work Report Submission</strong> module has not been enabled yet for your account by the Super Administrator.
                </p>
                <div style={{ display: 'inline-flex', gap: '0.75rem' }}>
                  <button onClick={() => setActiveTab('settings')} className="btn btn-secondary" style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>
                    View Profile
                  </button>
                  <Link to="/" style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', background: '#0284c7', color: '#ffffff', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Home size={15} /> Go to Homepage
                  </Link>
                </div>
              </div>
            )
          ) : (
            /* PROFILE SETTINGS TAB */
            <div className="profile-settings-container">
              <div className="settings-header-wrap">
                <h3>Ambassador Profile Settings</h3>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="btn btn-outline">
                    Edit Profile
                  </button>
                )}
              </div>

              <form onSubmit={handleUpdateProfile} className="dashboard-card settings-card">
                {updateStatus && (
                  <div className={`status-alert-box ${updateStatus.includes('successfully') ? 'success' : 'error'}`}>
                    {updateStatus}
                  </div>
                )}

                <div className="form-group-wrap">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    value={isEditing ? editForm.name : user.name} 
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
                    disabled={!isEditing} 
                    required 
                  />
                </div>

                <div className="form-group-wrap">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    value={isEditing ? editForm.email : user.email} 
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})} 
                    disabled={!isEditing} 
                    required 
                  />
                </div>

                {isEditing && (
                  <div className="form-group-wrap">
                    <label>New Password (Optional)</label>
                    <input 
                      type="password" 
                      value={editForm.password} 
                      onChange={(e) => setEditForm({...editForm, password: e.target.value})} 
                      placeholder="Leave blank to keep current password" 
                    />
                  </div>
                )}

                {!isEditing && (
                  <div className="form-group-wrap">
                    <label>Account Role</label>
                    <input type="text" value={user.role || 'Campus Ambassador'} disabled />
                  </div>
                )}

                {isEditing ? (
                  <div className="settings-btn-actions">
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                    <button 
                      type="button" 
                      onClick={() => { 
                        setIsEditing(false); 
                        setEditForm({ name: user.name, email: user.email, password: '' }); 
                        setUpdateStatus(''); 
                      }} 
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="settings-footer-info">
                    <p>Keep your profile contact details accurate for incentive disbursements.</p>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>

      {/* WORK REPORT SUBMISSION / EDIT MODAL */}
      {showReportModal && (
        <div className="report-modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="report-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="report-modal-header">
              <h3>{currentReport ? 'Edit Registered Account' : 'Submit New Registered Account'}</h3>
              <button className="report-modal-close" onClick={() => setShowReportModal(false)}>&times;</button>
            </div>
            <div className="report-modal-body">
              <form onSubmit={handleReportFormSubmit}>
                <div className="report-form-group">
                  <label>Full Name *</label>
                  <input 
                    type="text" 
                    value={reportForm.name} 
                    onChange={(e) => setReportForm({ ...reportForm, name: e.target.value })} 
                    placeholder="e.g. Mahir Asif" 
                    required 
                  />
                </div>

                <div className="report-form-group">
                  <label>Email Address *</label>
                  <input 
                    type="email" 
                    value={reportForm.email} 
                    onChange={(e) => setReportForm({ ...reportForm, email: e.target.value })} 
                    placeholder="e.g. student@university.edu.bd" 
                    required 
                  />
                </div>

                <div className="report-form-group">
                  <label>Phone Number *</label>
                  <input 
                    type="text" 
                    value={reportForm.phone} 
                    onChange={(e) => setReportForm({ ...reportForm, phone: e.target.value })} 
                    placeholder="e.g. 01712345678" 
                    required 
                  />
                </div>

                <div className="report-form-group">
                  <label>Institution / Campus (Optional)</label>
                  <input 
                    type="text" 
                    value={reportForm.institution} 
                    onChange={(e) => setReportForm({ ...reportForm, institution: e.target.value })} 
                    placeholder="e.g. University of Dhaka" 
                  />
                </div>

                <div className="report-modal-actions">
                  <button type="button" className="report-btn-cancel" onClick={() => setShowReportModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="report-btn-submit">
                    {currentReport ? 'Save Changes' : 'Submit Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;


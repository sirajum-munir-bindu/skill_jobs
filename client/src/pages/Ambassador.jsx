import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Zap, Shield, Users, Award, Briefcase, ChevronDown, Sparkles, Send, GraduationCap, Calendar, TrendingUp, RefreshCw, Camera, X } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { DEFAULT_AMBASSADOR_CONFIG } from '../utils/defaultConfigs';
import './Ambassador.css';

const renderBenefitIcon = (iconName) => {
  switch (iconName) {
    case 'Shield': return <Shield />;
    case 'Users': return <Users />;
    case 'Award': return <Award />;
    case 'Zap': return <Zap />;
    case 'Briefcase': return <Briefcase />;
    default: return <Award />;
  }
};

const Ambassador = () => {
  const [configs, setConfigs] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_site_configs');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.ambassador) return parsed;
      }
    } catch {}
    return DEFAULT_AMBASSADOR_CONFIG;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ university: '', reason: '', image: '', phone: '' });
  const [status, setStatus] = useState('');
  const [activeUniversity, setActiveUniversity] = useState(() => {
    const campuses = DEFAULT_AMBASSADOR_CONFIG?.ambassador?.campuses || [];
    return campuses[0]?.key || 'DIU';
  });
  const [openFaqIdx, setOpenFaqIdx] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const navigate = useNavigate();

  const fetchConfigs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/configs`);
      if (res.ok) {
        const data = await res.json();
        if (data?.ambassador) {
          setConfigs(data);
          try {
            localStorage.setItem('cached_site_configs', JSON.stringify(data));
          } catch {}
          const campuses = data.ambassador.campuses || [];
          if (campuses.length > 0 && !activeUniversity) {
            setActiveUniversity(campuses[0].key);
          }
        }
      }
    } catch (err) {
      console.warn('Backend server offline or unreachable, using high-fidelity fallback data:', err);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const ambassadorData = configs?.ambassador || {};
  const campusList = ambassadorData.campuses || [];
  const currentCampus = campusList.find(c => c.key === activeUniversity) || campusList[0] || null;

  const handleImageFile = (file) => {
    if (file.size > 2 * 1024 * 1024) {
      alert('Profile image size should be under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData(prev => ({ ...prev, image: e.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Submitting application...');
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setStatus('Please login first to apply.');
        return;
      }
      const user = JSON.parse(userStr);

      const payload = {
        name: user.name,
        email: user.email,
        university: formData.university,
        reason: formData.reason,
        phone: formData.phone,
        image: formData.image || ''
      };

      const response = await fetch(`${API_BASE_URL}/api/ambassador/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setStatus('Application submitted successfully!');
        setFormData({ university: '', reason: '', image: '' });
        setTimeout(() => {
          setShowApplyModal(false);
          setStatus('');
        }, 2500);
      } else {
        setStatus('Failed to submit application. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setStatus('Failed to connect to the server. Please try again later.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyForUniversity = (uniKey) => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate(`/login?redirect=${encodeURIComponent('/ambassador')}`);
      return;
    }
    const campus = campusList.find(c => c.key === uniKey);
    if (campus) {
      setFormData(prev => ({ ...prev, university: campus.fullName, reason: '', image: '' }));
    } else {
      setFormData(prev => ({ ...prev, university: '', reason: '', image: '' }));
    }
    setStatus('');
    setShowApplyModal(true);
  };

  const toggleFaq = (idx) => {
    setOpenFaqIdx(openFaqIdx === idx ? null : idx);
  };

  if (loading) {
    return (
      <div className="ambassador-page">
        <div className="ambassador-bg-grid"></div>
        <div className="ambassador-bg-blur orb-1"></div>
        <div className="ambassador-bg-blur orb-2"></div>
        <div className="ambassador-loading-container">
          <div className="ambassador-loader-box">
            <div className="reload-icon-container">
              <RefreshCw className="reload-spin-icon" size={40} />
            </div>
            <h3 className="loading-title">Loading Ambassador Program</h3>
            <p className="loading-desc">Fetching campus chapters, leadership tracks, and live metrics from server...</p>
            <div className="loading-progress-track">
              <div className="loading-progress-bar"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!configs?.ambassador) {
    return (
      <div className="ambassador-page">
        <div className="ambassador-bg-grid"></div>
        <div className="ambassador-bg-blur orb-1"></div>
        <div className="ambassador-bg-blur orb-2"></div>
        <div className="ambassador-loading-container">
          <div className="ambassador-loader-box error-box">
            <div className="reload-icon-container error">
              <RefreshCw size={36} />
            </div>
            <h3 className="loading-title">Unable to Load Ambassador Program</h3>
            <p className="loading-desc">
              {error || 'The server took too long to respond. The backend server might be starting up.'}
            </p>
            <button onClick={fetchConfigs} className="btn btn-primary reload-btn">
              <RefreshCw size={16} />
              <span>Reload Page Data</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ambassador-page">
      {/* Decorative Grid and Ambient Orbs */}
      <div className="ambassador-bg-grid"></div>
      <div className="ambassador-bg-blur orb-1"></div>
      <div className="ambassador-bg-blur orb-2"></div>

      <section className="page-header">
        <div className="container text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="about-badge"
          >
            {ambassadorData.badge || 'Join the Student Network'}
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="page-title"
          >
            {ambassadorData.titleMain || 'Become a Campus'} <span className="text-gradient">{ambassadorData.titleGradient || 'Ambassador'}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="page-subtitle"
          >
            {ambassadorData.subtitle || 'Represent Skill Jobs at your university, build your professional network, and develop critical leadership, marketing, and communication skills.'}
          </motion.p>
        </div>
      </section>

      {/* Interactive Campus Chapters Section */}
      <section className="section campus-hubs-section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3rem' }}>
            <span className="badge-pill">Active Campuses</span>
            <h2 className="section-title" style={{ marginTop: '0.5rem' }}>Explore Our Campus Hubs</h2>
            <p className="section-subtitle-small">
              Select a university hub below to view our active chapter leads, local metrics, and campus opportunities.
            </p>
          </div>

          {campusList.length > 0 && currentCampus ? (
            <>
              <div className="campus-tabs-container">
                {campusList.map((campus) => {
                  const isActive = (currentCampus && currentCampus.key === campus.key) || activeUniversity === campus.key;
                  return (
                    <button
                      key={campus.key}
                      onClick={() => setActiveUniversity(campus.key)}
                      className={`campus-tab-btn ${isActive ? 'active' : ''}`}
                      style={{
                        '--uni-brand-color': campus.color || '#0284c7',
                      }}
                    >
                      <span className="tab-logo">{campus.logo}</span>
                      <span className="tab-name">{campus.key}</span>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentCampus.key}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="campus-detail-card card"
                  style={{ 
                    '--chapter-color': currentCampus.color || '#0284c7',
                    '--chapter-color-light': `${currentCampus.color || '#0284c7'}0c`,
                    '--chapter-color-border': `${currentCampus.color || '#0284c7'}1e`,
                    borderTop: `4px solid ${currentCampus.color || '#0284c7'}`
                  }}
                >
                  <div className="campus-detail-grid">
                    <div className="campus-detail-info">
                      <div className="campus-detail-header">
                        <span className="campus-large-logo" style={{ background: `var(--chapter-color-light)`, color: 'var(--chapter-color)' }}>
                          {currentCampus.logo}
                        </span>
                        <div>
                          <h3 className="campus-chapter-title">{currentCampus.fullName} Chapter</h3>
                          <span className="status-indicator-badge">
                            <span className="pulse-dot" style={{ backgroundColor: 'var(--chapter-color)' }}></span> 
                            Active Chapter
                          </span>
                        </div>
                      </div>
                      
                      <p className="campus-description">{currentCampus.description}</p>
                      
                      {/* Chapter Stats Grid */}
                      {currentCampus.stats && (
                        <div className="campus-stats-summary-grid">
                          <div className="campus-stat-box">
                            <div className="stat-icon-wrapper" style={{ background: `var(--chapter-color-light)`, color: 'var(--chapter-color)' }}>
                              <Users size={18} />
                            </div>
                            <div className="stat-box-meta">
                              <span className="stat-num" style={{ color: 'var(--chapter-color)' }}>
                                {currentCampus.stats.studentsReached || 'N/A'}
                              </span>
                              <span className="stat-lbl">Students Reached</span>
                            </div>
                          </div>
                          <div className="campus-stat-box">
                            <div className="stat-icon-wrapper" style={{ background: `var(--chapter-color-light)`, color: 'var(--chapter-color)' }}>
                              <Calendar size={18} />
                            </div>
                            <div className="stat-box-meta">
                              <span className="stat-num" style={{ color: 'var(--chapter-color)' }}>
                                {currentCampus.stats.workshops || 'N/A'}
                              </span>
                              <span className="stat-lbl">Workshops Done</span>
                            </div>
                          </div>
                          <div className="campus-stat-box">
                            <div className="stat-icon-wrapper" style={{ background: `var(--chapter-color-light)`, color: 'var(--chapter-color)' }}>
                              <TrendingUp size={18} />
                            </div>
                            <div className="stat-box-meta">
                              <span className="stat-num" style={{ color: 'var(--chapter-color)' }}>
                                {currentCampus.stats.placementTrack || 'N/A'}
                              </span>
                              <span className="stat-lbl">Placement Rate</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="campus-actions-row">
                        <button
                          onClick={() => handleApplyForUniversity(currentCampus.key)}
                          className="btn btn-primary campus-apply-action-btn"
                          style={{
                            backgroundColor: currentCampus.color || '#0284c7',
                            borderColor: currentCampus.color || '#0284c7',
                            boxShadow: `0 6px 20px ${currentCampus.color || '#0284c7'}25`,
                            margin: 0
                          }}
                        >
                          Apply for {currentCampus.key} Chapter
                        </button>
                        <Link
                          to={`/ambassadors/${currentCampus.key}`}
                          className="btn btn-secondary campus-meet-action-btn"
                          style={{
                            borderColor: currentCampus.color || '#0284c7',
                            color: currentCampus.color || '#0284c7',
                            border: `1.5px solid ${currentCampus.color || '#0284c7'}`
                          }}
                        >
                          View Student Leads
                        </Link>
                      </div>
                    </div>

                    <div className="campus-leads-container">
                      <h4>Chapter Leads</h4>
                      <div className="leads-list">
                        {(currentCampus.leads || [])
                          .filter(lead => lead.role?.toLowerCase().includes('campus lead') || lead.role?.toLowerCase().includes('lider') || lead.role?.toLowerCase().includes('leader'))
                          .map((lead, index) => (
                            <div key={index} className="lead-item-card">
                              <div className="lead-avatar" style={{ background: lead.image ? 'none' : `${currentCampus.color || '#0284c7'}20`, color: currentCampus.color || '#0284c7', padding: lead.image ? '0' : undefined, overflow: 'hidden' }}>
                                {lead.image ? (
                                  <img src={lead.image} alt={lead.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                ) : (
                                  (lead.name || 'L').split(' ').map(n => n[0]).join('')
                                )}
                              </div>
                              <div className="lead-meta">
                                <span className="lead-name">{lead.name}</span>
                                <span className="lead-role">{lead.role}</span>
                                <span className="lead-dept">{lead.dept}</span>
                              </div>
                            </div>
                          ))}
                        {! (currentCampus.leads || []).some(lead => lead.role?.toLowerCase().includes('campus lead') || lead.role?.toLowerCase().includes('lider') || lead.role?.toLowerCase().includes('leader')) && (
                          <div className="no-leads-placeholder">
                            <GraduationCap size={32} style={{ color: 'var(--text-muted)' }} />
                            <p>No Campus Lead assigned yet. Become the first chapter representative!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </>
          ) : (
            <div className="no-campus-card card">
              <GraduationCap size={44} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem' }}>No Campus Hubs Listed Yet</h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 1.5rem' }}>
                Campus chapters will appear here as soon as they are launched. Be the pioneer to bring Skill Jobs to your university!
              </p>
              <button
                onClick={() => handleApplyForUniversity('')}
                className="btn btn-primary"
              >
                Apply to Start a Chapter
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Program Intro Section */}
      <section className="section bg-light intro-section">
        <div className="container">
          <div className="intro-full-width">
            <span className="badge-pill">Overview</span>
            <h2 className="section-title" style={{ marginTop: '0.5rem' }}>
              {ambassadorData.introTitle}
            </h2>
            <p className="about-text">
              {ambassadorData.introDesc}
            </p>
            
            <div className="roles-container">
              <h3 className="sub-title">{ambassadorData.rolesTitle}</h3>
              <ul className="roles-list">
                {(ambassadorData.rolesList || []).map((role, idx) => (
                  <motion.li 
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <CheckCircle className="check-icon" size={18} />
                    <span>{role}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Journey steps Timeline */}
      <section className="section ambassador-journey-section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3.5rem' }}>
            <span className="badge-pill">The Roadmap</span>
            <h2 className="section-title" style={{ marginTop: '0.5rem' }}>
              {ambassadorData.journeyTitle || "Your Ambassador Journey"}
            </h2>
            <p className="section-subtitle-small">
              A comprehensive blueprint outlining your path from candidate onboarding to industry placements.
            </p>
          </div>

          <div className="timeline-tree-container">
            <div className="timeline-center-line"></div>
            {(ambassadorData.journeySteps || []).map((step, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <motion.div 
                  key={idx}
                  className={`timeline-step-row ${isEven ? 'left' : 'right'}`}
                  initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <div className="timeline-content-card card">
                    <span className="step-phase-tag">{step.phase}</span>
                    <h4 className="step-card-title">{step.title}</h4>
                    <p className="step-card-desc">{step.desc}</p>
                  </div>
                  <div className="timeline-node">
                    <span className="node-num">{idx + 1}</span>
                  </div>
                  <div className="timeline-spacing-col"></div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section bg-light ambassador-benefits-section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3.5rem' }}>
            <span className="badge-pill">Why Join?</span>
            <h2 className="section-title" style={{ marginTop: '0.5rem' }}>
              {ambassadorData.benefitsTitle || "Benefits of Joining"}
            </h2>
            <p className="section-subtitle-small">
              {ambassadorData.benefitsSubtitle || "Gain valuable credentials, expand your network, and get corporate placement priority."}
            </p>
          </div>

          <div className="grid grid-3">
            {(ambassadorData.benefitsList || []).map((benefit, idx) => (
              <motion.div 
                key={idx} 
                className="card benefit-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <div className="benefit-icon">
                  {renderBenefitIcon(benefit.icon)}
                </div>
                <h4>{benefit.title}</h4>
                <p>{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Accordion FAQs Section */}
      <section className="section ambassador-faq-section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3.5rem' }}>
            <span className="badge-pill">FAQ</span>
            <h2 className="section-title" style={{ marginTop: '0.5rem' }}>
              {ambassadorData.faqsTitle || "Frequently Asked Questions"}
            </h2>
            <p className="section-subtitle-small">
              Got questions about commitments, rewards, or requirements? We have answers.
            </p>
          </div>

          <div className="faq-accordion-container">
            {(ambassadorData.faqsList || []).map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div 
                  key={idx} 
                  className={`faq-accordion-item card ${isOpen ? 'open' : ''}`}
                >
                  <button className="faq-question-btn" onClick={() => toggleFaq(idx)}>
                    <span>{faq.question}</span>
                    <span className="faq-icon-wrapper" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                      <ChevronDown size={18} />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="faq-answer-wrapper"
                      >
                        <div className="faq-answer-content">
                          <p>{faq.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modal Application Form */}
      <AnimatePresence>
        {showApplyModal && (
          <div className="modal-overlay" onClick={() => { setShowApplyModal(false); setStatus(''); }}>
            <motion.div 
              className="form-wrapper application-modal-card"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: '100%',
                maxWidth: '550px',
                position: 'relative',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
                background: 'rgba(255, 255, 255, 0.98)',
                margin: 'auto'
              }}
            >
              <button className="modal-close-btn" onClick={() => { setShowApplyModal(false); setStatus(''); }} title="Close">
                <X size={18} />
              </button>
              
              <div className="form-header-badge">
                <Sparkles size={16} /> <span>Join Our Network</span>
              </div>
              <h3>Apply for {formData.university || "Ambassador"} Chapter</h3>
              <p className="form-subtitle">Represent your campus and level up your career.</p>
              
              <form className="apply-form" onSubmit={handleSubmit}>
                <div className="form-group avatar-upload-group">
                  <label>Profile Photo</label>
                  <div className="avatar-uploader-container">
                    {formData.image ? (
                      <div className="avatar-preview-box">
                        <img src={formData.image} alt="Preview Profile" />
                        <button 
                          type="button" 
                          className="remove-avatar-btn"
                          onClick={() => setFormData({ ...formData, image: '' })}
                          title="Remove photo"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="avatar-dropzone"
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const file = e.dataTransfer.files[0];
                          if (file) handleImageFile(file);
                        }}
                      >
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="file-input-hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) handleImageFile(file);
                          }}
                        />
                        <Camera size={24} className="camera-upload-icon" />
                        <span>Upload Photo</span>
                        <span className="upload-limit">Max 2MB (JPG/PNG)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>University / College</label>
                  <input type="text" name="university" value={formData.university} onChange={handleChange} placeholder="Where do you study?" required />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="e.g. +8801..." required />
                </div>
                <div className="form-group">
                  <label>Why do you want to join?</label>
                  <textarea rows="3" name="reason" value={formData.reason} onChange={handleChange} placeholder="Tell us about yourself and motivation..." required></textarea>
                </div>
                
                <button type="submit" className="btn btn-primary w-100 btn-submit-app">
                  <span>Submit Application</span>
                  <Send size={16} />
                </button>
                {status && (
                  <p className={`form-status-msg ${status.includes('successfully') ? 'success' : 'error'}`}>
                    {status}
                  </p>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Ambassador;

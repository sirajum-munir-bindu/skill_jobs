import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Users, Loader2, X, Phone } from 'lucide-react';
import './RunningAmbassadors.css';

const formatDate = (dateStr) => {
  if (!dateStr) return 'Recently';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? 'Recently' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const RunningAmbassadors = () => {
  const { university } = useParams();
  
  const [configs, setConfigs] = useState({
    ambassador: {
      campuses: [
        {
          key: "DU",
          fullName: "Dhaka University",
          color: "#7c3aed",
          logo: "🏛️",
          description: "Our DU Chapter is one of our most active student communities. We hold regular on-campus networking mixers, career counseling bootcamps, and mock interviews to prepare students for top tier internships.",
          stats: { studentsReached: "1,500+", workshops: "12+", placementTrack: "92%" }
        },
        {
          key: "JU",
          fullName: "Jahangirnagar University",
          color: "#ec4899",
          logo: "🌿",
          description: "The JU Chapter bridges the gap between academic theories and professional career practices, focusing on leadership summits and digital marketing events in a scenic green campus environment.",
          stats: { studentsReached: "950+", workshops: "6+", placementTrack: "88%" }
        },
        {
          key: "RU",
          fullName: "Rajshahi University",
          color: "#3b82f6",
          logo: "🎓",
          description: "Our northern hub at RU drives technological innovation. We focus heavily on competitive programming bootcamps, resume audits, and soft-skills mentoring sessions for local corporate readiness.",
          stats: { studentsReached: "1,100+", workshops: "8+", placementTrack: "90%" }
        },
        {
          key: "CU",
          fullName: "Chittagong University",
          color: "#10b981",
          logo: "⛰️",
          description: "CU Chapter is empowering the port city youth. We hold cross-functional team hackathons, public speaking training programs, and direct corporate placement workshops at Chittagong.",
          stats: { studentsReached: "850+", workshops: "5+", placementTrack: "85%" }
        },
        {
          key: "DIU",
          fullName: "Daffodil International University",
          color: "#f59e0b",
          logo: "💻",
          description: "A highly tech-focused hub at DIU Smart City campus. We run weekly coding masterclasses, product design sprints (using Figma), and showcase student project prototypes to our network of recruiters.",
          stats: { studentsReached: "1,800+", workshops: "14+", placementTrack: "94%" }
        },
        {
          key: "BUFT",
          fullName: "BGMEA University of Fashion & Technology",
          color: "#6366f1",
          logo: "🎨",
          description: "The BUFT Chapter focuses on apparel engineering, fashion design tech, digital branding, and product management. We connect creative students directly with top garments, retail, and tech companies.",
          stats: { studentsReached: "700+", workshops: "4+", placementTrack: "86%" }
        }
      ]
    }
  });

  const [ambassadors, setAmbassadors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAmbassador, setSelectedAmbassador] = useState(null);

  const uniKey = university ? university.toUpperCase() : 'DU';
  const campusesList = configs.ambassador?.campuses || [];
  const uniInfo = campusesList.find(c => c.key === uniKey) || campusesList[0] || {
    fullName: "Dhaka University",
    color: "#7c3aed",
    logo: "🏛️",
    description: "Campus Chapter Lead Hub",
    stats: { studentsReached: "1,000+", workshops: "8+", placementTrack: "90%" }
  };

  useEffect(() => {
    const fetchConfigsAndAmbassadors = async () => {
      setLoading(true);
      try {
        const [configsRes, ambassadorsRes] = await Promise.all([
          fetch('http://localhost:5000/api/configs'),
          fetch('http://localhost:5000/api/ambassadors')
        ]);
        
        let loadedCampuses = [];
        if (configsRes.ok) {
          const configsData = await configsRes.json();
          setConfigs(prev => ({ ...prev, ...configsData }));
          if (configsData.ambassador && configsData.ambassador.campuses) {
            loadedCampuses = configsData.ambassador.campuses;
          }
        }
        
        if (ambassadorsRes.ok) {
          const ambassadorsData = await ambassadorsRes.json();
          const targetCampuses = loadedCampuses.length > 0 ? loadedCampuses : configs.ambassador.campuses;
          const currentCampus = targetCampuses.find(c => c.key === uniKey) || targetCampuses[0] || {};
          
          // Filter dynamically
          const matched = ambassadorsData.filter(amb => {
            if (!amb.university) return false;
            const uniName = amb.university.toLowerCase();
            const keyLower = uniKey.toLowerCase();
            
            if (uniName === keyLower) return true;
            if (currentCampus.fullName && uniName.includes(currentCampus.fullName.toLowerCase())) return true;
            
            // Substring or fallback matches
            if (keyLower === 'du') return uniName.includes('dhaka') || uniName === 'du';
            if (keyLower === 'ju') return uniName.includes('jahangirnagar') || uniName === 'ju';
            if (keyLower === 'ru') return uniName.includes('rajshahi') || uniName === 'ru';
            if (keyLower === 'cu') return uniName.includes('chittagong') || uniName === 'cu';
            if (keyLower === 'diu') return uniName.includes('daffodil') || uniName === 'diu';
            if (keyLower === 'buft') return uniName.includes('bgmea') || uniName.includes('fashion') || uniName === 'buft';
            
            return uniName.includes(keyLower) || (currentCampus.fullName && currentCampus.fullName.toLowerCase().includes(uniName));
          });
          setAmbassadors(matched);
        }
      } catch (err) {
        console.error('Error fetching dynamic ambassador directory data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfigsAndAmbassadors();
  }, [uniKey]);

  const activeAmbassadors = ambassadors.filter(a => a.status === 'Approved');

  return (
    <div className="running-ambassadors-page" style={{ '--page-brand-color': uniInfo.color || '#0284c7' }}>
      <div className="running-bg-grid"></div>
      
      <section className="page-header relative">
        <div className="container">
          <Link to="/ambassador" className="back-link">
            <ArrowLeft size={16} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} /> 
            Back to Ambassador Program
          </Link>
          
          <div className="header-flex-info" style={{ marginTop: '2.5rem' }}>
            <div className="uni-header-icon-box" style={{ background: `${uniInfo.color || '#0284c7'}12`, color: uniInfo.color || '#0284c7' }}>
              {uniInfo.logo}
            </div>
            <div>
              <span className="badge-pill" style={{ background: `${uniInfo.color || '#0284c7'}15`, color: uniInfo.color || '#0284c7', border: `1px solid ${uniInfo.color || '#0284c7'}22` }}>
                {uniKey} Chapter Hub
              </span>
              <h1 className="uni-header-title">{uniInfo.fullName}</h1>
              <p className="uni-header-desc">{uniInfo.description}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Stats widgets */}
          <div className="stats-row">
            <div className="mini-stat-card card">
              <span className="stat-label">Active Representatives</span>
              <h4 style={{ color: uniInfo.color || '#0284c7' }}>{activeAmbassadors.length} Active</h4>
            </div>
            <div className="mini-stat-card card">
              <span className="stat-label">Chapter Size</span>
              <h4>{ambassadors.length} Total Registered</h4>
            </div>
            {uniInfo.stats && (
              <div className="mini-stat-card card">
                <span className="stat-label">Students Reached</span>
                <h4 style={{ color: '#10b981' }}>{uniInfo.stats.studentsReached || '1,000+'}</h4>
              </div>
            )}
            <div className="mini-stat-card card">
              <span className="stat-label">Hub Status</span>
              <span style={{ color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="pulse-dot"></span> Live Hub
              </span>
            </div>
          </div>

          <h2 className="section-title-left">Ambassador Directory</h2>

          {loading ? (
            <div className="loading-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '250px', alignItems: 'center', gap: '1rem' }}>
              <Loader2 className="animate-spin text-gradient" size={40} style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ color: 'var(--text-muted)' }}>Retrieving chapter directory...</p>
            </div>
          ) : ambassadors.length > 0 ? (
            <div className="ambassador-cards-grid">
              {ambassadors.map((amb, index) => {
                const isApproved = amb.status === 'Approved';
                return (
                  <motion.div 
                    key={amb._id || amb.id} 
                    className="amb-profile-card card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{ borderTop: `4px solid ${isApproved ? '#10b981' : '#f59e0b'}` }}
                  >
                    <div className="card-top">
                      <div className="avatar-image-container" style={{ borderColor: isApproved ? '#10b981' : '#f59e0b' }}>
                        <img 
                          src={amb.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(amb.name)}`} 
                          alt={amb.name} 
                          className="avatar-image" 
                        />
                      </div>
                      <div className="card-identity">
                        <h4>{amb.name}</h4>
                        <span className="card-designation" style={{ color: isApproved ? '#10b981' : '#f59e0b' }}>
                          {amb.role || (isApproved ? 'Campus Ambassador' : 'Representative candidate')}
                        </span>
                        {amb.dept && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontWeight: '500' }}>
                            {amb.dept}
                          </div>
                        )}
                        <a href={`mailto:${amb.email}`} className="card-email" title={amb.email}>
                          <Mail size={12} style={{ flexShrink: 0 }} /> 
                          <span className="email-text">{amb.email}</span>
                        </a>
                        {amb.phone && (
                          <a href={`tel:${amb.phone}`} className="card-email" title={amb.phone} style={{ marginTop: '0.2rem' }}>
                            <Phone size={12} style={{ flexShrink: 0 }} /> 
                            <span className="email-text">{amb.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="card-actions">
                      <button 
                        className="amb-details-btn" 
                        onClick={() => setSelectedAmbassador(amb)}
                      >
                        View Profile Details
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="empty-directory-card card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <Users size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3>No Directory Records Yet</h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '1rem auto 2rem auto' }}>
                There are currently no active ambassadors or submitted applications registered for the {uniInfo.fullName} chapter in our database.
              </p>
              <Link to="/ambassador" className="btn btn-primary" style={{ padding: '0.8rem 2rem', borderRadius: '10px' }}>
                Apply to represent your campus
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Ambassador Details Modal */}
      <AnimatePresence>
        {selectedAmbassador && (
          <div className="amb-modal-overlay" onClick={() => setSelectedAmbassador(null)}>
            <motion.div 
              className="amb-modal-card card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="amb-modal-close-btn" onClick={() => setSelectedAmbassador(null)}>
                <X size={20} />
              </button>
              
              <div className="amb-modal-header-section">
                <div className="amb-modal-avatar-container" style={{ borderColor: selectedAmbassador.status === 'Approved' ? '#10b981' : '#f59e0b' }}>
                  <img 
                    src={selectedAmbassador.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedAmbassador.name)}`} 
                    alt={selectedAmbassador.name} 
                    className="amb-modal-avatar" 
                  />
                </div>
                <div className="amb-modal-identity">
                  <h3>{selectedAmbassador.name}</h3>
                  <span className="amb-modal-designation" style={{ color: selectedAmbassador.status === 'Approved' ? '#10b981' : '#f59e0b' }}>
                    {selectedAmbassador.role || (selectedAmbassador.status === 'Approved' ? 'Campus Ambassador' : 'Representative candidate')}
                  </span>
                  <a href={`mailto:${selectedAmbassador.email}`} className="amb-modal-email">
                    <Mail size={13} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} /> {selectedAmbassador.email}
                  </a>
                  {selectedAmbassador.phone && (
                    <a href={`tel:${selectedAmbassador.phone}`} className="amb-modal-email" style={{ marginTop: '0.3rem', display: 'block' }}>
                      <Phone size={13} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} /> {selectedAmbassador.phone}
                    </a>
                  )}
                </div>
              </div>
              
              <div className="amb-modal-content">
                <div className="amb-modal-meta-grid">
                  <div className="amb-modal-meta-item">
                    <span>University</span>
                    <strong>{selectedAmbassador.university}</strong>
                  </div>
                  {selectedAmbassador.dept && (
                    <div className="amb-modal-meta-item">
                      <span>Department</span>
                      <strong>{selectedAmbassador.dept}</strong>
                    </div>
                  )}
                  <div className="amb-modal-meta-item">
                    <span>Member Since</span>
                    <strong>{formatDate(selectedAmbassador.createdAt)}</strong>
                  </div>
                  <div className="amb-modal-meta-item">
                    <span>Chapter Status</span>
                    <strong style={{ color: selectedAmbassador.status === 'Approved' ? '#10b981' : '#f59e0b' }}>
                      {selectedAmbassador.status === 'Approved' ? 'Active Lead' : 'Pending Review'}
                    </strong>
                  </div>
                </div>

                <div className="amb-modal-essay">
                  <h4>Motivation Statement</h4>
                  <p>{selectedAmbassador.reason}</p>
                </div>

                <button 
                  className="amb-modal-action-close-btn" 
                  onClick={() => setSelectedAmbassador(null)} 
                >
                  Close Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RunningAmbassadors;

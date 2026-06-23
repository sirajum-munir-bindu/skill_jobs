import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Zap, Shield, Users, Award, Briefcase, Camera, ChevronDown, Sparkles, Send, GraduationCap, Calendar, TrendingUp } from 'lucide-react';
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
  const [configs, setConfigs] = useState({
    ambassador: {
      badge: "Join the Student Network",
      titleMain: "Become a Campus",
      titleGradient: "Ambassador",
      subtitle: "Represent Skill Jobs at your university, build your professional network, and develop critical leadership, marketing, and communication skills.",
      introTitle: "What is the Ambassador Program?",
      introDesc: "The Skill Jobs Ambassador Program is an exclusive leadership opportunity for students who are passionate about career development, tech innovation, and community building. You will bridge the gap between academia and the corporate world, representing Skill Jobs on your campus and driving impact.",
      rolesTitle: "Roles & Responsibilities",
      rolesList: [
        "Represent Skill Jobs as the official campus liaison",
        "Promote premium career workshops and certified programs to peers",
        "Gather student feedback and local campus training requirements",
        "Coordinate and organize on-campus networking mixers and bootcamps"
      ],
      benefitsTitle: "Benefits of Joining",
      benefitsSubtitle: "Gain exclusive credentials, hands-on training, and corporate placements while representing us.",
      benefitsList: [
        { title: "Leadership Experience", desc: "Lead initiatives on your campus and add real-world management experience to your CV.", icon: "Shield" },
        { title: "Elite Networking", desc: "Build connections with corporate recruiters, tech leads, and fellow ambassadors across the country.", icon: "Users" },
        { title: "Official Certification", desc: "Receive a recognized leadership certificate and direct letter of recommendation upon tenure completion.", icon: "Award" },
        { title: "Professional Development", desc: "Access regular masterclasses on soft skills, digital branding, and competitive career prep.", icon: "Zap" },
        { title: "Event Management", desc: "Gain behind-the-scenes event experience and help co-organize major tech conferences.", icon: "Briefcase" },
        { title: "VIP Access", desc: "Get free entry and VIP seating at all Skill Jobs premium events, webinars, and hiring drives.", icon: "Award" }
      ],
      journeyTitle: "Your Ambassador Journey",
      journeySteps: [
        { phase: "Phase 1: Apply & Screen", title: "Submit Application", desc: "Fill out the online application. Selected candidates undergo a short online interview." },
        { phase: "Phase 2: Onboard & Kit", title: "Official Onboarding", desc: "Receive the official Ambassador Handbook, digital assets, and an exclusive brand kit." },
        { phase: "Phase 3: Activate Campus", title: "Lead & Engage", desc: "Share skill programs, coordinate on-campus mixers, and represent our workshops." },
        { phase: "Phase 4: Graduate & Placement", title: "Placement Pathway", desc: "Earn certificates, secure direct recommendations, and get fast-tracked for internships." }
      ],
      faqsTitle: "Ambassador FAQs",
      faqsList: [
        { question: "How long is the ambassador tenure?", answer: "The typical tenure is 6 months, aligned with the academic semester, with options for extensions based on performance." },
        { question: "What is the expected weekly time commitment?", answer: "It is highly flexible and usually takes 3 to 5 hours per week, allowing you to prioritize your studies and exams." },
        { question: "Is this a paid role?", answer: "While this is a voluntary leadership role, ambassadors earn performance-based commissions, free access to premium workshops, and exclusive corporate placement referrals." },
        { question: "Can there be multiple ambassadors per campus?", answer: "Yes! Large campuses can have a Campus Lead, a Co-Lead, and several active Student Representatives to divide event coordination." }
      ],
      campuses: [
        {
          key: "DU",
          fullName: "Dhaka University",
          color: "#7c3aed",
          logo: "🏛️",
          description: "Our DU Chapter is one of our most active student communities. We hold regular on-campus networking mixers, career counseling bootcamps, and mock interviews to prepare students for top tier internships.",
          stats: { studentsReached: "1,500+", workshops: "12+", placementTrack: "92%" },
          leads: [
            { name: "Ayesha Rahman", role: "Campus Lead", dept: "CSE, 4th Year", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80" },
            { name: "Sajid Islam", role: "Co-Lead", dept: "Marketing, 3rd Year", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80" }
          ]
        },
        {
          key: "JU",
          fullName: "Jahangirnagar University",
          color: "#ec4899",
          logo: "🌿",
          description: "The JU Chapter bridges the gap between academic theories and professional career practices, focusing on leadership summits and digital marketing events in a scenic green campus environment.",
          stats: { studentsReached: "950+", workshops: "6+", placementTrack: "88%" },
          leads: [
            { name: "Nabila Hassan", role: "Campus Lead", dept: "Economics, 3rd Year", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80" },
            { name: "Zuhair Alvi", role: "Co-Lead", dept: "IBA, 2nd Year", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80" }
          ]
        },
        {
          key: "RU",
          fullName: "Rajshahi University",
          color: "#3b82f6",
          logo: "🎓",
          description: "Our northern hub at RU drives technological innovation. We focus heavily on competitive programming bootcamps, resume audits, and soft-skills mentoring sessions for local corporate readiness.",
          stats: { studentsReached: "1,100+", workshops: "8+", placementTrack: "90%" },
          leads: [
            { name: "Tanvir Ahmed", role: "Campus Lead", dept: "EEE, 4th Year", image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80" },
            { name: "Ishrat Jahan", role: "Co-Lead", dept: "English, 3rd Year", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80" }
          ]
        },
        {
          key: "CU",
          fullName: "Chittagong University",
          color: "#10b981",
          logo: "⛰️",
          description: "CU Chapter is empowering the port city youth. We hold cross-functional team hackathons, public speaking training programs, and direct corporate placement workshops at Chittagong.",
          stats: { studentsReached: "850+", workshops: "5+", placementTrack: "85%" },
          leads: [
            { name: "Fariha Sultana", role: "Campus Lead", dept: "BBA, 3rd Year", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80" },
            { name: "Adnan Chowdhury", role: "Co-Lead", dept: "CSE, 4th Year", image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&h=150&q=80" }
          ]
        },
        {
          key: "DIU",
          fullName: "Daffodil International University",
          color: "#f59e0b",
          logo: "💻",
          description: "A highly tech-focused hub at DIU Smart City campus. We run weekly coding masterclasses, product design sprints (using Figma), and showcase student project prototypes to our network of recruiters.",
          stats: { studentsReached: "1,800+", workshops: "14+", placementTrack: "94%" },
          leads: [
            { name: "Mahir Asif", role: "Campus Lead", dept: "Software Engineering, 4th Year", image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&h=150&q=80" },
            { name: "Lamia Kabir", role: "Co-Lead", dept: "English, 3rd Year", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&h=150&q=80" }
          ]
        },
        {
          key: "BUFT",
          fullName: "BGMEA University of Fashion & Technology",
          color: "#6366f1",
          logo: "🎨",
          description: "The BUFT Chapter focuses on apparel engineering, fashion design tech, digital branding, and product management. We connect creative students directly with top garments, retail, and tech companies.",
          stats: { studentsReached: "700+", workshops: "4+", placementTrack: "86%" },
          leads: [
            { name: "Rashedul Bari", role: "Campus Lead", dept: "Apparel Engineering, 4th Year", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80" },
            { name: "Ananya Roy", role: "Co-Lead", dept: "Fashion Design, 3rd Year", image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&h=150&q=80" }
          ]
        }
      ]
    }
  });

  const [formData, setFormData] = useState({ name: '', email: '', university: '', reason: '', image: '' });
  const [status, setStatus] = useState('');
  const [activeUniversity, setActiveUniversity] = useState('DU');
  const [openFaqIdx, setOpenFaqIdx] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/configs');
        if (res.ok) {
          const data = await res.json();
          setConfigs(prev => ({
            ...prev,
            ...data
          }));
        }
      } catch (err) {
        console.warn('Failed to fetch configs, using fallback UI defaults:', err);
      }
    };
    fetchConfigs();
  }, []);

  const ambassadorData = configs.ambassador || {};
  const campusList = ambassadorData.campuses || [];
  const currentCampus = campusList.find(c => c.key === activeUniversity) || campusList[0] || {};

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
    setStatus('Submitting...');
    try {
      const response = await fetch('http://localhost:5000/api/ambassador/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setStatus('Application submitted successfully!');
        setFormData({ name: '', email: '', university: '', reason: '', image: '' });
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
    const campus = campusList.find(c => c.key === uniKey);
    if (campus) {
      setFormData(prev => ({ ...prev, university: campus.fullName, name: '', email: '', reason: '', image: '' }));
    } else {
      setFormData(prev => ({ ...prev, university: '', name: '', email: '', reason: '', image: '' }));
    }
    setStatus('');
    setShowApplyModal(true);
  };

  const toggleFaq = (idx) => {
    setOpenFaqIdx(openFaqIdx === idx ? null : idx);
  };

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
            {ambassadorData.badge}
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="page-title"
          >
            {ambassadorData.titleMain} <span className="text-gradient">{ambassadorData.titleGradient}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="page-subtitle"
          >
            {ambassadorData.subtitle}
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

          <div className="campus-tabs-container">
            {campusList.map((campus) => {
              const isActive = activeUniversity === campus.key;
              return (
                <button
                  key={campus.key}
                  onClick={() => setActiveUniversity(campus.key)}
                  className={`campus-tab-btn ${isActive ? 'active' : ''}`}
                  style={{
                    '--uni-brand-color': campus.color,
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
              key={activeUniversity}
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
                      onClick={() => handleApplyForUniversity(activeUniversity)}
                      className="btn btn-primary campus-apply-action-btn"
                      style={{
                        backgroundColor: currentCampus.color,
                        borderColor: currentCampus.color,
                        boxShadow: `0 6px 20px ${currentCampus.color}25`,
                        margin: 0
                      }}
                    >
                      Apply for {activeUniversity} Chapter
                    </button>
                    <Link
                      to={`/ambassadors/${activeUniversity}`}
                      className="btn btn-secondary campus-meet-action-btn"
                      style={{
                        borderColor: currentCampus.color,
                        color: currentCampus.color,
                        border: `1.5px solid ${currentCampus.color}`
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
                          <div className="lead-avatar" style={{ background: lead.image ? 'none' : `${currentCampus.color}20`, color: currentCampus.color, padding: lead.image ? '0' : undefined, overflow: 'hidden' }}>
                            {lead.image ? (
                              <img src={lead.image} alt={lead.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            ) : (
                              lead.name.split(' ').map(n => n[0]).join('')
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
              <button className="modal-close-btn" onClick={() => { setShowApplyModal(false); setStatus(''); }}>&times;</button>
              
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
                        >
                          &times;
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
                  <label>Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. John Doe" required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" required />
                </div>
                <div className="form-group">
                  <label>University / College</label>
                  <input type="text" name="university" value={formData.university} onChange={handleChange} placeholder="Where do you study?" required />
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

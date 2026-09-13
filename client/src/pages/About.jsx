import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, Heart, Lightbulb, Users, Award, 
  TrendingUp, Calendar, ChevronRight, CheckCircle2, ShieldCheck 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import './About.css';

const About = () => {
  const [configs, setConfigs] = useState({
    about: {
      badge: "Empowering Next-Gen Leaders",
      titleMain: "Bridging Passion and",
      titleGradient: "Profession",
      subtitle: "Skill Jobs is a youth-driven career development initiative designed to equip students and fresh graduates with real-world skills, mentorship, and professional opportunities.",
      whoWeAreTitle: "A Community That Genuinely Cares About Your Future",
      whoWeAreDesc1: "Skill Jobs started as a simple idea among friends: what if there was a community that helped students navigate their careers without the intimidating corporate jargon?",
      whoWeAreDesc2: "Today, we are a thriving youth-focused career development platform. We believe that every student has potential, but sometimes they just need the right guidance, the right network, and the right opportunities to shine.",
      whoWeAreFeatures: [
        "Practical curriculum pathways designed by industry specialists",
        "Exclusive access to campus networks and corporate mentors",
        "Direct job listings and fast-track resume evaluations"
      ],
      milestones: [
        { value: "5,000+", label: "Students Mentored", color: "#3b82f6" },
        { value: "50+", label: "Workshops & Events", color: "#ef4444" },
        { value: "25+", label: "Campus Chapters", color: "#10b981" },
        { value: "92%", label: "Placement Success", color: "#f59e0b" }
      ],
      values: [
        {
          title: "Mission-Driven",
          desc: "To empower youth by providing accessible skills training, meaningful networking, and real-world career opportunities.",
          color: "blue"
        },
        {
          title: "Visionary Growth",
          desc: "To build the most trusted youth career development ecosystem, inspiring a generation of confident, skilled professionals.",
          color: "yellow"
        },
        {
          title: "Youth First",
          desc: "Designed from the ground up for students, fresh graduates, and ambitious young minds eager to leave their mark.",
          color: "red"
        }
      ],
      timeline: [
        {
          year: "2024",
          title: "The Spark",
          desc: "Founded by a group of passionate graduates with a simple mission: demystify the transition from university to corporate careers."
        },
        {
          year: "2025",
          title: "Thriving Network",
          desc: "Launched our Campus Ambassador Program across 15+ universities, connecting over 2,000 students with industry mentors."
        },
        {
          year: "2026",
          title: "Career Ecosystem",
          desc: "Upgraded to a fully dynamic career discovery platform, hosting interactive learning paths, mock interview labs, and direct recruiter pathways."
        }
      ],
      ctaTitle: "Ready to Shape Your Future?",
      ctaDesc: "Whether you want to join as an Ambassador representing your campus or build direct skills at our next professional workshop, we have a place for you.",
      ctaBtn1Text: "Explore Skills Programs",
      ctaBtn2Text: "Become Campus Lead"
    }
  });

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/configs`);
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

  const aboutData = configs.about || {};
  const milestones = aboutData.milestones || [];
  const values = aboutData.values || [];
  const timeline = aboutData.timeline || [];
  const whoWeAreFeatures = aboutData.whoWeAreFeatures || [];

  const getMilestoneIcon = (label) => {
    const lower = label?.toLowerCase() || '';
    if (lower.includes('student') || lower.includes('peer')) return <Users size={20} />;
    if (lower.includes('workshop') || lower.includes('event')) return <Calendar size={20} />;
    if (lower.includes('chapter') || lower.includes('campus')) return <Award size={20} />;
    return <TrendingUp size={20} />;
  };

  const getValueIcon = (title) => {
    const lower = title?.toLowerCase() || '';
    if (lower.includes('mission')) return <Target />;
    if (lower.includes('vision') || lower.includes('growth')) return <Lightbulb />;
    return <Heart />;
  };

  return (
    <div className="about-page">
      {/* Ambient background decorative elements */}
      <div className="about-bg-blur orb-1"></div>
      <div className="about-bg-blur orb-2"></div>

      {/* Hero Header */}
      <section className="about-hero">
        <div className="container text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="about-badge"
          >
            {aboutData.badge}
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="page-title"
          >
            {aboutData.titleMain} <span className="text-gradient">{aboutData.titleGradient}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="page-subtitle"
          >
            {aboutData.subtitle}
          </motion.p>
        </div>
      </section>

      {/* Milestones Stats grid */}
      <section className="about-stats-section">
        <div className="container">
          <div className="about-stats-grid">
            {milestones.map((m, idx) => (
              <motion.div 
                key={idx}
                className="about-stat-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="stat-icon-wrapper" style={{ color: m.color, background: `${m.color}15` }}>
                  {getMilestoneIcon(m.label)}
                </div>
                <div className="stat-meta">
                  <h3>{m.value}</h3>
                  <p>{m.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Are Split Grid */}
      <section className="section who-we-are-section">
        <div className="container">
          <div className="about-grid">
            <motion.div 
              className="about-content"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="section-pretitle">Who We Are</span>
              <h2 className="section-title">{aboutData.whoWeAreTitle}</h2>
              <p className="about-text">
                {aboutData.whoWeAreDesc1}
              </p>
              <p className="about-text">
                {aboutData.whoWeAreDesc2}
              </p>
              
              <ul className="about-features-list">
                {whoWeAreFeatures.map((feat, idx) => (
                  <li key={idx}>
                    <CheckCircle2 className="feature-icon" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div 
              className="about-image-column"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="about-image-wrapper">
                <img 
                  src={aboutData.whoWeAreImage || "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"} 
                  alt="Skill Jobs Collaborative Workshop" 
                  className="about-image" 
                />
                
                {/* Floating Micro Glass Cards */}
                <div className="floating-badge badge-top">
                  <div className="badge-icon"><ShieldCheck size={18} /></div>
                  <div className="badge-info">
                    <h5>Verified Courses</h5>
                    <p>Certified curricula</p>
                  </div>
                </div>

                <div className="floating-badge badge-bottom">
                  <div className="badge-icon"><Users size={18} /></div>
                  <div className="badge-info">
                    <h5>Active Guild</h5>
                    <p>2,000+ peers active</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="section values-section bg-gradient-soft">
        <div className="container">
          <div className="text-center section-header-wrap">
            <span className="section-pretitle">Our Principles</span>
            <h2 className="section-title">Values That Guide Us</h2>
            <p className="section-subtitle">
              We operate under core beliefs designed to make skill advancement and mentorship transparent, collaborative, and rewarding.
            </p>
          </div>

          <div className="grid grid-3">
            {values.map((v, idx) => (
              <motion.div 
                key={idx}
                className={`card value-card value-${v.color}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div className="value-icon">{getValueIcon(v.title)}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Timeline Section */}
      <section className="section journey-section">
        <div className="container">
          <div className="text-center section-header-wrap">
            <span className="section-pretitle">History</span>
            <h2 className="section-title">Our Growth Journey</h2>
            <p className="section-subtitle">
              Take a look at how we expanded from a localized university circle into an national student career network.
            </p>
          </div>

          <div className="timeline-container">
            <div className="timeline-track"></div>
            {timeline.map((item, idx) => (
              <motion.div 
                key={idx}
                className={`timeline-item ${idx % 2 === 0 ? 'left' : 'right'}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
              >
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <span className="timeline-year">{item.year}</span>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* High-Impact CTA */}
      <section className="section cta-section-about">
        <div className="container">
          <div className="cta-about-card">
            <div className="cta-about-bg"></div>
            <div className="cta-content-wrapper">
              <h2>{aboutData.ctaTitle}</h2>
              <p>
                {aboutData.ctaDesc}
              </p>
              <div className="cta-buttons-wrap">
                <a href="https://event.skill.jobs/" target="_blank" rel="noopener noreferrer" className="btn btn-white">
                  <span>{aboutData.ctaBtn1Text}</span>
                  <ChevronRight size={16} />
                </a>
                <Link to="/ambassador" className="btn btn-outline-white">
                  {aboutData.ctaBtn2Text}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

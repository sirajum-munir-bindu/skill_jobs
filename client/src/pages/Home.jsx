import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Award, BookOpen, ArrowRight, Quote, 
  CheckCircle, ChevronDown, Sparkles, Brain, 
  Code, Layers, RefreshCw, Compass, GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import './Home.css';

// 1. Learning Path Data
const learningPaths = {
  web: {
    title: "Web Engineering",
    icon: <Code size={28} />,
    color: "#0284c7",
    badge: "Most Popular",
    desc: "Become a Full-Stack developer capable of building complex, secure, and highly scalable cloud systems from scratch.",
    duration: "16 Weeks (120 Hours)",
    modules: [
      "Frontend UI Development (React.js, Tailwind)",
      "State Management (Redux Toolkit, APIs)",
      "Backend Architecture (Node.js, Express)",
      "Database Systems & Security (MongoDB, SQL)"
    ],
    tools: ["React", "Node.js", "Express", "MongoDB", "GitHub", "Tailwind"],
    capstone: {
      name: "SaaS Application Platform",
      desc: "Develop a complete Multi-tenant CRM application featuring payment integrations, real-time analytics, and role-based access control."
    }
  },
  ai: {
    title: "Data Science & AI",
    icon: <Brain size={28} />,
    color: "#10b981",
    badge: "High Growth",
    desc: "Master data analytics pipelines, automated predictive modeling, and integration of generative AI models in business applications.",
    duration: "18 Weeks (135 Hours)",
    modules: [
      "Data Analysis (Python, Pandas, NumPy)",
      "Database Querying & Optimization (SQL)",
      "Machine Learning Algorithms (Scikit-Learn)",
      "Deep Learning & Generative AI APIs"
    ],
    tools: ["Python", "SQL", "Pandas", "Scikit-Learn", "PostgreSQL", "PowerBI"],
    capstone: {
      name: "E-Commerce Suggestion Engine",
      desc: "Construct an automated ML pipeline that trains user behavior models and outputs real-time personalized product suggestions."
    }
  },
  design: {
    title: "UI/UX Product Design",
    icon: <Layers size={28} />,
    color: "#8b5cf6",
    badge: "Creative Track",
    desc: "Learn modern user experience methodologies, build interactive prototypes, and create design systems for high-traffic products.",
    duration: "12 Weeks (90 Hours)",
    modules: [
      "User Research & Empathy Mapping",
      "Wireframing & Information Architecture",
      "Interactive High-Fidelity Prototyping",
      "Usability Testing & Design System Scaling"
    ],
    tools: ["Figma", "FigJam", "Miro", "Adobe Suite", "Prototyping", "A/B Testing"],
    capstone: {
      name: "FinTech Digital Wallet App",
      desc: "Conduct thorough user testing and design a beautiful financial product interface, building a comprehensive design system."
    }
  }
};

// 2. Career Fit Quiz Questions
const quizQuestions = [
  {
    id: 1,
    question: "What type of projects excite you the most?",
    options: [
      { text: "Building interactive web platforms and applications", type: "web" },
      { text: "Discovering patterns in data and training AI models", type: "ai" },
      { text: "Crafting beautiful interfaces and user experiences", type: "design" }
    ]
  },
  {
    id: 2,
    question: "Which toolkit would you prefer to master?",
    options: [
      { text: "React, Node.js, APIs, and cloud databases", type: "web" },
      { text: "Python, SQL, machine learning, and graphs", type: "ai" },
      { text: "Figma design systems, layouts, and UX testing", type: "design" }
    ]
  },
  {
    id: 3,
    question: "What is your main professional objective?",
    options: [
      { text: "Become a Full-Stack Engineer or Tech Lead", type: "web" },
      { text: "Become a Business Intelligence or ML Expert", type: "ai" },
      { text: "Become a UI/UX Designer or Product Manager", type: "design" }
    ]
  }
];

// Safely resolve CountUp default import issue in some bundler environments
const CountUpComponent = typeof CountUp === 'function'
  ? CountUp
  : (CountUp && typeof CountUp.default === 'function'
    ? CountUp.default
    : ({ end }) => <span>{end}</span>);

const renderIcon = (iconName, size = 28) => {
  switch (iconName) {
    case 'Code': return <Code size={size} />;
    case 'Brain': return <Brain size={size} />;
    case 'Layers': return <Layers size={size} />;
    case 'GraduationCap': return <GraduationCap size={size} />;
    case 'Compass': return <Compass size={size} />;
    case 'Sparkles': return <Sparkles size={size} />;
    default: return <Code size={size} />;
  }
};

const Home = () => {
  const [events, setEvents] = useState([]);
  // Homepage Configurations state with default fallbacks
  const [configs, setConfigs] = useState({
    hero: {
      badge: "Welcome to Skill Jobs",
      titleMain: "Shape Your Future with",
      titleGradient: "Professional Skills & Mentorship",
      videoUrl: "/hero-bg.mp4"
    },
    stats: {
      studentsTrained: 5000,
      expertMentors: 120,
      placementSuccess: 94,
      campusChapters: 50
    },
    faqs: [
      {
        question: "Are the certificates industry-recognized?",
        answer: "Yes, all Skill Jobs professional certificates are co-signed by leading corporate partners and verified on the blockchain, making them highly credible for local and international recruiters."
      },
      {
        question: "Can I participate in workshops while working full-time?",
        answer: "Absolutely! Our courses and mentorship sessions are highly flexible, featuring live weekend classes and recorded viewports so you can learn at your own pace."
      },
      {
        question: "How does the placement assistance program work?",
        answer: "Once you complete a learning path and score above 80% on our skill assessment, your profile is fast-tracked and directly recommended to our network of 500+ hiring corporate partners."
      }
    ],
    testimonials: [
      {
        quote: "The Career Building Workshop co-signed by corporate mentors changed my trajectory. The assessors gave direct, constructive code feedback, and I landed my web dev role within 2 weeks!",
        author: "Aisha Rahman",
        role: "Software Engineer, MNC",
        avatar: "A"
      },
      {
        quote: "Representing Skill Jobs as a Campus Lead gave me invaluable teamwork, public relations, and event organization leadership skills. The recruiters loved my project management stories.",
        author: "Rahul Hassan",
        role: "Management Trainee, Telecom",
        avatar: "R"
      },
      {
        quote: "Designing active project interfaces during the Figma design sprint was fantastic. Building actual client prototypes allowed me to skip theory and secure my Product Designer internship.",
        author: "Sarah Ahmed",
        role: "Product Designer, Startup",
        avatar: "S"
      }
    ],
    learningPaths: {
      web: {
        title: "Web Engineering",
        icon: "Code",
        color: "#0284c7",
        badge: "Most Popular",
        desc: "Become a Full-Stack developer capable of building complex, secure, and highly scalable cloud systems from scratch.",
        duration: "16 Weeks (120 Hours)",
        modules: [
          "Frontend UI Development (React.js, Tailwind)",
          "State Management (Redux Toolkit, APIs)",
          "Backend Architecture (Node.js, Express)",
          "Database Systems & Security (MongoDB, SQL)"
        ],
        tools: ["React", "Node.js", "Express", "MongoDB", "GitHub", "Tailwind"],
        capstone: {
          name: "SaaS Application Platform",
          desc: "Develop a complete Multi-tenant CRM application featuring payment integrations, real-time analytics, and role-based access control."
        }
      },
      ai: {
        title: "Data Science & AI",
        icon: "Brain",
        color: "#10b981",
        badge: "High Growth",
        desc: "Master data analytics pipelines, automated predictive modeling, and integration of generative AI models in business applications.",
        duration: "18 Weeks (135 Hours)",
        modules: [
          "Data Analysis (Python, Pandas, NumPy)",
          "Database Querying & Optimization (SQL)",
          "Machine Learning Algorithms (Scikit-Learn)",
          "Deep Learning & Generative AI APIs"
        ],
        tools: ["Python", "SQL", "Pandas", "Scikit-Learn", "PostgreSQL", "PowerBI"],
        capstone: {
          name: "E-Commerce Suggestion Engine",
          desc: "Construct an automated ML pipeline that trains user behavior models and outputs real-time personalized product suggestions."
        }
      },
      design: {
        title: "UI/UX Product Design",
        icon: "Layers",
        color: "#8b5cf6",
        badge: "Creative Track",
        desc: "Learn modern user experience methodologies, build interactive prototypes, and create design systems for high-traffic products.",
        duration: "12 Weeks (90 Hours)",
        modules: [
          "User Research & Empathy Mapping",
          "Wireframing & Information Architecture",
          "Interactive High-Fidelity Prototyping",
          "Usability Testing & Design System Scaling"
        ],
        tools: ["Figma", "FigJam", "Miro", "Adobe Suite", "Prototyping", "A/B Testing"],
        capstone: {
          name: "FinTech Digital Wallet App",
          desc: "Conduct thorough user testing and design a beautiful financial product interface, building a comprehensive design system."
        }
      }
    },
    infoBlocks: [
      {
        badge: "Industry-Led Guidance",
        title: "Learn Directly From Top Corporate Experts",
        desc: "Our curriculum is designed and updated constantly by active tech, design, and HR executives from leading corporate companies. You learn the exact skills recruiters look for.",
        bullets: [
          "Interactive live classes with corporate leaders",
          "Real case studies from active corporate projects",
          "Mock technical interviews and constructive feedback"
        ],
        btnText: "Browse Mentors",
        btnLink: "/events",
        image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        reverse: false
      },
      {
        badge: "Hands-On Application",
        title: "Build a Portfolio That Demands Recruitment",
        desc: "Recruiters don't hire CV lists; they hire builders. With our programs, you will build actual production-ready prototypes, digital campaigns, and project pitch decks.",
        bullets: [
          "Team hackathons and cross-functional collaborations",
          "Clean code audits and interface feedback cycles",
          "Showcase your projects directly to recruiters in pitch days"
        ],
        btnText: "Join Live Workshop",
        btnLink: "/events",
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        reverse: true
      }
    ],
    quiz: {
      badge: "Career Matcher Widget",
      title: "Find Your Ideal Skill Track",
      desc: "Unsure which path matches your strengths? Take this 30-second assessment to discover the best fit.",
      introTitle: "Career Fit Quiz",
      introDesc: "Answer 3 quick questions about your creative tastes, coding experience, and professional goals to get a recommended skill path.",
      startBtnText: "Start Matcher",
      questions: [
        {
          id: 1,
          question: "What type of projects excite you the most?",
          options: [
            { text: "Building interactive web platforms and applications", type: "web" },
            { text: "Discovering patterns in data and training AI models", type: "ai" },
            { text: "Crafting beautiful interfaces and user experiences", type: "design" }
          ]
        },
        {
          id: 2,
          question: "Which toolkit would you prefer to master?",
          options: [
            { text: "React, Node.js, APIs, and cloud databases", type: "web" },
            { text: "Python, SQL, machine learning, and graphs", type: "ai" },
            { text: "Figma design systems, layouts, and UX testing", type: "design" }
          ]
        },
        {
          id: 3,
          question: "What is your main professional objective?",
          options: [
            { text: "Become a Full-Stack Engineer or Tech Lead", type: "web" },
            { text: "Become a Business Intelligence or ML Expert", type: "ai" },
            { text: "Become a UI/UX Designer or Product Manager", type: "design" }
          ]
        }
      ]
    },
    cta: {
      title: "Ready to unlock your professional potential?",
      desc: "Register for our upcoming certified workshops and fast-track your applications to 500+ top recruiters today.",
      btn1Text: "View Upcoming Classes",
      btn1Link: "/events",
      btn2Text: "Contact Advisors",
      btn2Link: "/contact"
    }
  });


  useEffect(() => {
    const fetchConfigsAndEvents = async () => {
      try {
        const [configsRes, eventsRes] = await Promise.all([
          fetch('http://localhost:5000/api/configs'),
          fetch('http://localhost:5000/api/events')
        ]);
        
        if (configsRes.ok) {
          const data = await configsRes.json();
          setConfigs(prev => ({
            ...prev,
            ...data
          }));
        }

        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(eventsData);
        }
      } catch (err) {
        console.warn('Failed to fetch configurations and events:', err);
      }
    };
    fetchConfigsAndEvents();
  }, []);

  // 1. FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState(null);
  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  // 2. Cursor Glow Follower State
  const [mousePos, setMousePos] = useState({ x: -150, y: -150 });
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 2.5. Autoplay Video Background Force Play
  useEffect(() => {
    const video = document.getElementById('hero-video-bg');
    if (video) {
      video.muted = true;
      video.play().catch(err => {
        console.warn("Video background play failed or was blocked by browser:", err);
      });
    }
  }, []);

  // 3. Stats Section Intersection Observer
  const { ref: statsRef, inView: statsInView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  // 4. Learning Path Tab State
  const [activePath, setActivePath] = useState('web');

  // 5. Quiz State
  const [quizState, setQuizState] = useState('intro'); // 'intro', 'question', 'result'
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizResult, setQuizResult] = useState(null);

  const startQuiz = () => {
    setQuizState('question');
    setCurrentQIdx(0);
    setQuizAnswers([]);
  };

  const handleQuizAnswer = (type) => {
    const newAnswers = [...quizAnswers, type];
    setQuizAnswers(newAnswers);
    const questionsList = configs.quiz?.questions || quizQuestions;

    if (currentQIdx < questionsList.length - 1) {
      setCurrentQIdx(currentQIdx + 1);
    } else {
      // Calculate results
      const counts = newAnswers.reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
      }, {});

      // Find highest score
      let bestType = 'web';
      let maxCount = 0;
      Object.keys(counts).forEach(key => {
        if (counts[key] > maxCount) {
          maxCount = counts[key];
          bestType = key;
        }
      });

      setQuizResult(bestType);
      setQuizState('result');
    }
  };

  const restartQuiz = () => {
    startQuiz();
  };



  return (
    <div className="home skills-theme">
      {/* 3D Cursor Glow Follower Spotlight */}
      <div 
        className="cursor-glow-sphere" 
        style={{ 
          left: `${mousePos.x}px`, 
          top: `${mousePos.y}px` 
        }} 
      />

      {/* Hero Section: Centered, Full-Width */}
      <section className="hero skills-hero text-center">
        {/* Animated Video/Image Background */}
        {configs.hero.videoUrl && (
          configs.hero.videoUrl.startsWith('data:image/') ||
          /\.(jpg|jpeg|png|gif|webp|svg)($|\?)/i.test(configs.hero.videoUrl)
        ) ? (
          <img 
            id="hero-video-bg"
            src={configs.hero.videoUrl} 
            className="hero-video-bg" 
            alt="Hero Background"
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        ) : (
          <video 
            id="hero-video-bg"
            key={configs.hero.videoUrl}
            autoPlay 
            loop 
            muted 
            playsInline 
            className="hero-video-bg"
          >
            <source src={configs.hero.videoUrl} type={configs.hero.videoUrl?.startsWith('data:video/') ? undefined : "video/mp4"} />
            Your browser does not support the video tag.
          </video>
        )}
        <div className="hero-video-overlay"></div>

        <div className="container hero-container-centered">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-text-centered"
          >
            <span className="badge-pill">{configs.hero.badge}</span>
            <h1 className="hero-title-large">
              {configs.hero.titleMain} <br/>
              <span className="text-gradient">{configs.hero.titleGradient}</span>
            </h1>
            <div className="hero-buttons-centered">
              <Link to="/events" className="btn btn-primary btn-lg">Explore Skills Programs</Link>
              <Link to="/ambassador" className="btn btn-secondary btn-lg">Join Campus Program</Link>
            </div>
          </motion.div>

          {/* Floating abstract decorative icons */}
          <div className="hero-decorations">
            <div className="decor-item decor-1"><BookOpen size={24} /></div>
            <div className="decor-item decor-2"><Award size={24} /></div>
            <div className="decor-item decor-3"><Users size={24} /></div>
          </div>
        </div>
      </section>

      {/* Achievements Stats Counter Section */}
      <section className="stats-counter-banner" ref={statsRef}>
        <div className="container">
          <div className="stats-counter-grid">
            <div className="stat-counter-item">
              <h2 className="stat-number">
                {statsInView ? <CountUpComponent start={0} end={configs.stats.studentsTrained} duration={2} separator="," /> : '0'}+
              </h2>
              <p className="stat-title">Students Trained</p>
            </div>
            <div className="stat-counter-item">
              <h2 className="stat-number">
                {statsInView ? <CountUpComponent start={0} end={configs.stats.expertMentors} duration={2} /> : '0'}+
              </h2>
              <p className="stat-title">Expert Mentors</p>
            </div>
            <div className="stat-counter-item">
              <h2 className="stat-number">
                {statsInView ? <CountUpComponent start={0} end={configs.stats.placementSuccess} duration={2} /> : '0'}%
              </h2>
              <p className="stat-title">Placement Success</p>
            </div>
            <div className="stat-counter-item">
              <h2 className="stat-number">
                {statsInView ? <CountUpComponent start={0} end={configs.stats.campusChapters} duration={1.5} /> : '0'}+
              </h2>
              <p className="stat-title">Campus Chapters</p>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Path Tabs Explorer: Interactive tab Showcase */}
      <section className="section bg-light path-explorer-section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3rem' }}>
            <span className="badge-pill">Learning Hub</span>
            <h2 className="section-title" style={{ marginTop: '0.5rem' }}>Interactive Learning Paths</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
              Explore comprehensive career curricula designed in partnership with industry leaders to fast-track your entry into tech.
            </p>
          </div>

          <div className="path-tabs-container">
            {configs.learningPaths && Object.keys(configs.learningPaths).map((key) => {
              const path = configs.learningPaths[key];
              const isActive = activePath === key;
              return (
                <button
                  key={key}
                  onClick={() => setActivePath(key)}
                  className={`path-tab-btn ${isActive ? 'active' : ''}`}
                  style={{
                    '--path-theme-color': path.color,
                  }}
                >
                  <span className="tab-icon">{renderIcon(path.icon)}</span>
                  <span className="tab-name">{path.title}</span>
                </button>
              );
            })}
          </div>

          {configs.learningPaths && configs.learningPaths[activePath] && (
            <motion.div
              key={activePath}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="path-detail-card card"
              style={{ borderTop: `4px solid ${configs.learningPaths[activePath].color}` }}
            >
              <div className="path-detail-grid">
                <div className="path-detail-info">
                  <div className="path-detail-header">
                    <span 
                      className="path-large-logo" 
                      style={{ 
                        background: `${configs.learningPaths[activePath].color}12`, 
                        color: configs.learningPaths[activePath].color 
                      }}
                    >
                      {renderIcon(configs.learningPaths[activePath].icon)}
                    </span>
                    <div>
                      <span 
                        className="badge-pill inline-badge" 
                        style={{ 
                          background: `${configs.learningPaths[activePath].color}15`, 
                          color: configs.learningPaths[activePath].color,
                          margin: 0,
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.7rem'
                        }}
                      >
                        {configs.learningPaths[activePath].badge}
                      </span>
                      <h3 className="path-chapter-title">{configs.learningPaths[activePath].title} Track</h3>
                    </div>
                  </div>
                  
                  <p className="path-description">{configs.learningPaths[activePath].desc}</p>
                  
                  <div className="path-metadata-pill">
                    <span className="meta-dot" style={{ backgroundColor: configs.learningPaths[activePath].color }}></span>
                    <span className="meta-text">Duration: <strong>{configs.learningPaths[activePath].duration}</strong></span>
                  </div>

                  <div className="tools-box">
                    <h4>Technologies Mastered</h4>
                    <div className="tools-badge-flex">
                      {configs.learningPaths[activePath].tools && configs.learningPaths[activePath].tools.map((t, idx) => (
                        <span key={idx} className="tool-badge-pill">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="path-curriculum-container">
                  <h4>Course Curriculum Roadmap</h4>
                  <div className="curriculum-roadmap-steps">
                    {configs.learningPaths[activePath].modules && configs.learningPaths[activePath].modules.map((module, index) => (
                      <div key={index} className="roadmap-step-item">
                        <div 
                          className="step-circle-number" 
                          style={{ 
                            backgroundColor: configs.learningPaths[activePath].color,
                            boxShadow: `0 0 10px ${configs.learningPaths[activePath].color}30`
                          }}
                        >
                          {index + 1}
                        </div>
                        <div className="step-content-text">
                          <span className="step-name">{module}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {configs.learningPaths[activePath].capstone && (
                    <div className="capstone-highlight-box">
                      <div className="capstone-header">
                        <GraduationCap size={18} style={{ color: configs.learningPaths[activePath].color }} />
                        <span className="capstone-label">Capstone Project Highlight</span>
                      </div>
                      <h5>{configs.learningPaths[activePath].capstone.name}</h5>
                      <p>{configs.learningPaths[activePath].capstone.desc}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Alternating Info Sections: Rich Educational Graphics */}
      <section className="section info-block-section">
        <div className="container">
          {configs.infoBlocks && configs.infoBlocks.map((block, index) => {
            const latestUpcoming = events.find(e => e.status !== 'Completed');
            const latestCompleted = events.find(e => e.status === 'Completed');
            
            // Override static config images with latest database events dynamically
            let displayImage = block.image;
            if (index === 0 && latestUpcoming) {
              displayImage = latestUpcoming.image;
            } else if (index === 1 && latestCompleted) {
              displayImage = latestCompleted.image;
            }

            return (
              <div key={index} className={`info-block-row ${block.reverse ? 'reverse' : ''}`} style={{ marginBottom: index < configs.infoBlocks.length - 1 ? '4rem' : 0 }}>
                {block.reverse ? (
                  <>
                    <div className="info-text-container">
                      <span className="badge-pill">{block.badge}</span>
                      <h3>{block.title}</h3>
                      <p className="info-desc">{block.desc}</p>
                      <ul className="info-bullet-list">
                        {block.bullets && block.bullets.map((bullet, bIdx) => (
                          <li key={bIdx}><CheckCircle className="bullet-icon" size={18} /> {bullet}</li>
                        ))}
                      </ul>
                      <Link to={block.btnLink || '/events'} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                        {block.btnText} <ArrowRight size={16} />
                      </Link>
                    </div>
                    <div className="info-image-container">
                      <img 
                        src={displayImage} 
                        alt={block.title} 
                        className="info-img"
                      />
                      <div className="info-accent-blob secondary"></div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="info-image-container">
                      <img 
                        src={displayImage} 
                        alt={block.title} 
                        className="info-img"
                      />
                      <div className="info-accent-blob"></div>
                    </div>
                    <div className="info-text-container">
                      <span className="badge-pill">{block.badge}</span>
                      <h3>{block.title}</h3>
                      <p className="info-desc">{block.desc}</p>
                      <ul className="info-bullet-list">
                        {block.bullets && block.bullets.map((bullet, bIdx) => (
                          <li key={bIdx}><CheckCircle className="bullet-icon" size={18} /> {bullet}</li>
                        ))}
                      </ul>
                      <Link to={block.btnLink || '/events'} className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>
                        {block.btnText} <ArrowRight size={16} />
                      </Link>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Career Matcher Section */}
      <section className="section bg-light quiz-widget-section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3.5rem' }}>
            <span className="badge-pill">{configs.quiz?.badge || "Career Matcher Widget"}</span>
            <h2 className="section-title" style={{ marginTop: '0.5rem' }}>{configs.quiz?.title || "Find Your Ideal Skill Track"}</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
              {configs.quiz?.desc || "Unsure which path matches your strengths? Take this 30-second assessment to discover the best fit."}
            </p>
          </div>

          <div className="quiz-card-wrapper">
            <AnimatePresence mode="wait">
              {quizState === 'intro' && (
                <motion.div 
                  key="intro"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="quiz-card card text-center"
                >
                  <div className="quiz-icon-large">
                    <Compass size={40} />
                  </div>
                  <h3>{configs.quiz?.introTitle || "Career Fit Quiz"}</h3>
                  <p className="quiz-desc">
                    {configs.quiz?.introDesc || "Answer 3 quick questions about your creative tastes, coding experience, and professional goals to get a recommended skill path."}
                  </p>
                  <button onClick={startQuiz} className="btn btn-primary btn-lg quiz-start-btn">
                    {configs.quiz?.startBtnText || "Start Matcher"} <ArrowRight size={18} style={{ display: 'inline', marginLeft: '0.4rem', verticalAlign: 'middle' }} />
                  </button>
                </motion.div>
              )}

              {quizState === 'question' && (() => {
                const questionsList = configs.quiz?.questions || quizQuestions;
                return (
                  <motion.div 
                    key={`q-${currentQIdx}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="quiz-card card"
                  >
                    <div className="quiz-progress-bar-container">
                      <div 
                        className="quiz-progress-bar" 
                        style={{ width: `${((currentQIdx + 1) / questionsList.length) * 100}%` }}
                      />
                    </div>
                    <div className="quiz-header-flex">
                      <span className="quiz-q-counter">Question {currentQIdx + 1} of {questionsList.length}</span>
                    </div>
                    <h3 className="quiz-q-title">{questionsList[currentQIdx]?.question}</h3>
                    
                    <div className="quiz-options-list">
                      {questionsList[currentQIdx]?.options.map((opt, idx) => (
                        <button 
                          key={idx}
                          onClick={() => handleQuizAnswer(opt.type)}
                          className="quiz-option-btn"
                        >
                          <span className="option-bullet">{String.fromCharCode(65 + idx)}</span>
                          <span className="option-text">{opt.text}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                );
              })()}

              {quizState === 'result' && (() => {
                const resultInfo = configs.learningPaths[quizResult] || configs.learningPaths.web;
                return (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="quiz-card card result-card"
                    style={{ borderTop: `4px solid ${resultInfo.color}` }}
                  >
                    <div className="result-match-header">
                      <span 
                        className="result-icon-box" 
                        style={{ 
                          background: `${resultInfo.color}12`, 
                          color: resultInfo.color 
                        }}
                      >
                        {renderIcon(resultInfo.icon)}
                      </span>
                      <div>
                        <span className="result-badge-pill" style={{ background: `${resultInfo.color}15`, color: resultInfo.color }}>
                          <Sparkles size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> Perfect Match
                        </span>
                        <h3>{resultInfo.title} Track</h3>
                        <p className="duration-tag">Program Duration: {resultInfo.duration}</p>
                      </div>
                    </div>

                    <p className="result-description">{resultInfo.desc}</p>
                    
                    <div className="result-actions">
                      <Link 
                        to="/events" 
                        className="btn btn-primary"
                        style={{ 
                          backgroundColor: resultInfo.color, 
                          borderColor: resultInfo.color,
                          boxShadow: `0 4px 15px ${resultInfo.color}25`
                        }}
                      >
                        View Upcoming Classes
                      </Link>
                      <button onClick={restartQuiz} className="btn btn-secondary flex-center gap-2">
                        <RefreshCw size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> Retake Test
                      </button>
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Dynamic Accordion FAQ Section */}
      <section className="section bg-light faq-section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3.5rem' }}>
            <span className="badge-pill">Frequently Asked Questions</span>
            <h2 className="section-title" style={{ marginTop: '0.5rem' }}>Skills Portal FAQ</h2>
            <p style={{ color: 'var(--text-muted)' }}>Everything you need to know about starting your career path.</p>
          </div>

          <div className="faq-accordion-container">
            {configs.faqs.map((faq, idx) => (
              <div 
                className={`faq-item card ${activeFaq === idx ? 'open' : ''}`} 
                key={idx}
                onClick={() => toggleFaq(idx)}
              >
                <div className="faq-question-flex">
                  <h4>{faq.question}</h4>
                  <ChevronDown className="faq-toggle-icon" size={18} />
                </div>
                <AnimatePresence>
                  {activeFaq === idx && (
                    <motion.div 
                      className="faq-answer-block"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p>{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '4rem' }}>
            <span className="badge-pill">Student Success Stories</span>
            <h2 className="section-title" style={{ marginTop: '0.5rem' }}>Alumni Placements</h2>
            <p style={{ color: 'var(--text-muted)' }}>Hear from students who built skills and successfully joined corporate teams.</p>
          </div>

          <div className="grid grid-3">
            {configs.testimonials.map((test, index) => (
              <div className="card testimonial-card skills-testimonial" key={index}>
                <Quote className="quote-icon" />
                <p className="testimonial-text">"{test.quote}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{test.avatar || test.author.charAt(0)}</div>
                  <div>
                    <h4>{test.author}</h4>
                    <p>{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action: Centered Professional Banner */}
      <section className="section cta-section skills-cta text-center">
        <div className="container">
          <h2>{configs.cta?.title || "Ready to unlock your professional potential?"}</h2>
          <p>{configs.cta?.desc || "Register for our upcoming certified workshops and fast-track your applications to 500+ top recruiters today."}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={configs.cta?.btn1Link || "/events"} className="btn btn-white">{configs.cta?.btn1Text || "View Upcoming Classes"} <ArrowRight size={20} className="inline-icon" /></Link>
            <Link to={configs.cta?.btn2Link || "/contact"} className="btn btn-secondary" style={{ background: 'transparent', borderColor: 'white', color: 'white' }}>{configs.cta?.btn2Text || "Contact Advisors"}</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

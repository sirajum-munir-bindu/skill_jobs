import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Calendar, MapPin, Clock, Search, Plus, Edit2, Trash2, 
  Users, Award, Lock, LogOut, Check, Home as HomeIcon,
  Loader2, Mail, School, Eye, AlertCircle, Layout, GraduationCap, MessageSquare, Phone,
  Menu, X, Bell, ChevronRight, ChevronDown, User, Shield, Sparkles, Filter, Briefcase
} from 'lucide-react';
import './Admin.css';

const formatDate = (dateStr) => {
  if (!dateStr) return 'Recently';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? 'Recently' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const Admin = () => {
  // Authentication Passcode State
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(
    localStorage.getItem('admin_unlocked') === 'true'
  );
  const [authError, setAuthError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dashboard Data States
  const [events, setEvents] = useState([]);
  const [ambassadors, setAmbassadors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Homepage CMS configurations states
  const [homepageConfigs, setHomepageConfigs] = useState({
    hero: { badge: '', titleMain: '', titleGradient: '', videoUrl: '' },
    stats: { studentsTrained: 0, expertMentors: 0, placementSuccess: 0, campusChapters: 0 },
    faqs: [],
    testimonials: [],
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
        badge: "UPCOMING FLAGSHIP EVENT",
        title: "Join Our Next Mega Workshop & Competition",
        desc: "Don't miss our upcoming flagship workshops, hackathons, and industry competitions. Network with active corporate mentors, participate in real-time challenges, and unlock exclusive career opportunities.",
        bullets: [
          "Live interactive mentorship sessions with top corporate executives",
          "Hands-on project building and live competitive track challenges",
          "Win certificates of excellence and direct recruitment referrals"
        ],
        btnText: "Register For Event",
        btnLink: "/events",
        image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        reverse: false
      },
      {
        badge: "COMPLETED SEMINARS & EVENTS",
        title: "Relive Our Past Mega Seminars & Success Stories",
        desc: "Explore highlights from our recently completed campus bootcamps, corporate summits, and national seminars. Witness real student transformations, project showcases, and how our alumni transitioned directly into top corporate roles.",
        bullets: [
          "Archived masterclass recordings and downloadable seminar slides",
          "Alumni project highlights and live competition winners gallery",
          "Direct placement stats and recruiter testimonials from past events"
        ],
        btnText: "View Completed Seminars",
        btnLink: "/events",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
    },
    about: {
      badge: '',
      titleMain: '',
      titleGradient: '',
      subtitle: '',
      whoWeAreTitle: '',
      whoWeAreDesc1: '',
      whoWeAreDesc2: '',
      whoWeAreFeatures: ['', '', ''],
      whoWeAreImage: '',
      milestones: [
        { value: '', label: '', color: '' },
        { value: '', label: '', color: '' },
        { value: '', label: '', color: '' },
        { value: '', label: '', color: '' }
      ],
      values: [
        { title: '', desc: '', color: '' },
        { title: '', desc: '', color: '' },
        { title: '', desc: '', color: '' }
      ],
      timeline: [
        { year: '', title: '', desc: '' },
        { year: '', title: '', desc: '' },
        { year: '', title: '', desc: '' }
      ],
      ctaTitle: '',
      ctaDesc: '',
      ctaBtn1Text: '',
      ctaBtn2Text: ''
    },
    ambassador: {
      badge: '',
      titleMain: '',
      titleGradient: '',
      subtitle: '',
      introTitle: '',
      introDesc: '',
      rolesTitle: '',
      rolesList: ['', '', '', ''],
      benefitsTitle: '',
      benefitsSubtitle: '',
      benefitsList: [
        { title: '', desc: '', icon: '' },
        { title: '', desc: '', icon: '' },
        { title: '', desc: '', icon: '' },
        { title: '', desc: '', icon: '' },
        { title: '', desc: '', icon: '' },
        { title: '', desc: '', icon: '' }
      ],
      journeyTitle: '',
      journeySteps: [
        { phase: '', title: '', desc: '' },
        { phase: '', title: '', desc: '' },
        { phase: '', title: '', desc: '' },
        { phase: '', title: '', desc: '' }
      ],
      faqsTitle: '',
      faqsList: [],
      campuses: []
    },
    contact: {
      email: '',
      phone: '',
      address: '',
      facebook: '',
      linkedin: '',
      instagram: ''
    }
  });
  const [selectedPathKey, setSelectedPathKey] = useState('web');
  const [editingFaqIdx, setEditingFaqIdx] = useState(null);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '' });
  const [editingTestimonialIdx, setEditingTestimonialIdx] = useState(null);
  const [testimonialForm, setTestimonialForm] = useState({ quote: '', author: '', role: '', avatar: '' });

  // Ambassador CMS specific local states
  const [editingAmbFaqIdx, setEditingAmbFaqIdx] = useState(null);
  const [ambFaqForm, setAmbFaqForm] = useState({ question: '', answer: '' });
  const [selectedCampusIdx, setSelectedCampusIdx] = useState(0);
  const [editingLeadIdx, setEditingLeadIdx] = useState(null);
  const [leadForm, setLeadForm] = useState({ name: '', role: '', dept: '', image: '' });

  // Modals States
  const [showEventModal, setShowEventModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null); // null means "Create", otherwise holds event object for editing
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [currentApplication, setCurrentApplication] = useState(null);

  // Message States
  const [messages, setMessages] = useState([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [showAmbassadorModal, setShowAmbassadorModal] = useState(false);
  const [ambassadorForm, setAmbassadorForm] = useState({
    name: '',
    email: '',
    university: '',
    reason: 'Manually added by Admin.',
    status: 'Approved',
    image: '',
    role: '',
    dept: ''
  });

  // Form State for Event CRUD
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    image: '',
    category: '',
    status: 'Upcoming',
    regLink: ''
  });

  // Notification Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Show status popup toast
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  }, []);

  // Fetch Dashboard Stats and Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [eventsRes, ambassadorsRes, configsRes, messagesRes] = await Promise.all([
        fetch('http://localhost:5000/api/events'),
        fetch('http://localhost:5000/api/ambassadors'),
        fetch('http://localhost:5000/api/configs'),
        fetch('http://localhost:5000/api/messages')
      ]);

      if (eventsRes.ok && ambassadorsRes.ok) {
        const eventsData = await eventsRes.json();
        const ambassadorsData = await ambassadorsRes.json();
        setEvents(eventsData);
        setAmbassadors(ambassadorsData);
      }

      if (configsRes && configsRes.ok) {
        const configsData = await configsRes.json();
        setHomepageConfigs(prev => ({
          ...prev,
          ...configsData
        }));
      }

      if (messagesRes && messagesRes.ok) {
        const messagesData = await messagesRes.json();
        setMessages(messagesData);
      }
    } catch (err) {
      console.error(err);
      showToast('Error syncing data with database.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const handleSaveConfig = async (key, value) => {
    try {
      const response = await fetch('http://localhost:5000/api/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });

      if (response.ok) {
        showToast(`Homepage section '${key}' saved successfully!`, 'success');
        fetchData();
      } else {
        showToast('Failed to save configurations.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error saving configuration.', 'error');
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      const timer = setTimeout(() => {
        fetchData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isUnlocked, fetchData]);

  // Handle Passcode verification
  const handleUnlock = (e) => {
    e.preventDefault();
    if (passcode === 'admin123') {
      setIsUnlocked(true);
      localStorage.setItem('admin_unlocked', 'true');
      setAuthError('');
      showToast('Authenticated successfully. Welcome Admin!', 'success');
    } else {
      setAuthError('Incorrect Admin Passcode. Try again.');
      setPasscode('');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setIsUnlocked(false);
    localStorage.removeItem('admin_unlocked');
    setPasscode('');
    showToast('Logged out of admin panel.', 'success');
  };

  /* ==========================================================================
     EVENT HANDLERS & API CRUD CALLS
     ========================================================================== */

  // Open Event Modal (Create Mode)
  const handleOpenCreateModal = () => {
    setCurrentEvent(null);
    setEventForm({
      title: '',
      date: '',
      time: '',
      location: '',
      image: '',
      category: 'Workshop',
      status: 'Upcoming',
      regLink: ''
    });
    setShowEventModal(true);
  };

  // Open Event Modal (Edit Mode)
  const handleOpenEditModal = (event) => {
    setCurrentEvent(event);
    setEventForm({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      image: event.image,
      category: event.category,
      status: event.status || 'Upcoming',
      regLink: event.regLink || ''
    });
    setShowEventModal(true);
  };

  // Handle Input Form changes
  const handleFormChange = (e) => {
    setEventForm({ ...eventForm, [e.target.name]: e.target.value });
  };

  // Convert uploaded image file to Base64 string for DB storage
  const handleImageFile = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be under 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setEventForm(prev => ({ ...prev, image: e.target.result }));
    };
    reader.onerror = () => {
      showToast('Error reading image file.', 'error');
    };
    reader.readAsDataURL(file);
  };

  // Convert uploaded ambassador profile image file to Base64 string for DB storage
  const handleAmbassadorImageFile = (file) => {
    if (file.size > 2 * 1024 * 1024) {
      showToast('Profile image size should be under 2MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setAmbassadorForm(prev => ({ ...prev, image: e.target.result }));
    };
    reader.onerror = () => {
      showToast('Error reading image file.', 'error');
    };
    reader.readAsDataURL(file);
  };

  // Convert uploaded hero background media file (image/video) to Base64 string for DB storage
  const handleHeroMediaFile = (file) => {
    // MongoDB BSON limit is 16MB. Safe limit is 10MB to account for Base64 overhead (which adds ~33% size)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      showToast('Background media file size must be under 10MB.', 'error');
      return;
    }

    // We only accept images and videos
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      showToast('Please upload a valid image or video file.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setHomepageConfigs(prev => ({
        ...prev,
        hero: { ...prev.hero, videoUrl: e.target.result }
      }));
      showToast('Media file loaded! Remember to click "Save Hero Section Content" to apply.', 'success');
    };
    reader.onerror = () => {
      showToast('Error reading media file.', 'error');
    };
    reader.readAsDataURL(file);
  };


  // Convert uploaded Who We Are image file to Base64 string for DB storage
  const handleAboutWhoWeAreImageFile = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be under 5MB.', 'error');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setHomepageConfigs(prev => ({
        ...prev,
        about: { ...prev.about, whoWeAreImage: e.target.result }
      }));
      showToast('Who We Are image loaded! Remember to click "Save Who We Are Settings" to apply.', 'success');
    };
    reader.onerror = () => {
      showToast('Error reading image file.', 'error');
    };
    reader.readAsDataURL(file);
  };



  // Create or Update Event submit API call
  const handleEventSubmit = async (e) => {
    e.preventDefault();
    if (!eventForm.image) {
      showToast('Please upload an event banner image first.', 'error');
      return;
    }
    const isEditMode = !!currentEvent;
    const url = isEditMode 
      ? `http://localhost:5000/api/events/${currentEvent._id}`
      : 'http://localhost:5000/api/events';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventForm)
      });

      if (response.ok) {
        showToast(
          isEditMode ? 'Event details updated successfully!' : 'New event added to public listing!', 
          'success'
        );
        setShowEventModal(false);
        fetchData();
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Operation failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error connecting to the database server.', 'error');
    }
  };

  // Delete Event API call
  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this event? This action is irreversible.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/events/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showToast('Event removed successfully!', 'success');
        fetchData();
      } else {
        showToast('Failed to delete event record.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Database connection failure.', 'error');
    }
  };

  /* ==========================================================================
     AMBASSADOR HANDLERS & API CRUD CALLS
     ========================================================================== */

  // Update Ambassador status API call
  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/ambassadors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        showToast(`Application marked as ${newStatus}!`, 'success');
        fetchData();
      } else {
        showToast('Failed to update applicant status.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error updating status.', 'error');
    }
  };

  // Delete Ambassador Application API call
  const handleDeleteAmbassador = async (id) => {
    if (!window.confirm('Confirm delete application record? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/ambassadors/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showToast('Application deleted successfully.', 'success');
        fetchData();
      } else {
        showToast('Failed to delete application.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network connection failure.', 'error');
    }
  };

  // View application details essay modal
  const handleViewApplication = (app) => {
    setCurrentApplication(app);
    setShowApplicationModal(true);
  };

  // Delete Contact Message API call
  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact message?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/messages/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showToast('Message deleted successfully!', 'success');
        fetchData();
      } else {
        showToast('Failed to delete contact message.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network connection failure.', 'error');
    }
  };

  // View contact message details modal
  const handleViewMessage = (msg) => {
    setCurrentMessage(msg);
    setShowMessageModal(true);
  };

  // Open manual add ambassador modal
  const handleOpenAddAmbassadorModal = () => {
    setAmbassadorForm({
      name: '',
      email: '',
      university: '',
      reason: 'Manually added by Admin.',
      status: 'Approved',
      image: '',
      role: '',
      dept: ''
    });
    setShowAmbassadorModal(true);
  };

  // Submit manually added ambassador
  const handleAmbassadorSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/ambassador/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ambassadorForm)
      });

      if (response.ok) {
        showToast('Ambassador added successfully!', 'success');
        setShowAmbassadorModal(false);
        fetchData();
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Operation failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error connecting to the database server.', 'error');
    }
  };

  /* ==========================================================================
     FILTER & SORT COMPUTED STATES
     ========================================================================== */
  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAmbassadors = ambassadors.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.university.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMessages = messages.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute stat boxes values
  const totalEvents = events.length;
  const pendingApps = ambassadors.filter(a => a.status === 'Pending').length;
  const approvedAmbassadors = ambassadors.filter(a => a.status === 'Approved').length;

  /* ==========================================================================
     UI RENDER GATES
     ========================================================================== */

  // 1. Password Lock Gate Screen
  if (!isUnlocked) {
    return (
      <div className="admin-page">
        <div className="container admin-lock-container">
          <motion.div 
            className="lock-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="lock-icon-wrapper">
              <Lock size={28} />
            </div>
            <h2>Admin Control Panel</h2>
            <p>Access is restricted to authorized personnel. Please enter your admin passcode to manage events and applications.</p>
            <form onSubmit={handleUnlock} className="lock-form">
              <input 
                type="password" 
                placeholder="••••••••" 
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="passcode-input"
                autoFocus
              />
              <button type="submit" className="btn btn-primary w-100">
                Unlock Dashboard
              </button>
              {authError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', marginTop: '1.2rem', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '500' }}>
                  <AlertCircle size={16} />
                  <span>{authError}</span>
                </div>
              )}
            </form>
            <div style={{ marginTop: '2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Hint: Try <strong>admin123</strong>
            </div>
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', textAlign: 'center' }}>
              <Link to="/" className="btn btn-secondary w-100" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.7rem' }}>
                <HomeIcon size={16} /> Go to Homepage
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // 2. Unlocked Full Dashboard Screen
  return (
    <div className="admin-saas-layout">
      {/* Toast popup alerts */}
      {toast.show && (
        <div className={`toast-msg ${toast.type || 'success'}`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* FIXED LEFT SIDEBAR */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Top: Brand Logo + Badge */}
        <div className="sidebar-brand-section">
          <div className="sidebar-brand-flex">
            <div className="sidebar-logo-icon">
              <Sparkles size={20} />
            </div>
            <div className="sidebar-brand-text">
              <span className="brand-title">Skill Jobs</span>
              <span className="brand-subtitle">Admin Dashboard</span>
            </div>
          </div>
          <button className="sidebar-close-mobile" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Navigation Groups */}
        <div className="sidebar-nav-scroll">
          {/* Dashboard */}
          <div className="sidebar-group">
            <button 
              className={`sidebar-nav-item ${activeTab === null ? 'active' : ''}`}
              onClick={() => { setActiveTab(null); setSearchQuery(''); setSidebarOpen(false); }}
            >
              <div className="nav-item-icon">
                <Layout size={18} />
              </div>
              <span className="nav-item-label">Dashboard</span>
              {activeTab === null && <span className="active-indicator" />}
            </button>
          </div>

          <div className="sidebar-divider" />

          {/* Management */}
          <div className="sidebar-group">
            <div className="sidebar-group-title">Management</div>
            
            <button 
              className={`sidebar-nav-item ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => { setActiveTab('events'); setSearchQuery(''); setSidebarOpen(false); }}
            >
              <div className="nav-item-icon">
                <Calendar size={18} />
              </div>
              <span className="nav-item-label">Manage Events & Workshops</span>
              <span className="nav-badge-count">{totalEvents}</span>
              {activeTab === 'events' && <span className="active-indicator" />}
            </button>

            <button 
              className={`sidebar-nav-item ${activeTab === 'ambassadors' ? 'active' : ''}`}
              onClick={() => { setActiveTab('ambassadors'); setSearchQuery(''); setSidebarOpen(false); }}
            >
              <div className="nav-item-icon">
                <Users size={18} />
              </div>
              <span className="nav-item-label">Ambassador Applications</span>
              {pendingApps > 0 && <span className="nav-badge-pending">{pendingApps}</span>}
              {activeTab === 'ambassadors' && <span className="active-indicator" />}
            </button>
          </div>

          <div className="sidebar-divider" />

          {/* Website Configuration */}
          <div className="sidebar-group">
            <div className="sidebar-group-title">Website Configuration</div>
            
            <button 
              className={`sidebar-nav-item ${activeTab === 'homepage' ? 'active' : ''}`}
              onClick={() => { setActiveTab('homepage'); setSearchQuery(''); setSidebarOpen(false); }}
            >
              <div className="nav-item-icon">
                <Briefcase size={18} />
              </div>
              <span className="nav-item-label">Homepage Content</span>
              {activeTab === 'homepage' && <span className="active-indicator" />}
            </button>

            <button 
              className={`sidebar-nav-item ${activeTab === 'aboutpage' ? 'active' : ''}`}
              onClick={() => { setActiveTab('aboutpage'); setSearchQuery(''); setSidebarOpen(false); }}
            >
              <div className="nav-item-icon">
                <Award size={18} />
              </div>
              <span className="nav-item-label">About Page</span>
              {activeTab === 'aboutpage' && <span className="active-indicator" />}
            </button>

            <button 
              className={`sidebar-nav-item ${activeTab === 'ambassadorpage' ? 'active' : ''}`}
              onClick={() => { setActiveTab('ambassadorpage'); setSearchQuery(''); setSidebarOpen(false); }}
            >
              <div className="nav-item-icon">
                <GraduationCap size={18} />
              </div>
              <span className="nav-item-label">Ambassador Page</span>
              {activeTab === 'ambassadorpage' && <span className="active-indicator" />}
            </button>

            <button 
              className={`sidebar-nav-item ${activeTab === 'contactpage' ? 'active' : ''}`}
              onClick={() => { setActiveTab('contactpage'); setSearchQuery(''); setSidebarOpen(false); }}
            >
              <div className="nav-item-icon">
                <Phone size={18} />
              </div>
              <span className="nav-item-label">Contact Page</span>
              {activeTab === 'contactpage' && <span className="active-indicator" />}
            </button>
          </div>

          <div className="sidebar-divider" />

          {/* Communication */}
          <div className="sidebar-group">
            <div className="sidebar-group-title">Communication</div>
            
            <button 
              className={`sidebar-nav-item ${activeTab === 'contactmessages' ? 'active' : ''}`}
              onClick={() => { setActiveTab('contactmessages'); setSearchQuery(''); setSidebarOpen(false); }}
            >
              <div className="nav-item-icon">
                <MessageSquare size={18} />
              </div>
              <span className="nav-item-label">Contact Messages</span>
              <span className="nav-badge-count">{messages.length}</span>
              {activeTab === 'contactmessages' && <span className="active-indicator" />}
            </button>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="sidebar-footer">
          <button className="sidebar-footer-btn logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN INDEPENDENT SCROLLING CONTENT */}
      <main className="admin-main-wrapper">
        {/* TOP STICKY HEADER */}
        <header className="admin-top-header">
          <div className="top-header-left">
            <button className="mobile-sidebar-toggle" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="header-breadcrumbs">
              <span className="breadcrumb-root">Skill Jobs</span>
              <ChevronRight size={14} className="breadcrumb-separator" />
              <span className="breadcrumb-current">
                {activeTab === null && "Overview"}
                {activeTab === 'events' && "Manage Events & Workshops"}
                {activeTab === 'ambassadors' && "Ambassador Applications"}
                {activeTab === 'homepage' && "Homepage Content"}
                {activeTab === 'aboutpage' && "About Page"}
                {activeTab === 'ambassadorpage' && "Ambassador Page"}
                {activeTab === 'contactpage' && "Contact Page"}
                {activeTab === 'contactmessages' && "Contact Messages"}
              </span>
            </div>
          </div>

          <div className="top-header-right">
            {/* Search bar inside header */}
            <div className="header-search-box">
              <Search className="header-search-icon" size={16} />
              <input 
                type="text" 
                className="header-search-input" 
                placeholder={
                  activeTab === 'events' ? "Search events..." :
                  activeTab === 'ambassadors' ? "Search applications..." :
                  activeTab === 'contactmessages' ? "Search messages..." :
                  "Search across control panel..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button className="header-icon-btn" title="Notifications">
              <Bell size={18} />
              {pendingApps > 0 && <span className="notification-dot" />}
            </button>

            <div className="header-divider" />

            <div className="header-admin-profile">
              <div className="profile-avatar">
                <User size={18} />
              </div>
              <div className="profile-info">
                <span className="profile-name">Admin Profile</span>
                <span className="profile-role">Super Admin</span>
              </div>
            </div>

            <Link to="/" className="btn-header-homepage" title="Go to Homepage">
              <HomeIcon size={16} />
              <span>Homepage</span>
            </Link>

            <button className="btn-header-logout" onClick={handleLogout} title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* CONTENT BODY */}
        <div className="admin-content-body">
          {/* STATISTICS CARDS - ALWAYS PRESERVED & REDESIGNED */}
          <div className="saas-stats-grid">
            <div 
              className={`saas-stat-card clickable ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => { setActiveTab(activeTab === 'events' ? null : 'events'); setSearchQuery(''); }}
            >
              <div className="saas-stat-content">
                <span className="saas-stat-label">Total Events</span>
                <div className="saas-stat-number">{loading ? '...' : totalEvents}</div>
                <div className="saas-stat-subtext">Workshops & live training sessions</div>
              </div>
              <div className="saas-stat-icon events">
                <Calendar size={24} />
              </div>
            </div>

            <div 
              className={`saas-stat-card clickable ${activeTab === 'ambassadors' ? 'active' : ''}`}
              onClick={() => { setActiveTab(activeTab === 'ambassadors' ? null : 'ambassadors'); setSearchQuery(''); }}
            >
              <div className="saas-stat-content">
                <span className="saas-stat-label">Pending Applications</span>
                <div className="saas-stat-number">{loading ? '...' : pendingApps}</div>
                <div className="saas-stat-subtext">Awaiting administrative verification</div>
              </div>
              <div className="saas-stat-icon pending">
                <Users size={24} />
              </div>
            </div>

            <div 
              className={`saas-stat-card clickable ${activeTab === 'ambassadors' ? 'active' : ''}`}
              onClick={() => { setActiveTab(activeTab === 'ambassadors' ? null : 'ambassadors'); setSearchQuery(''); }}
            >
              <div className="saas-stat-content">
                <span className="saas-stat-label">Approved Ambassadors</span>
                <div className="saas-stat-number">{loading ? '...' : approvedAmbassadors}</div>
                <div className="saas-stat-subtext">Active campus leaders nationwide</div>
              </div>
              <div className="saas-stat-icon approved">
                <Award size={24} />
              </div>
            </div>
          </div>

          {/* MAIN CONTENT DYNAMIC CONTAINER */}
          <div className="saas-main-container">
            {/* Toolbar Header for Tabular Lists */}
            {(activeTab === 'events' || activeTab === 'ambassadors' || activeTab === 'contactmessages') && (
              <div className="saas-section-header">
                <div className="saas-section-title">
                  <h3>
                    {activeTab === 'events' && "Manage Events & Workshops Directory"}
                    {activeTab === 'ambassadors' && `Ambassador Applications (${pendingApps} Pending)`}
                    {activeTab === 'contactmessages' && `Inbound Contact Messages (${messages.length})`}
                  </h3>
                  <p>
                    {activeTab === 'events' && "Create, edit, or remove live masterclasses and workshops."}
                    {activeTab === 'ambassadors' && "Review cover applications, verify institutions, and update ambassador statuses."}
                    {activeTab === 'contactmessages' && "Manage and review messages submitted through the website contact form."}
                  </p>
                </div>
                
                <div className="saas-section-actions">
                  <div className="saas-toolbar-search">
                    <Search className="saas-search-icon" size={16} />
                    <input 
                      type="text" 
                      className="saas-search-input" 
                      placeholder={
                        activeTab === 'events' ? "Filter events..." :
                        activeTab === 'ambassadors' ? "Filter candidates..." :
                        "Filter messages..."
                      }
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {activeTab === 'events' && (
                    <button className="saas-btn-primary" onClick={handleOpenCreateModal}>
                      <Plus size={18} />
                      <span>Create Event</span>
                    </button>
                  )}

                  {activeTab === 'ambassadors' && (
                    <button className="saas-btn-primary" onClick={handleOpenAddAmbassadorModal}>
                      <Plus size={18} />
                      <span>Add Ambassador</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
                <Loader2 className="animate-spin text-gradient" size={48} style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ color: 'var(--text-muted)' }}>Retrieving latest database records...</p>
              </div>
            ) : activeTab === 'events' ? (
              /* EVENTS MANAGEMENT SUB-TAB */
              filteredEvents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                  <h4>No events match your criteria.</h4>
                  <p>Create a new event or clear your query.</p>
                </div>
              ) : (
                <div className="events-list-flex">
                  {filteredEvents.map((event) => (
                    <div className="admin-event-row" key={event._id}>
                      <img src={event.image} alt={event.title} className="admin-event-img" />
                      <div className="admin-event-info">
                        <h4>{event.title}</h4>
                        <div className="admin-event-meta">
                          <span><Calendar size={13} /> {event.date}</span>
                          <span><Clock size={13} /> {event.time}</span>
                          <span><MapPin size={13} /> {event.location}</span>
                          <span style={{ textTransform: 'capitalize', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent)', padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
                            {event.category}
                          </span>
                          <span style={{ 
                            textTransform: 'capitalize', 
                            background: event.status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)', 
                            color: event.status === 'Completed' ? '#10b981' : '#3b82f6', 
                            padding: '0.1rem 0.5rem', 
                            borderRadius: '4px', 
                            fontSize: '0.75rem', 
                            fontWeight: '600' 
                          }}>
                            {event.status || 'Upcoming'}
                          </span>
                        </div>
                      </div>
                      <div className="action-buttons">
                        <button className="btn-icon edit" title="Edit Event" onClick={() => handleOpenEditModal(event)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="btn-icon delete" title="Delete Event" onClick={() => handleDeleteEvent(event._id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : activeTab === 'ambassadors' ? (
              /* AMBASSADOR APPLICATIONS SUB-TAB */
              filteredAmbassadors.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                  <h4>No applications found.</h4>
                  <p>New candidate submissions will display here.</p>
                </div>
              ) : (
                <div className="responsive-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>University / Institution</th>
                        <th>Applied On</th>
                        <th>Status Status</th>
                        <th>Actions Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAmbassadors.map((app) => (
                        <tr key={app._id}>
                          <td>
                            <div className="applicant-identity">
                              <h5>{app.name}</h5>
                              <p style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Mail size={12} /> {app.email}
                              </p>
                            </div>
                          </td>
                          <td>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)' }}>
                               <School size={14} style={{ color: 'var(--text-muted)' }} />
                              {app.university}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            {formatDate(app.createdAt)}
                          </td>
                          <td>
                            <select 
                              className={`status-select ${app.status}`}
                              value={app.status}
                              onChange={(e) => handleStatusChange(app._id, e.target.value)}
                            >
                              <option value="Pending">🕒 Pending</option>
                              <option value="Approved">✅ Approved</option>
                              <option value="Rejected">❌ Rejected</option>
                            </select>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-icon edit" title="Read Cover Application" onClick={() => handleViewApplication(app)}>
                                <Eye size={16} />
                              </button>
                              <button className="btn-icon delete" title="Delete Record" onClick={() => handleDeleteAmbassador(app._id)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : activeTab === 'homepage' ? (
              /* HOMEPAGE DYNAMIC SECTORS CMS TAB */
              <div className="homepage-cms-container">
                {/* Hero Section Config */}
                <div className="cms-section-card card">
                  <div className="cms-section-header">
                    <h4>Hero Header Settings</h4>
                    <span className="cms-section-tag">Hero</span>
                  </div>
                  <form onSubmit={(e) => { 
                    e.preventDefault(); 
                    if (!homepageConfigs.hero.videoUrl) {
                      showToast('Please upload a background media file first.', 'error');
                      return;
                    }
                    handleSaveConfig('hero', homepageConfigs.hero); 
                  }} className="cms-form">
                    <div className="form-group">
                      <label>Badge Highlight Text</label>
                      <input 
                        type="text" 
                        value={homepageConfigs.hero.badge || ''} 
                        onChange={(e) => setHomepageConfigs({
                          ...homepageConfigs,
                          hero: { ...homepageConfigs.hero, badge: e.target.value }
                        })}
                        placeholder="e.g. Welcome to Skill Jobs"
                        required
                      />
                    </div>
                    <div className="grid-2" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr', marginTop: '1rem' }}>
                      <div className="form-group">
                        <label>Main Title Text</label>
                        <input 
                          type="text" 
                          value={homepageConfigs.hero.titleMain || ''} 
                          onChange={(e) => setHomepageConfigs({
                            ...homepageConfigs,
                            hero: { ...homepageConfigs.hero, titleMain: e.target.value }
                          })}
                          placeholder="e.g. Shape Your Future with"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Gradient Highlight Title</label>
                        <input 
                          type="text" 
                          value={homepageConfigs.hero.titleGradient || ''} 
                          onChange={(e) => setHomepageConfigs({
                            ...homepageConfigs,
                            hero: { ...homepageConfigs.hero, titleGradient: e.target.value }
                          })}
                          placeholder="e.g. Professional Skills & Mentorship"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                      <label>Background Media (Video or Image)</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {homepageConfigs.hero.videoUrl && (
                          <div style={{ position: 'relative', width: '100%', maxHeight: '240px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1', background: '#0f172a' }}>
                            {homepageConfigs.hero.videoUrl.startsWith('data:image/') || /\.(jpg|jpeg|png|gif|webp|svg)($|\?)/i.test(homepageConfigs.hero.videoUrl) ? (
                              <img 
                                src={homepageConfigs.hero.videoUrl} 
                                alt="Preview Banner" 
                                style={{ width: '100%', height: '240px', objectFit: 'cover' }} 
                              />
                            ) : (
                              <video 
                                src={homepageConfigs.hero.videoUrl} 
                                controls 
                                muted 
                                style={{ width: '100%', height: '240px', objectFit: 'cover' }} 
                              />
                            )}
                            <button 
                              type="button" 
                              style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
                              onClick={() => setHomepageConfigs(prev => ({
                                ...prev,
                                hero: { ...prev.hero, videoUrl: '' }
                              }))}
                            >
                              &times;
                            </button>
                          </div>
                        )}
                        
                        {!homepageConfigs.hero.videoUrl && (
                          <div 
                            style={{ 
                              border: '2px dashed #cbd5e1', 
                              borderRadius: '10px', 
                              padding: '2rem', 
                              textAlign: 'center', 
                              background: '#f8fafc',
                              cursor: 'pointer',
                              position: 'relative',
                              transition: 'all 0.2s ease'
                            }}
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const file = e.dataTransfer.files[0];
                              if (file) handleHeroMediaFile(file);
                            }}
                          >
                            <input 
                              type="file" 
                              accept="video/*,image/*" 
                              id="hero-media-upload" 
                              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) handleHeroMediaFile(file);
                              }}
                            />
                            <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                              <Plus size={24} style={{ color: 'var(--accent)' }} />
                              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '500' }}>
                                <span style={{ color: 'var(--accent)', fontWeight: '600' }}>Click to upload</span> or drag and drop
                              </p>
                              <p style={{ margin: 0, fontSize: '0.8rem' }}>MP4, WebM, PNG, JPG or WEBP up to 10MB</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem', borderRadius: '8px', padding: '0.6rem 1.5rem' }}>
                      Save Hero Section Content
                    </button>
                  </form>
                </div>

                {/* Stats Section Config */}
                <div className="cms-section-card card" style={{ marginTop: '2rem' }}>
                  <div className="cms-section-header">
                    <h4>Achievements Statistics Settings</h4>
                    <span className="cms-section-tag">Stats</span>
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); handleSaveConfig('stats', homepageConfigs.stats); }} className="cms-form">
                    <div className="grid-4" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                      <div className="form-group">
                        <label>Students Trained</label>
                        <input 
                          type="number" 
                          value={homepageConfigs.stats.studentsTrained || 0} 
                          onChange={(e) => setHomepageConfigs({
                            ...homepageConfigs,
                            stats: { ...homepageConfigs.stats, studentsTrained: parseInt(e.target.value) || 0 }
                          })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Expert Mentors</label>
                        <input 
                          type="number" 
                          value={homepageConfigs.stats.expertMentors || 0} 
                          onChange={(e) => setHomepageConfigs({
                            ...homepageConfigs,
                            stats: { ...homepageConfigs.stats, expertMentors: parseInt(e.target.value) || 0 }
                          })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Placement Success %</label>
                        <input 
                          type="number" 
                          value={homepageConfigs.stats.placementSuccess || 0} 
                          onChange={(e) => setHomepageConfigs({
                            ...homepageConfigs,
                            stats: { ...homepageConfigs.stats, placementSuccess: parseInt(e.target.value) || 0 }
                          })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Campus Chapters</label>
                        <input 
                          type="number" 
                          value={homepageConfigs.stats.campusChapters || 0} 
                          onChange={(e) => setHomepageConfigs({
                            ...homepageConfigs,
                            stats: { ...homepageConfigs.stats, campusChapters: parseInt(e.target.value) || 0 }
                          })}
                          required
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem', borderRadius: '8px', padding: '0.6rem 1.5rem' }}>
                      Save Statistics Section Content
                    </button>
                  </form>
                </div>

                {/* FAQ Accordion Config */}
                <div className="cms-section-card card" style={{ marginTop: '2rem' }}>
                  <div className="cms-section-header">
                    <h4>Frequently Asked Questions (FAQ) Manager</h4>
                    <span className="cms-section-tag">FAQ</span>
                  </div>

                  <div className="cms-items-list">
                    {homepageConfigs.faqs.map((faq, index) => (
                      <div className="cms-item-row" key={index}>
                        <div className="cms-item-details">
                          <h5>Q: {faq.question}</h5>
                          <p>A: {faq.answer}</p>
                        </div>
                        <div className="action-buttons">
                          <button 
                            className="btn-icon edit" 
                            title="Edit FAQ"
                            onClick={() => {
                              setEditingFaqIdx(index);
                              setFaqForm({ question: faq.question, answer: faq.answer });
                            }}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button 
                            className="btn-icon delete" 
                            title="Delete FAQ"
                            onClick={() => {
                              if (window.confirm('Delete this FAQ item?')) {
                                const updatedFaqs = homepageConfigs.faqs.filter((_, i) => i !== index);
                                setHomepageConfigs({ ...homepageConfigs, faqs: updatedFaqs });
                                handleSaveConfig('faqs', updatedFaqs);
                              }
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add / Edit FAQ form */}
                  <div className="cms-item-add-form" style={{ marginTop: '2rem', borderTop: '1px solid rgba(15,23,42,0.08)', paddingTop: '1.5rem' }}>
                    <h5>{editingFaqIdx !== null ? '✏️ Edit FAQ Item' : '➕ Add FAQ Item'}</h5>
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                      <label>Question</label>
                      <input 
                        type="text" 
                        value={faqForm.question} 
                        onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                        placeholder="e.g. Are the certificates industry-recognized?"
                      />
                    </div>
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                      <label>Answer</label>
                      <textarea 
                        rows="3" 
                        value={faqForm.answer} 
                        onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                        placeholder="Detail the answer here..."
                      ></textarea>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.2rem' }}>
                      <button 
                        type="button" 
                        className="btn btn-primary" 
                        onClick={() => {
                          if (!faqForm.question || !faqForm.answer) {
                            showToast('Please fill in both question and answer fields.', 'error');
                            return;
                          }
                          let updatedFaqs = [...homepageConfigs.faqs];
                          if (editingFaqIdx !== null) {
                            updatedFaqs[editingFaqIdx] = faqForm;
                            setEditingFaqIdx(null);
                          } else {
                            updatedFaqs.push(faqForm);
                          }
                          setHomepageConfigs({ ...homepageConfigs, faqs: updatedFaqs });
                          handleSaveConfig('faqs', updatedFaqs);
                          setFaqForm({ question: '', answer: '' });
                        }}
                        style={{ borderRadius: '6px', padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
                      >
                        {editingFaqIdx !== null ? 'Apply FAQ Edits' : 'Add FAQ to List'}
                      </button>
                      {editingFaqIdx !== null && (
                        <button 
                          type="button" 
                          className="btn btn-secondary" 
                          onClick={() => {
                            setEditingFaqIdx(null);
                            setFaqForm({ question: '', answer: '' });
                          }}
                          style={{ borderRadius: '6px', padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
                        >
                          Cancel Editing
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Testimonials section Config */}
                <div className="cms-section-card card" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                  <div className="cms-section-header">
                    <h4>Alumni Success Stories Testimonial Manager</h4>
                    <span className="cms-section-tag">Testimonial</span>
                  </div>

                  <div className="cms-items-list">
                    {homepageConfigs.testimonials.map((test, index) => (
                      <div className="cms-item-row" key={index}>
                        <div className="cms-item-details">
                          <h5>{test.author} ({test.role})</h5>
                          <p>"{test.quote}"</p>
                        </div>
                        <div className="action-buttons">
                          <button 
                            className="btn-icon edit" 
                            title="Edit Testimonial"
                            onClick={() => {
                              setEditingTestimonialIdx(index);
                              setTestimonialForm(test);
                            }}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button 
                            className="btn-icon delete" 
                            title="Delete Testimonial"
                            onClick={() => {
                              if (window.confirm('Delete this success story?')) {
                                const updatedTestimonials = homepageConfigs.testimonials.filter((_, i) => i !== index);
                                setHomepageConfigs({ ...homepageConfigs, testimonials: updatedTestimonials });
                                handleSaveConfig('testimonials', updatedTestimonials);
                              }
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add / Edit Testimonial form */}
                  <div className="cms-item-add-form" style={{ marginTop: '2rem', borderTop: '1px solid rgba(15,23,42,0.08)', paddingTop: '1.5rem' }}>
                    <h5>{editingTestimonialIdx !== null ? '✏️ Edit Alumni Success Story' : '➕ Add Alumni Success Story'}</h5>
                    <div className="grid-3" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '2fr 2fr 1fr', marginTop: '1rem' }}>
                      <div className="form-group">
                        <label>Author Full Name</label>
                        <input 
                          type="text" 
                          value={testimonialForm.author} 
                          onChange={(e) => setTestimonialForm({ ...testimonialForm, author: e.target.value })}
                          placeholder="e.g. Aisha Rahman"
                        />
                      </div>
                      <div className="form-group">
                        <label>Role / Position</label>
                        <input 
                          type="text" 
                          value={testimonialForm.role} 
                          onChange={(e) => setTestimonialForm({ ...testimonialForm, role: e.target.value })}
                          placeholder="e.g. Software Engineer, MNC"
                        />
                      </div>
                      <div className="form-group">
                        <label>Avatar Letter</label>
                        <input 
                          type="text" 
                          maxLength="1"
                          value={testimonialForm.avatar} 
                          onChange={(e) => setTestimonialForm({ ...testimonialForm, avatar: e.target.value })}
                          placeholder="e.g. A"
                        />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                      <label>Alumni Quote / Feedback</label>
                      <textarea 
                        rows="3" 
                        value={testimonialForm.quote} 
                        onChange={(e) => setTestimonialForm({ ...testimonialForm, quote: e.target.value })}
                        placeholder="Detail the student's quote here..."
                      ></textarea>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.2rem' }}>
                      <button 
                        type="button" 
                        className="btn btn-primary" 
                        onClick={() => {
                          if (!testimonialForm.author || !testimonialForm.role || !testimonialForm.quote) {
                            showToast('Please fill in author name, role, and quote fields.', 'error');
                            return;
                          }
                          let updatedTestimonials = [...homepageConfigs.testimonials];
                          if (editingTestimonialIdx !== null) {
                            updatedTestimonials[editingTestimonialIdx] = testimonialForm;
                            setEditingTestimonialIdx(null);
                          } else {
                            updatedTestimonials.push(testimonialForm);
                          }
                          setHomepageConfigs({ ...homepageConfigs, testimonials: updatedTestimonials });
                          handleSaveConfig('testimonials', updatedTestimonials);
                          setTestimonialForm({ quote: '', author: '', role: '', avatar: '' });
                        }}
                        style={{ borderRadius: '6px', padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
                      >
                        {editingTestimonialIdx !== null ? 'Apply Testimonial Edits' : 'Add Testimonial to List'}
                      </button>
                      {editingTestimonialIdx !== null && (
                        <button 
                          type="button" 
                          className="btn btn-secondary" 
                          onClick={() => {
                            setEditingTestimonialIdx(null);
                            setTestimonialForm({ quote: '', author: '', role: '', avatar: '' });
                          }}
                          style={{ borderRadius: '6px', padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
                        >
                          Cancel Editing
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Learning Paths Section Config */}
                <div className="cms-section-card card" style={{ marginTop: '2rem' }}>
                  <div className="cms-section-header">
                    <h4>Interactive Learning Paths Settings</h4>
                    <span className="cms-section-tag">Paths</span>
                  </div>
                  
                  {/* Tab Selector for Paths */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#f1f5f9', padding: '0.4rem', borderRadius: '8px' }}>
                    {Object.keys(homepageConfigs.learningPaths || {}).map((key) => (
                      <button
                        key={key}
                        type="button"
                        className={`tab-btn ${selectedPathKey === key ? 'active' : ''}`}
                        onClick={() => setSelectedPathKey(key)}
                        style={{
                          flex: 1,
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          border: 'none',
                          background: selectedPathKey === key ? 'var(--primary)' : 'transparent',
                          color: selectedPathKey === key ? '#ffffff' : 'var(--text)',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {homepageConfigs.learningPaths[key].title}
                      </button>
                    ))}
                  </div>

                  {homepageConfigs.learningPaths && homepageConfigs.learningPaths[selectedPathKey] && (
                    <div className="cms-form">
                      <div className="grid-2" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                        <div className="form-group">
                          <label>Path Title</label>
                          <input 
                            type="text" 
                            value={homepageConfigs.learningPaths[selectedPathKey].title || ''} 
                            onChange={(e) => {
                              const updated = { ...homepageConfigs.learningPaths };
                              updated[selectedPathKey].title = e.target.value;
                              setHomepageConfigs({ ...homepageConfigs, learningPaths: updated });
                            }}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Badge text</label>
                          <input 
                            type="text" 
                            value={homepageConfigs.learningPaths[selectedPathKey].badge || ''} 
                            onChange={(e) => {
                              const updated = { ...homepageConfigs.learningPaths };
                              updated[selectedPathKey].badge = e.target.value;
                              setHomepageConfigs({ ...homepageConfigs, learningPaths: updated });
                            }}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid-3" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '2fr 1fr 1fr', marginTop: '1rem' }}>
                        <div className="form-group">
                          <label>Duration Info</label>
                          <input 
                            type="text" 
                            value={homepageConfigs.learningPaths[selectedPathKey].duration || ''} 
                            onChange={(e) => {
                              const updated = { ...homepageConfigs.learningPaths };
                              updated[selectedPathKey].duration = e.target.value;
                              setHomepageConfigs({ ...homepageConfigs, learningPaths: updated });
                            }}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Theme Color Hex</label>
                          <input 
                            type="color" 
                            value={homepageConfigs.learningPaths[selectedPathKey].color || '#0284c7'} 
                            onChange={(e) => {
                              const updated = { ...homepageConfigs.learningPaths };
                              updated[selectedPathKey].color = e.target.value;
                              setHomepageConfigs({ ...homepageConfigs, learningPaths: updated });
                            }}
                            style={{ height: '40px', padding: '0', width: '100%', cursor: 'pointer' }}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Icon Type</label>
                          <select 
                            value={homepageConfigs.learningPaths[selectedPathKey].icon || 'Code'} 
                            onChange={(e) => {
                              const updated = { ...homepageConfigs.learningPaths };
                              updated[selectedPathKey].icon = e.target.value;
                              setHomepageConfigs({ ...homepageConfigs, learningPaths: updated });
                            }}
                            required
                          >
                            <option value="Code">💻 Code Icon</option>
                            <option value="Brain">🧠 Brain Icon</option>
                            <option value="Layers">🥞 Layers Icon</option>
                            <option value="GraduationCap">🎓 Graduation Icon</option>
                            <option value="Compass">🧭 Compass Icon</option>
                            <option value="Sparkles">✨ Sparkles Icon</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label>Path Description</label>
                        <textarea 
                          rows="2"
                          value={homepageConfigs.learningPaths[selectedPathKey].desc || ''} 
                          onChange={(e) => {
                            const updated = { ...homepageConfigs.learningPaths };
                            updated[selectedPathKey].desc = e.target.value;
                            setHomepageConfigs({ ...homepageConfigs, learningPaths: updated });
                          }}
                          required
                        />
                      </div>

                      <div className="grid-2" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr', marginTop: '1rem' }}>
                        <div className="form-group">
                          <label>Technologies Mastered (Comma-separated)</label>
                          <input 
                            type="text" 
                            value={Array.isArray(homepageConfigs.learningPaths[selectedPathKey].tools) ? homepageConfigs.learningPaths[selectedPathKey].tools.join(', ') : ''} 
                            onChange={(e) => {
                              const updated = { ...homepageConfigs.learningPaths };
                              updated[selectedPathKey].tools = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                              setHomepageConfigs({ ...homepageConfigs, learningPaths: updated });
                            }}
                            placeholder="e.g. React, Node.js, MongoDB"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Curriculum Modules Roadmap (One module per line)</label>
                          <textarea 
                            rows="4"
                            value={Array.isArray(homepageConfigs.learningPaths[selectedPathKey].modules) ? homepageConfigs.learningPaths[selectedPathKey].modules.join('\n') : ''} 
                            onChange={(e) => {
                              const updated = { ...homepageConfigs.learningPaths };
                              updated[selectedPathKey].modules = e.target.value.split('\n').map(s => s.trim()).filter(Boolean);
                              setHomepageConfigs({ ...homepageConfigs, learningPaths: updated });
                            }}
                            placeholder="e.g. Frontend UI Development&#10;Backend Architecture"
                            required
                          />
                        </div>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '1.5rem' }}>
                        <h5 style={{ margin: '0 0 0.75rem 0', color: 'var(--text)', fontSize: '0.9rem', fontWeight: '600' }}>Capstone Project Highlight</h5>
                        <div className="form-group">
                          <label>Project Name</label>
                          <input 
                            type="text" 
                            value={homepageConfigs.learningPaths[selectedPathKey].capstone?.name || ''} 
                            onChange={(e) => {
                              const updated = { ...homepageConfigs.learningPaths };
                              if (!updated[selectedPathKey].capstone) updated[selectedPathKey].capstone = {};
                              updated[selectedPathKey].capstone.name = e.target.value;
                              setHomepageConfigs({ ...homepageConfigs, learningPaths: updated });
                            }}
                            required
                          />
                        </div>
                        <div className="form-group" style={{ marginTop: '0.75rem' }}>
                          <label>Project Description</label>
                          <textarea 
                            rows="2"
                            value={homepageConfigs.learningPaths[selectedPathKey].capstone?.desc || ''} 
                            onChange={(e) => {
                              const updated = { ...homepageConfigs.learningPaths };
                              if (!updated[selectedPathKey].capstone) updated[selectedPathKey].capstone = {};
                              updated[selectedPathKey].capstone.desc = e.target.value;
                              setHomepageConfigs({ ...homepageConfigs, learningPaths: updated });
                            }}
                            required
                          />
                        </div>
                      </div>

                      <button 
                        type="button" 
                        className="btn btn-primary" 
                        onClick={() => handleSaveConfig('learningPaths', homepageConfigs.learningPaths)}
                        style={{ marginTop: '1.5rem', borderRadius: '8px', padding: '0.6rem 1.5rem' }}
                      >
                        Save Learning Path Content
                      </button>
                    </div>
                  )}
                </div>



                {/* Career Matcher Quiz Config */}
                <div className="cms-section-card card" style={{ marginTop: '2rem' }}>
                  <div className="cms-section-header">
                    <h4>Career Matcher Quiz Settings</h4>
                    <span className="cms-section-tag">Quiz</span>
                  </div>
                  <div className="cms-form">
                    <h5 style={{ margin: '0 0 1rem 0', color: 'var(--primary)', fontWeight: '600' }}>Header Details</h5>
                    <div className="grid-3" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr 1fr' }}>
                      <div className="form-group">
                        <label>Section Badge</label>
                        <input 
                          type="text" 
                          value={homepageConfigs.quiz.badge || ''} 
                          onChange={(e) => {
                            setHomepageConfigs({
                              ...homepageConfigs,
                              quiz: { ...homepageConfigs.quiz, badge: e.target.value }
                            });
                          }}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Section Title</label>
                        <input 
                          type="text" 
                          value={homepageConfigs.quiz.title || ''} 
                          onChange={(e) => {
                            setHomepageConfigs({
                              ...homepageConfigs,
                              quiz: { ...homepageConfigs.quiz, title: e.target.value }
                            });
                          }}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Start Button Label</label>
                        <input 
                          type="text" 
                          value={homepageConfigs.quiz.startBtnText || ''} 
                          onChange={(e) => {
                            setHomepageConfigs({
                              ...homepageConfigs,
                              quiz: { ...homepageConfigs.quiz, startBtnText: e.target.value }
                            });
                          }}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid-2" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 2fr', marginTop: '1rem' }}>
                      <div className="form-group">
                        <label>Quiz Card Main Header</label>
                        <input 
                          type="text" 
                          value={homepageConfigs.quiz.introTitle || ''} 
                          onChange={(e) => {
                            setHomepageConfigs({
                              ...homepageConfigs,
                              quiz: { ...homepageConfigs.quiz, introTitle: e.target.value }
                            });
                          }}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Section Subtitle description</label>
                        <input 
                          type="text" 
                          value={homepageConfigs.quiz.desc || ''} 
                          onChange={(e) => {
                            setHomepageConfigs({
                              ...homepageConfigs,
                              quiz: { ...homepageConfigs.quiz, desc: e.target.value }
                            });
                          }}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                      <label>Quiz Card Subtitle description</label>
                      <textarea 
                        rows="2"
                        value={homepageConfigs.quiz.introDesc || ''} 
                        onChange={(e) => {
                          setHomepageConfigs({
                            ...homepageConfigs,
                            quiz: { ...homepageConfigs.quiz, introDesc: e.target.value }
                          });
                        }}
                        required
                      />
                    </div>

                    <h5 style={{ margin: '2rem 0 1rem 0', color: 'var(--primary)', fontWeight: '600' }}>Questions Manager</h5>
                    {homepageConfigs.quiz.questions && homepageConfigs.quiz.questions.map((q, qIdx) => (
                      <div key={q.id || qIdx} style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                        <div className="form-group">
                          <label style={{ fontWeight: '600', color: 'var(--text)' }}>Question {qIdx + 1}</label>
                          <input 
                            type="text" 
                            value={q.question || ''} 
                            onChange={(e) => {
                              const updatedQs = [...homepageConfigs.quiz.questions];
                              updatedQs[qIdx].question = e.target.value;
                              setHomepageConfigs({
                                ...homepageConfigs,
                                quiz: { ...homepageConfigs.quiz, questions: updatedQs }
                              });
                            }}
                            required
                          />
                        </div>

                        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Options & Recommendations mapping:</label>
                          {q.options && q.options.map((opt, optIdx) => (
                            <div key={optIdx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent)', minWidth: '80px' }}>
                                Option {String.fromCharCode(65 + optIdx)} ({opt.type.toUpperCase()}):
                              </span>
                              <input 
                                type="text" 
                                value={opt.text || ''} 
                                onChange={(e) => {
                                  const updatedQs = [...homepageConfigs.quiz.questions];
                                  updatedQs[qIdx].options[optIdx].text = e.target.value;
                                  setHomepageConfigs({
                                    ...homepageConfigs,
                                    quiz: { ...homepageConfigs.quiz, questions: updatedQs }
                                  });
                                }}
                                style={{ flex: 1 }}
                                required
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      onClick={() => handleSaveConfig('quiz', homepageConfigs.quiz)}
                      style={{ marginTop: '0.75rem', borderRadius: '8px', padding: '0.6rem 1.5rem' }}
                    >
                      Save Quiz Questions & Headers
                    </button>
                  </div>
                </div>

                {/* CTA Section Config */}
                <div className="cms-section-card card" style={{ marginTop: '2rem' }}>
                  <div className="cms-section-header">
                    <h4>CTA Banner Settings</h4>
                    <span className="cms-section-tag">CTA</span>
                  </div>
                  <div className="cms-form">
                    <div className="form-group">
                      <label>CTA Title Banner Header</label>
                      <input 
                        type="text" 
                        value={homepageConfigs.cta.title || ''} 
                        onChange={(e) => {
                          setHomepageConfigs({
                            ...homepageConfigs,
                            cta: { ...homepageConfigs.cta, title: e.target.value }
                          });
                        }}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                      <label>CTA Description Subtitle</label>
                      <textarea 
                        rows="2"
                        value={homepageConfigs.cta.desc || ''} 
                        onChange={(e) => {
                          setHomepageConfigs({
                            ...homepageConfigs,
                            cta: { ...homepageConfigs.cta, desc: e.target.value }
                          });
                        }}
                        required
                      />
                    </div>
                    
                    <div className="grid-2" style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr', marginTop: '1.25rem' }}>
                      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <h5 style={{ margin: '0 0 0.75rem 0', color: 'var(--text)', fontSize: '0.9rem', fontWeight: '600' }}>Primary Button (White)</h5>
                        <div className="form-group">
                          <label>Button Label</label>
                          <input 
                            type="text" 
                            value={homepageConfigs.cta.btn1Text || ''} 
                            onChange={(e) => {
                              setHomepageConfigs({
                                ...homepageConfigs,
                                cta: { ...homepageConfigs.cta, btn1Text: e.target.value }
                              });
                            }}
                            required
                          />
                        </div>
                        <div className="form-group" style={{ marginTop: '0.75rem' }}>
                          <label>Button Action Path</label>
                          <input 
                            type="text" 
                            value={homepageConfigs.cta.btn1Link || ''} 
                            onChange={(e) => {
                              setHomepageConfigs({
                                ...homepageConfigs,
                                cta: { ...homepageConfigs.cta, btn1Link: e.target.value }
                              });
                            }}
                            required
                          />
                        </div>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <h5 style={{ margin: '0 0 0.75rem 0', color: 'var(--text)', fontSize: '0.9rem', fontWeight: '600' }}>Secondary Button (Outline)</h5>
                        <div className="form-group">
                          <label>Button Label</label>
                          <input 
                            type="text" 
                            value={homepageConfigs.cta.btn2Text || ''} 
                            onChange={(e) => {
                              setHomepageConfigs({
                                ...homepageConfigs,
                                cta: { ...homepageConfigs.cta, btn2Text: e.target.value }
                              });
                            }}
                            required
                          />
                        </div>
                        <div className="form-group" style={{ marginTop: '0.75rem' }}>
                          <label>Button Action Path</label>
                          <input 
                            type="text" 
                            value={homepageConfigs.cta.btn2Link || ''} 
                            onChange={(e) => {
                              setHomepageConfigs({
                                ...homepageConfigs,
                                cta: { ...homepageConfigs.cta, btn2Link: e.target.value }
                              });
                            }}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      onClick={() => handleSaveConfig('cta', homepageConfigs.cta)}
                      style={{ marginTop: '1.5rem', borderRadius: '8px', padding: '0.6rem 1.5rem' }}
                    >
                      Save CTA Banner Settings
                    </button>
                  </div>
                </div>

              </div>
            ) : activeTab === 'aboutpage' ? (
              /* ABOUT PAGE DYNAMIC SECTORS CMS TAB */
              <div className="homepage-cms-container">
                {/* About Hero Section Config */}
                <div className="cms-section-card card">
                  <div className="cms-section-header">
                    <h4>About Page Hero Settings</h4>
                    <span className="cms-section-tag">Hero</span>
                  </div>
                  <form onSubmit={(e) => { 
                    e.preventDefault(); 
                    handleSaveConfig('about', homepageConfigs.about); 
                  }} className="cms-form">
                    <div className="form-group">
                      <label>Badge Text</label>
                      <input 
                        type="text" 
                        value={homepageConfigs.about?.badge || ''} 
                        onChange={(e) => setHomepageConfigs({
                          ...homepageConfigs,
                          about: { ...homepageConfigs.about, badge: e.target.value }
                        })}
                        placeholder="e.g. Empowering Next-Gen Leaders"
                        required
                      />
                    </div>
                    <div className="grid-2" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr', marginTop: '1rem' }}>
                      <div className="form-group">
                        <label>Main Title Text</label>
                        <input 
                          type="text" 
                          value={homepageConfigs.about?.titleMain || ''} 
                          onChange={(e) => setHomepageConfigs({
                            ...homepageConfigs,
                            about: { ...homepageConfigs.about, titleMain: e.target.value }
                          })}
                          placeholder="e.g. Bridging Passion and"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Gradient Highlight Title</label>
                        <input 
                          type="text" 
                          value={homepageConfigs.about?.titleGradient || ''} 
                          onChange={(e) => setHomepageConfigs({
                            ...homepageConfigs,
                            about: { ...homepageConfigs.about, titleGradient: e.target.value }
                          })}
                          placeholder="e.g. Profession"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                      <label>Subtitle Text</label>
                      <textarea 
                        value={homepageConfigs.about?.subtitle || ''} 
                        onChange={(e) => setHomepageConfigs({
                          ...homepageConfigs,
                          about: { ...homepageConfigs.about, subtitle: e.target.value }
                        })}
                        placeholder="Provide a detailed subtitle describing the about section..."
                        rows={3}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem', borderRadius: '8px', padding: '0.6rem 1.5rem' }}>
                      Save Hero Settings
                    </button>
                  </form>
                </div>

                {/* About Who We Are Config */}
                <div className="cms-section-card card">
                  <div className="cms-section-header">
                    <h4>Who We Are Settings</h4>
                    <span className="cms-section-tag">Who We Are</span>
                  </div>
                  <form onSubmit={(e) => { 
                    e.preventDefault(); 
                    handleSaveConfig('about', homepageConfigs.about); 
                  }} className="cms-form">
                    <div className="form-group">
                      <label>Section Title</label>
                      <input 
                        type="text" 
                        value={homepageConfigs.about?.whoWeAreTitle || ''} 
                        onChange={(e) => setHomepageConfigs({
                          ...homepageConfigs,
                          about: { ...homepageConfigs.about, whoWeAreTitle: e.target.value }
                        })}
                        placeholder="e.g. A Community That Genuinely Cares"
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                      <label>Description Paragraph 1</label>
                      <textarea 
                        value={homepageConfigs.about?.whoWeAreDesc1 || ''} 
                        onChange={(e) => setHomepageConfigs({
                          ...homepageConfigs,
                          about: { ...homepageConfigs.about, whoWeAreDesc1: e.target.value }
                        })}
                        placeholder="Who we are detailed history paragraph 1..."
                        rows={3}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                      <label>Description Paragraph 2</label>
                      <textarea 
                        value={homepageConfigs.about?.whoWeAreDesc2 || ''} 
                        onChange={(e) => setHomepageConfigs({
                          ...homepageConfigs,
                          about: { ...homepageConfigs.about, whoWeAreDesc2: e.target.value }
                        })}
                        placeholder="Who we are detailed platform paragraph 2..."
                        rows={3}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ marginTop: '1.5rem' }}>
                      <label>Who We Are Section Image</label>
                      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {homepageConfigs.about?.whoWeAreImage ? (
                          <div style={{ position: 'relative', width: '120px', height: '150px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <img src={homepageConfigs.about.whoWeAreImage} alt="Who We Are Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button 
                              type="button" 
                              style={{ position: 'absolute', top: '5px', right: '5px', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', cursor: 'pointer' }}
                              onClick={() => {
                                setHomepageConfigs(prev => ({
                                  ...prev,
                                  about: { ...prev.about, whoWeAreImage: '' }
                                }));
                              }}
                            >
                              &times;
                            </button>
                          </div>
                        ) : (
                          <div 
                            style={{
                              flex: 1,
                              minWidth: '200px',
                              height: '100px',
                              border: '2px dashed #cbd5e1',
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              position: 'relative',
                              transition: 'all 0.2s ease',
                              background: '#f8fafc'
                            }}
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const file = e.dataTransfer.files[0];
                              if (file) handleAboutWhoWeAreImageFile(file);
                            }}
                          >
                            <input 
                              type="file" 
                              accept="image/*" 
                              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) handleAboutWhoWeAreImageFile(file);
                              }}
                            />
                            <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                              <Plus size={18} style={{ color: 'var(--accent)' }} />
                              <p style={{ margin: 0, fontWeight: '500' }}>
                                <span style={{ color: 'var(--accent)', fontWeight: '600' }}>Click to upload</span> or drag-drop
                              </p>
                              <p style={{ margin: 0, fontSize: '0.7rem' }}>PNG, JPG or WEBP up to 5MB</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <h5 style={{ margin: '1.5rem 0 0.75rem 0', color: 'var(--text)', fontSize: '0.95rem', fontWeight: '700' }}>Features Checklist (3 Bullet points)</h5>
                    {[0, 1, 2].map((idx) => (
                      <div className="form-group" key={idx} style={{ marginTop: idx > 0 ? '0.5rem' : 0 }}>
                        <label>Feature {idx + 1}</label>
                        <input 
                          type="text" 
                          value={homepageConfigs.about?.whoWeAreFeatures?.[idx] || ''} 
                          onChange={(e) => {
                            const newFeats = [...(homepageConfigs.about?.whoWeAreFeatures || ['', '', ''])];
                            newFeats[idx] = e.target.value;
                            setHomepageConfigs({
                              ...homepageConfigs,
                              about: { ...homepageConfigs.about, whoWeAreFeatures: newFeats }
                            });
                          }}
                          required
                        />
                      </div>
                    ))}

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem', borderRadius: '8px', padding: '0.6rem 1.5rem' }}>
                      Save Who We Are Settings
                    </button>
                  </form>
                </div>

                {/* About Milestones Config */}
                <div className="cms-section-card card">
                  <div className="cms-section-header">
                    <h4>Milestone Counters</h4>
                    <span className="cms-section-tag">Milestones</span>
                  </div>
                  <form onSubmit={(e) => { 
                    e.preventDefault(); 
                    handleSaveConfig('about', homepageConfigs.about); 
                  }} className="cms-form">
                    <div className="grid-2" style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr' }}>
                      {[0, 1, 2, 3].map((idx) => {
                        const milestone = homepageConfigs.about?.milestones?.[idx] || { value: '', label: '', color: '' };
                        return (
                          <div key={idx} className="cms-sub-card" style={{ padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '8px', background: '#fafbfc' }}>
                            <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent)', fontSize: '0.85rem', fontWeight: '700' }}>Counter {idx + 1}</h5>
                            <div className="form-group">
                              <label>Counter Value</label>
                              <input 
                                type="text" 
                                value={milestone.value || ''} 
                                onChange={(e) => {
                                  const newMilestones = [...(homepageConfigs.about?.milestones || [{}, {}, {}, {}])];
                                  newMilestones[idx] = { ...milestone, value: e.target.value };
                                  setHomepageConfigs({
                                    ...homepageConfigs,
                                    about: { ...homepageConfigs.about, milestones: newMilestones }
                                  });
                                }}
                                placeholder="e.g. 5,000+ or 92%"
                                required
                              />
                            </div>
                            <div className="form-group" style={{ marginTop: '0.5rem' }}>
                              <label>Counter Label</label>
                              <input 
                                type="text" 
                                value={milestone.label || ''} 
                                onChange={(e) => {
                                  const newMilestones = [...(homepageConfigs.about?.milestones || [{}, {}, {}, {}])];
                                  newMilestones[idx] = { ...milestone, label: e.target.value };
                                  setHomepageConfigs({
                                    ...homepageConfigs,
                                    about: { ...homepageConfigs.about, milestones: newMilestones }
                                  });
                                }}
                                placeholder="e.g. Students Mentored"
                                required
                              />
                            </div>
                            <div className="form-group" style={{ marginTop: '0.5rem' }}>
                              <label>Accent Color Hex</label>
                              <input 
                                type="text" 
                                value={milestone.color || ''} 
                                onChange={(e) => {
                                  const newMilestones = [...(homepageConfigs.about?.milestones || [{}, {}, {}, {}])];
                                  newMilestones[idx] = { ...milestone, color: e.target.value };
                                  setHomepageConfigs({
                                    ...homepageConfigs,
                                    about: { ...homepageConfigs.about, milestones: newMilestones }
                                  });
                                }}
                                placeholder="e.g. #3b82f6"
                                required
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem', borderRadius: '8px', padding: '0.6rem 1.5rem' }}>
                      Save Milestones Settings
                    </button>
                  </form>
                </div>

                {/* About Core Values Config */}
                <div className="cms-section-card card">
                  <div className="cms-section-header">
                    <h4>Core Values Cards</h4>
                    <span className="cms-section-tag">Core Values</span>
                  </div>
                  <form onSubmit={(e) => { 
                    e.preventDefault(); 
                    handleSaveConfig('about', homepageConfigs.about); 
                  }} className="cms-form">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {[0, 1, 2].map((idx) => {
                        const val = homepageConfigs.about?.values?.[idx] || { title: '', desc: '', color: '' };
                        return (
                          <div key={idx} className="cms-sub-card" style={{ padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '8px', background: '#fafbfc' }}>
                            <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '700' }}>Value Card {idx + 1}</h5>
                            <div className="grid-2" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1.5fr 0.5fr' }}>
                              <div className="form-group">
                                <label>Value Title</label>
                                <input 
                                  type="text" 
                                  value={val.title || ''} 
                                  onChange={(e) => {
                                    const newVals = [...(homepageConfigs.about?.values || [{}, {}, {}])];
                                    newVals[idx] = { ...val, title: e.target.value };
                                    setHomepageConfigs({
                                      ...homepageConfigs,
                                      about: { ...homepageConfigs.about, values: newVals }
                                    });
                                  }}
                                  placeholder="e.g. Mission-Driven"
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Theme Color</label>
                                <select 
                                  value={val.color || 'blue'} 
                                  onChange={(e) => {
                                    const newVals = [...(homepageConfigs.about?.values || [{}, {}, {}])];
                                    newVals[idx] = { ...val, color: e.target.value };
                                    setHomepageConfigs({
                                      ...homepageConfigs,
                                      about: { ...homepageConfigs.about, values: newVals }
                                    });
                                  }}
                                  style={{ padding: '0.65rem 0.5rem', width: '100%', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                >
                                  <option value="blue">🔵 Blue</option>
                                  <option value="yellow">🟡 Yellow</option>
                                  <option value="red">🔴 Red</option>
                                </select>
                              </div>
                            </div>
                            <div className="form-group" style={{ marginTop: '0.5rem' }}>
                              <label>Value Description</label>
                              <textarea 
                                value={val.desc || ''} 
                                onChange={(e) => {
                                  const newVals = [...(homepageConfigs.about?.values || [{}, {}, {}])];
                                  newVals[idx] = { ...val, desc: e.target.value };
                                  setHomepageConfigs({
                                    ...homepageConfigs,
                                    about: { ...homepageConfigs.about, values: newVals }
                                  });
                                }}
                                placeholder="Describe this core value..."
                                rows={2}
                                required
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem', borderRadius: '8px', padding: '0.6rem 1.5rem' }}>
                      Save Core Values Settings
                    </button>
                  </form>
                </div>

                {/* About Timeline Config */}
                <div className="cms-section-card card">
                  <div className="cms-section-header">
                    <h4>Journey Timeline Settings</h4>
                    <span className="cms-section-tag">Timeline</span>
                  </div>
                  <form onSubmit={(e) => { 
                    e.preventDefault(); 
                    handleSaveConfig('about', homepageConfigs.about); 
                  }} className="cms-form">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {[0, 1, 2].map((idx) => {
                        const time = homepageConfigs.about?.timeline?.[idx] || { year: '', title: '', desc: '' };
                        return (
                          <div key={idx} className="cms-sub-card" style={{ padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '8px', background: '#fafbfc' }}>
                            <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent)', fontSize: '0.9rem', fontWeight: '700' }}>Timeline Item {idx + 1}</h5>
                            <div className="grid-2" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '0.4fr 1.6fr' }}>
                              <div className="form-group">
                                <label>Year</label>
                                <input 
                                  type="text" 
                                  value={time.year || ''} 
                                  onChange={(e) => {
                                    const newTimeline = [...(homepageConfigs.about?.timeline || [{}, {}, {}])];
                                    newTimeline[idx] = { ...time, year: e.target.value };
                                    setHomepageConfigs({
                                      ...homepageConfigs,
                                      about: { ...homepageConfigs.about, timeline: newTimeline }
                                    });
                                  }}
                                  placeholder="e.g. 2024"
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Milestone Title</label>
                                <input 
                                  type="text" 
                                  value={time.title || ''} 
                                  onChange={(e) => {
                                    const newTimeline = [...(homepageConfigs.about?.timeline || [{}, {}, {}])];
                                    newTimeline[idx] = { ...time, title: e.target.value };
                                    setHomepageConfigs({
                                      ...homepageConfigs,
                                      about: { ...homepageConfigs.about, timeline: newTimeline }
                                    });
                                  }}
                                  placeholder="e.g. The Spark"
                                  required
                                />
                              </div>
                            </div>
                            <div className="form-group" style={{ marginTop: '0.5rem' }}>
                              <label>Milestone Description</label>
                              <textarea 
                                value={time.desc || ''} 
                                onChange={(e) => {
                                  const newTimeline = [...(homepageConfigs.about?.timeline || [{}, {}, {}])];
                                  newTimeline[idx] = { ...time, desc: e.target.value };
                                  setHomepageConfigs({
                                    ...homepageConfigs,
                                    about: { ...homepageConfigs.about, timeline: newTimeline }
                                  });
                                }}
                                placeholder="Describe this timeline milestone..."
                                rows={2}
                                required
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem', borderRadius: '8px', padding: '0.6rem 1.5rem' }}>
                      Save Timeline Settings
                    </button>
                  </form>
                </div>

                {/* About CTA Config */}
                <div className="cms-section-card card">
                  <div className="cms-section-header">
                    <h4>About Page CTA Banner</h4>
                    <span className="cms-section-tag">CTA Banner</span>
                  </div>
                  <form onSubmit={(e) => { 
                    e.preventDefault(); 
                    handleSaveConfig('about', homepageConfigs.about); 
                  }} className="cms-form">
                    <div className="form-group">
                      <label>CTA Title</label>
                      <input 
                        type="text" 
                        value={homepageConfigs.about?.ctaTitle || ''} 
                        onChange={(e) => setHomepageConfigs({
                          ...homepageConfigs,
                          about: { ...homepageConfigs.about, ctaTitle: e.target.value }
                        })}
                        placeholder="e.g. Ready to Shape Your Future?"
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                      <label>CTA Description</label>
                      <textarea 
                        value={homepageConfigs.about?.ctaDesc || ''} 
                        onChange={(e) => setHomepageConfigs({
                          ...homepageConfigs,
                          about: { ...homepageConfigs.about, ctaDesc: e.target.value }
                        })}
                        placeholder="Describe the call to action..."
                        rows={2}
                        required
                      />
                    </div>
                    <div className="grid-2" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr', marginTop: '1.5rem' }}>
                      <div className="form-group">
                        <label>Primary Button Text</label>
                        <input 
                          type="text" 
                          value={homepageConfigs.about?.ctaBtn1Text || ''} 
                          onChange={(e) => setHomepageConfigs({
                            ...homepageConfigs,
                            about: { ...homepageConfigs.about, ctaBtn1Text: e.target.value }
                          })}
                          placeholder="e.g. Explore Skills Programs"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Secondary Button Text</label>
                        <input 
                          type="text" 
                          value={homepageConfigs.about?.ctaBtn2Text || ''} 
                          onChange={(e) => setHomepageConfigs({
                            ...homepageConfigs,
                            about: { ...homepageConfigs.about, ctaBtn2Text: e.target.value }
                          })}
                          placeholder="e.g. Become Campus Lead"
                          required
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem', borderRadius: '8px', padding: '0.6rem 1.5rem' }}>
                      Save CTA Settings
                    </button>
                  </form>
                </div>
              </div>
            ) : activeTab === 'ambassadorpage' ? (
              /* AMBASSADOR DYNAMIC SECTORS CMS TAB */
              <div className="homepage-cms-container">
                {/* Hero & Intro Section Config */}
                <div className="cms-section-card card">
                  <div className="cms-section-header">
                    <h4>Ambassador Hero & Overview Settings</h4>
                    <span className="cms-section-tag">Hero & Intro</span>
                  </div>
                  <form onSubmit={(e) => { 
                    e.preventDefault(); 
                    handleSaveConfig('ambassador', homepageConfigs.ambassador); 
                  }} className="cms-form">
                    <div className="grid-2" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                      <div className="form-group">
                        <label>Badge Text</label>
                        <input 
                          type="text" 
                          value={homepageConfigs.ambassador?.badge || ''} 
                          onChange={(e) => setHomepageConfigs({
                            ...homepageConfigs,
                            ambassador: { ...homepageConfigs.ambassador, badge: e.target.value }
                          })}
                          placeholder="e.g. Join the Student Network"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Main Title Text</label>
                        <input 
                          type="text" 
                          value={homepageConfigs.ambassador?.titleMain || ''} 
                          onChange={(e) => setHomepageConfigs({
                            ...homepageConfigs,
                            ambassador: { ...homepageConfigs.ambassador, titleMain: e.target.value }
                          })}
                          placeholder="e.g. Become a Campus"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid-2" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr', marginTop: '1rem' }}>
                      <div className="form-group">
                        <label>Title Gradient Text</label>
                        <input 
                          type="text" 
                          value={homepageConfigs.ambassador?.titleGradient || ''} 
                          onChange={(e) => setHomepageConfigs({
                            ...homepageConfigs,
                            ambassador: { ...homepageConfigs.ambassador, titleGradient: e.target.value }
                          })}
                          placeholder="e.g. Ambassador"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Intro Title</label>
                        <input 
                          type="text" 
                          value={homepageConfigs.ambassador?.introTitle || ''} 
                          onChange={(e) => setHomepageConfigs({
                            ...homepageConfigs,
                            ambassador: { ...homepageConfigs.ambassador, introTitle: e.target.value }
                          })}
                          placeholder="e.g. What is the Program?"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                      <label>Subtitle Description</label>
                      <textarea 
                        value={homepageConfigs.ambassador?.subtitle || ''} 
                        onChange={(e) => setHomepageConfigs({
                          ...homepageConfigs,
                          ambassador: { ...homepageConfigs.ambassador, subtitle: e.target.value }
                        })}
                        placeholder="Hero subtitle description..."
                        rows={2}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                      <label>Intro Description Paragraph</label>
                      <textarea 
                        value={homepageConfigs.ambassador?.introDesc || ''} 
                        onChange={(e) => setHomepageConfigs({
                          ...homepageConfigs,
                          ambassador: { ...homepageConfigs.ambassador, introDesc: e.target.value }
                        })}
                        placeholder="Detailed overview description..."
                        rows={3}
                        required
                      />
                    </div>

                    <h5 style={{ marginTop: '2rem', marginBottom: '0.75rem', fontWeight: '800' }}>Roles & Responsibilities</h5>
                    <div className="form-group">
                      <label>Roles List Title</label>
                      <input 
                        type="text" 
                        value={homepageConfigs.ambassador?.rolesTitle || ''} 
                        onChange={(e) => setHomepageConfigs({
                          ...homepageConfigs,
                          ambassador: { ...homepageConfigs.ambassador, rolesTitle: e.target.value }
                        })}
                        placeholder="e.g. Roles & Responsibilities"
                        required
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                      {Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="form-group">
                          <label>Responsibility Item {idx + 1}</label>
                          <input 
                            type="text" 
                            value={homepageConfigs.ambassador?.rolesList?.[idx] || ''} 
                            onChange={(e) => {
                              const newRoles = [...(homepageConfigs.ambassador?.rolesList || ['', '', '', ''])];
                              newRoles[idx] = e.target.value;
                              setHomepageConfigs({
                                ...homepageConfigs,
                                ambassador: { ...homepageConfigs.ambassador, rolesList: newRoles }
                              });
                            }}
                            placeholder={`Role activity ${idx + 1}`}
                            required
                          />
                        </div>
                      ))}
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem', borderRadius: '8px', padding: '0.6rem 1.5rem' }}>
                      Save Hero & Overview Settings
                    </button>
                  </form>
                </div>

                {/* Benefits Config */}
                <div className="cms-section-card card" style={{ marginTop: '2rem' }}>
                  <div className="cms-section-header">
                    <h4>Program Benefits Settings</h4>
                    <span className="cms-section-tag">Benefits</span>
                  </div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveConfig('ambassador', homepageConfigs.ambassador);
                  }} className="cms-form">
                    <div className="grid-2" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                      <div className="form-group">
                        <label>Benefits Header Title</label>
                        <input 
                          type="text" 
                          value={homepageConfigs.ambassador?.benefitsTitle || ''} 
                          onChange={(e) => setHomepageConfigs({
                            ...homepageConfigs,
                            ambassador: { ...homepageConfigs.ambassador, benefitsTitle: e.target.value }
                          })}
                          placeholder="e.g. Benefits of Joining"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Benefits Subtitle</label>
                        <input 
                          type="text" 
                          value={homepageConfigs.ambassador?.benefitsSubtitle || ''} 
                          onChange={(e) => setHomepageConfigs({
                            ...homepageConfigs,
                            ambassador: { ...homepageConfigs.ambassador, benefitsSubtitle: e.target.value }
                          })}
                          placeholder="e.g. Gain credentials..."
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                      {(homepageConfigs.ambassador?.benefitsList || []).map((benefit, idx) => (
                        <div key={idx} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <h6 style={{ fontWeight: '800', marginBottom: '0.5rem' }}>Benefit Card {idx + 1}</h6>
                          <div className="form-group">
                            <label>Title</label>
                            <input 
                              type="text" 
                              value={benefit.title || ''} 
                              onChange={(e) => {
                                const newBenefits = [...(homepageConfigs.ambassador?.benefitsList || [])];
                                newBenefits[idx] = { ...benefit, title: e.target.value };
                                setHomepageConfigs({
                                  ...homepageConfigs,
                                  ambassador: { ...homepageConfigs.ambassador, benefitsList: newBenefits }
                                });
                              }}
                              placeholder="Benefit title"
                              required
                            />
                          </div>
                          <div className="form-group" style={{ marginTop: '0.5rem' }}>
                            <label>Icon Type</label>
                            <select 
                              value={benefit.icon || 'Award'}
                              onChange={(e) => {
                                const newBenefits = [...(homepageConfigs.ambassador?.benefitsList || [])];
                                newBenefits[idx] = { ...benefit, icon: e.target.value };
                                setHomepageConfigs({
                                  ...homepageConfigs,
                                  ambassador: { ...homepageConfigs.ambassador, benefitsList: newBenefits }
                                });
                              }}
                              style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}
                            >
                              <option value="Shield">Shield (Leadership)</option>
                              <option value="Users">Users (Networking)</option>
                              <option value="Award">Award (Certificate)</option>
                              <option value="Zap">Zap (Skill Development)</option>
                              <option value="Briefcase">Briefcase (Event Work)</option>
                            </select>
                          </div>
                          <div className="form-group" style={{ marginTop: '0.5rem' }}>
                            <label>Description</label>
                            <textarea 
                              value={benefit.desc || ''} 
                              onChange={(e) => {
                                const newBenefits = [...(homepageConfigs.ambassador?.benefitsList || [])];
                                newBenefits[idx] = { ...benefit, desc: e.target.value };
                                setHomepageConfigs({
                                  ...homepageConfigs,
                                  ambassador: { ...homepageConfigs.ambassador, benefitsList: newBenefits }
                                });
                              }}
                              placeholder="Describe this benefit..."
                              rows={2}
                              required
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem', borderRadius: '8px', padding: '0.6rem 1.5rem' }}>
                      Save Benefits Settings
                    </button>
                  </form>
                </div>

                {/* Journey Steps Config */}
                <div className="cms-section-card card" style={{ marginTop: '2rem' }}>
                  <div className="cms-section-header">
                    <h4>Ambassador Journey Roadmap</h4>
                    <span className="cms-section-tag">Journey Roadmap</span>
                  </div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveConfig('ambassador', homepageConfigs.ambassador);
                  }} className="cms-form">
                    <div className="form-group">
                      <label>Journey Title</label>
                      <input 
                        type="text" 
                        value={homepageConfigs.ambassador?.journeyTitle || ''} 
                        onChange={(e) => setHomepageConfigs({
                          ...homepageConfigs,
                          ambassador: { ...homepageConfigs.ambassador, journeyTitle: e.target.value }
                        })}
                        placeholder="e.g. Your Ambassador Journey"
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
                      {(homepageConfigs.ambassador?.journeySteps || []).map((step, idx) => (
                        <div key={idx} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                          <div>
                            <div className="form-group">
                              <label>Phase Tag</label>
                              <input 
                                type="text" 
                                value={step.phase || ''} 
                                onChange={(e) => {
                                  const newSteps = [...(homepageConfigs.ambassador?.journeySteps || [])];
                                  newSteps[idx] = { ...step, phase: e.target.value };
                                  setHomepageConfigs({
                                    ...homepageConfigs,
                                    ambassador: { ...homepageConfigs.ambassador, journeySteps: newSteps }
                                  });
                                }}
                                placeholder="e.g. Phase 1: Apply"
                                required
                              />
                            </div>
                            <div className="form-group" style={{ marginTop: '0.5rem' }}>
                              <label>Step Title</label>
                              <input 
                                type="text" 
                                value={step.title || ''} 
                                onChange={(e) => {
                                  const newSteps = [...(homepageConfigs.ambassador?.journeySteps || [])];
                                  newSteps[idx] = { ...step, title: e.target.value };
                                  setHomepageConfigs({
                                    ...homepageConfigs,
                                    ambassador: { ...homepageConfigs.ambassador, journeySteps: newSteps }
                                  });
                                }}
                                placeholder="e.g. Submit Application"
                                required
                              />
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Step Description</label>
                            <textarea 
                              value={step.desc || ''} 
                              onChange={(e) => {
                                const newSteps = [...(homepageConfigs.ambassador?.journeySteps || [])];
                                newSteps[idx] = { ...step, desc: e.target.value };
                                setHomepageConfigs({
                                  ...homepageConfigs,
                                  ambassador: { ...homepageConfigs.ambassador, journeySteps: newSteps }
                                });
                              }}
                              placeholder="Details of what happens in this phase..."
                              rows={4}
                              required
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem', borderRadius: '8px', padding: '0.6rem 1.5rem' }}>
                      Save Journey Settings
                    </button>
                  </form>
                </div>

                {/* FAQ Accordion Config */}
                <div className="cms-section-card card" style={{ marginTop: '2rem' }}>
                  <div className="cms-section-header">
                    <h4>Ambassador FAQ Accordion Settings</h4>
                    <span className="cms-section-tag">FAQ Accordion</span>
                  </div>
                  
                  <div className="cms-form">
                    <div className="form-group">
                      <label>FAQs Header Title</label>
                      <input 
                        type="text" 
                        value={homepageConfigs.ambassador?.faqsTitle || ''} 
                        onChange={(e) => setHomepageConfigs({
                          ...homepageConfigs,
                          ambassador: { ...homepageConfigs.ambassador, faqsTitle: e.target.value }
                        })}
                        placeholder="e.g. Ambassador FAQs"
                        required
                      />
                    </div>

                    <h5 style={{ fontWeight: '800', marginTop: '2rem', marginBottom: '0.75rem' }}>FAQ Items List</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {(homepageConfigs.ambassador?.faqsList || []).map((faq, index) => (
                        <div key={index} style={{ padding: '0.85rem 1.25rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ textAlign: 'left' }}>
                            <strong style={{ fontSize: '0.95rem', color: 'var(--primary)' }}>Q: {faq.question}</strong>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>A: {faq.answer}</p>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                            <button 
                              type="button" 
                              className="btn btn-secondary" 
                              style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', borderColor: '#cbd5e1' }}
                              onClick={() => {
                                setEditingAmbFaqIdx(index);
                                setAmbFaqForm({ question: faq.question, answer: faq.answer });
                              }}
                            >
                              Edit
                            </button>
                            <button 
                              type="button" 
                              className="btn btn-secondary" 
                              style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', borderColor: '#fee2e2', color: '#ef4444' }}
                              onClick={() => {
                                const updatedFaqs = (homepageConfigs.ambassador?.faqsList || []).filter((_, i) => i !== index);
                                const updatedAmbassador = { ...homepageConfigs.ambassador, faqsList: updatedFaqs };
                                setHomepageConfigs({ ...homepageConfigs, ambassador: updatedAmbassador });
                                handleSaveConfig('ambassador', updatedAmbassador);
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add/Edit FAQ Form block */}
                    <div style={{ marginTop: '2rem', padding: '1.25rem', border: '1.5px dashed #cbd5e1', borderRadius: '12px', background: '#f8fafc' }}>
                      <h5 style={{ fontWeight: '800', marginBottom: '1rem' }}>
                        {editingAmbFaqIdx !== null ? '✏️ Edit FAQ Item' : '➕ Add FAQ Item'}
                      </h5>
                      <div className="form-group">
                        <label>Question</label>
                        <input 
                          type="text" 
                          value={ambFaqForm.question} 
                          onChange={(e) => setAmbFaqForm({ ...ambFaqForm, question: e.target.value })} 
                          placeholder="e.g. Is this program paid?" 
                        />
                      </div>
                      <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label>Answer</label>
                        <textarea 
                          value={ambFaqForm.answer} 
                          onChange={(e) => setAmbFaqForm({ ...ambFaqForm, answer: e.target.value })} 
                          placeholder="Provide the explanation answer..."
                          rows={2} 
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                        <button 
                          type="button" 
                          className="btn btn-primary" 
                          style={{ borderRadius: '8px', padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                          onClick={() => {
                            if (!ambFaqForm.question || !ambFaqForm.answer) {
                              alert('Both question and answer are required.');
                              return;
                            }
                            let updatedFaqs = [...(homepageConfigs.ambassador?.faqsList || [])];
                            if (editingAmbFaqIdx !== null) {
                              updatedFaqs[editingAmbFaqIdx] = ambFaqForm;
                              setEditingAmbFaqIdx(null);
                            } else {
                              updatedFaqs.push(ambFaqForm);
                            }
                            setAmbFaqForm({ question: '', answer: '' });
                            const updatedAmbassador = { ...homepageConfigs.ambassador, faqsList: updatedFaqs };
                            setHomepageConfigs({ ...homepageConfigs, ambassador: updatedAmbassador });
                            handleSaveConfig('ambassador', updatedAmbassador);
                          }}
                        >
                          {editingAmbFaqIdx !== null ? 'Apply FAQ Edits' : 'Add FAQ to List'}
                        </button>
                        {editingAmbFaqIdx !== null && (
                          <button 
                            type="button" 
                            className="btn btn-secondary" 
                            style={{ borderRadius: '8px', padding: '0.5rem 1.25rem', fontSize: '0.85rem', borderColor: '#cbd5e1' }}
                            onClick={() => {
                              setEditingAmbFaqIdx(null);
                              setAmbFaqForm({ question: '', answer: '' });
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Campus Chapters Manager */}
                <div className="cms-section-card card" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                  <div className="cms-section-header">
                    <h4>Campus Chapter Hubs & Leads Settings</h4>
                    <span className="cms-section-tag">Campus Chapters</span>
                  </div>

                  <div className="cms-form">
                    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '2.5rem', alignItems: 'start' }}>
                      
                      {/* Left: Campuses List & Detail edit */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="form-group">
                          <label>Select Campus Hub to Configure</label>
                          <select 
                            value={selectedCampusIdx} 
                            onChange={(e) => {
                              setSelectedCampusIdx(parseInt(e.target.value) || 0);
                              setEditingLeadIdx(null);
                              setLeadForm({ name: '', role: '', dept: '', image: '' });
                            }}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                          >
                            {(homepageConfigs.ambassador?.campuses || []).map((campus, idx) => (
                              <option key={campus.key} value={idx}>
                                {campus.fullName} ({campus.key})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Edit Selected Campus fields */}
                        {homepageConfigs.ambassador?.campuses?.[selectedCampusIdx] && (
                          <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <h5 style={{ fontWeight: '800', marginBottom: '1.25rem' }}>
                              🏫 Edit: {homepageConfigs.ambassador.campuses[selectedCampusIdx].fullName}
                            </h5>
                            
                            <div className="grid-2" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                              <div className="form-group">
                                <label>Unique Chapter Key</label>
                                <input 
                                  type="text" 
                                  value={homepageConfigs.ambassador.campuses[selectedCampusIdx].key || ''} 
                                  placeholder="e.g. DU"
                                  required
                                  disabled
                                />
                              </div>
                              <div className="form-group">
                                <label>Full Name</label>
                                <input 
                                  type="text" 
                                  value={homepageConfigs.ambassador.campuses[selectedCampusIdx].fullName || ''} 
                                  onChange={(e) => {
                                    const updatedCampuses = [...(homepageConfigs.ambassador.campuses || [])];
                                    updatedCampuses[selectedCampusIdx] = { ...updatedCampuses[selectedCampusIdx], fullName: e.target.value };
                                    setHomepageConfigs({
                                      ...homepageConfigs,
                                      ambassador: { ...homepageConfigs.ambassador, campuses: updatedCampuses }
                                    });
                                  }}
                                  placeholder="e.g. Dhaka University"
                                  required
                                />
                              </div>
                            </div>

                            <div className="grid-2" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr', marginTop: '1rem' }}>
                              <div className="form-group">
                                <label>Theme Brand Color (Hex)</label>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  <input 
                                    type="color" 
                                    value={homepageConfigs.ambassador.campuses[selectedCampusIdx].color || '#0284c7'} 
                                    onChange={(e) => {
                                      const updatedCampuses = [...(homepageConfigs.ambassador.campuses || [])];
                                      updatedCampuses[selectedCampusIdx] = { ...updatedCampuses[selectedCampusIdx], color: e.target.value };
                                      setHomepageConfigs({
                                        ...homepageConfigs,
                                        ambassador: { ...homepageConfigs.ambassador, campuses: updatedCampuses }
                                      });
                                    }}
                                    style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                  />
                                  <input 
                                    type="text" 
                                    value={homepageConfigs.ambassador.campuses[selectedCampusIdx].color || ''} 
                                    onChange={(e) => {
                                      const updatedCampuses = [...(homepageConfigs.ambassador.campuses || [])];
                                      updatedCampuses[selectedCampusIdx] = { ...updatedCampuses[selectedCampusIdx], color: e.target.value };
                                      setHomepageConfigs({
                                        ...homepageConfigs,
                                        ambassador: { ...homepageConfigs.ambassador, campuses: updatedCampuses }
                                      });
                                    }}
                                    placeholder="#0284c7"
                                    required
                                  />
                                </div>
                              </div>
                              <div className="form-group">
                                <label>Emoji Logo Icon</label>
                                <input 
                                  type="text" 
                                  value={homepageConfigs.ambassador.campuses[selectedCampusIdx].logo || ''} 
                                  onChange={(e) => {
                                    const updatedCampuses = [...(homepageConfigs.ambassador.campuses || [])];
                                    updatedCampuses[selectedCampusIdx] = { ...updatedCampuses[selectedCampusIdx], logo: e.target.value };
                                    setHomepageConfigs({
                                      ...homepageConfigs,
                                      ambassador: { ...homepageConfigs.ambassador, campuses: updatedCampuses }
                                    });
                                  }}
                                  placeholder="e.g. 🏛️"
                                  required
                                />
                              </div>
                            </div>

                            <div className="form-group" style={{ marginTop: '1rem' }}>
                              <label>Chapter Description</label>
                              <textarea 
                                value={homepageConfigs.ambassador.campuses[selectedCampusIdx].description || ''} 
                                onChange={(e) => {
                                  const updatedCampuses = [...(homepageConfigs.ambassador.campuses || [])];
                                  updatedCampuses[selectedCampusIdx] = { ...updatedCampuses[selectedCampusIdx], description: e.target.value };
                                  setHomepageConfigs({
                                    ...homepageConfigs,
                                    ambassador: { ...homepageConfigs.ambassador, campuses: updatedCampuses }
                                  });
                                }}
                                placeholder="Describe the activities, seminars, and status of this campus chapter..."
                                rows={3}
                                required
                              />
                            </div>

                            <h6 style={{ fontWeight: '800', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Hub Metrics Statistics</h6>
                            <div className="grid-3" style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: '1fr 1fr 1fr' }}>
                              <div className="form-group">
                                <label>Reached</label>
                                <input 
                                  type="text" 
                                  value={homepageConfigs.ambassador.campuses[selectedCampusIdx].stats?.studentsReached || ''} 
                                  onChange={(e) => {
                                    const updatedCampuses = [...(homepageConfigs.ambassador.campuses || [])];
                                    const oldStats = updatedCampuses[selectedCampusIdx].stats || {};
                                    updatedCampuses[selectedCampusIdx] = { 
                                      ...updatedCampuses[selectedCampusIdx], 
                                      stats: { ...oldStats, studentsReached: e.target.value } 
                                    };
                                    setHomepageConfigs({
                                      ...homepageConfigs,
                                      ambassador: { ...homepageConfigs.ambassador, campuses: updatedCampuses }
                                    });
                                  }}
                                  placeholder="e.g. 1,500+"
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Workshops</label>
                                <input 
                                  type="text" 
                                  value={homepageConfigs.ambassador.campuses[selectedCampusIdx].stats?.workshops || ''} 
                                  onChange={(e) => {
                                    const updatedCampuses = [...(homepageConfigs.ambassador.campuses || [])];
                                    const oldStats = updatedCampuses[selectedCampusIdx].stats || {};
                                    updatedCampuses[selectedCampusIdx] = { 
                                      ...updatedCampuses[selectedCampusIdx], 
                                      stats: { ...oldStats, workshops: e.target.value } 
                                    };
                                    setHomepageConfigs({
                                      ...homepageConfigs,
                                      ambassador: { ...homepageConfigs.ambassador, campuses: updatedCampuses }
                                    });
                                  }}
                                  placeholder="e.g. 12+"
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Placement Track</label>
                                <input 
                                  type="text" 
                                  value={homepageConfigs.ambassador.campuses[selectedCampusIdx].stats?.placementTrack || ''} 
                                  onChange={(e) => {
                                    const updatedCampuses = [...(homepageConfigs.ambassador.campuses || [])];
                                    const oldStats = updatedCampuses[selectedCampusIdx].stats || {};
                                    updatedCampuses[selectedCampusIdx] = { 
                                      ...updatedCampuses[selectedCampusIdx], 
                                      stats: { ...oldStats, placementTrack: e.target.value } 
                                    };
                                    setHomepageConfigs({
                                      ...homepageConfigs,
                                      ambassador: { ...homepageConfigs.ambassador, campuses: updatedCampuses }
                                    });
                                  }}
                                  placeholder="e.g. 92%"
                                  required
                                />
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                              <button 
                                type="button" 
                                className="btn btn-primary"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: '8px' }}
                                onClick={() => handleSaveConfig('ambassador', homepageConfigs.ambassador)}
                              >
                                Save Chapter Info
                              </button>
                              
                              <button 
                                type="button" 
                                className="btn btn-secondary"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: '8px', color: '#ef4444', borderColor: '#fee2e2' }}
                                onClick={() => {
                                  if (confirm(`Are you absolutely sure you want to delete the campus chapter ${homepageConfigs.ambassador.campuses[selectedCampusIdx].fullName}?`)) {
                                    const updatedCampuses = (homepageConfigs.ambassador.campuses || []).filter((_, i) => i !== selectedCampusIdx);
                                    const updatedAmbassador = { ...homepageConfigs.ambassador, campuses: updatedCampuses };
                                    setHomepageConfigs({ ...homepageConfigs, ambassador: updatedAmbassador });
                                    setSelectedCampusIdx(0);
                                    handleSaveConfig('ambassador', updatedAmbassador);
                                  }
                                }}
                              >
                                Delete Chapter
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Add New Campus Form */}
                        <div style={{ padding: '1.25rem', border: '1.5px dashed #cbd5e1', borderRadius: '16px', background: '#f8fafc' }}>
                          <h5 style={{ fontWeight: '800', marginBottom: '1rem' }}>
                            ➕ Register New University Chapter
                          </h5>
                          <button 
                            type="button" 
                            className="btn btn-secondary w-100"
                            style={{ borderRadius: '8px', padding: '0.65rem' }}
                            onClick={() => {
                              const key = prompt("Enter short uppercase code (e.g. SUST, UIU):");
                              if (!key) return;
                              const fullName = prompt("Enter full university name (e.g. United International University):");
                              if (!fullName) return;
                              
                              const newCamp = {
                                key: key.toUpperCase().trim(),
                                fullName: fullName.trim(),
                                color: "#0ea5e9",
                                logo: "🎓",
                                description: "Welcome to the new chapter hub! Local events and leadership bootcamps are upcoming.",
                                stats: { studentsReached: "0", workshops: "0", placementTrack: "0%" },
                                leads: []
                              };
                              
                              const updatedCampuses = [...(homepageConfigs.ambassador.campuses || []), newCamp];
                              const updatedAmbassador = { ...homepageConfigs.ambassador, campuses: updatedCampuses };
                              setHomepageConfigs({ ...homepageConfigs, ambassador: updatedAmbassador });
                              setSelectedCampusIdx(updatedCampuses.length - 1);
                              handleSaveConfig('ambassador', updatedAmbassador);
                            }}
                          >
                            Add New University Hub
                          </button>
                        </div>
                      </div>

                      {/* Right: Selected Campus Leads List */}
                      <div>
                        {homepageConfigs.ambassador?.campuses?.[selectedCampusIdx] && (
                          <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <h5 style={{ fontWeight: '800', marginBottom: '1rem' }}>
                              🎓 Chapter Leads: {homepageConfigs.ambassador.campuses[selectedCampusIdx].fullName}
                            </h5>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              {(homepageConfigs.ambassador.campuses[selectedCampusIdx].leads || []).map((lead, leadIdx) => (
                                <div key={leadIdx} style={{ padding: '0.75rem 1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}>
                                    <div style={{
                                      width: '36px',
                                      height: '36px',
                                      borderRadius: '50%',
                                      background: lead.image ? 'none' : 'rgba(124, 58, 237, 0.1)',
                                      color: 'var(--primary)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontWeight: '800',
                                      fontSize: '0.75rem',
                                      overflow: 'hidden',
                                      flexShrink: 0
                                    }}>
                                      {lead.image ? (
                                        <img src={lead.image} alt={lead.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                      ) : (
                                        lead.name.split(' ').map(n => n[0]).join('')
                                      )}
                                    </div>
                                    <div>
                                      <strong style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>{lead.name}</strong>
                                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                        {lead.role} | {lead.dept}
                                      </div>
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <button 
                                      type="button" 
                                      className="btn btn-secondary" 
                                      style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', borderColor: '#cbd5e1' }}
                                      onClick={() => {
                                        setEditingLeadIdx(leadIdx);
                                        setLeadForm({ name: lead.name, role: lead.role, dept: lead.dept, image: lead.image || '' });
                                      }}
                                    >
                                      Edit
                                    </button>
                                    <button 
                                      type="button" 
                                      className="btn btn-secondary" 
                                      style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', borderColor: '#fee2e2', color: '#ef4444' }}
                                      onClick={() => {
                                        const updatedCampuses = [...(homepageConfigs.ambassador.campuses || [])];
                                        const oldLeads = updatedCampuses[selectedCampusIdx].leads || [];
                                        const updatedLeads = oldLeads.filter((_, i) => i !== leadIdx);
                                        updatedCampuses[selectedCampusIdx] = { ...updatedCampuses[selectedCampusIdx], leads: updatedLeads };
                                        
                                        const updatedAmbassador = { ...homepageConfigs.ambassador, campuses: updatedCampuses };
                                        setHomepageConfigs({ ...homepageConfigs, ambassador: updatedAmbassador });
                                        handleSaveConfig('ambassador', updatedAmbassador);
                                      }}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              ))}
                              {(!homepageConfigs.ambassador.campuses[selectedCampusIdx].leads || homepageConfigs.ambassador.campuses[selectedCampusIdx].leads.length === 0) && (
                                <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', margin: '1rem 0' }}>
                                  No Leads assigned to this hub yet.
                                </p>
                              )}
                            </div>
 
                            {/* Add/Edit Lead form */}
                            <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1.5px dashed #cbd5e1', borderRadius: '12px', background: 'white' }}>
                              <h6 style={{ fontWeight: '800', marginBottom: '0.75rem' }}>
                                {editingLeadIdx !== null ? '✏️ Edit Chapter Lead' : '➕ Assign Chapter Lead'}
                              </h6>
                              <div className="form-group">
                                <label style={{ fontSize: '0.8rem' }}>Name</label>
                                <input 
                                  type="text" 
                                  value={leadForm.name} 
                                  onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} 
                                  placeholder="e.g. Ayesha Rahman" 
                                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                                />
                              </div>
                              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                                <label style={{ fontSize: '0.8rem' }}>Role</label>
                                <input 
                                  type="text" 
                                  value={leadForm.role} 
                                  onChange={(e) => setLeadForm({ ...leadForm, role: e.target.value })} 
                                  placeholder="e.g. Campus Lead / Co-Lead" 
                                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                                />
                              </div>
                              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                                <label style={{ fontSize: '0.8rem' }}>Department & Year</label>
                                <input 
                                  type="text" 
                                  value={leadForm.dept} 
                                  onChange={(e) => setLeadForm({ ...leadForm, dept: e.target.value })} 
                                  placeholder="e.g. CSE, 4th Year" 
                                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                                />
                              </div>
                              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                                <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>Profile Photo</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  {leadForm.image && (
                                    <div style={{ position: 'relative', width: '45px', height: '45px' }}>
                                      <img 
                                        src={leadForm.image} 
                                        alt="Preview" 
                                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '1px solid #cbd5e1' }} 
                                      />
                                      <button
                                        type="button"
                                        onClick={() => setLeadForm({ ...leadForm, image: '' })}
                                        style={{
                                          position: 'absolute',
                                          top: '-5px',
                                          right: '-5px',
                                          width: '18px',
                                          height: '18px',
                                          borderRadius: '50%',
                                          background: '#ef4444',
                                          color: 'white',
                                          border: 'none',
                                          fontSize: '10px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          cursor: 'pointer',
                                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                                        }}
                                      >
                                        ×
                                      </button>
                                    </div>
                                  )}
                                  <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          setLeadForm({ ...leadForm, image: reader.result });
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }} 
                                    style={{ fontSize: '0.8rem', border: 'none', background: 'transparent', padding: 0 }}
                                  />
                                </div>
                              </div>
 
                              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                <button 
                                  type="button" 
                                  className="btn btn-primary"
                                  style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', borderRadius: '6px' }}
                                  onClick={() => {
                                    if (!leadForm.name || !leadForm.role || !leadForm.dept) {
                                      alert('Please enter name, role, and department info.');
                                      return;
                                    }
                                    const updatedCampuses = [...(homepageConfigs.ambassador.campuses || [])];
                                    const oldLeads = updatedCampuses[selectedCampusIdx].leads || [];
                                    const updatedLeads = [...oldLeads];
                                    
                                    if (editingLeadIdx !== null) {
                                      updatedLeads[editingLeadIdx] = leadForm;
                                      setEditingLeadIdx(null);
                                    } else {
                                      updatedLeads.push(leadForm);
                                    }
                                    
                                    updatedCampuses[selectedCampusIdx] = { ...updatedCampuses[selectedCampusIdx], leads: updatedLeads };
                                    const updatedAmbassador = { ...homepageConfigs.ambassador, campuses: updatedCampuses };
                                    setHomepageConfigs({ ...homepageConfigs, ambassador: updatedAmbassador });
                                    setLeadForm({ name: '', role: '', dept: '', image: '' });
                                    handleSaveConfig('ambassador', updatedAmbassador);
                                  }}
                                >
                                  {editingLeadIdx !== null ? 'Apply Edits' : 'Add Lead'}
                                </button>
                                {editingLeadIdx !== null && (
                                  <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', borderRadius: '6px', borderColor: '#cbd5e1' }}
                                    onClick={() => {
                                      setEditingLeadIdx(null);
                                      setLeadForm({ name: '', role: '', dept: '', image: '' });
                                    }}
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </div>

              </div>
            ) : activeTab === 'contactpage' ? (
              /* CONTACT PAGE CMS TAB */
              <div className="homepage-cms-container">
                <div className="cms-section-card card">
                  <div className="cms-section-header">
                    <h4>Contact Information Settings</h4>
                    <span className="cms-section-tag">Contact Info</span>
                  </div>
                  <form onSubmit={(e) => { 
                    e.preventDefault(); 
                    handleSaveConfig('contact', homepageConfigs.contact); 
                  }} className="cms-form">
                    <div className="grid-2" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                      <div className="form-group">
                        <label>Email Address</label>
                        <input 
                          type="email" 
                          value={homepageConfigs.contact?.email || ''} 
                          onChange={(e) => setHomepageConfigs({
                            ...homepageConfigs,
                            contact: { ...homepageConfigs.contact, email: e.target.value }
                          })}
                          placeholder="hello@skilljobs.com"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone / WhatsApp</label>
                        <input 
                          type="text" 
                          value={homepageConfigs.contact?.phone || ''} 
                          onChange={(e) => setHomepageConfigs({
                            ...homepageConfigs,
                            contact: { ...homepageConfigs.contact, phone: e.target.value }
                          })}
                          placeholder="+880 1234-567890"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                      <label>Visit Address</label>
                      <input 
                        type="text" 
                        value={homepageConfigs.contact?.address || ''} 
                        onChange={(e) => setHomepageConfigs({
                          ...homepageConfigs,
                          contact: { ...homepageConfigs.contact, address: e.target.value }
                        })}
                        placeholder="Dhaka, Bangladesh"
                        required
                      />
                    </div>
                    
                    <h5 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary)', fontWeight: '750', fontSize: '1.1rem' }}>Social Media Links</h5>
                    <div className="grid-3" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                      <div className="form-group">
                        <label>Facebook URL</label>
                        <input 
                          type="text" 
                          value={homepageConfigs.contact?.facebook || ''} 
                          onChange={(e) => setHomepageConfigs({
                            ...homepageConfigs,
                            contact: { ...homepageConfigs.contact, facebook: e.target.value }
                          })}
                          placeholder="#"
                        />
                      </div>
                      <div className="form-group">
                        <label>LinkedIn URL</label>
                        <input 
                          type="text" 
                          value={homepageConfigs.contact?.linkedin || ''} 
                          onChange={(e) => setHomepageConfigs({
                            ...homepageConfigs,
                            contact: { ...homepageConfigs.contact, linkedin: e.target.value }
                          })}
                          placeholder="#"
                        />
                      </div>
                      <div className="form-group">
                        <label>Instagram URL</label>
                        <input 
                          type="text" 
                          value={homepageConfigs.contact?.instagram || ''} 
                          onChange={(e) => setHomepageConfigs({
                            ...homepageConfigs,
                            contact: { ...homepageConfigs.contact, instagram: e.target.value }
                          })}
                          placeholder="#"
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem', borderRadius: '8px', padding: '0.6rem 1.5rem' }}>
                      Save Contact Settings
                    </button>
                  </form>
                </div>
              </div>
            ) : activeTab === 'contactmessages' ? (
              /* CONTACT MESSAGES TAB */
              filteredMessages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                  <h4>No contact messages found.</h4>
                  <p>User queries submitted from the contact page will appear here.</p>
                </div>
              ) : (
                <div className="responsive-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Sender Details</th>
                        <th>Subject</th>
                        <th>Message Preview</th>
                        <th>Sent On</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMessages.map((msg) => (
                        <tr key={msg._id}>
                          <td>
                            <div className="applicant-identity">
                              <h5>{msg.name}</h5>
                              <p style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Mail size={12} /> {msg.email}
                              </p>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontWeight: '600', color: 'var(--primary)' }}>
                              {msg.subject}
                            </span>
                          </td>
                          <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {msg.message}
                          </td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            {formatDate(msg.createdAt)}
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-icon edit" title="Read Message Details" onClick={() => handleViewMessage(msg)}>
                                <Eye size={16} />
                              </button>
                              <button className="btn-icon delete" title="Delete Message" onClick={() => handleDeleteMessage(msg._id)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              /* WELCOME / SELECT SECTION VIEW */
              <div className="saas-empty-state-welcome">
                <div className="welcome-hero-box">
                  <div className="welcome-icon-circle">
                    <Sparkles size={38} />
                  </div>
                  <h2>Welcome to the Enterprise Control Panel</h2>
                  <p>
                    Select any management module or website configuration from the fixed sidebar on the left to manage live workshops, review candidate applications, or customize portal content dynamically.
                  </p>
                  
                  <div className="welcome-quick-actions">
                    <button className="quick-action-card" onClick={() => setActiveTab('events')}>
                      <div className="quick-action-icon blue">
                        <Calendar size={20} />
                      </div>
                      <div className="quick-action-text">
                        <h4>Manage Events</h4>
                        <span>{totalEvents} total listed</span>
                      </div>
                    </button>

                    <button className="quick-action-card" onClick={() => setActiveTab('ambassadors')}>
                      <div className="quick-action-icon amber">
                        <Users size={20} />
                      </div>
                      <div className="quick-action-text">
                        <h4>Applications</h4>
                        <span>{pendingApps} pending review</span>
                      </div>
                    </button>

                    <button className="quick-action-card" onClick={() => setActiveTab('homepage')}>
                      <div className="quick-action-icon purple">
                        <Briefcase size={20} />
                      </div>
                      <div className="quick-action-text">
                        <h4>CMS Editor</h4>
                        <span>Configure website</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ==========================================================================
         GLASS MODALS VIEWPORTS
         ========================================================================== */}
      
      <AnimatePresence>
        {/* 1. Event Creator/Editor Form Modal */}
        {showEventModal && (
          <div className="modal-overlay">
            <motion.div 
              className="modal-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="modal-header">
                <h3>{currentEvent ? 'Edit Event Details' : 'Add New Event Listing'}</h3>
                <button className="close-btn" onClick={() => setShowEventModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleEventSubmit} className="admin-form">
                  <div className="form-group">
                    <label>Event / Workshop Title</label>
                    <input 
                      type="text" 
                      name="title" 
                      value={eventForm.title} 
                      onChange={handleFormChange} 
                      placeholder="e.g. Modern UI Design Workshop"
                      required 
                    />
                  </div>
                  <div className="grid-2" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                    <div className="form-group">
                      <label>Category</label>
                      <select name="category" value={eventForm.category} onChange={handleFormChange}>
                        <option value="Event">Event</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Summit">Summit</option>
                        <option value="Networking">Networking</option>
                        <option value="Training">Training</option>
                        <option value="Seminar">Seminar</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Event Status</label>
                      <select name="status" value={eventForm.status} onChange={handleFormChange}>
                        <option value="Upcoming">Upcoming</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  {eventForm.status === 'Upcoming' && (
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                      <label>Registration Link (Optional)</label>
                      <input 
                        type="url" 
                        name="regLink" 
                        value={eventForm.regLink || ''} 
                        onChange={handleFormChange} 
                        placeholder="e.g. https://forms.gle/xyz (Leave blank for internal form)"
                      />
                      <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                        Provide a custom URL to redirect users (e.g. Google Forms). Leave blank to use the built-in registration modal.
                      </small>
                    </div>
                  )}
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label>Location</label>
                    <input 
                      type="text" 
                      name="location" 
                      value={eventForm.location} 
                      onChange={handleFormChange} 
                      placeholder="e.g. Dhaka University or Zoom"
                      required 
                    />
                  </div>
                  <div className="grid-2" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr', marginTop: '1rem' }}>
                    <div className="form-group">
                      <label>Scheduled Date</label>
                      <input 
                        type="text" 
                        name="date" 
                        value={eventForm.date} 
                        onChange={handleFormChange} 
                        placeholder="e.g. May 25, 2026"
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Scheduled Time</label>
                      <input 
                        type="text" 
                        name="time" 
                        value={eventForm.time} 
                        onChange={handleFormChange} 
                        placeholder="e.g. 10:00 AM - 2:00 PM"
                        required 
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label>Event Banner Image</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {eventForm.image && (
                        <div style={{ position: 'relative', width: '100%', maxHeight: '180px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                          <img src={eventForm.image} alt="Preview Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button 
                            type="button" 
                            style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
                            onClick={() => setEventForm({ ...eventForm, image: '' })}
                          >
                            &times;
                          </button>
                        </div>
                      )}
                      
                      <div 
                        style={{ 
                          border: '2px dashed #cbd5e1', 
                          borderRadius: '10px', 
                          padding: '1.5rem', 
                          textAlign: 'center', 
                          background: '#f8fafc',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'all 0.2s ease',
                          display: eventForm.image ? 'none' : 'block'
                        }}
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
                          id="event-image-upload" 
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) handleImageFile(file);
                          }}
                        />
                        <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                          <Plus size={24} style={{ color: 'var(--accent)' }} />
                          <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '500' }}>
                            <span style={{ color: 'var(--accent)', fontWeight: '600' }}>Click to upload</span> or drag and drop
                          </p>
                          <p style={{ margin: 0, fontSize: '0.8rem' }}>PNG, JPG or WEBP up to 5MB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button type="button" className="btn btn-secondary" style={{ borderRadius: '8px', padding: '0.6rem 1.5rem' }} onClick={() => setShowEventModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ borderRadius: '8px', padding: '0.6rem 1.5rem' }}>
                      {currentEvent ? 'Save Updates' : 'Publish Event'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* 2. Read Ambassador Cover Essay Modal */}
        {showApplicationModal && currentApplication && (
          <div className="modal-overlay">
            <motion.div 
              className="modal-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="modal-header">
                <h3>Application Profile</h3>
                <button className="close-btn" onClick={() => setShowApplicationModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="detail-row">
                  <label>Full Name</label>
                  <div className="detail-text">{currentApplication.name}</div>
                </div>
                <div className="grid-2" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                  <div className="detail-row">
                    <label>Email Address</label>
                    <div className="detail-text" style={{ fontSize: '0.95rem' }}>{currentApplication.email}</div>
                  </div>
                  <div className="detail-row">
                    <label>University</label>
                    <div className="detail-text" style={{ fontSize: '0.95rem' }}>{currentApplication.university}</div>
                  </div>
                </div>
                <div className="detail-row" style={{ marginTop: '1rem' }}>
                  <label>Why do you want to join the Campus Ambassador program?</label>
                  <div className="detail-text" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
                    {currentApplication.reason}
                  </div>
                </div>
                <div className="detail-row" style={{ marginTop: '1rem' }}>
                  <label>Application Status Decision</label>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button 
                      className="btn" 
                      style={{ flex: 1, background: currentApplication.status === 'Approved' ? '#10b981' : '#d1fae5', color: currentApplication.status === 'Approved' ? 'white' : '#059669', fontSize: '0.9rem', padding: '0.5rem 1rem', borderRadius: '6px' }}
                      onClick={() => { handleStatusChange(currentApplication._id, 'Approved'); setShowApplicationModal(false); }}
                    >
                      ✓ Approve Candidate
                    </button>
                    <button 
                      className="btn" 
                      style={{ flex: 1, background: currentApplication.status === 'Rejected' ? '#ef4444' : '#fee2e2', color: currentApplication.status === 'Rejected' ? 'white' : '#dc2626', fontSize: '0.9rem', padding: '0.5rem 1rem', borderRadius: '6px' }}
                      onClick={() => { handleStatusChange(currentApplication._id, 'Rejected'); setShowApplicationModal(false); }}
                    >
                      ✕ Reject Candidate
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* 3. Ambassador Manual Creator Form Modal */}
        {showAmbassadorModal && (
          <div className="modal-overlay">
            <motion.div 
              className="modal-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="modal-header">
                <h3>Add Ambassador Manually</h3>
                <button className="close-btn" onClick={() => setShowAmbassadorModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleAmbassadorSubmit} className="admin-form">
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label>Profile Picture</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {ambassadorForm.image && (
                        <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #cbd5e1', margin: '0 auto' }}>
                          <img src={ambassadorForm.image} alt="Preview Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button 
                            type="button" 
                            style={{ position: 'absolute', top: '0.2rem', right: '0.2rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
                            onClick={() => setAmbassadorForm({ ...ambassadorForm, image: '' })}
                          >
                            &times;
                          </button>
                        </div>
                      )}
                      
                      <div 
                        style={{ 
                          border: '2px dashed #cbd5e1', 
                          borderRadius: '10px', 
                          padding: '1.2rem', 
                          textAlign: 'center', 
                          background: '#f8fafc',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'all 0.2s ease',
                          display: ambassadorForm.image ? 'none' : 'block'
                        }}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const file = e.dataTransfer.files[0];
                          if (file) handleAmbassadorImageFile(file);
                        }}
                      >
                        <input 
                          type="file" 
                          accept="image/*" 
                          id="amb-image-upload" 
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) handleAmbassadorImageFile(file);
                          }}
                        />
                        <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                          <Plus size={20} style={{ color: 'var(--accent)' }} />
                          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '500' }}>
                            <span style={{ color: 'var(--accent)', fontWeight: '600' }}>Upload Profile Pic</span> or drag-drop
                          </p>
                          <p style={{ margin: 0, fontSize: '0.75rem' }}>PNG, JPG or WEBP up to 2MB</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={ambassadorForm.name} 
                      onChange={(e) => setAmbassadorForm({ ...ambassadorForm, name: e.target.value })} 
                      placeholder="e.g. John Doe"
                      required 
                    />
                  </div>
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={ambassadorForm.email} 
                      onChange={(e) => setAmbassadorForm({ ...ambassadorForm, email: e.target.value })} 
                      placeholder="john@example.com"
                      required 
                    />
                  </div>
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label>University / Institution</label>
                    <input 
                      type="text" 
                      name="university" 
                      value={ambassadorForm.university} 
                      onChange={(e) => setAmbassadorForm({ ...ambassadorForm, university: e.target.value })} 
                      placeholder="e.g. Dhaka University"
                      required 
                    />
                  </div>
                  
                  <div className="grid-2" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr', marginTop: '1rem' }}>
                    <div className="form-group">
                      <label>Role / Designation</label>
                      <input 
                        type="text" 
                        name="role" 
                        value={ambassadorForm.role} 
                        onChange={(e) => setAmbassadorForm({ ...ambassadorForm, role: e.target.value })} 
                        placeholder="e.g. Campus Lead"
                      />
                    </div>
                    <div className="form-group">
                      <label>Department & Year</label>
                      <input 
                        type="text" 
                        name="dept" 
                        value={ambassadorForm.dept} 
                        onChange={(e) => setAmbassadorForm({ ...ambassadorForm, dept: e.target.value })} 
                        placeholder="e.g. CSE, 4th Year"
                      />
                    </div>
                  </div>

                  <div className="grid-2" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr', marginTop: '1rem' }}>
                    <div className="form-group">
                      <label>Status Decision</label>
                      <select 
                        name="status" 
                        value={ambassadorForm.status} 
                        onChange={(e) => setAmbassadorForm({ ...ambassadorForm, status: e.target.value })}
                      >
                        <option value="Approved">Approved</option>
                        <option value="Pending">Pending</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label>Reason / Admin Note</label>
                    <textarea 
                      rows="3" 
                      name="reason" 
                      value={ambassadorForm.reason} 
                      onChange={(e) => setAmbassadorForm({ ...ambassadorForm, reason: e.target.value })} 
                      placeholder="Admin notes or reason..."
                      required
                    ></textarea>
                  </div>
                  <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                    <button type="button" className="btn btn-secondary" style={{ borderRadius: '8px', padding: '0.6rem 1.5rem' }} onClick={() => setShowAmbassadorModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ borderRadius: '8px', padding: '0.6rem 1.5rem' }}>
                      Add Ambassador
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* 4. Read Contact Message Modal */}
        {showMessageModal && currentMessage && (
          <div className="modal-overlay">
            <motion.div 
              className="modal-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="modal-header">
                <h3>Contact Query Details</h3>
                <button className="close-btn" onClick={() => setShowMessageModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="grid-2" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                  <div className="detail-row">
                    <label>Sender Name</label>
                    <div className="detail-text">{currentMessage.name}</div>
                  </div>
                  <div className="detail-row">
                    <label>Email Address</label>
                    <div className="detail-text" style={{ fontSize: '0.95rem' }}>{currentMessage.email}</div>
                  </div>
                </div>
                <div className="detail-row" style={{ marginTop: '1rem' }}>
                  <label>Subject</label>
                  <div className="detail-text" style={{ fontWeight: '600' }}>{currentMessage.subject}</div>
                </div>
                <div className="detail-row" style={{ marginTop: '1rem' }}>
                  <label>Message Content</label>
                  <div className="detail-text" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', background: 'rgba(2, 132, 199, 0.05)', border: '1px solid rgba(2, 132, 199, 0.1)' }}>
                    {currentMessage.message}
                  </div>
                </div>
                <div className="detail-row" style={{ marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Received on: {formatDate(currentMessage.createdAt)}
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid rgba(15,23,42,0.08)', paddingTop: '1rem' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ borderRadius: '8px', padding: '0.5rem 1.5rem' }} 
                  onClick={() => setShowMessageModal(false)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;

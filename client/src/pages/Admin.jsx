import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Calendar, MapPin, Clock, Search, Plus, Edit2, Trash2, 
  Users, Award, Lock, LogOut, Check, Home as HomeIcon,
  Loader2, Mail, School, Eye, EyeOff, AlertCircle, Layout, GraduationCap, MessageSquare, Phone,
  Menu, X, Bell, ChevronRight, ChevronDown, User, Shield, Sparkles, Filter, Briefcase,
  ShieldCheck, UserPlus, UserCheck, Target, Zap, TrendingUp, DollarSign, Activity, CheckCircle, CheckCircle2, LayoutDashboard, Crown,
  SlidersHorizontal, KeyRound, CheckSquare, Square, BarChart3, PieChart, ArrowUpRight, Layers, FileText,
  CreditCard, Sliders, Radio, ExternalLink, RefreshCw, UploadCloud, Image as ImageIcon,
  Star, Quote, ShoppingBag, Package, Copy, Truck
} from 'lucide-react';
import { 
  getNfcCards, addNfcCard, updateNfcCard, deleteNfcCard, PRESET_THEMES,
  getNfcReviews, addNfcReview, updateNfcReview, deleteNfcReview
} from '../utils/nfcCards';
import './Admin.css';
import { API_BASE_URL } from '../config/api';

const formatDate = (dateStr) => {
  if (!dateStr) return 'Recently';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? 'Recently' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const AVAILABLE_PERMISSIONS = [
  { id: 'dashboard', label: 'Main Overview Dashboard', desc: 'Access platform summary KPI metrics, system counters, and quick actions', group: 'Dashboard' },
  { id: 'users', label: 'User Accounts Management', desc: 'Create, edit, delete, and manage user accounts', group: 'Management' },
  { id: 'ambassadors', label: 'Ambassador Applications', desc: 'Review, approve, and reject candidate applications', group: 'Management' },
  { id: 'ambassadordashboard', label: 'Ambassador Dashboard', desc: 'View all accounts created across ambassadors', group: 'Management' },
  { id: 'ambassadortasks', label: 'Ambassador Tasks & Targets', desc: 'Configure daily targets, bounty rates, and incentives', group: 'Management' },
  { id: 'nfc_cards', label: 'NFC Smart Cards Management', desc: 'Add, edit, and manage NFC cards in the system and public store', group: 'Management' },
  { id: 'ambassador_performance', label: 'Ambassador Performance Hub', desc: 'Grant ambassador access to view daily & monthly KPI matrix, target runs, and performance cycle', group: 'Ambassador Role Management' },
  { id: 'ambassador_workreport', label: 'Ambassador Work Report Submission', desc: 'Grant ambassador access to submit candidate registrations, account logs, and manage work reports', group: 'Ambassador Role Management' },
  { id: 'homepage', label: 'Homepage Content (CMS)', desc: 'Edit hero banner, stats counter, FAQs, and courses', group: 'Website Configuration' },
  { id: 'aboutpage', label: 'About Page (CMS)', desc: 'Edit company mission, team leads, and milestones', group: 'Website Configuration' },
  { id: 'ambassadorpage', label: 'Ambassador Page (CMS)', desc: 'Edit ambassador program perks, criteria, and hero', group: 'Website Configuration' },
  { id: 'contactpage', label: 'Contact Page (CMS)', desc: 'Edit help channels, location info, and contact details', group: 'Website Configuration' },
  { id: 'contactmessages', label: 'Contact Messages & Inquiries', desc: 'Read, review, and delete inbound user inquiries', group: 'Communication' },
];

const Admin = () => {
  // Authentication State
  const [adminAuth, setAdminAuth] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(
    localStorage.getItem('admin_unlocked') === 'true'
  );
  const [authError, setAuthError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ambassadorDropdownOpen, setAmbassadorDropdownOpen] = useState(true);

  // Dashboard Data States
  const [users, setUsers] = useState([]);
  const [ambassadors, setAmbassadors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('tab') || null;
    } catch {
      return null;
    }
  });

  // NFC Smart Cards Management State
  const [nfcCardsList, setNfcCardsList] = useState(() => getNfcCards());
  const [showNfcCardModal, setShowNfcCardModal] = useState(false);
  const [editingNfcCard, setEditingNfcCard] = useState(null);
  const [nfcCardForm, setNfcCardForm] = useState({
    name: '',
    badge: 'Most Popular',
    theme: 'custom',
    designType: 'artwork',
    cardImage: '',
    cardBackImage: '',
    showOverlayInfo: true,
    cardBg: PRESET_THEMES[0].cardBg,
    textColor: '#ffffff',
    accentColor: '#38bdf8',
    texture: 'matte',
    material: 'Premium Matte Finish PVC',
    price: 499,
    originalPrice: 999,
    discount: '50% OFF',
    nfcColor: '#38bdf8',
    chipFinish: 'gold'
  });

  // NFC Control Hub Sub-tab: 'cards' | 'reviews' | 'orders'
  const [nfcSubTab, setNfcSubTab] = useState('cards');

  // NFC Card Applications / Orders State
  const [nfcOrdersList, setNfcOrdersList] = useState([]);
  const [nfcOrdersLoading, setNfcOrdersLoading] = useState(false);
  const [nfcOrderSearch, setNfcOrderSearch] = useState('');
  const [nfcOrderStatusFilter, setNfcOrderStatusFilter] = useState('all');
  const [selectedNfcOrder, setSelectedNfcOrder] = useState(null);
  const [showNfcOrderModal, setShowNfcOrderModal] = useState(false);

  // NFC Card Holder Reviews Management State
  const [nfcReviewsList, setNfcReviewsList] = useState(() => getNfcReviews());
  const [showNfcReviewModal, setShowNfcReviewModal] = useState(false);
  const [editingNfcReview, setEditingNfcReview] = useState(null);
  const [nfcReviewForm, setNfcReviewForm] = useState({
    name: '',
    role: '',
    rating: 5,
    comment: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  });

  const handleCardImageUpload = (file, field = 'cardImage') => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file (PNG, JPG, WEBP).', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setNfcCardForm(prev => ({
        ...prev,
        [field]: reader.result,
        designType: 'artwork'
      }));
      showToast('Card artwork uploaded successfully!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAddNfcCard = () => {
    setEditingNfcCard(null);
    setNfcCardForm({
      name: '',
      badge: 'New Edition',
      theme: 'custom',
      designType: 'artwork',
      cardImage: '',
      cardBackImage: '',
      showOverlayInfo: true,
      cardBg: PRESET_THEMES[5]?.cardBg || 'linear-gradient(135deg, #064e3b 0%, #047857 45%, #022c22 100%)',
      textColor: '#ffffff',
      accentColor: '#34d399',
      texture: 'metallic',
      material: 'Custom Designed NFC Card',
      price: 599,
      originalPrice: 1199,
      discount: '50% OFF',
      nfcColor: '#6ee7b7',
      chipFinish: 'gold'
    });
    setShowNfcCardModal(true);
  };

  const handleOpenEditNfcCard = (card) => {
    setEditingNfcCard(card);
    setNfcCardForm({
      name: card.name || '',
      badge: card.badge || '',
      theme: card.theme || 'custom',
      designType: card.cardImage ? 'artwork' : 'gradient',
      cardImage: card.cardImage || '',
      cardBackImage: card.cardBackImage || '',
      showOverlayInfo: card.showOverlayInfo !== undefined ? card.showOverlayInfo : true,
      cardBg: card.cardBg || PRESET_THEMES[0].cardBg,
      textColor: card.textColor || '#ffffff',
      accentColor: card.accentColor || '#38bdf8',
      texture: card.texture || 'matte',
      material: card.material || 'Premium Finish PVC',
      price: card.price || 499,
      originalPrice: card.originalPrice || 999,
      discount: card.discount || '50% OFF',
      nfcColor: card.nfcColor || card.accentColor || '#38bdf8',
      chipFinish: card.chipFinish || 'gold'
    });
    setShowNfcCardModal(true);
  };

  const handleSaveNfcCard = (e) => {
    if (e) e.preventDefault();
    if (!nfcCardForm.name.trim()) {
      showToast('Please enter a Card Edition Name.', 'error');
      return;
    }

    const calculatedDiscount = nfcCardForm.originalPrice && nfcCardForm.price && Number(nfcCardForm.originalPrice) > Number(nfcCardForm.price)
      ? `${Math.round(((Number(nfcCardForm.originalPrice) - Number(nfcCardForm.price)) / Number(nfcCardForm.originalPrice)) * 100)}% OFF`
      : 'SPECIAL OFFER';

    const cardPayload = {
      ...nfcCardForm,
      price: Number(nfcCardForm.price) || 499,
      originalPrice: Number(nfcCardForm.originalPrice) || 999,
      discount: calculatedDiscount
    };

    if (editingNfcCard) {
      const updated = updateNfcCard(editingNfcCard.id, cardPayload);
      setNfcCardsList(updated);
      showToast(`NFC Card "${cardPayload.name}" updated successfully!`, 'success');
    } else {
      const updated = addNfcCard(cardPayload);
      setNfcCardsList(updated);
      showToast(`New NFC Card "${cardPayload.name}" added to the live system!`, 'success');
    }
    setShowNfcCardModal(false);
  };

  const handleDeleteNfcCard = (cardId, cardName) => {
    if (window.confirm(`Are you sure you want to delete "${cardName}"? It will also be removed from the live store.`)) {
      const updated = deleteNfcCard(cardId);
      setNfcCardsList(updated);
      showToast(`Card "${cardName}" removed from system.`, 'success');
    }
  };

  // NFC Reviews CRUD Handlers
  const handleReviewAvatarUpload = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file (PNG, JPG, WEBP).', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setNfcReviewForm(prev => ({
        ...prev,
        avatar: reader.result
      }));
      showToast('Reviewer photo uploaded!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAddReview = () => {
    setEditingNfcReview(null);
    setNfcReviewForm({
      name: '',
      role: '',
      rating: 5,
      comment: '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    });
    setShowNfcReviewModal(true);
  };

  const handleOpenEditReview = (rev) => {
    setEditingNfcReview(rev);
    setNfcReviewForm({
      name: rev.name || '',
      role: rev.role || '',
      rating: Number(rev.rating) || 5,
      comment: rev.comment || '',
      avatar: rev.avatar || ''
    });
    setShowNfcReviewModal(true);
  };

  const handleSaveReview = (e) => {
    if (e) e.preventDefault();
    if (!nfcReviewForm.name.trim()) {
      showToast('Please enter reviewer full name.', 'error');
      return;
    }
    if (!nfcReviewForm.role.trim()) {
      showToast('Please enter reviewer role or institution.', 'error');
      return;
    }
    if (!nfcReviewForm.comment.trim()) {
      showToast('Please enter the review testimonial.', 'error');
      return;
    }

    const payload = {
      name: nfcReviewForm.name.trim(),
      role: nfcReviewForm.role.trim(),
      rating: Number(nfcReviewForm.rating) || 5,
      comment: nfcReviewForm.comment.trim(),
      avatar: nfcReviewForm.avatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    };

    if (editingNfcReview) {
      const updated = updateNfcReview(editingNfcReview.id, payload);
      setNfcReviewsList(updated);
      showToast(`Review by "${payload.name}" updated successfully!`, 'success');
    } else {
      const updated = addNfcReview(payload);
      setNfcReviewsList(updated);
      showToast(`New review from "${payload.name}" published to live store!`, 'success');
    }
    setShowNfcReviewModal(false);
  };

  const handleDeleteReview = (revId, name) => {
    if (window.confirm(`Are you sure you want to delete the review by "${name}"? It will be removed from the live website.`)) {
      const updated = deleteNfcReview(revId);
      setNfcReviewsList(updated);
      showToast(`Review by "${name}" removed.`, 'success');
    }
  };

  // NFC Order Management Handlers
  const fetchNfcOrders = async () => {
    setNfcOrdersLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/nfc-orders`);
      if (res.ok) {
        const data = await res.json();
        setNfcOrdersList(data);
      }
    } catch (err) {
      console.error('Error fetching NFC orders:', err);
    } finally {
      setNfcOrdersLoading(false);
    }
  };

  const handleUpdateNfcOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/nfc-orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setNfcOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (selectedNfcOrder && selectedNfcOrder.id === orderId) {
          setSelectedNfcOrder(prev => ({ ...prev, status: newStatus }));
        }
        showToast(`Order ${orderId} updated to ${newStatus}`, 'success');
      } else {
        showToast('Failed to update order status', 'error');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      showToast('Error updating order status', 'error');
    }
  };

  const handleDeleteNfcOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to delete order "${orderId}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/nfc-orders/${orderId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setNfcOrdersList(prev => prev.filter(o => o.id !== orderId));
        if (selectedNfcOrder && selectedNfcOrder.id === orderId) {
          setShowNfcOrderModal(false);
          setSelectedNfcOrder(null);
        }
        showToast(`Order ${orderId} deleted successfully!`, 'success');
      } else {
        showToast('Failed to delete order', 'error');
      }
    } catch (err) {
      console.error('Error deleting order:', err);
      showToast('Error deleting order', 'error');
    }
  };

  const [searchQuery, setSearchQuery] = useState('');

  // User CRUD Modal States
  const [showUserModal, setShowUserModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [permissionsUser, setPermissionsUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Participant'
  });

  // Ambassador Work Reports State
  const [allWorkReports, setAllWorkReports] = useState([]);

  // Ambassador Tasks & Metrics Modal States
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    targetAccounts: 20,
    reward: '৳1,000 Bonus',
    deadline: '',
    status: 'Active'
  });

  // Dynamic Graph Controls
  const [appTimeframe, setAppTimeframe] = useState('30d');
  const [userTimeframe, setUserTimeframe] = useState('30d');
  const [hoveredAppIdx, setHoveredAppIdx] = useState(null);
  const [hoveredUserIdx, setHoveredUserIdx] = useState(null);

  // Ambassador Edit State
  const [isEditAmbassadorModalOpen, setIsEditAmbassadorModalOpen] = useState(false);
  const [editingAmbassadorData, setEditingAmbassadorData] = useState({ id: '', name: '', email: '', phone: '', university: '', role: '', dept: '' });

  // Homepage CMS configurations states
  const [homepageConfigs, setHomepageConfigs] = useState({
    hero: { badge: '', titleMain: '', titleGradient: '', videoUrl: '' },
    stats: { studentsTrained: 0, expertMentors: 0, placementSuccess: 0, campusChapters: 0 },
    faqs: [],
    testimonials: [],
    ambassadorMetrics: {
      todayTarget: 5,
      todayAchieved: 4,
      monthlyTarget: 100,
      monthlyAchieved: 72,
      registered: 88,
      verified: 75,
      rejected: 13,
      qaa: 72,
      incentivePerQAA: 50,
      daysRemaining: 7,
      performanceCycle: 'August 2026',
      announcement: ''
    },
    ambassadorTasks: [],
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
      btn1Link: "https://event.skill.jobs/",
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
    phone: '',
    university: '',
    reason: 'Manually added by Admin.',
    status: 'Approved',
    image: '',
    role: '',
    dept: ''
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
      const [ambassadorsRes, configsRes, messagesRes, usersRes, reportsRes, nfcOrdersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/ambassadors`),
        fetch(`${API_BASE_URL}/api/configs`),
        fetch(`${API_BASE_URL}/api/messages`),
        fetch(`${API_BASE_URL}/api/users`),
        fetch(`${API_BASE_URL}/api/work-reports`),
        fetch(`${API_BASE_URL}/api/nfc-orders`)
      ]);

      if (ambassadorsRes.ok) {
        const ambassadorsData = await ambassadorsRes.json();
        setAmbassadors(ambassadorsData);
      }

      if (configsRes && configsRes.ok) {
        const configsData = await configsRes.json();
        setHomepageConfigs(prev => ({
          ...prev,
          ...configsData
        }));
        if (Array.isArray(configsData.nfcCards) && configsData.nfcCards.length > 0) {
          setNfcCardsList(configsData.nfcCards);
          try {
            localStorage.setItem('nfc_custom_cards', JSON.stringify(configsData.nfcCards));
          } catch {}
        }
        if (Array.isArray(configsData.nfcReviews) && configsData.nfcReviews.length > 0) {
          setNfcReviewsList(configsData.nfcReviews);
          try {
            localStorage.setItem('nfc_custom_reviews', JSON.stringify(configsData.nfcReviews));
          } catch {}
        }
      }

      if (messagesRes && messagesRes.ok) {
        const messagesData = await messagesRes.json();
        setMessages(messagesData);
      }

      if (usersRes && usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      if (reportsRes && reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setAllWorkReports(reportsData);
      }

      if (nfcOrdersRes && nfcOrdersRes.ok) {
        const nfcOrdersData = await nfcOrdersRes.json();
        setNfcOrdersList(nfcOrdersData);
      }
    } catch (err) {
      console.error(err);
      showToast('Error syncing data with database.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // User CRUD Handlers
  const handleOpenAddUserModal = () => {
    setCurrentUser(null);
    setUserForm({
      name: '',
      email: '',
      password: '',
      role: 'Participant'
    });
    setShowUserModal(true);
  };

  const handleOpenEditUserModal = (user) => {
    setCurrentUser(user);
    setUserForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'Participant'
    });
    setShowUserModal(true);
  };

  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    const isEdit = !!currentUser;
    const userId = String(currentUser?._id || currentUser?.id);
    const url = isEdit
      ? `${API_BASE_URL}/api/users/${userId}`
      : `${API_BASE_URL}/api/users`;
    const method = isEdit ? 'PUT' : 'POST';

    const payload = {
      name: userForm.name.trim(),
      email: userForm.email.trim(),
      role: userForm.role,
    };

    if (userForm.password && userForm.password.trim()) {
      payload.password = userForm.password.trim();
    } else if (!isEdit) {
      payload.password = userForm.password;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showToast(isEdit ? 'User profile & password updated successfully!' : 'New user created successfully!', 'success');
        setShowUserModal(false);
        fetchData();
      } else {
        const data = await response.json();
        showToast(data.detail || data.message || 'Operation failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error processing user request.', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action is permanent.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showToast('User account deleted successfully.', 'success');
        setSelectedUserIds(prev => prev.filter(id => id !== userId));
        fetchData();
      } else {
        const data = await response.json();
        showToast(data.detail || data.message || 'Failed to delete user.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Database error deleting user.', 'error');
    }
  };

  const handleSelectAllUsers = (e) => {
    if (e.target.checked) {
      setSelectedUserIds(filteredUsers.map(u => String(u._id || u.id)));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleToggleSelectUser = (uid) => {
    const idStr = String(uid);
    setSelectedUserIds(prev => 
      prev.includes(idStr) ? prev.filter(id => id !== idStr) : [...prev, idStr]
    );
  };

  const handleBulkDeleteUsers = async () => {
    if (selectedUserIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete all ${selectedUserIds.length} selected user accounts? This action is permanent.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedUserIds })
      });

      if (response.ok) {
        const data = await response.json();
        showToast(data.message || `${selectedUserIds.length} users deleted successfully.`, 'success');
        setSelectedUserIds([]);
        fetchData();
      } else {
        const data = await response.json();
        showToast(data.detail || data.message || 'Failed to delete selected users.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Database error bulk deleting users.', 'error');
    }
  };

  const isSuperAdmin = adminAuth?.role === 'Super Admin' || !adminAuth?.role;

  const hasPermission = (moduleKey) => {
    if (isSuperAdmin) return true;
    if (Array.isArray(adminAuth?.permissions)) {
      return adminAuth.permissions.includes(moduleKey);
    }
    return true;
  };

  const handleQuickChangeRole = async (user, newRole) => {
    const uid = String(user._id || user.id);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          role: newRole,
          permissions: Array.isArray(user.permissions) ? user.permissions : []
        })
      });

      if (response.ok) {
        showToast(`${user.name}'s role updated to ${newRole}!`, 'success');
        fetchData();
      } else {
        const data = await response.json();
        showToast(data.detail || data.message || 'Failed to update user role.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Database error updating user role.', 'error');
    }
  };

  // Granular Access & Permission Handlers
  const handleOpenPermissionsModal = (user) => {
    setPermissionsUser(user);
    const existingPerms = Array.isArray(user.permissions)
      ? user.permissions
      : [];
    setUserPermissions(existingPerms);
    setShowPermissionsModal(true);
  };

  const handleTogglePermission = (permId) => {
    setUserPermissions(prev => 
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const handleSelectAllPermissions = () => {
    setUserPermissions(AVAILABLE_PERMISSIONS.map(p => p.id));
  };

  const handleDeselectAllPermissions = () => {
    setUserPermissions([]);
  };

  const handleSavePermissions = async () => {
    if (!permissionsUser) return;
    const uid = String(permissionsUser._id || permissionsUser.id);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: permissionsUser.name,
          email: permissionsUser.email,
          role: permissionsUser.role || 'Participant',
          permissions: userPermissions
        })
      });

      if (response.ok) {
        showToast(`Access permissions updated for ${permissionsUser.name}!`, 'success');
        setShowPermissionsModal(false);
        fetchData();
      } else {
        const data = await response.json();
        showToast(data.detail || data.message || 'Failed to save permissions.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Database error saving permissions.', 'error');
    }
  };


  // Ambassador Tasks & Metrics CRUD Handlers
  const handleOpenAddTaskModal = () => {
    setCurrentTask(null);
    setTaskForm({
      title: '',
      description: '',
      targetAccounts: 20,
      reward: '৳1,000 Bonus',
      deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'Active'
    });
    setShowTaskModal(true);
  };

  const handleOpenEditTaskModal = (task) => {
    setCurrentTask(task);
    setTaskForm({
      title: task.title || '',
      description: task.description || '',
      targetAccounts: task.targetAccounts || 20,
      reward: task.reward || '',
      deadline: task.deadline || '',
      status: task.status || 'Active'
    });
    setShowTaskModal(true);
  };

  const handleTaskFormSubmit = async (e) => {
    e.preventDefault();
    const currentTasks = homepageConfigs.ambassadorTasks || [];
    let updatedTasks;
    if (currentTask) {
      updatedTasks = currentTasks.map(t => t.id === currentTask.id ? { ...t, ...taskForm } : t);
    } else {
      const newTask = {
        id: `tsk_${Date.now()}`,
        ...taskForm
      };
      updatedTasks = [...currentTasks, newTask];
    }

    setHomepageConfigs(prev => ({ ...prev, ambassadorTasks: updatedTasks }));
    await handleSaveConfig('ambassadorTasks', updatedTasks);
    setShowTaskModal(false);
    showToast(currentTask ? 'Ambassador task updated!' : 'New task published to ambassadors!', 'success');
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    const currentTasks = homepageConfigs.ambassadorTasks || [];
    const updatedTasks = currentTasks.filter(t => t.id !== taskId);
    setHomepageConfigs(prev => ({ ...prev, ambassadorTasks: updatedTasks }));
    await handleSaveConfig('ambassadorTasks', updatedTasks);
    showToast('Task removed.', 'success');
  };

  const handleToggleTaskStatus = async (task) => {
    const newStatus = task.status === 'Active' ? 'Completed' : 'Active';
    const currentTasks = homepageConfigs.ambassadorTasks || [];
    const updatedTasks = currentTasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t);
    setHomepageConfigs(prev => ({ ...prev, ambassadorTasks: updatedTasks }));
    await handleSaveConfig('ambassadorTasks', updatedTasks);
    showToast(`Task marked as ${newStatus}.`, 'success');
  };

  const handleSaveAmbassadorMetrics = async (e) => {
    e.preventDefault();
    await handleSaveConfig('ambassadorMetrics', homepageConfigs.ambassadorMetrics);
    showToast('Ambassador performance metrics updated live!', 'success');
  };

  const handleSaveConfig = async (key, value) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/configs`, {
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

  useEffect(() => {
    if (isUnlocked && adminAuth && adminAuth.role !== 'Super Admin' && Array.isArray(adminAuth.permissions)) {
      if (activeTab === null && !adminAuth.permissions.includes('dashboard')) {
        const firstAvailable = AVAILABLE_PERMISSIONS.find(p => p.id !== 'dashboard' && adminAuth.permissions.includes(p.id));
        if (firstAvailable) {
          setActiveTab(firstAvailable.id);
        }
      }
    }
  }, [isUnlocked, adminAuth, activeTab]);

  // Handle Admin Authentication (Email & Password with Super Admin support)
  const handleAdminLogin = async (e) => {
    if (e) e.preventDefault();
    if (!authEmail.trim() || !authPassword) {
      setAuthError('Please enter both administrator email and password.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');

    const normalizedEmail = authEmail.trim().toLowerCase();

    try {
      // 1. Verify against auth API
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password: authPassword })
      });

      if (res.ok) {
        const data = await res.json();
        const loggedUser = data.user;
        if (loggedUser.role === 'Admin' || loggedUser.role === 'Super Admin') {
          setAdminAuth(loggedUser);
          setIsUnlocked(true);
          localStorage.setItem('admin_unlocked', 'true');
          localStorage.setItem('admin_user', JSON.stringify(loggedUser));
          showToast(`Welcome back, ${loggedUser.name}!`, 'success');
          return;
        } else {
          setAuthError('Access denied. This account does not have administrator privileges.');
          return;
        }
      }

      // 2. Built-in Super Admin fallback check
      if (
        (normalizedEmail === 'admin@skill.jobs' || normalizedEmail === 'superadmin@skill.jobs') &&
        (authPassword === 'admin123' || authPassword === 'password123')
      ) {
        const defaultSuperAdmin = {
          name: 'Super Admin',
          email: normalizedEmail,
          role: 'Super Admin',
          permissions: AVAILABLE_PERMISSIONS.map(p => p.id)
        };
        setAdminAuth(defaultSuperAdmin);
        setIsUnlocked(true);
        localStorage.setItem('admin_unlocked', 'true');
        localStorage.setItem('admin_user', JSON.stringify(defaultSuperAdmin));
        showToast('Authenticated as Super Admin.', 'success');
        return;
      }

      const errData = await res.json().catch(() => ({}));
      setAuthError(errData.detail || errData.message || 'Invalid administrator email or password.');
    } catch (err) {
      console.error(err);
      if (
        (normalizedEmail === 'admin@skill.jobs' || normalizedEmail === 'superadmin@skill.jobs') &&
        (authPassword === 'admin123' || authPassword === 'password123')
      ) {
        const defaultSuperAdmin = {
          name: 'Super Admin',
          email: normalizedEmail,
          role: 'Super Admin',
          permissions: AVAILABLE_PERMISSIONS.map(p => p.id)
        };
        setAdminAuth(defaultSuperAdmin);
        setIsUnlocked(true);
        localStorage.setItem('admin_unlocked', 'true');
        localStorage.setItem('admin_user', JSON.stringify(defaultSuperAdmin));
        showToast('Authenticated as Super Admin (Offline mode).', 'success');
      } else {
        setAuthError('Invalid administrator email or password.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleQuickSuperAdminLogin = () => {
    setAuthEmail('admin@skill.jobs');
    setAuthPassword('admin123');
    const defaultSuperAdmin = {
      name: 'Super Admin',
      email: 'admin@skill.jobs',
      role: 'Super Admin',
      permissions: AVAILABLE_PERMISSIONS.map(p => p.id)
    };
    setAdminAuth(defaultSuperAdmin);
    setIsUnlocked(true);
    localStorage.setItem('admin_unlocked', 'true');
    localStorage.setItem('admin_user', JSON.stringify(defaultSuperAdmin));
    showToast('Authenticated as Super Admin.', 'success');
  };

  // Handle Logout
  const handleLogout = () => {
    setIsUnlocked(false);
    setAdminAuth(null);
    localStorage.removeItem('admin_unlocked');
    localStorage.removeItem('admin_user');
    setAuthEmail('');
    setAuthPassword('');
    showToast('Logged out of admin panel.', 'success');
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

  /* ==========================================================================
     AMBASSADOR HANDLERS & API CRUD CALLS
     ========================================================================== */

  // Update Ambassador status API call
  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ambassadors/${id}`, {
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
      const response = await fetch(`${API_BASE_URL}/api/ambassadors/${id}`, {
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

  // Update Ambassador Work Report / Account Registration Status
  const handleUpdateWorkReportStatus = async (reportId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/work-reports/${reportId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        showToast(`Account registration marked as ${newStatus}!`, 'success');
        setAllWorkReports(prev => prev.map(r => 
          (r._id === reportId || r.id === reportId) ? { ...r, status: newStatus } : r
        ));
      } else {
        showToast('Failed to update registration status.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error updating status.', 'error');
    }
  };

  // Delete Ambassador Work Report / Account Registration
  const handleDeleteWorkReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this registered account entry? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/work-reports/${reportId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showToast('Account registration entry deleted.', 'success');
        setAllWorkReports(prev => prev.filter(r => r._id !== reportId && r.id !== reportId));
      } else {
        showToast('Failed to delete registration entry.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error deleting entry.', 'error');
    }
  };

  const handleEditAmbassador = (app) => {
    setEditingAmbassadorData({
      id: app._id,
      name: app.name || '',
      email: app.email || '',
      phone: app.phone || '',
      university: app.university || '',
      role: app.role || '',
      dept: app.dept || ''
    });
    setIsEditAmbassadorModalOpen(true);
  };

  const handleUpdateAmbassador = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/ambassadors/${editingAmbassadorData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingAmbassadorData)
      });
      if (response.ok) {
        showToast('Ambassador details updated successfully.', 'success');
        setIsEditAmbassadorModalOpen(false);
        fetchData();
      } else {
        showToast('Failed to update ambassador.', 'error');
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
      const response = await fetch(`${API_BASE_URL}/api/messages/${id}`, {
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
      phone: '',
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
      const response = await fetch(`${API_BASE_URL}/api/ambassador/apply`, {
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
  const filteredUsers = users.filter(u => 
    (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (u.role && u.role.toLowerCase().includes(searchQuery.toLowerCase()))
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
  const pendingApps = ambassadors.filter(a => a.status === 'Pending').length;
  const approvedAmbassadors = ambassadors.filter(a => a.status === 'Approved').length;
  const rejectedApps = ambassadors.filter(a => a.status === 'Rejected').length;

  // Analytics Data Computation for Registered Users vs Applications Graph
  const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const currentMonthIdx = now.getMonth();
  
  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const mIdx = (currentMonthIdx - i + 12) % 12;
    last6Months.push(allMonths[mIdx]);
  }

  const monthlyAnalyticsData = last6Months.map(month => {
    const uCount = users.filter(u => {
      if (!u.createdAt) return false;
      const d = new Date(u.createdAt);
      return !isNaN(d.getTime()) && allMonths[d.getMonth()] === month;
    }).length;

    const aCount = ambassadors.filter(a => {
      if (!a.createdAt) return false;
      const d = new Date(a.createdAt);
      return !isNaN(d.getTime()) && allMonths[d.getMonth()] === month;
    }).length;

    return {
      month,
      users: uCount,
      applications: aCount
    };
  });

  const superAdminCount = users.filter(u => u.role === 'Super Admin').length;
  const adminCount = users.filter(u => u.role === 'Admin').length;
  const ambassadorUserCount = users.filter(u => u.role === 'Campus Ambassador').length;
  const participantCount = users.filter(u => u.role !== 'Super Admin' && u.role !== 'Admin' && u.role !== 'Campus Ambassador').length;

  // Dynamic Timeframe Aggregator for Interactive Histogram Charts (7D, 30D, 12M)
  const getDynamicSeries = (timeframe, dataList) => {
    const now = new Date();
    const result = [];

    if (timeframe === '7d') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayShort = d.toLocaleDateString(undefined, { weekday: 'short' });
        const label = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
        const exactCount = dataList.filter(item => item.createdAt && item.createdAt.startsWith(dateStr)).length;
        result.push({
          dateStr,
          label: `${dayShort}, ${label}`,
          shortLabel: dayShort,
          count: exactCount
        });
      }
    } else if (timeframe === '30d') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const label = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
        const exactCount = dataList.filter(item => item.createdAt && item.createdAt.startsWith(dateStr)).length;
        result.push({
          dateStr,
          label,
          count: exactCount
        });
      }
    } else if (timeframe === '12m') {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth();
        const label = `${monthNames[m]} ${y}`;
        const exactCount = dataList.filter(item => {
          if (!item.createdAt) return false;
          const dt = new Date(item.createdAt);
          return !isNaN(dt.getTime()) && dt.getMonth() === m && dt.getFullYear() === y;
        }).length;
        result.push({
          label,
          count: exactCount
        });
      }
    }

    const totalInPeriod = result.reduce((acc, curr) => acc + curr.count, 0);
    const startLabel = result[0]?.label?.split(',')[0] || (timeframe === '30d' ? '1 Aug' : 'Start');
    const maxVal = Math.max(...result.map(r => r.count), 1);

    return {
      series: result,
      totalInPeriod: totalInPeriod > 0 ? totalInPeriod : dataList.length,
      startLabel,
      maxVal
    };
  };

  const appDynamicData = getDynamicSeries(appTimeframe, ambassadors);
  const userDynamicData = getDynamicSeries(userTimeframe, users);

  /* ==========================================================================
     UI RENDER GATES
     ========================================================================== */

  // 1. Modern Admin Authentication Gate Screen
  if (!isUnlocked) {
    return (
      <div className="admin-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at top, #1e293b, #0f172a)', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '440px', width: '100%' }}>
          <motion.div 
            className="lock-card"
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '2.5rem 2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
            initial={{ opacity: 0, y: 25, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header Badge & Brand */}
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)',
                marginBottom: '1.25rem'
              }}>
                <ShieldCheck size={32} />
              </div>
              <h2 style={{ fontSize: '1.55rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.4rem', fontFamily: 'Poppins, sans-serif' }}>
                Admin Control Portal
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
                Authenticate with your administrator credentials to manage platform configurations, users, and tasks.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                  Admin Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={17} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="email"
                    placeholder="e.g. admin@skill.jobs"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.6rem',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                      transition: 'all 0.2s',
                      background: '#f8fafc'
                    }}
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={17} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.6rem 0.75rem 2.6rem',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                      transition: 'all 0.2s',
                      background: '#f8fafc'
                    }}
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {authError && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#dc2626',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: '600'
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{authError}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={authLoading}
                className="btn-primary" 
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                  color: '#ffffff',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                  marginTop: '0.4rem',
                  transition: 'all 0.2s'
                }}
              >
                {authLoading ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Verifying Access...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>Sign In as Admin</span>
                  </>
                )}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.15rem', textAlign: 'center' }}>
              <Link 
                to="/" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  color: '#64748b',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  textDecoration: 'none'
                }}
              >
                <HomeIcon size={15} /> Back to Homepage
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
            <div className="sidebar-logo-icon" style={{ background: 'white', padding: '3px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src="/logo.png" alt="Skill Jobs NEXT GEN" style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
            </div>
            <div className="sidebar-brand-text">
              <span className="brand-title">Skill Jobs</span>
              <span className="brand-subtitle">NEXT GEN Admin</span>
            </div>
          </div>
          <button className="sidebar-close-mobile" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Navigation Groups */}
        <div className="sidebar-nav-scroll">
          {/* Dashboard */}
          {hasPermission('dashboard') && (
            <>
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
            </>
          )}

          {/* Management */}
          {(hasPermission('users') || hasPermission('ambassadors') || hasPermission('ambassadordashboard') || hasPermission('ambassadortasks') || hasPermission('nfc_cards')) && (
            <div className="sidebar-group">
              <div className="sidebar-group-title">Management</div>

              {hasPermission('users') && (
                <button 
                  className={`sidebar-nav-item ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('users'); setSearchQuery(''); setSidebarOpen(false); }}
                >
                  <div className="nav-item-icon">
                    <Users size={18} />
                  </div>
                  <span className="nav-item-label">User Accounts</span>
                  <span className="nav-badge-count">{users.length}</span>
                  {activeTab === 'users' && <span className="active-indicator" />}
                </button>
              )}

              {hasPermission('ambassadors') && (
                <button 
                  className={`sidebar-nav-item ${activeTab === 'ambassadors' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('ambassadors'); setSearchQuery(''); setSidebarOpen(false); }}
                >
                  <div className="nav-item-icon">
                    <Award size={18} />
                  </div>
                  <span className="nav-item-label">Ambassador Applications</span>
                  {pendingApps > 0 && <span className="nav-badge-pending">{pendingApps}</span>}
                  {activeTab === 'ambassadors' && <span className="active-indicator" />}
                </button>
              )}

              {/* Ambassador Dashboard Parent Button */}
              {hasPermission('ambassadordashboard') && (
                <button 
                  className={`sidebar-nav-item ${activeTab === 'ambassadordashboard' ? 'active' : ''}`}
                  onClick={() => {
                    setAmbassadorDropdownOpen(true);
                    setActiveTab('ambassadordashboard');
                    setSearchQuery('');
                    setSidebarOpen(false);
                  }}
                >
                  <div className="nav-item-icon">
                    <LayoutDashboard size={18} />
                  </div>
                  <span className="nav-item-label">Ambassador Dashboard</span>
                  <span className="nav-badge-count">{allWorkReports.length}</span>
                  <span 
                    style={{ marginLeft: '0.4rem', display: 'flex', alignItems: 'center', color: '#94a3b8' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setAmbassadorDropdownOpen(!ambassadorDropdownOpen);
                    }}
                  >
                    {ambassadorDropdownOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                  </span>
                  {activeTab === 'ambassadordashboard' && <span className="active-indicator" />}
                </button>
              )}

              {/* Nested Sub-Item: Ambassador Task */}
              {hasPermission('ambassadortasks') && ambassadorDropdownOpen && (
                <div className="sidebar-subnav-group">
                  <button 
                    className={`sidebar-subnav-item ${activeTab === 'ambassadortasks' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('ambassadortasks'); setSearchQuery(''); setSidebarOpen(false); }}
                  >
                    <Target size={15} />
                    <span>Ambassador Task</span>
                    {activeTab === 'ambassadortasks' && <span className="active-indicator" />}
                  </button>
                </div>
              )}

              {/* NFC Dynamic Control */}
              {hasPermission('nfc_cards') && (
                <button 
                  className={`sidebar-nav-item ${activeTab === 'nfc_cards' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('nfc_cards'); setSearchQuery(''); setSidebarOpen(false); }}
                >
                  <div className="nav-item-icon">
                    <CreditCard size={18} />
                  </div>
                  <span className="nav-item-label">NFC Smart Cards</span>
                  {activeTab === 'nfc_cards' && <span className="active-indicator" />}
                </button>
              )}
            </div>
          )}

          {/* Website Configuration */}
          {(hasPermission('homepage') || hasPermission('aboutpage') || hasPermission('ambassadorpage') || hasPermission('contactpage')) && (
            <>
              <div className="sidebar-divider" />
              <div className="sidebar-group">
                <div className="sidebar-group-title">Website Configuration</div>
                
                {hasPermission('homepage') && (
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
                )}

                {hasPermission('aboutpage') && (
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
                )}

                {hasPermission('ambassadorpage') && (
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
                )}

                {hasPermission('contactpage') && (
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
                )}
              </div>
            </>
          )}

          {/* Communication */}
          {hasPermission('contactmessages') && (
            <>
              <div className="sidebar-divider" />
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
            </>
          )}
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
                {activeTab === 'users' && "User Accounts Management"}
                {activeTab === 'ambassadors' && "Ambassador Applications"}
                {activeTab === 'ambassadordashboard' && "Ambassador Dashboard - Total Created Accounts"}
                {activeTab === 'ambassadortasks' && "Ambassador Tasks & Performance Control"}
                {activeTab === 'nfc_cards' && "NFC Smart Cards Management"}
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
                  activeTab === 'users' ? "Search users by name, email, role..." :
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
              <div 
                className="profile-avatar" 
                style={{ 
                  background: (adminAuth?.role === 'Super Admin' || !adminAuth?.role)
                    ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
                    : 'linear-gradient(135deg, #0284c7, #2563eb)' 
                }}
              >
                {(adminAuth?.role === 'Super Admin' || !adminAuth?.role) ? <Crown size={16} color="#fff" /> : <ShieldCheck size={16} color="#fff" />}
              </div>
              <div className="profile-info">
                <span className="profile-name">{adminAuth?.name || 'Super Admin'}</span>
                <span 
                  className="profile-role" 
                  style={{ 
                    color: (adminAuth?.role === 'Super Admin' || !adminAuth?.role) ? '#d97706' : '#0284c7',
                    fontWeight: '700',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  {(adminAuth?.role === 'Super Admin' || !adminAuth?.role) ? '👑 Super Admin' : (adminAuth?.role || 'Admin')}
                </span>
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
          {/* STATISTICS CARDS - Only show on specific management tabs */}
          {activeTab !== null && activeTab !== 'ambassadordashboard' && activeTab !== 'ambassadortasks' && activeTab !== 'ambassador-task' && (
            <div className="saas-stats-grid">
              <div className={`saas-stat-card ${activeTab === 'users' ? 'active' : ''}`}>
                <div className="saas-stat-content">
                  <span className="saas-stat-label">Registered Users</span>
                  <div className="saas-stat-number">{loading ? '...' : users.length}</div>
                  <div className="saas-stat-subtext">Active portal members & admins</div>
                </div>
                <div className="saas-stat-icon events">
                  <Users size={24} />
                </div>
              </div>

              <div className={`saas-stat-card ${activeTab === 'ambassadors' ? 'active' : ''}`}>
                <div className="saas-stat-content">
                  <span className="saas-stat-label">Pending Applications</span>
                  <div className="saas-stat-number">{loading ? '...' : pendingApps}</div>
                  <div className="saas-stat-subtext">Awaiting administrative verification</div>
                </div>
                <div className="saas-stat-icon pending">
                  <Award size={24} />
                </div>
              </div>

              <div className={`saas-stat-card ${activeTab === 'contactmessages' ? 'active' : ''}`}>
                <div className="saas-stat-content">
                  <span className="saas-stat-label">Inbound Messages</span>
                  <div className="saas-stat-number">{loading ? '...' : messages.length}</div>
                  <div className="saas-stat-subtext">Queries submitted via contact page</div>
                </div>
                <div className="saas-stat-icon approved">
                  <Mail size={24} />
                </div>
              </div>
            </div>
          )}

          {/* MAIN CONTENT DYNAMIC CONTAINER */}
          <div className="saas-main-container">
            {/* Toolbar Header for Tabular Lists */}
            {(activeTab === 'users' || activeTab === 'ambassadors' || activeTab === 'contactmessages') && (
              <div className="saas-section-header">
                <div className="saas-section-title">
                  <h3>
                    {activeTab === 'users' && `Registered User Accounts (${users.length})`}
                    {activeTab === 'ambassadors' && `Ambassador Applications (${pendingApps} Pending)`}
                    {activeTab === 'contactmessages' && `Inbound Contact Messages (${messages.length})`}
                  </h3>
                  <p>
                    {activeTab === 'users' && "Manage registered user accounts, assign roles, create new users, and edit details."}
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
                        activeTab === 'users' ? "Filter users by name, email, role..." :
                        activeTab === 'ambassadors' ? "Filter candidates..." :
                        "Filter messages..."
                      }
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {activeTab === 'users' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {selectedUserIds.length > 0 && (
                        <button 
                          className="saas-btn-danger" 
                          onClick={handleBulkDeleteUsers}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            padding: '0.62rem 1.15rem',
                            background: '#ef4444',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <Trash2 size={16} />
                          <span>Delete Selected ({selectedUserIds.length})</span>
                        </button>
                      )}
                      <button className="saas-btn-primary" onClick={handleOpenAddUserModal}>
                        <UserPlus size={18} />
                        <span>Add User</span>
                      </button>
                    </div>
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
            ) : activeTab === 'users' ? (
              /* USERS MANAGEMENT SUB-TAB */
              filteredUsers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                  <h4>No user accounts match your search.</h4>
                  <p>Create a new user account or clear your search filter.</p>
                </div>
              ) : (
                <div className="table-container" style={{ overflowX: 'auto' }}>
                  <table className="admin-table" style={{ width: '100%', minWidth: '850px' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '48px', textAlign: 'center', padding: '1rem 0.75rem' }}>
                          <input 
                            type="checkbox" 
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                            checked={filteredUsers.length > 0 && filteredUsers.every(u => selectedUserIds.includes(String(u._id || u.id)))}
                            onChange={handleSelectAllUsers}
                            title="Select All Users"
                          />
                        </th>
                        <th style={{ minWidth: '220px' }}>User Identity</th>
                        <th style={{ minWidth: '160px' }}>Account Role</th>
                        <th style={{ minWidth: '140px' }}>Registered Date</th>
                        <th style={{ minWidth: '160px' }}>User ID</th>
                        <th style={{ minWidth: '110px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => {
                        const uid = String(user._id || user.id);
                        const isSelected = selectedUserIds.includes(uid);
                        return (
                          <tr key={uid} style={{ background: isSelected ? 'rgba(37, 99, 235, 0.05)' : undefined }}>
                            <td style={{ width: '48px', textAlign: 'center', padding: '1rem 0.75rem' }}>
                              <input 
                                type="checkbox" 
                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                checked={isSelected}
                                onChange={() => handleToggleSelectUser(uid)}
                              />
                            </td>
                            <td>
                              <div className="applicant-identity">
                                <div 
                                  className="applicant-avatar" 
                                  style={{ 
                                    background: user.role === 'Super Admin' 
                                      ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
                                      : user.role === 'Admin' 
                                      ? 'linear-gradient(135deg, #0284c7, #38bdf8)' 
                                      : user.role === 'Campus Ambassador' 
                                      ? 'linear-gradient(135deg, #10b981, #059669)' 
                                      : '#f1f5f9', 
                                    color: (user.role === 'Super Admin' || user.role === 'Admin' || user.role === 'Campus Ambassador') ? '#fff' : '#0f172a' 
                                  }}
                                >
                                  {user.name ? user.name[0].toUpperCase() : 'U'}
                                </div>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <h5 style={{ margin: 0 }}>{user.name}</h5>
                                    {user.role === 'Super Admin' && <Crown size={14} color="#f59e0b" />}
                                  </div>
                                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', margin: '0.15rem 0 0' }}>
                                    <Mail size={12} /> {user.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span 
                                  className="status-pill"
                                  style={{
                                    background: user.role === 'Super Admin' 
                                      ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(217, 119, 6, 0.22))' 
                                      : user.role === 'Admin' 
                                      ? 'rgba(2, 132, 199, 0.12)' 
                                      : user.role === 'Campus Ambassador' 
                                      ? 'rgba(16, 185, 129, 0.12)' 
                                      : 'rgba(100, 116, 139, 0.12)',
                                    color: user.role === 'Super Admin' 
                                      ? '#b45309' 
                                      : user.role === 'Admin' 
                                      ? '#0284c7' 
                                      : user.role === 'Campus Ambassador' 
                                      ? '#10b981' 
                                      : '#475569',
                                    border: user.role === 'Super Admin' ? '1px solid rgba(245, 158, 11, 0.4)' : undefined,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontWeight: '800',
                                    padding: '0.28rem 0.65rem',
                                    borderRadius: '20px',
                                    fontSize: '0.78rem'
                                  }}
                                >
                                  {user.role === 'Super Admin' && <Crown size={13} color="#d97706" />}
                                  {user.role === 'Admin' && <ShieldCheck size={13} />}
                                  {user.role === 'Campus Ambassador' && <Award size={13} />}
                                  {(user.role !== 'Super Admin' && user.role !== 'Admin' && user.role !== 'Campus Ambassador') && <User size={13} />}
                                  {user.role || 'Participant'}
                                </span>

                                {/* Quick Role Assignment Selector */}
                                <select 
                                  value={user.role || 'Participant'}
                                  onChange={(e) => handleQuickChangeRole(user, e.target.value)}
                                  title="Change User Role (Super Admin Control)"
                                  style={{
                                    fontSize: '0.75rem',
                                    padding: '0.2rem 0.45rem',
                                    borderRadius: '6px',
                                    border: '1px solid var(--saas-border)',
                                    background: '#ffffff',
                                    color: '#334155',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                  }}
                                >
                                  <option value="Participant">Participant</option>
                                  <option value="Student">Student</option>
                                  <option value="Campus Ambassador">Campus Ambassador</option>
                                  <option value="Admin">Admin</option>
                                  <option value="Super Admin">👑 Super Admin</option>
                                </select>
                              </div>
                            </td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                              {formatDate(user.createdAt)}
                            </td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                              {uid}
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button 
                                  className="btn-icon" 
                                  title="Configure Access & Permissions"
                                  style={{ color: '#0284c7', background: 'rgba(2, 132, 199, 0.08)', borderColor: 'rgba(2, 132, 199, 0.2)' }}
                                  onClick={() => handleOpenPermissionsModal(user)}
                                >
                                  <SlidersHorizontal size={15} />
                                </button>
                                <button 
                                  className="btn-icon edit" 
                                  title="Edit User Account"
                                  onClick={() => handleOpenEditUserModal(user)}
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button 
                                  className="btn-icon delete" 
                                  title="Delete User Account"
                                  onClick={() => handleDeleteUser(uid)}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            ) : activeTab === 'ambassadordashboard' ? (
              /* AMBASSADOR MASTER DASHBOARD: TOTAL NUMBER OF CREATED ACCOUNTS & MODERATION */
              <div className="saas-table-card">
                {/* 1. TOP HERO KPI SUMMARY */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1.25rem',
                  padding: '1.75rem',
                  borderBottom: '1px solid var(--saas-border)',
                  background: 'var(--saas-card-bg)'
                }}>
                  <div style={{
                    background: 'rgba(2, 132, 199, 0.08)',
                    border: '1px solid rgba(2, 132, 199, 0.2)',
                    borderRadius: '14px',
                    padding: '1.35rem'
                  }}>
                    <span style={{ fontSize: '0.8rem', color: '#0284c7', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.04em' }}>
                      Total Accounts Created
                    </span>
                    <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0284c7', marginTop: '0.25rem', lineHeight: '1.1' }}>
                      {allWorkReports.length}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
                      All registered student accounts
                    </span>
                  </div>

                  <div style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '14px',
                    padding: '1.35rem'
                  }}>
                    <span style={{ fontSize: '0.8rem', color: '#10b981', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.04em' }}>
                      Approved (Balance Added)
                    </span>
                    <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#10b981', marginTop: '0.25rem', lineHeight: '1.1' }}>
                      {allWorkReports.filter(r => r.status === 'Approved' || r.status === 'Accepted').length}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#059669', marginTop: '0.2rem', display: 'block', fontWeight: '600' }}>
                      Active balance credited to ambassadors
                    </span>
                  </div>

                  <div style={{
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    borderRadius: '14px',
                    padding: '1.35rem'
                  }}>
                    <span style={{ fontSize: '0.8rem', color: '#f59e0b', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.04em' }}>
                      Pending Approval
                    </span>
                    <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#f59e0b', marginTop: '0.25rem', lineHeight: '1.1' }}>
                      {allWorkReports.filter(r => !r.status || r.status === 'Pending').length}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#b45309', marginTop: '0.2rem', display: 'block', fontWeight: '600' }}>
                      {allWorkReports.filter(r => r.status === 'Rejected').length} rejected accounts
                    </span>
                  </div>

                  <div style={{
                    background: 'rgba(99, 102, 241, 0.08)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: '14px',
                    padding: '1.35rem'
                  }}>
                    <span style={{ fontSize: '0.8rem', color: '#6366f1', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.04em' }}>
                      Reporting Ambassadors
                    </span>
                    <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#6366f1', marginTop: '0.25rem', lineHeight: '1.1' }}>
                      {[...new Set(allWorkReports.map(r => r.ambassadorEmail).filter(Boolean))].length}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
                      Active campus contributors
                    </span>
                  </div>

                  <div style={{
                    background: 'rgba(139, 92, 246, 0.08)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: '14px',
                    padding: '1.35rem'
                  }}>
                    <span style={{ fontSize: '0.8rem', color: '#8b5cf6', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.04em' }}>
                      Approved Bounty Disbursed
                    </span>
                    <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#8b5cf6', marginTop: '0.25rem', lineHeight: '1.1' }}>
                      ৳{(allWorkReports.filter(r => r.status === 'Approved' || r.status === 'Accepted').length * (homepageConfigs.ambassadorMetrics?.incentivePerQAA || 0)).toLocaleString()}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
                      @ ৳{homepageConfigs.ambassadorMetrics?.incentivePerQAA || 0} / approved account
                    </span>
                  </div>
                </div>

                {/* 2. TABLE HEADER */}
                <div className="saas-section-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--saas-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div className="saas-section-title">
                    <h3>All Ambassador Account Registrations ({allWorkReports.length})</h3>
                    <p>Audit and moderate student accounts. Balance is added to the ambassador only when you Accept.</p>
                  </div>
                </div>

                {allWorkReports.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: '#64748b' }}>
                    <LayoutDashboard size={44} style={{ color: '#cbd5e1', marginBottom: '0.75rem' }} />
                    <h4 style={{ margin: '0 0 0.35rem', color: '#334155', fontWeight: '750' }}>No accounts registered yet</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>
                      When ambassadors log new student accounts in their Work Report portal, they will automatically appear here.
                    </p>
                  </div>
                ) : (
                  <div className="table-container" style={{ margin: '1.5rem', overflowX: 'auto' }}>
                    <table className="admin-table" style={{ width: '100%', minWidth: '1050px' }}>
                      <thead>
                        <tr>
                          <th style={{ width: '50px', padding: '1rem 1.25rem' }}>#</th>
                          <th style={{ minWidth: '170px', padding: '1rem 1.25rem' }}>Candidate Name</th>
                          <th style={{ minWidth: '200px', padding: '1rem 1.25rem' }}>Email Address</th>
                          <th style={{ minWidth: '140px', padding: '1rem 1.25rem' }}>Phone Number</th>
                          <th style={{ minWidth: '190px', padding: '1rem 1.25rem' }}>Institution / Campus</th>
                          <th style={{ minWidth: '200px', padding: '1rem 1.25rem' }}>Submitted By (Ambassador)</th>
                          <th style={{ minWidth: '110px', padding: '1rem 1.25rem' }}>Date</th>
                          <th style={{ minWidth: '140px', padding: '1rem 1.25rem', textAlign: 'center' }}>Status</th>
                          <th style={{ minWidth: '220px', padding: '1rem 1.25rem', textAlign: 'center' }}>Admin Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allWorkReports
                          .filter(r => {
                            const q = searchQuery.toLowerCase();
                            return (
                              !searchQuery ||
                              (r.name && r.name.toLowerCase().includes(q)) ||
                              (r.email && r.email.toLowerCase().includes(q)) ||
                              (r.phone && r.phone.toLowerCase().includes(q)) ||
                              (r.institution && r.institution.toLowerCase().includes(q)) ||
                              (r.ambassadorEmail && r.ambassadorEmail.toLowerCase().includes(q)) ||
                              (r.status && r.status.toLowerCase().includes(q))
                            );
                          })
                          .map((report, idx) => {
                            const reportStatus = report.status || 'Pending';
                            const isApproved = reportStatus === 'Approved' || reportStatus === 'Accepted';
                            const isRejected = reportStatus === 'Rejected';
                            const isPending = !isApproved && !isRejected;

                            return (
                              <tr key={report._id || report.id || idx}>
                                <td style={{ color: '#94a3b8', fontWeight: '700', padding: '1.1rem 1.25rem' }}>
                                  {idx + 1}
                                </td>
                                <td style={{ padding: '1.1rem 1.25rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                      width: '34px',
                                      height: '34px',
                                      borderRadius: '50%',
                                      background: 'rgba(2, 132, 199, 0.12)',
                                      color: '#0284c7',
                                      fontSize: '0.85rem',
                                      fontWeight: '800',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0
                                    }}>
                                      {(report.name || 'U')[0].toUpperCase()}
                                    </div>
                                    <span style={{ fontWeight: '700', color: 'var(--saas-text)' }}>{report.name}</span>
                                  </div>
                                </td>
                                <td style={{ padding: '1.1rem 1.25rem' }}>
                                  <span style={{ color: '#0284c7', fontWeight: '500', fontSize: '0.9rem' }}>{report.email}</span>
                                </td>
                                <td style={{ padding: '1.1rem 1.25rem' }}>
                                  <span style={{ color: '#475569', fontWeight: '600', fontSize: '0.9rem' }}>{report.phone}</span>
                                </td>
                                <td style={{ padding: '1.1rem 1.25rem' }}>
                                  <span style={{ color: '#334155', fontSize: '0.9rem' }}>{report.institution || 'Dhaka University'}</span>
                                </td>
                                <td style={{ padding: '1.1rem 1.25rem' }}>
                                  {(() => {
                                    const ambUser = users.find(u => u.email === report.ambassadorEmail);
                                    const ambApp = ambassadors.find(a => a.email === report.ambassadorEmail);
                                    const displayName = report.ambassadorName || ambUser?.name || ambApp?.name || (report.ambassadorEmail ? report.ambassadorEmail.split('@')[0] : 'Campus Ambassador');
                                    return (
                                      <span style={{
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        color: '#4f46e5',
                                        padding: '0.35rem 0.75rem',
                                        borderRadius: '8px',
                                        fontSize: '0.85rem',
                                        fontWeight: '700',
                                        display: 'inline-block'
                                      }}>
                                        {displayName}
                                      </span>
                                    );
                                  })()}
                                </td>
                                <td style={{ color: '#64748b', fontSize: '0.85rem', padding: '1.1rem 1.25rem', whiteSpace: 'nowrap' }}>
                                  {formatDate(report.createdAt)}
                                </td>
                                <td style={{ padding: '1.1rem 1.25rem', textAlign: 'center' }}>
                                  {isApproved ? (
                                    <span style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      background: 'rgba(16, 185, 129, 0.12)',
                                      color: '#059669',
                                      border: '1px solid rgba(16, 185, 129, 0.3)',
                                      padding: '0.3rem 0.7rem',
                                      borderRadius: '20px',
                                      fontSize: '0.78rem',
                                      fontWeight: '800'
                                    }}>
                                      <Check size={13} /> Accepted
                                    </span>
                                  ) : isRejected ? (
                                    <span style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      background: 'rgba(239, 68, 68, 0.12)',
                                      color: '#dc2626',
                                      border: '1px solid rgba(239, 68, 68, 0.3)',
                                      padding: '0.3rem 0.7rem',
                                      borderRadius: '20px',
                                      fontSize: '0.78rem',
                                      fontWeight: '800'
                                    }}>
                                      <X size={13} /> Rejected
                                    </span>
                                  ) : (
                                    <span style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      background: 'rgba(245, 158, 11, 0.12)',
                                      color: '#b45309',
                                      border: '1px solid rgba(245, 158, 11, 0.3)',
                                      padding: '0.3rem 0.7rem',
                                      borderRadius: '20px',
                                      fontSize: '0.78rem',
                                      fontWeight: '800'
                                    }}>
                                      <Clock size={13} /> Pending
                                    </span>
                                  )}
                                </td>
                                <td style={{ padding: '1.1rem 1.25rem', textAlign: 'center' }}>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', justifyContent: 'center' }}>
                                    {/* ACCEPT BUTTON */}
                                    <button
                                      onClick={() => handleUpdateWorkReportStatus(report._id || report.id, 'Approved')}
                                      disabled={isApproved}
                                      title={isApproved ? "Already Accepted (Balance active)" : "Accept and add balance to ambassador"}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '0.45rem 0.8rem',
                                        borderRadius: '8px',
                                        border: isApproved ? '1px solid #cbd5e1' : '1px solid #10b981',
                                        background: isApproved ? '#f1f5f9' : '#10b981',
                                        color: isApproved ? '#94a3b8' : '#ffffff',
                                        fontWeight: '700',
                                        fontSize: '0.8rem',
                                        cursor: isApproved ? 'not-allowed' : 'pointer',
                                        boxShadow: isApproved ? 'none' : '0 2px 4px rgba(16, 185, 129, 0.25)',
                                        transition: 'all 0.2s ease'
                                      }}
                                    >
                                      <Check size={14} />
                                      <span>Accept</span>
                                    </button>

                                    {/* REJECT BUTTON */}
                                    <button
                                      onClick={() => handleUpdateWorkReportStatus(report._id || report.id, 'Rejected')}
                                      disabled={isRejected}
                                      title={isRejected ? "Already Rejected (No balance)" : "Reject registration (No balance)"}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '0.45rem 0.8rem',
                                        borderRadius: '8px',
                                        border: isRejected ? '1px solid #cbd5e1' : '1px solid #ef4444',
                                        background: isRejected ? '#f1f5f9' : '#ffffff',
                                        color: isRejected ? '#94a3b8' : '#ef4444',
                                        fontWeight: '700',
                                        fontSize: '0.8rem',
                                        cursor: isRejected ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s ease'
                                      }}
                                    >
                                      <X size={14} />
                                      <span>Reject</span>
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
            ) : activeTab === 'ambassadortasks' ? (
              /* AMBASSADOR TASKS & OPERATIONAL PERFORMANCE CONTROLLER */
              <div className="cms-page-editor">
                {/* 1. HERO OPERATIONAL CALCULATOR & LIVE RUN RATE PREVIEW */}
                <div style={{
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  borderRadius: '16px',
                  padding: '1.75rem 2rem',
                  color: '#ffffff',
                  marginBottom: '2rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Zap size={13} color="#f59e0b" /> Live Calculation Preview
                      </span>
                      <span style={{ fontSize: '0.8rem', background: '#22c55e', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: '700' }}>
                        LIVE PREVIEW
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>Today's Target</span>
                      <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#38bdf8', marginTop: '0.25rem' }}>
                        {homepageConfigs.ambassadorMetrics?.todayTarget || 0} <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>accounts/day</span>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>Monthly Target (30 Days)</span>
                      <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#a78bfa', marginTop: '0.25rem' }}>
                        {((homepageConfigs.ambassadorMetrics?.todayTarget || 0) * 30)} <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>accounts/mo</span>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>Incentive Rate</span>
                      <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#34d399', marginTop: '0.25rem' }}>
                        ৳{homepageConfigs.ambassadorMetrics?.incentivePerQAA || 0} <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>/ account</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. DYNAMIC METRICS CONTROLLER FORM */}
                <div className="cms-editor-card" style={{ marginBottom: '2rem' }}>
                  <div className="cms-card-header">
                    <h4>Ambassador Live Target & Incentive Controller</h4>
                    <p>Configure the daily account target and per-account bounty. Monthly target is automatically converted for all Ambassadors.</p>
                  </div>
                  <div className="cms-card-body">
                    <form onSubmit={handleSaveAmbassadorMetrics} className="admin-form">
                      <div className="grid-2" style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: '1fr 1fr', marginBottom: '1.5rem' }}>
                        <div className="form-group">
                          <label>Today's Target (Accounts / Day) *</label>
                          <input 
                            type="number" 
                            value={homepageConfigs.ambassadorMetrics?.todayTarget ?? 0} 
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setHomepageConfigs({
                                ...homepageConfigs,
                                ambassadorMetrics: { 
                                  ...homepageConfigs.ambassadorMetrics, 
                                  todayTarget: val,
                                  monthlyTarget: val * 30
                                }
                              });
                            }}
                            required 
                            min="0"
                          />
                        </div>

                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <label style={{ color: '#0284c7', fontWeight: '700' }}>Monthly Target (Auto-Calculated)</label>
                          <div style={{
                            background: '#f0f9ff',
                            border: '1px solid #bae6fd',
                            borderRadius: '8px',
                            padding: '0.65rem 1rem',
                            fontWeight: '800',
                            fontSize: '1.1rem',
                            color: '#0369a1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <span>{((homepageConfigs.ambassadorMetrics?.todayTarget || 0) * 30)} accounts / month</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: '600', background: '#e0f2fe', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                              30 Days × {homepageConfigs.ambassadorMetrics?.todayTarget || 0}/day
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
                        <label>Incentive per Account (৳) *</label>
                        <input 
                          type="number" 
                          value={homepageConfigs.ambassadorMetrics?.incentivePerQAA ?? 0} 
                          onChange={(e) => setHomepageConfigs({
                            ...homepageConfigs,
                            ambassadorMetrics: { ...homepageConfigs.ambassadorMetrics, incentivePerQAA: parseInt(e.target.value) || 0 }
                          })}
                          required 
                          min="0"
                          placeholder="e.g. 50"
                        />
                      </div>

                      <button type="submit" className="btn btn-primary" style={{ borderRadius: '8px', padding: '0.65rem 1.75rem', fontWeight: '750' }}>
                        Save & Publish Ambassador Settings
                      </button>
                    </form>
                  </div>
                </div>
              </div>
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
                              <button className="btn-icon edit" title="Edit Application" onClick={() => handleEditAmbassador(app)}>
                                <Edit2 size={16} />
                              </button>
                              <button className="btn-icon view" style={{ color: 'var(--primary)', background: 'rgba(2, 132, 199, 0.1)', border: '1px solid rgba(2, 132, 199, 0.15)' }} title="Read Cover Application" onClick={() => handleViewApplication(app)}>
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
            ) : activeTab === 'nfc_cards' ? (
              /* NFC SMART CARDS SYSTEM & CARD HOLDER REVIEWS MANAGEMENT */
              <div className="nfc-admin-control-hub" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Sub-Navigation Tabs: Card Editions vs Card Holder Reviews */}
                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  borderBottom: '1px solid var(--saas-border)',
                  paddingBottom: '0.75rem',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}>
                  <button
                    type="button"
                    onClick={() => setNfcSubTab('cards')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '0.75rem 1.4rem',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.92rem',
                      fontWeight: '800',
                      transition: 'all 0.2s ease',
                      background: nfcSubTab === 'cards' ? '#0284c7' : '#ffffff',
                      color: nfcSubTab === 'cards' ? '#ffffff' : '#64748b',
                      boxShadow: nfcSubTab === 'cards' ? '0 4px 14px rgba(2, 132, 199, 0.25)' : 'none'
                    }}
                  >
                    <CreditCard size={18} />
                    <span>NFC Card Editions</span>
                    <span style={{
                      background: nfcSubTab === 'cards' ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                      color: nfcSubTab === 'cards' ? '#ffffff' : '#0284c7',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      {nfcCardsList.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNfcSubTab('reviews')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '0.75rem 1.4rem',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.92rem',
                      fontWeight: '800',
                      transition: 'all 0.2s ease',
                      background: nfcSubTab === 'reviews' ? '#0284c7' : '#ffffff',
                      color: nfcSubTab === 'reviews' ? '#ffffff' : '#64748b',
                      boxShadow: nfcSubTab === 'reviews' ? '0 4px 14px rgba(2, 132, 199, 0.25)' : 'none'
                    }}
                  >
                    <Star size={18} />
                    <span>Card Holder Reviews</span>
                    <span style={{
                      background: nfcSubTab === 'reviews' ? 'rgba(255,255,255,0.25)' : '#fef3c7',
                      color: nfcSubTab === 'reviews' ? '#ffffff' : '#b45309',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      {nfcReviewsList.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNfcSubTab('orders')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '0.75rem 1.4rem',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.92rem',
                      fontWeight: '800',
                      transition: 'all 0.2s ease',
                      background: nfcSubTab === 'orders' ? '#0284c7' : '#ffffff',
                      color: nfcSubTab === 'orders' ? '#ffffff' : '#64748b',
                      boxShadow: nfcSubTab === 'orders' ? '0 4px 14px rgba(2, 132, 199, 0.25)' : 'none'
                    }}
                  >
                    <ShoppingBag size={18} />
                    <span>Card Applications & Orders</span>
                    <span style={{
                      background: nfcSubTab === 'orders' ? 'rgba(255,255,255,0.25)' : '#dbeafe',
                      color: nfcSubTab === 'orders' ? '#ffffff' : '#0284c7',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      {nfcOrdersList.length}
                    </span>
                    {nfcOrdersList.filter(o => o.status === 'Pending').length > 0 && (
                      <span style={{
                        background: '#ef4444',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        padding: '1px 6px',
                        borderRadius: '10px'
                      }}>
                        {nfcOrdersList.filter(o => o.status === 'Pending').length} Pending
                      </span>
                    )}
                  </button>
                </div>

                {nfcSubTab === 'cards' ? (
                  <>
                    {/* 1. Header & Actions Bar for Cards */}
                    <div style={{
                      background: '#ffffff',
                      border: '1px solid var(--saas-border)',
                      borderRadius: '20px',
                      padding: '1.75rem 2rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1.25rem',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                          <span style={{
                            background: 'rgba(2, 132, 199, 0.1)',
                            color: '#0284c7',
                            fontSize: '0.75rem',
                            fontWeight: '800',
                            padding: '3px 10px',
                            borderRadius: '20px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Live Store Fleet
                          </span>
                          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                            {nfcCardsList.length} Active Card Editions
                          </span>
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.45rem', fontWeight: '800', color: 'var(--saas-text)' }}>
                          NFC Smart Cards Management
                        </h3>
                        <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>
                          Add, customize, and manage multiple NFC card editions. When you add any card here, it immediately appears in the live system and public store.
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Link
                          to="/buy-nfc"
                          target="_blank"
                          className="btn btn-outline"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '0.65rem 1.25rem',
                            borderRadius: '12px',
                            fontSize: '0.88rem',
                            fontWeight: '700',
                            textDecoration: 'none',
                            color: '#0284c7',
                            borderColor: 'rgba(2, 132, 199, 0.3)',
                            background: 'rgba(2, 132, 199, 0.04)'
                          }}
                        >
                          <ExternalLink size={16} />
                          <span>View Live Store</span>
                        </Link>

                        <button
                          type="button"
                          onClick={handleOpenAddNfcCard}
                          className="btn btn-primary"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '0.65rem 1.4rem',
                            borderRadius: '12px',
                            fontSize: '0.92rem',
                            fontWeight: '800',
                            boxShadow: '0 4px 15px rgba(2, 132, 199, 0.3)'
                          }}
                        >
                          <Plus size={18} />
                          <span>Add New NFC Card</span>
                        </button>
                      </div>
                    </div>

                {/* 2. Cards Grid Showcase */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {nfcCardsList.map((card, idx) => (
                    <div
                      key={card.id || idx}
                      style={{
                        background: '#ffffff',
                        border: '1px solid var(--saas-border)',
                        borderRadius: '20px',
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        position: 'relative'
                      }}
                    >
                      {/* Realistic Mini 3D Card Preview */}
                      <div
                        style={{
                          width: '100%',
                          height: '170px',
                          borderRadius: '14px',
                          background: card.cardImage ? `url(${card.cardImage}) center/cover no-repeat` : card.cardBg,
                          color: card.textColor || '#ffffff',
                          padding: '1rem 1.25rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
                          position: 'relative',
                          overflow: 'hidden',
                          border: `1px solid ${card.accentColor || '#38bdf8'}30`
                        }}
                      >
                        {card.cardImage ? null : (
                          <>
                            {/* Top Bar of Mini Card */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <img src="/logo.png" alt="logo" style={{ height: '18px', width: 'auto' }} />
                                <span style={{ fontSize: '0.65rem', fontWeight: '900', letterSpacing: '1px', opacity: 0.9 }}>
                                  NEXT GEN
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Radio size={16} style={{ color: card.nfcColor || card.accentColor || '#38bdf8' }} />
                                <div style={{
                                  width: '28px',
                                  height: '20px',
                                  borderRadius: '4px',
                                  background: card.chipFinish === 'silver'
                                    ? 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 50%, #f8fafc 100%)'
                                    : 'linear-gradient(135deg, #d97706 0%, #fef08a 50%, #b45309 100%)',
                                  border: '1px solid rgba(0,0,0,0.15)',
                                  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4)'
                                }} />
                              </div>
                            </div>

                            {/* Middle Contactless Wave Graphic */}
                            <div style={{ display: 'flex', justifyContent: 'center', opacity: 0.25, zIndex: 1 }}>
                              <div style={{
                                width: '45px',
                                height: '45px',
                                borderRadius: '50%',
                                border: `2px solid ${card.accentColor || '#ffffff'}`
                              }} />
                            </div>

                            {/* Bottom Info */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 2 }}>
                              <div>
                                <div style={{ fontSize: '0.88rem', fontWeight: '800', letterSpacing: '0.5px' }}>
                                  YOUR FULL NAME
                                </div>
                                <div style={{ fontSize: '0.68rem', opacity: 0.8, marginTop: '2px' }}>
                                  Skill Jobs Ambassador
                                </div>
                              </div>
                              <span style={{
                                fontSize: '0.55rem',
                                fontWeight: '800',
                                letterSpacing: '0.8px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: 'rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(4px)',
                                border: '1px solid rgba(255,255,255,0.2)'
                              }}>
                                NFC VERIFIED
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Card Details Info */}
                      <div style={{ marginTop: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: 'var(--saas-text)' }}>
                              {card.name}
                            </h4>
                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                              {card.material}
                            </p>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                            {card.cardImage && (
                              <span style={{
                                fontSize: '0.68rem',
                                fontWeight: '800',
                                background: 'rgba(219, 39, 119, 0.1)',
                                color: '#db2777',
                                border: '1px solid rgba(219, 39, 119, 0.25)',
                                padding: '2px 7px',
                                borderRadius: '20px',
                                whiteSpace: 'nowrap'
                              }}>
                                🖼️ Custom Artwork
                              </span>
                            )}
                            {card.badge && (
                              <span style={{
                                fontSize: '0.72rem',
                                fontWeight: '800',
                                background: '#eff6ff',
                                color: '#0284c7',
                                border: '1px solid rgba(2, 132, 199, 0.25)',
                                padding: '2px 8px',
                                borderRadius: '20px',
                                whiteSpace: 'nowrap'
                              }}>
                                {card.badge}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Pricing & Chip Finish Badges */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: '1rem',
                          paddingTop: '0.85rem',
                          borderTop: '1px solid #f1f5f9'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <span style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0f172a' }}>
                              ৳{card.price}
                            </span>
                            {card.originalPrice && (
                              <span style={{ fontSize: '0.85rem', textDecoration: 'line-through', color: '#94a3b8' }}>
                                ৳{card.originalPrice}
                              </span>
                            )}
                            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#10b981' }}>
                              {card.discount || '50% OFF'}
                            </span>
                          </div>

                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: card.chipFinish === 'silver' ? '#475569' : '#b45309',
                            background: card.chipFinish === 'silver' ? '#f1f5f9' : '#fef3c7',
                            padding: '3px 8px',
                            borderRadius: '6px'
                          }}>
                            {card.chipFinish === 'silver' ? '⚪ Silver Chip' : '🟡 Gold Chip'}
                          </span>
                        </div>
                      </div>

                      {/* Card Row Action Buttons */}
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginTop: '1.25rem',
                        paddingTop: '0.85rem',
                        borderTop: '1px solid var(--saas-border)'
                      }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditNfcCard(card)}
                          className="btn btn-secondary"
                          style={{
                            flex: 1,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            fontSize: '0.82rem',
                            fontWeight: '700',
                            padding: '0.5rem',
                            borderRadius: '10px'
                          }}
                        >
                          <Edit2 size={14} />
                          <span>Edit Card</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteNfcCard(card.id, card.name)}
                          className="btn btn-secondary"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '10px',
                            color: '#ef4444',
                            borderColor: '#fee2e2',
                            background: '#fff5f5'
                          }}
                          title="Delete Card Edition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
                ) : nfcSubTab === 'reviews' ? (
                  <>
                    {/* 2B. Card Holder Reviews Header & Actions */}
                    <div style={{
                      background: '#ffffff',
                      border: '1px solid var(--saas-border)',
                      borderRadius: '20px',
                      padding: '1.75rem 2rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1.25rem',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                          <span style={{
                            background: 'rgba(245, 158, 11, 0.12)',
                            color: '#d97706',
                            fontSize: '0.75rem',
                            fontWeight: '800',
                            padding: '3px 10px',
                            borderRadius: '20px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Star size={12} fill="#d97706" color="#d97706" />
                            Community Praise
                          </span>
                          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                            {nfcReviewsList.length} Published Testimonials
                          </span>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            color: '#10b981',
                            background: 'rgba(16, 185, 129, 0.1)',
                            padding: '2px 8px',
                            borderRadius: '12px'
                          }}>
                            ● Live on Store
                          </span>
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.45rem', fontWeight: '800', color: 'var(--saas-text)' }}>
                          NFC Card Holder Reviews & Testimonials
                        </h3>
                        <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>
                          Add, customize, and manage customer reviews. These cards appear live under "Loved by Innovators & Ambassadors" on the public NFC Store page.
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Link
                          to="/buy-nfc"
                          target="_blank"
                          className="btn btn-outline"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '0.65rem 1.25rem',
                            borderRadius: '12px',
                            fontSize: '0.88rem',
                            fontWeight: '700',
                            textDecoration: 'none',
                            color: '#0284c7',
                            borderColor: 'rgba(2, 132, 199, 0.3)',
                            background: 'rgba(2, 132, 199, 0.04)'
                          }}
                        >
                          <ExternalLink size={16} />
                          <span>View Public Page</span>
                        </Link>

                        <button
                          type="button"
                          onClick={handleOpenAddReview}
                          className="btn btn-primary"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '0.65rem 1.4rem',
                            borderRadius: '12px',
                            fontSize: '0.92rem',
                            fontWeight: '800',
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            border: 'none',
                            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.35)'
                          }}
                        >
                          <Plus size={18} />
                          <span>Add New Review</span>
                        </button>
                      </div>
                    </div>

                    {/* Reviews Cards Grid */}
                    {nfcReviewsList.length === 0 ? (
                      <div style={{
                        background: '#ffffff',
                        border: '1px dashed #cbd5e1',
                        borderRadius: '20px',
                        padding: '3.5rem 2rem',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <div style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          background: '#fef3c7',
                          color: '#d97706',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Star size={30} fill="#d97706" color="#d97706" />
                        </div>
                        <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                          No Card Holder Reviews Added Yet
                        </h4>
                        <p style={{ margin: 0, color: '#64748b', maxWidth: '420px', fontSize: '0.9rem' }}>
                          Add your first testimonial to showcase real experiences from Skill Jobs NFC Card holders on the public store.
                        </p>
                        <button
                          type="button"
                          onClick={handleOpenAddReview}
                          className="btn btn-primary"
                          style={{ marginTop: '0.5rem', borderRadius: '12px' }}
                        >
                          <Plus size={16} />
                          <span>Add First Review</span>
                        </button>
                      </div>
                    ) : (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                        gap: '1.5rem'
                      }}>
                        {nfcReviewsList.map((rev, index) => (
                          <div
                            key={rev.id || index}
                            style={{
                              background: '#ffffff',
                              border: '1px solid var(--saas-border)',
                              borderRadius: '20px',
                              padding: '1.75rem',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              gap: '1.25rem',
                              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                              position: 'relative'
                            }}
                          >
                            <div>
                              {/* Rating Stars & Badge */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', gap: '3px' }}>
                                  {[...Array(Number(rev.rating) || 5)].map((_, i) => (
                                    <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                                  ))}
                                </div>
                                <span style={{
                                  fontSize: '0.75rem',
                                  fontWeight: '800',
                                  color: '#b45309',
                                  background: '#fef3c7',
                                  padding: '2px 8px',
                                  borderRadius: '12px'
                                }}>
                                  {rev.rating || 5}.0 ★ Rating
                                </span>
                              </div>

                              {/* Review Comment Quote */}
                              <p style={{
                                margin: 0,
                                fontSize: '0.95rem',
                                color: '#334155',
                                lineHeight: '1.6',
                                fontStyle: 'italic'
                              }}>
                                "{rev.comment}"
                              </p>
                            </div>

                            <div>
                              {/* Reviewer Details */}
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.85rem',
                                paddingTop: '1rem',
                                borderTop: '1px solid #f1f5f9'
                              }}>
                                <img
                                  src={rev.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                                  alt={rev.name}
                                  style={{
                                    width: '46px',
                                    height: '46px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '2px solid #e0f2fe'
                                  }}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
                                  }}
                                />
                                <div>
                                  <h5 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '800', color: '#0f172a' }}>
                                    {rev.name}
                                  </h5>
                                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                    {rev.role}
                                  </span>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div style={{
                                display: 'flex',
                                gap: '0.5rem',
                                marginTop: '1rem',
                                paddingTop: '0.85rem',
                                borderTop: '1px solid var(--saas-border)'
                              }}>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditReview(rev)}
                                  className="btn btn-secondary"
                                  style={{
                                    flex: 1,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    fontSize: '0.82rem',
                                    fontWeight: '700',
                                    padding: '0.5rem',
                                    borderRadius: '10px'
                                  }}
                                >
                                  <Edit2 size={14} />
                                  <span>Edit Review</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteReview(rev.id, rev.name)}
                                  className="btn btn-secondary"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '10px',
                                    color: '#ef4444',
                                    borderColor: '#fee2e2',
                                    background: '#fff5f5'
                                  }}
                                  title="Delete Review"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* 2C. NFC Card Orders & Applications */}
                    {/* Quick KPI Summary Cards */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '1.25rem',
                      margin: '1.5rem 0'
                    }}>
                      <div style={{
                        background: '#ffffff',
                        border: '1px solid var(--saas-border)',
                        borderRadius: '16px',
                        padding: '1.25rem 1.5rem',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <div style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '12px',
                          background: 'rgba(2, 132, 199, 0.1)',
                          color: '#0284c7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <ShoppingBag size={22} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                            Total Applications
                          </div>
                          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>
                            {nfcOrdersList.length}
                          </div>
                        </div>
                      </div>

                      <div style={{
                        background: '#ffffff',
                        border: '1px solid var(--saas-border)',
                        borderRadius: '16px',
                        padding: '1.25rem 1.5rem',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <div style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '12px',
                          background: 'rgba(245, 158, 11, 0.12)',
                          color: '#d97706',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Clock size={22} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                            Pending Review
                          </div>
                          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#d97706' }}>
                            {nfcOrdersList.filter(o => o.status === 'Pending').length}
                          </div>
                        </div>
                      </div>

                      <div style={{
                        background: '#ffffff',
                        border: '1px solid var(--saas-border)',
                        borderRadius: '16px',
                        padding: '1.25rem 1.5rem',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <div style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '12px',
                          background: 'rgba(99, 102, 241, 0.12)',
                          color: '#6366f1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Truck size={22} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                            Processing / Shipped
                          </div>
                          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#6366f1' }}>
                            {nfcOrdersList.filter(o => ['Processing', 'Shipped'].includes(o.status)).length}
                          </div>
                        </div>
                      </div>

                      <div style={{
                        background: '#ffffff',
                        border: '1px solid var(--saas-border)',
                        borderRadius: '16px',
                        padding: '1.25rem 1.5rem',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <div style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '12px',
                          background: 'rgba(16, 185, 129, 0.12)',
                          color: '#10b981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <DollarSign size={22} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                            Total Volume
                          </div>
                          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#10b981' }}>
                            ৳{nfcOrdersList.reduce((acc, curr) => acc + (Number(curr.grandTotal || curr.totalPrice) || 0), 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div style={{
                      background: '#ffffff',
                      border: '1px solid var(--saas-border)',
                      borderRadius: '16px',
                      padding: '1rem 1.5rem',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
                        <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
                          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input
                            type="text"
                            placeholder="Search by Order ID, Applicant Name, Phone, Trx ID, Card..."
                            value={nfcOrderSearch}
                            onChange={(e) => setNfcOrderSearch(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.6rem 1rem 0.6rem 2.4rem',
                              borderRadius: '10px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.88rem',
                              outline: 'none'
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Filter size={15} color="#64748b" />
                          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748b' }}>Status:</span>
                          <select
                            value={nfcOrderStatusFilter}
                            onChange={(e) => setNfcOrderStatusFilter(e.target.value)}
                            style={{
                              padding: '0.55rem 0.9rem',
                              borderRadius: '10px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              color: '#334155',
                              outline: 'none',
                              background: '#fff'
                            }}
                          >
                            <option value="all">All Statuses ({nfcOrdersList.length})</option>
                            <option value="Pending">Pending ({nfcOrdersList.filter(o => o.status === 'Pending').length})</option>
                            <option value="Processing">Processing ({nfcOrdersList.filter(o => o.status === 'Processing').length})</option>
                            <option value="Shipped">Shipped ({nfcOrdersList.filter(o => o.status === 'Shipped').length})</option>
                            <option value="Delivered">Delivered ({nfcOrdersList.filter(o => o.status === 'Delivered').length})</option>
                            <option value="Cancelled">Cancelled ({nfcOrdersList.filter(o => o.status === 'Cancelled').length})</option>
                          </select>
                        </div>

                        {(nfcOrderSearch || nfcOrderStatusFilter !== 'all') && (
                          <button
                            type="button"
                            onClick={() => {
                              setNfcOrderSearch('');
                              setNfcOrderStatusFilter('all');
                            }}
                            className="btn btn-secondary"
                            style={{ padding: '0.55rem 0.9rem', borderRadius: '10px', fontSize: '0.82rem' }}
                          >
                            Clear Filters
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={fetchNfcOrders}
                          className="btn btn-outline"
                          disabled={nfcOrdersLoading}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.55rem 0.9rem',
                            borderRadius: '10px',
                            fontWeight: '700',
                            fontSize: '0.82rem'
                          }}
                          title="Refresh Orders from Database"
                        >
                          <RefreshCw size={14} className={nfcOrdersLoading ? 'animate-spin' : ''} />
                          <span>{nfcOrdersLoading ? 'Syncing...' : 'Refresh'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Orders Table */}
                    {(() => {
                      const filteredOrders = nfcOrdersList.filter(order => {
                        const q = (nfcOrderSearch || '').trim().toLowerCase();
                        const cardName = (order.cardVariantName || order.cardName || '').toLowerCase();
                        const custName = (order.customerName || '').toLowerCase();
                        const email = (order.customerEmail || order.email || '').toLowerCase();
                        const phone = (order.customerPhone || order.phone || '').toLowerCase();
                        const trxId = (order.trxId || '').toLowerCase();
                        const nameOnCard = (order.customNameOnCard || order.nameOnCard || '').toLowerCase();
                        const district = (order.district || '').toLowerCase();
                        const ref = (order.ambassadorCode || order.refCode || '').toLowerCase();
                        const orderId = (order.id || '').toLowerCase();

                        const matchesSearch = !q || (
                          orderId.includes(q) ||
                          custName.includes(q) ||
                          email.includes(q) ||
                          phone.includes(q) ||
                          trxId.includes(q) ||
                          cardName.includes(q) ||
                          nameOnCard.includes(q) ||
                          district.includes(q) ||
                          ref.includes(q)
                        );
                        const matchesStatus = nfcOrderStatusFilter === 'all' || order.status === nfcOrderStatusFilter;
                        return matchesSearch && matchesStatus;
                      });

                      if (filteredOrders.length === 0) {
                        return (
                          <div style={{
                            background: '#ffffff',
                            border: '1px solid var(--saas-border)',
                            borderRadius: '16px',
                            padding: '3.5rem 2rem',
                            textAlign: 'center'
                          }}>
                            <div style={{
                              width: '64px',
                              height: '64px',
                              borderRadius: '50%',
                              background: '#f1f5f9',
                              color: '#94a3b8',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: '1rem'
                            }}>
                              <ShoppingBag size={30} />
                            </div>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--saas-text)', fontSize: '1.2rem' }}>
                              No NFC Card Orders Found
                            </h4>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                              {nfcOrdersList.length === 0 
                                ? 'No one has applied for an NFC card yet. Orders will appear here as soon as customers submit their applications.'
                                : 'No orders matched your current search or filter criteria.'}
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div style={{
                          background: '#ffffff',
                          border: '1px solid var(--saas-border)',
                          borderRadius: '16px',
                          overflow: 'hidden',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                        }}>
                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                              <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '700' }}>
                                  <th style={{ padding: '1rem 1.25rem' }}>Order ID & Date</th>
                                  <th style={{ padding: '1rem 1.25rem' }}>Applicant Details</th>
                                  <th style={{ padding: '1rem 1.25rem' }}>Card Customization</th>
                                  <th style={{ padding: '1rem 1.25rem' }}>Payment & Transaction ID</th>
                                  <th style={{ padding: '1rem 1.25rem' }}>Amount</th>
                                  <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredOrders.map((order) => {
                                  const getStatusStyle = (st) => {
                                    switch (st) {
                                      case 'Pending':
                                        return { bg: '#fef3c7', text: '#d97706', border: '#fde68a' };
                                      case 'Processing':
                                        return { bg: '#e0e7ff', text: '#4f46e5', border: '#c7d2fe' };
                                      case 'Shipped':
                                        return { bg: '#f3e8ff', text: '#9333ea', border: '#e9d5ff' };
                                      case 'Delivered':
                                        return { bg: '#dcfce7', text: '#16a34a', border: '#bbf7d0' };
                                      case 'Cancelled':
                                        return { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' };
                                      default:
                                        return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
                                    }
                                  };
                                  const stStyle = getStatusStyle(order.status);
                                  const phoneVal = order.customerPhone || order.phone || '';
                                  const cleanPhone = phoneVal.replace(/[^0-9]/g, '');
                                  const refVal = order.ambassadorCode || order.refCode;

                                  return (
                                    <tr 
                                      key={order.id} 
                                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}
                                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                      {/* 1. Order ID & Date */}
                                      <td style={{ padding: '1.15rem 1.25rem', verticalAlign: 'top' }}>
                                        <div style={{
                                          fontFamily: 'monospace',
                                          fontWeight: '800',
                                          color: '#0284c7',
                                          fontSize: '0.9rem',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '6px'
                                        }}>
                                          <Package size={15} />
                                          {order.id}
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                                          {formatDate(order.createdAt)}
                                        </div>
                                        {refVal && (
                                          <div style={{
                                            marginTop: '6px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            fontSize: '0.72rem',
                                            fontWeight: '700',
                                            color: '#7c3aed',
                                            background: '#f5f3ff',
                                            padding: '2px 8px',
                                            borderRadius: '6px'
                                          }}>
                                            Ref: {refVal}
                                          </div>
                                        )}
                                      </td>

                                      {/* 2. Applicant Details */}
                                      <td style={{ padding: '1.15rem 1.25rem', verticalAlign: 'top' }}>
                                        <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.95rem' }}>
                                          {order.customerName}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#475569', marginTop: '3px' }}>
                                          <Phone size={13} color="#64748b" />
                                          <a href={`tel:${phoneVal}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                            {phoneVal}
                                          </a>
                                          {cleanPhone && (
                                            <a
                                              href={`https://wa.me/880${cleanPhone.startsWith('880') ? cleanPhone.slice(3) : cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              title="Chat on WhatsApp"
                                              style={{
                                                marginLeft: '4px',
                                                color: '#16a34a',
                                                background: '#dcfce7',
                                                padding: '2px 6px',
                                                borderRadius: '6px',
                                                fontSize: '0.72rem',
                                                fontWeight: '700',
                                                textDecoration: 'none',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '3px'
                                              }}
                                            >
                                              WhatsApp
                                            </a>
                                          )}
                                        </div>
                                        {(order.customerEmail || order.email) && (
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                                            <Mail size={13} />
                                            <span>{order.customerEmail || order.email}</span>
                                          </div>
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                                          <MapPin size={13} />
                                          <span style={{ fontWeight: '600' }}>{order.district || 'Bangladesh'}</span>
                                          <span style={{ color: '#94a3b8' }}>•</span>
                                          <span style={{ maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {order.deliveryAddress || order.address}
                                          </span>
                                        </div>
                                      </td>

                                      {/* 3. Card Customization */}
                                      <td style={{ padding: '1.15rem 1.25rem', verticalAlign: 'top' }}>
                                        <div style={{
                                          display: 'inline-block',
                                          background: '#f1f5f9',
                                          color: '#334155',
                                          fontWeight: '700',
                                          padding: '2px 8px',
                                          borderRadius: '6px',
                                          fontSize: '0.8rem',
                                          marginBottom: '4px'
                                        }}>
                                          {order.cardVariantName || order.cardName || 'Smart NFC Card'}
                                        </div>
                                        <div style={{ fontSize: '0.84rem', color: '#0f172a' }}>
                                          Name on Card: <span style={{ fontWeight: '700' }}>"{order.customNameOnCard || order.nameOnCard || order.customerName}"</span>
                                        </div>
                                        {(order.customRoleOnCard || order.titleOnCard) && (
                                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                            Title: {order.customRoleOnCard || order.titleOnCard}
                                          </div>
                                        )}
                                        {order.profileLink && (
                                          <div style={{ marginTop: '4px' }}>
                                            <a
                                              href={order.profileLink.startsWith('http') ? order.profileLink : `https://${order.profileLink}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              style={{
                                                fontSize: '0.74rem',
                                                color: '#0284c7',
                                                textDecoration: 'none',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '3px'
                                              }}
                                            >
                                              <ExternalLink size={12} />
                                              Link: {order.profileLink.replace(/^https?:\/\//, '').slice(0, 20)}...
                                            </a>
                                          </div>
                                        )}
                                      </td>

                                      {/* 4. Payment & Transaction ID */}
                                      <td style={{ padding: '1.15rem 1.25rem', verticalAlign: 'top' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                          <span style={{
                                            fontSize: '0.76rem',
                                            fontWeight: '800',
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            background: order.paymentMethod?.toLowerCase().includes('bkash') ? '#fdf2f8' : order.paymentMethod?.toLowerCase().includes('nagad') ? '#fff7ed' : '#f0fdf4',
                                            color: order.paymentMethod?.toLowerCase().includes('bkash') ? '#db2777' : order.paymentMethod?.toLowerCase().includes('nagad') ? '#ea580c' : '#15803d',
                                            border: `1px solid ${order.paymentMethod?.toLowerCase().includes('bkash') ? '#fbcfe8' : order.paymentMethod?.toLowerCase().includes('nagad') ? '#fed7aa' : '#bbf7d0'}`
                                          }}>
                                            {order.paymentMethod || 'bKash'}
                                          </span>
                                          {(order.senderPhone || order.customerPhone || order.phone) && (
                                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                              from: {order.senderPhone || order.customerPhone || order.phone}
                                            </span>
                                          )}
                                        </div>

                                         {/* Clickable Transaction ID link that opens popup over the screen */}
                                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                           <button
                                             type="button"
                                             onClick={() => {
                                               setSelectedNfcOrder(order);
                                               setShowNfcOrderModal(true);
                                             }}
                                             style={{
                                               background: '#eff6ff',
                                               border: '1.5px solid #bfdbfe',
                                               borderRadius: '8px',
                                               padding: '5px 10px',
                                               display: 'inline-flex',
                                               alignItems: 'center',
                                               gap: '6px',
                                               cursor: 'pointer',
                                               transition: 'all 0.15s ease',
                                               outline: 'none'
                                             }}
                                             onMouseEnter={(e) => {
                                               e.currentTarget.style.background = '#dbeafe';
                                               e.currentTarget.style.borderColor = '#0284c7';
                                             }}
                                             onMouseLeave={(e) => {
                                               e.currentTarget.style.background = '#eff6ff';
                                               e.currentTarget.style.borderColor = '#bfdbfe';
                                             }}
                                             title="Click to view full transaction details popup over screen"
                                           >
                                             <CreditCard size={14} color="#0284c7" />
                                             <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase' }}>
                                               TrxID:
                                             </span>
                                             <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#0f172a', fontSize: '0.88rem' }}>
                                               {order.trxId || 'N/A'}
                                             </span>
                                             <ExternalLink size={12} color="#0284c7" />
                                           </button>

                                           {order.trxId && (
                                             <button
                                               type="button"
                                               onClick={() => {
                                                 navigator.clipboard.writeText(order.trxId);
                                                 showToast(`Transaction ID "${order.trxId}" copied!`, 'success');
                                               }}
                                               title="Copy Transaction ID"
                                               style={{
                                                 background: '#f8fafc',
                                                 border: '1px solid #cbd5e1',
                                                 borderRadius: '8px',
                                                 cursor: 'pointer',
                                                 color: '#64748b',
                                                 padding: '5px 8px',
                                                 display: 'inline-flex',
                                                 alignItems: 'center',
                                                 justifyContent: 'center'
                                               }}
                                             >
                                               <Copy size={13} />
                                             </button>
                                           )}
                                         </div>
                                      </td>

                                      {/* 5. Total Price */}
                                      <td style={{ padding: '1.15rem 1.25rem', verticalAlign: 'top' }}>
                                        <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#0f172a' }}>
                                          ৳{Number(order.grandTotal || order.totalPrice || 0).toLocaleString()}
                                        </div>
                                        <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                                          Card: ৳{order.subtotal || order.unitPrice || order.basePrice || 0} + Del: ৳{order.deliveryCharge || order.deliveryFee || 0}
                                        </div>
                                      </td>

                                      {/* 6. Status Selector */}
                                      <td style={{ padding: '1.15rem 1.25rem', verticalAlign: 'top' }}>
                                        <select
                                          value={order.status}
                                          onChange={(e) => handleUpdateNfcOrderStatus(order.id, e.target.value)}
                                          style={{
                                            padding: '5px 10px',
                                            borderRadius: '8px',
                                            border: `1px solid ${stStyle.border}`,
                                            background: stStyle.bg,
                                            color: stStyle.text,
                                            fontWeight: '800',
                                            fontSize: '0.8rem',
                                            outline: 'none',
                                            cursor: 'pointer'
                                          }}
                                        >
                                          <option value="Pending">Pending</option>
                                          <option value="Processing">Processing</option>
                                          <option value="Shipped">Shipped</option>
                                          <option value="Delivered">Delivered</option>
                                          <option value="Cancelled">Cancelled</option>
                                        </select>
                                      </td>

                                      {/* 7. Actions */}
                                      <td style={{ padding: '1.15rem 1.25rem', verticalAlign: 'top', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setSelectedNfcOrder(order);
                                              setShowNfcOrderModal(true);
                                            }}
                                            className="btn btn-outline"
                                            style={{
                                              padding: '0.4rem 0.75rem',
                                              borderRadius: '8px',
                                              fontSize: '0.78rem',
                                              fontWeight: '700',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '4px'
                                            }}
                                            title="View Complete Application Details"
                                          >
                                            <Eye size={13} />
                                            <span>Details</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteNfcOrder(order.id)}
                                            className="btn btn-secondary"
                                            style={{
                                              padding: '0.4rem 0.65rem',
                                              borderRadius: '8px',
                                              color: '#ef4444',
                                              borderColor: '#fee2e2',
                                              background: '#fff5f5'
                                            }}
                                            title="Delete Order Record"
                                          >
                                            <Trash2 size={13} />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
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
              /* MAIN ANALYTICS OVERVIEW DASHBOARD (WITH REGISTERED USERS & APPLICATIONS GRAPH) */
              <div className="saas-overview-dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* 1. TOP HERO KPI SUMMARY CARDS */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1.25rem'
                }}>
                  {/* Card 1: Registered Users */}
                  <div 
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--saas-border)',
                      borderRadius: '16px',
                      padding: '1.35rem 1.25rem',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.12), rgba(37, 99, 235, 0.18))',
                        color: '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Users size={22} />
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: '#10b981',
                        background: 'rgba(16, 185, 129, 0.1)',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '20px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}>
                        <TrendingUp size={12} /> Active
                      </span>
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                      <div style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--saas-text)', lineHeight: 1 }}>
                        {users.length}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.35rem', fontWeight: '600' }}>
                        Registered Users
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Ambassador Applications */}
                  <div 
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--saas-border)',
                      borderRadius: '16px',
                      padding: '1.35rem 1.25rem',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(217, 119, 6, 0.18))',
                        color: '#d97706',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Award size={22} />
                      </div>
                      {pendingApps > 0 ? (
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          color: '#f59e0b',
                          background: 'rgba(245, 158, 11, 0.12)',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '20px'
                        }}>
                          {pendingApps} Pending
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          color: '#10b981',
                          background: 'rgba(16, 185, 129, 0.1)',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '20px'
                        }}>
                          Up to Date
                        </span>
                      )}
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                      <div style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--saas-text)', lineHeight: 1 }}>
                        {ambassadors.length}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.35rem', fontWeight: '600' }}>
                        Candidate Applications
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Approved Ambassadors */}
                  <div 
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--saas-border)',
                      borderRadius: '16px',
                      padding: '1.35rem 1.25rem',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(5, 150, 105, 0.18))',
                        color: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <GraduationCap size={22} />
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: '#0284c7',
                        background: 'rgba(2, 132, 199, 0.1)',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '20px'
                      }}>
                        Campus Leads
                      </span>
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                      <div style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--saas-text)', lineHeight: 1 }}>
                        {approvedAmbassadors}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.35rem', fontWeight: '600' }}>
                        Approved Campus Ambassadors
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Inbound Contact Messages */}
                  <div 
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--saas-border)',
                      borderRadius: '16px',
                      padding: '1.35rem 1.25rem',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(124, 58, 237, 0.18))',
                        color: '#8b5cf6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <MessageSquare size={22} />
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: '#8b5cf6',
                        background: 'rgba(139, 92, 246, 0.1)',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '20px'
                      }}>
                        Inquiries
                      </span>
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                      <div style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--saas-text)', lineHeight: 1 }}>
                        {messages.length}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.35rem', fontWeight: '600' }}>
                        Contact Messages
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. DYNAMIC REAL-TIME BAR CHARTS (WITH TIMEFRAME SELECTOR & TOOLTIPS) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
                  {/* Card 1: Applications (Dynamic Real-Time Chart) */}
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '24px',
                    padding: '1.75rem 2rem',
                    boxShadow: '0 2px 14px rgba(0, 0, 0, 0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
                          Applications
                        </h3>
                        
                        {/* Interactive Timeframe Segment Buttons */}
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          background: '#f1f5f9',
                          padding: '3px',
                          borderRadius: '10px',
                          gap: '2px'
                        }}>
                          {[
                            { id: '7d', label: '7D' },
                            { id: '30d', label: '30D' },
                            { id: '12m', label: '12M' }
                          ].map(t => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setAppTimeframe(t.id)}
                              style={{
                                border: 'none',
                                background: appTimeframe === t.id ? '#ffffff' : 'transparent',
                                color: appTimeframe === t.id ? '#0f172a' : '#64748b',
                                fontWeight: appTimeframe === t.id ? '700' : '500',
                                fontSize: '0.75rem',
                                padding: '0.2rem 0.65rem',
                                borderRadius: '7px',
                                cursor: 'pointer',
                                boxShadow: appTimeframe === t.id ? '0 2px 5px rgba(0,0,0,0.06)' : 'none',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ fontSize: '2.35rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', margin: '0.35rem 0 1.25rem', lineHeight: 1 }}>
                        +{appDynamicData.totalInPeriod}
                      </div>
                    </div>

                    <div>
                      {/* Dynamic Responsive SVG Histogram */}
                      <div style={{ width: '100%', marginBottom: '0.85rem', position: 'relative' }}>
                        {/* Hover Floating Tooltip */}
                        {hoveredAppIdx !== null && appDynamicData.series[hoveredAppIdx] && (
                          <div style={{
                            position: 'absolute',
                            top: '-36px',
                            left: `${(hoveredAppIdx / (appDynamicData.series.length - 1)) * 92 + 4}%`,
                            transform: 'translateX(-50%)',
                            background: '#0f172a',
                            color: '#ffffff',
                            padding: '0.3rem 0.6rem',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                            zIndex: 10,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          }}>
                            {appDynamicData.series[hoveredAppIdx].label}: {appDynamicData.series[hoveredAppIdx].count} app{appDynamicData.series[hoveredAppIdx].count === 1 ? '' : 's'}
                          </div>
                        )}

                        <svg viewBox="0 0 520 110" style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
                          {appDynamicData.series.map((d, i) => {
                            const numBars = appDynamicData.series.length;
                            const barWidth = numBars === 7 ? 48 : (numBars === 12 ? 26 : 11);
                            const totalGap = 520 - (numBars * barWidth);
                            const gap = numBars > 1 ? totalGap / (numBars - 1) : 0;
                            const x = i * (barWidth + gap);
                            const h = d.count > 0 ? Math.max(14, (d.count / appDynamicData.maxVal) * 94) : 6;
                            const y = 106 - h;
                            const isHovered = hoveredAppIdx === i;

                            return (
                              <rect 
                                key={i}
                                x={x}
                                y={y}
                                width={barWidth}
                                height={h}
                                rx="3.5"
                                ry="3.5"
                                fill={isHovered ? '#15803d' : '#2e7d58'}
                                opacity={hoveredAppIdx !== null && !isHovered ? 0.45 : 1}
                                onMouseEnter={() => setHoveredAppIdx(i)}
                                onMouseLeave={() => setHoveredAppIdx(null)}
                                style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                              />
                            );
                          })}
                        </svg>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', color: '#64748b', fontWeight: '500' }}>
                        <span>{appDynamicData.startLabel}</span>
                        <span>{appTimeframe === '12m' ? 'This Month' : 'Today'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Registered Users (Dynamic Real-Time Chart) */}
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '24px',
                    padding: '1.75rem 2rem',
                    boxShadow: '0 2px 14px rgba(0, 0, 0, 0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
                          Registered Users
                        </h3>

                        {/* Interactive Timeframe Segment Buttons */}
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          background: '#f1f5f9',
                          padding: '3px',
                          borderRadius: '10px',
                          gap: '2px'
                        }}>
                          {[
                            { id: '7d', label: '7D' },
                            { id: '30d', label: '30D' },
                            { id: '12m', label: '12M' }
                          ].map(t => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setUserTimeframe(t.id)}
                              style={{
                                border: 'none',
                                background: userTimeframe === t.id ? '#ffffff' : 'transparent',
                                color: userTimeframe === t.id ? '#0f172a' : '#64748b',
                                fontWeight: userTimeframe === t.id ? '700' : '500',
                                fontSize: '0.75rem',
                                padding: '0.2rem 0.65rem',
                                borderRadius: '7px',
                                cursor: 'pointer',
                                boxShadow: userTimeframe === t.id ? '0 2px 5px rgba(0,0,0,0.06)' : 'none',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ fontSize: '2.35rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', margin: '0.35rem 0 1.25rem', lineHeight: 1 }}>
                        +{userDynamicData.totalInPeriod}
                      </div>
                    </div>

                    <div>
                      {/* Dynamic Responsive SVG Histogram */}
                      <div style={{ width: '100%', marginBottom: '0.85rem', position: 'relative' }}>
                        {/* Hover Floating Tooltip */}
                        {hoveredUserIdx !== null && userDynamicData.series[hoveredUserIdx] && (
                          <div style={{
                            position: 'absolute',
                            top: '-36px',
                            left: `${(hoveredUserIdx / (userDynamicData.series.length - 1)) * 92 + 4}%`,
                            transform: 'translateX(-50%)',
                            background: '#0f172a',
                            color: '#ffffff',
                            padding: '0.3rem 0.6rem',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                            zIndex: 10,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          }}>
                            {userDynamicData.series[hoveredUserIdx].label}: {userDynamicData.series[hoveredUserIdx].count} user{userDynamicData.series[hoveredUserIdx].count === 1 ? '' : 's'}
                          </div>
                        )}

                        <svg viewBox="0 0 520 110" style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
                          {userDynamicData.series.map((d, i) => {
                            const numBars = userDynamicData.series.length;
                            const barWidth = numBars === 7 ? 48 : (numBars === 12 ? 26 : 11);
                            const totalGap = 520 - (numBars * barWidth);
                            const gap = numBars > 1 ? totalGap / (numBars - 1) : 0;
                            const x = i * (barWidth + gap);
                            const h = d.count > 0 ? Math.max(14, (d.count / userDynamicData.maxVal) * 94) : 6;
                            const y = 106 - h;
                            const isHovered = hoveredUserIdx === i;

                            return (
                              <rect 
                                key={i}
                                x={x}
                                y={y}
                                width={barWidth}
                                height={h}
                                rx="3.5"
                                ry="3.5"
                                fill={isHovered ? '#0284c7' : '#2563eb'}
                                opacity={hoveredUserIdx !== null && !isHovered ? 0.45 : 1}
                                onMouseEnter={() => setHoveredUserIdx(i)}
                                onMouseLeave={() => setHoveredUserIdx(null)}
                                style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                              />
                            );
                          })}
                        </svg>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', color: '#64748b', fontWeight: '500' }}>
                        <span>{userDynamicData.startLabel}</span>
                        <span>{userTimeframe === '12m' ? 'This Month' : 'Today'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. SECONDARY ANALYTICS: APPLICATION REVIEW PIPELINE */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid var(--saas-border)',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--saas-text)' }}>
                        Application Review Status
                      </h4>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{ambassadors.length} total applicant submissions</span>
                    </div>
                    <button 
                      className="btn-icon" 
                      onClick={() => setActiveTab('ambassadors')}
                      title="Manage Applications"
                      style={{ color: '#0284c7' }}
                    >
                      <ArrowUpRight size={18} />
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                    {/* Approved */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                        <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <CheckCircle2 size={15} /> Approved
                        </span>
                        <span style={{ color: '#334155' }}>
                          {approvedAmbassadors} ({ambassadors.length > 0 ? Math.round((approvedAmbassadors / ambassadors.length) * 100) : 0}%)
                        </span>
                      </div>
                      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${ambassadors.length > 0 ? (approvedAmbassadors / ambassadors.length) * 100 : 0}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #10b981, #059669)',
                          borderRadius: '10px',
                          transition: 'width 0.6s ease'
                        }} />
                      </div>
                    </div>

                    {/* Pending */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                        <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Clock size={15} /> Pending Review
                        </span>
                        <span style={{ color: '#334155' }}>
                          {pendingApps} ({ambassadors.length > 0 ? Math.round((pendingApps / ambassadors.length) * 100) : 0}%)
                        </span>
                      </div>
                      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${ambassadors.length > 0 ? (pendingApps / ambassadors.length) * 100 : 0}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                          borderRadius: '10px',
                          transition: 'width 0.6s ease'
                        }} />
                      </div>
                    </div>

                    {/* Rejected */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                        <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <AlertCircle size={15} /> Rejected
                        </span>
                        <span style={{ color: '#334155' }}>
                          {rejectedApps} ({ambassadors.length > 0 ? Math.round((rejectedApps / ambassadors.length) * 100) : 0}%)
                        </span>
                      </div>
                      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${ambassadors.length > 0 ? (rejectedApps / ambassadors.length) * 100 : 0}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #ef4444, #dc2626)',
                          borderRadius: '10px',
                          transition: 'width 0.6s ease'
                        }} />
                      </div>
                    </div>
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
        {/* User Create / Edit Modal */}
        {showUserModal && (
          <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
            <motion.div 
              className="modal-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>{currentUser ? 'Edit User Account' : 'Add New User Account'}</h3>
                <button className="close-btn" onClick={() => setShowUserModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUserFormSubmit} className="admin-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      value={userForm.name} 
                      onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} 
                      placeholder="e.g. Shahriar Khan"
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      value={userForm.email} 
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} 
                      placeholder="e.g. user@skill.jobs"
                      required 
                    />
                  </div>

                  <div className="grid-2" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr', marginTop: '1rem' }}>
                    <div className="form-group">
                      <label>Account Role</label>
                      <select 
                        value={userForm.role} 
                        onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                      >
                        <option value="Participant">Participant (Standard Member)</option>
                        <option value="Student">Student</option>
                        <option value="Campus Ambassador">Campus Ambassador</option>
                        <option value="Admin">Admin (Platform Manager)</option>
                        <option value="Super Admin">👑 Super Admin (Full Platform Control)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>{currentUser ? 'New Password (Optional)' : 'Account Password'}</label>
                      <input 
                        type="password" 
                        value={userForm.password} 
                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} 
                        placeholder={currentUser ? 'Leave blank to retain password' : '••••••••'}
                        required={!currentUser}
                      />
                    </div>
                  </div>

                  <div className="form-actions" style={{ marginTop: '1.75rem' }}>
                    <button type="button" className="btn btn-secondary" style={{ borderRadius: '8px', padding: '0.6rem 1.5rem' }} onClick={() => setShowUserModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ borderRadius: '8px', padding: '0.6rem 1.5rem' }}>
                      {currentUser ? 'Save Changes' : 'Create User Account'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Granular Admin Access & Permissions Modal (Super Admin Control) */}
        {showPermissionsModal && permissionsUser && (
          <div className="modal-overlay" onClick={() => setShowPermissionsModal(false)}>
            <motion.div 
              className="modal-card"
              style={{ maxWidth: '680px', width: '95%' }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(2, 132, 199, 0.12)',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <SlidersHorizontal size={18} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Admin Access & Module Permissions</h3>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Configure visible options and privileges</span>
                  </div>
                </div>
                <button className="close-btn" onClick={() => setShowPermissionsModal(false)}>&times;</button>
              </div>

              <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto', padding: '1.5rem' }}>
                {/* User Info Bar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#f8fafc',
                  border: '1px solid var(--saas-border)',
                  padding: '0.85rem 1.15rem',
                  borderRadius: '12px',
                  marginBottom: '1.25rem',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--saas-text)' }}>{permissionsUser.name}</strong>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{permissionsUser.email}</div>
                  </div>
                  <span 
                    style={{
                      background: permissionsUser.role === 'Super Admin' 
                        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(217, 119, 6, 0.22))' 
                        : permissionsUser.role === 'Admin' 
                        ? 'rgba(2, 132, 199, 0.12)' 
                        : 'rgba(100, 116, 139, 0.12)',
                      color: permissionsUser.role === 'Super Admin' 
                        ? '#b45309' 
                        : permissionsUser.role === 'Admin' 
                        ? '#0284c7' 
                        : '#475569',
                      border: permissionsUser.role === 'Super Admin' ? '1px solid rgba(245, 158, 11, 0.4)' : undefined,
                      padding: '0.3rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    {permissionsUser.role === 'Super Admin' ? <Crown size={14} color="#d97706" /> : <ShieldCheck size={14} />}
                    {permissionsUser.role || 'Admin'}
                  </span>
                </div>

                {permissionsUser.role === 'Super Admin' ? (
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    textAlign: 'center',
                    margin: '1rem 0'
                  }}>
                    <Crown size={32} color="#f59e0b" style={{ margin: '0 auto 0.5rem' }} />
                    <h4 style={{ margin: '0 0 0.35rem', color: '#b45309', fontWeight: '800' }}>Unrestricted Super Administrator Access</h4>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#78350f' }}>
                      Super Administrators automatically have unrestricted master privileges across all platform operations, security policies, and user role assignments.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Quick Access Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>
                        Granted Modules ({userPermissions.length}/{AVAILABLE_PERMISSIONS.length})
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          type="button" 
                          onClick={handleSelectAllPermissions}
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            padding: '0.3rem 0.65rem',
                            borderRadius: '6px',
                            background: '#eff6ff',
                            color: '#0284c7',
                            border: '1px solid rgba(2, 132, 199, 0.25)',
                            cursor: 'pointer'
                          }}
                        >
                          Select All
                        </button>
                        <button 
                          type="button" 
                          onClick={handleDeselectAllPermissions}
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            padding: '0.3rem 0.65rem',
                            borderRadius: '6px',
                            background: '#f8fafc',
                            color: '#64748b',
                            border: '1px solid var(--saas-border)',
                            cursor: 'pointer'
                          }}
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>

                    {/* Grouped Permission Checkboxes */}
                    {['Dashboard', 'Management', 'Ambassador Role Management', 'Website Configuration', 'Communication'].map(groupName => {
                      const groupItems = AVAILABLE_PERMISSIONS.filter(p => p.group === groupName);
                      return (
                        <div key={groupName} style={{ marginBottom: '1.25rem' }}>
                          <div style={{
                            fontSize: '0.75rem',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: '#64748b',
                            marginBottom: '0.5rem',
                            paddingLeft: '0.25rem'
                          }}>
                            {groupName}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {groupItems.map(perm => {
                              const isChecked = userPermissions.includes(perm.id);
                              return (
                                <label 
                                  key={perm.id}
                                  onClick={() => handleTogglePermission(perm.id)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '10px',
                                    background: isChecked ? 'rgba(2, 132, 199, 0.05)' : '#ffffff',
                                    border: `1px solid ${isChecked ? 'rgba(2, 132, 199, 0.3)' : 'var(--saas-border)'}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  <input 
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {}} // Handled by label click
                                    style={{ width: '17px', height: '17px', marginTop: '2px', cursor: 'pointer' }}
                                  />
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.88rem', fontWeight: '700', color: isChecked ? '#0284c7' : 'var(--saas-text)' }}>
                                      {perm.label}
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.1rem' }}>
                                      {perm.desc}
                                    </div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                <div className="form-actions" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--saas-border)', paddingTop: '1.25rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ borderRadius: '8px', padding: '0.6rem 1.5rem' }} 
                    onClick={() => setShowPermissionsModal(false)}
                  >
                    Close
                  </button>
                  {permissionsUser.role !== 'Super Admin' && (
                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      style={{ borderRadius: '8px', padding: '0.6rem 1.5rem' }}
                      onClick={handleSavePermissions}
                    >
                      Save Access Permissions
                    </button>
                  )}
                </div>
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
                    <label>Phone Number</label>
                    <div className="detail-text" style={{ fontSize: '0.95rem' }}>{currentApplication.phone || 'N/A'}</div>
                  </div>
                  <div className="detail-row">
                    <label>University / Institution</label>
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
                    <label>Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={ambassadorForm.phone} 
                      onChange={(e) => setAmbassadorForm({ ...ambassadorForm, phone: e.target.value })} 
                      placeholder="e.g. +8801..."
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

      {/* EDIT AMBASSADOR MODAL */}
      <AnimatePresence>
        {isEditAmbassadorModalOpen && (
          <div className="modal-overlay">
            <motion.div 
              className="modal-card"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ maxWidth: '500px' }}
            >
              <div className="modal-header" style={{ background: 'linear-gradient(to right, rgba(2, 132, 199, 0.05), transparent)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Edit2 size={20} style={{ color: 'var(--primary)' }} /> 
                  <span className="text-gradient">Edit Ambassador</span>
                </h3>
                <button className="btn-icon close" onClick={() => setIsEditAmbassadorModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleUpdateAmbassador}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
                  <div className="form-group">
                    <label>Name</label>
                    <input type="text" required value={editingAmbassadorData.name} onChange={(e) => setEditingAmbassadorData({...editingAmbassadorData, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" required value={editingAmbassadorData.email} onChange={(e) => setEditingAmbassadorData({...editingAmbassadorData, email: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" required value={editingAmbassadorData.phone} onChange={(e) => setEditingAmbassadorData({...editingAmbassadorData, phone: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>University / Institution</label>
                    <input type="text" required value={editingAmbassadorData.university} onChange={(e) => setEditingAmbassadorData({...editingAmbassadorData, university: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <input type="text" value={editingAmbassadorData.role} onChange={(e) => setEditingAmbassadorData({...editingAmbassadorData, role: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <input type="text" value={editingAmbassadorData.dept} onChange={(e) => setEditingAmbassadorData({...editingAmbassadorData, dept: e.target.value})} />
                  </div>
                </div>
                <div className="modal-footer" style={{ padding: '1.5rem', borderTop: '1px solid rgba(15,23,42,0.08)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsEditAmbassadorModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NFC CARD ADD / EDIT MODAL */}
      <AnimatePresence>
        {showNfcCardModal && (
          <div className="modal-overlay" onClick={() => setShowNfcCardModal(false)}>
            <motion.div
              className="modal-card"
              style={{ maxWidth: '640px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>{editingNfcCard ? '✏️ Edit NFC Card Edition' : '➕ Add New NFC Card to System'}</h3>
                <button type="button" className="close-btn" onClick={() => setShowNfcCardModal(false)}>&times;</button>
              </div>

              <form onSubmit={handleSaveNfcCard} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Real-time Visual Card Preview in Modal */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', margin: 0 }}>
                      Live Visual Card Preview
                    </label>
                    {nfcCardForm.cardImage && (
                      <span style={{ fontSize: '0.72rem', color: '#db2777', fontWeight: '700', background: '#fdf2f8', padding: '2px 8px', borderRadius: '12px' }}>
                        Custom Artwork Loaded
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      width: '100%',
                      height: '180px',
                      borderRadius: '16px',
                      background: nfcCardForm.cardImage 
                        ? `url(${nfcCardForm.cardImage}) center/cover no-repeat` 
                        : nfcCardForm.cardBg,
                      color: nfcCardForm.textColor || '#ffffff',
                      padding: '1.1rem 1.4rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 12px 30px -8px rgba(0, 0, 0, 0.3)',
                      border: `1px solid ${nfcCardForm.accentColor || '#38bdf8'}40`,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {nfcCardForm.cardImage ? null : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <img src="/logo.png" alt="logo" style={{ height: '20px', width: 'auto' }} />
                            <span style={{ fontSize: '0.7rem', fontWeight: '900', letterSpacing: '1px' }}>NEXT GEN</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Radio size={18} style={{ color: nfcCardForm.nfcColor || nfcCardForm.accentColor || '#38bdf8' }} />
                            <div style={{
                              width: '32px',
                              height: '22px',
                              borderRadius: '4px',
                              background: nfcCardForm.chipFinish === 'silver'
                                ? 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 50%, #f8fafc 100%)'
                                : 'linear-gradient(135deg, #d97706 0%, #fef08a 50%, #b45309 100%)',
                              border: '1px solid rgba(0,0,0,0.15)'
                            }} />
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          <div>
                            <div style={{ fontSize: '1.05rem', fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
                              {nfcCardForm.name || 'CARD EDITION NAME'}
                            </div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: '2px', textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                              {nfcCardForm.material || 'Finish Description'}
                            </div>
                          </div>
                          {nfcCardForm.badge && (
                            <span style={{
                              fontSize: '0.65rem',
                              fontWeight: '800',
                              padding: '3px 8px',
                              borderRadius: '20px',
                              background: 'rgba(255,255,255,0.25)',
                              backdropFilter: 'blur(6px)',
                              border: '1px solid rgba(255,255,255,0.3)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                            }}>
                              {nfcCardForm.badge}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Design Mode Selector Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setNfcCardForm({ ...nfcCardForm, designType: 'artwork' })}
                    style={{
                      flex: 1,
                      padding: '0.65rem 1rem',
                      borderRadius: '10px',
                      border: 'none',
                      background: (nfcCardForm.designType || 'artwork') === 'artwork' ? '#ffffff' : 'transparent',
                      color: (nfcCardForm.designType || 'artwork') === 'artwork' ? '#0284c7' : '#64748b',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      boxShadow: (nfcCardForm.designType || 'artwork') === 'artwork' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <UploadCloud size={16} />
                    <span>Upload Designed Card Artwork</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNfcCardForm({ ...nfcCardForm, designType: 'gradient' })}
                    style={{
                      flex: 1,
                      padding: '0.65rem 1rem',
                      borderRadius: '10px',
                      border: 'none',
                      background: nfcCardForm.designType === 'gradient' ? '#ffffff' : 'transparent',
                      color: nfcCardForm.designType === 'gradient' ? '#0284c7' : '#64748b',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      boxShadow: nfcCardForm.designType === 'gradient' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Sparkles size={16} />
                    <span>Preset Themes & Gradients</span>
                  </button>
                </div>

                {/* 1. ARTWORK UPLOAD OPTION */}
                {(nfcCardForm.designType || 'artwork') === 'artwork' ? (
                  <div style={{ background: '#f8fafc', border: '1.5px dashed #0284c7', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
                    {nfcCardForm.cardImage ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ position: 'relative', width: '230px', height: '145px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #0284c7', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                          <img src={nfcCardForm.cardImage} alt="Designed Card" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <span style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,0.75)', color: '#ffffff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                            Front Card Artwork
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                          <label
                            className="btn btn-outline"
                            style={{
                              fontSize: '0.82rem',
                              padding: '0.5rem 1.1rem',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#ffffff'
                            }}
                          >
                            <UploadCloud size={15} />
                            <span>Replace Card Artwork</span>
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                if (e.target.files?.[0]) handleCardImageUpload(e.target.files[0], 'cardImage');
                              }}
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => setNfcCardForm({ ...nfcCardForm, cardImage: '' })}
                            className="btn btn-secondary"
                            style={{
                              fontSize: '0.82rem',
                              padding: '0.5rem 1.1rem',
                              borderRadius: '8px',
                              color: '#ef4444',
                              borderColor: '#fee2e2',
                              background: '#ffffff'
                            }}
                          >
                            <Trash2 size={15} />
                            <span>Remove Artwork</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label style={{ display: 'block', cursor: 'pointer', padding: '1rem' }}>
                        <UploadCloud size={44} color="#0284c7" style={{ margin: '0 auto 0.75rem' }} />
                        <h4 style={{ margin: '0 0 0.35rem', fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>
                          Upload Designed Card Artwork
                        </h4>
                        <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: '#64748b' }}>
                          Drag & drop or click to upload your high-resolution card design (CR80 ratio ~1012 × 638 px)
                        </p>
                        <span className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.85rem', pointerEvents: 'none' }}>
                          Select Card Artwork File
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleCardImageUpload(e.target.files[0], 'cardImage');
                          }}
                        />
                      </label>
                    )}

                    {/* Optional Card Back Side Artwork */}
                    <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', textAlign: 'left' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '0.82rem', color: '#334155' }}>Reverse / Back Side Artwork (Optional)</strong>
                          <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                            Upload custom artwork for the card back if desired (defaults to QR fallback layout)
                          </p>
                        </div>
                        {nfcCardForm.cardBackImage ? (
                          <button
                            type="button"
                            onClick={() => setNfcCardForm({ ...nfcCardForm, cardBackImage: '' })}
                            style={{ fontSize: '0.75rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700' }}
                          >
                            Remove Back
                          </button>
                        ) : (
                          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0284c7', cursor: 'pointer', padding: '4px 10px', background: '#ffffff', border: '1px solid rgba(2,132,199,0.3)', borderRadius: '6px' }}>
                            + Upload Back Image
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                if (e.target.files?.[0]) handleCardImageUpload(e.target.files[0], 'cardBackImage');
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 2. PRESET THEMES PALETTE SELECTOR */
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>
                      Quick Preset Themes (Click to apply)
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {PRESET_THEMES.map((theme, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setNfcCardForm({
                              ...nfcCardForm,
                              cardBg: theme.cardBg,
                              textColor: theme.textColor,
                              accentColor: theme.accentColor,
                              nfcColor: theme.nfcColor,
                              chipFinish: theme.chipFinish
                            });
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '20px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}
                        >
                          <span style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            background: theme.cardBg,
                            display: 'inline-block',
                            border: '1px solid rgba(0,0,0,0.1)'
                          }} />
                          <span>{theme.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form Fields: Name & Badge */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Card Edition Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Emerald Luxury Edition"
                      value={nfcCardForm.name}
                      onChange={(e) => setNfcCardForm({ ...nfcCardForm, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Promo Badge / Ribbon</label>
                    <input
                      type="text"
                      placeholder="e.g. Most Popular, Limited Drop"
                      value={nfcCardForm.badge}
                      onChange={(e) => setNfcCardForm({ ...nfcCardForm, badge: e.target.value })}
                    />
                  </div>
                </div>

                {/* Form Field: Material & Finish */}
                <div className="form-group">
                  <label>Material & Texture Description *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Laser-Engraved Brushed Stainless Steel (25g)"
                    value={nfcCardForm.material}
                    onChange={(e) => setNfcCardForm({ ...nfcCardForm, material: e.target.value })}
                  />
                </div>

                {/* Form Fields: Pricing */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Price (BDT ৳) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 599"
                      value={nfcCardForm.price}
                      onChange={(e) => setNfcCardForm({ ...nfcCardForm, price: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Original Price (BDT ৳)</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 1199"
                      value={nfcCardForm.originalPrice}
                      onChange={(e) => setNfcCardForm({ ...nfcCardForm, originalPrice: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Chip Hardware Finish</label>
                    <select
                      value={nfcCardForm.chipFinish}
                      onChange={(e) => setNfcCardForm({ ...nfcCardForm, chipFinish: e.target.value })}
                      style={{ padding: '0.65rem 0.5rem', width: '100%', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="gold">🟡 24K Gold Metallic Chip</option>
                      <option value="silver">⚪ Silver Platinum Chip</option>
                    </select>
                  </div>
                </div>

                {/* Form Fields: Custom Styling (Only needed for Gradient / Preset mode) */}
                {nfcCardForm.designType === 'gradient' && !nfcCardForm.cardImage && (
                  <div className="form-group">
                    <label>Card Background (CSS Linear-Gradient or Hex Color)</label>
                    <input
                      type="text"
                      placeholder="e.g. linear-gradient(135deg, #064e3b 0%, #047857 50%, #022c22 100%)"
                      value={nfcCardForm.cardBg}
                      onChange={(e) => setNfcCardForm({ ...nfcCardForm, cardBg: e.target.value })}
                    />
                  </div>
                )}

                {/* Styling options for preset/gradient modes (hidden for artwork cards) */}
                {!nfcCardForm.cardImage && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Card Text Color</label>
                      <select
                        value={nfcCardForm.textColor}
                        onChange={(e) => setNfcCardForm({ ...nfcCardForm, textColor: e.target.value })}
                        style={{ padding: '0.65rem 0.5rem', width: '100%', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      >
                        <option value="#ffffff">Light Text (For Dark Cards)</option>
                        <option value="#0f172a">Dark Text (For Light/White Cards)</option>
                        <option value="#fef3c7">Golden Tint (#fef3c7)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Accent / NFC Wave Color</label>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="color"
                          value={nfcCardForm.accentColor?.startsWith('#') ? nfcCardForm.accentColor : '#38bdf8'}
                          onChange={(e) => setNfcCardForm({ ...nfcCardForm, accentColor: e.target.value, nfcColor: e.target.value })}
                          style={{ width: '45px', height: '40px', padding: 2, border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}
                        />
                        <input
                          type="text"
                          value={nfcCardForm.accentColor}
                          onChange={(e) => setNfcCardForm({ ...nfcCardForm, accentColor: e.target.value, nfcColor: e.target.value })}
                          placeholder="#38bdf8"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="form-actions" style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowNfcCardModal(false)}
                    style={{ borderRadius: '10px', padding: '0.65rem 1.5rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ borderRadius: '10px', padding: '0.65rem 1.75rem', fontWeight: '800' }}
                  >
                    {editingNfcCard ? 'Save Card Changes' : 'Publish & Add Card to System'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NFC CARD HOLDER REVIEW ADD / EDIT MODAL */}
      <AnimatePresence>
        {showNfcReviewModal && (
          <div className="modal-overlay" onClick={() => setShowNfcReviewModal(false)}>
            <motion.div
              className="modal-card"
              style={{ maxWidth: '600px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>{editingNfcReview ? '✏️ Edit Card Holder Review' : '➕ Add Card Holder Review'}</h3>
                <button type="button" className="close-btn" onClick={() => setShowNfcReviewModal(false)}>&times;</button>
              </div>

              <form onSubmit={handleSaveReview} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Live Preview of the Testimonial Card */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>
                    Live Review Preview (Public Store Card View)
                  </label>
                  <div style={{
                    background: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem'
                  }}>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {[...Array(Number(nfcReviewForm.rating) || 5)].map((_, i) => (
                        <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', fontStyle: 'italic', lineHeight: '1.5' }}>
                      "{nfcReviewForm.comment || 'This NFC card is a total game changer during summits and fairs...'}"
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={nfcReviewForm.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                        alt="Avatar Preview"
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #38bdf8' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
                        }}
                      />
                      <div>
                        <h6 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '800', color: '#0f172a' }}>
                          {nfcReviewForm.name || 'Reviewer Full Name'}
                        </h6>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {nfcReviewForm.role || 'Designation / Institution'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Full Name & Designation */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Reviewer Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tanvir Ahmed"
                      value={nfcReviewForm.name}
                      onChange={(e) => setNfcReviewForm({ ...nfcReviewForm, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Designation / Role / University *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Campus Ambassador Lead, DU"
                      value={nfcReviewForm.role}
                      onChange={(e) => setNfcReviewForm({ ...nfcReviewForm, role: e.target.value })}
                    />
                  </div>
                </div>

                {/* Rating (1 to 5 Stars) */}
                <div className="form-group">
                  <label>Rating (1 to 5 Stars) *</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNfcReviewForm({ ...nfcReviewForm, rating: star })}
                        style={{
                          background: star <= nfcReviewForm.rating ? '#fef3c7' : '#f1f5f9',
                          border: star <= nfcReviewForm.rating ? '1.5px solid #f59e0b' : '1px solid #cbd5e1',
                          borderRadius: '8px',
                          padding: '0.45rem 0.75rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: '800',
                          fontSize: '0.85rem',
                          color: star <= nfcReviewForm.rating ? '#b45309' : '#64748b'
                        }}
                      >
                        <Star size={16} fill={star <= nfcReviewForm.rating ? '#f59e0b' : 'transparent'} color={star <= nfcReviewForm.rating ? '#f59e0b' : '#94a3b8'} />
                        <span>{star} Star{star > 1 ? 's' : ''}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Testimonial Quote */}
                <div className="form-group">
                  <label>Card Holder Review / Testimonial Quote *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Enter what the card holder said about using their NFC smart card..."
                    value={nfcReviewForm.comment}
                    onChange={(e) => setNfcReviewForm({ ...nfcReviewForm, comment: e.target.value })}
                    style={{ resize: 'vertical', width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
                  />
                </div>

                {/* Reviewer Avatar Photo */}
                <div className="form-group">
                  <label>Reviewer Avatar Photo</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{
                      position: 'relative',
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '2px solid #0284c7',
                      flexShrink: 0
                    }}>
                      <img
                        src={nfcReviewForm.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                        alt="Avatar"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
                        }}
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0.5rem 1rem',
                        background: '#f0f9ff',
                        color: '#0284c7',
                        border: '1.5px dashed #0284c7',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '0.84rem',
                        fontWeight: '700',
                        width: 'fit-content'
                      }}>
                        <UploadCloud size={16} />
                        <span>Upload Photo File</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleReviewAvatarUpload(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      <input
                        type="url"
                        placeholder="Or paste image URL (https://...)"
                        value={nfcReviewForm.avatar}
                        onChange={(e) => setNfcReviewForm({ ...nfcReviewForm, avatar: e.target.value })}
                        style={{ fontSize: '0.82rem' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="form-actions" style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowNfcReviewModal(false)}
                    style={{ borderRadius: '10px', padding: '0.65rem 1.5rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                      borderRadius: '10px',
                      padding: '0.65rem 1.75rem',
                      fontWeight: '800',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      border: 'none',
                      boxShadow: '0 4px 15px rgba(245, 158, 11, 0.35)'
                    }}
                  >
                    {editingNfcReview ? 'Update Review' : 'Publish Review to Live Store'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NFC TRANSACTION DETAILS & APPLICATION REVIEW POPUP (OVERLAY POPUP) */}
      <AnimatePresence>
        {showNfcOrderModal && selectedNfcOrder && (
          <div className="modal-overlay" onClick={() => setShowNfcOrderModal(false)}>
            <motion.div
              className="modal-card"
              style={{
                maxWidth: '760px',
                width: '92%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CreditCard size={20} color="#0284c7" />
                    <h3 style={{ margin: 0 }}>Transaction & Order Verification</h3>
                    <span style={{
                      fontFamily: 'monospace',
                      fontWeight: '800',
                      color: '#0284c7',
                      background: '#e0f2fe',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.85rem'
                    }}>
                      #{selectedNfcOrder.id}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                    Applied on: {formatDate(selectedNfcOrder.createdAt)} • Payment Method: {selectedNfcOrder.paymentMethod ? selectedNfcOrder.paymentMethod.toUpperCase() : 'bKash'}
                  </div>
                </div>
                <button type="button" className="close-btn" onClick={() => setShowNfcOrderModal(false)}>&times;</button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
                {/* 1. HIGHLIGHTED TRANSACTION VERIFICATION BANNER */}
                <div style={{
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  borderRadius: '14px',
                  padding: '1.35rem 1.5rem',
                  color: '#ffffff',
                  boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        background: selectedNfcOrder.paymentMethod?.toLowerCase().includes('bkash') ? '#db2777' : selectedNfcOrder.paymentMethod?.toLowerCase().includes('nagad') ? '#ea580c' : '#16a34a',
                        color: '#ffffff',
                        padding: '3px 10px',
                        borderRadius: '6px'
                      }}>
                        {selectedNfcOrder.paymentMethod ? selectedNfcOrder.paymentMethod.toUpperCase() : 'BKASH'}
                      </span>
                      <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                        Sender Phone: <strong style={{ color: '#ffffff' }}>{selectedNfcOrder.senderPhone || selectedNfcOrder.customerPhone || selectedNfcOrder.phone || 'N/A'}</strong>
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Amount Paid</span>
                      <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#34d399' }}>
                        ৳{Number(selectedNfcOrder.grandTotal || selectedNfcOrder.totalPrice || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Big TrxID Box */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1.5px solid rgba(56, 189, 248, 0.4)',
                    borderRadius: '10px',
                    padding: '0.85rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.75px' }}>
                        Customer Submitted Transaction ID (TrxID)
                      </div>
                      <div style={{ fontFamily: 'monospace', fontWeight: '900', fontSize: '1.35rem', color: '#ffffff', marginTop: '2px', letterSpacing: '1px' }}>
                        {selectedNfcOrder.trxId || 'NO TRANSACTION ID'}
                      </div>
                    </div>

                    {selectedNfcOrder.trxId && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedNfcOrder.trxId);
                          showToast(`Transaction ID "${selectedNfcOrder.trxId}" copied to clipboard!`, 'success');
                        }}
                        style={{
                          background: '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.55rem 1.1rem',
                          borderRadius: '8px',
                          fontWeight: '800',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Copy size={15} />
                        <span>Copy Trx ID</span>
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.85rem', fontSize: '0.8rem', color: '#cbd5e1', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      Breakdown: Base ৳{selectedNfcOrder.subtotal || selectedNfcOrder.unitPrice || selectedNfcOrder.basePrice || 0} + Del ৳{selectedNfcOrder.deliveryCharge || selectedNfcOrder.deliveryFee || 0}
                    </div>
                    <div>
                      Referral: <strong style={{ color: (selectedNfcOrder.ambassadorCode || selectedNfcOrder.refCode) ? '#c084fc' : '#94a3b8' }}>
                        {(selectedNfcOrder.ambassadorCode || selectedNfcOrder.refCode) ? `Promo Code: ${selectedNfcOrder.ambassadorCode || selectedNfcOrder.refCode}` : 'Direct Purchase'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 2. Verification / Fulfillment Status & WhatsApp Chat Bar */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '0.9rem 1.2rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>
                      Verification / Order Status:
                    </span>
                    <select
                      value={selectedNfcOrder.status}
                      onChange={(e) => handleUpdateNfcOrderStatus(selectedNfcOrder.id, e.target.value)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #0284c7',
                        background: '#ffffff',
                        color: '#0284c7',
                        fontWeight: '800',
                        fontSize: '0.85rem',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="Pending">Pending Verification</option>
                      <option value="Processing">Processing / Approved</option>
                      <option value="Shipped">Shipped / In Transit</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {(() => {
                    const phoneRaw = selectedNfcOrder.customerPhone || selectedNfcOrder.phone || '';
                    const cleanPhone = phoneRaw.replace(/[^0-9]/g, '');
                    const waPhone = cleanPhone.startsWith('880') ? cleanPhone.slice(3) : cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone;
                    const waText = encodeURIComponent(`Hello ${selectedNfcOrder.customerName}, regarding your NFC Smart Card order #${selectedNfcOrder.id} (TrxID: ${selectedNfcOrder.trxId || 'N/A'})...`);
                    return cleanPhone ? (
                      <a
                        href={`https://wa.me/880${waPhone}?text=${waText}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: '#16a34a',
                          color: '#ffffff',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontWeight: '700',
                          fontSize: '0.82rem',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <MessageSquare size={14} />
                        <span>Chat on WhatsApp</span>
                      </a>
                    ) : null;
                  })()}
                </div>

                {/* 3. Applicant & Delivery Address */}
                <div>
                  <h4 style={{ margin: '0 0 0.65rem 0', fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={15} color="#0284c7" />
                    Applicant & Shipping Address
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.85rem',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1rem'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Full Name</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{selectedNfcOrder.customerName}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Phone Number</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0284c7', marginTop: '2px' }}>
                        <a href={`tel:${selectedNfcOrder.customerPhone || selectedNfcOrder.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {selectedNfcOrder.customerPhone || selectedNfcOrder.phone}
                        </a>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Email Address</div>
                      <div style={{ fontSize: '0.88rem', color: '#334155', marginTop: '2px' }}>{selectedNfcOrder.customerEmail || selectedNfcOrder.email || 'None'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>District / City</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#334155', marginTop: '2px' }}>{selectedNfcOrder.district || 'Bangladesh'}</div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Delivery Address</div>
                      <div style={{ fontSize: '0.88rem', color: '#0f172a', marginTop: '2px', lineHeight: '1.4' }}>
                        {selectedNfcOrder.deliveryAddress || selectedNfcOrder.address}
                      </div>
                    </div>
                    {(selectedNfcOrder.notes || selectedNfcOrder.deliveryNotes) && (
                      <div style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Delivery Instructions</div>
                        <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '2px' }}>
                          {selectedNfcOrder.notes || selectedNfcOrder.deliveryNotes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Card Customization Specifications */}
                <div>
                  <h4 style={{ margin: '0 0 0.65rem 0', fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CreditCard size={15} color="#0284c7" />
                    Card Customization Specifications
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.85rem',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1rem'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Card Model</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0284c7', marginTop: '2px' }}>
                        {selectedNfcOrder.cardVariantName || selectedNfcOrder.cardName || 'Smart NFC Card'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Printed Name</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                        "{selectedNfcOrder.customNameOnCard || selectedNfcOrder.nameOnCard || selectedNfcOrder.customerName}"
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Title / Role</div>
                      <div style={{ fontSize: '0.88rem', color: '#334155', marginTop: '2px' }}>
                        {selectedNfcOrder.customRoleOnCard || selectedNfcOrder.titleOnCard || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Company / University</div>
                      <div style={{ fontSize: '0.88rem', color: '#334155', marginTop: '2px' }}>
                        {selectedNfcOrder.customOrgOnCard || 'Skill Jobs'}
                      </div>
                    </div>
                    {selectedNfcOrder.profileLink && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Encoded Profile / Portfolio URL</div>
                        <a
                          href={selectedNfcOrder.profileLink.startsWith('http') ? selectedNfcOrder.profileLink : `https://${selectedNfcOrder.profileLink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '0.85rem',
                            color: '#0284c7',
                            marginTop: '2px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            textDecoration: 'none',
                            fontWeight: '600'
                          }}
                        >
                          <ExternalLink size={13} />
                          {selectedNfcOrder.profileLink}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    onClick={() => handleDeleteNfcOrder(selectedNfcOrder.id)}
                    className="btn btn-secondary"
                    style={{
                      color: '#ef4444',
                      borderColor: '#fee2e2',
                      background: '#fff5f5',
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Delete Application</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowNfcOrderModal(false)}
                    className="btn btn-primary"
                    style={{ borderRadius: '10px', padding: '0.65rem 1.8rem', fontWeight: '800' }}
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Handle uncaught errors gracefully to prevent server process from exiting when MongoDB is offline
process.on('unhandledRejection', (reason, promise) => {
  console.warn('Gracefully caught Unhandled Rejection:', reason.message || reason);
});
process.on('uncaughtException', (err) => {
  console.warn('Gracefully caught Uncaught Exception:', err.message || err);
});

// Force Node.js event loop to stay active permanently under all database states
setInterval(() => {}, 60000);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skill_jobs';

mongoose.connection.on('error', err => {
  console.warn('Mongoose background connection error caught:', err.message || err);
});

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 })
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    seedInitialData();
  })
  .catch(err => console.warn('MongoDB initial connection selection failed (using memory fallbacks):', err.message || err));

// Schemas & Models
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  status: { type: String, enum: ['Upcoming', 'Completed'], default: 'Upcoming' },
  regLink: { type: String }
}, { timestamps: true });

const AmbassadorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  university: { type: String, required: true },
  reason: { type: String, required: true },
  image: { type: String },
  role: { type: String },
  dept: { type: String },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

const ConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

const MessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true }
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);
const Ambassador = mongoose.model('Ambassador', AmbassadorSchema);
const Config = mongoose.model('Config', ConfigSchema);
const Message = mongoose.model('Message', MessageSchema);

// Schemas & Models (already imported)
const fs = require('fs');
const path = require('path');
const DB_FILE_PATH = path.join(__dirname, 'in_memory_db.json');

// Helper to initialize and load local JSON persistent database
function loadLocalDatabase() {
  const defaultConfigs = {
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
    },
    about: {
      badge: "Empowering Next-Gen Leaders",
      titleMain: "Bridging Passion and",
      titleGradient: "Profession",
      subtitle: "Skill Jobs is a youth-driven career development initiative designed to equip students and fresh graduates with real-world skills, mentorship, and professional opportunities.",
      whoWeAreTitle: "A Community That Genuinely Cares About Your Future",
      whoWeAreDesc1: "Skill Jobs started as a simple idea among friends: what if there was a community that helped students navigate their careers without the intimidating corporate jargon?",
      whoWeAreDesc2: "Today, we are a thriving youth-focused career development platform. We believe that every student has potential, but sometimes they just need the right guidance, the right network, and the right opportunities to shine.",
      whoWeAreImage: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
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
    },
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
    },
    contact: {
      email: "hello@skilljobs.com",
      phone: "+880 1234-567890",
      address: "Dhaka, Bangladesh",
      facebook: "#",
      linkedin: "#",
      instagram: "#"
    }
  };


  const defaultDb = {
    events: [
      {
        _id: "mock-ev-1",
        title: "Career Building Workshop 2026",
        date: "May 25, 2026",
        time: "10:00 AM - 2:00 PM",
        location: "Dhaka University Campus",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        category: "Workshop",
        status: "Completed"
      },
      {
        _id: "mock-ev-2",
        title: "Youth Leadership Summit",
        date: "June 10, 2026",
        time: "9:00 AM - 5:00 PM",
        location: "Bangabandhu International Conference Center",
        image: "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        category: "Summit",
        status: "Upcoming"
      },
      {
        _id: "mock-ev-3",
        title: "Tech Networking Mixer",
        date: "July 05, 2026",
        time: "4:00 PM - 7:00 PM",
        location: "Skill Jobs HQ",
        image: "https://images.unsplash.com/photo-1528605105345-5344ea20e269?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        category: "Networking",
        status: "Upcoming"
      },
      {
        _id: "mock-ev-4",
        title: "Resume & Interview Masterclass",
        date: "August 12, 2026",
        time: "2:00 PM - 5:00 PM",
        location: "Online (Zoom)",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        category: "Training",
        status: "Upcoming"
      }
    ],
    ambassadors: [
      {
        _id: "mock-amb-1",
        name: "Ayesha Rahman",
        email: "ayesha.rahman@du.ac.bd",
        university: "Dhaka University",
        reason: "I am passionate about empowering fellow students to develop industry-relevant skills. As a campus ambassador, I would love to bridge the gap between classroom learning and modern career demands.",
        status: "Pending",
        createdAt: new Date().toISOString()
      }
    ],
    messages: [],
    configs: defaultConfigs
  };

  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf8');
      const parsed = JSON.parse(data);
      let updated = false;
      if (!parsed.configs) {
        parsed.configs = defaultConfigs;
        updated = true;
      } else {
        // Merge missing configuration keys from defaultConfigs
        for (const key of Object.keys(defaultConfigs)) {
          if (parsed.configs[key] === undefined) {
            parsed.configs[key] = defaultConfigs[key];
            updated = true;
          }
        }
      }
      if (!parsed.messages) {
        parsed.messages = [];
        updated = true;
      }
      if (updated) {
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify(parsed, null, 2), 'utf8');
      }
      return parsed;
    } else {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(defaultDb, null, 2), 'utf8');
      return defaultDb;
    }
  } catch (error) {
    console.error('Error loading local JSON database:', error);
    return defaultDb;
  }
}

// Global reference for local fallback database
let localDb = loadLocalDatabase();

function saveLocalDatabase() {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(localDb, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving local JSON database:', error);
  }
}

// Seed database with initial data if empty
async function seedInitialData() {
  try {
    if (mongoose.connection.readyState === 1) {
      const eventCount = await Event.countDocuments();
      if (eventCount === 0) {
        await Event.insertMany(localDb.events.map(e => ({ ...e, _id: undefined })));
        console.log('Database seeded with default events.');
      }

      // Seed individual missing config documents if not present
      for (const key of Object.keys(localDb.configs)) {
        const exists = await Config.findOne({ key });
        if (!exists) {
          await Config.create({
            key,
            value: localDb.configs[key]
          });
          console.log(`Database seeded with missing configuration key: ${key}`);
        }
      }
    }
  } catch (error) {
    console.warn('Skipping MongoDB seeding due to offline state. Using local in-memory JSON db.');
  }
}

// Check MongoDB availability helper
const getDbConnection = () => {
  return mongoose.connection.readyState === 1;
};

// Root Endpoint
app.get('/', (req, res) => {
  const dbStatus = getDbConnection() ? 'Connected' : 'Offline (using Persistent JSON Database Fallback)';
  res.send(`Skill Jobs API is running. Database Status: ${dbStatus}`);
});

/* ==========================================================================
   EVENTS CRUD ROUTES
   ========================================================================== */

// 1. GET ALL EVENTS
app.get('/api/events', async (req, res) => {
  try {
    if (getDbConnection()) {
      const events = await Event.find().sort({ createdAt: -1 });
      const formatted = events.map(e => {
        const obj = e.toObject();
        if (e._doc.status === undefined) {
          obj.status = new Date(obj.date) < new Date() ? 'Completed' : 'Upcoming';
        }
        return obj;
      });
      return res.json(formatted);
    }
  } catch (err) {
    console.warn('MongoDB connection error, falling back to local list.');
  }
  // Fallback to local database file
  const formattedLocal = localDb.events.map(e => {
    if (!e.status) {
      e.status = new Date(e.date) < new Date() ? 'Completed' : 'Upcoming';
    }
    return e;
  });
  res.json(formattedLocal);
});

// 2. CREATE EVENT
app.post('/api/events', async (req, res) => {
  const { title, date, time, location, image, category, status, regLink } = req.body;
  if (!title || !date || !time || !location || !image || !category) {
    return res.status(400).json({ message: 'All event fields are required.' });
  }

  const eventStatus = status || 'Upcoming';

  try {
    if (getDbConnection()) {
      const newEvent = new Event({ title, date, time, location, image, category, status: eventStatus, regLink });
      await newEvent.save();
      return res.status(201).json({ message: 'Event created successfully!', event: newEvent });
    }
  } catch (err) {
    console.warn('Database error, saving to in-memory JSON array.');
  }

  // Fallback to local database file
  const newLocalEvent = {
    _id: "local-" + Math.random().toString(36).substr(2, 9),
    title, date, time, location, image, category, status: eventStatus, regLink
  };
  localDb.events.unshift(newLocalEvent);
  saveLocalDatabase();
  res.status(201).json({ message: 'Event created locally!', event: newLocalEvent });
});

// 3. UPDATE EVENT
app.put('/api/events/:id', async (req, res) => {
  const { title, date, time, location, image, category, status, regLink } = req.body;
  
  try {
    if (getDbConnection()) {
      const updatedEvent = await Event.findByIdAndUpdate(
        req.params.id,
        { title, date, time, location, image, category, status, regLink },
        { new: true, runValidators: true }
      );
      if (updatedEvent) {
        return res.json({ message: 'Event updated successfully!', event: updatedEvent });
      }
    }
  } catch (err) {
    console.warn('Database error, updating local array.');
  }

  // Fallback to local database file
  const index = localDb.events.findIndex(e => e._id === req.params.id);
  if (index !== -1) {
    localDb.events[index] = {
      ...localDb.events[index],
      title, date, time, location, image, category,
      status: status || localDb.events[index].status || 'Upcoming',
      regLink: regLink !== undefined ? regLink : localDb.events[index].regLink
    };
    saveLocalDatabase();
    return res.json({ message: 'Event updated locally!', event: localDb.events[index] });
  }
  res.status(404).json({ message: 'Event not found.' });
});

// 4. DELETE EVENT
app.delete('/api/events/:id', async (req, res) => {
  try {
    if (getDbConnection()) {
      const deletedEvent = await Event.findByIdAndDelete(req.params.id);
      if (deletedEvent) {
        return res.json({ message: 'Event deleted successfully!', event: deletedEvent });
      }
    }
  } catch (err) {
    console.warn('Database error, deleting from local array.');
  }

  // Fallback to local database file
  const index = localDb.events.findIndex(e => e._id === req.params.id);
  if (index !== -1) {
    const deleted = localDb.events.splice(index, 1)[0];
    saveLocalDatabase();
    return res.json({ message: 'Event deleted locally!', event: deleted });
  }
  res.status(404).json({ message: 'Event not found.' });
});

/* ==========================================================================
   AMBASSADOR CRUD ROUTES
   ========================================================================== */

// 1. GET ALL APPLICATIONS
app.get('/api/ambassadors', async (req, res) => {
  try {
    if (getDbConnection()) {
      const applications = await Ambassador.find().sort({ createdAt: -1 });
      return res.json(applications);
    }
  } catch (err) {
    console.warn('MongoDB connection error, falling back to local applications.');
  }
  // Fallback to local database file
  res.json(localDb.ambassadors);
});

// 2. SUBMIT APPLICATION (POST)
app.post('/api/ambassador/apply', async (req, res) => {
  const { name, email, university, reason, status, image, role, dept } = req.body;
  if (!name || !email || !university || !reason) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const appStatus = status || 'Pending';

  try {
    if (getDbConnection()) {
      const newApplication = new Ambassador({ name, email, university, reason, status: appStatus, image, role, dept });
      await newApplication.save();
      return res.status(201).json({ message: 'Application submitted successfully!', application: newApplication });
    }
  } catch (err) {
    console.warn('Database error, submitting local application.');
  }

  // Fallback to local database file
  const newLocalApp = {
    _id: "local-amb-" + Math.random().toString(36).substr(2, 9),
    name, email, university, reason,
    status: appStatus,
    image, role, dept,
    createdAt: new Date().toISOString()
  };
  localDb.ambassadors.unshift(newLocalApp);
  saveLocalDatabase();
  res.status(201).json({ message: 'Application submitted locally!', application: newLocalApp });
});

// 3. UPDATE APPLICATION STATUS (PATCH)
app.patch('/api/ambassadors/:id', async (req, res) => {
  const { status } = req.body;
  if (!status || !['Pending', 'Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Valid status is required.' });
  }

  try {
    if (getDbConnection()) {
      const updatedApp = await Ambassador.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
      if (updatedApp) {
        return res.json({ message: `Application status updated to ${status}!`, application: updatedApp });
      }
    }
  } catch (err) {
    console.warn('Database error, updating local application status.');
  }

  // Fallback to local database file
  const index = localDb.ambassadors.findIndex(a => a._id === req.params.id);
  if (index !== -1) {
    localDb.ambassadors[index].status = status;
    saveLocalDatabase();
    return res.json({ message: `Application status updated locally to ${status}!`, application: localDb.ambassadors[index] });
  }
  res.status(404).json({ message: 'Application not found.' });
});

// 4. DELETE APPLICATION
app.delete('/api/ambassadors/:id', async (req, res) => {
  try {
    if (getDbConnection()) {
      const deletedApp = await Ambassador.findByIdAndDelete(req.params.id);
      if (deletedApp) {
        return res.json({ message: 'Application deleted successfully!', application: deletedApp });
      }
    }
  } catch (err) {
    console.warn('Database error, deleting local application.');
  }

  // Fallback to local database file
  const index = localDb.ambassadors.findIndex(a => a._id === req.params.id);
  if (index !== -1) {
    const deleted = localDb.ambassadors.splice(index, 1)[0];
    saveLocalDatabase();
    return res.json({ message: 'Application deleted locally!', application: deleted });
  }
  res.status(404).json({ message: 'Application not found.' });
});

/* ==========================================================================
   CONFIGS CRUD ROUTES
   ========================================================================== */

// 1. GET ALL CONFIGS
app.get('/api/configs', async (req, res) => {
  try {
    if (getDbConnection()) {
      const configs = await Config.find();
      const configMap = {};
      configs.forEach(c => {
        configMap[c.key] = c.value;
      });
      return res.json(configMap);
    }
  } catch (err) {
    console.warn('Database error, using local configs fallback.');
  }
  // Fallback
  res.json(localDb.configs || {});
});

// 2. CREATE / UPDATE CONFIG
app.post('/api/configs', async (req, res) => {
  const { key, value } = req.body;
  if (!key || value === undefined) {
    return res.status(400).json({ message: 'Key and value are required.' });
  }

  try {
    if (getDbConnection()) {
      const updatedConfig = await Config.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true }
      );
      return res.json({ message: `Config ${key} saved successfully!`, config: updatedConfig });
    }
  } catch (err) {
    console.warn('Database error, saving config locally.');
  }

  // Fallback
  if (!localDb.configs) {
    localDb.configs = {};
  }
  localDb.configs[key] = value;
  saveLocalDatabase();
  res.json({ message: `Config ${key} saved locally!`, key, value });
});

/* ==========================================================================
   CONTACT MESSAGES CRUD ROUTES
   ========================================================================== */

// 1. SUBMIT CONTACT MESSAGE (POST)
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    if (getDbConnection()) {
      const newMessage = new Message({ name, email, subject, message });
      await newMessage.save();
      return res.status(201).json({ message: 'Message sent successfully!', contactMessage: newMessage });
    }
  } catch (err) {
    console.warn('Database error, saving contact message locally.');
  }

  // Fallback to local database file
  const newLocalMessage = {
    _id: "local-msg-" + Math.random().toString(36).substr(2, 9),
    name, email, subject, message,
    createdAt: new Date().toISOString()
  };
  if (!localDb.messages) {
    localDb.messages = [];
  }
  localDb.messages.unshift(newLocalMessage);
  saveLocalDatabase();
  res.status(201).json({ message: 'Message sent locally!', contactMessage: newLocalMessage });
});

// 2. GET ALL CONTACT MESSAGES (GET)
app.get('/api/messages', async (req, res) => {
  try {
    if (getDbConnection()) {
      const messages = await Message.find().sort({ createdAt: -1 });
      return res.json(messages);
    }
  } catch (err) {
    console.warn('MongoDB connection error, falling back to local messages.');
  }
  res.json(localDb.messages || []);
});

// 3. DELETE CONTACT MESSAGE (DELETE)
app.delete('/api/messages/:id', async (req, res) => {
  try {
    if (getDbConnection()) {
      const deletedMessage = await Message.findByIdAndDelete(req.params.id);
      if (deletedMessage) {
        return res.json({ message: 'Message deleted successfully!', contactMessage: deletedMessage });
      }
    }
  } catch (err) {
    console.warn('Database error, deleting local contact message.');
  }

  // Fallback to local database file
  if (!localDb.messages) {
    localDb.messages = [];
  }
  const index = localDb.messages.findIndex(m => m._id === req.params.id);
  if (index !== -1) {
    const deleted = localDb.messages.splice(index, 1)[0];
    saveLocalDatabase();
    return res.json({ message: 'Message deleted locally!', contactMessage: deleted });
  }
  res.status(404).json({ message: 'Message not found.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


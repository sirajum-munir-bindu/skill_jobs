/**
 * High-fidelity default and offline fallback configurations for Skill Jobs.
 * Guarantees that mobile and live deployments render immediately without crashing
 * if backend is temporarily starting up or unreachable.
 */

export const DEFAULT_AMBASSADOR_CONFIG = {
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
};

/**
 * Clean default configurations for Skill Jobs.
 * Only includes the active real chapters (DIU and Upay).
 * No dummy universities, no dummy student leads.
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
        key: "DIU",
        fullName: "Daffodil International University",
        color: "#f59e0b",
        logo: "💻",
        description: "A highly tech-focused hub at DIU Smart City campus. We run weekly coding masterclasses, product design sprints (using Figma), and showcase student project prototypes to our network of recruiters.",
        stats: { studentsReached: "150+", workshops: "14+", placementTrack: "94%" },
        leads: []
      },
      {
        key: "UPAY AMBASSADOR HUB",
        fullName: "Upay",
        color: "#0ea5e9",
        logo: "💰",
        description: "Welcome to the new chapter hub! Local events and leadership bootcamps are upcoming.",
        stats: { studentsReached: "20+", workshops: "2+", placementTrack: "99%" },
        leads: []
      }
    ]
  }
};

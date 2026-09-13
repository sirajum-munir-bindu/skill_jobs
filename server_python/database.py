import os
import json
import time
from datetime import datetime
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, String, Text, text
from sqlalchemy.dialects.mysql import LONGTEXT
from sqlalchemy.orm import declarative_base, sessionmaker, Session

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    if DATABASE_URL.startswith("mysql://"):
        DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+pymysql://", 1)
    MYSQL_URI = DATABASE_URL
    MYSQL_SERVER_URI = DATABASE_URL
    MYSQL_DB_NAME = os.getenv("MYSQL_DB_NAME", "bindu_db")
else:
    MYSQL_SERVER_URI = os.getenv("MYSQL_SERVER_URI", "mysql+pymysql://root:@127.0.0.1:3306")
    MYSQL_DB_NAME = os.getenv("MYSQL_DB_NAME", "bindu_db")
    MYSQL_URI = f"{MYSQL_SERVER_URI}/{MYSQL_DB_NAME}"

DB_FILE_PATH = os.path.join(os.path.dirname(__file__), "in_memory_db.json")

# Maintain mongo_db alias as None so any remaining imports or references don't crash
mongo_db = None

Base = declarative_base()


class SQLEvent(Base):
    __tablename__ = "events"
    id = Column(String(100), primary_key=True)
    title = Column(String(255))
    date = Column(String(100))
    time = Column(String(100))
    location = Column(String(255))
    image = Column(LONGTEXT().with_variant(Text, "sqlite"))
    category = Column(String(100))
    status = Column(String(100))
    regLink = Column(String(500), nullable=True)
    createdAt = Column(String(100))
    updatedAt = Column(String(100))


class SQLAmbassador(Base):
    __tablename__ = "ambassadors"
    id = Column(String(100), primary_key=True)
    name = Column(String(255))
    email = Column(String(255))
    university = Column(String(255))
    reason = Column(LONGTEXT().with_variant(Text, "sqlite"))
    status = Column(String(100))
    phone = Column(String(100), nullable=True)
    dept = Column(String(100), nullable=True)
    year = Column(String(100), nullable=True)
    linkedin = Column(String(255), nullable=True)
    role = Column(String(100), nullable=True)
    image = Column(LONGTEXT().with_variant(Text, "sqlite"), nullable=True)
    password = Column(String(255), nullable=True)
    createdAt = Column(String(100))


class SQLMessage(Base):
    __tablename__ = "messages"
    id = Column(String(100), primary_key=True)
    name = Column(String(255))
    email = Column(String(255))
    subject = Column(String(255))
    message = Column(LONGTEXT().with_variant(Text, "sqlite"))
    createdAt = Column(String(100))


class SQLConfig(Base):
    __tablename__ = "site_configs"
    key = Column(String(100), primary_key=True)
    value = Column(LONGTEXT().with_variant(Text, "sqlite"))
    updatedAt = Column(String(100))


class SQLUser(Base):
    __tablename__ = "users"
    id = Column(String(100), primary_key=True)
    name = Column(String(255))
    email = Column(String(255), unique=True)
    password = Column(String(255))
    role = Column(String(100), default="Participant")
    permissions = Column(Text, nullable=True)
    createdAt = Column(String(100))


class SQLWorkReport(Base):
    __tablename__ = "work_reports"
    id = Column(String(100), primary_key=True)
    ambassadorEmail = Column(String(255), nullable=True)
    ambassadorName = Column(String(255), nullable=True)
    name = Column(String(255))
    email = Column(String(255))
    phone = Column(String(100))
    institution = Column(String(255))
    status = Column(String(100), default="Pending")
    createdAt = Column(String(100))


class SQLNfcOrder(Base):
    __tablename__ = "nfc_orders"
    id = Column(String(100), primary_key=True)
    customerName = Column(String(255))
    customerEmail = Column(String(255))
    customerPhone = Column(String(100))
    deliveryAddress = Column(Text)
    district = Column(String(100), default="Dhaka")
    cardVariantId = Column(String(100), nullable=True)
    cardVariantName = Column(String(255), nullable=True)
    customNameOnCard = Column(String(255), nullable=True)
    customRoleOnCard = Column(String(255), nullable=True)
    customOrgOnCard = Column(String(255), nullable=True)
    paymentMethod = Column(String(100), default="bkash")
    trxId = Column(String(255), nullable=True)
    ambassadorCode = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    quantity = Column(String(50), default="1")
    unitPrice = Column(String(50), default="0")
    subtotal = Column(String(50), default="0")
    deliveryCharge = Column(String(50), default="0")
    discountAmount = Column(String(50), default="0")
    grandTotal = Column(String(50), default="0")
    status = Column(String(100), default="Pending")
    createdAt = Column(String(100))



engine = None
SessionLocal = None
_db_connected_cache = None
_last_check_time = 0

# 1. Try creating database if on local MySQL instance (skip/ignore on managed cloud DBs)
connect_timeout = int(os.getenv("MYSQL_CONNECT_TIMEOUT", "5"))
if not os.getenv("DATABASE_URL"):
    try:
        server_engine = create_engine(
            MYSQL_SERVER_URI,
            connect_args={"connect_timeout": connect_timeout},
            pool_pre_ping=True
        )
        with server_engine.connect() as conn:
            conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {MYSQL_DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"))
            try:
                conn.execute(text("SET GLOBAL max_allowed_packet=16777216;"))
            except Exception:
                pass
    except Exception:
        pass

# 2. Initialize main database engine
try:
    engine = create_engine(
        MYSQL_URI,
        connect_args={"connect_timeout": connect_timeout},
        pool_pre_ping=True,
        pool_recycle=3600,
        pool_size=10,
        max_overflow=20
    )
    Base.metadata.create_all(bind=engine)
    try:
        with engine.connect() as conn:
            for stmt in [
                "ALTER TABLE events ADD COLUMN regLink VARCHAR(500) NULL;",
                "ALTER TABLE events MODIFY image LONGTEXT;",
                "ALTER TABLE ambassadors ADD COLUMN password VARCHAR(255) NULL;",
                "ALTER TABLE ambassadors MODIFY image LONGTEXT;",
                "ALTER TABLE ambassadors MODIFY reason LONGTEXT;",
                "ALTER TABLE site_configs MODIFY value LONGTEXT;",
                "ALTER TABLE messages MODIFY message LONGTEXT;",
                "ALTER TABLE users ADD COLUMN permissions TEXT NULL;"
            ]:
                try:
                    conn.execute(text(stmt))
                except Exception:
                    pass
            conn.commit()
    except Exception:
        pass
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception as e:
    print(f"MySQL connection/initialization error (will use local fallback): {e}")
    engine = None
    SessionLocal = None


def get_db_connection() -> bool:
    """Check if MySQL server is reachable with caching."""
    global _db_connected_cache, _last_check_time
    if not engine or not SessionLocal:
        return False
        
    current_time = time.time()
    if _db_connected_cache is not None and (current_time - _last_check_time) < 30:
        return _db_connected_cache

    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        _db_connected_cache = True
    except Exception:
        _db_connected_cache = False
        
    _last_check_time = current_time
    return _db_connected_cache


def get_db_session() -> Session:
    """Get database session directly for route usage."""
    if not SessionLocal:
        return None
    return SessionLocal()


get_db_connection()


# Default data matching Express server exactly
default_configs = {
    "hero": {
        "badge": "Welcome to Skill Jobs",
        "titleMain": "Shape Your Future with",
        "titleGradient": "Professional Skills & Mentorship",
        "videoUrl": "/hero-bg.mp4"
    },
    "stats": {
        "studentsTrained": 5000,
        "expertMentors": 120,
        "placementSuccess": 94,
        "campusChapters": 50
    },
    "faqs": [
        {
            "question": "Are the certificates industry-recognized?",
            "answer": "Yes, all Skill Jobs professional certificates are co-signed by leading corporate partners and verified on the blockchain, making them highly credible for local and international recruiters."
        },
        {
            "question": "Can I participate in workshops while working full-time?",
            "answer": "Absolutely! Our courses and mentorship sessions are highly flexible, featuring live weekend classes and recorded viewports so you can learn at your own pace."
        },
        {
            "question": "How does the placement assistance program work?",
            "answer": "Once you complete a learning path and score above 80% on our skill assessment, your profile is fast-tracked and directly recommended to our network of 500+ hiring corporate partners."
        }
    ],
    "testimonials": [
        {
            "quote": "The Career Building Workshop co-signed by corporate mentors changed my trajectory. The assessors gave direct, constructive code feedback, and I landed my web dev role within 2 weeks!",
            "author": "Aisha Rahman",
            "role": "Software Engineer, MNC",
            "avatar": "A"
        },
        {
            "quote": "Representing Skill Jobs as a Campus Lead gave me invaluable teamwork, public relations, and event organization leadership skills. The recruiters loved my project management stories.",
            "author": "Rahul Hassan",
            "role": "Management Trainee, Telecom",
            "avatar": "R"
        },
        {
            "quote": "Designing active project interfaces during the Figma design sprint was fantastic. Building actual client prototypes allowed me to skip theory and secure my Product Designer internship.",
            "author": "Sarah Ahmed",
            "role": "Product Designer, Startup",
            "avatar": "S"
        }
    ],
    "learningPaths": {
        "web": {
            "title": "Web Engineering",
            "icon": "Code",
            "color": "#0284c7",
            "badge": "Most Popular",
            "desc": "Become a Full-Stack developer capable of building complex, secure, and highly scalable cloud systems from scratch.",
            "duration": "16 Weeks (120 Hours)",
            "modules": [
                "Frontend UI Development (React.js, Tailwind)",
                "State Management (Redux Toolkit, APIs)",
                "Backend Architecture (Node.js, Express)",
                "Database Systems & Security (MongoDB, SQL)"
            ],
            "tools": ["React", "Node.js", "Express", "MongoDB", "GitHub", "Tailwind"],
            "capstone": {
                "name": "SaaS Application Platform",
                "desc": "Develop a complete Multi-tenant CRM application featuring payment integrations, real-time analytics, and role-based access control."
            }
        },
        "ai": {
            "title": "Data Science & AI",
            "icon": "Brain",
            "color": "#10b981",
            "badge": "High Growth",
            "desc": "Master data analytics pipelines, automated predictive modeling, and integration of generative AI models in business applications.",
            "duration": "18 Weeks (135 Hours)",
            "modules": [
                "Data Analysis (Python, Pandas, NumPy)",
                "Database Querying & Optimization (SQL)",
                "Machine Learning Algorithms (Scikit-Learn)",
                "Deep Learning & Generative AI APIs"
            ],
            "tools": ["Python", "SQL", "Pandas", "Scikit-Learn", "PostgreSQL", "PowerBI"],
            "capstone": {
                "name": "E-Commerce Suggestion Engine",
                "desc": "Construct an automated ML pipeline that trains user behavior models and outputs real-time personalized product suggestions."
            }
        },
        "design": {
            "title": "UI/UX Product Design",
            "icon": "Layers",
            "color": "#8b5cf6",
            "badge": "Creative Track",
            "desc": "Learn modern user experience methodologies, build interactive prototypes, and create design systems for high-traffic products.",
            "duration": "12 Weeks (90 Hours)",
            "modules": [
                "User Research & Empathy Mapping",
                "Wireframing & Information Architecture",
                "Interactive High-Fidelity Prototyping",
                "Usability Testing & Design System Scaling"
            ],
            "tools": ["Figma", "FigJam", "Miro", "Adobe Suite", "Prototyping", "A/B Testing"],
            "capstone": {
                "name": "FinTech Digital Wallet App",
                "desc": "Conduct thorough user testing and design a beautiful financial product interface, building a comprehensive design system."
            }
        }
    },
    "infoBlocks": [
        {
            "badge": "UPCOMING FLAGSHIP EVENT",
            "title": "Join Our Next Mega Workshop & Competition",
            "desc": "Don't miss our upcoming flagship workshops, hackathons, and industry competitions. Network with active corporate mentors, participate in real-time challenges, and unlock exclusive career opportunities.",
            "bullets": [
                "Live interactive mentorship sessions with top corporate executives",
                "Hands-on project building and live competitive track challenges",
                "Win certificates of excellence and direct recruitment referrals"
            ],
            "btnText": "Register For Event",
            "btnLink": "/events",
            "image": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "reverse": False
        },
        {
            "badge": "COMPLETED SEMINARS & EVENTS",
            "title": "Relive Our Past Mega Seminars & Success Stories",
            "desc": "Explore highlights from our recently completed campus bootcamps, corporate summits, and national seminars. Witness real student transformations, project showcases, and how our alumni transitioned directly into top corporate roles.",
            "bullets": [
                "Archived masterclass recordings and downloadable seminar slides",
                "Alumni project highlights and live competition winners gallery",
                "Direct placement stats and recruiter testimonials from past events"
            ],
            "btnText": "View Completed Seminars",
            "btnLink": "/events",
            "image": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "reverse": True
        }
    ],
    "quiz": {
        "badge": "Career Matcher Widget",
        "title": "Find Your Ideal Skill Track",
        "desc": "Unsure which path matches your strengths? Take this 30-second assessment to discover the best fit.",
        "introTitle": "Career Fit Quiz",
        "introDesc": "Answer 3 quick questions about your creative tastes, coding experience, and professional goals to get a recommended skill path.",
        "startBtnText": "Start Matcher",
        "questions": [
            {
                "id": 1,
                "question": "What type of projects excite you the most?",
                "options": [
                    { "text": "Building interactive web platforms and applications", "type": "web" },
                    { "text": "Discovering patterns in data and training AI models", "type": "ai" },
                    { "text": "Crafting beautiful interfaces and user experiences", "type": "design" }
                ]
            },
            {
                "id": 2,
                "question": "Which toolkit would you prefer to master?",
                "options": [
                    { "text": "React, Node.js, APIs, and cloud databases", "type": "web" },
                    { "text": "Python, SQL, machine learning, and graphs", "type": "ai" },
                    { "text": "Figma design systems, layouts, and UX testing", "type": "design" }
                ]
            },
            {
                "id": 3,
                "question": "What is your main professional objective?",
                "options": [
                    { "text": "Become a Full-Stack Engineer or Tech Lead", "type": "web" },
                    { "text": "Become a Business Intelligence or ML Expert", "type": "ai" },
                    { "text": "Become a UI/UX Designer or Product Manager", "type": "design" }
                ]
            }
        ]
    },
    "cta": {
        "title": "Ready to unlock your professional potential?",
        "desc": "Register for our upcoming certified workshops and fast-track your applications to 500+ top recruiters today.",
        "btn1Text": "View Upcoming Classes",
        "btn1Link": "/events",
        "btn2Text": "Contact Advisors",
        "btn2Link": "/contact"
    },
    "about": {
        "badge": "Empowering Next-Gen Leaders",
        "titleMain": "Bridging Passion and",
        "titleGradient": "Profession",
        "subtitle": "Skill Jobs is a youth-driven career development initiative designed to equip students and fresh graduates with real-world skills, mentorship, and professional opportunities.",
        "whoWeAreTitle": "A Community That Genuinely Cares About Your Future",
        "whoWeAreDesc1": "Skill Jobs started as a simple idea among friends: what if there was a community that helped students navigate their careers without the intimidating corporate jargon?",
        "whoWeAreDesc2": "Today, we are a thriving youth-focused career development platform. We believe that every student has potential, but sometimes they just need the right guidance, the right network, and the right opportunities to shine.",
        "whoWeAreImage": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        "whoWeAreFeatures": [
            "Practical curriculum pathways designed by industry specialists",
            "Exclusive access to campus networks and corporate mentors",
            "Direct job listings and fast-track resume evaluations"
        ],
        "milestones": [
            { "value": "5,000+", "label": "Students Mentored", "color": "#3b82f6" },
            { "value": "50+", "label": "Workshops & Events", "color": "#ef4444" },
            { "value": "25+", "label": "Campus Chapters", "color": "#10b981" },
            { "value": "92%", "label": "Placement Success", "color": "#f59e0b" }
        ],
        "values": [
            {
                "title": "Mission-Driven",
                "desc": "To empower youth by providing accessible skills training, meaningful networking, and real-world career opportunities.",
                "color": "blue"
            },
            {
                "title": "Visionary Growth",
                "desc": "To build the most trusted youth career development ecosystem, inspiring a generation of confident, skilled professionals.",
                "color": "yellow"
            },
            {
                "title": "Youth First",
                "desc": "Designed from the ground up for students, fresh graduates, and ambitious young minds eager to leave their mark.",
                "color": "red"
            }
        ],
        "timeline": [
            {
                "year": "2024",
                "title": "The Spark",
                "desc": "Founded by a group of passionate graduates with a simple mission: demystify the transition from university to corporate careers."
            },
            {
                "year": "2025",
                "title": "Thriving Network",
                "desc": "Launched our Campus Ambassador Program across 15+ universities, connecting over 2,000 students with industry mentors."
            },
            {
                "year": "2026",
                "title": "Career Ecosystem",
                "desc": "Upgraded to a fully dynamic career discovery platform, hosting interactive learning paths, mock interview labs, and direct recruiter pathways."
            }
        ],
        "ctaTitle": "Ready to Shape Your Future?",
        "ctaDesc": "Whether you want to join as an Ambassador representing your campus or build direct skills at our next professional workshop, we have a place for you.",
        "ctaBtn1Text": "Explore Skills Programs",
        "ctaBtn2Text": "Become Campus Lead"
    },
    "ambassador": {
        "badge": "Join the Student Network",
        "titleMain": "Become a Campus",
        "titleGradient": "Ambassador",
        "subtitle": "Represent Skill Jobs at your university, build your professional network, and develop critical leadership, marketing, and communication skills.",
        "introTitle": "What is the Ambassador Program?",
        "introDesc": "The Skill Jobs Ambassador Program is an exclusive leadership opportunity for students who are passionate about career development, tech innovation, and community building. You will bridge the gap between academia and the corporate world, representing Skill Jobs on your campus and driving impact.",
        "rolesTitle": "Roles & Responsibilities",
        "rolesList": [
            "Represent Skill Jobs as the official campus liaison",
            "Promote premium career workshops and certified programs to peers",
            "Gather student feedback and local campus training requirements",
            "Coordinate and organize on-campus networking mixers and bootcamps"
        ],
        "benefitsTitle": "Benefits of Joining",
        "benefitsSubtitle": "Gain exclusive credentials, hands-on training, and corporate placements while representing us.",
        "benefitsList": [
            { "title": "Leadership Experience", "desc": "Lead initiatives on your campus and add real-world management experience to your CV.", "icon": "Shield" },
            { "title": "Elite Networking", "desc": "Build connections with corporate recruiters, tech leads, and fellow ambassadors across the country.", "icon": "Users" },
            { "title": "Official Certification", "desc": "Receive a recognized leadership certificate and direct letter of recommendation upon tenure completion.", "icon": "Award" },
            { "title": "Professional Development", "desc": "Access regular masterclasses on soft skills, digital branding, and competitive career prep.", "icon": "Zap" },
            { "title": "Event Management", "desc": "Gain behind-the-scenes event experience and help co-organize major tech conferences.", "icon": "Briefcase" },
            { "title": "VIP Access", "desc": "Get free entry and VIP seating at all Skill Jobs premium events, webinars, and hiring drives.", "icon": "Award" }
        ],
        "journeyTitle": "Your Ambassador Journey",
        "journeySteps": [
            { "phase": "Phase 1: Apply & Screen", "title": "Submit Application", "desc": "Fill out the online application. Selected candidates undergo a short online interview." },
            { "phase": "Phase 2: Onboard & Kit", "title": "Official Onboarding", "desc": "Receive the official Ambassador Handbook, digital assets, and an exclusive brand kit." },
            { "phase": "Phase 3: Activate Campus", "title": "Lead & Engage", "desc": "Share skill programs, coordinate on-campus mixers, and represent our workshops." },
            { "phase": "Phase 4: Graduate & Placement", "title": "Placement Pathway", "desc": "Earn certificates, secure direct recommendations, and get fast-tracked for internships." }
        ],
        "faqsTitle": "Ambassador FAQs",
        "faqsList": [
            { "question": "How long is the ambassador tenure?", "answer": "The typical tenure is 6 months, aligned with the academic semester, with options for extensions based on performance." },
            { "question": "What is the expected weekly time commitment?", "answer": "It is highly flexible and usually takes 3 to 5 hours per week, allowing you to prioritize your studies and exams." },
            { "question": "Is this a paid role?", "answer": "While this is a voluntary leadership role, ambassadors earn performance-based commissions, free access to premium workshops, and exclusive corporate placement referrals." },
            { "question": "Can there be multiple ambassadors per campus?", "answer": "Yes! Large campuses can have a Campus Lead, a Co-Lead, and several active Student Representatives to divide event coordination." }
        ],
        "campuses": [
            {
                "key": "DU",
                "fullName": "Dhaka University",
                "color": "#7c3aed",
                "logo": "🏛️",
                "description": "Our DU Chapter is one of our most active student communities. We hold regular on-campus networking mixers, career counseling bootcamps, and mock interviews to prepare students for top tier internships.",
                "stats": { "studentsReached": "1,500+", "workshops": "12+", "placementTrack": "92%" },
                "leads": [
                    { "name": "Ayesha Rahman", "role": "Campus Lead", "dept": "CSE, 4th Year", "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80" },
                    { "name": "Sajid Islam", "role": "Co-Lead", "dept": "Marketing, 3rd Year", "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80" }
                ]
            },
            {
                "key": "JU",
                "fullName": "Jahangirnagar University",
                "color": "#ec4899",
                "logo": "🌿",
                "description": "The JU Chapter bridges the gap between academic theories and professional career practices, focusing on leadership summits and digital marketing events in a scenic green campus environment.",
                "stats": { "studentsReached": "950+", "workshops": "6+", "placementTrack": "88%" },
                "leads": [
                    { "name": "Nabila Hassan", "role": "Campus Lead", "dept": "Economics, 3rd Year", "image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80" },
                    { "name": "Zuhair Alvi", "role": "Co-Lead", "dept": "IBA, 2nd Year", "image": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80" }
                ]
            },
            {
                "key": "RU",
                "fullName": "Rajshahi University",
                "color": "#3b82f6",
                "logo": "🎓",
                "description": "Our northern hub at RU drives technological innovation. We focus heavily on competitive programming bootcamps, resume audits, and soft-skills mentoring sessions for local corporate readiness.",
                "stats": { "studentsReached": "1,100+", "workshops": "8+", "placementTrack": "90%" },
                "leads": [
                    { "name": "Tanvir Ahmed", "role": "Campus Lead", "dept": "EEE, 4th Year", "image": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80" },
                    { "name": "Ishrat Jahan", "role": "Co-Lead", "dept": "English, 3rd Year", "image": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80" }
                ]
            },
            {
                "key": "CU",
                "fullName": "Chittagong University",
                "color": "#10b981",
                "logo": "⛰️",
                "description": "CU Chapter is empowering the port city youth. We hold cross-functional team hackathons, public speaking training programs, and direct corporate placement workshops at Chittagong.",
                "stats": { "studentsReached": "850+", "workshops": "5+", "placementTrack": "85%" },
                "leads": [
                    { "name": "Fariha Sultana", "role": "Campus Lead", "dept": "BBA, 3rd Year", "image": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80" },
                    { "name": "Adnan Chowdhury", "role": "Co-Lead", "dept": "CSE, 4th Year", "image": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&h=150&q=80" }
                ]
            },
            {
                "key": "DIU",
                "fullName": "Daffodil International University",
                "color": "#f59e0b",
                "logo": "💻",
                "description": "A highly tech-focused hub at DIU Smart City campus. We run weekly coding masterclasses, product design sprints (using Figma), and showcase student project prototypes to our network of recruiters.",
                "stats": { "studentsReached": "1,800+", "workshops": "14+", "placementTrack": "94%" },
                "leads": [
                    { "name": "Mahir Asif", "role": "Campus Lead", "dept": "Software Engineering, 4th Year", "image": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&h=150&q=80" },
                    { "name": "Lamia Kabir", "role": "Co-Lead", "dept": "English, 3rd Year", "image": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&h=150&q=80" }
                ]
            },
            {
                "key": "BUFT",
                "fullName": "BGMEA University of Fashion & Technology",
                "color": "#6366f1",
                "logo": "🎨",
                "description": "The BUFT Chapter focuses on apparel engineering, fashion design tech, digital branding, and product management. We connect creative students directly with top garments, retail, and tech companies.",
                "stats": { "studentsReached": "700+", "workshops": "4+", "placementTrack": "86%" },
                "leads": [
                    { "name": "Rashedul Bari", "role": "Campus Lead", "dept": "Apparel Engineering, 4th Year", "image": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80" },
                    { "name": "Ananya Roy", "role": "Co-Lead", "dept": "Fashion Design, 3rd Year", "image": "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&h=150&q=80" }
                ]
            }
        ]
    },
    "contact": {
        "email": "hello@skilljobs.com",
        "phone": "+880 1234-567890",
        "address": "Dhaka, Bangladesh",
        "facebook": "#",
        "linkedin": "#",
        "instagram": "#"
    },
    "ambassadorMetrics": {
        "todayTarget": 0,
        "todayAchieved": 0,
        "monthlyTarget": 0,
        "monthlyAchieved": 0,
        "registered": 0,
        "verified": 0,
        "rejected": 0,
        "qaa": 0,
        "incentivePerQAA": 0,
        "daysRemaining": 0,
        "performanceCycle": "",
        "announcement": ""
    },
    "ambassadorTasks": [],
    "nfcCards": [
        {
            "id": "matte-black",
            "name": "Obsidian Matte Black",
            "badge": "Most Popular",
            "theme": "dark",
            "cardBg": "linear-gradient(135deg, #111827 0%, #1f2937 50%, #030712 100%)",
            "textColor": "#ffffff",
            "accentColor": "#38bdf8",
            "texture": "matte",
            "material": "Premium Matte Finish PVC",
            "price": 499,
            "originalPrice": 999,
            "discount": "50% OFF",
            "nfcColor": "#38bdf8",
            "chipFinish": "gold"
        },
        {
            "id": "cyber-cyan",
            "name": "Skill Jobs Cyber Sky",
            "badge": "Brand Edition",
            "theme": "blue",
            "cardBg": "linear-gradient(135deg, #0284c7 0%, #0369a1 40%, #082f49 100%)",
            "textColor": "#ffffff",
            "accentColor": "#38bdf8",
            "texture": "gloss",
            "material": "High-Gloss Scratchproof PVC",
            "price": 549,
            "originalPrice": 1099,
            "discount": "50% OFF",
            "nfcColor": "#e0f2fe",
            "chipFinish": "silver"
        },
        {
            "id": "executive-gold",
            "name": "Executive 24K Gold",
            "badge": "Luxury Tier",
            "theme": "gold",
            "cardBg": "linear-gradient(135deg, #78350f 0%, #b45309 40%, #d97706 70%, #451a03 100%)",
            "textColor": "#fef3c7",
            "accentColor": "#fbbf24",
            "texture": "metallic",
            "material": "Brushed Golden Metal Finish",
            "price": 899,
            "originalPrice": 1799,
            "discount": "50% OFF",
            "nfcColor": "#fef08a",
            "chipFinish": "gold"
        },
        {
            "id": "titanium-silver",
            "name": "Platinum Titanium Metal",
            "badge": "Heavyweight",
            "theme": "silver",
            "cardBg": "linear-gradient(135deg, #334155 0%, #64748b 45%, #1e293b 80%, #0f172a 100%)",
            "textColor": "#f8fafc",
            "accentColor": "#94a3b8",
            "texture": "metal",
            "material": "Laser-Engraved Stainless Steel (25g)",
            "price": 1399,
            "originalPrice": 2799,
            "discount": "50% OFF",
            "nfcColor": "#cbd5e1",
            "chipFinish": "silver"
        },
        {
            "id": "pearl-white",
            "name": "Minimalist Pearl White",
            "badge": "Clean Modern",
            "theme": "light",
            "cardBg": "linear-gradient(135deg, #ffffff 0%, #f1f5f9 60%, #e2e8f0 100%)",
            "textColor": "#0f172a",
            "accentColor": "#0284c7",
            "texture": "pearl",
            "material": "Ultra-Smooth Frosted PVC",
            "price": 499,
            "originalPrice": 999,
            "discount": "50% OFF",
            "nfcColor": "#0284c7",
            "chipFinish": "gold"
        }
    ],
    "nfcReviews": [
        {
            "id": "rev-1",
            "name": "Tanvir Ahmed",
            "role": "Campus Ambassador Lead, DU",
            "rating": 5,
            "comment": "This NFC card is a total game changer during tech summits and career fairs! I just tap my card to a recruiter's iPhone and boom—my resume and GitHub profile open instantly.",
            "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
            "createdAt": "2025-01-01T00:00:00.000Z"
        },
        {
            "id": "rev-2",
            "name": "Sabbir Hossain",
            "role": "Full-Stack Software Engineer",
            "rating": 5,
            "comment": "The Obsidian Black finish looks ultra-premium. Everyone I meet is amazed when they see their phone open my portfolio with just one physical tap. Worth every single taka!",
            "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
            "createdAt": "2025-01-01T00:00:00.000Z"
        },
        {
            "id": "rev-3",
            "name": "Nusrat Jahan",
            "role": "UI/UX Product Designer",
            "rating": 5,
            "comment": "No more carrying stacks of paper cards that get thrown away. Being able to update my portfolio links anytime from the dashboard is incredible.",
            "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
            "createdAt": "2025-01-01T00:00:00.000Z"
        }
    ]
}

default_users = [
    {
        "_id": "usr_1001",
        "name": "Super Admin",
        "email": "admin@skill.jobs",
        "password": "admin123",
        "role": "Super Admin",
        "createdAt": "2026-01-01T00:00:00"
    },
    {
        "_id": "usr_1002",
        "name": "Corporate Relations",
        "email": "corporate2@skill.jobs",
        "password": "password123",
        "role": "Admin",
        "createdAt": "2026-01-15T10:30:00",
        "permissions": [
            "ambassadors",
            "contactmessages",
            "ambassadordashboard"
        ]
    },
    {
        "_id": "usr_1003",
        "name": "Shahriar Khan",
        "email": "auhin.and.aurin@gmail.com",
        "password": "password123",
        "role": "Campus Ambassador",
        "createdAt": "2026-08-09T14:30:00",
        "permissions": [
            "ambassador_performance",
            "ambassador_workreport"
        ]
    },
    {
        "_id": "usr_1004",
        "name": "Maimuna Ahmed",
        "email": "maishamaimunaahmed@gmail.com",
        "password": "password123",
        "role": "Campus Ambassador",
        "createdAt": "2026-08-15T10:00:00",
        "permissions": [
            "ambassador_performance",
            "ambassador_workreport"
        ]
    },
    {
        "_id": "usr_1005",
        "name": "Md. Rubaeid Jahan Joy",
        "email": "262-15-075@diu.edu.bd",
        "password": "password123",
        "role": "Campus Ambassador",
        "createdAt": "2026-08-20T12:00:00",
        "permissions": [
            "ambassador_performance",
            "ambassador_workreport"
        ]
    }
]


default_work_reports = []

default_db = {
    "events": [],
    "ambassadors": [],
    "messages": [],
    "users": default_users,
    "workReports": default_work_reports,
    "configs": default_configs
}


def load_local_database() -> dict:
    """Load or initialize persistent local JSON database."""
    try:
        if os.path.exists(DB_FILE_PATH):
            with open(DB_FILE_PATH, "r", encoding="utf-8") as f:
                parsed = json.load(f)
            updated = False
            if "configs" not in parsed or not parsed["configs"]:
                parsed["configs"] = default_configs
                updated = True
            else:
                for key, val in default_configs.items():
                    if key not in parsed["configs"] or parsed["configs"][key] is None:
                        parsed["configs"][key] = val
                        updated = True
            if "messages" not in parsed or parsed["messages"] is None:
                parsed["messages"] = []
                updated = True
            if "events" not in parsed or parsed["events"] is None:
                parsed["events"] = default_db["events"]
                updated = True
            if "ambassadors" not in parsed or parsed["ambassadors"] is None:
                parsed["ambassadors"] = default_db["ambassadors"]
                updated = True
            if "users" not in parsed or not parsed["users"]:
                parsed["users"] = default_users
                updated = True
            if "workReports" not in parsed or not parsed["workReports"]:
                parsed["workReports"] = default_work_reports
                updated = True
            if "nfcOrders" not in parsed or parsed["nfcOrders"] is None:
                parsed["nfcOrders"] = []
                updated = True
            if updated:
                with open(DB_FILE_PATH, "w", encoding="utf-8") as f:
                    json.dump(parsed, f, indent=2, ensure_ascii=False)
            return parsed
        else:
            with open(DB_FILE_PATH, "w", encoding="utf-8") as f:
                json.dump(default_db, f, indent=2, ensure_ascii=False)
            return default_db
    except Exception as e:
        print(f"Error loading local JSON database: {e}")
        return default_db


local_db = load_local_database()


def save_local_database():
    """Save memory state back to local JSON database."""
    try:
        with open(DB_FILE_PATH, "w", encoding="utf-8") as f:
            json.dump(local_db, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving local JSON database: {e}")


def seed_initial_data():
    """Seed MySQL with initial data if connected and empty."""
    if not get_db_connection() or not SessionLocal:
        print("MySQL offline or unreachable. Using local in-memory JSON db.")
        return
    db = SessionLocal()
    try:
        # Check and seed configs
        for key, val in default_configs.items():
            existing = db.query(SQLConfig).filter(SQLConfig.key == key).first()
            if not existing:
                new_cfg = SQLConfig(
                    key=key,
                    value=json.dumps(val, ensure_ascii=False),
                    updatedAt=datetime.now().isoformat()
                )
                db.add(new_cfg)
        
        # Check and seed default users
        for u in default_users:
            existing_user = db.query(SQLUser).filter(SQLUser.email == u["email"]).first()
            if not existing_user:
                db_user = SQLUser(
                    id=u.get("_id", u.get("id")),
                    name=u["name"],
                    email=u["email"],
                    password=u["password"],
                    role=u.get("role", "Participant"),
                    permissions=json.dumps(u.get("permissions", [])) if u.get("permissions") else None,
                    createdAt=u.get("createdAt", datetime.now().isoformat())
                )
                db.add(db_user)

        # Check and seed work reports from local_db if empty
        reports_count = db.query(SQLWorkReport).count()
        if reports_count == 0:
            for wr in local_db.get("workReports", []):
                new_wr = SQLWorkReport(
                    id=str(wr.get("_id", wr.get("id"))),
                    ambassadorEmail=wr.get("ambassadorEmail", ""),
                    ambassadorName=wr.get("ambassadorName", ""),
                    name=wr.get("name", ""),
                    email=wr.get("email", ""),
                    phone=wr.get("phone", ""),
                    institution=wr.get("institution", ""),
                    status=wr.get("status", "Pending"),
                    createdAt=wr.get("createdAt", datetime.now().isoformat())
                )
                db.add(new_wr)

        db.commit()
        print("MySQL database verified and seeded with initial configurations, users, and work reports.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding MySQL: {e}")

    finally:
        db.close()

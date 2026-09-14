import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ScrollToTop from './components/ScrollToTop';
import FloatingWhatsApp from './components/FloatingWhatsApp';

// Code-split heavy subpages to drastically reduce initial mobile download size
const About = lazy(() => import('./pages/About'));
const Ambassador = lazy(() => import('./pages/Ambassador'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Contact = lazy(() => import('./pages/Contact'));
const Admin = lazy(() => import('./pages/Admin'));
const RunningAmbassadors = lazy(() => import('./pages/RunningAmbassadors'));
const BuyNFC = lazy(() => import('./pages/BuyNFC'));

function EventRedirect() {
  window.location.replace('https://event.skill.jobs/');
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ fontSize: '1.2rem', color: '#0284c7', fontWeight: 600 }}>Redirecting to Skill Jobs Events Portal...</p>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isAdminPage = location.pathname.startsWith('/admin');
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {(!isAdminPage && !isDashboard) && <Navbar />}
      <main className={`main-content ${isHomePage ? 'home-layout' : isAdminPage ? 'admin-layout' : isDashboard ? 'dashboard-layout' : 'subpage-layout'}`} style={{ flex: 1 }}>
        <Suspense fallback={
          <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(2, 132, 199, 0.2)', borderTopColor: '#0284c7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/ambassador" element={<Ambassador />} />
            <Route path="/buy-nfc" element={<BuyNFC />} />
            <Route path="/nfc" element={<BuyNFC />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/events" element={<EventRedirect />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/ambassadors/:university" element={<RunningAmbassadors />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      {(!isAdminPage && !isDashboard) && <Footer />}
      <FloatingWhatsApp phoneNumber="8801847334827" />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;

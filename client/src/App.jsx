import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Ambassador from './pages/Ambassador';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import RunningAmbassadors from './pages/RunningAmbassadors';
import BuyNFC from './pages/BuyNFC';
import ScrollToTop from './components/ScrollToTop';
import FloatingWhatsApp from './components/FloatingWhatsApp';

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

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Ambassador from './pages/Ambassador';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import RunningAmbassadors from './pages/RunningAmbassadors';
import ScrollToTop from './components/ScrollToTop';

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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events" element={<Events />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/ambassadors/:university" element={<RunningAmbassadors />} />
        </Routes>
      </main>
      {(!isAdminPage && !isDashboard) && <Footer />}
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

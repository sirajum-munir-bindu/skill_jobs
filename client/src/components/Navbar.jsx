import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Loader2, Sparkles, CreditCard } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(false);
      setShowDropdown(false);
      // Clear search query on navigation if not on events page
      if (!location.pathname.startsWith('/events')) {
        setSearchQuery('');
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [location]);

  // Click outside to close autocomplete dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.navbar-search-container')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Filter events as query changes (computed during render)
  const filteredEvents = searchQuery.trim()
    ? events.filter(event => 
        event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const fetchEventsForSearch = async () => {
    if (events.length > 0) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/events`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (err) {
      console.error('Failed to fetch events for search:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.open(`https://event.skill.jobs/?search=${encodeURIComponent(searchQuery.trim())}`, '_blank');
      setShowDropdown(false);
      setIsOpen(false); // Close mobile menu if open
    }
  };

  const renderSearchForm = (className) => (
    <div className={`navbar-search-container ${className}`}>
      <form onSubmit={handleSearchSubmit} className="navbar-search-form">
        <Search className="search-icon-inside" size={16} />
        <input
          type="text"
          placeholder="Search events, workshops, courses..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => {
            fetchEventsForSearch();
            setShowDropdown(true);
          }}
          className="navbar-search-input"
        />
        {isLoading && <Loader2 className="search-loading-icon" size={14} style={{ animation: 'spin 1s linear infinite' }} />}
      </form>

      {showDropdown && searchQuery.trim() && (
        <div className="search-dropdown">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div 
                key={event._id || event.id} 
                className="search-dropdown-item"
                onClick={() => {
                  setSearchQuery(event.title);
                  setShowDropdown(false);
                  window.open(event.regLink || 'https://event.skill.jobs/', '_blank');
                  setIsOpen(false);
                }}
              >
                <div className="search-item-info">
                  <span className="search-item-title">{event.title}</span>
                  <span className="search-item-meta">{event.category} • {event.location}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="search-dropdown-no-results">
              No matches found
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/logo.png" alt="skill.jobs" />
        </Link>

        {renderSearchForm('desktop-search')}

        <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          {renderSearchForm('mobile-search')}
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>About</Link>
          <Link to="/ambassador" className={`nav-link ${location.pathname === '/ambassador' ? 'active' : ''}`}>Ambassador</Link>
          
          {/* Buy NFC Button with Top-Side Red Bold NEW Tag */}
          <Link 
            to="/buy-nfc" 
            className={`nav-link ${location.pathname === '/buy-nfc' || location.pathname === '/nfc' ? 'active' : ''}`}
          >
            <span className="nfc-top-badge">NEW</span>
            Buy NFC
          </Link>

          <a href="https://event.skill.jobs/" target="_blank" rel="noopener noreferrer" className="nav-link">Events</a>
          <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>Contact</Link>
          {localStorage.getItem('user') ? (
            <Link to="/dashboard" className="btn btn-outline nav-btn">Dashboard</Link>
          ) : (
            <Link to="/ambassador" className="btn btn-primary nav-btn">Join Us</Link>
          )}
        </div>

        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;


import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, MessageCircle, Globe, Camera } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <Link to="/" className="footer-logo" style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ background: 'white', padding: '6px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <img src="/logo.png" alt="Skill Jobs" style={{ height: '32px', width: 'auto' }} />
              </div>
            </Link>
            <p className="footer-desc">
              Empowering youth through skills and opportunities. Join our community to grow your career.
            </p>
            <div className="social-links">
              <a href="#" className="social-link"><MessageCircle size={20} /></a>
              <a href="#" className="social-link"><Camera size={20} /></a>
              <a href="#" className="social-link"><Globe size={20} /></a>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/ambassador">Ambassador Program</Link></li>
              <li><Link to="/events">Events & Workshops</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Contact Info</h4>
            <ul className="footer-contact">
              <li><MapPin size={18} /> Dhaka, Bangladesh</li>
              <li><Phone size={18} /> +880 1234-567890</li>
              <li><Mail size={18} /> hello@skilljobs.com</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Skill Jobs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

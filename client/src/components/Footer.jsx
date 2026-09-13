import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

const Facebook = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const Instagram = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const Linkedin = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <Link to="/" className="footer-logo" style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ background: 'white', padding: '8px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                <img src="/logo.png" alt="Skill Jobs NEXT GEN" style={{ height: '44px', width: 'auto', display: 'block' }} />
              </div>
            </Link>
            <p className="footer-desc">
              Empowering youth through skills and opportunities. Join our community to grow your career.
            </p>
            <div className="social-links">
              <a href="https://www.facebook.com/share/1DUKveuC4h/" target="_blank" rel="noopener noreferrer" className="social-link"><Facebook size={20} /></a>
              <a href="https://www.instagram.com/skilljobsnextgen?igsh=MXdiaG1obzhjNjJnYQ==" target="_blank" rel="noopener noreferrer" className="social-link"><Instagram size={20} /></a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="social-link"><Linkedin size={20} /></a>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/ambassador">Ambassador Program</Link></li>
              <li><Link to="/buy-nfc">Smart NFC Card</Link></li>
              <li><a href="https://event.skill.jobs/" target="_blank" rel="noopener noreferrer">Events & Workshops</a></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Contact Info</h4>
            <ul className="footer-contact">
              <li><MapPin size={18} /> Dhaka, Bangladesh</li>
              <li><Phone size={18} /> 01847-334785</li>
              <li><Mail size={18} /> corporate2@skill.jobs</li>
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

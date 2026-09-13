import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect') || '/dashboard';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate(redirectPath);
      } else {
        setStatus(data.detail || data.message || 'Registration failed.');
      }
    } catch (error) {
      console.error(error);
      setStatus('Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-elements">
        <div className="blur-orb orb-purple"></div>
        <div className="blur-orb orb-blue"></div>
      </div>
      
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="back-link">
              <ArrowLeft size={16} /> Back to Home
            </Link>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0 0.5rem' }}>
              <img src="/logo.png" alt="Skill Jobs NEXT GEN" style={{ height: '56px', width: 'auto', borderRadius: '10px' }} />
            </div>
            <h2>Create an Account</h2>
            <p>Join our community today</p>
          </div>
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-icon-wrapper">
                <User size={18} className="input-icon" />
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="John Doe" 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-icon-wrapper">
                <Mail size={18} className="input-icon" />
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="name@university.edu" 
                  required 
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <div className="input-icon-wrapper">
                <Lock size={18} className="input-icon" />
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="Create a secure password" 
                  required 
                />
              </div>
            </div>

            {status && (
              <div className="auth-status error">
                {status}
              </div>
            )}

            <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
              {loading ? 'Registering...' : (
                <>
                  <span>Sign Up</span>
                  <UserPlus size={18} />
                </>
              )}
            </button>
            
            <div className="auth-footer">
              <p>Already have an account? <Link to={`/login?redirect=${encodeURIComponent(redirectPath)}`}>Login</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;

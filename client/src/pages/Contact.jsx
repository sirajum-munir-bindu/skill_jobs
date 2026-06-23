import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle, Globe, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  const [contactInfo, setContactInfo] = useState({
    email: "hello@skilljobs.com",
    phone: "+880 1234-567890",
    address: "Dhaka, Bangladesh",
    facebook: "#",
    linkedin: "#",
    instagram: "#"
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [status, setStatus] = useState({
    submitting: false,
    success: false,
    error: null
  });

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/configs');
        if (res.ok) {
          const data = await res.json();
          if (data.contact) {
            setContactInfo(data.contact);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch contact configs:', err);
      }
    };
    fetchConfigs();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ submitting: true, success: false, error: null });

    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatus({ submitting: false, success: true, error: null });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        const errData = await response.json();
        setStatus({ submitting: false, success: false, error: errData.message || 'Failed to send message.' });
      }
    } catch (err) {
      console.error(err);
      setStatus({ submitting: false, success: false, error: 'Failed to connect to the server. Please try again.' });
    }
  };

  return (
    <div className="contact-page">
      <section className="page-header">
        <div className="container text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="page-title"
          >
            Get in <span className="text-gradient">Touch</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="page-subtitle"
          >
            Have a question or want to collaborate? We'd love to hear from you.
          </motion.p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info card">
              <h3>Contact Information</h3>
              <p className="info-desc">Reach out to us through any of the following channels.</p>
              
              <div className="info-item">
                <div className="info-icon"><Mail /></div>
                <div>
                  <h4>Email Us</h4>
                  <p>{contactInfo.email}</p>
                </div>
              </div>
              
              <div className="info-item">
                <div className="info-icon"><Phone /></div>
                <div>
                  <h4>Call / WhatsApp</h4>
                  <p>{contactInfo.phone}</p>
                </div>
              </div>
              
              <div className="info-item">
                <div className="info-icon"><MapPin /></div>
                <div>
                  <h4>Visit Us</h4>
                  <p>{contactInfo.address}</p>
                </div>
              </div>

              <div className="social-connect">
                <h4>Follow Us</h4>
                <div className="social-icons">
                  <a href={contactInfo.facebook} className="social-btn facebook" target="_blank" rel="noopener noreferrer"><MessageCircle size={20} /></a>
                  <a href={contactInfo.linkedin} className="social-btn linkedin" target="_blank" rel="noopener noreferrer"><Globe size={20} /></a>
                  <a href={contactInfo.instagram} className="social-btn instagram" target="_blank" rel="noopener noreferrer"><Camera size={20} /></a>
                </div>
              </div>
            </div>

            <div className="contact-form-wrapper card">
              <h3>Send a Message</h3>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Your Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="John Doe" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    placeholder="john@example.com" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <input 
                    type="text" 
                    name="subject" 
                    value={formData.subject} 
                    onChange={handleChange} 
                    placeholder="How can we help?" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea 
                    name="message" 
                    value={formData.message} 
                    onChange={handleChange} 
                    rows="5" 
                    placeholder="Write your message here..." 
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={status.submitting}>
                  {status.submitting ? 'Sending...' : 'Send Message'} <Send size={18} className="inline-icon" />
                </button>

                <AnimatePresence>
                  {status.success && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="form-status-msg success"
                    >
                      <CheckCircle size={18} /> Message sent successfully!
                    </motion.div>
                  )}

                  {status.error && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="form-status-msg error"
                    >
                      <AlertCircle size={18} /> {status.error}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;

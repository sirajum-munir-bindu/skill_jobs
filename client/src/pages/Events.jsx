import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock, AlertTriangle, Loader2, X, CheckCircle2, Sparkles } from 'lucide-react';
import './Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [selectedEvent, setSelectedEvent] = useState(null);

  // States for Event Registration Modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerEvent, setRegisterEvent] = useState(null);
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    university: ''
  });
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // States for Suggest Event Modal
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [suggestForm, setSuggestForm] = useState({
    name: '',
    email: '',
    title: '',
    category: 'Workshop',
    description: ''
  });
  const [suggestSuccess, setSuggestSuccess] = useState(false);

  // Registration handlers
  const handleOpenRegister = (event) => {
    setRegisterEvent(event);
    setRegisterForm({
      name: '',
      email: '',
      phone: '',
      university: ''
    });
    setRegistrationSuccess(false);
    setShowRegisterModal(true);
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({
      ...registerForm,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    // Simulate successful registration
    setRegistrationSuccess(true);
  };

  // Suggest Event handlers
  const handleOpenSuggest = () => {
    setSuggestForm({
      name: '',
      email: '',
      title: '',
      category: 'Workshop',
      description: ''
    });
    setSuggestSuccess(false);
    setShowSuggestModal(true);
  };

  const handleSuggestChange = (e) => {
    setSuggestForm({
      ...suggestForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSuggestSubmit = (e) => {
    e.preventDefault();
    // Simulate successful submission
    setSuggestSuccess(true);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/events');
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter events based on active search query parameter
  const filteredEvents = events.filter(event => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      event.title?.toLowerCase().includes(query) ||
      event.category?.toLowerCase().includes(query) ||
      event.location?.toLowerCase().includes(query)
    );
  });

  const upcomingEvents = filteredEvents.filter(event => event.status !== 'Completed');
  const completedEvents = filteredEvents.filter(event => event.status === 'Completed');

  return (
    <div className="events-page">
      <section className="page-header">
        <div className="container text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="page-title"
          >
            Events & <span className="text-gradient">Workshops</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="page-subtitle"
          >
            Join our upcoming events to learn new skills and expand your network.
          </motion.p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
              <Loader2 className="animate-spin text-gradient" size={48} style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Loading upcoming events...</p>
            </div>
          ) : error ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem', textAlign: 'center' }}>
              <AlertTriangle style={{ color: 'var(--accent)' }} size={48} />
              <h3>Failed to load events</h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>Please ensure the server and database are running, then refresh the page.</p>
            </div>
          ) : events.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem', textAlign: 'center' }}>
              <h3>No Events Found</h3>
              <p style={{ color: 'var(--text-muted)' }}>There are no upcoming events listed at the moment. Check back soon!</p>
            </div>
          ) : (
            <>
              {/* Search query status bar */}
              {searchQuery && (
                <div 
                  className="search-filter-status" 
                  style={{ 
                    marginBottom: '2rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    flexWrap: 'wrap', 
                    gap: '1rem', 
                    background: 'rgba(124, 58, 237, 0.05)', 
                    padding: '12px 24px', 
                    borderRadius: '12px', 
                    border: '1px dashed rgba(124, 58, 237, 0.2)' 
                  }}
                >
                  <p style={{ margin: 0, fontWeight: 500, color: 'var(--primary)' }}>
                    Showing results for "<span style={{ color: 'var(--accent)' }}>{searchQuery}</span>" ({filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found)
                  </p>
                  <button 
                    onClick={() => setSearchParams({})} 
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                  >
                    Clear Search
                  </button>
                </div>
              )}

              {filteredEvents.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '250px', gap: '1rem', textAlign: 'center' }}>
                  <h3>No Matching Events Found</h3>
                  <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>We couldn't find any events matching "{searchQuery}". Try adjusting your keywords or clearing the search filter.</p>
                  <button onClick={() => setSearchParams({})} className="btn btn-primary">Clear Search Filter</button>
                </div>
              ) : (
                <>
                  {/* 1. Upcoming Programs Section */}
                  <div className="events-section-wrapper" style={{ marginBottom: '4rem' }}>
                    <div className="events-section-title-bar" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem', borderBottom: '2px solid rgba(124, 58, 237, 0.1)', paddingBottom: '0.75rem' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }}></span>
                      <h3 style={{ margin: 0, fontWeight: 800, color: 'var(--primary)', fontSize: '1.4rem' }}>Upcoming Programs</h3>
                    </div>
                    {upcomingEvents.length > 0 ? (
                      <div className="events-grid">
                        {upcomingEvents.map((event, index) => (
                          <motion.div 
                            className="event-card card" 
                            key={event._id || event.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="event-image-container">
                              <img src={event.image} alt={event.title} className="event-image" />
                              <span className="event-category">{event.category}</span>
                            </div>
                            <div className="event-details">
                              <h3 className="event-title">{event.title}</h3>
                              <div className="event-meta">
                                <p><Calendar size={16} /> {event.date}</p>
                                <p><Clock size={16} /> {event.time}</p>
                                <p><MapPin size={16} /> {event.location}</p>
                              </div>
                              <button 
                                onClick={() => {
                                  if (event.regLink && event.regLink.trim() !== '') {
                                    window.open(event.regLink, '_blank', 'noopener,noreferrer');
                                  } else {
                                    handleOpenRegister(event);
                                  }
                                }} 
                                className="btn btn-primary w-100"
                              >
                                Register Now
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '12px', border: '1.5px dashed rgba(15, 23, 42, 0.08)', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)', margin: 0, fontWeight: '500' }}>No upcoming programs scheduled. Check back soon!</p>
                      </div>
                    )}
                  </div>

                  {/* 2. Completed Programs Section */}
                  <div className="events-section-wrapper" style={{ marginTop: '2rem' }}>
                    <div className="events-section-title-bar" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem', borderBottom: '2px solid rgba(100, 116, 139, 0.15)', paddingBottom: '0.75rem' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#64748b', display: 'inline-block' }}></span>
                      <h3 style={{ margin: 0, fontWeight: 800, color: 'var(--primary)', fontSize: '1.4rem' }}>Completed Programs</h3>
                    </div>
                    {completedEvents.length > 0 ? (
                      <div className="events-grid">
                        {completedEvents.map((event, index) => (
                          <motion.div 
                            className="event-card card completed" 
                            key={event._id || event.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="event-image-container">
                              <img src={event.image} alt={event.title} className="event-image" />
                              <span className="event-category">{event.category}</span>
                            </div>
                            <div className="event-details">
                              <h3 className="event-title">{event.title}</h3>
                              <div className="event-meta">
                                <p><Calendar size={16} /> {event.date}</p>
                                <p><Clock size={16} /> {event.time}</p>
                                <p><MapPin size={16} /> {event.location}</p>
                              </div>
                              <button 
                                onClick={() => setSelectedEvent(event)} 
                                className="btn btn-secondary w-100"
                                style={{ background: 'transparent', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                              >
                                Show More Details
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '12px', border: '1.5px dashed rgba(15, 23, 42, 0.08)', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)', margin: 0, fontWeight: '500' }}>No completed program logs found.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>
      
      <section className="section bg-light text-center">
        <div className="container">
          <h2>Have an event idea?</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>We love collaborating with students. Pitch your idea to us!</p>
          <button onClick={handleOpenSuggest} className="btn btn-primary">Suggest Event</button>
        </div>
      </section>
 
      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="event-modal-overlay" onClick={() => setSelectedEvent(null)}>
            <motion.div 
              className="event-modal-card card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="event-modal-close-btn" onClick={() => setSelectedEvent(null)}>
                <X size={20} />
              </button>
              
              <div className="event-modal-banner">
                <img src={selectedEvent.image} alt={selectedEvent.title} />
                <span className="event-modal-category">{selectedEvent.category}</span>
              </div>
              
              <div className="event-modal-content">
                <h2 className="event-modal-title">{selectedEvent.title}</h2>
                
                <div className="event-modal-meta-grid">
                  <div className="event-modal-meta-item">
                    <Calendar className="event-modal-icon" size={18} />
                    <div>
                      <span>Date</span>
                      <strong>{selectedEvent.date}</strong>
                    </div>
                  </div>
                  <div className="event-modal-meta-item">
                    <Clock className="event-modal-icon" size={18} />
                    <div>
                      <span>Time</span>
                      <strong>{selectedEvent.time}</strong>
                    </div>
                  </div>
                  <div className="event-modal-meta-item">
                    <MapPin className="event-modal-icon" size={18} />
                    <div>
                      <span>Location</span>
                      <strong>{selectedEvent.location}</strong>
                    </div>
                  </div>
                </div>
 
                <div className="event-modal-description">
                  <h4>Program Overview</h4>
                  <p>
                    This {selectedEvent.category.toLowerCase()} was successfully completed at {selectedEvent.location}. 
                    Students and participants engaged directly with top industry mentors, working on practical case studies and skill-building exercises.
                  </p>
                  <p>
                    Stay tuned to our upcoming events section to register for future certified classes, design mixers, and tech workshops.
                  </p>
                </div>
 
                <button className="btn btn-secondary w-100" onClick={() => setSelectedEvent(null)} style={{ marginTop: '1.5rem' }}>
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Event Registration Modal */}
      <AnimatePresence>
        {showRegisterModal && registerEvent && (
          <div className="modal-overlay" onClick={() => setShowRegisterModal(false)}>
            <motion.div 
              className="event-modal-card card"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '500px' }}
            >
              <button className="event-modal-close-btn" onClick={() => setShowRegisterModal(false)}>
                <X size={18} />
              </button>

              {!registrationSuccess ? (
                <>
                  <div className="event-modal-header">
                    <div className="form-header-badge">
                      <Sparkles size={14} /> <span>Seat Reservation</span>
                    </div>
                    <h3>Register for Event</h3>
                    <p style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      Program: {registerEvent.title}
                    </p>
                  </div>
                  <div className="event-modal-body">
                    <form className="event-form" onSubmit={handleRegisterSubmit}>
                      <div className="event-form-group">
                        <label>Full Name</label>
                        <input 
                          type="text" 
                          name="name" 
                          value={registerForm.name} 
                          onChange={handleRegisterChange} 
                          placeholder="Enter your full name" 
                          required 
                        />
                      </div>
                      <div className="event-form-group">
                        <label>Email Address</label>
                        <input 
                          type="email" 
                          name="email" 
                          value={registerForm.email} 
                          onChange={handleRegisterChange} 
                          placeholder="name@university.edu" 
                          required 
                        />
                      </div>
                      <div className="event-form-group">
                        <label>Phone Number</label>
                        <input 
                          type="tel" 
                          name="phone" 
                          value={registerForm.phone} 
                          onChange={handleRegisterChange} 
                          placeholder="e.g. +88017XXXXXXXX" 
                          required 
                        />
                      </div>
                      <div className="event-form-group">
                        <label>University / Institution</label>
                        <input 
                          type="text" 
                          name="university" 
                          value={registerForm.university} 
                          onChange={handleRegisterChange} 
                          placeholder="e.g. Dhaka University" 
                          required 
                        />
                      </div>
                      <button type="submit" className="btn btn-primary w-100" style={{ marginTop: '0.8rem' }}>
                        Confirm Registration
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="success-container">
                  <div className="success-icon-wrapper">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3>Registration Confirmed!</h3>
                  <p>
                    You have successfully registered for <strong>{registerEvent.title}</strong>. A confirmation ticket and calendar invite has been sent to your email.
                  </p>
                  <div className="success-details-card">
                    <div>
                      <span>Registrant:</span>
                      <strong>{registerForm.name}</strong>
                    </div>
                    <div>
                      <span>Email:</span>
                      <strong>{registerForm.email}</strong>
                    </div>
                    <div>
                      <span>Date:</span>
                      <strong>{registerEvent.date}</strong>
                    </div>
                    <div>
                      <span>Location:</span>
                      <strong>{registerEvent.location}</strong>
                    </div>
                  </div>
                  <button className="btn btn-secondary w-100" onClick={() => setShowRegisterModal(false)}>
                    Back to Listing
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Suggest Event Modal */}
      <AnimatePresence>
        {showSuggestModal && (
          <div className="modal-overlay" onClick={() => setShowSuggestModal(false)}>
            <motion.div 
              className="event-modal-card card"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '500px' }}
            >
              <button className="event-modal-close-btn" onClick={() => setShowSuggestModal(false)}>
                <X size={18} />
              </button>

              {!suggestSuccess ? (
                <>
                  <div className="event-modal-header">
                    <div className="form-header-badge">
                      <Sparkles size={14} /> <span>Collaboration Hub</span>
                    </div>
                    <h3>Suggest a New Event</h3>
                    <p>Pitch your program idea and collaborate with the Skill Jobs team.</p>
                  </div>
                  <div className="event-modal-body">
                    <form className="event-form" onSubmit={handleSuggestSubmit}>
                      <div className="event-form-group">
                        <label>Your Name</label>
                        <input 
                          type="text" 
                          name="name" 
                          value={suggestForm.name} 
                          onChange={handleSuggestChange} 
                          placeholder="Enter your name" 
                          required 
                        />
                      </div>
                      <div className="event-form-group">
                        <label>Email Address</label>
                        <input 
                          type="email" 
                          name="email" 
                          value={suggestForm.email} 
                          onChange={handleSuggestChange} 
                          placeholder="Enter your email" 
                          required 
                        />
                      </div>
                      <div className="event-form-group">
                        <label>Proposed Event Title</label>
                        <input 
                          type="text" 
                          name="title" 
                          value={suggestForm.title} 
                          onChange={handleSuggestChange} 
                          placeholder="e.g. Next-Gen Tech Hackathon" 
                          required 
                        />
                      </div>
                      <div className="event-form-group">
                        <label>Category</label>
                        <select 
                          name="category" 
                          value={suggestForm.category} 
                          onChange={handleSuggestChange}
                        >
                          <option value="Event">Event</option>
                          <option value="Workshop">Workshop</option>
                          <option value="Summit">Summit</option>
                          <option value="Networking">Networking</option>
                          <option value="Training">Training</option>
                          <option value="Seminar">Seminar</option>
                        </select>
                      </div>
                      <div className="event-form-group">
                        <label>Pitch Proposal / Description</label>
                        <textarea 
                          name="description" 
                          value={suggestForm.description} 
                          onChange={handleSuggestChange} 
                          placeholder="Explain what the event is about, why students will love it, and how we can make it happen." 
                          rows={4}
                          required 
                        ></textarea>
                      </div>
                      <button type="submit" className="btn btn-primary w-100" style={{ marginTop: '0.8rem' }}>
                        Submit Pitch Proposal
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="success-container">
                  <div className="success-icon-wrapper">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3>Pitch Submitted!</h3>
                  <p>
                    Thank you, <strong>{suggestForm.name}</strong>! Your program suggestion "<strong>{suggestForm.title}</strong>" has been successfully queued for evaluation. Our coordinators will review it and follow up.
                  </p>
                  <button className="btn btn-secondary w-100" onClick={() => setShowSuggestModal(false)}>
                    Close Panel
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Events;

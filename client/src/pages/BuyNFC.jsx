import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CreditCard, Smartphone, Zap, ShieldCheck, Sparkles, Check, 
  ArrowRight, RefreshCw, Layers, QrCode, Globe, Users, 
  ChevronDown, Star, Award, Gift, Send, CheckCircle2, 
  Radio, PhoneCall, ShoppingCart, Lock, HeartHandshake, Eye, X,
  Sliders, ExternalLink, UploadCloud, Image as ImageIcon,
  ChevronLeft, ChevronRight, Play, Pause, Quote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getNfcCards, DEFAULT_NFC_CARDS, getNfcReviews, fetchNfcCards, fetchNfcReviews } from '../utils/nfcCards';
import { API_BASE_URL } from '../config/api';
import './BuyNFC.css';

const generateOrderId = () => 'NFC-' + Math.floor(100000 + Math.random() * 900000);

const BuyNFC = () => {
  // Dynamic NFC Cards state from system
  const [cardVariants, setCardVariants] = useState(() => getNfcCards());
  const [selectedVariant, setSelectedVariant] = useState(() => {
    const initial = getNfcCards();
    return initial[0] || DEFAULT_NFC_CARDS[0];
  });
  const [reviewsList, setReviewsList] = useState(() => getNfcReviews());

  useEffect(() => {
    // 1. Fetch latest cards & reviews from database API on page load
    fetchNfcCards().then((latest) => {
      if (Array.isArray(latest) && latest.length > 0) {
        setCardVariants(latest);
        setSelectedVariant((curr) => {
          const found = latest.find(c => c.id === curr?.id);
          return found || latest[0] || DEFAULT_NFC_CARDS[0];
        });
      }
    }).catch(err => console.error('Error fetching cards:', err));

    fetchNfcReviews().then((latest) => {
      if (Array.isArray(latest) && latest.length > 0) {
        setReviewsList(latest);
      }
    }).catch(err => console.error('Error fetching reviews:', err));

    // 2. Real-time event listeners
    const handleCardsUpdate = (e) => {
      const latest = (e && e.detail && Array.isArray(e.detail)) ? e.detail : getNfcCards();
      setCardVariants(latest);
      setSelectedVariant((curr) => {
        const found = latest.find(c => c.id === curr?.id);
        return found || latest[0] || DEFAULT_NFC_CARDS[0];
      });
    };

    const handleReviewsUpdate = (e) => {
      const latest = (e && e.detail && Array.isArray(e.detail)) ? e.detail : getNfcReviews();
      setReviewsList(latest);
    };

    window.addEventListener('nfc_cards_updated', handleCardsUpdate);
    window.addEventListener('nfc_reviews_updated', handleReviewsUpdate);
    window.addEventListener('storage', () => {
      handleCardsUpdate();
      handleReviewsUpdate();
    });

    return () => {
      window.removeEventListener('nfc_cards_updated', handleCardsUpdate);
      window.removeEventListener('nfc_reviews_updated', handleReviewsUpdate);
      window.removeEventListener('storage', handleCardsUpdate);
    };
  }, []);

  // Customizer state
  const [cardName, setCardName] = useState('YOUR FULL NAME');
  const [cardTitle, setCardTitle] = useState('Campus Ambassador / Developer');
  const [cardOrg, setCardOrg] = useState('Skill Jobs Next Gen');
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'phone'

  // Top 3D Slideshow State:
  // Card enters from Right -> shows Front -> flips to Back -> exits to Left -> next Card loops
  const [cycleKey, setCycleKey] = useState(0);
  const [showcaseIndex, setShowcaseIndex] = useState(0);
  const [showcaseFlipped, setShowcaseFlipped] = useState(false);
  const [slidePhase, setSlidePhase] = useState('enter-right'); // 'enter-right' | 'center' | 'exit-left'
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // 3D Sequenced Cinematic Loop Engine:
  // 1. Enter from right (0.85s keyframe slide into center)
  // 2. Stay centered displaying Front side (2.6s display)
  // 3. 3D Flip to Back side (0.85s flip + 2.6s display)
  // 4. Slide out to the Left (0.85s keyframe slide to left)
  // 5. Advance card and loop from Right seamlessly!
  useEffect(() => {
    if (!isAutoPlay || cardVariants.length === 0) return;

    let isMounted = true;
    const timers = [];

    // Stage 1: Entrance animation runs for 850ms, then settle in center
    timers.push(setTimeout(() => {
      if (!isMounted) return;
      setSlidePhase('center');

      // Stage 2: Display Front for 2.6s, then flip to Back
      timers.push(setTimeout(() => {
        if (!isMounted) return;
        setShowcaseFlipped(true);

        // Stage 3: Display Back for 2.6s, then initiate Exit to Left
        timers.push(setTimeout(() => {
          if (!isMounted) return;
          setSlidePhase('exit-left');

          // Stage 4: Allow 850ms for exit to left, then queue next card from right
          timers.push(setTimeout(() => {
            if (!isMounted) return;
            setShowcaseIndex(prev => (prev + 1) % cardVariants.length);
            setShowcaseFlipped(false);
            setSlidePhase('enter-right');
            setCycleKey(prev => prev + 1);
          }, 850));
        }, 2600));
      }, 2600));
    }, 850));

    return () => {
      isMounted = false;
      timers.forEach(t => clearTimeout(t));
    };
  }, [isAutoPlay, cycleKey, cardVariants.length]);

  // Order form state
  const [formData, setFormData] = useState(() => {
    const initial = getNfcCards();
    const firstId = initial[0]?.id || DEFAULT_NFC_CARDS[0].id;
    return {
      fullName: '',
      phone: '',
      email: '',
      address: '',
      district: 'Dhaka',
      quantity: 1,
      customNameOnCard: '',
      customRoleOnCard: '',
      customOrgOnCard: '',
      cardVariantId: firstId,
      paymentMethod: 'bkash', // bkash | nagad | cod | card
      trxId: '',
      ambassadorCode: '',
      notes: ''
    };
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [stepError, setStepError] = useState('');
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const orderFormRef = useRef(null);

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setFormData(prev => ({ ...prev, cardVariantId: variant.id }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setStepError('');
    
    if (name === 'customNameOnCard' && value.trim()) {
      setCardName(value);
    } else if (name === 'customNameOnCard' && !value.trim()) {
      setCardName('YOUR FULL NAME');
    }

    if (name === 'customRoleOnCard' && value.trim()) {
      setCardTitle(value);
    } else if (name === 'customRoleOnCard' && !value.trim()) {
      setCardTitle('Campus Ambassador / Developer');
    }

    if (name === 'customOrgOnCard' && value.trim()) {
      setCardOrg(value);
    } else if (name === 'customOrgOnCard' && !value.trim()) {
      setCardOrg('Skill Jobs Next Gen');
    }
  };

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const openOrderModal = (variant) => {
    if (variant) {
      handleVariantSelect(variant);
    }
    setStepError('');
    setIsOrderModalOpen(true);
  };

  const closeOrderModal = () => {
    setIsOrderModalOpen(false);
  };

  const validateStep1 = () => {
    if (!formData.customNameOnCard.trim()) {
      setStepError('Please enter the name you want printed on your card.');
      return false;
    }
    if (!formData.customRoleOnCard.trim()) {
      setStepError('Please enter your designation or role.');
      return false;
    }
    setStepError('');
    return true;
  };

  const validateStep2 = () => {
    if (!formData.fullName.trim()) {
      setStepError('Please enter your full name.');
      return false;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setStepError('Please enter a valid phone number (01XXXXXXXXX).');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setStepError('Please enter a valid email address.');
      return false;
    }
    if (!formData.address.trim()) {
      setStepError('Please enter your detailed delivery address.');
      return false;
    }
    setStepError('');
    return true;
  };

  const nextStep = (e) => {
    if (e) e.preventDefault();
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3);
    }
  };

  const prevStep = () => {
    setStepError('');
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
      return;
    }
    if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3);
      return;
    }
    
    setIsSubmitting(true);
    setStepError('');

    const generatedId = generateOrderId();
    const orderPayload = {
      id: generatedId,
      customerName: formData.fullName.trim(),
      customerEmail: formData.email.trim(),
      customerPhone: formData.phone.trim(),
      deliveryAddress: formData.address.trim(),
      district: formData.district || 'Dhaka',
      cardVariantId: selectedVariant.id,
      cardVariantName: selectedVariant.name,
      customNameOnCard: formData.customNameOnCard.trim() || cardName,
      customRoleOnCard: formData.customRoleOnCard.trim() || cardTitle,
      customOrgOnCard: formData.customOrgOnCard.trim() || cardOrg,
      paymentMethod: formData.paymentMethod || 'bkash',
      trxId: formData.trxId.trim(),
      ambassadorCode: formData.ambassadorCode.trim(),
      notes: formData.notes.trim(),
      quantity: quantity,
      unitPrice: unitPrice,
      subtotal: subtotal,
      deliveryCharge: deliveryCharge,
      discountAmount: discountAmount,
      grandTotal: grandTotal,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/nfc-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      if (res.ok) {
        const data = await res.json();
        setOrderId(data.orderId || generatedId);
      } else {
        setOrderId(generatedId);
      }
    } catch (err) {
      console.error('Error submitting NFC order to API:', err);
      setOrderId(generatedId);
    } finally {
      setIsSubmitting(false);
      setOrderSubmitted(true);
    }
  };

  // Price calculations
  const unitPrice = selectedVariant.price;
  const quantity = Math.max(1, parseInt(formData.quantity) || 1);
  const subtotal = unitPrice * quantity;
  const discountAmount = formData.ambassadorCode.trim().toUpperCase() === 'AMBASSADOR' ? Math.round(subtotal * 0.1) : 0;
  const deliveryCharge = formData.district === 'Dhaka' ? 60 : 120;
  const grandTotal = subtotal - discountAmount + deliveryCharge;

  return (
    <div className="nfc-promo-page">
      {/* Background Decorative Blur Orbs */}
      <div className="nfc-glow-orb nfc-glow-orb-1" />
      <div className="nfc-glow-orb nfc-glow-orb-2" />
      <div className="nfc-glow-orb nfc-glow-orb-3" />

      {/* =========================================================================
          TOP 3D CARD SHOWCASE BANNER: Dynamic Loop Flipping Through Admin Cards
          ========================================================================= */}
      {cardVariants.length > 0 && (() => {
        const activeCard = cardVariants[showcaseIndex % cardVariants.length] || cardVariants[0];
        return (
          <section className="nfc-top-slideshow-section">
            <div className="container">
              <div className="nfc-top-slideshow-card">
                {/* 3D Showcase Stage */}
                <div className="slideshow-stage-container">
                  {/* Left & Right manual navigation */}
                  <button 
                    className="slideshow-nav-arrow arrow-prev"
                    onClick={() => {
                      setShowcaseFlipped(false);
                      setSlidePhase('enter-right');
                      setCycleKey(prev => prev + 1);
                      setShowcaseIndex(prev => (prev - 1 + cardVariants.length) % cardVariants.length);
                    }}
                    title="Previous Card"
                    aria-label="Previous Card"
                  >
                    <ChevronLeft size={22} />
                  </button>

                  <div className="slideshow-card-stage-anchor">
                    {/* Dynamic Ambient Glow Aura */}
                    <div 
                      className="slideshow-ambient-aura"
                      style={{
                        background: `radial-gradient(ellipse at center, ${activeCard.accentColor || '#0284c7'}40 0%, transparent 70%)`
                      }}
                    />

                    <div 
                      key={`${showcaseIndex}-${cycleKey}`}
                      className={`slideshow-3d-card-wrapper ${showcaseFlipped ? 'flipped' : ''} slide-phase-${slidePhase}`}
                      onClick={() => setShowcaseFlipped(!showcaseFlipped)}
                      title="Click to flip card"
                    >
                      {/* Front Face */}
                      <div 
                        className="slideshow-card-face slideshow-card-front"
                        style={{
                          background: activeCard.cardImage
                            ? `url(${activeCard.cardImage}) center/cover no-repeat`
                            : activeCard.cardBg,
                          color: activeCard.textColor || '#ffffff'
                        }}
                      >
                        <div className="nfc-card-sheen" />
                        {/* Smooth White Contactless Blink */}
                        <div className="nfc-network-pulse-overlay">
                          <div className="network-wave-radar">
                            <span className="network-ripple network-ripple-1" />
                            <span className="network-ripple network-ripple-2" />
                            <span className="network-ripple network-ripple-3" />
                          </div>
                        </div>
                      </div>

                      {/* Back Face */}
                      <div 
                        className="slideshow-card-face slideshow-card-back"
                        style={{
                          background: activeCard.cardBackImage
                            ? `url(${activeCard.cardBackImage}) center/cover no-repeat`
                            : (activeCard.cardImage
                                ? `url(${activeCard.cardImage}) center/cover no-repeat`
                                : activeCard.cardBg),
                          color: activeCard.textColor || '#ffffff'
                        }}
                      >
                        <div className="nfc-card-sheen" />
                        {!activeCard.cardBackImage && !activeCard.cardImage && (
                          <div className="nfc-back-magnetic-stripe" />
                        )}
                      </div>
                    </div>

                    {/* Realistic 3D Ground Shadow */}
                    <div className="slideshow-ground-shadow" />
                  </div>

                  <button 
                    className="slideshow-nav-arrow arrow-next"
                    onClick={() => {
                      setShowcaseFlipped(false);
                      setSlidePhase('enter-right');
                      setCycleKey(prev => prev + 1);
                      setShowcaseIndex(prev => (prev + 1) % cardVariants.length);
                    }}
                    title="Next Card"
                    aria-label="Next Card"
                  >
                    <ChevronRight size={22} />
                  </button>
                </div>


                {/* Slideshow Dots Indicator if multiple cards exist */}
                {cardVariants.length > 1 && (
                  <div className="slideshow-footer-bar">
                    <div className="slideshow-dots-row">
                      {cardVariants.map((card, idx) => (
                        <button
                          key={card.id || idx}
                          className={`slideshow-dot ${idx === (showcaseIndex % cardVariants.length) ? 'active' : ''}`}
                          onClick={() => {
                            setShowcaseIndex(idx);
                            setShowcaseFlipped(false);
                            setSlidePhase('enter-right');
                            setCycleKey(prev => prev + 1);
                          }}
                          title={card.name}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })()}

      {/* =========================================================================
          HERO SECTION: High-energy promotional opener with 3D Live Card Customizer
          ========================================================================= */}
      <section className="nfc-hero-section">
        <div className="container">
          <div className="nfc-hero-grid">
            {/* Left Content */}
            <div className="nfc-hero-content">
              <h1 className="nfc-hero-title">
                One Tap. Instant Impact. <br />
                <span className="nfc-gradient-text">The Last Business Card</span> You’ll Ever Need.
              </h1>
              
              <p className="nfc-hero-subtitle">
                Upgrade your personal brand with the <strong>Skill Jobs Smart NFC Card</strong>. 
                Share your digital resume, portfolio, social media links, and contact info in 
                less than 1 second to any smartphone. <strong>Zero app needed for the recipient.</strong>
              </p>

              {/* Key Highlights Pill Row */}
              <div className="nfc-pill-highlights">
                <div className="nfc-pill-item">
                  <Zap size={16} className="pill-icon" />
                  <span>Instant 0.2s Tap</span>
                </div>
                <div className="nfc-pill-item">
                  <Smartphone size={16} className="pill-icon" />
                  <span>100% App-Free</span>
                </div>
                <div className="nfc-pill-item">
                  <RefreshCw size={16} className="pill-icon" />
                  <span>Unlimited Edits</span>
                </div>
                <div className="nfc-pill-item">
                  <ShieldCheck size={16} className="pill-icon" />
                  <span>Waterproof & Durable</span>
                </div>
              </div>

              {/* CTA Action Row */}
              <div className="nfc-hero-cta-group">
                <button 
                  onClick={() => openOrderModal(selectedVariant)} 
                  className="btn btn-primary nfc-cta-primary"
                >
                  <ShoppingCart size={18} />
                  <span>Order Your NFC Card (৳{selectedVariant.price})</span>
                  <ArrowRight size={18} />
                </button>
                <a href="#how-it-works" className="btn btn-outline nfc-cta-secondary">
                  <Eye size={18} />
                  <span>See How It Works</span>
                </a>
              </div>
            </div>

            {/* Right: Interactive 3D Card Stage & Live Customizer */}
            <div className="nfc-hero-stage">
              <div className="nfc-stage-tabs">
                <button 
                  className={`stage-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('preview')}
                >
                  <CreditCard size={16} />
                  <span>3D Card Preview</span>
                </button>
                <button 
                  className={`stage-tab-btn ${activeTab === 'phone' ? 'active' : ''}`}
                  onClick={() => setActiveTab('phone')}
                >
                  <Smartphone size={16} />
                  <span>Phone Tap Simulation</span>
                </button>
              </div>

              {activeTab === 'preview' ? (
                <div className="nfc-interactive-showcase">
                  {/* 3D Flippable Card */}
                  <div 
                    className={`nfc-3d-card-wrapper ${isFlipped ? 'flipped' : ''}`}
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    {/* Front of Card */}
                    <div 
                      className="nfc-card-face nfc-card-front"
                      style={{ 
                        background: selectedVariant.cardImage 
                          ? `url(${selectedVariant.cardImage}) center/cover no-repeat` 
                          : selectedVariant.cardBg,
                        color: selectedVariant.textColor,
                        borderColor: selectedVariant.accentColor + '40'
                      }}
                    >
                      <div className="nfc-card-sheen" />
                      
                      {/* Smooth White Blink / Pulse Wave Animation */}
                      <div className="nfc-network-pulse-overlay">
                        <div className="network-wave-radar">
                          <span className="network-ripple network-ripple-1" />
                          <span className="network-ripple network-ripple-2" />
                          <span className="network-ripple network-ripple-3" />
                        </div>
                      </div>
                      
                      {/* Card Content Overlay */}
                      {selectedVariant.cardImage ? null : (
                        <>
                          {/* Top Bar of Card */}
                          <div className="nfc-card-header">
                            <div className="nfc-card-brand">
                              <img src="/logo.png" alt="Skill Jobs" className="nfc-card-logo-img" />
                              <span className="nfc-card-brand-sub">NEXT GEN</span>
                            </div>
                            <div className="nfc-chip-symbol">
                              <Radio size={22} className="nfc-wave-icon" style={{ color: selectedVariant.nfcColor }} />
                              <div className={`nfc-metallic-chip chip-${selectedVariant.chipFinish}`} />
                            </div>
                          </div>

                          {/* Middle NFC Touch Wave */}
                          <div className="nfc-card-body">
                            <div className="nfc-contactless-signal">
                              <div className="signal-ring signal-ring-1" />
                              <div className="signal-ring signal-ring-2" />
                              <div className="signal-ring signal-ring-3" />
                            </div>
                          </div>

                          {/* Bottom Info of Card */}
                          <div className="nfc-card-footer">
                            <div className="nfc-card-holder-info">
                              <span className="nfc-holder-name">{cardName || 'YOUR FULL NAME'}</span>
                              <span className="nfc-holder-role">{cardTitle || 'Campus Ambassador'}</span>
                              <span className="nfc-holder-org">{cardOrg || 'Skill Jobs'}</span>
                            </div>
                            <div className="nfc-card-watermark">
                              <span>NFC VERIFIED</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Back of Card */}
                    <div 
                      className="nfc-card-face nfc-card-back"
                      style={{ 
                        background: selectedVariant.cardBackImage 
                          ? `url(${selectedVariant.cardBackImage}) center/cover no-repeat`
                          : (selectedVariant.cardImage 
                              ? `url(${selectedVariant.cardImage}) center/cover no-repeat` 
                              : selectedVariant.cardBg),
                        color: selectedVariant.textColor,
                        borderColor: selectedVariant.accentColor + '40'
                      }}
                    >
                      <div className="nfc-card-sheen" />
                      {!selectedVariant.cardBackImage && !selectedVariant.cardImage && (
                        <div className="nfc-back-magnetic-stripe" />
                      )}
                    </div>
                  </div>

                  {/* Card Controls */}
                  <div className="nfc-card-controls">
                    <button 
                      className="nfc-flip-btn"
                      onClick={() => setIsFlipped(!isFlipped)}
                    >
                      <RefreshCw size={14} />
                      <span>{isFlipped ? 'View Front Side' : 'Flip to View Back Side'}</span>
                    </button>

                    <span className="nfc-material-label">
                      Material: <strong>{selectedVariant.material}</strong>
                    </span>
                  </div>

                  {/* Material & Color Selector Palette */}
                  <div className="nfc-variant-selector">
                    <span className="nfc-variant-title">Choose Your Finish & Material:</span>
                    <div className="nfc-variant-chips">
                      {cardVariants.map(variant => (
                        <button
                          key={variant.id}
                          className={`nfc-variant-chip ${selectedVariant.id === variant.id ? 'active' : ''}`}
                          onClick={() => handleVariantSelect(variant)}
                        >
                          <span 
                            className="variant-swatch" 
                            style={{ 
                              background: variant.cardImage ? `url(${variant.cardImage}) center/cover no-repeat` : variant.cardBg 
                            }}
                          />
                          <span className="variant-name">{variant.name}</span>
                          {variant.cardImage && <span className="variant-mini-badge" style={{ background: '#db2777' }}>🖼️ Artwork</span>}
                          {variant.badge && !variant.cardImage && <span className="variant-mini-badge">{variant.badge}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Phone Tap Simulator */
                <div className="nfc-phone-simulator-wrapper">
                  <div className="nfc-phone-frame">
                    <div className="phone-notch">
                      <div className="phone-camera" />
                      <div className="phone-speaker" />
                    </div>

                    {/* NFC Tap Signal Top Notification */}
                    <div className="phone-nfc-banner">
                      <Radio size={16} className="phone-banner-icon" />
                      <div>
                        <strong>NFC Tag Detected</strong>
                        <span>Opening Skill Jobs Digital Bio & Portfolio...</span>
                      </div>
                    </div>

                    {/* Smartphone Screen Content */}
                    <div className="phone-screen-content">
                      <div className="phone-profile-header">
                        <div className="phone-avatar-wrap">
                          <img 
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" 
                            alt="Profile" 
                            className="phone-avatar"
                          />
                          <span className="phone-verified-tick"><Check size={10} /></span>
                        </div>
                        <h4 className="phone-profile-name">{cardName || 'Mahfuzur Rahman'}</h4>
                        <p className="phone-profile-title">{cardTitle || 'Campus Ambassador'}</p>
                        <span className="phone-profile-org">{cardOrg || 'Skill Jobs Next Gen'}</span>
                      </div>

                      {/* Action Buttons inside Phone */}
                      <div className="phone-action-buttons">
                        <button className="phone-save-contact-btn">
                          <PhoneCall size={14} />
                          <span>Save Contact to Phone (.vcf)</span>
                        </button>
                      </div>

                      {/* Social & Professional Links inside Phone */}
                      <div className="phone-links-list">
                        <div className="phone-link-card">
                          <Globe size={16} className="link-icon link-web" />
                          <span>View Full Portfolio & Projects</span>
                          <ArrowRight size={14} />
                        </div>
                        <div className="phone-link-card">
                          <Users size={16} className="link-icon link-linkedin" />
                          <span>Connect on LinkedIn</span>
                          <ArrowRight size={14} />
                        </div>
                        <div className="phone-link-card">
                          <Award size={16} className="link-icon link-cert" />
                          <span>Skill Jobs Verified Certifications</span>
                          <ArrowRight size={14} />
                        </div>
                        <div className="phone-link-card">
                          <Send size={16} className="link-icon link-whatsapp" />
                          <span>Chat on WhatsApp</span>
                          <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="phone-sim-note">
                    ✨ When someone touches your card, this exact customized mobile profile launches automatically.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          HOW IT WORKS IN 3 SIMPLE STEPS
          ========================================================================= */}
      <section className="nfc-how-it-works-section" id="how-it-works">
        <div className="container">
          <div className="section-header-center">
            <span className="sub-badge">SEAMLESS EXPERIENCE</span>
            <h2 className="section-title">How It Works in 3 Seconds</h2>
            <p className="section-subtitle">Networking has never been this effortless and memorable.</p>
          </div>

          <div className="nfc-steps-grid">
            <div className="nfc-step-card">
              <div className="step-num-badge">01</div>
              <div className="step-illustration">
                <Radio size={40} className="step-icon" />
              </div>
              <h4>1. Tap Your Card</h4>
              <p>Gently tap your Skill Jobs card against the back of any smartphone (iPhone or Android).</p>
            </div>

            <div className="nfc-step-card">
              <div className="step-num-badge">02</div>
              <div className="step-illustration">
                <Globe size={40} className="step-icon" />
              </div>
              <h4>2. Instant Profile Launch</h4>
              <p>Your custom Skill Jobs profile, social links, resume, and portfolio open in their browser instantly.</p>
            </div>

            <div className="nfc-step-card">
              <div className="step-num-badge">03</div>
              <div className="step-illustration">
                <CheckCircle2 size={40} className="step-icon" />
              </div>
              <h4>3. Save Direct to Contacts</h4>
              <p>With one tap of the "Save Contact" button, all your details are saved right into their phonebook.</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PRICING TIERS / CARD EDITIONS
          ========================================================================= */}
      <section className="nfc-pricing-section" id="pricing">
        <div className="container">
          <div className="section-header-center">
            <span className="sub-badge">TRANSPARENT PRICING</span>
            <h2 className="section-title">
              Choose Your <span className="nfc-gradient-text">NFC Card Edition</span>
            </h2>
            <p className="section-subtitle">
              Every card includes lifetime free hosting of your digital bio profile, zero subscription fees.
            </p>
          </div>

          <div className="nfc-pricing-grid">
            {cardVariants.map((variant) => (
              <div 
                key={variant.id} 
                className={`nfc-pricing-card ${variant.id === selectedVariant.id ? 'highlighted' : ''}`}
              >
                {variant.badge && (
                  <div className="pricing-ribbon">{variant.badge}</div>
                )}
                
                <div className="pricing-header">
                  <h3>{variant.name}</h3>
                  <p className="pricing-material">{variant.material}</p>
                  <div className="pricing-price-box">
                    <span className="currency">৳</span>
                    <span className="amount">{variant.price}</span>
                    <span className="original-price">৳{variant.originalPrice}</span>
                    <span className="discount-tag">{variant.discount}</span>
                  </div>
                </div>

                <div 
                  className="pricing-card-preview-mini" 
                  style={{ 
                    background: variant.cardImage 
                      ? `url(${variant.cardImage}) center/cover no-repeat` 
                      : variant.cardBg,
                    color: variant.textColor || '#ffffff'
                  }}
                >
                  {variant.cardImage ? null : (
                    <>
                      <div className="mini-card-logo">
                        <img src="/logo.png" alt="logo" />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Radio size={16} color={variant.nfcColor} />
                      </div>
                    </>
                  )}
                </div>

                <ul className="pricing-features-list">
                  <li><Check size={16} className="check-icon" /> High-speed NTAG216 NFC Chip</li>
                  <li><Check size={16} className="check-icon" /> Custom UV Printed Name & Role</li>
                  <li><Check size={16} className="check-icon" /> Dynamic QR Code on Back</li>
                  <li><Check size={16} className="check-icon" /> Lifetime Free Digital Profile Hosting</li>
                  <li><Check size={16} className="check-icon" /> Unlimited Real-Time Link Edits</li>
                  <li><Check size={16} className="check-icon" /> 100% Waterproof & Scratch-Resistant</li>
                  {variant.id === 'executive-gold' && (
                    <li><Check size={16} className="check-icon" /> VIP Executive Gold Luster Coating</li>
                  )}
                  {variant.id === 'titanium-silver' && (
                    <li><Check size={16} className="check-icon" /> Heavyweight Solid Metal Core</li>
                  )}
                </ul>

                <button 
                  onClick={() => openOrderModal(variant)} 
                  className={`btn ${variant.id === selectedVariant.id ? 'btn-primary' : 'btn-outline'} pricing-select-btn`}
                >
                  <ShoppingCart size={16} />
                  <span>Customize & Order Now</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          ORDER & CHECKOUT: 3-STEP POPUP MODAL WIZARD
          ========================================================================= */}
      <AnimatePresence>
        {isOrderModalOpen && (
          <div className="nfc-modal-overlay" onClick={closeOrderModal}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.94, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 25 }}
              transition={{ duration: 0.3 }}
              className="nfc-modal-container"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={closeOrderModal}
                aria-label="Close modal"
              >
                <X size={22} />
              </button>

              <div className="order-box-container modal-box-container">
                {!orderSubmitted && (
                  <div className="order-box-header">
                    <span className="sub-badge">STEP-BY-STEP CHECKOUT</span>
                    <h2 className="section-title">Order Your Custom Smart NFC Card</h2>
                    <p>Complete the 3 quick steps below to get your card engraved and delivered.</p>
                    
                    {/* 3-Step Progress Stepper Bar */}
                    <div className="nfc-stepper-bar">
                      <div 
                        className={`stepper-step ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}
                        onClick={() => { if (currentStep > 1) setCurrentStep(1); }}
                      >
                        <div className="step-circle">
                          {currentStep > 1 ? <Check size={14} /> : '1'}
                        </div>
                        <div className="step-info">
                          <span className="step-label">Step 1</span>
                          <span className="step-name">Custom Engraving</span>
                        </div>
                      </div>

                      <div className={`stepper-line ${currentStep >= 2 ? 'active' : ''}`} />

                      <div 
                        className={`stepper-step ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}
                        onClick={() => { if (currentStep > 2 || (currentStep === 1 && validateStep1())) setCurrentStep(2); }}
                      >
                        <div className="step-circle">
                          {currentStep > 2 ? <Check size={14} /> : '2'}
                        </div>
                        <div className="step-info">
                          <span className="step-label">Step 2</span>
                          <span className="step-name">Shipping Info</span>
                        </div>
                      </div>

                      <div className={`stepper-line ${currentStep >= 3 ? 'active' : ''}`} />

                      <div className={`stepper-step ${currentStep === 3 ? 'active' : ''}`}>
                        <div className="step-circle">3</div>
                        <div className="step-info">
                          <span className="step-label">Step 3</span>
                          <span className="step-name">Payment & Review</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

            {/* Error Notification Banner if any */}
            {stepError && !orderSubmitted && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="step-error-banner"
              >
                <span>⚠️ {stepError}</span>
              </motion.div>
            )}

            {/* Completed Notification Screen (with Green Tick) */}
            {orderSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="order-success-screen"
              >
                {/* Glowing Green Tick Icon Button */}
                <div className="green-tick-wrapper">
                  <div className="green-tick-glow" />
                  <div className="green-tick-circle">
                    <Check size={56} className="green-tick-icon" strokeWidth={3} />
                  </div>
                </div>

                <div className="success-badge-tag">
                  <CheckCircle2 size={16} /> ORDER CONFIRMED
                </div>

                <h3 className="success-headline">Successfully Completed! 🎉</h3>
                <p className="order-tracking-num">Your Tracking Order ID: <strong>{orderId}</strong></p>
                
                <p className="success-desc">
                  Thank you, <strong>{formData.fullName || 'Valued Customer'}</strong>! Your order for the 
                  <strong> {selectedVariant.name}</strong> has been registered. Our team is preparing your custom engraving and will dispatch your card via express courier.
                </p>
                
                <div className="success-summary-box">
                  <div className="summary-row">
                    <span>Card Edition:</span>
                    <strong>{selectedVariant.name}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Printed Name:</span>
                    <strong>{formData.customNameOnCard || cardName}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Printed Role:</span>
                    <strong>{formData.customRoleOnCard || cardTitle}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Delivery Address:</span>
                    <strong>{formData.address}, {formData.district}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Phone Number:</span>
                    <strong>{formData.phone}</strong>
                  </div>
                  <div className="summary-row summary-total-row">
                    <span>Total Amount Paid / Payable:</span>
                    <strong className="summary-total-amt">৳{grandTotal} ({formData.paymentMethod.toUpperCase()})</strong>
                  </div>
                </div>

                <div className="success-actions">
                  <a 
                    href={`https://wa.me/8801847334827?text=Hello%20Skill%20Jobs!%20I%20just%20placed%20NFC%20Card%20Order%20${orderId}.%20Please%20confirm%20my%20order.`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-primary whatsapp-confirm-btn"
                  >
                    <Send size={16} />
                    <span>WhatsApp Order Confirmation (01847334827)</span>
                  </a>
                  <button 
                    onClick={() => {
                      setOrderSubmitted(false);
                      setCurrentStep(1);
                      setFormData({
                        fullName: '',
                        phone: '',
                        email: '',
                        address: '',
                        district: 'Dhaka',
                        quantity: 1,
                        customNameOnCard: '',
                        customRoleOnCard: '',
                        customOrgOnCard: '',
                        cardVariantId: cardVariants[0]?.id || 'matte-black',
                        paymentMethod: 'bkash',
                        trxId: '',
                        ambassadorCode: '',
                        notes: ''
                      });
                    }}
                    className="btn btn-outline"
                  >
                    Order Another Card
                  </button>
                  <button 
                    type="button"
                    onClick={closeOrderModal}
                    className="btn btn-outline close-done-btn"
                  >
                    Done & Return to Page
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Step-by-Step Wizard Form */
              <form onSubmit={handleOrderSubmit} className="nfc-step-wizard-form">
                <AnimatePresence mode="wait">
                  {/* STEP 1: Card Selection & Custom Engraving */}
                  {currentStep === 1 && (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className="wizard-step-pane"
                    >
                      <h3 className="wizard-step-title">
                        <CreditCard size={20} className="step-title-icon" />
                        <span>Step 1: Custom Engraving Details</span>
                      </h3>

                      {/* Selected Card Banner (auto-selected from clicked card) */}
                      <div className="wizard-selected-card-banner">
                        <div 
                          className="w-selected-card-swatch" 
                          style={{ 
                            background: selectedVariant.cardImage 
                              ? `url(${selectedVariant.cardImage}) center/cover no-repeat` 
                              : selectedVariant.cardBg 
                          }}
                        />
                        <div className="w-selected-card-info">
                          <span className="w-selected-label">Selected Card Edition</span>
                          <h4 className="w-selected-title">{selectedVariant.name}</h4>
                          <span className="w-selected-mat">{selectedVariant.material}</span>
                        </div>
                        <div className="w-selected-price-box">
                          <div className="w-selected-prices">
                            <strong className="w-price-main">৳{selectedVariant.price}</strong>
                            <span className="w-price-cut">৳{selectedVariant.originalPrice}</span>
                          </div>
                          {selectedVariant.badge && (
                            <span className="w-selected-badge">{selectedVariant.badge}</span>
                          )}
                        </div>
                      </div>

                      {/* Engraving Inputs */}
                      <div className="wizard-inputs-grid">
                        <div className="form-group">
                          <label>Full Name to Print on Card *</label>
                          <input 
                            type="text" 
                            name="customNameOnCard"
                            placeholder="e.g. Asif Mahmud"
                            value={formData.customNameOnCard}
                            onChange={handleInputChange}
                            required
                          />
                          <span className="field-hint">This exact name will be engraved on the front of your card.</span>
                        </div>

                        <div className="form-group">
                          <label>Designation / Role to Print *</label>
                          <input 
                            type="text" 
                            name="customRoleOnCard"
                            placeholder="e.g. Software Engineer / Campus Ambassador"
                            value={formData.customRoleOnCard}
                            onChange={handleInputChange}
                            required
                          />
                          <span className="field-hint">e.g. Student, Founder, UI Designer, Campus Ambassador</span>
                        </div>

                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                          <label>Organization / University / Brand (Optional)</label>
                          <input 
                            type="text" 
                            name="customOrgOnCard"
                            placeholder="e.g. Dhaka University / Skill Jobs"
                            value={formData.customOrgOnCard}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      {/* Step 1 Actions */}
                      <div className="wizard-nav-actions single-next">
                        <button 
                          type="button" 
                          onClick={nextStep}
                          className="btn btn-primary wizard-next-btn"
                        >
                          <span>Continue to Step 2: Shipping Address</span>
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: Shipping & Delivery Information */}
                  {currentStep === 2 && (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className="wizard-step-pane"
                    >
                      <h3 className="wizard-step-title">
                        <Globe size={20} className="step-title-icon" />
                        <span>Step 2: Shipping & Delivery Address</span>
                      </h3>

                      <div className="wizard-inputs-grid">
                        <div className="form-group">
                          <label>Recipient Full Name *</label>
                          <input 
                            type="text" 
                            name="fullName"
                            placeholder="Your full legal name"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Active Contact Phone Number *</label>
                          <input 
                            type="tel" 
                            name="phone"
                            placeholder="01XXXXXXXXX"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Email Address *</label>
                          <input 
                            type="email" 
                            name="email"
                            placeholder="your.email@example.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>District / City Division *</label>
                          <select 
                            name="district" 
                            value={formData.district}
                            onChange={handleInputChange}
                          >
                            <option value="Dhaka">Dhaka (Inside City - ৳60 Courier)</option>
                            <option value="Chittagong">Chittagong (৳120 Courier)</option>
                            <option value="Sylhet">Sylhet (৳120 Courier)</option>
                            <option value="Rajshahi">Rajshahi (৳120 Courier)</option>
                            <option value="Khulna">Khulna (৳120 Courier)</option>
                            <option value="Barisal">Barisal (৳120 Courier)</option>
                            <option value="Rangpur">Rangpur (৳120 Courier)</option>
                            <option value="Mymensingh">Mymensingh (৳120 Courier)</option>
                            <option value="Other">Other District in Bangladesh (৳120 Courier)</option>
                          </select>
                        </div>

                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                          <label>Detailed Delivery Address *</label>
                          <textarea 
                            name="address"
                            rows="2"
                            placeholder="House / Flat No, Road No, Area, Thana / Post Office"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Ambassador Referral Code (Optional)</label>
                          <input 
                            type="text" 
                            name="ambassadorCode"
                            placeholder="e.g. AMBASSADOR"
                            value={formData.ambassadorCode}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div className="form-group">
                          <label>Quantity</label>
                          <input 
                            type="number" 
                            name="quantity"
                            min="1"
                            max="50"
                            value={formData.quantity}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      {/* Step 2 Actions */}
                      <div className="wizard-nav-actions dual-actions">
                        <button 
                          type="button" 
                          onClick={prevStep}
                          className="btn btn-outline wizard-back-btn"
                        >
                          <span>Back to Step 1</span>
                        </button>
                        <button 
                          type="button" 
                          onClick={nextStep}
                          className="btn btn-primary wizard-next-btn"
                        >
                          <span>Continue to Step 3: Payment & Summary</span>
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: Payment & Final Review */}
                  {currentStep === 3 && (
                    <motion.div 
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className="wizard-step-pane"
                    >
                      <h3 className="wizard-step-title">
                        <Lock size={20} className="step-title-icon" />
                        <span>Step 3: Payment Method & Final Review</span>
                      </h3>

                      <div className="step3-review-grid">
                        {/* Left: Payment Method Selection */}
                        <div className="step3-payment-col">
                          <label className="wizard-field-label">Select How You Want to Pay:</label>
                          <div className="payment-options-grid">
                            <label className={`payment-option ${formData.paymentMethod === 'bkash' ? 'selected' : ''}`}>
                              <input 
                                type="radio" 
                                name="paymentMethod" 
                                value="bkash" 
                                checked={formData.paymentMethod === 'bkash'}
                                onChange={handleInputChange}
                              />
                              <span className="pay-badge bkash-badge">bKash</span>
                              <div>
                                <strong>bKash Send Money / Merchant</strong>
                                <span className="pay-sub">Fast verification</span>
                              </div>
                            </label>

                            <label className={`payment-option ${formData.paymentMethod === 'nagad' ? 'selected' : ''}`}>
                              <input 
                                type="radio" 
                                name="paymentMethod" 
                                value="nagad" 
                                checked={formData.paymentMethod === 'nagad'}
                                onChange={handleInputChange}
                              />
                              <span className="pay-badge nagad-badge">Nagad</span>
                              <div>
                                <strong>Nagad Send Money</strong>
                                <span className="pay-sub">Mobile payment</span>
                              </div>
                            </label>

                            <label className={`payment-option ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}>
                              <input 
                                type="radio" 
                                name="paymentMethod" 
                                value="cod" 
                                checked={formData.paymentMethod === 'cod'}
                                onChange={handleInputChange}
                              />
                              <span className="pay-badge cod-badge">Cash on Delivery</span>
                              <div>
                                <strong>Cash on Delivery (COD)</strong>
                                <span className="pay-sub">Pay courier cash upon delivery</span>
                              </div>
                            </label>
                          </div>

                          {(formData.paymentMethod === 'bkash' || formData.paymentMethod === 'nagad') && (
                            <div className="mobile-banking-notice">
                              <p>
                                Send <strong>৳{grandTotal}</strong> to Official Number: 
                                <strong style={{ color: 'var(--accent)', marginLeft: '6px' }}>01847-334827</strong>
                              </p>
                              <input 
                                type="text" 
                                name="trxId"
                                placeholder="Enter TrxID / Sender Phone (Optional)"
                                value={formData.trxId}
                                onChange={handleInputChange}
                                style={{ marginTop: '8px' }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Right: Order Summary Breakdown Card */}
                        <div className="step3-summary-col">
                          <div className="step3-summary-card">
                            <h4 className="summary-card-title">Order Breakdown</h4>
                            
                            <div className="summary-card-item">
                              <div 
                                className="summary-item-swatch" 
                                style={{ 
                                  background: selectedVariant.cardImage 
                                    ? `url(${selectedVariant.cardImage}) center/cover no-repeat` 
                                    : selectedVariant.cardBg 
                                }} 
                              />
                              <div>
                                <h5>{selectedVariant.name}</h5>
                                <span>Name: <strong>{formData.customNameOnCard || cardName}</strong></span>
                                <span style={{ display: 'block' }}>Role: {formData.customRoleOnCard || cardTitle}</span>
                              </div>
                            </div>

                            <div className="price-breakdown-list">
                              <div className="price-line">
                                <span>Card Price ({quantity}x)</span>
                                <span>৳{subtotal}</span>
                              </div>
                              {discountAmount > 0 && (
                                <div className="price-line discount-line">
                                  <span>Ambassador Discount (10%)</span>
                                  <span>- ৳{discountAmount}</span>
                                </div>
                              )}
                              <div className="price-line">
                                <span>Courier Delivery ({formData.district})</span>
                                <span>৳{deliveryCharge}</span>
                              </div>
                              <div className="price-divider" />
                              <div className="price-line grand-total-line">
                                <span>Total Payable:</span>
                                <span className="grand-price">৳{grandTotal}</span>
                              </div>
                            </div>

                            <div className="delivery-summary-mini">
                              <span>📍 Deliver to: <strong>{formData.fullName}</strong>, {formData.district}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Step 3 Actions */}
                      <div className="wizard-nav-actions dual-actions">
                        <button 
                          type="button" 
                          onClick={prevStep}
                          className="btn btn-outline wizard-back-btn"
                        >
                          <span>Back to Step 2</span>
                        </button>
                        <button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="btn btn-primary wizard-submit-btn"
                        >
                          {isSubmitting ? (
                            <>
                              <RefreshCw size={18} className="spin-icon" />
                              <span>Completing Order...</span>
                            </>
                          ) : (
                            <>
                              <Lock size={18} />
                              <span>Complete Order & Confirm • ৳{grandTotal}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>

      {/* =========================================================================
          REVIEWS & TESTIMONIALS
          ========================================================================= */}
      <section className="nfc-reviews-section">
        <div className="container">
          <div className="section-header-center">
            <span className="sub-badge">COMMUNITY PRAISE</span>
            <h2 className="section-title">Loved by Innovators & Ambassadors</h2>
            <p className="section-subtitle">See how Skill Jobs NFC Cards are elevating careers across Bangladesh.</p>
          </div>

          <div className="nfc-reviews-grid">
            {reviewsList.map((rev, index) => (
              <div key={rev.id || index} className="nfc-review-card">
                <div className="review-card-top-accent" />
                
                <div className="review-card-top-row">
                  <div className="review-stars-wrapper">
                    <div className="review-stars">
                      {[...Array(Number(rev.rating) || 5)].map((_, i) => (
                        <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>
                    <span className="review-rating-number">{(Number(rev.rating) || 5).toFixed(1)}</span>
                  </div>
                  <Quote size={26} className="review-quote-watermark" />
                </div>

                <p className="review-comment">"{rev.comment}"</p>

                <div className="review-footer-row">
                  <div className="review-author">
                    <div className="review-avatar-wrap">
                      <img 
                        src={rev.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} 
                        alt={rev.name} 
                        className="review-avatar"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
                        }}
                      />
                      <span className="avatar-verified-dot" title="Verified NFC Owner" />
                    </div>
                    <div>
                      <h5 className="review-name">{rev.name}</h5>
                      <span className="review-role">{rev.role}</span>
                    </div>
                  </div>

                  <span className="review-verified-pill">
                    <ShieldCheck size={12} />
                    <span>Verified NFC</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          FINAL BOTTOM CTA PROMOTIONAL BANNER
          ========================================================================= */}
      <section className="nfc-bottom-cta-section">
        <div className="container">
          <div className="nfc-bottom-cta-card">
            <div className="bottom-cta-glow" />
            <div className="bottom-cta-content">
              <span className="sub-badge">LIMITED TIME 50% OFF</span>
              <h2 className="bottom-cta-title">
                Ready to Never Hand Out a Paper Card Again?
              </h2>
              <p className="bottom-cta-subtitle">
                Join thousands of modern students, engineers, founders, and ambassadors making unforgettable first impressions.
              </p>
              <div className="bottom-cta-btn-row">
                <button onClick={() => openOrderModal()} className="btn btn-primary nfc-cta-primary">
                  <ShoppingCart size={18} />
                  <span>Claim 50% Off & Order Your NFC Card</span>
                  <ArrowRight size={18} />
                </button>
                <Link to="/ambassador" className="btn btn-outline" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                  <Award size={18} />
                  <span>Join as Ambassador</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BuyNFC;

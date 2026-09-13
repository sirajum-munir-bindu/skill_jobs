// NFC Smart Cards shared storage & server synchronization utility
import { API_BASE_URL } from '../config/api';

let cachedNfcCards = null;
let cachedNfcReviews = null;
let isFetchingCards = false;
let isFetchingReviews = false;

export const DEFAULT_NFC_CARDS = [
  {
    id: 'matte-black',
    name: 'Obsidian Matte Black',
    badge: 'Most Popular',
    theme: 'dark',
    cardBg: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #030712 100%)',
    textColor: '#ffffff',
    accentColor: '#38bdf8',
    texture: 'matte',
    material: 'Premium Matte Finish PVC',
    price: 499,
    originalPrice: 999,
    discount: '50% OFF',
    nfcColor: '#38bdf8',
    chipFinish: 'gold'
  },
  {
    id: 'cyber-cyan',
    name: 'Skill Jobs Cyber Sky',
    badge: 'Brand Edition',
    theme: 'blue',
    cardBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 40%, #082f49 100%)',
    textColor: '#ffffff',
    accentColor: '#38bdf8',
    texture: 'gloss',
    material: 'High-Gloss Scratchproof PVC',
    price: 549,
    originalPrice: 1099,
    discount: '50% OFF',
    nfcColor: '#e0f2fe',
    chipFinish: 'silver'
  },
  {
    id: 'executive-gold',
    name: 'Executive 24K Gold',
    badge: 'Luxury Tier',
    theme: 'gold',
    cardBg: 'linear-gradient(135deg, #78350f 0%, #b45309 40%, #d97706 70%, #451a03 100%)',
    textColor: '#fef3c7',
    accentColor: '#fbbf24',
    texture: 'metallic',
    material: 'Brushed Golden Metal Finish',
    price: 899,
    originalPrice: 1799,
    discount: '50% OFF',
    nfcColor: '#fef08a',
    chipFinish: 'gold'
  },
  {
    id: 'titanium-silver',
    name: 'Platinum Titanium Metal',
    badge: 'Heavyweight',
    theme: 'silver',
    cardBg: 'linear-gradient(135deg, #334155 0%, #64748b 45%, #1e293b 80%, #0f172a 100%)',
    textColor: '#f8fafc',
    accentColor: '#94a3b8',
    texture: 'metal',
    material: 'Laser-Engraved Stainless Steel (25g)',
    price: 1399,
    originalPrice: 2799,
    discount: '50% OFF',
    nfcColor: '#cbd5e1',
    chipFinish: 'silver'
  },
  {
    id: 'pearl-white',
    name: 'Minimalist Pearl White',
    badge: 'Clean Modern',
    theme: 'light',
    cardBg: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 60%, #e2e8f0 100%)',
    textColor: '#0f172a',
    accentColor: '#0284c7',
    texture: 'pearl',
    material: 'Ultra-Smooth Frosted PVC',
    price: 499,
    originalPrice: 999,
    discount: '50% OFF',
    nfcColor: '#0284c7',
    chipFinish: 'gold'
  }
];

export const PRESET_THEMES = [
  {
    name: 'Obsidian Black',
    cardBg: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #030712 100%)',
    textColor: '#ffffff',
    accentColor: '#38bdf8',
    nfcColor: '#38bdf8',
    chipFinish: 'gold'
  },
  {
    name: 'Cyber Sky',
    cardBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 40%, #082f49 100%)',
    textColor: '#ffffff',
    accentColor: '#38bdf8',
    nfcColor: '#e0f2fe',
    chipFinish: 'silver'
  },
  {
    name: '24K Luxury Gold',
    cardBg: 'linear-gradient(135deg, #78350f 0%, #b45309 40%, #d97706 70%, #451a03 100%)',
    textColor: '#fef3c7',
    accentColor: '#fbbf24',
    nfcColor: '#fef08a',
    chipFinish: 'gold'
  },
  {
    name: 'Platinum Titanium',
    cardBg: 'linear-gradient(135deg, #334155 0%, #64748b 45%, #1e293b 80%, #0f172a 100%)',
    textColor: '#f8fafc',
    accentColor: '#94a3b8',
    nfcColor: '#cbd5e1',
    chipFinish: 'silver'
  },
  {
    name: 'Pearl White',
    cardBg: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 60%, #e2e8f0 100%)',
    textColor: '#0f172a',
    accentColor: '#0284c7',
    nfcColor: '#0284c7',
    chipFinish: 'gold'
  },
  {
    name: 'Emerald Luxury',
    cardBg: 'linear-gradient(135deg, #064e3b 0%, #047857 45%, #022c22 100%)',
    textColor: '#ffffff',
    accentColor: '#34d399',
    nfcColor: '#6ee7b7',
    chipFinish: 'gold'
  },
  {
    name: 'Royal Amethyst',
    cardBg: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 45%, #2e1065 100%)',
    textColor: '#ffffff',
    accentColor: '#c084fc',
    nfcColor: '#e9d5ff',
    chipFinish: 'silver'
  },
  {
    name: 'Rose Gold Elite',
    cardBg: 'linear-gradient(135deg, #881337 0%, #be123c 45%, #e11d48 70%, #4c0519 100%)',
    textColor: '#fff1f2',
    accentColor: '#fb7185',
    nfcColor: '#fecdd3',
    chipFinish: 'gold'
  },
  {
    name: 'Midnight Navy',
    cardBg: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #172554 100%)',
    textColor: '#ffffff',
    accentColor: '#60a5fa',
    nfcColor: '#93c5fd',
    chipFinish: 'silver'
  },
  {
    name: 'Crimson Velvet',
    cardBg: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #450a0a 100%)',
    textColor: '#ffffff',
    accentColor: '#f87171',
    nfcColor: '#fca5a5',
    chipFinish: 'gold'
  }
];

export const getNfcCards = () => {
  if (Array.isArray(cachedNfcCards) && cachedNfcCards.length > 0) {
    return cachedNfcCards;
  }
  try {
    const saved = localStorage.getItem('nfc_custom_cards');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedNfcCards = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load NFC cards from storage:', err);
  }
  return DEFAULT_NFC_CARDS;
};

export const fetchNfcCards = async () => {
  if (isFetchingCards) {
    return getNfcCards();
  }
  isFetchingCards = true;
  try {
    const res = await fetch(`${API_BASE_URL}/api/configs`);
    if (res.ok) {
      const data = await res.json();
      const localSaved = localStorage.getItem('nfc_custom_cards');
      let localParsed = null;
      try {
        if (localSaved) localParsed = JSON.parse(localSaved);
      } catch {}

      if (Array.isArray(data?.nfcCards) && data.nfcCards.length > 0) {
        // If local storage has custom cards that differ from defaults and server only has defaults, push local up
        const isLocalCustomized = Array.isArray(localParsed) && localParsed.some(c => 
          !DEFAULT_NFC_CARDS.some(d => d.id === c.id && d.name === c.name && d.price === c.price)
        );
        const isServerOnlyDefaults = data.nfcCards.length === DEFAULT_NFC_CARDS.length &&
          data.nfcCards.every((c, i) => c.id === DEFAULT_NFC_CARDS[i]?.id && c.name === DEFAULT_NFC_CARDS[i]?.name);

        if (isLocalCustomized && isServerOnlyDefaults) {
          saveNfcCards(localParsed);
          return localParsed;
        }

        cachedNfcCards = data.nfcCards;
        try {
          localStorage.setItem('nfc_custom_cards', JSON.stringify(data.nfcCards));
        } catch {}
        window.dispatchEvent(new CustomEvent('nfc_cards_updated', { detail: data.nfcCards }));
        return data.nfcCards;
      } else if (Array.isArray(localParsed) && localParsed.length > 0) {
        saveNfcCards(localParsed);
        return localParsed;
      }
    }
  } catch (err) {
    console.error('Failed to fetch NFC cards from server:', err);
  } finally {
    isFetchingCards = false;
  }
  return getNfcCards();
};

export const saveNfcCards = (cards) => {
  cachedNfcCards = cards;
  try {
    localStorage.setItem('nfc_custom_cards', JSON.stringify(cards));
    window.dispatchEvent(new CustomEvent('nfc_cards_updated', { detail: cards }));
  } catch (err) {
    console.error('Failed to save NFC cards to storage:', err);
  }

  // Persist to backend database for all browsers
  fetch(`${API_BASE_URL}/api/configs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: 'nfcCards', value: cards })
  }).catch(err => {
    console.error('Failed to persist NFC cards to server database:', err);
  });
};

export const addNfcCard = (cardData) => {
  const current = getNfcCards();
  const id = cardData.id || `nfc-card-${Date.now()}`;
  const newCard = { ...cardData, id };
  const updated = [...current, newCard];
  saveNfcCards(updated);
  return updated;
};

export const updateNfcCard = (cardId, updatedData) => {
  const current = getNfcCards();
  const updated = current.map(c => (c.id === cardId ? { ...c, ...updatedData } : c));
  saveNfcCards(updated);
  return updated;
};

export const deleteNfcCard = (cardId) => {
  const current = getNfcCards();
  const updated = current.filter(c => c.id !== cardId);
  saveNfcCards(updated);
  return updated;
};

// =========================================================================
// NFC Card Holder Reviews / Community Testimonials
// =========================================================================

export const DEFAULT_NFC_REVIEWS = [
  {
    id: 'rev-1',
    name: 'Tanvir Ahmed',
    role: 'Campus Ambassador Lead, DU',
    rating: 5,
    comment: "This NFC card is a total game changer during tech summits and career fairs! I just tap my card to a recruiter's iPhone and boom—my resume and GitHub profile open instantly.",
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'rev-2',
    name: 'Sabbir Hossain',
    role: 'Full-Stack Software Engineer',
    rating: 5,
    comment: 'The Obsidian Black finish looks ultra-premium. Everyone I meet is amazed when they see their phone open my portfolio with just one physical tap. Worth every single taka!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'rev-3',
    name: 'Nusrat Jahan',
    role: 'UI/UX Product Designer',
    rating: 5,
    comment: 'No more carrying stacks of paper cards that get thrown away. Being able to update my portfolio links anytime from the dashboard is incredible.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    createdAt: new Date().toISOString()
  }
];

export const getNfcReviews = () => {
  if (Array.isArray(cachedNfcReviews) && cachedNfcReviews.length > 0) {
    return cachedNfcReviews;
  }
  try {
    const saved = localStorage.getItem('nfc_custom_reviews');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedNfcReviews = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load NFC reviews from storage:', err);
  }
  return DEFAULT_NFC_REVIEWS;
};

export const fetchNfcReviews = async () => {
  if (isFetchingReviews) {
    return getNfcReviews();
  }
  isFetchingReviews = true;
  try {
    const res = await fetch(`${API_BASE_URL}/api/configs`);
    if (res.ok) {
      const data = await res.json();
      const localSaved = localStorage.getItem('nfc_custom_reviews');
      let localParsed = null;
      try {
        if (localSaved) localParsed = JSON.parse(localSaved);
      } catch {}

      if (Array.isArray(data?.nfcReviews) && data.nfcReviews.length > 0) {
        cachedNfcReviews = data.nfcReviews;
        try {
          localStorage.setItem('nfc_custom_reviews', JSON.stringify(data.nfcReviews));
        } catch {}
        window.dispatchEvent(new CustomEvent('nfc_reviews_updated', { detail: data.nfcReviews }));
        return data.nfcReviews;
      } else if (Array.isArray(localParsed) && localParsed.length > 0) {
        saveNfcReviews(localParsed);
        return localParsed;
      }
    }
  } catch (err) {
    console.error('Failed to fetch NFC reviews from server:', err);
  } finally {
    isFetchingReviews = false;
  }
  return getNfcReviews();
};

export const saveNfcReviews = (reviews) => {
  cachedNfcReviews = reviews;
  try {
    localStorage.setItem('nfc_custom_reviews', JSON.stringify(reviews));
    window.dispatchEvent(new CustomEvent('nfc_reviews_updated', { detail: reviews }));
  } catch (err) {
    console.error('Failed to save NFC reviews to storage:', err);
  }

  fetch(`${API_BASE_URL}/api/configs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: 'nfcReviews', value: reviews })
  }).catch(err => {
    console.error('Failed to persist NFC reviews to server database:', err);
  });
};

export const addNfcReview = (reviewData) => {
  const current = getNfcReviews();
  const id = reviewData.id || `nfc-rev-${Date.now()}`;
  const newRev = { ...reviewData, id, createdAt: new Date().toISOString() };
  const updated = [newRev, ...current];
  saveNfcReviews(updated);
  return updated;
};

export const updateNfcReview = (revId, updatedData) => {
  const current = getNfcReviews();
  const updated = current.map(r => (r.id === revId ? { ...r, ...updatedData } : r));
  saveNfcReviews(updated);
  return updated;
};

export const deleteNfcReview = (revId) => {
  const current = getNfcReviews();
  const updated = current.filter(r => r.id !== revId);
  saveNfcReviews(updated);
  return updated;
};


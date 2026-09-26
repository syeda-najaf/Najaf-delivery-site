import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom';

import RealDeliveryMap from './components/RealDeliveryMap';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import {
  createCodOrder,
  fetchMyOrders,
  geocodeAddress,
  reverseGeocode,
  sendOrderConfirmation,
  upsertProfile,
} from './lib/api';

/* ============================================================
   CITY DATASET
   ============================================================ */

const CITIES = {
  bengaluru: {
    id: 'bengaluru',
    name: 'Bengaluru',
    short: 'BLR',
    tagline: "India's food-lab capital",
    currency: '₹',
    center: { lat: 12.9716, lng: 77.5946 },
    defaultZone: 'Kodihalli',
    areas: ['Kodihalli', 'Indiranagar', 'Koramangala', 'HSR Layout', 'Whitefield', 'Jayanagar'],
    etaBase: 22,
    deliveryFee: 39,
    freeAbove: 699,
    menu: [
      { id: 'blr-1', name: 'Midnight Truffle', category: 'Pizza', price: 449, rating: 4.9, time: 24, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1200&q=88', tone: 'violet', desc: 'Smoked mozzarella, truffle cream, roasted mushroom.' },
      { id: 'blr-2', name: 'NOVA Smash', category: 'Burgers', price: 329, rating: 4.8, time: 19, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=88', tone: 'lime', desc: 'Double seared patty, house sauce, crisp lettuce.' },
      { id: 'blr-3', name: 'Meteor Fries', category: 'Sides', price: 189, rating: 4.7, time: 16, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=88', tone: 'amber', desc: 'Crisp fries, smoked salt, signature neon dip.' },
      { id: 'blr-4', name: 'Saffron Cloud', category: 'Rice', price: 389, rating: 4.9, time: 27, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=88', tone: 'cyan', desc: 'Long-grain rice, saffron, roasted vegetables.' },
      { id: 'blr-5', name: 'Tandoori Halo', category: 'Wraps', price: 279, rating: 4.8, time: 21, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=1200&q=88', tone: 'coral', desc: 'Charred paneer, mint crema, pickled onion.' },
      { id: 'blr-6', name: 'Galaxy Momo', category: 'Snacks', price: 239, rating: 4.9, time: 18, image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=1200&q=88', tone: 'blue', desc: 'Steamed momos, chili crunch, sesame glaze.' },
      { id: 'blr-7', name: 'Lunar Ramen', category: 'Noodles', price: 419, rating: 4.8, time: 25, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=88', tone: 'indigo', desc: 'Silky broth, noodles, corn, scallion, chili oil.' },
      { id: 'blr-8', name: 'Comet Shake', category: 'Drinks', price: 219, rating: 4.7, time: 12, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=1200&q=88', tone: 'pink', desc: 'Vanilla cream, berry ripple, chilled sparkle.' },
      { id: 'blr-9', name: 'Orbit Tacos', category: 'Mexican', price: 299, rating: 4.8, time: 20, image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1200&q=88', tone: 'orange', desc: 'Crisp shell, smoky beans, salsa verde.' },
      { id: 'blr-10', name: 'Nebula Brownie', category: 'Desserts', price: 199, rating: 4.9, time: 14, image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7?auto=format&fit=crop&w=1200&q=88', tone: 'plum', desc: 'Fudgy brownie, sea salt, warm chocolate center.' },
    ],
    restaurants: [
      { id: 'blr-n1', name: 'NOVA KITCHEN', cuisine: 'Modern Indian · Bowls · Wraps', rating: 4.9, time: '18–24 min', tag: 'TRENDING', color: 'violet', initials: 'NK', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1100&q=88' },
      { id: 'blr-n2', name: 'MOON & MINT', cuisine: 'Asian · Ramen · Dumplings', rating: 4.8, time: '22–28 min', tag: 'FAST', color: 'lime', initials: 'MM', image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1100&q=88' },
      { id: 'blr-n3', name: 'ORBIT BURGER LAB', cuisine: 'Smash burgers · Fries · Shakes', rating: 4.7, time: '16–22 min', tag: 'CROWD PICK', color: 'cyan', initials: 'OB', image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1100&q=88' },
      { id: 'blr-n4', name: 'SAFFRON THEORY', cuisine: 'Biryani · Rice · Grill', rating: 4.9, time: '25–31 min', tag: 'NEW', color: 'amber', initials: 'ST', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1100&q=88' },
      { id: 'blr-n5', name: 'LANTERN TACO CLUB', cuisine: 'Mexican · Street food', rating: 4.8, time: '20–27 min', tag: 'HOT', color: 'coral', initials: 'LT', image: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=1100&q=88' },
      { id: 'blr-n6', name: 'SWEET ORBIT', cuisine: 'Desserts · Shakes · Coffee', rating: 4.7, time: '12–18 min', tag: 'LATE NIGHT', color: 'pink', initials: 'SO', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1100&q=88' },
    ],
    offers: [
      { id: 'BLR100', title: 'BLR100', detail: '₹100 off above ₹499', accent: 'violet' },
      { id: 'NIGHT20', title: 'NIGHT20', detail: '20% off after 9 PM', accent: 'cyan' },
      { id: 'FIRSTBITE', title: 'FIRSTBITE', detail: '20% off first order', accent: 'lime' },
      { id: 'FAMILY250', title: 'FAMILY250', detail: '₹250 off above ₹1299', accent: 'amber' },
    ],
    hero: {
      headline: 'Bengaluru after dark hits different.',
      sub: "Late-night truffle pizza, filter-coffee shakes and the city's best smash burgers — routed to your door in under 30.",
    },
  },

  mumbai: {
    id: 'mumbai',
    name: 'Mumbai',
    short: 'BOM',
    tagline: 'The city that never sleeps on flavour',
    currency: '₹',
    center: { lat: 19.076, lng: 72.8777 },
    defaultZone: 'Bandra West',
    areas: ['Bandra West', 'Andheri', 'Juhu', 'Lower Parel', 'Colaba', 'Powai'],
    etaBase: 28,
    deliveryFee: 49,
    freeAbove: 799,
    menu: [
      { id: 'bom-1', name: 'Vada Pav Royale', category: 'Street', price: 149, rating: 4.9, time: 14, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1200&q=88', tone: 'amber', desc: 'Crisp batata, garlic chutney, buttered pav.' },
      { id: 'bom-2', name: 'Bombay Burger', category: 'Burgers', price: 359, rating: 4.8, time: 21, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=88', tone: 'lime', desc: 'Spiced patty, schezwan mayo, fried onions.' },
      { id: 'bom-3', name: 'Pav Bhaji Comet', category: 'Street', price: 229, rating: 4.9, time: 18, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1200&q=88', tone: 'coral', desc: 'Butter-loaded bhaji, toasted pav, lime.' },
      { id: 'bom-4', name: 'Biryani Nebula', category: 'Biryani', price: 429, rating: 4.9, time: 30, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=88', tone: 'violet', desc: 'Dum-cooked basmati, saffron, fried onion.' },
      { id: 'bom-5', name: 'Frankie Wrap', category: 'Wraps', price: 199, rating: 4.7, time: 16, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=1200&q=88', tone: 'cyan', desc: 'Tangy masala, crunchy veg, soft roll.' },
      { id: 'bom-6', name: 'Bhel Blast', category: 'Snacks', price: 129, rating: 4.8, time: 10, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1200&q=88', tone: 'orange', desc: 'Puffed rice, chutneys, sev, coriander.' },
      { id: 'bom-7', name: 'Coastal Ramen', category: 'Noodles', price: 449, rating: 4.8, time: 27, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=88', tone: 'indigo', desc: 'Coconut broth, prawn, chili oil, lime.' },
      { id: 'bom-8', name: 'Kala Khatta Shake', category: 'Drinks', price: 199, rating: 4.7, time: 12, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=1200&q=88', tone: 'pink', desc: 'Tangy berry, chaat masala, chilled cream.' },
      { id: 'bom-9', name: 'Bombay Taco', category: 'Mexican', price: 319, rating: 4.8, time: 22, image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1200&q=88', tone: 'orange', desc: 'Fusion filling, salsa, house slaw.' },
      { id: 'bom-10', name: 'Kulfi Cosmos', category: 'Desserts', price: 179, rating: 4.9, time: 14, image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7?auto=format&fit=crop&w=1200&q=88', tone: 'plum', desc: 'Slow-cooked kulfi, pistachio, rose.' },
    ],
    restaurants: [
      { id: 'bom-n1', name: 'BANDRA BOWL CO.', cuisine: 'Modern Indian · Bowls', rating: 4.9, time: '20–26 min', tag: 'TRENDING', color: 'violet', initials: 'BB', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1100&q=88' },
      { id: 'bom-n2', name: 'COLABA CURRY LAB', cuisine: 'Coastal · Curry · Rice', rating: 4.8, time: '26–33 min', tag: 'FAST', color: 'lime', initials: 'CC', image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1100&q=88' },
      { id: 'bom-n3', name: 'ANDHERI SMASH', cuisine: 'Burgers · Fries', rating: 4.7, time: '18–24 min', tag: 'CROWD PICK', color: 'cyan', initials: 'AS', image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1100&q=88' },
      { id: 'bom-n4', name: 'JUHU BIRYANI HOUSE', cuisine: 'Biryani · Kebabs · Grill', rating: 4.9, time: '28–35 min', tag: 'NEW', color: 'amber', initials: 'JB', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1100&q=88' },
      { id: 'bom-n5', name: 'POWAI TACO BAR', cuisine: 'Mexican · Fusion', rating: 4.8, time: '24–30 min', tag: 'HOT', color: 'coral', initials: 'PT', image: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=1100&q=88' },
      { id: 'bom-n6', name: 'MARINE SWEETS', cuisine: 'Desserts · Kulfi · Coffee', rating: 4.7, time: '14–20 min', tag: 'LATE NIGHT', color: 'pink', initials: 'MS', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1100&q=88' },
    ],
    offers: [
      { id: 'MUM100', title: 'MUM100', detail: '₹100 off above ₹499', accent: 'violet' },
      { id: 'LOCAL20', title: 'LOCAL20', detail: '20% off Local train hours', accent: 'cyan' },
      { id: 'FIRSTBITE', title: 'FIRSTBITE', detail: '20% off first order', accent: 'lime' },
      { id: 'FAMILY300', title: 'FAMILY300', detail: '₹300 off above ₹1499', accent: 'amber' },
    ],
    hero: {
      headline: 'Mumbai moves fast. So does dinner.',
      sub: 'Vada pav at 2 AM, coastal ramen on a Tuesday, kulfi whenever you want it — routed across the city.',
    },
  },

  delhi: {
    id: 'delhi',
    name: 'Delhi NCR',
    short: 'DEL',
    tagline: 'Where kebabs and chaos share a plate',
    currency: '₹',
    center: { lat: 28.6139, lng: 77.209 },
    defaultZone: 'Hauz Khas',
    areas: ['Hauz Khas', 'Saket', 'Gurgaon', 'Noida', 'Connaught Place', 'Dwarka'],
    etaBase: 26,
    deliveryFee: 45,
    freeAbove: 749,
    menu: [
      { id: 'del-1', name: 'Butter Chicken Pizza', category: 'Pizza', price: 469, rating: 4.9, time: 26, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1200&q=88', tone: 'violet', desc: 'Tandoori chicken, makhani base, mozzarella.' },
      { id: 'del-2', name: 'Galouti Burger', category: 'Burgers', price: 379, rating: 4.9, time: 22, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=88', tone: 'lime', desc: 'Melt-in-mouth kebab patty, mint chutney.' },
      { id: 'del-3', name: 'Chaat Nebula', category: 'Street', price: 169, rating: 4.8, time: 13, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1200&q=88', tone: 'amber', desc: 'Papdi, yogurt, chutneys, pomegranate.' },
      { id: 'del-4', name: 'Dum Biryani Supreme', category: 'Biryani', price: 439, rating: 4.9, time: 30, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=88', tone: 'coral', desc: 'Awadhi dum biryani, saffron, mint.' },
      { id: 'del-5', name: 'Kathi Roll Co.', category: 'Wraps', price: 219, rating: 4.8, time: 17, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=1200&q=88', tone: 'cyan', desc: 'Egg-wrapped paratha, chicken tikka, onion.' },
      { id: 'del-6', name: 'Samosa Rocket', category: 'Snacks', price: 129, rating: 4.7, time: 11, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1200&q=88', tone: 'orange', desc: 'Crisp samosa, spicy chole, chutney.' },
      { id: 'del-7', name: 'Butter Ramen', category: 'Noodles', price: 429, rating: 4.8, time: 27, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=88', tone: 'indigo', desc: 'Tomato broth, butter chicken, noodles.' },
      { id: 'del-8', name: 'Lassi Orbit', category: 'Drinks', price: 179, rating: 4.8, time: 10, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=1200&q=88', tone: 'pink', desc: 'Thick lassi, mango or rose, pistachio.' },
      { id: 'del-9', name: 'Tandoori Taco', category: 'Mexican', price: 329, rating: 4.8, time: 21, image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1200&q=88', tone: 'orange', desc: 'Tandoori chicken, mint crema, salsa.' },
      { id: 'del-10', name: 'Gulab Cheesecake', category: 'Desserts', price: 219, rating: 4.9, time: 15, image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7?auto=format&fit=crop&w=1200&q=88', tone: 'plum', desc: 'Gulab jamun, cheesecake, rose syrup.' },
    ],
    restaurants: [
      { id: 'del-n1', name: 'HAUZ KHAS HOUSE', cuisine: 'Mughlai · Kebab · Curry', rating: 4.9, time: '22–28 min', tag: 'TRENDING', color: 'violet', initials: 'HH', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1100&q=88' },
      { id: 'del-n2', name: 'SAKET SPICE LAB', cuisine: 'North Indian · Tandoor', rating: 4.8, time: '26–32 min', tag: 'FAST', color: 'lime', initials: 'SS', image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1100&q=88' },
      { id: 'del-n3', name: 'CP BURGER BAR', cuisine: 'Burgers · Fries · Shakes', rating: 4.7, time: '18–24 min', tag: 'CROWD PICK', color: 'cyan', initials: 'CB', image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1100&q=88' },
      { id: 'del-n4', name: 'PURANI DILLI BIRYANI', cuisine: 'Biryani · Kebabs', rating: 4.9, time: '28–34 min', tag: 'NEW', color: 'amber', initials: 'PD', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1100&q=88' },
      { id: 'del-n5', name: 'GURGAON TACO WORKS', cuisine: 'Mexican · Fusion', rating: 4.8, time: '24–30 min', tag: 'HOT', color: 'coral', initials: 'GT', image: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=1100&q=88' },
      { id: 'del-n6', name: 'MITHAS DELIGHTS', cuisine: 'Desserts · Lassi · Coffee', rating: 4.7, time: '14–20 min', tag: 'LATE NIGHT', color: 'pink', initials: 'MD', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1100&q=88' },
    ],
    offers: [
      { id: 'DEL100', title: 'DEL100', detail: '₹100 off above ₹499', accent: 'violet' },
      { id: 'NIZAMI20', title: 'NIZAMI20', detail: '20% off Nizami hours', accent: 'cyan' },
      { id: 'FIRSTBITE', title: 'FIRSTBITE', detail: '20% off first order', accent: 'lime' },
      { id: 'KEBAB250', title: 'KEBAB250', detail: '₹250 off above ₹1299', accent: 'amber' },
    ],
    hero: {
      headline: "Delhi doesn't do subtle. Nor does dinner.",
      sub: 'Butter chicken pizza, galouti burgers, gulab cheesecake — routed across NCR in real time.',
    },
  },

  hyderabad: {
    id: 'hyderabad',
    name: 'Hyderabad',
    short: 'HYD',
    tagline: 'Biryani is a birthright',
    currency: '₹',
    center: { lat: 17.385, lng: 78.4867 },
    defaultZone: 'Banjara Hills',
    areas: ['Banjara Hills', 'Jubilee Hills', 'Gachibowli', 'Madhapur', 'Kondapur', 'Hitech City'],
    etaBase: 24,
    deliveryFee: 39,
    freeAbove: 699,
    menu: [
      { id: 'hyd-1', name: 'Hyderabadi Dum Pizza', category: 'Pizza', price: 459, rating: 4.9, time: 25, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1200&q=88', tone: 'violet', desc: 'Dum-spiced chicken, saffron, mint.' },
      { id: 'hyd-2', name: 'Charminar Burger', category: 'Burgers', price: 349, rating: 4.8, time: 20, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=88', tone: 'lime', desc: 'Spiced patty, mint mayo, fried onions.' },
      { id: 'hyd-3', name: 'Mirchi Bajji Rockets', category: 'Snacks', price: 139, rating: 4.9, time: 12, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1200&q=88', tone: 'amber', desc: 'Stuffed mirchi, tamarind, onion.' },
      { id: 'hyd-4', name: 'Paradise Biryani', category: 'Biryani', price: 429, rating: 5.0, time: 28, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=88', tone: 'coral', desc: 'Kacchi dum biryani, saffron, mirchi ka salan.' },
      { id: 'hyd-5', name: 'Irani Roll Co.', category: 'Wraps', price: 209, rating: 4.8, time: 16, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=1200&q=88', tone: 'cyan', desc: 'Irani chai–marinated chicken, paratha.' },
      { id: 'hyd-6', name: 'Osmania Biscuit Stack', category: 'Desserts', price: 149, rating: 4.7, time: 10, image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7?auto=format&fit=crop&w=1200&q=88', tone: 'plum', desc: 'Buttery biscuits, chai dip, pistachio.' },
      { id: 'hyd-7', name: 'Haleem Ramen', category: 'Noodles', price: 449, rating: 4.9, time: 27, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=88', tone: 'indigo', desc: 'Haleem broth, wheat noodles, ghee, mint.' },
      { id: 'hyd-8', name: 'Irani Chai Shake', category: 'Drinks', price: 189, rating: 4.8, time: 11, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=1200&q=88', tone: 'pink', desc: 'Chai, cream, spice, chilled.' },
      { id: 'hyd-9', name: 'Deccan Taco', category: 'Mexican', price: 309, rating: 4.8, time: 21, image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1200&q=88', tone: 'orange', desc: 'Keema filling, mint crema, salsa.' },
      { id: 'hyd-10', name: 'Double Ka Meetha', category: 'Desserts', price: 189, rating: 4.9, time: 14, image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7?auto=format&fit=crop&w=1200&q=88', tone: 'plum', desc: 'Bread pudding, saffron milk, dry fruit.' },
    ],
    restaurants: [
      { id: 'hyd-n1', name: 'BANJARA BIRYANI HOUSE', cuisine: 'Hyderabadi · Biryani · Kebab', rating: 5.0, time: '20–26 min', tag: 'TRENDING', color: 'violet', initials: 'BB', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1100&q=88' },
      { id: 'hyd-n2', name: 'GACHIBOWLI GRILL', cuisine: 'Kebabs · Tandoor · Curry', rating: 4.8, time: '24–30 min', tag: 'FAST', color: 'lime', initials: 'GG', image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1100&q=88' },
      { id: 'hyd-n3', name: 'HITECH BURGER LAB', cuisine: 'Burgers · Fries · Shakes', rating: 4.7, time: '18–24 min', tag: 'CROWD PICK', color: 'cyan', initials: 'HB', image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1100&q=88' },
      { id: 'hyd-n4', name: 'CHARMINAR DUM CO.', cuisine: 'Biryani · Haleem · Kebabs', rating: 4.9, time: '26–32 min', tag: 'NEW', color: 'amber', initials: 'CC', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1100&q=88' },
      { id: 'hyd-n5', name: 'JUBILEE TACO CLUB', cuisine: 'Mexican · Fusion', rating: 4.8, time: '22–28 min', tag: 'HOT', color: 'coral', initials: 'JT', image: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=1100&q=88' },
      { id: 'hyd-n6', name: 'IRANI CAFÉ', cuisine: 'Chai · Biscuits · Desserts', rating: 4.8, time: '12–18 min', tag: 'LATE NIGHT', color: 'pink', initials: 'IC', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1100&q=88' },
    ],
    offers: [
      { id: 'HYD100', title: 'HYD100', detail: '₹100 off above ₹499', accent: 'violet' },
      { id: 'BIRYANI20', title: 'BIRYANI20', detail: '20% off any biryani', accent: 'cyan' },
      { id: 'FIRSTBITE', title: 'FIRSTBITE', detail: '20% off first order', accent: 'lime' },
      { id: 'DUM250', title: 'DUM250', detail: '₹250 off above ₹1299', accent: 'amber' },
    ],
    hero: {
      headline: 'Hyderabad runs on biryani time.',
      sub: 'Dum-cooked, saffron-laced, mirchi ka salan on the side — routed from the Old City to your door.',
    },
  },

  chennai: {
    id: 'chennai',
    name: 'Chennai',
    short: 'MAA',
    tagline: 'Filter coffee and fire',
    currency: '₹',
    center: { lat: 13.0827, lng: 80.2707 },
    defaultZone: 'Adyar',
    areas: ['Adyar', 'T. Nagar', 'Anna Nagar', 'Velachery', 'OMR', 'Mylapore'],
    etaBase: 23,
    deliveryFee: 39,
    freeAbove: 699,
    menu: [
      { id: 'maa-1', name: 'Chettinad Pizza', category: 'Pizza', price: 449, rating: 4.9, time: 24, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1200&q=88', tone: 'violet', desc: 'Chettinad chicken, curry leaf, mozzarella.' },
      { id: 'maa-2', name: 'Madras Burger', category: 'Burgers', price: 339, rating: 4.8, time: 19, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=88', tone: 'lime', desc: 'Spiced patty, coconut chutney mayo.' },
      { id: 'maa-3', name: 'Podhi Fries', category: 'Sides', price: 179, rating: 4.8, time: 14, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=88', tone: 'amber', desc: 'Crisp fries, idli podi, ghee.' },
      { id: 'maa-4', name: 'Ambur Biryani', category: 'Biryani', price: 399, rating: 4.9, time: 26, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=88', tone: 'coral', desc: 'Seeraga samba rice, short-bite chicken.' },
      { id: 'maa-5', name: 'Kothu Parotta', category: 'Wraps', price: 249, rating: 4.9, time: 18, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=1200&q=88', tone: 'cyan', desc: 'Shredded parotta, egg, salna.' },
      { id: 'maa-6', name: 'Bajji Comet', category: 'Snacks', price: 149, rating: 4.8, time: 11, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1200&q=88', tone: 'orange', desc: 'Mixed veg bajji, coconut chutney.' },
      { id: 'maa-7', name: 'Rasam Ramen', category: 'Noodles', price: 419, rating: 4.8, time: 26, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=88', tone: 'indigo', desc: 'Rasam broth, noodles, curry leaf, ghee.' },
      { id: 'maa-8', name: 'Filter Coffee Shake', category: 'Drinks', price: 189, rating: 4.9, time: 11, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=1200&q=88', tone: 'pink', desc: 'Strong filter coffee, cream, ice.' },
      { id: 'maa-9', name: 'Marina Taco', category: 'Mexican', price: 299, rating: 4.8, time: 20, image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1200&q=88', tone: 'orange', desc: 'Fish filling, coconut salsa, lime.' },
      { id: 'maa-10', name: 'Payasam Cosmos', category: 'Desserts', price: 169, rating: 4.9, time: 13, image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7?auto=format&fit=crop&w=1200&q=88', tone: 'plum', desc: 'Semiya payasam, cashew, cardamom.' },
    ],
    restaurants: [
      { id: 'maa-n1', name: 'ADYAR KITCHEN CO.', cuisine: 'South Indian · Tiffin', rating: 4.9, time: '18–24 min', tag: 'TRENDING', color: 'violet', initials: 'AK', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1100&q=88' },
      { id: 'maa-n2', name: 'MYLAPORE MESS', cuisine: 'Chettinad · Rice · Curry', rating: 4.9, time: '22–28 min', tag: 'FAST', color: 'lime', initials: 'MM', image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1100&q=88' },
      { id: 'maa-n3', name: 'ANNA NAGAR SMASH', cuisine: 'Burgers · Fries', rating: 4.7, time: '16–22 min', tag: 'CROWD PICK', color: 'cyan', initials: 'AN', image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1100&q=88' },
      { id: 'maa-n4', name: 'AMBUR BIRYANI HOUSE', cuisine: 'Biryani · Grill', rating: 4.9, time: '24–30 min', tag: 'NEW', color: 'amber', initials: 'AB', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1100&q=88' },
      { id: 'maa-n5', name: 'OMR TACO CO.', cuisine: 'Mexican · Fusion', rating: 4.8, time: '20–26 min', tag: 'HOT', color: 'coral', initials: 'OT', image: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=1100&q=88' },
      { id: 'maa-n6', name: 'KAAFI KADAI', cuisine: 'Coffee · Desserts', rating: 4.8, time: '12–18 min', tag: 'LATE NIGHT', color: 'pink', initials: 'KK', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1100&q=88' },
    ],
    offers: [
      { id: 'MAA100', title: 'MAA100', detail: '₹100 off above ₹499', accent: 'violet' },
      { id: 'KAAFI20', title: 'KAAFI20', detail: '20% off coffee hours', accent: 'cyan' },
      { id: 'FIRSTBITE', title: 'FIRSTBITE', detail: '20% off first order', accent: 'lime' },
      { id: 'FAMILY250', title: 'FAMILY250', detail: '₹250 off above ₹1299', accent: 'amber' },
    ],
    hero: {
      headline: "Chennai doesn't rush. Except dinner.",
      sub: 'Chettinad pizza, Ambur biryani, filter-coffee shakes — routed across the city in real time.',
    },
  },
};

const DEFAULT_CITY = 'bengaluru';

const TRACK_STEPS = [
  { title: 'Order confirmed', meta: 'Kitchen accepted your order', icon: '✓' },
  { title: 'Being prepared', meta: 'Chef is plating your food', icon: '◒' },
  { title: 'Rider en route', meta: 'Ayaan is heading your way', icon: '⌁' },
  { title: 'At your door', meta: 'Delivery handoff', icon: '⌂' },
];

/* ============================================================
   Helpers
   ============================================================ */

const money = (n, city) => {
  const symbol = CITIES[city?.id]?.currency || '₹';
  return `${symbol}${Number(n || 0).toLocaleString('en-IN')}`;
};

const readStorage = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
};

const saveStorage = (key, value) =>
  localStorage.setItem(key, JSON.stringify(value));

/**
 * Central billing calculator
 * returns { subtotal, delivery, packaging, gst, discount, total }
 */
function computeBill(cart, city, offerCode) {
  const subtotal = (cart || []).reduce(
    (s, i) => s + Number(i.price) * Number(i.quantity),
    0
  );

  const delivery =
    subtotal === 0 || subtotal >= city.freeAbove ? 0 : city.deliveryFee;

  const packaging = subtotal > 0 ? 20 : 0;

  // GST 5% on food subtotal (standard for India food delivery)
  const gst = subtotal > 0 ? Math.round(subtotal * 0.05) : 0;

  let discount = 0;
  if (offerCode && subtotal > 0) {
    const code = String(offerCode).trim().toUpperCase();
    const valid = city.offers.some((o) => o.id.toUpperCase() === code);
    if (valid) {
      if (code.includes('250') || code.startsWith('FAMILY')) {
        if (subtotal >= 1299) discount = 250;
      } else if (code.includes('300')) {
        if (subtotal >= 1499) discount = 300;
      } else if (code.includes('100')) {
        if (subtotal >= 499) discount = 100;
      } else if (code.includes('20')) {
        discount = Math.round(subtotal * 0.2);
      }
    }
  }

  const total = Math.max(
    0,
    subtotal + delivery + packaging + gst - discount
  );

  return { subtotal, delivery, packaging, gst, discount, total };
}

function distanceKm(a, b) {
  if (!a || !b) return Infinity;
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function nearestCity(coords) {
  if (!coords || !Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) {
    return DEFAULT_CITY;
  }
  let best = DEFAULT_CITY;
  let bestDist = Infinity;
  Object.values(CITIES).forEach((city) => {
    const d = distanceKm(coords, city.center);
    if (d < bestDist) {
      bestDist = d;
      best = city.id;
    }
  });
  return best;
}

function matchArea(city, label) {
  if (!city || !label) return null;
  const lower = label.toLowerCase();
  return (
    city.areas.find((a) => lower.includes(a.toLowerCase())) ||
    city.areas.find((a) =>
      a.toLowerCase().includes(lower.split(',')[0].trim())
    ) ||
    null
  );
}

function normalizeOrder(row) {
  const snapshot = row?.address_snapshot || {};
  const items = (row?.order_items || []).map((item) => ({
    id: item.menu_item_id,
    name: item.name,
    price: Number(item.unit_price),
    quantity: Number(item.quantity),
    category: '',
    desc: '',
  }));

  const statusLabels = {
    payment_pending: 'Payment pending',
    confirmed: 'Order confirmed',
    preparing: 'Being prepared',
    out_for_delivery: 'Out for delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  return {
    ...row,
    items,
    address: snapshot.text || 'Delivery address',
    total: Number(row.total || 0),
    subtotal: Number(row.subtotal || 0),
    delivery: Number(row.delivery_fee || 0),
    packaging: Number(row.packaging || 0),
    gst: Number(row.gst || 0),
    discount: Number(row.discount || 0),
    status: statusLabels[row.status] || row.status,
    rawStatus: row.status,
    payment:
      row.payment_status === 'captured'
        ? 'Online payment'
        : 'Cash on delivery',
    eta: row.eta_minutes ? `${row.eta_minutes} min` : '—',
    rider: row.rider_name || 'Ayaan',
    placedAt: row.created_at,
    city: row.city || snapshot.city_id || DEFAULT_CITY,
    lat: snapshot.lat ?? null,
    lng: snapshot.lng ?? null,
    rider_lat: row.rider_lat ?? null,
    rider_lng: row.rider_lng ?? null,
    rider_phone: row.rider_phone ?? null,
  };
}

/* ============================================================
   Icon
   ============================================================ */

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  const paths = {
    search: (
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="7.2" r="3.2" />
        <path d="M5.5 20c.7-3.4 3-5.2 6.5-5.2s5.8 1.8 6.5 5.2" />
      </>
    ),
    cart: (
      <>
        <path d="M4 5h2l1.3 8.2a2 2 0 0 0 2 1.7h7.8a2 2 0 0 0 1.9-1.4L20 8H7" />
        <circle cx="10" cy="19" r="1.3" />
        <circle cx="17" cy="19" r="1.3" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h13" />
        <path d="m13 7 5 5-5 5" />
      </>
    ),
    pin: (
      <>
        <path d="M12 21s6-6.1 6-11A6 6 0 0 0 6 10c0 4.9 6 11 6 11Z" />
        <circle cx="12" cy="10" r="2" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 1.6 5.2L19 10l-5.4 1.8L12 17l-1.6-5.2L5 10l5.4-1.8Z" />
        <path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18Z" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12" />
        <path d="m18 6-12 12" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    check: <path d="m5 12 4 4L19 6" />,
    lock: (
      <>
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    map: (
      <>
        <path d="M4 6.5 9 4l6 2.5L20 4v13.5l-5 2.5-6-2.5-5 2.5Z" />
        <path d="M9 4v13.5M15 6.5V20" />
      </>
    ),
    grid: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </>
    ),
    alert: (
      <>
        <path d="M12 3 21 19H3L12 3Z" />
        <path d="M12 9v4" />
        <path d="M12 16h.01" />
      </>
    ),
    crosshair: (
      <>
        <circle cx="12" cy="12" r="7" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        <circle cx="12" cy="12" r="2" />
      </>
    ),
    google: (
      <>
        <path
          d="M21.6 12.227c0-.709-.064-1.39-.182-2.045H12v3.868h5.382a4.6 4.6 0 0 1-1.996 3.018v2.51h3.232c1.891-1.74 2.982-4.305 2.982-7.351Z"
          fill="#4285F4"
          stroke="none"
        />
        <path
          d="M12 22c2.7 0 4.964-.895 6.618-2.422l-3.232-2.51c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.598-4.123H3.064v2.59A9.996 9.996 0 0 0 12 22Z"
          fill="#34A853"
          stroke="none"
        />
        <path
          d="M6.402 13.9A6.005 6.005 0 0 1 6.09 12c0-.66.113-1.302.313-1.9V7.51H3.064A9.996 9.996 0 0 0 2 12c0 1.614.386 3.14 1.064 4.49l3.338-2.59Z"
          fill="#FBBC05"
          stroke="none"
        />
        <path
          d="M12 5.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C16.96 2.99 14.7 2 12 2A9.996 9.996 0 0 0 3.064 7.51l3.338 2.59C7.19 7.737 9.395 5.977 12 5.977Z"
          fill="#EA4335"
          stroke="none"
        />
      </>
    ),
    logout: (
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="m16 17 5-5-5-5" />
        <path d="M21 12H9" />
      </>
    ),
  };

  return <svg {...common}>{paths[name] || paths.search}</svg>;
}

/* ============================================================
   Location context
   ============================================================ */

const CityContext = React.createContext(null);

const GEO_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 0,
};

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation not supported in this browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      (err) => reject(err),
      GEO_OPTIONS
    );
  });
}

function CityProvider({ children }) {
  const [coords, setCoords] = useState(() =>
    readStorage('najaf_coords', null)
  );
  const [accuracy, setAccuracy] = useState(null);
  const [cityId, setCityId] = useState(
    () => localStorage.getItem('najaf_city') || DEFAULT_CITY
  );
  const [area, setArea] = useState(
    () => localStorage.getItem('najaf_area') || ''
  );
  const [address, setAddress] = useState(
    () => localStorage.getItem('najaf_location') || ''
  );
  const [permission, setPermission] = useState('unknown');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);

  const city = CITIES[cityId] || CITIES[DEFAULT_CITY];

  useEffect(() => {
    localStorage.setItem('najaf_city', cityId);
  }, [cityId]);
  useEffect(() => {
    if (area) localStorage.setItem('najaf_area', area);
  }, [area]);
  useEffect(() => {
    if (address) localStorage.setItem('najaf_location', address);
  }, [address]);
  useEffect(() => {
    if (coords) saveStorage('najaf_coords', coords);
  }, [coords]);

  const applyCoords = async (nextCoords) => {
    setCoords(nextCoords);
    const nextCityId = nearestCity(nextCoords);
    setCityId(nextCityId);

    try {
      const label = await reverseGeocode({
        lat: nextCoords.lat,
        lng: nextCoords.lng,
      });

      const finalLabel =
        typeof label === 'string'
          ? label
          : typeof label === 'object' && label
          ? label.label || label.address || label.formatted || null
          : null;

      if (finalLabel) {
        setAddress(finalLabel);
        const matched = matchArea(CITIES[nextCityId], finalLabel);
        if (matched) setArea(matched);
      } else if (!address) {
        setAddress(
          `${CITIES[nextCityId].defaultZone}, ${CITIES[nextCityId].name}`
        );
      }
    } catch (err) {
      console.warn('Reverse geocode failed:', err);
      if (!address) {
        setAddress(
          `${CITIES[nextCityId].defaultZone}, ${CITIES[nextCityId].name}`
        );
      }
    }
  };

  const detectLocation = async ({ silent = false } = {}) => {
    if (!('geolocation' in navigator)) {
      setPermission('unsupported');
      setError('Geolocation is not supported by this browser.');
      if (!silent && !address) {
        setAddress(`${city.defaultZone}, ${city.name}`);
        setArea(city.defaultZone);
      }
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const pos = await getCurrentPosition();
      const next = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      setAccuracy(pos.coords.accuracy ?? null);
      setPermission('granted');
      await applyCoords(next);
      setLoading(false);
      return next;
    } catch (err) {
      setLoading(false);
      if (err.code === 1) {
        setPermission('denied');
        setError(
          'Location permission denied. Please allow location access.'
        );
      } else if (err.code === 2) {
        setPermission('unavailable');
        setError('Location unavailable. Check GPS or network.');
      } else if (err.code === 3) {
        setPermission('timeout');
        setError('Location request timed out. Try again.');
      } else {
        setError(err.message || 'Could not get your location.');
      }
      if (!silent && !address) {
        setAddress(`${city.defaultZone}, ${city.name}`);
        setArea(city.defaultZone);
      }
      return null;
    }
  };

  const startWatching = () => {
    if (!('geolocation' in navigator)) return;
    if (watchIdRef.current != null) return;
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const next = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setAccuracy(pos.coords.accuracy ?? null);
        setCoords(next);
        const nextCityId = nearestCity(next);
        if (nextCityId !== cityId) setCityId(nextCityId);
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 }
    );
  };

  const stopWatching = () => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  useEffect(() => {
    detectLocation({ silent: true }).then(() => startWatching());
    return () => stopWatching();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (permission === 'denied' || permission === 'unsupported') {
      stopWatching();
    }
  }, [permission]);

  const setManualCity = (id, nextArea) => {
    if (!CITIES[id]) return;
    setCityId(id);
    const fallbackArea = nextArea || CITIES[id].defaultZone;
    setArea(fallbackArea);
    if (!address) setAddress(`${fallbackArea}, ${CITIES[id].name}`);
  };

  const setManualAddress = (nextAddress, nextArea) => {
    setAddress(nextAddress);
    if (nextArea) setArea(nextArea);
  };

  const value = useMemo(
    () => ({
      city,
      cityId,
      setManualCity,
      coords,
      accuracy,
      area: area || city.defaultZone,
      address: address || `${city.defaultZone}, ${city.name}`,
      setAddress: setManualAddress,
      setArea,
      detectLocation,
      permission,
      loading,
      error,
    }),
    [
      city,
      cityId,
      coords,
      accuracy,
      area,
      address,
      permission,
      loading,
      error,
    ]
  );

  return (
    <CityContext.Provider value={value}>{children}</CityContext.Provider>
  );
}

const useCity = () => React.useContext(CityContext);

/* ============================================================
   App root — session fix + realtime orders + route guards
   ============================================================ */

function App() {
  const [cart, setCart] = useState(() =>
    readStorage('najaf_cart', [])
  );
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    saveStorage('najaf_cart', cart);
  }, [cart]);

  /* Auth bootstrap with stale-session cleanup */
  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return undefined;
    }

    let active = true;

    const bootstrap = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();

        if (sessionData?.session) {
          const { data: userData, error: userError } =
            await supabase.auth.getUser();

          if (userError || !userData?.user) {
            await supabase.auth.signOut();
            if (active) {
              setUser(null);
              setAuthLoading(false);
            }
            return;
          }

          if (active) setUser(userData.user);
        } else {
          if (active) setUser(null);
        }
      } catch (err) {
        console.warn('Auth bootstrap failed:', err);
        if (active) setUser(null);
      } finally {
        if (active) setAuthLoading(false);
      }
    };

    bootstrap();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!active) return;
        setUser(session?.user || null);
        setAuthLoading(false);
      }
    );

    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  /* Realtime orders */
  useEffect(() => {
    if (!supabase || !user?.id) {
      setOrders([]);
      return undefined;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const rows = await fetchMyOrders();
        if (!cancelled) setOrders(rows.map(normalizeOrder));
      } catch (error) {
        if (!cancelled) {
          setToast({
            type: 'error',
            title: 'Could not load orders',
            text: error.message,
          });
        }
      }
    };

    load();

    const channel = supabase
      .channel(`najaf-orders-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          load();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const addToCart = (item, quantity = 1) => {
    setCart((current) => {
      const found = current.find((entry) => entry.id === item.id);
      if (found) {
        return current.map((entry) =>
          entry.id === item.id
            ? { ...entry, quantity: entry.quantity + quantity }
            : entry
        );
      }
      return [...current, { ...item, quantity }];
    });
    setToast({
      type: 'success',
      title: 'Added to order',
      text: `${item.name} is in your bag.`,
    });
  };

  const updateQty = (id, delta) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => setCart([]);

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setOrders([]);
    setModal(null);
    setToast({
      type: 'info',
      title: 'Signed out',
      text: 'Your secure session has ended.',
    });
  };

  if (authLoading) {
    return (
      <CityProvider>
        <div className="nova-app boot-screen">
          <Ambient />
          <div className="boot-card">
            <span className="boot-pulse" />
            <strong>Connecting to NAJAF cloud…</strong>
            <small>Authenticating session and opening live services.</small>
          </div>
        </div>
      </CityProvider>
    );
  }

  return (
    <CityProvider>
      <Shell
        cart={cart}
        user={user}
        orders={orders}
        toast={toast}
        setToast={setToast}
        modal={modal}
        setModal={setModal}
        addToCart={addToCart}
        updateQty={updateQty}
        clearCart={clearCart}
        signOut={signOut}
      />
    </CityProvider>
  );
}

function Shell({
  cart,
  user,
  orders,
  toast,
  setToast,
  modal,
  setModal,
  addToCart,
  updateQty,
  clearCart,
  signOut,
}) {
  const { city, cityId } = useCity();

  return (
    <div className="nova-app">
      <Ambient />

      <Header
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        user={user}
        setModal={setModal}
      />

      <main>
        {!isSupabaseConfigured && (
          <div className="config-banner page-shell">
            <strong>Live services are one setup step away.</strong>
            <span>
              Add Supabase and Mapbox environment variables from{' '}
              <code>.env.example</code>.
            </span>
            <Link to="/auth">Open account setup</Link>
          </div>
        )}

        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route
            path="/home"
            element={
              <HomePage addToCart={addToCart} setModal={setModal} />
            }
          />
          <Route path="/menu" element={<MenuPage addToCart={addToCart} />} />
          <Route path="/restaurants" element={<RestaurantsPage />} />
          <Route path="/offers" element={<OffersPage setToast={setToast} />} />
          <Route
            path="/cart"
            element={
              <CartPage
                cart={cart}
                updateQty={updateQty}
                clearCart={clearCart}
              />
            }
          />

          <Route
            path="/checkout"
            element={
              user ? (
                <CheckoutPage
                  cart={cart}
                  user={user}
                  clearCart={clearCart}
                  setToast={setToast}
                />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          <Route
            path="/auth"
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <AuthPage setToast={setToast} />
              )
            }
          />

          <Route
            path="/profile"
            element={
              user ? (
                <ProfilePage
                  user={user}
                  signOut={signOut}
                  setToast={setToast}
                />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          <Route
            path="/orders"
            element={
              user ? (
                <OrdersPage orders={orders} />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          <Route
            path="/tracking/:id"
            element={<TrackingPage orders={orders} />}
          />
          <Route
            path="/map/:id"
            element={<DeliveryMapPage orders={orders} />}
          />
          <Route
            path="/success/:id"
            element={<SuccessPage orders={orders} />}
          />
          <Route
            path="/dashboard"
            element={
              <DashboardPage
                cart={cart}
                orders={orders}
                user={user}
              />
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer city={city} cityId={cityId} />

      {modal && <AppModal modal={modal} close={() => setModal(null)} />}
      {toast && <Toast {...toast} close={() => setToast(null)} />}
    </div>
  );
}

function Ambient() {
  return (
    <div className="ambient-layer" aria-hidden="true">
      <span className="orb orb-a" />
      <span className="orb orb-b" />
      <span className="grid-noise" />
    </div>
  );
}

function Header({ cartCount, user, setModal }) {
  const { city, area, loading, permission, accuracy } = useCity();
  const [mobileOpen, setMobileOpen] = useState(false);
  const locationLabel = area || city.defaultZone;

  const accuracyLabel =
    accuracy && Number.isFinite(accuracy)
      ? `±${Math.round(accuracy)}m`
      : 'live';

  const avatarLetter = (
    user?.user_metadata?.full_name ||
    user?.email ||
    'G'
  )
    .charAt(0)
    .toUpperCase();

  const googleAvatar = user?.user_metadata?.avatar_url;

  return (
    <header className="site-header">
      <div className="top-strip">
        <div>
          <span className="live-dot" /> Live kitchen network{' '}
          <span className="top-muted">•</span> {city.name}
        </div>
        <div className="top-links">
          <span>{city.tagline}</span>
          <span>ETA ~{city.etaBase} min</span>
          <span>Free above {money(city.freeAbove, city)}</span>
        </div>
      </div>

      <div className="nav-shell">
        <Link to="/home" className="brand-lockup">
          <span className="brand-orbit">N</span>
          <span>
            <strong>NAJAF</strong>
            <small>NOVA FOOD PLATFORM</small>
          </span>
        </Link>

        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Open navigation"
        >
          <Icon name={mobileOpen ? 'close' : 'menu'} />
        </button>

        <nav className={`main-nav ${mobileOpen ? 'open' : ''}`}>
          {[
            ['/home', 'Home'],
            ['/menu', 'Menu'],
            ['/restaurants', 'Kitchens'],
            ['/offers', 'Offers'],
            ['/orders', 'Orders'],
            ['/tracking/demo', 'Track'],
          ].map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <button
            className="icon-btn ghost"
            onClick={() => setModal({ type: 'search' })}
            aria-label="Search"
          >
            <Icon name="search" />
          </button>

          <button
            className="city-chip"
            onClick={() => setModal({ type: 'city' })}
            aria-label="Change city"
          >
            <span className="city-code">{city.short}</span>
            <span className="city-name">{city.name}</span>
          </button>

          <button
            className="location-chip"
            onClick={() => setModal({ type: 'location' })}
            aria-label="Change location"
            title={`${locationLabel} · GPS ${accuracyLabel}${
              permission === 'denied' ? ' (permission denied)' : ''
            }`}
          >
            <Icon name={loading ? 'clock' : 'pin'} />
            <span>{locationLabel}</span>
          </button>

          {user ? (
            <Link
              className="user-avatar-chip desktop-only"
              to="/profile"
              aria-label="Profile"
              title={user.user_metadata?.full_name || user.email}
            >
              {googleAvatar ? (
                <img
                  src={googleAvatar}
                  alt="avatar"
                  className="user-avatar-img"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="user-avatar-letter">{avatarLetter}</span>
              )}
            </Link>
          ) : (
            <Link
              className="google-mini-btn desktop-only"
              to="/auth"
              aria-label="Sign in with Google"
            >
              <Icon name="google" size={16} />
              <span>Sign in</span>
            </Link>
          )}

          <Link className="cart-bubble" to="/cart" aria-label="Cart">
            <Icon name="cart" />
            <span>{cartCount}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

function HomePage({ addToCart, setModal }) {
  const { city, area, address, detectLocation, accuracy, permission, error } =
    useCity();
  const [index, setIndex] = useState(0);

  const heroItems = useMemo(
    () => [city.menu[0], city.menu[1], city.menu[3]],
    [city]
  );

  useEffect(() => setIndex(0), [city.id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((v) => (v + 1) % heroItems.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [heroItems.length]);

  const hero = heroItems[index];

  return (
    <div>
      <section className="hero-shell page-shell">
        <div className="hero-copy">
          <div className="eyebrow">
            <span>{city.short}</span> {city.tagline}
          </div>

          <h1>
            {city.hero.headline.split('.')[0]}.
            <br />
            <em>{city.hero.headline.split('.')[1] || ''}</em>
          </h1>

          <p className="hero-lead">{city.hero.sub}</p>

          <div className="hero-ctas">
            <Link to="/menu" className="btn btn-primary">
              Explore {city.name} menu
              <Icon name="arrow" size={17} />
            </Link>
            <button
              className="btn btn-outline"
              onClick={() => detectLocation()}
            >
              <Icon name="crosshair" size={16} />
              Use my live location
            </button>
          </div>

          {error && (
            <div className="hero-alert">
              <Icon name="alert" size={15} />
              <span>{error}</span>
            </div>
          )}

          <div className="hero-meta">
            <span>
              <Icon name="clock" size={15} /> Avg. {city.etaBase} min in{' '}
              {city.name}
            </span>
            <span>
              <Icon name="pin" size={15} /> {area}
              {accuracy && Number.isFinite(accuracy)
                ? ` · ±${Math.round(accuracy)}m`
                : permission === 'denied'
                ? ' · permission denied'
                : ''}
            </span>
            <span>
              <Icon name="spark" size={15} /> {city.restaurants.length}{' '}
              kitchens live
            </span>
          </div>

          <div className="hero-address">{address}</div>
        </div>

        <div className="hero-stage">
          <div className="stage-frame">
            <div className="stage-top">
              <span>
                {city.short} / {String(index + 1).padStart(2, '0')}
              </span>
              <span>LIVE FEED</span>
            </div>

            <div className={`food-sphere tone-${hero.tone}`}>
              <div className="halo halo-1" />
              <div className="halo halo-2" />
              <img
                className="hero-food-photo"
                src={hero.image}
                alt={hero.name}
              />
            </div>

            <div className="stage-name">
              <span>{hero.category}</span>
              <strong>{hero.name}</strong>
              <small>{hero.desc}</small>
            </div>

            <div className="stage-price">
              {money(hero.price, city)} <span>/ plate</span>
            </div>

            <button
              className="stage-add"
              onClick={() => addToCart(hero)}
            >
              Add to cart
              <Icon name="arrow" size={16} />
            </button>

            <div className="stage-orbit" />
          </div>

          <div className="floating-stat stat-one">
            <small>DELIVERY</small>
            <strong>{hero.time}m</strong>
            <span>current ETA</span>
          </div>

          <div className="floating-stat stat-two">
            <small>YOU ARE</small>
            <strong>{area}</strong>
            <span>{city.name}</span>
          </div>
        </div>
      </section>

      <section className="signal-row page-shell">
        {[
          [
            '01',
            `${city.name} kitchens`,
            `${city.restaurants.length} curated partners live in your city right now.`,
          ],
          ['02', 'Live order logic', 'One screen for ETA, rider and route.'],
          [
            '03',
            `Free above ${money(city.freeAbove, city)}`,
            `Otherwise a flat ${money(
              city.deliveryFee,
              city
            )} across ${city.name}.`,
          ],
        ].map(([n, title, description]) => (
          <div className="signal-card" key={n}>
            <span>{n}</span>
            <div>
              <strong>{title}</strong>
              <p>{description}</p>
            </div>
            <Icon name="chevron" size={18} />
          </div>
        ))}
      </section>

      <section className="section page-shell">
        <SectionHead
          kicker={`Hot in ${city.name}`}
          title="Fast-moving favorites"
          link="/menu"
        />
        <div className="food-grid">
          {city.menu.slice(0, 6).map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              addToCart={addToCart}
              city={city}
            />
          ))}
        </div>
      </section>

      <section className="section page-shell split-banner">
        <div className="promo-panel promo-violet">
          <div className="promo-label">{city.short} SIGNAL / 24H</div>
          <h2>{city.hero.headline}</h2>
          <p>{city.hero.sub}</p>
          <Link to="/offers" className="mini-link">
            See {city.name} offers
            <Icon name="arrow" size={15} />
          </Link>
          <span className="promo-shape shape-a" />
          <span className="promo-shape shape-b" />
        </div>

        <div className="promo-panel promo-lime">
          <div className="promo-label">TRACKING / LIVE</div>
          <h2>Your order should never feel like a black box.</h2>
          <p>Follow prep status, rider position and handoff ETA on the map.</p>
          <Link to="/tracking/demo" className="mini-link">
            Open tracking
            <Icon name="arrow" size={15} />
          </Link>
          <div className="fake-route">
            <span className="route-line" />
            <span className="route-dot dot-a" />
            <span className="route-dot dot-b" />
            <span className="route-dot dot-c" />
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHead({ kicker, title, link }) {
  return (
    <div className="section-head">
      <div>
        <div className="section-kicker">{kicker}</div>
        <h2>{title}</h2>
      </div>
      {link && (
        <Link className="mini-link" to={link}>
          Open all
          <Icon name="arrow" size={15} />
        </Link>
      )}
    </div>
  );
}

function FoodCard({ item, addToCart, city }) {
  return (
    <article className="food-card">
      <div className={`food-visual tone-${item.tone}`}>
        <span className="visual-badge">{item.rating} ★</span>
        <img
          className="food-photo"
          src={item.image}
          alt={item.name}
          loading="lazy"
        />
        <span className="visual-time">
          <Icon name="clock" size={13} />
          {item.time}m
        </span>
      </div>
      <div className="food-card-body">
        <div className="food-cat">{item.category}</div>
        <h3>{item.name}</h3>
        <p>{item.desc}</p>
        <div className="food-card-foot">
          <strong>{money(item.price, city)}</strong>
          <button
            className="plus-btn"
            onClick={() => addToCart(item)}
            aria-label={`Add ${item.name}`}
          >
            +
          </button>
        </div>
      </div>
    </article>
  );
}

function MenuPage({ addToCart }) {
  const { city } = useCity();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const categories = useMemo(
    () => [
      'All',
      ...Array.from(new Set(city.menu.map((i) => i.category))),
    ],
    [city]
  );

  useEffect(() => {
    setCategory('All');
    setQuery('');
  }, [city.id]);

  const filtered = city.menu.filter(
    (item) =>
      (category === 'All' || item.category === category) &&
      `${item.name} ${item.desc}`
        .toLowerCase()
        .includes(query.toLowerCase())
  );

  return (
    <div className="page-shell page-top">
      <SectionHead
        kicker={`${city.name} menu`}
        title={`What ${city.name} is eating now.`}
      />

      <div className="toolbar">
        <label className="search-box">
          <Icon name="search" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${city.name} dishes...`}
          />
        </label>

        <div className="pill-row">
          {categories.map((item) => (
            <button
              key={item}
              className={`pill ${category === item ? 'selected' : ''}`}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {filtered.length ? (
        <div className="food-grid menu-grid">
          {filtered.map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              addToCart={addToCart}
              city={city}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nothing matched that craving."
          text="Try another dish, category or keyword."
          action="Reset filters"
          onAction={() => {
            setQuery('');
            setCategory('All');
          }}
        />
      )}
    </div>
  );
}

function RestaurantsPage() {
  const { city } = useCity();
  const [filter, setFilter] = useState('All');
  const tags = useMemo(
    () => [
      'All',
      ...Array.from(new Set(city.restaurants.map((r) => r.tag))),
    ],
    [city]
  );

  useEffect(() => setFilter('All'), [city.id]);

  const list =
    filter === 'All'
      ? city.restaurants
      : city.restaurants.filter((r) => r.tag === filter);

  return (
    <div className="page-shell page-top">
      <SectionHead
        kicker={`${city.name} network`}
        title={`Kitchens around ${city.name}.`}
      />

      <div className="pill-row standalone">
        {tags.map((tag) => (
          <button
            key={tag}
            className={`pill ${filter === tag ? 'selected' : ''}`}
            onClick={() => setFilter(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="restaurant-grid">
        {list.map((restaurant) => (
          <article className="restaurant-card" key={restaurant.id}>
            <div className={`restaurant-art tone-${restaurant.color}`}>
              <img
                src={restaurant.image}
                alt={restaurant.name}
                loading="lazy"
              />
              <span className="restaurant-monogram">
                {restaurant.initials}
              </span>
              <div className="art-ring" />
            </div>

            <div className="restaurant-body">
              <div className="restaurant-tag">{restaurant.tag}</div>
              <h3>{restaurant.name}</h3>
              <p>{restaurant.cuisine}</p>
              <div className="restaurant-meta">
                <span>★ {restaurant.rating}</span>
                <span>{restaurant.time}</span>
              </div>
              <Link className="btn btn-outline compact" to="/menu">
                Browse menu
                <Icon name="arrow" size={15} />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function OffersPage({ setToast }) {
  const { city } = useCity();
  const [copied, setCopied] = useState(null);

  const copy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopied(code);
    setToast({
      type: 'success',
      title: 'Code copied',
      text: `${code} is ready at checkout in ${city.name}.`,
    });
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div className="page-shell page-top">
      <SectionHead
        kicker={`${city.name} savings lab`}
        title={`Offers live in ${city.name}.`}
      />

      <div className="offers-grid">
        {city.offers.map((offer) => (
          <article
            key={offer.id}
            className={`offer-card tone-${offer.accent}`}
          >
            <div className="offer-orbit" />
            <span className="offer-label">{city.short} CODE</span>
            <strong>{offer.title}</strong>
            <p>{offer.detail}</p>
            <button
              className="btn btn-light"
              onClick={() => copy(offer.id)}
            >
              {copied === offer.id ? 'Copied' : 'Use code'}
              <Icon
                name={copied === offer.id ? 'check' : 'arrow'}
                size={15}
              />
            </button>
          </article>
        ))}
      </div>

      <div className="offer-note">
        <Icon name="spark" size={18} />
        <div>
          <strong>Offers apply at checkout in {city.name}.</strong>
          <p>
            Offers rotate by city, hour and order size. Rules are
            enforced on the server.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Cart with correct billing ---------- */
function CartPage({ cart, updateQty, clearCart }) {
  const { city } = useCity();
  const { subtotal, delivery, packaging, gst, total } = computeBill(
    cart,
    city
  );

  if (!cart.length) {
    return (
      <div className="page-shell page-top">
        <EmptyState
          title={`${city.name} is hungry.`}
          text="Pick something from the menu and it will appear here."
          action="Explore menu"
          to="/menu"
        />
      </div>
    );
  }

  return (
    <div className="page-shell page-top">
      <SectionHead
        kicker={`${city.name} order dock`}
        title={`${cart.reduce((s, i) => s + i.quantity, 0)} items ready.`}
      />

      <div className="cart-layout">
        <div className="cart-list">
          {cart.map((item) => (
            <div className="cart-line" key={item.id}>
              <div className={`cart-art tone-${item.tone}`}>
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                />
              </div>
              <div className="cart-main">
                <div className="food-cat">{item.category}</div>
                <h3>{item.name}</h3>
                <p>{item.desc}</p>
                <div className="qty-control">
                  <button onClick={() => updateQty(item.id, -1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, 1)}>+</button>
                </div>
              </div>
              <strong className="cart-price">
                {money(item.price * item.quantity, city)}
              </strong>
            </div>
          ))}
          <button className="text-button danger" onClick={clearCart}>
            Clear order
          </button>
        </div>

        <aside className="summary-card">
          <div className="summary-kicker">CHECKOUT PREVIEW</div>
          <h3>One final orbit.</h3>

          <div className="sum-row">
            <span>Items subtotal</span>
            <strong>{money(subtotal, city)}</strong>
          </div>
          <div className="sum-row">
            <span>Delivery ({city.short})</span>
            <strong>{delivery ? money(delivery, city) : 'FREE'}</strong>
          </div>
          <div className="sum-row">
            <span>Packaging</span>
            <strong>{money(packaging, city)}</strong>
          </div>
          <div className="sum-row">
            <span>GST (5%)</span>
            <strong>{money(gst, city)}</strong>
          </div>
          <div className="sum-row total">
            <span>Total</span>
            <strong>{money(total, city)}</strong>
          </div>

          <Link className="btn btn-primary wide" to="/checkout">
            Continue to checkout
            <Icon name="arrow" size={17} />
          </Link>
          <small className="secure-note">
            <Icon name="lock" size={13} /> Secure checkout in {city.name}
          </small>
        </aside>
      </div>
    </div>
  );
}

/* ---------- Checkout with correct billing + no login bounce ---------- */
function CheckoutPage({ cart, user, clearCart, setToast }) {
  const navigate = useNavigate();
  const {
    city,
    area,
    address,
    coords,
    accuracy,
    permission,
    detectLocation,
    setAddress,
  } = useCity();

  const [localAddress, setLocalAddress] = useState(address);
  const [notes, setNotes] = useState('');
  const [offerCode, setOfferCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    setLocalAddress(address);
  }, [address, city.id]);

  if (!cart.length) return <Navigate to="/cart" replace />;

  const { subtotal, delivery, packaging, gst, discount, total } =
    computeBill(cart, city, offerCode);

  const refreshLocation = async () => {
    setLocating(true);
    await detectLocation();
    setLocating(false);
  };

  const submit = async (event) => {
    event.preventDefault();

    if (!localAddress.trim()) {
      setToast({
        type: 'error',
        title: 'Delivery address required',
        text: 'Please enter your delivery address.',
      });
      return;
    }

    setBusy(true);

    try {
      let destination = coords;
      if (!destination) {
        try {
          destination = await geocodeAddress(localAddress);
        } catch (geoErr) {
          console.warn('Geocode fallback failed:', geoErr);
          destination = null;
        }
      }

      const items = cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const payload = {
        items,
        subtotal,
        delivery,
        packaging,
        gst,
        discount,
        total,
        offer_code: offerCode || null,
        address: localAddress,
        destination,
        city: city.id,
        cityName: city.name,
        area,
        notes,
        addressSnapshot: {
          text: localAddress,
          area,
          city: city.name,
          city_id: city.id,
          lat: destination?.lat ?? null,
          lng: destination?.lng ?? null,
          accuracy: accuracy ?? null,
          captured_at: new Date().toISOString(),
        },
      };

      const created = await createCodOrder(payload);
      const orderId =
        created?.dbOrderId || created?.id || created?.orderId;

      if (orderId) {
        try {
          const pending = readStorage('najaf_pending_orders', {});
          pending[orderId] = {
            id: orderId,
            items,
            subtotal,
            delivery,
            packaging,
            gst,
            discount,
            total,
            address: localAddress,
            area,
            city: city.id,
            cityName: city.name,
            lat: destination?.lat ?? null,
            lng: destination?.lng ?? null,
            accuracy: accuracy ?? null,
            createdAt: new Date().toISOString(),
          };
          saveStorage('najaf_pending_orders', pending);
        } catch (e) {
          console.warn('Could not persist pending order', e);
        }
      }

      try {
        await sendOrderConfirmation({
          to: user?.email,
          subject: `NAJAF ${city.name} Order Confirmed • ${orderId}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:24px">
              <h1>NAJAF ${city.name.toUpperCase()}</h1>
              <h2>Order confirmed 🎉</h2>
              <p>Order: <strong>${orderId}</strong></p>
              <p>City: <strong>${city.name}</strong></p>
              <p>Area: ${area}</p>
              <p>Payment: <strong>Cash on Delivery</strong></p>
              <p>Delivery address: ${localAddress}</p>
              <p>Total: <strong>${money(total, city)}</strong></p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Confirmation email failed:', emailError);
      }

      clearCart();
      setToast({
        type: 'success',
        title: 'Order confirmed',
        text: `${orderId} is now live in ${city.name}.`,
      });

      navigate(`/success/${orderId}`, { replace: true });
    } catch (error) {
      setToast({
        type: 'error',
        title: 'Checkout unavailable',
        text: error.message || 'Could not create your order.',
      });
    } finally {
      setBusy(false);
    }
  };

  const gpsReady = Boolean(coords);
  const gpsLabel = gpsReady
    ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(
        4
      )}${accuracy ? ` · ±${Math.round(accuracy)}m` : ''}`
    : permission === 'denied'
    ? 'Permission denied'
    : 'Not captured yet';

  return (
    <div className="page-shell page-top">
      <SectionHead
        kicker={`${city.name} checkout`}
        title="Confirm the handoff."
      />

      <form className="checkout-grid" onSubmit={submit}>
        <div className="checkout-main">
          <div className="checkout-card">
            <div className="form-title">
              01 / delivery in {city.name}
            </div>

            <div className="gps-row">
              <span className={`gps-dot ${gpsReady ? 'live' : ''}`} />
              <div className="gps-copy">
                <strong>
                  {gpsReady ? 'Live GPS captured' : 'Waiting for GPS'}
                </strong>
                <small>{gpsLabel}</small>
              </div>
              <button
                type="button"
                className="btn btn-outline compact"
                onClick={refreshLocation}
                disabled={locating}
              >
                <Icon name="crosshair" size={15} />
                {locating ? 'Locating…' : 'Refresh'}
              </button>
            </div>

            <label>
              Delivery address
              <input
                value={localAddress}
                onChange={(e) => setLocalAddress(e.target.value)}
                required
              />
            </label>

            <div className="address-grid">
              <button type="button" className="address-tile selected">
                <Icon name="pin" />
                <div>
                  <strong>Current address</strong>
                  <small>{localAddress}</small>
                </div>
                <Icon name="check" size={15} />
              </button>

              {city.areas.slice(0, 3).map((areaName) => (
                <button
                  key={areaName}
                  type="button"
                  className="address-tile"
                  onClick={() => {
                    const next = `${areaName}, ${city.name}`;
                    setLocalAddress(next);
                    setAddress(next, areaName);
                  }}
                >
                  <Icon name="map" />
                  <div>
                    <strong>Use {areaName}</strong>
                    <small>{city.name} zone</small>
                  </div>
                </button>
              ))}
            </div>

            <label>
              Notes for the kitchen
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ring the bell, no spicy, etc."
                rows={3}
              />
            </label>
          </div>

          <div className="checkout-card">
            <div className="form-title">02 / payment</div>
            <div className="payment-grid">
              <button
                type="button"
                className="payment-option selected"
              >
                <span className="payment-mark">COD</span>
                <strong>Cash on delivery</strong>
                <small>Selected</small>
              </button>
            </div>
            <p className="payment-note">
              Pay when your {city.name} order arrives. No online payment
              required.
            </p>
          </div>

          <div className="checkout-card">
            <div className="form-title">03 / offer code</div>
            <label>
              Promo code (optional)
              <input
                value={offerCode}
                onChange={(e) => setOfferCode(e.target.value.toUpperCase())}
                placeholder="e.g. BLR100"
              />
            </label>
            {discount > 0 && (
              <p className="payment-note">
                Offer applied — saving {money(discount, city)}
              </p>
            )}
          </div>

          <div className="checkout-card reassurance">
            <Icon name="lock" />
            <div>
              <strong>Secure {city.name} order</strong>
              <p>
                Your account and order are secured through Supabase. COD
                keeps online payment details out of checkout.
              </p>
            </div>
          </div>
        </div>

        <aside className="summary-card sticky">
          <div className="summary-kicker">
            FINAL TOTAL · {city.short}
          </div>

          <div className="sum-row">
            <span>Items subtotal</span>
            <strong>{money(subtotal, city)}</strong>
          </div>
          <div className="sum-row">
            <span>Delivery</span>
            <strong>{delivery ? money(delivery, city) : 'FREE'}</strong>
          </div>
          <div className="sum-row">
            <span>Packaging</span>
            <strong>{money(packaging, city)}</strong>
          </div>
          <div className="sum-row">
            <span>GST (5%)</span>
            <strong>{money(gst, city)}</strong>
          </div>
          {discount > 0 && (
            <div className="sum-row">
              <span>Discount</span>
              <strong>−{money(discount, city)}</strong>
            </div>
          )}
          <div className="sum-row total">
            <span>Pay on delivery</span>
            <strong>{money(total, city)}</strong>
          </div>

          <div className="zone-preview small">
            <span className="live-dot" />
            <div>
              <strong>
                {area}, {city.name}
              </strong>
              <small>
                {gpsReady
                  ? `Routed from GPS ${coords.lat.toFixed(
                      4
                    )}, ${coords.lng.toFixed(4)}`
                  : 'Using typed address only.'}
              </small>
            </div>
          </div>

          <button
            className="btn btn-primary wide"
            type="submit"
            disabled={busy}
          >
            {busy
              ? 'Confirming order…'
              : `Confirm COD order in ${city.name}`}
            <Icon name="arrow" size={17} />
          </button>

          <small className="secure-note">
            Signed in as {user?.email}
          </small>
        </aside>
      </form>
    </div>
  );
}

/* ---------- AuthPage with Google ---------- */
function AuthPage({ setToast }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  if (!supabase) {
    return (
      <div className="auth-shell page-shell">
        <div className="auth-art">
          <div className="auth-copy">
            <div className="eyebrow">
              <span>SETUP</span> secure accounts
            </div>
            <h1>Connect the real account layer.</h1>
            <p>
              Add Supabase URL + publishable key to <code>.env</code> to
              activate live sign-in.
            </p>
          </div>
        </div>
        <div className="auth-panel">
          <div className="config-panel">
            <strong>Supabase is not connected yet.</strong>
            <p>
              Use <code>supabase/schema.sql</code> then add the two
              browser variables from <code>.env.example</code>.
            </p>
            <a
              className="btn btn-primary wide"
              href="https://supabase.com"
              target="_blank"
              rel="noreferrer"
            >
              Open Supabase
            </a>
          </div>
        </div>
      </div>
    );
  }

  const signInWithGoogle = async () => {
    setGoogleBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (error) throw error;
    } catch (error) {
      setGoogleBusy(false);
      setToast({
        type: 'error',
        title: 'Google sign-in failed',
        text: error.message,
      });
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        if (!data.session) {
          setToast({
            type: 'success',
            title: 'Check your inbox',
            text: 'Confirm your email before signing in.',
          });
          return;
        }
      } else {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
        if (error) throw error;
        if (!data.session?.user) throw new Error('Session not created.');
      }

      setToast({
        type: 'success',
        title: mode === 'signup' ? 'Account created' : 'Signed in',
        text: 'Your NAJAF account is connected.',
      });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setToast({
        type: 'error',
        title: 'Authentication failed',
        text: error.message,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell page-shell">
      <div className="auth-art">
        <div className="auth-copy">
          <div className="eyebrow">
            <span>00</span> live member access
          </div>
          <h1>
            Your food world, <em>with a real account.</em>
          </h1>
          <p>Sessions, orders and location live in Supabase.</p>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-tabs">
          <button
            type="button"
            className={mode === 'signin' ? 'active' : ''}
            onClick={() => setMode('signin')}
          >
            Sign in
          </button>
          <button
            type="button"
            className={mode === 'signup' ? 'active' : ''}
            onClick={() => setMode('signup')}
          >
            Create account
          </button>
        </div>

        <button
          type="button"
          className="google-button"
          onClick={signInWithGoogle}
          disabled={googleBusy}
        >
          <Icon name="google" size={18} />
          {googleBusy ? 'Opening Google…' : 'Continue with Google'}
        </button>

        <div className="auth-divider">
          <span>or continue with email</span>
        </div>

        <form onSubmit={submit}>
          {mode === 'signup' && (
            <label>
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </label>
          )}
          <label>
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
              required
            />
          </label>
          <label>
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Minimum 6 characters"
              minLength={6}
              required
            />
          </label>

          <button
            className="btn btn-primary wide"
            type="submit"
            disabled={busy}
          >
            {busy
              ? 'Connecting…'
              : mode === 'signin'
              ? 'Enter NAJAF'
              : 'Create my account'}
            <Icon name="arrow" size={17} />
          </button>
        </form>
      </div>
    </div>
  );
}

function ProfilePage({ user, signOut, setToast }) {
  const {
    city,
    area,
    address,
    accuracy,
    coords,
    permission,
    detectLocation,
    setAddress,
  } = useCity();

  const metadata = user.user_metadata || {};
  const [name, setName] = useState(
    metadata.full_name || user.email?.split('@')[0] || 'NAJAF member'
  );
  const [phone, setPhone] = useState(metadata.phone || '');
  const [editAddress, setEditAddress] = useState(address);
  const [editArea, setEditArea] = useState(area);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    setEditAddress(address);
    setEditArea(area);
  }, [address, area]);

  const save = async () => {
    setSaving(true);
    try {
      setAddress(editAddress, editArea);

      await upsertProfile({
        userId: user.id,
        fullName: name,
        phone,
        city: city.id,
        area: editArea,
        address: editAddress,
      });

      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: name,
          phone,
          city: city.id,
          area: editArea,
          address: editAddress,
        },
      });
      if (error) throw error;

      setToast({
        type: 'success',
        title: 'Profile saved',
        text: `Your ${city.name} profile and delivery address are updated.`,
      });
    } catch (error) {
      setToast({
        type: 'error',
        title: 'Could not save profile',
        text: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const refresh = async () => {
    setLocating(true);
    const next = await detectLocation();
    setLocating(false);
    if (next) {
      setToast({
        type: 'success',
        title: 'Location refreshed',
        text: 'Using your live GPS position.',
      });
    }
  };

  const googleAvatar = metadata.avatar_url;

  return (
    <div className="page-shell page-top">
      <SectionHead
        kicker="Profile"
        title={`Your ${city.name} identity.`}
      />

      <div className="profile-grid">
        <section className="profile-card profile-main">
          {googleAvatar ? (
            <img
              src={googleAvatar}
              alt="avatar"
              className="avatar-disc avatar-img"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="avatar-disc">
              {name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <div className="section-kicker">MEMBER · {city.short}</div>
            <h2>{name}</h2>
            <p>{user.email}</p>
            <small className="verified-line">
              {metadata.provider === 'google'
                ? '● Google account verified'
                : '● Supabase account verified'}
            </small>
          </div>
          <button className="btn btn-outline compact" onClick={signOut}>
            <Icon name="logout" size={15} />
            Sign out
          </button>
        </section>

        <section className="profile-card">
          <div className="form-title">Account details</div>
          <label>
            Full name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            Phone
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9XXXXXXXXX"
            />
          </label>

          <button
            className="btn btn-outline wide"
            onClick={refresh}
            disabled={locating}
          >
            <Icon name="crosshair" size={15} />
            {locating ? 'Refreshing…' : 'Refresh live location'}
          </button>

          <button
            className="btn btn-primary"
            onClick={save}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </section>

        <section className="profile-card">
          <div className="form-title">Delivery address</div>

          <div className="gps-row">
            <span className={`gps-dot ${coords ? 'live' : ''}`} />
            <div className="gps-copy">
              <strong>{coords ? 'GPS locked' : 'No GPS yet'}</strong>
              <small>
                {coords
                  ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(
                      4
                    )}${accuracy ? ` · ±${Math.round(accuracy)}m` : ''}`
                  : permission === 'denied'
                  ? 'Permission denied'
                  : 'Tap refresh above'}
              </small>
            </div>
          </div>

          <label>
            Delivery address
            <input
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
            />
          </label>

          <label>
            Delivery zone
            <select
              value={editArea}
              onChange={(e) => setEditArea(e.target.value)}
            >
              {city.areas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>

          <div className="profile-note">
            <Icon name="pin" size={16} />
            <span>
              This address is used at checkout and pins the destination
              on your delivery map.
            </span>
          </div>
        </section>

        <section className="profile-card">
          <div className="form-title">Live location</div>
          <div className="setting-row">
            <div>
              <strong>GPS permission</strong>
              <small>{permission}</small>
            </div>
            <span
              className={`toggle ${
                permission === 'granted' ? 'on' : ''
              }`}
            />
          </div>
          <div className="setting-row">
            <div>
              <strong>Current coordinates</strong>
              <small>
                {coords
                  ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
                  : 'Not captured'}
              </small>
            </div>
          </div>
          <div className="setting-row">
            <div>
              <strong>Accuracy</strong>
              <small>
                {accuracy && Number.isFinite(accuracy)
                  ? `±${Math.round(accuracy)} meters`
                  : 'unknown'}
              </small>
            </div>
          </div>
          <div className="setting-row">
            <div>
              <strong>Detected city</strong>
              <small>
                {city.name} · {editArea}
              </small>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function OrdersPage({ orders }) {
  const { city } = useCity();

  return (
    <div className="page-shell page-top">
      <SectionHead
        kicker={`${city.name} orders`}
        title="Every order, one timeline."
      />

      {orders.length ? (
        <div className="orders-list">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} city={city} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No orders yet."
          text={`Your first ${city.name} order will appear here.`}
          action="Browse menu"
          to="/menu"
        />
      )}
    </div>
  );
}

function OrderCard({ order, city }) {
  return (
    <article className="order-card">
      <div className="order-head">
        <div>
          <div className="order-id">{order.id}</div>
          <h3>{order.items.map((i) => i.name).join(' · ')}</h3>
          <p>
            {order.placedAt
              ? new Date(order.placedAt).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })
              : 'Just now'}
          </p>
        </div>
        <span className="status-pill">{order.status}</span>
      </div>

      <div className="order-data">
        <span>{money(order.total, city)}</span>
        <span>ETA {order.eta}</span>
        <span>Rider {order.rider}</span>
      </div>

      <div className="order-actions">
        <Link
          className="btn btn-primary compact"
          to={`/tracking/${order.id}`}
        >
          Track live
          <Icon name="arrow" size={15} />
        </Link>
        <Link
          className="btn btn-outline compact"
          to={`/map/${order.id}`}
        >
          Open route
          <Icon name="map" size={15} />
        </Link>
        <Link className="text-link" to={`/success/${order.id}`}>
          Receipt
        </Link>
      </div>
    </article>
  );
}

function useOrderFromContext(id, orders) {
  const { city, coords } = useCity();

  return useMemo(() => {
    const found = orders.find((item) => String(item.id) === String(id));
    if (found) return found;

    const pending = readStorage('najaf_pending_orders', {});
    const cached = pending[id];
    if (cached) {
      return {
        id: cached.id,
        items: cached.items.map((i) => ({
          ...i,
          category: '',
          desc: '',
        })),
        subtotal: cached.subtotal || 0,
        delivery: cached.delivery || 0,
        packaging: cached.packaging || 0,
        gst: cached.gst || 0,
        discount: cached.discount || 0,
        total: cached.total,
        address: cached.address,
        status: 'Order confirmed',
        rawStatus: 'confirmed',
        eta: `~${city.etaBase} min`,
        rider: 'Ayaan',
        payment: 'Cash on delivery',
        placedAt: cached.createdAt,
        city: cached.city,
        lat: cached.lat,
        lng: cached.lng,
      };
    }

    if (String(id) === 'demo') {
      return {
        id: 'demo',
        items: city.menu.slice(0, 2).map((m) => ({
          ...m,
          quantity: 1,
        })),
        total: city.menu[0].price + city.menu[1].price,
        address: `${city.defaultZone}, ${city.name}`,
        status: 'Being prepared',
        rawStatus: 'preparing',
        eta: `~${city.etaBase} min`,
        rider: 'Ayaan',
        payment: 'Cash on delivery',
        placedAt: new Date().toISOString(),
        city: city.id,
        lat: coords?.lat ?? city.center.lat,
        lng: coords?.lng ?? city.center.lng,
      };
    }

    return null;
  }, [id, orders, city, coords]);
}

/* ---------- Tracking with realtime rider ---------- */
function TrackingPage({ orders }) {
  const { id } = useParams();
  const { city, coords, area } = useCity();
  const order = useOrderFromContext(id, orders);
  const [riderPos, setRiderPos] = useState(null);

  const statusStep =
    order?.rawStatus === 'delivered'
      ? 4
      : order?.rawStatus === 'out_for_delivery'
      ? 2
      : order?.rawStatus === 'preparing'
      ? 1
      : 0;

  const eta = order?.eta || `~${city.etaBase} min`;
  const destinationText = order?.address || `${area}, ${city.name}`;

  const destination =
    order?.lat && order?.lng
      ? { lat: order.lat, lng: order.lng }
      : coords || city.center;

  useEffect(() => {
    if (!supabase || !order?.id) return undefined;

    setRiderPos(
      order.rider_lat && order.rider_lng
        ? { lat: order.rider_lat, lng: order.rider_lng }
        : null
    );

    const channel = supabase
      .channel(`najaf-rider-${order.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          const row = payload.new;
          if (!row) return;
          if (row.rider_lat != null && row.rider_lng != null) {
            setRiderPos({ lat: row.rider_lat, lng: row.rider_lng });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order?.id, order?.rider_lat, order?.rider_lng]);

  return (
    <div className="page-shell page-top ultra-page">
      <div className="track-head ultra-track-head">
        <div>
          <div className="section-kicker">
            LIVE ORDER · {city.short} / {id}
          </div>
          <h1>
            {order?.items?.[0]?.name || 'Order'}{' '}
            <em>
              {order
                ? `is connected in ${city.name}.`
                : 'not found.'}
            </em>
          </h1>
          <p>
            {order
              ? `${order.items.length} line item${
                  order.items.length === 1 ? '' : 's'
                } · ${money(order.total, city)} · ${destinationText}`
              : `Sign in and open a valid order in ${city.name}.`}
          </p>
        </div>

        <div className="track-actions">
          <Link to={`/map/${id}`} className="btn btn-primary">
            Open full map
            <Icon name="map" size={16} />
          </Link>
          <Link to="/orders" className="btn btn-outline">
            Order history
          </Link>
        </div>
      </div>

      <div className="tracking-layout ultra-tracking-layout">
        <section className="tracking-panel ultra-map-panel">
          <RealDeliveryMap
            mode="tracking"
            order={order}
            city={city}
            userCoords={coords}
            riderCoords={riderPos}
            destination={destination}
            destinationText={destinationText}
            statusStep={statusStep}
          />
        </section>

        <aside className="tracking-sidebar ultra-sidebar">
          <div className="eta-card ultra-eta-card">
            <div>
              <small>LIVE ETA · {city.short}</small>
              <strong>{eta}</strong>
              <span>{order?.status || 'Waiting for order data'}</span>
            </div>
            <span className="eta-ring live-ring">LIVE</span>
          </div>

          <div className="timeline ultra-timeline">
            {TRACK_STEPS.map((item, index) => (
              <div
                className={`timeline-step ${
                  index < statusStep
                    ? 'done'
                    : index === statusStep
                    ? 'current'
                    : ''
                }`}
                key={item.title}
              >
                <span className="step-icon">{item.icon}</span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.meta}</small>
                </div>
              </div>
            ))}
          </div>

          <div className="rider-card ultra-rider-card">
            <div className="rider-avatar">
              {(order?.rider || 'A').slice(0, 1)}
            </div>
            <div className="rider-details">
              <small>YOUR {city.short} RIDER</small>
              <strong>
                {order?.rider || 'Assigned after dispatch'}
              </strong>
              <span>
                {riderPos
                  ? `Live · ${riderPos.lat.toFixed(3)}, ${riderPos.lng.toFixed(3)}`
                  : order?.rider_lat
                  ? 'GPS signal connected'
                  : 'Waiting for rider signal'}
              </span>
            </div>
            <a
              className="icon-btn"
              href={
                order?.rider_phone
                  ? `tel:${order.rider_phone}`
                  : undefined
              }
            >
              CALL
            </a>
          </div>

          <div className="telemetry-card">
            <div>
              <span className="telemetry-dot" />
              Realtime channel
            </div>
            <strong>
              {riderPos ? 'Connected' : 'Awaiting signal'}
            </strong>
            <small>Supabase order updates + Mapbox route</small>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ---------- Delivery map with realtime rider ---------- */
function DeliveryMapPage({ orders }) {
  const { id } = useParams();
  const { city, coords, accuracy, area } = useCity();
  const order = useOrderFromContext(id, orders);
  const [riderPos, setRiderPos] = useState(null);

  const destination =
    order?.lat && order?.lng
      ? { lat: order.lat, lng: order.lng }
      : coords || city.center;

  const destinationText = order?.address || `${area}, ${city.name}`;

  useEffect(() => {
    if (!supabase || !order?.id) return undefined;

    setRiderPos(
      order.rider_lat && order.rider_lng
        ? { lat: order.rider_lat, lng: order.rider_lng }
        : null
    );

    const channel = supabase
      .channel(`najaf-rider-map-${order.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          const row = payload.new;
          if (!row) return;
          if (row.rider_lat != null && row.rider_lng != null) {
            setRiderPos({ lat: row.rider_lat, lng: row.rider_lng });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order?.id, order?.rider_lat, order?.rider_lng]);

  return (
    <div className="page-shell page-top ultra-page">
      <div className="section-kicker">
        {city.name.toUpperCase()} · REAL-TIME ROUTE ENGINE
      </div>

      <div className="map-title-row ultra-map-title-row">
        <div>
          <h1>
            {city.name} map <em>with live streets.</em>
          </h1>
          <p>
            {coords
              ? `Centered on your live GPS ${
                  accuracy ? `(±${Math.round(accuracy)}m)` : ''
                }.`
              : 'Interactive streets, live position and delivery telemetry.'}
          </p>
        </div>

        <div className="track-actions">
          <Link to={`/tracking/${id}`} className="btn btn-outline">
            Back to tracking
          </Link>
          <Link to="/home" className="btn btn-primary">
            Keep browsing
            <Icon name="arrow" size={16} />
          </Link>
        </div>
      </div>

      <div className="big-map ultra-big-map">
        <RealDeliveryMap
          mode="full"
          order={order}
          city={city}
          userCoords={coords}
          riderCoords={riderPos}
          destination={destination}
          destinationText={destinationText}
        />
      </div>

      <div className="map-bottom-grid">
        <div className="map-info-card">
          <span>ORDER</span>
          <strong>{id}</strong>
          <small>
            {order?.items
              ?.map((item) => `${item.name} × ${item.quantity}`)
              .join(', ') ||
              'Open a real order to activate telemetry.'}
          </small>
        </div>
        <div className="map-info-card">
          <span>DESTINATION</span>
          <strong>{destinationText.split(',')[0]}</strong>
          <small>
            {order?.lat && order?.lng
              ? `${order.lat.toFixed(4)}, ${order.lng.toFixed(4)}`
              : `${city.name} delivery zone`}
          </small>
        </div>
        <div className="map-info-card">
          <span>RIDER SIGNAL</span>
          <strong>
            {riderPos
              ? `${riderPos.lat.toFixed(4)}, ${riderPos.lng.toFixed(4)}`
              : 'Waiting'}
          </strong>
          <small>
            {riderPos ? 'Live GPS from rider' : 'No live rider data yet'}
          </small>
        </div>
      </div>
    </div>
  );
}

function SuccessPage({ orders }) {
  const { id } = useParams();
  const { city } = useCity();
  const order = useOrderFromContext(id, orders);

  return (
    <div className="page-shell page-top success-shell">
      <div className="success-ring">
        <span>✓</span>
      </div>
      <div className="section-kicker">
        ORDER CONFIRMED · {city.short}
      </div>
      <h1>Now we watch the clock.</h1>
      <p>
        {id} is in the kitchen. Estimated handoff in {city.name} is{' '}
        <strong>{order?.eta || `~${city.etaBase} min`}</strong>.
      </p>

      <div className="success-card">
        <div>
          <small>DELIVER TO</small>
          <strong>
            {order?.address || `${city.defaultZone}, ${city.name}`}
          </strong>
        </div>
        <div>
          <small>TOTAL</small>
          <strong>{order ? money(order.total, city) : '₹—'}</strong>
        </div>
        <div>
          <small>PAYMENT</small>
          <strong>{order?.payment || 'Cash on delivery'}</strong>
        </div>
      </div>

      <div className="hero-ctas">
        <Link to={`/tracking/${id}`} className="btn btn-primary">
          Track the order
          <Icon name="arrow" size={17} />
        </Link>
        <Link to="/home" className="btn btn-outline">
          Back home
        </Link>
      </div>
    </div>
  );
}

function DashboardPage({ cart, orders, user }) {
  const { city, area, address, coords, accuracy } = useCity();
  const latest = orders[0];
  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'member';

  return (
    <div className="page-shell page-top">
      <div className="dashboard-hero">
        <div>
          <div className="eyebrow">
            <span>{city.short}</span> member dashboard
          </div>
          <h1>
            {user
              ? `Good to see you, ${displayName.split(' ')[0]}.`
              : 'Welcome to your dashboard.'}
          </h1>
          <p>Your {city.name} basket, live order and shortcuts.</p>
          <div className="hero-address">
            <Icon name="pin" size={14} /> {area} · {address}
            {coords && accuracy ? ` · ±${Math.round(accuracy)}m` : ''}
          </div>
        </div>
        <Link to="/menu" className="btn btn-primary">
          Start a {city.name} order
          <Icon name="arrow" size={17} />
        </Link>
      </div>

      <div className="dashboard-grid">
        <div className="dash-card large">
          <div className="dash-kicker">LIVE / YOUR NEXT MOVE</div>
          {latest ? (
            <>
              <h3>{latest.items?.[0]?.name || 'Order'}</h3>
              <p>
                {latest.status} · ETA {latest.eta}
              </p>
              <Link
                to={`/tracking/${latest.id}`}
                className="mini-link"
              >
                Open tracking
                <Icon name="arrow" size={15} />
              </Link>
            </>
          ) : (
            <>
              <h3>No active order.</h3>
              <p>Launch one from the {city.name} menu.</p>
            </>
          )}
        </div>

        <div className="dash-card">
          <div className="dash-kicker">BASKET</div>
          <strong className="dash-number">
            {cart.reduce((s, i) => s + i.quantity, 0)}
          </strong>
          <p>items ready to checkout</p>
          <Link className="mini-link" to="/cart">
            Open basket
            <Icon name="arrow" size={15} />
          </Link>
        </div>

        <div className="dash-card">
          <div className="dash-kicker">ORDERS</div>
          <strong className="dash-number">{orders.length}</strong>
          <p>
            saved order{orders.length === 1 ? '' : 's'}
          </p>
          <Link className="mini-link" to="/orders">
            See history
            <Icon name="arrow" size={15} />
          </Link>
        </div>

        <div className="dash-card">
          <div className="dash-kicker">OFFERS · {city.short}</div>
          <strong className="dash-number">
            {String(city.offers.length).padStart(2, '0')}
          </strong>
          <p>codes live in {city.name}</p>
          <Link className="mini-link" to="/offers">
            Explore offers
            <Icon name="arrow" size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, text, action, onAction, to = '/menu' }) {
  return (
    <div className="empty-state">
      <div className="empty-mark">∅</div>
      <h2>{title}</h2>
      <p>{text}</p>
      {onAction ? (
        <button className="btn btn-primary" onClick={onAction}>
          {action}
        </button>
      ) : (
        <Link className="btn btn-primary" to={to}>
          {action}
          <Icon name="arrow" size={16} />
        </Link>
      )}
    </div>
  );
}

function NotFound() {
  return (
    <div className="page-shell page-top not-found">
      <div className="not-code">404</div>
      <div>
        <div className="section-kicker">OFF THE GRID</div>
        <h1>This route drifted away.</h1>
        <p>The page you requested is not in the NOVA orbit.</p>
        <Link to="/home" className="btn btn-primary">
          Return to home
          <Icon name="arrow" size={16} />
        </Link>
      </div>
    </div>
  );
}

function Footer({ city, cityId }) {
  const { setManualCity } = useCity();

  return (
    <footer className="site-footer">
      <div className="page-shell footer-grid">
        <div>
          <Link to="/home" className="brand-lockup">
            <span className="brand-orbit">N</span>
            <span>
              <strong>NAJAF</strong>
              <small>NOVA FOOD PLATFORM</small>
            </span>
          </Link>
          <p className="footer-copy">
            Live food routing across {Object.keys(CITIES).length} Indian
            cities — auto-detected from your GPS location.
          </p>

          <div className="footer-city-switch">
            <small>ACTIVE CITY</small>
            <div className="footer-city-pills">
              {Object.values(CITIES).map((c) => (
                <button
                  key={c.id}
                  className={`footer-city-pill ${
                    c.id === cityId ? 'active' : ''
                  }`}
                  onClick={() => setManualCity(c.id)}
                >
                  {c.short}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-col">
          <small>DISCOVER · {city.short}</small>
          <Link to="/menu">Menu</Link>
          <Link to="/restaurants">Kitchens</Link>
          <Link to="/offers">Offers</Link>
        </div>

        <div className="footer-col">
          <small>ACCOUNT</small>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/orders">Orders</Link>
        </div>

        <div className="footer-col">
          <small>OPERATIONS</small>
          <Link to="/tracking/demo">Live tracking</Link>
          <Link to="/map/demo">Delivery map</Link>
          <Link to="/auth">Login / sign up</Link>
        </div>
      </div>

      <div className="footer-bottom page-shell">
        <span>© 2026 NAJAF NOVA · {city.name}</span>
        <span>Live location aware · City-aware routing</span>
        <span>Built for mobile + desktop</span>
      </div>
    </footer>
  );
}

function AppModal({ modal, close }) {
  const {
    city,
    cityId,
    setManualCity,
    area,
    setArea,
    address,
    setAddress,
    accuracy,
    coords,
    permission,
    detectLocation,
  } = useCity();

  const [value, setValue] = useState(
    modal.type === 'location' ? address : city.defaultZone
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (modal.type === 'location') setValue(address);
  }, [address, modal.type]);

  if (modal.type === 'search') {
    return (
      <div className="modal-backdrop" onMouseDown={close}>
        <div
          className="modal-panel search-modal"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button className="modal-close" onClick={close}>
            <Icon name="close" />
          </button>
          <div className="section-kicker">
            SEARCH NOVA · {city.short}
          </div>
          <h2>What are you craving in {city.name}?</h2>
          <div className="search-box big">
            <Icon name="search" />
            <input
              autoFocus
              placeholder={`Pizza, burger, biryani in ${city.name}...`}
            />
          </div>
          <div className="search-suggestions">
            {city.menu.slice(0, 5).map((item) => (
              <Link key={item.id} to="/menu" onClick={close}>
                <img
                  className="suggestion-photo"
                  src={item.image}
                  alt={item.name}
                />
                <div>
                  <strong>{item.name}</strong>
                  <small>
                    {item.category} · {money(item.price, city)}
                  </small>
                </div>
                <Icon name="chevron" size={15} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (modal.type === 'city') {
    return (
      <div className="modal-backdrop" onMouseDown={close}>
        <div
          className="modal-panel"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button className="modal-close" onClick={close}>
            <Icon name="close" />
          </button>
          <div className="section-kicker">CHOOSE YOUR CITY</div>
          <h2>Where are you ordering today?</h2>
          <div className="city-grid">
            {Object.values(CITIES).map((c) => (
              <button
                key={c.id}
                className={`city-tile ${
                  c.id === cityId ? 'active' : ''
                }`}
                onClick={() => {
                  setManualCity(c.id);
                  close();
                }}
              >
                <strong>{c.name}</strong>
                <small>{c.tagline}</small>
                <span>{c.short}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const useLive = async () => {
    setBusy(true);
    setErr(null);
    const result = await detectLocation();
    setBusy(false);
    if (result) close();
    else setErr('Could not read your GPS. Check browser permissions.');
  };

  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <div
        className="modal-panel"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={close}>
          <Icon name="close" />
        </button>
        <div className="section-kicker">
          DELIVERY ZONE · {city.short}
        </div>
        <h2>Where should NAJAF arrive?</h2>

        <div className="gps-row">
          <span className={`gps-dot ${coords ? 'live' : ''}`} />
          <div className="gps-copy">
            <strong>{coords ? 'GPS locked' : 'No GPS yet'}</strong>
            <small>
              {coords
                ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(
                    4
                  )}${accuracy ? ` · ±${Math.round(accuracy)}m` : ''}`
                : permission === 'denied'
                ? 'Permission denied'
                : 'Tap live location below'}
            </small>
          </div>
        </div>

        <label>
          Delivery address
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>

        <div className="area-pills">
          {city.areas.map((a) => (
            <button
              key={a}
              type="button"
              className={`pill ${area === a ? 'selected' : ''}`}
              onClick={() => {
                setArea(a);
                setValue(`${a}, ${city.name}`);
              }}
            >
              {a}
            </button>
          ))}
        </div>

        <button
          className="btn btn-outline wide"
          type="button"
          onClick={useLive}
          disabled={busy}
        >
          <Icon name="crosshair" size={16} />
          {busy ? 'Locating…' : 'Use my live GPS location'}
        </button>

        {err && (
          <div className="modal-error">
            <Icon name="alert" size={14} />
            <span>{err}</span>
          </div>
        )}

        <div className="zone-preview">
          <span className="live-dot" />
          <div>
            <strong>
              {city.name} zone · {area}
            </strong>
            <small>
              The chosen address will be geocoded to this order.
            </small>
          </div>
        </div>

        <button
          className="btn btn-primary wide"
          onClick={() => {
            setAddress(value, area);
            close();
          }}
        >
          Save location
          <Icon name="arrow" size={16} />
        </button>
      </div>
    </div>
  );
}

function Toast({ type, title, text, close }) {
  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">
        {type === 'success' ? '✓' : type === 'error' ? '!' : 'i'}
      </span>
      <div>
        <strong>{title}</strong>
        <small>{text}</small>
      </div>
      <button onClick={close}>
        <Icon name="close" size={15} />
      </button>
    </div>
  );
}

export default App;
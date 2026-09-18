import React, { useEffect, useState } from 'react';
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
  useLocation,
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

const MENU = [
  {
    id: 1,
    name: 'Midnight Truffle',
    category: 'Pizza',
    price: 449,
    rating: 4.9,
    time: 24,
    image:
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1200&q=88',
    tone: 'violet',
    desc: 'Smoked mozzarella, truffle cream, roasted mushroom.',
  },
  {
    id: 2,
    name: 'NOVA Smash',
    category: 'Burgers',
    price: 329,
    rating: 4.8,
    time: 19,
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=88',
    tone: 'lime',
    desc: 'Double seared patty, house sauce, crisp lettuce.',
  },
  {
    id: 3,
    name: 'Meteor Fries',
    category: 'Sides',
    price: 189,
    rating: 4.7,
    time: 16,
    image:
      'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=88',
    tone: 'amber',
    desc: 'Crisp fries, smoked salt, signature neon dip.',
  },
  {
    id: 4,
    name: 'Saffron Cloud',
    category: 'Rice',
    price: 389,
    rating: 4.9,
    time: 27,
    image:
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=88',
    tone: 'cyan',
    desc: 'Long-grain rice, saffron, roasted vegetables.',
  },
  {
    id: 5,
    name: 'Tandoori Halo',
    category: 'Wraps',
    price: 279,
    rating: 4.8,
    time: 21,
    image:
      'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=1200&q=88',
    tone: 'coral',
    desc: 'Charred paneer, mint crema, pickled onion.',
  },
  {
    id: 6,
    name: 'Galaxy Momo',
    category: 'Snacks',
    price: 239,
    rating: 4.9,
    time: 18,
    image:
      'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=1200&q=88',
    tone: 'blue',
    desc: 'Steamed momos, chili crunch, sesame glaze.',
  },
  {
    id: 7,
    name: 'Lunar Ramen',
    category: 'Noodles',
    price: 419,
    rating: 4.8,
    time: 25,
    image:
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=88',
    tone: 'indigo',
    desc: 'Silky broth, noodles, corn, scallion, chili oil.',
  },
  {
    id: 8,
    name: 'Comet Shake',
    category: 'Drinks',
    price: 219,
    rating: 4.7,
    time: 12,
    image:
      'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=1200&q=88',
    tone: 'pink',
    desc: 'Vanilla cream, berry ripple, chilled sparkle.',
  },
  {
    id: 9,
    name: 'Orbit Tacos',
    category: 'Mexican',
    price: 299,
    rating: 4.8,
    time: 20,
    image:
      'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1200&q=88',
    tone: 'orange',
    desc: 'Crisp shell, smoky beans, salsa verde.',
  },
  {
    id: 10,
    name: 'Nebula Brownie',
    category: 'Desserts',
    price: 199,
    rating: 4.9,
    time: 14,
    image:
      'https://images.unsplash.com/photo-1564355808539-22fda35bed7?auto=format&fit=crop&w=1200&q=88',
    tone: 'plum',
    desc: 'Fudgy brownie, sea salt, warm chocolate center.',
  },
];

const RESTAURANT_IMAGES = {
  n1: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1100&q=88',
  n2: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1100&q=88',
  n3: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1100&q=88',
  n4: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1100&q=88',
  n5: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=1100&q=88',
  n6: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1100&q=88',
};

const RESTAURANTS = [
  {
    id: 'n1',
    name: 'NOVA KITCHEN',
    cuisine: 'Modern Indian · Bowls · Wraps',
    rating: 4.9,
    time: '18–24 min',
    tag: 'TRENDING',
    color: 'violet',
    initials: 'NK',
  },
  {
    id: 'n2',
    name: 'MOON & MINT',
    cuisine: 'Asian · Ramen · Dumplings',
    rating: 4.8,
    time: '22–28 min',
    tag: 'FAST',
    color: 'lime',
    initials: 'MM',
  },
  {
    id: 'n3',
    name: 'ORBIT BURGER LAB',
    cuisine: 'Smash burgers · Fries · Shakes',
    rating: 4.7,
    time: '16–22 min',
    tag: 'CROWD PICK',
    color: 'cyan',
    initials: 'OB',
  },
  {
    id: 'n4',
    name: 'SAFFRON THEORY',
    cuisine: 'Biryani · Rice · Grill',
    rating: 4.9,
    time: '25–31 min',
    tag: 'NEW',
    color: 'amber',
    initials: 'ST',
  },
  {
    id: 'n5',
    name: 'LANTERN TACO CLUB',
    cuisine: 'Mexican · Street food',
    rating: 4.8,
    time: '20–27 min',
    tag: 'HOT',
    color: 'coral',
    initials: 'LT',
  },
  {
    id: 'n6',
    name: 'SWEET ORBIT',
    cuisine: 'Desserts · Shakes · Coffee',
    rating: 4.7,
    time: '12–18 min',
    tag: 'LATE NIGHT',
    color: 'pink',
    initials: 'SO',
  },
];

const OFFERS = [
  {
    id: 'NOVA100',
    title: 'NOVA100',
    detail: '₹100 off above ₹499',
    accent: 'violet',
  },
  {
    id: 'FIRSTBITE',
    title: 'FIRSTBITE',
    detail: '20% off for first order',
    accent: 'lime',
  },
  {
    id: 'LATE20',
    title: 'LATE20',
    detail: '20% off after 9 PM',
    accent: 'cyan',
  },
  {
    id: 'FAMILY250',
    title: 'FAMILY250',
    detail: '₹250 off above ₹1299',
    accent: 'amber',
  },
];

const TRACK_STEPS = [
  {
    title: 'Order confirmed',
    meta: 'Kitchen accepted your order',
    icon: '✓',
  },
  {
    title: 'Being prepared',
    meta: 'Chef is plating your food',
    icon: '◒',
  },
  {
    title: 'Rider en route',
    meta: 'Ayaan is heading your way',
    icon: '⌁',
  },
  {
    title: 'At your door',
    meta: 'Delivery handoff',
    icon: '⌂',
  },
];

const money = (n) =>
  `₹${Number(n || 0).toLocaleString('en-IN')}`;

const readStorage = (key, fallback) => {
  try {
    return JSON.parse(
      localStorage.getItem(key) ||
        JSON.stringify(fallback)
    );
  } catch {
    return fallback;
  }
};

const saveStorage = (key, value) =>
  localStorage.setItem(key, JSON.stringify(value));

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
    status: statusLabels[row.status] || row.status,
    rawStatus: row.status,
    payment:
      row.payment_status === 'captured'
        ? 'Online payment'
        : row.payment_status === 'cod_pending'
        ? 'Cash on delivery'
        : 'Cash on delivery',
    eta: row.eta_minutes
      ? `${row.eta_minutes} min`
      : '—',
    rider: row.rider_name || 'Ayaan',
    placedAt: row.created_at,
  };
}

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

    heart: (
      <path d="M20.5 8.4c0 5.3-8.5 10.1-8.5 10.1S3.5 13.7 3.5 8.4A4.1 4.1 0 0 1 11 6a4.1 4.1 0 0 1 7.5 2.4Z" />
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

    bell: (
      <>
        <path d="M18 9a6 6 0 0 0-12 0c0 6-2.5 6-2.5 8h17C20.5 15 18 15 18 9Z" />
        <path d="M10 21h4" />
      </>
    ),

    map: (
      <>
        <path d="m9 18-5 3V6l5-3 6 3 5-3v15l-5 3-6-3Z" />
        <path d="M9 3v15" />
        <path d="M15 6v15" />
      </>
    ),

    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),

    minus: <path d="M5 12h14" />,

    star: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    ),

    bag: (
      <>
        <path d="M6 8h12l1 12H5L6 8Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </>
    ),

    location: (
      <>
        <circle cx="12" cy="10" r="2.5" />
        <path d="M12 21s7-6.5 7-11a7 7 0 0 0-14 0c0 4.5 7 11 7 11Z" />
      </>
    ),

    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),

    phone: (
      <path d="M7 4h3l1.2 4-2 1.4a15 15 0 0 0 5.4 5.4L16 13l4 1.2v3c0 1.1-.9 2-2 2C10.3 19.2 4.8 13.7 4.8 6c0-1.1.9-2 2.2-2Z" />
    ),

    shield: (
      <>
        <path d="M12 3 20 6v5c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6l8-3Z" />
        <path d="m8.5 12 2.3 2.3 4.7-5" />
      </>
    ),

    refresh: (
      <>
        <path d="M20 11a8 8 0 0 0-14.8-4L3 10" />
        <path d="M3 5v5h5" />
        <path d="M4 13a8 8 0 0 0 14.8 4L21 14" />
        <path d="M21 19v-5h-5" />
      </>
    ),
  };

  return (
    <svg {...common}>
      {paths[name] || paths.spark}
    </svg>
  );
}

function userLink(user) {
  return user ? '/profile' : '/auth';
}

function getInitials(user) {
  const name =
    user?.user_metadata?.full_name ||
    user?.email ||
    'NAJAF';

  return name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
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

function App() {
  const [cart, setCart] = useState(() =>
    readStorage('najaf-cart', [])
  );

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);

  const [locationName, setLocationName] = useState(() =>
    localStorage.getItem('najaf-location') ||
    'Bengaluru'
  );

  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    saveStorage('najaf-cart', cart);
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(
      'najaf-location',
      locationName
    );
  }, [locationName]);

  useEffect(() => {
    let mounted = true;

    const bootAuth = async () => {
      if (!supabase) {
        if (mounted) {
          setAuthLoading(false);
        }
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted) {
        setUser(session?.user || null);
        setAuthLoading(false);
      }
    };

    bootAuth();

    if (!supabase) {
      return undefined;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        setAuthLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user || !supabase) {
      setOrders([]);
      return undefined;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const rows = await fetchMyOrders();

        if (!cancelled) {
          setOrders(
            rows.map(normalizeOrder)
          );
        }
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
        load
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = setTimeout(
      () => setToast(null),
      3200
    );

    return () => clearTimeout(timer);
  }, [toast]);

  const addToCart = (
    item,
    quantity = 1
  ) => {
    setCart((current) => {
      const found = current.find(
        (entry) => entry.id === item.id
      );

      if (found) {
        return current.map((entry) =>
          entry.id === item.id
            ? {
                ...entry,
                quantity:
                  entry.quantity + quantity,
              }
            : entry
        );
      }

      return [
        ...current,
        {
          ...item,
          quantity,
        },
      ];
    });

    setToast({
      type: 'success',
      title: 'Added to order',
      text: `${item.name} is in your bag.`,
    });
  };

  const updateQty = (
    id,
    delta
  ) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity:
                  item.quantity + delta,
              }
            : item
        )
        .filter(
          (item) => item.quantity > 0
        )
    );
  };

  const clearCart = () =>
    setCart([]);

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }

    setOrders([]);

    setToast({
      type: 'info',
      title: 'Signed out',
      text: 'Your secure session has ended.',
    });
  };

  return (
    <>
      <Ambient />

      <Header
        user={user}
        cart={cart}
        locationName={locationName}
        setLocationName={setLocationName}
      />

      <main>
        <Routes>
          <Route
            path="/"
            element={
              <Navigate
                to="/home"
                replace
              />
            }
          />

          <Route
            path="/home"
            element={
              <HomePage
                user={user}
                cart={cart}
                addToCart={addToCart}
                setModal={setModal}
                locationName={locationName}
              />
            }
          />

          <Route
            path="/menu"
            element={
              <MenuPage
                cart={cart}
                addToCart={addToCart}
                setModal={setModal}
              />
            }
          />

          <Route
            path="/offers"
            element={
              <OffersPage
                setToast={setToast}
              />
            }
          />

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
            path="/auth"
            element={
              <AuthPage
                setUser={setUser}
                setToast={setToast}
              />
            }
          />

          <Route
            path="/checkout"
            element={
              <RequireAuth
                user={user}
                authLoading={authLoading}>
                <CheckoutPage
                  user={user}
                  cart={cart}
                  clearCart={clearCart}
                  setToast={setToast}
                />
              </RequireAuth>
            }
          />

          <Route
            path="/profile"
            element={
              <RequireAuth
                user={user}
                authLoading={authLoading}>
                <ProfilePage
                  user={user}
                  orders={orders}
                  signOut={signOut}
                  setToast={setToast}
                />
              </RequireAuth>
            }
          />

          <Route
            path="/orders"
            element={
              <RequireAuth
                user={user}
                authLoading={authLoading}>
                <OrdersPage
                  orders={orders}
                />
              </RequireAuth>
            }
          />

          <Route
            path="/tracking/:id"
            element={
              <RequireAuth
                user={user}
                authLoading={authLoading}>
                <TrackingPage
                  orders={orders}
                />
              </RequireAuth>
            }
          />

          <Route
            path="/map/:id"
            element={
              <RequireAuth
                user={user}
                authLoading={authLoading}>
                <MapPage
                  orders={orders}
                />
              </RequireAuth>
            }
          />

          <Route
            path="/success/:id"
            element={
              <RequireAuth
                user={user}
                authLoading={authLoading}>
                <SuccessPage
                  orders={orders}
                />
              </RequireAuth>
            }
          />

          <Route
            path="/dashboard"
            element={
              <RequireAuth
                user={user}
                authLoading={authLoading}>
                <DashboardPage
                  orders={orders}
                />
              </RequireAuth>
            }
          />

          <Route
            path="*"
            element={
              <NotFoundPage />
            }
          />
        </Routes>
      </main>

      <Footer />

      {toast && (
        <Toast
          toast={toast}
          onClose={() =>
            setToast(null)
          }
        />
      )}

      {modal && (
        <FoodModal
          item={modal}
          closeModal={() =>
            setModal(null)
          }
          addToCart={addToCart}
        />
      )}
    </>
  );
}

function RequireAuth({
  user,
  authLoading,
  children,
}) {
  if (authLoading) {
    return (
      <div className="page-shell page-top">
        <div className="loading-state">
          <div className="loading-orbit" />
          <span>Restoring secure session…</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/auth"
        replace
      />
    );
  }

  return children;
}

function Header({
  user,
  cart,
  locationName,
  setLocationName,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const cartCount = cart.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0),
    0
  );

  const isHome =
    location.pathname === '/home' ||
    location.pathname === '/';

  const goTo = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  return (
    <header
      className={`site-header ${
        isHome ? 'header-home' : ''
      }`}>
      <div className="header-inner">
        <button
          className="brand"
          onClick={() =>
            goTo('/home')
          }
          aria-label="NAJAF home">
          <span className="brand-mark">
            N
          </span>

          <span className="brand-copy">
            <strong>NAJAF</strong>
            <small>NOVA FOOD</small>
          </span>
        </button>

        <nav className="desktop-nav">
          <NavLink to="/home">
            Home
          </NavLink>

          <NavLink to="/menu">
            Menu
          </NavLink>

          <NavLink to="/offers">
            Offers
          </NavLink>

          {user && (
            <NavLink to="/orders">
              Orders
            </NavLink>
          )}
        </nav>

        <div className="header-actions">
          <button
            className="location-chip desktop-only"
            onClick={() =>
              setLocationName(
                locationName === 'Bengaluru'
                  ? 'Bangalore'
                  : 'Bengaluru'
              )
            }>
            <Icon
              name="pin"
              size={16}
            />
            <span>
              {locationName}
            </span>
          </button>

          <Link
            className="icon-btn ghost desktop-only"
            to={user ? '/profile' : '/auth'}
            aria-label={
              user
                ? 'Profile'
                : 'Login'
            }
            title={
              user
                ? `Account: ${
                    user.user_metadata
                      ?.full_name ||
                    user.email ||
                    'Profile'
                  }`
                : 'Login / Create account'
            }
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
            }}>
            <Icon name="user" />

            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.08em',
              }}>
              {user
                ? 'ACCOUNT'
                : 'LOGIN'}
            </span>
          </Link>

          <Link
            className="icon-btn cart-button"
            to="/cart"
            aria-label={`Cart with ${cartCount} items`}>
            <Icon name="cart" />

            {cartCount > 0 && (
              <span className="cart-count">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            className="mobile-menu-button"
            onClick={() =>
              setMobileOpen(
                (value) => !value
              )
            }
            aria-label="Open menu">
            <Icon
              name={
                mobileOpen
                  ? 'close'
                  : 'menu'
              }
            />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-panel">
          <button
            onClick={() =>
              goTo('/home')
            }>
            Home
          </button>

          <button
            onClick={() =>
              goTo('/menu')
            }>
            Menu
          </button>

          <button
            onClick={() =>
              goTo('/offers')
            }>
            Offers
          </button>

          {user && (
            <>
              <button
                onClick={() =>
                  goTo('/orders')
                }>
                Orders
              </button>

              <button
                onClick={() =>
                  goTo('/profile')
                }>
                Account
              </button>
            </>
          )}

          {!user && (
            <button
              onClick={() =>
                goTo('/auth')
              }>
              Login
            </button>
          )}

          <button
            onClick={() =>
              goTo('/cart')
            }>
            Cart
            {cartCount > 0
              ? ` · ${cartCount}`
              : ''}
          </button>
        </div>
      )}
    </header>
  );
}

function SectionHead({
  kicker,
  title,
  text,
  action,
  onAction,
}) {
  return (
    <div className="section-head">
      <div>
        {kicker && (
          <span className="eyebrow">
            {kicker}
          </span>
        )}

        <h2>{title}</h2>

        {text && (
          <p>{text}</p>
        )}
      </div>

      {action && (
        <button
          className="text-button"
          onClick={onAction}>
          {action}
          <Icon
            name="arrow"
            size={16}
          />
        </button>
      )}
    </div>
  );
}

function HomePage({
  user,
  cart,
  addToCart,
  setModal,
  locationName,
}) {
  const navigate = useNavigate();

  const [query, setQuery] =
    useState('');

  const featured = MENU.slice(0, 6);

  const filtered = featured.filter(
    (item) =>
      item.name
        .toLowerCase()
        .includes(
          query.toLowerCase()
        ) ||
      item.category
        .toLowerCase()
        .includes(
          query.toLowerCase()
        )
  );

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">
              LIVE IN {locationName.toUpperCase()}
            </span>

            <h1>
              Food that
              <br />
              <em>moves</em> with you.
            </h1>

            <p>
              Discover bold plates, fast drops and
              a delivery experience built like a
              little piece of the future.
            </p>

            <div className="hero-actions">
              <button
                className="btn btn-primary"
                onClick={() =>
                  navigate('/menu')
                }>
                Explore menu
                <Icon
                  name="arrow"
                  size={17}
                />
              </button>

              <button
                className="btn btn-secondary"
                onClick={() =>
                  navigate('/offers')
                }>
                View offers
              </button>
            </div>

            <div className="hero-proof">
              <div className="proof-avatars">
                <span>SN</span>
                <span>AK</span>
                <span>RM</span>
              </div>

              <div>
                <strong>
                  4.9/5
                </strong>

                <small>
                  Loved by NOVA diners
                </small>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-ring ring-one" />
            <div className="hero-ring ring-two" />

            <div className="hero-food-card hero-food-main">
              <img
                src={MENU[0].image}
                alt={MENU[0].name}
              />

              <div className="hero-food-overlay">
                <span>
                  TONIGHT'S DROP
                </span>

                <strong>
                  {MENU[0].name}
                </strong>

                <small>
                  {money(MENU[0].price)}
                </small>
              </div>
            </div>

            <div className="floating-card floating-rating">
              <Icon
                name="star"
                size={17}
              />

              <strong>
                {MENU[0].rating}
              </strong>

              <span>
                rating
              </span>
            </div>

            <div className="floating-card floating-time">
              <Icon
                name="clock"
                size={16}
              />

              <strong>
                {MENU[0].time}
                min
              </strong>

              <span>
                delivery
              </span>
            </div>

            <div className="hero-orbit-label">
              <span />
              NOVA
              <br />
              DROP
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell home-content">
        <div className="search-strip">
          <div className="search-box">
            <Icon
              name="search"
              size={19}
            />

            <input
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value
                )
              }
              placeholder="Search pizza, burgers, ramen..."
              aria-label="Search menu"
            />

            {query && (
              <button
                className="search-clear"
                onClick={() =>
                  setQuery('')
                }
                aria-label="Clear search">
                <Icon
                  name="close"
                  size={16}
                />
              </button>
            )}
          </div>

          <button
            className="search-location"
            onClick={() =>
              navigate('/menu')
            }>
            <Icon
              name="pin"
              size={17}
            />
            <span>
              Delivering to
              <strong>
                {locationName}
              </strong>
            </span>
            <Icon
              name="chevron"
              size={16}
            />
          </button>
        </div>

        <SectionHead
          kicker="Curated for you"
          title="The NOVA shortlist"
          text="Small menu. Big personality."
          action="See all"
          onAction={() =>
            navigate('/menu')
          }
        />

        <div className="food-grid">
          {filtered.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              addToCart={addToCart}
              onDetails={() =>
                setModal(item)
              }
            />
          ))}
        </div>

        {!filtered.length && (
          <EmptyState
            title="No cosmic match yet."
            text="Try another dish, category or a simpler search."
            action="Browse full menu"
            onAction={() =>
              navigate('/menu')
            }
          />
        )}

        <section className="restaurant-section">
          <SectionHead
            kicker="Around the orbit"
            title="Restaurants worth leaving home for."
            text="Six fictional NOVA destinations, one very real appetite."
          />

          <div className="restaurant-grid">
            {RESTAURANTS.map(
              (restaurant) => (
                <article
                  className={`restaurant-card restaurant-${restaurant.color}`}
                  key={restaurant.id}>
                  <div className="restaurant-image">
                    <img
                      src={
                        RESTAURANT_IMAGES[
                          restaurant.id
                        ]
                      }
                      alt={
                        restaurant.name
                      }
                    />

                    <span className="restaurant-tag">
                      {restaurant.tag}
                    </span>
                  </div>

                  <div className="restaurant-body">
                    <div className="restaurant-title-row">
                      <div>
                        <h3>
                          {restaurant.name}
                        </h3>

                        <p>
                          {restaurant.cuisine}
                        </p>
                      </div>

                      <div className="restaurant-rating">
                        <Icon
                          name="star"
                          size={14}
                        />
                        {restaurant.rating}
                      </div>
                    </div>

                    <div className="restaurant-meta">
                      <span>
                        <Icon
                          name="clock"
                          size={14}
                        />
                        {restaurant.time}
                      </span>

                      <button
                        onClick={() =>
                          navigate(
                            '/menu'
                          )
                        }>
                        Order
                        <Icon
                          name="arrow"
                          size={14}
                        />
                      </button>
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        </section>

        <section className="split-feature">
          <div className="split-feature-copy">
            <span className="eyebrow">
              WHY NOVA
            </span>

            <h2>
              Your food
              <br />
              deserves a
              <br />
              better interface.
            </h2>

            <p>
              No clutter. No endless scrolling through
              the same five dishes. Just sharp discovery,
              transparent checkout and tracking that
              actually feels alive.
            </p>

            <div className="feature-list">
              <div>
                <span>
                  01
                </span>

                <div>
                  <strong>
                    Live order tracking
                  </strong>

                  <small>
                    Follow the journey from kitchen
                    to doorstep.
                  </small>
                </div>
              </div>

              <div>
                <span>
                  02
                </span>

                <div>
                  <strong>
                    Cash on delivery
                  </strong>

                  <small>
                    Keep checkout simple and familiar.
                  </small>
                </div>
              </div>

              <div>
                <span>
                  03
                </span>

                <div>
                  <strong>
                    Account memory
                  </strong>

                  <small>
                    Your orders stay connected to your account.
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div className="split-feature-visual">
            <div className="feature-poster">
              <div className="poster-top">
                <span>
                  NOVA / 01
                </span>

                <span>
                  DELIVERY SYSTEM
                </span>
              </div>

              <div className="poster-center">
                <div className="poster-star">
                  ✦
                </div>

                <strong>
                  EAT
                  <br />
                  OUTSIDE
                  <br />
                  THE BOX
                </strong>
              </div>

              <div className="poster-bottom">
                <span>
                  FRESH / FAST / FEARLESS
                </span>

                <span>
                  2026
                </span>
              </div>
            </div>
          </div>
        </section>

        {!user && (
          <section className="join-banner">
            <div>
              <span className="eyebrow">
                YOUR NOVA ACCOUNT
              </span>

              <h2>
                Save your orbit.
              </h2>

              <p>
                Sign in to keep orders, profile details
                and delivery history together.
              </p>
            </div>

            <button
              className="btn btn-primary"
              onClick={() =>
                navigate('/auth')
              }>
              Create account
              <Icon
                name="arrow"
                size={17}
              />
            </button>
          </section>
        )}
      </section>
    </div>
  );
}
function MenuPage({
  cart,
  addToCart,
  setModal,
}) {
  const [query, setQuery] =
    useState('');

  const [category, setCategory] =
    useState('All');

  const categories = [
    'All',
    ...Array.from(
      new Set(
        MENU.map(
          (item) => item.category
        )
      )
    ),
  ];

  const filtered = MENU.filter(
    (item) => {
      const matchesCategory =
        category === 'All' ||
        item.category === category;

      const matchesQuery =
        !query.trim() ||
        item.name
          .toLowerCase()
          .includes(
            query.toLowerCase()
          ) ||
        item.category
          .toLowerCase()
          .includes(
            query.toLowerCase()
          ) ||
        item.desc
          .toLowerCase()
          .includes(
            query.toLowerCase()
          );

      return (
        matchesCategory &&
        matchesQuery
      );
    }
  );

  return (
    <div className="page-shell page-top">
      <section className="page-hero">
        <div>
          <span className="eyebrow">
            NOVA MENU
          </span>

          <h1>
            Pick your
            <br />
            <em>orbit.</em>
          </h1>

          <p>
            Every dish is designed to be a destination.
            Find your next obsession.
          </p>
        </div>

        <div className="page-hero-stat">
          <strong>
            {MENU.length}
          </strong>

          <span>
            signature
            <br />
            drops
          </span>
        </div>
      </section>

      <div className="menu-toolbar">
        <div className="menu-search">
          <Icon
            name="search"
            size={18}
          />

          <input
            value={query}
            onChange={(event) =>
              setQuery(
                event.target.value
              )
            }
            placeholder="Search the menu..."
            aria-label="Search menu"
          />
        </div>

        <div className="category-row">
          {categories.map(
            (item) => (
              <button
                key={item}
                className={
                  category === item
                    ? 'category-pill active'
                    : 'category-pill'
                }
                onClick={() =>
                  setCategory(item)
                }>
                {item}
              </button>
            )
          )}
        </div>
      </div>

      <div className="food-grid menu-full-grid">
        {filtered.map((item) => (
          <MenuCard
            key={item.id}
            item={item}
            addToCart={addToCart}
            onDetails={() =>
              setModal(item)
            }
          />
        ))}
      </div>

      {!filtered.length && (
        <EmptyState
          title="Nothing landed here."
          text="Try a different search or category."
          action="Show everything"
          onAction={() => {
            setQuery('');
            setCategory('All');
          }}
        />
      )}
    </div>
  );
}

function MenuCard({
  item,
  addToCart,
  onDetails,
}) {
  return (
    <article
      className={`menu-card tone-${item.tone}`}>
      <button
        className="menu-card-image"
        onClick={onDetails}
        aria-label={`View ${item.name}`}>
        <img
          src={item.image}
          alt={item.name}
        />

        <span className="menu-card-category">
          {item.category}
        </span>

        <span className="menu-card-rating">
          <Icon
            name="star"
            size={13}
          />
          {item.rating}
        </span>
      </button>

      <div className="menu-card-body">
        <div className="menu-card-heading">
          <div>
            <h3>
              {item.name}
            </h3>

            <p>
              {item.desc}
            </p>
          </div>

          <strong>
            {money(item.price)}
          </strong>
        </div>

        <div className="menu-card-footer">
          <span>
            <Icon
              name="clock"
              size={14}
            />
            {item.time} min
          </span>

          <div className="menu-card-actions">
            <button
              className="details-button"
              onClick={onDetails}>
              Details
            </button>

            <button
              className="add-button"
              onClick={() =>
                addToCart(item)
              }
              aria-label={`Add ${item.name} to cart`}>
              <Icon
                name="plus"
                size={17}
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function CartPage({
  cart,
  updateQty,
  clearCart,
}) {
  const navigate =
    useNavigate();

  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price) *
        Number(item.quantity),
    0
  );

  const delivery =
    cart.length === 0
      ? 0
      : subtotal >= 699
      ? 0
      : 49;

  const total =
    subtotal + delivery;

  if (!cart.length) {
    return (
      <div className="page-shell page-top">
        <EmptyState
          title="Your orbit is empty."
          text="There is plenty of universe left to taste."
          action="Explore menu"
          onAction={() =>
            navigate('/menu')
          }
        />
      </div>
    );
  }

  return (
    <div className="page-shell page-top cart-page">
      <section className="page-heading-row">
        <div>
          <span className="eyebrow">
            YOUR BAG
          </span>

          <h1>
            Ready for
            <br />
            <em>launch?</em>
          </h1>
        </div>

        <button
          className="text-button"
          onClick={clearCart}>
          Clear bag
        </button>
      </section>

      <div className="cart-layout">
        <section className="cart-list">
          {cart.map((item) => (
            <article
              className="cart-item"
              key={item.id}>
              <div
                className={`cart-thumb tone-${item.tone}`}>
                <img
                  src={item.image}
                  alt={item.name}
                />
              </div>

              <div className="cart-item-info">
                <span>
                  {item.category}
                </span>

                <h2>
                  {item.name}
                </h2>

                <p>
                  {item.desc}
                </p>

                <strong>
                  {money(
                    item.price *
                      item.quantity
                  )}
                </strong>
              </div>

              <div className="quantity-control">
                <button
                  onClick={() =>
                    updateQty(
                      item.id,
                      -1
                    )
                  }
                  aria-label="Decrease quantity">
                  <Icon
                    name="minus"
                    size={15}
                  />
                </button>

                <span>
                  {item.quantity}
                </span>

                <button
                  onClick={() =>
                    updateQty(
                      item.id,
                      1
                    )
                  }
                  aria-label="Increase quantity">
                  <Icon
                    name="plus"
                    size={15}
                  />
                </button>
              </div>
            </article>
          ))}
        </section>

        <aside className="checkout-summary">
          <div className="summary-top">
            <span className="eyebrow">
              ORDER SUMMARY
            </span>

            <span className="summary-secure">
              <Icon
                name="shield"
                size={14}
              />
              Secure
            </span>
          </div>

          <div className="summary-lines">
            <div>
              <span>
                Subtotal
              </span>

              <strong>
                {money(subtotal)}
              </strong>
            </div>

            <div>
              <span>
                Delivery
              </span>

              <strong>
                {delivery === 0
                  ? 'FREE'
                  : money(delivery)}
              </strong>
            </div>
          </div>

          {delivery > 0 && (
            <div className="free-delivery-note">
              Add {money(
                Math.max(
                  0,
                  699 - subtotal
                )
              )}{' '}
              more for free delivery.
            </div>
          )}

          <div className="summary-total">
            <span>
              Total
            </span>

            <strong>
              {money(total)}
            </strong>
          </div>

          <button
            className="btn btn-primary full-width"
            onClick={() =>
              navigate('/checkout')
            }>
            Continue to checkout
            <Icon
              name="arrow"
              size={17}
            />
          </button>

          <div className="cod-note">
            <span className="cod-dot" />

            <div>
              <strong>
                Cash on delivery
              </strong>

              <small>
                Pay when your NOVA order arrives.
              </small>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function OffersPage({
  setToast,
}) {
  const navigate =
    useNavigate();

  const copyCode = async (
    code
  ) => {
    try {
      await navigator.clipboard.writeText(
        code
      );

      setToast({
        type: 'success',
        title: 'Code copied',
        text: `${code} is ready for checkout.`,
      });
    } catch {
      setToast({
        type: 'info',
        title: code,
        text: 'Use this code at checkout.',
      });
    }
  };

  return (
    <div className="page-shell page-top offers-page">
      <section className="offers-hero">
        <div>
          <span className="eyebrow">
            NOVA DROPS
          </span>

          <h1>
            More food.
            <br />
            <em>Less damage.</em>
          </h1>

          <p>
            Fresh codes for your next launch.
            Copy one and let your appetite do the rest.
          </p>
        </div>

        <div className="offer-orbit">
          <span>
            SAVE
          </span>

          <strong>
            ₹
          </strong>

          <small>
            NOVA
          </small>
        </div>
      </section>

      <div className="offers-grid">
        {OFFERS.map(
          (offer) => (
            <article
              className={`offer-card offer-${offer.accent}`}
              key={offer.id}>
              <div className="offer-card-top">
                <span>
                  NOVA OFFER
                </span>

                <Icon
                  name="spark"
                  size={19}
                />
              </div>

              <h2>
                {offer.title}
              </h2>

              <p>
                {offer.detail}
              </p>

              <button
                className="offer-code"
                onClick={() =>
                  copyCode(
                    offer.id
                  )
                }>
                Copy code
                <Icon
                  name="arrow"
                  size={15}
                />
              </button>
            </article>
          )
        )}
      </div>

      <section className="offer-bottom-banner">
        <div>
          <span className="eyebrow">
            READY?
          </span>

          <h2>
            Your next meal
            <br />
            is already waiting.
          </h2>
        </div>

        <button
          className="btn btn-primary"
          onClick={() =>
            navigate('/menu')
          }>
          Start ordering
          <Icon
            name="arrow"
            size={17}
          />
        </button>
      </section>
    </div>
  );
}

function CheckoutPage({
  user,
  cart,
  clearCart,
  setToast,
}) {
  const navigate =
    useNavigate();

  const [address, setAddress] =
    useState('');

  const [phone, setPhone] =
    useState(
      user?.user_metadata?.phone ||
        ''
    );

  const [placing, setPlacing] =
    useState(false);

  const [note, setNote] =
    useState('');

  const [coupon, setCoupon] =
    useState('');

  const [couponApplied, setCouponApplied] =
    useState(false);

  useEffect(() => {
    const savedAddress =
      localStorage.getItem(
        'najaf-address'
      );

    if (savedAddress) {
      setAddress(savedAddress);
    }
  }, []);

  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price) *
        Number(item.quantity),
    0
  );

  const delivery =
    subtotal >= 699 ? 0 : 49;

  const discount =
    couponApplied &&
    coupon.toUpperCase() ===
      'NOVA100' &&
    subtotal >= 499
      ? 100
      : 0;

  const total = Math.max(
    0,
    subtotal +
      delivery -
      discount
  );

  const applyCoupon = () => {
    const code =
      coupon
        .trim()
        .toUpperCase();

    if (
      code === 'NOVA100' &&
      subtotal >= 499
    ) {
      setCouponApplied(true);

      setToast({
        type: 'success',
        title: '₹100 unlocked',
        text: 'NOVA100 has been applied.',
      });

      return;
    }

    if (
      code === 'FIRSTBITE'
    ) {
      setCouponApplied(false);

      setToast({
        type: 'info',
        title: 'First-bite offer',
        text: 'This offer is reserved for eligible first orders.',
      });

      return;
    }

    setCouponApplied(false);

    setToast({
      type: 'error',
      title: 'Code not valid',
      text: 'Check the code and order minimum.',
    });
  };

  const placeOrder = async (
    event
  ) => {
    event.preventDefault();

    if (!cart.length) {
      navigate('/cart');
      return;
    }

    if (!address.trim()) {
      setToast({
        type: 'error',
        title: 'Address required',
        text: 'Tell us where the food should land.',
      });

      return;
    }

    if (!phone.trim()) {
      setToast({
        type: 'error',
        title: 'Phone required',
        text: 'Add a delivery phone number.',
      });

      return;
    }

    setPlacing(true);

    try {
      localStorage.setItem(
        'najaf-address',
        address.trim()
      );

      const created =
        await createCodOrder({
          userId: user.id,
          userEmail: user.email,
          phone: phone.trim(),
          address: address.trim(),
          note: note.trim(),
          items: cart,
          subtotal,
          deliveryFee: delivery,
          discount,
          total,
        });

      try {
        await sendOrderConfirmation({
          to: user.email,
          subject: `NAJAF Order Confirmed • ${created.dbOrderId}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:24px">
              <h1>NAJAF NOVA FOOD</h1>
              <h2>Order confirmed 🎉</h2>
              <p>Order: <strong>${created.dbOrderId}</strong></p>
              <p>Payment: <strong>Cash on Delivery</strong></p>
              <p>Delivery address: ${address}</p>
              <p>Your order has been successfully placed.</p>
            </div>
          `,
        });
      } catch (
        emailError
      ) {
        console.error(
          'Order created, but confirmation email could not be sent:',
          emailError
        );
      }

      clearCart();

      setToast({
        type: 'success',
        title: 'Order launched',
        text: `Order ${created.dbOrderId} is confirmed.`,
      });

      navigate(
        `/success/${created.dbOrderId}`
      );
    } catch (error) {
      console.error(
        'Checkout error:',
        error
      );

      setToast({
        type: 'error',
        title: 'Could not place order',
        text:
          error.message ||
          'Please try again.',
      });
    } finally {
      setPlacing(false);
    }
  };

  if (!cart.length) {
    return (
      <div className="page-shell page-top">
        <EmptyState
          title="Nothing to check out."
          text="Your bag is empty."
          action="Back to menu"
          onAction={() =>
            navigate('/menu')
          }
        />
      </div>
    );
  }

  return (
    <div className="page-shell page-top checkout-page">
      <section className="page-heading-row">
        <div>
          <span className="eyebrow">
            FINAL CHECK
          </span>

          <h1>
            Prepare for
            <br />
            <em>takeoff.</em>
          </h1>
        </div>

        <div className="checkout-account">
          <span className="avatar">
            {getInitials(user)}
          </span>

          <div>
            <small>
              Signed in as
            </small>

            <strong>
              {user.email}
            </strong>
          </div>
        </div>
      </section>

      <form
        className="checkout-layout"
        onSubmit={placeOrder}>
        <section className="checkout-form">
          <div className="checkout-section">
            <div className="checkout-section-heading">
              <span>
                01
              </span>

              <div>
                <h2>
                  Where should we land?
                </h2>

                <p>
                  Give the rider a clear destination.
                </p>
              </div>
            </div>

            <label className="field-label">
              Delivery address

              <div className="field-with-icon">
                <Icon
                  name="location"
                  size={17}
                />

                <textarea
                  value={address}
                  onChange={(event) =>
                    setAddress(
                      event.target.value
                    )
                  }
                  placeholder="House / flat, street, area, Bengaluru"
                  rows={4}
                  required
                />
              </div>
            </label>

            <label className="field-label">
              Phone number

              <div className="field-with-icon">
                <Icon
                  name="phone"
                  size={17}
                />

                <input
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target.value
                    )
                  }
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </label>
          </div>

          <div className="checkout-section">
            <div className="checkout-section-heading">
              <span>
                02
              </span>

              <div>
                <h2>
                  Payment
                </h2>

                <p>
                  Simple. Familiar. No card details.
                </p>
              </div>
            </div>

            <div className="payment-option selected">
              <div className="payment-icon">
                ₹
              </div>

              <div>
                <strong>
                  Cash on delivery
                </strong>

                <span>
                  Pay when your food arrives.
                </span>
              </div>

              <span className="payment-check">
                <Icon
                  name="check"
                  size={15}
                />
              </span>
            </div>
          </div>

          <div className="checkout-section">
            <div className="checkout-section-heading">
              <span>
                03
              </span>

              <div>
                <h2>
                  Last details
                </h2>

                <p>
                  Optional notes for your order.
                </p>
              </div>
            </div>

            <label className="field-label">
              Delivery note

              <textarea
                value={note}
                onChange={(event) =>
                  setNote(
                    event.target.value
                  )
                }
                placeholder="Gate number, landmark, no onions..."
                rows={3}
              />
            </label>
          </div>
        </section>

        <aside className="checkout-summary sticky-summary">
          <span className="eyebrow">
            YOUR LAUNCH MANIFEST
          </span>

          <div className="mini-order-list">
            {cart.map(
              (item) => (
                <div
                  key={item.id}
                  className="mini-order-item">
                  <span className="mini-qty">
                    {item.quantity}
                  </span>

                  <div>
                    <strong>
                      {item.name}
                    </strong>

                    <small>
                      {money(item.price)} each
                    </small>
                  </div>

                  <strong>
                    {money(
                      item.price *
                        item.quantity
                    )}
                  </strong>
                </div>
              )
            )}
          </div>

          <div className="coupon-row">
            <input
              value={coupon}
              onChange={(event) =>
                setCoupon(
                  event.target.value
                )
              }
              placeholder="Promo code"
            />

            <button
              type="button"
              onClick={applyCoupon}>
              Apply
            </button>
          </div>

          <div className="summary-lines">
            <div>
              <span>
                Subtotal
              </span>

              <strong>
                {money(subtotal)}
              </strong>
            </div>

            <div>
              <span>
                Delivery
              </span>

              <strong>
                {delivery === 0
                  ? 'FREE'
                  : money(delivery)}
              </strong>
            </div>

            {discount > 0 && (
              <div className="discount-line">
                <span>
                  NOVA100
                </span>

                <strong>
                  -{money(discount)}
                </strong>
              </div>
            )}
          </div>

          <div className="summary-total">
            <span>
              Total
            </span>

            <strong>
              {money(total)}
            </strong>
          </div>

          <button
            type="submit"
            className="btn btn-primary full-width"
            disabled={placing}>
            {placing
              ? 'Launching order...'
              : 'Place COD order'}
            {!placing && (
              <Icon
                name="arrow"
                size={17}
              />
            )}
          </button>

          <div className="checkout-security">
            <Icon
              name="lock"
              size={15}
            />

            <span>
              Your account and order details stay
              protected by your secure session.
            </span>
          </div>
        </aside>
      </form>
    </div>
  );
}
function MenuPage({
  cart,
  addToCart,
  setModal,
}) {
  const [query, setQuery] =
    useState('');

  const [category, setCategory] =
    useState('All');

  const categories = [
    'All',
    ...Array.from(
      new Set(
        MENU.map(
          (item) => item.category
        )
      )
    ),
  ];

  const filtered = MENU.filter(
    (item) => {
      const matchesCategory =
        category === 'All' ||
        item.category === category;

      const matchesQuery =
        !query.trim() ||
        item.name
          .toLowerCase()
          .includes(
            query.toLowerCase()
          ) ||
        item.category
          .toLowerCase()
          .includes(
            query.toLowerCase()
          ) ||
        item.desc
          .toLowerCase()
          .includes(
            query.toLowerCase()
          );

      return (
        matchesCategory &&
        matchesQuery
      );
    }
  );

  return (
    <div className="page-shell page-top">
      <section className="page-hero">
        <div>
          <span className="eyebrow">
            NOVA MENU
          </span>

          <h1>
            Pick your
            <br />
            <em>orbit.</em>
          </h1>

          <p>
            Every dish is designed to be a destination.
            Find your next obsession.
          </p>
        </div>

        <div className="page-hero-stat">
          <strong>
            {MENU.length}
          </strong>

          <span>
            signature
            <br />
            drops
          </span>
        </div>
      </section>

      <div className="menu-toolbar">
        <div className="menu-search">
          <Icon
            name="search"
            size={18}
          />

          <input
            value={query}
            onChange={(event) =>
              setQuery(
                event.target.value
              )
            }
            placeholder="Search the menu..."
            aria-label="Search menu"
          />
        </div>

        <div className="category-row">
          {categories.map(
            (item) => (
              <button
                key={item}
                className={
                  category === item
                    ? 'category-pill active'
                    : 'category-pill'
                }
                onClick={() =>
                  setCategory(item)
                }>
                {item}
              </button>
            )
          )}
        </div>
      </div>

      <div className="food-grid menu-full-grid">
        {filtered.map((item) => (
          <MenuCard
            key={item.id}
            item={item}
            addToCart={addToCart}
            onDetails={() =>
              setModal(item)
            }
          />
        ))}
      </div>

      {!filtered.length && (
        <EmptyState
          title="Nothing landed here."
          text="Try a different search or category."
          action="Show everything"
          onAction={() => {
            setQuery('');
            setCategory('All');
          }}
        />
      )}
    </div>
  );
}

function MenuCard({
  item,
  addToCart,
  onDetails,
}) {
  return (
    <article
      className={`menu-card tone-${item.tone}`}>
      <button
        className="menu-card-image"
        onClick={onDetails}
        aria-label={`View ${item.name}`}>
        <img
          src={item.image}
          alt={item.name}
        />

        <span className="menu-card-category">
          {item.category}
        </span>

        <span className="menu-card-rating">
          <Icon
            name="star"
            size={13}
          />
          {item.rating}
        </span>
      </button>

      <div className="menu-card-body">
        <div className="menu-card-heading">
          <div>
            <h3>
              {item.name}
            </h3>

            <p>
              {item.desc}
            </p>
          </div>

          <strong>
            {money(item.price)}
          </strong>
        </div>

        <div className="menu-card-footer">
          <span>
            <Icon
              name="clock"
              size={14}
            />
            {item.time} min
          </span>

          <div className="menu-card-actions">
            <button
              className="details-button"
              onClick={onDetails}>
              Details
            </button>

            <button
              className="add-button"
              onClick={() =>
                addToCart(item)
              }
              aria-label={`Add ${item.name} to cart`}>
              <Icon
                name="plus"
                size={17}
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function CartPage({
  cart,
  updateQty,
  clearCart,
}) {
  const navigate =
    useNavigate();

  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price) *
        Number(item.quantity),
    0
  );

  const delivery =
    cart.length === 0
      ? 0
      : subtotal >= 699
      ? 0
      : 49;

  const total =
    subtotal + delivery;

  if (!cart.length) {
    return (
      <div className="page-shell page-top">
        <EmptyState
          title="Your orbit is empty."
          text="There is plenty of universe left to taste."
          action="Explore menu"
          onAction={() =>
            navigate('/menu')
          }
        />
      </div>
    );
  }

  return (
    <div className="page-shell page-top cart-page">
      <section className="page-heading-row">
        <div>
          <span className="eyebrow">
            YOUR BAG
          </span>

          <h1>
            Ready for
            <br />
            <em>launch?</em>
          </h1>
        </div>

        <button
          className="text-button"
          onClick={clearCart}>
          Clear bag
        </button>
      </section>

      <div className="cart-layout">
        <section className="cart-list">
          {cart.map((item) => (
            <article
              className="cart-item"
              key={item.id}>
              <div
                className={`cart-thumb tone-${item.tone}`}>
                <img
                  src={item.image}
                  alt={item.name}
                />
              </div>

              <div className="cart-item-info">
                <span>
                  {item.category}
                </span>

                <h2>
                  {item.name}
                </h2>

                <p>
                  {item.desc}
                </p>

                <strong>
                  {money(
                    item.price *
                      item.quantity
                  )}
                </strong>
              </div>

              <div className="quantity-control">
                <button
                  onClick={() =>
                    updateQty(
                      item.id,
                      -1
                    )
                  }
                  aria-label="Decrease quantity">
                  <Icon
                    name="minus"
                    size={15}
                  />
                </button>

                <span>
                  {item.quantity}
                </span>

                <button
                  onClick={() =>
                    updateQty(
                      item.id,
                      1
                    )
                  }
                  aria-label="Increase quantity">
                  <Icon
                    name="plus"
                    size={15}
                  />
                </button>
              </div>
            </article>
          ))}
        </section>

        <aside className="checkout-summary">
          <div className="summary-top">
            <span className="eyebrow">
              ORDER SUMMARY
            </span>

            <span className="summary-secure">
              <Icon
                name="shield"
                size={14}
              />
              Secure
            </span>
          </div>

          <div className="summary-lines">
            <div>
              <span>
                Subtotal
              </span>

              <strong>
                {money(subtotal)}
              </strong>
            </div>

            <div>
              <span>
                Delivery
              </span>

              <strong>
                {delivery === 0
                  ? 'FREE'
                  : money(delivery)}
              </strong>
            </div>
          </div>

          {delivery > 0 && (
            <div className="free-delivery-note">
              Add {money(
                Math.max(
                  0,
                  699 - subtotal
                )
              )}{' '}
              more for free delivery.
            </div>
          )}

          <div className="summary-total">
            <span>
              Total
            </span>

            <strong>
              {money(total)}
            </strong>
          </div>

          <button
            className="btn btn-primary full-width"
            onClick={() =>
              navigate('/checkout')
            }>
            Continue to checkout
            <Icon
              name="arrow"
              size={17}
            />
          </button>

          <div className="cod-note">
            <span className="cod-dot" />

            <div>
              <strong>
                Cash on delivery
              </strong>

              <small>
                Pay when your NOVA order arrives.
              </small>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function OffersPage({
  setToast,
}) {
  const navigate =
    useNavigate();

  const copyCode = async (
    code
  ) => {
    try {
      await navigator.clipboard.writeText(
        code
      );

      setToast({
        type: 'success',
        title: 'Code copied',
        text: `${code} is ready for checkout.`,
      });
    } catch {
      setToast({
        type: 'info',
        title: code,
        text: 'Use this code at checkout.',
      });
    }
  };

  return (
    <div className="page-shell page-top offers-page">
      <section className="offers-hero">
        <div>
          <span className="eyebrow">
            NOVA DROPS
          </span>

          <h1>
            More food.
            <br />
            <em>Less damage.</em>
          </h1>

          <p>
            Fresh codes for your next launch.
            Copy one and let your appetite do the rest.
          </p>
        </div>

        <div className="offer-orbit">
          <span>
            SAVE
          </span>

          <strong>
            ₹
          </strong>

          <small>
            NOVA
          </small>
        </div>
      </section>

      <div className="offers-grid">
        {OFFERS.map(
          (offer) => (
            <article
              className={`offer-card offer-${offer.accent}`}
              key={offer.id}>
              <div className="offer-card-top">
                <span>
                  NOVA OFFER
                </span>

                <Icon
                  name="spark"
                  size={19}
                />
              </div>

              <h2>
                {offer.title}
              </h2>

              <p>
                {offer.detail}
              </p>

              <button
                className="offer-code"
                onClick={() =>
                  copyCode(
                    offer.id
                  )
                }>
                Copy code
                <Icon
                  name="arrow"
                  size={15}
                />
              </button>
            </article>
          )
        )}
      </div>

      <section className="offer-bottom-banner">
        <div>
          <span className="eyebrow">
            READY?
          </span>

          <h2>
            Your next meal
            <br />
            is already waiting.
          </h2>
        </div>

        <button
          className="btn btn-primary"
          onClick={() =>
            navigate('/menu')
          }>
          Start ordering
          <Icon
            name="arrow"
            size={17}
          />
        </button>
      </section>
    </div>
  );
}

function CheckoutPage({
  user,
  cart,
  clearCart,
  setToast,
}) {
  const navigate =
    useNavigate();

  const [address, setAddress] =
    useState('');

  const [phone, setPhone] =
    useState(
      user?.user_metadata?.phone ||
        ''
    );

  const [placing, setPlacing] =
    useState(false);

  const [note, setNote] =
    useState('');

  const [coupon, setCoupon] =
    useState('');

  const [couponApplied, setCouponApplied] =
    useState(false);

  useEffect(() => {
    const savedAddress =
      localStorage.getItem(
        'najaf-address'
      );

    if (savedAddress) {
      setAddress(savedAddress);
    }
  }, []);

  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price) *
        Number(item.quantity),
    0
  );

  const delivery =
    subtotal >= 699 ? 0 : 49;

  const discount =
    couponApplied &&
    coupon.toUpperCase() ===
      'NOVA100' &&
    subtotal >= 499
      ? 100
      : 0;

  const total = Math.max(
    0,
    subtotal +
      delivery -
      discount
  );

  const applyCoupon = () => {
    const code =
      coupon
        .trim()
        .toUpperCase();

    if (
      code === 'NOVA100' &&
      subtotal >= 499
    ) {
      setCouponApplied(true);

      setToast({
        type: 'success',
        title: '₹100 unlocked',
        text: 'NOVA100 has been applied.',
      });

      return;
    }

    if (
      code === 'FIRSTBITE'
    ) {
      setCouponApplied(false);

      setToast({
        type: 'info',
        title: 'First-bite offer',
        text: 'This offer is reserved for eligible first orders.',
      });

      return;
    }

    setCouponApplied(false);

    setToast({
      type: 'error',
      title: 'Code not valid',
      text: 'Check the code and order minimum.',
    });
  };

  const placeOrder = async (
    event
  ) => {
    event.preventDefault();

    if (!cart.length) {
      navigate('/cart');
      return;
    }

    if (!address.trim()) {
      setToast({
        type: 'error',
        title: 'Address required',
        text: 'Tell us where the food should land.',
      });

      return;
    }

    if (!phone.trim()) {
      setToast({
        type: 'error',
        title: 'Phone required',
        text: 'Add a delivery phone number.',
      });

      return;
    }

    setPlacing(true);

    try {
      localStorage.setItem(
        'najaf-address',
        address.trim()
      );

      const created =
        await createCodOrder({
          userId: user.id,
          userEmail: user.email,
          phone: phone.trim(),
          address: address.trim(),
          note: note.trim(),
          items: cart,
          subtotal,
          deliveryFee: delivery,
          discount,
          total,
        });

      try {
        await sendOrderConfirmation({
          to: user.email,
          subject: `NAJAF Order Confirmed • ${created.dbOrderId}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:24px">
              <h1>NAJAF NOVA FOOD</h1>
              <h2>Order confirmed 🎉</h2>
              <p>Order: <strong>${created.dbOrderId}</strong></p>
              <p>Payment: <strong>Cash on Delivery</strong></p>
              <p>Delivery address: ${address}</p>
              <p>Your order has been successfully placed.</p>
            </div>
          `,
        });
      } catch (
        emailError
      ) {
        console.error(
          'Order created, but confirmation email could not be sent:',
          emailError
        );
      }

      clearCart();

      setToast({
        type: 'success',
        title: 'Order launched',
        text: `Order ${created.dbOrderId} is confirmed.`,
      });

      navigate(
        `/success/${created.dbOrderId}`
      );
    } catch (error) {
      console.error(
        'Checkout error:',
        error
      );

      setToast({
        type: 'error',
        title: 'Could not place order',
        text:
          error.message ||
          'Please try again.',
      });
    } finally {
      setPlacing(false);
    }
  };

  if (!cart.length) {
    return (
      <div className="page-shell page-top">
        <EmptyState
          title="Nothing to check out."
          text="Your bag is empty."
          action="Back to menu"
          onAction={() =>
            navigate('/menu')
          }
        />
      </div>
    );
  }

  return (
    <div className="page-shell page-top checkout-page">
      <section className="page-heading-row">
        <div>
          <span className="eyebrow">
            FINAL CHECK
          </span>

          <h1>
            Prepare for
            <br />
            <em>takeoff.</em>
          </h1>
        </div>

        <div className="checkout-account">
          <span className="avatar">
            {getInitials(user)}
          </span>

          <div>
            <small>
              Signed in as
            </small>

            <strong>
              {user.email}
            </strong>
          </div>
        </div>
      </section>

      <form
        className="checkout-layout"
        onSubmit={placeOrder}>
        <section className="checkout-form">
          <div className="checkout-section">
            <div className="checkout-section-heading">
              <span>
                01
              </span>

              <div>
                <h2>
                  Where should we land?
                </h2>

                <p>
                  Give the rider a clear destination.
                </p>
              </div>
            </div>

            <label className="field-label">
              Delivery address

              <div className="field-with-icon">
                <Icon
                  name="location"
                  size={17}
                />

                <textarea
                  value={address}
                  onChange={(event) =>
                    setAddress(
                      event.target.value
                    )
                  }
                  placeholder="House / flat, street, area, Bengaluru"
                  rows={4}
                  required
                />
              </div>
            </label>

            <label className="field-label">
              Phone number

              <div className="field-with-icon">
                <Icon
                  name="phone"
                  size={17}
                />

                <input
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target.value
                    )
                  }
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </label>
          </div>

          <div className="checkout-section">
            <div className="checkout-section-heading">
              <span>
                02
              </span>

              <div>
                <h2>
                  Payment
                </h2>

                <p>
                  Simple. Familiar. No card details.
                </p>
              </div>
            </div>

            <div className="payment-option selected">
              <div className="payment-icon">
                ₹
              </div>

              <div>
                <strong>
                  Cash on delivery
                </strong>

                <span>
                  Pay when your food arrives.
                </span>
              </div>

              <span className="payment-check">
                <Icon
                  name="check"
                  size={15}
                />
              </span>
            </div>
          </div>

          <div className="checkout-section">
            <div className="checkout-section-heading">
              <span>
                03
              </span>

              <div>
                <h2>
                  Last details
                </h2>

                <p>
                  Optional notes for your order.
                </p>
              </div>
            </div>

            <label className="field-label">
              Delivery note

              <textarea
                value={note}
                onChange={(event) =>
                  setNote(
                    event.target.value
                  )
                }
                placeholder="Gate number, landmark, no onions..."
                rows={3}
              />
            </label>
          </div>
        </section>

        <aside className="checkout-summary sticky-summary">
          <span className="eyebrow">
            YOUR LAUNCH MANIFEST
          </span>

          <div className="mini-order-list">
            {cart.map(
              (item) => (
                <div
                  key={item.id}
                  className="mini-order-item">
                  <span className="mini-qty">
                    {item.quantity}
                  </span>

                  <div>
                    <strong>
                      {item.name}
                    </strong>

                    <small>
                      {money(item.price)} each
                    </small>
                  </div>

                  <strong>
                    {money(
                      item.price *
                        item.quantity
                    )}
                  </strong>
                </div>
              )
            )}
          </div>

          <div className="coupon-row">
            <input
              value={coupon}
              onChange={(event) =>
                setCoupon(
                  event.target.value
                )
              }
              placeholder="Promo code"
            />

            <button
              type="button"
              onClick={applyCoupon}>
              Apply
            </button>
          </div>

          <div className="summary-lines">
            <div>
              <span>
                Subtotal
              </span>

              <strong>
                {money(subtotal)}
              </strong>
            </div>

            <div>
              <span>
                Delivery
              </span>

              <strong>
                {delivery === 0
                  ? 'FREE'
                  : money(delivery)}
              </strong>
            </div>

            {discount > 0 && (
              <div className="discount-line">
                <span>
                  NOVA100
                </span>

                <strong>
                  -{money(discount)}
                </strong>
              </div>
            )}
          </div>

          <div className="summary-total">
            <span>
              Total
            </span>

            <strong>
              {money(total)}
            </strong>
          </div>

          <button
            type="submit"
            className="btn btn-primary full-width"
            disabled={placing}>
            {placing
              ? 'Launching order...'
              : 'Place COD order'}
            {!placing && (
              <Icon
                name="arrow"
                size={17}
              />
            )}
          </button>

          <div className="checkout-security">
            <Icon
              name="lock"
              size={15}
            />

            <span>
              Your account and order details stay
              protected by your secure session.
            </span>
          </div>
        </aside>
      </form>
    </div>
  );
}
function NotFoundPage() {
  const navigate =
    useNavigate();

  return (
    <div className="page-shell page-top not-found-page">
      <div className="not-found-number">
        404
      </div>

      <span className="eyebrow">
        LOST IN THE ORBIT
      </span>

      <h1>
        This page
        <br />
        <em>drifted away.</em>
      </h1>

      <p>
        The destination you're looking for doesn't
        exist in the current NOVA route.
      </p>

      <div className="not-found-actions">
        <button
          className="btn btn-primary"
          onClick={() =>
            navigate('/home')
          }>
          Back home
          <Icon
            name="arrow"
            size={17}
          />
        </button>

        <button
          className="btn btn-secondary"
          onClick={() =>
            navigate('/menu')
          }>
          Explore menu
        </button>
      </div>
    </div>
  );
}

function Toast({
  toast,
  onClose,
}) {
  return (
    <div
      className={`toast toast-${toast.type || 'info'}`}
      role="status">
      <div className="toast-icon">
        {toast.type ===
        'error' ? (
          <Icon
            name="close"
            size={16}
          />
        ) : toast.type ===
          'success' ? (
          <Icon
            name="check"
            size={16}
          />
        ) : (
          <Icon
            name="spark"
            size={16}
          />
        )}
      </div>

      <div className="toast-copy">
        <strong>
          {toast.title}
        </strong>

        <span>
          {toast.text}
        </span>
      </div>

      <button
        className="toast-close"
        onClick={onClose}
        aria-label="Close notification">
        <Icon
          name="close"
          size={15}
        />
      </button>
    </div>
  );
}

function FoodModal({
  item,
  closeModal,
  addToCart,
}) {
  const [quantity, setQuantity] =
    useState(1);

  const add = () => {
    addToCart(
      item,
      quantity
    );

    closeModal();
  };

  return (
    <div
      className="modal-backdrop"
      onClick={closeModal}>
      <div
        className="food-modal"
        onClick={(event) =>
          event.stopPropagation()
        }>
        <button
          className="modal-close"
          onClick={closeModal}
          aria-label="Close">
          <Icon
            name="close"
            size={19}
          />
        </button>

        <div className="modal-image">
          <img
            src={item.image}
            alt={item.name}
          />

          <span>
            {item.category}
          </span>
        </div>

        <div className="modal-body">
          <div className="modal-rating">
            <Icon
              name="star"
              size={15}
            />

            {item.rating}

            <span>
              · {item.time} min
            </span>
          </div>

          <h2>
            {item.name}
          </h2>

          <p>
            {item.desc}
          </p>

          <div className="modal-price">
            {money(item.price)}
          </div>

          <div className="modal-controls">
            <div className="quantity-control">
              <button
                onClick={() =>
                  setQuantity(
                    (value) =>
                      Math.max(
                        1,
                        value - 1
                      )
                  )
                }
                aria-label="Decrease quantity">
                <Icon
                  name="minus"
                  size={15}
                />
              </button>

              <span>
                {quantity}
              </span>

              <button
                onClick={() =>
                  setQuantity(
                    (value) =>
                      value + 1
                  )
                }
                aria-label="Increase quantity">
                <Icon
                  name="plus"
                  size={15}
                />
              </button>
            </div>

            <button
              className="btn btn-primary"
              onClick={add}>
              Add to cart
              <Icon
                name="plus"
                size={17}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  const navigate =
    useNavigate();

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <button
            className="brand footer-logo"
            onClick={() =>
              navigate('/home')
            }>
            <span className="brand-mark">
              N
            </span>

            <span className="brand-copy">
              <strong>
                NAJAF
              </strong>

              <small>
                NOVA FOOD
              </small>
            </span>
          </button>

          <p>
            Food delivery with a little more
            electricity in its veins.
          </p>
        </div>

        <div className="footer-column">
          <span>
            EXPLORE
          </span>

          <button
            onClick={() =>
              navigate('/home')
            }>
            Home
          </button>

          <button
            onClick={() =>
              navigate('/menu')
            }>
            Menu
          </button>

          <button
            onClick={() =>
              navigate('/offers')
            }>
            Offers
          </button>
        </div>

        <div className="footer-column">
          <span>
            ACCOUNT
          </span>

          <button
            onClick={() =>
              navigate('/auth')
            }>
            Login
          </button>

          <button
            onClick={() =>
              navigate('/profile')
            }>
            Profile
          </button>

          <button
            onClick={() =>
              navigate('/orders')
            }>
            Orders
          </button>
        </div>

        <div className="footer-column footer-contact">
          <span>
            DELIVERY
          </span>

          <strong>
            BENGALURU
          </strong>

          <small>
            NOVA delivery network
          </small>

          <small>
            Cash on delivery available
          </small>
        </div>
      </div>

      <div className="footer-bottom">
        <span>
          © 2026 NAJAF NOVA FOOD
        </span>

        <span>
          FRESH / FAST / FEARLESS
        </span>
      </div>
    </footer>
  );
}

export default App;
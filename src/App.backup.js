import React, { useEffect, useState } from 'react';
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
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
  upsertProfile
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

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const readStorage = (key, fallback) => {
  try {
    return JSON.parse(
      localStorage.getItem(key) || JSON.stringify(fallback)
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
    eta: row.eta_minutes ? `${row.eta_minutes} min` : '—',
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
        <path d="M10 20h4" />
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
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function App() {
  const [cart, setCart] = useState(() =>
    readStorage('najaf_cart', [])
  );

  const [user, setUser] = useState(null);

  const [orders, setOrders] = useState([]);

  const [toast, setToast] = useState(null);

  const [modal, setModal] = useState(null);

  const [locationName, setLocationName] = useState(
    () =>
      localStorage.getItem('najaf_location') ||
      '7th Cross Road, Kodihalli'
  );

  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    saveStorage('najaf_cart', cart);
  }, [cart]);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return undefined;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;

      setUser(data.session?.user || null);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        setAuthLoading(false);
      }
    );

    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !user?.id) {
      setOrders([]);
      return undefined;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const rows = await fetchMyOrders();

        if (!cancelled) {
          setOrders(rows.map(normalizeOrder));
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
    if (!toast) return undefined;

    const timer = setTimeout(() => setToast(null), 3200);

    return () => clearTimeout(timer);
  }, [toast]);

  const addToCart = (item, quantity = 1) => {
    setCart((current) => {
      const found = current.find(
        (entry) => entry.id === item.id
      );

      if (found) {
        return current.map((entry) =>
          entry.id === item.id
            ? {
                ...entry,
                quantity: entry.quantity + quantity,
              }
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
            ? {
                ...item,
                quantity: item.quantity + delta,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => setCart([]);

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

  if (authLoading) {
    return (
      <div className="nova-app boot-screen">
        <Ambient />

        <div className="boot-card">
          <span className="boot-pulse" />
          <strong>Connecting to NAJAF cloud…</strong>
          <small>
            Authenticating session and opening live services.
          </small>
        </div>
      </div>
    );
  }

  return (
    <div className="nova-app">
      <Ambient />

      <Header
        cartCount={cart.reduce(
          (sum, item) => sum + item.quantity,
          0
        )}
        user={user}
        locationName={locationName}
        setLocationName={setLocationName}
        setModal={setModal}
      />

      <main>
        {!isSupabaseConfigured && (
          <div className="config-banner page-shell">
            <strong>Live services are one setup step away.</strong>

            <span>
              Add Supabase and Mapbox environment variables
              from <code>.env.example</code>.
            </span>

            <Link to="/auth">Open account setup</Link>
          </div>
        )}

        <Routes>
          <Route
            path="/"
            element={<Navigate to="/home" replace />}
          />

          <Route
            path="/home"
            element={
              <HomePage
                addToCart={addToCart}
                setModal={setModal}
                locationName={locationName}
              />
            }
          />

          <Route
            path="/menu"
            element={<MenuPage addToCart={addToCart} />}
          />

          <Route
            path="/restaurants"
            element={<RestaurantsPage />}
          />

          <Route
            path="/offers"
            element={<OffersPage setToast={setToast} />}
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
            path="/checkout"
            element={
              authLoading ? (
                <div className="page-shell page-top">
                  <div className="empty-state">
                    <h2>Checking your account…</h2>
                    <p>Keeping your NAJAF session connected.</p>
                  </div>
                </div>
              ) : user ? (
                <CheckoutPage
                  cart={cart}
                  user={user}
                  clearCart={clearCart}
                  setToast={setToast}
                />
              ) : (
                <Navigate
                  to="/auth"
                  replace
                  state={{ from: '/checkout' }}
                />
              )
            }
          />

          <Route
            path="/auth"
            element={
              <AuthPage
                setToast={setToast}
                setUser={setUser}
              />
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

      <Footer />

      {modal && (
        <AppModal
          modal={modal}
          close={() => setModal(null)}
          setLocationName={setLocationName}
        />
      )}

      {toast && (
        <Toast
          {...toast}
          close={() => setToast(null)}
        />
      )}
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

function Header({
  cartCount,
  user,
  locationName,
  setLocationName,
  setModal,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="site-header">
        <div className="top-strip">
          <div>
            <span className="live-dot" /> Live kitchen network{' '}
            <span className="top-muted">•</span> Bengaluru
          </div>

          <div className="top-links">
            <span>Fast checkout</span>
            <span>Curated local kitchens</span>
            <span>Real-time tracking</span>
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
            onClick={() =>
              setMobileOpen((value) => !value)
            }
            aria-label="Open navigation"
          >
            <Icon
              name={mobileOpen ? 'close' : 'menu'}
            />
          </button>

          <nav
            className={`main-nav ${
              mobileOpen ? 'open' : ''
            }`}
          >
            {[
              ['/home', 'Home'],
              ['/menu', 'Menu'],
              ['/restaurants', 'Restaurants'],
              ['/offers', 'Offers'],
              ['/orders', 'Orders'],
              ['/tracking/demo', 'Track'],
            ].map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? 'nav-link active'
                    : 'nav-link'
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-actions">
            <button
              className="icon-btn ghost"
              onClick={() =>
                setModal({ type: 'search' })
              }
              aria-label="Search"
            >
              <Icon name="search" />
            </button>

            <button
              className="location-chip"
              onClick={() =>
                setModal({
                  type: 'location',
                  locationName,
                  setLocationName,
                })
              }
            >
              <Icon name="pin" />

              <span>
                {locationName.split(',')[0]}
              </span>
            </button>

            <Link
              className="icon-btn ghost desktop-only"
              to={userLink(user)}
              aria-label="Profile"
            >
              <Icon name="user" />
            </Link>

            <Link
              className="cart-bubble"
              to="/cart"
              aria-label="Cart"
            >
              <Icon name="cart" />
              <span>{cartCount}</span>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}

function userLink(user) {
  return user ? '/profile' : '/auth';
}

function HomePage({
  addToCart,
  setModal,
  locationName,
}) {
  const [index, setIndex] = useState(0);

  const heroItems = [
    MENU[0],
    MENU[1],
    MENU[3],
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(
        (value) => (value + 1) % heroItems.length
      );
    }, 4200);

    return () => clearInterval(timer);
  }, [heroItems.length]);

  const hero = heroItems[index];

  return (
    <div>
      <section className="hero-shell page-shell">
        <div className="hero-copy">
          <div className="eyebrow">
            <span>01</span> food, redesigned
          </div>

          <h1>
            Eat the <em>unexpected.</em>
            <br />
            <span>Delivered in real time.</span>
          </h1>

          <p className="hero-lead">
            A high-energy food platform for discovering
            local kitchens, building a smart order and
            watching every move from prep to doorstep.
          </p>

          <div className="hero-ctas">
            <Link
              to="/menu"
              className="btn btn-primary"
            >
              Explore menu
              <Icon name="arrow" size={17} />
            </Link>

            <Link
              to="/tracking/demo"
              className="btn btn-outline"
            >
              See live tracking
            </Link>
          </div>

          <div className="hero-meta">
            <span>
              <Icon name="clock" size={15} /> Avg. 24 min
            </span>
                      <span>4.9★ community rated</span>
            <span>
              <Icon name="pin" size={15} /> {locationName}
            </span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card">
            <div className="hero-card-top">
              <span className="pill">CHEF'S SIGNAL</span>
              <span>{hero.time} min</span>
            </div>

            <div className="hero-image-wrap">
              <img
                src={hero.image}
                alt={hero.name}
                className="hero-image"
              />

              <div className="hero-image-glow" />
            </div>

            <div className="hero-card-content">
              <div>
                <span className="micro-label">
                  FEATURED TONIGHT
                </span>

                <h3>{hero.name}</h3>

                <p>{hero.desc}</p>
              </div>

              <div className="hero-card-bottom">
                <strong>{money(hero.price)}</strong>

                <button
                  className="round-add"
                  onClick={() => addToCart(hero)}
                  aria-label={`Add ${hero.name}`}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="floating-stat stat-one">
            <span className="stat-icon">
              <Icon name="spark" size={16} />
            </span>

            <span>
              <strong>98%</strong>
              <small>freshness score</small>
            </span>
          </div>

          <div className="floating-stat stat-two">
            <span className="stat-icon">
              <Icon name="clock" size={16} />
            </span>

            <span>
              <strong>24 min</strong>
              <small>average delivery</small>
            </span>
          </div>
        </div>
      </section>

      <section className="page-shell signal-row">
        <div className="signal-card">
          <div className="signal-number">01</div>
          <div>
            <strong>DISCOVER</strong>
            <span>Find kitchens that match your mood.</span>
          </div>
        </div>

        <div className="signal-card">
          <div className="signal-number">02</div>
          <div>
            <strong>BUILD</strong>
            <span>Mix favourites into one smart order.</span>
          </div>
        </div>

        <div className="signal-card">
          <div className="signal-number">03</div>
          <div>
            <strong>TRACK</strong>
            <span>Watch your delivery move in real time.</span>
          </div>
        </div>
      </section>

      <section className="page-shell section-block">
        <SectionHeading
          eyebrow="THE NOVA MENU"
          title="What are you craving?"
          text="Signature dishes, quick comfort food and late-night discoveries."
          action={
            <Link to="/menu" className="text-link">
              View full menu
              <Icon name="arrow" size={16} />
            </Link>
          }
        />

        <div className="menu-grid">
          {MENU.slice(0, 6).map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              addToCart={addToCart}
            />
          ))}
        </div>
      </section>

      <section className="page-shell discovery-banner">
        <div className="discovery-copy">
          <span className="eyebrow">
            <span>02</span> live discovery
          </span>

          <h2>
            Your next favourite
            <br />
            <em>is probably nearby.</em>
          </h2>

          <p>
            Explore Bengaluru kitchens selected for
            speed, consistency and seriously good food.
          </p>

          <Link
            to="/restaurants"
            className="btn btn-light"
          >
            Explore kitchens
            <Icon name="arrow" size={17} />
          </Link>
        </div>

        <div className="discovery-orbit">
          <div className="orbit-ring ring-one" />
          <div className="orbit-ring ring-two" />
          <div className="orbit-ring ring-three" />

          <div className="orbit-core">
            <span>N</span>
            <small>LIVE</small>
          </div>

          <div className="orbit-pin pin-one">
            <Icon name="pin" size={15} />
          </div>

          <div className="orbit-pin pin-two">
            <Icon name="pin" size={15} />
          </div>

          <div className="orbit-pin pin-three">
            <Icon name="pin" size={15} />
          </div>
        </div>
      </section>

      <section className="page-shell section-block">
        <SectionHeading
          eyebrow="CURATED KITCHENS"
          title="Restaurants with a signal."
          text="Small local kitchens. Big flavour. One platform."
          action={
            <Link
              to="/restaurants"
              className="text-link"
            >
              See all
              <Icon name="arrow" size={16} />
            </Link>
          }
        />

        <div className="restaurant-grid">
          {RESTAURANTS.slice(0, 3).map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
            />
          ))}
        </div>
      </section>

      <section className="page-shell section-block offers-section">
        <SectionHeading
          eyebrow="NOVA DROPS"
          title="Deals worth leaving the house for."
          text="Use these live offers while they are active."
        />

        <div className="offers-grid">
          {OFFERS.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              setModal={setModal}
            />
          ))}
        </div>
      </section>

      <section className="page-shell app-promo">
        <div className="app-promo-copy">
          <span className="eyebrow">
            <span>03</span> built for the whole journey
          </span>

          <h2>
            From first bite
            <br />
            <em>to front door.</em>
          </h2>

          <p>
            Order, pay with cash on delivery, track the
            rider and keep every order in one place.
          </p>

          <div className="app-points">
            <div>
              <span>01</span>
              <strong>COD checkout</strong>
              <small>Simple, secure and familiar.</small>
            </div>

            <div>
              <span>02</span>
              <strong>Live tracking</strong>
              <small>Follow your delivery route.</small>
            </div>

            <div>
              <span>03</span>
              <strong>Order history</strong>
              <small>Everything stays in your account.</small>
            </div>
          </div>
        </div>

        <div className="phone-stage">
          <div className="phone-frame">
            <div className="phone-notch" />

            <div className="phone-screen">
              <div className="phone-top">
                <span>9:41</span>
                <span>● ● ●</span>
              </div>

              <div className="phone-brand">
                <span className="brand-orbit">N</span>
                <strong>NAJAF</strong>
              </div>

              <div className="phone-map">
                <div className="phone-map-grid" />

                <div className="phone-route route-one" />
                <div className="phone-route route-two" />

                <span className="phone-location location-a">
                  <Icon name="pin" size={12} />
                </span>

                <span className="phone-location location-b">
                  <Icon name="pin" size={12} />
                </span>

                <span className="phone-rider">
                  🚴
                </span>
              </div>

              <div className="phone-order">
                <span>LIVE ORDER</span>
                <strong>On the way</strong>
                <small>Arriving in 12 min</small>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  text,
  action,
}) {
  return (
    <div className="section-heading">
      <div>
        <div className="eyebrow">
          <span>✦</span> {eyebrow}
        </div>

        <h2>{title}</h2>

        {text && <p>{text}</p>}
      </div>

      {action && <div>{action}</div>}
    </div>
  );
}

function FoodCard({ item, addToCart }) {
  return (
    <article className="food-card">
      <div className="food-image-wrap">
        <img
          src={item.image}
          alt={item.name}
          className="food-image"
        />

        <span className={`food-tone ${item.tone}`}>
          {item.category}
        </span>

        <button
          className="food-add"
          onClick={() => addToCart(item)}
          aria-label={`Add ${item.name}`}
        >
          +
        </button>
      </div>

      <div className="food-card-body">
        <div className="food-card-top">
          <span>{item.rating} ★</span>
          <span>{item.time} min</span>
        </div>

        <h3>{item.name}</h3>

        <p>{item.desc}</p>

        <div className="food-card-footer">
          <strong>{money(item.price)}</strong>

          <button
            className="mini-add"
            onClick={() => addToCart(item)}
          >
            Add
          </button>
        </div>
      </div>
    </article>
  );
}

function RestaurantCard({ restaurant }) {
  return (
    <article className="restaurant-card">
      <div className="restaurant-image-wrap">
        <img
          src={RESTAURANT_IMAGES[restaurant.id]}
          alt={restaurant.name}
          className="restaurant-image"
        />

        <span className="restaurant-tag">
          {restaurant.tag}
        </span>
      </div>

      <div className="restaurant-body">
        <div className="restaurant-avatar">
          {restaurant.initials}
        </div>

        <div className="restaurant-info">
          <h3>{restaurant.name}</h3>

          <p>{restaurant.cuisine}</p>

          <div className="restaurant-meta">
            <span>{restaurant.rating} ★</span>
            <span>{restaurant.time}</span>
          </div>
        </div>

        <button className="circle-arrow">
          <Icon name="arrow" size={16} />
        </button>
      </div>
    </article>
  );
}

function OfferCard({ offer, setModal }) {
  return (
    <article className={`offer-card offer-${offer.accent}`}>
      <div className="offer-top">
        <span className="offer-label">NOVA DROP</span>
        <span>LIMITED</span>
      </div>

      <div className="offer-code">
        {offer.title}
      </div>

      <p>{offer.detail}</p>

      <button
        className="offer-button"
        onClick={() => {
          navigator.clipboard
            ?.writeText(offer.id)
            .catch(() => {});

          setModal({
            type: 'offer',
            offer,
          });
        }}
      >
        Copy code
        <Icon name="arrow" size={15} />
      </button>
    </article>
  );
}

function MenuPage({ addToCart }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const categories = [
    'All',
    ...Array.from(
      new Set(MENU.map((item) => item.category))
    ),
  ];

  const filtered = MENU.filter((item) => {
    const matchesCategory =
      category === 'All' ||
      item.category === category;

    const searchText =
      `${item.name} ${item.category} ${item.desc}`.toLowerCase();

    return (
      matchesCategory &&
      searchText.includes(query.toLowerCase())
    );
  });

  return (
    <div className="page-shell page-top">
      <SectionHeading
        eyebrow="THE COMPLETE MENU"
        title="Pick your signal."
        text="Search the full NAJAF menu and build your order."
      />

      <div className="menu-toolbar">
        <div className="menu-search">
          <Icon name="search" size={18} />

          <input
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search food, dishes or categories..."
          />
        </div>

        <div className="category-scroll">
          {categories.map((item) => (
            <button
              key={item}
              className={
                category === item
                  ? 'category-pill active'
                  : 'category-pill'
              }
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {filtered.length ? (
        <div className="menu-grid menu-page-grid">
          {filtered.map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              addToCart={addToCart}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <Icon name="search" size={26} />
          </div>

          <h2>No food signal found.</h2>

          <p>
            Try another dish, category or search term.
          </p>
        </div>
      )}
    </div>
  );
}

function RestaurantsPage() {
  return (
    <div className="page-shell page-top">
      <SectionHeading
        eyebrow="BENGALURU KITCHEN NETWORK"
        title="Meet the kitchens."
        text="Curated restaurants connected to the NAJAF delivery network."
      />

      <div className="restaurant-grid restaurant-page-grid">
        {RESTAURANTS.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
          />
        ))}
      </div>
    </div>
  );
}

function OffersPage({ setToast }) {
  const copy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);

      setToast({
        type: 'success',
        title: 'Code copied',
        text: `${code} is ready to use.`,
      });
    } catch {
      setToast({
        type: 'info',
        title: code,
        text: 'Copy the code manually from the offer card.',
      });
    }
  };

  return (
    <div className="page-shell page-top">
      <SectionHeading
        eyebrow="LIVE OFFERS"
        title="More food. Less damage."
        text="Current promotional drops from the NAJAF network."
      />

      <div className="offers-grid offers-page-grid">
        {OFFERS.map((offer) => (
          <article
            key={offer.id}
            className={`offer-card offer-${offer.accent}`}
          >
            <div className="offer-top">
              <span className="offer-label">
                ACTIVE OFFER
              </span>

              <span>LIVE</span>
            </div>

            <div className="offer-code">
              {offer.title}
            </div>

            <p>{offer.detail}</p>

            <button
              className="offer-button"
              onClick={() => copy(offer.id)}
            >
              Copy code
              <Icon name="arrow" size={15} />
            </button>
          </article>
        ))}
      </div>

      <div className="offer-note">
        <Icon name="spark" size={18} />

        <span>
          Offers may have restaurant, minimum-order or
          time-window restrictions.
        </span>
      </div>
    </div>
  );
}
            variables, then restart the app.
            </p>

            <div className="auth-points">
              <span>✓ Persistent account session</span>
              <span>✓ Order history</span>
              <span>✓ Live order tracking</span>
              <span>✓ Secure COD checkout</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const submit = async (event) => {
    event.preventDefault();

    setBusy(true);

    try {
      if (mode === 'signup') {
        const { data, error } =
          await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                full_name: name.trim(),
              },
            },
          });

        if (error) throw error;

        if (data.user) {
          setUser(data.user);

          try {
            await upsertProfile({
              full_name: name.trim(),
            });
          } catch (profileError) {
            console.warn(
              'Profile creation warning:',
              profileError
            );
          }
        }

        setToast({
          type: 'success',
          title: 'Account created',
          text: data.session
            ? 'Your NAJAF account is ready.'
            : 'Check your email to verify your account.',
        });

        if (data.session) {
          navigate(returnTo, {
            replace: true,
          });
        }

        return;
      }

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) throw error;

      if (!data.session?.user) {
        throw new Error(
          'Login succeeded, but the Supabase session was not created. Please try again.'
        );
      }

      setUser(data.session.user);

      setToast({
        type: 'success',
        title: 'Signed in',
        text: 'Your live account is connected.',
      });

      navigate(returnTo, {
        replace: true,
      });
    } catch (error) {
      setToast({
        type: 'error',
        title:
          mode === 'signup'
            ? 'Could not create account'
            : 'Sign-in failed',
        text:
          error.message ||
          'Please check your details and try again.',
      });
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    try {
      const { error } =
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}${returnTo}`,
          },
        });

      if (error) throw error;
    } catch (error) {
      setToast({
        type: 'error',
        title: 'Google sign-in unavailable',
        text: error.message,
      });
    }
  };

  return (
    <div className="auth-shell page-shell page-top">
      <div className="auth-visual">
        <div className="auth-orbit">
          <div className="auth-ring ring-one" />
          <div className="auth-ring ring-two" />
          <div className="auth-ring ring-three" />

          <div className="auth-core">
            <span>N</span>
            <small>NOVA</small>
          </div>
        </div>

        <div className="auth-floating-card auth-card-one">
          <span>LIVE</span>
          <strong>24 min</strong>
          <small>average delivery</small>
        </div>

        <div className="auth-floating-card auth-card-two">
          <span>COD</span>
          <strong>READY</strong>
          <small>pay at your door</small>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-form-card">
          <div className="auth-brand">
            <span className="brand-orbit">N</span>

            <div>
              <strong>NAJAF</strong>
              <small>YOUR FOOD SIGNAL</small>
            </div>
          </div>

          <div className="auth-tabs">
            <button
              className={
                mode === 'signin'
                  ? 'auth-tab active'
                  : 'auth-tab'
              }
              onClick={() => setMode('signin')}
              type="button"
            >
              Sign in
            </button>

            <button
              className={
                mode === 'signup'
                  ? 'auth-tab active'
                  : 'auth-tab'
              }
              onClick={() => setMode('signup')}
              type="button"
            >
              Create account
            </button>
          </div>

          <div className="auth-heading">
            <span className="section-kicker">
              {mode === 'signin'
                ? 'WELCOME BACK'
                : 'JOIN THE NETWORK'}
            </span>

            <h1>
              {mode === 'signin'
                ? 'Welcome back.'
                : 'Create your account.'}
            </h1>

            <p>
              {mode === 'signin'
                ? 'Sign in to continue your order and tracking journey.'
                : 'Save your profile, orders and delivery history in one place.'}
            </p>
          </div>

          <button
            type="button"
            className="google-button"
            onClick={google}
          >
            <span className="google-mark">G</span>
            Continue with Google
          </button>

          <div className="auth-divider">
            <span>or continue with email</span>
          </div>

          <form onSubmit={submit}>
            {mode === 'signup' && (
              <label>
                Full name

                <input
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Your name"
                  required
                />
              </label>
            )}

            <label>
              Email address

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label>
              Password

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="At least 6 characters"
                minLength={6}
                autoComplete={
                  mode === 'signup'
                    ? 'new-password'
                    : 'current-password'
                }
                required
              />
            </label>

            <button
              className="btn btn-primary wide auth-submit"
              type="submit"
              disabled={busy}
            >
              {busy
                ? 'Connecting…'
                : mode === 'signin'
                ? 'Sign in'
                : 'Create account'}

              <Icon name="arrow" size={17} />
            </button>
          </form>

          <div className="auth-footer">
            <Icon name="lock" size={14} />

            <span>
              Protected account session powered by
              Supabase.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfilePage({
  user,
  signOut,
  setToast,
}) {
  const [name, setName] = useState(
    user.user_metadata?.full_name || ''
  );

  const [saving, setSaving] = useState(false);

  const saveProfile = async (event) => {
    event.preventDefault();

    setSaving(true);

    try {
      await upsertProfile({
        full_name: name.trim(),
      });

      setToast({
        type: 'success',
        title: 'Profile saved',
        text: 'Your NAJAF profile has been updated.',
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

  return (
    <div className="page-shell page-top">
      <SectionHead
        kicker="Your account"
        title="Profile control."
      />

      <div className="profile-layout">
        <div className="profile-card profile-identity">
          <div className="profile-avatar">
            {(
              name ||
              user.email ||
              'N'
            )
              .charAt(0)
              .toUpperCase()}
          </div>

          <span className="profile-status">
            LIVE ACCOUNT
          </span>

          <h2>
            {name ||
              user.user_metadata?.full_name ||
              'NAJAF customer'}
          </h2>

          <p>{user.email}</p>

          <div className="profile-links">
            <Link to="/orders">
              <span>
                <Icon name="grid" size={17} />
                Orders
              </span>

              <Icon name="chevron" size={16} />
            </Link>

            <Link to="/tracking/demo">
              <span>
                <Icon name="map" size={17} />
                Track delivery
              </span>

              <Icon name="chevron" size={16} />
            </Link>
          </div>

          <button
            className="btn btn-outline wide"
            onClick={signOut}
          >
            Sign out
          </button>
        </div>

        <form
          className="profile-card"
          onSubmit={saveProfile}
        >
          <div className="form-title">
            PROFILE DETAILS
          </div>

          <label>
            Full name

            <input
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Your full name"
            />
          </label>

          <label>
            Email

            <input
              value={user.email || ''}
              disabled
            />
          </label>

          <div className="profile-note">
            <Icon name="lock" size={16} />

            <span>
              Your login email is managed by
              Supabase and cannot be changed from
              this screen.
            </span>
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={saving}
          >
            {saving
              ? 'Saving…'
              : 'Save profile'}

            <Icon name="check" size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

function OrdersPage({ orders }) {
  return (
    <div className="page-shell page-top">
      <SectionHead
        kicker="Order history"
        title="Every order, in one orbit."
        link="/menu"
      />

      {!orders.length ? (
        <EmptyState
          title="No orders yet."
          text="Your confirmed orders will appear here automatically."
          action="Start ordering"
          to="/menu"
        />
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article
              className="order-card"
              key={order.id}
            >
              <div className="order-card-top">
                <div>
                  <span className="section-kicker">
                    ORDER
                  </span>

                  <h3>
                    #{String(order.id).slice(0, 8)}
                  </h3>
                </div>

                <span className="order-status">
                  {order.status}
                </span>
              </div>

              <div className="order-items">
                {order.items.map((item) => (
                  <div
                    className="order-item"
                    key={`${order.id}-${item.id}`}
                  >
                    <span>
                      {item.quantity} × {item.name}
                    </span>

                    <strong>
                      {money(
                        item.price *
                          item.quantity
                      )}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="order-card-bottom">
                <span>
                  {order.address}
                </span>

                <strong>
                  {money(order.total)}
                </strong>
              </div>

              <div className="order-actions">
                <Link
                  className="btn btn-primary compact"
                  to={`/tracking/${order.id}`}
                >
                  Track order
                  <Icon
                    name="arrow"
                    size={15}
                  />
                </Link>

                <Link
                  className="btn btn-outline compact"
                  to={`/success/${order.id}`}
                >
                  View details
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function DashboardPage({
  cart,
  orders,
  user,
}) {
  const latest = orders[0];

  return (
    <div className="page-shell page-top">
      <div className="dashboard-hero">
        <div>
          <div className="eyebrow">
            <span>NAJAF</span> account dashboard
          </div>

          <h1>
            Welcome back,
            <br />
            <em>
              {user?.user_metadata?.full_name ||
                user?.email?.split('@')[0] ||
                'food explorer'}.
            </em>
          </h1>

          <p>
            Your orders, account and delivery signals
            are all connected.
          </p>
        </div>

        <div className="dashboard-avatar">
          {(
            user?.user_metadata?.full_name ||
            user?.email ||
            'N'
          )
            .charAt(0)
            .toUpperCase()}
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-stat">
          <span>ORDERS</span>
          <strong>{orders.length}</strong>
          <small>Total confirmed orders</small>
        </div>

        <div className="dashboard-stat">
          <span>CART</span>
          <strong>
            {cart.reduce(
              (sum, item) =>
                sum + item.quantity,
              0
            )}
          </strong>
          <small>Items waiting in your bag</small>
        </div>

        <div className="dashboard-stat">
          <span>STATUS</span>
          <strong>
            {latest
              ? latest.status
              : 'READY'}
          </strong>
          <small>
            {latest
              ? 'Latest order signal'
              : 'Ready for your first order'}
          </small>
        </div>
      </div>

      {latest ? (
        <div className="dashboard-live">
          <div>
            <span className="section-kicker">
              LATEST ORDER
            </span>

            <h2>
              {latest.status}
            </h2>

            <p>
              {latest.address}
            </p>
          </div>

          <Link
            className="btn btn-primary"
            to={`/tracking/${latest.id}`}
          >
            Track live
            <Icon name="arrow" size={16} />
          </Link>
        </div>
      ) : (
        <div className="dashboard-live empty-dashboard">
          <div>
            <span className="section-kicker">
              FIRST ORDER
            </span>

            <h2>
              Your next meal starts here.
            </h2>

            <p>
              Explore the menu and create your first
              NAJAF order.
            </p>
          </div>

          <Link
            className="btn btn-primary"
            to="/menu"
          >
            Explore menu
            <Icon name="arrow" size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
              </Link>
            </>
          ) : (
            <>
              <h3>
                Your next meal is waiting.
              </h3>

              <p>
                Build an order from the NAJAF menu and
                watch it move through the live delivery
                flow.
              </p>

              <Link
                to="/menu"
                className="mini-link"
              >
                Explore menu
                <Icon
                  name="arrow"
                  size={15}
                />
              </Link>
            </>
          )}
        </div>

        <div className="dash-card">
          <div className="dash-kicker">
            CART
          </div>

          <strong className="dash-number">
            {cart.reduce(
              (sum, item) =>
                sum + item.quantity,
              0
            )}
          </strong>

          <p>items ready to checkout</p>

          <Link
            to="/cart"
            className="mini-link"
          >
            Open cart
            <Icon
              name="arrow"
              size={15}
            />
          </Link>
        </div>

        <div className="dash-card">
          <div className="dash-kicker">
            ORDERS
          </div>

          <strong className="dash-number">
            {orders.length}
          </strong>

          <p>
            confirmed orders in your account
          </p>

          <Link
            to="/orders"
            className="mini-link"
          >
            View history
            <Icon
              name="arrow"
              size={15}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  text,
  action,
  to,
  onAction,
}) {
  return (
    <div className="empty-state">
      <div className="empty-orbit">
        <span />
      </div>

      <div className="section-kicker">
        NOVA SIGNAL
      </div>

      <h2>{title}</h2>

      <p>{text}</p>

      {to ? (
        <Link
          to={to}
          className="btn btn-primary"
        >
          {action}
          <Icon
            name="arrow"
            size={16}
          />
        </Link>
      ) : (
        <button
          className="btn btn-primary"
          onClick={onAction}
        >
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

function NotFoundPage() {
  return (
    <div className="page-shell page-top">
      <EmptyState
        title="This signal went off-grid."
        text="The page you requested does not exist in the NAJAF route network."
        action="Back home"
        to="/home"
      />
    </div>
  );
}

function Toast({ toast, close }) {
  if (!toast) return null;

  return (
    <div
      className={`toast toast-${toast.type}`}
      role="status"
    >
      <div className="toast-icon">
        <Icon
          name={
            toast.type === 'error'
              ? 'alert'
              : 'check'
          }
          size={17}
        />
      </div>

      <div className="toast-copy">
        <strong>{toast.title}</strong>
        <span>{toast.text}</span>
      </div>

      <button
        className="toast-close"
        onClick={close}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-shell footer-grid">
        <div className="footer-brand">
          <Link
            to="/home"
            className="brand-lockup"
          >
            <span className="brand-mark">
              N
            </span>

            <span>
              <strong>NAJAF</strong>
              <small>NOVA FOOD PLATFORM</small>
            </span>
          </Link>

          <p>
            A live-first food delivery experience
            built around local kitchens, fast
            checkout and transparent tracking.
          </p>
        </div>

        <div className="footer-column">
          <span className="footer-label">
            EXPLORE
          </span>

          <Link to="/menu">
            Menu
          </Link>

          <Link to="/restaurants">
            Restaurants
          </Link>

          <Link to="/offers">
            Offers
          </Link>
        </div>

        <div className="footer-column">
          <span className="footer-label">
            YOUR SPACE
          </span>

          <Link to="/dashboard">
            Dashboard
          </Link>

          <Link to="/orders">
            Orders
          </Link>

          <Link to="/profile">
            Profile
          </Link>
        </div>

        <div className="footer-column">
          <span className="footer-label">
            DELIVERY
          </span>

          <Link to="/tracking/demo">
            Track order
          </Link>

          <Link to="/map/demo">
            Live map
          </Link>

          <Link to="/auth">
            Sign in
          </Link>
        </div>
      </div>

      <div className="page-shell footer-bottom">
        <span>
          © {new Date().getFullYear()} NAJAF
          NOVA FOOD PLATFORM
        </span>

        <span>
          BUILT FOR FAST LOCAL DELIVERY
        </span>
      </div>
    </footer>
  );
}

function Icon({
  name,
  size = 18,
}) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  switch (name) {
    case 'arrow':
      return (
        <svg {...common}>
          <path d="M5 12h13" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );

    case 'chevron':
      return (
        <svg {...common}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );

    case 'clock':
      return (
        <svg {...common}>
          <circle
            cx="12"
            cy="12"
            r="8.5"
          />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case 'pin':
      return (
        <svg {...common}>
          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle
            cx="12"
            cy="10"
            r="2.5"
          />
        </svg>
      );

    case 'lock':
      return (
        <svg {...common}>
          <rect
            x="5"
            y="10"
            width="14"
            height="10"
            rx="2"
          />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
      );

    case 'search':
      return (
        <svg {...common}>
          <circle
            cx="11"
            cy="11"
            r="6.5"
          />
          <path d="m16 16 4 4" />
        </svg>
      );

    case 'spark':
      return (
        <svg {...common}>
          <path d="m12 3 1.5 6.5L20 12l-6.5 1.5L12 20l-1.5-6.5L4 12l6.5-2.5L12 3Z" />
        </svg>
      );

    case 'check':
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    case 'alert':
      return (
        <svg {...common}>
          <path d="M12 3 21 19H3L12 3Z" />
          <path d="M12 9v4" />
          <path d="M12 16h.01" />
        </svg>
      );

    case 'map':
      return (
        <svg {...common}>
          <path d="m9 18-5 3V6l5-3 6 3 5-3v15l-5 3-6-3Z" />
          <path d="M9 3v15" />
          <path d="M15 6v15" />
        </svg>
      );

    case 'grid':
      return (
        <svg {...common}>
          <rect
            x="4"
            y="4"
            width="6"
            height="6"
            rx="1"
          />
          <rect
            x="14"
            y="4"
            width="6"
            height="6"
            rx="1"
          />
          <rect
            x="4"
            y="14"
            width="6"
            height="6"
            rx="1"
          />
          <rect
            x="14"
            y="14"
            width="6"
            height="6"
            rx="1"
          />
        </svg>
      );

    default:
      return (
        <svg {...common}>
          <circle
            cx="12"
            cy="12"
            r="8"
          />
        </svg>
      );
  }
}
              </Link>
            </>
          ) : (
            <>
              <h3>
                No active order.
              </h3>

              <p>
                Launch one from the menu to light up
                the dashboard.
              </p>
            </>
          )}
        </div>

        <div className="dash-card">
          <div className="dash-kicker">
            BASKET
          </div>

          <strong className="dash-number">
            {cart.reduce(
              (sum, item) =>
                sum + item.quantity,
              0
            )}
          </strong>

          <p>
            items ready to checkout
          </p>

          <Link
            className="mini-link"
            to="/cart"
          >
            Open basket
            <Icon
              name="arrow"
              size={15}
            />
          </Link>
        </div>

        <div className="dash-card">
          <div className="dash-kicker">
            ORDERS
          </div>

          <strong className="dash-number">
            {orders.length}
          </strong>

          <p>
            saved order
            {orders.length === 1
              ? ''
              : 's'}
          </p>

          <Link
            className="mini-link"
            to="/orders"
          >
            See history
            <Icon
              name="arrow"
              size={15}
            />
          </Link>
        </div>

        <div className="dash-card">
          <div className="dash-kicker">
            OFFERS
          </div>

          <strong className="dash-number">
            04
          </strong>

          <p>
            codes in the lab
          </p>

          <Link
            className="mini-link"
            to="/offers"
          >
            Explore offers
            <Icon
              name="arrow"
              size={15}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  text,
  action,
  onAction,
  to = '/menu',
}) {
  return (
    <div className="empty-state">
      <div className="empty-mark">
        ∅
      </div>

      <h2>{title}</h2>

      <p>{text}</p>

      {onAction ? (
        <button
          className="btn btn-primary"
          onClick={onAction}
        >
          {action}
        </button>
      ) : (
        <Link
          className="btn btn-primary"
          to={to}
        >
          {action}
          <Icon
            name="arrow"
            size={16}
          />
        </Link>
      )}
    </div>
  );
}

function NotFound() {
  return (
    <div className="page-shell page-top not-found">
      <div className="not-code">
        404
      </div>

      <div>
        <div className="section-kicker">
          OFF THE GRID
        </div>

        <h1>
          This route drifted away.
        </h1>

        <p>
          The page you requested is not in the
          NOVA orbit.
        </p>

        <Link
          to="/home"
          className="btn btn-primary"
        >
          Return to home
          <Icon
            name="arrow"
            size={16}
          />
        </Link>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-shell footer-grid">
        <div>
          <Link
            to="/home"
            className="brand-lockup"
          >
            <span className="brand-orbit">
              N
            </span>

            <span>
              <strong>NAJAF</strong>
              <small>
                NOVA FOOD PLATFORM
              </small>
            </span>
          </Link>

          <p className="footer-copy">
            A next-generation food interface for
            local discovery, fast ordering and live
            delivery visibility.
          </p>
        </div>

        <div className="footer-col">
          <small>DISCOVER</small>

          <Link to="/menu">
            Menu
          </Link>

          <Link to="/restaurants">
            Restaurants
          </Link>

          <Link to="/offers">
            Offers
          </Link>
        </div>

        <div className="footer-col">
          <small>ACCOUNT</small>

          <Link to="/dashboard">
            Dashboard
          </Link>

          <Link to="/profile">
            Profile
          </Link>

          <Link to="/orders">
            Orders
          </Link>
        </div>

        <div className="footer-col">
          <small>OPERATIONS</small>

          <Link to="/tracking/demo">
            Live tracking
          </Link>

          <Link to="/map/demo">
            Delivery map
          </Link>

          <Link to="/auth">
            Login / sign up
          </Link>
        </div>
      </div>

      <div className="footer-bottom page-shell">
        <span>
          © 2026 NAJAF NOVA
        </span>

        <span>
          Designed as a complete front-end replacement
        </span>

        <span>
          Built for mobile + desktop
        </span>
      </div>
    </footer>
  );
}

function AppModal({
  modal,
  close,
  setLocationName,
}) {
  const [value, setValue] = useState(
    modal.locationName ||
      '7th Cross Road, Kodihalli, Bengaluru'
  );

  const [locating, setLocating] =
    useState(false);

  if (modal.type === 'search') {
    return (
      <div
        className="modal-backdrop"
        onMouseDown={close}
      >
        <div
          className="modal-panel search-modal"
          onMouseDown={(event) =>
            event.stopPropagation()
          }
        >
          <button
            className="modal-close"
            onClick={close}
          >
            <Icon name="close" />
          </button>

          <div className="section-kicker">
            SEARCH NOVA
          </div>

          <h2>
            What are you craving?
          </h2>

          <div className="search-box big">
            <Icon name="search" />

            <input
              autoFocus
              placeholder="Pizza, burger, biryani, dessert..."
            />
          </div>

          <div className="search-suggestions">
            {MENU.slice(0, 5).map((item) => (
              <Link
                key={item.id}
                to="/menu"
                onClick={close}
              >
                <img
                  className="suggestion-photo"
                  src={item.image}
                  alt={item.name}
                />

                <div>
                  <strong>
                    {item.name}
                  </strong>

                  <small>
                    {item.category} ·{' '}
                    {money(item.price)}
                  </small>
                </div>

                <Icon
                  name="chevron"
                  size={15}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const useCurrent = () => {
    if (!('geolocation' in navigator)) {
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const label =
            await reverseGeocode({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });

          if (label) {
            setValue(label);
          }
        } finally {
          setLocating(false);
        }
      },
      () => setLocating(false),
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={close}
    >
      <div
        className="modal-panel"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <button
          className="modal-close"
          onClick={close}
        >
          <Icon name="close" />
        </button>

        <div className="section-kicker">
          REAL DELIVERY ZONE
        </div>

        <h2>
          Where should NAJAF arrive?
        </h2>

        <label>
          Delivery address

          <input
            autoFocus
            value={value}
            onChange={(event) =>
              setValue(event.target.value)
            }
          />
        </label>

        <button
          className="btn btn-outline wide"
          type="button"
          onClick={useCurrent}
          disabled={locating}
        >
          {locating
            ? 'Locating device…'
            : 'Use my current location'}

          <Icon
            name="pin"
            size={16}
          />
        </button>

        <div className="zone-preview">
          <span className="live-dot" />

          <div>
            <strong>
              Mapbox geocoding enabled
            </strong>

            <small>
              The chosen address will be geocoded and
              attached to the real order.
            </small>
          </div>
        </div>

        <button
          className="btn btn-primary wide"
          onClick={() => {
            localStorage.setItem(
              'najaf_location',
              value
            );

            setLocationName?.(value);

            close();
          }}
        >
          Save location
          <Icon
            name="arrow"
            size={16}
          />
        </button>
      </div>
    </div>
  );
}
function Toast({
  type,
  title,
  text,
  close,
}) {
  return (
    <div
      className={`toast toast-${type}`}
    >
      <span className="toast-icon">
        {type === 'success'
          ? '✓'
          : 'i'}
      </span>

      <div>
        <strong>{title}</strong>
        <small>{text}</small>
      </div>

      <button onClick={close}>
        <Icon
          name="close"
          size={15}
        />
      </button>
    </div>
  );
}

export default App;
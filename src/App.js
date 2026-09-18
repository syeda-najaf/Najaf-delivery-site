
import React, { useEffect, useState } from 'react';
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
      listener.subscription.unsubscribe();
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
            element={<AuthPage setToast={setToast} />}
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

            <span>
              <Icon name="spark" size={15} /> 4.9 customer
              signal
            </span>

            <span>
              <Icon name="lock" size={15} /> Secure
              checkout
            </span>
          </div>
        </div>

        <div className="hero-stage">
          <div className="stage-frame">
            <div className="stage-top">
              <span>
                NOVA /{' '}
                {String(index + 1).padStart(2, '0')}
              </span>
              <span>LIVE FEED</span>
            </div>

            <div
              className={`food-sphere tone-${hero.tone}`}
            >
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
              {money(hero.price)}{' '}
              <span>/ plate</span>
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
            <strong>
              {locationName.split(',')[0]}
            </strong>
            <span>delivery zone</span>
          </div>
        </div>
      </section>

      <section className="signal-row page-shell">
        {[
          [
            '01',
            'Curated kitchens',
            'Local-first, quality-controlled food partners.',
          ],
          [
            '02',
            'Live order logic',
            'One screen for ETA, rider and route.',
          ],
          [
            '03',
            'Cash-ready checkout',
            'Confirm your order without online payment details.',
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
          kicker="Today’s orbit"
          title="Fast-moving favorites"
          link="/menu"
        />

        <div className="food-grid">
          {MENU.slice(0, 6).map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              addToCart={addToCart}
            />
          ))}
        </div>
      </section>

      <section className="section page-shell split-banner">
        <div className="promo-panel promo-violet">
          <div className="promo-label">
            NOVA SIGNAL / 24H
          </div>

          <h2>
            Late-night cravings have their own lane.
          </h2>

          <p>
            Unlock rotating midnight offers, priority
            kitchen routing and hidden menu drops.
          </p>

          <Link
            to="/offers"
            className="mini-link"
          >
            See offers
            <Icon name="arrow" size={15} />
          </Link>

          <span className="promo-shape shape-a" />
          <span className="promo-shape shape-b" />
        </div>

        <div className="promo-panel promo-lime">
          <div className="promo-label">
            TRACKING / LIVE
          </div>

          <h2>
            Your order should never feel like a black box.
          </h2>

          <p>
            Open the route view to follow prep status,
            rider position and handoff ETA.
          </p>

          <Link
            to="/tracking/demo"
            className="mini-link"
          >
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
        <div className="section-kicker">
          {kicker}
        </div>

        <h2>{title}</h2>
      </div>

      {link && (
        <Link
          className="mini-link"
          to={link}
        >
          Open all
          <Icon name="arrow" size={15} />
        </Link>
      )}
    </div>
  );
}

function FoodCard({ item, addToCart }) {
  return (
    <article className="food-card">
      <div
        className={`food-visual tone-${item.tone}`}
      >
        <span className="visual-badge">
          {item.rating} ★
        </span>

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
        <div className="food-cat">
          {item.category}
        </div>

        <h3>{item.name}</h3>

        <p>{item.desc}</p>

        <div className="food-card-foot">
          <strong>{money(item.price)}</strong>

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
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const categories = [
    'All',
    ...Array.from(
      new Set(MENU.map((item) => item.category))
    ),
  ];

  const filtered = MENU.filter(
    (item) =>
      (category === 'All' ||
        item.category === category) &&
      `${item.name} ${item.desc}`
        .toLowerCase()
        .includes(query.toLowerCase())
  );

  return (
    <div className="page-shell page-top">
      <SectionHead
        kicker="The menu"
        title="Build your next order."
      />

      <div className="toolbar">
        <label className="search-box">
          <Icon name="search" size={18} />

          <input
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search by dish, flavor, craving..."
          />
        </label>

        <div className="pill-row">
          {categories.map((item) => (
            <button
              key={item}
              className={`pill ${
                category === item
                  ? 'selected'
                  : ''
              }`}
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
  const [filter, setFilter] = useState('All');

  const tags = [
    'All',
    'FAST',
    'TRENDING',
    'NEW',
    'LATE NIGHT',
  ];

  const list =
    filter === 'All'
      ? RESTAURANTS
      : RESTAURANTS.filter(
          (restaurant) => restaurant.tag === filter
        );

  return (
    <div className="page-shell page-top">
      <SectionHead
        kicker="Restaurant network"
        title="Kitchens around you."
      />

      <div className="pill-row standalone">
        {tags.map((tag) => (
          <button
            key={tag}
            className={`pill ${
              filter === tag ? 'selected' : ''
            }`}
            onClick={() => setFilter(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="restaurant-grid">
        {list.map((restaurant) => (
          <article
            className="restaurant-card"
            key={restaurant.id}
          >
            <div
              className={`restaurant-art tone-${restaurant.color}`}
            >
              <img
                src={RESTAURANT_IMAGES[restaurant.id]}
                alt={restaurant.name}
                loading="lazy"
              />

              <span className="restaurant-monogram">
                {restaurant.initials}
              </span>

              <div className="art-ring" />
            </div>

            <div className="restaurant-body">
              <div className="restaurant-tag">
                {restaurant.tag}
              </div>

              <h3>{restaurant.name}</h3>

              <p>{restaurant.cuisine}</p>

              <div className="restaurant-meta">
                <span>
                  ★ {restaurant.rating}
                </span>

                <span>{restaurant.time}</span>
              </div>

              <Link
                className="btn btn-outline compact"
                to="/menu"
              >
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
  const [copied, setCopied] = useState(null);

  const copy = (code) => {
    navigator.clipboard?.writeText(code);

    setCopied(code);

    setToast({
      type: 'success',
      title: 'Code copied',
      text: `${code} is ready at checkout.`,
    });

    setTimeout(
      () => setCopied(null),
      1800
    );
  };

  return (
    <div className="page-shell page-top">
      <SectionHead
        kicker="Savings lab"
        title="Offers worth using."
      />

      <div className="offers-grid">
        {OFFERS.map((offer) => (
          <article
            key={offer.id}
            className={`offer-card tone-${offer.accent}`}
          >
            <div className="offer-orbit" />

            <span className="offer-label">
              NOVA CODE
            </span>

            <strong>{offer.title}</strong>

            <p>{offer.detail}</p>

            <button
              className="btn btn-light"
              onClick={() => copy(offer.id)}
            >
              {copied === offer.id
                ? 'Copied'
                : 'Use code'}

              <Icon
                name={
                  copied === offer.id
                    ? 'check'
                    : 'arrow'
                }
                size={15}
              />
            </button>
          </article>
        ))}
      </div>

      <div className="offer-note">
        <Icon name="spark" size={18} />

        <div>
          <strong>
            Offers are applied at checkout.
          </strong>

          <p>
            Offer rules are stored with the order flow
            on the server. Add or change the production
            promo rules in the checkout API when you
            launch campaigns.
          </p>
        </div>
      </div>
    </div>
  );
}

function CartPage({
  cart,
  updateQty,
  clearCart,
}) {
  const subtotal = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  const delivery =
    subtotal === 0 || subtotal >= 699
      ? 0
      : 39;

  const total = subtotal + delivery;

  if (!cart.length) {
    return (
      <div className="page-shell page-top">
        <EmptyState
          title="Your order dock is empty."
          text="Pick something excellent from the menu and it will appear here."
          action="Explore menu"
          to="/menu"
        />

        <div className="mini-feature-row">
          <Link
            to="/offers"
            className="feature-tile"
          >
            <span>01</span>
            <strong>Discounts</strong>
            <small>
              Save on your next run.
            </small>
          </Link>

          <Link
            to="/restaurants"
            className="feature-tile"
          >
            <span>02</span>
            <strong>Local kitchens</strong>
            <small>
              Browse what is open now.
            </small>
          </Link>

          <Link
            to="/tracking/demo"
            className="feature-tile"
          >
            <span>03</span>
            <strong>Live tracking</strong>
            <small>
              See the route flow.
            </small>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell page-top">
      <SectionHead
        kicker="Order dock"
        title={`${cart.reduce(
          (sum, item) =>
            sum + item.quantity,
          0
        )} items ready.`}
      />

      <div className="cart-layout">
        <div className="cart-list">
          {cart.map((item) => (
            <div
              className="cart-line"
              key={item.id}
            >
              <div
                className={`cart-art tone-${item.tone}`}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                />
              </div>

              <div className="cart-main">
                <div className="food-cat">
                  {item.category}
                </div>

                <h3>{item.name}</h3>

                <p>{item.desc}</p>

                <div className="qty-control">
                  <button
                    onClick={() =>
                      updateQty(item.id, -1)
                    }
                  >
                    −
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() =>
                      updateQty(item.id, 1)
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              <strong className="cart-price">
                {money(
                  item.price * item.quantity
                )}
              </strong>
            </div>
          ))}

          <button
            className="text-button danger"
            onClick={clearCart}
          >
            Clear order
          </button>
        </div>

        <aside className="summary-card">
          <div className="summary-kicker">
            CHECKOUT PREVIEW
          </div>

          <h3>One final orbit.</h3>

          <div className="sum-row">
            <span>Items</span>
            <strong>{money(subtotal)}</strong>
          </div>

          <div className="sum-row">
            <span>Delivery</span>
            <strong>
              {delivery
                ? money(delivery)
                : 'FREE'}
            </strong>
          </div>

          <div className="sum-row total">
            <span>Total</span>
            <strong>{money(total)}</strong>
          </div>

          <Link
            className="btn btn-primary wide"
            to="/checkout"
          >
            Continue to checkout
            <Icon name="arrow" size={17} />
          </Link>

          <small className="secure-note">
            <Icon name="lock" size={13} />
            Secure checkout
          </small>
        </aside>
      </div>
    </div>
  );
}

function CheckoutPage({
  cart,
  user,
  clearCart,
  setToast,
}) {
  const navigate = useNavigate();

  const [address, setAddress] = useState(
    localStorage.getItem('najaf_location') ||
      '7th Cross Road, Kodihalli, Bengaluru'
  );

  const [busy, setBusy] = useState(false);

  if (!cart.length) {
    return <Navigate to="/cart" replace />;
  }

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  const delivery =
    subtotal >= 699 ? 0 : 39;

  const total = subtotal + delivery;

  const submit = async (event) => {
    event.preventDefault();

    if (!address.trim()) {
      setToast({
        type: 'error',
        title: 'Delivery address required',
        text: 'Please enter your delivery address before confirming the order.',
      });

      return;
    }

    setBusy(true);

    try {
      const destination =
        await geocodeAddress(address).catch(
          () => null
        );

      const items = cart.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      }));

      const created = await createCodOrder({
        items,
        address,
        destination,
      });

      clearCart();

      setToast({
        type: 'success',
        title: 'Order confirmed',
        text: `${created.dbOrderId} is now live.`,
      });

      navigate(
        `/success/${created.dbOrderId}`
      );
    } catch (error) {
      setToast({
        type: 'error',
        title: 'Checkout unavailable',
        text:
          error.message ||
          'Could not create your order.',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-shell page-top">
      <SectionHead
        kicker="Live checkout"
        title="Confirm the handoff."
      />

      <form
        className="checkout-grid"
        onSubmit={submit}
      >
        <div className="checkout-main">
          <div className="checkout-card">
            <div className="form-title">
              01 / delivery
            </div>

            <label>
              Delivery address

              <input
                value={address}
                onChange={(event) =>
                  setAddress(event.target.value)
                }
                required
              />
            </label>

            <div className="address-grid">
              <button
                type="button"
                className="address-tile selected"
              >
                <Icon name="pin" />

                <div>
                  <strong>
                    Current address
                  </strong>

                  <small>{address}</small>
                </div>

                <Icon
                  name="check"
                  size={15}
                />
              </button>

              <button
                type="button"
                className="address-tile"
                onClick={() =>
                  setAddress(
                    'Indiranagar Metro Station, Bengaluru'
                  )
                }
              >
                <Icon name="map" />

                <div>
                  <strong>
                    Use another
                  </strong>

                  <small>
                    Indiranagar Metro Station
                  </small>
                </div>
              </button>
            </div>
          </div>

          <div className="checkout-card">
            <div className="form-title">
              02 / payment
            </div>

            <div className="payment-grid">
              <button
                type="button"
                className="payment-option selected"
              >
                <span className="payment-mark">
                  COD
                </span>

                <strong>
                  Cash on delivery
                </strong>

                <small>Selected</small>
              </button>
            </div>

            <p className="payment-note">
              Pay when your food arrives. No
              online payment details are required.
            </p>
          </div>

          <div className="checkout-card reassurance">
            <Icon name="lock" />

            <div>
              <strong>
                Secure order
              </strong>

              <p>
                Your account and order are secured
                through Supabase. Cash on delivery
                keeps online payment details out of
                this checkout.
              </p>
            </div>
          </div>
        </div>

        <aside className="summary-card sticky">
          <div className="summary-kicker">
            FINAL TOTAL
          </div>

          <div className="sum-row">
            <span>Items</span>
            <strong>{money(subtotal)}</strong>
          </div>

          <div className="sum-row">
            <span>Delivery</span>
            <strong>
              {delivery
                ? money(delivery)
                : 'FREE'}
            </strong>
          </div>

          <div className="sum-row total">
            <span>Pay on delivery</span>
            <strong>{money(total)}</strong>
          </div>

          <button
            className="btn btn-primary wide"
            type="submit"
            disabled={busy}
          >
            {busy
              ? 'Confirming order…'
              : 'Confirm COD order'}

            <Icon
              name="arrow"
              size={17}
            />
          </button>

          <small className="secure-note">
            Signed in as {user.email}
          </small>
        </aside>
      </form>
    </div>
  );
}

function AuthPage({ setToast }) {
  const navigate = useNavigate();

  const [mode, setMode] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  if (!supabase) {
    return (
      <div className="auth-shell page-shell">
        <div className="auth-art">
          <div className="auth-copy">
            <div className="eyebrow">
              <span>SETUP</span> secure accounts
            </div>

            <h1>
              Connect the real account layer.
            </h1>

            <p>
              Create your Supabase project, paste the
              URL and publishable key into environment
              variables, then this screen becomes real
              sign-in.
            </p>
          </div>
        </div>

        <div className="auth-panel">
          <div className="config-panel">
            <strong>
              Supabase is not connected yet.
            </strong>

            <p>
              Use the supplied{' '}
              <code>supabase/schema.sql</code>, then
              add the two browser variables from{' '}
              <code>.env.example</code>.
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

  const submit = async (event) => {
    event.preventDefault();

    setBusy(true);

    try {
      if (mode === 'signup') {
        const { data, error } =
          await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name,
              },
            },
          });

        if (error) throw error;

        if (!data.session) {
          setToast({
            type: 'success',
            title: 'Check your inbox',
            text: 'Supabase sent a confirmation link before your first sign-in.',
          });

          return;
        }

        setToast({
          type: 'success',
          title: 'Account created',
          text: 'Your NAJAF account is ready.',
        });
      } else {
        const { error } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (error) throw error;

        setToast({
          type: 'success',
          title: 'Signed in',
          text: 'Your live account is connected.',
        });
      }

      navigate('/dashboard');
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

  const google = async () => {
    try {
      const { error } =
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/dashboard`,
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
    <div className="auth-shell page-shell">
      <div className="auth-art">
        <span className="auth-noise" />

        <div className="auth-orbit big" />
        <div className="auth-orbit small" />

        <div className="auth-copy">
          <div className="eyebrow">
            <span>00</span> live member access
          </div>

          <h1>
            Your food world,{' '}
            <em>with a real account.</em>
          </h1>

          <p>
            Sessions, profiles, order history and
            saved identity now live in Supabase.
          </p>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-tabs">
          <button
            type="button"
            className={
              mode === 'signin'
                ? 'active'
                : ''
            }
            onClick={() =>
              setMode('signin')
            }
          >
            Sign in
          </button>

          <button
            type="button"
            className={
              mode === 'signup'
                ? 'active'
                : ''
            }
            onClick={() =>
              setMode('signup')
            }
          >
            Create account
          </button>
        </div>

        <form onSubmit={submit}>
          {mode === 'signup' && (
            <label>
              Name

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
            Email

            <input
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              type="email"
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password

            <input
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
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

            <Icon
              name="arrow"
              size={17}
            />
          </button>
        </form>

        <button
          className="social-btn"
          type="button"
          onClick={google}
        >
          Continue with Google
        </button>

        <p className="auth-foot">
          Google OAuth must be enabled in your
          Supabase Auth providers before it can be
          used.
        </p>
      </div>
    </div>
  );
}

function ProfilePage({
  user,
  signOut,
  setToast,
}) {
  const metadata = user.user_metadata || {};

  const [name, setName] = useState(
    metadata.full_name ||
      user.email?.split('@')[0] ||
      'NAJAF member'
  );

  const [phone, setPhone] = useState(
    metadata.phone || ''
  );

  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);

    try {
      await upsertProfile({
        userId: user.id,
        fullName: name,
        phone,
      });

      const { error } =
        await supabase.auth.updateUser({
          data: {
            full_name: name,
            phone,
          },
        });

      if (error) throw error;

      setToast({
        type: 'success',
        title: 'Profile saved',
        text: 'Your live account details are updated.',
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
        kicker="Profile"
        title="Your real NAJAF identity."
      />

      <div className="profile-grid">
        <section className="profile-card profile-main">
          <div className="avatar-disc">
            {name
              .slice(0, 1)
              .toUpperCase()}
          </div>

          <div>
            <div className="section-kicker">
              MEMBER
            </div>

            <h2>{name}</h2>

            <p>{user.email}</p>

            <small className="verified-line">
              ● Supabase session verified
            </small>
          </div>

          <button
            className="btn btn-outline compact"
            onClick={signOut}
          >
            Sign out
          </button>
        </section>

        <section className="profile-card">
          <div className="form-title">
            Account details
          </div>

          <label>
            Full name

            <input
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
            />
          </label>

          <label>
            Phone

            <input
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              placeholder="+91 9XXXXXXXXX"
            />
          </label>

          <button
            className="btn btn-primary"
            onClick={save}
            disabled={saving}
          >
            {saving
              ? 'Saving…'
              : 'Save profile'}
          </button>
        </section>

        <section className="profile-card">
          <div className="form-title">
            Session security
          </div>

          <div className="setting-row">
            <div>
              <strong>
                Persistent sign-in
              </strong>

              <small>
                Supabase refreshes the session
                automatically.
              </small>
            </div>

            <span className="toggle on" />
          </div>

          <div className="setting-row">
            <div>
              <strong>
                Cash checkout protection
              </strong>

              <small>
                No online payment details are required
                for COD orders.
              </small>
            </div>

            <span className="toggle on" />
          </div>

          <div className="setting-row">
            <div>
              <strong>
                Live order channel
              </strong>

              <small>
                Orders update through Supabase
                Realtime.
              </small>
            </div>

            <span className="toggle on" />
          </div>
        </section>
      </div>
    </div>
  );
}

function OrdersPage({ orders }) {
  return (
    <div className="page-shell page-top">
      <SectionHead
        kicker="Orders"
        title="Every order, one timeline."
      />

      {orders.length ? (
        <div className="orders-list">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No orders yet."
          text="Your first order will appear here with live status."
          action="Browse menu"
          to="/menu"
        />
      )}
    </div>
  );
}

function OrderCard({ order }) {
  return (
    <article className="order-card">
      <div className="order-head">
        <div>
          <div className="order-id">
            {order.id}
          </div>

          <h3>
            {order.items
              .map((item) => item.name)
              .join(' · ')}
          </h3>

          <p>
            {new Date(
              order.placedAt
            ).toLocaleString('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
        </div>

        <span className="status-pill">
          {order.status}
        </span>
      </div>

      <div className="order-data">
        <span>{money(order.total)}</span>
        <span>ETA {order.eta}</span>
        <span>
          Rider {order.rider}
        </span>
      </div>

      <div className="order-actions">
        <Link
          className="btn btn-primary compact"
          to={`/tracking/${order.id}`}
        >
          Track live
          <Icon
            name="arrow"
            size={15}
          />
        </Link>

        <Link
          className="btn btn-outline compact"
          to={`/map/${order.id}`}
        >
          Open route
          <Icon
            name="map"
            size={15}
          />
        </Link>

        <Link
          className="text-link"
          to={`/success/${order.id}`}
        >
          Receipt
        </Link>
      </div>
    </article>
  );
}

function TrackingPage({ orders }) {
  const { id } = useParams();

  const order = orders.find(
    (item) => item.id === id
  );

  const statusStep =
    order?.rawStatus === 'delivered'
      ? 4
      : order?.rawStatus ===
        'out_for_delivery'
      ? 2
      : order?.rawStatus === 'preparing'
      ? 1
      : 0;

  const eta =
    order?.eta || 'Calculating…';

  const destination =
    order?.address ||
    'Delivery address';

  return (
    <div className="page-shell page-top ultra-page">
      <div className="track-head ultra-track-head">
        <div>
          <div className="section-kicker">
            LIVE ORDER / {id}
          </div>

          <h1>
            {order
              ? order.items[0]?.name
              : 'Order'}{' '}
            <em>
              {order
                ? 'is connected.'
                : 'not found.'}
            </em>
          </h1>

          <p>
            {order
              ? `${order.items.length} line item${
                  order.items.length === 1
                    ? ''
                    : 's'
                } · ${money(
                  order.total
                )} · ${destination}`
              : 'Sign in and use a valid order id to see your live order.'}
          </p>
        </div>

        <div className="track-actions">
          <Link
            to={`/map/${id}`}
            className="btn btn-primary"
          >
            Open full map
            <Icon
              name="map"
              size={16}
            />
          </Link>

          <Link
            to="/orders"
            className="btn btn-outline"
          >
            Order history
          </Link>
        </div>
      </div>

      <div className="tracking-layout ultra-tracking-layout">
        <section className="tracking-panel ultra-map-panel">
          <RealDeliveryMap
            mode="tracking"
            order={order}
            destinationText={destination}
            statusStep={statusStep}
          />
        </section>

        <aside className="tracking-sidebar ultra-sidebar">
          <div className="eta-card ultra-eta-card">
            <div>
              <small>LIVE ETA</small>
              <strong>{eta}</strong>
              <span>
                {order?.status ||
                  'Waiting for order data'}
              </span>
            </div>

            <span className="eta-ring live-ring">
              LIVE
            </span>
          </div>

          <div className="timeline ultra-timeline">
            {TRACK_STEPS.map(
              (item, index) => (
                <div
                  className={`timeline-step ${
                    index < statusStep
                      ? 'done'
                      : index ===
                        statusStep
                      ? 'current'
                      : ''
                  }`}
                  key={item.title}
                >
                  <span className="step-icon">
                    {item.icon}
                  </span>

                  <div>
                    <strong>
                      {item.title}
                    </strong>

                    <small>
                      {item.meta}
                    </small>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="rider-card ultra-rider-card">
            <div className="rider-avatar">
              {(order?.rider || 'A').slice(
                0,
                1
              )}
            </div>

            <div className="rider-details">
              <small>YOUR RIDER</small>

              <strong>
                {order?.rider ||
                  'Assigned after dispatch'}
              </strong>

              <span>
                {order?.rider_lat
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
              {order?.rider_lat
                ? 'Connected'
                : 'Awaiting signal'}
            </strong>

            <small>
              Supabase order updates + Mapbox route
            </small>
          </div>
        </aside>
      </div>
    </div>
  );
}

function DeliveryMapPage({ orders }) {
  const { id } = useParams();

  const order = orders.find(
    (item) => item.id === id
  );

  const destination =
    order?.address ||
    '7th Cross Road, Kodihalli, Bengaluru';

  return (
    <div className="page-shell page-top ultra-page">
      <div className="section-kicker">
        REAL-TIME ROUTE ENGINE
      </div>

      <div className="map-title-row ultra-map-title-row">
        <div>
          <h1>
            Delivery map{' '}
            <em>with live streets.</em>
          </h1>

          <p>
            Interactive streets, live device position
            and delivery route telemetry.
          </p>
        </div>

        <div className="track-actions">
          <Link
            to={`/tracking/${id}`}
            className="btn btn-outline"
          >
            Back to tracking
          </Link>

          <Link
            to="/home"
            className="btn btn-primary"
          >
            Keep browsing
            <Icon
              name="arrow"
              size={16}
            />
          </Link>
        </div>
      </div>

      <div className="big-map ultra-big-map">
        <RealDeliveryMap
          mode="full"
          order={order}
          destinationText={destination}
        />
      </div>

      <div className="map-bottom-grid">
        <div className="map-info-card">
          <span>ORDER</span>
          <strong>{id}</strong>

          <small>
            {order?.items
              ?.map(
                (item) =>
                  `${item.name} × ${item.quantity}`
              )
              .join(', ') ||
              'Open a real order to activate delivery telemetry.'}
          </small>
        </div>

        <div className="map-info-card">
          <span>DESTINATION</span>

          <strong>
            {destination.split(',')[0]}
          </strong>

          <small>
            Address can be replaced by your real
            delivery backend.
          </small>
        </div>

        <div className="map-info-card">
          <span>MAP STATUS</span>

          <strong>
            <span className="telemetry-dot" /> LIVE
          </strong>

          <small>
            Browser geolocation connected when
            permission is granted.
          </small>
        </div>
      </div>
    </div>
  );
}

function SuccessPage({ orders }) {
  const { id } = useParams();

  const order = orders.find(
    (item) => item.id === id
  );

  return (
    <div className="page-shell page-top success-shell">
      <div className="success-ring">
        <span>✓</span>
      </div>

      <div className="section-kicker">
        ORDER CONFIRMED
      </div>

      <h1>
        Now we watch the clock.
      </h1>

      <p>
        {id} is in the kitchen. Your estimated
        handoff is{' '}
        <strong>
          {order?.eta || '24 min'}
        </strong>
        .
      </p>

      <div className="success-card">
        <div>
          <small>DELIVER TO</small>

          <strong>
            {order?.address ||
              '7th Cross Road, Kodihalli'}
          </strong>
        </div>

        <div>
          <small>TOTAL</small>

          <strong>
            {order
              ? money(order.total)
              : '₹—'}
          </strong>
        </div>

        <div>
          <small>PAYMENT</small>

          <strong>
            {order?.payment ||
              'Cash on delivery'}
          </strong>
        </div>
      </div>

      <div className="hero-ctas">
        <Link
          to={`/tracking/${id}`}
          className="btn btn-primary"
        >
          Track the order
          <Icon
            name="arrow"
            size={17}
          />
        </Link>

        <Link
          to="/home"
          className="btn btn-outline"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}

function DashboardPage({
  cart,
  orders,
  user,
}) {
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
            <span>NOVA</span> member dashboard
          </div>

          <h1>
            {user
              ? `Good to see you, ${
                  displayName.split(' ')[0]
                }.`
              : 'Welcome to your dashboard.'}
          </h1>

          <p>
            One view for your basket, live order and
            saved shortcuts.
          </p>
        </div>

        <Link
          to="/menu"
          className="btn btn-primary"
        >
          Start an order
          <Icon
            name="arrow"
            size={17}
          />
        </Link>
      </div>

      <div className="dashboard-grid">
        <div className="dash-card large">
          <div className="dash-kicker">
            LIVE / YOUR NEXT MOVE
          </div>

          {latest ? (
            <>
              <h3>
                {latest.items[0].name}
              </h3>

              <p>
                {latest.status} · ETA{' '}
                {latest.eta}
              </p>

              <Link
                to={`/tracking/${latest.id}`}
                className="mini-link"
              >
                Open tracking
                <Icon
                  name="arrow"
                  size={15}
                />
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

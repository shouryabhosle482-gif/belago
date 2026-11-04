require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'belago-dev-secret';
const TOKEN_TTL = '7d';

const categories = [
  { id: 'books', name: 'Books', count: 54 },
  { id: 'notes', name: 'Notes', count: 29 },
  { id: 'electronics', name: 'Electronics', count: 41 },
  { id: 'calculators', name: 'Calculators', count: 17 },
  { id: 'accessories', name: 'Accessories', count: 24 },
  { id: 'lab-materials', name: 'Lab Materials', count: 18 },
  { id: 'sports', name: 'Sports Equipment', count: 12 },
  { id: 'engineering', name: 'Engineering', count: 36 },
  { id: 'medical', name: 'Medical', count: 19 },
  { id: 'school', name: 'School', count: 22 },
  { id: 'competitive-exams', name: 'Competitive Exams', count: 28 },
  { id: 'other', name: 'Other Essentials', count: 33 }
];

function makeListingArt(label, accent, secondary = '#101b2f') {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${accent}"/>
          <stop offset="100%" stop-color="${secondary}"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="#09111f"/>
      <rect x="36" y="36" width="728" height="528" rx="28" fill="url(#g)" opacity="0.9"/>
      <circle cx="620" cy="130" r="120" fill="rgba(255,255,255,0.12)"/>
      <circle cx="180" cy="460" r="150" fill="rgba(255,255,255,0.08)"/>
      <path d="M190 440 L610 440" stroke="rgba(255,255,255,0.25)" stroke-width="10" stroke-linecap="round"/>
      <path d="M320 240 L480 240" stroke="rgba(255,255,255,0.25)" stroke-width="12" stroke-linecap="round"/>
      <path d="M280 300 L520 300" stroke="rgba(255,255,255,0.2)" stroke-width="12" stroke-linecap="round"/>
      <text x="400" y="380" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="44" font-weight="700" fill="#ffffff" letter-spacing="2">BELAGO</text>
      <text x="400" y="430" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="28" font-weight="600" fill="rgba(255,255,255,0.85)" letter-spacing="4">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const users = [
  {
    id: 'u_1',
    fullName: 'Nisha Patil',
    email: 'nisha@belago.in',
    phone: '9876543210',
    passwordHash: bcrypt.hashSync('password123', 10),
    college: 'KLE Technological University',
    area: 'Tilakwadi',
    role: 'STUDENT_SELLER',
    verified: true,
    rating: 4.9,
    createdAt: new Date().toISOString()
  },
  {
    id: 'u_2',
    fullName: 'Rohan Kadam',
    email: 'rohan@belago.in',
    phone: '9123456780',
    passwordHash: bcrypt.hashSync('password123', 10),
    college: 'Sanjay Ghodawat University',
    area: 'Khanapur Road',
    role: 'CUSTOMER',
    verified: true,
    rating: 4.7,
    createdAt: new Date().toISOString()
  }
];

const listings = [
  {
    id: 'l_1',
    title: 'Engineering Mathematics Vol 2',
    description: 'Used for 2nd semester engineering. Clean condition, includes solved examples and index tabs.',
    price: 350,
    originalPrice: 650,
    category: 'books',
    condition: 'Good',
    college: 'KLE Technological University',
    area: 'Tilakwadi',
    sellerId: 'u_1',
    sellerName: 'Nisha Patil',
    sellerVerified: true,
    image: makeListingArt('BOOKS', '#f59e0b', '#7c3aed'),
    images: [
      makeListingArt('BOOKS', '#f59e0b', '#7c3aed'),
      makeListingArt('STUDY', '#fbbf24', '#1d4ed8')
    ],
    createdAt: '2026-11-01T10:00:00.000Z',
    status: 'active',
    featured: true
  },
  {
    id: 'l_2',
    title: 'Casio FX-991EX Scientific Calculator',
    description: 'Almost new calculator, perfect for engineering and exam prep. Comes with protective case.',
    price: 1200,
    originalPrice: 1750,
    category: 'calculators',
    condition: 'Like New',
    college: 'Sanjay Ghodawat University',
    area: 'Khanapur Road',
    sellerId: 'u_2',
    sellerName: 'Rohan Kadam',
    sellerVerified: true,
    image: makeListingArt('CALC', '#22c55e', '#0f766e'),
    images: [
      makeListingArt('CALC', '#22c55e', '#0f766e'),
      makeListingArt('EXAMS', '#34d399', '#14532d')
    ],
    createdAt: '2026-11-02T12:00:00.000Z',
    status: 'active',
    featured: true
  },
  {
    id: 'l_3',
    title: 'Dell Inspiron 15 Laptop',
    description: '8GB RAM, 256GB SSD, good battery health, ideal for coursework and presentations.',
    price: 28000,
    originalPrice: 42000,
    category: 'electronics',
    condition: 'Good',
    college: 'KLE Technological University',
    area: 'Shahpur',
    sellerId: 'u_1',
    sellerName: 'Nisha Patil',
    sellerVerified: true,
    image: makeListingArt('LAPTOP', '#38bdf8', '#312e81'),
    images: [
      makeListingArt('LAPTOP', '#38bdf8', '#312e81'),
      makeListingArt('WORK', '#60a5fa', '#1e3a8a')
    ],
    createdAt: '2026-11-03T08:30:00.000Z',
    status: 'active',
    featured: false
  },
  {
    id: 'l_4',
    title: 'Anatomy Notes Bundle for MBBS',
    description: 'Clean handwritten notes with diagrams, ideal exam revision for first-year MBBS students.',
    price: 520,
    originalPrice: 900,
    category: 'notes',
    condition: 'New',
    college: 'Belagavi Medical College',
    area: 'Near RPD',
    sellerId: 'u_2',
    sellerName: 'Rohan Kadam',
    sellerVerified: true,
    image: makeListingArt('MED', '#f472b6', '#7c2d12'),
    images: [
      makeListingArt('MED', '#f472b6', '#7c2d12'),
      makeListingArt('NOTES', '#fb7185', '#4c1d95')
    ],
    createdAt: '2026-11-04T09:15:00.000Z',
    status: 'active',
    featured: true
  },
  {
    id: 'l_5',
    title: 'Urban Trek Backpack',
    description: 'Water-resistant backpack for daily college commute, with padded straps and laptop sleeve.',
    price: 1400,
    originalPrice: 2200,
    category: 'accessories',
    condition: 'Used',
    college: 'KLS Gogte Institute',
    area: 'Vidyagiri',
    sellerId: 'u_1',
    sellerName: 'Nisha Patil',
    sellerVerified: true,
    image: makeListingArt('BAG', '#a78bfa', '#1f2937'),
    images: [
      makeListingArt('BAG', '#a78bfa', '#1f2937'),
      makeListingArt('TRAVEL', '#c4b5fd', '#111827')
    ],
    createdAt: '2026-11-04T11:25:00.000Z',
    status: 'active',
    featured: false
  }
];

function isRecordActiveListing(item) {
  if (!item) return false;
  if (item.deleted || item.isDeleted || item.deletedAt) return false;
  if (item.status === 'draft' || item.status === 'deleted' || item.status === 'rejected' || item.status === 'suspended' || item.status === 'expired' || item.status === 'sold') return false;
  if (item.published === false || item.isPublished === false) return false;
  if (item.expiredAt && new Date(item.expiredAt) <= new Date()) return false;
  return String(item.status || 'active').toLowerCase() === 'active' || item.isPublished === true;
}

function isPublishedListing(item) {
  if (!item) return false;
  if (item.deleted || item.isDeleted || item.deletedAt) return false;
  if (item.status === 'draft' || item.status === 'deleted' || item.status === 'rejected' || item.status === 'suspended' || item.status === 'expired') return false;
  if (item.published === false || item.isPublished === false) return false;
  return ['active', 'sold', 'published'].includes(String(item.status || 'active').toLowerCase()) || item.isPublished === true;
}

function isEligibleStudentAccount(user) {
  if (!user) return false;
  if (user.deleted || user.isDeleted || user.deletedAt || user.isSuspended || user.suspended) return false;
  if (user.role && /admin/i.test(user.role)) return false;
  if (!user.email || !user.fullName || !user.college || !user.area) return false;
  return true;
}

function isVerifiedSeller(user) {
  if (!isEligibleStudentAccount(user)) return false;
  if (user.verified !== true && user.sellerVerified !== true) return false;
  if (user.suspended || user.isSuspended || user.isDeleted || user.deleted) return false;
  return true;
}

function getHomepageStatistics() {
  const totalListings = listings.filter(isPublishedListing).length;
  const activeListings = listings.filter(isRecordActiveListing).length;
  const registeredStudents = users.filter(isEligibleStudentAccount).length;
  const verifiedSellers = users.filter(isVerifiedSeller).length;

  return {
    totalListings,
    activeListings,
    registeredStudents,
    verifiedSellers,
    lastUpdated: new Date().toISOString()
  };
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

function sanitizeUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

app.use(cors({ origin: true, credentials: true }));
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 250,
  standardHeaders: true,
  legacyHeaders: false
}));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'BELAGO API is running', timestamp: new Date().toISOString() });
});

app.get('/api/statistics/homepage', (req, res) => {
  try {
    const data = getHomepageStatistics();
    res.json({
      success: true,
      data,
      message: 'Homepage statistics retrieved successfully.'
    });
  } catch (error) {
    console.error('Homepage statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to load homepage statistics right now.'
    });
  }
});

app.get('/api/categories', (req, res) => {
  res.json({ items: categories });
});

app.get('/api/listings', (req, res) => {
  const { category, q, minPrice, maxPrice, condition, college, sort = 'newest' } = req.query;

  let filtered = [...listings];

  if (category && category !== 'all') {
    filtered = filtered.filter(item => item.category === category);
  }

  if (q) {
    const term = q.toLowerCase();
    filtered = filtered.filter(item =>
      item.title.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term) ||
      item.college.toLowerCase().includes(term)
    );
  }

  if (minPrice) filtered = filtered.filter(item => item.price >= Number(minPrice));
  if (maxPrice) filtered = filtered.filter(item => item.price <= Number(maxPrice));
  if (condition) filtered = filtered.filter(item => item.condition.toLowerCase() === condition.toLowerCase());
  if (college) filtered = filtered.filter(item => item.college.toLowerCase().includes(college.toLowerCase()));

  if (sort === 'lowest') filtered.sort((a, b) => a.price - b.price);
  if (sort === 'highest') filtered.sort((a, b) => b.price - a.price);
  if (sort === 'popular') filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  if (sort === 'newest') filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({ items: filtered, total: filtered.length });
});

app.get('/api/listings/featured', (req, res) => {
  res.json({ items: listings.filter(item => item.featured).slice(0, 4) });
});

app.get('/api/listings/:id', (req, res) => {
  const listing = listings.find(item => item.id === req.params.id);
  if (!listing) {
    return res.status(404).json({ message: 'Listing not found' });
  }

  const similar = listings.filter(item => item.category === listing.category && item.id !== listing.id).slice(0, 3);
  res.json({ item: listing, similar });
});

app.post('/api/auth/register', async (req, res) => {
  const { fullName, email, phone, password, confirmPassword, college, area } = req.body;

  if (!fullName || !email || !phone || !password || !college || !area) {
    return res.status(400).json({ message: 'Please fill in all required fields.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  const existing = users.find(user => user.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ message: 'An account with that email already exists.' });
  }

  const newUser = {
    id: `u_${Date.now()}`,
    fullName,
    email,
    phone,
    passwordHash: await bcrypt.hash(password, 10),
    college,
    area,
    role: 'CUSTOMER',
    verified: false,
    rating: 5.0,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  const token = signToken({ id: newUser.id, email: newUser.email, role: newUser.role });

  res.status(201).json({
    token,
    user: sanitizeUser(newUser)
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(item => item.email.toLowerCase() === String(email).toLowerCase());

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const valid = await bcrypt.compare(String(password), user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  res.json({ token, user: sanitizeUser(user) });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(item => item.id === decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    res.status(401).json({ message: 'Token expired or invalid.' });
  }
});

app.post('/api/listings', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Login required to list an item.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const seller = users.find(user => user.id === decoded.id);
    if (!seller) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const { title, category, description, price, originalPrice, condition, college, area, image } = req.body;

    if (!title || !category || !description || !price || !condition || !college || !area) {
      return res.status(400).json({ message: 'Please complete all required listing fields.' });
    }

    const newListing = {
      id: `l_${Date.now()}`,
      title,
      description,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      category,
      condition,
      college,
      area,
      sellerId: seller.id,
      sellerName: seller.fullName,
      sellerVerified: seller.verified,
      image: image || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
      images: [image || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80'],
      createdAt: new Date().toISOString(),
      status: 'active',
      featured: false
    };

    listings.unshift(newListing);
    res.status(201).json({ message: 'Listing published successfully.', item: newListing });
  } catch (error) {
    res.status(401).json({ message: 'Session expired. Please log in again.' });
  }
});

app.get('/api/dashboard', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Login required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(item => item.id === decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const myListings = listings.filter(item => item.sellerId === user.id);
    res.json({
      user: sanitizeUser(user),
      stats: {
        activeListings: myListings.length,
        soldItems: 2,
        myOrders: 3,
        myOffers: 4,
        favorites: 6
      },
      myListings
    });
  } catch (error) {
    res.status(401).json({ message: 'Token expired or invalid.' });
  }
});

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/explore', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/explore.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/register.html'));
});

app.get('/sell', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/sell.html'));
});

app.get('/listing-details/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/listing-details.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

io.on('connection', (socket) => {
  socket.on('join-room', (room) => {
    socket.join(room);
  });

  socket.on('chat-message', ({ room, sender, text }) => {
    io.to(room).emit('chat-message', {
      sender,
      text,
      createdAt: new Date().toISOString()
    });
  });
});

server.listen(PORT, () => {
  console.log(`BELAGO server running on http://localhost:${PORT}`);
});

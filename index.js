const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

const getData = (req) => {
  if (!fs.existsSync(DATA_FILE)) return { admins: [], products: [], orders: [], pages: {} };
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    
    // Dynamic URL replacement helper
    const resolveUrl = (url) => {
      if (!url || !req) return url;
      const protocol = req.headers['x-forwarded-proto'] || 'http';
      const host = req.headers.host;
      return url.replace(/https?:\/\/[^\/]+/g, `${protocol}://${host}`);
    };

    if (!Array.isArray(data.admins)) {
      data.admins = [data.admin || { username: 'admin', password: 'password123' }];
      delete data.admin;
    }
    data.products = (data.products || []).map(p => ({
      ...p,
      image: resolveUrl(p.image),
      images: (Array.isArray(p.images) ? p.images : (p.image ? [p.image] : [])).map(resolveUrl)
    }));
    data.orders = (data.orders || []).map(o => ({
      ...o,
      items: (o.items || []).map(item => ({
        ...item,
        image: resolveUrl(item.image),
        images: (Array.isArray(item.images) ? item.images : (item.image ? [item.image] : [])).map(resolveUrl)
      }))
    }));
    data.pages = data.pages || {};
    return data;
  } catch (e) {
    return { admins: [], products: [], orders: [], pages: {} };
  }
};

const saveData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// Auth
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const user = getData(req).admins.find(a => a.username === username && a.password === password);
  if (user) res.json({ success: true, token: 'secret-token', username: user.username });
  else res.status(401).send();
});

app.get('/api/admin/list', (req, res) => res.json(getData(req).admins));

app.post('/api/admin/add', (req, res) => {
  const { username, password } = req.body;
  const data = getData(req);
  data.admins.push({ username, password });
  saveData(data);
  res.json({ success: true });
});

app.put('/api/admin/edit', (req, res) => {
  const { oldUsername, newUsername, password } = req.body;
  const data = getData(req);
  const i = data.admins.findIndex(a => a.username === oldUsername);
  if (i !== -1) {
    data.admins[i] = { username: newUsername, password };
    saveData(data);
    res.json({ success: true });
  } else res.status(404).send();
});

app.delete('/api/admin/remove/:username', (req, res) => {
  const data = getData(req);
  data.admins = data.admins.filter(a => a.username !== req.params.username);
  saveData(data);
  res.json({ success: true });
});

// Products
app.get('/api/products', (req, res) => res.json(getData(req).products));

app.get('/api/products/:id', (req, res) => {
  const p = getData(req).products.find(x => String(x.id) === String(req.params.id));
  if (p) res.json(p);
  else res.status(404).send();
});

app.post('/api/upload-multiple', upload.array('images', 5), (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const imageUrls = req.files.map(f => `${protocol}://${host}/uploads/${f.filename}`);
  res.json({ imageUrls });
});

app.post('/api/products', (req, res) => {
  const data = getData(req);
  const n = { ...req.body, id: Date.now() };
  data.products.push(n);
  saveData(data);
  res.status(201).json(n);
});

app.put('/api/products/:id', (req, res) => {
  const data = getData(req);
  const i = data.products.findIndex(p => String(p.id) === String(req.params.id));
  if (i !== -1) {
    data.products[i] = { ...req.body, id: data.products[i].id };
    saveData(data);
    res.json(data.products[i]);
  } else res.status(404).send();
});

app.delete('/api/products/:id', (req, res) => {
  const data = getData(req);
  data.products = data.products.filter(p => String(p.id) !== String(req.params.id));
  saveData(data);
  res.status(204).send();
});

// Reviews
app.post('/api/products/:id/reviews', (req, res) => {
  const data = getData(req);
  const i = data.products.findIndex(p => String(p.id) === String(req.params.id));
  if (i !== -1) {
    if (!data.products[i].reviews) data.products[i].reviews = [];
    const review = {
      id: Date.now(),
      user: req.body.user || 'Anonymous',
      rating: Number(req.body.rating) || 5,
      comment: req.body.comment || '',
      date: new Date().toISOString()
    };
    data.products[i].reviews.push(review);
    saveData(data);
    res.status(201).json(review);
  } else res.status(404).send();
});

// Orders
app.get('/api/orders', (req, res) => res.json(getData(req).orders));

app.get('/api/track/:id', (req, res) => {
  const order = getData(req).orders.find(o => o.trackingId === req.params.id);
  if (order) res.json(order);
  else res.status(404).send();
});

app.post('/api/orders', (req, res) => {
  const data = getData(req);
  const tid = 'MS-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  const o = { ...req.body, id: Date.now(), trackingId: tid, date: new Date().toISOString(), status: 'Pending' };
  data.orders.push(o);
  saveData(data);
  res.status(201).json(o);
});

app.put('/api/orders/:id', (req, res) => {
  const data = getData(req);
  const i = data.orders.findIndex(o => String(o.id) === String(req.params.id));
  if (i !== -1) {
    data.orders[i] = { ...data.orders[i], ...req.body };
    saveData(data);
    res.json(data.orders[i]);
  } else res.status(404).send();
});

app.delete('/api/orders/:id', (req, res) => {
  const data = getData(req);
  data.orders = data.orders.filter(o => String(o.id) !== String(req.params.id));
  saveData(data);
  res.status(204).send();
});

// Pages
app.get('/api/pages', (req, res) => res.json(getData(req).pages));
app.get('/api/pages/:slug', (req, res) => res.json(getData(req).pages[req.params.slug] || { title: '', content: '' }));

app.put('/api/pages/:slug', (req, res) => {
  const data = getData(req);
  data.pages[req.params.slug] = req.body;
  saveData(data);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

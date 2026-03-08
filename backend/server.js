const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const dotenv     = require('dotenv');
const path       = require('path');
const fs         = require('fs');
const seed       = require('./seed');

dotenv.config();

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


// ── Middleware ──────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Models (ensure Counter is registered before routes) ─
require('./models/Counter');

// ── Routes ──────────────────────────────────────────────
app.use('/api/chefs',    require('./routes/chefs'));
app.use('/api/tables',   require('./routes/tables'));
app.use('/api/menu',     require('./routes/menu'));
app.use('/api/orders',   require('./routes/orders'));

// ── Health check ────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Restaurant API is running' });
});



app.get('/seed', async (req, res) => {
  try {
    await seed();
    res.send('Database seeded successfully');
  } catch (err) {
    res.status(500).send(err.message);
  }
});


// ── MongoDB Connection ───────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, '0.0.0.0', () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });


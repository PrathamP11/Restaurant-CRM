const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const dotenv     = require('dotenv');
const path       = require('path');

dotenv.config();

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ── Middleware ──────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ──────────────────────────────────────────────
app.use('/api/chefs',    require('./routes/chefs'));
app.use('/api/tables',   require('./routes/tables'));
app.use('/api/menu',     require('./routes/menu'));
app.use('/api/orders',   require('./routes/orders'));

// ── Health check ────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Restaurant API is running' });
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

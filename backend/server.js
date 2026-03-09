const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
dotenv.config();
const seed = require('./seed');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
}));
app.use(express.json());

require('./models/Counter');

app.use('/api/chefs', require('./routes/chefs'));
app.use('/api/tables', require('./routes/tables'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));

app.get('/', (_req, res) => {
  res.json({ message: 'Restaurant API is running' });
});

app.get('/ping', (_req, res) => {
  res.send('ok');
});

app.get('/seed', async (_req, res) => {
  try {
    await seed();
    res.send('Database seeded successfully');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

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


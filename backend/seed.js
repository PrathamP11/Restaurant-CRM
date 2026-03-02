const mongoose  = require('mongoose');
const dotenv    = require('dotenv');
const Chef      = require('./models/Chef');
const Table     = require('./models/Table');
const MenuItem  = require('./models/MenuItem');

dotenv.config();

const chefs = [
  { name: 'Manesh', orders: 0 },
  { name: 'Pritam', orders: 0 },
  { name: 'Yash',   orders: 0 },
  { name: 'Tenzen', orders: 0 },
];

const tables = Array.from({ length: 30 }, (_, i) => ({
  tableNumber: i + 1,
  name: 'Table',
  chairs: 3,
  isReserved: false,
}));

const menuItems = [
  { name: 'Capricciosa', description: 'Classic Italian pizza',   price: 200, averagePreparationTime: 20, category: 'Pizza',        stock: 50, order: 0 },
  { name: 'Sicilian',    description: 'Thick crust Sicilian',    price: 150, averagePreparationTime: 22, category: 'Pizza',        stock: 40, order: 1 },
  { name: 'Marinara',    description: 'Tomato & garlic pizza',   price: 90,  averagePreparationTime: 18, category: 'Pizza',        stock: 60, order: 2 },
  { name: 'Pepperoni',   description: 'Loaded pepperoni pizza',  price: 300, averagePreparationTime: 25, category: 'Pizza',        stock: 30, order: 3 },
  { name: 'Cheese Burger',description:'Classic cheese burger',   price: 199, averagePreparationTime: 15, category: 'Burger',       stock: 50, order: 4 },
  { name: 'Veg Burger',  description: 'Crispy veg burger',       price: 149, averagePreparationTime: 12, category: 'Burger',       stock: 45, order: 5 },
  { name: 'Coke',        description: 'Chilled Coca-Cola 500ml', price: 60,  averagePreparationTime: 2,  category: 'Drink',        stock: 100,order: 6 },
  { name: 'Fresh Juice', description: 'Seasonal fresh juice',    price: 80,  averagePreparationTime: 5,  category: 'Drink',        stock: 80, order: 7 },
  { name: 'Crispy Fries',description: 'Golden crispy fries',     price: 99,  averagePreparationTime: 10, category: 'French fries', stock: 70, order: 8 },
  { name: 'Waffle Fries',description: 'Belgian waffle fries',    price: 129, averagePreparationTime: 12, category: 'French fries', stock: 60, order: 9 },
  { name: 'Salad',       description: 'Fresh garden salad',      price: 89,  averagePreparationTime: 8,  category: 'Veggies',      stock: 40, order: 10 },
  { name: 'Paneer Tikka',description: 'Grilled paneer tikka',    price: 179, averagePreparationTime: 20, category: 'Veggies',      stock: 35, order: 11 },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing
    await Chef.deleteMany({});
    await Table.deleteMany({});
    await MenuItem.deleteMany({});

    // Insert fresh
    await Chef.insertMany(chefs);
    await Table.insertMany(tables);
    await MenuItem.insertMany(menuItems);

    console.log('✅ Database seeded successfully!');
    console.log(`   - ${chefs.length} chefs`);
    console.log(`   - ${tables.length} tables`);
    console.log(`   - ${menuItems.length} menu items`);

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Chef = require('./models/Chef');
const Table = require('./models/Table');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');

dotenv.config();



const chefs = [
  { name: 'Manesh' },
  { name: 'Pritam' },
  { name: 'Yash' },
  { name: 'Tenzen' },
];

const tables = Array.from({ length: 30 }, (_, i) => {
  const num = i + 1;
  let chairs = 2;
  if (num > 24) chairs = 8;
  else if (num > 16) chairs = 6;
  else if (num > 8) chairs = 4;
  return { tableNumber: num, name: 'Table', chairs, isReserved: false };
});

const menuItems = [
  { name: 'Capricciosa', description: 'Classic Italian pizza', price: 200, averagePreparationTime: 4, category: 'Pizza', stock: 50, order: 0, image: "/icons/capricciosa.png" },
  { name: 'Sicilian', description: 'Thick crust Sicilian', price: 150, averagePreparationTime: 5, category: 'Pizza', stock: 40, order: 1, image: "/icons/sicilian.png" },
  { name: 'Marinara', description: 'Tomato & garlic pizza', price: 90, averagePreparationTime: 4, category: 'Pizza', stock: 60, order: 2, image: "/icons/marinara.png" },
  { name: 'Pepperoni', description: 'Loaded pepperoni pizza', price: 300, averagePreparationTime: 6, category: 'Pizza', stock: 30, order: 3, image: "/icons/pepperoni.png" },
  { name: 'Cheese Burger', description: 'Classic cheese burger', price: 199, averagePreparationTime: 3, category: 'Burger', stock: 50, order: 4, image: "/icons/cheese-burger.png" },
  { name: 'Veg Burger', description: 'Crispy veg burger', price: 149, averagePreparationTime: 3, category: 'Burger', stock: 45, order: 5, image: "/icons/veg-burger.png" },
  { name: 'Coke', description: 'Chilled Coca-Cola 500ml', price: 60, averagePreparationTime: 2, category: 'Drink', stock: 100, order: 6, image: "/icons/coke.png" },
  { name: 'Fresh Juice', description: 'Seasonal fresh juice', price: 80, averagePreparationTime: 2, category: 'Drink', stock: 80, order: 7, image: "/icons/fresh-juice.png" },
  { name: 'Crispy Fries', description: 'Golden crispy fries', price: 99, averagePreparationTime: 2, category: 'French fries', stock: 70, order: 8, image: "/icons/crispy-fries.png" },
  { name: 'Waffle Fries', description: 'Belgian waffle fries', price: 129, averagePreparationTime: 2, category: 'French fries', stock: 60, order: 9, image: "/icons/waffle-fries.png" },
  { name: 'Salad', description: 'Fresh garden salad', price: 89, averagePreparationTime: 2, category: 'Veggies', stock: 40, order: 10, image: "/icons/salad.png" },
  { name: 'Indian Salad', description: 'Indian salad', price: 92, averagePreparationTime: 2, category: 'Veggies', stock: 35, order: 11, image: "/icons/Indian-salad.png" },
];
async function seed() {
  try {
    console.log('MongoDB connected for seeding...');

    await Chef.deleteMany({});
    await Table.deleteMany({});
    await MenuItem.deleteMany({});
    await Order.deleteMany({});

    await Chef.insertMany(chefs);
    await Table.insertMany(tables);
    await MenuItem.insertMany(menuItems);

    console.log('✅ Database seeded successfully!');
    console.log(`   - ${chefs.length} chefs`);
    console.log(`   - ${tables.length} tables`);
    console.log(`   - ${menuItems.length} menu items`);

  } catch (err) {
    console.error('Seed error:', err.message);
  }
}

module.exports = seed;

export const CHEFS = [
  { id: 1, name: "Manesh",  orders: 3 },
  { id: 2, name: "Pritam",  orders: 7 },
  { id: 3, name: "Yash",    orders: 5 },
  { id: 4, name: "Tenzen",  orders: 8 },
];

export const MENU_ITEMS = [
  { id: 1, name: "Burger",    description: "Burger from Burger King", price: 199, averagePreparationTime: 20, category: "Burgers",  stock: 50,  image: null },
  { id: 2, name: "Margherita",description: "Classic tomato & cheese", price: 249, averagePreparationTime: 25, category: "Pizza",    stock: 30,  image: null },
  { id: 3, name: "Coke",      description: "Chilled Coca-Cola 500ml", price: 60,  averagePreparationTime: 2,  category: "Drinks",   stock: 100, image: null },
  { id: 4, name: "Fries",     description: "Crispy golden fries",      price: 89,  averagePreparationTime: 10, category: "Snacks",   stock: 60,  image: null },
  { id: 5, name: "Pasta",     description: "Creamy alfredo pasta",     price: 179, averagePreparationTime: 18, category: "Mains",    stock: 25,  image: null },
  { id: 6, name: "Sandwich",  description: "Club sandwich",            price: 129, averagePreparationTime: 12, category: "Snacks",   stock: 40,  image: null },
];

export const ORDERS = [
  { id: "ORD-101", type: "dine-in",  tableNo: 5,   items: ["Value Set Meals","Double Cheeseburger","Apple Pie","Coca-Cola L"], itemCount: 3, phone: "9876543210", name: "Rahul",  processingTime: 240, status: "processing", chefId: 1, createdAt: new Date(Date.now()-5*60000).toISOString() },
  { id: "ORD-102", type: "dine-in",  tableNo: 5,   items: ["Value Set Meals","Double Cheeseburger","Apple Pie","Coca-Cola L"], itemCount: 3, phone: "9876543211", name: "Priya",  processingTime: 0,   status: "done",       chefId: 2, createdAt: new Date(Date.now()-30*60000).toISOString() },
  { id: "ORD-103", type: "takeaway", tableNo: null, items: ["Value Set Meals","Double Cheeseburger","Apple Pie","Coca-Cola L"], itemCount: 3, phone: "9876543212", name: "Arun",   processingTime: 0,   status: "not_picked", chefId: 3, createdAt: new Date(Date.now()-45*60000).toISOString() },
  { id: "ORD-104", type: "dine-in",  tableNo: 3,   items: ["Value Set Meals","Double Cheeseburger","Apple Pie","Coca-Cola L"], itemCount: 3, phone: "9876543213", name: "Sita",   processingTime: 150, status: "processing", chefId: 4, createdAt: new Date(Date.now()-2*60000).toISOString() },
  { id: "ORD-105", type: "dine-in",  tableNo: 7,   items: ["Value Set Meals","Double Cheeseburger","Apple Pie","Coca-Cola L"], itemCount: 3, phone: "9876543214", name: "Vijay",  processingTime: 180, status: "processing", chefId: 1, createdAt: new Date(Date.now()-8*60000).toISOString() },
  { id: "ORD-106", type: "takeaway", tableNo: null, items: ["Value Set Meals","Double Cheeseburger","Apple Pie","Coca-Cola L"], itemCount: 3, phone: "9876543215", name: "Neha",   processingTime: 0,   status: "not_picked", chefId: 2, createdAt: new Date(Date.now()-60*60000).toISOString() },
  { id: "ORD-107", type: "dine-in",  tableNo: 2,   items: ["Value Set Meals","Double Cheeseburger","Apple Pie","Coca-Cola L"], itemCount: 3, phone: "9876543216", name: "Karan",  processingTime: 0,   status: "done",       chefId: 3, createdAt: new Date(Date.now()-25*60000).toISOString() },
  { id: "ORD-108", type: "dine-in",  tableNo: 8,   items: ["Value Set Meals","Double Cheeseburger","Apple Pie","Coca-Cola L"], itemCount: 3, phone: "9876543217", name: "Meena",  processingTime: 300, status: "processing", chefId: 4, createdAt: new Date(Date.now()-1*60000).toISOString() },
];

export const WEEK_REVENUE  = [1100, 1850, 970, 2300, 1640, 2200, 1760];
export const WEEK_LABELS   = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
export const MONTH_REVENUE = [800,1200,950,1600,1300,1800,2100,1500,1700,2000,1400,1900,2200,1600,1300,2500,2100,1800,2300,1700,1900,2400,1600,2000,1500,1800,2100,1400,1700,2000];

// Reserved table IDs
export const RESERVED_TABLE_IDS = [4, 5, 7, 9, 12, 17, 21, 22, 26, 29, 30];

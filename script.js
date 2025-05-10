import mongoose from "mongoose";

mongoose.connect("mongodb+srv://vallabhwasule913:6Vbdz9A8PsaeSqqJ@cluster0.bc7wn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const menuItemSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  sizeOptions: [
    {
      size: String,
      price: Number,
    },
  ],
});

const MenuItem = mongoose.model("MenuItem", menuItemSchema);

const menuItems = [
  // Appetizers
  { name: "Potato Pops (15 Pc)", category: "Appetizers", price: 120 },
  { name: "Peri Peri Potato Pops (15 Pc)", category: "Appetizers", price: 150 },
  { name: "Cheese Loaded Nachos (Cheese Sauce)", category: "Appetizers", price: 150 },
  { name: "Mexican Nachos (Grated Cheese)", category: "Appetizers", price: 160 },
  { name: "Crispy Onion Ring", category: "Appetizers", price: 150 },

  // Fries
  { name: "Classic Salted Fries", category: "Fries", price: 100 },
  { name: "Masala Fries", category: "Fries", price: 120 },
  { name: "Peri Peri Fries", category: "Fries", price: 130 },
  { name: "Creamy Cheesy Fries", category: "Fries", price: 140 },
  { name: "Peri Peri with Cheese Fries", category: "Fries", price: 160 },
  { name: "Honey Chilli Potato", category: "Fries", price: 200 },

  // Burgers
  { name: "Crispy Veggie Burger", category: "Burgers", price: 90 },
  { name: "Washington Burger", category: "Burgers", price: 100 },
  { name: "Veg Tandoori Burger", category: "Burgers", price: 120 },
  { name: "Mexican Cheese Burger", category: "Burgers", price: 130 },
  { name: "Cheesy Lava Burger", category: "Burgers", price: 160 },
  { name: "Veg Maharaja Burger", category: "Burgers", price: 160 },
  { name: "Spicy Paneer Burger", category: "Burgers", price: 170 },
  { name: "Aloo Tikki Burger", category: "Burgers", price: 60 },
  { name: "Spicy Paneer Tandoori Burger", category: "Burgers", price: 170 },

  // Wraps
  { name: "Creamy Veggie Wrap", category: "Wraps", price: 140 },
  { name: "Spicy Paneer Wrap", category: "Wraps", price: 160 },
  { name: "Tandoori Tikka Wrap", category: "Wraps", price: 160 },
  { name: "Barbecue Paneer Wrap", category: "Wraps", price: 160 },

  // Pizza with sizeOptions
  {
    name: "Classic Margherita",
    category: "Pizza",
    sizeOptions: [
      { size: "S", price: 160 },
      { size: "M", price: 320 },
      { size: "L", price: 420 },
    ],
  },
  {
    name: "Onion Corn Cheese",
    category: "Pizza",
    sizeOptions: [
      { size: "S", price: 180 },
      { size: "M", price: 350 },
      { size: "L", price: 440 },
    ],
  },
  {
    name: "Farm Fresh",
    category: "Pizza",
    sizeOptions: [
      { size: "S", price: 200 },
      { size: "M", price: 360 },
      { size: "L", price: 450 },
    ],
  },
  {
    name: "Tandoori Paneer",
    category: "Pizza",
    sizeOptions: [
      { size: "S", price: 230 },
      { size: "M", price: 400 },
      { size: "L", price: 500 },
    ],
  },
  {
    name: "Paneer Makhaniwala",
    category: "Pizza",
    sizeOptions: [
      { size: "S", price: 230 },
      { size: "M", price: 400 },
      { size: "L", price: 500 },
    ],
  },
  {
    name: "Spicy Mushroom & Onion",
    category: "Pizza",
    sizeOptions: [
      { size: "S", price: 240 },
      { size: "M", price: 400 },
      { size: "L", price: 500 },
    ],
  },
  {
    name: "Pesto Cheese",
    category: "Pizza",
    sizeOptions: [
      { size: "S", price: 240 },
      { size: "M", price: 430 },
      { size: "L", price: 520 },
    ],
  },
  {
    name: "Peppy Paneer",
    category: "Pizza",
    sizeOptions: [
      { size: "S", price: 240 },
      { size: "M", price: 430 },
      { size: "L", price: 520 },
    ],
  },
  {
    name: "Mexican Pizza",
    category: "Pizza",
    sizeOptions: [
      { size: "S", price: 240 },
      { size: "M", price: 430 },
      { size: "L", price: 520 },
    ],
  },
  {
    name: "Exotic Italian",
    category: "Pizza",
    sizeOptions: [
      { size: "S", price: 260 },
      { size: "M", price: 440 },
      { size: "L", price: 550 },
    ],
  },

  // Coffee
  { name: "Cawa (Thick Cold Coffee)", category: "Coffee", price: 70 },
  { name: "Cawa Crush", category: "Coffee", price: 90 },
  { name: "Cawa with Ice Cream", category: "Coffee", price: 120 },
  { name: "Cawa Flavours (Irish/Caramel/Vanilla)", category: "Coffee", price: 120 },
  { name: "Cold Coffee (Regular)", category: "Coffee", price: 60 },
  { name: "Ice Cold Brew", category: "Coffee", price: 120 },
  { name: "Iced Americano", category: "Coffee", price: 100 },

  // Frappe
  { name: "Frappe Coffee", category: "Frappe", price: 150 },
  { name: "Strawberry Frappe", category: "Frappe", price: 160 },
  { name: "Biscoff Frappe", category: "Frappe", price: 170 },
  { name: "Black Forest Frappe", category: "Frappe", price: 170 },
  { name: "Kitkat Frappe", category: "Frappe", price: 170 },

  // Mocktails
  { name: "Virgin Mojito", category: "Mocktail", price: 120 },
  { name: "Green Apple Mocktail", category: "Mocktail", price: 120 },
  { name: "Watermelon", category: "Mocktail", price: 120 },
  { name: "Blue Lagoon", category: "Mocktail", price: 120 },
  { name: "Chilli Guava", category: "Mocktail", price: 120 },
  { name: "Orange Blast", category: "Mocktail", price: 120 },
  { name: "Kala Khatta", category: "Mocktail", price: 120 },

  // Ice Tea
  { name: "Lemon Ice Tea", category: "Iced Tea", price: 90 },
  { name: "Peach Ice Tea", category: "Iced Tea", price: 90 },
  { name: "Lemon Mint Ice Tea", category: "Iced Tea", price: 100 },

  // Lemonade
  { name: "Masala Lemonade", category: "Lemonade", price: 60 },
  { name: "Fresh Lime Soda", category: "Lemonade", price: 90 },
];


async function insertMenu() {
  try {
    await MenuItem.insertMany(menuItems);
    console.log("✅ All items added successfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error inserting menu items:", err);
  }
}

insertMenu();

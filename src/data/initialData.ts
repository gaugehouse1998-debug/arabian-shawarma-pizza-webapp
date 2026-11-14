import {
  Category,
  Product,
  Deal,
  PaymentMethodSettings,
  RestaurantSettings,
  Coupon,
  DeliveryZone,
  CustomerProfile,
  Order,
  Review
} from '../types';

export const initialRestaurantSettings: RestaurantSettings = {
  name: 'Arabian Shawarma & Pizza',
  tagline: 'Authentic Arabian Shawarmas, Handcrafted Pizzas & Delicious Fast Food',
  address: 'Cavalry Ground Mian Chowk Near Shiffa Hospital Madina Colony Walton Cantt',
  city: 'Lahore',
  latitude: 31.4882,
  longitude: 74.3652,
  deliveryRadiusKm: 10,
  phone1: '+92 322-2222461',
  phone2: '+92 300-0433134',
  whatsapp: '+923222222461',
  email: 'orders@arabianshawarma.pk',
  openingTime: '13:00', // 1:00 PM
  closingTime: '03:00', // 3:00 AM
  isOpen: true,
  closedDays: [],
  currency: 'PKR',
  currencySymbol: 'Rs.',
  taxPercentage: 0, // 0% by default, configurable
  defaultDeliveryFee: 150,
  freeDeliveryThreshold: 2500,
  minimumOrderAmount: 400,
  deliveryAvailable: true,
  pickupAvailable: true,
  heroHeadline: 'Taste the True Arabian Flavour & Gourmet Pizzas',
  heroSubheadline: 'Freshly baked stuffed crust pizzas, signature roasted chicken shawarmas, crispy zinger burgers, and unbeatable family combos in Lahore.',
  announcement: '🔥 Free Delivery on all orders above Rs. 2,500! Open till 3:00 AM daily.'
};

export const initialCategories: Category[] = [
  { id: "cat-deals", name: "Regular Deals", order: 1, isActive: true, description: "Exclusive combos from Deal 01 to Deal 29", image: "/assets/images/family_combo_feast_1794391295864.jpg" },
  { id: "cat-pizza", name: "Pizza", order: 2, isActive: true, description: "Fresh stone-baked artisanal pizzas with loaded cheese & toppings", image: "/assets/images/artisan_tikka_pizza_1794391294077.jpg" },
  { id: "cat-shawarma", name: "Shawarma", order: 3, isActive: true, description: "Original Arabian roasted chicken shawarmas with garlic toum", image: "/assets/images/arabian_chicken_shawarma_1794391294232.jpg" },
  { id: "cat-burger", name: "Burger", order: 4, isActive: true, description: "Crispy zinger, juicy grill & specialty burgers", image: "/assets/images/hero_3d_burger_1794391292664.jpg" },
  { id: "cat-paratha", name: "Paratha Roll", order: 5, isActive: true, description: "Crispy flaky paratha rolls with BBQ & cheese", image: "/assets/images/paratha_roll_bbq_1794391328091.jpg" },
  { id: "cat-sandwich", name: "Sandwich", order: 6, isActive: true, description: "Grilled clubs, paninis & pizza stackers with fries", image: "/assets/images/club_sandwich_fries_1794391328479.jpg" },
  { id: "cat-wrap", name: "Wrap", order: 7, isActive: true, description: "Fresh toasted tortilla wraps with grilled chicken & sauces", image: "/assets/images/arabian_chicken_shawarma_1794391294232.jpg" },
  { id: "cat-appetizer", name: "Appetizer", order: 8, isActive: true, description: "Loaded fries, hot shots, crispy wings & nuggets", image: "/assets/images/loaded_cheese_fries_1794391295410.jpg" },
  { id: "cat-drinks", name: "Drinks", order: 9, isActive: true, description: "Chilled soft drinks and mineral water", image: "/assets/images/chilled_cold_drinks_1794391330454.jpg" },
  { id: "cat-dip-sauce", name: "Dip Sauce", order: 10, isActive: true, description: "House specialty garlic mayo, peri peri, chipotle & jalapeno", image: "/assets/images/gourmet_dip_sauces_1794391329846.jpg" },
];

export const commonAddons = [
  { id: 'addon-extra-cheese-chicken', name: 'Extra Cheese & Chicken Topping', price: 200 },
  { id: 'addon-mayo-garlic', name: 'Mayo Garlic Sauce Cup', price: 100 },
  { id: 'addon-special-sauce', name: 'House Special Sauce', price: 100 },
  { id: 'addon-jalapeno-sauce', name: 'Jalapeno Sauce Cup', price: 100 }
];

export const pizzaAddons = [
  { id: 'addon-white-sauce-s', name: 'Extra White Sauce Topping (Small)', price: 50 },
  { id: 'addon-white-sauce-m', name: 'Extra White Sauce Topping (Medium)', price: 100 },
  { id: 'addon-white-sauce-l', name: 'Extra White Sauce Topping (Large)', price: 150 },
  { id: 'addon-white-sauce-f', name: 'Extra White Sauce Topping (Family)', price: 200 },
  { id: 'addon-extra-cheese-chicken', name: 'Extra Cheese / Chicken Charges', price: 200 }
];

// Complete Products list from Image 2
export const initialProducts: Product[] = [
  // PIZZAS
  {
    id: 'prod-tikka-pizza',
    name: 'Tikka Pizza',
    category: 'Pizza',
    description: 'Traditional Pakistani chicken tikka chunks with onions, capsicum, and premium mozzarella cheese.',
    basePrice: 450,
    image: '/assets/images/artisan_tikka_pizza_1794391294077.jpg',
    sizes: [
      { name: 'Small (8")', price: 450 },
      { name: 'Medium (11")', price: 900 },
      { name: 'Large (13")', price: 1500 },
      { name: 'Family (17")', price: 2400 }
    ],
    addons: pizzaAddons,
    isAvailable: true,
    isFeatured: true,
    isBestSeller: true,
    tags: ['Best Seller', 'Traditional', 'Spicy']
  },
  {
    id: 'prod-fajita-pizza',
    name: 'Fajita Pizza',
    category: 'Pizza',
    description: 'Mexican style spicy fajita chicken, sweet onions, bell peppers, and melted cheese.',
    basePrice: 450,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
    sizes: [
      { name: 'Small (8")', price: 450 },
      { name: 'Medium (11")', price: 900 },
      { name: 'Large (13")', price: 1500 },
      { name: 'Family (17")', price: 2400 }
    ],
    addons: pizzaAddons,
    isAvailable: true,
    isFeatured: true,
    isBestSeller: true,
    tags: ['Popular', 'Fajita']
  },
  {
    id: 'prod-supreme-pizza',
    name: 'Supreme Pizza',
    category: 'Pizza',
    description: 'Rich combination of smoked chicken, sausages, mushrooms, black olives, onions, and extra cheese.',
    basePrice: 500,
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80',
    sizes: [
      { name: 'Small (8")', price: 500 },
      { name: 'Medium (11")', price: 1000 },
      { name: 'Large (13")', price: 1600 },
      { name: 'Family (17")', price: 2500 }
    ],
    addons: pizzaAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false,
    tags: ['Supreme', 'Loaded']
  },
  {
    id: 'prod-hot-spicy-pizza',
    name: 'Hot & Spicy Pizza',
    category: 'Pizza',
    description: 'Fiery chili-seasoned chicken, green chilies, spicy sauce, onions, and rich mozzarella.',
    basePrice: 500,
    image: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=800&q=80',
    sizes: [
      { name: 'Small (8")', price: 500 },
      { name: 'Medium (11")', price: 1000 },
      { name: 'Large (13")', price: 1500 },
      { name: 'Family (17")', price: 2400 }
    ],
    addons: pizzaAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false,
    tags: ['Spicy']
  },
  {
    id: 'prod-fry-chicken-pizza',
    name: 'Fry Chicken Pizza',
    category: 'Pizza',
    description: 'Crispy fried chicken bites layered over golden crust with cheese blend and secret seasoning.',
    basePrice: 600,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
    sizes: [
      { name: 'Small (8")', price: 600 },
      { name: 'Medium (11")', price: 1100 },
      { name: 'Large (13")', price: 1700 },
      { name: 'Family (17")', price: 2600 }
    ],
    addons: pizzaAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-achari-pizza',
    name: 'Achari Pizza',
    category: 'Pizza',
    description: 'Tangy pickle-spiced achari chicken with pickled spices and mozzarella on hand-tossed dough.',
    basePrice: 450,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
    sizes: [
      { name: 'Small (8")', price: 450 },
      { name: 'Medium (11")', price: 900 },
      { name: 'Large (13")', price: 1500 },
      { name: 'Family (17")', price: 2400 }
    ],
    addons: pizzaAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-tandoori-pizza',
    name: 'Tandoori Pizza',
    category: 'Pizza',
    description: 'Smoky clay-oven tandoori spiced chicken cubes with sliced onions and coriander herbs.',
    basePrice: 500,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    sizes: [
      { name: 'Small (8")', price: 500 },
      { name: 'Medium (11")', price: 950 },
      { name: 'Large (13")', price: 1600 },
      { name: 'Family (17")', price: 2400 }
    ],
    addons: pizzaAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-cheese-lower-pizza',
    name: 'Cheese Lower Pizza',
    category: 'Pizza',
    description: 'Special double-layer mozzarella cheese sensation for cheese enthusiasts.',
    basePrice: 500,
    image: 'https://images.unsplash.com/photo-1548369937-47519962c11a?auto=format&fit=crop&w=800&q=80',
    sizes: [
      { name: 'Small (8")', price: 500 },
      { name: 'Medium (11")', price: 1000 },
      { name: 'Large (13")', price: 1700 },
      { name: 'Family (17")', price: 2500 }
    ],
    addons: pizzaAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-veggie-lover-pizza',
    name: 'Veggie Lover Pizza',
    category: 'Pizza',
    description: 'Loaded with farm-fresh bell peppers, mushrooms, onions, sweet corn, black olives, and cheese.',
    basePrice: 500,
    image: 'https://images.unsplash.com/photo-1576458088443-04a19bb13da6?auto=format&fit=crop&w=800&q=80',
    sizes: [
      { name: 'Small (8")', price: 500 },
      { name: 'Medium (11")', price: 1000 },
      { name: 'Large (13")', price: 1600 },
      { name: 'Family (17")', price: 2500 }
    ],
    addons: pizzaAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false,
    dietary: ['vegetarian']
  },
  {
    id: 'prod-cheese-chicken-pizza',
    name: 'Cheese Chicken Pizza',
    category: 'Pizza',
    description: 'Heavily loaded chicken chunks with melted cheddar and mozzarella cheese pools.',
    basePrice: 700,
    image: 'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?auto=format&fit=crop&w=800&q=80',
    sizes: [
      { name: 'Small (8")', price: 700 },
      { name: 'Medium (11")', price: 1300 },
      { name: 'Large (13")', price: 1900 },
      { name: 'Family (17")', price: 2800 }
    ],
    addons: pizzaAddons,
    isAvailable: true,
    isFeatured: true,
    isBestSeller: false
  },
  {
    id: 'prod-peri-peri-spicy-pizza',
    name: 'Peri Peri Spicy Pizza',
    category: 'Pizza',
    description: 'Flame-kissed peri peri chicken with fiery African bird eye chili glaze and spicy peppers.',
    basePrice: 500,
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
    sizes: [
      { name: 'Small (8")', price: 500 },
      { name: 'Medium (11")', price: 1000 },
      { name: 'Large (13")', price: 1700 },
      { name: 'Family (17")', price: 2600 }
    ],
    addons: pizzaAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false,
    dietary: ['spicy']
  },
  {
    id: 'prod-bone-fire-pizza',
    name: 'Bone Fire Pizza',
    category: 'Pizza',
    description: 'Smoked campfire BBQ chicken, caramelized onions, jalapeños, and smoky sauce.',
    basePrice: 650,
    image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=800&q=80',
    sizes: [
      { name: 'Small (8")', price: 650 },
      { name: 'Medium (11")', price: 1100 },
      { name: 'Large (13")', price: 1700 },
      { name: 'Family (17")', price: 2800 }
    ],
    addons: pizzaAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-extreme-pizza',
    name: 'Extreme Pizza',
    category: 'Pizza',
    description: 'Double meat extravaganza with extreme spices, sausages, peppers, and garlic drizzle.',
    basePrice: 750,
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&q=80',
    sizes: [
      { name: 'Small (8")', price: 750 },
      { name: 'Medium (11")', price: 1300 },
      { name: 'Large (13")', price: 1900 },
      { name: 'Family (17")', price: 2900 }
    ],
    addons: pizzaAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-creamy-stuff-pizza',
    name: 'Creamy Stuff Pizza',
    category: 'Pizza',
    description: 'Silky cream sauce base, tender grilled chicken, stuffed edges, and Italian herbs.',
    basePrice: 750,
    image: 'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?auto=format&fit=crop&w=800&q=80',
    sizes: [
      { name: 'Small (8")', price: 750 },
      { name: 'Medium (11")', price: 1300 },
      { name: 'Large (13")', price: 1900 },
      { name: 'Family (17")', price: 3000 }
    ],
    addons: pizzaAddons,
    isAvailable: true,
    isFeatured: true,
    isBestSeller: true,
    tags: ['Signature', 'Creamy']
  },
  {
    id: 'prod-cheese-crust-pizza',
    name: 'Cheese Crust Pizza',
    category: 'Pizza',
    description: 'Golden crust ring fully stuffed with molten mozzarella string cheese.',
    basePrice: 750,
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80',
    sizes: [
      { name: 'Small (8")', price: 750 },
      { name: 'Medium (11")', price: 1300 },
      { name: 'Large (13")', price: 1900 },
      { name: 'Family (17")', price: 3100 }
    ],
    addons: pizzaAddons,
    isAvailable: true,
    isFeatured: true,
    isBestSeller: false
  },
  {
    id: 'prod-bihari-kabab-pizza',
    name: 'Bihari Kabab Pizza',
    category: 'Pizza',
    description: 'Tender Bihari seasoned kebab chunks, green chilies, mint yogurt drizzle, and mozzarella.',
    basePrice: 750,
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
    sizes: [
      { name: 'Small (8")', price: 750 },
      { name: 'Medium (11")', price: 1300 },
      { name: 'Large (13")', price: 1900 },
      { name: 'Family (17")', price: 3100 }
    ],
    addons: pizzaAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-crown-crust-pizza',
    name: 'Crown Crust Pizza',
    category: 'Pizza',
    description: 'Regal crown-shaped pockets filled with savory chicken and cheese balls around the border.',
    basePrice: 750,
    image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=800&q=80',
    sizes: [
      { name: 'Small (8")', price: 750 },
      { name: 'Medium (11")', price: 1350 },
      { name: 'Large (13")', price: 1950 },
      { name: 'Family (17")', price: 3100 }
    ],
    addons: pizzaAddons,
    isAvailable: true,
    isFeatured: true,
    isBestSeller: true,
    tags: ['Crown Crust', 'Specialty']
  },
  {
    id: 'prod-stif-crust-pizza',
    name: 'Stif Crust Pizza',
    category: 'Pizza',
    description: 'Signature crispy firm crust with spicy chicken tikka, black olives, and cheese.',
    basePrice: 800,
    image: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=800&q=80',
    sizes: [
      { name: 'Small (8")', price: 800 },
      { name: 'Medium (11")', price: 1400 },
      { name: 'Large (13")', price: 2000 },
      { name: 'Family (17")', price: 3200 }
    ],
    addons: pizzaAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-lazania-pizza',
    name: 'Lazania Pizza',
    category: 'Pizza',
    description: 'Delectable layered Italian lasagna sheets, savory minced chicken Bolognese, white sauce, and cheese.',
    basePrice: 1500,
    image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=800&q=80',
    sizes: [
      { name: 'Medium (11")', price: 1500 },
      { name: 'Large (13")', price: 2400 },
      { name: 'Family (17")', price: 3500 }
    ],
    addons: pizzaAddons,
    isAvailable: true,
    isFeatured: true,
    isBestSeller: false
  },
  {
    id: 'prod-malai-boti-crown-pizza',
    name: 'Malai Boti Crown Pizza',
    category: 'Pizza',
    description: 'Melt-in-mouth creamy Malai Boti chicken with special white sauce and crown crust design.',
    basePrice: 800,
    image: 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&w=800&q=80',
    sizes: [
      { name: 'Small (8")', price: 800 },
      { name: 'Medium (11")', price: 1400 },
      { name: 'Large (13")', price: 2000 },
      { name: 'Family (17")', price: 3300 }
    ],
    addons: pizzaAddons,
    isAvailable: true,
    isFeatured: true,
    isBestSeller: true,
    tags: ['Malai Boti', 'Premium']
  },
  {
    id: 'prod-double-seekh-kabab-pizza',
    name: 'Double Seekh Kabab Pizza',
    category: 'Pizza',
    description: 'Juicy spiced seekh kabab pieces placed around the edge and throughout the center.',
    basePrice: 900,
    image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=800&q=80',
    sizes: [
      { name: 'Small (8")', price: 900 },
      { name: 'Medium (11")', price: 1600 },
      { name: 'Large (13")', price: 2300 },
      { name: 'Family (17")', price: 3200 }
    ],
    addons: pizzaAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-double-daker-pizza',
    name: 'Double Daker Pizza',
    category: 'Pizza',
    description: 'Ultimate two-tier double decker loaded pizza filled inside and topped with double toppings.',
    basePrice: 1000,
    image: 'https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?auto=format&fit=crop&w=800&q=80',
    sizes: [
      { name: 'Small (8")', price: 1000 },
      { name: 'Medium (11")', price: 1800 },
      { name: 'Large (13")', price: 2800 },
      { name: 'Family (17")', price: 4000 }
    ],
    addons: pizzaAddons,
    isAvailable: true,
    isFeatured: true,
    isBestSeller: true,
    tags: ['Double Decker', 'Giant']
  },

  // BURGERS
  {
    id: 'prod-grill-burger',
    name: 'Grill Burger (with Fries)',
    category: 'Burger',
    description: 'Tender flame-grilled seasoned chicken breast fillet topped with crisp lettuce, onion, and signature grill sauce. Served with golden fries.',
    basePrice: 550,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: true,
    isBestSeller: true
  },
  {
    id: 'prod-special-pizza-zinger-burger',
    name: 'Special Pizza Zinger Burger (with Fries)',
    category: 'Burger',
    description: 'Massive crispy zinger fillet topped with pizza sauce, melted mozzarella, capsicum, and olives. Served with fries.',
    basePrice: 650,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: true,
    isBestSeller: true,
    tags: ['Chef Special', 'Pizza Fusion']
  },
  {
    id: 'prod-peri-peri-spicy-burger',
    name: 'Peri Peri Spicy Burger (with Fries)',
    category: 'Burger',
    description: 'Crispy fried fillet drenched in tangy peri-peri hot pepper sauce with fries.',
    basePrice: 550,
    image: 'https://images.unsplash.com/photo-1596662951482-0c4ba74a6df6?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false,
    dietary: ['spicy']
  },
  {
    id: 'prod-petti-burger',
    name: 'Petti Burger (with Fries)',
    category: 'Burger',
    description: 'Classic breaded chicken patty burger with coleslaw, mayonnaise, and hot fries.',
    basePrice: 330,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-zinger-burger',
    name: 'Zinger Burger',
    category: 'Burger',
    description: 'Crunchy golden-fried spicy chicken thigh fillet in toasted sesame bun with lettuce and mayo.',
    basePrice: 350,
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: true,
    isBestSeller: true,
    tags: ['Classic', 'Value']
  },
  {
    id: 'prod-zinger-burger-fries',
    name: 'Zinger Burger (with Fries)',
    category: 'Burger',
    description: 'Crunchy golden-fried spicy chicken thigh fillet with fresh fries and dip sauce.',
    basePrice: 400,
    image: '/assets/images/hero_3d_burger_1794391292664.jpg',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: true,
    isBestSeller: true
  },
  {
    id: 'prod-jalapeno-burger',
    name: 'Jalapeno Burger (with Fries)',
    category: 'Burger',
    description: 'Crispy chicken fillet stacked with sliced pickled jalapenos, spicy cheese sauce, and fries.',
    basePrice: 500,
    image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false,
    dietary: ['spicy']
  },
  {
    id: 'prod-mighty-zinger-burger',
    name: 'Mighty Zinger Burger (with Fries)',
    category: 'Burger',
    description: 'Two gigantic crispy zinger chicken fillets stacked high with double cheese, creamy mayo, and fries.',
    basePrice: 750,
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: true,
    isBestSeller: true,
    tags: ['Double Fillet', 'Monster']
  },
  {
    id: 'prod-tower-burger',
    name: 'Tower Burger (with Fries)',
    category: 'Burger',
    description: 'Crispy zinger fillet layered with a golden potato hash brown patty, cheese slice, and fries.',
    basePrice: 700,
    image: 'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-chicken-boti-burger',
    name: 'Chicken Boti Burger',
    category: 'Burger',
    description: 'Charcoal-grilled BBQ chicken boti pieces tossed in traditional herbs and tangy chutneys.',
    basePrice: 330,
    image: 'https://images.unsplash.com/photo-1576843776838-032ac46fbb93?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-chicken-lapeta-burger',
    name: 'Chicken Lapeta Burger',
    category: 'Burger',
    description: 'Crisp fried egg wrapped securely around spicy chicken patty in soft toasted bun.',
    basePrice: 350,
    image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-chicken-shami-lapeta-burger',
    name: 'Chicken Shami Lapeta Burger',
    category: 'Burger',
    description: 'Desi style chicken shami tikki wrapped in golden fried egg with salad and mint sauce.',
    basePrice: 320,
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-shami-lapeta-burger',
    name: 'Shami Lapeta Burger',
    category: 'Burger',
    description: 'Traditional lentil & meat shami tikki wrapped in fluffy fried egg.',
    basePrice: 250,
    image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-chicken-shami-burger',
    name: 'Chicken Shami Burger',
    category: 'Burger',
    description: 'Authentic spiced chicken shami patty with fresh sliced cucumber and sauce.',
    basePrice: 250,
    image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-shami-burger',
    name: 'Shami Burger',
    category: 'Burger',
    description: 'Classic street-style shami tikki burger with toasted bun and traditional ketchup-mayo mix.',
    basePrice: 180,
    image: 'https://images.unsplash.com/photo-1547584370-2cc98b8b8dc8?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },

  // SANDWICHES
  {
    id: 'prod-tikka-sandwich',
    name: 'Tikka Sandwich (with Fries)',
    category: 'Sandwich',
    description: 'Spiced chicken tikka cubes tossed with fresh salad, creamy sauce, toasted bread, and fries.',
    basePrice: 500,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-pizza-stacker-sandwich',
    name: 'Pizza Stacker Sandwich',
    category: 'Sandwich',
    description: 'Stacked multi-layer club loaded with pizza sauce, mozzarella, chicken, and oregano.',
    basePrice: 999,
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: true,
    isBestSeller: true,
    tags: ['Mega Stacker', 'Specialty']
  },
  {
    id: 'prod-panini-sandwich',
    name: 'Panini Sandwich',
    category: 'Sandwich',
    description: 'Pressed Italian panini bread with seasoned grilled chicken, melting cheese, and garlic butter.',
    basePrice: 600,
    image: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-grill-sandwich',
    name: 'Grill Sandwich (with Fries)',
    category: 'Sandwich',
    description: 'Crispy grilled sandwich with marinated chicken, cheddar, herbs, and side of fries.',
    basePrice: 550,
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-zinger-sandwich',
    name: 'Zinger Sandwich (with Fries)',
    category: 'Sandwich',
    description: 'Crispy zinger chicken strips inside toasted triple-decker bread with French fries.',
    basePrice: 500,
    image: 'https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-chicken-club-sandwich',
    name: 'Chicken Club Sandwich (with Fries)',
    category: 'Sandwich',
    description: 'Classic 3-tier club sandwich with shredded chicken, boiled egg, cheese slice, lettuce, and fries.',
    basePrice: 400,
    image: '/assets/images/club_sandwich_fries_1794391328479.jpg',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: true,
    isBestSeller: true
  },
  {
    id: 'prod-chicken-cheese-sandwich',
    name: 'Chicken Cheese Sandwich (with Fries)',
    category: 'Sandwich',
    description: 'Melted cheese slice over hot chicken filing between butter-toasted sandwich slices with fries.',
    basePrice: 550,
    image: 'https://images.unsplash.com/photo-1619860860774-1e2e17343432?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-chicken-cheese-stick',
    name: 'Chicken Cheese Stick',
    category: 'Sandwich',
    description: 'Crispy fried bread rolls stuffed with stringy chicken and cheese mixture.',
    basePrice: 600,
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },

  // PARATHA ROLLS
  {
    id: 'prod-pizza-paratha',
    name: 'Pizza Paratha',
    category: 'Paratha Roll',
    description: 'Crispy flaky paratha stuffed with pizza chicken, pizza sauce, mozzarella cheese, and capsicum.',
    basePrice: 600,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: true,
    isBestSeller: true,
    tags: ['Fusion', 'Customer Favourite']
  },
  {
    id: 'prod-chicken-bbq-paratha',
    name: 'Chicken Bbq Paratha',
    category: 'Paratha Roll',
    description: 'Smoky BBQ chicken boti wrapped in hot golden paratha with onions and green chutney.',
    basePrice: 500,
    image: '/assets/images/paratha_roll_bbq_1794391328091.jpg',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-bbq-paratha',
    name: 'BBQ Paratha',
    category: 'Paratha Roll',
    description: 'Classic BBQ spiced tender meat wrapped in flaky crispy paratha.',
    basePrice: 500,
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-zinger-paratha',
    name: 'Zinger Paratha',
    category: 'Paratha Roll',
    description: 'Crispy spicy zinger chicken strips rolled inside crisp golden paratha with garlic mayo.',
    basePrice: 500,
    image: 'https://images.unsplash.com/photo-1644787979606-25f0f37beea7?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: true,
    isBestSeller: true
  },
  {
    id: 'prod-zinger-cheese-paratha',
    name: 'Zinger Cheese Paratha',
    category: 'Paratha Roll',
    description: 'Zinger chicken strips rolled with melted cheddar/mozzarella cheese inside flaky paratha.',
    basePrice: 550,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: true,
    isBestSeller: false
  },
  {
    id: 'prod-chicken-paratha',
    name: 'Chicken Paratha',
    category: 'Paratha Roll',
    description: 'Tender marinated chicken chunks wrapped in freshly fried golden paratha.',
    basePrice: 400,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-chicken-cheese-paratha',
    name: 'Chicken Cheese Paratha',
    category: 'Paratha Roll',
    description: 'Savory chicken pieces and gooey melted cheese in a crispy paratha wrap.',
    basePrice: 450,
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-chicken-grill-paratha',
    name: 'Chicken Grill Paratha',
    category: 'Paratha Roll',
    description: 'Juicy grilled chicken slices wrapped in crispy paratha with special herb mayo.',
    basePrice: 550,
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },

  // SHAWARMA
  {
    id: 'prod-chicken-shawarma',
    name: 'Chicken Shawarma',
    category: 'Shawarma',
    description: 'Authentic rotating vertical spit roasted spiced chicken shaved thin, rolled in fresh pita bread with garlic toum sauce and pickles.',
    basePrice: 250,
    image: '/assets/images/arabian_chicken_shawarma_1794391294232.jpg',
    sizes: [
      { name: 'Regular', price: 250 },
      { name: 'Jumbo', price: 320 }
    ],
    addons: commonAddons,
    isAvailable: true,
    isFeatured: true,
    isBestSeller: true,
    tags: ['Best Seller', 'Arabian Original']
  },
  {
    id: 'prod-chicken-cheese-shawarma',
    name: 'Chicken Cheese Shawarma',
    category: 'Shawarma',
    description: 'Classic roasted chicken shawarma infused with melted mozzarella cheese for a rich velvety bite.',
    basePrice: 450,
    image: 'https://images.unsplash.com/photo-1633321702518-7feccafb94d5?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: true,
    isBestSeller: true
  },
  {
    id: 'prod-chicken-olive-shawarma',
    name: 'Chicken Olive Shawarma',
    category: 'Shawarma',
    description: 'Succulent chicken shawarma stuffed with sliced black Spanish olives and garlic sauce.',
    basePrice: 450,
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-chicken-jalapeno-shawarma',
    name: 'Chicken Jalapeno Shawarma',
    category: 'Shawarma',
    description: 'Zesty roasted chicken shawarma packed with spicy pickled jalapeños and hot sauce.',
    basePrice: 450,
    image: 'https://images.unsplash.com/photo-1648680786518-a6642f6c9135?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false,
    dietary: ['spicy']
  },
  {
    id: 'prod-platter-shawarma',
    name: 'Platter Shawarma (Extra Bread 50)',
    category: 'Shawarma',
    description: 'Generous platter filled with sliced shawarma chicken, toasted pita bread slices, hummus/garlic dip, crispy fries, and pickles.',
    basePrice: 600,
    image: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=800&q=80',
    addons: [
      { id: 'addon-extra-bread', name: 'Extra Bread', price: 50 },
      ...commonAddons
    ],
    isAvailable: true,
    isFeatured: true,
    isBestSeller: true,
    tags: ['Platter', 'Family Serving']
  },
  {
    id: 'prod-zinger-shawarma',
    name: 'Zinger Shawarma',
    category: 'Shawarma',
    description: 'Crispy deep-fried zinger chicken fillet strips rolled inside soft pita bread with coleslaw and secret sauce.',
    basePrice: 350,
    image: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: true,
    isBestSeller: true
  },
  {
    id: 'prod-zinger-cheese-shawarma',
    name: 'Zinger Cheese Shawarma',
    category: 'Shawarma',
    description: 'Crunchy zinger chicken strips loaded with melted cheese in a warm pita pocket.',
    basePrice: 450,
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-arabian-special-shawarma',
    name: 'Arabian Special Shawarma',
    category: 'Shawarma',
    description: 'Signature house blend of roasted chicken, secret Arabian herbs, double garlic sauce, and pickles.',
    basePrice: 450,
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: true,
    isBestSeller: true,
    tags: ['House Specialty']
  },
  {
    id: 'prod-grill-chicken-shawarma',
    name: 'Grill Chicken Shawarma',
    category: 'Shawarma',
    description: 'Charcoal flame-grilled chicken breast pieces wrapped with fresh crunchy greens and sauce.',
    basePrice: 450,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },

  // WRAPS
  {
    id: 'prod-peri-peri-spicy-wrap',
    name: 'Peri Peri Spicy Wrap',
    category: 'Wrap',
    description: 'Fiery peri-peri chicken tenders wrapped in toasted tortilla with crisp greens and spicy mayo.',
    basePrice: 650,
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false,
    dietary: ['spicy']
  },
  {
    id: 'prod-grill-wrap',
    name: 'Grill Wrap',
    category: 'Wrap',
    description: 'Smoky grilled chicken strips with sliced cucumber, tomato, and garlic herb spread in a tortilla.',
    basePrice: 650,
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-bbq-wrap',
    name: 'BBQ Wrap',
    category: 'Wrap',
    description: 'Sweet and tangy BBQ glazed chicken wrapped tight with caramelized onions.',
    basePrice: 650,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-nuggets-wrap',
    name: 'Nuggets Wrap',
    category: 'Wrap',
    description: 'Golden crispy chicken nuggets wrapped in toasted flatbread with lettuce and mayonnaise.',
    basePrice: 650,
    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-zinger-wrap',
    name: 'Zinger Wrap',
    category: 'Wrap',
    description: 'Crunchy battered zinger strips wrapped with fresh shredded iceberg lettuce and garlic mayo.',
    basePrice: 600,
    image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: true,
    isBestSeller: true
  },
  {
    id: 'prod-chicken-wrap',
    name: 'Chicken Wrap',
    category: 'Wrap',
    description: 'Tender chicken slices with seasoned yogurt sauce and garden salad in a warm wrap.',
    basePrice: 500,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },

  // APPETIZERS
  {
    id: 'prod-loaded-fries',
    name: 'Loaded Fries',
    category: 'Appetizer',
    description: 'Crispy French fries smothered in shredded chicken, melted cheddar cheese, jalapeños, and special sauce.',
    basePrice: 700,
    image: '/assets/images/loaded_cheese_fries_1794391295410.jpg',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: true,
    isBestSeller: true,
    tags: ['Customer Favourite', 'Loaded']
  },
  {
    id: 'prod-pizza-fries',
    name: 'Pizza Fries',
    category: 'Appetizer',
    description: 'Golden fries layered with Italian pizza sauce, chicken tikka, mozzarella cheese, and baked golden.',
    basePrice: 650,
    image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: true,
    isBestSeller: true
  },
  {
    id: 'prod-cheese-mayo-fries',
    name: 'Cheese Mayo Fries',
    category: 'Appetizer',
    description: 'Hot fries generously drizzled with warm cheese sauce and garlic mayo blend.',
    basePrice: 600,
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-masala-fries',
    name: 'Masala Fries',
    category: 'Appetizer',
    description: 'Crispy salted fries dusted with chatpata spicy Pakistani chaat masala.',
    basePrice: 400,
    image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-plan-fries',
    name: 'Plan Fries',
    category: 'Appetizer',
    description: 'Fresh hand-cut crispy golden potato fries seasoned with sea salt.',
    basePrice: 300,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-hot-shot',
    name: 'Hot Shot (12 Pieces)',
    category: 'Appetizer',
    description: '12 bite-sized crunchy popcorn chicken pieces seasoned with fiery spices. Served with dip.',
    basePrice: 800,
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: true,
    isBestSeller: true
  },
  {
    id: 'prod-nuggets',
    name: 'Nuggets (10 Pieces)',
    category: 'Appetizer',
    description: '10 golden fried breaded chicken breast nuggets. Loved by kids and adults alike.',
    basePrice: 700,
    image: 'https://images.unsplash.com/photo-1585325701165-351af916e581?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-hot-wings',
    name: 'Hot Wings (10 Pieces)',
    category: 'Appetizer',
    description: '10 crispy battered chicken wings fried to perfection with hot chili seasoning.',
    basePrice: 800,
    image: 'https://images.unsplash.com/photo-1527477378377-50a89ceb8e21?auto=format&fit=crop&w=800&q=80',
    addons: commonAddons,
    isAvailable: true,
    isFeatured: true,
    isBestSeller: true
  },

  // DRINKS
  {
    id: 'prod-drink-345ml',
    name: '345ml Cold Drink',
    category: 'Drinks',
    description: 'Chilled 345ml soft drink bottle (Next Cola / Pepsi / 7Up / Mirinda subject to availability).',
    basePrice: 120,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-drink-500ml',
    name: '500ml Cold Drink',
    category: 'Drinks',
    description: 'Chilled 500ml soft drink bottle.',
    basePrice: 150,
    image: '/assets/images/chilled_cold_drinks_1794391330454.jpg',
    isAvailable: true,
    isFeatured: false,
    isBestSeller: true
  },
  {
    id: 'prod-drink-1ltr',
    name: '1 Ltr Cold Drink',
    category: 'Drinks',
    description: 'Chilled 1 Litre soft drink bottle.',
    basePrice: 200,
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-drink-1-5ltr',
    name: '1.5 Ltr Cold Drink',
    category: 'Drinks',
    description: 'Chilled 1.5 Litre family soft drink bottle.',
    basePrice: 250,
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isFeatured: true,
    isBestSeller: true
  },
  {
    id: 'prod-drink-2-25ltr',
    name: '2.25 Ltr Cold Drink',
    category: 'Drinks',
    description: 'Chilled jumbo 2.25 Litre party soft drink bottle.',
    basePrice: 300,
    image: 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-water-small',
    name: 'Mineral Water Small',
    category: 'Drinks',
    description: 'Pure 500ml sealed drinking mineral water bottle.',
    basePrice: 70,
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-water-large',
    name: 'Mineral Water Large',
    category: 'Drinks',
    description: 'Pure 1.5 Litre sealed drinking mineral water bottle.',
    basePrice: 150,
    image: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },

  // DIP SAUCE
  {
    id: 'prod-mayo-garlic-sauce',
    name: 'Mayo Garlic Sauce',
    category: 'Dip Sauce',
    description: 'Creamy garlic infused mayonnaise dip, freshly made in-house.',
    basePrice: 100,
    image: '/assets/images/gourmet_dip_sauces_1794391329846.jpg',
    isAvailable: true,
    isFeatured: false,
    isBestSeller: true
  },
  {
    id: 'prod-special-sauce',
    name: 'Special Sauce',
    category: 'Dip Sauce',
    description: 'Arabian secret blend sauce with herbs, spices, and mayonnaise.',
    basePrice: 100,
    image: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isFeatured: false,
    isBestSeller: true
  },
  {
    id: 'prod-peri-peri-sauce',
    name: 'Peri Peri Sauce',
    category: 'Dip Sauce',
    description: 'Spicy peri peri chili dip with lemon, garlic, and fiery peppers.',
    basePrice: 100,
    image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false,
    dietary: ['spicy']
  },
  {
    id: 'prod-chipotle-sauce',
    name: 'Chipotle Sauce',
    category: 'Dip Sauce',
    description: 'Smoky jalapeño chipotle sauce with rich creamy texture.',
    basePrice: 100,
    image: 'https://images.unsplash.com/photo-1563599175-e3b7b4ae530f?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false
  },
  {
    id: 'prod-jalapeno-sauce',
    name: 'Jalapeno Sauce',
    category: 'Dip Sauce',
    description: 'Tangy and spicy green pickled jalapeño sauce dip.',
    basePrice: 100,
    image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false,
    dietary: ['spicy']
  }
];

// All 29 Regular Deals extracted verbatim from Image 1
export const initialDeals: Deal[] = [
  {
    id: 'deal-01',
    dealNumber: 'DEAL 01',
    title: '2 Zinger Burgers + 500ml Cold Drink',
    description: '2 Crispy Zinger Burgers served with a 500ml chilled cold drink.',
    items: ['2 Zinger Burgers', '500ml Cold Drink'],
    price: 800,
    originalPrice: 850,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    isFeatured: true,
    badge: 'Popular'
  },
  {
    id: 'deal-02',
    dealNumber: 'DEAL 02',
    title: '2 Zinger Shawarmas + 500ml Cold Drink',
    description: '2 Delicious Zinger Shawarmas served with a 500ml chilled cold drink.',
    items: ['2 Zinger Shawarmas', '500ml Cold Drink'],
    price: 780,
    originalPrice: 850,
    image: '/assets/images/arabian_chicken_shawarma_1794391294232.jpg',
    isActive: true,
    isFeatured: true,
    badge: 'Best Value'
  },
  {
    id: 'deal-03',
    dealNumber: 'DEAL 03',
    title: '2 Grill Burgers + 500ml Cold Drink',
    description: '2 Juicy Grilled Chicken Burgers served with a 500ml chilled cold drink.',
    items: ['2 Grill Burgers', '500ml Cold Drink'],
    price: 1050,
    originalPrice: 1250,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    isFeatured: false
  },
  {
    id: 'deal-04',
    dealNumber: 'DEAL 04',
    title: '2 Club Sandwich with Fries + 500ml Cold Drink',
    description: '2 Chicken Club Sandwiches with fresh Fries and a 500ml chilled drink.',
    items: ['2 Club Sandwich with Fries', '500ml Cold Drink'],
    price: 900,
    originalPrice: 950,
    image: '/assets/images/club_sandwich_fries_1794391328479.jpg',
    isActive: true,
    isFeatured: false
  },
  {
    id: 'deal-05',
    dealNumber: 'DEAL 05',
    title: '2 Special Pizza Zinger Burger + 500ml Cold Drink',
    description: '2 Special Pizza Zinger Burgers loaded with cheese and a 500ml cold drink.',
    items: ['2 Special Pizza Zinger Burger', '500ml Cold Drink'],
    price: 1300,
    originalPrice: 1450,
    image: 'https://images.unsplash.com/photo-1596662951482-0c4ba74a6df6?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    isFeatured: true,
    badge: 'Special'
  },
  {
    id: 'deal-06',
    dealNumber: 'DEAL 06',
    title: '2 Pizza Burgers + 500ml Cold Drink',
    description: '2 Cheesy Pizza Burgers with a 500ml chilled cold drink.',
    items: ['2 Pizza Burgers', '500ml Cold Drink'],
    price: 999,
    originalPrice: 1100,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    isFeatured: false
  },
  {
    id: 'deal-07',
    dealNumber: 'DEAL 07',
    title: '2 Kabab Paratha Roll + 500ml Cold Drink',
    description: '2 Spiced Kabab Paratha Rolls with a 500ml chilled cold drink.',
    items: ['2 Kabab Paratha Roll', '500ml Cold Drink'],
    price: 900,
    originalPrice: 1050,
    image: '/assets/images/paratha_roll_bbq_1794391328091.jpg',
    isActive: true,
    isFeatured: false
  },
  {
    id: 'deal-08',
    dealNumber: 'DEAL 08',
    title: '2 Zinger Paratha Roll + 500ml Cold Drink',
    description: '2 Crispy Zinger Paratha Rolls with a 500ml chilled cold drink.',
    items: ['2 Zinger Paratha Roll', '500ml Cold Drink'],
    price: 999,
    originalPrice: 1150,
    image: 'https://images.unsplash.com/photo-1644787979606-25f0f37beea7?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    isFeatured: false
  },
  {
    id: 'deal-09',
    dealNumber: 'DEAL 09',
    title: '2 Kabab Shawarma + 500ml Cold Drink',
    description: '2 Flavorful Kabab Shawarmas with a 500ml chilled cold drink.',
    items: ['2 Kabab Shawarma', '500ml Cold Drink'],
    price: 700,
    originalPrice: 850,
    image: 'https://images.unsplash.com/photo-1633321702518-7feccafb94d5?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    isFeatured: false
  },
  {
    id: 'deal-10',
    dealNumber: 'DEAL 10',
    title: '2 Chicken Cheese Paratha Roll + 500ml Cold Drink',
    description: '2 Melted Chicken Cheese Paratha Rolls with a 500ml chilled drink.',
    items: ['2 Chicken Cheese Paratha Roll', '500ml Cold Drink'],
    price: 999,
    originalPrice: 1050,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    isFeatured: false
  },
  {
    id: 'deal-11',
    dealNumber: 'DEAL 11',
    title: '10 Crispy Wings + 500ml Cold Drink',
    description: '10 Golden Crispy Chicken Wings with a 500ml chilled cold drink.',
    items: ['10 Crispy Wings', '500ml Cold Drink'],
    price: 850,
    originalPrice: 950,
    image: 'https://images.unsplash.com/photo-1527477378377-50a89ceb8e21?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    isFeatured: false
  },
  {
    id: 'deal-12',
    dealNumber: 'DEAL 12',
    title: '10 Chicken Nuggets + 500ml Cold Drink',
    description: '10 Golden Chicken Nuggets served with a 500ml chilled cold drink.',
    items: ['10 Chicken Nuggets', '500ml Cold Drink'],
    price: 750,
    originalPrice: 850,
    image: 'https://images.unsplash.com/photo-1585325701165-351af916e581?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    isFeatured: false
  },
  {
    id: 'deal-13',
    dealNumber: 'DEAL 13',
    title: '12 Hot Shot Pieces + 500ml Cold Drink',
    description: '12 Spicy Hot Shot Chicken Pieces with a 500ml chilled cold drink.',
    items: ['12 Hot Shot Pieces', '500ml Cold Drink'],
    price: 900,
    originalPrice: 950,
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    isFeatured: false
  },
  {
    id: 'deal-14',
    dealNumber: 'DEAL 14',
    title: '5 Zinger Burger + 1.5 Ltr Cold Drink',
    description: '5 Crunchy Zinger Burgers with a large 1.5 Litre cold drink for the group.',
    items: ['5 Zinger Burger', '1.5 Ltr Cold Drink'],
    price: 1850,
    originalPrice: 2000,
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    isFeatured: true,
    badge: 'Group Feeder'
  },
  {
    id: 'deal-15',
    dealNumber: 'DEAL 15',
    title: '5 Zinger Shawarmas + 1.5 Ltr Cold Drink',
    description: '5 Zinger Shawarmas paired with a 1.5 Litre family cold drink.',
    items: ['5 Zinger Shawarmas', '1.5 Ltr Cold Drink'],
    price: 1800,
    originalPrice: 2000,
    image: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    isFeatured: false
  },
  {
    id: 'deal-16',
    dealNumber: 'DEAL 16',
    title: '5 Chicken Burgers + 1.5 Ltr Cold Drink',
    description: '5 Chicken Burgers with a large 1.5 Litre cold drink bottle.',
    items: ['5 Chicken Burgers', '1.5 Ltr Cold Drink'],
    price: 1700,
    originalPrice: 1900,
    image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    isFeatured: false
  },
  {
    id: 'deal-17',
    dealNumber: 'DEAL 17',
    title: '5 Chicken Shawarmas Large + 1.5 Ltr Cold Drink',
    description: '5 Large Arabian Chicken Shawarmas with a 1.5 Litre chilled drink.',
    items: ['5 Chicken Shawarmas Large', '1.5 Ltr Cold Drink'],
    price: 1400,
    originalPrice: 1600,
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    isFeatured: true,
    badge: 'Best Deal'
  },
  {
    id: 'deal-18',
    dealNumber: 'DEAL 18',
    title: '5 Chicken Jumbo Shawarmas + 1.5 Ltr Cold Drink',
    description: '5 Massive Chicken Jumbo Shawarmas with a 1.5 Litre cold drink.',
    items: ['5 Chicken Jumbo Shawarmas', '1.5 Ltr Cold Drink'],
    price: 1750,
    originalPrice: 1850,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    isFeatured: false
  },
  {
    id: 'deal-19',
    dealNumber: 'DEAL 19',
    title: '5 Shami Burger + 1.5 Ltr Cold Drink',
    description: '5 Traditional Shami Burgers with a 1.5 Litre cold drink bottle.',
    items: ['5 Shami Burger', '1.5 Ltr Cold Drink'],
    price: 999,
    originalPrice: 1150,
    image: 'https://images.unsplash.com/photo-1547584370-2cc98b8b8dc8?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    isFeatured: false
  },
  {
    id: 'deal-20',
    dealNumber: 'DEAL 20',
    title: '1 Zinger + 1 Grill + 1 Chicken Burger + 1.5 Ltr Drink',
    description: '1 Zinger Burger + 1 Grill Burger + 1 Chicken Burger + 1.5 Ltr Cold Drink.',
    items: ['1 Zinger Burger', '1 Grill Burger', '1 Chicken Burger', '1.5 Ltr Cold Drink'],
    price: 1300,
    originalPrice: 1450,
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    isFeatured: true,
    badge: 'Trio Combo'
  },
  {
    id: 'deal-21',
    dealNumber: 'DEAL 21',
    title: '2 Small Pizza + 2 Zinger + 2 Shawarma + 1.5 Ltr Drink',
    description: '2 Small Pizza (Tikka Fajita) + 2 Zinger Burger + 2 Zinger Shawarma + 1.5 Ltr Cold Drink.',
    items: ['2 Small Pizza (Tikka Fajita)', '2 Zinger Burger', '2 Zinger Shawarma', '1.5 Ltr Cold Drink'],
    price: 2400,
    originalPrice: 2700,
    image: '/assets/images/family_combo_feast_1794391295864.jpg',
    isActive: true,
    isFeatured: true,
    badge: 'Popular Family'
  },
  {
    id: 'deal-22',
    dealNumber: 'DEAL 22',
    title: '2 Medium Pizza + 10 Nuggets + 10 Wings + 1.5 Ltr Drink',
    description: '2 Medium Pizza (Tikka Fajita) + 10 Nuggets + 10 Crispy Hot Wings + 1.5 Ltr Cold Drink.',
    items: ['2 Medium Pizza (Tikka Fajita)', '10 Nuggets', '10 Crispy Hot Wings', '1.5 Ltr Cold Drink'],
    price: 3300,
    originalPrice: 3800,
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    isFeatured: true
  },
  {
    id: 'deal-23',
    dealNumber: 'DEAL 23',
    title: '1 Small, 1 Medium, 1 Large, 1 Family Pizza + 2 Jumbo Drink',
    description: '1 Small, 1 Medium (Tikka Fajita) + 1 Large, 1 Family Pizza + 2 Jumbo Cold Drink.',
    items: ['1 Small Pizza (Tikka Fajita)', '1 Medium Pizza (Tikka Fajita)', '1 Large Pizza', '1 Family Pizza', '2 Jumbo Cold Drink'],
    price: 5500,
    originalPrice: 6200,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    isFeatured: true,
    badge: 'Mega Pizza Feast'
  },
  {
    id: 'deal-24',
    dealNumber: 'DEAL 24',
    title: '2 Large Special Pizza (Crown Crust / Behari Kabab) + 2 Drinks',
    description: '2 Large Special Pizza (Crown Crust, Stuff Crust, Behari Kabab Flavour) + 2 1.5 Ltr Cold Drink.',
    items: ['2 Large Special Pizza (Crown Crust / Stuff Crust / Behari Kabab)', '2 1.5 Ltr Cold Drink'],
    price: 4200,
    originalPrice: 4700,
    image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    isFeatured: true
  },
  {
    id: 'deal-25',
    dealNumber: 'DEAL 25',
    title: 'Grand Feast: 3 Pizzas + Burgers + Shawarmas + Wings + Drinks',
    description: '1 Large, 1 Medium, 1 Small Pizza (Tikka Fajita) + 1 Zinger Burger + 1 Zinger Shawarma + 5 Nuggets + 5 Hot Wings + 1 Chiken Shawarma Large + 2 1.5 Ltr Cold Drink.',
    items: [
      '1 Large Pizza (Tikka Fajita)',
      '1 Medium Pizza (Tikka Fajita)',
      '1 Small Pizza (Tikka Fajita)',
      '1 Zinger Burger',
      '1 Zinger Shawarma',
      '5 Nuggets & 5 Hot Wings',
      '1 Chicken Shawarma Large',
      '2 1.5 Ltr Cold Drink'
    ],
    price: 4800,
    originalPrice: 5400,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    isFeatured: true,
    badge: 'Grand Feast'
  },
  {
    id: 'deal-26',
    dealNumber: 'DEAL 26',
    title: '1 Large Pizza (Tikka Fajita) + 1.5 Ltr Cold Drink',
    description: '1 Large Pizza (Tikka Fajita) served with a 1.5 Litre chilled cold drink.',
    items: ['1 Large Pizza (Tikka Fajita)', '1.5 Ltr Cold Drink'],
    price: 1650,
    originalPrice: 1750,
    image: '/assets/images/artisan_tikka_pizza_1794391294077.jpg',
    isActive: true,
    isFeatured: false
  },
  {
    id: 'deal-27',
    dealNumber: 'DEAL 27',
    title: '2 Medium Pizza (Tikka Fajita) + 1.5 Ltr Cold Drink',
    description: '2 Medium Pizzas (Tikka Fajita) served with a 1.5 Litre chilled cold drink.',
    items: ['2 Medium Pizza (Tikka Fajita)', '1.5 Ltr Cold Drink'],
    price: 1950,
    originalPrice: 2050,
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    isFeatured: true,
    badge: 'Duo Pizza'
  },
  {
    id: 'deal-28',
    dealNumber: 'DEAL 28',
    title: 'Party Box: 1 Large Pizza + 6 Burgers + 4 Shawarmas + Fries + Wings',
    description: '1 Large Pizza (Tikka Fajita) + 2 Zinger Burger + 2 Chicken Burger + 2 Shami Burger + 2 Large Chicken Shawarma + 2 Zinger Shawarma + 1 Large Fries + 5 Nuggets + 5 Hot Shot + 5 Crispy Wings + 2 1.5 Ltr Cold Drink.',
    items: [
      '1 Large Pizza (Tikka Fajita)',
      '2 Zinger Burger',
      '2 Chicken Burger',
      '2 Shami Burger',
      '2 Large Chicken Shawarma',
      '2 Zinger Shawarma',
      '1 Large Fries',
      '5 Nuggets & 5 Hot Shot',
      '5 Crispy Wings',
      '2 1.5 Ltr Cold Drink'
    ],
    price: 6000,
    originalPrice: 7000,
    image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    isFeatured: true,
    badge: 'Party Platter'
  },
  {
    id: 'deal-29',
    dealNumber: 'DEAL 29',
    title: 'Ultimate Mega Jumbo: 1 Family Pizza + 7 Burgers + 4 Shawarmas + Appetizers',
    description: '1 Family Pizza (Tikka Fajita) + 3 Zinger Burger + 2 Chicken Burger + 2 Shami Burger + 2 Zinger Shawarma + 2 Chicken Large Shawarma + 10 Piece Nuggets + 10 Piece Hot Wings/Hot Shot + 2 Large Fries + 3 1.5 Ltr Cold Drink.',
    items: [
      '1 Family Pizza 17" (Tikka Fajita)',
      '3 Zinger Burger',
      '2 Chicken Burger',
      '2 Shami Burger',
      '2 Zinger Shawarma',
      '2 Chicken Large Shawarma',
      '10 Piece Nuggets',
      '10 Piece Hot Wings/Hot Shot',
      '2 Large Fries',
      '3 1.5 Ltr Cold Drink'
    ],
    price: 8500,
    originalPrice: 9800,
    image: 'https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    isFeatured: true,
    badge: 'Ultimate Jumbo Feast'
  }
];

export const initialPaymentSettings: PaymentMethodSettings = {
  codEnabled: true,
  easypaisa: {
    enabled: true,
    accountTitle: 'Muhammad Asif',
    mobileNumber: '0322-2222461',
    instructions: 'Send payable amount via Easypaisa mobile app to 0322-2222461. Note down your 11-digit Transaction ID (TID) or upload screenshot.',
    qrCodeUrl: ''
  },
  jazzcash: {
    enabled: true,
    accountTitle: 'Muhammad Asif',
    mobileNumber: '0300-0433134',
    instructions: 'Send payable amount via JazzCash app or retailer to 0300-0433134. Enter the 12-digit TID or upload screenshot.',
    qrCodeUrl: ''
  },
  bankAccounts: [
    {
      id: 'bank-1',
      bankName: 'Meezan Bank Limited',
      accountTitle: 'Arabian Shawarma & Pizza',
      accountNumber: '02010108923451',
      iban: 'PK65MEZN0002010108923451',
      branchName: 'Walton Cantt Branch Lahore',
      instructions: 'Transfer via online banking or ATM transfer. Enter your reference / transaction ID below.',
      isActive: true
    },
    {
      id: 'bank-2',
      bankName: 'Bank Alfalah',
      accountTitle: 'Muhammad Asif',
      accountNumber: '551201994821',
      iban: 'PK12ALFH00551201994821',
      branchName: 'Cavalry Ground Branch Lahore',
      instructions: 'Transfer via Bank Alfalah / Raast ID.',
      isActive: true
    }
  ]
};

export const initialDeliveryZones: DeliveryZone[] = [
  { id: 'zone-1', name: 'Cavalry Ground & Madina Colony', city: 'Lahore', fee: 100, estimatedMinutes: '25-35 mins', minOrder: 400, instructions: 'Express rider dispatch from Cavalry Ground Mian Chowk.', latitude: 31.4918, longitude: 74.3638, isActive: true, isDeleted: false },
  { id: 'zone-2', name: 'Walton Cantt & Super Town', city: 'Lahore', fee: 150, estimatedMinutes: '30-40 mins', minOrder: 400, instructions: 'Hot thermal bag delivery across Walton Road & Super Town.', latitude: 31.4795, longitude: 74.3694, isActive: true, isDeleted: false },
  { id: 'zone-3', name: 'DHA Phase 1 & 2', city: 'Lahore', fee: 200, estimatedMinutes: '35-45 mins', minOrder: 500, instructions: 'Gate entry details appreciated in delivery instructions.', latitude: 31.4822, longitude: 74.3952, isActive: true, isDeleted: false },
  { id: 'zone-4', name: 'DHA Phase 3 & 5', city: 'Lahore', fee: 250, estimatedMinutes: '40-50 mins', minOrder: 600, instructions: 'Direct doorstep delivery across Sectors Z, XX, and Phase 5.', latitude: 31.4697, longitude: 74.4055, isActive: true, isDeleted: false },
  { id: 'zone-5', name: 'Gulberg III & Main Boulevard', city: 'Lahore', fee: 250, estimatedMinutes: '40-50 mins', minOrder: 600, instructions: 'Covers Main Boulevard, Liberty & Block C-K.', latitude: 31.5095, longitude: 74.3512, isActive: true, isDeleted: false },
  { id: 'zone-6', name: 'Askari 9 & 10', city: 'Lahore', fee: 200, estimatedMinutes: '30-40 mins', minOrder: 500, instructions: 'Visitor gate pass notification may be required upon arrival.', latitude: 31.4981, longitude: 74.3910, isActive: true, isDeleted: false },
];

export const initialCoupons: Coupon[] = [
  {
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 1000,
    maxDiscount: 300,
    timesUsed: 14,
    isActive: true
  },
  {
    code: 'SHAWARMA50',
    discountType: 'fixed',
    discountValue: 50,
    minOrderValue: 500,
    timesUsed: 29,
    isActive: true
  },
  {
    code: 'FAMILYDEAL',
    discountType: 'fixed',
    discountValue: 200,
    minOrderValue: 2500,
    timesUsed: 8,
    isActive: true
  }
];

export const initialCustomers: CustomerProfile[] = [
  {
    id: 'cust-1',
    name: 'Hamza Tariq',
    phone: '0321-4829103',
    email: 'hamza.tariq@gmail.com',
    address: 'House 42, St 5, Cavalry Ground, Lahore',
    registeredAt: '2026-10-14T14:20:00Z',
    totalOrders: 6,
    totalSpend: 11450,
    lastOrderDate: '2026-11-09T20:45:00Z',
    status: 'vip',
    tags: ['VIP', 'Pizza Lover', 'Frequent Customer'],
    internalNotes: 'Prefers extra white sauce on Tikka Pizza. Always polite and tips riders.',
    orders: ['ASP-102941', 'ASP-101824']
  },
  {
    id: 'cust-2',
    name: 'Ayesha Malik',
    phone: '0302-8841920',
    email: 'ayesha.malik@outlook.com',
    address: 'Apartment 3B, Madina Heights, Walton Road, Lahore',
    registeredAt: '2026-10-28T18:10:00Z',
    totalOrders: 3,
    totalSpend: 4200,
    lastOrderDate: '2026-11-10T19:30:00Z',
    status: 'active',
    tags: ['Regular', 'Shawarma Fan'],
    internalNotes: 'Prefers Arabian Special Shawarma with zero pickles.',
    orders: ['ASP-103112']
  },
  {
    id: 'cust-3',
    name: 'Zubair Butt',
    phone: '0333-4190822',
    email: 'zubairbutt88@yahoo.com',
    address: 'Plot 118, Sector J, DHA Phase 1, Lahore',
    registeredAt: '2026-11-02T12:00:00Z',
    totalOrders: 2,
    totalSpend: 7850,
    lastOrderDate: '2026-11-08T22:15:00Z',
    status: 'active',
    tags: ['Big Family Deals'],
    internalNotes: 'Usually orders Deal 28 or Deal 29 for weekend gatherings.',
    orders: ['ASP-102750']
  }
];

export const initialReviews: Review[] = [
  {
    id: 'rev-1',
    customerName: 'Usman Ali',
    rating: 5,
    comment: 'Best Arabian Shawarma in Walton Cantt! The authentic garlic toum sauce and juicy roasted chicken is unbeatable.',
    date: '2026-11-08',
    isApproved: true,
    itemOrdered: 'Arabian Special Shawarma'
  },
  {
    id: 'rev-2',
    customerName: 'Fatima Noor',
    rating: 5,
    comment: 'The Crown Crust Pizza was overflowing with cheese and tender malai boti. Highly recommended for family dinners.',
    date: '2026-11-06',
    isApproved: true,
    itemOrdered: 'Malai Boti Crown Pizza'
  },
  {
    id: 'rev-3',
    customerName: 'Bilal Chaudhry',
    rating: 5,
    comment: 'Deal 28 made our party! The zinger burgers were super crunchy and the Tikka pizza was hot and fresh.',
    date: '2026-11-04',
    isApproved: true,
    itemOrdered: 'Deal 28'
  }
];

export const initialOrders: Order[] = [
  {
    id: 'ASP-103112',
    createdAt: '2026-11-10T19:30:00Z',
    orderType: 'delivery',
    customer: {
      name: 'Ayesha Malik',
      phone: '0302-8841920',
      email: 'ayesha.malik@outlook.com',
      address: 'Apartment 3B, Madina Heights, Walton Road',
      area: 'Walton Cantt & Super Town',
      city: 'Lahore',
      instructions: 'Please call before arriving, buzzer is out of order'
    },
    items: [
      {
        id: 'cart-101',
        productId: 'deal-02',
        name: 'DEAL 02: 2 Zinger Shawarmas + 500ml Cold Drink',
        category: 'Regular Deals',
        price: 780,
        quantity: 1,
        image: '/assets/images/family_combo_feast_1794391295864.jpg',
        isDeal: true
      },
      {
        id: 'cart-102',
        productId: 'prod-loaded-fries',
        name: 'Loaded Fries',
        category: 'Appetizer',
        price: 700,
        quantity: 1,
        image: '/assets/images/artisan_tikka_pizza_1794391294077.jpg'
      }
    ],
    subtotal: 1480,
    discount: 50,
    couponCode: 'SHAWARMA50',
    deliveryFee: 150,
    tax: 0,
    total: 1580,
    status: 'delivered',
    payment: {
      method: 'easypaisa',
      status: 'verified',
      transactionId: 'EP84920194821',
      screenshotUrl: '',
      verifiedAt: '2026-11-10T19:35:00Z',
      verifiedBy: 'Admin (Auto)',
      verificationNotes: 'Easypaisa transaction confirmed in account statement.'
    },
    statusHistory: [
      { status: 'order_placed', timestamp: '2026-11-10T19:30:00Z', note: 'Order placed by customer via website' },
      { status: 'confirmed', timestamp: '2026-11-10T19:35:00Z', note: 'Payment verified and order accepted' },
      { status: 'preparing', timestamp: '2026-11-10T19:40:00Z', note: 'Sent to kitchen for live preparation' },
      { status: 'ready_for_pickup', timestamp: '2026-11-10T19:55:00Z', note: 'Packed with hot bag' },
      { status: 'out_for_delivery', timestamp: '2026-11-10T20:00:00Z', note: 'Rider dispatched to Walton Cantt' },
      { status: 'delivered', timestamp: '2026-11-10T20:25:00Z', note: 'Order handed over successfully' }
    ]
  },
  {
    id: 'ASP-103115',
    createdAt: '2026-11-11T09:15:00Z',
    orderType: 'delivery',
    customer: {
      name: 'Hamza Tariq',
      phone: '0321-4829103',
      email: 'hamza.tariq@gmail.com',
      address: 'House 42, St 5, Cavalry Ground',
      area: 'Cavalry Ground & Madina Colony',
      city: 'Lahore',
      instructions: 'Ring bell twice'
    },
    items: [
      {
        id: 'cart-103',
        productId: 'prod-tikka-pizza',
        name: 'Tikka Pizza',
        category: 'Pizza',
        price: 1500,
        quantity: 1,
        image: '/assets/images/artisan_tikka_pizza_1794391294077.jpg',
        options: {
          size: { name: 'Large (13")', price: 1500 },
          selectedAddons: [
            { id: 'addon-white-sauce-l', name: 'Extra White Sauce Topping (Large)', price: 150 }
          ]
        }
      },
      {
        id: 'cart-104',
        productId: 'prod-grill-burger',
        name: 'Grill Burger (with Fries)',
        category: 'Burger',
        price: 550,
        quantity: 2,
        image: '/assets/images/artisan_tikka_pizza_1794391294077.jpg'
      }
    ],
    subtotal: 2750,
    discount: 200,
    couponCode: 'FAMILYDEAL',
    deliveryFee: 100,
    tax: 0,
    total: 2650,
    status: 'preparing',
    payment: {
      method: 'jazzcash',
      status: 'pending_verification',
      transactionId: 'JC99812480112',
      screenshotUrl: '',
      verificationNotes: 'Customer submitted JazzCash TID.'
    },
    statusHistory: [
      { status: 'order_placed', timestamp: '2026-11-11T09:15:00Z', note: 'Order placed by customer via website' },
      { status: 'confirmed', timestamp: '2026-11-11T09:18:00Z', note: 'Kitchen team accepted order' },
      { status: 'preparing', timestamp: '2026-11-11T09:22:00Z', note: 'Pizza in stone-oven' }
    ]
  }
];

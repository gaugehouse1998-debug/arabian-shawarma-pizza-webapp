const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'src/data/initialData.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// The 88 product images
const productImages = {
  // 22 Pizzas
  "prod-tikka-pizza": "/src/assets/images/artisan_tikka_pizza_1794391294077.jpg",
  "prod-fajita-pizza": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
  "prod-supreme-pizza": "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80",
  "prod-hot-spicy-pizza": "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=800&q=80",
  "prod-fry-chicken-pizza": "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80",
  "prod-achari-pizza": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
  "prod-tandoori-pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
  "prod-cheese-lower-pizza": "https://images.unsplash.com/photo-1548369937-47519962c11a?auto=format&fit=crop&w=800&q=80",
  "prod-veggie-lover-pizza": "https://images.unsplash.com/photo-1576458088443-04a19bb13da6?auto=format&fit=crop&w=800&q=80",
  "prod-cheese-chicken-pizza": "https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?auto=format&fit=crop&w=800&q=80",
  "prod-peri-peri-spicy-pizza": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80",
  "prod-bone-fire-pizza": "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=800&q=80",
  "prod-extreme-pizza": "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&q=80",
  "prod-creamy-stuff-pizza": "https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?auto=format&fit=crop&w=800&q=80",
  "prod-cheese-crust-pizza": "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80",
  "prod-bihari-kabab-pizza": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80",
  "prod-crown-crust-pizza": "https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=800&q=80",
  "prod-stif-crust-pizza": "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=800&q=80",
  "prod-lazania-pizza": "https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=800&q=80",
  "prod-malai-boti-crown-pizza": "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&w=800&q=80",
  "prod-double-seekh-kabab-pizza": "https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=800&q=80",
  "prod-double-daker-pizza": "https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?auto=format&fit=crop&w=800&q=80",

  // 15 Burgers
  "prod-grill-burger": "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80",
  "prod-special-pizza-zinger-burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
  "prod-peri-peri-spicy-burger": "https://images.unsplash.com/photo-1596662951482-0c4ba74a6df6?auto=format&fit=crop&w=800&q=80",
  "prod-petti-burger": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80",
  "prod-zinger-burger": "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=80",
  "prod-zinger-burger-fries": "/src/assets/images/hero_3d_burger_1794391292664.jpg",
  "prod-jalapeno-burger": "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=800&q=80",
  "prod-mighty-zinger-burger": "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80",
  "prod-tower-burger": "https://images.unsplash.com/photo-1607013251379-e6eecfffe234?auto=format&fit=crop&w=800&q=80",
  "prod-chicken-boti-burger": "https://images.unsplash.com/photo-1576843776838-032ac46fbb93?auto=format&fit=crop&w=800&q=80",
  "prod-chicken-lapeta-burger": "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=800&q=80",
  "prod-chicken-shami-lapeta-burger": "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80",
  "prod-shami-lapeta-burger": "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=800&q=80",
  "prod-chicken-shami-burger": "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=80",
  "prod-shami-burger": "https://images.unsplash.com/photo-1547584370-2cc98b8b8dc8?auto=format&fit=crop&w=800&q=80",

  // 8 Sandwiches
  "prod-tikka-sandwich": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
  "prod-pizza-stacker-sandwich": "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80",
  "prod-panini-sandwich": "https://images.unsplash.com/photo-1539252554453-80ab65ce3586?auto=format&fit=crop&w=800&q=80",
  "prod-grill-sandwich": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
  "prod-zinger-sandwich": "https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=800&q=80",
  "prod-chicken-club-sandwich": "/src/assets/images/club_sandwich_fries_1794391328479.jpg",
  "prod-chicken-cheese-sandwich": "https://images.unsplash.com/photo-1619860860774-1e2e17343432?auto=format&fit=crop&w=800&q=80",
  "prod-chicken-cheese-stick": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",

  // 8 Paratha Rolls
  "prod-pizza-paratha": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
  "prod-chicken-bbq-paratha": "/src/assets/images/paratha_roll_bbq_1794391328091.jpg",
  "prod-bbq-paratha": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
  "prod-zinger-paratha": "https://images.unsplash.com/photo-1644787979606-25f0f37beea7?auto=format&fit=crop&w=800&q=80",
  "prod-zinger-cheese-paratha": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
  "prod-chicken-paratha": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",
  "prod-chicken-cheese-paratha": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80",
  "prod-chicken-grill-paratha": "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80",

  // 9 Shawarmas
  "prod-chicken-shawarma": "/src/assets/images/arabian_chicken_shawarma_1794391294232.jpg",
  "prod-chicken-cheese-shawarma": "https://images.unsplash.com/photo-1633321702518-7feccafb94d5?auto=format&fit=crop&w=800&q=80",
  "prod-chicken-olive-shawarma": "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=80",
  "prod-chicken-jalapeno-shawarma": "https://images.unsplash.com/photo-1648680786518-a6642f6c9135?auto=format&fit=crop&w=800&q=80",
  "prod-platter-shawarma": "https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=800&q=80",
  "prod-zinger-shawarma": "https://images.unsplash.com/photo-1528736235302-52922df5c122?auto=format&fit=crop&w=800&q=80",
  "prod-zinger-cheese-shawarma": "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80",
  "prod-arabian-special-shawarma": "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80",
  "prod-grill-chicken-shawarma": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",

  // 6 Wraps
  "prod-peri-peri-spicy-wrap": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
  "prod-grill-wrap": "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80",
  "prod-bbq-wrap": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  "prod-nuggets-wrap": "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80",
  "prod-zinger-wrap": "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80",
  "prod-chicken-wrap": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",

  // 8 Appetizers / Fries
  "prod-loaded-fries": "/src/assets/images/loaded_cheese_fries_1794391295410.jpg",
  "prod-pizza-fries": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80",
  "prod-cheese-mayo-fries": "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80",
  "prod-masala-fries": "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=800&q=80",
  "prod-plan-fries": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80",
  "prod-hot-shot": "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80",
  "prod-nuggets": "https://images.unsplash.com/photo-1585325701165-351af916e581?auto=format&fit=crop&w=800&q=80",
  "prod-hot-wings": "https://images.unsplash.com/photo-1527477378377-50a89ceb8e21?auto=format&fit=crop&w=800&q=80",

  // 7 Drinks
  "prod-drink-345ml": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80",
  "prod-drink-500ml": "/src/assets/images/chilled_cold_drinks_1794391330454.jpg",
  "prod-drink-1ltr": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80",
  "prod-drink-1-5ltr": "https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=800&q=80",
  "prod-drink-2-25ltr": "https://images.unsplash.com/photo-1527960471264-932f39eb5846?auto=format&fit=crop&w=800&q=80",
  "prod-water-small": "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80",
  "prod-water-large": "https://images.unsplash.com/photo-1559839914-17aae19cec71?auto=format&fit=crop&w=800&q=80",

  // 5 Dip Sauces
  "prod-mayo-garlic-sauce": "/src/assets/images/gourmet_dip_sauces_1794391329846.jpg",
  "prod-special-sauce": "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=800&q=80",
  "prod-peri-peri-sauce": "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=800&q=80",
  "prod-chipotle-sauce": "https://images.unsplash.com/photo-1563599175-e3b7b4ae530f?auto=format&fit=crop&w=800&q=80",
  "prod-jalapeno-sauce": "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=800&q=80"
};

// 29 distinct deal images
const dealImages = {
  "deal-01": "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80", // 2 Zinger Burgers + drink
  "deal-02": "/src/assets/images/arabian_chicken_shawarma_1794391294232.jpg", // 2 Zinger Shawarmas + drink
  "deal-03": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80", // 2 Grill Burgers + drink
  "deal-04": "/src/assets/images/club_sandwich_fries_1794391328479.jpg", // 2 Club Sandwich + drink
  "deal-05": "https://images.unsplash.com/photo-1596662951482-0c4ba74a6df6?auto=format&fit=crop&w=800&q=80", // 2 Special Pizza Zinger
  "deal-06": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80", // 2 Pizza Burgers
  "deal-07": "/src/assets/images/paratha_roll_bbq_1794391328091.jpg", // 2 Kabab Paratha Roll
  "deal-08": "https://images.unsplash.com/photo-1644787979606-25f0f37beea7?auto=format&fit=crop&w=800&q=80", // 2 Zinger Paratha Roll
  "deal-09": "https://images.unsplash.com/photo-1633321702518-7feccafb94d5?auto=format&fit=crop&w=800&q=80", // 2 Kabab Shawarma
  "deal-10": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80", // 2 Chicken Cheese Paratha
  "deal-11": "https://images.unsplash.com/photo-1527477378377-50a89ceb8e21?auto=format&fit=crop&w=800&q=80", // 10 Crispy Wings
  "deal-12": "https://images.unsplash.com/photo-1585325701165-351af916e581?auto=format&fit=crop&w=800&q=80", // 10 Chicken Nuggets
  "deal-13": "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80", // 12 Hot Shot Pieces
  "deal-14": "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=80", // 5 Zinger Burgers + 1.5L
  "deal-15": "https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=800&q=80", // 5 Zinger Shawarmas
  "deal-16": "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=800&q=80", // 5 Chicken Burgers
  "deal-17": "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80", // 5 Chicken Shawarmas Large
  "deal-18": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80", // 5 Jumbo Shawarmas
  "deal-19": "https://images.unsplash.com/photo-1547584370-2cc98b8b8dc8?auto=format&fit=crop&w=800&q=80", // 5 Shami Burgers
  "deal-20": "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80", // Burger Trio
  "deal-21": "/src/assets/images/family_combo_feast_1794391295864.jpg", // 2 Small Pizza + 2 Zinger + 2 Shawarma
  "deal-22": "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80", // 2 Med Pizza + 10 Nuggets + 10 Wings
  "deal-23": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80", // 4 Pizzas Mega Combo
  "deal-24": "https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=800&q=80", // 2 Large Special Pizza Crown Crust
  "deal-25": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80", // 3 Pizzas + Burgers + Wings
  "deal-26": "/src/assets/images/artisan_tikka_pizza_1794391294077.jpg", // 1 Large Pizza + 1.5L
  "deal-27": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80", // 2 Medium Pizzas + 1.5L
  "deal-28": "https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=800&q=80", // Mega Party Feast Rs 6000
  "deal-29": "https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?auto=format&fit=crop&w=800&q=80"  // Grand Royal Feast Rs 8500
};

// Now replace in content
let modified = 0;
for (const [id, imgUrl] of Object.entries(productImages)) {
  // Regex to find product with id and replace its image
  const regex = new RegExp(`(id:\\s*['"]${id}['"][\\s\\S]*?image:\\s*)['"][^'"]+['"]`);
  if (regex.test(content)) {
    content = content.replace(regex, `$1'${imgUrl}'`);
    modified++;
  } else {
    console.warn(`Product ID not matched: ${id}`);
  }
}
console.log(`Updated images for ${modified} products.`);

let dealsModified = 0;
for (const [id, imgUrl] of Object.entries(dealImages)) {
  const regex = new RegExp(`(id:\\s*['"]${id}['"][\\s\\S]*?image:\\s*)['"][^'"]+['"]`);
  if (regex.test(content)) {
    content = content.replace(regex, `$1'${imgUrl}'`);
    dealsModified++;
  } else {
    console.warn(`Deal ID not matched: ${id}`);
  }
}
console.log(`Updated images for ${dealsModified} deals.`);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully updated src/data/initialData.ts');

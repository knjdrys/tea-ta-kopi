/* Tea-Ta Kopi menu data
   Prices and sizes mirror the in-store menu. Keep this file as the single source
   for the customer-facing catalog; the ordering layer never trusts display text.
*/
(function () {
  "use strict";

  var categories = [
    {
      id: "iced-coffee",
      name: "Iced Coffee",
      note: "16 oz",
      description: "Coffee-forward favorites, poured cold and made to order."
    },
    {
      id: "milk-tea",
      name: "Milk Tea",
      note: "16 oz / 22 oz",
      description: "Creamy classics with a choice of medium or large."
    },
    {
      id: "shake",
      name: "Shake",
      note: "Choose your size",
      description: "Cold, thick and easy to share, or keep all to yourself."
    },
    {
      id: "fruit-soda",
      name: "Fruit Soda",
      note: "16 oz / 22 oz",
      description: "Bright, fizzy fruit refreshers for warm afternoons."
    },
    {
      id: "non-coffee",
      name: "Non Coffee",
      note: "16 oz / 22 oz",
      description: "Smooth, sweet sips without the coffee."
    },
    {
      id: "fruit-tea",
      name: "Fruit Tea",
      note: "Choose your size",
      description: "Light and fruity, with a little more room to explore."
    },
    {
      id: "yakult-series",
      name: "Yakult Series",
      note: "16 oz / 22 oz",
      description: "Fruit-forward refreshers with a familiar tang."
    },
    {
      id: "food",
      name: "Food",
      note: "Made to order",
      description: "Simple savory bites to pair with your drink."
    },
    {
      id: "add-ons",
      name: "Add Ons",
      note: "Easy extras",
      description: "Finish your drink or add a little more to the order."
    }
  ];

  function drink(name, category, sizes, extra) {
    var item = {
      id: (category + "-" + name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      name: name,
      category: category,
      sizes: sizes,
      available: true,
      customizable: category !== "Food" && category !== "Add Ons"
    };
    if (extra) {
      for (var key in extra) item[key] = extra[key];
    }
    return item;
  }

  var menu = [
    drink("Iced Americano", "Iced Coffee", [{ label: "Medium", price: 70 }]),
    drink("Caramel Macchiato", "Iced Coffee", [{ label: "Medium", price: 70 }]),
    drink("Spanish Latte", "Iced Coffee", [{ label: "Medium", price: 70 }]),
    drink("Mocha", "Iced Coffee", [{ label: "Medium", price: 70 }]),
    drink("Cappuccino", "Iced Coffee", [{ label: "Medium", price: 70 }]),
    drink("Dirty Matcha", "Iced Coffee", [{ label: "Medium", price: 70 }], { bestSeller: true }),

    drink("Wintermelon", "Milk Tea", [{ label: "Medium", price: 50 }, { label: "Large", price: 60 }], { bestSeller: true }),
    drink("Okinawa", "Milk Tea", [{ label: "Medium", price: 50 }, { label: "Large", price: 60 }]),
    drink("Dark Choco", "Milk Tea", [{ label: "Medium", price: 50 }, { label: "Large", price: 60 }]),
    drink("Taro", "Milk Tea", [{ label: "Medium", price: 50 }, { label: "Large", price: 60 }]),
    drink("Matcha", "Milk Tea", [{ label: "Medium", price: 50 }, { label: "Large", price: 60 }]),
    drink("Cookies N Cream", "Milk Tea", [{ label: "Medium", price: 50 }, { label: "Large", price: 60 }]),
    drink("Salted Caramel", "Milk Tea", [{ label: "Medium", price: 50 }, { label: "Large", price: 60 }]),
    drink("Tiger Sugar", "Milk Tea", [{ label: "Medium", price: 50 }, { label: "Large", price: 60 }]),

    drink("Choco Kisses", "Shake", [{ label: "Small", price: 35 }, { label: "Medium", price: 45 }, { label: "Large", price: 55 }]),
    drink("Strawberry", "Shake", [{ label: "Small", price: 35 }, { label: "Medium", price: 45 }, { label: "Large", price: 55 }]),
    drink("Taro", "Shake", [{ label: "Small", price: 35 }, { label: "Medium", price: 45 }, { label: "Large", price: 55 }]),
    drink("Avocado", "Shake", [{ label: "Small", price: 35 }, { label: "Medium", price: 45 }, { label: "Large", price: 55 }]),
    drink("Cookies N Cream", "Shake", [{ label: "Small", price: 35 }, { label: "Medium", price: 45 }, { label: "Large", price: 55 }]),
    drink("Black Forest", "Shake", [{ label: "Small", price: 35 }, { label: "Medium", price: 45 }, { label: "Large", price: 55 }]),

    drink("Green Apple Soda", "Fruit Soda", [{ label: "Medium", price: 39 }, { label: "Large", price: 49 }]),
    drink("Strawberry Soda", "Fruit Soda", [{ label: "Medium", price: 39 }, { label: "Large", price: 49 }]),
    drink("Lychee Soda", "Fruit Soda", [{ label: "Medium", price: 39 }, { label: "Large", price: 49 }]),
    drink("Lemon Soda", "Fruit Soda", [{ label: "Medium", price: 39 }, { label: "Large", price: 49 }]),
    drink("Passion Fruit Soda", "Fruit Soda", [{ label: "Medium", price: 39 }, { label: "Large", price: 49 }]),
    drink("Mango Soda", "Fruit Soda", [{ label: "Medium", price: 39 }, { label: "Large", price: 49 }]),
    drink("Grape Soda", "Fruit Soda", [{ label: "Medium", price: 39 }, { label: "Large", price: 49 }]),
    drink("Blueberry Soda", "Fruit Soda", [{ label: "Medium", price: 39 }, { label: "Large", price: 49 }]),

    drink("Matcha Latte", "Non Coffee", [{ label: "Medium", price: 80 }, { label: "Large", price: 100 }]),
    drink("Strawberry Matcha Latte", "Non Coffee", [{ label: "Medium", price: 80 }, { label: "Large", price: 100 }]),
    drink("Strawberry Milk", "Non Coffee", [{ label: "Medium", price: 80 }, { label: "Large", price: 100 }], { bestSeller: true }),

    drink("Green Apple", "Fruit Tea", [{ label: "Small", price: 40 }, { label: "Medium", price: 50 }, { label: "Large", price: 60 }]),
    drink("Strawberry", "Fruit Tea", [{ label: "Small", price: 40 }, { label: "Medium", price: 50 }, { label: "Large", price: 60 }]),
    drink("Lychee", "Fruit Tea", [{ label: "Small", price: 40 }, { label: "Medium", price: 50 }, { label: "Large", price: 60 }]),
    drink("Lemon", "Fruit Tea", [{ label: "Small", price: 40 }, { label: "Medium", price: 50 }, { label: "Large", price: 60 }]),
    drink("Passion Fruit", "Fruit Tea", [{ label: "Small", price: 40 }, { label: "Medium", price: 50 }, { label: "Large", price: 60 }]),
    drink("Mango", "Fruit Tea", [{ label: "Small", price: 40 }, { label: "Medium", price: 50 }, { label: "Large", price: 60 }]),
    drink("Grape", "Fruit Tea", [{ label: "Small", price: 40 }, { label: "Medium", price: 50 }, { label: "Large", price: 60 }]),
    drink("Blueberry", "Fruit Tea", [{ label: "Small", price: 40 }, { label: "Medium", price: 50 }, { label: "Large", price: 60 }]),

    drink("Green Apple Yakult", "Yakult Series", [{ label: "Medium", price: 49 }, { label: "Large", price: 59 }]),
    drink("Strawberry Yakult", "Yakult Series", [{ label: "Medium", price: 49 }, { label: "Large", price: 59 }]),
    drink("Lychee Yakult", "Yakult Series", [{ label: "Medium", price: 49 }, { label: "Large", price: 59 }]),
    drink("Lemon Yakult", "Yakult Series", [{ label: "Medium", price: 49 }, { label: "Large", price: 59 }]),
    drink("Passion Fruit Yakult", "Yakult Series", [{ label: "Medium", price: 49 }, { label: "Large", price: 59 }]),
    drink("Mango Yakult", "Yakult Series", [{ label: "Medium", price: 49 }, { label: "Large", price: 59 }], { bestSeller: true }),
    drink("Grape Yakult", "Yakult Series", [{ label: "Medium", price: 49 }, { label: "Large", price: 59 }]),
    drink("Blueberry Yakult", "Yakult Series", [{ label: "Medium", price: 49 }, { label: "Large", price: 59 }]),

    drink("Siomai", "Food", [{ label: "Single", price: 5 }]),
    drink("Big Siomai", "Food", [{ label: "Single", price: 10 }]),
    drink("Extra Pearl", "Add Ons", [{ label: "Single", price: 10 }]),
    drink("Nata de Coco", "Add Ons", [{ label: "Single", price: 10 }]),
    drink("Strawberry Puree", "Add Ons", [{ label: "Single", price: 15 }])
  ];

  var descriptions = {
    "Iced Americano": "Clean, cold coffee with a crisp finish.",
    "Caramel Macchiato": "Coffee and caramel with a smooth, sweet finish.",
    "Spanish Latte": "Creamy coffee with a gentle sweetness.",
    "Mocha": "Coffee and chocolate in an easygoing classic.",
    "Cappuccino": "A balanced coffee sip with a rich finish.",
    "Dirty Matcha": "Earthy matcha layered with a coffee kick.",
    "Wintermelon": "A mellow, caramel-like milk tea favorite.",
    "Okinawa": "Toasty brown sugar notes in a creamy tea.",
    "Dark Choco": "Deep chocolate flavor with a creamy base.",
    "Taro": "Soft, nutty sweetness with a smooth finish.",
    "Matcha": "A mellow green tea sip with a creamy body.",
    "Cookies N Cream": "Creamy milk tea with a cookie finish.",
    "Salted Caramel": "Sweet caramel with just a little salt.",
    "Tiger Sugar": "Brown sugar flavor with a rich milk tea base.",
    "Matcha Latte": "Creamy matcha with a fresh, earthy finish.",
    "Strawberry Matcha Latte": "Strawberry sweetness over a mellow matcha base.",
    "Strawberry Milk": "A soft strawberry sip with a creamy finish.",
    "Siomai": "A quick savory bite for the table.",
    "Big Siomai": "A heartier savory bite, made for sharing.",
    "Extra Pearl": "Add a chewy finish to your next drink.",
    "Nata de Coco": "A light, fruity chew for your cup.",
    "Strawberry Puree": "A bright strawberry boost for your drink."
  };

  menu.forEach(function (item) {
    if (!descriptions[item.name]) {
      if (item.category === "Shake") descriptions[item.name] = "A thick, cold shake made for a sweet break.";
      else if (item.category === "Fruit Soda") descriptions[item.name] = "A bright, fizzy fruit refresher.";
      else if (item.category === "Fruit Tea") descriptions[item.name] = "A light fruit tea for an easy afternoon sip.";
      else if (item.category === "Yakult Series") descriptions[item.name] = "A tangy, fruit-forward refresher.";
      else descriptions[item.name] = "Made fresh to order at Tea-Ta Kopi.";
    }
    item.description = descriptions[item.name];
  });

  window.TTKMenu = {
    categories: categories,
    items: menu
  };
})();

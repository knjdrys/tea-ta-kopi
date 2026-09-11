/* Tea-Ta Kopi menu data and product-aware modifier catalog.
   This is the single source for prices, sizes, availability, ingredients,
   and the choices that make sense for each individual product family.
*/
(function () {
  "use strict";

  var categories = [
    { id: "iced-coffee", name: "Iced Coffee", note: "16 oz", description: "Coffee-forward favorites, poured cold and made to order." },
    { id: "milk-tea", name: "Milk Tea", note: "16 oz / 22 oz", description: "Creamy classics with a choice of medium or large." },
    { id: "shake", name: "Shake", note: "Choose your size", description: "Cold, thick and easy to share, or keep all to yourself." },
    { id: "fruit-soda", name: "Fruit Soda", note: "16 oz / 22 oz", description: "Bright, fizzy fruit refreshers for warm afternoons." },
    { id: "non-coffee", name: "Non Coffee", note: "16 oz / 22 oz", description: "Smooth, sweet sips without the coffee." },
    { id: "fruit-tea", name: "Fruit Tea", note: "Choose your size", description: "Light and fruity, with a little more room to explore." },
    { id: "yakult-series", name: "Yakult Series", note: "16 oz / 22 oz", description: "Fruit-forward refreshers with a familiar tang." },
    { id: "food", name: "Food", note: "Made to order", description: "Simple savory bites to pair with your drink." },
    { id: "add-ons", name: "Add Ons", note: "Easy extras", description: "Finish your drink or add a little more to the order." }
  ];

  /* Only modifiers that are currently represented by the supplied menu are
     offered as paid choices. Unsupported inventory is intentionally absent. */
  var modifierDefinitions = {
    sweetness: {
      id: "sweetness",
      label: "Sweetness",
      type: "single",
      optional: true,
      defaultId: "regular",
      options: [
        { id: "regular", label: "Regular", price: 0, available: true },
        { id: "less", label: "Less", price: 0, available: true },
        { id: "extra", label: "Extra", price: 0, available: true }
      ]
    },
    ice: {
      id: "ice",
      label: "Ice",
      type: "single",
      optional: true,
      defaultId: "regular",
      options: [
        { id: "regular", label: "Regular", price: 0, available: true },
        { id: "less", label: "Less", price: 0, available: true },
        { id: "none", label: "No ice", price: 0, available: true }
      ]
    },
    milkTeaToppings: {
      id: "toppings",
      label: "Toppings",
      type: "multi",
      optional: true,
      options: [
        { id: "extra-pearl", label: "Extra Pearl", price: 10, available: true },
        { id: "nata-de-coco", label: "Nata de Coco", price: 10, available: true }
      ]
    },
    fruitToppings: {
      id: "toppings",
      label: "Toppings",
      type: "multi",
      optional: true,
      options: [
        { id: "nata-de-coco", label: "Nata de Coco", price: 10, available: true }
      ]
    },
    strawberryFinish: {
      id: "add-ons",
      label: "Add-ons",
      type: "multi",
      optional: true,
      options: [
        { id: "strawberry-puree", label: "Strawberry Puree", price: 15, available: true }
      ]
    },
    fruitToppingsAndStrawberry: {
      id: "toppings",
      label: "Toppings and add-ons",
      type: "multi",
      optional: true,
      options: [
        { id: "nata-de-coco", label: "Nata de Coco", price: 10, available: true },
        { id: "strawberry-puree", label: "Strawberry Puree", price: 15, available: true }
      ]
    }
  };

  var baseIngredients = {
    "Iced Coffee": ["coffee", "ice"],
    "Milk Tea": ["black tea", "milk", "flavor"],
    "Shake": ["milk", "blended ice", "flavor"],
    "Fruit Soda": ["fruit flavor", "soda", "ice"],
    "Non Coffee": ["milk", "flavor", "ice"],
    "Fruit Tea": ["fruit tea", "fruit flavor", "ice"],
    "Yakult Series": ["Yakult", "fruit flavor", "ice"]
  };

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

  function copy(value) { return JSON.parse(JSON.stringify(value)); }
  function cloneGroup(definition) {
    var group = copy(definition);
    group.options = group.options.filter(function (option) { return option.available !== false; });
    return group;
  }
  function idFor(name, category) {
    return (category + "-" + name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  /* Product audit: groups are selected by product family and then refined by
     the actual flavor. No UI code needs to know category-specific rules. */
  function customizationFor(name, category, sizes) {
    var result = {
      serviceNote: category === "Shake" ? "Blended cold" : "Served chilled",
      size: {
        required: sizes.length > 1,
        options: copy(sizes)
      },
      modifierGroups: []
    };
    function add(definition) { result.modifierGroups.push(cloneGroup(definition)); }
    var isStrawberry = /strawberry/i.test(name);

    if (category === "Iced Coffee") {
      add(modifierDefinitions.sweetness);
      add(modifierDefinitions.ice);
    } else if (category === "Milk Tea") {
      add(modifierDefinitions.sweetness);
      add(modifierDefinitions.ice);
      add(modifierDefinitions.milkTeaToppings);
    } else if (category === "Shake") {
      /* Shakes are blended recipes. Do not expose misleading ice, milk, or
         sweetness controls. The strawberry recipe has one relevant finish. */
      if (isStrawberry) add(modifierDefinitions.strawberryFinish);
    } else if (category === "Fruit Soda") {
      add(modifierDefinitions.ice);
      add(isStrawberry ? modifierDefinitions.fruitToppingsAndStrawberry : modifierDefinitions.fruitToppings);
    } else if (category === "Non Coffee") {
      add(modifierDefinitions.sweetness);
      add(modifierDefinitions.ice);
      if (isStrawberry) add(modifierDefinitions.strawberryFinish);
    } else if (category === "Fruit Tea") {
      add(modifierDefinitions.sweetness);
      add(modifierDefinitions.ice);
      add(isStrawberry ? modifierDefinitions.fruitToppingsAndStrawberry : modifierDefinitions.fruitToppings);
    } else if (category === "Yakult Series") {
      add(modifierDefinitions.sweetness);
      add(modifierDefinitions.ice);
      add(isStrawberry ? modifierDefinitions.fruitToppingsAndStrawberry : modifierDefinitions.fruitToppings);
    }

    return result;
  }

  function ingredientsFor(name, category) {
    if (category === "Food") return ["steamed siomai"];
    if (category === "Add Ons") return ["optional topping"];
    var ingredients = (baseIngredients[category] || ["made fresh"] ).slice();
    if (/strawberry/i.test(name) && ingredients.indexOf("strawberry") === -1) ingredients.push("strawberry");
    if (/matcha/i.test(name) && ingredients.indexOf("matcha") === -1) ingredients.push("matcha");
    if (/coffee|macchiato|latte|mocha|cappuccino|americano/i.test(name) && category === "Iced Coffee" && ingredients.indexOf("coffee") === -1) ingredients.push("coffee");
    return ingredients;
  }

  function drink(name, category, sizes, extra) {
    var item = {
      id: idFor(name, category),
      name: name,
      category: category,
      sizes: sizes,
      available: true,
      description: descriptions[name] || "",
      ingredients: ingredientsFor(name, category),
      customization: customizationFor(name, category, sizes)
    };
    item.customizable = category !== "Food" && category !== "Add Ons";
    item.audit = {
      product: name,
      category: category,
      baseIngredients: item.ingredients.slice(),
      supportedModifiers: item.customization.modifierGroups.map(function (group) { return group.id; }),
      unsupportedModifiers: ["temperature", "milk", "syrup"],
      sizeOptions: sizes.map(function (size) { return size.label; }),
      serviceNote: item.customization.serviceNote
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

  menu.forEach(function (item) {
    if (item.description) return;
    if (item.category === "Shake") item.description = "A thick, cold shake made for a sweet break.";
    else if (item.category === "Fruit Soda") item.description = "A bright, fizzy fruit refresher.";
    else if (item.category === "Fruit Tea") item.description = "A light fruit tea for an easy afternoon sip.";
    else if (item.category === "Yakult Series") item.description = "A tangy, fruit-forward refresher.";
    else item.description = "Made fresh to order at Tea-Ta Kopi.";
  });

  /* Keep the audit easy to inspect in the console and available to a future
     staff dashboard without coupling that dashboard to menu rendering. */
  window.TTKMenu = {
    categories: categories,
    items: menu,
    modifierDefinitions: modifierDefinitions,
    audit: menu.map(function (item) { return item.audit; })
  };
})();

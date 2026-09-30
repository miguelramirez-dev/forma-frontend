window.FormaStore = (() => {
  "use strict";
  const KEY = "forma.state.v1";
  let warning = "";
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    warning = "No se pudo recuperar la sesión anterior. Se cargó el catálogo inicial.";
  }
  let state = FormaCore.normalize(saved, FORMA_CATALOG);
  const listeners = new Set();
  function commit(next) {
    state = next;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      warning = "El navegador no permite guardar. Los cambios durarán esta sesión.";
    }
    listeners.forEach((fn) => fn(state));
  }
  function change(fn) {
    const next = structuredClone(state);
    fn(next);
    commit(next);
  }
  function setQuantity(id, quantity) {
    change((s) => {
      const p = s.products.find((p) => p.id === id);
      if (!p || !Number.isInteger(quantity) || quantity < 0 || quantity > p.stock)
        throw Error("No hay suficientes unidades disponibles.");
      if (quantity === 0) delete s.cart[id];
      else s.cart[id] = quantity;
    });
  }
  function favorite(id) {
    change((s) => {
      if (!s.products.some((p) => p.id === id)) throw Error("Producto no disponible.");
      s.favorites = s.favorites.includes(id)
        ? s.favorites.filter((x) => x !== id)
        : [...s.favorites, id];
    });
  }
  function saveProduct(product) {
    if (!FormaCore.validProduct(product)) throw Error("Revisa los datos del producto.");
    change((s) => {
      const index = s.products.findIndex((p) => p.id === product.id);
      if (index >= 0) s.products[index] = product;
      else s.products.push(product);
      if (s.cart[product.id] > product.stock) {
        if (product.stock) s.cart[product.id] = product.stock;
        else delete s.cart[product.id];
      }
    });
  }
  function removeProduct(id) {
    change((s) => {
      if (s.products.length <= 1) throw Error("Conserva al menos un producto en el catálogo.");
      s.products = s.products.filter((p) => p.id !== id);
      delete s.cart[id];
      s.favorites = s.favorites.filter((x) => x !== id);
    });
  }
  function checkout(coupon, delivery) {
    let order;
    change((s) => {
      const sum = FormaCore.totals(s.cart, s.products, coupon);
      if (!sum.items.length) throw Error("Tu bolsa está vacía.");
      order = {
        id: "F-" + Date.now().toString(36).toUpperCase(),
        date: new Date().toISOString(),
        items: sum.items.map((p) => ({ name: p.name, price: p.price, quantity: p.quantity })),
        subtotal: sum.subtotal,
        discount: sum.discount,
        shipping: sum.shipping,
        total: sum.total,
        delivery,
      };
      for (const item of sum.items) s.products.find((p) => p.id === item.id).stock -= item.quantity;
      s.orders.unshift(order);
      s.orders = s.orders.slice(0, 100);
      s.cart = {};
    });
    return order;
  }
  function updateStock(rows) {
    change((s) => {
      for (const row of rows) {
        const p = s.products.find((p) => p.sourceId === row.id);
        if (p) {
          p.stock = row.stock;
          if (s.cart[p.id] > p.stock) {
            if (p.stock) s.cart[p.id] = p.stock;
            else delete s.cart[p.id];
          }
        }
      }
    });
  }
  return {
    get: () => structuredClone(state),
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    setQuantity,
    favorite,
    saveProduct,
    removeProduct,
    checkout,
    updateStock,
    takeWarning: () => {
      const w = warning;
      warning = "";
      return w;
    },
  };
})();

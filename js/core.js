(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.FormaCore = api;
})(globalThis, function () {
  "use strict";
  const CATEGORIES = ["Sala", "Estudio", "Dormitorio", "Iluminación", "Objetos", "Baño"];
  const integer = (value) => Number.isSafeInteger(value) && value >= 0;
  function validProduct(p) {
    return (
      p &&
      typeof p.id === "string" &&
      p.id.length < 100 &&
      typeof p.name === "string" &&
      p.name.trim().length > 0 &&
      p.name.length <= 90 &&
      typeof p.description === "string" &&
      p.description.length <= 1000 &&
      CATEGORIES.includes(p.category) &&
      integer(p.price) &&
      p.price > 0 &&
      p.price <= 100000000 &&
      integer(p.stock) &&
      p.stock <= 9999 &&
      Array.isArray(p.images) &&
      p.images.length > 0 &&
      p.images.every((s) => typeof s === "string" && /^assets\/products\/\d+\/\d+\.webp$/.test(s))
    );
  }
  function normalize(raw, seed) {
    const products =
      Array.isArray(raw?.products) &&
      raw.products.length &&
      raw.products.every(validProduct) &&
      new Set(raw.products.map((p) => p.id)).size === raw.products.length
        ? raw.products
        : structuredClone(seed);
    const ids = new Set(products.map((p) => p.id));
    const cart = {};
    for (const [id, qty] of Object.entries(raw?.cart || {})) {
      const p = products.find((p) => p.id === id);
      if (p && integer(qty) && qty > 0 && p.stock > 0) cart[id] = Math.min(qty, p.stock);
    }
    const favorites = Array.isArray(raw?.favorites)
      ? [...new Set(raw.favorites.filter((id) => ids.has(id)))]
      : [];
    const orders = Array.isArray(raw?.orders)
      ? raw.orders
          .filter(
            (o) =>
              o &&
              typeof o.id === "string" &&
              typeof o.date === "string" &&
              Number.isFinite(Date.parse(o.date)) &&
              integer(o.total) &&
              integer(o.subtotal) &&
              integer(o.shipping) &&
              integer(o.discount) &&
              Array.isArray(o.items) &&
              o.items.every(
                (i) =>
                  i &&
                  typeof i.name === "string" &&
                  integer(i.price) &&
                  integer(i.quantity) &&
                  i.quantity > 0,
              ),
          )
          .slice(0, 100)
      : [];
    return { version: 1, products, cart, favorites, orders };
  }
  function totals(cart, products, coupon = "") {
    const items = Object.entries(cart).map(([id, quantity]) => {
      const p = products.find((p) => p.id === id);
      if (!p || !integer(quantity) || quantity < 1 || quantity > p.stock)
        throw Error("La disponibilidad cambió. Revisa tu bolsa.");
      return { ...p, quantity };
    });
    const subtotal = items.reduce((n, p) => n + p.price * p.quantity, 0);
    const discount = coupon === "FORMA10" ? Math.round(subtotal * 0.1) : 0;
    const shipping = subtotal === 0 || subtotal >= 500000 ? 0 : 19900;
    return {
      items,
      subtotal,
      discount,
      shipping,
      total: subtotal - discount + shipping,
      count: items.reduce((n, p) => n + p.quantity, 0),
    };
  }
  function filterProducts(
    products,
    { q = "", category = "", max = 1000000, stock = false, sort = "featured" } = {},
  ) {
    const normalizeText = (s) =>
      s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    const query = normalizeText(q);
    const rows = products.filter(
      (p) =>
        (!category || p.category === category) &&
        p.price <= max * 100 &&
        (!stock || p.stock > 0) &&
        normalizeText(p.name + " " + p.description).includes(query),
    );
    return rows.sort(
      sort === "low"
        ? (a, b) => a.price - b.price
        : sort === "high"
          ? (a, b) => b.price - a.price
          : sort === "name"
            ? (a, b) => a.name.localeCompare(b.name, "es")
            : (a, b) => Number(b.featured) - Number(a.featured),
    );
  }
  return { CATEGORIES, validProduct, normalize, totals, filterProducts };
});

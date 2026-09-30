window.FormaViews = (() => {
  const e = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );
  const money = (cents) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 2,
    }).format(cents / 100);
  const icon = (n) => `<i data-lucide="${n}" aria-hidden="true"></i>`;
  const close = (id) =>
    `<button class="icon-button" data-close="${id}" aria-label="Cerrar" title="Cerrar">${icon("x")}</button>`;
  const empty = (
    heading,
    body,
    action = '<a class="button dark" href="#catalogo">Explorar colección</a>',
  ) =>
    `<div class="empty-state">${icon("package-open")}<h2>${heading}</h2><p>${body}</p>${action}</div>`;
  function card(p, state, compare) {
    return `<article class="product-card"><div class="product-image tone-${Number(p.sourceId || 0) % 4}"><a href="#producto/${e(p.id)}" aria-label="Ver ${e(p.name)}"><img src="${e(p.images[0])}" alt="${e(p.name)}" loading="lazy" width="500" height="500"></a><span class="product-tag">${p.stock === 0 ? "Agotado" : p.featured ? "Selección FORMA" : p.category}</span><button class="favorite ${state.favorites.includes(p.id) ? "selected" : ""}" data-favorite="${e(p.id)}" aria-label="${state.favorites.includes(p.id) ? "Quitar de" : "Añadir a"} favoritos: ${e(p.name)}" aria-pressed="${state.favorites.includes(p.id)}" title="Favoritos">${icon("heart")}</button><button class="quick-add" data-add="${e(p.id)}" ${!p.stock ? "disabled" : ""}>${icon("plus")}${p.stock ? "Añadir a la bolsa" : "Sin existencias"}</button></div><div class="product-info"><div><p>${e(p.category)}</p><h2><a href="#producto/${e(p.id)}">${e(p.name)}</a></h2></div><span>${money(p.price)}</span></div><label class="compare-check"><input type="checkbox" data-compare="${e(p.id)}" ${compare.includes(p.id) ? "checked" : ""}> Comparar</label></article>`;
  }
  function catalog(state, filters, compare, favorites = false) {
    const pool = favorites
      ? state.products.filter((p) => state.favorites.includes(p.id))
      : state.products;
    const rows = FormaCore.filterProducts(pool, filters);
    return `<section class="collection-heading"><div><p class="eyebrow">${favorites ? "TU SELECCIÓN" : "COLECCIÓN 01 / VIDA EN CASA"}</p><h1>${favorites ? "Lo que te inspira." : "Muebles y objetos."}</h1><p>${favorites ? "Tus piezas favoritas, en un mismo lugar." : "Formas honestas. Espacios con personalidad."}</p></div><div class="collection-stamp"><span>F.</span><small>MENOS RUIDO.<br>MÁS DISEÑO.</small></div></section><section class="catalog-shell"><aside class="filters" aria-label="Filtros de productos"><div class="filter-heading"><h2>Encuentra tu pieza</h2><button class="text-button" data-reset>Restablecer</button></div><label class="search-field">${icon("search")}<input id="search" type="search" placeholder="Buscar en la colección" aria-label="Buscar productos" value="${e(filters.q)}"></label><fieldset><legend>Espacios</legend>${["", ...FormaCore.CATEGORIES].map((cat) => `<label class="category-option"><input type="radio" name="category" value="${cat}" ${cat === filters.category ? "checked" : ""}><span>${cat || "Todos los objetos"}</span><small>${pool.filter((p) => !cat || p.category === cat).length}</small></label>`).join("")}</fieldset><div class="price-filter"><label for="max-price">Precio máximo <output id="price-output">${money(filters.max * 100)}</output></label><input type="range" id="max-price" min="0" max="50000" step="500" value="${filters.max}"><div><span>$0</span><span>$50,000</span></div></div><label class="stock-filter"><input type="checkbox" id="stock-only" ${filters.stock ? "checked" : ""}> Solo disponibles</label><div class="filter-note"><span class="mini-mark">F.</span><p>Objetos que acompañan<br>tu forma de vivir.</p><span>DISEÑO / COTIDIANO</span></div></aside><div class="catalog-results"><div class="results-toolbar"><p id="result-count" aria-live="polite"><strong>${rows.length}</strong> objetos${filters.q ? " encontrados" : ""}</p><label>Ordenar por <select id="sort" aria-label="Ordenar productos">${[
      ["featured", "Destacados"],
      ["low", "Menor precio"],
      ["high", "Mayor precio"],
      ["name", "Nombre A–Z"],
    ]
      .map(([v, n]) => `<option value="${v}" ${filters.sort === v ? "selected" : ""}>${n}</option>`)
      .join(
        "",
      )}</select></label></div><div id="product-grid" class="product-grid">${rows.map((p) => card(p, state, compare)).join("")}</div><div id="catalog-empty" ${rows.length ? "hidden" : ""}>${empty("Un espacio por descubrir.", "No encontramos piezas con esta selección.", '<button class="button dark" data-reset>Limpiar filtros</button>')}</div></div></section>`;
  }
  function product(p, state, selected = 0) {
    if (!p)
      return empty(
        "Esta pieza ya no está disponible.",
        "Vuelve a la colección para encontrar otras opciones.",
      );
    return `<nav class="breadcrumb-line" aria-label="Ruta"><a href="#catalogo">Colección</a><span>/</span><span>${e(p.category)}</span></nav><section class="product-detail"><div class="gallery"><div class="main-photo tone-${Number(p.sourceId || 0) % 4}"><img id="detail-image" src="${e(p.images[selected] || p.images[0])}" alt="${e(p.name)}" width="700" height="700"></div><div class="thumbnails">${p.images.map((src, i) => `<button data-image="${i}" class="${i === selected ? "active" : ""}" aria-label="Vista ${i + 1} de ${e(p.name)}" aria-pressed="${i === selected}"><img src="${e(src)}" alt="" width="80" height="80"></button>`).join("")}</div></div><div class="detail-info"><p class="eyebrow">FORMA / ${e(p.category).toUpperCase()}</p><h1>${e(p.name)}</h1><p class="detail-price">${money(p.price)} <span>MXN</span></p><p class="detail-description">${e(p.description)}</p><div class="availability">${icon(p.stock ? "check" : "clock")} ${p.stock ? `${p.stock} unidades disponibles` : "Agotado temporalmente"}</div><div class="detail-actions"><button class="button dark" data-add="${e(p.id)}" ${!p.stock ? "disabled" : ""}>${icon("shopping-bag")}Añadir a mi bolsa</button><button class="icon-button favorite-detail ${state.favorites.includes(p.id) ? "selected" : ""}" data-favorite="${e(p.id)}" aria-label="Guardar favorito" aria-pressed="${state.favorites.includes(p.id)}">${icon("heart")}</button></div><div class="product-benefits"><span>${icon("truck")}Envío gratis desde $5,000</span><span>${icon("package")}Compra de demostración, sin cobro</span></div><details open><summary>Sobre esta pieza</summary><p>${e(p.description)}</p><p>Referencia: FOR-${e(p.id)} · ${e(p.category)}</p></details><details><summary>Envíos y devoluciones</summary><p>Este proyecto simula un comercio. No procesa pagos ni envíos reales. El envío de demostración cuesta $199 MXN en pedidos menores a $5,000 MXN.</p></details></div></section>`;
  }
  function cart(state, coupon) {
    const t = FormaCore.totals(state.cart, state.products, coupon);
    return `<div class="dialog-title"><div><p class="eyebrow">TU SELECCIÓN</p><h2 id="cart-title">Mi bolsa <span>(${t.count})</span></h2></div>${close("cart")}</div>${t.items.length ? `<div class="cart-items">${t.items.map((p) => `<article class="cart-item"><img src="${e(p.images[0])}" alt="${e(p.name)}" width="88" height="104"><div><span>${e(p.category)}</span><h3>${e(p.name)}</h3><p>${money(p.price)}</p><div class="quantity"><button data-quantity="${e(p.id)}" data-value="${p.quantity - 1}" aria-label="Reducir cantidad de ${e(p.name)}">${icon("minus")}</button><output aria-label="Cantidad">${p.quantity}</output><button data-quantity="${e(p.id)}" data-value="${p.quantity + 1}" ${p.quantity >= p.stock ? "disabled" : ""} aria-label="Aumentar cantidad de ${e(p.name)}">${icon("plus")}</button></div></div><button class="icon-button" data-quantity="${e(p.id)}" data-value="0" aria-label="Quitar ${e(p.name)}">${icon("x")}</button></article>`).join("")}</div><div class="cart-bottom"><form id="coupon-form"><label for="coupon">Código promocional</label><div class="coupon-row"><input id="coupon" name="coupon" value="${e(coupon)}" placeholder="FORMA10" maxlength="20"><button class="button outline">Aplicar</button></div><p>${coupon ? "FORMA10 aplicado: 10% de descuento." : "Prueba FORMA10 en tu pedido de demostración."}</p></form>${summary(t)}<button class="button dark full" data-checkout>Continuar al pedido ${icon("shopping-bag")}</button><p class="fineprint">Demostración. No se solicitarán datos bancarios.</p></div>` : empty("Tu bolsa está esperando.", "Elige algo que le dé carácter a tu espacio.", '<button class="button dark" data-close="cart">Seguir explorando</button>')}`;
  }
  function summary(t) {
    return `<dl class="totals"><div><dt>Subtotal</dt><dd>${money(t.subtotal)}</dd></div>${t.discount ? `<div class="discount"><dt>Descuento FORMA10</dt><dd>−${money(t.discount)}</dd></div>` : ""}<div><dt>Envío de demostración</dt><dd>${t.shipping ? money(t.shipping) : "Gratis"}</dd></div><div class="grand-total"><dt>Total</dt><dd>${money(t.total)} <small>MXN</small></dd></div></dl>`;
  }
  function checkout(state, coupon) {
    const t = FormaCore.totals(state.cart, state.products, coupon);
    if (!t.items.length)
      return empty("Tu bolsa está vacía.", "Añade una pieza antes de continuar.");
    return `<div class="page-top"><p class="eyebrow">ÚLTIMO PASO / PEDIDO SIMULADO</p><h1>Ya casi es tuyo.</h1><p>No habrá cobros ni envíos reales. Usa datos ficticios.</p></div><div class="checkout-layout"><form id="checkout-form" class="checkout-form"><h2>Datos de entrega</h2><div class="form-grid"><label>Nombre<input name="name" required maxlength="80" autocomplete="off" placeholder="Nombre de ejemplo"></label><label>Correo electrónico<input name="email" type="email" required maxlength="100" autocomplete="off" placeholder="ejemplo@correo.com"></label><label class="span-two">Dirección<input name="address" required minlength="5" maxlength="160" autocomplete="off" placeholder="Calle y número de ejemplo"></label><label>Ciudad<input name="city" required maxlength="80" autocomplete="off" placeholder="Parral"></label><label>Código postal<input name="postal" required pattern="[0-9]{5}" maxlength="5" inputmode="numeric" placeholder="33800"></label></div><label class="check-consent"><input name="consent" type="checkbox" required> Entiendo que este pedido es una simulación.</label><p class="fineprint">Los datos del formulario no se guardan ni se envían a ningún servidor.</p><button class="button dark" type="submit">Confirmar pedido de demostración</button></form><aside class="checkout-summary"><h2>Resumen de tu pedido</h2>${t.items.map((p) => `<div class="summary-item"><img src="${e(p.images[0])}" alt="" width="64" height="64"><div>${e(p.name)}<small>${p.quantity} × ${money(p.price)}</small></div><strong>${money(p.price * p.quantity)}</strong></div>`).join("")}${summary(t)}</aside></div>`;
  }
  function orders(state) {
    return `<div class="page-top"><p class="eyebrow">TU HISTORIAL</p><h1>Mis pedidos.</h1><p>Pedidos de demostración guardados en este navegador.</p></div>${state.orders.length ? `<div class="order-list">${state.orders.map((o) => `<article class="order"><header><div><span class="eyebrow">${e(o.id)}</span><h2>${new Date(o.date).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}</h2></div><span class="status-label">Simulado</span><strong>${money(o.total)}</strong></header>${o.items.map((i) => `<div class="order-line"><span>${e(i.name)} <small>× ${i.quantity}</small></span><span>${money(i.price * i.quantity)}</span></div>`).join("")}<div class="order-meta">Envío: ${money(o.shipping)} · Descuento: ${money(o.discount)}</div></article>`).join("")}</div>` : empty("Tu historia empieza aquí.", "Todavía no has realizado un pedido.")}`;
  }
  function admin(state, api) {
    const low = state.products.filter((p) => p.stock < 5).length;
    return `<div class="page-top admin-top"><div><p class="eyebrow">FORMA / ESTUDIO</p><h1>Todo en su lugar.</h1><p>Inventario y pedidos de demostración.</p></div><button class="button dark" data-new>${icon("plus")}Nuevo producto</button></div><section class="stats"><div><span>Productos</span><strong>${state.products.length}</strong></div><div><span>Unidades disponibles</span><strong>${state.products.reduce((n, p) => n + p.stock, 0)}</strong></div><div><span>Stock bajo</span><strong>${low}</strong></div><div><span>Ventas simuladas</span><strong>${money(state.orders.reduce((n, o) => n + o.total, 0))}</strong></div></section><div class="inventory-heading"><h2>Catálogo e inventario</h2><button class="button outline" id="sync-stock" ${api.loading ? "disabled" : ""}>${icon("refresh-cw")}${api.loading ? "Consultando…" : "Consultar stock REST"}</button></div><div id="api-feedback" aria-live="polite">${api.error ? `<p class="error-message" role="alert">${e(api.error)}</p>` : ""}${api.rows ? `<div class="api-preview"><p>El proveedor devolvió ${api.rows.length} productos. Aplicar reemplaza las existencias vinculadas y ajusta la bolsa si es necesario.</p><button class="button dark" data-apply-stock>Aplicar disponibilidad</button><button class="text-button" data-discard-stock>Descartar</button></div>` : ""}${api.message ? `<p class="success-message">${e(api.message)}</p>` : ""}</div><div class="table-wrap"><table><caption class="visually-hidden">Inventario editable de productos</caption><thead><tr><th scope="col">Producto</th><th scope="col">Categoría</th><th scope="col">Precio</th><th scope="col">Stock</th><th scope="col">Acciones</th></tr></thead><tbody>${state.products.map((p) => `<tr><td><div class="inventory-product"><img src="${e(p.images[0])}" alt="" width="52" height="52"><span>${e(p.name)}</span></div></td><td>${e(p.category)}</td><td>${money(p.price)}</td><td><span class="${p.stock < 5 ? "low-stock" : ""}">${p.stock} unidades</span></td><td><div class="table-actions"><button class="icon-button" data-edit="${e(p.id)}" aria-label="Editar ${e(p.name)}" title="Editar">${icon("pencil")}</button><button class="icon-button" data-delete="${e(p.id)}" aria-label="Eliminar ${e(p.name)}" title="Eliminar">${icon("trash-2")}</button></div></td></tr>`).join("")}</tbody></table></div><section class="admin-bottom"><h2>Actividad reciente</h2>${
      state.orders.length
        ? state.orders
            .slice(0, 4)
            .map(
              (o) =>
                `<div class="activity-row"><span>${e(o.id)}</span><span>${o.items.reduce((n, i) => n + i.quantity, 0)} piezas</span><strong>${money(o.total)}</strong></div>`,
            )
            .join("")
        : "<p>Aún no hay pedidos simulados.</p>"
    }</section>`;
  }
  function editor(p) {
    return `<div class="dialog-title"><div><p class="eyebrow">CATÁLOGO</p><h2 id="editor-title">${p ? "Editar" : "Nuevo"} producto</h2></div>${close("editor")}</div><form id="product-form"><input type="hidden" name="id" value="${e(p?.id || "")}"><label>Nombre<input name="name" required maxlength="90" value="${e(p?.name || "")}"></label><label>Descripción<textarea name="description" required maxlength="1000" rows="3">${e(p?.description || "")}</textarea></label><div class="form-grid"><label>Categoría<select name="category">${FormaCore.CATEGORIES.map((cat) => `<option ${cat === p?.category ? "selected" : ""}>${cat}</option>`).join("")}</select></label><label>Precio en MXN<input type="number" name="price" required min="0.01" max="1000000" step="0.01" value="${p ? p.price / 100 : ""}"></label><label>Unidades<input type="number" name="stock" required min="0" max="9999" step="1" value="${p?.stock ?? 5}"></label><label>Fotografía<select name="imageSource">${FORMA_CATALOG.map((x) => `<option value="${x.id}" ${x.images[0] === p?.images[0] ? "selected" : ""}>${e(x.name)}</option>`).join("")}</select></label></div><label class="check-consent"><input type="checkbox" name="featured" ${p?.featured ? "checked" : ""}> Destacar en la colección</label><div class="form-actions"><button type="button" class="button outline" data-close="editor">Cancelar</button><button type="submit" class="button dark">Guardar producto</button></div></form>`;
  }
  function compare(products) {
    return `<div class="dialog-title"><div><p class="eyebrow">TU PRÓXIMA PIEZA</p><h2 id="compare-title">Mira los detalles.</h2></div>${close("compare")}</div><div class="comparison-grid" style="--columns:${products.length}">${products.map((p) => `<article><img src="${e(p.images[0])}" alt="${e(p.name)}" width="260" height="260"><h3>${e(p.name)}</h3><strong>${money(p.price)}</strong><dl><dt>Espacio</dt><dd>${e(p.category)}</dd><dt>Disponibilidad</dt><dd>${p.stock} unidades</dd></dl><p>${e(p.description)}</p><button class="button dark full" data-add="${e(p.id)}" ${!p.stock ? "disabled" : ""}>Añadir a la bolsa</button></article>`).join("")}</div>`;
  }
  return {
    e,
    money,
    icon,
    close,
    empty,
    card,
    catalog,
    product,
    cart,
    checkout,
    orders,
    admin,
    editor,
    compare,
  };
})();

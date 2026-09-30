(() => {
  "use strict";
  const V = FormaViews,
    S = FormaStore,
    C = FormaCore;
  const main = document.querySelector("main");
  const defaults = { q: "", category: "", max: 50000, stock: false, sort: "featured" };
  let filters = { ...defaults },
    comparison = [],
    coupon = "",
    photo = 0,
    api = { loading: false, error: "", rows: null, message: "" },
    toastTimer;
  const route = () => {
    const hash = location.hash.slice(1) || "catalogo";
    return hash.split("?")[0];
  };
  function icons() {
    window.lucide?.createIcons();
  }
  function notify(message) {
    const toast = document.querySelector("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 4200);
    const dialog = document.querySelector("dialog[open]");
    if (dialog) {
      let feedback = dialog.querySelector(".dialog-feedback");
      if (!feedback) {
        feedback = document.createElement("p");
        feedback.className = "dialog-feedback fineprint";
        feedback.setAttribute("role", "status");
        dialog.append(feedback);
      }
      feedback.textContent = message;
    }
  }
  function readFilters() {
    defaults.max = Math.max(
      50000,
      ...S.get().products.map((p) => Math.ceil(p.price / 50000) * 500),
    );
    const params = new URLSearchParams(location.hash.split("?")[1] || "");
    const max = Number(params.get("max") ?? defaults.max);
    filters = {
      q: (params.get("q") || "").slice(0, 100),
      category: C.CATEGORIES.includes(params.get("category")) ? params.get("category") : "",
      max: Number.isFinite(max) && max >= 0 && max <= defaults.max ? max : defaults.max,
      stock: params.get("stock") === "1",
      sort: ["featured", "low", "high", "name"].includes(params.get("sort"))
        ? params.get("sort")
        : "featured",
    };
  }
  function writeFilters() {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== defaults[key]) params.set(key, key === "stock" ? "1" : String(value));
    }
    history.replaceState(null, "", "#" + route() + (params.size ? "?" + params : ""));
  }
  function updateChrome() {
    const state = S.get();
    document.querySelector("#favorite-count").textContent = state.favorites.length;
    document.querySelector("#cart-count").textContent = Object.values(state.cart).reduce(
      (a, b) => a + b,
      0,
    );
    document.querySelectorAll("[data-nav]").forEach((a) => {
      const current = route().split("/")[0] === a.dataset.nav;
      a.classList.toggle("active", current);
      if (current) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    comparison = comparison.filter((id) => state.products.some((p) => p.id === id));
    const bar = document.querySelector("#compare-bar");
    bar.hidden = !comparison.length;
    bar.innerHTML = comparison.length
      ? `<span>${comparison.length} de 3 piezas seleccionadas</span><button class="button" data-open-compare ${comparison.length < 2 ? "disabled" : ""}>Comparar</button><button class="icon-button" data-clear-compare aria-label="Vaciar comparador" title="Vaciar comparador">${V.icon("x")}</button>`
      : "";
    const warning = S.takeWarning();
    if (warning) notify(warning);
    icons();
  }
  function render() {
    const state = S.get(),
      current = route();
    let title;
    if (current === "catalogo" || current === "favoritos") {
      main.innerHTML = V.catalog(state, filters, comparison, current === "favoritos");
      document.querySelector("#max-price").max = String(defaults.max);
      document.querySelector("#max-price").value = String(filters.max);
      document.querySelector(".price-filter > div > span:last-child").textContent = V.money(
        defaults.max * 100,
      );
      title = current === "favoritos" ? "Favoritos" : "Muebles y objetos";
    } else if (current.startsWith("producto/")) {
      const p = state.products.find((p) => p.id === current.slice(9));
      main.innerHTML = V.product(p, state, photo);
      title = p?.name || "Producto no disponible";
    } else if (current === "checkout") {
      main.innerHTML = V.checkout(state, coupon);
      title = "Pedido de demostración";
    } else if (current === "pedidos") {
      main.innerHTML = V.orders(state);
      title = "Mis pedidos";
    } else if (current === "estudio") {
      main.innerHTML = V.admin(state, api);
      title = "Estudio";
    } else if (current.startsWith("pedido/")) {
      const order = state.orders.find((o) => o.id === current.slice(7));
      main.innerHTML = order
        ? `<section class="success-heading">${V.icon("check")}<p class="eyebrow">${V.e(order.id)}</p><h1>Un nuevo espacio comienza.</h1><p>Tu pedido de demostración quedó registrado. No se ha realizado ningún cobro.</p><a class="button outline" href="#pedidos">Ver mis pedidos</a></section>` +
          V.orders({ ...state, orders: [order] }).replace(
            /<div class="page-top">[\s\S]*?<\/div>/,
            "",
          )
        : V.empty("No encontramos este pedido.", "Revisa tu historial de pedidos.");
      title = "Pedido registrado";
    } else {
      main.innerHTML = V.empty("Este espacio no existe.", "Vuelve a la colección para continuar.");
      title = "Página no encontrada";
    }
    document.title = title + " | FORMA";
    updateChrome();
  }
  function refreshGrid() {
    const state = S.get(),
      pool =
        route() === "favoritos"
          ? state.products.filter((p) => state.favorites.includes(p.id))
          : state.products;
    const products = C.filterProducts(pool, filters);
    document.querySelector("#product-grid").innerHTML = products
      .map((p) => V.card(p, state, comparison))
      .join("");
    document.querySelector("#result-count").textContent = products.length + " objetos";
    document.querySelector("#catalog-empty").hidden = !!products.length;
    const out = document.querySelector("#price-output");
    if (out) out.textContent = V.money(filters.max * 100);
    writeFilters();
    icons();
  }
  function openDialog(id, html) {
    const d = document.getElementById(id);
    if (html !== undefined) d.innerHTML = html;
    if (!d.open) d.showModal();
    icons();
  }
  function refreshCart() {
    document.querySelector("#cart").innerHTML = V.cart(S.get(), coupon);
    icons();
  }
  function add(id) {
    const state = S.get();
    S.setQuantity(id, (state.cart[id] || 0) + 1);
    notify("Pieza añadida a tu bolsa.");
    if (document.querySelector("#cart").open) refreshCart();
  }
  function confirmAction(title, message, onConfirm) {
    openDialog(
      "confirm",
      `<h2 id="confirm-title">${V.e(title)}</h2><p>${V.e(message)}</p><div class="form-actions"><button class="button outline" data-close="confirm">Cancelar</button><button class="button dark" id="confirm-yes">Confirmar</button></div>`,
    );
    document.querySelector("#confirm-yes").onclick = () => {
      try {
        onConfirm();
        document.querySelector("#confirm").close();
      } catch (error) {
        notify(error.message);
      }
    };
  }
  function act(fn) {
    try {
      fn();
    } catch (error) {
      notify(error.message || "No pudimos completar la acción.");
    }
  }
  document
    .querySelector("#open-cart")
    .addEventListener("click", () => openDialog("cart", V.cart(S.get(), coupon)));
  S.subscribe(updateChrome);
  document.addEventListener("click", (event) => {
    const target = event.target.closest("button,[data-reset]");
    if (!target) return;
    act(() => {
      if (target.dataset.close) {
        document.getElementById(target.dataset.close).close();
        return;
      }
      if (target.hasAttribute("data-add")) {
        add(target.dataset.add);
        return;
      }
      if (target.hasAttribute("data-favorite")) {
        const id = target.dataset.favorite;
        S.favorite(id);
        if (route() === "catalogo" || route() === "favoritos") refreshGrid();
        else render();
        document
          .querySelector(`[data-favorite="${CSS.escape(id)}"]`)
          ?.focus({ preventScroll: true });
        return;
      }
      if (target.hasAttribute("data-reset")) {
        filters = { ...defaults };
        writeFilters();
        render();
        return;
      }
      if (target.hasAttribute("data-quantity")) {
        S.setQuantity(target.dataset.quantity, Number(target.dataset.value));
        refreshCart();
        return;
      }
      if (target.hasAttribute("data-checkout")) {
        document.querySelector("#cart").close();
        location.hash = "checkout";
        return;
      }
      if (target.hasAttribute("data-image")) {
        photo = Number(target.dataset.image);
        const p = S.get().products.find((p) => p.id === route().slice(9));
        if (!p || !p.images[photo]) return;
        document.querySelector("#detail-image").src = p.images[photo];
        document.querySelectorAll("[data-image]").forEach((b) => {
          const active = Number(b.dataset.image) === photo;
          b.classList.toggle("active", active);
          b.setAttribute("aria-pressed", String(active));
        });
        return;
      }
      if (target.hasAttribute("data-clear-compare")) {
        comparison = [];
        updateChrome();
        document.querySelectorAll("[data-compare]").forEach((el) => (el.checked = false));
        return;
      }
      if (target.hasAttribute("data-open-compare")) {
        openDialog(
          "compare",
          V.compare(comparison.map((id) => S.get().products.find((p) => p.id === id))),
        );
        return;
      }
      if (target.hasAttribute("data-new")) {
        openDialog("editor", V.editor());
        return;
      }
      if (target.hasAttribute("data-edit")) {
        openDialog("editor", V.editor(S.get().products.find((p) => p.id === target.dataset.edit)));
        return;
      }
      if (target.hasAttribute("data-delete")) {
        const p = S.get().products.find((p) => p.id === target.dataset.delete);
        if (p)
          confirmAction(
            "¿Eliminar esta pieza?",
            `${p.name} se quitará del catálogo, favoritos y bolsa. El historial de pedidos se conserva.`,
            () => {
              S.removeProduct(p.id);
              render();
              notify("Producto eliminado.");
            },
          );
        return;
      }
      if (target.id === "sync-stock") {
        sync();
        return;
      }
      if (target.hasAttribute("data-apply-stock")) {
        if (!api.rows) return;
        S.updateStock(api.rows);
        api = {
          ...api,
          rows: null,
          message:
            "Disponibilidad actualizada. Los precios y las descripciones locales se conservaron.",
        };
        render();
        return;
      }
      if (target.hasAttribute("data-discard-stock")) {
        api.rows = null;
        render();
      }
    });
  });
  document.addEventListener("input", (event) => {
    const el = event.target;
    if (el.id === "search") {
      filters.q = el.value;
      refreshGrid();
    }
    if (el.id === "max-price") {
      filters.max = Number(el.value);
      refreshGrid();
    }
  });
  document.addEventListener("change", (event) => {
    const el = event.target;
    act(() => {
      if (el.name === "category") {
        filters.category = el.value;
        refreshGrid();
      }
      if (el.id === "sort") {
        filters.sort = el.value;
        refreshGrid();
      }
      if (el.id === "stock-only") {
        filters.stock = el.checked;
        refreshGrid();
      }
      if (el.hasAttribute("data-compare")) {
        const id = el.dataset.compare;
        if (el.checked) {
          if (comparison.length >= 3) {
            el.checked = false;
            notify("Puedes comparar hasta tres piezas.");
            return;
          }
          comparison.push(id);
        } else comparison = comparison.filter((x) => x !== id);
        updateChrome();
      }
    });
  });
  document.addEventListener("submit", (event) => {
    const form = event.target,
      formId = form.getAttribute("id");
    if (!["coupon-form", "checkout-form", "product-form"].includes(formId)) return;
    event.preventDefault();
    act(() => {
      const data = Object.fromEntries(new FormData(form));
      if (formId === "coupon-form") {
        const next = data.coupon.trim().toUpperCase();
        if (next && next !== "FORMA10") {
          notify("Ese código no es válido. Puedes usar FORMA10.");
          return;
        }
        coupon = next;
        refreshCart();
        if (route() === "checkout") render();
        return;
      }
      if (formId === "checkout-form") {
        for (const key of ["name", "email", "address", "city", "postal"]) {
          if (!data[key]?.trim()) throw Error("Completa todos los datos de entrega.");
        }
        if (!/^[0-9]{5}$/.test(data.postal) || !data.consent)
          throw Error("Revisa el código postal y confirma la simulación.");
        const order = S.checkout(coupon, "demostración");
        coupon = "";
        location.hash = "pedido/" + order.id;
        return;
      }
      if (formId === "product-form") {
        const previous = S.get().products.find((p) => p.id === data.id);
        const image = FORMA_CATALOG.find((p) => p.id === data.imageSource);
        if (!image) throw Error("Selecciona una fotografía.");
        const product = {
          ...previous,
          id: previous?.id || "local-" + crypto.randomUUID(),
          name: data.name.trim(),
          description: data.description.trim(),
          category: data.category,
          price: Math.round(Number(data.price) * 100),
          stock: Number(data.stock),
          images: image.images,
          featured: data.featured === "on",
          sourceId: previous?.sourceId ?? null,
        };
        if (!product.description) throw Error("Escribe una descripción.");
        S.saveProduct(product);
        document.querySelector("#editor").close();
        render();
        notify("Producto guardado.");
      }
    });
  });
  async function sync() {
    if (api.loading) return;
    api = { loading: true, error: "", rows: null, message: "" };
    render();
    try {
      api.rows = await FormaAPI.availability();
    } catch (error) {
      api.error = error.message;
    } finally {
      api.loading = false;
      if (route() === "estudio") {
        render();
        document.querySelector("#sync-stock").focus();
      }
    }
  }
  window.addEventListener("hashchange", () => {
    photo = 0;
    readFilters();
    render();
    main.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      document.querySelectorAll("dialog[open]").forEach((d) => d.close());
    }
  });
  document.addEventListener(
    "error",
    (event) => {
      if (event.target.tagName === "IMG" && !event.target.dataset.fallback) {
        event.target.dataset.fallback = "1";
        event.target.src = "assets/image-unavailable.svg";
      }
    },
    true,
  );
  readFilters();
  render();
  // Progressive enhancement: the same catalog can be queried by a supporting browser agent.
  if (document.modelContext?.registerTool) {
    try {
      Promise.resolve(
        document.modelContext.registerTool({
          name: "forma_search_catalog",
          title: "Search FORMA catalog",
          description: "Read the local catalog. Does not modify cart or place orders.",
          inputSchema: {
            type: "object",
            properties: { query: { type: "string" } },
            required: ["query"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: true, untrustedContentHint: true },
          execute(input) {
            if (!input || typeof input.query !== "string" || input.query.length > 100)
              throw Error("A query of up to 100 characters is required.");
            return C.filterProducts(S.get().products, { q: input.query }).map((p) => ({
              id: p.id,
              name: p.name,
              priceMXN: p.price / 100,
              stock: p.stock,
            }));
          },
        }),
      ).catch(() => {});
    } catch {}
  }
})();

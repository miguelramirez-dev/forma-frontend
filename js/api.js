window.FormaAPI = (() => {
  async function availability() {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const lists = await Promise.all(
        ["furniture", "home-decoration"].map(async (category) => {
          const response = await fetch(`https://dummyjson.com/products/category/${category}`, {
            signal: controller.signal,
          });
          if (!response.ok) throw Error("El proveedor respondió con un error.");
          const data = await response.json();
          if (
            !Array.isArray(data.products) ||
            !data.products.every(
              (p) =>
                Number.isInteger(p.id) &&
                Number.isInteger(p.stock) &&
                p.stock >= 0 &&
                p.stock <= 9999,
            )
          )
            throw Error("La respuesta del proveedor no es válida.");
          return data.products.map(({ id, stock }) => ({ id, stock }));
        }),
      );
      return lists.flat();
    } catch (error) {
      if (error.name === "AbortError")
        throw Error("La consulta tardó demasiado. Vuelve a intentarlo.");
      throw Error("No pudimos consultar al proveedor. Revisa tu conexión y vuelve a intentarlo.");
    } finally {
      clearTimeout(timer);
    }
  }
  return { availability };
})();

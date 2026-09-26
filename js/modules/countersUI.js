/**
 * countersUI.js — contador del carrito en el header.
 * Muestra cantidad y total acumulados desde las tarjetas de producto.
 */

export function initCounters() {
  const countEl = document.querySelector(".cart__count");
  const totalEl = document.querySelector(".cart__total");
  if (!countEl || !totalEl) return () => {};

  let count = 0;
  let total = 0;

  const render = () => {
    countEl.textContent = String(count);
    totalEl.textContent = `$${total.toFixed(2)}`;
    // pequeño feedback visual al actualizar
    countEl.animate(
      [{ transform: "scale(1.35)" }, { transform: "scale(1)" }],
      { duration: 250, easing: "ease-out" }
    );
  };

  /** @param {{name:string, price:number}} item */
  return function addToCart(item) {
    count += 1;
    total += item.price;
    render();
  };
}

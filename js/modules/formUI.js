/**
 * formUI.js — Validación y feedback del formulario de registro (UI).
 * isValidEmail() es lógica pura; el resto solo toca el DOM.
 */

/** Valifica una dirección de correo con un patrón razonable. Lógica pura. */
export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

const SUCCESS_MSG = "¡Listo! Revisa tu correo para confirmar la cuenta.";
const ERROR_EMPTY = "Escribe tu correo electrónico.";
const ERROR_INVALID = "Ese correo no parece válido.";

export const initSignupForm = ({ form, input, feedback }) => {
  if (!form || !input || !feedback) return;

  const setMessage = (text, state) => {
    feedback.textContent = text;
    feedback.classList.toggle("cta__feedback--success", state === "success");
    feedback.classList.toggle("cta__feedback--error", state === "error");
    input.classList.toggle("cta__input--error", state === "error");
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input.value;

    if (!value.trim()) {
      setMessage(ERROR_EMPTY, "error");
      input.focus();
      return;
    }

    if (!isValidEmail(value)) {
      setMessage(ERROR_INVALID, "error");
      input.focus();
      return;
    }

    setMessage(SUCCESS_MSG, "success");
    form.reset();
  });

  input.addEventListener("input", () => setMessage("", null));
};

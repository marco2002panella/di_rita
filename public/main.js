// Animazioni allo scroll: aggiunge .in agli elementi quando entrano in vista.
(() => {
  const targets = document.querySelectorAll(".art .cluster, .fact, .service, .contact-intro, .card");
  document.querySelectorAll(".art .cluster, .fact").forEach((el, i) => el.style.setProperty("--i", el.matches(".fact") ? i - 5 : i));
  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      // Se più elementi entrano insieme, compaiono uno alla volta.
      entries.filter((e) => e.isIntersecting).forEach((e, k) => {
        const step = e.target.matches(".cluster") ? 450 : 150;
        e.target.style.setProperty("--d", k * step + "ms");
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
  );
  targets.forEach((el) => io.observe(el));
})();

const form = document.getElementById("contact-form");
const done = document.getElementById("contact-done");
const errorBox = document.getElementById("form-error");
const submit = document.getElementById("form-submit");
const FALLBACK = "Qualcosa non ha funzionato. Scrivimi direttamente a pierluigidirita@outlook.it";

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorBox.textContent = "";
  submit.disabled = true;

  const data = Object.fromEntries(new FormData(form));
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || FALLBACK);
    form.hidden = true;
    done.hidden = false;
    done.focus();
  } catch (err) {
    errorBox.textContent = err.message || FALLBACK;
    submit.disabled = false;
  }
});

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

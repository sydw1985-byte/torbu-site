// app.js
const RECAPTCHA_SITE_KEY = "6LcphWksAAAAAA9gfOwjBuMDWHQY2PQ_GDStFNPU";

const form = document.getElementById("contactForm");
const tokenEl = document.getElementById("recaptchaToken");

if (form) {
  form.addEventListener("submit", (e) => {
    // Honeypot: bots fill this, humans won't
    const honeypot = form.querySelector('input[name="company"]');
    if (honeypot && honeypot.value.trim() !== "") {
      e.preventDefault();
      return;
    }

    // If token already set, allow submit (prevents loop)
    if (tokenEl && tokenEl.value) return;

    // Stop default submit until we get a token
    e.preventDefault();

    if (!window.grecaptcha) {
      alert("reCAPTCHA not loaded. Please refresh and try again.");
      return;
    }

    grecaptcha.ready(() => {
      grecaptcha
        .execute(RECAPTCHA_SITE_KEY, { action: "contact_submit" })
        .then((token) => {
          if (!tokenEl) throw new Error("Missing #recaptchaToken element");
          tokenEl.value = token;

          // Submit normally to Apps Script
          form.submit();
        })
        .catch((err) => {
          console.error(err);
          alert("Could not verify reCAPTCHA. Please try again.");
        });
    });
  });
}

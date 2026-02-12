const RECAPTCHA_SITE_KEY = "6LcphWksAAAAAA9gfOwjBuMDWHQY2PQ_GDStFNPU";

const form = document.getElementById("contactForm");
const tokenEl = document.getElementById("recaptchaToken");

if (form) {
  form.addEventListener("submit", (e) => {
    // Honeypot
    if (form.company && form.company.value.trim() !== "") {
      e.preventDefault();
      return;
    }

    // If token already set, allow submit
    if (tokenEl && tokenEl.value) return;

    e.preventDefault();

    if (!window.grecaptcha) {
      alert("reCAPTCHA not loaded. Please refresh and try again.");
      return;
    }

    grecaptcha.ready(() => {
      grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "contact_submit" })
        .then((token) => {
          tokenEl.value = token;
          form.submit(); // submit normally to Apps Script
        })
        .catch((err) => {
          console.error(err);
          alert("Could not verify reCAPTCHA. Please try again.");
        });
    });
  });
}

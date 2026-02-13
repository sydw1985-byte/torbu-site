const RECAPTCHA_SITE_KEY = "6LcphWksAAAAAA9gfOwjBuMDWHQY2PQ_GDStFNPU";

const form = document.getElementById("contactForm");
const tokenEl = document.getElementById("recaptchaToken");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Honeypot
    if (form.company && form.company.value.trim() !== "") return;

    if (!window.grecaptcha) {
      alert("reCAPTCHA not loaded. Please refresh and try again.");
      return;
    }

    grecaptcha.ready(() => {
      grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "contact_submit" })
        .then((token) => {
          if (!tokenEl) throw new Error("Missing #recaptchaToken element");
          tokenEl.value = token;

          // Submit normally (to iframe), then redirect user to your thank-you page
          form.submit();
          window.location.href = "./thank-you.html";
        })
        .catch((err) => {
          console.error(err);
          alert("Error: " + (err && err.message ? err.message : err));
        });
    });
  });
}

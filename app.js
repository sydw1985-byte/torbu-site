const RECAPTCHA_SITE_KEY = "6LcphWksAAAAAA9gfOwjBuMDWHQY2PQ_GDStFNPU";

const form = document.getElementById("contactForm");
const tokenEl = document.getElementById("recaptchaToken");

if (form) {
  form.addEventListener("submit", async (e) => {
    // Honeypot spam check
    if (form.company && form.company.value !== "") {
      e.preventDefault();
      return;
    }

    // If token already exists, let the form submit normally
    if (tokenEl && tokenEl.value) return;

    e.preventDefault();

    if (!window.grecaptcha) {
      alert("reCAPTCHA not loaded. Please refresh and try again.");
      return;
    }

    grecaptcha.ready(async () => {
      try {
        const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "contact_submit" });
        tokenEl.value = token;

        // Now submit normally (no fetch)
        form.submit();
      } catch (err) {
        console.error(err);
        alert("Could not verify reCAPTCHA. Please try again.");
      }
    });
  });
}

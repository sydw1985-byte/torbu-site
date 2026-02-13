const RECAPTCHA_SITE_KEY = "6LcphWksAAAAAA9gfOwjBuMDWHQY2PQ_GDStFNPU";

const form = document.getElementById("contactForm");
const tokenEl = document.getElementById("recaptchaToken");
const iframe = document.getElementById("hidden_iframe");

/* Mobile drawer toggle */
(() => {
  const btn = document.getElementById("navToggle");
  const drawer = document.getElementById("drawer");
  if (!btn || !drawer) return;

  btn.addEventListener("click", () => {
    const isOpen = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!isOpen));
    drawer.hidden = isOpen;
  });

  // Close drawer when a link is clicked
  drawer.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      drawer.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    }
  });
})();

/* Contact form submit (Apps Script + reCAPTCHA v3) */
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Honeypot
    if (form.company && form.company.value.trim() !== "") return;

    if (!window.grecaptcha) {
      alert("reCAPTCHA not loaded. Please refresh and try again.");
      return;
    }

    if (!tokenEl) {
      alert("Missing reCAPTCHA token field (#recaptchaToken).");
      return;
    }

    let redirected = false;
    let fallbackTimer = null;

    const redirectNow = () => {
      if (redirected) return;
      redirected = true;
      window.location.href = "./thank-you.html";
    };

    const onIframeLoad = () => {
      if (fallbackTimer) clearTimeout(fallbackTimer);
      if (iframe) iframe.removeEventListener("load", onIframeLoad);
      redirectNow();
    };

    // If Apps Script returns anything, iframe should load
    if (iframe) {
      iframe.addEventListener("load", onIframeLoad);
    }

    // Fallback redirect
    fallbackTimer = setTimeout(() => {
      if (iframe) iframe.removeEventListener("load", onIframeLoad);
      redirectNow();
    }, 2500);

    grecaptcha.ready(() => {
      grecaptcha
        .execute(RECAPTCHA_SITE_KEY, { action: "contact_submit" })
        .then((token) => {
          tokenEl.value = token;

          // Submit to Apps Script (make sure the form has target="hidden_iframe")
          form.submit();
        })
        .catch((err) => {
          if (fallbackTimer) clearTimeout(fallbackTimer);
          if (iframe) iframe.removeEventListener("load", onIframeLoad);
          console.error(err);
          alert("Error: " + (err && err.message ? err.message : err));
        });
    });
  });
}

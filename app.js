const RECAPTCHA_SITE_KEY = "6LcphWksAAAAAA9gfOwjBuMDWHQY2PQ_GDStFNPU";

const form = document.getElementById("contactForm");
const tokenEl = document.getElementById("recaptchaToken");
const iframe = document.getElementById("hidden_iframe");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Honeypot
    if (form.company && form.company.value.trim() !== "") return;

    if (!window.grecaptcha) {
      alert("reCAPTCHA not loaded. Please refresh and try again.");
      return;
    }

    // Redirect ONLY after iframe gets a response (or after a fallback delay)
    let redirected = false;

    const redirectNow = () => {
      if (redirected) return;
      redirected = true;
      window.location.href = "./thank-you.html";
    };

    // If Apps Script responds, iframe will "load"
    const onIframeLoad = () => {
      iframe.removeEventListener("load", onIframeLoad);
      redirectNow();
    };

    if (iframe) {
      iframe.addEventListener("load", onIframeLoad);
    }

    // Fallback: if load event doesn’t fire for some reason, redirect after 2s
    const fallbackTimer = setTimeout(() => {
      if (iframe) iframe.removeEventListener("load", onIframeLoad);
      redirectNow();
    }, 2000);

    grecaptcha.ready(() => {
      grecaptcha
        .execute(RECAPTCHA_SITE_KEY, { action: "contact_submit" })
        .then((token) => {
          if (!tokenEl) throw new Error("Missing #recaptchaToken element");
          tokenEl.value = token;

          // Submit to Apps Script (into iframe)
          form.submit();

          // don’t clear timer here; we want either iframe load or fallback to redirect
          // clearTimeout(fallbackTimer) would prevent fallback
        })
        .catch((err) => {
          clearTimeout(fallbackTimer);
          if (iframe) iframe.removeEventListener("load", onIframeLoad);
          console.error(err);
          alert("Error: " + (err && err.message ? err.message : err));
        });
    });
  });
}

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw4mKp8JVZWoPWMRoBKz_NiE4vnxBoJDomfXTsQx_q-6rmNMhe_Ogz4ei4t3_-Rotv9oQ/exec";
const RECAPTCHA_SITE_KEY = "6LcphWksAAAAAA9gfOwjBuMDWHQY2PQ_GDStFNPU";

const form = document.getElementById("contactForm");
const tokenEl = document.getElementById("recaptchaToken");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Honeypot
    if (form.company && form.company.value.trim() !== "") return;

    if (!window.grecaptcha) {
      alert("reCAPTCHA not loaded. Please refresh and try again.");
      return;
    }

    try {
      const token = await new Promise((resolve, reject) => {
        grecaptcha.ready(() => {
          grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "contact_submit" })
            .then(resolve)
            .catch(reject);
        });
      });

      if (!tokenEl) throw new Error("Missing #recaptchaToken element");
      tokenEl.value = token;

      const fd = new FormData(form);

      const res = await fetch(SCRIPT_URL, {
        method: "POST",
        body: fd,
        redirect: "follow",
      });

      // Apps Script might return HTML (redirect page) or JSON.
      // If it returns JSON, parse it. If not, just treat 200 as success.
      let ok = res.ok;

      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const data = await res.json();
        ok = !!data.ok;
        if (!ok) throw new Error(data.error || "Submission failed");
      } else {
        // if HTML, still assume ok on 200
        if (!res.ok) throw new Error("Submission failed");
      }

      window.location.href = "./thank-you.html";
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please email info@torbu.com.");
    }
  });
}

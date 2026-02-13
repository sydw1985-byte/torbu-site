const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw4mKp8JVZWoPWMRoBKz_NiE4vnxBoJDomfXTsQx_q-6rmNMhe_Ogz4ei4t3_-Rotv9oQ/exec";
const RECAPTCHA_SITE_KEY = "6LcphWksAAAAAA9gfOwjBuMDWHQY2PQ_GDStFNPU";

const form = document.getElementById("contactForm");
const tokenEl = document.getElementById("recaptchaToken");

function getRecaptchaToken() {
  return new Promise((resolve, reject) => {
    if (!window.grecaptcha) return reject(new Error("reCAPTCHA not loaded"));
    grecaptcha.ready(() => {
      grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "contact_submit" })
        .then(resolve)
        .catch(reject);
    });
  });
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Honeypot
    if (form.company && form.company.value.trim() !== "") return;

    try {
      const token = await getRecaptchaToken();
      if (!tokenEl) throw new Error("Missing #recaptchaToken element");
      tokenEl.value = token;

      const fd = new FormData(form);

      const res = await fetch(SCRIPT_URL, { method: "POST", body: fd });

      const ct = (res.headers.get("content-type") || "").toLowerCase();
      const text = await res.text();

      // If Apps Script returns JSON, enforce {ok:true}
      if (ct.includes("application/json")) {
        let data = {};
        try { data = JSON.parse(text); } catch (_) {}
        if (!res.ok || !data.ok) throw new Error(data.error || "Submission failed");
      } else {
        // If it returns HTML (common), treat any 2xx as success
        if (!res.ok) throw new Error(text || "Submission failed");
      }

            window.location.href = "./thank-you.html";

    } catch (err) {
      console.error(err);
      alert("Error: " + (err && err.message ? err.message : err));
    }
  });
}

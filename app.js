const SCRIPT_URL = "YOUR_WEB_APP_EXEC_URL_HERE";
const RECAPTCHA_SITE_KEY = "6LcphWksAAAAAA9gfOwjBuMDWHQY2PQ_GDStFNPU";

const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");

async function getRecaptchaToken() {
  return new Promise((resolve, reject) => {
    if (!window.grecaptcha) return reject(new Error("reCAPTCHA not loaded"));
    grecaptcha.ready(async () => {
      try {
        const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "contact_submit" });
        resolve(token);
      } catch (e) {
        reject(e);
      }
    });
  });
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Honeypot spam check
    if (form.company && form.company.value !== "") return;

    if (statusEl) {
      statusEl.style.display = "block";
      statusEl.textContent = "Sending…";
    }

    try {
      const recaptchaToken = await getRecaptchaToken();

      const payload = {
        name: form.name.value.trim(),
        org: form.org.value.trim(),
        email: form.email.value.trim(),
        message: form.message.value.trim(),
        recaptchaToken,
        recaptchaAction: "contact_submit",
      };

      const res = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data = {};
      try { data = JSON.parse(text); } catch (e) {}

      if (!res.ok || !data.ok) {
        throw new Error(data.error || text || "Submission failed");
      }

      window.location.href = "thank-you.html";

    } catch (err) {
      console.error(err);
      if (statusEl) {
        statusEl.style.display = "block";
        statusEl.textContent = `Error: ${err.message}`; // change back later
      }
    }
  });
}

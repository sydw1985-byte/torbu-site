const SCRIPT_URL = "PASTE_YOUR_GOOGLE_WEB_APP_URL_HERE";
const RECAPTCHA_SITE_KEY = "PASTE_YOUR_RECAPTCHA_SITE_KEY_HERE";

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

    // Honeypot spam check (keep your hidden input named "company")
    if (form.company && form.company.value !== "") return;

    statusEl.style.display = "block";
    statusEl.textContent = "Sending…";

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

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Submission failed");

      // Redirect to thank-you page
      window.location.href = "thank-you.html";
    } catch (err) {
      statusEl.textContent = "Something went wrong. Please email info@torbu.com.";
      console.error(err);
    }
  });
}

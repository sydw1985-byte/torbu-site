const SCRIPT_URL = "PASTE_YOUR_GOOGLE_WEB_APP_URL_HERE";

const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Basic spam check
    if (form.company.value !== "") return;

    const payload = {
      name: form.name.value.trim(),
      org: form.org.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim(),
    };

    try {
      const res = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Submission failed");

      form.reset();
      statusEl.style.display = "block";
      statusEl.textContent = "Thanks — we’ll be in touch shortly.";

    } catch (err) {
      statusEl.style.display = "block";
      statusEl.textContent = "Something went wrong. Please email info@torbu.com.";
    }
  });
}

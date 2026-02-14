const form = document.getElementById("contactForm");

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

/* Contact form submit (Worker + Turnstile) */
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Honeypot
    if (form.company && form.company.value.trim() !== "") return;

    if (!window.turnstile) {
      alert("Security check not loaded. Please refresh and try again.");
      return;
    }

    const widget = form.querySelector(".cf-turnstile");
    if (!widget) {
      alert("Missing Turnstile widget (.cf-turnstile) in the form.");
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn ? btn.textContent : "";
    if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }

    // Required fields
    const name = form.name.value.trim();
    const org = (form.org?.value || "").trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !org || !email || !message) {
      alert("Please complete name, organization, email, and message.");
      if (btn) { btn.disabled = false; btn.textContent = originalText; }
      return;
    }

    try {
      const tsToken = await new Promise((resolve, reject) => {
        window.turnstile.execute(widget, {
          callback: resolve,
          "error-callback": () => reject(new Error("Security check failed")),
          "expired-callback": () => reject(new Error("Security check expired")),
        });
      });

      const payload = { name, org, email, message, tsToken };

      const res = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not send.");

      window.location.href = "./thank-you.html";
    } catch (err) {
      console.error(err);
      alert(err && err.message ? err.message : "Could not send. Please try again.");
    } finally {
      try { window.turnstile.reset(widget); } catch {}
      if (btn) { btn.disabled = false; btn.textContent = originalText; }
    }
  });
}

const form = document.getElementById("contactForm");

/* Mobile drawer toggle */
(() => {
  const navBtn = document.getElementById("navToggle");
  const drawer = document.getElementById("drawer");
  if (!navBtn || !drawer) return;

  navBtn.addEventListener("click", () => {
    const isOpen = navBtn.getAttribute("aria-expanded") === "true";
    navBtn.setAttribute("aria-expanded", String(!isOpen));
    drawer.hidden = isOpen;
  });

  // Close drawer when a link is clicked
  drawer.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      drawer.hidden = true;
      navBtn.setAttribute("aria-expanded", "false");
    }
  });
})();

/* Industry accordion (one open at a time) */
(() => {
  const root = document.getElementById("industryAccordion");
  if (!root) return;

  function getPanel(btn) {
    const panelId = btn.getAttribute("aria-controls");
    return panelId ? document.getElementById(panelId) : null;
  }

  function closeAll(exceptBtn = null) {
    root.querySelectorAll('.industryTrigger[aria-expanded="true"]').forEach((btn) => {
      if (btn === exceptBtn) return;
      const panel = getPanel(btn);
      btn.setAttribute("aria-expanded", "false");
      if (panel) panel.hidden = true;
    });
  }

  root.addEventListener("click", (e) => {
    const btn = e.target.closest(".industryTrigger");
    if (!btn || !root.contains(btn)) return;

    const panel = getPanel(btn);
    if (!panel) return;

    const isOpen = btn.getAttribute("aria-expanded") === "true";

    // Close others first
    closeAll(btn);

    // Toggle this one
    btn.setAttribute("aria-expanded", String(!isOpen));
    panel.hidden = isOpen;

    // IMPORTANT: do NOT change the "+" text here.
    // Keep "+" in markup and let CSS rotate it to form an "x".
  });

  // Optional: ensure everything starts closed and consistent
  // (useful if any HTML has aria-expanded="true" accidentally)
  closeAll();
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

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add("is-loading");
    }

    // Required fields
    const name = form.name.value.trim();
    const org = (form.org?.value || "").trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !org || !email || !message) {
      alert("Please complete name, organization, email, and message.");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove("is-loading");
      }
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
      alert(err?.message || "Could not send. Please try again.");
    } finally {
      try { window.turnstile.reset(widget); } catch {}
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove("is-loading");
      }
    }
  });
}

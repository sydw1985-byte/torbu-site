(() => {
  const toggle = document.querySelector(".nav__toggle");
  const drawer = document.getElementById("drawer");

  if (!toggle || !drawer) return;

  const openDrawer = () => {
    drawer.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
  };

  const closeDrawer = () => {
    drawer.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    expanded ? closeDrawer() : openDrawer();
  });

  drawer.addEventListener("click", (e) => {
    const t = e.target;
    if (t && t.tagName === "A") closeDrawer();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });
})();

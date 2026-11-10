(() => {
  "use strict";

  const header = document.getElementById("siteHeader");
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const year = document.getElementById("year");

  if (year) year.textContent = new Date().getFullYear();

  const setHeaderState = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  const closeMenu = () => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    mobileMenu.classList.remove("open");
    mobileMenu.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
  };

  menuToggle?.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!open));
    menuToggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
    mobileMenu.classList.toggle("open", !open);
    mobileMenu.setAttribute("aria-hidden", String(open));
    document.body.classList.toggle("menu-open", !open);
  });

  mobileMenu?.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });

  const form = document.getElementById("contactForm");
  form?.addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("f-name");
    const phone = document.getElementById("f-phone");
    const service = document.getElementById("f-service");
    const message = document.getElementById("f-msg");
    const success = document.getElementById("formSuccess");

    let valid = true;
    [
      [name, "Please enter your name."],
      [phone, "Please enter your phone number."],
      [service, "Please select a service."]
    ].forEach(([field, errorText]) => {
      const label = field.closest("label");
      const error = label.querySelector(".error");
      const empty = !field.value.trim();
      label.classList.toggle("field-invalid", empty);
      error.textContent = empty ? errorText : "";
      if (empty) valid = false;
    });

    if (phone.value.trim() && phone.value.trim().replace(/\D/g, "").length < 7) {
      const label = phone.closest("label");
      label.classList.add("field-invalid");
      label.querySelector(".error").textContent = "Please enter a valid phone number.";
      valid = false;
    }

    if (!valid) return;

    const text = [
      "Hello TOS, I'd like to request an assessment.",
      "",
      `Name: ${name.value.trim()}`,
      `Phone: ${phone.value.trim()}`,
      `Service: ${service.value}`,
      message.value.trim() ? `Message: ${message.value.trim()}` : ""
    ].filter(Boolean).join("\n");

    const whatsappUrl = `https://wa.me/2348063288510?text=${encodeURIComponent(text)}`;
    success.textContent = "Your WhatsApp message is ready. Continue to send the request to TOS.";
    success.classList.add("show");
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  });

  form?.querySelectorAll("input, select, textarea").forEach(field => {
    field.addEventListener("input", () => {
      const label = field.closest("label");
      if (field.value.trim()) {
        label?.classList.remove("field-invalid");
        const error = label?.querySelector(".error");
        if (error) error.textContent = "";
      }
    });
  });
})();

(() => {
  const EMAIL = "marielsobiono04@gmail.com";
  const $ = (s, r = document) => r.querySelector(s);
  const yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();

  // Mobile menu
  const toggle = $(".menu-toggle"), nav = $("#nav");
  const setMenu = (o) => { nav.classList.toggle("open", o); toggle.setAttribute("aria-expanded", String(o)); toggle.textContent = o ? "close" : "menu"; };
  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });

  // Active section tracking
  const links = [...nav.querySelectorAll("a")];
  const secs = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => { const on = a.getAttribute("href") === "#" + en.target.id; a.classList.toggle("active", on); on ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current"); });
    }), { rootMargin: "-40% 0px -55% 0px" });
    secs.forEach((s) => io.observe(s));
  }

  // Email copy
  const copy = async (t) => {
    try { await navigator.clipboard.writeText(t); return true; }
    catch { const a = document.createElement("textarea"); a.value = t; a.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(a); a.select(); const ok = document.execCommand("copy"); a.remove(); return ok; }
  };
  const copyEmail = async (btn) => {
    const ok = await copy(EMAIL);
    if (!btn) return ok;
    const label = btn.textContent;
    btn.textContent = ok ? "copied" : "failed"; btn.classList.toggle("copied", ok);
    setTimeout(() => { btn.textContent = label; btn.classList.remove("copied"); }, 1800);
    return ok;
  };
  document.querySelectorAll("[data-copy-email]").forEach((b) => b.addEventListener("click", () => copyEmail(b)));

  // Avatar follows the cursor a little
  const av = $("#avatar");
  if (av && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    addEventListener("mousemove", (e) => {
      av.style.setProperty("--x", ((e.clientX / innerWidth - .5) * 8).toFixed(1) + "px");
      av.style.setProperty("--y", ((e.clientY / innerHeight - .5) * 8).toFixed(1) + "px");
    });
  }

  // Command palette
  const pal = $("#palette"), input = $("#palette-input"), list = $("#palette-list");
  const go = (id) => () => { const el = $(id); if (el) el.scrollIntoView({ behavior: "smooth" }); };
  const open = (u) => () => window.open(u, "_blank", "noopener");
  const cmds = [
    { t: "home", h: "go to", f: go("#home") }, { t: "projects", h: "go to", f: go("#projects") },
    { t: "experience & education", h: "go to", f: go("#experience") }, { t: "stack", h: "go to", f: go("#stack") },
    { t: "contact", h: "go to", f: go("#contact") },
    { t: "copy email", h: "action", f: () => copyEmail($("[data-copy-email]")) },
    { t: "open live system", h: "link", f: open("https://aics-predictive-system.onrender.com/") },
    { t: "open github", h: "link", f: open("https://github.com/Sobiono-k") },
    { t: "send an email", h: "link", f: () => { location.href = "mailto:" + EMAIL; } },
  ];
  let shown = cmds, idx = 0, lastFocus = null;
  const render = () => {
    list.innerHTML = "";
    shown.forEach((c, i) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option"); li.setAttribute("aria-selected", String(i === idx));
      li.innerHTML = "<span></span><small></small>"; li.firstChild.textContent = c.t; li.lastChild.textContent = c.h;
      li.addEventListener("click", () => run(c)); list.appendChild(li);
    });
    if (!shown.length) list.innerHTML = "<li>no matches</li>";
  };
  const filter = () => { const q = input.value.trim().toLowerCase(); shown = cmds.filter((c) => c.t.includes(q) || c.h.includes(q)); idx = 0; render(); };
  const close = () => { pal.hidden = true; if (lastFocus) lastFocus.focus(); };
  const run = (c) => { close(); c.f(); };
  const openPal = () => { lastFocus = document.activeElement; pal.hidden = false; input.value = ""; filter(); input.focus(); };
  document.querySelectorAll("[data-open-palette]").forEach((b) => b.addEventListener("click", openPal));
  input.addEventListener("input", filter);
  pal.addEventListener("click", (e) => { if (e.target === pal) close(); });
  addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); pal.hidden ? openPal() : close(); return; }
    if (pal.hidden) { if (e.key === "Escape") setMenu(false); return; }
    if (e.key === "Escape") close();
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault(); if (!shown.length) return;
      idx = (idx + (e.key === "ArrowDown" ? 1 : -1) + shown.length) % shown.length; render();
      list.children[idx].scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter" && shown[idx]) { e.preventDefault(); run(shown[idx]); }
  });
})();
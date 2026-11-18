(() => {
  const EMAIL = "marielsobiono04@gmail.com";
  const $ = (s, r = document) => r.querySelector(s);
  const yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();

  // Theme (dark / light). Saved choice is applied in <head> before paint; this wires up the button.
  const root = document.documentElement, themeBtn = $("[data-theme-toggle]"), themeMeta = $('meta[name="theme-color"]');
  const getTheme = () => (root.dataset.theme === "light" ? "light" : "dark");
  const setTheme = (t, save = true) => {
    root.dataset.theme = t;
    const next = t === "dark" ? "light" : "dark";
    if (themeBtn) themeBtn.setAttribute("aria-label", "Switch to " + next + " mode");
    if (themeMeta) themeMeta.setAttribute("content", t === "dark" ? "#0a0a0a" : "#fafaf8");
    if (save) { try { localStorage.setItem("theme", t); } catch {} }
  };
  const toggleTheme = () => setTheme(getTheme() === "dark" ? "light" : "dark");
  setTheme(getTheme(), false);
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

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

  // Swipeable carousels (touch swipe, trackpad, arrows, dots, and arrow keys when the track is focused)
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-carousel]").forEach((c) => {
    const track = $(".track", c), slides = [...track.children];
    if (!slides.length) return;
    c.setAttribute("role", "group"); c.setAttribute("aria-roledescription", "carousel"); c.setAttribute("aria-label", c.dataset.label || "Carousel");
    slides.forEach((s, i) => { s.setAttribute("role", "group"); s.setAttribute("aria-roledescription", "slide"); s.setAttribute("aria-label", (i + 1) + " of " + slides.length); });
    track.setAttribute("aria-label", (c.dataset.label || "Carousel") + " (scroll sideways)");

    const ctrl = document.createElement("div"); ctrl.className = "ctrl";
    ctrl.innerHTML = '<button type="button" data-prev aria-label="Previous">←</button><div class="dots"></div><button type="button" data-next aria-label="Next">→</button>';
    c.appendChild(ctrl);
    const prev = $("[data-prev]", ctrl), next = $("[data-next]", ctrl), dots = $(".dots", ctrl);

    let pages = 1, cur = 0, ticking = false;
    const gap = () => parseFloat(getComputedStyle(track).columnGap) || 0;
    const perView = () => Math.max(1, Math.floor((track.clientWidth + gap()) / (slides[0].offsetWidth + gap()) + 0.02));
    const goTo = (i) => {
      const t = Math.max(0, Math.min(pages - 1, i));
      track.scrollTo({ left: slides[t].offsetLeft - slides[0].offsetLeft, behavior: reduceMotion ? "auto" : "smooth" });
    };
    const build = () => {
      pages = Math.max(1, slides.length - perView() + 1);
      ctrl.hidden = pages <= 1;
      dots.innerHTML = "";
      for (let i = 0; i < pages; i++) {
        const b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-label", "Go to slide " + (i + 1));
        b.addEventListener("click", () => goTo(i)); dots.appendChild(b);
      }
      update();
    };
    const update = () => {
      ticking = false;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
      let best = 0, bd = Infinity;
      for (let i = 0; i < pages; i++) { const d = Math.abs(slides[i].offsetLeft - slides[0].offsetLeft - track.scrollLeft); if (d < bd) { bd = d; best = i; } }
      cur = atEnd ? pages - 1 : best;
      [...dots.children].forEach((d, i) => { i === cur ? d.setAttribute("aria-current", "true") : d.removeAttribute("aria-current"); });
      prev.disabled = track.scrollLeft <= 2; next.disabled = atEnd;
    };
    track.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    prev.addEventListener("click", () => goTo(cur - 1));
    next.addEventListener("click", () => goTo(cur + 1));
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(cur + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); goTo(cur - 1); }
    });
    addEventListener("resize", build);
    build();
  });

  // Command palette
  const pal = $("#palette"), input = $("#palette-input"), list = $("#palette-list");
  const go = (id) => () => { const el = $(id); if (el) el.scrollIntoView({ behavior: "smooth" }); };
  const open = (u) => () => window.open(u, "_blank", "noopener");
  const cmds = [
    { t: "home", h: "go to", f: go("#home") }, { t: "projects", h: "go to", f: go("#projects") },
    { t: "experience & education", h: "go to", f: go("#experience") }, { t: "certificates", h: "go to", f: go("#certificates") },
    { t: "stack", h: "go to", f: go("#stack") }, { t: "contact", h: "go to", f: go("#contact") },
    { get t() { return "switch to " + (getTheme() === "dark" ? "light" : "dark") + " mode"; }, h: "action", f: toggleTheme },
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
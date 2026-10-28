// Achievements carousel: arrows, page dots, and autoplay that loops back to the start.
document.querySelectorAll(".carousel").forEach((carousel) => {
  const track = carousel.querySelector(".carousel-track");
  const dots = carousel.querySelector(".carousel-dots");
  const cards = track.children;
  const interval = Number(carousel.dataset.interval) || 5000;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let timer = null;
  let paused = false;

  const perPage = () =>
    Number(getComputedStyle(track).getPropertyValue("--per-page")) || 1;
  const pageCount = () => Math.ceil(cards.length / perPage());
  const offsetOf = (i) => cards[i].offsetLeft - cards[0].offsetLeft;

  // Each page starts on a card so it lines up with scroll snapping; the last
  // page starts early enough to end on the final card.
  const firstCardOf = (page) =>
    Math.max(0, Math.min(page * perPage(), cards.length - perPage()));

  const currentPage = () => {
    const step = cards[1] ? offsetOf(1) : 1;
    const first = Math.round(track.scrollLeft / step);
    if (first >= cards.length - perPage()) return pageCount() - 1;
    return Math.round(first / perPage());
  };

  const goTo = (page) => {
    const count = pageCount();
    page = ((page % count) + count) % count;
    track.scrollTo({ left: offsetOf(firstCardOf(page)) });
  };

  const renderDots = () => {
    dots.replaceChildren();
    for (let i = 0; i < pageCount(); i++) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Page ${i + 1}`);
      dot.addEventListener("click", () => { goTo(i); restart(); });
      dots.append(dot);
    }
    updateDots();
  };

  const updateDots = () => {
    const active = currentPage();
    [...dots.children].forEach((dot, i) =>
      dot.setAttribute("aria-selected", String(i === active)));
  };

  const restart = () => {
    clearInterval(timer);
    if (reduceMotion) return;
    timer = setInterval(() => {
      if (!paused && !document.hidden) goTo(currentPage() + 1);
    }, interval);
  };

  carousel.querySelectorAll(".carousel-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      goTo(currentPage() + Number(btn.dataset.dir));
      restart();
    }));

  // Pause while the visitor is reading or interacting.
  carousel.addEventListener("mouseenter", () => { paused = true; });
  carousel.addEventListener("mouseleave", () => { paused = false; });
  carousel.addEventListener("focusin", (e) => { paused = e.target.matches(":focus-visible"); });
  carousel.addEventListener("focusout", () => { paused = false; });
  track.addEventListener("touchstart", restart, { passive: true });

  let scrollFrame;
  track.addEventListener("scroll", () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(updateDots);
  });

  let lastPerPage = perPage();
  window.addEventListener("resize", () => {
    if (perPage() !== lastPerPage) {
      lastPerPage = perPage();
      renderDots();
    }
  });

  renderDots();
  restart();
});

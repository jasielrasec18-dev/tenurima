/**
 * Tenurima — comportamentos da página.
 *
 * Tudo aqui é vanilla JS, sem dependências. Cada bloco é isolado em uma
 * função de init que não faz nada se os elementos dela não existirem na
 * página — assim um componente ausente nunca derruba os outros.
 */


function initAccordion() {
  const items = Array.from(document.querySelectorAll(".accordion__item"));

  if (items.length === 0) return;

  function close(item) {
    item.classList.remove("active");
    item.querySelector(".accordion__header").setAttribute("aria-expanded", "false");
  }

  function open(item) {
    item.classList.add("active");
    item.querySelector(".accordion__header").setAttribute("aria-expanded", "true");
  }

  items.forEach((item) => {
    const header = item.querySelector(".accordion__header");

    if (!header) return;

    header.addEventListener("click", () => {
      const wasOpen = item.classList.contains("active");

      // Comportamento sanfona: só um item aberto por vez.
      items.forEach(close);

      if (!wasOpen) open(item);
    });
  });
}

/* ------------------------------------------------------------------ *
 * Slider de depoimentos
 *
 * Mostra 2 cards no desktop e 1 no mobile. O número de cards visíveis é
 * lido do próprio CSS (--testimonials-per-view), para que o breakpoint
 * fique definido em um lugar só — o CSS — e o JS apenas o obedeça.
 * ------------------------------------------------------------------ */

function initTestimonialsSlider() {
  const slider = document.querySelector(".testimonials-slider");
  
  if (!slider) return;

  const track = slider.querySelector(".testimonials-track");
  const cards = Array.from(slider.querySelectorAll(".testimonial-card"));
  const prevButton = slider.querySelector(".testimonials-arrow--prev");
  const nextButton = slider.querySelector(".testimonials-arrow--next");

  if (!track || cards.length === 0 || !prevButton || !nextButton) return;

  let index = 0;

  function perView() {
    const value = getComputedStyle(track).getPropertyValue("--testimonials-per-view");

    return Number.parseInt(value, 10) || 1;
  }

  function maxIndex() {
    return Math.max(0, cards.length - perView());
  }

  function render() {
    index = Math.min(index, maxIndex());

    // Desloca a trilha em pixels reais (largura do card + gap). Medir em
    // vez de calcular em % evita erro de arredondamento no gap.
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = cards[0].getBoundingClientRect().width + gap;

    track.style.transform = `translateX(-${index * step}px)`;

    prevButton.disabled = index === 0;
    nextButton.disabled = index >= maxIndex();

    cards.forEach((card, i) => {
      const visible = i >= index && i < index + perView();

      // Cards fora da área visível saem da ordem de tabulação.
      card.setAttribute("aria-hidden", visible ? "false" : "true");
      card.querySelectorAll("a, button").forEach((el) => {
        el.tabIndex = visible ? 0 : -1;
      });
    });
  }

  function go(step) {
    index = Math.min(Math.max(index + step, 0), maxIndex());
    render();
  }

  prevButton.addEventListener("click", () => go(-1));
  nextButton.addEventListener("click", () => go(1));

  // Navegação por teclado quando o slider está em foco.
  slider.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") go(-1);
    if (event.key === "ArrowRight") go(1);
  });

  // Arrastar com o dedo no mobile.
  let startX = null;

  slider.addEventListener("touchstart", (event) => {
    startX = event.touches[0].clientX;
  }, { passive: true });

  slider.addEventListener("touchend", (event) => {
    if (startX === null) return;

    const delta = event.changedTouches[0].clientX - startX;

    if (Math.abs(delta) > 50) go(delta < 0 ? 1 : -1);

    startX = null;
  });

  // Ao mudar de breakpoint, o número de cards visíveis muda e o índice
  // atual pode virar inválido — por isso re-renderiza no resize.
  let resizeTimer;

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 150);
  });

  render();
}


initAccordion();
initTestimonialsSlider();

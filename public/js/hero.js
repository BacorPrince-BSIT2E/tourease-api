(() => {
  const hero = document.querySelector(".hero");
  const layers = [...hero.querySelectorAll(".hero-slide")];
  const indicators = [...hero.querySelectorAll(".hero-dot")];
  const photos = [
    { src: "/images/tagaytay-1.jpg", description: "Ferris wheel at Sky Ranch", position: "center 38%" },
    { src: "/images/tagaytay-2.jpg", description: "Viewpoint over Taal Lake", position: "center 38%" },
    { src: "/images/tagaytay-3.jpg", description: "Tagaytay City sign", position: "center 56%" },
    { src: "/images/tagaytay-4.jpg", description: "Tagaytay Highlands chalets and golf course", position: "center 48%" },
    { src: "/images/tagaytay-5.jpg", description: "I love Tagaytay signpost", position: "center 52%" },
  ];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let order = [];
  let orderPosition = 0;
  let activeIndex = -1;
  let activeLayer = -1;
  let timer = null;

  // Shuffle each cycle and keep its first photo different from the last one shown.
  function shuffle(items, lastIndex = -1) {
    for (let index = items.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
    }
    if (items[0] === lastIndex) {
      const swapIndex = 1 + Math.floor(Math.random() * (items.length - 1));
      [items[0], items[swapIndex]] = [items[swapIndex], items[0]];
    }
    return items;
  }

  // Preload every photo before showing the first one.
  function preload() {
    return Promise.all(photos.map((photo) => new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve({ src: photo.src, loaded: true });
      image.onerror = () => resolve({ src: photo.src, loaded: false });
      image.src = photo.src;
    })));
  }

  function showPhoto(index) {
    const photo = photos[index];
    const nextLayer = (activeLayer + 1) % layers.length;
    const layer = layers[nextLayer];
    layer.style.backgroundImage = photo.loaded
      ? `url("${photo.src}")`
      : "linear-gradient(118deg, #ed8957 0%, #d67864 43%, #177b78 100%)";
    layer.style.backgroundPosition = photo.position;
    layer.setAttribute("aria-label", photo.description);
    layer.setAttribute("aria-hidden", "false");
    if (activeLayer !== -1) {
      layers[activeLayer].classList.remove("is-active");
      layers[activeLayer].setAttribute("aria-hidden", "true");
    }
    layer.classList.add("is-active");
    activeLayer = nextLayer;
    activeIndex = index;
    indicators.forEach((indicator, indicatorIndex) => {
      indicator.setAttribute("aria-pressed", String(indicatorIndex === index));
    });
  }

  // Advance through the shuffled cycle, then shuffle again.
  function showNext() {
    if (orderPosition >= order.length) {
      order = shuffle(photos.map((_, index) => index), activeIndex);
      orderPosition = 0;
    }
    showPhoto(order[orderPosition]);
    orderPosition += 1;
  }

  // Clear the timer while paused or before restarting it.
  function stop() {
    window.clearInterval(timer);
    timer = null;
  }

  // Run only when the page is visible and motion is allowed.
  function start() {
    stop();
    if (!reducedMotion.matches && document.visibilityState === "visible") {
      timer = window.setInterval(showNext, 6000);
    }
  }

  function selectPhoto(index) {
    order = [index, ...shuffle(photos.map((_, photoIndex) => photoIndex).filter((photoIndex) => photoIndex !== index))];
    orderPosition = 1;
    showPhoto(index);
    start();
  }

  indicators.forEach((indicator, index) => {
    indicator.disabled = reducedMotion.matches;
    indicator.addEventListener("click", () => selectPhoto(index));
  });

  document.addEventListener("visibilitychange", () => {
    hero.classList.toggle("is-paused", document.visibilityState === "hidden");
    if (document.visibilityState === "hidden") stop();
    else start();
  });

  reducedMotion.addEventListener("change", () => {
    indicators.forEach((indicator) => {
      indicator.disabled = reducedMotion.matches;
    });
    if (reducedMotion.matches) stop();
    else start();
  });

  preload().then((results) => {
    results.forEach((result) => {
      const photo = photos.find((item) => item.src === result.src);
      photo.loaded = result.loaded;
    });
    order = shuffle(photos.map((_, index) => index));
    showNext();
    hero.classList.toggle("is-paused", document.visibilityState === "hidden");
    start();
  });
})();

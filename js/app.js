/* =================================================
   NAV ACTIVE AUTO
================================================= */
(function () {
  const nav = document.getElementById("topNav");
  if (!nav) return;

  const links = nav.querySelectorAll("a");
  const path = location.pathname.replace(/\/+$/, "");

  links.forEach(a => a.classList.remove("active"));

  links.forEach(a => {
    const p = new URL(a.href).pathname.replace(/\/+$/, "");
    if (path === p || (p !== "/" && path.startsWith(p))) {
      a.classList.add("active");
    }
  });
})();

/* =================================================
   SCROLL TOP BUTTON
================================================= */
(function () {
  const btn = document.getElementById("scrollTopBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

/* =================================================
   OPTION B: CANVAS SCALE (1920 기준 좌표를 반응형으로)
   - .canvas 는 transform scale 적용
   - .canvas-wrap 이 실제 높이를 확보하도록 stage 높이 조정
================================================= */
(function () {
  const canvas = document.querySelector(".canvas");
  const wrap = document.querySelector(".canvas-wrap");
  const stage = document.querySelector(".stage");
  if (!canvas || !wrap || !stage) return;

  const BASE_W = 1920;

  function applyScale() {
    // wrap 너비(화면 기준) / 1920
    const wrapW = wrap.clientWidth;
    let s = wrapW / BASE_W;

    // 너무 커져서 깨지는 것 방지(상한)
    s = Math.min(s, 1.35);

    canvas.style.setProperty("--scale", s);

    // canvas의 실제 높이 확보(footer 아래 빈 공간 방지)
    const baseH = Number(canvas.getAttribute("data-height") || "0");
    if (baseH > 0) {
      stage.style.height = (baseH * s) + "px";
    }
  }

  window.addEventListener("resize", applyScale);
  applyScale();
})();

/* =================================================
   MAIN HERO SLIDER (있을 때만 동작)
   - 자동 전환
   - 페이드
   - 마우스 올리면 일시정지
   - 화살표 클릭 가능
================================================= */
(function () {
  const slider = document.querySelector(".hero-slider");
  const slides = document.querySelectorAll(".hero .slide");
  const prev = document.querySelector(".hero-control.prev");
  const next = document.querySelector(".hero-control.next");
  if (!slider || slides.length === 0) return;

  let index = 0;
  const INTERVAL = 4500; // 자동 전환 시간(원하시면 숫자만 바꾸시면 됩니다)
  let timer = null;
  let paused = false;

  function show(i) {
    slides.forEach(s => s.classList.remove("active"));
    slides[i].classList.add("active");
  }

  function nextSlide() {
    index = (index + 1) % slides.length;
    show(index);
  }

  function prevSlide() {
    index = (index - 1 + slides.length) % slides.length;
    show(index);
  }

  function start() {
    clearInterval(timer);
    timer = setInterval(() => {
      if (!paused) nextSlide();
    }, INTERVAL);
  }

  // 초기 시작
  start();

  if (next) next.addEventListener("click", () => { nextSlide(); start(); });
  if (prev) prev.addEventListener("click", () => { prevSlide(); start(); });

  slider.addEventListener("mouseenter", () => { paused = true; });
  slider.addEventListener("mouseleave", () => { paused = false; });
})();

/* =================================================
   DETAIL PAGE LOGIC (detail.html에서만 사용)
   - type/id 파라미터로 데이터 로드
   - 이미지 1장이면 고정, 여러 장이면 슬라이드
   - 텍스트 영역 지원
================================================= */
(function () {
  const hero = document.querySelector(".detail-hero");
  if (!hero) return;

  const params = new URLSearchParams(location.search);
  const type = params.get("type") || "";
  const id = params.get("id") || "";

  // ✅ 여기만 채우면 됩니다 (빈 템플릿)
  // images: ["assets/....png", "assets/....png"]
  // meta: "작품명, 연도, 재료, 사이즈"
  // text: "설명 텍스트(줄바꿈 가능)"
  const DETAIL_DATA = {
    // 예시:
    // "ink:1": { images:["assets/ink/detail/ink-01-01.png"], meta:"...", text:"..." },
    // "design:1": { images:["assets/design/detail/design-01-01.png","assets/design/detail/design-01-02.png"], meta:"...", text:"..." },
  };

  const key = `${type}:${id}`;
  const item = DETAIL_DATA[key];

  // 요소
  const slideHost = hero.querySelector(".detail-slides");
  const metaEl = document.querySelector("[data-detail-meta]");
  const textEl = document.querySelector("[data-detail-text]");
  const prevBtn = hero.querySelector(".detail-btn.prev");
  const nextBtn = hero.querySelector(".detail-btn.next");

  // 데이터 없으면 안내만
  if (!item) {
    if (metaEl) metaEl.textContent = "디테일 데이터가 아직 연결되지 않았습니다.";
    if (textEl) textEl.textContent = "js/app.js의 DETAIL_DATA에 해당 type/id를 추가해 주세요.";
    if (prevBtn) prevBtn.style.display = "none";
    if (nextBtn) nextBtn.style.display = "none";
    return;
  }

  const images = item.images || [];
  if (metaEl) metaEl.textContent = item.meta || "";
  if (textEl) textEl.textContent = item.text || "";

  // 슬라이드 생성
  slideHost.innerHTML = "";
  images.forEach((src, idx) => {
    const s = document.createElement("div");
    s.className = "slide" + (idx === 0 ? " active" : "");
    s.innerHTML = `<img src="${src}" alt="">`;
    slideHost.appendChild(s);
  });

  const slides = slideHost.querySelectorAll(".slide");
  let index = 0;

  function show(i) {
    slides.forEach(s => s.classList.remove("active"));
    slides[i].classList.add("active");
  }

  function next() {
    index = (index + 1) % slides.length;
    show(index);
  }
  function prev() {
    index = (index - 1 + slides.length) % slides.length;
    show(index);
  }

  // 1장이면 버튼 숨김
  if (slides.length <= 1) {
    if (prevBtn) prevBtn.style.display = "none";
    if (nextBtn) nextBtn.style.display = "none";
    return;
  }

  if (prevBtn) prevBtn.addEventListener("click", prev);
  if (nextBtn) nextBtn.addEventListener("click", next);
})();

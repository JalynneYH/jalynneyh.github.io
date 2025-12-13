/* =================================================
   옵션B: 1920 기준 캔버스 스케일
   - 창을 줄이면 전체가 비율대로 같이 줄어듭니다.
================================================= */
function applyCanvasScale() {
  const canvases = document.querySelectorAll(".canvas");
  canvases.forEach((canvas) => {
    const baseWidth = 1920;
    const vw = Math.min(window.innerWidth, document.documentElement.clientWidth);

    // ✅ “잉크/컬러처럼” = 줄이면 같이 줄어듦
    // 확대도 원하시면: const scale = vw / baseWidth; 로 바꾸시면 됩니다.
    const scale = Math.min(1, vw / baseWidth);

    canvas.style.setProperty("--scale", scale);

    // ✅ 스케일된 높이만큼 canvas-stage에 높이 부여(푸터/스크롤 안정)
    const h = parseFloat(canvas.getAttribute("data-height")) || 0;
    const stage = canvas.closest(".canvas-stage");
    if (stage && h) stage.style.height = (h * scale) + "px";
  });
}

window.addEventListener("load", applyCanvasScale);
window.addEventListener("resize", applyCanvasScale);

/* =================================================
   NAV ACTIVE AUTO
================================================= */
(function(){
  const nav = document.getElementById("topNav");
  if(!nav) return;

  const links = nav.querySelectorAll("a");
  const here = location.href.replace(/\/+$/,"");

  links.forEach(a => a.classList.remove("active"));
  links.forEach(a => {
    const href = a.href.replace(/\/+$/,"");
    if (here === href || (href !== a.origin + "/" && here.startsWith(href))) {
      a.classList.add("active");
    }
  });
})();

/* =================================================
   SCROLL TO TOP
================================================= */
(function(){
  const btn = document.getElementById("scrollTopBtn");
  if(!btn) return;
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

/* =================================================
   HERO SLIDER (메인에만 있을 때만 동작)
   - 자동재생 + 페이드 + 호버시 일시정지 + 화살표 클릭
================================================= */
(function(){
  const slider = document.querySelector(".hero-slider");
  const slides = document.querySelectorAll(".hero .slide");
  const prev = document.querySelector(".hero-control.prev");
  const next = document.querySelector(".hero-control.next");

  if(!slider || slides.length === 0) return;

  let index = 0;
  const INTERVAL = 4500;
  let timer = null;
  let paused = false;

  function show(i){
    slides.forEach(s => s.classList.remove("active"));
    slides[i].classList.add("active");
  }

  function nextSlide(){
    index = (index + 1) % slides.length;
    show(index);
  }

  function prevSlide(){
    index = (index - 1 + slides.length) % slides.length;
    show(index);
  }

  function start(){
    clearInterval(timer);
    timer = setInterval(() => {
      if(!paused) nextSlide();
    }, INTERVAL);
  }

  start();

  if(next) next.addEventListener("click", () => { nextSlide(); start(); });
  if(prev) prev.addEventListener("click", () => { prevSlide(); start(); });

  slider.addEventListener("mouseenter", () => paused = true);
  slider.addEventListener("mouseleave", () => paused = false);
})();

/* =================================================
   CANVAS OFFSET (메인 슬라이드-첫 썸네일 간격 줄이기)
   - 캔버스 내부 상단 빈 공간(top 시작값)을 위로 당겨서 제거
================================================= */
(function () {
  const wrap = document.querySelector(".canvas-wrap");
  const canvas = document.querySelector(".canvas");
  if (!wrap || !canvas) return;

  const BASE = 1920;
  const scale = Math.min(1, wrap.clientWidth / BASE);
  document.documentElement.style.setProperty("--scale", String(scale));

  // ✅ 1920 기준 캔버스 전체 높이
  const rawH = Number(canvas.dataset.height || 0);

  // ✅ 빈 상단 여백 제거(메인에만 data-offset 있음)
  const rawOffset = Number(canvas.dataset.offset || 0);

  // ✅ 위로 당기기 (스케일 반영)
  canvas.style.marginTop = (-rawOffset * scale) + "px";

  // ✅ 레이아웃이 깨지지 않게 "보이는 높이"만큼 wrapper 높이 확보
  // (전체높이 - offset) 를 스케일 적용
  const visibleH = Math.max(0, rawH - rawOffset) * scale;

  // canvas 자체는 transform으로 줄어들기 때문에
  // wrap에 실제 높이를 잡아줘야 footer/스크롤이 정상입니다.
  const stage = canvas.closest(".canvas-stage") || canvas.parentElement;
  if (stage) stage.style.height = visibleH + "px";
})();


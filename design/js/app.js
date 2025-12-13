/* =================================================
   NAV ACTIVE AUTO
================================================= */
(function(){
  const nav = document.getElementById("topNav");
  if(!nav) return;

  const links = nav.querySelectorAll("a");
  const path = location.pathname.replace(/\/+$/,"") || "/";

  links.forEach(a=>a.classList.remove("active"));
  links.forEach(a=>{
    const p = new URL(a.href).pathname.replace(/\/+$/,"") || "/";
    if(path === p || (p !== "/" && path.startsWith(p))) a.classList.add("active");
  });
})();

/* =================================================
   SCROLL TOP
================================================= */
(function(){
  const btn = document.getElementById("scrollTopBtn");
  if(!btn) return;

  btn.addEventListener("click",()=>{
    window.scrollTo({top:0,behavior:"smooth"});
  });
})();

/* =================================================
   HERO SLIDER (MAIN ONLY)
   - auto + fade + hover pause
================================================= */
(function(){
  const slider = document.querySelector(".hero-slider");
  if(!slider) return;

  const slides = slider.querySelectorAll(".slide");
  const prev = slider.querySelector(".hero-control.prev");
  const next = slider.querySelector(".hero-control.next");

  let index = 0;
  const INTERVAL = 4500; // 자동 전환 시간(ms)
  let timer = null;
  let paused = false;

  function show(i){
    slides.forEach(s=>s.classList.remove("active"));
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
    timer = setInterval(()=>{ if(!paused) nextSlide(); }, INTERVAL);
  }

  // 이벤트
  if(next) next.addEventListener("click",()=>{ nextSlide(); start(); });
  if(prev) prev.addEventListener("click",()=>{ prevSlide(); start(); });

  slider.addEventListener("mouseenter",()=> paused = true);
  slider.addEventListener("mouseleave",()=> paused = false);

  start();
})();

/* =================================================
   OPTION B: CANVAS SCALE (1920 좌표 반응형)
   - 캔버스 기준 폭(1920)을 화면폭에 맞게 스케일
   - 캔버스 랩 높이도 스케일된 값으로 맞춰서 스크롤 꼬임 방지
================================================= */
(function(){
  const wraps = document.querySelectorAll(".canvas-wrap");
  if(!wraps.length) return;

  function apply(){
    wraps.forEach(wrap=>{
      const baseW = 1920;
      const canvas = wrap.querySelector(".canvas");
      if(!canvas) return;

      const baseH = Number(canvas.dataset.height || canvas.getAttribute("data-height") || 1000);
      const viewportW = Math.min(window.innerWidth, document.documentElement.clientWidth);

      // 가운데 정렬 기준: 좌우 패딩 고려하지 않고, 화면에 맞춰 축소/확대
      const scale = Math.min(1, viewportW / baseW);

      wrap.style.setProperty("--scale", scale.toString());
      wrap.style.height = (baseH * scale) + "px";
    });
  }

  window.addEventListener("resize", apply);
  apply();
})();

/* =================================================
   DETAIL PAGE LOADER
   - detail.html?type=design&id=1 형태 지원
   - 디자인은 여러 이미지 자동 슬라이드
   - 컬러/잉크도 동일 구조로 사용 가능
================================================= */
(function(){
  const page = document.body.dataset.page;
  if(page !== "detail") return;

  const params = new URLSearchParams(location.search);
  const type = params.get("type") || "design";
  const id = params.get("id") || "1";

  // type별 base path (GitHub Pages: 서브 레포 경로 포함)
  const BASE = {
    main:        `/assets/main`,
    design:      `/design/assets/design`,
    color:       `/color-painting/assets/color`,
    ink:         `/ink-painting/assets/ink`,
  };

  // ====== 여기부터는 "텍스트 관리" 영역 ======
  // 작품 설명/메타를 여기서 수정하시면 됩니다.
  // 이미지 개수는 slides.length로 자동 처리됩니다.
  const DETAIL_TEXT = {
    // 예시: design 1
    "design:1": {
      meta: "사이탈모러들을 위한 탈모 예방 루틴 형성 서비스",
      desc: "여기에 설명을 입력하시면 됩니다.\n줄바꿈도 그대로 유지됩니다."
    },
    "ink:1": {
      meta: "백목, 2025, 순지에 수묵, 100×72.7cm",
      desc: "여기에 잉크 페인팅 설명을 입력하시면 됩니다."
    },
    "color:1": {
      meta: "작품명, 2025, 재료, 사이즈",
      desc: "여기에 컬러 페인팅 설명을 입력하시면 됩니다."
    }
  };
  // ====== 텍스트 관리 끝 ======

  // 이미지 파일 규칙:
  // /{type repo}/assets/{type}/{id}/01.png, 02.png, 03.png...
  // 몇 장인지 모르니, 01~12까지 시도 후 존재하는 것만 사용(404는 자동 제외)
  const maxTry = 12;
  const basePath = BASE[type] ? `${BASE[type]}/${id}` : `${BASE.design}/${id}`;

  const slider = document.querySelector(".detail-slider");
  const metaEl = document.querySelector(".detail-text .meta");
  const descEl = document.querySelector(".detail-text .desc");

  if(!slider) return;

  const key = `${type}:${id}`;
  const text = DETAIL_TEXT[key] || { meta: "", desc: "" };

  if(metaEl) metaEl.textContent = text.meta || "";
  if(descEl) descEl.textContent = text.desc || "";

  // 슬라이드 DOM 생성
  const slides = [];
  for(let i=1;i<=maxTry;i++){
    const num = String(i).padStart(2,"0");
    const src = `${basePath}/${num}.png`;

    const d = document.createElement("div");
    d.className = "dslide";
    const img = document.createElement("img");
    img.alt = `${type} ${id} ${num}`;
    img.src = src;

    // 로드 성공/실패 판단
    img.addEventListener("load", ()=>{
      if(!slides.length){
        d.classList.add("active");
      }
      slides.push(d);
      layoutSlides();
    });
    img.addEventListener("error", ()=>{
      d.remove();
      layoutSlides();
    });

    d.appendChild(img);
    slider.appendChild(d);
  }

  function layoutSlides(){
    // 슬라이더 높이 맞추기: 첫 이미지 기준(없으면 기본)
    // (CSS가 대부분 해결하지만, 슬라이드가 0이면 빈 화면이니 안내)
    const any = slider.querySelector(".dslide");
    if(!any){
      slider.innerHTML = `<div style="padding:80px 0;text-align:center;color:#bbb;">이미지 파일을 찾을 수 없습니다.<br/>assets 경로와 파일명을 확인해 주세요.</div>`;
      return;
    }
  }

  // 네비(좌우)
  const prevArea = document.querySelector(".detail-nav .prev");
  const nextArea = document.querySelector(".detail-nav .next");
  let idx = 0;
  let timer = null;
  const INTERVAL = 4500;
  let paused = false;

  function getSlides(){
    return Array.from(document.querySelectorAll(".detail-slider .dslide"));
  }
  function show(i){
    const s = getSlides();
    if(!s.length) return;
    s.forEach(x=>x.classList.remove("active"));
    s[i].classList.add("active");
  }
  function goNext(){
    const s = getSlides();
    if(s.length<=1) return;
    idx = (idx+1) % s.length;
    show(idx);
  }
  function goPrev(){
    const s = getSlides();
    if(s.length<=1) return;
    idx = (idx-1+s.length) % s.length;
    show(idx);
  }
  function start(){
    clearInterval(timer);
    timer = setInterval(()=>{ if(!paused) goNext(); }, INTERVAL);
  }

  if(nextArea) nextArea.addEventListener("click",()=>{ goNext(); start(); });
  if(prevArea) prevArea.addEventListener("click",()=>{ goPrev(); start(); });

  slider.addEventListener("mouseenter",()=> paused = true);
  slider.addEventListener("mouseleave",()=> paused = false);

  // 이미지가 2장 이상일 때만 자동 재생
  setTimeout(()=>{
    if(getSlides().length >= 2) start();
  }, 1200);
})();

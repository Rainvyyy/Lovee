/* =========================================================
   STAGE MANAGER
   ========================================================= */
const Stages = {
  els: {},
  init(order) {
    this.order = order;
    order.forEach((id) => (this.els[id] = document.getElementById(id)));
  },
  goTo(id) {
    const next = this.els[id];
    const current = document.querySelector(".stage--active");
    if (current === next) return;

    if (current) {
      current.classList.add("stage--leaving");
      current.classList.remove("stage--active");
      setTimeout(() => current.classList.remove("stage--leaving"), 900);
    }
    setTimeout(() => {
      next.classList.add("stage--active");
    }, current ? 250 : 0);
  },
};

/* =========================================================
   LOADING
   ========================================================= */
function runLoadingSequence() {
  const fill = document.getElementById("loading-bar-fill");
  const percentLabel = document.getElementById("loading-percent");
  let progress = 0;

  const interval = setInterval(() => {
    const step = progress < 70 ? Math.random() * 9 + 3 : Math.random() * 3 + 1;
    progress = Math.min(100, progress + step);
    fill.style.width = progress + "%";
    percentLabel.textContent = Math.floor(progress) + "%";

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => Stages.goTo("stage-password"), 500);
    }
  }, 180);
}

/* =========================================================
   PASSWORD
   ========================================================= */
function initPasswordScreen() {
  const dotsWrap = document.getElementById("password-dots");
  const dots = Array.from(dotsWrap.querySelectorAll(".dot"));
  const errorLabel = document.getElementById("password-error");
  const keypad = document.getElementById("keypad");
  const modalOverlay = document.getElementById("password-modal-overlay");
  const modalClueText = document.getElementById("password-modal-clue-text");
  const modalBtn = document.getElementById("password-modal-btn");

  let passwordClue = "Coba lagi.";
  try {
    const raw = document.getElementById("letter-data").textContent;
    const data = JSON.parse(raw);
    if (data.passwordClue) {
      passwordClue = data.passwordClue;
      if (modalClueText) modalClueText.textContent = passwordClue;
    }
  } catch (e) {}

  const MAX_LEN = dots.length;
  let entered = "";
  let locked = false;

  function renderDots() {
    dots.forEach((dot, i) => dot.classList.toggle("filled", i < entered.length));
  }

  function showError() {
    dotsWrap.classList.add("shake");
    setTimeout(() => dotsWrap.classList.remove("shake"), 500);
    entered = "";
    renderDots();
    if (modalOverlay) modalOverlay.classList.add("visible");
  }

  function hideError() {
    errorLabel.classList.remove("visible");
    if (modalOverlay) modalOverlay.classList.remove("visible");
  }

  if (modalBtn) {
    modalBtn.addEventListener("click", () => {
      modalOverlay.classList.remove("visible");
      locked = false;
    });
  }

  async function submit() {
    if (locked || entered.length === 0) return;
    locked = true;

    try {
      const res = await fetch("/api/check-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: entered }),
      });
      const data = await res.json();

      if (data.success) {
        hideError();
        dots.forEach((dot) => dot.style.setProperty("box-shadow", "0 0 16px rgba(243,205,138,0.95)"));
        setTimeout(() => Stages.goTo("stage-gift"), 700);
      } else {
        showError();
      }
    } catch (e) {
      showError();
    }
  }

  keypad.addEventListener("click", (e) => {
    const btn = e.target.closest(".key");
    if (!btn || locked) return;
    const value = btn.dataset.key;

    if (value === "back") {
      entered = entered.slice(0, -1);
      hideError();
    } else if (value === "ok") {
      submit();
      return;
    } else if (entered.length < MAX_LEN) {
      entered += value;
      hideError();
      if (entered.length === MAX_LEN) {
        submit();
      }
    }
    renderDots();
  });

  window.addEventListener("keydown", (e) => {
    if (!document.getElementById("stage-password").classList.contains("stage--active")) return;
    if (locked) return;

    if (/^[0-9]$/.test(e.key) && entered.length < MAX_LEN) {
      entered += e.key;
      hideError();
      renderDots();
      if (entered.length === MAX_LEN) submit();
    } else if (e.key === "Backspace") {
      entered = entered.slice(0, -1);
      hideError();
      renderDots();
    } else if (e.key === "Enter") {
      submit();
    }
  });
}

/* =========================================================
   GIFT
   ========================================================= */
function initGiftScreen() {
  const btn = document.getElementById("btn-open-gift");
  const music = document.getElementById("bg-music");

  btn.addEventListener("click", () => {
    music.volume = 0.5;
    music.play().catch(() => {});
    Stages.goTo("stage-envelope");
  });
}

/* =========================================================
   ENVELOPE
   ========================================================= */
function initEnvelopeScreen() {
  const seal = document.getElementById("wax-seal");
  const flapTop = document.getElementById("envelope-flap-top");
  const envelope = document.getElementById("envelope");
  const paper = document.getElementById("envelope-paper");
  let opened = false;

  seal.addEventListener("click", () => {
    if (opened) return;
    opened = true;

    seal.classList.add("cracked");
    setTimeout(() => flapTop.classList.add("open"), 250);
    setTimeout(() => envelope.classList.add("opened"), 750);
    setTimeout(() => paper.classList.add("zooming"), 1900);
    setTimeout(() => envelope.classList.add("fading"), 2050);
    setTimeout(() => Stages.goTo("stage-letter"), 2700);
  });
}

/* =========================================================
   LETTER
   ========================================================= */
function initLetterScreen() {
  const raw = document.getElementById("letter-data").textContent;
  const data = JSON.parse(raw);

  const dateEl = document.getElementById("letter-date");
  const headingEl = document.getElementById("letter-heading");
  const bodyEl = document.getElementById("letter-body");
  const subtitleEl = document.getElementById("letter-subtitle");
  const closingEl = document.getElementById("letter-closing");
  const signatureEl = document.getElementById("letter-signature");
  const continueBtn = document.getElementById("btn-after-letter");

  dateEl.textContent = data.date;
  headingEl.textContent = data.title;
  if (subtitleEl) subtitleEl.textContent = data.subtitle || "";
  if (closingEl) closingEl.textContent = data.closingQuestion || "";
  signatureEl.textContent = "— " + data.signature;

  let typed = false;

  function typeWriter(text, el, speed = 26) {
    return new Promise((resolve) => {
      let i = 0;
      const cursor = document.createElement("span");
      cursor.className = "typing-cursor";
      el.textContent = "";
      el.appendChild(cursor);

      function step() {
        if (i < text.length) {
          cursor.insertAdjacentText("beforebegin", text[i]);
          i++;
          setTimeout(step, speed);
        } else {
          cursor.remove();
          resolve();
        }
      }
      step();
    });
  }

  async function playLetter() {
    if (typed) return;
    typed = true;
    await typeWriter(data.body, bodyEl);
    if (closingEl && closingEl.textContent) {
      closingEl.classList.add("visible");
    }
    signatureEl.classList.add("visible");
    continueBtn.classList.add("visible");
  }

  const observer = new MutationObserver(() => {
    if (document.getElementById("stage-letter").classList.contains("stage--active")) {
      playLetter();
    }
  });
  observer.observe(document.getElementById("stage-letter"), { attributes: true, attributeFilter: ["class"] });

  continueBtn.addEventListener("click", () => Stages.goTo("stage-hub"));
}

/* =========================================================
   HUB
   ========================================================= */
function initHubScreen() {
  const cards = Array.from(document.querySelectorAll(".hub-card"));
  const continueBtn = document.getElementById("btn-after-hub");
  const visited = new Set();

  function refreshContinueState() {
    const allVisited = cards.every((card) => visited.has(card.dataset.key));
    continueBtn.disabled = !allVisited;
  }

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      visited.add(card.dataset.key);
      card.classList.add("hub-card--visited");
      refreshContinueState();
      Stages.goTo(card.dataset.target);
    });
  });

  continueBtn.addEventListener("click", () => {
    if (continueBtn.disabled) return;
    Stages.goTo("stage-ending");
  });

  document.querySelectorAll(".btn-back[data-back-to]").forEach((btn) => {
    btn.addEventListener("click", () => Stages.goTo(btn.dataset.backTo));
  });
}

/* =========================================================
   GALLERY
   ========================================================= */
function initGalleryScreen() {
  const grid = document.getElementById("gallery-grid");
  let loaded = false;

  // Pola ukuran foto yang diulang bergiliran supaya layout terasa
  // "organik" (seperti tempel-tempel scrapbook), bukan grid kaku.
  // Mau ubah rasa layoutnya? Ubah urutan/isi array ini.
  const SIZE_PATTERN = ["", "gallery-card--tall", "", "gallery-card--wide", "", "", "gallery-card--tall", ""];

  function getQuote() {
    try {
      const raw = document.getElementById("letter-data").textContent;
      const data = JSON.parse(raw);
      return data.galleryQuote || "";
    } catch (e) {
      return "";
    }
  }

  function quoteCardHTML() {
    const quote = getQuote();
    if (!quote) return "";
    return `
      <div class="quote-card" id="gallery-quote-card">
        <span class="quote-card-icon"><svg viewBox="0 0 100 100"><use href="#icon-camera-shape"></use></svg></span>
        <p class="quote-card-text" id="gallery-quote-text">${quote}</p>
      </div>`;
  }

  async function loadGallery() {
    if (loaded) return;
    loaded = true;

    try {
      const res = await fetch("/api/gallery");
      const data = await res.json();
      const images = data.images || [];

      if (images.length === 0) {
        grid.innerHTML = `
          <div class="gallery-card--empty">
            Taruh foto kalian di folder<br><code>static/gallery/</code>
          </div>` + quoteCardHTML();
        return;
      }

      const photoCards = images
        .map((src, i) => {
          const sizeClass = SIZE_PATTERN[i % SIZE_PATTERN.length];
          return `
          <div class="gallery-card ${sizeClass}" style="animation-delay:${i * 0.08}s">
            <img src="${src}" alt="Kenangan ${i + 1}" loading="lazy">
          </div>`;
        });

      // Sisipkan kartu kutipan di tengah-tengah urutan foto supaya
      // posisinya menyatu dengan alur scrapbook, bukan nempel di ujung.
      const midpoint = Math.min(2, photoCards.length);
      photoCards.splice(midpoint, 0, quoteCardHTML());

      grid.innerHTML = photoCards.join("");
    } catch (e) {
      grid.innerHTML = `<div class="gallery-card--empty">Galeri tidak dapat dimuat.</div>`;
    }
  }

  const observer = new MutationObserver(() => {
    if (document.getElementById("stage-gallery").classList.contains("stage--active")) {
      loadGallery();
    }
  });
  observer.observe(document.getElementById("stage-gallery"), { attributes: true, attributeFilter: ["class"] });
}

/* =========================================================
   FLOWER
   ========================================================= */
function initFlowerScreen() {
  const prefixEl = document.getElementById("flower-title-prefix");
  const scriptEl = document.getElementById("flower-title-script");
  const descEl = document.getElementById("flower-description");
  let built = false;

  function populate() {
    if (built) return;
    built = true;

    try {
      const raw = document.getElementById("letter-data").textContent;
      const data = JSON.parse(raw);
      prefixEl.textContent = data.flowerTitlePrefix || "";
      scriptEl.textContent = data.flowerTitleScript || "";
      descEl.textContent = data.flowerDescription || "";
    } catch (e) {}
  }

  const observer = new MutationObserver(() => {
    if (document.getElementById("stage-flower").classList.contains("stage--active")) {
      populate();
    }
  });
  observer.observe(document.getElementById("stage-flower"), { attributes: true, attributeFilter: ["class"] });
}

/* =========================================================
   MUSIC
   ========================================================= */
function initMusicScreen() {
  const photosEl = document.getElementById("music-photos");
  const heroLabelEl = document.getElementById("music-hero-label");
  const heroArtistEl = document.getElementById("music-hero-artist");
  const playBtn = document.getElementById("music-play-btn");
  const music = document.getElementById("bg-music");
  const progressFill = document.getElementById("music-progress-fill");
  const currentTimeEl = document.getElementById("music-current-time");
  const durationEl = document.getElementById("music-duration");
  const progressBar = document.getElementById("music-progress-bar");
  let built = false;
  let isDragging = false;

  function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function updateProgress() {
    if (!isDragging && music.duration) {
      const percent = (music.currentTime / music.duration) * 100;
      progressFill.style.width = percent + "%";
      currentTimeEl.textContent = formatTime(music.currentTime);
    }
  }

  function updateDuration() {
    if (music.duration) {
      durationEl.textContent = formatTime(music.duration);
    }
  }

  const cover = document.querySelector(".music-player-cover");

  music.addEventListener("timeupdate", updateProgress);
  music.addEventListener("loadedmetadata", updateDuration);

  music.addEventListener("ended", () => {
    progressFill.style.width = "0%";
    currentTimeEl.textContent = "0:00";
    updatePlayButtonIcon();
  });

  function updatePlayButtonIcon() {
    playBtn.textContent = music.paused ? "▶" : "⏸";
  }

  function togglePlay() {
    if (music.paused) {
      music.volume = music.volume || 0.5;
      music.play().catch(() => {});
    } else {
      music.pause();
    }
  }

  music.addEventListener("play", updatePlayButtonIcon);
  music.addEventListener("pause", updatePlayButtonIcon);

  playBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePlay();
  });
  if (cover) cover.addEventListener("click", togglePlay);

  progressBar.addEventListener("click", (e) => {
    if (!music.duration) return;
    const rect = progressBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    music.currentTime = percent * music.duration;
    updateProgress();
  });

  progressBar.addEventListener("mousedown", (e) => {
    isDragging = true;
    const rect = progressBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (music.duration) {
      music.currentTime = percent * music.duration;
      updateProgress();
    }
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const rect = progressBar.getBoundingClientRect();
    let percent = (e.clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    if (music.duration) {
      music.currentTime = percent * music.duration;
      updateProgress();
    }
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
  });

  function loadData() {
    let photos = [];
    try {
      const raw = document.getElementById("letter-data").textContent;
      const data = JSON.parse(raw);
      if (heroLabelEl && data.musicHeroLabel) heroLabelEl.textContent = data.musicHeroLabel;
      if (heroArtistEl && data.musicHeroCaption) heroArtistEl.textContent = data.musicHeroCaption;
      photos = Array.isArray(data.musicPhotos) ? data.musicPhotos : [];
    } catch (e) {
      photos = [];
    }
    return photos;
  }

  function renderPhotos(photos) {
    if (photos.length === 0) {
      photosEl.innerHTML = `<div class="music-photo--empty">Tambahkan foto di konfigurasi MUSIC_PHOTOS</div>`;
      return;
    }
    photosEl.innerHTML = photos
      .map((file) => {
        const url = `/static/images/${file}`;
        return `
        <span class="image-slot music-photo" title="static/images/${file}">
          <img src="${url}" alt="Kenangan" 
               onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <span class="image-slot-placeholder image-slot-placeholder--tiny">${file}</span>
        </span>`;
      })
      .join("");
  }

  function build() {
    if (built) return;
    built = true;
    const photos = loadData();
    renderPhotos(photos);
    updatePlayButtonIcon();
  }

  const observer = new MutationObserver(() => {
    if (document.getElementById("stage-music").classList.contains("stage--active")) {
      build();
      updateDuration();
    }
  });
  observer.observe(document.getElementById("stage-music"), { attributes: true, attributeFilter: ["class"] });
}

/* =========================================================
   ENDING
   ========================================================= */
function initEndingScreen() {
  const raw = document.getElementById("letter-data").textContent;
  const data = JSON.parse(raw);

  document.getElementById("ending-headline").textContent = data.endingHeadline;
  document.getElementById("ending-subline").textContent = data.endingSubline;

  document.getElementById("btn-replay").addEventListener("click", () => {
    location.reload();
  });
}

/* =========================================================
   BOOTSTRAP
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  Stages.init([
    "stage-loading",
    "stage-password",
    "stage-gift",
    "stage-envelope",
    "stage-letter",
    "stage-hub",
    "stage-gallery",
    "stage-flower",
    "stage-music",
    "stage-ending",
  ]);
  initPasswordScreen();
  initGiftScreen();
  initEnvelopeScreen();
  initLetterScreen();
  initHubScreen();
  initGalleryScreen();
  initFlowerScreen();
  initMusicScreen();
  initEndingScreen();
  runLoadingSequence();
});
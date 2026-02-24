// app.js
// Plain global JS, no modules.

// -------------------
// Data generator
// -------------------
const TAGS = [
  "Coffee","Hiking","Movies","Live Music","Board Games","Cats","Dogs","Traveler",
  "Foodie","Tech","Art","Runner","Climbing","Books","Yoga","Photography"
];
const FIRST_NAMES = [
  "Alex","Sam","Jordan","Taylor","Casey","Avery","Riley","Morgan","Quinn","Cameron",
  "Jamie","Drew","Parker","Reese","Emerson","Rowan","Shawn","Harper","Skyler","Devon"
];
const CITIES = [
  "Brooklyn","Manhattan","Queens","Jersey City","Hoboken","Astoria",
  "Williamsburg","Bushwick","Harlem","Lower East Side"
];
const JOBS = [
  "Product Designer","Software Engineer","Data Analyst","Barista","Teacher",
  "Photographer","Architect","Chef","Nurse","Marketing Manager","UX Researcher"
];
const BIOS = [
  "Weekend hikes and weekday lattes.",
  "Dog parent. Amateur chef. Karaoke enthusiast.",
  "Trying every taco in the city — for science.",
  "Bookstore browser and movie quote machine.",
  "Gym sometimes, Netflix always.",
  "Looking for the best slice in town.",
  "Will beat you at Mario Kart.",
  "Currently planning the next trip."
];

const UNSPLASH_SEEDS = [
  "1515462277126-2b47b9fa09e6",
  "1520975916090-3105956dac38",
  "1519340241574-2cec6aef0c01",
  "1554151228-14d9def656e4",
  "1548142813-c348350df52b",
  "1517841905240-472988babdf9",
  "1535713875002-d1d0cf377fde",
  "1545996124-0501ebae84d0",
  "1524504388940-b1c1722653e1",
  "1531123897727-8f129e1688ce",
];

function sample(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickTags() { return Array.from(new Set(Array.from({length:4}, ()=>sample(TAGS)))); }
function imgFor(seed) {
  return `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=1200&q=80`;
}

function generateProfiles(count = 12) {
  const profiles = [];
  for (let i = 0; i < count; i++) {
    profiles.push({
      id: `p_${i}_${Date.now().toString(36)}`,
      name: sample(FIRST_NAMES),
      age: 18 + Math.floor(Math.random() * 22),
      city: sample(CITIES),
      title: sample(JOBS),
      bio: sample(BIOS),
      tags: pickTags(),
      img: imgFor(sample(UNSPLASH_SEEDS)),
    });
  }
  return profiles;
}

// -------------------
// UI rendering
// -------------------
const deckEl = document.getElementById("deck");
const shuffleBtn = document.getElementById("shuffleBtn");
const likeBtn = document.getElementById("likeBtn");
const nopeBtn = document.getElementById("nopeBtn");
const superLikeBtn = document.getElementById("superLikeBtn");

let profiles = [];

function renderDeck() {
  deckEl.setAttribute("aria-busy", "true");
  deckEl.innerHTML = "";

  profiles.forEach((p, idx) => {
    const card = document.createElement("article");
    card.className = "card";
    card.tabIndex = 0;

    const img = document.createElement("img");
    img.className = "card__media";
    img.src = p.img;
    img.alt = `${p.name} — profile photo`;

    const body = document.createElement("div");
    body.className = "card__body";

    const titleRow = document.createElement("div");
    titleRow.className = "title-row";
    titleRow.innerHTML = `
      <h2 class="card__title">${p.name}</h2>
      <span class="card__age">${p.age}</span>
    `;

    const meta = document.createElement("div");
    meta.className = "card__meta";
    meta.textContent = `${p.title} • ${p.city}`;

    const chips = document.createElement("div");
    chips.className = "card__chips";
    p.tags.forEach((t) => {
      const c = document.createElement("span");
      c.className = "chip";
      c.textContent = t;
      chips.appendChild(c);
    });

    body.appendChild(titleRow);
    body.appendChild(meta);
    body.appendChild(chips);

    card.appendChild(img);
    card.appendChild(body);

    // add action badges
    const badgeLike = document.createElement('div');
    badgeLike.className = 'card__badge card__badge--like';
    badgeLike.textContent = 'LIKE';

    const badgeNope = document.createElement('div');
    badgeNope.className = 'card__badge card__badge--nope';
    badgeNope.textContent = 'NOPE';

    const badgeSuper = document.createElement('div');
    badgeSuper.className = 'card__badge card__badge--super';
    badgeSuper.textContent = 'SUPER';

    card.appendChild(badgeLike);
    card.appendChild(badgeNope);
    card.appendChild(badgeSuper);

    deckEl.appendChild(card);

    // Pointer-based swipe handling (only active on the top card)
    (function attachPointerHandlers(cardEl, profile) {
      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let lastTap = 0;
      let lastTapX = 0;
      let lastTapY = 0;
      const likeEl = cardEl.querySelector('.card__badge--like');
      const nopeEl = cardEl.querySelector('.card__badge--nope');
      const superEl = cardEl.querySelector('.card__badge--super');

      function onPointerDown(ev) {
        // Only allow dragging the topmost card
        if (cardEl !== deckEl.lastElementChild) return;
        cardEl.setPointerCapture(ev.pointerId);
        isDragging = true;
        startX = ev.clientX;
        startY = ev.clientY;
        cardEl.style.transition = 'none';
        // double-tap detection (pointerdown). only when not dragging
        const now = Date.now();
        const dxTap = Math.abs(ev.clientX - lastTapX);
        const dyTap = Math.abs(ev.clientY - lastTapY);
        if (now - lastTap < 350 && dxTap < 20 && dyTap < 20) {
          openGallery(profile);
          lastTap = 0;
        } else {
          lastTap = now;
          lastTapX = ev.clientX;
          lastTapY = ev.clientY;
        }
      }

      function onPointerMove(ev) {
        if (!isDragging) return;
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        const rot = dx * 0.05;
        cardEl.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
        const opacity = Math.max(0.35, 1 - Math.abs(dx) / 600);
        cardEl.style.opacity = String(opacity);
        // update badges based on drag
        const strength = Math.min(Math.abs(dx) / 150, 1);
        if (dx > 0) {
          likeEl.style.opacity = String(strength);
          likeEl.style.transform = `scale(${0.9 + 0.2 * strength})`;
          nopeEl.style.opacity = '0';
        } else if (dx < 0) {
          nopeEl.style.opacity = String(strength);
          nopeEl.style.transform = `scale(${0.9 + 0.2 * strength})`;
          likeEl.style.opacity = '0';
        } else {
          likeEl.style.opacity = '0';
          nopeEl.style.opacity = '0';
        }

        const superStrength = Math.min(-dy / 150, 1);
        if (dy < 0) {
          superEl.style.opacity = String(Math.max(0, superStrength));
          superEl.style.transform = `scale(${0.9 + 0.2 * Math.max(0, superStrength)})`;
        } else {
          superEl.style.opacity = '0';
        }
      }

      function release(ev) {
        if (!isDragging) return;
        isDragging = false;
        try { cardEl.releasePointerCapture(ev.pointerId); } catch (e) {}
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        const HORIZONTAL_THRESHOLD = 120;
        const UP_THRESHOLD = -150;

        if (dx > HORIZONTAL_THRESHOLD) {
          performAction('like');
        } else if (dx < -HORIZONTAL_THRESHOLD) {
          performAction('nope');
        } else if (dy < UP_THRESHOLD) {
          performAction('superlike');
        } else {
          // snap back
          cardEl.style.transition = 'transform 220ms ease, opacity 220ms ease';
          cardEl.style.transform = 'translateY(0) scale(1)';
          cardEl.style.opacity = '1';
          // hide badges
          const likeEl2 = cardEl.querySelector('.card__badge--like');
          const nopeEl2 = cardEl.querySelector('.card__badge--nope');
          const superEl2 = cardEl.querySelector('.card__badge--super');
          if (likeEl2) { likeEl2.style.opacity = '0'; likeEl2.style.transform = 'scale(1)'; }
          if (nopeEl2) { nopeEl2.style.opacity = '0'; nopeEl2.style.transform = 'scale(1)'; }
          if (superEl2) { superEl2.style.opacity = '0'; superEl2.style.transform = 'scale(1)'; }
        }
      }

      cardEl.addEventListener('pointerdown', onPointerDown);
      cardEl.addEventListener('pointermove', onPointerMove);
      cardEl.addEventListener('pointerup', release);
      cardEl.addEventListener('pointercancel', release);
    })(card, p);
  });

  deckEl.removeAttribute("aria-busy");
}

function resetDeck() {
  profiles = generateProfiles(12);
  renderDeck();
}

// Accessibility announcer for spoken feedback
let _announcer = document.getElementById('announcer');
if (!_announcer) {
  _announcer = document.createElement('div');
  _announcer.id = 'announcer';
  _announcer.setAttribute('aria-live', 'polite');
  _announcer.style.position = 'absolute';
  _announcer.style.left = '-9999px';
  document.body.appendChild(_announcer);
}

function announce(msg) {
  _announcer.textContent = '';
  // small delay to ensure assistive tech notices changes
  setTimeout(() => { _announcer.textContent = msg; }, 50);
}

function performAction(action) {
  const card = deckEl.lastElementChild;
  if (!card) return;
  const profile = profiles.pop();
  // briefly show the matching badge for feedback
  const likeBadge = card.querySelector('.card__badge--like');
  const nopeBadge = card.querySelector('.card__badge--nope');
  const superBadge = card.querySelector('.card__badge--super');
  if (action === 'like' && likeBadge) { likeBadge.style.opacity = '1'; likeBadge.style.transform = 'scale(1.08)'; }
  if (action === 'nope' && nopeBadge) { nopeBadge.style.opacity = '1'; nopeBadge.style.transform = 'scale(1.08)'; }
  if (action === 'superlike' && superBadge) { superBadge.style.opacity = '1'; superBadge.style.transform = 'scale(1.08)'; }

  card.style.transition = 'transform 320ms ease-out, opacity 320ms ease-out';

  let tx = 0, ty = 0, rot = 0;
  if (action === 'like') { tx = 1000; rot = 25; }
  else if (action === 'nope') { tx = -1000; rot = -25; }
  else if (action === 'superlike') { ty = -1000; rot = 0; }

  // apply motion
  card.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg)`;
  card.style.opacity = '0.02';

  setTimeout(() => {
    renderDeck();
    announce(`${action === 'like' ? 'Liked' : action === 'nope' ? 'Noped' : 'Super liked'} ${profile.name}, ${profile.age}`);
  }, 360);
}

// Open a simple gallery overlay showing more photos for the profile
function openGallery(profile) {
  // Build gallery images by sampling additional seeds
  const gallery = [profile.img];
  for (let i = 0; i < 3; i++) {
    gallery.push(imgFor(sample(UNSPLASH_SEEDS)));
  }

  const overlay = document.createElement('div');
  overlay.className = 'gallery-overlay';
  overlay.innerHTML = `
    <div class="gallery">
      <button class="gallery__close" aria-label="Close gallery">✕</button>
      <img class="gallery__img" src="${gallery[0]}" alt="${profile.name} photo" />
      <div class="gallery__nav">
        <button class="gallery__prev">‹</button>
        <button class="gallery__next">›</button>
      </div>
      <div class="gallery__meta">${profile.name}, ${profile.age} — ${profile.title}</div>
    </div>
  `;

  let idx = 0;
  const imgEl = overlay.querySelector('.gallery__img');
  const prevBtn = overlay.querySelector('.gallery__prev');
  const nextBtn = overlay.querySelector('.gallery__next');
  const closeBtn = overlay.querySelector('.gallery__close');

  function show(i) {
    idx = (i + gallery.length) % gallery.length;
    imgEl.src = gallery[idx];
  }

  prevBtn.addEventListener('click', () => show(idx - 1));
  nextBtn.addEventListener('click', () => show(idx + 1));
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', onKey);

  function onKey(e) {
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  }

  function close() {
    document.removeEventListener('keydown', onKey);
    document.body.removeChild(overlay);
    document.body.style.overflow = '';
  }

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  closeBtn.focus();
}

// Controls wired to actions
likeBtn.addEventListener('click', () => performAction('like'));
nopeBtn.addEventListener('click', () => performAction('nope'));
superLikeBtn.addEventListener('click', () => performAction('superlike'));
shuffleBtn.addEventListener('click', resetDeck);

// Keyboard shortcuts for quick actions (when not typing)
document.addEventListener('keydown', (ev) => {
  const tag = document.activeElement && document.activeElement.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  if (ev.key === 'ArrowRight') performAction('like');
  else if (ev.key === 'ArrowLeft') performAction('nope');
  else if (ev.key === 'ArrowUp') performAction('superlike');
});

// Boot
resetDeck();

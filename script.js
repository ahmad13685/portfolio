/* =====================================================================
   AHMAD'S DESKTOP
   1 Helpers · 2 Config · 3 Windows & dock · 4 Contact · 5 Wallpaper
   6 Lock screen · 7 Keyboard · 8 Music · 9 Projects · 10 WhatsApp · 11 Polish
   ===================================================================== */

/* ---------- 1. Helpers ---------- */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const toast = $('#toast');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobileSheet = () => window.innerWidth <= 700;
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } },
  remove(k) { try { localStorage.removeItem(k); } catch { /* ignore */ } }
};
// Keep Tab inside a modal (wallpaper sheet, WhatsApp form).
function trapTab(container, e) {
  if (e.key !== 'Tab') return;
  const items = $$('button:not([hidden]), input, textarea, a[href]', container).filter(n => !n.disabled && n.offsetParent !== null);
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

/* ---------- 2. Config (edit these) ---------- */
const PORTFOLIO_CONFIG = {
  email: 'ahmadraza34018@gmail.com',
  github: 'https://github.com/ahmad13685',
  linkedin: 'https://www.linkedin.com/in/ahmad-raza-92baa633a/',
  instagram: '',
  whatsapp: '923192347309'          // country code + number, digits only
};

/* ---------- 3. Windows & dock ---------- */
const windowLayer = $('#windowLayer');
let zTop = 10;
let windowOpener = null;

function syncDock() {
  $$('.dock [data-open]').forEach(btn => {
    const win = $(`#window-${btn.dataset.open}`);
    const open = !!win && !win.hidden;
    btn.classList.toggle('is-open', open);
    if (open) btn.setAttribute('aria-current', 'true'); else btn.removeAttribute('aria-current');
  });
}
function resetWindowPosition(win) {
  ['inset', 'margin', 'left', 'top', 'transform', 'transition'].forEach(p => { win.style[p] = ''; });
}
function placeWindow(win, left, top) {
  const layer = windowLayer.getBoundingClientRect();
  const maxLeft = Math.max(8, layer.width - win.offsetWidth - 8);
  const maxTop = Math.max(0, layer.height - 64);
  win.style.inset = 'auto';
  win.style.margin = '0';
  win.style.left = `${Math.min(maxLeft, Math.max(8, left))}px`;
  win.style.top = `${Math.min(maxTop, Math.max(0, top))}px`;
}
function openWindow(name, opener) {
  const target = $(`#window-${name}`);
  if (!target || locked) return;
  const wasOpen = !target.hidden;
  $$('.app-window').forEach(win => { if (win !== target) win.hidden = true; });
  if (!wasOpen) { resetWindowPosition(target); target.hidden = false; }
  target.style.zIndex = String(++zTop);
  windowOpener = opener || document.activeElement;
  syncDock();
  target.focus({ preventScroll: true });
}
function closeWindow(name) {
  const target = $(`#window-${name}`);
  if (!target || target.hidden) return;
  target.hidden = true;
  syncDock();
  if (windowOpener && document.contains(windowOpener) && windowOpener.offsetParent !== null) windowOpener.focus({ preventScroll: true });
}
function closeAllWindows() {
  $$('.app-window').forEach(win => { win.hidden = true; });
  syncDock();
}
$$('[data-open]').forEach(button => button.addEventListener('click', () => openWindow(button.dataset.open, button)));
$$('[data-close]').forEach(button => button.addEventListener('click', () => closeWindow(button.dataset.close)));

// Title bar: drag the window on desktop, swipe it down to dismiss on phones.
$$('.app-window').forEach(win => {
  const bar = $('.window-bar', win);
  let mode = null, startX = 0, startY = 0, baseLeft = 0, baseTop = 0, dy = 0;
  bar.addEventListener('pointerdown', event => {
    if (event.target.closest('button') || event.button > 0) return;
    startX = event.clientX; startY = event.clientY; dy = 0;
    if (isMobileSheet()) {
      mode = 'sheet';
      win.style.transition = 'none';
    } else {
      mode = 'drag';
      const rect = win.getBoundingClientRect();
      const layer = windowLayer.getBoundingClientRect();
      baseLeft = rect.left - layer.left; baseTop = rect.top - layer.top;
      placeWindow(win, baseLeft, baseTop);
    }
    win.style.zIndex = String(++zTop);
    bar.setPointerCapture(event.pointerId);
  });
  bar.addEventListener('pointermove', event => {
    if (!mode) return;
    if (mode === 'drag') placeWindow(win, baseLeft + event.clientX - startX, baseTop + event.clientY - startY);
    else { dy = Math.max(0, event.clientY - startY); win.style.transform = `translateY(${dy}px)`; }
  });
  const end = event => {
    if (!mode) return;
    const wasSheet = mode === 'sheet';
    mode = null;
    if (!wasSheet) return;
    win.style.transition = 'transform .3s cubic-bezier(.22,.8,.24,1)';
    if (event.type === 'pointerup' && dy > 90) { closeWindow(win.dataset.window); resetWindowPosition(win); }
    else win.style.transform = '';
  };
  bar.addEventListener('pointerup', end);
  bar.addEventListener('pointercancel', end);
});
// Keep a dragged window on screen if the viewport changes.
window.addEventListener('resize', () => {
  $$('.app-window').forEach(win => {
    if (win.hidden) return;
    if (isMobileSheet()) resetWindowPosition(win);
    else if (win.style.left) placeWindow(win, parseFloat(win.style.left), parseFloat(win.style.top));
  });
});

/* ---------- 4. Contact: email, socials, clock ---------- */
$('#emailText').textContent = PORTFOLIO_CONFIG.email;
$('#mailtoBtn').href = `mailto:${PORTFOLIO_CONFIG.email}?subject=${encodeURIComponent('Hello Ahmad')}`;
$('#copyEmail').addEventListener('click', async () => {
  const email = PORTFOLIO_CONFIG.email;
  const done = () => {
    showToast('Email copied to clipboard');
    const btn = $('#copyEmail');
    btn.textContent = 'Copied'; btn.classList.add('is-done');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('is-done'); }, 1800);
  };
  try { await navigator.clipboard.writeText(email); done(); }
  catch {
    // Older browsers / insecure contexts: select the text so it can be copied by hand.
    const range = document.createRange(); range.selectNodeContents($('#emailText'));
    const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
    showToast('Press Ctrl/Cmd + C to copy');
  }
});
$$('[data-social]').forEach(link => {
  const url = PORTFOLIO_CONFIG[link.dataset.social];
  if (url) { link.href = url; return; }
  link.addEventListener('click', e => { e.preventDefault(); showToast('That link is coming soon'); });
});
function updateClock() {
  $('#clock').textContent = new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(new Date());
}
updateClock();
setInterval(updateClock, 30000);
$('#year').textContent = new Date().getFullYear();

/* ---------- 5. Wallpaper manager (presets + your own photo) ---------- */
const WALL_KEY = 'portfolio.wallpaper';
const CUSTOM_KEY = 'portfolio.wallpaper.custom';
const DEFAULT_WALL = 'eclipse';
const WALL_NAMES = { eclipse: 'Eclipse', mono: 'Mono', aurora: 'Aurora', onyx: 'Onyx', graphite: 'Graphite', slate: 'Slate', snow: 'Snow', silver: 'Silver', custom: 'Your photo' };
const LIGHT_WALLPAPERS = ['mono', 'snow', 'silver'];   // everything else uses the dark theme
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXT = /\.(jpe?g|png|webp)$/i;
const MAX_FILE_MB = 30;       // refuse absurdly large files
const MAX_SIDE_PX = 2000;     // photo is resized to this before saving

const wallInput = $('#wallpaperInput');
const wallBase = $('#wallpaperImage');
const themeMeta = $('meta[name="theme-color"]');
let customWallpaper = null;

function setCustomImage(dataUrl) {
  customWallpaper = dataUrl;
  document.documentElement.style.setProperty('--custom-wall', `url("${dataUrl}")`);
  $$('[data-wall="custom"]').forEach(el => { el.hidden = false; });
  $('#wallRemove').hidden = false;
}
function clearCustomImage() {
  customWallpaper = null;
  document.documentElement.style.removeProperty('--custom-wall');
  $$('[data-wall="custom"]').forEach(el => { el.hidden = true; });
  $('#wallRemove').hidden = true;
  store.remove(CUSTOM_KEY);
}
// Fade from the old wallpaper to the new one instead of snapping.
function crossfadeFromCurrent() {
  if (reduceMotion) return;
  const cs = getComputedStyle(wallBase);
  const ghost = document.createElement('div');
  ghost.className = 'wallpaper-ghost';
  ghost.setAttribute('aria-hidden', 'true');
  ['backgroundImage', 'backgroundSize', 'backgroundPosition', 'backgroundRepeat', 'backgroundColor'].forEach(p => { ghost.style[p] = cs[p]; });
  wallBase.after(ghost);
  requestAnimationFrame(() => requestAnimationFrame(() => { ghost.style.opacity = '0'; }));
  setTimeout(() => ghost.remove(), 800);
}
function applyWallpaper(name, { silent = false } = {}) {
  if (!WALL_NAMES[name] || (name === 'custom' && !customWallpaper)) name = DEFAULT_WALL;
  if (!silent && document.body.dataset.wallpaper !== name) crossfadeFromCurrent();
  const theme = LIGHT_WALLPAPERS.includes(name) ? 'light' : 'dark';
  document.body.dataset.wallpaper = name;
  document.body.dataset.theme = theme;
  document.documentElement.dataset.theme = theme;
  if (themeMeta) themeMeta.content = theme === 'light' ? '#ececec' : '#08090c';
  $$('[data-wall]').forEach(el => {
    const on = el.dataset.wall === name;
    el.classList.toggle('active', on);
    el.setAttribute('aria-pressed', String(on));
  });
  store.set(WALL_KEY, name);
  if (!silent) showToast(`${WALL_NAMES[name]} wallpaper applied`);
}
$$('[data-wall]').forEach(el => el.addEventListener('click', () => applyWallpaper(el.dataset.wall)));

// Read a chosen image, shrink it, and return a JPEG data URL (keeps storage small).
async function fileToWallpaper(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const scale = Math.min(1, MAX_SIDE_PX / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1b1722';              // background for transparent PNG/WEBP areas
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.84);
  } finally {
    URL.revokeObjectURL(url);
  }
}
async function handleWallpaperFile(file) {
  if (!file) return;
  const typeOk = ALLOWED_TYPES.includes(file.type) || (!file.type && ALLOWED_EXT.test(file.name));
  if (!typeOk || !ALLOWED_EXT.test(file.name)) { showToast('Please choose a JPG, PNG or WEBP image'); return; }
  if (file.size > MAX_FILE_MB * 1024 * 1024) { showToast(`That image is too large (max ${MAX_FILE_MB} MB)`); return; }
  showToast('Preparing your wallpaper…');
  try {
    const dataUrl = await fileToWallpaper(file);
    setCustomImage(dataUrl);
    const saved = store.set(CUSTOM_KEY, dataUrl);
    applyWallpaper('custom', { silent: true });
    showToast(saved ? 'Your wallpaper is set' : 'Wallpaper set for this visit (too large to remember)');
  } catch {
    showToast("Couldn't read that image. Try a different file");
  }
}
// Every "upload" button opens the computer's native file picker.
const openFilePicker = () => wallInput.click();
['#uploadWallpaperBtn', '#lockUploadBtn', '#wallUploadTile'].forEach(sel => $(sel).addEventListener('click', openFilePicker));
wallInput.addEventListener('change', async () => {
  await handleWallpaperFile(wallInput.files && wallInput.files[0]);
  wallInput.value = '';   // lets the same file be picked again
});
$('#wallRemove').addEventListener('click', () => {
  const wasCustom = document.body.dataset.wallpaper === 'custom';
  clearCustomImage();
  if (wasCustom) applyWallpaper(DEFAULT_WALL, { silent: true });
  showToast('Your photo was removed');
});

// Restore the saved choice.
(() => {
  const savedImg = store.get(CUSTOM_KEY);
  if (savedImg && savedImg.startsWith('data:image/')) setCustomImage(savedImg);
  applyWallpaper(store.get(WALL_KEY) || DEFAULT_WALL, { silent: true });
})();

/* wallpaper browser sheet */
const wallBackdrop = $('#wallBackdrop');
let wallReturnFocus = null;
function openWallSheet() {
  wallReturnFocus = document.activeElement;
  wallBackdrop.hidden = false;
  ($('.wall-tile[aria-pressed="true"]', wallBackdrop) || $('#wallClose')).focus();
}
function closeWallSheet() {
  if (wallBackdrop.hidden) return;
  wallBackdrop.hidden = true;
  if (wallReturnFocus && document.contains(wallReturnFocus)) wallReturnFocus.focus();
}
$('#browseWallpaperBtn').addEventListener('click', openWallSheet);
$('#lockBrowseBtn').addEventListener('click', openWallSheet);
$('#wallClose').addEventListener('click', closeWallSheet);
wallBackdrop.addEventListener('pointerdown', e => { if (e.target === wallBackdrop) closeWallSheet(); });
wallBackdrop.addEventListener('keydown', e => trapTab(wallBackdrop, e));

/* ---------- 6. Lock screen (live clock, date, swipe / click / key to unlock) ---------- */
const lockScreen = $('#lockScreen');
const lockHM = $('#lockHM'), lockPeriod = $('#lockPeriod'), lockSec = $('#lockSec'), lockDate = $('#lockDate');
const desktopParts = $$('.topbar, .desktop, .window-layer, .dock, .wallpaper-control, .music-widget');
const hmFormat = new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' });
const dateFormat = new Intl.DateTimeFormat([], { weekday: 'long', day: 'numeric', month: 'long' });
let clockTimer = null, locked = true, lockSwitchTimer = null;

function setText(el, text) { if (el.textContent !== text) el.textContent = text; }
function updateLockClock() {
  const now = new Date();
  let hm = '', period = '';
  hmFormat.formatToParts(now).forEach(p => {
    if (p.type === 'dayPeriod') period = p.value.toUpperCase();
    else if (['hour', 'minute', 'literal'].includes(p.type)) hm += p.value;
  });
  setText(lockHM, hm.trim());
  setText(lockPeriod, period);
  setText(lockSec, String(now.getSeconds()).padStart(2, '0'));
  setText(lockDate, dateFormat.format(now));
}
function startLockClock() {
  stopLockClock();
  const tick = () => { updateLockClock(); clockTimer = setTimeout(tick, 1000 - (Date.now() % 1000) + 8); };
  tick();
}
function stopLockClock() { clearTimeout(clockTimer); clockTimer = null; }
document.addEventListener('visibilitychange', () => { if (locked && !document.hidden) startLockClock(); });

function setDesktopInert(state) { desktopParts.forEach(el => { el.inert = state; }); }

function unlock() {
  if (!locked) return;
  locked = false;
  clearTimeout(lockSwitchTimer);
  lockScreen.style.transition = '';
  lockScreen.style.transform = '';
  lockScreen.style.opacity = '';
  lockScreen.classList.add('is-unlocking');
  document.body.classList.remove('is-locked');   // desktop panels animate in
  setDesktopInert(false);
  lockSwitchTimer = setTimeout(() => { lockScreen.hidden = true; stopLockClock(); }, 900);
}
function lockNow() {
  if (locked) return;
  locked = true;
  closeWallSheet();
  closeAllWindows();
  setDesktopInert(true);
  startLockClock();
  lockScreen.hidden = false;
  lockScreen.classList.add('is-unlocking');
  void lockScreen.offsetWidth;                    // restart transition from the "up" position
  lockScreen.classList.remove('is-unlocking');
  clearTimeout(lockSwitchTimer);
  lockSwitchTimer = setTimeout(() => { window.scrollTo(0, 0); document.body.classList.add('is-locked'); }, 900);
  lockScreen.focus({ preventScroll: true });
}

// Swipe up (touch or mouse drag) or tap/click to unlock.
(() => {
  let startY = null, dy = 0, dragging = false;
  const SWIPE_DISTANCE = 110;
  const snapBack = () => {
    lockScreen.style.transition = 'transform .35s cubic-bezier(.2,.9,.3,1), opacity .35s';
    lockScreen.style.transform = '';
    lockScreen.style.opacity = '';
  };
  lockScreen.addEventListener('pointerdown', e => {
    if (!locked || e.button > 0 || e.target.closest('.lock-tool')) return;
    startY = e.clientY; dy = 0; dragging = false;
    lockScreen.style.transition = 'none';
  });
  window.addEventListener('pointermove', e => {
    if (startY === null) return;
    dy = startY - e.clientY;
    if (dy > 8) dragging = true;
    if (dragging) {
      const up = Math.max(0, dy);
      lockScreen.style.transform = `translateY(${-up}px)`;
      lockScreen.style.opacity = String(Math.max(0.2, 1 - up / (window.innerHeight * 0.9)));
    }
  });
  const finish = e => {
    if (startY === null) return;
    const tap = !dragging && Math.abs(dy) < 8;
    const swipe = dy > SWIPE_DISTANCE;
    startY = null;
    if (e.type === 'pointercancel') { snapBack(); return; }
    if (swipe || tap) unlock(); else snapBack();
  };
  window.addEventListener('pointerup', finish);
  window.addEventListener('pointercancel', finish);
})();
$('#lockHint').addEventListener('click', unlock);
lockScreen.addEventListener('wheel', e => { if (e.deltaY > 30) unlock(); }, { passive: true });
$('#lockNow').addEventListener('click', lockNow);

// Initial state: portfolio is locked on first open.
setDesktopInert(true);
startLockClock();
lockScreen.focus({ preventScroll: true });

/* ---------- 7. Keyboard ---------- */
const whatsappModal = $('#whatsappContactModal');
document.addEventListener('keydown', e => {
  // Lock screen: Enter, Space or Arrow Up unlocks (unless a wallpaper control has focus).
  if (locked && wallBackdrop.hidden) {
    if (!['Enter', ' ', 'ArrowUp'].includes(e.key)) return;
    if (e.target.closest && e.target.closest('.lock-tool')) return;
    e.preventDefault();
    unlock();
    return;
  }
  // Esc closes the top-most layer first: WhatsApp form, wallpaper sheet, music panel, then windows.
  if (e.key !== 'Escape') return;
  if (whatsappModal && !whatsappModal.hidden) { closeWhatsAppModal(); return; }
  if (!wallBackdrop.hidden) { closeWallSheet(); return; }
  if (locked) return;
  const panel = $('#musicPanel');
  if (panel && !panel.hidden) { panel.hidden = true; $('#musicTogglePanel').setAttribute('aria-expanded', 'false'); return; }
  closeAllWindows();
});

/* ---------- 8. Music player (single track, never autoplays) ---------- */
(() => {
  const audio = $('#portfolioAudio'), panel = $('#musicPanel'), toggle = $('#musicTogglePanel');
  const play = $('#musicPlayPause'), progress = $('#musicProgress');
  if (!audio || !panel || !toggle || !play || !progress) return;
  const playLabel = $('#musicPlayLabel'), playIcon = $('#musicPlayIcon');
  const elapsed = $('#musicElapsed'), duration = $('#musicDuration'), hint = $('#musicHint');
  const volume = $('#musicVolume'), mute = $('#musicMute'), wave = $('#musicVolWave');
  const widget = $('#musicWidget');
  const IDLE_HINT = 'Nothing plays until you press play.';
  const VOL_KEY = 'portfolio.volume';
  let missingTrack = false;

  const formatTime = value => {
    if (!Number.isFinite(value) || value < 0) return '0:00';
    const n = Math.floor(value);
    return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`;
  };
  const paintRange = input => {
    const max = Number(input.max) || 1;
    input.style.setProperty('--pct', `${Math.min(100, (Number(input.value) / max) * 100)}%`);
  };
  const updatePlayUI = playing => {
    play.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
    play.title = playing ? 'Pause' : 'Play';
    playLabel.textContent = playing ? 'Pause' : 'Play';
    playIcon.innerHTML = playing ? '<path d="M6 5h4v14H6zM14 5h4v14h-4z" />' : '<path d="M8 5v14l11-7z" />';
    widget.classList.toggle('is-playing', playing);
  };
  const setOpen = open => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close music player' : 'Open music player');
    if (open) play.focus({ preventScroll: true });
  };
  const seekBy = seconds => {
    if (!Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
  };
  const syncVolumeUI = () => {
    const silent = audio.muted || audio.volume === 0;
    wave.style.display = silent ? 'none' : '';
    mute.setAttribute('aria-label', silent ? 'Unmute' : 'Mute');
    mute.title = silent ? 'Unmute' : 'Mute';
    paintRange(volume);
  };

  toggle.addEventListener('click', () => setOpen(panel.hidden));
  $('#musicClose').addEventListener('click', () => { setOpen(false); toggle.focus({ preventScroll: true }); });
  play.addEventListener('click', async () => {
    if (missingTrack || audio.error) {
      hint.textContent = "The soundtrack couldn't be loaded right now.";
      showToast("Couldn't load the music file"); return;
    }
    if (audio.paused) {
      try { await audio.play(); hint.textContent = 'Enjoy the music.'; }
      catch { hint.textContent = "Playback was blocked by the browser. Try pressing play again."; showToast('Music could not start'); }
    } else audio.pause();
  });
  $('#musicBack').addEventListener('click', () => seekBy(-10));
  $('#musicFwd').addEventListener('click', () => seekBy(10));
  mute.addEventListener('click', () => {
    audio.muted = !audio.muted;
    if (!audio.muted && audio.volume === 0) { audio.volume = 0.5; volume.value = '0.5'; }
    syncVolumeUI();
  });
  volume.addEventListener('input', () => {
    audio.volume = Number(volume.value); audio.muted = false;
    store.set(VOL_KEY, volume.value);
    syncVolumeUI();
  });
  audio.addEventListener('play', () => updatePlayUI(true));
  audio.addEventListener('pause', () => updatePlayUI(false));
  audio.addEventListener('ended', () => { updatePlayUI(false); audio.currentTime = 0; hint.textContent = IDLE_HINT; });
  audio.addEventListener('loadstart', () => { if (audio.paused) hint.textContent = 'Loading track…'; });
  audio.addEventListener('loadedmetadata', () => {
    duration.textContent = formatTime(audio.duration);
    progress.max = String(audio.duration || 100);
    paintRange(progress);
    if (audio.paused) hint.textContent = IDLE_HINT;
  });
  audio.addEventListener('timeupdate', () => {
    if (!progress.matches(':active')) { progress.value = String(audio.currentTime || 0); paintRange(progress); }
    elapsed.textContent = formatTime(audio.currentTime);
    duration.textContent = formatTime(audio.duration);
  });
  progress.addEventListener('input', () => {
    paintRange(progress);
    if (Number.isFinite(audio.duration)) { audio.currentTime = Number(progress.value); elapsed.textContent = formatTime(audio.currentTime); }
  });
  audio.addEventListener('error', () => { missingTrack = true; updatePlayUI(false); hint.textContent = "The soundtrack couldn't be loaded right now."; });

  const savedVol = parseFloat(store.get(VOL_KEY));
  if (Number.isFinite(savedVol) && savedVol >= 0 && savedVol <= 1) volume.value = String(savedVol);
  audio.volume = Number(volume.value);
  syncVolumeUI();
  updatePlayUI(false);
})();

/* =====================================================================
   9. PROJECTS  -  edit ONLY this list. Each object = one project card.
   title         : project name
   type          : filter label, e.g. 'E-commerce', 'Web App', 'Landing Page'
   status        : short badge, e.g. 'In progress', 'Practice project', 'Completed'
   desc          : one or two honest sentences about what it does
   contribution  : what YOU did on it (leave '' to hide the row)
   tags          : technologies used
   live          : deployed link (leave '' if there is none yet)
   code          : GitHub repo link (leave '' if there is none yet)
   image         : screenshot, e.g. 'assets/projects/luxe-store.jpg' (leave '' until you have one)
   wire          : placeholder sketch shown until a screenshot exists: 'store' | 'keypad' | 'page'
   ===================================================================== */
const PROJECTS = [
  {
    title: 'Luxe Store',
    type: 'E-commerce',
    status: 'In progress',
    desc: 'An online store with customer login, categories, a wishlist and an order flow.',
    contribution: 'Personal project. Building it while I learn Laravel.',
    tags: ['Laravel', 'PHP', 'MySQL'],
    live: '', code: '', image: '', wire: 'store'
  },
  {
    title: 'Calculator',
    type: 'Web App',
    status: 'Practice project',
    desc: 'A calculator built with HTML, CSS and JavaScript.',
    contribution: 'Personal practice project.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    live: '', code: '', image: '', wire: 'keypad'
  }
  /* Add the next one by copying this block (and remember the comma after the project above):
  ,{
    title: 'Project name',
    type: 'Landing Page',
    status: 'Completed',
    desc: 'What it does, in one or two honest sentences.',
    contribution: 'What you built or decided on this project.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    live: 'https://…', code: 'https://github.com/…', image: 'assets/projects/name.jpg', wire: 'page'
  }
  */
];

(() => {
  const grid = $('#projGrid'), filters = $('#projFilters'), count = $('#projCount');
  if (!grid) return;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; };
  const safeUrl = u => /^https?:\/\//i.test(u || '') ? u : '';
  const hues = [215, 265, 25, 160, 340, 190, 45];
  let active = 'All';

  function wireframe(kind) {
    const wf = el('div', 'wf');
    const add = (cls, parent = wf) => { const n = el('i', cls); parent.append(n); return n; };
    if (kind === 'keypad') {
      add('screen');
      const keys = el('div', 'wf-keys'); for (let k = 0; k < 16; k++) add('', keys); wf.append(keys);
    } else {
      add('l1'); add('l2'); add('hero');
      const cards = el('div', 'wf-cards'); for (let k = 0; k < 4; k++) add('', cards); wf.append(cards);
    }
    return wf;
  }

  function card(p, i) {
    const art = el('div', 'proj-art');
    art.style.setProperty('--h', hues[i % hues.length]);
    const shot = el('div', 'shot');
    const bar = el('div', 'shot-bar'); bar.append(el('i'), el('i'), el('i'), el('b'));
    const bodyShot = el('div', 'shot-body');
    bodyShot.append(wireframe(p.wire || (p.type === 'E-commerce' ? 'store' : 'page')));
    if (p.image) {
      const img = el('img'); img.alt = `${p.title} screenshot`; img.loading = 'lazy'; img.decoding = 'async';
      img.onload = () => shot.classList.add('has-img');
      img.onerror = () => img.remove();
      img.src = p.image;
      bodyShot.append(img);
    }
    bodyShot.append(el('span', 'shot-note', 'Screenshot coming soon'));
    shot.append(bar, bodyShot);
    const status = el('span', 'proj-status');
    if (/progress/i.test(p.status || '')) status.append(el('i', 'pulse'));
    status.append(document.createTextNode(p.status || 'Project'));
    art.append(shot, el('span', 'proj-num', String(i + 1).padStart(2, '0')), status);

    const body = el('div', 'proj-body');
    body.append(el('span', 'project-type', (p.type || '').toUpperCase()), el('h3', '', p.title), el('p', '', p.desc));
    if (p.contribution) {
      const part = el('dl', 'proj-part');
      part.append(el('dt', '', 'my part'), el('dd', '', p.contribution));
      body.append(part);
    }
    const tags = el('div', 'tags'); (p.tags || []).forEach(t => tags.append(el('span', '', t)));
    const actions = el('div', 'proj-actions');
    const live = safeUrl(p.live), code = safeUrl(p.code);
    if (live) { const a = el('a', 'proj-live', 'Live demo ↗'); a.href = live; a.target = '_blank'; a.rel = 'noopener noreferrer'; actions.append(a); }
    if (code) { const a = el('a', 'proj-code', 'GitHub'); a.href = code; a.target = '_blank'; a.rel = 'noopener noreferrer'; actions.append(a); }
    if (!live && !code) actions.append(el('span', 'proj-soon', 'Not published yet'));
    body.append(tags, actions);
    const article = el('article', 'proj-card');
    article.style.animationDelay = `${Math.min(i, 6) * 60}ms`;
    article.append(art, body);
    return article;
  }
  function emptySlot() {
    const slot = el('article', 'proj-card proj-empty');
    slot.append(el('span', 'plus', '+'), el('b', '', 'Next project'), el('span', '', 'Still in the workshop. It will show up here once there is something real to show.'));
    return slot;
  }
  function render() {
    grid.replaceChildren();
    const list = PROJECTS.map((p, i) => ({ p, i })).filter(({ p }) => active === 'All' || p.type === active);
    list.forEach(({ p, i }) => grid.append(card(p, i)));
    if (active === 'All') grid.append(emptySlot());
    count.textContent = `${list.length} project${list.length === 1 ? '' : 's'}`;
    $$('.proj-chip', filters).forEach(b => { const on = b.dataset.f === active; b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on)); });
  }
  ['All', ...new Set(PROJECTS.map(p => p.type))].forEach(f => {
    const b = el('button', 'proj-chip', f); b.type = 'button'; b.dataset.f = f;
    b.addEventListener('click', () => { active = f; render(); });
    filters.append(b);
  });
  render();
})();

/* ---------- 10. WhatsApp popup form (visitor stays here until they submit) ---------- */
const whatsappDockBtn = $('#whatsappDockBtn');
const whatsappContactForm = $('#whatsappContactForm');
let whatsappReturnFocus = null;

function openWhatsAppModal(opener) {
  if (!whatsappModal) return;
  whatsappReturnFocus = opener || document.activeElement;
  whatsappModal.hidden = false;
  document.body.style.overflow = 'hidden';
  $('#whatsappVisitorName').focus();
}
function closeWhatsAppModal() {
  if (!whatsappModal || whatsappModal.hidden) return;
  whatsappModal.hidden = true;
  document.body.style.overflow = locked ? 'hidden' : '';
  if (whatsappReturnFocus && document.contains(whatsappReturnFocus)) whatsappReturnFocus.focus();
}
whatsappDockBtn?.addEventListener('click', () => openWhatsAppModal(whatsappDockBtn));
$('#contactWhatsApp')?.addEventListener('click', e => openWhatsAppModal(e.currentTarget));
$('#whatsappModalClose')?.addEventListener('click', closeWhatsAppModal);
whatsappModal?.addEventListener('pointerdown', event => { if (event.target === whatsappModal) closeWhatsAppModal(); });
whatsappModal?.addEventListener('keydown', e => trapTab(whatsappModal, e));
whatsappContactForm?.addEventListener('submit', event => {
  event.preventDefault();
  const name = $('#whatsappVisitorName').value.trim();
  const message = $('#whatsappVisitorMessage').value.trim();
  if (!name || !message) return;
  const text = `Hello Ahmad! My name is ${name}.\n\n${message}`;
  const url = `https://wa.me/${PORTFOLIO_CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  whatsappContactForm.reset();
  closeWhatsAppModal();
});

/* ---------- 11. Polish: soft pointer light on desktop cards ---------- */
if (window.matchMedia('(hover: hover)').matches && !reduceMotion) {
  $$('.desktop .glass').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

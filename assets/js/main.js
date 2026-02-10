// Configuration
// Note: This is a static website. Password is client-side only for basic access control.
// For real security, server-side authentication would be required.
const DEFAULT_EMAIL_PLACEHOLDER = 'janis.mayer92@gmail.com';
const CONFIG = {
    password: 'valentinstag', // Change this to your desired password
    // Using FormSubmit for simple static-site email forwarding
    emailEndpoint: 'https://formsubmit.co/janis.mayer92@gmail.com'
};
// Toggle verbose debugging logs
const DEBUG = true;
// EmailJS config (client-side). Fill with your EmailJS user/service/template IDs.
CONFIG.emailjs = {
    user: '9ljGilwq2fxCKlynZ',       // EmailJS public key (inserted)
    service: 'service_hc6vqy8',    // provided service ID
    template: 'template_o6r8fxd'    // provided template ID
};

// GIF flyby configuration: folder and available files (used in surprise mode)
CONFIG.gifs = {
    folder: 'assets/images/gifs',
    files: [
        'R4uB.gif',
        'tumblr_ae21515cae836868ac6baf2964e115a6_0a7e291a_500.gif',
        '6f1f308da0d735fdabee2e3711b28bd8.gif',
        'barbie-dogs-dog-dancing.gif',
        'kittytwerk.gif',
        'tumblr_b4b5234799df9e4cf2a2ec8a750e4c94_668cd464_500.gif',
        'hellokitty.gif',
        'nene-leaks-excuse-me.gif',
        'squidward-dance-transparent.gif',
        '136619.gif'
    ]
};

// GIF flyby runtime state
let _gifFlybyTimer = null;
let _gifFlybyActive = false;
let _gifFlybyStartDelayTimer = null;

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

function startGifFlybys(count = 1, spawnInterval = 4200, duration = 3500) {
    if (_gifFlybyActive) return;
    _gifFlybyActive = true;
    const pool = CONFIG.gifs.files.slice();
    shuffleArray(pool);
    let idx = 0;

    // Ensure spawnInterval respects duration so flybys don't overlap
    const minInterval = Math.max(spawnInterval, duration + 150);

    // sequential spawn: spawn one, wait duration+gap, then spawn next
    function spawnNext() {
        if (!_gifFlybyActive) return;
        // remove any lingering flyby to guarantee single GIF at a time
        document.querySelectorAll('.gif-flyby').forEach(el => { try { el.remove(); } catch (e){} });
        const file = pool[idx % pool.length];
        spawnGifFlyby(file, duration);
        idx++;
        // schedule next
        _gifFlybyTimer = setTimeout(() => {
            spawnNext();
        }, minInterval);
    }

    // start sequence
    spawnNext();
}

function stopGifFlybys() {
    _gifFlybyActive = false;
    if (_gifFlybyTimer) { clearInterval(_gifFlybyTimer); _gifFlybyTimer = null; }
    if (_gifFlybyStartDelayTimer) { clearTimeout(_gifFlybyStartDelayTimer); _gifFlybyStartDelayTimer = null; }
    // remove any live gif elements
    document.querySelectorAll('.gif-flyby').forEach(el => { try { el.remove(); } catch (e){} });
}

function spawnGifFlyby(filename, duration = 3500) {
    try {
        const src = `${CONFIG.gifs.folder}/${filename}`;
        const img = document.createElement('img');
        img.src = src;
        img.className = 'gif-flyby';
        img.style.position = 'fixed';
        img.style.pointerEvents = 'none';
        img.style.zIndex = 99997;
        img.style.top = '0px';
        img.style.opacity = '1';
        img.style.transition = `transform ${duration}ms linear, opacity 300ms ease`;

        // choose a random display width so sizes vary, but keep them reasonable
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const minW = Math.max(64, Math.floor(vw * 0.12));
        const maxW = Math.max(120, Math.floor(vw * 0.22));
        const displayW = Math.floor(minW + Math.random() * (maxW - minW));
        img.style.width = displayW + 'px';

        // initial placement: top:0, left random so the gif stays fully within viewport width
        const tempLeft = Math.floor(Math.random() * Math.max(1, vw - displayW));
        img.style.left = tempLeft + 'px';

        // random small rotation angle between -25 and 25 degrees
        const angle = -25 + Math.random() * 50;

        // when image loaded, compute height and set final transform to translateY(endY)
        img.addEventListener('load', () => {
            const rect = img.getBoundingClientRect();
            const h = rect.height;
            const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
            // ensure GIF stays fully visible during its travel: start at y=0 (fully visible top) and end at y=vh - h
            const endY = Math.max(0, vh - h);
            // apply initial transform state and then trigger transition to end state
            img.style.transform = `translateY(0px) rotate(${angle}deg)`;
            // small timeout to ensure transition triggers
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    img.style.transform = `translateY(${endY}px) rotate(${angle}deg)`;
                });
            });
            // cleanup after animation completes
            setTimeout(() => {
                try { img.style.opacity = '0'; } catch (e){}
                setTimeout(() => { try { if (img && img.parentNode) img.parentNode.removeChild(img); } catch (e){} }, 320);
            }, duration + 60);
        });

        document.body.appendChild(img);
    } catch (e) {
        if (DEBUG) console.warn('spawnGifFlyby error', e);
    }
}

// Views Object - SPA-style navigation
const views = {
    currentView: 'categories',
    history: [],
    categories: [
        { id: 'physical', title: '💆 Wohlfühlen', description: 'Entspannung für Körper und Geist', icon: '💆‍♀️', color: 'from-pink-400 to-pink-300' },
        { id: 'essen', title: '🍰 Schnützen', description: 'Wenn der kleine Hunger jault', icon: '🍽️', color: 'from-rose-400 to-rose-300' },
        { id: 'datenight', title: '💑 Datenight', description: 'Gemütliche Zeit zu zweit', icon: '🎬', color: 'from-fuchsia-400 to-fuchsia-300' },
        { id: 'trip', title: '🚶 Was unternehmen', description: 'Rausgehen & gemeinsam was erleben', icon: '✈️', color: 'from-pink-500 to-pink-400' },
        { id: 'surprise', title: '🎁 Überraschung', description: 'Überraschungsoptionen', icon: '🎁', color: 'from-fuchsia-500 to-fuchsia-400' }
    ],
    subOptions: {
        physical: { title: '💆 Wohlfühlen', options: [ { id: 'back-massage', label: 'Rückenmassage', field: 'Aktion' }, { id: 'foot-cream', label: 'Fußcreme einmassieren', field: 'Aktion' }, { id: 'shower-treatment', label: 'Duschbehandlung', field: 'Aktion' } ] },
        essen: { title: '🍰 Schnützen', options: [ { id: 'sweet', label: 'Süß', field: 'Geschmack' }, { id: 'savory', label: 'Herzhaft', field: 'Geschmack' }, { id: 'order-food', label: 'Was bestellen', field: 'Bestellung', needsInput: true }, { id: 'cook-something', label: 'Was leckeres kochen', field: 'Rezept', needsInput: true } ] },
        datenight: { title: '💑 Datenight', options: [ { id: 'read', label: 'Lesen', field: 'Aktivität' }, { id: 'play', label: 'Etwas spielen', field: 'Aktivität' }, { id: 'tv', label: 'Zusammen gemütlich Fernsehen', field: 'Aktivität' }, { id: 'trash-tv', label: 'Trash TV Live Reaction', field: 'Aktivität' } ] },
        trip: { title: '🚶 Was unternehmen', options: [ { id: 'city-stroll', label: 'In die Stadt schnuven (bummeln)', field: 'Ort' }, { id: 'walk', label: 'Spazieren', field: 'Ort' }, { id: 'eat-out', label: 'Essen gehen', field: 'Ort' }, { id: 'all-together', label: 'ALLES ZUSAMMEN', field: 'Ort' } ] },
        surprise: { title: '🎁 Überraschung', options: [ { id: 'type-adventure', label: 'Abenteuer', field: 'Art' }, { id: 'type-romantic', label: 'Romantisch', field: 'Art' }, { id: 'type-creative', label: 'Kreativ', field: 'Art' }, { id: 'intensity-calm', label: 'Entspannt', field: 'Intensität' }, { id: 'intensity-exciting', label: 'Aufregend', field: 'Intensität' }, { id: 'when-soon', label: 'Bald', field: 'Wann' }, { id: 'when-later', label: 'Später im Jahr', field: 'Wann' } ] }
    }
};

// Selection state
const selections = { category: null, choices: {} };

// Load header/footer partials
async function loadPartials() {
    try {
        const [h, f] = await Promise.all([
            fetch('partials/header.html'),
            fetch('partials/footer.html')
        ]);
        if (h.ok) document.getElementById('headerContainer').innerHTML = await h.text();
        if (f.ok) document.getElementById('footerContainer').innerHTML = await f.text();
    } catch (err) {
        console.warn('Could not load partials', err);
    }
}

// Simple hash-based router: supports '#/category/<id>' and default view
function handleRoute() {
    const hash = (location.hash || '').replace(/^#/, '');
    // expected format: '/category/massage'
    if (!hash || hash === '/' || hash === '') {
        renderCategories();
        return;
    }

    const parts = hash.split('/').filter(Boolean);
    if (parts[0] === 'category' && parts[1]) {
        const categoryId = parts[1];
        selections.category = categoryId;
        renderSubOptions(categoryId);
        return;
    }

    // fallback
    renderCategories();
}

function pushHistory(tag) {
    if (!views.history) views.history = [];
    views.history.push(tag);
}

// Password Gate Functions
function checkPassword() {
    const input = document.getElementById('passwordInput');
    const error = document.getElementById('errorMessage');
    
    if (input.value === CONFIG.password) {
        document.getElementById('passwordGate').classList.add('hidden');
        document.getElementById('appContainer').classList.remove('hidden');
        renderCategories(true);
        // reveal surprise entrance after successful login
        showSurpriseEntrance(true);
    } else {
        error.classList.remove('hidden');
        input.value = '';
        input.focus();
    }
}
// expose for inline handlers / external scripts
window.checkPassword = checkPassword;

// Allow Enter key to submit password and load partials
document.addEventListener('DOMContentLoaded', () => {
    if (DEBUG) console.log('DOMContentLoaded fired - main.js loaded');
    loadPartials();
    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkPassword();
            }
        });
    }
    // ensure the enter button reliably triggers password check
    const enterBtn = document.getElementById('enterButton');
    if (enterBtn) {
        enterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            checkPassword();
        });
    }

    // initial route handling and listen for hash changes
    handleRoute();
    window.addEventListener('hashchange', handleRoute);
    // initialize surprise mode UI
    initSurpriseMode();
    // initialize EmailJS if configured
    if (window.emailjs && CONFIG.emailjs && CONFIG.emailjs.user) {
        try { emailjs.init(CONFIG.emailjs.user); console.log('EmailJS initialized', CONFIG.emailjs.user); } catch (e) { console.warn('EmailJS init failed', e); }
    } else {
        if (DEBUG) console.log('EmailJS not available on window or CONFIG.emailjs not set', !!window.emailjs, CONFIG.emailjs);
    }
});

// Surprise mode: entrance button, confirm dialog, retro styling, audio player
function initSurpriseMode() {
    // create entrance button
    const existing = document.getElementById('surpriseEntrance');
    if (!existing) {
        const btn = document.createElement('button');
        btn.id = 'surpriseEntrance';
        btn.title = 'Netcenter';
        btn.innerHTML = '<span class="surprise-label">Zeitreise</span>';
        // hidden until login
        btn.style.display = 'none';
        document.body.appendChild(btn);
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            // Toggle surprise mode: if already active, disable; otherwise show interstitial to enable
            if (document.body.classList.contains('surprise-mode')) {
                toggleSurpriseMode(false);
                // provide quick feedback
                showToast('Surprise Mode deaktiviert');
            } else {
                // show short interstitial before enabling
                showSurpriseInterstitial();
            }
        });
    }

    // create audio player element (with adaptive cover halo)
    if (!document.getElementById('surpriseAudioPlayer')) {
        const p = document.createElement('div');
        p.id = 'surpriseAudioPlayer';
        // build structure: cover container + small controls placeholder
        p.innerHTML = `
            <div class="audio-cover">
                <img id="surpriseCoverImage" src="assets/images/audioplayer.png" alt="audio">
                <div class="cover-halo" aria-hidden="true"></div>
                <div class="cover-tint" aria-hidden="true"></div>
            </div>
            <div class="audio-controls">
                <div style="min-width:220px; color:#fff; font-weight:700;">Zeitreise Mix</div>
            </div>
        `;
        p.addEventListener('click', () => {
            toggleAudioPlay();
        });
        document.body.appendChild(p);

        // set halo background to match the cover image once image loaded
        const img = document.getElementById('surpriseCoverImage');
        const halo = p.querySelector('.cover-halo');
        function setHalo() {
            try {
                halo.style.backgroundImage = `url(${img.src})`;
            } catch (e) { if (DEBUG) console.warn('setHalo failed', e); }
        }
        if (img.complete) setHalo(); else img.addEventListener('load', setHalo);
    }

    // prepare audio element but don't autoplay
    if (!document.getElementById('surpriseAudio')) {
        const a = document.createElement('audio');
        a.id = 'surpriseAudio';
        a.src = 'assets/audio/lflrmx.m4a';
        a.preload = 'none';
        document.body.appendChild(a);
    }
}

function showSurpriseEntrance(show) {
    const btn = document.getElementById('surpriseEntrance');
    if (!btn) return;
    btn.style.display = show ? 'flex' : 'none';
}

function showSurpriseInterstitial() {
    // create a temporary overlay with a short animation/message
    const overlay = document.createElement('div');
    overlay.id = 'surpriseInterstitial';
    overlay.style.position = 'fixed';
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.zIndex = '999999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.background = 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.06), rgba(0,0,0,0.9))';
    overlay.innerHTML = `
        <div style="max-width:520px;padding:28px;border-radius:12px;background:linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02));border:2px solid rgba(255,255,255,0.06);text-align:center;color:#fff;">
            <div style="font-size:28px;font-weight:800;margin-bottom:10px;">Zeitreise initialisieren...</div>
            <div style="font-size:14px;opacity:0.9;margin-bottom:18px;">Bitte kurz warten — Wir bringen dich ins Jahr 2001 ✨</div>
            <div style="height:6px;background:linear-gradient(90deg,#00ffea,#ff4da6);border-radius:6px;overflow:hidden;"><div id="surpriseProgress" style="width:0%;height:100%;background:#fff;opacity:0.9;transition:width 2s linear;"></div></div>
        </div>
    `;
    document.body.appendChild(overlay);
    // animate progress then enable surprise mode
    setTimeout(() => { document.getElementById('surpriseProgress').style.width = '100%'; }, 50);
    setTimeout(() => {
        toggleSurpriseMode(true);
    }, 2200);
    setTimeout(() => {
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 2600);
}

function toggleSurpriseMode(enable) {
    const active = document.body.classList.toggle('surprise-mode', !!enable);
    // show audio player by class; start playing when enabling
    const audio = document.getElementById('surpriseAudio');
    if (active && audio) {
        try { audio.play().catch(()=>{}); } catch(e){}
        // start GIF flybys after a 27s delay to give the interstitial time
        try {
            if (_gifFlybyStartDelayTimer) clearTimeout(_gifFlybyStartDelayTimer);
            _gifFlybyStartDelayTimer = setTimeout(() => {
                try { startGifFlybys(1, 4200, 3500); } catch (e) { if (DEBUG) console.warn('startGifFlybys failed', e); }
                _gifFlybyStartDelayTimer = null;
            }, 29000);
        } catch (e) { if (DEBUG) console.warn('scheduling gif flybys failed', e); }
    } else if (audio) {
        audio.pause();
        audio.currentTime = 0;
        // stop any running GIF flybys
        try { stopGifFlybys(); } catch (e) { if (DEBUG) console.warn('stopGifFlybys failed', e); }
    }
}

function toggleAudioPlay() {
    const audio = document.getElementById('surpriseAudio');
    if (!audio) return;
    if (audio.paused) {
        audio.play().catch(()=>{});
    } else {
        audio.pause();
    }
}

// Rendering Functions
function renderCategories() {
    views.currentView = 'categories';
    views.history = [];
    selections.category = null;
    selections.choices = {};
    
    const content = document.getElementById('mainContent');
    document.getElementById('backButtonContainer').classList.add('hidden');

    // Primary: Decision helper button. Grid is collapsed by default.
    const html = `
        <div class="space-y-6">
            <div class="text-center">
                <button onclick="startDecisionHelper()" class="btn-gradient text-white font-bold py-4 px-6 rounded-2xl shadow-lg text-lg">Entscheidungshilfe</button>
            </div>
            <div class="text-center">
                <div id="quickAccess" class="mt-3"></div>
            </div>
            <!--
            <div class="text-center text-sm text-gray-600">Oder alle Optionen anzeigen:</div>
            <div class="text-center">
                <button onclick="showFullGrid()" class="mt-2 px-4 py-2 rounded-lg border border-pink-300 bg-white">Alle Optionen anzeigen</button>
            </div>
            -->
        </div>
    `;

    content.innerHTML = html;
    renderQuickAccess();
}

// Render a grid for a given categories array
function renderGrid(categoryArray) {
    const content = document.getElementById('mainContent');
    document.getElementById('backButtonContainer').classList.add('hidden');
    const html = `
        <div class="mb-4 text-left">
            <button onclick="renderCategories()" class="text-sm text-pink-600 hover:underline">← Zurück</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${categoryArray.map(cat => `
                <div 
                    onclick="selectCategory('${cat.id}')"
                    class="bg-gradient-to-br ${cat.color} rounded-2xl shadow-xl p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
                >
                    <div class="text-6xl text-center mb-4">${cat.icon}</div>
                    <h3 class="text-2xl font-bold text-white text-center mb-2">${cat.title}</h3>
                    <p class="text-white text-center opacity-90">${cat.description}</p>
                </div>
            `).join('')}
        </div>
    `;
    content.innerHTML = html;
    renderQuickAccess();
    // animate grid items popping in
    animatePopSequence('#mainContent .grid', '> *', 90);
}

function showFullGrid() {
    renderGrid(views.categories);
}

function startDecisionHelper() {
    const content = document.getElementById('mainContent');
    document.getElementById('backButtonContainer').classList.remove('hidden');
    const html = `
        <div class="mb-4 text-left">
            <button onclick="renderCategories()" class="text-sm text-pink-600 hover:underline">← Zurück</button>
        </div>
        <div class="bg-white rounded-2xl shadow-2xl p-8 mb-6">
            <h2 class="text-2xl font-bold text-pink-600 text-center mb-4">Was wünschst du dir gerade?</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onclick="decisionChoose('relax')" class="p-4 btn-gradient text-white rounded-lg">Entspannung</button>
                <button onclick="decisionChoose('active')" class="p-4 btn-gradient text-white rounded-lg">Aktivität</button>
            </div>
        </div>
    `;
    content.innerHTML = html;
    // decision helper shows immediately; final selection animations run in renderSubOptions
}

// Quick Access functions
function renderQuickAccess() {
    const container = document.getElementById('quickAccess');
    if (!container) return;
    const quicks = [
        { id: 'quick-water', label: 'Wasser bringen', icon: '💧' },
        { id: 'quick-consume', label: 'Konsumentscheidung', icon: '🧭' },
        { id: 'quick-snack', label: 'Snacky Snack', icon: '🍿' },
        { id: 'quick-heat', label: 'Wärmflasche', icon: '🔥' }
    ];

    container.innerHTML = `
        <div class="quick-access-wrapper">
            <button id="quickToggle" class="quick-toggle" aria-expanded="false" onclick="toggleQuickPanel()">EILWUNSCH</button>
            <div id="quickPanel" class="quick-panel" aria-hidden="true">
                ${quicks.map(q => `
                    <button onclick="addQuickAccess('${q.id}','${q.label}')" data-option-id="${q.id}" class="quick-pill">
                        <span class="mr-2">${q.icon}</span>${q.label}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    updateButtonStates();
}

function toggleQuickPanel() {
    const panel = document.getElementById('quickPanel');
    const toggle = document.getElementById('quickToggle');
    if (!panel || !toggle) return;
    const isOpen = panel.classList.toggle('open');
    panel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

function addQuickAccess(id, label) {
    // toggle quick access selection
    const wasSelected = !!selections.choices[id];
    if (wasSelected) {
        // deselect (clear all to enforce single-choice)
        selections.choices = {};
        updateSelectedMini();
        updateButtonStates();
        return;
    }

    // single-select: replace any previous selection and immediately send e-mail for quick wishes
    selections.choices = {};
    selections.choices[id] = { label, field: 'EILHILFE' };
    updateSelectedMini();
    updateButtonStates();
    sendQuickEmail(id, label).then(ok => {
        if (ok) showToast('E‑Mail gesendet ✔');
        else showToast('Fehler beim Senden der E‑Mail');
    });
}

async function sendQuickEmail(id, label) {
    try {
        if (DEBUG) console.log('sendQuickEmail start', { id, label });
        const formData = new FormData();
        formData.append('Kategorie', 'EILWUNSCH');
        formData.append('Wunsch', label);
        formData.append('Quelle', 'QuickAccess');
        formData.append('Datum', new Date().toLocaleString('de-DE'));
        formData.append('_subject', `Eilwunsch: ${label}`);
        formData.append('_captcha', 'false');

        const emailjsAvailable = window.emailjs && CONFIG.emailjs && CONFIG.emailjs.user && CONFIG.emailjs.service && CONFIG.emailjs.template;
        if (DEBUG) console.log('sendQuickEmail emailjsAvailable=', !!emailjsAvailable);
        if (emailjsAvailable) {
            const templateParams = { category: 'EILWUNSCH', wish: label, date: new Date().toLocaleString('de-DE') };
            try {
                if (DEBUG) console.log('Calling emailjs.send with', CONFIG.emailjs.service, CONFIG.emailjs.template, templateParams);
                await emailjs.send(CONFIG.emailjs.service, CONFIG.emailjs.template, templateParams);
                if (DEBUG) console.log('emailjs.send resolved');
                return true;
            } catch (err) {
                console.error('EmailJS quick send failed', err);
                showToast('EmailJS fehlgeschlagen, versuche Fallback');
                submitViaIframe(formData);
                return false;
            }
        }

        // Use iframe form submit to avoid fetch/CORS/DNS redirect issues
        if (DEBUG) console.log('Using iframe fallback for quick email');
        submitViaIframe(formData);
        return true;
    } catch (err) {
        console.error('sendQuickEmail error', err);
        const subject = encodeURIComponent(`Eilwunsch: ${label}`);
        const body = encodeURIComponent(`Wunsch: ${label}\nQuelle: QuickAccess\nDatum: ${new Date().toLocaleString('de-DE')}`);
        openMailClient(subject, body);
        showToast('Kein Netzwerk: öffne Mail-Client als Fallback');
        return false;
    }
}

// small transient toast message
function showToast(msg, timeout = 3000) {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.position = 'fixed';
        container.style.left = '50%';
        container.style.top = '20px';
        container.style.transform = 'translateX(-50%)';
        container.style.zIndex = 9999;
        document.body.appendChild(container);
    }
    const el = document.createElement('div');
    el.textContent = msg;
    el.style.background = 'rgba(16,24,40,0.95)';
    el.style.color = 'white';
    el.style.padding = '10px 14px';
    el.style.borderRadius = '10px';
    el.style.marginTop = '6px';
    el.style.boxShadow = '0 6px 20px rgba(2,6,23,0.3)';
    container.appendChild(el);
    setTimeout(() => {
        el.style.transition = 'opacity 300ms ease, transform 300ms ease';
        el.style.opacity = '0';
        el.style.transform = 'translateY(-6px)';
        setTimeout(() => container.removeChild(el), 350);
    }, timeout);
}

function updateSelectedMini() {
    const miniId = document.getElementById('selectedMini');
    // if not present, create at top of mainContent
    let mini = miniId;
    if (!mini) {
        const content = document.getElementById('mainContent');
        mini = document.createElement('div');
        mini.id = 'selectedMini';
        mini.className = 'mt-4';
        content.prepend(mini);
    }

    const items = Object.entries(selections.choices);
    if (items.length === 0) {
        mini.innerHTML = '';
        return;
    }

    mini.innerHTML = `
        <div class="bg-white rounded-xl shadow p-3 flex flex-wrap gap-2 items-center">
            ${items.map(([id, d]) => `
                <div class="px-3 py-1 bg-pink-50 rounded-full flex items-center gap-2">
                    <span class="font-semibold text-pink-600">${d.label}</span>
                    <button onclick="removeSelection('${id}')" class="text-red-500 font-bold">✕</button>
                </div>
            `).join('')}
        </div>
    `;
}

// decision flow: map first choice to category sets
function decisionChoose(choice) {
    if (choice === 'relax') {
        // Wohlfühlen + Essen
        const cats = views.categories.filter(c => c.id === 'physical' || c.id === 'essen');
        renderGrid(cats);
    } else if (choice === 'active') {
        // Datenight + Was unternehmen
        const cats = views.categories.filter(c => c.id === 'datenight' || c.id === 'trip');
        renderGrid(cats);
    }
}

function selectCategory(categoryId) {
    // navigate via hash so each category has its own address
    location.hash = `/category/${categoryId}`;
}

function renderSubOptions(categoryId) {
    const subOption = views.subOptions[categoryId];
    const content = document.getElementById('mainContent');
    document.getElementById('backButtonContainer').classList.remove('hidden');
    // Build options HTML safely (avoid embedding async logic inside template literals)
    const optionsHtml = subOption.options.map(opt => {
        if (opt.needsInput) {
            return `
                <div class="flex flex-col">
                    <button 
                        onclick="selectOptionWithInput('${opt.id.replace(/'/g, "\\'")}', '${opt.label.replace(/'/g, "\\'")}', '${opt.field.replace(/'/g, "\\'")}')"
                        class="p-4 border-2 border-pink-300 rounded-lg hover:bg-pink-50 hover:border-pink-500 transition-all duration-300 text-left group"
                        data-option-id="${opt.id}"
                    >
                        <div class="font-semibold text-gray-700 group-hover:text-pink-600">${opt.label}</div>
                        <div class="text-sm text-gray-500">${opt.field}</div>
                    </button>
                    <div class="text-xs text-gray-400 italic mt-1">(Eingabe erforderlich)</div>
                </div>
            `;
        }
        return `
            <div>
                <button 
                    onclick="selectOption('${opt.id.replace(/'/g, "\\'")}', '${opt.label.replace(/'/g, "\\'")}', '${opt.field.replace(/'/g, "\\'")}')"
                    class="p-4 border-2 border-pink-300 rounded-lg hover:bg-pink-50 hover:border-pink-500 transition-all duration-300 text-left group w-full text-left"
                    data-option-id="${opt.id}"
                >
                    <div class="font-semibold text-gray-700 group-hover:text-pink-600">${opt.label}</div>
                    <div class="text-sm text-gray-500">${opt.field}</div>
                </button>
            </div>
        `;
    }).join('');

    const html = `
        <div class="mb-4 text-left">
            <button onclick="renderCategories()" class="text-sm text-pink-600 hover:underline">← Zurück</button>
        </div>
        <div class="bg-white rounded-2xl shadow-2xl p-8 mb-6">
            <h2 class="text-3xl font-bold text-pink-600 text-center mb-8">${subOption.title}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${optionsHtml}
            </div>
        </div>
        <div id="selectedOptions" class="bg-white rounded-2xl shadow-xl p-6 mb-6 hidden">
            <h3 class="text-xl font-bold text-pink-600 mb-4">Deine Auswahl:</h3>
            <div id="selectedList" class="space-y-2 mb-4"></div>
            <button 
                onclick="submitForm()"
                class="w-full btn-gradient text-white font-bold py-3 rounded-lg shadow-lg transition-all duration-300"
            >
                Auswahl bestätigen & absenden 💌
            </button>
        </div>
    `;

    content.innerHTML = html;
    // Sequential reveal + varied animations for the final option buttons (1s delay each)
    const optionButtons = Array.from(content.querySelectorAll('[data-option-id]'));
    const anims = ['anim-spin', 'anim-wiggle', 'anim-bounce', 'anim-flip', 'anim-zoom', 'anim-rainbow', 'anim-shake-rotate', 'anim-explode'];
    optionButtons.forEach((btn) => btn.classList.add('hidden-option'));
    optionButtons.forEach((btn, idx) => {
        setTimeout(() => {
            btn.classList.remove('hidden-option');
            // choose a random wild animation for each button
            const anim = anims[Math.floor(Math.random() * anims.length)];
            btn.classList.add(anim);
            // randomize duration a bit for extra chaos
            const dur = 700 + Math.floor(Math.random() * 1200); // 700ms - 1900ms
            btn.style.animationDuration = dur + 'ms';
            // occasionally add neon glow
            if (Math.random() > 0.65) btn.classList.add('wild-glow');
            // tiny random rotation jitter afterwards for extra flavor
            if (Math.random() > 0.7) btn.style.transition = 'transform 600ms cubic-bezier(.2,.9,.2,1)';
        }, idx * 1000);
    });
}

// Staggered pop-in animation helper
function animatePopSequence(containerSelector, itemSelector = '> *', delay = 80) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    // Normalize selector: querySelectorAll on an element doesn't accept selectors starting with '>'
    // so replace leading child combinators with ':scope >' and handle comma-separated lists.
    const selectors = itemSelector.split(',').map(s => s.trim()).map(s => {
        if (s.startsWith('>')) return ':scope ' + s;
        return s;
    }).join(', ');
    const items = Array.from(container.querySelectorAll(selectors));
    items.forEach((it) => it.classList.add('pop-item'));
    items.forEach((it, i) => {
        setTimeout(() => {
            it.classList.add('pop-in');
        }, i * delay);
    });
}

function selectOption(optionId, label, field) {
    // Enforce single-selection: if clicking the already-selected option, clear selection; otherwise replace with this one
    if (selections.choices[optionId]) {
        selections.choices = {};
    } else {
        selections.choices = {};
        selections.choices[optionId] = { label, field };
    }
    updateSelectedOptions();
    updateButtonStates();
}

function selectOptionWithInput(optionId, label, field) {
    const value = window.prompt(`${label} — bitte eingeben:`);
    if (value === null) return; // cancelled
    const storedLabel = value.trim() ? `${label}: ${value.trim()}` : label;
    // Enforce single-selection behavior: replace any previous selection
    selections.choices = {};
    selections.choices[optionId] = { label: storedLabel, field };
    updateSelectedOptions();
    updateButtonStates();
}

function updateSelectedOptions() {
    const selectedDiv = document.getElementById('selectedOptions');
    const selectedList = document.getElementById('selectedList');
    
    if (Object.keys(selections.choices).length > 0) {
        selectedDiv.classList.remove('hidden');
        selectedList.innerHTML = Object.entries(selections.choices).map(([id, data]) => `
            <div class="flex items-center justify-between bg-pink-50 p-3 rounded-lg">
                <span class="text-gray-700">
                    <strong>${data.field}:</strong> ${data.label}
                </span>
                <button 
                    onclick="removeSelection('${id}')"
                    class="text-red-500 hover:text-red-700 font-bold"
                >
                    ✕
                </button>
            </div>
        `).join('');
    } else {
        selectedDiv.classList.add('hidden');
    }
}

function updateButtonStates() {
    document.querySelectorAll('[data-option-id]').forEach(btn => {
        const optionId = btn.getAttribute('data-option-id');
        if (selections.choices[optionId]) {
            btn.classList.add('bg-pink-100', 'border-pink-500');
        } else {
            btn.classList.remove('bg-pink-100', 'border-pink-500');
        }
    });
}

function removeSelection(optionId) {
    // For single-selection mode, clear all selections
    selections.choices = {};
    updateSelectedOptions();
    updateButtonStates();
}

function goBack() {
    // use browser history to go back; hashchange listener will update content
    history.back();
}

// Form Submission
function submitForm() {
    if (Object.keys(selections.choices).length === 0) {
        alert('Bitte wähle mindestens eine Option!');
        return;
    }
    if (DEBUG) console.log('submitForm start', { selections });
    const formData = new FormData();
    formData.append('Kategorie', getCategoryTitle(selections.category));
    Object.entries(selections.choices).forEach(([id, data]) => {
        formData.append(data.field, data.label);
    });
    formData.append('Datum', new Date().toLocaleDateString('de-DE'));
    // FormSubmit extras
    formData.append('_subject', `Wunsch von carecompanion`);
    formData.append('_captcha', 'false');
    // Try serverless function first (Netlify/Vercel). If unavailable, fall back to EmailJS -> iframe -> mailto.
    const payload = { category: getCategoryTitle(selections.category), date: new Date().toLocaleDateString('de-DE'), _subject: `Wunsch von carecompanion` };
    Object.entries(selections.choices).forEach(([id, d]) => {
        // accumulate choices as text for serverless
        if (!payload.choices) payload.choices = '';
        payload.choices += `${d.field}: ${d.label}\n`;
        // echo individual fields too
        payload[d.field] = d.label;
    });

    // endpoint for Netlify functions
    const serverlessEndpoint = '/.netlify/functions/send-email';
    try {
        if (DEBUG) console.log('Submitting to serverless endpoint', serverlessEndpoint, payload);
        const res = await fetch(serverlessEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            if (DEBUG) console.log('Serverless send OK');
            showSuccessMessage();
            return;
        } else {
            const text = await res.text();
            if (DEBUG) console.warn('Serverless send failed', res.status, text);
            showToast('Serverless send fehlgeschlagen, versuche Fallback');
            // continue to next fallback
        }
    } catch (err) {
        if (DEBUG) console.warn('Serverless request error', err);
        // continue to next fallback
    }

    // If EmailJS is configured, try sending via EmailJS next (client-side)
    const emailjsAvailable = window.emailjs && CONFIG.emailjs && CONFIG.emailjs.user && CONFIG.emailjs.service && CONFIG.emailjs.template;
    if (DEBUG) console.log('submitForm emailjsAvailable=', !!emailjsAvailable);
    if (emailjsAvailable) {
        const choicesText = payload.choices || '';
        const templateParams = {
            category: payload.category,
            choices: choicesText,
            date: payload.date
        };
        try {
            if (DEBUG) console.log('Attempt EmailJS send', CONFIG.emailjs);
            showToast('Sende per EmailJS...');
            await emailjs.send(CONFIG.emailjs.service, CONFIG.emailjs.template, templateParams, CONFIG.emailjs.user);
            if (DEBUG) console.log('EmailJS send OK');
            showSuccessMessage();
            return;
        } catch (err) {
            console.error('EmailJS send failed', err);
            showToast('EmailJS fehlgeschlagen, versuche Fallback');
            // fallthrough
        }
    }

    // Final fallback: submit via hidden iframe to FormSubmit
    submitViaIframe(formData);
}

// Submit FormData by creating a temporary <form> targeting a hidden iframe.
function ensureIframe(name = 'formsubmit_iframe') {
    let iframe = document.getElementById(name);
    if (!iframe) {
        if (DEBUG) console.log('Creating hidden iframe for form submit:', name);
        iframe = document.createElement('iframe');
        iframe.id = name;
        iframe.name = name;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
    }
    return iframe;
}

function submitViaIframe(formData) {
    try {
        ensureIframe();
        if (DEBUG) {
            console.log('submitViaIframe action ->', CONFIG.emailEndpoint);
            for (const pair of formData.entries()) console.log('  ', pair[0], '=', pair[1]);
        }
        const form = document.createElement('form');
        form.style.display = 'none';
        form.method = 'POST';
        form.action = CONFIG.emailEndpoint;
        form.target = 'formsubmit_iframe';

        // Append FormData fields as hidden inputs
        for (const pair of formData.entries()) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = pair[0];
            input.value = pair[1];
            form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
        // cleanup after a short delay
        setTimeout(() => { if (form && form.parentNode) form.parentNode.removeChild(form); }, 2000);
        // optimistic success UX
        showSuccessMessage();
    } catch (err) {
        console.error('submitViaIframe error', err);
        // fallback to mail client
        const subject = encodeURIComponent('Wunsch von carecompanion');
        let body = `Kategorie: ${getCategoryTitle(selections.category)}\n\n`;
        Object.entries(selections.choices).forEach(([id, data]) => {
            body += `${data.field}: ${data.label}\n`;
        });
        body += `\nDatum: ${new Date().toLocaleDateString('de-DE')}`;
        openMailClient(subject, encodeURIComponent(body));
        showToast('Fehler beim Senden — öffne Mail-Client als Fallback');
    }
}

function openMailClient(subject, bodyEncoded) {
    const to = 'janis.mayer92@gmail.com';
    const mailto = `mailto:${to}?subject=${subject}&body=${bodyEncoded}`;
    // create a hidden anchor and click it to avoid opening an extra blank tab
    try {
        const a = document.createElement('a');
        a.href = mailto;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { if (a && a.parentNode) a.parentNode.removeChild(a); }, 1000);
    } catch (e) {
        // fallback: navigate current page to mailto
        window.location.href = mailto;
    }
}

function getCategoryTitle(categoryId) {
    const category = views.categories.find(cat => cat.id === categoryId);
    return category ? category.title : categoryId;
}

function showSuccessMessage() {
    const content = document.getElementById('mainContent');
    document.getElementById('backButtonContainer').classList.add('hidden');
    
    content.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl p-12 text-center fade-in">
            <div class="text-8xl mb-6">💕</div>
            <h2 class="text-4xl font-bold text-pink-600 mb-4">Vielen Dank!</h2>
            <p class="text-xl text-gray-600 mb-8">Deine Auswahl wurde erfolgreich gesendet!</p>
            <p class="text-lg text-gray-500 mb-8">Ich freue mich darauf, diesen besonderen Tag mit dir zu verbringen! ❤️</p>
            <button onclick="renderCategories()" class="btn-gradient text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300">Neue Auswahl treffen</button>
        </div>
    `;
}

// Utility: quick test function to manually trigger an EmailJS send (for debugging)
window.testEmailJS = async function testEmailJS() {
    if (!window.emailjs) return console.warn('emailjs SDK not present on window');
    if (!CONFIG.emailjs || !CONFIG.emailjs.user) return console.warn('CONFIG.emailjs not configured', CONFIG.emailjs);
    try {
        console.log('testEmailJS: init and send test');
        emailjs.init(CONFIG.emailjs.user);
        const params = { test: 'ping', date: new Date().toLocaleString('de-DE') };
        const res = await emailjs.send(CONFIG.emailjs.service, CONFIG.emailjs.template, params, CONFIG.emailjs.user);
        console.log('testEmailJS send result', res);
    } catch (e) {
        console.error('testEmailJS error', e);
    }
};

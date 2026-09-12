(function () {
  let settings = loadSettings();
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  /* ================= AUTH ================= */
  const SESSION_KEY = 'apologyAdminUnlocked';
  const loginScreen = $('#loginScreen');
  const shell = $('#adminShell');
  const pwInput = $('#pwInput');
  const loginBtn = $('#loginBtn');
  const loginError = $('#loginError');

  function checkAuth() {
    if (sessionStorage.getItem(SESSION_KEY) === '1') {
      showDashboard();
    }
  }

  function attemptLogin() {
    const val = pwInput.value;
    if (val === (settings.general.adminPassword || '')) {
      sessionStorage.setItem(SESSION_KEY, '1');
      loginError.textContent = '';
      showDashboard();
    } else {
      loginError.textContent = 'Incorrect password. Try again.';
      pwInput.value = '';
      pwInput.focus();
    }
  }

  function showDashboard() {
    loginScreen.style.display = 'none';
    shell.style.display = 'flex';
    populateForm();
  }

  loginBtn.addEventListener('click', attemptLogin);
  pwInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') attemptLogin(); });
  $('#logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_KEY);
    shell.style.display = 'none';
    loginScreen.style.display = 'flex';
    pwInput.value = '';
  });

  checkAuth();

  /* ================= NAVIGATION ================= */
  const sections = ['general', 'opening', 'message', 'final', 'design', 'music', 'preview'];
  function goToSection(name) {
    sections.forEach(s => {
      $(`#section-${s}`).classList.toggle('active', s === name);
    });
    $$('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.section === name));
    $$('.mobile-nav button').forEach(b => b.classList.toggle('active', b.dataset.section === name));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  $$('.nav-item, .mobile-nav button').forEach(btn => {
    btn.addEventListener('click', () => goToSection(btn.dataset.section));
  });

  /* ================= FORM POPULATION ================= */
  function populateForm() {
    $('#f-friendName').value = settings.general.friendName;
    $('#f-yourName').value = settings.general.yourName;
    $('#f-websiteTitle').value = settings.general.websiteTitle;
    $('#f-tabTitle').value = settings.general.tabTitle;
    $('#f-adminPassword').value = settings.general.adminPassword;

    $('#f-openingHeading').value = settings.opening.heading;
    $('#f-openingSubtitle').value = settings.opening.subtitle;
    $('#f-openingButton').value = settings.opening.buttonText;

    settings.cards.forEach((card, i) => {
      $(`#f-card${i}-heading`).value = card.heading;
      $(`#f-card${i}-message`).value = card.message;
      updateCharCount(`#f-card${i}-message`);
    });

    $('#f-finalHeading').value = settings.final.heading;
    $('#f-finalMessage').value = settings.final.message;
    updateCharCount('#f-finalMessage');
    $('#f-finalClosing').value = settings.final.closing;
    $('#f-finalReplay').value = settings.final.replayText;

    $('#f-bg').value = settings.design.bg;
    $('#f-bgText').value = settings.design.bg;
    $('#f-bg2').value = settings.design.bg2;
    $('#f-bg2Text').value = settings.design.bg2;
    $('#f-text').value = settings.design.text;
    $('#f-textText').value = settings.design.text;
    $('#f-accent').value = settings.design.accent;
    $('#f-accentText').value = settings.design.accent;
    $('#f-button').value = settings.design.button;
    $('#f-buttonText').value = settings.design.button;
    highlightActivePreset();
    updateLivePreview();

    $('#f-musicUrl').value = settings.music.url;
    $('#f-musicTitle').value = settings.music.title;
    $('#f-musicEnabled').checked = settings.music.enabled;
  }

  function updateCharCount(sel) {
    const el = $(sel);
    const counter = el.parentElement.querySelector('.char-count');
    if (counter) counter.textContent = `${el.value.length} characters`;
  }
  $$('textarea').forEach(t => t.addEventListener('input', () => updateCharCount('#' + t.id)));

  /* ================= COLLECT FORM -> SETTINGS ================= */
  function collectForm() {
    settings.general.friendName = $('#f-friendName').value.trim();
    settings.general.yourName = $('#f-yourName').value.trim();
    settings.general.websiteTitle = $('#f-websiteTitle').value.trim();
    settings.general.tabTitle = $('#f-tabTitle').value.trim();
    settings.general.adminPassword = $('#f-adminPassword').value || 'sorry';

    settings.opening.heading = $('#f-openingHeading').value;
    settings.opening.subtitle = $('#f-openingSubtitle').value;
    settings.opening.buttonText = $('#f-openingButton').value;

    settings.cards.forEach((card, i) => {
      card.heading = $(`#f-card${i}-heading`).value;
      card.message = $(`#f-card${i}-message`).value;
    });

    settings.final.heading = $('#f-finalHeading').value;
    settings.final.message = $('#f-finalMessage').value;
    settings.final.closing = $('#f-finalClosing').value;
    settings.final.replayText = $('#f-finalReplay').value;

    settings.design.bg = $('#f-bg').value;
    settings.design.bg2 = $('#f-bg2').value;
    settings.design.text = $('#f-text').value;
    settings.design.accent = $('#f-accent').value;
    settings.design.button = $('#f-button').value;

    settings.music.url = $('#f-musicUrl').value.trim();
    settings.music.title = $('#f-musicTitle').value.trim();
    settings.music.enabled = $('#f-musicEnabled').checked;
  }

  /* ================= DESIGN: color sync + presets ================= */
  function pairColor(colorId, textId, settingKey) {
    const colorEl = $(colorId), textEl = $(textId);
    colorEl.addEventListener('input', () => {
      textEl.value = colorEl.value;
      settings.design[settingKey] = colorEl.value;
      settings.design.theme = 'custom';
      highlightActivePreset();
      updateLivePreview();
    });
    textEl.addEventListener('input', () => {
      if (/^#[0-9a-fA-F]{6}$/.test(textEl.value)) {
        colorEl.value = textEl.value;
        settings.design[settingKey] = textEl.value;
        settings.design.theme = 'custom';
        highlightActivePreset();
        updateLivePreview();
      }
    });
  }
  pairColor('#f-bg', '#f-bgText', 'bg');
  pairColor('#f-bg2', '#f-bg2Text', 'bg2');
  pairColor('#f-text', '#f-textText', 'text');
  pairColor('#f-accent', '#f-accentText', 'accent');
  pairColor('#f-button', '#f-buttonText', 'button');

  function applyPreset(key) {
    const preset = THEME_PRESETS[key];
    settings.design = { theme: key, bg: preset.bg, bg2: preset.bg2, text: preset.text, accent: preset.accent, button: preset.button };
    $('#f-bg').value = preset.bg; $('#f-bgText').value = preset.bg;
    $('#f-bg2').value = preset.bg2; $('#f-bg2Text').value = preset.bg2;
    $('#f-text').value = preset.text; $('#f-textText').value = preset.text;
    $('#f-accent').value = preset.accent; $('#f-accentText').value = preset.accent;
    $('#f-button').value = preset.button; $('#f-buttonText').value = preset.button;
    highlightActivePreset();
    updateLivePreview();
  }
  $$('.preset-card').forEach(card => {
    card.addEventListener('click', () => applyPreset(card.dataset.preset));
  });
  function highlightActivePreset() {
    $$('.preset-card').forEach(c => c.classList.toggle('active', c.dataset.preset === settings.design.theme));
  }

  function updateLivePreview() {
    const lp = $('#livePreview');
    lp.style.background = settings.design.bg;
    lp.style.color = '#fff8f4';
    $('#lp-card').style.background = settings.design.bg2;
    $('#lp-card').style.color = settings.design.text;
    $('#lp-btn').style.background = settings.design.button;
    $('#lp-heading').style.color = settings.design.accent;
  }

  /* ================= ACTIONS ================= */
  function showToast(msg) {
    const toast = $('#toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
  }

  $$('#saveBtn, #saveBtnBottom').forEach(btn => btn && btn.addEventListener('click', () => {
    collectForm();
    saveSettings(settings);
    showToast('Changes saved ✓');
  }));

  $('#previewBtn').addEventListener('click', () => {
    collectForm();
    saveSettings(settings);
    window.open('index.html', '_blank');
  });

  // Reset with confirmation modal
  const resetModal = $('#resetModal');
  $$('#resetBtn, #resetBtnBottom').forEach(btn => btn && btn.addEventListener('click', () => resetModal.classList.add('show')));
  $('#cancelReset').addEventListener('click', () => resetModal.classList.remove('show'));
  $('#confirmReset').addEventListener('click', () => {
    settings = resetSettings();
    populateForm();
    resetModal.classList.remove('show');
    showToast('Reset to default');
  });

  // Warn on unload if there are unsaved changes is out of scope for a static demo;
  // keep it simple and rely on explicit Save.
})();

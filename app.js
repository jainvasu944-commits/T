(function () {
  const settings = loadSettings();
  applyThemeVars(settings.design);

  document.title = settings.general.tabTitle || "I'm Sorry";
  const titleMeta = document.getElementById('websiteTitleMeta');
  if (titleMeta) titleMeta.textContent = settings.general.websiteTitle || '';

  const t = (text) => interpolate(text, settings);

  // ---------------- Populate content ----------------
  document.getElementById('openingHeading').textContent = t(settings.opening.heading);
  document.getElementById('openingSubtitle').textContent = t(settings.opening.subtitle);
  document.getElementById('openBtn').textContent = settings.opening.buttonText;

  const cardsContainer = document.getElementById('cardsContainer');
  settings.cards.forEach((card, i) => {
    const screen = document.createElement('section');
    screen.className = 'screen';
    screen.dataset.screen = `card-${i}`;
    screen.innerHTML = `
      <div class="card-inner">
        <div class="message-card">
          <h2 class="message-heading">${escapeHtml(t(card.heading))}</h2>
          <p class="message-body">${escapeHtml(t(card.message))}</p>
        </div>
        <div class="nav-row">
          <button class="btn" data-action="next">${i === settings.cards.length - 1 ? 'Continue' : 'Next'}</button>
        </div>
      </div>`;
    cardsContainer.appendChild(screen);
  });

  document.getElementById('finalHeading').textContent = t(settings.final.heading);
  document.getElementById('finalMessage').textContent = t(settings.final.message);
  document.getElementById('finalClosing').textContent = t(settings.final.closing);
  document.getElementById('replayBtn').textContent = settings.final.replayText;

  if (settings.general.friendName) {
    document.querySelectorAll('.friend-name-slot').forEach(el => {
      el.textContent = settings.general.friendName;
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------------- Screen navigation ----------------
  const screens = Array.from(document.querySelectorAll('.screen'));
  const dotTrack = document.getElementById('dotTrack');
  screens.forEach(() => {
    const d = document.createElement('div');
    d.className = 'dot';
    dotTrack.appendChild(d);
  });
  const dots = Array.from(dotTrack.children);

  let current = 0;
  function showScreen(index) {
    screens[current].classList.remove('active');
    current = Math.max(0, Math.min(index, screens.length - 1));
    screens[current].classList.add('active');
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }
  showScreen(0);

  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="next"]');
    if (btn) showScreen(current + 1);
  });

  document.getElementById('replayBtn').addEventListener('click', () => {
    resetGame();
    showScreen(0);
  });

  // ---------------- Evasive "No" button ----------------
  const noBtn = document.getElementById('noBtn');
  const forgiveWrap = document.getElementById('forgiveButtons');
  function dodge() {
    const wrapRect = forgiveWrap.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    const maxX = window.innerWidth - btnRect.width - 24;
    const maxY = window.innerHeight - btnRect.height - 24;
    const x = Math.random() * maxX - wrapRect.left + wrapRect.width / 2;
    const y = Math.random() * maxY - wrapRect.top;
    noBtn.style.position = 'fixed';
    noBtn.style.left = Math.max(12, Math.min(window.innerWidth - btnRect.width - 12, Math.random() * (window.innerWidth - btnRect.width - 24) + 12)) + 'px';
    noBtn.style.top = Math.max(12, Math.min(window.innerHeight - btnRect.height - 12, Math.random() * (window.innerHeight - btnRect.height - 24) + 12)) + 'px';
  }
  noBtn.addEventListener('mouseenter', dodge);
  noBtn.addEventListener('touchstart', (e) => { e.preventDefault(); dodge(); }, { passive: false });
  noBtn.addEventListener('click', (e) => { e.preventDefault(); dodge(); });

  document.getElementById('yesBtn').addEventListener('click', () => {
    showScreen(current + 1);
  });

  function resetGame() {
    noBtn.style.position = '';
    noBtn.style.left = '';
    noBtn.style.top = '';
    ttt.reset();
  }

  // ---------------- Tiny tic-tac-toe ----------------
  const ttt = (function () {
    const boardEl = document.getElementById('tttBoard');
    const statusEl = document.getElementById('tttStatus');
    const continueBtn = document.getElementById('tttContinue');
    let board, gameOver;

    function reset() {
      board = Array(9).fill(null);
      gameOver = false;
      statusEl.textContent = 'Your move — you\'re X.';
      continueBtn.style.display = 'none';
      render();
    }

    function render() {
      boardEl.innerHTML = '';
      board.forEach((val, i) => {
        const cell = document.createElement('button');
        cell.className = 'ttt-cell';
        cell.type = 'button';
        cell.textContent = val || '';
        cell.disabled = !!val || gameOver;
        cell.addEventListener('click', () => playerMove(i));
        boardEl.appendChild(cell);
      });
    }

    function winner(b) {
      const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
      for (const [a,b2,c] of lines) {
        if (b[a] && b[a] === b[b2] && b[a] === b[c]) return b[a];
      }
      return b.every(Boolean) ? 'draw' : null;
    }

    function playerMove(i) {
      if (board[i] || gameOver) return;
      board[i] = 'X';
      const w = winner(board);
      if (w) return finish(w);
      render();
      setTimeout(computerMove, 450);
    }

    function computerMove() {
      // Gentle AI: mostly random, occasionally blocks — keeps it light, not brutal.
      const empty = board.map((v, i) => v ? null : i).filter(v => v !== null);
      if (!empty.length) return;
      let move = empty[Math.floor(Math.random() * empty.length)];
      board[move] = 'O';
      const w = winner(board);
      if (w) return finish(w);
      render();
    }

    function finish(w) {
      gameOver = true;
      render();
      if (w === 'draw') statusEl.textContent = "A draw — fitting, honestly.";
      else if (w === 'X') statusEl.textContent = "You win. As it should be.";
      else statusEl.textContent = "I win this round. Doesn't change anything I said.";
      continueBtn.style.display = 'inline-block';
    }

    return { reset };
  })();
  ttt.reset();

  // ---------------- Petals ----------------
  const canvas = document.getElementById('petal-canvas');
  const ctx = canvas.getContext('2d');
  let petals = [];
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function makePetal() {
    return {
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 100,
      size: 6 + Math.random() * 8,
      speed: 0.4 + Math.random() * 0.8,
      drift: (Math.random() - 0.5) * 0.6,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      hue: Math.random() > 0.5 ? settings.design.accent : '#ffffff'
    };
  }

  if (!prefersReducedMotion) {
    for (let i = 0; i < 24; i++) petals.push(makePetal());
    (function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      petals.forEach(p => {
        p.y += p.speed;
        p.x += p.drift;
        p.rot += p.rotSpeed;
        if (p.y > canvas.height + 20) Object.assign(p, makePetal(), { y: -20 });
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.hue;
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      requestAnimationFrame(loop);
    })();
  }

  // ---------------- Music ----------------
  const musicBtn = document.getElementById('musicToggle');
  const audio = document.getElementById('bgAudio');
  if (settings.music.enabled && settings.music.url) {
    audio.src = settings.music.url;
    musicBtn.style.display = 'flex';
  } else {
    musicBtn.style.display = 'none';
  }
  let playing = false;
  musicBtn.addEventListener('click', () => {
    if (playing) {
      audio.pause();
      musicBtn.classList.remove('playing');
    } else {
      audio.play().catch(() => {});
      musicBtn.classList.add('playing');
    }
    playing = !playing;
  });
})();

(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasIO = 'IntersectionObserver' in window;

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Header border once scrolled ---------- */
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Active nav link ---------- */
  // Only on the home page: in-page section links get a scroll-spy.
  const navLinks = [...document.querySelectorAll('.nav a')]
    .filter((a) => a.hash && a.pathname === location.pathname && document.getElementById(a.hash.slice(1)));
  if (hasIO && navLinks.length) {
    const byId = new Map(navLinks.map((a) => [a.hash.slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const link = byId.get(entry.target.id);
        if (!link) continue;
        if (entry.isIntersecting) {
          navLinks.forEach((a) => a.removeAttribute('aria-current'));
          link.setAttribute('aria-current', 'true');
        } else if (link.hasAttribute('aria-current') && entry.boundingClientRect.top > 0) {
          link.removeAttribute('aria-current'); // scrolled back up above the first section
        }
      }
    }, { rootMargin: '-45% 0px -50% 0px' });
    byId.forEach((_, id) => {
      const section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  }

  /* ---------- UART traces: 8N1, LSB first ---------- */
  const NS = 'http://www.w3.org/2000/svg';

  function el(name, attrs, text) {
    const node = document.createElementNS(NS, name);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    if (text != null) node.textContent = text;
    return node;
  }

  function buildTrace(svg) {
    const message = svg.dataset.trace;
    const mini = svg.hasAttribute('data-compact');
    const width = Math.max(120, Math.round(svg.getBoundingClientRect().width));
    const narrow = width < 560;
    const height = mini ? 22 : narrow ? 88 : 104;
    const hi = mini ? 3 : 12;
    const lo = mini ? 19 : narrow ? 44 : 52;

    // idle, then each byte as start + 8 data + stop, one idle bit between bytes
    const lead = mini ? 2 : 3;
    const totalBits = lead * 2 + message.length * 10 + (message.length - 1);
    const bw = width / totalBits;

    svg.replaceChildren();
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('height', height);

    const levels = [];
    const push = (bit, n = 1) => { for (let k = 0; k < n; k++) levels.push(bit); };
    const frames = [];

    push(1, lead);
    [...message].forEach((ch, idx) => {
      if (idx) push(1);
      const code = ch.charCodeAt(0);
      frames.push({ start: levels.length, code, ch });
      push(0);                                           // start bit
      for (let b = 0; b < 8; b++) push((code >> b) & 1); // data, LSB first
      push(1);                                           // stop bit
    });
    push(1, lead);

    if (!mini) {
      for (const f of frames) {
        const x0 = f.start * bw;
        svg.append(el('rect', { class: 'frame', x: x0 + bw, y: hi - 4, width: bw * 8, height: lo - hi + 8, rx: 3 }));
        for (let b = 0; b <= 10; b++) {
          const x = x0 + b * bw;
          svg.append(el('line', { class: 'tick', x1: x, x2: x, y1: lo + 6, y2: lo + 10 }));
        }
        const label = el('text', { class: 'byte', x: x0 + bw * 5, y: height - 8, 'text-anchor': 'middle' });
        if (!narrow) label.append(`0x${f.code.toString(16).toUpperCase()} `);
        label.append(el('tspan', { class: 'byte-char' }, `'${f.ch}'`));
        svg.append(label);
      }
    }

    const y = (bit) => (bit ? hi : lo);
    let d = `M0 ${y(levels[0])}`;
    levels.forEach((bit, i) => {
      if (i && bit !== levels[i - 1]) d += ` V${y(bit)}`;
      d += ` H${((i + 1) * bw).toFixed(2)}`;
    });
    const path = el('path', { class: 'signal', d });
    if (mini) path.style.strokeWidth = '1.5';
    svg.append(path);
    path.style.setProperty('--len', Math.ceil(path.getTotalLength()));
  }

  const traces = [...document.querySelectorAll('[data-trace]')];
  traces.forEach(buildTrace);

  // The one authored motion moment: the hero trace draws itself once.
  const hero = document.querySelector('[data-trace][data-animate]');
  if (hero && !reduceMotion && hasIO) {
    hero.classList.add('pending');
    const tio = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      tio.disconnect();
      requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('drawn')));
    }, { threshold: 0.4 });
    tio.observe(hero);
  }

  let raf = 0;
  const widths = new Map(traces.map((s) => [s, s.getBoundingClientRect().width]));
  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      for (const svg of traces) {
        const w = svg.getBoundingClientRect().width;
        if (Math.abs(w - widths.get(svg)) < 1) continue;
        widths.set(svg, w);
        buildTrace(svg);
      }
    });
  });

  /* ---------- Toast ---------- */
  const toastEl = document.getElementById('toast');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

  /* ---------- Copy email ---------- */
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        toast('Email copied');
      } catch {
        // Clipboard blocked: select the address so the visitor can copy it themselves.
        const target = document.getElementById(btn.dataset.copyTarget);
        const range = document.createRange();
        range.selectNodeContents(target);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        toast('Address selected. Press Ctrl+C (or ⌘C) to copy.');
      }
    });
  });

  /* ---------- Copy buttons on code listings ---------- */
  document.querySelectorAll('.prose .highlight').forEach((block) => {
    const code = block.querySelector('code');
    if (!code) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'code-copy';
    btn.textContent = 'Copy';
    btn.setAttribute('aria-label', 'Copy code');
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.innerText.replace(/\n$/, ''));
        toast('Code copied');
      } catch {
        toast('Copy blocked by the browser. Select the code and copy it.');
      }
    });
    block.append(btn);
  });

  /* ---------- Contact form (Formspree, mailto fallback) ---------- */
  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = document.getElementById('form-status');
  const EMAIL = 'edensheiko@gmail.com';

  function setStatus(msg, isError = false) {
    status.textContent = msg;
    status.classList.toggle('error', isError);
  }

  function fieldError(field) {
    const value = field.value.trim();
    if (field.type === 'email') {
      if (!value) return 'Add your email so I can reply.';
      if (!field.checkValidity()) return 'That email looks incomplete. It needs an @ and a domain, like name@example.com.';
      return '';
    }
    if (!value) return document.getElementById(`${field.id}-err`).dataset.empty;
    return '';
  }

  const fields = [...form.querySelectorAll('[required]')];
  fields.forEach((field) => {
    const err = document.getElementById(`${field.id}-err`);
    err.dataset.empty = err.textContent;
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true' && !fieldError(field)) {
        field.removeAttribute('aria-invalid');
        err.hidden = true;
        const left = form.querySelectorAll('[aria-invalid="true"]').length;
        if (!left) setStatus('');
        else setStatus(left === 1 ? 'One field needs a fix.' : `${left} fields need a fix.`, true);
      }
    });
  });

  function validate() {
    let firstBad = null;
    let count = 0;
    for (const field of fields) {
      const msg = fieldError(field);
      const err = document.getElementById(`${field.id}-err`);
      if (msg) {
        err.textContent = msg;
        err.hidden = false;
        field.setAttribute('aria-invalid', 'true');
        count++;
        firstBad ??= field;
      } else {
        err.hidden = true;
        field.removeAttribute('aria-invalid');
      }
    }
    if (firstBad) {
      setStatus(count === 1 ? 'One field needs a fix.' : `${count} fields need a fix.`, true);
      firstBad.focus();
      return false;
    }
    return true;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = new FormData(form);
    const configured = !form.action.includes('YOUR_FORM_ID');

    if (!configured) {
      const subject = encodeURIComponent(`Portfolio message from ${data.get('name')}`);
      const body = encodeURIComponent(`${data.get('message')}\n\n${data.get('name')} <${data.get('email')}>`);
      window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
      setStatus(`Your email app should open with the message filled in. If nothing opens, write to ${EMAIL}.`);
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = 'Sending…';
    setStatus('');
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        // Formspree answers 4xx with { errors: [{ field, message }] }.
        const body = await res.json().catch(() => ({}));
        const reason = (body.errors || []).map((er) => er.message).join(' ');
        throw new Error(reason);
      }
      form.reset();
      setStatus("Message sent. I'll reply by email.");
    } catch (err) {
      // Keep what they typed so nothing is lost.
      const reason = err.message ? `${err.message} ` : '';
      setStatus(`It didn't go through. ${reason}Your message is still here; try again, or email ${EMAIL}.`, true);
    } finally {
      button.disabled = false;
      button.textContent = 'Send message';
    }
  });
})();

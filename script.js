// Caixa tipográfica interativa: o cursor controla espaçamento, fonte, sublinhado e reação por letra.
(() => {
  const box = document.querySelector('.hero'), name = document.querySelector('.name'), state = document.querySelector('.state');
  if (!box) return;
  const letters = [...name.querySelectorAll('.l')];
  const fonts = [
    ['pixel', 'var(--pixel)', 'normal'],
    ['mono',  'var(--mono)',  'normal'],
    ['serif', 'var(--serif)', 'italic'],
  ];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cur = {x:.5, y:.5, near:false}, spacing = 0, target = 0, raf = null, mx = 0, my = 0, active = false;
  const lerp = (a, b, t) => a + (b - a) * t;

  function setFont(i){
    name.style.fontFamily = fonts[i][1];
    name.style.fontStyle = fonts[i][2];
    return fonts[i][0];
  }
  function frame(){
    spacing = lerp(spacing, target, .12);
    name.style.letterSpacing = spacing.toFixed(2) + 'em';
    const r = box.getBoundingClientRect();
    letters.forEach(el => {
      if (!active || calm) { el.style.transform = ''; el.style.opacity = ''; return; }
      const b = el.getBoundingClientRect(), dx = mx - (b.left + b.width / 2), dy = my - (b.top + b.height / 2);
      const d = Math.hypot(dx, dy), f = Math.max(0, 1 - d / 160);
      el.style.transform = `translate(${(-dx * f * .15).toFixed(1)}px,${(-dy * f * .15).toFixed(1)}px) scale(${(1 + f * .35).toFixed(2)})`;
      el.style.opacity = (.55 + f * .45).toFixed(2);
    });
    if (active || Math.abs(spacing - target) > .002) raf = requestAnimationFrame(frame); else raf = null;
  }
  function kick(){ if (!raf) raf = requestAnimationFrame(frame); }

  box.addEventListener('pointermove', e => {
    const r = box.getBoundingClientRect();
    mx = e.clientX; my = e.clientY; active = true;
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    target = (1 - x) * 0.45 - 0.05;            // esquerda: afasta | direita: aproxima
    const zone = y < .33 ? 2 : y > .66 ? 0 : 1; // topo: serifa | meio: mono | base: pixel
    const f = setFont(y < .33 ? 2 : y > .66 ? 0 : 1);
    const under = y > .66;                      // embaixo: sublinhado
    letters.forEach(l => l.style.textDecoration = under ? 'underline' : 'none');
    state.textContent = `fonte: ${f}\nespaço: ${target.toFixed(2)}em${under ? '\nsublinhado: on' : ''}`;
    kick();
  });
  box.addEventListener('pointerleave', () => {
    active = false; target = 0; setFont(0);
    letters.forEach(l => l.style.textDecoration = 'none');
    state.textContent = 'estado: repouso';
    kick();
  });
  setFont(0); state.style.whiteSpace = 'pre';
})();

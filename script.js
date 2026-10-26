// =========================================================
// script.js · usado em todas as páginas
// Cada parte fica dentro de uma função própria. Se o elemento
// não existir na página (ex.: o nome interativo só existe na home),
// a função simplesmente não faz nada.
// =========================================================

// As páginas que ficam dentro de /casos e /notas precisam de "../"
// antes dos links. O <body data-root="../"> avisa isso pro script.
const ROOT = document.body.dataset.root || '';
const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;


// ---------------------------------------------------------
// 1. NOME INTERATIVO (só na home)
// O cursor controla: esquerda/direita = espaçamento,
// cima/meio/baixo = fonte, embaixo = sublinhado,
// e as letras perto do cursor "fogem" e crescem.
// ---------------------------------------------------------
function nomeInterativo(){
  const box = document.querySelector('.hero');
  if (!box) return;
  const name = box.querySelector('.name');
  const state = box.querySelector('.state');
  const letters = [...name.querySelectorAll('.l')];

  const fonts = [
    { nome: 'pixel', familia: 'var(--pixel)', estilo: 'normal' },
    { nome: 'mono',  familia: 'var(--mono)',  estilo: 'normal' },
    { nome: 'serif', familia: 'var(--serif)', estilo: 'italic' },
  ];
  let fonteAtual = -1;
  let spacing = 0, target = 0;   // espaçamento atual e o que ele quer alcançar
  let mx = 0, my = 0;            // posição do cursor
  let active = false, raf = null;
  const lerp = (a, b, t) => a + (b - a) * t;

  function setFont(i){
    if (i === fonteAtual) return;  // só troca se mudou (antes trocava a cada movimento)
    fonteAtual = i;
    name.style.fontFamily = fonts[i].familia;
    name.style.fontStyle = fonts[i].estilo;
  }

  function frame(){
    spacing = lerp(spacing, target, .12);
    name.style.letterSpacing = spacing.toFixed(3) + 'em';

    if (active && !calmo){
      // Primeiro LÊ a posição de todas as letras, depois ESCREVE.
      // offsetLeft/offsetTop ignoram o transform, então a letra não
      // "foge de si mesma" (era isso que fazia as letras tremerem).
      const base = name.getBoundingClientRect();
      const centros = letters.map(el => ({
        x: base.left + el.offsetLeft + el.offsetWidth / 2,
        y: base.top + el.offsetTop + el.offsetHeight / 2,
      }));
      letters.forEach((el, i) => {
        const dx = mx - centros[i].x, dy = my - centros[i].y;
        const f = Math.max(0, 1 - Math.hypot(dx, dy) / 160); // 1 = colado no cursor, 0 = longe
        el.style.transform = `translate(${(-dx * f * .15).toFixed(1)}px,${(-dy * f * .15).toFixed(1)}px) scale(${(1 + f * .35).toFixed(2)})`;
        el.style.opacity = (.55 + f * .45).toFixed(2);
      });
    } else {
      letters.forEach(el => { el.style.transform = ''; el.style.opacity = ''; });
    }

    // continua animando só enquanto precisa
    if (active || Math.abs(spacing - target) > .002) raf = requestAnimationFrame(frame);
    else raf = null;
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

  box.addEventListener('pointermove', e => {
    const r = box.getBoundingClientRect();
    mx = e.clientX; my = e.clientY; active = true;
    const x = (e.clientX - r.left) / r.width;   // 0 (esquerda) até 1 (direita)
    const y = (e.clientY - r.top) / r.height;   // 0 (topo) até 1 (base)
    target = (1 - x) * 0.3 - 0.04;               // esquerda: afasta | direita: aproxima
    const i = y < .33 ? 2 : y > .66 ? 0 : 1;      // topo: serifa | meio: mono | base: pixel
    setFont(i);
    const sublinhado = y > .66;
    name.classList.toggle('sublinhado', sublinhado);
    state.textContent = `fonte: ${fonts[i].nome}\nespaço: ${target.toFixed(2)}em${sublinhado ? '\nsublinhado: on' : ''}`;
    kick();
  });

  // pointerleave = cursor saiu | pointercancel = o dedo começou a rolar a página
  const repouso = () => {
    active = false; target = 0; setFont(0);
    name.classList.remove('sublinhado');
    state.textContent = 'estado: repouso';
    kick();
  };
  box.addEventListener('pointerleave', repouso);
  box.addEventListener('pointercancel', repouso);

  setFont(0);
}


// ---------------------------------------------------------
// 2. BUSCA DO SITE
// Uma listinha com todas as páginas. Pra uma página nova
// aparecer na busca, é só adicionar uma linha aqui.
// ---------------------------------------------------------
const PAGINAS = [
  { titulo: 'Início',                        url: 'index.html',                          tipo: 'página',  tags: 'home karina rodrigues contato' },
  { titulo: 'Sobre mim',                     url: 'sobre.html',                          tipo: 'página',  tags: 'história trajetória poesia rio de janeiro quem sou' },
  { titulo: 'Projetos',                      url: 'projects.html',                       tipo: 'página',  tags: 'portfólio trabalhos' },
  { titulo: 'Laboratório',                   url: 'lab.html',                            tipo: 'página',  tags: 'notas estudos experimentos' },
  { titulo: 'Jane Doe / OS',                 url: 'casos/jane-doe-os.html',              tipo: 'projeto', tags: 'html css javascript investigação arg sistema operacional fictício' },
  { titulo: 'Echoes of Reality',             url: 'casos/echoes-of-reality.html',        tipo: 'projeto', tags: 'javascript ficção interativa jogo navegador' },
  { titulo: 'Vigilant',                      url: 'casos/vigilant.html',                 tipo: 'projeto', tags: 'python flask segurança aplicação web' },
  { titulo: 'Depuração de gráficos no Linux',url: 'notas/depuracao-graficos-linux.html', tipo: 'nota',    tags: 'linux ubuntu nvidia intel gdm gnome wayland xorg kernel dkms grub journalctl' },
  { titulo: 'Wazuh SIEM',                    url: 'notas/wazuh-siem.html',               tipo: 'nota',    tags: 'siem monitoramento logs defensivo blue team' },
  { titulo: 'Anotações de segurança web',    url: 'notas/anotacoes-seguranca-web.html',  tipo: 'nota',    tags: 'web cookies sessões autenticação requisições vulnerabilidade' },
  { titulo: 'Git e GitHub',                  url: 'notas/git-e-github.html',             tipo: 'nota',    tags: 'git github pages repositório readme' },
  { titulo: 'Discord Rich Presence',         url: 'notas/discord-rich-presence.html',    tipo: 'código',  tags: 'rust cargo systemd serviço linux discord' },
];

// tira acentos e deixa minúsculo: "Depuração" -> "depuracao"
const normaliza = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function busca(){
  const form = document.querySelector('.busca');
  if (!form) return;
  const input = form.querySelector('input');
  const lista = form.querySelector('.busca-res');

  function mostra(){
    const q = normaliza(input.value.trim());
    lista.innerHTML = '';
    if (!q) return;
    const achados = PAGINAS.filter(p => normaliza(`${p.titulo} ${p.tipo} ${p.tags}`).includes(q));
    if (!achados.length){
      lista.innerHTML = '<li class="vazio">nada por aqui :(</li>';
      return;
    }
    for (const p of achados){
      // criando os elementos um a um (em vez de innerHTML com o texto digitado)
      // pra ninguém conseguir injetar HTML pela busca
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = ROOT + p.url;
      a.textContent = p.titulo;
      const small = document.createElement('small');
      small.textContent = p.tipo;
      a.append(small);
      li.append(a);
      lista.append(li);
    }
  }

  input.addEventListener('input', mostra);

  // Enter abre o primeiro resultado
  form.addEventListener('submit', e => {
    e.preventDefault();
    const primeiro = lista.querySelector('a');
    if (primeiro) location.href = primeiro.href;
  });

  // Esc limpa; seta pra baixo entra na lista
  form.addEventListener('keydown', e => {
    if (e.key === 'Escape'){ input.value = ''; mostra(); input.focus(); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp'){
      const links = [...lista.querySelectorAll('a')];
      if (!links.length) return;
      e.preventDefault();
      const i = links.indexOf(document.activeElement);
      const prox = e.key === 'ArrowDown' ? Math.min(i + 1, links.length - 1) : i - 1;
      (prox < 0 ? input : links[prox]).focus();
    }
  });

  // clicou fora, fecha
  document.addEventListener('click', e => { if (!form.contains(e.target)) lista.innerHTML = ''; });
}


// ---------------------------------------------------------
// 3. STICKERS ARRASTÁVEIS
// Dá pra arrastar os stickers pela página. A posição fica
// salva no navegador de quem visitou. Dois cliques = volta
// pro lugar. O botão "arrumar stickers" reseta todos.
// ---------------------------------------------------------
function stickers(){
  const todos = document.querySelectorAll('.sticker');
  if (!todos.length) return;
  const chave = 'stickers:' + location.pathname;

  // localStorage pode falhar (aba anônima, por exemplo), por isso o try/catch
  let salvo = {};
  try { salvo = JSON.parse(localStorage.getItem(chave)) || {}; } catch {}
  const guarda = () => { try { localStorage.setItem(chave, JSON.stringify(salvo)); } catch {} };

  const posiciona = (el, x, y) => {
    el.style.setProperty('--dx', x + 'px');
    el.style.setProperty('--dy', y + 'px');
  };

  todos.forEach(el => {
    const id = el.dataset.id;
    if (salvo[id]) posiciona(el, salvo[id].x, salvo[id].y);

    el.addEventListener('pointerdown', e => {
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      el.classList.add('arrastando');
      const inicio = { x: e.clientX, y: e.clientY };
      const antes = salvo[id] || { x: 0, y: 0 };

      const move = ev => {
        salvo[id] = { x: antes.x + ev.clientX - inicio.x, y: antes.y + ev.clientY - inicio.y };
        posiciona(el, salvo[id].x, salvo[id].y);
      };
      const solta = () => {
        el.classList.remove('arrastando');
        el.removeEventListener('pointermove', move);
        guarda();
      };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', solta, { once: true });
      el.addEventListener('pointercancel', solta, { once: true });
    });

    el.addEventListener('dblclick', () => {
      delete salvo[id];
      posiciona(el, 0, 0);
      guarda();
    });
  });

  const reset = document.querySelector('[data-reset-stickers]');
  if (reset) reset.addEventListener('click', () => {
    salvo = {};
    todos.forEach(el => posiciona(el, 0, 0));
    guarda();
  });
}


nomeInterativo();
busca();
stickers();

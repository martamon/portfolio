// Language of the whole site: English (the original), Spanish and Galician.
// The text of the pages is translated here from a table (every text node is matched against its English original, so nothing is
// sent to any service and nothing flashes in a foreign script), and a discreet "EN · ES · GL" switch in the corner changes it.
// New texts that are not in the table simply stay in English. The choice is remembered.
const NAMES = ['en', 'es', 'gl'];
const norm = (s) => s.replace(/\s+/g, ' ').trim();

// [English, Spanish, Galician]
const ROWS = [
  ['Local time', 'Hora local', 'Hora local'],
  ['Coming soon', 'Próximamente', 'Próximamente'],
  ['MORE HERE', 'MÁS AQUÍ', 'MÁIS AQUÍ'],
  ['More projects', 'Más proyectos', 'Máis proxectos'],
  ['MORE PROJECTS', 'MÁS PROYECTOS', 'MÁIS PROXECTOS'],
  ['About', 'Sobre mí', 'Sobre min'],
  ['Contact', 'Contacto', 'Contacto'],
  ['Ai specialist & photographer. Designer', 'Especialista en IA y fotógrafa. Diseñadora', 'Especialista en IA e fotógrafa. Deseñadora'],
  ['Experience', 'Experiencia', 'Experiencia'],
  ['Skills', 'Habilidades', 'Habilidades'],
  ['AI SPECIALIST- WPP', 'ESPECIALISTA EN IA- WPP', 'ESPECIALISTA EN IA- WPP'],
  ['ADMINISTRATOR- GAIAS EVENTOS', 'ADMINISTRADORA- GAIAS EVENTOS', 'ADMINISTRADORA- GAIAS EVENTOS'],
  ['ASSISTANT- PARFOIS', 'ASISTENTE- PARFOIS', 'ASISTENTE- PARFOIS'],
  ['PHOTOGRAPHER- VISENTA STUDIO', 'FOTÓGRAFA- VISENTA STUDIO', 'FOTÓGRAFA- VISENTA STUDIO'],
  ['GRAPHIC DESIGNER- YOUR FIRST', 'DISEÑADORA GRÁFICA- YOUR FIRST', 'DESEÑADORA GRÁFICA- YOUR FIRST'],
  ['2024 - ongoing', '2024 - actualidad', '2024 - actualidade'],
  ['2020 - 2024 (SUMMER)', '2020 - 2024 (VERANO)', '2020 - 2024 (VERÁN)'],
  ['GET IN TOUCH', 'CONTACTA CONMIGO', 'CONTACTA COMIGO'],
  ['E-mail', 'Correo', 'Correo'],
  ['↳ Made by Martamon', '↳ Hecho por Martamon', '↳ Feito por Martamon'],
  ['Art Direction, Photography', 'Dirección de arte, fotografía', 'Dirección de arte, fotografía'],
  ['Art direction, Photography', 'Dirección de arte, fotografía', 'Dirección de arte, fotografía'],
  ['Art direction, Ai image generative', 'Dirección de arte, generación de imágenes con IA', 'Dirección de arte, xeración de imaxes con IA'],
  ['Photography', 'Fotografía', 'Fotografía'],
  ['Ai generative and retoucher', 'IA generativa y retoque', 'IA xenerativa e retoque'],
  ['Brand identity', 'Identidad de marca', 'Identidade de marca'],
  ['TFG Editorial design & photography', 'TFG Diseño editorial y fotografía', 'TFG Deseño editorial e fotografía'],
  ['My greece trip.', 'Mi viaje a Grecia.', 'A miña viaxe a Grecia.'],
  ['Dutch born, Japanese raised art director based in Cape Town focusing on branding & design in expressive forms.',
    'Director de arte nacido en los Países Bajos y criado en Japón, afincado en Ciudad del Cabo, centrado en branding y diseño en formas expresivas.',
    'Director de arte nado nos Países Baixos e criado en Xapón, afincado en Cidade do Cabo, centrado en branding e deseño en formas expresivas.'],
  ['I am a photographer, retoucher, and AI image creator. I currently work at WPP PRODUCTION (Madrid), part of the multinational advertising group WPP, Participating in projects for brands such as Coca-Cola, Toyota, Procter & Gamble, Iberdrola, Google, Schweppes, Colgate-Palmolive... Specializing in photography and digital retouching, I am currently fully focused on the Artificial Intelligence department, where I develop projects for generating and animating images using AI. In addition, I perform other roles within the field of graphic design, such as web design (including this website), advanced use of the Adobe suite, and the creation of corporate identities and product design.',
    'Soy fotógrafa, retocadora y creadora de imágenes con IA. Actualmente trabajo en WPP PRODUCTION (Madrid), parte del grupo publicitario multinacional WPP, participando en proyectos para marcas como Coca-Cola, Toyota, Procter & Gamble, Iberdrola, Google, Schweppes, Colgate-Palmolive... Especializada en fotografía y retoque digital, ahora estoy totalmente centrada en el departamento de Inteligencia Artificial, donde desarrollo proyectos de generación y animación de imágenes con IA. Además, desempeño otras funciones dentro del diseño gráfico, como el diseño web (incluida esta web), el uso avanzado de la suite de Adobe y la creación de identidades corporativas y diseño de producto.',
    'Son fotógrafa, retocadora e creadora de imaxes con IA. Actualmente traballo en WPP PRODUCTION (Madrid), parte do grupo publicitario multinacional WPP, participando en proxectos para marcas como Coca-Cola, Toyota, Procter & Gamble, Iberdrola, Google, Schweppes, Colgate-Palmolive... Especializada en fotografía e retoque dixital, agora estou totalmente centrada no departamento de Intelixencia Artificial, onde desenvolvo proxectos de xeración e animación de imaxes con IA. Ademais, desempeño outras funcións dentro do deseño gráfico, como o deseño web (incluída esta web), o uso avanzado da suite de Adobe e a creación de identidades corporativas e deseño de produto.'],
  ['Throughout the years, we have witnessed various forms of social discrimination due to multiple factors such as social class, gender, race, ideology, among others. One of the causes that divides society into different groups is the difference in clothing. In the realm of cultures, subcultures, and styles, numerous cases of discrimination have occurred. The fashion industry itself has contributed significantly to this situation. Although in recent years, certain types of clothing and subcultures have started to be accepted in the fashion world, there are still everyday events that harm the lives of some individuals. These events include rejection at the entrance to certain establishments, disdainful looks on the street, negative comments on social media, and unnecessary opinions, among other ongoing occurrences. The project consists of a punk fashion magazine, considered the pioneer of protest fashion. One of the main objectives of this movement is to express discontent towards society and the imposed norms. The idea is to continue in the future with possible volumes on other movements within alternative fashion, such as gothic fashion, hippie fashion, among others.',
    'A lo largo de los años hemos sido testigos de diversas formas de discriminación social debidas a múltiples factores como la clase social, el género, la raza o la ideología, entre otros. Una de las causas que divide a la sociedad en grupos es la diferencia en la forma de vestir. En el ámbito de las culturas, las subculturas y los estilos se han dado numerosos casos de discriminación. La propia industria de la moda ha contribuido de forma significativa a esta situación. Aunque en los últimos años ciertos tipos de ropa y subculturas han empezado a ser aceptados en el mundo de la moda, siguen existiendo hechos cotidianos que dañan la vida de algunas personas. Entre ellos, el rechazo en la entrada de ciertos establecimientos, las miradas despectivas en la calle, los comentarios negativos en redes sociales y las opiniones innecesarias, entre otros. El proyecto consiste en una revista de moda punk, considerada pionera de la moda de protesta. Uno de los principales objetivos de este movimiento es expresar el descontento hacia la sociedad y las normas impuestas. La idea es continuar en el futuro con posibles volúmenes sobre otros movimientos de la moda alternativa, como la moda gótica o la moda hippie, entre otros.',
    'Ao longo dos anos fomos testemuñas de diversas formas de discriminación social debidas a múltiples factores como a clase social, o xénero, a raza ou a ideoloxía, entre outros. Unha das causas que divide a sociedade en grupos é a diferenza na forma de vestir. No ámbito das culturas, as subculturas e os estilos déronse numerosos casos de discriminación. A propia industria da moda contribuíu de forma significativa a esta situación. Aínda que nos últimos anos certos tipos de roupa e subculturas comezaron a ser aceptados no mundo da moda, seguen existindo feitos cotiáns que danan a vida dalgunhas persoas. Entre eles, o rexeitamento na entrada de certos establecementos, as miradas desdeñosas na rúa, os comentarios negativos nas redes sociais e as opinións innecesarias, entre outros. O proxecto consiste nunha revista de moda punk, considerada pioneira da moda de protesta. Un dos principais obxectivos deste movemento é expresar o descontento cara á sociedade e as normas impostas. A idea é continuar no futuro con posibles volumes sobre outros movementos da moda alternativa, como a moda gótica ou a moda hippie, entre outros.'],
  ["A few years ago, I wrote down a goal in my school notebook for my 20s: to travel to Asia. Today, at 24, I can say I've achieved that goal with one of the most incredible trips of my life. It was an experience shared with my WeRoad group. I know that during the trip, many didn't quite understand why I always had my camera in hand. Today, seeing the result of all those photos and this video, I hope you can see what my eyes were capturing. China is a fascinating blend of past and future that has changed my perspective. I'm sharing this short summary of what was an unforgettable adventure.",
    'Hace unos años escribí en mi cuaderno del colegio una meta para mis veinte: viajar a Asia. Hoy, con 24 años, puedo decir que la he cumplido con uno de los viajes más increíbles de mi vida. Fue una experiencia compartida con mi grupo de WeRoad. Sé que durante el viaje muchos no entendían muy bien por qué siempre llevaba la cámara en la mano. Hoy, al ver el resultado de todas esas fotos y de este vídeo, espero que puedas ver lo que mis ojos estaban captando. China es una fascinante mezcla de pasado y futuro que ha cambiado mi perspectiva. Comparto este pequeño resumen de lo que fue una aventura inolvidable.',
    'Hai uns anos escribín no meu caderno do colexio unha meta para os meus vinte: viaxar a Asia. Hoxe, con 24 anos, podo dicir que a cumprín cunha das viaxes máis incribles da miña vida. Foi unha experiencia compartida co meu grupo de WeRoad. Sei que durante a viaxe moitos non entendían moi ben por que levaba sempre a cámara na man. Hoxe, ao ver o resultado de todas esas fotos e deste vídeo, espero que poidas ver o que os meus ollos estaban captando. China é unha fascinante mestura de pasado e futuro que cambiou a miña perspectiva. Comparto este pequeno resumo do que foi unha aventura inesquecible.'],
  ["I hadn't used my camera in ages, and one day, over coffee and conversation, the idea came up to do a beach-inspired photoshoot with a friend of mine who's starting out as a DJ in Galicia. We set off, armed with a powerful flashlight and freezing cold. We ventured onto the beach at 2 a.m., with no real faith that our ideas would work. Here's the result of a session that was anything but improvised and had limited resources.",
    'Hacía muchísimo que no usaba mi cámara y un día, entre un café y una conversación, surgió la idea de hacer una sesión de fotos de inspiración playera con un amigo mío que empieza como DJ en Galicia. Salimos armados con una linterna potente y muertos de frío. Nos aventuramos en la playa a las 2 de la madrugada, sin mucha fe en que nuestras ideas funcionaran. Este es el resultado de una sesión que fue todo menos improvisada y con recursos limitados.',
    'Facía moitísimo que non usaba a miña cámara e un día, entre un café e unha conversa, xurdiu a idea de facer unha sesión de fotos de inspiración praieira cun amigo meu que comeza como DJ en Galicia. Saímos armados cunha lanterna potente e mortos de frío. Aventurámonos na praia ás 2 da madrugada, sen moita fe en que as nosas ideas funcionasen. Este é o resultado dunha sesión que foi todo menos improvisada e con recursos limitados.'],
  ['Generation and retouching of product images for Lexus Singapore- Content created for WPP. Project participation. 10K image quality.',
    'Generación y retoque de imágenes de producto para Lexus Singapur. Contenido creado para WPP. Participación en el proyecto. Calidad de imagen 10K.',
    'Xeración e retoque de imaxes de produto para Lexus Singapur. Contido creado para WPP. Participación no proxecto. Calidade de imaxe 10K.'],
  ['Generation and retouching of product images for Schweppes — Content created for WPP. Project involvement: generation of 10K-quality images and videos.',
    'Generación y retoque de imágenes de producto para Schweppes — Contenido creado para WPP. Participación en el proyecto: generación de imágenes y vídeos con calidad 10K.',
    'Xeración e retoque de imaxes de produto para Schweppes — Contido creado para WPP. Participación no proxecto: xeración de imaxes e vídeos con calidade 10K.'],
  ['Generation and retouching of product images for Boots—specifically the cosmetics brand Soap & Glory. Content created for WPP. Project participation. 10K image quality.',
    'Generación y retoque de imágenes de producto para Boots, en concreto para la marca de cosmética Soap & Glory. Contenido creado para WPP. Participación en el proyecto. Calidad de imagen 10K.',
    'Xeración e retoque de imaxes de produto para Boots, en concreto para a marca de cosmética Soap & Glory. Contido creado para WPP. Participación no proxecto. Calidade de imaxe 10K.'],
  ["This project originated from a deeply rooted tradition in an iconic establishment in my hometown. My grandfather, a former sailor, frequented this bar to enjoy games and savor delicious appetizers. This long-established, nautical-themed bar lacked a graphic update that reflected its essence in a contemporary way. To create the brand identity for this project, we drew inspiration from the characteristic aesthetic of traditional seafood restaurants and bars, giving it a modern graphic touch. For the visual identity design, we opted for a simple and welcoming aesthetic that conveys familiarity and evokes a rustic atmosphere. We also aim to transmit a sense of freshness and order, in keeping with the quality and organization that characterize the establishment's culinary offerings.",
    'Este proyecto nació de una tradición muy arraigada en un local emblemático de mi pueblo. Mi abuelo, antiguo marinero, frecuentaba este bar para disfrutar de los juegos y saborear ricos aperitivos. Este bar de toda la vida, de temática náutica, carecía de una actualización gráfica que reflejara su esencia de forma contemporánea. Para crear la identidad de marca de este proyecto nos inspiramos en la estética característica de las marisquerías y bares tradicionales, dándole un toque gráfico moderno. Para el diseño de la identidad visual optamos por una estética sencilla y acogedora que transmite familiaridad y evoca un ambiente rústico. También buscamos transmitir una sensación de frescura y orden, acorde con la calidad y la organización que caracterizan la oferta culinaria del local.',
    'Este proxecto naceu dunha tradición moi arraigada nun local emblemático da miña vila. O meu avó, antigo mariñeiro, frecuentaba este bar para gozar dos xogos e saborear ricos aperitivos. Este bar de toda a vida, de temática náutica, carecía dunha actualización gráfica que reflectise a súa esencia de forma contemporánea. Para crear a identidade de marca deste proxecto inspirámonos na estética característica das marisquerías e bares tradicionais, dándolle un toque gráfico moderno. Para o deseño da identidade visual optamos por unha estética sinxela e acolledora que transmite familiaridade e evoca un ambiente rústico. Tamén buscamos transmitir unha sensación de frescura e orde, acorde coa calidade e a organización que caracterizan a oferta culinaria do local.'],
  ['Soidades de Onte. /sɔjˈðaðɛs ðɛ ˈɔnte/ In Galicia, nostalgia for yesterday is the expression of lived moments that have never been captured. A visual poem that revives my childhood memories, captured through the eyes of a little girl. A journey to the past made real.',
    'Soidades de Onte. /sɔjˈðaðɛs ðɛ ˈɔnte/ En Galicia, la nostalgia del ayer es la expresión de momentos vividos que nunca fueron capturados. Un poema visual que revive mis recuerdos de infancia, captados a través de los ojos de una niña pequeña. Un viaje al pasado hecho realidad.',
    'Soidades de Onte. /sɔjˈðaðɛs ðɛ ˈɔnte/ En Galicia, a nostalxia do onte é a expresión de momentos vividos que nunca foron capturados. Un poema visual que revive as miñas lembranzas de infancia, captadas a través dos ollos dunha nena pequena. Unha viaxe ao pasado feita realidade.'],
  // the map, Mochi and the little creature
  ['Learn more', 'Saber más', 'Saber máis'],
  ['Start the tour', 'Comenzar la visita', 'Comezar a visita'],
  ['CLICK 3 TIMES · CLICK 3 TIMES · CLICK 3 TIMES ·', 'HAZ CLIC 3 VECES · HAZ CLIC 3 VECES · HAZ CLIC 3 VECES ·', 'FAI CLIC 3 VECES · FAI CLIC 3 VECES · FAI CLIC 3 VECES ·'],
  ['Your browser cannot show the 3D map.', 'Tu navegador no puede mostrar el mapa 3D.', 'O teu navegador non pode mostrar o mapa 3D.']
];
const MAP = new Map(ROWS.map((r) => [norm(r[0]), r]));
const REV = new Map(); for (const r of ROWS) for (const t of r) REV.set(norm(t), r[0]);   // any language back to its English original

// what Mochi says on the map: the same six texts in each language
export const MOCHI = [
  ['Thank you so much for staying until here! My name is Mochi and I am Martamon’s assistant (actually, I am her digitalised kitten).',
    '¡Muchas gracias por quedarte hasta aquí! Mi nombre es Mochi y soy la asistente de Martamon (en realidad soy su gatita digitalizada).',
    'Moitas grazas por quedares ata aquí! O meu nome é Mochi e son a asistente de Martamon (en realidade son a súa gatiña dixitalizada).'],
  ['Martamon comes from a tiny village in the north of Spain, in Galicia. It is a VERY, VERY pretty and quiet fishing village. This map is a recreation of that very special place.',
    'Martamon viene de una pequeña aldea del norte de España, en Galicia. Es un pueblo pesquero MUY, MUY bonito y tranquilo. Este mapa es una recreación de ese lugar tan especial.',
    'Martamon vén dunha pequena aldea do norte de España, en Galicia. É unha vila mariñeira MOI, MOI bonita e tranquila. Este mapa é unha recreación dese lugar tan especial.'],
  ['This map does not follow the original layout of the village exactly, but it is made to sum up a little of Martamon’s place of origin and its culture.',
    'Este mapa no sigue exactamente la estructura original del pueblo, pero está hecho de manera que resuma un poco el lugar de origen de Martamon y su cultura.',
    'Este mapa non segue exactamente a estrutura orixinal da aldea, pero está feito de maneira que resuma un pouco o lugar de orixe de Martamon e a súa cultura.'],
  ['These villages are in the Ría de Muros e Noia, and they are O Freixo, Esteiro, Outes, Muros and Louro.',
    'Estos pueblos están en la ría de Muros e Noia y son O Freixo, Esteiro, Outes, Muros y Louro.',
    'Estas vilas están na ría de Muros e Noia e son O Freixo, Esteiro, Outes, Muros e Louro.'],
  ['I want to take you on a tour of all these villages and tell you a bit about their culture and some curious facts about them.',
    'Quiero llevarte de recorrido por todos estos pueblos y contarte un poco sobre su cultura y algunos datos curiosos.',
    'Quero levarte de percorrido por todas estas vilas e contarte un pouco sobre a súa cultura e algúns datos curiosos.'],
  ['If you feel like trying it, click the start button that will appear next.',
    'Si te animas a probarlo, haz clic en el botón de comenzar que aparecerá a continuación.',
    'Se te animas a probalo, fai clic no botón de comezar que aparecerá a continuación.']
];

let lang = 'en';
try {
  const q = /[?&]lang=(en|es|gl)\b/.exec(location.search);
  lang = q ? q[1] : localStorage.getItem('xlang');
  if (NAMES.indexOf(lang) < 0) {
    // first visit: the language of the visitor's computer / phone (the first of its preferred languages we speak), English otherwise
    lang = 'en';
    const prefs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || '']);
    for (const p of prefs) { const c = String(p).toLowerCase().slice(0, 2); if (NAMES.indexOf(c) >= 0) { lang = c; break; } }
  }
} catch (e) {}
export const getLang = () => lang;
export const tr = (s) => { const r = MAP.get(norm(s)); return r ? r[NAMES.indexOf(lang)] : s; };
export const mochiText = (i) => MOCHI[i][NAMES.indexOf(lang)];

// ---- text nodes: each remembers its English original, so switching back (or on to another language) is exact
const store = new WeakMap();
const lead = (s) => /^\s*/.exec(s)[0], trail = (s) => /\s*$/.exec(s)[0];
function fixNode(n) {
  const raw = n.nodeValue, rec = store.get(n);
  const orig = rec && raw === rec.w ? rec.o : raw;           // changed by the page itself since we wrote it: that is the new original
  const row = MAP.get(norm(orig));
  const out = row && lang !== 'en' ? lead(orig) + row[NAMES.indexOf(lang)] + trail(orig) : orig;
  if (out !== raw) n.nodeValue = out;
  if (row || rec) store.set(n, { o: orig, w: out });
}
function walk(root) {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => /^(SCRIPT|STYLE|TEXTAREA|NOSCRIPT)$/.test(n.parentNode && n.parentNode.nodeName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
  let n; const list = [];
  while ((n = w.nextNode())) list.push(n);
  for (const x of list) fixNode(x);
}
// the menu words are built letter by letter (they roll up on hover): rebuild those letters
function rolls(root) {
  const as = (root.nodeType === 1 ? root : document).querySelectorAll('a .x-roll');
  for (const r of as) {
    const a = r.closest('a'); if (!a) continue;
    if (!a.dataset.xo) { const l0 = a.getAttribute('aria-label') || r.textContent.slice(0, r.textContent.length / 2); a.dataset.xo = REV.get(norm(l0)) || l0; }
    const row = MAP.get(norm(a.dataset.xo)), text = row && lang !== 'en' ? row[NAMES.indexOf(lang)] : a.dataset.xo;
    if (a.dataset.xl === lang + text) continue;
    a.dataset.xl = lang + text; a.setAttribute('aria-label', text);
    for (const cls of ['x-a', 'x-b']) {
      const s = r.querySelector('.' + cls); if (!s) continue;
      s.textContent = '';
      Array.prototype.forEach.call(text, (ch, i) => { const l = document.createElement('i'); l.textContent = ch; l.style.setProperty('--i', i); s.appendChild(l); });
    }
  }
}
// "rolling text" blocks of the page (a letter per span, like MORE PROJECTS): the new letters are written into the same spans
function letters(root) {
  const ps = (root.nodeType === 1 ? root : document).querySelectorAll('p[class*="rolling-text-inner"]');
  for (const p of ps) {
    const sp = Array.prototype.filter.call(p.children, (c) => c.tagName === 'SPAN');
    if (!sp.length) continue;
    if (!p.dataset.xo) p.dataset.xo = sp.map((c) => c.textContent).join('').replace(/\u00a0/g, ' ');
    const row = MAP.get(norm(p.dataset.xo)), text = row && lang !== 'en' ? row[NAMES.indexOf(lang)] : p.dataset.xo;
    if (p.dataset.xl === lang + text) continue;
    p.dataset.xl = lang + text;
    const ch = Array.from(text);
    sp.forEach((c, i) => { const v = i < sp.length - 1 ? (ch[i] || '') : ch.slice(i).join(''); c.textContent = v === ' ' ? '\u00a0' : v; });
  }
}
function apply(root) { walk(root); rolls(root); letters(root); document.documentElement.lang = lang; }

let pend = null, busy = false;
const mo = new MutationObserver((ms) => {
  if (busy) return;
  if (!pend) { pend = new Set(); requestAnimationFrame(() => { const p = pend; pend = null; busy = true; try { for (const t of p) if (t.isConnected) { if (t.nodeType === 3) fixNode(t); else walk(t); } rolls(document); letters(document); } finally { busy = false; mo.takeRecords(); } }); }
  for (const m of ms) {
    if (m.type === 'characterData') pend.add(m.target);
    else for (const n of m.addedNodes) pend.add(n.nodeType === 3 ? n : n);
  }
});

// ---- the discreet switch
function css() {
  if (document.getElementById('x-lang-css')) return;
  const s = document.createElement('style'); s.id = 'x-lang-css';
  s.textContent = '.x-lang{position:fixed;left:14px;bottom:12px;z-index:11;display:flex;gap:2px;align-items:center;font:500 11px/1 "IBM Plex Mono","IBM Plex Mono Placeholder",monospace;letter-spacing:.08em;color:#fff;mix-blend-mode:difference;opacity:.85;transition:opacity .3s}' +
    '.x-lang:hover,.x-lang:focus-within{opacity:1}.x-lang button{all:unset;cursor:pointer;padding:6px 5px;text-transform:uppercase;opacity:.62;border-bottom:1px solid transparent;transition:opacity .2s}' +
    '.x-lang button:hover{opacity:1}.x-lang button[aria-pressed="true"]{opacity:1;border-bottom-color:currentColor}.x-lang i{font-style:normal;opacity:.4}';
  document.head.appendChild(s);
}
function ui() {
  if (document.querySelector('.x-lang')) return;
  css();
  const d = document.createElement('div'); d.className = 'x-lang'; d.setAttribute('role', 'group'); d.setAttribute('aria-label', 'Language');
  const full = { en: 'English', es: 'Español', gl: 'Galego' };
  NAMES.forEach((l, i) => {
    if (i) { const sep = document.createElement('i'); sep.textContent = '·'; sep.setAttribute('aria-hidden', 'true'); d.appendChild(sep); }
    const b = document.createElement('button'); b.type = 'button'; b.textContent = l; b.title = full[l]; b.lang = l; b.setAttribute('aria-pressed', String(l === lang));
    b.addEventListener('click', () => set(l));
    d.appendChild(b);
  });
  document.body.appendChild(d);
}
export function set(l) {
  if (NAMES.indexOf(l) < 0 || l === lang) return;
  lang = l;
  try { localStorage.setItem('xlang', l); } catch (e) {}
  busy = true; try { apply(document.body); } finally { busy = false; mo.takeRecords(); }
  for (const b of document.querySelectorAll('.x-lang button')) b.setAttribute('aria-pressed', String(b.lang === l));
  window.dispatchEvent(new CustomEvent('xlang', { detail: l }));
}
function start() {
  ui();
  busy = true; try { apply(document.body); } finally { busy = false; mo.takeRecords(); }
  mo.observe(document.body, { childList: true, subtree: true, characterData: true });
}
if (document.body) start(); else addEventListener('DOMContentLoaded', start);
window.xLang = { get: getLang, set, tr };

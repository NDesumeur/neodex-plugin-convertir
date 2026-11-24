// Convertir : ton appli d'origine (HTML et code inchangés), livrée en plugin.
// Ses données sont dans le dossier du plugin, que NeoDex sauvegarde (synchro cloud et sauvegardes) ; à la première ouverture elle reprend ce que tu avais dans NeoDex.
// Elle tourne dans le bac à sable de NeoDex, avec ses outils d'interface (ctx.host) et seulement les autorisations de son plugin.json.
const HTML = "<div class=\"appWrap wide\">\n      <div class=\"agHead\"><span class=\"label\">Convertir</span><span class=\"hint\" id=\"cvCaps\"></span></div>\n      <div class=\"cvGrid\"><div class=\"cvCol\">\n      <div id=\"cvDrop\" class=\"px\"><b>Glisse des fichiers ici</b><span class=\"hint\">ou</span><button class=\"btn main px\" id=\"cvPick\">Choisir des fichiers…</button>\n        <div class=\"hint\">Images, sons, vidéos, tableaux (Excel, ODS, CSV, JSON) et documents (Word, Markdown, HTML, texte → PDF…). Le fichier converti est créé à côté de l'original, qui n'est jamais modifié.</div></div>\n      <div class=\"sysCard px\"><span class=\"label\">Préréglages</span><div class=\"cvPresets\" id=\"cvPresets\"></div><div class=\"hint\" id=\"cvPresetHint\">Un clic règle toute la liste : format, taille et qualité.</div></div>\n      <div class=\"sysCard px\"><span class=\"label\">Réglages</span>\n        <div class=\"bdPlan\">Taille <select class=\"f\" id=\"cvSize\"><option value=\"full\">d'origine</option><option value=\"75\">75 %</option><option value=\"50\">50 %</option><option value=\"25\">25 %</option><option value=\"1920\">1920 px max</option><option value=\"1280\">1280 px max</option><option value=\"720\">720 px max</option><option value=\"512\">512 px max</option><option value=\"256\">256 px (icône)</option></select>\n          Qualité <select class=\"f\" id=\"cvQuality\"><option value=\"high\">haute</option><option value=\"normal\" selected>normale</option><option value=\"small\">fichier léger</option></select>\n          <label class=\"check\"><input type=\"checkbox\" id=\"cvSquare\"> Recadrer en carré (icônes de vignettes)</label></div>\n        <div class=\"hint\">La taille, la qualité et le recadrage s'appliquent aux images et aux vidéos.</div></div>\n      </div><div class=\"cvCol\">\n      <div id=\"cvList\"><div class=\"hint cvEmpty\">Les fichiers choisis apparaissent ici, avec le format de sortie à choisir pour chacun.</div></div>\n      <div class=\"row\"><button class=\"btn main px\" id=\"cvGo\">Tout convertir</button><button class=\"btn ghost px\" id=\"cvClear\">Vider la liste</button></div>\n      </div></div>\n    </div>";
/*CSS-MOVED*/ const CSS = `#cvDrop{--fill:rgba(255,255,255,.02);--c:var(--line2);display:flex;flex-direction:column;align-items:center;gap:12px;padding:34px 20px;text-align:center}
#cvDrop b{font:clamp(12px,1.1vw,15px) var(--title);color:#fff;letter-spacing:1px}
#cvDrop.over{--c:var(--magenta);--fill:rgba(var(--mgr),.12)}
#cvList{display:flex;flex-direction:column;gap:14px}
.cvGrid{display:grid;grid-template-columns:minmax(0,1fr);gap:16px}.cvCol{display:flex;flex-direction:column;gap:16px;min-width:0}
@media (min-width:1100px){.cvGrid{grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);align-items:start}}
@media (max-height:720px){#cvDrop{padding:18px 16px;gap:8px}}
.cvPresets{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.cvPresets .btn.on{outline:2px solid var(--magenta);outline-offset:2px}
.cvEmpty{padding:18px;text-align:center;border:2px dashed var(--line)}
.cvGain{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:4px 10px;align-items:center;font-size:13px;color:var(--muted)}
.cvGain i{display:block;height:10px;background:var(--line2,#555);min-width:2px}.cvGain i.new{background:var(--magenta)}.cvGain i.big{background:var(--red)}
.cvGain b{font-weight:normal;color:#fff;text-align:right}.cvGain .tot{grid-column:1/-1;color:#fff}
.cvItem{gap:8px}
.cvItem.done{--c:var(--violet)}
.cvItem.err{--c:#5a1f36}
.cvHead{display:flex;align-items:center;gap:12px}
.cvHead .tn{flex:1;min-width:0;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cvHead select.f{width:auto;max-width:210px;font-size:14px;padding:6px 10px}
.cvHead .x{font-size:9px}
.cvHead .x:hover{color:var(--red)}
.bdPlan{display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:16px;color:var(--lilac)}
.bdPlan .f{width:110px;font-size:15px;padding:7px 10px}
.bdPlan select.f{width:160px}
`;  // le style de ce plugin (il utilise les variables du thème de NeoDex)
export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  const host = ctx.host, { el, toast, sfx, ask, newTab, pixIcon, PIX, WX } = host;
  const folder = ctx.folder, legacy = ctx.legacy || {};
  ctx.host.addStyle(CSS);
  view.innerHTML = HTML;
  const $ = id => id === "convApp" ? view : (view.querySelector('#' + id) || document.getElementById(id));  // les identifiants de ta vue d'abord, puis ceux de la page (fenêtres, menus)
  const doc = async n => { try { return await folder.read(n); } catch { return null; } };
  const __icon = () => ctx.icon;  // l'icône de ce plugin
  // ---- ton code d'origine ----
/* ---------- Convertir app: any file dropped or chosen becomes a new file in another format, next to the original (converter.js does the work) ---------- */
let cvCaps = null, cvItems = [], cvBusy = false, cvSeq = 0;
const CV_LABEL = {image: 'IMAGE', audio: 'SON', video: 'VIDÉO', table: 'TABLEAU', doc: 'DOCUMENT'};
const cvKind = f => { const e = f.split('.').pop().toLowerCase(); return Object.keys(cvCaps.kinds).find(k => cvCaps.kinds[k].includes(e)) || null; };
// the usual target of each kind, or a second choice when the file is already in that format
const CV_DEF = {image: ['png', 'webp'], audio: ['mp3', 'wav'], video: ['mp4', 'mp3'], table: ['xlsx', 'csv'], doc: ['pdf', 'html']};
const cvDefault = (kind, f) => { const [a, b] = CV_DEF[kind]; return f.toLowerCase().endsWith('.' + a) ? b : a; };
const CV_DISCORD = 9.5e6;  // Discord refuse au-delà de 10 Mo sans abonnement : on garde un peu de marge
// les vidéos à taille visée (le cœur choisit le débit d'après la durée) ; marge gardée sous chaque limite
const CV_FIT = {discord: [CV_DISCORD, '→ DISCORD (MP4 < 10 MO)'], whatsapp: [15e6, '→ WHATSAPP (MP4 < 16 MO)'], mail: [23e6, '→ E-MAIL (MP4 < 25 MO)']};
// les préréglages : pour chaque genre de fichier, le format visé ; et les réglages d'images
const CV_PRESETS = [
  {id: 'discord', label: 'POUR DISCORD', hint: 'Vidéos en MP4 sous 10 Mo, images en WebP 1920 px, sons en MP3 : tout passe sans Nitro.', to: {video: 'discord', image: 'webp', audio: 'mp3'}, size: '1920', quality: 'normal'},
  {id: 'whatsapp', label: 'POUR WHATSAPP', hint: 'Vidéos en MP4 sous 16 Mo, images en JPG 1920 px, sons en MP3.', to: {video: 'whatsapp', image: 'jpg', audio: 'mp3'}, size: '1920', quality: 'normal'},
  {id: 'mail', label: 'POUR UN E-MAIL', hint: 'Vidéos sous 25 Mo, images en JPG 1280 px légères, documents en PDF.', to: {video: 'mail', image: 'jpg', audio: 'mp3', doc: 'pdf'}, size: '1280', quality: 'small'},
  {id: 'icon', label: 'EN ICÔNE', hint: 'Images en PNG carrées de 256 px (vignettes, icônes de raccourcis).', to: {image: 'png'}, size: '256', quality: 'high', square: true},
  {id: 'audio', label: 'GARDER LE SON', hint: 'Le son des vidéos extrait en MP3.', to: {video: 'mp3', audio: 'mp3'}}];
let cvPreset = null;
function cvApply(p) {
  cvPreset = p.id;
  for (const it of cvItems) if (it.state !== 'run' && it.kind && p.to[it.kind]) { const t = p.to[it.kind]; if (CV_FIT[t] ? cvCaps.fit : cvCaps.targets[it.kind].includes(t)) { it.to = t; if (it.state !== 'done') { it.state = 'wait'; it.msg = ''; } } }
  if (p.size) $('cvSize').value = p.size; if (p.quality) $('cvQuality').value = p.quality; $('cvSquare').checked = !!p.square;
  $('cvPresetHint').textContent = p.hint; cvRender();
}
const kb = b => b < 1048576 ? Math.max(1, Math.round(b / 1024)) + ' Ko' : (b / 1048576).toFixed(1).replace('.', ',') + ' Mo';
async function cvOpen() { cvCaps ??= await neo.convCaps(); $('cvCaps').textContent = cvCaps.ffmpeg ? '' : "ffmpeg introuvable : seuls les tableaux et documents peuvent être convertis."; cvRender(); }
function cvAdd(paths) {
  for (const f of paths) if (f && !cvItems.some(i => i.file === f && i.state !== 'done')) {
    const kind = cvKind(f), pre = CV_PRESETS.find(p => p.id === cvPreset)?.to[kind], ok = pre && (CV_FIT[pre] ? cvCaps.fit : cvCaps.targets[kind].includes(pre));
    cvItems.push({id: ++cvSeq, file: f, kind, to: kind && (ok ? pre : cvDefault(kind, f)), state: kind ? 'wait' : 'err', pct: 0, msg: kind ? '' : 'format non pris en charge'});  // le préréglage choisi vaut aussi pour les fichiers ajoutés après
  }
  cvRender();
}
function cvRender() {
  if (!cvCaps) return;
  $('cvPresets').replaceChildren(...CV_PRESETS.map(p => { const b = el('button', 'btn px' + (cvPreset === p.id ? ' on' : ''), p.label); b.title = p.hint; b.onclick = () => cvApply(p); return b; }));
  if (!cvItems.length) { $('cvList').replaceChildren(el('div', 'hint cvEmpty', 'Les fichiers choisis apparaissent ici, avec le format de sortie à choisir pour chacun.')); }
  else $('cvList').replaceChildren(...cvItems.map(it => {
    const r = el('div', 'sysCard px cvItem ' + it.state), name = it.file.split(/[\\/]/).pop(), head = el('div', 'cvHead');
    head.append(el('span', 'badge', it.kind ? CV_LABEL[it.kind] : '?'), el('span', 'tn', name));
    if (it.kind) {
      const sel = el('select', 'f'); sel.disabled = it.state === 'run';
      sel.append(...cvCaps.targets[it.kind].map(t => new Option('→ ' + t.toUpperCase(), t)));
      if (it.kind === 'video' && cvCaps.fit) for (const [k, [, label]] of Object.entries(CV_FIT)) sel.append(new Option(label, k));
      sel.value = it.to; sel.onchange = () => { it.to = sel.value; if (it.state !== 'run') { it.state = 'wait'; it.msg = ''; } cvRender(); };
      head.append(sel);
    }
    const x = el('button', 'x', 'X'); x.title = 'Retirer de la liste'; x.disabled = it.state === 'run';
    x.onclick = () => { cvItems = cvItems.filter(o => o !== it); cvRender(); };
    head.append(x); r.append(head);
    const bar = el('div', 'dlBar'), fill = el('i', it.state === 'err' ? 'warn' : ''); fill.style.width = (it.state === 'done' || it.state === 'err' ? 100 : it.pct) + '%'; bar.append(fill);
    const info = el('div', 'dlInfo');
    info.append(el('span', '', {wait: 'Prêt à convertir', run: 'Conversion… ' + Math.round(it.pct) + ' %', done: 'Terminé · ' + it.msg, err: 'Échec : ' + it.msg}[it.state]), el('span', 'sp'));
    if (it.state === 'done') {
      const act = (label, f) => { const b = el('button', '', label); b.onclick = f; info.append(b); };
      act('OUVRIR', () => neo.openFile(it.output)); act('DOSSIER', () => neo.showFile(it.output));
    }
    r.append(bar, info);
    if (it.state === 'done' && it.inSize) r.append(cvGainBox(it.inSize, it.size));
    return r;
  }));
  $('cvGo').disabled = cvBusy || !cvItems.some(i => i.state === 'wait');
  $('cvGo').textContent = cvBusy ? 'Conversion en cours…' : 'Tout convertir';
}
function cvGainBox(a, n) {  // a : avant, n : après
  const box = el('div', 'cvGain'), m = Math.max(a, n), bar = (cls, v) => { const i = el('i', cls); i.style.width = Math.max(.5, v / m * 100) + '%'; const w = el('div'); w.append(i); return w; };
  const d = Math.round((1 - n / a) * 100);
  box.append(el('span', '', 'Avant'), bar('', a), el('b', '', kb(a)), el('span', '', 'Après'), bar(n > a ? 'new big' : 'new', n), el('b', '', kb(n)),
    el('span', 'tot', d > 0 ? d + ' % plus léger (' + kb(a - n) + ' gagnés)' : d < 0 ? (-d) + ' % plus lourd' : 'même taille'));
  return box;
}
async function cvRun() {
  if (cvBusy) return;
  cvBusy = true;
  const opts = {size: $('cvSize').value, quality: $('cvQuality').value, square: $('cvSquare').checked};
  for (const it of cvItems.filter(i => i.state === 'wait')) {  // one at a time: video encoding already uses every core
    it.state = 'run'; it.pct = 0; cvRender();
    try { const fit = CV_FIT[it.to], r = await neo.convRun({id: it.id, file: it.file, to: fit ? 'mp4' : it.to, opts: fit ? {...opts, maxBytes: fit[0]} : opts}); it.state = 'done'; it.output = r.output; it.size = r.size; it.inSize = r.inSize; it.msg = r.output.split(/[\\/]/).pop() + ' · ' + kb(r.size); }
    catch (e) { it.state = 'err'; it.msg = e.message.replace(/^.*Error: /, ''); }
    cvRender();
  }
  cvBusy = false; cvRender();
  const done = cvItems.filter(i => i.state === 'done').length;
  if (done) toast(done + ' fichier' + (done > 1 ? 's' : '') + ' converti' + (done > 1 ? 's' : ''));
}
if (window.neo) {
  neo.onConvProgress(({id, pct}) => { const it = cvItems.find(i => i.id === id); if (it) { it.pct = pct; cvRender(); } });
  $('cvPick').onclick = async () => cvAdd(await neo.convPick());
  $('cvGo').onclick = cvRun;
  for (const id of ['cvSize', 'cvQuality', 'cvSquare']) $(id).addEventListener('change', () => { if (cvPreset) { cvPreset = null; $('cvPresetHint').textContent = 'Un clic règle toute la liste : format, taille et qualité.'; cvRender(); } });
  $('cvClear').onclick = () => { cvItems = cvItems.filter(i => i.state === 'run'); cvRender(); };
  const drop = $('convApp');
  drop.ondragover = e => { e.preventDefault(); $('cvDrop').classList.add('over'); };
  drop.ondragleave = e => { if (!drop.contains(e.relatedTarget)) $('cvDrop').classList.remove('over'); };
  drop.ondrop = e => { e.preventDefault(); $('cvDrop').classList.remove('over'); Promise.all([...e.dataTransfer.files].map(f => neo.pathOf(f))).then(cvAdd); };
}  // (non indenté : les textes sur plusieurs lignes restent exactement les tiens)
  // ---- fin ----
  ctx.onFiles(files => cvOpen().then(() => cvAdd(files)));  // les fichiers envoyés par Fichiers
  ctx.onOpen(() => { cvOpen(); });
  $('cvList').__add = paths => cvOpen().then(() => cvAdd(paths));  // pour le test
  $('cvList').__items = () => cvItems;
  console.assert(cvGainBox(1000, 250).lastChild.textContent.startsWith('75 %'), 'convertir : taille gagnée');
}

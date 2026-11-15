// lancé par le test « local » de NeoDex : une image et une vidéo trop lourde converties pour de vrai ; la vidéo « Discord » doit passer sous 10 Mo, avant / après affiché
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
module.exports = async ({ pj, sleep }) => {
  const dir = path.join(os.tmpdir(), 'neodex-test-convertir'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir);
  const ff = execFileSync('where', ['ffmpeg'], { encoding: 'utf8' }).split(/\r?\n/)[0].trim(), run = a => execFileSync(ff, ['-y', '-hide_banner', '-loglevel', 'error', ...a], { windowsHide: true });
  run(['-f', 'lavfi', '-i', 'testsrc2=size=1600x900', '-frames:v', '1', path.join(dir, 'photo.png')]);
  // 5 s de bruit en 720p peu compressé : bien plus de 10 Mo
  run(['-f', 'lavfi', '-i', 'nullsrc=s=1280x720:r=25,geq=random(1)*255:128:128', '-f', 'lavfi', '-i', 'sine=frequency=330', '-t', '5', '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '16', '-pix_fmt', 'yuv420p', '-c:a', 'aac', path.join(dir, 'clip.mp4')]);
  const big = fs.statSync(path.join(dir, 'clip.mp4')).size; if (big < 12e6) throw new Error('vidéo de test trop légère : ' + big);
  await pj(`document.getElementById('cvList').__add(${JSON.stringify([path.join(dir, 'photo.png'), path.join(dir, 'clip.mp4')])}), 0`); await sleep(500);
  const opts = await pj(`[...document.querySelectorAll('#cvList select.f')].map(s => [...s.options].map(o => o.value).join(','))`);
  if (!opts[1]?.includes('discord')) throw new Error('pas de cible Discord : ' + JSON.stringify(opts));
  await pj(`(() => { const s = document.querySelectorAll('#cvList select.f'); s[0].value = 'webp'; s[0].dispatchEvent(new Event('change')); const v = document.querySelectorAll('#cvList select.f')[1]; v.value = 'discord'; v.dispatchEvent(new Event('change')); document.getElementById('cvGo').click(); })(), 0`);
  let st; for (let i = 0; i < 240; i++) { await sleep(500); st = await pj(`[...document.querySelectorAll('.cvItem')].map(c => c.className.split(' ').pop())`); if (st.every(s => s === 'done' || s === 'err')) break; }
  if (!st.every(s => s === 'done')) throw new Error('conversions : ' + JSON.stringify(st) + ' ' + await pj(`document.getElementById('cvList').innerText`));
  const out = fs.readdirSync(dir), mp4 = out.find(f => /^clip \(\d\)\.mp4$|^clip-\d\.mp4$|^clip.+\.mp4$/.test(f) && f !== 'clip.mp4');
  if (!mp4) throw new Error('vidéo Discord introuvable : ' + out.join(', '));
  const small = fs.statSync(path.join(dir, mp4)).size; if (small > 10e6) throw new Error('vidéo Discord trop lourde : ' + small);
  const gains = await pj(`[...document.querySelectorAll('.cvGain .tot')].map(e => e.textContent)`);
  if (gains.length !== 2) throw new Error('avant / après : ' + JSON.stringify(gains));
  fs.rmSync(dir, { recursive: true, force: true });
  return `vidéo ${(big / 1e6).toFixed(1)} Mo → ${mp4} ${(small / 1e6).toFixed(1)} Mo · ${gains.join(' · ')}`;
};

// AIHEAR Akademi sahne motoru: window.VIDEO (metin.json), window.ZAMAN (zamanlama.json), window.MARKA
// renderAt(t) her kareyi çizer. Biçimler: ders (1920x1080), reels (1080x1920), kapak (1280x720).
const V = window.VIDEO, ZM = window.ZAMAN, M = window.MARKA, R = M.renk;
const BICIM = window.BICIM || V.bicim, W = M.bicim[BICIM].genislik, H = M.bicim[BICIM].yukseklik;
const kok = document.getElementById('sahne');
kok.style.width = W + 'px'; kok.style.height = H + 'px';
const EN = V.dil === 'en';

// ------------------------------------------------------------ yardımcılar
const kis = x => x < 0 ? 0 : x > 1 ? 1 : x;
const yum = x => { x = kis(x); return 1 - Math.pow(1 - x, 3); };          // ease-out
const yay = x => { x = kis(x); const c = 1.6; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); }; // hafif sekme
const ilerle = (t, bas, sure = .6) => yum((t - bas) / sure);
function gir(t, bas, o = {}) {  // giriş animasyonu stili
  const p = ilerle(t, bas, o.sure || .6), dy = (o.dy ?? 26) * (1 - p), dx = (o.dx ?? 0) * (1 - p);
  return `opacity:${p.toFixed(3)};transform:translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) scale(${(o.olcek ? o.olcek + (1 - o.olcek) * p : 1).toFixed(4)})`;
}
let _id = 0; const uid = p => p + (++_id);

// ------------------------------------------------------------ logo (Logo 2: Kulak ve Kitap)
const KAVIS = IZ.beyaz_parcalar.filter(p => p[1][0] < 20).map(p => p[0]).join(' ');
const KULAK = IZ.mavi;
const SOL = 'M98 217 C84 201 52 192 10 205 C9 212 11 220 14 227 C50 217 82 225 98 243 Z';
const SAG = 'M102 217 C116 201 148 192 190 205 C191 212 189 220 186 227 C150 217 118 225 102 243 Z';
const SAYFA = 'M22 214 C50 206 78 210 94 225 M26 221 C52 214 76 218 92 233 M178 214 C150 206 122 210 106 225 M174 221 C148 214 124 218 108 233';
// a: animasyon ilerlemeleri {kavis, kulak, kitap} 0..1
function isaret(h, a = {}, r = {}) {
  const k = r.koyu || R.lacivert, m = r.acik || R.logo_mavi, c = r.cizgi || '#fff';
  const pk = a.kavis ?? 1, pu = a.kulak ?? 1, pb = a.kitap ?? 1;
  return `<svg height="${h}" viewBox="4 5 190 240" style="display:block;overflow:visible">
   <g style="opacity:${kis(pk * 1.6)};transform-origin:110px 120px;transform:rotate(${(-40 * (1 - yum(pk))).toFixed(2)}deg)"><path d="${KAVIS}" fill="${k}"/></g>
   <g style="opacity:${kis(pu * 1.4)};transform-origin:97px 116px;transform:scale(${(.6 + .4 * yay(pu)).toFixed(4)})"><path d="${KULAK}" fill="${m}"/></g>
   <g style="opacity:${kis(pb * 2)}">
     <g style="transform-origin:100px 230px;transform:scaleX(${yum(pb).toFixed(4)})"><path d="${SOL}" fill="${k}"/></g>
     <g style="transform-origin:100px 230px;transform:scaleX(${yum(pb).toFixed(4)})"><path d="${SAG}" fill="${m}"/></g>
     <path d="${SAYFA}" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" opacity="${(.85 * kis(pb * 1.5 - .5)).toFixed(3)}"/></g></svg>`;
}
const altAd = EN ? 'Audiology Academy' : 'Odyoloji Akademisi';
const SLOGAN = (M.slogan || {})[EN ? 'en' : 'tr'] || '';
function kelimeLogo(px, r = {}) {
  return `<span style="font:700 ${px}px/1 Outfit;letter-spacing:-.01em;white-space:nowrap"><span style="color:${r.koyu || R.lacivert}">AI</span><span style="color:${r.acik || R.logo_mavi}">HEAR</span></span>`;
}
function logo(olc = 1, r = {}) {
  return `<div style="display:inline-flex;align-items:center;gap:${18 * olc}px">${isaret(132 * olc, {}, r)}
   <div>${kelimeLogo(70 * olc, r)}<div style="font:500 ${29 * olc}px Outfit;color:${r.acik || R.logo_mavi};margin-top:${6 * olc}px;white-space:nowrap">${altAd}</div></div></div>`;
}

// ------------------------------------------------------------ arka plan
function zemin(t, yog = 1) {
  let s = `<div class="ab" style="left:0;top:0;width:${W}px;height:${H}px;background:linear-gradient(155deg, ${R.zemin} 0%, ${R.zemin} 42%, ${R.zemin2} 100%)"></div><svg class="ab" style="left:0;top:0" width="${W}" height="${H}">`;
  for (let k = 0; k < 4; k++) {
    let d = ''; const yb = H * (.70 + k * .065), a = 16 + k * 6, L = W / (1.4 + k * .3), faz = k * .8 + t * (.12 + k * .03);
    for (let x = 0; x <= W; x += 10) d += (x ? 'L' : 'M') + x + ' ' + (yb + a * Math.sin(x / L * 6.283 + faz)).toFixed(1);
    s += `<path d="${d}" fill="none" stroke="${R.mavi}" stroke-opacity="${((.07 + k * .015) * yog).toFixed(3)}" stroke-width="${3 - k * .5}"/>`;
  }
  return s + '</svg>';
}

// vurgulu başlık: "Hava yolu ve *kemik yolu*" -> yıldızlı kısım mavi + sarı alt çizgi
function vurgu(metin) {
  return metin.replace(/\*([^*]+)\*/g, `<span style="color:${R.mavi};background:linear-gradient(transparent 72%, ${R.sari}70 72%)">$1</span>`);
}
function zengin(metin) { return vurgu(metin).replace(/_([^_]+)_/g, '<b>$1</b>'); }
const KART = `background:#fff;border-radius:28px;box-shadow:0 24px 70px ${R.lacivert}14;border:1.5px solid ${R.cizgi}`;

// ------------------------------------------------------------ odyogram
// frekanslar: isteğe bağlı liste (125, 3000, 6000 ... eklenebilir); x konumu oktav oranlı
function odyoGeo(w, h, o) {
  const x0 = o.sol ?? 84, y0 = o.ust ?? 44, Wc = w - x0 - 24, Hc = h - y0 - 30;
  const fr = Array.isArray(o.frekanslar) && o.frekanslar.length > 1 ? o.frekanslar : [250, 500, 1000, 2000, 4000, 8000];
  const span = Math.log2(fr[fr.length - 1] / fr[0]);
  const XF = f => x0 + Wc * (Math.log2(f / fr[0]) + .5) / (span + 1);
  return {x0, y0, Wc, Hc, fr, XF, X: i => XF(fr[i]), Y: d => y0 + Hc * (d + 10) / 130};
}
function fYazi(f) { if (f < 1000) return String(f); const k = f / 1000; return (Number.isInteger(k) ? k : String(k).replace('.', EN ? '.' : ',')) + 'k'; }
// odyogram işaretleri: hava (O / X), kemik (< / >), hava_maskeli (üçgen / kare), kemik_maskeli ([ / ])
function odyoIsaret(tip, kulak, x, y, rr, renk, sw) {
  const sol = kulak === 'sol', f = n => n.toFixed(1);
  if (tip === 'hava_maskeli') return sol
    ? `<rect x="${f(x - rr * .9)}" y="${f(y - rr * .9)}" width="${f(rr * 1.8)}" height="${f(rr * 1.8)}" fill="#fff" stroke="${renk}" stroke-width="${sw}" stroke-linejoin="round"/>`
    : `<path d="M${f(x)} ${f(y - rr * 1.12)} L${f(x + rr * 1.05)} ${f(y + rr * .78)} L${f(x - rr * 1.05)} ${f(y + rr * .78)} Z" fill="#fff" stroke="${renk}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  if (tip === 'kemik_maskeli') { const d = sol ? 1 : -1, xs = x + d * rr * .95, xu = x + d * rr * .2;
    return `<path d="M${f(xu)} ${f(y - rr * 1.1)} L${f(xs)} ${f(y - rr * 1.1)} L${f(xs)} ${f(y + rr * 1.1)} L${f(xu)} ${f(y + rr * 1.1)}" fill="none" stroke="${renk}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`; }
  if (tip === 'kemik') { const yon = sol ? -1 : 1;
    return `<path d="M${f(x + yon * rr * .25)} ${f(y - rr)} L${f(x - yon * rr)} ${f(y)} L${f(x + yon * rr * .25)} ${f(y + rr)}" fill="none" stroke="${renk}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`; }
  return sol ? `<path d="M${f(x - rr)} ${f(y - rr)} L${f(x + rr)} ${f(y + rr)} M${f(x + rr)} ${f(y - rr)} L${f(x - rr)} ${f(y + rr)}" stroke="${renk}" stroke-width="${sw}" stroke-linecap="round"/>`
    : `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}" fill="#fff" stroke="${renk}" stroke-width="${sw}"/>`;
}
// yanıt yok: işaretin altında dışa doğru eğik ok (sağ kulak sol aşağı, sol kulak sağ aşağı)
function yanitsizOk(kulak, x, y, rr, renk, sw) {
  const d = kulak === 'sol' ? 1 : -1, f = n => n.toFixed(1), x1 = x + d * rr * .75, y1 = y + rr * .75, x2 = x + d * rr * 2.3, y2 = y + rr * 2.3, h = rr * .8;
  return `<path d="M${f(x1)} ${f(y1)} L${f(x2)} ${f(y2)} M${f(x2)} ${f(y2 - h)} L${f(x2)} ${f(y2)} L${f(x2 - d * h)} ${f(y2)}" fill="none" stroke="${renk}" stroke-width="${f(sw * .85)}" stroke-linecap="round" stroke-linejoin="round"/>`;
}
function odyogram(w, h, o, t) {
  const g = odyoGeo(w, h, o), {x0, y0, Wc, Hc, X, Y} = g, fs = o.fs || 20;
  let s = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="overflow:visible">`;
  if (!o.yalniz_seri) {
    if (o.bolge) { const p = o.bolge.p ?? 1, ust = o.bolge.ust ?? -10, alt = o.bolge.alt ?? 25;
      s += `<rect x="${x0}" y="${Y(ust)}" width="${Wc * p}" height="${Y(alt) - Y(ust)}" fill="${o.bolge.renk || R.basari}" fill-opacity=".10"/>`;
      if (o.bolge.etiket) s += `<text x="${x0 + Wc - 12}" y="${Y(ust) + fs + 8}" text-anchor="end" font-family="Inter" font-weight="600" font-size="${fs}" fill="${o.bolge.renk || R.basari}" opacity="${p}">${o.bolge.etiket}</text>`; }
    for (let d = -10; d <= 120; d += 10) {
      s += `<line x1="${x0}" y1="${Y(d)}" x2="${x0 + Wc}" y2="${Y(d)}" stroke="${R.cizgi}" stroke-width="${d % 20 ? 1 : 1.6}"/>`;
      if (d % 20 === 0) s += `<text x="${x0 - 14}" y="${Y(d) + fs * .35}" text-anchor="end" font-family="Inter" font-size="${fs}" fill="${R.soluk}">${d}</text>`;
    }
    g.fr.forEach((f, i) => { const ara = Math.abs(Math.log2(f / g.fr[0]) % 1) > .01;  // ara frekans (3k, 6k ...): ince kesik çizgi
      s += `<line x1="${X(i)}" y1="${y0}" x2="${X(i)}" y2="${y0 + Hc}" stroke="${R.cizgi}" stroke-width="1.2" ${ara ? 'stroke-dasharray="5 6"' : ''}/><text x="${X(i)}" y="${y0 - 14}" text-anchor="middle" font-family="Inter" font-size="${ara ? fs * .86 : fs}" fill="${R.soluk}">${fYazi(f)}</text>`; });
    if (o.eksen) s += `<text x="${x0 - 14}" y="${y0 - 14}" text-anchor="end" font-family="Inter" font-weight="600" font-size="${fs * .9}" fill="${R.soluk}">dB HL</text><text x="${x0 + Wc}" y="${y0 + Hc + 26}" text-anchor="end" font-family="Inter" font-weight="600" font-size="${fs * .9}" fill="${R.soluk}">Hz</text>`;
  }
  if (o.ara_cizim) s += o.ara_cizim(g);
  const sw = o.kalin || 4.5, r = o.r || 12;
  (o.seriler || []).forEach(sr => {
    const p = sr.p ?? 1; if (p <= 0) return;
    const renk = sr.kulak === 'sol' ? R.sol_kulak : R.sag_kulak, tip = sr.tip || 'hava', kesik = tip.startsWith('kemik');
    const ys = sr.yanitsiz, nr = i => ys === true || (Array.isArray(ys) && (typeof ys[0] === 'boolean' ? !!ys[i] : ys.includes(i)));
    const idx = (sr.degerler || []).map((d, i) => d == null || i >= g.fr.length ? -1 : i).filter(i => i >= 0);
    const gor = p * Math.max(0, idx.length - 1);
    let d = '';
    if (sr.cizgi !== false) for (let j = 0; j < idx.length - 1; j++) { if (j > gor) break; const a = idx[j], b = idx[j + 1];
      if (nr(a) || nr(b)) continue;
      const q = Math.min(1, gor - j), xa = X(a), ya = Y(sr.degerler[a]), xb = X(b), yb = Y(sr.degerler[b]);
      d += `M${xa.toFixed(1)} ${ya.toFixed(1)} L${(xa + (xb - xa) * q).toFixed(1)} ${(ya + (yb - ya) * q).toFixed(1)} `; }
    if (d) s += `<path d="${d}" fill="none" stroke="${renk}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round" ${kesik ? 'stroke-dasharray="10 8"' : ''}/>`;
    idx.forEach((i, j) => { if (j > gor + 1e-6) return; const x = X(i), y = Y(sr.degerler[i]), rr = r * yay(kis((gor - j) * 2 + .5));
      s += odyoIsaret(tip, sr.kulak, x, y, rr, renk, sw); if (nr(i)) s += yanitsizOk(sr.kulak, x, y, rr, renk, sw); });
  });
  if (o.aralik && (o.aralik.p ?? 1) > 0) { const [i, a, b] = o.aralik.konum, x = X(i) + 30, p = o.aralik.p ?? 1, yb = Y(a) + (Y(b) - Y(a)) * p;
    s += `<line x1="${x}" y1="${Y(a) + 4}" x2="${x}" y2="${yb - 4}" stroke="${R.sari}" stroke-width="5" stroke-linecap="round"/>`;
    if (p > .95) s += `<path d="M${x - 7} ${Y(a) + 12} L${x} ${Y(a) + 3} L${x + 7} ${Y(a) + 12} M${x - 7} ${Y(b) - 12} L${x} ${Y(b) - 3} L${x + 7} ${Y(b) - 12}" fill="none" stroke="${R.sari}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><text x="${x + 16}" y="${(Y(a) + Y(b)) / 2 + 8}" font-family="Inter" font-weight="700" font-size="${fs * 1.1}" fill="${R.lacivert}">${o.aralik.etiket || ''}</text>`; }
  return s + '</svg>';
}

// ------------------------------------------------------------ çizimler
const CIZIM = {
  // üzengi kemiği (stapes)
  uzengi: (s, p = 1) => `<svg width="${s}" height="${s}" viewBox="0 0 120 150" style="overflow:visible">
    <g style="opacity:${kis(p * 2)}">
    <circle cx="60" cy="18" r="11" fill="${R.lacivert}"/><rect x="55" y="24" width="10" height="14" rx="4" fill="${R.lacivert}"/>
    <path d="M60 36 C34 52 26 96 26 128" fill="none" stroke="${R.lacivert}" stroke-width="10" stroke-linecap="round" stroke-dasharray="120" stroke-dashoffset="${(120 * (1 - yum(p))).toFixed(1)}"/>
    <path d="M60 36 C86 52 94 96 94 128" fill="none" stroke="${R.lacivert}" stroke-width="10" stroke-linecap="round" stroke-dasharray="120" stroke-dashoffset="${(120 * (1 - yum(p))).toFixed(1)}"/>
    <rect x="12" y="126" width="96" height="16" rx="8" fill="${R.mavi}" style="transform-origin:60px 134px;transform:scaleX(${yum(p * 1.3 - .3).toFixed(3)})"/></g></svg>`,
  pirinc: (s, p = 1) => `<svg width="${s}" height="${s}" viewBox="0 0 120 150"><ellipse cx="60" cy="75" rx="18" ry="54" transform="rotate(18 60 75)" fill="#F3EBD9" stroke="#D9C9A3" stroke-width="3" opacity="${kis(p * 2)}"/></svg>`,
};

// ------------------------------------------------------------ alt yazı
function altyazi(sz, tl) {
  const c = sz.cumleler.find(c => tl >= c.b - .05 && tl <= c.b + c.sure + .25);
  if (!c) return '';
  if (BICIM === 'reels') return karaoke(c, tl - c.b);
  if (!((M.altyazi_gomulu || {})[BICIM])) return '';   // ders videolarında altyazı gömülmez: YouTube ve sitede aç/kapat (srt/vtt)
  return `<div class="ab" style="left:0;right:0;bottom:62px;text-align:center"><span style="display:inline-block;max-width:1500px;font:600 36px/1.42 Inter;color:#fff;background:${R.lacivert}E6;padding:10px 28px;border-radius:12px;box-decoration-break:clone">${c.yazi}</span></div>`;
}
function karaoke(c, tc) {
  // cümleyi en fazla 4 kelimelik parçalara böl, şu an söylenen parçayı göster
  const k = c.kelimeler, gruplar = [];
  for (let i = 0; i < k.length; i += 4) gruplar.push(k.slice(i, i + 4));
  let g = gruplar.findIndex(gr => tc < gr[gr.length - 1].s + .05); if (g < 0) g = gruplar.length - 1;
  const gr = gruplar[g];
  const html = gr.map(w => { const aktif = tc >= w.b - .03 && tc < w.s + .08;
    return `<span style="display:inline-block;margin:0 .12em;padding:.02em .16em;border-radius:.18em;${aktif ? `background:${R.sari};color:${R.lacivert}` : `color:${R.lacivert}`}">${w.k}</span>`; }).join('');
  return `<div class="ab" style="left:60px;right:60px;top:1380px;text-align:center;font:800 70px/1.25 Outfit">${html}</div>`;
}

// ------------------------------------------------------------ sahne türleri
const cb = (sz, i) => (sz.cumleler[i] || sz.cumleler[sz.cumleler.length - 1] || {b: 0}).b;
function cikis(tl, sure) { return kis((sure - tl) / .35); }

const DERS = {
  acilis(s, sz, tl) {
    // üç odyometre tonu (0.15 / 0.45 / 0.75 sn) -> halkalar; sonra logo oluşur
    let halka = '';
    [.15, .45, .75].forEach((b, i) => { const p = kis((tl - b) / 1.1); if (p <= 0 || p >= 1) return;
      halka += `<circle cx="${W / 2}" cy="${H / 2}" r="${(40 + 620 * yum(p)).toFixed(1)}" fill="none" stroke="${R.mavi}" stroke-width="${(6 - 4 * p).toFixed(2)}" stroke-opacity="${(.55 * (1 - p)).toFixed(3)}"/>`; });
    const a = {kavis: kis((tl - .9) / .7), kulak: kis((tl - 1.05) / .6), kitap: kis((tl - 1.3) / .55)};
    const pk = ilerle(tl, 1.5, .6), pa = ilerle(tl, 1.75, .5), ps = ilerle(tl, 2.2, .6);
    const nokta = tl < 1.0 ? `<circle cx="${W / 2}" cy="${H / 2}" r="${(10 * kis(tl / .15) * (1 - kis((tl - .85) / .15))).toFixed(2)}" fill="${R.mavi}"/>` : '';
    const basliki = !!s.baslik;
    if (!basliki) {  // başlıksız şablon (yalnız logo + slogan)
      const cikisO = 1 - kis((tl - 3.5) / .5);
      return `<svg class="ab" style="left:0;top:0" width="${W}" height="${H}">${halka}${nokta}</svg>
       <div class="ab" style="left:0;top:0;width:${W}px;height:${H}px;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:${cikisO.toFixed(3)}">
        <div style="display:flex;align-items:center;gap:${(40 * kis(pk * 3)).toFixed(1)}px">${isaret(300, a)}
         <div style="opacity:${pk};transform:translateX(${(-40 * (1 - pk)).toFixed(1)}px);width:${(560 * kis(pk * 3)).toFixed(0)}px;overflow:visible">${kelimeLogo(160)}
          <div style="font:500 66px Outfit;color:${R.logo_mavi};margin-top:14px;white-space:nowrap;opacity:${pa};transform:translateY(${(16 * (1 - pa)).toFixed(1)}px)">${altAd}</div></div></div>
        <div style="margin-top:70px;font:500 38px Inter;letter-spacing:.06em;color:${R.soluk};opacity:${ps};transform:translateY(${(14 * (1 - ps)).toFixed(1)}px)">${SLOGAN}</div></div>`;
    }
    // başlıklı giriş: 2.3 sn'den sonra logo yukarı kayıp küçülür, altında ders numarası ve ders adı belirir
    const pu = yum((tl - 2.3) / .8), pd = ilerle(tl, 2.75, .6), pb = ilerle(tl, 2.95, .7), pal = ilerle(tl, 3.4, .6);
    return `<svg class="ab" style="left:0;top:0" width="${W}" height="${H}">${halka}${nokta}</svg>
     <div class="ab" style="left:0;top:0;width:${W}px;height:${H}px;display:flex;flex-direction:column;align-items:center;justify-content:center;transform:translateY(${(-250 * pu).toFixed(1)}px) scale(${(1 - .42 * pu).toFixed(4)})">
      <div style="display:flex;align-items:center;gap:${(40 * kis(pk * 3)).toFixed(1)}px">${isaret(300, a)}
       <div style="opacity:${pk};transform:translateX(${(-40 * (1 - pk)).toFixed(1)}px);width:${(560 * kis(pk * 3)).toFixed(0)}px;overflow:visible">${kelimeLogo(160)}
        <div style="font:500 66px Outfit;color:${R.logo_mavi};margin-top:14px;white-space:nowrap;opacity:${pa};transform:translateY(${(16 * (1 - pa)).toFixed(1)}px)">${altAd}</div></div></div></div>
     <div class="ab" style="left:${W / 2 - 160}px;top:452px;width:320px;height:3px;border-radius:2px;background:${R.mavi};opacity:${pd};transform:scaleX(${pd.toFixed(3)})"></div>
     <div class="ab" style="left:0;right:0;top:500px;text-align:center;opacity:${pd};transform:translateY(${(18 * (1 - pd)).toFixed(1)}px)">
       <span style="font:800 30px Inter;letter-spacing:.16em;padding:12px 26px;border-radius:14px;background:${R.lacivert};color:#fff">${s.ust || ''}</span></div>
     <div class="ab" style="left:160px;right:160px;top:590px;text-align:center;font:700 ${s.baslik.replace(/<[^>]+>|\*/g, '').length > 34 ? 82 : 100}px/1.08 Outfit;letter-spacing:-.025em;color:${R.metin};opacity:${pb};transform:translateY(${(30 * (1 - pb)).toFixed(1)}px)">${vurgu(s.baslik)}</div>
     ${s.alt ? `<div class="ab" style="left:200px;right:200px;top:${s.baslik.replace(/<[^>]+>|\*/g, '').length > 34 ? 820 : 740}px;text-align:center;font:500 40px/1.4 Inter;color:${R.soluk};opacity:${pal}">${s.alt}</div>` : ''}`;
  },
  baslik(s, sz, tl) {
    return `<div class="ab" style="left:150px;top:300px;${gir(tl, .1)}"><span style="font:800 30px Inter;letter-spacing:.16em;padding:12px 26px;border-radius:14px;background:${R.lacivert};color:#fff">${s.ust || ''}</span></div>
     <div class="ab" style="left:144px;top:390px;width:1100px;font:700 124px/1.04 Outfit;letter-spacing:-.03em;color:${R.metin};${gir(tl, .3, {dy: 40})}">${vurgu(s.baslik)}</div>
     <div class="ab" style="left:150px;top:${s.baslik.length > 18 ? 680 : 560}px;width:1000px;font:500 40px/1.4 Inter;color:${R.soluk};${gir(tl, .7)}">${s.alt || ''}</div>
     <div class="ab" style="right:150px;top:250px;${gir(tl, .4, {olcek: .85, dy: 0})}"><div style="width:520px;height:520px;border-radius:50%;background:${R.kart};display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 0 2px ${R.cizgi}">${isaret(360, {kavis: kis(tl / 1.1), kulak: kis((tl - .3) / .9), kitap: kis((tl - .8) / .7)})}</div></div>`;
  },
  maddeler(s, sz, tl) {
    const madde = (m, i) => { const b = m.cumle != null ? cb(sz, m.cumle) : .5 + i * .35;
      return `<div style="display:flex;gap:26px;align-items:flex-start;margin-bottom:40px;${gir(tl, b, {dx: -30, dy: 0})}">
       ${m.ikon ? `<div style="margin-top:-6px">${ikonDisk(m.ikon, 76, {kare: true, oran: .72, zemin: '#E1EFFD'})}</div>` : `<div style="flex:none;width:62px;height:62px;border-radius:16px;background:${R.mavi};color:#fff;font:700 30px Inter;display:flex;align-items:center;justify-content:center">${i + 1}</div>`}
       <div style="font:500 42px/1.38 Inter;color:${R.metin};padding-top:4px">${zengin(m.metin)}</div></div>`; };
    const yan = s.yan ? yanGorsel(s.yan, sz, tl) : '';
    return `${bolumEtiketi(s, tl)}
     <div class="ab" style="left:120px;top:170px;width:1680px;font:700 86px/1.1 Outfit;letter-spacing:-.02em;color:${R.metin};${gir(tl, .15)}">${vurgu(s.baslik)}</div>
     <div class="ab" style="left:120px;top:360px;width:${yan ? 820 : 1500}px">${s.maddeler.map(madde).join('')}</div>${yan}`;
  },
  odyogram(s, sz, tl) {
    const o = Object.assign({fs: 21, eksen: true}, s.grafik);
    o.seriler = (s.grafik.seriler || []).map(sr => Object.assign({}, sr, {p: sr.cumle != null ? kis((tl - cb(sz, sr.cumle)) / 1.4) : 1}));
    if (s.grafik.bolge) o.bolge = Object.assign({}, s.grafik.bolge, {p: s.grafik.bolge.cumle != null ? yum((tl - cb(sz, s.grafik.bolge.cumle)) / .9) : 1});
    if (s.grafik.aralik) o.aralik = Object.assign({}, s.grafik.aralik, {p: s.grafik.aralik.cumle != null ? yum((tl - cb(sz, s.grafik.aralik.cumle)) / .8) : 1});
    const lej = (s.lejant || []).map(l => { const p = l.cumle != null ? ilerle(tl, cb(sz, l.cumle), .5) : 1;
      return `<div style="display:flex;align-items:center;gap:20px;margin-bottom:34px;opacity:${p};transform:translateX(${(-24 * (1 - p)).toFixed(1)}px)">
        <div style="flex:none;width:70px;height:70px;border-radius:18px;background:${R.kart};box-shadow:inset 0 0 0 2px ${R.cizgi};display:flex;align-items:center;justify-content:center;font:800 40px Inter;color:${l.renk === 'sol' ? R.sol_kulak : l.renk === 'yesil' ? R.basari : R.sag_kulak}">${l.isaret}</div>
        <div style="font:500 40px/1.35 Inter;color:${R.metin}">${zengin(l.metin)}</div></div>`; }).join('');
    return `${bolumEtiketi(s, tl)}
     <div class="ab" style="left:120px;top:170px;width:1680px;font:700 86px/1.1 Outfit;letter-spacing:-.02em;color:${R.metin};${gir(tl, .15)}">${vurgu(s.baslik)}</div>
     <div class="ab" style="left:120px;top:370px;width:700px">${lej}</div>
     <div class="ab" style="left:880px;top:310px;width:920px;height:620px;background:#fff;border-radius:28px;box-shadow:0 24px 70px ${R.lacivert}14;border:1.5px solid ${R.cizgi};${gir(tl, .35, {olcek: .96})}">
       <div class="ab" style="left:0;top:20px">${odyogram(920, 590, o, tl)}</div></div>`;
  },
  kapanis(s, sz, tl) {
    return `<div class="ab" style="right:-120px;top:120px;opacity:${(.07 * ilerle(tl, 0, 1)).toFixed(3)}">${isaret(900)}</div>
     <div class="ab" style="left:150px;top:300px;${gir(tl, .1)}"><span style="font:700 30px Inter;letter-spacing:.16em;color:${R.mavi}">${EN ? 'NEXT LESSON' : 'SONRAKİ DERS'}</span></div>
     <div class="ab" style="left:144px;top:370px;width:1300px;font:700 110px/1.06 Outfit;letter-spacing:-.03em;color:${R.metin};${gir(tl, .3, {dy: 40})}">${vurgu(s.sonraki || '')}</div>
     ${s.ozet ? `<div class="ab" style="left:150px;top:640px;width:1200px;font:500 40px/1.45 Inter;color:${R.soluk};${gir(tl, .7)}">${zengin(s.ozet)}</div>` : ''}`;
  },
  bitis(s, sz, tl) {
    const se = M.jenerik.son_ekran, v = se.video, ab = se.abone;
    const a = {kavis: kis(tl / .6), kulak: kis((tl - .15) / .6), kitap: kis((tl - .45) / .5)};
    const pv = ilerle(tl, .5, .6), pa = ilerle(tl, .7, .6), ps = ilerle(tl, 1.1, .6);
    return `<div class="ab" style="left:0;right:0;top:70px;display:flex;justify-content:center">
       <div style="display:flex;align-items:center;gap:22px">${isaret(150, a)}<div style="${gir(tl, .3, {dx: -20, dy: 0})}">${kelimeLogo(80)}<div style="font:500 34px Outfit;color:${R.logo_mavi};margin-top:8px">${altAd}</div></div></div></div>
     <div class="ab" style="left:${v.x}px;top:${v.y - 56}px;font:700 28px Inter;letter-spacing:.14em;color:${R.mavi};${gir(tl, .5)}">${EN ? 'KEEP WATCHING' : 'İZLEMEYE DEVAM'}</div>
     <div class="ab" style="left:${v.x}px;top:${v.y}px;width:${v.w}px;height:${v.h}px;box-sizing:border-box;border:3px dashed ${R.mavi}88;border-radius:24px;background:${R.kart};display:flex;align-items:center;justify-content:center;opacity:${pv};transform:scale(${(.94 + .06 * pv).toFixed(3)})">
       <svg width="110" height="110" viewBox="0 0 110 110"><circle cx="55" cy="55" r="52" fill="${R.mavi}"/><path d="M44 34 L78 55 L44 76 Z" fill="#fff"/></svg></div>
     <div class="ab" style="left:${ab.cx - ab.r}px;top:${ab.cy - ab.r}px;width:${ab.r * 2}px;height:${ab.r * 2}px;border-radius:50%;box-sizing:border-box;border:3px dashed ${R.mavi}88;background:${R.kart};display:flex;align-items:center;justify-content:center;opacity:${pa};transform:scale(${(.9 + .1 * yay(pa)).toFixed(3)})">${isaret(170)}</div>
     <div class="ab" style="left:${ab.cx - 220}px;width:440px;top:${ab.cy + ab.r + 34}px;display:flex;justify-content:center;opacity:${pa}">
       <div style="font:700 34px Inter;color:#fff;background:#E62117;padding:16px 40px;border-radius:999px">${EN ? 'Subscribe' : 'Abone ol'}</div></div>
     <div class="ab" style="left:0;right:0;top:${H - 120}px;text-align:center;font:500 32px Inter;letter-spacing:.06em;color:${R.soluk};opacity:${ps}">${SLOGAN}</div>`;
  },
};
function bolumEtiketi(s, tl) {
  if (!s.bolum) return '';
  return `<div class="ab" style="left:120px;top:96px;display:flex;align-items:center;gap:20px;${gir(tl, 0)}">
    <div style="font:700 25px Inter;letter-spacing:.16em;color:${R.mavi}">${s.bolum_no || ''}</div><div style="width:44px;height:2.5px;background:${R.mavi}"></div>
    <div style="font:500 25px Inter;color:${R.soluk}">${s.bolum}</div></div>`;
}
function yanGorsel(y, sz, tl) {
  if (y.tur === 'kart') return `<div class="ab" style="left:1020px;top:340px;width:780px;padding:50px;box-sizing:border-box;background:#fff;border-radius:28px;box-shadow:0 24px 70px ${R.lacivert}14;border:1.5px solid ${R.cizgi};${gir(tl, y.cumle != null ? cb(sz, y.cumle) : .5, {olcek: .96})}">
     <div style="font:700 28px Inter;letter-spacing:.12em;color:${R.mavi}">${y.ust || ''}</div><div style="font:600 46px/1.35 Outfit;color:${R.metin};margin-top:18px">${vurgu(y.metin)}</div></div>`;
  if (y.tur === 'odyogram') { const o = Object.assign({fs: 19, eksen: true}, y.grafik);
    o.seriler = (y.grafik.seriler || []).map(sr => Object.assign({}, sr, {p: sr.cumle != null ? kis((tl - cb(sz, sr.cumle)) / 1.4) : 1}));
    return `<div class="ab" style="left:1000px;top:330px;width:800px;height:560px;background:#fff;border-radius:28px;box-shadow:0 24px 70px ${R.lacivert}14;border:1.5px solid ${R.cizgi};${gir(tl, .4, {olcek: .96})}"><div class="ab" style="left:0;top:16px">${odyogram(800, 530, o, tl)}</div></div>`; }
  return '';
}

// ============================================================ v2: ortak yardımcılar
const L = (tr, en) => EN ? en : tr;
const _tv = document.createElement('canvas').getContext('2d'), _ob = {};
function olc(m, font) { const k = font + '|' + m; if (_ob[k] == null) { _tv.font = font; _ob[k] = _tv.measureText(m).width; } return _ob[k]; }
const duz = m => String(m ?? '').replace(/<[^>]+>/g, '').replace(/[*_]/g, '');
const _hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
function karis(a, b, t) { t = kis(t); const x = _hex(a), y = _hex(b); return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
const basl = (sz, c, yedek) => c != null ? cb(sz, c) : yedek;
const n1 = n => (+n).toFixed(1);
// başlık tek satıra sığmazsa küçülür (86 px -> en az 62 px)
function sahneBasligi(s, tl, o = {}) {
  const w = o.w || 1680, m = duz(s.baslik); let px = o.px || 86;
  while (px > 62 && olc(m, `700 ${px}px Outfit`) > w) px -= 4;
  return `<div class="ab" style="left:120px;top:170px;width:${w}px;font:700 ${px}px/1.1 Outfit;letter-spacing:-.02em;color:${R.metin};${gir(tl, .15)}">${vurgu(s.baslik || '')}</div>`;
}
// bölüm etiketi yoksa sabit etiket (ÖZET, KENDİNİ TEST ET ...)
function ustEtiket(s, tl, metin) {
  if (s.bolum) return bolumEtiketi(s, tl);
  if (!metin) return '';
  return `<div class="ab" style="left:120px;top:96px;display:flex;align-items:center;gap:20px;${gir(tl, 0)}">
    <div style="font:700 25px Inter;letter-spacing:.16em;color:${R.mavi}">${metin}</div><div style="width:44px;height:2.5px;background:${R.mavi}"></div></div>`;
}
const tikSvg = (px, renk = '#fff', k = 3.4) => `<svg width="${px}" height="${px}" viewBox="0 0 24 24" style="display:block"><path d="M5 12.5 L10 17.2 L19 7.5" fill="none" stroke="${renk}" stroke-width="${k}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
// klinik ipucu simgesi: kulak + artı rozeti
function ipucuSimge(px) {
  return `<svg width="${px}" height="${px}" viewBox="0 0 100 100" style="display:block;flex:none">
    <circle cx="50" cy="50" r="47" fill="#FFF4DC" stroke="${R.sari}" stroke-width="4"/>
    <path d="M37 64 C 31 56 29 48 30 41 C 32 27 43 20 54 21 C 66 22 74 31 73 43 C 72 52 66 56 62 61 C 59 65 60 71 55 75 C 50 79 43 77 41 72" fill="none" stroke="${R.lacivert}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M42 44 C 42 36 48 32 54 33 C 60 34 63 40 61 45 C 59 50 53 50 52 55" fill="none" stroke="${R.lacivert}" stroke-width="5" stroke-linecap="round"/>
    <circle cx="73" cy="73" r="15" fill="${R.sari}" stroke="#fff" stroke-width="3"/><path d="M73 65.5 V80.5 M65.5 73 H80.5" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/></svg>`;
}
const ipucuEtiket = (px = 24) => `<span style="font:800 ${px}px Inter;letter-spacing:.14em;padding:8px 16px;border-radius:10px;background:${R.sari};color:${R.lacivert};white-space:nowrap">${L('KLİNİK İPUCU', 'CLINICAL TIP')}</span>`;

// ============================================================ çizim altyapısı
// Her çizim: CIZ[ad](c, ayar) -> {w, h, a: {parca: [x, y]}, yer: {parca: 'sol'|'sag'}, svg: () => '...'}
// c.P(id, v => svg): parçayı adlandırır; vurgulanınca mavi parlar (v: 0..1 vurgu düzeyi, renk karıştırmak için)
const KR = {cz: R.lacivert, doku: '#F3F7FC', deri: '#EDF3FA', kemik: '#E4ECF6', osk: '#DDE7F4', hava: '#FFFFFF', sivi: '#D9ECFC',
  endo: '#BBDBF8', kas: '#F6DCCB', sinir: '#FFD47E', metal: '#CFDAE7', zar: '#A8CFF3', ince: '#9AABC2'};
function cizimBaglam(sz, tl, y) {
  const v = {};
  (y.vurgula || []).forEach(x => { const id = typeof x === 'string' ? x : x.parca, p = typeof x === 'string' || x.cumle == null ? 1 : ilerle(tl, cb(sz, x.cumle), .6);
    v[id] = Math.max(v[id] || 0, p); });
  const c = {t: tl, v, k: 1, gid: uid('pl'), miras: 0, sz, cb: i => cb(sz, i), etiketli: new Set((y.etiketler || []).map(e => e.parca))};
  c.fs = px => px / c.k;
  c.P = (id, fn) => { const o = Array.isArray(id) ? Math.max(0, ...id.map(i => c.v[i] || 0)) : c.v[id] || 0, v0 = c.miras, vv = Math.max(o, v0); c.miras = vv; const ic = fn(vv); c.miras = v0;
    const parla = o > v0 + .002 ? `<g filter="url(#${c.gid})" opacity="${(.95 * (o - v0)).toFixed(3)}">${ic}</g>` : '';
    return `<g>${parla}${ic}</g>`; };
  c.f = (renk, v) => karis(renk, '#B3D8FA', .85 * v);   // dolgu: vurguda açık maviye
  c.s = (v, renk = R.lacivert) => karis(renk, R.mavi, v);   // çizgi: vurguda maviye
  c.yazi = (x, y, m, o = {}) => `<text x="${n1(x)}" y="${n1(y)}" text-anchor="${o.a || 'middle'}" font-family="${o.ff || 'Inter'}" font-weight="${o.fw || 600}" font-size="${n1(c.fs(o.px || 20))}" fill="${o.renk || R.soluk}" ${o.ek || ''}>${m}</text>`;
  return c;
}
// kalın boru (dış çizgi + iç dolgu)
const boru = (d, w, ic, dis = KR.cz, k = 2.5) => `<path d="${d}" fill="none" stroke="${dis}" stroke-width="${w + 2 * k}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${ic}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
function sarmal(cx, cy, r0, r1, tur, a0 = 0, n = 220) {
  let d = ''; for (let i = 0; i <= n; i++) { const u = i / n, a = a0 + u * tur * 2 * Math.PI, r = r0 + (r1 - r0) * u;
    d += (i ? 'L' : 'M') + n1(cx + r * Math.cos(a)) + ' ' + n1(cy + r * Math.sin(a)); } return d;
}
const yolDiz = pts => pts.map((p, i) => (i ? 'L' : 'M') + n1(p[0]) + ' ' + n1(p[1])).join('');
// ok başı (uç noktası x,y; yön açısı a)
const okBasi = (x, y, a, b = 14, renk = R.lacivert, k = 3) => `<path d="M${n1(x - b * Math.cos(a - .5))} ${n1(y - b * Math.sin(a - .5))} L${n1(x)} ${n1(y)} L${n1(x - b * Math.cos(a + .5))} ${n1(y - b * Math.sin(a + .5))}" fill="none" stroke="${renk}" stroke-width="${k}" stroke-linecap="round" stroke-linejoin="round"/>`;
// grafik eksenleri (timpanogram, ABR, OAE)
function eksenCiz(c, o) {
  let s = '';
  (o.yt || []).forEach(t => { s += `<line x1="${o.x0}" y1="${n1(t.y)}" x2="${o.x1}" y2="${n1(t.y)}" stroke="${R.cizgi}" stroke-width="${n1(c.fs(1.3))}"/>`;
    if (t.e != null) s += c.yazi(o.x0 - c.fs(12), t.y + c.fs(7), t.e, {a: 'end', fw: 500}); });
  (o.xt || []).forEach(t => { s += `<line x1="${n1(t.x)}" y1="${o.y0}" x2="${n1(t.x)}" y2="${o.y1}" stroke="${R.cizgi}" stroke-width="${n1(c.fs(1.3))}" ${t.ince ? 'stroke-dasharray="4 6"' : ''}/>`;
    if (t.e != null) s += c.yazi(t.x, o.y1 + c.fs(28), t.e, {fw: 500}); });
  s += `<path d="M${o.x0} ${o.y0} L${o.x0} ${o.y1} L${o.x1} ${o.y1}" fill="none" stroke="${R.lacivert}" stroke-width="${n1(c.fs(2.2))}"/>`;
  if (o.xAd) s += c.yazi((o.x0 + o.x1) / 2, o.y1 + c.fs(60), o.xAd, {px: 21});
  if (o.yAd) { const x = o.x0 - c.fs(o.yAdUz || 62), yy = (o.y0 + o.y1) / 2; s += c.yazi(x, yy, o.yAd, {px: 21, ek: `transform="rotate(-90 ${n1(x)} ${n1(yy)})"`}); }
  return s;
}

// kamera (yakinlastir): {parca, cumle, olcek, sure, merkez} ya da bunların listesi; parca "genel" tüm çizime döner
const yumIO = x => { x = kis(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
function kamera(yk, d, sz, tl) {
  const vx = d.vx || 0, vy = d.vy || 0, tum = {x: vx, y: vy, w: d.w, h: d.h};
  if (!yk) return tum;
  let b = tum;
  (Array.isArray(yk) ? yk : [yk]).forEach(s => {
    if (typeof s === 'string') s = {parca: s};
    const bas = (s.cumle != null ? cb(sz, s.cumle) : .4) + (s.gecikme || 0), p = yumIO((tl - bas) / (s.sure || 1.6));
    if (p <= 0) return;
    let h = tum;
    if (s.parca !== 'genel' && (s.parca || s.merkez)) {
      const m = s.merkez || (d.kam || {})[s.parca] || (d.a || {})[s.parca] || [vx + d.w / 2, vy + d.h / 2], ol = Math.max(1, s.olcek || 2.2), w = d.w / ol, hh = d.h / ol;
      h = {x: Math.min(Math.max(m[0] - w / 2, vx), vx + d.w - w), y: Math.min(Math.max(m[1] - hh / 2, vy), vy + d.h - hh), w, h: hh};
    }
    const w = b.w * Math.pow(h.w / b.w, p), oran = Math.abs(h.w - b.w) > 1e-6 ? (w - b.w) / (h.w - b.w) : p;
    b = {x: b.x + (h.x - b.x) * oran, y: b.y + (h.y - b.y) * oran, w, h: w * d.h / d.w};
  });
  return b;
}

// Çizim kartı: çizim + etiketler (çizginin ucu parçada, yazı çizimin dışında, üst üste binmez)
function cizimKarti(y, sz, tl, kutu, o = {}) {
  const giris = o.giris != null ? gir(tl, o.giris, {olcek: .96}) : '';
  const kart = ic => `<div class="ab" style="left:${kutu.x}px;top:${kutu.y}px;width:${kutu.w}px;height:${kutu.h}px;${KART};${giris}">${ic}</div>`;
  const tanim = CIZ[y.cizim];
  if (!tanim) return kart(`<div class="ab" style="left:40px;top:40px;font:600 30px Inter;color:${R.soluk}">${L('Bilinmeyen çizim', 'Unknown drawing')}: ${y.cizim}</div>`);
  const c = cizimBaglam(sz, tl, y), d = tanim(c, y.ayar || {});
  for (const [al, h] of Object.entries(Object.assign({}, d.takma || {}, d.vurguEsle || {}))) if (c.v[al]) c.v[h] = Math.max(c.v[h] || 0, c.v[al]);
  c.cm = d.cm || 1;
  const pad = o.pad ?? 34, fpx = o.fpx ?? 25, font = `600 ${fpx}px Inter`, maxW = o.maxW ?? 270, g = o.bosluk ?? 46, sh = Math.round(fpx * 1.26);
  const et = (y.etiketler || []).filter(e => d.a[e.parca]).map(e => { const m = duz(e.metin), w = olc(m, font), sat = w > maxW ? Math.ceil(w / (maxW * .9)) : 1;
    return {e, a: d.a[e.parca], m, w: Math.ceil(Math.min(w, maxW)) + 4, h: sat * sh}; });
  const dyer = d.yer || {}, vx = d.vx || 0, vy = d.vy || 0;
  et.forEach(x => x.taraf = x.e.yer || dyer[x.e.parca] || (x.a[0] - vx < d.w / 2 ? 'sol' : 'sag'));
  if (o.sikisik && et.length) {  // dar kartta etiketler mümkünse tek tarafta
    const ys = et.filter(x => x.taraf === 'sol' || x.taraf === 'sag'), nsol = ys.filter(x => x.taraf === 'sol').length, cok = nsol * 2 >= ys.length ? 'sol' : 'sag';
    ys.forEach(x => { if (!x.e.yer && x.taraf !== cok && (cok === 'sol' ? x.a[0] - vx < d.w * .72 : x.a[0] - vx > d.w * .28)) x.taraf = cok; });
  }
  const sol = et.filter(x => x.taraf === 'sol'), sag = et.filter(x => x.taraf === 'sag'), ustE = et.filter(x => x.taraf === 'ust'), altE = et.filter(x => x.taraf === 'alt');
  ustE.concat(altE).forEach(x => { x.w = Math.ceil(olc(x.m, font)) + 4; x.h = sh; });
  const wl = sol.length ? Math.max(...sol.map(x => x.w)) : 0, wr = sag.length ? Math.max(...sag.map(x => x.w)) : 0;
  const el = wl ? wl + g : 0, er = wr ? wr + g : 0, eu = ustE.length ? sh + g * .8 : 0, ea = altE.length ? sh + g * .8 : 0, iw = kutu.w - 2 * pad, ih = kutu.h - 2 * pad;
  const k = Math.min((iw - el - er) / d.w, (ih - eu - ea) / d.h, o.kmax || d.kmax || 1.6);
  const dw = d.w * k, dh = d.h * k, cw = el + dw + er, dx = pad + (iw - cw) / 2 + el, dy = pad + eu + (ih - eu - ea - dh) / 2;
  // kamera: görüş kutusu (yakınlaştırmada küçülür); çizgiler ekranda aynı kalınlıkta kalır, hafifçe kalınlaşır
  const kam = kamera(y.yakinlastir, d, sz, tl), Z = d.w / kam.w, kz = k * Z; c.k = kz; c.z = Z;
  const SX = ax => dx + (ax - kam.x) * kz, SY = ay => dy + (ay - kam.y) * kz;
  const icerde = x => { const sx = SX(x.a[0]), sy = SY(x.a[1]), m = 6, dd = Math.max(dx + m - sx, sx - (dx + dw - m), dy + m - sy, sy - (dy + dh - m), 0); return kis(1 - dd / 24); };
  const yerlestir = arr => { arr.sort((p, q) => p.a[1] - q.a[1]); const ust = pad - 6, alt = kutu.h - pad + 6, ara = 12;
    arr.forEach(x => x.y = Math.min(Math.max(SY(x.a[1]), dy), dy + dh) - x.h / 2);
    for (let i = 0; i < arr.length; i++) { const min = i ? arr[i - 1].y + arr[i - 1].h + ara : ust; if (arr[i].y < min) arr[i].y = min; }
    for (let i = arr.length - 1; i >= 0; i--) { const max = i < arr.length - 1 ? arr[i + 1].y - ara - arr[i].h : alt - arr[i].h; if (arr[i].y > max) arr[i].y = max; } };
  yerlestir(sol); yerlestir(sag);
  // üst ve alt sıra etiketleri: yatayda çakışmasız
  const sira = (arr, yy) => { arr.sort((p, q) => p.a[0] - q.a[0]).forEach(x => { x.x = Math.min(Math.max(SX(x.a[0]), dx), dx + dw) - x.w / 2; x.y = yy; });
    for (let i = 0; i < arr.length; i++) { const min = i ? arr[i - 1].x + arr[i - 1].w + 26 : pad; if (arr[i].x < min) arr[i].x = min; }
    for (let i = arr.length - 1; i >= 0; i--) { const max = i < arr.length - 1 ? arr[i + 1].x - 26 - arr[i].w : kutu.w - pad - arr[i].w; if (arr[i].x > max) arr[i].x = max; } };
  sira(ustE, dy - g * .8 - sh); sira(altE, dy + dh + g * .8);
  let cizgiler = '', yazilar = '';
  et.forEach(x => {
    const b = (x.e.cumle != null ? cb(sz, x.e.cumle) : (o.giris ?? 0) + .6) + ((d.gecikme || {})[x.e.parca] || 0), gor = icerde(x), p = ilerle(tl, b, .55) * (gor > 0 ? 1 : 0), pe = ilerle(tl, b + .25, .45) * gor;
    if (p <= 0 || gor <= 0) return;
    const sx = SX(x.a[0]), sy = SY(x.a[1]);
    let yol, lxx, hiz = 'left', kay = '';
    if (x.taraf === 'ust') {
      const lcx = x.x + x.w / 2, ey = Math.min(dy - 10, sy - 10);
      yol = [[sx, sy], [sx, ey], [lcx, x.y + sh + 6]]; lxx = x.x; hiz = 'center'; kay = `translateY(${n1(10 * (1 - pe))}px)`;
    } else if (x.taraf === 'alt') {
      const lcx = x.x + x.w / 2, ey = Math.max(dy + dh + 10, sy + 10);
      yol = [[sx, sy], [sx, ey], [lcx, x.y - 6]]; lxx = x.x; hiz = 'center'; kay = `translateY(${n1(-10 * (1 - pe))}px)`;
    } else {
      const ly = x.y + x.h / 2, solda = x.taraf === 'sol';
      const ex = solda ? Math.min(dx - 14, sx - 10) : Math.max(dx + dw + 14, sx + 10), lx = solda ? dx - g + 8 : dx + dw + g - 8;
      yol = [[sx, sy], [ex, ly], [lx, ly]]; lxx = solda ? dx - g - x.w : dx + dw + g; hiz = solda ? 'right' : 'left'; kay = `translateX(${n1((solda ? 10 : -10) * (1 - pe))}px)`;
    }
    const uz = Math.hypot(yol[1][0] - yol[0][0], yol[1][1] - yol[0][1]) + Math.hypot(yol[2][0] - yol[1][0], yol[2][1] - yol[1][1]);
    cizgiler += `<g opacity="${gor.toFixed(3)}"><path d="${yolDiz(yol)}" fill="none" stroke="${R.lacivert}" stroke-opacity=".8" stroke-width="2" stroke-dasharray="${n1(uz + 1)}" stroke-dashoffset="${n1((uz + 1) * (1 - p))}"/>
      <circle cx="${n1(sx)}" cy="${n1(sy)}" r="${n1(6.5 * yay(kis(p * 1.4)))}" fill="${R.mavi}" stroke="#fff" stroke-width="2.5"/></g>`;
    yazilar += `<div class="ab" style="left:${n1(lxx)}px;top:${n1(x.y)}px;width:${x.w}px;font:${font};line-height:${sh}px;color:${R.metin};text-align:${hiz};opacity:${pe.toFixed(3)};transform:${kay}">${zengin(x.e.metin)}</div>`;
  });
  const icSvg = d.svg();   // çizim önce üretilir (filtre ölçekleri kayıt edilir)
  const filtre = (id, olcek) => `<filter id="${id}" filterUnits="userSpaceOnUse" x="${vx - d.w * .4}" y="${vy - d.h * .4}" width="${d.w * 1.8}" height="${d.h * 1.8}" color-interpolation-filters="sRGB">
    <feMorphology in="SourceAlpha" operator="dilate" radius="${(3 / kz / olcek).toFixed(2)}" result="g1"/><feGaussianBlur in="g1" stdDeviation="${(7 / kz / olcek).toFixed(2)}" result="g2"/>
    <feFlood flood-color="${R.mavi}" result="g3"/><feComposite in="g3" in2="g2" operator="in"/></filter>`;
  const kirp = d.kirp || Z > 1.001, kid = uid('kp');
  const defs = `<defs>${filtre(c.gid, 1)}${filtre(c.gid + 'c', KG.S)}${filtre(c.gid + 'k', KK.S)}${kirp ? `<clipPath id="${kid}"><rect x="${n1(kam.x)}" y="${n1(kam.y)}" width="${n1(kam.w)}" height="${n1(kam.h)}" rx="${n1(16 / kz)}"/></clipPath>` : ''}</defs>`;
  return kart(`<svg class="ab" style="left:${n1(dx)}px;top:${n1(dy)}px;overflow:visible" width="${n1(dw)}" height="${n1(dh)}" viewBox="${n1(kam.x)} ${n1(kam.y)} ${n1(kam.w)} ${n1(kam.h)}">${defs}${kirp ? `<g clip-path="url(#${kid})">${icSvg}</g>` : icSvg}</svg>
    <svg class="ab" style="left:0;top:0;overflow:visible" width="${kutu.w}" height="${kutu.h}">${cizgiler}</svg>${yazilar}`);
}

// ============================================================ çizim kütüphanesi
const CIZ = {};

// ============================================================ ANA ÇİZİM SETİ (onaylı: 12_Cizim_Taslaklari, Gray 1918 referanslı)
// Bir yapı bir kez çizilir. kulak_kesit, orta_kulak ve kemikcikler AYNI ana kulak geometrisini kullanır (yalnız görüş kutusu
// farklı); koklea_kesit içindeki Corti organı, corti çizimindeki şekillerin küçültülmüş halidir. Kaynak betikler:
// 12_Cizim_Taslaklari/_Kaynak (kulak.py, koklea_corti.py, geo.py). Çizgi kalınlıkları ekran pikseli olarak verilir (kalem()).
const AR = {kemik: '#E4ECF6', doku: '#F3F7FC', deri: '#EDF3FA', kik: '#E9EFF8', sivi: '#D9ECFC', endo: '#BBDBF8', sinir: '#FFD47E',
  sinir_c: '#C98A1C', kas: '#F6DCCB', kas_c: '#C9876A', zar: '#A8CFF3', osk: '#DDE7F4', ince: '#9AABC2', kesik: '#C6D3E3',
  cekirdek: '#9DB3CF', beyaz: '#FFFFFF'};
const NV = '#0E2240';
// Catmull-Rom -> kübik Bezier (geo.smooth)
function gYol(P, kapali = false, t = .5) {
  const n = P.length; if (n < 2) return '';
  let d = `M${n1(P[0][0])} ${n1(P[0][1])}`;
  const son = kapali ? n : n - 1;
  for (let i = 0; i < son; i++) {
    const p0 = (kapali || i > 0) ? P[(i - 1 + n) % n] : P[0], p1 = P[i], p2 = P[(i + 1) % n], p3 = (kapali || i + 2 < n) ? P[(i + 2) % n] : P[n - 1];
    d += `C${n1(p1[0] + (p2[0] - p0[0]) * t / 3)} ${n1(p1[1] + (p2[1] - p0[1]) * t / 3)} ${n1(p2[0] - (p3[0] - p1[0]) * t / 3)} ${n1(p2[1] - (p3[1] - p1[1]) * t / 3)} ${n1(p2[0])} ${n1(p2[1])}`;
  }
  return d + (kapali ? 'Z' : '');
}
const gElips = (cx, cy, rx, ry) => `M${n1(cx - rx)} ${n1(cy)}a${n1(rx)} ${n1(ry)} 0 1 0 ${n1(2 * rx)} 0a${n1(rx)} ${n1(ry)} 0 1 0 ${n1(-2 * rx)} 0Z`;
const gPoly = (pts, kapali = true) => 'M' + pts.map(p => n1(p[0]) + ' ' + n1(p[1])).join(' L') + (kapali ? 'Z' : '');
function gCatmull(pts, per = 12) {
  const out = [], n = pts.length;
  for (let i = 0; i < n - 1; i++) {
    const p0 = i > 0 ? pts[i - 1] : pts[0], p1 = pts[i], p2 = pts[i + 1], p3 = i + 2 < n ? pts[i + 2] : pts[n - 1];
    for (let k = 0; k < per; k++) { const s = k / per, s2 = s * s, s3 = s2 * s;
      out.push([0, 1].map(j => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * s + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * s2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * s3))); }
  }
  out.push(pts[n - 1]); return out;
}
// değişken genişlikli boru kenarları (geo.tube_outline)
function gBoru(merkez, gen) {
  const n = merkez.length;
  if (gen.length !== n) { const m = gen.length - 1, ws = [];
    for (let i = 0; i < n; i++) { const u = i / (n - 1) * m, j = Math.min(Math.floor(u), m - 1); ws.push(gen[j] + (gen[j + 1] - gen[j]) * (u - j)); } gen = ws; }
  const Lf = [], Rt = [];
  for (let i = 0; i < n; i++) { const a = merkez[Math.max(i - 1, 0)], b = merkez[Math.min(i + 1, n - 1)], dx = b[0] - a[0], dy = b[1] - a[1], ln = Math.hypot(dx, dy) || 1,
    nx = -dy / ln, ny = dx / ln, w = gen[i] / 2;
    Lf.push([merkez[i][0] + nx * w, merkez[i][1] + ny * w]); Rt.push([merkez[i][0] - nx * w, merkez[i][1] - ny * w]); }
  return [Lf, Rt];
}
const kapat = (Lf, Rt) => Lf.concat(Rt.slice().reverse());
// kalem: çizgi kalınlığı ekran pikseli (c.k: çizim birimi başına piksel, c.z: kamera yakınlaştırması, c.cm: görünüm katsayısı)
function kalem(c, olc = 1) {
  const w = px => px * (c.cm || 1) * Math.pow(c.z || 1, .3) / ((c.k || 1) * olc), W2 = px => w(px).toFixed(2);
  return {w, W2,
    yol: (d, fill = 'none', stroke = NV, sw = 3, ek = '') => `<path d="${d}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${W2(sw)}" stroke-linejoin="round" stroke-linecap="round"` : ''}${ek ? ' ' + ek : ''}/>`,
    boru: (d, ww, ic, dis = NV, k = 2.6) => `<path d="${d}" fill="none" stroke="${dis}" stroke-width="${(ww + 2 * w(k)).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${ic}" stroke-width="${ww}" stroke-linecap="round" stroke-linejoin="round"/>`};
}
// vurgu boyası: dolgular açık maviye, çizgiler maviye
const boya = (s, v) => v <= .002 ? s : s.replace(/(fill|stroke)="(#[0-9A-Fa-f]{6})"/g, (m, a, h) => `${a}="${a === 'fill' ? karis(h, '#B3D8FA', .85 * v) : karis(h, R.mavi, v)}"`);

// ---------------------------------------------------------------- ana kulak geometrisi (sağ kulak, önden koronal kesit)
const KG = (() => {
  const S = 1.6, TT = [625, 385], CT = [505, 330];
  const c2o = p => [CT[0] + (p[0] - TT[0]) * S, CT[1] + (p[1] - TT[1]) * S];
  const MATRIS = `matrix(${S} 0 0 ${S} ${CT[0] - TT[0] * S} ${CT[1] - TT[1] * S})`;
  const B = [722, 524], U = [699, 465], LP = [639, 404], FN = [787, 403], FP_X = 788, ST_Y = 440, V0 = [834, 438], KC = [930, 466], S_IC = 19, PR_C = [782, 428];
  // 3B yarım daire kanalları (düzlemleri gerçek açılarla), önden izdüşüm, 12 derece içten
  const ad = (a, b) => a.map((x, i) => x + b[i]), ck = (a, b) => a.map((x, i) => x - b[i]), ca = (a, s) => a.map(x => x * s);
  const ns = a => a[0] * a[0] + a[1] * a[1] + a[2] * a[2], dt = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cr = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], nr = a => ca(a, 1 / Math.sqrt(ns(a)));
  function yay3(P1, P2, n, Rr, yan, N = 120) {
    n = nr(n); const mid = ca(ad(P1, P2), .5), ch = ck(P2, P1), Lc = Math.sqrt(ns(ch));
    let perp = nr(cr(n, ch)); if (dt(perp, yan) < 0) perp = ca(perp, -1);
    const d = Math.sqrt(Math.max(Rr * Rr - (Lc / 2) ** 2, 0)), C = ad(mid, ca(perp, d));
    const e1 = nr(ck(P1, C)), e2 = nr(cr(n, e1)), v2 = ck(P2, C), a2 = Math.atan2(dt(v2, e2), dt(v2, e1));
    const ad2 = [a2, a2 > 0 ? a2 - 2 * Math.PI : a2 + 2 * Math.PI].map(A => Array.from({length: N}, (_, i) => { const t = A * i / (N - 1); return ad(C, ad(ca(e1, Rr * Math.cos(t)), ca(e2, Rr * Math.sin(t)))); }));
    const puan = p => dt(ck(p[N >> 1], mid), yan);
    return puan(ad2[0]) >= puan(ad2[1]) ? ad2[0] : ad2[1];
  }
  const yaw = 12 * Math.PI / 180;
  const proj = ([m, u, a]) => [V0[0] + S_IC * (m * Math.cos(yaw) - a * Math.sin(yaw)), V0[1] - S_IC * u, m * Math.sin(yaw) + a * Math.cos(yaw)];
  const CC = [.9, 3.0, -1.0];
  const KANAL3D = {superior: [[-1.1, 3.0, 1.1], CC, [.707, 0, .707], 3.2, [0, 1, 0]],
    posterior: [[-.5, -1.5, -2.4], CC, [.707, 0, -.707], 3.1, [-.707, 0, -.707]],
    lateral: [[-1.0, 4.0, .8], [-.1, 2.44, -1.9], [0, .866, -.5], 2.0, [-.9, 0, -.4]]};
  let _kn = null;
  function kanallar() {
    if (_kn) return _kn; _kn = {};
    for (const [k, [pa, pb, n, Rr, yan]] of Object.entries(KANAL3D)) _kn[k] = yay3(pa, pb, n, Rr, yan).map(proj);
    const alt = [.6, 1.6, -.8]; _kn.crus = Array.from({length: 16}, (_, i) => proj(ad(CC, ca(ck(alt, CC), i / 15))));
    return _kn;
  }
  // koklea salyangozu: logaritmik sarmal, 2,5 tur, tepe tarafından bakışta saat yönünün tersine
  const SAL = {C: KC, R0: 104, k: -Math.log(.56) / (2 * Math.PI), sx: .86, kay: [-16, 4], phi0: 145 * Math.PI / 180, tur: 2.5};
  const sr = th => SAL.R0 * Math.exp(-SAL.k * th);
  const sP = (th, rr) => { rr = rr == null ? sr(th) : rr; const ph = SAL.phi0 - th, s = 1 - sr(th) / SAL.R0;
    return [SAL.C[0] + SAL.kay[0] * s + SAL.sx * rr * Math.cos(ph), SAL.C[1] + SAL.kay[1] * s + rr * Math.sin(ph)]; };
  const sEgri = (a, b, n = 160) => Array.from({length: n}, (_, i) => sP(a + (b - a) * i / (n - 1)));
  const TUR = 2 * Math.PI, TH_END = TUR * SAL.tur;
  // aynı 3B kanal modeli başka bakış açısından (vestibüler çizim): mm cinsinden [x, y, derinlik]
  const projAc = ([m, u, a], yd, pd) => { const y = yd * Math.PI / 180, p = pd * Math.PI / 180, m2 = m * Math.cos(y) - a * Math.sin(y), a2 = m * Math.sin(y) + a * Math.cos(y);
    return [m2, -(u * Math.cos(p) - a2 * Math.sin(p)), u * Math.sin(p) + a2 * Math.cos(p)]; };
  const _ac = {};
  function kanallarAc(yd, pd) {
    const key = yd + '|' + pd; if (_ac[key]) return _ac[key]; const o = {};
    for (const [k, [pa, pb, n, Rr, yan]] of Object.entries(KANAL3D)) o[k] = yay3(pa, pb, n, Rr, yan).map(q => projAc(q, yd, pd));
    const alt = [.6, 1.6, -.8]; o.crus = Array.from({length: 16}, (_, i) => projAc(ad(CC, ca(ck(alt, CC), i / 15)), yd, pd));
    return (_ac[key] = o);
  }
  return {S, c2o, MATRIS, B, U, LP, FN, FP_X, ST_Y, V0, KC, PR_C, kanallar, kanallarAc, projAc, sP, sr, sEgri, TUR, TH_END};
})();

// ------------------------------------------------ dış katman (çıktı koordinatları)
const KULAK_P = {
  kesit_zemini: k => k.yol(gYol([[240, 16], [1580, 16], [1592, 28], [1592, 972], [1580, 984], [240, 984]], true, .08), AR.doku, AR.kesik, 1.6),
  deri: k => k.yol(gYol([[244, 16], [242, 150], [240, 260], [239, 360], [239, 540], [240, 700], [242, 840], [243, 984]]), 'none', NV, 2.8),
  kulak_kepcesi: k => {
    const D = [[241, 252], [230, 196], [204, 150], [160, 124], [112, 128], [76, 160], [56, 214], [48, 290], [50, 380], [60, 468], [78, 552], [95, 622], [104, 680],
      [118, 730], [146, 764], [184, 770], [214, 750], [233, 712], [241, 670]];
    let s = k.yol(gYol(D, false, .5) + 'Z', AR.deri, NV, 3.0); const ic = AR.ince;
    s += k.yol(gYol([[222, 232], [196, 182], [156, 156], [114, 162], [86, 196], [74, 256], [74, 340], [82, 430], [96, 512], [112, 584], [126, 638]]), 'none', ic, 2.2);
    s += k.yol(gYol([[190, 214], [152, 214], [122, 246], [110, 306], [112, 386], [124, 462], [142, 532], [160, 586], [178, 618]]), 'none', ic, 2.2);
    s += k.yol(gYol([[152, 214], [180, 236], [204, 262]]), 'none', ic, 2.0);
    s += k.yol(gYol([[241, 300], [206, 296], [172, 318], [152, 366], [150, 428], [160, 488], [184, 536], [214, 556], [241, 560]]) + 'Z', '#E1EAF5', NV, 2.0);
    s += k.yol(gYol([[172, 604], [192, 630], [218, 636], [236, 626]]), 'none', ic, 2.0);
    s += k.yol(gYol([[241, 478], [226, 480], [214, 498], [216, 526], [228, 542], [241, 544]]), AR.deri, NV, 2.4);
    return s; },
  kikirdak_kanal: k => {
    const U1 = [[239, 372], [280, 368], [316, 364], [346, 362]], A1 = [[239, 532], [280, 534], [316, 536], [346, 538]];
    let s = k.yol(gPoly(U1.concat([[352, 362], [352, 538]], A1.slice().reverse())), AR.beyaz, null);
    s += k.yol(gYol([[248, 360], [296, 354], [340, 350], [340, 336], [296, 340], [248, 346]]) + 'Z', AR.kik, AR.ince, 1.4);
    s += k.yol(gYol([[248, 544], [296, 548], [340, 552], [340, 566], [296, 562], [248, 558]]) + 'Z', AR.kik, AR.ince, 1.4);
    return s + k.yol(gYol(U1), 'none', NV, 2.6) + k.yol(gYol(A1), 'none', NV, 2.6); },
};

// ------------------------------------------------ çekirdek katman (orta ve iç kulak; KG.MATRIS ile yerleşir)
const ORTA_K = [[625, 385], [626, 344], [630, 312], [646, 297], [720, 292], [758, 296], [768, 310], [762, 330], [766, 352], [776, 372], [778, 386], [777, 400], [784, 410],
  [796, 413], [797, 467], [786, 476], [771, 486], [765, 497], [773, 506], [786, 513], [779, 525], [769, 538], [762, 558], [750, 580], [734, 572], [722, 524]];
function elipsYay(cx, cy, rx, ry, a0, a1, n = 14, egik = 0) {
  const e = egik * Math.PI / 180;
  return Array.from({length: n}, (_, i) => { const a = (a0 + (a1 - a0) * i / (n - 1)) * Math.PI / 180, x = rx * Math.cos(a), y = ry * Math.sin(a);
    return [cx + x * Math.cos(e) - y * Math.sin(e), cy + x * Math.sin(e) + y * Math.cos(e)]; });
}
const MALLEUS_K = elipsYay(653, 349, 23, 26, 66, -246, 22, 8).concat([[646, 380], [648, 390], [646, 398], KG.LP, [650, 410], [659, 416], [671, 431], [684, 448],
  [694, 461], [700, 469], [705, 465], [702, 455], [693, 439], [681, 421], [670, 405], [664, 393], [663, 384], [664, 377]]);
const INCUS_K = [[670, 338], [680, 325], [697, 319], [713, 322], [724, 334], [726, 350], [721, 364], [716, 374], [717, 392], [721, 410], [725, 424], [730, 433], [732, 440],
  [724, 444], [717, 432], [711, 414], [706, 394], [702, 380], [694, 373], [682, 369], [673, 358]];
const INCUS_KISA = [[712, 326], [730, 318], [749, 315], [753, 322], [736, 334], [718, 344]];
// vestibül: taslaktan biraz daha geniş kese; ampulla ağızları ve ortak bacak (crus commune) kesenin içinde birleşir (üst kısım sade)
const VEST_K = [[797, 420], [798, 396], [803, 377], [814, 363], [830, 355], [847, 357], [861, 369], [867, 392], [867, 421], [860, 447], [847, 464], [829, 472], [811, 469], [800, 457]];
function kanalBoru(pts, w0, wamp, amp = true) {
  const xy = pts.map(p => [p[0], p[1]]), n = xy.length;
  const ws = xy.map((_, i) => { const u = i / (n - 1), a = amp ? Math.max(0, 1 - u / .16) : 0; return w0 + (wamp - w0) * Math.pow(Math.sin(Math.min(a, 1) * Math.PI / 2), 1.2); });
  const [Lf, Rt] = gBoru(xy, ws); return {Lf, Rt, xy, ws};
}
function kokleaSekli() {
  const W_ = th => KG.sP(th), d0 = W_(0), i0 = W_(KG.TUR);
  // kanca (yuvarlak pencereden bazal tura): bazal turla aynı genişliğe yumuşakça açılır, kuyruk gibi durmaz
  const kanca_dis = [[789, 523], [812, 523], [836, 521], [851, 522]];
  const kopru = [i0, [870, 493], [850, 489], [822, 493], [796, 502]];
  const sil = KG.sEgri(0, KG.TUR, 160);
  const kapali = kanca_dis.concat(sil, kopru.slice(1));
  const ic = KG.sEgri(KG.TUR, KG.TH_END, 260);
  const lam = [];
  for (let i = 0; i < 240; i++) { const t = (KG.TH_END - KG.TUR) * i / 239, a = W_(t), b = W_(t + KG.TUR); lam.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]); }
  const lam_kanca = [[794, 512], [816, 508], [840, 506], [858, 509], lam[0]];
  return {kapali, ic, lam, lam_kanca, d0};
}
const KULAK_C = {
  temporal_kemik: k => {
    const dis = [[503, 178], [504, 200], [505, 260], [509, 330], [515, 372], [521, 404], [521, 515], [526, 560], [534, 616], [548, 670], [566, 706], [594, 716], [626, 702],
      [662, 690], [720, 688], [790, 680], [860, 662], [940, 642], [1020, 616], [1090, 576], [1136, 524], [1156, 470], [1158, 400], [1146, 340], [1114, 290], [1060, 266],
      [980, 256], [900, 246], [850, 244], [800, 258], [740, 270], [660, 274], [580, 272], [548, 262], [538, 230], [535, 200], [534, 178], [518, 178]];
    let s = k.yol(gYol(dis, true, .3), AR.kemik, NV, 2.6);
    s += k.yol(gYol([[658, 690], [668, 740], [680, 796], [684, 798], [680, 740], [676, 690]], true, .3), AR.kemik, NV, 2.2);
    [[546, 556, 6, 5], [562, 578, 7, 6], [548, 604, 6, 5], [580, 604, 7, 5], [566, 630, 6, 5], [596, 636, 6, 5], [580, 660, 5, 4], [560, 680, 5, 4], [610, 610, 5, 4],
      [612, 664, 5, 4], [540, 640, 5, 5]].forEach(([x, y, a, b]) => s += k.yol(gElips(x, y, a, b), AR.beyaz, AR.ince, 1.4));
    return s; },
  dis_kulak_yolu: k => {
    const U1 = [[518, 405], [560, 400], [600, 393], [625, 385]], A1 = [[518, 515], [560, 520], [620, 528], [680, 532], [706, 530], KG.B];
    return k.yol(gYol(U1.concat(A1.slice().reverse()), true, .12), AR.beyaz, null) + k.yol(gYol(U1, false, .3), 'none', NV, 2.6) + k.yol(gYol(A1, false, .3), 'none', NV, 2.6); },
  timpanik_membran: k => { const d = gYol([[625, 385], [630, 394], KG.LP, [655, 414], [672, 432], [688, 452], KG.U, [708, 488], [716, 507], KG.B], false, .45);
    return `<path d="${d}" fill="none" stroke="${NV}" stroke-width="${k.W2(8.5)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${AR.zar}" stroke-width="${k.W2(3.6)}" stroke-linecap="round" stroke-linejoin="round"/>`; },
  orta_kulak: k => k.yol(gYol(ORTA_K, true, .35), AR.beyaz, null) + k.yol(gYol(ORTA_K, false, .35), 'none', NV, 2.6),
  fasiyal_sinir: k => k.yol(gElips(KG.FN[0], KG.FN[1], 10.5, 10.5), AR.kemik, NV, 2.0) + k.yol(gElips(KG.FN[0], KG.FN[1], 6.5, 6.5), AR.sinir, AR.sinir_c, 1.6),
  malleus: k => k.yol(gYol(MALLEUS_K, true, .4), AR.osk, NV, 2.6) + `<ellipse cx="656" cy="386" rx="4.2" ry="3.2" fill="${AR.osk}" stroke="${NV}" stroke-width="${k.W2(1.8)}"/>`,
  incus: k => k.yol(gYol(INCUS_KISA, true, .4), AR.osk, NV, 2.4) + k.yol(gYol(INCUS_K, true, .4), AR.osk, NV, 2.6) + k.yol(gElips(731, KG.ST_Y, 5, 5), AR.osk, NV, 2.2),
  stapes: k => {
    const hx = 736, hy = KG.ST_Y, F = KG.FP_X;
    let s = k.boru(gYol([[hx + 8, hy - 3], [hx + 18, hy - 12], [F - 14, 419], [F - 1, 418]]), 4.2, AR.osk, NV, 2.0);
    s += k.boru(gYol([[hx + 8, hy + 3], [hx + 18, hy + 14], [F - 14, 464], [F - 1, 463]]), 5.4, AR.osk, NV, 2.0);
    s += k.yol(gYol([[hx - 5, hy - 6], [hx + 3, hy - 7], [hx + 11, hy - 4], [hx + 13, hy], [hx + 11, hy + 4], [hx + 3, hy + 7], [hx - 5, hy + 6]], true), AR.osk, NV, 2.2);
    return s + k.yol(gYol([[F - 3, 414], [F + 4, 413], [F + 7, 440], [F + 4, 467], [F - 3, 466], [F - 1, 440]], true, .4), AR.osk, NV, 2.4); },
  oval_pencere: k => `<rect x="${KG.FP_X - 5}" y="408" width="15" height="64" rx="7" fill="none" stroke="${AR.zar}" stroke-width="${k.W2(3.0)}"/>`,
  yuvarlak_pencere: k => { const d = gYol([[791, 504], [784, 513], [789, 523]]);
    return `<path d="${d}" fill="none" stroke="${NV}" stroke-width="${k.W2(7)}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${AR.zar}" stroke-width="${k.W2(2.8)}" stroke-linecap="round"/>`; },
  tensor_kas: k => { const c = gCatmull([KG.PR_C, [794, 470], [806, 526], [828, 580], [856, 628], [882, 666]], 10), [Lf, Rt] = gBoru(c, [5, 13, 18, 19, 15, 6]);
    return k.yol(gYol(kapat(Lf, Rt), true, .3), AR.kas, NV, 2.2) + k.yol(gYol(c.slice(10, -8)), 'none', AR.kas_c, 1.2, 'stroke-opacity=".6"'); },
  tensor_tendon: k => k.yol(`M664 402 C 700 404 745 418 ${KG.PR_C[0]} ${KG.PR_C[1]}`, 'none', NV, 2.8) + k.yol(gYol([[778, 420], [772, 426], [776, 434], [786, 434]]), AR.kemik, NV, 2.0),
  stapedius: k => { let s = k.yol(gYol([[797, 468], [784, 468], [770, 466], [784, 477], [797, 480]], true, .35), AR.kemik, NV, 2.0);
    s += k.yol(gYol(gCatmull([[778, 470], [788, 473], [796, 474]], 8)), 'none', AR.kas, 5.0);
    return s + k.yol(`M771 466 L752 ${KG.ST_Y + 9}`, 'none', NV, 2.4); },
  ostaki_borusu: k => { const c = gCatmull([[752, 578], [788, 616], [826, 662], [862, 712], [890, 756], [906, 786]], 12), [Lf, Rt] = gBoru(c, [24, 16, 11, 15, 22, 28]);
    const i0 = Math.floor(c.length * .45), kk = Rt.slice(i0, -4).map(([x, y]) => [x + 9, y - 7]);
    return k.yol(gYol(kapat(Lf, Rt), true, .25), AR.beyaz, NV, 2.6) + k.yol(gYol(kk), 'none', AR.ince, 4.0, 'stroke-opacity=".5"'); },
  ic_kulak_yolu: k => k.yol(gYol([[990, 402], [1060, 400], [1120, 398], [1162, 396], [1162, 466], [1120, 468], [1060, 470], [990, 472]], true, .2), '#F8FBFE', NV, 2.2),
  isitme_siniri: k => {
    let s = ''; const c2 = gCatmull([[850, 420], [910, 414], [970, 418], [1030, 424], [1080, 430]], 10), [L2, R2] = gBoru(c2, [9, 12, 14, 15, 15]);
    s += k.yol(gYol(kapat(L2, R2), true, .3), AR.sinir, AR.sinir_c, 2.0);
    const c1 = gCatmull([KG.KC, [980, 452], [1040, 440], [1100, 434], [1160, 432], [1220, 432], [1266, 432]], 10), [Lf, Rt] = gBoru(c1, [12, 22, 28, 31, 32, 32, 32]);
    s += k.yol(gYol(kapat(Lf, Rt), true, .3), AR.sinir, AR.sinir_c, 2.2);
    s += k.yol('M1266 416 C 1273 421 1273 443 1266 448', 'none', AR.sinir_c, 2.0);
    [-8, 0, 8].forEach(dy => s += k.yol(gYol([[1060, 440 + dy * .6], [1160, 432 + dy * .9], [1262, 432 + dy]]), 'none', AR.sinir_c, 1.1, 'stroke-opacity=".55"'));
    return s; },
  kanallar: k => {
    const kn = KG.kanallar(), mean = a => kn[a].reduce((t, p) => t + p[2], 0) / kn[a].length;
    return ['superior', 'posterior', 'lateral'].sort((a, b) => mean(a) - mean(b)).map(a => {
      // posterior kanal en arkada: daha ince ve açık çizgi (derinlik)
      const b = kanalBoru(kn[a], 15, 30), arka = a === 'posterior', cz = arka ? '#3B5578' : NV, kl = arka ? 2.1 : 2.6;
      let g = k.yol(gYol(kapat(b.Lf, b.Rt), true, .3), AR.sivi, cz, kl);
      if (arka) { const cb = kanalBoru(kn.crus, 17, 17, false); g += k.yol(gYol(kapat(cb.Lf, cb.Rt), true, .3), AR.sivi, cz, kl); }
      return g; }).join(''); },
  vestibul: k => {
    // üst kenar çizilmez: orada ampulla ağızları ve ortak bacak keseye açılır, silueti kanallar verir
    const kn = KG.kanallar(), alt = VEST_K.slice(6).concat(VEST_K.slice(0, 3));
    let s = k.yol(gYol(VEST_K, true, .4), AR.sivi, null) + k.yol(gYol(alt, false, .4), 'none', NV, 2.8);
    // kanal ağızları vestibülle kaynaşır (vestibül çizgisi ağızlarda görünmez)
    [['superior', true, 22], ['superior', false, 22], ['lateral', true, 20], ['lateral', false, 12], ['posterior', false, 58], ['crus', false, 16]].forEach(([a, bas, n]) => {
      const b = a === 'crus' ? kanalBoru(kn.crus, 17, 17, false) : kanalBoru(kn[a], 15, 30);
      let xy = b.xy, ws = b.ws; if (!bas) { xy = xy.slice().reverse(); ws = ws.slice().reverse(); }
      const [L2, R2] = gBoru(xy.slice(0, n), ws.slice(0, n).map(w => Math.max(w - 4, 4)));
      s += `<path d="${gPoly(kapat(L2, R2))}" fill="${AR.sivi}"/>`; });
    return s; },
  koklea: k => { const K = kokleaSekli();
    return k.yol(gYol(K.kapali, true, .3), AR.sivi, NV, 2.8) + k.yol(gYol(K.ic, false, .4), 'none', NV, 2.4)
      + k.yol(gYol(K.lam_kanca.concat(K.lam.slice(1)), false, .4), 'none', '#5E8FC4', 1.6); },
};
// ana kulak kesiti: o.tum false ise yalnız çekirdek (orta ve iç kulak)
function anaKulak(c, o = {}) {
  const kd = kalem(c, 1), kc = kalem(c, KG.S), P = (id, fn) => c.P(id, v => boya(fn(), v));
  let s = '';
  if (o.tum !== false) {
    s += KULAK_P.kesit_zemini(kd);
    s += `<g transform="${KG.MATRIS}">${olcekli(c, 'c', () => P('temporal_kemik', () => KULAK_C.temporal_kemik(kc)))}</g>`;
    s += P(['kulak_kepcesi', 'dis_kulak'], () => KULAK_P.kulak_kepcesi(kd)) + P(['dis_kulak_yolu', 'dis_kulak'], () => KULAK_P.kikirdak_kanal(kd)) + KULAK_P.deri(kd);
  } else s += `<g transform="${KG.MATRIS}">${olcekli(c, 'c', () => P('temporal_kemik', () => KULAK_C.temporal_kemik(kc)))}</g>`;
  const oc = ['orta_kulak'], ic = ['ic_kulak'];
  let g = olcekli(c, 'c', () => P(['dis_kulak_yolu', 'dis_kulak'], () => KULAK_C.dis_kulak_yolu(kc)) + P('ic_kulak_yolu', () => KULAK_C.ic_kulak_yolu(kc))
    + P('ostaki_borusu', () => KULAK_C.ostaki_borusu(kc)) + P(['tensor_timpani', 'tensor_timpani_kas', ...oc], () => KULAK_C.tensor_kas(kc))
    + P(oc, () => KULAK_C.orta_kulak(kc)) + P(['isitme_siniri', 'koklear_sinir', 'vestibuler_sinir'], () => KULAK_C.isitme_siniri(kc))
    + P(['yarim_daire_kanallari', ...ic], () => KULAK_C.kanallar(kc)) + P(['vestibul', ...ic], () => KULAK_C.vestibul(kc)) + P(['koklea', ...ic], () => KULAK_C.koklea(kc))
    + P('fasiyal_sinir', () => KULAK_C.fasiyal_sinir(kc)) + P(['stapedius', ...oc], () => KULAK_C.stapedius(kc))
    + P(['incus', 'kemikcikler', ...oc], () => KULAK_C.incus(kc)) + P(['malleus', 'kemikcikler', ...oc], () => KULAK_C.malleus(kc))
    + P(['tensor_timpani', ...oc], () => KULAK_C.tensor_tendon(kc)) + P(['stapes', 'kemikcikler', ...oc], () => KULAK_C.stapes(kc))
    + P('oval_pencere', () => KULAK_C.oval_pencere(kc)) + P('yuvarlak_pencere', () => KULAK_C.yuvarlak_pencere(kc))
    + P(['timpanik_membran', 'dis_kulak'], () => KULAK_C.timpanik_membran(kc)));
  return s + `<g transform="${KG.MATRIS}">${g}</g>`;
}
// dönüşümlü grup içinde parıltı filtresi o ölçeğe göre (c.gid + ek)
function olcekli(c, ek, fn) { const g0 = c.gid; c.gid = g0 + ek; const s = fn(); c.gid = g0; return s; }
const C2O = KG.c2o;
const KULAK_A = {kulak_kepcesi: [150, 250], dis_kulak: [262, 452], dis_kulak_yolu: [300, 450], timpanik_membran: [580.2, 411.6], malleus: [548.2, 251.6],
  incus: [625, 254.8], stapes: [721, 427.6], orta_kulak: [625, 610], kemikcikler: [600, 280], ostaki_borusu: [865, 818], yarim_daire_kanallari: [845.8, 194],
  vestibul: [852.2, 402], koklea: [1009, 514], ic_kulak: C2O([900, 440]), isitme_siniri: [1345, 406.8], koklear_sinir: C2O([1010, 448]), vestibuler_sinir: C2O([960, 416]),
  temporal_kemik: [1201, 242], oval_pencere: [769.4, 386], yuvarlak_pencere: [761, 536.4], tensor_timpani: [567.4, 358.8], tensor_timpani_kas: [807.4, 578],
  stapedius: [746.6, 469.2], fasiyal_sinir: [764.2, 358.8], ic_kulak_yolu: C2O([1120, 404])};
const KULAK_TAKMA = {tensor_timpani__kas: 'tensor_timpani_kas', auricula: 'kulak_kepcesi', kulak_zari: 'timpanik_membran', fenestra_vestibuli: 'oval_pencere',
  fenestra_cochleae: 'yuvarlak_pencere', vestibulokoklear_sinir: 'isitme_siniri', sekizinci_sinir: 'isitme_siniri', kanallar: 'yarim_daire_kanallari'};
function takmaAd(a, t) { const o = Object.assign({}, a); for (const [k, h] of Object.entries(t)) if (!o[k] && o[h]) o[k] = o[h]; return o; }

const KULAK_KAM = {orta_kulak: C2O([712, 440]), kemikcikler: C2O([700, 395]), koklea: C2O([925, 466]), ic_kulak: C2O([880, 420]), vestibul: C2O([834, 420]),
  yarim_daire_kanallari: C2O([830, 340]), dis_kulak: [200, 450], dis_kulak_yolu: [330, 450], timpanik_membran: C2O([680, 455]), malleus: C2O([665, 390]),
  incus: C2O([705, 380]), stapes: C2O([765, 440]), oval_pencere: C2O([790, 440]), yuvarlak_pencere: C2O([790, 512]), ostaki_borusu: C2O([820, 660]),
  isitme_siniri: C2O([1080, 440]), tensor_timpani: C2O([760, 460]), stapedius: C2O([775, 470])};
CIZ.kulak_kesit = c => ({w: 1490, h: 820, vx: 30, vy: 80, cm: .95, kirp: true, a: takmaAd(KULAK_A, KULAK_TAKMA), takma: KULAK_TAKMA, kam: KULAK_KAM,
  yer: {kulak_kepcesi: 'sol', dis_kulak: 'sol', dis_kulak_yolu: 'sol', timpanik_membran: 'sol', malleus: 'sol', incus: 'sol', orta_kulak: 'sol', kemikcikler: 'sol',
    tensor_timpani: 'sol', ostaki_borusu: 'sag', yarim_daire_kanallari: 'sag', temporal_kemik: 'sag', stapes: 'sag', oval_pencere: 'sag',
    yuvarlak_pencere: 'sag', stapedius: 'sag', fasiyal_sinir: 'sag'},
  svg: () => anaKulak(c)});

CIZ.orta_kulak = c => ({w: 650, h: 520, vx: 466, vy: 150, cm: 1.3, kirp: true, kam: KULAK_KAM,
  a: takmaAd(Object.assign({}, KULAK_A, {timpanik_membran: [573.8, 411.6], malleus: [538.6, 277.2], incus: [637.8, 242], stapes: [724.2, 430.8], oval_pencere: [780.2, 376.4],
    ostaki_borusu: [733.8, 661.2], vestibul: [833, 386], koklea: [1041, 466], dis_kulak_yolu: C2O([612, 462]), orta_kulak: C2O([700, 540]), kemikcikler: C2O([690, 360]),
    isitme_siniri: C2O([1010, 437]), yarim_daire_kanallari: C2O([830, 300]), ic_kulak: C2O([880, 445])}), KULAK_TAKMA), takma: KULAK_TAKMA,
  yer: {timpanik_membran: 'sol', malleus: 'sol', tensor_timpani: 'sol', ostaki_borusu: 'sol', dis_kulak_yolu: 'sol', orta_kulak: 'sol', kemikcikler: 'sol', incus: 'sol',
    tensor_timpani_kas: 'sag', yarim_daire_kanallari: 'sag', stapes: 'sag', oval_pencere: 'sag', yuvarlak_pencere: 'sag', stapedius: 'sag', fasiyal_sinir: 'sag',
    vestibul: 'sag', koklea: 'sag', isitme_siniri: 'sag', ic_kulak: 'sag'},
  svg: () => anaKulak(c)});

// kemikçikler ayrık: ana çizimdeki şekillerin aynısı, araları açılarak (eklemler kesik çizgi)
const KEM_AYIR = {malleus: -58, incus: 0, stapes: 64};
const KEM_ALT = {malleus_bas: 'malleus', malleus_boyun: 'malleus', malleus_on_cikinti: 'malleus', malleus_yan_cikinti: 'malleus', malleus_sap: 'malleus',
  incus_govde: 'incus', incus_kisa_kol: 'incus', incus_uzun_kol: 'incus', incus_lentikuler: 'incus', stapes_bas: 'stapes', stapes_boyun: 'stapes',
  stapes_on_kol: 'stapes', stapes_arka_kol: 'stapes', stapes_taban: 'stapes'};
CIZ.kemikcikler = (c, ay) => ({w: 352, h: ay.adlar ? 228 : 190, vx: 560, vy: 290, cm: 1.3, kmax: 3,
  a: {malleus: [595, 352], incus: [702, 345], stapes: [826, 441], incudomalleolar_eklem: [616, 344], incudostapedial_eklem: [767, 440],
    malleus_bas: [582, 330], malleus_boyun: [598, 377], malleus_on_cikinti: [598, 386], malleus_yan_cikinti: [581, 404], malleus_sap: [626, 446],
    incus_govde: [702, 336], incus_kisa_kol: [744, 316], incus_uzun_kol: [715, 400], incus_lentikuler: [732, 440],
    stapes_bas: [801, 440], stapes_boyun: [814, 434], stapes_on_kol: [834, 424], stapes_arka_kol: [834, 458], stapes_taban: [855, 468]},
  vurguEsle: KEM_ALT,
  yer: {malleus: 'sol', malleus_bas: 'sol', malleus_boyun: 'sol', malleus_on_cikinti: 'sol', malleus_yan_cikinti: 'sol', malleus_sap: 'sol', incus: 'ust',
    incus_govde: 'ust', incus_kisa_kol: 'ust', incus_uzun_kol: 'alt', incus_lentikuler: 'alt', incudomalleolar_eklem: 'ust', incudostapedial_eklem: 'alt',
    stapes: 'sag', stapes_bas: 'sag', stapes_boyun: 'sag', stapes_on_kol: 'sag', stapes_arka_kol: 'sag', stapes_taban: 'alt'},
  svg: () => {
    const k = kalem(c, 1), P = (id, fn) => c.P(id, v => boya(fn(), v));
    const tr = a => `<g transform="translate(${KEM_AYIR[a]} 0)">${P(a, () => KULAK_C[a](k))}</g>`;
    const kes = `stroke="${AR.ince}" stroke-width="${k.W2(2.2)}" stroke-dasharray="${k.W2(7)} ${k.W2(7)}" fill="none" stroke-linecap="round"`;
    let s = tr('incus') + tr('malleus') + tr('stapes');
    s += c.P('incudomalleolar_eklem', v => `<path d="M${676 + KEM_AYIR.malleus + 2} 344 L${672 - 2} 344" ${kes.replace(AR.ince, karis(AR.ince, R.mavi, v))}/>`);
    s += c.P('incudostapedial_eklem', v => `<path d="M737 440 L${730 + KEM_AYIR.stapes} 440" ${kes.replace(AR.ince, karis(AR.ince, R.mavi, v))}/>`);
    // adlar: kemik adları altta, alt sıra etiket çizgilerinin (x 732 ve 855) arasında; küçük kartta yazı küçülür
    if (ay.adlar) [['malleus', 594, L('malleus (çekiç)', 'malleus')], ['incus', 688, L('incus (örs)', 'incus')], ['stapes', 800, L('stapes (üzengi)', 'stapes')]]
      .forEach(([, x, m]) => s += c.yazi(x, 507, m, {px: Math.min(21, 11 * c.k), fw: 700, renk: R.mavi}));
    return s; }});

// ---------------------------------------------------------------- Corti organı (CORTI çerçevesi 1000 x 560) ve koklea kesiti
const CO = {ENDO: '#E4F1FD', PERI: '#F1F8FE', DESTEK: '#F4F7FB', TUY: '#FFFFFF', TM: '#FFF0D2', BM: '#8EC2F2',
  LAMINA: [[0, 398], [150, 404], [300, 424], [318, 438], [300, 452], [150, 470], [0, 478]],
  LAMINA_SINIR: [[0, 420], [150, 424], [296, 436], [314, 439], [296, 442], [150, 452], [0, 456]],
  LIMBUS: [[30, 404], [34, 340], [66, 298], [120, 276], [190, 268], [236, 274], [244, 286], [228, 296], [232, 318], [256, 356], [290, 398], [312, 426], [150, 404]],
  TEKTORYAL: [[100, 266], [200, 242], [330, 224], [460, 214], [570, 212], [650, 218], [690, 232], [698, 246], [672, 252], [600, 246], [520, 244], [450, 248], [380, 252],
    [300, 258], [220, 266], [150, 278], [118, 282]],
  BM_X1: 808, IHC: [[394, 262], [424, 262], [426, 276], [430, 296], [426, 316], [416, 330], [402, 330], [390, 316], [386, 296], [390, 276]],
  IC_FALANJ: [[330, 433], [344, 382], [374, 338], [394, 332], [428, 334], [448, 360], [458, 433]],
  IC_SUTUN: [[438, 433], [458, 433], [494, 268], [500, 262], [486, 262]], DIS_SUTUN: [[548, 433], [570, 433], [510, 268], [500, 262], [504, 272]],
  TUNEL: [[458, 431], [548, 431], [498, 274]], OHC_X: [534, 572, 610],
  HENSEN: [[652, 433], [650, 350], [664, 286], [690, 250], [722, 242], [752, 258], [772, 300], [782, 360], [784, 433]],
  CLAUDIUS: [[784, 433], [786, 410], [808, 404], [808, 433]]};
const ohc = cx => { const t = 262, b = 340, w = 11, e = 16;
  return [[cx - w, t], [cx + w, t], [cx + w + e * .5, (t + b) / 2], [cx + w + e - 1, b - 6], [cx + e + 4, b + 3], [cx + e - 6, b + 3], [cx - w + e, b - 6], [cx - w + e * .5, (t + b) / 2]]; };
const deiters = cx => { const x = cx + 26; return [[x - 11, 433], [x + 11, 433], [x + 10, 372], [cx + 30, 350], [cx + 26, 344], [cx + 6, 344], [cx + 4, 352], [x - 12, 374]]; };
// Corti parçaları: {id: svg}; ayrinti < 1 ise ince ayrıntılar azalır
function cortiParca(k, ayrinti = 1) {
  const g = {};
  g.lamina_spiralis_ossea = k.yol(gYol(CO.LAMINA, true, .2), AR.kemik, NV, 2.4) + k.yol(gYol(CO.LAMINA_SINIR, true, .2), AR.sinir, AR.sinir_c, 1.4);
  g.limbus = k.yol(gYol(CO.LIMBUS, true, .35), '#EDF1F8', NV, 2.4);
  g.baziler_membran = k.yol(gPoly([[312, 433], [CO.BM_X1, 433], [CO.BM_X1, 447], [312, 447]]), CO.BM, NV, 2.4);
  let d = k.yol(gYol(CO.IC_FALANJ, true, .3), CO.DESTEK, NV, 2.0) + k.yol(gYol(CO.HENSEN, true, .35), CO.DESTEK, NV, 2.0);
  if (ayrinti >= 1) [[[680, 432], [674, 360], [686, 262]], [[712, 432], [712, 340], [724, 246]], [[744, 432], [748, 340], [756, 262]]].forEach(p => d += k.yol(gYol(p), 'none', AR.ince, 1.2));
  d += k.yol(gYol(CO.CLAUDIUS, true, .25), CO.DESTEK, NV, 2.0);
  g.hensen_hucreleri = d;
  let de = CO.OHC_X.map(cx => k.yol(gYol(deiters(cx), true, .25), CO.DESTEK, NV, 2.0)).join('');
  CO.OHC_X.forEach(cx => de += k.yol(`M${cx + 28} 346 L${cx + 21} 264`, 'none', NV, 1.6));
  g.deiters_hucreleri = de;
  g.sutun_hucreleri = k.yol(gPoly(CO.IC_SUTUN), '#E3ECF8', NV, 2.0) + k.yol(gPoly(CO.DIS_SUTUN), '#E3ECF8', NV, 2.0);
  g.corti_tuneli = `<path d="${gPoly(CO.TUNEL)}" fill="#F7FBFF"/>`;
  const lif = [[[312, 440], [350, 420], [388, 372], [406, 334]]];
  CO.OHC_X.forEach((cx, i) => lif.push([[312, 441], [380, 426], [470, 404 + i * 3], [530, 390 + i * 3], [cx + 12, 356], [cx + 18, 346]]));
  g.sinir_lifleri = lif.map(p => `<path d="${gYol(p)}" fill="none" stroke="${AR.sinir_c}" stroke-width="${k.W2(5.2)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${gYol(p)}" fill="none" stroke="${AR.sinir}" stroke-width="${k.W2(2.6)}" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  g.ic_tuy_hucresi = k.yol(gYol(CO.IHC, true, .35), CO.TUY, NV, 2.6) + `<circle cx="408" cy="306" r="7" fill="${AR.cekirdek}"/>`;
  g.stereosil_ic = [[400, 252], [409, 249], [418, 246]].map(([x, h]) => k.yol(`M${x} 262 L${x + 1} ${h}`, 'none', NV, 2.0)).join('');
  g.dis_tuy_hucreleri = CO.OHC_X.map(cx => k.yol(gYol(ohc(cx), true, .3), CO.TUY, NV, 2.4) + `<circle cx="${cx + 12}" cy="324" r="6" fill="${AR.cekirdek}"/>`).join('');
  g.stereosil_dis = CO.OHC_X.map(cx => [[-6, 252], [0, 248], [6, 244]].map(([dx, h]) => k.yol(`M${cx + dx} 262 L${cx + dx + 1} ${h}`, 'none', NV, 1.8)).join('')).join('');
  g.retikuler_lamina = k.yol(gYol([[392, 262], [450, 263], [500, 262], [580, 263], [650, 266]]), 'none', NV, 2.4);
  g.tektoryal_membran = k.yol(gYol(CO.TEKTORYAL, true, .35), CO.TM, NV, 2.4, 'fill-opacity=".95"');
  return g;
}
// destek hücreleri, Corti organı ve tüy hücreleri (vurgu grupları); iki çizimde aynı sıra
function cortiGovde(c, g, P) {
  return P('corti_tuneli', () => g.corti_tuneli)
    + c.P('destek_hucreleri', () => P('hensen_hucreleri', () => g.hensen_hucreleri) + P('deiters_hucreleri', () => g.deiters_hucreleri) + P(['sutun_hucreleri', 'corti_tuneli'], () => g.sutun_hucreleri))
    + P('sinir_lifleri', () => g.sinir_lifleri)
    + c.P(['ic_tuy_hucresi', 'tuy_hucreleri'], () => P('ic_tuy_hucresi', () => g.ic_tuy_hucresi) + P(['stereosil', 'ic_tuy_hucresi'], () => g.stereosil_ic))
    + c.P(['dis_tuy_hucreleri', 'tuy_hucreleri'], () => P('dis_tuy_hucreleri', () => g.dis_tuy_hucreleri) + P(['stereosil', 'dis_tuy_hucreleri'], () => g.stereosil_dis))
    + P('retikuler_lamina', () => g.retikuler_lamina);
}
const CORTI_TAKMA = {stereosilya: 'stereosil', tektorial_membran: 'tektoryal_membran', pillar_hucreleri: 'sutun_hucreleri', destek: 'destek_hucreleri',
  claudius_hucreleri: 'hensen_hucreleri', ic_tuy_hucreleri: 'ic_tuy_hucresi', dis_tuy_hucresi: 'dis_tuy_hucreleri', spiral_lamina: 'lamina_spiralis_ossea'};
CIZ.corti = c => ({w: 800, h: 284, vx: 24, vy: 200, cm: 1.45, kirp: true,
  a: takmaAd({ic_tuy_hucresi: [408, 300], dis_tuy_hucreleri: [580, 300], tektoryal_membran: [420, 236], stereosil: [409, 252], baziler_membran: [700, 440],
    corti_tuneli: [500, 380], sutun_hucreleri: [462, 380], deiters_hucreleri: [600, 410], hensen_hucreleri: [720, 330], destek_hucreleri: [716, 380],
    sinir_lifleri: [360, 410], limbus: [150, 330], lamina_spiralis_ossea: [150, 455], retikuler_lamina: [620, 264], scala_media: [790, 225],
    scala_tympani: [560, 470], ligamentum_spirale: [815, 330], tuy_hucreleri: [500, 300]}, CORTI_TAKMA), takma: CORTI_TAKMA,
  yer: {ic_tuy_hucresi: 'sol', stereosil: 'sol', sinir_lifleri: 'sol', limbus: 'sol', lamina_spiralis_ossea: 'sol', tektoryal_membran: 'ust', dis_tuy_hucreleri: 'ust',
    tuy_hucreleri: 'ust', baziler_membran: 'sag', corti_tuneli: 'sag', sutun_hucreleri: 'sag', deiters_hucreleri: 'sag', hensen_hucreleri: 'sag', destek_hucreleri: 'sag',
    retikuler_lamina: 'sag', scala_media: 'sag', scala_tympani: 'sag', ligamentum_spirale: 'sag'},
  svg: () => {
    const k = kalem(c, 1), g = cortiParca(k), P = (id, fn) => c.P(id, v => boya(fn(), v));
    let s = P('scala_media', () => `<path d="M0 0 L1000 0 L1000 433 L0 433 Z" fill="${CO.ENDO}"/>`) + P('scala_tympani', () => `<path d="M0 440 L1000 440 L1000 600 L0 600 Z" fill="${CO.PERI}"/>`);
    s += P('lamina_spiralis_ossea', () => g.lamina_spiralis_ossea) + P('limbus', () => g.limbus) + P('baziler_membran', () => g.baziler_membran);
    s += cortiGovde(c, g, P) + P('tektoryal_membran', () => g.tektoryal_membran);
    s += P('ligamentum_spirale', () => k.yol(gYol([[808, 300], [820, 380], [814, 433], [812, 447], [822, 520]]) + ' L900 520 L900 300Z', '#EEF1F8', AR.ince, 1.6));
    return s; }});

const KK = {S: .75, O: [440, 392]};
const kcd = p => [KK.O[0] + (p[0] - 312) * KK.S, KK.O[1] + (p[1] - 439) * KK.S];
const KC_DON = `matrix(${KK.S} 0 0 ${KK.S} ${KK.O[0] - 312 * KK.S} ${KK.O[1] - 439 * KK.S})`;
const KS = {LUMEN: [[196, 360], [206, 252], [262, 158], [372, 100], [540, 84], [700, 104], [820, 170], [900, 290], [914, 410], [886, 524], [812, 606], [676, 648],
  [500, 652], [336, 614], [230, 524]],
  LIG: [[760, 132], [830, 178], [892, 286], [906, 410], [880, 520], [816, 600], [774, 560], [812, 470], [822, 400], [812, 318], [790, 230], [760, 160]],
  BM_DIS: [812, 389], STRIA: [[752, 112], [778, 168], [798, 238], [810, 298], [813, 334], [795, 336], [790, 300], [780, 246], [762, 182], [738, 122]]};
KS.REISSNER = [kcd([120, 278]), [420, 214], [600, 150], [750, 114]];
const KESIT_TAKMA = Object.assign({skala_vestibuli: 'scala_vestibuli', skala_media: 'scala_media', skala_timpani: 'scala_tympani', scala_timpani: 'scala_tympani',
  koklear_kanal: 'scala_media', stria_vascularis: 'stria_vaskularis', reissner_membrani: 'reissner_membrani', modiolus: 'spiral_ganglion'}, CORTI_TAKMA);
CIZ.koklea_kesit = c => ({w: 920, h: 620, vx: 20, vy: 60, cm: 1.2, kirp: true, kam: {corti_organi: kcd([540, 330]), tektoryal_membran: kcd([480, 300]),
    ic_tuy_hucresi: kcd([450, 320]), dis_tuy_hucreleri: kcd([560, 320]), baziler_membran: kcd([560, 400])},
  a: takmaAd({scala_vestibuli: [470, 160], scala_media: [650, 230], scala_tympani: [520, 560], reissner_membrani: [600, 150], baziler_membran: [700, 390],
    corti_organi: [626, 310.2], tektoryal_membran: [626, 233.8], stria_vaskularis: [790, 250], ligamentum_spirale: [860, 470], lamina_spiralis_ossea: [318.5, 396.5],
    limbus: [318.5, 302.8], spiral_ganglion: [130, 380], koklear_sinir: [32, 600], ic_tuy_hucresi: kcd([408, 300]), dis_tuy_hucreleri: kcd([580, 300]),
    sinir_lifleri: kcd([360, 412]), endolenf: [650, 250], perilenf: [520, 600]}, KESIT_TAKMA), takma: KESIT_TAKMA,
  vurguEsle: {endolenf: 'scala_media', perilenf: 'scala_tympani'},
  yer: {scala_vestibuli: 'ust', lamina_spiralis_ossea: 'sol', limbus: 'sol', spiral_ganglion: 'sol', koklear_sinir: 'sol', sinir_lifleri: 'sol', ic_tuy_hucresi: 'sol'},
  svg: () => {
    const k = kalem(c, 1), kci = kalem(c, KK.S), g = cortiParca(kci, .6), P = (id, fn) => c.P(id, v => boya(fn(), v));
    let s = `<path d="M0 0 H1000 V720 H0Z" fill="${AR.kemik}"/>`;
    s += k.yol(gYol(KS.LUMEN, true, .35), AR.sivi, NV, 2.8);
    s += P('ligamentum_spirale', () => k.yol(gYol(KS.LIG, true, .35), '#EEF1F8', AR.ince, 1.8));
    const sm = [kcd([120, 278])].concat(KS.REISSNER.slice(1), [[752, 112], [778, 168], [798, 238], [810, 298], [813, 334], [814, 380], KS.BM_DIS],
      [[808, 431], [312, 433], [290, 398], [256, 356], [232, 318], [236, 274], [190, 268]].map(kcd));
    s += P(['scala_media', 'endolenf'], () => `<path d="${gYol(sm, true, .15)}" fill="${AR.endo}"/>`);
    const sv = KS.LUMEN.slice(1, 6).concat([[750, 112]], KS.REISSNER.slice(1).reverse(), [kcd([120, 278]), kcd([30, 404]), [196, 360]]);
    const st = [[196, 380], kcd([0, 478]), kcd([150, 470]), kcd([300, 452]), kcd([312, 446]), kcd([808, 446]), [812, 404], [812, 470], [774, 560], [812, 606], [676, 648],
      [500, 652], [336, 614], [230, 524]];
    const bos = (id, pts) => c.P(id, v => `<path d="${gYol(pts, true, .2)}" fill="${karis(AR.sivi, '#B3D8FA', .85 * v)}" fill-opacity="${(.95 * v).toFixed(3)}"/>`);
    s += bos(['scala_vestibuli', 'perilenf'], sv) + bos(['scala_tympani', 'perilenf'], st);
    s += P('stria_vaskularis', () => k.yol(gYol(KS.STRIA, true, .35), '#F6D6D9', '#C98A93', 1.6)
      + [[768, 160], [784, 206], [796, 252], [803, 300], [788, 270], [774, 226], [758, 150]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#D98C93"/>`).join(''));
    s += P(['spiral_ganglion', 'koklear_sinir'], () => k.yol(gYol([[70, 390], [100, 352], [150, 344], [182, 366], [186, 408], [160, 438], [110, 444], [76, 424]], true, .4), '#F7FAFD', NV, 2.0)
      + [[104, 372], [130, 366], [156, 380], [118, 400], [146, 406], [100, 420], [164, 418], [128, 428]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="${AR.sinir}" stroke="${AR.sinir_c}" stroke-width="${k.W2(1.3)}"/>`).join(''));
    s += P('koklear_sinir', () => { const md = gYol([[70, 410], [40, 470], [20, 560], [14, 720]]);
      return k.yol(md, 'none', AR.sinir_c, 16, 'stroke-opacity=".9"') + k.yol(md, 'none', AR.sinir, 11)
        + [-8, 0, 8].map(dy => k.yol(gYol([kcd([0, 438 + dy * .6]), [200, 400 + dy], [178, 396 + dy]]), 'none', AR.sinir_c, 3.2)).join(''); });
    s += `<g transform="${KC_DON}">${olcekli(c, 'k', () => P('lamina_spiralis_ossea', () => g.lamina_spiralis_ossea) + P('limbus', () => g.limbus))}</g>`;
    s += P('baziler_membran', () => k.yol(gPoly([kcd([312, 433]), KS.BM_DIS, [812, 404], kcd([312, 446])]), AR.zar, NV, 2.2));
    s += olcekli(c, 'k', () => c.P('corti_organi', () => `<g transform="${KC_DON}">${cortiGovde(c, g, P)}</g>`));
    s += `<g transform="${KC_DON}">${olcekli(c, 'k', () => P(['tektoryal_membran', 'corti_organi'], () => g.tektoryal_membran))}</g>`;
    s += P(['reissner_membrani'], () => k.yol(gYol(KS.REISSNER), 'none', NV, 2.6));
    return s; }});

// ---------------------------------------------------------------- açılmış koklea, baziler membran ve yürüyen dalga
CIZ.koklea_acik = (c, ay) => {
  const f = ay.frekans || 1000, xb = 152, xa = 822;
  const pb = kis(1 - Math.log10(f / 165.4 + .88) / 2.1);          // Greenwood: tabandan uzaklık oranı
  const xp = xb + 30 + pb * (xa - xb - 70), A = 34 * kis((c.t - .3) / 1.2), om = 2 * Math.PI * 1.1 * c.t;
  const env = x => x <= xp ? A * Math.pow((x - xb) / (xp - xb), 2.2) : A * Math.exp(-Math.pow((x - xp) / 26, 2));
  const faz = x => { const u = (Math.min(x, xp) - xb) / (xp - xb); return 2 * Math.PI * 3.2 * Math.pow(u, 1.6) + (x > xp ? 2 * Math.PI * (x - xp) / 34 : 0); };
  const ym = 220, ust = x => 70 + 60 * (x - 150) / 650, alt = x => 370 - 60 * (x - 150) / 650;
  return {w: 900, h: 480,
    a: {taban: [196, 330], tepe: [852, 214], baziler_membran: [300, 222], yuruyen_dalga: [xp, ym - A - 4], oval_pencere: [140, 112], yuvarlak_pencere: [142, 328]},
    yer: {taban: 'sol', oval_pencere: 'sol', yuvarlak_pencere: 'sol', baziler_membran: 'sol', tepe: 'sag', yuruyen_dalga: 'sag'},
    svg: () => {
      const cz = KR.cz, sd = 3 * Math.sin(om);
      let s = c.P('taban', v => `<path d="M150 70 L 800 130 C 856 136 870 175 870 220 C 870 265 856 304 800 310 L 150 370 Z" fill="${KR.sivi}"/>
        <rect x="132" y="56" width="20" height="328" rx="8" fill="${c.f(KR.kemik, v)}" stroke="${c.s(v)}" stroke-width="2.5"/>`);
      s += c.P('tepe', v => `<path d="M150 70 L 800 130 C 856 136 870 175 870 220 C 870 265 856 304 800 310 L 150 370" fill="none" stroke="${cz}" stroke-width="3"/>
        <path d="M800 130 C 856 136 870 175 870 220 C 870 265 856 304 800 310" fill="none" stroke="${c.s(v)}" stroke-width="${3 + 3 * v}"/>`);
      s += c.yazi(470, 132, 'scala vestibuli', {px: 17, fw: 500, renk: KR.ince}) + c.yazi(470, 326, 'scala tympani', {px: 17, fw: 500, renk: KR.ince});
      // oval pencere + stapes, yuvarlak pencere
      s += c.P('oval_pencere', v => `<rect x="134" y="104" width="16" height="72" rx="6" fill="${c.f(KR.sivi, v)}" stroke="${c.s(v, R.mavi)}" stroke-width="3"/>`);
      s += `<g transform="translate(${n1(sd)} 0)">${boru('M88 132 C 104 118 120 112 138 112', 4, KR.osk, cz, 2)}${boru('M88 148 C 104 162 120 168 138 168', 4, KR.osk, cz, 2)}<circle cx="82" cy="140" r="9" fill="${KR.osk}" stroke="${cz}" stroke-width="2.5"/><rect x="136" y="106" width="10" height="68" rx="3" fill="${KR.osk}" stroke="${cz}" stroke-width="2.5"/></g>
        ${okBasi(72 + sd * 2, 140, 0, 12, R.mavi, 3)}<path d="M52 140 L ${n1(70 + sd * 2)} 140" stroke="${R.mavi}" stroke-width="3" stroke-linecap="round"/>`;
      s += c.P('yuvarlak_pencere', v => `<path d="M144 268 Q ${n1(126 - sd * 2)} 300 144 332" fill="none" stroke="${c.s(v)}" stroke-width="6" stroke-linecap="round"/><path d="M144 268 Q ${n1(126 - sd * 2)} 300 144 332" fill="none" stroke="${c.f(KR.zar, v)}" stroke-width="2.5" stroke-linecap="round"/>`);
      // yürüyen dalga zarfı + tepe noktası
      let zu = [], za = [], bm = [];
      for (let x = xb; x <= 812; x += 3) { const e = env(x); zu.push([x, ym - e]); za.push([x, ym + e]); bm.push([x, ym + e * Math.sin(om - faz(x))]); }
      s += c.P('yuruyen_dalga', v => `<path d="${yolDiz(zu)}" fill="none" stroke="${c.s(v, R.soluk)}" stroke-width="2" stroke-dasharray="6 6"/><path d="${yolDiz(za)}" fill="none" stroke="${c.s(v, R.soluk)}" stroke-width="2" stroke-dasharray="6 6"/>
        <line x1="${n1(xp)}" y1="${n1(ust(xp) - 4)}" x2="${n1(xp)}" y2="412" stroke="${R.mavi}" stroke-width="2" stroke-dasharray="3 5" opacity="${kis(A / 20)}"/>`);
      s += c.yazi(xp, ust(xp) - 14, `${f} Hz`, {px: 20, fw: 700, renk: R.mavi, ek: `opacity="${kis(A / 20).toFixed(2)}"`});
      s += c.P('baziler_membran', v => `<path d="${yolDiz(bm)}" fill="none" stroke="${c.s(v, '#1A6FC0')}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M152 417 L 822 402 L 822 438 L 152 424 Z" fill="${c.f('#CFE5FA', v)}" stroke="${c.s(v)}" stroke-width="2" stroke-linejoin="round"/>`);
      s += c.yazi(152, 462, L('dar, sert: tiz sesler', 'narrow, stiff: high pitch'), {px: 17, fw: 500, a: 'start'}) + c.yazi(822, 462, L('geniş, esnek: pes sesler', 'wide, flexible: low pitch'), {px: 17, fw: 500, a: 'end'});
      return s;
    }};
};

// ---------------------------------------------------------------- işitme yolu (kokleadan kortekse)
CIZ.isitme_yolu = c => ({w: 820, h: 640,
  a: {koklea: [150, 566], isitme_siniri: [246, 552], koklear_nukleus: [346, 528], superior_oliver: [438, 468], lateral_lemniskus: [446, 400],
    inferior_kollikulus: [382, 334], mgb: [468, 262], isitme_korteksi: [164, 262]},
  yer: {koklea: 'sol', isitme_siniri: 'sol', koklear_nukleus: 'sol', inferior_kollikulus: 'sol', isitme_korteksi: 'sol', superior_oliver: 'sag', lateral_lemniskus: 'sag', mgb: 'sag'},
  svg: () => {
    const cz = KR.cz, ayna = x => 820 - x;
    let s = `<path d="M410 34 C 300 26 152 50 96 150 C 62 214 70 300 124 336 C 170 364 240 352 300 318 C 330 300 352 296 372 298 L 448 298 C 468 296 490 300 520 318 C 580 352 650 364 696 336 C 750 300 758 214 724 150 C 668 50 520 26 410 34 Z" fill="${KR.doku}" stroke="${cz}" stroke-width="3"/>
      <path d="M410 36 L 410 190" stroke="${cz}" stroke-width="2.5" opacity=".5"/>
      <path d="M118 236 C 160 222 220 222 268 236 M702 236 C 660 222 600 222 552 236" fill="none" stroke="${KR.ince}" stroke-width="3" stroke-linecap="round"/>
      <path d="M362 290 C 356 360 352 480 364 630 L 456 630 C 468 480 464 360 458 290 Z" fill="${KR.doku}" stroke="${cz}" stroke-width="3"/>
      <ellipse cx="370" cy="240" rx="34" ry="26" fill="#E6EEF8" stroke="${KR.ince}" stroke-width="2"/><ellipse cx="450" cy="240" rx="34" ry="26" fill="#E6EEF8" stroke="${KR.ince}" stroke-width="2"/>`;
    s += `<g fill="none" stroke="${KR.ince}" stroke-width="2.2" stroke-linecap="round" opacity=".55"><path d="M170 120 C 210 100 250 110 280 96 M140 180 C 190 170 230 180 270 168 M330 80 C 350 110 340 140 360 170 M650 120 C 610 100 570 110 540 96 M680 180 C 630 170 590 180 550 168 M490 80 C 470 110 480 140 460 170"/></g>`;
    // yol çizgileri (sol kokleadan): kalın = karşı taraf, ince = aynı taraf
    const yol = (d, k) => `<path d="${d}" fill="none" stroke="${R.mavi}" stroke-width="${k}" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>`;
    s += yol('M346 528 C 360 500 372 485 384 468', 3) + yol('M346 528 C 380 510 410 490 436 468', 5) + yol('M436 468 L 442 420 L 440 380 L 438 334 L 468 262 C 520 250 600 240 650 262', 5)
      + yol('M384 468 L 378 420 L 380 380 L 382 334 L 352 262 C 300 250 220 240 170 262', 3);
    s += okBasi(650, 262, .4, 14, R.mavi, 4) + okBasi(170, 262, Math.PI - .4, 12, R.mavi, 3);
    // istasyonlar
    const cift = (fn) => fn(false) + fn(true);
    s += c.P('isitme_korteksi', v => cift(m => `<ellipse cx="${m ? ayna(164) : 164}" cy="262" rx="38" ry="20" fill="${c.f('#CFE6FB', v)}" stroke="${c.s(v, R.mavi)}" stroke-width="2.5"/>`));
    s += c.P('mgb', v => cift(m => `<circle cx="${m ? 468 : 352}" cy="262" r="13" fill="${c.f('#FFFFFF', v)}" stroke="${c.s(v)}" stroke-width="3"/>`));
    s += c.P('inferior_kollikulus', v => cift(m => `<circle cx="${m ? 438 : 382}" cy="334" r="15" fill="${c.f('#FFFFFF', v)}" stroke="${c.s(v)}" stroke-width="3"/>`));
    s += c.P('lateral_lemniskus', v => cift(m => `<rect x="${m ? 432 : 372}" y="380" width="16" height="42" rx="8" fill="${c.f('#FFFFFF', v)}" stroke="${c.s(v)}" stroke-width="3"/>`));
    s += c.P('superior_oliver', v => cift(m => `<circle cx="${m ? 436 : 384}" cy="468" r="13" fill="${c.f('#FFFFFF', v)}" stroke="${c.s(v)}" stroke-width="3"/>`));
    s += c.P('koklear_nukleus', v => cift(m => `<ellipse cx="${m ? 474 : 346}" cy="528" rx="17" ry="14" fill="${c.f('#FFFFFF', v)}" stroke="${c.s(v)}" stroke-width="3"/>`));
    s += c.P('isitme_siniri', v => cift(m => boru(m ? 'M630 566 C 560 560 520 548 474 530' : 'M190 566 C 260 560 300 548 346 530', 8, c.f(KR.sinir, v), c.s(v), 2)));
    s += c.P('koklea', v => cift(m => boru(sarmal(m ? 670 : 150, 566, 30, 6, 2.1, m ? Math.PI : 0), 7, c.f(KR.sivi, v), c.s(v), 2)));
    return s;
  }});

// ---------------------------------------------------------------- vestibüler sistem: ana çizimin AYNI 3B kanal modeli, yandan-üstten bakış
// Zarlı labirent şeması: kanallar (ampullalı), vestibül içinde utrikül ve sakkül (makülalı), vestibüler sinir dalları, önde koklea.
CIZ.vestibuler = (c, ay) => {
  const yaw = ay.yaw ?? -70, pitch = ay.pitch ?? 40, kn = KG.kanallarAc(yaw, pitch), mm = p => KG.projAc(p, yaw, pitch);
  // 3B noktalar (mm): vestibül merkezi, utrikül, sakkül, koklea, sinir
  const M = {VM: mm([0, 1.2, -.4]), UT: mm([-.2, 2.4, -.6]), SA: mm([.2, -.4, 1.0]), KO: mm([2.2, -2.3, 3.6]), };
  M.G0 = [M.VM[0] + .35, M.VM[1] + 1.5]; M.SU = [M.VM[0] + .7, M.VM[1] + 4.6];   // sinir gövdesi: vestibülün altından aşağı (iç kulak yoluna)
  // otomatik sığdırma: tüm kanal noktaları + vestibül + koklea çerçeveye
  const tum = kn.superior.concat(kn.posterior, kn.lateral, [[M.VM[0] - 1.8, M.VM[1] - 2.4], [M.VM[0] + 1.8, M.VM[1] + 2.4], [M.KO[0] - 2.2, M.KO[1] - 1.6], [M.KO[0] + 2.2, M.KO[1] + 1.6], M.SU]);
  const xs = tum.map(q => q[0]), ys = tum.map(q => q[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const S = Math.min(700 / (x1 - x0), 520 / (y1 - y0)), O = [400 - S * (x0 + x1) / 2, 300 - S * (y0 + y1) / 2];
  const px = q => [O[0] + S * q[0], O[1] + S * q[1], q[2]], pt = arr => arr.map(px);
  const K = {superior: pt(kn.superior), posterior: pt(kn.posterior), lateral: pt(kn.lateral), crus: pt(kn.crus)};
  const amp = {superior: K.superior[0], posterior: K.posterior[0], lateral: K.lateral[0]};
  const VM = px(M.VM), UT = px(M.UT), SA = px(M.SA), KO = px(M.KO), G0 = px(M.G0), sinirUc = px(M.SU), mmS = v => v * S;
  const a = {yarim_daire_kanallari: K.superior[60], superior_kanal: K.superior[60], posterior_kanal: K.posterior[60], lateral_kanal: K.lateral[70],
    ampulla: amp.superior, utrikul: UT, sakkul: SA, vestibuler_sinir: [(G0[0] + sinirUc[0]) / 2, (G0[1] + sinirUc[1]) / 2], koklea: KO,
    crus_commune: K.crus[6], vestibul: [VM[0] + mmS(1.0), VM[1] + mmS(1.0)], makula: [UT[0], UT[1] + 8], krista: amp.lateral};
  for (const k in a) a[k] = [a[k][0], a[k][1]];
  return {w: 800, h: 600, cm: 1.15, a, takma: {ampullalar: 'ampulla', kanallar: 'yarim_daire_kanallari'},
    yer: {yarim_daire_kanallari: 'sol', superior_kanal: 'sol', posterior_kanal: 'sag', lateral_kanal: 'sag', ampulla: 'sol', utrikul: 'sag', sakkul: 'sol',
      vestibuler_sinir: 'sag', koklea: 'sol', crus_commune: 'sag', vestibul: 'sag', makula: 'sag', krista: 'sol'},
    svg: () => {
      const k = kalem(c, 1), P = (id, fn) => c.P(id, v => boya(fn(), v));
      const derin = ad => K[ad].reduce((t, p) => t + p[2], 0) / K[ad].length;
      let s = '';
      // koklea (önde, aşağıda): ana çizimdeki 2,5 turluk sarmalın küçültülmüşü
      s += P('koklea', () => { const r0 = mmS(2.0), oran = .56, kk = -Math.log(oran) / (2 * Math.PI), sp = th => { const r = r0 * Math.exp(-kk * th), ph = 2.6 - th; return [KO[0] + .9 * r * Math.cos(ph), KO[1] + .62 * r * Math.sin(ph)]; };
        const dis = Array.from({length: 140}, (_, i) => sp(i / 139 * 2 * Math.PI)), ic = Array.from({length: 200}, (_, i) => sp(2 * Math.PI + i / 199 * 3 * Math.PI));
        return k.yol(gYol(dis.concat([[KO[0] - 30, KO[1] - 6]]), true, .3), AR.sivi, NV, 2.6) + k.yol(gYol(ic, false, .4), 'none', NV, 2.2)
          + k.boru(gYol([[SA[0] + 6, SA[1] + 18], [SA[0] + 30, SA[1] + 52], [KO[0] - 40, KO[1] - 14]]), 7, AR.sivi, NV, 2.0); });
      // kanallar: arkadan öne; posterior en arkada ise ince ve açık çizgi
      ['superior', 'posterior', 'lateral'].sort((x, y) => derin(x) - derin(y)).forEach((ad, i) => {
        const b = kanalBoru(K[ad], mmS(.42), mmS(.78)), arka = i === 0, cz = arka ? '#3B5578' : NV;
        s += P(['yarim_daire_kanallari', ad + '_kanal'], () => k.yol(gYol(kapat(b.Lf, b.Rt), true, .3), AR.sivi, cz, arka ? 2.2 : 2.6)
          + (ad === 'posterior' ? (() => { const cb = kanalBoru(K.crus, mmS(.46), mmS(.46), false); return k.yol(gYol(kapat(cb.Lf, cb.Rt), true, .3), AR.sivi, cz, arka ? 2.2 : 2.6); })() : ''));
      });
      // vestibül kesesi ve kanal ağızları
      const vx = mmS(1.65), vy = mmS(2.3), ves = Array.from({length: 40}, (_, i) => { const t = i / 40 * 2 * Math.PI; return [VM[0] + vx * Math.cos(t) * (1 + .08 * Math.sin(t)), VM[1] + vy * Math.sin(t)]; });
      s += P('vestibul', () => { let g = k.yol(gYol(ves, true, .4), AR.sivi, NV, 2.8);
        [['superior', true, 26], ['superior', false, 26], ['lateral', true, 24], ['lateral', false, 22], ['posterior', true, 26], ['posterior', false, 26]].forEach(([ad, bas, n]) => {
          const b = kanalBoru(K[ad], mmS(.42), mmS(.78)); let xy = b.xy, ws = b.ws; if (!bas) { xy = xy.slice().reverse(); ws = ws.slice().reverse(); }
          const [L2, R2] = gBoru(xy.slice(0, n), ws.slice(0, n).map(w => Math.max(w - 5, 3)));
          g += `<path d="${gPoly(kapat(L2, R2))}" fill="${AR.sivi}"/>`; });
        return g; });
      // utrikül (üstte, yatay makula) ve sakkül (altta önde, dikey makula)
      s += P('utrikul', () => k.yol(gElips(UT[0], UT[1], mmS(1.2), mmS(.66)), '#C3E0FA', NV, 2.4) + c.P(['makula', 'utrikul'], v => boya(k.yol(gElips(UT[0], UT[1] + mmS(.3), mmS(.64), mmS(.15)), '#7FB4EA', null), v)));
      s += P('sakkul', () => k.yol(gElips(SA[0], SA[1], mmS(.74), mmS(.64)), '#C3E0FA', NV, 2.4) + c.P(['makula', 'sakkul'], v => boya(k.yol(gElips(SA[0] - mmS(.3), SA[1], mmS(.15), mmS(.4)), '#7FB4EA', null), v)));
      // ampullalar: krista (duyu tepesi) ile
      s += P('ampulla', () => Object.entries(amp).map(([ad, p]) => { const q = K[ad][6], aci = Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI;
        return `<g transform="rotate(${n1(aci)} ${n1(p[0])} ${n1(p[1])})">${k.yol(gElips(p[0] + mmS(.22), p[1], mmS(.66), mmS(.5)), '#C3E0FA', NV, 2.4)}${c.P(['krista', 'ampulla'], v => boya(k.yol(`M${n1(p[0] + 2)} ${n1(p[1] + 14)} C ${n1(p[0] + 6)} ${n1(p[1] + 2)} ${n1(p[0] + 14)} ${n1(p[1] + 2)} ${n1(p[0] + 18)} ${n1(p[1] + 14)}`, '#7FB4EA', NV, 1.8), v))}</g>`; }).join(''));
      // vestibüler sinir: ampulla ve makulalardan gövdeye
      s += P('vestibuler_sinir', () => { const uc = [amp.superior, amp.lateral, amp.posterior, UT, SA];
        let g = uc.map(p => k.boru(gYol([[p[0], p[1]], [(p[0] + G0[0]) / 2, (p[1] + G0[1]) / 2 + mmS(.2)], [G0[0], G0[1]]]), mmS(.12), AR.sinir, AR.sinir_c, 1.4)).join('');
        const tr = gCatmull([G0, [G0[0] + (sinirUc[0] - G0[0]) * .4, G0[1] + (sinirUc[1] - G0[1]) * .5 + mmS(.25)], sinirUc], 10), [Lf, Rt] = gBoru(tr, [mmS(.3), mmS(.42), mmS(.46)]);
        return g + k.yol(gYol(kapat(Lf, Rt), true, .3), AR.sinir, AR.sinir_c, 2.0); });
      return s;
    }};
};

// ---------------------------------------------------------------- ses dalgası (sıkışma-seyrelme + basınç grafiği)
CIZ.ses_dalgasi = (c, ay) => {
  const f = ay.frekans_hz || 1000, f2 = ay.karsilastir;
  let T = 3 / f; if (f2) T = Math.min(Math.max(3 / f, 1.25 / f2), 8 / f);
  const x0 = 110, x1 = 790, yc = 350, A = 88, X = tt => x0 + (x1 - x0) * tt / T;
  const xp1 = X(1 / (4 * f)), xp2 = X(5 / (4 * f));
  return {w: 900, h: 500,
    a: {dalga: [X(3 / (4 * f) + .5 / f * .35), yc - A * Math.sin(2 * Math.PI * (3 / 4 + .175))], genlik: [xp2 + 2, yc - A / 2], dalga_boyu: [xp2, 56], periyot: [X(7 / (4 * f)), yc + A + 18]},
    yer: {dalga_boyu: 'sag', genlik: 'sag', dalga: 'sol', periyot: 'sol'},
    svg: () => {
      const p = kis((c.t - .4) / 1.3), cz = KR.cz;
      let s = '';
      // parçacık bandı: yoğunluk basınçla orantılı (sıkışma = tepe)
      const N = 92, sat = 5, xs = [];
      const yog = x => 1 + .78 * Math.sin(2 * Math.PI * f * (x - x0) / (x1 - x0) * T);
      const ad = 400, kum = [0]; for (let i = 1; i <= ad; i++) { const x = x0 + (x1 - x0) * i / ad; kum.push(kum[i - 1] + yog(x)); }
      for (let j = 0; j < N; j++) { const hedef = (j + .5) / N * kum[ad]; let i = kum.findIndex(q => q >= hedef); xs.push(x0 + (x1 - x0) * i / ad); }
      s += `<rect x="${x0 - 14}" y="76" width="${x1 - x0 + 28}" height="112" rx="16" fill="#F4F9FF" stroke="${R.cizgi}" stroke-width="2"/>`;
      for (let r = 0; r < sat; r++) xs.forEach((x, j) => { const sx = x + ((j * 7 + r * 13) % 5 - 2) * 1.2, sy = 94 + r * 19 + ((j * 3 + r) % 3 - 1) * 2.5;
        if (sx <= x0 + (x1 - x0) * p) s += `<circle cx="${n1(sx)}" cy="${n1(sy)}" r="4.2" fill="${R.mavi}" opacity=".75"/>`; });
      // eksenler
      s += `<line x1="${x0}" y1="${yc}" x2="${x1 + 20}" y2="${yc}" stroke="${cz}" stroke-width="2.2"/>${okBasi(x1 + 22, yc, 0, 13)}
        <line x1="${x0}" y1="${yc + A + 50}" x2="${x0}" y2="${yc - A - 30}" stroke="${cz}" stroke-width="2.2"/>${okBasi(x0, yc - A - 32, -Math.PI / 2, 13)}`;
      s += c.yazi(x1 + 34, yc + c.fs(7), L('zaman', 'time'), {a: 'start', px: 19}) + c.yazi(x0 + 14, yc - A - 24, L('basınç', 'pressure'), {a: 'start', px: 19});
      // ikinci frekans (karşılaştırma)
      const dalgaYol = (fr, xmax) => { const pts = []; for (let x = x0; x <= xmax; x += 2) pts.push([x, yc - A * Math.sin(2 * Math.PI * fr * (x - x0) / (x1 - x0) * T)]); return yolDiz(pts); };
      const xm = x0 + (x1 - x0) * p;
      if (f2) s += `<path d="${dalgaYol(f2, xm)}" fill="none" stroke="${cz}" stroke-width="3.5" stroke-dasharray="10 7" opacity=".7"/>`;
      s += c.P('dalga', v => `<path d="${dalgaYol(f, xm)}" fill="none" stroke="${c.s(v * .5, R.mavi)}" stroke-width="${5 + 2 * v}" stroke-linecap="round"/>`);
      const op = kis((c.t - 1.6) / .5);
      s += `<g opacity="${op.toFixed(2)}">`;
      s += c.yazi(x1 - 4, yc - A - 34, `${f} Hz`, {a: 'end', px: 20, fw: 700, renk: R.mavi});
      if (f2) s += c.yazi(x1 - 4, yc + A + 50, `${f2} Hz`, {a: 'end', px: 20, fw: 700, renk: cz});
      // genlik, periyot, dalga boyu
      s += c.P('genlik', v => `<line x1="${n1(xp2)}" y1="${yc - 4}" x2="${n1(xp2)}" y2="${yc - A + 6}" stroke="${c.s(v)}" stroke-width="2.6"/>${okBasi(xp2, yc - A + 2, -Math.PI / 2, 11, c.s(v), 2.6)}${okBasi(xp2, yc - 1, Math.PI / 2, 11, c.s(v), 2.6)}`);
      const xa = X(3 / (4 * f)), xb = X(7 / (4 * f)), yb = yc + A + 18;
      s += c.P('periyot', v => `<path d="M${n1(xa)} ${yb - 10} L${n1(xa)} ${yb + 10} M${n1(xb)} ${yb - 10} L${n1(xb)} ${yb + 10} M${n1(xa)} ${yb} L${n1(xb)} ${yb}" stroke="${c.s(v)}" stroke-width="2.6" stroke-linecap="round"/>` + c.yazi((xa + xb) / 2, yb + c.fs(26), 'T', {px: 21, fw: 700, renk: c.s(v), ek: 'font-style="italic"'}));
      s += c.P('dalga_boyu', v => `<path d="M${n1(xp1)} 46 L${n1(xp1)} 66 M${n1(xp2)} 46 L${n1(xp2)} 66 M${n1(xp1)} 56 L${n1(xp2)} 56" stroke="${c.s(v)}" stroke-width="2.6" stroke-linecap="round"/>
        <line x1="${n1(xp1)}" y1="68" x2="${n1(xp1)}" y2="${n1(yc - A)}" stroke="${R.mavi}" stroke-width="1.6" stroke-dasharray="3 5"/><line x1="${n1(xp2)}" y1="68" x2="${n1(xp2)}" y2="${n1(yc - A)}" stroke="${R.mavi}" stroke-width="1.6" stroke-dasharray="3 5"/>`
        + c.yazi((xp1 + xp2) / 2, 44, 'λ', {px: 22, fw: 700, renk: c.s(v)}));
      return s + '</g>';
    }};
};

// ---------------------------------------------------------------- desibel ölçeği
CIZ.desibel_olcegi = c => {
  const Yd = d => 520 - d * 470 / 140, sx = 236;
  const ogeler = [['fisilti', 30, L('Fısıltı', 'Whisper')], ['konusma', 60, L('Konuşma', 'Conversation')], ['trafik', 85, L('Yoğun trafik', 'Heavy traffic')],
    ['konser', 110, L('Konser', 'Concert')], ['agri_esigi', 130, L('Ağrı eşiği', 'Pain threshold')]];
  const ix = 420, a = {}; ogeler.forEach(([id, d]) => a[id] = [ix + 34, Yd(d)]);
  const simge = {
    fisilti: `<path d="M-15 -8 C -15 -14 -10 -16 -4 -16 L 6 -16 C 13 -16 16 -12 16 -6 L 16 0 C 16 6 12 8 6 8 L -2 8 L -10 15 L -9 8 C -14 7 -15 4 -15 0 Z" fill="none" stroke-dasharray="3.5 3.5"/>`,
    konusma: `<path d="M-16 -9 C -16 -15 -11 -17 -5 -17 L 7 -17 C 13 -17 17 -14 17 -8 L 17 1 C 17 7 13 9 7 9 L -2 9 L -11 16 L -10 9 C -15 8 -16 5 -16 1 Z" fill="none"/><path d="M-8 -7 H 9 M-8 0 H 4" fill="none"/>`,
    trafik: `<path d="M-19 6 L -19 -2 L -12 -4 L -6 -12 L 8 -12 L 14 -4 L 19 -2 L 19 6 Z" fill="none" stroke-linejoin="round"/><circle cx="-9" cy="7" r="4.5" fill="#fff"/><circle cx="10" cy="7" r="4.5" fill="#fff"/>`,
    konser: `<path d="M-8 10 L -8 -12 L 12 -16 L 12 6" fill="none" stroke-linejoin="round"/><ellipse cx="-12" cy="10" rx="5" ry="4" fill="currentColor"/><ellipse cx="8" cy="6" rx="5" ry="4" fill="currentColor"/>`,
    agri_esigi: `<path d="M0 -17 L 18 14 L -18 14 Z" fill="none" stroke-linejoin="round"/><path d="M0 -6 L 0 4" fill="none"/><circle cx="0" cy="9.5" r="1.8" fill="currentColor" stroke="none"/>`};
  return {w: 680, h: 560, vx: 120, a, yer: Object.fromEntries(ogeler.map(o => [o[0], 'sag'])),
    svg: () => {
      const cz = KR.cz;
      let s = `<defs><linearGradient id="${c.gid}g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#D6EBFD"/><stop offset=".55" stop-color="#5DB0F2"/><stop offset=".62" stop-color="#FFD27A"/><stop offset="1" stop-color="#FFB020"/></linearGradient></defs>`;
      s += `<rect x="${sx - 22}" y="${Yd(140)}" width="44" height="${Yd(0) - Yd(140)}" rx="22" fill="url(#${c.gid}g)" stroke="${cz}" stroke-width="2.5"/>`;
      for (let d = 0; d <= 140; d += 10) { s += `<line x1="${sx - 34}" y1="${n1(Yd(d))}" x2="${sx - 24}" y2="${n1(Yd(d))}" stroke="${cz}" stroke-width="${d % 20 ? 1.5 : 2.5}"/>`;
        if (d % 20 === 0) s += c.yazi(sx - 44, Yd(d) + c.fs(7), d, {a: 'end', fw: 500, px: 19}); }
      s += c.yazi(sx, Yd(140) - c.fs(18), 'dB SPL', {px: 20, fw: 700, renk: cz});
      s += `<line x1="${sx + 30}" y1="${n1(Yd(85))}" x2="${sx + 60}" y2="${n1(Yd(85))}" stroke="${R.sari}" stroke-width="3" stroke-dasharray="4 4"/>`;
      ogeler.forEach(([id, d, ad], i) => {
        const p = ilerle(c.t, .5 + i * .15, .5), y = Yd(d);
        s += `<g opacity="${p.toFixed(2)}">` + c.P(id, v => `<line x1="${sx + 24}" y1="${n1(y)}" x2="${ix - 34}" y2="${n1(y)}" stroke="${c.s(v)}" stroke-width="2.5" stroke-dasharray="2 5" stroke-linecap="round"/>
          <circle cx="${ix}" cy="${n1(y)}" r="30" fill="${c.f(id === 'agri_esigi' || id === 'konser' ? '#FFF4DC' : '#EEF5FD', v)}" stroke="${c.s(v)}" stroke-width="2.5"/>
          <g transform="translate(${ix} ${n1(y)})" stroke="${c.s(v)}" stroke-width="2.6" stroke-linecap="round" color="${c.s(v)}">${simge[id]}</g>`)
          + c.yazi(sx + 34, y - c.fs(9), `${d} dB`, {a: 'start', px: 19, fw: 700, renk: cz})
          + (c.etiketli.has(id) ? '' : c.yazi(ix + 46, y + c.fs(8), ad, {a: 'start', px: 22, fw: 600, renk: cz})) + '</g>';
      });
      return s;
    }};
};

// ---------------------------------------------------------------- timpanogram (Jerger: A, As, Ad, B, C)
const TIMP = {A: [.2, .75, 0, 75], As: [.14, .14, -10, 70], Ad: [.2, 2.4, 0, 55], B: [.24, 0, 0, 100], C: [.2, .62, -250, 75]};
const TIMP_RENK = {A: R.mavi, As: R.lacivert, Ad: '#E39A10', B: R.soluk, C: R.basari};
CIZ.timpanogram = (c, ay) => {
  const x0 = 130, x1 = 820, y0 = 30, y1 = 450, X = p => x0 + (x1 - x0) * (p + 400) / 600, Y = m => y1 - (y1 - y0) * m / 3;
  const egr = (ay.egriler || [{tip: 'A'}]).filter(e => TIMP[e.tip]);
  const deger = (tip, p) => { const [b, h, p0, w] = TIMP[tip]; return tip === 'B' ? b + .03 * (p + 400) / 600 : b + h / Math.pow(1 + Math.pow((p - p0) / w, 2), 1.5); };
  const a = {normal: [X(-25), Y(1.6)]};
  egr.forEach(e => { const [, h, p0] = TIMP[e.tip]; a[e.tip] = e.tip === 'B' ? [X(100), Y(deger('B', 100))] : [X(p0), Y(deger(e.tip, p0))]; });
  const gecikme = {}; egr.forEach(e => gecikme[e.tip] = e.tip === 'B' ? 1 : (TIMP[e.tip][2] + 400) / 600 * 1.2);
  return {w: 880, h: 540, a, gecikme, yer: {C: 'sol', B: 'sag', A: 'sag', As: 'sag', Ad: 'sag', normal: 'sag'},
    svg: () => {
      const xt = [], yt = [];
      for (let p = -400; p <= 200; p += 100) xt.push({x: X(p), e: p > 0 ? '+' + p : p});
      for (let m = 0; m <= 3; m += .5) yt.push({y: Y(m), e: String(m.toFixed(1)).replace('.', EN ? '.' : ',')});
      let s = '';
      if (ay.normal !== false) s += c.P('normal', v => `<rect x="${X(-100)}" y="${Y(1.75)}" width="${X(50) - X(-100)}" height="${Y(.3) - Y(1.75)}" fill="${R.basari}" fill-opacity="${.10 + .1 * v}" stroke="${R.basari}" stroke-opacity=".35" stroke-dasharray="5 5"/>`
        + c.yazi(X(-100) - c.fs(8), Y(1.75) + c.fs(20), 'Normal', {a: 'end', px: 18, fw: 600, renk: R.basari}));
      s += eksenCiz(c, {x0, x1, y0, y1, xt, yt, xAd: L('Basınç (daPa)', 'Pressure (daPa)'), yAd: L('Kompliyans (ml)', 'Compliance (ml)'), yAdUz: 68});
      egr.forEach(e => {
        const b = e.cumle != null ? c.cb(e.cumle) : .5, p = kis((c.t - b) / 1.2); if (p <= 0) return;
        const renk = e.kulak === 'sag' ? R.sag_kulak : e.kulak === 'sol' ? R.sol_kulak : TIMP_RENK[e.tip];
        const pts = []; for (let pr = -400; pr <= -400 + 600 * p + .1; pr += 4) pts.push([X(pr), Y(deger(e.tip, pr))]);
        s += c.P(e.tip, v => `<path d="${yolDiz(pts)}" fill="none" stroke="${renk}" stroke-width="${5 + 2.5 * v}" stroke-linecap="round" stroke-linejoin="round"/>`);
        const q = yay(kis((c.t - b - 1) / .5));
        if (q > 0) { const [ax, ay2] = a[e.tip], w = c.fs(e.tip.length > 1 ? 46 : 34), hh = c.fs(32);
          s += `<g transform="translate(${n1(ax)} ${n1(ay2 - c.fs(30))}) scale(${q.toFixed(3)})"><rect x="${n1(-w / 2)}" y="${n1(-hh / 2)}" width="${n1(w)}" height="${n1(hh)}" rx="${n1(c.fs(9))}" fill="${renk}"/>${c.yazi(0, c.fs(7), e.tip, {px: 20, fw: 800, renk: '#fff'})}</g>`; }
      });
      return s;
    }};
};

// ---------------------------------------------------------------- ABR (dalga I-V)
CIZ.abr = (c, ay) => {
  const k = ay.latans_kayma || 0, uz = ay.i_v_uzama || 0;
  const lat = {I: 1.6 + k, II: 2.75 + k, III: 3.8 + k + uz / 2, IV: 5.1 + k + uz, V: 5.6 + k + uz};
  const gen = {I: .26, II: .14, III: .3, IV: .3, V: .5};
  const x0 = 100, x1 = 850, yb = 250, Sc = 300, X = t => x0 + (x1 - x0) * t / 10;
  const sinyal = (t, L0) => { let y = 0; for (const n in gen) { const s = n === 'IV' ? .2 : .2; y += gen[n] * Math.exp(-Math.pow((t - L0[n]) / s, 2)); }
    y -= .12 * Math.exp(-Math.pow((t - L0.I - .55) / .22, 2)) + .1 * Math.exp(-Math.pow((t - L0.III - .5) / .25, 2)) + .38 * Math.exp(-Math.pow((t - L0.V - 1.1) / .45, 2));
    y += .03 * Math.sin(t * 3.1) - .04 * Math.exp(-Math.pow(t / .5, 2)); return y; };
  const yY = y => yb - Sc * y;
  const tepe = n => { let bt = lat[n], by = -9; for (let t = lat[n] - .25; t <= lat[n] + .25; t += .01) { const y = sinyal(t, lat); if (y > by) { by = y; bt = t; } } return [X(bt), yY(by)]; };
  const T = {}; ['I', 'II', 'III', 'IV', 'V'].forEach(n => T[n] = tepe(n));
  const yk = 400;
  return {w: 900, h: 520,
    a: {dalga_I: [T.I[0], T.I[1] - 50], dalga_III: [T.III[0], T.III[1] - 50], dalga_V: [T.V[0], T.V[1] - 50], latans_I_V: [T.V[0] + 8, yk]},
    yer: {dalga_I: 'ust', dalga_III: 'ust', dalga_V: 'ust', latans_I_V: 'sag'},
    svg: () => {
      const xt = []; for (let t = 0; t <= 10; t++) xt.push({x: X(t), e: t % 2 ? null : t});
      let s = eksenCiz(c, {x0, x1, y0: 40, y1: 460, xt, yt: [], xAd: L('Latans (ms)', 'Latency (ms)')});
      s += `<line x1="${x0}" y1="${yb}" x2="${x1}" y2="${yb}" stroke="${R.cizgi}" stroke-width="2" stroke-dasharray="6 6"/>`;
      // ölçek çubuğu 0,5 µV
      s += `<path d="M${x1 - 10} 50 L${x1 - 10} ${50 + Sc * .5}" stroke="${R.lacivert}" stroke-width="3"/>` + c.yazi(x1 - 20, 50 + Sc * .25 + c.fs(7), L('0,5 µV', '0.5 µV'), {a: 'end', px: 18, fw: 500});
      const p = kis((c.t - .4) / 1.4);
      if (k || uz) { const ref = {I: 1.6, II: 2.75, III: 3.8, IV: 4.95, V: 5.6}, pr = []; for (let t = .1; t <= 10 * p; t += .03) pr.push([X(t), yY(sinyal(t, ref))]);
        s += `<path d="${yolDiz(pr)}" fill="none" stroke="${R.soluk}" stroke-width="3" stroke-dasharray="7 6" opacity=".55"/><line x1="${x0 + 24}" y1="${yk + 20}" x2="${x0 + 64}" y2="${yk + 20}" stroke="${R.soluk}" stroke-width="3" stroke-dasharray="7 6" opacity=".7"/><line x1="${x0 + 24}" y1="${yk + 20 + c.fs(30)}" x2="${x0 + 64}" y2="${yk + 20 + c.fs(30)}" stroke="${R.lacivert}" stroke-width="4"/>`
          + c.yazi(x0 + 74, yk + 20 + c.fs(6), L('normal', 'normal'), {a: 'start', px: 17, fw: 500}) + c.yazi(x0 + 74, yk + 20 + c.fs(36), L('örnek', 'example'), {a: 'start', px: 17, fw: 500}); }
      const pts = []; for (let t = .1; t <= 10 * p; t += .025) pts.push([X(t), yY(sinyal(t, lat))]);
      s += `<path d="${yolDiz(pts)}" fill="none" stroke="${R.lacivert}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
      ['I', 'II', 'III', 'IV', 'V'].forEach(n => { const [x, y] = T[n]; if (x > X(10 * p)) return; const ana = n !== 'II' && n !== 'IV', id = 'dalga_' + n;
        const tepeS = v => `<circle cx="${n1(x)}" cy="${n1(y)}" r="${ana ? 7 : 5}" fill="${c.f(ana ? R.mavi : '#9CC9F3', v * 0)}" stroke="#fff" stroke-width="2"/>` + c.yazi(x, y - c.fs(n === 'IV' ? 30 : 18), n, {px: ana ? 24 : 19, fw: 800, renk: ana ? c.s(v, R.lacivert) : R.soluk, ff: 'Outfit'});
        s += ana ? c.P(id, tepeS) : tepeS(0); });
      if (p > .98) { const xa = T.I[0], xb = T.V[0], ms = ((xb - xa) / (x1 - x0) * 10).toFixed(1).replace('.', EN ? '.' : ',');
        s += c.P('latans_I_V', v => `<path d="M${n1(xa)} ${yk - 12} L${n1(xa)} ${yk + 12} M${n1(xb)} ${yk - 12} L${n1(xb)} ${yk + 12} M${n1(xa)} ${yk} L${n1(xb)} ${yk}" stroke="${c.s(v, R.mavi)}" stroke-width="3" stroke-linecap="round"/>
          <line x1="${n1(xa)}" y1="${n1(T.I[1] + 12)}" x2="${n1(xa)}" y2="${yk - 14}" stroke="${R.mavi}" stroke-width="1.6" stroke-dasharray="3 5"/><line x1="${n1(xb)}" y1="${n1(T.V[1] + 12)}" x2="${n1(xb)}" y2="${yk - 14}" stroke="${R.mavi}" stroke-width="1.6" stroke-dasharray="3 5"/>`
          + c.yazi((xa + xb) / 2, yk - c.fs(12), `I-V: ${ms} ms`, {px: 20, fw: 700, renk: R.lacivert})); }
      return s;
    }};
};

// ---------------------------------------------------------------- OAE (TEOAE zaman, DPOAE spektrum)
CIZ.oae = (c, ay) => {
  const dp = String(ay.tur || 'TEOAE').toUpperCase() === 'DPOAE';
  const x0 = 110, x1 = 850, y0 = 40, y1 = 440;
  if (!dp) {
    const X = t => x0 + (x1 - x0) * t / 20, yb = 240, S = 120;
    const yanit = t => t < 3 ? 0 : (t - 3) / 2.2 * Math.exp(-(t - 3) / 4.2) * Math.sin(2 * Math.PI * (1.55 * (t - 3) - .03 * Math.pow(t - 3, 2))) * 1.05;
    return {w: 900, h: 520, a: {uyaran: [X(1.1), yb - 150], yanit: [X(7.2), yb - S * .62], gurultu: [X(16.5), yb + 22]}, yer: {uyaran: 'sol', yanit: 'sag', gurultu: 'sag'},
      svg: () => {
        const xt = []; for (let t = 0; t <= 20; t += 2) xt.push({x: X(t), e: t % 4 ? null : t});
        let s = eksenCiz(c, {x0, x1, y0, y1, xt, yt: [], xAd: L('Zaman (ms)', 'Time (ms)')});
        s += `<line x1="${x0}" y1="${yb}" x2="${x1}" y2="${yb}" stroke="${R.cizgi}" stroke-width="2"/>`;
        s += c.P('gurultu', v => `<rect x="${x0}" y="${yb - 20}" width="${x1 - x0}" height="40" fill="${c.f('#DCE3EC', v)}" opacity=".85"/>`);
        const p = kis((c.t - .4) / 1.5);
        s += c.P('uyaran', v => { const pts = []; for (let t = 0; t <= Math.min(2.6, 20 * p); t += .02) pts.push([X(t), yb - 150 * Math.exp(-Math.pow((t - .9) / .18, 2)) + 90 * Math.exp(-Math.pow((t - 1.35) / .22, 2))]);
          return `<path d="${yolDiz(pts)}" fill="none" stroke="${c.s(v)}" stroke-width="4" stroke-linejoin="round"/>`; });
        s += c.P('yanit', v => { const pts = []; for (let t = 2.6; t <= 20 * p; t += .02) pts.push([X(t), yb - S * yanit(t) + 2 * Math.sin(t * 23)]);
          return `<path d="${yolDiz(pts)}" fill="none" stroke="${c.s(v * .4, R.mavi)}" stroke-width="${3.6 + v}" stroke-linejoin="round"/>`; });
        s += c.yazi(x1, y0 + c.fs(6), 'TEOAE', {a: 'end', px: 22, fw: 800, renk: R.lacivert, ff: 'Outfit'});
        return s;
      }};
  }
  const fmin = 1000, fmax = 5000, X = f => x0 + (x1 - x0) * Math.log(f / fmin) / Math.log(fmax / fmin), Y = d => y1 - (y1 - y0) * (d + 20) / 100;
  const f2 = 4000, f1 = Math.round(f2 / 1.22), fdp = 2 * f1 - f2;
  return {w: 900, h: 520, a: {uyaran: [X(f2) + 4, Y(32)], yanit: [X(fdp) + 4, Y(2)], gurultu: [X(1500), Y(-12)]}, yer: {uyaran: 'sag', yanit: 'sol', gurultu: 'sol'},
    svg: () => {
      const xt = [1000, 2000, 3000, 4000, 5000].map(f => ({x: X(f), e: fYazi(f), ince: f % 2000 !== 0 && f !== 1000})), yt = [];
      for (let d = -20; d <= 80; d += 20) yt.push({y: Y(d), e: d});
      let s = eksenCiz(c, {x0, x1, y0, y1, xt, yt, xAd: L('Frekans (Hz)', 'Frequency (Hz)'), yAd: 'dB SPL'});
      const p = ilerle(c.t, .4, 1);
      s += c.P('gurultu', v => { const pts = [[x0, Y(-20)]]; for (let x = x0; x <= x1; x += 6) pts.push([x, Y(-12 + 4 * Math.sin(x * .37) + 3 * Math.sin(x * 1.13))]); pts.push([x1, Y(-20)]);
        return `<path d="${yolDiz(pts)}Z" fill="${c.f('#DCE3EC', v)}" stroke="${c.s(v, R.soluk)}" stroke-width="2"/>`; });
      const cubuk = (f, d, renk, ad, w) => `<line x1="${n1(X(f))}" y1="${n1(Y(-20))}" x2="${n1(X(f))}" y2="${n1(Y(-20) + (Y(d) - Y(-20)) * p)}" stroke="${renk}" stroke-width="${w}" stroke-linecap="round"/>` + (p > .9 ? c.yazi(X(f), Y(d) - c.fs(14), ad, {px: 19, fw: 700, renk: renk}) : '');
      s += c.P('uyaran', v => cubuk(f1, 65, c.s(v), 'f1', 7) + cubuk(f2, 55, c.s(v), 'f2', 7));
      s += c.P('yanit', v => cubuk(fdp, 10, c.s(v * .4, R.mavi), '2f1-f2', 7 + 2 * v));
      s += c.yazi(x1, y0 + c.fs(6), 'DPOAE', {a: 'end', px: 22, fw: 800, renk: R.lacivert, ff: 'Outfit'});
      return s;
    }};
};

// ---------------------------------------------------------------- ortak: baş (yandan, yüz sola) ve (önden)
const BAS_YAN = 'M452 40 C 350 36 268 84 252 170 C 248 192 246 210 238 226 C 226 252 206 280 196 298 C 192 306 198 314 212 316 C 214 322 210 330 208 336 C 214 342 214 348 210 352 C 214 358 214 364 208 370 C 206 384 212 396 226 404 C 250 418 280 426 300 430 C 314 450 318 490 316 540 L 520 540 C 516 500 520 470 540 450 C 610 404 646 330 640 240 C 632 120 556 44 452 40 Z';
const KULAK_YAN = 'M462 222 C 494 206 526 232 522 272 C 518 310 496 326 488 344 C 482 358 466 362 460 350 C 454 338 462 328 466 314 C 470 298 452 292 452 270 C 452 248 452 230 462 222 Z';
function basYan(c, ox, oy, sc, v = {}) {
  return `<g transform="translate(${ox} ${oy}) scale(${sc})"><path d="${BAS_YAN}" fill="${KR.deri}" stroke="${KR.cz}" stroke-width="${3 / sc}" stroke-linejoin="round"/>
    <path d="M228 236 C 236 230 246 232 252 238" fill="none" stroke="${KR.ince}" stroke-width="${3 / sc}" stroke-linecap="round"/>
    <path d="${KULAK_YAN}" fill="${c.f('#E3EBF5', v.kulak || 0)}" stroke="${c.s(v.kulak || 0)}" stroke-width="${3 / sc}" stroke-linejoin="round"/>
    <path d="M472 236 C 496 236 506 262 500 284 C 496 298 488 304 484 316" fill="none" stroke="${KR.ince}" stroke-width="${2.5 / sc}" stroke-linecap="round"/>
    <ellipse cx="466" cy="286" rx="7" ry="9" fill="${KR.cz}" opacity=".75"/></g>`;
}
// diyapazon: (x, y) sap ucu (temas noktası), a: dönüş (derece), titreşim t
function diyapazonCiz(c, x, y, a, sc, renk, cz, titres = true) {
  const tt = .45 + .4 * Math.sin(c.t * 9);
  return `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${a}) scale(${sc})">
    ${titres ? `<g fill="none" stroke="${R.mavi}" stroke-width="3" stroke-linecap="round" opacity="${tt.toFixed(2)}"><path d="M-34 -222 C -42 -206 -42 -190 -34 -174 M-46 -230 C -58 -206 -58 -182 -46 -158 M34 -222 C 42 -206 42 -190 34 -174 M46 -230 C 58 -206 58 -182 46 -158"/></g>` : ''}
    <path d="M-20 -236 L -20 -92 C -20 -66 20 -66 20 -92 L 20 -236 L 9 -236 L 9 -92 C 9 -78 -9 -78 -9 -92 L -9 -236 Z" fill="${renk}" stroke="${cz}" stroke-width="2.6" stroke-linejoin="round"/>
    <rect x="-5" y="-74" width="10" height="66" rx="3" fill="${renk}" stroke="${cz}" stroke-width="2.6"/><circle cx="0" cy="-5" r="9" fill="${renk}" stroke="${cz}" stroke-width="2.6"/></g>`;
}
const BAS_ON = 'M430 96 C 520 96 584 170 584 272 C 584 360 540 430 470 456 L 472 540 L 388 540 L 390 456 C 320 430 276 360 276 272 C 276 170 340 96 430 96 Z';
function basOn(c, renkSag, renkSol) {
  return `<path d="${BAS_ON}" fill="${KR.deri}" stroke="${KR.cz}" stroke-width="3" stroke-linejoin="round"/>
    <g fill="none" stroke="${KR.ince}" stroke-width="3" stroke-linecap="round"><path d="M378 262 C 388 254 400 254 410 262 M450 262 C 460 254 472 254 482 262 M430 282 L 424 326 L 436 330 M404 366 C 420 376 440 376 456 366"/></g>
    <path d="M280 248 C 258 240 248 262 252 284 C 256 312 268 330 284 330" fill="${renkSag || '#E3EBF5'}" stroke="${KR.cz}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M580 248 C 602 240 612 262 608 284 C 604 312 592 330 576 330" fill="${renkSol || '#E3EBF5'}" stroke="${KR.cz}" stroke-width="3" stroke-linejoin="round"/>`;
}

// ---------------------------------------------------------------- diyapazon testleri (Rinne, Weber, Bing)
CIZ.diyapazon = (c, ay) => {
  const test = String(ay.test || 'rinne').toLowerCase(), cz = KR.cz;
  if (test === 'weber') return {w: 860, h: 580,
    a: {diyapazon: [440, 20], alin: [430, 134], kulak: [262, 290], mastoid: [580, 360]}, yer: {diyapazon: 'sag', alin: 'sag', kulak: 'sol', mastoid: 'sag'},
    svg: () => {
      let s = c.P('kulak', v => basOn(c, c.f('#E3EBF5', v), c.f('#E3EBF5', v)));
      s += c.P('alin', v => `<ellipse cx="430" cy="132" rx="${26 + 8 * v}" ry="${12 + 4 * v}" fill="${R.mavi}" opacity="${(.15 + .35 * v).toFixed(2)}"/>`);
      s += c.P('mastoid', v => `<circle cx="300" cy="360" r="${9 + 4 * v}" fill="${R.mavi}" opacity="${(.15 + .5 * v).toFixed(2)}"/><circle cx="560" cy="360" r="${9 + 4 * v}" fill="${R.mavi}" opacity="${(.15 + .5 * v).toFixed(2)}"/>`);
      const p = kis((c.t - .6) / 1);
      s += `<g opacity="${p.toFixed(2)}" fill="none" stroke="${R.mavi}" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="8 8">
        <path d="M410 168 C 360 190 320 230 300 266"/><path d="M450 168 C 500 190 540 230 560 266"/></g>${p > .5 ? okBasi(300, 266, 2.05, 15, R.mavi, 3.5) + okBasi(560, 266, 1.09, 15, R.mavi, 3.5) : ''}`;
      s += c.P('diyapazon', v => diyapazonCiz(c, 430, 140, 0, .6, c.f(KR.metal, v), c.s(v)));
      s += c.yazi(250, 382, L('Sağ', 'Right'), {px: 19, fw: 700, renk: R.sag_kulak}) + c.yazi(610, 382, L('Sol', 'Left'), {px: 19, fw: 700, renk: R.sol_kulak});
      return s;
    }};
  if (test === 'bing') return {w: 860, h: 580,
    a: {diyapazon: [586, 200], mastoid: [524, 352], kulak: [466, 288], alin: [256, 160]}, yer: {diyapazon: 'sag', mastoid: 'sag', kulak: 'sag', alin: 'sol'},
    svg: () => {
      let s = c.P('kulak', v => basYan(c, 0, 0, 1, {kulak: v}));
      s += c.P('alin', v => `<ellipse cx="256" cy="164" rx="${14 + 6 * v}" ry="${22 + 6 * v}" fill="${R.mavi}" opacity="${(.12 + .4 * v).toFixed(2)}"/>`);
      // parmak tragusa bastırıyor (kulak yolu kapalı)
      s += boru('M366 420 C 398 372 428 332 452 298', 32, KR.deri, cz, 2.8) + `<path d="M436 300 C 442 290 452 286 460 290 L 456 306 Z" fill="#F7FAFD" stroke="${KR.ince}" stroke-width="2"/>` + `<path d="M440 306 C 446 296 452 292 458 290" fill="none" stroke="${KR.ince}" stroke-width="3" stroke-linecap="round"/>`;
      s += c.P('mastoid', v => `<circle cx="524" cy="352" r="${10 + 4 * v}" fill="${R.mavi}" opacity="${(.2 + .5 * v).toFixed(2)}"/>`);
      s += c.P('diyapazon', v => diyapazonCiz(c, 526, 352, 22, .82, c.f(KR.metal, v), c.s(v)));
      return s;
    }};
  // Rinne: 1) mastoid (kemik yolu), 2) kulak yolu önü (hava yolu)
  const sc = .74, o1 = [-128, 104], o2 = [302, 104], tp = (o, x, y) => [o[0] + x * sc, o[1] + y * sc];
  const m1 = tp(o1, 522, 352), k2 = tp(o2, 466, 286);
  return {w: 860, h: 580,
    a: {mastoid: m1, diyapazon: [k2[0] - 40, k2[1] - 10], kulak: k2, alin: tp(o1, 256, 164)}, yer: {mastoid: 'sol', alin: 'sol', kulak: 'sag', diyapazon: 'sag'},
    svg: () => {
      let s = basYan(c, o1[0], o1[1], sc) + c.P('kulak', v => basYan(c, o2[0], o2[1], sc, {kulak: v}));
      s += c.P('alin', v => { const [x, y] = tp(o1, 256, 164); return `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="${12 + 5 * v}" ry="${18 + 5 * v}" fill="${R.mavi}" opacity="${(.12 + .4 * v).toFixed(2)}"/>`; });
      s += c.P('mastoid', v => `<circle cx="${n1(m1[0])}" cy="${n1(m1[1])}" r="${9 + 4 * v}" fill="${R.mavi}" opacity="${(.2 + .5 * v).toFixed(2)}"/>`);
      const p2 = kis((c.t - 1) / .8);
      s += c.P('diyapazon', v => diyapazonCiz(c, m1[0] + 2, m1[1], 20, .7, c.f(KR.metal, v), c.s(v), p2 < .5)
        + `<g opacity="${p2.toFixed(2)}">${diyapazonCiz(c, k2[0] - 40, k2[1] + 112, 0, .62, c.f(KR.metal, v), c.s(v))}</g>`);
      // adım numaraları ve ok
      const rozet = (x, y, n) => `<circle cx="${x}" cy="${y}" r="20" fill="${R.lacivert}"/>` + c.yazi(x, y + c.fs(8), n, {px: 22, fw: 800, renk: '#fff', ff: 'Outfit'});
      s += rozet(62, 70, '1') + `<g opacity="${p2.toFixed(2)}">${rozet(492, 70, '2')}<path d="M330 70 C 380 50 420 50 456 66" fill="none" stroke="${R.mavi}" stroke-width="3.5" stroke-linecap="round"/>${okBasi(458, 67, .35, 14, R.mavi, 3.5)}</g>`;
      s += c.yazi(90, 76, L('kemik yolu', 'bone conduction'), {a: 'start', px: 19, fw: 600, renk: R.soluk}) + `<g opacity="${p2.toFixed(2)}">${c.yazi(520, 76, L('hava yolu', 'air conduction'), {a: 'start', px: 19, fw: 600, renk: R.soluk})}</g>`;
      return s;
    }};
};

// ---------------------------------------------------------------- konuşma muzu (odyogram üstünde konuşma sesleri)
CIZ.konusma_muzu = (c, ay) => {
  const W = 900, H = 600;
  const harfler = [['u', 300, 46, 1], ['o', 500, 52, 1], ['a', 900, 54, 1], ['e', 1400, 48, 1], ['i', 2600, 42, 1],
    ['m', 250, 34, 0], ['n', 420, 37, 0], ['k', 1900, 34, 0], ['ş', 3000, 30, 0], ['ç', 2300, 26, 0], ['h', 1500, 24, 0], ['f', 4600, 20, 0], ['s', 6000, 22, 0]];
  const ust = [[220, 28], [500, 26], [1000, 22], [2000, 17], [4000, 13], [6000, 11], [7600, 16]], alt = [[7400, 27], [5000, 33], [3000, 42], [1600, 54], [800, 62], [400, 62], [230, 52]];
  let g = null;
  const geo = () => g || (g = odyoGeo(W, H, {sol: c.fs(80), ust: c.fs(46), frekanslar: ay.frekanslar}));
  const a = () => { const G = odyoGeo(W, H, {sol: 80, ust: 46}); return {muz: [G.XF(1250), G.Y(21)], unluler: [G.XF(620), G.Y(58)], unsuzler: [G.XF(5300), G.Y(14)]}; };
  return {w: W, h: H, a: a(), yer: {muz: 'sag', unluler: 'sol', unsuzler: 'sag'},
    svg: () => {
      const G = geo(), fs = c.fs(19);
      const muz = v => { const pts = ust.concat(alt).map(([f, d]) => [G.XF(f), G.Y(d)]);
        const n = pts.length, P = i => pts[(i + n) % n]; let d = `M${n1(pts[0][0])} ${n1(pts[0][1])}`;
        for (let i = 0; i < n; i++) { const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
          d += ` C${n1(p1[0] + (p2[0] - p0[0]) / 6)} ${n1(p1[1] + (p2[1] - p0[1]) / 6)} ${n1(p2[0] - (p3[0] - p1[0]) / 6)} ${n1(p2[1] - (p3[1] - p1[1]) / 6)} ${n1(p2[0])} ${n1(p2[1])}`; }
        return `<path d="${d} Z" fill="${karis('#FFE3A8', '#B3D8FA', v)}" fill-opacity=".75" stroke="${c.s(v, '#E3A23A')}" stroke-width="${c.fs(2.5)}" stroke-linejoin="round"/>`; };
      const harf = (grup, v) => harfler.filter(h => h[3] === grup).map(([m, f, d], i) => { const p = ilerle(c.t, .7 + (f / 9000) * 1.2, .4);
        return `<g opacity="${p.toFixed(2)}">${c.yazi(G.XF(f), G.Y(d) + c.fs(10), m, {px: 30, fw: 800, ff: 'Outfit', renk: grup ? c.s(v, R.lacivert) : c.s(v * .4, '#B26B00')})}</g>`; }).join('');
      const ara = () => c.P('muz', muz) + c.P('unluler', v => harf(1, v)) + c.P('unsuzler', v => harf(0, v));
      const seriler = (ay.seriler || []).map(sr => Object.assign({}, sr, {p: sr.cumle != null ? kis((c.t - c.cb(sr.cumle)) / 1.4) : 1}));
      return odyogram(W, H, {fs, sol: c.fs(80), ust: c.fs(46), eksen: true, frekanslar: ay.frekanslar, seriler, kalin: c.fs(4.5), r: c.fs(12), ara_cizim: ara}, c.t)
        .replace(/^<svg[^>]*>/, '<g>').replace(/<\/svg>$/, '</g>');
    }};
};

// ---------------------------------------------------------------- maskeleme (çapraz işitme ve karşı kulağa gürültü)
CIZ.maskeleme = (c, ay) => {
  const ia = ay.ia_db ?? 40, solTest = ay.test_kulak === 'sol';
  // önden bakış: hastanın sağ kulağı ekranın solunda
  const xT = solTest ? 640 : 220, xK = solTest ? 220 : 640, kT = solTest ? R.sol_kulak : R.sag_kulak, kK = solTest ? R.sag_kulak : R.sol_kulak;
  const kokT = solTest ? 548 : 312, kokK = solTest ? 312 : 548;
  return {w: 860, h: 560,
    a: {test_kulagi: [xT + (solTest ? 14 : -14), 300], karsi_kulak: [xK + (solTest ? -14 : 14), 300], kafatasi: [430, 128], kulaklar_arasi_zayiflama: [solTest ? 489 : 371, 384], maskeleme_gurultusu: [solTest ? 90 : 770, 300]},
    yer: {test_kulagi: solTest ? 'sag' : 'sol', karsi_kulak: solTest ? 'sol' : 'sag', maskeleme_gurultusu: solTest ? 'sol' : 'sag', kafatasi: 'sol', kulaklar_arasi_zayiflama: 'sag'},
    svg: () => {
      const cz = KR.cz;
      let s = basOn(c);
      s += c.P('kafatasi', v => `<path d="M430 120 C 508 120 560 184 560 270 C 560 340 524 396 470 418 L 390 418 C 336 396 300 340 300 270 C 300 184 352 120 430 120 Z" fill="${c.f('#E9EFF7', v)}" fill-opacity=".8" stroke="${c.s(v, KR.ince)}" stroke-width="3" stroke-dasharray="9 7"/>`);
      s += [kokT, kokK].map(x => boru(sarmal(x, 300, 18, 4, 1.8), 6, KR.sivi, cz, 2)).join('');
      // kulaklık bandı
      s += `<path d="M232 236 C 236 120 320 60 430 60 C 540 60 624 120 628 236" fill="none" stroke="${cz}" stroke-width="12" stroke-linecap="round"/><path d="M232 236 C 236 120 320 60 430 60 C 540 60 624 120 628 236" fill="none" stroke="#5E6F88" stroke-width="6" stroke-linecap="round"/>`;
      const kupa = (x, renk, v, sol) => `<rect x="${x - 34}" y="236" width="68" height="128" rx="26" fill="${c.f(renk, v * .3)}" stroke="${c.s(v)}" stroke-width="3"/><rect x="${sol ? x + 22 : x - 34}" y="252" width="12" height="96" rx="5" fill="#fff" opacity=".35"/>`;
      s += c.P('test_kulagi', v => kupa(xT, kT, v, !solTest));
      s += c.P('karsi_kulak', v => kupa(xK, kK, v, solTest));
      // test tonu (saf ses) test kulağının dışında
      const dT = solTest ? 1 : -1;
      const ton = []; for (let x = 0; x <= 80; x += 2) ton.push([xT + dT * (52 + x), 300 - 20 * Math.sin(x / 80 * 4 * Math.PI)]);
      s += `<path d="${yolDiz(ton)}" fill="none" stroke="${kT}" stroke-width="4" stroke-linecap="round"/>` + c.yazi(xT + dT * 92, 352, L('ton', 'tone'), {px: 18, fw: 600, renk: kT});
      // maskeleme gürültüsü karşı kulağa
      s += c.P('maskeleme_gurultusu', v => { const n = []; for (let i = 0; i <= 40; i++) n.push([xK - dT * (52 + i * 2.2), 300 + Math.sin(i * 2.7 + c.t * 7) * Math.cos(i * 1.3) * 26]);
        return `<path d="${yolDiz(n)}" fill="none" stroke="${c.s(v, '#7A8BA4')}" stroke-width="3.2" stroke-linejoin="round"/>` + c.yazi(xK - dT * 96, 352, L('gürültü', 'noise'), {px: 18, fw: 600, renk: c.s(v, R.soluk)}); });
      // çapraz işitme: test kulağından kafatası yoluyla karşı koklea (zayıflayarak)
      s += c.P('kulaklar_arasi_zayiflama', v => { const p = kis((c.t - .8) / 1.2), pts = [];
        for (let i = 0; i <= 40 * p; i++) { const u = i / 40, x = kokT + (kokK - kokT) * u, y = 316 + 96 * Math.sin(Math.PI * u); pts.push([x, y, 9 * (1 - u) + 2]); }
        let d = ''; pts.forEach(([x, y, w], i) => { if (i) d += `<line x1="${n1(pts[i - 1][0])}" y1="${n1(pts[i - 1][1])}" x2="${n1(x)}" y2="${n1(y)}" stroke="${c.s(v * .5, R.sari)}" stroke-width="${n1(w)}" stroke-linecap="round"/>`; });
        if (p > .97) d += okBasi(kokK + (solTest ? 6 : -6), 318, solTest ? Math.PI + .9 : -.9 + Math.PI * 0, 14, R.sari, 4);
        const r = `<rect x="${430 - c.fs(62)}" y="${404 - c.fs(19)}" width="${c.fs(124)}" height="${c.fs(38)}" rx="${c.fs(19)}" fill="#fff" stroke="${R.sari}" stroke-width="2.5"/>`;
        return d + (p > .6 ? r + c.yazi(430, 404 + c.fs(7), `IA ${ia} dB`, {px: 19, fw: 800, renk: R.lacivert}) : ''); });
      s += c.yazi(220, 400, L('Sağ', 'Right'), {px: 19, fw: 700, renk: R.sag_kulak}) + c.yazi(640, 400, L('Sol', 'Left'), {px: 19, fw: 700, renk: R.sol_kulak});
      return s;
    }};
};

// ---------------------------------------------------------------- odyometre düzeneği
CIZ.odyometre = c => ({w: 920, h: 560,
  a: {cihaz: [260, 420], kulaklik: [700, 44], kemik_vibratoru: [649, 324], hasta_butonu: [742, 470]},
  yer: {cihaz: 'sol', kulaklik: 'sag', kemik_vibratoru: 'sag', hasta_butonu: 'sag'},
  svg: () => {
    const cz = KR.cz;
    let s = `<g fill="none" stroke="#7A8BA4" stroke-width="3.5" stroke-linecap="round"><path d="M470 220 C 520 210 540 190 582 196"/><path d="M470 252 C 600 320 790 320 810 268"/><path d="M470 300 C 540 310 560 340 640 336"/><path d="M470 380 C 560 400 600 450 718 470"/></g>`;
    s += c.P('cihaz', v => { let d = `<path d="M40 190 L 80 140 L 470 140 L 470 430 Q 470 440 460 440 L 50 440 Q 40 440 40 430 Z" fill="${c.f('#F4F7FB', v)}" stroke="${c.s(v)}" stroke-width="3" stroke-linejoin="round"/>
        <rect x="74" y="172" width="210" height="130" rx="10" fill="${R.lacivert}"/>`;
      for (let i = 0; i < 6; i++) d += `<line x1="${92 + i * 34}" y1="186" x2="${92 + i * 34}" y2="290" stroke="#ffffff" stroke-opacity=".15" stroke-width="1.5"/>`;
      for (let j = 0; j < 5; j++) d += `<line x1="86" y1="${190 + j * 24}" x2="272" y2="${190 + j * 24}" stroke="#ffffff" stroke-opacity=".15" stroke-width="1.5"/>`;
      d += `<path d="M92 206 L 126 210 L 160 216 L 194 234 L 228 258 L 262 266" fill="none" stroke="${R.sag_kulak}" stroke-width="3.5" stroke-linejoin="round"/>`;
      [[92, 206], [126, 210], [160, 216], [194, 234], [228, 258], [262, 266]].forEach(([x, y]) => d += `<circle cx="${x}" cy="${y}" r="5" fill="${R.lacivert}" stroke="${R.sag_kulak}" stroke-width="2.5"/>`);
      [[350, 226, 'Hz'], [430, 226, 'dB']].forEach(([x, y, m]) => { d += `<circle cx="${x}" cy="${y}" r="32" fill="#fff" stroke="${cz}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="22" fill="${c.f('#E3EBF5', v)}"/><line x1="${x}" y1="${y}" x2="${x + 14}" y2="${y - 14}" stroke="${cz}" stroke-width="4" stroke-linecap="round"/>` + c.yazi(x, y + 56, m, {px: 17, fw: 700}); });
      [[80, R.sag_kulak], [150, R.sol_kulak], [220, '#7A8BA4']].forEach(([x, r]) => d += `<rect x="${x}" y="340" width="54" height="34" rx="8" fill="${r}" opacity=".9"/>`);
      d += `<rect x="300" y="332" width="140" height="50" rx="12" fill="${R.mavi}"/>` + c.yazi(370, 365, L('TON', 'TONE'), {px: 19, fw: 800, renk: '#fff'});
      d += `<circle cx="96" cy="410" r="6" fill="${R.basari}"/>`;
      return d; });
    s += c.P('kulaklik', v => `<path d="M590 200 C 590 100 640 60 700 60 C 760 60 810 100 810 200" fill="none" stroke="${c.s(v)}" stroke-width="12" stroke-linecap="round"/><path d="M590 200 C 590 100 640 60 700 60 C 760 60 810 100 810 200" fill="none" stroke="${c.f('#5E6F88', v)}" stroke-width="6" stroke-linecap="round"/>
      <rect x="566" y="170" width="48" height="96" rx="20" fill="${R.sag_kulak}" stroke="${c.s(v)}" stroke-width="3"/><rect x="786" y="170" width="48" height="96" rx="20" fill="${R.sol_kulak}" stroke="${c.s(v)}" stroke-width="3"/>`);
    s += c.P('kemik_vibratoru', v => `<path d="M650 336 C 650 280 690 262 740 262 C 790 262 820 290 818 340" fill="none" stroke="${c.s(v)}" stroke-width="8" stroke-linecap="round"/><path d="M650 336 C 650 280 690 262 740 262 C 790 262 820 290 818 340" fill="none" stroke="${c.f(KR.metal, v)}" stroke-width="3.5" stroke-linecap="round"/>
      <rect x="626" y="322" width="46" height="34" rx="9" fill="${c.f('#5E6F88', v)}" stroke="${c.s(v)}" stroke-width="3"/><circle cx="818" cy="342" r="10" fill="${c.f('#E3EBF5', v)}" stroke="${c.s(v)}" stroke-width="3"/>`);
    s += c.P('hasta_butonu', v => `<rect x="716" y="440" width="52" height="104" rx="22" fill="${c.f('#F4F7FB', v)}" stroke="${c.s(v)}" stroke-width="3"/><circle cx="742" cy="466" r="13" fill="${R.mavi}" stroke="${c.s(v)}" stroke-width="2.5"/>`);
    return s;
  }});

// ---------------------------------------------------------------- işitme cihazı (BTE, RIC, ITE, CIC)
CIZ.isitme_cihazi = (c, ay) => {
  const tip = String(ay.tip || 'BTE').toUpperCase(), cz = KR.cz;
  const ad = {ITC: L('ITC: kanal içi', 'ITC: in the canal'), BTE: L('BTE: kulak arkası', 'BTE: behind the ear'), RIC: L('RIC: alıcısı kanalda', 'RIC: receiver in canal'), ITE: L('ITE: kulak içi', 'ITE: in the ear'), CIC: L('CIC: tamamen kanal içi', 'CIC: completely in canal')}[tip] || tip;
  const kalipR = '#F1E6D8';
  const mik = (x, y, v) => `<circle cx="${x}" cy="${y}" r="11" fill="${c.f('#FFFFFF', v)}" stroke="${c.s(v)}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="4.5" fill="${c.s(v)}"/>`;
  const cip = (x, y, w, h, v) => { let d = ''; for (let i = 1; i < 5; i++) d += `<path d="M${x + i * w / 5} ${y - 6} L${x + i * w / 5} ${y} M${x + i * w / 5} ${y + h} L${x + i * w / 5} ${y + h + 6}" stroke="${c.s(v)}" stroke-width="2.5"/>`;
    return d + `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${c.f(R.lacivert, v * .6)}" stroke="${c.s(v)}" stroke-width="2"/><rect x="${x + w * .3}" y="${y + h * .3}" width="${w * .4}" height="${h * .4}" rx="2" fill="${R.mavi}" opacity=".8"/>`; };
  const pil = (x, y, r, v) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c.f(KR.metal, v)}" stroke="${c.s(v)}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="${r * .62}" fill="none" stroke="${c.s(v)}" stroke-width="1.5" opacity=".5"/>` + c.yazi(x, y + c.fs(7), '+', {px: 20, fw: 800, renk: R.lacivert});
  const alici = (x, y, w, h, v) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${c.f(R.mavi, v * .3)}" stroke="${c.s(v)}" stroke-width="2.5"/><path d="M${x + 6} ${y + h / 2} L${x + w - 6} ${y + h / 2}" stroke="#fff" stroke-width="2" opacity=".7"/>`;
  const dalga = (x, y, yon) => `<path d="M${x} ${y - 12} C ${x + yon * 10} ${y - 4} ${x + yon * 10} ${y + 4} ${x} ${y + 12} M${x + yon * 12} ${y - 20} C ${x + yon * 26} ${y - 7} ${x + yon * 26} ${y + 7} ${x + yon * 12} ${y + 20}" fill="none" stroke="${R.mavi}" stroke-width="3" stroke-linecap="round" opacity=".8"/>`;
  const icte = ['ITE', 'ITC', 'CIC'].includes(tip), ex = icte ? 120 : 24;
  const etiket = () => `<rect x="${ex}" y="20" width="${n1(olc(ad, '700 21px Outfit') / c.k + c.fs(30))}" height="${n1(c.fs(38))}" rx="${n1(c.fs(19))}" fill="${R.lacivert}"/>` + c.yazi(ex + c.fs(15), 20 + c.fs(26), ad, {a: 'start', px: 21, fw: 700, renk: '#fff', ff: 'Outfit'});
  const kanal = (x2) => `<path d="M150 232 C 300 222 460 206 ${x2} 214 M${x2} 382 C 470 382 300 380 150 372" fill="none" stroke="${KR.ince}" stroke-width="3" stroke-dasharray="10 8"/><path d="M150 232 Q 136 300 150 372" fill="none" stroke="${KR.zar}" stroke-width="6" stroke-linecap="round"/>`
    + c.yazi(160, 212, L('kulak yolu', 'ear canal'), {a: 'start', px: 17, fw: 500, renk: KR.ince}) + c.yazi(140, 404, L('kulak zarı', 'eardrum'), {a: 'start', px: 17, fw: 500, renk: KR.ince});
  let tanim;
  if (tip === 'RIC') tanim = {a: {mikrofon: [508, 134], islemci: [506, 226], alici: [262, 330], pil: [506, 318], kalip: [204, 344]},
    svg: () => `${etiket()}<path d="M470 118 C 420 56 346 66 326 120 C 312 160 300 250 286 318" fill="none" stroke="#5E6F88" stroke-width="4.5" stroke-linecap="round"/>`
      + c.P('kalip', v => `<path d="M228 316 C 196 312 176 330 176 344 C 176 358 196 376 228 372 Z" fill="${c.f('#FFFFFF', v)}" fill-opacity=".9" stroke="${c.s(v)}" stroke-width="3" stroke-linejoin="round"/>`)
      + c.P('alici', v => alici(226, 320, 72, 48, v)) + dalga(160, 344, -1)
      + `<path d="M482 106 C 536 100 562 140 558 210 C 554 280 540 330 516 364 C 500 388 464 384 462 354 C 460 322 478 282 480 232 C 482 182 456 152 456 130 C 456 116 466 108 482 106 Z" fill="#F4F7FB" stroke="${cz}" stroke-width="3" stroke-linejoin="round"/>`
      + c.P('mikrofon', v => mik(508, 134, v)) + dalga(536, 110, 1) + c.P('islemci', v => cip(484, 200, 46, 52, v)) + c.P('pil', v => pil(506, 318, 24, v))};
  else if (tip === 'ITE') tanim = {a: {mikrofon: [598, 190], islemci: [470, 270], alici: [236, 316], pil: [592, 292], kalip: [360, 380]},
    svg: () => etiket() + c.P('kalip', v => `<path d="M560 124 C 626 150 646 256 606 338 C 576 400 504 424 440 404 L 360 380 C 300 364 244 352 206 342 C 178 334 178 298 204 292 C 252 282 300 268 340 248 C 382 176 470 96 560 124 Z" fill="${c.f(kalipR, v)}" stroke="${c.s(v)}" stroke-width="3" stroke-linejoin="round"/>`)
      + `<path d="M560 124 C 626 150 646 256 606 338" fill="none" stroke="${cz}" stroke-width="9" stroke-linecap="round" opacity=".85"/>`
      + c.P('mikrofon', v => mik(598, 190, v)) + dalga(626, 176, 1) + c.P('pil', v => pil(588, 292, 26, v)) + c.P('islemci', v => cip(444, 244, 56, 52, v))
      + `<path d="M444 270 C 380 280 300 300 262 312" fill="none" stroke="#5E6F88" stroke-width="2.5"/>` + c.P('alici', v => alici(214, 302, 50, 30, v)) + dalga(168, 317, -1)};
  else if (tip === 'ITC') tanim = {a: {mikrofon: [556, 214], islemci: [444, 272], alici: [246, 300], pil: [548, 300], kalip: [400, 352]},
    svg: () => etiket() + kanal(430)
      + c.P('kalip', v => `<path d="M520 170 C 576 190 590 270 560 330 C 540 370 490 384 440 372 L 330 346 C 286 336 250 330 222 324 C 200 318 200 290 222 286 C 260 280 300 270 340 256 C 380 210 450 150 520 170 Z" fill="${c.f(kalipR, v)}" stroke="${c.s(v)}" stroke-width="3" stroke-linejoin="round"/>`)
      + `<path d="M520 170 C 576 190 590 270 560 330" fill="none" stroke="${cz}" stroke-width="8" stroke-linecap="round" opacity=".85"/>`
      + c.P('mikrofon', v => mik(556, 214, v)) + dalga(582, 200, 1) + c.P('pil', v => pil(546, 300, 21, v)) + c.P('islemci', v => cip(420, 252, 48, 42, v))
      + `<path d="M420 274 C 360 282 300 292 266 298" fill="none" stroke="#5E6F88" stroke-width="2.5"/>` + c.P('alici', v => alici(222, 288, 44, 26, v)) + dalga(196, 301, -1)};
  else if (tip === 'CIC') tanim = {a: {mikrofon: [546, 262], islemci: [450, 292], alici: [312, 300], pil: [528, 316], kalip: [380, 334]},
    svg: () => etiket() + kanal(640)
      + c.P('kalip', v => `<path d="M522 222 C 562 238 568 302 542 332 C 522 352 482 354 452 346 L 302 322 C 272 318 264 292 292 286 L 442 252 C 472 232 497 216 522 222 Z" fill="${c.f(kalipR, v)}" stroke="${c.s(v)}" stroke-width="3" stroke-linejoin="round"/>`)
      + `<path d="M548 282 C 580 286 600 300 616 316" fill="none" stroke="#5E6F88" stroke-width="3" stroke-linecap="round"/><circle cx="620" cy="320" r="6" fill="#5E6F88"/>`
      + c.P('mikrofon', v => mik(544, 262, v)) + c.P('pil', v => pil(526, 314, 16, v)) + c.P('islemci', v => cip(432, 280, 40, 30, v)) + c.P('alici', v => alici(300, 290, 34, 22, v)) + dalga(270, 300, -1)};
  else tanim = {a: {mikrofon: [500, 98], islemci: [508, 230], alici: [466, 126], pil: [497, 404], kalip: [218, 362]},
    svg: () => etiket() + c.P('kalip', v => boru('M452 86 C 420 46 356 48 338 92 C 330 112 330 132 336 150', 12, c.f('#F4F7FB', v), c.s(v), 2.5) + boru('M336 150 C 320 210 282 262 262 322', 6, c.f('#F4F7FB', v), c.s(v), 2)
        + `<path d="M200 300 C 230 280 290 290 300 330 C 310 370 280 410 240 410 C 214 410 196 396 186 378 L 140 372 C 124 370 120 350 136 344 L 186 336 C 186 322 190 308 200 300 Z" fill="${c.f(kalipR, v)}" stroke="${c.s(v)}" stroke-width="3" stroke-linejoin="round"/>`) + dalga(112, 358, -1)
      + `<path d="M470 70 C 530 60 570 110 566 200 C 562 300 548 380 520 440 C 500 480 450 478 446 440 C 444 400 470 330 474 250 C 478 180 440 130 438 100 C 436 82 450 72 470 70 Z" fill="#F4F7FB" stroke="${cz}" stroke-width="3" stroke-linejoin="round"/>`
      + c.P('mikrofon', v => mik(500, 98, v) + mik(532, 126, v)) + dalga(560, 92, 1) + c.P('alici', v => alici(450, 112, 32, 36, v)) + c.P('islemci', v => cip(484, 204, 50, 56, v)) + c.P('pil', v => pil(497, 404, 28, v))};
  return Object.assign(icte ? {w: 560, h: 420, vx: 110, vy: 6} : {w: 760, h: 500}, {yer: {mikrofon: 'sag', islemci: 'sag', pil: 'sag', alici: 'sol', kalip: 'sol'}}, tanim);
};

// ---------------------------------------------------------------- gerçek kulak ölçümü (REM): prob tüp düzeneği
CIZ.rem_duzenegi = c => ({w: 900, h: 520,
  a: {hoparlor: [70, 196], isitme_cihazi: [306, 66], referans_mikrofonu: [252, 380], prob_tupu: [620, 288], kulak_kanali: [520, 238], timpanik_membran: [728, 262]},
  yer: {hoparlor: 'sol', isitme_cihazi: 'sol', referans_mikrofonu: 'sol', prob_tupu: 'sag', kulak_kanali: 'sag', timpanik_membran: 'sag'},
  svg: () => {
    const cz = KR.cz;
    let s = `<path d="M318 20 C 500 10 700 30 862 22 C 884 160 874 360 880 500 C 700 512 500 500 318 506 Z" fill="${KR.doku}"/>
      <path d="M318 20 C 312 120 322 190 316 230 M316 296 C 310 400 322 460 318 506" fill="none" stroke="${cz}" stroke-width="3" stroke-linecap="round"/>
      <path d="M738 206 C 770 186 830 190 846 222 L 850 344 C 826 376 770 378 744 356 Z" fill="#fff" stroke="${cz}" stroke-width="2.5"/>`;
    s += c.yazi(800, 404, L('orta kulak', 'middle ear'), {px: 16, fw: 500, renk: KR.ince});
    // kulak kepçesi (kesit)
    s += `<g transform="translate(141 20) scale(.85)"><path d="M210 138 C 186 60 96 34 54 104 C 30 146 34 220 52 280 C 66 330 92 370 100 410 C 106 446 106 488 138 500 C 172 512 200 486 208 440 Z" fill="${KR.deri}" stroke="${cz}" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M196 160 C 176 98 112 80 82 128 C 66 158 68 214 84 262 C 96 300 118 330 128 360" fill="none" stroke="${KR.ince}" stroke-width="3" stroke-linecap="round"/></g>`;
    // kulak kanalı
    s += c.P('kulak_kanali', v => `<path d="M300 232 C 420 226 560 236 720 228 Q 738 262 732 300 C 560 298 420 302 300 294 Z" fill="${c.f('#FFFFFF', v)}"/>
      <path d="M296 232 C 420 226 560 236 720 228 M732 300 C 560 298 420 302 296 294" fill="none" stroke="${c.s(v)}" stroke-width="3" stroke-linecap="round"/>`);
    s += c.P('timpanik_membran', v => `<path d="M720 228 Q 740 262 732 300" fill="none" stroke="${c.s(v)}" stroke-width="8" stroke-linecap="round"/><path d="M720 228 Q 740 262 732 300" fill="none" stroke="${c.f(KR.zar, v)}" stroke-width="3.5" stroke-linecap="round"/>`);
    // hoparlör ve ses dalgaları
    s += c.P('hoparlor', v => `<rect x="18" y="186" width="92" height="150" rx="16" fill="${c.f('#F4F7FB', v)}" stroke="${c.s(v)}" stroke-width="3"/><circle cx="64" cy="244" r="30" fill="${c.f('#E3EBF5', v)}" stroke="${c.s(v)}" stroke-width="3"/><circle cx="64" cy="244" r="10" fill="${c.s(v)}"/><circle cx="64" cy="306" r="11" fill="none" stroke="${c.s(v)}" stroke-width="2.5"/>`);
    const tt = .5 + .35 * Math.sin(c.t * 4);
    s += `<g fill="none" stroke="${R.mavi}" stroke-width="3.5" stroke-linecap="round" opacity="${tt.toFixed(2)}"><path d="M126 222 C 136 236 136 254 126 268 M146 208 C 162 230 162 260 146 282 M166 194 C 188 226 188 266 166 296"/></g>`;
    // işitme cihazı (kulak arkası gövde, kablo ve kubbe kanalda)
    s += c.P('isitme_cihazi', v => `<path d="M296 150 C 292 196 300 236 330 254 L 420 258" fill="none" stroke="${c.s(v, '#5E6F88')}" stroke-width="4" stroke-linecap="round"/>
      <path d="M300 40 C 330 34 346 60 344 100 C 342 130 330 156 312 162 C 298 166 288 156 290 140 C 292 110 284 76 284 58 C 284 46 290 42 300 40 Z" fill="${c.f('#F4F7FB', v)}" stroke="${c.s(v)}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="418" y="246" width="34" height="22" rx="6" fill="${c.f(R.mavi, v * .3)}" stroke="${c.s(v)}" stroke-width="2.5"/><path d="M452 240 C 476 240 484 252 484 257 C 484 262 476 274 452 274 Z" fill="${c.f('#FFFFFF', v)}" stroke="${c.s(v)}" stroke-width="2.5"/>`);
    // prob tüp modülü + referans mikrofonu, tüp kanal tabanından zara yakın
    s += c.P('prob_tupu', v => boru('M290 380 C 324 366 322 300 344 290 L 694 290', 4, c.f('#9FD0F8', v), c.s(v), 1.8) + `<circle cx="696" cy="290" r="5" fill="#fff" stroke="${c.s(v)}" stroke-width="2.5"/>`);
    s += c.P('referans_mikrofonu', v => `<rect x="226" y="350" width="70" height="56" rx="14" fill="${c.f('#F4F7FB', v)}" stroke="${c.s(v)}" stroke-width="3"/><circle cx="246" cy="378" r="10" fill="#fff" stroke="${c.s(v)}" stroke-width="2.5"/><circle cx="246" cy="378" r="4" fill="${c.s(v)}"/>`);
    s += `<path d="M696 306 L 696 318 M726 306 L 726 318 M696 312 L 726 312" stroke="${R.mavi}" stroke-width="2" stroke-linecap="round"/>` + c.yazi(711, 340, '~5 mm', {px: 15, fw: 700, renk: R.mavi});
    return s;
  }});

// ---------------------------------------------------------------- koklear implant
CIZ.koklear_implant = c => {
  const ox = -719, oy = -283, sc = 2.1;
  return {w: 900, h: 580,
    a: {dis_islemci: [404, 262], verici_bobin: [560, 112], alici_uyarici: [700, 176], elektrot_dizisi: [602, 446], isitme_siniri: [820, 456]},
    yer: {dis_islemci: 'sol', verici_bobin: 'sol', alici_uyarici: 'sag', elektrot_dizisi: 'sol', isitme_siniri: 'sag'},
    svg: () => {
      const cz = KR.cz;
      let s = `<rect x="20" y="20" width="860" height="540" rx="36" fill="${KR.deri}"/>`;
      s += `<g transform="translate(${ox} ${oy}) scale(${sc})"><path d="${KULAK_YAN}" fill="#E3EBF5" stroke="${cz}" stroke-width="${3 / sc}" stroke-linejoin="round"/><path d="M472 236 C 496 236 506 262 500 284 C 496 298 488 304 484 316" fill="none" stroke="${KR.ince}" stroke-width="${2.5 / sc}" stroke-linecap="round"/><ellipse cx="466" cy="286" rx="7" ry="9" fill="${cz}" opacity=".75"/></g>`;
      // iç kulak penceresi
      s += `<circle cx="600" cy="430" r="118" fill="${KR.kemik}" stroke="${KR.ince}" stroke-width="3" stroke-dasharray="9 7"/>` + c.yazi(600, 576, L('iç kulak', 'inner ear'), {px: 17, fw: 500, renk: KR.ince});
      s += c.P('isitme_siniri', v => `<path d="M600 418 C 680 410 760 420 880 440 L 880 476 C 760 462 680 452 606 444 Z" fill="${c.f(KR.sinir, v)}" stroke="${c.s(v)}" stroke-width="2.5" stroke-linejoin="round"/>`);
      const sp = sarmal(600, 430, 84, 16, 2.25, Math.PI * .9);
      s += boru(sp, 20, KR.sivi, cz, 2.5);
      // alıcı-uyarıcı (deri altında) ve elektrot kablosu
      s += c.P('alici_uyarici', v => `<rect x="586" y="138" width="170" height="78" rx="34" fill="${c.f('#DCE6F3', v)}" stroke="${c.s(v)}" stroke-width="3" stroke-dasharray="7 5"/><circle cx="560" cy="150" r="58" fill="none" stroke="${c.s(v, KR.ince)}" stroke-width="3" stroke-dasharray="7 5"/>
        <rect x="660" y="160" width="62" height="34" rx="8" fill="${c.f('#B9C8DA', v)}"/>`);
      s += c.P('elektrot_dizisi', v => { const pts = [], n = 150; for (let i = 0; i <= n; i++) { const u = i / n * .6, a = Math.PI * .9 + u * 2.25 * 2 * Math.PI, r = 84 + (16 - 84) * u; pts.push([600 + r * Math.cos(a), 430 + r * Math.sin(a)]); }
        let d = `<path d="M690 216 C 720 280 560 300 520 352 C 506 370 510 400 ${n1(pts[0][0])} ${n1(pts[0][1])}" fill="none" stroke="${c.s(v)}" stroke-width="6" stroke-linecap="round"/><path d="${yolDiz(pts)}" fill="none" stroke="${c.s(v)}" stroke-width="5" stroke-linecap="round"/>`;
        for (let i = 6; i <= n; i += 12) d += `<circle cx="${n1(pts[i][0])}" cy="${n1(pts[i][1])}" r="3.6" fill="#fff" stroke="${c.s(v)}" stroke-width="1.5"/>`;
        return d; });
      // dış işlemci (kulak arkası) ve verici bobin
      s += `<path d="M416 120 C 460 114 500 112 518 130" fill="none" stroke="#5E6F88" stroke-width="5" stroke-linecap="round"/>`;
      s += c.P('dis_islemci', v => `<g transform="translate(30 0)"><path d="M372 112 C 418 100 444 140 440 220 C 436 300 424 360 404 400 C 390 428 356 424 356 396 C 356 360 374 300 374 240 C 374 180 342 150 342 132 C 342 120 356 114 372 112 Z" fill="${c.f('#F4F7FB', v)}" stroke="${c.s(v)}" stroke-width="3" stroke-linejoin="round"/>
        <circle cx="388" cy="134" r="9" fill="#fff" stroke="${c.s(v)}" stroke-width="2.5"/><circle cx="388" cy="134" r="3.5" fill="${c.s(v)}"/>
        ${boru('M350 130 C 330 110 300 108 292 128', 8, c.f('#F4F7FB', v), c.s(v), 2)}</g>`);
      s += c.P('verici_bobin', v => `<circle cx="560" cy="150" r="46" fill="${c.f('#FFFFFF', v)}" stroke="${c.s(v)}" stroke-width="3.5"/><circle cx="560" cy="150" r="32" fill="none" stroke="${c.s(v, KR.ince)}" stroke-width="2.5"/><circle cx="560" cy="150" r="11" fill="${R.lacivert}"/>`);
      return s;
    }};
};

// ============================================================ ikon kütüphanesi
// IKON[ad](boyut, renk, ana): 48 x 48 ızgarada çizilmiş sade çizgi ikonları (bu proje için elle çizildi, dış paket yok).
// Lacivert ana çizgi, renk: vurgu (varsayılan mavi). Öğe türleri: n lacivert çizgi, m vurgu çizgisi, nf/mf açık dolgulu çizgi,
// w beyaz dolgulu çizgi, F vurgu dolgu, N lacivert dolgu, sf/S sarı, gf yeşil, kf kırmızı.
const _o = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
const _e = (cx, cy, rx, ry) => `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`;
const _r = (x, y, w, h, r) => `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
const KULAK_IK = 'M17.5 36 C17 39.5 19.5 42.5 23 42.5 C26.5 42.5 28.5 40 29.5 37 C30.5 34 32 31.5 34.5 29 C37.5 26 40 22.5 40 17.5 C40 10 33.5 4.5 26 4.5 C18 4.5 12 10.5 12 18.5 C12 22 13 25 14.5 27.5';
const KULAK_IC = 'M19.5 18.5 C19.5 14 23 11 27 11 C31 11 34 14 34 17.5 C34 21 31.5 23 29.5 24.5 C27.5 26 26.5 28 26.5 31';
const KISI_GOVDE = 'M10 44 C10 34 16 27.5 24 27.5 C32 27.5 38 34 38 44';
const HOPARLOR = 'M7 18 H14 L24 9 V39 L14 30 H7 Z';
const IKS = {
  kulak: [['nf', KULAK_IK], ['m', KULAK_IC], ['n', 'M21.5 27 C23 25.5 25.5 26 26 28']],
  kulaklik: [['n', 'M8 28 V24 C8 15 15.2 8 24 8 C32.8 8 40 15 40 24 V28'], ['mf', _r(5, 25, 9, 15, 3.5)], ['mf', _r(34, 25, 9, 15, 3.5)]],
  insert_kulaklik: [['nf', _r(5, 7, 15, 11, 3)], ['n', 'M12.5 18 V24 C12.5 29 16 31 21 31 H27'], ['mf', 'M27 26 H34 C37.5 26 40 28.2 40 31 C40 33.8 37.5 36 34 36 H27 Z'], ['m', 'M31 26 V36 M35 26.5 V35.5']],
  kemik_vibratoru: [['n', 'M9 41 C7 26 12 9 25 8 C35 7.5 40 15 39 24'], ['mf', _r(33, 24, 11, 13, 3.5)], ['m', 'M28.5 27 C26.5 29 26.5 32 28.5 34 M24 24.5 C20.5 28 20.5 33 24 36.5']],
  odyometre: [['nf', _r(4, 9, 40, 30, 4)], ['w', _r(8, 13, 20, 13, 2)], ['m', 'M10.5 17 L15 18.5 L19.5 18 L25 23'], ['n', _o(35, 18, 3.5) + 'M35 18 L36.8 16'], ['n', _o(35, 30, 3.5)], ['F', _r(8, 30, 6, 4, 1.5)], ['n', 'M18 32 H26']],
  hasta_butonu: [['nf', 'M17 22 C17 20 18.5 18.5 20.5 18.5 H27.5 C29.5 18.5 31 20 31 22 V38 C31 41.5 28 44 24 44 C20 44 17 41.5 17 38 Z'], ['F', 'M19 18.5 C19 13.5 29 13.5 29 18.5 Z'], ['m', 'M13 9 L10 6 M24 7.5 V3.5 M35 9 L38 6']],
  hasta: [['n', _o(24, 15, 6.5)], ['nf', KISI_GOVDE], ['m', 'M15 16 C15 9 19 5.5 24 5.5 C29 5.5 33 9 33 16'], ['F', _r(13, 13, 4, 7, 2)], ['F', _r(31, 13, 4, 7, 2)]],
  bebek: [['nf', _o(24, 20, 12)], ['N', _o(19.5, 19.5, 1.5) + _o(28.5, 19.5, 1.5)], ['n', 'M20 25 C22.5 27.5 25.5 27.5 28 25'], ['m', 'M21 8.5 C21.5 5.5 25 5 26 7.5 C26.5 9 25 10 24 9.5'], ['n', 'M14 44 C14 38 18.5 34.5 24 34.5 C29.5 34.5 34 38 34 44']],
  cocuk: [['n', _o(21, 14, 6.5)], ['nf', 'M10 44 C10 34.5 14.5 28 21 28 C27.5 28 32 34.5 32 44'], ['mf', _o(38, 38, 5.5)], ['m', 'M33 36 C35.5 37 38.5 37 43 35.5 M36 33 C36.5 36 37 40 36.5 43']],
  yasli: [['n', _o(21, 12, 6.5)], ['nf', 'M10 44 C10 33 14 25.5 21.5 25.5 C27 25.5 30 29 31 33'], ['m', 'M35 30 V44 M35 30 C35 26.5 39.5 26.5 39.5 30']],
  hekim: [['n', _o(24, 13, 6.5)], ['nf', KISI_GOVDE], ['n', 'M20.5 27.8 L24 33 L27.5 27.8'], ['m', 'M17 29 V34.5 C17 38.5 21.5 39.5 23 36.5 M31 29 V32'], ['m', _o(31, 34.5, 2.5)]],
  odyolog: [['n', _o(24, 14, 6.5)], ['nf', KISI_GOVDE], ['m', 'M16 14 C16 7.5 19.5 4.5 24 4.5 C28.5 4.5 32 7.5 32 14 M32 16 C32 20.5 30 22 26.5 22'], ['F', _r(14, 11.5, 4, 7, 2)], ['F', _r(30, 11.5, 4, 7, 2)]],
  beyin: [['nf', 'M24 10 C20.5 6 13.5 6.5 12.5 12.5 C7 13.5 5 19.5 8 24 C5 28.5 8 35.5 13.5 35.5 C14.5 40.5 20.5 42.5 24 38.5 C27.5 42.5 33.5 40.5 34.5 35.5 C40 35.5 43 28.5 40 24 C43 19.5 41 13.5 35.5 12.5 C34.5 6.5 27.5 6 24 10 Z'],
    ['m', 'M24 10 V38.5 M17 17.5 C19.5 19.5 19.5 23 17 25 M31 17.5 C28.5 19.5 28.5 23 31 25 M14 30 C16.5 28.5 19 29.5 20 32 M34 30 C31.5 28.5 29 29.5 28 32']],
  noron: [['nf', _o(17, 22, 6.5)], ['N', _o(17, 22, 2)], ['n', 'M12 17.5 L6 12 M6 12 L3 13 M6 12 L6 8.5 M12.5 27 L7 32.5 M17 15.5 V9 M17 9 L14.5 6.5 M17 9 L19.5 6.5'],
    ['m', 'M23.5 22 C30 22 31.5 30 37.5 32'], ['m', 'M37.5 32 L43 28.5 M37.5 32 L43.5 33.5 M37.5 32 L41 37.5'], ['F', _r(26.5, 21, 4, 3, 1.5)]],
  ses_dalgasi: [['n', 'M4 24 H44'], ['m', 'M4 24 C6.5 12 10.5 12 13 24 S19.5 36 22 24 S28.5 12 31 24 S37.5 36 40 24 C41 20 42.5 18.5 44 18.5']],
  hoparlor: [['nf', HOPARLOR], ['m', 'M30 18 C33 21 33 27 30 30 M35 13 C41 19 41 29 35 35']],
  mikrofon: [['mf', _r(17, 4, 14, 24, 7)], ['n', 'M11 21 C11 29.5 17 34.5 24 34.5 C31 34.5 37 29.5 37 21 M24 34.5 V43 M17 43.5 H31'], ['m', 'M17 14 H21 M17 19 H21']],
  isitme_cihazi: [['nf', 'M30 5.5 C37 5.5 40.5 11.5 38.5 19.5 L34.5 31.5 C33.5 35 29.5 35 28.5 31.5 L24.5 14 C23.5 9 26 5.5 30 5.5 Z'], ['m', 'M25 12 C16.5 12 12 19.5 12 27.5 C12 32.5 14 35.5 17 37'], ['mf', _r(14, 35, 9, 8, 3.5)], ['N', _o(31, 25, 1.6)]],
  koklear_implant: [['nf', _o(13, 13, 7.5)], ['F', _o(13, 13, 2.5)], ['n', 'M20 16 C26 18 29 22 30 26.5'], ['m', 'M30 26.5 C36 26 40.5 30 39.5 35.5 C38.5 40.5 32 42.5 28 39.5 C24.5 37 25.5 31.5 30 31.5 C33 31.5 34.5 34.5 32.5 36.5']],
  otoskop: [['nf', _r(9, 23, 10, 21, 3.5)], ['n', _r(6, 12, 22, 11, 3.5)], ['mf', 'M28 14 L40 16 V19 L28 21 Z'], ['m', 'M43.5 12 L45.5 10 M44.5 17.5 H47 M43.5 23 L45.5 25'], ['n', 'M11.5 29 H16.5']],
  diyapazon: [['n', 'M18 5 V21 C18 26.5 20.5 29.5 24 29.5 C27.5 29.5 30 26.5 30 21 V5 M24 29.5 V44'], ['F', _o(24, 44, 2.2)], ['m', 'M11.5 9 C9.5 12.5 9.5 16.5 11.5 20 M36.5 9 C38.5 12.5 38.5 16.5 36.5 20']],
  timpanometre_prob: [['nf', _r(5, 17, 24, 14, 6)], ['mf', 'M29 19.5 L36 21 V27 L29 28.5 Z'], ['mf', 'M36 19.5 C40.5 19.5 43 21.5 43 24 C43 26.5 40.5 28.5 36 28.5 Z'], ['n', 'M5 24 C1.5 24 1.5 31 4 35'], ['N', _o(12, 24, 1.6) + _o(17, 24, 1.6) + _o(22, 24, 1.6)]],
  gurultu: [['m', 'M3 24 L6.5 16 L9.5 31 L13 11 L16.5 35 L19.5 18 L23 29 L26.5 9 L29.5 37 L33 15 L36.5 31 L39.5 20 L42.5 27 L45 24']],
  sessizlik: [['nf', HOPARLOR], ['m', 'M31 19 L41 29 M41 19 L31 29']],
  saat: [['nf', _o(24, 24, 18.5)], ['n', 'M24 13 V24 L31.5 28.5'], ['m', 'M24 7.5 V10 M40.5 24 H38 M24 40.5 V38 M7.5 24 H10'], ['N', _o(24, 24, 1.8)]],
  kronometre: [['nf', _o(24, 27, 16)], ['n', 'M20 5 H28 M24 5 V11 M36 14 L39 11'], ['m', 'M24 27 L30.5 18.5'], ['N', _o(24, 27, 1.8)], ['m', 'M24 15.5 V17.5 M35.5 27 H33.5 M12.5 27 H14.5']],
  takvim: [['nf', _r(6, 9, 36, 33, 4)], ['n', 'M6 18 H42 M15.5 5 V12.5 M32.5 5 V12.5'], ['F', _r(11, 23, 6, 5, 1.5)], ['m', _r(21, 23, 6, 5, 1.5) + _r(31, 23, 6, 5, 1.5) + _r(11, 32, 6, 5, 1.5) + _r(21, 32, 6, 5, 1.5)]],
  grafik: [['n', 'M6 5 V42 H43'], ['nf', _r(12, 27, 6, 15, 1.5)], ['nf', _r(22, 19, 6, 23, 1.5)], ['mf', _r(32, 10, 6, 32, 1.5)]],
  odyogram: [['nf', _r(5, 6, 38, 36, 3)], ['n', 'M5 17 H43 M5 28 H43 M17 6 V42 M30 6 V42', 'stroke-opacity=".35"'], ['m', 'M11 13 L20 16 L28 25 L37 33'], ['w', _o(11, 13, 2.8)], ['w', _o(20, 16, 2.8)], ['w', _o(28, 25, 2.8)], ['w', _o(37, 33, 2.8)]],
  tablo: [['nf', _r(6, 8, 36, 32, 3.5)], ['F', 'M6 11.5 C6 9.5 7.5 8 9.5 8 H38.5 C40.5 8 42 9.5 42 11.5 V17 H6 Z'], ['n', 'M6 25 H42 M6 32.5 H42 M18 17 V40']],
  kontrol_listesi: [['nf', _r(9, 8, 30, 36, 4)], ['w', _r(17, 5, 14, 6.5, 2.5)], ['m', 'M14 20 L16.5 22.5 L21 17.5 M14 30 L16.5 32.5 L21 27.5'], ['n', 'M25.5 20 H34 M25.5 30 H34 M14.5 39 H34']],
  uyari: [['sf', 'M24 6 L43 39 C44 41 43 42.5 41 42.5 H7 C5 42.5 4 41 5 39 Z'], ['n', 'M24 18 V29'], ['N', _o(24, 35, 1.9)]],
  dogru: [['gf', _o(24, 24, 18.5)], ['g', 'M15.5 24.5 L21.5 30.5 L33 18']],
  yanlis: [['kf', _o(24, 24, 18.5)], ['k', 'M17 17 L31 31 M31 17 L17 31']],
  soru: [['nf', _o(24, 24, 18.5)], ['m', 'M18.5 19 C18.5 15 21 12.5 24.5 12.5 C28 12.5 30.5 15 30.5 18 C30.5 21.5 27 22.5 25 24.5 C24.2 25.3 24 26.5 24 28.5'], ['F', _o(24, 34.5, 2)]],
  ampul: [['sf', 'M24 5 C16 5 11 11 11 18 C11 23 14 26 16.5 29 C18 31 18.5 33 18.5 35 H29.5 C29.5 33 30 31 31.5 29 C34 26 37 23 37 18 C37 11 32 5 24 5 Z'], ['n', 'M19 39.5 H29 M21 43.5 H27'], ['m', 'M20.5 28.5 L24 21 L27.5 28.5']],
  kitap: [['nf', 'M24 12 C19 8 11 8 5 10 V39 C11 37 19 37 24 41 C29 37 37 37 43 39 V10 C37 8 29 8 24 12 Z'], ['n', 'M24 12 V41'], ['m', 'M10 17 C13 16 17 16 20 17.5 M10 23 C13 22 17 22 20 23.5 M28 17.5 C31 16 35 16 38 17 M28 23.5 C31 22 35 22 38 23']],
  okul: [['nf', 'M6 42 V22 L24 12 L42 22 V42 Z'], ['w', 'M20 42 V33 C20 31 21.5 29.5 23.5 29.5 H24.5 C26.5 29.5 28 31 28 33 V42'], ['n', 'M3 42.5 H45 M24 12 V3.5'], ['F', 'M24 3.5 L31.5 6 L24 8.5 Z'], ['m', _r(10, 27, 6, 6, 1.5) + _r(32, 27, 6, 6, 1.5)]],
  hastane: [['nf', _r(8, 10, 32, 32, 3.5)], ['F', 'M20.5 15 H27.5 V21 H33.5 V28 H27.5 V34 H20.5 V28 H14.5 V21 H20.5 Z'], ['n', 'M3.5 42.5 H44.5']],
  ev: [['nf', 'M11 20 V41 H37 V20'], ['n', 'M6 23 L24 8 L42 23'], ['mf', 'M20 41 V30.5 H28 V41']],
  is_yeri: [['nf', 'M5 42 V24 L15 18 V24 L25 18 V24 L35 18 V8 H42 V42 Z'], ['m', _r(10, 30, 5, 5, 1) + _r(20, 30, 5, 5, 1) + _r(30, 30, 5, 5, 1)], ['n', 'M3 42.5 H45'], ['m', 'M38.5 4.5 C37 3 38 1.5 39.5 2 M38.5 4.5 V8', 'stroke-opacity=".7"']],
  muzik: [['n', 'M17 34 V12 L38 7 V29'], ['mf', _e(13, 34.5, 4.8, 4)], ['mf', _e(34, 29.5, 4.8, 4)], ['m', 'M17 17.5 L38 12.5']],
  telefon: [['nf', 'M14 6 C11 6 7 9 7 13 C7 28 20 41 35 41 C39 41 42 37 42 34 L36 28 L30.5 31 C25 28.5 19.5 23 17 17.5 L20 12 Z'], ['m', 'M28 6.5 C33.5 7.5 39.5 13.5 40.5 19 M27.5 12.5 C30.5 13.5 33.5 16.5 34.5 19.5']],
  konusma: [['m', 'M38 17 H40 C41.7 17 43 18.3 43 20 V32 C43 33.7 41.7 35 40 35 H39 V41 L33 35 H22 C20.3 35 19 33.7 19 32 V30'], ['nf', 'M6 10 C6 7.8 7.8 6 10 6 H30 C32.2 6 34 7.8 34 10 V23 C34 25.2 32.2 27 30 27 H16 L9.5 33 V27 H10 C7.8 27 6 25.2 6 23 Z'], ['N', _o(14, 16.5, 1.7) + _o(20, 16.5, 1.7) + _o(26, 16.5, 1.7)]],
  kalabalik: [['n', _o(11, 18, 4.5) + _o(37, 18, 4.5)], ['n', 'M2.5 38 C2.5 30.5 6.5 26.5 11 26.5 C13.5 26.5 15.5 27.3 17 28.5 M45.5 38 C45.5 30.5 41.5 26.5 37 26.5 C34.5 26.5 32.5 27.3 31 28.5'], ['mf', _o(24, 16, 5.5)], ['mf', 'M13.5 43 C13.5 33 18 27.5 24 27.5 C30 27.5 34.5 33 34.5 43 Z']],
  dikkat: [['n', _o(24, 24, 16)], ['mf', _o(24, 24, 8.5)], ['F', _o(24, 24, 2.5)], ['n', 'M24 3.5 V10 M24 38 V44.5 M3.5 24 H10 M38 24 H44.5']],
  goz: [['nf', 'M4 24 C9 15 16 11 24 11 C32 11 39 15 44 24 C39 33 32 37 24 37 C16 37 9 33 4 24 Z'], ['mf', _o(24, 24, 7.5)], ['N', _o(24, 24, 3)]],
  dokunma: [['nf', 'M19.5 26 V11 C19.5 9 21 7.5 23 7.5 C25 7.5 26.5 9 26.5 11 V22.5 L34.5 24 C37.5 24.5 39.5 27 39 30 L37.5 38.5 C37 41.5 34.5 43.5 31.5 43.5 H25 C22.5 43.5 20.5 42.5 19 40.5 L12 31.5 C11 30 11.5 28 13 27.3 C14.5 26.5 16.3 27 17.5 28.3 L19.5 30.5'], ['m', 'M15.5 12 C15.5 7 19 3.5 23 3.5 C27 3.5 30.5 7 30.5 12']],
  denge: [['n', _o(24, 9, 4)], ['n', 'M24 13 V28 M24 28 L18.5 38.5 M24 28 L29.5 38.5'], ['m', 'M11 20.5 L24 16.5 L37 20.5'], ['m', 'M6 42 H42']],
  bas_donmesi: [['nf', _o(24, 30, 13)], ['m', 'M8 11 C8 6.5 40 6.5 40 11 C40 15.5 8 15.5 8 11'], ['F', _o(14, 13.5, 1.8) + _o(33, 8.5, 1.8)], ['n', 'M18.5 29 c0-1.5 2.5-1.5 2.5 0 c0 2.5-4.5 2.5-4.5 0 M27 29 c0-1.5 2.5-1.5 2.5 0 c0 2.5-4.5 2.5-4.5 0 M20.5 36.5 C22.5 35 25.5 35 27.5 36.5']],
  ilac: [['nf', 'M14 18 H24 V30 H14 C10.7 30 8 27.3 8 24 C8 20.7 10.7 18 14 18 Z', 'transform="rotate(-40 24 24)"'], ['mf', 'M24 18 H34 C37.3 18 40 20.7 40 24 C40 27.3 37.3 30 34 30 H24 Z', 'transform="rotate(-40 24 24)"'], ['n', _o(37, 39, 5) + 'M33.5 42.5 L40.5 35.5']],
  laboratuvar: [['nf', 'M19 6 H29 M21 6 V18 L10 38 C9 40.5 10.5 43 13 43 H35 C37.5 43 39 40.5 38 38 L27 18 V6'], ['F', 'M14.3 30 H33.7 L38 38 C39 40.5 37.5 43 35 43 H13 C10.5 43 9 40.5 10 38 Z'], ['w', _o(21, 36, 1.8) + _o(28, 38.5, 1.3)]],
  gen_dna: [['n', 'M15 4 C15 14 33 17 33 24 C33 31 15 34 15 44'], ['m', 'M33 4 C33 14 15 17 15 24 C15 31 33 34 33 44'], ['n', 'M17.5 9.5 H30.5 M20.5 14.5 H27.5 M20.5 33.5 H27.5 M17.5 38.5 H30.5', 'stroke-opacity=".55"']],
  kalp: [['nf', 'M24 41 C10 32 5 24 5 17 C5 11 10 7 15 7 C19 7 22 9 24 13 C26 9 29 7 33 7 C38 7 43 11 43 17 C43 24 38 32 24 41 Z'], ['m', 'M9 22 H17 L20 16 L24 28.5 L27 22 H39']],
  kan_damari: [['n', 'M3 15 C14 11 34 11 45 15 M3 33 C14 37 34 37 45 33'], ['mf', _e(13, 24, 5.5, 3.6)], ['mf', _e(25.5, 22, 5.5, 3.6)], ['mf', _e(37, 25.5, 5.5, 3.6)]],
  yasi_ilerleyen: [['n', 'M11 5 H37 M11 43 H37'], ['nf', 'M14.5 5 C14.5 15 22 19 22 24 C22 29 14.5 33 14.5 43 H33.5 C33.5 33 26 29 26 24 C26 19 33.5 15 33.5 5'], ['F', 'M17.5 11 H30.5 C29.5 15 25.5 18 24 19.5 C22.5 18 18.5 15 17.5 11 Z'], ['F', 'M17 43 C18 37 22 35 24 34 C26 35 30 37 31 43 Z']],
  kulak_tikali: [['nf', KULAK_IK], ['n', KULAK_IC], ['F', _e(25, 28.5, 4, 3.4)], ['k', 'M36 5 L44 13 M44 5 L36 13']],
  akinti: [['nf', KULAK_IK], ['n', KULAK_IC], ['mf', 'M38 22 C38 22 33.5 28 33.5 31 C33.5 33.5 35.5 35.5 38 35.5 C40.5 35.5 42.5 33.5 42.5 31 C42.5 28 38 22 38 22 Z'], ['F', 'M41 38.5 C41 38.5 39 41 39 42.5 C39 43.6 39.9 44.5 41 44.5 C42.1 44.5 43 43.6 43 42.5 C43 41 41 38.5 41 38.5 Z']],
  agri: [['kf', 'M27 4 L12 26.5 H22.5 L19.5 44 L36 19.5 H25.5 Z']],
  enfeksiyon: [['nf', _o(24, 24, 10.5)], ['n', 'M24 13.5 V7 M24 34.5 V41 M13.5 24 H7 M34.5 24 H41 M16.6 16.6 L12 12 M31.4 31.4 L36 36 M31.4 16.6 L36 12 M16.6 31.4 L12 36'],
    ['F', _o(24, 5.5, 2.2) + _o(24, 42.5, 2.2) + _o(5.5, 24, 2.2) + _o(42.5, 24, 2.2) + _o(11, 11, 2.2) + _o(37, 37, 2.2) + _o(37, 11, 2.2) + _o(11, 37, 2.2)], ['m', _o(20.5, 21.5, 2) + _o(27.5, 27, 2.5)]],
  tarama: [['nf', _o(20, 20, 13)], ['n', 'M29.5 29.5 L42 42', 'stroke-width="1.6"'], ['m', 'M13.5 20 L18 24.5 L26.5 15.5']],
  rapor: [['nf', 'M11 5 H29 L37 13 V43 H11 Z'], ['n', 'M29 5 V13 H37'], ['m', 'M16 21 H32 M16 27 H32 M16 33 H25'], ['F', _o(31.5, 37, 3.5)]],
  yazilim: [['nf', _r(4, 7, 40, 27, 3.5)], ['n', 'M18 42 H30 M24 34 V42'], ['m', 'M17 15.5 L12.5 20.5 L17 25.5 M31 15.5 L35.5 20.5 L31 25.5 M26.5 14 L21.5 27']],
};
IKS.ipucu = IKS.ampul; IKS.kulaklik_insert = IKS.insert_kulaklik; IKS.yasli_kisi = IKS.yasli; IKS.doktor = IKS.hekim; IKS.virus = IKS.enfeksiyon;
IKS.dna = IKS.gen_dna; IKS.zaman = IKS.saat; IKS.isitme_kaybi = IKS.kulak_tikali; IKS.vertigo = IKS.bas_donmesi; IKS.fabrika = IKS.is_yeri;
function ikonCiz(ad, px = 64, renk = R.mavi, ana = R.lacivert) {
  const t = IKS[ad] || IKS.soru, sw = Math.min(4.6, Math.max(2.4, px * .046)) * 48 / px;
  const beyaz = String(ana).toLowerCase() === '#ffffff' || ana === '#fff';
  const acik = beyaz ? 'rgba(255,255,255,.2)' : karis(renk.length === 7 ? renk : R.mavi, '#FFFFFF', .84);
  const RNK = {n: [null, ana], m: [null, renk], nf: [acik, ana], mf: [acik, renk], w: [beyaz ? 'none' : '#FFFFFF', ana], F: [renk, null], N: [ana, null],
    sf: [beyaz ? acik : '#FFF1D2', ana], S: [R.sari, null], gf: [beyaz ? acik : '#E3F6EC', beyaz ? ana : R.basari], g: [null, beyaz ? ana : R.basari],
    kf: [beyaz ? acik : '#FDE6E7', beyaz ? ana : R.sag_kulak], k: [null, beyaz ? ana : R.sag_kulak]};
  const ic = t.map(([tur, d, ek]) => { const [dol, ciz] = RNK[tur] || RNK.n;
    let st = ciz ? ` stroke="${ciz}" stroke-width="${n1(sw * (/stroke-width="([\d.]+)"/.test(ek || '') ? +RegExp.$1 : 1))}" stroke-linecap="round" stroke-linejoin="round"` : '';
    return `<path d="${d}" fill="${dol || 'none'}"${st} ${(ek || '').replace(/stroke-width="[\d.]+"/, '')}/>`; }).join('');
  return `<svg width="${px}" height="${px}" viewBox="0 0 48 48" style="display:block;overflow:visible;flex:none">${ic}</svg>`;
}
const IKON = {};
Object.keys(IKS).forEach(k => IKON[k] = (px, renk, ana) => ikonCiz(k, px, renk, ana));
// ikon diski: açık mavi daire içinde ikon (kart ve madde başlarında)
const ikonDisk = (ad, px, o = {}) => `<div style="flex:none;width:${px}px;height:${px}px;border-radius:${o.kare ? Math.round(px * .26) + 'px' : '50%'};background:${o.zemin || '#E8F3FD'};${o.halka ? `box-shadow:inset 0 0 0 ${o.halka}px ${o.halkaRenk || R.mavi}` : ''};display:flex;align-items:center;justify-content:center">${ikonCiz(ad, Math.round(px * (o.oran || .62)), o.renk || R.mavi, o.ana || R.lacivert)}</div>`;

// ============================================================ yeni ders sahneleri (v2)
Object.assign(DERS, {
  ozet(s, sz, tl) {
    const satir = (m, i) => { const b = basl(sz, m.cumle, .5 + i * .35), q = yay(kis((tl - b - .2) / .5));
      return `<div style="display:flex;align-items:center;gap:30px;padding:24px 36px;margin-bottom:22px;${KART};border-radius:22px;${gir(tl, b, {dx: -30, dy: 0})}">
        <div style="flex:none;width:58px;height:58px;border-radius:50%;background:${R.basari};display:flex;align-items:center;justify-content:center;transform:scale(${q.toFixed(3)})">${tikSvg(36)}</div>
        <div style="font:500 40px/1.35 Inter;color:${R.metin}">${zengin(m.metin)}</div></div>`; };
    return `${ustEtiket(s, tl, L('ÖZET', 'SUMMARY'))}${sahneBasligi(Object.assign({baslik: L('Bu derste *öğrendiklerimiz*', 'What we *learned*')}, s), tl)}
     <div class="ab" style="left:120px;top:330px;width:1680px">${(s.maddeler || []).slice(0, 4).map(satir).join('')}</div>`;
  },

  test(s, sz, tl) {
    const c0 = sz.cumleler[0] || {b: .5, sure: 2}, sBas = c0.b + c0.sure, sSure = c0.bekle || 0;
    const cevap = sz.cumleler[1] ? sz.cumleler[1].b : 1e9, pc = ilerle(tl, cevap, .6);
    const ac = basl(sz, s.aciklama_cumle, cevap + .35);
    // soru: 64 px, gerekirse 56 px; en fazla 2 satır
    const soru = duz(s.soru); let px = 64; while (px > 52 && olc(soru, `700 ${px}px Outfit`) > 1680 * 1.9) px -= 4;
    const sat = olc(soru, `700 ${px}px Outfit`) > 1680 * .97 ? 2 : 1, ust = 170 + sat * px * 1.18 + 56;
    const ss = (s.secenekler || []).slice(0, 4), harf = 'ABCD';
    const sutun = ss.length === 3 ? 1 : 2, kh = 112, ara = 24, kw = sutun === 2 ? 828 : 1680;
    const kutu = (m, i) => { const b = c0.b + .35 + i * .3, dogru = i === s.dogru, x = 120 + (i % sutun) * (kw + ara), y = ust + Math.floor(i / sutun) * (kh + ara);
      const yesil = dogru ? pc : 0, soluk = dogru ? 1 : 1 - .55 * pc;
      return `<div class="ab" style="left:${x}px;top:${y}px;width:${kw}px;height:${kh}px;box-sizing:border-box;display:flex;align-items:center;gap:28px;padding:0 32px;background:${karis('#FFFFFF', '#E8F7EF', yesil)};border-radius:22px;box-shadow:0 18px 50px ${R.lacivert}12, inset 0 0 0 ${(1.5 + 2 * yesil).toFixed(2)}px ${karis(R.cizgi, R.basari, yesil)};${gir(tl, b, {dy: 22})};opacity:${(ilerle(tl, b) * soluk).toFixed(3)}">
        <div style="flex:none;width:62px;height:62px;border-radius:16px;background:${karis(R.lacivert, R.basari, yesil)};color:#fff;font:700 30px Inter;display:flex;align-items:center;justify-content:center">${yesil > .5 ? tikSvg(38) : harf[i]}</div>
        <div style="font:600 38px/1.25 Inter;color:${R.metin}">${zengin(m)}</div></div>`; };
    const alt = ust + Math.ceil(ss.length / sutun) * (kh + ara) + 14;
    // geri sayım halkası (soru cümlesinden sonraki bekleme süresince)
    let halka = '';
    if (sSure > 0) { const p = kis((tl - sBas) / sSure), go = ilerle(tl, sBas - .2, .4) * (1 - ilerle(tl, cevap - .25, .3)), kalan = Math.max(1, Math.ceil(sSure - (tl - sBas) - 1e-6)), r = 54, L2 = 2 * Math.PI * r;
      if (go > 0) halka = `<div class="ab" style="left:${960 - 70}px;top:${alt + 14}px;width:140px;height:140px;opacity:${go.toFixed(3)}">
        <svg width="140" height="140" viewBox="0 0 140 140"><circle cx="70" cy="70" r="${r}" fill="#fff" stroke="${R.cizgi}" stroke-width="10"/>
        <circle cx="70" cy="70" r="${r}" fill="none" stroke="${R.mavi}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${n1(L2)}" stroke-dashoffset="${n1(L2 * p)}" transform="rotate(-90 70 70)"/>
        <text x="70" y="89" text-anchor="middle" font-family="Outfit" font-weight="700" font-size="52" fill="${R.lacivert}">${tl < sBas ? Math.ceil(sSure) : kalan}</text></svg></div>`; }
    const acik = s.aciklama ? `<div class="ab" style="left:120px;top:${alt + 10}px;width:1680px;box-sizing:border-box;padding:24px 36px 26px 40px;${KART};border-radius:22px;border-left:8px solid ${R.basari};${gir(tl, ac)}">
       <div style="font:800 22px Inter;letter-spacing:.14em;color:${R.basari}">${L('AÇIKLAMA', 'EXPLANATION')}</div>
       <div style="font:500 34px/1.38 Inter;color:${R.metin};margin-top:8px">${zengin(s.aciklama)}</div></div>` : '';
    return `${ustEtiket(s, tl, L('KENDİNİ TEST ET', 'TEST YOURSELF'))}
     <div class="ab" style="left:120px;top:170px;width:1680px;font:700 ${px}px/1.18 Outfit;letter-spacing:-.015em;color:${R.metin};${gir(tl, c0.b > .3 ? Math.min(.15, c0.b) : .15)}">${vurgu(s.soru || '')}</div>
     ${ss.map(kutu).join('')}${halka}${acik}`;
  },

  ipucu(s, sz, tl) {
    const b = basl(sz, s.cumle, .35), ust = s.baslik ? 340 : 250;
    return `${s.bolum ? bolumEtiketi(s, tl) : ''}${s.baslik ? sahneBasligi(s, tl) : ''}
     <div class="ab" style="left:120px;top:${ust}px;width:1680px;box-sizing:border-box;padding:56px 64px 58px 72px;${KART};overflow:hidden;${gir(tl, b, {olcek: .96})}">
       <div class="ab" style="left:0;top:0;bottom:0;width:12px;background:${R.sari}"></div>
       <div style="display:flex;gap:48px;align-items:flex-start">${ipucuSimge(132)}
         <div style="flex:1;padding-top:6px">${ipucuEtiket(24)}
           <div style="font:600 48px/1.38 Outfit;color:${R.metin};margin-top:26px">${zengin(s.metin || '')}</div></div></div></div>`;
  },

  tablo(s, sz, tl) {
    const sut = (s.sutunlar || []).slice(0, 4), sat = (s.satirlar || []).slice(0, 7), n = sut.length || 1;
    const rh = sat.length <= 5 ? 74 : sat.length === 6 ? 68 : 62, hh = 70, fh = '700 28px Inter', fc = '500 33px Inter';
    const gen = sut.map((h, j) => Math.max(olc(duz(h), fh), ...sat.map(r => olc(duz((r.hucreler || [])[j] ?? ''), fc + (r.vurgu ? '' : '')) * (r.vurgu ? 1.04 : 1))) + 72);
    const top = gen.reduce((a, b) => a + b, 0), T = Math.min(1680, Math.max(1000, top + 160)), ek = (T - top) / n, gw = gen.map(w => w + ek);
    const hucre = (m, j, o) => `<div style="flex:none;width:${n1(gw[j])}px;box-sizing:border-box;padding:0 36px;${o}">${zengin(String(m ?? ''))}</div>`;
    const bas = `<div style="display:flex;align-items:center;height:${hh}px;background:${R.lacivert};color:#fff;font:${fh};letter-spacing:.02em">${sut.map((h, j) => hucre(h, j, '')).join('')}</div>`;
    const satir = (r, i) => { const b = basl(sz, r.cumle, .6 + i * .3), vz = !!r.vurgu;
      return `<div style="position:relative;display:flex;align-items:center;height:${rh}px;background:${vz ? '#DDEEFD' : i % 2 ? R.kart : '#fff'};border-top:1.5px solid ${R.cizgi};font:${vz ? '700' : '500'} 33px Inter;color:${R.metin};${gir(tl, b, {dx: -30, dy: 0})}">
        ${vz ? `<div class="ab" style="left:0;top:0;bottom:0;width:7px;background:${R.mavi}"></div>` : ''}${(r.hucreler || []).slice(0, n).map((m, j) => hucre(m, j, j === 0 ? `color:${vz ? R.mavi : R.metin};font-weight:${vz ? 800 : 600}` : '')).join('')}</div>`; };
    return `${bolumEtiketi(s, tl)}${sahneBasligi(s, tl)}
     <div class="ab" style="left:120px;top:320px;width:${n1(T)}px;border-radius:24px;overflow:hidden;background:#fff;box-shadow:0 24px 70px ${R.lacivert}14;border:1.5px solid ${R.cizgi};${gir(tl, .35, {olcek: .98})}">${bas}${sat.map(satir).join('')}</div>`;
  },

  karsilastir(s, sz, tl) {
    const nmax = Math.max(1, ...[s.sol, s.sag].map(k => k && k.maddeler ? Math.min(4, k.maddeler.length) : 0));
    const kh = Math.min(560, 96 + 44 + nmax * 86 + 14);
    const kol = (k, x, renk, gb) => { if (!k) return '';
      const mad = (k.maddeler || []).slice(0, 4).map((m, i) => { const b = basl(sz, m.cumle, gb + .4 + i * .35);
        return `<div style="display:flex;gap:22px;align-items:flex-start;margin-bottom:30px;${gir(tl, b, {dx: -24, dy: 0})}">
          <div style="flex:none;width:40px;height:40px;margin-top:5px;border-radius:50%;background:${renk};display:flex;align-items:center;justify-content:center">${tikSvg(26)}</div>
          <div style="font:500 38px/1.36 Inter;color:${R.metin}">${zengin(m.metin)}</div></div>`; }).join('');
      return `<div class="ab" style="left:${x}px;top:320px;width:810px;height:${kh}px;${KART};overflow:hidden;${gir(tl, gb, {olcek: .96})}">
        <div style="height:96px;background:${renk};display:flex;align-items:center;padding:0 44px;font:700 44px Outfit;color:#fff;letter-spacing:-.01em">${vurgu(k.ust || '').replace(/color:#1E8FEA/gi, 'color:#fff')}</div>
        <div style="padding:40px 44px 0">${mad}</div></div>`; };
    const ilk = k => k && k.maddeler && k.maddeler[0] && k.maddeler[0].cumle != null ? Math.min(.35, cb(sz, k.maddeler[0].cumle)) : .35;
    return `${bolumEtiketi(s, tl)}${sahneBasligi(s, tl)}${kol(s.sol, 120, R.lacivert, ilk(s.sol))}${kol(s.sag, 990, R.mavi, ilk(s.sag) + .15)}
     <div class="ab" style="left:${960 - 33}px;top:${320 + kh / 2 - 33}px;width:66px;height:66px;border-radius:50%;background:#fff;box-shadow:0 10px 30px ${R.lacivert}22;border:1.5px solid ${R.cizgi};display:flex;align-items:center;justify-content:center;font:800 24px Outfit;color:${R.soluk};${gir(tl, .6, {olcek: .8, dy: 0})}">vs</div>`;
  },


  // ikon kartları: 2-6 kart (karşılaştırma, kategori); 5-6 kart iki sıra
  ikonlar(s, sz, tl) {
    const og = (s.ogeler || s.kartlar || s.ikonlar || []).slice(0, 6), n = og.length || 1, iki = n >= 5, sut = iki ? 3 : n, ara = 34;
    const ust0 = s.baslik ? 318 : 240, alt = 968, kw = (1680 - (sut - 1) * ara) / sut;
    const bas = og.map((m, i) => basl(sz, m.cumle, .5 + i * .35)), farkli = new Set(bas).size > 1;
    const sigdir = (m, f0, f1, gen, satir) => { let f = f0; while (f > f1 && olc(duz(m), `500 ${f}px Inter`) > gen * satir * .92) f -= 1; return f; };
    // tek sıra: kart yüksekliği en uzun içeriğe göre (en az 380, en çok 600); blok boş alanda dikey ortalanır
    const D1 = n <= 2 ? 176 : n === 3 ? 156 : 136, ft1 = n <= 3 ? 46 : 40;
    const icY = m => { const f = sigdir(m.metin || '', n <= 3 ? 34 : 31, 26, kw - 88, 5), sat = m.metin ? Math.ceil(olc(duz(m.metin), `500 ${f}px Inter`) / ((kw - 88) * .92)) : 0;
      return 88 + D1 + 34 + ft1 * 1.15 * Math.max(1, Math.ceil(olc(duz(m.baslik || ''), `700 ${ft1}px Outfit`) / (kw - 88))) + (sat ? 16 + sat * f * 1.4 : 0); };
    const kh = iki ? Math.min(250, (alt - ust0 - ara) / 2) : Math.min(600, alt - ust0, Math.max(380, ...og.map(icY)));
    const blok = iki ? 2 * kh + ara : kh, ust = ust0 + Math.max(0, (alt - ust0 - blok) / 2) * .7;
    const kart = (m, i) => {
      const sira = iki ? Math.floor(i / sut) : 0, j = iki ? i % sut : i, adet = iki && sira === 1 ? n - sut : sut;
      const x = 120 + (1680 - (adet * kw + (adet - 1) * ara)) / 2 + j * (kw + ara), y = ust + sira * (kh + ara), b = bas[i];
      const sonra = Math.min(1e9, ...bas.filter(t => t > b + .01)), ak = farkli ? ilerle(tl, b, .5) * (1 - ilerle(tl, sonra - .2, .4)) : 0, q = yay(kis((tl - b - .1) / .55));
      const halka = `box-shadow:0 24px 70px ${R.lacivert}14, inset 0 0 0 ${n1(1.5 + 2.5 * ak)}px ${karis(R.cizgi, R.mavi, ak)}`;
      if (!iki) {
        const D = n <= 2 ? 176 : n === 3 ? 156 : 136, ft = n <= 3 ? 46 : 40, ic = kw - 88, fm = sigdir(m.metin || '', n <= 3 ? 34 : 31, 26, ic, 5);
        return `<div class="ab" style="left:${n1(x)}px;top:${y}px;width:${n1(kw)}px;height:${n1(kh)}px;box-sizing:border-box;padding:44px 44px;background:#fff;border-radius:28px;border:1.5px solid ${R.cizgi};${halka};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;${gir(tl, b, {dy: 34, olcek: .94})}">
          <div style="transform:scale(${q.toFixed(3)})">${ikonDisk(m.ikon || 'soru', D, {halka: ak > .01 ? n1(3 * ak) : 0})}</div>
          <div style="font:700 ${ft}px/1.15 Outfit;letter-spacing:-.01em;color:${R.metin};margin-top:34px">${vurgu(m.baslik || '')}</div>
          ${m.metin ? `<div style="font:500 ${fm}px/1.4 Inter;color:${R.soluk};margin-top:16px">${zengin(m.metin)}</div>` : ''}</div>`;
      }
      const D = 118, ic = kw - 88 - D - 30, fm = sigdir(m.metin || '', 30, 24, ic, 3);
      return `<div class="ab" style="left:${n1(x)}px;top:${n1(y)}px;width:${n1(kw)}px;height:${n1(kh)}px;box-sizing:border-box;padding:0 40px 0 44px;background:#fff;border-radius:26px;border:1.5px solid ${R.cizgi};${halka};display:flex;align-items:center;gap:30px;${gir(tl, b, {dy: 30, olcek: .94})}">
        <div style="transform:scale(${q.toFixed(3)})">${ikonDisk(m.ikon || 'soru', D, {halka: ak > .01 ? n1(3 * ak) : 0})}</div>
        <div style="flex:1"><div style="font:700 38px/1.15 Outfit;letter-spacing:-.01em;color:${R.metin}">${vurgu(m.baslik || '')}</div>
        ${m.metin ? `<div style="font:500 ${fm}px/1.38 Inter;color:${R.soluk};margin-top:10px">${zengin(m.metin)}</div>` : ''}</div></div>`;
    };
    return `${ustEtiket(s, tl, '')}${s.baslik ? sahneBasligi(s, tl) : ''}${og.map(kart).join('')}`;
  },

  // süreç akışı: 3-5 adım, aralarındaki oklar sırayla yanar
  akis(s, sz, tl) {
    const ad = (s.adimlar || s.ogeler || []).slice(0, 5), n = ad.length || 1, sw = 1680 / n;
    const D = n <= 3 ? 196 : n === 4 ? 176 : 156, ust0 = s.baslik ? 340 : 270, bas = ad.map((m, i) => basl(sz, m.cumle, .6 + i * .9));
    const ft = n <= 3 ? 44 : n === 4 ? 40 : 35, fm0 = n <= 3 ? 32 : n === 4 ? 30 : 27, cx = i => 120 + sw * (i + .5);
    const metinli = ad.some(m => m.metin), blok = D + 34 + ft * 1.2 + (metinli ? 14 + 3 * fm0 * 1.4 : 0), ust = ust0 + Math.max(0, (968 - ust0 - blok) / 2) * .75, cy = ust + D / 2;
    let oklar = '';
    for (let i = 0; i < n - 1; i++) {
      const x1 = cx(i) + D / 2 + 18, x2 = cx(i + 1) - D / 2 - 18, L0 = x2 - x1, p = kis((tl - (bas[i + 1] - .6)) / .6), pe = p * p * (3 - 2 * p), xe = x1 + (L0 - 4) * pe;
      oklar += `<line x1="${n1(x1)}" y1="${n1(cy)}" x2="${n1(x2 - 4)}" y2="${n1(cy)}" stroke="${R.cizgi}" stroke-width="7" stroke-linecap="round" stroke-dasharray="1 14"/>`;
      if (pe > 0) oklar += `<line x1="${n1(x1)}" y1="${n1(cy)}" x2="${n1(xe)}" y2="${n1(cy)}" stroke="${R.mavi}" stroke-width="7" stroke-linecap="round"/>`;
      oklar += `<path d="M${n1(x2 - 16)} ${n1(cy - 15)} L${n1(x2)} ${n1(cy)} L${n1(x2 - 16)} ${n1(cy + 15)}" fill="none" stroke="${karis(R.cizgi, R.mavi, kis(pe * 1.6 - .6))}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
      if (pe > 0 && pe < 1) oklar += `<circle cx="${n1(xe)}" cy="${n1(cy)}" r="${n1(9 + 5 * Math.sin(pe * Math.PI))}" fill="${R.mavi}" fill-opacity=".9"/><circle cx="${n1(xe)}" cy="${n1(cy)}" r="${n1(18 + 8 * pe)}" fill="${R.mavi}" fill-opacity="${n1(.18 * (1 - pe))}"/>`;
    }
    const adim = (m, i) => {
      const b = bas[i], p = ilerle(tl, b, .55), q = yay(kis((tl - b) / .6)), sonra = i < n - 1 ? bas[i + 1] : 1e9, ak = p * (1 - ilerle(tl, sonra - .1, .5));
      const hayal = .45 * ilerle(tl, .25, .6) * (1 - p), x = cx(i) - D / 2, nb = 14 + 6 * Math.sin(tl * 3.2) ** 2;
      const nabiz = ak > .01 ? `<div class="ab" style="left:${n1(-nb)}px;top:${n1(-nb)}px;right:${n1(-nb)}px;bottom:${n1(-nb)}px;border-radius:50%;background:${R.mavi};opacity:${(.12 * ak).toFixed(3)}"></div>` : '';
      let fm = fm0; while (fm > 22 && olc(duz(m.metin || ''), `500 ${fm}px Inter`) > (sw - 44) * 4 * .9) fm -= 1;
      return `<div class="ab" style="left:${n1(x)}px;top:${n1(cy - D / 2)}px;width:${D}px;height:${D}px">
          <div class="ab" style="left:0;top:0;width:${D}px;height:${D}px;box-sizing:border-box;border-radius:50%;border:3px dashed ${R.cizgi};opacity:${hayal.toFixed(3)}"></div>
          <div class="ab" style="left:0;top:0;width:${D}px;height:${D}px;opacity:${p.toFixed(3)};transform:scale(${(.7 + .3 * q).toFixed(3)})">${nabiz}
            <div class="ab" style="left:0;top:0;width:${D}px;height:${D}px;box-sizing:border-box;border-radius:50%;background:${karis('#FFFFFF', '#E8F3FD', .4 + .6 * ak)};box-shadow:0 18px 50px ${R.lacivert}18, inset 0 0 0 ${n1(3 + 2 * ak)}px ${karis(R.cizgi, R.mavi, .35 + .65 * ak)};display:flex;align-items:center;justify-content:center">${ikonCiz(m.ikon || 'soru', Math.round(D * .52))}</div>
            <div class="ab" style="left:${n1(D * .02)}px;top:${n1(D * .02)}px;width:50px;height:50px;border-radius:50%;background:${karis(R.lacivert, R.mavi, ak)};color:#fff;font:700 24px Inter;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 5px #fff">${i + 1}</div></div></div>
        <div class="ab" style="left:${n1(cx(i) - sw / 2 + 20)}px;top:${n1(cy + D / 2 + 34)}px;width:${n1(sw - 40)}px;text-align:center;${gir(tl, b + .15, {dy: 18})}">
          <div style="font:700 ${ft}px/1.15 Outfit;letter-spacing:-.01em;color:${R.metin}">${vurgu(m.baslik || '')}</div>
          ${m.metin ? `<div style="font:500 ${fm}px/1.4 Inter;color:${R.soluk};margin-top:14px">${zengin(m.metin)}</div>` : ''}</div>`;
    };
    return `${ustEtiket(s, tl, '')}${s.baslik ? sahneBasligi(s, tl) : ''}
      <svg class="ab" style="left:0;top:0;overflow:visible" width="${W}" height="${H}">${oklar}</svg>${ad.map(adim).join('')}`;
  },

  gorsel(s, sz, tl) {
    const notlar = (s.notlar || []).slice(0, 3), var_ = notlar.length > 0;
    const kutu = {x: 120, y: 300, w: var_ ? 1180 : 1680, h: 600};
    const nt = (m, i) => { const b = basl(sz, m.cumle, 1 + i * .4);
      return `<div style="display:flex;gap:22px;align-items:flex-start;margin-bottom:34px;${gir(tl, b, {dx: -24, dy: 0})}">
        ${m.ikon ? `<div style="margin-top:-4px">${ikonDisk(m.ikon, 56, {kare: true, oran: .68})}</div>` : `<div style="flex:none;width:46px;height:46px;border-radius:13px;background:${R.mavi};color:#fff;font:700 24px Inter;display:flex;align-items:center;justify-content:center;margin-top:2px">${i + 1}</div>`}
        <div style="font:500 34px/1.36 Inter;color:${R.metin}">${zengin(m.metin)}</div></div>`; };
    return `${bolumEtiketi(s, tl)}${sahneBasligi(s, tl)}${cizimKarti(s, sz, tl, kutu, {giris: .35, sikisik: var_})}
     ${var_ ? `<div class="ab" style="left:1350px;top:330px;width:450px">${notlar.map(nt).join('')}</div>` : ''}`;
  },
});

// yan kart türleri: ipucu ve gorsel (maddeler sahnesinde)
const _yanEski = yanGorsel;
yanGorsel = function (y, sz, tl) {
  if (y.tur === 'ipucu') return `<div class="ab" style="left:1020px;top:340px;width:780px;box-sizing:border-box;padding:44px 48px 48px 56px;${KART};overflow:hidden;${gir(tl, y.cumle != null ? cb(sz, y.cumle) : .5, {olcek: .96})}">
     <div class="ab" style="left:0;top:0;bottom:0;width:10px;background:${R.sari}"></div>
     <div style="display:flex;align-items:center;gap:24px">${ipucuSimge(84)}${ipucuEtiket(22)}</div>
     <div style="font:600 40px/1.38 Outfit;color:${R.metin};margin-top:28px">${zengin(y.metin || '')}</div></div>`;
  if (y.tur === 'ikonlar') {   // yan kart: 2-4 ikonlu satır
    const og = (y.ogeler || y.kartlar || []).slice(0, 4), n = og.length || 1, gb = y.cumle != null ? cb(sz, y.cumle) : .45, sat = n <= 2 ? 150 : n === 3 ? 132 : 112, D = n <= 3 ? 92 : 80;
    const satir = (m, i) => { const b = basl(sz, m.cumle, gb + .3 + i * .3), q = yay(kis((tl - b - .05) / .5));
      return `<div style="display:flex;align-items:center;gap:26px;min-height:${sat}px;${i ? `border-top:1.5px solid ${R.cizgi};` : ''}${gir(tl, b, {dx: 24, dy: 0})}">
        <div style="transform:scale(${q.toFixed(3)})">${ikonDisk(m.ikon || 'soru', D)}</div>
        <div style="flex:1"><div style="font:700 ${n <= 3 ? 36 : 33}px/1.15 Outfit;color:${R.metin}">${vurgu(m.baslik || '')}</div>
        ${m.metin ? `<div style="font:500 ${n <= 3 ? 28 : 26}px/1.36 Inter;color:${R.soluk};margin-top:6px">${zengin(m.metin)}</div>` : ''}</div></div>`; };
    return `<div class="ab" style="left:1020px;top:330px;width:780px;box-sizing:border-box;padding:${y.ust ? 34 : 22}px 44px 22px;${KART};${gir(tl, gb, {olcek: .96})}">
      ${y.ust ? `<div style="font:700 26px Inter;letter-spacing:.12em;color:${R.mavi};margin-bottom:8px">${y.ust}</div>` : ''}${og.map(satir).join('')}</div>`;
  }
  if (y.tur === 'gorsel' || y.tur === 'cizim') return cizimKarti(y, sz, tl, {x: 1000, y: 330, w: 800, h: 560}, {giris: y.cumle != null ? cb(sz, y.cumle) : .4, sikisik: true, fpx: 23, maxW: 230, bosluk: 40, pad: 28});
  return _yanEski(y, sz, tl);
};

// ------------------------------------------------------------ reels sahneleri
const REELS = {
  kanca(s, sz, tl) {
    return `<div class="ab" style="left:0;right:0;top:250px;text-align:center;${gir(tl, 0)}"><span style="font:800 40px Inter;letter-spacing:.18em;padding:16px 34px;border-radius:44px;background:${R.lacivert};color:#fff">${s.ust || ''}</span></div>
     <div class="ab" style="left:80px;right:80px;top:470px;text-align:center;font:700 112px/1.1 Outfit;letter-spacing:-.025em;color:${R.metin};${gir(tl, .15, {olcek: .92, dy: 30})}">${vurgu(s.metin)}</div>
     ${s.cizim ? `<div class="ab" style="left:0;right:0;top:960px;display:flex;justify-content:center;${gir(tl, .5)}">${CIZIM[s.cizim](300, kis((tl - .5) / 1.2))}</div>` : ''}`;
  },
  buyuk_sayi(s, sz, tl) {
    const p = ilerle(tl, .1, .7);
    return `<div class="ab" style="left:0;right:0;top:260px;text-align:center;font:700 60px/1.25 Outfit;color:${R.soluk};${gir(tl, 0)}">${vurgu(s.ust || '')}</div>
     <div class="ab" style="left:0;right:0;top:400px;text-align:center;font:800 400px/1 Outfit;color:${R.mavi};letter-spacing:-.05em;opacity:${p};transform:scale(${(.7 + .3 * yay(p)).toFixed(3)})">${s.sayi}<span style="font-size:.4em;letter-spacing:0">${s.birim || ''}</span></div>
     ${s.cizim ? `<div class="ab" style="left:0;right:0;top:900px;display:flex;justify-content:center;align-items:flex-end;gap:70px">
        <div style="text-align:center;${gir(tl, s.cizim_cumle != null ? cb(sz, s.cizim_cumle) : .6)}">${CIZIM.uzengi(260, kis((tl - .6) / 1))}<div style="font:600 34px Inter;color:${R.soluk};margin-top:10px">${EN ? 'stapes' : 'stapes (üzengi)'}</div></div>
        <div style="text-align:center;${gir(tl, s.cizim_cumle != null ? cb(sz, s.cizim_cumle) + .3 : .9)}">${CIZIM.pirinc(260, 1)}<div style="font:600 34px Inter;color:${R.soluk};margin-top:10px">${EN ? 'grain of rice' : 'pirinç tanesi'}</div></div></div>` : ''}`;
  },
  zincir(s, sz, tl) {
    const n = s.halkalar.length;
    const kutu = (h, i) => { const b = h.cumle != null ? cb(sz, h.cumle) + (h.gecikme || 0) : .4 + i * .5, p = ilerle(tl, b, .5), son = i === n - 1;
      return `<div style="display:flex;flex-direction:column;align-items:center;opacity:${kis(.25 + p)};transform:scale(${(.9 + .1 * p).toFixed(3)})">
        <div style="width:250px;height:250px;border-radius:40px;background:${p > .5 ? (son ? R.mavi : R.lacivert) : R.kart};box-shadow:inset 0 0 0 3px ${R.cizgi};display:flex;align-items:center;justify-content:center;font:800 48px Outfit;color:${p > .5 ? '#fff' : R.soluk}">${i + 1}</div>
        <div style="font:700 46px Outfit;color:${R.metin};margin-top:22px">${h.ad}</div>${h.tr ? `<div style="font:500 32px Inter;color:${R.soluk};margin-top:4px">(${h.tr})</div>` : ''}</div>`; };
    const ok = i => `<div style="font:800 60px Inter;color:${R.mavi};margin-top:-90px;opacity:${kis(ilerle(tl, (s.halkalar[i + 1].cumle != null ? cb(sz, s.halkalar[i + 1].cumle) + (s.halkalar[i + 1].gecikme || 0) : .9 + i * .5) - .2, .4))}">›</div>`;
    let ic = ''; s.halkalar.forEach((h, i) => { ic += kutu(h, i); if (i < n - 1) ic += ok(i); });
    return `<div class="ab" style="left:80px;right:80px;top:280px;text-align:center;font:700 84px/1.12 Outfit;letter-spacing:-.02em;color:${R.metin};${gir(tl, 0)}">${vurgu(s.baslik)}</div>
      <div class="ab" style="left:0;right:0;top:700px;display:flex;justify-content:center;align-items:center;gap:22px">${ic}</div>
      ${s.alt ? `<div class="ab" style="left:100px;right:100px;top:1110px;text-align:center;font:600 46px/1.35 Inter;color:${R.soluk};${gir(tl, s.alt_cumle != null ? cb(sz, s.alt_cumle) : 1.5)}">${zengin(s.alt)}</div>` : ''}`;
  },
  kapanis(s, sz, tl) {
    const a = {kavis: kis(tl / .9), kulak: kis((tl - .3) / .8), kitap: kis((tl - .8) / .7)};
    const pb = ilerle(tl, 1.0, .5);
    if (V.kaynak_ders) {  // reels bir dersten kesildiyse: tam derse yönlendiren kart (logo ile düğme arasında)
      const no = String(V.kaynak_ders).replace(/\D/g, '').replace(/^0+(?=\d\d)/, '').padStart(2, '0');
      const pd = ilerle(tl, 1.3, .5);
      const bas = V.kaynak_baslik ? `<div style="font:600 46px/1.24 Outfit;color:${R.metin};margin-top:22px;text-wrap:balance;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${zengin(V.kaynak_baslik)}</div>` : '';
      return `<div class="ab" style="left:0;right:0;top:270px;display:flex;flex-direction:column;align-items:center">${isaret(250, a)}
         <div style="margin-top:26px;${gir(tl, .7)}">${kelimeLogo(116)}</div>
         <div style="font:500 50px Outfit;color:${R.logo_mavi};margin-top:8px;${gir(tl, .8)}">${altAd}</div></div>
       <div class="ab" style="left:110px;right:110px;top:800px;box-sizing:border-box;padding:34px 44px 30px;text-align:center;${KART};${gir(tl, .9, {olcek: .96})}">
         <div style="display:flex;align-items:center;justify-content:center;gap:18px">
           <span style="font:800 28px Inter;letter-spacing:.16em;color:${R.mavi}">${EN ? 'FULL LESSON' : 'TAM DERS'}</span>
           <span style="font:800 28px Inter;letter-spacing:.12em;padding:8px 18px;border-radius:12px;background:${R.lacivert};color:#fff">${EN ? 'LESSON' : 'DERS'} ${no}</span></div>
         ${bas}
         <div style="font:500 30px Inter;color:${R.soluk};margin-top:16px">${EN ? 'On YouTube and our website' : 'YouTube ve web sitesinde'}</div></div>
       <div class="ab" style="left:0;right:0;top:1150px;display:flex;justify-content:center;opacity:${pd};transform:scale(${(.8 + .2 * yay(pd)).toFixed(3)})">
         <div style="font:800 48px Outfit;color:#fff;background:${R.mavi};padding:24px 60px;border-radius:999px">${s.cta || (EN ? 'Follow for more' : 'Takip et')}</div></div>`;
    }
    return `<div class="ab" style="left:0;right:0;top:420px;display:flex;flex-direction:column;align-items:center">${isaret(380, a)}
       <div style="margin-top:40px;${gir(tl, .7)}">${kelimeLogo(150)}</div>
       <div style="font:500 64px Outfit;color:${R.logo_mavi};margin-top:12px;${gir(tl, .9)}">${altAd}</div></div>
     <div class="ab" style="left:0;right:0;top:1180px;display:flex;justify-content:center;opacity:${pb};transform:scale(${(.8 + .2 * yay(pb)).toFixed(3)})">
       <div style="font:800 48px Outfit;color:#fff;background:${R.mavi};padding:24px 60px;border-radius:999px">${s.cta || (EN ? 'Follow for more' : 'Takip et')}</div></div>`;
  },
};

// ------------------------------------------------------------ sabit öğeler
function ilerlemeCubugu(t) {
  const p = kis(t / ZM.toplam);
  if (BICIM === 'reels') return `<div class="ab" style="left:60px;right:60px;top:70px;height:8px;border-radius:4px;background:${R.mavi}22"><div style="width:${(p * 100).toFixed(2)}%;height:100%;border-radius:4px;background:${R.mavi}"></div></div>`;
  return `<div class="ab" style="left:0;bottom:0;height:8px;width:100%;background:${R.mavi}1f"><div style="width:${(p * 100).toFixed(2)}%;height:100%;background:${R.mavi}"></div></div>`;
}

function renderAt(t) {
  if (BICIM === 'kapak') { kok.innerHTML = kapak(); return; }
  if (BICIM === 'kapak_reels') { kok.innerHTML = kapakReels(); kapakReelsSigdir(); return; }
  let i = ZM.sahneler.findIndex(s => t < s.bas + s.sure); if (i < 0) i = ZM.sahneler.length - 1;
  const sz = ZM.sahneler[i], s = V.sahneler[i], tl = t - sz.bas;
  const TUR = BICIM === 'reels' ? REELS : DERS;
  const ic = (TUR[s.tur] || (() => `<div class="ab" style="left:100px;top:100px;font:700 50px Inter;color:red">Bilinmeyen sahne türü: ${s.tur}</div>`))(s, sz, tl);
  const op = (s.tur === 'acilis' && !s.baslik) || s.tur === 'bitis' || (s.tur === 'kapanis' && i === ZM.sahneler.length - 1) ? 1 : cikis(tl, sz.sure);
  const sabitLogo = BICIM === 'ders' && !['acilis', 'baslik', 'kapanis', 'bitis'].includes(s.tur)
    ? `<div class="ab" style="right:80px;top:64px;opacity:.95">${logo(.5)}</div>` : '';
  const reelsLogo = BICIM === 'reels' && s.tur !== 'kapanis' ? `<div class="ab" style="left:0;right:0;bottom:120px;display:flex;justify-content:center;opacity:.95">${logo(.6)}</div>` : '';
  kok.innerHTML = zemin(t) + `<div class="ab" style="left:0;top:0;width:${W}px;height:${H}px;opacity:${op.toFixed(3)}">${ic}</div>`
    + sabitLogo + reelsLogo + altyazi(sz, tl) + (['acilis', 'bitis'].includes(s.tur) || window.JENERIK ? '' : ilerlemeCubugu(t));
}

// ------------------------------------------------------------ YouTube kapak görseli (1280x720)
function kapak() {
  const k = V.kapak || {};
  const g = k.grafik ? `<div class="ab" style="left:770px;top:100px;width:450px;height:480px;background:#fff;border-radius:26px;box-shadow:0 22px 60px ${R.lacivert}1a;border:1.5px solid ${R.cizgi}"><div class="ab" style="left:0;top:10px">${odyogram(450, 460, Object.assign({fs: 17, kalin: 6, r: 14, sol: 60, ust: 46}, k.grafik), 99)}</div></div>`
    : k.cizim && !CIZIM[k.cizim] ? cizimKarti({cizim: k.cizim, ayar: k.ayar, vurgula: k.vurgula || []}, {cumleler: []}, 99, {x: 760, y: 100, w: 470, h: 490}, {pad: 22, sikisik: true})
    : k.cizim ? `<div class="ab" style="left:800px;top:120px;width:400px;height:440px;background:#fff;border-radius:26px;box-shadow:0 22px 60px ${R.lacivert}1a;border:1.5px solid ${R.cizgi};display:flex;align-items:center;justify-content:center">${CIZIM[k.cizim](300, 1)}</div>`
    : `<div class="ab" style="left:820px;top:150px">${isaret(380)}</div>`;
  return zemin(0, 1.3) + `<div class="ab" style="left:70px;top:66px;font:800 25px Inter;letter-spacing:.16em;padding:10px 22px;border-radius:12px;background:${R.lacivert};color:#fff">${k.ust || ''}</div>
   <div class="ab" style="left:66px;top:160px;width:700px;font:700 ${k.boyut || 104}px/1.05 Outfit;color:${R.metin};letter-spacing:-.025em">${vurgu(k.baslik || '')}</div>
   <div class="ab" style="left:70px;top:450px;width:680px;font:600 30px/1.35 Inter;color:${R.soluk}">${k.alt || ''}</div>
   ${g}<div class="ab" style="left:70px;bottom:46px">${logo(.62)}</div>`;
}

// ------------------------------------------------------------ reels kapak görseli (1080x1920)
// Instagram profil ızgarası ortadaki 1080x1440'ı gösterir (y 240-1680): bütün öğeler bu alanda kalır.
const KR_KUTU = {x: 120, y: 860, w: 840, h: 680};
function kapakReels() {
  const k = V.kapak || {}, kt = KR_KUTU;
  const kart = ic => `<div class="ab" style="left:${kt.x}px;top:${kt.y}px;width:${kt.w}px;height:${kt.h}px;background:#fff;border-radius:34px;box-shadow:0 26px 70px ${R.lacivert}1a;border:1.5px solid ${R.cizgi}">${ic}</div>`;
  const g = k.grafik ? kart(`<div class="ab" style="left:30px;top:14px">${odyogram(780, 650, Object.assign({fs: 22, kalin: 7, r: 17, sol: 72, ust: 56}, k.grafik), 99)}</div>`)
    : k.cizim && !CIZIM[k.cizim] ? cizimKarti({cizim: k.cizim, ayar: k.ayar, vurgula: k.vurgula || []}, {cumleler: []}, 99, kt, {pad: 30, sikisik: true})
    : k.cizim ? kart(`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center">${CIZIM[k.cizim](440, 1)}</div>`)
    : `<div class="ab" style="left:${(W - 460) / 2}px;top:${kt.y + 40}px">${isaret(460)}</div>`;
  return zemin(0, 1.3) + `<div id="kr_metin" class="ab" style="left:80px;top:290px;width:920px;display:flex;flex-direction:column;align-items:flex-start;gap:34px">
     <div style="font:800 32px Inter;letter-spacing:.16em;padding:12px 26px;border-radius:14px;background:${R.lacivert};color:#fff">${k.ust || ''}</div>
     <div id="kr_baslik" style="font:700 ${Math.round((k.boyut || 104) * 1.3)}px/1.05 Outfit;color:${R.metin};letter-spacing:-.025em">${vurgu(k.baslik || '')}</div>
     <div id="kr_alt" style="font:600 40px/1.35 Inter;color:${R.soluk}">${k.alt || ''}</div></div>
   <div id="kr_gorsel" class="ab" style="left:0;top:0;width:${W}px;height:${H}px">${g}
   <div class="ab" style="left:0;right:0;top:${kt.y + kt.h + 40}px;display:flex;justify-content:center">${logo(.82)}</div></div>`;
}
// uzun başlık görsel kartına taşarsa yazı küçültülür; sonra görsel metnin altına çekilir ve bütün düzen 240-1680 bandında ortalanır
function kapakReelsSigdir() {
  const m = document.getElementById('kr_metin'), b = document.getElementById('kr_baslik'), a = document.getElementById('kr_alt');
  const gorsel = document.getElementById('kr_gorsel'), kt = KR_KUTU, ust = m.getBoundingClientRect().top;
  let px = parseFloat(b.style.fontSize);
  while (m.getBoundingClientRect().bottom > kt.y - 60 && px > 64) { px -= 4; b.style.fontSize = px + 'px'; a.style.fontSize = Math.max(30, px * .32) + 'px'; }
  const kayma = m.getBoundingClientRect().bottom + 70 - kt.y;          // görsel metnin 70 px altına
  const alt = kt.y + kt.h + 40 + 108 + kayma;                           // logo altı (logo(.82) ~108 px)
  const orta = 240 + (1440 - (alt - ust)) / 2 - ust;                     // düzeni bandın ortasına al
  m.style.transform = `translateY(${orta}px)`;
  gorsel.style.transform = `translateY(${kayma + orta}px)`;
}

document.fonts.load('700 50px Outfit').then(() => document.fonts.load('500 20px Inter')).then(() => document.fonts.ready).then(() => {
  window.TOTAL = BICIM.startsWith('kapak') ? 0 : ZM.toplam; renderAt(0); window.__ready = true; });

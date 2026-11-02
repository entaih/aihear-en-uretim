// AIHEAR Akademi: veriyle çizilen grafik türleri (2.11.2026). sahne.js'ten SONRA yüklenir (sahne.html); CIZ'e yeni çizim adları ekler,
// var olan çizimlere dokunmaz. Ortak çizici: grafikCizim(c, G) -> eksenler (doğrusal / logaritmik), seriler (çizgi, çubuk, nokta, dolgu),
// bölgeler, işaretler, aralık okları. Her seri, bölge, işaret ve aralık adıyla bir PARÇADIR: vurgula, etiketler ve yakinlastir ile çalışır.
// Hazır türler (ayar ile parametreli): grafik (genel, veri ile), ayar_egrisi, giris_cikis, gurultu_spektrumu, dalga_bicimi, spektrogram,
// kaynak_suzgec, sonum_egrisi, nistagmus_izi, atim_dizisi, faz_egrileri, plato_grafigi.
const EKR = {mavi: R.mavi, lacivert: R.lacivert, sari: R.sari, kirmizi: R.sag_kulak, sag: R.sag_kulak, sol: R.sol_kulak, yesil: R.basari, gri: R.soluk,
  turuncu: '#E39A10', mor: '#7B61C9', acik: '#9CC9F3'};
const ekRenk = r => EKR[r] || r || R.mavi;
const ekBas = (c, cumle, yedek) => cumle != null ? c.cb(cumle) : yedek;
const ekSayi = (v, ond = 0) => { const s = (+v).toFixed(ond); return EN ? s : s.replace('.', ','); };
const ekSm = (a, b, k = 4) => -k * Math.log(Math.exp(-a / k) + Math.exp(-b / k));          // yumuşak en küçük
const ekSM = (a, b, k = 4) => k * Math.log(Math.exp(a / k) + Math.exp(b / k));             // yumuşak en büyük
function ekRast(tohum) { let a = tohum >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
// iki uçlu ok (x1,y1)-(x2,y2)
function ekCiftOk(x1, y1, x2, y2, renk, k = 3, b = 12) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  return `<line x1="${n1(x1)}" y1="${n1(y1)}" x2="${n1(x2)}" y2="${n1(y2)}" stroke="${renk}" stroke-width="${k}" stroke-linecap="round"/>` + okBasi(x2, y2, a, b, renk, k) + okBasi(x1, y1, a + Math.PI, b, renk, k);
}
function ekOlcek(e, a0, a1, dikey) {
  const f = v => e.log ? Math.log(v / e.min) / Math.log(e.max / e.min) : (v - e.min) / (e.max - e.min);
  return dikey ? (e.ters ? v => a0 + (a1 - a0) * f(v) : v => a1 - (a1 - a0) * f(v)) : v => a0 + (a1 - a0) * f(v);
}
function ekIsaretler(e) {
  if (Array.isArray(e.isaretler)) return e.isaretler;
  const o = [];
  if (e.log) { for (let v = e.min; v <= e.max * 1.0001; v *= 2) o.push(v); return o; }
  const ad = e.adim || (e.max - e.min) / 5;
  for (let v = Math.ceil(e.min / ad - 1e-9) * ad; v <= e.max + 1e-9; v += ad) o.push(+v.toFixed(6));
  return o;
}
const ekYazi = (e, v) => (e.yazilar && e.yazilar[v] != null) ? e.yazilar[v] : e.hz ? fYazi(v) : ekSayi(v, e.ond || 0);

// G: {w, h, alan:{x0,x1,y0,y1}, x:{min,max,log,ters,hz,isaretler,yazilar,ad,ond}, y:{...}, seriler:[], bolgeler:[], isaretler:[], araliklar:[],
//     arka(c,X,Y), ek(c,X,Y), a:{ek parça noktaları}, yer:{}}
function grafikCizim(c, G) {
  const w = G.w || 900, h = G.h || 540, al = Object.assign({x0: 120, x1: 850, y0: 36, y1: 440}, G.alan || {});
  const X = ekOlcek(G.x, al.x0, al.x1), Y = ekOlcek(G.y, al.y0, al.y1, true);
  const kis2 = (v, e) => Math.min(Math.max(v, Math.min(e.min, e.max)), Math.max(e.min, e.max));
  const seriler = (G.seriler || []).map((s, i) => {
    let pts = s.noktalar;
    if (!pts && s.fn) { const n = s.n || 160, x0 = s.x ? s.x[0] : G.x.min, x1 = s.x ? s.x[1] : G.x.max; pts = [];
      for (let j = 0; j < n; j++) { const u = j / (n - 1), xv = G.x.log ? x0 * Math.pow(x1 / x0, u) : x0 + (x1 - x0) * u, yv = s.fn(xv); if (yv != null && isFinite(yv)) pts.push([xv, yv]); } }
    pts = (pts || []).filter(p => p && p[1] != null);
    if (s.kirp !== false && s.tur !== 'cubuk') pts = pts.filter(p => p[1] <= Math.max(G.y.min, G.y.max) + 1e-9 && p[1] >= Math.min(G.y.min, G.y.max) - 1e-9);
    return Object.assign({ad: s.ad || 'seri' + (i + 1), i}, s, {pts});
  });
  const a = Object.assign({}, G.a || {});
  seriler.forEach(s => { if (!a[s.ad] && s.pts.length) { const q = s.parca_nokta || s.etiket_konum || s.pts[Math.floor(s.pts.length * (s.nokta_oran ?? .5))]; a[s.ad] = [X(q[0]), Y(q[1])]; } });
  (G.bolgeler || []).forEach(b => { if (a[b.ad]) return; a[b.ad] = b.x ? [X((G.x.log ? Math.sqrt(b.x[0] * b.x[1]) : (b.x[0] + b.x[1]) / 2)), al.y0 + 30] : [al.x1 - 60, Y((b.y[0] + b.y[1]) / 2)]; });
  (G.isaretler || []).forEach(m => { if (!a[m.ad]) a[m.ad] = [X(m.x), Y(m.y)]; });
  (G.araliklar || []).forEach(r => { if (!a[r.ad]) a[r.ad] = r.x ? [X(G.x.log ? Math.sqrt(r.x[0] * r.x[1]) : (r.x[0] + r.x[1]) / 2), Y(r.y)] : [X(r.x0 ?? r.xk), Y((r.y[0] + r.y[1]) / 2)]; });
  const zaman = (o, i, yedek = .4 + i * .25) => ekBas(c, o.cumle, yedek) + (o.gecikme || 0);
  return {w, h, a, yer: G.yer || {}, kam: G.kam, vurguEsle: G.vurguEsle, takma: G.takma,
    svg: () => {
      let s = '';
      if (!G.eksensiz) {
        const xt = ekIsaretler(G.x).map(v => ({x: X(v), e: G.x.yazisiz ? null : ekYazi(G.x, v), ince: G.x.ince && G.x.ince.includes(v)}));
        const yt = ekIsaretler(G.y).map(v => ({y: Y(v), e: G.y.yazisiz ? null : ekYazi(G.y, v)}));
        s += eksenCiz(c, {x0: al.x0, x1: al.x1, y0: al.y0, y1: al.y1, xt: G.x.izgarasiz ? xt.map(t => Object.assign({}, t, {x: t.x})) : xt, yt, xAd: G.x.ad, yAd: G.y.ad, yAdUz: G.y.adUz || 68});
      }
      // bölgeler (arkada)
      (G.bolgeler || []).forEach((b, i) => {
        const p = yum((c.t - zaman(b, i, .3)) / .8); if (p <= 0) return; const rn = ekRenk(b.renk || 'mavi');
        s += (v => { const xa = b.x ? X(b.x[0]) : al.x0, xb = b.x ? X(b.x[1]) : al.x1, ya = b.y ? Y(b.y[1]) : al.y0, yb = b.y ? Y(b.y[0]) : al.y1;
          const r0 = Math.min(ya, yb), r1 = Math.max(ya, yb);
          return `<rect x="${n1(Math.min(xa, xb))}" y="${n1(r0)}" width="${n1(Math.abs(xb - xa))}" height="${n1(r1 - r0)}" fill="${rn}" fill-opacity="${n1((b.opak ?? .10) * p + .14 * v)}"/>`
            + (b.etiket && !c.etiketli.has(b.ad) ? c.yazi(b.x ? (xa + xb) / 2 : al.x1 - 12, b.x ? al.y0 + c.fs(26) : (r0 + r1) / 2 + c.fs(7), b.etiket, {px: b.px || 19, fw: 700, renk: karis(rn, R.lacivert, .25), a: b.x ? 'middle' : 'end', ek: `opacity="${n1(p)}"`}) : ''); })(c.v[b.ad] || 0);
      });
      if (G.arka) s += G.arka(c, X, Y, al);
      // seriler
      seriler.forEach(sr => {
        const b = zaman(sr, sr.i), p = sr.anlik ? (c.t >= b ? 1 : 0) : kis((c.t - b) / (sr.sure || 1.3)); if (p <= 0 || !sr.pts.length) return;
        const rn = ekRenk(sr.renk || (sr.i ? 'lacivert' : 'mavi')), kal = sr.kalin || 5;
        s += c.P(sr.ad, v => {
          let g = '';
          if (sr.tur === 'cubuk') {
            const taban = sr.taban ?? (G.y.ters ? G.y.max : G.y.min);
            sr.pts.forEach(([xv, yv], j) => { const q = kis(p * sr.pts.length * 1.2 - j * 1.0); if (q <= 0) return;
              const gw = sr.genislik || (G.x.log ? .7 : (G.x.max - G.x.min) / 30), xa = G.x.log ? X(xv * Math.pow(2, -gw / 2)) : X(xv - gw / 2), xb = G.x.log ? X(xv * Math.pow(2, gw / 2)) : X(xv + gw / 2);
              const ya = Y(taban), yb = ya + (Y(kis2(yv, G.y)) - ya) * yum(q);
              g += `<rect x="${n1(xa + 2)}" y="${n1(Math.min(ya, yb))}" width="${n1(xb - xa - 4)}" height="${n1(Math.abs(ya - yb))}" rx="4" fill="${karis(sr.dolgu_renk ? ekRenk(sr.dolgu_renk) : karis(rn, '#FFFFFF', .62), '#B3D8FA', .5 * v)}" stroke="${rn}" stroke-width="${n1(2.2 + 1.5 * v)}"/>`; });
            return g;
          }
          const n = sr.pts.length, son = Math.max(1, (n - 1) * p), m = Math.floor(son), pts = sr.pts.slice(0, m + 1).map(q => [X(q[0]), Y(q[1])]);
          if (m < n - 1) { const q0 = sr.pts[m], q1 = sr.pts[m + 1], u = son - m; pts.push([X(q0[0] + (q1[0] - q0[0]) * u), Y(q0[1] + (q1[1] - q0[1]) * u)]); }
          if (sr.tur === 'nokta') return pts.slice(0, Math.ceil(n * p)).map(([x, y]) => `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(sr.r || 9)}" fill="#fff" stroke="${rn}" stroke-width="${n1(3.4 + v)}"/>`).join('');
          const d = sr.yumusak ? gYol(pts) : yolDiz(pts);
          if (sr.dolgu) { const ty = Y(sr.taban ?? (G.y.ters ? G.y.max : G.y.min)); g += `<path d="${d} L${n1(pts[pts.length - 1][0])} ${n1(ty)} L${n1(pts[0][0])} ${n1(ty)}Z" fill="${rn}" fill-opacity="${n1(.12 + .1 * v)}"/>`; }
          g += `<path d="${d}" fill="none" stroke="${rn}" stroke-width="${n1(kal + 2.5 * v)}" stroke-linecap="round" stroke-linejoin="round" ${sr.kesik ? `stroke-dasharray="${sr.kesik === true ? '12 9' : sr.kesik}"` : ''}/>`;
          if (sr.isaretli) g += sr.pts.slice(0, Math.ceil(n * p)).map(([x, y]) => `<circle cx="${n1(X(x))}" cy="${n1(Y(y))}" r="${n1(sr.r || 8)}" fill="#fff" stroke="${rn}" stroke-width="${n1(3.2 + v)}"/>`).join('');
          if (sr.ok && p > .98) { const q1 = pts[pts.length - 1], q0 = pts[Math.max(0, pts.length - 4)]; g += okBasi(q1[0], q1[1], Math.atan2(q1[1] - q0[1], q1[0] - q0[0]), 16, rn, kal * .8); }
          return g; });
        if (sr.etiket && !c.etiketli.has(sr.ad)) { const q = sr.etiket_konum || sr.pts[sr.pts.length - 1], dx = sr.etiket_dx ?? 12, dy = sr.etiket_dy ?? -12;
          s += c.yazi(X(q[0]) + dx, Y(q[1]) + dy, sr.etiket, {px: sr.px || 20, fw: 700, renk: karis(rn, R.lacivert, .2), a: sr.etiket_hiza || 'start', ek: `opacity="${n1(kis(p * 3 - 2))}"`}); }
      });
      if (G.ek) s += G.ek(c, X, Y, al);
      // aralık okları
      (G.araliklar || []).forEach((r, i) => {
        const p = yum((c.t - zaman(r, i, 1.5)) / .7); if (p <= 0) return; const rn = ekRenk(r.renk || 'lacivert');
        s += c.P(r.ad, v => { const rr = karis(rn, R.mavi, v);
          if (r.x) { const xa = X(r.x[0]), xb = X(r.x[1]), y = Y(r.y), xm = xa + (xb - xa) * p;
            return `<g opacity="${n1(p)}">${ekCiftOk(xa, y, xm, y, rr, 3 + v)}</g>` + (r.etiket && !c.etiketli.has(r.ad) ? c.yazi((xa + xb) / 2, y + (r.etiket_alt ? c.fs(30) : -c.fs(12)), r.etiket, {px: r.px || 20, fw: 700, renk: R.lacivert, ek: `opacity="${n1(p)}"`}) : ''); }
          const x = X(r.x0 ?? r.xk), ya = Y(r.y[0]), yb = Y(r.y[1]), ym = ya + (yb - ya) * p;
          return `<g opacity="${n1(p)}">${ekCiftOk(x, ya, x, ym, rr, 3 + v)}</g>` + (r.etiket && !c.etiketli.has(r.ad) ? c.yazi(x + (r.etiket_sol ? -c.fs(12) : c.fs(12)), (ya + yb) / 2 + c.fs(7), r.etiket, {px: r.px || 20, fw: 700, renk: R.lacivert, a: r.etiket_sol ? 'end' : 'start', ek: `opacity="${n1(p)}"`}) : ''); });
      });
      // işaretler
      (G.isaretler || []).forEach((m, i) => {
        const p = yay(kis((c.t - zaman(m, i, 1.4)) / .6)); if (p <= 0) return; const rn = ekRenk(m.renk || 'mavi'), x = X(m.x), y = Y(m.y);
        s += c.P(m.ad, v => {
          let g = '';
          if (m.dus) { if (m.dus.includes('x')) g += `<line x1="${n1(x)}" y1="${n1(y)}" x2="${n1(x)}" y2="${al.y1}" stroke="${rn}" stroke-width="2" stroke-dasharray="4 6" opacity="${n1(kis(p))}"/>`;
            if (m.dus.includes('y')) g += `<line x1="${al.x0}" y1="${n1(y)}" x2="${n1(x)}" y2="${n1(y)}" stroke="${rn}" stroke-width="2" stroke-dasharray="4 6" opacity="${n1(kis(p))}"/>`; }
          if (m.cizgi === 'yatay') g += `<line x1="${al.x0}" y1="${n1(y)}" x2="${al.x1}" y2="${n1(y)}" stroke="${rn}" stroke-width="${n1(2.4 + v)}" stroke-dasharray="10 8" opacity="${n1(kis(p))}"/>`;
          if (m.cizgi === 'dikey') g += `<line x1="${n1(x)}" y1="${al.y0}" x2="${n1(x)}" y2="${al.y1}" stroke="${rn}" stroke-width="${n1(2.4 + v)}" stroke-dasharray="10 8" opacity="${n1(kis(p))}"/>`;
          if (m.nokta !== false) g += `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1((m.r || 9) * p)}" fill="${m.dolu ? rn : '#fff'}" stroke="${rn}" stroke-width="${n1(3.4 + v)}"/>`;
          return g; });
        if (m.etiket && !c.etiketli.has(m.ad)) s += c.yazi(x + (m.dx ?? 0), y + (m.dy ?? -c.fs(18)), m.etiket, {px: m.px || 20, fw: 700, renk: karis(rn, R.lacivert, .3), a: m.hiza || 'middle', ek: `opacity="${n1(kis(p))}"`});
      });
      return s;
    }};
}

// ---------------------------------------------------------------- genel grafik: veri JSON'dan
// ayar: {x: {min, max, log, hz, ad, isaretler}, y: {...}, seriler: [{ad, noktalar: [[x, y]...], renk, kesik, tur, etiket, cumle}], bolgeler, isaretler, araliklar}
CIZ.grafik = (c, ay) => grafikCizim(c, {x: Object.assign({min: 0, max: 10}, ay.x || {}), y: Object.assign({min: 0, max: 10}, ay.y || {}),
  seriler: ay.seriler || [], bolgeler: ay.bolgeler || [], isaretler: ay.isaretler || [], araliklar: ay.araliklar || [], yer: ay.yer || {}});

// ---------------------------------------------------------------- işitme siniri lifinin ayar eğrisi (tuning curve)
// Sağlıklı: keskin, derin uç (karakteristik frekans), dik tiz yamaç, düz pes kuyruk. Dış tüy hücresi hasarı: uç kaybolur, eşik ~40-50 dB yükselir,
// en duyarlı frekans biraz pese kayar, kuyruk aynı kalır (Liberman ve Dodds 1984; Ruggero 1992 tarifleri).
CIZ.ayar_egrisi = (c, ay) => {
  const cf = ay.cf || 2000, kuyruk = f => 64 + 9 * -Math.log2(f / cf);
  const saglikli = f => { const u = Math.log2(f / cf); return u >= 0 ? 12 + 150 * Math.pow(u, 1.35) : ekSm(12 + 170 * u * u, kuyruk(f), 7); };
  const hasarli = f => { const u = Math.log2(f / (cf * .82)); return u >= 0 ? ekSM(56 + 80 * Math.pow(u, 1.4), saglikli(f), 3) : ekSm(56 + 26 * u * u, kuyruk(f), 5); };
  const egr = ay.egriler || [{tip: 'saglikli'}];
  const S = egr.map(e => e.tip === 'hasarli'
    ? {ad: 'hasarli', fn: hasarli, renk: 'kirmizi', kesik: '14 9', cumle: e.cumle, etiket: L('dış tüy hücresi hasarı', 'outer hair cell loss'), etiket_konum: [cf * 1.22, 78], etiket_dx: 12, etiket_dy: 0, parca_nokta: [cf * .5, hasarli(cf * .5)]}
    : {ad: 'saglikli', fn: saglikli, renk: 'mavi', cumle: e.cumle, etiket: L('sağlıklı', 'healthy'), etiket_konum: [cf * 1.18, 30], etiket_dx: 10, etiket_dy: 4, parca_nokta: [cf * .7, saglikli(cf * .7)]});
  const sb = egr.find(e => e.tip !== 'hasarli');
  return grafikCizim(c, {x: {min: cf / 8, max: cf * 2, log: true, hz: true, ad: L('Frekans (Hz)', 'Frequency (Hz)')}, y: {min: 0, max: 100, adim: 20, ad: L('Eşik (dB SPL)', 'Threshold (dB SPL)')},
    seriler: S, isaretler: sb && ay.cf_goster !== false ? [{ad: 'karakteristik_frekans', x: cf, y: 12, dus: 'x', cumle: ay.cf_cumle ?? sb.cumle, gecikme: ay.cf_cumle != null ? 0 : 1.3, renk: 'mavi', dolu: true, r: 8,
      etiket: 'CF', dy: c.fs(36)}] : [],
    a: {uc: [ekOlcek({min: cf / 8, max: cf * 2, log: true}, 120, 850)(cf), ekOlcek({min: 0, max: 100}, 36, 440, true)(12)], kuyruk: [ekOlcek({min: cf / 8, max: cf * 2, log: true}, 120, 850)(cf / 5), ekOlcek({min: 0, max: 100}, 36, 440, true)(kuyruk(cf / 5))]},
    yer: {karakteristik_frekans: 'alt', uc: 'alt', saglikli: 'sol', hasarli: 'sol', kuyruk: 'sol'}, takma: {cf: 'karakteristik_frekans', karakteristik: 'karakteristik_frekans'}});
};

// ---------------------------------------------------------------- baziler membran giriş-çıkış eğrisi
// Sağlıklı: düşük düzeyde ~45 dB kazanç, orta düzeylerde sıkıştırma (eğim ~0,2 dB/dB), yüksek düzeyde doğrusala döner. Hasarda: doğrusal (1 dB/dB), aşağı kaymış.
CIZ.giris_cikis = (c, ay) => {
  const kz = ay.kazanc ?? 45, egim = ay.egim ?? .22, k0 = 25;
  const saglikli = x => ekSM(ekSm(x + kz, kz + k0 - egim * k0 + egim * x, 3), x, 3), hasarli = x => x;
  const egr = ay.egriler || [{tip: 'saglikli'}, {tip: 'hasarli'}];
  const S = egr.map(e => e.tip === 'hasarli'
    ? {ad: 'hasarli', fn: hasarli, renk: 'kirmizi', kesik: '14 9', cumle: e.cumle, etiket: L('hasar: doğrusal', 'damage: linear'), etiket_konum: [50, 50], etiket_dx: 16, etiket_dy: 30, parca_nokta: [40, 40]}
    : {ad: 'saglikli', fn: saglikli, renk: 'mavi', cumle: e.cumle, etiket: L('sağlıklı: sıkıştırılmış', 'healthy: compressive'), etiket_konum: [3, saglikli(3)], etiket_dx: 0, etiket_dy: -24, parca_nokta: [55, saglikli(55)]});
  const iki = egr.length > 1, hc = (egr.find(e => e.tip === 'hasarli') || {}).cumle;
  return grafikCizim(c, {x: {min: 0, max: 100, adim: 20, ad: L('Giriş düzeyi (dB SPL)', 'Input level (dB SPL)')}, y: {min: 0, max: 110, adim: 20, ad: L('Baziler membran yanıtı (dB)', 'Basilar membrane response (dB)'), adUz: 70},
    seriler: S, bolgeler: ay.kompresyon !== false ? [{ad: 'kompresyon', x: [32, 78], renk: 'mavi', etiket: L('sıkıştırma', 'compression'), cumle: ay.kompresyon_cumle, opak: .07}] : [],
    araliklar: iki ? [{ad: 'kazanc', x0: 12, y: [12, saglikli(12)], etiket: `≈ ${kz} dB`, cumle: ay.kazanc_cumle ?? hc, gecikme: ay.kazanc_cumle != null ? 0 : 1.2, renk: 'sari'}] : [],
    yer: {kazanc: 'sag', saglikli: 'sol', hasarli: 'sag', kompresyon: 'ust'}, takma: {kazanc_farki: 'kazanc', dogrusal: 'hasarli', sikistirma: 'kompresyon'}});
};

// ---------------------------------------------------------------- gürültü spektrumu (beyaz, pembe, kahverengi): hertz başına çizgi + oktav bantları
CIZ.gurultu_spektrumu = (c, ay) => {
  const tur = ay.tur || 'beyaz', gos = ay.gosterim || 'ikisi', l2 = f => Math.log2(f / 125);
  const hz = {beyaz: f => 0, pembe: f => 9 - 3 * l2(f), kahverengi: f => 18 - 6 * l2(f)}[tur] || (f => 0);
  const ok = {beyaz: f => -9 + 3 * l2(f), pembe: f => 0, kahverengi: f => 9 - 3 * l2(f)}[tur] || (f => 0);
  const bantlar = [125, 250, 500, 1000, 2000, 4000, 8000];
  const egimMetin = {beyaz: [L('oktav başına +3 dB', '+3 dB per octave'), L('düz', 'flat')], pembe: [L('her oktavda eşit', 'equal per octave'), L('oktav başına -3 dB', '-3 dB per octave')],
    kahverengi: [L('oktav başına -3 dB', '-3 dB per octave'), L('oktav başına -6 dB', '-6 dB per octave')]}[tur] || ['', ''];
  const S = [];
  if (gos !== 'hz') S.push({ad: 'oktav_bantlari', tur: 'cubuk', noktalar: bantlar.map(f => [f, ok(f)]), taban: -24, genislik: .78, renk: 'mavi', dolgu_renk: '#D6EAFC', cumle: ay.oktav_cumle, sure: 1.6,
    etiket: egimMetin[0], etiket_konum: [2800, ok(2800) + 3], etiket_dx: 0, etiket_dy: -40, etiket_hiza: 'middle', parca_nokta: [4000, ok(4000)]});
  if (gos !== 'oktav') S.push({ad: 'hz_cizgisi', fn: hz, renk: 'lacivert', kalin: 5.5, cumle: ay.hz_cumle, x: [110, 9000], etiket: egimMetin[1] + L(' (hertz başına)', ' (per hertz)'),
    etiket_konum: [140, hz(140)], etiket_dx: 0, etiket_dy: tur === 'beyaz' ? -16 : -18, parca_nokta: [500, hz(500)]});
  const adlar = {beyaz: L('Beyaz gürültü', 'White noise'), pembe: L('Pembe gürültü', 'Pink noise'), kahverengi: L('Kahverengi gürültü', 'Brown noise')};
  return grafikCizim(c, {x: {min: 90, max: 11000, log: true, hz: true, isaretler: bantlar, ad: L('Frekans (Hz)', 'Frequency (Hz)')}, y: {min: -24, max: 24, adim: 12, ad: L('Düzey (dB, göreli)', 'Level (dB, relative)')},
    seriler: S, yer: {hz_cizgisi: 'sol', oktav_bantlari: 'sag'}, takma: {spektrum: 'hz_cizgisi', hertz_basina: 'hz_cizgisi', oktav: 'oktav_bantlari', bantlar: 'oktav_bantlari'},
    ek: c2 => ay.baslik === false ? '' : c2.yazi(850, 36 + c2.fs(4), adlar[tur] || '', {a: 'end', px: 22, fw: 800, ff: 'Outfit', renk: R.lacivert})});
};

// ---------------------------------------------------------------- dalga biçimi: saf ses, gürültü, karmaşık periyodik ses (alt alta izler)
CIZ.dalga_bicimi = (c, ay) => {
  const tur = ay.seriler || ['ton', 'gurultu'], f = ay.frekans_hz || 500, T = (ay.sure_ms || 8) / 1000, n = tur.length;
  const x0 = 210, x1 = 860, ust = 40, alt = 460, bh = (alt - ust) / n, A = Math.min(70, bh * .36);
  const rnd = ekRast(ay.tohum || 7), gur = Array.from({length: 600}, () => rnd() * 2 - 1), NG = 150;
  // gürültü: yumuşatılmış rastgele örnekler (geniş bantlı görünüm)
  const gurY = u => { const i = u * (NG - 1), j = Math.floor(i), q = i - j, w = q * q * (3 - 2 * q); return (gur[j] * (1 - w) + gur[Math.min(j + 1, NG - 1)] * w) * .95; };
  const ad = {ton: L('saf ses', 'pure tone'), gurultu: L('gürültü', 'noise'), karmasik: L('karmaşık ses', 'complex tone')};
  const deger = (t2, u) => t2 === 'ton' ? Math.sin(2 * Math.PI * f * u * T) : t2 === 'karmasik' ? (Math.sin(2 * Math.PI * f * u * T) + .6 * Math.sin(4 * Math.PI * f * u * T + .6) + .35 * Math.sin(6 * Math.PI * f * u * T + 1.4)) / 1.5 : gurY(u);
  const a = {}; tur.forEach((t2, i) => a[t2] = [x0 + (x1 - x0) * .32, ust + bh * (i + .5) - A * .95]);
  a.zaman = [x1 - 10, alt + 4];
  return {w: 900, h: 520, a, yer: Object.assign({zaman: 'sag'}, Object.fromEntries(tur.map(t2 => [t2, 'ust']))),
    svg: () => {
      let s = '';
      tur.forEach((t2, i) => {
        const yc = ust + bh * (i + .5), b = ekBas(c, (ay.cumleler || [])[i], .4 + i * .5), p = kis((c.t - b) / 1.4);
        s += `<line x1="${x0}" y1="${n1(yc)}" x2="${x1}" y2="${n1(yc)}" stroke="${R.cizgi}" stroke-width="2"/>`;
        if (!c.etiketli.has(t2)) s += c.yazi(x0 - 26, yc + c.fs(8), ad[t2] || t2, {a: 'end', px: 23, fw: 700, renk: R.lacivert});
        if (p <= 0) return;
        const pts = []; for (let k = 0; k <= 520 * p; k++) { const u = k / 520; pts.push([x0 + (x1 - x0) * u, yc - A * deger(t2, u)]); }
        s += c.P(t2, v => `<path d="${yolDiz(pts)}" fill="none" stroke="${t2 === 'gurultu' ? karis('#5E6F88', R.mavi, v) : karis(R.mavi, R.lacivert, v * .3)}" stroke-width="${n1(t2 === 'gurultu' ? 3.4 + v : 4.5 + 2 * v)}" stroke-linejoin="round" stroke-linecap="round"/>`);
      });
      s += `<line x1="${x0}" y1="${alt + 4}" x2="${x1 + 14}" y2="${alt + 4}" stroke="${R.lacivert}" stroke-width="2.2"/>` + okBasi(x1 + 16, alt + 4, 0, 13) + c.yazi(x1 + 10, alt + c.fs(34), L('zaman', 'time'), {a: 'end', px: 19});
      return s; }};
};

// ---------------------------------------------------------------- spektrogram (örnek: "sasa"): zaman, frekans, koyuluk = enerji
CIZ.spektrogram = (c, ay) => {
  const x0 = 130, x1 = 790, y0 = 160, y1 = 470, Tm = .8, Fm = 8000, X = t => x0 + (x1 - x0) * t / Tm, Y = f => y1 - (y1 - y0) * f / Fm;
  const seg = [['s', 0, .17], ['a', .17, .37], ['s', .37, .55], ['a', .55, .77]];
  const F = ay.formantlar || [750, 1250, 2600], AF = [1, .85, .6], BF = [240, 260, 300];
  const rnd = ekRast(11), dok = Array.from({length: 4096}, () => rnd());
  const ss = (a, b, x) => { const u = kis((x - a) / (b - a)); return u * u * (3 - 2 * u); };
  const E = (t, f, i, j) => {
    const sg = seg.find(q => t >= q[1] && t < q[2]); if (!sg) return 0;
    const kn = Math.min(ss(sg[1], sg[1] + .025, t), 1 - ss(sg[2] - .025, sg[2], t)), tx = dok[(i * 64 + j) % 4096];
    if (sg[0] === 's') return kn * .85 * ss(3600, 4900, f) * (1 - .25 * ss(7400, 8000, f)) * (.55 + .45 * tx);
    let e = 0; F.forEach((Fk, k) => e = Math.max(e, AF[k] * Math.exp(-Math.pow((f - Fk) / BF[k], 2))));
    if (f < 320) e = Math.max(e, .7); e += .2 * Math.exp(-f / 2200) * (i % 2 ? .6 : 1);
    return kn * Math.min(1, e) * (.82 + .18 * tx);
  };
  const nx = 66, ny = 50, mid = q => (q[1] + q[2]) / 2;
  const a = {s_sesi: [X(mid(seg[0])), Y(6000)], tiz_gurultu: [X(mid(seg[2])), Y(6000)], a_sesi: [X(mid(seg[1])), Y(F[1])], formantlar: [X(seg[1][2] - .02), Y(F[1])],
    dalga_bicimi: [X(.3), 92], koyuluk: [x1 + 52, y0 + 40], zaman_ekseni: [X(.7), y1 + 4], frekans_ekseni: [x0, Y(7000)]};
  return {w: 900, h: 560, a, yer: {s_sesi: 'ust', tiz_gurultu: 'ust', a_sesi: 'sol', formantlar: 'sag', dalga_bicimi: 'ust', koyuluk: 'sag', zaman_ekseni: 'alt', frekans_ekseni: 'sol'},
    takma: {s: 's_sesi', a: 'a_sesi', unlu: 'a_sesi', formant: 'formantlar', surtunmeli: 's_sesi', enerji: 'koyuluk', zaman: 'zaman_ekseni', frekans: 'frekans_ekseni'},
    vurguEsle: {tiz_gurultu: 's_sesi'},
    svg: () => {
      const b = ekBas(c, ay.cumle, .5), p = kis((c.t - b) / 2.2), tx = Tm * p;
      let s = `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="#FFFFFF" stroke="${R.cizgi}" stroke-width="1.5"/>`;
      // hücreler
      const dw = (x1 - x0) / nx, dh = (y1 - y0) / ny;
      let hc = '';
      for (let i = 0; i < nx; i++) { const t = (i + .5) / nx * Tm; if (t > tx) break;
        for (let j = 0; j < ny; j++) { const f = (j + .5) / ny * Fm, e = E(t, f, i, j); if (e < .06) continue;
          hc += `<rect x="${n1(x0 + i * dw)}" y="${n1(y1 - (j + 1) * dh)}" width="${n1(dw + .6)}" height="${n1(dh + .6)}" fill="${R.lacivert}" fill-opacity="${(Math.pow(e, 1.15) * .92).toFixed(3)}"/>`; } }
      s += hc;
      // parça vurguları: bölge çerçeveleri
      const kutu = (id, segs, fa, fb) => c.P(id, v => v > .01 ? segs.map(q => `<rect x="${n1(X(q[1]))}" y="${n1(Y(fb))}" width="${n1(X(q[2]) - X(q[1]))}" height="${n1(Y(fa) - Y(fb))}" rx="8" fill="${R.mavi}" fill-opacity="${n1(.12 * v)}" stroke="${R.mavi}" stroke-width="${n1(3 * v)}"/>`).join('') : '');
      s += kutu('s_sesi', [seg[0], seg[2]], 3400, 8000) + kutu('a_sesi', [seg[1], seg[3]], 0, 3200);
      s += c.P('formantlar', v => p < .5 ? '' : F.map((Fk, k) => `<line x1="${n1(X(seg[1][1] + .01))}" y1="${n1(Y(Fk))}" x2="${n1(X(seg[1][2] - .01))}" y2="${n1(Y(Fk))}" stroke="${karis(R.sari, R.mavi, v)}" stroke-width="${n1(2.5 + 1.5 * v)}" stroke-dasharray="6 6"/>`
        + c.yazi(X(seg[1][2]) + c.fs(10), Math.min(Y(Fk) + c.fs(7), k ? 1e9 : Y(F[1]) + c.fs(30)), 'F' + (k + 1), {a: 'start', px: 18, fw: 800, renk: karis('#B26B00', R.mavi, v)})).join(''));
      // eksenler
      const xt = [0, .2, .4, .6, .8].map(t => ({x: X(t), e: ekSayi(t, 1)})), yt = [0, 2000, 4000, 6000, 8000].map(f => ({y: Y(f), e: fYazi(f)}));
      s += c.P('zaman_ekseni', v => `<path d="M${x0} ${y1} L${x1} ${y1}" stroke="${karis(R.lacivert, R.mavi, v)}" stroke-width="${n1(2.4 + 2 * v)}"/>`) + c.P('frekans_ekseni', v => `<path d="M${x0} ${y0} L${x0} ${y1}" stroke="${karis(R.lacivert, R.mavi, v)}" stroke-width="${n1(2.4 + 2 * v)}"/>`);
      xt.forEach(q => s += c.yazi(q.x, y1 + c.fs(26), q.e, {fw: 500, px: 18}));
      yt.forEach(q => s += c.yazi(x0 - c.fs(12), q.y + c.fs(6), q.e, {a: 'end', fw: 500, px: 18}));
      s += c.yazi((x0 + x1) / 2, y1 + c.fs(54), L('Zaman (s)', 'Time (s)'), {px: 20}) + c.yazi(x0 - c.fs(64), (y0 + y1) / 2, L('Frekans (Hz)', 'Frequency (Hz)'), {px: 20, ek: `transform="rotate(-90 ${n1(x0 - c.fs(64))} ${n1((y0 + y1) / 2)})"`});
      // ses birimleri
      seg.forEach(q => s += c.yazi(X(mid(q)), y0 - c.fs(10), q[0], {px: 26, fw: 800, ff: 'Outfit', renk: R.mavi, ek: `opacity="${n1(kis((tx - q[1]) / .05))}"`}));
      // koyuluk göstergesi
      s += c.P('koyuluk', v => { let g = `<defs><linearGradient id="${c.gid}ky" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${R.lacivert}" stop-opacity="0"/><stop offset="1" stop-color="${R.lacivert}" stop-opacity=".92"/></linearGradient></defs>`;
        g += `<rect x="${x1 + 30}" y="${y0 + 20}" width="26" height="${y1 - y0 - 40}" rx="6" fill="url(#${c.gid}ky)" stroke="${karis(R.cizgi, R.mavi, v)}" stroke-width="${n1(1.5 + 2 * v)}"/>`;
        return g + c.yazi(x1 + 43, y0 + 12, L('güçlü', 'strong'), {px: 16, fw: 600}) + c.yazi(x1 + 43, y1 - 2, L('zayıf', 'weak'), {px: 16, fw: 600}); });
      // dalga biçimi şeridi
      if (ay.dalga !== false) s += c.P('dalga_bicimi', v => { const yc = 96, pts = [], r2 = ekRast(5);
        for (let k = 0; k <= 700 * p; k++) { const t = k / 700 * Tm, sg = seg.find(q => t >= q[1] && t < q[2]), kn = sg ? Math.min(ss(sg[1], sg[1] + .02, t), 1 - ss(sg[2] - .02, sg[2], t)) : 0;
          const yv = !sg ? 0 : sg[0] === 's' ? (r2() * 2 - 1) * 14 : (Math.sin(t * 2 * Math.PI * 130) * .5 + Math.sin(t * 2 * Math.PI * 750) * .35 + Math.sin(t * 2 * Math.PI * 1250) * .2) * 50;
          pts.push([X(t), yc - yv * kn]); }
        return `<line x1="${x0}" y1="${yc}" x2="${x1}" y2="${yc}" stroke="${R.cizgi}" stroke-width="1.5"/><path d="${yolDiz(pts)}" fill="none" stroke="${karis('#5E6F88', R.mavi, v)}" stroke-width="${n1(1.6 + v)}"/>`; });
      return s; }};
};

// ---------------------------------------------------------------- kaynak-süzgeç modeli: harmonikler x ses yolu süzgeci = formantlı spektrum
CIZ.kaynak_suzgec = (c, ay) => {
  const f0 = ay.f0 || 125, F = ay.formantlar || [500, 1500, 2500], Fm = 4000;
  const H = f => { let m = .03; F.forEach((Fk, k) => m += [1, .62, .4, .3][k] / (1 + Math.pow((f - Fk) / (90 + 25 * k), 2))); return 20 * Math.log10(m); };
  let hmax = -1e9; for (let f = 50; f <= Fm; f += 10) hmax = Math.max(hmax, H(f));
  const Hn = f => H(f) - hmax, K = Array.from({length: Math.floor(Fm / f0)}, (_, i) => (i + 1) * f0), kay = f => -12 * Math.log2(f / f0);
  const P = [[40, 270], [330, 560], [620, 850]], y0 = 120, y1 = 400, dbMin = -60;
  const Xp = (i, f) => P[i][0] + (P[i][1] - P[i][0]) * f / Fm, Yd = d => y1 - (y1 - y0) * (Math.max(d, dbMin) - dbMin) / -dbMin;
  const cik = f => kay(f) + Hn(f) + 14;
  const a = {kaynak: [Xp(0, 1200), Yd(kay(1200))], f0: [Xp(0, f0), Yd(0)], harmonikler: [Xp(0, 2000), Yd(kay(2000))], suzgec: [Xp(1, F[1]), Yd(Hn(F[1]))],
    cikis: [Xp(2, 2000), Yd(cik(2000))], formantlar: [Xp(2, F[0]), Yd(cik(F[0])) - 30], zarf: [Xp(2, 3300), Yd(Hn(3300) + 8)]};
  return {w: 900, h: 500, a, yer: {kaynak: 'ust', f0: 'sol', harmonikler: 'ust', suzgec: 'ust', cikis: 'ust', formantlar: 'ust', zarf: 'sag'},
    takma: {ses_telleri: 'kaynak', ses_yolu: 'suzgec', sonuc: 'cikis', formant: 'formantlar', harmonik: 'harmonikler'}, vurguEsle: {harmonikler: 'kaynak'},
    svg: () => {
      const bk = ekBas(c, ay.kaynak_cumle, .4), bs = ekBas(c, ay.suzgec_cumle, 1.1), bc = ekBas(c, ay.cikis_cumle, 1.8);
      const pk = kis((c.t - bk) / 1), ps = kis((c.t - bs) / 1), pc = kis((c.t - bc) / 1.2);
      let s = '';
      const basl = [L('Kaynak: ses telleri', 'Source: vocal folds'), L('Süzgeç: ses yolu', 'Filter: vocal tract'), L('Sonuç: formantlar', 'Output: formants')];
      P.forEach(([xa, xb], i) => { const op = [pk, ps, pc][i] > 0 ? 1 : .35;
        s += `<g opacity="${op}"><path d="M${xa} ${y0 - 10} L${xa} ${y1} L${xb} ${y1}" fill="none" stroke="${R.lacivert}" stroke-width="2.2"/>`
          + c.yazi(xa, y1 + c.fs(26), '0', {px: 17, fw: 500}) + c.yazi(xb, y1 + c.fs(26), '4k', {px: 17, fw: 500}) + c.yazi((xa + xb) / 2, y1 + c.fs(26), 'Hz', {px: 17, fw: 500})
          + c.yazi((xa + xb) / 2, 62, basl[i], {px: 20, fw: 700, renk: R.lacivert}) + '</g>'; });
      s += c.yazi(300, 270, '×', {px: 44, fw: 700, renk: R.mavi, ek: `opacity="${n1(ps)}"`}) + c.yazi(590, 270, '=', {px: 44, fw: 700, renk: R.mavi, ek: `opacity="${n1(pc)}"`});
      s += c.P(['kaynak', 'harmonikler'], v => K.filter(f => f <= Fm * pk + 1).map(f => `<line x1="${n1(Xp(0, f))}" y1="${y1}" x2="${n1(Xp(0, f))}" y2="${n1(Yd(kay(f)))}" stroke="${karis(R.mavi, R.lacivert, v * .4)}" stroke-width="${n1(2.6 + v)}" stroke-linecap="round"/>`).join(''));
      if (pk > .2) s += c.P('f0', v => c.yazi(Xp(0, f0) + c.fs(4), Yd(0) - c.fs(12), 'F0', {a: 'start', px: 19, fw: 800, renk: karis(R.lacivert, R.mavi, v), ff: 'Outfit'}));
      if (ps > 0) s += c.P('suzgec', v => { const pts = []; for (let f = 40; f <= 40 + (Fm - 40) * ps; f += 15) pts.push([Xp(1, f), Yd(Hn(f))]);
        return `<path d="${gYol(pts)}" fill="none" stroke="${karis(R.sari, R.mavi, v)}" stroke-width="${n1(4.5 + 2 * v)}" stroke-linecap="round"/>`; });
      if (pc > 0) {
        s += c.P('zarf', v => { const pts = []; for (let f = 40; f <= Fm; f += 15) pts.push([Xp(2, f), Yd(Hn(f) + 8)]);
          return `<path d="${gYol(pts)}" fill="none" stroke="${karis(R.sari, R.mavi, v)}" stroke-width="${n1(2.5 + v)}" stroke-dasharray="7 7" opacity="${n1(pc)}"/>`; });
        s += c.P('cikis', v => K.filter(f => f <= Fm * pc + 1).map(f => `<line x1="${n1(Xp(2, f))}" y1="${y1}" x2="${n1(Xp(2, f))}" y2="${n1(Yd(cik(f)))}" stroke="${karis(R.mavi, R.lacivert, v * .4)}" stroke-width="${n1(2.6 + v)}" stroke-linecap="round"/>`).join(''));
        if (pc > .6) s += c.P('formantlar', v => F.map((Fk, k) => c.yazi(Xp(2, Fk), Yd(Hn(Fk) + 8) - c.fs(14), 'F' + (k + 1), {px: 19, fw: 800, ff: 'Outfit', renk: karis('#B26B00', R.mavi, v)})).join(''));
      }
      return s; }};
};

// ---------------------------------------------------------------- yankılanma sönüm eğrisi ve RT60
CIZ.sonum_egrisi = (c, ay) => {
  const rt = ay.rt60 || .8, t0 = ay.kesilme ?? .3, k2 = ay.karsilastir, tm = Math.ceil((t0 + rt * 1.55) / .2) * .2, rnd = ekRast(3), jit = Array.from({length: 400}, () => rnd() * 2 - 1);
  const egri = (r, tb) => t => { const j = jit[Math.floor(t / tm * 399)] * 1.2; return t < t0 ? j * .6 : Math.max(-60 * (t - t0) / r + j, -65 + j * 1.2); };
  const S = [{ad: 'sonum', fn: egri(rt), x: [0, tm], n: 300, renk: 'mavi', kalin: 4.5, cumle: ay.cumle, sure: 2, parca_nokta: [t0 + rt * .5, -30]}];
  if (k2) S.push({ad: 'karsilastirma', fn: egri(k2), x: [0, tm], n: 300, renk: 'gri', kalin: 3.5, kesik: '10 8', cumle: ay.karsilastir_cumle, sure: 2,
    etiket: `RT60 = ${ekSayi(k2, 1)} s`, etiket_konum: [t0 + k2 * .55, -60 * .55], etiket_dx: -12, etiket_dy: 6, etiket_hiza: 'end', parca_nokta: [t0 + k2 * .5, -30]});
  return grafikCizim(c, {x: {min: 0, max: tm, adim: tm > 1.6 ? .4 : .2, ond: 1, ad: L('Zaman (s)', 'Time (s)')}, y: {min: -70, max: 12, isaretler: [0, -20, -40, -60], ad: L('Düzey (dB)', 'Level (dB)')},
    seriler: S,
    isaretler: [{ad: 'kesilme', x: t0, y: 0, cizgi: 'dikey', renk: 'gri', nokta: false, cumle: ay.kesilme_cumle, gecikme: ay.kesilme_cumle != null ? 0 : .6, etiket: L('ses kesilir', 'source stops'), dy: c.fs(34), dx: -c.fs(10), hiza: 'end'},
      {ad: 'altmis_db', x: t0 + rt, y: -60, cizgi: 'yatay', renk: 'sari', dolu: true, r: 8, cumle: ay.rt60_cumle, gecikme: ay.rt60_cumle != null ? 0 : 2.2}],
    araliklar: [{ad: 'rt60', x: [t0, t0 + rt], y: 8, etiket: `RT60 = ${ekSayi(rt, 1)} s`, renk: 'lacivert', cumle: ay.rt60_cumle, gecikme: ay.rt60_cumle != null ? .3 : 2.5},
      {ad: 'altmis_db_ok', xk: t0 + rt + tm * .04, y: [0, -60], etiket: '60 dB', renk: 'sari', cumle: ay.rt60_cumle, gecikme: ay.rt60_cumle != null ? .5 : 2.7}],
    bolgeler: [{ad: 'gurultu_tabani', y: [-70, -62], renk: 'gri', cumle: ay.taban_cumle, gecikme: ay.taban_cumle != null ? 0 : 2.4, opak: .12}],
    yer: {rt60: 'ust', altmis_db: 'sag', altmis_db_ok: 'sag', kesilme: 'sol', sonum: 'sag', gurultu_tabani: 'alt', karsilastirma: 'sol'},
    vurguEsle: {altmis_db: 'altmis_db_ok'}, takma: {kaynak: 'kesilme', yankilanma_suresi: 'rt60'}});
};

// ---------------------------------------------------------------- nistagmus izi (VNG yatay izi): testere dişi (sıçramalı) ya da sarkaç tipi
CIZ.nistagmus_izi = (c, ay) => {
  const sol = ay.yon === 'sol', A = ay.genlik || 7, vs = ay.hiz || 12, Tb = A / vs + .045, sure = ay.sure || 4, sarkac = ay.tur === 'sarkac', sg = sol ? -1 : 1;
  const iz = t => { if (sarkac) return 4 * Math.sin(2 * Math.PI * 1.6 * t);
    const tau = (t + Tb * .3) % Tb, yav = Tb - .045; return sg * (tau < yav ? A / 2 - vs * tau : -A / 2 + A * (tau - yav) / .045); };
  const pts = []; for (let t = 0; t <= sure; t += .004) pts.push([t, iz(t)]);
  // 3. vuruşun yavaş ve hızlı bölümleri
  const k = 2, ta = k * Tb - Tb * .3, yv = [ta, ta + Tb - .045], hz = [ta + Tb - .045, ta + Tb];
  const parca = r => { const o = []; for (let t = r[0]; t <= r[1] + 1e-6; t += .002) o.push([t, iz(Math.min(t, r[1] - 1e-4))]); return o; };
  const S = [{ad: 'iz', noktalar: pts, renk: 'lacivert', kalin: 3.6, cumle: ay.cumle, sure: 2.2}];
  if (!sarkac) S.push({ad: 'yavas_faz', noktalar: parca(yv), renk: 'mavi', kalin: 7, cumle: ay.yavas_cumle, gecikme: ay.yavas_cumle != null ? 0 : 2.3, sure: .6, kirp: false,
    etiket: L('yavaş faz', 'slow phase'), etiket_konum: [(yv[0] + yv[1]) / 2, sg * A * .8], etiket_dx: 0, etiket_dy: sg > 0 ? -2 : 26, etiket_hiza: 'middle'},
    {ad: 'hizli_faz', noktalar: parca(hz), renk: 'sari', kalin: 7, cumle: ay.hizli_cumle, gecikme: ay.hizli_cumle != null ? 0 : 2.8, sure: .3, kirp: false,
    etiket: L('hızlı faz', 'fast phase'), etiket_konum: [hz[1], sg * A * .55], etiket_dx: 14, etiket_dy: 8});
  return grafikCizim(c, {x: {min: 0, max: sure, adim: 1, ad: L('Zaman (s)', 'Time (s)')}, y: {min: -10, max: 10, isaretler: [-10, -5, 0, 5, 10], ad: L('Göz konumu (°)', 'Eye position (°)')},
    seriler: S, a: {yon: [790, 70]}, yer: {yavas_faz: 'alt', hizli_faz: 'ust', iz: 'sol', yon: 'sag'},
    takma: {testere_disi: 'iz', nistagmus: 'iz', yatay_iz: 'iz'},
    ek: c2 => c2.yazi(132, 36 + c2.fs(30), L('sağ ↑', 'right ↑'), {a: 'start', px: 18, fw: 700, renk: R.soluk}) + c2.yazi(132, 440 - c2.fs(12), L('sol ↓', 'left ↓'), {a: 'start', px: 18, fw: 700, renk: R.soluk})
      + c2.P('yon', v => ay.yon_yazi === false ? '' : c2.yazi(845, 36 + c2.fs(30), ay.baslik || (sarkac ? L('sarkaç tipi', 'pendular') : sol ? L('sola vuran nistagmus', 'left-beating nystagmus') : L('sağa vuran nistagmus', 'right-beating nystagmus')),
        {a: 'end', px: 21, fw: 800, ff: 'Outfit', renk: karis(R.lacivert, R.mavi, v)}))});
};

// ---------------------------------------------------------------- faz kilitlenmesi: ses dalgası altında atım dizisi
CIZ.atim_dizisi = (c, ay) => {
  const f = ay.frekans_hz || 250, n = ay.periyot || 6, T = 1000 / f, ates = ay.ates || [1, 0, 1, 1, 0, 1], x0 = 80, x1 = 860, Tm = n * T, X = t => x0 + (x1 - x0) * t / Tm;
  const yc = 170, A = 95, yb = 410, sp = 74, faz = .25, rnd = ekRast(9);
  const atimlar = []; ates.forEach((v, k) => { if (v && k < n) atimlar.push((k + faz) * T + (rnd() - .5) * .25 * T * .4); });
  const ai = atimlar.slice(0, 2);
  const a = {dalga: [X(T * 1.25), yc - A], atimlar: [atimlar.length ? X(atimlar[0]) : X(T * .25), yb - sp], periyot: [X(T * 4.75), yc - A - 40], aralik: [ai.length > 1 ? X((ai[0] + ai[1]) / 2) : X(T), yb + 36], evre: [X(T * 2.25), (yc + yb) / 2]};
  return {w: 900, h: 520, a, yer: {dalga: 'ust', atimlar: 'sol', periyot: 'ust', aralik: 'alt', evre: 'sag'}, takma: {atim_dizisi: 'atimlar', atim: 'atimlar', ses_dalgasi: 'dalga', faz: 'evre'},
    svg: () => {
      const b = ekBas(c, ay.cumle, .4), p = kis((c.t - b) / 1.8), tx = Tm * p;
      let s = `<line x1="${x0}" y1="${yc}" x2="${x1}" y2="${yc}" stroke="${R.cizgi}" stroke-width="2"/><line x1="${x0}" y1="${yb}" x2="${x1}" y2="${yb}" stroke="${R.lacivert}" stroke-width="2.2"/>`;
      s += c.P('dalga', v => { const pts = []; for (let t = 0; t <= tx; t += Tm / 600) pts.push([X(t), yc - A * Math.sin(2 * Math.PI * t / T)]);
        return `<path d="${yolDiz(pts)}" fill="none" stroke="${karis(R.mavi, R.lacivert, v * .3)}" stroke-width="${n1(5 + 2 * v)}" stroke-linecap="round"/>`; });
      s += c.P('evre', v => atimlar.filter(t => t <= tx).map(t => `<line x1="${n1(X(t))}" y1="${n1(yc - A + 8)}" x2="${n1(X(t))}" y2="${yb - sp - 6}" stroke="${karis(R.soluk, R.mavi, v)}" stroke-width="${n1(1.6 + v)}" stroke-dasharray="4 6"/>`).join(''));
      s += c.P('atimlar', v => atimlar.filter(t => t <= tx).map(t => { const q = yay(kis((tx - t) / (Tm * .05))); return `<line x1="${n1(X(t))}" y1="${yb}" x2="${n1(X(t))}" y2="${n1(yb - sp * q)}" stroke="${karis(R.lacivert, R.mavi, v)}" stroke-width="${n1(5 + 2 * v)}" stroke-linecap="round"/>`; }).join(''));
      if (!c.etiketli.has('atimlar')) s += c.yazi(x0, yb + c.fs(30), L('lifin atımları', 'fiber spikes'), {a: 'start', px: 18, fw: 600});
      if (!c.etiketli.has('dalga')) s += c.yazi(x0, yc - A - c.fs(16), L('ses dalgası', 'sound wave'), {a: 'start', px: 18, fw: 600});
      if (p > .98) {
        s += c.P('periyot', v => { const xa = X(T * 4.25), xb = X(T * 5.25), y = yc - A - 22, rr = karis(R.lacivert, R.mavi, v);
          return `<path d="M${n1(xa)} ${y - 9} L${n1(xa)} ${y + 9} M${n1(xb)} ${y - 9} L${n1(xb)} ${y + 9}" stroke="${rr}" stroke-width="2.6"/>` + ekCiftOk(xa, y, xb, y, rr, 2.6, 10) + (c.etiketli.has('periyot') ? '' : c.yazi((xa + xb) / 2, y - c.fs(10), `T = ${ekSayi(T, T % 1 ? 1 : 0)} ms`, {px: 19, fw: 700, renk: rr})); });
        if (ai.length > 1) s += c.P('aralik', v => { const xa = X(ai[0]), xb = X(ai[1]), y = yb + 22, rr = karis(R.sari, R.mavi, v), kat = Math.round((ai[1] - ai[0]) / T);
          return ekCiftOk(xa, y, xb, y, rr, 3, 10) + c.yazi((xa + xb) / 2, y + c.fs(28), `${kat === 1 ? '' : kat}T`, {px: 20, fw: 800, renk: R.lacivert}); });
      }
      return s; }};
};

// ---------------------------------------------------------------- VOR fazı: sinüs biçimli baş hızı ve göz hızı (ters çevrilmiş), faz önü
CIZ.faz_egrileri = (c, ay) => {
  const faz = ay.faz ?? 30, kz = ay.kazanc ?? .9, fr = ay.frekans_hz || .05, Tp = 1 / fr, tm = 2 * Tp, A = 60, ras = faz * Math.PI / 180;
  const bas = t => A * Math.sin(2 * Math.PI * fr * t), goz = t => kz * A * Math.sin(2 * Math.PI * fr * t + ras);
  const tb = Tp / 4 + Tp, tg = tb - faz / 360 * Tp;
  const S = [{ad: 'bas_hizi', fn: bas, x: [0, tm], n: 240, renk: 'lacivert', kalin: 5, cumle: ay.bas_cumle, etiket: L('baş hızı', 'head velocity'), etiket_konum: [Tp * .25, A], etiket_dx: 10, etiket_dy: -14, parca_nokta: [Tp * .62, bas(Tp * .62)]},
    {ad: 'goz_hizi', fn: goz, x: [0, tm], n: 240, renk: 'mavi', kalin: 5, kesik: '12 8', cumle: ay.goz_cumle, gecikme: ay.goz_cumle != null ? 0 : .6, etiket: L('göz hızı (ters çevrilmiş)', 'eye velocity (inverted)'),
      etiket_konum: [Tp * .75 - faz / 360 * Tp, -kz * A], etiket_dx: 0, etiket_dy: 34, etiket_hiza: 'middle', parca_nokta: [Tp * 1.62, goz(Tp * 1.62)]}];
  return grafikCizim(c, {x: {min: 0, max: tm, isaretler: [0, Tp / 2, Tp, Tp * 1.5, tm], yazisiz: true, ad: L('Zaman', 'Time')}, y: {min: -90, max: 105, isaretler: [-60, 0, 60], ad: L('Hız (°/s)', 'Velocity (°/s)')},
    seriler: S, araliklar: faz ? [{ad: 'faz_farki', x: [tg, tb], y: A + 26, etiket: L(`faz önü: ${faz}°`, `phase lead: ${faz}°`), renk: 'sari', cumle: ay.faz_cumle, gecikme: ay.faz_cumle != null ? 0 : 2}] : [],
    isaretler: faz ? [{ad: 'bas_tepe', x: tb, y: A, renk: 'lacivert', r: 7, dolu: true, dus: '', cumle: ay.faz_cumle, gecikme: ay.faz_cumle != null ? 0 : 1.9}, {ad: 'goz_tepe', x: tg, y: kz * A, renk: 'mavi', r: 7, dolu: true, cumle: ay.faz_cumle, gecikme: ay.faz_cumle != null ? 0 : 1.9}] : [],
    ek: (c2, X, Y) => !faz ? '' : `<g opacity="${n1(kis((c2.t - ekBas(c2, ay.faz_cumle, 2) - (ay.faz_cumle != null ? 0 : 0)) / .6))}" stroke="${R.sari}" stroke-width="2" stroke-dasharray="4 5">`
      + `<line x1="${n1(X(tb))}" y1="${n1(Y(A))}" x2="${n1(X(tb))}" y2="${n1(Y(A + 26))}"/><line x1="${n1(X(tg))}" y1="${n1(Y(kz * A))}" x2="${n1(X(tg))}" y2="${n1(Y(A + 26))}"/></g>`,
    yer: {faz_farki: 'ust', bas_hizi: 'sol', goz_hizi: 'sag'}, takma: {faz_onu: 'faz_farki', faz: 'faz_farki', bas: 'bas_hizi', goz: 'goz_hizi'}, vurguEsle: {faz_farki: 'goz_tepe'}});
};

// ---------------------------------------------------------------- plato grafiği (maskeleme): yetersiz maskeleme, plato, aşırı maskeleme
CIZ.plato_grafigi = (c, ay) => {
  const e = ay.esik ?? 45, pl = ay.plato || [35, 75], y = x => x < pl[0] ? e + (x - pl[0]) : x <= pl[1] ? e : e + (x - pl[1]);
  const xs = []; for (let x = 10; x <= 95; x += 5) xs.push(x);
  const rb = ay.bolge_cumleleri || [];
  return grafikCizim(c, {x: {min: 0, max: 100, adim: 20, ad: L('NTE gürültü düzeyi (dB EM)', 'NTE noise level (dB EM)')}, y: {min: 0, max: 80, adim: 20, ad: L('TE eşiği (dB HL)', 'TE threshold (dB HL)')},
    bolgeler: [{ad: 'yetersiz_maskeleme', x: [0, pl[0]], renk: 'sari', etiket: L('yetersiz', 'under'), cumle: rb[0], opak: .12}, {ad: 'plato', x: pl, renk: 'yesil', etiket: L('plato', 'plateau'), cumle: rb[1], opak: .12},
      {ad: 'asiri_maskeleme', x: [pl[1], 100], renk: 'kirmizi', etiket: L('aşırı', 'over'), cumle: rb[2], opak: .10}],
    seriler: [{ad: 'olcumler', noktalar: xs.map(x => [x, y(x)]), renk: 'lacivert', kalin: 4.5, isaretli: true, r: 8, cumle: ay.cumle, sure: 3, parca_nokta: [(pl[0] + pl[1]) / 2, e]}],
    isaretler: [{ad: 'gercek_esik', x: 98, y: e, cizgi: 'yatay', nokta: false, renk: 'yesil', cumle: ay.esik_cumle, gecikme: ay.esik_cumle != null ? 0 : 3, etiket: L('gerçek eşik', 'true threshold'), dx: 0, dy: c.fs(30), hiza: 'end'}],
    yer: {yetersiz_maskeleme: 'ust', plato: 'ust', asiri_maskeleme: 'ust', olcumler: 'alt', gercek_esik: 'sag'}, takma: {yetersiz: 'yetersiz_maskeleme', asiri: 'asiri_maskeleme', plato_bolgesi: 'plato', esikler: 'olcumler'}});
};

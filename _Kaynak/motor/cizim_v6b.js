// AIHEAR Akademi: v6b çizimleri (2.11.2026). sahne.js, cizim_*.js ve cizim_v6.js dosyalarından SONRA yüklenir.
// Var olan çizimlere YALNIZ yeni ayar/mod eklenir; o ayar verilmezse eski çizim AYNEN çağrılır (kulak_kesit: kanal_nesnesi; kulak_zari_otoskopik: patoloji glomus;
// koklea_acik: kemiklesme; vestibuler: dehisans, epley; beyin_sapi_vestibuler: tumor; isitme_yolu: efferent).
// Yeni çizimler: yenidogan_kulak_yolu, ic_kulak_anomali, vng_gozlugu, vestibuler_laboratuvar, posturografi, ses_duzeyi_olcer, dozimetre, isitme_koruyuculari,
// kulaklik_yerlesimi, mr_ic_kulak_yolu, vertebrobaziler, polar_desen, fukuda, kepce_yansima, temporal_kemik_yan, otik_gelisim, larinks_ustten.
// Referanslar: 12_Cizim_Taslaklari/NOTLAR.md ("Ek çizimler", v6b satırları). Yardımcılar cizim_v6.js'ten (v6Gor, v6Yazi, v6Satirlar, v6Kutu, v6Ok, v6YolOk, v6Ikon ...).
const V6B = {kopuk: '#FFC46B', kopukC: '#C98A1C', olcu: '#9FDCCD', olcuC: '#3E9C8A', pamuk: '#FFFFFF', yumusak: '#F6E3DA', yumusakC: '#C9A08E', kemik2: '#CBD6E4',
  kirmizi: '#E46A6E', tumor: '#F2C7B8', tumorC: '#B9735E', turuncu: '#E39A10', arter: '#E5484D', arterIc: '#F7B9BB', gri: '#8D9DB4', koyu: '#3B4A60', ekran: '#0E2240'};
const v6bArdi = (ay, ad, yedek) => ay[ad] != null ? ay[ad] : yedek;
// duvar yüksekliği: noktalar arasında doğrusal (x artan)
function v6bDuvar(pts, x) {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; if (x >= x0 && x <= x1) return y0 + (y1 - y0) * (x - x0) / (x1 - x0); }
  return pts[pts.length - 1][1];
}
// rozet: ikon + kısa yazı (çizim birimi)
function v6bRozet(c, k, x, y, m, ikon, renk, px = 17) {
  const w = olc(duz(m), `800 ${px}px Inter`) / c.k + c.fs(px * 2.9);
  return `<rect x="${n1(x - w / 2)}" y="${n1(y - c.fs(px * 1.25))}" width="${n1(w)}" height="${n1(c.fs(px * 2.5))}" rx="${n1(c.fs(px * 1.25))}" fill="#FFFFFF" stroke="${renk}" stroke-width="${k.W2(2.4)}"/>`
    + v6Ikon(ikon, x - w / 2 + c.fs(px * 1.35), y, c.fs(px * 1.4), renk) + c.yazi(x + c.fs(px * .62), y + c.fs(px * .36), m, {px, fw: 800, renk: R.lacivert});
}
// gözenekli köpük dolgusu (kırpma yolu içinde)
function v6bGozenek(k, d, x0, y0, w, h, tohum, n, renk) {
  const id = uid('gz'), r = ekRast(tohum); let g = `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id})">`;
  for (let i = 0; i < n; i++) g += `<circle cx="${n1(x0 + r() * w)}" cy="${n1(y0 + r() * h)}" r="${n1(1.6 + r() * 2.6)}" fill="${renk}"/>`;
  return g + '</g>';
}

// ================================================================ kulak_kesit + kanal_nesnesi: "otoblok" (ölçü tamponu, iplik, isteğe bağlı ışık ve ölçü maddesi) | "kopuk" (köpük tıkaç)
// Koordinatlar ana kesitin dış katmanı (kanal girişi x 239; kıkırdak bölüm 239-352; kemik bölüm 352'den zara; zar üstte x 505, altta x 660).
// otoblok ayar: {kanal_nesnesi: "otoblok", otoblok_cumle, isik_cumle (ışıkla girişten ikinci kıvrımın ötesine ilerletilir), olcu_cumle (ölçü maddesi dolar),
//   kivrim_cumle (iki kıvrım işareti), ip: true}
// kopuk ayar: {kanal_nesnesi: "kopuk", yuvarla_cumle (kulak dışında ince silindir), cek_cumle (kepçe yukarı ve geriye oku), tak_cumle (kanala girer ve genişler),
//   sig_cumle (sağ altta derin / sığ karşılaştırma paneli), yerlesim: "derin" | "sig"}
(() => {
  const eski = CIZ.kulak_kesit;
  const UST = [[239, 372], [300, 368], [334, 362], [401, 354], [465, 343], [505, 330]], ALT = [[239, 532], [300, 535], [334, 538], [401, 546], [497, 559], [593, 565], [634, 562], [660, 552]];
  const ust = x => v6bDuvar(UST, x), alt = x => v6bDuvar(ALT, x);
  // kanal içinde x0..x1 arasında duvarlara oturan dolgu yolu (iç boşluk e kadar)
  const dolgu = (x0, x1, e = 4, r = 10) => { const n = 8, ust2 = [], alt2 = [];
    for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; ust2.push([x, ust(x) + e]); alt2.push([x, alt(x) - e]); }
    return gYol([[x0 - r * .3, (ust(x0) + alt(x0)) / 2]].concat(ust2, [[x1 + r * .3, (ust(x1) + alt(x1)) / 2]], alt2.reverse()), true, .25); };
  CIZ.kulak_kesit = (c, ay) => {
    const tur = String(ay.kanal_nesnesi || '').toLowerCase();
    if (!tur) return eski(c, ay);
    const d = eski(c, ay), s0 = d.svg;
    d.a = Object.assign({}, d.a); d.yer = Object.assign({}, d.yer); d.takma = Object.assign({}, d.takma || {}); d.kam = Object.assign({}, d.kam || {});
    const kv = {birinci_kivrim: [262, 368], ikinci_kivrim: [350, 362], kivrimlar: [350, 362]};
    Object.assign(d.a, kv); Object.assign(d.yer, {birinci_kivrim: 'ust', ikinci_kivrim: 'ust', kivrimlar: 'ust'});
    Object.assign(d.takma, {ilk_kivrim: 'birinci_kivrim', ikinci_kivrimi: 'ikinci_kivrim', kemik_kikirdak_kivrimi: 'ikinci_kivrim'});
    const kivrimSvg = (k, P) => { if (ay.kivrim_cumle == null && !c.v.ikinci_kivrim && !c.v.kivrimlar && !c.etiketli.has('ikinci_kivrim')) return '';
      const p = v6Gor(c, ay.kivrim_cumle, .4, .6); if (p <= 0) return '';
      const cz = (id, x, m) => P([id, 'kivrimlar'], () => k.yol(`M${x} ${n1(ust(x) + 3)} L${x} ${n1(alt(x) - 3)}`, 'none', R.mavi, 2.4, `stroke-dasharray="${k.W2(7)} ${k.W2(6)}"`)
        + `<circle cx="${x}" cy="${n1(ust(x) - c.fs(22))}" r="${n1(c.fs(15))}" fill="#FFFFFF" stroke="${R.mavi}" stroke-width="${k.W2(2.2)}"/>` + c.yazi(x, ust(x) - c.fs(22) + c.fs(6), m, {px: 17, fw: 800, renk: R.mavi}));
      return `<g opacity="${n1(p)}">` + cz('birinci_kivrim', 262, '1') + cz('ikinci_kivrim', 350, '2') + '</g>'; };
    if (tur === 'otoblok' || tur === 'olcu') {
      const X1 = 364, X2 = 412;
      Object.assign(d.a, {otoblok: [388, 452], olcu_tamponu: [388, 452], tampon: [388, 452], ip: [176, 610], iplik: [176, 610], olcu_maddesi: [300, 452], olcu: [300, 452], isik: [150, 452], kulak_feneri: [150, 452]});
      Object.assign(d.yer, {otoblok: 'ust', olcu_tamponu: 'ust', tampon: 'ust', ip: 'alt', iplik: 'alt', olcu_maddesi: 'alt', olcu: 'alt', isik: 'ust', kulak_feneri: 'ust'});
      Object.assign(d.takma, {olcu_tamponu: 'otoblok', tampon: 'otoblok', iplik: 'ip', olcu: 'olcu_maddesi', olcu_materyali: 'olcu_maddesi', kulak_feneri: 'isik'});
      Object.assign(d.kam, {otoblok: [360, 450], olcu_maddesi: [320, 450]});
      d.svg = () => {
        const k = kalem(c, 1), P = anP(c);
        let s = s0();
        const po = v6Gor(c, ay.otoblok_cumle, .3, .6), pi = ay.isik_cumle != null ? ilerle(c.t, c.cb(ay.isik_cumle) + .4, 2.2) : 1;
        const pc = ay.isik_cumle != null ? ilerle(c.t, c.cb(ay.isik_cumle) + 2.8, 1) : 1;   // ışık geri çekilir
        const pm = ay.olcu_cumle != null ? ilerle(c.t, c.cb(ay.olcu_cumle) + .3, 2.4) : 0;
        const dx = -150 * (1 - yumIO(pi));   // tampon girişten ilerler
        if (pm > 0) { const xm = X1 - (X1 - 239) * kis(pm / .7), q = kis((pm - .55) / .45);
          s += P(['olcu_maddesi'], () => k.yol(dolgu(xm, X1 + 2, 3, 6), V6B.olcu, V6B.olcuC, 2.2)
            + (q > 0 ? `<g opacity="${n1(q)}">` + k.yol(gYol([[244, 380], [214, 352], [186, 360], [170, 420], [168, 500], [182, 560], [214, 572], [244, 528]], true, .4), V6B.olcu, V6B.olcuC, 2.2) + '</g>' : '')); }
        if (po > 0) {
          s += `<g opacity="${n1(po)}"><g transform="translate(${n1(dx)} 0)">`;
          if (ay.ip !== false) s += P(['ip'], () => k.yol(`M${X1} 470 C 300 476 250 480 226 500 C 200 522 186 560 176 640`, 'none', '#7A8BA4', 2.2));
          s += P(['otoblok'], () => { const dd = dolgu(X1, X2, 5, 12); return k.yol(dd, V6B.pamuk, '#7A8BA4', 2.4)
            + `<g opacity=".7">` + [0, 1, 2, 3].map(i => k.yol(`M${X1 + 8 + i * 10} ${n1(ust(X1) + 18 + i * 8)} C ${X1 + 18 + i * 8} 430 ${X1 + 4 + i * 10} 480 ${X1 + 14 + i * 9} ${n1(alt(X1) - 20)}`, 'none', '#C6D3E3', 1.4)).join('') + '</g>'; });
          s += '</g></g>';
          // ışık (kulak feneri): tamponu iten ince çubuk, uçta ışık
          if (ay.isik_cumle != null && c.t > c.cb(ay.isik_cumle) && pc < 1) { const ux = X1 + dx - 2, op = 1 - pc;
            s += `<g opacity="${n1(op)}">` + P(['isik'], () => k.boru(`M40 452 L${n1(ux - 10)} 452`, k.w(12), '#DCE6F3', NV, 2) + k.yol(`M-40 436 L44 436 L44 468 L-40 468 Z`, '#5E6F88', NV, 2.2)
              + `<circle cx="${n1(ux - 8)}" cy="452" r="12" fill="#FFE8A3" stroke="${R.sari}" stroke-width="${k.W2(2)}"/>`
              + `<circle cx="${n1(ux - 8)}" cy="452" r="${n1(26 + 4 * Math.sin(c.t * 6))}" fill="${R.sari}" opacity=".18"/>`) + '</g>'; }
        }
        s += kivrimSvg(k, P);
        return s; };
      return d;
    }
    if (tur === 'kopuk' || tur === 'kopuk_derin' || tur === 'kopuk_sig') {
      const sig0 = tur === 'kopuk_sig' || ay.yerlesim === 'sig', D = [226, 344], S = [158, 262], AY = sig0 ? S : D;
      const tikac = (xa, xb, e, hs = 46) => { const orta = 452, n = 10, ust2 = [], alt2 = [];
        for (let i = 0; i <= n; i++) { const x = xa + (xb - xa) * i / n, u = x >= 239 ? ust(x) + 4 : 372 - 14 * (239 - x) / 80, a2 = x >= 239 ? alt(x) - 4 : 532 + 14 * (239 - x) / 80;
          ust2.push([x, orta - hs / 2 + (u - (orta - hs / 2)) * e]); alt2.push([x, orta + hs / 2 + (a2 - (orta + hs / 2)) * e]); }
        return gYol([[xa - 6, orta]].concat(ust2, [[xb + 6, orta]], alt2.reverse()), true, .25); };
      Object.assign(d.a, {kopuk_tikac: [(AY[0] + AY[1]) / 2 + 10, 452], tikac: [(AY[0] + AY[1]) / 2 + 10, 452], kulak_tikaci: [(AY[0] + AY[1]) / 2 + 10, 452], cekme: [118, 150], kepce_cekme: [118, 150],
        derin_yerlesim: [300, 400], sig_yerlesim: [200, 500], yuvarlanmis: [120, 830]});
      Object.assign(d.yer, {kopuk_tikac: 'ust', tikac: 'ust', kulak_tikaci: 'ust', cekme: 'sol', kepce_cekme: 'sol', derin_yerlesim: 'ust', sig_yerlesim: 'alt', yuvarlanmis: 'alt'});
      Object.assign(d.takma, {tikac: 'kopuk_tikac', kulak_tikaci: 'kopuk_tikac', kopuk: 'kopuk_tikac', kepce_cekme: 'cekme', derin: 'derin_yerlesim', sig: 'sig_yerlesim'});
      Object.assign(d.kam, {kopuk_tikac: [290, 452], derin_yerlesim: [260, 452], sig_yerlesim: [260, 452]});
      d.svg = () => {
        const k = kalem(c, 1), P = anP(c);
        let s = s0();
        const ty = ekBas(c, ay.yuvarla_cumle, null), tt = ay.tak_cumle != null ? c.cb(ay.tak_cumle) : null;
        // yuvarlanır (dışarıda, kulak memesinin altında), kanala girer (g), genişler (e); sig_cumle: dışa kayar (q), derin yer kesik çizgiyle kalır
        const yv = ty != null ? ilerle(c.t, ty + .3, 1.4) : 1, g = tt != null ? ilerle(c.t, tt + .2, 1.2) : (ty != null ? 0 : 1), e = tt != null ? ilerle(c.t, tt + 1.6, 2.2) : (ty != null ? 0 : 1);
        const q = ay.sig_cumle != null ? ilerle(c.t, c.cb(ay.sig_cumle) + .3, 1.4) : 0;
        const gor = ty == null || c.t > ty;
        if (gor) {
          if (g <= 0) { const h = 110 - 64 * yumIO(yv), x0 = 50, x1 = 206, yy = 830;
            s += P(['kopuk_tikac', 'yuvarlanmis'], () => { const dd = gYol([[x0, yy - h / 2], [x1, yy - h / 2], [x1 + 6, yy], [x1, yy + h / 2], [x0, yy + h / 2], [x0 - 6, yy]], true, .2);
              return k.yol(dd, V6B.kopuk, V6B.kopukC, 2.4) + v6bGozenek(k, dd, x0, yy - h / 2, x1 - x0, h, 11, 40, '#E9A94A'); });
          } else { const u = yumIO(g), xa0 = 50 + (AY[0] - 50) * u, xb0 = 206 + (AY[1] - 206) * u, yy = 830 + (452 - 830) * u;
            const xa = xa0 + (S[0] - xa0) * q, xb = xb0 + (S[1] - xb0) * q;
            if (q > 0) s += `<g opacity="${n1(q)}">` + P(['derin_yerlesim'], () => k.yol(tikac(D[0], D[1], 1), 'none', R.basari, 2.6, `stroke-dasharray="${k.W2(7)} ${k.W2(5)}"`)
              + v6Ikon('dogru', (D[0] + D[1]) / 2 + 20, 452, c.fs(40), R.basari)) + '</g>';
            const dd = tikac(xa, xb, e).replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, (m, x, y) => `${x} ${n1(+y + (yy - 452))}`);
            s += P(['kopuk_tikac'].concat(q > .5 ? ['sig_yerlesim'] : []), () => k.yol(dd, V6B.kopuk, V6B.kopukC, 2.4) + v6bGozenek(k, dd, xa - 10, yy - 110, xb - xa + 20, 220, 7, 50, '#E9A94A'));
            if (q > .3) s += `<g opacity="${n1(kis((q - .3) / .7))}">` + v6Ikon('yanlis', (S[0] + S[1]) / 2 - 20, 452, c.fs(40), R.sag_kulak) + '</g>';
          }
        }
        // kepçe yukarı ve geriye çekilir
        if (ay.cek_cumle != null) { const p = v6Gor(c, ay.cek_cumle, 0, .6), r = ilerle(c.t, c.cb(ay.cek_cumle) + .3, .9);
          if (p > 0) s += `<g opacity="${n1(p)}">` + P(['cekme'], () => v6YolOk(k, 'M150 250 C 140 200 126 170 104 130', r, R.mavi, 5, [104, 130, -2.1], {b: 18})) + '</g>'; }
        s += kivrimSvg(k, P);
        return s; };
      return d;
    }
    return d;
  };
})();

// ================================================================ yenidoğan kulak yolu: yetişkin ile yan yana (aynı ölçek; koronal şema)
// Yenidoğanda kanal kısa ve dar, duvarlar büyük ölçüde yumuşak doku (kemik bölüm yalnız timpanik halka; doğumdan sonra gelişir), zar daha yatay, orta kulak küçük.
// ayar: {yetiskin: true, basinc_cumle (yumuşak duvar basınçla genişler-daralır), aci_cumle (zar açıları), sivi_cumle (orta kulakta artık sıvı)}
CIZ.yenidogan_kulak_yolu = (c, ay) => {
  const yet = ay.yetiskin !== false, W = yet ? 1000 : 560, ox = yet ? 470 : 30;
  // panel: dış kenar x0, kanal ekseni y0, uzunluk L (taban boyunca), çap D, kemik oranı, zar açısı (derece; kanal eksenine göre)
  const YT = {x0: 40, y0: 205, L: 330, D: 92, kemik: .62, aci: 48}, YD = {x0: ox + 70, y0: 205, L: 190, D: 56, kemik: .12, aci: 24};
  const tm = p => { const xt = p.x0 + p.L - p.D / Math.tan(p.aci * Math.PI / 180); return [[xt, p.y0 - p.D / 2], [p.x0 + p.L, p.y0 + p.D / 2]]; };
  const a = {dis_kulak_yolu: [YD.x0 + YD.L * .4, YD.y0], yenidogan_kulak_yolu: [YD.x0 + YD.L * .4, YD.y0], yumusak_duvar: [YD.x0 + YD.L * .45, YD.y0 - YD.D / 2 - 14],
    timpanik_membran: [(tm(YD)[0][0] + tm(YD)[1][0]) / 2, YD.y0], orta_kulak: [YD.x0 + YD.L + 40, YD.y0 - 10], timpanik_halka: [YD.x0 + YD.L - 10, YD.y0 + YD.D / 2 + 16],
    yetiskin_kulak_yolu: [YT.x0 + YT.L * .35, YT.y0], yetiskin_timpanik_membran: [(tm(YT)[0][0] + tm(YT)[1][0]) / 2, YT.y0], kemik_bolum: [YT.x0 + YT.L * .6, YT.y0 - YT.D / 2 - 16],
    kikirdak_bolum: [YT.x0 + YT.L * .18, YT.y0 - YT.D / 2 - 16], yetiskin_orta_kulak: [YT.x0 + YT.L + 60, YT.y0], basinc: [YD.x0 + YD.L * .45, YD.y0 + YD.D / 2 + 30],
    yetiskin: [YT.x0 + YT.L / 2, 60], yenidogan: [YD.x0 + YD.L / 2, 60]};
  const takma = {kulak_yolu: 'dis_kulak_yolu', kulak_zari: 'timpanik_membran', yumusak_doku: 'yumusak_duvar', kemik_kanal: 'kemik_bolum', kikirdak: 'kikirdak_bolum'};
  if (!yet) Object.keys(a).filter(q => q.startsWith('yetiskin') || q === 'kemik_bolum' || q === 'kikirdak_bolum').forEach(q => delete a[q]);
  return {w: W, h: 400, cm: 1.05, a: takmaAd(a, takma), takma, kam: {yenidogan: [YD.x0 + YD.L / 2 + 40, YD.y0], dis_kulak_yolu: [YD.x0 + YD.L / 2 + 40, YD.y0], orta_kulak: [YD.x0 + YD.L + 20, YD.y0]},
    yer: {dis_kulak_yolu: 'alt', yenidogan_kulak_yolu: 'alt', yumusak_duvar: 'ust', timpanik_membran: 'ust', orta_kulak: 'ust', timpanik_halka: 'alt', yetiskin_kulak_yolu: 'alt', yetiskin_timpanik_membran: 'ust',
      kemik_bolum: 'ust', kikirdak_bolum: 'ust', yetiskin_orta_kulak: 'alt', basinc: 'alt', yetiskin: 'ust', yenidogan: 'ust'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c), tb = ay.basinc_cumle != null ? c.cb(ay.basinc_cumle) : 0, pb = ay.basinc_cumle != null ? ilerle(c.t, tb + .2, .8) : 0, salin = pb * Math.sin((c.t - tb) * 2.4);
      const pa = ay.aci_cumle != null ? v6Gor(c, ay.aci_cumle, 0, .6) : 0, ps = ay.sivi_cumle != null ? v6Gor(c, ay.sivi_cumle, 0, 1) : 0;
      const panel = (p, yd) => {
        const [T0, T1] = tm(p), u = p.y0 - p.D / 2, al = p.y0 + p.D / 2, xk = p.x0 + p.L * (1 - p.kemik), dw = yd ? 7 * salin : 0, t = 34;
        const ids = id => yd ? [id] : ['yetiskin_' + id];
        let g = '';
        // çevre doku bloğu
        g += k.yol(`M${p.x0 - 30} ${u - t - 40} L${T1[0] + 10} ${u - t - 40} L${T1[0] + 10} ${al + t + 40} L${p.x0 - 30} ${al + t + 40} Z`, AR.doku, null);
        // duvarlar: yumuşak (kıkırdak / yumuşak doku) ve kemik bantları
        const bant = (x0, x1, y, yon, renk, cz) => k.yol(`M${n1(x0)} ${n1(y)} L${n1(x1)} ${n1(y)} L${n1(x1)} ${n1(y + yon * t)} L${n1(x0)} ${n1(y + yon * t)} Z`, renk, cz, 1.6);
        g += P(yd ? ['yumusak_duvar', 'dis_kulak_yolu'] : ['kikirdak_bolum', 'yetiskin_kulak_yolu'], () => bant(p.x0, xk, u - dw, -1, V6B.yumusak, V6B.yumusakC) + bant(p.x0, xk, al + dw, 1, V6B.yumusak, V6B.yumusakC));
        g += P(yd ? ['timpanik_halka', 'dis_kulak_yolu'] : ['kemik_bolum', 'yetiskin_kulak_yolu'], () => bant(xk, T1[0], u, -1, V6B.kemik2, NV) + bant(xk, T1[0], al, 1, V6B.kemik2, NV));
        // lümen
        const lum = `M${p.x0 - 30} ${n1(u - dw)} L${n1(xk)} ${n1(u - dw)} L${n1(T0[0])} ${n1(u)} L${n1(T1[0])} ${n1(al)} L${n1(xk)} ${n1(al + dw)} L${p.x0 - 30} ${n1(al + dw)} Z`;
        g += P(ids('dis_kulak_yolu').concat(yd ? ['yenidogan_kulak_yolu'] : []), () => k.yol(lum, '#FFFFFF', null)
          + k.yol(`M${p.x0 - 30} ${n1(u - dw)} L${n1(xk)} ${n1(u - dw)} L${n1(T0[0])} ${n1(u)} M${p.x0 - 30} ${n1(al + dw)} L${n1(xk)} ${n1(al + dw)} L${n1(T1[0])} ${n1(al)}`, 'none', NV, 2.4));
        // orta kulak (zarın ötesi) ve zar
        const om = yd ? [T1[0] + 4, p.y0 - 64, 70, 120] : [T1[0] + 4, p.y0 - 116, 112, 210];
        g += P(ids('orta_kulak'), () => k.yol(gYol([[T0[0], u], [om[0] + om[2] * .5, om[1]], [om[0] + om[2], om[1] + om[3] * .3], [om[0] + om[2], om[1] + om[3] * .8], [om[0] + om[2] * .6, om[1] + om[3]], [T1[0], al]], false, .4) + `L${n1(T0[0])} ${n1(u)}Z`, '#FFFFFF', NV, 2.2)
          + (yd && ps > 0 ? `<g opacity="${n1(ps)}"><path d="M${n1(T1[0] - 4)} ${n1(al - 6)} L${n1(om[0] + om[2] * .62)} ${n1(om[1] + om[3] - 6)} C ${n1(om[0] + om[2] * .9)} ${n1(om[1] + om[3] * .85)} ${n1(om[0] + om[2])} ${n1(om[1] + om[3] * .7)} ${n1(om[0] + om[2] - 2)} ${n1(om[1] + om[3] * .62)} L${n1(T1[0] + 12)} ${n1(om[1] + om[3] * .62)} Z" fill="#F3D9A4" opacity=".85"/></g>` : ''));
        g += P(ids('timpanik_membran'), () => k.yol(`M${n1(T0[0])} ${n1(u)} L${n1(T1[0])} ${n1(al)}`, 'none', NV, 7.6) + k.yol(`M${n1(T0[0])} ${n1(u)} L${n1(T1[0])} ${n1(al)}`, 'none', AR.zar, 3.6));
        // zar açısı (kanal tabanına göre)
        if (pa > 0) { const r = 56, a1 = Math.atan2(T0[1] - T1[1], T0[0] - T1[0]);
          g += `<g opacity="${n1(pa)}">` + k.yol(`M${n1(T1[0] - r - 16)} ${n1(al)} L${n1(T1[0])} ${n1(al)}`, 'none', R.mavi, 2.4)
            + `<path d="M${n1(T1[0] - r)} ${n1(al)} A${r} ${r} 0 0 1 ${n1(T1[0] + r * Math.cos(a1))} ${n1(al + r * Math.sin(a1))}" fill="none" stroke="${R.mavi}" stroke-width="${k.W2(3)}"/>`
            + c.yazi(T1[0] - r - 22, al - 10, `${p.aci}°`, {a: 'end', px: 18, fw: 800, renk: R.mavi}) + '</g>'; }
        // ölçü çizgisi
        g += v6Ok(k, p.x0, al + t + 22, p.x0 + p.L, al + t + 22, R.soluk, 1.8, true, 9) + c.yazi(p.x0 + p.L / 2, al + t + 50, yd ? L('kısa ve dar', 'short and narrow') : L('yaklaşık 2,5 cm', 'about 2.5 cm'), {px: 17, fw: 700, renk: R.soluk});
        return g; };
      let s = '';
      if (yet) s += P(['yetiskin'], () => panel(YT, false) + c.yazi(YT.x0 + YT.L / 2 + 20, 26, L('Yetişkin', 'Adult'), {px: 24, fw: 800, ff: 'Outfit', renk: R.soluk}))
        + `<path d="M${ox - 10} 10 L${ox - 10} 360" stroke="${R.cizgi}" stroke-width="${k.W2(2)}"/>`;
      s += P(['yenidogan'], () => panel(YD, true) + c.yazi(YD.x0 + YD.L / 2 + 20, 26, L('Yenidoğan', 'Newborn'), {px: 24, fw: 800, ff: 'Outfit', renk: R.lacivert}));
      if (pb > 0) { const x = YD.x0 + YD.L * .3, u = YD.y0 - YD.D / 2 - 40, al = YD.y0 + YD.D / 2 + 40;
        s += `<g opacity="${n1(pb)}">` + P(['basinc'], () => v6Ok(k, x, u + 4 - 7 * salin, x, u - 22 - 7 * salin, R.mavi, 3, false, 10) + v6Ok(k, x, al - 4 + 7 * salin, x, al + 22 + 7 * salin, R.mavi, 3, false, 10)) + '</g>'; }
      // lejant
      s += `<rect x="${ox + 30}" y="378" width="22" height="16" rx="3" fill="${V6B.yumusak}" stroke="${V6B.yumusakC}" stroke-width="${k.W2(1.4)}"/>` + c.yazi(ox + 60, 392, L('yumuşak doku / kıkırdak', 'soft tissue / cartilage'), {a: 'start', px: 15, fw: 600})
        + `<rect x="${ox + 300}" y="378" width="22" height="16" rx="3" fill="${V6B.kemik2}" stroke="${NV}" stroke-width="${k.W2(1.4)}"/>` + c.yazi(ox + 330, 392, L('kemik', 'bone'), {a: 'start', px: 15, fw: 600});
      return s; }};
};

// ================================================================ iç kulak anomalileri (Sennaroğlu sınıflaması): şematik eksenel BT kesiti (sağ kulak; önde koklea, arkada vestibül
// ve lateral kanal, medialde iç kulak yolu). Kemik açık gri, sıvı boşlukları mavi; yokluk kesik hayalet çizgiyle. Kaynak: Sennaroğlu ve Bajin 2017 (Balkan Med J 34: 397-411).
// ayar: {tip: "normal"|"michel"|"otokist"|"koklear_aplazi"|"ortak_kavite"|"hipoplazi_1".."hipoplazi_4"|"ip1"|"ip2"|"ip3"} (tek panel)
//   ya da {tipler: [...], cumleler: [...] (her panelin belirdiği cümle), genis_vestibul: true (koklear aplazide), ana: "ip2" (öneksiz etiket noktalarının paneli), hayalet: false}
// Parçalar: her panel tip adıyla (michel, ip2 ...); yapılar öneksiz (ana panel) ya da önekli (ip2_koklea): koklea, bazal_tur, tepe (= kistik_tepe), modiolus, vestibul,
//   lateral_kanal (= yarim_daire_kanallari), ic_kulak_yolu, vestibuler_akuadukt, ortak_kavite, otokist, yok (aplazide koklea yeri)
const IKA_AD = {normal: L('Normal', 'Normal'), michel: L('Michel aplazisi', 'Michel aplasia'), otokist: L('Rudimenter otokist', 'Rudimentary otocyst'),
  koklear_aplazi: L('Koklear aplazi', 'Cochlear aplasia'), ortak_kavite: L('Ortak kavite', 'Common cavity'), hipoplazi_1: L('Koklear hipoplazi I', 'Cochlear hypoplasia I'),
  hipoplazi_2: L('Koklear hipoplazi II', 'Cochlear hypoplasia II'), hipoplazi_3: L('Koklear hipoplazi III', 'Cochlear hypoplasia III'), hipoplazi_4: L('Koklear hipoplazi IV', 'Cochlear hypoplasia IV'),
  ip1: L('IP-I', 'IP-I'), ip2: L('IP-II (Mondini)', 'IP-II (Mondini)'), ip3: L('IP-III', 'IP-III')};
const IKA_ALT = {normal: L('2,5 tur, modiolus', '2.5 turns, modiolus'), michel: L('iç kulak yok', 'no inner ear'), otokist: L('küçük kist, bağlantı yok', 'small cyst, no connection'),
  koklear_aplazi: L('koklea yok', 'no cochlea'), ortak_kavite: L('tek boşluk', 'single cavity'), hipoplazi_1: L('tomurcuk', 'bud'), hipoplazi_2: L('kistik, küçük', 'small, cystic'),
  hipoplazi_3: L('2 turdan az', 'fewer than 2 turns'), hipoplazi_4: L('bazal tur normal', 'normal basal turn'), ip1: L('kistik, modiolus yok', 'cystic, no modiolus'),
  ip2: L('tepe kistik, akuadukt geniş', 'cystic apex, large aqueduct'), ip3: L('septa var, modiolus yok', 'septa, no modiolus')};
const IKA_ES = {mondini: 'ip2', ip_1: 'ip1', ip_2: 'ip2', ip_3: 'ip3', ip_i: 'ip1', ip_ii: 'ip2', ip_iii: 'ip3', hipoplazi: 'hipoplazi_3', ch1: 'hipoplazi_1', ch2: 'hipoplazi_2', ch3: 'hipoplazi_3',
  ch4: 'hipoplazi_4', rudimenter_otokist: 'otokist', aplazi: 'koklear_aplazi', ortak: 'ortak_kavite', labirent_aplazisi: 'michel'};
// panel: 300 x 270 kesit + altında iki satır yazı; sol üst (x, y). P(idListesi, fn). Döner {svg, a}
function ikaPanel(c, k, P, tip, x, y, o = {}) {
  const X = v => x + v, Y = v => y + v, pre = o.pre || '';
  const KO = [140, 92], VE = [192, 178], LK = [248, 196];
  const a = {}; const nok = (id, p) => { a[pre + id] = [X(p[0]), Y(p[1])]; };
  const ID = id => [pre + id];
  let g = k.yol(gYol([[X(0), Y(20)], [X(150), Y(0)], [X(300), Y(30)], [X(300), Y(270)], [X(0), Y(270)]], true, .2), '#EEF2F8', null);
  const sv = (d, id) => P(ID(id), () => k.yol(d, AR.sivi, NV, 2.4));
  const hayalet = d => o.hayalet === false ? '' : k.yol(d, 'none', '#AEBBCD', 1.6, `stroke-dasharray="${k.W2(5)} ${k.W2(5)}"`);
  const iac = (gen = 34, uz = 118, ac = false) => { nok('ic_kulak_yolu', [uz * .4, 150]);
    return P(ID('ic_kulak_yolu'), () => k.yol(ac ? `M${X(0)} ${Y(150 - gen / 2)} L${X(uz)} ${Y(150 - gen / 2 - 6)} L${X(uz + 10)} ${Y(132)} L${X(uz + 10)} ${Y(168)} L${X(uz)} ${Y(150 + gen / 2 + 6)} L${X(0)} ${Y(150 + gen / 2)} Z`
      : `M${X(0)} ${Y(150 - gen / 2)} L${X(uz)} ${Y(150 - gen / 2)} C ${X(uz + 12)} ${Y(150 - gen / 2)} ${X(uz + 12)} ${Y(150 + gen / 2)} ${X(uz)} ${Y(150 + gen / 2)} L${X(0)} ${Y(150 + gen / 2)} Z`, AR.sivi, NV, 2.2)); };
  const koklea = (o2 = {}) => { const [cx, cy] = KO, s2 = o2.s || 1, rx = (o2.rx || 54) * s2, ry = (o2.ry || 46) * s2;
    nok('koklea', KO); nok('bazal_tur', [cx - rx * .55, cy + ry * .55]); nok('tepe', [cx + rx * .2, cy - ry * .45]); nok('modiolus', [cx - 14, cy + 14]);
    let gg = sv(gElips(X(cx), Y(cy), rx, ry), 'koklea');
    // interskalar septum: tabandan (iç kulak yolu tarafı, alt sol) tepeye sarmal
    const tur = o2.tur ?? 1.75;
    if (o2.septa !== false && tur > 0) { const N = Math.round(70 * tur), pts = [];
      for (let i = 0; i <= N; i++) { const u = i / N, th = (148 + u * tur * 360) * Math.PI / 180, f = .97 - .78 * u; pts.push([X(cx + 4 + rx * f * Math.cos(th)), Y(cy - 2 + ry * f * Math.sin(th))]); }
      gg += P(ID('koklea'), () => k.yol(gYol(pts, false, .5), 'none', NV, 2.2)); }
    if (o2.modiolus !== false) gg += P(ID('modiolus'), () => k.yol(`M${X(116)} ${Y(141)} L${X(cx + 2)} ${Y(cy - 2)} L${X(cx + 8)} ${Y(cy + 6)} L${X(118)} ${Y(159)} Z`, V6B.kemik2, '#7A8BA4', 1.4));
    return gg; };
  const vestibul = (gen = 1) => { nok('vestibul', VE); return sv(gElips(X(VE[0]), Y(VE[1]), 30 * gen, 24 * gen), 'vestibul'); };
  const lkanal = () => { nok('lateral_kanal', [LK[0] + 34, LK[1]]); nok('yarim_daire_kanallari', [LK[0] + 34, LK[1]]);
    return P(ID('lateral_kanal').concat([pre + 'yarim_daire_kanallari']), () => k.yol(gElips(X(LK[0]), Y(LK[1]), 34, 28), 'none', NV, 13) + k.yol(gElips(X(LK[0]), Y(LK[1]), 34, 28), 'none', AR.sivi, 8.4)
      + k.yol(gElips(X(LK[0] - 22), Y(LK[1] + 50), 8, 8), AR.sivi, NV, 2)); };
  const akuadukt = (gen = false) => { nok('vestibuler_akuadukt', [138, 240]);
    return P(ID('vestibuler_akuadukt'), () => gen ? k.yol(`M${X(180)} ${Y(196)} C ${X(162)} ${Y(222)} ${X(140)} ${Y(240)} ${X(112)} ${Y(258)} L${X(98)} ${Y(238)} C ${X(124)} ${Y(222)} ${X(150)} ${Y(206)} ${X(170)} ${Y(188)} Z`, AR.sivi, NV, 2)
      : k.yol(`M${X(176)} ${Y(200)} C ${X(158)} ${Y(222)} ${X(140)} ${Y(236)} ${X(116)} ${Y(252)}`, 'none', NV, 1.8)); };
  const hayaletNormal = (kok = true, ves = true) => (kok ? hayalet(gElips(X(KO[0]), Y(KO[1]), 54, 46)) : '') + (ves ? hayalet(gElips(X(VE[0]), Y(VE[1]), 30, 24)) + hayalet(gElips(X(LK[0]), Y(LK[1]), 34, 28)) : '');
  switch (tip) {
    case 'michel': g += hayaletNormal() + hayalet(`M${X(0)} ${Y(133)} L${X(118)} ${Y(133)} M${X(0)} ${Y(167)} L${X(118)} ${Y(167)}`); nok('koklea', KO); nok('vestibul', VE); nok('yok', [150, 140]); break;
    case 'otokist': g += hayaletNormal() + sv(gElips(X(196), Y(166), 24, 20), 'otokist'); nok('otokist', [196, 166]); nok('koklea', KO); nok('yok', KO); break;
    case 'koklear_aplazi': { const gv = o.genis_vestibul ? 1.45 : 1; g += hayaletNormal(true, false) + iac() + vestibul(gv) + lkanal(); nok('koklea', KO); nok('yok', KO); break; }
    case 'ortak_kavite': g += iac(34, 112) + sv(gElips(X(186), Y(150), 74, 62), 'ortak_kavite') + lkanal(); nok('ortak_kavite', [186, 150]); nok('koklea', [186, 150]); nok('vestibul', [186, 150]); break;
    case 'hipoplazi_1': g += iac() + sv(gElips(X(132), Y(124), 16, 14), 'koklea') + vestibul() + lkanal(); nok('koklea', [132, 124]); break;
    case 'hipoplazi_2': g += iac() + sv(gElips(X(138), Y(104), 32, 28), 'koklea') + vestibul(1.15) + lkanal(); nok('koklea', [138, 104]); break;
    case 'hipoplazi_3': g += iac() + koklea({s: .66, tur: 1}) + vestibul() + lkanal(); break;
    case 'hipoplazi_4': g += iac() + koklea({s: .86, tur: 1.5}) + vestibul() + lkanal(); break;
    case 'ip1': g += iac(40) + koklea({septa: false, modiolus: false, rx: 52, ry: 44}) + vestibul(1.4) + lkanal(); break;
    case 'ip2': g += iac() + koklea({tur: .8}) + vestibul(1.15) + lkanal() + akuadukt(true);
      g += P(ID('tepe').concat([pre + 'kistik_tepe']), v => v < .01 ? '' : `<path d="${gElips(X(KO[0] + 14), Y(KO[1] - 14), 34, 22)}" fill="${R.mavi}" fill-opacity="${n1(.25 * v)}"/>`);
      nok('kistik_tepe', [KO[0] + 14, KO[1] - 18]); break;
    case 'ip3': g += iac(44, 122, true) + koklea({modiolus: false}) + vestibul() + lkanal(); break;
    default: g += iac() + koklea() + vestibul() + lkanal() + akuadukt(false);
  }
  a[pre + 'panel'] = [X(150), Y(135)];
  g += c.yazi(X(150), Y(304), IKA_AD[tip] || tip, {px: 21, fw: 800, ff: 'Outfit', renk: tip === 'normal' ? R.soluk : R.lacivert})
    + c.yazi(X(150), Y(330), IKA_ALT[tip] || '', {px: 15, fw: 600, renk: R.soluk});
  return {svg: g, a};
}
CIZ.ic_kulak_anomali = (c, ay) => {
  const ad = t => { t = String(t).toLowerCase(); return IKA_ES[t] || t; };
  const tipler = (ay.tipler || [ay.tip || 'normal']).map(ad), n = tipler.length, sira = Math.min(n, 4), satir = Math.ceil(n / 4);
  const PW = 300, GAP = 36, w = sira * PW + (sira - 1) * GAP + 20, h = satir * 350 + (satir - 1) * 24 + 10;
  const yer = i => [10 + (i % 4) * (PW + GAP), 6 + Math.floor(i / 4) * 374];
  const ana = ad(ay.ana || tipler.filter(t => t !== 'normal').slice(-1)[0] || tipler[0]);
  const kk = kalem(c, 1), P0 = (id, fn) => fn(0), a = {}, yerler = {};
  tipler.forEach((t, i) => { const [x, y] = yer(i), r = ikaPanel(c, kk, P0, t, x, y, {pre: t + '_', genis_vestibul: ay.genis_vestibul}); Object.assign(a, r.a); a[t] = r.a[t + '_panel']; });
  const ai = Math.max(0, tipler.indexOf(ana)), r0 = ikaPanel(c, kk, P0, ana, ...yer(ai), {pre: '', genis_vestibul: ay.genis_vestibul}); Object.assign(a, r0.a); delete a.panel;
  Object.keys(a).forEach(q => yerler[q] = a[q][1] < yer(0)[1] + 360 ? 'ust' : 'alt');
  return {w, h, cm: 1.05, a, yer: yerler, kam: Object.assign({}, a),
    svg: () => {
      const k = kalem(c, 1), P = anP(c);
      let s = '';
      tipler.forEach((t, i) => { const cm = Array.isArray(ay.cumleler) ? ay.cumleler[i] : null, p = cm != null ? v6Gor(c, cm, 0, .7) : v6Gor(c, null, .3 + i * .25, .7);
        if (p <= 0) return; const [x, y] = yer(i);
        // panel içi parça adları: önekli (tip_parca) ve ana panelde öneksiz
        const Pp = (ids, fn) => P(ids.concat(t === ana ? ids.map(q => q.slice(t.length + 1)) : []), fn);
        s += `<g opacity="${n1(p)}" transform="translate(0 ${n1(14 * (1 - p))})">` + ikaPanel(c, k, Pp, t, x, y, {pre: t + '_', genis_vestibul: ay.genis_vestibul, hayalet: ay.hayalet}).svg + '</g>'; });
      return s; }};
};

// ================================================================ kulak_zari_otoskopik + patoloji "glomus": zarın arkasında, alt yarıda (ön alt kadran / hipotimpanum) kırmızımsı yuvarlak kitle,
// nabızla hafifçe atar (glomus timpanikum / paraganglioma). Eş adlar: glomus_timpanikum, paraganglioma, retrotimpanik_kitle. Diğer patolojilerle birlikte listede verilebilir.
// ayar.patoloji: "glomus" | {tur: "glomus", cumle, bitis} ; ayar.nabiz: false (atım yok). Parçalar: glomus (= retrotimpanik_kitle, paraganglioma, kitle)
(() => {
  const eski = CIZ.kulak_zari_otoskopik, GL = ['glomus', 'glomus_timpanikum', 'paraganglioma', 'retrotimpanik_kitle', 'kirmizi_kitle'];
  CIZ.kulak_zari_otoskopik = (c, ay) => {
    const liste = Array.isArray(ay.patoloji) ? ay.patoloji : ay.patoloji == null ? [] : [ay.patoloji];
    const tur = x => String(typeof x === 'string' ? x : (x && x.tur) || '').toLowerCase();
    const gl = liste.filter(x => GL.includes(tur(x))), diger = liste.filter(x => !GL.includes(tur(x)));
    if (!gl.length) return eski(c, ay);
    const ay2 = Object.assign({}, ay); if (diger.length) ay2.patoloji = diger; else delete ay2.patoloji;
    const d = eski(c, ay2), s0 = d.svg, sol = ay.kulak === 'sol', C = [350, 318], G0 = [C[0] + 58, C[1] + 122], G = sol ? [2 * C[0] - G0[0], G0[1]] : G0;
    d.a = Object.assign({}, d.a, {glomus: G, retrotimpanik_kitle: G, paraganglioma: G, kitle: G, glomus_timpanikum: G});
    d.yer = Object.assign({}, d.yer || {}, {glomus: 'alt', retrotimpanik_kitle: 'alt', paraganglioma: 'alt', kitle: 'alt', glomus_timpanikum: 'alt'});
    d.takma = Object.assign({}, d.takma || {}, {retrotimpanik_kitle: 'glomus', paraganglioma: 'glomus', kitle: 'glomus', glomus_timpanikum: 'glomus'});
    d.kam = Object.assign({}, d.kam || {}, {glomus: [G[0], G[1] - 30]});
    const o = typeof gl[0] === 'string' ? {} : gl[0];
    d.svg = () => {
      const P = anP(c), cm = o.cumle != null ? o.cumle : ay.patoloji_cumle, p = ilerle(c.t, ekBas(c, cm, .3), 1.2) * (o.bitis != null ? 1 - ilerle(c.t, c.cb(o.bitis), .6) : 1);
      let s = s0();
      if (p <= .002) return s;
      const nb = ay.nabiz === false ? 0 : Math.max(0, Math.sin(2 * Math.PI * 1.15 * c.t)) ** 3, sc = 1 + .045 * nb, cid = uid('gl'), gid = uid('glg');
      s += `<defs><clipPath id="${cid}"><path d="${gElips(C[0], C[1], 205 * .965, 228 * .965)}"/></clipPath>`
        + `<radialGradient id="${gid}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#C9363B" stop-opacity=".85"/><stop offset=".62" stop-color="#E05A5E" stop-opacity=".62"/><stop offset="1" stop-color="#E5484D" stop-opacity="0"/></radialGradient></defs>`;
      s += `<g clip-path="url(#${cid})" opacity="${n1(p)}">` + P(['glomus'], () => `<g transform="translate(${n1(G[0])} ${n1(G[1])}) scale(${sc.toFixed(3)})"><ellipse cx="0" cy="0" rx="112" ry="88" fill="url(#${gid})"/>`
        + `<path d="M-40 -18 C -20 -30 10 -26 30 -10 M-30 14 C -6 4 22 10 40 24" fill="none" stroke="#B02A30" stroke-opacity=".35" stroke-width="${kalem(c, 1).W2(1.6)}"/></g>`) + '</g>';
      return s; };
    return d;
  };
})();

// ================================================================ koklea_acik + kemiklesme: yuvarlak pencere yakınında, bazal turda scala tympani'yi dolduran önce bağ dokusu, sonra yeni kemik
// ayar: {kemiklesme: true, doku_cumle (bağ dokusu), kemik_cumle (kemiğe dönüşür), uzunluk: 0.34 (tabandan tepeye oran)}. Parçalar: kemiklesme (= yeni_kemik), bag_dokusu (= fibrozis)
(() => {
  const eski = CIZ.koklea_acik;
  CIZ.koklea_acik = (c, ay) => {
    const d = eski(c, ay);
    if (!ay.kemiklesme) return d;
    const s0 = d.svg, uz = ay.uzunluk ?? .34, xe0 = 152 + uz * 650, ym = 220, alt = x => 370 - 60 * (x - 150) / 650;
    d.a = Object.assign({}, d.a, {kemiklesme: [150 + (xe0 - 150) * .45, 300], yeni_kemik: [150 + (xe0 - 150) * .45, 300], kemiklesen_labirentit: [150 + (xe0 - 150) * .45, 300], bag_dokusu: [150 + (xe0 - 150) * .7, 290], fibrozis: [150 + (xe0 - 150) * .7, 290]});
    d.yer = Object.assign({}, d.yer, {kemiklesme: 'alt', yeni_kemik: 'alt', kemiklesen_labirentit: 'alt', bag_dokusu: 'alt', fibrozis: 'alt'});
    d.takma = Object.assign({}, d.takma || {}, {yeni_kemik: 'kemiklesme', kemiklesen_labirentit: 'kemiklesme', fibrozis: 'bag_dokusu'});
    d.kam = Object.assign({}, d.kam || {}, {kemiklesme: [230, 290]});
    d.svg = () => {
      const k = kalem(c, 1), P = anP(c), pd = v6Gor(c, ay.doku_cumle, .3, 1.6), pk = ay.kemik_cumle != null ? ilerle(c.t, c.cb(ay.kemik_cumle) + .2, 1.8) : (ay.doku_cumle != null ? 0 : 1);
      let s = s0();
      const p = Math.max(pd, pk); if (p <= .002) return s;
      const xe = 152 + (xe0 - 152) * yumIO(p), dd = (() => { const pts = [[150, ym + 6]]; for (let x = 160; x <= xe; x += 24) pts.push([x, ym + 6]);
        const n = 7; for (let i = 0; i <= n; i++) { const y = ym + 6 + (alt(xe) - ym - 8) * i / n; pts.push([xe + (i % 2 ? 10 : -6) * (1 - .4 * i / n), y]); }
        for (let x = xe - 20; x >= 150; x -= 24) pts.push([x, alt(x) - 3]); pts.push([150, alt(150) - 3]); return gYol(pts, true, .3); })();
      const kp = pk > 0 ? pk : 0;
      s += P(['bag_dokusu', 'kemiklesme'], () => k.yol(dd, karis('#F6E2D8', V6B.kemik2, kp), karis('#C9A08E', NV, kp), 2.2)
        + `<g opacity="${n1(1 - kp)}">` + [0, 1, 2, 3, 4].map(i => k.yol(`M156 ${ym + 22 + i * 22} C ${n1(200 + i * 8)} ${ym + 12 + i * 22} ${n1(240 + i * 6)} ${ym + 34 + i * 22} ${n1(Math.min(xe - 8, 300))} ${ym + 20 + i * 22}`, 'none', '#D9A58F', 1.4)).join('') + '</g>'
        + (kp > 0 ? `<g opacity="${n1(kp)}">` + v6bGozenek(k, dd, 150, ym, xe - 150, alt(150) - ym, 21, 26, '#FFFFFF') + '</g>' : ''));
      return s; };
    return d;
  };
})();

// ================================================================ vestibuler + dehisans (superior kanal tepesinde kemik açıklığı, üstte orta kafa çukuru) ve + epley (posterior kanalda kristallerin ilerleyişi)
// dehisans ayar: {dehisans: true, dehisans_cumle (kemik incelir ve açılır), fossa_cumle (orta kafa çukuru ve beyin zarı)}
//   parçalar: dehisans (= kemik_acikligi), kemik_ortu (= tegmen), orta_kafa_cukuru (= temporal_lob), dura (= beyin_zari)
// epley ayar: {epley: true, taraf: "sag"|"sol", epley_cumle (ilk konum), utrikul_cumle (kristaller utriküle ulaşır; aradaki konumlar eşit aralıklı), adimlar: true (alttaki konum şeridi)}
//   parçalar: kristaller (= otokonya), kristal_yolu, adimlar (= konumlar), adim_1..adim_5
function v6bVesGeo(ay) {
  const yaw = ay.yaw ?? -70, pitch = ay.pitch ?? 40, kn = KG.kanallarAc(yaw, pitch), mm = p => KG.projAc(p, yaw, pitch);
  const M = {VM: mm([0, 1.2, -.4]), UT: mm([-.2, 2.4, -.6]), SA: mm([.2, -.4, 1.0]), KO: mm([2.2, -2.3, 3.6])};
  M.SU = [M.VM[0] + .7, M.VM[1] + 4.6];
  const tum = kn.superior.concat(kn.posterior, kn.lateral, [[M.VM[0] - 1.8, M.VM[1] - 2.4], [M.VM[0] + 1.8, M.VM[1] + 2.4], [M.KO[0] - 2.2, M.KO[1] - 1.6], [M.KO[0] + 2.2, M.KO[1] + 1.6], M.SU]);
  const xs = tum.map(q => q[0]), ys = tum.map(q => q[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const S = Math.min(700 / (x1 - x0), 520 / (y1 - y0)), O = [400 - S * (x0 + x1) / 2, 300 - S * (y0 + y1) / 2];
  const px = q => [O[0] + S * q[0], O[1] + S * q[1]], pt = arr => arr.map(px);
  return {S, K: {superior: pt(kn.superior), posterior: pt(kn.posterior), lateral: pt(kn.lateral), crus: pt(kn.crus)}, UT: px(M.UT), VM: px(M.VM), SA: px(M.SA)};
}
(() => {
  const eski = CIZ.vestibuler;
  const ADIM = sag => sag ? [L('baş 45° sağa', 'head 45° right'), L('sırtüstü yat', 'lie back'), L('baş 90° sola', 'head 90° left'), L('sol yana dön', 'roll to left'), L('otur', 'sit up')]
    : [L('baş 45° sola', 'head 45° left'), L('sırtüstü yat', 'lie back'), L('baş 90° sağa', 'head 90° right'), L('sağ yana dön', 'roll to right'), L('otur', 'sit up')];
  CIZ.vestibuler = (c, ay) => {
    const d = eski(c, ay);
    if (!ay.dehisans && !ay.epley) return d;
    const G = v6bVesGeo(ay), s0 = d.svg;
    d.a = Object.assign({}, d.a); d.yer = Object.assign({}, d.yer); d.takma = Object.assign({}, d.takma || {}); d.kam = Object.assign({}, d.kam || {});
    let ek = (k, P) => '';
    if (ay.dehisans) {
      const T = G.K.superior.reduce((m, q) => q[1] < m[1] ? q : m, G.K.superior[0]), tw = G.S * .42, yTop = T[1] - tw / 2 - 22;
      d.vy = -140; d.h = 600 + 140;
      Object.assign(d.a, {dehisans: [T[0], T[1] - tw / 2 - 12], kemik_acikligi: [T[0], T[1] - tw / 2 - 12], kemik_ortu: [T[0] - 170, yTop + 14], tegmen: [T[0] - 170, yTop + 14],
        orta_kafa_cukuru: [T[0] + 150, yTop - 60], temporal_lob: [T[0] + 150, yTop - 60], dura: [T[0] - 110, yTop - 3], beyin_zari: [T[0] - 110, yTop - 3]});
      Object.assign(d.yer, {dehisans: 'sag', kemik_acikligi: 'sag', kemik_ortu: 'sol', tegmen: 'sol', orta_kafa_cukuru: 'sag', temporal_lob: 'sag', dura: 'sol', beyin_zari: 'sol'});
      Object.assign(d.takma, {kemik_acikligi: 'dehisans', tegmen: 'kemik_ortu', temporal_lob: 'orta_kafa_cukuru', beyin_zari: 'dura'});
      Object.assign(d.kam, {dehisans: [T[0], T[1] - 20], superior_kanal: [T[0], T[1] - 10]});
      ek = (k, P) => {
        const pf = ay.fossa_cumle != null ? v6Gor(c, ay.fossa_cumle, 0, .8) : 1, pa = ay.dehisans_cumle != null ? ilerle(c.t, c.cb(ay.dehisans_cumle) + .2, 1.4) : 1, gw = 64 * yumIO(pa);
        const alt = x => Math.min(yTop + 46, T[1] - tw / 2 - 2 + .0036 * (x - T[0]) ** 2), x0 = T[0] - 270, x1 = T[0] + 270;
        const parca = (a0, a1) => { if (a1 - a0 < 2) return ''; const pts = []; for (let x = a0; x <= a1 + .1; x += (a1 - a0) / 12) pts.push([x, alt(x)]);
          return `<path d="M${n1(a0)} ${n1(yTop)} L${n1(a1)} ${n1(yTop)} ` + pts.slice().reverse().map(q => `L${n1(q[0])} ${n1(q[1])}`).join(' ') + 'Z"/>'; };
        let g = `<g opacity="${n1(pf)}">` + P(['orta_kafa_cukuru'], () => k.yol(`M${x0 - 10} ${n1(yTop - 4)} C ${x0 + 30} ${n1(yTop - 140)} ${x1 - 50} ${n1(yTop - 150)} ${x1 + 10} ${n1(yTop - 4)} Z`, '#F7EEF0', '#C9A7AE', 1.6)
          + k.yol(`M${x0 + 60} ${n1(yTop - 40)} C ${x0 + 120} ${n1(yTop - 70)} ${T[0] - 40} ${n1(yTop - 64)} ${T[0] + 20} ${n1(yTop - 82)} M${T[0] + 60} ${n1(yTop - 34)} C ${T[0] + 110} ${n1(yTop - 60)} ${x1 - 80} ${n1(yTop - 50)} ${x1 - 40} ${n1(yTop - 70)}`, 'none', '#D9BFC5', 1.6)
          + c.yazi(T[0], yTop - 100, L('orta kafa çukuru', 'middle cranial fossa'), {px: 18, fw: 700, renk: '#9C7880'}))
          + P(['dura'], () => k.yol(`M${x0} ${n1(yTop - 3)} L${n1(T[0] - gw / 2)} ${n1(yTop - 3)} C ${n1(T[0] - gw / 4)} ${n1(yTop - 3 + 8 * pa)} ${n1(T[0] + gw / 4)} ${n1(yTop - 3 + 8 * pa)} ${n1(T[0] + gw / 2)} ${n1(yTop - 3)} L${x1} ${n1(yTop - 3)}`, 'none', '#C46B76', 2.6)) + '</g>';
        g += P(['kemik_ortu'], () => `<g fill="${V6B.kemik2}" stroke="${NV}" stroke-width="${k.W2(2)}" stroke-linejoin="round">` + parca(x0, T[0] - gw / 2) + parca(T[0] + gw / 2, x1) + '</g>');
        if (pa > .05) g += P(['dehisans'], () => `<ellipse cx="${n1(T[0])}" cy="${n1(T[1] - tw / 2 - 10)}" rx="${n1(gw / 2 + 12)}" ry="${n1(24)}" fill="none" stroke="${R.sag_kulak}" stroke-width="${k.W2(3)}" stroke-dasharray="${k.W2(7)} ${k.W2(5)}" opacity="${n1(pa)}"/>`);
        return g; };
    }
    if (ay.epley) {
      const sag = ay.taraf !== 'sol', Kp = G.K.posterior, Kc = G.K.crus, n = Kp.length;
      // yol: posterior kanalın ampulla tarafındaki alt bölümünden kanal boyunca ortak bacağa, oradan utriküle
      const crus = Math.hypot(Kc[0][0] - Kp[n - 1][0], Kc[0][1] - Kp[n - 1][1]) < Math.hypot(Kc[Kc.length - 1][0] - Kp[n - 1][0], Kc[Kc.length - 1][1] - Kp[n - 1][1]) ? Kc : Kc.slice().reverse();
      const yol = Kp.slice(Math.round(n * .1)).concat(crus, [G.UT]);
      const uz = [0]; for (let i = 1; i < yol.length; i++) uz.push(uz[i - 1] + Math.hypot(yol[i][0] - yol[i - 1][0], yol[i][1] - yol[i - 1][1]));
      const nokta = f => { const hd = f * uz[uz.length - 1]; let i = 1; while (i < uz.length - 1 && uz[i] < hd) i++; const u = (hd - uz[i - 1]) / Math.max(1e-6, uz[i] - uz[i - 1]);
        return [yol[i - 1][0] + (yol[i][0] - yol[i - 1][0]) * u, yol[i - 1][1] + (yol[i][1] - yol[i - 1][1]) * u]; };
      const IST = [0, .3, .58, .84, 1];   // her konumda kristallerin yeri (yol oranı)
      const adimVar = ay.adimlar !== false; if (adimVar) d.h = (d.h || 600) + 110;
      const yA = (d.vy || 0) + d.h - 70, xs = i => 80 + i * 160;
      Object.assign(d.a, {kristaller: nokta(0), otokonya: nokta(0), kristal_yolu: nokta(.5), adimlar: [400, yA]});
      for (let i = 0; i < 5; i++) d.a['adim_' + (i + 1)] = [xs(i), yA];
      Object.assign(d.yer, {kristaller: 'sol', otokonya: 'sol', kristal_yolu: 'sag', adimlar: 'alt'});
      Object.assign(d.takma, {otokonya: 'kristaller', konumlar: 'adimlar'});
      const zaman = () => { const t0 = ekBas(c, ay.epley_cumle, .6), t1 = ay.utrikul_cumle != null ? c.cb(ay.utrikul_cumle) : t0 + 4 * 1.8, dt = Math.max(.6, (t1 - t0) / 4);
        const j = Math.floor((c.t - t0) / dt); return {t0, dt, j: Math.min(4, j), u: c.t < t0 ? 0 : j >= 4 ? 1 : yumIO((c.t - t0 - j * dt) / Math.min(1.2, dt * .7))}; };
      const ek0 = ek;
      ek = (k, P) => {
        let g = ek0(k, P);
        const z = zaman(), f = z.j < 0 ? 0 : z.j >= 4 ? 1 : IST[z.j] + (IST[z.j + 1] - IST[z.j]) * z.u, fe = z.j >= 4 ? 1 : (z.j < 0 ? 0 : IST[z.j]);
        // geçilen yol (kesik) ve kristaller
        if (f > .01) { const m = Math.max(2, Math.round(60 * f)), pts = Array.from({length: m}, (_, i) => nokta(f * i / (m - 1)));
          g += P(['kristal_yolu'], () => k.yol(gYol(pts), 'none', V6B.turuncu, 2.6, `stroke-dasharray="${k.W2(6)} ${k.W2(5)}" opacity=".8"`)); }
        const q = nokta(f), r = ekRast(5), kr = [];
        for (let i = 0; i < 7; i++) kr.push([q[0] + (r() - .5) * 22, q[1] + (r() - .5) * 16 + Math.sin(c.t * 3 + i) * .8]);
        g += P(['kristaller'], () => kr.map(([x, y]) => `<circle cx="${n1(x)}" cy="${n1(y)}" r="7" fill="#FFC94D" stroke="${NV}" stroke-width="${k.W2(1.4)}"/>`).join(''));
        // konum şeridi
        if (adimVar) { const ad = ADIM(sag), aktif = z.j;
          g += `<path d="M${xs(0)} ${yA} L${xs(4)} ${yA}" stroke="${R.cizgi}" stroke-width="${k.W2(3)}"/>`;
          ad.forEach((m, i) => { const ak = i === aktif, gec = i < aktif;
            g += P(['adimlar', 'adim_' + (i + 1)], () => `<circle cx="${xs(i)}" cy="${yA}" r="${n1(c.fs(19))}" fill="${ak ? R.mavi : gec ? '#CFE6FB' : '#FFFFFF'}" stroke="${ak || gec ? R.mavi : R.cizgi}" stroke-width="${k.W2(2.4)}"/>`
              + c.yazi(xs(i), yA + c.fs(7), String(i + 1), {px: 19, fw: 800, renk: ak ? '#FFFFFF' : R.lacivert})
              + v6Yazi(c, xs(i), yA + c.fs(46), m, 150, {px: 16, fw: ak ? 800 : 600, renk: ak ? R.lacivert : R.soluk})); }); }
        return g; };
    }
    d.svg = () => { const k = kalem(c, 1), P = anP(c); return s0() + ek(k, P); };
    return d;
  };
})();

// ================================================================ beyin_sapi_vestibuler + tumor: iç kulak yolundan serebellopontin köşeye taşan vestibüler schwannom (görüntünün solundaki taraf)
// ayar: {tumor: true, tumor_cumle (büyür), taraf: "sol"|"sag" (görüntüde), fasiyal: true (VII, ince sarı), fasiyal_cumle, arter_cumle (labirent arteri)}
// parçalar: tumor (= schwannom, vestibuler_schwannom, akustik_norom), ic_kulak_yolu, serebellopontin_kose (= kose), fasiyal_sinir (= vii), labirent_arteri
(() => {
  const eski = CIZ.beyin_sapi_vestibuler;
  CIZ.beyin_sapi_vestibuler = (c, ay) => {
    const d = eski(c, ay);
    if (!ay.tumor) return d;
    const sagT = ay.taraf === 'sag', X = x => sagT ? 900 - x : x, s0 = d.svg, TM = [X(238), 372];
    d.a = Object.assign({}, d.a, {tumor: TM, schwannom: TM, vestibuler_schwannom: TM, akustik_norom: TM, ic_kulak_yolu: [X(130), 346], serebellopontin_kose: [X(262), 440], kose: [X(262), 440],
      fasiyal_sinir: [X(120), 362], vii: [X(120), 362], labirent_arteri: [X(112), 398]});
    d.yer = Object.assign({}, d.yer, {tumor: sagT ? 'sag' : 'sol', schwannom: 'sol', vestibuler_schwannom: 'sol', akustik_norom: 'sol', ic_kulak_yolu: 'ust', serebellopontin_kose: 'alt', kose: 'alt',
      fasiyal_sinir: 'ust', vii: 'ust', labirent_arteri: 'alt'});
    d.takma = Object.assign({}, d.takma || {}, {schwannom: 'tumor', vestibuler_schwannom: 'tumor', akustik_norom: 'tumor', kose: 'serebellopontin_kose', vii: 'fasiyal_sinir'});
    d.kam = Object.assign({}, d.kam || {}, {tumor: [X(200), 380]});
    d.svg = () => {
      const k = kalem(c, 1), P = anP(c), pt = ilerle(c.t, ekBas(c, ay.tumor_cumle, .4), 2.2), pf = ay.fasiyal === false ? 0 : v6Gor(c, ay.fasiyal_cumle, .4, .6), pa = ay.arter_cumle != null ? v6Gor(c, ay.arter_cumle, 0, .6) : 0;
      let s = '';
      // iç kulak yolu (kemik kanal): sinirin çevresinde
      s = s0() + P(['ic_kulak_yolu'], () => k.yol(`M${X(96)} 334 L${X(204)} 334 L${X(204)} 346 L${X(96)} 346 Z M${X(96)} 414 L${X(204)} 414 L${X(204)} 426 L${X(96)} 426 Z`, V6B.kemik2, NV, 1.8));
      // fasiyal sinir (VII): VIII'in önünde ve üstünde
      if (pf > 0) s += `<g opacity="${n1(pf)}">` + P(['fasiyal_sinir'], () => k.boru(`M${X(102)} 360 C ${X(160)} 358 ${X(220)} 356 ${X(282)} 352`, k.w(6), '#FFE2A6', AR.sinir_c, 1.2)) + '</g>';
      if (pa > 0) s += `<g opacity="${n1(pa)}">` + P(['labirent_arteri'], () => k.yol(`M${X(100)} 398 C ${X(170)} 400 ${X(230)} 404 ${X(286)} 404`, 'none', V6B.arter, 3.2)) + '</g>';
      // tümör: iç kulak yolunda başlar, köşeye taşar (dondurma külahı)
      if (pt > .002) { const g = yumIO(pt), r = 18 + 30 * g, cx = X(170 + 70 * g), cy = 378;
        s += P(['tumor'], () => k.yol(`M${X(140)} 366 C ${X(170)} 358 ${n1(cx)} ${n1(cy - r)} ${n1(cx + (sagT ? -1 : 1) * r * .9)} ${n1(cy - r * .4)} C ${n1(cx + (sagT ? -1 : 1) * r * 1.2)} ${n1(cy + r * .4)} ${n1(cx + (sagT ? -1 : 1) * r * .4)} ${n1(cy + r)} ${n1(cx - (sagT ? -1 : 1) * r * .3)} ${n1(cy + r * .9)} C ${X(180)} 402 ${X(160)} 398 ${X(140)} 392 Z`, V6B.tumor, V6B.tumorC, 2.4)
          + k.yol(`M${n1(cx - (sagT ? -1 : 1) * r * .2)} ${n1(cy - r * .4)} C ${n1(cx + (sagT ? -1 : 1) * r * .3)} ${n1(cy - r * .2)} ${n1(cx + (sagT ? -1 : 1) * r * .2)} ${n1(cy + r * .3)} ${n1(cx - (sagT ? -1 : 1) * r * .3)} ${n1(cy + r * .5)}`, 'none', '#D99A86', 1.4)); }
      return s; };
    return d;
  };
})();

// ================================================================ isitme_yolu + efferent: inen yollar (turuncu). Korteksten inferior kollikulusa, kollikulustan superior oliver komplekse,
// superior oliver kompleksten kokleaya olivokoklear demet: MOC (medial, çoğu çapraz, dış tüy hücrelerine; düz çizgi) ve LOC (lateral, çoğu aynı taraf, iç tüy hücresi liflerine; kesik çizgi).
// Hedef koklea görüntünün solundaki. ayar: {efferent: true, kortikal_cumle, ocb_cumle, yazilar: true}
// parçalar: efferent (= inen_yol), kortikofugal (= kortikal_yol), olivokoklear_demet (= ocb), moc, loc
(() => {
  const eski = CIZ.isitme_yolu;
  CIZ.isitme_yolu = (c, ay) => {
    const d = eski(c, ay);
    if (!ay.efferent) return d;
    const s0 = d.svg;
    d.a = Object.assign({}, d.a, {efferent: [300, 300], inen_yol: [300, 300], kortikofugal: [270, 300], kortikal_yol: [270, 300], olivokoklear_demet: [270, 548], ocb: [270, 548], moc: [300, 590], loc: [262, 520]});
    d.yer = Object.assign({}, d.yer, {efferent: 'sol', inen_yol: 'sol', kortikofugal: 'sol', kortikal_yol: 'sol', olivokoklear_demet: 'alt', ocb: 'alt', moc: 'alt', loc: 'sol'});
    d.takma = Object.assign({}, d.takma || {}, {inen_yol: 'efferent', kortikal_yol: 'kortikofugal', ocb: 'olivokoklear_demet'});
    d.vurguEsle = Object.assign({}, d.vurguEsle || {}, {olivokoklear_demet: 'moc'});
    d.svg = () => {
      const k = kalem(c, 1), P = anP(c), T = V6B.turuncu, pk = ilerle(c.t, ekBas(c, ay.kortikal_cumle, .4), 1.4), po = ilerle(c.t, ekBas(c, ay.ocb_cumle, (ay.kortikal_cumle != null ? c.cb(ay.kortikal_cumle) : .4) + 1.4), 1.4);
      let s = s0();
      const ok = (ids, d2, p, son, kesik = false) => p <= .002 ? '' : P(ids.concat(['efferent']), () => v6YolOk(k, d2, p, T, kesik ? 3 : 4, son, {b: 12})
        + (kesik && p > .97 ? `<path d="${d2}" fill="none" stroke="#FFFFFF" stroke-width="${k.W2(4.4)}" stroke-dasharray="${k.W2(6)} ${k.W2(8)}"/>` : ''));
      s += ok(['kortikofugal'], 'M200 280 C 260 310 320 324 362 332', pk, [362, 332, .2]);
      s += ok(['kortikofugal'], 'M368 350 C 360 384 360 424 368 452', kis((pk - .3) / .7), [368, 452, 1.4]);
      s += ok(['olivokoklear_demet', 'loc'], 'M372 478 C 330 500 260 534 182 556', po, [182, 556, 2.85], true);
      s += ok(['olivokoklear_demet', 'moc'], 'M440 484 C 424 528 330 572 186 578', kis((po - .15) / .85), [186, 578, 3.05]);
      if (ay.yazilar !== false && po > .5) s += `<g opacity="${n1(kis((po - .5) * 2))}">` + c.yazi(300, 612, 'MOC', {px: 17, fw: 800, renk: T}) + c.yazi(262, 512, 'LOC', {px: 17, fw: 800, renk: T}) + '</g>';
      // lejant
      s += k.yol('M10 22 L50 22', 'none', R.mavi, 4) + c.yazi(60, 28, L('çıkan (afferent)', 'ascending (afferent)'), {a: 'start', px: 15, fw: 700, renk: R.soluk})
        + `<g opacity="${n1(pk)}">` + k.yol('M10 50 L50 50', 'none', T, 4) + c.yazi(60, 56, L('inen (efferent)', 'descending (efferent)'), {a: 'start', px: 15, fw: 700, renk: R.soluk}) + '</g>';
      return s; };
    return d;
  };
})();

// ================================================================ ortak: gözlük (önden), çerçeve içi pencereler; o: {kapak: 0..1, kamera: true, led: true, tek: false (vHIT: tek kamera yanda), s}
function v6bGozluk(c, k, P, cx, cy, s, o = {}) {
  const w = 176 * s, h = 64 * s, gx = [cx - 82 * s, cx + 82 * s];
  let g = '';
  g += P(['gozluk', 'kayis'], () => k.yol(`M${n1(cx - w - 40 * s)} ${n1(cy - 14 * s)} L${n1(cx - w)} ${n1(cy - 18 * s)} L${n1(cx - w)} ${n1(cy + 18 * s)} L${n1(cx - w - 40 * s)} ${n1(cy + 14 * s)} Z M${n1(cx + w + 40 * s)} ${n1(cy - 14 * s)} L${n1(cx + w)} ${n1(cy - 18 * s)} L${n1(cx + w)} ${n1(cy + 18 * s)} L${n1(cx + w + 40 * s)} ${n1(cy + 14 * s)} Z`, V6B.koyu, NV, 1.6));
  g += P(['gozluk'], () => k.yol(gYol([[cx - w, cy - h], [cx + w, cy - h], [cx + w + 6 * s, cy], [cx + w, cy + h], [cx + 26 * s, cy + h], [cx, cy + h * .55], [cx - 26 * s, cy + h], [cx - w, cy + h], [cx - w - 6 * s, cy]], true, .25), o.tek ? '#E3EBF5' : '#4A5A72', NV, 2.4)
    + gx.map(x => k.yol(gElips(x, cy, 62 * s, 42 * s), o.tek ? '#F7FAFD' : '#1C2A40', NV, 2)).join(''));
  if (!o.tek) {
    // pencerede kızılötesi görüntüdeki göz (gri), göz bebeği koyu
    const kp = o.kapak || 0;
    g += gx.map((x, i) => `<g opacity="${n1(1 - kp)}">` + k.yol(gElips(x, cy, 46 * s, 22 * s), '#D9DEE5', null) + k.yol(gElips(x + (o.ix || 0) * s, cy, 15 * s, 15 * s), '#8E99A8', null) + k.yol(gElips(x + (o.ix || 0) * s, cy, 7 * s, 7 * s), '#1C2533', null) + '</g>').join('');
    if (o.led !== false) g += P(['kizilotesi_isik'], () => gx.map(x => [-.8, -.3, .3, .8].map(f => `<circle cx="${n1(x + f * 54 * s)}" cy="${n1(cy + 34 * s)}" r="${n1(4 * s)}" fill="#C0394B"/><circle cx="${n1(x + f * 54 * s)}" cy="${n1(cy + 34 * s)}" r="${n1(9 * s)}" fill="#E5484D" opacity=".25"/>`).join('')).join(''));
    if (o.kamera !== false) g += P(['kamera'], () => gx.map(x => k.yol(`M${n1(x - 18 * s)} ${n1(cy - h - 26 * s)} L${n1(x + 18 * s)} ${n1(cy - h - 26 * s)} L${n1(x + 18 * s)} ${n1(cy - h + 2 * s)} L${n1(x - 18 * s)} ${n1(cy - h + 2 * s)} Z`, '#2A3850', NV, 1.8)
      + `<circle cx="${n1(x)}" cy="${n1(cy - h - 12 * s)}" r="${n1(7 * s)}" fill="#7FB4EA" stroke="#FFFFFF" stroke-width="${k.W2(1.2)}"/>`).join(''));
    if (kp > 0) g += P(['kapak'], () => `<g transform="translate(0 ${n1(-(1 - kp) * 40 * s)})" opacity="${n1(Math.min(1, kp * 2))}">` + k.yol(gYol([[cx - w + 4 * s, cy - h + 4 * s], [cx + w - 4 * s, cy - h + 4 * s], [cx + w, cy], [cx + w - 4 * s, cy + h - 4 * s], [cx + 26 * s, cy + h - 4 * s], [cx, cy + h * .5], [cx - 26 * s, cy + h - 4 * s], [cx - w + 4 * s, cy + h - 4 * s], [cx - w, cy]], true, .25), '#2A3850', NV, 2.2)
      + k.yol(`M${n1(cx - w * .7)} ${n1(cy - h * .5)} L${n1(cx + w * .7)} ${n1(cy - h * .5)}`, 'none', '#4A5A72', 3) + '</g>');
  } else {
    // vHIT: hafif çerçeve, açık camlar, tek kamera yanda (ayna ile)
    g += gx.map(x => gozOn(k, x, cy, .62 * s * 1.0, {kas: false})).join('');
    g += P(['kamera'], () => k.yol(`M${n1(cx + w - 4 * s)} ${n1(cy - h - 30 * s)} L${n1(cx + w + 40 * s)} ${n1(cy - h - 30 * s)} L${n1(cx + w + 40 * s)} ${n1(cy - h + 6 * s)} L${n1(cx + w - 4 * s)} ${n1(cy - h + 6 * s)} Z`, '#2A3850', NV, 1.8)
      + `<circle cx="${n1(cx + w + 18 * s)}" cy="${n1(cy - h - 12 * s)}" r="${n1(8 * s)}" fill="#7FB4EA" stroke="#FFFFFF" stroke-width="${k.W2(1.2)}"/>`);
  }
  return g;
}

// ================================================================ VNG gözlüğü: önden yüz üstünde kızılötesi kameralı gözlük (kızılötesi ışık kaynakları, kameralar, kapatılabilir ön kapak)
// ve sağda ekran: kızılötesi göz görüntüsünde göz bebeği merkezi (artı işareti) bulunur, yatay ve dikey konum zaman içinde izlenir.
// ayar: {kamera_cumle, izleme_cumle (ekran), kapak_cumle (ön kapak kapanır: karanlık), ekran: true}
// parçalar: gozluk, kamera (= kameralar), kizilotesi_isik (= isik_kaynagi, led), kapak (= on_kapak), ekran (= monitor), goz_bebegi (= pupil), merkez (= pupil_merkezi), iz (= hareket_izi, yatay_iz), kayis
CIZ.vng_gozlugu = (c, ay) => {
  const ek = ay.ekran !== false, cx = 230, cy = 270, s = .95, W = ek ? 920 : 470;
  const a = {gozluk: [cx - 150, cy + 50], kamera: [cx - 78, cy - 104], kameralar: [cx - 78, cy - 104], kizilotesi_isik: [cx + 70, cy + 32], isik_kaynagi: [cx + 70, cy + 32], led: [cx + 70, cy + 32],
    kapak: [cx, cy - 40], on_kapak: [cx, cy - 40], kayis: [cx - 200, cy], ekran: [700, 90], monitor: [700, 90], goz_bebegi: [690, 190], pupil: [690, 190], merkez: [690, 190], pupil_merkezi: [690, 190],
    iz: [700, 420], hareket_izi: [700, 420], yatay_iz: [700, 420]};
  if (!ek) ['ekran', 'monitor', 'goz_bebegi', 'pupil', 'merkez', 'pupil_merkezi', 'iz', 'hareket_izi', 'yatay_iz'].forEach(q => delete a[q]);
  const takma = {kameralar: 'kamera', isik_kaynagi: 'kizilotesi_isik', led: 'kizilotesi_isik', on_kapak: 'kapak', monitor: 'ekran', pupil: 'goz_bebegi', pupil_merkezi: 'merkez', hareket_izi: 'iz', yatay_iz: 'iz'};
  return {w: W, h: 540, cm: 1.05, kirp: true, a: takmaAd(a, takma), takma, vurguEsle: {merkez: 'goz_bebegi'},
    yer: {gozluk: 'alt', kamera: 'ust', kameralar: 'ust', kizilotesi_isik: 'alt', isik_kaynagi: 'alt', led: 'alt', kapak: 'ust', on_kapak: 'ust', kayis: 'sol', ekran: 'ust', monitor: 'ust',
      goz_bebegi: 'sag', pupil: 'sag', merkez: 'sag', pupil_merkezi: 'sag', iz: 'alt', hareket_izi: 'alt', yatay_iz: 'alt'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c), kp = ay.kapak_cumle != null ? ilerle(c.t, c.cb(ay.kapak_cumle) + .2, .9) : 0;
      // göz hareketi: sağa vuran sıçramalı nistagmus (yavaş faz sola, hızlı faz sağa)
      const ph = (c.t * .9) % 1, ix = ph < .82 ? 8 - 16 * ph / .82 : -8 + 16 * (ph - .82) / .18;
      let s2 = yuzUst(k, cx, cy, s);
      s2 += v6bGozluk(c, k, P, cx, cy, s, {kapak: kp, ix});
      if (kp > .5) s2 += `<g opacity="${n1((kp - .5) * 2)}">` + v6bRozet(c, k, cx, cy + 128, L('karanlık: fiksasyon yok', 'dark: no fixation'), 'goz', R.lacivert, 16) + '</g>';
      if (ek) { const pe = v6Gor(c, ay.izleme_cumle, .5, .7);
        s2 += `<g opacity="${n1(pe)}">` + P(['ekran'], () => k.yol('M500 70 L900 70 L900 520 L500 520 Z', '#F4F7FB', NV, 2.6) + `<rect x="516" y="86" width="368" height="418" rx="8" fill="${V6B.ekran}"/>`);
        // kızılötesi göz görüntüsü ve göz bebeği merkezi
        const gx0 = 690 + ix * 2.2;
        s2 += P(['goz_bebegi', 'merkez'], () => `<ellipse cx="690" cy="190" rx="120" ry="58" fill="#B7BEC8"/><ellipse cx="${n1(gx0)}" cy="190" rx="42" ry="42" fill="#6E7888"/><ellipse cx="${n1(gx0)}" cy="190" rx="20" ry="20" fill="#121A26"/>`
          + `<circle cx="${n1(gx0 + 8)}" cy="182" r="5" fill="#FFFFFF" opacity=".8"/>`
          + `<path d="M${n1(gx0 - 34)} 190 L${n1(gx0 + 34)} 190 M${n1(gx0)} 156 L${n1(gx0)} 224" stroke="#41D17A" stroke-width="${k.W2(2.4)}"/><circle cx="${n1(gx0)}" cy="190" r="26" fill="none" stroke="#41D17A" stroke-width="${k.W2(2)}"/>`);
        s2 += c.yazi(530, 112, L('kızılötesi görüntü', 'infrared image'), {a: 'start', px: 14, fw: 700, renk: '#9CC9F3'});
        // zaman içinde yatay konum izi (kayan)
        s2 += P(['iz'], () => { let d = '', ilk = true; for (let x = 0; x <= 330; x += 3) { const tt = c.t - (330 - x) / 120, q = ((tt * .9) % 1 + 1) % 1, v = q < .82 ? 8 - 16 * q / .82 : -8 + 16 * (q - .82) / .18;
            d += (ilk ? 'M' : 'L') + n1(536 + x) + ' ' + n1(400 - v * 4.2); ilk = false; }
          return `<path d="M536 400 L870 400" stroke="#FFFFFF" stroke-opacity=".2" stroke-width="${k.W2(1)}"/><path d="${d}" fill="none" stroke="#7FC4FF" stroke-width="${k.W2(2.6)}"/>`
            + c.yazi(536, 310, L('yatay konum', 'horizontal position'), {a: 'start', px: 14, fw: 700, renk: '#9CC9F3'}) + c.yazi(870, 488, L('zaman →', 'time →'), {a: 'end', px: 13, fw: 600, renk: '#9CC9F3'}); });
        s2 += '</g>'; }
      return s2; }};
};

// ================================================================ vestibüler laboratuvar: VNG gözlüğü, kalorik uyarıcı, vHIT gözlüğü, VEMP düzeneği, muayene masası (her biri kendi panelinde)
// ayar: {cumleler: {vng: 1, kalorik: 2, vhit: 3, vemp: 4, masa: 5}, gizle: ["vemp"], adlar: {vng: "..."}}
// parçalar: vng (= vng_gozlugu), kalorik (= kalorik_uyarici), vhit (= vhit_gozlugu), vemp, masa (= muayene_masasi)
CIZ.vestibuler_laboratuvar = (c, ay) => {
  const giz = new Set(ay.gizle || []), ad = Object.assign({vng: L('VNG gözlüğü', 'VNG goggles'), kalorik: L('Kalorik uyarıcı', 'Caloric irrigator'), vhit: L('vHIT gözlüğü', 'vHIT goggles'),
    vemp: L('VEMP', 'VEMP'), masa: L('Muayene masası', 'Examination table')}, ay.adlar || {});
  // ızgara: üstte 3, altta 2 (masa geniş)
  const B = {vng: [0, 0, 320, 290], kalorik: [340, 0, 320, 290], vhit: [680, 0, 320, 290], vemp: [0, 310, 320, 290], masa: [340, 310, 660, 290]};
  if (giz.has('vemp')) B.masa = [0, 310, 1000, 290];
  const a = {}; Object.entries(B).forEach(([id, [x, y, w, h]]) => { if (!giz.has(id)) a[id] = [x + w / 2, y + h * .45]; });
  const takma = {vng_gozlugu: 'vng', kalorik_uyarici: 'kalorik', vhit_gozlugu: 'vhit', muayene_masasi: 'masa'};
  return {w: 1000, h: 600, cm: 1.05, a: takmaAd(a, takma), takma, yer: {vng: 'ust', kalorik: 'ust', vhit: 'ust', vemp: 'alt', masa: 'alt'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c);
      const panel = (id, fn) => { if (giz.has(id)) return ''; const [x, y, w, h] = B[id], cm = ay.cumleler ? ay.cumleler[id] : null, p = v6Gor(c, cm, .3, .7); if (p <= 0) return '';
        return `<g opacity="${n1(p)}" transform="translate(0 ${n1(12 * (1 - p))})">` + P([id], () => v6Kutu(k, x, y, w, h, {dolgu: '#FFFFFF', cizgi: R.cizgi, k: 2}) + fn(x, y, w, h)
          + c.yazi(x + w / 2, y + h - 22, ad[id], {px: 21, fw: 800, ff: 'Outfit', renk: R.lacivert})) + '</g>'; };
      let s = '';
      s += panel('vng', (x, y, w) => v6bGozluk(c, k, (i, f) => f(0), x + w / 2, y + 128, .78, {}));
      s += panel('kalorik', (x, y) => k.yol(`M${x + 30} ${y + 50} L${x + 170} ${y + 50} L${x + 170} ${y + 200} L${x + 30} ${y + 200} Z`, '#F4F7FB', NV, 2.4)
        + `<rect x="${x + 46}" y="${y + 66}" width="108" height="50" rx="6" fill="${R.lacivert}"/>` + c.yazi(x + 72, y + 98, '30°', {px: 18, fw: 800, renk: '#7FC4FF'}) + c.yazi(x + 128, y + 98, '44°', {px: 18, fw: 800, renk: '#FF9A9E'})
        + `<circle cx="${x + 70}" cy="${y + 154}" r="14" fill="#7FC4FF" stroke="${NV}" stroke-width="${k.W2(1.8)}"/><circle cx="${x + 130}" cy="${y + 154}" r="14" fill="#FF9A9E" stroke="${NV}" stroke-width="${k.W2(1.8)}"/>`
        + k.boru(`M${x + 170} ${y + 170} C ${x + 220} ${y + 200} ${x + 230} ${y + 130} ${x + 250} ${y + 110}`, k.w(7), '#E3EBF5', NV, 1.6)
        + k.yol(`M${x + 240} ${y + 120} L${x + 262} ${y + 86} L${x + 290} ${y + 80} L${x + 292} ${y + 92} L${x + 270} ${y + 104} L${x + 252} ${y + 130} Z`, '#CFDAE7', NV, 2)
        + [0, 1, 2].map(i => `<circle cx="${x + 298 - i * 3}" cy="${y + 100 + i * 14}" r="${4 - i * .6}" fill="${R.mavi}" opacity="${n1(.5 + .5 * Math.sin(c.t * 5 + i))}"/>`).join(''));
      s += panel('vhit', (x, y, w) => { const q = Math.sin(c.t * 2.2), th = 14 * Math.sign(q) * Math.pow(Math.abs(q), .4);
        return `<g transform="rotate(${n1(th)} ${x + w / 2} ${y + 150})">` + v6bGozluk(c, k, (i, f) => f(0), x + w / 2, y + 130, .7, {tek: true}) + '</g>'
          + v6Yay(k, x + w / 2, y + 150, 128, -112, -68, R.mavi, 3.4, true); });
      s += panel('vemp', (x, y, w) => k.yol(`M${x + 90} ${y + 150} C ${x + 90} ${y + 60} ${x + 230} ${y + 60} ${x + 230} ${y + 150}`, 'none', V6B.koyu, 7)
        + k.yol(gElips(x + 90, y + 160, 26, 38), V6B.koyu, NV, 2) + k.yol(gElips(x + 230, y + 160, 26, 38), V6B.koyu, NV, 2)
        + k.yol(`M${x + 140} ${y + 196} C ${x + 140} ${y + 214} ${x + 120} ${y + 218} ${x + 104} ${y + 222} M${x + 180} ${y + 196} C ${x + 180} ${y + 214} ${x + 200} ${y + 218} ${x + 216} ${y + 222}`, 'none', V6.koyu, 2)
        + [[x + 140, y + 186], [x + 180, y + 186]].map(([ex, ey], i) => `<circle cx="${ex}" cy="${ey}" r="11" fill="${i ? R.sag_kulak : R.mavi}" stroke="#FFFFFF" stroke-width="${k.W2(2.4)}"/>`).join(''));
      s += panel('masa', (x, y, w) => { const m0 = x + 90, m1 = x + w - 90, yt = y + 150;
        return k.yol(`M${m0} ${yt} L${m1} ${yt} L${m1} ${yt + 20} L${m0} ${yt + 20} Z`, '#E3E8EF', NV, 2.4) + k.yol(`M${m0 + 40} ${yt + 20} L${m0 + 40} ${yt + 90} M${m1 - 40} ${yt + 20} L${m1 - 40} ${yt + 90} M${m0 + 10} ${yt + 90} L${m1 - 10} ${yt + 90}`, 'none', '#7A8BA4', 6)
          + k.yol(`M${m1} ${yt + 4} L${m1 + 60} ${yt + 24} L${m1 + 56} ${yt + 36} L${m1} ${yt + 18} Z`, '#E3E8EF', NV, 2)
          + v6Uzuv(k, [[m0 + 60, yt - 18], [m0 + 200, yt - 20], [m1 - 60, yt - 20]], 36, '#B9C6D6') + v6Uzuv(k, [[m1 - 220, yt - 22], [m1 - 120, yt - 24], [m1 - 30, yt - 22]], 56, SM.giysi)
          + v6Bas(k, {x: m1 + 14, y: yt - 6, r: 30, aci: -90 - 18, kulak: 1}); });
      return s; }};
};

// ================================================================ bilgisayarlı dinamik postürografi (yandan): kuvvet platformu, görsel çevre kabini, tavana bağlı emniyet kemeri,
// ağırlık merkezi salınımı; salınıma bağlamada (sway-referencing) platform ve/veya görsel çevre kişinin salınımıyla aynı açıyla döner (eksen ayak bileği).
// ayar: {platform_cumle, kemer_cumle, salinim_cumle, bagla_cumle (ikisi), zemin_cumle (yalnız zemin), cevre_cumle (yalnız görsel çevre)}
// parçalar: kisi, platform (= kuvvet_platformu, destek_yuzeyi, hareketli_platform), sensorler, gorsel_cevre (= kabin), kemer (= emniyet_kemeri), cerceve, agirlik_merkezi, salinim, baglama
CIZ.posturografi = (c, ay) => {
  const AX = [430, 470];
  const a = {kisi: [430, 300], platform: [430, 486], kuvvet_platformu: [430, 486], destek_yuzeyi: [430, 486], hareketli_platform: [430, 486], sensorler: [360, 512], gorsel_cevre: [612, 260], kabin: [612, 260],
    kemer: [430, 230], emniyet_kemeri: [430, 230], cerceve: [190, 140], agirlik_merkezi: [430, 330], salinim: [430, 80], baglama: [560, 470]};
  const takma = {kuvvet_platformu: 'platform', destek_yuzeyi: 'platform', hareketli_platform: 'platform', kabin: 'gorsel_cevre', emniyet_kemeri: 'kemer', salinim_baglama: 'baglama', kuvvet_algilayicilari: 'sensorler'};
  return {w: 680, h: 560, vx: 120, cm: 1.05, a: takmaAd(a, takma), takma, vurguEsle: {platform: 'sensorler'},
    yer: {kisi: 'sol', platform: 'alt', kuvvet_platformu: 'alt', destek_yuzeyi: 'alt', hareketli_platform: 'alt', sensorler: 'alt', gorsel_cevre: 'sag', kabin: 'sag', kemer: 'sol', emniyet_kemeri: 'sol',
      cerceve: 'sol', agirlik_merkezi: 'sol', salinim: 'ust', baglama: 'sag'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c);
      const ts = ekBas(c, ay.salinim_cumle, .6), sw = c.t > ts ? 4.2 * Math.sin((c.t - ts) * 1.6) * kis((c.t - ts) / 1.2) : 0;   // derece, + öne
      const bz = Math.max(ay.bagla_cumle != null ? ilerle(c.t, c.cb(ay.bagla_cumle), .8) : 0, ay.zemin_cumle != null ? ilerle(c.t, c.cb(ay.zemin_cumle), .8) : 0);
      const bc = Math.max(ay.bagla_cumle != null ? ilerle(c.t, c.cb(ay.bagla_cumle), .8) : 0, ay.cevre_cumle != null ? ilerle(c.t, c.cb(ay.cevre_cumle), .8) : 0);
      const rot = (d, aci) => `<g transform="rotate(${n1(aci)} ${AX[0]} ${AX[1]})">${d}</g>`;
      let s = '';
      // çerçeve ve tavan kolu
      s += P(['cerceve'], () => k.yol(`M170 540 L170 40 L450 40`, 'none', '#7A8BA4', 10) + k.yol('M140 540 L240 540', 'none', '#7A8BA4', 10));
      // görsel çevre kabini (önde ve üstte)
      const pc = v6Gor(c, ay.cevre_goster_cumle, 0, .6);
      s += `<g opacity="${n1(pc)}">` + P(['gorsel_cevre'], () => rot(k.yol('M612 470 L612 170 C 612 120 590 96 540 96 L500 96 L500 124 L530 124 C 572 124 584 140 584 178 L584 470 Z', '#E9EEF6', NV, 2.4)
        + [0, 1, 2, 3, 4].map(i => k.yol(`M592 ${200 + i * 56} L604 ${200 + i * 56}`, 'none', '#9AABC2', 3)).join(''), sw * bc)) + '</g>';
      // platform (eksen ayak bileği), sensörler
      const pp = v6Gor(c, ay.platform_cumle, 0, .6);
      s += `<g opacity="${n1(pp)}">` + P(['platform'], () => rot(k.yol(`M300 ${AX[1]} L560 ${AX[1]} L560 ${AX[1] + 26} L300 ${AX[1] + 26} Z`, '#CFDAE7', NV, 2.4)
        + P(['sensorler'], () => [340, 380, 480, 520].map(x => `<path d="M${x - 12} ${AX[1] + 44} L${x + 12} ${AX[1] + 44} L${x} ${AX[1] + 28} Z" fill="${R.mavi}" stroke="${NV}" stroke-width="${k.W2(1.4)}"/>`).join('')), sw * bz)
        + k.yol(`M280 ${AX[1] + 46} L580 ${AX[1] + 46} L580 ${AX[1] + 66} L280 ${AX[1] + 66} Z`, '#E3E8EF', NV, 2)) + '</g>';
      // kişi (ayak bileği çevresinde salınır), yüz sağa
      const kisi = v6Uzuv(k, [[AX[0] - 6, AX[1] - 6], [AX[0] - 4, AX[1] - 80], [AX[0] - 2, AX[1] - 150]], 34, '#B9C6D6') + k.yol(gElips(AX[0] + 14, AX[1] - 8, 26, 10), V6.koyu, NV, 1.6)
        + v6Uzuv(k, [[AX[0] - 2, AX[1] - 150], [AX[0] - 2, AX[1] - 220], [AX[0] - 2, AX[1] - 270]], 62, SM.giysi) + v6Uzuv(k, [[AX[0] + 4, AX[1] - 262], [AX[0] + 10, AX[1] - 200], [AX[0] + 14, AX[1] - 150]], 22, SM.giysi)
        + v6Bas(k, {x: AX[0] + 4, y: AX[1] - 322, r: 34, aci: 0});
      s += rot(P(['kisi'], () => kisi) + P(['kemer'], () => k.yol(`M${AX[0] - 30} ${AX[1] - 268} L${AX[0] + 28} ${AX[1] - 190} M${AX[0] + 28} ${AX[1] - 268} L${AX[0] - 30} ${AX[1] - 190}`, 'none', '#E39A10', 5)
        + k.yol(`M${AX[0] - 30} ${AX[1] - 186} L${AX[0] + 30} ${AX[1] - 186}`, 'none', '#E39A10', 6)), sw);
      // emniyet kemeri askıları: tavan kolundan omuzlara
      const om = dd => { const r = sw * Math.PI / 180, x = dd, y = -268; return [AX[0] + x * Math.cos(r) - y * Math.sin(r), AX[1] + x * Math.sin(r) + y * Math.cos(r)]; };
      const pk = v6Gor(c, ay.kemer_cumle, 0, .6);
      s += `<g opacity="${n1(pk)}">` + P(['kemer'], () => [-24, 24].map(dd => { const q = om(dd); return k.yol(`M${AX[0] + dd * .4} 46 L${n1(q[0])} ${n1(q[1])}`, 'none', '#B9822A', 2.6, `stroke-dasharray="${k.W2(8)} ${k.W2(4)}"`); }).join('')) + '</g>';
      // ağırlık merkezi ve salınım
      if (c.t > ts - .4) { const r = sw * Math.PI / 180, cg = [AX[0] + 160 * Math.sin(r) - 2, AX[1] - 160 * Math.cos(r) - 0], pg = v6Gor(c, ay.salinim_cumle, .6, .6);
        s += `<g opacity="${n1(pg)}">` + P(['agirlik_merkezi'], () => `<line x1="${n1(cg[0])}" y1="${n1(cg[1])}" x2="${n1(cg[0])}" y2="${AX[1]}" stroke="${R.mavi}" stroke-width="${k.W2(1.8)}" stroke-dasharray="${k.W2(5)} ${k.W2(5)}"/>`
          + `<circle cx="${n1(cg[0])}" cy="${n1(cg[1])}" r="13" fill="#FFFFFF" stroke="${R.mavi}" stroke-width="${k.W2(3)}"/><path d="M${n1(cg[0] - 13)} ${n1(cg[1])} A13 13 0 0 1 ${n1(cg[0])} ${n1(cg[1] - 13)} L${n1(cg[0])} ${n1(cg[1])} Z M${n1(cg[0] + 13)} ${n1(cg[1])} A13 13 0 0 1 ${n1(cg[0])} ${n1(cg[1] + 13)} L${n1(cg[0])} ${n1(cg[1])} Z" fill="${R.mavi}"/>`)
          + P(['salinim'], () => v6Yay(k, AX[0], AX[1], 390, -99, -81, R.mavi, 3.4, true) + c.yazi(AX[0] + 190, AX[1] - 396, L('öne-arkaya salınım', 'forward-backward sway'), {a: 'start', px: 16, fw: 700, renk: R.mavi})) + '</g>'; }
      if (Math.max(bz, bc) > 0) s += `<g opacity="${n1(Math.max(bz, bc))}">` + P(['baglama'], () => v6bRozet(c, k, 640, 530, L('salınıma bağlı', 'sway-referenced'), 'denge', R.sari, 16)) + '</g>';
      return s; }};
};

// ================================================================ ses düzeyi ölçer (el cihazı) ve akustik kalibratör
// ayar: {kalibrator_cumle (kalibratör mikrofona takılır, gösterge 94,0 dB), parcalar_cumle (iç bloklar: yükselteç, süzgeçler), deger: "78,4", kal_deger: "94,0", sinif: "Sınıf 1"}
// parçalar: mikrofon, on_yukseltec (= preamp), govde, gosterge (= ekran), agirliklandirma (= suzgecler), kalibrator, sinif
CIZ.ses_duzeyi_olcer = (c, ay) => {
  const a = {mikrofon: [250, 54], on_yukseltec: [250, 120], preamp: [250, 120], govde: [250, 420], gosterge: [250, 250], ekran: [250, 250], agirliklandirma: [250, 330], suzgecler: [250, 330],
    kalibrator: [250, -40], sinif: [250, 500]};
  // gövde x 182-318; kalibratör sağdan gelip mikrofona takılır
  const takma = {preamp: 'on_yukseltec', ekran: 'gosterge', suzgecler: 'agirliklandirma', slm: 'govde', kalibrasyon: 'kalibrator'};
  return {w: 560, h: 700, vy: -110, cm: 1.05, a: takmaAd(a, takma), takma,
    yer: {mikrofon: 'sol', on_yukseltec: 'sol', preamp: 'sol', govde: 'sol', gosterge: 'sol', ekran: 'sol', agirliklandirma: 'sol', suzgecler: 'sol', kalibrator: 'sag', sinif: 'alt'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c), tk = ay.kalibrator_cumle != null ? c.cb(ay.kalibrator_cumle) : null, pk = tk != null ? ilerle(c.t, tk + .2, 1.6) : 0, takili = pk > .98;
      let s = '';
      // gövde: üstte daralan, altta tutma yeri
      s += P(['govde'], () => k.yol(gYol([[196, 150], [304, 150], [318, 200], [318, 540], [300, 560], [200, 560], [182, 540], [182, 200]], true, .2), '#E9EEF6', NV, 2.6)
        + [0, 1, 2].map(i => `<circle cx="${214 + i * 36}" cy="392" r="12" fill="#FFFFFF" stroke="${NV}" stroke-width="${k.W2(1.8)}"/>`).join('')
        + k.yol('M206 430 L294 430 L294 520 L206 520 Z', '#DCE6F3', '#9AABC2', 1.4));
      s += P(['on_yukseltec'], () => k.yol('M236 70 L264 70 L270 150 L230 150 Z', '#B9C3CF', NV, 2.2));
      s += P(['mikrofon'], () => k.yol('M232 40 L268 40 L268 72 L232 72 Z', '#9AA6B4', NV, 2.2) + k.yol('M234 40 L266 40', 'none', R.mavi, 4) + k.yol('M238 46 L262 46 M238 54 L262 54 M238 62 L262 62', 'none', '#6F7C8D', 1.2));
      // gösterge
      const dg = takili ? (ay.kal_deger || L('94,0', '94.0')) : (ay.deger || (v => L(v.replace('.', ','), v))((78 + 1.6 * Math.sin(c.t * 1.7) + .7 * Math.sin(c.t * 4.3)).toFixed(1)));
      s += P(['gosterge'], () => `<rect x="196" y="186" width="108" height="128" rx="8" fill="${R.lacivert}"/>` + c.yazi(250, 250 - c.fs(4), dg, {px: 25, fw: 800, ff: 'Outfit', renk: '#FFFFFF'})
        + c.yazi(250, 250 + c.fs(14), takili ? 'dB' : 'dB(A)', {px: 13, fw: 700, renk: '#9CC9F3'}) + c.yazi(250, 250 + c.fs(30), takili ? '1 kHz' : 'LAeq', {px: 12, fw: 700, renk: '#9CC9F3'}));
      s += P(['agirliklandirma'], () => ['A', 'C', 'Z'].map((m, i) => `<rect x="${206 + i * 32}" y="318" width="26" height="22" rx="5" fill="${i === 0 ? R.mavi : '#FFFFFF'}" stroke="${NV}" stroke-width="${k.W2(1.4)}"/>`
        + c.yazi(219 + i * 32, 334, m, {px: 13, fw: 800, renk: i === 0 ? '#FFFFFF' : R.lacivert})).join('') + c.yazi(250, 362, 'F  S', {px: 13, fw: 700, renk: R.soluk}));
      s += P(['sinif'], () => c.yazi(250, 500, ay.sinif || L('Sınıf 1', 'Class 1'), {px: 16, fw: 800, renk: R.lacivert}));
      // kalibratör: sağdan gelir, mikrofonun üstüne geçer
      if (tk != null && c.t > tk - .2) { const x = 470 + (250 - 470) * yumIO(pk), y = 200 + (34 - 200) * yumIO(pk);
        s += P(['kalibrator'], () => k.yol(`M${n1(x - 50)} ${n1(y - 90)} L${n1(x + 50)} ${n1(y - 90)} L${n1(x + 50)} ${n1(y + 30)} L${n1(x + 30)} ${n1(y + 30)} L${n1(x + 30)} ${n1(y + 50)} L${n1(x - 30)} ${n1(y + 50)} L${n1(x - 30)} ${n1(y + 30)} L${n1(x - 50)} ${n1(y + 30)} Z`, '#5E6F88', NV, 2.4)
          + `<rect x="${n1(x - 42)}" y="${n1(y - 82)}" width="84" height="56" rx="6" fill="${R.lacivert}"/>` + c.yazi(x, y - 54 - c.fs(3), '94 dB', {px: 14, fw: 800, renk: '#FFFFFF'}) + c.yazi(x, y - 54 + c.fs(12), '1 kHz', {px: 11, fw: 700, renk: '#9CC9F3'})
          + `<circle cx="${n1(x)}" cy="${n1(y - 6)}" r="9" fill="${takili ? R.basari : '#B9C3CF'}" stroke="${NV}" stroke-width="${k.W2(1.4)}"/>`); }
      if (takili) s += `<g opacity="${n1(ilerle(c.t, tk + 2, .5))}">` + v6bRozet(c, k, 250, 600, L('kalibrasyon tamam', 'calibration OK'), 'dogru', R.basari, 16) + '</g>';
      return s; }};
};

// ================================================================ kişisel gürültü dozimetresi: önden çalışan (belinde cihaz), mikrofon gürültü kaynağı tarafındaki omzun üstünde, kulağa yakın
// ayar: {mikrofon_cumle, sonuc_cumle (cihaz ekranında Leq, LEX,8h, doz), kaynak: "sag"|"sol" (görüntüde gürültü kaynağı), leq: "88 dB(A)", doz: "%160"}
// parçalar: calisan (= kisi), dozimetre (= cihaz), mikrofon, kablo, kulak, gurultu_kaynagi, mesafe, sonuc (= ekran)
CIZ.dozimetre = (c, ay) => {
  const sag = ay.kaynak !== 'sol', X = x => sag ? x : 600 - x;
  const a = {calisan: [X(250), 420], kisi: [X(250), 420], dozimetre: [X(318), 420], cihaz: [X(318), 420], mikrofon: [X(362), 168], kablo: [X(370), 300], kulak: [X(326), 104], gurultu_kaynagi: [X(540), 240],
    mesafe: [X(356), 130], sonuc: [X(318), 420], ekran: [X(318), 420]};
  const takma = {kisi: 'calisan', cihaz: 'dozimetre', ekran: 'sonuc', makine: 'gurultu_kaynagi'};
  return {w: 600, h: 560, cm: 1.05, a: takmaAd(a, takma), takma,
    yer: {calisan: 'sol', kisi: 'sol', dozimetre: sag ? 'sag' : 'sol', cihaz: 'sag', mikrofon: 'ust', kablo: sag ? 'sag' : 'sol', kulak: 'ust', gurultu_kaynagi: 'ust', mesafe: 'ust', sonuc: 'alt', ekran: 'alt'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c), pm = v6Gor(c, ay.mikrofon_cumle, .4, .6), ps = ay.sonuc_cumle != null ? v6Gor(c, ay.sonuc_cumle, 0, .6) : 0;
      let s = '';
      // gürültü kaynağı (makine) ve dalgalar
      s += P(['gurultu_kaynagi'], () => k.yol(`M${X(500)} 200 L${X(590)} 200 L${X(590)} 300 L${X(500)} 300 Z`, '#B9C3CF', NV, 2.2) + `<circle cx="${X(545)}" cy="250" r="26" fill="#E3EBF5" stroke="${NV}" stroke-width="${k.W2(2)}"/>`
        + `<g transform="rotate(${n1(c.t * 200)} ${X(545)} 250)"><path d="M${X(545)} 228 L${X(545)} 272 M${X(523)} 250 L${X(567)} 250" stroke="${NV}" stroke-width="${k.W2(3)}"/></g>` + dalgaYay(k, X(492), 250, sag ? -1 : 1, 3, 18, 16, R.mavi, .5 + .3 * Math.sin(c.t * 5)));
      // çalışan: önden gövde, baş, kulaklar
      s += P(['calisan'], () => k.yol(`M${X(130)} 560 L${X(140)} 260 C ${X(150)} 220 ${X(190)} 200 ${X(250)} 196 C ${X(310)} 200 ${X(350)} 220 ${X(360)} 260 L${X(370)} 560 Z`, '#F2B33D', NV, 2.4)
        + k.yol(`M${X(170)} 330 L${X(330)} 330 M${X(170)} 360 L${X(330)} 360`, 'none', '#FFFFFF', 7) + k.yol(`M${X(250)} 196 L${X(250)} 560`, 'none', '#B9822A', 1.6)
        + k.yol(`M${X(226)} 160 L${X(274)} 160 L${X(272)} 200 L${X(228)} 200 Z`, V6.ten, NV, 2) + k.yol(gElips(X(250), 112, 56, 66), V6.ten, NV, 2.4)
        + k.yol(`M${X(194)} 96 C ${X(196)} 50 ${X(304)} 50 ${X(306)} 96 C ${X(290)} 70 ${X(210)} 70 ${X(194)} 96 Z`, V6.sac, null)
        + P(['kulak'], () => k.yol(gElips(X(310), 112, 10, 18), '#E9C9B6', NV, 1.8)) + k.yol(gElips(X(190), 112, 10, 18), '#E9C9B6', NV, 1.8)
        + `<circle cx="${X(230)}" cy="108" r="4" fill="${NV}"/><circle cx="${X(270)}" cy="108" r="4" fill="${NV}"/>` + k.yol(`M${X(236)} 146 C ${X(244)} 152 ${X(256)} 152 ${X(264)} 146`, 'none', NV, 2));
      // dozimetre (bel / göğüs cebinde), kablo, mikrofon (omuz üstünde, kulağa yakın)
      s += P(['dozimetre'], () => k.yol(`M${X(286)} 384 L${X(350)} 384 L${X(350)} 470 L${X(286)} 470 Z`, '#3B4A60', NV, 2.2) + `<rect x="${X(sag ? 294 : 342)}" y="394" width="48" height="34" rx="4" fill="${R.lacivert}" stroke="#9CC9F3" stroke-width="${k.W2(1)}"/>`
        + c.yazi(X(318), 416, 'dB', {px: 13, fw: 800, renk: '#7FC4FF'}));
      s += `<g opacity="${n1(pm)}">` + P(['kablo'], () => k.yol(`M${X(330)} 384 C ${X(352)} 330 ${X(374)} 270 ${X(360)} 186`, 'none', '#3B4A60', 3))
        + P(['mikrofon'], () => k.yol(gElips(X(360), 174, 13, 13), '#5E6F88', NV, 2) + k.yol(gElips(X(360), 174, 19, 19), 'none', '#9AABC2', 1.4, `stroke-dasharray="${k.W2(3)} ${k.W2(3)}"`))
        + P(['mesafe'], () => v6Ok(k, X(352), 158, X(320), 128, R.mavi, 2, true, 8)) + '</g>';
      // vardiya sonu sonuçları
      if (ps > 0) s += `<g opacity="${n1(ps)}">` + P(['sonuc'], () => { const bw = c.fs(176), bh = c.fs(116), x0 = sag ? 8 : 592 - bw, y0 = 8;
        return `<rect x="${n1(x0)}" y="${y0}" width="${n1(bw)}" height="${n1(bh)}" rx="${n1(c.fs(10))}" fill="#FFFFFF" stroke="${R.cizgi}" stroke-width="${k.W2(2)}"/>`
          + [['Leq', ay.leq || '88 dB(A)'], ['LEX,8h', ay.lex || '86 dB(A)'], [L('Tepe', 'Peak'), ay.tepe || '128 dB(C)'], [L('Doz', 'Dose'), ay.doz || L('%126', '126%')]].map(([m, v], i) =>
            c.yazi(x0 + c.fs(10), y0 + c.fs(26 + i * 25), m, {a: 'start', px: 14, fw: 800, renk: R.lacivert}) + c.yazi(x0 + bw - c.fs(10), y0 + c.fs(26 + i * 25), v, {a: 'end', px: 14, fw: 600, renk: R.soluk})).join(''); }) + '</g>';
      return s; }};
};

// ================================================================ işitme koruyucu tipleri yan yana: köpük tıkaç (yuvarlanmış / genişlemiş), kanatçıklı hazır tıkaç, kişiye özel tıkaç, kulak manşonu,
// bantlı tıkaç, elektronik manşon. ayar: {tipler: ["kopuk","hazir","ozel","manson","bantli","elektronik"], cumleler: [0,1,2,3,4,5], adlar: {...}, aciklamalar: {...}}
// parçalar: kopuk (= kopuk_tikac), hazir (= kanatcikli), ozel (= kisiye_ozel), manson (= kulak_mansonu), bantli (= bantli_tikac), elektronik
const KOR_AD = {kopuk: L('Köpük tıkaç', 'Foam earplug'), hazir: L('Hazır tıkaç', 'Pre-molded plug'), ozel: L('Kişiye özel', 'Custom-made'), manson: L('Kulak manşonu', 'Earmuff'),
  bantli: L('Bantlı tıkaç', 'Banded plug'), elektronik: L('Elektronik', 'Electronic')};
function korCiz(c, k, tip, cx, cy) {
  const sil = (x, y, w, h, renk = V6B.kopuk, cz = V6B.kopukC) => { const d = gYol([[x - w / 2, y - h / 2], [x + w / 2 - h * .2, y - h / 2], [x + w / 2, y], [x + w / 2 - h * .2, y + h / 2], [x - w / 2, y + h / 2], [x - w / 2 - h * .2, y]], true, .25);
    return k.yol(d, renk, cz, 2.2) + (renk === V6B.kopuk ? v6bGozenek(k, d, x - w / 2, y - h / 2, w, h, Math.round(x + y), Math.round(w * h / 160), '#E9A94A') : ''); };
  const manson = (el) => { let g = k.yol(`M${cx - 74} ${cy + 6} C ${cx - 80} ${cy - 96} ${cx + 80} ${cy - 96} ${cx + 74} ${cy + 6}`, 'none', V6B.koyu, 10)
      + k.yol(`M${cx - 74} ${cy + 6} C ${cx - 80} ${cy - 96} ${cx + 80} ${cy - 96} ${cx + 74} ${cy + 6}`, 'none', '#6F7C8D', 4);
    [-1, 1].forEach(m => { const x = cx + m * 78; g += k.yol(gYol([[x - 26, cy - 46], [x + 26, cy - 46], [x + 30, cy + 10], [x + 26, cy + 64], [x - 26, cy + 64], [x - 30, cy + 10]], true, .35), el ? '#3B4A60' : '#C94A3E', NV, 2.2)
      + k.yol(`M${x - m * 30} ${cy - 40} L${x - m * 30} ${cy + 58}`, 'none', '#2A2F38', 9); });
    if (el) g += `<circle cx="${cx + 78}" cy="${cy - 22}" r="8" fill="#9AA6B4" stroke="${NV}" stroke-width="${k.W2(1.6)}"/><circle cx="${cx - 78}" cy="${cy + 30}" r="7" fill="${R.basari}" stroke="${NV}" stroke-width="${k.W2(1.4)}"/>`
      + dalgaYay(k, cx + 90, cy - 22, 1, 2, 9, 9, R.mavi, .7);
    return g; };
  switch (tip) {
    case 'kopuk': return sil(cx, cy - 46, 120, 26) + v6Ok(k, cx, cy - 26, cx, cy + 4, R.soluk, 2.4, false, 9) + sil(cx, cy + 40, 96, 62);
    case 'hazir': { let g = k.boru(`M${cx - 20} ${cy} L${cx + 80} ${cy}`, k.w(9), '#E3EBF5', NV, 1.6) + `<circle cx="${cx + 84}" cy="${cy}" r="9" fill="#E3EBF5" stroke="${NV}" stroke-width="${k.W2(1.6)}"/>`;
      [[cx - 66, 30], [cx - 34, 38], [cx, 46]].forEach(([x, r]) => g += k.yol(`M${x} ${cy} C ${x + 6} ${cy - r * .6} ${x + 18} ${cy - r} ${x + 24} ${cy - r} L${x + 30} ${cy - r} C ${x + 22} ${cy - r * .4} ${x + 22} ${cy + r * .4} ${x + 30} ${cy + r} L${x + 24} ${cy + r} C ${x + 18} ${cy + r} ${x + 6} ${cy + r * .6} ${x} ${cy} Z`, '#8CC8EE', '#2F6E9C', 2));
      return g; }
    case 'ozel': return k.yol(gYol([[cx - 92, cy - 30], [cx - 60, cy - 46], [cx - 10, cy - 46], [cx + 40, cy - 62], [cx + 84, cy - 40], [cx + 92, cy + 10], [cx + 70, cy + 56], [cx + 20, cy + 64], [cx - 20, cy + 40], [cx - 60, cy + 6], [cx - 94, cy - 6]], true, .4), '#EDA6A0', '#A85F5F', 2.4)
      + `<circle cx="${cx + 44}" cy="${cy + 8}" r="16" fill="#FFFFFF" stroke="#A85F5F" stroke-width="${k.W2(2)}"/><circle cx="${cx + 44}" cy="${cy + 8}" r="6" fill="#A85F5F"/>`
      + k.yol(`M${cx + 70} ${cy + 50} C ${cx + 86} ${cy + 76} ${cx + 100} ${cy + 80} ${cx + 110} ${cy + 74}`, 'none', '#A85F5F', 3);
    case 'manson': return manson(false);
    case 'elektronik': return manson(true);
    case 'bantli': return k.yol(`M${cx - 70} ${cy + 20} C ${cx - 76} ${cy - 86} ${cx + 76} ${cy - 86} ${cx + 70} ${cy + 20}`, 'none', '#3B4A60', 6)
      + [-1, 1].map(m => k.yol(gElips(cx + m * 70, cy + 32, 16, 16), '#4A5A72', NV, 2) + k.yol(`M${cx + m * 60} ${cy + 32} C ${cx + m * 50} ${cy + 22} ${cx + m * 42} ${cy + 26} ${cx + m * 40} ${cy + 32} C ${cx + m * 42} ${cy + 38} ${cx + m * 50} ${cy + 42} ${cx + m * 60} ${cy + 32} Z`, '#FFC46B', V6B.kopukC, 2)).join('');
  }
  return '';
}
CIZ.isitme_koruyuculari = (c, ay) => {
  const ES = {kopuk_tikac: 'kopuk', kanatcikli: 'hazir', kisiye_ozel: 'ozel', kulak_mansonu: 'manson', bantli_tikac: 'bantli'};
  const tipler = (ay.tipler || ['kopuk', 'hazir', 'ozel', 'manson', 'bantli', 'elektronik']).map(t => ES[t] || t), n = tipler.length, PW = 250, GAP = 22;
  const w = n * PW + (n - 1) * GAP + 12, a = {}; tipler.forEach((t, i) => a[t] = [6 + i * (PW + GAP) + PW / 2, 150]);
  const takma = {}; Object.entries(ES).forEach(([e, t]) => takma[e] = t);
  const yer = {}; tipler.forEach(t => yer[t] = 'ust');
  return {w, h: 360, cm: 1.05, a: takmaAd(a, takma), takma, yer,
    svg: () => {
      const k = kalem(c, 1), P = anP(c);
      let s = '';
      tipler.forEach((t, i) => { const x = 6 + i * (PW + GAP), cm = Array.isArray(ay.cumleler) ? ay.cumleler[i] : null, p = v6Gor(c, cm, .3 + .2 * i, .7); if (p <= 0) return;
        const ad = (ay.adlar && ay.adlar[t]) || KOR_AD[t] || t, ac = ay.aciklamalar && ay.aciklamalar[t];
        s += `<g opacity="${n1(p)}" transform="translate(0 ${n1(12 * (1 - p))})">` + P([t], () => v6Kutu(k, x, 6, PW, 348, {dolgu: '#FFFFFF', cizgi: R.cizgi, k: 2}) + korCiz(c, k, t, x + PW / 2, 140)
          + v6Yazi(c, x + PW / 2, 272, duz(ad), PW - 24, {px: 22, fw: 800, ff: 'Outfit', renk: R.lacivert})
          + (ac ? v6Satirlar(c, x + PW / 2, 314, satirBol(duz(ac), 24), PW - 24, {px: 16, fw: 500, renk: R.soluk}) : '')) + '</g>'; });
      return s; }};
};
// metni yaklaşık n karakterlik satırlara böler (en fazla 2)
function satirBol(m, n) { const ks = String(m).split(' '), out = ['']; ks.forEach(w => { const s = out[out.length - 1]; if (s && (s + ' ' + w).length > n && out.length < 2) out.push(w); else out[out.length - 1] = s ? s + ' ' + w : w; }); return out; }

// ================================================================ kulaklık yerleşimi (yandan baş): kulak üstü (supra-aural, yastık kepçeye bastırır) ve kulak çevreleyen (circumaural, yastık kepçeyi tümüyle sarar)
// ayar: {tip: "ikisi"|"kulak_cevreleyen"|"kulak_ustu", ustu_cumle, cevreleyen_cumle}
// parçalar: kulak_cevreleyen (= circumaural, kulaklik), kulak_ustu (= supra_aural), yastik, kulak_kepcesi, kafa_bandi
CIZ.kulaklik_yerlesimi = (c, ay) => {
  const tip = ay.tip || 'ikisi', iki = tip === 'ikisi', sc = .66, W = iki ? 860 : 440;
  const PX = iki ? {kulak_ustu: 0, kulak_cevreleyen: 430} : {[tip]: 0};
  const loc = (ox, p) => [ox + (p[0] - 180) * sc, 44 + p[1] * sc];
  const a = {};
  Object.entries(PX).forEach(([t, ox]) => { a[t] = loc(ox, [487, 200]); if (t === 'kulak_cevreleyen' || !iki) { a.yastik = loc(ox, [570, 284]); a.kulak_kepcesi = loc(ox, [487, 300]); a.kafa_bandi = loc(ox, [440, 50]); } });
  if (PX.kulak_cevreleyen != null) a.kulaklik = a.kulak_cevreleyen;
  const takma = {circumaural: 'kulak_cevreleyen', supra_aural: 'kulak_ustu', kulak_ustu_kulaklik: 'kulak_ustu', bant: 'kafa_bandi'};
  return {w: W, h: 420, cm: 1.05, kirp: true, a: takmaAd(a, takma), takma, vurguEsle: {kulaklik: 'kulak_cevreleyen'},
    yer: {kulak_ustu: 'alt', kulak_cevreleyen: 'alt', kulaklik: 'alt', yastik: 'sag', kulak_kepcesi: 'alt', kafa_bandi: 'sag'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c);
      let s = '';
      Object.entries(PX).forEach(([t, ox]) => { const p = v6Gor(c, ay[t === 'kulak_ustu' ? 'ustu_cumle' : 'cevreleyen_cumle'], .3, .7); if (p <= 0) return;
        const tr = `translate(${n1(ox - 180 * sc)} 44) scale(${sc})`, kk = kalem(c, sc);
        s += `<g opacity="${n1(p)}">` + basYanK(k, ox - 180 * sc, 44, sc);
        s += `<g transform="${tr}">`;
        if (t === 'kulak_cevreleyen') {
          s += P(['kafa_bandi'], () => kk.yol('M487 186 C 480 120 470 70 450 40', 'none', V6B.koyu, 12));
          s += P(['kulak_cevreleyen', 'kulaklik'], () => `<ellipse cx="487" cy="284" rx="96" ry="122" fill="#3B4A60" fill-opacity=".18" stroke="${NV}" stroke-width="${kk.W2(3)}"/>`)
            + P(['yastik', 'kulak_cevreleyen'], () => `<ellipse cx="487" cy="284" rx="84" ry="110" fill="none" stroke="#5E6F88" stroke-width="${kk.W2(14)}" stroke-opacity=".85"/>`);
        } else {
          s += P(['kafa_bandi'], () => kk.yol('M487 214 C 480 140 470 80 450 40', 'none', V6B.koyu, 12));
          s += P(['kulak_ustu', 'yastik'], () => `<ellipse cx="487" cy="284" rx="58" ry="66" fill="#3B4A60" stroke="${NV}" stroke-width="${kk.W2(3)}"/><ellipse cx="487" cy="284" rx="44" ry="52" fill="#4A5A72"/>`);
          s += [250, 320].map(y => okBasi(560, y, Math.PI, kk.w(14), R.mavi, kk.w(4)) + `<line x1="600" y1="${y}" x2="562" y2="${y}" stroke="${R.mavi}" stroke-width="${kk.W2(4)}" stroke-linecap="round"/>`).join('');
        }
        s += '</g>' + c.yazi(ox + 170, 28, t === 'kulak_ustu' ? L('kulak üstü', 'supra-aural') : L('kulak çevreleyen', 'circumaural'), {px: 20, fw: 800, ff: 'Outfit', renk: t === 'kulak_ustu' ? R.soluk : R.lacivert}) + '</g>'; });
      return s; }};
};

// ================================================================ MR: iç kulak yoluna dik (oblik sagittal) T2 kesit; parlak beyin omurilik sıvısı içinde dört sinir (ön solda):
// ön üst fasiyal, ön alt koklear, arka üst ve arka alt vestibüler. Yanında koklear sinir aplazisi (koklear sinir yok). Kaynak: Casselman ve ark. 1997 (Radiology 202: 773-781).
// ayar: {sinir_cumle (sinirler belirir), aplazi: true, aplazi_cumle (ikinci panel), harfler: true (VII, K, ÜV, AV)}
// parçalar: fasiyal_sinir, koklear_sinir, ust_vestibuler_sinir, alt_vestibuler_sinir, vestibuler_sinir, ic_kulak_yolu (= bos), normal, aplazi (= koklear_sinir_yok), sinir_yeri (aplazide boş yer)
CIZ.mr_ic_kulak_yolu = (c, ay) => {
  const iki = ay.aplazi !== false, PW = 380, W = iki ? 2 * PW + 50 : PW + 10;
  const SN = {fasiyal_sinir: [-40, -34, 15], koklear_sinir: [-38, 34, 18], ust_vestibuler_sinir: [40, -34, 15], alt_vestibuler_sinir: [38, 34, 14]};
  const orta = ox => [ox + PW / 2, 220], a = {};
  const [cx, cy] = orta(5); Object.entries(SN).forEach(([id, [dx, dy]]) => a[id] = [cx + dx, cy + dy]);
  a.vestibuler_sinir = [cx + 40, cy]; a.ic_kulak_yolu = [cx + 70, cy + 64]; a.normal = [cx, 40];
  if (iki) { const [ax, ay2] = orta(PW + 45); a.aplazi = [ax, 40]; a.koklear_sinir_yok = [ax - 38, ay2 + 34]; a.sinir_yeri = [ax - 38, ay2 + 34]; }
  const takma = {bos: 'ic_kulak_yolu', bbs: 'ic_kulak_yolu', koklear_sinir_yok: 'sinir_yeri', fasiyal: 'fasiyal_sinir', koklear: 'koklear_sinir'};
  const HARF = {fasiyal_sinir: 'VII', koklear_sinir: L('K', 'C'), ust_vestibuler_sinir: L('ÜV', 'SV'), alt_vestibuler_sinir: L('AV', 'IV')};
  return {w: W, h: 440, cm: 1.05, a: takmaAd(a, takma), takma, vurguEsle: {vestibuler_sinir: 'ust_vestibuler_sinir'},
    yer: {fasiyal_sinir: 'sol', koklear_sinir: 'sol', ust_vestibuler_sinir: 'sag', alt_vestibuler_sinir: 'sag', vestibuler_sinir: 'sag', ic_kulak_yolu: 'alt', normal: 'ust', aplazi: 'ust', koklear_sinir_yok: 'alt', sinir_yeri: 'alt'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c), ps = v6Gor(c, ay.sinir_cumle, .4, .7);
      const panel = (ox, apl) => { const [x, y] = orta(ox), gid = uid('mr');
        let g = `<defs><radialGradient id="${gid}"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".8" stop-color="#E9EEF5"/><stop offset="1" stop-color="#C9D3E0"/></radialGradient></defs>`;
        g += `<rect x="${ox + 10}" y="64" width="${PW - 20}" height="320" rx="18" fill="#1C2433"/>`;
        g += P(apl ? [] : ['ic_kulak_yolu'], () => `<ellipse cx="${x}" cy="${y}" rx="104" ry="92" fill="url(#${gid})"/>`);
        if (ps > 0) { g += `<g opacity="${n1(ps)}">`;
          Object.entries(SN).forEach(([id, [dx, dy, r]]) => { if (apl && id === 'koklear_sinir') { g += P(['sinir_yeri'], () => `<circle cx="${x + dx}" cy="${y + dy}" r="${r}" fill="none" stroke="${R.sag_kulak}" stroke-width="${k.W2(2.4)}" stroke-dasharray="${k.W2(5)} ${k.W2(4)}"/>`); return; }
            g += (apl ? `<circle cx="${x + dx}" cy="${y + dy}" r="${r}" fill="#3A4250"/>` : P([id].concat(id.includes('vestibuler') ? ['vestibuler_sinir'] : []), () => `<circle cx="${x + dx}" cy="${y + dy}" r="${r}" fill="#3A4250"/>`))
              + (ay.harfler === false ? '' : c.yazi(x + dx + (dx < 0 ? -r - 8 : r + 8), y + dy + c.fs(5), HARF[id], {a: dx < 0 ? 'end' : 'start', px: 15, fw: 800, renk: '#5D6B80'})); });
          g += '</g>'; }
        g += c.yazi(ox + 24, 90, L('ÖN', 'ANT'), {a: 'start', px: 13, fw: 800, renk: '#9CC9F3'}) + c.yazi(ox + PW - 24, 90, L('ARKA', 'POST'), {a: 'end', px: 13, fw: 800, renk: '#9CC9F3'});
        g += c.yazi(x, 40, apl ? L('Koklear sinir yok', 'Absent cochlear nerve') : L('Normal', 'Normal'), {px: 22, fw: 800, ff: 'Outfit', renk: apl ? R.sag_kulak : R.lacivert});
        g += c.yazi(x, 414, 'MR T2', {px: 14, fw: 700, renk: R.soluk});
        return g; };
      let s = P(['normal'], () => panel(5, false));
      if (iki) { const p = v6Gor(c, ay.aplazi_cumle, .6, .7); if (p > 0) s += `<g opacity="${n1(p)}">` + P(['aplazi'], () => panel(PW + 45, true)) + '</g>'; }
      return s; }};
};

// ================================================================ vertebrobaziler sistem (önden, şematik): vertebral arterler birleşip baziler arteri yapar; PICA (vertebral arterden), AICA (baziler arterin alt bölümünden;
// labirent arteri çoğunlukla AICA'dan çıkar ve VIII. sinirle iç kulağa gider), SCA (baziler tepesine yakın), arka beyin arterleri (PCA). Kaynak: Gray 1918 Fig. 516; Kim ve ark. (AICA ve labirent arteri).
// ayar: {cumleler: {vertebral_arter: 1, baziler_arter: 1, pica: 3, aica: 4, labirent_arteri: 4, sca: 1, pca: 1}, adlar: true}
// parçalar: vertebral_arter, baziler_arter, pica, aica, sca, pca, labirent_arteri (= ic_isitsel_arter), beyin_sapi, pons, medulla, orta_beyin, beyincik, ic_kulak, viii_sinir
CIZ.vertebrobaziler = (c, ay) => {
  const cx = 450;
  const a = {vertebral_arter: [cx - 52, 540], baziler_arter: [cx, 230], pica: [cx - 150, 500], aica: [cx - 148, 330], sca: [cx - 150, 190], pca: [cx - 160, 112], labirent_arteri: [cx - 238, 286],
    beyin_sapi: [cx + 40, 450], pons: [cx + 80, 250], medulla: [cx + 40, 450], orta_beyin: [cx + 60, 100], beyincik: [cx + 270, 400], ic_kulak: [cx - 300, 270], viii_sinir: [cx - 200, 300]};
  const takma = {vertebral_arterler: 'vertebral_arter', baziler: 'baziler_arter', ic_isitsel_arter: 'labirent_arteri', posterior_inferior_serebellar_arter: 'pica', anterior_inferior_serebellar_arter: 'aica',
    superior_serebellar_arter: 'sca', arka_beyin_arteri: 'pca', serebellum: 'beyincik', vestibulokoklear_sinir: 'viii_sinir'};
  return {w: 900, h: 640, cm: 1.05, a: takmaAd(a, takma), takma, vurguEsle: {beyin_sapi: 'pons'},
    yer: {vertebral_arter: 'alt', baziler_arter: 'ust', pica: 'sol', aica: 'sol', sca: 'sol', pca: 'sol', labirent_arteri: 'sol', beyin_sapi: 'sag', pons: 'sag', medulla: 'sag', orta_beyin: 'sag', beyincik: 'sag', ic_kulak: 'sol', viii_sinir: 'sol'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c), Z = id => ay.cumleler && ay.cumleler[id] != null ? ilerle(c.t, c.cb(ay.cumleler[id]) + .2, 1.2) : ilerle(c.t, .4, 1.2);
      let s = '';
      // beyincik (arkada), beyin sapı (önde)
      s += P(['beyincik'], () => [-1, 1].map(m => k.yol(gElips(cx + m * 200, 410, 176, 132), '#EEF2F8', NV, 2.2) + [0, 1, 2].map(i => k.yol(`M${cx + m * 70} ${360 + i * 40} C ${cx + m * 160} ${350 + i * 40} ${cx + m * 260} ${356 + i * 40} ${cx + m * 350} ${380 + i * 34}`, 'none', AR.ince, 1.4)).join('')).join(''));
      s += P(['orta_beyin', 'beyin_sapi'], () => k.yol(`M${cx - 120} 60 C ${cx - 90} 50 ${cx + 90} 50 ${cx + 120} 60 L${cx + 100} 150 L${cx - 100} 150 Z`, '#F6F3F6', NV, 2.4));
      s += P(['pons', 'beyin_sapi'], () => k.yol(`M${cx - 104} 150 C ${cx - 150} 190 ${cx - 150} 300 ${cx - 96} 336 L${cx + 96} 336 C ${cx + 150} 300 ${cx + 150} 190 ${cx + 104} 150 Z`, '#F6F3F6', NV, 2.4)
        + [0, 1, 2, 3].map(i => k.yol(`M${cx - 120 + i * 4} ${190 + i * 34} C ${cx - 40} ${200 + i * 34} ${cx + 40} ${200 + i * 34} ${cx + 120 - i * 4} ${190 + i * 34}`, 'none', '#D9D2DA', 1.4)).join(''));
      s += P(['medulla', 'beyin_sapi'], () => k.yol(`M${cx - 92} 336 L${cx + 92} 336 C ${cx + 80} 420 ${cx + 60} 520 ${cx + 54} 640 L${cx - 54} 640 C ${cx - 60} 520 ${cx - 80} 420 ${cx - 92} 336 Z`, '#F6F3F6', NV, 2.4));
      // VIII. sinir ve iç kulak (sol tarafta)
      s += P(['viii_sinir'], () => k.boru(`M${cx - 120} 312 C ${cx - 180} 304 ${cx - 230} 290 ${cx - 280} 278`, k.w(12), AR.sinir, AR.sinir_c, 1.6) + k.boru(`M${cx + 120} 312 C ${cx + 180} 304 ${cx + 230} 290 ${cx + 280} 278`, k.w(12), AR.sinir, AR.sinir_c, 1.6));
      s += P(['ic_kulak'], () => k.boru(sarmal(cx - 306, 272, 24, 6, 2, 0), k.w(6), AR.sivi, NV, 1.6));
      // arterler (boru, kırmızı); çizilerek gelir
      const ar = (ids, d, p, w = 12) => p <= .002 ? '' : P(ids, () => `<g opacity="${n1(kis(p * 3))}">` + `<path d="${d}" fill="none" stroke="#9E2A2E" stroke-width="${n1(k.w(w) + 2 * k.w(2))}" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${n1(1 - p)}"/>`
        + `<path d="${d}" fill="none" stroke="${V6B.arter}" stroke-width="${n1(k.w(w))}" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${n1(1 - p)}"/></g>`);
      const pv = Z('vertebral_arter'), pb = Z('baziler_arter');
      s += ar(['vertebral_arter'], `M${cx - 70} 650 C ${cx - 72} 560 ${cx - 40} 430 ${cx - 6} 340`, pv, 14) + ar(['vertebral_arter'], `M${cx + 70} 650 C ${cx + 72} 560 ${cx + 40} 430 ${cx + 6} 340`, pv, 14);
      s += ar(['baziler_arter'], `M${cx} 342 L${cx} 150`, kis(pb * 1.2 - .2), 16);
      s += ar(['pca'], `M${cx} 150 C ${cx - 60} 128 ${cx - 140} 118 ${cx - 230} 110`, Z('pca'), 10) + ar(['pca'], `M${cx} 150 C ${cx + 60} 128 ${cx + 140} 118 ${cx + 230} 110`, Z('pca'), 10);
      s += ar(['sca'], `M${cx} 168 C ${cx - 70} 170 ${cx - 150} 182 ${cx - 230} 230`, Z('sca'), 8) + ar(['sca'], `M${cx} 168 C ${cx + 70} 170 ${cx + 150} 182 ${cx + 230} 230`, Z('sca'), 8);
      s += ar(['aica'], `M${cx} 314 C ${cx - 60} 322 ${cx - 130} 330 ${cx - 190} 360 C ${cx - 230} 380 ${cx - 260} 400 ${cx - 280} 420`, Z('aica'), 8) + ar(['aica'], `M${cx} 314 C ${cx + 60} 322 ${cx + 130} 330 ${cx + 190} 360 C ${cx + 230} 380 ${cx + 260} 400 ${cx + 280} 420`, Z('aica'), 8);
      s += ar(['labirent_arteri'], `M${cx - 150} 328 C ${cx - 190} 310 ${cx - 240} 296 ${cx - 292} 284`, Z('labirent_arteri'), 5) + ar(['labirent_arteri'], `M${cx + 150} 328 C ${cx + 190} 310 ${cx + 240} 296 ${cx + 292} 284`, Z('labirent_arteri'), 5);
      s += ar(['pica'], `M${cx - 30} 430 C ${cx - 80} 440 ${cx - 120} 470 ${cx - 130} 510 C ${cx - 150} 560 ${cx - 220} 540 ${cx - 270} 500`, Z('pica'), 8) + ar(['pica'], `M${cx + 30} 430 C ${cx + 80} 440 ${cx + 120} 470 ${cx + 130} 510 C ${cx + 150} 560 ${cx + 220} 540 ${cx + 270} 500`, Z('pica'), 8);
      if (ay.adlar !== false) { const ad = (id, x, y, m, an = 'end') => { const p = Z(id); return p > .6 ? c.yazi(x, y, m, {a: an, px: 16, fw: 800, renk: '#B0262B', ek: `opacity="${n1(kis((p - .6) / .4))}"`}) : ''; };
        s += ad('pca', cx + 236, 100, 'PCA', 'start') + ad('sca', cx + 238, 222, 'SCA', 'start') + ad('aica', cx + 288, 418, 'AICA', 'start') + ad('pica', cx + 278, 500, 'PICA', 'start')
          + ad('baziler_arter', cx + 14, 250, L('baziler', 'basilar'), 'start') + ad('vertebral_arter', cx + 80, 620, L('vertebral', 'vertebral'), 'start'); }
      return s; }};
};

// ================================================================ polar desenler (baş üstten, mikrofon başın ortasında; 0° ön, 180° arka): çok yönlü, kardiyoid (sıfır 180°), hiperkardiyoid (sıfırlar ~110° ve 250°)
// dB ölçeği: dış halka 0 dB, merkez -30 dB. ayar: {desenler: [{tip: "cok_yonlu"|"kardiyoid"|"hiperkardiyoid"|"superkardiyoid", cumle}], sifir_cumle, grafik: {genel grafik verisi; verilirse sağda aynen çizilir}}
// parçalar: cok_yonlu, kardiyoid, hiperkardiyoid, superkardiyoid, sifir_noktalari (= null), bas, on (+ grafik parçaları)
const POLAR_G = {cok_yonlu: () => 1, kardiyoid: t => .5 + .5 * Math.cos(t), hiperkardiyoid: t => .25 + .75 * Math.cos(t), superkardiyoid: t => .37 + .63 * Math.cos(t)};
const POLAR_R = {cok_yonlu: '#8D9DB4', kardiyoid: R.mavi, hiperkardiyoid: R.sag_kulak, superkardiyoid: '#7A5CC7'};
const POLAR_AD = {cok_yonlu: L('çok yönlü', 'omnidirectional'), kardiyoid: L('kardiyoid', 'cardioid'), hiperkardiyoid: L('hiperkardiyoid', 'hypercardioid'), superkardiyoid: L('süperkardiyoid', 'supercardioid')};
CIZ.polar_desen = (c, ay) => {
  const gr = ay.grafik ? CIZ.grafik(c, ay.grafik) : null, H = gr ? Math.max(gr.h, 520) : 560, PW = gr ? 520 : 600, R0 = Math.min(PW, H) * .36, O = [PW / 2, H / 2 + 6];
  const des = (ay.desenler || [{tip: 'cok_yonlu'}, {tip: 'kardiyoid'}, {tip: 'hiperkardiyoid'}]).map(d => typeof d === 'string' ? {tip: d} : d);
  const rr = (tip, t) => { const g = Math.abs(POLAR_G[tip](t)), db = Math.max(-30, 20 * Math.log10(Math.max(g, 1e-6))); return R0 * (1 + db / 30); };
  const pt = (r, t) => [O[0] + r * Math.sin(t), O[1] - r * Math.cos(t)];
  const a = {bas: O, on: [O[0], O[1] - R0 - 20], sifir_noktalari: pt(R0 * .5, Math.PI), null: pt(R0 * .5, Math.PI)};
  des.forEach(d => { const t = d.tip === 'cok_yonlu' ? -Math.PI / 4 : d.tip === 'kardiyoid' ? Math.PI / 3 : -Math.PI / 2.4; a[d.tip] = pt(rr(d.tip, t), t); });
  const yer = {bas: 'alt', on: 'ust', sifir_noktalari: 'alt', null: 'alt', cok_yonlu: 'sol', kardiyoid: 'sag', hiperkardiyoid: 'sol', superkardiyoid: 'sol'};
  const out = {w: PW + (gr ? gr.w : 0), h: H, cm: 1.05, a, yer, takma: {null: 'sifir_noktalari', sifir: 'sifir_noktalari', omni: 'cok_yonlu'}};
  if (gr) { const dy = (H - gr.h) / 2, kay = p => [p[0] + PW, p[1] + dy];
    Object.entries(gr.a || {}).forEach(([q, p]) => { if (!a[q]) a[q] = kay(p); }); Object.assign(yer, Object.fromEntries(Object.keys(gr.yer || {}).filter(q => !(q in yer)).map(q => [q, gr.yer[q]])));
    out.vurguEsle = gr.vurguEsle; out.takma = Object.assign({}, gr.takma || {}, out.takma); out.kam = Object.fromEntries(Object.entries(gr.kam || {}).map(([q, p]) => [q, kay(p)])); }
  out.svg = () => {
    const k = kalem(c, 1), P = anP(c);
    let s = '';
    // halkalar ve açı çizgileri
    [0, -10, -20].forEach(db => s += `<circle cx="${O[0]}" cy="${O[1]}" r="${n1(R0 * (1 + db / 30))}" fill="none" stroke="${R.cizgi}" stroke-width="${k.W2(db ? 1.4 : 2)}"/>` + c.yazi(O[0] + 6, O[1] - R0 * (1 + db / 30) - 4, `${db} dB`, {a: 'start', px: 12, fw: 600, renk: '#9AABC2'}));
    [0, 45, 90, 135].forEach(d => { const t = d * Math.PI / 180, p1 = pt(R0, t), p2 = pt(R0, t + Math.PI); s += `<path d="M${n1(p1[0])} ${n1(p1[1])} L${n1(p2[0])} ${n1(p2[1])}" stroke="${R.cizgi}" stroke-width="${k.W2(1.2)}"/>`; });
    [[0, '0°'], [90, '90°'], [180, '180°'], [270, '270°']].forEach(([d, m]) => { const p = pt(R0 + 24, d * Math.PI / 180); s += c.yazi(p[0], p[1] + c.fs(6), m, {px: 14, fw: 700, renk: R.soluk}); });
    s += P(['on'], () => c.yazi(O[0], O[1] - R0 - 44, L('ön', 'front'), {px: 16, fw: 800, renk: R.lacivert})) + c.yazi(O[0], O[1] + R0 + 54, L('arka', 'back'), {px: 16, fw: 800, renk: R.lacivert});
    // baş üstten (burun önde)
    s += P(['bas'], () => { const B = basUstten(k, O[0], O[1], 30, 36); return B.bas + B.sag + B.sol; });
    // desenler
    des.forEach(d => { const p = v6Gor(c, d.cumle, .3, 1.2); if (p <= 0) return; const N = 180, pts = [];
      for (let i = 0; i <= N * p; i++) { const t = i / N * 2 * Math.PI; pts.push(pt(rr(d.tip, t), t)); }
      s += P([d.tip], () => `<path d="${yolDiz(pts)}" fill="none" stroke="${POLAR_R[d.tip]}" stroke-width="${k.W2(d.tip === 'cok_yonlu' ? 2.4 : 3.4)}"${d.tip === 'cok_yonlu' ? ` stroke-dasharray="${k.W2(8)} ${k.W2(6)}"` : ''}/>`); });
    // sıfır noktaları
    const ps = ay.sifir_cumle != null ? v6Gor(c, ay.sifir_cumle, 0, .6) : 0;
    if (ps > 0) { let g = ''; des.forEach(d => { if (d.tip === 'cok_yonlu') return; const g0 = POLAR_G[d.tip], cz = -(g0(0) - g0(Math.PI / 2)) ? null : null; const c1 = d.tip === 'kardiyoid' ? [Math.PI] : (() => { const x = -POLAR_G[d.tip](Math.PI / 2) / (POLAR_G[d.tip](0) - POLAR_G[d.tip](Math.PI / 2)); const t = Math.acos(x); return [t, 2 * Math.PI - t]; })();
        c1.forEach(t => { const p = pt(R0, t); g += `<path d="M${O[0]} ${O[1]} L${n1(p[0])} ${n1(p[1])}" stroke="${POLAR_R[d.tip]}" stroke-width="${k.W2(1.8)}" stroke-dasharray="${k.W2(5)} ${k.W2(5)}"/>`
          + `<circle cx="${n1(p[0])}" cy="${n1(p[1])}" r="${n1(c.fs(9))}" fill="#FFFFFF" stroke="${POLAR_R[d.tip]}" stroke-width="${k.W2(2.4)}"/><path d="M${n1(p[0] - c.fs(4.5))} ${n1(p[1] - c.fs(4.5))} L${n1(p[0] + c.fs(4.5))} ${n1(p[1] + c.fs(4.5))} M${n1(p[0] + c.fs(4.5))} ${n1(p[1] - c.fs(4.5))} L${n1(p[0] - c.fs(4.5))} ${n1(p[1] + c.fs(4.5))}" stroke="${POLAR_R[d.tip]}" stroke-width="${k.W2(2)}"/>`; }); });
      s += `<g opacity="${n1(ps)}">` + P(['sifir_noktalari'], () => g) + '</g>'; }
    // lejant
    des.forEach((d, i) => { const p = v6Gor(c, d.cumle, .3, .6); if (p <= 0) return; const y = H - 18 - (des.length - 1 - i) * 24;
      s += `<g opacity="${n1(p)}"><path d="M14 ${y - 5} L40 ${y - 5}" stroke="${POLAR_R[d.tip]}" stroke-width="${k.W2(3.4)}"${d.tip === 'cok_yonlu' ? ` stroke-dasharray="${k.W2(6)} ${k.W2(4)}"` : ''}/>` + c.yazi(48, y, POLAR_AD[d.tip], {a: 'start', px: 15, fw: 700, renk: R.soluk}) + '</g>'; });
    if (gr) s += `<path d="M${PW - 6} 20 L${PW - 6} ${H - 20}" stroke="${R.cizgi}" stroke-width="${k.W2(2)}"/><g transform="translate(${PW} ${n1((H - gr.h) / 2)})">${gr.svg()}</g>`;
    return s; };
  return out;
};

// ================================================================ Fukuda (Unterberger) adım testi, üstten: başlangıç konumu (kesik), 50 adım sonunda dönmüş ve ilerlemiş konum; dönme açısı, ilerleme, 45° sınır
// ayar: {aci: 60, yon: "sag"|"sol" (dönme yönü), adim_cumle (yürür), donme_cumle (açı yayı), esik_cumle (45° çizgisi), taraf_cumle (etkilenen kulak rozeti), ilerleme: 1}
// parçalar: baslangic, bitis, donme_acisi (= aci), ilerleme (= mesafe), esik (= kirk_bes_derece), etkilenen_taraf, kollar, adim_izi
CIZ.fukuda = (c, ay) => {
  const sag = ay.yon !== 'sol', sg = sag ? 1 : -1, A = (ay.aci ?? 60) * Math.PI / 180, S0 = [380 - sg * 40, 470], D = 250 * (ay.ilerleme ?? 1), KS = 1.45;
  const son = [S0[0] + sg * D * Math.sin(A * .5), S0[1] - D * Math.cos(A * .5)];
  const a = {baslangic: [S0[0], S0[1] + 30], bitis: son, donme_acisi: [son[0] + sg * 70, son[1] - 90], aci: [son[0] + sg * 70, son[1] - 90], ilerleme: [(S0[0] + son[0]) / 2 - sg * 30, (S0[1] + son[1]) / 2],
    mesafe: [(S0[0] + son[0]) / 2 - sg * 30, (S0[1] + son[1]) / 2], esik: [son[0] + sg * 100, son[1] - 100], kirk_bes_derece: [son[0] + sg * 100, son[1] - 100], etkilenen_taraf: [sag ? 720 : 80, 120], kollar: [S0[0], S0[1] - 60], adim_izi: [S0[0] + sg * 40, S0[1] - 60]};
  const takma = {aci: 'donme_acisi', mesafe: 'ilerleme', kirk_bes_derece: 'esik', kirk_bes: 'esik'};
  return {w: 800, h: 560, cm: 1.05, a: takmaAd(a, takma), takma,
    yer: {baslangic: 'alt', bitis: sag ? 'sag' : 'sol', donme_acisi: 'ust', aci: 'ust', ilerleme: sag ? 'sol' : 'sag', mesafe: 'sol', esik: 'ust', kirk_bes_derece: 'ust', etkilenen_taraf: 'ust', kollar: 'sol', adim_izi: 'sag'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c), ta = ekBas(c, ay.adim_cumle, .4), pw = c.t > ta ? kis((c.t - ta) / 5) : 0, q = yumIO(pw);
      const kisi = (x, y, th, op, kesik) => { const kk = kalem(c, KS), B = basUstten(kk, 0, -4, 20, 24), cz = kesik ? `stroke-dasharray="${kk.W2(5)} ${kk.W2(4)}"` : '', k = kk;
        return `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(th * 180 / Math.PI)}) scale(${KS})" opacity="${n1(op)}">` + k.yol(gElips(0, 6, 50, 22), kesik ? 'none' : SM.giysi, NV, 2.2, cz)
          + P(['kollar'], () => (kesik ? '' : [-30, 30].map(dx => k.boru(`M${dx} 0 L${dx} -66`, k.w(13), SM.giysi, NV, 1.8)).join(''))) + (kesik ? k.yol(gElips(0, -4, 20, 24), 'none', NV, 2, cz) : B.bas + B.sag + B.sol) + '</g>'; };
      let s = '';
      // zemin ızgarası
      for (let x = 40; x <= 760; x += 60) s += `<path d="M${x} 20 L${x} 540" stroke="${R.cizgi}" stroke-width="${k.W2(1)}"/>`;
      for (let y = 20; y <= 540; y += 60) s += `<path d="M40 ${y} L760 ${y}" stroke="${R.cizgi}" stroke-width="${k.W2(1)}"/>`;
      // başlangıç (kesik çizgi) ve ileri yön çizgisi
      s += P(['baslangic'], () => kisi(S0[0], S0[1], 0, 1, true)) + k.yol(`M${S0[0]} ${S0[1] - 40} L${S0[0]} 40`, 'none', '#9AABC2', 1.8, `stroke-dasharray="${k.W2(8)} ${k.W2(6)}"`);
      // yürüme izi ve kişi
      const yol = t => [S0[0] + (son[0] - S0[0]) * t + sg * 18 * Math.sin(t * Math.PI), S0[1] + (son[1] - S0[1]) * t], m = Math.max(2, Math.round(40 * q));
      if (q > 0) s += P(['ilerleme', 'adim_izi'], () => k.yol(gYol(Array.from({length: m}, (_, i) => yol(q * i / (m - 1)))), 'none', R.mavi, 3, `stroke-dasharray="${k.W2(2)} ${k.W2(8)}"`));
      const cur = yol(q), th = sg * A * q, bob = pw > 0 && pw < 1 ? 3 * Math.sin(c.t * 9) : 0;
      s += P(['bitis'], () => kisi(cur[0] + bob * Math.cos(th), cur[1] + bob * Math.sin(th), th, 1, false));
      if (pw > 0 && pw < 1) s += c.yazi(cur[0], cur[1] + 96, `${Math.round(50 * pw)} ${L('adım', 'steps')}`, {px: 17, fw: 800, renk: R.mavi});
      if (pw >= 1) s += c.yazi(son[0] - sg * 10, son[1] + 100, L('50 adım', '50 steps'), {px: 17, fw: 800, renk: R.soluk});
      // dönme açısı
      const pd = ay.donme_cumle != null ? v6Gor(c, ay.donme_cumle, 0, .8) : (pw >= 1 ? 1 : 0);
      if (pd > 0) { const r = 140, uc = th => [son[0] + r * Math.sin(th), son[1] - r * Math.cos(th)];
        s += `<g opacity="${n1(pd)}">` + k.yol(`M${n1(son[0])} ${n1(son[1])} L${n1(son[0])} ${n1(son[1] - r - 30)}`, 'none', R.soluk, 1.8, `stroke-dasharray="${k.W2(6)} ${k.W2(5)}"`)
          + k.yol(`M${n1(son[0])} ${n1(son[1])} L${n1(uc(sg * A)[0] + 30 * Math.sin(sg * A))} ${n1(uc(sg * A)[1] - 30 * Math.cos(sg * A))}`, 'none', R.lacivert, 2.4)
          + P(['donme_acisi'], () => `<path d="M${n1(uc(0)[0])} ${n1(uc(0)[1])} A${r} ${r} 0 0 ${sag ? 1 : 0} ${n1(uc(sg * A)[0])} ${n1(uc(sg * A)[1])}" fill="none" stroke="${R.mavi}" stroke-width="${k.W2(3.4)}"/>`
            + c.yazi(son[0] + sg * 64, son[1] - r - 16, `${Math.round(A * 180 / Math.PI)}°`, {px: 22, fw: 800, ff: 'Outfit', renk: R.mavi})) + '</g>'; }
      // 45 derece sınırı
      if (ay.esik_cumle != null) { const p = v6Gor(c, ay.esik_cumle, 0, .6), r = 190, t = sg * Math.PI / 4, uc = [son[0] + r * Math.sin(t), son[1] - r * Math.cos(t)], asim = A > Math.PI / 4;
        if (p > 0) s += `<g opacity="${n1(p)}">` + P(['esik'], () => k.yol(`M${n1(son[0])} ${n1(son[1])} L${n1(uc[0])} ${n1(uc[1])}`, 'none', R.sari, 3, `stroke-dasharray="${k.W2(7)} ${k.W2(5)}"`)
          + c.yazi(uc[0] + sg * 8, uc[1] - 8, '45°', {a: sag ? 'start' : 'end', px: 17, fw: 800, renk: '#B9822A'}))
          + v6bRozet(c, k, sag ? 620 : 180, 514, asim ? L('45°\'den fazla: anormal', 'over 45°: abnormal') : L('45° içinde', 'within 45°'), asim ? 'uyari' : 'dogru', asim ? R.sag_kulak : R.basari, 16) + '</g>'; }
      // etkilenen taraf
      if (ay.taraf_cumle != null) { const p = v6Gor(c, ay.taraf_cumle, 0, .6), x = sag ? 700 : 100;
        if (p > 0) s += `<g opacity="${n1(p)}">` + P(['etkilenen_taraf'], () => v6Ikon('kulak', x, 90, 46, sag ? R.sag_kulak : R.sol_kulak)
          + c.yazi(x, 140, sag ? L('sağ: etkilenen', 'right: affected') : L('sol: etkilenen', 'left: affected'), {px: 15, fw: 800, renk: sag ? R.sag_kulak : R.sol_kulak})) + '</g>'; }
      s += c.yazi(60, 46, L('üstten', 'top view'), {a: 'start', px: 15, fw: 700, renk: R.soluk});
      return s; }};
};

// ================================================================ kulak kepçesinde yansıma (yandan, yüz solda; ön solda): önden gelen seste doğrudan yol ve konka arka duvarından yansıyan yol kanal ağzında birleşir
// (gecikme -> tiz frekansta çentik); arkadan gelen ses kepçe kenarına çarpar (gölge). ayar: {yansima_cumle, arka_cumle, ust_cumle (yukarıdan gelen yol), grafik: {...} (sağda aynen çizilir)}
// parçalar: kepce (= kulak_kepcesi), konka, kanal_agzi, dogrudan_ses, yansiyan_ses, on_kaynak, arka_kaynak, ust_kaynak, golge (+ grafik parçaları)
CIZ.kepce_yansima = (c, ay) => {
  const gr = ay.grafik ? CIZ.grafik(c, ay.grafik) : null, H = gr ? Math.max(gr.h, 520) : 560, PW = gr ? 520 : 600, SX = PW / 600, OY = (H - 560 * SX) / 2, X = x => x * SX, Y = y => y * SX + OY;
  const KN = [X(300), Y(300)], DUV = [X(372), Y(306)];
  const a = {kepce: [X(430), Y(170)], kulak_kepcesi: [X(430), Y(170)], konka: [X(345), Y(330)], kanal_agzi: KN, dogrudan_ses: [X(150), Y(300)], yansiyan_ses: [X(330), Y(372)], on_kaynak: [X(50), Y(300)],
    arka_kaynak: [X(560), Y(250)], ust_kaynak: [X(300), Y(40)], golge: [X(500), Y(300)]};
  const takma = {kulak_kepcesi: 'kepce', kanal: 'kanal_agzi', yansima: 'yansiyan_ses', dogrudan: 'dogrudan_ses'};
  const yer = {kepce: 'ust', kulak_kepcesi: 'ust', konka: 'alt', kanal_agzi: 'alt', dogrudan_ses: 'ust', yansiyan_ses: 'alt', on_kaynak: 'ust', arka_kaynak: 'ust', ust_kaynak: 'ust', golge: 'alt'};
  const out = {w: PW + (gr ? gr.w : 0), h: H, cm: 1.05, a, yer, takma};
  if (gr) { const dy = (H - gr.h) / 2, kay = p => [p[0] + PW, p[1] + dy];
    Object.entries(gr.a || {}).forEach(([q, p]) => { if (!a[q]) a[q] = kay(p); }); Object.keys(gr.yer || {}).forEach(q => { if (!(q in yer)) yer[q] = gr.yer[q]; });
    out.vurguEsle = gr.vurguEsle; out.takma = Object.assign({}, gr.takma || {}, takma); out.kam = Object.fromEntries(Object.entries(gr.kam || {}).map(([q, p]) => [q, kay(p)])); }
  out.svg = () => {
    const k = kalem(c, SX), P = anP(c);
    let s = `<g transform="translate(0 ${n1(OY)}) scale(${SX.toFixed(4)})">`;
    // kepçe (yandan): heliks, antiheliks, konka, tragus, lob
    s += P(['kepce'], () => k.yol(gYol([[300, 110], [380, 70], [470, 90], [520, 170], [520, 270], [490, 350], [450, 410], [420, 470], [380, 500], [340, 490], [330, 440], [300, 400], [270, 360], [262, 300], [270, 220]], true, .45), '#F3E4DA', NV, 2.6)
      + k.yol(gYol([[330, 140], [400, 110], [460, 140], [480, 210], [470, 290], [440, 360], [410, 410]]), 'none', '#C9A894', 2.4)
      + k.yol(gYol([[350, 190], [410, 170], [440, 220], [430, 290], [400, 340]]), 'none', '#C9A894', 2));
    s += P(['konka', 'kepce'], () => k.yol(gYol([[300, 250], [340, 236], [380, 250], [392, 300], [380, 350], [340, 370], [304, 350], [290, 300]], true, .45), '#E9C9B6', '#B48E86', 1.8));
    s += k.yol(gYol([[262, 300], [250, 270], [260, 250], [282, 262], [290, 300], [282, 340], [262, 344]]), '#F3E4DA', NV, 2.2);   // tragus
    s += P(['kanal_agzi'], () => k.yol(gElips(300, 300, 16, 22), '#4A2B32', NV, 2));
    // önden kaynak: doğrudan ve yansıyan yollar
    const pf = v6Gor(c, ay.yansima_cumle, .4, 1.2), pr = ay.yansima_cumle != null ? ilerle(c.t, c.cb(ay.yansima_cumle) + .6, 1.4) : 1;
    s += P(['on_kaynak'], () => hoparlorCiz(k, 40, 300, .6, 0));
    if (pf > 0) s += P(['dogrudan_ses'], () => v6YolOk(k, 'M70 300 L280 300', pf, R.mavi, 4, [280, 300, 0], {b: 14}));
    if (pr > 0) s += P(['yansiyan_ses'], () => v6YolOk(k, 'M70 312 C 160 340 300 360 372 330 L372 330 C 360 322 330 312 318 306', pr, '#E39A10', 3.4, [318, 306, 3.6], {b: 12})
      + (pr > .9 ? `<circle cx="372" cy="330" r="7" fill="#E39A10" opacity=".8"/>` : ''));
    // arkadan kaynak: kepçe kenarına çarpar
    if (ay.arka_cumle != null) { const p = v6Gor(c, ay.arka_cumle, 0, 1.2);
      if (p > 0) s += `<g opacity="${n1(Math.min(1, p * 1.5))}">` + P(['arka_kaynak'], () => hoparlorCiz(k, 570, 250, .6, 180))
        + P(['golge'], () => v6YolOk(k, 'M540 252 L524 254', p, R.lacivert, 3.4, null) + `<path d="M520 230 L470 300 L520 300 Z" fill="${R.lacivert}" opacity="${n1(.08 * p)}"/>`
          + k.yol('M540 262 C 500 300 420 310 330 304', 'none', R.lacivert, 2.4, `stroke-dasharray="${k.W2(6)} ${k.W2(6)}" opacity="${n1(.6 * p)}"`)) + '</g>'; }
    if (ay.ust_cumle != null) { const p = v6Gor(c, ay.ust_cumle, 0, 1.2);
      if (p > 0) s += P(['ust_kaynak'], () => v6YolOk(k, 'M300 40 C 300 120 300 200 300 276', p, '#7A5CC7', 3.4, [300, 276, 1.57], {b: 12})); }
    s += '</g>';
    s += c.yazi(14, 30, L('← ön', '← front'), {a: 'start', px: 15, fw: 800, renk: R.soluk}) + c.yazi(PW - 20, 30, L('arka →', 'back →'), {a: 'end', px: 15, fw: 800, renk: R.soluk});
    if (gr) s += `<path d="M${PW - 6} 20 L${PW - 6} ${H - 20}" stroke="${R.cizgi}" stroke-width="${k.W2(2)}"/><g transform="translate(${PW} ${n1((H - gr.h) / 2)})">${gr.svg()}</g>`;
    return s; };
  return out;
};

// ================================================================ temporal kemik yandan (sağ, lateral görünüm; ön sağda): pars squamosa, processus zygomaticus, fossa mandibularis ve eklem tümseği,
// pars tympanica (dış kulak yolunun ön, alt ve arka duvarının bir kısmı), dış kulak yolu ağzı (derinde zar), suprameatal çıkıntı (Henle), processus mastoideus, processus styloideus, foramen stylomastoideum.
// Kaynak: Gray 1918 Fig. 134 (sağ temporal kemik, dış yüz). ayar: {kondil_cumle (mandibula kondili fossada, kesik), yonler: true}
// parçalar: temporal_kemik, pars_squamosa (= squamosa), zigomatik_cikinti (= processus_zygomaticus), mandibular_cukur (= fossa_mandibularis, cene_eklem_cukuru), eklem_tumsegi, pars_tympanica (= timpanik_bolum),
//   dis_kulak_yolu (= meatus, dis_kulak_yolu_agzi), timpanik_membran, henle_cikintisi (= suprameatal_cikinti), mastoid (= processus_mastoideus, mastoid_cikinti), stiloid (= processus_styloideus), stilomastoid_delik, kondil
CIZ.temporal_kemik_yan = (c, ay) => {
  const EAM = [488, 404];
  const a = {temporal_kemik: [300, 300], pars_squamosa: [480, 200], zigomatik_cikinti: [800, 320], mandibular_cukur: [604, 372], eklem_tumsegi: [672, 360], pars_tympanica: [520, 456],
    dis_kulak_yolu: EAM, timpanik_membran: [EAM[0] + 4, EAM[1] + 4], henle_cikintisi: [452, 352], mastoid: [372, 520], stiloid: [522, 572], stilomastoid_delik: [430, 504], kondil: [602, 430]};
  const takma = {squamosa: 'pars_squamosa', processus_zygomaticus: 'zigomatik_cikinti', fossa_mandibularis: 'mandibular_cukur', cene_eklem_cukuru: 'mandibular_cukur', timpanik_bolum: 'pars_tympanica',
    meatus: 'dis_kulak_yolu', dis_kulak_yolu_agzi: 'dis_kulak_yolu', suprameatal_cikinti: 'henle_cikintisi', processus_mastoideus: 'mastoid', mastoid_cikinti: 'mastoid', processus_styloideus: 'stiloid',
    foramen_stylomastoideum: 'stilomastoid_delik', kulak_zari: 'timpanik_membran', mandibula_kondili: 'kondil'};
  return {w: 660, h: 540, vx: 250, vy: 70, cm: 1.05, a: takmaAd(a, takma), takma, kam: {dis_kulak_yolu: [500, 410], timpanik_membran: [492, 408], mandibular_cukur: [600, 380]},
    yer: {temporal_kemik: 'sol', pars_squamosa: 'sol', zigomatik_cikinti: 'sag', mandibular_cukur: 'sag', eklem_tumsegi: 'sag', pars_tympanica: 'sol', dis_kulak_yolu: 'sol', timpanik_membran: 'sol',
      henle_cikintisi: 'sol', mastoid: 'sol', stiloid: 'alt', stilomastoid_delik: 'sol', kondil: 'sag'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c), B = '#E7DFD2', BC = '#8C7A62', B2 = '#DDD1BE';
      let s = '';
      // tek kemik dış hattı: squama (yelpaze), zigomatik çıkıntı, eklem tümseği, fossa, timpanik plak, mastoid
      const DIS = [[300, 384], [282, 300], [300, 212], [360, 142], [460, 102], [560, 100], [640, 128], [690, 186], [702, 256], [686, 306], [860, 298], [882, 312], [870, 338], [702, 348],
        [690, 366], [666, 374], [646, 362], [622, 386], [588, 394], [560, 382], [544, 440], [504, 472], [454, 472], [428, 504], [386, 568], [352, 548], [324, 472]];
      s += P(['temporal_kemik'], () => k.yol(gYol(DIS, true, .3), B, BC, 2.6));
      s += P(['pars_squamosa'], () => `<path d="${gYol([[284, 320], [300, 212], [360, 142], [460, 102], [560, 100], [640, 128], [690, 186], [702, 256], [686, 306], [600, 330], [480, 336], [360, 334]], true, .3)}" fill="${B2}" fill-opacity=".45"/>`
        + k.yol('M590 300 C 560 240 510 196 450 168 M520 316 C 490 270 440 240 380 226', 'none', '#CDBFA8', 1.4));
      s += k.yol('M560 344 C 500 338 420 336 330 352', 'none', BC, 1.8);   // supramastoid kret (zigomanın arka kökü)
      s += P(['zigomatik_cikinti'], () => k.yol(gYol([[690, 304], [860, 298], [882, 312], [870, 338], [702, 348], [694, 326]], true, .2), '#E2D8C8', BC, 2.2) + k.yol('M874 302 L880 310 L873 318 L880 326 L872 334', 'none', BC, 1.6));
      s += P(['eklem_tumsegi'], () => k.yol(gYol([[646, 362], [666, 350], [692, 356], [690, 368], [666, 376]], false, .4), 'none', BC, 2.4));
      s += P(['mandibular_cukur'], () => k.yol(gYol([[562, 352], [592, 340], [628, 346], [648, 362], [630, 386], [592, 394], [564, 382]], true, .45), '#CDBFA6', BC, 2));
      // mastoid çıkıntı ve hücre dokusu izlenimi
      s += P(['mastoid'], () => k.yol(gYol([[300, 384], [340, 400], [400, 440], [428, 504], [386, 568], [352, 548], [324, 472]], true, .35), '#E2D8C8', BC, 2.2)
        + [[340, 440], [360, 470], [344, 498], [372, 512], [362, 540]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#C9BBA4"/>`).join(''));
      // pars tympanica: dış kulak yolunun ön ve alt duvarını saran plak; dış kulak yolu ağzı, derinde zar; Henle çıkıntısı
      s += P(['pars_tympanica'], () => k.yol(gYol([[548, 372], [560, 410], [548, 450], [512, 474], [466, 474], [440, 460], [448, 446], [480, 456], [516, 444], [532, 414], [528, 382]], true, .35), '#EFE7DA', BC, 2));
      s += P(['dis_kulak_yolu'], () => k.yol(gElips(EAM[0], EAM[1], 36, 42), '#5E4A3A', BC, 2.4) + k.yol(gElips(EAM[0] + 4, EAM[1] + 2, 24, 30), '#3E2F25', null));
      s += P(['timpanik_membran'], () => k.yol(gElips(EAM[0] + 6, EAM[1] + 4, 12, 16), '#BCC8D8', '#8E9CB3', 1.4));
      s += P(['henle_cikintisi'], () => k.yol('M446 356 L456 344 L462 358 Z', '#CDBFA8', BC, 1.6));
      // stiloid çıkıntı, stilomastoid delik
      s += P(['stiloid'], () => k.yol(gYol([[468, 470], [490, 474], [548, 602], [540, 606]], true, .2), '#E2D8C8', BC, 2));
      s += P(['stilomastoid_delik'], () => k.yol(gElips(432, 500, 8, 6), '#3E2F25', BC, 1.4));
      // mandibula kondili (kesik): fossada
      if (ay.kondil_cumle != null) { const p = v6Gor(c, ay.kondil_cumle, 0, .8);
        if (p > 0) s += `<g opacity="${n1(p)}">` + P(['kondil'], () => k.yol('M566 384 C 570 362 636 360 642 384 C 642 396 632 402 626 406 L622 530 L590 530 L586 406 C 576 402 566 396 566 384 Z', '#FFFFFF', R.mavi, 2.2, `stroke-dasharray="${k.W2(7)} ${k.W2(5)}" fill-opacity=".55"`)) + '</g>'; }
      if (ay.yonler !== false) s += c.yazi(900, 96, L('ÖN →', 'ANT →'), {a: 'end', px: 16, fw: 800, renk: R.soluk}) + c.yazi(262, 96, L('Sağ, dıştan', 'Right, lateral'), {a: 'start', px: 16, fw: 800, renk: R.sag_kulak});
      return s; }};
};

// ================================================================ iç kulağın gelişimi (embriyoloji, şematik): solda üç evre (otik plakod, otik çukur, otik vezikül; arka beyin yanında yüzey ektoderm),
// sağda vezikülün sırt (dorsal) ve karın (ventral) bölümleri: sırttan utrikül, yarım daire kanalı cepleri (ortası kaynaşınca kanal), endolenfatik kanal ve kese; karından sakkül ve koklear kanal (uzayıp kıvrılır).
// Kaynak: Moore ve Persaud, The Developing Human (otik vezikül). ayar: {evreler: true, ayrim_cumle, sirt_cumle, kese_cumle, karin_cumle, kanal_cumle (ceplerin ortası kaybolur)}
// parçalar: plakod, cukur, vezikul, sirt_bolum (= dorsal), karin_bolum (= ventral), utrikul, yarim_daire_kanallari (= cepler), endolenfatik_kanal, endolenfatik_kese, sakkul, koklea (= koklear_kanal), ektoderm, arka_beyin
CIZ.otik_gelisim = (c, ay) => {
  const ev = ay.evreler !== false, OX = ev ? 330 : 0, W = OX + 590;
  const a = {sirt_bolum: [OX + 300, 150], dorsal: [OX + 300, 150], karin_bolum: [OX + 300, 400], ventral: [OX + 300, 400], utrikul: [OX + 330, 250], yarim_daire_kanallari: [OX + 470, 120], cepler: [OX + 470, 120],
    endolenfatik_kanal: [OX + 160, 200], endolenfatik_kese: [OX + 110, 80], sakkul: [OX + 300, 380], koklea: [OX + 420, 500], koklear_kanal: [OX + 420, 500], vezikul: [OX + 300, 300]};
  if (ev) Object.assign(a, {plakod: [150, 120], cukur: [150, 300], ektoderm: [250, 60], arka_beyin: [60, 120]}), a.vezikul_evre = [150, 480];
  const takma = {dorsal: 'sirt_bolum', ventral: 'karin_bolum', cepler: 'yarim_daire_kanallari', koklear_kanal: 'koklea', kanal: 'koklea', otik_plakod: 'plakod', otik_cukur: 'cukur', otik_vezikul: 'vezikul'};
  return {w: W, h: 600, cm: 1.05, a: takmaAd(a, takma), takma, vurguEsle: {vezikul_evre: 'vezikul'},
    yer: {sirt_bolum: 'ust', dorsal: 'ust', karin_bolum: 'sag', ventral: 'sag', utrikul: 'sag', yarim_daire_kanallari: 'sag', cepler: 'sag', endolenfatik_kanal: 'sol', endolenfatik_kese: 'ust', sakkul: 'sag',
      koklea: 'sag', koklear_kanal: 'sag', vezikul: 'sag', plakod: 'sol', cukur: 'sol', ektoderm: 'ust', arka_beyin: 'sol', vezikul_evre: 'sol'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c);
      let s = '';
      if (ev) {   // üç evre: solda arka beyin (yarım daire), sağda yüzey ektoderm
        const evre = (y, tur, id, ad) => { let g = `<rect x="6" y="${y}" width="290" height="150" rx="14" fill="#FFFFFF" stroke="${R.cizgi}" stroke-width="${k.W2(1.6)}"/>`;
          g += P(['arka_beyin'], () => k.yol(`M20 ${y + 14} C 90 ${y + 24} 110 ${y + 124} 20 ${y + 136}`, '#EEF2F8', NV, 1.8));
          const ex = 250, kal = 14;
          if (tur === 0) g += P([id, 'ektoderm'], () => k.yol(`M${ex} ${y + 14} L${ex} ${y + 162}`, 'none', '#C9A08E', 4) + k.yol(`M${ex - kal} ${y + 64} C ${ex - kal - 6} ${y + 76} ${ex - kal - 6} ${y + 100} ${ex - kal} ${y + 112} L${ex} ${y + 112} L${ex} ${y + 64} Z`, '#F6D9C8', '#C9A08E', 2));
          if (tur === 1) g += P([id, 'ektoderm'], () => k.yol(`M${ex} ${y + 14} L${ex} ${y + 56} C ${ex - 50} ${y + 60} ${ex - 70} ${y + 88} ${ex - 50} ${y + 112} C ${ex - 40} ${y + 122} ${ex} ${y + 120} ${ex} ${y + 122} L${ex} ${y + 162}`, 'none', '#C9A08E', 4)
            + k.yol(`M${ex - 4} ${y + 60} C ${ex - 44} ${y + 66} ${ex - 60} ${y + 90} ${ex - 46} ${y + 108}`, 'none', '#F0C9B4', 8));
          if (tur === 2) g += k.yol(`M${ex} ${y + 14} L${ex} ${y + 162}`, 'none', '#C9A08E', 4) + P([id, 'vezikul_evre'], () => k.yol(gElips(ex - 90, y + 88, 36, 40), AR.sivi, '#C9A08E', 3));
          return g + c.yazi(150, y + 150 + c.fs(24), ad, {px: 18, fw: 800, ff: 'Outfit', renk: R.lacivert}); };
        s += evre(10, 0, 'plakod', L('1  otik plakod', '1  otic placode')) + evre(204, 1, 'cukur', L('2  otik çukur', '2  otic pit')) + evre(398, 2, 'vezikul', L('3  otik vezikül', '3  otic vesicle'));
        s += `<path d="M${OX - 18} 20 L${OX - 18} 580" stroke="${R.cizgi}" stroke-width="${k.W2(2)}"/>`;
      }
      const X = x => OX + x, p1 = v6Gor(c, ay.ayrim_cumle, .3, .8), p2 = v6Gor(c, ay.sirt_cumle, .6, 1.2), p3 = v6Gor(c, ay.kese_cumle, .9, 1.2), p4 = v6Gor(c, ay.karin_cumle, 1.2, 1.6), p5 = ay.kanal_cumle != null ? v6Gor(c, ay.kanal_cumle, 0, 1.4) : 0;
      // endolenfatik kanal ve kese (sırttan, medialde)
      if (p3 > 0) s += `<g opacity="${n1(p3)}">` + P(['endolenfatik_kanal'], () => k.boru(gYol([[X(250), 230], [X(190), 190], [X(150), 140], [X(130), 104]]), k.w(16), AR.sivi, NV, 2))
        + P(['endolenfatik_kese'], () => k.yol(gElips(X(116), 82, 40 * p3, 30 * p3), AR.sivi, NV, 2.2)) + '</g>';
      // yarım daire kanalı cepleri (sırttan çıkar); ortası kaybolunca kanal olur
      if (p2 > 0) { const cep = (cx, cy, rx, ry, rot) => `<g transform="rotate(${rot} ${cx} ${cy})">` + k.yol(gElips(cx, cy, rx * p2, ry * p2), AR.sivi, NV, 2.2)
          + (p5 > 0 ? k.yol(gElips(cx, cy, (rx - 16) * p2 * p5, (ry - 16) * p2 * p5), '#FFFFFF', NV, 2) : '') + '</g>';
        s += P(['yarim_daire_kanallari'], () => cep(X(330), 112, 86, 58, -8) + cep(X(470), 200, 56, 84, 12)); }
      // vezikül: sırt (utrikül) ve karın (sakkül) bölümleri
      s += P(['vezikul'], () => '') + P(['sirt_bolum', 'utrikul'], () => k.yol(gYol([[X(240), 210], [X(300), 186], [X(380), 196], [X(420), 240], [X(400), 290], [X(330), 304], [X(250), 290], [X(226), 250]], true, .4), '#CFE6FB', NV, 2.6));
      s += P(['karin_bolum', 'sakkul'], () => k.yol(gYol([[X(250), 304], [X(330), 306], [X(370), 340], [X(356), 400], [X(300), 420], [X(250), 400], [X(236), 350]], true, .4), '#D9ECFC', NV, 2.6));
      if (p1 > 0) s += `<g opacity="${n1(p1)}">` + k.yol(`M${X(200)} 302 L${X(450)} 302`, 'none', R.mavi, 2.2, `stroke-dasharray="${k.W2(8)} ${k.W2(6)}"`)
        + c.yazi(X(196), 292, L('sırt', 'dorsal'), {a: 'end', px: 17, fw: 800, renk: R.mavi}) + c.yazi(X(196), 326, L('karın', 'ventral'), {a: 'end', px: 17, fw: 800, renk: R.mavi}) + '</g>';
      // koklear kanal: karından uzar ve kıvrılır
      if (p4 > 0) { const n = Math.max(4, Math.round(60 * p4)), pts = [];
        for (let i = 0; i < n; i++) { const u = i / 59; if (u < .35) pts.push([X(320 + u / .35 * 90), 410 + u / .35 * 60]); else { const th = (u - .35) / .65 * 1.6 * 2 * Math.PI, r = 52 - 26 * (u - .35) / .65; pts.push([X(440 + r * Math.cos(Math.PI + th) + 52), 510 + r * Math.sin(Math.PI + th)]); } }
        s += P(['koklea'], () => k.boru(gYol(pts), k.w(18), AR.sivi, NV, 2)); }
      return s; }};
};

// ================================================================ larinks üstten (laringoskopik bakış; ön yukarıda): epiglot, ses telleri, glottis, aritenoidler; solunumda açık, fonasyonda kapanır ve titreşir.
// Sağda titreşim döngüsü (koronal): kapalı -> alttaki basınç aralar -> açık, hava atımı -> esneklik ve Bernoulli emmesiyle geri kapanır (alttan üste). Kaynak: Titze, Principles of Voice Production; van den Berg 1958.
// ayar: {kapanma_cumle (teller yaklaşır), titresim_cumle (titreşim ve döngü), bernoulli_cumle, f0_cumle (atım dizisi), dongu: true}
// parçalar: ses_telleri (= vokal_kordlar), glottis, aritenoidler (= aritenoid_kikirdaklar), epiglot, yalanci_teller, trakea, dongu (= titresim_dongusu), basinc (= subglottik_basinc), bernoulli, hava_atimi, temel_frekans
CIZ.larinks_ustten = (c, ay) => {
  const dg = ay.dongu !== false, W = dg ? 1000 : 420, C0 = [200, 230];
  const a = {ses_telleri: [C0[0] - 36, 220], vokal_kordlar: [C0[0] - 36, 220], glottis: [C0[0], 250], aritenoidler: [C0[0] + 70, 370], aritenoid_kikirdaklar: [C0[0] + 70, 370], epiglot: [C0[0], 50],
    yalanci_teller: [C0[0] + 92, 220], trakea: [C0[0], 300], dongu: [700, 60], titresim_dongusu: [700, 60], basinc: [530, 330], subglottik_basinc: [530, 330], bernoulli: [880, 230], hava_atimi: [690, 120], temel_frekans: [700, 470]};
  const takma = {vokal_kordlar: 'ses_telleri', aritenoid_kikirdaklar: 'aritenoidler', titresim_dongusu: 'dongu', subglottik_basinc: 'basinc', ventrikuler_teller: 'yalanci_teller'};
  if (!dg) ['dongu', 'titresim_dongusu', 'basinc', 'subglottik_basinc', 'bernoulli', 'hava_atimi', 'temel_frekans'].forEach(q => delete a[q]);
  return {w: W, h: 560, cm: 1.05, a: takmaAd(a, takma), takma,
    yer: {ses_telleri: 'sol', vokal_kordlar: 'sol', glottis: 'sol', aritenoidler: 'sol', aritenoid_kikirdaklar: 'sol', epiglot: 'ust', yalanci_teller: 'sag', trakea: 'alt', dongu: 'ust', titresim_dongusu: 'ust',
      basinc: 'alt', subglottik_basinc: 'alt', bernoulli: 'sag', hava_atimi: 'ust', temel_frekans: 'alt'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c), pk = ay.kapanma_cumle != null ? ilerle(c.t, c.cb(ay.kapanma_cumle) + .2, 1) : 0, tt = ay.titresim_cumle != null ? c.cb(ay.titresim_cumle) : null;
      const vib = tt != null && c.t > tt ? kis((c.t - tt) / .6) : 0, T = 1.6, ph = tt != null ? (((c.t - tt) / T) % 1 + 1) % 1 : 0;   // döngü evresi (yavaşlatılmış)
      const acik = ph < .2 ? 0 : ph < .5 ? (ph - .2) / .3 : ph < .7 ? 1 : ph < .95 ? 1 - (ph - .7) / .25 : 0;
      const g = 70 * (1 - pk) + vib * 16 * acik;   // arka uçların aralığı
      let s = '';
      // giriş halkası (ariepiglottik kıvrımlar) ve epiglot
      s += k.yol(gElips(C0[0], C0[1], 150, 190), '#F2C4C0', '#B9735E', 2.4);
      s += P(['epiglot'], () => k.yol(`M${C0[0] - 120} 70 C ${C0[0] - 90} 20 ${C0[0] + 90} 20 ${C0[0] + 120} 70 C ${C0[0] + 80} 56 ${C0[0] - 80} 56 ${C0[0] - 120} 70 Z`, '#F6D9D4', '#B9735E', 2.2));
      // glottis içi (karanlık) ve trakea halkaları
      const A = [C0[0], 96], PL = [C0[0] - g, 340], PR = [C0[0] + g, 340];
      s += P(['glottis'], () => k.yol(gPoly([A, PL, PR]), '#3B1F2A', null)) + (g > 20 ? `<g opacity="${n1(kis((g - 20) / 40))}">` + P(['trakea'], () => [0, 1, 2].map(i => k.yol(`M${C0[0] - g * (.5 - i * .1)} ${290 - i * 50} C ${C0[0] - 8} ${280 - i * 50} ${C0[0] + 8} ${280 - i * 50} ${C0[0] + g * (.5 - i * .1)} ${290 - i * 50}`, 'none', '#B98A92', 2)).join('')) + '</g>' : '');
      // yalancı teller (lateralde) ve ses telleri (beyaz bantlar)
      s += P(['yalanci_teller'], () => [-1, 1].map(m => k.yol(gPoly([[C0[0] + m * 16, 100], [C0[0] + m * (g + 70), 330], [C0[0] + m * (g + 98), 330], [C0[0] + m * 44, 100]]), '#E9A9A6', '#B9735E', 1.6)).join(''));
      s += P(['ses_telleri'], () => [-1, 1].map(m => k.yol(gPoly([[C0[0], 98], [C0[0] + m * g, 340], [C0[0] + m * (g + 28), 340], [C0[0] + m * 18, 98]]), '#F8F3EE', '#9C8A80', 2)).join(''));
      s += P(['aritenoidler'], () => [-1, 1].map(m => k.yol(gElips(C0[0] + m * (g + 30), 366, 34, 26), '#EBB8B0', '#B9735E', 2)).join(''));
      s += v6bRozet(c, k, C0[0], 520, pk < .5 ? L('solunum: açık', 'breathing: open') : vib > 0 ? L('fonasyon: titreşim', 'phonation: vibration') : L('fonasyon: kapalı', 'phonation: closed'), pk < .5 ? 'hasta' : 'ses_dalgasi', R.mavi, 15);
      s += c.yazi(24, 30, L('↑ ön', '↑ front'), {a: 'start', px: 14, fw: 700, renk: R.soluk});
      if (!dg) return s;
      // titreşim döngüsü: dört koronal kare
      s += `<path d="M430 20 L430 540" stroke="${R.cizgi}" stroke-width="${k.W2(2)}"/>`;
      const pd = tt != null ? kis((c.t - tt) / .6) : 0;
      if (pd <= 0) return s;
      const ADL = [L('kapalı', 'closed'), L('basınç aralar', 'pressure opens'), L('hava atımı', 'air puff'), L('geri kapanır', 'closes again')];
      const aktif = ph < .2 ? 0 : ph < .5 ? 1 : ph < .7 ? 2 : 3;
      let g2 = `<g opacity="${n1(pd)}">` + c.yazi(720, 34, L('titreşim döngüsü (önden kesit)', 'vibration cycle (front section)'), {px: 18, fw: 800, ff: 'Outfit', renk: R.lacivert});
      const kare = (i, x) => { const y = 70, ak = i === aktif, cx = x + 65;
        // iki ses teli: alt ve üst kenar ayrı açılır (i=1 alt açık, i=2 tümü açık, i=3 alt kapalı üst açık)
        const alt = [0, 14, 22, 0][i], ust = [0, 0, 22, 12][i];
        let q = `<rect x="${x}" y="${y}" width="130" height="200" rx="12" fill="${ak ? V6.acikMavi : '#FFFFFF'}" stroke="${ak ? R.mavi : R.cizgi}" stroke-width="${k.W2(ak ? 2.6 : 1.6)}"/>`;
        [-1, 1].forEach(m => q += k.yol(gYol([[cx + m * 60, y + 60], [cx + m * (ust + 4), y + 96], [cx + m * (alt + 4), y + 130], [cx + m * 60, y + 160]], false, .45) + ` L${cx + m * 64} ${y + 160} L${cx + m * 64} ${y + 60} Z`, '#F8F3EE', '#9C8A80', 2));
        if (i <= 1) q += P(['basinc'], () => [-14, 0, 14].map(d => v6Ok(k, cx + d, y + 192, cx + d, y + 150 + (i ? -6 : 6), R.mavi, 2.2, false, 8)).join(''));
        if (i === 2) q += P(['hava_atimi'], () => v6Ok(k, cx, y + 160, cx, y + 26, R.mavi, 3.4, false, 11));
        if (i === 3) q += P(['bernoulli'], () => v6Ok(k, cx - 40, y + 140, cx - 10, y + 128, '#E39A10', 2.6, false, 9) + v6Ok(k, cx + 40, y + 140, cx + 10, y + 128, '#E39A10', 2.6, false, 9));
        return q + v6Yazi(c, cx, y + 230, ADL[i], 140, {px: 15, fw: ak ? 800 : 600, renk: ak ? R.lacivert : R.soluk}); };
      g2 += P(['dongu'], () => [0, 1, 2, 3].map(i => kare(i, 450 + i * 138)).join('') + [0, 1, 2].map(i => v6Ok(k, 581 + i * 138, 170, 587 + i * 138, 170, R.soluk, 2, false, 7)).join(''));
      if (ay.bernoulli_cumle != null) { const pb = v6Gor(c, ay.bernoulli_cumle, 0, .6); if (pb > 0) g2 += `<g opacity="${n1(pb)}">` + c.yazi(929, 330, L('esneklik + Bernoulli', 'elasticity + Bernoulli'), {a: 'end', px: 15, fw: 800, renk: '#B9822A'}) + '</g>'; }
      // atım dizisi (temel frekans)
      if (ay.f0_cumle != null) { const pf = v6Gor(c, ay.f0_cumle, 0, .8);
        if (pf > 0) { let d = 'M460 470'; for (let i = 0; i < 6; i++) { const x0 = 460 + i * 78; d += ` L${x0 + 20} 470 C ${x0 + 34} 470 ${x0 + 40} 410 ${x0 + 52} 410 C ${x0 + 62} 410 ${x0 + 64} 470 ${x0 + 72} 470 L${x0 + 78} 470`; }
          g2 += `<g opacity="${n1(pf)}">` + P(['temel_frekans'], () => `<path d="${d}" fill="none" stroke="${R.mavi}" stroke-width="${k.W2(3)}"/>` + v6Ok(k, 492, 500, 570, 500, R.soluk, 2, true, 8)
            + c.yazi(531, 528, L('1 döngü = 1/F0', '1 cycle = 1/F0'), {px: 15, fw: 800, renk: R.soluk})) + '</g>'; } }
      return s + g2 + '</g>'; }};
};

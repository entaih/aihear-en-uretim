// AIHEAR Akademi: ek anatomi çizimleri (2.11.2026). sahne.js ve cizim_grafik.js'ten SONRA yüklenir.
// Kural (KRITIK_NOTLAR 8): bir yapı bir kez çizilir. Var olan çizimler DEĞİŞMEDİ; yalnız yeni çizim adları eklendi ve bazı çizimlere
// isteğe bağlı ayar / parça eklendi (ayar verilmezse çizim birebir eskisi gibidir). Renk ve çizgi dili ana setle aynı (AR, NV, kalem()).
// Referanslar: 12_Cizim_Taslaklari/NOTLAR.md ("Ek çizimler" bölümü).
const anP = c => (id, fn) => c.P(id, v => boya(fn(v), v));
const anJel = '#FFF0D2', anJelC = '#E2C48C', anTur = '#E39A10';

// ---------------------------------------------------------------- ortak: tüy demeti (stereosiller merdiven dizilimli, isteğe bağlı kinosilyum)
// (x, y): demetin taban ortası; o: {n, ara, w, hmin, hmax, yon (1: uzun kenar sağda), egim (radyan, + sağa), kino (kinosilyum), bag (uç bağlantıları), kanal}
function tuyDemeti(k, x, y, o = {}) {
  const n = o.n || 6, ara = o.ara || 8, w = o.w || 4.5, hmin = o.hmin || 22, hmax = o.hmax || 58, yon = o.yon || 1, eg = o.egim || 0;
  const sx = Math.sin(eg), cy = Math.cos(eg), out = {stereo: '', bag: '', kanal: '', kino: '', uclar: []};
  const xs = Array.from({length: n}, (_, i) => x + (i - (n - 1) / 2) * ara * yon), hs = Array.from({length: n}, (_, i) => hmin + (hmax - hmin) * (n > 1 ? i / (n - 1) : 1));
  const uc = (i, h) => [xs[i] + h * sx, y - h * cy];
  xs.forEach((xi, i) => { const [tx, ty] = uc(i, hs[i]); out.uclar.push([tx, ty]);
    out.stereo += k.boru(`M${n1(xi)} ${n1(y)} L${n1(tx)} ${n1(ty)}`, w, '#FFFFFF', NV, o.cz || 1.4); });
  if (o.bag) for (let i = 0; i < n - 1; i++) { const [ax, ay] = uc(i, hs[i]), [bx, by] = uc(i + 1, Math.min(hs[i] + (o.bagYuk || 7), hs[i + 1]));
    out.bag += `<path d="M${n1(ax)} ${n1(ay)} L${n1(bx - yon * w * .45 * cy)} ${n1(by)}" stroke="${anTur}" stroke-width="${k.W2(o.bagK || 1.6)}" fill="none" stroke-linecap="round"/>`;
    if (o.kanal) out.kanal += `<circle cx="${n1(ax)}" cy="${n1(ay)}" r="${n1(w * .42)}" fill="${R.mavi}" stroke="${NV}" stroke-width="${k.W2(1)}"/>`; }
  if (o.kino) { const kx = xs[n - 1] + ara * yon, h = hmax * (o.kinoOran || 1.32), tx = kx + h * sx, ty = y - h * cy;
    out.kino = k.boru(`M${n1(kx)} ${n1(y)} L${n1(tx)} ${n1(ty)}`, w * 1.05, '#E3ECF8', NV, o.cz || 1.4) + `<circle cx="${n1(tx)}" cy="${n1(ty)}" r="${n1(w * .95)}" fill="#E3ECF8" stroke="${NV}" stroke-width="${k.W2(1.3)}"/>`; }
  return out;
}

// ---------------------------------------------------------------- otoskopik timpanik membran (sağ kulak, spekulumdan bakış; Gray 1918 Fig. 909)
// Sağ kulakta ön taraf görüntünün SAĞINDA: manubrium umbodan yukarı ve öne, ışık üçgeni ön alt kadranda (saat 5). ayar.kulak "sol" ise ayna.
// ayar.patoloji (v5, isteğe bağlı): otoskopik patoloji görünümleri (OTO_PAT_TURLER; ayrıntı: otoPatAgirlik). Verilmezse çizim birebir eskisi gibidir.
CIZ.kulak_zari_otoskopik = (c, ay) => {
  const C = [350, 318], rx = 205, ry = 228, sol = ay.kulak === 'sol', E = (a, f = 1) => [C[0] + rx * f * Math.cos(a * Math.PI / 180), C[1] + ry * f * Math.sin(a * Math.PI / 180)];
  const LP0 = [C[0] + 38, C[1] - 156], U0 = [C[0] + 6, C[1] + 22];
  const dx = U0[0] - LP0[0], dy = U0[1] - LP0[1], dl = Math.hypot(dx, dy), d = [dx / dl, dy / dl], nn = [-d[1], d[0]], n = nn[0] > 0 ? nn : [-nn[0], -nn[1]];   // n: öne
  const kad = (sd, sn) => [U0[0] + 120 * (sd * d[0] + sn * n[0]) / 1.2, U0[1] + 120 * (sd * d[1] + sn * n[1]) / 1.2];
  // patoloji ağırlıkları (0..1, cümleye göre); retraksiyonda manubrium kısalır (umbo kısa çıkıntıya yaklaşır), kısa çıkıntı belirginleşir
  const PW = otoPatAgirlik(c, ay), pw = t => PW ? PW[t] || 0 : 0, rw = pw('retraksiyon');
  const LP = LP0, U = rw ? [U0[0] + (LP0[0] - U0[0]) * .38 * rw, U0[1] + (LP0[1] - U0[1]) * .38 * rw] : U0;
  const ayna = p => sol ? [2 * C[0] - p[0], p[1]] : p;
  const A0 = {pars_tensa: [C[0] - 120, C[1] + 92], pars_flaccida: [C[0] + 20, C[1] - 196], umbo: U, manubrium: [(LP[0] * .45 + U[0] * .55), (LP[1] * .45 + U[1] * .55)],
    processus_lateralis: LP, isik_ucgeni: E(60, .62), anulus: E(150, .985), malleol_kivrimlar: [C[0] - 34, C[1] - 178], incus_uzun_kol: [C[0] - 74, C[1] - 70],
    on_ust_kadran: kad(-1, 1), on_alt_kadran: kad(1, 1), arka_ust_kadran: kad(-1, -1), arka_alt_kadran: kad(1, -1), timpanik_membran: [C[0] - 140, C[1] - 30]};
  if (PW) Object.assign(A0, otoPatNokta(PW, E, kad, C));
  const a = {}; for (const kk in A0) a[kk] = ayna(A0[kk]);
  const takma = {malleus_sapi: 'manubrium', malleus: 'manubrium', manubrium_mallei: 'manubrium', yan_cikinti: 'processus_lateralis', kisa_cikinti: 'processus_lateralis',
    isik_konisi: 'isik_ucgeni', isik_refleksi: 'isik_ucgeni', annulus: 'anulus', zar_halkasi: 'anulus', gevsek_bolum: 'pars_flaccida', gergin_bolum: 'pars_tensa', kulak_zari: 'timpanik_membran'};
  if (PW) Object.assign(takma, OTO_PAT_TAKMA);
  return {w: 700, h: 640, a: takmaAd(a, takma), takma, cm: 1.1, ...(PW ? {yer: otoPatYer(sol)} : {}),
    svg: () => {
      const k = kalem(c, 1), P = anP(c), el = (f, n2 = 72) => Array.from({length: n2}, (_, i) => E(i / n2 * 360, f));
      const kadVar = ay.kadranlar || ['on_ust_kadran', 'on_alt_kadran', 'arka_ust_kadran', 'arka_alt_kadran'].some(q => c.v[q] || c.etiketli.has(q));
      const ctx = PW ? {c, k, P, E, el, C, LP, U, LP0, U0, d, n, kad, ay, pw, rw} : null;
      let g = '';
      // kulak yolu derisi (spekulum alanı)
      g += k.yol(gYol(el(1.2), true, .3), '#EEE6E2', NV, 2.4);
      // zar: pars tensa (inci grisi), pars flaccida (üstte, kıvrımlar arasında)
      const bas = -124, son = -58, fl = [E(bas)].concat(Array.from({length: 14}, (_, i) => E(bas + (son - bas) * i / 13, .995)), [E(son), [LP[0] + 18, LP[1] - 2], [LP[0] - 14, LP[1] - 4]]);
      g += P(['pars_tensa', 'timpanik_membran'], () => k.yol(gYol(el(1), true, .3), '#E2E8F1', NV, 2.6)
        + `<path d="${gYol(el(.6), true, .3)}" fill="#D9E1EC" opacity=".55"/>`);
      g += P(['pars_flaccida', 'timpanik_membran'], () => k.yol(gYol(fl, true, .25), '#F0E2DE', '#B48E86', 1.6));
      if (PW) g += otoPatZarArkasi(ctx);   // zarın arkası ve içi: hemotimpanum, efüzyon, doğumsal kolesteatom, miringoskleroz, retraksiyon gölgesi
      // kadranlar (isteğe bağlı): ince kesik çizgiler, vurguda bölge dolar
      const kid = uid('tm');
      g += `<defs><clipPath id="${kid}"><path d="${gYol(el(.97), true, .3)}"/></clipPath></defs>`;
      const kadranP = (id, sd, sn) => c.P(id, v => v < .01 ? '' : `<path clip-path="url(#${kid})" d="${gPoly([U0, [U0[0] + 400 * sd * d[0], U0[1] + 400 * sd * d[1]], [U0[0] + 400 * (sd * d[0] + sn * n[0]), U0[1] + 400 * (sd * d[1] + sn * n[1])], [U0[0] + 400 * sn * n[0], U0[1] + 400 * sn * n[1]]])}" fill="${R.mavi}" fill-opacity="${n1(.22 * v)}"/>`);
      g += kadranP('on_ust_kadran', -1, 1) + kadranP('on_alt_kadran', 1, 1) + kadranP('arka_ust_kadran', -1, -1) + kadranP('arka_alt_kadran', 1, -1);
      if (kadVar) g += `<g clip-path="url(#${kid})" stroke="${R.soluk}" stroke-width="${k.W2(2)}" stroke-dasharray="${k.W2(8)} ${k.W2(7)}" fill="none" opacity="${n1(ilerle(c.t, ekBas(c, ay.kadran_cumle, .4), .6))}">`
        + `<path d="M${n1(U0[0] - 400 * d[0])} ${n1(U0[1] - 400 * d[1])} L${n1(U0[0] + 400 * d[0])} ${n1(U0[1] + 400 * d[1])}"/><path d="M${n1(U0[0] - 400 * n[0])} ${n1(U0[1] - 400 * n[1])} L${n1(U0[0] + 400 * n[0])} ${n1(U0[1] + 400 * n[1])}"/></g>`;
      // incus uzun kolu (zarın arkasından soluk seçilir, arka üst kadran)
      g += P('incus_uzun_kol', () => k.yol(gYol([[C[0] - 84, C[1] - 132], [C[0] - 78, C[1] - 92], [C[0] - 68, C[1] - 46]]), 'none', '#B5C3D5', 9, 'stroke-opacity=".7"'));
      // anulus (pars flaccida hizasında yok: Rivinus çentiği)
      const an = Array.from({length: 60}, (_, i) => E(son + (360 + bas - son) * i / 59, .975));
      g += P(['anulus'], () => k.yol(gYol(an), 'none', '#C3CEDD', 13) + k.yol(gYol(an), 'none', '#AEBBCD', 1.4));
      // malleol kıvrımlar (ön ve arka); retraksiyonda orak biçimli ve belirgin
      const kv = rw ? karis('#A98F88', '#7E6058', rw) : '#A98F88', kk2 = 2.2 + 1.6 * rw;
      g += P(['malleol_kivrimlar', 'pars_flaccida'], () => k.yol(`M${n1(LP[0] - 6)} ${n1(LP[1] + 2)} Q ${n1(LP[0] - 80)} ${n1(LP[1] - 8 + 14 * rw)} ${n1(E(bas)[0])} ${n1(E(bas)[1])}`, 'none', kv, kk2)
        + k.yol(`M${n1(LP[0] + 8)} ${n1(LP[1] + 2)} Q ${n1(LP[0] + 50)} ${n1(LP[1] - 6 + 12 * rw)} ${n1(E(son)[0])} ${n1(E(son)[1])}`, 'none', kv, kk2));
      if (PW) g += otoPatDelikler(ctx);   // perforasyonlar ve atik cebi (delikten orta kulak görünür)
      // manubrium (zarın içinden beyazımsı şerit), yan çıkıntı, umbo
      const [Lf, Rt] = gBoru(gCatmull([LP, [(LP[0] + U[0]) / 2 + 2, (LP[1] + U[1]) / 2], U], 8), [17, 13, 9]);
      g += P(['manubrium'], () => k.yol(gYol(kapat(Lf, Rt), true, .3), '#F7F2E6', '#B9A47E', 1.8));
      if (rw) g += `<path d="${gElips(LP[0] + 3, LP[1] + 9, 19 * rw + 13, 12 * rw + 9)}" fill="#8E7F86" opacity="${n1(.35 * rw)}"/>`;
      g += P(['processus_lateralis'], () => k.yol(gElips(LP[0], LP[1], 13 + 5 * rw, 11 + 4 * rw), '#FFFFFF', '#B9A47E', 2 + .6 * rw));
      g += P(['umbo'], () => k.yol(gElips(U[0], U[1], 11, 9), '#C2CCDA', '#8E9CB3', 1.6));
      // ışık üçgeni (ön alt kadran, saat 5); retraksiyon, efüzyon ve perforasyonda söner
      const iu = [[U[0] + 14, U[1] + 16], E(50, .93), E(70, .93)], ik = PW ? otoPatIsik(pw) : 1;
      g += P(['isik_ucgeni'], () => `<path d="${gYol(iu, true, .12)}" fill="#FFFFFF" fill-opacity="${ik === 1 ? '.92' : n1(.92 * ik)}" stroke="#FFFFFF" stroke-width="${k.W2(1)}"${ik === 1 ? '' : ` stroke-opacity="${n1(ik)}"`}/>`);
      if (PW) g += otoPatOnde(ctx);   // önde kalanlar: ventilasyon tüpü, ekzostoz ve osteom (kanal duvarı)
      let s = sol ? `<g transform="matrix(-1 0 0 1 ${2 * C[0]} 0)">${g}</g>` : g;
      if (ay.yonler !== false) { const on = sol ? 40 : 660, ar = sol ? 660 : 40;
        s += c.yazi(on, C[1] + c.fs(7), L('ÖN', 'ANT'), {px: 18, fw: 800, renk: R.soluk}) + c.yazi(ar, C[1] + c.fs(7), L('ARKA', 'POST'), {px: 18, fw: 800, renk: R.soluk})
          + c.yazi(sol ? 660 : 40, 34, sol ? L('Sol kulak', 'Left ear') : L('Sağ kulak', 'Right ear'), {a: sol ? 'end' : 'start', px: 19, fw: 700, renk: sol ? R.sol_kulak : R.sag_kulak}); }
      return s; }};
};

// ---------------------------------------------------------------- otoskopik patolojiler (2.11.2026, v5)
// ayar.patoloji: "ad" | {"tur": "ad", "cumle": 2, "bitis": 5, "kalici": false, "sure": 1} | [ {...}, {...} ] (liste: her biri kendi cümlesinde gelir,
// sonraki gelince söner; "kalici": true olan kalır, "bitis" verilirse o cümlede söner). Cümle verilmezse sahne başında (ya da ayar.patoloji_cumle'de) gelir.
// Türler: perforasyon_santral, perforasyon_marjinal, perforasyon_atik, perforasyon_total, atik_cebi, kolesteatom_dogumsal, hemotimpanum,
// retraksiyon, efuzyon (ayar.seviye, ayar.kabarcik: false ile kapatılır), miringoskleroz, tup, ekzostoz, osteom.
// Referanslar: 12_Cizim_Taslaklari/NOTLAR.md "Ek çizimler" (v5 satırları).
const OTO_PAT_TURLER = ['perforasyon_santral', 'perforasyon_marjinal', 'perforasyon_atik', 'perforasyon_total', 'atik_cebi', 'kolesteatom_dogumsal', 'hemotimpanum',
  'retraksiyon', 'efuzyon', 'miringoskleroz', 'tup', 'ekzostoz', 'osteom'];
const OTO_PAT_AD = {santral: 'perforasyon_santral', marjinal: 'perforasyon_marjinal', atik: 'perforasyon_atik', total: 'perforasyon_total', subtotal: 'perforasyon_total',
  santral_perforasyon: 'perforasyon_santral', marjinal_perforasyon: 'perforasyon_marjinal', atik_perforasyon: 'perforasyon_atik', total_perforasyon: 'perforasyon_total',
  dogumsal_kolesteatom: 'kolesteatom_dogumsal', retraksiyon_cebi: 'atik_cebi', hemotympanum: 'hemotimpanum', efuzyon_seviye: 'efuzyon', sivi: 'efuzyon',
  timpanoskleroz: 'miringoskleroz', ventilasyon_tupu: 'tup', grommet: 'tup', retrakte: 'retraksiyon', ekzostozlar: 'ekzostoz', osteoma: 'osteom'};
const OTO_PAT_TAKMA = {delik: 'perforasyon', santral_perforasyon: 'perforasyon_santral', marjinal_perforasyon: 'perforasyon_marjinal', atik_perforasyon: 'perforasyon_atik',
  total_perforasyon: 'perforasyon_total', dogumsal_kolesteatom: 'kolesteatom', beyaz_kitle: 'kolesteatom', kan: 'hemotimpanum', hemotympanum: 'hemotimpanum',
  sivi: 'efuzyon', sivi_seviyesi: 'hava_sivi_seviyesi', hava_kabarciklari: 'kabarciklar', kabarcik: 'kabarciklar', plak: 'miringoskleroz', timpanoskleroz: 'miringoskleroz',
  ventilasyon_tupu: 'tup', grommet: 'tup', retraksiyon_cebi: 'atik_cebi', retrakte_zar: 'retraksiyon', ekzostozlar: 'ekzostoz', orta_kulak_mukozasi: 'orta_kulak',
  promontory: 'promontorium', yuvarlak_pencere_nisi: 'yuvarlak_pencere', ostaki_agzi: 'ostaki_borusu', malleus_boynu: 'atik_cebi'};
function otoPatAgirlik(c, ay) {
  const p = ay.patoloji; if (!p) return null;
  const Lst = (Array.isArray(p) ? p : [p]).map(x => typeof x === 'string' ? {tur: x} : x).filter(x => x && x.tur);
  if (!Lst.length) return null;
  const w = {};
  Lst.forEach((x, i) => {
    const tur = OTO_PAT_AD[x.tur] || x.tur, cm = x.cumle != null ? x.cumle : (i === 0 ? ay.patoloji_cumle : null);
    let v = ilerle(c.t, ekBas(c, cm, -5), x.sure || 1);
    const sn = Lst[i + 1];
    if (x.bitis != null) v *= 1 - ilerle(c.t, c.cb(x.bitis), .8);
    else if (sn && !x.kalici && sn.cumle != null) v *= 1 - ilerle(c.t, c.cb(sn.cumle), .8);
    w[tur] = Math.max(w[tur] || 0, v);
  });
  w._liste = Lst.map(x => OTO_PAT_AD[x.tur] || x.tur);
  return w;
}
// ışık üçgeninin kalan oranı
const otoPatIsik = pw => kis(1 - Math.max(pw('retraksiyon'), .9 * pw('efuzyon'), .55 * pw('hemotimpanum'), pw('perforasyon_santral'), pw('perforasyon_total'), .4 * pw('tup'), .5 * pw('miringoskleroz')));
// perforasyon biçimleri (çizim koordinatı, sağ kulak)
function otoPatDelik(tur, E, U) {
  const r = ekRast(tur.length * 7 + 3);
  if (tur === 'perforasyon_santral') { const m = [402, 424]; return Array.from({length: 30}, (_, i) => { const t = i / 30 * 2 * Math.PI, q = 1 + .05 * Math.sin(3 * t + 1) + .03 * (r() - .5);
    return [m[0] + 70 * q * Math.cos(t) - 10 * Math.sin(t) * Math.cos(t), m[1] + 60 * q * Math.sin(t)]; }); }
  if (tur === 'perforasyon_marjinal') { const dis = Array.from({length: 18}, (_, i) => E(176 + 56 * i / 17, .985));   // arka üst, anulusa dayanır (arka malleol kıvrımın altında)
    return dis.concat([[U[0] - 96, U[1] - 196], [U[0] - 62, U[1] - 172], [U[0] - 56, U[1] - 112], [U[0] - 66, U[1] - 52], [U[0] - 92, U[1] - 10], E(172, .62)]); }
  if (tur === 'perforasyon_atik') return Array.from({length: 22}, (_, i) => { const t = i / 22 * 2 * Math.PI; return [372 + 27 * Math.cos(t), 128 + 15 * Math.sin(t) + 2 * Math.sin(2 * t)]; });
  if (tur === 'perforasyon_total') return Array.from({length: 60}, (_, i) => E(-50 + 280 * i / 59, .86 + .015 * Math.sin(i * 1.7)))   // ince kenar kalır, pars flaccida sağlam
    .concat([[U[0] - 110, U[1] - 160], [U[0] - 40, U[1] - 166], [U[0] + 20, U[1] - 164], [U[0] + 70, U[1] - 158]]);
  if (tur === 'atik_cebi') return Array.from({length: 22}, (_, i) => { const t = i / 22 * 2 * Math.PI; return [374 + 33 * Math.cos(t), 134 + 18 * Math.sin(t) - 4 * Math.cos(2 * t)]; });
  return null;
}
function otoPatNokta(PW, E, kad, C) {
  const U = [C[0] + 6, C[1] + 22], o = {}, var_ = t => PW[t] != null;
  const delikler = ['perforasyon_santral', 'perforasyon_marjinal', 'perforasyon_atik', 'perforasyon_total'].filter(var_);
  const merkez = {perforasyon_santral: [402, 424], perforasyon_marjinal: [214, 236], perforasyon_atik: [372, 128], perforasyon_total: [C[0] - 120, C[1] + 70]};
  delikler.forEach(t => o[t] = merkez[t]);
  if (delikler.length) { o.perforasyon = merkez[delikler[0]]; o.orta_kulak = delikler.includes('perforasyon_total') ? [C[0] - 40, C[1] + 120] : [merkez[delikler[0]][0] - 10, merkez[delikler[0]][1] + 12];
    o.promontorium = delikler.includes('perforasyon_total') ? [C[0] - 70, C[1] + 60] : [410, 434];
    if (delikler.includes('perforasyon_total')) Object.assign(o, {yuvarlak_pencere: [C[0] - 130, C[1] + 118], stapes: [246, 280], kemikcikler: [268, 200], ostaki_borusu: [C[0] + 142, C[1] - 70]});
    if (delikler.includes('perforasyon_marjinal')) Object.assign(o, {stapes: [246, 280], kemikcikler: [268, 200]}); }
  if (var_('atik_cebi')) o.atik_cebi = [374, 134];
  if (var_('kolesteatom_dogumsal')) o.kolesteatom = [470, 250];
  if (var_('hemotimpanum')) o.hemotimpanum = [C[0] - 96, C[1] + 70];
  if (var_('retraksiyon')) o.retraksiyon = [C[0] - 118, C[1] - 40];
  if (var_('efuzyon')) Object.assign(o, {efuzyon: [C[0] - 110, C[1] + 120], hava_sivi_seviyesi: [C[0] - 150, C[1] + 6], kabarciklar: [C[0] + 96, C[1] + 70]});
  if (var_('miringoskleroz')) o.miringoskleroz = E(140, .66);
  if (var_('tup')) Object.assign(o, {tup: [432, 448], tup_lumeni: [432, 448]});
  if (var_('ekzostoz')) o.ekzostoz = E(170, 1.04);
  if (var_('osteom')) o.osteom = E(228, .92);
  return o;
}
function otoPatYer(sol) {
  const y = {perforasyon_marjinal: 'sol', stapes: 'sol', kemikcikler: 'sol', perforasyon_atik: 'ust', atik_cebi: 'ust', kolesteatom: 'sag', hemotimpanum: 'sol', retraksiyon: 'sol',
    efuzyon: 'sol', hava_sivi_seviyesi: 'sol', kabarciklar: 'sag', miringoskleroz: 'sol', tup: 'sag', tup_lumeni: 'sag', ekzostoz: 'sol', osteom: 'sol',
    perforasyon_santral: 'sag', promontorium: 'sag', orta_kulak: 'sag', yuvarlak_pencere: 'sol', ostaki_borusu: 'sag', perforasyon_total: 'sol', perforasyon: 'sag'};
  if (sol) for (const q in y) if (y[q] === 'sol') y[q] = 'sag'; else if (y[q] === 'sag') y[q] = 'sol';
  return y;
}
// zarın arkası (zar sağlam): hemotimpanum, efüzyon, doğumsal kolesteatom; zarın içinde: miringoskleroz; retraksiyon gölgesi
function otoPatZarArkasi(x) {
  const {c, k, P, E, el, C, pw, rw} = x, cid = uid('pt');
  let g = `<defs><clipPath id="${cid}"><path d="${gYol(el(.985), true, .3)}"/></clipPath></defs><g clip-path="url(#${cid})">`;
  const h = pw('hemotimpanum');
  if (h > .002) g += `<g opacity="${n1(h)}">` + P(['hemotimpanum'], () => `<defs><radialGradient id="${c.gid}hm" cx=".46" cy=".52" r=".62"><stop offset="0" stop-color="#7A4E86"/><stop offset=".65" stop-color="#5A3A72"/><stop offset="1" stop-color="#3C2752"/></radialGradient></defs>`
    + `<path d="${gYol(el(1), true, .3)}" fill="url(#${c.gid}hm)" opacity=".86"/><path d="${gYol(el(.55), true, .3)}" fill="#8A6A9C" opacity=".22"/>`) + '</g>';
  const e = pw('efuzyon');
  if (e > .002) { const sy = C[1] + 6, dalga = Array.from({length: 25}, (_, i) => { const xx = C[0] - 230 + 460 * i / 24; return [xx, sy + 10 * Math.pow((xx - C[0]) / 230, 2) - 4]; });
    const alt = dalga.concat([[C[0] + 240, C[1] + 260], [C[0] - 240, C[1] + 260]]);
    g += `<g opacity="${n1(e)}">` + `<path d="${gYol(el(1), true, .3)}" fill="#E9D9B0" opacity=".28"/>`
      + P(['efuzyon'], () => `<path d="${gPoly(alt)}" fill="#E2B866" opacity=".5"/>`);
    if (x.ay.seviye !== false) g += P(['hava_sivi_seviyesi', 'efuzyon'], () => k.yol(gYol(dalga), 'none', '#8C6A2E', 2.6) + k.yol(gYol(dalga.map(p => [p[0], p[1] - 4])), 'none', '#FFF8E6', 2, 'stroke-opacity=".8"'));
    if (x.ay.kabarcik !== false) g += P(['kabarciklar', 'efuzyon'], () => [[C[0] + 96, C[1] + 66, 15], [C[0] + 128, C[1] + 92, 11], [C[0] + 70, C[1] + 104, 12], [C[0] + 112, C[1] + 130, 8], [C[0] + 58, C[1] + 60, 8], [C[0] - 150, C[1] + 150, 10], [C[0] - 122, C[1] + 176, 7]]
      .map(([bx, by, br]) => k.yol(gElips(bx, by, br, br), '#F3E2B8', '#8C6A2E', 1.8) + `<path d="M${n1(bx - br * .5)} ${n1(by - br * .25)} q ${n1(br * .25)} ${n1(-br * .4)} ${n1(br * .6)} ${n1(-br * .4)}" fill="none" stroke="#FFFFFF" stroke-width="${k.W2(2)}" stroke-linecap="round"/>`).join(''));
    g += '</g>'; }
  const kd = pw('kolesteatom_dogumsal');
  if (kd > .002) { const m = [468, 250], rr = 52 * (.6 + .4 * kd);
    g += `<g opacity="${n1(kd)}">` + P(['kolesteatom'], () => `<defs><radialGradient id="${c.gid}kd" cx=".4" cy=".36" r=".7"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#F7F4EC"/><stop offset="1" stop-color="#E6DFD0"/></radialGradient></defs>`
      + `<path d="${gElips(m[0], m[1], rr * 1.08, rr)}" fill="url(#${c.gid}kd)" stroke="#BDB09A" stroke-width="${k.W2(2)}"/>`)
      + `<path d="${gElips(m[0], m[1], rr * 1.08, rr)}" fill="#E2E8F1" opacity=".16"/></g>`; }   // zarın arkasında: üstünden zar tülü
  const ms = pw('miringoskleroz');
  if (ms > .002) { const r = ekRast(11), ic = [], dis = [];
    for (let i = 0; i <= 26; i++) { const a = -28 + 236 * i / 26, j = .025 * Math.sin(i * 2.3) + .02 * (r() - .5); ic.push(E(a, .56 + j)); dis.push(E(a, .78 - .03 * Math.sin(i * 1.3) + .02 * (r() - .5))); }
    g += `<g opacity="${n1(ms)}">` + P(['miringoskleroz'], () => k.yol(gYol(dis.concat(ic.slice().reverse()), true, .35), '#FBF9F2', '#D6CDB8', 1.6)
      + k.yol(gElips(E(-62, .5)[0] + 16, E(-62, .5)[1] + 30, 22, 14), '#FBF9F2', '#D6CDB8', 1.4)) + '</g>'; }
  if (rw > .002) g += `<path d="${gYol(el(.9), true, .3)}" fill="none" stroke="#B9C3D2" stroke-width="${k.W2(22)}" opacity="${n1(.45 * rw)}"/>`
    + `<g opacity="${n1(.8 * rw)}">` + k.yol(gYol([[C[0] - 84, C[1] - 132], [C[0] - 78, C[1] - 92], [C[0] - 68, C[1] - 46]]), 'none', '#A9B7CB', 10)
    + k.yol(gYol([[C[0] - 70, C[1] - 52], [C[0] - 104, C[1] - 46], [C[0] - 132, C[1] - 44]]), 'none', '#B5C1D3', 6) + '</g>';
  return g + '</g>';
}
// perforasyonlar: delikten orta kulak mukozası, promontorium; marjinal ve totalde kemikçikler; atik cebi
function otoPatDelikler(x) {
  const {c, k, P, E, C, U, pw} = x;
  let g = '';
  ['perforasyon_total', 'perforasyon_santral', 'perforasyon_marjinal', 'perforasyon_atik', 'atik_cebi'].forEach(t => {
    const w = pw(t); if (w <= .002) return;
    const pts = otoPatDelik(t, E, [C[0] + 6, C[1] + 22]), yol = gYol(pts, true, .4), cid = uid('pd'), atik = t === 'perforasyon_atik' || t === 'atik_cebi';
    g += `<g opacity="${n1(w)}"><defs><clipPath id="${cid}"><path d="${yol}"/></clipPath></defs>`;
    g += P([t, 'perforasyon'], () => {
      let s = k.yol(yol, atik ? (t === 'atik_cebi' ? '#9C6E66' : '#5C3330') : '#E3A098', null);
      s += `<g clip-path="url(#${cid})">`;
      if (atik) s += t === 'atik_cebi' ? `<path d="${gElips(380, 128, 22, 11)}" fill="#6A4440"/><path d="M366 140 C 374 128 386 124 396 130" fill="none" stroke="#E8D8CC" stroke-width="${k.W2(5)}" stroke-linecap="round"/>`
        : `<path d="${gElips(374, 132, 16, 8)}" fill="#2E1716"/>`;
      else {
        // promontorium (orta kulağın iç duvarı, açık pembe kabarıklık) ve gölge (deliğin üst kenarı)
        const pr = t === 'perforasyon_total' ? [C[0] - 60, C[1] + 60, 120, 104] : t === 'perforasyon_santral' ? [392, 432, 58, 44] : [236, 304, 60, 34];
        s += P(['promontorium'], () => `<path d="${gElips(pr[0], pr[1], pr[2], pr[3])}" fill="#F0BDB4"/>` + `<path d="${gElips(pr[0] - pr[2] * .2, pr[1] - pr[3] * .3, pr[2] * .45, pr[3] * .35)}" fill="#F8D6CF"/>`);
        s += `<path d="${yol}" fill="none" stroke="#B8615C" stroke-width="${k.W2(16)}" opacity=".45"/>`;
        if (t === 'perforasyon_total') {
          s += P(['yuvarlak_pencere'], () => k.yol(gElips(C[0] - 130, C[1] + 118, 22, 18), '#5A2C2C', '#9E5550', 1.6));
          s += P(['ostaki_borusu'], () => k.yol(gElips(C[0] + 142, C[1] - 70, 26, 34), '#6E3434', '#A0605A', 1.6));
        }
        if (t === 'perforasyon_total' || t === 'perforasyon_marjinal') {
          // incus uzun kolu ve stapes (arka üstte; stapes arkaya, oval pencereye uzanır)
          const ik = [[C[0] - 88, C[1] - 168], [C[0] - 84, C[1] - 132], [C[0] - 78, C[1] - 92], [C[0] - 68, C[1] - 46]];   // zarın arkasındaki incus uzun kolu ile aynı yer
          const sb = ik[3], ob = [sb[0] - 56, sb[1] + 8];
          s += P(['kemikcikler', 'incus_uzun_kol'], () => k.boru(gYol(ik), k.w(9), '#F2ECDF', '#8E7A62', 1.6) + k.yol(gElips(sb[0] + 2, sb[1] + 4, 7, 6), '#F2ECDF', '#8E7A62', 1.6));
          s += P(['kemikcikler', 'stapes'], () => k.boru(gYol([[sb[0] - 4, sb[1] + 2], [ob[0] + 8, ob[1] - 6]]), k.w(4), '#F2ECDF', '#8E7A62', 1.2)
            + k.boru(gYol([[sb[0] - 4, sb[1] + 8], [ob[0] + 8, ob[1] + 10]]), k.w(4), '#F2ECDF', '#8E7A62', 1.2) + k.yol(gElips(ob[0] + 4, ob[1] + 2, 5, 13), '#F2ECDF', '#8E7A62', 1.4));
        }
      }
      s += '</g>';
      // delik kenarı (epitel kenarı, beyazımsı ince halka)
      return s + k.yol(yol, 'none', atik ? '#7A5650' : '#F6ECE8', atik ? 2 : 4.5) + k.yol(yol, 'none', atik ? '#7A5650' : '#BC8C84', 1.4);
    });
    g += '</g>';
  });
  return g;
}
// önde kalanlar: ventilasyon tüpü (ön alt kadran), ekzostozlar (çok, geniş tabanlı, kanalın iç kemik bölümü), osteom (tek, saplı, daha dışta)
function otoPatOnde(x) {
  const {c, k, P, E, el, pw} = x;
  let g = '';
  const tp = pw('tup');
  if (tp > .002) { const m = [432, 448], s0 = .7 + .3 * tp;
    g += `<g opacity="${n1(tp)}" transform="translate(${n1(m[0] * (1 - s0))} ${n1(m[1] * (1 - s0))}) scale(${n1(s0)})">`
      + P(['tup'], () => `<path d="${gElips(m[0] + 3, m[1] + 5, 30, 26)}" fill="#7A8696" opacity=".35"/>` + k.yol(gElips(m[0], m[1], 29, 25), '#4FA3D9', '#1F5F8E', 2)
        + k.yol(gElips(m[0] - 1, m[1] - 1, 19, 16), '#78BCE8', '#1F5F8E', 1.6))
      + P(['tup_lumeni', 'tup'], () => k.yol(gElips(m[0] - 1, m[1] - 1, 10, 8.5), '#24313F', '#1F5F8E', 1.4) + `<path d="M${m[0] - 20} ${m[1] - 12} q 8 -10 20 -10" fill="none" stroke="#FFFFFF" stroke-width="${k.W2(3)}" stroke-linecap="round" opacity=".8"/>`) + '</g>'; }
  const kab = (m, rxx, ryy, aci, ad) => `<g transform="rotate(${aci} ${n1(m[0])} ${n1(m[1])})">` + P([ad], () => `<path d="${gElips(m[0] + 6, m[1] + 8, rxx, ryy)}" fill="#8F7A74" opacity=".28"/>`
    + k.yol(gElips(m[0], m[1], rxx, ryy), `url(#${c.gid}ex)`, '#A88F88', 2) + `<path d="${gElips(m[0] - rxx * .25, m[1] - ryy * .3, rxx * .4, ryy * .28)}" fill="#FFFFFF" opacity=".55"/>`) + '</g>';
  const ex = pw('ekzostoz'), os_ = pw('osteom');
  if (ex > .002 || os_ > .002) { const cid = uid('px');
    g += `<defs><radialGradient id="${c.gid}ex" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#FBF5F1"/><stop offset="1" stop-color="#E4D2CB"/></radialGradient><clipPath id="${cid}"><path d="${gYol(el(1.2), true, .3)}"/></clipPath></defs><g clip-path="url(#${cid})">`;
    if (ex > .002) { const f = 1.24 - .1 * ex;
      g += `<g opacity="${n1(ex)}">` + kab(E(170, f), 70, 118, -10, 'ekzostoz') + kab(E(18, f), 64, 104, 8, 'ekzostoz') + kab(E(96, f + .02), 104, 60, 0, 'ekzostoz') + '</g>'; }
    if (os_ > .002) { const m = E(228, .98 + .14 * (1 - os_));
      g += `<g opacity="${n1(os_)}">` + P(['osteom'], () => `<path d="${gElips(m[0] + 10, m[1] + 12, 92, 88)}" fill="#7E6A64" opacity=".3"/>`
        + k.yol(gElips(m[0], m[1], 92, 88), `url(#${c.gid}ex)`, '#A88F88', 2.2) + `<path d="${gElips(m[0] - 26, m[1] - 30, 34, 24)}" fill="#FFFFFF" opacity=".55"/>`) + '</g>'; }
    g += '</g>'; }
  return g;
}

// ---------------------------------------------------------------- orta kulak iç duvarı (sağ, dıştan bakış; ön sağda) + mastoid (Gray 1918 Fig. 911, 913)
// Promontorium, pencereler, fasiyal kanal ve sinirin seyri (timpanik ve mastoid bölüm, stapedius dalı, chorda tympani), lateral kanal kabarıklığı,
// processus cochleariformis, tensor tympani yarı kanalı, Östaki borusu; arkada aditus ad antrum, antrum ve mastoid hava hücreleri; isteğe bağlı katlar.
CIZ.orta_kulak_ic_duvar = (c, ay) => {
  const CAV = [[300, 118], [420, 104], [560, 100], [690, 110], [756, 140], [786, 210], [800, 300], [812, 360], [814, 420], [790, 468], [740, 506], [660, 528], [540, 538],
    [430, 530], [350, 506], [308, 456], [296, 360], [294, 262], [296, 196]];
  const FAS = [[690, 150], [640, 178], [590, 196], [520, 198], [450, 200], [380, 206], [318, 214], [286, 236], [276, 290], [274, 360], [272, 440], [270, 520], [268, 640]];
  const a = {promontorium: [580, 356], oval_pencere: [392, 250], stapes_taban: [392, 250], ligamentum_anulare: [420, 250], yuvarlak_pencere: [402, 455], fasiyal_kanal: [470, 200],
    fasiyal_sinir: [272, 470], genikulat_ganglion: [642, 176], stapedius: [302, 380], piramidal_cikinti: [326, 290], stapedius_dali: [287, 336], chorda_tympani: [470, 236],
    lateral_kanal_kabarikligi: [380, 158], processus_cochleariformis: [596, 214], tensor_timpani: [720, 270], ostaki_borusu: [906, 498], aditus: [256, 158], antrum: [168, 172],
    mastoid_hucreleri: [120, 400], tegmen: [560, 98], epitympanum: [470, 140], mesotympanum: [670, 330], hypotympanum: [600, 505]};
  const takma = {fenestra_vestibuli: 'oval_pencere', fenestra_cochleae: 'yuvarlak_pencere', mastoid_antrum: 'antrum', antrum_mastoideum: 'antrum', aditus_ad_antrum: 'aditus',
    atik: 'epitympanum', yuz_siniri: 'fasiyal_sinir', piramit: 'piramidal_cikinti', eminentia_pyramidalis: 'piramidal_cikinti', korda_timpani: 'chorda_tympani',
    tensor_timpani_kas: 'tensor_timpani', promontory: 'promontorium', hava_hucreleri: 'mastoid_hucreleri'};
  return {w: 980, h: 640, cm: 1.05, kirp: true, a: takmaAd(a, takma), takma,
    yer: {aditus: 'ust', antrum: 'sol', mastoid_hucreleri: 'sol', tegmen: 'ust', lateral_kanal_kabarikligi: 'ust', epitympanum: 'ust', fasiyal_kanal: 'ust', ostaki_borusu: 'sag',
      tensor_timpani: 'sag', genikulat_ganglion: 'sag', processus_cochleariformis: 'sag', mesotympanum: 'sag', hypotympanum: 'alt', fasiyal_sinir: 'sol', stapedius: 'sol', stapedius_dali: 'sol',
      piramidal_cikinti: 'sol', oval_pencere: 'sol', stapes_taban: 'sol', yuvarlak_pencere: 'sol', promontorium: 'sag', chorda_tympani: 'ust', ligamentum_anulare: 'ust'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c);
      let s = `<rect x="0" y="0" width="980" height="640" fill="${AR.kemik}"/>`;
      // mastoid hava hücreleri (antrumun altında ve arkasında; doğumdan sonra gelişir)
      s += P(['mastoid_hucreleri'], () => { const r = ekRast(4); let g = '';
        for (let j = 0; j < 7; j++) for (let i = 0; i < 6; i++) { const x = 34 + i * 42 + (j % 2) * 20 + (r() - .5) * 10, y = 240 + j * 50 + (r() - .5) * 10;
          if (x > 268 - (j > 4 ? 30 : 0) || (x - 140) * (x - 140) / 1.6 + (y - 600) * (y - 600) > 230 * 230 * 1.2) continue;
          g += k.yol(gElips(x, y, 15 + r() * 6, 13 + r() * 6), '#FFFFFF', AR.ince, 1.4); }
        return g; });
      // antrum ve aditus
      s += P(['antrum'], () => k.yol(gYol([[110, 160], [130, 126], [178, 118], [222, 134], [234, 176], [214, 214], [168, 226], [124, 210]], true, .4), '#FFFFFF', NV, 2.4));
      s += P(['aditus'], () => `<path d="M216 140 L300 120 L300 196 L224 198 Z" fill="#FFFFFF"/>` + k.yol('M222 138 L300 118', 'none', NV, 2.4) + k.yol('M226 198 L298 196', 'none', NV, 2.4));
      // timpanik boşluk (iç duvar görünür), tegmen
      s += k.yol(gYol(CAV, true, .3), '#FFFFFF', null);
      s += P(['tegmen'], () => k.yol(gYol(CAV.slice(0, 5), false, .3), 'none', NV, 4));
      s += k.yol(gYol(CAV.slice(4).concat([CAV[0]]), false, .3), 'none', NV, 2.6);
      // katlar (isteğe bağlı): timpanik membranın üst ve alt kenarı hizasında
      const kid = uid('ok');
      s += `<defs><clipPath id="${kid}"><path d="${gYol(CAV, true, .3)}"/></clipPath></defs>`;
      const bant = (id, y0, y1) => c.P(id, v => v < .01 ? '' : `<rect clip-path="url(#${kid})" x="280" y="${y0}" width="560" height="${y1 - y0}" fill="${R.mavi}" fill-opacity="${n1(.16 * v)}"/>`);
      s += bant('epitympanum', 90, 228) + bant('mesotympanum', 228, 452) + bant('hypotympanum', 452, 560);
      // Östaki borusu (ön duvar altta, öne ve aşağı) ve tensor tympani yarı kanalı (üstünde)
      s += P(['tensor_timpani'], () => { const c1 = gCatmull([[600, 220], [680, 236], [760, 262], [860, 300], [980, 344]], 10), [Lf, Rt] = gBoru(c1, [8, 18, 24, 26, 26]);
        return k.yol(gYol(kapat(Lf, Rt), true, .3), AR.kas, NV, 2) + k.yol(gYol(c1.slice(8)), 'none', AR.kas_c, 1.2, 'stroke-opacity=".6"'); });
      s += P(['ostaki_borusu'], () => { const c1 = gCatmull([[796, 386], [850, 420], [910, 470], [980, 520]], 10), [Lf, Rt] = gBoru(c1, [64, 50, 40, 40]);
        return k.yol(gYol(kapat(Lf, Rt), true, .3), '#FFFFFF', NV, 2.4); });
      // promontorium (kokleanın bazal turu), timpanik pleksus olukları
      s += P(['promontorium'], () => `<defs><radialGradient id="${c.gid}pr" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#F4F7FB"/><stop offset="1" stop-color="#D2DDEB"/></radialGradient></defs>`
        + k.yol(gYol([[436, 318], [470, 262], [540, 236], [630, 244], [700, 290], [720, 370], [690, 440], [610, 476], [520, 476], [458, 440], [432, 380]], true, .4), `url(#${c.gid}pr)`, NV, 2.4)
        + k.yol('M520 290 C 556 330 572 380 562 440 M600 270 C 620 320 630 380 616 440 M480 330 C 500 360 510 400 500 440', 'none', AR.ince, 1.4, 'stroke-opacity=".7"'));
      // lateral yarım daire kanalı kabarıklığı (aditusun iç duvarında, fasiyal kanalın üstünde)
      s += P(['lateral_kanal_kabarikligi'], () => k.yol(gYol([[304, 168], [330, 148], [380, 140], [440, 146], [470, 162], [440, 178], [380, 182], [326, 180]], true, .4), '#DCE5F1', NV, 2));
      // fasiyal kanal kabarıklığı ve fasiyal sinir (timpanik bölüm oval pencerenin üstünde, ikinci dirsek, mastoid bölüm arka duvarın içinde)
      s += P(['fasiyal_kanal'], () => { const [Lf, Rt] = gBoru(gCatmull(FAS.slice(1, 8), 8), [22, 24, 24, 24, 24, 26, 28]); return k.yol(gYol(kapat(Lf, Rt), true, .3), '#D6E0EE', NV, 2); });
      s += P(['fasiyal_sinir'], () => { const c1 = gCatmull(FAS, 8), ic = c1.slice(0, 50), mas = c1.slice(48);
        return k.yol(gYol(ic), 'none', AR.sinir_c, 13, 'stroke-opacity=".55"') + k.yol(gYol(ic), 'none', AR.sinir, 9, 'stroke-opacity=".75"')
          + k.yol(gYol(mas), 'none', AR.sinir_c, 15) + k.yol(gYol(mas), 'none', AR.sinir, 10); });
      s += P(['genikulat_ganglion', 'fasiyal_sinir'], () => k.yol(gElips(646, 174, 15, 12), AR.sinir, AR.sinir_c, 1.8));
      // stapedius kası (piramit içinde), piramidal çıkıntı, stapedius dalı
      s += P(['stapedius'], () => k.yol(gYol([[294, 300], [306, 296], [314, 340], [314, 410], [306, 440], [296, 420], [292, 360]], true, .4), AR.kas, AR.kas_c, 1.6, 'fill-opacity=".9"'));
      s += P(['stapedius_dali', 'fasiyal_sinir'], () => k.yol('M276 336 L298 336', 'none', AR.sinir_c, 6) + k.yol('M276 336 L298 336', 'none', AR.sinir, 3));
      s += P(['piramidal_cikinti', 'stapedius'], () => k.yol(gPoly([[302, 274], [304, 306], [348, 292]]), '#DCE5F1', NV, 2));
      // processus cochleariformis (tensor tympani tendonunun döndüğü kanca)
      s += P(['processus_cochleariformis', 'tensor_timpani'], () => k.yol('M582 230 C 584 210 600 202 612 210 C 618 216 612 226 604 226', 'none', NV, 4) + k.yol(gElips(600, 214, 6, 6), AR.kas, NV, 1.6));
      // oval pencere (arka üstte; stapes tabanı ve halka bağ) ve yuvarlak pencere nişi (arka altta)
      s += P(['oval_pencere'], () => k.yol(gElips(392, 250, 40, 22), '#6F84A2', NV, 2.2));
      if (ay.stapes !== false) {
        s += P(['ligamentum_anulare', 'oval_pencere'], () => k.yol(gElips(392, 250, 33, 16), 'none', AR.zar, 4));
        s += P(['stapes_taban'], () => k.yol(gElips(392, 250, 28, 12), AR.osk, NV, 2) + (ay.stapes_kollar ? '' : ''));
        s += P(['stapedius'], () => k.yol('M346 290 C 360 276 372 264 380 256', 'none', NV, 2.4));
      }
      s += P(['yuvarlak_pencere'], () => k.yol(gElips(402, 455, 28, 26), '#6F84A2', NV, 2.2) + k.yol(gElips(404, 457, 14, 16), AR.zar, NV, 1.4));
      // chorda tympani (lateral duvarda; burada kesik çizgi: dış duvarla birlikte kaldırılmış)
      s += P(['chorda_tympani', 'fasiyal_sinir'], () => k.yol('M271 470 C 320 430 380 330 440 262 C 500 200 600 176 720 168', 'none', AR.sinir_c, 4, `stroke-dasharray="${k.W2(10)} ${k.W2(7)}"`));
      // kat sınırları
      if (ay.katlar) { const p = ilerle(c.t, ekBas(c, ay.katlar_cumle, .4), .7);
        s += `<g clip-path="url(#${kid})" opacity="${n1(p)}"><path d="M280 228 L840 228 M280 452 L840 452" stroke="${R.mavi}" stroke-width="${k.W2(2.6)}" stroke-dasharray="${k.W2(12)} ${k.W2(8)}"/></g>`; }
      if (ay.yonler !== false) s += c.yazi(960, 626, L('ÖN →', 'ANT →'), {a: 'end', px: 17, fw: 800, renk: R.soluk}) + c.yazi(20, 626, L('← ARKA', '← POST'), {a: 'start', px: 17, fw: 800, renk: R.soluk});
      return s; }};
};

// ---------------------------------------------------------------- var olan çizimlere isteğe bağlı eklemeler (ayar yoksa çizim aynen kalır)
// orta_kulak / kulak_kesit: ek parça noktaları (promontorium, processus_cochleariformis, lateral_kanal_kabarikligi, ligamentum_anulare) ve
// ayar.katlar: timpanik membranın üst ve alt kenarı hizasında kat sınırları (epitympanum, mesotympanum, hypotympanum).
(() => {
  const EKA = {promontorium: C2O([800, 492]), processus_cochleariformis: C2O(KG.PR_C), lateral_kanal_kabarikligi: C2O([800, 318]), ligamentum_anulare: C2O([KG.FP_X + 4, 410]),
    epitympanum: C2O([700, 304]), mesotympanum: C2O([760, 500]), hypotympanum: C2O([750, 556])};
  const ESLE = {promontorium: 'koklea', processus_cochleariformis: 'tensor_timpani', lateral_kanal_kabarikligi: 'yarim_daire_kanallari', ligamentum_anulare: 'oval_pencere'};
  const katlar = (c, ay) => {
    const k = kalem(c, KG.S), kid = uid('kt'), p = ilerle(c.t, ekBas(c, ay.katlar_cumle, .4), .7), ust = 385, alt = 524;
    const bant = (id, y0, y1) => c.P(id, v => v < .01 ? '' : `<rect clip-path="url(#${kid})" x="600" y="${y0}" width="220" height="${y1 - y0}" fill="${R.mavi}" fill-opacity="${n1(.2 * v)}"/>`);
    let g = `<defs><clipPath id="${kid}"><path d="${gYol(ORTA_K, true, .35)}"/></clipPath></defs>` + olcekli(c, 'c', () => bant('epitympanum', 280, ust) + bant('mesotympanum', ust, alt) + bant('hypotympanum', alt, 600));
    if (ay.katlar) g += `<g clip-path="url(#${kid})" opacity="${n1(p)}"><path d="M612 ${ust} L812 ${ust} M612 ${alt} L812 ${alt}" stroke="${R.mavi}" stroke-width="${k.W2(2.6)}" stroke-dasharray="${k.W2(12)} ${k.W2(8)}"/></g>`;
    return `<g transform="${KG.MATRIS}">${g}</g>`;
  };
  ['orta_kulak', 'kulak_kesit'].forEach(ad => {
    const eski = CIZ[ad];
    CIZ[ad] = (c, ay) => {
      const d = eski(c, ay); d.a = Object.assign({}, EKA, d.a); d.vurguEsle = Object.assign({}, ESLE, d.vurguEsle || {});
      d.yer = Object.assign({epitympanum: 'sag', mesotympanum: 'sag', hypotympanum: 'sag', promontorium: 'sag', processus_cochleariformis: 'sag', lateral_kanal_kabarikligi: 'sag', ligamentum_anulare: 'sag'}, d.yer);
      const kat = ay.katlar || ['epitympanum', 'mesotympanum', 'hypotympanum'].some(q => c.v[q]);
      const ekler = ad === 'kulak_kesit' && (ay.prob || ay.insert || ay.kollaps);
      if (kat || ekler) { const s0 = d.svg; d.svg = () => s0() + (kat ? katlar(c, ay) : '') + (ekler ? kulakYoluEk(c, ay, d) : ''); }
      if (ekler) Object.assign(d.a, KYE_A(ay));
      return d; };
  });
})();

// kulak_kesit ayar.prob ("timpanometri"), ayar.insert (true), ayar.kollaps (true): dış kulak yolu girişine prob / insert köpük uç / kulaklık baskısıyla kollaps.
// Çizim koordinatları ana kesitin dış katmanıdır (kanal girişi x 239, lümen y 372-532; kıkırdak bölüm x 239-352).
function KYE_A(ay) {
  const a = {};
  if (ay.prob) Object.assign(a, {prob: [130, 404], prob_ucu: [268, 378], prob_hoparlor: [96, 424], prob_mikrofon: [96, 452], prob_pompa: [96, 480], ses_dalgasi: [400, 452]});
  if (ay.insert) Object.assign(a, {kopuk_uc: [290, 388], ses_tupu: [176, 600], transduser: [104, 812], insert_kulaklik: [290, 388]});
  if (ay.kollaps) Object.assign(a, {kulaklik_yastigi: [50, 300], kollaps: [300, 450], kanal_agzi: [140, 840], yarik_agiz: [196, 840]});
  return a;
}
function kulakYoluEk(c, ay, d) {
  const k = kalem(c, 1), P = anP(c);
  let s = '';
  if (ay.prob) {
    const b = ekBas(c, ay.prob_cumle, .3), p = ilerle(c.t, b, .8), dx = -60 * (1 - p);
    s += `<g transform="translate(${n1(dx)} 0)" opacity="${n1(kis(p * 2))}">`;
    s += P(['prob'], () => k.yol(gYol([[40, 560], [44, 520], [70, 494]]), 'none', '#5E6F88', 7));
    s += P(['prob'], () => k.yol(gYol([[60, 410], [226, 410], [232, 420], [232, 488], [226, 496], [60, 496], [50, 486], [50, 420]], true, .15), '#F4F7FB', NV, 2.6));
    s += P(['prob_ucu', 'prob'], () => k.yol(gYol([[226, 394], [262, 374], [302, 376], [312, 400], [312, 506], [302, 530], [262, 532], [226, 514]], true, .3), '#DDE7F4', NV, 2.4));
    const kanal = (id, y, renk) => P([id, 'prob'], () => k.yol(`M78 ${y} L312 ${y}`, 'none', renk, 5) + k.yol(gElips(74, y, 8, 8), '#FFFFFF', renk, 2.2));
    s += kanal('prob_hoparlor', 424, R.mavi) + kanal('prob_mikrofon', 452, NV) + kanal('prob_pompa', 480, '#7A8BA4');
    s += '</g>';
    const tt = .45 + .4 * Math.sin(c.t * 4);
    if (p > .95) s += P(['ses_dalgasi'], () => `<g opacity="${n1(tt)}">` + [0, 1, 2].map(i => k.yol(`M${330 + i * 34} 420 Q ${346 + i * 34} 452 ${330 + i * 34} 484`, 'none', R.mavi, 3.2)).join('') + '</g>');
  }
  if (ay.insert) {
    const b = ekBas(c, ay.insert_cumle, .3), p = ilerle(c.t, b, .8);
    s += `<g opacity="${n1(kis(p * 2))}">`;
    s += P(['transduser', 'insert_kulaklik'], () => k.yol(gYol([[40, 780], [168, 780], [176, 788], [176, 846], [168, 854], [40, 854], [32, 846], [32, 788]], true, .15), '#5E6F88', NV, 2.4)
      + `<circle cx="104" cy="817" r="16" fill="#8D9DB4" stroke="${NV}" stroke-width="${k.W2(1.6)}"/>`);
    s += P(['ses_tupu', 'insert_kulaklik'], () => k.boru(gYol([[236, 456], [196, 470], [170, 530], [160, 640], [150, 760], [140, 780]]), k.w(7), '#F4F7FB', NV, 1.6));
    const sk = 1 - .12 * p;
    s += P(['kopuk_uc', 'insert_kulaklik'], () => { let g = k.yol(gYol([[232, 392], [300, 384], [338, 386], [344, 404], [344, 506], [338, 522], [300, 526], [232, 516]], true, .3), '#F4DCAE', '#B8925A', 2.2);
      const r = ekRast(8); for (let i = 0; i < 46; i++) g += `<circle cx="${n1(244 + r() * 92)}" cy="${n1(400 + r() * 110)}" r="${n1(2 + r() * 3)}" fill="#E2C38C"/>`;
      return g; });
    s += '</g>';
  }
  if (ay.kollaps) {
    const b = ekBas(c, ay.kollaps_cumle, .3), q = ilerle(c.t, b, 1.2), dx = 40 * (1 - q);
    s += P(['kulaklik_yastigi'], () => `<g transform="translate(${n1(-dx)} 0)">` + k.yol(gYol([[2, 170], [46, 170], [62, 196], [62, 724], [46, 750], [2, 750]], true, .2), '#5E6F88', NV, 2.6)
      + k.yol(gYol([[46, 200], [58, 220], [58, 700], [46, 720]], false, .3), 'none', '#8D9DB4', 3) + '</g>'
      + [300, 450, 600].map(y => okBasi(86 - dx * .5, y, 0, 14, R.mavi, 4) + `<line x1="${n1(62 - dx)}" y1="${y}" x2="${n1(84 - dx * .5)}" y2="${y}" stroke="${R.mavi}" stroke-width="4" stroke-linecap="round"/>`).join(''));
    // kıkırdak bölümün duvarları içe çöker: yarık biçimli lümen
    const yu = 372 + 66 * q, ya = 532 - 64 * q;
    s += P(['kollaps'], () => k.yol(gYol([[239, 372], [300, 366], [352, 362], [352, 362 + 70 * q], [300, yu + 6], [239, yu]], true, .3), AR.deri, null)
      + k.yol(gYol([[239, 532], [300, 536], [352, 538], [352, 538 - 66 * q], [300, ya - 4], [239, ya]], true, .3), AR.deri, null)
      + k.yol(gYol([[239, yu], [300, yu + 6], [352, 362 + 70 * q]]), 'none', NV, 2.4) + k.yol(gYol([[239, ya], [300, ya - 4], [352, 538 - 66 * q]]), 'none', NV, 2.4));
    // kanal ağzı (önden): normal yuvarlak / kollapsta yarık
    s += `<g opacity="${n1(q)}">` + P(['kanal_agzi'], () => k.yol(gElips(90, 840, 26, 26), '#FFFFFF', NV, 2.4) + c.yazi(90, 892, L('normal', 'normal'), {px: 16, fw: 600}))
      + P(['yarik_agiz', 'kanal_agzi'], () => k.yol(gElips(196, 840, 30, 6), '#FFFFFF', NV, 2.4) + k.yol(gElips(196, 840, 34, 26), 'none', AR.ince, 1.4, `stroke-dasharray="${k.W2(5)} ${k.W2(5)}"`) + c.yazi(196, 892, L('kollaps', 'collapse'), {px: 16, fw: 600}))
      + '</g>';
  }
  return s;
}

// orta_kulak / kulak_kesit patolojileri (2.11.2026, v5; ayar verilmezse çizim aynen kalır). Koordinatlar çekirdek katman (KG.MATRIS).
// ayar.kolesteatom: true (ya da ayar.atik_cebi: true yalnız cep): pars flaccida retraksiyonu -> derin cep (ağzı dar) -> keratin birikimi ->
//   atikte (epitympanum) kolesteatom kesesi -> isteğe bağlı arkaya yayılım oku (aditus ad antrum yönü, kesit düzleminin arkası: ⊗).
//   Cümle alanları: retraksiyon_cumle, cep_cumle, keratin_cumle, atik_cumle, yayilim_cumle (yayılım yalnız yayilim_cumle ya da yayilim: true ile).
// ayar.ekzostoz: true (ekzostoz_cumle): kemik kanalın iç (zara yakın) bölümünde geniş tabanlı çok sayıda kabarıklık;
// ayar.osteom: true (osteom_cumle): kemik-kıkırdak birleşimine yakın, daha dışta tek, saplı kemik kitlesi.
(() => {
  const CEP = [[627, 389], [629, 374], [629.5, 360], [629, 346], [632, 334], [640, 329], [647, 334], [648, 348], [644, 362], [641, 376], [640, 390], [637, 400]];
  const KESE = [[629, 350], [630, 326], [638, 308], [656, 300], [684, 300], [708, 306], [722, 318], [716, 334], [700, 344], [682, 350], [664, 358], [648, 364], [640, 372]];
  const agiz = (i, m) => { const a = [627, 389], b = [637, 400], u = i / (m - 1); return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]; };
  const duvarY = (pts, x) => { for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; if (x >= x0 && x <= x1) return y0 + (y1 - y0) * (x - x0) / (x1 - x0); } return pts[pts.length - 1][1]; };
  const UST = [[518, 405], [560, 400], [600, 393], [625, 385]], ALT = [[518, 515], [560, 520], [620, 528], [680, 532], [706, 530], [722, 524]];
  const asamalar = (c, ay) => { const p = (cm, yd) => ilerle(c.t, ekBas(c, cm, yd), 1.2);
    const r1 = p(ay.retraksiyon_cumle, .3), r2 = p(ay.cep_cumle, ay.retraksiyon_cumle != null ? c.cb(ay.retraksiyon_cumle) + 1.4 : .3);
    const tam = !!ay.kolesteatom, r3 = tam ? p(ay.keratin_cumle, .3) : 0, r4 = tam ? p(ay.atik_cumle, .3) : 0;
    const r5 = tam && (ay.yayilim || ay.yayilim_cumle != null) ? p(ay.yayilim_cumle, .3) : 0;
    return {r1, r2, r3, r4, r5}; };
  function kolesteatomSvg(c, ay) {
    const k = kalem(c, KG.S), P = anP(c), {r1, r2, r3, r4, r5} = asamalar(c, ay), der = .28 * r1 + .72 * r2, m = CEP.length;
    const cep = CEP.map((q, i) => { const a = agiz(i, m); return [a[0] + (q[0] - a[0]) * der, a[1] + (q[1] - a[1]) * der]; });
    const zarD = gYol(cep, false, .45), cid = uid('kc');
    // zarın pars flaccida bölümü (eski hali) silinir: iki yanı da hava (beyaz)
    let g = `<path d="M627.6 389.6 L636.4 399.4" stroke="#FFFFFF" stroke-width="${k.W2(10)}" stroke-linecap="round"/>`;
    // atikteki kese (keratin; ağzından genişleyerek büyür, kemikçikler soluk seçilir)
    if (r4 > .002) { const o = [636, 344], kes = KESE.map(q => [o[0] + (q[0] - o[0]) * (.25 + .75 * r4), o[1] + (q[1] - o[1]) * (.25 + .75 * r4)]);
      g += `<g opacity="${n1(kis(r4 * 2))}">` + P(['kolesteatom'], () => k.yol(gYol(kes, true, .4), '#FCEBC0', '#A8823A', 2.4, 'fill-opacity=".88"')
        + `<defs><clipPath id="${cid}k"><path d="${gYol(kes, true, .4)}"/></clipPath></defs><g clip-path="url(#${cid}k)" fill="none" stroke="#DDBF78" stroke-width="${k.W2(1.4)}">`
        + [.82, .64, .46].map(f => `<path d="${gYol(kes.map(q => [o[0] + 30 + (q[0] - o[0] - 30) * f, o[1] - 14 + (q[1] - o[1] + 14) * f]), true, .4)}"/>`).join('') + '</g>') + '</g>'; }
    // cep: zarın içe çekilmiş bölümü; keratinle dolunca krem rengi, katmanlı
    g += `<defs><clipPath id="${cid}"><path d="${gYol(cep, true, .45)}"/></clipPath></defs>`;
    if (r3 > .002) g += `<g opacity="${n1(r3)}">` + P(['keratin', 'kolesteatom'], () => `<path d="${gYol(cep, true, .45)}" fill="#FCEBC0"/>`
      + `<g clip-path="url(#${cid})" fill="#E9CF8E">` + [[634, 342, 3, 1.6], [640, 352, 2.6, 1.4], [633, 362, 3, 1.5], [638, 374, 2.4, 1.3], [634, 386, 2.2, 1.2]].map(([x0, y0, a0, b0]) => `<path d="${gElips(x0, y0, a0, b0)}"/>`).join('') + '</g>') + '</g>';
    g += P(['retraksiyon_cebi', 'pars_flaccida', 'timpanik_membran'], () => `<path d="${zarD}" fill="none" stroke="${NV}" stroke-width="${k.W2(8.5)}" stroke-linecap="round" stroke-linejoin="round"/>`
      + `<path d="${zarD}" fill="none" stroke="${AR.zar}" stroke-width="${k.W2(3.6)}" stroke-linecap="round" stroke-linejoin="round"/>`);
    // arkaya yayılım: aditus ad antrum yönü (kesit düzleminin arkası)
    if (r5 > .002) { const yy = gCatmull([[704, 318], [722, 306], [738, 304]], 8), m2 = Math.max(2, Math.round(yy.length * kis(r5 * 1.3)));
      g += P(['yayilim'], () => `<path d="${gYol(yy.slice(0, m2))}" fill="none" stroke="${anTur}" stroke-width="${k.W2(3.4)}" stroke-dasharray="${k.W2(7)} ${k.W2(5)}" stroke-linecap="round"/>`
        + `<g opacity="${n1(kis(r5 * 2 - 1))}"><circle cx="747" cy="306" r="8" fill="#FFFFFF" stroke="${anTur}" stroke-width="${k.W2(2.6)}"/><path d="M742 301 L752 311 M752 301 L742 311" stroke="${anTur}" stroke-width="${k.W2(2.4)}" stroke-linecap="round"/></g>`); }
    return g;
  }
  function kanalSvg(c, ay) {
    const k = kalem(c, KG.S), P = anP(c);
    const kubbe = (duvar, x0, x1, h, yon) => { const y0 = duvarY(duvar, x0), y1 = duvarY(duvar, x1), w = x1 - x0;
      const ic = `M${n1(x0)} ${n1(y0)} C ${n1(x0 + w * .12)} ${n1(y0 + yon * h * 1.33)} ${n1(x1 - w * .12)} ${n1(y1 + yon * h * 1.33)} ${n1(x1)} ${n1(y1)}`;
      return `<path d="${ic} L${n1(x1)} ${n1(y1 - yon * 5)} L${n1(x0)} ${n1(y0 - yon * 5)}Z" fill="${AR.kemik}"/>` + k.yol(ic, 'none', NV, 2.6); };
    let g = '';
    if (ay.ekzostoz) { const p = ilerle(c.t, ekBas(c, ay.ekzostoz_cumle, .3), 1.2);
      if (p > .002) g += P(['ekzostoz'], () => kubbe(UST, 584, 618, 15 * p, 1) + kubbe(ALT, 598, 640, 18 * p, -1) + kubbe(ALT, 650, 690, 14 * p, -1)); }
    if (ay.osteom) { const p = ilerle(c.t, ekBas(c, ay.osteom_cumle, .3), 1.2), bx = 534, by = duvarY(UST, bx);
      if (p > .002) g += `<g transform="translate(${n1(bx * (1 - p))} ${n1(by * (1 - p))}) scale(${n1(Math.max(p, .01))})">` + P(['osteom'], () =>
        `<path d="M${bx - 6} ${n1(by - 5)} L${bx + 6} ${n1(by - 5)} L${bx + 4} ${n1(by + 9)} L${bx - 4} ${n1(by + 9)}Z" fill="${AR.kemik}"/>`
        + k.yol(`M${bx - 5} ${n1(by)} C ${bx - 3} ${n1(by + 6)} ${bx - 5} ${n1(by + 10)} ${bx - 6} ${n1(by + 14)}`, 'none', NV, 2.4)
        + k.yol(`M${bx + 5} ${n1(by)} C ${bx + 3} ${n1(by + 6)} ${bx + 5} ${n1(by + 10)} ${bx + 6} ${n1(by + 14)}`, 'none', NV, 2.4)
        + k.yol(gElips(bx, by + 27, 16, 15), AR.kemik, NV, 2.6)) + '</g>'; }
    if (ay.ekzostoz || ay.osteom || c.v.kemik_kikirdak_birlesimi || c.etiketli.has('kemik_kikirdak_birlesimi'))
      g += P(['kemik_kikirdak_birlesimi'], () => k.yol(`M523 ${n1(duvarY(UST, 523))} L523 ${n1(duvarY(ALT, 523))}`, 'none', AR.ince, 1.6, `stroke-dasharray="${k.W2(6)} ${k.W2(5)}"`));
    return g;
  }
  ['orta_kulak', 'kulak_kesit'].forEach(ad => {
    const eski = CIZ[ad];
    CIZ[ad] = (c, ay) => {
      const d = eski(c, ay), kol = ay.kolesteatom || ay.atik_cebi, kan = ay.ekzostoz || ay.osteom;
      if (!kol && !kan) return d;
      if (kol) { Object.assign(d.a, {retraksiyon_cebi: C2O([638, 352]), keratin: C2O([638, 346]), kolesteatom: C2O(ay.kolesteatom ? [690, 316] : [638, 346]), prussak_boslugu: C2O([638, 392]),
          pars_flaccida: C2O([631, 394]), yayilim: C2O([747, 306]), kolesteatom_kesesi: C2O([690, 316]), aditus_yonu: C2O([747, 306])});
        d.yer = Object.assign({}, d.yer, {retraksiyon_cebi: 'sol', keratin: 'sol', kolesteatom: 'ust', prussak_boslugu: 'sol', pars_flaccida: 'sol', yayilim: 'sag', kolesteatom_kesesi: 'ust', aditus_yonu: 'sag'});
        d.takma = Object.assign({}, d.takma, {kolesteatom_kesesi: 'kolesteatom', aditus_yonu: 'yayilim', cep: 'retraksiyon_cebi', atik_cebi: 'retraksiyon_cebi'});
        d.kam = Object.assign({}, d.kam, {retraksiyon_cebi: C2O([660, 360]), kolesteatom: C2O([675, 330]), keratin: C2O([660, 360])}); }
      if (kan) { Object.assign(d.a, {ekzostoz: C2O([604, 398]), ekzostozlar: C2O([604, 398]), osteom: C2O([534, 430]), kemik_kikirdak_birlesimi: C2O([523, 470])});
        d.yer = Object.assign({}, d.yer, {ekzostoz: 'ust', ekzostozlar: 'ust', osteom: 'alt', kemik_kikirdak_birlesimi: 'alt'});
        d.kam = Object.assign({}, d.kam, {ekzostoz: C2O([620, 460]), osteom: C2O([560, 450])}); }
      const s0 = d.svg;
      d.svg = () => s0() + `<g transform="${KG.MATRIS}">${olcekli(c, 'c', () => (kan ? kanalSvg(c, ay) : '') + (kol ? kolesteatomSvg(c, ay) : ''))}</g>`;
      return d; };
  });
})();

// kemikcikler ayar.pencere: oval pencere kenarı ve ligamentum anulare (halka bağ) stapes tabanının çevresinde
(() => {
  const eski = CIZ.kemikcikler;
  CIZ.kemikcikler = (c, ay) => {
    const d = eski(c, ay);
    d.a = Object.assign({ligamentum_anulare: [863, 420], oval_pencere: [856, 400], fenestra_vestibuli: [856, 400]}, d.a);
    d.yer = Object.assign({ligamentum_anulare: 'sag', oval_pencere: 'sag', fenestra_vestibuli: 'sag'}, d.yer); d.takma = Object.assign({fenestra_vestibuli: 'oval_pencere'}, d.takma || {});
    if (ay.pencere || c.v.ligamentum_anulare || c.etiketli.has('ligamentum_anulare')) { const s0 = d.svg;
      d.svg = () => { const k = kalem(c, 1), P = anP(c);
        return s0() + P(['oval_pencere'], () => k.yol(gYol([[838, 392], [874, 392], [874, 404], [864, 406], [848, 406], [838, 404]], true, .2), AR.kemik, NV, 1.8)
          + k.yol(gYol([[838, 474], [874, 474], [874, 480], [838, 480]], true, .1), AR.kemik, NV, 1.8))
          + P(['ligamentum_anulare'], () => `<rect x="${KG.FP_X - 6 + KEM_AYIR.stapes}" y="406" width="17" height="68" rx="8" fill="none" stroke="${AR.zar}" stroke-width="${k.W2(4)}"/>`); }; }
    return d; };
})();

// koklea_acik: helicotrema (tepede scala vestibuli ile scala tympani birleşir); parça yalnız istenince çizilir
(() => {
  const eski = CIZ.koklea_acik;
  CIZ.koklea_acik = (c, ay) => {
    const d = eski(c, ay); d.a = Object.assign({helicotrema: [846, 220], scala_vestibuli: [470, 132], scala_tympani: [470, 318]}, d.a); d.yer = Object.assign({helicotrema: 'sag', scala_vestibuli: 'ust', scala_tympani: 'alt'}, d.yer);
    if (ay.helicotrema || c.v.helicotrema || c.etiketli.has('helicotrema')) { const s0 = d.svg;
      d.svg = () => s0() + c.P('helicotrema', v => { const p = ilerle(c.t, ekBas(c, ay.helicotrema_cumle, .6), 1), rr = karis(R.mavi, R.lacivert, v * .3);
        return `<g opacity="${n1(p)}"><ellipse cx="846" cy="220" rx="${n1(16 + 4 * v)}" ry="${n1(40 + 4 * v)}" fill="${R.mavi}" fill-opacity="${n1(.14 + .14 * v)}"/>`
          + `<path d="M770 168 C 820 166 852 186 852 220 C 852 254 820 274 770 272" fill="none" stroke="${rr}" stroke-width="4" stroke-dasharray="9 7" stroke-dashoffset="${n1(-c.t * 18)}"/>${okBasi(768, 272, Math.PI + .08, 13, rr, 4)}</g>`; }); }
    return d; };
})();

// koklea_kesit ayar.potasyum: K+ döngüsü okları (tüy hücresi tabanı -> destek hücreleri -> ligamentum spirale -> stria vascularis -> endolenf -> tüy hücresi tepesi)
(() => {
  const eski = CIZ.koklea_kesit;
  CIZ.koklea_kesit = (c, ay) => {
    const d = eski(c, ay);
    const A = {k_cikis: kcd([600, 352]), bosluk_baglantilari: kcd([740, 420]), ligament_yolu: [868, 452], stria_pompa: [800, 214], k_giris: kcd([560, 240]), potasyum_dongusu: [868, 452]};
    d.a = Object.assign({}, A, d.a); d.yer = Object.assign({k_cikis: 'alt', bosluk_baglantilari: 'sag', ligament_yolu: 'sag', stria_pompa: 'sag', k_giris: 'ust', potasyum_dongusu: 'sag'}, d.yer);
    d.takma = Object.assign({potasyum: 'potasyum_dongusu', k_dongusu: 'potasyum_dongusu'}, d.takma || {});
    if (ay.potasyum || Object.keys(A).some(q => c.v[q] || c.etiketli.has(q))) { const s0 = d.svg;
      d.svg = () => { const k = kalem(c, 1), b = ekBas(c, ay.potasyum_cumle, .5), p = ilerle(c.t, b, 2.2);
        const yollar = [['k_cikis', [kcd([592, 338]), kcd([640, 380]), kcd([700, 404])]], ['bosluk_baglantilari', [kcd([700, 404]), kcd([760, 412]), kcd([808, 420]), [826, 440]]],
          ['ligament_yolu', [[826, 440], [862, 420], [868, 360], [842, 300]]], ['stria_pompa', [[842, 300], [818, 250], [790, 210]]], ['k_giris', [[770, 200], [700, 214], kcd([620, 232]), kcd([566, 254])]]];
        let s = '';
        yollar.forEach(([id, pts], i) => { const q = kis(p * yollar.length - i); if (q <= 0) return; const cc = gCatmull(pts, 10), m = Math.max(2, Math.round(cc.length * q)), yy = cc.slice(0, m);
          s += c.P([id, 'potasyum_dongusu'], v => { const rr = karis(anTur, R.mavi, v);
            return `<path d="${gYol(yy)}" fill="none" stroke="#FFFFFF" stroke-width="${k.W2(8 + 2 * v)}" stroke-linecap="round" opacity=".8"/><path d="${gYol(yy)}" fill="none" stroke="${rr}" stroke-width="${k.W2(4 + 2 * v)}" stroke-linecap="round" stroke-dasharray="${k.W2(12)} ${k.W2(7)}" stroke-dashoffset="${n1(-c.t * 20 / c.k)}"/>`
              + (q > .98 ? okBasi(yy[yy.length - 1][0], yy[yy.length - 1][1], Math.atan2(yy[yy.length - 1][1] - yy[yy.length - 3][1], yy[yy.length - 1][0] - yy[yy.length - 3][0]), k.w(13), rr, k.w(4)) : ''); }); });
        const rozet = (x, y) => `<g opacity="${n1(kis(p * 3 - 1))}"><circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(k.w(15))}" fill="${anTur}" stroke="#FFFFFF" stroke-width="${k.W2(2.5)}"/>` + c.yazi(x, y + c.fs(6), 'K⁺', {px: 16, fw: 800, renk: '#FFFFFF'}) + '</g>';
        return s0() + s + rozet(880, 380) + rozet(700, 206); }; }
    return d; };
})();

// vestibuler ayar.akuadukt: endolenfatik kanal ve kese (vestibüler akuadukt içinde), koklear akuadukt (Gray 1918 Fig. 925, 926)
(() => {
  const eski = CIZ.vestibuler;
  CIZ.vestibuler = (c, ay) => {
    const d = eski(c, ay), A = d.a, ya = ay.yaw ?? -70, pa = ay.pitch ?? 40;
    // Bu bakışta ön (koklea) sağ altta, arka (kanal halkaları) solda, iç kulak yolu (sinir gövdesi) aşağıda. Endolenfatik kanal vestibülden
    // arkaya ve içe-aşağı uzanır, kese petröz kemiğin arka yüzündedir (sol altta, kanallarla çakışmadan); koklear akuadukt bazal turdan aşağı-içe iner.
    const V = A.vestibul, S0 = [(A.utrikul[0] + A.sakkul[0]) / 2, (A.utrikul[1] + A.sakkul[1]) / 2];
    const P1 = [S0[0] - 70, S0[1] + 70], P2 = [V[0] - 150, V[1] + 140], SK = [V[0] - 210, V[1] + 196], u0 = [SK[0] - P2[0], SK[1] - P2[1]], ul = Math.hypot(u0[0], u0[1]) || 1, u = [u0[0] / ul, u0[1] / ul];
    const KA0 = [A.koklea[0] - 46, A.koklea[1] + 40], KAm = [A.koklea[0] - 50, A.koklea[1] + 110], KA1 = [A.koklea[0] - 40, A.koklea[1] + 180];
    d.a = Object.assign({endolenfatik_kanal: P1, endolenfatik_kese: SK, vestibuler_akuadukt: P2, koklear_akuadukt: KAm}, A);
    d.yer = Object.assign({endolenfatik_kanal: 'sag', endolenfatik_kese: 'sag', vestibuler_akuadukt: 'sag', koklear_akuadukt: 'sol'}, d.yer);
    d.takma = Object.assign({endolenfatik_sak: 'endolenfatik_kese', saccus_endolymphaticus: 'endolenfatik_kese', ductus_endolymphaticus: 'endolenfatik_kanal'}, d.takma || {});
    if (ay.akuadukt || ['endolenfatik_kanal', 'endolenfatik_kese', 'vestibuler_akuadukt', 'koklear_akuadukt'].some(q => c.v[q] || c.etiketli.has(q))) { const s0 = d.svg;
      d.svg = () => { const k = kalem(c, 1), P = anP(c), yol = gCatmull([S0, P1, P2, SK], 10), [Lf, Rt] = gBoru(yol, [6, 7, 9, 10]), [Lk, Rk] = gBoru(yol.slice(0, -6), [26, 26, 28]);
        const ka = gCatmull([KA0, KAm, KA1], 8), [La, Ra] = gBoru(ka, [10, 9, 8]);
        const p = ilerle(c.t, ekBas(c, ay.akuadukt_cumle, .4), .8);
        return s0() + `<g opacity="${n1(p)}">` + P(['vestibuler_akuadukt'], () => k.yol(gYol(kapat(Lk, Rk), true, .3), '#EEF2F8', AR.ince, 1.6, `stroke-dasharray="${k.W2(6)} ${k.W2(5)}" fill-opacity=".55"`))
          + P(['endolenfatik_kanal'], () => k.yol(gYol(kapat(Lf, Rt), true, .3), '#C3E0FA', NV, 2))
          + P(['endolenfatik_kese'], () => `<g transform="rotate(${n1(Math.atan2(u[1], u[0]) * 180 / Math.PI)} ${n1(SK[0])} ${n1(SK[1])})">${k.yol(gElips(SK[0], SK[1], 46, 26), '#C3E0FA', NV, 2.2)}</g>`)
          + P(['koklear_akuadukt'], () => k.yol(gYol(kapat(La, Ra), true, .3), AR.sivi, NV, 1.8)) + '</g>'; }; }
    return d; };
})();

// ---------------------------------------------------------------- ampulla kesiti: krista, tüy hücreleri, kupula, endolenf akımı (Gray 1918 metni; OpenStax A&P 14.1 tarifi)
// ayar: {sapma: -1..1 (kupulanın sapması; + utrikül tarafına), sapma_cumle, geri_cumle (kupula eski yerine döner), akim: true (endolenf okları)}
CIZ.ampulla_kesit = (c, ay) => {
  const cx = 450, cy = 290, rx = 236, ry = 210, h = 46, B = 34;
  const duvar = x => cy + ry * Math.sqrt(Math.max(0, 1 - Math.pow((x - cx) / rx, 2))), tavan = x => cy - ry * Math.sqrt(Math.max(0, 1 - Math.pow((x - cx) / rx, 2)));
  const sirt = x => duvar(x) - 178 * Math.exp(-Math.pow((x - cx) / 108, 2)) + 6;          // krista sırtı (eyer biçimli kabartı)
  const a = {ampulla: [cx + 190, cy - 120], krista: [cx + 60, duvar(cx + 60) - 40], tuy_hucreleri: [cx - 70, sirt(cx - 70) + 14], kupula: [cx, cy - 60], endolenf: [120, cy], perilenf: [120, cy - h - 16],
    kemik_kanal: [120, cy - h - B - 30], ampuller_sinir: [cx + 6, 560], akim: [160, cy], destek_hucreleri: [cx + 120, duvar(cx + 120) - 16], zar_kanal: [790, cy - h], stereosiller: [cx + 50, sirt(cx + 50) - 18]};
  const takma = {crista_ampullaris: 'krista', cupula: 'kupula', sinir: 'ampuller_sinir', endolenf_akimi: 'akim', tuyler: 'stereosiller'};
  return {w: 900, h: 580, cm: 1.1, a: takmaAd(a, takma), takma,
    yer: {kupula: 'ust', krista: 'sag', ampuller_sinir: 'sag', endolenf: 'sol', perilenf: 'sol', kemik_kanal: 'sol', akim: 'ust', tuy_hucreleri: 'sol', ampulla: 'sag', destek_hucreleri: 'sag', zar_kanal: 'sag', stereosiller: 'sag'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c);
      let sp = (ay.sapma || 0) * ilerle(c.t, ekBas(c, ay.sapma_cumle, .8), 1.4); if (ay.geri_cumle != null) sp *= 1 - ilerle(c.t, c.cb(ay.geri_cumle), 2.2);
      const zar = (hh, ex, ey) => { const xo = Math.sqrt(1 - Math.pow(hh / ey, 2)) * ex;
        return `M0 ${cy - hh} L${n1(cx - xo)} ${cy - hh} A${ex} ${ey} 0 0 1 ${n1(cx + xo)} ${cy - hh} L900 ${cy - hh} L900 ${cy + hh} L${n1(cx + xo)} ${cy + hh} A${ex} ${ey} 0 0 1 ${n1(cx - xo)} ${cy + hh} L0 ${cy + hh}Z`; };
      let s = P(['kemik_kanal'], () => `<rect x="0" y="0" width="900" height="580" rx="24" fill="${AR.kemik}"/>`);
      s += P(['perilenf'], () => k.yol(zar(h + B, rx + B, ry + B), AR.sivi, NV, 2.4));
      s += P(['ampulla', 'endolenf', 'zar_kanal'], () => k.yol(zar(h, rx, ry), AR.endo, NV, 2.6));
      // ampuller sinir: kristanın tabanından kemiğe
      s += P(['ampuller_sinir'], () => k.boru(gYol([[cx, duvar(cx) - 30], [cx + 4, duvar(cx) + 40], [cx + 8, 580]]), k.w(24), AR.sinir, AR.sinir_c, 2));
      // krista: zarın tabanından yükselen sırt, içinde destek hücreleri ve sinir lifleri
      const xs2 = Array.from({length: 41}, (_, i) => cx - 190 + 380 * i / 40), kr = xs2.map(x => [x, sirt(x)]).concat(xs2.slice().reverse().map(x => [x, duvar(x) + 2]));
      s += P(['krista', 'destek_hucreleri'], () => k.yol(gYol(kr, true, .2), CO.DESTEK, NV, 2.4)
        + [-120, -70, -20, 30, 80, 130].map(dx => `<ellipse cx="${cx + dx}" cy="${n1(duvar(cx + dx) - 16)}" rx="10" ry="6" fill="${AR.cekirdek}" opacity=".55"/>`).join('')
        + [-90, -45, 0, 45, 90].map(dx => k.yol(gYol([[cx + dx * .3, duvar(cx) - 28], [cx + dx * .7, sirt(cx + dx) + 60], [cx + dx, sirt(cx + dx) + 30]]), 'none', AR.sinir_c, 2, 'stroke-opacity=".7"')).join(''));
      // tüy hücreleri sırtın yüzeyinde (tip I şişe / tip II silindir), demetler yüzeye dik
      let hc = '', demet = '';
      for (let i = 0; i < 9; i++) { const x = cx - 120 + i * 30, y = sirt(x), eg = Math.atan2(sirt(x + 3) - sirt(x - 3), 6), d = eg * 180 / Math.PI;
        hc += `<g transform="rotate(${n1(d)} ${n1(x)} ${n1(y)})">` + (i % 2 ? k.yol(gYol([[x - 9, y], [x + 9, y], [x + 10, y + 30], [x + 6, y + 38], [x - 6, y + 38], [x - 10, y + 30]], true, .3), '#FFFFFF', NV, 1.6)
          : k.yol(gYol([[x - 5, y], [x + 5, y], [x + 7, y + 10], [x + 12, y + 26], [x + 6, y + 40], [x - 6, y + 40], [x - 12, y + 26], [x - 7, y + 10]], true, .35), '#FFFFFF', NV, 1.6)) + `<circle cx="${n1(x)}" cy="${n1(y + 27)}" r="4.5" fill="${AR.cekirdek}"/></g>`;
        const t = tuyDemeti(k, x, y + 1, {n: 4, ara: 3.8, w: 2.4, hmin: 12, hmax: 30, kino: true, egim: eg + sp * .5, cz: 1});
        demet += t.stereo + t.kino; }
      s += P(['tuy_hucreleri'], () => hc);
      // kupula: sırtın tepesinden ampulla tavanına uzanan jelatinimsi kapı; sapmada ortası şişer (diyafram gibi)
      const N = 22, dxf = u => sp * 64 * Math.pow(Math.sin(Math.PI * u), .85);
      const kenar = (xb, xt) => Array.from({length: N + 1}, (_, i) => { const u = i / N, yb2 = sirt(xb), yt = tavan(xt) + 2, y = yb2 + (yt - yb2) * u; return [xb + (xt - xb) * u + dxf(u), y]; });
      const sol = kenar(cx - 74, cx - 120), sag = kenar(cx + 74, cx + 120), ust = Array.from({length: 12}, (_, i) => { const x = cx - 120 + 240 * i / 11; return [x, tavan(x) + 2]; });
      const alt = Array.from({length: 12}, (_, i) => { const x = cx + 74 - 148 * i / 11; return [x, sirt(x) - 2]; });
      const kup = sol.concat(ust.slice(1, -1), sag.slice().reverse(), alt);
      s += P(['kupula'], () => `<path d="${gYol(kup, true, .2)}" fill="${anJel}" fill-opacity=".85" stroke="${anJelC}" stroke-width="${k.W2(2)}"/>`
        + [-.5, 0, .5].map(f => { const pts = kenar(cx + 74 * f, cx + 120 * f); return `<path d="${gYol(pts)}" fill="none" stroke="${anJelC}" stroke-width="${k.W2(1.2)}" stroke-opacity=".6"/>`; }).join(''));
      s += P(['stereosiller', 'tuy_hucreleri'], () => demet);
      // endolenf akımı (kanaldan ampullaya), okların yönü sapma yönündedir
      if (ay.akim || c.v.akim) { const yon = sp >= 0 ? 1 : -1, op = Math.min(1, Math.abs(sp) * 2 + (c.v.akim || 0));
        s += P(['akim'], () => `<g opacity="${n1(op)}">` + [0, 1, 2].map(i => { const x0 = 30 + ((i * 66 + c.t * 40 * yon) % 198 + 198) % 198;
          return k.yol(`M${n1(x0)} ${cy} L${n1(x0 + 34 * yon)} ${cy}`, 'none', R.mavi, 5) + okBasi(x0 + 40 * yon, cy, yon > 0 ? 0 : Math.PI, k.w(12), R.mavi, k.w(5)); }).join('') + '</g>'); }
      if (ay.yonler !== false) s += c.yazi(884, cy + h + B + 28, L('utrikül tarafı →', 'utricle side →'), {a: 'end', px: 17, fw: 700, renk: R.soluk})
        + c.yazi(16, cy + h + B + 28, L('← kanal', '← canal'), {a: 'start', px: 17, fw: 700, renk: R.soluk});
      return s; }};
};

// ---------------------------------------------------------------- maküla kesiti: tüy hücreleri (tip I, tip II), destek hücreleri, jelatinimsi tabaka, otolit zarı, otokonya, striola
// ayar: {egim: -1..1 (baş eğilince otolitik tabakanın kayması), egim_cumle, organ: "utrikul" | "sakkul" (kinosilyum striolaya doğru | ters), striola: true}
CIZ.makula_kesit = (c, ay) => {
  const xs = [96, 176, 256, 336, 416, 484, 564, 644, 724, 804], st = 450, sak = ay.organ === 'sakkul';
  const a = {tuy_hucreleri: [256, 360], tip_1: [176, 372], tip_2: [336, 360], destek_hucreleri: [216, 420], stereosiller: [564, 280], kinosilyum: [500, 268], jelatinimsi_tabaka: [700, 270],
    otolit_zari: [700, 224], otokonya: [640, 176], striola: [st, 140], sinir_lifleri: [380, 490], makula: [120, 400], kayma: [800, 120]};
  const takma = {otolit: 'otokonya', kulak_taslari: 'otokonya', otolitik_zar: 'otolit_zari', jel: 'jelatinimsi_tabaka', tuyler: 'stereosiller', kinosilium: 'kinosilyum'};
  return {w: 900, h: 540, cm: 1.1, a: takmaAd(a, takma), takma,
    yer: {otokonya: 'ust', striola: 'ust', otolit_zari: 'sag', jelatinimsi_tabaka: 'sag', kayma: 'sag', stereosiller: 'sag', kinosilyum: 'ust', tuy_hucreleri: 'sol', tip_1: 'sol', tip_2: 'alt',
      destek_hucreleri: 'sol', sinir_lifleri: 'alt', makula: 'sol'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c), sp = (ay.egim || 0) * ilerle(c.t, ekBas(c, ay.egim_cumle, .8), 1.4), D = sp * 46;
      let s = `<rect x="0" y="0" width="900" height="540" fill="${AR.endo}" opacity=".55"/>`;
      // sinir lifleri ve bazal zemin
      s += P(['sinir_lifleri'], () => xs.map((x, i) => k.boru(gYol([[x, 410], [x + (i % 2 ? 10 : -6), 470], [x + (i % 2 ? 4 : -2), 540]]), k.w(i % 2 ? 7 : 9), AR.sinir, AR.sinir_c, 1.2)).join(''));
      s += P(['destek_hucreleri', 'makula'], () => { let g = k.yol('M40 300 L860 300 L860 446 L40 446 Z', CO.DESTEK, NV, 2.2);
        for (let i = 0; i < 12; i++) { const x = 60 + i * 70; g += `<ellipse cx="${x}" cy="430" rx="9" ry="6" fill="${AR.cekirdek}" opacity=".55"/>`; } return g + k.yol('M40 446 L860 446', 'none', NV, 3); });
      // tüy hücreleri
      let h1 = '', h2 = '', st2 = '', ki = '';
      xs.forEach((x, i) => { const tip1 = i % 2 === 0;
        if (tip1) h1 += k.yol(gYol([[x - 9, 302], [x + 9, 302], [x + 12, 318], [x + 26, 352], [x + 24, 386], [x + 10, 404], [x - 10, 404], [x - 24, 386], [x - 26, 352], [x - 12, 318]], true, .35), '#FFFFFF', NV, 2)
          + k.yol(gYol([[x - 15, 324], [x - 30, 352], [x - 28, 392], [x - 12, 412], [x + 12, 412], [x + 28, 392], [x + 30, 352], [x + 15, 324]]), 'none', AR.sinir_c, 6) + k.yol(gYol([[x - 15, 324], [x - 30, 352], [x - 28, 392], [x - 12, 412], [x + 12, 412], [x + 28, 392], [x + 30, 352], [x + 15, 324]]), 'none', AR.sinir, 3.4)
          + `<circle cx="${x}" cy="372" r="9" fill="${AR.cekirdek}"/>`;
        else h2 += k.yol(gYol([[x - 16, 302], [x + 16, 302], [x + 17, 360], [x + 14, 384], [x, 390], [x - 14, 384], [x - 17, 360]], true, .3), '#FFFFFF', NV, 2) + `<circle cx="${x}" cy="342" r="9" fill="${AR.cekirdek}"/>`
          + [-8, 6].map(dx => `<circle cx="${x + dx}" cy="396" r="5" fill="${AR.sinir}" stroke="${AR.sinir_c}" stroke-width="${k.W2(1.2)}"/>`).join('');
        // kinosilyum: utrikülde striolaya doğru, sakkülde strioladan uzak
        const yon = (x < st ? 1 : -1) * (sak ? -1 : 1), t = tuyDemeti(k, x, 302, {n: 5, ara: 5, w: 3, hmin: 14, hmax: 34, kino: true, yon, egim: Math.atan(D * .9 / 60), cz: 1.1});
        st2 += t.stereo; ki += t.kino; });
      s += P(['tuy_hucreleri', 'tip_1'], () => h1) + P(['tuy_hucreleri', 'tip_2'], () => h2);
      // jelatinimsi tabaka (tüyler gömülü), otolit zarı ve otokonya: eğilmede kayarlar
      const jel = [[40, 300], [860, 300], [860 + D * .55, 246], [40 + D * .55, 246]], oz = [[40 + D * .55, 246], [860 + D * .55, 246], [860 + D * .85, 212], [40 + D * .85, 212]];
      s += P(['jelatinimsi_tabaka'], () => `<path d="${gPoly(jel)}" fill="#FFF7E6" fill-opacity=".85" stroke="${anJelC}" stroke-width="${k.W2(1.4)}"/>`);
      s += P(['stereosiller'], () => st2) + P(['kinosilyum', 'stereosiller'], () => ki);
      s += P(['otolit_zari'], () => `<path d="${gPoly(oz)}" fill="${anJel}" stroke="${anJelC}" stroke-width="${k.W2(1.8)}"/>`);
      s += P(['otokonya'], () => { const r = ekRast(21); let g = '';
        for (let i = 0; i < 95; i++) { const x = 46 + r() * 808, yy = 160 + r() * 46, ns = Math.abs(x - st) < 40, b = (ns ? 7 : 10) + r() * (ns ? 5 : 10), h2b = b * (.55 + r() * .25), ac = (r() - .5) * 50;
          g += `<g transform="translate(${n1(x + D)} ${n1(yy)}) rotate(${n1(ac)})"><path d="M${n1(-b)} 0 L${n1(-b * .5)} ${n1(-h2b)} L${n1(b * .5)} ${n1(-h2b)} L${n1(b)} 0 L${n1(b * .5)} ${n1(h2b)} L${n1(-b * .5)} ${n1(h2b)}Z" fill="#FFFFFF" stroke="${NV}" stroke-width="${k.W2(1.3)}"/></g>`; }
        return g; });
      // striola
      if (ay.striola !== false) s += P(['striola'], () => `<path d="M${st + D * .9} 132 L${st} 300 L${st} 446" stroke="${R.mavi}" stroke-width="${k.W2(2.4)}" stroke-dasharray="${k.W2(9)} ${k.W2(7)}" fill="none"/>`);
      if (Math.abs(sp) > .02 || c.v.kayma) { const yn = sp >= 0 ? 1 : -1; s += P(['kayma'], () => k.yol(`M${780 - 50 * yn} 120 L${780 + 50 * yn} 120`, 'none', R.mavi, 5) + okBasi(780 + 56 * yn, 120, yn > 0 ? 0 : Math.PI, k.w(14), R.mavi, k.w(5))); }
      return s; }};
};

// ---------------------------------------------------------------- vestibüler tüy hücreleri: tip I (şişe, kaliks sonlanma) ve tip II (silindir, buton sonlanmalar)
// ayar.mod: "hucreler" (varsayılan) | "ates": üç durumda demet eğilmesi ve sinir lifinin ateşleme hızı (ters yöne: azalır, dinlenim, kinosilyuma doğru: artar)
// Kaynak: Wersäll 1956 tip I / tip II tarifi; standart ders kitabı (Purves, Neuroscience; OpenStax A&P 14.1).
CIZ.vestibuler_tuy_hucresi = (c, ay) => {
  if (ay.mod === 'ates') {
    const X = [160, 450, 740], eg = [-.42, 0, .42], adet = [3, 7, 13];
    const a = {ters_yon: [X[0], 230], dinlenim: [X[1], 230], kinosilyuma_dogru: [X[2], 230], atimlar: [X[2] - 60, 446], kinosilyum: [X[1] + 30, 108], stereosiller: [X[1] - 20, 124]};
    return {w: 900, h: 560, cm: 1.1, a, yer: {ters_yon: 'sol', dinlenim: 'ust', kinosilyuma_dogru: 'sag', atimlar: 'alt', kinosilyum: 'ust', stereosiller: 'ust'},
      takma: {uyarilma: 'kinosilyuma_dogru', baskilanma: 'ters_yon', depolarizasyon: 'kinosilyuma_dogru', hiperpolarizasyon: 'ters_yon', ateslemeler: 'atimlar'},
      svg: () => { const k = kalem(c, 1), P = anP(c); let s = '';
        const ad = [L('ters yöne: azalır', 'away: decreases'), L('dinlenim', 'at rest'), L('kinosilyuma doğru: artar', 'toward kinocilium: increases')];
        X.forEach((x, i) => { const id = ['ters_yon', 'dinlenim', 'kinosilyuma_dogru'][i], b = ekBas(c, (ay.cumleler || [])[i], .4 + i * .5), p = ilerle(c.t, b, .8);
          s += `<g opacity="${n1(.3 + .7 * p)}">` + P([id], () => k.yol(gYol([[x - 40, 190], [x + 40, 190], [x + 42, 300], [x + 34, 330], [x, 340], [x - 34, 330], [x - 42, 300]], true, .3), '#FFFFFF', NV, 2.2)
            + `<circle cx="${x}" cy="290" r="13" fill="${AR.cekirdek}"/>`);
          const t = tuyDemeti(k, x - 6, 190, {n: 6, ara: 8, w: 4, hmin: 24, hmax: 62, kino: true, egim: eg[i] * p, cz: 1.3});
          s += P(['stereosiller', id], () => t.stereo) + P(['kinosilyum', id], () => t.kino);
          if (i !== 1) { const yn = eg[i] > 0 ? 1 : -1; s += k.yol(`M${x - 30 * yn} 70 L${x + 26 * yn} 70`, 'none', R.mavi, 4) + okBasi(x + 32 * yn, 70, yn > 0 ? 0 : Math.PI, k.w(12), R.mavi, k.w(4)); }
          // ateşleme dizisi
          const r = ekRast(30 + i), ts = Array.from({length: adet[i]}, (_, j) => (j + .5 + (r() - .5) * .6) / adet[i]);
          s += k.yol(`M${x - 120} 470 L${x + 120} 470`, 'none', NV, 2) + P(['atimlar', id], () => ts.map(u => k.yol(`M${n1(x - 120 + 240 * u)} 470 L${n1(x - 120 + 240 * u)} 426`, 'none', i === 2 ? R.mavi : NV, 4)).join(''));
          s += c.yazi(x, 512, ad[i], {px: 19, fw: 700, renk: i === 2 ? R.mavi : R.lacivert}) + '</g>'; });
        return s; }};
  }
  const a = {tip_1: [250, 400], tip_2: [640, 360], kaliks: [214, 440], bouton: [606, 470], efferent: [580, 446], stereosiller: [282, 168], kinosilyum: [340, 118], destek_hucreleri: [440, 440],
    sinir_lifleri: [440, 560], tuy_demeti: [640, 160], tuy_hucreleri: [640, 300]};
  const takma = {tip_i: 'tip_1', tip_ii: 'tip_2', kaliks_sonlanma: 'kaliks', calyx: 'kaliks', buton: 'bouton', kinosilium: 'kinosilyum', tuyler: 'stereosiller', destek: 'destek_hucreleri'};
  return {w: 900, h: 600, cm: 1.1, a: takmaAd(a, takma), takma,
    yer: {tip_1: 'sol', kaliks: 'sol', stereosiller: 'sol', kinosilyum: 'ust', tip_2: 'sag', bouton: 'sag', efferent: 'sag', destek_hucreleri: 'alt', sinir_lifleri: 'alt', tuy_demeti: 'ust', tuy_hucreleri: 'sag'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c);
      let s = `<rect x="0" y="0" width="900" height="206" fill="${AR.endo}" opacity=".5"/>`;
      s += P(['destek_hucreleri'], () => { let g = k.yol('M40 206 L860 206 L860 520 L40 520 Z', CO.DESTEK, NV, 2.2);
        [120, 440, 780].forEach(x => g += k.yol(`M${x} 210 L${x + 6} 516`, 'none', AR.ince, 1.2)); [80, 160, 420, 470, 760, 820].forEach(x => g += `<ellipse cx="${x}" cy="498" rx="11" ry="7" fill="${AR.cekirdek}" opacity=".55"/>`); return g + k.yol('M40 520 L860 520', 'none', NV, 3.2); });
      // tip I: şişe biçimli gövde, kaliks sinir sonlanması
      const T1 = [[268, 208], [312, 208], [318, 240], [345, 300], [356, 372], [346, 432], [320, 466], [290, 476], [260, 466], [234, 432], [224, 372], [235, 300], [262, 240]];
      const KL = [[247, 262], [222, 312], [210, 374], [222, 444], [256, 484], [290, 492], [324, 484], [358, 444], [370, 374], [358, 312], [333, 262]];
      s += P(['sinir_lifleri', 'kaliks'], () => k.boru(gYol([[290, 490], [292, 540], [296, 600]]), k.w(16), AR.sinir, AR.sinir_c, 1.8));
      s += P(['kaliks'], () => k.yol(gYol(KL), 'none', AR.sinir_c, 17) + k.yol(gYol(KL), 'none', AR.sinir, 12));
      s += P(['tip_1', 'tuy_hucreleri'], () => k.yol(gYol(T1, true, .35), '#FFFFFF', NV, 2.6) + `<circle cx="290" cy="392" r="22" fill="${AR.cekirdek}"/>`);
      // tip II: silindir gövde, buton sonlanmalar ve efferent
      const T2 = [[580, 208], [660, 208], [664, 300], [662, 420], [646, 452], [620, 458], [594, 452], [578, 420], [576, 300]];
      s += P(['sinir_lifleri', 'bouton'], () => [[600, 466], [628, 470], [652, 456]].map(([x, y]) => k.boru(gYol([[x, y], [x + 4, 530], [622, 600]]), k.w(6), AR.sinir, AR.sinir_c, 1.2)).join(''));
      s += P(['tip_2', 'tuy_hucreleri'], () => k.yol(gYol(T2, true, .3), '#FFFFFF', NV, 2.6) + `<circle cx="620" cy="330" r="22" fill="${AR.cekirdek}"/>`);
      s += P(['bouton'], () => [[600, 466], [628, 470], [652, 456]].map(([x, y]) => k.yol(gElips(x, y, 10, 8), AR.sinir, AR.sinir_c, 1.6)).join(''));
      s += P(['efferent'], () => k.boru(gYol([[540, 600], [556, 500], [578, 448]]), k.w(5), '#C9D3E0', '#5E6F88', 1.2) + k.yol(gElips(580, 446, 9, 7), '#B9C6D6', '#5E6F88', 1.6)
        + k.boru(gYol([[200, 600], [214, 520], [236, 488]]), k.w(5), '#C9D3E0', '#5E6F88', 1.2) + k.yol(gElips(238, 486, 8, 6), '#B9C6D6', '#5E6F88', 1.4));
      // demetler: basamaklı stereosiller ve en uzun kenarda kinosilyum
      [[284, 208], [614, 208]].forEach(([x, y]) => { const t = tuyDemeti(k, x, y, {n: 6, ara: 9, w: 5, hmin: 26, hmax: 72, kino: true, egim: ay.egim || 0});
        s += P(['stereosiller', 'tuy_demeti'], () => t.stereo) + P(['kinosilyum', 'tuy_demeti'], () => t.kino); });
      if (ay.adlar !== false) s += c.yazi(170, 250, L('tip I', 'type I'), {px: 24, fw: 800, ff: 'Outfit', renk: R.mavi}) + c.yazi(760, 250, L('tip II', 'type II'), {px: 24, fw: 800, ff: 'Outfit', renk: R.mavi});
      return s; }};
};

// ---------------------------------------------------------------- stereosil demeti yakın plan (koklear): merdiven dizilim, uç bağlantıları, mekanik açılan iyon kanalı
// ayar: {egilme: -1..1 (+: uzun stereosile doğru; kanallar açılır), egilme_cumle, iyon: true (K+ girişi)}. Kaynak: Pickles ve ark. 1984; Purves, Neuroscience.
CIZ.stereosil_demeti = (c, ay) => {
  const X = [300, 450, 600], Hh = [150, 250, 350], yb = 470;
  const a = {stereosil: [X[2] + 30, 200], merdiven: [X[1] + 30, 260], uc_baglantisi: [380, 240], kaderin_23: [404, 210], protokaderin_15: [356, 300], iyon_kanali: [X[0], yb - Hh[0] - 6],
    kutikuler_plaka: [700, 486], tuy_hucresi: [700, 560], potasyum: [200, 130], endolenf: [120, 90]};
  const takma = {stereosiller: 'stereosil', stereosilya: 'stereosil', tip_link: 'uc_baglantisi', uc_baglantilari: 'uc_baglantisi', kanal: 'iyon_kanali', met_kanali: 'iyon_kanali', k: 'potasyum', iyonlar: 'potasyum'};
  return {w: 900, h: 600, cm: 1.15, a: takmaAd(a, takma), takma,
    yer: {stereosil: 'sag', merdiven: 'sag', uc_baglantisi: 'sol', kaderin_23: 'ust', protokaderin_15: 'sol', iyon_kanali: 'sol', kutikuler_plaka: 'sag', tuy_hucresi: 'sag', potasyum: 'ust', endolenf: 'sol'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c), eg = (ay.egilme ?? .35) * ilerle(c.t, ekBas(c, ay.egilme_cumle, .8), 1.2), ac = eg * .16, sx = Math.sin(ac), cy2 = Math.cos(ac);
      const uc = (i, h) => [X[i] + h * sx, yb - h * cy2];
      let s = P(['endolenf'], () => `<rect x="0" y="0" width="900" height="${yb}" fill="${AR.endo}" opacity=".45"/>`);
      s += P(['tuy_hucresi'], () => k.yol('M120 486 L780 486 L800 600 L100 600 Z', '#FFFFFF', NV, 2.6));
      s += P(['kutikuler_plaka', 'tuy_hucresi'], () => k.yol('M130 468 L770 468 L776 504 L124 504 Z', '#D6E0EE', NV, 2));
      // stereosiller: kökte daralır
      const sil = i => { const h = Hh[i], w = 46, [tx, ty] = uc(i, h), nx = cy2, ny = sx, x0 = X[i];
        const kok = [[x0 - 9, yb + 24], [x0 + 9, yb + 24]], gov = [[x0 + w / 2 * nx, yb - 26 * cy2], [tx + w / 2 * nx, ty + w / 2 * cy2], [tx, ty - 2], [tx - w / 2 * nx, ty + w / 2 * cy2], [x0 - w / 2 * nx, yb - 26 * cy2]];
        return k.yol(gYol([kok[1]].concat(gov, [kok[0]]), true, .35), '#FFFFFF', NV, 2.6) + k.yol(`M${x0} ${yb + 20} L${n1(tx)} ${n1(ty + 20)}`, 'none', '#D6E0EE', 6, 'stroke-opacity=".7"'); };
      s += P(['stereosil', 'merdiven'], () => sil(0) + sil(1) + sil(2));
      s += P(['merdiven'], v => v < .01 ? '' : k.yol(gYol([uc(0, Hh[0] + 20), uc(1, Hh[1] + 20), uc(2, Hh[2] + 20)].map(q => [q[0], q[1]]), false), 'none', R.mavi, 3, `stroke-dasharray="${k.W2(8)} ${k.W2(6)}"`));
      // uç bağlantıları: kısa stereosilin ucundan uzun komşunun yan yüzüne (alt yarı protokaderin 15, üst yarı kaderin 23)
      [0, 1].forEach(i => { const p0 = uc(i, Hh[i] + 2), p1 = uc(i + 1, Hh[i] + 54); p1[0] -= 23 * cy2; const m = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
        s += P(['uc_baglantisi', 'protokaderin_15'], () => k.yol(`M${n1(p0[0])} ${n1(p0[1])} L${n1(m[0])} ${n1(m[1])}`, 'none', anTur, 4.2));
        s += P(['uc_baglantisi', 'kaderin_23'], () => k.yol(`M${n1(m[0])} ${n1(m[1])} L${n1(p1[0])} ${n1(p1[1])}`, 'none', R.mavi, 4.2)); });
      // iyon kanalları: kısa ve orta stereosilin tepesinde; eğilmede açılır
      const acik = kis(eg * 3);
      [0, 1].forEach(i => { const [x, y] = uc(i, Hh[i] - 4);
        s += P(['iyon_kanali'], () => k.yol(gYol([[x - 15 - 4 * acik, y - 8], [x - 4 - 4 * acik, y - 8], [x - 4 - 4 * acik, y + 12], [x - 15 - 4 * acik, y + 12]], true, .2), '#7FB4EA', NV, 1.8)
          + k.yol(gYol([[x + 4 + 4 * acik, y - 8], [x + 15 + 4 * acik, y - 8], [x + 15 + 4 * acik, y + 12], [x + 4 + 4 * acik, y + 12]], true, .2), '#7FB4EA', NV, 1.8)); });
      // K+ girişi
      if (ay.iyon !== false && acik > .1) s += P(['potasyum'], () => [0, 1].map(i => { const [x, y] = uc(i, Hh[i]); let g = '';
        for (let j = 0; j < 3; j++) { const u = ((c.t * .6 + j / 3 + i * .17) % 1), yy = y - 90 + u * 120, op = acik * Math.sin(Math.PI * u);
          g += `<g opacity="${n1(op)}"><circle cx="${n1(x)}" cy="${n1(yy)}" r="12" fill="${anTur}" stroke="#FFFFFF" stroke-width="2"/>${c.yazi(x, yy + c.fs(5), 'K⁺', {px: 13, fw: 800, renk: '#FFFFFF'})}</g>`; }
        return g; }).join(''));
      if (Math.abs(eg) > .02) { const yn = eg > 0 ? 1 : -1; s += k.yol(`M${720 - 50 * yn} 90 L${720 + 50 * yn} 90`, 'none', R.mavi, 5) + okBasi(720 + 56 * yn, 90, yn > 0 ? 0 : Math.PI, k.w(14), R.mavi, k.w(5)); }
      return s; }};
};

// ---------------------------------------------------------------- dış tüy hücresi ve prestin: depolarizasyonda kısalır, hiperpolarizasyonda uzar (Brownell 1985; Zheng 2000)
// ayar.mod: "uclu" (varsayılan: hiperpolarizasyon, dinlenim, depolarizasyon yan yana) | "tek" (tek hücre, salınım: ayar.salinim true)
CIZ.dis_tuy_hucresi = (c, ay) => {
  const uclu = ay.mod !== 'tek', X = uclu ? [180, 450, 720] : [450], T0 = 196, yb = 540, dl = [-34, 0, 34];
  const ids = uclu ? ['hiperpolarizasyon', 'dinlenim', 'depolarizasyon'] : ['tuy_hucresi'];
  const a = uclu ? {hiperpolarizasyon: [180, 340], dinlenim: [450, 340], depolarizasyon: [720, 370], prestin: [482, 330], yan_duvar: [418, 260], stereosil: [450, 110], kutikuler_plaka: [480, 156],
    cekirdek: [450, 450], deiters_hucresi: [450, 560], tuy_hucresi: [450, 300]} : {tuy_hucresi: [450, 300], prestin: [482, 330], yan_duvar: [418, 260], stereosil: [450, 110], kutikuler_plaka: [480, 156], cekirdek: [450, 450], deiters_hucresi: [450, 560]};
  const takma = {prestin_molekulleri: 'prestin', stereosiller: 'stereosil', deiters: 'deiters_hucresi', kisalma: 'depolarizasyon', uzama: 'hiperpolarizasyon'};
  return {w: 900, h: 660, cm: 1.1, a: takmaAd(a, takma), takma,
    yer: {hiperpolarizasyon: 'sol', dinlenim: 'ust', depolarizasyon: 'sag', prestin: 'sag', yan_duvar: 'sol', stereosil: 'ust', kutikuler_plaka: 'sag', cekirdek: 'sag', deiters_hucresi: 'alt', tuy_hucresi: 'sag'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c);
      let s = '';
      X.forEach((x, i) => {
        const id = ids[i], b = uclu ? ekBas(c, (ay.cumleler || [])[i], .4 + i * .6) : .4, p = ilerle(c.t, b, 1);
        const dd = uclu ? dl[i] * p : (ay.salinim === false ? 0 : 26 * Math.sin(c.t * 2 * Math.PI * .6)), top = T0 + dd, w = 34;
        s += `<g opacity="${n1(uclu ? .35 + .65 * p : 1)}">`;
        s += P(['deiters_hucresi'], () => k.yol(gYol([[x - 30, 660], [x - 34, 580], [x - 40, yb - 6], [x - 30, yb - 18], [x + 30, yb - 18], [x + 40, yb - 6], [x + 34, 580], [x + 30, 660]], true, .3), CO.DESTEK, NV, 2));
        s += P([id, 'tuy_hucresi', 'yan_duvar'], () => k.yol(gYol([[x - w, top], [x + w, top], [x + w, yb - 30], [x + w - 6, yb - 6], [x, yb + 4], [x - w + 6, yb - 6], [x - w, yb - 30]], true, .25), '#FFFFFF', NV, 2.8));
        s += P(['kutikuler_plaka', id], () => k.yol(`M${x - w + 4} ${n1(top + 10)} L${x + w - 4} ${n1(top + 10)}`, 'none', '#B9C6D6', 9));
        s += P(['cekirdek', id], () => `<circle cx="${x}" cy="${yb - 44}" r="17" fill="${AR.cekirdek}"/>`);
        // prestin: yan duvar boyunca; depolarizasyonda sıkışık (küçük), hiperpolarizasyonda uzamış
        const m = uclu ? [1.35, 1, .7][i] : 1 - dd / 80, n = 15;
        s += P(['prestin', id], () => { let g = ''; for (let j = 0; j < n; j++) { const y = top + 36 + j * (yb - 76 - top) / (n - 1);
          [x - w + 7, x + w - 7].forEach(xx => g += `<ellipse cx="${xx}" cy="${n1(y)}" rx="${n1(4.4 / Math.sqrt(m))}" ry="${n1(5.2 * m)}" fill="${R.mavi}" stroke="${NV}" stroke-width="${k.W2(.9)}"/>`); } return g; });
        const t = tuyDemeti(k, x, top, {n: 3, ara: 12, w: 5, hmin: 22, hmax: 44, cz: 1.3});
        s += P(['stereosil', id], () => t.stereo);
        if (uclu && i !== 1 && p > .3) { const yuk = i === 0; s += k.yol(`M${x + 64} ${yuk ? 250 : 180} L${x + 64} ${yuk ? 172 : 250}`, 'none', R.mavi, 4.5) + okBasi(x + 64, yuk ? 166 : 256, yuk ? -Math.PI / 2 : Math.PI / 2, k.w(13), R.mavi, k.w(4.5)); }
        if (uclu) { const isr = [L('- hiperpolarizasyon', '- hyperpolarized'), L('dinlenim', 'rest'), L('+ depolarizasyon', '+ depolarized')][i], alt = [L('uzar', 'elongates'), '', L('kısalır', 'shortens')][i];
          s += c.yazi(x, 40, isr, {px: 20, fw: 800, renk: i === 2 ? R.mavi : R.lacivert}) + (alt ? c.yazi(x, 40 + c.fs(26), alt, {px: 18, fw: 600}) : ''); }
        s += '</g>';
      });
      return s; }};
};

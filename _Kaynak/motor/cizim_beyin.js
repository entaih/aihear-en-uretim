// AIHEAR Akademi: beyin, baş (üstten), iç kulak yolu dibi, kanal düzlemleri, beyin sapı (vestibüler) ve Östaki kasları çizimleri (2.11.2026).
// sahne.js, cizim_grafik.js ve cizim_anatomi.js'ten SONRA yüklenir. Referanslar: 12_Cizim_Taslaklari/NOTLAR.md ("Ek çizimler").

// ---------------------------------------------------------------- ortak: üstten bakılan baş (burun yukarıda; üstten bakışta hastanın SAĞ kulağı görüntünün SAĞINDA)
// döner: {bas, sag, sol} svg parçaları; (cx, cy) merkez, rx/ry yarıçaplar
function basUstten(k, cx, cy, rx = 120, ry = 150, o = {}) {
  const bas = k.yol(gYol([[cx, cy - ry], [cx + rx * .62, cy - ry * .86], [cx + rx * .96, cy - ry * .36], [cx + rx, cy + ry * .12], [cx + rx * .86, cy + ry * .62], [cx + rx * .48, cy + ry * .95],
    [cx, cy + ry], [cx - rx * .48, cy + ry * .95], [cx - rx * .86, cy + ry * .62], [cx - rx, cy + ry * .12], [cx - rx * .96, cy - ry * .36], [cx - rx * .62, cy - ry * .86]], true, .45), o.dolgu || AR.deri, NV, 2.6)
    + k.yol(gYol([[cx - rx * .13, cy - ry * .97], [cx, cy - ry * 1.13], [cx + rx * .13, cy - ry * .97]]), o.dolgu || AR.deri, NV, 2.4);
  const kulak = yn => k.yol(gYol([[cx + yn * rx * .97, cy - ry * .14], [cx + yn * rx * 1.14, cy - ry * .1], [cx + yn * rx * 1.18, cy + ry * .08], [cx + yn * rx * 1.1, cy + ry * .24], [cx + yn * rx * .96, cy + ry * .22]]), '#E3EBF5', NV, 2.4);
  return {bas, sag: kulak(1), sol: kulak(-1), sagN: [cx + rx * 1.12, cy + ry * .05], solN: [cx - rx * 1.12, cy + ry * .05]};
}

// ---------------------------------------------------------------- beynin yan görünüşü (sol yarıküre, ön solda; Gray 1918 Fig. 726, 728; insula ve opercula: Fig. 731)
// ayar: {loblar: true (lob renkleri), yarik_acik: true (lateral yarık açılır: Heschl girusu, planum temporale, insula), acilma_cumle, arkuat: true}
CIZ.beyin_yan = (c, ay) => {
  const OUT = [[78, 300], [92, 236], [130, 170], [196, 116], [290, 78], [400, 62], [510, 64], [620, 86], [720, 132], [800, 200], [842, 270], [850, 330], [832, 384], [790, 420], [720, 440],
    [640, 452], [600, 470], [520, 492], [420, 496], [330, 474], [272, 438], [248, 402], [256, 372], [230, 360], [176, 362], [120, 350], [88, 330]];
  const SYL = [[258, 370], [320, 352], [400, 336], [480, 322], [560, 306], [610, 290], [640, 262]], CEN = [[506, 66], [492, 120], [470, 180], [452, 240], [436, 296], [426, 328]];
  const STS = [[300, 420], [380, 404], [470, 390], [560, 372], [640, 348], [700, 316]];
  const sy = x => { for (let i = 0; i < SYL.length - 1; i++) { const p = SYL[i], q = SYL[i + 1]; if (x >= p[0] && x <= q[0]) return p[1] + (q[1] - p[1]) * (x - p[0]) / (q[0] - p[0]); } return SYL[SYL.length - 1][1]; };
  const a = {frontal_lob: [190, 230], parietal_lob: [620, 160], temporal_lob: [420, 450], oksipital_lob: [800, 320], beyincik: [720, 520], beyin_sapi: [580, 580], lateral_yarik: [330, 352],
    santral_yarik: [470, 180], superior_temporal_girus: [380, 380], heschl_girusu: [462, 334], planum_temporale: [566, 316], insula: [420, 300], wernicke_alani: [626, 330],
    broca_alani: [322, 306], arkuat_demet: [560, 222], isitme_korteksi: [462, 334]};
  const takma = {primer_isitme_korteksi: 'heschl_girusu', heschl: 'heschl_girusu', sylvius_yarigi: 'lateral_yarik', lateral_sulkus: 'lateral_yarik', santral_sulkus: 'santral_yarik',
    fasciculus_arcuatus: 'arkuat_demet', wernicke: 'wernicke_alani', broca: 'broca_alani', stg: 'superior_temporal_girus'};
  return {w: 900, h: 620, cm: 1.05, a: takmaAd(a, takma), takma, vurguEsle: {isitme_korteksi: 'heschl_girusu'},
    yer: {frontal_lob: 'sol', broca_alani: 'sol', lateral_yarik: 'sol', temporal_lob: 'alt', superior_temporal_girus: 'sol', insula: 'ust', heschl_girusu: 'ust', isitme_korteksi: 'ust', santral_yarik: 'ust',
      parietal_lob: 'ust', arkuat_demet: 'ust', planum_temporale: 'sag', wernicke_alani: 'sag', oksipital_lob: 'sag', beyincik: 'sag', beyin_sapi: 'sag'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c), cid = uid('by');
      let s = `<defs><clipPath id="${cid}"><path d="${gYol(OUT, true, .4)}"/></clipPath></defs>`;
      s += P(['beyin_sapi'], () => k.yol(gYol([[548, 452], [612, 446], [606, 520], [598, 610], [552, 610], [548, 520]], true, .3), '#EEF2F8', NV, 2.4));
      s += P(['beyincik'], () => k.yol(gElips(712, 486, 128, 62), '#EEF2F8', NV, 2.4) + [0, 1, 2, 3].map(i => k.yol(`M${600 + i * 8} ${470 + i * 14} C ${680} ${452 + i * 16} ${760} ${452 + i * 16} ${830 - i * 6} ${470 + i * 14}`, 'none', AR.ince, 1.4)).join(''));
      s += k.yol(gYol(OUT, true, .4), '#F6F3F6', NV, 2.8);
      // loblar (isteğe bağlı renkler; vurguda mavi)
      const lob = (id, pts, renk) => c.P(id, v => (ay.loblar || v > .01) ? `<path clip-path="url(#${cid})" d="${gPoly(pts)}" fill="${karis(ay.loblar ? renk : '#F6F3F6', '#B3D8FA', .85 * v)}" fill-opacity="${ay.loblar ? 1 : n1(v)}"/>` : '');
      s += lob('frontal_lob', [[0, 0], [506, 0]].concat(CEN, [[426, 328]], SYL.slice(0, 3).reverse().map(q => [q[0], q[1]]), [[0, 380]]), '#E6F1FD');
      s += lob('parietal_lob', [[506, 0], [760, 0], [760, 128], [735, 250], [700, 316], [640, 262], [610, 290], [560, 306], [480, 322], [426, 328]].concat(CEN.slice().reverse()), '#E8F6EF');
      s += lob('temporal_lob', SYL.concat([[700, 316], [722, 445], [700, 620], [200, 620], [200, 380]]), '#FFF4DC');
      s += lob('oksipital_lob', [[760, 0], [900, 0], [900, 620], [722, 445], [735, 250], [760, 128]], '#EEE9F8');
      if (ay.loblar) s += k.yol('M760 128 C 748 200 735 260 728 330 C 724 380 722 420 722 445', 'none', AR.ince, 1.6, `stroke-dasharray="${k.W2(7)} ${k.W2(6)}"`);
      // ikincil oluklar (soluk)
      [[[140, 200], [230, 158], [330, 136]], [[150, 282], [230, 262], [330, 270]], [[440, 74], [420, 150], [400, 230], [384, 300]], [[560, 74], [540, 150], [520, 230], [504, 300]],
        [[540, 196], [620, 188], [700, 220], [760, 270]], [[350, 462], [450, 452], [560, 432], [660, 412]], [[200, 250], [250, 210], [300, 196]]].forEach(q => s += k.yol(gYol(q), 'none', AR.ince, 1.6));
      s += P(['superior_temporal_girus'], v => v < .01 ? '' : `<path d="${gYol(SYL.slice(0, 6).concat(STS.slice(0, 5).reverse()), true, .3)}" fill="${R.mavi}" fill-opacity="${n1(.18 * v)}"/>`);
      s += k.yol(gYol(STS), 'none', AR.ince, 2);
      s += P(['santral_yarik'], () => k.yol(gYol(CEN), 'none', NV, 2.6));
      // Broca ve Wernicke alanları
      s += P(['broca_alani'], () => k.yol(gYol([[268, 322], [282, 292], [318, 276], [360, 282], [384, 304], [374, 330], [330, 342], [290, 340]], true, .4), '#FFE3A8', '#C98A1C', 2, 'fill-opacity=".85"'));
      s += P(['wernicke_alani'], () => k.yol(gYol([[560, 330], [600, 312], [642, 300], [676, 312], [668, 340], [624, 356], [578, 360], [556, 348]], true, .4), '#CFE6FB', R.mavi, 2, 'fill-opacity=".9"'));
      // lateral yarık: kapalı ya da açılmış (opercula ayrılır)
      const q = ay.yarik_acik ? ilerle(c.t, ekBas(c, ay.acilma_cumle, .5), 1.4) : 0;
      if (q > .01) {
        const tp = x => Math.max(0, Math.sin(Math.PI * kis((x - 262) / (645 - 262)))), xs = Array.from({length: 30}, (_, i) => 262 + (645 - 262) * i / 29);
        const ust = xs.map(x => [x, sy(x) - 66 * q * tp(x)]), alt = xs.map(x => [x, sy(x) + 30 * q * tp(x)]), orta = xs.map(x => [x, sy(x)]);
        s += P(['insula'], () => `<path d="${gYol(ust.concat(orta.slice().reverse()), true, .2)}" fill="#EDE4F0"/>` + [330, 380, 430].map(x => k.yol(`M${x} ${n1(sy(x) - 6)} L${x + 14} ${n1(sy(x) - 54 * q * tp(x))}`, 'none', '#B9A9C4', 1.6)).join(''));
        s += `<path d="${gYol(orta.concat(alt.slice().reverse()), true, .2)}" fill="#DCEBFA"/>`;
        s += P(['planum_temporale'], () => `<path d="${gYol([[506, sy(506) + 1], [600, sy(600) + 1], [626, sy(626) + 4], [600, sy(600) + 24 * q * tp(600)], [530, sy(530) + 28 * q * tp(530)]], true, .25)}" fill="#BFDDF8" stroke="${R.mavi}" stroke-width="${k.W2(1.4)}" stroke-dasharray="${k.W2(5)} ${k.W2(4)}"/>`);
        s += P(['heschl_girusu', 'isitme_korteksi'], () => `<g transform="rotate(-24 466 ${n1(sy(466) + 14 * q)})">` + k.yol(gElips(466, sy(466) + 14 * q, 44, 11 * q + 2), '#8CC4F2', NV, 2) + '</g>');
        s += k.yol(gYol(ust), 'none', NV, 2.8) + k.yol(gYol(alt), 'none', NV, 2.8);
      } else {
        s += P(['isitme_korteksi', 'heschl_girusu'], v => k.yol(gElips(462, 333, 46, 9), v > .01 ? '#CFE6FB' : 'none', v > .01 ? R.mavi : AR.ince, 1.8, `stroke-dasharray="${k.W2(5)} ${k.W2(4)}"`));
      }
      s += P(['lateral_yarik'], () => k.yol(gYol(SYL), 'none', NV, q > .01 ? 1.2 : 3));
      // arkuat demet (Wernicke - Broca bağlantısı)
      if (ay.arkuat || c.v.arkuat_demet || c.etiketli.has('arkuat_demet')) { const p = ilerle(c.t, ekBas(c, ay.arkuat_cumle, .6), 1.2);
        s += P(['arkuat_demet'], () => `<path d="M618 318 C 690 270 660 214 560 214 C 460 214 390 254 336 296" fill="none" stroke="${R.sari}" stroke-width="${k.W2(12)}" stroke-linecap="round" opacity=".55" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${n1(1 - p)}"/>`
          + (p > .95 ? okBasi(336, 296, Math.atan2(296 - 254, 336 - 390), k.w(16), '#C98A1C', k.w(4)) + okBasi(618, 318, Math.atan2(318 - 270, 618 - 690), k.w(16), '#C98A1C', k.w(4)) : '')); }
      if (ay.yonler !== false) s += c.yazi(40, 40, L('Sol yarıküre', 'Left hemisphere'), {a: 'start', px: 19, fw: 700, renk: R.soluk}) + c.yazi(70, 610, L('← ÖN', '← ANT'), {a: 'start', px: 17, fw: 800, renk: R.soluk});
      return s; }};
};

// ---------------------------------------------------------------- beyin üstten (şematik yatay kesit, ön yukarıda): corpus callosum ve dikotik dinleme (Kimura'nın yapısal modeli)
// ayar: {mod: "dikotik" (varsayılan) | "kallozal", sozcukler: ["yedi", "dört"] (sağ, sol kulak), yol_cumleleri: {capraz_yol_sag, capraz_yol_sol, kallozal_yol, ayni_taraf_yol}}
CIZ.beyin_ustten = (c, ay) => {
  const cx = 450, cy = 330, dik = ay.mod !== 'kallozal', ACs = [300, 380], ACd = [600, 380];
  const a = {sag_kulak: [714, 340], sol_kulak: [186, 340], sol_yarikure: [300, 200], sag_yarikure: [600, 200], sol_isitme_korteksi: ACs, sag_isitme_korteksi: ACd, isitme_korteksi: ACs,
    corpus_callosum: [cx, 250], arka_bolum: [cx, 470], capraz_yol_sag: [560, 418], capraz_yol_sol: [340, 436], ayni_taraf_yol: [660, 362], kallozal_yol: [cx, 496], sozcuk_sag: [780, 250], sozcuk_sol: [120, 250],
    beyin_sapi: [cx, 420]};
  const takma = {splenium: 'arka_bolum', nasirli_cisim: 'corpus_callosum', sag_kulak_yolu: 'capraz_yol_sag', sol_kulak_yolu: 'capraz_yol_sol', ipsilateral_yol: 'ayni_taraf_yol', korpus_kallozum: 'corpus_callosum'};
  return {w: 900, h: 640, cm: 1.05, a: takmaAd(a, takma), takma, vurguEsle: {isitme_korteksi: 'sag_isitme_korteksi'},
    yer: {sag_kulak: 'sag', sozcuk_sag: 'sag', sag_yarikure: 'sag', sag_isitme_korteksi: 'sag', ayni_taraf_yol: 'sag', capraz_yol_sag: 'alt', sol_kulak: 'sol', sozcuk_sol: 'sol', sol_yarikure: 'sol',
      sol_isitme_korteksi: 'sol', isitme_korteksi: 'sol', capraz_yol_sol: 'alt', corpus_callosum: 'ust', arka_bolum: 'alt', kallozal_yol: 'alt', beyin_sapi: 'alt'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c), B = basUstten(k, cx, cy, 250, 290, {dolgu: '#F7F4F2'});
      const ac = (id, x, y, a2) => P([id, 'isitme_korteksi'], () => `<g transform="rotate(${a2} ${x} ${y})">${k.yol(gElips(x, y, 44, 22), '#BFDDF8', R.mavi, 2.2)}</g>`);
      let s = B.bas + P(['sag_kulak'], () => B.sag) + P(['sol_kulak'], () => B.sol);
      const yk = sag => { const m = sag ? 1 : -1; return [[cx + m * 8, 92], [cx + m * 120, 104], [cx + m * 200, 170], [cx + m * 226, 280], [cx + m * 214, 400], [cx + m * 170, 500], [cx + m * 90, 560], [cx + m * 8, 566]]; };
      s += P(['sol_yarikure'], () => k.yol(gYol(yk(false), true, .4), '#F3EEF3', NV, 2.4)) + P(['sag_yarikure'], () => k.yol(gYol(yk(true), true, .4), '#F3EEF3', NV, 2.4));
      [-1, 1].forEach(m => s += k.yol(gYol([[cx + m * 214, 300], [cx + m * 160, 330], [cx + m * 128, 380]]), 'none', AR.ince, 1.8));
      // corpus callosum: orta hatta, yarıküreleri bağlar; arka bölüm (splenium) ayrı parça
      s += P(['corpus_callosum'], () => k.yol(gYol([[cx - 70, 196], [cx - 30, 176], [cx + 30, 176], [cx + 70, 196], [cx + 22, 214], [cx + 18, 440], [cx - 18, 440], [cx - 22, 214]], true, .3), '#E4D8E6', NV, 2));
      s += P(['arka_bolum', 'corpus_callosum'], () => k.yol(gYol([[cx - 26, 430], [cx + 26, 430], [cx + 84, 470], [cx + 50, 496], [cx - 50, 496], [cx - 84, 470]], true, .35), '#D6C6DA', NV, 2));
      s += ac('sol_isitme_korteksi', ACs[0], ACs[1], 32) + ac('sag_isitme_korteksi', ACd[0], ACd[1], -32);
      s += P(['beyin_sapi'], () => k.yol(gElips(cx, 420, 30, 20), '#EEF2F8', NV, 1.8));
      const yc = ay.yol_cumleleri || {};
      const yol = (id, d, renk, kal, gec, o = {}) => { const p = ilerle(c.t, ekBas(c, yc[id], gec), 1.2); if (p <= 0) return '';
        return P([id], v => `<path d="${d}" fill="none" stroke="${karis(renk, R.mavi, v * .3)}" stroke-width="${k.W2(kal + 2 * v)}" stroke-linecap="round" ${o.kesik ? `stroke-dasharray="${k.W2(9)} ${k.W2(8)}" opacity="${n1(p * .8)}"` : `pathLength="1" stroke-dasharray="1" stroke-dashoffset="${n1(1 - p)}"`}/>`
          + (p > .97 && o.uc ? okBasi(o.uc[0], o.uc[1], o.uc[2], k.w(14), renk, k.w(kal * .8)) : '')); };
      if (dik) {
        s += yol('ayni_taraf_yol', `M${B.sagN[0] - 18} ${B.sagN[1]} C 650 350 630 360 ${ACd[0] + 30} ${ACd[1] - 4}`, R.sag_kulak, 3, 1.2, {kesik: true})
          + yol('ayni_taraf_yol', `M${B.solN[0] + 18} ${B.solN[1]} C 250 350 270 360 ${ACs[0] - 30} ${ACs[1] - 4}`, R.sol_kulak, 3, 1.4, {kesik: true});
        s += yol('capraz_yol_sag', `M${B.sagN[0] - 18} ${B.sagN[1]} C 640 400 540 420 ${cx} 420 C 380 420 330 410 ${ACs[0] + 26} ${ACs[1] + 14}`, R.sag_kulak, 6, .6, {uc: [ACs[0] + 26, ACs[1] + 14, Math.PI + .5]});
        s += yol('capraz_yol_sol', `M${B.solN[0] + 18} ${B.solN[1]} C 260 420 360 440 ${cx} 440 C 520 440 570 420 ${ACd[0] - 26} ${ACd[1] + 14}`, R.sol_kulak, 6, .9, {uc: [ACd[0] - 26, ACd[1] + 14, -.5]});
      }
      s += yol('kallozal_yol', `M${ACd[0] - 20} ${ACd[1] + 20} C 560 470 520 482 ${cx} 482 C 380 482 340 470 ${ACs[0] + 20} ${ACs[1] + 20}`, dik ? R.sol_kulak : R.mavi, 5, dik ? 1.6 : .6, {uc: [ACs[0] + 20, ACs[1] + 20, Math.PI + .9]});
      if (!dik) s += [-1, 1].map(m => k.yol(`M${cx + m * 20} 210 C ${cx + m * 90} 214 ${cx + m * 160} 240 ${cx + m * 190} 280`, 'none', '#B9A9C4', 2.4)).join('');
      // sözcük balonları
      if (dik) { const sz = ay.sozcukler || [L('yedi', 'seven'), L('dört', 'four')];
        const balon = (id, x, y, m, renk) => P([id], () => k.yol(gYol([[x - 70, y - 30], [x + 70, y - 30], [x + 78, y - 22], [x + 78, y + 22], [x + 70, y + 30], [x - 6 * m + 18 * m, y + 30], [x - 30 * m, y + 58], [x - 20 * m, y + 30], [x - 70, y + 30], [x - 78, y + 22], [x - 78, y - 22]], true, .15), '#FFFFFF', renk, 2.6)
          + c.yazi(x, y + c.fs(8), sz[id === 'sozcuk_sag' ? 0 : 1] || '', {px: 22, fw: 800, ff: 'Outfit', renk}));
        s += balon('sozcuk_sag', 790, 236, 1, R.sag_kulak) + balon('sozcuk_sol', 110, 236, -1, R.sol_kulak); }
      if (ay.yonler !== false) s += c.yazi(40, 30, L('↑ ÖN', '↑ ANT'), {a: 'start', px: 17, fw: 800, renk: R.soluk}) + c.yazi(840, 620, L('Sağ', 'Right'), {a: 'end', px: 18, fw: 700, renk: R.sag_kulak}) + c.yazi(60, 620, L('Sol', 'Left'), {a: 'start', px: 18, fw: 700, renk: R.sol_kulak});
      return s; }};
};

// ---------------------------------------------------------------- yarım daire kanallarının düzlemleri (baş üstten): lateral çift, LARP, RALP; isteğe bağlı baş dönüşü (Dix-Hallpike)
// Ön kanal düzlemi orta hatla ~45 derece öne-dışa, arka kanal ~45 derece arkaya-dışa açılır; sol ön ile sağ arka (LARP), sağ ön ile sol arka (RALP) paralel.
// ayar: {donus: 45 (+: baş sağa döner), donus_cumle, goster: ["lateral","larp","ralp"], cift_cumleleri: {lateral, larp, ralp}}
CIZ.kanal_duzlemleri = (c, ay) => {
  const cx = 450, cy = 330, dn = ay.donus || 0;
  const KN = {sol_on_kanal: [cx - 112, cy - 46, 1], sag_arka_kanal: [cx + 112, cy + 40, 1], sag_on_kanal: [cx + 112, cy - 46, -1], sol_arka_kanal: [cx - 112, cy + 40, -1]};
  const LT = {sol_lateral_kanal: [cx - 148, cy - 4], sag_lateral_kanal: [cx + 148, cy - 4]};
  const rot = (p, aci) => { const r = aci * Math.PI / 180, dx = p[0] - cx, dy = p[1] - cy; return [cx + dx * Math.cos(r) - dy * Math.sin(r), cy + dx * Math.sin(r) + dy * Math.cos(r)]; };
  const a = {}; Object.entries(KN).forEach(([kk, v]) => a[kk] = rot([v[0], v[1]], dn)); Object.entries(LT).forEach(([kk, v]) => a[kk] = rot(v, dn));
  Object.assign(a, {larp: rot([cx - 40, cy - 120], dn), ralp: rot([cx + 40, cy - 120], dn), lateral_cift: rot([cx, cy - 4], dn), bas: [cx, cy + 170], hareket_duzlemi: [rot(KN.sag_arka_kanal, dn)[0], 600], donus: [cx, 40]});
  const takma = {sol_superior_kanal: 'sol_on_kanal', sag_superior_kanal: 'sag_on_kanal', sol_posterior_kanal: 'sol_arka_kanal', sag_posterior_kanal: 'sag_arka_kanal', lateral_kanallar: 'lateral_cift'};
  return {w: 900, h: 640, cm: 1.05, kirp: true, a: takmaAd(a, takma), takma,
    yer: {sol_on_kanal: 'sol', sol_arka_kanal: 'sol', sol_lateral_kanal: 'sol', sag_on_kanal: 'sag', sag_arka_kanal: 'sag', sag_lateral_kanal: 'sag', larp: 'ust', ralp: 'ust', lateral_cift: 'alt', bas: 'alt', hareket_duzlemi: 'alt', donus: 'ust'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c), aci = dn * ilerle(c.t, ekBas(c, ay.donus_cumle, .6), 1.6), B = basUstten(k, cx, cy, 200, 250, {dolgu: '#F7F4F2'});
      const gos = ay.goster || ['lateral', 'larp', 'ralp'], cc = ay.cift_cumleleri || {}, renk = {lateral: R.mavi, larp: R.sari, ralp: R.basari};
      const op = id => gos.includes(id) ? ilerle(c.t, ekBas(c, cc[id], .5 + ['lateral', 'larp', 'ralp'].indexOf(id) * .4), .7) : 0;
      let g = B.bas + B.sag + B.sol;
      // düzlem çizgileri (eş kanallar paralel)
      const uzun = (p, yon, rn, o, id) => { const d = [Math.SQRT1_2 * yon, Math.SQRT1_2], L2 = 330; return o <= 0 ? '' : c.P(id, v => `<path d="M${n1(p[0] - d[0] * L2)} ${n1(p[1] - d[1] * L2)} L${n1(p[0] + d[0] * L2)} ${n1(p[1] + d[1] * L2)}" stroke="${rn}" stroke-width="${k.W2(2.6 + 2 * v)}" stroke-dasharray="${k.W2(12)} ${k.W2(9)}" opacity="${n1(o * .85)}"/>`); };
      g += uzun(KN.sol_on_kanal, 1, renk.larp, op('larp'), 'larp') + uzun(KN.sag_arka_kanal, 1, renk.larp, op('larp'), 'larp');
      g += uzun(KN.sag_on_kanal, -1, renk.ralp, op('ralp'), 'ralp') + uzun(KN.sol_arka_kanal, -1, renk.ralp, op('ralp'), 'ralp');
      if (op('lateral') > 0) g += c.P('lateral_cift', v => `<path d="M${LT.sol_lateral_kanal[0]} ${cy - 4} L${LT.sag_lateral_kanal[0]} ${cy - 4}" stroke="${renk.lateral}" stroke-width="${k.W2(2.6 + 2 * v)}" stroke-dasharray="${k.W2(12)} ${k.W2(9)}" opacity="${n1(op('lateral') * .85)}"/>`);
      // kanallar: dikey kanallar düzlem çizgisi gibi kalın çubuk, lateral kanal halka
      Object.entries(KN).forEach(([id, [x, y, yon]]) => { const cift = (id === 'sol_on_kanal' || id === 'sag_arka_kanal') ? 'larp' : 'ralp', rn = gos.includes(cift) ? renk[cift] : '#9AABC2', d = [Math.SQRT1_2 * yon * 34, Math.SQRT1_2 * 34];
        g += P([id, cift], () => k.boru(`M${n1(x - d[0])} ${n1(y - d[1])} L${n1(x + d[0])} ${n1(y + d[1])}`, k.w(10), karis(rn, '#FFFFFF', .35), NV, 1.8)); });
      Object.entries(LT).forEach(([id, [x, y]]) => g += P([id, 'lateral_cift'], () => k.yol(gElips(x, y, 26, 17), 'none', NV, 9) + k.yol(gElips(x, y, 26, 17), 'none', karis(gos.includes('lateral') ? renk.lateral : '#9AABC2', '#FFFFFF', .35), 5)));
      g += [-1, 1].map(m => k.yol(gElips(cx + m * 126, cy - 4, 14, 12), '#DCEAF8', NV, 1.8)).join('');
      let s = `<g transform="rotate(${n1(aci)} ${cx} ${cy})">${P(['bas'], () => '')}${g}</g>`;
      if (dn) { const p = ilerle(c.t, ekBas(c, ay.donus_cumle, .6), 1.6), sp = rot(KN.sag_arka_kanal, aci);
        s += P(['donus'], () => `<g opacity="${n1(kis(p * 3))}"><path d="M${cx - 60} 60 A 130 130 0 0 1 ${cx + 60} 60" fill="none" stroke="${R.mavi}" stroke-width="${k.W2(4)}"/>${okBasi(cx + 62, 62, .5, k.w(14), R.mavi, k.w(4))}</g>` + c.yazi(cx, 44, `${Math.abs(dn)}°`, {px: 20, fw: 800, renk: R.mavi, ek: `opacity="${n1(p)}"`}));
        s += P(['hareket_duzlemi'], () => `<path d="M${n1(sp[0])} 40 L${n1(sp[0])} 620" stroke="${R.lacivert}" stroke-width="${k.W2(2.4)}" stroke-dasharray="${k.W2(4)} ${k.W2(7)}" opacity="${n1(p)}"/>`); }
      if (ay.yonler !== false) s += c.yazi(820, 620, L('Sağ', 'Right'), {a: 'end', px: 18, fw: 700, renk: R.sag_kulak}) + c.yazi(80, 620, L('Sol', 'Left'), {a: 'start', px: 18, fw: 700, renk: R.sol_kulak});
      return s; }};
};

// ---------------------------------------------------------------- iç kulak yolu dibi (sağ, medialden bakış: ön solda; Gray 1918 Fig. 140, Testut)
// Transvers krista (crista falciformis) üst ve alt; dikey krista (Bill's bar) üst yarıyı ön ve arka böler. Ön üst: fasiyal sinir (ve n. intermedius),
// ön alt: koklear sinir (tractus spiralis foraminosus), arka üst: üst vestibüler sinir, arka alt: alt vestibüler sinir (ve foramen singulare).
CIZ.ic_kulak_yolu_dibi = (c, ay) => {
  const C = [400, 300], R0 = 232, sn = ay.sinirler !== false;
  const a = {fasiyal_sinir: [292, 186], intermedius: [342, 236], koklear_sinir: [300, 408], ust_vestibuler_sinir: [512, 186], alt_vestibuler_sinir: [508, 404], transvers_krista: [620, 300],
    dikey_krista: [400, 96], labirent_arteri: [372, 318], foramen_singulare: [592, 458], ic_kulak_yolu: [C[0] - R0 * .76, C[1] + R0 * .7], traktus_spiralis: [300, 408]};
  const takma = {crista_falciformis: 'transvers_krista', bills_bar: 'dikey_krista', nervus_intermedius: 'intermedius', vestibuler_sinir: 'ust_vestibuler_sinir', fundus: 'ic_kulak_yolu'};
  return {w: 800, h: 600, cm: 1.1, a: takmaAd(a, takma), takma, vurguEsle: {vestibuler_sinir: 'alt_vestibuler_sinir'},
    yer: {fasiyal_sinir: 'sol', intermedius: 'sol', koklear_sinir: 'sol', traktus_spiralis: 'sol', labirent_arteri: 'sol', ic_kulak_yolu: 'sol', ust_vestibuler_sinir: 'sag', alt_vestibuler_sinir: 'sag',
      transvers_krista: 'sag', foramen_singulare: 'sag', dikey_krista: 'ust'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c);
      let s = P(['ic_kulak_yolu'], () => k.yol(gElips(C[0], C[1], R0 + 26, R0 + 26), AR.kemik, NV, 2.4) + k.yol(gElips(C[0], C[1], R0, R0), '#F2F5FA', NV, 2.6));
      // delikler (kemik dip)
      const delik = (x, y, r) => k.yol(gElips(x, y, r, r), '#6F84A2', NV, 1.4);
      s += P(['fasiyal_sinir'], () => k.yol(gElips(292, 186, 46, 44), '#6F84A2', NV, 2));
      s += P(['ust_vestibuler_sinir'], () => { let g = ''; const r = ekRast(2); for (let i = 0; i < 16; i++) { const t = r() * 2 * Math.PI, rr = Math.sqrt(r()) * 50; g += delik(512 + rr * Math.cos(t), 192 + rr * Math.sin(t), 4 + r() * 3); } return g; });
      s += P(['alt_vestibuler_sinir'], () => { let g = ''; const r = ekRast(6); for (let i = 0; i < 12; i++) { const t = r() * 2 * Math.PI, rr = Math.sqrt(r()) * 44; g += delik(508 + rr * Math.cos(t), 400 + rr * Math.sin(t), 4 + r() * 3); } return g; });
      s += P(['koklear_sinir', 'traktus_spiralis'], () => { let g = ''; for (let i = 0; i < 46; i++) { const t = i * .52, rr = 10 + i * 1.52; g += delik(300 + rr * Math.cos(t), 408 + rr * Math.sin(t), 3.6); } return g; });
      s += P(['foramen_singulare', 'alt_vestibuler_sinir'], () => k.yol(gElips(592, 458, 11, 11), '#6F84A2', NV, 1.8));
      // kristalar
      s += P(['transvers_krista'], () => k.boru(`M${C[0] - R0 + 8} 296 C 300 290 500 290 ${C[0] + R0 - 8} 296`, k.w(20), '#D6E0EE', NV, 2));
      s += P(['dikey_krista'], () => k.boru(`M${C[0]} ${C[1] - R0 + 14} L${C[0]} 284`, k.w(15), '#D6E0EE', NV, 2));
      // sinir kesitleri
      if (sn) { const p = ilerle(c.t, ekBas(c, ay.sinir_cumle, .5), .8);
        s += `<g opacity="${n1(p)}">` + P(['fasiyal_sinir'], () => k.yol(gElips(292, 186, 38, 36), AR.sinir, AR.sinir_c, 2.2))
          + P(['intermedius', 'fasiyal_sinir'], () => k.yol(gElips(342, 234, 14, 13), '#FFE2A6', AR.sinir_c, 1.8))
          + P(['ust_vestibuler_sinir'], () => k.yol(gElips(512, 192, 52, 48), '#FFE7B8', AR.sinir_c, 2.2, 'fill-opacity=".85"'))
          + P(['alt_vestibuler_sinir'], () => k.yol(gElips(508, 400, 46, 42), '#FFE7B8', AR.sinir_c, 2.2, 'fill-opacity=".85"'))
          + P(['koklear_sinir'], () => k.yol(gElips(300, 408, 76, 70), '#FFE7B8', AR.sinir_c, 2.4, 'fill-opacity=".8"'))
          + P(['labirent_arteri'], () => k.yol(gElips(372, 320, 11, 11), '#F2A3A6', R.sag_kulak, 2)) + '</g>'; }
      if (ay.yonler !== false) s += c.yazi(40, 40, L('← ÖN', '← ANT'), {a: 'start', px: 17, fw: 800, renk: R.soluk}) + c.yazi(760, 40, L('ARKA →', 'POST →'), {a: 'end', px: 17, fw: 800, renk: R.soluk})
        + c.yazi(C[0], 26, L('ÜST', 'SUP'), {px: 17, fw: 800, renk: R.soluk}) + c.yazi(C[0], 590, L('ALT', 'INF'), {px: 17, fw: 800, renk: R.soluk});
      return s; }};
};

// ---------------------------------------------------------------- beyin sapı: vestibüler çekirdekler, MLF, III, IV, VI çekirdekleri ve beyincik bağlantısı (şematik, dorsal bakış)
// Kaynak: standart ders kitabı tarifi (Purves, Neuroscience, vestibüler yollar; Leigh ve Zee, The Neurology of Eye Movements).
CIZ.beyin_sapi_vestibuler = (c, ay) => {
  const cx = 450;
  const a = {orta_beyin: [cx + 120, 120], pons: [cx + 160, 290], medulla: [cx + 110, 470], okulomotor_cekirdek: [cx - 50, 112], troklear_cekirdek: [cx - 50, 186], abdusens_cekirdek: [cx - 62, 290],
    vestibuler_cekirdekler: [cx - 130, 376], mlf: [cx - 18, 240], beyincik: [190, 540], beyincik_baglantisi: [cx - 196, 470], vestibuler_sinir: [150, 380], scarpa_ganglionu: [212, 380], labirent: [66, 360]};
  const takma = {iii: 'okulomotor_cekirdek', iv: 'troklear_cekirdek', vi: 'abdusens_cekirdek', medial_longitudinal_fasikulus: 'mlf', vestibuler_ganglion: 'scarpa_ganglionu', serebellum: 'beyincik'};
  return {w: 900, h: 640, cm: 1.1, a: takmaAd(a, takma), takma,
    yer: {orta_beyin: 'sag', pons: 'sag', medulla: 'sag', okulomotor_cekirdek: 'sol', troklear_cekirdek: 'sol', abdusens_cekirdek: 'sol', vestibuler_cekirdekler: 'sol', mlf: 'ust', beyincik: 'sol',
      beyincik_baglantisi: 'sol', vestibuler_sinir: 'sol', scarpa_ganglionu: 'ust', labirent: 'sol'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c);
      // beyincik: iki yarıküre, beyin sapının arkasında (alt yanlarda)
      let s = P(['beyincik'], () => [-1, 1].map(m => k.yol(gElips(cx + m * 200, 528, 170, 96), '#EEF2F8', NV, 2.2)
        + [0, 1, 2, 3].map(i => k.yol(`M${cx + m * 60} ${470 + i * 26} C ${cx + m * 150} ${458 + i * 26} ${cx + m * 260} ${462 + i * 26} ${cx + m * 350} ${488 + i * 18}`, 'none', AR.ince, 1.4)).join('')).join(''));
      const GV = [[cx - 130, 56], [cx + 130, 56], [cx + 136, 196], [cx + 176, 240], [cx + 184, 350], [cx + 136, 400], [cx + 112, 630], [cx - 112, 630], [cx - 136, 400], [cx - 184, 350], [cx - 176, 240], [cx - 136, 196]];
      s += k.yol(gYol(GV, true, .3), '#F6F3F6', NV, 2.6);
      const bolge = (id, d) => P([id], v => v < .01 ? '' : `<path d="${d}" fill="${R.mavi}" fill-opacity="${n1(.15 * v)}"/>`);
      s += bolge('orta_beyin', `M${cx - 134} 60 L${cx + 134} 60 L${cx + 140} 208 L${cx - 140} 208Z`) + bolge('pons', `M${cx - 166} 216 L${cx + 166} 216 L${cx + 182} 376 L${cx - 182} 376Z`)
        + bolge('medulla', `M${cx - 134} 392 L${cx + 134} 392 L${cx + 112} 626 L${cx - 112} 626Z`);
      s += k.yol(`M${cx - 140} 212 L${cx + 140} 212 M${cx - 170} 386 L${cx + 170} 386`, 'none', AR.ince, 1.6, `stroke-dasharray="${k.W2(7)} ${k.W2(6)}"`) + k.yol(`M${cx} 60 L${cx} 626`, 'none', AR.ince, 1.2);
      if (ay.duzey_adlari !== false) s += c.yazi(cx - 124, 82, L('orta beyin', 'midbrain'), {a: 'start', px: 15, fw: 700, renk: R.soluk}) + c.yazi(cx - 160, 236, 'pons', {a: 'start', px: 15, fw: 700, renk: R.soluk})
        + c.yazi(cx - 120, 412, 'medulla', {a: 'start', px: 15, fw: 700, renk: R.soluk});
      s += P(['mlf'], () => [-18, 18].map(dx => k.yol(`M${cx + dx} 470 L${cx + dx} 96`, 'none', '#7FB4EA', 8) + okBasi(cx + dx, 90, -Math.PI / 2, k.w(13), '#4D8FD1', k.w(4))).join(''));
      const ck = (id, x, y, rx2, ry2, rm) => P([id], () => [-1, 1].map(m => k.yol(gElips(cx + m * x, y, rx2, ry2), '#FFFFFF', NV, 2.2) + (c.etiketli.has(id) ? '' : c.yazi(cx + m * x, y + c.fs(6), rm, {px: 16, fw: 800, renk: R.lacivert}))).join(''));
      s += ck('okulomotor_cekirdek', 56, 112, 26, 18, 'III') + ck('troklear_cekirdek', 54, 186, 24, 16, 'IV') + ck('abdusens_cekirdek', 68, 290, 24, 17, 'VI');
      s += P(['vestibuler_cekirdekler'], () => [-1, 1].map(m => [[110, 344, 22, 16], [150, 370, 22, 17], [100, 386, 22, 17], [138, 414, 21, 18]].map(([x, y, rx2, ry2]) => k.yol(gElips(cx + m * x, y, rx2, ry2), '#CFE6FB', R.mavi, 2)).join('')).join(''));
      s += P(['mlf', 'vestibuler_cekirdekler'], () => [-1, 1].map(m => k.yol(`M${cx + m * 100} 386 C ${cx + m * 60} 372 ${cx - m * 6} 350 ${cx - m * 18} 330`, 'none', '#4D8FD1', 2.8)
        + k.yol(`M${cx + m * 110} 344 C ${cx + m * 70} 330 ${cx + m * 30} 318 ${cx + m * 18} 306`, 'none', '#4D8FD1', 2.8)).join(''));
      s += [-1, 1].map(m => P(['labirent'], () => { const x = cx + m * 384; return k.yol(gElips(x, 340, 28, 28), 'none', NV, 7) + k.yol(gElips(x, 340, 28, 28), 'none', AR.sivi, 3.4) + k.yol(gElips(x + 16 * m, 380, 22, 17), AR.sivi, NV, 2); })
        + P(['vestibuler_sinir'], () => k.boru(`M${cx + m * 360} 382 C ${cx + m * 300} 382 ${cx + m * 220} 378 ${cx + m * 166} 374`, k.w(13), AR.sinir, AR.sinir_c, 1.6))
        + P(['scarpa_ganglionu', 'vestibuler_sinir'], () => k.yol(gElips(cx + m * 262, 378, 26, 16), AR.sinir, AR.sinir_c, 2))).join('');
      s += P(['beyincik_baglantisi'], () => [-1, 1].map(m => k.yol(`M${cx + m * 214} 380 C ${cx + m * 220} 420 ${cx + m * 228} 450 ${cx + m * 222} 488`, 'none', '#5E6F88', 3, `stroke-dasharray="${k.W2(8)} ${k.W2(6)}"`)
        + okBasi(cx + m * 222, 492, Math.PI / 2, k.w(12), '#5E6F88', k.w(3)) + k.yol(`M${cx + m * 146} 428 C ${cx + m * 160} 456 ${cx + m * 176} 474 ${cx + m * 186} 494`, 'none', '#5E6F88', 3)).join(''));
      return s; }};
};

// ---------------------------------------------------------------- Östaki borusu kıkırdak bölümü kesiti, tensor ve levator veli palatini (Gray 1918 Fig. 1028 ve "The Auditory Tube" metni)
// Medial solda, lateral sağda. Kıkırdak ters J (geniş medial lamina, küçük lateral kanca); lümen dinlenimde kapalı yarık; tensor veli palatini lateral
// zar duvara ve kancaya tutunur, pterygoid hamulus çevresinden döner; levator veli palatini lümenin altında. ayar: {acilma: 0..1, acilma_cumle}
CIZ.ostaki_kaslari = (c, ay) => {
  const a = {kikirdak: [262, 220], ostaki_borusu: [372, 250], lumen: [372, 250], tensor_veli_palatini: [520, 300], levator_veli_palatini: [338, 404], hamulus: [522, 470], yumusak_damak: [300, 528],
    membranoz_duvar: [446, 300], kafa_tabani: [430, 70]};
  const takma = {tuba_kikirdagi: 'kikirdak', tvp: 'tensor_veli_palatini', lvp: 'levator_veli_palatini', damak: 'yumusak_damak', pterygoid_hamulus: 'hamulus'};
  return {w: 820, h: 580, cm: 1.1, a: takmaAd(a, takma), takma,
    yer: {kikirdak: 'sol', ostaki_borusu: 'sol', lumen: 'sol', levator_veli_palatini: 'sol', yumusak_damak: 'sol', kafa_tabani: 'ust', tensor_veli_palatini: 'sag', hamulus: 'sag', membranoz_duvar: 'sag'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c), q = (ay.acilma ?? 0) * ilerle(c.t, ekBas(c, ay.acilma_cumle, .8), 1.2) + (ay.salinim ? .5 + .5 * Math.sin(c.t * 2) : 0) * (ay.acilma ? 0 : 1);
      let s = P(['kafa_tabani'], () => k.yol('M0 40 L820 40 L820 110 C 700 104 600 112 500 108 C 400 104 300 112 0 104 Z', AR.kemik, NV, 2.4));
      s += P(['yumusak_damak'], () => k.yol(gYol([[60, 520], [200, 506], [360, 504], [520, 510], [640, 520], [640, 552], [520, 548], [360, 544], [200, 548], [60, 556]], true, .3), AR.doku, NV, 2.2));
      // levator veli palatini (lümenin altında, damağa iner)
      s += P(['levator_veli_palatini'], () => k.yol(gYol([[300, 380], [336, 366], [374, 378], [380, 420], [366, 470], [340, 508], [316, 500], [304, 452]], true, .35), AR.kas, AR.kas_c, 2) + k.yol(gYol([[326, 390], [340, 440], [334, 492]]), 'none', AR.kas_c, 1.2, 'stroke-opacity=".6"'));
      // kıkırdak: medial lamina ve lateral kanca
      const KK2 = [[230, 112], [400, 112], [440, 124], [452, 150], [446, 186], [430, 196], [420, 170], [404, 150], [330, 146], [296, 160], [292, 250], [298, 330], [276, 346], [246, 330], [232, 250]];
      s += P(['kikirdak'], () => k.yol(gYol(KK2, true, .25), AR.kik, NV, 2.4));
      // lümen: dinlenimde kapalı yarık; açılınca lateral duvar dışa çekilir
      const L0 = [[316, 162], [336, 156], [372, 160], [400, 168], [412, 184]], lx = 18 + 36 * q;
      const lumen = L0.concat([[414 + lx * .5, 230], [404 + lx, 290], [380 + lx * .8, 340], [350, 344], [326, 320], [318, 250]]);
      s += P(['lumen', 'ostaki_borusu'], () => k.yol(gYol(lumen, true, .35), '#FFFFFF', '#C9876A', 2));
      // membranöz (lateral) duvar ve tensor veli palatini
      const MD = [[430, 196], [440 + lx * .9, 250], [432 + lx, 310], [400 + lx * .6, 350]];
      s += P(['membranoz_duvar'], () => k.yol(gYol(MD), 'none', NV, 2.4));
      const TV = [[470, 110], [496, 110], [492 + lx * .4, 220], [496, 360], [524, 452], [512, 470], [480, 360], [460 + lx * .3, 240]];
      s += P(['tensor_veli_palatini'], () => k.yol(gYol(TV, true, .3), AR.kas, AR.kas_c, 2) + k.yol(gYol([[452 + lx * .5, 250], [446 + lx * .8, 300]]), 'none', AR.kas_c, 3)
        + k.yol('M520 470 C 536 494 520 512 480 514 L 400 512', 'none', NV, 3.4));
      s += P(['hamulus'], () => k.yol(gYol([[548, 380], [560, 420], [548, 476], [530, 488], [536, 460], [540, 420]], true, .3), AR.kemik, NV, 2));
      if (q > .05) s += k.yol(`M${560} 260 L${600} 260`, 'none', R.mavi, 4) + okBasi(606, 260, 0, k.w(12), R.mavi, k.w(4));
      if (ay.yonler !== false) s += c.yazi(30, 580 - 8, L('← MEDİAL', '← MEDIAL'), {a: 'start', px: 16, fw: 800, renk: R.soluk}) + c.yazi(790, 572, L('LATERAL →', 'LATERAL →'), {a: 'end', px: 16, fw: 800, renk: R.soluk});
      return s; }};
};

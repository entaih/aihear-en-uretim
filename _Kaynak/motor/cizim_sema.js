// AIHEAR Akademi: ek donanım ve şema çizimleri (2.11.2026). sahne.js, cizim_grafik.js, cizim_anatomi.js ve cizim_beyin.js'ten SONRA yüklenir.
// bas_ustten (ITD, ILD, baş gölgesi), akustik_refleks_arki, test_kabini, oda_plani (yansımalar, kritik mesafe), vra_odasi,
// isitme_cihazi_karsilastir (ITC ve CIC yan yana; var olan isitme_cihazi çizimiyle), sosyal_izolasyon, denge_durus.
const SM = {giysi: '#DCE6F2', giysi2: '#E9E1F2', deri: '#F3E4DA', koyu: '#5E6F88'};

// ---------------------------------------------------------------- ortak kişi figürleri
// üstten bakış: omuzlar + baş (burun yönünde küçük çıkıntı); aci: bakış yönü (derece, 0 = yukarı)
function kisiUst(k, x, y, r, aci = 0, renk = SM.giysi) {
  // omuzlar (kapsül), üstten görünen baş: saç, önde burun ucu
  return `<g transform="rotate(${n1(aci)} ${n1(x)} ${n1(y)})">` + k.yol(gYol([[x - r * 1.6, y + r * .1], [x - r * 1.3, y - r * .38], [x + r * 1.3, y - r * .38], [x + r * 1.6, y + r * .1], [x + r * 1.3, y + r * .58], [x - r * 1.3, y + r * .58]], true, .45), renk, NV, 2)
    + k.yol(`M${n1(x - r * .16)} ${n1(y - r * .62)} L${n1(x)} ${n1(y - r * .9)} L${n1(x + r * .16)} ${n1(y - r * .62)}`, SM.deri, NV, 1.6)
    + k.yol(gElips(x, y, r * .66, r * .72), '#6B5E57', NV, 2) + k.yol(gElips(x - r * .7, y + r * .02, r * .12, r * .2), SM.deri, NV, 1.2) + k.yol(gElips(x + r * .7, y + r * .02, r * .12, r * .2), SM.deri, NV, 1.2) + '</g>';
}
// yandan: ayakta ya da oturan kişi (yüz sağa; ayna için yon = -1); (x, z) ayakların zemindeki yeri, H boy
function kisiYan(k, x, z, H, o = {}) {
  const yn = o.yon || 1, r = H * .068, ot = !!o.oturur, kalca = ot ? z - H * .27 : z - H * .48, omuz = kalca - H * .3, bas = omuz - r * 1.5, rn = o.renk || SM.giysi;
  const X = dx => x + dx * yn;
  let s = '';
  if (ot) { s += k.boru(gYol([[X(0), kalca], [X(H * .2), kalca + 4], [X(H * .22), z - 6]]), H * .075, o.alt || '#B9C6D6', NV, 1.8); s += k.yol(gElips(X(H * .25), z - 4, H * .05, H * .018), NV, NV, 1); }
  else { [[-.03, 0], [.03, .01]].forEach(([d, e]) => s += k.boru(gYol([[X(H * d), kalca], [X(H * (d + e)), z - 8]]), H * .07, o.alt || '#B9C6D6', NV, 1.8));
    s += k.yol(gElips(X(H * .04), z - 4, H * .06, H * .02), NV, NV, 1); }
  s += k.yol(gYol([[X(-H * .085), kalca + 6], [X(-H * .1), omuz + 10], [X(-H * .06), omuz - 6], [X(H * .06), omuz - 6], [X(H * .1), omuz + 10], [X(H * .085), kalca + 6]], true, .3), rn, NV, 2);
  s += k.boru(gYol([[X(H * .03), omuz + 6], [X(H * (o.kol ? .12 : .05)), omuz + H * .14], [X(H * (o.kol ? .2 : .07)), omuz + H * (o.kol ? .2 : .28)]]), H * .045, rn, NV, 1.6);
  s += k.yol(gElips(X(H * .01), bas, r, r * 1.08), SM.deri, NV, 2) + k.yol(`M${n1(X(r * .95))} ${n1(bas - r * .1)} L${n1(X(r * 1.25))} ${n1(bas + r * .2)} L${n1(X(r * .95))} ${n1(bas + r * .3)}`, SM.deri, NV, 1.4);
  return {svg: s, bas: [X(H * .01), bas], omuz: [X(0), omuz], kalca: [X(0), kalca], r, el: [X(H * (o.kol ? .2 : .07)), omuz + H * (o.kol ? .2 : .28)]};
}
// hoparlör (yan ya da önden), dalgalar
const hoparlorCiz = (k, x, y, s = 1, yon = 0) => `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${yon}) scale(${s})">` + k.yol('M-26 -40 L26 -40 L26 40 L-26 40 Z', '#F4F7FB', NV, 2.4) + k.yol(gElips(0, -12, 15, 15), '#E3EBF5', NV, 2) + k.yol(gElips(0, 22, 8, 8), '#E3EBF5', NV, 1.8) + '</g>';
const dalgaYay = (k, x, y, yon, n = 3, ara = 16, r0 = 14, renk = R.mavi, op = 1) => Array.from({length: n}, (_, i) => { const r = r0 + i * ara, a = .7;
  return `<path d="M${n1(x + yon * r * Math.cos(a))} ${n1(y - r * Math.sin(a))} A${r} ${r} 0 0 ${yon > 0 ? 1 : 0} ${n1(x + yon * r * Math.cos(a))} ${n1(y + r * Math.sin(a))}" fill="none" stroke="${renk}" stroke-width="${k.W2(3.2)}" stroke-linecap="round" opacity="${n1(op)}"/>`; }).join('');

// ---------------------------------------------------------------- baş üstten: ITD, ILD (baş gölgesi ve kırınım), baş gölgesi etkisi (sinyal-gürültü oranı)
// ayar.mod: "itd" (varsayılan) | "ild" | "golge"; itd: {etiket}; ild: {frekanslar: [4000, 500]}; golge: {gurultu_yonu: "sol" | "sag"}
CIZ.bas_ustten = (c, ay) => {
  const mod = ay.mod || 'itd';
  if (mod === 'ild') {
    const P0 = [[230, 330], [670, 330]], rx = 92, ry = 116, fr = ay.frekanslar || [4000, 500];
    const a = {tiz_dalga: [380, 190], pes_dalga: [820, 190], bas_golgesi: [70, 330], uzak_kulak: [230 - rx * 1.12, 336], yakin_kulak: [230 + rx * 1.12, 336], bas: [230, 460], pes_uzak_kulak: [670 - rx * 1.12, 336]};
    return {w: 900, h: 600, cm: 1.05, kirp: true, a, yer: {tiz_dalga: 'ust', pes_dalga: 'ust', bas_golgesi: 'sol', uzak_kulak: 'alt', yakin_kulak: 'alt', bas: 'alt', pes_uzak_kulak: 'alt'},
      takma: {golge: 'bas_golgesi', tiz: 'tiz_dalga', pes: 'pes_dalga'},
      svg: () => { const k = kalem(c, 1), P = anP(c); let s = '';
        P0.forEach(([cx, cy], i) => { const tiz = i === 0, B = basUstten(k, cx, cy, rx, ry), ara = tiz ? 20 : 72, kid = uid('ild'), sx = cx + 210;
          s += c.yazi(cx, 54, tiz ? L(`tiz ses (${fr[0]} Hz)`, `high (${fr[0]} Hz)`) : L(`pes ses (${fr[1]} Hz)`, `low (${fr[1]} Hz)`), {px: 21, fw: 800, ff: 'Outfit', renk: R.lacivert});
          const golge = [[cx, cy - ry], [cx - 210, cy - ry * 1.12], [cx - 210, cy + ry * 1.12], [cx, cy + ry]];
          if (tiz) { s += `<defs><clipPath id="${kid}"><path clip-rule="evenodd" d="M${cx - 220} 80 L${cx + 220} 80 L${cx + 220} 580 L${cx - 220} 580Z ${gPoly(golge)}"/></clipPath></defs>`;
            s += P(['bas_golgesi'], () => `<path d="${gPoly(golge)}" fill="${SM.koyu}" fill-opacity=".14"/>`); }
          const ofs = (c.t * 50) % ara;
          s += P([tiz ? 'tiz_dalga' : 'pes_dalga'], () => { let g = '';
            for (let x0 = sx - ofs; x0 > cx - 215; x0 -= ara) { const pts = []; for (let y = 90; y <= 570; y += 10) { const lag = !tiz && x0 < cx + rx ? 34 * Math.exp(-Math.pow((y - cy) / (ry * 1.25), 2)) * kis((cx + rx - x0) / 120) : 0; pts.push([x0 + lag, y]); }
              const op = .35 + .5 * kis((x0 - (cx - 215)) / 60);
              g += `<path d="${yolDiz(pts)}" fill="none" stroke="${R.mavi}" stroke-width="${k.W2(tiz ? 2.4 : 3.4)}" opacity="${n1(op)}"/>`; }
            return tiz ? `<g clip-path="url(#${kid})">${g}</g>` : g; });
          s += P(['bas'], () => B.bas) + P([tiz ? 'yakin_kulak' : 'pes_yakin_kulak'], () => B.sag) + P([tiz ? 'uzak_kulak' : 'pes_uzak_kulak'], () => B.sol);
          s += hoparlorCiz(k, sx, cy, .9, -90);
        });
        return s; }};
  }
  if (mod === 'golge') {
    const cx = 450, cy = 290, rx = 120, ry = 150, gsol = (ay.gurultu_yonu || 'sol') === 'sol', gx = gsol ? 90 : 810, kx = gsol ? 810 : 90;
    const iyiK = gsol ? [cx + rx * 1.12, cy + 8] : [cx - rx * 1.12, cy + 8], kotuK = gsol ? [cx - rx * 1.12, cy + 8] : [cx + rx * 1.12, cy + 8];
    const a = {konusma: [kx, 210], gurultu: [gx, 210], bas_golgesi: [gsol ? 720 : 180, 470], iyi_kulak: iyiK, kotu_kulak: kotuK, bas: [cx, cy + ry]};
    return {w: 900, h: 600, cm: 1.05, kirp: true, a, yer: {konusma: gsol ? 'sag' : 'sol', gurultu: gsol ? 'sol' : 'sag', bas_golgesi: 'alt', iyi_kulak: 'alt', kotu_kulak: 'alt', bas: 'alt'}, takma: {snr_iyi: 'iyi_kulak', snr_kotu: 'kotu_kulak', golge: 'bas_golgesi'},
      svg: () => { const k = kalem(c, 1), P = anP(c), B = basUstten(k, cx, cy, rx, ry), m = gsol ? 1 : -1;
        const golge = [[cx, cy - ry], [cx + m * 420, cy - ry * 1.2], [cx + m * 420, cy + ry * 1.2], [cx, cy + ry]];
        let s = P(['bas_golgesi'], () => `<path d="${gPoly(golge)}" fill="${SM.koyu}" fill-opacity=".12"/>`);
        // gürültü (gri, düzensiz) ve konuşma (mavi yaylar)
        s += P(['gurultu'], () => { let g = k.yol(gElips(gx, 220, 46, 46), '#EEF2F8', NV, 2.4); const r = ekRast(3); let d = `M${gx - 26} 220`; for (let i = 1; i <= 26; i++) d += ` L${n1(gx - 26 + i * 2)} ${n1(220 + (r() - .5) * 40)}`;
          return g + k.yol(d, 'none', SM.koyu, 2.4) + dalgaYay(k, gx + m * 50, 220, m, 4, 30, 30, SM.koyu, .5); });
        s += P(['konusma'], () => kisiUst(k, kx, 220, 34, gsol ? -90 : 90) + dalgaYay(k, kx - m * 52, 220, -m, 4, 30, 24, R.mavi, .8));
        s += P(['bas'], () => B.bas + B.sag + B.sol);
        const metre = (p, iyi, id) => P([id], () => { const x = p[0] - 40, y = p[1] + 70, hK = iyi ? 100 : 54, hG = iyi ? 34 : 96;
          return k.yol(`M${x} ${y + 110} L${x + 80} ${y + 110}`, 'none', NV, 2) + k.yol(`M${x + 6} ${y + 110 - hK} h30 v${hK} h-30Z`, R.mavi, NV, 1.6) + k.yol(`M${x + 44} ${y + 110 - hG} h30 v${hG} h-30Z`, '#B9C6D6', NV, 1.6)
            + c.yazi(p[0], y + 110 + c.fs(28), iyi ? L('SNR iyi', 'better SNR') : L('SNR kötü', 'worse SNR'), {px: 20, fw: 800, renk: iyi ? R.basari : R.sag_kulak}); });
        s += metre(iyiK, true, 'iyi_kulak') + metre(kotuK, false, 'kotu_kulak');
        return s; }};
  }
  // ITD: yandan gelen ses yakın kulağa önce, uzak kulağa sonra ulaşır
  const cx = 380, cy = 330, rx = 120, ry = 150, sx = 800, sy = 330;
  const near = [cx + rx * 1.12, cy + 8], far = [cx - rx * 1.12, cy + 8];
  const a = {ses_kaynagi: [sx, sy - 50], dalga_cepheleri: [640, 180], yakin_kulak: near, uzak_kulak: far, yakin_yol: [660, sy], uzak_yol: [cx, cy - ry - 14], zaman_farki: [cx, 560], bas: [cx, cy + ry - 30]};
  return {w: 900, h: 620, cm: 1.05, kirp: true, a, yer: {ses_kaynagi: 'ust', dalga_cepheleri: 'ust', yakin_kulak: 'alt', uzak_kulak: 'sol', yakin_yol: 'alt', uzak_yol: 'ust', zaman_farki: 'alt', bas: 'alt'}, takma: {itd: 'zaman_farki', kaynak: 'ses_kaynagi'},
    svg: () => { const k = kalem(c, 1), P = anP(c), B = basUstten(k, cx, cy, rx, ry);
      let s = P(['dalga_cepheleri'], () => { let g = ''; for (let i = 0; i < 6; i++) { const r = ((c.t * 110 + i * 90) % 540) + 30, op = .6 * (1 - r / 570);
        g += `<path d="M${n1(sx - r * Math.cos(1.1))} ${n1(sy - r * Math.sin(1.1))} A${r} ${r} 0 0 0 ${n1(sx - r * Math.cos(1.1))} ${n1(sy + r * Math.sin(1.1))}" fill="none" stroke="${R.mavi}" stroke-width="${k.W2(2.6)}" opacity="${n1(op)}"/>`; } return g; });
      s += P(['bas'], () => B.bas) + P(['yakin_kulak'], () => B.sag) + P(['uzak_kulak'], () => B.sol);
      s += P(['ses_kaynagi'], () => hoparlorCiz(k, sx, sy, 1.1, -90));
      const p1 = ilerle(c.t, ekBas(c, ay.yol_cumle, .6), 1), p2 = ilerle(c.t, ekBas(c, ay.yol_cumle, .6) + .5, 1.4);
      s += P(['yakin_yol'], () => `<path d="M${sx - 46} ${sy} L${n1(near[0] + 16)} ${n1(near[1])}" stroke="${R.mavi}" stroke-width="${k.W2(5)}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${n1(1 - p1)}"/>` + (p1 > .97 ? okBasi(near[0] + 14, near[1], Math.PI, k.w(14), R.mavi, k.w(5)) : ''));
      const uz = `M${sx - 46} ${sy - 4} C 640 250 560 ${cy - ry - 20} ${cx + 40} ${cy - ry - 16} C ${cx - 60} ${cy - ry - 14} ${cx - rx - 10} ${cy - ry * .7} ${n1(far[0] - 8)} ${n1(far[1] - 22)}`;
      s += P(['uzak_yol'], () => `<path d="${uz}" fill="none" stroke="${R.sari}" stroke-width="${k.W2(5)}" stroke-dasharray="1" pathLength="1" stroke-dashoffset="${n1(1 - p2)}"/>` + (p2 > .97 ? okBasi(far[0] - 8, far[1] - 20, Math.PI / 2 + .2, k.w(14), R.sari, k.w(5)) : ''));
      if (p1 > .97) s += c.yazi(near[0] + 30, near[1] - c.fs(14), 't₁', {a: 'start', px: 24, fw: 800, ff: 'Outfit', renk: R.mavi});
      if (p2 > .97) { s += c.yazi(far[0] - 26, far[1] - c.fs(14), 't₂', {a: 'end', px: 24, fw: 800, ff: 'Outfit', renk: '#B26B00'});
        s += P(['zaman_farki'], () => { const m = ay.etiket || L('Δt: en fazla yaklaşık 0,7 ms', 'Δt: up to about 0.7 ms'), w = olc(m, '800 22px Outfit') / c.k + c.fs(40);
          return `<rect x="${n1(cx - w / 2)}" y="${n1(548 - c.fs(22))}" width="${n1(w)}" height="${n1(c.fs(44))}" rx="${n1(c.fs(22))}" fill="#FFFFFF" stroke="${R.sari}" stroke-width="${k.W2(2.5)}"/>` + c.yazi(cx, 548 + c.fs(8), m, {px: 22, fw: 800, ff: 'Outfit', renk: R.lacivert}); }); }
      return s; }};
};

// ---------------------------------------------------------------- akustik refleks arkı (koronal şema, önden bakış: hastanın sağı görüntünün SOLUNDA; Borg 1973)
// koklea -> VIII -> ventral koklear nükleus -> superior oliver kompleks (iki taraf) -> fasiyal motor çekirdek (iki taraf) -> VII -> stapedius
// ayar: {uyarilan: "sag" | "sol", ipsi_cumle, kontra_cumle}
CIZ.akustik_refleks_arki = (c, ay) => {
  const sagU = (ay.uyarilan || 'sag') === 'sag', u = sagU ? -1 : 1, ux = x => 450 + u * x;    // u: uyarılan taraf (sağ = ekranda sol)
  const N = {koklea: [330, 430], vcn: [128, 350], soc: [62, 270], fmn: [102, 176], st: [338, 172]};
  const P2 = (n, m) => [450 + m * N[n][0], N[n][1]];
  const a = {koklea: P2('koklea', u), isitme_siniri: [450 + u * 236, 398], koklear_nukleus: P2('vcn', u), superior_oliver: P2('soc', u), fasiyal_motor_cekirdek: P2('fmn', u), fasiyal_sinir: [450 + u * 230, 170],
    stapedius: P2('st', u), ipsilateral_yol: [450 + u * 92, 226], kontralateral_yol: [450, 300], beyin_sapi: [450, 104], karsi_stapedius: P2('st', -u), karsi_fasiyal_cekirdek: P2('fmn', -u), karsi_superior_oliver: P2('soc', -u)};
  const takma = {ventral_koklear_nukleus: 'koklear_nukleus', vcn: 'koklear_nukleus', soc: 'superior_oliver', fasiyal_cekirdek: 'fasiyal_motor_cekirdek', yuz_siniri_cekirdegi: 'fasiyal_motor_cekirdek',
    viii: 'isitme_siniri', vii: 'fasiyal_sinir', ipsi: 'ipsilateral_yol', kontra: 'kontralateral_yol'};
  return {w: 900, h: 560, cm: 1.05, a: takmaAd(a, takma), takma,
    yer: {koklea: u < 0 ? 'sol' : 'sag', isitme_siniri: u < 0 ? 'sol' : 'sag', koklear_nukleus: u < 0 ? 'sol' : 'sag', superior_oliver: 'alt', fasiyal_motor_cekirdek: 'ust', fasiyal_sinir: 'ust', stapedius: u < 0 ? 'sol' : 'sag',
      ipsilateral_yol: 'ust', kontralateral_yol: 'alt', beyin_sapi: 'ust', karsi_stapedius: u < 0 ? 'sag' : 'sol', karsi_fasiyal_cekirdek: 'ust', karsi_superior_oliver: 'alt'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c);
      let s = P(['beyin_sapi'], () => k.yol(gYol([[264, 84], [636, 84], [656, 120], [660, 400], [640, 430], [260, 430], [240, 400], [244, 120]], true, .2), '#F6F3F6', NV, 2.6))
        + k.yol('M450 90 L450 424', 'none', AR.ince, 1.6, `stroke-dasharray="${k.W2(7)} ${k.W2(6)}"`);
      // her iki taraf: koklea, VIII, VCN, SOC, FMN, VII, stapedius
      [-1, 1].forEach(m => {
        const kk = P2('koklea', m), vc = P2('vcn', m), so = P2('soc', m), fm = P2('fmn', m), st = P2('st', m), id = m === u ? '' : 'karsi_';
        s += P(['koklea'], () => k.boru(sarmal(kk[0], kk[1], 30, 6, 2.1, m < 0 ? 0 : Math.PI), k.w(7), AR.sivi, NV, 1.8));
        s += P(['isitme_siniri'], () => k.boru(`M${kk[0] - m * 26} ${kk[1] - 22} C ${450 + m * 260} 380 ${450 + m * 200} 360 ${vc[0] + m * 26} ${vc[1] + 4}`, k.w(10), AR.sinir, AR.sinir_c, 1.6));
        s += P(['fasiyal_sinir'], () => k.boru(`M${fm[0] + m * 22} ${fm[1]} C ${450 + m * 200} 176 ${450 + m * 260} 170 ${st[0] - m * 30} ${st[1]}`, k.w(9), '#FFE2A6', AR.sinir_c, 1.6));
        s += P(['stapedius', id + 'stapedius'], () => k.yol(gElips(st[0], st[1], 30, 16), AR.kas, AR.kas_c, 2) + k.boru(`M${st[0] + m * 30} ${st[1]} l${m * 34} 10`, k.w(4), '#FFFFFF', NV, 1.4)
          + k.yol(`M${st[0] + m * 64} ${st[1] - 6} l${m * 22} -14 m0 14 l${m * 22} 14 M${st[0] + m * 86} ${st[1] - 20} l0 40`, 'none', NV, 3));
        s += P(['koklear_nukleus'], () => k.yol(gElips(vc[0], vc[1], 32, 22), '#FFFFFF', NV, 2.4));
        s += P(['superior_oliver', id + 'superior_oliver'], () => k.yol(gElips(so[0], so[1], 22, 18), '#FFFFFF', NV, 2.4));
        s += P(['fasiyal_motor_cekirdek', id + 'fasiyal_cekirdek'], () => k.yol(gElips(fm[0], fm[1], 28, 18), '#FFFFFF', NV, 2.4));
        if (!c.etiketli.has('isitme_siniri')) s += c.yazi(450 + m * 250, 418, 'VIII', {px: 16, fw: 800, renk: R.soluk});
        if (!c.etiketli.has('fasiyal_sinir')) s += c.yazi(450 + m * 210, 160, 'VII', {px: 16, fw: 800, renk: R.soluk});
      });
      // yollar: aynı taraf (ipsilateral, mavi) ve karşı taraf (kontralateral, sarı)
      const vc = P2('vcn', u), soI = P2('soc', u), soK = P2('soc', -u), fmI = P2('fmn', u), fmK = P2('fmn', -u);
      const yol = (id, d, renk, b) => { const p = ilerle(c.t, ekBas(c, ay[id === 'ipsilateral_yol' ? 'ipsi_cumle' : 'kontra_cumle'], b), 1.6); if (p <= 0) return '';
        return P([id], () => `<path d="${d}" fill="none" stroke="${renk}" stroke-width="${k.W2(5)}" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${n1(1 - p)}"/>`); };
      s += yol('ipsilateral_yol', `M${vc[0]} ${vc[1] - 22} C ${vc[0]} ${soI[1] + 20} ${soI[0]} ${soI[1] + 30} ${soI[0]} ${soI[1] + 18} M${soI[0]} ${soI[1] - 18} C ${soI[0]} ${fmI[1] + 40} ${fmI[0]} ${fmI[1] + 30} ${fmI[0]} ${fmI[1] + 18}`, R.mavi, .5);
      s += yol('kontralateral_yol', `M${vc[0] - u * 28} ${vc[1] - 8} C 450 ${vc[1] - 10} ${soK[0]} ${soK[1] + 40} ${soK[0]} ${soK[1] + 18} M${soK[0]} ${soK[1] - 18} C ${soK[0]} ${fmK[1] + 40} ${fmK[0]} ${fmK[1] + 30} ${fmK[0]} ${fmK[1] + 18}`, R.sari, 1.2);
      if (ay.yonler !== false) s += c.yazi(450 + u * 330, 520, L(sagU ? 'Sağ (uyarılan)' : 'Sol (uyarılan)', sagU ? 'Right (stimulated)' : 'Left (stimulated)'), {px: 18, fw: 700, renk: sagU ? R.sag_kulak : R.sol_kulak})
        + c.yazi(450 - u * 330, 520, L(sagU ? 'Sol' : 'Sağ', sagU ? 'Left' : 'Right'), {px: 18, fw: 700, renk: sagU ? R.sol_kulak : R.sag_kulak});
      return s; }};
};

// ---------------------------------------------------------------- ses yalıtımlı test kabini (yandan kesit): kontrol odası, çift duvar ve pencere, hasta odası
CIZ.test_kabini = (c, ay) => {
  const a = {kontrol_odasi: [200, 120], test_odasi: [690, 120], cift_duvar: [404, 430], pencere: [404, 250], hoparlor: [880, 196], hasta: [680, 330], kulaklik: [700, 262], hasta_butonu: [742, 400],
    odyolog: [220, 300], odyometre: [300, 352], ses_emici: [930, 330], kapi: [930, 470], havalandirma: [700, 56], interkom: [356, 330]};
  const takma = {hasta_odasi: 'test_odasi', duvar: 'cift_duvar', yalitim: 'cift_duvar', buton: 'hasta_butonu', mikrofon: 'interkom'};
  return {w: 980, h: 560, cm: 1.05, a: takmaAd(a, takma), takma,
    yer: {kontrol_odasi: 'ust', test_odasi: 'ust', havalandirma: 'ust', cift_duvar: 'alt', pencere: 'ust', hoparlor: 'sag', ses_emici: 'sag', kapi: 'sag', hasta: 'alt', kulaklik: 'ust', hasta_butonu: 'sag', odyolog: 'sol', odyometre: 'alt', interkom: 'alt'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c), Z = 500;
      let s = k.yol(`M20 ${Z} L960 ${Z}`, 'none', NV, 3);
      s += P(['kontrol_odasi'], v => `<rect x="24" y="80" width="356" height="${Z - 80}" fill="${karis('#F6F9FD', '#B3D8FA', .8 * v)}"/>`);
      // kabin: kalın, çift katmanlı duvarlar ve iç yüzeyde ses emici kama dolgu
      s += P(['test_odasi'], v => `<rect x="420" y="98" width="520" height="${Z - 98}" fill="${karis('#FFFFFF', '#B3D8FA', .8 * v)}"/>`);
      s += P(['cift_duvar'], () => k.yol(`M380 80 L960 80 L960 ${Z} L940 ${Z} L940 98 L420 98 L420 ${Z} L380 ${Z} Z`, '#C9D3E0', NV, 2.4) + k.yol(`M398 86 L398 ${Z} M948 86 L948 ${Z}`, 'none', '#9AABC2', 2, `stroke-dasharray="${k.W2(6)} ${k.W2(5)}"`));
      s += P(['ses_emici'], () => { let g = ''; for (let y = 110; y < Z - 10; y += 22) g += k.yol(`M940 ${y} L924 ${y + 11} L940 ${y + 22}`, '#E3EBF5', '#9AABC2', 1.4); for (let x = 432; x < 930; x += 22) g += k.yol(`M${x} 98 L${x + 11} 114 L${x + 22} 98`, '#E3EBF5', '#9AABC2', 1.4); return g; });
      s += P(['kapi'], () => k.yol(`M944 ${Z - 170} L958 ${Z - 170} L958 ${Z} L944 ${Z} Z`, '#8D9DB4', NV, 2) + k.yol(`M944 ${Z - 176} l14 0 M944 ${Z - 4} l14 0`, 'none', '#1E2B40', 4));
      s += P(['havalandirma'], () => k.yol('M640 80 L640 46 L760 46 L760 80', '#EEF2F8', NV, 2.2) + k.yol('M656 46 L656 80 M672 46 L672 80 M688 46 L688 80 M704 46 L704 80 M720 46 L720 80 M736 46 L736 80', 'none', '#9AABC2', 1.4));
      s += P(['pencere'], () => k.yol('M380 200 L420 200 L420 300 L380 300 Z', '#DCEEFD', NV, 2.2) + k.yol('M392 206 L392 294 M408 206 L408 294', 'none', '#7FB4EA', 2.2));
      s += P(['hoparlor'], () => hoparlorCiz(k, 900, 196, .85, 0) + hoparlorCiz(k, 460, 196, .85, 0));
      // kontrol odası: masa, odyometre, interkom, odyolog
      s += k.yol(`M150 ${Z - 150} L370 ${Z - 150} L370 ${Z - 140} L150 ${Z - 140} Z M170 ${Z - 140} L170 ${Z} M350 ${Z - 140} L350 ${Z}`, '#E3EBF5', NV, 2);
      s += P(['odyometre'], () => k.yol(`M240 ${Z - 196} L330 ${Z - 196} L340 ${Z - 150} L232 ${Z - 150} Z`, '#F4F7FB', NV, 2) + `<rect x="252" y="${Z - 190}" width="46" height="26" rx="4" fill="${R.lacivert}"/>`);
      s += P(['interkom'], () => k.yol(`M356 ${Z - 150} L356 ${Z - 180}`, 'none', NV, 3) + k.yol(gElips(356, Z - 186, 7, 9), '#5E6F88', NV, 1.6));
      const od = kisiYan(k, 196, Z, 250, {oturur: true, kol: true, renk: '#FFFFFF'});
      s += P(['odyolog'], () => k.yol(`M130 ${Z} L130 ${Z - 70} L180 ${Z - 70}`, 'none', '#7A8BA4', 6) + od.svg);
      // hasta: oturur, kulaklıklı, elinde buton; pencereye dönük (sola bakar)
      const ha = kisiYan(k, 690, Z, 250, {oturur: true, yon: -1, kol: true});
      s += P(['hasta'], () => k.yol(`M720 ${Z} L720 ${Z - 70} L690 ${Z - 70}`, 'none', '#7A8BA4', 6) + ha.svg);
      s += P(['kulaklik'], () => { const [hx, hy] = ha.bas, r = ha.r; return k.yol(`M${n1(hx - r * 1.05)} ${n1(hy)} A${n1(r * 1.15)} ${n1(r * 1.2)} 0 0 1 ${n1(hx + r * 1.05)} ${n1(hy)}`, 'none', SM.koyu, 6)
        + k.yol(gElips(hx + r * .2, hy + r * .1, r * .42, r * .6), R.sag_kulak, NV, 2); });
      s += P(['hasta_butonu'], () => k.yol(gYol([[ha.el[0] - 8, ha.el[1] - 6], [ha.el[0] + 8, ha.el[1] - 6], [ha.el[0] + 8, ha.el[1] + 26], [ha.el[0] - 8, ha.el[1] + 26]], true, .3), '#F4F7FB', NV, 2) + k.yol(gElips(ha.el[0], ha.el[1], 5, 5), R.mavi, NV, 1.2));
      if (ay.yazilar !== false) s += c.yazi(200, 112, L('kontrol odası', 'control room'), {px: 18, fw: 700, renk: R.soluk}) + c.yazi(680, 136, L('test odası (kabin)', 'test booth'), {px: 18, fw: 700, renk: R.soluk});
      return s; }};
};

// ---------------------------------------------------------------- oda akustiği: ayar.mod "yansima" (yandan kesit + ekogram) | "kritik_mesafe" (sınıf planı, üstten)
CIZ.oda_plani = (c, ay) => {
  if (ay.mod === 'kritik_mesafe') {
    const ox = 60, oy = 50, Wm = ay.oda ? ay.oda[0] : 9, Hm = ay.oda ? ay.oda[1] : 7, sk = 780 / Wm, rc = (ay.kritik_mesafe_m || 1.5) * sk, T = [450, 150], kid = uid('sn');
    const a = {ogretmen: T, kritik_mesafe: [T[0] + rc * .71, T[1] + rc * .71], dogrudan_alan: [T[0] - rc * .4, T[1] + rc * .5], yankilanan_alan: [740, 520], ogrenciler: [300, 470], on_siralar: [450, 250], sinif: [80, 300], tahta: [450, 62]};
    return {w: 900, h: 640, cm: 1.05, a, yer: {ogretmen: 'ust', kritik_mesafe: 'sag', dogrudan_alan: 'sol', yankilanan_alan: 'sag', ogrenciler: 'alt', on_siralar: 'sol', sinif: 'sol', tahta: 'ust'},
      takma: {kritik_mesafe_halkasi: 'kritik_mesafe', dogrudan_ses: 'dogrudan_alan', yankilanan_ses: 'yankilanan_alan', ogrenci: 'ogrenciler'},
      svg: () => { const k = kalem(c, 1), P = anP(c), p = ilerle(c.t, ekBas(c, ay.halka_cumle, .6), 1.2);
        let s = P(['yankilanan_alan', 'sinif'], () => k.yol(`M${ox} ${oy} L${ox + 780} ${oy} L${ox + 780} ${oy + Hm * sk} L${ox} ${oy + Hm * sk} Z`, '#F1EEF6', NV, 3));
        s += P(['tahta'], () => k.yol(`M330 ${oy + 4} L570 ${oy + 4} L570 ${oy + 16} L330 ${oy + 16} Z`, '#3B5578', NV, 1.6));
        s += `<defs><clipPath id="${kid}"><rect x="${ox}" y="${oy}" width="780" height="${n1(Hm * sk)}"/></clipPath></defs>`;
        s += P(['dogrudan_alan'], () => `<circle clip-path="url(#${kid})" cx="${T[0]}" cy="${T[1]}" r="${n1(rc * p)}" fill="#D6EAFC" fill-opacity=".85"/>`);
        const sira = []; for (let r2 = 0; r2 < 4; r2++) for (let j = 0; j < 5; j++) sira.push([170 + j * 140, 262 + r2 * 100]);
        s += P(['ogrenciler'], () => sira.map(([x, y]) => { const ic = Math.hypot(x - T[0], y + 22 - T[1]) < rc;
          return k.yol(`M${x - 46} ${y} L${x + 46} ${y} L${x + 46} ${y + 26} L${x - 46} ${y + 26} Z`, '#E9DFD2', '#B79E7E', 1.6) + kisiUst(k, x, y + 46, 17, 0, ic ? '#BFDDF8' : SM.giysi2); }).join(''));
        s += P(['on_siralar'], v => v < .01 ? '' : sira.filter(([x, y]) => Math.hypot(x - T[0], y + 22 - T[1]) < rc).map(([x, y]) => `<circle cx="${x}" cy="${y + 46}" r="30" fill="${R.mavi}" fill-opacity="${n1(.25 * v)}"/>`).join(''));
        s += P(['kritik_mesafe'], () => `<circle clip-path="url(#${kid})" cx="${T[0]}" cy="${T[1]}" r="${n1(rc * p)}" fill="none" stroke="${R.mavi}" stroke-width="${k.W2(3.4)}" stroke-dasharray="${k.W2(12)} ${k.W2(8)}"/>`
          + (p > .9 ? `<path d="M${T[0]} ${T[1]} L${n1(T[0] + rc * .71)} ${n1(T[1] + rc * .71)}" stroke="${R.mavi}" stroke-width="${k.W2(2.5)}"/>` + okBasi(T[0] + rc * .71, T[1] + rc * .71, Math.PI / 4, k.w(12), R.mavi, k.w(2.5))
            + c.yazi(T[0] + rc * .42 + c.fs(8), T[1] + rc * .3, `${ekSayi(ay.kritik_mesafe_m || 1.5, 1)} m`, {a: 'start', px: 19, fw: 800, renk: R.mavi}) : ''));
        s += P(['ogretmen'], () => kisiUst(k, T[0], T[1], 24, 180, '#FFE3A8'));
        if (ay.yazilar !== false) s += c.yazi(T[0] - rc - c.fs(10), T[1] + c.fs(6), L('doğrudan ses baskın', 'direct sound dominates'), {a: 'end', px: 17, fw: 700, renk: R.mavi, ek: `opacity="${n1(p)}"`})
          + c.yazi(ox + 770, oy + Hm * sk - c.fs(12), L('yankılanan ses baskın', 'reverberant sound dominates'), {a: 'end', px: 17, fw: 700, renk: '#7B61C9'});
        return s; }};
  }
  const Lx = [70, 830], Ly = [60, 360], S = [200, 236], D = [690, 236];
  const yans = [['tavan_yansimasi', [445, Ly[0] + 2]], ['taban_yansimasi', [445, Ly[1] - 2]], ['duvar_yansimasi', [Lx[1] - 2, 236]]];
  const a = {konusmaci: [150, 300], dinleyici: [720, 300], dogrudan_ses: [445, 236], yansimalar: [445, 70], tavan_yansimasi: [320, 150], taban_yansimasi: [320, 300], duvar_yansimasi: [790, 200],
    ekogram: [760, 480], erken_yansimalar: [270, 448], yankilanma: [560, 520]};
  return {w: 900, h: 620, cm: 1.05, a, yer: {konusmaci: 'sol', dinleyici: 'sag', dogrudan_ses: 'ust', yansimalar: 'ust', tavan_yansimasi: 'ust', taban_yansimasi: 'sol', duvar_yansimasi: 'sag', ekogram: 'sag', erken_yansimalar: 'alt', yankilanma: 'alt'},
    takma: {dogrudan: 'dogrudan_ses', yansima: 'yansimalar', erken: 'erken_yansimalar', reverberasyon: 'yankilanma'}, vurguEsle: {tavan_yansimasi: 'yansimalar', taban_yansimasi: 'yansimalar', duvar_yansimasi: 'yansimalar'},
    svg: () => { const k = kalem(c, 1), P = anP(c), pd = ilerle(c.t, ekBas(c, ay.dogrudan_cumle, .5), 1), py = ilerle(c.t, ekBas(c, ay.yansima_cumle, 1.2), 1.2);
      let s = k.yol(`M${Lx[0]} ${Ly[0]} L${Lx[1]} ${Ly[0]} L${Lx[1]} ${Ly[1]} L${Lx[0]} ${Ly[1]} Z`, '#FFFFFF', NV, 4);
      const ks = kisiYan(k, 160, Ly[1], 230, {kol: true}), kd = kisiYan(k, 724, Ly[1], 200, {yon: -1, oturur: true});
      s += P(['konusmaci'], () => ks.svg) + P(['dinleyici'], () => k.yol(`M750 ${Ly[1]} L750 ${Ly[1] - 56} L716 ${Ly[1] - 56}`, 'none', '#7A8BA4', 6) + kd.svg);
      const ag = [ks.bas[0] + 18, ks.bas[1] + 4], ku = [kd.bas[0] + 4, kd.bas[1]];
      yans.forEach(([id, q], i) => s += P([id, 'yansimalar'], () => `<path d="M${n1(ag[0])} ${n1(ag[1])} L${n1(q[0])} ${n1(q[1])} L${n1(ku[0])} ${n1(ku[1])}" fill="none" stroke="#7FB4EA" stroke-width="${k.W2(3)}" stroke-dasharray="${k.W2(9)} ${k.W2(7)}" opacity="${n1(py)}"/>`
        + (py > .95 ? okBasi(ku[0], ku[1], Math.atan2(ku[1] - q[1], ku[0] - q[0]), k.w(12), '#7FB4EA', k.w(3)) : '')));
      s += P(['dogrudan_ses'], () => `<path d="M${n1(ag[0])} ${n1(ag[1])} L${n1(ku[0] - 6)} ${n1(ku[1])}" stroke="${R.mavi}" stroke-width="${k.W2(5)}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${n1(1 - pd)}"/>` + (pd > .95 ? okBasi(ku[0] - 6, ku[1], 0, k.w(14), R.mavi, k.w(5)) : ''));
      // ekogram: doğrudan ses, erken yansımalar, sönen yankılanma
      const ex0 = 130, ex1 = 820, ey = 590, eh = 150, X = t => ex0 + (ex1 - ex0) * t / 300, pe = ilerle(c.t, ekBas(c, ay.ekogram_cumle, 1.6), 1.6);
      s += P(['ekogram'], () => { let g = k.yol(`M${ex0} ${ey} L${ex1 + 10} ${ey}`, 'none', NV, 2.2) + okBasi(ex1 + 12, ey, 0, k.w(11), NV, k.w(2.2)) + c.yazi(ex1, ey + c.fs(24), L('zaman (ms)', 'time (ms)'), {a: 'end', px: 16, fw: 600});
        const r = ekRast(12);
        const bar = (t, h2, renk, w2 = 3) => t / 300 > pe ? '' : k.yol(`M${n1(X(t))} ${ey} L${n1(X(t))} ${n1(ey - h2)}`, 'none', renk, w2);
        g += bar(0, eh, R.mavi, 6);
        [[8, .62], [14, .55], [22, .48], [31, .42], [42, .36]].forEach(([t, h2]) => g += bar(t, eh * h2, '#4D8FD1', 4));
        for (let t = 50; t < 300; t += 2.6) g += bar(t, eh * .32 * Math.exp(-(t - 50) / 80) * (.5 + r() * .7), '#9CC9F3', 2);
        return g; });
      s += P(['erken_yansimalar'], v => `<rect x="${X(4)}" y="${590 - 150}" width="${X(50) - X(4)}" height="150" fill="${R.mavi}" fill-opacity="${n1(.06 + .14 * v)}"/>` + c.yazi(X(50), 590 - 156, '50 ms', {a: 'middle', px: 15, fw: 700, renk: R.soluk})
        + `<line x1="${X(50)}" y1="${590 - 150}" x2="${X(50)}" y2="590" stroke="${R.soluk}" stroke-width="${k.W2(1.6)}" stroke-dasharray="${k.W2(4)} ${k.W2(5)}"/>`);
      s += P(['yankilanma'], v => v < .01 ? '' : `<rect x="${X(52)}" y="${590 - 70}" width="${X(300) - X(52)}" height="70" fill="${R.mavi}" fill-opacity="${n1(.14 * v)}"/>`);
      return s; }};
};

// ---------------------------------------------------------------- VRA test odası (üstten): ebeveyn kucağında çocuk, önde dikkat dağıtıcı, yanda (~90 derece) hoparlör ve ışıklı ödül kutusu, camın arkasında test eden
CIZ.vra_odasi = (c, ay) => {
  const C0 = [330, 380];
  const a = {cocuk: [C0[0], C0[1] - 34], ebeveyn: [C0[0], C0[1] + 36], dikkat_dagitici: [C0[0], 168], hoparlor: [96, 330], odul_kutusu: [96, 430], pencere: [640, 380], test_eden: [770, 380], odyometre: [770, 300],
    kontrol_odasi: [770, 120], test_odasi: [330, 110], aci: [250, 300]};
  const takma = {anne_baba: 'ebeveyn', odul: 'odul_kutusu', isikli_kutu: 'odul_kutusu', cam: 'pencere', odyolog: 'test_eden'};
  return {w: 900, h: 600, cm: 1.05, a: takmaAd(a, takma), takma,
    yer: {cocuk: 'sag', ebeveyn: 'alt', dikkat_dagitici: 'ust', hoparlor: 'sol', odul_kutusu: 'sol', pencere: 'ust', test_eden: 'sag', odyometre: 'sag', kontrol_odasi: 'ust', test_odasi: 'ust', aci: 'ust'},
    svg: () => { const k = kalem(c, 1), P = anP(c);
      let s = P(['test_odasi'], v => k.yol('M30 60 L640 60 L640 560 L30 560 Z', karis('#FFFFFF', '#B3D8FA', .8 * v), NV, 3.4)) + P(['kontrol_odasi'], v => k.yol('M660 60 L870 60 L870 560 L660 560 Z', karis('#F6F9FD', '#B3D8FA', .8 * v), NV, 3.4));
      s += P(['pencere'], () => k.yol('M636 300 L664 300 L664 460 L636 460 Z', '#DCEEFD', NV, 2) + k.yol('M646 304 L646 456 M654 304 L654 456', 'none', '#7FB4EA', 2));
      // 90 derece açı göstergesi
      s += P(['aci'], () => k.yol(`M${C0[0]} ${C0[1] - 34} L${C0[0]} 200 M${C0[0]} ${C0[1] - 34} L130 ${C0[1] - 34}`, 'none', R.soluk, 2, `stroke-dasharray="${k.W2(6)} ${k.W2(6)}"`)
        + k.yol(`M${C0[0]} ${C0[1] - 94} A60 60 0 0 0 ${C0[0] - 60} ${C0[1] - 34}`, 'none', R.mavi, 2.6) + c.yazi(C0[0] - 54, C0[1] - 84, '90°', {px: 18, fw: 800, renk: R.mavi}));
      s += P(['ebeveyn'], () => k.yol(gYol([[C0[0] - 62, C0[1] + 10], [C0[0] + 62, C0[1] + 10], [C0[0] + 66, C0[1] + 86], [C0[0] - 66, C0[1] + 86]], true, .25), '#E9DFD2', '#B79E7E', 2) + kisiUst(k, C0[0], C0[1] + 40, 30, 0, SM.giysi2));
      s += P(['cocuk'], () => kisiUst(k, C0[0], C0[1] - 26, 19, 0, '#FFE3A8'));
      s += P(['dikkat_dagitici'], () => k.yol('M270 210 L390 210 L390 240 L270 240 Z', '#E9DFD2', '#B79E7E', 1.6) + kisiUst(k, C0[0], 166, 24, 180, '#D9EFE3') + k.yol(gElips(300, 224, 9, 9), R.sari, NV, 1.4) + k.yol(gElips(360, 224, 9, 9), R.sag_kulak, NV, 1.4));
      s += P(['hoparlor'], () => hoparlorCiz(k, 96, 330, .9, 90) + dalgaYay(k, 140, 330, 1, 3, 16, 16, R.mavi, .7));
      const isik = .5 + .5 * Math.max(0, Math.sin(c.t * 3));
      s += P(['odul_kutusu'], () => k.yol('M66 400 L126 400 L126 460 L66 460 Z', '#1E2B40', NV, 2) + `<circle cx="96" cy="430" r="${n1(18 + 4 * isik)}" fill="${R.sari}" opacity="${n1(.35 + .5 * isik)}"/>` + k.yol(gElips(96, 432, 10, 12), '#FFE3A8', NV, 1.4));
      s += P(['odyometre'], () => k.yol('M710 270 L830 270 L830 320 L710 320 Z', '#F4F7FB', NV, 2) + `<rect x="722" y="280" width="50" height="28" rx="4" fill="${R.lacivert}"/>`);
      s += P(['test_eden'], () => kisiUst(k, 770, 380, 26, -90, '#FFFFFF'));
      if (ay.yazilar !== false) s += c.yazi(56, 90, L('test odası', 'test room'), {a: 'start', px: 17, fw: 700, renk: R.soluk}) + c.yazi(686, 90, L('kontrol odası', 'control room'), {a: 'start', px: 17, fw: 700, renk: R.soluk});
      return s; }};
};

// ---------------------------------------------------------------- ITC ve CIC (ya da herhangi iki tip) yan yana: var olan isitme_cihazi çiziminin aynısı
// ayar: {tipler: ["ITC", "CIC"]}; parçalar önekli: itc_kalip, cic_mikrofon ...; öneksiz parça (kalip) iki çizimde birlikte parlar
CIZ.isitme_cihazi_karsilastir = (c, ay) => {
  const tipler = (ay.tipler || ['ITC', 'CIC']).slice(0, 2).map(t => String(t).toUpperCase()), on = t => t.toLowerCase() + '_';
  const parcalar = ['mikrofon', 'islemci', 'alici', 'pil', 'kalip'];
  const alt = tipler.map(t => { const c2 = Object.assign(Object.create(c), {P: (id, fn) => c.P((Array.isArray(id) ? id : [id]).flatMap(q => [on(t) + q, q]), fn)}); return {t, c2, d: CIZ.isitme_cihazi(c2, {tip: t})}; });
  const ofs = [], a = {}, yer = {}; let x = 0;
  alt.forEach((o, i) => { const vx = o.d.vx || 0; ofs.push(x - vx); Object.entries(o.d.a).forEach(([kk, p]) => { a[on(o.t) + kk] = [p[0] + x - vx, p[1] - (o.d.vy || 0)]; yer[on(o.t) + kk] = i ? 'sag' : 'sol'; }); x += o.d.w + 60; });
  parcalar.forEach(q => { if (a[on(tipler[0]) + q]) a[q] = a[on(tipler[0]) + q]; });
  const h = Math.max(...alt.map(o => o.d.h));
  return {w: x - 60, h, a, yer, cm: 1.05,
    svg: () => alt.map((o, i) => `<g transform="translate(${n1(ofs[i])} ${n1(-(o.d.vy || 0))})">${o.d.svg()}</g>`).join('')};
};

// ---------------------------------------------------------------- sosyal izolasyon: masada konuşan grup ve geri çekilmiş tek kişi
CIZ.sosyal_izolasyon = (c, ay) => {
  const M = [320, 330];
  const a = {grup: [M[0], 170], masa: [M[0], M[1] + 30], konusma: [M[0] - 40, 110], yalniz_kisi: [770, 330], mesafe: [600, 330]};
  return {w: 900, h: 560, cm: 1.05, a, yer: {grup: 'ust', masa: 'alt', konusma: 'ust', yalniz_kisi: 'sag', mesafe: 'alt'}, takma: {yalniz: 'yalniz_kisi', izole_kisi: 'yalniz_kisi'},
    svg: () => { const k = kalem(c, 1), P = anP(c), p = ilerle(c.t, ekBas(c, ay.yalniz_cumle, .8), 1);
      let s = P(['masa'], () => k.yol(gElips(M[0], M[1], 190, 110), '#E9DFD2', '#B79E7E', 2.4) + k.yol(gElips(M[0] - 40, M[1] - 10, 16, 10), '#FFFFFF', NV, 1.4) + k.yol(gElips(M[0] + 60, M[1] + 20, 16, 10), '#FFFFFF', NV, 1.4));
      const kis2 = [[M[0] - 210, M[1], 90], [M[0] + 210, M[1], -90], [M[0] - 80, M[1] - 128, 160], [M[0] + 90, M[1] - 126, 200], [M[0], M[1] + 132, 0]];
      s += P(['grup'], () => kis2.map(([x, y, ac], i) => kisiUst(k, x, y, 28, ac + 180, [SM.giysi, SM.giysi2, '#D9EFE3', '#FFE3A8', '#FDE6E7'][i])).join(''));
      const balon = (x, y, w2, renk) => k.yol(gYol([[x - w2, y - 22], [x + w2, y - 22], [x + w2 + 8, y - 14], [x + w2 + 8, y + 14], [x + w2, y + 22], [x - 4, y + 22], [x - 18, y + 40], [x - 14, y + 22], [x - w2, y + 22], [x - w2 - 8, y + 14], [x - w2 - 8, y - 14]], true, .15), '#FFFFFF', renk, 2.2)
        + [-1, 0, 1].map(j => `<circle cx="${x + j * 14}" cy="${y}" r="4" fill="${renk}"/>`).join('');
      s += P(['konusma'], () => balon(M[0] - 120, 112, 40, R.mavi) + balon(M[0] + 120, 104, 40, R.mavi) + balon(M[0] + 268, 236, 34, R.mavi));
      // geri çekilmiş kişi: gruptan uzakta, sırtı dönük
      s += `<g opacity="${n1(.3 + .7 * p)}">` + P(['yalniz_kisi'], () => k.yol(gYol([[730, 300], [810, 300], [814, 380], [726, 380]], true, .2), '#EEF2F8', '#9AABC2', 2) + kisiUst(k, 770, 330, 28, 90, '#E3E8EF')
        + k.yol(gYol([[800, 268], [840, 268], [846, 276], [846, 292], [840, 298], [800, 298], [794, 292], [794, 276]], true, .2), '#FFFFFF', '#9AABC2', 2) + c.yazi(820, 290, '…', {px: 20, fw: 800, renk: '#9AABC2'})) + '</g>';
      s += P(['mesafe'], () => k.yol('M560 330 L700 330', 'none', '#9AABC2', 2.4, `stroke-dasharray="${k.W2(7)} ${k.W2(7)}"`));
      return s; }};
};

// ---------------------------------------------------------------- denge: ayakta duran kişi (yandan), ağırlık merkezi, yerçekimi çizgisi ve destek yüzeyi; sağda ayak izleri (üstten)
CIZ.denge_durus = (c, ay) => {
  const Z = 560, H = 470, x0 = 260;
  const a = {kisi: [x0 - 10, 200], agirlik_merkezi: [x0 + 6, Z - H * .55], cekim_cizgisi: [x0 + 10, Z - 120], destek_yuzeyi: [x0 + 30, Z + 6], salinim: [x0 + 10, Z - H - 18], ayak_izi: [690, 330]};
  const takma = {agirlik: 'agirlik_merkezi', destek: 'destek_yuzeyi', yercekimi: 'cekim_cizgisi'};
  return {w: 900, h: 620, cm: 1.05, a: takmaAd(a, takma), takma,
    yer: {kisi: 'sol', agirlik_merkezi: 'sol', cekim_cizgisi: 'sol', destek_yuzeyi: 'alt', salinim: 'ust', ayak_izi: 'ust'},
    svg: () => { const k = kalem(c, 1), P = anP(c), sal = 1.6 * Math.sin(c.t * 1.3);
      let s = k.yol(`M40 ${Z} L520 ${Z}`, 'none', NV, 3);
      s += P(['destek_yuzeyi'], () => k.yol(`M${x0 - 34} ${Z - 6} L${x0 + 86} ${Z - 6} L${x0 + 100} ${Z + 10} L${x0 - 44} ${Z + 10} Z`, '#BFDDF8', R.mavi, 2));
      const kisi = kisiYan(k, x0, Z, H, {renk: SM.giysi});
      s += `<g transform="rotate(${n1(sal)} ${x0 + 10} ${Z})">` + P(['kisi'], () => kisi.svg);
      const am = [x0 + 6, Z - H * .55];
      s += P(['cekim_cizgisi'], () => k.yol(`M${am[0]} ${am[1]} L${am[0]} ${Z - 8}`, 'none', R.mavi, 2.6, `stroke-dasharray="${k.W2(8)} ${k.W2(6)}"`) + okBasi(am[0], Z - 8, Math.PI / 2, k.w(12), R.mavi, k.w(2.6)));
      s += P(['agirlik_merkezi'], () => `<circle cx="${am[0]}" cy="${am[1]}" r="15" fill="#FFFFFF" stroke="${NV}" stroke-width="${k.W2(2.4)}"/><path d="M${am[0]} ${am[1] - 15} A15 15 0 0 1 ${am[0] + 15} ${am[1]} L${am[0]} ${am[1]}Z M${am[0]} ${am[1] + 15} A15 15 0 0 1 ${am[0] - 15} ${am[1]} L${am[0]} ${am[1]}Z" fill="${NV}"/>`);
      s += '</g>';
      s += P(['salinim'], () => k.yol(`M${x0 - 30} ${Z - H - 16} A 60 60 0 0 1 ${x0 + 50} ${Z - H - 16}`, 'none', R.soluk, 2.4) + okBasi(x0 + 50, Z - H - 16, .5, k.w(11), R.soluk, k.w(2.4)) + okBasi(x0 - 30, Z - H - 16, Math.PI - .5, k.w(11), R.soluk, k.w(2.4)));
      // ayak izleri ve destek yüzeyi (üstten)
      s += P(['ayak_izi', 'destek_yuzeyi'], () => { const ft = (x, m) => k.yol(gYol([[x - 12 * m, 426], [x - 16 * m, 390], [x - 18 * m, 340], [x - 14 * m, 296], [x + 2 * m, 282], [x + 20 * m, 292], [x + 24 * m, 330], [x + 14 * m, 380], [x + 12 * m, 420], [x, 434]], true, .45), '#E3EBF5', NV, 2)
          + [0, 1, 2, 3, 4].map(i => k.yol(gElips(x + (-12 + i * 7.5) * m, 270 + Math.abs(i - 1.5) * 3, 4.5, 5.5), '#E3EBF5', NV, 1.4)).join('');
        return k.yol(gYol([[642, 284], [738, 284], [756, 430], [624, 430]], true, .15), '#BFDDF8', R.mavi, 2, 'fill-opacity=".8"') + ft(650, -1) + ft(730, 1)
          + `<circle cx="690" cy="356" r="9" fill="${NV}"/>` + c.yazi(690, 470, L('üstten', 'top view'), {px: 16, fw: 700, renk: R.soluk}); });
      return s; }};
};

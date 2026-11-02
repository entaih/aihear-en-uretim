// AIHEAR Akademi: v6 çizimleri (2.11.2026). sahne.js ve diğer cizim_*.js dosyalarından SONRA yüklenir.
// Yeni çizimler: icf_modeli, etik_ilkeler, prisma_akisi, pedigri, dudak_bicimleri, goz_nistagmus, goz_kapatma, dix_hallpike,
// bakis_stabilizasyonu, elektrot_yerlesimi, kuplor, beyin_sapi_implanti. Var olan çizimlere YALNIZ yeni ayar/mod eklenir
// (abr: polarite, dalga1_oran; bas_ustten: mod cros, lisn; kulak_kesit: implant); ayar verilmezse eski çizim aynen çağrılır.
const V6 = {acikMavi: '#E6F1FD', acikSari: '#FFF4DC', sariC: '#C98A1C', acikYesil: '#E3F6EC', acikKirmizi: '#FDE6E7', gri: '#EEF2F8', metal: '#CFDAE7',
  koyu: '#5E6F88', ten: '#F3E4DA', dudak: '#E3A0A0', dudakC: '#A85F5F', agiz: '#6B2F3A', dis: '#FFFFFF', dil: '#E98B92', iris: '#7FA7D6', sac: '#6B5E57', titan: '#B9C3CF'};

// ---------------------------------------------------------------- ortak yardımcılar
const v6Gor = (c, cm, yedek = .3, sure = .6) => ilerle(c.t, ekBas(c, cm, yedek), sure);
// tek satır yazı; maxW (çizim birimi) aşılırsa küçülür
function v6Yazi(c, x, y, m, maxW, o = {}) {
  let px = o.px || 20; const f = p => `${o.fw || 600} ${p}px ${o.ff || 'Inter'}`;
  while (px > (o.min || 12) && olc(duz(m), f(px)) / c.k > maxW) px -= 1;
  return c.yazi(x, y, m, Object.assign({}, o, {px}));
}
// çok satırlı yazı, (x, y) satırların ortası; en uzun satır maxW'ye sığana kadar küçülür
function v6Satirlar(c, x, y, satirlar, maxW, o = {}) {
  let px = o.px || 20; const f = p => `${o.fw || 600} ${p}px ${o.ff || 'Inter'}`;
  satirlar = satirlar.filter(m => m != null && m !== '');
  if (!satirlar.length) return '';
  while (px > (o.min || 12) && Math.max(...satirlar.map(m => olc(duz(m), f(px)))) / c.k > maxW) px -= 1;
  const sh = c.fs(px * (o.ara || 1.25)), y0 = y - sh * (satirlar.length - 1) / 2;
  return satirlar.map((m, i) => c.yazi(x, y0 + i * sh + c.fs(px * .36), m, Object.assign({}, o, {px, renk: (o.renkler && o.renkler[i]) || o.renk}))).join('');
}
const v6Kutu = (k, x, y, w, h, o = {}) => `<rect x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}" rx="${n1(o.r ?? 16)}" fill="${o.dolgu || '#FFFFFF'}" stroke="${o.cizgi || NV}" stroke-width="${k.W2(o.k || 2.4)}"${o.kesik ? ` stroke-dasharray="${k.W2(8)} ${k.W2(6)}"` : ''}${o.op != null ? ` opacity="${n1(o.op)}"` : ''}/>`;
function v6Ok(k, x1, y1, x2, y2, renk = NV, w = 3, cift = false, b = 13, ek = '') {
  const a = Math.atan2(y2 - y1, x2 - x1);
  return `<path d="M${n1(x1)} ${n1(y1)} L${n1(x2)} ${n1(y2)}" stroke="${renk}" stroke-width="${k.W2(w)}" stroke-linecap="round" ${ek}/>` + okBasi(x2, y2, a, k.w(b), renk, k.w(w)) + (cift ? okBasi(x1, y1, a + Math.PI, k.w(b), renk, k.w(w)) : '');
}
// yol boyunca ilerleyen çizgi (p: 0..1) ve uçta ok başı
function v6YolOk(k, d, p, renk, w = 4, son = null, o = {}) {
  if (p <= 0) return '';
  return `<path d="${d}" fill="none" stroke="${renk}" stroke-width="${k.W2(w)}" stroke-linecap="round" pathLength="1" stroke-dasharray="${o.kesik ? '' : '1'}" stroke-dashoffset="${n1(1 - p)}"/>`
    + (son && p > .97 ? okBasi(son[0], son[1], son[2], k.w(o.b || 14), renk, k.w(w)) : '');
}
// ikon kütüphanesinden ikon (çizim birimiyle)
const v6Ikon = (ad, x, y, px, renk = R.mavi, op = 1) => ikonCiz(ad, px, renk).replace('<svg ', `<svg x="${n1(x - px / 2)}" y="${n1(y - px / 2)}" opacity="${n1(op)}" `);
// ayar.cumleler sözlüğü ya da dizisi: parça -> belirdiği cümle
const v6Zaman = (ay, id, sira, yedek) => { const t = ay.cumleler; if (Array.isArray(t)) return sira != null ? t[sira] : yedek; if (t && t[id] != null) return t[id]; return yedek; };

// ---------------------------------------------------------------- ICF modeli (WHO 2001): sağlık durumu; vücut işlevleri ve yapıları, etkinlik, katılım; çevresel ve kişisel etkenler
// ayar: {cumleler: {saglik_durumu, vucut_islevleri, etkinlik, katilim, cevresel_etkenler, kisisel_etkenler, oklar}, ornekler: true, metinler: {id: "..."}}
CIZ.icf_modeli = (c, ay) => {
  const B = {saglik_durumu: [330, 24, 340, 104], vucut_islevleri: [20, 220, 290, 120], etkinlik: [355, 220, 290, 120], katilim: [690, 220, 290, 120],
    cevresel_etkenler: [130, 470, 320, 110], kisisel_etkenler: [550, 470, 320, 110]};
  const AD = {saglik_durumu: L('Sağlık durumu', 'Health condition'), vucut_islevleri: L('Vücut işlevleri|ve yapıları', 'Body functions|and structures'), etkinlik: L('Etkinlik', 'Activity'),
    katilim: L('Katılım', 'Participation'), cevresel_etkenler: L('Çevresel etkenler', 'Environmental factors'), kisisel_etkenler: L('Kişisel etkenler', 'Personal factors')};
  const ORN = {saglik_durumu: L('örnek: işitme kaybı', 'e.g. hearing loss'), vucut_islevleri: L('işitme işlevi, koklea', 'hearing function, cochlea'), etkinlik: L('konuşulanı anlamak', 'understanding speech'),
    katilim: L('aile sohbetine katılmak', 'joining a family talk'), cevresel_etkenler: L('gürültü, teknoloji, tutumlar', 'noise, technology, attitudes'), kisisel_etkenler: L('yaş, kişilik, başa çıkma', 'age, personality, coping')};
  const a = {}; Object.entries(B).forEach(([id, [x, y, w, h]]) => a[id] = [x + w / 2, y + h / 2]);
  Object.assign(a, {oklar: [500, 420], baglamsal_etkenler: [500, 525], islevsellik: [500, 280]});
  const takma = {saglik: 'saglik_durumu', vucut: 'vucut_islevleri', vucut_yapilari: 'vucut_islevleri', vucut_islevleri_ve_yapilari: 'vucut_islevleri', cevre: 'cevresel_etkenler',
    kisisel: 'kisisel_etkenler', etkilesim: 'oklar', iki_yonlu_oklar: 'oklar'};
  return {w: 1000, h: 600, cm: 1.05, a: takmaAd(a, takma), takma,
    yer: {saglik_durumu: 'ust', vucut_islevleri: 'sol', etkinlik: 'ust', katilim: 'sag', cevresel_etkenler: 'sol', kisisel_etkenler: 'sag', oklar: 'alt', baglamsal_etkenler: 'alt', islevsellik: 'ust'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c), me = Object.assign({}, ORN, ay.metinler || {});
      const zm = id => v6Gor(c, v6Zaman(ay, id, null, null), .2, .6);
      const okP = ay.cumleler && ay.cumleler.oklar != null ? v6Gor(c, ay.cumleler.oklar, 0, .8) : 0;
      const okR = karis(NV, R.mavi, okP), okW = 2.6 + 1.4 * okP;
      const ok = (x1, y1, x2, y2, o) => `<g opacity="${n1(o)}">${v6Ok(k, x1, y1, x2, y2, okR, okW, true, 12)}</g>`;
      const m = id => { const [x, y, w, h] = B[id]; return [x + w / 2, y, y + h]; };
      // oklar: sağlık durumu -> üç bileşen; bileşenler arası; alttaki bağlamsal etkenler hattı
      let s = P(['oklar'], () => { let g = ''; const [sx, , sa] = m('saglik_durumu');
        ['vucut_islevleri', 'etkinlik', 'katilim'].forEach(id => { const [x, y0] = m(id); g += ok(sx + (x - sx) * .12, sa + 8, x, y0 - 8, Math.min(zm('saglik_durumu'), zm(id))); });
        g += ok(318, 280, 347, 280, Math.min(zm('vucut_islevleri'), zm('etkinlik'))) + ok(653, 280, 682, 280, Math.min(zm('etkinlik'), zm('katilim')));
        const ob = Math.max(zm('cevresel_etkenler'), zm('kisisel_etkenler'));
        g += `<g opacity="${n1(ob)}"><path d="M165 420 L835 420 M290 420 L290 470 M710 420 L710 470" fill="none" stroke="${okR}" stroke-width="${k.W2(okW)}" stroke-linecap="round"/></g>`;
        ['vucut_islevleri', 'etkinlik', 'katilim'].forEach(id => { const [x, , y1] = m(id); g += ok(x, 420, x, y1 + 8, Math.min(ob, zm(id))); });
        return g; });
      const kutu = (id, dolgu, cizgi) => { const [x, y, w, h] = B[id], p = zm(id); if (p <= 0) return '';
        const ust = String(ay.adlar && ay.adlar[id] || AD[id]).split('|'), alt = ay.ornekler === false ? [] : [me[id]];
        const ids = [id]; if (id.endsWith('_etkenler')) ids.push('baglamsal_etkenler'); else if (id !== 'saglik_durumu') ids.push('islevsellik');
        return `<g opacity="${n1(p)}" transform="translate(0 ${n1(10 * (1 - p))})">` + P(ids, () => v6Kutu(k, x, y, w, h, {dolgu, cizgi, k: 2.6})
          + v6Satirlar(c, x + w / 2, y + h / 2 - (alt.length ? c.fs(14) : 0), ust, w - 26, {px: 25, fw: 800, ff: 'Outfit', renk: R.lacivert})
          + (alt.length ? v6Satirlar(c, x + w / 2, y + h / 2 + c.fs(ust.length > 1 ? 34 : 22), alt, w - 26, {px: 18, fw: 500, renk: R.soluk}) : '')) + '</g>'; };
      s += kutu('saglik_durumu', '#FFFFFF', NV) + kutu('vucut_islevleri', V6.acikMavi, R.mavi) + kutu('etkinlik', V6.acikMavi, R.mavi) + kutu('katilim', V6.acikMavi, R.mavi)
        + kutu('cevresel_etkenler', V6.acikSari, V6.sariC) + kutu('kisisel_etkenler', V6.acikSari, V6.sariC);
      return s; }};
};

// ---------------------------------------------------------------- dört etik ilke (Beauchamp ve Childress): dört sütunlu yapı
// ayar: {cumleler: [özerklik, yararlılık, zarar vermeme, adalet], denge_cumle, baslik: "..."}
CIZ.etik_ilkeler = (c, ay) => {
  const X = [185, 395, 605, 815], ID = ['ozerklik', 'yararlilik', 'zarar_vermeme', 'adalet'], IK = ['hasta', 'kalp', 'uyari', 'kalabalik'];
  const AD = [L('Özerklik', 'Autonomy'), L('Yararlılık', 'Beneficence'), L('Zarar|vermeme', 'Non-|maleficence'), L('Adalet', 'Justice')];
  const a = {cati: [500, 96], taban: [500, 512], denge: [500, 430]}; ID.forEach((id, i) => a[id] = [X[i], 420]);
  const takma = {etik: 'cati', ilkeler: 'cati', autonomy: 'ozerklik', beneficence: 'yararlilik', non_maleficence: 'zarar_vermeme', justice: 'adalet', catisma: 'denge', birlikte: 'denge'};
  return {w: 1000, h: 560, cm: 1.05, a: takmaAd(a, takma), takma,
    yer: {cati: 'ust', taban: 'alt', denge: 'alt', ozerklik: 'sol', yararlilik: 'ust', zarar_vermeme: 'ust', adalet: 'sag'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c);
      let s = P(['taban'], () => k.yol('M40 470 L960 470 L960 496 L40 496 Z', V6.gri, NV, 2.4) + k.yol('M16 496 L984 496 L984 528 L16 528 Z', '#E3E8EF', NV, 2.4));
      s += P(['cati'], () => k.yol('M50 150 L500 34 L950 150 Z', V6.acikMavi, NV, 2.6) + k.yol('M60 150 L940 150 L940 182 L60 182 Z', '#FFFFFF', NV, 2.4)
        + v6Yazi(c, 500, 132, ay.baslik || L('Sağlık etiğinin ilkeleri', 'Principles of health ethics'), 560, {px: 26, fw: 800, ff: 'Outfit', renk: R.lacivert}));
      ID.forEach((id, i) => { const x = X[i], p = v6Gor(c, v6Zaman(ay, id, i, null), .3 + i * .25, .7);
        s += k.yol(`M${x - 66} 190 L${x + 66} 190 L${x + 66} 462 L${x - 66} 462 Z`, 'none', AR.kesik, 1.8, `stroke-dasharray="${k.W2(7)} ${k.W2(6)}"`);
        if (p <= 0) return;
        const h = 272 * yum(p), y0 = 462 - h;
        s += `<g opacity="${n1(kis(p * 1.6))}">` + P([id], () => { let g = k.yol(`M${x - 62} ${n1(y0 + 14)} L${x + 62} ${n1(y0 + 14)} L${x + 62} 462 L${x - 62} 462 Z`, '#FFFFFF', NV, 2.4);
          [-36, -12, 12, 36].forEach(dx => g += k.yol(`M${x + dx} ${n1(Math.min(y0 + 30, 446))} L${x + dx} 446`, 'none', AR.kesik, 1.6));
          g += k.yol(`M${x - 74} ${n1(y0)} L${x + 74} ${n1(y0)} L${x + 74} ${n1(y0 + 16)} L${x - 74} ${n1(y0 + 16)} Z`, V6.acikMavi, NV, 2.2);
          if (p > .85) { const q = kis((p - .85) / .15);
            g += `<g opacity="${n1(q)}"><circle cx="${x}" cy="250" r="36" fill="${V6.acikMavi}" stroke="${R.mavi}" stroke-width="${k.W2(2)}"/>${v6Ikon(IK[i], x, 250, 48, i === 2 ? R.sari : R.mavi)}`
              + v6Satirlar(c, x, 350, String(AD[i]).split('|'), 118, {px: 24, fw: 800, ff: 'Outfit', renk: R.lacivert}) + '</g>'; }
          return g; }) + '</g>'; });
      if (ay.denge_cumle != null) { const p = v6Gor(c, ay.denge_cumle, 0, .8);
        if (p > 0) s += `<g opacity="${n1(p)}">` + P(['denge'], () => [0, 1, 2].map(i => v6Ok(k, X[i] + 70, 430, X[i + 1] - 70, 430, '#C98A1C', 3.4, true, 11)).join('')
          + v6Yazi(c, 500, 517, ay.denge_yazi || L('birlikte tartılır', 'weighed together'), 400, {px: 18, fw: 800, renk: '#9A6A10'})) + '</g>'; }
      return s; }};
};

// ---------------------------------------------------------------- PRISMA 2020 akış şeması (Page ve ark. 2021): solda aşamalar, ortada kayıtlar, sağda dışlananlar
// ayar: {sayilar: {bulunan, tekrar, taranan, dislanan_ozet, tam_metin, dislanan_tam, dahil, meta}, nedenler: [["...", n], ...], cumleler: {tanimlama, tarama, tam_metin, dahil}, ornek: true}
CIZ.prisma_akisi = (c, ay) => {
  const S = Object.assign({bulunan: 1200, tekrar: 300, taranan: 900, dislanan_ozet: 840, tam_metin: 60, dislanan_tam: 45, dahil: 15, meta: 12}, ay.sayilar || {});
  const ned = ay.nedenler || [[L('uygun olmayan tasarım', 'ineligible design'), 20], [L('farklı hasta grubu', 'different population'), 15], [L('ilgili sonuç yok', 'no relevant outcome'), 10]];
  const n = v => `(n = ${v})`;
  const B = {bulunan_kayitlar: [90, 34, 480, 96], taranan_kayitlar: [90, 204, 480, 84], tam_metin: [90, 364, 480, 84], dahil_edilen: [90, 530, 480, 96],
    tekrarlar: [670, 44, 510, 76], dislanan_ozet: [670, 206, 510, 80], dislanan_tam_metin: [670, 326, 510, 160]};
  const a = {}; Object.entries(B).forEach(([id, [x, y, w, h]]) => a[id] = [x + w / 2, y + h / 2]);
  Object.assign(a, {tanimlama: [32, 82], tarama: [32, 326], dahil_etme: [32, 578], meta_analiz: [330, 600], dislama_nedenleri: [925, 440]});
  const takma = {bulunan: 'bulunan_kayitlar', kayitlar: 'bulunan_kayitlar', tekrar: 'tekrarlar', taranan: 'taranan_kayitlar', baslik_ozet: 'dislanan_ozet', tam_metinler: 'tam_metin',
    dislanan_tam: 'dislanan_tam_metin', nedenler: 'dislama_nedenleri', dahil: 'dahil_edilen', meta: 'meta_analiz'};
  const ZM = {bulunan_kayitlar: 'tanimlama', tekrarlar: 'tanimlama', taranan_kayitlar: 'tarama', dislanan_ozet: 'tarama', tam_metin: 'tam_metin', dislanan_tam_metin: 'tam_metin', dahil_edilen: 'dahil'};
  return {w: 1200, h: 650, cm: 1.05, a: takmaAd(a, takma), takma, vurguEsle: {dislama_nedenleri: 'dislanan_tam_metin', meta_analiz: 'dahil_edilen'},
    yer: {bulunan_kayitlar: 'sol', taranan_kayitlar: 'sol', tam_metin: 'sol', dahil_edilen: 'sol', tekrarlar: 'sag', dislanan_ozet: 'sag', dislanan_tam_metin: 'sag', dislama_nedenleri: 'sag',
      tanimlama: 'sol', tarama: 'sol', dahil_etme: 'sol', meta_analiz: 'alt'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c), zm = id => v6Gor(c, ay.cumleler ? ay.cumleler[ZM[id]] : null, .2, .6);
      // aşama şeritleri
      const asama = (id, y0, y1, m) => P([id], () => `<rect x="8" y="${y0}" width="48" height="${y1 - y0}" rx="12" fill="${V6.acikMavi}" stroke="${R.mavi}" stroke-width="${k.W2(1.6)}"/>`
        + v6Yazi(c, 32, (y0 + y1) / 2, m, y1 - y0 - 12, {px: 19, fw: 800, renk: R.mavi, ek: `transform="rotate(-90 32 ${(y0 + y1) / 2}) translate(0 ${n1(c.fs(7))})"`}));
      let s = asama('tanimlama', 30, 134, L('Tanımlama', 'Identification')) + asama('tarama', 150, 496, L('Tarama', 'Screening')) + asama('dahil_etme', 512, 630, L('Dahil etme', 'Included'));
      const ok = (id, x1, y1, x2, y2) => { const p = zm(id); return p > 0 ? `<g opacity="${n1(p)}">${v6Ok(k, x1, y1, x2, y2, NV, 2.6, false, 12)}</g>` : ''; };
      s += ok('taranan_kayitlar', 330, 132, 330, 202) + ok('tam_metin', 330, 290, 330, 362) + ok('dahil_edilen', 330, 450, 330, 528);
      s += ok('tekrarlar', 572, 82, 668, 82) + ok('dislanan_ozet', 572, 246, 668, 246) + ok('dislanan_tam_metin', 572, 406, 668, 406);
      const kutu = (id, satirlar, o = {}) => { const [x, y, w, h] = B[id], p = zm(id); if (p <= 0) return '';
        return `<g opacity="${n1(p)}">` + P([id].concat(o.ek || []), () => v6Kutu(k, x, y, w, h, {dolgu: o.dolgu || '#FFFFFF', cizgi: o.cizgi || NV, r: 12})
          + v6Satirlar(c, x + w / 2, y + h / 2, satirlar, w - 28, {px: o.px || 21, fw: 600, renk: R.lacivert, renkler: o.renkler})) + '</g>'; };
      s += kutu('bulunan_kayitlar', [L('Veri tabanlarında bulunan kayıtlar', 'Records identified from databases'), n(S.bulunan)]);
      s += kutu('tekrarlar', [L('Çıkarılan tekrar kayıtlar', 'Duplicate records removed'), n(S.tekrar)], {dolgu: V6.gri, cizgi: AR.ince});
      s += kutu('taranan_kayitlar', [L('Başlık ve özeti taranan kayıtlar', 'Records screened (title, abstract)'), n(S.taranan)]);
      s += kutu('dislanan_ozet', [L('Dışlanan kayıtlar', 'Records excluded'), n(S.dislanan_ozet)], {dolgu: V6.gri, cizgi: AR.ince});
      s += kutu('tam_metin', [L('Tam metni değerlendirilen', 'Full texts assessed'), n(S.tam_metin)]);
      s += kutu('dislanan_tam_metin', [L('Dışlanan tam metinler', 'Full texts excluded') + ' ' + n(S.dislanan_tam)].concat(ned.map(([m, v]) => `• ${m} ${n(v)}`)), {dolgu: V6.gri, cizgi: AR.ince, px: 19, ek: ['dislama_nedenleri'],
        renkler: [R.lacivert, R.soluk, R.soluk, R.soluk, R.soluk]});
      s += kutu('dahil_edilen', [L('Dahil edilen çalışmalar', 'Studies included') + ' ' + n(S.dahil), S.meta != null ? L('meta-analizde', 'in meta-analysis') + ' ' + n(S.meta) : ''], {dolgu: V6.acikMavi, cizgi: R.mavi, ek: ['meta_analiz']});
      if (ay.ornek) s += c.yazi(1180, 640, L('sayılar örnektir', 'numbers are examples'), {a: 'end', px: 17, fw: 600, renk: R.soluk});
      return s; }};
};

// ---------------------------------------------------------------- soy ağacı (pedigri): standart semboller (Bennett ve ark. 2008, NSGC)
// ayar: {tip: "resesif" | "dominant" | "x_bagli" | "mitokondriyal" | "dort", tasiyici_cumle, etkilenmis_cumle, proband_cumle, akraba_cumle, lejant: false, cumleler: [..] (dort: dört panel)}
const PEDIGRI = {
  resesif: {k: {f: [1, 400, 'e', 't'], m: [1, 600, 'k', 't'], c1: [2, 220, 'e', 'n'], c2: [2, 413, 'k', 'a'], c3: [2, 607, 'e', 'n'], c4: [2, 800, 'k', 'n']},
    ciftler: [['f', 'm', true, ['c1', 'c2', 'c3', 'c4']]], proband: 'c2'},
  dominant: {k: {a: [1, 300, 'e', 'a'], b: [1, 500, 'k', 'n'], c1: [2, 180, 'k', 'a'], c2: [2, 400, 'e', 'n'], c3: [2, 620, 'e', 'a'], c3e: [2, 820, 'k', 'n'], d1: [3, 620, 'e', 'a'], d2: [3, 820, 'k', 'n']},
    ciftler: [['a', 'b', false, ['c1', 'c2', 'c3']], ['c3', 'c3e', false, ['d1', 'd2']]], proband: 'd1'},
  x_bagli: {k: {a: [1, 300, 'e', 'n'], b: [1, 500, 'k', 't'], c1: [2, 200, 'e', 'a'], c3: [2, 360, 'k', 'n'], c2: [2, 520, 'k', 't'], c2e: [2, 720, 'e', 'n'], d1: [3, 520, 'e', 'a'], d2: [3, 720, 'k', 'n']},
    ciftler: [['a', 'b', false, ['c1', 'c3', 'c2']], ['c2', 'c2e', false, ['d1', 'd2']]], proband: 'd1'},
  mitokondriyal: {k: {a: [1, 300, 'e', 'n'], b: [1, 500, 'k', 'a'], c1e: [2, 80, 'k', 'n'], c1: [2, 230, 'e', 'a'], c3: [2, 400, 'k', 'a'], c2: [2, 570, 'k', 'a'], c2e: [2, 760, 'e', 'n'],
    d1: [3, 80, 'e', 'n'], d2: [3, 230, 'k', 'n'], d3: [3, 580, 'e', 'a'], d4: [3, 760, 'k', 'a']},
    ciftler: [['a', 'b', false, ['c1', 'c3', 'c2']], ['c1e', 'c1', false, ['d1', 'd2']], ['c2', 'c2e', false, ['d3', 'd4']]], proband: 'c3'}};
const PED_AD = {resesif: L('Otozomal resesif', 'Autosomal recessive'), dominant: L('Otozomal dominant', 'Autosomal dominant'), x_bagli: L("X'e bağlı", 'X-linked'), mitokondriyal: L('Mitokondriyal', 'Mitochondrial')};
const PED_ALT = {resesif: L('iki kopya gerekir; ebeveynler taşıyıcı', 'two copies needed; parents are carriers'), dominant: L('tek kopya yeter; her kuşakta görülür', 'one copy is enough; seen in every generation'),
  x_bagli: L('erkekler etkilenir; anneler taşıyıcı', 'males affected; mothers are carriers'), mitokondriyal: L('yalnız anneden geçer', 'passed on only by the mother')};
function pedigriCiz(c, k, P, tip, o) {
  // o: {ox, oy, s (x ölçeği), gy: [kuşak y], r, p: {tas, etk, pro, akr}, kusak: true}
  const T = PEDIGRI[tip], X = x => o.ox + x * o.s, Y = g => o.gy[g - 1], r = o.r;
  let s = '';
  const cizgi = (d, w = 2.4, renk = NV, ek = '') => `<path d="${d}" fill="none" stroke="${renk}" stroke-width="${k.W2(w)}" stroke-linecap="round" ${ek}/>`;
  T.ciftler.forEach(([a1, b1, akraba, cocuk]) => { const A = T.k[a1], Bk = T.k[b1], y = Y(A[0]), xa = X(A[1]), xb = X(Bk[1]), xm = (xa + xb) / 2;
    if (akraba) s += P(['akraba_evliligi', 'evlilik'], () => cizgi(`M${n1(xa + r)} ${n1(y - r * .16)} L${n1(xb - r)} ${n1(y - r * .16)} M${n1(xa + r)} ${n1(y + r * .16)} L${n1(xb - r)} ${n1(y + r * .16)}`, 2.4, karis(NV, R.mavi, o.p.akr)));
    else s += P(['evlilik'], () => cizgi(`M${n1(xa + r)} ${n1(y)} L${n1(xb - r)} ${n1(y)}`));
    const cs = cocuk.map(id => T.k[id]), yc = Y(cs[0][0]), ys = (y + yc) / 2 + r * .1;
    s += P(['soy_cizgisi'], () => cizgi(`M${n1(xm)} ${n1(y)} L${n1(xm)} ${n1(ys)} M${n1(Math.min(xm, ...cs.map(q => X(q[1]))))} ${n1(ys)} L${n1(Math.max(xm, ...cs.map(q => X(q[1]))))} ${n1(ys)}`
      + cs.map(q => ` M${n1(X(q[1]))} ${n1(ys)} L${n1(X(q[1]))} ${n1(yc - r)}`).join(''))); });
  Object.entries(T.k).forEach(([id, [g, x0, cins, dr]]) => { const x = X(x0), y = Y(g), etk = dr === 'a', tas = dr === 't';
    const dol = etk ? karis('#FFFFFF', R.mavi, o.p.etk) : '#FFFFFF', ids = ['kisi_' + id, g === 1 ? 'ebeveynler' : g === 2 ? 'cocuklar' : 'ucuncu_kusak'];
    if (etk) ids.push('etkilenmis'); if (tas) ids.push('tasiyicilar');
    s += P(ids, () => (cins === 'e' ? `<rect x="${n1(x - r)}" y="${n1(y - r)}" width="${n1(2 * r)}" height="${n1(2 * r)}" fill="${dol}" stroke="${NV}" stroke-width="${k.W2(2.4)}"/>`
      : `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(r)}" fill="${dol}" stroke="${NV}" stroke-width="${k.W2(2.4)}"/>`)
      + (tas && o.p.tas > 0 ? `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(r * .3 * o.p.tas)}" fill="${NV}"/>` : '')); });
  if (T.proband && o.p.pro > 0) { const [g, x0] = T.k[T.proband], x = X(x0) - r * 1.1, y = Y(g) + r * 1.1;
    s += `<g opacity="${n1(o.p.pro)}">` + P(['proband', 'indeks_olgu'], () => cizgi(`M${n1(x - r * 1.1)} ${n1(y + r * 1.1)} L${n1(x)} ${n1(y)}`, 2.6, R.sag_kulak) + okBasi(x, y, -Math.PI / 4, k.w(12), R.sag_kulak, k.w(2.6))
      + c.yazi(x - r * 1.25, y + r * 1.25 + c.fs(16), 'P', {px: 16, fw: 800, renk: R.sag_kulak})) + '</g>'; }
  if (o.kusak !== false) { const gn = Math.max(...Object.values(T.k).map(q => q[0]));
    s += P(['kusaklar'], () => ['I', 'II', 'III'].slice(0, gn).map((m, i) => c.yazi(o.kx, Y(i + 1) + c.fs(8), m, {px: o.kpx || 22, fw: 800, ff: 'Outfit', renk: R.soluk})).join('')); }
  return s;
}
CIZ.pedigri = (c, ay) => {
  const tip = ay.tip || 'resesif';
  if (tip === 'dort') {
    const tipler = ['resesif', 'dominant', 'x_bagli', 'mitokondriyal'], kare = ay.duzen === 'kare', H = kare ? [[20, 20], [520, 20], [20, 360], [520, 360]] : [[10, 10], [500, 10], [990, 10], [1480, 10]];
    const a = {}; tipler.forEach((t, i) => a[t] = [H[i][0] + 230, H[i][1] + 26]);
    const takma = {otozomal_resesif: 'resesif', otozomal_dominant: 'dominant', x: 'x_bagli', mitokondri: 'mitokondriyal'};
    return {w: kare ? 1000 : 1950, h: kare ? 700 : 340, cm: 1.05, a: takmaAd(a, takma), takma, yer: kare ? {resesif: 'sol', x_bagli: 'sol', dominant: 'sag', mitokondriyal: 'sag'} : {resesif: 'ust', x_bagli: 'ust', dominant: 'ust', mitokondriyal: 'ust'},
      svg: () => { const k = kalem(c, 1), P = anP(c); let s = '';
        tipler.forEach((t, i) => { const [hx, hy] = H[i], p = v6Gor(c, v6Zaman(ay, t, i, null), .3 + i * .3, .7);
          s += `<rect x="${hx}" y="${hy}" width="460" height="320" rx="18" fill="none" stroke="${AR.kesik}" stroke-width="${k.W2(1.6)}" stroke-dasharray="${k.W2(7)} ${k.W2(6)}"/>`;
          if (p <= 0) return;
          const gn = Math.max(...Object.values(PEDIGRI[t].k).map(q => q[0])), gy = gn === 2 ? [hy + 130, hy + 240] : [hy + 110, hy + 190, hy + 270];
          s += `<g opacity="${n1(p)}">` + P([t], () => `<rect x="${hx}" y="${hy}" width="460" height="320" rx="18" fill="#FFFFFF" stroke="${AR.kesik}" stroke-width="${k.W2(1.6)}"/>`
            + v6Yazi(c, hx + 230, hy + 38, PED_AD[t], 420, {px: 24, fw: 800, ff: 'Outfit', renk: R.lacivert}) + v6Yazi(c, hx + 230, hy + 68, PED_ALT[t], 430, {px: 17, fw: 600, renk: R.soluk})
            + pedigriCiz(c, k, P, t, {ox: hx + 40, oy: hy, s: .44, gy, r: 13, kx: hx + 22, kpx: 15, p: {tas: 1, etk: 1, pro: 0, akr: 0}})) + '</g>'; });
        return s; }};
  }
  const T = PEDIGRI[tip] || PEDIGRI.resesif, gn = Math.max(...Object.values(T.k).map(q => q[0])), lej = !!ay.lejant;
  const gy = gn === 2 ? [150, 380] : [110, 290, 470], h = (gn === 2 ? 500 : 580) + (lej ? 70 : 0);
  const a = {kusaklar: [50, gy[0]], akraba_evliligi: [500, gy[0]], evlilik: [500, gy[0]], tasiyicilar: [T.k.f ? 400 : 500, gy[0]], proband: null, ebeveynler: [400, gy[0] - 34], cocuklar: [500, gy[1] + 34]};
  const pr = T.k[T.proband]; a.proband = [100 + pr[1] * .9, gy[pr[0] - 1] + 30]; a.indeks_olgu = a.proband;
  const et = Object.entries(T.k).find(([, q]) => q[3] === 'a'); a.etkilenmis = [100 + et[1][1] * .9, gy[et[1][0] - 1] + 30];
  const ta = Object.entries(T.k).find(([, q]) => q[3] === 't'); if (ta) a.tasiyicilar = [100 + ta[1][1] * .9, gy[ta[1][0] - 1] - 30];
  if (gn > 2) a.ucuncu_kusak = [500, gy[2] + 34];
  Object.entries(T.k).forEach(([id, q]) => a['kisi_' + id] = [100 + q[1] * .9, gy[q[0] - 1]]);
  const takma = {cift_cizgi: 'akraba_evliligi', akraba: 'akraba_evliligi', tasiyici: 'tasiyicilar', etkilenmis_kisi: 'etkilenmis', kusak: 'kusaklar', anne_baba: 'ebeveynler'};
  return {w: 1000, h, cm: 1.05, a: takmaAd(a, takma), takma,
    yer: {kusaklar: 'sol', akraba_evliligi: 'ust', evlilik: 'ust', tasiyicilar: 'ust', ebeveynler: 'ust', proband: 'alt', indeks_olgu: 'alt', etkilenmis: 'alt', cocuklar: 'alt', ucuncu_kusak: 'alt'},
    svg: () => { const k = kalem(c, 1), P = anP(c);
      const p = {tas: v6Gor(c, ay.tasiyici_cumle, 0, .6), etk: v6Gor(c, ay.etkilenmis_cumle, 0, .6), pro: ay.proband === false ? 0 : v6Gor(c, ay.proband_cumle ?? ay.etkilenmis_cumle, 0, .6),
        akr: ay.akraba_cumle != null ? v6Gor(c, ay.akraba_cumle, 0, .6) : 0};
      let s = pedigriCiz(c, k, P, tip, {ox: 100, oy: 0, s: .9, gy, r: 30, kx: 40, p});
      if (lej) { const y = h - 40, it = [['e', 'n', L('erkek', 'male')], ['k', 'n', L('kadın', 'female')], ['e', 'a', L('etkilenmiş', 'affected')], ['k', 't', L('taşıyıcı', 'carrier')]];
        s += P(['lejant'], () => it.map(([cn, dr, m], i) => { const x = 120 + i * 210, r = 14, dol = dr === 'a' ? R.mavi : '#FFFFFF';
          return (cn === 'e' ? `<rect x="${x - r}" y="${y - r}" width="${2 * r}" height="${2 * r}" fill="${dol}" stroke="${NV}" stroke-width="${k.W2(2)}"/>` : `<circle cx="${x}" cy="${y}" r="${r}" fill="${dol}" stroke="${NV}" stroke-width="${k.W2(2)}"/>`)
            + (dr === 't' ? `<circle cx="${x}" cy="${y}" r="${r * .3}" fill="${NV}"/>` : '') + c.yazi(x + 26, y + c.fs(6), m, {a: 'start', px: 17, fw: 600}); }).join('')); }
      return s; }};
};

// ---------------------------------------------------------------- dudak biçimleri (görsemler): yüzün alt yarısı, önden
// ayar: {bicimler: ["kapali","dis_dudak","dil_dis","one_uzanan","gorunmez"], cumleler: [1,2,3,4,5], harfler: {kapali: "p b m", ...}, aciklamalar: {...}}
// biçimler: kapali (p b m), dis_dudak (f v), dil_dis (t d n s z), one_uzanan (ş ç c j), yuvarlak (o u), genis_acik (a), gorunmez (k g h)
const DUDAK_HARF = {kapali: 'p  b  m', dis_dudak: 'f  v', dil_dis: 't  d  n  s  z', one_uzanan: L('ş  ç  c  j', 'sh  ch  j'), yuvarlak: 'o  u', genis_acik: 'a', gorunmez: 'k  g  h'};
const DUDAK_ACK = {kapali: L('dudaklar kapanır', 'lips close'), dis_dudak: L('alt dudak üst dişe', 'lower lip to upper teeth'), dil_dis: L('dil diş arkasında', 'tongue behind teeth'),
  one_uzanan: L('dudaklar öne uzanır', 'lips push forward'), yuvarlak: L('dudaklar yuvarlak', 'rounded lips'), genis_acik: L('ağız geniş açık', 'mouth wide open'), gorunmez: L('dudakta görünmez', 'not visible on the lips')};
function dudakCiz(k, bic) {
  const D = (d, f, s = V6.dudakC, w = 2.2) => k.yol(d, f, s, w), A = d => k.yol(d, V6.agiz, V6.dudakC, 1.6);
  const disU = (y0, y1, x0 = 112, x1 = 188) => { let g = `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="3" fill="${V6.dis}" stroke="${AR.ince}" stroke-width="${k.W2(1.2)}"/>`;
    for (let i = 1; i < 6; i++) { const x = x0 + (x1 - x0) * i / 6; g += `<path d="M${n1(x)} ${y0} L${n1(x)} ${y1}" stroke="${AR.ince}" stroke-width="${k.W2(1)}"/>`; } return g; };
  const kid = uid('dg'), klip = d => `<defs><clipPath id="${kid}"><path d="${d}"/></clipPath></defs>`;
  switch (bic) {
    case 'kapali': return D('M88 150 C 106 132 132 128 150 136 C 168 128 194 132 212 150 C 180 154 120 154 88 150 Z', V6.dudak) + D('M88 150 C 120 154 180 154 212 150 C 196 174 104 174 88 150 Z', V6.dudak)
      + k.yol('M86 150 C 120 156 180 156 214 150', 'none', V6.agiz, 2.8);
    case 'dis_dudak': return A('M92 146 C 120 142 180 142 208 146 C 190 166 110 166 92 146 Z') + disU(142, 160) + D('M90 144 C 106 124 132 120 150 128 C 168 120 194 124 210 144 C 182 140 118 140 90 144 Z', V6.dudak)
      + D('M98 160 C 120 154 180 154 202 160 C 192 180 108 180 98 160 Z', V6.dudak);
    case 'dil_dis': { const op = 'M94 150 C 118 138 182 138 206 150 C 184 168 116 168 94 150 Z';
      return A(op) + klip(op) + `<g clip-path="url(#${kid})">${k.yol(gElips(150, 156, 34, 10), V6.dil, null)}${disU(136, 149)}${disU(158, 166, 118, 182)}</g>`
        + D('M88 148 C 106 126 132 122 150 130 C 168 122 194 126 212 148 C 188 140 112 140 88 148 Z', V6.dudak) + D('M90 152 C 114 166 186 166 210 152 C 196 184 104 184 90 152 Z', V6.dudak); }
    case 'one_uzanan': { const op = 'M116 149 C 128 135 172 135 184 149 C 174 164 126 164 116 149 Z';
      return A(op) + klip(op) + `<g clip-path="url(#${kid})">${disU(134, 149, 118, 182)}${disU(149, 162, 120, 180)}</g>`
        + D('M100 147 C 108 114 136 110 150 118 C 164 110 192 114 200 147 C 182 132 118 132 100 147 Z', V6.dudak) + D('M100 151 C 118 166 182 166 200 151 C 194 190 106 190 100 151 Z', V6.dudak)
        + k.yol('M104 132 C 98 140 98 156 104 166 M196 132 C 202 140 202 156 196 166', 'none', V6.dudakC, 1.4); }
    case 'yuvarlak': return k.yol(gElips(150, 152, 46, 40), V6.dudak, V6.dudakC, 2.2) + A(gElips(150, 152, 20, 19))
      + [0, 1, 2, 3, 4, 5, 6, 7].map(i => { const a = i * Math.PI / 4; return k.yol(`M${n1(150 + 26 * Math.cos(a))} ${n1(152 + 25 * Math.sin(a))} L${n1(150 + 38 * Math.cos(a))} ${n1(152 + 34 * Math.sin(a))}`, 'none', V6.dudakC, 1.2); }).join('');
    case 'genis_acik': { const op = 'M92 140 C 118 130 182 130 208 140 C 204 198 96 198 92 140 Z';
      return A(op) + klip(op) + `<g clip-path="url(#${kid})">${k.yol(gElips(150, 190, 46, 18), V6.dil, null)}${disU(132, 146, 108, 192)}</g>`
        + D('M86 140 C 104 118 132 114 150 122 C 168 114 196 118 214 140 C 184 132 116 132 86 140 Z', V6.dudak) + D('M94 182 C 120 200 180 200 206 182 C 196 214 104 214 94 182 Z', V6.dudak); }
    default: { const op = 'M98 150 C 120 143 180 143 202 150 C 180 160 120 160 98 150 Z';
      return A(op) + klip(op) + `<g clip-path="url(#${kid})">${disU(142, 149, 116, 184)}</g>`
        + D('M90 148 C 106 128 132 124 150 132 C 168 124 194 128 210 148 C 184 142 116 142 90 148 Z', V6.dudak) + D('M90 152 C 116 162 184 162 210 152 C 196 180 104 180 90 152 Z', V6.dudak); }
  }
}
CIZ.dudak_bicimleri = (c, ay) => {
  const bic = (ay.bicimler || ['kapali', 'dis_dudak', 'dil_dis', 'one_uzanan', 'gorunmez']).slice(0, 7), n = bic.length, PW = 300, ARA = 26, PH = 420;
  const a = {}, yer = {}; bic.forEach((b, i) => { a[b] = [i * (PW + ARA) + PW / 2, 150]; yer[b] = 'ust'; });
  const takma = {p_b_m: 'kapali', f_v: 'dis_dudak', t_d_n_s_z: 'dil_dis', s_c_c_j: 'one_uzanan', o_u: 'yuvarlak', a: 'genis_acik', k_g_h: 'gorunmez', dudak_kapali: 'kapali'};
  return {w: n * PW + (n - 1) * ARA, h: PH, cm: 1.05, a: takmaAd(a, takma), takma, yer,
    svg: () => { const k = kalem(c, 1), P = anP(c), H = Object.assign({}, DUDAK_HARF, ay.harfler || {}), A2 = Object.assign({}, DUDAK_ACK, ay.aciklamalar || {});
      let s = '';
      bic.forEach((b, i) => { const x0 = i * (PW + ARA), p = v6Gor(c, v6Zaman(ay, b, i, null), .3 + i * .25, .6), kid = uid('dp');
        s += `<rect x="${x0}" y="0" width="${PW}" height="${PH}" rx="22" fill="none" stroke="${AR.kesik}" stroke-width="${k.W2(1.6)}" stroke-dasharray="${k.W2(7)} ${k.W2(6)}"/>`;
        if (p <= 0) return;
        s += `<g opacity="${n1(p)}" transform="translate(${x0} 0)">` + P([b], () => `<rect x="0" y="0" width="${PW}" height="${PH}" rx="22" fill="#FFFFFF" stroke="${R.cizgi}" stroke-width="${k.W2(1.8)}"/>`
          + `<defs><clipPath id="${kid}"><rect x="0" y="0" width="${PW}" height="${PH}" rx="22"/></clipPath></defs><g clip-path="url(#${kid})">`
          + k.yol('M24 0 L24 110 C 28 222 84 300 150 312 C 216 300 272 222 276 110 L276 0 Z', V6.ten, null)
          + k.yol('M24 0 L24 110 C 28 222 84 300 150 312 C 216 300 272 222 276 110 L276 0', 'none', NV, 2.4)
          + k.yol('M108 40 C 116 22 134 18 150 26 C 166 18 184 22 192 40', 'none', NV, 2.2) + k.yol(gElips(132, 38, 9, 5), '#B48B7A', null) + k.yol(gElips(168, 38, 9, 5), '#B48B7A', null)
          + k.yol('M141 52 C 140 76 139 100 139 116 M159 52 C 160 76 161 100 161 116', 'none', '#D7BBA9', 1.6)
          + dudakCiz(k, b) + '</g>'
          + v6Yazi(c, PW / 2, 356, H[b] || '', PW - 30, {px: 30, fw: 800, ff: 'Outfit', renk: R.mavi}) + v6Yazi(c, PW / 2, 396, A2[b] || '', PW - 26, {px: 18, fw: 600, renk: R.soluk})) + '</g>'; });
      return s; }};
};

// ---------------------------------------------------------------- göz (önden): ortak çizici
// o: {ix, iy (iris kayması, göz birimi), don (iris dönüşü, derece; üst kutup işareti döner), kapali, kas: false}
function gozOn(k, cx, cy, s, o = {}) {
  const sek = `M${n1(cx - 60 * s)} ${n1(cy)} C ${n1(cx - 30 * s)} ${n1(cy - 36 * s)} ${n1(cx + 30 * s)} ${n1(cy - 36 * s)} ${n1(cx + 60 * s)} ${n1(cy)} C ${n1(cx + 30 * s)} ${n1(cy + 30 * s)} ${n1(cx - 30 * s)} ${n1(cy + 30 * s)} ${n1(cx - 60 * s)} ${n1(cy)} Z`;
  let g = o.kas !== false ? k.yol(`M${n1(cx - 62 * s)} ${n1(cy - 42 * s)} C ${n1(cx - 30 * s)} ${n1(cy - 64 * s)} ${n1(cx + 30 * s)} ${n1(cy - 64 * s)} ${n1(cx + 64 * s)} ${n1(cy - 46 * s)}`, 'none', V6.sac, 5) : '';
  if (o.kapali) return g + k.yol(`M${n1(cx - 60 * s)} ${n1(cy)} C ${n1(cx - 30 * s)} ${n1(cy + 22 * s)} ${n1(cx + 30 * s)} ${n1(cy + 22 * s)} ${n1(cx + 60 * s)} ${n1(cy)}`, 'none', NV, 2.6);
  const kid = uid('go'), ix = cx + (o.ix || 0) * s, iy = cy + (o.iy || 0) * s;
  g += `<defs><clipPath id="${kid}"><path d="${sek}"/></clipPath></defs>` + k.yol(sek, '#FFFFFF', null);
  g += `<g clip-path="url(#${kid})"><g transform="rotate(${n1(o.don || 0)} ${n1(ix)} ${n1(iy)})">` + k.yol(gElips(ix, iy, 23 * s, 23 * s), V6.iris, NV, 1.8)
    + [0, 90, 180, 270].map(a => { const r = a * Math.PI / 180; return k.yol(`M${n1(ix + 12 * s * Math.sin(r))} ${n1(iy - 12 * s * Math.cos(r))} L${n1(ix + 21 * s * Math.sin(r))} ${n1(iy - 21 * s * Math.cos(r))}`, 'none', a ? '#A9C6E8' : '#FFFFFF', a ? 1.4 : 3); }).join('')
    + k.yol(gElips(ix, iy, 9.5 * s, 9.5 * s), NV, null) + `<circle cx="${n1(ix + 5 * s)}" cy="${n1(iy - 6 * s)}" r="${n1(3 * s)}" fill="#FFFFFF"/></g></g>`;
  return g + k.yol(sek, 'none', NV, 2.4) + k.yol(`M${n1(cx - 60 * s)} ${n1(cy)} C ${n1(cx - 30 * s)} ${n1(cy - 38 * s)} ${n1(cx + 30 * s)} ${n1(cy - 38 * s)} ${n1(cx + 60 * s)} ${n1(cy)}`, 'none', NV, 3.6);
}
// yüzün üst bölümü (alın, saç çizgisi, yanaklar, burun kökü); gözler (cx -/+ 82 s, cy). Çizim kirp: true olmalı.
function yuzUst(k, cx, cy, s) {
  const p = (x, y) => `${n1(cx + x * s)} ${n1(cy + y * s)}`;
  const dis = `M${p(-200, 190)} C ${p(-212, 40)} ${p(-206, -110)} ${p(-172, -170)} C ${p(-110, -250)} ${p(110, -250)} ${p(172, -170)} C ${p(206, -110)} ${p(212, 40)} ${p(200, 190)}`;
  return k.yol(dis + ' Z', V6.ten, null) + k.yol(`M${p(-182, -146)} C ${p(-120, -246)} ${p(120, -246)} ${p(182, -146)} C ${p(120, -196)} ${p(-120, -196)} ${p(-182, -146)} Z`, V6.sac, null)
    + k.yol(dis, 'none', NV, 2.4)
    + k.yol(`M${p(-18, -20)} C ${p(-16, 40)} ${p(-24, 90)} ${p(-32, 120)} M${p(18, -20)} C ${p(16, 40)} ${p(24, 90)} ${p(32, 120)}`, 'none', '#C9A894', 2.2);
}
const v6Taraf = (c, x, y, sag, px = 18) => c.yazi(x, y, sag ? L('sağ göz', 'right eye') : L('sol göz', 'left eye'), {px, fw: 700, renk: sag ? R.sag_kulak : R.sol_kulak});
// kavisli ok: merkez, yarıçap, açı a0 -> a1 (derece; 0 sağ, -90 yukarı)
function v6Yay(k, cx, cy, r, a0, a1, renk, w = 4, cift = false) {
  const p = a => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)], A = p(a0), B = p(a1), buyuk = Math.abs(a1 - a0) > 180 ? 1 : 0, sw = a1 > a0 ? 1 : 0;
  const t = (a1 > a0 ? 1 : -1) * Math.PI / 2;
  return `<path d="M${n1(A[0])} ${n1(A[1])} A${r} ${r} 0 ${buyuk} ${sw} ${n1(B[0])} ${n1(B[1])}" fill="none" stroke="${renk}" stroke-width="${k.W2(w)}" stroke-linecap="round"/>`
    + okBasi(B[0], B[1], a1 * Math.PI / 180 + t, k.w(13), renk, k.w(w)) + (cift ? okBasi(A[0], A[1], a0 * Math.PI / 180 - t, k.w(13), renk, k.w(w)) : '');
}

// ---------------------------------------------------------------- göz önden: nistagmus yönü (hızlı faz). Sağ göz görüntünün solunda.
// ayar: {dikey: "yukari"|"asagi", yatay: "sag"|"sol", torsiyon: "sag"|"sol" (üst kutbun vurduğu kulak), kulak: "sag"|"sol" (alttaki kulak işareti),
//        dikey_cumle, torsiyon_cumle, yatay_cumle, kulak_cumle, hareket: true,
//        grafik: {...} (isteğe bağlı: CIZ.grafik ile aynı biçimde grafik çizilir, gözler grafiğin sağ üstünde küçük bir pencerede; goz_kutusu: [x, y, w, h])}
CIZ.goz_nistagmus = (c, ay) => {
  const gr = ay.grafik ? CIZ.grafik(c, ay.grafik) : null, kSag = (ay.kulak || ay.torsiyon) !== 'sol';
  let w = 900, h = 520, s = 1.55, cx = 450, cy = 270, kx = kSag ? 46 : 854, ky = cy, kut = null;
  if (gr) { kut = ay.goz_kutusu || [gr.w - 350, 40, 320, 196]; w = gr.w; h = gr.h; s = .74; cx = kut[0] + kut[2] / 2 + (kSag ? 22 : -22); cy = kut[1] + 92; kx = kSag ? kut[0] + 36 : kut[0] + kut[2] - 36; ky = cy - 10; }
  const gx = [cx - 82 * s, cx + 82 * s];
  const a = Object.assign({}, gr ? gr.a : {}, {sag_goz: [gx[0], cy], sol_goz: [gx[1], cy], hizli_faz: [gx[0], cy - 70 * s], dikey: [gx[0], cy - 70 * s], torsiyon: [gx[1] + 30 * s, cy - 32 * s],
    ust_kutup: [gx[1], cy - 22 * s], yatay: [cx, cy + 104 * s], alttaki_kulak: [kx, ky]});
  const takma = {hizli_faz_yonu: 'hizli_faz', yukari_vuran: 'dikey', torsiyonel: 'torsiyon', kulak: 'alttaki_kulak'};
  const yer = Object.assign({}, gr ? gr.yer || {} : {}, {sag_goz: 'alt', sol_goz: 'alt', hizli_faz: 'ust', dikey: 'ust', torsiyon: 'sag', ust_kutup: 'ust', yatay: 'alt', alttaki_kulak: gr ? 'sol' : 'alt'});
  return {w, h, cm: 1.05, kirp: !gr, a: takmaAd(a, takma), takma, yer, vurguEsle: Object.assign({}, gr ? gr.vurguEsle || {} : {}),
    svg: () => {
      const k = kalem(c, 1), P = anP(c);
      const v = {x: ay.yatay === 'sag' ? -1 : ay.yatay === 'sol' ? 1 : 0, y: ay.dikey === 'yukari' ? -1 : ay.dikey === 'asagi' ? 1 : 0, r: ay.torsiyon === 'sag' ? -1 : ay.torsiyon === 'sol' ? 1 : 0};
      let u = 0; if (ay.hareket !== false && c.t > .3) { const q = ((c.t - .3) / .9) % 1; u = (q < .8 ? 1 - q / .8 : (q - .8) / .2) - .5; }
      const ox = -9 * u * v.x, oy = -9 * u * v.y, dn = -16 * u * v.r;
      let s2 = gr ? gr.svg() : '';
      if (gr) { const kid = uid('gk'); s2 += `<rect x="${kut[0]}" y="${kut[1]}" width="${kut[2]}" height="${kut[3]}" rx="16" fill="${V6.ten}" stroke="${R.cizgi}" stroke-width="${k.W2(1.8)}"/>`; }
      else s2 += yuzUst(k, cx, cy, s);
      s2 += P(['sag_goz', 'gozler'], () => gozOn(k, gx[0], cy, s, {ix: ox, iy: oy, don: dn})) + P(['sol_goz', 'gozler'], () => gozOn(k, gx[1], cy, s, {ix: ox, iy: oy, don: dn}));
      s2 += v6Taraf(c, gx[0], cy + 62 * s + (gr ? 12 : 0), true, gr ? 14 : 18) + v6Taraf(c, gx[1], cy + 62 * s + (gr ? 12 : 0), false, gr ? 14 : 18);
      const ow = gr ? 3.6 : 5;
      if (v.y) { const p = v6Gor(c, ay.dikey_cumle, .5, .6), y0 = v.y < 0 ? cy - 76 * s : cy + 40 * s;
        if (p > 0) s2 += `<g opacity="${n1(p)}">` + P(['dikey', 'hizli_faz'], () => gx.map(x => v6Ok(k, x, y0, x, y0 + v.y * 46 * s, R.mavi, ow, false, gr ? 11 : 16)).join('')) + '</g>'; }
      if (v.x) { const p = v6Gor(c, ay.yatay_cumle, .5, .6);
        if (p > 0) s2 += `<g opacity="${n1(p)}">` + P(['yatay', 'hizli_faz'], () => v6Ok(k, cx - 50 * v.x * s / 1.55, cy + 100 * s, cx + 50 * v.x * s / 1.55, cy + 100 * s, R.mavi, ow, false, gr ? 11 : 16)) + '</g>'; }
      if (v.r) { const p = v6Gor(c, ay.torsiyon_cumle, .7, .6);
        if (p > 0) s2 += `<g opacity="${n1(p)}">` + P(['torsiyon', 'ust_kutup'], () => gx.map(x => v6Yay(k, x, cy, 33 * s, v.r < 0 ? -40 : -140, v.r < 0 ? -145 : -35, '#E39A10', gr ? 3.6 : 5)).join('')) + '</g>'; }
      if (ay.kulak || v.r) { const p = v6Gor(c, ay.kulak_cumle, .9, .6), kr = kSag ? R.sag_kulak : R.sol_kulak;
        if (p > 0) s2 += `<g opacity="${n1(p)}">` + P(['alttaki_kulak'], () => v6Ikon('kulak', kx, ky - (gr ? 12 : 20), gr ? 34 : 50, kr)
          + v6Satirlar(c, kx, ky + (gr ? 26 : 40), [kSag ? L('sağ kulak', 'right ear') : L('sol kulak', 'left ear'), L('aşağıda', 'down')], gr ? 64 : 84, {px: gr ? 13 : 16, fw: 700, renk: kr})) + '</g>'; }
      return s2; }};
};

// ---------------------------------------------------------------- dönüşümlü göz kapatma (skew) testi: el sırayla bir gözü kapatır; açılan gözün dikey düzeltmesi
// ayar: {sapma: true (sağ göz yukarıda) | false, kapat_cumle, duzeltme_cumle, hedef: true}
CIZ.goz_kapatma = (c, ay) => {
  const cx = 450, cy = 300, s = 1.55, gx = [cx - 82 * s, cx + 82 * s], sap = ay.sapma !== false;
  const a = {sag_goz: [gx[0], cy], sol_goz: [gx[1], cy], el: [gx[0], cy + 120], kapatici: [gx[0], cy + 120], hedef: [cx, 70], duzeltme: [gx[0] - 70 * s, cy], dikey_duzeltme: [gx[0] - 70 * s, cy]};
  const takma = {skew_sapmasi: 'duzeltme', el_kapatici: 'el', gozler: 'sag_goz'};
  return {w: 900, h: 560, cm: 1.05, kirp: true, a: takmaAd(a, takma), takma, vurguEsle: {gozler: 'sol_goz'},
    yer: {sag_goz: 'alt', sol_goz: 'alt', el: 'alt', kapatici: 'alt', hedef: 'ust', duzeltme: 'sol', dikey_duzeltme: 'sol'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c), t0 = ekBas(c, ay.kapat_cumle, .4) + .2, T = 1.4;
      // el konumu: önce aşağıdan sağ göze gelir, sonra iki göz arasında gidip gelir
      let hx = gx[0], hy = cy, j = -1, ts = 0;
      if (c.t < t0) hy = cy + 360 * (1 - yum((c.t - (t0 - .7)) / .7));
      else { j = Math.floor((c.t - t0) / T); ts = c.t - t0 - j * T; const hedef = j % 2 ? gx[1] : gx[0], once = j % 2 ? gx[0] : gx[1];
        hx = j === 0 ? gx[0] : once + (hedef - once) * yumIO(ts / .28); }
      // iris dikey kayması: sapmada kapalı sağ göz yukarı, kapalı sol göz aşağı kayar; açılınca düzeltme yapar
      const kh = kalem(c, 1.3); let iyS = 0, iyL = 0, okS = 0, okL = 0;
      if (sap && j >= 0) { const sagKapali = j % 2 === 0;
        if (sagKapali) { iyS = -9 * kis(ts / .5); iyL = j > 0 ? 9 * (1 - kis((ts - .2) / .3)) : 0; okL = j > 0 && ts > .15 && ts < .9 ? 1 : 0; }
        else { iyL = 9 * kis(ts / .5); iyS = -9 * (1 - kis((ts - .2) / .3)); okS = ts > .15 && ts < .9 ? 1 : 0; } }
      let s2 = yuzUst(k, cx, cy, s);
      s2 += P(['sag_goz', 'gozler'], () => gozOn(k, gx[0], cy, s, {iy: iyS})) + P(['sol_goz', 'gozler'], () => gozOn(k, gx[1], cy, s, {iy: iyL}));
      s2 += v6Taraf(c, gx[0], cy + 70 * s, true) + v6Taraf(c, gx[1], cy + 70 * s, false);
      if (ay.hedef !== false) s2 += P(['hedef'], () => `<circle cx="${cx}" cy="70" r="12" fill="#FFFFFF" stroke="${R.mavi}" stroke-width="${k.W2(3)}"/><circle cx="${cx}" cy="70" r="4" fill="${R.mavi}"/>`
        + k.yol(`M${cx} 92 L${n1(gx[0])} ${n1(cy - 40)} M${cx} 92 L${n1(gx[1])} ${n1(cy - 40)}`, 'none', R.mavi, 1.6, `stroke-dasharray="${k.W2(5)} ${k.W2(6)}" opacity=".6"`));
      // anlık düzeltme okları
      if (okS) s2 += v6Ok(k, gx[0] - 76 * s, cy - 26, gx[0] - 76 * s, cy + 20, R.sari, 5, false, 15);
      if (okL) s2 += v6Ok(k, gx[1] + 76 * s, cy + 26, gx[1] + 76 * s, cy - 20, R.sari, 5, false, 15);
      // el (kapatıcı): avuç, dört parmak, başparmak; bilek aşağıda
      s2 += P(['el', 'kapatici'], () => `<g transform="translate(${n1(hx)} ${n1(hy + 10)}) scale(1.3)">` + kh.yol('M-74 -36 C -76 30 -70 80 -52 120 L-46 300 L46 300 L52 120 C 70 80 78 30 76 -36 Z', V6.ten, NV, 2.6)
        + [-54, -18, 18, 54].map((x, i) => kh.boru(`M${x} -30 L${x} ${-102 + Math.abs(i - 1.5) * 12}`, 30, V6.ten, NV, 2.2)).join('')
        + kh.boru('M62 50 L104 4', 30, V6.ten, NV, 2.2) + kh.yol('M-74 -36 L76 -36 L76 24 L-74 24 Z', V6.ten, null) + '</g>');
      // sonuç notu
      if (ay.duzeltme_cumle != null) { const p = v6Gor(c, ay.duzeltme_cumle, 0, .6);
        if (p > 0) s2 += `<g opacity="${n1(p)}">` + P(['duzeltme', 'dikey_duzeltme'], () => { const m = sap ? L('dikey düzeltme var', 'vertical correction') : L('dikey düzeltme yok', 'no vertical correction'), w2 = olc(m, '800 19px Inter') / c.k + c.fs(64);
          return `<rect x="${n1(cx - w2 / 2)}" y="${n1(512 - c.fs(24))}" width="${n1(w2)}" height="${n1(c.fs(46))}" rx="${n1(c.fs(23))}" fill="#FFFFFF" stroke="${sap ? R.sari : R.basari}" stroke-width="${k.W2(2.6)}"/>`
            + v6Ikon(sap ? 'uyari' : 'dogru', cx - w2 / 2 + c.fs(24), 512, c.fs(26), sap ? R.sari : R.basari) + c.yazi(cx + c.fs(14), 512 + c.fs(7), m, {px: 19, fw: 800, renk: R.lacivert}); }) + '</g>'; }
      return s2; }};
};

// ---------------------------------------------------------------- yandan kişi (dix_hallpike, bakis_stabilizasyonu için): gövde ve uzuvlar boru, baş elips
// baş: {x, y, r, aci (yüzün baktığı yön, derece; 0 sağ, -90 yukarı), kulak: 0..1 (kulağın arkaya kayması: baş izleyiciye dönünce)}
function v6Bas(k, b) {
  const a = (b.aci || 0) * Math.PI / 180, r = b.r, ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;   // u: yüz yönü, n: başın tepesi tarafı (yüze dik)
  const P2 = (f, t) => [b.x + ux * r * f + nx * r * t, b.y + uy * r * f + ny * r * t];
  const burun = [P2(.9, .05), P2(1.22, -.12), P2(.92, -.32)], goz = P2(.55, .28), kq = b.kulak || 0, ku = P2(-.1 - .35 * kq, .02);
  return k.yol(gElips(b.x, b.y, r, r * 1.04), V6.ten, NV, 2.4)
    + k.yol(gYol([P2(-.2, 1.0), P2(-.75, .72), P2(-1.0, .05), P2(-.9, -.45), P2(-.6, -.2), P2(-.35, .45), P2(.25, .9)], false, .5) + 'Z', V6.sac, NV, 2)
    + k.yol(gYol(burun), V6.ten, NV, 2) + `<circle cx="${n1(goz[0])}" cy="${n1(goz[1])}" r="${n1(r * .07)}" fill="${NV}"/>`
    + k.yol(gElips(ku[0], ku[1], r * .17, r * .23), '#E9C9B6', NV, 1.8);
}
const v6Uzuv = (k, pts, w, renk) => k.boru(gYol(pts, false, .4), k.w(w), renk, NV, 2.2);

// ---------------------------------------------------------------- Dix-Hallpike manevrası (yan görünüm): 1) oturur, baş 45 derece döndürülür; 2) hızla sırtüstü, baş masa kenarından ~20 derece geride
// ayar: {taraf: "sag"|"sol", donus_cumle, yatis_cumle, goz_cumle, oturma_cumle, kulak_cumle}
CIZ.dix_hallpike = (c, ay) => {
  const sag = (ay.taraf || 'sag') !== 'sol', HP = [668, 372], th = 20 * Math.PI / 180, dir = [-Math.cos(th), Math.sin(th)], BM = [HP[0] + 54 * dir[0], HP[1] + 54 * dir[1]];
  const a = {oturur: [150, 300], bas_donusu: [380, 120], donus: [380, 120], masa: [250, 430], yatar: [800, 360], bas_askida: [560, 430], geri_egim: [560, 430], hasta: [150, 300],
    yatis: [522, 240], goz_izleme: [760, 260], oturtma: [525, 505], alttaki_kulak: [BM[0] - 6, BM[1] + 12], masa_kenari: [650, 400]};
  const takma = {sirtustu: 'yatar', oturma: 'oturur', kirk_bes_derece: 'bas_donusu', yirmi_derece: 'bas_askida', hizla_yatir: 'yatis', gozler: 'goz_izleme', alt_kulak: 'alttaki_kulak'};
  return {w: 1000, h: 560, cm: 1.05, a: takmaAd(a, takma), takma, vurguEsle: {hasta: 'oturur'},
    yer: {oturur: 'sol', hasta: 'sol', bas_donusu: 'sag', donus: 'sag', masa: 'alt', yatar: 'sag', bas_askida: 'alt', geri_egim: 'alt', yatis: 'ust', goz_izleme: 'ust', oturtma: 'alt', alttaki_kulak: 'alt', masa_kenari: 'alt'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c), pd = v6Gor(c, ay.donus_cumle, .5, 1.2), py = v6Gor(c, ay.yatis_cumle, .3, .9), sgn = sag ? 1 : -1;
      let s = '';
      // masalar
      const masa = (x0, x1) => k.yol(`M${x0} 400 L${x1} 400 L${x1} 426 L${x0} 426 Z`, '#E3E8EF', NV, 2.4) + k.yol(`M${x0 + 30} 426 L${x0 + 30} 540 M${x1 - 30} 426 L${x1 - 30} 540`, 'none', '#7A8BA4', 6);
      s += P(['masa'], () => masa(30, 420) + `<g opacity="${n1(.3 + .7 * py)}">${masa(650, 990)}</g>`);
      // 1) oturur hasta (bacaklar masada uzanır)
      s += P(['oturur', 'hasta'], () => v6Uzuv(k, [[146, 384], [270, 386], [386, 386]], 40, '#B9C6D6') + k.yol(gElips(398, 370, 12, 22), V6.koyu, NV, 1.6)
        + v6Uzuv(k, [[144, 380], [146, 320], [152, 256]], 66, SM.giysi) + v6Uzuv(k, [[156, 266], [196, 320], [236, 364]], 24, SM.giysi)
        + v6Bas(k, {x: 158, y: 200, r: 38, aci: -6, kulak: pd}));
      // baş dönüşü (üstten küçük görünüm)
      s += P(['bas_donusu', 'donus'], () => { const B = basUstten(k, 380, 140, 44, 54); return `<circle cx="380" cy="140" r="92" fill="#FFFFFF" stroke="${R.cizgi}" stroke-width="${k.W2(1.6)}"/>`
        + `<g transform="rotate(${n1(sgn * 45 * pd)} 380 140)">${B.bas}${B.sag}${B.sol}</g>` + k.yol('M380 140 L380 52', 'none', AR.ince, 1.6, `stroke-dasharray="${k.W2(5)} ${k.W2(5)}"`)
        + (pd > .05 ? v6Yay(k, 380, 140, 80, -90, -90 + sgn * 45 * pd, R.mavi, 3.6) : '') + c.yazi(380 + sgn * 64, 62, '45°', {px: 20, fw: 800, renk: R.mavi, ek: `opacity="${n1(pd)}"`})
        + c.yazi(380, 252, L('üstten', 'top view'), {px: 15, fw: 700, renk: R.soluk}); });
      // 2) sırtüstü, baş askıda
      if (py > 0) {
        s += `<g opacity="${n1(py)}" transform="translate(${n1(30 * (1 - py))} 0)">`;
        s += P(['yatar', 'hasta'], () => v6Uzuv(k, [[850, 376], [930, 378], [982, 378]], 40, '#B9C6D6') + k.yol(gElips(988, 360, 12, 20), V6.koyu, NV, 1.6)
          + v6Uzuv(k, [[856, 372], [770, 372], [690, 370]], 66, SM.giysi) + v6Uzuv(k, [[704, 386], [760, 392], [818, 392]], 24, SM.giysi)
          + v6Bas(k, {x: BM[0], y: BM[1], r: 38, aci: -90 - 20, kulak: 1}));
        // 20 derece
        s += P(['bas_askida', 'geri_egim'], () => k.yol(`M${HP[0] - 100} ${HP[1]} L${HP[0] - 178} ${HP[1]}`, 'none', AR.ince, 2, `stroke-dasharray="${k.W2(6)} ${k.W2(5)}"`)
          + k.yol(`M${n1(HP[0] + 100 * dir[0])} ${n1(HP[1] + 100 * dir[1])} L${n1(HP[0] + 178 * dir[0])} ${n1(HP[1] + 178 * dir[1])}`, 'none', R.mavi, 2.4)
          + v6Yay(k, HP[0], HP[1], 160, 180, 160, R.mavi, 3) + c.yazi(HP[0] - 186, HP[1] + 40, '20°', {a: 'end', px: 20, fw: 800, renk: R.mavi}));
        s += P(['alttaki_kulak'], v => v < .01 ? '' : `<circle cx="${n1(a.alttaki_kulak[0])}" cy="${n1(a.alttaki_kulak[1])}" r="16" fill="none" stroke="${R.sag_kulak}" stroke-width="${k.W2(3)}"/>`);
        s += '</g>';
        s += P(['yatis'], () => v6YolOk(k, 'M452 262 C 496 226 546 240 576 292', kis(py * 1.4), R.mavi, 4, [576, 292, 1.1]) + c.yazi(512, 214, L('hızla yatır', 'lie back quickly'), {px: 17, fw: 800, renk: R.mavi, ek: `opacity="${n1(py)}"`}));
      }
      if (ay.goz_cumle != null) { const p = v6Gor(c, ay.goz_cumle, 0, .6);
        if (p > 0) s += `<g opacity="${n1(p)}">` + P(['goz_izleme'], () => `<circle cx="760" cy="260" r="34" fill="${V6.acikMavi}" stroke="${R.mavi}" stroke-width="${k.W2(2)}"/>` + v6Ikon('goz', 760, 260, 46)
          + c.yazi(806, 266, L('gözler izlenir', 'eyes observed'), {a: 'start', px: 17, fw: 700, renk: R.lacivert})) + '</g>'; }
      if (ay.oturma_cumle != null) { const p = v6Gor(c, ay.oturma_cumle, 0, 1);
        if (p > 0) s += P(['oturtma'], () => v6YolOk(k, 'M640 470 C 590 520 440 520 390 470', p, R.soluk, 3.6, [390, 470, -2.3]) + c.yazi(515, 534, L('yavaşça oturt', 'sit up slowly'), {px: 16, fw: 700, renk: R.soluk, ek: `opacity="${n1(p)}"`})); }
      const yon = sag ? L('sağa', 'right') : L('sola', 'left');
      s += c.yazi(215, 556, L(`1  oturur, baş 45° ${yon}`, `1  sitting, head 45° ${yon}`), {px: 17, fw: 700, renk: R.soluk})

        + c.yazi(820, 556, L('2  sırtüstü, baş 20° geride', '2  supine, head 20° below'), {px: 17, fw: 700, renk: R.soluk, ek: `opacity="${n1(py)}"`});
      return s; }};
};

// ---------------------------------------------------------------- bakış stabilizasyonu egzersizi (VOR x1 / x2): üstten (baş sağa sola), isteğe bağlı yandan (yukarı aşağı)
// ayar: {mod: "x1" | "x2", hareket_cumle, dikey: false, dikey_cumle, harf: "A"}
CIZ.bakis_stabilizasyonu = (c, ay) => {
  const x2 = ay.mod === 'x2', dk = ay.dikey || ay.dikey_cumle != null, W0 = 520, w = dk ? 1000 : W0;
  const a = {kisi: [250, 430], bas: [250, 392], bas_hareketi: [250, 300], kart: [250, 150], hedef: [250, 150], harf: [420, 150], bakis: [250, 250], kol_boyu: [150, 280], ters_hareket: [250, 110], dikey: [760, 160]};
  const takma = {goz_hatti: 'bakis', yukari_asagi: 'dikey', kart_hareketi: 'ters_hareket', x2: 'ters_hareket'};
  return {w, h: 560, cm: 1.05, kirp: true, a: takmaAd(a, takma), takma, vurguEsle: {bas: 'bas_hareketi'},
    yer: {kisi: 'alt', bas: 'sag', bas_hareketi: 'sag', kart: 'ust', hedef: 'ust', harf: 'sag', bakis: 'sag', kol_boyu: 'sol', ters_hareket: 'ust', dikey: 'ust'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c), t0 = ekBas(c, ay.hareket_cumle, .5), q = c.t > t0 ? Math.sin(2 * Math.PI * (c.t - t0) / 1.3) * kis((c.t - t0) / .6) : 0;
      const th = 22 * q, kx = x2 ? -34 * q : 0, harf = ay.harf || 'A';
      let s = c.yazi(24, 34, x2 ? L('VOR x2: kart ters yönde', 'VOR x2: card moves opposite') : L('VOR x1: kart sabit', 'VOR x1: card still'), {a: 'start', px: 19, fw: 800, renk: R.lacivert});
      // üstten kişi: omuzlar sabit, baş döner; kol öne uzanır, elde kart
      const cx = 250, cy = 400;
      s += P(['kisi'], () => k.yol(gYol([[cx - 104, cy + 10], [cx - 88, cy - 26], [cx + 88, cy - 26], [cx + 104, cy + 10], [cx + 88, cy + 40], [cx - 88, cy + 40]], true, .45), SM.giysi, NV, 2.2)
        + k.boru(`M${cx + 74} ${cy - 16} C ${cx + 78} ${cy - 120} ${cx + 52 + kx} 240 ${cx + 34 + kx} 180`, k.w(26), SM.giysi, NV, 2));
      const ka = [cx + kx, 166];
      s += P(['kart', 'hedef'], () => k.yol(`M${n1(ka[0] - 44)} 158 L${n1(ka[0] + 44)} 158 L${n1(ka[0] + 44)} 172 L${n1(ka[0] - 44)} 172 Z`, '#FFFFFF', NV, 2.4) + k.yol(gElips(ka[0] + 34, 182, 14, 10), V6.ten, NV, 1.8));
      // bakış çizgileri ve baş
      s += P(['bakis'], () => [-14, 14].map(d => { const r = th * Math.PI / 180, ex = cx + d * Math.cos(r) + 30 * Math.sin(r), ey = cy - 4 - 30 * Math.cos(r) + d * Math.sin(r);
        return k.yol(`M${n1(ex)} ${n1(ey)} L${n1(ka[0])} 174`, 'none', R.mavi, 1.8, `stroke-dasharray="${k.W2(6)} ${k.W2(5)}"`); }).join(''));
      s += P(['bas', 'bas_hareketi'], () => { const B = basUstten(k, cx, cy - 4, 40, 48); return `<g transform="rotate(${n1(th)} ${cx} ${cy - 4})">${B.bas}${B.sag}${B.sol}</g>`; });
      s += P(['bas_hareketi'], () => v6Yay(k, cx, cy - 4, 78, -125, -55, R.mavi, 3.6, true));
      if (x2) s += P(['ters_hareket'], () => v6Ok(k, cx - 60, 126, cx + 60, 126, R.sari, 3.6, true, 12) + c.yazi(cx, 108, L('başın tersine', 'opposite to head'), {px: 15, fw: 800, renk: '#9A6A10'}));
      // kol boyu ve harf kartı (önden)
      s += P(['kol_boyu'], () => v6Ok(k, 140, cy - 10, 140, 172, R.soluk, 2.2, true, 10) + c.yazi(128, 290, L('kol boyu', 'arm length'), {a: 'end', px: 16, fw: 700, renk: R.soluk}));
      s += P(['harf'], () => `<rect x="380" y="92" width="96" height="120" rx="10" fill="#FFFFFF" stroke="${NV}" stroke-width="${k.W2(2.4)}"/>` + c.yazi(428, 152 + c.fs(20), harf, {px: 54, fw: 800, ff: 'Outfit', renk: R.lacivert})
        + c.yazi(428, 236, L('net kalmalı', 'must stay clear'), {px: 15, fw: 700, renk: R.soluk}));
      s += c.yazi(cx, 548, L('üstten', 'top view'), {px: 15, fw: 700, renk: R.soluk});
      // yandan: yukarı aşağı
      if (dk) { const p = ay.dikey_cumle != null ? v6Gor(c, ay.dikey_cumle, 0, .7) : 1;
        if (p > 0) { const t1 = ay.dikey_cumle != null ? ekBas(c, ay.dikey_cumle, 0) : t0, ph = c.t > t1 ? 15 * Math.sin(2 * Math.PI * (c.t - t1) / 1.3) * kis((c.t - t1) / .6) : 0, ckx = x2 ? 0 : 0;
          s += `<g opacity="${n1(p)}">` + `<path d="M${W0 + 10} 20 L${W0 + 10} 540" stroke="${R.cizgi}" stroke-width="${k.W2(2)}"/>`
            + P(['dikey'], () => { const ox = W0 + 40, hp = [ox + 140, 262], hr = ph * Math.PI / 180, bm = [hp[0] + 34 * Math.sin(hr) + 4, hp[1] - 34 * Math.cos(hr)];
              return c.yazi(ox, 34, L('yukarı ve aşağı', 'up and down'), {a: 'start', px: 19, fw: 800, renk: R.lacivert})
                + k.yol(`M${ox + 40} 430 L${ox + 170} 430 L${ox + 170} 446 L${ox + 40} 446 Z M${ox + 40} 430 L${ox + 40} 290 L${ox + 56} 290 L${ox + 56} 430`, '#E9DFD2', '#B79E7E', 2)
                + k.yol(`M${ox + 60} 446 L${ox + 60} 540 M${ox + 160} 446 L${ox + 160} 540`, 'none', '#B79E7E', 5)
                + v6Uzuv(k, [[ox + 110, 420], [ox + 220, 420], [ox + 230, 530]], 36, '#B9C6D6') + v6Uzuv(k, [[ox + 108, 420], [ox + 120, 350], [ox + 134, 288]], 60, SM.giysi)
                + v6Uzuv(k, [[ox + 140, 300], [ox + 250, 286], [ox + 362, 268]], 22, SM.giysi)
                + k.yol(`M${ox + 366} 218 L${ox + 380} 218 L${ox + 380} 316 L${ox + 366} 316 Z`, '#FFFFFF', NV, 2.4)
                + k.yol(`M${n1(bm[0] + 20)} ${n1(bm[1] - 6)} L${ox + 366} 262`, 'none', R.mavi, 1.8, `stroke-dasharray="${k.W2(6)} ${k.W2(5)}"`)
                + `<g transform="rotate(${n1(ph)} ${hp[0]} ${hp[1]})">${v6Bas(k, {x: hp[0] + 4, y: hp[1] - 34, r: 34, aci: 0})}</g>`
                + v6Yay(k, hp[0] + 4, hp[1] - 34, 62, -160, -110, R.mavi, 3.4, true); }) + '</g>'; } }
      return s; }};
};

// ---------------------------------------------------------------- yandan baş (sahne.js BAS_YAN ve KULAK_YAN; yüz solda, izleyici hastanın SOL yanını görür)
function basYanK(k, ox, oy, sc, o = {}) {
  const w = (k.w(2.6) / sc).toFixed(2), wi = (k.w(2.2) / sc).toFixed(2);
  return `<g transform="translate(${ox} ${oy}) scale(${sc})"><path d="${BAS_YAN}" fill="${o.dolgu || V6.ten}" stroke="${NV}" stroke-width="${w}" stroke-linejoin="round"/>`
    + `<path d="M228 236 C 236 230 246 232 252 238" fill="none" stroke="${AR.ince}" stroke-width="${wi}" stroke-linecap="round"/>`
    + (o.kulak === false ? '' : `<path d="${KULAK_YAN}" fill="${o.kulakRenk || '#EBD3C4'}" stroke="${NV}" stroke-width="${w}" stroke-linejoin="round"/>`
      + `<path d="M472 236 C 496 236 506 262 500 284 C 496 298 488 304 484 316" fill="none" stroke="${AR.ince}" stroke-width="${wi}" stroke-linecap="round"/><ellipse cx="466" cy="286" rx="7" ry="9" fill="${NV}" opacity=".75"/>`)
    + (o.sac === false ? '' : `<path d="M452 40 C 350 36 268 84 252 170 C 300 120 380 96 460 104 C 540 112 600 170 628 236 C 640 150 560 44 452 40 Z" fill="${V6.sac}" opacity=".9"/>`) + '</g>';
}
const ELEK_RENK = {aktif: R.mavi, referans: R.sag_kulak, toprak: R.basari};
// elektrot işareti: rol rengiyle dolu daire; ad yanında
function v6Elek(c, k, x, y, rol, ad, o = {}) {
  const r = o.r || 12, dol = rol ? ELEK_RENK[rol] || rol : '#FFFFFF';
  return `<circle cx="${n1(x)}" cy="${n1(y)}" r="${r}" fill="${dol}" stroke="${NV}" stroke-width="${k.W2(2.2)}"/>` + (rol ? '' : `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(r * .32)}" fill="${NV}"/>`)
    + (ad ? c.yazi(x + (o.dx ?? r + 6), y + (o.dy ?? 0) + c.fs(6), ad, {a: o.a || 'start', px: o.px || 17, fw: 800, ff: 'Outfit', renk: o.renk || R.lacivert}) : '');
}
function v6Lejant(c, k, x, y, roller) {
  const it = [['aktif', L('aktif', 'active')], ['referans', L('referans', 'reference')], ['toprak', L('toprak', 'ground')]].filter(([r]) => roller.includes(r));
  let s = '', xx = x; it.forEach(([r, m]) => { s += `<circle cx="${n1(xx)}" cy="${y}" r="10" fill="${ELEK_RENK[r]}" stroke="${NV}" stroke-width="${k.W2(2)}"/>` + c.yazi(xx + 18, y + c.fs(6), m, {a: 'start', px: 16, fw: 700});
    xx += 34 + olc(m, '700 16px Inter') / c.k + 30; }); return s;
}

// ---------------------------------------------------------------- elektrot yerleşimi: 1020 (üstten ve yandan baş, 10-20 sistemi), eng, ovemp, cvemp, kemik_bebek
// ortak ayar: {mod, goster: {parca: cumle}, gizle: [parca], roller: {parca: "aktif"|"referans"|"toprak"}, roller_cumle}
CIZ.elektrot_yerlesimi = (c, ay) => {
  const mod = ay.mod || '1020', gizle = new Set(ay.gizle || []), gos = ay.goster || {};
  const gp = id => gizle.has(id) ? 0 : gos[id] != null ? v6Gor(c, gos[id], 0, .6) : 1;
  const rolP = () => ay.roller ? (ay.roller_cumle != null ? v6Gor(c, ay.roller_cumle, 0, .6) : 1) : 0;
  const rolu = id => ay.roller && ay.roller[id] && rolP() > .5 ? ay.roller[id] : null;
  const rolGrup = id => ay.roller && ay.roller[id] ? [ay.roller[id]] : [];
  if (mod === '1020') {
    const cx = 270, cy = 300, rx = 190, ry = 215, Y = f => 85 + f * 430, ORT = {fpz: .1, fz: .3, cz: .5, pz: .7, oz: .9};
    const UST = {nasion: [cx, 85], inion: [cx, 515], fpz: [cx, Y(.1)], fz: [cx, Y(.3)], cz: [cx, Y(.5)], pz: [cx, Y(.7)], oz: [cx, Y(.9)],
      sol_preaurikuler: [cx - 186, cy], sag_preaurikuler: [cx + 186, cy], a1: [cx - 214, cy + 46], a2: [cx + 214, cy + 46], m1: [cx - 192, cy + 82], m2: [cx + 192, cy + 82]};
    const SC = .72, OX = 520, OY = 120, MX = x => OX + SC * x, MY = y => OY + SC * y, YC = [MX(440), MY(240)], RR = 138;
    const YAN = {}; Object.entries(ORT).forEach(([id, f]) => { const t = Math.PI * (1 + f); YAN[id] = [YC[0] + RR * Math.cos(t), YC[1] + RR * Math.sin(t)]; });
    YAN.nasion = [MX(240), MY(224)]; YAN.inion = [YC[0] + 146, YC[1] + 6]; YAN.sol_preaurikuler = [MX(450), MY(282)]; YAN.a1 = [MX(474), MY(358)]; YAN.m1 = [MX(540), MY(372)];
    const a = Object.assign({}, UST, {preaurikuler: UST.sag_preaurikuler, orta_hat: [cx, 170], koronal_hat: [cx + 100, cy], yuzde: [YC[0], YC[1] - RR - 30], ust_gorunum: [cx, 30], yan_gorunum: [YC[0], 40],
      aktif: UST.cz, referans: UST.m2, toprak: UST.fpz});
    const takma = {nz: 'nasion', iz: 'inion', vertex: 'cz', tepe: 'cz', preauriküler: 'preaurikuler', mastoid: 'm2', mastoidler: 'm2', kulak_memesi: 'a2', kulak_memeleri: 'a2', yuzde_10_20: 'yuzde'};
    const yer = {nasion: 'ust', inion: 'alt', fpz: 'sol', fz: 'sol', cz: 'sol', pz: 'sol', oz: 'sol', sol_preaurikuler: 'sol', sag_preaurikuler: 'sag', preaurikuler: 'sag', a1: 'sol', a2: 'sag', m1: 'sol', m2: 'sag',
      orta_hat: 'ust', koronal_hat: 'ust', yuzde: 'ust', ust_gorunum: 'ust', yan_gorunum: 'ust', aktif: 'sol', referans: 'sag', toprak: 'sol'};
    return {w: 1000, h: 580, cm: 1.05, a: takmaAd(a, takma), takma, yer, vurguEsle: {mastoidler: 'm1', kulak_memeleri: 'a1', preaurikuler: 'sol_preaurikuler'},
      svg: () => {
        const k = kalem(c, 1), P = anP(c), B = basUstten(k, cx, cy, rx, ry, {dolgu: V6.ten});
        let s = P(['ust_gorunum'], () => B.bas + B.sag + B.sol) + c.yazi(cx, 572, L('üstten', 'top view'), {px: 15, fw: 700, renk: R.soluk});
        s += P(['yan_gorunum'], () => basYanK(k, OX, OY, SC, {kulakRenk: '#EBD3C4', sac: false})) + c.yazi(YC[0], 572, L('yandan (sol)', 'side view (left)'), {px: 15, fw: 700, renk: R.soluk});
        // hatlar
        const hp = Math.max(gp('nasion'), gp('inion'));
        s += `<g opacity="${n1(hp)}">` + P(['orta_hat'], () => k.yol(`M${cx} 85 L${cx} 515`, 'none', R.mavi, 2, `stroke-dasharray="${k.W2(8)} ${k.W2(6)}"`)
          + k.yol(`M${n1(YC[0] - RR)} ${n1(YC[1])} A${RR} ${RR} 0 0 1 ${n1(YC[0] + RR)} ${n1(YC[1])}`, 'none', R.mavi, 2, `stroke-dasharray="${k.W2(8)} ${k.W2(6)}"`)) + '</g>';
        const kp = Math.max(gp('sol_preaurikuler'), gp('preaurikuler'), gp('cz'));
        s += `<g opacity="${n1(kp)}">` + P(['koronal_hat'], () => k.yol(`M${cx - 186} ${cy} L${cx + 186} ${cy}`, 'none', AR.ince, 2, `stroke-dasharray="${k.W2(8)} ${k.W2(6)}"`)) + '</g>';
        // yüzde aralıkları (yan görünüm)
        const yp = gp('yuzde');
        if (yp > 0) s += `<g opacity="${n1(yp)}">` + P(['yuzde'], () => [[.05, '10%'], [.2, '20%'], [.4, '20%'], [.6, '20%'], [.8, '20%'], [.95, '10%']].map(([f, m]) => { const t = Math.PI * (1 + f), x = YC[0] + (RR + 32) * Math.cos(t), y = YC[1] + (RR + 32) * Math.sin(t);
          return c.yazi(x, y + c.fs(6), m, {px: 15, fw: 800, renk: R.mavi}); }).join('')
          + [0, .1, .3, .5, .7, .9, 1].map(f => { const t = Math.PI * (1 + f); return k.yol(`M${n1(YC[0] + (RR - 8) * Math.cos(t))} ${n1(YC[1] + (RR - 8) * Math.sin(t))} L${n1(YC[0] + (RR + 12) * Math.cos(t))} ${n1(YC[1] + (RR + 12) * Math.sin(t))}`, 'none', R.mavi, 2); }).join('')) + '</g>';
        // noktalar (üstten ve yandan aynı parça)
        const AD = {nasion: L('nasion', 'nasion'), inion: L('inion', 'inion'), fpz: 'Fpz', fz: 'Fz', cz: 'Cz', pz: 'Pz', oz: 'Oz', sol_preaurikuler: '', sag_preaurikuler: '', a1: 'A1', a2: 'A2', m1: 'M1', m2: 'M2'};
        const isaret = (id, p0, ust) => { const p = gp(id === 'sol_preaurikuler' || id === 'sag_preaurikuler' ? (gos.preaurikuler != null && gos[id] == null ? 'preaurikuler' : id) : id); if (p <= 0 || !p0) return '';
          const anat = id === 'nasion' || id === 'inion' || id.endsWith('preaurikuler');
          const ids = [id].concat(rolGrup(id), id.endsWith('preaurikuler') ? ['preaurikuler'] : [], id[0] === 'm' ? ['mastoidler'] : [], id[0] === 'a' && id.length === 2 ? ['kulak_memeleri'] : []);
          const sol = p0[0] < (ust ? cx : YC[0]) - 20, dx = ust ? (id === 'nasion' ? 16 : id === 'inion' ? 16 : sol ? -18 : 18) : 16, a2 = ust && sol ? 'end' : 'start';
          return `<g opacity="${n1(p)}">` + P(ids, () => anat ? `<path d="M${n1(p0[0] - 9)} ${n1(p0[1] - 9)} L${n1(p0[0] + 9)} ${n1(p0[1] + 9)} M${n1(p0[0] + 9)} ${n1(p0[1] - 9)} L${n1(p0[0] - 9)} ${n1(p0[1] + 9)}" stroke="${NV}" stroke-width="${k.W2(3)}" stroke-linecap="round"/>`
            + (ust && AD[id] ? c.yazi(p0[0] + dx, p0[1] + (id === 'nasion' ? -12 : 26), AD[id], {a: 'start', px: 15, fw: 700, renk: R.soluk}) : '')
            : v6Elek(c, k, p0[0], p0[1], rolu(id), ust ? AD[id] : '', {dx, a: a2, r: ust ? 12 : 10})) + '</g>'; };
        Object.keys(UST).forEach(id => s += isaret(id, UST[id], true) + isaret(id, YAN[id], false));
        if (ay.roller && rolP() > 0) { const rs = [...new Set(Object.values(ay.roller))]; s += `<g opacity="${n1(rolP())}">${v6Lejant(c, k, 560, 30, rs)}</g>`; }
        return s; }};
  }
  if (mod === 'eng' || mod === 'ovemp') {
    const cx = 430, cy = 300, s0 = 1.5, gx = [cx - 82 * s0, cx + 82 * s0], eng = mod === 'eng';
    const E = eng ? {sag_dis_kantus: [gx[0] - 108, cy], sol_dis_kantus: [gx[1] + 108, cy], ust_elektrot: [gx[0], cy - 102], alt_elektrot: [gx[0], cy + 62], toprak: [cx, 128]}
      : {sag_aktif: [gx[0], cy + 64], sol_aktif: [gx[1], cy + 64], sag_referans: [gx[0], cy + 114], sol_referans: [gx[1], cy + 114], toprak: [cx - 120, 132]};
    const a = Object.assign({}, E, eng ? {yatay_elektrotlar: E.sag_dis_kantus, dikey_elektrotlar: E.alt_elektrot, dipol: [880, 300], gozler: [gx[1], cy]}
      : {aktif: E.sag_aktif, referans: E.sag_referans, bakis: [cx, 60], kemik_titresim: [cx, 122], inferior_oblik: [gx[1], cy + 40], gozler: [gx[1], cy]});
    const takma = eng ? {dis_kantus: 'yatay_elektrotlar', yatay: 'yatay_elektrotlar', dikey: 'dikey_elektrotlar', alin: 'toprak', korneoretinal_dipol: 'dipol', korneoretinal_potansiyel: 'dipol'}
      : {aktif_elektrot: 'aktif', referans_elektrot: 'referans', yukari_bakis: 'bakis', titresim: 'kemik_titresim', alin: 'kemik_titresim', kas: 'inferior_oblik'};
    const yer = eng ? {sag_dis_kantus: 'sol', sol_dis_kantus: 'sag', yatay_elektrotlar: 'sol', ust_elektrot: 'ust', alt_elektrot: 'alt', dikey_elektrotlar: 'alt', toprak: 'ust', dipol: 'sag', gozler: 'alt'}
      : {sag_aktif: 'sol', sol_aktif: 'sag', aktif: 'sol', sag_referans: 'sol', sol_referans: 'sag', referans: 'sol', bakis: 'ust', kemik_titresim: 'sag', inferior_oblik: 'sag', toprak: 'sol', gozler: 'alt'};
    return {w: eng ? 1000 : 860, h: 600, cm: 1.05, kirp: true, a: takmaAd(a, takma), takma, yer, vurguEsle: eng ? {} : {aktif: 'sol_aktif', referans: 'sol_referans'},
      svg: () => {
        const k = kalem(c, 1), P = anP(c), don = eng ? 18 * Math.sin(c.t * 1.6) : 0;
        let s = yuzUst(k, cx, cy, s0);
        s += P(['gozler'], () => gozOn(k, gx[0], cy, s0, {ix: eng ? don * .7 : 0, iy: eng ? 0 : -15}) + gozOn(k, gx[1], cy, s0, {ix: eng ? don * .7 : 0, iy: eng ? 0 : -15}));
        s += v6Taraf(c, gx[0], cy + 162, true) + v6Taraf(c, gx[1], cy + 162, false);
        const el = (id, grup, rol, ad, o) => { const p = Math.max(gp(id), 0) * (grup ? gp(grup) : 1); if (p <= 0) return '';
          return `<g opacity="${n1(p)}">` + P([id].concat(grup ? [grup] : [], rol ? [rol] : []), () => v6Elek(c, k, E[id][0], E[id][1], rol, ad, o)) + '</g>'; };
        if (eng) {
          s += el('sag_dis_kantus', 'yatay_elektrotlar', R.mavi, '', {}) + el('sol_dis_kantus', 'yatay_elektrotlar', R.mavi, '', {});
          s += el('ust_elektrot', 'dikey_elektrotlar', R.sari, '', {}) + el('alt_elektrot', 'dikey_elektrotlar', R.sari, '', {}) + el('toprak', null, 'toprak', '', {});
          // korneoretinal dipol: gözün yandan görünüşü, kornea (+) önde
          const dp = gp('dipol');
          if (dp > 0) s += `<g opacity="${n1(dp)}">` + P(['dipol'], () => { const ox = 880, oy = 290, r = 70, ro = -don;
            return `<g transform="rotate(${n1(ro)} ${ox} ${oy})">` + k.yol(gElips(ox, oy, r, r), '#FFFFFF', NV, 2.4) + k.yol(`M${ox - r + 6} ${oy - 26} C ${ox - r - 16} ${oy - 12} ${ox - r - 16} ${oy + 12} ${ox - r + 6} ${oy + 26}`, '#E6F1FD', NV, 2)
              + k.yol(`M${ox + r - 4} ${oy - 34} C ${ox + r + 6} ${oy - 10} ${ox + r + 6} ${oy + 10} ${ox + r - 4} ${oy + 34}`, 'none', R.sag_kulak, 4)
              + v6Ok(k, ox + 30, oy, ox - 34, oy, R.mavi, 4, false, 13) + c.yazi(ox - r - 24, oy + c.fs(8), '+', {px: 26, fw: 800, renk: R.mavi}) + c.yazi(ox + r + 20, oy + c.fs(8), '−', {px: 26, fw: 800, renk: R.sag_kulak}) + '</g>'
              + v6Satirlar(c, ox, oy + 112, [L('kornea +', 'cornea +'), L('retina −', 'retina −')], 170, {px: 18, fw: 700, renk: R.soluk}); }) + '</g>';
        } else {
          s += P(['inferior_oblik'], v => [0, 1].map(i => k.yol(`M${n1(gx[i] - 50)} ${n1(cy + 34)} C ${n1(gx[i] - 20)} ${n1(cy + 52)} ${n1(gx[i] + 20)} ${n1(cy + 52)} ${n1(gx[i] + 50)} ${n1(cy + 34)}`, 'none', AR.kas_c, 3 + 3 * v, `opacity="${n1(.35 + .6 * v)}"`)).join(''));
          s += el('sag_aktif', 'aktif', 'aktif', '', {}) + el('sol_aktif', 'aktif', 'aktif', '', {}) + el('sag_referans', 'referans', 'referans', '', {}) + el('sol_referans', 'referans', 'referans', '', {});
          if (ay.toprak) s += el('toprak', null, 'toprak', '', {});
          const bp = gp('bakis'); if (bp > 0) s += `<g opacity="${n1(bp)}">` + P(['bakis'], () => `<circle cx="${cx}" cy="40" r="11" fill="#FFFFFF" stroke="${R.mavi}" stroke-width="${k.W2(3)}"/><circle cx="${cx}" cy="40" r="4" fill="${R.mavi}"/>`
            + gx.map(x => k.yol(`M${n1(x)} ${n1(cy - 30)} L${cx} 54`, 'none', R.mavi, 1.8, `stroke-dasharray="${k.W2(6)} ${k.W2(5)}"`)).join('') + c.yazi(cx + 24, 46, L('yukarı bakış', 'upward gaze'), {a: 'start', px: 16, fw: 700, renk: R.mavi})) + '</g>';
          const vp = gp('kemik_titresim'), tt = .45 + .4 * Math.sin(c.t * 9);
          if (vp > 0) s += `<g opacity="${n1(vp)}">` + P(['kemik_titresim'], () => k.yol(`M${cx - 34} 104 L${cx + 34} 104 L${cx + 34} 140 L${cx - 34} 140 Z`, V6.koyu, NV, 2.2) + k.yol(`M${cx + 34} 122 C ${cx + 80} 120 ${cx + 110} 96 ${cx + 150} 80`, 'none', V6.koyu, 3)
            + `<g opacity="${n1(tt)}">` + [-1, 1].map(m => k.yol(`M${cx + m * 46} 108 C ${cx + m * 54} 116 ${cx + m * 54} 128 ${cx + m * 46} 136`, 'none', R.mavi, 2.6)).join('') + '</g>') + '</g>';
          const lp = Math.min(gp('aktif'), gp('referans')); if (lp > 0) s += `<g opacity="${n1(lp)}">${v6Lejant(c, k, 40, 580, ay.toprak ? ['aktif', 'referans', 'toprak'] : ['aktif', 'referans'])}</g>`;
        }
        if (eng) { const lp = Math.max(gp('yatay_elektrotlar'), gp('dikey_elektrotlar'));
          if (lp > 0) s += `<g opacity="${n1(lp)}">` + [[R.mavi, L('yatay kanal', 'horizontal')], [R.sari, L('dikey kanal', 'vertical')], [R.basari, L('toprak', 'ground')]].map(([r2, m], i) =>
            `<circle cx="${60 + i * 190}" cy="580" r="10" fill="${r2}" stroke="${NV}" stroke-width="${k.W2(2)}"/>` + c.yazi(78 + i * 190, 580 + c.fs(6), m, {a: 'start', px: 16, fw: 700})).join('') + '</g>'; }
        return s; }};
  }
  if (mod === 'cvemp') {
    const SC = .78, OX = 170, OY = -14, MX = x => OX + SC * x, MY = y => OY + SC * y, M = p => [MX(p[0]), MY(p[1])];
    const SCM = [[530, 376], [486, 428], [430, 492], [372, 560], [346, 596]].map(M), akt = M([458, 462]), ref = M([336, 612]), top = M([258, 150]);
    const a = {scm: M([410, 520]), sternokleidomastoid: M([410, 520]), aktif: akt, referans: ref, toprak: top, kulaklik: M([472, 292]), bas_donusu: [140, 70], sternum: ref, mastoid: SCM[0]};
    const takma = {kas: 'scm', insert: 'kulaklik', aktif_elektrot: 'aktif', referans_elektrot: 'referans', donus: 'bas_donusu'};
    return {w: 860, h: 600, cm: 1.05, kirp: true, a: takmaAd(a, takma), takma, vurguEsle: {sternokleidomastoid: 'scm'},
      yer: {scm: 'sag', sternokleidomastoid: 'sag', aktif: 'sag', referans: 'sol', toprak: 'sol', kulaklik: 'sag', bas_donusu: 'ust', sternum: 'sol', mastoid: 'sag'},
      svg: () => {
        const k = kalem(c, 1), P = anP(c);
        let s = `<g transform="translate(${OX} ${OY}) scale(${SC})"><path d="M300 520 C 290 600 220 650 120 700 L 100 800 L 820 800 L 800 700 C 680 660 580 610 540 520 Z" fill="${V6.ten}" stroke="${NV}" stroke-width="${(k.w(2.6) / SC).toFixed(2)}" stroke-linejoin="round"/>`
          + `<path d="M330 624 C 420 626 560 650 720 700" fill="none" stroke="${AR.ince}" stroke-width="${(k.w(2.4) / SC).toFixed(2)}" stroke-linecap="round"/></g>`;
        s += basYanK(k, OX, OY, SC);
        s += P(['scm', 'sternokleidomastoid'], () => k.boru(gYol(SCM, false, .4), 30, AR.kas, AR.kas_c, 2));
        const kp = gp('kulaklik'); if (kp > 0) s += `<g opacity="${n1(kp)}">` + P(['kulaklik'], () => { const q = M([466, 286]);
          return k.boru(`M${n1(q[0] + 6)} ${n1(q[1] + 8)} C ${n1(q[0] + 40)} ${n1(q[1] + 80)} ${n1(q[0] + 80)} ${n1(q[1] + 150)} ${n1(q[0] + 150)} ${n1(q[1] + 210)}`, k.w(6), '#F4F7FB', NV, 1.6)
            + k.yol(gElips(q[0], q[1], 13, 11), '#F4DCAE', '#B8925A', 2); }) + '</g>';
        const el = (id, p0, rol) => { const p = gp(id); return p > 0 ? `<g opacity="${n1(p)}">` + P([id, rol], () => v6Elek(c, k, p0[0], p0[1], rol, '', {r: 13})) + '</g>' : ''; };
        s += el('aktif', akt, 'aktif') + el('referans', ref, 'referans') + el('toprak', top, 'toprak');
        const dp = gp('bas_donusu'); if (dp > 0) s += `<g opacity="${n1(dp)}">` + P(['bas_donusu'], () => v6Yay(k, 330, 230, 230, -160, -118, R.mavi, 4) + c.yazi(30, 40, L('baş karşı tarafa döner', 'head turned away'), {a: 'start', px: 17, fw: 800, renk: R.mavi})) + '</g>';
        s += `<g opacity="${n1(Math.min(gp('aktif'), gp('referans')))}">${v6Lejant(c, k, 30, 580, ['aktif', 'referans', 'toprak'])}</g>`;
        return s; }};
  }
  // kemik_bebek: bebek başında kemik vibratörü (kulak kepçesinin arka üstünde, kepçeye değmeden), elastik bant, elektrotlar
  const SC = .9, OX = 40, OY = -6, MX = x => OX + SC * x, MY = y => OY + SC * y, M = p => [MX(p[0]), MY(p[1])];
  const VB = M([590, 196]), akt = M([300, 92]), top = M([242, 200]), ref = M([474, 358]), ense = M([604, 452]);
  const a = {kemik_vibratoru: VB, vibrator: VB, bant: M([400, 140]), elastik_bant: M([400, 140]), kulak_kepcesi: M([490, 300]), aktif: akt, toprak: top, referans: ref, ense, aralik: M([540, 226]), temporal_kemik: M([600, 240])};
  const takma = {aktif_elektrot: 'aktif', referans_elektrot: 'referans', kepce: 'kulak_kepcesi', bosluk: 'aralik'};
  return {w: 860, h: 520, cm: 1.05, kirp: true, a: takmaAd(a, takma), takma, vurguEsle: {vibrator: 'kemik_vibratoru', elastik_bant: 'bant'},
    yer: {kemik_vibratoru: 'sag', vibrator: 'sag', bant: 'ust', elastik_bant: 'ust', kulak_kepcesi: 'alt', aktif: 'ust', toprak: 'sol', referans: 'alt', ense: 'sag', aralik: 'sag', temporal_kemik: 'sag'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c);
      let s = P(['kulak_kepcesi'], () => basYanK(k, OX, OY, SC));
      s += P(['temporal_kemik'], v => v < .01 ? '' : k.yol(gElips(VB[0] + 6, VB[1] + 30, 78, 64), R.mavi, null, 0, `fill-opacity="${n1(.15 * v)}"`));
      const bp = gp('bant'); if (bp > 0) s += `<g opacity="${n1(bp)}">` + P(['bant', 'elastik_bant'], () => `<path d="M${n1(MX(258))} ${n1(MY(126))} C ${n1(MX(350))} ${n1(MY(112))} ${n1(MX(480))} ${n1(MY(150))} ${n1(MX(590))} ${n1(MY(196))} C ${n1(MX(616))} ${n1(MY(208))} ${n1(MX(632))} ${n1(MY(220))} ${n1(MX(640))} ${n1(MY(232))}" fill="none" stroke="#7FB4EA" stroke-width="${k.W2(16)}" stroke-linecap="round" opacity=".75"/>`) + '</g>';
      const vp = gp('kemik_vibratoru'), tt = .45 + .4 * Math.sin(c.t * 9);
      if (vp > 0) s += `<g opacity="${n1(vp)}">` + P(['kemik_vibratoru', 'vibrator'], () => k.yol(`M${n1(VB[0] + 30)} ${n1(VB[1] - 14)} C ${n1(VB[0] + 90)} ${n1(VB[1] - 60)} ${n1(VB[0] + 140)} ${n1(VB[1] - 110)} ${n1(VB[0] + 200)} ${n1(VB[1] - 150)}`, 'none', V6.koyu, 3.4)
        + `<g transform="rotate(-24 ${n1(VB[0])} ${n1(VB[1])})">` + k.yol(`M${n1(VB[0] - 30)} ${n1(VB[1] - 19)} L${n1(VB[0] + 30)} ${n1(VB[1] - 19)} L${n1(VB[0] + 30)} ${n1(VB[1] + 19)} L${n1(VB[0] - 30)} ${n1(VB[1] + 19)} Z`, V6.koyu, NV, 2.4) + '</g>'
        + `<g opacity="${n1(tt)}">` + [0, 1].map(i => k.yol(`M${n1(VB[0] - 26 - i * 12)} ${n1(VB[1] + 34 + i * 10)} C ${n1(VB[0] - 4)} ${n1(VB[1] + 48 + i * 12)} ${n1(VB[0] + 22)} ${n1(VB[1] + 44 + i * 12)} ${n1(VB[0] + 40 + i * 6)} ${n1(VB[1] + 26 + i * 10)}`, 'none', R.mavi, 2.6)).join('') + '</g>') + '</g>';
      const ap = gp('aralik'); if (ap > 0) s += `<g opacity="${n1(ap)}">` + P(['aralik'], () => v6Ok(k, MX(526), MY(234), MX(560), MY(222), R.sari, 2.6, true, 9)) + '</g>';
      const el = (id, p0, rol) => { const p = gp(id); return p > 0 ? `<g opacity="${n1(p)}">` + P([id, rol], () => v6Elek(c, k, p0[0], p0[1], rol, '', {r: 12})) + '</g>' : ''; };
      s += el('aktif', akt, 'aktif') + el('toprak', top, 'toprak') + el('referans', ref, 'referans');
      const ep = gp('ense'); if (ep > 0) s += `<g opacity="${n1(ep)}">` + P(['ense', 'referans'], () => `<circle cx="${n1(ense[0])}" cy="${n1(ense[1])}" r="12" fill="#FFFFFF" stroke="${R.sag_kulak}" stroke-width="${k.W2(2.4)}" stroke-dasharray="${k.W2(4)} ${k.W2(3)}"/>`
        + c.yazi(ense[0] + 20, ense[1] + c.fs(6), L('ya da ense', 'or nape'), {a: 'start', px: 15, fw: 700, renk: R.sag_kulak})) + '</g>';
      s += `<g opacity="${n1(Math.min(gp('aktif'), gp('referans')))}">${v6Lejant(c, k, 40, 506, ['aktif', 'referans', 'toprak'])}</g>`;
      return s; }};
};

// ---------------------------------------------------------------- kuplör düzenekleri: "kalibrasyon" (kulaklık yapay kulakta, ölçüm mikrofonu, ses düzeyi ölçer; yapay mastoidde kemik vibratörü)
// ve "test_kutusu" (yalıtımlı kutu, hoparlör, test noktasında cihaz mikrofonu ve referans mikrofon, 2 cc kuplör ve kuplör mikrofonu, analizör)
// ayar: {mod, goster: {parca: cumle}, hacim: "6 ml", deger: "70,0"}
CIZ.kuplor = (c, ay) => {
  const gos = ay.goster || {}, gp = id => gos[id] != null ? v6Gor(c, gos[id], 0, .6) : 1;
  if (ay.mod === 'test_kutusu') {
    const a = {kutu: [340, 80], ses_emici: [70, 470], hoparlor: [118, 330], test_noktasi: [372, 300], isitme_cihazi: [430, 340], cihaz_mikrofonu: [384, 300], referans_mikrofon: [372, 250],
      kuplor: [530, 470], kuplor_mikrofonu: [530, 470], analizor: [840, 300], kablo: [660, 210], ses_dalgasi: [200, 330]};
    const takma = {test_kutusu: 'kutu', yalitimli_kutu: 'kutu', cihaz: 'isitme_cihazi', referans_mikrofonu: 'referans_mikrofon', iki_cc_kuplor: 'kuplor', '2cc_kuplor': 'kuplor', olcum_mikrofonu: 'kuplor_mikrofonu'};
    return {w: 1000, h: 580, cm: 1.05, a: takmaAd(a, takma), takma,
      yer: {kutu: 'ust', ses_emici: 'sol', hoparlor: 'sol', test_noktasi: 'ust', isitme_cihazi: 'alt', cihaz_mikrofonu: 'ust', referans_mikrofon: 'ust', kuplor: 'alt', kuplor_mikrofonu: 'alt', analizor: 'sag', kablo: 'ust', ses_dalgasi: 'ust'},
      svg: () => {
        const k = kalem(c, 1), P = anP(c), G = (id, fn) => { const p = gp(id); return p > 0 ? `<g opacity="${n1(p)}">${fn()}</g>` : ''; };
        let s = P(['kutu'], () => k.yol('M30 70 L650 70 L650 540 L30 540 Z M56 96 L56 514 L624 514 L624 96 Z', '#C9D3E0', NV, 2.4, 'fill-rule="evenodd"') + k.yol('M30 96 L650 96', 'none', NV, 2, `stroke-dasharray="${k.W2(4)} ${k.W2(5)}"`)
          + k.yol('M56 104 L624 104 L624 514 L56 514 Z', '#FFFFFF', null));
        s += G('ses_emici', () => P(['ses_emici'], () => { let g = ''; for (let y = 104; y < 506; y += 22) g += k.yol(`M56 ${y} L72 ${y + 11} L56 ${y + 22} M624 ${y} L608 ${y + 11} L624 ${y + 22}`, '#E3EBF5', '#9AABC2', 1.4);
          for (let x = 56; x < 616; x += 22) g += k.yol(`M${x} 104 L${x + 11} 120 L${x + 22} 104 M${x} 514 L${x + 11} 498 L${x + 22} 514`, '#E3EBF5', '#9AABC2', 1.4); return g; }));
        // kablolar: hoparlör ve mikrofonlar duvardan analizöre
        s += P(['kablo'], () => k.yol('M98 380 C 90 470 200 492 400 494 L640 494 L700 430', 'none', V6.koyu, 3) + G('referans_mikrofon', () => k.yol('M368 236 C 380 150 560 150 640 200 L700 240', 'none', V6.koyu, 3))
          + G('kuplor', () => k.yol('M530 500 C 560 520 620 470 700 400', 'none', V6.koyu, 3)));
        s += G('hoparlor', () => P(['hoparlor'], () => hoparlorCiz(k, 118, 330, .95, 0)) + P(['ses_dalgasi'], () => dalgaYay(k, 160, 330, 1, 3, 18, 18, R.mavi, .7)));
        // test noktası ve işitme cihazı (kulak arkası), kanca ve tüp 2 cc kuplöre
        s += G('test_noktasi', () => P(['test_noktasi'], () => k.yol(gElips(378, 300, 30, 30), 'none', R.mavi, 2, `stroke-dasharray="${k.W2(5)} ${k.W2(4)}"`) + k.yol('M338 300 L418 300 M378 260 L378 340', 'none', R.mavi, 1.4, 'opacity=".6"')));
        s += G('isitme_cihazi', () => P(['isitme_cihazi'], () => k.boru('M420 286 C 430 236 480 222 506 258 C 524 286 532 330 532 398', k.w(6), '#F4F7FB', NV, 1.6)
          + k.yol('M392 286 C 424 270 450 290 452 330 C 454 370 446 410 430 430 C 418 446 396 440 396 420 C 396 390 404 360 400 330 C 398 308 386 296 392 286 Z', '#F4F7FB', NV, 2.4))
          + P(['cihaz_mikrofonu', 'isitme_cihazi'], () => `<circle cx="398" cy="300" r="8" fill="#FFFFFF" stroke="${NV}" stroke-width="${k.W2(2)}"/><circle cx="398" cy="300" r="3" fill="${NV}"/>`));
        s += G('referans_mikrofon', () => P(['referans_mikrofon'], () => k.yol('M360 236 L376 236 L376 268 L360 268 Z', '#9AABC2', NV, 2) + `<circle cx="368" cy="272" r="7" fill="#FFFFFF" stroke="${NV}" stroke-width="${k.W2(2)}"/>`));
        s += G('kuplor', () => P(['kuplor'], () => k.yol('M484 400 L580 400 L580 500 L484 500 Z', V6.metal, NV, 2.4) + k.yol('M512 400 L552 400 L552 436 L512 436 Z', '#FFFFFF', NV, 1.8)
          + c.yazi(476, 470, ay.hacim || '2 cc', {a: 'end', px: 17, fw: 800, renk: R.lacivert}))
          + P(['kuplor_mikrofonu', 'kuplor'], () => k.yol('M518 436 L546 436 L546 486 L518 486 Z', '#9AABC2', NV, 1.8) + k.yol('M516 438 L548 438', 'none', R.mavi, 3)));
        s += G('analizor', () => P(['analizor'], () => { let g = k.yol('M700 140 L980 140 L980 480 L700 480 Z', '#F4F7FB', NV, 2.6) + `<rect x="720" y="164" width="240" height="170" rx="8" fill="${R.lacivert}"/>`;
          for (let i = 1; i < 6; i++) g += `<path d="M${720 + i * 40} 170 L${720 + i * 40} 328 M726 ${164 + i * 28} L954 ${164 + i * 28}" stroke="#FFFFFF" stroke-opacity=".14" stroke-width="${k.W2(1)}"/>`;
          g += `<path d="M732 300 C 770 296 800 250 840 230 C 870 216 900 214 920 236 C 934 252 944 290 950 316" fill="none" stroke="#7FC4FF" stroke-width="${k.W2(3)}"/>`;
          [760, 820, 880, 940].forEach(x => g += `<circle cx="${x}" cy="400" r="16" fill="#E3EBF5" stroke="${NV}" stroke-width="${k.W2(2)}"/>`);
          return g; }));
        return s; }};
  }
  // kalibrasyon
  const a = {kulaklik: [270, 180], yastik: [270, 236], kuplor: [170, 400], yapay_kulak: [170, 400], bosluk: [270, 296], olcum_mikrofonu: [270, 390], kablo: [450, 470], ses_duzeyi_olcer: [640, 300],
    yapay_mastoid: [880, 450], kemik_vibratoru: [870, 368], kuvvet: [870, 300]};
  const takma = {hacim: 'bosluk', mikrofon: 'olcum_mikrofonu', olcer: 'ses_duzeyi_olcer', slm: 'ses_duzeyi_olcer', ses_seviye_olcer: 'ses_duzeyi_olcer', vibrator: 'kemik_vibratoru', mastoid: 'yapay_mastoid'};
  return {w: 1000, h: 540, cm: 1.05, a: takmaAd(a, takma), takma, vurguEsle: {yapay_kulak: 'kuplor'},
    yer: {kulaklik: 'ust', yastik: 'sol', kuplor: 'sol', yapay_kulak: 'sol', bosluk: 'sol', olcum_mikrofonu: 'sol', kablo: 'alt', ses_duzeyi_olcer: 'ust', yapay_mastoid: 'alt', kemik_vibratoru: 'ust', kuvvet: 'ust'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c), G = (id, fn) => { const p = gp(id); return p > 0 ? `<g opacity="${n1(p)}">${fn()}</g>` : ''; };
      let s = P(['kablo'], () => k.yol('M270 470 C 280 520 480 520 560 440', 'none', V6.koyu, 3.4) + G('yapay_mastoid', () => k.yol('M780 446 C 760 470 740 470 720 450', 'none', V6.koyu, 3.4)));
      s += P(['kuplor', 'yapay_kulak'], () => k.yol('M150 250 L390 250 L390 470 L150 470 Z M210 250 L330 250 L330 340 L210 340 Z', V6.metal, NV, 2.4, 'fill-rule="evenodd"'));
      s += P(['bosluk', 'kuplor'], () => k.yol('M210 250 L330 250 L330 340 L210 340 Z', '#FFFFFF', NV, 1.8) + c.yazi(270, 304, ay.hacim || '6 ml', {px: 18, fw: 800, renk: R.mavi}));
      s += P(['olcum_mikrofonu'], () => k.yol('M240 340 L300 340 L300 430 L240 430 Z', '#9AABC2', NV, 2) + k.yol('M238 342 L302 342', 'none', R.mavi, 4) + k.yol('M250 430 L290 430 L290 470 L250 470 Z', V6.koyu, NV, 1.8));
      s += G('kulaklik', () => P(['kulaklik'], () => k.yol('M270 150 C 270 100 300 70 340 50', 'none', V6.koyu, 4) + k.yol('M180 150 L360 150 L360 222 L180 222 Z', V6.koyu, NV, 2.4)
        + `<circle cx="270" cy="186" r="20" fill="#7A8BA4"/>`) + P(['yastik', 'kulaklik'], () => k.yol('M168 222 L372 222 C 378 236 378 244 372 252 L168 252 C 162 244 162 236 168 222 Z', '#3B4A60', NV, 2)));
      s += P(['ses_duzeyi_olcer'], () => k.yol('M560 220 L720 220 L720 500 L560 500 Z', '#F4F7FB', NV, 2.6) + `<rect x="578" y="244" width="124" height="80" rx="8" fill="${R.lacivert}"/>`
        + c.yazi(640, 286, ay.deger || L('70,0', '70.0'), {px: 26, fw: 800, ff: 'Outfit', renk: '#FFFFFF'}) + c.yazi(640, 312, 'dB SPL', {px: 14, fw: 700, renk: '#9CC9F3'})
        + [600, 640, 680].map(x => `<circle cx="${x}" cy="370" r="12" fill="#E3EBF5" stroke="${NV}" stroke-width="${k.W2(1.8)}"/>`).join('') + k.yol('M590 420 L690 420 L690 470 L590 470 Z', '#E3EBF5', NV, 1.6));
      s += G('yapay_mastoid', () => P(['yapay_mastoid'], () => k.yol('M780 400 L980 400 L980 480 L780 480 Z', '#E3E8EF', NV, 2.4) + k.yol('M800 386 L960 386 L960 400 L800 400 Z', '#E2C9B6', NV, 1.8))
        + P(['kemik_vibratoru'], () => k.yol('M836 350 L904 350 L904 386 L836 386 Z', V6.koyu, NV, 2.2))
        + P(['kuvvet'], () => v6Ok(k, 870, 272, 870, 344, R.mavi, 3.6, false, 12) + c.yazi(884, 300, ay.kuvvet || L('5,4 N', '5.4 N'), {a: 'start', px: 17, fw: 800, renk: R.mavi})));
      return s; }};
};

// ---------------------------------------------------------------- işitsel beyin sapı implantı (ABI): beyin sapı yandan-arkadan (ön solda), dördüncü ventrikülün lateral girintisi,
// Luschka deliği, koklear nükleus yüzeyinde kürek biçimli elektrot. ayar: {elektrot_cumle, ust_yollar_cumle, kontak: 15}
CIZ.beyin_sapi_implanti = (c, ay) => {
  const SON = [500, 314], BAS = [372, 430];
  const a = {orta_beyin: [330, 70], pons: [300, 200], medulla: [340, 500], beyincik: [700, 420], dorduncu_ventrikul: [590, 300], lateral_resess: [560, 306], luschka_deligi: [438, 350],
    koklear_nukleus: [506, 300], elektrot: SON, kontaklar: SON, kablo: [700, 200], fasiyal_sinir: [300, 402], viii_sinir: [362, 404], glossofaringeal_sinir: [330, 470], superior_oliver: [370, 270], ust_yollar: [340, 150]};
  const takma = {abi_elektrodu: 'elektrot', kurek_elektrot: 'elektrot', elektrot_tasiyici: 'elektrot', lateral_girinti: 'lateral_resess', vestibulokoklear_sinir: 'viii_sinir', sekizinci_sinir: 'viii_sinir',
    isitme_siniri: 'viii_sinir', eabr: 'ust_yollar', isitme_yolu: 'ust_yollar', dorduncu_karincik: 'dorduncu_ventrikul', koklear_cekirdek: 'koklear_nukleus', vii: 'fasiyal_sinir', ix: 'glossofaringeal_sinir'};
  return {w: 900, h: 600, cm: 1.05, kirp: true, a: takmaAd(a, takma), takma, vurguEsle: {lateral_resess: 'dorduncu_ventrikul'},
    yer: {orta_beyin: 'sol', pons: 'sol', medulla: 'sol', beyincik: 'sag', dorduncu_ventrikul: 'sag', lateral_resess: 'ust', luschka_deligi: 'sol', koklear_nukleus: 'ust', elektrot: 'sag', kontaklar: 'sag',
      kablo: 'sag', fasiyal_sinir: 'sol', viii_sinir: 'alt', glossofaringeal_sinir: 'sol', superior_oliver: 'sol', ust_yollar: 'sol'},
    svg: () => {
      const k = kalem(c, 1), P = anP(c), pe = v6Gor(c, ay.elektrot_cumle, .5, 1.4);
      let s = P(['beyincik'], () => `<g opacity=".7">` + k.yol(gElips(680, 360, 220, 170), '#EEF2F8', NV, 2.2, `stroke-dasharray="${k.W2(9)} ${k.W2(6)}"`)
        + [0, 1, 2, 3, 4].map(i => k.yol(`M${520 + i * 6} ${290 + i * 34} C ${620} ${270 + i * 36} ${760} ${276 + i * 36} ${880 - i * 8} ${300 + i * 30}`, 'none', AR.ince, 1.4)).join('') + '</g>'
        + c.yazi(760, 560, L('beyincik (geri çekilmiş)', 'cerebellum (retracted)'), {px: 15, fw: 700, renk: R.soluk}));
      s += P(['medulla'], () => k.yol(gYol([[232, 316], [446, 316], [430, 440], [400, 600], [290, 600], [258, 440]], true, .3), '#F6F3F6', NV, 2.4));
      s += P(['orta_beyin'], () => k.yol(gYol([[220, 20], [440, 20], [450, 110], [210, 110]], true, .3), '#F6F3F6', NV, 2.2));
      s += P(['pons'], () => k.yol(gYol([[196, 120], [330, 100], [462, 124], [506, 214], [474, 306], [330, 330], [200, 312], [166, 216]], true, .45), '#F3EEF3', NV, 2.6));
      // lateral girinti ve Luschka deliği
      s += P(['dorduncu_ventrikul', 'lateral_resess'], () => k.boru('M640 292 C 580 292 500 318 446 348', k.w(26), '#D9ECFC', R.mavi, 1.6));
      s += P(['luschka_deligi'], () => k.yol(gElips(440, 350, 15, 11), '#9CC9F3', R.mavi, 2));
      s += P(['koklear_nukleus'], () => `<g transform="rotate(-12 506 312)">` + k.yol(gElips(506, 312, 58, 25), '#FFE3A8', '#C98A1C', 2.2) + '</g>');
      // sinirler (pontomedüller birleşim)
      s += P(['fasiyal_sinir'], () => k.boru('M408 330 C 380 352 330 380 286 410', k.w(13), AR.sinir, AR.sinir_c, 1.6));
      s += P(['viii_sinir'], () => k.boru('M430 342 C 410 362 386 384 368 400', k.w(14), AR.sinir, AR.sinir_c, 1.6) + k.yol('M360 392 L366 404 L356 410 L364 420', 'none', AR.sinir_c, 2.2));
      s += P(['glossofaringeal_sinir'], () => k.boru('M420 384 C 396 410 360 440 322 470', k.w(9), AR.sinir, AR.sinir_c, 1.4));
      if (!c.etiketli.has('fasiyal_sinir')) s += c.yazi(272, 432, 'VII', {px: 15, fw: 800, renk: R.soluk});
      if (!c.etiketli.has('viii_sinir')) s += c.yazi(350, 440, 'VIII', {px: 15, fw: 800, renk: R.soluk});
      if (!c.etiketli.has('glossofaringeal_sinir')) s += c.yazi(306, 498, 'IX', {px: 15, fw: 800, renk: R.soluk});
      // superior oliver kompleks ve üst yollar
      s += P(['superior_oliver'], () => k.yol(gElips(370, 272, 22, 14), '#FFFFFF', NV, 2));
      const pu = ay.ust_yollar_cumle != null ? v6Gor(c, ay.ust_yollar_cumle, 0, 1.2) : 0;
      s += P(['ust_yollar'], v => k.yol('M470 300 C 430 290 400 282 390 276 M350 266 C 330 230 330 180 336 60', 'none', R.mavi, 2.2, `stroke-dasharray="${k.W2(6)} ${k.W2(6)}" opacity="${n1(.35 + .3 * v)}"`)
        + v6YolOk(k, 'M470 300 C 430 290 400 282 390 276 M350 266 C 330 230 330 180 336 60', pu, R.mavi, 4, [336, 60, -Math.PI / 2 - .05]));
      // elektrot: Luschka deliğinden girintiye ilerler ve nükleusun yüzeyine oturur
      if (pe > 0) { const x = BAS[0] + (SON[0] - BAS[0]) * pe, y = BAS[1] + (SON[1] - BAS[1]) * pe, ac = -12 - 20 * (1 - pe), kn = Math.min(ay.kontak || 15, 21), sut = Math.ceil(kn / 3);
        s += `<g opacity="${n1(kis(pe * 2))}">` + P(['kablo'], () => k.boru(`M${n1(x + 44)} ${n1(y - 8)} C ${n1(x + 120)} ${n1(y - 40)} 640 210 880 70`, k.w(8), '#F4F7FB', NV, 1.6) + c.yazi(880, 40, L('alıcı-uyarıcıya →', 'to receiver →'), {a: 'end', px: 15, fw: 700, renk: R.soluk}))
          + P(['elektrot', 'kontaklar'], () => `<g transform="rotate(${n1(ac)} ${n1(x)} ${n1(y)})">` + `<rect x="${n1(x - 46)}" y="${n1(y - 17)}" width="92" height="34" rx="8" fill="#FFFFFF" stroke="${NV}" stroke-width="${k.W2(2.4)}"/>`
            + Array.from({length: kn}, (_, i) => `<circle cx="${n1(x - 36 + (i % sut) * (72 / Math.max(1, sut - 1)))}" cy="${n1(y - 9 + Math.floor(i / sut) * 9)}" r="2.8" fill="${R.mavi}"/>`).join('') + '</g>') + '</g>'; }
      if (ay.yonler !== false) s += c.yazi(30, 590, L('← ÖN', '← ANT'), {a: 'start', px: 16, fw: 800, renk: R.soluk});
      return s; }};
};

// ================================================================ var olan çizimlere yeni modlar (ayar verilmezse eski çizim AYNEN çağrılır)

// ---------------------------------------------------------------- abr + polarite (sıkışma / seyrelme izleri, ters dönen koklear mikrofonik, dalga V yokluğu, tüp kapalı kontrol izi)
// ayar.polarite: true -> {cm: true, noral: false, sikisma_cumle, seyrelme_cumle, cm_cumle, v_cumle, tup_kapali: false, tup_cumle}
// ayar.dalga1_oran: 0.45 -> normal iz (kesik) ve dalga I genliği azalmış iz üst üste: {azalmis_cumle, genlik_cumle}
(() => {
  const eski = CIZ.abr;
  const GEN = {I: .26, II: .14, III: .3, IV: .3, V: .5}, LAT = {I: 1.6, II: 2.75, III: 3.8, IV: 5.1, V: 5.6};
  const noral = (t, o1 = 1) => { let y = 0; for (const n in GEN) y += GEN[n] * (n === 'I' ? o1 : 1) * Math.exp(-Math.pow((t - LAT[n]) / .2, 2));
    y -= .12 * o1 * Math.exp(-Math.pow((t - LAT.I - .55) / .22, 2)) + .1 * Math.exp(-Math.pow((t - LAT.III - .5) / .25, 2)) + .38 * Math.exp(-Math.pow((t - LAT.V - 1.1) / .45, 2));
    return y + .03 * Math.sin(t * 3.1) - .04 * Math.exp(-Math.pow(t / .5, 2)); };
  CIZ.abr = (c, ay) => {
    if (!ay.polarite && ay.dalga1_oran == null) return eski(c, ay);
    const x0 = 100, x1 = 850, X = t => x0 + (x1 - x0) * t / 10;
    if (ay.polarite) {
      const yb = 230, Sc = 240, yt = 440, cmVar = ay.cm !== false, nr = !!ay.noral, yY = y => yb - Sc * y;
      const cm = t => t < .9 ? 0 : .58 * Math.exp(-(t - .9) / 1.25) * Math.sin(2 * Math.PI * (t - .9) / .95) * kis((t - .9) / .12);
      const iz = (t, sg) => (nr ? noral(t) : .015 * Math.sin(t * 5.3) + .012 * Math.sin(t * 11.7)) + (cmVar ? sg * cm(t) : 0);
      const a = {sikisma: [X(1.15), yY(.5)], seyrelme: [X(1.15), yY(-.5)], cm: [X(2.6), yY(.62)], koklear_mikrofonik: [X(2.6), yY(.62)], dalga_V_yeri: [X(5.8), yY(.1)], tup_kapali: [X(8), yt],
        dalga_I: [X(1.6), yY(.4)], dalga_V: [X(5.6), yY(.62)]};
      const takma = {ters_donen: 'cm', dalga_v_yok: 'dalga_V_yeri', dalga_V_yok: 'dalga_V_yeri', tup: 'tup_kapali', kondensasyon: 'sikisma', rarefaksiyon: 'seyrelme'};
      return {w: 900, h: 520, a: takmaAd(a, takma), takma, yer: {sikisma: 'ust', seyrelme: 'alt', cm: 'ust', koklear_mikrofonik: 'ust', dalga_V_yeri: 'ust', tup_kapali: 'sag', dalga_I: 'ust', dalga_V: 'ust'},
        svg: () => {
          const k = kalem(c, 1), P = anP(c), xt = []; for (let t = 0; t <= 10; t++) xt.push({x: X(t), e: t % 2 ? null : t});
          let s = eksenCiz(c, {x0, x1, y0: 40, y1: 480, xt, yt: [], xAd: L('Latans (ms)', 'Latency (ms)')});
          s += `<line x1="${x0}" y1="${yb}" x2="${x1}" y2="${yb}" stroke="${R.cizgi}" stroke-width="${k.W2(1.6)}" stroke-dasharray="${k.W2(6)} ${k.W2(6)}"/>`;
          s += `<path d="M${x1 - 10} 50 L${x1 - 10} ${n1(50 + Sc * .5)}" stroke="${R.lacivert}" stroke-width="${k.W2(3)}"/>` + c.yazi(x1 - 20, 50 + Sc * .25 + c.fs(7), L('0,5 µV', '0.5 µV'), {a: 'end', px: 17, fw: 500});
          const cmP = ay.cm_cumle != null ? v6Gor(c, ay.cm_cumle, 0, .6) : 0;
          if (cmVar) s += P(['cm', 'koklear_mikrofonik'], v => { const o = Math.max(cmP, v); return o < .01 ? '' : `<rect x="${n1(X(.9))}" y="60" width="${n1(X(4.6) - X(.9))}" height="${n1(2 * (yb - 60))}" fill="${R.sari}" fill-opacity="${n1(.16 * o)}"/>`
            + c.yazi(X(2.75), 76, L('ters dönen yanıt', 'inverting response'), {px: 16, fw: 800, renk: '#9A6A10', ek: `opacity="${n1(o)}"`}); });
          const ciz = (id, sg, renk, cm2, gec, kalin) => { const p = ilerle(c.t, ekBas(c, cm2, gec), 1.4); if (p <= 0) return '';
            const pts = []; for (let t = .05; t <= 10 * p; t += .02) pts.push([X(t), yY(iz(t, sg))]);
            return P([id], () => `<path d="${yolDiz(pts)}" fill="none" stroke="${renk}" stroke-width="${k.W2(kalin)}" stroke-linecap="round" stroke-linejoin="round"/>`); };
          s += ciz('sikisma', 1, R.lacivert, ay.sikisma_cumle, .4, 3.6) + ciz('seyrelme', -1, R.sag_kulak, ay.seyrelme_cumle, .9, 3);
          // lejant
          const lp = [ilerle(c.t, ekBas(c, ay.sikisma_cumle, .4), .6), ilerle(c.t, ekBas(c, ay.seyrelme_cumle, .9), .6)];
          [[L('sıkışma', 'condensation'), R.lacivert], [L('seyrelme', 'rarefaction'), R.sag_kulak]].forEach(([m, r2], i) => { if (lp[i] <= 0) return;
            s += `<g opacity="${n1(lp[i])}"><line x1="620" y1="${320 + i * 30}" x2="660" y2="${320 + i * 30}" stroke="${r2}" stroke-width="${k.W2(4)}"/>` + c.yazi(670, 320 + i * 30 + c.fs(6), m, {a: 'start', px: 17, fw: 600}) + '</g>'; });
          if (!nr) { const pv = ay.v_cumle != null ? v6Gor(c, ay.v_cumle, 0, .6) : 0;
            s += P(['dalga_V_yeri'], v => { const o = Math.max(pv, v); return o < .01 ? '' : `<g opacity="${n1(o)}"><line x1="${n1(X(5.8))}" y1="70" x2="${n1(X(5.8))}" y2="${yb + 70}" stroke="${R.soluk}" stroke-width="${k.W2(2)}" stroke-dasharray="${k.W2(6)} ${k.W2(5)}"/>`
              + c.yazi(X(5.8), yb - 120, L('dalga V yok', 'no wave V'), {px: 18, fw: 800, renk: R.lacivert}) + '</g>'; }); }
          else ['I', 'III', 'V'].forEach(n => { const tx = LAT[n], ty = yY(noral(tx)); s += c.P('dalga_' + n, v => c.yazi(X(tx), ty - c.fs(18), n, {px: 22, fw: 800, ff: 'Outfit', renk: c.s(v, R.lacivert)})); });
          if (ay.tup_kapali) { const p = ilerle(c.t, ekBas(c, ay.tup_cumle, 1.2), 1.2); if (p > 0) { const pts = []; for (let t = .05; t <= 10 * p; t += .03) pts.push([X(t), yt - Sc * (.015 * Math.sin(t * 5.3) + .01 * Math.sin(t * 13.1))]);
            s += P(['tup_kapali'], () => `<path d="${yolDiz(pts)}" fill="none" stroke="${R.soluk}" stroke-width="${k.W2(3)}" stroke-dasharray="${k.W2(7)} ${k.W2(5)}"/>` + c.yazi(X(.2), yt - 22, L('tüp kapalı: yanıt kaybolur', 'tube clamped: response disappears'), {a: 'start', px: 16, fw: 700, renk: R.soluk})); } }
          return s; }};
    }
    // dalga I genliği karşılaştırması (aynı eşik, yüksek uyaran)
    const o1 = ay.dalga1_oran, yb = 250, Sc = 300, yY = y => yb - Sc * y;
    const tepe = (n, o) => { let bt = LAT[n], by = -9; for (let t = LAT[n] - .25; t <= LAT[n] + .25; t += .01) { const y = noral(t, o); if (y > by) { by = y; bt = t; } } return [X(bt), yY(by)]; };
    const T = {}, T0 = {}; ['I', 'III', 'V'].forEach(n => { T[n] = tepe(n, o1); T0[n] = tepe(n, 1); });
    const a = {dalga_I: [T0.I[0], T0.I[1] - 50], dalga_III: [T.III[0], T.III[1] - 50], dalga_V: [T.V[0], T.V[1] - 50], normal_iz: [X(8.4), yY(noral(8.4)) - 20], azalmis_iz: [X(1.6), T.I[1] + 40],
      dalga1_genlik: [T0.I[0] - 30, (T0.I[1] + yb) / 2]};
    const takma = {sinaptopati: 'azalmis_iz', azalmis: 'azalmis_iz', normal: 'normal_iz', genlik: 'dalga1_genlik'};
    return {w: 900, h: 520, a: takmaAd(a, takma), takma, yer: {dalga_I: 'ust', dalga_III: 'ust', dalga_V: 'ust', normal_iz: 'sag', azalmis_iz: 'alt', dalga1_genlik: 'sol'},
      svg: () => {
        const k = kalem(c, 1), P = anP(c), xt = []; for (let t = 0; t <= 10; t++) xt.push({x: X(t), e: t % 2 ? null : t});
        let s = eksenCiz(c, {x0, x1, y0: 40, y1: 460, xt, yt: [], xAd: L('Latans (ms)', 'Latency (ms)')});
        s += `<line x1="${x0}" y1="${yb}" x2="${x1}" y2="${yb}" stroke="${R.cizgi}" stroke-width="${k.W2(1.6)}" stroke-dasharray="${k.W2(6)} ${k.W2(6)}"/>`;
        s += `<path d="M${x1 - 10} 50 L${x1 - 10} ${50 + Sc * .5}" stroke="${R.lacivert}" stroke-width="${k.W2(3)}"/>` + c.yazi(x1 - 20, 50 + Sc * .25 + c.fs(7), L('0,5 µV', '0.5 µV'), {a: 'end', px: 17, fw: 500});
        const p0 = kis((c.t - .4) / 1.4), pa = ilerle(c.t, ekBas(c, ay.azalmis_cumle, .9), 1.4);
        const yol = (o, p) => { const pts = []; for (let t = .1; t <= 10 * p; t += .025) pts.push([X(t), yY(noral(t, o))]); return yolDiz(pts); };
        s += P(['normal_iz'], () => `<path d="${yol(1, p0)}" fill="none" stroke="${R.soluk}" stroke-width="${k.W2(3)}" stroke-dasharray="${k.W2(8)} ${k.W2(6)}" opacity=".8"/>`);
        if (pa > 0) s += P(['azalmis_iz'], () => `<path d="${yol(o1, pa)}" fill="none" stroke="${R.lacivert}" stroke-width="${k.W2(4)}" stroke-linecap="round" stroke-linejoin="round"/>`);
        ['I', 'III', 'V'].forEach(n => { const [x, y] = pa > .98 ? T[n] : T0[n]; s += c.P('dalga_' + n, v => `<circle cx="${n1(x)}" cy="${n1(y)}" r="7" fill="${R.mavi}" stroke="#fff" stroke-width="${k.W2(2)}"/>`
          + c.yazi(x, Math.min(y, T0[n][1]) - c.fs(20), n, {px: 24, fw: 800, ff: 'Outfit', renk: c.s(v, R.lacivert)})); });
        const pg = ay.genlik_cumle != null ? v6Gor(c, ay.genlik_cumle, 0, .6) : 0;
        if (pg > 0) s += `<g opacity="${n1(pg)}">` + P(['dalga1_genlik'], () => v6Ok(k, T0.I[0] - 22, yb, T0.I[0] - 22, T0.I[1], R.soluk, 2.4, true, 9) + v6Ok(k, T.I[0] + 22, yb, T.I[0] + 22, T.I[1], R.mavi, 3, true, 9)) + '</g>';
        const lp = [p0, pa];
        [[L('normal', 'normal'), R.soluk, true], [L('dalga I azalmış', 'reduced wave I'), R.lacivert, false]].forEach(([m, r2, ks], i) => { if (lp[i] <= 0) return;
          s += `<g opacity="${n1(kis(lp[i] * 2))}"><line x1="560" y1="${410 + i * 30}" x2="600" y2="${410 + i * 30}" stroke="${r2}" stroke-width="${k.W2(ks ? 3 : 4)}" ${ks ? `stroke-dasharray="${k.W2(8)} ${k.W2(6)}"` : ''}/>` + c.yazi(610, 410 + i * 30 + c.fs(6), m, {a: 'start', px: 17, fw: 600}) + '</g>'; });
        return s; }};
  };
})();

// ---------------------------------------------------------------- bas_ustten + mod "cros" (CROS / kemik yolu yönlendirme, isteğe bağlı implant) ve mod "lisn" (LiSN-S sanal uzayı)
(() => {
  const eski = CIZ.bas_ustten;
  CIZ.bas_ustten = (c, ay) => {
    if (ay.mod === 'cros') return basCros(c, ay);
    if (ay.mod === 'lisn') return basLisn(c, ay);
    return eski(c, ay);
  };
  // ayar: {kotu_kulak: "sag"|"sol", cihaz: "cros"|"kemik_yolu"|"ikisi", cihaz_cumle, aktarim_cumle, implant_cumle}
  function basCros(c, ay) {
    const cx = 450, cy = 320, rx = 120, ry = 150, m = (ay.kotu_kulak || 'sag') === 'sag' ? 1 : -1, cih = ay.cihaz || 'cros';
    const kotu = [cx + m * rx * 1.12, cy + 8], iyi = [cx - m * rx * 1.12, cy + 8], kok = [cx - m * 74, cy + 20], sx = cx + m * 360;
    const a = {kotu_kulak: kotu, iyi_kulak: iyi, bas: [cx, cy + ry], bas_golgesi: [cx - m * 300, cy + 170], ses_kaynagi: [sx, cy - 60], verici: [kotu[0] + m * 16, cy + 50], alici: [iyi[0] - m * 16, cy + 50],
      aktarim: [cx, cy + ry + 70], kemik_yolu: [cx, cy - 20], implant: [kotu[0] + m * 8, cy - 40], iki_girdi: [cx, cy + 60], koklea: kok};
    const takma = {yakin_kulak: 'kotu_kulak', sagir_kulak: 'kotu_kulak', uzak_kulak: 'iyi_kulak', golge: 'bas_golgesi', konusma: 'ses_kaynagi', cros_verici: 'verici', kablosuz_aktarim: 'aktarim',
      kafatasi_iletimi: 'kemik_yolu', koklear_implant: 'implant', pes_uzak_kulak: 'iyi_kulak'};
    const sagT = m > 0 ? 'sag' : 'sol', solT = m > 0 ? 'sol' : 'sag';
    return {w: 900, h: 620, cm: 1.05, kirp: true, a: takmaAd(a, takma), takma,
      yer: {kotu_kulak: 'alt', iyi_kulak: 'alt', bas: 'alt', bas_golgesi: solT, ses_kaynagi: 'ust', verici: sagT, alici: solT, aktarim: 'alt', kemik_yolu: 'ust', implant: 'ust', iki_girdi: 'alt', koklea: 'ust'},
      svg: () => {
        const k = kalem(c, 1), P = anP(c), B = basUstten(k, cx, cy, rx, ry), pc = v6Gor(c, ay.cihaz_cumle, .5, .6), pa = ilerle(c.t, ekBas(c, ay.aktarim_cumle, 1), 1.2);
        const pi = ay.implant_cumle != null ? v6Gor(c, ay.implant_cumle, 0, .8) : 0, cikis = 1 - pi;
        const golge = [[cx, cy - ry], [cx - m * 420, cy - ry * 1.2], [cx - m * 420, cy + ry * 1.2], [cx, cy + ry]];
        let s = P(['bas_golgesi'], () => `<path d="${gPoly(golge)}" fill="${SM.koyu}" fill-opacity=".11"/>`);
        s += P(['ses_kaynagi'], () => kisiUst(k, sx, cy - 20, 42, m > 0 ? -90 : 90, '#BFDDF8') + dalgaYay(k, sx - m * 62, cy - 20, -m, 4, 26, 22, R.mavi, .8));
        s += P(['bas'], () => B.bas) + P(['kotu_kulak'], () => m > 0 ? B.sag : B.sol) + P(['iyi_kulak'], () => m > 0 ? B.sol : B.sag);
        // kulak arkası cihazlar
        const bte = (x, y, mm) => k.yol(`M${x} ${y - 30} C ${x + mm * 22} ${y - 30} ${x + mm * 26} ${y - 6} ${x + mm * 24} ${y + 20} C ${x + mm * 22} ${y + 40} ${x + mm * 8} ${y + 44} ${x} ${y + 34} Z`, '#F4F7FB', NV, 2.2);
        if (pc > 0) {
          s += `<g opacity="${n1(pc * cikis)}">` + P(['verici'], () => bte(kotu[0] + m * 6, cy + 40, m) + `<circle cx="${n1(kotu[0] + m * 18)}" cy="${cy + 16}" r="5" fill="${R.mavi}"/>`) + '</g>';
          if (cih !== 'kemik_yolu') s += `<g opacity="${n1(pc * cikis)}">` + P(['alici'], () => bte(iyi[0] - m * 6, cy + 40, -m) + k.yol(gElips(iyi[0] + m * 18, cy + 8, 8, 6), '#FFFFFF', NV, 1.6)) + '</g>';
        }
        // aktarım: kablosuz yay (başın arkasından) ve / ya da kafatası içinden
        if (cih !== 'kemik_yolu' && pa > 0) { const d = `M${n1(kotu[0] + m * 10)} ${cy + 76} C ${n1(kotu[0] + m * 10)} ${cy + 250} ${n1(iyi[0] - m * 10)} ${cy + 250} ${n1(iyi[0] - m * 10)} ${cy + 80}`;
          s += `<g opacity="${n1(cikis)}">` + P(['aktarim'], () => v6YolOk(k, d, pa, R.mavi, 4, [iyi[0] - m * 10, cy + 80, -Math.PI / 2]) + (pa > .5 ? c.yazi(cx, cy + ry + 98, cih === 'ikisi' ? 'CROS' : L('kablosuz', 'wireless'), {px: 17, fw: 800, renk: R.mavi}) : '')) + '</g>'; }
        if (cih !== 'cros' && pa > 0) { const d = `M${n1(kotu[0] - m * 30)} ${cy - 6} C ${cx + m * 40} ${cy - 60} ${cx - m * 20} ${cy - 50} ${n1(kok[0] + m * 18)} ${n1(kok[1] - 10)}`;
          s += `<g opacity="${n1(cikis)}">` + P(['kemik_yolu'], () => `<path d="${d}" fill="none" stroke="${R.sari}" stroke-width="${k.W2(4)}" stroke-dasharray="${k.W2(8)} ${k.W2(6)}" opacity="${n1(pa)}"/>`
            + (pa > .97 ? okBasi(kok[0] + m * 18, kok[1] - 10, Math.atan2((kok[1] - 10) - (cy - 50), (kok[0] + m * 18) - (cx - m * 20)), k.w(14), R.sari, k.w(4)) : '')
            + (pa > .5 ? c.yazi(cx, cy - 74, cih === 'ikisi' ? L('kemik yolu', 'bone conduction') : L('kafatası titreşimi', 'skull vibration'), {px: 17, fw: 800, renk: '#9A6A10'}) : '')) + '</g>'; }
        s += P(['koklea'], () => k.yol(sarmal(kok[0], kok[1], 16, 3, 2, 0), 'none', AR.sinir_c, 2.4)) + k.yol(sarmal(cx + m * 74, cy + 20, 16, 3, 2, 0), 'none', '#9AABC2', 2);
        // implant: sağır kulağa kendi girdisi
        if (pi > 0) { s += `<g opacity="${n1(pi)}">` + P(['implant'], () => `<circle cx="${n1(kotu[0] + m * 8)}" cy="${cy - 40}" r="20" fill="#FFFFFF" stroke="${NV}" stroke-width="${k.W2(2.4)}"/><circle cx="${n1(kotu[0] + m * 8)}" cy="${cy - 40}" r="7" fill="${R.lacivert}"/>`
            + bte(kotu[0] + m * 6, cy + 40, m))
          + P(['iki_girdi'], () => v6Ok(k, kotu[0] - m * 24, cy + 30, cx + m * 30, cy + 56, m > 0 ? R.sag_kulak : R.sol_kulak, 4, false, 13) + v6Ok(k, iyi[0] + m * 24, cy + 30, cx - m * 30, cy + 56, m > 0 ? R.sol_kulak : R.sag_kulak, 4, false, 13)
            + c.yazi(cx, cy + 100, L('iki kulaktan girdi', 'input from both ears'), {px: 17, fw: 800, renk: R.lacivert})) + '</g>'; }
        if (ay.yonler !== false) s += c.yazi(40, 30, L('↑ ÖN', '↑ ANT'), {a: 'start', px: 17, fw: 800, renk: R.soluk}) + c.yazi(860, 610, L('Sağ', 'Right'), {a: 'end', px: 18, fw: 700, renk: R.sag_kulak}) + c.yazi(40, 610, L('Sol', 'Left'), {a: 'start', px: 18, fw: 700, renk: R.sol_kulak});
        return s; }};
  }
  // ayar: {gurultu: "iki"|"sag"|"sol", kosul: "farkli"|"ayni", kosul_cumle (aynı yerden yanlara geçiş), kulaklik: true}
  function basLisn(c, ay) {
    const cx = 450, cy = 380, rx = 110, ry = 140, R0 = 300, gr = ay.gurultu || 'iki';
    const ust = (th) => [cx + R0 * Math.sin(th * Math.PI / 180), cy - R0 * Math.cos(th * Math.PI / 180)];
    const tek = gr !== 'iki', ms = gr === 'sol' ? -1 : 1;
    const a = {hedef: [cx, 70], konusma: [cx, 70], dikkat_dagitici: ust(90 * ms), gurultu: ust(90 * ms), sag_dikkat_dagitici: ust(90), sol_dikkat_dagitici: ust(-90), bas: [cx, cy + ry], kulaklik: [cx, cy - 40],
      bas_golgesi: [cx - ms * 260, cy + 190], iyi_kulak: [cx - ms * rx * 1.12, cy + 8], kotu_kulak: [cx + ms * rx * 1.12, cy + 8]};
    const takma = {hedef_konusmaci: 'hedef', hikaye_anlaticilar: 'dikkat_dagitici', golge: 'bas_golgesi', sanal_uzay: 'kulaklik'};
    return {w: 900, h: 640, cm: 1.05, kirp: true, a: takmaAd(a, takma), takma, vurguEsle: {konusma: 'hedef', gurultu: 'dikkat_dagitici'},
      yer: {hedef: 'ust', konusma: 'ust', dikkat_dagitici: ms > 0 ? 'sag' : 'sol', gurultu: ms > 0 ? 'sag' : 'sol', sag_dikkat_dagitici: 'sag', sol_dikkat_dagitici: 'sol', bas: 'alt', kulaklik: 'ust',
        bas_golgesi: ms > 0 ? 'sol' : 'sag', iyi_kulak: ms > 0 ? 'sol' : 'sag', kotu_kulak: ms > 0 ? 'sag' : 'sol'},
      svg: () => {
        const k = kalem(c, 1), P = anP(c), B = basUstten(k, cx, cy, rx, ry);
        const q = ay.kosul === 'ayni' ? 0 : ay.kosul_cumle != null ? v6Gor(c, ay.kosul_cumle, 0, 1.4) : 1, th = 12 + (90 - 12) * q;
        const yanlar = tek ? [ms] : [1, -1];
        let s = P(['bas_golgesi'], v => q < .5 && v < .01 ? '' : yanlar.map(m => `<path d="${gPoly([[cx, cy - ry], [cx - m * 440, cy - ry * 1.3], [cx - m * 440, cy + ry * 1.3], [cx, cy + ry]])}" fill="${SM.koyu}" fill-opacity="${n1(.1 * kis((q - .5) * 2) * (tek ? 1.2 : .7))}"/>`).join(''));
        s += P(['bas'], () => B.bas) + P(['iyi_kulak'], () => ms > 0 ? B.sol : B.sag) + P(['kotu_kulak'], () => ms > 0 ? B.sag : B.sol);
        if (ay.kulaklik !== false) s += P(['kulaklik'], () => k.yol(`M${cx - rx * 1.02} ${cy - 10} C ${cx - rx * .7} ${cy - 70} ${cx + rx * .7} ${cy - 70} ${cx + rx * 1.02} ${cy - 10}`, 'none', SM.koyu, 6)
          + [-1, 1].map(m => k.yol(`M${n1(cx + m * rx * 1.02)} ${cy - 30} L${n1(cx + m * rx * 1.22)} ${cy - 30} L${n1(cx + m * rx * 1.22)} ${cy + 44} L${n1(cx + m * rx * 1.02)} ${cy + 44} Z`, m > 0 ? R.sag_kulak : R.sol_kulak, NV, 2)).join(''));
        s += P(['hedef', 'konusma'], () => kisiUst(k, cx, 70, 40, 180, '#BFDDF8') + dalgaYay(k, cx, 122, 1, 3, 22, 20, R.mavi, .8).replace(/<path /g, `<path transform="rotate(90 ${cx} 122)" `)
          + c.yazi(cx + 50, 64, '0°', {a: 'start', px: 17, fw: 800, renk: R.mavi}));
        yanlar.forEach(m => { const p0 = ust(m * th), id = m > 0 ? 'sag_dikkat_dagitici' : 'sol_dikkat_dagitici', aci = Math.atan2(cy - p0[1], cx - p0[0]) * 180 / Math.PI;
          s += P([id, 'dikkat_dagitici', 'gurultu'], () => kisiUst(k, p0[0], p0[1], 38, aci + 90, SM.giysi2)
            + `<g transform="rotate(${n1(aci)} ${n1(p0[0])} ${n1(p0[1])})">${dalgaYay(k, p0[0] + 44, p0[1], 1, 3, 20, 16, SM.koyu, .55)}</g>`
            + (q > .9 ? c.yazi(p0[0], p0[1] + (m > 0 ? 70 : 70), '90°', {px: 17, fw: 800, renk: SM.koyu}) : '')); });
        if (ay.kulaklik !== false) s += c.yazi(cx, 626, L('kulaklıkla verilen sanal uzay', 'virtual space under headphones'), {px: 16, fw: 700, renk: R.soluk});
        return s; }};
  }
})();

// ---------------------------------------------------------------- kulak_kesit + prob "oae": OAE probu (hoparlör ve mikrofon; pompa kanalı yok). ayar: {prob: "oae", prob_cumle}
(() => {
  const eski = CIZ.kulak_kesit;
  CIZ.kulak_kesit = (c, ay) => {
    if (String(ay.prob || '').toLowerCase() !== 'oae') return eski(c, ay);
    const d = eski(c, Object.assign({}, ay, {prob: 'timpanometri'})), s0 = d.svg;
    d.a = Object.assign({}, d.a); delete d.a.prob_pompa;
    d.svg = () => { const P0 = c.P; c.P = (id, fn) => (Array.isArray(id) ? id : [id]).includes('prob_pompa') ? '' : P0(id, fn);
      try { return s0(); } finally { c.P = P0; } };
    return d;
  };
})();

// ---------------------------------------------------------------- beyin_ustten + yollar: yalnız listelenen yollar çizilir (false: hiçbiri). ayar: {yollar: ["capraz_yol_sag", "capraz_yol_sol", "ayni_taraf_yol", "kallozal_yol"]}
(() => {
  const eski = CIZ.beyin_ustten, YOL = ['capraz_yol_sag', 'capraz_yol_sol', 'ayni_taraf_yol', 'kallozal_yol'], YOK = -999;
  CIZ.beyin_ustten = (c, ay) => {
    if (ay.yollar == null) return eski(c, ay);
    const acik = ay.yollar === false ? [] : ay.yollar, yc = Object.assign({}, ay.yol_cumleleri || {});
    YOL.forEach(id => { if (!acik.includes(id)) yc[id] = YOK; });
    const d = eski(c, Object.assign({}, ay, {yol_cumleleri: yc})), s0 = d.svg;
    d.svg = () => { const cb0 = c.cb; c.cb = i => i === YOK ? 1e9 : cb0(i); try { return s0(); } finally { c.cb = cb0; } };
    return d;
  };
})();

// ---------------------------------------------------------------- kulak_kesit + implant: "orta_kulak" (aktif orta kulak implantı: işlemci, deri altı alıcı, kablo, incus uzun koluna tutturulmuş dönüştürücü)
// ya da "kemik_yolu" (tur: "perkutan" | "pasif" | "aktif": titanyum vida / mıknatıs / gömülü dönüştürücü). ayar: {implant, tur, implant_cumle, titresim_cumle}
(() => {
  const eski = CIZ.kulak_kesit;
  CIZ.kulak_kesit = (c, ay) => {
    const d = eski(c, ay);
    if (!ay.implant) return d;
    const amei = ay.implant === 'orta_kulak', tur = ay.tur || 'perkutan';
    const FMT = [684, 352], ek = amei
 ? {islemci: [178, 196], ses_islemcisi: [178, 196], alici: [276, 196], kablo: [470, 206], donusturucu: FMT, fmt: FMT, titresim: [720, 380]}
      : {islemci: [180, 196], ses_islemcisi: [180, 196], abutment: [240, 196], baglanti_parcasi: [240, 196], vida: [296, 196], titanyum_vida: [296, 196], miknatis: [276, 196], titresim: [640, 150], alici: [276, 196], donusturucu: [330, 196]};
    d.a = Object.assign({}, d.a, ek); d.yer = Object.assign({}, d.yer, {islemci: 'sol', ses_islemcisi: 'sol', alici: 'ust', kablo: 'ust', donusturucu: 'sag', fmt: 'sag', titresim: 'sag', abutment: 'ust', baglanti_parcasi: 'ust', vida: 'ust', titanyum_vida: 'ust', miknatis: 'ust'});
    d.kam = Object.assign({}, d.kam || {}, {implant: [300, 230]});
    const s0 = d.svg;
    d.svg = () => {
      const k = kalem(c, 1), P = anP(c), p = v6Gor(c, ay.implant_cumle, .3, .8), pt = ilerle(c.t, ekBas(c, ay.titresim_cumle, (ay.implant_cumle != null ? c.cb(ay.implant_cumle) : .3) + 1), 1.4);
      let s = s0();
      if (p <= 0) return s;
      const tt = .45 + .4 * Math.sin(c.t * 8);
      s += `<g opacity="${n1(kis(p * 1.5))}">`;
      if (amei) {
        s += P(['kablo'], () => k.boru(gYol([[298, 232], [380, 226], [470, 200], [560, 196], [628, 236], [672, 300], [688, 346]], false, .45), k.w(4), '#F4F7FB', NV, 1.4));
        s += P(['alici'], () => k.yol('M252 150 L300 150 L300 242 L252 242 Z', '#DCE6F3', NV, 2.2) + k.yol(gElips(276, 196, 12, 12), R.lacivert, null));
        s += P(['islemci', 'ses_islemcisi'], () => k.yol(gElips(186, 196, 46, 46), '#F4F7FB', NV, 2.6) + k.yol(gElips(186, 196, 16, 16), R.lacivert, null) + `<circle cx="170" cy="170" r="5" fill="${NV}"/>`);
        s += P(['donusturucu', 'fmt'], () => `<g transform="rotate(68 ${FMT[0]} ${FMT[1]})">` + k.yol(`M${FMT[0] - 18} ${FMT[1] - 9} L${FMT[0] + 18} ${FMT[1] - 9} L${FMT[0] + 18} ${FMT[1] + 9} L${FMT[0] - 18} ${FMT[1] + 9} Z`, '#B9C3CF', NV, 2) + '</g>'
          + k.yol(`M${FMT[0] - 10} ${FMT[1] - 18} C ${FMT[0] - 22} ${FMT[1] - 16} ${FMT[0] - 26} ${FMT[1] - 4} ${FMT[0] - 20} ${FMT[1] + 4}`, 'none', NV, 2.2));
        if (pt > 0) s += P(['titresim'], () => `<g opacity="${n1(pt * tt)}">` + [0, 1].map(i => k.yol(`M${FMT[0] + 22 + i * 10} ${FMT[1] - 18 - i * 6} C ${FMT[0] + 32 + i * 12} ${FMT[1] - 4} ${FMT[0] + 32 + i * 12} ${FMT[1] + 8} ${FMT[0] + 22 + i * 10} ${FMT[1] + 22 + i * 6}`, 'none', R.mavi, 2.4)).join('') + '</g>');
      } else {
        // dışta işlemci; deriden geçen bağlantı (perkütan) ya da deri altında mıknatıs / dönüştürücü (transkütan)
        s += P(['islemci', 'ses_islemcisi'], () => k.yol('M120 150 L228 150 L228 244 L120 244 Z', '#F4F7FB', NV, 2.6) + `<circle cx="140" cy="168" r="6" fill="${NV}"/>` + (tur !== 'perkutan' ? k.yol(gElips(214, 196, 10, 26), R.lacivert, null) : ''));
        if (tur === 'perkutan') {
          s += P(['abutment', 'baglanti_parcasi'], () => k.yol('M228 184 L306 184 L306 208 L228 208 Z', V6.titan, NV, 2));
          s += P(['vida', 'titanyum_vida'], () => { let g = k.yol('M306 186 L362 188 L368 196 L362 204 L306 206 Z', '#9AA6B4', NV, 2); for (let x = 312; x < 360; x += 9) g += k.yol(`M${x} 186 L${x + 4} 206`, 'none', NV, 1.4); return g; });
        } else {
          s += P(['miknatis', 'alici'], () => k.yol('M262 160 L292 160 L292 232 L262 232 Z', tur === 'aktif' ? '#DCE6F3' : R.lacivert, NV, 2));
          if (tur === 'aktif') s += P(['donusturucu'], () => k.yol('M296 176 L368 176 L368 216 L296 216 Z', '#9AA6B4', NV, 2) + k.yol('M292 196 L296 196', 'none', NV, 3));
        }
        if (pt > 0) s += P(['titresim'], () => v6YolOk(k, 'M372 194 C 520 110 820 120 985 440', pt, R.sari, 4.4, [985, 440, 1.2], {b: 16})
          + `<g opacity="${n1(tt)}">` + [0, 1].map(i => k.yol(`M${380 + i * 12} ${172 - i * 8} C ${392 + i * 14} ${186} ${392 + i * 14} ${206} ${380 + i * 12} ${220 + i * 8}`, 'none', R.mavi, 2.4)).join('') + '</g>');
      }
      return s + '</g>'; };
    return d;
  };
})();

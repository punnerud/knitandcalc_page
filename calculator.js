// Knit Calculator - Increase/Decrease Calculator
// Language support: Norwegian and English

const translations = {
  no: {
    title: 'Øke / felle kalkulator',
    decrease: 'Felle',
    increase: 'Øke',
    stitchesOnNeedle: 'Antall masker på pinnen',
    changeCount: 'Antall fellinger / økninger',
    calculate: 'Beregn',
    resultPlaceholder: 'Resultat vises her.',
    invalidInput: 'Ugyldig inndata.',
    noChanges: 'Ingen {mode} valgt. Du har fortsatt {count} masker på pinnen.',
    noChangesDecrease: 'fellinger',
    noChangesIncrease: 'økninger',
    tooManyDecreases: 'Du prøver å felle for mange masker. Maks antall fellinger for {count} masker er {max}.',
    decreaseDistribute: 'Felle - fordel {changes} fellinger jevnt på {stitches} masker',
    increaseDistribute: 'Øke - fordel {changes} økninger jevnt på {stitches} masker',
    times: 'ganger',
    time: 'gang',
    finalStitches: 'Du har nå {count} masker på pinnen',
    knit2tog: 'Strikk 2 sammen',
    knit1then2tog: 'Strikk 1 maske, strikk 2 sammen',
    knitNthen2tog: 'Strikk {n} masker, strikk 2 sammen',
    inc1: 'Øk 1 maske',
    knit1thenInc: 'Strikk 1 maske, øk 1 maske',
    knitNthenInc: 'Strikk {n} masker, øk 1 maske'
  },
  en: {
    title: 'Increase / Decrease Calculator',
    decrease: 'Decrease',
    increase: 'Increase',
    stitchesOnNeedle: 'Number of stitches on needle',
    changeCount: 'Number of decreases / increases',
    calculate: 'Calculate',
    resultPlaceholder: 'Result will be shown here.',
    invalidInput: 'Invalid input.',
    noChanges: 'No {mode} selected. You still have {count} stitches on the needle.',
    noChangesDecrease: 'decreases',
    noChangesIncrease: 'increases',
    tooManyDecreases: 'Too many decreases. Maximum decreases for {count} stitches is {max}.',
    decreaseDistribute: 'Decrease - distribute {changes} decreases evenly across {stitches} stitches',
    increaseDistribute: 'Increase - distribute {changes} increases evenly across {stitches} stitches',
    times: 'times',
    time: 'time',
    finalStitches: 'You now have {count} stitches on the needle',
    knit2tog: 'Knit 2 together',
    knit1then2tog: 'Knit 1 stitch, knit 2 together',
    knitNthen2tog: 'Knit {n} stitches, knit 2 together',
    inc1: 'Increase 1 stitch',
    knit1thenInc: 'Knit 1 stitch, increase 1 stitch',
    knitNthenInc: 'Knit {n} stitches, increase 1 stitch'
  }
};

let currentLang = 'en';

function setLanguage(lang) {
  currentLang = lang;
  updateUI();
}

function t(key, params = {}) {
  let text = translations[currentLang][key] || key;
  Object.keys(params).forEach(param => {
    text = text.replace(`{${param}}`, params[param]);
  });
  return text;
}

function updateUI() {
  const elements = {
    'calc-title': 'title',
    'mode-decrease': 'decrease',
    'mode-increase': 'increase',
    'label-start': 'stitchesOnNeedle',
    'label-count': 'changeCount',
    'btn-calculate': 'calculate'
  };

  Object.entries(elements).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  });
}

// Group identical instructions into "X times"
function groupRuns(arr) {
  if (!arr.length) return [];
  const out = [];
  let cur = { text: arr[0], count: 1 };
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] === cur.text) cur.count++;
    else { out.push(cur); cur = { text: arr[i], count: 1 }; }
  }
  out.push(cur);
  return out;
}

// Generate human-friendly text for a repeat element
function instructionText(type, knitBefore) {
  if (type === 'decrease') {
    if (knitBefore <= 0) return t('knit2tog');
    if (knitBefore === 1) return t('knit1then2tog');
    return t('knitNthen2tog', { n: knitBefore });
  } else { // increase
    if (knitBefore <= 0) return t('inc1');
    if (knitBefore === 1) return t('knit1thenInc');
    return t('knitNthenInc', { n: knitBefore });
  }
}

// Main calculation logic
function renderResult(S, D, mode) {
  const output = document.getElementById('calc-output');
  if (!output) return;

  output.innerHTML = '';

  if (isNaN(S) || isNaN(D) || S < 0 || D < 0) {
    output.innerHTML = `<div class="error">${t('invalidInput')}</div>`;
    return;
  }

  if (D === 0) {
    const modeText = mode === 'decrease' ? t('noChangesDecrease') : t('noChangesIncrease');
    output.innerHTML = `<div class="line">${t('noChanges', { mode: modeText, count: S })}</div>`;
    return;
  }

  if (mode === 'decrease') {
    const totalKnit = S - 2 * D;
    if (totalKnit < 0) {
      output.innerHTML = `<div class="error">${t('tooManyDecreases', { count: S, max: Math.floor(S / 2) })}</div>`;
      return;
    }

    const base = Math.floor(totalKnit / D);
    const extra = totalKnit % D;
    const startExtra = Math.floor(extra / 2);
    const endExtra = extra - startExtra;
    const middleCount = D - extra;

    const seq = [];
    for (let i = 0; i < startExtra; i++) seq.push(instructionText('decrease', base + 1));
    for (let i = 0; i < middleCount; i++) seq.push(instructionText('decrease', base));
    for (let i = 0; i < endExtra; i++) seq.push(instructionText('decrease', base + 1));

    const grouped = groupRuns(seq);

    const el = document.createElement('div');
    el.innerHTML = `<div><small>${t('decreaseDistribute', { changes: D, stitches: S })}</small></div>`;
    grouped.forEach(g => {
      const timesText = g.count === 1 ? t('time') : t('times');
      el.innerHTML += `<div class="line">*${g.text}* ${g.count} ${timesText}</div>`;
    });
    el.innerHTML += `<div class="final">${t('finalStitches', { count: S - D })}</div>`;
    output.appendChild(el);

  } else { // mode === 'increase'
    const totalKnit = S;
    const base = Math.floor(totalKnit / D);
    const extra = totalKnit % D;
    const startExtra = Math.floor(extra / 2);
    const endExtra = extra - startExtra;
    const middleCount = D - extra;

    const seq = [];
    for (let i = 0; i < startExtra; i++) seq.push(instructionText('increase', base + 1));
    for (let i = 0; i < middleCount; i++) seq.push(instructionText('increase', base));
    for (let i = 0; i < endExtra; i++) seq.push(instructionText('increase', base + 1));

    const grouped = groupRuns(seq);

    const el = document.createElement('div');
    el.innerHTML = `<div><small>${t('increaseDistribute', { changes: D, stitches: S })}</small></div>`;
    grouped.forEach(g => {
      const timesText = g.count === 1 ? t('time') : t('times');
      el.innerHTML += `<div class="line">*${g.text}* ${g.count} ${timesText}</div>`;
    });
    el.innerHTML += `<div class="final">${t('finalStitches', { count: S + D })}</div>`;
    output.appendChild(el);
  }
}

// Initialize calculator when DOM is ready
function initCalculator() {
  const btnDecrease = document.getElementById('mode-decrease');
  const btnIncrease = document.getElementById('mode-increase');
  const startInput = document.getElementById('start');
  const countInput = document.getElementById('count');
  const calculateBtn = document.getElementById('btn-calculate');
  const langBtns = document.querySelectorAll('.lang-btn');

  let mode = 'decrease';

  if (btnDecrease && btnIncrease) {
    btnDecrease.addEventListener('click', () => {
      mode = 'decrease';
      btnDecrease.classList.add('active');
      btnIncrease.classList.remove('active');
    });

    btnIncrease.addEventListener('click', () => {
      mode = 'increase';
      btnIncrease.classList.add('active');
      btnDecrease.classList.remove('active');
    });
  }

  if (calculateBtn && startInput && countInput) {
    calculateBtn.addEventListener('click', () => {
      const S = parseInt(startInput.value, 10);
      const D = parseInt(countInput.value, 10);
      renderResult(S, D, mode);
    });
  }

  // Language switcher
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      setLanguage(lang);
      langBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Re-render if there's a result
      if (startInput && countInput) {
        const S = parseInt(startInput.value, 10);
        const D = parseInt(countInput.value, 10);
        if (!isNaN(S) && !isNaN(D)) {
          renderResult(S, D, mode);
        }
      }
    });
  });

  // Initialize with example calculation
  if (startInput && countInput) {
    renderResult(166, 52, 'decrease');
  }
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCalculator);
} else {
  initCalculator();
}

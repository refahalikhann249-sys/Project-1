const $ = id => document.getElementById(id);

/* ---------- Mobile menu ---------- */
$('menuBtn').addEventListener('click', () => $('menu').classList.toggle('open'));
$('menu').addEventListener('click', e => { if (e.target.tagName === 'A') $('menu').classList.remove('open'); });

/* ---------- Dark / Light mode ---------- */
function setTheme(dark) {
  document.body.classList.toggle('dark', dark);
  $('themeBtn').textContent = dark ? '☀️' : '🌙';
  try { localStorage.setItem('vl-theme', dark ? 'dark' : 'light'); } catch (e) {}
}
let saved = null;
try { saved = localStorage.getItem('vl-theme'); } catch (e) {}
setTheme(saved === 'dark');
$('themeBtn').addEventListener('click', () => setTheme(!document.body.classList.contains('dark')));

/* ---------- Animated counters ---------- */
function animateCounter(el) {
  const target = +el.dataset.target, steps = 60;
  let n = 0;
  const t = setInterval(() => {
    n++;
    el.textContent = Math.round(target * n / steps).toLocaleString();
    if (n >= steps) clearInterval(t);
  }, 25);
}
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) { animateCounter(en.target); counterObs.unobserve(en.target); } });
});
document.querySelectorAll('.counters b').forEach(b => counterObs.observe(b));

/* ---------- Random health tip ---------- */
const tips = [
  'Drink a glass of water as soon as you wake up.',
  'Take the stairs instead of the lift today.',
  'Half your plate should be vegetables and fruit.',
  'Stand up and stretch for 2 minutes every hour.',
  'Aim for 7 to 8 hours of sleep every night.',
  'Eat slowly. It takes about 20 minutes to feel full.',
  'Take a 10-minute walk after meals.',
  'Swap sugary drinks for buttermilk or coconut water.',
  'Take 5 deep breaths when you feel stressed.',
  'Get 15 minutes of morning sunlight for vitamin D.'
];
function newTip() { $('tipText').textContent = tips[Math.floor(Math.random() * tips.length)]; }
$('tipBtn').addEventListener('click', newTip);
newTip();

/* ---------- BMI calculator ---------- */
$('bmiBtn').addEventListener('click', () => {
  const w = parseFloat($('bmiW').value), h = parseFloat($('bmiH').value) / 100;
  const out = $('bmiOut');
  if (!(w > 0) || !(h > 0)) { out.textContent = 'Enter a valid weight and height.'; return; }
  const bmi = w / (h * h);
  const cat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy weight' : bmi < 30 ? 'Overweight' : 'Obese';
  out.textContent = `Your BMI is ${bmi.toFixed(1)} (${cat}).`;
});

/* ---------- Water intake calculator ---------- */
$('wBtn').addEventListener('click', () => {
  const w = parseFloat($('wW').value), extra = parseFloat($('wA').value);
  const out = $('wOut');
  if (!(w > 0)) { out.textContent = 'Enter a valid weight.'; return; }
  const litres = w * 0.035 + extra;
  out.textContent = `Drink about ${litres.toFixed(1)} litres a day (${Math.round(litres * 1000 / 250)} glasses).`;
});

/* ---------- Exercise stopwatch ---------- */
let swTime = 0, swTimer = null, swStartAt = 0;
const fmt = ms => {
  const s = Math.floor(ms / 1000);
  return [Math.floor(s / 3600), Math.floor(s % 3600 / 60), s % 60].map(v => String(v).padStart(2, '0')).join(':');
};
$('swStart').addEventListener('click', () => {
  if (swTimer) return;
  swStartAt = Date.now() - swTime;
  swTimer = setInterval(() => { swTime = Date.now() - swStartAt; $('clock').textContent = fmt(swTime); }, 200);
});
$('swStop').addEventListener('click', () => {
  if (!swTimer) return;
  clearInterval(swTimer); swTimer = null;
  $('swLog').textContent = `Paused at ${fmt(swTime)}`;
});
$('swReset').addEventListener('click', () => {
  clearInterval(swTimer); swTimer = null; swTime = 0;
  $('clock').textContent = '00:00:00'; $('swLog').textContent = '';
});

/* ---------- Habit tracker + progress ---------- */
const habitList = ['Drink 8 glasses of water', 'Exercise 30 minutes', 'Eat 5 fruits or vegetables', 'Sleep 7+ hours', 'No sugary drinks', 'Meditate or relax 10 minutes'];
const habitsEl = $('habits');
habitList.forEach((h, i) => {
  const li = document.createElement('li');
  li.innerHTML = `<label><input type="checkbox" data-i="${i}"> ${h}</label>`;
  habitsEl.appendChild(li);
});
function updateProgress() {
  const boxes = habitsEl.querySelectorAll('input');
  const done = [...boxes].filter(b => b.checked).length;
  $('bar').style.width = (done / boxes.length * 100) + '%';
  $('progressText').textContent = done === boxes.length
    ? '🎉 All habits done. Great job!'
    : `${done} of ${boxes.length} habits done`;
}
habitsEl.addEventListener('change', updateProgress);
$('habitReset').addEventListener('click', () => { habitsEl.querySelectorAll('input').forEach(b => b.checked = false); updateProgress(); });

/* ---------- Health quiz ---------- */
const quiz = [
  { q: 'How much water should most adults drink daily?', o: ['500 ml', '2 to 3 litres', '6 litres'], a: 1 },
  { q: 'Which nutrient helps build and repair muscles?', o: ['Protein', 'Sugar', 'Salt'], a: 0 },
  { q: 'How many hours of sleep do most adults need?', o: ['4 to 5', '7 to 9', '11 to 12'], a: 1 },
  { q: 'Which is a whole grain?', o: ['White bread', 'Ragi', 'Maida'], a: 1 },
  { q: 'How much moderate activity is recommended per day?', o: ['About 30 minutes', '5 minutes', '5 hours'], a: 0 }
];
let qi = 0, score = 0;
function showQ() {
  const cur = quiz[qi];
  $('qCount').textContent = `Question ${qi + 1} of ${quiz.length}`;
  $('qText').textContent = cur.q;
  $('qMsg').textContent = ''; $('qNext').hidden = true;
  $('qOpts').innerHTML = '';
  cur.o.forEach((text, i) => {
    const b = document.createElement('button');
    b.textContent = text;
    b.addEventListener('click', () => answer(i));
    $('qOpts').appendChild(b);
  });
}
function answer(i) {
  const cur = quiz[qi], btns = $('qOpts').children;
  [...btns].forEach((b, j) => {
    b.disabled = true;
    if (j === cur.a) b.classList.add('right');
    else if (j === i) b.classList.add('wrong');
  });
  if (i === cur.a) { score++; $('qMsg').textContent = 'Correct!'; }
  else $('qMsg').textContent = 'Not quite. The right answer is highlighted.';
  $('qNext').hidden = false;
  $('qNext').textContent = qi === quiz.length - 1 ? 'See score' : 'Next question';
}
$('qNext').addEventListener('click', () => {
  if (qi < quiz.length - 1) { qi++; showQ(); return; }
  $('qCount').textContent = 'Quiz complete';
  $('qText').textContent = `You scored ${score} out of ${quiz.length}`;
  $('qOpts').innerHTML = '';
  $('qMsg').textContent = score >= 4 ? 'Excellent health knowledge!' : score >= 2 ? 'Good effort. Keep learning.' : 'Read the sections above and try again.';
  $('qNext').textContent = 'Restart quiz';
  $('qNext').onclick = () => { qi = 0; score = 0; $('qNext').onclick = null; showQ(); };
});
showQ();

/* ---------- Gallery + lightbox ---------- */
const photos = [
  ['photo-1490645935967-10de6ba17061', 'Healthy meal'],
  ['photo-1518611012118-696072aa579a', 'Group fitness'],
  ['photo-1506126613408-eca07ce68773', 'Yoga'],
  ['photo-1540420773420-3366772f4999', 'Fresh vegetables'],
  ['photo-1571019613454-1cb2f99b2d8b', 'Workout'],
  ['photo-1544367567-0f2fcb009e0b', 'Morning stretch']
];
const grid = $('gallery-grid');
photos.forEach(([id, cap]) => {
  const fig = document.createElement('figure');
  const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=70`;
  fig.innerHTML = `<img src="${url}" alt="${cap}" loading="lazy"><figcaption>${cap}</figcaption>`;
  fig.addEventListener('click', () => { $('lightbox').querySelector('img').src = url; $('lightbox').querySelector('img').alt = cap; $('lightbox').classList.add('open'); });
  grid.appendChild(fig);
});
$('lightbox').addEventListener('click', () => $('lightbox').classList.remove('open'));
document.addEventListener('keydown', e => { if (e.key === 'Escape') $('lightbox').classList.remove('open'); });

/* ---------- Contact form validation ---------- */
$('form').addEventListener('submit', e => {
  e.preventDefault();
  const n = $('cName').value.trim(), m = $('cMail').value.trim(), t = $('cMsg').value.trim();
  const msg = $('formMsg');
  if (!n || !t) { msg.textContent = 'Please enter your name and message.'; return; }
  if (!/^\S+@\S+\.\S+$/.test(m)) { msg.textContent = 'Please enter a valid email address.'; return; }
  msg.textContent = `Thanks, ${n}. Your message has been sent.`;
  e.target.reset();
});
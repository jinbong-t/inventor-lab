

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const use = n => (window.claude && window.claude.use) ? window.claude.use(n).catch(() => null) : Promise.resolve(null);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(t){ const e = $('#toast'); e.textContent = t; e.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove('on'), 2200); }

/* ================= shared data ================= */
const COLORS = ['#FF6B5B','#FF9F43','#F5C542','#3DD68C','#2ED3C0','#5AA9FF','#B57BFF','#EEF4FB'];
const CRIT = [
  {k:'A', name:'문제 확인', m:'MISSION 1', pts:[10,9,8,6,4], c:'#FF6B5B', top:'누가·언제·어디서·무엇이·왜로 구체적 정의 + 해결 필요성 근거', lv:['불편 상황을 5요소로 명확히 정의하고 해결 필요성을 근거와 함께 제시','문제를 비교적 명확히 정의했으나 근거가 다소 부족','문제를 확인했으나 요소 일부가 빠져 다소 막연함','문제를 부분적으로만 확인함','문제를 확인하지 못함']},
  {k:'B', name:'아이디어 탐색', m:'MISSION 2', pts:[15,13,11,10,6], c:'#FF9F43', top:'브레인스토밍·스캠퍼로 서로 다른 아이디어 3개 이상 + 구체적 설명', lv:['확산적 사고 기법으로 서로 다른 아이디어 3개 이상을 다양하고 구체적으로 제시','아이디어 3개 이상을 제시했으나 설명이 간단함','아이디어 2개 정도를 제시하거나 비슷한 아이디어를 반복함','아이디어 1개만 제시하는 등 탐색이 제한적임','해결 방안을 제시하지 못함']},
  {k:'C', name:'아이디어 선정', m:'MISSION 3', pts:[10,9,8,6,4], c:'#F5C542', top:'PMI(평가 행렬)로 2개 이상 비교, 합리적 근거로 최적안 선정', lv:['PMI로 비교하여 가장 적절한 대안을 합리적 근거로 선정','비교·선정했으나 근거가 다소 부족함','PMI 일부가 비는 등 제한된 비교로 선정함','비교 없이 선정하는 등 선정이 미흡함','대안을 선정하지 못함']},
  {k:'D', name:'프리핸드 스케치', m:'MISSION 4', pts:[10,9,8,6,4], c:'#3DD68C', top:'입체 표현 + 부품 이름·기능·대략적 치수 메모', lv:['입체적으로 표현하고 부품 이름·기능·치수를 모두 메모함','입체적이나 설명·치수가 일부 빠짐','형태는 알 수 있으나 표현이 다소 미흡함','평면적·부정확하여 형태와 기능 파악이 어려움','스케치를 하지 않음']},
  {k:'E', name:'등각 투상도', m:'MISSION 5', pts:[20,17,15,13,8], c:'#5AA9FF', top:'120° 세 축, 높이·너비·안쪽 길이 정확, 선 정리, 치수 3개+·축척', lv:['세 축 120°에 맞춰 정확히 그리고 선 정리, 치수 3개 이상과 축척을 표기함','비교적 정확하나 치수·축척·선 정리 중 1가지가 미흡함','일부 축·길이 오류 등 다소 미흡하나 형태 파악은 가능함','축 방향·길이 오류로 형태가 부정확하고 치수가 대부분 빠짐','도면을 작성하지 않음']},
  {k:'F', name:'발명품 모형', m:'MISSION 6', pts:[25,21,19,16,10], c:'#FF8A3D', top:'도면과 일치, 핵심 기능 구현, 완성도, 안전한 도구 사용', lv:['도면과 일치하게 완성도 높게 제작하고 핵심 기능이 효과적으로 드러남','대체로 도면과 일치하게 제작했으나 마감이 다소 미흡함','모형을 제작했으나 기능이 일부만 드러남','모형이 미완성이거나 기능이 드러나지 않음','모형을 제작하지 않음']},
  {k:'G', name:'평가·지식재산', m:'MISSION 7', pts:[10,9,8,6,4], c:'#B57BFF', top:'자기·동료평가로 기능 평가, 구체적 개선안, 알맞은 지식재산권과 이유', lv:['기능을 효과적으로 평가하고 구체적 개선안과 알맞은 지식재산권·이유를 제시함','평가·개선안을 작성했으나 구체성이 다소 부족함','일부 기능만 평가하거나 개선안이 막연함','평가가 제대로 이루어지지 않음','평가 활동을 하지 않음']},
];
const LV = ['A','B','C','D','E'];
const scoreOf = (k, lv) => { const c = CRIT.find(x => x.k === k); const i = LV.indexOf(lv); return (c && i >= 0) ? c.pts[i] : 0; };
const totalOf = levels => CRIT.reduce((a, c) => a + scoreOf(c.k, levels?.[c.k]), 0);
let MISSIONS = [
  ['0','발명가 등록','ID 카드'],['1','불편함 수배','문제 확인'],['2','아이디어 팝콘','확산적 사고'],['3','아이디어 오디션','수렴적 사고'],
  ['4','설계 스튜디오','스케치'],['5','도면 연구실','등각 투상도'],['6','제작 로드맵','모형 제작'],['7','발명 박람회','평가·특허'],
];

/* ================= 3D model ================= */
const BOXES = [[0,160,0,20,0,300],[60,100,20,70,230,250],[0,160,20,120,0,60]];
const C0 = [80,60,140];
const ISO = {yaw: Math.PI/4, pitch: Math.atan(1/Math.SQRT2)};
function facesOf(b){ const [x0,x1,y0,y1,z0,z1] = b; return [
  {n:[0,0,1], v:[[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]]},{n:[0,0,-1],v:[[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],[x1,y0,z0]]},
  {n:[1,0,0], v:[[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1]]},{n:[-1,0,0],v:[[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0]]},
  {n:[0,1,0], v:[[x0,y1,z0],[x0,y1,z1],[x1,y1,z1],[x1,y1,z0]]},{n:[0,-1,0],v:[[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]]}]; }
const FACES = BOXES.flatMap(facesOf);
const EDGES = BOXES.flatMap(b => { const [x0,x1,y0,y1,z0,z1] = b, c = []; for (const x of [x0,x1]) for (const y of [y0,y1]) for (const z of [z0,z1]) c.push([x,y,z]);
  const e = []; for (let i = 0; i < 8; i++) for (let j = i+1; j < 8; j++) if (c[i].filter((v,k) => v !== c[j][k]).length === 1) e.push([c[i],c[j]]); return e; });
const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
function makeModel(host){
  host.innerHTML = `<canvas aria-label="예시 발명품 DRIP STOP 3D 도면. 드래그하면 회전"></canvas><div class="bh"><span class="mono ph">DRAFTING…</span><span class="mono">SAMPLE · DRIP STOP · 1:4</span></div><div class="bf"><span class="badge">ISOMETRIC · 120° ✓</span><button class="btn sm" type="button">등각 시점 맞추기</button></div>`;
  const cv = host.querySelector('canvas'), cx = cv.getContext('2d'), ph = host.querySelector('.ph'), badge = host.querySelector('.badge');
  let yaw = .35, pitch = .42, auto = true, drag = null, target = null, t0 = performance.now(), raf = 0, alive = true;
  const fit = () => { const r = cv.getBoundingClientRect(), d = devicePixelRatio || 1; cv.width = Math.max(1, r.width*d); cv.height = Math.max(1, r.height*d); cx.setTransform(d,0,0,d,0,0); };
  const ro = new ResizeObserver(fit); ro.observe(cv); fit();
  const proj = (p, W, H, s) => { const x = p[0]-C0[0], y = p[1]-C0[1], z = p[2]-C0[2];
    const x1 = x*Math.cos(yaw) - y*Math.sin(yaw), y1 = x*Math.sin(yaw) + y*Math.cos(yaw);
    return [W/2 + x1*s, H*.47 + (y1*Math.sin(pitch) - z*Math.cos(pitch))*s, y1*Math.cos(pitch) + z*Math.sin(pitch)]; };
  function frame(now){
    if (!alive) return;
    const r = cv.getBoundingClientRect(), W = r.width, H = r.height;
    if (!W) { raf = requestAnimationFrame(frame); return; }
    const el = reduce ? 99 : (now - t0)/1000;
    if (target){ const k = Math.min(1,(now-target.t)/900), e = ease(k); yaw = target.y0+(target.y1-target.y0)*e; pitch = target.p0+(target.p1-target.p0)*e; if (k >= 1) target = null; }
    else if (auto && !drag && !reduce) yaw += .0035;
    const d = ((yaw-ISO.yaw)%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI;
    badge.classList.toggle('on', Math.abs(d) < .02 && Math.abs(pitch-ISO.pitch) < .02);
    cx.clearRect(0,0,W,H);
    cx.strokeStyle = 'rgba(143,211,255,.07)'; cx.lineWidth = 1; cx.beginPath();
    const a = 22, dx = a*Math.cos(Math.PI/6), t = Math.tan(Math.PI/6);
    for (let x = 0; x <= W; x += dx){ cx.moveTo(x,0); cx.lineTo(x,H); }
    for (let c = -W; c <= H+W; c += a){ cx.moveTo(0,c); cx.lineTo(W,c+W*t); cx.moveTo(0,c); cx.lineTo(W,c-W*t); }
    cx.stroke();
    const s = Math.min(W,H)/500, wire = Math.min(1,el/2.6), fill = Math.max(0,Math.min(1,(el-2.4)/1.4)), dims = Math.max(0,Math.min(1,(el-3.8)/.8));
    ph.textContent = wire < 1 ? 'STEP 1 · 선 긋기' : fill < 1 ? 'STEP 2 · 면 만들기' : 'COMPLETE · 드래그로 회전';
    if (fill > 0){
      const fs = FACES.map(f => { const n1x = f.n[0]*Math.cos(yaw)-f.n[1]*Math.sin(yaw), n1y = f.n[0]*Math.sin(yaw)+f.n[1]*Math.cos(yaw);
        const pts = f.v.map(p => proj(p,W,H,s)); return {pts, facing: n1y*Math.cos(pitch)+f.n[2]*Math.sin(pitch), d: pts.reduce((q,p)=>q+p[2],0)/4, lum: Math.max(0,-.35*n1x+.5*n1y+.75*f.n[2])}; })
        .filter(f => f.facing > .001).sort((p,q) => p.d-q.d);
      for (const f of fs){ cx.beginPath(); f.pts.forEach((p,i) => i ? cx.lineTo(p[0],p[1]) : cx.moveTo(p[0],p[1])); cx.closePath();
        const l = .35+f.lum*.55; cx.fillStyle = `rgba(${30+120*l|0},${80+120*l|0},${140+105*l|0},${.92*fill})`; cx.fill(); cx.strokeStyle = `rgba(220,240,255,${.9*fill})`; cx.lineWidth = 1.6; cx.stroke(); }
      if (Math.sin(pitch) > 0){ const op = [[12,32,60],[148,32,60],[148,108,60],[12,108,60]].map(p => proj(p,W,H,s)); cx.beginPath(); op.forEach((p,i) => i ? cx.lineTo(p[0],p[1]) : cx.moveTo(p[0],p[1])); cx.closePath(); cx.fillStyle = `rgba(255,209,102,${.55*fill})`; cx.fill(); }
    }
    cx.lineWidth = 1.6; cx.strokeStyle = `rgba(143,211,255,${1-fill*.75})`; cx.setLineDash(fill > 0 ? [4,4] : []);
    EDGES.forEach((e,i) => { const k = Math.max(0,Math.min(1,wire*EDGES.length-i*.55)); if (k <= 0) return; const p = proj(e[0],W,H,s), q = proj(e[1],W,H,s); cx.beginPath(); cx.moveTo(p[0],p[1]); cx.lineTo(p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k); cx.stroke(); });
    cx.setLineDash([]);
    if (dims > 0){ cx.globalAlpha = dims; cx.lineWidth = 1.4; cx.font = '600 13px "IBM Plex Mono",monospace';
      const dim = (p,q,o,txt) => { const A = proj(p.map((v,i)=>v+o[i]),W,H,s), B = proj(q.map((v,i)=>v+o[i]),W,H,s);
        cx.strokeStyle = cx.fillStyle = '#FF8A3D'; cx.beginPath(); cx.moveTo(A[0],A[1]); cx.lineTo(B[0],B[1]); cx.stroke();
        const mx = (A[0]+B[0])/2, my = (A[1]+B[1])/2, w = cx.measureText(txt).width+10; cx.fillStyle = '#0B2447'; cx.fillRect(mx-w/2,my-10,w,20); cx.fillStyle = '#FF8A3D'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(txt,mx,my); };
      dim([0,120,0],[160,120,0],[0,36,0],'160'); dim([160,20,0],[160,120,0],[36,0,0],'100'); dim([0,0,0],[0,0,300],[-36,0,0],'300'); cx.globalAlpha = 1; }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  cv.addEventListener('pointerdown', e => { drag = {x:e.clientX,y:e.clientY,yaw,pitch}; target = null; auto = false; t0 = Math.min(t0, performance.now()-5000); cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => { if (!drag) return; yaw = drag.yaw-(e.clientX-drag.x)*.01; pitch = Math.max(-.2,Math.min(1.35,drag.pitch+(e.clientY-drag.y)*.008)); });
  cv.addEventListener('pointerup', () => { drag = null; });
  host.querySelector('.bf button').addEventListener('click', () => { auto = false; t0 = Math.min(t0, performance.now()-5000);
    let y1 = ISO.yaw; while (y1-yaw > Math.PI) y1 -= Math.PI*2; while (yaw-y1 > Math.PI) y1 += Math.PI*2; target = {t:performance.now(), y0:yaw, y1, p0:pitch, p1:ISO.pitch}; });
  return () => { alive = false; cancelAnimationFrame(raf); ro.disconnect(); };
}

/* ================= components ================= */
const SC = [
  ['S','대체하기','지금 있는 것을 무엇으로 바꿀 수 있을까?','우산꽂이 통 → 책상에 거는 얇은 판으로'],
  ['C','결합하기','무엇과 합칠 수 있을까?','우산 걸이 + 물받이를 하나로'],
  ['A','적용하기','이미 알려진 원리를 빌려 올 수 없을까?','건물의 빗물받이 원리를 적용'],
  ['M','수정·확대·축소','크기·모양·기능을 바꾸면?','물받이를 얇게 줄여 책상 옆에 쏙'],
  ['P','다른 용도','다르게, 다른 곳에서 쓸 수 없을까?','맑은 날엔 실내화 주머니 걸이로'],
  ['E','제거하기','일부를 빼거나 단순하게 하면?','바닥 통을 없애고 벽걸이형으로'],
  ['R','거꾸로·재배열','순서·방향·위치를 바꾸면?','우산을 거꾸로 걸어 물이 한곳에 모이게'],
];
const PROB = [['젖은 우산이 쓰러져 바닥이 물바다','우산'],['책상 위 필기구가 자꾸 굴러떨어진다','필기구'],['충전 케이블이 엉키고 침대 뒤로 떨어진다','충전 케이블'],['실내화 주머니 들고 다니기 귀찮다','실내화 주머니'],['사물함 속 교과서가 안 찾아진다','사물함'],['물병이 책상에서 자꾸 넘어진다','물병'],['이어폰을 자꾸 잃어버린다','이어폰'],['가방 끈이 어깨에서 흘러내린다','가방 끈'],['화분에 물 주는 걸 깜빡한다','화분'],['책을 펼쳐 두면 자꾸 덮인다','책'],['리모컨이 어디 있는지 모르겠다','리모컨'],['체육복이 가방 속에서 구겨진다','체육복']];
const QF = {S:o=>`${o}의 재료나 모양을 다른 것으로 바꾸면 어떨까?`,C:o=>`${o}에 다른 물건의 기능을 합치면 어떨까?`,A:o=>`자연이나 다른 물건의 원리를 ${o}에 빌려 오면?`,M:o=>`${o}를 아주 작게, 혹은 아주 크게 만들면?`,P:o=>`${o} 문제를 해결하는 물건을 다른 용도로도 쓸 수 있게 하면?`,E:o=>`${o}에서 꼭 필요 없는 부분을 없애면?`,R:o=>`${o}의 위치나 방향을 거꾸로 바꾸면?`};

const COMP = {
  model(host){ host.classList.add('board'); return makeModel(host); },
  missions(host){ host.classList.add('mmap'); host.innerHTML = MISSIONS.map((m,i) => `<div style="--c:${COLORS[i]}"><b>${m[0]}</b><strong>${m[1]}</strong><span>${m[2]}</span></div>`).join(''); },
  rubric(host){ host.classList.add('rub'); host.innerHTML = CRIT.map(c => `<div class="r"><div class="nm">${c.name}<small>${c.m}</small></div><div class="bar"><i style="--w:${c.pts[0]*4}%;--c:${c.c}"></i><span>${c.top}</span></div><div class="pt">${c.pts[0]}</div></div>`).join(''); },
  gacha(host){
    host.classList.add('gacha');
    host.innerHTML = `<div class="reels"><div class="reel"><span class="mono">불편함</span><div class="v">젖은 우산이 쓰러져 바닥이 물바다</div></div><div class="reel"><span class="mono">스캠퍼</span><div class="v" style="color:var(--cyan)">C · 결합하기</div></div></div><div class="q">우산 걸이와 물받이를 하나로 합치면 어떨까?</div><button class="btn" type="button">아이디어 뽑기</button>`;
    const [rA, rB] = $$('.reel', host), [vA, vB] = $$('.v', host), q = $('.q', host), b = $('.btn', host); let tm;
    b.addEventListener('click', () => { b.disabled = true; rA.classList.add('spin'); rB.classList.add('spin'); q.style.opacity = .3; let n = 0; const total = reduce ? 1 : 16;
      const tick = () => { const p = PROB[Math.random()*PROB.length|0], s = SC[Math.random()*7|0]; vA.textContent = p[0]; vB.textContent = `${s[0]} · ${s[1]}`;
        if (++n < total) tm = setTimeout(tick, 40+n*9); else { rA.classList.remove('spin'); rB.classList.remove('spin'); q.style.opacity = 1; q.textContent = QF[s[0]](p[1]); b.disabled = false; } }; tick(); });
    return () => clearTimeout(tm);
  },
  scamper(host){
    host.classList.add('scw');
    host.innerHTML = `<div class="wheel"><div class="hub">SCAMPER<br>7가지 질문</div></div><div class="info"></div>`;
    const wh = $('.wheel', host), info = $('.info', host);
    const show = i => { $$('button', wh).forEach((b,k) => b.setAttribute('aria-pressed', k === i)); info.style.setProperty('--c', COLORS[i]);
      info.innerHTML = `<span class="mono">${SC[i][0]} · SCAMPER</span><h3>${SC[i][1]}</h3><p class="qq">${SC[i][2]}</p><div class="ex"><span class="mono" style="color:${COLORS[i]}">예시 · 우산꽂이에 적용하면</span><br>${SC[i][3]}</div>`; };
    SC.forEach((s,i) => { const a = -Math.PI/2 + i*2*Math.PI/7, b = document.createElement('button'); b.type = 'button'; b.textContent = s[0]; b.setAttribute('aria-label', s[1]); b.style.setProperty('--c', COLORS[i]);
      b.style.left = (50+38*Math.cos(a))+'%'; b.style.top = (50+38*Math.sin(a))+'%'; b.addEventListener('click', () => show(i)); b.addEventListener('mouseenter', () => show(i)); wh.appendChild(b); });
    show(1);
  },
  iso(host){
    host.classList.add('isoc');
    host.innerHTML = `<div class="pic"><svg viewBox="0 0 400 300" role="img" aria-label="등각 투상도 단계 그림"></svg></div><div class="st">
      <button type="button" data-s="1" aria-pressed="true"><b>1</b><span><strong>세 축 세우기</strong><br>기준선에서 양쪽 30°, 세 축이 120°</span></button>
      <button type="button" data-s="2" aria-pressed="false"><b>2</b><span><strong>치수 옮기기</strong><br>높이·너비·안쪽 길이를 모눈 칸 수로</span></button>
      <button type="button" data-s="3" aria-pressed="false"><b>3</b><span><strong>다듬고 치수 넣기</strong><br>필요 없는 선 지우고 치수·축척</span></button></div>`;
    const svg = $('svg', host), ox = 200, oy = 214, a = 18, c30 = Math.cos(Math.PI/6), P = (x,y,z) => [ox+(x-y)*c30*a, oy+(x+y)*.5*a-z*a];
    const L = (p,q) => { const A = P(...p), B = P(...q); return `<line x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}"/>`; };
    const grid = () => { let g = ''; const t = Math.tan(Math.PI/6); for (let x = ox%(a*c30); x <= 400; x += a*c30) g += `<line x1="${x}" y1="0" x2="${x}" y2="300"/>`; for (let c = -400+oy%a; c <= 700; c += a) g += `<line x1="0" y1="${c}" x2="400" y2="${c+400*t}"/><line x1="0" y1="${c}" x2="400" y2="${c-400*t}"/>`; return `<g stroke="#BFDDF2" stroke-width=".7">${g}</g>`; };
    const BX = 5, BY = 3;
    const draw = s => { let g = grid();
      g += `<g stroke="#1B3A63" stroke-width="1.6">${L([0,0,0],[7,0,0])}${L([0,0,0],[0,6,0])}${L([0,0,0],[0,0,6])}</g>`;
      if (s === 1){ const A = P(0,0,0); g += `<path d="M ${A[0]+30*c30} ${A[1]+15} A 34 34 0 0 1 ${A[0]-30*c30} ${A[1]+15}" fill="none" stroke="#FF8A3D" stroke-width="1.5"/><text x="${A[0]}" y="${A[1]+48}" fill="#FF8A3D" font-size="13" text-anchor="middle" font-family="IBM Plex Mono">120°</text>`; }
      g += `<text x="${P(7,0,0)[0]+6}" y="${P(7,0,0)[1]+4}" font-size="12" fill="#1B3A63">너비</text><text x="${P(0,6,0)[0]-30}" y="${P(0,6,0)[1]+4}" font-size="12" fill="#1B3A63">안쪽</text><text x="${P(0,0,6)[0]+6}" y="${P(0,0,6)[1]}" font-size="12" fill="#1B3A63">높이</text>`;
      if (s >= 2){
        const E = [[[BX,0,0],[BX,BY,0]],[[BX,BY,0],[0,BY,0]],[[BX,0,0],[BX,0,2]],[[BX,BY,0],[BX,BY,2]],[[0,BY,0],[0,BY,4]],[[BX,0,2],[BX,BY,2]],[[BX,BY,2],[2,BY,2]],[[BX,0,2],[2,0,2]],[[2,0,2],[2,0,4]],[[2,BY,2],[2,BY,4]],[[2,0,4],[2,BY,4]],[[2,BY,4],[0,BY,4]],[[0,0,4],[2,0,4]],[[0,0,4],[0,BY,4]],[[2,0,2],[2,BY,2]]];
        if (s === 2) [[0,0,0],[BX,0,0],[BX,BY,0],[0,BY,0],[BX,0,2],[BX,BY,2],[0,0,4],[2,0,4],[2,BY,4],[0,BY,4],[2,0,2],[2,BY,2]].forEach(p => { const q = P(...p); g += `<circle cx="${q[0]}" cy="${q[1]}" r="3" fill="#FF8A3D"/>`; });
        if (s === 3){ const f = (pp,c) => `<polygon points="${pp.map(p => P(...p).join(',')).join(' ')}" fill="${c}"/>`;
          g += f([[0,0,4],[2,0,4],[2,BY,4],[0,BY,4]],'#FFE3CF')+f([[2,0,2],[BX,0,2],[BX,BY,2],[2,BY,2]],'#FFE3CF')+f([[BX,0,0],[BX,BY,0],[BX,BY,2],[BX,0,2]],'#F7B48A')+f([[2,0,2],[2,BY,2],[2,BY,4],[2,0,4]],'#F7B48A')+f([[0,BY,0],[BX,BY,0],[BX,BY,2],[2,BY,2],[2,BY,4],[0,BY,4]],'#FF9A5C'); }
        g += `<g stroke="#0B2447" stroke-width="${s === 3 ? 2.6 : 1.8}" stroke-linejoin="round">${E.map(e => L(e[0],e[1])).join('')}</g>`;
        if (s === 3){ const t = (p,txt,dx,dy) => { const q = P(...p); return `<text x="${q[0]+dx}" y="${q[1]+dy}" fill="#D9480F" font-weight="600" font-size="13" text-anchor="middle" font-family="IBM Plex Mono">${txt}</text>`; };
          g += t([2.5,BY,0],'50',-4,22)+t([BX,1.5,0],'30',22,16)+t([0,BY,2],'40',-26,0)+`<text x="14" y="24" font-size="12" fill="#0B2447" font-family="IBM Plex Mono">SCALE 1:1 · 1칸 = 10mm · mm</text>`; }
      }
      svg.innerHTML = g; };
    const bs = $$('.st button', host); bs.forEach(b => b.addEventListener('click', () => { stop(); bs.forEach(x => x.setAttribute('aria-pressed', x === b)); draw(+b.dataset.s); }));
    draw(1); let cur = 1, iv = reduce ? 0 : setInterval(() => { cur = cur % 3 + 1; bs.forEach(x => x.setAttribute('aria-pressed', +x.dataset.s === cur)); draw(cur); }, 2600);
    function stop(){ clearInterval(iv); iv = 0; }
    return stop;
  },
  timer(host, arg){
    const total = (+arg || 10)*60; let left = total, iv = 0;
    host.classList.add('timer');
    host.innerHTML = `<span class="mono" style="font-size:22px">활동 시간</span><div class="t">${fmt(left)}</div><div class="bar"><i></i></div><div class="row"><button class="btn" type="button">시작</button><button class="btn ghost" type="button">+1분</button><button class="btn ghost" type="button">다시</button></div>`;
    const t = $('.t', host), bar = $('.bar i', host), [bs, bp, br] = $$('button', host);
    const paint = () => { t.textContent = fmt(left); bar.style.width = (left/total*100)+'%'; t.classList.toggle('end', left <= 0); };
    bs.addEventListener('click', () => { if (iv){ clearInterval(iv); iv = 0; bs.textContent = '계속'; } else { iv = setInterval(() => { left = Math.max(0,left-1); paint(); if (!left){ clearInterval(iv); iv = 0; bs.textContent = '시작'; } }, 1000); bs.textContent = '일시정지'; } });
    bp.addEventListener('click', () => { left += 60; paint(); });
    br.addEventListener('click', () => { left = total; paint(); });
    paint(); return () => clearInterval(iv);
    function fmt(s){ return String(s/60|0).padStart(2,'0')+':'+String(s%60).padStart(2,'0'); }
  },
  proj(host, arg){
    const full = arg === 'full';
    const MODES = {
      iso:{name:'등각 투상법', short:'등각', c:'#2E75B6',
        def:'각이 서로 120°를 이루는 3개의 축을 기본으로 하여, 이들 기본 축에 물체의 높이, 너비, 안쪽 길이를 옮겨서 나타내는 투상법이다.',
        feat:'하나의 도면으로 물체의 세 면을 볼 수 있다는 장점이 있다.',
        steps:['물체를 기준선과 양쪽 사이각(30°)에 맞추어 나타낸다.','각 기준선 위에 물체의 높이, 너비, 안쪽 길이를 나타낸다.','불필요한 선을 제거하여 등각 투상도를 완성한다.'], tag:'우리 수행평가 도면'},
      obl:{name:'사투상법', short:'사투상', c:'#E07B1F',
        def:'기준선 위에 물체의 정면을 실제 모양으로 나타낸 다음 각 꼭짓점에서 45°를 이루는 경사선을 긋고, 선 위에 물체의 안쪽 길이를 실제의 ½로 줄여서 나타내는 방법이다.',
        feat:'물체의 세 면 중 한 면을 정확하게 표현할 수 있는 특징이 있다.',
        steps:['기준선 위에 수평선을 긋고 물체의 정면을 실제와 같게 나타낸다.','각 꼭짓점에서 45° 각도로 선을 그어 물체의 안쪽 길이를 나타낸다.','불필요한 선을 제거하여 사투상도를 완성한다.']},
      per:{name:'투시 투상법', short:'투시', c:'#2E9E5B',
        def:'소점을 이용하여 원근감이 나타나도록 그리는 투상법이다. 건축물 조감도나 실내 공간 설계 등에 주로 이용된다.',
        feat:'소점: 실제로는 평행한 직선을 멀리 연장했을 때 하나로 만나는 점(소실점). 소점의 개수에 따라 1점·2점·3점 투시로 나뉜다. (154쪽)',
        steps:['물체의 정면을 실제 모양으로 나타낸다.','소점을 표시하고, 소점에서 각 꼭짓점을 연결한다.','소점과 각 꼭짓점을 연결한 선 사이에 선을 그어 물체를 나타낸다.']},
    };
    const PER = {1:{th:0, ph:0, eye:[3.4,-12,3.2]}, 2:{th:.55, ph:0, eye:[0.6,-10,3.4]}, 3:{th:.55, ph:.5, eye:[0.6,-8.5,8.5]}};
    host.classList.add('projc');
    host.innerHTML = `<div class="pv"><canvas aria-label="같은 물체를 세 가지 투상법으로 나타낸 그림"></canvas><span class="mono pv-l"></span></div>
      <div class="side"><span class="mono">교과서 155쪽 · 도면에 물체를 나타내는 방법</span>
      <div class="modes">${Object.entries(MODES).map(([k,m]) => `<button type="button" data-m="${k}" style="--c:${m.c}">${m.name}</button>`).join('')}</div>
      <div class="sub" hidden>${[1,2,3].map(n => `<button type="button" data-n="${n}">${n}점 투시</button>`).join('')}</div>
      <div class="def"></div><div class="stp"></div>
      <div class="row"><button class="btn sm play" type="button">▶ 1→2→3단계 재생</button></div></div>
      ${full ? `<div class="cmp"><table class="tbl"><thead><tr><th></th><th>등각 투상법</th><th>사투상법</th><th>투시 투상법</th></tr></thead><tbody>
        <tr><td>기준</td><td>120°를 이루는 3개의 축</td><td>정면 + 45° 경사선</td><td>소점(1점·2점·3점)</td></tr>
        <tr><td>안쪽 길이</td><td>실제 길이 그대로</td><td>실제의 ½로 줄여서</td><td>멀어질수록 짧아짐</td></tr>
        <tr><td>장점·특징</td><td>세 면을 한 번에 볼 수 있음</td><td>정면 한 면을 정확하게</td><td>원근감, 눈으로 본 것처럼</td></tr>
        <tr><td>주로 쓰는 곳</td><td>제품 구성도·설명도</td><td>정면 모양이 복잡한 물체</td><td>건축물 조감도·실내 공간 설계</td></tr></tbody></table></div>` : ''}`;
    const cv = $('canvas', host), cx = cv.getContext('2d'), lab = $('.pv-l', host);
    const PROF = [[0,0],[5,0],[5,2],[2,2],[2,4],[0,4]], DEP = 3, N = PROF.length;
    const F = PROF.map(([x,z]) => [x,0,z]), B = PROF.map(([x,z]) => [x,DEP,z]);
    const FACES = [{v:F, n:[0,-1,0], front:1}, {v:[...B].reverse(), n:[0,1,0]}];
    for (let i = 0; i < N; i++){ const a = PROF[i], b = PROF[(i+1)%N], dx = b[0]-a[0], dz = b[1]-a[1], L = Math.hypot(dx,dz);
      FACES.push({v:[[a[0],0,a[1]],[b[0],0,b[1]],[b[0],DEP,b[1]],[a[0],DEP,a[1]]], n:[dz/L,0,-dx/L]}); }
    const EDGES = []; for (let i = 0; i < N; i++){ EDGES.push({a:F[i], b:F[(i+1)%N], t:'f'}); EDGES.push({a:B[i], b:B[(i+1)%N], t:'b'}); EDGES.push({a:F[i], b:B[i], t:'r'}); }
    const C0 = [2.5,1.5,2], s2 = Math.SQRT2, s6 = Math.sqrt(6), K = .5*Math.SQRT1_2;
    let mode = 'iso', from = 'iso', sub = 1, subFrom = 1, mt = 1, mStart = 0, step = 3, sStart = 0, play = 0, alive = true, raf = 0;
    function raw(m, p, n){
      if (m === 'iso') return {x:(p[0]+p[1])/s2, y:(-p[0]+p[1]+2*p[2])/s6, d:(p[0]-p[1]+p[2])};
      if (m === 'obl') return {x:p[0]+p[1]*K, y:p[2]+p[1]*K, d:(K*p[0]-p[1]+K*p[2])};
      const P = PER[n], ct = Math.cos(P.th), st = Math.sin(P.th), v0 = [p[0]-C0[0], p[1]-C0[1], p[2]-C0[2]];
      const r = [v0[0]*ct - v0[1]*st, v0[0]*st + v0[1]*ct, v0[2]], v = [r[0]-P.eye[0], r[1]-P.eye[1], r[2]-P.eye[2]];
      const cp = Math.cos(P.ph), sp = Math.sin(P.ph), Z = v[1]*cp - v[2]*sp, Y = v[1]*sp + v[2]*cp;
      return {x:v[0]/Z, y:Y/Z, d:-Z};
    }
    function vps(n){ const P = PER[n], ct = Math.cos(P.th), st = Math.sin(P.th), cp = Math.cos(P.ph), sp = Math.sin(P.ph), out = [];
      [[1,0,0],[0,1,0],[0,0,1]].forEach(a => { let r = [a[0]*ct - a[1]*st, a[0]*st + a[1]*ct, a[2]]; let Z = r[1]*cp - r[2]*sp; if (Math.abs(Z) < .08) return; if (Z < 0){ r = r.map(q => -q); Z = -Z; } out.push({x:r[0]/Z, y:(r[1]*sp + r[2]*cp)/Z}); }); return out; }
    function visible(m, f, n){
      const ctr = f.v.reduce((a,p) => a.map((q,i) => q + p[i]/f.v.length), [0,0,0]);
      if (m === 'iso') return f.n[0] - f.n[1] + f.n[2] > .01;
      if (m === 'obl') return K*f.n[0] - f.n[1] + K*f.n[2] > .01;
      const P = PER[n], ct = Math.cos(P.th), st = Math.sin(P.th), v0 = ctr.map((q,i) => q - C0[i]);
      const r = [v0[0]*ct - v0[1]*st, v0[0]*st + v0[1]*ct, v0[2]], nr = [f.n[0]*ct - f.n[1]*st, f.n[0]*st + f.n[1]*ct, f.n[2]];
      return nr[0]*(P.eye[0]-r[0]) + nr[1]*(P.eye[1]-r[1]) + nr[2]*(P.eye[2]-r[2]) > 0;
    }
    function fitter(m, n, W, H){
      const pts = [...F, ...B].map(p => raw(m, p, n)); if (m === 'per' && n === 1) pts.push(...vps(1));
      const xs = pts.map(p => p.x), ys = pts.map(p => p.y), mnx = Math.min(...xs), mxx = Math.max(...xs), mny = Math.min(...ys), mxy = Math.max(...ys);
      const s = Math.min(W*.74/(mxx-mnx), H*.66/(mxy-mny)), ox = (mnx+mxx)/2, oy = (mny+mxy)/2;
      return p => { const q = raw(m, p, n); return [W/2 + (q.x-ox)*s, H*.5 - (q.y-oy)*s, q.d]; };
    }
    const fitPt = (m, n, W, H) => { const pts = [...F, ...B].map(p => raw(m, p, n)); if (m === 'per' && n === 1) pts.push(...vps(1));
      const xs = pts.map(p => p.x), ys = pts.map(p => p.y), mnx = Math.min(...xs), mxx = Math.max(...xs), mny = Math.min(...ys), mxy = Math.max(...ys);
      const s = Math.min(W*.74/(mxx-mnx), H*.66/(mxy-mny)), ox = (mnx+mxx)/2, oy = (mny+mxy)/2; return q => [W/2 + (q.x-ox)*s, H*.5 - (q.y-oy)*s, s]; };
    const fit = () => { const r = cv.getBoundingClientRect(), d = devicePixelRatio || 1; cv.width = Math.max(1, r.width*d); cv.height = Math.max(1, r.height*d); cx.setTransform(d,0,0,d,0,0); };
    const ro = new ResizeObserver(fit); ro.observe(cv); fit();
    const NAVY = '#0B2447';
    function frame(now){
      if (!alive) return;
      const r = cv.getBoundingClientRect(), W = r.width, H = r.height; if (!W){ raf = requestAnimationFrame(frame); return; }
      const e = reduce ? 1 : ease(Math.min(1, (now - mStart)/900)); mt = e;
      const k = reduce ? 1 : Math.min(1, (now - sStart)/700);
      const A = fitter(from, subFrom, W, H), Bf = fitter(mode, sub, W, H);
      const P = p => { const a = A(p), b = Bf(p); return [a[0]+(b[0]-a[0])*e, a[1]+(b[1]-a[1])*e, b[2]]; };
      const M = e < .5 ? from : mode, Nn = e < .5 ? subFrom : sub, col = MODES[mode].c;
      cx.fillStyle = '#F6F9FC'; cx.fillRect(0,0,W,H);
      // grids
      const tr = fitPt(mode, sub, W, H), o = tr(raw(mode,[0,0,0],sub)), sc = o[2];
      cx.lineWidth = 1;
      if (mode === 'iso'){ cx.strokeStyle = `rgba(120,180,225,${.55*e})`; cx.beginPath(); const ux = [sc/s2, sc/s6], uy = [sc/s2, -sc/s6];
        for (let i = -40; i <= 40; i++){ const bx = o[0] + i*ux[0], by = o[1] + i*ux[1]; cx.moveTo(bx - 60*uy[0], by - 60*uy[1]); cx.lineTo(bx + 60*uy[0], by + 60*uy[1]);
          const cx2 = o[0] + i*uy[0], cy2 = o[1] + i*uy[1]; cx.moveTo(cx2 - 60*ux[0], cy2 - 60*ux[1]); cx.lineTo(cx2 + 60*ux[0], cy2 + 60*ux[1]); const vx = o[0] + i*ux[0]; cx.moveTo(vx, 0); cx.lineTo(vx, H); } cx.stroke(); }
      if (mode === 'obl' || (mode === 'per' && sub === 1)){ cx.strokeStyle = `rgba(120,180,225,${.45*e})`; cx.beginPath(); const g = mode === 'obl' ? sc : sc;
        for (let x = o[0] % g; x < W; x += g){ cx.moveTo(x,0); cx.lineTo(x,H); } for (let y = o[1] % g; y < H; y += g){ cx.moveTo(0,y); cx.lineTo(W,y); } cx.stroke(); }
      const settled = e >= 1, st = settled ? step : 3, kk = settled ? k : 1;
      const line = (p, q, c, w, dash, al = 1) => { cx.globalAlpha = al; cx.strokeStyle = c; cx.lineWidth = w; cx.setLineDash(dash || []); cx.beginPath(); cx.moveTo(p[0],p[1]); cx.lineTo(q[0],q[1]); cx.stroke(); cx.setLineDash([]); cx.globalAlpha = 1; };
      const text = (t, x, y, c, sz = 13) => { cx.fillStyle = c; cx.font = `700 ${sz}px "IBM Plex Sans KR",sans-serif`; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(t, x, y); };
      const dot = (p, c, rr = 3.5) => { cx.fillStyle = c; cx.beginPath(); cx.arc(p[0], p[1], rr, 0, 7); cx.fill(); };
      const fs = Math.max(11, Math.min(18, W/40));
      if (st === 3){
        const faces = FACES.filter(f => visible(M, f, Nn)).map(f => ({f, pts:f.v.map(P), d:f.v.reduce((a,p) => a + raw(M,p,Nn).d, 0)/f.v.length})).sort((a,b) => a.d - b.d);
        faces.forEach(({f, pts}) => { cx.beginPath(); pts.forEach((p,i) => i ? cx.lineTo(p[0],p[1]) : cx.moveTo(p[0],p[1])); cx.closePath();
          const lum = f.n[2] > .5 ? 0 : f.front ? 1 : 2; cx.fillStyle = [ '#FFE9D6', '#FFC08F', '#F59A57' ][lum]; cx.globalAlpha = settled ? kk : 1; cx.fill(); cx.globalAlpha = 1;
          cx.strokeStyle = NAVY; cx.lineWidth = 2.6; cx.lineJoin = 'round'; cx.stroke(); });
      } else {
        // construction stages (textbook steps 1·2)
        const near = mode === 'iso' ? [5,0,0] : [0,0,0];
        if (mode === 'iso'){
          const O = P(near), ax = [P([0,0,0]), P([5,DEP+1.5,0]), P([5,0,5.5])];
          const xa = P([-1.5,0,0]), ya = P([5,DEP+1.5,0]), za = P([5,0,5.5]);
          line([O[0]-W*.3,O[1]],[O[0]+W*.3,O[1]],'#93AACB',1,[5,4]);
          [xa, ya, za].forEach(q => line(O, q, NAVY, 2.2, null, st === 1 ? kk : 1));
          cx.strokeStyle = col; cx.lineWidth = 2; cx.beginPath(); cx.arc(O[0], O[1], 34, Math.PI*7/6 - Math.PI, -Math.PI/6 - 0, true); cx.stroke();
          text('30°', O[0]-58, O[1]-10, col, fs); text('30°', O[0]+58, O[1]-10, col, fs); text('120°', O[0], O[1]+26, col, fs);
          if (st === 2){ EDGES.forEach(ed => line(P(ed.a), P(ed.b), '#5A7FA8', 1.4, null, kk)); [...F, ...B].forEach(p => dot(P(p), col)); text('높이', za[0]+16, za[1], NAVY, fs); text('너비', xa[0]-18, xa[1], NAVY, fs); text('안쪽 길이', ya[0]+30, ya[1], NAVY, fs); }
          else { text('높이', za[0]+16, za[1], NAVY, fs); text('너비', xa[0]-18, xa[1], NAVY, fs); text('안쪽', ya[0]+20, ya[1], NAVY, fs); }
        }
        if (mode === 'obl'){
          const b0 = P([-1,0,0]), b1 = P([6.5,0,0]); line(b0, b1, '#93AACB', 1, [5,4]);
          EDGES.filter(ed => ed.t === 'f').forEach(ed => line(P(ed.a), P(ed.b), NAVY, 2.6, null, st === 1 ? kk : 1));
          if (st === 1) text('정면 = 실제 모양', P([2.5,0,-0.6])[0], P([2.5,0,-0.6])[1], col, fs);
          if (st === 2){ EDGES.filter(ed => ed.t === 'r').forEach(ed => line(P(ed.a), P(ed.b), col, 2.4, null, kk)); F.forEach(p => dot(P(p), col));
            const q = P([5,0,0]); cx.strokeStyle = col; cx.lineWidth = 1.6; cx.beginPath(); cx.arc(q[0], q[1], 30, -Math.PI/4, 0); cx.stroke(); text('45°', q[0]+44, q[1]-12, col, fs);
            const m = P([5,DEP/2,2]); text('안쪽 길이 × ½', m[0]+64, m[1]-6, col, fs); }
        }
        if (mode === 'per'){
          EDGES.filter(ed => ed.t === 'f').forEach(ed => line(P(ed.a), P(ed.b), NAVY, 2.6, null, st === 1 ? kk : 1));
          if (st === 2){ const T = fitPt('per', sub, W, H); vps(sub).forEach((v, i) => { const s = T(v);
              [...F, ...(sub > 1 ? B : [])].forEach(p => { const q = P(p); line(q, [q[0] + (s[0]-q[0])*1, q[1] + (s[1]-q[1])*1], col, 1.2, [6,5], .55*kk); });
              const inside = s[0] > 10 && s[0] < W-10 && s[1] > 10 && s[1] < H-10;
              if (inside){ dot(s, col, 6); text('소점', s[0], s[1]-18, col, fs); }
              else { const ang = Math.atan2(s[1]-H/2, s[0]-W/2), ex = Math.max(40, Math.min(W-40, W/2 + Math.cos(ang)*W*.45)), ey = Math.max(20, Math.min(H-20, H/2 + Math.sin(ang)*H*.45)); text('소점 → 화면 밖', ex, ey, col, fs); } });
            if (sub < 3){ const hz = fitPt('per', sub, W, H)(vps(sub)[0])[1]; line([0,hz],[W,hz],'#93AACB',1,[3,4]); text('수평선(눈높이)', 70, hz-12, '#5A7FA8', fs*.85); } }
        }
      }
      lab.textContent = `${MODES[mode].name}${mode === 'per' ? ` · ${sub}점 투시` : ''} · ${st === 3 ? '완성' : st + '단계'}`;
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    const def = $('.def', host), stp = $('.stp', host), subEl = $('.sub', host);
    function paintSide(){
      const m = MODES[mode];
      $$('.modes button', host).forEach(b => b.setAttribute('aria-pressed', b.dataset.m === mode));
      subEl.hidden = mode !== 'per'; $$('.sub button', host).forEach(b => b.setAttribute('aria-pressed', +b.dataset.n === sub));
      def.style.setProperty('--c', m.c);
      def.innerHTML = `<h3>${m.name}${m.tag ? ` <span class="chip">${m.tag}</span>` : ''}</h3><p>${m.def}</p><p class="ft">${m.feat}</p>`;
      stp.innerHTML = (mode === 'per' && sub > 1 ? `<p class="mono" style="margin:0;color:var(--pen)">교과서 3단계는 1점 투시 기준이에요. ${sub}점 투시는 소점이 ${sub}개!</p>` : '') + m.steps.map((t,i) => `<button type="button" data-s="${i+1}" aria-pressed="${step === i+1}" style="--c:${m.c}"><b>${'①②③'[i]}</b><span>${t}</span></button>`).join('');
      $$('button', stp).forEach(b => b.addEventListener('click', () => { stopPlay(); setStep(+b.dataset.s); }));
    }
    function setStep(n){ step = n; sStart = performance.now(); $$('button', stp).forEach(b => b.setAttribute('aria-pressed', +b.dataset.s === step)); }
    function setMode(m, n){ if (m === mode && (n || sub) === sub) return; from = mode; subFrom = sub; mode = m; if (n) sub = n; mStart = performance.now(); step = 3; paintSide(); }
    $$('.modes button', host).forEach(b => b.addEventListener('click', () => { stopPlay(); setMode(b.dataset.m); }));
    $$('.sub button', host).forEach(b => b.addEventListener('click', () => { stopPlay(); setMode('per', +b.dataset.n); }));
    const pb = $('.play', host);
    function stopPlay(){ clearInterval(play); play = 0; pb.textContent = '▶ 1→2→3단계 재생'; }
    pb.addEventListener('click', () => { if (play){ stopPlay(); return; } setStep(1); pb.textContent = '❚❚ 멈춤'; play = setInterval(() => { if (step >= 3){ stopPlay(); return; } setStep(step + 1); }, 2400); });
    paintSide();
    return () => { alive = false; cancelAnimationFrame(raf); ro.disconnect(); clearInterval(play); };
  },
  video(host, arg){ return mountPlayer(host, arg); },
};
function mountAll(root){ const cl = []; $$('[data-comp]', root).forEach(el => { const [n, arg] = el.dataset.comp.split(':'); const f = COMP[n]; if (f){ const c = f(el, arg); if (typeof c === 'function') cl.push(c); } }); return () => cl.forEach(f => f()); }


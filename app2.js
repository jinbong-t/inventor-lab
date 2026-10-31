/* ================= motion videos ================= */
const VIDS = {
  v1: {title:'기술적 문제 해결 4단계', dur:36, caps:[[0,'불편함을 그냥 넘기지 않는 것, 발명은 거기서 시작돼요.'],[6,'STAGE 1 · 문제 확인 — 누가, 언제, 어디서, 무엇이, 왜 불편한가?'],[14,'STAGE 2 · 아이디어 탐색 및 선정 — 많이 떠올리고(확산), 잘 고른다(수렴).'],[22,'STAGE 3 · 실행 — 도면을 그리고, 재료와 도구로 만든다.'],[30,'STAGE 4 · 평가 — 처음의 불편함이 정말 해결됐나?']]},
  v2: {title:'등각 투상도 3단계', dur:30, caps:[[0,'등각 투상도는 세 축이 서로 120°를 이루는 그림이에요.'],[7,'1단계 · 기준선에서 양쪽으로 30°, 그리고 수직선.'],[13,'2단계 · 축을 따라 높이·너비·안쪽 길이를 칸 수로 옮겨요.'],[20,'3단계 · 필요 없는 선은 지우고, 외곽선은 진하게.'],[25,'마지막으로 치수(mm)와 축척을 적으면 완성!']]},
  v3: {title:'우드락 안전하게 자르기', dur:26, caps:[[0,'커터 칼 안전 수칙, 30초면 충분해요.'],[4,'칼날은 2칸 이하로만 빼요.'],[9,'커팅 매트 위에서, 쇠자를 대고 자릅니다.'],[14,'한 번에 힘주지 말고, 가볍게 2~3번 반복해서 그어요.'],[20,'다 쓴 칼은 칼날을 칼집 안으로! 칼 들고 돌아다니지 않기.']]},
};
function scene(id, ctx, t, W, H){
  const c = ctx, u = Math.min(W/16, H/9), cx = W/2, cy = H/2;
  const clamp = v => Math.max(0, Math.min(1, v)), ph = (a,b) => clamp((t-a)/(b-a));
  c.fillStyle = '#071A33'; c.fillRect(0,0,W,H);
  c.strokeStyle = 'rgba(143,211,255,.07)'; c.lineWidth = 1; c.beginPath(); for (let x = 0; x < W; x += u*.5){ c.moveTo(x,0); c.lineTo(x,H); } for (let y = 0; y < H; y += u*.5){ c.moveTo(0,y); c.lineTo(W,y); } c.stroke();
  const txt = (s, x, y, size, col='#EEF4FB', font='"Black Han Sans","IBM Plex Sans KR",sans-serif', al='center') => { c.fillStyle = col; c.font = `${size}px ${font}`; c.textAlign = al; c.textBaseline = 'middle'; c.fillText(s, x, y); };
  const line = (x1,y1,x2,y2,k,col,w) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x1,y1); c.lineTo(x1+(x2-x1)*k, y1+(y2-y1)*k); c.stroke(); };
  if (id === 'v1'){
    const stages = [['문제 확인','#FF6B5B'],['아이디어 탐색·선정','#F5C542'],['실행','#5AA9FF'],['평가','#3DD68C']];
    if (t < 6){ const k = ph(0,1.2); c.globalAlpha = k; txt('불편함', cx, cy-u*1.1, u*1.6); txt('발명으로.', cx, cy+u*.6, u*1.6, '#8FD3FF'); c.globalAlpha = 1;
      for (let i = 0; i < 18; i++){ const x = (i*97 % 16)*u, y = ((t*3 + i*1.7) % 10)*u - u; line(x, y, x - u*.15, y + u*.5, 1, 'rgba(143,211,255,.5)', 2); } }
    else {
      const s = Math.min(3, Math.floor((t-6)/8)), lt = (t-6) - s*8;
      stages.forEach((st, i) => { const x = W*(.14 + i*.24), y = H*.16, on = i === s, done = i < s; c.fillStyle = on ? st[1] : done ? 'rgba(238,244,251,.25)' : 'rgba(238,244,251,.08)'; c.fillRect(x - u*1.6, y - u*.42, u*3.2, u*.84);
        txt(`${i+1} ${st[0]}`, x, y, u*.34, on ? '#06172E' : '#EEF4FB', '"IBM Plex Sans KR",sans-serif'); });
      const k = ph(0, 1.5) ; const col = stages[s][1]; c.save(); c.translate(0, (1-ease(clamp(lt/1)))*u);
      if (s === 0){ // umbrella falling + puddle
        const ang = Math.min(1, lt/2.5)*1.2; c.save(); c.translate(cx - u*1.5, cy + u*2); c.rotate(-ang); c.strokeStyle = '#EEF4FB'; c.lineWidth = u*.12; c.beginPath(); c.moveTo(0,0); c.lineTo(0,-u*3); c.stroke(); c.beginPath(); c.arc(-u*.3, 0, u*.3, 0, Math.PI); c.stroke(); c.restore();
        c.fillStyle = 'rgba(90,169,255,.5)'; c.beginPath(); c.ellipse(cx - u*.4, cy + u*2.2, u*2*clamp((lt-1)/3), u*.35*clamp((lt-1)/3), 0, 0, Math.PI*2); c.fill();
        ['누가','언제','어디서','무엇이','왜'].forEach((w,i) => { c.globalAlpha = clamp((lt-1.5-i*.6)/.5); txt(w + '?', cx + u*2.5, cy - u*1.6 + i*u*.9, u*.6, col); }); c.globalAlpha = 1; }
      if (s === 1){ for (let i = 0; i < 9; i++){ const a = i/9*Math.PI*2 + lt*.3, r = u*2.2*clamp((lt-i*.25)/1); c.fillStyle = COLORS[i%7]; c.beginPath(); c.arc(cx + Math.cos(a)*r, cy + u*.4 + Math.sin(a)*r*.7, u*.32, 0, 7); c.fill(); txt('SCAMPER'[i%7], cx + Math.cos(a)*r, cy + u*.4 + Math.sin(a)*r*.7, u*.32, '#06172E'); }
        c.globalAlpha = clamp((lt-4)/1); c.fillStyle = col; c.beginPath(); c.arc(cx, cy + u*.4, u*.75, 0, 7); c.fill(); txt('PASS', cx, cy + u*.4, u*.45, '#06172E'); c.globalAlpha = 1;
        txt('확산 → 수렴', cx, H*.88, u*.45, '#93AACB', '"IBM Plex Sans KR",sans-serif'); }
      if (s === 2){ const sc = u*.012, P = (x,y,z) => [cx + (x-y)*.866*sc, cy + u*1.8 + (x+y)*.5*sc - z*sc]; const k2 = clamp(lt/4);
        EDGES.forEach((e,i) => { const kk = clamp(k2*EDGES.length - i*.5); if (kk <= 0) return; const p = P(...e[0]), q = P(...e[1]); line(p[0],p[1],q[0],q[1],kk,'#8FD3FF',2); });
        txt('도면 → 재료표 → 공정표 → 모형', cx, H*.88, u*.42, '#93AACB', '"IBM Plex Sans KR",sans-serif'); }
      if (s === 3){ ['문제를 해결했나?','안전한가?','더 나은 버전은?'].forEach((w,i) => { const kk = clamp((lt-.5-i*1)/.6); c.globalAlpha = kk; c.strokeStyle = col; c.lineWidth = 3; c.strokeRect(cx - u*3, cy - u*.9 + i*u*1.1, u*.6, u*.6);
          if (kk >= 1){ c.beginPath(); c.moveTo(cx - u*2.85, cy - u*.6 + i*u*1.1); c.lineTo(cx - u*2.7, cy - u*.4 + i*u*1.1); c.lineTo(cx - u*2.45, cy - u*.8 + i*u*1.1); c.stroke(); }
          txt(w, cx - u*2.1, cy - u*.6 + i*u*1.1, u*.5, '#EEF4FB', '"IBM Plex Sans KR",sans-serif', 'left'); }); c.globalAlpha = 1; }
      c.restore();
    }
  }
  if (id === 'v2'){
    const a = u*.55, c30 = Math.cos(Math.PI/6), ox = cx, oy = cy + u*1.6, P = (x,y,z) => [ox + (x-y)*c30*a, oy + (x+y)*.5*a - z*a];
    c.strokeStyle = 'rgba(143,211,255,.18)'; c.lineWidth = 1; c.beginPath(); for (let k = -20; k <= 20; k++){ const p1 = P(k,-20,0), p2 = P(k,20,0), q1 = P(-20,k,0), q2 = P(20,k,0); c.moveTo(...p1); c.lineTo(...p2); c.moveTo(...q1); c.lineTo(...q2); } c.stroke();
    if (t < 7){ c.globalAlpha = ph(0,1); txt('ISOMETRIC', cx, H*.2, u*.9, '#FF8A3D', '"IBM Plex Mono",monospace'); txt('세 축 = 120°', cx, H*.32, u*.7); c.globalAlpha = 1; }
    const ax = ph(7,10); [[7,0,0],[0,6,0],[0,0,6]].forEach(v => { const p = P(0,0,0), q = P(...v); line(p[0],p[1],q[0],q[1],ax,'#EEF4FB',3); });
    if (t > 8 && t < 13){ const A = P(0,0,0); c.strokeStyle = '#FF8A3D'; c.lineWidth = 3; c.beginPath(); c.arc(A[0], A[1], u*.9, Math.PI/6, Math.PI*5/6); c.stroke(); txt('120°', A[0], A[1] + u*1.3, u*.5, '#FF8A3D', '"IBM Plex Mono",monospace'); }
    const BX = 5, BY = 3, E = [[[BX,0,0],[BX,BY,0]],[[BX,BY,0],[0,BY,0]],[[BX,0,0],[BX,0,2]],[[BX,BY,0],[BX,BY,2]],[[0,BY,0],[0,BY,4]],[[BX,0,2],[BX,BY,2]],[[BX,BY,2],[2,BY,2]],[[BX,0,2],[2,0,2]],[[2,0,2],[2,0,4]],[[2,BY,2],[2,BY,4]],[[2,0,4],[2,BY,4]],[[2,BY,4],[0,BY,4]],[[0,0,4],[2,0,4]],[[0,0,4],[0,BY,4]],[[2,0,2],[2,BY,2]]];
    if (t >= 13){ const k = ph(13,19); E.forEach((e,i) => { const kk = clamp(k*E.length - i*.6); const p = P(...e[0]), q = P(...e[1]); line(p[0],p[1],q[0],q[1],kk, t < 20 ? '#8FD3FF' : '#FFFFFF', t < 20 ? 2 : 4); }); }
    if (t >= 20){ const fade = 1 - ph(20,22); [[7,0,0],[0,6,0],[0,0,6]].forEach(v => { const p = P(0,0,0), q = P(...v); c.globalAlpha = 1; line(p[0],p[1],q[0],q[1],1,'#071A33',5); line(p[0],p[1],q[0],q[1],fade,'#EEF4FB',3); });
      E.forEach(e => { const p = P(...e[0]), q = P(...e[1]); line(p[0],p[1],q[0],q[1],1,'#FFFFFF',4); }); }
    if (t >= 25){ c.globalAlpha = ph(25,26); const d = (p, s, dx, dy) => { const q = P(...p); txt(s, q[0]+dx*u, q[1]+dy*u, u*.5, '#FF8A3D', '"IBM Plex Mono",monospace'); };
      d([2.5,BY,0],'50',-.2,.8); d([BX,1.5,0],'30',.8,.6); d([0,BY,2],'40',-.9,0); txt('SCALE 1:1 · mm', u*1.4, u*.8, u*.4, '#FF8A3D', '"IBM Plex Mono",monospace', 'left'); c.globalAlpha = 1; }
  }
  if (id === 'v3'){
    // mat
    c.fillStyle = '#1F6B4A'; c.fillRect(u*1.5, u*2.4, u*13, u*5.6); c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 1; c.beginPath(); for (let x = u*1.5; x < u*14.5; x += u*.5){ c.moveTo(x,u*2.4); c.lineTo(x,u*8); } for (let y = u*2.4; y < u*8; y += u*.5){ c.moveTo(u*1.5,y); c.lineTo(u*14.5,y); } c.stroke();
    // foam board
    c.fillStyle = '#FFFDF5'; c.fillRect(u*3, u*3.2, u*9, u*4);
    if (t < 4){ c.globalAlpha = ph(0,1); txt('SAFETY FIRST', cx, u*1.3, u*.9, '#F2C230', '"IBM Plex Mono",monospace'); c.globalAlpha = 1; }
    // ruler
    const rul = ph(9,10); c.fillStyle = '#C9D2DD'; c.fillRect(u*3 + (1-rul)*u*8, u*4.6, u*9, u*.5); c.fillStyle = '#5b6b7d'; for (let i = 0; i < 30; i++) c.fillRect(u*3 + (1-rul)*u*8 + i*u*.3, u*4.6, 1.5, i%5 ? u*.12 : u*.22);
    // cutter
    const blade = t < 4 ? 0 : clamp((t-4)/2)*2; const cutK = t < 14 ? 0 : clamp((t-14)/5); const pass = Math.min(2, Math.floor(cutK*3)), pk = (cutK*3) % 1;
    const kx = u*3.4 + (t < 14 ? 0 : (pass < 3 ? (cutK*3 % 1) : 1)*u*8.2), ky = u*4.45;
    for (let i = 0; i <= pass && t >= 14; i++){ c.strokeStyle = `rgba(200,30,40,${.35 + i*.25})`; c.lineWidth = 2; c.beginPath(); c.moveTo(u*3.4, u*4.55); c.lineTo(i < pass ? u*11.6 : kx, u*4.55); c.stroke(); }
    c.save(); c.translate(t < 14 ? u*7 : kx, t < 14 ? u*6.6 : ky); c.rotate(-.5);
    c.fillStyle = '#FFB020'; c.fillRect(0, -u*.35, u*3.4, u*.7); c.fillStyle = '#333'; c.fillRect(u*2.2, -u*.12, u*.8, u*.24);
    c.fillStyle = '#DDE3EA'; c.beginPath(); c.moveTo(0,-u*.2); c.lineTo(-u*.5*blade,-u*.2); c.lineTo(-u*.5*blade - u*.25, u*.2); c.lineTo(0, u*.2); c.fill();
    c.restore();
    if (t >= 4 && t < 9){ c.globalAlpha = ph(4,5); txt('칼날 2칸 이하!', cx, u*1.3, u*.8, '#FFD166'); c.globalAlpha = 1; }
    if (t >= 9 && t < 14){ c.globalAlpha = ph(9,10); txt('커팅 매트 + 쇠자', cx, u*1.3, u*.8, '#FFD166'); c.globalAlpha = 1; }
    if (t >= 14 && t < 20){ txt(`${Math.min(3, pass+1)}번째 긋기 · 가볍게`, cx, u*1.3, u*.8, '#FFD166'); }
    if (t >= 20){ c.fillStyle = 'rgba(7,26,51,.82)'; c.fillRect(0,0,W,H); c.globalAlpha = ph(20,21); txt('✓ 칼날은 칼집 안으로', cx, cy - u*.8, u*.8, '#3DD68C'); txt('✕ 칼 들고 돌아다니기', cx, cy + u*.6, u*.8, '#FF6B5B'); c.globalAlpha = 1; }
  }
}
const extraVideos = []; // {title, kind:'file'|'link', url, assetId}
function mountPlayer(host, id){
  const v = VIDS[id];
  if (!v){ const ex = extraVideos.find(x => x.key === id); if (ex && ex.kind === 'file'){ host.innerHTML = `<div class="vp"><video src="${esc(ex.url)}" controls style="width:100%;height:100%;background:#000"></video></div>`; } return; }
  host.innerHTML = `<div class="vp"><div class="scr"><canvas></canvas><div class="cap"></div></div><div class="ctl"><button type="button" aria-label="재생">▶</button><input type="range" min="0" max="${v.dur*10}" value="0" aria-label="재생 위치"><span class="tm"></span></div></div>`;
  const cv = $('canvas', host), cx = cv.getContext('2d'), cap = $('.cap', host), pb = $('button', host), rg = $('input', host), tm = $('.tm', host);
  let t = 0, playing = false, last = 0, raf = 0, alive = true;
  const fit = () => { const r = cv.getBoundingClientRect(), d = devicePixelRatio || 1; cv.width = Math.max(1, r.width*d); cv.height = Math.max(1, r.height*d); cx.setTransform(d,0,0,d,0,0); paint(); };
  const ro = new ResizeObserver(fit); ro.observe(cv);
  function paint(){ const r = cv.getBoundingClientRect(); if (!r.width) return; scene(id, cx, t, r.width, r.height);
    const cp = [...v.caps].reverse().find(c => t >= c[0]); cap.textContent = cp ? cp[1] : ''; cap.style.fontSize = Math.max(13, r.width/38) + 'px';
    rg.value = Math.round(t*10); tm.textContent = `${fmt(t)} / ${fmt(v.dur)}`; }
  function fmt(s){ s = Math.floor(s); return `${s/60|0}:${String(s%60).padStart(2,'0')}`; }
  function loop(now){ if (!alive) return; if (playing){ t += (now - last)/1000; last = now; if (t >= v.dur){ t = v.dur; playing = false; pb.textContent = '↺'; } paint(); raf = requestAnimationFrame(loop); } }
  pb.addEventListener('click', () => { if (t >= v.dur) t = 0; playing = !playing; pb.textContent = playing ? '❚❚' : '▶'; last = performance.now(); if (playing) raf = requestAnimationFrame(loop); });
  rg.addEventListener('input', () => { t = rg.value/10; paint(); });
  t = v.dur > 30 ? 3 : 2; fit(); paint();
  return () => { alive = false; cancelAnimationFrame(raf); ro.disconnect(); };
}

/* ================= slides ================= */
const DECK_DEFAULT = [
  {n:1, t:'문제 확인', d:'불편함 수배 작전', slides:[
    {k:'title', e:'1차시 · STAGE 1 문제 확인', h:'불편함을<br>찾아라', sub:'INVENTOR LAB 프로젝트 시작', note:'프로젝트 소개 웹앱 첫 화면으로 동기 유발. 3D 모델을 돌려 보게 한다.'},
    {k:'statement', h:'발명가는 <em>천재</em>가 아니라<br><em>불편함</em>을 그냥 넘기지 않는 사람이다.', sub:'오늘 하루 "아, 불편해!" 했던 순간 3개를 떠올려 보자.', note:'짝과 30초씩 이야기 → 2~3명 발표.'},
    {k:'embed', e:'미리 보기', h:'오늘 만들 발명품, 이런 거야', comp:'model', side:['젖은 우산이 쓰러지는 불편함','→ 우산 걸이 + 물받이','→ 등각 투상도 1:4','→ 우드락 모형 1:2'], note:'드래그로 돌리고 "등각 시점 맞추기" 버튼으로 120° 시점 확인.'},
    {k:'embed', e:'프로젝트 지도', h:'8개의 미션', comp:'missions', note:'연구 노트 표지의 미션 맵. 미션 완료마다 도장.'},
    {k:'embed', e:'평가 100점 · 반영 50%', h:'이렇게 평가해요', comp:'rubric', note:'가장 큰 배점은 모형(25), 다음은 등각 투상도(20).'},
    {k:'embed', e:'영상 · 1분', h:'기술적 문제 해결 4단계', comp:'video:v1', note:'재생 버튼. 자막 포함.'},
    {k:'activity', e:'MISSION 0 · 1', h:'불편함 수배 작전', items:['ID 카드: 발명가 이름·연구소·슬로건','불편함 레이더: 장소별 불편함 찾기','WANTED 수배서: 누가·언제·어디서·무엇이·왜','문제 정의 문장 + 해결 조건 3가지'], min:20, note:'순회하며 문제가 막연한 학생 집중 피드백.'},
    {k:'statement', h:'( 누가 )는 ( 언제 ) 할 때<br>( 무엇 ) 때문에 불편하다.<br>그래서 ( <em>이런</em> ) 발명품이 필요하다.', sub:'EXIT TICKET · 내 문제 정의 문장 읽어 보기', note:'3명 발표 후 마무리.'},
  ]},
  {n:2, t:'아이디어 탐색·선정', d:'팝콘 & 오디션', slides:[
    {k:'title', e:'2차시 · STAGE 2 아이디어 탐색 및 선정', h:'아이디어를<br>터뜨려라', sub:'확산적 사고 → 수렴적 사고'},
    {k:'cards', e:'아이디어 팝콘', h:'브레인스토밍 4가지 규칙', cards:[['1','비판 금지','친구 아이디어에 "그건 안 돼" 금지'],['2','자유롭게','엉뚱할수록 환영'],['3','질보다 양','일단 많이!'],['4','결합·개선','남의 아이디어에 내 것을 더하기']], note:'모둠별 돌려쓰기: 친구 연구 노트 팝콘 칸에 아이디어 써 주기 (5분).'},
    {k:'embed', e:'워밍업', h:'아이디어 뽑기 머신', comp:'gacha', note:'2~3번 돌려 엉뚱한 조합으로 아이디어 말해 보기.'},
    {k:'embed', e:'스캠퍼 휠', h:'7가지 질문으로 돌려 보기', comp:'scamper', note:'교과서 160~161쪽. 3칸 이상 채우기.'},
    {k:'embed', e:'재료 힌트 · 이런 것도 만들 수 있어', h:'우드락 + 할핀 + 빨대 + 고무줄로?', comp:'ideas', note:'왼쪽 재료를 누르면 그 재료를 쓴 예시가 강조된다. 카드를 눌러 확대. "작동 원리가 보이게" 만드는 것이 핵심(F영역). 예시를 그대로 따라 하지 말고 내 문제에 맞게 바꾸도록 안내.'},
    {k:'cards', e:'아이디어 오디션', h:'PMI + 평가 행렬', cards:[['P','좋은 점','이 아이디어의 좋은 점은?'],['M','나쁜 점','우드락으로 만들 수 있나? 안전한가?'],['I','흥미로운 점','어떤 점이 흥미로운가?'],['∑','평가 행렬','기준별 1~5점, 합계 최고점 = 합격']], note:'선정 이유는 MISSION 1 해결 조건과 연결해서.'},
    {k:'activity', e:'MISSION 2 · 3', h:'팝콘 → 스캠퍼 → 오디션', items:['친구 아이디어 받기 (팝콘)','스캠퍼 휠 3칸 이상','BEST 3 정리','PMI + 평가 행렬 → PASS'], min:25},
  ]},
  {n:3, t:'시각화 ①', d:'설계 스튜디오', slides:[
    {k:'title', e:'3차시 · 아이디어 시각화', h:'아이디어를<br>그려라', sub:'스케치 → 도면 → 모델링'},
    {k:'cards', e:'아이디어 시각화', h:'세 가지 방법', cards:[['1','스케치','종이와 연필로 빠르게, 자유롭게'],['2','도면','정해진 규칙(투상법)으로 정확하게'],['3','모델링','3D 소프트웨어로 입체를 만든다'],['+','오늘은','스케치 → 등각 투상도 연습']], note:'교과서 153쪽 레고 그림.'},
    {k:'cards', e:'교과서 154~155쪽 · 도면에 물체를 나타내는 방법', h:'투상법은 세 가지', cards:[['등각','120° 세 축','높이·너비·안쪽 길이를 실제 길이로. 세 면을 한 번에'],['사투상','정면 + 45°','정면은 실제 모양, 안쪽 길이는 ½. 한 면을 정확하게'],['투시','소점','원근감. 건축물 조감도·실내 공간 설계'],['★','우리 수행평가','등각 투상도로 도면 그리기']], note:'교과서 154쪽 "도면을 작성할 때는 등각 투상법, 사투상법, 투시 투상법 등과 같은 입체적인 표현 방법이 주로 이용된다."'},
    {k:'embed', e:'교과서 155쪽 · 직접 비교', h:'같은 물체, 세 가지 투상도', comp:'proj', note:'세 투상법 버튼을 차례로 눌러 같은 물체가 어떻게 달라지는지 보여 준다. 각 방법에서 ①②③ 단계 버튼 또는 재생으로 교과서 그리기 순서를 설명. 투시는 1점·2점·3점까지.'},
    {k:'statement', h:'완벽한 그림보다<br><em>빠르고, 입체적으로.</em>', sub:'화살표로 부품 이름 · 기능 · 대략적 치수를 메모!', note:'예시 답안지 스케치 보여 주기.'},
    {k:'embed', e:'등각 투상법 · 교과서 155쪽', h:'우리가 그릴 도면: 등각 투상도', comp:'iso', note:'단계 버튼을 누르며 설명. 칠판에서 함께 그려 보기.'},
    {k:'embed', e:'영상', h:'등각 투상도 그리기', comp:'video:v2'},
    {k:'activity', e:'MISSION 4', h:'설계 스튜디오', items:['SKETCH ZONE에 입체 스케치','부품 스펙 카드 (이름·기능·치수)','사용 설명서 3컷 만화','등각 모눈에 연습 한 번'], min:30},
  ]},
  {n:4, t:'시각화 ②', d:'도면 연구실', slides:[
    {k:'title', e:'4차시 · 아이디어 시각화', h:'도면을<br>완성하라', sub:'등각 투상도 + 재료표 + 공정표'},
    {k:'cards', e:'도면 체크리스트 · 20점', h:'이 다섯 개면 만점', cards:[['120°','세 축','기준선 양쪽 30°'],['H·W·D','세 길이','높이·너비·안쪽 길이 정확'],['✂','선 정리','불필요한 선 지우기'],['mm','치수 3개+','축척 1:○ 표기']], note:'"모눈 한 칸 = 실제 ○mm"를 먼저 정하게 한다.'},
    {k:'embed', e:'시점 실험', h:'등각 시점은 어디일까?', comp:'model', side:['드래그로 돌려 보기','"등각 시점 맞추기"를 누르면','세 면이 똑같이 기울어진 120° 시점'], note:'학생 한 명 나와서 직접 맞춰 보기.'},
    {k:'cards', e:'MISSION 6 준비', h:'만들기 전에 계획부터', cards:[['1','재료표','부품 이름·크기·개수'],['2','재단 배치도','우드락 2장 안에 자투리 적게'],['3','공정표','순서·도구·시간'],['!','두께','우드락 5mm도 치수에!']], note:'교과서 156쪽 보충: 재료표와 공정표의 필요성.'},
    {k:'activity', e:'MISSION 5 · 6', h:'도면 연구실', items:['등각 투상도 완성 (치수 3개+, 축척)','치수 계산 메모','재료표 · 재단 배치도','제작 로드맵(공정표)'], min:35},
  ]},
  {n:5, t:'실행', d:'제작 로드맵', slides:[
    {k:'title', e:'5차시 · STAGE 3 실행', h:'발명품을<br>만들어라', sub:'도면대로, 안전하게'},
    {k:'embed', e:'영상 · 필수', h:'우드락 안전하게 자르기', comp:'video:v3'},
    {k:'cards', e:'SAFETY FIRST', h:'안전 수칙 4', cards:[['1','칼날 2칸','안 쓸 땐 칼집 안으로'],['2','매트 + 쇠자','반드시 커팅 매트 위에서'],['3','2~3번','가볍게 반복해서 긋기'],['4','글루건','선생님이 정한 구역에서만']], note:'연습 재단 5분 후 본 제작.'},
    {k:'steps', e:'제작 순서', h:'5단계 로드맵', steps:[['1','선 긋기','도면대로 연필로'],['2','자르기','커터·쇠자·매트'],['3','조립','목공풀·이쑤시개'],['4','붙이기','고리·물받이'],['5','마무리','색칠·라벨']]},
    {k:'activity', e:'MISSION 6', h:'제작 타임', items:['공정표에 완료 체크','도면과 달라진 점은 바로 기록','다 쓴 칼은 칼집 안으로','끝나면 학번·이름 라벨'], min:40},
  ]},
  {n:6, t:'평가', d:'발명 박람회', slides:[
    {k:'title', e:'6차시 · STAGE 4 평가', h:'발명<br>박람회', sub:'심사하고, 업그레이드하고, 특허 출원까지'},
    {k:'steps', e:'진행 순서', h:'박람회 이렇게', steps:[['1','마무리','모형 완성 20분'],['2','전시','책상 위에 모형 + 연구 노트'],['3','심사','심사위원 카드 3장 붙이기'],['4','셀프 심사','별점 + 버전 2.0'],['5','특허 출원','출원서 + 로고']]},
    {k:'cards', e:'지식재산권 · 교과서 162쪽', h:'내 발명은 어떤 권리로?', cards:[['특허권','20년','지금까지 없던 새로운 발명'],['실용신안권','10년','기존 물건을 더 편리하게 개량'],['디자인권','20년','모양·색채 등 디자인'],['상표권','10년+','이름·로고 (10년마다 갱신)']], note:'예시 DRIP STOP은 실용신안권 + 상표권.'},
    {k:'embed', e:'다시 보기', h:'예시: DRIP STOP', comp:'model', side:['발명의 명칭: 책상 걸이형 우산 물받이','해결 과제: 쓰러지는 우산, 젖는 바닥','권리: 실용신안권 + 상표권','카피: 우산은 걸고, 빗물은 STOP!']},
    {k:'activity', e:'MISSION 7', h:'박람회 + 특허 출원', items:['심사위원 카드 3장 (GOOD · NEXT)','셀프 심사 별점','버전 2.0 업그레이드 계획','모의 특허 출원서 + 로고'], min:25},
    {k:'statement', h:'오늘부터 너희는<br><em>INVENTOR</em>다.', sub:'불편함을 그냥 넘기지 않는 사람 · 수고했어요!'},
  ]},
];
let DECK = JSON.parse(JSON.stringify(DECK_DEFAULT));
const MISSIONS_DEFAULT = JSON.parse(JSON.stringify(MISSIONS));
const HOME_DEFAULT = {t1:'불편함을', t2:'발명으로', lede:$('#hLede').textContent, hand:$('#hHand').textContent};
let HOME = {...HOME_DEFAULT};
let curL = 0, curS = 0, slideClean = null;
const stage = $('#stage'), sw = $('#stagewrap');
function fitStage(){ const r = sw.getBoundingClientRect(); const s = Math.min(r.width/1600, r.height/900); stage.style.transform = `translate(${(r.width-1600*s)/2}px,${(r.height-900*s)/2}px) scale(${s})`; }
new ResizeObserver(fitStage).observe(sw);
function slideHTML(sl, L){
  const sideList = a => `<ul>${a.map(x => `<li>${x}</li>`).join('')}</ul>`;
  switch (sl.k){
    case 'title': return `<div class="slide title"><span class="eyebrow">${sl.e}</span><h2>${sl.h}</h2><p class="hand">${sl.sub || ''}</p><div data-comp="model" style="position:absolute;right:70px;top:110px;width:600px;height:560px"></div></div>`;
    case 'statement': return `<div class="slide" style="justify-content:center"><p class="big">${sl.h}</p>${sl.sub ? `<p class="hand" style="margin-top:30px">${sl.sub}</p>` : ''}</div>`;
    case 'cards': return `<div class="slide"><span class="eyebrow">${sl.e}</span><h2>${sl.h}</h2><div class="cards4">${sl.cards.map((c,i) => `<div style="--c:${COLORS[(i*2)%7]}"><b>${c[0]}</b><strong style="font-size:30px">${c[1]}</strong><span>${c[2]}</span></div>`).join('')}</div></div>`;
    case 'steps': return `<div class="slide"><span class="eyebrow">${sl.e}</span><h2>${sl.h}</h2><div class="steps5">${sl.steps.map((c,i) => `<div style="--c:${COLORS[i]}"><b>${c[0]}</b><strong style="font-size:32px;display:block;margin-top:10px">${c[1]}</strong><span>${c[2]}</span></div>`).join('')}</div></div>`;
    case 'activity': return `<div class="slide"><span class="eyebrow">${sl.e} · 활동</span><h2>${sl.h}</h2><div class="cols"><div><ol>${sl.items.map(x => `<li>${x}</li>`).join('')}</ol><p class="hand">연구 노트 ${sl.e} 쪽을 펴세요</p></div><div data-comp="timer:${sl.min}"></div></div></div>`;
    case 'embed': {
      const big = {model:0, missions:1, rubric:1, ideas:1, gacha:1, scamper:1, iso:1, proj:1}[sl.comp.split(':')[0]];
      const style = {missions:'--mg:22px;--mp:26px;--mn:64px;--mt:30px;--ms:22px', rubric:'--rg:12px;--rn:300px;--rp:80px;--rf:26px;--rh:48px', gacha:'--gv:54px;--gq:80px;--gb:34px', scamper:'--ws:520px;--sh:60px;--sq:34px;--se:28px', iso:'--is:34px', proj:'--pf:19px;--ph:0px'}[sl.comp.split(':')[0]] || '';
      if (sl.side) return `<div class="slide"><span class="eyebrow">${sl.e}</span><h2>${sl.h}</h2><div class="cols" style="grid-template-columns:1.25fr 1fr"><div class="embed" data-comp="${sl.comp}"></div><div>${sideList(sl.side)}</div></div></div>`;
      return `<div class="slide"><span class="eyebrow">${sl.e}</span><h2 style="font-size:${big ? 70 : 76}px">${sl.h}</h2><div class="embed" data-comp="${sl.comp}" style="${style}"></div></div>`;
    }
  }
  return '';
}
function renderSlide(){
  if (slideClean){ slideClean(); slideClean = null; }
  const L = DECK[curL], sl = L.slides[curS];
  stage.innerHTML = slideHTML(sl, L) + `<div class="tb"><span>INVENTOR LAB · ${L.n}차시 ${L.t}</span><span>${String(curS+1).padStart(2,'0')} / ${String(L.slides.length).padStart(2,'0')}</span></div>`;
  slideClean = mountAll(stage);
  $('#sCount').textContent = `${curS+1} / ${L.slides.length}`;
  $('#sNotes').innerHTML = `<b>교사 메모</b> · ${sl.note ? esc(sl.note) : '—'}`;
  $$('#lsel button').forEach((b,i) => b.setAttribute('aria-pressed', i === curL));
  $('#sThumbs').innerHTML = L.slides.map((s,i) => `<button type="button" data-i="${i}" aria-current="${i === curS}">${i+1}. ${esc((s.h || '').replace(/<[^>]+>/g,' ').slice(0,26))}</button>`).join('');
  $$('#sThumbs button').forEach(b => b.addEventListener('click', () => { curS = +b.dataset.i; renderSlide(); }));
  fitStage();
}
function renderLsel(){ $('#lsel').innerHTML = DECK.map((L,i) => `<button type="button" data-l="${i}">${L.n}차시</button>`).join('');
  $$('#lsel button').forEach(b => b.addEventListener('click', () => { curL = +b.dataset.l; curS = 0; renderSlide(); })); }
renderLsel();
const go = d => { const L = DECK[curL]; curS += d; if (curS >= L.slides.length){ if (curL < DECK.length-1){ curL++; curS = 0; } else curS = L.slides.length-1; } if (curS < 0){ if (curL > 0){ curL--; curS = DECK[curL].slides.length-1; } else curS = 0; } renderSlide(); };
['#sPrev','#sPrev2'].forEach(s => $(s).addEventListener('click', () => go(-1)));
['#sNext','#sNext2'].forEach(s => $(s).addEventListener('click', () => go(1)));
function present(on){ sw.classList.toggle('present', on); if (on){ sw.requestFullscreen?.().catch(() => {}); } else if (document.fullscreenElement){ document.exitFullscreen().catch(() => {}); } setTimeout(fitStage, 60); }
$('#sFull').addEventListener('click', () => present(true));
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) { sw.classList.remove('present'); setTimeout(fitStage, 60); } });
document.addEventListener('keydown', e => { if (location.hash !== '#slides' || /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)) return;
  if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' '){ e.preventDefault(); go(1); }
  if (e.key === 'ArrowLeft' || e.key === 'PageUp'){ e.preventDefault(); go(-1); }
  if (e.key === 'f' || e.key === 'F') present(!sw.classList.contains('present'));
  if (e.key === 'Escape') present(false); });

/* ================= home ================= */
function renderHomeText(){
  $('#hT1').textContent = HOME.t1; $('#hT2').textContent = HOME.t2; $('#hLede').textContent = HOME.lede; $('#hHand').textContent = HOME.hand;
  $('#lessonStrip').innerHTML = DECK.map((L,i) => `<button type="button" data-l="${i}"><b>${L.n}</b><strong>${L.t}</strong><span>${L.d} · ${L.slides.length}장</span></button>`).join('');
  $$('#lessonStrip button').forEach(b => b.addEventListener('click', () => { curL = +b.dataset.l; curS = 0; location.hash = '#slides'; }));
  $('#deckCount').textContent = `6차시 ${DECK.reduce((a,L) => a + L.slides.length, 0)}장 · 화살표 키로 넘기고 발표 모드로 전체 화면`;
}
renderHomeText();
let homeClean = null;


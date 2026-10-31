/* ================= 재료 힌트 · 발명품 예시 12 (수업 슬라이드) ================= */
COMP.ideas = function(host){
    if (!document.getElementById('ideas-css')){ const st = document.createElement('style'); st.id = 'ideas-css'; st.textContent = `
.idb{display:grid;grid-template-columns:350px 1fr;gap:22px;height:100%;min-height:0}
.idb .mat{display:flex;flex-direction:column;gap:8px;min-height:0}
.idb .mat h4{margin:0 0 4px;font-family:var(--mono);font-size:17px;color:var(--muted);font-weight:400;letter-spacing:.06em}
.idb .mat button{display:grid;grid-template-columns:58px 1fr;gap:12px;align-items:center;text-align:left;background:rgba(11,36,71,.9);border:2px solid var(--line);color:var(--paper);padding:8px 12px;cursor:pointer;font:inherit}
.idb .mat button[aria-pressed="true"]{border-color:var(--pen);background:#173C6B}
.idb .mat button svg{width:58px;height:44px}
.idb .mat b{display:block;font-size:24px;line-height:1.2}
.idb .mat span{display:block;font-size:17px;color:#C9D8EC;line-height:1.3}
.idb .mat .tip{margin:auto 0 0;font-family:var(--hand);font-size:28px;color:var(--pen);line-height:1.15}
.idb .grid{display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(3,1fr);gap:12px;min-height:0}
.idb .card{background:rgba(11,36,71,.92);border:2px solid var(--line);padding:6px 12px 8px;overflow:hidden;display:flex;flex-direction:column;min-height:0;transition:opacity .25s,border-color .25s,transform .25s;cursor:pointer;text-align:left;color:var(--paper);font:inherit}
.idb .card svg{width:100%;height:80px;flex:none}
.idb .card b{font-size:22px;line-height:1.2;margin-top:4px}
.idb .card .pb,.idb .card .hw{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.idb .card .pb{font-size:15px;color:#C9D8EC;line-height:1.3;margin-top:2px}
.idb .card .hw{font-size:15px;color:var(--pen);line-height:1.3;margin-top:3px}
.idb .card .tg{display:flex;flex-wrap:wrap;gap:4px;margin-top:auto;padding-top:4px}
.idb .card .tg i{font-style:normal;font-size:13px;padding:0 6px;border:1px solid var(--c);color:var(--c)}
.idb .card.dim{opacity:.22}
.idb .card.hit{border-color:var(--pen)}
.idb .card[aria-pressed="true"]{border-color:var(--accent);transform:scale(1.03);z-index:2;box-shadow:0 10px 30px rgba(0,0,0,.45)}
@media (max-width:900px){.idb{grid-template-columns:1fr}.idb .grid{grid-template-columns:repeat(2,1fr);grid-template-rows:none}}`; document.head.appendChild(st); }
    const MAT = {
      wood:{n:'우드락', v:'판 · 상자 · 칸막이 · 홈 끼우기', c:'#EEF4FB', ic:'<rect x="6" y="10" width="46" height="26" fill="#EEF4FB" stroke="#93AACB" stroke-width="2"/><path d="M6 10l6-6h46l-6 6M52 36l6-6V4" fill="#C9D8EC" stroke="#93AACB" stroke-width="2"/>'},
      pin:{n:'할핀', v:'회전 · 접기 (경첩)', c:'#F5C542', ic:'<circle cx="22" cy="22" r="11" fill="#F5C542" stroke="#9A7A12" stroke-width="2"/><path d="M28 26l22 8M28 20l22 -6" stroke="#F5C542" stroke-width="4" stroke-linecap="round"/>'},
      straw:{n:'빨대', v:'회전축 · 레일 · 통로', c:'#8FD3FF', ic:'<rect x="4" y="16" width="50" height="12" rx="6" fill="#EEF4FB"/><path d="M12 16l-4 12M22 16l-4 12M32 16l-4 12M42 16l-4 12M52 16l-4 12" stroke="#FF6B5B" stroke-width="3"/>'},
      tp:{n:'이쑤시개', v:'핀 · 걸쇠 · 보강', c:'#FF9F43', ic:'<path d="M4 34L54 10" stroke="#E8C48A" stroke-width="4" stroke-linecap="round"/><path d="M14 38L54 20" stroke="#E8C48A" stroke-width="4" stroke-linecap="round"/>'},
      band:{n:'고무줄', v:'당기기 · 조이기 · 탄성', c:'#3DD68C', ic:'<ellipse cx="29" cy="22" rx="22" ry="12" fill="none" stroke="#3DD68C" stroke-width="4"/>'},
      paper:{n:'색지', v:'표시 · 라벨 · 눈금 · 마감', c:'#FF6B9B', ic:'<rect x="4" y="12" width="22" height="26" fill="#FF6B5B"/><rect x="18" y="6" width="22" height="26" fill="#F5C542"/><rect x="32" y="12" width="22" height="26" fill="#5AA9FF"/>'},
    };
    const PAL = {w:'#EEF4FB', o:'#FF8A3D', y:'#FFD166', g:'#3DD68C', b:'#5AA9FF', p:'#B57BFF', k:'#6B84A8', c:'#8FD3FF', r:'#FF6B5B'};
    const sh = (hex, f) => '#' + [1,3,5].map(i => Math.round(parseInt(hex.slice(i,i+2),16)*f).toString(16).padStart(2,'0')).join('');
    const IP = (x,y,z) => [(x-y)*.866, (x+y)*.5 - z];
    function draw(items){
      let svg = '', pts = [];
      const poly = (p3, f) => { const q = p3.map(p => IP(...p)); pts.push(...q); return `<polygon points="${q.map(v => v.map(n => n.toFixed(1)).join(',')).join(' ')}" fill="${f}" stroke="#0B2447" stroke-width="1.3" stroke-linejoin="round"/>`; };
      for (const it of items){
        const [t] = it;
        if (t === 'B'){ const [, x,y,z,w,d,h,c] = it, col = PAL[c] || c;
          svg += poly([[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]], sh(col,.72));
          svg += poly([[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]], sh(col,.86));
          svg += poly([[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]], col); }
        if (t === 'L'){ const [, p3, c, w, dash] = it, q = p3.map(p => IP(...p)); pts.push(...q); svg += `<polyline points="${q.map(v => v.map(n => n.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="${PAL[c] || c}" stroke-width="${w || 2.5}" stroke-linecap="round" stroke-linejoin="round"${dash ? ' stroke-dasharray="4 3"' : ''}/>`; }
        if (t === 'D'){ const [, p, r, c] = it, q = IP(...p); pts.push([q[0]-r,q[1]-r],[q[0]+r,q[1]+r]); svg += `<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="${r}" fill="${PAL[c] || c}" stroke="#0B2447" stroke-width="1"/>`; }
        if (t === 'E'){ const [, p, rx, c, w, fill] = it, q = IP(...p); pts.push([q[0]-rx*1.2,q[1]-rx*.6],[q[0]+rx*1.2,q[1]+rx*.6]); svg += `<ellipse cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" rx="${(rx*1.2).toFixed(1)}" ry="${(rx*.6).toFixed(1)}" fill="${fill ? (PAL[fill] || fill) : 'none'}" stroke="${PAL[c] || c}" stroke-width="${w || 3}"/>`; }
        if (t === 'C'){ const [, p, r, h, c] = it, a = IP(...p), b = IP(p[0], p[1], p[2]+h), rx = r*1.2, ry = r*.6, col = PAL[c] || c; pts.push([a[0]-rx,a[1]+ry],[b[0]+rx,b[1]-ry]);
          svg += `<path d="M${a[0]-rx} ${a[1]} A${rx} ${ry} 0 0 0 ${a[0]+rx} ${a[1]} L${b[0]+rx} ${b[1]} L${b[0]-rx} ${b[1]} Z" fill="${sh(col,.8)}" stroke="#0B2447" stroke-width="1.3"/><ellipse cx="${b[0]}" cy="${b[1]}" rx="${rx}" ry="${ry}" fill="${col}" stroke="#0B2447" stroke-width="1.3"/>`; }
        if (t === 'R'){ const [, p, r, c] = it, q = IP(...p), col = PAL[c] || c; pts.push([q[0]-r,q[1]-r],[q[0]+r,q[1]+r]);
          const a0 = -2.4, a1 = .9, sx = q[0]+r*Math.cos(a0), sy = q[1]+r*Math.sin(a0), ex = q[0]+r*Math.cos(a1), ey = q[1]+r*Math.sin(a1);
          svg += `<path d="M${sx.toFixed(1)} ${sy.toFixed(1)} A${r} ${r} 0 1 1 ${ex.toFixed(1)} ${ey.toFixed(1)}" fill="none" stroke="${col}" stroke-width="3" stroke-dasharray="5 3"/><path d="M${ex.toFixed(1)} ${ey.toFixed(1)} l-8 -1 l5 7 z" fill="${col}"/>`; }
        if (t === 'P'){ const [, p, r] = it, q = IP(...p), cs = ['#FF6B5B','#FFD166','#3DD68C','#5AA9FF']; pts.push([q[0]-r,q[1]-r],[q[0]+r,q[1]+r]);
          svg += cs.map((c,i) => { const a = i*Math.PI/2 - Math.PI/2, b = a + Math.PI/2; return `<path d="M${q[0]} ${q[1]} L${(q[0]+r*Math.cos(a)).toFixed(1)} ${(q[1]+r*Math.sin(a)).toFixed(1)} A${r} ${r} 0 0 1 ${(q[0]+r*Math.cos(b)).toFixed(1)} ${(q[1]+r*Math.sin(b)).toFixed(1)} Z" fill="${c}" stroke="#0B2447" stroke-width="1"/>`; }).join('') + `<circle cx="${q[0]}" cy="${q[1]}" r="3" fill="#F5C542" stroke="#0B2447"/>`; }
      }
      const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), mx = Math.min(...xs)-8, my = Math.min(...ys)-8, w = Math.max(...xs)-mx+8, h = Math.max(...ys)-my+8;
      return `<svg viewBox="${mx.toFixed(1)} ${my.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${svg}</svg>`;
    }
    const IDEAS = [
      {n:'우산 물받이 걸이', p:'젖은 우산 때문에 바닥이 물바다', h:'걸이 + 물받이 결합', m:['wood','tp'], d:[['B',0,0,0,70,22,8,'b'],['B',0,-5,8,70,5,62,'w'],['B',14,0,60,5,14,3,'o'],['B',50,0,60,5,14,3,'o'],['L',[[17,12,62],[17,12,14]],'c',4],['L',[[53,12,62],[53,12,14]],'p',4],['D',[30,14,8],2.5,'c'],['D',[40,8,8],2.5,'c']]},
      {n:'모서리 펜 거치대', p:'필기구가 책상에서 굴러떨어짐', h:'책상 두께만큼 홈 끼우기', m:['wood','paper'], d:[['B',-10,-20,0,95,60,8,'k'],['B',4,40,-26,62,5,42,'w'],['B',4,40,8,62,5,6,'w'],['B',4,45,0,62,16,16,'o'],['L',[[16,52,14],[16,52,40]],'r',4],['L',[[28,54,14],[30,54,44]],'y',4],['L',[[42,52,14],[40,52,38]],'b',4],['L',[[54,54,14],[56,54,42]],'g',4]]},
      {n:'케이블 정리 홀더', p:'충전 케이블이 침대 뒤로 떨어짐', h:'빨대 통로 + 고무줄 조임', m:['wood','straw','band'], d:[['B',0,0,0,64,34,5,'w'],['B',6,6,5,52,5,5,'c'],['B',6,20,5,52,5,5,'c'],['E',[32,16,9],16,'g',3],['L',[[60,8,10],[76,4,10],[86,14,4],[90,30,0]],'k',3],['L',[[60,22,10],[78,28,8],[84,44,2]],'y',3]]},
      {n:'칸막이 정리함', p:'사물함 속 교과서가 안 찾아짐', h:'칸막이 + 과목별 색 라벨', m:['wood','paper'], d:[['B',0,0,0,66,44,4,'w'],['B',0,0,4,66,3,40,'w'],['B',0,3,4,3,41,30,'w'],['B',5,6,4,10,32,34,'r'],['B',22,3,4,3,41,30,'w'],['B',27,6,4,10,32,30,'y'],['B',44,3,4,3,41,30,'w'],['B',49,6,4,12,32,32,'b'],['B',63,3,4,3,41,30,'w'],['B',8,44,12,8,1,6,'r'],['B',30,44,12,8,1,6,'y'],['B',52,44,12,8,1,6,'b']]},
      {n:'물병 고정대', p:'물병이 책상에서 자꾸 넘어짐', h:'고리판 + 고무줄 고정', m:['wood','band'], d:[['B',0,0,0,56,5,72,'w'],['B',10,5,34,36,30,5,'o'],['C',[28,22,0],12,64,'c'],['E',[28,22,50],13,'g',3.5]]},
      {n:'이어폰 회전 케이스', p:'이어폰을 자꾸 잃어버림', h:'할핀 축으로 도는 뚜껑', m:['wood','pin'], d:[['B',0,0,0,86,26,18,'p'],['B',52,4,18,26,18,10,'w'],['B',56,-14,28,26,18,3,'o'],['D',[60,6,30],4,'#F5C542'],['R',[60,6,30],18,'y']]},
      {n:'집게 독서대', p:'펼쳐 둔 책이 자꾸 덮임', h:'고무줄 탄성 집게', m:['wood','band','tp'], d:[['B',0,0,0,74,30,5,'w'],['B',0,0,5,74,5,54,'w'],['B',4,5,10,32,3,42,'#FFF3D6'],['B',38,5,10,32,3,42,'#FFF3D6'],['B',14,8,46,8,6,8,'o'],['B',52,8,46,8,6,8,'o'],['L',[[18,8,54],[18,2,62],[56,2,62],[56,8,54]],'g',3]]},
      {n:'접이식 가방 걸이', p:'실내화 주머니 들기 귀찮음', h:'할핀으로 접는 고리', m:['wood','pin'], d:[['B',0,0,46,46,8,7,'w'],['B',40,0,6,6,8,40,'o'],['D',[43,8,49],4,'#F5C542'],['R',[43,8,49],16,'y'],['B',30,8,-28,26,10,30,'b'],['L',[[38,13,2],[43,13,8],[48,13,2]],'k',2.5]]},
      {n:'물 주기 알림판', p:'화분에 물 주는 걸 깜빡함', h:'할핀 회전판 요일 표시', m:['pin','paper','straw'], d:[['C',[28,28,0],18,26,'o'],['L',[[24,28,26],[14,22,44]],'g',4],['L',[[28,28,26],[34,30,48]],'g',4],['L',[[30,26,26],[42,20,40]],'g',4],['B',50,36,0,3,3,62,'c'],['P',[51,37,70],16],['R',[51,37,70],22,'y']]},
      {n:'리모컨 주머니', p:'리모컨이 어디 있는지 모름', h:'팔걸이에 거는 주머니', m:['wood','paper'], d:[['B',0,0,0,30,74,32,'k'],['B',0,16,32,34,40,3,'w'],['B',30,16,4,4,40,31,'w'],['B',38,30,22,6,12,18,'#374A66'],['B',34,16,0,10,40,24,'b'],['B',36,40,10,1,10,7,'y']]},
      {n:'식판 수저 홀더', p:'급식 수저가 바닥에 떨어짐', h:'테두리 홈 + 이쑤시개 핀', m:['wood','tp'], d:[['B',0,0,0,80,54,4,'k'],['B',6,6,4,30,20,2,'#8296B3'],['B',42,6,4,32,42,2,'#8296B3'],['B',80,12,-6,12,30,22,'w'],['L',[[86,20,16],[90,18,44]],'y',4],['L',[[86,30,16],[89,30,46]],'#C9D8EC',3],['L',[[86,34,16],[90,34,46]],'#C9D8EC',3]]},
      {n:'접는 순서 가이드판', p:'체육복이 가방 속에서 구겨짐', h:'할핀 경첩 3단 접기', m:['wood','pin'], d:[['B',0,0,0,4,44,32,'w'],['B',4,0,0,30,44,3,'o'],['B',36,0,0,30,44,3,'w'],['D',[34,10,3],3.5,'#F5C542'],['D',[34,34,3],3.5,'#F5C542'],['R',[2,22,30],14,'y'],['L',[[66,22,3],[76,22,22]],'y',3,1]]},
    ];
    host.classList.add('idb');
    host.innerHTML = `<div class="mat"><h4>재료 → 이렇게 쓸 수 있어</h4>${Object.entries(MAT).map(([k,m]) => `<button type="button" data-m="${k}" aria-pressed="false"><svg viewBox="0 0 58 44" aria-hidden="true">${m.ic}</svg><span><b>${m.n}</b><span>${m.v}</span></span></button>`).join('')}<p class="tip">우드락은 1인 2장!<br>실제보다 작게(1:2) 만들어도 OK</p></div>
      <div class="grid">${IDEAS.map((it,i) => `<button type="button" class="card" data-i="${i}" aria-pressed="false">${draw(it.d)}<b>${it.n}</b><span class="pb">${it.p}</span><span class="hw">→ ${it.h}</span><span class="tg">${it.m.map(k => `<i style="--c:${MAT[k].c}">${MAT[k].n}</i>`).join('')}</span></button>`).join('')}</div>`;
    let sel = null;
    const paint = () => { $$('.mat button', host).forEach(b => b.setAttribute('aria-pressed', b.dataset.m === sel));
      $$('.card', host).forEach(c => { const has = !sel || IDEAS[+c.dataset.i].m.includes(sel); c.classList.toggle('dim', !has); c.classList.toggle('hit', !!sel && has); }); };
    $$('.mat button', host).forEach(b => b.addEventListener('click', () => { sel = sel === b.dataset.m ? null : b.dataset.m; paint(); }));
    $$('.card', host).forEach(c => c.addEventListener('click', () => { const on = c.getAttribute('aria-pressed') !== 'true'; $$('.card', host).forEach(x => x.setAttribute('aria-pressed', 'false')); c.setAttribute('aria-pressed', on); }));
  };

/* ================= classes (반 설정) ================= */
let CLASSES = [], cEditing = null;
function parseRoster(text){
  const out = [], seen = new Set();
  String(text).split(/\r?\n/).forEach(line => { const t = line.trim(); if (!t) return;
    const m = t.match(/^(\d{3,})[\s,\t]*(.*)$/) || t.match(/^(.*?)[\s,\t]+(\d{3,})$/);
    if (!m) return; let sid, name; if (/^\d/.test(t)){ sid = m[1]; name = m[2]; } else { name = m[1]; sid = m[2]; }
    name = String(name).replace(/[,\t]+/g,' ').trim(); if (!seen.has(sid)){ seen.add(sid); out.push({sid, name}); } });
  return out;
}
function renderClasses(){
  const done = cls => [...Store.recs.values()].filter(r => r.cls === cls).length;
  $('#cList').innerHTML = CLASSES.length ? CLASSES.map((c,i) => { const d = done(c.name), n = c.students.length;
    return `<div class="panel ccard"><span class="mono">${esc(c.memo || 'CLASS')}</span><b>${esc(c.name)}</b><span style="font-size:14px;color:var(--muted)">${n}명 · 채점 ${d}명</span><div class="bar2"><i style="width:${n ? Math.min(100, d/n*100) : 0}%"></i></div>
      <div class="row" style="gap:6px"><button class="btn sm" type="button" data-a="grade" data-i="${i}">채점 시작</button><button class="btn ghost sm" type="button" data-a="dash" data-i="${i}">현황</button><button class="btn ghost sm" type="button" data-a="edit" data-i="${i}">수정</button><button class="btn ghost sm" type="button" data-a="del" data-i="${i}">삭제</button></div></div>`; }).join('')
    : `<div class="panel" style="padding:24px;color:var(--muted)">아직 만든 반이 없어요. 왼쪽에서 반 이름과 명렬을 넣고 <b>반 저장</b>을 누르세요.</div>`;
  $$('#cList button').forEach(b => b.addEventListener('click', async () => { const c = CLASSES[+b.dataset.i]; if (!c) return;
    if (b.dataset.a === 'grade'){ location.hash = '#grade'; setTimeout(() => { $('#gCls').value = c.name; fillPicker(); const nx = nextUngraded(c.name); if (nx) pickStudent(c.name, nx.sid); }, 30); }
    if (b.dataset.a === 'dash'){ location.hash = '#dashboard'; setTimeout(() => { $('#dCls').value = c.name; renderDash(); }, 30); }
    if (b.dataset.a === 'edit'){ cEditing = c.name; $('#cFormTitle').textContent = `${c.name} 수정`; $('#cName').value = c.name; $('#cMemo').value = c.memo || ''; $('#cRoster').value = c.students.map(s => `${s.sid} ${s.name}`).join('\n'); cCount(); window.scrollTo(0,0); }
    if (b.dataset.a === 'del'){ if (b.dataset.armed !== '1'){ b.dataset.armed = '1'; b.textContent = '한 번 더'; setTimeout(() => { b.dataset.armed = ''; b.textContent = '삭제'; }, 3000); return; }
      CLASSES = CLASSES.filter(x => x !== c); try { await Store.saveClasses(); toast(`${c.name} 반을 지웠어요 (채점 결과는 남아 있어요)`); } catch(e){ toast('지우지 못했어요'); } }
  }));
}
function cCount(){ const n = parseRoster($('#cRoster').value).length; $('#cCount').textContent = n ? `인식된 학생 ${n}명` : ''; }
$('#cRoster').addEventListener('input', cCount);
$('#cGen').addEventListener('click', () => { const g = +$('#cG').value || 1, c = +$('#cC').value || 1, n = Math.min(45, +$('#cN').value || 0);
  const names = $('#cRoster').value.split(/\r?\n/).map(l => l.replace(/^\s*\d+\s*/,'').trim());
  $('#cRoster').value = Array.from({length:n}, (_,i) => `${g}${String(c).padStart(2,'0')}${String(i+1).padStart(2,'0')} ${names[i] || ''}`.trim()).join('\n');
  if (!$('#cName').value.trim()) $('#cName').value = `${g}-${c}`; cCount(); });
$('#cNew').addEventListener('click', () => { cEditing = null; $('#cFormTitle').textContent = '새 반 만들기'; ['#cName','#cMemo','#cRoster'].forEach(s => $(s).value = ''); cCount(); });
$('#cSave').addEventListener('click', async () => {
  const name = $('#cName').value.trim(), students = parseRoster($('#cRoster').value);
  if (!name){ toast('반 이름을 넣어 주세요'); $('#cName').focus(); return; }
  if (!students.length){ toast('명렬을 한 줄에 "학번 이름"으로 넣어 주세요'); $('#cRoster').focus(); return; }
  const item = {name, memo: $('#cMemo').value.trim(), students};
  const i = CLASSES.findIndex(c => c.name === (cEditing || name));
  if (i >= 0) CLASSES[i] = item; else CLASSES.push(item);
  CLASSES.sort((a,b) => a.name.localeCompare(b.name, 'ko', {numeric:true}));
  try { await Store.saveClasses(); toast(`${name} 저장 · ${students.length}명`); cEditing = name; $('#cFormTitle').textContent = `${name} 수정`; } catch(e){ toast('저장하지 못했어요. 다시 눌러 주세요'); }
});
function classesChanged(){ $('#clsList').innerHTML = CLASSES.map(c => `<option value="${esc(c.name)}"></option>`).join(''); fillPicker(); if ($('#p-classes').classList.contains('on')) renderClasses(); }
function fillPicker(){
  const c = CLASSES.find(x => x.name === $('#gCls').value.trim()), wrap = $('#gPickWrap'), sel = $('#gPick');
  if (!c){ wrap.hidden = true; return; } wrap.hidden = false; const cur = $('#gId').value.trim();
  sel.innerHTML = `<option value="">— ${esc(c.name)} 학생 선택 (${c.students.length}명) —</option>` + c.students.map(st => { const r = Store.recs.get(keyOf(st.sid));
    return `<option value="${esc(st.sid)}" ${st.sid === cur ? 'selected' : ''}>${r ? '✓' : '　'} ${esc(st.sid)} ${esc(st.name)}${r ? ` · ${totalOf(r.levels)}점` : ''}</option>`; }).join('');
}
function nextUngraded(cls, after){ const c = CLASSES.find(x => x.name === cls); if (!c) return null; const i = after ? c.students.findIndex(s => s.sid === after) : -1;
  const rest = [...c.students.slice(i+1), ...c.students.slice(0, Math.max(0,i))]; return rest.find(s => !Store.recs.has(keyOf(s.sid))) || null; }
function pickStudent(cls, sid){
  const c = CLASSES.find(x => x.name === cls), st = c?.students.find(s => s.sid === sid), rec = Store.recs.get(keyOf(sid));
  if (rec){ loadIntoGrader(rec); $('#gCls').value = cls || rec.cls; }
  else { resetGrade(true); $('#gCls').value = cls || ''; $('#gId').value = sid; $('#gName').value = st?.name || ''; renderCrit(); gStatus(`<b>${esc(sid)} ${esc(st?.name || '')}</b> 채점 준비 · 연구 노트 사진을 올려 주세요.`); }
  fillPicker();
}
$('#gCls').addEventListener('input', fillPicker);
$('#gPick').addEventListener('change', e => { if (e.target.value) pickStudent($('#gCls').value.trim(), e.target.value); });

/* ================= content editor (내용 편집) ================= */
let draft = null, lastSaved = null, eDirtyFlag = false, eTarget = '0', eSel = 0, eClean = null, ePrevT = 0;
const deep = o => JSON.parse(JSON.stringify(o));
const toEdit = h => String(h ?? '').replace(/<br\s*\/?>/g,'\n').replace(/<em>(.*?)<\/em>/g,'**$1**').replace(/<[^>]+>/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&');
const fromEdit = t => esc(t).replace(/\*\*(.+?)\*\*/g,'<em>$1</em>').replace(/\n/g,'<br>');
function currentContent(){ return {v:1, deck: deep(DECK), home: {...HOME}, missions: deep(MISSIONS), setuk: {...SETUK}}; }
function addIdeasSlide(D){ if (D.some(L => L.slides.some(x => x.comp === 'ideas'))) return; const L = D.find(L => L.n === 2) || D[1]; if (!L) return; const i = L.slides.findIndex(x => x.comp === 'scamper'); L.slides.splice(i >= 0 ? i+1 : L.slides.length, 0, deep(DECK_DEFAULT[1].slides.find(x => x.comp === 'ideas'))); }
function applyContent(c, remote){
  if (!c || !Array.isArray(c.deck)) return;
  lastSaved = deep(c); if (c.setuk) SETUK = {...SETUK_DEFAULT, ...c.setuk};
  DECK = deep(c.deck); addIdeasSlide(DECK); HOME = {...HOME_DEFAULT, ...(c.home || {})}; if (Array.isArray(c.missions) && c.missions.length) MISSIONS = deep(c.missions);
  if (curL >= DECK.length) curL = 0; if (curS >= DECK[curL].slides.length) curS = 0;
  renderLsel(); renderHomeText();
  const h = location.hash.slice(1);
  if (h === 'slides') renderSlide(); else if (h === 'home' || !h) route();
  if (remote && h === 'edit' && !eDirtyFlag){ draft = deep(lastSaved); renderEditor(); }
}
const SLIDE_KINDS = {title:'제목', statement:'큰 문장', cards:'카드 4개', steps:'단계 5개', activity:'활동 + 타이머', embed:'도구·영상'};
const COMP_OPTS = [['model','3D 발명품 모델'],['proj','투상법 3가지 비교'],['iso','등각 투상도 3단계'],['scamper','스캠퍼 휠'],['gacha','아이디어 뽑기'],['missions','미션 지도'],['rubric','평가 기준'],['ideas','재료 힌트 · 발명품 예시 12'],['video:v1','영상 · 문제 해결 4단계'],['video:v2','영상 · 등각 투상도'],['video:v3','영상 · 우드락 안전']];
const TEMPL = {
  title: () => ({k:'title', e:'○차시', h:'새 제목', sub:''}),
  statement: () => ({k:'statement', h:'여기에 **큰 문장**', sub:''}),
  cards: () => ({k:'cards', e:'', h:'새 카드 슬라이드', cards:[['1','항목','설명'],['2','항목','설명'],['3','항목','설명'],['4','항목','설명']]}),
  steps: () => ({k:'steps', e:'', h:'새 단계 슬라이드', steps:[['1','단계','설명'],['2','단계','설명'],['3','단계','설명'],['4','단계','설명'],['5','단계','설명']]}),
  activity: () => ({k:'activity', e:'MISSION', h:'활동', items:['할 일 1','할 일 2'], min:10}),
  embed: () => ({k:'embed', e:'', h:'새 도구 슬라이드', comp:'model'}),
};
function setDirty(v){ eDirtyFlag = v; $('#eDirty').textContent = v ? '저장하지 않은 변경 있음' : (lastSaved ? '저장됨' : '처음 내용'); $('#eDirty').className = 'mono' + (v ? ' dirty' : ''); }
function openEditor(){ if (!draft || !eDirtyFlag) draft = currentContent();
  $('#eTarget').innerHTML = `<option value="home">홈 화면 · 미션 이름</option>` + draft.deck.map((L,i) => `<option value="${i}">${L.n}차시 · ${esc(toEdit(L.t))}</option>`).join('');
  if (eTarget !== 'home' && !draft.deck[+eTarget]) eTarget = '0'; $('#eTarget').value = eTarget; setDirty(eDirtyFlag); renderEditor(); }
$('#eTarget').addEventListener('change', e => { eTarget = e.target.value; eSel = 0; renderEditor(); });
const inp = (id, label, val, attrs = '') => `<div class="field"><label for="${id}">${label}</label><input type="text" id="${id}" value="${esc(val)}" ${attrs}></div>`;
const txa = (id, label, val, h = 70) => `<div class="field"><label for="${id}">${label}</label><textarea id="${id}" style="min-height:${h}px">${esc(val)}</textarea></div>`;
function renderEditor(){
  const isHome = eTarget === 'home';
  $('#eAddRow').hidden = isHome;
  if (isHome){
    const H = draft.home; $('#eLesson').innerHTML = ''; $('#eSlides').innerHTML = '';
    $('#eForm').innerHTML = `<strong>홈 화면</strong><div class="two">${inp('hf_t1','큰 제목 1줄',H.t1)}${inp('hf_t2','큰 제목 2줄 (외곽선)',H.t2)}</div>${txa('hf_lede','소개 문장',H.lede,90)}${inp('hf_hand','손글씨 안내',H.hand)}
      <strong style="margin-top:6px">8개의 미션</strong>${draft.missions.map((m,i) => `<div class="crow"><input type="text" value="MISSION ${esc(m[0])}" disabled aria-label="미션 번호"><input type="text" id="mf_n${i}" value="${esc(toEdit(m[1]))}" aria-label="미션 ${m[0]} 이름"><input type="text" id="mf_s${i}" value="${esc(toEdit(m[2]))}" aria-label="미션 ${m[0]} 설명"></div>`).join('')}`;
    $$('#eForm input, #eForm textarea').forEach(el => el.addEventListener('input', () => {
      const H2 = draft.home; H2.t1 = $('#hf_t1').value; H2.t2 = $('#hf_t2').value; H2.lede = $('#hf_lede').value; H2.hand = $('#hf_hand').value;
      draft.missions.forEach((m,i) => { m[1] = fromEdit($('#mf_n'+i).value); m[2] = fromEdit($('#mf_s'+i).value); }); setDirty(true); previewSoon(); }));
    previewSoon(); return;
  }
  const L = draft.deck[+eTarget];
  $('#eLesson').innerHTML = `<div class="two">${inp('lf_t','차시 제목',toEdit(L.t))}${inp('lf_d','차시 부제',toEdit(L.d))}</div>`;
  $('#lf_t').addEventListener('input', e => { L.t = fromEdit(e.target.value); setDirty(true); previewSoon(); });
  $('#lf_d').addEventListener('input', e => { L.d = fromEdit(e.target.value); setDirty(true); });
  if (eSel >= L.slides.length) eSel = L.slides.length - 1;
  $('#eSlides').innerHTML = L.slides.map((sl,i) => `<div class="it"><button type="button" data-i="${i}" aria-current="${i === eSel}">${i+1}. [${SLIDE_KINDS[sl.k] || sl.k}] ${esc(toEdit(sl.h).replace(/\n/g,' ').slice(0,30))}</button><button class="ib" type="button" data-u="${i}" aria-label="위로">↑</button><button class="ib" type="button" data-d="${i}" aria-label="아래로">↓</button><button class="ib" type="button" data-x="${i}" aria-label="삭제">✕</button></div>`).join('');
  $$('#eSlides [data-i]').forEach(b => b.addEventListener('click', () => { eSel = +b.dataset.i; renderEditor(); }));
  $$('#eSlides [data-u]').forEach(b => b.addEventListener('click', () => { const i = +b.dataset.u; if (i > 0){ [L.slides[i-1], L.slides[i]] = [L.slides[i], L.slides[i-1]]; eSel = i-1; setDirty(true); renderEditor(); } }));
  $$('#eSlides [data-d]').forEach(b => b.addEventListener('click', () => { const i = +b.dataset.d; if (i < L.slides.length-1){ [L.slides[i+1], L.slides[i]] = [L.slides[i], L.slides[i+1]]; eSel = i+1; setDirty(true); renderEditor(); } }));
  $$('#eSlides [data-x]').forEach(b => b.addEventListener('click', () => { if (L.slides.length <= 1){ toast('슬라이드가 하나는 있어야 해요'); return; } if (b.dataset.armed !== '1'){ b.dataset.armed = '1'; b.textContent = '?'; setTimeout(() => { b.dataset.armed = ''; b.textContent = '✕'; }, 2500); return; } L.slides.splice(+b.dataset.x, 1); eSel = Math.max(0, eSel-1); setDirty(true); renderEditor(); }));
  const sl = L.slides[eSel], f = [];
  f.push(`<strong>${eSel+1}번 슬라이드 · ${SLIDE_KINDS[sl.k]}</strong>`);
  if (sl.k !== 'statement') f.push(inp('sf_e','작은 제목 (주황색 윗줄)', toEdit(sl.e)));
  f.push(sl.k === 'title' || sl.k === 'statement' ? txa('sf_h', sl.k === 'statement' ? '큰 문장 (줄바꿈 가능, **강조**)' : '제목 (줄바꿈 가능)', toEdit(sl.h), 90) : inp('sf_h','제목', toEdit(sl.h)));
  if (sl.k === 'title' || sl.k === 'statement') f.push(inp('sf_sub','아래 손글씨 문장', toEdit(sl.sub)));
  if (sl.k === 'cards') f.push(`<span class="mono">카드 4개 — 큰 글자 · 이름 · 설명</span>` + sl.cards.map((c,i) => `<div class="crow">${[0,1,2].map(j => `<input type="text" id="sf_c${i}_${j}" value="${esc(toEdit(c[j]))}" aria-label="카드 ${i+1} ${['큰 글자','이름','설명'][j]}">`).join('')}</div>`).join(''));
  if (sl.k === 'steps') f.push(`<span class="mono">단계 5개 — 번호 · 이름 · 설명</span>` + sl.steps.map((c,i) => `<div class="crow">${[0,1,2].map(j => `<input type="text" id="sf_c${i}_${j}" value="${esc(toEdit(c[j]))}" aria-label="단계 ${i+1} ${['번호','이름','설명'][j]}">`).join('')}</div>`).join(''));
  if (sl.k === 'activity') f.push(txa('sf_items','할 일 목록 (한 줄에 하나)', sl.items.map(toEdit).join('\n'), 110) + inp('sf_min','타이머 (분)', sl.min, 'inputmode="numeric"'));
  if (sl.k === 'embed') f.push(`<div class="field"><label for="sf_comp">넣을 도구·영상</label><select id="sf_comp">${COMP_OPTS.map(o => `<option value="${o[0]}" ${o[0] === sl.comp ? 'selected' : ''}>${o[1]}</option>`).join('')}</select></div>` + txa('sf_side','옆에 띄울 설명 (한 줄에 하나, 비우면 도구가 넓게)', (sl.side || []).map(toEdit).join('\n'), 80));
  f.push(txa('sf_note','교사 메모 (슬라이드 아래에만 보임)', sl.note || '', 60));
  $('#eForm').innerHTML = f.join('');
  const upd = () => {
    if ($('#sf_e')) sl.e = fromEdit($('#sf_e').value);
    sl.h = fromEdit($('#sf_h').value);
    if ($('#sf_sub')) sl.sub = fromEdit($('#sf_sub').value);
    const grid = sl.k === 'cards' ? sl.cards : sl.k === 'steps' ? sl.steps : null;
    if (grid) grid.forEach((c,i) => [0,1,2].forEach(j => { c[j] = fromEdit($(`#sf_c${i}_${j}`).value); }));
    if (sl.k === 'activity'){ sl.items = $('#sf_items').value.split('\n').map(x => x.trim()).filter(Boolean).map(fromEdit); sl.min = Math.max(1, Math.min(90, parseInt($('#sf_min').value) || 10)); }
    if (sl.k === 'embed'){ sl.comp = $('#sf_comp').value; const side = $('#sf_side').value.split('\n').map(x => x.trim()).filter(Boolean).map(fromEdit); if (side.length) sl.side = side; else delete sl.side; }
    const nt = $('#sf_note').value.trim(); if (nt) sl.note = nt; else delete sl.note;
    setDirty(true); previewSoon();
    const lb = $(`#eSlides [data-i="${eSel}"]`); if (lb) lb.textContent = `${eSel+1}. [${SLIDE_KINDS[sl.k]}] ${toEdit(sl.h).replace(/\n/g,' ').slice(0,30)}`;
  };
  $$('#eForm input, #eForm textarea, #eForm select').forEach(el => el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', upd));
  previewSoon();
}
function previewSoon(){ clearTimeout(ePrevT); ePrevT = setTimeout(renderPreview, 200); }
function renderPreview(){
  const st = $('#ePrev'), wrap = $('#ePrevWrap'); if (eClean){ eClean(); eClean = null; }
  if (eTarget === 'home'){ const H = draft.home;
    st.innerHTML = `<div class="slide title"><span class="eyebrow">홈 화면 미리 보기</span><h2 style="font-size:120px">${esc(H.t1)}<br><span style="color:transparent;-webkit-text-stroke:3px var(--cyan)">${esc(H.t2)}</span><span style="color:var(--accent)">.</span></h2><p style="max-width:1000px">${esc(H.lede)}</p><p class="hand">${esc(H.hand)}</p></div>`;
    $('#ePrevInfo').textContent = '홈 화면 첫 부분';
  } else { const L = draft.deck[+eTarget], sl = L.slides[eSel];
    st.innerHTML = slideHTML(sl, L) + `<div class="tb"><span>INVENTOR LAB · ${L.n}차시 ${L.t}</span><span>${String(eSel+1).padStart(2,'0')} / ${String(L.slides.length).padStart(2,'0')}</span></div>`;
    eClean = mountAll(st); $('#ePrevInfo').textContent = `${L.n}차시 ${eSel+1}번 슬라이드 미리 보기`; }
  const r = wrap.getBoundingClientRect(), s = Math.min(r.width/1600, r.height/900) || .4; st.style.transform = `translate(${(r.width-1600*s)/2}px,${(r.height-900*s)/2}px) scale(${s})`;
}
new ResizeObserver(() => { if ($('#p-edit').classList.contains('on')) renderPreview(); }).observe($('#ePrevWrap'));
$('#eAdd').addEventListener('click', () => { const L = draft.deck[+eTarget]; const sl = TEMPL[$('#eAddKind').value](); L.slides.splice(eSel+1, 0, sl); eSel++; setDirty(true); renderEditor(); toast('슬라이드를 추가했어요'); });
$('#eSave').addEventListener('click', async () => { const b = $('#eSave'); b.disabled = true;
  try { await Store.saveContent(draft); applyContent(deep(draft)); setDirty(false); toast('저장했어요 · 수업 슬라이드와 홈에 반영됐어요'); }
  catch(e){ toast(e.code === 'invalid_argument' ? '저장 권한이 없어요' : '저장하지 못했어요. 다시 눌러 주세요'); } finally { b.disabled = false; } });
$('#eUndo').addEventListener('click', () => { draft = lastSaved ? deep(lastSaved) : currentContent(); setDirty(false); openEditor(); toast('마지막 저장 상태로 돌렸어요'); });
$('#eReset').addEventListener('click', () => { const b = $('#eReset'); if (b.dataset.armed !== '1'){ b.dataset.armed = '1'; b.textContent = '한 번 더 누르면 초기화'; setTimeout(() => { b.dataset.armed = ''; b.textContent = '처음 내용으로 초기화'; }, 3000); return; }
  b.dataset.armed = ''; b.textContent = '처음 내용으로 초기화'; draft = {v:1, deck: deep(DECK_DEFAULT), home: {...HOME_DEFAULT}, missions: deep(MISSIONS_DEFAULT)}; eSel = 0; setDirty(true); openEditor(); toast('처음 내용으로 바꿨어요. 저장을 눌러야 반영돼요'); });
$('#eOpen').addEventListener('click', () => { if (eTarget === 'home'){ location.hash = '#home'; return; } if (eDirtyFlag){ toast('먼저 저장해 주세요'); return; } curL = +eTarget; curS = eSel; location.hash = '#slides'; });

/* ================= 연결·세특 설정 ================= */
function renderSetup(){
  modeChanged();
  $('#sUrl').value = GAS.url || ''; $('#sCode').value = GAS.code || '';
  $('#sLen').value = String(SETUK.len); if (!$('#sLen').value) $('#sLen').value = '400';
  $('#sStyle').value = SETUK.style || ''; $('#sExtra').value = SETUK.extra || '';
}
function sStatus(t, cls = ''){ const el = $('#sStatus'); el.className = 'status ' + cls; el.innerHTML = t; }
$('#sTest').addEventListener('click', async () => { const keep = {...GAS}; GAS.url = $('#sUrl').value.trim(); GAS.code = $('#sCode').value.trim();
  sStatus('연결 확인 중…'); try { const r = await gas(GAS.code ? 'ping' : 'content'); sStatus(GAS.code ? `연결됨 · AI: ${esc(r.provider || '')} ${esc(r.model || '')}` : '학생용 연결 확인됨 (교사 코드 없음)', 'ok'); }
  catch(e){ sStatus('연결 실패: ' + esc(e.message) + ' — 주소가 /exec로 끝나는지, 액세스가 "모든 사용자"인지 확인해 주세요.', 'err'); }
  finally { Object.assign(GAS, keep); } });
$('#sSave').addEventListener('click', async () => { GAS.url = $('#sUrl').value.trim(); GAS.code = $('#sCode').value.trim();
  try { localStorage.setItem('invlab-gas', JSON.stringify(GAS)); } catch(e){}
  if (!GAS.url){ sStatus('주소를 지웠어요. 브라우저 저장 모드로 돌아가요.'); Store.recs.clear(); Store.useLocal(); modeChanged(); return; }
  sStatus('연결 중…'); await Store.initGas(); sStatus(Store.mode === 'gas' ? '구글 시트와 연결했어요. 반 설정·채점 결과가 시트에 저장돼요.' : '학생용으로 연결했어요.', 'ok'); });
$('#sOut').addEventListener('click', () => { GAS.code = ''; try { localStorage.setItem('invlab-gas', JSON.stringify(GAS)); } catch(e){} $('#sCode').value = ''; Store.recs.clear(); CLASSES = []; if (GAS.url) Store.initGas(); else Store.useLocal(); sStatus('이 기기에서 교사 코드를 지웠어요.'); });
$('#sSetukSave').addEventListener('click', async () => {
  SETUK = {len: +$('#sLen').value || 400, style: $('#sStyle').value.trim().slice(0, 3000), extra: $('#sExtra').value.trim().slice(0, 300)};
  const c = currentContent();
  try { await Store.saveContent(c); lastSaved = deep(c); $('#sSetukNote').textContent = '저장했어요'; toast('세특 설정을 저장했어요'); }
  catch(e){ $('#sSetukNote').textContent = '이 기기에만 적용돼요 (저장 실패)'; }
});

/* ================= 세특 일괄 · NEIS 복사 ================= */
let batchCtl = null;
$('#dBatch').addEventListener('click', async () => {
  if (batchCtl){ batchCtl.abort(); return; }
  const mode = await aiMode(false); if (!mode){ toast('AI 연결이 없어요 · 연결 설정을 확인해 주세요'); return; }
  const cls = $('#dCls').value, todo = recs().filter(r => !r.pending && !r.demo && !r.setuk && Object.keys(r.levels || {}).length && (!cls || r.cls === cls));
  if (!todo.length){ toast('세특이 비어 있는 채점 학생이 없어요'); return; }
  const b = $('#dBatch'); batchCtl = new AbortController(); b.textContent = '중지'; let n = 0;
  try { for (const r of todo){ if (batchCtl.signal.aborted) break; n++; dStatus(`세특 작성 중 ${n}/${todo.length} · ${r.sid} ${r.name || ''}`);
      const t = await aiText(mode, setukPrompt(r) + (r.ai?.facts?.length ? `\n(확인된 사실: ${r.ai.facts.join(' / ')})` : ''), null, batchCtl.signal);
      const { key, pending, ...rest } = r; await Store.save({...rest, setuk: String(t).trim()}); }
    dStatus(''); toast(`세특 ${n}명 작성 완료`); }
  catch(e){ dStatus(''); toast(e.name === 'AbortError' || e.code === 'cancelled' ? `중지했어요 (${n-1}명 완료)` : '일괄 작성 중 문제가 생겼어요'); }
  finally { batchCtl = null; b.textContent = '빈 세특 AI 일괄 작성'; }
});
$('#dNeis').addEventListener('click', async () => {
  const cls = $('#dCls').value, list = recs().filter(r => !r.pending && !r.demo && r.setuk && (!cls || r.cls === cls)).sort((a,b) => String(a.sid).localeCompare(String(b.sid), 'ko', {numeric:true}));
  if (!list.length){ toast('복사할 세특이 없어요'); return; }
  const txt = list.map(r => `${r.sid}\t${r.name || ''}\t${r.setuk.replace(/\s*\n\s*/g,' ')}`).join('\n');
  try { await navigator.clipboard.writeText(txt); toast(`${list.length}명 세특 복사 · 엑셀에 붙여넣으면 학번·이름·세특 3열`); } catch(e){ toast('복사가 막혀 있어요'); }
});

/* ================= router ================= */
const VIEWS = ['home','slides','videos','grade','dashboard'], SUBS = ['dashboard','classes','edit','setup'];
function route(){
  const h = location.hash.slice(1), sub = SUBS.includes(h) ? h : null;
  const v = sub ? 'dashboard' : VIEWS.includes(h) ? h : 'home';
  if (sub){ SUBS.forEach(x => $('#p-'+x).classList.toggle('on', x === sub)); $$('.subtabs a').forEach(a => a.setAttribute('aria-current', a.getAttribute('href') === '#'+sub ? 'page' : 'false')); }
  if (eClean && sub !== 'edit'){ eClean(); eClean = null; }
  if (sub === 'classes') renderClasses();
  if (sub === 'edit') openEditor();
  if (sub === 'setup') renderSetup();
  VIEWS.forEach(x => $('#v-'+x).classList.toggle('on', x === v));
  $$('.tabs a').forEach(a => a.setAttribute('aria-current', a.getAttribute('href') === '#'+v ? 'page' : 'false'));
  if (homeClean){ homeClean(); homeClean = null; }
  if (slideClean && v !== 'slides'){ slideClean(); slideClean = null; stage.innerHTML = ''; }
  if (vClean && v !== 'videos'){ vClean(); vClean = null; }
  if (v === 'home'){ const cl = [makeModel($('[data-model="hero"]')), mountAll($('#v-home'))]; homeClean = () => cl.forEach(f => f && f()); }
  if (v === 'slides') renderSlide();
  if (v === 'videos'){ renderVList(); if (vCur) showVideo(); }
  if (v === 'grade'){ renderCrit(); fillPicker(); }
  if (v === 'dashboard' && sub === 'dashboard') renderDash();
  window.scrollTo(0,0);
}
window.addEventListener('hashchange', route);
route();
Store.init();

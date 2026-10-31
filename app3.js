/* ================= backend: claude.ai(db) · Google Sheets(GAS) · browser ================= */
const GAS_DEFAULT_URL = 'https://script.google.com/macros/s/AKfycbxBH31C6qJFaByfQEIUGnpJh4ob6qbqYxZ8IvBJWZ68jP8Ttspkj3wrCXf1n7cr-oW4JA/exec';
const GAS = (() => { let g = {}; try { g = JSON.parse(localStorage.getItem('invlab-gas') || '{}'); } catch(e){} if (!g.url) g.url = GAS_DEFAULT_URL; return g; })();
async function gas(action, extra = {}, signal){
  if (!GAS.url) throw new Error('구글 시트 주소가 없어요');
  const res = await fetch(GAS.url, {method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body: JSON.stringify({action, code: GAS.code || '', ...extra}), redirect:'follow', signal});
  let j; try { j = await res.json(); } catch(e){ throw new Error('구글 시트 응답을 읽지 못했어요 (배포 설정 확인)'); }
  if (!j.ok) throw new Error(j.error === 'auth' ? '교사 코드가 맞지 않아요' : String(j.error || '알 수 없는 오류'));
  return j;
}
const recPayload = rec => ({...rec, total: totalOf(rec.levels), scores: Object.fromEntries(CRIT.map(c => [c.k, rec.levels?.[c.k] ? scoreOf(c.k, rec.levels[c.k]) : '']))});
const Store = { db:null, col:null, uid:null, mode:'memory', recs:new Map(), subs:[], media:null, mediaRef:null,
  async init(){
    const [db, user] = await Promise.all([use('db'), use('user')]);
    this.user = user;
    if (db && user){ try { this.uid = await user.id(); } catch(e){} }
    if (db && this.uid){
      this.db = db; this.mode = 'db'; this.col = db.collection('data/users/' + this.uid);
      let timer = setTimeout(() => { dStatus('저장소에 아직 연결되지 않았어요. 잠시 후 다시 확인해 주세요.'); }, 10000);
      this.col.onSnapshot(snap => { clearTimeout(timer); this.recs.clear(); snap.docs.forEach(d => { if (d.id.startsWith('s-')) this.recs.set(d.id, {...d.data()}); if (d.id === 'classes') { try { CLASSES = JSON.parse(d.data().json || '[]'); } catch(e){} } }); dStatus(''); classesChanged(); renderDash(); },
        e => { clearTimeout(timer); dStatus('저장소를 불러오지 못했어요 (' + e.code + '). 이 브라우저에만 임시 저장합니다.'); this.useLocal(); });
      this.contentRef = db.doc('lesson/content');
      this.contentRef.onSnapshot(s => { if (s.exists){ try { applyContent(JSON.parse(s.data().json), true); } catch(e){} } }, () => {});
      this.mediaRef = db.doc('lesson/media');
      this.mediaRef.onSnapshot(s => { const it = s.exists ? (s.data().items || []) : []; setMedia(it); }, () => {});
    } else if (GAS.url) await this.initGas();
    else this.useLocal();
    modeChanged();
  },
  async initGas(){
    this.mode = GAS.code ? 'gas' : 'gas-public'; modeChanged();
    try { const r = await gas('content'); if (r.content) applyContent(r.content, true); } catch(e){}
    if (!GAS.code){ renderDash(); return; }
    dStatus('구글 시트에서 불러오는 중…');
    try { const r = await gas('load'); this.recs.clear(); (r.records || []).forEach(x => this.recs.set(keyOf(x.sid), x)); CLASSES = r.classes || []; if (r.content) applyContent(r.content, true); dStatus(''); }
    catch(e){ dStatus('구글 시트에 연결하지 못했어요: ' + e.message); }
    classesChanged(); renderDash();
  },
  useLocal(){ this.mode = 'local'; try { const raw = JSON.parse(localStorage.getItem('invlab-grades') || '{}'); Object.entries(raw).forEach(([k,v]) => this.recs.set(k, v)); CLASSES = JSON.parse(localStorage.getItem('invlab-classes') || '[]'); const c = localStorage.getItem('invlab-content'); if (c) applyContent(JSON.parse(c), true); } catch(e){} classesChanged(); renderDash(); },
  persistLocal(){ try { localStorage.setItem('invlab-grades', JSON.stringify(Object.fromEntries(this.recs))); } catch(e){} },
  async saveClasses(){
    if (this.mode === 'db') await this.col.doc('classes').set({json: JSON.stringify(CLASSES), updatedAt: new Date().toISOString()});
    else if (this.mode === 'gas') await gas('saveClasses', {classes: CLASSES});
    else { try { localStorage.setItem('invlab-classes', JSON.stringify(CLASSES)); } catch(e){} }
    classesChanged(); renderDash(); },
  async saveContent(c){ const json = JSON.stringify(c);
    if (this.mode === 'db' && this.contentRef) await this.contentRef.set({json, updatedAt: new Date().toISOString()});
    else if (this.mode === 'gas') await gas('saveContent', {content: c});
    else { try { localStorage.setItem('invlab-content', json); } catch(e){} } },
  async save(rec){
    const key = keyOf(rec.sid);
    rec.updatedAt = new Date().toISOString();
    if (this.mode === 'db'){ this.recs.set(key, rec); await this.col.doc(key).set(rec); }
    else if (this.mode === 'gas'){ await gas('saveRecord', {rec: recPayload(rec)}); this.recs.set(key, rec); renderDash(); }
    else { this.recs.set(key, rec); this.persistLocal(); renderDash(); }
    return key;
  },
  async remove(key){ const rec = this.recs.get(key);
    if (this.mode === 'db') await this.col.doc(key).delete();
    else if (this.mode === 'gas') await gas('deleteRecord', {sid: rec?.sid});
    this.recs.delete(key); if (this.mode !== 'db'){ this.persistLocal(); renderDash(); } },
};
const MODE_TXT = {db:'claude.ai 모드 · 선생님 Claude 계정에 저장 · AI 사용 가능', gas:'구글 시트 모드 · 시트에 저장 · AI(API) 사용 가능', 'gas-public':'학생용 모드 · 수업 화면만 (교사 코드 없음)', local:'브라우저 저장 모드 · 이 컴퓨터에만 저장 · AI 없음', memory:'불러오는 중'};
function modeChanged(){
  const teacherHidden = Store.mode === 'gas-public';
  $$('.tabs a[href="#grade"], .tabs a[href="#dashboard"]').forEach(a => a.hidden = teacherHidden);
  const tl = $('#teacherLink'); if (tl) tl.hidden = !teacherHidden;
  const el = $('#modeNow'); if (el) el.textContent = MODE_TXT[Store.mode] || Store.mode;
  const g = $('#setupGas'); if (g) g.hidden = Store.mode === 'db';
}

/* ================= AI (claude.ai sample · GAS → Gemini/Claude API) ================= */
async function ensureSample(){ if (sample === null){ sample = await use('sample'); if (sample) sLimits = await sample.limits().catch(() => null); } return sample; }
async function aiMode(needImages){
  if (Store.mode === 'gas') return 'gas';
  const s = await ensureSample(); if (!s) return null;
  if (needImages && !sLimits?.images) return null;
  return 'claude';
}
function parseLoose(t){ t = String(t || '').trim(); try { return JSON.parse(t); } catch(e){}
  const f = t.match(/```(?:json)?\s*([\s\S]*?)```/); if (f){ try { return JSON.parse(f[1]); } catch(e){} }
  const a = t.indexOf('{'), b = t.lastIndexOf('}'); if (a >= 0 && b > a){ try { return JSON.parse(t.slice(a, b+1)); } catch(e){} }
  const err = new Error('invalid_json'); err.code = 'invalid_json'; throw err; }
async function toB64(files){ return Promise.all(files.map(f => new Promise((ok, no) => { const img = new Image(), u = URL.createObjectURL(f);
  img.onload = () => { const m = 1500, k = Math.min(1, m/Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width*k); c.height = Math.round(img.height*k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u); ok(c.toDataURL('image/jpeg', .82).split(',')[1]); };
  img.onerror = () => { URL.revokeObjectURL(u); no(Object.assign(new Error('image'), {code:'image_rejected'})); }; img.src = u; }))); }
async function aiJSON(mode, prompt, images, signal){
  if (mode === 'gas'){ const r = await gas('ai', {prompt: prompt + '\n\n반드시 JSON만 출력하세요.', images: images ? await toB64(images) : [], json: true}, signal); return parseLoose(r.text); }
  return sample.json(prompt, images ? {images, signal, modelTier:'default'} : {signal, modelTier:'default'});
}
async function aiText(mode, prompt, onText, signal){
  if (mode === 'gas'){ const r = await gas('ai', {prompt, images: [], json: false}, signal); onText && onText(r.text); return r.text; }
  const { text } = await sample(prompt, {cache:false, signal, onText: onText ? ({text}) => onText(text) : undefined}); return text;
}

/* ================= 과세특 ================= */
let SETUK = {len: 400, style: '', extra: ''};
const SETUK_DEFAULT = {...SETUK};
function setukRules(){
  return `[과목별 세부능력 및 특기사항 작성 기준]
- 과목: 기술·가정(중학교 1학년) / 단원: 기술적 문제 해결과 발명 — 생활 속 불편함을 해결하는 발명품 모형 제작 프로젝트(개인)
- 관련 성취기준: [9기가03-03] 문제 확인, 확산적·수렴적 사고로 해결방안 탐색·선정 / [9기가03-04] 해결 방안 시각화(스케치·등각 투상도), 도구를 활용한 모형 제작·평가 / [9기가03-06] 지식재산권의 창출·보호·활용
- 학생 이름·학번을 쓰지 않음. 명사형 종결(~함, ~임, ~보임)의 학교생활기록부 문체.
- 학생이 실제로 한 활동(정한 문제, 떠올린 아이디어, 선정 근거, 도면, 모형, 개선 방안, 지식재산권)을 근거로 구체적으로 쓰고, 성장과 역량(문제 해결력, 창의성, 표현 능력, 협업·의사소통)을 드러냄.
- 확인되지 않은 내용은 지어내지 않음. 과장 표현·교외 수상·사교육·특정 기관 언급 금지.
- 분량: 공백 포함 ${SETUK.len}자 내외, 한 문단 (NEIS 500자 이내).
${SETUK.style ? `- 선생님 문체 예시(문체와 표현 방식만 참고, 내용은 따라 쓰지 말 것):\n${SETUK.style}\n` : ''}${SETUK.extra ? `- 추가 지시: ${SETUK.extra}\n` : ''}`;
}
function setukPrompt(r){
  return `${setukRules()}
[이 학생의 수행평가 결과]
${CRIT.map(c => `- ${c.name}: ${r.levels?.[c.k] || '미평가'}${r.evidence?.[c.k] ? ` / 근거: ${r.evidence[c.k]}` : ''}`).join('\n')}
- 잘한 점: ${r.feedback?.good || ''}
- 다음 단계: ${r.feedback?.next || ''}

위 기준에 맞는 세특 문단만 출력하세요.`;
}
const neisBytes = t => [...String(t || '')].reduce((a, ch) => a + (ch === '\n' ? 2 : ch.charCodeAt(0) > 127 ? 3 : 1), 0);
function setukCount(){ const t = $('#fbSetuk').value, b = neisBytes(t), el = $('#setukCnt'); el.textContent = `${t.length}자 · ${b}바이트 / NEIS 1500바이트`; el.style.color = b > 1500 ? 'var(--bad)' : 'var(--muted)'; }

function dStatus(t){ const el = $('#dDemo'); if (t) el.innerHTML = `<div class="status err">${esc(t)}</div>`; else if (el.querySelector('.status.err')) el.innerHTML = ''; }

/* ================= videos ================= */
let mediaItems = [], vClean = null, vCur = 'v1';
function setMedia(it){ mediaItems = it; renderVList(); }
function renderVList(){
  const base = Object.entries(VIDS).map(([k,v]) => `<button type="button" data-v="${k}" aria-current="${vCur === k}"><span class="ic">MOTION</span><span><strong>${v.title}</strong><span>모션 영상 · ${Math.floor(v.dur/60)}:${String(v.dur%60).padStart(2,'0')} · 자막</span></span></button>`);
  const extra = mediaItems.concat(extraVideos.filter(x => x.local)).map((m,i) => m.kind === 'link'
    ? `<a href="${esc(m.url)}" target="_blank" rel="noopener"><span class="ic">LINK</span><span><strong>${esc(m.title)}</strong><span>새 창에서 열기 ↗</span></span></a>`
    : `<button type="button" data-file="${esc(m.url)}" data-title="${esc(m.title)}"><span class="ic">VIDEO</span><span><strong>${esc(m.title)}</strong><span>${m.local ? '이 화면에서만 재생 (저장 안 됨)' : '업로드한 영상'}</span></span></button>`);
  $('#vList').innerHTML = base.concat(extra).join('');
  $$('#vList button[data-v]').forEach(b => b.addEventListener('click', () => { vCur = b.dataset.v; showVideo(); renderVList(); }));
  $$('#vList button[data-file]').forEach(b => b.addEventListener('click', () => { vClean?.(); vClean = null; vCur = ''; $('#vMain').innerHTML = `<div class="vp"><video src="${b.dataset.file}" controls style="width:100%;aspect-ratio:16/9;background:#000"></video></div><h3 style="margin-top:12px">${b.dataset.title}</h3>`; renderVList(); }));
}
function showVideo(){ vClean?.(); $('#vMain').innerHTML = `<div data-comp="video:${vCur}"></div><h3 style="margin-top:12px">${VIDS[vCur].title}</h3><p style="color:var(--muted);margin:4px 0 0">수업 슬라이드에도 들어 있어요. 재생 위치 막대로 원하는 장면으로 이동할 수 있어요.</p>`; vClean = mountAll($('#vMain')); }
$('#vAddLink').addEventListener('click', async () => {
  const title = $('#vTitle').value.trim() || '추가 영상', url = $('#vUrl').value.trim();
  if (!/^https?:\/\//.test(url)) { toast('http로 시작하는 링크를 넣어 주세요'); return; }
  const item = {kind:'link', title, url};
  if (Store.mediaRef){ try { await Store.mediaRef.set({items: mediaItems.concat(item)}); toast('링크를 추가했어요'); } catch(e){ mediaItems.push(item); renderVList(); toast('이 화면에만 추가했어요 (저장 권한 없음)'); } }
  else { mediaItems.push(item); renderVList(); toast('이 화면에만 추가했어요'); }
  $('#vTitle').value = ''; $('#vUrl').value = '';
});
$('#vFile').addEventListener('change', async e => {
  const f = e.target.files[0]; if (!f) return; const title = $('#vTitle').value.trim() || f.name.replace(/\.[^.]+$/,'');
  const assets = await use('assets');
  if (assets && Store.mediaRef){ $('#vNote').textContent = '업로드 중…';
    try { const r = await assets.upload(f); await Store.mediaRef.set({items: mediaItems.concat({kind:'file', title, url: r.url, assetId: r.id})}); $('#vNote').textContent = '업로드 완료'; toast('영상을 올렸어요'); }
    catch(err){ $('#vNote').textContent = '업로드하지 못했어요. 이 화면에서만 재생합니다.'; extraVideos.push({kind:'file', local:true, title, url: URL.createObjectURL(f)}); renderVList(); } }
  else { extraVideos.push({kind:'file', local:true, title, url: URL.createObjectURL(f)}); renderVList(); $('#vNote').textContent = '이 화면에서만 재생돼요 (저장 기능을 쓸 수 없는 환경)'; }
  e.target.value = '';
});

/* ================= grading ================= */
let gFiles = [], gLevels = {}, gEvidence = {}, gAI = {}, gCtl = null, sample = null, sLimits = null;
function renderCrit(){
  $('#gCrit').innerHTML = CRIT.map(c => `<div class="crit" style="--c:${c.c}"><div class="cn">${c.k}. ${c.name}<small>${c.m} · ${c.pts[0]}점</small></div>
    <div><div class="lv">${LV.map((l,i) => `<button type="button" data-k="${c.k}" data-l="${l}" aria-pressed="${gLevels[c.k] === l}" title="${esc(c.lv[i])}">${l} ${c.pts[i]}</button>`).join('')}</div>
    <div class="ev">${gEvidence[c.k] ? `<span class="ai-tag">AI 근거 ·</span> ${esc(gEvidence[c.k])}` : `<span style="color:var(--muted)">상: ${esc(c.lv[0])}</span>`}</div></div>
    <div class="pt">${gLevels[c.k] ? scoreOf(c.k, gLevels[c.k]) : '–'}</div></div>`).join('');
  $$('#gCrit .lv button').forEach(b => b.addEventListener('click', () => { const k = b.dataset.k; gLevels[k] = gLevels[k] === b.dataset.l ? undefined : b.dataset.l; renderCrit(); }));
  $('#gTotal').textContent = totalOf(gLevels);
  const id = $('#gId').value.trim(), nm = $('#gName').value.trim(); $('#gWho').textContent = id || nm ? `${id} ${nm}` : '학생 미지정';
}
['#gId','#gName'].forEach(s => $(s).addEventListener('input', renderCrit));
function addFiles(list){ [...list].filter(f => f.type.startsWith('image/')).forEach(f => gFiles.push({f, url: URL.createObjectURL(f)})); renderThumbs(); }
function renderThumbs(){ $('#gThumbs').innerHTML = gFiles.map((x,i) => `<figure><img src="${x.url}" alt="${i+1}쪽"><figcaption>${i+1}쪽</figcaption><button type="button" data-i="${i}" aria-label="${i+1}쪽 빼기">×</button></figure>`).join('');
  $$('#gThumbs button').forEach(b => b.addEventListener('click', () => { URL.revokeObjectURL(gFiles[+b.dataset.i].url); gFiles.splice(+b.dataset.i, 1); renderThumbs(); })); }
const drop = $('#drop');
['dragenter','dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave','drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', e => addFiles(e.dataTransfer.files));
$('#gFiles').addEventListener('change', e => { addFiles(e.target.files); e.target.value = ''; });
function gStatus(t, cls=''){ const s = $('#gStatus'); s.className = 'status ' + cls; s.innerHTML = t; }
const RUBRIC_TXT = CRIT.map(c => `${c.k}. ${c.name} (${c.m}, 만점 ${c.pts[0]}점)\n` + LV.map((l,i) => `  - ${l}(${c.pts[i]}점): ${c.lv[i]}`).join('\n')).join('\n');
function gradePrompt(n, part, of){ return `당신은 중학교 기술·가정 교사의 채점 보조자입니다. 첨부한 이미지 ${n}장은 학생 1명의 수행평가 'INVENTOR LAB 발명가 연구 노트'를 스캔한 것입니다${of > 1 ? ` (전체 중 ${part}/${of} 묶음)` : ''}. 쪽 구성: 표지(MISSION 0), MISSION 1 불편함 수배서·문제 정의, MISSION 2 아이디어 팝콘·스캠퍼·BEST3, MISSION 3 PMI·평가 행렬·합격 아이디어, MISSION 4 프리핸드 스케치·부품 스펙, MISSION 5 등각 투상도, MISSION 6 재료표·재단 배치도·공정표·제작 일지, MISSION 7 셀프 심사·동료 의견·버전 2.0·모의 특허 출원서. 발명품 모형 사진이 있으면 F를 평가하고, 없으면 F는 null.

채점 기준표(4수준):
${RUBRIC_TXT}

규칙:
- 이미지에서 실제로 확인되는 내용만 근거로 삼고, 해당 미션 쪽이 이미지에 없으면 그 영역의 level은 null.
- 손글씨를 읽기 어려우면 그렇다고 근거에 적고 보수적으로 판단.
- evidence는 교사가 확인할 수 있도록 학생이 쓴 내용을 짧게 인용하거나 요약(한 문장, 60자 이내).
- feedback은 중학생에게 직접 하는 말투(~해요)로, good과 next는 각각 1~2문장, message는 1문장 응원.
- facts에는 세특 작성에 쓸 수 있는 구체적 사실(학생이 정한 문제, 대표 아이디어, 발명품 이름, 개선안, 선택한 권리 등)을 5개 이내 짧게.
${of === 1 ? `- setuk에는 아래 기준에 맞춘 과목별 세특 초안을 쓸 것.\n\n${setukRules()}` : ''}

다음 JSON만 출력:
{"scores":{"A":{"level":"상|중상|중|하|null","evidence":"..."},"B":{...},"C":{...},"D":{...},"E":{...},"F":{...},"G":{...}},"feedback":{"good":"...","next":"...","message":"..."},"facts":["..."]${of === 1 ? ',"setuk":"..."' : ''},"notes":"교사 참고 사항(판독 어려움 등)"}`; }
$('#gRun').addEventListener('click', async () => {
  if (!gFiles.length){ gStatus('먼저 연구 노트 사진을 올려 주세요.', 'err'); return; }
  const mode = await aiMode(true);
  if (!mode){ gStatus(Store.mode === 'local' || Store.mode === 'gas-public' ? 'AI 채점을 쓰려면 대시보드 → <a href="#setup">연결 설정</a>에서 구글 시트(GAS)를 연결하거나, claude.ai 링크로 열어 주세요. 지금은 오른쪽에서 직접 채점할 수 있어요.' : '이 화면에서는 이미지를 AI에 보낼 수 없어요. 직접 채점해 주세요.', 'err'); return; }
  const max = mode === 'gas' ? 12 : (sLimits.images.maxCount || 5), chunks = [];
  for (let i = 0; i < gFiles.length; i += max) chunks.push(gFiles.slice(i, i+max).map(x => x.f));
  gCtl = new AbortController(); $('#gRun').disabled = true; $('#gStop').hidden = false;
  const merged = {}, ev = {}, fbs = [], notes = [], facts = []; let setuk = '';
  try {
    for (let i = 0; i < chunks.length; i++){
      gStatus(`AI가 ${i+1}/${chunks.length} 묶음(${chunks[i].length}장)을 읽고 있어요… 보통 30초~1분 걸려요.`);
      const r = await aiJSON(mode, gradePrompt(chunks[i].length, i+1, chunks.length), chunks[i], gCtl.signal);
      const sc = r && r.scores || {};
      CRIT.forEach(c => { const v = sc[c.k]; if (v && LV.includes(v.level)){ merged[c.k] = v.level; ev[c.k] = String(v.evidence || '').slice(0,160); } });
      if (r && r.feedback) fbs.push(r.feedback); if (r && r.notes) notes.push(String(r.notes)); if (r && Array.isArray(r.facts)) facts.push(...r.facts.map(String)); if (r && r.setuk) setuk = String(r.setuk);
    }
    let fb = fbs[fbs.length-1] || {};
    if (chunks.length > 1){
      gStatus('묶음별 결과를 합쳐 피드백과 세특을 정리하고 있어요…');
      const r = await aiJSON(mode, `중학생 수행평가 결과를 정리하세요.\n영역별 수준과 근거:\n${CRIT.map(c => `${c.k} ${c.name}: ${merged[c.k] || '미확인'} - ${ev[c.k] || ''}`).join('\n')}\n확인된 사실: ${facts.join(' / ')}\n\n${setukRules()}\n\n다음 JSON만 출력: {"good":"잘한 점 1~2문장(~해요)","next":"다음 단계 1~2문장(~해요)","message":"응원 1문장","setuk":"세특 문단"}`, null, gCtl.signal).catch(() => null);
      if (r){ fb = {good: r.good || fb.good, next: r.next || fb.next, message: r.message || fb.message}; if (r.setuk) setuk = String(r.setuk); }
    }
    CRIT.forEach(c => { if (merged[c.k]) { gLevels[c.k] = merged[c.k]; gEvidence[c.k] = ev[c.k]; } });
    gAI = {levels: {...merged}, facts: facts.slice(0, 8), at: new Date().toISOString(), via: mode};
    if (fb.good) $('#fbGood').value = fb.good; if (fb.next) $('#fbNext').value = fb.next; if (fb.message) $('#fbMsg').value = fb.message;
    if (setuk) $('#fbSetuk').value = setuk.trim(); setukCount();
    renderCrit();
    const miss = CRIT.filter(c => !merged[c.k]).map(c => c.k);
    gStatus(`초안 완료 · ${totalOf(gLevels)}점 · 세특 초안 포함. ${miss.length ? `<b>${miss.join(', ')}</b> 영역은 사진에서 확인되지 않아 직접 입력해 주세요(입력 후 <b>세특 다시 쓰기</b>). ` : ''}${notes.length ? '참고: ' + esc(notes.join(' / ')) : ''} 근거를 확인한 뒤 저장하세요.`, 'ok');
  } catch(e){
    const code = e && (e.code || (e.name === 'AbortError' ? 'cancelled' : ''));
    const msg = {cancelled:'중지했어요.', not_granted:'AI 사용이 허용되지 않았어요. 직접 채점해 주세요.', rate_limited:'요청이 많아요. 잠시 후 다시 눌러 주세요.', image_rejected:'읽을 수 없는 사진이 있어요. JPG나 PNG로 다시 올려 주세요.', invalid_json:'AI 답을 정리하지 못했어요. 한 번 더 눌러 주세요.', refused:'AI가 이 요청을 처리하지 않았어요. 사진을 확인해 주세요.', images_unavailable:'이 화면에서는 이미지를 보낼 수 없어요.'}[code] || ('AI 채점 중 문제가 생겼어요. ' + (e && e.message && !e.code ? esc(e.message) : '다시 시도하거나 직접 채점해 주세요.'));
    gStatus(msg, code === 'cancelled' ? '' : 'err');
  } finally { $('#gRun').disabled = false; $('#gStop').hidden = true; gCtl = null; }
});
$('#gStop').addEventListener('click', () => gCtl?.abort());
$('#fbSetuk').addEventListener('input', setukCount);
$('#gSetuk').addEventListener('click', async () => {
  const mode = await aiMode(false); if (!mode){ toast('AI 연결이 없어요 · 연결 설정을 확인해 주세요'); return; }
  if (!Object.keys(gLevels).length){ toast('먼저 영역별 수준을 정해 주세요'); return; }
  const b = $('#gSetuk'); b.disabled = true; $('#fbSetuk').value = '작성 중…';
  const r = {levels: gLevels, evidence: gEvidence, feedback: {good: $('#fbGood').value, next: $('#fbNext').value}};
  try { const t = await aiText(mode, setukPrompt(r) + (gAI.facts?.length ? `\n(확인된 사실: ${gAI.facts.join(' / ')})` : ''), t => { $('#fbSetuk').value = t; setukCount(); }); $('#fbSetuk').value = String(t).trim(); setukCount(); }
  catch(e){ $('#fbSetuk').value = ''; toast(e.code === 'not_granted' ? 'AI 사용이 허용되지 않았어요' : '세특 초안을 만들지 못했어요'); }
  finally { b.disabled = false; }
});
function resetGrade(keepCls){ gFiles.forEach(x => URL.revokeObjectURL(x.url)); gFiles = []; gLevels = {}; gEvidence = {}; gAI = {}; renderThumbs();
  ['#gId','#gName','#fbGood','#fbNext','#fbMsg','#fbSetuk'].forEach(s => $(s).value = ''); setukCount(); if (!keepCls) $('#gCls').value = ''; renderCrit(); gStatus('사진을 올리고 <b>AI 초안 채점</b>을 누르세요. AI 없이 오른쪽에서 직접 채점해도 됩니다.'); }
$('#gClear').addEventListener('click', () => resetGrade(true));
$('#gSave').addEventListener('click', async () => {
  const sid = $('#gId').value.trim(); if (!sid){ toast('학번을 입력해 주세요'); $('#gId').focus(); return; }
  const rec = {sid, name: $('#gName').value.trim(), cls: $('#gCls').value.trim() || '미지정', levels: {...gLevels}, evidence: {...gEvidence}, ai: gAI,
    feedback: {good: $('#fbGood').value.trim(), next: $('#fbNext').value.trim(), message: $('#fbMsg').value.trim()}, setuk: $('#fbSetuk').value.trim()};
  Object.keys(rec.levels).forEach(k => rec.levels[k] === undefined && delete rec.levels[k]);
  try { await Store.save(rec); demoOn = false; toast(`${sid} ${rec.name} 저장 · ${totalOf(rec.levels)}점`); const cls = rec.cls; resetGrade(true); $('#gCls').value = cls; dSel = keyOf(sid); fillPicker(); const nx = nextUngraded(cls, sid); if (nx) pickStudent(cls, nx.sid); }
  catch(e){ toast(e.code === 'quota_exceeded' ? '저장 공간이 가득 찼어요' : '저장하지 못했어요. 다시 눌러 주세요'); }
});
function loadIntoGrader(rec){ resetGrade(); $('#gCls').value = rec.cls || ''; $('#gId').value = rec.sid; $('#gName').value = rec.name || ''; gLevels = {...(rec.levels || {})}; gEvidence = {...(rec.evidence || {})}; gAI = rec.ai || {};
  $('#fbGood').value = rec.feedback?.good || ''; $('#fbNext').value = rec.feedback?.next || ''; $('#fbMsg').value = rec.feedback?.message || ''; $('#fbSetuk').value = rec.setuk || ''; setukCount(); renderCrit(); gStatus('저장된 채점을 불러왔어요. 고친 뒤 다시 저장하세요.', 'ok'); }

/* ================= dashboard ================= */
let demoOn = true, dSel = null, dSort = {k:'sid', dir:1};
const DEMO = (() => { const names = ['김민준','이서연','박도윤','최하준','정지호','강예준','조시우','윤주원','장지훈','임건우','한도현','오선우','서준서','신유준','권은우','황승민'];
  const pick = (seed, w) => { const r = (Math.sin(seed)*10000) % 1, x = Math.abs(r); let a = 0; for (let i = 0; i < 4; i++){ a += w[i]; if (x < a) return LV[i]; } return LV[3]; };
  const W = {A:[.5,.3,.15,.05],B:[.4,.35,.2,.05],C:[.35,.35,.2,.1],D:[.45,.3,.2,.05],E:[.2,.3,.35,.15],F:[.4,.35,.2,.05],G:[.3,.4,.2,.1]};
  return names.map((n,i) => { const sid = `101${String(i+1).padStart(2,'0')}`, levels = {}; CRIT.forEach((c,j) => levels[c.k] = pick(i*7.3+j*1.9+1, W[c.k]));
    return {sid, name:n, cls:'1-1 (예시)', levels, evidence:{}, demo:true, feedback:{good:'문제 상황을 누가·언제·어디서로 구체적으로 정의해서 아이디어가 분명했어요.', next:levels.E === '상' ? '버전 2.0 업그레이드 그림을 더 구체적으로 그려 보세요.' : '등각 투상도에 치수 3개와 축척을 꼭 적어 보세요.', message:'끝까지 만들어 낸 진짜 발명가예요!'}}; }); })();
const keyOf = sid => 's-' + String(sid).replace(/[^0-9A-Za-z_-]/g,'_');
function recs(){ const real = [...Store.recs.entries()].map(([k,v]) => ({key:k, ...v}));
  if (real.length || CLASSES.length) demoOn = false;
  if (demoOn) return DEMO.map(d => ({key:'demo-'+d.sid, ...d}));
  const have = new Set(real.map(r => r.key));
  CLASSES.forEach(c => c.students.forEach(st => { const k = keyOf(st.sid); if (!have.has(k)){ have.add(k); real.push({key:k, sid:st.sid, name:st.name, cls:c.name, levels:{}, pending:true}); } }));
  return real; }
function renderDash(){
  const all = recs(), clsSel = $('#dCls'), prev = clsSel.value;
  const classes = [...new Set([...CLASSES.map(c => c.name), ...all.map(r => r.cls || '미지정')])];
  clsSel.innerHTML = `<option value="">전체 반 (${all.length}명)</option>` + classes.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
  if (classes.includes(prev)) clsSel.value = prev;
  const list = all.filter(r => !clsSel.value || r.cls === clsSel.value);
  const isDemo = list.some(r => r.demo);
  if (!$('#dDemo .status.err')) $('#dDemo').innerHTML = isDemo ? `<span class="demo-flag">예시 데이터 · AI 채점에서 첫 학생을 저장하면 실제 데이터로 바뀌어요</span>` : `<span class="mono">${Store.mode === 'db' ? '선생님 계정에 저장된 데이터 · 다른 사람은 볼 수 없어요' : Store.mode === 'local' ? '이 브라우저에만 저장된 데이터' : ''}</span>`;
  const done = list.filter(r => !r.pending), totals = done.map(r => totalOf(r.levels)), graded = done.filter(r => Object.keys(r.levels || {}).length === 7).length;
  const avg = totals.length ? totals.reduce((a,b) => a+b,0)/totals.length : 0;
  $('#dTiles').innerHTML = [['채점 / 전체', `${done.length}/${list.length}`], ['미채점', (list.length - done.length) + '명'], ['평균', avg.toFixed(1)], ['최고', totals.length ? Math.max(...totals) : '–'], ['최저', totals.length ? Math.min(...totals) : '–']].map(t => `<div class="panel tile"><b>${t[1]}</b><span>${t[0]}</span></div>`).join('');
  const rates = CRIT.map(c => { const v = list.filter(r => r.levels?.[c.k]); return v.length ? v.reduce((a,r) => a + scoreOf(c.k, r.levels[c.k]), 0)/(v.length*c.pts[0]) : 0; });
  $('#dCrit').innerHTML = CRIT.map((c,i) => `<div class="r"><div class="nm">${c.name}<small>${c.m}</small></div><div class="bar"><i style="--w:${(rates[i]*100).toFixed(0)}%;--c:${c.c}"></i><span>${(rates[i]*100).toFixed(0)}%</span></div><div class="pt" style="font-size:22px">${(rates[i]*c.pts[0]).toFixed(1)}</div></div>`).join('');
  const bins = [0,0,0,0,0,0], labels = ['~49','50대','60대','70대','80대','90~'];
  totals.forEach(t => bins[t < 50 ? 0 : t >= 90 ? 5 : Math.floor(t/10)-4]++);
  const mx = Math.max(1, ...bins);
  $('#dHist').innerHTML = bins.map(b => `<div style="height:${b/mx*100}%"><span>${b}</span></div>`).join('');
  $('#dHistX').innerHTML = labels.map(l => `<span>${l}</span>`).join('');
  const lowI = rates.indexOf(Math.min(...rates.filter((_,i) => list.some(r => r.levels?.[CRIT[i].k]))));
  $('#dInsight').textContent = list.length && lowI >= 0 ? `보충 추천 · ${CRIT[lowI].name}(${(rates[lowI]*100).toFixed(0)}%) — 다음 수업 시작 5분 피드백` : '';
  const sorted = [...list].sort((a,b) => { const k = dSort.k; const va = k === 'total' ? totalOf(a.levels) : k.length === 1 ? scoreOf(k, a.levels?.[k]) : (a[k] || ''); const vb = k === 'total' ? totalOf(b.levels) : k.length === 1 ? scoreOf(k, b.levels?.[k]) : (b[k] || ''); return (va > vb ? 1 : va < vb ? -1 : 0)*dSort.dir; });
  const lc = l => ({'상':'#3DD68C','중상':'#8FD3FF','중':'#F5C542','하':'#FF6B5B'}[l] || '#2E5E99');
  $('#dTbl').innerHTML = `<thead><tr><th data-s="sid">학번</th><th data-s="name">이름</th>${CRIT.map(c => `<th data-s="${c.k}" title="${c.name}">${c.k}</th>`).join('')}<th data-s="total" class="num">합계</th><th>세특</th></tr></thead><tbody>` +
    sorted.map(r => `<tr data-k="${esc(r.key)}" class="${r.key === dSel ? 'sel' : ''} ${r.pending ? 'pending' : ''}" tabindex="0"><td>${esc(r.sid)}</td><td>${esc(r.name)}</td>${CRIT.map(c => `<td><span class="lvd" style="background:${lc(r.levels?.[c.k])}" title="${r.levels?.[c.k] || '미평가'}">${r.levels?.[c.k] ? r.levels[c.k][0] + (r.levels[c.k] === '중상' ? '+' : '') : '·'}</span></td>`).join('')}<td class="num">${r.pending ? '<span class="chip" style="color:var(--warn)">미채점</span>' : `<b>${totalOf(r.levels)}</b>`}</td><td>${r.setuk ? `<span class="chip" style="color:var(--good)" title="${neisBytes(r.setuk)}바이트">✓ ${r.setuk.length}자</span>` : r.pending ? '' : '<span class="chip" style="color:var(--muted)">없음</span>'}</td></tr>`).join('') + '</tbody>';
  $$('#dTbl th').forEach(th => th.addEventListener('click', () => { const k = th.dataset.s; dSort = {k, dir: dSort.k === k ? -dSort.dir : (k.length === 1 || k === 'total' ? -1 : 1)}; renderDash(); }));
  $$('#dTbl tbody tr').forEach(tr => { const f = () => { dSel = tr.dataset.k; renderDash(); }; tr.addEventListener('click', f); tr.addEventListener('keydown', e => { if (e.key === 'Enter') f(); }); });
  if (!dSel || !list.find(r => r.key === dSel)) dSel = sorted[0]?.key || null;
  renderCard(list.find(r => r.key === dSel));
}
function cardHTML(r){
  if (!r || r.pending) return `<div class="panel" style="padding:30px;color:var(--muted)">아직 채점한 학생이 없어요.</div>`;
  const t = totalOf(r.levels);
  return `<div class="fbcard"><div class="stampx">INVENTOR<br>${t}점</div><span class="mono">INVENTOR LAB · 발명가 피드백 카드${r.demo ? ' · 예시' : ''}</span><h4>${esc(r.sid)} ${esc(r.name)}</h4>
    <div class="sc">${CRIT.map(c => `<div>${c.name.replace('아이디어 ','')}<b>${r.levels?.[c.k] ? scoreOf(c.k, r.levels[c.k]) : '–'}</b>${r.levels?.[c.k] || ''}</div>`).join('')}</div>
    <p><span class="lbl">GOOD · 잘한 점</span><br>${esc(r.feedback?.good || '—')}</p><p><span class="lbl">NEXT · 다음 단계</span><br>${esc(r.feedback?.next || '—')}</p>${r.feedback?.message ? `<p style="font-family:var(--hand);font-size:24px;color:#D9480F;margin-top:10px">${esc(r.feedback.message)}</p>` : ''}</div>${r.setuk && !r.demo ? `<div class="panel" style="padding:14px;margin-top:10px;font-size:14px"><span class="mono">교사용 · 과목별 세특 (${r.setuk.length}자 · ${neisBytes(r.setuk)}바이트)</span><p style="margin:6px 0 0">${esc(r.setuk)}</p></div>` : ''}`;
}
function renderCard(r){ $('#dCard').innerHTML = r && r.pending ? `<div class="panel" style="padding:26px"><h3>${esc(r.sid)} ${esc(r.name)}</h3><p style="color:var(--muted)">아직 채점하지 않은 학생이에요.</p><a class="btn sm" href="#grade" data-grade="${esc(r.sid)}">이 학생 채점하기</a></div>` : cardHTML(r);
  const gb = $('#dCard [data-grade]'); if (gb) gb.addEventListener('click', () => { setTimeout(() => pickStudent(r.cls, r.sid), 30); }); $('#dCard').dataset.k = r?.key || ''; }
const curRec = () => recs().find(r => r.key === $('#dCard').dataset.k);
$('#dCls').addEventListener('change', renderDash);
$('#dCopy').addEventListener('click', async () => { const r = curRec(); if (!r) return; const txt = `[INVENTOR LAB 피드백] ${r.sid} ${r.name} · ${totalOf(r.levels)}점\n잘한 점: ${r.feedback?.good || ''}\n다음 단계: ${r.feedback?.next || ''}\n${r.feedback?.message || ''}`;
  try { await navigator.clipboard.writeText(txt); toast('복사했어요'); } catch(e){ toast('복사가 막혀 있어요. 카드 글을 직접 선택해 주세요'); } });
$('#dShow').addEventListener('click', () => { const r = curRec(); if (!r) return; const ov = document.createElement('div'); ov.style.cssText = 'position:fixed;inset:0;z-index:150;background:rgba(3,10,22,.92);display:grid;place-items:center;padding:30px';
  ov.innerHTML = `<div style="width:min(900px,100%);font-size:22px">${cardHTML(r)}<p class="mono" style="text-align:center;margin-top:14px">아무 곳이나 누르면 닫혀요</p></div>`; ov.querySelector('.fbcard').style.fontSize = '22px'; ov.addEventListener('click', () => ov.remove()); document.body.appendChild(ov); });
$('#dEdit').addEventListener('click', () => { const r = curRec(); if (!r) return; if (r.pending){ location.hash = '#grade'; setTimeout(() => pickStudent(r.cls, r.sid), 30); return; } if (r.demo){ toast('예시 데이터는 고칠 수 없어요'); return; } loadIntoGrader(r); location.hash = '#grade'; });
$('#dDel').addEventListener('click', async () => { const r = curRec(); if (!r || r.demo){ toast('예시 데이터는 지울 수 없어요'); return; } const b = $('#dDel');
  if (b.dataset.armed !== r.key){ b.dataset.armed = r.key; b.textContent = '한 번 더 누르면 삭제'; setTimeout(() => { b.dataset.armed = ''; b.textContent = '삭제'; }, 3000); return; }
  try { await Store.remove(r.key); toast('삭제했어요'); } catch(e){ toast('삭제하지 못했어요'); } b.dataset.armed = ''; b.textContent = '삭제'; dSel = null; });
$('#dCsv').addEventListener('click', async () => {
  const list = recs().filter(r => !$('#dCls').value || r.cls === $('#dCls').value);
  const q = v => `"${String(v ?? '').replace(/"/g,'""')}"`;
  const csv = '﻿' + ['반','학번','이름',...CRIT.map(c => `${c.k} ${c.name}(수준)`),...CRIT.map(c => `${c.k} 점수`),'합계','반영점수(50%)','잘한 점','다음 단계','세특 초안'].map(q).join(',') + '\n' +
    list.map(r => [r.cls, r.sid, r.name, ...CRIT.map(c => r.levels?.[c.k] || ''), ...CRIT.map(c => r.levels?.[c.k] ? scoreOf(c.k, r.levels[c.k]) : ''), totalOf(r.levels), (totalOf(r.levels)/2).toFixed(1), r.feedback?.good, r.feedback?.next, r.setuk].map(q).join(',')).join('\n');
  const dl = await use('downloads');
  if (dl){ try { await dl.save({filename:'INVENTOR_LAB_채점결과.csv', data: csv}); toast('CSV를 저장했어요'); return; } catch(e){ if (e.code === 'declined') return; } }
  try { await navigator.clipboard.writeText(csv); toast('CSV 내용을 클립보드에 복사했어요 (엑셀에 붙여넣기)'); } catch(e){ toast('내보내기를 할 수 없는 환경이에요'); }
});


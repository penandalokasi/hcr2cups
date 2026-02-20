// HCR2 cups chest sequence (111). Milestone chest = anything not "common".
const SEQUENCE = [
  "champion","common","common","common","rare","common","common","common",
  "rare","common","common","uncommon","common","common","common","common",
  "common","rare","common","common","common","epic","common","common",
  "rare","common","common","common","common","common","rare","common",
  "common","common","common","rare","common","common","uncommon","common",
  "common","common","common","common","rare","common","common","common",
  "common","common","rare","common","common","common","common","rare",
  "common","common","common","common","common","rare","common","common",
  "common","common","common","epic","common","common","common","common",
  "rare","common","common","common","rare","common","common","common",
  "common","common","common","rare","common","common","common","rare",
  "common","common","uncommon","common","rare","common","common","rare",
  "common","common","common","common","common","rare","common","common",
  "common","common","common","rare","common","common","common"
];

const CHESTS = {
  champion: { name: "Champion chest", colorVar: "--champion", milestone: true },
  rare:     { name: "Rare chest",     colorVar: "--rare",     milestone: true },
  uncommon: { name: "Uncommon chest", colorVar: "--uncommon", milestone: true },
  epic:     { name: "Epic chest",     colorVar: "--epic",     milestone: true },
  common:   { name: "Common chest",   colorVar: "--common",   milestone: false },
};

const STORAGE_KEY = "hcr2cups.v1.state";

/** @type {{openedCount:number, history:number[]}} */
let state = { openedCount: 0, history: [] };

function clampNonNegInt(n){
  const x = Number.isFinite(n) ? Math.floor(n) : 0;
  return Math.max(0, x);
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return;
    const parsed = JSON.parse(raw);
    if(typeof parsed !== "object" || parsed === null) return;
    state.openedCount = clampNonNegInt(parsed.openedCount);
    state.history = Array.isArray(parsed.history) ? parsed.history.map(clampNonNegInt).slice(-60) : [];
  }catch(_e){}
}
function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function pushHistory(){
  state.history.push(state.openedCount);
  if(state.history.length > 60) state.history = state.history.slice(-60);
}

/**
 * Custom confirm modal.
 * Requires modal HTML in index.html. If missing, falls back to window.confirm().
 */
function confirmModal(message, opts = {}){
  const modal = document.getElementById("confirmModal");
  const desc = document.getElementById("confirmDesc");
  const title = document.getElementById("confirmTitle");
  const btnOk = document.getElementById("confirmOk");
  const btnCancel = document.getElementById("confirmCancel");

  // Fallback if modal isn't present
  if(!modal || !desc || !title || !btnOk || !btnCancel){
    return Promise.resolve(confirm(message));
  }

  title.textContent = opts.title || "Confirm";
  desc.textContent = message;

  return new Promise((resolve) => {
    const close = (result) => {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      cleanup();
      resolve(result);
    };

    const onOk = () => close(true);
    const onCancel = () => close(false);
    const onBackdrop = (e) => {
      if(e.target && e.target.hasAttribute("data-close")) close(false);
    };
    const onKey = (e) => {
      if(e.key === "Escape") close(false);
      if(e.key === "Enter") close(true);
    };

    function cleanup(){
      btnOk.removeEventListener("click", onOk);
      btnCancel.removeEventListener("click", onCancel);
      modal.removeEventListener("click", onBackdrop);
      document.removeEventListener("keydown", onKey);
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");

    btnOk.addEventListener("click", onOk);
    btnCancel.addEventListener("click", onCancel);
    modal.addEventListener("click", onBackdrop);
    document.addEventListener("keydown", onKey);

    btnOk.focus();
  });
}

function chestSVG(type, sizeClass=""){
  const meta = CHESTS[type];
  const color = getComputedStyle(document.documentElement).getPropertyValue(meta.colorVar).trim() || "#fff";
  const accent = "rgba(0,0,0,.25)";
  const laurel = (type === "champion" || type === "epic");

  return `
  <svg class="icon ${sizeClass}" viewBox="0 0 64 64" role="img" aria-label="${meta.name}">
    ${laurel ? `
      <path d="M9 26c-5 3-6 10-2 15 3 4 8 6 12 4" fill="none" stroke="${type === "epic" ? "#f0e68c" : "#d9f99d"}" stroke-width="3" stroke-linecap="round"/>
      <path d="M55 26c5 3 6 10 2 15-3 4-8 6-12 4" fill="none" stroke="${type === "epic" ? "#f0e68c" : "#d9f99d"}" stroke-width="3" stroke-linecap="round"/>
    ` : ``}
    <path d="M14 24c0-8 7-14 18-14s18 6 18 14v4H14v-4z" fill="${shade(color, 0.12)}" stroke="rgba(255,255,255,.25)" stroke-width="1"/>
    <path d="M12 28h40c3 0 6 3 6 6v16c0 4-3 7-7 7H13c-4 0-7-3-7-7V34c0-3 3-6 6-6z" fill="${color}" stroke="rgba(255,255,255,.25)" stroke-width="1"/>
    <path d="M12 38h52v5H12z" fill="${shade(color, -0.10)}" opacity="0.9"/>
    <rect x="29" y="33" width="6" height="14" rx="2.5" fill="${shade(color, -0.25)}"/>
    <rect x="27.5" y="35" width="9" height="8" rx="2" fill="${shade(color, -0.33)}"/>
    <circle cx="32" cy="39" r="1.3" fill="rgba(255,255,255,.65)"/>
    <path d="M16 30c6-5 26-5 32 0" fill="none" stroke="${accent}" stroke-width="2" opacity=".55" stroke-linecap="round"/>
  </svg>`;
}

function shade(color, amount){
  if(!color || color[0] !== "#") return color;
  const hex = color.replace("#","");
  if(hex.length !== 6) return color;
  const num = parseInt(hex, 16);
  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;
  const adj = (v) => Math.max(0, Math.min(255, Math.round(v + 255*amount)));
  r = adj(r); g = adj(g); b = adj(b);
  return "#" + [r,g,b].map(x => x.toString(16).padStart(2,"0")).join("");
}

function seqLen(){ return SEQUENCE.length; }

function currentCycle(){
  return Math.floor(state.openedCount / seqLen()) + 1;
}
function indexInCycle(){
  return state.openedCount % seqLen();
}

function nextChestType(){
  return SEQUENCE[indexInCycle()];
}

function nextMilestoneDelta(){
  const start = indexInCycle();
  for(let off=0; off<seqLen(); off++){
    const t = SEQUENCE[(start + off) % seqLen()];
    if(CHESTS[t].milestone) return off;
  }
  return 0;
}

function advanceBy(n){
  const delta = clampNonNegInt(n);
  if(delta === 0) return;
  pushHistory();
  state.openedCount = clampNonNegInt(state.openedCount + delta);
  saveState();
  render();
}

function markNextChest(){ advanceBy(1); }
function markNextMilestone(){
  const off = nextMilestoneDelta();
  advanceBy(off + 1);
}

function undo(){
  if(!state.history.length) return;
  state.openedCount = clampNonNegInt(state.history.pop());
  saveState();
  render();
}

async function resetAll(){
  const ok = await confirmModal(
    "Reset progress back to the start (Champion chest)?",
    { title: "Reset progress" }
  );
  if(!ok) return;
  state.openedCount = 0;
  state.history = [];
  saveState();
  render();
}

function setOpenedCountManually(){
  const el = document.getElementById("setOpened");
  const val = clampNonNegInt(Number(el.value));
  pushHistory();
  state.openedCount = val;
  saveState();
  render();
}

function fmt(n){ return new Intl.NumberFormat().format(n); }
function ordinalInCycle(idx0){ return idx0 + 1; }

function describeAbsoluteChest(absIndex){
  const len = seqLen();
  const cycle = Math.floor(absIndex / len) + 1;
  const idx = absIndex % len;
  return { cycle, idx, type: SEQUENCE[idx] };
}

function buildMilestones(){
  const out = [];
  const startAbs = state.openedCount;
  let found = 0;
  for(let step=0; step<seqLen()*2 && found<5; step++){
    const abs = startAbs + step;
    const d = describeAbsoluteChest(abs);
    if(CHESTS[d.type].milestone){
      out.push({ step, abs, ...d });
      found++;
    }
  }
  return out;
}

function render(){
  const len = seqLen();
  const cycle = currentCycle();
  const idx = indexInCycle();
  const type = nextChestType();
  const meta = CHESTS[type];

  document.getElementById("pillCycle").textContent = "Cycle " + cycle;
  document.getElementById("pillPos").textContent = "• Next: #" + ordinalInCycle(idx);

  document.getElementById("nextIcon").innerHTML = chestSVG(type, "big");
  document.getElementById("nextName").textContent = meta.name;
  document.getElementById("nextMeta").textContent =
    `Next chest is #${ordinalInCycle(idx)} in the 111-step sequence (Cycle ${cycle}).`;

  document.getElementById("openedTotal").textContent = fmt(state.openedCount);
  document.getElementById("openedCycle").textContent = `${idx} / ${len}`;
  const pct = Math.round((idx / len) * 100);
  document.getElementById("openedCycleSub").textContent = `${pct}% complete`;

  document.getElementById("barFill").style.width = (idx / len * 100).toFixed(2) + "%";
  document.getElementById("cycleRange").textContent = `1–${len}`;

  const off = nextMilestoneDelta();
  const milAbs = state.openedCount + off;
  const mil = describeAbsoluteChest(milAbs);
  const milName = CHESTS[mil.type].name;
  document.getElementById("toMilestone").textContent =
    off === 0 ? `Next milestone: now (${milName})` : `Next milestone: in ${off} chest${off===1?"":"es"} (${milName})`;

  const ms = buildMilestones();
  const msWrap = document.getElementById("milestones");
  msWrap.innerHTML = "";
  ms.forEach(m => {
    const div = document.createElement("div");
    div.className = "milestoneItem";
    div.innerHTML = `
      <div aria-hidden="true">${chestSVG(m.type)}</div>
      <div class="txt">
        <p class="t">${CHESTS[m.type].name}</p>
        <p class="d">In ${m.step} chest${m.step===1?"":"es"} • Cycle ${m.cycle} • Position #${ordinalInCycle(m.idx)}</p>
      </div>
    `;
    msWrap.appendChild(div);
  });

  const grid = document.getElementById("sequenceGrid");
  grid.innerHTML = "";
  const frag = document.createDocumentFragment();

  for(let i=0; i<len; i++){
    const t = SEQUENCE[i];
    const cell = document.createElement("div");
    cell.className = "cell " + t
      + (i < idx ? " done" : "")
      + (i === idx ? " next" : "")
      + (CHESTS[t].milestone ? " milestone" : "");
    cell.setAttribute("role", "button");
    cell.setAttribute("tabindex", "0");
    cell.setAttribute("aria-label", `${CHESTS[t].name}, position ${i+1} of ${len}`);
    cell.innerHTML = `
      ${chestSVG(t)}
      <div class="num">#${i+1}</div>
    `;

    cell.addEventListener("click", async () => {
      const targetAbs = (state.openedCount - idx) + i; // same cycle
      const ok = await confirmModal(
        `Set NEXT chest to position #${i+1} (${CHESTS[t].name}) in the current cycle?`,
        { title: "Set next chest" }
      );
      if(!ok) return;
      pushHistory();
      state.openedCount = clampNonNegInt(targetAbs);
      saveState();
      render();
    });

    cell.addEventListener("keydown", (e) => {
      if(e.key === "Enter" || e.key === " "){
        e.preventDefault();
        cell.click();
      }
    });

    frag.appendChild(cell);
  }
  grid.appendChild(frag);

  document.getElementById("btnUndo").disabled = state.history.length === 0;
  document.getElementById("setOpened").value = String(state.openedCount);
}

document.getElementById("btnNext").addEventListener("click", markNextChest);
document.getElementById("btnMilestone").addEventListener("click", markNextMilestone);
document.getElementById("btnUndo").addEventListener("click", undo);
document.getElementById("btnReset").addEventListener("click", resetAll);
document.getElementById("btnSetOpened").addEventListener("click", setOpenedCountManually);

loadState();
render();

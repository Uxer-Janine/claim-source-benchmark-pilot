"use strict";

const missions = [
  { id: "A04", title: "The Missing Evidence", skill: "Follow an estimate. Find what the source leaves unresolved.", track: "Starter" },
  { id: "A01", title: "Guided investigation", skill: "Compare an average with an approximate age.", track: "Starter" },
  { id: "A03", title: "Time and Context", skill: "Check whether evidence applies to the right place and period.", track: "Optional" },
  { id: "A08", title: "The Relevance Test", skill: "Separate a related topic from evidence that answers the question.", track: "Optional" },
  { id: "B09", title: "The Open Investigation", skill: "Separate editing rules from what a study actually measured.", track: "Optional" }
];

// Teaching summaries of one cited paragraph, split into files by claim detail.
// The benchmark record supplies the claim wording, source and assessment.
const files = [
  { id: "a04-sc1", title: "Who made the estimate?", clue: "The passage names the Confederation of Indian Industry as the organization behind the estimate." },
  { id: "a04-sc2", title: "How large was the estimate?", clue: "The passage gives an annual estimate of US$2.3 billion." },
  { id: "a04-sc3", title: "Where is the clinic count?", clue: "The passage describes IVF clinics across India that offer surrogacy programs without giving a total." }
];

const lanes = {
  unsorted: "Unsorted",
  backs: "Supported",
  narrower: "Narrower support",
  missing: "Needs more evidence"
};
const verdicts = {
  supported: "Supported",
  partially_supported: "Partially supported",
  compatible_not_confirmed: "Compatible but unconfirmed",
  not_supported: "Not supported",
  contradicted: "Contradicted",
  insufficient_access: "I couldn’t access enough evidence"
};
const key = "evidence-desk-a04-v1";
const view = document.querySelector("#view");
const loading = document.querySelector("#loading");
let state = { found: {}, readings: {}, verdict: "", reason: "", filed: false };
let record;

try {
  const saved = JSON.parse(sessionStorage.getItem(key));
  if (saved) state = saved;
} catch {
  // Continue in memory when tab storage is unavailable.
}

function save() {
  try {
    sessionStorage.setItem(key, JSON.stringify(state));
  } catch {
    // The current page can still retain the investigation.
  }
}

function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function link(text, href, className) {
  const node = el("a", text, className);
  node.href = href;
  return node;
}

function button(text, action, className) {
  const node = el("button", text, className);
  node.type = "button";
  node.addEventListener("click", action);
  return node;
}

function title(tag, text) {
  const node = el(tag, text);
  node.tabIndex = -1;
  return node;
}

function assessment() {
  return record.assessments.find((entry) => entry.kind === "human_original");
}

function claimDetail(id) {
  return record.sub_claims.find((part) => part.sub_claim_id === id).text;
}

function selectInput(id, label, choices, value) {
  const field = el("div", undefined, "form-field");
  const caption = el("label", label);
  caption.htmlFor = id;
  const select = el("select");
  select.id = id;
  const placeholder = el("option", "Choose one");
  placeholder.value = "";
  select.append(placeholder);
  for (const [key, name] of Object.entries(choices)) {
    const option = el("option", name);
    option.value = key;
    select.append(option);
  }
  select.value = value || "";
  field.append(caption, select);
  return { field, select };
}

function welcome() {
  const section = el("section", undefined, "welcome");
  const intro = el("div", undefined, "welcome-intro");
  const steps = el("ol", undefined, "welcome-steps");
  for (const [name, description] of [
    ["Open the evidence", "Uncover what the cited source says."],
    ["Sort the clues", "Move each card to show what the evidence supports."],
    ["File a deduction", "Explain your judgment, then compare the reasoning."]
  ]) {
    const item = el("li");
    item.append(el("strong", name), el("span", description));
    steps.append(item);
  }
  intro.append(
    el("p", "Wikipedia claim–source investigations", "eyebrow"),
    title("h1", "Evidence Desk"),
    el("p", "A Wikipedia claim makes an estimate. What does its source actually back up? Follow the clues and make your own judgment.", "welcome-lead"),
    link("Start investigating", "#missions", "button"),
    el("p", "Playable now · A04 The Missing Evidence", "status welcome-status")
  );
  section.append(intro, steps);
  return section;
}

function missionGrid() {
  const hero = el("section", undefined, "hero");
  hero.append(
    el("p", "Wikipedia case files", "eyebrow"),
    title("h1", "The mission desk"),
    el("p", "Start with A04, the playable investigation. The other four case files are previews.", "intro"),
    el("p", state.filed ? "A04 filed · Reopen anytime" : "One playable mission · Four mission previews", "status")
  );
  const grid = el("div", undefined, "grid");
  for (const mission of missions) {
    const playable = mission.id === "A04";
    const card = el("article", undefined, `card mission-card${playable ? " featured" : ""}`);
    card.append(
      el("p", `${mission.id} · ${mission.track}`, "eyebrow"),
      el("h2", mission.title),
      el("p", mission.skill),
      el("p", playable ? (state.filed ? "Filed" : "Playable now") : "Preview", "status"),
      link(playable ? (state.filed ? "Reopen A04" : "Investigate A04") : `Preview ${mission.id}`, `#${mission.id}`, playable ? "button" : "button secondary")
    );
    grid.append(card);
  }
  return [hero, grid];
}

function preview(mission) {
  const section = el("section", undefined, "card");
  section.append(
    el("p", `${mission.id} · Mission preview`, "eyebrow"),
    title("h1", mission.title),
    el("p", mission.skill),
    el("p", "The game version is planned. You can explore this case in the Markdown lesson today.", "muted"),
    link("Investigate A04 now", "#A04", "button"),
    link("Return to the mission desk", "#missions", "button secondary"),
    el("p"),
    link("Read the Markdown lesson", document.querySelector(".topbar nav a[href^='https:']").href)
  );
  return section;
}

function sourcePanel() {
  const detail = el("details", undefined, "file");
  const source = record.sources[0];
  const open = link("Open the cited article (new tab)", source.url);
  open.target = "_blank";
  open.rel = "noopener noreferrer";
  const body = el("div", undefined, "file-body");
  body.append(
    open,
    el("p", source.citation_text, "muted"),
    el("p", `Recorded location · ${assessment().evidence[0].location.raw}`),
    el("p", "The three files summarize this passage in our own words. Use the article link to inspect the original.", "muted")
  );
  detail.append(el("summary", "Cited article and passage location"), body);
  return detail;
}

function evidenceFile(file, index, update) {
  const disclosure = el("details", undefined, "file");
  const summary = el("summary");
  const status = el("span", state.found[file.id] ? "Opened" : "Unopened", "status");
  summary.append(el("span", `0${index + 1}`, "file-number"), el("span", file.title), status);
  const body = el("div", undefined, "file-body");
  body.append(
    el("p", "Evidence summary", "eyebrow"),
    el("p", file.clue),
    el("p", `Claim detail · ${claimDetail(file.id)}`, "muted"),
    el("p", "Classify this detail using its card on the investigation board.", "muted")
  );
  disclosure.append(summary, body);
  disclosure.addEventListener("toggle", () => {
    if (!disclosure.open || state.found[file.id]) return;
    state.found[file.id] = true;
    status.textContent = "Opened";
    save();
    update();
  });
  return disclosure;
}

function investigationBoard(update) {
  const board = el("section", undefined, "board");
  const progress = el("p", "", "status");
  const announcement = el("p", "", "sr-only");
  const grid = el("div", undefined, "lanes");
  let selected;
  let moved;
  progress.setAttribute("role", "status");
  announcement.setAttribute("role", "status");
  board.append(
    el("h2", "Investigation board"),
    el("p", state.filed
      ? "Your board is filed. Revise your deduction to move cards again."
      : "Open a file to add its card. Drag cards between categories, or select a card and use a Move here button.", "muted"),
    progress, announcement, grid
  );

  function move(id, category) {
    if (state.filed || !state.found[id] || !Object.hasOwn(lanes, category)) return;
    if (category === "unsorted") delete state.readings[id];
    else state.readings[id] = category;
    selected = undefined;
    moved = id;
    save();
    update();
    announcement.textContent = `${files.find((file) => file.id === id).title} Moved to ${lanes[category]}.`;
    grid.querySelector(`[data-card="${id}"]`).focus({ preventScroll: true });
  }

  function refresh() {
    const discovered = files.filter((file) => state.found[file.id]).length;
    const examined = files.filter((file) => state.readings[file.id]).length;
    const text = `${discovered}/3 files opened · ${examined}/3 details examined${examined === files.length && !state.filed ? " · Deduction ready" : ""}`;
    if (progress.textContent !== text) progress.textContent = text;
    grid.replaceChildren(...Object.entries(lanes).map(([category, name]) => {
      const lane = el("section", undefined, "lane");
      lane.dataset.category = category;
      const heading = el("h3", name);
      heading.id = `lane-${category}`;
      lane.setAttribute("aria-labelledby", heading.id);
      lane.append(heading);
      const inLane = files.filter((file) => state.found[file.id] && (state.readings[file.id] || "unsorted") === category);
      if (!inLane.length) lane.append(el("p", "No cards yet", "empty-lane"));
      for (const file of inLane) {
        let pointerStart;
        let ghost;
        let target;
        let suppressClick = false;
        const card = button(file.title, () => {
          if (suppressClick) return;
          selected = selected === file.id ? undefined : file.id;
          refresh();
          grid.querySelector(`[data-card="${file.id}"]`).focus({ preventScroll: true });
        }, `evidence-card${moved === file.id ? " just-moved" : ""}`);
        card.dataset.card = file.id;
        card.disabled = state.filed;
        card.setAttribute("aria-pressed", String(selected === file.id));
        card.addEventListener("pointerdown", (event) => {
          if (state.filed || event.button !== 0 || !event.isPrimary) return;
          pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
          card.setPointerCapture(event.pointerId);
        });
        card.addEventListener("pointermove", (event) => {
          if (pointerStart?.id !== event.pointerId) return;
          if (!ghost) {
            if (Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) < 8) return;
            ghost = el("div", file.title, "evidence-card drag-ghost");
            ghost.setAttribute("aria-hidden", "true");
            ghost.style.width = `${card.offsetWidth}px`;
            document.body.append(ghost);
            card.classList.add("dragging");
          }
          ghost.style.left = `${Math.max(0, Math.min(event.clientX + 12, innerWidth - ghost.offsetWidth))}px`;
          ghost.style.top = `${Math.max(0, Math.min(event.clientY + 12, innerHeight - ghost.offsetHeight))}px`;
          const next = document.elementFromPoint(event.clientX, event.clientY)?.closest(".lane");
          if (next === target) return;
          target?.classList.remove("drop-target");
          target = next?.dataset.category !== category ? next : undefined;
          target?.classList.add("drop-target");
        });
        function endDrag(event) {
          if (pointerStart?.id !== event.pointerId) return;
          pointerStart = undefined;
          if (!ghost) return;
          ghost.remove();
          ghost = undefined;
          card.classList.remove("dragging");
          const destination = target?.dataset.category;
          target?.classList.remove("drop-target");
          target = undefined;
          suppressClick = true;
          setTimeout(() => { suppressClick = false; }, 0);
          if (event.type === "pointerup" && destination) move(file.id, destination);
        }
        card.addEventListener("pointerup", endDrag);
        card.addEventListener("pointercancel", endDrag);
        card.addEventListener("lostpointercapture", endDrag);
        lane.append(card);
      }
      if (selected && (state.readings[selected] || "unsorted") !== category) {
        const action = button("Move here", () => move(selected, category), "secondary move-here");
        action.setAttribute("aria-label", `Move selected card to ${name}`);
        lane.append(action);
      }
      return lane;
    }));
    moved = undefined;
  }
  return { board, refresh };
}

function deduction(onFile) {
  const section = el("section", undefined, "card deduction");
  const pending = el("p", "Move all three cards into evidence categories to unlock your deduction.", "muted");
  const form = el("form");
  const verdict = selectInput("verdict", "Your verdict on the whole claim", verdicts, state.verdict);
  verdict.select.required = true;
  const label = el("label", "Your reasoning");
  label.htmlFor = "reason";
  const reason = el("textarea");
  Object.assign(reason, { id: "reason", required: true, maxLength: 1500, value: state.reason });
  reason.setAttribute("aria-describedby", "reason-hint");
  const hint = el("p", "Use a detail from an evidence file and say what still needs checking.", "muted");
  hint.id = "reason-hint";
  const submit = el("button", "File deduction and compare");
  submit.type = "submit";
  const error = el("p", "", "error");
  error.setAttribute("role", "status");
  form.append(verdict.field, label, hint, reason, error, submit);
  form.addEventListener("input", () => {
    state.verdict = verdict.select.value;
    state.reason = reason.value;
    error.textContent = "";
    save();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!files.every((file) => state.found[file.id] && state.readings[file.id])) return;
    if (!Object.hasOwn(verdicts, verdict.select.value)) return;
    if (!reason.value.trim()) {
      error.textContent = "Write a short reason before filing your deduction.";
      reason.focus();
      return;
    }
    state.verdict = verdict.select.value;
    state.reason = reason.value.trim();
    state.filed = true;
    save();
    onFile();
  });
  section.append(el("h2", "File your deduction"), pending, form);
  return { section, pending, form };
}

function completion() {
  const human = assessment();
  const section = el("section", undefined, "card completion");
  const grid = el("div", undefined, "comparison");
  const yours = el("article", undefined, "card");
  yours.append(el("h3", "Your deduction"), el("p", verdicts[state.verdict]), el("p", state.reason, "response"));
  const documented = el("article", undefined, "card");
  documented.append(
    el("h3", "Janine’s documented assessment"),
    el("p", human.review_status === "needs_review" ? "Awaiting independent review" : "See the record for review status", "status"),
    el("p", verdicts[human.overall_verdict.label]),
    el("p", human.reasoning),
    el("p", human.uncertainty_note, "muted")
  );
  grid.append(yours, documented);
  const actions = el("div", undefined, "actions");
  actions.append(
    button("Revise my deduction", () => {
      state.filed = false;
      save();
      render(false);
      document.querySelector("#verdict").focus();
    }, "secondary"),
    link("Preview A03 · Time and Context", "#A03", "button"),
    link("Return to the mission desk", "#missions", "button secondary")
  );
  const heading = title("h2", "Investigation filed");
  heading.id = "filed";
  section.append(
    el("p", "Mission complete", "eyebrow"),
    heading,
    el("p", "You opened three files and examined three claim details. Skill practiced: checking what a source leaves unresolved."),
    el("p", "Compare the evidence behind each explanation. Which detail explains any difference? What would you check next?"),
    grid,
    actions
  );
  return section;
}

function investigation() {
  const hero = el("section", undefined, "hero");
  hero.append(
    link("Return to the mission desk", "#missions"),
    el("p", "A04 · Starter mission", "eyebrow"),
    title("h1", "The Missing Evidence"),
    el("p", "Open three files, move their cards into evidence categories, then file a verdict for the full claim.", "intro")
  );
  const claim = el("section", undefined, "card claim");
  claim.append(el("h2", "The claim · Public summary"), el("p", record.claim.text));
  const layout = el("div", undefined, "board-layout");
  const stack = el("section");
  const { board, refresh } = investigationBoard(update);
  const filing = deduction(() => {
    render(false);
    document.querySelector("#filed").focus();
  });
  function update() {
    const examined = files.filter((file) => state.readings[file.id]).length;
    refresh();
    filing.pending.hidden = examined === files.length;
    filing.form.hidden = examined !== files.length;
  }
  stack.append(el("h2", "Evidence files"), ...files.map((file, index) => evidenceFile(file, index, update)), sourcePanel());
  layout.append(stack, board);
  update();
  return [hero, claim, layout, state.filed ? completion() : filing.section];
}

function render(focus = true) {
  const id = location.hash.slice(1);
  const mission = missions.find((item) => item.id === id);
  view.replaceChildren(...(id === "A04" ? investigation()
    : mission ? [preview(mission)] : id === "missions" ? missionGrid() : [welcome()]));
  if (focus) view.querySelector("h1").focus();
}

async function start() {
  try {
    const response = await fetch("../../records/pilot-a04.json");
    if (!response.ok) throw new Error("Record unavailable");
    record = await response.json();
    if (record.claim_id !== "A04" || !assessment()) throw new Error("Unexpected record");
    loading.hidden = true;
    render(false);
    document.querySelector(".skip").addEventListener("click", (event) => {
      event.preventDefault();
      document.querySelector("#desk").focus();
    });
    window.addEventListener("hashchange", () => render());
  } catch {
    loading.hidden = false;
    loading.className = "error";
    loading.textContent = "The case file couldn’t be opened. Refresh to try again or use the Markdown lesson below.";
  }
}

start();

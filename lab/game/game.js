"use strict";

const missions = [
  { id: "A01", title: "Guided investigation", skill: "Compare an average with an approximate age.", track: "Starter" },
  { id: "A04", title: "The Missing Evidence", skill: "Follow an estimate. Find what the source leaves unresolved.", track: "Starter" },
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

const readings = {
  backs: "The passage backs this detail",
  narrower: "The passage backs a narrower detail",
  missing: "This detail needs more evidence"
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

function missionGrid() {
  const hero = el("section", undefined, "hero");
  hero.append(
    el("p", "Wikipedia case files", "eyebrow"),
    title("h1", "The mission desk"),
    el("p", "Open evidence files, connect them to claim details, and file your own deduction. Check what the cited source supports.", "intro"),
    el("p", state.filed ? "Playable mission complete · 1 of 1" : "One playable mission · Four mission previews", "status")
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
    el("p", "This mission is available as a lesson in the original lab. The game version is planned.", "muted"),
    link("Open the original learning lab", "../", "button"),
    el("p"),
    link("Return to the mission desk", "#missions")
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
  const choice = selectInput(`reading-${file.id}`, "What does this evidence establish?", readings, state.readings[file.id]);
  choice.select.disabled = state.filed;
  body.append(
    el("p", "Evidence summary", "eyebrow"),
    el("p", file.clue),
    el("p", `Claim detail · ${claimDetail(file.id)}`, "muted"),
    choice.field
  );
  disclosure.append(summary, body);
  disclosure.addEventListener("toggle", () => {
    if (!disclosure.open || state.found[file.id]) return;
    state.found[file.id] = true;
    status.textContent = "Opened";
    save();
    update();
  });
  choice.select.addEventListener("change", () => {
    state.readings[file.id] = choice.select.value;
    save();
    update();
  });
  return disclosure;
}

function deduction(onFile) {
  const section = el("section", undefined, "card deduction");
  const pending = el("p", "Open the three files and record what each one establishes to unlock your deduction.", "muted");
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
    el("p", "An estimate has three details to check. Open each file, decide what the passage establishes, then file a verdict for the full claim.", "intro")
  );
  const claim = el("section", undefined, "card claim");
  claim.append(el("h2", "The claim · Public summary"), el("p", record.claim.text));
  const layout = el("div", undefined, "board-layout");
  const stack = el("section");
  const board = el("section", undefined, "board");
  const progress = el("p", "", "status");
  progress.setAttribute("role", "status");
  const entries = el("ol");
  board.append(el("h2", "Investigation board"), progress, entries);
  const filing = deduction(() => {
    render(false);
    document.querySelector("#filed").focus();
  });
  function update() {
    const discovered = files.filter((file) => state.found[file.id]).length;
    const examined = files.filter((file) => state.readings[file.id]).length;
    const text = `${discovered}/3 files opened · ${examined}/3 details examined${examined === files.length && !state.filed ? " · Deduction ready" : ""}`;
    if (progress.textContent !== text) progress.textContent = text;
    entries.replaceChildren(...files.map((file) => {
      const item = el("li");
      item.append(el("strong", file.title), el("span", state.readings[file.id]
        ? readings[state.readings[file.id]]
        : state.found[file.id] ? "Open question · Add your reading" : "Unresolved · File unopened"));
      return item;
    }));
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
  view.replaceChildren(...(id === "A04" ? investigation() : mission ? [preview(mission)] : missionGrid()));
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

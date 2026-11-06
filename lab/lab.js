"use strict";

// Teaching copy lives here. The claim, evidence locations and documented
// assessments are read from the public benchmark records at runtime.
const lessons = {
  A01: {
    goal: "See when an average supports an approximate claim.",
    evidence: "The paper reports an average age of nine days for young American pikas to open their eyes and credits earlier research.",
    prompt: "An average describes a typical age. Does the claim allow individual animals to open their eyes earlier or later?"
  },
  A04: {
    goal: "Check who made the estimate, how large it was, and whether the source gives a clinic count.",
    evidence: "The article names the Confederation of Indian Industry, gives its annual estimate of US$2.3 billion, and describes clinics that offer surrogacy across India without giving a total.",
    prompt: "Point to one detail the source backs and one it leaves uncertain. What evidence would settle the uncertain detail?"
  },
  A03: {
    goal: "Check whether the evidence applies to the right place and time.",
    evidence: "The paper describes a change away from partly nomadic herding in Mongolia in the 1960s.",
    prompt: "Does evidence about a past change in Mongolia tell you what happens today or elsewhere? What would you look for next?"
  },
  A08: {
    goal: "Check whether evidence about a related topic answers the claim’s question.",
    evidence: "The article describes a hair-care method and its longstanding popularity. The recorded passage does not examine representation in media, fashion, or workplaces.",
    prompt: "What evidence could connect the method’s popularity to a broader change in beauty standards?"
  },
  B09: {
    goal: "Separate editing rules from research findings, and check what the study measured.",
    evidence: "The abstract discusses how reliable contributions were for different groups of editors. It does not establish how much each group contributed relative to the others.",
    prompt: "Pick one of the three parts. What can you learn from the source, and what would you check next?"
  }
};

const verdicts = {
  supported: "Supported",
  partially_supported: "Partially supported",
  compatible_not_confirmed: "Compatible but unconfirmed",
  not_supported: "Not supported",
  contradicted: "Contradicted",
  insufficient_access: "I couldn’t access enough evidence"
};
const challenges = ["A03", "A08", "B09"];
const storageKey = "claim-verification-lab-v1";
const workspace = document.querySelector("#workspace");
const explore = document.querySelector("#explore");
const loading = document.querySelector("#loading");
const progress = document.querySelector("#progress-text");
const records = {};
let current = "A01";
let saved = {};

try {
  saved = JSON.parse(sessionStorage.getItem(storageKey)) || {};
} catch {
  // The lab also works when browser storage is unavailable.
}

function remember() {
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(saved));
  } catch {
    // The current page still retains responses in memory.
  }
}

function node(tag, text, className) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
}

function button(label, action, className) {
  const element = node("button", label, className);
  element.type = "button";
  element.addEventListener("click", action);
  return element;
}

function heading(level, text, id) {
  const element = node(level, text);
  element.id = id;
  element.tabIndex = -1;
  return element;
}

function human(record) {
  return record.assessments.find((assessment) => assessment.kind === "human_original");
}

function evidencePanel(record) {
  const panel = node("div", undefined, "card");
  panel.append(node("p", "Public claim summary", "label"), node("p", record.claim.text, "claim"));
  const details = node("details");
  details.open = current === "A01";
  details.append(
    node("summary", "Explore the evidence"),
    node("p", "Instructional paraphrase", "label"),
    node("p", lessons[current].evidence),
    node("p", "Use the links to read the original sources. The public record points to the passages without reproducing them.", "muted")
  );
  for (const source of record.sources) {
    const link = node("a", `Open cited source for ${record.claim_id}`);
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.append(" (new tab)");
    details.append(link, node("p", source.citation_text, "muted"));
    const locations = new Set(human(record).evidence
      .filter((item) => item.source_id === source.source_id)
      .map((item) => item.location.raw));
    for (const location of locations) {
      details.append(node("p", `Recorded passage location · ${location || "Unavailable"}`));
    }
  }
  panel.append(details);
  if (current === "B09") {
    panel.append(node("h3", "Three parts to investigate"));
    const list = node("ol");
    for (const part of record.sub_claims) {
      const item = node("li");
      const [title, ...rest] = part.note.split(". ");
      item.append(
        node("strong", `${part.sub_claim_id.toUpperCase().replace(/\.([ABC])$/, (_, letter) => "." + letter.toLowerCase())} — ${title}`),
        node("p", part.text),
        node("p", "No individual assessment recorded.", "label"),
        node("p", rest.join(". ").replace(/^Later evidence review, with no subclaim verdict assigned: /, "Evidence note: "))
      );
      list.append(item);
    }
    panel.append(list);
  }
  return panel;
}

function assessmentPanel(record, answer, openInvestigation) {
  const panel = node("section", undefined, "card");
  panel.append(
    node("h3", openInvestigation ? "Your investigation" : "Your assessment"),
    node("p", lessons[current].prompt)
  );
  const form = node("form");
  if (!openInvestigation) {
    const fieldset = node("fieldset");
    const choices = node("div", undefined, "choices");
    fieldset.append(node("legend", "What does the cited source support?"), choices);
    for (const [value, label] of Object.entries(verdicts)) {
      const option = node("label", undefined, "choice");
      const input = node("input");
      Object.assign(input, { type: "radio", name: "verdict", value, required: true, checked: answer.verdict === value });
      option.append(input, label);
      choices.append(option);
    }
    form.append(fieldset);
  }
  const label = node("label", openInvestigation ? "Your evidence and next check" : "Why did you choose that verdict?");
  label.htmlFor = "reason";
  const hint = node("p", "One or two sentences is enough. Name a detail from the source, or explain what you couldn’t access.", "muted");
  hint.id = "reason-hint";
  const reason = node("textarea");
  Object.assign(reason, { id: "reason", name: "reason", required: true, maxLength: 1500, value: answer.reason || "" });
  reason.setAttribute("aria-describedby", hint.id);
  const submit = node("button", openInvestigation ? "Save note and see the original assessment" : "Save my assessment and compare");
  submit.type = "submit";
  form.append(label, hint, reason, submit);
  form.addEventListener("input", () => reason.setCustomValidity(""));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = reason.value.trim();
    if (!text) {
      reason.setCustomValidity("Write a short reason before continuing.");
      reason.reportValidity();
      return;
    }
    const verdict = new FormData(form).get("verdict");
    if (!openInvestigation && !Object.hasOwn(verdicts, verdict)) return;
    saved[record.claim_id] = { verdict, reason: text, submitted: true };
    remember();
    render(false);
    document.querySelector("#comparison-title").focus();
  });
  panel.append(form);
  return panel;
}

function documented(record) {
  const assessment = human(record);
  const box = node("div", undefined, "card");
  box.append(
    node("h3", record.claim_id === "B09" ? "Janine’s original overall assessment" : "Janine’s documented assessment"),
    node("p", assessment.review_status === "needs_review" ? "Awaiting independent review" : "See the benchmark record for review status", "review"),
    node("p", verdicts[assessment.overall_verdict.label]),
    node("p", assessment.reasoning)
  );
  if (assessment.uncertainty_note) box.append(node("p", `Uncertainty · ${assessment.uncertainty_note}`, "muted"));
  if (assessment.sub_claim_judgments?.length) {
    const list = node("ul");
    for (const judgment of assessment.sub_claim_judgments) {
      const part = record.sub_claims.find((entry) => entry.sub_claim_id === judgment.sub_claim_id);
      list.append(node("li", `${part.text} · ${verdicts[judgment.label]}`));
    }
    box.append(list);
  }
  return box;
}

function comparison(record, answer) {
  const panel = node("section", undefined, "feedback");
  panel.setAttribute("aria-labelledby", "comparison-title");
  const own = node("div", undefined, "card");
  own.append(node("h3", current === "B09" ? "Your investigation note" : "Your assessment"));
  if (answer.verdict) own.append(node("p", verdicts[answer.verdict]));
  own.append(node("p", answer.reason, "reasoning"));
  const pair = node("div", undefined, "columns");
  pair.append(own, documented(record));
  const actions = node("div", undefined, "actions");
  actions.append(button("Revise my reasoning", () => {
    answer.submitted = false;
    remember();
    render(false);
    document.querySelector("#reason").focus();
  }, "secondary"));
  panel.append(
    heading("h3", current === "B09" ? "Review your investigation" : "Compare the reasoning", "comparison-title"),
    node("p", current === "B09"
      ? "The original judgment applies to the full claim. Compare your note with its evidence and decide what you would investigate next."
      : "Look at the evidence behind each judgment. Where do the explanations agree? If they differ, which detail or assumption accounts for the difference?"),
    pair,
    actions
  );
  return panel;
}

function render(focus = true) {
  const record = records[current];
  const answer = saved[current] || {};
  const guided = current === "A01";
  const investigation = current === "B09";
  progress.textContent = guided ? "Starter · Step 1 of 2 · Guided example"
    : current === "A04" ? (answer.submitted ? "Starter complete · 2 of 2" : "Starter · Step 2 of 2 · Independent assessment")
    : "Optional challenge";
  const columns = node("div", undefined, answer.submitted ? "" : "columns");
  columns.append(evidencePanel(record));
  if (guided) {
    const guide = node("div", undefined, "card");
    guide.append(
      node("h3", "Think it through"),
      node("p", lessons.A01.prompt),
      node("p", "Yes. “About nine days” leaves room for variation and fits the average reported by the source."),
      documented(record),
      button("Continue to A04", () => go("A04"))
    );
    columns.append(guide);
  } else if (!answer.submitted) {
    columns.append(assessmentPanel(record, answer, investigation));
  }
  workspace.replaceChildren(
    heading("h2", `${current} · ${record.article.title}`, "case-title"),
    node("p", lessons[current].goal, "case-intro"),
    columns
  );
  if (answer.submitted) workspace.append(comparison(record, answer));
  if (!guided) {
    const back = node("div", undefined, "actions");
    back.append(button(current === "A04" ? "Back to the guided example" : "Back to the starter", () => go(current === "A04" ? "A01" : "A04"), "secondary"));
    workspace.append(back);
  }
  renderChallenges();
  if (focus) document.querySelector("#case-title").focus();
}

function renderChallenges() {
  explore.hidden = !saved.A04?.reason;
  if (explore.hidden) return;
  const list = node("div", undefined, "challenge-list");
  for (const id of challenges) {
    const card = node("div", undefined, "card");
    card.append(
      node("h3", `${id} · ${records[id].article.title}`),
      node("p", lessons[id].goal),
      button(current === id ? "Return to this challenge" : saved[id]?.reason ? "Revisit " + id : "Open " + id, () => go(id), "secondary")
    );
    list.append(card);
  }
  explore.replaceChildren(heading("h2", "Explore more cases", "explore-title"), list);
}

function go(id) {
  current = id;
  render();
}

async function start() {
  if (["localhost", "127.0.0.1"].includes(location.hostname)) {
    document.querySelector(".site-header a").href = "../learn/README.md";
  }
  try {
    await Promise.all(Object.keys(lessons).map(async (id) => {
      const response = await fetch(`../records/pilot-${id.toLowerCase()}.json`);
      if (!response.ok) throw new Error(`Could not load ${id}`);
      const record = await response.json();
      if (record.claim_id !== id || !human(record)) throw new Error(`Unexpected record for ${id}`);
      records[id] = record;
    }));
    workspace.hidden = false;
    loading.hidden = true;
    render(false);
  } catch {
    workspace.hidden = true;
    loading.hidden = false;
    loading.textContent = "The cases couldn’t be loaded. Refresh to try again, or use the Markdown lesson linked above.";
    loading.className = "error";
  }
}

start();

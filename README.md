# Wikipedia Claim–Source Verification Benchmark Pilot

**Version 0.1.0 — an exploratory five-record pilot**

This Outreachy project turns five real cases from Janine Makorre’s Claim Verification Report into structured records for checking what a cited source supports. Each record retains the original human verdict and three historical AI assessments. The public copy uses labeled summaries of claim wording and reasoning, with citations and recorded passage locations in place of source quotations.

The schema, validator, tests, and example evaluator can all run locally. The five human reference candidates still need individual evidence review and independent assessment. The example run checks the workflow and produces no model performance scores.

## Run locally

From the repository root, with Python 3.9 or later:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe scripts/validate_records.py --show-review
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
.\.venv\Scripts\python.exe scripts/evaluate.py predictions/example-predictions.jsonl
```

On macOS and Linux, substitute `.venv/bin/python` for the virtual environment executable. The scripts use local files and require no model API or credentials.

## What the pilot contains

| Claim | Topic | Original human verdict | Confidence |
| --- | --- | --- | --- |
| A01 | American pika | Supported | High |
| A03 | Extensive farming | Not supported | High |
| A04 | Surrogacy in India | Partially supported | Medium |
| A08 | Curly Girl Method | Not supported | High |
| B09 | Reliability of Wikipedia | Partially supported | Medium |

The draft-07 schema uses five support labels: `supported`, `partially_supported`, `compatible_not_confirmed`, `not_supported` and `contradicted`. `needs_review` is a workflow marker. Use a null verdict when the source is inaccessible, the available evidence is insufficient to judge support, or assessability is unresolved. The validator checks identifiers, cross-references, assessability and evidence. Roll-up discrepancies are reported for review while preserving the recorded overall verdict.

For compound claims, record separately checkable subclaims and link each judgment to its evidence. A mix of support and contradiction rolls up to partial support and retains the contradicted subclaim. The [annotation guidelines](annotation-guidelines.md) explain the decision rules and evidence format.

## Predictions and scoring

Each JSONL line contains `claim_id`, `system_name`, `system_version` and `predicted_verdict`. Use one of the five support labels from the guidelines or `abstain`. Use one row per claim, system and version. The example contains 14 historical test inputs transcribed from explicitly stated AI outcomes, including one abstention. A01 ChatGPT gave no explicit verdict and has no prediction row.

Reference eligibility identifies candidate human assessments. Scoring requires individually confirmed, assessable human judgments backed by recorded evidence or a documented unsuccessful search. Compound references require complete, confirmed subclaim judgments. Pending or contested references are skipped with a reason. A skipped prediction can carry an abstention, which is counted separately as a submitted abstention. The example submits 14 predictions and scores zero comparisons because all five references await individual approval.

Scored rows show the reference's adjudication status. The separate unscored diagnostics report recorded contradictions, structured subclaim labels and differences where multiple assessments label the same subclaim. A04 provides human subclaim labels. Its historical AI assessments provide overall verdicts, so the evaluator makes no AI subclaim comparison for A04.

Any later approved single-assessor reference remains provisional. Keep independent human reviews as separate assessments and preserve disagreements. The historical AI outputs have incomplete run metadata. They can exercise the scoring code but cannot reproduce the original model runs.

## Contribute

Contributors can report schema or tooling issues, review source attribution, or submit independent assessments. Record an independent judgment before reading other assessments. Add it as a separate `human_independent_review` entry with the evidence, locations and any known exposure. Compare reviews after saving them. Preserve both judgments, record the cause of disagreement and document any agreement or adjudication separately. Run validation and tests before submitting a patch. Share source links and passage locations in public issues and pull requests. Keep private material and quotations with unresolved reuse rights in the review copy.

The [handoff checklist](docs/HANDOFF.md) records 46 open items, including the original Wikipedia revisions, reference approval, A04 transcript verification, and the proposed B09 split. See [release notes](RELEASE_NOTES.md) and [attribution and license notices](NOTICE.md).

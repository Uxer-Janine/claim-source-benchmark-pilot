"""Compare JSONL predictions with approved human references."""

import argparse
from collections import Counter
import json
from pathlib import Path

from jsonschema.exceptions import SchemaError

if __package__:
    from .validate_records import ROOT, RECORDS, SCHEMA, has_evidence, load_records, read_json, reference_decision_errors, rollup, validate
else:
    from validate_records import ROOT, RECORDS, SCHEMA, has_evidence, load_records, read_json, reference_decision_errors, rollup, validate

BANNER = "SMOKE TEST ONLY — Five provisional pilot records. Not a measure of model performance."
CATEGORIES = ("match", "mismatch", "abstention", "skipped")
PREDICTION_FIELDS = {"claim_id", "system_name", "system_version", "predicted_verdict"}


def load_predictions(path, verdicts):
    predictions = []
    seen = set()
    for number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            row = json.loads(line)
        except json.JSONDecodeError as exc:
            raise ValueError(f"{path}:{number}: {exc.msg}") from exc
        if (
            not isinstance(row, dict)
            or set(row) != PREDICTION_FIELDS
            or any(not isinstance(value, str) or not value.strip() for value in row.values())
        ):
            raise ValueError(f"{path}:{number}: expected four non-empty strings: {sorted(PREDICTION_FIELDS)}")
        if row["predicted_verdict"] not in verdicts | {"abstain"}:
            raise ValueError(f"{path}:{number}: invalid predicted_verdict")
        key = (row["claim_id"], row["system_name"], row["system_version"])
        if key in seen:
            raise ValueError(f"{path}:{number}: duplicate claim/system/version")
        seen.add(key)
        predictions.append(row)
    return predictions


def reference_for(record):
    ref = record["adjudication"]
    if ref["status"] in {"contested_unresolved", "needs_review"}:
        return None, f"reference status is {ref['status']}"
    if ref["reference_label"] in {None, "needs_review"}:
        return None, "reference label is unresolved"
    decision_errors = reference_decision_errors(record)
    if decision_errors:
        return None, "; ".join(decision_errors)
    by_id = {assessment["assessment_id"]: assessment for assessment in record["assessments"]}
    assessments = [by_id[identifier] for identifier in ref["reference_assessment_ids"]]
    subclaim_ids = {subclaim["sub_claim_id"] for subclaim in record["sub_claims"]}
    for assessment in assessments:
        if assessment["review_status"] != "confirmed":
            return None, "human reference approval is pending"
        if (
            assessment["assessability"]["status"] != "assessable"
            or assessment["overall_verdict"]["label"] in {None, "needs_review"}
            or not has_evidence(assessment)
        ):
            return None, "reference verdict or evidence is unresolved"
        if ref["status"] == "agreed":
            # The shared decision check already verified complete, matching subclaim verdicts.
            continue
        judgments = assessment.get("sub_claim_judgments", [])
        if any(j["review_status"] != "confirmed" or j["label"] == "needs_review" for j in judgments):
            return None, "reference subclaim review is pending"
        expected = rollup(assessment, subclaim_ids)
        if len(subclaim_ids) > 1 and expected is None:
            return None, "reference subclaim judgments are incomplete"
        if expected is not None and expected != assessment["overall_verdict"]["label"]:
            return None, "reference subclaims and overall verdict disagree"
    if ref["status"] not in {"agreed", "adjudicated"}:
        return None, "scoring requires agreement or adjudication based on two independent human assessments"
    return (ref["reference_label"], assessments), None


def evaluate(records, predictions):
    by_claim = {record["claim_id"]: record for record in records}
    for prediction in predictions:
        record = by_claim.get(prediction["claim_id"])
        if record is None:
            yield prediction, "skipped", "claim ID absent from records", []
            continue
        reference, reason = reference_for(record)
        if reference is None:
            yield prediction, "skipped", reason, []
            continue
        label, assessments = reference
        detail = f"human reference {label} ({record['adjudication']['status']})"
        if prediction["predicted_verdict"] == "abstain":
            yield prediction, "abstention", detail, []
        elif prediction["predicted_verdict"] == label:
            yield prediction, "match", detail, []
        else:
            citations = {source["source_id"]: source for source in record["sources"]}
            evidence = []
            for assessment in assessments:
                for item in assessment["evidence"]:
                    source = citations[item["source_id"]]
                    passage = item["passage_text"] or "consult the cited passage"
                    evidence.append(
                        f"{item['role']}: {passage} "
                        f"[{item['location']['raw'] or 'location unrecorded'}; "
                        f"{source['url'] or source['citation_text'].strip()}]"
                    )
                if not assessment["evidence"]:
                    evidence.append(f"Search note: {assessment.get('search_note')}")
            yield prediction, "mismatch", detail, evidence


def annotation_diagnostics(record):
    """Report recorded judgments, independently of reference approval and scoring."""
    labels_by_subclaim = {}
    for assessment in record["assessments"]:
        identifier = assessment["assessment_id"]
        prefix = f"{record['claim_id']} | {identifier}"
        if assessment["overall_verdict"]["label"] == "contradicted":
            yield f"{prefix} | overall contradiction recorded"
        for judgment in assessment.get("sub_claim_judgments", []):
            subclaim_id = judgment["sub_claim_id"]
            label = judgment["label"]
            contradiction = " | contradiction recorded" if label == "contradicted" else ""
            yield f"{prefix} | {subclaim_id} = {label} ({judgment['review_status']}){contradiction}"
            if label != "needs_review":
                labels_by_subclaim.setdefault(subclaim_id, set()).add(label)
    for subclaim_id, labels in labels_by_subclaim.items():
        if len(labels) > 1:
            yield f"{record['claim_id']} | {subclaim_id} | disagreement: {', '.join(sorted(labels))}"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("predictions", type=Path, nargs="?", default=ROOT / "predictions/example-predictions.jsonl")
    parser.add_argument("--records", type=Path, default=RECORDS)
    args = parser.parse_args()
    print(BANNER)
    try:
        schema = read_json(SCHEMA)
        records = load_records(args.records)
        errors, warnings = validate(records, schema)
        if errors:
            raise ValueError("\n".join(errors))
        verdicts = set(schema["definitions"]["verdictLabel"]["enum"]) - {"needs_review"}
        predictions = load_predictions(args.predictions, verdicts)
    except (OSError, ValueError, SchemaError) as exc:
        parser.exit(1, f"ERROR: {exc}\n")
    for warning in warnings:
        print(f"WARNING: {warning}")
    totals = Counter()
    skipped_claims = set()
    submitted_abstentions = 0
    for row, result, detail, evidence in evaluate([r for _, r in records], predictions):
        totals[result] += 1
        if result == "skipped":
            skipped_claims.add(row["claim_id"])
        submitted_abstentions += row["predicted_verdict"] == "abstain"
        print(f"{row['claim_id']} | {row['system_name']} [{row['system_version']}] | "
              f"{row['predicted_verdict']} | {result} — {detail}")
        for item in evidence:
            print(f"  {item}")
    print("Totals: " + ", ".join(f"{category}={totals[category]}" for category in CATEGORIES))
    print(f"Predictions: {len(predictions)}; skipped claim IDs: {len(skipped_claims)}; "
          f"submitted abstentions (including skipped): {submitted_abstentions}")
    print("Recorded annotation diagnostics (unscored)")
    for _, record in records:
        for message in annotation_diagnostics(record):
            print(message)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

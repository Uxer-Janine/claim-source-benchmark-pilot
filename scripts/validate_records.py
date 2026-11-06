"""Validate the draft-07 records and relationships within the collection."""

import argparse
import json
from pathlib import Path

from jsonschema import Draft7Validator
from jsonschema.exceptions import SchemaError

ROOT = Path(__file__).resolve().parents[1]
SCHEMA = ROOT / "schema" / "claim.schema.json"
RECORDS = ROOT / "records"


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def rollup(assessment, subclaim_ids):
    """Apply the approved rule to a complete set of mapped judgments."""
    judgments = assessment.get("sub_claim_judgments", [])
    if not judgments or {j["sub_claim_id"] for j in judgments} != subclaim_ids:
        return None
    labels = {j["label"] for j in judgments}
    if "needs_review" in labels:
        return None
    if labels == {"supported"}:
        return "supported"
    if labels & {"supported", "partially_supported"}:
        return "partially_supported"
    if "compatible_not_confirmed" in labels:
        return "compatible_not_confirmed"
    if "contradicted" in labels:
        return "contradicted"
    return "not_supported"


def has_evidence(assessment):
    if assessment["evidence_status"] == "recorded":
        return bool(assessment["evidence"]) and all(
            (item["passage_text"] or "").strip() for item in assessment["evidence"]
        )
    if assessment["evidence_status"] == "locator_only":
        return bool(assessment["evidence"]) and all(
            item["passage_text"] is None and (item["location"].get("raw") or "").strip()
            for item in assessment["evidence"]
        )
    return (
        assessment["evidence_status"] == "none_found_after_search"
        and assessment["overall_verdict"]["label"] == "not_supported"
        and bool((assessment.get("search_note") or "").strip())
    )


def validate(records, schema):
    """Return errors and advisory roll-up warnings without modifying records."""
    Draft7Validator.check_schema(schema)
    validator = Draft7Validator(schema)
    errors, warnings = [], []
    seen = {}

    def register(kind, identifier, where):
        namespace = seen.setdefault(kind, {})
        if identifier in namespace:
            errors.append(f"{where}: duplicate {kind} {identifier} (first in {namespace[identifier]})")
        else:
            namespace[identifier] = where

    for filename, record in records:
        schema_errors = sorted(
            validator.iter_errors(record), key=lambda error: error.json_path
        )
        if schema_errors:
            errors.extend(
                f"{filename} {error.json_path}: {error.message}" for error in schema_errors
            )
            continue

        register("record_id", record["record_id"], filename)
        register("claim_id", record["claim_id"], filename)
        for field, collection in [
            ("source_id", record["sources"]),
            ("sub_claim_id", record["sub_claims"]),
        ]:
            for item in collection:
                register(field, item[field], filename)
        source_ids = {s["source_id"] for s in record["sources"]}
        subclaim_ids = {s["sub_claim_id"] for s in record["sub_claims"]}
        unsplit = [s for s in record["sub_claims"] if s["split_type"] == "none"]
        if unsplit and (
            len(record["sub_claims"]) != 1 or unsplit[0]["text"] != record["claim"]["text"]
        ):
            errors.append(f"{filename}: an unsplit claim must have one identical subclaim")

        assessments = {}
        for assessment in record["assessments"]:
            identifier = assessment["assessment_id"]
            where = f"{filename}/{identifier}"
            register("assessment_id", identifier, filename)
            assessments[identifier] = assessment
            label = assessment["overall_verdict"]["label"]
            if assessment["assessability"]["status"] != "assessable" and label is not None:
                errors.append(f"{where}: unassessable or unresolved assessment must have a null verdict")
            if assessment["reference_eligible"] and (
                assessment["kind"] == "ai_generated" or assessment["assessor"]["type"] != "human"
            ):
                errors.append(f"{where}: reference eligibility is human-only")

            evidence_ids = set()
            for evidence in assessment["evidence"]:
                evidence_id = evidence["evidence_id"]
                register("evidence_id", evidence_id, where)
                evidence_ids.add(evidence_id)
                if evidence["source_id"] not in source_ids:
                    errors.append(f"{where}/{evidence_id}: unknown source reference {evidence['source_id']}")
                unknown = set(evidence.get("supports_sub_claims", [])) - subclaim_ids
                if unknown:
                    errors.append(f"{where}/{evidence_id}: unknown subclaim references {sorted(unknown)}")

            status = assessment["evidence_status"]
            if status in {"recorded", "locator_only", "none_found_after_search"} and not has_evidence(assessment):
                errors.append(f"{where}: inconsistent evidence status or missing passage/location/search note")
            if status in {"not_recorded", "none_found_after_search"} and evidence_ids:
                errors.append(f"{where}: evidence list must be empty for {status}")

            judged = set()
            for judgment in assessment.get("sub_claim_judgments", []):
                subclaim_id = judgment["sub_claim_id"]
                if subclaim_id not in subclaim_ids or subclaim_id in judged:
                    errors.append(f"{where}: unknown or duplicate subclaim judgment {subclaim_id}")
                judged.add(subclaim_id)
                unknown = set(judgment.get("evidence_ids", [])) - evidence_ids
                if unknown:
                    errors.append(f"{where}/{subclaim_id}: unknown evidence references {sorted(unknown)}")
                if label is None and judgment["label"] != "needs_review":
                    errors.append(f"{where}/{subclaim_id}: subclaim verdict conflicts with assessability")
            expected = rollup(assessment, subclaim_ids)
            if expected is not None and expected != label:
                warnings.append(
                    f"{where}: rubric roll-up gives {expected}, recorded overall verdict is {label}"
                )

        adjudication = record["adjudication"]
        refs = adjudication["reference_assessment_ids"]
        label = adjudication["reference_label"]
        status = adjudication["status"]
        if len(refs) != len(set(refs)):
            errors.append(f"{filename}: duplicate reference assessment IDs")
        if label not in {None, "needs_review"} and not refs:
            errors.append(f"{filename}: reference label needs a human assessment")
        if status == "provisional_single_assessor" and len(refs) != 1:
            errors.append(f"{filename}: a provisional single-assessor reference needs exactly one assessment")
        for identifier in refs:
            assessment = assessments.get(identifier)
            if assessment is None:
                errors.append(f"{filename}: unknown reference assessment {identifier}")
                continue
            if assessment["kind"] == "ai_generated" or not assessment["reference_eligible"]:
                errors.append(f"{filename}: reference assessment {identifier} must be an eligible human")
            if label not in {None, "needs_review"} and status in {"agreed", "provisional_single_assessor"}:
                if assessment["overall_verdict"]["label"] != label:
                    errors.append(f"{filename}: reference label differs from {identifier}'s verdict")
    return errors, warnings


def load_records(directory):
    paths = sorted(directory.glob("*.json"))
    if not paths:
        raise ValueError(f"No JSON records in {directory}")
    return [(path.name, read_json(path)) for path in paths]


def missing_fields(value):
    """Count explicit nulls and review sentinels, including inapplicable fields."""
    if isinstance(value, dict):
        return sum(missing_fields(child) for child in value.values())
    if isinstance(value, list):
        return sum(missing_fields(child) for child in value)
    return int(value is None or value == "needs_review")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--records", type=Path, default=RECORDS)
    parser.add_argument("--schema", type=Path, default=SCHEMA)
    parser.add_argument("--show-review", action="store_true")
    args = parser.parse_args()
    try:
        records = load_records(args.records)
        errors, warnings = validate(records, read_json(args.schema))
    except (OSError, ValueError, SchemaError) as exc:
        parser.exit(1, f"ERROR: {exc}\n")
    for message in errors:
        print(f"ERROR: {message}")
    for message in warnings:
        print(f"WARNING: {message}")
    if errors:
        print(f"FAIL: {len(errors)} validation error(s)")
        return 1
    review_count = 0
    for filename, record in records:
        items = record["needs_review_items"]
        review_count += len(items)
        print(f"PASS {filename}: {len(items)} review items, {missing_fields(record)} null/review values (includes inapplicable fields)")
        if args.show_review:
            for item in items:
                print(f"  {item['field']} — {item['reason']}")
    print(f"Validated {len(records)} records with {len(warnings)} warnings and {review_count} unresolved review items.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

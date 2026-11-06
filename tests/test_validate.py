from copy import deepcopy
import unittest

from scripts.validate_records import RECORDS, SCHEMA, load_records, read_json, validate


class ValidationTests(unittest.TestCase):
    def setUp(self):
        self.schema = read_json(SCHEMA)
        self.records = load_records(RECORDS)
        self.a01 = read_json(RECORDS / "pilot-a01.json")

    def errors_for(self, record):
        errors, _ = validate([("fixture.json", record)], self.schema)
        return "\n".join(errors)

    def test_five_pilot_records_validate(self):
        self.assertEqual({r["claim_id"] for _, r in self.records}, {"A01", "A03", "A04", "A08", "B09"})
        self.assertEqual(validate(self.records, self.schema), ([], []))

    def test_invalid_schema_fields(self):
        self.a01["article"]["url"] = "example.test"
        self.a01["unexpected"] = True
        errors = self.errors_for(self.a01)
        self.assertIn("url", errors)
        self.assertIn("unexpected", errors)

    def test_duplicate_identifiers(self):
        errors, _ = validate(self.records + [("duplicate.json", deepcopy(self.a01))], self.schema)
        for kind in ["record_id", "claim_id", "assessment_id"]:
            self.assertIn(f"duplicate {kind}", "\n".join(errors))

    def test_broken_source_subclaim_evidence_and_assessment_references(self):
        record = read_json(RECORDS / "pilot-a04.json")
        human = record["assessments"][0]
        human["evidence"][0]["source_id"] = "missing-source"
        human["evidence"][0]["supports_sub_claims"] = ["missing-subclaim"]
        human["sub_claim_judgments"][0]["evidence_ids"] = ["missing-evidence"]
        record["adjudication"]["reference_assessment_ids"] = ["missing-human"]
        errors = self.errors_for(record)
        for missing in ("missing-source", "missing-subclaim", "missing-evidence", "missing-human"):
            self.assertIn(missing, errors)

    def test_ai_cannot_be_made_reference_eligible(self):
        self.a01["assessments"][1]["reference_eligible"] = True
        self.assertIn("reference_eligible", self.errors_for(self.a01))

    def test_adjudication_cannot_reference_ai(self):
        self.a01["adjudication"]["reference_assessment_ids"] = ["a01-ai2"]
        self.assertIn("must be an eligible human", self.errors_for(self.a01))

    def test_recorded_evidence_cannot_be_empty(self):
        self.a01["assessments"][0]["evidence"] = []
        self.assertIn("evidence", self.errors_for(self.a01))

    def test_recorded_passage_cannot_be_null(self):
        self.a01["assessments"][0]["evidence_status"] = "recorded"
        self.a01["assessments"][0]["evidence"][0]["passage_text"] = None
        self.assertIn("missing passage", self.errors_for(self.a01))

    def test_locator_only_evidence_requires_location_and_omits_quote(self):
        item = self.a01["assessments"][0]["evidence"][0]
        item["location"]["raw"] = None
        self.assertIn("missing passage/location", self.errors_for(self.a01))
        item["location"]["raw"] = "Page 1"
        item["passage_text"] = "Synthetic test text."
        self.assertIn("inconsistent evidence status", self.errors_for(self.a01))

    def test_assessability_conflict(self):
        record = read_json(RECORDS / "pilot-a08.json")
        record["assessments"][3]["overall_verdict"]["label"] = "not_supported"
        self.assertIn("null", self.errors_for(record))

    def test_rollup_disagreement_is_advisory(self):
        record = read_json(RECORDS / "pilot-a04.json")
        for judgment in record["assessments"][0]["sub_claim_judgments"]:
            judgment["label"] = "supported"
        errors, warnings = validate([("fixture.json", record)], self.schema)
        self.assertEqual(errors, [])
        self.assertIn("rubric roll-up gives supported", warnings[0])
        self.assertEqual(record["assessments"][0]["overall_verdict"]["label"], "partially_supported")

    def test_supported_and_contradicted_subclaims_roll_up_to_partial(self):
        record = read_json(RECORDS / "pilot-a04.json")
        judgments = record["assessments"][0]["sub_claim_judgments"]
        judgments[-1]["label"] = "contradicted"
        self.assertEqual(validate([("fixture.json", record)], self.schema), ([], []))

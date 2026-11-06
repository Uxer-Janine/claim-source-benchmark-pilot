import json
from pathlib import Path
import tempfile
import unittest

from scripts.evaluate import annotation_diagnostics, evaluate, load_predictions
from scripts.validate_records import RECORDS, read_json


class EvaluationTests(unittest.TestCase):
    def setUp(self):
        self.record = read_json(RECORDS / "pilot-a01.json")
        self.human = self.record["assessments"][0]

    def prediction(self, verdict, claim_id="A01"):
        return dict(claim_id=claim_id, system_name="fixture", system_version="1",
                    predicted_verdict=verdict)

    def result(self, verdict, claim_id="A01"):
        _, category, detail, evidence = next(evaluate([self.record], [self.prediction(verdict, claim_id)]))
        return category, detail, evidence

    def test_unapproved_reference_skips_label_and_abstention(self):
        for verdict in ("supported", "abstain"):
            self.assertEqual(self.result(verdict)[:2], ("skipped", "human reference approval is pending"))

    def test_confirmed_fixture_can_match_mismatch_and_abstain(self):
        # In-memory fixture only. It does not record real owner approval.
        self.human["review_status"] = "confirmed"
        self.assertEqual(self.result("supported")[0], "match")
        category, detail, evidence = self.result("not_supported")
        self.assertEqual(category, "mismatch")
        self.assertIn("supported", detail)
        self.assertIn("provisional_single_assessor", detail)
        self.assertIn("consult the cited passage", evidence[0])
        self.assertIn(self.record["sources"][0]["url"], evidence[0])
        self.assertIn(self.human["evidence"][0]["location"]["raw"], evidence[0])
        self.assertEqual(self.result("abstain")[0], "abstention")

    def test_contested_and_unknown_references_skip(self):
        self.human["review_status"] = "confirmed"
        self.record["adjudication"]["status"] = "contested_unresolved"
        self.assertEqual(self.result("supported")[:2], ("skipped", "reference status is contested_unresolved"))
        self.assertEqual(self.result("supported", "Z00")[:2], ("skipped", "claim ID absent from records"))

    def test_confirmed_reference_with_missing_evidence_skips(self):
        self.human["review_status"] = "confirmed"
        self.human["evidence_status"] = "not_recorded"
        self.human["evidence"] = []
        self.assertEqual(self.result("supported")[:2], ("skipped", "reference verdict or evidence is unresolved"))

    def test_compound_reference_requires_complete_reviewed_subclaims(self):
        self.record = read_json(RECORDS / "pilot-a04.json")
        human = self.record["assessments"][0]
        human["review_status"] = "confirmed"
        self.assertEqual(self.result("supported", "A04")[:2], ("skipped", "reference subclaim review is pending"))
        human["sub_claim_judgments"] = []
        self.assertEqual(self.result("supported", "A04")[:2], ("skipped", "reference subclaim judgments are incomplete"))

    def test_diagnostics_flag_recorded_contradictions_and_differences(self):
        record = read_json(RECORDS / "pilot-a04.json")
        judgment = record["assessments"][0]["sub_claim_judgments"][1]
        record["assessments"][1]["sub_claim_judgments"] = [
            {**judgment, "label": "contradicted", "evidence_ids": []}
        ]
        diagnostics = "\n".join(annotation_diagnostics(record))
        self.assertIn("a04-ai1 | a04-sc2 = contradicted (needs_review) | contradiction recorded", diagnostics)
        self.assertIn("a04-sc2 | disagreement: contradicted, supported", diagnostics)

    def test_jsonl_rejects_bad_verdict_and_duplicate(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "input.jsonl"
            path.write_text(json.dumps(self.prediction("needs_review")), encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "invalid predicted_verdict"):
                load_predictions(path, {"supported"})
            row = json.dumps(self.prediction("supported")) + "\n"
            path.write_text(row * 2, encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "duplicate"):
                load_predictions(path, {"supported"})

from copy import deepcopy
import json
from pathlib import Path
import tempfile
import unittest

from scripts.evaluate import annotation_diagnostics, evaluate, load_predictions
from scripts.validate_records import RECORDS, SCHEMA, read_json, validate


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

    def add_confirmed_independent_assessments(self):
        # In-memory fixtures only. They do not record real owner approval.
        self.human["review_status"] = "confirmed"
        self.human["assessor"]["id"] = "reviewer-one"
        self.human["independence"].update(saw_other_human_assessments=False, saw_ai_output=False)
        claim_id = self.record["claim_id"].lower()
        other = deepcopy(self.human)
        other.update(assessment_id=f"{claim_id}-h2", kind="human_independent_review")
        other["assessor"]["id"] = "reviewer-two"
        original_evidence_id = other["evidence"][0]["evidence_id"]
        evidence_id = f"{claim_id}-h2-ev1"
        other["evidence"][0]["evidence_id"] = evidence_id
        for judgment in other.get("sub_claim_judgments", []):
            judgment["evidence_ids"] = [
                evidence_id if item == original_evidence_id else item
                for item in judgment["evidence_ids"]
            ]
        self.record["assessments"].append(other)
        self.record["adjudication"]["reference_assessment_ids"] = [
            self.human["assessment_id"], other["assessment_id"]
        ]
        return other

    def test_confirmed_single_assessor_reference_is_excluded_from_scoring(self):
        self.human["review_status"] = "confirmed"
        self.assertEqual(validate([("fixture.json", self.record)], read_json(SCHEMA)), ([], []))
        category, reason, _ = self.result("supported")
        self.assertEqual(category, "skipped")
        self.assertIn("two independent human assessments", reason)

    def test_agreed_fixture_can_match_mismatch_and_abstain(self):
        self.add_confirmed_independent_assessments()
        self.record["adjudication"]["status"] = "agreed"
        self.assertEqual(self.result("supported")[0], "match")
        category, detail, evidence = self.result("not_supported")
        self.assertEqual(category, "mismatch")
        self.assertIn("supported", detail)
        self.assertIn("(agreed)", detail)
        self.assertIn("consult the cited passage", evidence[0])
        self.assertIn(self.record["sources"][0]["url"], evidence[0])
        self.assertIn(self.human["evidence"][0]["location"]["raw"], evidence[0])
        self.assertEqual(self.result("abstain")[0], "abstention")

    def test_agreement_rejects_one_assessor_in_validator_and_evaluator(self):
        self.human["review_status"] = "confirmed"
        self.record["adjudication"]["status"] = "agreed"
        errors, _ = validate([("fixture.json", self.record)], read_json(SCHEMA))
        self.assertTrue(errors)
        category, reason, _ = self.result("supported")
        self.assertEqual(category, "skipped")
        self.assertIn("two distinct assessors", reason)

    def test_agreement_requires_distinct_confirmed_independent_assessors(self):
        other = self.add_confirmed_independent_assessments()
        self.record["adjudication"]["status"] = "agreed"
        other["assessor"]["id"] = "reviewer-one"

        def check(expected_error):
            errors, _ = validate([("fixture.json", self.record)], read_json(SCHEMA))
            self.assertIn(expected_error, "\n".join(errors))
            category, reason, _ = self.result("supported")
            self.assertEqual(category, "skipped")
            self.assertIn(expected_error, reason)

        check("two distinct assessors")
        other["assessor"]["id"] = "reviewer-two"
        other["independence"]["saw_ai_output"] = None
        check("documented independent assessment")
        other["independence"]["saw_ai_output"] = False
        other["review_status"] = "needs_review"
        check("must be confirmed")
        other["review_status"] = "confirmed"
        other["overall_verdict"]["label"] = "contradicted"
        check("reference label differs")
        other["overall_verdict"]["label"] = "supported"
        self.assertEqual(validate([("fixture.json", self.record)], read_json(SCHEMA)), ([], []))
        self.assertEqual(self.result("supported")[0], "match")

    def test_undocumented_adjudicated_override_is_rejected(self):
        self.add_confirmed_independent_assessments()
        decision = self.record["adjudication"]
        decision.update(status="adjudicated", reference_label="contradicted", rationale=None)
        errors, _ = validate([("fixture.json", self.record)], read_json(SCHEMA))
        for field in ("adjudicator_id", "adjudicated_on", "rationale"):
            self.assertIn(field, "\n".join(errors))
        category, reason, _ = self.result("contradicted")
        self.assertEqual(category, "skipped")
        for requirement in ("identified adjudicator", "valid decision date", "documented rationale"):
            self.assertIn(requirement, reason)

    def test_adjudicated_decision_requires_valid_metadata_and_confirmed_evidence(self):
        other = self.add_confirmed_independent_assessments()
        other["overall_verdict"]["label"] = "contradicted"
        decision = self.record["adjudication"]
        decision.update(status="adjudicated", reference_label="contradicted",
                        adjudicator_id="fixture-reviewer", adjudicated_on="2026-02-30",
                        rationale="Synthetic decision explaining an override.")
        errors, _ = validate([("fixture.json", self.record)], read_json(SCHEMA))
        self.assertIn("valid decision date", "\n".join(errors))
        self.assertEqual(self.result("contradicted")[0], "skipped")
        decision["adjudicated_on"] = "2026-02-28"
        self.assertEqual(validate([("fixture.json", self.record)], read_json(SCHEMA)), ([], []))
        self.assertEqual(self.result("contradicted")[0], "match")
        self.assertEqual(self.human["overall_verdict"]["label"], "supported")
        self.assertEqual(other["overall_verdict"]["label"], "contradicted")
        self.human["evidence_status"] = "not_recorded"
        self.human["evidence"] = []
        self.assertEqual(self.result("contradicted")[0], "skipped")

    def test_adjudication_rejects_insufficient_or_unresolved_independent_assessments(self):
        other = self.add_confirmed_independent_assessments()
        decision = self.record["adjudication"]
        decision.update(status="adjudicated", reference_label="contradicted",
                        adjudicator_id="fixture-reviewer", adjudicated_on="2026-02-28",
                        rationale="Synthetic adjudication for a test case.")
        for refs, assessor_id, exposure, expected in (
            (["a01-h1"], "reviewer-two", False, "two distinct assessors"),
            (["a01-h1", "a01-h2"], "reviewer-one", False, "two distinct assessors"),
            (["a01-h1", "a01-h2"], "reviewer-two", None, "documented independent assessment"),
            (["a01-h1", "a01-h2"], "reviewer-two", True, "documented independent assessment"),
        ):
            with self.subTest(refs=refs, assessor_id=assessor_id, exposure=exposure):
                decision["reference_assessment_ids"] = refs
                other["assessor"]["id"] = assessor_id
                other["independence"]["saw_other_human_assessments"] = exposure
                errors, _ = validate([("fixture.json", self.record)], read_json(SCHEMA))
                self.assertTrue(errors)
                category, reason, _ = self.result("contradicted")
                self.assertEqual(category, "skipped")
                self.assertIn(expected, reason)

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

    def compound_agreement(self):
        self.record = read_json(RECORDS / "pilot-a04.json")
        self.human = self.record["assessments"][0]
        for judgment in self.human["sub_claim_judgments"]:
            judgment["review_status"] = "confirmed"
        other = self.add_confirmed_independent_assessments()
        self.record["adjudication"]["status"] = "agreed"
        return other

    def check_compound_agreement_rejected(self, expected):
        errors, _ = validate([("fixture.json", self.record)], read_json(SCHEMA))
        self.assertIn(expected, "\n".join(errors))
        category, reason, _ = self.result("partially_supported", "A04")
        self.assertEqual(category, "skipped")
        self.assertIn(expected, reason)

    def test_compound_agreement_compares_labels_by_subclaim_id(self):
        other = self.compound_agreement()
        other["sub_claim_judgments"].reverse()
        self.assertEqual(validate([("fixture.json", self.record)], read_json(SCHEMA)), ([], []))
        self.assertEqual(self.result("partially_supported", "A04")[0], "match")

    def test_same_overall_verdict_with_subclaim_disagreement_requires_adjudication(self):
        other = self.compound_agreement()
        other["sub_claim_judgments"][-1]["label"] = "contradicted"
        self.check_compound_agreement_rejected("subclaim verdicts differ")
        decision = self.record["adjudication"]
        decision.update(status="adjudicated", adjudicator_id="fixture-reviewer",
                        adjudicated_on="2026-02-28",
                        rationale="Synthetic decision resolving the clinic-count disagreement.")
        self.assertEqual(validate([("fixture.json", self.record)], read_json(SCHEMA)), ([], []))
        self.assertEqual(self.result("partially_supported", "A04")[0], "match")
        self.assertEqual(self.human["sub_claim_judgments"][-1]["label"], "not_supported")
        self.assertEqual(other["sub_claim_judgments"][-1]["label"], "contradicted")

    def test_different_subclaim_decompositions_require_adjudication(self):
        other = self.compound_agreement()
        self.record["adjudication"]["disagreement_causes"] = ["different_sub_claim_split"]
        self.check_compound_agreement_rejected("different subclaim decompositions require documented adjudication")
        self.record["adjudication"]["disagreement_causes"] = []
        other["sub_claim_judgments"][-1]["sub_claim_id"] = "alternative-split"
        self.check_compound_agreement_rejected("complete judgments on the shared subclaim decomposition")

    def test_compound_agreement_requires_complete_confirmed_judgments(self):
        other = self.compound_agreement()
        other["sub_claim_judgments"][-1]["review_status"] = "needs_review"
        self.check_compound_agreement_rejected("confirmed subclaim verdicts")
        other["sub_claim_judgments"].pop()
        self.check_compound_agreement_rejected("complete judgments on the shared subclaim decomposition")

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

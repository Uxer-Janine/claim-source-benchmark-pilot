# Data Dictionary

[Back to the library](../README.md) · [Run the technical checks](TECHNICAL.md)

One JSON file describes one investigation. It identifies the Wikipedia article, records the claim and its cited sources, and keeps each assessment with its reasoning and evidence. Review fields show what remains unresolved and whether a judgment can be considered for evaluation.

Here are three fields from the [American pika record](../records/pilot-a01.json). This excerpt omits other required fields.

```json
{
  "schema_version": "0.1.0",
  "record_id": "pilot-a01",
  "claim_id": "A01"
}
```

Required fields must appear even when their value is unknown. Use `null` only where allowed. The [JSON schema](../schema/claim.schema.json) lists all fields, allowed values, and conditional requirements. The [assessment guide](../annotation-guidelines.md#technical-conventions-and-special-cases) explains how to apply the values.

## Case identification

| Field | Meaning and requirement |
| --- | --- |
| `schema_version`, `record_id`, `claim_id` | Required. Schema version `0.1.0`, stable record ID, and case label. |
| `provenance` | Optional. If included, give `source_document` and `entry_id`. |
| `article` | Required. Give `title`, `revision_id`, and `url`. The latter two can be null when unrecorded. |

## Claim and subclaims

| Field | Meaning and requirement |
| --- | --- |
| `claim.text`, `claim.text_status` | Required. Status is `verbatim`, `completed_needs_review`, `needs_review`, or `public_summary`. |
| `sub_claims` | Required, with at least one entry. Each needs `sub_claim_id`, `text`, and `split_type`. An unsplit claim has one identical entry. |
| `sub_claims[].split_type` | `none`, `attribution`, `quantity`, `scope`, `causal_link`, or `other`. |

## Sources and evidence

| Field | Meaning and requirement |
| --- | --- |
| `sources` | Required. Each source has `source_id`, `citation_text`, `url`, and `access`. Access includes `status` and `note`. Status is `accessible`, `partially_accessible`, `inaccessible`, or `needs_review`. |
| `assessments[].evidence_status`, `evidence` | Required per assessment. Status is `recorded`, `locator_only`, `none_found_after_search`, `not_recorded`, or `needs_review`. Recorded evidence includes at least one item. |
| Evidence items | Each needs `evidence_id`, `source_id`, `role`, `passage_text`, and `location`. Roles are `decisive`, `contradicting`, `nearest_topical`, or `context`. |
| `location`, `passage_text` | A location includes `page`, `section`, `paragraph`, `line`, and `raw`. Public locator-only evidence uses null passage text. |
| `search_note` | Required by the validator for `none_found_after_search`. Describe what was checked. |

## Assessments and confidence

| Field | Meaning and requirement |
| --- | --- |
| `assessment_id`, `kind`, `assessor` | Required per assessment. Kind is `human_original`, `human_independent_review`, or `ai_generated`. Assessor includes `id` and `type` (`human` or `ai`). AI also requires `model_as_recorded`. |
| `assessed_on`, `context_level`, `independence` | Required per assessment. Context is `sentence`, `paragraph`, `article_and_other_sources`, or `needs_review`. Independence records `saw_other_human_assessments` and `saw_ai_output`. |
| `assessability` | Required per assessment, with `status` and `note`. Status is `assessable`, `source_inaccessible`, `source_insufficient`, or `needs_review`. |
| `overall_verdict` | Required per assessment, with `label` and `as_stated`. The label is a [verdict key or workflow placeholder](../annotation-guidelines.md#technical-conventions-and-special-cases), or null when unassessable. |
| `reasoning`, `confidence`, `uncertainty_note` | Required per assessment. Confidence is `high`, `medium`, `low`, `not_recorded`, or `needs_review`. |
| `sub_claim_judgments` | Optional. Each entry needs `sub_claim_id`, `label`, and `review_status`. A compound reference needs complete, confirmed judgments to be scored. |

## Review status and unresolved questions

| Field | Meaning and requirement |
| --- | --- |
| `reference_eligible`, `review_status` | Required per assessment. Status is `needs_review` or `confirmed`. AI assessments have `reference_eligible: false`. |
| `adjudication` | Required. Includes `status`, `reference_label`, and `reference_assessment_ids`. Status is `provisional_single_assessor`, `agreed`, `adjudicated`, `contested_unresolved`, or `needs_review`. |
| `reference_assessment_ids` | For `agreed` or `adjudicated`, cite at least two confirmed assessments from distinct, identified human assessors. Both independence flags must be `false` for each assessment used. |
| `adjudicator_id`, `adjudicated_on`, `rationale` | Required when status is `adjudicated`. Give a stable identifier, a valid date in `YYYY-MM-DD` format, and the reason for the decision. |
| `needs_review_items` | Required list of open items, which can be empty. Each item gives `field` and `reason`. |

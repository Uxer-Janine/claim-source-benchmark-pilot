# Data Dictionary

Each JSON file holds one case. A required field must appear even when its value is unknown. The [schema](../schema/claim.schema.json) defines the allowed values and conditional requirements. In these examples, `null` means the value was unavailable or inapplicable in that field.

| Field | What it means | Example | Required? |
| --- | --- | --- | --- |
| `schema_version` | Version of the rules used to read the file. | `0.1.0` | Yes |
| `record_id`, `claim_id` | Stable file record ID and case label. | `pilot-a01`, `A01` | Yes |
| `provenance` | Where the record came from. Includes the report name and entry ID if present. | Claim Verification Report, A01 | Optional |
| `article` | Wikipedia article title, original revision ID, and URL. | American Pika, revision `null` | Yes |
| `claim.text`, `claim.text_status` | The wording and how it is represented. | A public paraphrase marked `public_summary` | Yes |
| `sub_claims` | Separately checkable parts with stable IDs and a reason for the split. An unsplit claim has one entry. | A04’s revenue estimate | Yes |
| `sources` | Citations, links, and access details. | A01’s *Mammalian Species* paper | Yes |
| `assessments[].kind`, `assessor` | Identifies who made the assessment and whether it is original human, independent human, or AI. | `human_original` | Yes per assessment |
| `assessments[].assessed_on`, `context_level`, `independence` | Date, context consulted, and known exposure to other judgments. | Context `needs_review` | Yes per assessment |
| `assessments[].assessability` | Whether enough of the source was available to judge. | `source_inaccessible` | Yes per assessment |
| `assessments[].overall_verdict` | The normalized label and how it was stated. | `partially_supported` | Yes per assessment. Label can be null when unassessable. |
| `assessments[].reasoning`, `confidence`, `uncertainty_note` | Why the assessor chose the verdict, how confident they were, and what could change it. | A04’s clinic count is uncertain | Yes per assessment |
| `assessments[].evidence_status`, `evidence` | How evidence is represented and which source locations it points to. | `locator_only` with a citation and recorded location | Yes per assessment |
| `evidence[].location`, `passage_text` | Where to find the passage and whether verbatim text is included. | Page 4, paragraph 6, line 3, with passage text `null` in the public copy | Yes per evidence item |
| `assessments[].search_note` | What the assessor checked when a full-source search found no supporting passage. | Sections and terms checked | Required by the validator for `none_found_after_search` |
| `assessments[].sub_claim_judgments` | Separate judgments for individual parts of a claim. | A04’s revenue detail is supported | Optional. Confirmed, complete judgments are needed to score a compound reference. |
| `assessments[].reference_eligible`, `review_status` | Whether an assessment can be considered as a reference and whether it has been reviewed. | A candidate marked `needs_review` cannot be scored. | Yes per assessment |
| `adjudication` | The reference status, candidate verdict, and assessment IDs behind it. | `provisional_single_assessor` | Yes |
| `needs_review_items` | Open questions about the record. | Original Wikipedia revision missing | Yes. The list can be empty. |

See the [Technical Guide](TECHNICAL.md) for validation and scoring.

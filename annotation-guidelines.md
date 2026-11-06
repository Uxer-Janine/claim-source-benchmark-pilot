# Annotation Guidelines for Claim–Source Verification

This rubric asks whether a Wikipedia claim is supported by its cited source. Evaluate what that source establishes. Facts known from elsewhere can be recorded separately as context.

## Assessability

Record access for each source and assessability for each assessment. An alternative route to the source can make an assessment possible even if the original link fails.

- Use `assessable` when you can read enough to judge source support.
- Use `source_inaccessible` when you cannot access the source, or `source_insufficient` when the material available is inadequate to make a judgment. Set the verdict to null and record the limitation.
- Use `needs_review` as a workflow status for unresolved assessability. An assessable historical output that gives no explicit verdict can use the `needs_review` verdict sentinel. Neither use is a support label.

A source can be silent on a claim even after the assessor has read enough to judge it. Use `not_supported` in that case. A08 illustrates the distinction. The human and Gemini made different assessments of the available material.

## Verdicts

Apply the first applicable rule to each subclaim.

| Verdict | What the source establishes |
| --- | --- |
| `contradicted` | It directly conflicts with the statement. |
| `supported` | It establishes the statement's meaning, including its substantive details. |
| `partially_supported` | It establishes part of the statement or a weaker, narrower or differently attributed version. |
| `compatible_not_confirmed` | Its content provides a basis for a cautious inference without directly confirming the statement. |
| `not_supported` | It offers no basis for the statement and gives no directly conflicting evidence. |

Consider quantities, dates, attribution, scope and causal language when deciding which details are substantive. A03 distinguishes evidence about historical practice from evidence about current practice. A04 distinguishes a numerical threshold from the identity of the estimator and the number of clinics.

## Compound claims

Keep the complete claim verbatim. Split substantive statements that can be checked independently. Record each subclaim with a stable ID and the relevant verbatim fragment. Ellipses can mark cuts. Agree on the split before comparing independent reviews. For a single unsplit statement, record one subclaim with identical text.

Record individual judgments and evidence links alongside the overall verdict. Apply this order when all subclaims have verdicts:

1. All supported → `supported`.
2. Otherwise, any supported or partially supported → `partially_supported`.
3. Otherwise, any compatible but unconfirmed → `compatible_not_confirmed`.
4. Otherwise, any contradicted → `contradicted`.
5. Otherwise → `not_supported`.

When support and contradiction coexist, retain the contradicted subclaim and flag the conflict explicitly in the assessment. The evaluator surfaces that flag from the recorded subclaim label, even when the overall verdict is partial. Compare the roll-up with the recorded overall verdict and investigate any discrepancy without rewriting the historical assessment.

A04 records attribution as partially supported, revenue magnitude as supported and clinic count as not supported. The overall verdict is partially supported. The mapping awaits individual review. B09's proposed split is in the handoff and has no assigned subclaim judgments.

## Evidence and uncertainty

Quote the smallest relevant passage verbatim. Record the source ID and its role as decisive, contradicting, nearest topical or context. Link supporting passages to the relevant subclaims. A subclaim judgment can also cite an evidence item that explains a contradiction or lack of support.

For public sharing, use `locator_only` when withholding source quotations. Retain the source ID and recorded location and set `passage_text` to null. A locator identifies what an assessor used. It still requires individual review before the assessment can serve as a reference. Label any public claim paraphrase `public_summary`.

Record page, section, paragraph and line where available. Keep the original location in `raw` and use null for missing or inapplicable components. If the report gives a shared location for multiple passages, preserve that shared location. For an unsuccessful full-source search without a passage, use `none_found_after_search` with a search note. Leave unknown search details unrecorded.

Record the Wikipedia context used and keep confidence and uncertainty separate from the verdict. High means you expect a second assessor to reach the same conclusion. Medium allows a reasonable difference in interpretation. Low reflects unclear or incomplete evidence. Preserve the original confidence and uncertainty text from the Claim Verification Report.

## Independent review and adjudication

Write and save your assessment before seeing other judgments. Record exposure to other human and AI assessments where known. Use `human_original`, `human_independent_review` or `ai_generated`, and add a new assessment for each review.

Compare labels, subclaim judgments, evidence and context. Preserve disagreements and record their causes. Document the agreed or adjudicated result and its rationale separately. Use `contested_unresolved` when a disagreement remains open.

A single human assessment can serve as a provisional reference after its evidence and annotations are individually confirmed. For a compound reference, confirm its subclaim judgments and resolve roll-up discrepancies before scoring. Approval of the rubric applies to the method. Approval of a reference applies to a specific assessment. AI assessments are comparison material and always have `reference_eligible: false`. Preserve explicit abstentions and leave unlabeled historical responses unmapped.

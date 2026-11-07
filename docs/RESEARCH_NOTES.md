# Research coverage and evidence

[Back to the library](../README.md) · [Explore the investigations](INVESTIGATIONS.md)

Use these notes to find the cited passages and see what can be checked again. The five records each contain one original human assessment and three historical AI entries. See the [library overview](../README.md#what-i-learned-and-what-remains-open) for review and scoring status.

The original exploration contains five cases. The current [three-case focus](INVESTIGATIONS.md#current-three-case-learning-focus) uses A01 to observe, A04 to practice, and A03 to investigate context. A08 and B09 are preserved exploratory cases for future expansion. The evidence map and counts below describe all five original cases.

## Questions and approach

I wanted another reader to be able to follow what a citation supports and how I reached a judgment. I selected five examples from my claim-verification report, preserved the original assessments, and recorded the citations and passage locations. I kept later AI responses separate so their reasoning and access limits could be inspected.

The surrogacy example shows why I kept individual claim details visible. The farming and hair-care examples raise questions about context and relevance. These case observations informed the fields for reasoning, uncertainty, source access, and review status. Missing revisions, source access, and incomplete AI-run records limit what another researcher can reproduce.

## Public evidence map

The public claim summaries and human reasoning come from the *Claim Verification Report*. Each record’s `provenance.entry_id` points to the corresponding report entry. The public JSON retains citations, passage locations, verdicts, and uncertainty. The full report and withheld quotations stay in the private research copy. The Wikipedia links below identify current articles. The original article revisions and URLs used during the exercise were not recorded.

| Case and current Wikipedia article | Cited source and recorded location | What a reviewer can inspect and what remains open |
| --- | --- | --- |
| A01 · [American pika](https://en.wikipedia.org/wiki/American_pika) | [Smith and Weston PDF](https://academic.oup.com/mspecies/article-pdf/doi/10.2307/3504319/8071137/352-1.pdf), page 4, *Ontogeny and reproduction*, paragraph 6, line 3 | The average age and the earlier study it credits. Additional context could affect the judgment. The PDF link has returned HTTP 403 to automated checks. [A01 record](../records/pilot-a01.json) |
| A03 · [Extensive farming](https://en.wikipedia.org/wiki/Extensive_farming) | [Morales-Reyes and colleagues](https://doi.org/10.1007/s13280-025-02150-8), page 11, paragraph 1, line 2, section unrecorded | The example concerns Mongolia and a historical change. The extent to which it bears on present practice or other regions remains open. Check pagination against the version consulted. [A03 record](../records/pilot-a03.json) |
| A04 · [Surrogacy in India](https://en.wikipedia.org/wiki/Surrogacy_in_India) | [Hibino article](https://pmc.ncbi.nlm.nih.gov/articles/PMC10327345/), page 2, *Background*, paragraph 3, line 1 | The named industry body and revenue estimate are traceable to `a04-h1-ev1`. The passage does not provide a clinic count. The three judgment mappings remain pending review. [A04 record](../records/pilot-a04.json) |
| A08 · [Curly Girl Method](https://en.wikipedia.org/wiki/Curly_Girl_Method) | [TODAY article](https://www.today.com/shop/curly-girl-method-products-rcna100025), paragraph 1, line 1, no recorded page or section | The locator points to related material about the method. The search log is missing, and unchecked secondary citations could affect the assessment. [A08 record](../records/pilot-a08.json) |
| B09 · [Reliability of Wikipedia](https://en.wikipedia.org/wiki/Reliability_of_Wikipedia) | [Anthony, Smith, and Williamson](https://journals.sagepub.com/doi/10.1177/1043463109336804), *Abstract*, lines 4–5, shared location for two entries | The abstract discusses reliability. It leaves the editing requirements, productivity claim, affiliation, and language scope open. Line wrapping can vary, and automated requests have returned HTTP 403. [B09 record](../records/pilot-b09.json) |

For A04, review the mappings through the public claim details, source passage, and evidence links. The private report paragraph numbers in the historical notes identify the transcription’s origin. They are not required to locate the cited passage. The same passage supplies the context for checking the clinic-count gap, even though that judgment has no direct supporting passage.

## What the five cases cover

- **Original human verdicts:** one Supported, two Partially supported, and two Not supported. Compatible but unconfirmed and Contradicted appear in historical AI entries. Neither appears as an original human verdict in this sample.
- **Subclaims:** A04 and B09 each have three separately checkable parts. Only A04 has three recorded subclaim verdicts, all awaiting review. B09 has an original overall verdict and no individual subclaim verdicts. The remaining three records are unsplit.
- **Reference eligibility:** All five human entries are provisional candidates. No independent reviews are recorded, no case is eligible for scoring, and all 46 record review items remain open.
- **Scope:** The cases demonstrate how to inspect a citation and record a reasoned judgment. They do not establish model performance, reviewer agreement, or learning outcomes. Publisher access, missing original revisions, and incomplete comparison metadata limit reproducibility.

## Historical human–AI comparison

| Item | What the public record establishes |
| --- | --- |
| Systems | The report labels transcribed into the records are ChatGPT **GPT 6.1 Sol Light**, Claude **Sonnet 5.5 Medium**, and Gemini **Auto (Gemini 3 models)**. These are labels as recorded, with no independently verified model snapshots. |
| Dates and order | The human records give 15 October 2026 for A01, A03, A04, and A08, and 18 October 2026 for B09. AI run dates, assessment order, and prior exposure are unrecorded. |
| Prompts, instructions, and inputs | Exact prompts and input bundles are unrecorded. Some public AI reasoning refers to excerpts. That does not establish exactly what each system received or could access. |
| Access differences | The report describes some human use of alternative access routes. A01 records an alternative full-text link. Comparable full-source access for AI is unknown. A08 records a human judgment and a Gemini abstention due to insufficient material. |
| Outputs | The public records preserve normalized labels, explicitly stated verdict wording where available, and reasoning summaries. Complete transcripts are outside the repository. The A01 ChatGPT entry has no explicit verdict. Two A04 monetary passages in historical AI material are flagged for verification against the original transcripts. |

Janine’s report describes using AI for additional assessment and reflecting on the difference between an inference and a supported claim. That is the author’s account of the exercise. The surviving metadata does not support treating the runs as a controlled comparison or reproducing them. Examples such as A03’s differences over scope and A04’s differences over how much the citation establishes are useful prompts for review. They do not establish which assessor was more accurate.

## Methodological checks and open decisions

These are rules and questions for future reviewed comparisons. Synthetic evaluator tests check the rules, including disagreement about details despite matching overall verdicts. They do not supply independent assessments of these five cases.

A roll-up is the rule that combines the verdicts on individual details into one overall verdict. A passage location may also be called a locator in the records.

| Topic | Current handling and recommendation |
| --- | --- |
| Contradiction in a compound claim | The current roll-up stays in force. A favorable or compatible subclaim can determine the overall label. Always preserve and visibly flag each contradicted subclaim. The evaluator reports it in its unscored diagnostics. Before reporting scored results, consider requiring that flag alongside the overall label. Changing precedence or introducing a new label would require explicit approval. |
| Partial support | At subclaim level, the source establishes only part of that detail or a weaker version. At overall level, the label can result from the existing roll-up across different subclaim verdicts. Keep both levels visible. |
| Agreement on applicable subclaims | Scoring requires at least two distinct, identified, independently completed and confirmed human assessments. For agreement, the overall verdict and every applicable subclaim verdict must match on the same breakdown. Differences require documented adjudication. |
| Passage locations and source access | For PDFs, give page and section, adding paragraph or line when stable. For webpages, give heading and paragraph or a stable fragment if available. Keep the original location wording, and add a verified alternative separately. When access or material is insufficient to judge, record the limitation and leave the verdict unset. **Not supported** applies when enough material was checked and gave no basis for the claim. |

Historical assessments and the roll-up rule are preserved.

For the next research step, invite fresh assessments through the [Blind Review Kit](BLIND_REVIEW_KIT.md), confirm the source locations, and document unresolved access or interpretation differences. The [Maintainer Guide](MAINTAINER.md#open-review-work) lists the evidence still needing attention.

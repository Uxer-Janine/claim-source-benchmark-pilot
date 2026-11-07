# Claim–Source Verification Library

## The problem

**Does the source actually support what Wikipedia says?**

A **claim** is a statement you can check. Its **citation** points to the source behind it. But a source can discuss the same topic without supporting every detail. Checking the citation means finding what it supports. Deciding whether the claim itself is true may require other evidence.

This reusable method is demonstrated through a **three-case Wikipedia learning focus: A01 → A04 → A03**. It grew from an original five-case exploration. A08 and B09 remain additional exploratory cases for future expansion, with every record preserved. **The library organizes the research. Evidence Desk helps people practice.** All five original human assessments await independent review.

## Who benefits from this project?

These are potential uses. Adoption and impact have not been measured.

- **Students and educators:** Use the examples and Evidence Desk to learn and teach how to check whether a source supports a statement.
- **Wikipedia contributors:** Examine citations, identify unsupported details, and make article statements clearer.
- **Researchers:** Explore documented assessments and disagreements. Independently reviewed cases could support future research on claim verification.
- **AI developers:** Use the structured records and evaluation tools as a starting point for testing automated verification systems once the required independent reviews are complete.

[![Play Evidence Desk, the interactive claim verification lab](assets/evidence-desk-banner.svg)](https://uxer-janine.github.io/claim-source-benchmark-pilot/lab/game/)

**Planning an independent review?** Start with the [Blind Review Kit](docs/BLIND_REVIEW_KIT.md). The example below reveals the A04 assessment.

<a name="one-example-three-details"></a>

## A real example

**Wikipedia claim, summarized:** Industry organizations estimated annual surrogacy revenue above US$2 billion, and India had thousands of IVF clinics.

I checked the [cited article](https://pmc.ncbi.nlm.nih.gov/articles/PMC10327345/). The recorded passage location is page 2, *Background*, paragraph 3, line 1.

| Detail being checked | What the source establishes |
| --- | --- |
| Who provided the estimate? | Names one organization, rather than multiple organizations. |
| Was the annual estimate above US$2 billion? | Reports an estimate of US$2.3 billion. |
| Were there thousands of IVF clinics? | The cited passage does not establish this. |

**My recorded assessment:** Partially supported, with medium confidence, awaiting independent review. Missing support for the clinic count does not establish that the count is false.

![The surrogacy claim has three checks. Attribution is partially supported, revenue is supported, and the clinic count is not supported. The overall assessment remains provisional.](assets/illustrations/a04-compound-claim.svg)

*Checking each detail makes the limits of the citation visible.*

## Why I started this project

This grew out of my participation in the Wiki Education Outreachy claim-verification exercise. Reaching a verdict was only part of the challenge. Explaining how I reached it, and making that explanation easy for someone else to check, mattered just as much.

I started a separate five-case exploration to record that reasoning, then selected three cases for the current learning focus. I kept passage locations, uncertainty, and assessments together so a later reviewer could question a decision. Evidence Desk is a companion activity. This work was self-initiated, separate from the assigned exercise.

<a name="how-verification-works"></a>
<a name="how-the-library-works"></a>

<a name="how-the-verification-process-works"></a>

## The five principles of claim–source verification

1. **Identify the claim.** What exactly is being stated?
2. **Break it down.** Which details need separate checks?
3. **Examine the evidence.** What does the cited source establish?
4. **Make a reasoned judgment.** What is supported, contradicted, or uncertain?
5. **Document and review.** Can another reader follow the reasoning independently?

Follow [Understand → Observe → Practice → Apply → Review](learn/VERIFICATION_GUIDE.md) for explanations and a route through the learning materials.

![A Wikipedia claim leads to its cited source, relevant evidence, and an assessment. Establishing truth may require other evidence.](assets/illustrations/verification-chain.svg)

*The judgment should lead the next reader back to a passage.*

## Applying this approach beyond Wikipedia

The reasoning can also help examine claims in academic papers, engineering reports, and research projects.

**Fictional teaching example:** “Our solar-powered irrigation prototype reduces water consumption by 40%, costs less than conventional irrigation, and performs reliably in rural environments.”

Ask for test results, a comparable cost analysis, and evidence of reliability in the stated environment. A result under particular test conditions would not establish universal performance.

The reasoning process, evidence notes, uncertainty, and independent review are reusable. The Wikipedia records, schema, evaluator, historical AI assessments, and game remain specific to this pilot. Their use in other fields has not been validated.

[Use the reusable verification worksheet](learn/VERIFICATION_WORKSHEET.md).

<a name="browse-the-five-cases"></a>
<a name="what-the-pilot-produced"></a>

## What I built

- **[Three active cases and two preserved exploratory cases](docs/INVESTIGATIONS.md)** connect claims with sources, passage locations, reasoning, and uncertainty. All [five original records](records/) remain available.
- **[Assessment guidelines](annotation-guidelines.md)** explain how to record support, partial support, contradiction, or insufficient information. **[The review kit](docs/BLIND_REVIEW_KIT.md)** lets someone make their own assessment before seeing mine.
- **[Consistency and evaluation tools](docs/TECHNICAL.md)** flag missing or inconsistent information and check whether assessments meet the review requirements for scoring. The evaluator explains why a prediction is skipped or compares it with a human judgment that meets those requirements.
- **[Evidence Desk](https://uxer-janine.github.io/claim-source-benchmark-pilot/lab/game/)** lets learners investigate the surrogacy claim, sort evidence cards, and explain their judgment before comparing it with the recorded assessment.

![Live Evidence Desk investigation with opened files and evidence cards sorted into Supported, Narrower support, and Needs more evidence.](assets/evidence-desk-a04.jpg)

*Each card represents a detail to check. This screenshot shows one way to sort them.*

<a name="what-i-learned-and-what-remains-open"></a>
<a name="project-status-and-roadmap"></a>
<a name="what-comes-next"></a>

## What I learned and what comes next

A verdict alone leaves important questions unanswered. In the surrogacy case, checking the amount, attribution, and clinic count separately makes it easier to see which evidence informed each judgment.

I also made the scoring safeguards explicit. Synthetic test cases show how matching overall verdicts can hide disagreement about individual details. These are tests of the tools, rather than completed independent reviews of the pilot.

All five human assessments remain provisional. No independent reference reviews are complete, and all 14 historical predictions remain unscored. Active status describes the learning focus, not scoring approval. Source access, missing Wikipedia revisions, and incomplete AI-run information remain limitations. Evidence Desk keeps A04 playable and four previews for compatibility. Model performance and learning outcomes have not been measured. The full *Claim Verification Report* stays private.

Next, I want to invite independent reviews, confirm passage locations and original revisions where possible, and test the learning materials with beginners. Those steps should guide further cases and development. See the [roadmap](docs/NEXT_STEPS.md).

## Explore the project

<a name="explore-the-investigations"></a>

- **Beginners and educators:** [Understand the method](learn/VERIFICATION_GUIDE.md), observe [A01](learn/README.md#a01--american-pika), practice [A04](learn/README.md#a04--surrogacy-in-india), then investigate [A03](docs/INVESTIGATIONS.md#a03--extensive-farming). [Apply the worksheet](learn/VERIFICATION_WORKSHEET.md) to your own claim and invite a fresh review.
- **Researchers:** Read the [case index](docs/INVESTIGATIONS.md), [Research Notes](docs/RESEARCH_NOTES.md), and [methodology](annotation-guidelines.md). [A08](docs/INVESTIGATIONS.md#a08--curly-girl-method) and [B09](docs/INVESTIGATIONS.md#b09--reliability-of-wikipedia) are preserved for future expansion.
- **Independent reviewers:** Use the [Blind Review Kit](docs/BLIND_REVIEW_KIT.md) for a case whose assessment you have not seen.
- **Developers:** Start with the [Technical Guide](docs/TECHNICAL.md), [Data Dictionary](docs/DATA_DICTIONARY.md), or [Maintainer Guide](docs/MAINTAINER.md).
- **Contributors:** [Suggest a correction or submit a review](CONTRIBUTING.md). The [Portfolio Handover](docs/PORTFOLIO_HANDOVER.md) summarizes the contribution.

<a name="words-youll-see"></a>
<a name="what-the-verdicts-mean"></a>

The [assessment guide](annotation-guidelines.md#terms-used-in-an-assessment) explains technical terms and the [verdict labels](annotation-guidelines.md#verdicts).

## Contribution and AI assistance

Janine Makorre prepared the research report and original human assessments, guided the methodology and learning design, and reviewed the presentation. AI assistance was used to implement the validation and evaluation tools and Evidence Desk, and to draft and edit documentation. The records identify historical AI assessments separately from the original human judgments.

See the [attribution and licensing notice](NOTICE.md) for Wikipedia credits, source rights, and the scope of the [MIT License](LICENSE).

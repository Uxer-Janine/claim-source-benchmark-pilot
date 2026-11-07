# Wikipedia Claim–Source Verification Library

**Does the source actually support what Wikipedia says?**

A **claim** is a statement you can check. A **citation** points to the source behind it. A source can be relevant and still support only part of the statement. Checking a citation means finding what it supports. To find out whether the statement itself is true, you may need other evidence.

I started with five Wikipedia examples. **The library organizes the research** by keeping each claim, source, and assessment together. **Evidence Desk teaches the process** through a short interactive investigation. This is an exploratory pilot, with five original assessments still awaiting independent review.

[![Play Evidence Desk, the interactive claim verification lab](assets/evidence-desk-banner.svg)](https://uxer-janine.github.io/claim-source-benchmark-pilot/lab/game/)

Start with [one example](#one-example-three-details), try the [five-minute written lesson](learn/README.md), or [jump to the research and tools](#explore-the-project).

**Planning an independent review?** Start with the [Blind Review Kit](docs/BLIND_REVIEW_KIT.md). The example below reveals the A04 assessment.

## One example, three details

**What Wikipedia said, in summary.** Industry organizations estimated that surrogacy in India brought in more than US$2 billion a year, and India had thousands of IVF clinics.

**What the source says.** The [cited article](https://pmc.ncbi.nlm.nih.gov/articles/PMC10327345/) names one industry organization and reports its estimate of US$2.3 billion a year. It describes clinics offering surrogacy. The relevant passage gives no nationwide clinic count.

**How I checked it.** The amount clears the stated threshold. Naming one organization gives partial support to the wording about multiple organizations. The clinic count remains unsupported by the passage. My recorded judgment was **partially supported**, with medium confidence. It still awaits independent review. See the [case and passage location](docs/INVESTIGATIONS.md#a04--the-missing-evidence-surrogacy-in-india).

![The surrogacy claim splits into three checks. The attribution is partly supported, the revenue amount is supported, and the clinic count is not supported. The overall assessment is partially supported, with medium confidence, and awaits independent review.](assets/illustrations/a04-compound-claim.svg)

*Notice that the same citation supports the number more clearly than it supports who gave it or how many clinics there were.*

## Who can use it?

- **Students and beginners** can practice telling what a source says from what a claim adds.
- **Educators** can ask learners to defend different parts of a claim with evidence.
- **Wikipedia contributors** can use the same steps to decide whether wording or a citation needs another look.
- **Researchers** can inspect how judgments were made and add their own reviews.
- **Developers** can inspect the case files and try the tools for checking records and comparing predictions.

## Questions I wanted to explore

1. Which details does a citation actually support?
2. What changes when I check several facts in a sentence one at a time?
3. What should I record so someone else can follow or challenge my reasoning?
4. What would need to happen before these records could help evaluate automated tools?

## What I did

I assessed Wikipedia claims during the Wiki Education Outreachy contribution exercise. Some sources were hard to access, and some answered only part of the question. I then started this separate five-case pilot to make those decisions easier to review. I recorded where I looked, what I found, and what could change my judgment. I built Evidence Desk as a way to practice the same steps and documented what independent reviewers would need to check.

<a name="how-verification-works"></a>

## How the library works

Read the claim. Find its cited source. If a sentence makes several statements, check each important detail. Record where you found the evidence, what you concluded, and how sure you are. Leave enough information for another person to make and explain their own judgment.

![Four steps connect a Wikipedia claim to its cited source, evidence, and an assessment. Checking whether the claim is true may require other sources.](assets/illustrations/verification-chain.svg)

*The process follows one citation from the statement it accompanies to the passage used to judge it.*

<a name="browse-the-five-cases"></a>

## What the pilot produced

- **[Five case summaries](docs/INVESTIGATIONS.md) and [structured records](records/).** Each keeps the source, passage location, and reasoning together. The [case index](#explore-the-investigations) offers a suggested reading order.
- **[An assessment guide](annotation-guidelines.md) and [a review packet](docs/BLIND_REVIEW_KIT.md).** The guide explains the judgments you can record. The packet helps reviewers make their own judgments before seeing mine.
- **[Record checks and an example evaluator](docs/TECHNICAL.md).** One tool checks how records are put together. The other shows which predictions could be compared with a reviewed human assessment and why the current examples are skipped.
- **[Evidence Desk](https://uxer-janine.github.io/claim-source-benchmark-pilot/lab/game/).** Open evidence files, sort the details of the surrogacy claim, and explain your judgment before comparing it with the recorded assessment.

![Live Evidence Desk surrogacy investigation with opened evidence files and cards sorted into Supported, Narrower support, and Needs more evidence.](assets/evidence-desk-a04.jpg)

*In the live activity, each detail has its own card. This screenshot shows one way to sort them.*

## What I learned and what remains open

The surrogacy example shows why an overall label can hide which details a citation supports. Writing down the passage location and the reason for each judgment gives the next reader something concrete to check. These are observations from the pilot cases.

All five original human assessments are provisional. Independent reviews are pending, and all 14 example predictions remain unscored. Some sources have access limits, the original Wikipedia revisions are missing, and the historical AI runs are only partly documented. Evidence Desk has one playable investigation, A04, and four previews. The pilot has yet to measure model performance or learner outcomes. The full *Claim Verification Report* remains private.

<a name="project-status-and-roadmap"></a>

## What comes next

Invite independent reviews, confirm passage locations, and recover the original Wikipedia revisions where possible. Test the written lesson and Evidence Desk with beginners, then use what we learn to choose and document additional cases. The [roadmap](docs/NEXT_STEPS.md) separates current priorities from longer-term ideas.

## Explore the project

- **Learn or teach:** [Play Evidence Desk](https://uxer-janine.github.io/claim-source-benchmark-pilot/lab/game/) or [try the written lesson](learn/README.md).
- **Inspect the research:** [Five cases](docs/INVESTIGATIONS.md), [Research Notes and evidence map](docs/RESEARCH_NOTES.md), and [assessment method](annotation-guidelines.md).
- **Review or contribute:** [Blind Review Kit](docs/BLIND_REVIEW_KIT.md) and [contribution guide](CONTRIBUTING.md). If you plan to review independently, open the kit before reading the existing assessments.
- **Run the code:** [Technical Guide](docs/TECHNICAL.md), [Data Dictionary](docs/DATA_DICTIONARY.md), and [Maintainer Guide](docs/MAINTAINER.md).
- **See the contribution summary:** [Portfolio Handover](docs/PORTFOLIO_HANDOVER.md).

### Explore the investigations

Start with [A01, a worked example](learn/README.md#a01--american-pika), and [A04, a practice check](learn/README.md#a04--surrogacy-in-india). Then try [A03 on time and place](docs/INVESTIGATIONS.md#a03--extensive-farming), [A08 on relevance](docs/INVESTIGATIONS.md#a08--curly-girl-method), and [B09 on editing and research](docs/INVESTIGATIONS.md#b09--reliability-of-wikipedia).

<a name="words-youll-see"></a>
<a name="what-the-verdicts-mean"></a>

For terms and verdicts, see the [assessment guide](annotation-guidelines.md#terms-used-in-an-assessment) and its [verdict key](annotation-guidelines.md#verdicts).

## Contribution and AI assistance

Janine Makorre prepared the research report and original human assessments, guided the methodology and learning design, and reviewed the presentation. AI assistance was used to implement the validation and evaluation tools and Evidence Desk, and to draft and edit documentation. The records identify historical AI assessments separately from the original human judgments.

See the [attribution and licensing notice](NOTICE.md) for Wikipedia credits, source rights, and the scope of the [MIT License](LICENSE).

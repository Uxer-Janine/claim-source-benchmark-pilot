# Wikipedia Claim–Source Verification Library

**An exploratory five-case pilot from Janine Makorre’s Wiki Education Outreachy contribution**

Does the source cited by a Wikipedia sentence support what that sentence says? Try the check with real cases, then explore the sources and reasoning behind the recorded judgments.

**[Start the five-minute lesson](learn/README.md)** · [Browse the cases](#browse-the-five-cases) · [Give feedback](CONTRIBUTING.md) · [Explore the data](docs/DATA_DICTIONARY.md)

## How verification works

A **claim** is the statement you want to check. A **cited source** is the work the article points to. **Evidence** is the part of that work that bears on the claim.

**Read the claim → Find the evidence → Compare the details → Explain your judgment**

This exercise asks what one cited source supports. Finding out whether the claim is true may require checking other evidence. A claim can be true even if the cited source does not support it.

## Try it in five minutes

1. **Understand** what a claim, source, and evidence look like.
2. **Learn** how to check an approximate age in the American pika example.
3. **Practice** on three details in the surrogacy case before you see Janine’s assessment.
4. **Compare** your reasoning with the documented judgment, then explore another case.

You can read the lesson in your browser without an account or an installation.

## Browse the five cases

Start with the first two cases in the lesson. Then try A03 to check where and when evidence applies, A08 to check whether it answers the right question, and B09 to use both skills together.

1. [A01 · American pika](learn/README.md#a01--american-pika) — See when an average supports an approximate age.
2. [A04 · Surrogacy in India](learn/README.md#a04--surrogacy-in-india) — Practice checking who made an estimate and whether the source supports both numbers in a claim.
3. [A03 · Extensive farming](learn/README.md#a03--extensive-farming) — Check whether evidence from one place and period applies to a broader statement.
4. [A08 · Curly Girl Method](learn/README.md#a08--curly-girl-method) — Distinguish a related topic from evidence for a claim about social change.
5. [B09 · Reliability of Wikipedia](learn/README.md#b09--reliability-of-wikipedia) — Separate editing rules from research findings and check what the study actually measured.

## Put the library to work

- **Students** can use A01 as a model for explaining why a citation supports a sentence, then write their own one-sentence assessment for A04.
- **Educators** can ask pairs to compare which A04 detail they found hardest to judge and what additional evidence would settle it.
- **Wikipedia contributors** can use A03 as a model for checking time and place before suggesting a narrower article sentence or a better citation.
- **Researchers** can run the [example evaluation](docs/TECHNICAL.md#run-the-checks) to see how the tool handles predictions while the human judgments still await review.

## What the verdicts mean

| Verdict | What the source does |
| --- | --- |
| Supported | Backs the statement and its important details. |
| Partially supported | Backs some details or a narrower version. |
| Compatible but unconfirmed | Gives some reason to think the statement could fit, without establishing it. |
| Not supported | Gives no basis for the statement and does not directly conflict with it. |
| Contradicted | Directly conflicts with the statement. |

If you cannot access enough of the source to judge, record that limitation separately. See the [annotation guidelines](annotation-guidelines.md) for compound claims and edge cases.

## How to read the assessments

The five cases come from Janine Makorre’s *Claim Verification Report*. Each record separates the author’s assessment from historical AI responses. The public copy uses labeled summaries and keeps the citations and recorded passage locations. The full report is kept with the private research materials.

All five original human assessments are awaiting independent review and are excluded from scoring. The pilot has no independently validated reference set or mentor approval. Original Wikipedia revision IDs and some AI run details are still missing. See [release notes](RELEASE_NOTES.md) and the [Maintainer Guide](docs/MAINTAINER.md) for the remaining limitations.

## Find your way around

| Location | What’s inside |
| --- | --- |
| [learn/](learn/README.md) | The lesson and prompts for all five cases. |
| [records/](records/) | The five structured case files with sources and assessments. |
| [schema/](schema/claim.schema.json) | Rules for what a case file can contain. Start with the [Data Dictionary](docs/DATA_DICTIONARY.md). |
| [scripts/](scripts/), [tests/](tests/), [predictions/](predictions/) | Optional tools, checks, and example inputs. See the [Technical Guide](docs/TECHNICAL.md). |
| [docs/](docs/) | Guides for understanding the data and maintaining the library. |

[Share feedback or contribute](CONTRIBUTING.md) if a step is confusing, a citation needs correction, or you reached a different assessment.

Janine Makorre prepared the report and original assessments for her Wiki Education Outreachy contribution. The [attribution notice](NOTICE.md) credits Wikipedia contributors and explains how the [MIT License](LICENSE), Wikipedia terms, and source rights apply.

# Next Steps and Future Development

The library is a five-case pilot with a beginner lesson, structured records, and tools for checking the data and trying the evaluation process. All five original human assessments still await independent review. The example evaluator can process predictions, but it produces no scores while the human references remain unapproved.

This pilot is a separate Outreachy contribution. The official Outreachy application and the compulsory claim-verification microtask each have their own submission process.

## Prepare the submission and publication

1. Review the final snapshot and confirm which repository link and commit to share with mentors. Describe the five cases, the learning exercise, and the limits of the evidence and review completed so far.
2. After the project owner approves publication, push the reviewed changes. If a new release is needed, describe the changes since the existing release and verify the public links and lesson.

## Improve the pilot with reviewers and learners

- **Invite independent assessments.** Ask reviewers to read the claim and source before seeing the recorded judgment. Keep their assessments separate and show where their reasoning differs. If a disagreement is resolved, record who made the decision and why. See [how to contribute](../CONTRIBUTING.md).
- **Make evidence easier to find.** Recover the original Wikipedia revisions where possible and verify that each citation and passage location leads readers to the intended evidence. Keep uncertain or unavailable details visible.
- **Try the lesson with first-time readers.** See whether they can explain the difference between source support and truth, attempt A04 before opening the assessment, and find a way to give feedback. Use what they struggle with to improve the wording and check whether five minutes is realistic.

## Explore future research

- **Improve benchmarking once references are reviewed.** Document which cases can be scored, keep abstentions separate from incorrect predictions, and compare how tools handle partial support, contradictions, and missing evidence. Report the limits of a five-case sample.
- **Explore multilingual verification.** A future study could examine how language editions differ in claim wording, citations, and access to evidence. This is a research direction to investigate with reviewers who know the relevant languages.

A standalone website, major dataset expansion, and a more advanced scoring interface are lower priorities. Revisit them if learner feedback or research needs point to a clear benefit.

For day-to-day record and release procedures, see the [Maintainer Guide](MAINTAINER.md). For commands and evaluator details, see the [Technical Guide](TECHNICAL.md).

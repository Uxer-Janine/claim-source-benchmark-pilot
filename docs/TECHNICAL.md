# Technical Guide

For contributors editing data and researchers trying the evaluator. The [library homepage](../README.md) links to the learning paths and case findings.

| File | Who uses it and when |
| --- | --- |
| [Schema](../schema/claim.schema.json) | Data contributors use these rules when adding or changing a record. Read the [Data Dictionary](DATA_DICTIONARY.md) for field meanings. |
| [Validator](../scripts/validate_records.py) | Maintainers run it after editing records to check required fields, links between IDs, and review rules. |
| [Evaluator](../scripts/evaluate.py) | Reports why predictions are skipped and flags recorded contradictions and disagreements between subclaim labels. It can compare predictions with approved human reference judgments when those are available. |
| [Validation tests](../tests/test_validate.py) and [evaluator tests](../tests/test_evaluate.py) | Maintainers run both before merging changes or releasing data. Tests include examples of invalid records and in-memory confirmed references. |
| [Example predictions](../predictions/example-predictions.jsonl) | Researchers use these historical AI labels to try the evaluator. They include one abstention. Each line has a case ID, system name, system version, and predicted verdict. |
| [Requirements](../requirements.txt) | Maintainers install the Python dependency before running the checks. |

## Run the checks

Use Python 3.9 or later from the repository root. On Windows:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe scripts/validate_records.py --show-review
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
.\.venv\Scripts\python.exe scripts/evaluate.py predictions/example-predictions.jsonl
```

On macOS and Linux, use `.venv/bin/python` as the environment’s Python executable. The checks do not call model APIs or require credentials.

The example processes 14 historical predictions and scores zero because all five original human assessments are awaiting independent review and reference approval. Skipped rows show why they were excluded. Submitted abstentions are counted separately. The example checks the workflow and cannot reproduce the original model runs or measure model performance.

## Licensing

The [MIT License](../LICENSE) covers the project’s original code, schema, and documentation. The [attribution notice](../NOTICE.md) explains the separate terms for Wikipedia-derived claims and cited sources. The records point to third-party passages through citations and locations.

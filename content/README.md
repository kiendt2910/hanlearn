# HanLearn Curriculum Content Pipeline

All curriculum materials imported into HanLearn must carry explicit `origin` provenance (`VERIFIED_ORIGINAL`, `OFFICIAL_LICENSED`, `DEMO`, or `AI_GENERATED`) and `status` lifecycle (`DRAFT`, `PUBLISHED`, `ARCHIVED`).

- Do not hardcode official HSK vocabulary counts, examination durations, or scoring rules in application code.
- Validate JSON datasets against `content/schemas/vocabulary-import.schema.json` before importing via the Admin CMS.

# Data Model: Open Source Review Recommendations

## Overview

The review feature produces a structured report derived from a local repository. The report groups findings by assessment area and provides prioritized recommendations with evidence references.

## Entities

### ReviewReport

- **id**: string (unique identifier)
- **repo_path**: string (absolute path to the target repository)
- **generated_at**: string (ISO 8601 timestamp)
- **summary**: Summary
- **areas**: AssessmentArea[]
- **recommendations**: Recommendation[]

### Summary

- **headline**: string (one-sentence overall conclusion)
- **high_priority_count**: number
- **quick_wins_count**: number
- **risk_notes**: string[]

### AssessmentArea

- **id**: string
- **name**: string (e.g., Documentation, License)
- **status**: string (one of: "good", "needs-improvement", "missing")
- **findings**: Finding[]
- **recommendations**: Recommendation[]

### Finding

- **id**: string
- **area_id**: string
- **title**: string
- **details**: string
- **evidence**: EvidenceReference[]

### Recommendation

- **id**: string
- **area_id**: string
- **title**: string
- **details**: string
- **priority**: string (one of: "high", "medium", "low")
- **time_horizon**: string (one of: "quick", "long-term")
- **risk_if_ignored**: string
- **evidence**: EvidenceReference[]

### EvidenceReference

- **type**: string (one of: "file", "path", "missing")
- **target**: string (repository-relative path or descriptor)
- **notes**: string (optional)

## Relationships

- ReviewReport contains many AssessmentAreas.
- Each AssessmentArea contains Findings and Recommendations.
- Recommendations and Findings reference EvidenceReference items.

## Validation Rules

- ReviewReport must include at least 6 AssessmentAreas.
- Each Recommendation must have a priority and time_horizon.
- EvidenceReference.target must be repository-relative when type is "file" or "path".
- "missing" evidence type must include a descriptive target (e.g., "LICENSE not found").
- Summary counts must match totals derived from recommendations.

## State Transitions

- **draft** -> **complete**: Report generation finishes with all required sections.
- **complete** -> **archived**: Report is superseded by a newer run.

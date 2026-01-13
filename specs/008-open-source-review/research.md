# Research: Open Source Review Recommendations

This document records design decisions and their rationale for the review feature.

## Decisions

### 1) Review output formats

- **Decision**: Generate both Markdown (human-readable) and JSON (machine-readable) outputs.
- **Rationale**: Markdown is shareable in GitHub issues/PRs, while JSON enables downstream tooling and automation.
- **Alternatives considered**: Markdown only; HTML/PDF reports.

### 2) Evidence referencing strategy

- **Decision**: Use repository-relative file paths and explicit "missing" markers for absent artifacts.
- **Rationale**: Relative paths keep reports portable across machines and support offline review.
- **Alternatives considered**: Absolute paths; links to remote Git URLs.

### 3) Recommendation prioritization

- **Decision**: Use High/Medium/Low priority plus "quick" vs "long-term" tags.
- **Rationale**: Matches the spec requirements and keeps prioritization simple for maintainers.
- **Alternatives considered**: Numeric scoring; weighted scorecards.

### 4) Assessment dimensions

- **Decision**: Keep the six core areas: documentation, license, contribution flow, quality signals, community signals, and security signals.
- **Rationale**: Aligns with common open-source maturity checks and the spec scope.
- **Alternatives considered**: Broader frameworks with 10+ dimensions; project-type-specific checklists.

### 5) Runtime inputs and access pattern

- **Decision**: Accept a local repository path, analyze read-only, and avoid network access.
- **Rationale**: Ensures fast, deterministic results and avoids external dependencies.
- **Alternatives considered**: Fetching from remote Git URLs; calling external scanners.

### 6) Integration approach for this repository

- **Decision**: Implement as a new CLI command using existing CLI structure (commander + prompts) and reuse current formatting utilities.
- **Rationale**: Minimizes new dependencies and keeps the experience consistent with existing commands.
- **Alternatives considered**: Standalone script outside the CLI; separate service with HTTP API.

### 7) Persistence strategy

- **Decision**: No persistent storage beyond optional output files specified by the user.
- **Rationale**: This CLI already operates locally and should stay stateless.
- **Alternatives considered**: Local cache directory; database-backed history.

# Research & Design Decisions: Improve CLI UI Aesthetics

**Feature**: Improve CLI UI Aesthetics
**Date**: 2026-01-09

## 1. Dashboard Border Style

- **Decision**: Use `cli-table3`'s `single` border style with custom characters if needed for a lighter look.
- **Rationale**:
  - **Modernity**: Double borders (`double` or default heavy box chars) often look dated. Single lines (`─` instead of `═`) are cleaner and less distracting.
  - **Compatibility**: Single line box-drawing characters are standard Unicode and well-supported.
  - **Consistency**: A lighter border aligns with the goal of reducing visual weight.
- **Alternatives Considered**:
  - *No Border*: Too unstructured for a dashboard that needs to separate itself from the menu.
  - *Rounded Corners*: `cli-table3` allows custom characters. We can attempt to use rounded corners (`╭`, `╮`, `╰`, `╯`) if they look good, but standard single corners are safer for all fonts. We will opt for standard single lines first, perhaps rounded if easy to configure.

## 2. Navigation Bar (Breadcrumbs)

- **Decision**: Remove full-width separators. Use simple padding and color differentiation.
- **Rationale**:
  - **Visual Noise**: Full width lines above and below the breadcrumb (`──────────`) create a "sandwich" effect that cramps the text.
  - **Clarity**: A simple blue/cyan text path `Home > User` stands out enough on its own against a black background without needing lines.
- **Alternatives Considered**:
  - *Background Color*: Using a full-width background color bar (e.g., blue background) can look nice but often messes up on different terminal color schemes or transparencies. Text-only is safer.

## 3. Color Palette

- **Decision**: Restrict main UI elements to a "Primary" (Cyan/Blue), "Success" (Green), "Error" (Red), and "Neutral" (Gray/White).
- **Rationale**:
  - **Professionalism**: Avoiding the "rainbow" effect (using Yellow, Magenta, etc. randomly) makes the tool feel more cohesive.
  - **Semantics**: Green/Red are strictly for status. Blue/Cyan for branding and interactive elements/headers. Gray for secondary info.
- **Alternatives Considered**:
  - *Theme Configuration*: Overkill for a simple CLI tool. Hardcoded consistent constants are sufficient.

## 4. Status Indicators

- **Decision**: Use colored dots (`●`) or small badges `[ACTIVE]` instead of coloring the entire status text line.
- **Rationale**:
  - **Readability**: Reading a full sentence in bright green/red can be tiring. A small indicator conveys the same info while keeping the text neutral and readable.
- **Alternatives Considered**:
  - *Emoji*: We are already moving away from complex emojis for compatibility (Feature 003). Simple geometric shapes are a good middle ground.

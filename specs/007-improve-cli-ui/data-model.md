# Data Model: Improve CLI UI Aesthetics

## Theme Configuration

A centralized configuration for the UI color palette and style constants.

### Theme Colors

| Key | Description | Value (Chalk) |
|-----|-------------|---------------|
| `primary` | Interactive elements, headers, key info | `cyan` |
| `secondary` | Subtitles, less critical info | `blue` |
| `success` | Positive status, success messages | `green` |
| `warning` | Warning messages, caution states | `yellow` |
| `error` | Error messages, failure states | `red` |
| `neutral` | Static labels, borders, normal text | `gray` / `white` |
| `highlight` | Selected items, focused elements | `bold.cyan` |

### UI Constants

| Key | Description | Value |
|-----|-------------|-------|
| `BORDER_STYLE` | Dashboard border style | `'single'` (cli-table3) |
| `PADDING` | Standard horizontal padding | `1` char |
| `INDICATOR_ACTIVE` | Active status symbol | `●` (Green) |
| `INDICATOR_INACTIVE` | Inactive status symbol | `○` (Gray) or `●` (Red) |

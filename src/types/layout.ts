/**
 * Layout Type Definitions
 *
 * Core types for terminal layout system supporting responsive layouts
 * and multi-column displays.
 *
 * Feature: 005-ui-layout-expansion
 */

/**
 * Layout mode enum - defines different terminal size strategies
 */
/* eslint-disable no-unused-vars */
export enum LayoutMode {
  /** Narrow terminals (< 80 columns) */
  COMPACT = 'compact',
  /** Standard terminals (80-120 columns) */
  STANDARD = 'standard',
  /** Wide terminals (> 120 columns) */
  WIDE = 'wide',
}
/* eslint-enable no-unused-vars */

/**
 * Content region type enum - categorizes different UI regions
 */
/* eslint-disable no-unused-vars */
export enum ContentRegionType {
  /** Page header/title area */
  HEADER = 'header',
  /** Menu options area */
  MENU = 'menu',
  /** Status information area */
  STATUS = 'status',
  /** Main content area */
  CONTENT = 'content',
  /** Footer/hints area */
  FOOTER = 'footer',
}
/* eslint-enable no-unused-vars */

/**
 * Content region interface - defines a rectangular area in the terminal
 */
export interface ContentRegion {
  /** Unique identifier for this region */
  id: string;

  /** Type of content this region contains */
  type: ContentRegionType;

  /** Position in the terminal (row, column) */
  position: {
    row: number;
    column: number;
  };

  /** Size of the region (width, height in characters) */
  size: {
    width: number;
    height: number;
  };

  /** Padding inside the region (top, right, bottom, left in characters) */
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };

  /** Whether to display a border around this region */
  showBorder: boolean;

  /** Optional content data (type depends on region type) */
  content?: unknown;
}

/**
 * Terminal layout interface - complete layout configuration
 */
export interface TerminalLayout {
  /** Terminal width in columns */
  width: number;

  /** Terminal height in rows */
  height: number;

  /** Current layout mode based on terminal width */
  mode: LayoutMode;

  /** Number of columns for multi-column layouts (1 for COMPACT/STANDARD, 2-3 for WIDE) */
  columns: number;

  /** List of content regions in this layout */
  regions: ContentRegion[];

  /** Timestamp when layout was calculated (for cache invalidation) */
  timestamp: number;
}

/**
 * Default layout configuration for non-TTY or fallback scenarios
 */
export const DEFAULT_LAYOUT: TerminalLayout = {
  width: 80,
  height: 24,
  mode: LayoutMode.STANDARD,
  columns: 1,
  regions: [],
  timestamp: 0,
};

/**
 * Minimum terminal size constraints
 */
export const MIN_TERMINAL_SIZE = {
  width: 60,
  height: 20,
} as const;

/**
 * Layout mode thresholds for width-based mode selection
 */
export const LAYOUT_MODE_THRESHOLDS = {
  COMPACT_MAX: 79,
  STANDARD_MIN: 80,
  STANDARD_MAX: 120,
  WIDE_MIN: 121,
} as const;

/**
 * Validate that a TerminalLayout configuration is valid
 *
 * @param layout - Layout to validate
 * @returns true if valid
 * @throws Error if validation fails
 */
export function validateLayout(layout: TerminalLayout): boolean {
  // 1. Check minimum size
  if (layout.width < MIN_TERMINAL_SIZE.width || layout.height < MIN_TERMINAL_SIZE.height) {
    throw new Error(
      `Terminal too small: ${layout.width}x${layout.height} (min: ${MIN_TERMINAL_SIZE.width}x${MIN_TERMINAL_SIZE.height})`
    );
  }

  // 2. Check mode matches width
  const expectedMode =
    layout.width < LAYOUT_MODE_THRESHOLDS.STANDARD_MIN
      ? LayoutMode.COMPACT
      : layout.width > LAYOUT_MODE_THRESHOLDS.STANDARD_MAX
        ? LayoutMode.WIDE
        : LayoutMode.STANDARD;

  if (layout.mode !== expectedMode) {
    throw new Error(
      `LayoutMode mismatch: expected ${expectedMode} for width ${layout.width}, got ${layout.mode}`
    );
  }

  // 3. Check columns constraint
  if (layout.mode === LayoutMode.WIDE && layout.columns < 2) {
    throw new Error(`WIDE mode requires columns >= 2, got ${layout.columns}`);
  }
  if (layout.mode !== LayoutMode.WIDE && layout.columns !== 1) {
    throw new Error(`Non-WIDE mode requires columns = 1, got ${layout.columns}`);
  }

  // 4. Validate all content regions
  for (const region of layout.regions) {
    validateRegion(region, layout);
  }

  return true;
}

/**
 * Validate that a ContentRegion is valid within a given layout
 *
 * @param region - Region to validate
 * @param layout - Parent layout
 * @returns true if valid
 * @throws Error if validation fails
 */
export function validateRegion(region: ContentRegion, layout: TerminalLayout): boolean {
  // 1. Check position bounds
  if (region.position.row < 0 || region.position.row >= layout.height) {
    throw new Error(`Region ${region.id}: row ${region.position.row} out of bounds (0-${layout.height - 1})`);
  }
  if (region.position.column < 0 || region.position.column >= layout.width) {
    throw new Error(
      `Region ${region.id}: column ${region.position.column} out of bounds (0-${layout.width - 1})`
    );
  }

  // 2. Check size bounds
  const maxWidth = layout.width - region.position.column;
  const maxHeight = layout.height - region.position.row;

  if (region.size.width <= 0 || region.size.width > maxWidth) {
    throw new Error(`Region ${region.id}: width ${region.size.width} out of bounds (1-${maxWidth})`);
  }
  if (region.size.height <= 0 || region.size.height > maxHeight) {
    throw new Error(`Region ${region.id}: height ${region.size.height} out of bounds (1-${maxHeight})`);
  }

  // 3. Check padding validity
  const totalHorizontalPadding = region.padding.left + region.padding.right;
  const totalVerticalPadding = region.padding.top + region.padding.bottom;

  if (totalHorizontalPadding >= region.size.width) {
    throw new Error(
      `Region ${region.id}: horizontal padding ${totalHorizontalPadding} >= width ${region.size.width}`
    );
  }
  if (totalVerticalPadding >= region.size.height) {
    throw new Error(
      `Region ${region.id}: vertical padding ${totalVerticalPadding} >= height ${region.size.height}`
    );
  }

  return true;
}

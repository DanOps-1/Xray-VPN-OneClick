/**
 * Layout Manager Service
 *
 * Manages terminal layout detection, caching, and resize events
 * Feature: 005-ui-layout-expansion
 */

import type { TerminalLayout, ContentRegion } from '../types/layout';
import {
  LayoutMode,
  DEFAULT_LAYOUT,
  MIN_TERMINAL_SIZE,
  LAYOUT_MODE_THRESHOLDS,
  validateLayout,
} from '../types/layout';

/**
 * Terminal size information
 */
export interface TerminalSize {
  width: number;
  height: number;
  isTTY: boolean;
}

/**
 * Layout options configuration
 */
export interface LayoutOptions {
  forceMode?: LayoutMode;
  columnGap?: number;
  enableCache?: boolean;
  cacheTTL?: number;
}

/**
 * Resize callback function type
 */
// eslint-disable-next-line no-unused-vars
export type ResizeCallback = (layout: TerminalLayout) => void;

/**
 * Resize debounce delay (300ms as per research.md)
 */
const RESIZE_DEBOUNCE_MS = 300;

/**
 * Layout Manager class
 *
 * Singleton service for managing terminal layouts
 */
export class LayoutManager {
  private currentLayout: TerminalLayout | null = null;
  private layoutCache: Map<string, { layout: TerminalLayout; timestamp: number }> = new Map();
  private resizeCallbacks: ResizeCallback[] = [];
  private resizeTimer: NodeJS.Timeout | null = null;

  /**
   * Detect current terminal size
   */
  public detectTerminalSize(): TerminalSize {
    const isTTY = process.stdout.isTTY ?? false;

    if (isTTY && process.stdout.columns && process.stdout.rows) {
      return {
        width: process.stdout.columns,
        height: process.stdout.rows,
        isTTY: true,
      };
    }

    // Fallback to default size
    return {
      width: DEFAULT_LAYOUT.width,
      height: DEFAULT_LAYOUT.height,
      isTTY,
    };
  }

  /**
   * Calculate layout mode based on terminal width
   */
  public calculateLayoutMode(width: number): LayoutMode {
    if (width < LAYOUT_MODE_THRESHOLDS.STANDARD_MIN) {
      return LayoutMode.COMPACT;
    } else if (width > LAYOUT_MODE_THRESHOLDS.STANDARD_MAX) {
      return LayoutMode.WIDE;
    } else {
      return LayoutMode.STANDARD;
    }
  }

  /**
   * Create a new layout configuration
   */
  public createLayout(mode: LayoutMode, regions: ContentRegion[], options?: LayoutOptions): TerminalLayout {
    const size = this.detectTerminalSize();

    // Determine columns based on mode
    let columns = 1;
    if (mode === LayoutMode.WIDE) {
      columns = 2; // Default to 2 columns for WIDE mode
    }

    // Allow force mode override
    const actualMode = options?.forceMode ?? mode;

    const layout: TerminalLayout = {
      width: size.width,
      height: size.height,
      mode: actualMode,
      columns,
      regions,
      timestamp: Date.now(),
    };

    // Validate before returning
    validateLayout(layout);

    // Cache if enabled
    if (options?.enableCache !== false) {
      const cacheKey = `${actualMode}-${regions.length}`;
      this.layoutCache.set(cacheKey, {
        layout,
        timestamp: Date.now(),
      });
    }

    this.currentLayout = layout;
    return layout;
  }

  /**
   * Get current cached layout
   */
  public getCurrentLayout(): TerminalLayout | null {
    return this.currentLayout;
  }

  /**
   * Clear layout cache
   */
  public clearCache(): void {
    this.layoutCache.clear();
  }

  /**
   * Refresh layout (re-detect and re-create)
   */
  public refreshLayout(regions?: ContentRegion[], options?: LayoutOptions): TerminalLayout {
    const size = this.detectTerminalSize();
    const mode = this.calculateLayoutMode(size.width);
    const regionsToUse = regions ?? this.currentLayout?.regions ?? [];

    return this.createLayout(mode, regionsToUse, options);
  }

  /**
   * Register resize event listener with debounce
   */
  public onResize(callback: ResizeCallback): () => void {
    this.resizeCallbacks.push(callback);

    // Set up resize listener if this is the first callback
    if (this.resizeCallbacks.length === 1) {
      process.stdout.on('resize', this.handleResize.bind(this));
    }

    // Return unsubscribe function
    return () => {
      const index = this.resizeCallbacks.indexOf(callback);
      if (index > -1) {
        this.resizeCallbacks.splice(index, 1);
      }

      // Remove listener if no more callbacks
      if (this.resizeCallbacks.length === 0) {
        process.stdout.off('resize', this.handleResize.bind(this));
      }
    };
  }

  /**
   * Handle resize event with debounce
   */
  private handleResize(): void {
    // Clear existing timer
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }

    // Set new timer
    this.resizeTimer = setTimeout(() => {
      const newLayout = this.refreshLayout();

      // Notify all callbacks
      for (const callback of this.resizeCallbacks) {
        callback(newLayout);
      }

      this.resizeTimer = null;
    }, RESIZE_DEBOUNCE_MS);
  }

  /**
   * Calculate usable content size excluding reserved header space
   * @param reservedRows - Number of rows reserved for header/dashboard
   */
  public getContentSize(reservedRows: number = 0): { width: number; height: number } {
    const size = this.detectTerminalSize();
    return {
      width: size.width,
      height: Math.max(0, size.height - reservedRows),
    };
  }

  /**
   * Validate terminal size meets minimum requirements
   */
  public validateTerminalSize(size: TerminalSize): {
    isValid: boolean;
    message?: string;
    suggestion?: string;
  } {
    if (size.width < MIN_TERMINAL_SIZE.width) {
      return {
        isValid: false,
        message: `Terminal too narrow (${size.width} cols). Minimum: ${MIN_TERMINAL_SIZE.width} cols.`,
        suggestion: `Please resize your terminal to at least ${MIN_TERMINAL_SIZE.width}x${MIN_TERMINAL_SIZE.height} for optimal display.`,
      };
    }

    if (size.height < MIN_TERMINAL_SIZE.height) {
      return {
        isValid: false,
        message: `Terminal too short (${size.height} rows). Minimum: ${MIN_TERMINAL_SIZE.height} rows.`,
        suggestion: `Please resize your terminal to at least ${MIN_TERMINAL_SIZE.width}x${MIN_TERMINAL_SIZE.height} for optimal display.`,
      };
    }

    return {
      isValid: true,
    };
  }
}

/**
 * Singleton instance
 */
export default new LayoutManager();

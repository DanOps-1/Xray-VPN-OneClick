/**
 * Interface for the Dashboard Widget
 * Responsible for rendering the persistent status header.
 */
export interface IDashboardWidget {
  /**
   * Refreshes the internal data snapshot (service status, user count, etc.)
   */
  refresh(): Promise<void>;

  /**
   * Renders the dashboard as a formatted string string suitable for printing.
   * Should respect terminal width and use box-drawing characters.
   * @param width - The available width in columns.
   */
  render(_width: number): string;
}

export interface IScreenManager {
  /**
   * Clears the terminal screen and scrollback (if supported/configured).
   */
  clear(): void;

  /**
   * Renders the complete frame: Dashboard + Breadcrumb + Content Placeholder
   * @param dashboard - The dashboard widget instance
   * @param breadcrumb - The current breadcrumb string
   */
  renderHeader(_dashboard: IDashboardWidget, _breadcrumb: string): void;
}

/**
 * Interface for Navigation Manager
 * Tracks the user's current location in the menu hierarchy.
 */
export interface INavigationManager {
  /**
   * Pushes a new menu level onto the stack.
   * @param label - The display label for the new level.
   */
  push(_label: string): void;

  /**
   * Pops the current level off the stack.
   * @returns The label of the popped level.
   */
  pop(): string | undefined;

  /**
   * Returns the formatted breadcrumb string (e.g., "Home > User Management")
   */
  getBreadcrumb(): string;

  /**
   * Gets the current depth of the stack.
   */
  getDepth(): number;
}

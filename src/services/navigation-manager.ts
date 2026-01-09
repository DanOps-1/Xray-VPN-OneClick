import { INavigationManager } from '../types/ui-components';

export class NavigationManager implements INavigationManager {
  private stack: string[] = ['Home'];

  /**
   * Pushes a new menu level onto the stack.
   * @param label - The display label for the new level.
   */
  push(label: string): void {
    this.stack.push(label);
  }

  /**
   * Pops the current level off the stack.
   * @returns The label of the popped level, or undefined if at root.
   */
  pop(): string | undefined {
    if (this.stack.length <= 1) {
      return undefined;
    }
    return this.stack.pop();
  }

  /**
   * Returns the formatted breadcrumb string (e.g., "Home > User Management")
   */
  getBreadcrumb(): string {
    return this.stack.join(' > ');
  }

  /**
   * Gets the current depth of the stack.
   */
  getDepth(): number {
    return this.stack.length;
  }
}

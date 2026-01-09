import { describe, it, expect, beforeEach } from 'vitest';
import { NavigationManager } from '../../../src/services/navigation-manager';

describe('NavigationManager', () => {
  let navManager: NavigationManager;

  beforeEach(() => {
    navManager = new NavigationManager();
  });

  it('should initialize with Home', () => {
    expect(navManager.getBreadcrumb()).toBe('Home');
    expect(navManager.getDepth()).toBe(1);
  });

  it('should push new levels', () => {
    navManager.push('User Management');
    expect(navManager.getBreadcrumb()).toBe('Home > User Management');
    expect(navManager.getDepth()).toBe(2);

    navManager.push('Add User');
    expect(navManager.getBreadcrumb()).toBe('Home > User Management > Add User');
    expect(navManager.getDepth()).toBe(3);
  });

  it('should pop levels', () => {
    navManager.push('Level 1');
    navManager.push('Level 2');
    
    expect(navManager.pop()).toBe('Level 2');
    expect(navManager.getBreadcrumb()).toBe('Home > Level 1');
    
    expect(navManager.pop()).toBe('Level 1');
    expect(navManager.getBreadcrumb()).toBe('Home');
  });

  it('should not pop root level', () => {
    expect(navManager.pop()).toBeUndefined();
    expect(navManager.getBreadcrumb()).toBe('Home');
  });
});

/**
 * Expiry Checker Service
 *
 * Checks user expiry dates and disables expired users.
 *
 * @module services/expiry-checker
 */

import { UserManager } from './user-manager';
import { UserMetadataManager } from './user-metadata-manager';
import type { User } from '../types/user';

export interface ExpiryCheckResult {
  email: string;
  userId: string;
  expiryDate: string;
  daysRemaining: number;
  wasDisabled: boolean;
  status: 'expired' | 'expiring-soon' | 'active' | 'no-expiry';
}

export interface ExpiryCheckSummary {
  totalChecked: number;
  expiredCount: number;
  expiringSoonCount: number;
  activeCount: number;
  noExpiryCount: number;
  newlyDisabledCount: number;
  results: ExpiryCheckResult[];
}

export class ExpiryChecker {
  private userManager: UserManager;
  private metadataManager: UserMetadataManager;

  constructor(userManager: UserManager) {
    this.userManager = userManager;
    this.metadataManager = new UserMetadataManager();
  }

  /**
   * Calculate days remaining until expiry
   */
  private getDaysRemaining(expiryDate: string): number {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffMs = expiry.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Check a single user's expiry status
   */
  checkUser(user: User): ExpiryCheckResult {
    if (!user.expiryDate) {
      return {
        email: user.email,
        userId: user.id,
        expiryDate: '',
        daysRemaining: Infinity,
        wasDisabled: false,
        status: 'no-expiry',
      };
    }

    const daysRemaining = this.getDaysRemaining(user.expiryDate);

    let status: ExpiryCheckResult['status'];
    if (daysRemaining <= 0) {
      status = 'expired';
    } else if (daysRemaining <= 3) {
      status = 'expiring-soon';
    } else {
      status = 'active';
    }

    return {
      email: user.email,
      userId: user.id,
      expiryDate: user.expiryDate,
      daysRemaining,
      wasDisabled: false,
      status,
    };
  }

  /**
   * Run expiry check for all users. Disable expired users.
   */
  async enforceAll(autoDisable = true): Promise<ExpiryCheckSummary> {
    const users = await this.userManager.listUsers();
    const results: ExpiryCheckResult[] = [];
    let newlyDisabledCount = 0;

    for (const user of users) {
      const result = this.checkUser(user);

      if (result.status === 'expired' && autoDisable && user.status === 'active') {
        try {
          await this.metadataManager.setMetadata(user.id, {
            status: 'disabled',
            statusChangedAt: new Date().toISOString(),
          });
          result.wasDisabled = true;
          newlyDisabledCount++;
        } catch {
          // Log but continue
        }
      }

      results.push(result);
    }

    const expiredCount = results.filter((r) => r.status === 'expired').length;
    const expiringSoonCount = results.filter((r) => r.status === 'expiring-soon').length;
    const activeCount = results.filter((r) => r.status === 'active').length;
    const noExpiryCount = results.filter((r) => r.status === 'no-expiry').length;

    return {
      totalChecked: results.length,
      expiredCount,
      expiringSoonCount,
      activeCount,
      noExpiryCount,
      newlyDisabledCount,
      results,
    };
  }

  /**
   * Get users expiring within the given number of days
   */
  async getExpiringUsers(withinDays = 3): Promise<ExpiryCheckResult[]> {
    const users = await this.userManager.listUsers();
    return users
      .map((u) => this.checkUser(u))
      .filter(
        (r) =>
          r.status === 'expiring-soon' || (r.daysRemaining > 0 && r.daysRemaining <= withinDays)
      );
  }
}

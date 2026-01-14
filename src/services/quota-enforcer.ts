/**
 * Quota Enforcer Service
 *
 * Monitors user traffic and enforces quota limits by disabling users
 * who exceed their allocated quota.
 *
 * @module services/quota-enforcer
 */

import { QuotaManager } from './quota-manager';
import { TrafficManager } from './traffic-manager';
import { calculateUsagePercent, getAlertLevel } from '../utils/traffic-formatter';
import type { AlertLevel } from '../types/quota';

/**
 * Result of quota enforcement check
 */
export interface EnforcementResult {
  /** User email */
  email: string;

  /** Current usage in bytes */
  usedBytes: number;

  /** Quota limit in bytes (-1 for unlimited) */
  quotaBytes: number;

  /** Usage percentage */
  usagePercent: number;

  /** Alert level */
  alertLevel: AlertLevel;

  /** Whether user was disabled */
  wasDisabled: boolean;

  /** Previous status */
  previousStatus: 'active' | 'disabled' | 'exceeded';
}

/**
 * Summary of enforcement run
 */
export interface EnforcementSummary {
  /** Total users checked */
  totalChecked: number;

  /** Users with normal usage */
  normalCount: number;

  /** Users with warning level usage */
  warningCount: number;

  /** Users who exceeded quota */
  exceededCount: number;

  /** Users newly disabled in this run */
  newlyDisabledCount: number;

  /** Detailed results per user */
  results: EnforcementResult[];

  /** Timestamp of enforcement run */
  timestamp: string;
}

/**
 * QuotaEnforcer class
 *
 * Checks all users against their quotas and disables those who exceed limits.
 */
export class QuotaEnforcer {
  private quotaManager: QuotaManager;
  private trafficManager: TrafficManager;

  constructor(_configPath?: string, _serviceName?: string) {
    this.quotaManager = new QuotaManager();
    this.trafficManager = new TrafficManager();
  }

  /**
   * Check and enforce quotas for all users
   *
   * @param autoDisable - Whether to automatically disable users who exceed quota
   * @returns Enforcement summary
   */
  async enforceQuotas(autoDisable: boolean = true): Promise<EnforcementSummary> {
    const results: EnforcementResult[] = [];
    let normalCount = 0;
    let warningCount = 0;
    let exceededCount = 0;
    let newlyDisabledCount = 0;

    // Get all data
    const [quotas, usages] = await Promise.all([
      this.quotaManager.getAllQuotas(),
      this.trafficManager.getAllUsage(),
    ]);

    // Check each user with a quota
    for (const [email, quota] of Object.entries(quotas)) {
      // Skip unlimited quotas
      if (quota.quotaBytes < 0) {
        continue;
      }

      // Get current usage
      const usage = usages.find((u) => u.email === email);
      const usedBytes = usage?.total || quota.usedBytes || 0;

      // Calculate percentage and alert level
      const usagePercent = calculateUsagePercent(usedBytes, quota.quotaBytes);
      const alertLevel = getAlertLevel(usagePercent);

      const result: EnforcementResult = {
        email,
        usedBytes,
        quotaBytes: quota.quotaBytes,
        usagePercent,
        alertLevel,
        wasDisabled: false,
        previousStatus: quota.status,
      };

      // Count by alert level
      switch (alertLevel) {
        case 'normal':
          normalCount++;
          break;
        case 'warning':
          warningCount++;
          break;
        case 'exceeded':
          exceededCount++;

          // Auto-disable if enabled and user is not already disabled
          if (autoDisable && quota.status === 'active') {
            await this.quotaManager.setStatus(email, 'exceeded');
            result.wasDisabled = true;
            newlyDisabledCount++;
          }
          break;
      }

      results.push(result);
    }

    return {
      totalChecked: results.length,
      normalCount,
      warningCount,
      exceededCount,
      newlyDisabledCount,
      results,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Check quota for a single user
   *
   * @param email - User email
   * @param autoDisable - Whether to automatically disable if exceeded
   * @returns Enforcement result or null if user has no quota
   */
  async checkUser(email: string, autoDisable: boolean = true): Promise<EnforcementResult | null> {
    const quota = await this.quotaManager.getQuota(email);

    // No quota or unlimited
    if (quota.quotaBytes < 0) {
      return null;
    }

    // Get current usage
    const usage = await this.trafficManager.getUsage(email);
    const usedBytes = usage?.total || quota.usedBytes || 0;

    // Calculate percentage and alert level
    const usagePercent = calculateUsagePercent(usedBytes, quota.quotaBytes);
    const alertLevel = getAlertLevel(usagePercent);

    const result: EnforcementResult = {
      email,
      usedBytes,
      quotaBytes: quota.quotaBytes,
      usagePercent,
      alertLevel,
      wasDisabled: false,
      previousStatus: quota.status,
    };

    // Auto-disable if exceeded and enabled
    if (autoDisable && alertLevel === 'exceeded' && quota.status === 'active') {
      await this.quotaManager.setStatus(email, 'exceeded');
      result.wasDisabled = true;
    }

    return result;
  }

  /**
   * Get users who need attention (warning or exceeded)
   *
   * @returns Array of users needing attention
   */
  async getUsersNeedingAttention(): Promise<EnforcementResult[]> {
    const summary = await this.enforceQuotas(false); // Don't auto-disable, just check
    return summary.results.filter((r) => r.alertLevel !== 'normal');
  }

  /**
   * Re-enable a disabled user
   *
   * @param email - User email
   * @param resetUsage - Whether to also reset usage counter
   */
  async reenableUser(email: string, resetUsage: boolean = false): Promise<void> {
    await this.quotaManager.setStatus(email, 'active');

    if (resetUsage) {
      await this.quotaManager.resetUsage(email);
    }
  }
}

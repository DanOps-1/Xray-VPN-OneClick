/**
 * Promo Manager - Star Prompt Logic
 *
 * Manages usage tracking and star prompt display timing.
 * Shows prompt on first use and every N uses thereafter.
 *
 * @module services/promo-manager
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

/** Promo state persisted to disk */
interface PromoState {
  /** Total CLI invocations */
  usageCount: number;
  /** Last time promo was shown (ISO string) */
  lastPromoShown: string | null;
  /** User opted out of promos */
  optedOut: boolean;
  /** First use timestamp */
  firstUse: string;
}

/** Default state for new users */
const DEFAULT_STATE: PromoState = {
  usageCount: 0,
  lastPromoShown: null,
  optedOut: false,
  firstUse: new Date().toISOString(),
};

/** Show promo every N uses after first */
const PROMO_INTERVAL = 10;

/** Config directory */
const CONFIG_DIR = join(homedir(), '.xray-manager');
const PROMO_FILE = join(CONFIG_DIR, 'promo.json');

/**
 * PromoManager handles usage tracking and promo display logic
 */
class PromoManager {
  private state: PromoState;
  private disabled: boolean = false;

  constructor() {
    this.state = this.loadState();
  }

  /** Load state from disk */
  private loadState(): PromoState {
    try {
      if (existsSync(PROMO_FILE)) {
        const data = readFileSync(PROMO_FILE, 'utf-8');
        return { ...DEFAULT_STATE, ...JSON.parse(data) };
      }
    } catch {
      // Ignore errors, use default
    }
    return { ...DEFAULT_STATE };
  }

  /** Save state to disk */
  private saveState(): void {
    try {
      if (!existsSync(CONFIG_DIR)) {
        mkdirSync(CONFIG_DIR, { recursive: true });
      }
      writeFileSync(PROMO_FILE, JSON.stringify(this.state, null, 2));
    } catch {
      // Ignore save errors
    }
  }

  /** Disable promo for this session (--no-promo flag) */
  disableForSession(): void {
    this.disabled = true;
  }

  /** Permanently opt out */
  optOut(): void {
    this.state.optedOut = true;
    this.saveState();
  }

  /** Increment usage count */
  incrementUsage(): void {
    this.state.usageCount++;
    this.saveState();
  }

  /** Check if promo should be shown */
  shouldShowPromo(): boolean {
    // Session disabled or opted out
    if (this.disabled || this.state.optedOut) {
      return false;
    }

    const count = this.state.usageCount;

    // First use (count was just incremented to 1)
    if (count === 1) {
      return true;
    }

    // Every N uses after that
    if (count > 1 && count % PROMO_INTERVAL === 0) {
      return true;
    }

    return false;
  }

  /** Mark promo as shown */
  markPromoShown(): void {
    this.state.lastPromoShown = new Date().toISOString();
    this.saveState();
  }

  /** Get usage count */
  getUsageCount(): number {
    return this.state.usageCount;
  }

  /** Check if this is first use */
  isFirstUse(): boolean {
    return this.state.usageCount <= 1;
  }
}

/** Singleton instance */
export const promoManager = new PromoManager();

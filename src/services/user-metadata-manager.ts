/**
 * UserMetadataManager - User Metadata Persistence Service
 *
 * Manages user creation time, status, and other metadata
 *
 * @module services/user-metadata-manager
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname } from 'path';
import { DEFAULT_PATHS } from '../constants/paths';
import type { UserMeta, UserMetadataStore, UserStatus } from '../types/user-metadata';

/**
 * Validate UUID v4 format
 */
function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * UserMetadataManager - Manage user metadata persistence
 */
export class UserMetadataManager {
  private metadataPath: string;
  private cache: UserMetadataStore | null = null;

  /**
   * Create a new UserMetadataManager
   *
   * @param metadataPath - Path to metadata file
   */
  constructor(metadataPath?: string) {
    this.metadataPath = metadataPath || DEFAULT_PATHS.USER_METADATA_FILE;
  }

  /**
   * Load metadata from file
   *
   * @returns UserMetadataStore
   */
  private async loadMetadata(): Promise<UserMetadataStore> {
    if (this.cache) {
      return this.cache;
    }

    try {
      if (!existsSync(this.metadataPath)) {
        this.cache = { users: {} };
        return this.cache;
      }
      const content = await readFile(this.metadataPath, 'utf-8');
      this.cache = JSON.parse(content) as UserMetadataStore;
      return this.cache;
    } catch {
      this.cache = { users: {} };
      return this.cache;
    }
  }

  /**
   * Save metadata to file
   *
   * @param store - UserMetadataStore to save
   */
  private async saveMetadata(store: UserMetadataStore): Promise<void> {
    const dir = dirname(this.metadataPath);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
    await writeFile(this.metadataPath, JSON.stringify(store, null, 2), 'utf-8');
    this.cache = store;
  }

  /**
   * Get metadata for a specific user
   *
   * @param userId - User UUID
   * @returns UserMeta or null if not found
   */
  async getMetadata(userId: string): Promise<UserMeta | null> {
    const store = await this.loadMetadata();
    return store.users[userId] || null;
  }

  /**
   * Set metadata for a user (create or update)
   *
   * @param userId - User UUID
   * @param metadata - Partial metadata to set/update
   */
  async setMetadata(userId: string, metadata: Partial<UserMeta>): Promise<void> {
    if (!isValidUuid(userId)) {
      throw new Error(`Invalid UUID format: ${userId}`);
    }

    const store = await this.loadMetadata();
    const existing = store.users[userId] || {
      createdAt: new Date().toISOString(),
      status: 'active' as UserStatus,
    };

    store.users[userId] = {
      ...existing,
      ...metadata,
    };

    await this.saveMetadata(store);
  }

  /**
   * Create metadata for a new user
   *
   * @param userId - User UUID
   * @returns Created UserMeta
   */
  async createUser(userId: string): Promise<UserMeta> {
    if (!isValidUuid(userId)) {
      throw new Error(`Invalid UUID format: ${userId}`);
    }

    const store = await this.loadMetadata();

    // Don't overwrite existing metadata
    if (store.users[userId]) {
      return store.users[userId];
    }

    const now = new Date().toISOString();
    const metadata: UserMeta = {
      createdAt: now,
      status: 'active',
      statusChangedAt: now,
    };

    store.users[userId] = metadata;
    await this.saveMetadata(store);

    return metadata;
  }

  /**
   * Update user status
   *
   * @param userId - User UUID
   * @param status - New status
   */
  async updateStatus(userId: string, status: UserStatus): Promise<void> {
    const store = await this.loadMetadata();

    if (!store.users[userId]) {
      throw new Error(`User metadata not found: ${userId}`);
    }

    store.users[userId].status = status;
    store.users[userId].statusChangedAt = new Date().toISOString();

    await this.saveMetadata(store);
  }

  /**
   * Delete user metadata
   *
   * @param userId - User UUID
   */
  async deleteMetadata(userId: string): Promise<void> {
    const store = await this.loadMetadata();

    if (store.users[userId]) {
      delete store.users[userId];
      await this.saveMetadata(store);
    }
  }

  /**
   * Get all user metadata
   *
   * @returns Record of userId to UserMeta
   */
  async getAllMetadata(): Promise<Record<string, UserMeta>> {
    const store = await this.loadMetadata();
    return { ...store.users };
  }

  /**
   * Get users by status
   *
   * @param status - Status to filter by
   * @returns Array of [userId, metadata] pairs
   */
  async getUsersByStatus(status: UserStatus): Promise<Array<[string, UserMeta]>> {
    const store = await this.loadMetadata();
    return Object.entries(store.users).filter(([_, meta]) => meta.status === status);
  }

  /**
   * Clear cache (force reload from file on next access)
   */
  clearCache(): void {
    this.cache = null;
  }
}

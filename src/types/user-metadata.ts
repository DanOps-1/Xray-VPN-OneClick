/**
 * User Metadata Types
 *
 * Types for user metadata persistence (creation time, status history)
 *
 * @module types/user-metadata
 */

/**
 * User status values
 */
export type UserStatus = 'active' | 'disabled' | 'exceeded';

/**
 * Metadata for a single user
 */
export interface UserMeta {
  /** User creation timestamp (ISO8601) */
  createdAt: string;

  /** Current user status */
  status: UserStatus;

  /** Last status change timestamp (ISO8601) */
  statusChangedAt?: string;
}

/**
 * User metadata storage structure
 */
export interface UserMetadataStore {
  /** Map of user UUID to metadata */
  users: Record<string, UserMeta>;
}

/**
 * User metadata update parameters
 */
export interface UserMetadataUpdate {
  /** New status (optional) */
  status?: UserStatus;

  /** Status change timestamp (optional, defaults to now) */
  statusChangedAt?: string;
}

/**
 * Default empty metadata store
 */
export const EMPTY_METADATA_STORE: UserMetadataStore = {
  users: {},
};

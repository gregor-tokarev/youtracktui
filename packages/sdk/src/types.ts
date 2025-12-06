/**
 * Core YouTrack API Types
 * Based on YouTrack REST API documentation
 */

/**
 * Base entity with ID
 */
export interface BaseEntity {
  id: string;
  $type?: string;
}

/**
 * User entity
 */
export interface User extends BaseEntity {
  name?: string;
  login?: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  guest?: boolean;
}

/**
 * Project reference
 */
export interface ProjectRef extends BaseEntity {
  shortName?: string;
  name?: string;
}

/**
 * Project entity
 */
export interface Project extends ProjectRef {
  description?: string;
  archived?: boolean;
  leader?: User;
  createdBy?: User;
  issues?: Issue[];
  agile?: AgileBoard;
  customFields?: ProjectCustomField[];
}

/**
 * Custom field value
 */
export interface CustomFieldValue {
  name?: string;
  value?: string | number | boolean;
  id?: string;
  $type?: string;
  presentation?: string;
}

/**
 * Issue custom field
 */
export interface IssueCustomField {
  name: string;
  value?: CustomFieldValue | CustomFieldValue[];
  id?: string;
  $type?: string;
  presentation?: string;
}

/**
 * Issue entity
 */
export interface Issue extends BaseEntity {
  idReadable?: string;
  summary?: string;
  description?: string;
  created?: number;
  updated?: number;
  resolved?: number;
  project?: ProjectRef;
  reporter?: User;
  updater?: User;
  assignee?: User;
  state?: State;
  customFields?: IssueCustomField[];
  tags?: Tag[];
  watchers?: User[];
  comments?: Comment[];
}

/**
 * State (e.g., Unresolved, Fixed, etc.)
 */
export interface State extends BaseEntity {
  name?: string;
  resolved?: boolean;
  color?: Color;
}

/**
 * Color
 */
export interface Color {
  id?: string;
  background?: string;
  foreground?: string;
}

/**
 * Tag
 */
export interface Tag extends BaseEntity {
  name?: string;
  visibleForProject?: boolean;
  untagOnResolve?: boolean;
  updateableBy?: User[];
  readSharingSettings?: SharingSettings;
  updateSharingSettings?: SharingSettings;
}

/**
 * Sharing settings
 */
export interface SharingSettings {
  permittedGroups?: UserGroup[];
  permittedUsers?: User[];
}

/**
 * User group
 */
export interface UserGroup extends BaseEntity {
  name?: string;
}

/**
 * Comment
 */
export interface Comment extends BaseEntity {
  text?: string;
  author?: User;
  created?: number;
  updated?: number;
  deleted?: boolean;
  visibility?: Visibility;
}

/**
 * Visibility
 */
export interface Visibility extends BaseEntity {
  permittedGroups?: UserGroup[];
  permittedUsers?: User[];
}

/**
 * Activity item
 */
export interface ActivityItem extends BaseEntity {
  type?: string;
  author?: User;
  timestamp?: number;
  target?: BaseEntity;
  targetMember?: string;
  removed?: any;
  added?: any;
  field?: CustomField;
}

/**
 * Custom field definition
 */
export interface CustomField extends BaseEntity {
  name?: string;
  fieldType?: FieldType;
  bundle?: Bundle;
  canBeEmpty?: boolean;
  isPublic?: boolean;
}

/**
 * Field type
 */
export interface FieldType extends BaseEntity {
  valueType?: string;
}

/**
 * Bundle (for enum-like custom fields)
 */
export interface Bundle extends BaseEntity {
  name?: string;
  values?: BundleValue[];
}

/**
 * Bundle value
 */
export interface BundleValue extends BaseEntity {
  name?: string;
  ordinal?: number;
}

/**
 * Project custom field
 */
export interface ProjectCustomField extends BaseEntity {
  name?: string;
  customField?: CustomField;
  bundle?: Bundle;
  canBeEmpty?: boolean;
  isPublic?: boolean;
}

/**
 * Agile board
 */
export interface AgileBoard extends BaseEntity {
  name?: string;
  sprints?: Sprint[];
  columns?: Column[];
  projects?: ProjectRef[];
}

/**
 * Sprint
 */
export interface Sprint extends BaseEntity {
  name?: string;
  goal?: string;
  start?: number;
  finish?: number;
  archived?: boolean;
  agile?: AgileBoard;
}

/**
 * Column (on agile board)
 */
export interface Column extends BaseEntity {
  name?: string;
  ordinal?: number;
  resolved?: boolean;
}

/**
 * Work item
 */
export interface WorkItem extends BaseEntity {
  date?: number;
  duration?: Duration;
  author?: User;
  issue?: Issue;
  type?: WorkItemType;
  text?: string;
  description?: string;
}

/**
 * Duration
 */
export interface Duration {
  minutes?: number;
  presentation?: string;
}

/**
 * Work item type
 */
export interface WorkItemType extends BaseEntity {
  name?: string;
}

/**
 * Search options
 */
export interface SearchOptions {
  fields?: string | string[];
  top?: number;
  skip?: number;
  query?: string;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  skip?: number;
  top?: number;
}

/**
 * YouTrack SDK configuration
 */
export interface YouTrackConfig {
  baseUrl: string;
  token: string;
  maxRetries?: number;
  timeout?: number;
}

/**
 * Request options
 */
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  returnHeaders?: boolean;
}


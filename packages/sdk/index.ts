/**
 * YouTrack TypeScript SDK
 * 
 * A robust TypeScript SDK for interacting with the YouTrack REST API.
 * 
 * @example
 * ```typescript
 * import { YouTrackSDK } from '@youtracktui/sdk';
 * 
 * const youtrack = new YouTrackSDK({
 *   baseUrl: 'https://your-youtrack-instance.com',
 *   token: 'your-api-token',
 * });
 * 
 * const issues = await youtrack.issues.search('assignee: me');
 * ```
 */

export { YouTrackSDK } from './src/sdk';
export { YouTrackClient } from './src/client';
export { YouTrackError } from './src/client';

// Export all types
export type {
  BaseEntity,
  User,
  ProjectRef,
  Project,
  CustomFieldValue,
  IssueCustomField,
  Issue,
  State,
  Color,
  Tag,
  SharingSettings,
  UserGroup,
  Comment,
  Visibility,
  ActivityItem,
  CustomField,
  FieldType,
  Bundle,
  BundleValue,
  ProjectCustomField,
  AgileBoard,
  Sprint,
  Column,
  WorkItem,
  Duration,
  WorkItemType,
  SearchOptions,
  PaginatedResponse,
  YouTrackConfig,
  RequestOptions,
} from './src/types';

// Export resource classes for advanced usage
export { IssuesResource } from './src/resources/issues';
export { ProjectsResource } from './src/resources/projects';
export { UsersResource } from './src/resources/users';
export { AgileResource } from './src/resources/agile';


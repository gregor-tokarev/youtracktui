export interface BaseEntity {
	id: string;
	$type?: string;
}

export interface User extends BaseEntity {
	name?: string;
	login?: string;
	email?: string;
	fullName?: string;
	avatarUrl?: string;
	guest?: boolean;
}

export interface ProjectRef extends BaseEntity {
	shortName?: string;
	name?: string;
}

export interface Project extends ProjectRef {
	description?: string;
	archived?: boolean;
	leader?: User;
	createdBy?: User;
	issues?: Issue[];
	agile?: AgileBoard;
	customFields?: ProjectCustomField[];
}

export interface CustomFieldValue {
	name?: string;
	value?: string | number | boolean;
	id?: string;
	$type?: string;
	presentation?: string;
}

export interface IssueCustomField {
	name: string;
	value?: CustomFieldValue | CustomFieldValue[];
	id?: string;
	$type?: string;
	presentation?: string;
}

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

export interface State extends BaseEntity {
	name?: string;
	resolved?: boolean;
	color?: Color;
}

export interface Color {
	id?: string;
	background?: string;
	foreground?: string;
}

export interface Tag extends BaseEntity {
	name?: string;
	visibleForProject?: boolean;
	untagOnResolve?: boolean;
	updateableBy?: User[];
	readSharingSettings?: SharingSettings;
	updateSharingSettings?: SharingSettings;
}

export interface SharingSettings {
	permittedGroups?: UserGroup[];
	permittedUsers?: User[];
}

export interface UserGroup extends BaseEntity {
	name?: string;
}

export interface Comment extends BaseEntity {
	text?: string;
	author?: User;
	created?: number;
	updated?: number;
	deleted?: boolean;
	visibility?: Visibility;
}

export interface Visibility extends BaseEntity {
	permittedGroups?: UserGroup[];
	permittedUsers?: User[];
}

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

export interface CustomField extends BaseEntity {
	name?: string;
	fieldType?: FieldType;
	bundle?: Bundle;
	canBeEmpty?: boolean;
	isPublic?: boolean;
}

export interface FieldType extends BaseEntity {
	valueType?: string;
}

export interface Bundle extends BaseEntity {
	name?: string;
	values?: BundleValue[];
}

export interface BundleValue extends BaseEntity {
	name?: string;
	ordinal?: number;
	isResolved?: boolean;
}

export interface ProjectCustomField extends BaseEntity {
	name?: string;
	customField?: CustomField;
	bundle?: Bundle;
	canBeEmpty?: boolean;
	isPublic?: boolean;
}

export interface AgileBoard extends BaseEntity {
	name?: string;
	sprints?: Sprint[];
	columns?: Column[];
	projects?: ProjectRef[];
}

export interface Sprint extends BaseEntity {
	name?: string;
	goal?: string;
	start?: number;
	finish?: number;
	archived?: boolean;
	agile?: AgileBoard;
}

export interface Column extends BaseEntity {
	name?: string;
	ordinal?: number;
	resolved?: boolean;
}

export interface WorkItem extends BaseEntity {
	date?: number;
	duration?: Duration;
	author?: User;
	issue?: Issue;
	type?: WorkItemType;
	text?: string;
	description?: string;
}

export interface Duration {
	minutes?: number;
	presentation?: string;
}

export interface WorkItemType extends BaseEntity {
	name?: string;
}

export interface SearchOptions {
	fields?: string | string[];
	top?: number;
	skip?: number;
	query?: string;
}

export interface PaginatedResponse<T> {
	data: T[];
	total?: number;
	skip?: number;
	top?: number;
}

export interface YouTrackConfig {
	baseUrl: string;
	token: string;
	maxRetries?: number;
	timeout?: number;
}

export interface RequestOptions {
	method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
	body?: any;
	headers?: Record<string, string>;
	params?: Record<string, string | number | boolean | undefined>;
	returnHeaders?: boolean;
}

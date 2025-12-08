import { YouTrackClient } from "./client";
import { IssuesResource } from "./resources/issues";
import { ProjectsResource } from "./resources/projects";
import { UsersResource } from "./resources/users";
import { AgileResource } from "./resources/agile";
import type { YouTrackConfig } from "./types";

export class YouTrackSDK extends YouTrackClient {
	public readonly issues: IssuesResource;
	public readonly projects: ProjectsResource;
	public readonly users: UsersResource;
	public readonly agiles: AgileResource;

	constructor(config: YouTrackConfig) {
		super(config);
		this.issues = new IssuesResource(this);
		this.projects = new ProjectsResource(this);
		this.users = new UsersResource(this);
		this.agiles = new AgileResource(this);
	}
}

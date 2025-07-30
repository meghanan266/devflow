export interface GitHubUser {
    id: number;
    login: string;
    avatar_url: string;
    email?: string;
}

export interface GitHubRepository {
    id: number;
    name: string;
    full_name: string;
    owner: GitHubUser;
    private: boolean;
}

export interface GitHubPullRequest {
    id: number;
    number: number;
    title: string;
    state: string;
    user: GitHubUser;
    head: {
        sha: string;
        ref: string;
    };
    base: {
        sha: string;
        ref: string;
    };
    diff_url: string;
    patch_url: string;
}

export interface PullRequestWebhookPayload {
    action: string;
    number: number;
    pull_request: GitHubPullRequest;
    repository: GitHubRepository;
    sender: GitHubUser;
}
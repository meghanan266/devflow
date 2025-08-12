export interface User {
    id: string;
    email: string;
    name?: string;
    githubId?: string;
    avatarUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Repository {
    id: string;
    name: string;
    fullName: string;
    githubId: number;
    owner: string;
    private: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PullRequest {
    id: string;
    number: number;
    title: string;
    githubId: number;
    state: string;
    createdAt: string;
    updatedAt: string;
    repository: Repository;
}

export interface Comment {
    id: string;
    content: string;
    filePath?: string;
    lineNumber?: number;
    type: 'security' | 'performance' | 'style' | 'logic' | 'best-practice';
    severity: 'low' | 'medium' | 'high';
    createdAt: string;
}

export interface Review {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    summary?: string;
    score?: number;
    createdAt: string;
    updatedAt: string;
    pullRequest: PullRequest;
    comments: Comment[];
}

export interface ApiResponse<T> {
    review?: T;
    error?: string;
    message?: string;
}
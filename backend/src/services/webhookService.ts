import crypto from 'crypto';
import { Request } from 'express';
import { db } from './database';
import { codeAnalysisService } from './codeAnalysisService';
import { PullRequestWebhookPayload } from '../types/github';

class WebhookService {
    private readonly webhookSecret: string;

    constructor() {
        this.webhookSecret = process.env.GITHUB_WEBHOOK_SECRET || 'dev-secret-key';
    }

    // Verify GitHub webhook signature
    verifySignature(payload: string, signature: string): boolean {
        if (!signature) return false;

        const expectedSignature = crypto
            .createHmac('sha256', this.webhookSecret)
            .update(payload, 'utf8')
            .digest('hex');

        const expectedHeader = `sha256=${expectedSignature}`;

        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedHeader)
        );
    }

    // Extract payload from request
    extractPayload(req: Request): { payload: string; signature: string } {
        const payload = JSON.stringify(req.body);
        const signature = req.get('X-Hub-Signature-256') || '';

        return { payload, signature };
    }

    // Handle pull request events
    async handlePullRequestEvent(payload: PullRequestWebhookPayload): Promise<void> {
        const { action, pull_request, repository, sender } = payload;

        console.log(`Received PR ${action} event:`, {
            repo: repository.full_name,
            pr: pull_request.number,
            title: pull_request.title
        });

        // Only process opened and synchronize events
        if (!['opened', 'synchronize'].includes(action)) {
            console.log(`Skipping action: ${action}`);
            return;
        }

        try {
            // Ensure user exists
            const user = await this.ensureUserExists({
                githubId: sender.id.toString(),
                login: sender.login,
                avatarUrl: sender.avatar_url
            });

            if (!user) {
                throw new Error('Failed to create or retrieve user');
            }

            // Ensure repository exists
            const repo = await this.ensureRepositoryExists({
                githubId: repository.id,
                name: repository.name,
                fullName: repository.full_name,
                owner: repository.owner.login,
                private: repository.private,
                userId: user.id
            });

            if (!repo) {
                throw new Error('Failed to create or retrieve repository');
            }

            // Create or update pull request
            const pr = await this.ensurePullRequestExists({
                githubId: pull_request.id,
                number: pull_request.number,
                title: pull_request.title,
                state: pull_request.state,
                repositoryId: repo.id
            });

            if (!pr) {
                throw new Error('Failed to create or retrieve pull request');
            }

            // Create a pending review
            const review = await db.createReview({
                status: 'pending',
                pullRequestId: pr.id,
                userId: user.id
            });

            console.log(`Successfully processed PR event for: ${repository.full_name}#${pull_request.number}`);

            // Trigger code analysis
            console.log('Triggering code analysis...');
            await codeAnalysisService.processReview({
                pullRequestId: review.id,
                repositoryFullName: repository.full_name,
                pullRequestNumber: pull_request.number,
                userId: user.id
            });

        } catch (error) {
            console.error('Error processing pull request event:', error);
            throw error;
        }
    }

    // Helper methods remain the same...
    private async ensureUserExists(userData: {
        githubId: string;
        login: string;
        avatarUrl: string;
    }) {
        let user = await db.getUserByGithubId(userData.githubId);

        if (!user) {
            const newUser = await db.createUser({
                githubId: userData.githubId,
                name: userData.login,
                email: `${userData.login}@github.local`,
                avatarUrl: userData.avatarUrl
            });

            user = await db.getUserByGithubId(userData.githubId);
            console.log(`Created new user: ${userData.login}`);
        }

        return user;
    }

    private async ensureRepositoryExists(repoData: {
        githubId: number;
        name: string;
        fullName: string;
        owner: string;
        private: boolean;
        userId: string;
    }) {
        let repo = await db.getRepositoryByGithubId(repoData.githubId);

        if (!repo) {
            const newRepo = await db.createRepository(repoData);
            repo = await db.getRepositoryByGithubId(repoData.githubId);
            console.log(`Created new repository: ${repoData.fullName}`);
        }

        return repo;
    }

    private async ensurePullRequestExists(prData: {
        githubId: number;
        number: number;
        title: string;
        state: string;
        repositoryId: string;
    }) {
        let pr = await db.getPullRequestByGithubId(prData.githubId);

        if (!pr) {
            const newPr = await db.createPullRequest(prData);
            pr = await db.getPullRequestByGithubId(prData.githubId);
            console.log(`Created new pull request: #${prData.number}`);
        }

        return pr;
    }
}

export const webhookService = new WebhookService();
export default WebhookService;
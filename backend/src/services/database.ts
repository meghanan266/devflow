import { PrismaClient } from '@prisma/client';

class DatabaseService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
        });
    }

    // User operations
    async createUser(data: {
        email: string;
        name?: string;
        githubId?: string;
        avatarUrl?: string;
    }) {
        return this.prisma.user.create({ data });
    }

    async getUserByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
            include: { repositories: true }
        });
    }

    async getUserByGithubId(githubId: string) {
        return this.prisma.user.findUnique({
            where: { githubId },
            include: { repositories: true }
        });
    }

    // Repository operations
    async createRepository(data: {
        name: string;
        fullName: string;
        githubId: number;
        owner: string;
        private?: boolean;
        userId: string;
    }) {
        return this.prisma.repository.create({ data });
    }

    async getRepositoryByGithubId(githubId: number) {
        return this.prisma.repository.findUnique({
            where: { githubId },
            include: { user: true, pullRequests: true }
        });
    }

    // Pull Request operations
    async createPullRequest(data: {
        number: number;
        title: string;
        githubId: number;
        state: string;
        repositoryId: string;
    }) {
        return this.prisma.pullRequest.create({ data });
    }

    async getPullRequestByGithubId(githubId: number) {
        return this.prisma.pullRequest.findUnique({
            where: { githubId },
            include: { repository: true, reviews: true }
        });
    }

    // Review operations
    async createReview(data: {
        status: string;
        pullRequestId: string;
        userId: string;
        summary?: string;
        score?: number;
    }) {
        return this.prisma.review.create({ data });
    }

    async updateReview(id: string, data: {
        status?: string;
        summary?: string;
        score?: number;
    }) {
        return this.prisma.review.update({
            where: { id },
            data
        });
    }

    // Comment operations
    async createComment(data: {
        content: string;
        reviewId: string;
        filePath?: string;
        lineNumber?: number;
        type: string;
        severity: string;
    }) {
        return this.prisma.comment.create({ data });
    }

    // Health check
    async healthCheck() {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return { status: 'healthy', timestamp: new Date().toISOString() };
        } catch (error) {
            return { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    // Cleanup
    async disconnect() {
        await this.prisma.$disconnect();
    }
}

// Export singleton instance
export const db = new DatabaseService();
export default DatabaseService;
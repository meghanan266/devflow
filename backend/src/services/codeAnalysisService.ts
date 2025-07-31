import { db } from './database';
import { aiService } from './aiService';
import { githubService } from './githubService';

interface AnalysisJobData {
    pullRequestId: string;
    repositoryFullName: string;
    pullRequestNumber: number;
    userId: string;
}

class CodeAnalysisService {
    async processReview(data: AnalysisJobData): Promise<void> {
        const { pullRequestId, repositoryFullName, pullRequestNumber, userId } = data;

        console.log(`Starting code analysis for PR ${repositoryFullName}#${pullRequestNumber}`);

        try {
            // Update review status to processing
            await db.updateReview(pullRequestId, { status: 'processing' });

            // Parse repository owner and name
            const [owner, repo] = repositoryFullName.split('/');
            if (!owner || !repo) {
                throw new Error(`Invalid repository format: ${repositoryFullName}`);
            }

            // Fetch pull request details and diff
            console.log(`Fetching PR details from GitHub...`);
            const [prDetails, prDiff] = await Promise.all([
                githubService.getPullRequestDetails(owner, repo, pullRequestNumber),
                githubService.getPullRequestDiff(owner, repo, pullRequestNumber)
            ]);

            // Check if there are any code changes to analyze
            if (!prDiff.content.trim()) {
                console.log('No code changes found, marking as completed');
                await db.updateReview(pullRequestId, {
                    status: 'completed',
                    summary: 'No code changes detected in this pull request.',
                    score: 100
                });
                return;
            }

            console.log(`Analyzing ${prDiff.files.length} files with AI...`);

            // Perform AI analysis
            const analysis = await aiService.analyzePullRequest(prDiff.content, prDetails.title);

            // Store analysis results
            await db.updateReview(pullRequestId, {
                status: 'completed',
                summary: analysis.summary,
                score: analysis.score
            });

            // Store individual comments
            console.log(`Creating ${analysis.comments.length} review comments...`);
            for (const comment of analysis.comments) {
                await db.createComment({
                    content: comment.content,
                    reviewId: pullRequestId,
                    filePath: comment.filePath,
                    lineNumber: comment.lineNumber,
                    type: comment.type,
                    severity: comment.severity
                });
            }

            console.log(`Analysis completed successfully for PR ${repositoryFullName}#${pullRequestNumber}`);
            console.log(`Score: ${analysis.score}, Comments: ${analysis.comments.length}`);

        } catch (error) {
            console.error(`Analysis failed for PR ${repositoryFullName}#${pullRequestNumber}:`, error);

            // Update review with error status
            await db.updateReview(pullRequestId, {
                status: 'failed',
                summary: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            });

            throw error;
        }
    }

    async getReviewWithComments(reviewId: string) {
        try {
            // We need to add this method to our database service
            return await db.getReviewWithComments(reviewId);
        } catch (error) {
            console.error(`Failed to fetch review ${reviewId}:`, error);
            throw error;
        }
    }

    async getRepositoryStats(repositoryId: string) {
        try {
            // We need to add this method to our database service
            return await db.getRepositoryStats(repositoryId);
        } catch (error) {
            console.error(`Failed to fetch repository stats ${repositoryId}:`, error);
            throw error;
        }
    }
}

export const codeAnalysisService = new CodeAnalysisService();
export default CodeAnalysisService;
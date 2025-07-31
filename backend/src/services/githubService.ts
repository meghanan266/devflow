import { Octokit } from '@octokit/rest';

interface PullRequestDiff {
    content: string;
    files: Array<{
        filename: string;
        status: string;
        additions: number;
        deletions: number;
        patch?: string;
    }>;
}

class GitHubService {
    private octokit: Octokit;

    constructor() {
        const token = process.env.GITHUB_TOKEN;
        if (!token) {
            console.warn('GITHUB_TOKEN not provided - using unauthenticated requests (rate limited)');
        }

        this.octokit = new Octokit({
            auth: token,
            userAgent: 'DevFlow-CodeReview/1.0.0',
        });
    }

    async getPullRequestDiff(owner: string, repo: string, pullNumber: number): Promise<PullRequestDiff> {
        try {
            console.log(`Fetching PR diff for ${owner}/${repo}#${pullNumber}`);

            // Get the pull request files
            const { data: files } = await this.octokit.rest.pulls.listFiles({
                owner,
                repo,
                pull_number: pullNumber,
                per_page: 100, // GitHub's max per page
            });

            // Filter out binary files and overly large files
            const textFiles = files.filter(file => {
                // Skip binary files
                if (file.status === 'removed') return false;

                // Skip very large files (> 10KB changes)
                if ((file.additions + file.deletions) > 1000) {
                    console.log(`Skipping large file: ${file.filename} (${file.additions + file.deletions} changes)`);
                    return false;
                }

                // Skip certain file types
                const skipExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.pdf', '.zip', '.tar', '.gz'];
                const hasSkipExtension = skipExtensions.some(ext => file.filename.toLowerCase().endsWith(ext));

                if (hasSkipExtension) {
                    console.log(`Skipping binary file: ${file.filename}`);
                    return false;
                }

                return true;
            });

            // Build the combined diff content
            let combinedDiff = '';

            for (const file of textFiles) {
                if (file.patch) {
                    combinedDiff += `\n--- a/${file.filename}\n+++ b/${file.filename}\n`;
                    combinedDiff += file.patch + '\n';
                }
            }

            // Limit total diff size to prevent token overflow
            if (combinedDiff.length > 50000) {
                console.log(`Truncating large diff (${combinedDiff.length} chars) to prevent token overflow`);
                combinedDiff = combinedDiff.substring(0, 50000) + '\n\n... (diff truncated due to size)';
            }

            return {
                content: combinedDiff,
                files: textFiles.map(file => ({
                    filename: file.filename,
                    status: file.status,
                    additions: file.additions,
                    deletions: file.deletions,
                    patch: file.patch,
                })),
            };

        } catch (error) {
            console.error(`Failed to fetch PR diff for ${owner}/${repo}#${pullNumber}:`, error);
            throw new Error(`GitHub API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getPullRequestDetails(owner: string, repo: string, pullNumber: number) {
        try {
            const { data } = await this.octokit.rest.pulls.get({
                owner,
                repo,
                pull_number: pullNumber,
            });

            return {
                title: data.title,
                body: data.body || '',
                state: data.state,
                head: {
                    sha: data.head.sha,
                    ref: data.head.ref,
                },
                base: {
                    sha: data.base.sha,
                    ref: data.base.ref,
                }
            };
        } catch (error) {
            console.error(`Failed to fetch PR details for ${owner}/${repo}#${pullNumber}:`, error);
            throw new Error(`GitHub API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Method to post review comments (for future use)
    async createReviewComment(
        owner: string,
        repo: string,
        pullNumber: number,
        body: string,
        commitSha: string,
        path?: string,
        line?: number
    ) {
        try {
            if (path && line) {
                // Create a review comment on a specific line
                const { data } = await this.octokit.rest.pulls.createReviewComment({
                    owner,
                    repo,
                    pull_number: pullNumber,
                    body,
                    commit_id: commitSha,
                    path,
                    line,
                });
                return data;
            } else {
                // Create a general review comment
                const { data } = await this.octokit.rest.pulls.createReview({
                    owner,
                    repo,
                    pull_number: pullNumber,
                    body,
                    event: 'COMMENT',
                });
                return data;
            }
        } catch (error) {
            console.error(`Failed to create review comment:`, error);
            throw new Error(`GitHub API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Test GitHub API connection
    async testConnection(): Promise<boolean> {
        try {
            await this.octokit.rest.users.getAuthenticated();
            return true;
        } catch (error) {
            // If not authenticated, try a simple public API call
            try {
                await this.octokit.rest.meta.get();
                return true;
            } catch (secondError) {
                console.error('GitHub API connection test failed:', secondError);
                return false;
            }
        }
    }
}

export const githubService = new GitHubService();
export default GitHubService;
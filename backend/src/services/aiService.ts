import OpenAI from 'openai';

interface CodeAnalysisResult {
    summary: string;
    score: number;
    comments: Array<{
        content: string;
        type: 'security' | 'performance' | 'style' | 'logic' | 'best-practice';
        severity: 'low' | 'medium' | 'high';
        filePath?: string;
        lineNumber?: number;
    }>;
}

class AIService {
    private openai: OpenAI;

    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY environment variable is required');
        }

        this.openai = new OpenAI({
            apiKey: apiKey,
        });
    }

    async analyzePullRequest(diffContent: string, prTitle: string): Promise<CodeAnalysisResult> {
        try {
            console.log('Starting AI analysis for PR:', prTitle);

            const prompt = this.buildAnalysisPrompt(diffContent, prTitle);

            const response = await this.openai.chat.completions.create({
                model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert code reviewer with deep knowledge of software engineering best practices, security, performance optimization, and clean code principles.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 2000,
            });

            const analysis = response.choices[0]?.message?.content;
            if (!analysis) {
                throw new Error('No analysis content received from OpenAI');
            }

            return this.parseAnalysisResult(analysis);

        } catch (error) {
            console.error('AI analysis failed:', error);
            throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private buildAnalysisPrompt(diffContent: string, prTitle: string): string {
        return `
Please analyze this pull request and provide a comprehensive code review.

PR Title: ${prTitle}

Code Changes:
\`\`\`diff
${diffContent}
\`\`\`

Please provide your analysis in the following JSON format:
{
  "summary": "Brief overall assessment of the changes",
  "score": 85,
  "comments": [
    {
      "content": "Specific feedback about the code",
      "type": "security|performance|style|logic|best-practice",
      "severity": "low|medium|high",
      "filePath": "path/to/file.js",
      "lineNumber": 42
    }
  ]
}

Focus on:
1. Security vulnerabilities or concerns
2. Performance implications
3. Code style and maintainability
4. Logic errors or potential bugs
5. Best practices and design patterns

Provide constructive, specific feedback. Score should be 1-100 based on code quality.
Be concise but thorough. Limit to maximum 8 comments for readability.
`;
    }

    private parseAnalysisResult(analysis: string): CodeAnalysisResult {
        try {
            // Extract JSON from the response (handle markdown code blocks)
            const jsonMatch = analysis.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) ||
                analysis.match(/(\{[\s\S]*\})/);

            if (!jsonMatch) {
                // Fallback: try to parse the entire response as JSON
                return JSON.parse(analysis);
            }

            const jsonStr = jsonMatch[1];
            const parsed = JSON.parse(jsonStr);

            // Validate the structure
            if (!parsed.summary || typeof parsed.score !== 'number' || !Array.isArray(parsed.comments)) {
                throw new Error('Invalid analysis structure');
            }

            // Ensure score is within valid range
            parsed.score = Math.max(1, Math.min(100, parsed.score));

            return parsed;

        } catch (error) {
            console.error('Failed to parse AI analysis:', error);

            // Return a fallback result
            return {
                summary: 'AI analysis completed but response format was invalid. Manual review recommended.',
                score: 75,
                comments: [
                    {
                        content: 'AI analysis encountered a parsing error. Please review changes manually.',
                        type: 'logic',
                        severity: 'medium'
                    }
                ]
            };
        }
    }

    // Test method to verify API connection
    async testConnection(): Promise<boolean> {
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'user',
                        content: 'Respond with just "OK" to test the connection.'
                    }
                ],
                max_tokens: 10,
            });

            return response.choices[0]?.message?.content?.trim() === 'OK';
        } catch (error) {
            console.error('OpenAI connection test failed:', error);
            return false;
        }
    }
}

export const aiService = new AIService();
export default AIService;
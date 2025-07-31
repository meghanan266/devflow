import { Router, Request, Response } from 'express';
import { codeAnalysisService } from '../services/codeAnalysisService';

const router = Router();

// Get review with comments
router.get('/:reviewId', async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    
    const review = await codeAnalysisService.getReviewWithComments(reviewId);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({
      review: {
        id: review.id,
        status: review.status,
        summary: review.summary,
        score: review.score,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        pullRequest: {
          number: review.pullRequest.number,
          title: review.pullRequest.title,
          repository: review.pullRequest.repository.fullName
        },
        comments: review.comments.map(comment => ({
          id: comment.id,
          content: comment.content,
          type: comment.type,
          severity: comment.severity,
          filePath: comment.filePath,
          lineNumber: comment.lineNumber,
          createdAt: comment.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Failed to fetch review:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
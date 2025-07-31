import { Router, Request, Response } from 'express';
import { webhookService } from '../services/webhookService';
import { PullRequestWebhookPayload } from '../types/github';

const router = Router();

// Middleware to capture raw body for signature verification
const captureRawBody = (req: Request, res: Response, next: Function) => {
    req.body = JSON.stringify(req.body);
    next();
};

// GitHub webhook endpoint
router.post('/github', async (req: Request, res: Response) => {
    try {
        const event = req.get('X-GitHub-Event');
        const deliveryId = req.get('X-GitHub-Delivery');

        console.log(`Received GitHub webhook:`, {
            event,
            deliveryId,
            timestamp: new Date().toISOString()
        });

        // Extract payload and signature
        const { payload, signature } = webhookService.extractPayload(req);

        // Verify webhook signature in production
        if (process.env.NODE_ENV === 'production') {
            if (!webhookService.verifySignature(payload, signature)) {
                console.error('Invalid webhook signature');
                return res.status(401).json({ error: 'Invalid signature' });
            }
        }

        // Parse the payload back to object
        const parsedPayload = JSON.parse(payload);

        // Handle different event types
        switch (event) {
            case 'pull_request':
                await webhookService.handlePullRequestEvent(parsedPayload as PullRequestWebhookPayload);
                break;

            case 'ping':
                console.log('Received ping event - webhook is connected!');
                return res.status(200).json({
                    message: 'DevFlow webhook is active',
                    zen: parsedPayload.zen
                });

            default:
                console.log(`Unsupported event type: ${event}`);
                return res.status(200).json({ message: 'Event type not supported' });
        }

        res.status(200).json({
            message: 'Webhook processed successfully',
            event,
            deliveryId
        });

    } catch (error) {
        console.error('Webhook processing error:', error);

        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Webhook health check
router.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        message: 'Webhook endpoint is healthy',
        timestamp: new Date().toISOString(),
        supportedEvents: ['pull_request', 'ping']
    });
});

export default router;
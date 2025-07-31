import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { db } from './services/database';
import { aiService } from './services/aiService';
import { githubService } from './services/githubService';
import routes from './routes';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['your-production-domain.com']
        : ['http://localhost:3000'],
    credentials: true
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint with all service statuses
app.get('/health', async (req, res) => {
    const dbHealth = await db.healthCheck();
    const aiHealth = await aiService.testConnection();
    const githubHealth = await githubService.testConnection();

    const overallStatus = dbHealth.status === 'healthy' && aiHealth && githubHealth ? 'OK' : 'ERROR';

    res.status(overallStatus === 'OK' ? 200 : 503).json({
        status: overallStatus,
        timestamp: new Date().toISOString(),
        service: 'DevFlow API',
        database: dbHealth,
        ai: {
            status: aiHealth ? 'healthy' : 'unhealthy',
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
        },
        github: {
            status: githubHealth ? 'healthy' : 'unhealthy',
            authenticated: !!process.env.GITHUB_TOKEN
        }
    });
});

// API routes
app.use('/api/v1', routes);

// Legacy status endpoint
app.get('/api/v1/status', (req, res) => {
    res.json({
        message: 'DevFlow API is running',
        version: '1.0.0',
        environment: process.env.NODE_ENV
    });
});

export default app;
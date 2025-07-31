import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { db } from './services/database';
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

// Health check endpoint with database status
app.get('/health', async (req, res) => {
    const dbHealth = await db.healthCheck();

    res.status(dbHealth.status === 'healthy' ? 200 : 503).json({
        status: dbHealth.status === 'healthy' ? 'OK' : 'ERROR',
        timestamp: new Date().toISOString(),
        service: 'DevFlow API',
        database: dbHealth
    });
});

// API routes
app.use('/api/v1', routes);
app.get('/api/v1/status', (req, res) => {
    res.json({
        message: 'DevFlow API is running',
        version: '1.0.0',
        environment: process.env.NODE_ENV
    });
});

export default app;
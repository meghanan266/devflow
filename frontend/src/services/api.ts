import axios from 'axios';
import type { Review, ApiResponse } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const reviewsApi = {
    // Get all reviews
    getAllReviews: async (): Promise<Review[]> => {
        const response = await api.get<{ reviews: Review[] }>('/reviews');
        return response.data.reviews || [];
    },

    // Get a specific review with comments
    getReview: async (reviewId: string): Promise<Review> => {
        const response = await api.get<ApiResponse<Review>>(`/reviews/${reviewId}`);
        if (response.data.review) {
            return response.data.review;
        }
        throw new Error(response.data.error || 'Failed to fetch review');
    },
};

export default api;
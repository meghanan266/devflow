import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import ReviewCard from '../components/ReviewCard';
import ReviewDetail from '../components/ReviewDetail';
import { reviewsApi } from '../services/api';
import type { Review } from '../types/api';

const Dashboard: React.FC = () => {
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch reviews from API
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true);
                setError(null);
                const fetchedReviews = await reviewsApi.getAllReviews();
                setReviews(fetchedReviews);
            } catch (err) {
                console.error('Failed to fetch reviews:', err);
                setError('Failed to load reviews. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    // Calculate stats from real data
    const stats = React.useMemo(() => {
        const totalReviews = reviews.length;
        const pendingReviews = reviews.filter(r => r.status === 'pending').length;
        const processingReviews = reviews.filter(r => r.status === 'processing').length;
        const completedReviews = reviews.filter(r => r.status === 'completed').length;
        const failedReviews = reviews.filter(r => r.status === 'failed').length;

        const completedWithScores = reviews.filter(r => r.status === 'completed' && r.score);
        const averageScore = completedWithScores.length > 0
            ? Math.round(completedWithScores.reduce((sum, r) => sum + (r.score || 0), 0) / completedWithScores.length)
            : 0;

        return {
            totalReviews,
            pendingReviews: pendingReviews + processingReviews, // Group pending and processing
            completedReviews,
            averageScore
        };
    }, [reviews]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading reviews...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                    <XCircle className="h-5 w-5 text-red-400 mr-2" />
                    <p className="text-red-700">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Code Review Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Monitor your pull request reviews and code quality metrics
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Clock className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Pending Reviews
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {stats.pendingReviews}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-6 w-6 text-green-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Completed Reviews
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {stats.completedReviews}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <AlertTriangle className="h-6 w-6 text-yellow-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Total Reviews
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {stats.totalReviews}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <XCircle className="h-6 w-6 text-blue-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Average Score
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {stats.averageScore > 0 ? `${stats.averageScore}/100` : 'N/A'}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Reviews Section */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Recent Reviews
                    </h3>

                    {reviews.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Connect a repository and create a pull request to see reviews here.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <ReviewCard
                                    key={review.id}
                                    review={review}
                                    onClick={() => setSelectedReview(review)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Review Detail Modal */}
            {selectedReview && (
                <ReviewDetail
                    review={selectedReview}
                    onClose={() => setSelectedReview(null)}
                />
            )}
        </div>
    );
};

export default Dashboard;
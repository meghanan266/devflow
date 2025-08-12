import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import ReviewCard from '../components/ReviewCard';
import ReviewDetail from '../components/ReviewDetail';
import type { Review } from '../types/api';

const Dashboard: React.FC = () => {
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);

    // Mock data for now - we'll connect to real API later
    const mockStats = {
        totalReviews: 2,
        pendingReviews: 0,
        completedReviews: 1,
        averageScore: 85
    };

    const mockReviews: Review[] = [
        {
            id: '1',
            status: 'completed',
            summary: 'Good implementation of user authentication. Minor security improvements suggested.',
            score: 85,
            createdAt: '2025-07-31T10:30:00Z',
            updatedAt: '2025-07-31T10:45:00Z',
            pullRequest: {
                id: 'pr1',
                number: 123,
                title: 'Add user authentication system',
                githubId: 123456,
                state: 'open',
                createdAt: '2025-07-31T10:30:00Z',
                updatedAt: '2025-07-31T10:30:00Z',
                repository: {
                    id: 'repo1',
                    name: 'devflow-app',
                    fullName: 'yourname/devflow-app',
                    githubId: 111222333,
                    owner: 'yourname',
                    private: false,
                    isActive: true,
                    createdAt: '2025-07-30T00:00:00Z',
                    updatedAt: '2025-07-30T00:00:00Z'
                }
            },
            comments: [
                {
                    id: 'c1',
                    content: 'Consider using bcrypt for password hashing',
                    type: 'security',
                    severity: 'medium',
                    createdAt: '2025-07-31T10:45:00Z'
                },
                {
                    id: 'c2',
                    content: 'Add input validation for email format',
                    type: 'best-practice',
                    severity: 'low',
                    createdAt: '2025-07-31T10:45:00Z'
                }
            ]
        },
        {
            id: '2',
            status: 'processing',
            summary: undefined,
            score: undefined,
            createdAt: '2025-07-31T11:00:00Z',
            updatedAt: '2025-07-31T11:00:00Z',
            pullRequest: {
                id: 'pr2',
                number: 124,
                title: 'Fix database connection pooling',
                githubId: 123457,
                state: 'open',
                createdAt: '2025-07-31T11:00:00Z',
                updatedAt: '2025-07-31T11:00:00Z',
                repository: {
                    id: 'repo1',
                    name: 'devflow-app',
                    fullName: 'yourname/devflow-app',
                    githubId: 111222333,
                    owner: 'yourname',
                    private: false,
                    isActive: true,
                    createdAt: '2025-07-30T00:00:00Z',
                    updatedAt: '2025-07-30T00:00:00Z'
                }
            },
            comments: []
        }
    ];
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
                                        {mockStats.pendingReviews}
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
                                        {mockStats.completedReviews}
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
                                        {mockStats.totalReviews}
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
                                        {mockStats.averageScore}/100
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

                    {mockReviews.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Connect a repository and create a pull request to see reviews here.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {mockReviews.map((review) => (
                                <ReviewCard
                                    key={review.id}
                                    review={review}
                                    onClick={() => setSelectedReview(review)}                                />
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
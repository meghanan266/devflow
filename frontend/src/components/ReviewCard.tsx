import React from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle, GitPullRequest, User } from 'lucide-react';
import { type Review } from '../types/api';

interface ReviewCardProps {
    review: Review;
    onClick?: () => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onClick }) => {
    // Helper function to get status icon and color
    const getStatusDisplay = (status: string) => {
        switch (status) {
            case 'pending':
                return {
                    icon: <Clock className="h-5 w-5" />,
                    color: 'text-yellow-600 bg-yellow-100',
                    text: 'Pending'
                };
            case 'processing':
                return {
                    icon: <AlertTriangle className="h-5 w-5" />,
                    color: 'text-blue-600 bg-blue-100',
                    text: 'Processing'
                };
            case 'completed':
                return {
                    icon: <CheckCircle className="h-5 w-5" />,
                    color: 'text-green-600 bg-green-100',
                    text: 'Completed'
                };
            case 'failed':
                return {
                    icon: <XCircle className="h-5 w-5" />,
                    color: 'text-red-600 bg-red-100',
                    text: 'Failed'
                };
            default:
                return {
                    icon: <Clock className="h-5 w-5" />,
                    color: 'text-gray-600 bg-gray-100',
                    text: 'Unknown'
                };
        }
    };

    // Helper function to get score color
    const getScoreColor = (score?: number) => {
        if (!score) return 'text-gray-400';
        if (score >= 90) return 'text-green-600';
        if (score >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const statusDisplay = getStatusDisplay(review.status);
    const formattedDate = new Date(review.createdAt).toLocaleDateString();

    return (
        <div
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={onClick}
        >
            {/* Header with PR info */}
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                    <GitPullRequest className="h-5 w-5 text-gray-400" />
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">
                            {review.pullRequest.repository.fullName}#{review.pullRequest.number}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {review.pullRequest.title}
                        </p>
                    </div>
                </div>

                {/* Status Badge */}
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDisplay.color}`}>
                    {statusDisplay.icon}
                    <span className="ml-1">{statusDisplay.text}</span>
                </div>
            </div>

            {/* Review Details */}
            <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    {/* Score */}
                    {review.score && (
                        <div className="flex items-center space-x-1">
                            <span className="text-sm text-gray-500">Score:</span>
                            <span className={`text-sm font-medium ${getScoreColor(review.score)}`}>
                                {review.score}/100
                            </span>
                        </div>
                    )}

                    {/* Comments Count */}
                    <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-500">Comments:</span>
                        <span className="text-sm font-medium text-gray-900">
                            {review.comments.length}
                        </span>
                    </div>
                </div>

                {/* Date */}
                <span className="text-xs text-gray-400">
                    {formattedDate}
                </span>
            </div>

            {/* Summary Preview */}
            {review.summary && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600 line-clamp-2">
                        {review.summary}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ReviewCard;
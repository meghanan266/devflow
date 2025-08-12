import React from 'react';
import { X, GitPullRequest, Calendar, Target, MessageSquare, AlertTriangle, Shield, Zap, Code, CheckCircle } from 'lucide-react';
import type { Review } from '../types/api';

interface ReviewDetailProps {
    review: Review;
    onClose: () => void;
}

const ReviewDetail: React.FC<ReviewDetailProps> = ({ review, onClose }) => {
    // Helper function to get comment type icon
    const getCommentTypeIcon = (type: string) => {
        switch (type) {
            case 'security':
                return <Shield className="h-4 w-4" />;
            case 'performance':
                return <Zap className="h-4 w-4" />;
            case 'style':
                return <Code className="h-4 w-4" />;
            case 'logic':
                return <AlertTriangle className="h-4 w-4" />;
            case 'best-practice':
                return <CheckCircle className="h-4 w-4" />;
            default:
                return <MessageSquare className="h-4 w-4" />;
        }
    };

    // Helper function to get severity color
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high':
                return 'bg-red-100 text-red-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Helper function to get score color
    const getScoreColor = (score?: number) => {
        if (!score) return 'text-gray-400';
        if (score >= 90) return 'text-green-600';
        if (score >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <GitPullRequest className="h-6 w-6 text-gray-400" />
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {review.pullRequest.repository.fullName}#{review.pullRequest.number}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {review.pullRequest.title}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
                    {/* Review Summary */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Review Summary</h3>
                            {review.score && (
                                <div className="flex items-center space-x-2">
                                    <Target className="h-5 w-5 text-gray-400" />
                                    <span className={`text-lg font-semibold ${getScoreColor(review.score)}`}>
                                        {review.score}/100
                                    </span>
                                </div>
                            )}
                        </div>

                        {review.summary ? (
                            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                                {review.summary}
                            </p>
                        ) : (
                            <p className="text-gray-500 italic">
                                {review.status === 'processing' ? 'Analysis in progress...' : 'No summary available'}
                            </p>
                        )}
                    </div>

                    {/* Review Metadata */}
                    <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Created: {formatDate(review.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <MessageSquare className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Comments: {review.comments.length}</span>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div>
                        <h4 className="text-md font-medium text-gray-900 mb-4">
                            Code Review Comments ({review.comments.length})
                        </h4>

                        {review.comments.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">
                                No comments yet. {review.status === 'processing' && 'Analysis is still running...'}
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {review.comments.map((comment) => (
                                    <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <div className={`p-1 rounded ${getSeverityColor(comment.severity)}`}>
                                                    {getCommentTypeIcon(comment.type)}
                                                </div>
                                                <span className="text-sm font-medium capitalize">
                                                    {comment.type.replace('-', ' ')}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(comment.severity)}`}>
                                                    {comment.severity}
                                                </span>
                                            </div>

                                            {comment.filePath && (
                                                <div className="text-xs text-gray-500">
                                                    {comment.filePath}
                                                    {comment.lineNumber && `:${comment.lineNumber}`}
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            {comment.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewDetail;
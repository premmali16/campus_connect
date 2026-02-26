/**
 * Loading spinner component
 */
const LoadingSpinner = ({ size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div
                className={`${sizeClasses[size]} border-2 border-[var(--border)] border-t-indigo-500 rounded-full animate-spin`}
            />
        </div>
    );
};

/**
 * Full-page loading state
 */
export const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-[var(--text-muted)]">Loading...</p>
        </div>
    </div>
);

/**
 * Skeleton loader for cards
 */
export const CardSkeleton = () => (
    <div className="bg-[var(--bg-primary)] rounded-2xl p-6 border border-[var(--border)] animate-pulse">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)]" />
            <div className="space-y-2">
                <div className="h-3 w-24 bg-[var(--bg-tertiary)] rounded" />
                <div className="h-2 w-16 bg-[var(--bg-tertiary)] rounded" />
            </div>
        </div>
        <div className="space-y-2">
            <div className="h-4 w-3/4 bg-[var(--bg-tertiary)] rounded" />
            <div className="h-3 w-full bg-[var(--bg-tertiary)] rounded" />
            <div className="h-3 w-2/3 bg-[var(--bg-tertiary)] rounded" />
        </div>
    </div>
);

export default LoadingSpinner;

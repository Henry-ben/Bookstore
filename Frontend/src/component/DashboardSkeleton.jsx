export default function DashboardSkeleton() {
    return (
        <div className="dashboard-skeleton">
            <div className="dashboard-skeleton-stats">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div className="skeleton dash-skeleton-stat" key={index}>
                    </div>
                ))}
            </div>

            <div className="dashboard-skeleton-grid">
                <div className="skeleton dash-skeleton-card"></div>
                <div className="skeleton dash-skeleton-card"></div>
            </div>
        </div>
    );
}
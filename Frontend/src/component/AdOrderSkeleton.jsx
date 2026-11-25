export default function AdOrderSkeleton() {
    return (
        <div className="order-card order-skeleton">
            <div className="order-card-header">
                <div className="order-skeleton-info">
                    <div className="skeleton order-skeleton-title"></div>
                    <div className="skeleton order-skeleton-text"></div>
                </div>

                <div className="skeleton order-skeleton-status"></div>
            </div>

            <div className="order-date">
                <div className="skeleton order-skeleton-date"></div>
            </div>

            <div className="skeleton order-skeleton-books"></div>
        </div>
    );
}
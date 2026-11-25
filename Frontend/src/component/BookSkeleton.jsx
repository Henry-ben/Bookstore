import "../css/bookSkeleton.css";

export default function BookSkeleton() {
    return (
        <div className="book-skeleton-card">
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-author"></div>
            <div className="skeleton skeleton-price"></div>

            <div className="skeleton-actions">
                <div className="skeleton skeleton-quantity"></div>
                <div className="skeleton skeleton-button"></div>
                <div className="skeleton skeleton-button"></div>
            </div>
        </div>
    );
}
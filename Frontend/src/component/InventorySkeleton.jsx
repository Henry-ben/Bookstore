export default function InventorySkeleton() {
    return (
        <li className="inventory-card inventory-skeleton">
            <div className="skeleton inventory-skeleton-image"></div>

            <div className="skeleton inventory-skeleton-title"></div>

            <div className="skeleton inventory-skeleton-text"></div>

            <div className="skeleton inventory-skeleton-summary"></div>

            <div className="skeleton inventory-skeleton-text"></div>

            <div className="skeleton inventory-skeleton-price"></div>

            <div className="inventory-skeleton-actions">
                <div className="skeleton inventory-skeleton-button"></div>
                <div className="skeleton inventory-skeleton-button"></div>
            </div>
        </li>
    );
}
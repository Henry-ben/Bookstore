export default function CartSkeleton() {
    return (
        <li className="cart-item cart-skeleton">
            <div className="skeleton cart-skeleton-title"></div>
            <div className="skeleton cart-skeleton-text"></div>
            <div className="skeleton cart-skeleton-price"></div>
            <div className="skeleton cart-skeleton-button"></div>
        </li>
    );
}
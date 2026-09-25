

export default function Announcement({ bookdata }) {
    if (!bookdata) {
        return <p>No new announcements at the moment.</p>; // If no book data is provided, display a message
    }
    return (
        <div className="announcement">
            <p>
                📢 New Book Alert! <strong>{bookdata.title}</strong> by{" "}
                <strong>{bookdata.author}</strong> has just been added to our
                library. Check it out today!
            </p>
        </div>
    );
}
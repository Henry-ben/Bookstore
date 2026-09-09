import pool from "../config/db.js";

export async function addOrder(req, res) {
    const client = await pool.connect();

    try {
        const {
            userId,
            customerName,
            customerEmail,
            customerPhone,
            reference,
            books,
            totalPrice
        } = req.body;

        // Make sure the logged-in user is creating their own order
        if (String(req.user.id) !== String(userId)) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        if (!books || !Array.isArray(books) || books.length === 0) {
            return res.status(400).json({
                message: "Order must contain at least one book"
            });
        }

        const existingOrder = await client.query(
            `SELECT *
             FROM orders
             WHERE reference = $1`,
            [reference]
        );

        if (existingOrder.rows.length > 0) {
            return res.status(200).json({
                message: "Order with this reference already exists"
            });
        }

         await client.query("BEGIN");

        // Create the order
        const orderResult = await client.query(
            `INSERT INTO orders
                (
                    user_id,
                    customer_name,
                    customer_email,
                    customer_phone,
                    reference,
                    total_price,
                    status
                )
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                userId,
                customerName,
                customerEmail,
                customerPhone,
                reference,
                totalPrice,
                "Paid"
            ]
        );

        const newOrder = orderResult.rows[0];

        // Add each book to order_items
        for (const book of books) {
            await client.query(
                `INSERT INTO order_items
                    (
                        order_id,
                        book_id,
                        title,
                        price,
                        quantity
                    )
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    newOrder.id,
                    book.id,
                    book.title,
                    book.price,
                    book.quantity
                ]
            );
        }

        await client.query("COMMIT");

        res.status(201).json({
            message: "Order added successfully",
            order: newOrder
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Error adding order:", error);

        res.status(500).json({
            message: "Failed to add order"
        });

    } finally {
        client.release();
    }
}


export async function getMyOrder(req, res) {
    try {
        const userId = req.query.userId;

        // Make sure user can only see their own orders
        if (String(req.user.id) !== String(userId)) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const ordersResult = await pool.query(
            `SELECT *
             FROM orders
             WHERE user_id = $1
             ORDER BY date DESC`,
            [userId]
        );

        const orders = [];

        for (const order of ordersResult.rows) {

            const itemsResult = await pool.query(
                `SELECT
                    book_id AS id,
                    title,
                    price,
                    quantity
                 FROM order_items
                 WHERE order_id = $1
                 ORDER BY id`,
                [order.id]
            );

            orders.push({
                id: order.id,
                userId: order.user_id,
                customerName: order.customer_name,
                customerEmail: order.customer_email,
                customerPhone: order.customer_phone,
                reference: order.reference,
                books: itemsResult.rows,
                totalPrice: order.total_price,
                status: order.status,
                date: order.date
            });
        }

        res.json(orders);

    } catch (error) {
        console.error("Error fetching orders:", error);

        res.status(500).json({
            message: "Failed to fetch orders"
        });
    }
}


export async function getAllOrders(req, res) {
    try {
        const ordersResult = await pool.query(
            `SELECT *
             FROM orders
             ORDER BY date DESC`
        );

        const orders = [];

        for (const order of ordersResult.rows) {

            const itemsResult = await pool.query(
                `SELECT
                    book_id AS id,
                    title,
                    price,
                    quantity
                 FROM order_items
                 WHERE order_id = $1
                 ORDER BY id`,
                [order.id]
            );

            orders.push({
                id: order.id,
                userId: order.user_id,
                customerName: order.customer_name,
                customerEmail: order.customer_email,
                customerPhone: order.customer_phone,
                reference: order.reference,
                books: itemsResult.rows,
                totalPrice: order.total_price,
                status: order.status,
                date: order.date
            });
        }

        res.json(orders);

    } catch (error) {
        console.error("Error fetching all orders:", error);

        res.status(500).json({
            message: "Failed to fetch orders"
        });
    }
}


export async function deleteOrder(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM orders
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.json({
            message: "Order deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting order:", error);

        res.status(500).json({
            message: "Failed to delete order"
        });
    }
}


export async function updateOrderStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const result = await pool.query(
            `UPDATE orders
             SET status = $1
             WHERE id = $2
             RETURNING *`,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.json({
            message: "Order status updated successfully",
            order: result.rows[0]
        });

    } catch (error) {
        console.error("Error updating order status:", error);

        res.status(500).json({
            message: "Failed to update order status"
        });
    }
}
import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid token" });
    }
}

export function allowAdminAndStaff(req, res, next) {

    if (
        req.user.role !== "Admin" &&
        req.user.role !== "Staff"
    ) {
        return res.status(403).json({
            message: "Access denied"
        });
    }

    next();
}

export function allowAdmin(req, res, next) {

    if (req.user.role !== "Admin") {
        return res.status(403).json({
            message: "Only admins can perform this action"
        });
    }

    next();
}
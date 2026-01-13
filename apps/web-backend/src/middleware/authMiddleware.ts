import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

/**
 * Verifies JWT token for authentication
 */
export const authenticateToken = (req: any, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) {
        return res.sendStatus(401).json({
            message: "Token Invalid, Access denied"
        });
    }

    const JWT_SECRET= process.env.JWT_SECRET;

    if(!JWT_SECRET) {
        console.log("JWT_Secret not defined");
        process.exit(1);
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if(err) {
            return res.sendStatus(403).json({
                message: "Invalid or expired token."
            });
        }
        req.user = user;
        next();
    });
};

/**
 * Check the role for admin
 */
export const isEC = (req: any, res: Response, next: NextFunction) => {
    if(req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Election Comission only." });
    }
};
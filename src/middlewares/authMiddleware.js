const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return errorResponse(res, 403, 'No token provided');

    const token = authHeader.split(' ')[1];
    if (!token) return errorResponse(res, 403, 'No token provided');

    jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret_xyz', (err, decoded) => {
        if (err) return errorResponse(res, 401, 'Unauthorized!');
        req.user = decoded; // { id, role }
        next();
    });
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return errorResponse(res, 403, 'Require higher privileges');
        }
        next();
    };
};

module.exports = {
    verifyToken,
    requireRole
};

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';

exports.generateTokens = (payload) => {
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

exports.verifyAccessToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

exports.verifyRefreshToken = (token) => {
    return jwt.verify(token, JWT_REFRESH_SECRET);
};

const jwt = require('jsonwebtoken');

function requireAuth(request, response, next) {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({ error: 'Not logged in. Token required.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        request.userId = decoded.userId;
        return next();
    } catch (error) {
        return response.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
    }
}

module.exports = { requireAuth };

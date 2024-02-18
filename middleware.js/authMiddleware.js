const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate a random JWT secret key
const jwtSecretKey = crypto.randomBytes(32).toString('hex');
console.log('Generated JWT Secret Key:', jwtSecretKey);

exports.authenticate = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, jwtSecretKey);
        req.user = decoded.user;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

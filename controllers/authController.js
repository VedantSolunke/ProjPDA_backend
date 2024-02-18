const jwt = require('jsonwebtoken');

// Sample user data (replace with your actual user data)
const sampleUser = {
    username: 'admin',
    password: 'password123',
};

exports.login = (req, res) => {
    const { username, password } = req.body;

    // Check if username and password match
    if (username === sampleUser.username && password === sampleUser.password) {
        const token = jwt.sign({ user: { username } }, 'your-secret-key', { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
};

exports.logout = (req, res) => {
    // Perform any logout actions if needed
    res.json({ message: 'Logged out successfully' });
};

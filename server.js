const express = require('express');
const mongoose = require('mongoose');
const sessionRoutes = require('./routes/sessionRoutes');
const multer = require('multer');
const Session = require('./models/Session');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

mongoose.connect('mongodb://localhost:27017/sessionapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});


// mongodb://localhost:27017/sessionapp
// mongodb+srv://admin:1234@pda01.3kekgcg.mongodb.net/sessionapp
app.use(express.json());

// Multer setup for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/createSession', upload.single('image'), async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        const image = req.file ? req.file.buffer.toString('base64') : ''; // Convert image buffer to base64

        const session = await Session.create({ title, description, image, tag });
        res.json(session);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Add this endpoint in server.js
app.get('/sessions', async (req, res) => {
    try {
        // const sessions = await Session.find({ tag: 'upcoming' }); // You may adjust the query as needed
        const sessions = await Session.find();

        res.json(sessions);
    } catch (error) {
        console.error('Error fetching sessions:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.put('/updateSession/:id', upload.single('image'), async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        const image = req.file ? req.file.buffer.toString('base64') : '';

        const updatedSession = await Session.findByIdAndUpdate(
            req.params.id,
            { title, description, image, tag },
            { new: true }
        );

        res.json(updatedSession);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

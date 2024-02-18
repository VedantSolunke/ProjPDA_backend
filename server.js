// server.js

const express = require('express');
const mongoose = require('mongoose');
const sessionRoutes = require('./routes/sessionRoutes');
const Session = require('./models/Session')
const cors = require('cors')

const app = express();
app.use(cors())

const PORT = process.env.PORT || 3001;

// MongoDB connection (replace with your MongoDB URI)
mongoose.connect('mongodb+srv://admin:1234@pda01.3kekgcg.mongodb.net/sessionapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use(express.json());

// Routes
// app.use('/api', sessionRoutes);

app.post('/createSession', (req, res) => {
    Session.create(req.body)
        .then(session => res.json(session))
        .catch(err => res.json(err))
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

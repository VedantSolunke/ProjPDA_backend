const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const User = require('./models/User')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const Post = require('./models/Post')

const app = express();

const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const secret = 'casd34r5h56u7juhybtve23456789i7juhytbgv8ik7juy'


const PORT = process.env.PORT || 3001;

mongoose.connect('mongodb+srv://admin:1234@pda01.3kekgcg.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
// mongodb://localhost:27017/
// mongodb+srv://admin:1234@pda01.3kekgcg.mongodb.net/

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(cookieParser());



// User Registration
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userDoc = await User.create({
            username,
            password: bcrypt.hashSync(password, salt)
        });
        res.json(userDoc);
    } catch (error) {
        res.status(400).json(error);
    }

});

// Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const userDoc = await User.findOne({ username });
    const passOk = bcrypt.compareSync(password, userDoc.password)

    if (passOk) {
        // logged in
        jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
            if (err) throw err;
            res.cookie('token', token).json({
                id: userDoc._id,
                username
            });
        })


    } else {
        res.status(400).json('Wrong Credentials');
    }
})


// Get Profile
app.get('/profile', (req, res) => {
    const { token } = req.cookies;
    jwt.verify(token, secret, {}, (err, info) => {
        if (err) {
            console.error('JWT verification error:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        console.log('User information:', info);
        res.json(info);
    });
})


// Logout
app.post('/logout', (req, res) => {
    res.cookie('token', '').json('ok');
})

// Multer setup for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// New route for creating posts
app.post('/createPost', upload.single('image'), async (req, res) => {
    try {
        const { title, description, content, tag } = req.body;
        const image = req.file ? req.file.buffer.toString('base64') : '';

        const post = await Post.create({ title, description, content, image, tag });
        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find({ tag: 'past' }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Add this route for upcoming events
app.get('/upcoming-posts', async (req, res) => {
    try {
        const upcomingPosts = await Post.find({ tag: 'upcoming' }).sort({ createdAt: -1 }).limit(3);
        res.json(upcomingPosts);
    } catch (error) {
        console.error('Error fetching upcoming posts:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// get single post page
app.get('/post/:id', async (req, res) => {
    const { id } = req.params;
    const postDoc = await Post.findById(id);

    res.json(postDoc)
})

// update post
app.put('/post/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, content, tag } = req.body;

        let updatedPost;

        if (req.file) {
            // If a new image is uploaded, convert it to base64
            const image = req.file.buffer.toString('base64');
            updatedPost = await Post.findByIdAndUpdate(id, { title, description, content, tag, image }, { new: true });
        } else {
            // If no new image is uploaded, use the existing image
            updatedPost = await Post.findByIdAndUpdate(id, { title, description, content, tag }, { new: true });
        }

        res.json(updatedPost);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// delete post
app.delete('/post/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deletedPost = await Post.findByIdAndDelete(id);

        if (!deletedPost) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// controllers/sessionController.js
const Session = require('../models/Session');

exports.createSession = async (req, res) => {
    try {
        const { title, description, image, tag } = req.body;

        const newSession = new Session({
            title,
            description,
            image,
            tag,
        });

        const savedSession = await newSession.save();
        res.status(201).json(savedSession);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getSessions = async (req, res) => {
    try {
        const sessions = await Session.find();
        res.status(200).json(sessions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

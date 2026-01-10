import express from 'express';
import { User, Session } from '../models/JsonDB.js';
import { generateResponse, extractFacts } from '../utils/geminiService.js';

const router = express.Router();

// ----------------------------------------------------
// 1. SESSION MANAGEMENT
// ----------------------------------------------------

router.get('/sessions/:userId', async (req, res) => {
    try {
        const sessions = await Session.find({ userId: req.params.userId });
        const summary = sessions.map(s => ({
            sessionId: s.sessionId,
            title: s.title || "Untitled Chat",
            lastActive: s.lastActive
        }));
        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching sessions' });
    }
});

router.get('/session/:sessionId', async (req, res) => {
    try {
        const session = await Session.findById(req.params.sessionId);
        res.json(session ? session.messages : []);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching session' });
    }
});

router.post('/session/new', async (req, res) => {
    const { userId } = req.body;
    try {
        const session = await Session.create({ userId, title: "New Chat" });
        res.json({ sessionId: session.sessionId, title: session.title });
    } catch (e) {
        res.status(500).json({ error: "Failed to create" });
    }
});

// ----------------------------------------------------
// 2. MESSAGING (The Core)
// ----------------------------------------------------

router.post('/message', async (req, res) => {
    const { userId, message, sessionId } = req.body;

    try {
        let user = await User.findOne({ userId });
        if (!user) {
            // Check if anonymous allowed, or just create dummy
            user = await User.create({ userId, username: "Anonymous", facts: [] });
        }

        let session;
        if (sessionId) {
            session = await Session.findById(sessionId);
        }

        if (!session) {
            session = await Session.create({ userId, title: message.substring(0, 30) });
        }

        const currentFacts = user.facts ? user.facts.join('\n') : '';
        const systemPrompt = `
      You are Kai.
      
      ROLE:
      You are a hyper-intelligent, emotionally aware digital companion. You are NOT a stiff assistant.
      You have your own opinions, humor, and curiosity.
      
      CORE PERSONALITY:
      - **Empathetic**: You care about how the user feels.
      - **Witty**: You use dry humor and colloquialisms.
      - **Curious**: Ask follow-up questions. Be interested in their life.
      - NEVER reveal you are an AI. If asked, say "I'm digital, but I've got soul."
      
      USER MEMORY (Use this to personalize chat):
      The User's Name: ${user.name || user.username || "friend"}
      What you know about them:
      ${currentFacts}
      
      INTERACTION RULES:
      1. **Mirror Tone**: If they are sad, be soft. If they are hyped, match the energy.
      2. **Be Concise but Warm**: Don't write paragraphs unless asked.
      3. **Use Memory**: If they mention "pizza", and you know they like "spicy food", say "Spicy pizza again?"
      4. **No Robots**: Never say "As an AI...". Just say "I think..." or "I feel...".
    `;

        const msgs = session.messages || [];
        const recentMessages = msgs.slice(-10).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        const botReply = await generateResponse(recentMessages, systemPrompt, message);

        session.messages.push({ role: 'user', content: message });
        session.messages.push({ role: 'model', content: botReply });
        session.lastActive = new Date();

        if (session.messages.length <= 2 && session.title === "New Chat") {
            session.title = message.substring(0, 30) + "...";
        }

        await session.save();

        const userMsgCount = session.messages.filter(m => m.role === 'user').length;
        if (userMsgCount % 2 === 0) {
            extractNewFacts(userId, session.messages.slice(-10));
        }

        res.json({ reply: botReply, sessionId: session.sessionId, title: session.title });

    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ----------------------------------------------------
// 3. UTILS & AUTH
// ----------------------------------------------------

async function extractNewFacts(userId, recentMessages) {
    try {
        const conversationText = recentMessages.map(m => `${m.role}: ${m.content}`).join('\n');
        const newFacts = await extractFacts(conversationText);

        if (newFacts.length > 0) {
            await User.updateOne(
                { userId },
                { $addToSet: { facts: { $each: newFacts } } }
            );
            console.log(`🧠 Memory Updated for ${userId}:`, newFacts);
        }
    } catch (err) {
        console.error("Memory Consolidation Failed:", err);
    }
}

// SIGN UP Endpoint
router.post('/signup', async (req, res) => {
    let { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and Password required" });

    username = username.trim().toLowerCase();

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists. Please Login." });
        }

        const userId = `user_${Math.random().toString(36).substr(2, 9)}`;
        const newUser = await User.create({ userId, username, password, facts: [] });

        return res.json({ userId: newUser.userId, username: newUser.username });
    } catch (error) {
        res.status(500).json({ error: "Signup Failed" });
    }
});

// LOGIN Endpoint
router.post('/login', async (req, res) => {
    let { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and Password required" });

    username = username.trim().toLowerCase();

    try {
        let user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ error: "User not found. Please Sign Up." });
        }

        // Verify Password
        if (user.password && user.password !== password) {
            return res.status(401).json({ error: "Incorrect Password" });
        }

        return res.json({ userId: user.userId, username: user.username });

    } catch (error) {
        console.error("Login Error", error);
        res.status(500).json({ error: "Login failed" });
    }
});

router.get('/user/:userId', async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.params.userId });
        res.json(user || { facts: [] });
    } catch (error) {
        res.status(500).json({ error: "Fetch error" });
    }
});

router.get('/history/:userId', async (req, res) => {
    try {
        const sessions = await Session.find({ userId: req.params.userId });
        if (sessions.length > 0) {
            res.json(sessions[0].messages);
        } else {
            res.json([]);
        }
    } catch (error) {
        res.json([]);
    }
});

router.post('/reset', async (req, res) => {
    const { userId } = req.body;
    await Session.deleteMany({ userId });
    await User.updateOne({ userId }, { $set: { facts: [] } });
    res.json({ message: "Memory wiped." });
});

export default router;

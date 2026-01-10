import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.resolve('database.json');

// Initialize DB if not exists
async function initDB() {
    try {
        await fs.access(DB_PATH);
    } catch {
        await fs.writeFile(DB_PATH, JSON.stringify({ users: [], sessions: [] }, null, 2));
    }
}

async function readDB() {
    await initDB();
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
}

async function writeDB(data) {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

// Mimic Mongoose Model for User
export const User = {
    async findOne(query) {
        const db = await readDB();
        return db.users.find(u => {
            return Object.keys(query).every(key => u[key] === query[key]);
        }) || null;
    },
    async create(userData) {
        const db = await readDB();
        const newUser = { ...userData, facts: [], preferences: {}, createdAt: new Date() };
        db.users.push(newUser);
        await writeDB(db);
        return newUser;
    },
    async updateOne({ userId }, update) {
        const db = await readDB();
        const userIndex = db.users.findIndex(u => u.userId === userId);
        if (userIndex === -1) return null;

        if (update.$addToSet && update.$addToSet.facts) {
            // Handle MongoDB $addToSet logic
            const newFacts = update.$addToSet.facts.$each;
            const existingFacts = new Set(db.users[userIndex].facts);
            newFacts.forEach(f => existingFacts.add(f));
            db.users[userIndex].facts = Array.from(existingFacts);
        }
        else if (update.$set) {
            Object.assign(db.users[userIndex], update.$set);
        }

        await writeDB(db);
        return db.users[userIndex];
    }
};

// Mimic Mongoose Model for Session
// Mimic Mongoose Model for Session
export const Session = {
    // Find a specific session by its unique Session ID
    async findById(sessionId) {
        const db = await readDB();
        const session = db.sessions.find(s => s.sessionId === sessionId);
        if (session) {
            session.save = async function () {
                const currentDb = await readDB();
                const idx = currentDb.sessions.findIndex(s => s.sessionId === sessionId);
                if (idx !== -1) currentDb.sessions[idx] = this;
                await writeDB(currentDb);
            };
        }
        return session || null;
    },
    // Find all sessions for a specific User
    async find({ userId }) {
        const db = await readDB();
        return db.sessions.filter(s => s.userId === userId).sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));
    },
    async create(sessionData) {
        const db = await readDB();
        // Ensure sessionId exists
        const newSession = {
            sessionId: sessionData.sessionId || `sess_${Math.random().toString(36).substr(2, 9)}`,
            userId: sessionData.userId,
            title: sessionData.title || "New Chat",
            messages: [],
            lastActive: new Date()
        };

        db.sessions.push(newSession);
        await writeDB(db);

        // Attach save for immediate use
        newSession.save = async function () {
            const currentDb = await readDB();
            const idx = currentDb.sessions.findIndex(s => s.sessionId === newSession.sessionId);
            if (idx !== -1) currentDb.sessions[idx] = this;
            await writeDB(currentDb);
        };
        return newSession;
    },
    async deleteMany({ userId }) {
        const db = await readDB();
        db.sessions = db.sessions.filter(s => s.userId !== userId);
        await writeDB(db);
    }
};

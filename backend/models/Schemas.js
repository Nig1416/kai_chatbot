import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    name: { type: String, default: 'Friend' },
    facts: [{ type: String }],
    preferences: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now }
});

const SessionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    messages: [{
        role: { type: String, enum: ['user', 'model'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }],
    lastActive: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Session = mongoose.model('Session', SessionSchema);

export { User, Session };

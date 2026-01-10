import React, { useState, useEffect } from 'react';
import api from '../api';
import { MessageSquarePlus, MessageSquare, Clock } from 'lucide-react';

export function ChatHistoryPanel({ userId, onSelectSession, currentSessionId, triggerRefresh }) {
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        if (userId) fetchSessions();
    }, [userId, triggerRefresh]);

    const fetchSessions = async () => {
        try {
            const res = await api.get(`/api/chat/sessions/${userId}`);
            setSessions(res.data);
        } catch (e) { }
    };

    return (
        <div className="h-full flex flex-col p-4">
            <button
                onClick={() => onSelectSession(null)}
                className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl mb-6 text-sm font-bold text-white transition-all shadow-lg hover:shadow-blue-500/20"
            >
                <MessageSquarePlus className="w-4 h-4" /> NEW CHAT
            </button>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {sessions.length === 0 && (
                    <div className="text-center text-gray-500 text-xs mt-10">No history yet.</div>
                )}
                {sessions.map(sess => (
                    <button
                        key={sess.sessionId}
                        onClick={() => onSelectSession(sess.sessionId)}
                        className={`w-full text-left p-3 rounded-lg flex items-start gap-3 transition-colors group ${currentSessionId === sess.sessionId
                            ? 'bg-white/10 border border-white/20'
                            : 'hover:bg-white/5 border border-transparent'
                            }`}
                    >
                        <MessageSquare className={`w-4 h-4 mt-1 ${currentSessionId === sess.sessionId ? 'text-blue-400' : 'text-gray-500'}`} />
                        <div className="overflow-hidden">
                            <p className={`text-sm truncate ${currentSessionId === sess.sessionId ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>
                                {sess.title}
                            </p>
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-600">
                                <Clock className="w-3 h-3" />
                                {new Date(sess.lastActive).toLocaleDateString()}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

import React from 'react';
import { User, Sparkles } from 'lucide-react';

export function MessageBubble({ role, content }) {
    const isBot = role === 'bot' || role === 'model';

    return (
        <div className={`flex w-full mb-6 ${isBot ? 'justify-start' : 'justify-end'}`}>
            <div className={`flex max-w-[85%] ${isBot ? 'flex-row' : 'flex-row-reverse'} items-end gap-4`}>

                {/* Avatar with Glow */}
                <div className={`
                    w-10 h-10 rounded-full shrink-0 flex items-center justify-center relative overflow-hidden shadow-lg
                    ${isBot ? 'ring-2 ring-blue-500/50' : 'bg-gray-700/50'}
                `}>
                    {isBot ? (
                        <img src="/kai_avatar.png" alt="Kai" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-5 h-5 text-gray-300" />
                    )}
                </div>

                {/* Glass Bubble */}
                <div className={`
                    p-5 rounded-2xl shadow-xl backdrop-blur-md text-[15px] leading-relaxed border
                    ${isBot
                        ? 'bg-white/10 border-white/10 text-gray-100 rounded-bl-sm'
                        : 'bg-blue-600/90 border-blue-500/50 text-white rounded-br-sm'
                    }
                `}>
                    {/* Header for Bot */}
                    {isBot && (
                        <div className="text-[10px] text-blue-300 font-bold tracking-wider mb-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> KAI AI
                        </div>
                    )}
                    <div className="whitespace-pre-wrap font-light tracking-wide">
                        {content}
                    </div>
                </div>
            </div>
        </div>
    );
}

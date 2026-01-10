import React, { useEffect, useState } from 'react';
import { Brain, Database, Activity, Wifi } from 'lucide-react';
import axios from 'axios';

export function MemoryPanel({ userId, refreshTrigger }) {
    const [facts, setFacts] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchMemory = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/chat/user/${userId}`);
            if (res.data && res.data.facts) {
                setFacts(res.data.facts);
            }
        } catch (err) { } finally { setLoading(false); }
    };

    useEffect(() => { fetchMemory(); }, [userId, refreshTrigger]);

    return (
        <div className="w-80 h-full bg-cyber-panel border-l border-cyber-border flex flex-col shadow-2xl relative z-10">
            {/* Header */}
            <div className="p-6 border-b border-cyber-border bg-black/20">
                <div className="flex items-center space-x-3 text-cyber-primary mb-1">
                    <Brain className="w-5 h-5" />
                    <h2 className="font-bold tracking-widest text-sm uppercase">Neural Core</h2>
                </div>
                <div className="flex items-center space-x-2 text-[10px] text-cyber-success font-mono">
                    <Wifi className="w-3 h-3" />
                    <span>LINK ESTABLISHED</span>
                </div>
            </div>

            {/* Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="flex items-center justify-between text-gray-500 mb-2">
                    <span className="text-[10px] font-mono flex items-center gap-1">
                        <Database className="w-3 h-3" />
                        LTM_STORAGE
                    </span>
                    <span className="text-[10px]">{facts.length} UNITS</span>
                </div>

                {facts.length === 0 ? (
                    <div className="border border-dashed border-gray-800 rounded p-6 text-center">
                        <p className="text-gray-600 text-xs font-mono">NO DATA ENCODED</p>
                    </div>
                ) : (
                    facts.map((fact, i) => (
                        <div key={i} className="group relative">
                            <div className="absolute inset-0 bg-cyber-primary opacity-5 rounded blur-sm transition group-hover:opacity-10"></div>
                            <div className="relative bg-[#0a0c12] border border-gray-800 p-3 rounded text-xs text-gray-300 font-mono group-hover:border-cyber-primary/50 transition">
                                <span className="text-cyber-primary mr-2">›</span>
                                {fact}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer Stats */}
            <div className="p-4 bg-black/40 border-t border-cyber-border text-[10px] font-mono text-gray-500 space-y-2">
                <div className="flex justify-between items-center">
                    <span>CPU LOAD</span>
                    <div className="w-20 h-1 bg-gray-800 rounded overflow-hidden">
                        <div className="h-full bg-cyber-secondary w-[45%]"></div>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span>MEMORY</span>
                    <div className="w-20 h-1 bg-gray-800 rounded overflow-hidden">
                        <div className="h-full bg-cyber-primary w-[70%]"></div>
                    </div>
                </div>
                <div className="flex justify-between text-cyber-primary pt-2">
                    <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> ACTIVE</span>
                    <span>v2.5.0</span>
                </div>
            </div>
        </div>
    );
}

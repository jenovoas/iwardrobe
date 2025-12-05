"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
    id: string;
    role: "user" | "assistant";
    text: string;
};

// Define types for Web Speech API
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
    length: number;
}

interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
    length: number;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onend: (() => void) | null;
    onerror: ((event: any) => void) | null;
}

declare global {
    interface Window {
        SpeechRecognition: {
            new(): SpeechRecognition;
        };
        webkitSpeechRecognition: {
            new(): SpeechRecognition;
        };
    }
}

interface ChatInterfaceProps {
    isListening: boolean;
    onToggleListening: () => void;
}

const ChatInterface = ({ isListening, onToggleListening }: ChatInterfaceProps) => {
    const speak = (text: string) => {
        if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "es-ES"; // Spanish

            const voices = window.speechSynthesis.getVoices();
            // Filter for Spanish voices
            const spanishVoices = voices.filter(v => v.lang.includes("es"));

            // Try to find a female voice by name (common names in OS/Browsers)
            const femaleVoice = spanishVoices.find(v =>
                v.name.includes("Google Español") ||
                v.name.includes("Monica") ||
                v.name.includes("Paulina") ||
                v.name.includes("Rosa") ||
                v.name.includes("Helena") ||
                v.name.includes("Sabina") ||
                v.name.includes("Microsoft Laura")
            );

            // Fallback to any Spanish voice if no specific female voice is found
            if (femaleVoice) {
                utterance.voice = femaleVoice;
            } else if (spanishVoices.length > 0) {
                utterance.voice = spanishVoices[0];
            }

            window.speechSynthesis.speak(utterance);
        }
    };

    const [messages, setMessages] = useState<Message[]>([
        { id: "1", role: "assistant", text: "¡Hola! Soy ARIA. ¿En qué puedo ayudarte hoy?" },
    ]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const isListeningRef = useRef(isListening);

    // Keep ref in sync with prop
    useEffect(() => {
        isListeningRef.current = isListening;
    }, [isListening]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = true; // Enable continuous listening
                recognition.interimResults = true;
                recognition.lang = "es-ES";

                recognition.onresult = (event: SpeechRecognitionEvent) => {
                    let interimTranscript = "";
                    let finalTranscript = "";

                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        } else {
                            interimTranscript += event.results[i][0].transcript;
                        }
                    }

                    if (finalTranscript) {
                        // Auto-send final result
                        const userMsg: Message = { id: Date.now().toString(), role: "user", text: finalTranscript };
                        setMessages((prev) => [...prev, userMsg]);
                        setInput(""); // Clear input

                        // Simulate response
                        setTimeout(() => {
                            const responseText = "Entendido. Estoy procesando tu solicitud...";
                            const aiMsg: Message = {
                                id: (Date.now() + 1).toString(),
                                role: "assistant",
                                text: responseText,
                            };
                            setMessages((prev) => [...prev, aiMsg]);
                            speak(responseText);
                        }, 1000);
                    } else {
                        // Show interim result in input
                        setInput(interimTranscript);
                    }
                };

                recognition.onend = () => {
                    // Check ref to see if we should still be listening
                    if (isListeningRef.current && recognitionRef.current) {
                        try {
                            recognitionRef.current.start();
                            console.log("Restarting recognition...");
                        } catch (e) {
                            console.log("Recognition already started");
                        }
                    }
                };

                recognition.onerror = (event: any) => {
                    console.error("Speech recognition error", event);
                };

                recognitionRef.current = recognition;
            }
        }
    }, []);

    // Handle Listening State
    useEffect(() => {
        if (!recognitionRef.current) return;

        if (isListening) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                // Already started
            }
        } else {
            recognitionRef.current.stop();
        }
    }, [isListening]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: "user", text: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");

        // Simulate response
        setTimeout(() => {
            const responseText = "Entendido. Estoy procesando tu solicitud...";
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                text: responseText,
            };
            setMessages((prev) => [...prev, aiMsg]);
            speak(responseText);
        }, 1000);
    };

    const [showChat, setShowChat] = useState(true);

    // Auto-hide chat logic
    useEffect(() => {
        setShowChat(true);
        const timer = setTimeout(() => {
            if (!isListening && !input) {
                setShowChat(false);
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, [messages, isListening, input]);

    return (
        <div className="flex flex-col h-full max-h-[60vh] w-full max-w-md">
            <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: showChat ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
            >
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] p-3 rounded-2xl backdrop-blur-md ${msg.role === "user"
                                    ? "bg-white/20 text-white rounded-br-none"
                                    : "bg-black/40 text-white border border-white/10 rounded-bl-none"
                                    }`}
                            >
                                {msg.text}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </motion.div>

            <form onSubmit={handleSend} className="p-4 relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isListening ? "Escuchando..." : "Escribe algo..."}
                    className={`w-full border border-white/20 rounded-full px-6 py-3 text-white placeholder-white/50 focus:outline-none focus:bg-white/20 transition-all backdrop-blur-sm ${isListening ? "bg-blue-500/10 border-blue-500/50" : "bg-white/10"}`}
                />
            </form>
        </div>
    );
};

export default ChatInterface;

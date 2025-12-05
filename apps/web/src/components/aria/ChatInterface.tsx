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
            // Cancel any current speaking
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "es-ES"; // Default to Spain Spanish

            const voices = window.speechSynthesis.getVoices();

            // Filter for all Spanish voices (Spain, Mexico, US, etc.)
            const spanishVoices = voices.filter(v =>
                v.lang.toLowerCase().includes("es") ||
                v.lang.toLowerCase().includes("spa")
            );

            // Detailed logging for debugging (will help user identify available voices)
            console.log("All available voices:", voices.map(v => `${v.name} (${v.lang})`));
            console.log("Spanish voices found:", spanishVoices.map(v => `${v.name} (${v.lang})`));

            // Expanded list of female keywords and specific voice names
            const femaleKeywords = [
                "female", "woman", "femenina", "mujer", "girl", "chica",
                "monica", "mónica", "paulina", "rosa", "helena", "sabina",
                "laura", "lucia", "lucía", "carmen", "elena", "sofia", "sofía",
                "zira", "yuri", "mia", "alva", "samantha"
            ];

            // Try to find a specific high-quality female Spanish voice
            let selectedVoice = spanishVoices.find(v => {
                const nameLower = v.name.toLowerCase();
                return femaleKeywords.some(keyword => nameLower.includes(keyword));
            });

            // If no specific female Spanish voice is found, try Google Español (often female-sounding)
            if (!selectedVoice) {
                selectedVoice = spanishVoices.find(v => v.name.includes("Google Español") || v.name.includes("Google español"));
            }

            // Fallback: Use the first Spanish voice available
            if (!selectedVoice && spanishVoices.length > 0) {
                selectedVoice = spanishVoices[0];
            }

            if (selectedVoice) {
                utterance.voice = selectedVoice;
                console.log("Selected voice:", selectedVoice.name);

                // Adjust pitch slightly higher if it's not a known high-quality female voice
                // to try and feminize it, unless it's known to be good.
                const isKnownFemale = femaleKeywords.some(k => selectedVoice!.name.toLowerCase().includes(k));
                utterance.pitch = isKnownFemale ? 1.0 : 1.1;
            } else {
                // Fallback if no Spanish voices found at all (rare)
                utterance.pitch = 1.2; // Try to make default voice sound more feminine
            }

            window.speechSynthesis.speak(utterance);
        }
    };

    const [messages, setMessages] = useState<Message[]>([
        { id: "1", role: "assistant", text: "mejoramos tu estilo?" },
    ]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const isListeningRef = useRef(isListening);
    const hasGreetedRef = useRef(false);

    // Keep ref in sync with prop
    useEffect(() => {
        isListeningRef.current = isListening;
    }, [isListening]);

    // Speak initial greeting on mount
    useEffect(() => {
        if (!hasGreetedRef.current) {
            hasGreetedRef.current = true;
            // Wait a bit for voices to load
            setTimeout(() => {
                speak("mejoramos tu estilo?");
            }, 500);
        }
    }, []);

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
                    className={`w-full border border-white/20 rounded-full px-6 py-3 text-white placeholder-white/50 focus:outline-none focus:bg-white/20 transition-all backdrop-blur-sm ${isListening ? "bg-white/15 border-white/30" : "bg-white/10"}`}
                />
            </form>
        </div>
    );
};

export default ChatInterface;

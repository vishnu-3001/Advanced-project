import { useState, useEffect, useRef } from "react";
import classes from "./AITutorChat.module.css";

export default function AITutorChat() {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [chatMode, setChatMode] = useState('tutor');
    const [aiPersonality, setAiPersonality] = useState('helpful');
    const [conversationHistory, setConversationHistory] = useState([]);
    // const [suggestions, setSuggestions] = useState([]); // TODO: Implement dynamic suggestions
    const messagesEndRef = useRef(null);

    const personalities = [
        { id: 'helpful', name: 'Helpful Tutor', icon: '👨‍🏫', description: 'Patient and encouraging' },
        { id: 'challenging', name: 'Challenging Mentor', icon: '🧠', description: 'Pushes critical thinking' },
        { id: 'friendly', name: 'Friendly Guide', icon: '😊', description: 'Casual and approachable' },
        { id: 'expert', name: 'Expert Professor', icon: '👨‍🔬', description: 'Deep technical knowledge' }
    ];

    const chatModes = [
        { id: 'tutor', name: 'Tutoring', icon: '📚', description: 'Get help with problems' },
        { id: 'explain', name: 'Explain Concepts', icon: '💡', description: 'Understand theory' },
        { id: 'practice', name: 'Practice Mode', icon: '🎯', description: 'Generate practice problems' },
        { id: 'debug', name: 'Debug Solutions', icon: '🔍', description: 'Find and fix errors' }
    ];

    const quickSuggestions = [
        "Give me a math problem",
        "Explain this step-by-step",
        "Show me the solution",
        "Give me a hint",
        "What am I doing wrong?",
        "Show me the formula"
    ];

    useEffect(() => {
        // Initialize with welcome message
        if (messages.length === 0) {
            addMessage('ai', `Hello! I'm your AI tutor. I'm here to help you with math problems, explain concepts, and guide your learning. What would you like to work on today?`, 'welcome');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const addMessage = (sender, content, type = 'normal') => {
        const newMessage = {
            id: Date.now(),
            sender,
            content,
            type,
            timestamp: new Date().toISOString(),
            personality: aiPersonality
        };
        setMessages(prev => [...prev, newMessage]);
        setConversationHistory(prev => [...prev, newMessage]);
    };

    const simulateAIResponse = async (userMessage) => {
        setIsTyping(true);
        
        try {
            console.log('Sending chat request:', {
                message: userMessage,
                chat_mode: chatMode,
                personality: aiPersonality,
                conversation_history: conversationHistory.slice(-10)
            });
            
            // Call the real AI chat API
            const response = await fetch('http://localhost:8000/api/v1/openai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    chat_mode: chatMode,
                    personality: aiPersonality,
                    conversation_history: conversationHistory.slice(-10) // Last 10 messages for context
                })
            });
            
            console.log('Chat response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('Chat response data:', data);
            addMessage('ai', data.response, 'response');
        } catch (error) {
            console.error('Error calling AI chat API:', error);
            // Fallback to a simple response
            addMessage('ai', `I'm sorry, I'm having trouble connecting right now. Error: ${error.message}. Please try again in a moment.`, 'error');
        }
        
        setIsTyping(false);
    };

    // eslint-disable-next-line no-unused-vars
    const generateAIResponse = (userMessage, mode, personality) => {
        const baseResponses = {
            tutor: [
                "Let me help you work through this step by step. First, let's identify what we're trying to find...",
                "Great question! Let me break this down into smaller, manageable parts...",
                "I see you're working on this problem. Let's start by understanding what the question is asking...",
                "Excellent! You're on the right track. Let me guide you through the next step...",
                "I can help you with that! Let's approach this systematically..."
            ],
            explain: [
                "Let me explain this concept clearly. The key idea here is...",
                "This is a fundamental concept in mathematics. Here's how it works...",
                "Great question! Let me break down the theory behind this...",
                "Understanding this concept will help you solve many problems. Here's the explanation...",
                "This is an important principle. Let me walk you through it step by step..."
            ],
            practice: [
                "Let me create a practice problem for you. Here's one that's similar but slightly different...",
                "Great! I'll generate a problem that will help you practice this skill...",
                "Perfect! Here's a practice problem that builds on what you just learned...",
                "Let's practice this concept with a new problem. Try this one...",
                "I'll create a problem that will challenge you appropriately. Here it is..."
            ],
            debug: [
                "Let me help you find the error. Looking at your work, I can see...",
                "I can spot the issue! The problem is in this step...",
                "Let's debug this together. The error is likely here...",
                "I see what went wrong. Let me point out the mistake...",
                "Let's trace through your solution to find where things went off track..."
            ]
        };

        const personalityModifiers = {
            helpful: [
                "Don't worry, this is a common mistake. ",
                "You're doing great! ",
                "I'm here to help you succeed. ",
                "Take your time, there's no rush. ",
                "You're learning, and that's what matters. "
            ],
            challenging: [
                "Think about this more carefully. ",
                "What's the underlying principle here? ",
                "Challenge yourself to go deeper. ",
                "Don't just memorize - understand why. ",
                "This requires critical thinking. "
            ],
            friendly: [
                "Hey, no worries! ",
                "This is totally normal! ",
                "You've got this! ",
                "Let's figure this out together! ",
                "I believe in you! "
            ],
            expert: [
                "From a mathematical perspective, ",
                "The rigorous approach would be to ",
                "This is a classic example of ",
                "The formal definition states that ",
                "In advanced mathematics, we would "
            ]
        };

        const baseResponse = baseResponses[mode][Math.floor(Math.random() * baseResponses[mode].length)];
        const personalityModifier = personalityModifiers[personality][Math.floor(Math.random() * personalityModifiers[personality].length)];
        
        return [`${personalityModifier}${baseResponse}`];
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage = inputMessage.trim();
        addMessage('user', userMessage);
        setInputMessage('');
        
        await simulateAIResponse(userMessage);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setInputMessage(suggestion);
    };

    const clearChat = () => {
        setMessages([]);
        setConversationHistory([]);
        addMessage('ai', "Chat cleared! How can I help you today?", 'system');
    };

    const exportChat = () => {
        const chatData = {
            timestamp: new Date().toISOString(),
            personality: aiPersonality,
            mode: chatMode,
            messages: conversationHistory
        };
        
        const dataStr = JSON.stringify(chatData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'ai-tutor-chat.json';
        link.click();
    };

    const generatePracticeProblem = async () => {
        setIsTyping(true);
        
        try {
            // Call the real AI chat API for practice problem generation
            const response = await fetch('http://localhost:8000/api/v1/openai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: "Generate a practice math problem for me to solve",
                    chat_mode: "practice",
                    personality: aiPersonality,
                    conversation_history: conversationHistory.slice(-10)
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            addMessage('ai', data.response, 'practice');
        } catch (error) {
            console.error('Error generating practice problem:', error);
            // Fallback to a simple problem
            addMessage('ai', "Here's a practice problem for you: Solve for x: 2x + 5 = 13", 'practice');
        }
        
        setIsTyping(false);
    };

    return (
        <div className={classes.container}>
            <div className={classes.header}>
                <div className={classes.headerContent}>
                    <h2>🤖 AI Tutor Chat Assistant</h2>
                    <p className={classes.headerSubtitle}>
                        Chat with an AI tutor that adapts to your learning style and helps you understand math concepts
                    </p>
                </div>
                <div className={classes.headerControls}>
                    <div className={classes.selectGroup}>
                        <label>AI Personality:</label>
                        <select 
                            value={aiPersonality} 
                            onChange={(e) => setAiPersonality(e.target.value)}
                            className={classes.personalitySelect}
                        >
                            {personalities.map(personality => (
                                <option key={personality.id} value={personality.id}>
                                    {personality.icon} {personality.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={classes.selectGroup}>
                        <label>Chat Mode:</label>
                        <select 
                            value={chatMode} 
                            onChange={(e) => setChatMode(e.target.value)}
                            className={classes.modeSelect}
                        >
                            {chatModes.map(mode => (
                                <option key={mode.id} value={mode.id}>
                                    {mode.icon} {mode.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button className={classes.clearBtn} onClick={clearChat}>
                        🗑️ Clear
                    </button>
                    <button className={classes.exportBtn} onClick={exportChat}>
                        📥 Export
                    </button>
                </div>
            </div>

            <div className={classes.chatContainer}>
                <div className={classes.messagesContainer}>
                    {messages.map(message => (
                        <div key={message.id} className={`${classes.message} ${classes[message.sender]}`}>
                            <div className={classes.messageAvatar}>
                                {message.sender === 'user' ? '👤' : '🤖'}
                            </div>
                            <div className={classes.messageContent}>
                                <div className={classes.messageText}>
                                    {message.content}
                                </div>
                                <div className={classes.messageTime}>
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {isTyping && (
                        <div className={`${classes.message} ${classes.ai}`}>
                            <div className={classes.messageAvatar}>🤖</div>
                            <div className={classes.messageContent}>
                                <div className={classes.typingIndicator}>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>

                <div className={classes.suggestionsContainer}>
                    <h4>💡 Quick Suggestions</h4>
                    <div className={classes.suggestionsGrid}>
                        {quickSuggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                className={classes.suggestionBtn}
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                    <button className={classes.practiceBtn} onClick={generatePracticeProblem}>
                        🎯 Generate Practice Problem
                    </button>
                </div>

                <div className={classes.inputContainer}>
                    <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything about math..."
                        className={classes.messageInput}
                        rows="3"
                    />
                    <button 
                        className={classes.sendBtn}
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim()}
                    >
                        📤 Send
                    </button>
                </div>
            </div>

        </div>
    );
}

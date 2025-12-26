import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, Send, Square, AlertCircle, CheckCircle, ArrowRight, Loader2, Volume2, StopCircle, FileText, Brain } from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressRing from '../components/ProgressRing';
import PhysicsButton from '../components/PhysicsButton';
import ConfidencePulse from '../components/ConfidencePulse';

const Interview = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answerText, setAnswerText] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [typedText, setTypedText] = useState('');
    const [isInputEnabled, setIsInputEnabled] = useState(false);
    const [followUpQuestion, setFollowUpQuestion] = useState(null);
    const [isFollowUpActive, setIsFollowUpActive] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [summaryData, setSummaryData] = useState(null);
    const [cognitiveStep, setCognitiveStep] = useState(0);

    const cognitiveStages = [
        "Analyzing intent patterns...",
        "Cross-referencing financial telemetry...",
        "Validating home-country ties...",
        "Checking itinerary coherence...",
        "Generating final logic pulse..."
    ];

    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState('');

    // UI States
    const [aiTyping, setAiTyping] = useState(false);
    const [silenceTimeout, setSilenceTimeout] = useState(null);
    const [showSilenceWarning, setShowSilenceWarning] = useState(false);

    const bottomRef = useRef(null);
    const recognitionRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);

    const speak = (text) => {
        if (!isVoiceMode) return;
        synthRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onstart = () => {
            resetSilenceTimer(true); // Disable timer while AI speaks
        };
        utterance.onend = () => {
            if (isVoiceMode && !feedback && !submitting) {
                startListening();
            }
        };
        synthRef.current.speak(utterance);
    };

    const resetSilenceTimer = (clearOnly = false) => {
        if (silenceTimeout) clearTimeout(silenceTimeout);
        setShowSilenceWarning(false);
        if (clearOnly) return;

        if (isListening) {
            const timeout = setTimeout(() => {
                setShowSilenceWarning(true);
            }, 4000);
            setSilenceTimeout(timeout);
        }
    };

    useEffect(() => {
        fetchSession();

        // Initialize Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event) => {
                resetSilenceTimer();
                let interim = '';
                let final = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        final += event.results[i][0].transcript;
                    } else {
                        interim += event.results[i][0].transcript;
                    }
                }

                if (final) {
                    setAnswerText(prev => prev + (prev ? ' ' : '') + final);
                }
                setInterimTranscript(interim);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
                resetSilenceTimer(true);
            };

            recognitionRef.current.onend = () => {
                if (isListening) {
                    try {
                        recognitionRef.current.start();
                    } catch (e) {
                        console.log("Recognition restart failed", e);
                    }
                }
            };
        }

        return () => {
            synthRef.current.cancel();
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, [sessionId]);

    useEffect(() => {
        if (session && !loading && !aiTyping && !feedback) {
            const questionText = isFollowUpActive ? followUpQuestion : session.questions[currentQuestionIndex].text;
            startTypingEffect(questionText);
            speak(questionText);
        }
    }, [currentQuestionIndex, aiTyping, session, isFollowUpActive]);

    const startTypingEffect = (text) => {
        setTypedText('');
        setIsInputEnabled(false);
        let i = 0;
        const interval = setInterval(() => {
            setTypedText(text.slice(0, i + 1));
            i++;
            if (i >= text.length) {
                clearInterval(interval);
                // 1.5s delay after typing finishes before enabling input
                setTimeout(() => setIsInputEnabled(true), 1500);
            }
        }, 30); // Adaptive typing speed
    };

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [session, feedback, aiTyping, interimTranscript]);

    const fetchSession = async () => {
        try {
            const response = await api.get(`/interview/${sessionId}`);
            setSession(response.data);
            setLoading(false);
            setAiTyping(true);
            setTimeout(() => setAiTyping(false), 1000);
        } catch (error) {
            console.error("Error fetching session", error);
            setLoading(false);
        }
    };

    const startListening = () => {
        if (!recognitionRef.current) return;
        try {
            recognitionRef.current.start();
            setIsListening(true);
        } catch (e) {
            console.error("Failed to start listening", e);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
        setInterimTranscript('');
        resetSilenceTimer(true);
    };

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }
        if (isListening) {
            stopListening();
        } else {
            startListening();
            resetSilenceTimer();
        }
    };

    const handleNextQuestion = () => {
        setFeedback(null);
        setAnswerText('');
        setInterimTranscript('');

        if (followUpQuestion && !isFollowUpActive) {
            setIsFollowUpActive(true);
            setAiTyping(true);
            setTimeout(() => setAiTyping(false), 1500);
            return;
        }

        if (isFollowUpActive) {
            setIsFollowUpActive(false);
            setFollowUpQuestion(null);
            // Move to the next planned question AFTER follow-up is over
        }

        if (currentQuestionIndex < session.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setAiTyping(true);
            setTimeout(() => setAiTyping(false), 1500);
        } else {
            generateSummary();
        }
    };

    const generateSummary = async () => {
        setLoading(true);
        try {
            // Fetch final state with all feedback
            const response = await api.get(`/interview/${sessionId}`);
            const finalSession = response.data;

            // Logic to calculate summary metrics from all answers
            const allScores = finalSession.questions
                .filter(q => q.answer && q.answer.feedback)
                .map(q => q.answer.feedback.score);

            const avgScore = allScores.length > 0
                ? allScores.reduce((a, b) => a + b, 0) / allScores.length
                : 0;

            const summary = {
                avgScore: Math.round(avgScore),
                strengths: avgScore > 70 ? ["Strong clarity", "Consistent logic", "Confidence in intent"] : ["Clarity of purpose", "Direct responses"],
                improvements: avgScore < 60 ? ["Elaborate on return plans", "Provide concrete financial details"] : ["Continue refining vocal stability"],
                confidence: avgScore > 85 ? "Optimal" : avgScore > 65 ? "Stable" : "Calibrating"
            };

            setSummaryData(summary);
            setShowSummary(true);
        } catch (error) {
            console.error("Error generating summary", error);
        } finally {
            setLoading(false);
        }
    };

    const finishInterview = async () => {
        await api.post(`/interview/${sessionId}/complete`);
        navigate('/dashboard');
    };

    const submitAnswer = async () => {
        if (!answerText.trim() && !interimTranscript.trim()) return;
        const finalAnswer = answerText + (interimTranscript ? ' ' + interimTranscript : '');

        if (isListening) stopListening();
        synthRef.current.cancel();

        setSubmitting(true);
        try {
            const currentQuestion = session.questions[currentQuestionIndex];
            const response = await api.post('/interview/answer', {
                question_id: isFollowUpActive ? session.questions[currentQuestionIndex].id : currentQuestion.id, // Keep linked to original question ID if follow-up
                user_audio_text: finalAnswer
            });
            setAnswerText(finalAnswer);

            // Extract follow-up if present
            if (response.data.feedback?.follow_up) {
                setFollowUpQuestion(response.data.feedback.follow_up);
            }

            // DELIBERATE NEURAL EVALUATION PHASE
            setSubmitting(false); // Stop general submitting state
            setIsAnalyzing(true);
            setCognitiveStep(0);

            // Cycle through cognitive stages for judgment visibility
            const interval = setInterval(() => {
                setCognitiveStep(prev => (prev < cognitiveStages.length - 1 ? prev + 1 : prev));
            }, 500);

            // Wait for theatrics
            setTimeout(() => {
                clearInterval(interval);
                setIsAnalyzing(false);
                setFeedback(response.data.feedback);
            }, 2800);

        } catch (error) {
            console.error("Error submitting answer", error);
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );
    if (!session) return <div className="p-10 text-center">Session not found</div>;

    const currentQuestion = session.questions[currentQuestionIndex];
    const displayQuestionText = isFollowUpActive ? followUpQuestion : currentQuestion.text;
    const isLastQuestion = currentQuestionIndex === session.questions.length - 1 && !followUpQuestion;
    const progress = ((currentQuestionIndex + 1) / session.questions.length) * 100;

    if (showSummary) {
        return (
            <div className="max-w-3xl mx-auto space-y-8 pb-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-primary/20">
                        <CheckCircle className="text-primary" size={40} />
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tight">Protocol Finalized</h2>
                    <p className="text-neutral-500 uppercase text-[10px] font-black tracking-[0.3em]">Neuro-Analytical Summary</p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="glass-dark border border-white/5 p-6 rounded-3xl text-center">
                        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-2">Overall Output</span>
                        <div className="text-3xl font-black text-white">{summaryData.avgScore}%</div>
                    </div>
                    <div className="glass-dark border border-white/5 p-6 rounded-3xl text-center">
                        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-2">Confidence Signal</span>
                        <div className={`text-xl font-black ${summaryData.avgScore > 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {summaryData.confidence}
                        </div>
                    </div>
                    <div className="glass-dark border border-white/5 p-6 rounded-3xl text-center">
                        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-2">System Status</span>
                        <div className="text-xl font-black text-primary">AUTHORIZED</div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-green-500/5 border border-green-500/10 p-8 rounded-[2rem]">
                        <h3 className="text-sm font-black text-green-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Zap size={16} /> Key Strengths
                        </h3>
                        <ul className="space-y-4">
                            {summaryData.strengths.map((s, i) => (
                                <li key={i} className="text-neutral-300 text-sm flex items-start gap-3">
                                    <CheckCircle size={14} className="text-green-500 mt-1 flex-shrink-0" />
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-yellow-500/5 border border-yellow-500/10 p-8 rounded-[2rem]">
                        <h3 className="text-sm font-black text-yellow-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <ArrowRight size={16} /> Optimization Nodes
                        </h3>
                        <ul className="space-y-4">
                            {summaryData.improvements.map((s, i) => (
                                <li key={i} className="text-neutral-300 text-sm flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="glass-dark border border-white/5 p-8 rounded-[2rem] space-y-4">
                    <div className="flex items-center gap-3 text-neutral-400">
                        <AlertCircle size={18} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Disclaimer</span>
                    </div>
                    <p className="text-xs text-neutral-500 leading-relaxed italic">
                        This evaluation is generated by the NeuroVisa AI Protocol for preparatory purposes only.
                        Cognitive analytics do not guarantee visa approval. Actual embassy decisions are subject to government discretion,
                        policy changes, and individual officer judgment.
                    </p>
                </div>

                <div className="flex justify-center pt-8">
                    <PhysicsButton
                        onClick={finishInterview}
                        className="bg-white text-background px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    >
                        Close Protocol
                    </PhysicsButton>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col px-4">
            {/* Header & Progress */}
            <div className="mb-6 sticky top-0 bg-[#0B1120]/95 backdrop-blur-sm z-10 py-4">
                <div className="flex justify-between items-center text-sm text-gray-400 mb-3">
                    <span className="font-medium text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(0,242,254,0.8)]" />
                        Neural Pulse Active
                    </span>
                    <div className="flex items-center gap-4">
                        <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Node</span>
                            <span className="text-xs font-black text-white">{currentQuestionIndex + 1} / {session.questions.length}</span>
                        </div>
                        <div className="flex items-center gap-6">
                            {/* Live Confidence Signal */}
                            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                                <div className="flex flex-col">
                                    <span className="text-[8px] uppercase font-black text-neutral-500 tracking-[0.2em]">Confidence Signal</span>
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <div
                                                    key={i}
                                                    className={`w-1.5 h-3 rounded-sm transition-all duration-500 ${feedback ? (
                                                        i <= (feedback.score > 80 ? 5 : feedback.score > 60 ? 3 : 2)
                                                            ? 'bg-primary shadow-[0_0_5px_rgba(0,242,254,0.5)]'
                                                            : 'bg-white/10'
                                                    ) : 'bg-white/5 animate-pulse'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/80 min-w-[60px]">
                                            {!feedback ? 'Syncing...' : feedback.score > 80 ? 'Optimal' : feedback.score > 60 ? 'Stable' : 'Calibrating'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isVoiceMode ? 'text-primary' : 'text-neutral-500'}`}>Spectral Link</span>
                                <button
                                    onClick={() => setIsVoiceMode(!isVoiceMode)}
                                    className={`relative w-9 h-5 rounded-full transition-colors ${isVoiceMode ? 'bg-primary/50' : 'bg-white/10'}`}
                                >
                                    <motion.div
                                        className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-lg"
                                        animate={{ x: isVoiceMode ? 16 : 0 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden mt-6">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-grow flex flex-col gap-6 overflow-y-auto mb-6 pr-2 scrollbar-thin scrollbar-thumb-gray-700">
                {/* AI Question Bubble */}
                <div className="flex gap-4">
                    <motion.div
                        animate={aiTyping || !isInputEnabled ? {
                            scale: [1, 1.05, 1],
                            boxShadow: [
                                "0 0 0px rgba(0, 242, 254, 0)",
                                "0 0 20px rgba(0, 242, 254, 0.4)",
                                "0 0 0px rgba(0, 242, 254, 0)"
                            ]
                        } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-2xl"
                    >
                        <Brain className="text-white relative z-10" size={24} />
                        {(aiTyping || !isInputEnabled) && (
                            <div className="absolute inset-0 flex items-center justify-center gap-0.5">
                                {[1, 2, 3].map((i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ height: [4, 12, 4] }}
                                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                                        className="w-0.5 bg-white/40 rounded-full"
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>
                    <div className="flex-grow">
                        <div className="glass-dark border border-white/10 p-6 rounded-[2rem] rounded-tl-none shadow-2xl max-w-2xl relative">
                            {aiTyping ? (
                                <div className="flex gap-1.5 py-2">
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-0" />
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150" />
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300" />
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-start gap-4"
                                >
                                    <p className="text-lg leading-relaxed flex-grow min-h-[1.5em]">
                                        {typedText}
                                        {!isInputEnabled && typedText.length < (isFollowUpActive ? followUpQuestion.length : currentQuestion.text.length) && (
                                            <motion.span
                                                animate={{ opacity: [1, 0] }}
                                                transition={{ repeat: Infinity, duration: 0.5 }}
                                                className="inline-block w-1.5 h-5 ml-1 bg-primary"
                                            />
                                        )}
                                    </p>
                                    <button
                                        onClick={() => speak(currentQuestion.text)}
                                        className={`p-2 rounded-lg transition-colors ${isVoiceMode ? 'bg-primary/20 text-primary' : 'bg-gray-800 text-gray-500 hover:text-gray-300'}`}
                                        title="Speak Question"
                                    >
                                        <Volume2 size={18} />
                                    </button>
                                </motion.div>
                            )}
                        </div>
                        <div className="flex items-center gap-4 ml-4 mt-2">
                            {!aiTyping && <span className="text-[10px] uppercase font-black text-primary tracking-[0.2em] block">Neural Evaluator // Active</span>}
                            {isFollowUpActive && (
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-[0.15em] animate-pulse flex items-center gap-1"
                                >
                                    <Search size={10} /> Logic Trigger: Ambiguity Detected // Follow-up Active
                                </motion.span>
                            )}
                        </div>
                    </div>
                </div>

                {/* User Answer Bubble */}
                {(feedback || submitting || (isListening && interimTranscript)) && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-4 flex-row-reverse"
                    >
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 border border-gray-600">
                            <span className="text-xs font-bold">You</span>
                        </div>
                        <div className={`bg-primary/10 border p-5 rounded-2xl rounded-tr-sm max-w-2xl ${isListening ? 'border-red-500/30' : 'border-primary/20'}`}>
                            <p className="text-gray-200 leading-relaxed font-medium">
                                {answerText}
                                {interimTranscript && (
                                    <span className="text-gray-500 animate-pulse"> {interimTranscript}</span>
                                )}
                            </p>
                            {isListening && (
                                <div className="mt-4 flex flex-col gap-3">
                                    <div className="flex items-center gap-2">
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                            className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                                        />
                                        <span className="text-[10px] uppercase tracking-[0.2em] font-black text-red-500">Spectral Capture Active</span>
                                    </div>

                                    {/* Waveform Visualizer */}
                                    <div className="flex items-end gap-1 h-8 px-2">
                                        {[...Array(12)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                animate={{
                                                    height: interimTranscript ? [4, Math.random() * 24 + 8, 4] : [4, 8, 4]
                                                }}
                                                transition={{
                                                    repeat: Infinity,
                                                    duration: 0.4 + Math.random() * 0.4,
                                                    delay: i * 0.05
                                                }}
                                                className="w-1.5 bg-red-500/40 rounded-full"
                                            />
                                        ))}
                                    </div>

                                    {showSilenceWarning && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-xs text-red-400 flex items-center gap-3"
                                        >
                                            <AlertCircle size={14} />
                                            <span>No response detected. Continue with voice or switch to text?</span>
                                            <button
                                                onClick={() => { setIsVoiceMode(false); stopListening(); }}
                                                className="ml-auto underline font-bold"
                                            >
                                                Switch to Text
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* NEURAL EVALUATION PHASE */}
                <AnimatePresence>
                    {isAnalyzing && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-primary/5 border border-primary/20 p-8 rounded-[2.5rem] relative overflow-hidden"
                        >
                            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], rotate: 360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="w-64 h-64 border-2 border-dashed border-primary rounded-full"
                                />
                            </div>

                            <div className="relative z-10 space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                        <Loader2 className="animate-spin text-primary" size={20} />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="text-xl font-black text-white tracking-tight">AI Reasoning Protocol</h3>
                                        <motion.p
                                            key={cognitiveStep}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="text-[10px] uppercase font-bold text-primary tracking-[0.2em]"
                                        >
                                            {cognitiveStages[cognitiveStep]}
                                        </motion.p>
                                    </div>
                                    <span className="text-[8px] bg-white/10 px-2 py-1 rounded text-neutral-400 font-mono italic">
                                        Step {cognitiveStep + 1}/5
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-6">
                                    {[
                                        { label: "Confidence", delay: 0 },
                                        { label: "Intent", delay: 0.4 },
                                        { label: "Consistency", delay: 0.8 }
                                    ].map((metric, i) => (
                                        <div key={i} className="space-y-3">
                                            <div className="text-[10px] uppercase font-black text-neutral-400 tracking-widest">{metric.label}</div>
                                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: "100%" }}
                                                    transition={{ duration: 1.5, delay: metric.delay, ease: "easeInOut" }}
                                                    className="h-full bg-primary shadow-[0_0_10px_rgba(0,242,254,0.5)]"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* AI Feedback Panel */}
                <AnimatePresence>
                    {feedback && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`p-6 rounded-2xl border backdrop-blur-sm ${feedback.score > 70
                                ? 'bg-green-500/5 border-green-500/20'
                                : 'bg-yellow-500/5 border-yellow-500/20'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-6">
                                    <ConfidencePulse score={feedback.score}>
                                        <ProgressRing
                                            progress={feedback.score}
                                            size={80}
                                            strokeWidth={6}
                                            color={feedback.score > 70 ? "#10b981" : "#f59e0b"}
                                        />
                                    </ConfidencePulse>
                                    <div>
                                        <h3 className={`text-2xl font-black ${feedback.score > 70 ? "text-green-400" : "text-yellow-400"}`}>
                                            Decision Impact: {feedback.score}%
                                        </h3>
                                        <p className="text-neutral-500 text-xs uppercase tracking-widest font-bold">Neural Evaluation Meta-Score</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {feedback.metrics?.risk_level === 'High' && (
                                        <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-tighter">High Risk</span>
                                    )}
                                    <span className="bg-gray-800 text-gray-400 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-tighter">AI Analysis</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-background/40 p-3 rounded-xl border border-gray-800/50 text-center">
                                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Clarity</div>
                                    <div className={`font-bold ${feedback.metrics?.clarity === 'High' ? 'text-green-400' : 'text-yellow-400'}`}>{feedback.metrics?.clarity || 'Normal'}</div>
                                </div>
                                <div className="bg-background/40 p-3 rounded-xl border border-gray-800/50 text-center">
                                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Confidence</div>
                                    <div className={`font-bold ${feedback.metrics?.confidence === 'High' ? 'text-green-400' : 'text-yellow-400'}`}>{feedback.metrics?.confidence || 'Normal'}</div>
                                </div>
                                <div className="bg-background/40 p-3 rounded-xl border border-gray-800/50 text-center">
                                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Word Count</div>
                                    <div className="font-bold text-white">{feedback.metrics?.word_count || 0}</div>
                                </div>
                            </div>

                            <div className="bg-background/50 rounded-xl p-5 border border-gray-800/50 mb-6">
                                <h4 className="text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                                    <FileText size={16} className="text-primary" /> Evaluation
                                </h4>
                                <p className="text-gray-300 leading-relaxed text-sm">
                                    {feedback.feedback}
                                </p>

                                {feedback.metrics?.risky_sentences?.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-800">
                                        <h5 className="text-xs font-bold text-red-400 uppercase mb-2">Detected Concerns:</h5>
                                        <div className="space-y-2">
                                            {feedback.metrics.risky_sentences.map((s, idx) => (
                                                <div key={idx} className="text-xs text-gray-400 italic bg-red-400/5 px-2 py-1.5 rounded border-l-2 border-red-500/50">
                                                    "{s}"
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <PhysicsButton
                                    onClick={handleNextQuestion}
                                    className="bg-primary text-background px-10 py-4 rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center gap-2 font-black"
                                >
                                    {isLastQuestion ? "TERMINATE PROTOCOL" : "NEXT INQUIRY"} <ArrowRight size={20} />
                                </PhysicsButton>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={bottomRef} className="h-4" />
            </div>

            {/* Input Area */}
            <div className="mb-4">
                {/* Hints */}
                <div className="flex justify-between items-center px-4 mb-2">
                    {aiTyping || !isInputEnabled ? (
                        <span className="text-[10px] uppercase font-black text-primary/60 animate-pulse tracking-[0.2em]">Neural Evaluator Processing...</span>
                    ) : (
                        <span className="text-xs text-gray-500">
                            {isVoiceMode ? "Speak clearly. Click Mic to stop or Send to submit." : "Type your answer or use voice input."}
                        </span>
                    )}
                </div>

                <div className={`relative transition-all duration-300 ${isListening ? 'ring-2 ring-red-500/50 shadow-red-500/20 shadow-lg' : 'focus-within:ring-2 focus-within:ring-primary/50'} rounded-3xl bg-surface border border-gray-800`}>
                    <textarea
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder={!isInputEnabled ? "Syncing response channel..." : (isVoiceMode ? "Listening..." : "Provide your response...")}
                        disabled={!isInputEnabled || submitting}
                        className="w-full bg-transparent border-none rounded-3xl p-5 pr-32 h-24 resize-none focus:ring-0 focus:outline-none text-lg leading-relaxed placeholder:text-neutral-700 disabled:opacity-50"
                    />

                    <div className="absolute bottom-3 right-3 flex gap-2">
                        <PhysicsButton
                            onClick={toggleListening}
                            disabled={!isInputEnabled || submitting}
                            className={`p-4 rounded-2xl transition-all duration-300 relative ${isListening
                                ? 'bg-red-500 text-white shadow-xl shadow-red-500/40'
                                : 'bg-white/5 text-neutral-400 hover:text-white'
                                }`}
                        >
                            {isListening && (
                                <motion.div
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="absolute inset-0 bg-red-500 rounded-2xl"
                                />
                            )}
                            {isListening ? <StopCircle size={22} className="relative z-10" /> : <Mic size={22} className="relative z-10" />}
                        </PhysicsButton>

                        <PhysicsButton
                            onClick={submitAnswer}
                            disabled={submitting || (!answerText.trim() && !interimTranscript.trim()) || !isInputEnabled}
                            className="bg-primary text-background p-4 rounded-2xl disabled:opacity-50 disabled:grayscale transition-all shadow-xl shadow-primary/20"
                        >
                            <Send size={22} />
                        </PhysicsButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Interview;

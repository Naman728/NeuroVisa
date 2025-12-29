import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Send, Square, AlertCircle, CheckCircle, ArrowRight, Loader2, Volume2, StopCircle, FileText, Brain, Video, VideoOff, Camera, Monitor, Layout, Search, Zap, ShieldCheck, Link, FileCheck } from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressRing from '../components/ProgressRing';
import PhysicsButton from '../components/PhysicsButton';
import ConfidencePulse from '../components/ConfidencePulse';
import ActionSphere from '../components/ActionSphere';
import ConfirmationModal from '../components/ConfirmationModal';

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

    const [interviewMode, setInterviewMode] = useState('text'); // text, voice, video
    const [stream, setStream] = useState(null);
    const [videoError, setVideoError] = useState(null);
    const [liveConfidence, setLiveConfidence] = useState('Medium');
    const [microFeedback, setMicroFeedback] = useState(null);
    const [interimTranscript, setInterimTranscript] = useState('');
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isMicEnabled, setIsMicEnabled] = useState(true);

    // UI States
    const [aiTyping, setAiTyping] = useState(false);
    const [silenceTimeout, setSilenceTimeout] = useState(null);
    const [showSilenceWarning, setShowSilenceWarning] = useState(false);
    const [isEndModalOpen, setIsEndModalOpen] = useState(false);

    // Performance Metrics
    const [questionStartTime, setQuestionStartTime] = useState(Date.now());
    const [editCount, setEditCount] = useState(0);

    // Advanced Hackathon Features
    const [stressMode, setStressMode] = useState(false);
    const [officerPersona, setOfficerPersona] = useState('Neutral');
    const [thinkingMessage, setThinkingMessage] = useState('');
    const [voiceHints, setVoiceHints] = useState([]);

    // Document Sync States (Section 4, Item 11)
    const [syncDocument, setSyncDocument] = useState("");
    const [syncStatus, setSyncStatus] = useState("idle"); // idle, checking, consistent, minor, mismatch
    const [mismatchReason, setMismatchReason] = useState("");
    const [isSyncCollapsed, setIsSyncCollapsed] = useState(false);

    // Timer System (Section 5, Item 12)
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    const resetInterviewState = () => {
        setSession(null);
        setCurrentQuestionIndex(0);
        setAnswerText('');
        setFeedback(null);
        setIsListening(false);
        setIsAnalyzing(false);
        setTypedText('');
        setIsInputEnabled(false);
        setFollowUpQuestion(null);
        setIsFollowUpActive(false);
        setShowSummary(false);
        setSummaryData(null);
        setCognitiveStep(0);
        setLiveConfidence('Medium');
        setMicroFeedback(null);
        setInterimTranscript('');
        setAiTyping(false);
        setShowSilenceWarning(false);
        setIsEndModalOpen(false);
        setElapsedSeconds(0);
        setSyncDocument("");
        setSyncStatus("idle");
        setMismatchReason("");
        setVoiceHints([]);
        setThinkingMessage('');
    };

    const videoRef = useRef(null);

    const bottomRef = useRef(null);
    const recognitionRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);

    const speak = (text) => {
        if (interviewMode === 'text') return;
        synthRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onstart = () => {
            resetSilenceTimer(true); // Disable timer while AI speaks
        };
        utterance.onend = () => {
            if (interviewMode !== 'text' && !feedback && !submitting) {
                startListening();
            }
        };
        synthRef.current.speak(utterance);
    };

    useEffect(() => {
        if (interviewMode === 'video') {
            startVideo();
        } else {
            stopVideo();
        }
    }, [interviewMode]);

    const startVideo = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setVideoError(null);

            // Auto-start listening if mic is enabled and we're ready for input
            if (isMicEnabled && isInputEnabled && !feedback && !submitting && !aiTyping) {
                startListening();
            }
        } catch (err) {
            console.error("Camera access denied", err);
            setVideoError("Camera access required for video mode. Falling back to voice.");
            setInterviewMode('voice');
        }
    };

    const stopVideo = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const toggleVideo = () => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                const newState = !videoTrack.enabled;
                videoTrack.enabled = newState;
                setIsVideoEnabled(newState);

                // If turning on camera and mic is already on, ensure we are listening
                if (newState && isMicEnabled && isInputEnabled && !feedback && !submitting && !aiTyping) {
                    if (!isListening) startListening();
                }
            }
        }
    };

    const toggleMic = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                const newState = !audioTrack.enabled;
                audioTrack.enabled = newState;
                setIsMicEnabled(newState);

                // Sync with Speech Recognition
                if (newState) {
                    if (!isListening && isInputEnabled && !feedback && !submitting && !aiTyping) {
                        startListening();
                    }
                } else {
                    if (isListening) {
                        stopListening();
                    }
                }
            }
        }
    };

    const resetSilenceTimer = (clearOnly = false) => {
        if (silenceTimeout) clearTimeout(silenceTimeout);
        setShowSilenceWarning(false);
        if (clearOnly) return;

        if (isListening) {
            const timeout = setTimeout(() => {
                setShowSilenceWarning(true);
                // Section 2, Item 7: Detect long silence
                setVoiceHints(prev => [...new Set([...prev, "Extended silence detected. Analyzing hesitation patterns..."])]);
                setTimeout(() => setVoiceHints(prev => prev.filter(h => !h.includes("silence"))), 6000);
            }, 6000);
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

                        // LIGHTWEIGHT VOICE ANALYSIS (Section 2, Item 7)
                        const text = event.results[i][0].transcript.toLowerCase();
                        const fillers = [' um', ' uh', ' like', ' basically', ' actually'];
                        const detectedFillers = fillers.filter(f => text.includes(f));

                        if (detectedFillers.length > 0) {
                            setVoiceHints(prev => [...new Set([...prev, "Detected filler words. Try to speak more decisively."])]);
                            setTimeout(() => setVoiceHints(prev => prev.filter(h => !h.includes("filler"))), 5000);
                        }
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
            if (recognitionRef.current) {
                setIsListening(false);
                recognitionRef.current.stop();
            }
            stopVideo();
            if (silenceTimeout) clearTimeout(silenceTimeout);
        };
    }, [sessionId]); // Removed silenceTimeout to prevent re-fetch loop

    useEffect(() => {
        if (session && !loading && !aiTyping && !feedback) {
            const questionText = isFollowUpActive ? followUpQuestion : session.questions[currentQuestionIndex].text;
            startTypingEffect(questionText);
            speak(questionText);
        }
    }, [currentQuestionIndex, aiTyping, session, isFollowUpActive]);

    // Live Timer Engine (Section 5, Item 12)
    useEffect(() => {
        let timer;
        if (!showSummary && !loading && session && session.status === 'in_progress') {
            timer = setInterval(() => {
                setElapsedSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [showSummary, loading, session]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return [h, m, s].map(v => v < 10 ? "0" + v : v).join(":");
    };

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
                setTimeout(() => {
                    setIsInputEnabled(true);
                    setQuestionStartTime(Date.now());
                    setEditCount(0);
                }, 1500);
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
        resetInterviewState();
        setLoading(true);
        try {
            const response = await api.get(`/interview/${sessionId}`);
            const data = response.data;
            setSession(data);

            // Restore timer from stored start time (Section 5, Item 12.8)
            if (data.start_time && data.status === 'in_progress') {
                const start = new Date(data.start_time).getTime();
                const now = Date.now();
                // Ensure we don't have negative time
                const diff = Math.max(0, Math.floor((now - start) / 1000));
                setElapsedSeconds(diff);
            } else if (data.total_duration) {
                setElapsedSeconds(data.total_duration);
            }

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
            // Sync with media stream mic if in video mode
            if (interviewMode === 'video' && stream) {
                const audioTrack = stream.getAudioTracks()[0];
                if (audioTrack && !audioTrack.enabled) {
                    audioTrack.enabled = true;
                    setIsMicEnabled(true);
                }
            }
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
        }

        if (currentQuestionIndex < session.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setAiTyping(true);
            setTimeout(() => setAiTyping(false), 1500);
        } else {
            generateSummary();
        }
    };

    const handleTextChange = (e) => {
        const newValue = e.target.value;
        if (newValue.length < answerText.length) {
            setEditCount(prev => prev + 1);
        }
        setAnswerText(newValue);
    };

    const generateSummary = async (status = "completed") => {
        setLoading(true);
        try {
            // Stop hardware and listeners first
            stopVideo();
            if (recognitionRef.current) {
                setIsListening(false);
                recognitionRef.current.stop();
            }
            if (silenceTimeout) clearTimeout(silenceTimeout);

            await api.post(`/interview/${sessionId}/complete`, {
                status: status,
                total_duration: elapsedSeconds
            });

            // Short delay to ensure state persists before navigation
            setTimeout(() => {
                navigate(`/report/${sessionId}`);
            }, 300);
        } catch (error) {
            console.error("Error generating summary", error);
            setLoading(false);
            // Fallback to report anyway if it's just a status update failure
            navigate(`/report/${sessionId}`);
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

            // INTENTIONAL ANALYSIS PAUSE (Section 2, Item 4)
            setIsAnalyzing(true);
            setCognitiveStep(0);

            const analysisMessages = [
                "Analyzing semantic intent...",
                "Cross-referencing logic nodes...",
                "Evaluating vocal stability...",
                "Detecting behavioral cues...",
                "Finalizing neural evaluation..."
            ];

            // Start cycling thinking messages immediately
            const analysisInterval = setInterval(() => {
                setCognitiveStep(prev => {
                    const next = (prev + 1) % analysisMessages.length;
                    setThinkingMessage(analysisMessages[next]);
                    return next;
                });
            }, 600);

            const response = await api.post('/interview/answer', {
                question_id: isFollowUpActive ? session.questions[currentQuestionIndex].id : currentQuestion.id,
                user_audio_text: finalAnswer,
                response_time_ms: Date.now() - questionStartTime,
                edit_count: editCount,
                stress_mode: stressMode,
                officer_personality: officerPersona
            });

            setAnswerText(finalAnswer);

            const evaluation = response.data.feedback?.evaluation_json;

            // Extract follow-up if present
            if (evaluation?.follow_up) {
                setFollowUpQuestion(evaluation.follow_up);
            }

            // Keep analyzing for at least 2 seconds for "wow" factor
            setTimeout(() => {
                clearInterval(analysisInterval);
                setIsAnalyzing(false);
                setFeedback(evaluation); // Use the extracted evaluation dict

                // SIMULATE DOCUMENT SYNC CHECK (Section 4, Item 11)
                if (syncDocument) {
                    setSyncStatus("checking");
                    setTimeout(() => {
                        const random = Math.random();
                        if (random > 0.8) {
                            setSyncStatus("mismatch");
                            setMismatchReason("Strategic Mismatch: Your answer contradicts the 'Intended Return' date specified in your Travel Plan.");
                        } else if (random > 0.6) {
                            setSyncStatus("minor");
                            setMismatchReason("Minor Logic Gap: Your articulation of funding source lacks the granular detail found in your Financial Statement.");
                        } else {
                            setSyncStatus("consistent");
                            setMismatchReason("");
                        }
                    }, 1500);
                }

                // Video Mode Micro-Feedback
                if (interviewMode === 'video') {
                    const score = resultFeedback.score;
                    if (score > 80) {
                        setMicroFeedback("Excellent clarity");
                        setLiveConfidence("High");
                    } else if (score > 60) {
                        setMicroFeedback("Stable response");
                        setLiveConfidence("Medium");
                    } else {
                        setMicroFeedback("Try more detail");
                        setLiveConfidence("Low");
                    }
                    setTimeout(() => setMicroFeedback(null), 3000);
                }
            }, 2000);

            setSubmitting(false);
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
    const progress = session.questions.length > 0 ? ((currentQuestionIndex + 1) / session.questions.length) * 100 : 0;

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

                <div className="grid md:grid-cols-4 gap-4">
                    <div className="glass-dark border border-white/5 p-6 rounded-3xl text-center">
                        <p className="text-[10px] font-black uppercase text-neutral-500 tracking-[0.2em] mb-4">Protocol Mode</p>
                        <div className="text-xl font-black text-primary uppercase tracking-tighter">
                            {summaryData.modeUsed}
                        </div>
                    </div>
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
                    <div className="flex items-center gap-6">
                        <span className="font-medium text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(0,242,254,0.8)]" />
                            Neural Pulse Active
                        </span>

                        {/* Live Timer (Section 5, Item 12.2) */}
                        <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-xs font-black font-mono text-primary tracking-widest">{formatTime(elapsedSeconds)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Node</span>
                            <span className="text-xs font-black text-white">{currentQuestionIndex + 1} / {session.questions.length}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <PhysicsButton
                                onClick={() => setIsEndModalOpen(true)}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 transition-all"
                            >
                                Terminate Protocol
                            </PhysicsButton>
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
            {/* Neural Configuration Bar (Section 2, Item 6 & Section 4, Item 13) */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-white/5 mb-6">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Stress Protocol</span>
                        <button
                            onClick={() => setStressMode(!stressMode)}
                            className={`w-8 h-4 rounded-full p-0.5 transition-colors ${stressMode ? 'bg-red-500' : 'bg-neutral-800'}`}
                        >
                            <motion.div
                                animate={{ x: stressMode ? 16 : 0 }}
                                className="w-3 h-3 bg-white rounded-full shadow-sm"
                            />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Enforce Persona</span>
                    <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
                        {['Friendly', 'Neutral', 'Strict'].map(p => (
                            <button
                                key={p}
                                onClick={() => setOfficerPersona(p)}
                                className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${officerPersona === p ? 'bg-primary text-background' : 'text-neutral-500 hover:text-white'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-grow flex flex-col gap-6 overflow-y-auto mb-6 pr-2 scrollbar-thin scrollbar-thumb-gray-700">
                {/* Video Feed Section */}
                <AnimatePresence>
                    {interviewMode === 'video' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative mb-4 aspect-video rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl bg-black flex-shrink-0"
                        >
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                            {/* Voice Hints Overlay (Section 2, Item 7) */}
                            <div className="absolute top-4 left-4 right-4 flex flex-col gap-2 z-20 pointer-events-none">
                                <AnimatePresence>
                                    {voiceHints.map((hint, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20, scale: 0.9 }}
                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                            exit={{ opacity: 0, x: 20, scale: 0.9 }}
                                            className="bg-primary/90 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 shadow-lg flex items-center gap-3 w-fit"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                            <span className="text-[10px] font-black text-background uppercase tracking-widest">{hint}</span>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                            {/* Overlays */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                            {/* AI Speaking indicator border */}
                            <AnimatePresence>
                                {(aiTyping || !isInputEnabled) && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 border-4 border-primary/40 shadow-[inset_0_0_50px_rgba(0,242,254,0.3)] pointer-events-none"
                                    />
                                )}
                            </AnimatePresence>

                            {/* Media Controls */}
                            <div className="absolute top-4 right-4 flex gap-2">
                                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Live</span>
                                </div>

                                <button
                                    onClick={toggleVideo}
                                    title={isVideoEnabled ? "Disable Camera" : "Enable Camera"}
                                    className={`flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border transition-all ${isVideoEnabled ? 'border-primary/50 text-primary hover:bg-primary/10' : 'border-red-500/50 text-red-500 hover:bg-red-500/10'}`}
                                >
                                    {isVideoEnabled ? <Camera size={12} /> : <VideoOff size={12} />}
                                    <span className="text-[10px] font-black uppercase tracking-widest">{isVideoEnabled ? 'Cam ON' : 'Cam OFF'}</span>
                                </button>

                                <button
                                    onClick={toggleMic}
                                    title={isMicEnabled ? "Mute Microphone" : "Unmute Microphone"}
                                    className={`flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border transition-all ${isMicEnabled ? 'border-white/20 text-white hover:bg-white/5' : 'border-red-500/50 text-red-500 hover:bg-red-500/10'}`}
                                >
                                    {isMicEnabled ? <Mic size={12} /> : <MicOff size={12} />}
                                    <span className="text-[10px] font-black uppercase tracking-widest">{isMicEnabled ? 'Mic ON' : 'Mic OFF'}</span>
                                </button>
                            </div>

                            {/* Confidence Signal Live */}
                            <div className="absolute top-4 left-4">
                                <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex flex-col">
                                    <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">Confidence Signal (Live)</span>
                                    <span className={`text-xs font-black uppercase tracking-widest ${liveConfidence === 'High' ? 'text-green-500' :
                                        liveConfidence === 'Medium' ? 'text-yellow-500' : 'text-orange-500'
                                        }`}>{liveConfidence}</span>
                                </div>
                            </div>

                            {/* Status label at bottom */}
                            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Live AI Video Interview (Simulated)</span>
                                    <div className="flex items-center gap-2">
                                        {aiTyping || !isInputEnabled ? (
                                            <>
                                                <Zap className="text-primary animate-pulse" size={14} />
                                                <span className="text-xs font-black uppercase tracking-widest text-primary">AI Speaking...</span>
                                            </>
                                        ) : isListening ? (
                                            <>
                                                <Mic className="text-red-500 animate-bounce" size={14} />
                                                <span className="text-xs font-black uppercase tracking-widest text-red-500">Listening...</span>
                                            </>
                                        ) : (
                                            <span className="text-xs font-black uppercase tracking-widest text-white/40">Waiting for response</span>
                                        )}
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {microFeedback && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="bg-primary/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-white/20"
                                        >
                                            <span className="text-xs font-black text-background uppercase tracking-widest">{microFeedback}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
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
                                        className={`p-2 rounded-lg transition-colors ${interviewMode !== 'text' ? 'bg-primary/20 text-primary' : 'bg-gray-800 text-gray-500 hover:text-gray-300'}`}
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
                                                onClick={() => { setInterviewMode('text'); stopListening(); }}
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
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="text-[10px] uppercase font-bold text-primary tracking-[0.2em]"
                                        >
                                            {thinkingMessage || "Initializing analysis..."}
                                        </motion.p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                animate={{ scale: i === cognitiveStep ? [1, 1.5, 1] : 1, opacity: i === cognitiveStep ? 1 : 0.4 }}
                                                className={`w-1.5 h-1.5 rounded-full ${i <= cognitiveStep ? 'bg-primary' : 'bg-white/10'}`}
                                            />
                                        ))}
                                    </div>
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

            {/* Input & Controls Section */}
            <div className="mt-auto pb-8 space-y-8">
                {/* Large Mode Switchers */}
                <div className="flex justify-center items-center gap-12 py-4 border-t border-white/5 h-32">
                    <ActionSphere
                        icon={FileText}
                        label="Text"
                        isActive={interviewMode === 'text'}
                        onClick={() => setInterviewMode('text')}
                        disabled={submitting || aiTyping}
                    />
                    <ActionSphere
                        icon={Mic}
                        label="Voice"
                        isActive={interviewMode === 'voice'}
                        isPulse={isListening}
                        onClick={() => {
                            setInterviewMode('voice');
                            if (interviewMode === 'voice') toggleListening();
                        }}
                        disabled={submitting || aiTyping}
                        color="secondary"
                    />
                    <ActionSphere
                        icon={Video}
                        label="Video"
                        isActive={interviewMode === 'video'}
                        onClick={() => {
                            setInterviewMode('video');
                            if (interviewMode === 'video' && !isListening) startListening();
                        }}
                        disabled={submitting || aiTyping}
                        color="primary"
                    />
                </div>

                <AnimatePresence mode="wait">
                    {interviewMode === 'text' ? (
                        <motion.div
                            key="text-input"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`relative transition-all duration-300 rounded-[2rem] bg-surface border border-gray-800 focus-within:ring-2 focus-within:ring-primary/30 overflow-hidden ${aiTyping || !isInputEnabled ? 'opacity-50 grayscale pointer-events-none' : ''}`}
                        >
                            <textarea
                                value={answerText}
                                onChange={handleTextChange}
                                placeholder="Neural input ready. Articulate your response..."
                                className="w-full bg-transparent border-none rounded-[2rem] p-8 pr-24 h-32 resize-none focus:ring-0 focus:outline-none text-lg leading-relaxed placeholder:text-neutral-700"
                            />
                            <div className="absolute bottom-6 right-6">
                                <PhysicsButton
                                    onClick={submitAnswer}
                                    disabled={submitting || !answerText.trim() || !isInputEnabled}
                                    className="bg-primary text-background w-14 h-14 rounded-2xl flex items-center justify-center disabled:opacity-50 transition-all shadow-xl shadow-primary/20"
                                >
                                    <Send size={24} />
                                </PhysicsButton>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="voice-input"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="flex flex-col items-center justify-center py-4 space-y-4"
                        >
                            <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/5">
                                <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-neutral-600'}`} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                                    {isListening ? 'Neural Capture Active' : 'System Ready for Sync'}
                                </span>
                            </div>

                            {/* Send button for Voice/Video when text is present */}
                            {(answerText || interimTranscript) && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <PhysicsButton
                                        onClick={submitAnswer}
                                        className="bg-primary text-background px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center gap-2"
                                    >
                                        Finalize & Send <Send size={18} />
                                    </PhysicsButton>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Document Sync — Live (Section 4, Item 11) - Repositioned to Right Column */}
            <div className={`fixed top-64 right-4 lg:right-8 z-50 transition-all duration-500 ${isSyncCollapsed ? 'w-16' : 'w-80'} pointer-events-auto`}>
                {/* Neural Connection Line (Visual Monitoring Link) */}
                {!isSyncCollapsed && (
                    <div className="absolute top-1/2 -left-32 w-32 h-[1px] pointer-events-none hidden xl:block">
                        <svg width="128" height="2" className="overflow-visible">
                            <motion.line
                                x1="0" y1="1" x2="128" y2="1"
                                stroke="rgba(0, 242, 254, 0.2)"
                                strokeWidth="1"
                                strokeDasharray="4 4"
                            />
                            <motion.circle
                                r="2"
                                fill="#00f2fe"
                                animate={{
                                    cx: [128, 0, 128],
                                    opacity: [0, 1, 0]
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            />
                        </svg>
                    </div>
                )}

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onMouseEnter={() => setIsSyncCollapsed(false)}
                    onClick={() => isSyncCollapsed && setIsSyncCollapsed(false)}
                    className={`glass-dark border border-white/10 p-5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group transition-all duration-300 cursor-pointer ${isSyncCollapsed ? 'h-52 px-2' : ''}`}
                >
                    {/* Visual Glow Effect */}
                    {syncStatus !== 'idle' && (
                        <motion.div
                            animate={{
                                opacity: [0.05, 0.15, 0.05],
                                scale: [1, 1.05, 1]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className={`absolute inset-0 blur-2xl -z-10 ${syncStatus === 'consistent' ? 'bg-green-500' :
                                syncStatus === 'minor' ? 'bg-yellow-500' :
                                    syncStatus === 'mismatch' ? 'bg-red-500' : 'bg-primary'
                                }`}
                        />
                    )}

                    <div className={`flex flex-col items-center gap-4 ${isSyncCollapsed ? '' : 'hidden'}`}>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-colors ${syncStatus === 'consistent' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                            syncStatus === 'minor' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                                syncStatus === 'mismatch' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                    'bg-primary/10 border-primary/20 text-primary'
                            }`}>
                            {syncStatus === 'checking' ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                        </div>
                        <div className="h-20 w-[1px] bg-white/5 relative">
                            {syncStatus === 'consistent' && <div className="absolute top-0 left-0 w-full h-full bg-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.3)]" />}
                        </div>
                        <button onClick={() => setIsSyncCollapsed(false)} className="text-neutral-600 hover:text-white transition-colors">
                            <ArrowRight size={14} className="rotate-180" />
                        </button>
                    </div>

                    <div className={`${isSyncCollapsed ? 'hidden' : 'block'}`}>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-colors ${syncStatus === 'consistent' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                    syncStatus === 'minor' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                                        syncStatus === 'mismatch' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                            'bg-primary/10 border-primary/20 text-primary'
                                    }`}>
                                    {syncStatus === 'checking' ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : syncStatus === 'mismatch' ? (
                                        <ShieldCheck size={20} />
                                    ) : (
                                        <FileCheck size={20} />
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-white leading-none mb-1">Document Sync</h4>
                                    <p className="text-[8px] font-bold text-neutral-500 uppercase tracking-tight">Active Verifier</p>
                                </div>
                            </div>
                            <button onClick={() => setIsSyncCollapsed(true)} className="lg:hidden text-neutral-600">
                                <ArrowRight size={14} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] text-neutral-400 leading-relaxed font-medium">
                                {syncDocument
                                    ? "Silently verifying your answers against official documents..."
                                    : "Neural context missing. Link your application/SOP to start monitoring."}
                            </p>

                            {!syncDocument ? (
                                <button
                                    onClick={() => {
                                        const doc = prompt("Neural Matrix Initialization: Paste Document Text (SOP, CV, or Letter):");
                                        if (doc) {
                                            setSyncDocument(doc);
                                            setSyncStatus("consistent");
                                        }
                                    }}
                                    className="w-full py-3 bg-primary text-background rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-all flex items-center justify-center gap-2"
                                >
                                    <Link size={14} /> Link Records
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${syncStatus === 'consistent' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' :
                                            syncStatus === 'minor' ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' :
                                                syncStatus === 'mismatch' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                                                    'bg-neutral-600 animate-pulse'
                                            }`} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${syncStatus === 'consistent' ? 'text-green-400' :
                                            syncStatus === 'minor' ? 'text-yellow-500' :
                                                syncStatus === 'mismatch' ? 'text-red-500' : 'text-neutral-500'
                                            }`}>
                                            {syncStatus === 'consistent' ? 'Statements Consistent' :
                                                syncStatus === 'minor' ? 'Minor Flag Detected' :
                                                    syncStatus === 'mismatch' ? 'Critical Mismatch' :
                                                        'Cross-Referencing...'}
                                        </span>
                                    </div>

                                    <AnimatePresence>
                                        {mismatchReason && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="p-3 rounded-xl border border-white/5 bg-white/5"
                                            >
                                                <p className="text-[9px] text-neutral-300 leading-normal italic">
                                                    {mismatchReason}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        {/* UX Copy Tooltip overlay on hover */}
                        <div className="absolute inset-0 bg-background/95 backdrop-blur-md p-6 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-center pointer-events-none">
                            <div className="flex items-center gap-2 mb-3">
                                <Brain size={16} className="text-primary" />
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Logic Hub</span>
                            </div>
                            <p className="text-[10px] text-neutral-400 leading-relaxed italic">
                                “This assistant silently verifies your answers against uploaded documents — just like a real visa officer.”
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            <ConfirmationModal
                isOpen={isEndModalOpen}
                onClose={() => setIsEndModalOpen(false)}
                onConfirm={() => generateSummary("ended_by_user")}
                title="TERMINATE PROTOCOL?"
                message="Ending the interview now will finalize your results up to this point. You will not be able to resume this specific logic chain later."
                confirmText="END SESSION"
                type="danger"
            />
        </div>
    );
};

export default Interview;

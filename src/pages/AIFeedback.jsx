
import { useEffect, useState } from "react";
import api from "../services/api";
import AIFeedbackMascot from "../components/AIFeedbackMascot";
import "./AIFeedback.css";

function AIFeedback() {
    const [sessions, setSessions] = useState([]);
    const [students, setStudents] = useState([]);
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [mascotMood, setMascotMood] = useState("idle");
    const [mascotMessage, setMascotMessage] = useState(
        "Hi! Share your experience, and let's learn together."
    );

    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [voiceSupported, setVoiceSupported] = useState(false);

    const [form, setForm] = useState({
        sessionId: "",
        studentId: "",
        reflection: "",
        challenges: "",
        learningOutcome: ""
    });

    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        setVoiceSupported(Boolean(SpeechRecognition));
        loadData();

        return () => {
            window.speechSynthesis?.cancel();
        };
    }, []);

    const loadData = async () => {
        try {
            const [sessionResponse, studentResponse] = await Promise.all([
                api.get("/sessions"),
                api.get("/students")
            ]);

            setSessions(sessionResponse.data.sessions || []);
            setStudents(studentResponse.data.students || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load sessions and students."
            );
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previousForm) => ({
            ...previousForm,
            [name]: value
        }));

        setFeedback(null);
        setError("");
    };

    const selectedSession = sessions.find(
        (session) => session._id === form.sessionId
    );

    const allowedStudents = selectedSession
        ? students.filter((student) => {
              const driverId =
                  selectedSession.driver?._id || selectedSession.driver;

              const navigatorId =
                  selectedSession.navigator?._id ||
                  selectedSession.navigator;

              return (
                  student._id === driverId ||
                  student._id === navigatorId
              );
          })
        : [];

    const handleSessionChange = (event) => {
        setForm((previousForm) => ({
            ...previousForm,
            sessionId: event.target.value,
            studentId: ""
        }));

        setFeedback(null);
        setError("");
    };

    const speakFeedback = (text) => {
        if (!("speechSynthesis" in window)) {
            setError("Speech synthesis is not supported in this browser.");
            return;
        }

        if (!text) {
            setError("There is no feedback to read.");
            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        utterance.lang = "en-IN";
        utterance.rate = 0.95;
        utterance.pitch = 1.15;

        utterance.onstart = () => {
            setIsSpeaking(true);
            setMascotMood("speaking");
            setMascotMessage("I'm excited to share your feedback!");
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            setMascotMood("idle");
            setMascotMessage(
                "Wonderful effort! What will you try in your next session?"
            );
        };

        utterance.onerror = () => {
            setIsSpeaking(false);
            setMascotMood("idle");
            setMascotMessage("You can read your feedback on the screen.");
        };

        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        window.speechSynthesis?.cancel();
        setIsSpeaking(false);
        setMascotMood("idle");
        setMascotMessage("Ready when you are!");
    };

    const startListening = () => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError(
                "Speech recognition is not supported in this browser. Please type your answer."
            );
            return;
        }

        if (isListening) {
            return;
        }

        window.speechSynthesis?.cancel();
        setIsSpeaking(false);

        const recognition = new SpeechRecognition();

        recognition.lang = "en-IN";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
            setMascotMood("listening");
            setMascotMessage("I'm listening. Tell me what you learned!");
            setError("");
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;

            setForm((previousForm) => ({
                ...previousForm,
                reflection: previousForm.reflection
                    ? `${previousForm.reflection} ${transcript}`
                    : transcript
            }));

            setFeedback(null);
        };

        recognition.onerror = () => {
            setError(
                "I couldn't recognize your speech. Please try again or type your answer."
            );
        };

        recognition.onend = () => {
            setIsListening(false);
            setMascotMood("idle");
            setMascotMessage("Thank you! You can review your answer.");
        };

        try {
            recognition.start();
        } catch {
            setIsListening(false);
            setMascotMood("idle");
            setError("Unable to start the microphone. Please try again.");
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);
        setError("");
        setFeedback(null);

        window.speechSynthesis?.cancel();
        setIsSpeaking(false);
        setMascotMood("thinking");
        setMascotMessage("Hmm... I'm analyzing your pair programming session!");

        try {
            const response = await api.post("/feedback/analyze", form);

            setFeedback(response.data.feedback);

            setMascotMood("excited");
            setMascotMessage(
                "Wonderful effort! I've analyzed your session. Let's learn from your experience!"
            );
        } catch (err) {
            setMascotMood("idle");
            setMascotMessage(
                "Don't worry! Let's check what went wrong and try again."
            );

            setError(
                err.response?.data?.message ||
                "Unable to generate AI feedback. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-feedback-page">
            <div className="container py-5">
                <div className="text-center mb-5">
                    <h1 className="fw-bold">AI Pair Programming Mentor</h1>

                    <p className="text-muted">
                        Reflect on your session and receive personalized
                        feedback from your AI mentor.
                    </p>
                </div>

                <div className="row g-4">
                    <div className="col-lg-6">
                        <div className="card feedback-card h-100">
                            <div className="card-body p-4">
                                <h4 className="mb-4">
                                    Share Your Experience
                                </h4>

                                {error && (
                                    <div
                                        className="alert alert-danger"
                                        role="alert"
                                    >
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Pair Programming Session
                                        </label>

                                        <select
                                            className="form-select"
                                            name="sessionId"
                                            value={form.sessionId}
                                            onChange={handleSessionChange}
                                            required
                                        >
                                            <option value="">
                                                Select a session
                                            </option>

                                            {sessions.map((session) => (
                                                <option
                                                    key={session._id}
                                                    value={session._id}
                                                >
                                                    {session.problemTitle}
                                                    {" - "}
                                                    {session.topic}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">
                                            Your Name
                                        </label>

                                        <select
                                            className="form-select"
                                            name="studentId"
                                            value={form.studentId}
                                            onChange={handleChange}
                                            required
                                            disabled={!form.sessionId}
                                        >
                                            <option value="">
                                                Select your name
                                            </option>

                                            {allowedStudents.map((student) => (
                                                <option
                                                    key={student._id}
                                                    value={student._id}
                                                >
                                                    {student.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">
                                            What went well?
                                        </label>

                                        <textarea
                                            className="form-control"
                                            name="reflection"
                                            rows="3"
                                            value={form.reflection}
                                            onChange={handleChange}
                                            placeholder="Describe how you worked together..."
                                            required
                                        />

                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm mt-2"
                                            onClick={startListening}
                                            disabled={
                                                !voiceSupported ||
                                                isListening ||
                                                loading
                                            }
                                        >
                                            {isListening
                                                ? "Listening..."
                                                : "Answer Using Voice"}
                                        </button>

                                        {!voiceSupported && (
                                            <small className="d-block text-muted mt-1">
                                                Speech recognition is not
                                                available in this browser.
                                                You can type your answer.
                                            </small>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">
                                            What challenges did you face?
                                        </label>

                                        <textarea
                                            className="form-control"
                                            name="challenges"
                                            rows="2"
                                            value={form.challenges}
                                            onChange={handleChange}
                                            placeholder="Describe any difficulties..."
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label">
                                            What did you learn?
                                        </label>

                                        <textarea
                                            className="form-control"
                                            name="learningOutcome"
                                            rows="2"
                                            value={form.learningOutcome}
                                            onChange={handleChange}
                                            placeholder="Explain what you learned..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100"
                                        disabled={loading || isListening}
                                    >
                                        {loading
                                            ? "Analyzing Your Session..."
                                            : "Analyze My Session"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="card feedback-card h-100">
                            <div className="card-body p-4">
                                <h4 className="mb-3">Your AI Feedback</h4>

                                <AIFeedbackMascot
                                    mood={
                                        loading ? "thinking" : mascotMood
                                    }
                                    message={
                                        loading
                                            ? "Hmm... I'm analyzing your session!"
                                            : mascotMessage
                                    }
                                />

                                {!feedback && !loading && (
                                    <div className="feedback-empty">
                                        <h5>Your AI mentor is ready!</h5>

                                        <p className="text-muted">
                                            Submit your reflection to receive
                                            personalized feedback about your
                                            collaboration and learning.
                                        </p>
                                    </div>
                                )}

                                {loading && (
                                    <div className="text-center py-4">
                                        <div
                                            className="spinner-border text-primary"
                                            role="status"
                                        >
                                            <span className="visually-hidden">
                                                Loading...
                                            </span>
                                        </div>

                                        <p className="mt-3">
                                            Your AI mentor is thinking...
                                        </p>
                                    </div>
                                )}

                                {feedback && (
                                    <div className="ai-feedback-result">
                                        <div className="feedback-badge mb-3">
                                            AI Mentor Response
                                        </div>

                                        <p className="feedback-message">
                                            {feedback.aiFeedback}
                                        </p>

                                        <div className="d-flex flex-wrap gap-2 mt-4">
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={() =>
                                                    speakFeedback(
                                                        feedback.aiFeedback
                                                    )
                                                }
                                                disabled={isSpeaking}
                                            >
                                                Read Feedback Aloud
                                            </button>

                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={stopSpeaking}
                                                disabled={!isSpeaking}
                                            >
                                                Stop Speaking
                                            </button>
                                        </div>

                                        <hr />

                                        <p className="small text-muted mb-0">
                                            Keep practicing, reflecting, and
                                            learning together.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AIFeedback;

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../services/api";
import "./Sessions.css";

const initialForm = {
    driver: "",
    navigator: "",
    problemTitle: "",
    topic: "",
    duration: 30,
    status: "completed",
    notes: "",
    learningOutcome: ""
};

function Sessions() {
    const [students, setStudents] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [studentResponse, sessionResponse] = await Promise.all([
                api.get("/students"),
                api.get("/sessions")
            ]);

            setStudents(studentResponse.data.students || []);
            setSessions(sessionResponse.data.sessions || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load students and sessions"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (form.driver === form.navigator) {
            setError("Driver and Navigator must be different students.");
            return;
        }

        setSaving(true);

        try {
            await api.post("/sessions", {
                ...form,
                duration: Number(form.duration)
            });

            setSuccess("Pair programming session saved successfully.");
            setForm(initialForm);

            await fetchData();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save the session"
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="sessions-page min-vh-100">
            <div className="container py-5">
                <motion.div
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4"
                >
                    <h2 className="fw-bold">Pair Programming Sessions</h2>
                    <p className="text-muted">
                        Record collaboration, practice time, and learning outcomes.
                    </p>
                </motion.div>

                {error && (
                    <div className="alert alert-danger">{error}</div>
                )}

                {success && (
                    <div className="alert alert-success">{success}</div>
                )}

                <div className="card border-0 shadow-sm rounded-4 mb-5">
                    <div className="card-body p-4 p-md-5">
                        <h5 className="fw-bold mb-4">Record a Session</h5>

                        {students.length < 2 && !loading && (
                            <div className="alert alert-warning">
                                Add at least two students before creating a session.
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Driver</label>
                                    <select
                                        name="driver"
                                        className="form-select"
                                        value={form.driver}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Driver</option>
                                        {students.map((student) => (
                                            <option
                                                key={student._id}
                                                value={student._id}
                                            >
                                                {student.name} ({student.studentId})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Navigator</label>
                                    <select
                                        name="navigator"
                                        className="form-select"
                                        value={form.navigator}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Navigator</option>
                                        {students
                                            .filter((student) => student._id !== form.driver)
                                            .map((student) => (
                                                <option
                                                    key={student._id}
                                                    value={student._id}
                                                >
                                                    {student.name} ({student.studentId})
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Problem Title</label>
                                    <input
                                        name="problemTitle"
                                        className="form-control"
                                        placeholder="e.g. Reverse a String"
                                        value={form.problemTitle}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Topic</label>
                                    <input
                                        name="topic"
                                        className="form-control"
                                        placeholder="e.g. JavaScript"
                                        value={form.topic}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Duration (minutes)</label>
                                    <input
                                        name="duration"
                                        type="number"
                                        min="1"
                                        className="form-control"
                                        value={form.duration}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Status</label>
                                    <select
                                        name="status"
                                        className="form-select"
                                        value={form.status}
                                        onChange={handleChange}
                                    >
                                        <option value="planned">Planned</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>

                                <div className="col-12">
                                    <label className="form-label">Session Notes</label>
                                    <textarea
                                        name="notes"
                                        className="form-control"
                                        rows="3"
                                        placeholder="What did the pair work on?"
                                        value={form.notes}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label">Learning Outcome</label>
                                    <textarea
                                        name="learningOutcome"
                                        className="form-control"
                                        rows="3"
                                        placeholder="What did the students learn?"
                                        value={form.learningOutcome}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-12">
                                    <button
                                        type="submit"
                                        className="btn btn-primary px-4"
                                        disabled={saving || students.length < 2}
                                    >
                                        {saving ? "Saving..." : "Save Session"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold">Session History</h5>
                    <span className="badge bg-primary">
                        {sessions.length} Sessions
                    </span>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" />
                        <p className="mt-3">Loading sessions...</p>
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="alert alert-info">
                        No sessions recorded yet.
                    </div>
                ) : (
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th>Driver</th>
                                        <th>Navigator</th>
                                        <th>Problem</th>
                                        <th>Topic</th>
                                        <th>Duration</th>
                                        <th>Status</th>
                                        <th>Learning Outcome</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessions.map((session) => (
                                        <tr key={session._id}>
                                            <td>{session.driver?.name || "Unknown"}</td>
                                            <td>{session.navigator?.name || "Unknown"}</td>
                                            <td>{session.problemTitle}</td>
                                            <td>{session.topic || "—"}</td>
                                            <td>{session.duration} min</td>
                                            <td>
                                                <span className={`badge ${
                                                    session.status === "completed"
                                                        ? "bg-success"
                                                        : session.status === "in-progress"
                                                            ? "bg-warning text-dark"
                                                            : "bg-secondary"
                                                }`}>
                                                    {session.status}
                                                </span>
                                            </td>
                                            <td>{session.learningOutcome || "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Sessions;
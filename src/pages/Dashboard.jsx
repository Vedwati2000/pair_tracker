import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import api from "../services/api";
import StatCard from "../components/StatCard";
import SessionChart from "../components/SessionChart";

import "./Dashboard.css";

function Dashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await api.get("/dashboard/stats");

                setDashboard(response.data);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load dashboard statistics"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" />
                <p className="mt-3">Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger">{error}</div>
            </div>
        );
    }

    const {
        stats,
        recentSessions = [],
        dailyActivity = [],
        topicActivity = []
    } = dashboard;

    return (
        <div className="dashboard-page min-vh-100">
            <div className="container py-4">

                <motion.div
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4"
                >
                    <h2 className="fw-bold">Pair Programming Dashboard</h2>
                    <p className="text-muted">
                        Track student collaboration and learning progress.
                    </p>
                </motion.div>

                <div className="row">
                    <StatCard
                        title="Active Students"
                        value={stats.totalStudents}
                        subtitle="Currently active students"
                    />

                    <StatCard
                        title="Total Sessions"
                        value={stats.totalSessions}
                        subtitle="Recorded pair programming sessions"
                    />

                    <StatCard
                        title="Completed Sessions"
                        value={stats.completedSessions}
                        subtitle="Successfully completed sessions"
                    />

                    <StatCard
                        title="Practice Time"
                        value={`${stats.totalMinutes} min`}
                        subtitle="Total completed programming minutes"
                    />
                </div>

                <div className="row g-4 mt-1">
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm rounded-4 h-100">
                            <div className="card-body p-4">
                                <h5 className="fw-bold mb-4">
                                    Daily Session Activity
                                </h5>

                                <SessionChart activity={dailyActivity} />
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm rounded-4 h-100">
                            <div className="card-body p-4">
                                <h5 className="fw-bold mb-4">
                                    Popular Topics
                                </h5>

                                {topicActivity.length === 0 ? (
                                    <p className="text-muted">
                                        No topic activity available.
                                    </p>
                                ) : (
                                    topicActivity.map((topic) => (
                                        <div
                                            key={topic._id}
                                            className="d-flex justify-content-between border-bottom py-3"
                                        >
                                            <span>{topic._id}</span>

                                            <span className="badge bg-primary">
                                                {topic.sessions} sessions
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card border-0 shadow-sm rounded-4 mt-4">
                    <div className="card-body p-4">
                        <h5 className="fw-bold mb-4">Recent Sessions</h5>

                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead>
                                    <tr>
                                        <th>Driver</th>
                                        <th>Navigator</th>
                                        <th>Problem</th>
                                        <th>Duration</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {recentSessions.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="text-center text-muted py-4"
                                            >
                                                No sessions recorded yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentSessions.map((session) => (
                                            <tr key={session._id}>
                                                <td>
                                                    {session.driver?.name || "Unknown"}
                                                </td>

                                                <td>
                                                    {session.navigator?.name || "Unknown"}
                                                </td>

                                                <td>{session.problemTitle}</td>

                                                <td>{session.duration} min</td>

                                                <td>
                                                    <span className={`badge ${
                                                        session.status === "completed"
                                                            ? "bg-success"
                                                            : "bg-warning text-dark"
                                                    }`}>
                                                        {session.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Dashboard;
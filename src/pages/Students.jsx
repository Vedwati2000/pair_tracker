import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../services/api";
import "./Students.css";

const emptyForm = {
    name: "",
    studentId: "",
    email: "",
    skills: ""
};

function Students() {
    const [students, setStudents] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchStudents = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/students");

            setStudents(response.data.students || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to fetch students"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSaving(true);
        setError("");
        setSuccess("");

        const studentData = {
            name: form.name.trim(),
            studentId: form.studentId.trim(),
            email: form.email.trim(),
            skills: form.skills
                .split(",")
                .map((skill) => skill.trim())
                .filter(Boolean)
        };

        try {
            if (editId) {
                await api.put(`/students/${editId}`, studentData);
                setSuccess("Student updated successfully");
            } else {
                await api.post("/students", studentData);
                setSuccess("Student added successfully");
            }

            resetForm();
            await fetchStudents();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save student"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (student) => {
        setEditId(student._id);

        setForm({
            name: student.name || "",
            studentId: student.studentId || "",
            email: student.email || "",
            skills: (student.skills || []).join(", ")
        });

        setError("");
        setSuccess("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this student?"
        );

        if (!confirmed) return;

        try {
            setError("");
            setSuccess("");

            await api.delete(`/students/${id}`);

            setSuccess("Student deleted successfully");

            if (editId === id) {
                resetForm();
            }

            await fetchStudents();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete student"
            );
        }
    };

    return (
        <div className="students-page min-vh-100">
            <div className="container py-5">

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4"
                >
                    <h2 className="fw-bold">
                        Student Management
                    </h2>

                    <p className="text-muted">
                        Manage students participating in pair programming.
                    </p>
                </motion.div>

                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        {success}
                    </div>
                )}

                <div className="card border-0 shadow-sm rounded-4 mb-5">
                    <div className="card-body p-4">

                        <h5 className="fw-bold mb-4">
                            {editId ? "Edit Student" : "Add New Student"}
                        </h5>

                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Full Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        className="form-control"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Student ID
                                    </label>

                                    <input
                                        type="text"
                                        name="studentId"
                                        className="form-control"
                                        value={form.studentId}
                                        onChange={handleChange}
                                        required
                                        disabled={Boolean(editId)}
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Skills (comma separated)
                                    </label>

                                    <input
                                        type="text"
                                        name="skills"
                                        className="form-control"
                                        placeholder="JavaScript, React, MongoDB"
                                        value={form.skills}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-12 d-flex gap-2">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={saving}
                                    >
                                        {saving
                                            ? "Saving..."
                                            : editId
                                                ? "Update Student"
                                                : "Add Student"}
                                    </button>

                                    {editId && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={resetForm}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>

                            </div>
                        </form>
                    </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">
                        Registered Students
                    </h5>

                    <span className="badge bg-primary">
                        {students.length} Students
                    </span>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" />
                        <p className="mt-3">Loading students...</p>
                    </div>
                ) : students.length === 0 ? (
                    <div className="alert alert-info">
                        No students found. Add your first student above.
                    </div>
                ) : (
                    <div className="row g-4">
                        {students.map((student) => (
                            <motion.div
                                key={student._id}
                                className="col-md-6 col-lg-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -5 }}
                            >
                                <div className="card student-card h-100 border-0 shadow-sm">
                                    <div className="card-body p-4">

                                        <div className="student-avatar mb-3">
                                            {student.name?.charAt(0).toUpperCase()}
                                        </div>

                                        <h5 className="fw-bold">
                                            {student.name}
                                        </h5>

                                        <p className="text-muted small mb-2">
                                            {student.studentId}
                                        </p>

                                        <p className="mb-3">
                                            {student.email}
                                        </p>

                                        <div className="mb-4">
                                            {(student.skills || []).map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="badge bg-light text-primary border me-2 mb-2"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="d-flex gap-2">
                                            <button
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() => handleEdit(student)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => handleDelete(student._id)}
                                            >
                                                Delete
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}

export default Students;
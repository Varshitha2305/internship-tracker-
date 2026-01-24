"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Applied");
  const [applications, setApplications] = useState([]);

  const fetchApplications = async () => {
    const res = await fetch("http://localhost:5000/applications");
    const data = await res.json();
    setApplications(data);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("http://localhost:5000/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company, role, status }),
    });
    setCompany("");
    setRole("");
    setStatus("Applied");
    fetchApplications();
  };

  const updateStatus = async (id, newStatus) => {
    await fetch(`http://localhost:5000/applications/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchApplications();
  };

  return (
    <main style={styles.page}>
      <h1 style={styles.title}>Internship Application Tracker</h1>
      <p style={styles.subtitle}>
        Track, update, and manage your internship applications professionally
      </p>

      {/* FORM CARD */}
      <div style={styles.card}>
        <h3>Add New Application</h3>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            placeholder="Company Name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />
          <input
            style={styles.input}
            placeholder="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
          <select
            style={styles.input}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>Applied</option>
            <option>Interview</option>
            <option>Rejected</option>
          </select>
          <button style={styles.button}>Add Application</button>
        </form>
      </div>

      {/* LIST CARD */}
      <div style={styles.card}>
        <h3>My Applications</h3>

        {applications.length === 0 ? (
          <p style={{ color: "#666" }}>No applications added yet.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id}>
                  <td>{app.company}</td>
                  <td>{app.role}</td>
                  <td>
                    <select
                      value={app.status}
                      onChange={(e) =>
                        updateStatus(app._id, e.target.value)
                      }
                      style={{
                        ...styles.status,
                        backgroundColor:
                          app.status === "Applied"
                            ? "#e3f2fd"
                            : app.status === "Interview"
                            ? "#fff3e0"
                            : "#fdecea",
                      }}
                    >
                      <option>Applied</option>
                      <option>Interview</option>
                      <option>Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

const styles = {
  page: {
    background: "#f4f6f8",
    minHeight: "100vh",
    padding: "40px",
    fontFamily: "Segoe UI, sans-serif",
  },
  title: {
    textAlign: "center",
    color: "#0a2540",
    marginBottom: "5px",
  },
  subtitle: {
    textAlign: "center",
    color: "#555",
    marginBottom: "30px",
  },
  card: {
    background: "#fff",
    padding: "20px",
    marginBottom: "25px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    maxWidth: "800px",
    marginInline: "auto",
  },
  form: {
    display: "grid",
    gap: "12px",
  },
  input: {
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    background: "#0a2540",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  status: {
    padding: "6px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
};

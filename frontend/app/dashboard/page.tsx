"use client";

import { useEffect, useState } from "react";
import {
    LayoutDashboard,
    PlusCircle,
    Briefcase,
    Building2,
    Clock,
    XCircle,
    Loader2,
    Search,
    AlertCircle,
    Trash2,
    FileText,
    Zap,
    User,
    Calendar,
    LinkIcon
} from "lucide-react";

/* ---------------- CONFIG ---------------- */

const API_BASE_URL = "http://localhost:5000/applications";

/* ---------------- STATUS CONFIG ---------------- */

const statusConfig: any = {
    Applied: {
        color: "bg-blue-500/10 text-blue-600 border-blue-200",
        icon: Clock,
        label: "Applied"
    },
    Interview: {
        color: "bg-purple-500/10 text-purple-600 border-purple-200",
        icon: CalendarIcon,
        label: "Interview"
    },
    Rejected: {
        color: "bg-red-500/10 text-red-600 border-red-200",
        icon: XCircle,
        label: "Rejected"
    }
};

/* ---------------- ICON ---------------- */

function CalendarIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    );
}

/* ---------------- MAIN PAGE ---------------- */

export default function Dashboard() {
    const [user, setUser] = useState<any>(null); // Add user state
    const [company, setCompany] = useState("");
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("Applied");
    const [professionalSummary, setProfessionalSummary] = useState("");
    const [primarySkills, setPrimarySkills] = useState("");
    const [experienceLevel, setExperienceLevel] = useState("Fresher");
    const [currentRole, setCurrentRole] = useState("");
    const [interviewDateTime, setInterviewDateTime] = useState("");
    const [meetingLink, setMeetingLink] = useState("");
    const [applications, setApplications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState("All"); // 1. Filter state

    const fetchUser = async () => {
        try {
            console.log("Fetching user...");
            const res = await fetch("http://localhost:5000/auth/user", { credentials: "include" });
            console.log("Fetch user response status:", res.status);
            if (res.ok) {
                const data = await res.json();
                console.log("User data received:", data);
                setUser(data);
            } else {
                console.error("Fetch user failed with status:", res.status);
            }
        } catch (err) {
            console.error("Failed to fetch user", err);
        }
    };

    const fetchApplications = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(API_BASE_URL);
            if (!res.ok) throw new Error("Fetch failed");
            setApplications(await res.json());
        } catch {
            setError("Backend not reachable. Is your server running?");
        } finally {
            setIsLoading(false);
        }
    };

    const deleteApplication = async (id: string) => {
        if (!confirm("Are you sure you want to delete this application?")) return;
        try {
            await fetch(`${API_BASE_URL}/${id}`, { method: "DELETE" });
            setApplications(applications.filter((app) => app._id !== id));
        } catch {
            setError("Failed to delete application");
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        // Optimistic update
        setApplications(applications.map(app =>
            app._id === id ? { ...app, status: newStatus } : app
        ));

        try {
            await fetch(`${API_BASE_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
        } catch {
            setError("Failed to update status");
            fetchApplications(); // Revert on error
        }
    };

    useEffect(() => {
        fetchUser(); // Fetch user on mount
        fetchApplications();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch(API_BASE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // Send cookies for auth
                body: JSON.stringify({
                    company,
                    role,
                    status,
                    professionalSummary,
                    primarySkills,
                    experienceLevel,
                    currentRole,
                    interviewDateTime,
                    meetingLink
                })
            });
            setCompany("");
            setRole("");
            setStatus("Applied");
            setProfessionalSummary("");
            setPrimarySkills("");
            setExperienceLevel("Fresher");
            setCurrentRole("");
            setInterviewDateTime("");
            setMeetingLink("");
            fetchApplications();
        } catch {
            setError("Failed to save application");
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 relative">
            {/* BACKGROUND */}
            <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-r from-indigo-600 to-violet-600" />

            <div className="relative max-w-7xl mx-auto px-6 pt-14 pb-20">
                {/* HEADER */}
                <header className="text-white mb-12 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-extrabold flex items-center gap-3">
                            <LayoutDashboard className="h-9 w-9 text-indigo-200" />
                            Job Application Tracker
                        </h1>
                        <p className="text-black mt-2 max-w-xl">
                            Track, organize, and win your journey 🚀
                        </p>
                    </div>

                    {/* USER PROFILE */}
                    {user && (
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                            <span className="font-semibold text-indigo-50">{user.name}</span>
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="h-10 w-10 rounded-full border-2 border-indigo-200"
                                />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-indigo-300 flex items-center justify-center text-indigo-700 font-bold">
                                    {user.name?.charAt(0)}
                                </div>
                            )}
                        </div>
                    )}
                </header>

                {/* ERROR */}
                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex gap-3">
                        <AlertCircle className="text-red-500" />
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* LOADING */}
                {isLoading ? (
                    <div className="flex flex-col items-center py-24 bg-white rounded-3xl shadow-lg">
                        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
                        <p className="text-slate-500 font-medium">Loading applications...</p>
                    </div>
                ) : (
                    <>
                        {/* STATS */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <StatCard title="Applications" value={applications.length} icon={Briefcase} />
                            <StatCard
                                title="Interviews"
                                value={applications.filter(a => a.status === "Interview").length}
                                icon={CalendarIcon}
                            />
                            <StatCard
                                title="Rejected"
                                value={applications.filter(a => a.status === "Rejected").length}
                                icon={XCircle}
                            />
                        </div>

                        <div className="grid lg:grid-cols-12 gap-8">
                            {/* FORM */}
                            <div className="lg:col-span-4">
                                <div className="bg-white rounded-3xl shadow-xl border p-6 sticky top-8">
                                    <h2 className="font-bold text-indigo-700 mb-4 flex gap-2">
                                        <PlusCircle /> Add Application
                                    </h2>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <Input
                                            label="Company"
                                            icon={Building2}
                                            value={company}
                                            onChange={setCompany}
                                        />
                                        <Input
                                            label="Role"
                                            icon={Briefcase}
                                            value={role}
                                            onChange={setRole}
                                        />

                                        <Input
                                            label="Current Role"
                                            icon={User}
                                            value={currentRole}
                                            onChange={setCurrentRole}
                                        />

                                        <Input
                                            label="Primary Skills (comma-separated)"
                                            icon={Zap}
                                            value={primarySkills}
                                            onChange={setPrimarySkills}
                                        />

                                        <select
                                            className="w-full px-4 py-3 rounded-xl border bg-slate-50"
                                            value={experienceLevel}
                                            onChange={(e) => setExperienceLevel(e.target.value)}
                                        >
                                            <option value="Fresher">Fresher</option>
                                            <option value="0-2">0-2 Years</option>
                                            <option value="2-5">2-5 Years</option>
                                            <option value="5+">5+ Years</option>
                                        </select>

                                        <Input
                                            label="Interview Date & Time"
                                            icon={Calendar}
                                            value={interviewDateTime}
                                            onChange={setInterviewDateTime}
                                            type="datetime-local"
                                        />

                                        <Input
                                            label="Meeting Link"
                                            icon={LinkIcon}
                                            value={meetingLink}
                                            onChange={setMeetingLink}
                                            type="url"
                                        />

                                        <div>
                                            <label className="text-xs font-bold text-slate-500">Professional Summary</label>
                                            <div className="relative">
                                                <FileText className="absolute left-3 top-3 text-slate-400 h-5 w-5" />
                                                <textarea
                                                    value={professionalSummary}
                                                    onChange={(e) => setProfessionalSummary(e.target.value)}
                                                    maxLength={300}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                                    rows={3}
                                                />
                                            </div>
                                        </div>

                                        <select
                                            className="w-full px-4 py-3 rounded-xl border bg-slate-50"
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                        >
                                            <option>Applied</option>
                                            <option>Interview</option>
                                            <option>Rejected</option>
                                        </select>

                                        <button className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white py-3 rounded-xl shadow-lg transition">
                                            Save Application
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* LIST */}
                            <div className="lg:col-span-8 space-y-4">
                                {/* FILTER TABS */}
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {["All", "Applied", "Interview", "Rejected"].map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setFilter(f)}
                                            className={`px-4 py-2 rounded-full text-sm font-bold border transition ${filter === f
                                                ? "bg-slate-900 text-white border-slate-900"
                                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                                }`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>

                                {applications
                                    .filter((app) => filter === "All" || app.status === filter) // 3. Filter logic
                                    .length === 0 ? (
                                    <EmptyState
                                        title={filter === "All" ? "No applications yet" : `No ${filter} applications`}
                                        message={filter === "All"
                                            ? "Add your first internship application 🚀"
                                            : `You don't have any applications with the status "${filter}".`
                                        }
                                    />
                                ) : (
                                    applications
                                        .filter((app) => filter === "All" || app.status === filter)
                                        .map(app => {
                                            const style = statusConfig[app.status] || statusConfig["Applied"];
                                            const Icon = style ? style.icon : Clock;
                                            return (
                                                <div
                                                    key={app._id}
                                                    className="bg-white p-5 rounded-2xl border shadow-sm hover:shadow-lg hover:ring-2 hover:ring-indigo-100 transition flex items-center justify-between group"
                                                >
                                                    <div>
                                                        <h3 className="font-bold text-lg text-slate-900">{app.company}</h3>
                                                        <p className="text-slate-500 text-sm font-medium">{app.role}</p>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        {/* STATUS DROPDOWN */}
                                                        <div className="relative">
                                                            <select
                                                                value={app.status}
                                                                onChange={(e) => updateStatus(app._id, e.target.value)}
                                                                className={`appearance-none pl-9 pr-8 py-1.5 rounded-full text-sm font-bold border cursor-pointer focus:ring-2 focus:ring-offset-1 focus:outline-none ${style.color}`}
                                                            >
                                                                <option value="Applied">Applied</option>
                                                                <option value="Interview">Interview</option>
                                                                <option value="Rejected">Rejected</option>
                                                            </select>
                                                            <Icon className={`absolute left-3 top-2 h-4 w-4 pointer-events-none ${style.text}`} />
                                                        </div>

                                                        {/* DELETE BUTTON */}
                                                        <button
                                                            onClick={() => deleteApplication(app._id)}
                                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                            title="Delete Application"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                )}
                            </div>
                        </div>
                    </>
                )
                }
            </div >
        </main >
    );
}

/* ---------------- COMPONENTS ---------------- */

function Input({ label, icon: Icon, value, onChange, type = "text", ...props }: any) {
    return (
        <div>
            <label className="text-xs font-bold text-slate-500">{label}</label>
            <div className="relative">
                <Icon className="absolute left-3 top-3 text-slate-400 h-5 w-5" />
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    required
                    {...props}
                />
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon }: any) {
    return (
        <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl shadow-md border hover:shadow-xl transition">
            <p className="text-slate-500 font-semibold">{title}</p>
            <div className="flex justify-between items-center mt-3">
                <p className="text-4xl font-extrabold text-slate-900">{value}</p>
                <Icon className="h-8 w-8 text-indigo-600" />
            </div>
        </div>
    );
}

function EmptyState({ title = "No applications yet", message = "Add your first internship application 🚀" }: any) {
    return (
        <div className="bg-white p-16 rounded-3xl border border-dashed text-center">
            <Search className="mx-auto h-12 w-12 text-indigo-400 mb-4" />
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            <p className="text-slate-500 mt-2">{message}</p>
        </div>
    );
}

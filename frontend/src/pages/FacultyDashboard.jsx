import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchAllStudents, addMarks, addAttendance } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import ThemeSettings from "../components/ThemeSettings";
import { 
  LogOut, Users, BookOpen, ClipboardCheck, 
  CheckCircle, AlertCircle, PlusCircle, Settings, GraduationCap
} from "lucide-react";

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState("students");
  const [successMessage, setSuccessMessage] = useState("");

  const [marksForm, setMarksForm] = useState({ studentId: "", subject: "", internal: "", external: "" });
  const [attendanceForm, setAttendanceForm] = useState({ studentId: "", subject: "", attendancePercentage: "" });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("studentId");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login", { replace: true });

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchAllStudents(token);
        setStudents(data);
      } catch (err) {
        setError(err.message || "Failed to load students");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [navigate]);

  const handleMarksChange = (e) => {
    const { name, value } = e.target;
    setMarksForm(prev => ({ ...prev, [name]: value }));
  };

  const handleMarksSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await addMarks(token, {
        studentId: marksForm.studentId,
        subject: marksForm.subject,
        internal: parseInt(marksForm.internal),
        external: parseInt(marksForm.external)
      });
      setSuccessMessage("Marks added successfully!");
      setMarksForm({ studentId: "", subject: "", internal: "", external: "" });
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleAttendanceChange = (e) => {
    const { name, value } = e.target;
    setAttendanceForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await addAttendance(token, {
        studentId: attendanceForm.studentId,
        subject: attendanceForm.subject,
        attendancePercentage: parseInt(attendanceForm.attendancePercentage)
      });
      setSuccessMessage("Attendance added successfully!");
      setAttendanceForm({ studentId: "", subject: "", attendancePercentage: "" });
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-animated flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-animated font-inter text-slate-100 overflow-hidden">
      
      {/* Sidebar */}
      <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} transition={{ duration: 0.4 }} className="w-72 bg-slate-900/60 backdrop-blur-2xl border-r border-white/10 flex flex-col z-20 shadow-2xl">
        <div className="p-8 border-b border-white/5">
          <h1 className="text-2xl font-outfit font-bold flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 tracking-tight">
            <GraduationCap className="w-8 h-8 text-teal-400" />
            Faculty Portal
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            { id: "students", icon: Users, label: "Students List" },
            { id: "marks", icon: BookOpen, label: "Add Marks" },
            { id: "attendance", icon: ClipboardCheck, label: "Add Attendance" },
            { id: "settings", icon: Settings, label: "Settings" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl font-medium transition-all ${
                activeTab === tab.id 
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-inner" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all border border-red-500/20 group">
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold tracking-wide">LOGOUT</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 z-10 w-full max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h2 className="text-3xl font-outfit font-bold text-white capitalize">
              {activeTab === "students" && "Registered Students"}
              {activeTab === "marks" && "Enter Subject Marks"}
              {activeTab === "attendance" && "Update Class Attendance"}
              {activeTab === "settings" && "Faculty Preferences"}
            </h2>
            <p className="text-slate-400 mt-2">Manage course records effectively.</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div key="err" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
                <AlertCircle className="w-5 h-5" /> {error}
              </motion.div>
            )}
            {successMessage && (
              <motion.div key="succ" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 flex items-center gap-3 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-200">
                <CheckCircle className="w-5 h-5" /> {successMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* Settings Tab */}
            {activeTab === "settings" && (
             <motion.div key="settings" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }} className="glass-card shadow-2xl border border-white/10 p-8 text-slate-300">
               <ThemeSettings />
             </motion.div>
            )}

            {/* Students List Tab */}
            {activeTab === "students" && (
              <motion.div key="students" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }} className="glass-card shadow-2xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto bg-black/20">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 text-slate-300 text-xs uppercase tracking-widest border-b border-white/10">
                        <th className="p-5 font-semibold">Name</th>
                        <th className="p-5 font-semibold">Department</th>
                        <th className="p-5 font-semibold text-center">Semester</th>
                        <th className="p-5 font-semibold text-center">CGPA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {students.length > 0 ? students.map((student) => (
                        <tr key={student._id} className="hover:bg-white/5 transition-colors">
                          <td className="p-5 text-slate-200 font-medium">{student.name}</td>
                          <td className="p-5 text-slate-400">{student.department}</td>
                          <td className="p-5 text-slate-400 text-center">{student.semester}</td>
                          <td className="p-5 text-center">
                            <span className="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full font-bold text-sm shadow-sm">{student.cgpa}</span>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="4" className="p-10 text-center text-slate-500 italic">No students found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Add Marks Tab */}
            {activeTab === "marks" && (
              <motion.div key="marks" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }} className="glass-card border border-white/10 p-8 max-w-2xl mx-auto shadow-2xl">
                <form onSubmit={handleMarksSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Select Student</label>
                    <select name="studentId" value={marksForm.studentId} onChange={handleMarksChange} required className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/50 text-white outline-none [&>option]:bg-slate-900">
                      <option value="">-- Choose a student --</option>
                      {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.department})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Subject Name</label>
                    <input type="text" name="subject" value={marksForm.subject} onChange={handleMarksChange} placeholder="e.g., Data Structures" required className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/50 text-white outline-none placeholder-slate-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Internal Marks (Max 50)</label>
                      <input type="number" name="internal" value={marksForm.internal} onChange={handleMarksChange} min="0" max="50" required className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/50 text-white outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">External Marks (Max 50)</label>
                      <input type="number" name="external" value={marksForm.external} onChange={handleMarksChange} min="0" max="50" required className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/50 text-white outline-none" />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-4 mt-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl font-bold tracking-wide shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-all flex items-center justify-center gap-2 group">
                    <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    Submit Final Marks
                  </button>
                </form>
              </motion.div>
            )}

            {/* Add Attendance Tab */}
            {activeTab === "attendance" && (
              <motion.div key="attendance" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }} className="glass-card border border-white/10 p-8 max-w-2xl mx-auto shadow-2xl">
                <form onSubmit={handleAttendanceSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Select Student</label>
                    <select name="studentId" value={attendanceForm.studentId} onChange={handleAttendanceChange} required className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/50 text-white outline-none [&>option]:bg-slate-900">
                      <option value="">-- Choose a student --</option>
                      {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.department})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Subject Name</label>
                    <input type="text" name="subject" value={attendanceForm.subject} onChange={handleAttendanceChange} placeholder="e.g., Computer Networks" required className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/50 text-white outline-none placeholder-slate-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Attendance Percentage</label>
                    <div className="relative">
                      <input type="number" name="attendancePercentage" value={attendanceForm.attendancePercentage} onChange={handleAttendanceChange} min="0" max="100" placeholder="0-100" required className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/50 text-white outline-none pr-10" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-4 mt-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl font-bold tracking-wide shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-all flex items-center justify-center gap-2 group">
                    <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    Save Attendance Record
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

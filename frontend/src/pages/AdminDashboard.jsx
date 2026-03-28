import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchUsers, createUser, updateUser, deleteUser } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import ThemeSettings from "../components/ThemeSettings";
import { 
  LogOut, Users, UserCog, Search, Plus, Edit2, Trash2, 
  X, AlertCircle, CheckCircle, ShieldAlert, Settings
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [activeTab, setActiveTab] = useState("students");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: "", password: "", firstName: "", lastName: "", department: "", semester: ""
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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
        const role = activeTab === "students" ? "student" : "teacher";
        const data = await fetchUsers(token, role);
        setUsers(data);
        setFilteredUsers(data);
      } catch (err) {
        setError(err.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeTab, navigate]);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.studentId?.name && user.studentId.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        password: "",
        firstName: user.studentId?.name?.split(" ")[0] || "",
        lastName: user.studentId?.name?.split(" ")[1] || "",
        department: user.studentId?.department || "",
        semester: user.studentId?.semester || ""
      });
    } else {
      setEditingUser(null);
      setFormData({ email: "", password: "", firstName: "", lastName: "", department: "", semester: "" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const userData = {
        email: formData.email,
        role: activeTab === "students" ? "student" : "teacher",
        firstName: formData.firstName,
        lastName: formData.lastName,
        department: formData.department,
        semester: formData.semester
      };

      if (formData.password) userData.password = formData.password;

      let resData;
      if (editingUser) {
        if (!formData.password) delete userData.password;
        resData = await updateUser(token, editingUser._id, userData);
        setSuccess("User updated successfully");
        if (resData?.user) {
          setUsers(prev => prev.map(u => (u._id === resData.user._id ? resData.user : u)));
          setFilteredUsers(prev => prev.map(u => (u._id === resData.user._id ? resData.user : u)));
        }
      } else {
        if (!formData.password) { setError("Password is required for new users"); return; }
        resData = await createUser(token, userData);
        setSuccess("User created successfully");
        if (resData?.user) {
          setUsers(prev => [resData.user, ...prev]);
          setFilteredUsers(prev => [resData.user, ...prev]);
        }
      }
      handleCloseModal();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      await deleteUser(token, userId);
      setSuccess("User deleted successfully");
      setUsers(prev => prev.filter(u => u._id !== userId));
      setFilteredUsers(prev => prev.filter(u => u._id !== userId));
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-animated flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-animated font-inter text-slate-100 overflow-hidden">
      
      {/* Sidebar */}
      <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} transition={{ duration: 0.4 }} className="w-72 bg-slate-900/60 backdrop-blur-2xl border-r border-white/10 flex flex-col z-20 shadow-2xl">
        <div className="p-8 border-b border-white/5">
          <h1 className="text-2xl font-outfit font-bold flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">
            <ShieldAlert className="w-8 h-8 text-pink-500" />
            Admin Panel
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button onClick={() => setActiveTab("students")} className={`w-full flex items-center gap-3 p-4 rounded-xl font-medium transition-all ${activeTab === "students" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-inner" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
            <Users className="w-5 h-5" />
            Manage Students
          </button>
          <button onClick={() => setActiveTab("teachers")} className={`w-full flex items-center gap-3 p-4 rounded-xl font-medium transition-all ${activeTab === "teachers" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-inner" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
            <UserCog className="w-5 h-5" />
            Manage Teachers
          </button>
          <button onClick={() => setActiveTab("settings")} className={`w-full flex items-center gap-3 p-4 rounded-xl font-medium transition-all ${activeTab === "settings" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-inner" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
            <Settings className="w-5 h-5" />
            System Settings
          </button>
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
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <h2 className="text-3xl font-outfit font-bold text-white">
              {activeTab === "students" ? "Student Accounts" : activeTab === "teachers" ? "Teacher Accounts" : "System Settings"}
            </h2>
            {activeTab !== "settings" && (
              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-slate-400 outline-none backdrop-blur-sm"
                  />
                </div>
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl font-medium shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-all">
                  <Plus className="w-5 h-5" />
                  Add New
                </button>
              </div>
            )}
          </motion.div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div key="error" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
                <AlertCircle className="w-5 h-5" /> {error}
              </motion.div>
            )}
            {success && (
              <motion.div key="success" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 flex items-center gap-3 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-200">
                <CheckCircle className="w-5 h-5" /> {success}
              </motion.div>
            )}
          </AnimatePresence>

          {activeTab === "settings" ? (
             <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card shadow-2xl border border-white/10 p-8 text-slate-300">
               <ThemeSettings />
             </motion.div>
          ) : (
          <div className="glass-card shadow-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto bg-black/20">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-slate-300 text-xs uppercase tracking-widest border-b border-white/10">
                    <th className="p-5 font-semibold">Email</th>
                    {activeTab === "students" && (
                      <>
                        <th className="p-5 font-semibold">Name</th>
                        <th className="p-5 font-semibold">Department</th>
                        <th className="p-5 font-semibold">Semester</th>
                      </>
                    )}
                    <th className="p-5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                      <motion.tr 
                        key={user._id} 
                        initial={{ opacity: 0, y: 15 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0 }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="p-5 text-slate-200 font-medium">{user.email}</td>
                        {activeTab === "students" && (
                          <>
                            <td className="p-5 text-slate-400">{user.studentId?.name || "-"}</td>
                            <td className="p-5 text-slate-400">{user.studentId?.department || "-"}</td>
                            <td className="p-5 text-slate-400">
                              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold border border-white/5">{user.studentId?.semester || "-"}</span>
                            </td>
                          </>
                        )}
                        <td className="p-5 text-right space-x-3">
                          <button onClick={() => handleOpenModal(user)} className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 border border-indigo-500/30 rounded-lg transition-colors inline-flex items-center gap-2 text-sm font-medium">
                            <Edit2 className="w-4 h-4" /> Edit
                          </button>
                          <button onClick={() => handleDeleteUser(user._id)} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30 rounded-lg transition-colors inline-flex items-center gap-2 text-sm font-medium">
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </td>
                      </motion.tr>
                    )) : (
                      <tr>
                        <td colSpan={activeTab === "students" ? 5 : 2} className="p-10 text-center text-slate-500 italic">
                          No {activeTab} matching your search
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-slate-900 border border-white/10 shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden flex flex-col">
              <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="text-xl font-outfit font-bold text-white flex items-center gap-2">
                  {editingUser ? <Edit2 className="w-5 h-5 text-pink-400"/> : <Plus className="w-5 h-5 text-pink-400"/>}
                  {editingUser ? `Edit ${activeTab === "students" ? "Student" : "Teacher"}` : `Add New ${activeTab === "students" ? "Student" : "Teacher"}`}
                </h3>
                <button onClick={handleCloseModal} className="text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto">
                <form id="user-form" onSubmit={handleSaveUser} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email Address *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleFormChange} required className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-pink-500/50 text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Password {editingUser && <span className="text-slate-500 font-normal italic">(Leave blank to keep current)</span>}</label>
                    <input type="password" name="password" value={formData.password} onChange={handleFormChange} required={!editingUser} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-pink-500/50 text-white outline-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleFormChange} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-pink-500/50 text-white outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleFormChange} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-pink-500/50 text-white outline-none" />
                    </div>
                  </div>

                  {activeTab === "students" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Department</label>
                        <input type="text" name="department" value={formData.department} onChange={handleFormChange} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-pink-500/50 text-white outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Semester</label>
                        <input type="number" name="semester" value={formData.semester} onChange={handleFormChange} min="1" className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-pink-500/50 text-white outline-none" />
                      </div>
                    </div>
                  )}
                </form>
              </div>

              <div className="px-8 py-5 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="px-6 py-2.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button type="submit" form="user-form" className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl font-medium shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-all">
                  {editingUser ? "Save Changes" : "Create Account"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

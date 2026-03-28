import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchFullAnalytics } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import ThemeSettings from "../components/ThemeSettings";
import { 
  LogOut, User, BookOpen, AlertTriangle, Settings, LayoutDashboard,
  TrendingUp, Award, Activity, CheckCircle, XCircle,
  SlidersHorizontal, Target, HelpCircle, Cpu
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [targetSemGPA, setTargetSemGPA] = useState(7.5);
  const [showRiskTooltip, setShowRiskTooltip] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("studentId");
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const studentId = localStorage.getItem("studentId");
    if (!token || !studentId) return navigate("/login", { replace: true });

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchFullAnalytics({ token, studentId });
        setAnalytics(data);
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  const student = analytics?.student ?? {};
  const marks = analytics?.marks ?? [];
  const attendance = analytics?.attendance ?? [];
  const avgMarks = Math.round((analytics?.averageMarks ?? 0) * 100) / 100;
  const baseRiskLevel = analytics?.riskLevel ?? "-";
  const arrearCount = typeof analytics?.arrearCount === "number"
    ? analytics.arrearCount
    : marks.length
      ? marks.filter(m => ((m.internal ?? 0) + (m.external ?? 0)) < 40).length
      : 0;

  // New Derived Dynamic Logic tailored to ECE Profile
  const currentCGPA = Number(student.cgpa) || 7.2;
  const currentSemester = Number(student.semester) || 6;
  
  // "What-if" Predictor Logic
  const projectedCGPA = ((currentCGPA * (currentSemester - 1)) + targetSemGPA) / currentSemester;

  // Placement tracker progress
  const placementProgress = Math.min((projectedCGPA / 10) * 100, 100);
  
  // Dynamic Risk overriding logic
  let dynamicRiskLevel = baseRiskLevel;
  let riskContext = "Based on aggregate attendance and arrears.";
  let riskColor = "text-emerald-400";
  let riskBorder = "border-b-emerald-500";
  
  const hasLowCoreMarks = marks.some(m => 
    (m.subject?.toLowerCase().includes('digital signal processing') || 
     m.subject?.toLowerCase().includes('vlsi') || 
     m.subject?.toLowerCase().includes('core')) && (m.internal < 15)
  );

  if (currentSemester >= 6 && projectedCGPA < 7.5) {
    dynamicRiskLevel = "High";
    riskContext = "Upcoming placements require >7.5 CGPA. Current trajectory is too low!";
    riskColor = "text-red-400";
    riskBorder = "border-b-red-500";
  } else if (hasLowCoreMarks) {
    dynamicRiskLevel = "High";
    riskContext = "Low internal marks detected in critical ECE core papers.";
    riskColor = "text-red-400";
    riskBorder = "border-b-red-500";
  } else if (dynamicRiskLevel === "High") {
    riskContext = "High risk flagged by system due to active arrears or low attendance.";
    riskColor = "text-red-400";
    riskBorder = "border-b-red-500";
  } else if (dynamicRiskLevel === "Medium") {
    riskColor = "text-amber-400";
    riskBorder = "border-b-amber-500";
  }

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
          <h1 className="text-2xl font-outfit font-bold flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 tracking-tight">
            <LayoutDashboard className="w-8 h-8 text-indigo-400" />
            Academic Hub
          </h1>
        </div>
        <div className="p-6 border-b border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg border border-white/10">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-bold font-outfit truncate w-36">{student.name || "Student"}</p>
            <p className="text-indigo-300 text-xs font-semibold uppercase">{student.department || "Dept"}</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            { id: "overview", icon: Activity, label: "Overview" },
            { id: "profile", icon: User, label: "Profile Status" },
            { id: "marks", icon: Award, label: "Subject Marks" },
            { id: "attendance", icon: BookOpen, label: "Attendance" },
            { id: "settings", icon: Settings, label: "Settings" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl font-medium transition-all ${
                activeTab === tab.id 
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-inner" 
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
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 z-10 w-full max-w-6xl mx-auto">
          
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h2 className="text-3xl font-outfit font-bold text-white capitalize">
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "profile" && "Student Profile"}
              {activeTab === "marks" && "Academic Performance"}
              {activeTab === "attendance" && "Attendance Tracker"}
              {activeTab === "settings" && "Theme Settings"}
            </h2>
            <p className="text-slate-400 mt-2">
              {activeTab === "overview" && "Your academic snapshot at a glance."}
              {activeTab === "profile" && "Personal details and overall CGPA."}
              {activeTab === "marks" && "Detailed internal and external scores."}
              {activeTab === "attendance" && "Current subject-wise attedance rates."}
              {activeTab === "settings" && "Configure your visual preferences."}
            </p>
          </motion.div>

          {error && !analytics ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.2)] flex items-center gap-3 mb-6">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              {error}
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              
              {/* Settings Tab */}
              {activeTab === "settings" && (
                <motion.div key="settings" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }} className="glass-card shadow-2xl border border-white/10 p-8 text-slate-300">
                  <ThemeSettings />
                </motion.div>
              )}

              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6 w-full">
                  <motion.div key="overview" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* Current CGPA */}
                    <div className="glass-card p-6 col-span-1 md:col-span-2 lg:col-span-1 flex flex-col justify-center items-center text-center hover:bg-white/5 transition-colors group">
                      <Cpu className="w-10 h-10 text-cyan-400 mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                      <p className="text-slate-400 text-sm uppercase tracking-widest mb-1 font-semibold">Current CGPA</p>
                      <p className="text-6xl font-outfit font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-md">
                        {currentCGPA.toFixed(2)}
                      </p>
                      <p className="text-cyan-300 text-sm font-medium mt-4 bg-cyan-900/40 px-3 py-1 rounded-full border border-cyan-500/30">
                        Semester {currentSemester}
                      </p>
                    </div>
                    
                    {/* Performance Pulse & Dynamic Risk */}
                    <div className="glass-card p-6 lg:col-span-2 relative overflow-hidden">
                      <div className="absolute -right-10 -top-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-[50px] pointer-events-none"></div>
                      <h3 className="text-xl font-outfit font-semibold mb-6 flex items-center gap-3 text-white">
                        <Activity className="w-6 h-6 text-cyan-400" /> Performance Pulse
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 glass-panel border-b-4 border-b-blue-500 hover:-translate-y-1 transition-transform duration-300 bg-slate-900/50">
                          <TrendingUp className="w-6 h-6 text-blue-400 mb-3" />
                          <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Average Marks</p>
                          <p className="text-2xl font-bold text-white">{avgMarks}</p>
                        </div>
                        
                        {/* Dynamic Risk Card with Tooltip overlay */}
                        <div className={`p-4 glass-panel border-b-4 hover:-translate-y-1 transition-transform duration-300 bg-slate-900/50 relative group ${riskBorder}`}>
                          <div className="flex justify-between items-start">
                             <AlertTriangle className={`w-6 h-6 mb-3 ${riskColor}`} />
                             <div className="relative">
                               <button 
                                 onMouseEnter={() => setShowRiskTooltip(true)} 
                                 onMouseLeave={() => setShowRiskTooltip(false)}
                                 className="text-slate-400 hover:text-white transition-colors"
                               >
                                 <HelpCircle className="w-4 h-4 cursor-pointer" />
                               </button>
                               {showRiskTooltip && (
                                 <div className="absolute right-0 top-6 w-48 bg-slate-800 border border-slate-600 shadow-2xl rounded-lg p-3 text-xs text-slate-200 z-50">
                                   {riskContext}
                                 </div>
                               )}
                             </div>
                          </div>
                          <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Risk Level</p>
                          <p className={`text-2xl font-bold ${riskColor}`}>{dynamicRiskLevel}</p>
                        </div>
                        
                        <div className={`p-4 glass-panel border-b-4 hover:-translate-y-1 transition-transform duration-300 bg-slate-900/50 ${arrearCount > 0 ? "border-b-red-500" : "border-b-emerald-500"}`}>
                          {arrearCount > 0 ? <XCircle className="w-6 h-6 text-red-400 mb-3" /> : <CheckCircle className="w-6 h-6 text-emerald-400 mb-3" />}
                          <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Active Arrears</p>
                          <p className={`text-2xl font-bold ${arrearCount > 0 ? "text-red-400" : "text-emerald-400"}`}>{arrearCount}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Proactive Tools: Predictor & Readiness */}
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                    
                    {/* What-If Predictor */}
                    <div className="glass-card p-6 flex flex-col justify-between border-t border-t-cyan-500/20 shadow-[0_-5px_20px_-10px_rgba(6,182,212,0.1)] hover:bg-white/5 transition-colors">
                      <div>
                        <h3 className="text-lg font-outfit font-semibold mb-2 flex items-center gap-2 text-white">
                          <SlidersHorizontal className="w-5 h-5 text-cyan-400" /> 
                          "What-If" Predictor
                        </h3>
                        <p className="text-sm text-slate-400 mb-6">Calculate how your Semester {currentSemester} target grades impact final CGPA.</p>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl border border-white/5">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-400 uppercase font-semibold">Target Sem {currentSemester} GPA</span>
                            <span className="text-xl font-bold text-cyan-400">{targetSemGPA.toFixed(1)}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-slate-400 uppercase font-semibold">Predicted Final CGPA</span>
                            <span className="text-2xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{projectedCGPA.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <div className="px-2">
                          <input 
                            type="range" 
                            min="0" max="10" step="0.1" 
                            value={targetSemGPA} 
                            onChange={(e) => setTargetSemGPA(parseFloat(e.target.value))} 
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer hover:bg-slate-600 transition-all focus:outline-none"
                            style={{ accentColor: '#22d3ee' }}
                          />
                          <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
                            <span>0.0</span>
                            <span>5.0</span>
                            <span>10.0</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Placement Readiness Tracker */}
                    <div className="glass-card p-6 flex flex-col justify-between border-t border-t-blue-500/20 shadow-[0_-5px_20px_-10px_rgba(59,130,246,0.1)] hover:bg-white/5 transition-colors">
                      <div>
                        <h3 className="text-lg font-outfit font-semibold mb-2 flex items-center gap-2 text-white">
                          <Target className="w-5 h-5 text-blue-400" /> 
                          Placement Readiness
                        </h3>
                        <p className="text-sm text-slate-400 mb-6">Track proximity to common ECE recruitment cut-offs.</p>
                      </div>
                      
                      <div className="relative pt-8 pb-4">
                        {/* Progress Bar Track */}
                        <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner border border-white/5 relative">
                           {/* Fill */}
                           <motion.div 
                             initial={{ width: 0 }} 
                             animate={{ width: `${placementProgress}%` }} 
                             transition={{ duration: 1, ease: "easeOut" }}
                             className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full"
                           />
                        </div>
                        
                        {/* Current Marker */}
                        <motion.div 
                          initial={{ left: 0 }}
                          animate={{ left: `${(currentCGPA/10)*100}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="absolute top-2 w-1 h-8 bg-white z-10 -ml-0.5 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                        >
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded border border-slate-600 font-bold z-20">
                             {currentCGPA.toFixed(2)}
                          </div>
                        </motion.div>

                        {/* Cutoff Markers */}
                        {[
                          { val: 6.5, label: "Std", color: "text-amber-400" },
                          { val: 7.5, label: "Prem", color: "text-blue-400" },
                          { val: 8.5, label: "Elite", color: "text-purple-400" }
                        ].map(cutoff => (
                          <div key={cutoff.val} className="absolute top-8 w-px h-full" style={{ left: `${(cutoff.val/10)*100}%` }}>
                            <div className="absolute -top-4 w-0.5 h-6 bg-slate-600"></div>
                            <div className={`absolute top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold ${cutoff.color}`}>
                              {cutoff.val}
                            </div>
                            <div className="absolute top-7 left-1/2 -translate-x-1/2 text-[9px] text-slate-500 uppercase tracking-tighter">
                              {cutoff.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                  </motion.div>
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === "profile" && (
                <motion.div key="profile" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }} className="glass-card p-8 relative overflow-hidden group max-w-2xl mx-auto w-full">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
                  <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.5)] border-4 border-white/10 mb-4 cursor-pointer hover:scale-105 transition-transform duration-300">
                      <User className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-outfit font-bold text-white drop-shadow-md">{student.name ?? "Unknown"}</h2>
                    <p className="text-indigo-300 text-lg mt-1 font-medium tracking-wide">{student.department ?? "Dept"}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between p-4 glass-panel items-center hover:bg-white/10 transition-colors">
                      <span className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Current Semester</span>
                      <span className="text-xl font-bold text-white">{student.semester ?? "-"}</span>
                    </div>
                    <div className="flex justify-between p-4 glass-panel items-center hover:bg-white/10 transition-colors">
                      <span className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Cumulative GPA</span>
                      <span className="text-xl font-bold text-emerald-400">{student.cgpa ?? "-"}</span>
                    </div>
                    <div className="flex justify-between p-4 glass-panel items-center hover:bg-white/10 transition-colors">
                      <span className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Database ID</span>
                      <span className="text-sm font-mono text-slate-300">{student._id ?? "-"}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Marks Tab */}
              {activeTab === "marks" && (
                <motion.div key="marks" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }} className="glass-card shadow-2xl border border-white/10 overflow-hidden">
                  <div className="overflow-x-auto bg-black/20">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-white/5 text-slate-300 text-xs uppercase tracking-widest border-b border-white/10">
                          <th className="p-6 font-semibold">Subject</th>
                          <th className="p-6 font-semibold text-center">Internal Score</th>
                          <th className="p-6 font-semibold text-center">External Score</th>
                          <th className="p-6 font-semibold text-center">Total Marks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {marks.length > 0 ? marks.map((mark, idx) => {
                          const total = (mark.internal ?? 0) + (mark.external ?? 0);
                          return (
                            <tr key={idx} className="hover:bg-white/5 transition-colors group">
                              <td className="p-6 text-slate-200 font-medium text-lg">{mark.subject ?? "-"}</td>
                              <td className="p-6 text-center text-slate-400 text-lg">{mark.internal ?? "-"}</td>
                              <td className="p-6 text-center text-slate-400 text-lg">{mark.external ?? "-"}</td>
                              <td className="p-6 text-center">
                                <span className={`inline-flex items-center justify-center px-5 py-2 rounded-full text-base font-bold shadow-sm ${total >= 40 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                  {total}
                                </span>
                              </td>
                            </tr>
                          );
                        }) : <tr><td colSpan="4" className="p-12 text-center text-slate-500 italic text-lg">No marks entries found.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* Attendance Tab */}
              {activeTab === "attendance" && (
                <motion.div key="attendance" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }} className="glass-card p-8">
                   <div className="space-y-8">
                    {attendance.length > 0 ? attendance.map((att, idx) => {
                      const percent = att.attendancePercentage ?? 0;
                      const isLow = percent < 75;
                      return (
                        <div key={idx} className="group p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300">
                          <div className="flex justify-between text-base mb-4">
                            <span className="font-semibold text-slate-200 text-lg">{att.subject ?? "-"}</span>
                            <span className={`font-bold text-xl drop-shadow-sm ${isLow ? 'text-red-400' : 'text-emerald-400'}`}>{percent}%</span>
                          </div>
                          <div className="h-4 w-full bg-slate-800/80 rounded-full overflow-hidden border border-white/5 shadow-inner">
                            <motion.div initial={{ width: 0 }} whileInView={{ width: `${percent}%` }} viewport={{ once: true }} transition={{ duration: 1.2, ease: "easeOut", delay: idx * 0.1 }} className={`h-full rounded-full relative ${isLow ? 'bg-gradient-to-r from-red-600 to-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-gradient-to-r from-emerald-600 to-teal-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'}`}>
                              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]"></div>
                            </motion.div>
                          </div>
                        </div>
                      );
                    }) : <p className="text-center text-slate-500 py-12 italic text-lg">No attendance data currently available.</p>}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}

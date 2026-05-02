import React, { useState } from 'react';
import { Calculator, TrendingUp, Award, Save, CheckCircle } from 'lucide-react';
import { updateCGPA } from '../services/api';

export default function CGPACalculator({ onSave }) {
  const [semesters, setSemesters] = useState(Array(5).fill(''));
  const [cgpa, setCgpa] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleInputChange = (index, value) => {
    const newSemesters = [...semesters];
    newSemesters[index] = value;
    setSemesters(newSemesters);
    setCgpa(null);
    setSaved(false);
  };

  const calculateCGPA = () => {
    const validGPAs = semesters
      .map(value => value === '' ? null : parseFloat(value))
      .filter(value => value !== null && !Number.isNaN(value));

    if (validGPAs.length === 0) {
      setCgpa(null);
      return;
    }

    const total = validGPAs.reduce((sum, value) => sum + value, 0);
    setCgpa((total / validGPAs.length).toFixed(2));
    setSaved(false);
  };

  const saveCGPA = async () => {
    if (!cgpa) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await updateCGPA(token, parseFloat(cgpa));
      setSaved(true);
      if (typeof onSave === 'function') {
        onSave();
      }
    } catch (err) {
      alert(err.message || 'Unable to save CGPA');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 text-slate-200">
      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-5">
          <Calculator className="w-8 h-8 text-cyan-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">CGPA Calculator</h2>
            <p className="text-slate-400">Enter your semester GPAs and save the result to your profile.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {semesters.map((value, index) => (
            <div key={index} className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Semester {index + 1} GPA</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.01"
                value={value}
                onChange={(e) => handleInputChange(index, e.target.value)}
                placeholder="e.g. 7.00"
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-8">
          <button
            onClick={calculateCGPA}
            className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 rounded-xl font-semibold text-white shadow-lg"
          >
            <TrendingUp className="w-5 h-5 mr-2 inline" /> Calculate CGPA
          </button>

          {cgpa !== null && (
            <button
              onClick={saveCGPA}
              disabled={saving}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold text-white shadow-lg disabled:opacity-60"
            >
              {saving ? 'Saving...' : saved ? 'Saved!' : (
                <><Save className="w-5 h-5 mr-2 inline" /> Save to Profile</>
              )}
            </button>
          )}
        </div>

        {cgpa !== null && (
          <div className="mt-8 p-6 bg-slate-900/80 border border-white/10 rounded-3xl text-center">
            <p className="text-slate-400 uppercase text-xs tracking-wider mb-2">Calculated CGPA</p>
            <p className="text-5xl font-outfit font-bold text-white">{cgpa}</p>
            {saved && (
              <p className="mt-4 text-emerald-300 flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> Updated in dashboard profile
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
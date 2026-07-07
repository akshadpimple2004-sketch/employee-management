import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Search, Edit3, Trash2, ShieldAlert, CheckCircle, X } from 'lucide-react';

interface Employee {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  salary: number;
}

const API_BASE = '/api'; // Proxied to Node.js backend via Nginx/Vite

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Modal controllers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  // Form values
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    salary: ''
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/employees`);
      setEmployees(res.data);
    } catch (err) {
      showToast('Failed to fetch employee list from backend API.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenCreate = () => {
    setEditingEmployee(null);
    setFormData({ name: '', email: '', role: '', department: '', salary: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      email: emp.email,
      role: emp.role,
      department: emp.department,
      salary: emp.salary.toString()
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, salary: parseFloat(formData.salary) };
      if (editingEmployee) {
        await axios.put(`${API_BASE}/employees/${editingEmployee._id}`, payload);
        showToast('Employee profile updated successfully!', 'success');
      } else {
        await axios.post(`${API_BASE}/employees`, payload);
        showToast('New employee profile created!', 'success');
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to submit data.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this employee?')) return;
    try {
      await axios.delete(`${API_BASE}/employees/${id}`);
      showToast('Employee deleted successfully.', 'success');
      fetchEmployees();
    } catch (err) {
      showToast('Error removing employee profile.', 'error');
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-4 right-4 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium z-50 animate-bounce ${
          toast.type === 'success' ? 'bg-emerald-950 border-emerald-500 text-emerald-200' : 'bg-rose-950 border-rose-500 text-rose-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <ShieldAlert size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">EM</div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">StaffAdmin</h1>
              <p className="text-xs text-slate-400">Enterprise Employee Directory</p>
            </div>
          </div>
          <button 
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md shadow-indigo-600/20 active:scale-95"
          >
            <UserPlus size={16} />
            <span>Add Employee</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Statistics Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <p className="text-slate-400 text-xs font-semibold tracking-wide uppercase">Total Workforce</p>
            <h3 className="text-3xl font-extrabold text-white mt-2">{employees.length}</h3>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <p className="text-slate-400 text-xs font-semibold tracking-wide uppercase">Active Departments</p>
            <h3 className="text-3xl font-extrabold text-indigo-400 mt-2">
              {Array.from(new Set(employees.map(e => e.department))).filter(Boolean).length}
            </h3>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <p className="text-slate-400 text-xs font-semibold tracking-wide uppercase">Average Annual Salary</p>
            <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">
              ${employees.length ? Math.round(employees.reduce((acc, curr) => acc + curr.salary, 0) / employees.length).toLocaleString() : 0}
            </h3>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between mb-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Search by name, email, department, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm w-full placeholder-slate-500 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <button 
            onClick={fetchEmployees}
            className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors px-3 py-2 border border-slate-800 rounded-lg bg-slate-950"
          >
            Sync Data
          </button>
        </div>

        {/* Directory Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading Directory Entries...</div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No staff members found matching query.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="p-4">Name</th>
                    <th className="p-4">Role / Dept</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Salary</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp._id} className="hover:bg-slate-950/20 transition-colors">
                      <td className="p-4 font-medium text-white">{emp.name}</td>
                      <td className="p-4">
                        <div className="text-slate-200 font-medium">{emp.role}</div>
                        <div className="text-xs text-slate-500">{emp.department}</div>
                      </td>
                      <td className="p-4 text-slate-300">{emp.email}</td>
                      <td className="p-4 font-mono text-emerald-400">${emp.salary.toLocaleString()}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleOpenEdit(emp)}
                            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(emp._id)}
                            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Editor Drawer / Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">
                {editingEmployee ? 'Edit Employee Info' : 'New Employee Profile'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Role / Designation</label>
                  <input 
                    type="text" 
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Department</label>
                  <input 
                    type="text" 
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Salary (Annual USD)</label>
                <input 
                  type="number" 
                  required
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-800 rounded-lg text-sm text-slate-400 hover:text-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all"
                >
                  {editingEmployee ? 'Save Changes' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

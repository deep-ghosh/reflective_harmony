import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Users, AlertTriangle, CheckCircle, Shield, Eye, FileText, Search, Download, Bell, ChevronRight, Target, Brain, Heart, LogOut } from 'lucide-react';
import LoginPage from './Login';
// import { useEmotionEvents } from '../hooks/useEmotionEvents';

interface Student {
  anon_id: string;
  gender: string;
  course: string;
  severity: number;
  lastSeen: string;
  questionnaire: boolean;
  adherence: number;
  trend: number[];
  status: string;
}

const GovtMentalHealthDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [justification, setJustification] = useState('');
  const [contactReason, setContactReason] = useState('');
  const [dateRange, setDateRange] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');

  // Advanced Analytics Data
  const weeklyTrendData = [
    { day: 'Mon', critical: 18, moderate: 82, good: 1147, avg_score: 23 },
    { day: 'Tue', critical: 21, moderate: 79, good: 1145, avg_score: 25 },
    { day: 'Wed', critical: 19, moderate: 85, good: 1143, avg_score: 24 },
    { day: 'Thu', critical: 23, moderate: 89, good: 1138, avg_score: 27 },
    { day: 'Fri', critical: 25, moderate: 91, good: 1131, avg_score: 29 },
    { day: 'Sat', critical: 22, moderate: 87, good: 1136, avg_score: 26 },
    { day: 'Sun', critical: 23, moderate: 89, good: 1135, avg_score: 27 }
  ];

  const monthlyComparisonData = [
    { month: 'Jun', critical: 15, moderate: 65, interventions: 28 },
    { month: 'Jul', critical: 18, moderate: 71, interventions: 34 },
    { month: 'Aug', critical: 21, moderate: 78, interventions: 41 },
    { month: 'Sep', critical: 19, moderate: 82, interventions: 38 },
    { month: 'Oct', critical: 22, moderate: 85, interventions: 45 },
    { month: 'Nov', critical: 23, moderate: 89, interventions: 48 }
  ];

  const severityDistribution = [
    { name: 'Severe (75-100%)', value: 23, color: '#ef4444' },
    { name: 'Moderate (50-75%)', value: 89, color: '#f59e0b' },
    { name: 'Mild (25-50%)', value: 142, color: '#fbbf24' },
    { name: 'Good (0-25%)', value: 993, color: '#10b981' }
  ];

  const departmentData = [
    { dept: 'CSE', critical: 8, moderate: 24, total: 342 },
    { dept: 'ECE', critical: 5, moderate: 19, total: 278 },
    { dept: 'ME', critical: 4, moderate: 18, total: 265 },
    { dept: 'EE', critical: 3, moderate: 15, total: 198 },
    { dept: 'CE', critical: 3, moderate: 13, total: 164 }
  ];

  const interventionMetrics = [
    { category: 'Response', value: 85 },
    { category: 'Follow-up', value: 72 },
    { category: 'Recovery', value: 68 },
    { category: 'Prevention', value: 91 },
    { category: 'Awareness', value: 78 }
  ];

  const criticalStudents = [
    { anon_id: 'ANO-7F3K2', gender: 'F', course: 'CSE-Y3', severity: 0.82, lastSeen: '2 hours ago', questionnaire: true, adherence: 65, trend: [0.45, 0.52, 0.61, 0.68, 0.75, 0.79, 0.82], status: 'escalating' },
    { anon_id: 'ANO-9M2L8', gender: 'M', course: 'ECE-Y2', severity: 0.76, lastSeen: '5 hours ago', questionnaire: false, adherence: 42, trend: [0.38, 0.45, 0.55, 0.62, 0.69, 0.73, 0.76], status: 'critical' },
    { anon_id: 'ANO-4N8P1', gender: 'NB', course: 'ME-Y4', severity: 0.71, lastSeen: '1 hour ago', questionnaire: true, adherence: 78, trend: [0.52, 0.58, 0.61, 0.65, 0.68, 0.70, 0.71], status: 'stable' },
    { anon_id: 'ANO-1K5M9', gender: 'F', course: 'EE-Y3', severity: 0.79, lastSeen: '3 hours ago', questionnaire: false, adherence: 51, trend: [0.42, 0.48, 0.56, 0.64, 0.71, 0.76, 0.79], status: 'escalating' },
    { anon_id: 'ANO-3P7Q2', gender: 'M', course: 'CSE-Y2', severity: 0.74, lastSeen: '4 hours ago', questionnaire: true, adherence: 69, trend: [0.51, 0.55, 0.61, 0.67, 0.70, 0.72, 0.74], status: 'improving' }
  ];

  const recentAlerts = [
    { id: 1, anon_id: 'ANO-7F3K2', type: 'Severity Spike', time: '15 min ago', priority: 'high' },
    { id: 2, anon_id: 'ANO-9M2L8', type: 'Questionnaire Overdue', time: '1 hour ago', priority: 'medium' },
    { id: 3, anon_id: 'ANO-1K5M9', type: 'Low Adherence', time: '2 hours ago', priority: 'medium' },
    { id: 4, anon_id: 'ANO-4N8P1', type: 'Positive Progress', time: '3 hours ago', priority: 'low' }
  ];

  const getSeverityColor = (severity: number): string => {
    if (severity >= 0.75) return 'from-red-500 to-red-600';
    if (severity >= 0.5) return 'from-orange-500 to-orange-600';
    return 'from-yellow-500 to-yellow-600';
  };

  const getStatusBadge = (status: string): string => {
    const styles: Record<string, string> = {
      escalating: 'bg-red-100 text-red-700 border-red-200',
      critical: 'bg-orange-100 text-orange-700 border-orange-200',
      stable: 'bg-blue-100 text-blue-700 border-blue-200',
      improving: 'bg-green-100 text-green-700 border-green-200'
    };
    return styles[status] || styles.stable;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveView('dashboard');
    setSelectedStudent(null);
    setShowRevealModal(false);
    setShowContactModal(false);
  };

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }


  // const { events, loading, error } = useEmotionEvents (selectedStudent?.anon_id)




  interface StatCardProps {
    title: string;
    value: string | number;
    change: string;
    icon: React.ElementType;
    trend: 'up' | 'down';
    color: string;
  }

  const StatCard = ({ title, value, change, icon: Icon, trend, color }: StatCardProps) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
          <div className="flex items-center gap-2">
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-sm font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </span>
            <span className="text-xs text-gray-500">vs last week</span>
          </div>
        </div>
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Modern Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  National Student Wellbeing Portal
                </h1>
                <p className="text-sm text-gray-500">Ministry of Education • Govt. of India</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">Admin • ActionRole</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-8">
          <div className="flex gap-1">
            {[
              { id: 'dashboard', label: 'Analytics Dashboard', icon: Activity },
              { id: 'critical', label: 'Critical Monitor', icon: AlertTriangle },
              { id: 'questionnaire', label: 'Compliance', icon: FileText },
              { id: 'audit', label: 'Audit Trail', icon: Shield }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
                  activeView === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto p-8">
        {/* DASHBOARD VIEW */}
        {activeView === 'dashboard' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-6">
              <StatCard
                title="Total Students"
                value="1,247"
                change="+3.2%"
                icon={Users}
                trend="up"
                color="from-blue-500 to-blue-600"
              />
              <StatCard
                title="Critical Cases"
                value="23"
                change="+15.0%"
                icon={AlertTriangle}
                trend="up"
                color="from-red-500 to-red-600"
              />
              <StatCard
                title="Interventions"
                value="48"
                change="+8.1%"
                icon={Target}
                trend="up"
                color="from-orange-500 to-orange-600"
              />
              <StatCard
                title="Response Rate"
                value="94.2%"
                change="+2.3%"
                icon={CheckCircle}
                trend="up"
                color="from-green-500 to-green-600"
              />
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Weekly Trend Chart */}
              <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">7-Day Severity Trends</h3>
                    <p className="text-sm text-gray-500 mt-1">Real-time student wellbeing metrics</p>
                  </div>
                  <div className="flex gap-2">
                    {['7d', '30d', '90d'].map(range => (
                      <button
                        key={range}
                        onClick={() => setDateRange(range)}
                        className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                          dateRange === range
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={weeklyTrendData}>
                    <defs>
                      <linearGradient id="criticalGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="moderateGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="goodGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Area type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} fill="url(#criticalGradient)" name="Critical" />
                    <Area type="monotone" dataKey="moderate" stroke="#f59e0b" strokeWidth={2} fill="url(#moderateGradient)" name="Moderate" />
                    <Area type="monotone" dataKey="good" stroke="#10b981" strokeWidth={2} fill="url(#goodGradient)" name="Good Health" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Severity Distribution */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Severity Distribution</h3>
                <p className="text-sm text-gray-500 mb-4">Current student classification</p>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={severityDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {severityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {severityDistribution.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-gray-700 text-xs">{item.name}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Department Analysis */}
              <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Department-wise Analysis</h3>
                <p className="text-sm text-gray-500 mb-6">Critical and moderate cases by department</p>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="dept" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="critical" fill="#ef4444" radius={[8, 8, 0, 0]} name="Critical" />
                    <Bar dataKey="moderate" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Moderate" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Intervention Effectiveness */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Intervention Metrics</h3>
                <p className="text-sm text-gray-500 mb-6">Performance indicators</p>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={interventionMetrics}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="category" style={{ fontSize: '11px' }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} style={{ fontSize: '10px' }} />
                    <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Comparison & Real-time Alerts */}
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-2">6-Month Trend Analysis</h3>
                <p className="text-sm text-gray-500 mb-6">Critical cases and intervention tracking</p>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={monthlyComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={3} dot={{ r: 5 }} name="Critical Cases" />
                    <Line type="monotone" dataKey="moderate" stroke="#f59e0b" strokeWidth={3} dot={{ r: 5 }} name="Moderate Cases" />
                    <Line type="monotone" dataKey="interventions" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} name="Interventions" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Recent Alerts */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Live Alerts</h3>
                  <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                    LIVE
                  </span>
                </div>
                <div className="space-y-3">
                  {recentAlerts.map(alert => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        alert.priority === 'high'
                          ? 'bg-red-50 border-red-500'
                          : alert.priority === 'medium'
                          ? 'bg-orange-50 border-orange-500'
                          : 'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <code className="text-xs font-mono bg-white px-2 py-1 rounded border border-gray-200">
                          {alert.anon_id}
                        </code>
                        <span className="text-xs text-gray-500">{alert.time}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{alert.type}</p>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setActiveView('critical')}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  View All Alerts
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CRITICAL MONITOR VIEW */}
        {activeView === 'critical' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by Anon ID, Course, or Batch..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Severities</option>
                  <option value="severe">Severe (75%+)</option>
                  <option value="moderate">Moderate (50-75%)</option>
                  <option value="mild">Mild (25-50%)</option>
                </select>
                <button className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

                {/* -----------------------
   Emotion events (small)
   Shows: user id, emotion, timestamp
   ----------------------- */}
{/* p */}









            {/* Critical Students Grid */}
            <div className="grid gap-4">
              {criticalStudents.map(student => (
                <div
                  key={student.anon_id}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => { setSelectedStudent(student); setActiveView('detail'); }}
                >
                  <div className="flex items-start gap-6">
                    {/* Student Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <code className="text-base font-mono bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-1.5 rounded-lg border border-gray-300 font-semibold">
                          {student.anon_id}
                        </code>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(student.status)}`}>
                          {student.status.toUpperCase()}
                        </span>
                        {!student.questionnaire && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                            QUESTIONNAIRE PENDING
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">Course</p>
                          <p className="font-semibold text-gray-900">{student.course}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Gender</p>
                          <p className="font-semibold text-gray-900">{student.gender}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Last Active</p>
                          <p className="font-semibold text-gray-900">{student.lastSeen}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Adherence</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${student.adherence >= 70 ? 'bg-green-500' : student.adherence >= 50 ? 'bg-orange-500' : 'bg-red-500'}`}
                                style={{ width: `${student.adherence}%` }}
                              />
                            </div>
                            <span className="font-semibold text-gray-900 text-xs">{student.adherence}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Severity Score */}
                    <div className="text-center">
                      <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${getSeverityColor(student.severity)} flex items-center justify-center shadow-lg`}>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-white">{(student.severity * 100).toFixed(0)}</p>
                          <p className="text-xs text-white opacity-90">RISK %</p>
                        </div>
                      </div>
                    </div>

                    {/* Mini Trend Chart */}
                    <div className="w-48">
                      <p className="text-xs text-gray-500 mb-2">7-Day Trend</p>
                      <ResponsiveContainer width="100%" height={60}>
                        <LineChart data={student.trend.map((val, i) => ({ day: i, score: val * 100 }))}>
                          <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      {!student.questionnaire && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudent(student);
                            setShowContactModal(true);
                          }}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Contact
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CRITICAL DETAIL VIEW */}
        {activeView === 'detail' && selectedStudent && (
          <div className="space-y-6">
            <button
              onClick={() => setActiveView('critical')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Critical Monitor
            </button>

            {/* Student Header Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <code className="text-2xl font-mono bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30">
                      {selectedStudent.anon_id}
                    </code>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm border border-white/30`}>
                      {selectedStudent.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-6">
                    <div>
                      <p className="text-blue-200 text-sm mb-1">Gender</p>
                      <p className="text-xl font-bold">{selectedStudent.gender}</p>
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm mb-1">Course</p>
                      <p className="text-xl font-bold">{selectedStudent.course}</p>
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm mb-1">Last Active</p>
                      <p className="text-xl font-bold">{selectedStudent.lastSeen}</p>
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm mb-1">Adherence</p>
                      <p className="text-xl font-bold">{selectedStudent.adherence}%</p>
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm mb-1">Questionnaire</p>
                      <p className="text-xl font-bold">{selectedStudent.questionnaire ? '✓ Complete' : '✗ Pending'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  {!selectedStudent.questionnaire && (
                    <button
                      onClick={() => setShowContactModal(true)}
                      className="px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 font-semibold transition-colors flex items-center gap-2 shadow-lg"
                    >
                      <FileText className="w-5 h-5" />
                      Access Contact
                    </button>
                  )}
                  <button
                    onClick={() => setShowRevealModal(true)}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold transition-colors flex items-center gap-2 shadow-lg"
                  >
                    <Eye className="w-5 h-5" />
                    Request Reveal
                  </button>
                </div>
              </div>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-3 gap-6">
              {/* 7-Day Trend */}
              <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Weekly Severity Progression</h3>
                    <p className="text-sm text-gray-500 mt-1">Anonymized risk score trajectory</p>
                  </div>
                  <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${getSeverityColor(selectedStudent.severity)} text-white font-bold text-lg shadow-lg`}>
                    {(selectedStudent.severity * 100).toFixed(0)}% Risk
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={selectedStudent.trend.map((val, i) => ({
                    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
                    score: (val * 100).toFixed(1)
                  }))}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: '13px', fontWeight: '500' }} />
                    <YAxis
                      stroke="#9ca3af"
                      style={{ fontSize: '13px', fontWeight: '500' }}
                      label={{ value: 'Risk Score (%)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        padding: '12px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fill="url(#scoreGradient)"
                      dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 8 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Key Metrics */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <Brain className="w-8 h-8 opacity-80" />
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <p className="text-blue-100 text-sm mb-1">Overall Adherence</p>
                  <p className="text-4xl font-bold">{selectedStudent.adherence}%</p>
                  <div className="mt-3 pt-3 border-t border-blue-400">
                    <p className="text-xs text-blue-100">Suggested activities completion rate</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <FileText className="w-8 h-8 opacity-80" />
                    {selectedStudent.questionnaire ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <p className="text-purple-100 text-sm mb-1">Questionnaire Status</p>
                  <p className="text-4xl font-bold">{selectedStudent.questionnaire ? '✓' : '✗'}</p>
                  <div className="mt-3 pt-3 border-t border-purple-400">
                    <p className="text-xs text-purple-100">
                      {selectedStudent.questionnaire ? 'PHQ-9 completed' : 'Mandatory form pending'}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <Heart className="w-8 h-8 opacity-80" />
                    <Activity className="w-5 h-5" />
                  </div>
                  <p className="text-green-100 text-sm mb-1">Chatbot Interactions</p>
                  <p className="text-4xl font-bold">{Math.floor(Math.random() * 20) + 8}</p>
                  <div className="mt-3 pt-3 border-t border-green-400">
                    <p className="text-xs text-green-100">Sessions in last 7 days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Activity Timeline (Anonymized)</h3>
              <div className="space-y-4">
                {[
                  { time: '2 hours ago', action: 'Completed wellness check-in', type: 'success' },
                  { time: '1 day ago', action: 'Severity score increased by 4%', type: 'warning' },
                  { time: '2 days ago', action: 'Engaged with chatbot for 12 minutes', type: 'info' },
                  { time: '3 days ago', action: 'Skipped suggested meditation exercise', type: 'warning' },
                  { time: '5 days ago', action: 'Completed PHQ-9 assessment', type: 'success' }
                ].map((event, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      event.type === 'success' ? 'bg-green-100' :
                      event.type === 'warning' ? 'bg-orange-100' : 'bg-blue-100'
                    }`}>
                      {event.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                       event.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-orange-600" /> :
                       <Activity className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{event.action}</p>
                      <p className="text-sm text-gray-500">{event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* QUESTIONNAIRE VIEW */}
        {activeView === 'questionnaire' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Compliance Tracker</h2>
                  <p className="text-gray-500 mt-1">Students who have not completed mandatory assessments</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-3xl font-bold text-orange-600">47</p>
                    <p className="text-sm text-gray-500">Pending Forms</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {criticalStudents.filter(s => !s.questionnaire).map(student => (
                  <div key={student.anon_id} className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <code className="text-lg font-mono bg-white px-4 py-2 rounded-lg border border-gray-300 font-semibold">
                          {student.anon_id}
                        </code>
                        <div>
                          <p className="font-semibold text-gray-900">{student.course}</p>
                          <p className="text-sm text-gray-600">Gender: {student.gender}</p>
                        </div>
                        <div className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm">
                          {Math.floor(Math.random() * 10) + 1} DAYS OVERDUE
                        </div>
                      </div>
                      <button
                        onClick={() => { setSelectedStudent(student); setShowContactModal(true); }}
                        className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-semibold transition-colors flex items-center gap-2"
                      >
                        <FileText className="w-5 h-5" />
                        Access Contact for Outreach
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AUDIT VIEW */}
        {activeView === 'audit' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-2xl font-bold text-gray-900">Immutable Audit Trail</h2>
              <p className="text-gray-600 mt-1">Complete log of all administrative actions</p>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Timestamp</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Admin ID</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Action</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Anon ID</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { time: '2025-11-23 14:23:15', admin: 'ADM-001', action: 'Access Contact', anon: 'ANO-9M2L8', status: 'success' },
                      { time: '2025-11-23 13:45:32', admin: 'ADM-002', action: 'Request Identity Reveal', anon: 'ANO-7F3K2', status: 'pending' },
                      { time: '2025-11-23 12:18:47', admin: 'ADM-001', action: 'View Critical Detail', anon: 'ANO-4N8P1', status: 'success' },
                      { time: '2025-11-23 11:05:22', admin: 'ADM-003', action: 'Export Anonymized Data', anon: 'N/A', status: 'success' },
                      { time: '2025-11-23 10:34:11', admin: 'ADM-002', action: 'Approve Identity Reveal', anon: 'ANO-1K5M9', status: 'success' }
                    ].map((log, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm text-gray-900 font-mono">{log.time}</td>
                        <td className="px-4 py-4">
                          <code className="text-sm font-mono bg-blue-100 px-2 py-1 rounded text-blue-700">
                            {log.admin}
                          </code>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{log.action}</td>
                        <td className="px-4 py-4">
                          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {log.anon}
                          </code>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            log.status === 'success' ? 'bg-green-100 text-green-700' :
                            log.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {log.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Identity Reveal Modal */}
      {showRevealModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">Request Identity Reveal</h3>
                <p className="text-sm text-gray-600 mt-1">Student: <code className="font-mono bg-gray-100 px-2 py-0.5 rounded">{selectedStudent?.anon_id}</code></p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Justification (Required) *
              </label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-xl p-4 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={5}
                placeholder="Provide detailed reason for identity reveal request (minimum 20 characters). Example: Imminent safety concern verified through multiple indicators requiring immediate intervention..."
              />
              <p className="text-xs text-gray-500 mt-2">
                {justification.length}/20 characters minimum
              </p>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4 mb-6">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-900 mb-1">Security Notice</p>
                  <p className="text-xs text-yellow-800">
                    This action requires ApproverAdmin 2FA verification and will be permanently logged in the immutable audit trail. Identity will be revealed for 2 hours only.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowRevealModal(false); setJustification(''); }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (justification.length < 20) {
                    alert('Justification must be at least 20 characters');
                    return;
                  }
                  alert(`✓ Identity reveal request submitted for ${selectedStudent?.anon_id}\n\nJustification: ${justification}\n\nStatus: Pending ApproverAdmin 2FA\nRequest ID: REQ-${Math.random().toString(36).substr(2, 9).toUpperCase()}\n\nYou will be notified when the request is processed.`);
                  setShowRevealModal(false);
                  setJustification('');
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 font-semibold transition-colors shadow-lg"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Access Modal */}
      {showContactModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">Access Contact Information</h3>
                <p className="text-sm text-gray-600 mt-1">Student: <code className="font-mono bg-gray-100 px-2 py-0.5 rounded">{selectedStudent.anon_id}</code></p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Reason for Contact Access *
              </label>
              <select
                value={contactReason}
                onChange={(e) => setContactReason(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-xl p-4 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent font-medium"
              >
                <option value="">Select a reason...</option>
                <option value="mandatory_phq9_followup">Follow-up for mandatory PHQ-9 questionnaire</option>
                <option value="mandatory_gad7_followup">Follow-up for mandatory GAD-7 questionnaire</option>
                <option value="wellness_check">General wellness check-in</option>
                <option value="program_reminder">Wellbeing program participation reminder</option>
              </select>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-4 mb-6">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">Privacy Notice</p>
                  <p className="text-xs text-blue-800">
                    Accessing contact information will create an immutable audit log entry with your admin ID, timestamp, IP address, and selected reason. This action is only permitted for students with pending mandatory questionnaires.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowContactModal(false); setContactReason(''); }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!contactReason) {
                    alert('Please select a reason for accessing contact information');
                    return;
                  }
                  const phone = `+91-98${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
                  const email = `student.${selectedStudent.anon_id.toLowerCase()}@university.edu.in`;
                  alert(`✓ Contact information accessed for ${selectedStudent.anon_id}\n\nReason: ${contactReason}\n\n━━━━━━━━━━━━━━━━━━\nCONTACT DETAILS\n━━━━━━━━━━━━━━━━━━\n\nEmail: ${email}\nPhone: ${phone}\n\n━━━━━━━━━━━━━━━━━━\nAUDIT LOG CREATED\n━━━━━━━━━━━━━━━━━━\n\nAdmin: ADM-001\nTimestamp: ${new Date().toLocaleString()}\nAction: access_contact\nReason: ${contactReason}\n\nThis action has been permanently recorded.`);
                  setShowContactModal(false);
                  setContactReason('');
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 font-semibold transition-colors shadow-lg"
              >
                Access Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovtMentalHealthDashboard;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ArrowRight, 
  Loader2, 
  Building2, 
  MapPin, 
  MessageSquareText, 
  Languages,
  RefreshCw,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  Newspaper,
  Coins,
  Lightbulb,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { analyzeCompany } from './services/gemini';
import { DashboardData, AnalysisInput } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const VerdictBadge = ({ verdict }: { verdict: DashboardData['legitimacyVerdict'] }) => {
  const colors = {
    'LEGIT': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'SUSPICIOUS': 'bg-amber-100 text-amber-700 border-amber-200',
    'SCAM': 'bg-red-100 text-red-700 border-red-200',
    'UNVERIFIED': 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const icons = {
    'LEGIT': <ShieldCheck className="w-4 h-4" />,
    'SUSPICIOUS': <AlertTriangle className="w-4 h-4" />,
    'SCAM': <ShieldX className="w-4 h-4" />,
    'UNVERIFIED': <Info className="w-4 h-4" />,
  };

  return (
    <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-bold uppercase tracking-wide", colors[verdict])}>
      {icons[verdict]}
      {verdict}
    </div>
  );
};

const RiskBadge = ({ level }: { level: DashboardData['riskLevel'] }) => {
  const colors = {
    'HIGH': 'bg-red-50 text-red-600 border-red-100',
    'MEDIUM': 'bg-amber-50 text-amber-600 border-amber-100',
    'LOW': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'UNKNOWN': 'bg-slate-50 text-slate-600 border-slate-100',
  };

  return (
    <div className={cn("px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-widest", colors[level])}>
      {level} RISK
    </div>
  );
};

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", 
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
].sort();

const ScoreGauge = ({ score, label }: { score: number, label: string }) => {
  const getColor = (s: number) => {
    if (s <= 20) return 'text-emerald-500';
    if (s <= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  // Invert score for display if it's "Fraud Risk" (higher is worse)
  const displayScore = score;

  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="56"
          cy="56"
          r="50"
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          className="text-gray-100"
        />
        <circle
          cx="56"
          cy="56"
          r="50"
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={314.159}
          strokeDashoffset={314.159 - (314.159 * displayScore) / 100}
          className={cn("transition-all duration-1000 ease-out", getColor(displayScore))}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-2xl font-bold", getColor(displayScore))}>{displayScore}</span>
        <span className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold text-center leading-tight">{label}</span>
      </div>
    </div>
  );
};

const SentimentMeter = ({ score, label, summary }: { score: number, label: string, summary: string }) => {
  const getIcon = () => {
    if (score > 0.2) return <TrendingUp className="w-5 h-5 text-emerald-500" />;
    if (score < -0.2) return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <TrendingUp className="w-5 h-5 text-amber-500 rotate-90" />;
  };

  const getBg = () => {
    if (score > 0.2) return 'bg-emerald-50 border-emerald-100';
    if (score < -0.2) return 'bg-red-50 border-red-100';
    return 'bg-amber-50 border-amber-100';
  };

  const percentage = ((score + 1) / 2) * 100;

  return (
    <div className={cn("p-6 rounded-3xl border flex flex-col gap-4", getBg())}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getIcon()}
          <h4 className="font-bold text-slate-800 uppercase tracking-tight text-sm">Public Sentiment</h4>
        </div>
        <span className="text-xs font-black uppercase tracking-widest px-2 py-1 bg-white/50 rounded border border-white/20">{label}</span>
      </div>
      <div className="space-y-2">
        <div className="h-2 w-full bg-white/30 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className={cn("h-full", score > 0.2 ? "bg-emerald-500" : score < -0.2 ? "bg-red-500" : "bg-amber-500")}
          />
        </div>
        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Negative</span>
          <span>Neutral</span>
          <span>Positive</span>
        </div>
      </div>
      <p className="text-sm text-slate-600 font-medium leading-relaxed italic">"{summary}"</p>
    </div>
  );
};

export default function App() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [copied, setCopied] = useState(false);
  const [input, setInput] = useState<AnalysisInput>({
    companyName: '',
    state: '',
    city: ''
  });

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.companyName || !input.state || !input.city) return;

    setLoading(true);
    try {
      const result = await analyzeCompany(input);
      setData(result);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setData(null);
    setInput({
      companyName: '',
      state: '',
      city: ''
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Job Verifier</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Student Safety Assistant</p>
            </div>
          </div>
          {data && (
            <div className="flex items-center gap-4">
              <button 
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy JSON'}
              </button>
              <button 
                onClick={reset}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                New Analysis
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          {!data ? (
            <motion.div
              key="input-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-2xl font-bold text-slate-800">Verify Job Offer</h2>
                  <p className="text-slate-500 mt-1">Check if a company is legitimate before applying or accepting an offer.</p>
                </div>
                
                <form onSubmit={handleAnalyze} className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-indigo-500" />
                        Company Name
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Acme Corp"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        value={input.companyName}
                        onChange={e => setInput({ ...input, companyName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-indigo-500" />
                        State
                      </label>
                      <select
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white"
                        value={input.state}
                        onChange={e => setInput({ ...input, state: e.target.value })}
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-indigo-500" />
                        City
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Bangalore"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        value={input.city}
                        onChange={e => setInput({ ...input, city: e.target.value })}
                      />
                    </div>
                  </div>

                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Researching Web Data...
                      </>
                    ) : (
                      <>
                        Start Autonomous Research
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              {/* Dashboard Top Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Score & Risk Card */}
                <div className="lg:col-span-1 bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-200 flex flex-col items-center justify-center text-center">
                  <div className="flex flex-col items-center">
                    <ScoreGauge score={data.fraudRiskScore} label="Fraud Risk" />
                    <div className="mt-4">
                      <RiskBadge level={data.riskLevel} />
                    </div>
                  </div>
                  <div className="mt-6 space-y-2">
                    <h3 className="text-2xl font-bold text-slate-800">{data.companyName}</h3>
                    <p className="text-slate-500 flex items-center justify-center gap-1.5 text-sm">
                      <MapPin className="w-4 h-4" />
                      {data.headquarters}
                    </p>
                  </div>
                  <div className="mt-6">
                    <VerdictBadge verdict={data.legitimacyVerdict} />
                  </div>

                  <div className="mt-8 w-full space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-indigo-500" />
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trust Breakdown</h4>
                    </div>
                    {data.trustBreakdown.map((item, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-slate-500">{item.category}</span>
                          <span className={cn(item.score > 70 ? "text-emerald-600" : item.score > 40 ? "text-amber-600" : "text-red-600")}>{item.score}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${item.score}%` }}
                            className={cn("h-full", item.score > 70 ? "bg-emerald-500" : item.score > 40 ? "bg-amber-500" : "bg-red-500")}
                          />
                        </div>
                        <p className="text-[9px] text-slate-400 font-medium">{item.note}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Information Grid */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-200">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Info className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Company Profile</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Industry</h4>
                      <p className="text-slate-700 font-medium">{data.industry}</p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Type</h4>
                      <p className="text-slate-700 font-medium">{data.companyType}</p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Founded</h4>
                      <p className="text-slate-700 font-medium">{data.founded}</p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Employees</h4>
                      <p className="text-slate-700 font-medium">{data.employees}</p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">CEO</h4>
                      <p className="text-slate-700 font-medium">{data.ceo}</p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Stock Listed</h4>
                      <p className="text-slate-700 font-medium">{data.stockListed}</p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">LinkedIn</h4>
                      <p className="text-slate-700 font-medium">{data.linkedinFollowers} Followers</p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Glassdoor</h4>
                      <p className="text-slate-700 font-medium">{data.glassdoorRating}</p>
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <a 
                      href={data.website.startsWith('http') ? data.website : `https://${data.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 font-bold hover:underline flex items-center gap-2"
                    >
                      Visit Official Website <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Verdict Note Card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Search className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Legitimacy Verdict</h3>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-lg font-medium">
                    {data.verdictNote}
                  </p>
                </div>
                <div className="lg:col-span-1">
                  <SentimentMeter 
                    score={data.sentimentScore} 
                    label={data.sentimentLabel} 
                    summary={data.sentimentSummary} 
                  />
                </div>
              </div>

              {/* Career Insights Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Salary Benchmarking */}
                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-200">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Coins className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Salary Benchmarking</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b border-slate-100">
                          <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Role</th>
                          <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Company Avg</th>
                          <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Industry Avg</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {data.salaryBenchmarking.map((item, i) => (
                          <tr key={i}>
                            <td className="py-4 text-sm font-bold text-slate-700">{item.role}</td>
                            <td className="py-4 text-sm font-black text-indigo-600">{item.avgSalary}</td>
                            <td className="py-4 text-sm font-medium text-slate-500">{item.industryAvg}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Interview Tips */}
                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-200">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Lightbulb className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Interview Tips</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {data.interviewTips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent News */}
              <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-200">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Newspaper className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Recent News & Updates</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.recentNews.map((news, i) => (
                    <div key={i} className="p-6 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors group">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{news.source}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{news.date}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-4">{news.title}</h4>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <ExternalLink className="w-3 h-3" />
                        Read Full Article
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hiring Info */}
              <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-200">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Hiring & Recruitment</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", data.fresherFriendly ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400")}>
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fresher Friendly</p>
                        <p className="text-slate-700 font-bold">{data.fresherFriendly ? "YES" : "NO"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", data.campusRecruiter ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400")}>
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Campus Recruiter</p>
                        <p className="text-slate-700 font-bold">{data.campusRecruiter ? "YES" : "NO"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-6">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Average Package</h4>
                      <p className="text-slate-700 font-bold text-xl">{data.averagePackage}</p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hiring Process</h4>
                      <p className="text-slate-700 font-medium">{data.hiringProcess}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Red Flags & Positive Signals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Red Flags */}
                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-200">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-red-50 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Red Flags</h3>
                  </div>
                  <ul className="space-y-4">
                    {data.redFlags.map((flag, i) => (
                      <motion.li 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className={cn(
                          "flex items-start gap-3 p-4 rounded-2xl border",
                          flag.level === 'HIGH' ? "bg-red-50 border-red-100" : "bg-amber-50 border-amber-100"
                        )}
                      >
                        <div className={cn("w-2 h-2 rounded-full mt-2 shrink-0", flag.level === 'HIGH' ? "bg-red-500" : "bg-amber-500")} />
                        <div className="flex flex-col">
                          <span className="text-slate-700 font-bold">{flag.text}</span>
                          <span className={cn("text-[10px] font-bold uppercase tracking-widest", flag.level === 'HIGH' ? "text-red-500" : "text-amber-500")}>{flag.level} SEVERITY</span>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Positive Indicators */}
                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-200">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Positive Signals</h3>
                  </div>
                  <ul className="space-y-4">
                    {data.positiveSignals.map((indicator, i) => (
                      <motion.li 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100/50"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                        <span className="text-slate-700 font-medium">{indicator}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-200">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <MessageSquareText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Employee Reviews</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.reviews.map((review, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-slate-800">{review.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{review.role}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, starIdx) => (
                              <div key={starIdx} className={cn("w-2 h-2 rounded-full", starIdx < review.stars ? "bg-amber-400" : "bg-slate-200")} />
                            ))}
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{review.date}</span>
                        </div>
                      </div>
                      <p className={cn("text-slate-700 leading-relaxed", review.lang === 'ta' ? "font-tamil text-lg" : "text-sm")}>
                        {review.text}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {review.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verification Sources */}
              <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl shadow-indigo-900/20 text-white">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-bold uppercase tracking-tight">Verify At</h3>
                </div>
                <div className="flex flex-wrap gap-4">
                  {data.verifyAt.map((source, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      <p className="text-slate-200 font-bold text-sm tracking-wide">{source}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200 text-center">
        <p className="text-slate-400 text-sm font-medium">
          Powered by Gemini 3.1 & TrustScan AI Engine • {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

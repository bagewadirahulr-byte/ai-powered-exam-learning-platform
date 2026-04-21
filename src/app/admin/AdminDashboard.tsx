"use client";

import { useState } from "react";
import { adminApproveEws, adminRejectEws, adminResetCredits, getEwsCertificateAsAdmin } from "./actions";

// ============================================
// Admin Dashboard — Client Component
// Platform stats, user table, EWS review panel
// ============================================

type AdminData = {
  stats: {
    totalUsers: number;
    totalContent: number;
    ewsApproved: number;
    ewsPendingReview: number;
    contentToday: number;
  };
  allUsers: Array<{
    id: string;
    name: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    subscriptionStatus: string;
    ewsStatus: string;
    ewsVerified: boolean;
    ewsRejectionReason: string | null;
    ewsVerificationFlag: string | null;
    ewsExtractedName: string | null;
    ewsExtractedIncome: number | null;
    ewsBlurScore: number | null;
    ewsDocumentType: string | null;
    ewsRiskScore: number | null;
    ewsAiRecommendation: string | null;
    ewsIssueDate: string | null;
    dailyCredits: number;
    preferredLanguage: string;
    targetExam: string | null;
    createdAt: Date;
  }>;
  pendingReviews: Array<{
    id: string;
    name: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    ewsStatus: string;
    ewsVerificationFlag: string | null;
    ewsExtractedName: string | null;
    ewsExtractedIncome: number | null;
    ewsBlurScore: number | null;
    ewsDocumentType: string | null;
    ewsRiskScore: number | null;
    ewsAiRecommendation: string | null;
    ewsIssueDate: string | null;
    createdAt: Date;
  }>;
  auditLogs: Array<{
    id: string;
    userId: string;
    adminEmail: string | null;
    action: string;
    confidenceScore: number | null;
    nameMatchScore: number | null;
    extractedIncome: number | null;
    decisionReason: string;
    createdAt: Date;
    userName: string | null;
    userEmail: string | null;
    userFirstName: string | null;
    userLastName: string | null;
  }>;
  contentStats: Array<{ type: string; total: number }>;
};

export default function AdminDashboard({ data }: { data: AdminData }) {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "reviews" | "audit">("overview");
  const [reviewFilter, setReviewFilter] = useState<"ALL" | "HIGH_RISK" | "INCOME_EXCEEDED" | "EXPIRED">("ALL");
  const [actionMsg, setActionMsg] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  // Certificate Modal State
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [certLoading, setCertLoading] = useState(false);
  const [certData, setCertData] = useState<{ base64Data: string; mimeType: string } | null>(null);

  const fetchCertificate = async (userId: string) => {
    setCertLoading(true);
    setCertData(null);
    setCertModalOpen(true);
    try {
      const res = await getEwsCertificateAsAdmin(userId);
      if (res) setCertData(res);
      else setActionMsg("Certificate has already been deleted or not found.");
    } catch (e) {
      setActionMsg("Failed to load certificate.");
    }
    setCertLoading(false);
  };

  const handleApprove = async (userId: string) => {
    setProcessing(userId);
    setActionMsg("");
    try {
      const res = await adminApproveEws(userId);
      setActionMsg(res.message);
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : "Action failed.");
    }
    setProcessing(null);
  };

  const handleReject = async (userId: string) => {
    const reason = window.prompt("Rejection reason:");
    if (reason === null) return;
    setProcessing(userId);
    setActionMsg("");
    try {
      const res = await adminRejectEws(userId, reason);
      setActionMsg(res.message);
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : "Action failed.");
    }
    setProcessing(null);
  };

  const handleResetCredits = async (userId: string) => {
    setProcessing(userId);
    setActionMsg("");
    try {
      const res = await adminResetCredits(userId);
      setActionMsg(res.message);
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : "Action failed.");
    }
    setProcessing(null);
  };

  const tabs = [
    { key: "overview" as const, label: "📊 Overview" },
    { key: "users" as const, label: `👥 Users (${data.allUsers.length})` },
    { key: "reviews" as const, label: `⏳ Pending Reviews (${data.pendingReviews.length})` },
    { key: "audit" as const, label: `📋 Audit Logs (${data.auditLogs.length})` },
  ];

  const ewsStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "text-green-400 bg-green-500/10 border-green-500/20";
      case "rejected": return "text-red-400 bg-red-500/10 border-red-500/20";
      case "needs_review": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "pending": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      default: return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  const docTypeColor = (docType: string | null) => {
    switch (docType) {
      case "VALID_EWS": return "text-green-400 bg-green-500/10 border-green-500/20";
      case "UNCERTAIN": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "INVALID_DOCUMENT": return "text-red-400 bg-red-500/10 border-red-500/20";
      default: return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  const riskColor = (score: number | null) => {
    if (score === null) return "text-gray-400";
    if (score < 30) return "text-green-400";
    if (score < 60) return "text-amber-400";
    return "text-red-400";
  };

  const aiRecommColor = (recomm: string | null) => {
    if (recomm === "APPROVE") return "text-green-400 bg-green-500/10 border-green-500/20";
    if (recomm === "REJECT") return "text-red-400 bg-red-500/10 border-red-500/20";
    return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  };

  const flagDescription = (flag: string): string => {
    switch (flag) {
      case "REVIEW_BLUR": return "Document image is blurry/unreadable.";
      case "REVIEW_NAME_MISMATCH": return "Profile name ≠ Document name.";
      case "REVIEW_INCOME_EXCEEDED": return "Income exceeds ₹8,00,000 threshold.";
      case "REVIEW_INCOME_NOT_FOUND": return "No income value found in document.";
      case "REVIEW_INVALID_DOCUMENT": return "Not an EWS/Income certificate.";
      case "REVIEW_UNCERTAIN_DOCUMENT": return "Document type unclear.";
      case "REVIEW_EXPIRED_DOCUMENT": return "Document issue date is >1 year old.";
      case "REVIEW_MULTIPLE_ISSUES": return "Multiple verification issues detected.";
      default: return "";
    }
  };

  const filteredReviews = data.pendingReviews.filter(r => {
    if (reviewFilter === "ALL") return true;
    if (reviewFilter === "HIGH_RISK") return (r.ewsRiskScore !== null && r.ewsRiskScore >= 60) || r.ewsAiRecommendation === "REJECT";
    if (reviewFilter === "INCOME_EXCEEDED") return r.ewsVerificationFlag === "REVIEW_INCOME_EXCEEDED";
    if (reviewFilter === "EXPIRED") return r.ewsVerificationFlag === "REVIEW_EXPIRED_DOCUMENT";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Action feedback */}
      {actionMsg && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-sm text-blue-300">
          {actionMsg}
        </div>
      )}

      {/* ===== Overview Tab ===== */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { label: "Total Users", value: data.stats.totalUsers, color: "from-blue-500 to-indigo-500" },
              { label: "Total Content", value: data.stats.totalContent, color: "from-purple-500 to-pink-500" },
              { label: "Content Today", value: data.stats.contentToday, color: "from-green-500 to-emerald-500" },
              { label: "EWS Approved", value: data.stats.ewsApproved, color: "from-emerald-500 to-teal-500" },
              { label: "Pending Review", value: data.stats.ewsPendingReview, color: "from-amber-500 to-orange-500" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-gray-900/50 p-5 backdrop-blur-xl">
                <p className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</p>
                <p className={`text-3xl font-bold mt-1 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Content by Type */}
          <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-6 backdrop-blur-xl">
            <h3 className="font-bold text-white mb-4">Content Generation by Type</h3>
            <div className="grid gap-3 sm:grid-cols-4">
              {data.contentStats.map((stat) => (
                <div key={stat.type} className="rounded-xl bg-gray-800 p-4 text-center">
                  <p className="text-2xl font-bold text-white">{stat.total}</p>
                  <p className="text-xs text-gray-400 uppercase mt-1">{stat.type}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== Users Tab ===== */}
      {activeTab === "users" && (
        <div className="rounded-2xl border border-white/10 bg-gray-900/50 backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="p-4 text-xs text-gray-500 uppercase">Name</th>
                  <th className="p-4 text-xs text-gray-500 uppercase">Email</th>
                  <th className="p-4 text-xs text-gray-500 uppercase">Plan</th>
                  <th className="p-4 text-xs text-gray-500 uppercase">EWS</th>
                  <th className="p-4 text-xs text-gray-500 uppercase">Credits</th>
                  <th className="p-4 text-xs text-gray-500 uppercase">Exam</th>
                  <th className="p-4 text-xs text-gray-500 uppercase">Joined</th>
                  <th className="p-4 text-xs text-gray-500 uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.allUsers.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-gray-800/50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-white">{u.name}</div>
                      {u.firstName && (
                        <div className="text-xs text-gray-500">
                          {u.firstName} {u.lastName}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-gray-400">{u.email}</td>
                    <td className="p-4">
                      <span className="inline-block rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400 border border-blue-500/20">
                        {u.subscriptionStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs border ${ewsStatusColor(u.ewsStatus)}`}>
                        {u.ewsStatus}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-green-400">{u.dailyCredits}</td>
                    <td className="p-4 text-gray-400">{u.targetExam || "—"}</td>
                    <td className="p-4 text-gray-500 text-xs">
                      {new Date(u.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleResetCredits(u.id)}
                        disabled={processing === u.id}
                        className="px-3 py-1.5 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md hover:bg-amber-500/20 transition-all disabled:opacity-50"
                      >
                        {processing === u.id ? "..." : "Reset Credits"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== Pending Reviews Tab ===== */}
      {activeTab === "reviews" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {(["ALL", "HIGH_RISK", "INCOME_EXCEEDED", "EXPIRED"] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setReviewFilter(filter)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  reviewFilter === filter 
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/30" 
                    : "bg-gray-800 text-gray-400 border-gray-700 hover:text-white"
                }`}
              >
                {filter.replace(/_/g, " ")} {filter === "ALL" ? `(${data.pendingReviews.length})` : ""}
              </button>
            ))}
          </div>
          {filteredReviews.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-8 text-center backdrop-blur-xl">
              <p className="text-gray-400">No pending reviews matching this filter. ✅</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-gray-900/50 backdrop-blur-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left bg-gray-800/20">
                      <th className="p-4 text-xs text-gray-500 uppercase">Applicant</th>
                      <th className="p-4 text-xs text-gray-500 uppercase">Document Data</th>
                      <th className="p-4 text-xs text-gray-500 uppercase">AI Risk Analysis</th>
                      <th className="p-4 text-xs text-gray-500 uppercase">Verification Flag</th>
                      <th className="p-4 text-xs text-gray-500 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReviews.map((u) => {
                      const flag = u.ewsVerificationFlag || "PENDING";
                      const docType = u.ewsDocumentType || null;
                      return (
                        <tr key={u.id} className="border-b border-white/5 hover:bg-gray-800/50 transition-colors">
                          {/* Applicant Info */}
                          <td className="p-4 align-top min-w-[200px]">
                            <div className="font-bold text-white">{u.firstName} {u.lastName}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{u.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{u.email}</div>
                            <button
                              onClick={() => fetchCertificate(u.id)}
                              className="mt-3 px-3 py-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-md hover:bg-blue-500/20 transition-all flex items-center gap-2"
                            >
                              👁 View Certificate
                            </button>
                          </td>

                          {/* Document Data */}
                          <td className="p-4 align-top text-xs space-y-2 min-w-[200px]">
                            <div className="grid grid-cols-[80px_1fr] gap-1">
                              <span className="text-gray-500">Name:</span>
                              {u.ewsExtractedName ? (
                                <span className="text-purple-300 font-mono">{u.ewsExtractedName}</span>
                              ) : <span className="text-gray-600">—</span>}
                              
                              <span className="text-gray-500">Income:</span>
                              {u.ewsExtractedIncome !== null ? (
                                <span className={`font-mono font-bold ${u.ewsExtractedIncome > 800000 ? "text-red-400" : "text-green-400"}`}>
                                  ₹{u.ewsExtractedIncome.toLocaleString("en-IN")}
                                </span>
                              ) : <span className="text-gray-600">—</span>}

                              <span className="text-gray-500">Issued:</span>
                              <span className="text-gray-400">{u.ewsIssueDate || "—"}</span>

                              <span className="text-gray-500">Type:</span>
                              <span>
                                {docType ? (
                                  <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold border ${docTypeColor(docType)}`}>
                                    {docType.replace(/_/g, " ")}
                                  </span>
                                ) : <span className="text-gray-600">—</span>}
                              </span>
                            </div>
                          </td>

                          {/* AI Risk Analysis */}
                          <td className="p-4 align-top min-w-[180px]">
                            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-gray-400">Risk Score:</span>
                                <span className={`text-lg font-black ${riskColor(u.ewsRiskScore)}`}>
                                  {u.ewsRiskScore ?? "?"}/100
                                </span>
                              </div>
                              <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-gray-700">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] text-gray-500">Recommendation:</span>
                                  <span className={`px-1.5 py-0.5 text-[10px] rounded border font-bold uppercase ${aiRecommColor(u.ewsAiRecommendation)}`}>
                                    {u.ewsAiRecommendation || "UNKNOWN"}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] text-gray-500">Blur Score:</span>
                                  <span className="text-[10px] text-gray-400 font-mono">{u.ewsBlurScore ?? "?"}/100</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Verification Flag (highlighted) */}
                          <td className="p-4 align-top min-w-[220px]">
                            {flag === "AUTO_CLEAR" ? (
                              <div className="rounded-md bg-green-500/10 border border-green-500/20 p-2 text-xs text-green-300 flex items-center gap-1.5">
                                <span>✅</span> <strong>Likely Valid</strong>
                                <p className="text-[10px] mt-1 opacity-80">Awaiting admin confirmation.</p>
                              </div>
                            ) : flag === "PENDING" ? (
                              <div className="rounded-md bg-gray-500/10 border border-gray-500/20 p-2 text-xs text-gray-400">
                                ⏳ Processing Background OCR...
                              </div>
                            ) : (
                              <div className="rounded-md bg-red-500/10 border border-red-500/20 p-2 text-xs text-red-300">
                                <strong>⚠️ {flag.replace(/_/g, " ")}</strong>
                                <p className="text-[10px] mt-1 opacity-80 leading-relaxed">
                                  {flagDescription(flag)}
                                </p>
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-right align-middle">
                            <div className="flex flex-col gap-2 min-w-[100px]">
                              <button
                                onClick={() => handleApprove(u.id)}
                                disabled={processing === u.id}
                                className="w-full rounded bg-green-600 hover:bg-green-700 px-3 py-1.5 text-xs font-bold text-white transition-all disabled:opacity-50 shadow-md shadow-green-500/10"
                              >
                                {processing === u.id ? "..." : "✓ Approve"}
                              </button>
                              <button
                                onClick={() => handleReject(u.id)}
                                disabled={processing === u.id}
                                className="w-full rounded bg-red-600 hover:bg-red-700 px-3 py-1.5 text-xs font-bold text-white transition-all disabled:opacity-50 shadow-md shadow-red-500/10"
                              >
                                {processing === u.id ? "..." : "✕ Reject"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Certificate Viewing Modal */}
      {certModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
           <div className="relative max-w-4xl w-full max-h-[90vh] bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex items-center justify-center p-4 shadow-2xl">
             <button
               onClick={() => { setCertModalOpen(false); setCertData(null); }}
               className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors"
             >
               ✕
             </button>
             {certLoading ? (
                <div className="flex flex-col items-center gap-4 py-20">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin"/>
                  <span className="text-gray-400 text-sm">Decrypting certificate...</span>
                </div>
             ) : certData ? (
                <img 
                  src={`data:${certData.mimeType};base64,${certData.base64Data}`}
                  alt="EWS Certificate"
                  className="max-h-[85vh] object-contain rounded-lg shadow-2xl ring-1 ring-white/10"
                />
             ) : (
                <div className="text-gray-500 py-20 text-center">
                  Failed to load certificate or no certificate exists.
                </div>
             )}
           </div>
        </div>
      )}

      {/* ===== Audit Logs Tab ===== */}
      {activeTab === "audit" && (
        <div className="rounded-2xl border border-white/10 bg-gray-900/50 backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="p-4 text-xs text-gray-500 uppercase">Time</th>
                  <th className="p-4 text-xs text-gray-500 uppercase">User</th>
                  <th className="p-4 text-xs text-gray-500 uppercase">Admin/System</th>
                  <th className="p-4 text-xs text-gray-500 uppercase">Action</th>
                  <th className="p-4 text-xs text-gray-500 uppercase">Confidence</th>
                  <th className="p-4 text-xs text-gray-500 uppercase">Name Match</th>
                  <th className="p-4 text-xs text-gray-500 uppercase">Income</th>
                  <th className="p-4 text-xs text-gray-500 uppercase">Reason</th>
                </tr>
              </thead>
              <tbody>
                {data.auditLogs.map((log) => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-gray-800/50 transition-colors">
                    <td className="p-4 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                    </td>
                    <td className="p-4">
                      <div className="text-white text-xs">{log.userName}</div>
                      <div className="text-gray-500 text-xs">{log.userEmail}</div>
                    </td>
                    <td className="p-4">
                      {log.adminEmail ? (
                        <span className="text-xs text-blue-400 font-mono" title={log.adminEmail}>
                          {log.adminEmail.split("@")[0]}
                        </span>
                      ) : (
                        <span className="text-xs text-purple-400 font-mono">system</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs border ${
                        log.action.includes("approved") ? "text-green-400 bg-green-500/10 border-green-500/20" :
                        log.action.includes("rejected") ? "text-red-400 bg-red-500/10 border-red-500/20" :
                        log.action === "needs_review" ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
                        "text-gray-400 bg-gray-500/10 border-gray-500/20"
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-blue-400 font-mono">{log.confidenceScore ?? "—"}</td>
                    <td className="p-4 text-purple-400 font-mono">{log.nameMatchScore ?? "—"}</td>
                    <td className="p-4 text-green-400 font-mono">
                      {log.extractedIncome !== null ? `₹${log.extractedIncome.toLocaleString("en-IN")}` : "—"}
                    </td>
                    <td className="p-4 text-gray-400 text-xs max-w-xs truncate" title={log.decisionReason}>
                      {log.decisionReason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

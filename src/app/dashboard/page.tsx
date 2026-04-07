"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const participants = [
  { code: "SNU-001", animal: "🐶", level: 7, compliance: 95, emaRate: 92, streak: 12, status: "active" },
  { code: "SNU-002", animal: "🐱", level: 5, compliance: 78, emaRate: 85, streak: 5, status: "active" },
  { code: "SNU-003", animal: "🦊", level: 8, compliance: 98, emaRate: 96, streak: 21, status: "active" },
  { code: "SNU-004", animal: "🐰", level: 3, compliance: 45, emaRate: 40, streak: 0, status: "warning" },
  { code: "SNU-005", animal: "🐻", level: 6, compliance: 88, emaRate: 90, streak: 8, status: "active" },
  { code: "SNU-006", animal: "🐶", level: 9, compliance: 100, emaRate: 100, streak: 30, status: "active" },
  { code: "SNU-007", animal: "🐱", level: 2, compliance: 30, emaRate: 25, streak: 0, status: "danger" },
  { code: "SNU-008", animal: "🦊", level: 4, compliance: 65, emaRate: 70, streak: 3, status: "active" },
  { code: "SNU-009", animal: "🐰", level: 6, compliance: 82, emaRate: 88, streak: 7, status: "active" },
  { code: "SNU-010", animal: "🐻", level: 1, compliance: 20, emaRate: 15, streak: 0, status: "danger" },
];

const stats = {
  total: 160,
  active: 148,
  avgCompliance: 72,
  avgEMA: 68,
  atRisk: 12,
};

function ComplianceBar({ value }: { value: number }) {
  const color =
    value >= 80 ? "bg-emerald-500" : value >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
      <span className="text-xs font-mono text-slate-600">{value}%</span>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "warning" | "danger">("all");

  const filtered = participants.filter(
    (p) => filter === "all" || p.status === filter || (filter === "warning" && p.status === "danger")
  );

  return (
    <div className="mobile-frame flex flex-col bg-slate-50 pb-6">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-5 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">관리자 대시보드</h1>
            <p className="text-xs text-slate-500">RunLab 연구 모니터링</p>
          </div>
          <motion.button
            onClick={() => router.push("/home")}
            className="text-xs px-3 py-1.5 bg-slate-100 rounded-full text-slate-600"
            whileTap={{ scale: 0.95 }}
          >
            ← 앱으로
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: "전체 참여자", value: stats.total, icon: "👥" },
            { label: "평균 착용률", value: `${stats.avgCompliance}%`, icon: "⌚" },
            { label: "위험 참여자", value: stats.atRisk, icon: "⚠️" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-50 rounded-xl p-3 text-center"
            >
              <div className="text-lg">{stat.icon}</div>
              <div className="text-lg font-bold text-slate-800">{stat.value}</div>
              <div className="text-[10px] text-slate-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Weekly Chart (Simple Bar) */}
      <div className="mx-5 mt-4 bg-white rounded-2xl p-4 shadow-sm">
        <div className="text-sm font-semibold text-slate-700 mb-3">
          주간 착용률 추이
        </div>
        <div className="flex items-end gap-2 h-24">
          {[65, 72, 68, 75, 70, 78, 72].map((val, i) => (
            <motion.div
              key={i}
              className="flex-1 flex flex-col items-center gap-1"
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
            >
              <motion.div
                className="w-full rounded-t-lg bg-gradient-to-t from-emerald-500 to-emerald-400"
                initial={{ height: 0 }}
                animate={{ height: `${val}%` }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                style={{ minHeight: 4 }}
              />
              <span className="text-[10px] text-slate-400">
                {["월", "화", "수", "목", "금", "토", "일"][i]}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div className="mx-5 mt-4 flex gap-2">
        {[
          { key: "all", label: "전체" },
          { key: "warning", label: "⚠️ 위험" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as typeof filter)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${
                filter === f.key
                  ? "bg-slate-800 text-white"
                  : "bg-white text-slate-600 border border-slate-200"
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Participant Table */}
      <div className="mx-5 mt-3 bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs">
                <th className="text-left py-2.5 px-3 font-medium">참여자</th>
                <th className="text-left py-2.5 px-2 font-medium">착용률</th>
                <th className="text-left py-2.5 px-2 font-medium">EMA</th>
                <th className="text-right py-2.5 px-3 font-medium">연속</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <motion.tr
                  key={p.code}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={`border-t border-slate-100 ${
                    p.status === "danger"
                      ? "bg-red-50"
                      : p.status === "warning"
                      ? "bg-amber-50"
                      : ""
                  }`}
                >
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{p.animal}</span>
                      <div>
                        <div className="font-medium text-slate-800 text-xs">
                          {p.code}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Lv.{p.level}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-2">
                    <ComplianceBar value={p.compliance} />
                  </td>
                  <td className="py-2.5 px-2">
                    <ComplianceBar value={p.emaRate} />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`text-xs font-mono ${
                        p.streak > 0 ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {p.streak > 0 ? `🔥${p.streak}일` : "중단"}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Demo Button */}
      <motion.button
        className="mx-5 mt-4 py-3 rounded-2xl border-2 border-dashed border-slate-300 text-sm text-slate-500"
        whileTap={{ scale: 0.98 }}
      >
        📊 CSV 데이터 내보내기 (향후 구현)
      </motion.button>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  loadState,
  saveState,
  resetState,
  getStage,
  xpForLevel,
  ANIMALS,
  GameState,
} from "@/store/gameStore";

const STAGE_LABELS = {
  egg: "알",
  baby: "새끼",
  young: "청소년",
  adult: "성체",
};

export default function HomePage() {
  const router = useRouter();
  const [state, setState] = useState<GameState | null>(null);
  const [showDemo, setShowDemo] = useState(false);
  const [levelUpFlash, setLevelUpFlash] = useState(false);
  const [penaltyFlash, setPenaltyFlash] = useState(false);

  useEffect(() => {
    const s = loadState();
    if (!s.animal) {
      router.replace("/select");
      return;
    }
    setState(s);
  }, [router]);

  if (!state || !state.animal) return null;

  const animal = ANIMALS[state.animal];
  const stage = getStage(state.level);
  const emoji = animal.emoji[stage];
  const needed = xpForLevel(state.level);
  const progress = Math.min((state.xp / needed) * 100, 100);

  const missions = [
    {
      label: "기상 EMA 설문 완료",
      done: state.todayEMA,
      icon: "📋",
      actionLabel: state.todayEMA ? null : "알람 해제 시 자동 실행",
      action: null,
    },
    {
      label: "워치 착용 확인",
      done: state.todayWatchWorn,
      icon: "⌚",
      actionLabel: state.todayWatchWorn ? null : "취침 시작 시 자동 완료",
      action: null,
    },
    {
      label: "러닝 기록 동기화",
      done: false,
      icon: "🏃",
      actionLabel: "향후 연동 예정",
      action: null,
    },
  ];

  const weekDays = ["월", "화", "수", "목", "금", "토", "일"];
  const weekData = [true, true, true, true, false, true, null]; // demo: 이번 주 착용 현황

  return (
    <div className="mobile-frame flex flex-col bg-gradient-to-b from-slate-50 to-white pb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <div>
          <div className="text-sm text-slate-500">안녕하세요 👋</div>
          <div className="font-bold text-slate-800">{state.participantCode}</div>
        </div>
        <motion.button
          onClick={() => router.push("/dashboard")}
          className="text-xs px-3 py-1.5 bg-slate-100 rounded-full text-slate-600"
          whileTap={{ scale: 0.95 }}
        >
          관리자 보기
        </motion.button>
      </div>

      {/* Character Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-5 mt-3 p-6 rounded-3xl bg-gradient-to-br shadow-xl"
        style={{
          background: `linear-gradient(135deg, ${animal.color}15, ${animal.color}30)`,
          boxShadow: `0 8px 30px ${animal.color}20`,
        }}
      >
        {/* Character Display */}
        <div className="text-center">
          <motion.div
            className="text-8xl mb-2 inline-block"
            animate={{
              y: [0, -12, 0],
              rotate: [0, 3, -3, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {emoji}
          </motion.div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
              style={{ background: animal.color }}
            >
              Lv.{state.level}
            </span>
            <span className="text-sm text-slate-600 font-medium">
              {animal.name} · {STAGE_LABELS[stage]}
            </span>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mt-2">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>EXP</span>
            <span>
              {state.xp} / {needed}
            </span>
          </div>
          <div className="h-3 bg-white/60 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: animal.color }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center justify-center gap-1 mt-3">
          <span className="text-lg">🔥</span>
          <span className="text-sm font-semibold text-slate-700">
            {state.streak}일 연속 참여 중!
          </span>
        </div>
      </motion.div>

      {/* Alarm & Sleep Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-5 mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg shadow-indigo-200"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⏰</span>
            <div>
              <div className="text-xs text-indigo-200">기상 알람</div>
              <div className="text-xl font-bold tabular-nums">
                {String(state.alarmHour).padStart(2, "0")}:{String(state.alarmMinute).padStart(2, "0")}
              </div>
            </div>
          </div>
          <motion.button
            onClick={() => router.push("/alarm")}
            className="text-xs px-3 py-1.5 bg-white/20 rounded-full"
            whileTap={{ scale: 0.95 }}
          >
            설정 변경
          </motion.button>
        </div>
        <motion.button
          onClick={() => router.push("/sleep")}
          className="w-full py-3 bg-white/20 rounded-xl text-sm font-semibold
            flex items-center justify-center gap-2 backdrop-blur"
          whileTap={{ scale: 0.97 }}
        >
          <span className="text-lg">🌙</span> 취침 시작하기
        </motion.button>
      </motion.div>

      {/* Weekly Compliance */}
      <div className="mx-5 mt-5">
        <div className="text-sm font-semibold text-slate-700 mb-2">
          이번 주 착용 현황
        </div>
        <div className="flex gap-2">
          {weekDays.map((day, i) => (
            <motion.div
              key={day}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 * i }}
              className={`flex-1 flex flex-col items-center py-2 rounded-xl text-xs
                ${
                  weekData[i] === true
                    ? "bg-emerald-100 text-emerald-700"
                    : weekData[i] === false
                    ? "bg-red-100 text-red-400"
                    : "bg-slate-100 text-slate-400"
                }`}
            >
              <span>{day}</span>
              <span className="text-base mt-0.5">
                {weekData[i] === true
                  ? "✅"
                  : weekData[i] === false
                  ? "❌"
                  : "·"}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Today's Missions */}
      <div className="mx-5 mt-5">
        <div className="text-sm font-semibold text-slate-700 mb-2">
          오늘의 미션
        </div>
        <div className="flex flex-col gap-2">
          {missions.map((mission, i) => (
            <motion.div
              key={mission.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border-2
                ${
                  mission.done
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200 bg-white"
                }`}
            >
              <span className="text-2xl">{mission.icon}</span>
              <span
                className={`flex-1 text-sm font-medium ${
                  mission.done
                    ? "text-emerald-600 line-through"
                    : "text-slate-700"
                }`}
              >
                {mission.label}
              </span>
              {mission.done ? (
                <span className="text-emerald-500 text-sm font-bold">
                  +10 XP
                </span>
              ) : (
                <span className="text-xs text-slate-400">
                  {mission.actionLabel}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* ===== Demo Control Panel ===== */}
      <div className="mx-5 mt-6">
        <button
          onClick={() => setShowDemo((v) => !v)}
          className="w-full py-2 text-xs text-slate-400 border border-dashed border-slate-300 rounded-xl"
        >
          {showDemo ? "▲ 시연 패널 닫기" : "▼ 시연 패널 열기"}
        </button>

        <AnimatePresence>
          {showDemo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 p-4 bg-slate-100 rounded-2xl border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 mb-3">
                  🎮 시연 컨트롤
                </div>

                {/* Level Control */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-slate-500 w-16">레벨</span>
                  <div className="flex gap-1.5 flex-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lv) => (
                      <motion.button
                        key={lv}
                        onClick={() => {
                          const newXp = lv > state.level ? 0 : state.xp;
                          saveState({ level: lv, xp: newXp });
                          setState((prev) => prev && { ...prev, level: lv, xp: newXp });
                          if (lv > state.level) {
                            setLevelUpFlash(true);
                            setTimeout(() => setLevelUpFlash(false), 1500);
                          }
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all
                          ${
                            lv === state.level
                              ? "text-white shadow-md"
                              : lv <= state.level
                              ? "bg-white text-slate-600"
                              : "bg-white/50 text-slate-400"
                          }`}
                        style={lv === state.level ? { background: animal.color } : {}}
                        whileTap={{ scale: 0.9 }}
                      >
                        {lv}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Stage Preview */}
                <div className="flex items-center justify-around bg-white rounded-xl p-3 mb-3">
                  {(["egg", "baby", "young", "adult"] as const).map((s) => (
                    <div
                      key={s}
                      className={`flex flex-col items-center gap-1 ${
                        getStage(state.level) === s
                          ? "opacity-100"
                          : "opacity-30"
                      }`}
                    >
                      <span className="text-3xl">{animal.emoji[s]}</span>
                      <span className="text-[10px] text-slate-500">
                        {STAGE_LABELS[s]}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    onClick={() => {
                      const nextLv = Math.min(state.level + 1, 10);
                      saveState({ level: nextLv, xp: 0 });
                      setState((prev) => prev && { ...prev, level: nextLv, xp: 0 });
                      setLevelUpFlash(true);
                      setTimeout(() => setLevelUpFlash(false), 1500);
                    }}
                    disabled={state.level >= 10}
                    className="py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 text-white
                      disabled:bg-slate-300 disabled:text-slate-500"
                    whileTap={{ scale: 0.95 }}
                  >
                    ⬆️ 레벨업
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      saveState({ level: 1, xp: 0, streak: 0 });
                      setState((prev) =>
                        prev && { ...prev, level: 1, xp: 0, streak: 0 }
                      );
                      setPenaltyFlash(true);
                      setTimeout(() => setPenaltyFlash(false), 2000);
                    }}
                    className="py-2.5 rounded-xl text-xs font-semibold bg-red-500 text-white"
                    whileTap={{ scale: 0.95 }}
                  >
                    💀 7일 미참여 (알로 퇴화)
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      const newXp = state.xp + 30;
                      const needed = xpForLevel(state.level);
                      if (newXp >= needed && state.level < 10) {
                        saveState({ level: state.level + 1, xp: 0 });
                        setState((prev) => prev && { ...prev, level: state.level + 1, xp: 0 });
                        setLevelUpFlash(true);
                        setTimeout(() => setLevelUpFlash(false), 1500);
                      } else {
                        saveState({ xp: Math.min(newXp, needed) });
                        setState((prev) => prev && { ...prev, xp: Math.min(newXp, needed) });
                      }
                    }}
                    className="py-2.5 rounded-xl text-xs font-semibold bg-amber-500 text-white"
                    whileTap={{ scale: 0.95 }}
                  >
                    ✨ XP +30
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      saveState({
                        level: 1, xp: 0, streak: 3, todayEMA: false,
                        todayWatchWorn: false,
                      });
                      setState((prev) =>
                        prev && {
                          ...prev, level: 1, xp: 0, streak: 3,
                          todayEMA: false, todayWatchWorn: false,
                        }
                      );
                    }}
                    className="py-2.5 rounded-xl text-xs font-semibold bg-slate-500 text-white"
                    whileTap={{ scale: 0.95 }}
                  >
                    🔄 상태 초기화
                  </motion.button>
                </div>
                {/* Full Reset */}
                <motion.button
                  onClick={() => {
                    resetState();
                    router.push("/");
                  }}
                  className="w-full mt-2 py-2 rounded-xl text-xs text-red-400 border border-red-200 bg-red-50"
                  whileTap={{ scale: 0.97 }}
                >
                  🗑️ 전체 초기화 (처음부터 다시)
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===== Level Up Overlay ===== */}
      <AnimatePresence>
        {levelUpFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setLevelUpFlash(false)}
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: [0, 1.2, 1], rotate: [-20, 5, 0] }}
              exit={{ scale: 0, opacity: 0 }}
              className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-xs mx-8"
            >
              <motion.div
                className="text-7xl mb-3"
                animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.8, repeat: 2 }}
              >
                {animal.emoji[getStage(state.level)]}
              </motion.div>
              <div className="text-2xl font-bold text-slate-800 mb-1">
                Level Up! 🎉
              </div>
              <div className="text-sm text-slate-500">
                Lv.{state.level} · {animal.name} ({STAGE_LABELS[getStage(state.level)]})
              </div>
              {/* Sparkles */}
              {[...Array(8)].map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute text-xl"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: Math.cos((i * Math.PI * 2) / 8) * 80,
                    y: Math.sin((i * Math.PI * 2) / 8) * 80,
                    scale: [0, 1.2, 0],
                  }}
                  transition={{ delay: i * 0.08, duration: 0.8 }}
                  style={{ left: "50%", top: "40%" }}
                >
                  ✨
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Penalty Overlay ===== */}
      <AnimatePresence>
        {penaltyFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setPenaltyFlash(false)}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.1, 1] }}
              exit={{ scale: 0, opacity: 0 }}
              className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-xs mx-8"
            >
              <motion.div
                className="text-7xl mb-3"
                animate={{ scale: [1, 0.8, 1], rotate: [0, -5, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🥚
              </motion.div>
              <div className="text-xl font-bold text-red-500 mb-1">
                7일 미참여...
              </div>
              <div className="text-sm text-slate-500 mb-3">
                {animal.name}가 다시 알로 돌아갔어요 😢
              </div>
              <div className="text-xs text-slate-400 bg-red-50 rounded-xl p-3">
                연속 7일 미참여 시 캐릭터가 알 단계로 퇴화합니다.
                <br />다시 참여하면 성장을 시작할 수 있어요!
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

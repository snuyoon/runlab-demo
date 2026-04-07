"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { loadState, saveState, ANIMALS, getStage } from "@/store/gameStore";

type Phase = "bedtime" | "sleeping" | "alarm" | "dismiss";

export default function SleepPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("bedtime");
  const [state, setState] = useState(loadState());
  const [currentTime, setCurrentTime] = useState("");
  const [alarmPulse, setAlarmPulse] = useState(false);
  const [slideX, setSlideX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const animal = state.animal ? ANIMALS[state.animal] : null;
  const stage = state.animal ? getStage(state.level) : "egg";
  const alarmTime = `${String(state.alarmHour).padStart(2, "0")}:${String(state.alarmMinute).padStart(2, "0")}`;

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const startSleep = useCallback(() => {
    saveState({ isSleeping: true, todayWatchWorn: true });
    setPhase("sleeping");
  }, []);

  const triggerAlarm = useCallback(() => {
    setPhase("alarm");
    setAlarmPulse(true);
  }, []);

  const dismissAlarm = useCallback(() => {
    setPhase("dismiss");
    saveState({ isSleeping: false });
    setTimeout(() => router.push("/ema"), 1200);
  }, [router]);

  // Slide to dismiss handler
  const handleSlideEnd = useCallback(() => {
    if (slideX > 200) {
      dismissAlarm();
    }
    setSlideX(0);
    setIsDragging(false);
  }, [slideX, dismissAlarm]);

  return (
    <div className="mobile-frame flex flex-col">
      <AnimatePresence mode="wait">
        {/* ===== Phase 1: Bedtime — 취침 시작 버튼 ===== */}
        {phase === "bedtime" && (
          <motion.div
            key="bedtime"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center flex-1 px-8
              bg-gradient-to-b from-indigo-900 to-slate-900 text-white"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">🌙</div>
              <h1 className="text-2xl font-bold mb-2">취침 준비</h1>
              <p className="text-indigo-300 text-sm mb-8">
                워치를 착용하고 아래 버튼을 눌러주세요
              </p>

              {/* Watch Reminder */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-white/10 rounded-2xl p-4 mb-6 backdrop-blur"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">⌚</span>
                  <div className="text-left">
                    <div className="font-semibold text-sm">수면 워치 착용</div>
                    <div className="text-xs text-indigo-300">
                      손목에 워치를 차고 주무세요
                    </div>
                  </div>
                  <span className="text-emerald-400 text-xl ml-auto">✓</span>
                </div>
              </motion.div>

              {/* Alarm Info */}
              <div className="bg-white/10 rounded-2xl p-4 mb-8 backdrop-blur">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">⏰</span>
                  <div className="text-left">
                    <div className="font-semibold text-sm">기상 알람</div>
                    <div className="text-xs text-indigo-300">
                      내일 아침 {alarmTime}에 알람이 울려요
                    </div>
                  </div>
                </div>
              </div>

              {/* Character */}
              {animal && (
                <motion.div
                  className="text-6xl mb-6"
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {animal.emoji[stage]}
                  <span className="text-3xl ml-1">💤</span>
                </motion.div>
              )}
            </motion.div>

            <motion.button
              onClick={startSleep}
              className="w-full py-4 rounded-2xl text-lg font-semibold
                bg-gradient-to-r from-indigo-500 to-purple-600 text-white
                shadow-lg shadow-indigo-900/50"
              whileTap={{ scale: 0.97 }}
            >
              😴 취침 시작하기
            </motion.button>

            <button
              onClick={() => router.push("/home")}
              className="text-indigo-400 text-sm mt-4"
            >
              돌아가기
            </button>
          </motion.div>
        )}

        {/* ===== Phase 2: Sleeping — 수면 중 (어두운 화면) ===== */}
        {phase === "sleeping" && (
          <motion.div
            key="sleeping"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center flex-1 px-8 bg-slate-950 text-white"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              {/* Dim clock */}
              <motion.div
                className="text-6xl font-light text-white/20 tabular-nums mb-4"
                animate={{ opacity: [0.15, 0.25, 0.15] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                {currentTime}
              </motion.div>

              {/* Sleeping character */}
              {animal && (
                <motion.div
                  className="text-7xl mb-4"
                  animate={{ y: [0, -3, 0], scale: [1, 1.02, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {animal.emoji[stage]}
                </motion.div>
              )}

              {/* Zzz animation */}
              <div className="relative h-12 mb-6">
                {["💤", "💤", "💤"].map((z, i) => (
                  <motion.span
                    key={i}
                    className="absolute text-2xl"
                    style={{ left: `${40 + i * 15}%` }}
                    animate={{
                      y: [0, -30, -60],
                      x: [0, 10, 20],
                      opacity: [0, 0.6, 0],
                      scale: [0.6, 1, 0.8],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 1,
                    }}
                  >
                    {z}
                  </motion.span>
                ))}
              </div>

              <p className="text-white/30 text-sm mb-2">수면 중...</p>
              <p className="text-white/20 text-xs">
                알람: {alarmTime}
              </p>
            </motion.div>

            {/* Demo: Skip to alarm button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              onClick={triggerAlarm}
              className="mt-12 px-6 py-3 rounded-full text-sm
                bg-white/10 text-white/50 border border-white/10"
              whileTap={{ scale: 0.95 }}
            >
              ⏩ 시연: 알람 울리기
            </motion.button>
          </motion.div>
        )}

        {/* ===== Phase 3: Alarm Ringing ===== */}
        {phase === "alarm" && (
          <motion.div
            key="alarm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center flex-1 px-8 bg-slate-950 text-white"
          >
            {/* Pulsing background */}
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  "radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(0,0,0,0) 70%)",
                  "radial-gradient(circle, rgba(239,68,68,0.3) 0%, rgba(0,0,0,0) 70%)",
                  "radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(0,0,0,0) 70%)",
                ],
              }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />

            {/* Alarm time */}
            <motion.div
              className="text-7xl font-bold text-white tabular-nums mb-4 z-10"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              {alarmTime}
            </motion.div>

            {/* Ringing bell */}
            <motion.div
              className="text-8xl mb-2 z-10"
              animate={{ rotate: [0, 15, -15, 15, -15, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              🔔
            </motion.div>

            {/* Character waking */}
            {animal && (
              <motion.div
                className="text-5xl mb-8 z-10"
                animate={{ x: [0, -5, 5, -5, 5, 0] }}
                transition={{ duration: 0.4, repeat: Infinity }}
              >
                {animal.emoji[stage]} 😵
              </motion.div>
            )}

            {/* Slide to dismiss */}
            <div className="w-full max-w-xs relative z-10">
              <div className="bg-white/10 rounded-full h-16 relative overflow-hidden backdrop-blur">
                {/* Track label */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center text-white/30 text-sm"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  밀어서 알람 끄기 →
                </motion.div>

                {/* Slide handle */}
                <motion.div
                  className="absolute left-1 top-1 w-14 h-14 bg-white rounded-full
                    flex items-center justify-center text-2xl cursor-grab active:cursor-grabbing
                    shadow-lg"
                  drag="x"
                  dragConstraints={{ left: 0, right: 260 }}
                  dragElastic={0.1}
                  onDrag={(_, info) => {
                    setSlideX(info.offset.x);
                    setIsDragging(true);
                  }}
                  onDragEnd={handleSlideEnd}
                  animate={!isDragging ? { x: 0 } : {}}
                  whileDrag={{ scale: 1.1 }}
                  style={{ x: isDragging ? undefined : 0 }}
                >
                  ☀️
                </motion.div>
              </div>
            </div>

            {/* Vibration bars visual */}
            <div className="flex gap-1 mt-6 z-10">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-red-400 rounded-full"
                  animate={{ height: [8, 24, 8] }}
                  transition={{
                    duration: 0.4,
                    repeat: Infinity,
                    delay: i * 0.08,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ===== Phase 4: Dismissed — EMA 전환 ===== */}
        {phase === "dismiss" && (
          <motion.div
            key="dismiss"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center flex-1 px-8
              bg-gradient-to-b from-amber-50 to-orange-50"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-center"
            >
              <div className="text-7xl mb-4">☀️</div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                좋은 아침이에요!
              </h2>
              {animal && (
                <motion.div
                  className="text-5xl my-4"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 0.6, repeat: 2 }}
                >
                  {animal.emoji[stage]} 👋
                </motion.div>
              )}
              <p className="text-slate-500 text-sm">
                간단한 설문을 시작할게요...
              </p>
              <motion.div
                className="mt-6 flex justify-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full bg-amber-400"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

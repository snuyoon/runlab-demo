"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { loadState, saveState, ANIMALS, getStage } from "@/store/gameStore";

interface Question {
  id: string;
  label: string;
  emojis: string[];
  labels: string[];
}

const questions: Question[] = [
  {
    id: "sleep",
    label: "어젯밤 수면은 어떠셨나요?",
    emojis: ["😫", "😕", "😐", "🙂", "😄"],
    labels: ["매우 나쁨", "나쁨", "보통", "좋음", "매우 좋음"],
  },
  {
    id: "muscle",
    label: "근육통/피로감은 어떠세요?",
    emojis: ["😵", "😣", "😐", "💪", "🤸"],
    labels: ["매우 심함", "심함", "보통", "가벼움", "없음"],
  },
  {
    id: "mood",
    label: "오늘 기분은 어떠세요?",
    emojis: ["😞", "😔", "😐", "😊", "🤩"],
    labels: ["매우 나쁨", "나쁨", "보통", "좋음", "매우 좋음"],
  },
];

export default function EMAPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showXP, setShowXP] = useState(false);

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  const handleSelect = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    if (!allAnswered) return;
    setSubmitted(true);

    const state = loadState();
    const newXp = state.xp + 30;
    saveState({
      todayEMA: true,
      xp: newXp,
      streak: state.streak + 1,
    });

    setTimeout(() => setShowXP(true), 600);
    setTimeout(() => router.push("/home"), 2500);
  };

  const state = loadState();
  const animal = state.animal ? ANIMALS[state.animal] : null;
  const stage = state.animal ? getStage(state.level) : "egg";

  return (
    <div className="mobile-frame flex flex-col bg-gradient-to-b from-blue-50 to-indigo-50">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30 }}
            className="flex flex-col flex-1 px-5 pt-8 pb-6"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => router.back()}
                className="text-slate-400 text-xl"
              >
                ←
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  기상 EMA 설문
                </h1>
                <p className="text-xs text-slate-500">
                  오늘의 컨디션을 알려주세요
                </p>
              </div>
            </div>

            {/* Questions */}
            <div className="flex flex-col gap-6 flex-1">
              {questions.map((q, qi) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: qi * 0.15 }}
                >
                  <div className="text-sm font-semibold text-slate-700 mb-3">
                    {q.label}
                  </div>
                  <div className="flex gap-2 justify-between">
                    {q.emojis.map((emoji, i) => {
                      const isSelected = answers[q.id] === i + 1;
                      return (
                        <motion.button
                          key={i}
                          onClick={() => handleSelect(q.id, i + 1)}
                          className={`flex flex-col items-center gap-1 flex-1 py-3 rounded-2xl border-2 transition-all
                            ${
                              isSelected
                                ? "border-indigo-400 bg-indigo-50 shadow-lg shadow-indigo-100"
                                : "border-slate-200 bg-white"
                            }`}
                          whileTap={{ scale: 0.9 }}
                          animate={
                            isSelected ? { scale: [1, 1.15, 1] } : { scale: 1 }
                          }
                        >
                          <span
                            className={`transition-all ${
                              isSelected ? "text-4xl" : "text-3xl"
                            }`}
                          >
                            {emoji}
                          </span>
                          <span
                            className={`text-[10px] ${
                              isSelected
                                ? "text-indigo-600 font-semibold"
                                : "text-slate-400"
                            }`}
                          >
                            {q.labels[i]}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Submit */}
            <motion.button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className={`w-full py-4 rounded-2xl text-lg font-semibold text-white mt-4 transition-all
                ${
                  allAnswered
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-200"
                    : "bg-slate-300 cursor-not-allowed"
                }`}
              whileHover={allAnswered ? { scale: 1.02 } : {}}
              whileTap={allAnswered ? { scale: 0.97 } : {}}
              animate={
                allAnswered
                  ? {
                      boxShadow: [
                        "0 4px 14px rgba(99,102,241,0.2)",
                        "0 4px 20px rgba(99,102,241,0.4)",
                        "0 4px 14px rgba(99,102,241,0.2)",
                      ],
                    }
                  : {}
              }
              transition={allAnswered ? { duration: 2, repeat: Infinity } : {}}
            >
              {allAnswered ? "제출하기 ✨" : `${Object.keys(answers).length}/3 응답 완료`}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center flex-1 px-8"
          >
            {/* Character Celebration */}
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 10, -10, 10, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatDelay: 0.5,
              }}
              className="text-[120px] mb-4"
            >
              {animal ? animal.emoji[stage] : "🎉"}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="text-2xl font-bold text-slate-800 mb-1">
                오늘도 수고했어요! 🎉
              </div>
              <div className="text-slate-500">
                {animal?.name}가 기뻐하고 있어요
              </div>
            </motion.div>

            {/* XP Gain Animation */}
            <AnimatePresence>
              {showXP && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.5 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl shadow-lg"
                >
                  <div className="text-white font-bold text-lg">+30 XP 획득!</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sparkles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: Math.cos((i * Math.PI * 2) / 6) * 100,
                  y: Math.sin((i * Math.PI * 2) / 6) * 100 - 50,
                }}
                transition={{ delay: 0.2 + i * 0.1, duration: 1 }}
              >
                ✨
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

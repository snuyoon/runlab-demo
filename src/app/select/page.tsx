"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { saveState, ANIMALS, AnimalType } from "@/store/gameStore";

const animalList: { type: AnimalType; emoji: string; name: string; desc: string }[] = [
  { type: "dog", emoji: "🐶", name: "강아지", desc: "충실한 러닝 파트너" },
  { type: "cat", emoji: "🐱", name: "고양이", desc: "우아한 스프린터" },
  { type: "rabbit", emoji: "🐰", name: "토끼", desc: "빠른 발의 달리기 선수" },
  { type: "fox", emoji: "🦊", name: "여우", desc: "영리한 트레일 러너" },
  { type: "bear", emoji: "🐻", name: "곰", desc: "묵직한 울트라 러너" },
];

export default function SelectPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<AnimalType | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (!selected) return;
    setConfirmed(true);
    saveState({ animal: selected });
    setTimeout(() => router.push("/home"), 800);
  };

  return (
    <div className="mobile-frame flex flex-col px-6 py-12 bg-gradient-to-b from-amber-50 to-orange-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-slate-800">러닝 파트너 선택</h1>
        <p className="text-slate-500 mt-1 text-sm">
          함께 달릴 동물 친구를 골라주세요
        </p>
      </motion.div>

      <div className="flex flex-col gap-3 flex-1">
        {animalList.map((animal, i) => (
          <motion.button
            key={animal.type}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setSelected(animal.type)}
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all
              ${
                selected === animal.type
                  ? "border-amber-400 bg-amber-50 shadow-lg shadow-amber-100"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
          >
            <motion.span
              className="text-5xl"
              animate={
                selected === animal.type
                  ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }
                  : {}
              }
              transition={{ duration: 0.5 }}
            >
              {animal.emoji}
            </motion.span>
            <div className="text-left">
              <div className="font-semibold text-slate-800">{animal.name}</div>
              <div className="text-sm text-slate-500">{animal.desc}</div>
            </div>
            {selected === animal.type && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-auto text-2xl"
              >
                ✅
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      <motion.button
        onClick={handleConfirm}
        disabled={!selected}
        className={`w-full mt-6 py-4 rounded-2xl text-lg font-semibold text-white transition-all
          ${
            selected
              ? "bg-gradient-to-r from-amber-500 to-orange-500"
              : "bg-slate-300 cursor-not-allowed"
          }`}
        whileHover={selected ? { scale: 1.02 } : {}}
        whileTap={selected ? { scale: 0.97 } : {}}
      >
        {confirmed ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.3, 1] }}
          >
            🎉 좋은 선택!
          </motion.span>
        ) : selected ? (
          `${ANIMALS[selected].name}와 함께 시작하기`
        ) : (
          "동물을 선택해주세요"
        )}
      </motion.button>
    </div>
  );
}

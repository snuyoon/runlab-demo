"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { loadState, ANIMALS, getStage } from "@/store/gameStore";

/** 하트/반응 파티클 */
interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

/** 풀숲 장식물 */
const SCENERY = [
  { emoji: "🌿", x: 8, y: 75, size: "text-3xl" },
  { emoji: "🌱", x: 22, y: 82, size: "text-2xl" },
  { emoji: "🪨", x: 70, y: 80, size: "text-2xl" },
  { emoji: "🌸", x: 85, y: 70, size: "text-xl" },
  { emoji: "🌿", x: 55, y: 85, size: "text-3xl" },
  { emoji: "🍀", x: 40, y: 78, size: "text-xl" },
  { emoji: "🌻", x: 15, y: 65, size: "text-2xl" },
  { emoji: "🌿", x: 90, y: 82, size: "text-2xl" },
  { emoji: "🪵", x: 75, y: 88, size: "text-xl" },
  { emoji: "🌱", x: 50, y: 72, size: "text-lg" },
  { emoji: "🦋", x: 30, y: 40, size: "text-xl" },
  { emoji: "🐝", x: 65, y: 35, size: "text-sm" },
];

const REACTION_EMOJIS = ["❤️", "💕", "✨", "💖", "🥰", "⭐"];
const HAPPY_FACES = ["😆", "🥰", "😍", "🤗", "😊", "💕"];

export default function PlaygroundPage() {
  const router = useRouter();
  const state = loadState();
  const animal = state.animal ? ANIMALS[state.animal] : null;
  const stage = state.animal ? getStage(state.level) : "egg";
  const charEmoji = animal ? animal.emoji[stage] : "🥚";

  // 캐릭터 위치 (% 기반)
  const [charX, setCharX] = useState(50);
  const [charY, setCharY] = useState(55);
  const [targetX, setTargetX] = useState(50);
  const [targetY, setTargetY] = useState(55);
  const [facingLeft, setFacingLeft] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  const [isPetting, setIsPetting] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [happyFace, setHappyFace] = useState<string | null>(null);
  const [petCount, setPetCount] = useState(0);
  const particleId = useRef(0);
  const walkTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const charControls = useAnimation();

  // 랜덤 위치로 이동 (자동 산책)
  const wanderToRandom = useCallback(() => {
    const nx = 15 + Math.random() * 70; // 15~85%
    const ny = 40 + Math.random() * 35; // 40~75%
    setTargetX(nx);
    setTargetY(ny);
    setFacingLeft(nx < charX);
    setIsWalking(true);

    // 도착 후 잠시 멈췄다가 다시 이동
    const duration = 2000 + Math.random() * 2000;
    walkTimer.current = setTimeout(() => {
      setCharX(nx);
      setCharY(ny);
      setIsWalking(false);

      // 잠시 쉬었다가 다시 산책
      walkTimer.current = setTimeout(() => {
        wanderToRandom();
      }, 1500 + Math.random() * 3000);
    }, duration);
  }, [charX]);

  // 자동 산책 시작
  useEffect(() => {
    const startTimer = setTimeout(() => wanderToRandom(), 1000);
    return () => {
      clearTimeout(startTimer);
      if (walkTimer.current) clearTimeout(walkTimer.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 쓰다듬기
  const handlePet = useCallback(() => {
    if (isPetting) return;
    setIsPetting(true);
    setPetCount((c) => c + 1);

    // 걷기 중단
    if (walkTimer.current) clearTimeout(walkTimer.current);
    setIsWalking(false);

    // 행복한 표정
    const face = HAPPY_FACES[Math.floor(Math.random() * HAPPY_FACES.length)];
    setHappyFace(face);

    // 캐릭터 기쁜 모션
    charControls.start({
      scale: [1, 1.3, 1.1, 1.25, 1],
      rotate: [0, -8, 8, -5, 5, 0],
      transition: { duration: 0.8 },
    });

    // 하트 파티클 생성
    const newParticles: Particle[] = Array.from({ length: 5 }, (_, i) => ({
      id: particleId.current++,
      x: charX + (Math.random() - 0.5) * 20,
      y: charY - 5 - Math.random() * 10,
      emoji: REACTION_EMOJIS[Math.floor(Math.random() * REACTION_EMOJIS.length)],
    }));
    setParticles((prev) => [...prev, ...newParticles]);

    // 파티클 정리 + 산책 재개
    setTimeout(() => {
      setParticles((prev) =>
        prev.filter((p) => !newParticles.find((np) => np.id === p.id))
      );
      setHappyFace(null);
      setIsPetting(false);
      // 잠시 후 다시 산책
      walkTimer.current = setTimeout(() => wanderToRandom(), 2000);
    }, 1500);
  }, [isPetting, charX, charY, charControls, wanderToRandom]);

  if (!animal) return null;

  return (
    <div className="mobile-frame flex flex-col overflow-hidden relative"
      style={{ background: "linear-gradient(180deg, #87CEEB 0%, #98E4C1 50%, #7BC47F 70%, #5DA65D 100%)" }}
    >
      {/* 하늘 구름 */}
      <motion.div
        className="absolute text-5xl top-[8%] opacity-70"
        animate={{ x: ["0%", "80%", "0%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        ☁️
      </motion.div>
      <motion.div
        className="absolute text-3xl top-[15%] opacity-50"
        animate={{ x: ["60%", "120%", "60%"] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        ☁️
      </motion.div>

      {/* 태양 */}
      <motion.div
        className="absolute text-5xl right-[10%] top-[5%]"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        ☀️
      </motion.div>

      {/* 헤더 */}
      <div className="relative z-20 flex items-center justify-between px-5 pt-5">
        <motion.button
          onClick={() => router.push("/home")}
          className="px-3 py-1.5 bg-white/80 backdrop-blur rounded-full text-sm text-slate-600 shadow"
          whileTap={{ scale: 0.95 }}
        >
          ← 홈으로
        </motion.button>
        <div className="px-3 py-1.5 bg-white/80 backdrop-blur rounded-full text-sm shadow">
          쓰다듬기 {petCount}회 ❤️
        </div>
      </div>

      {/* 풀숲 장식 */}
      {SCENERY.map((item, i) => (
        <motion.div
          key={i}
          className={`absolute ${item.size}`}
          style={{ left: `${item.x}%`, top: `${item.y}%` }}
          animate={
            item.emoji === "🦋"
              ? { x: [0, 30, -20, 10, 0], y: [0, -15, 5, -10, 0] }
              : item.emoji === "🐝"
              ? { x: [0, 15, -10, 0], y: [0, -8, 3, 0] }
              : { rotate: [0, 2, -2, 0] }
          }
          transition={{
            duration: item.emoji === "🦋" || item.emoji === "🐝" ? 6 : 4,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        >
          {item.emoji}
        </motion.div>
      ))}

      {/* 캐릭터 */}
      <motion.div
        className="absolute z-10 cursor-pointer select-none"
        style={{
          left: `${charX}%`,
          top: `${charY}%`,
          transform: "translate(-50%, -50%)",
        }}
        animate={{
          left: `${isWalking ? targetX : charX}%`,
          top: `${isWalking ? targetY : charY}%`,
        }}
        transition={{
          duration: isWalking ? 2.5 : 0,
          ease: "easeInOut",
        }}
        onClick={handlePet}
      >
        {/* 그림자 */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-black/10 rounded-full blur-sm" />

        {/* 캐릭터 본체 */}
        <motion.div
          animate={charControls}
          className="relative"
        >
          <motion.span
            className="text-7xl block"
            style={{ transform: facingLeft ? "scaleX(-1)" : "scaleX(1)" }}
            animate={
              isWalking
                ? { y: [0, -8, 0, -6, 0], rotate: [0, -3, 0, 3, 0] }
                : isPetting
                ? {}
                : { y: [0, -3, 0] }
            }
            transition={
              isWalking
                ? { duration: 0.4, repeat: Infinity }
                : { duration: 2, repeat: Infinity }
            }
          >
            {charEmoji}
          </motion.span>

          {/* 행복한 표정 (쓰다듬기 시) */}
          <AnimatePresence>
            {happyFace && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute -top-8 left-1/2 -translate-x-1/2 text-3xl"
              >
                {happyFace}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        {/* "터치해보세요" 힌트 */}
        {petCount === 0 && !isWalking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 3 }}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap
              text-xs text-white bg-black/30 px-2 py-1 rounded-full backdrop-blur"
          >
            터치해서 쓰다듬기 👆
          </motion.div>
        )}
      </motion.div>

      {/* 하트 파티클 */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute z-20 text-2xl pointer-events-none"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            initial={{ opacity: 1, scale: 0, y: 0 }}
            animate={{
              opacity: [1, 1, 0],
              scale: [0, 1.2, 0.8],
              y: -80,
              x: (Math.random() - 0.5) * 60,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            {p.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 캐릭터 이름 + 상태 (하단) */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white/90 backdrop-blur-md rounded-2xl px-5 py-3 shadow-lg text-center"
        >
          <div className="font-bold text-slate-800">
            {animal.name} · Lv.{state.level}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {isPetting
              ? "기분이 좋아요! 💕"
              : isWalking
              ? "산책 중... 🐾"
              : "주변을 둘러보는 중 👀"}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

"use client";

/**
 * gameStore.ts — RunLab 앱 전체 상태 관리
 *
 * 데모용으로 localStorage 기반 간이 상태 관리를 사용합니다.
 * 실제 프로덕션에서는 Supabase DB + 서버 상태로 대체됩니다.
 */

// ─── 타입 정의 ─────────────────────────────────────────────

/** 선택 가능한 동물 캐릭터 5종 */
export type AnimalType = "dog" | "cat" | "rabbit" | "fox" | "bear";

/** 앱 전체 상태 인터페이스 */
export interface GameState {
  participantCode: string;         // 연구 참여 코드 (예: SNU-001)
  animal: AnimalType | null;       // 선택한 동물 캐릭터
  xp: number;                      // 현재 경험치
  level: number;                   // 현재 레벨 (1~10)
  streak: number;                  // 연속 참여 일수
  todayEMA: boolean;               // 오늘 EMA 설문 완료 여부
  todayWatchWorn: boolean;         // 오늘 워치 착용 확인 여부
  alarmHour: number;               // 기상 알람 — 시
  alarmMinute: number;             // 기상 알람 — 분
  bedtimeHour: number;             // 취침 리마인더 — 시
  bedtimeMinute: number;           // 취침 리마인더 — 분
  isSleeping: boolean;             // 현재 수면 모드 여부
  emaHistory: {                    // EMA 응답 이력 (더미 데이터 포함)
    date: string;
    sleep: number;    // 수면 만족도 (1~5)
    muscle: number;   // 근육통 (1~5)
    mood: number;     // 기분 (1~5)
  }[];
}

// ─── 상수 ───────────────────────────────────────────────────

const STORAGE_KEY = "runlab-demo-state";

/** 초기 상태 (앱 첫 실행 시 또는 리셋 시 사용) */
const defaultState: GameState = {
  participantCode: "",
  animal: null,
  xp: 0,
  level: 1,
  streak: 3,
  todayEMA: false,
  todayWatchWorn: false,
  alarmHour: 7,
  alarmMinute: 0,
  bedtimeHour: 23,
  bedtimeMinute: 0,
  isSleeping: false,
  // 시연용 더미 EMA 이력 (최근 6일)
  emaHistory: [
    { date: "2026-04-02", sleep: 4, muscle: 2, mood: 5 },
    { date: "2026-04-03", sleep: 3, muscle: 3, mood: 4 },
    { date: "2026-04-04", sleep: 5, muscle: 1, mood: 5 },
    { date: "2026-04-05", sleep: 4, muscle: 4, mood: 3 },
    { date: "2026-04-06", sleep: 2, muscle: 5, mood: 2 },
    { date: "2026-04-07", sleep: 4, muscle: 2, mood: 4 },
  ],
};

// ─── 상태 관리 함수 ─────────────────────────────────────────

/** localStorage에서 상태를 불러옴. 없으면 defaultState 반환 */
export function loadState(): GameState {
  if (typeof window === "undefined") return defaultState;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...defaultState, ...JSON.parse(saved) };
  } catch {}
  return defaultState;
}

/** 상태의 일부를 업데이트하고 localStorage에 저장 */
export function saveState(state: Partial<GameState>) {
  if (typeof window === "undefined") return;
  const current = loadState();
  const next = { ...current, ...state };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

/** 전체 상태를 초기화 (동물 선택부터 다시) */
export function resetState() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// ─── 캐릭터 성장 시스템 ─────────────────────────────────────

/**
 * 레벨에 따른 성장 단계 반환
 * - Lv.1~2: 알 (egg)     — 아직 부화 전
 * - Lv.3~4: 새끼 (baby)   — 갓 태어난 상태
 * - Lv.5~7: 청소년 (young) — 성장 중
 * - Lv.8~10: 성체 (adult)  — 완전히 성장
 *
 * 7일 미참여 시 Lv.1(알)로 퇴화하는 페널티 시스템 포함
 */
export function getStage(level: number): "egg" | "baby" | "young" | "adult" {
  if (level <= 2) return "egg";
  if (level <= 4) return "baby";
  if (level <= 7) return "young";
  return "adult";
}

/**
 * 레벨업에 필요한 XP 계산
 * - Lv.1→2: 50 XP, Lv.2→3: 100 XP, ... Lv.9→10: 450 XP
 * - XP 획득: EMA 완료(+30), 워치 착용(+20), 러닝 동기화(+15)
 */
export function xpForLevel(level: number): number {
  return level * 50;
}

// ─── 동물 캐릭터 데이터 ─────────────────────────────────────

/**
 * 5종 동물 캐릭터 정의
 * - emoji: 성장 단계별 이모지 (데모용, 실제 앱에서는 일러스트/Lottie로 교체)
 * - color: 캐릭터 테마 컬러 (UI 카드 배경, XP바 등에 사용)
 */
export const ANIMALS: Record<
  AnimalType,
  { name: string; emoji: Record<string, string>; color: string }
> = {
  dog: {
    name: "강아지",
    emoji: { egg: "🥚", baby: "🐶", young: "🐕", adult: "🦮" },
    color: "#F59E0B",
  },
  cat: {
    name: "고양이",
    emoji: { egg: "🥚", baby: "🐱", young: "😺", adult: "🐈‍⬛" },
    color: "#8B5CF6",
  },
  rabbit: {
    name: "토끼",
    emoji: { egg: "🥚", baby: "🐰", young: "🐇", adult: "🐇" },
    color: "#EC4899",
  },
  fox: {
    name: "여우",
    emoji: { egg: "🥚", baby: "🦊", young: "🦊", adult: "🦊" },
    color: "#F97316",
  },
  bear: {
    name: "곰",
    emoji: { egg: "🥚", baby: "🐻", young: "🐻", adult: "🐻‍❄️" },
    color: "#6366F1",
  },
};

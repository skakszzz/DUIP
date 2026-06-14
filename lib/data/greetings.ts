// lib/data/greetings.ts — 시간대별 5종 ×4 + 공용 20종 = 40종
// 선택 규칙: 50% 확률로 [현재 시간대 풀 5종], 50% 확률로 [공용 풀 20종] → 풀 안에서 균등 랜덤
// 시간대는 KST 기준: 아침 05–10시, 낮 11–16시, 저녁 17–21시, 밤 22–04시

export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';

export const TIME_GREETINGS: Record<TimeSlot, string[]> = {
  morning: [
    '좋은 아침이에요',
    '상쾌한 하루의 시작이에요',
    '오늘 첫 물 주러 오셨네요',
    '아침 햇살이 참 좋아요',
    '새잎처럼 산뜻한 아침이에요',
  ],
  afternoon: [
    '햇볕 좋은 오후예요',
    '오늘 하루 잘 자라고 있나요',
    '잠깐 쉬어가도 좋아요',
    '한낮의 정원에 어서 오세요',
    '오후의 동산도 평화로워요',
  ],
  evening: [
    '오늘도 수고 많았어요',
    '노을 지는 저녁이에요',
    '하루를 마무리할 시간이에요',
    '저녁 바람이 선선해요',
    '오늘의 잎을 세어볼까요',
  ],
  night: [
    '고요한 밤이에요',
    '별이 뜨는 시간이에요',
    '식물들도 잠든 시간이에요',
    '오늘 하루도 잘 보냈어요',
    '푹 쉬어야 내일도 자라요',
  ],
};

export const COMMON_GREETINGS: string[] = [
  '다시 만나 반가워요',
  '어서 오세요',
  '기다리고 있었어요',
  '둘의 정원이 반겨요',
  '오늘도 함께 키워봐요',
  '새 잎이 돋아날 거예요',
  '천천히 자라도 괜찮아요',
  '함께라서 더 잘 자라요',
  '작은 일도 잎이 돼요',
  '둘만의 동산에 어서 와요',
  '오늘은 어떤 하루였나요',
  '마음에도 물을 주세요',
  '꾸준함이 꽃을 피워요',
  '한 잎 한 잎 쌓여가요',
  '좋은 일이 자라는 중이에요',
  '둘의 속도로 가면 돼요',
  '어제보다 한 뼘 자랐어요',
  '정원이 푸르러지고 있어요',
  '또 만나서 반가워요',
  '햇살 같은 하루 보내세요',
];

// 시간대별 서브라인 (기존 고정 문구 "오늘도 둘이 함께 키워볼까요?" 대체)
export const SUBLINES: Record<TimeSlot, string> = {
  morning: '오늘도 둘이 함께 키워볼까요?',
  afternoon: '잠깐 들러 잎 하나 틔워볼까요?',
  evening: '오늘 자란 만큼 돌아볼까요?',
  night: '내일의 잎을 준비해볼까요?',
};

export function slotFromKstHour(h: number): TimeSlot {
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 11 && h < 17) return 'afternoon';
  if (h >= 17 && h < 22) return 'evening';
  return 'night';
}

export function pickGreeting(kstHour: number): { title: string; sub: string } {
  const slot = slotFromKstHour(kstHour);
  const pool = Math.random() < 0.5 ? TIME_GREETINGS[slot] : COMMON_GREETINGS;
  return { title: pool[Math.floor(Math.random() * pool.length)], sub: SUBLINES[slot] };
}

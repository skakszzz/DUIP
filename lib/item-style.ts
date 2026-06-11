import type { ItemType } from '@/lib/types';

export const TYPE_COLOR: Record<ItemType, string> = {
  TODO: '#7C9466',
  WISH: '#C77C6A',
  ETC:  '#8C7691',
};
export const TYPE_TINT: Record<ItemType, string> = {
  TODO: '#E6EDD8',
  WISH: '#F4DCD3',
  ETC:  '#ECE3EF',
};
export const TYPE_LABEL: Record<ItemType, string> = {
  TODO: '할일',
  WISH: '소망',
  ETC:  '기타',
};
export const TYPE_OPTIONS: { value: ItemType; label: string }[] = [
  { value: 'TODO', label: '할일' },
  { value: 'WISH', label: '소망' },
  { value: 'ETC',  label: '기타' },
];

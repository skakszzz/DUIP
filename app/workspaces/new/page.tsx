'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ko } from '@/lib/i18n/ko';
import type { TreeType } from '@/lib/types';
import Link from 'next/link';

const TREE_OPTIONS: { value: TreeType; label: string; emoji: string }[] = [
  { value: 'cherry', label: '벚나무', emoji: '🌸' },
  { value: 'olive', label: '올리브', emoji: '🫒' },
  { value: 'ginkgo', label: '은행나무', emoji: '🍂' },
  { value: 'pine', label: '소나무', emoji: '🌲' },
  { value: 'maple', label: '단풍나무', emoji: '🍁' },
];

const AVATAR_OPTIONS = ['🌱', '🌸', '🍀', '🌻', '🌺', '🌿', '🍃', '🌾'];

const COLOR_OPTIONS = [
  '#7BAE7E',
  '#B86F4B',
  '#D88E63',
  '#9B7B52',
  '#A8C99B',
  '#F0B5A0',
  '#5C3A1F',
  '#8B5E3C',
];

export default function NewWorkspacePage() {
  const router = useRouter();
  const t = ko.workspace;

  const [name, setName] = useState('');
  const [annYear, setAnnYear]   = useState('');
  const [annMonth, setAnnMonth] = useState('');
  const [annDay, setAnnDay]     = useState('');
  const monthRef = useRef<HTMLInputElement>(null);
  const dayRef   = useRef<HTMLInputElement>(null);
  const [treeType, setTreeType] = useState<TreeType>('cherry');
  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar] = useState('🌱');
  const [color, setColor] = useState('#7BAE7E');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !displayName.trim()) return;
    setLoading(true);
    setError('');

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    const anniversary =
      annYear.length === 4 && annMonth && annDay
        ? `${annYear}-${annMonth.padStart(2, '0')}-${annDay.padStart(2, '0')}`
        : null;

    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .insert({
        name: name.trim(),
        tree_type: treeType,
        anniversary,
        owner_id: user.id,
      })
      .select()
      .single();

    if (wsError || !workspace) {
      setError(wsError?.message ?? '동산을 만들 수 없어요');
      setLoading(false);
      return;
    }

    const { error: memError } = await supabase.from('memberships').insert({
      workspace_id: workspace.id,
      user_id: user.id,
      display_name: displayName.trim(),
      avatar,
      color,
      role: 'owner',
    });

    if (memError) {
      setError(memError.message);
      setLoading(false);
      return;
    }

    const currentYear = new Date().getFullYear();
    const potsToInsert = [];
    for (let m = 1; m <= 12; m++) {
      potsToInsert.push({
        workspace_id: workspace.id,
        year: currentYear,
        month: m,
        soil_type: 'rich',
        growth_points: 0,
      });
      potsToInsert.push({
        workspace_id: workspace.id,
        year: currentYear + 1,
        month: m,
        soil_type: 'rich',
        growth_points: 0,
      });
    }
    await supabase.from('monthly_pots').insert(potsToInsert);

    router.push(`/onboarding?w=${workspace.id}`);
  }

  return (
    <div className="min-h-screen bg-[#FBF6EE]">
      <div className="max-w-md mx-auto px-4 pt-8 pb-24">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/workspaces"
            className="text-[#9B7B52] hover:text-[#5C3A1F]"
          >
            ←
          </Link>
          <h1 className="text-xl font-semibold text-[#5C3A1F]">{t.new}</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#5C3A1F]">
              {t.nameLabel}
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePlaceholder}
              className="rounded-xl border border-[#E8D5B8] bg-white px-4 py-3 text-[#5C3A1F] placeholder:text-[#C8B89A] focus:outline-none focus:ring-2 focus:ring-[#B86F4B]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#5C3A1F]">
              {t.anniversaryLabel}
            </label>
            <div className="flex items-center gap-1">
              <input
                type="text"
                inputMode="numeric"
                placeholder="YYYY"
                maxLength={4}
                value={annYear}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setAnnYear(v);
                  if (v.length === 4) monthRef.current?.focus();
                }}
                className="w-20 rounded-xl border border-[#E8D5B8] bg-white px-3 py-3 text-center text-[#5C3A1F] placeholder:text-[#C8B89A] focus:outline-none focus:ring-2 focus:ring-[#B86F4B] text-sm"
              />
              <span className="text-[#9B7B52] text-sm">년</span>
              <input
                ref={monthRef}
                type="text"
                inputMode="numeric"
                placeholder="MM"
                maxLength={2}
                value={annMonth}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 2);
                  setAnnMonth(v);
                  if (v.length === 2) dayRef.current?.focus();
                }}
                className="w-14 rounded-xl border border-[#E8D5B8] bg-white px-3 py-3 text-center text-[#5C3A1F] placeholder:text-[#C8B89A] focus:outline-none focus:ring-2 focus:ring-[#B86F4B] text-sm"
              />
              <span className="text-[#9B7B52] text-sm">월</span>
              <input
                ref={dayRef}
                type="text"
                inputMode="numeric"
                placeholder="DD"
                maxLength={2}
                value={annDay}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 2);
                  setAnnDay(v);
                }}
                className="w-14 rounded-xl border border-[#E8D5B8] bg-white px-3 py-3 text-center text-[#5C3A1F] placeholder:text-[#C8B89A] focus:outline-none focus:ring-2 focus:ring-[#B86F4B] text-sm"
              />
              <span className="text-[#9B7B52] text-sm">일</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#5C3A1F]">
              {t.treeLabel}
            </label>
            <div className="grid grid-cols-5 gap-2">
              {TREE_OPTIONS.map((tree) => (
                <button
                  key={tree.value}
                  type="button"
                  onClick={() => setTreeType(tree.value)}
                  className={`flex flex-col items-center gap-1 rounded-xl py-3 transition-all ${
                    treeType === tree.value
                      ? 'bg-[#5C3A1F] text-white'
                      : 'bg-[#F4E8D6] text-[#5C3A1F]'
                  }`}
                >
                  <span className="text-2xl">{tree.emoji}</span>
                  <span className="text-xs">{tree.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#F4E8D6] rounded-2xl p-4 flex flex-col gap-4">
            <p className="text-sm font-medium text-[#5C3A1F]">내 프로필</p>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-[#9B7B52]">
                {t.memberNameLabel}
              </label>
              <input
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t.memberNamePlaceholder}
                className="rounded-xl border border-[#E8D5B8] bg-white px-4 py-2 text-[#5C3A1F] placeholder:text-[#C8B89A] focus:outline-none focus:ring-2 focus:ring-[#B86F4B] text-sm"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-[#9B7B52]">
                {t.memberAvatarLabel}
              </label>
              <div className="flex gap-2 flex-wrap">
                {AVATAR_OPTIONS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAvatar(a)}
                    className={`text-2xl w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      avatar === a
                        ? 'bg-[#5C3A1F]'
                        : 'bg-white border border-[#E8D5B8]'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-[#9B7B52]">
                {t.memberColorLabel}
              </label>
              <div className="flex gap-2 flex-wrap">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      color === c ? 'ring-2 ring-offset-2 ring-[#5C3A1F]' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[#5C3A1F] py-3 text-[#FBF6EE] font-medium text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? '만드는 중...' : t.create}
          </button>
        </form>
      </div>
    </div>
  );
}

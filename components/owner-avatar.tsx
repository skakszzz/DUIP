export function OwnerAvatar({
  item, members, size = 24, ring = '#FFFCF7',
}: {
  item: { is_shared?: boolean; owner_user_id: string | null };
  members: { user_id: string; display_name: string; color: string }[];
  size?: number;
  ring?: string;
}) {
  const dot = (m: { display_name: string; color: string }, key: number, shift: number) => (
    <div key={key} style={{
      width: size, height: size, borderRadius: 9999,
      background: m.color, color: '#fff',
      fontSize: Math.round(size * 0.42), fontWeight: 800,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 0 0 2px ${ring}`,
      marginLeft: shift, position: 'relative', zIndex: 10 - key, flexShrink: 0,
    }}>{m.display_name.charAt(0)}</div>
  );

  if (item.is_shared) {
    const pair = members.slice(0, 2);
    const ov = -Math.round(size * 0.42);
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center' }}>
        {pair.map((m, i) => dot(m, i, i === 0 ? 0 : ov))}
      </div>
    );
  }
  const owner = members.find((m) => m.user_id === item.owner_user_id);
  if (!owner) return null;
  return <div style={{ display: 'inline-flex' }}>{dot(owner, 0, 0)}</div>;
}

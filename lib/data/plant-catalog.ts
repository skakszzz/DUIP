// lib/data/plant-catalog.ts
// 두잎 식물 80종 → 아키타입(form) + 색 팔레트 매핑. (홈 SVG 일러스트용)
// id는 plants.ts의 Plant.id와 동일. form 렌더링은 plant-art.tsx 참고.

export type PlantForm = 'rosette' | 'trailing' | 'leafy' | 'stalk' | 'woody' | 'tree' | 'cactus' | 'moss';

// 두잎 식물 80종 → 아키타입(form) + 색 팔레트 매핑.
// form: rosette | trailing | leafy | stalk | woody | tree | cactus | moss
// 각 form이 받는 opts는 plant-forms.jsx 참고.
// 색은 plants.ts의 imagePrompts(stage5) 묘사에서 도출.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PLANT_CATALOG: Record<string, any> = {
  // ─────────── 다육이 (15) ───────────
  echeveria:        { form: 'rosette', shape: 'round',   leaf: '#9DBE9E', leaf2: '#B9D2B3', tip: '#E0A6AE' },
  haworthia:        { form: 'rosette', shape: 'pointed', leaf: '#7FAE83', leaf2: '#A7CBA0', tip: '#CFE3B8' },
  sedum:            { form: 'trailing', bead: 'teardrop', leaf: '#9CC0A6', leaf2: '#B8D6B6' },
  'string-of-pearls': { form: 'trailing', bead: 'pearl', leaf: '#86B27E', leaf2: '#A9CC9C' },
  'black-prince':   { form: 'rosette', shape: 'pointed', leaf: '#5E3B45', leaf2: '#7C6A57', tip: '#3A2530' },
  moonstone:        { form: 'rosette', shape: 'pebble',  leaf: '#C9C4DC', leaf2: '#DAD6E8', tip: '#D7BFD0' },
  'jade-plant':     { form: 'leafy', leaf: 'round', color: '#6E9A6A', color2: '#8FB582', woody: true, edge: '#C77C6A' },
  lithops:          { form: 'cactus', body: 'pebble', leaf: '#9A8F73', leaf2: '#7C6F55', bloom: '#F2C66E' },
  graptopetalum:    { form: 'rosette', shape: 'pointed', leaf: '#BFC2AE', leaf2: '#D7C6C8', tip: '#D7A9AE' },
  aeonium:          { form: 'rosette', shape: 'spoon',   leaf: '#6E9A5E', leaf2: '#8AB47A', tip: '#5C8050' },
  kalanchoe:        { form: 'leafy', leaf: 'scallop', color: '#5E8A57', color2: '#79A36E', bloom: '#E8836F' },
  portulacaria:     { form: 'leafy', leaf: 'round', color: '#6E9A6A', color2: '#8FB582', woody: true, edge: '#9A5B3C', tiny: true },
  'green-necklace': { form: 'trailing', bead: 'banana', leaf: '#9CC089', leaf2: '#B6D6A0' },
  agave:            { form: 'rosette', shape: 'pointed', leaf: '#8FA9A0', leaf2: '#A9C0B6', tip: '#7C5A45' },
  'perle-von-nurnberg': { form: 'rosette', shape: 'spoon', leaf: '#C6AEC4', leaf2: '#D8C6D6', tip: '#C189A0' },

  // ─────────── 관엽 (15) ───────────
  monstera:     { form: 'leafy', leaf: 'monstera', color: '#3E7A4E', color2: '#5C9A66' },
  philodendron: { form: 'leafy', leaf: 'heart',  color: '#4A8A55', color2: '#6BA86F' },
  pothos:       { form: 'leafy', leaf: 'heart',  color: '#5E9A55', color2: '#C9C06A', variegate: true },
  'snake-plant':{ form: 'leafy', leaf: 'snake',  color: '#4F7A4A', color2: '#A7BE6A', band: true },
  'zz-plant':   { form: 'leafy', leaf: 'zz',     color: '#356B40', color2: '#4E8A55' },
  'fiddle-leaf-fig': { form: 'leafy', leaf: 'violin', color: '#3E7A4E', color2: '#5C9A66', big: true },
  calathea:     { form: 'leafy', leaf: 'round',  color: '#4A7E50', color2: '#C7D6C0', stripe: true },
  peperomia:    { form: 'leafy', leaf: 'round',  color: '#4E8A52', color2: '#6FA86A', bushy: true },
  'rubber-tree':{ form: 'leafy', leaf: 'oval',   color: '#2F5E3E', color2: '#4A7A52', big: true, edge: '#6E3B45' },
  dracaena:     { form: 'leafy', leaf: 'dracaena', color: '#4F8A4E', color2: '#C2C06A', arch: true },
  anthurium:    { form: 'leafy', leaf: 'heart',  color: '#356B40', color2: '#4E8A55', bract: '#E8836F' },
  spathiphyllum:{ form: 'leafy', leaf: 'lance',  color: '#356B40', color2: '#4E8A55', spathe: '#F4EFE3' },
  dieffenbachia:{ form: 'leafy', leaf: 'oval',   color: '#4A7E50', color2: '#D8D6A8', speckle: true, big: true },
  aglaonema:    { form: 'leafy', leaf: 'lance',  color: '#3E6B46', color2: '#B6C6B0', edge: '#D7A9AE', stripe: true },
  'parlor-palm':{ form: 'leafy', leaf: 'feather', color: '#4F8A52', color2: '#6FA86A' },

  // ─────────── 꽃피는 식물 (15) ───────────
  lavender:    { form: 'stalk', bloom: 'spike',   bcolor: '#9A7CC9', bcolor2: '#7C5FB7', leaf: '#8FA98C' },
  ranunculus:  { form: 'stalk', bloom: 'layered', bcolor: '#F0A98C', bcolor2: '#E88B6F', leaf: '#6E9A5E' },
  tulip:       { form: 'stalk', bloom: 'cup',     bcolor: '#E0786E', bcolor2: '#F0A085', leaf: '#5E8A57' },
  rose:        { form: 'stalk', bloom: 'layered', bcolor: '#E89BB0', bcolor2: '#D87C96', leaf: '#4F7A4A' },
  daisy:       { form: 'stalk', bloom: 'ray',     bcolor: '#FBFAF2', bcolor2: '#F2C66E', leaf: '#6E9A5E' },
  carnation:   { form: 'stalk', bloom: 'ruffle',  bcolor: '#E8849A', bcolor2: '#F0A4B2', leaf: '#7C9A8C' },
  peony:       { form: 'stalk', bloom: 'ruffle',  bcolor: '#F0B8C6', bcolor2: '#E89BB0', leaf: '#3E6B46', big: true },
  anemone:     { form: 'stalk', bloom: 'ray',     bcolor: '#E0786E', bcolor2: '#3A2530', leaf: '#5C8050' },
  freesia:     { form: 'stalk', bloom: 'trumpet', bcolor: '#F2C66E', bcolor2: '#E8B04C', leaf: '#5E8A57' },
  hyacinth:    { form: 'stalk', bloom: 'spike',   bcolor: '#E89BB0', bcolor2: '#D87C96', leaf: '#5E8A57' },
  crocus:      { form: 'stalk', bloom: 'cup',     bcolor: '#9A7CC9', bcolor2: '#B7A0D9', leaf: '#6E9A5E', low: true },
  'lily-of-the-valley': { form: 'stalk', bloom: 'bell', bcolor: '#FBFAF2', bcolor2: '#E6EDD8', leaf: '#4F7A4A' },
  cyclamen:    { form: 'stalk', bloom: 'upswept', bcolor: '#E089A0', bcolor2: '#F0A8BC', leaf: '#3E6B46' },
  'african-violet': { form: 'rosette', shape: 'round', leaf: '#3E6B46', leaf2: '#5C8A55', center: '#8C6AB0' },
  begonia:     { form: 'leafy', leaf: 'wing', color: '#6E4A55', color2: '#A7BE9A', silver: true },

  // ─────────── 허브 (10) ───────────
  basil:     { form: 'leafy', leaf: 'oval',    color: '#5E9A52', color2: '#7FB56E', bushy: true },
  rosemary:  { form: 'leafy', leaf: 'needle',  color: '#4F7A52', color2: '#6E9A6A' },
  mint:      { form: 'leafy', leaf: 'toothed', color: '#5E9A57', color2: '#86C078', bushy: true },
  thyme:     { form: 'leafy', leaf: 'tiny',    color: '#6E8A66', color2: '#8FA982', bushy: true },
  sage:      { form: 'leafy', leaf: 'oblong',  color: '#8FA98C', color2: '#A9C0A6', velvet: true },
  oregano:   { form: 'leafy', leaf: 'heart',   color: '#5E8A57', color2: '#7FA86E', tiny: true, bushy: true },
  parsley:   { form: 'leafy', leaf: 'curl',    color: '#4F8A4A', color2: '#6FA85E', bushy: true },
  cilantro:  { form: 'leafy', leaf: 'lobe',    color: '#5E9A52', color2: '#86C078' },
  'lemon-balm': { form: 'leafy', leaf: 'toothed', color: '#6E9A5E', color2: '#8FB57A', bushy: true },
  chamomile: { form: 'stalk', bloom: 'ray',    bcolor: '#FBFAF2', bcolor2: '#F2C66E', leaf: '#7FA86E', small: true, multi: true },

  // ─────────── 한국 전통 (10) ───────────
  'plum-blossom': { form: 'woody', petals: 'five', blossom: '#F0C6D2', blossom2: '#E89BB0', leaf: '#5E8A57' },
  camellia:    { form: 'woody', petals: 'layered', blossom: '#D8607C', blossom2: '#E8849A', leaf: '#2F5235', accent: '#F2C66E', bigBloom: true, lush: true },
  azalea:      { form: 'woody', petals: 'five', blossom: '#F0B8C6', blossom2: '#E89BB0', leaf: '#5E8A57' },
  mugunghwa:   { form: 'woody', petals: 'five', blossom: '#D6C6E0', blossom2: '#C6B0D9', leaf: '#5E8A57', accent: '#C0506A' },
  forsythia:   { form: 'woody', petals: 'four', blossom: '#F2C84C', blossom2: '#E8B43A', leaf: '#6E9A5E', bush: true },
  'royal-azalea': { form: 'woody', petals: 'five', blossom: '#F0C0CC', blossom2: '#E8A4B6', leaf: '#5E8A57' },
  'pine-bonsai': { form: 'tree', canopy: 'needle', color: '#3F6B47', color2: '#52805A', trunk: '#6E4626' },
  'ginkgo-bonsai': { form: 'tree', canopy: 'fan',  color: '#7B9D5A', color2: '#C9B24A', trunk: '#7B5A38' },
  'white-magnolia': { form: 'woody', petals: 'tulip', blossom: '#F6F1E6', blossom2: '#E8DEC8', leaf: '#5E8A57' },
  'apricot-blossom': { form: 'woody', petals: 'five', blossom: '#F2CBD2', blossom2: '#E8A8B4', leaf: '#5E8A57' },

  // ─────────── 선인장 (5) ───────────
  'golden-barrel':   { form: 'cactus', body: 'globe',  leaf: '#6E9A5E', leaf2: '#86B56E', spine: '#E8C34C' },
  'christmas-cactus':{ form: 'trailing', bead: 'segjag', leaf: '#4F8A52', leaf2: '#6FA86A', tipBloom: '#E0789A', droop: true },
  'easter-cactus':   { form: 'trailing', bead: 'seground', leaf: '#4F8A52', leaf2: '#6FA86A', tipBloom: '#E8836F' },
  'moon-cactus':     { form: 'cactus', body: 'moon',   leaf: '#5E9A55', leaf2: '#7FB56E', cap: '#E0607C', spine: '#E8C34C' },
  'bunny-ears':      { form: 'cactus', body: 'pads',   leaf: '#6E9A5E', leaf2: '#86B56E', spine: '#E8C34C' },

  // ─────────── 덩굴 (5) ───────────
  'english-ivy':     { form: 'trailing', bead: 'ivy',  leaf: '#3E6B46', leaf2: '#5C8A55', veined: true },
  'string-of-hearts':{ form: 'trailing', bead: 'heart', leaf: '#8FA9A0', leaf2: '#B0C2BA', under: '#7C5A75', veined: true },
  'wandering-jew':   { form: 'trailing', bead: 'oval', leaf: '#7C6A91', leaf2: '#B0A6C2', stripe: '#C6BEDA' },
  hoya:              { form: 'trailing', bead: 'hoya', leaf: '#4F8A52', leaf2: '#6FA86A' },
  'passion-flower':  { form: 'stalk', bloom: 'radial', bcolor: '#9A7CC9', bcolor2: '#FBFAF2', leaf: '#5E8A57', vine: true },

  // ─────────── 특수 (5) ───────────
  tillandsia:    { form: 'rosette', shape: 'pointed', leaf: '#9FB0A8', leaf2: '#B9C6BE', center: '#D87C7C', curl: true },
  'tiny-bonsai': { form: 'tree', canopy: 'cloud', color: '#5E8A57', color2: '#7FA86E', trunk: '#7B5A38', curve: true },
  'mini-conifer':{ form: 'tree', canopy: 'cone',  color: '#3F6B47', color2: '#52805A', trunk: '#6E4626' },
  'moss-ball':   { form: 'moss', leaf: '#5E9A57', leaf2: '#7FB56E', moss: '#6E8A52' },
  'lucky-bamboo':{ form: 'leafy', leaf: 'bamboo', color: '#6E9A52', color2: '#8FB57A', stalks: true },
};

// 80종 카테고리 (갤러리 그룹용)
export const PLANT_GROUPS: { key: string; label: string; ids: string[] }[] = [
  { key: 'succulent', label: '다육이', ids: ['echeveria','haworthia','sedum','string-of-pearls','black-prince','moonstone','jade-plant','lithops','graptopetalum','aeonium','kalanchoe','portulacaria','green-necklace','agave','perle-von-nurnberg'] },
  { key: 'houseplant', label: '관엽', ids: ['monstera','philodendron','pothos','snake-plant','zz-plant','fiddle-leaf-fig','calathea','peperomia','rubber-tree','dracaena','anthurium','spathiphyllum','dieffenbachia','aglaonema','parlor-palm'] },
  { key: 'flowering', label: '꽃', ids: ['lavender','ranunculus','tulip','rose','daisy','carnation','peony','anemone','freesia','hyacinth','crocus','lily-of-the-valley','cyclamen','african-violet','begonia'] },
  { key: 'herb', label: '허브', ids: ['basil','rosemary','mint','thyme','sage','oregano','parsley','cilantro','lemon-balm','chamomile'] },
  { key: 'korean', label: '한국 전통', ids: ['plum-blossom','camellia','azalea','mugunghwa','forsythia','royal-azalea','pine-bonsai','ginkgo-bonsai','white-magnolia','apricot-blossom'] },
  { key: 'cactus', label: '선인장', ids: ['golden-barrel','christmas-cactus','easter-cactus','moon-cactus','bunny-ears'] },
  { key: 'climber', label: '덩굴', ids: ['english-ivy','string-of-hearts','wandering-jew','hoya','passion-flower'] },
  { key: 'special', label: '특수', ids: ['tillandsia','tiny-bonsai','mini-conifer','moss-ball','lucky-bamboo'] },
];

// 한글 이름 (갤러리 라벨)
export const PLANT_NAMES: Record<string, string> = {
  echeveria:'에케베리아', haworthia:'하월시아', sedum:'세덤', 'string-of-pearls':'구슬다육', 'black-prince':'흑법사', moonstone:'문스톤', 'jade-plant':'옥동자', lithops:'리톱스', graptopetalum:'그라프토페탈럼', aeonium:'아이오니움', kalanchoe:'칼란코에', portulacaria:'포르툴라카리아', 'green-necklace':'그린네크리스', agave:'아가베', 'perle-von-nurnberg':'펄에코베리아',
  monstera:'몬스테라', philodendron:'필로덴드론', pothos:'스킨답서스', 'snake-plant':'산세베리아', 'zz-plant':'금전수', 'fiddle-leaf-fig':'떡갈잎고무나무', calathea:'칼라테아', peperomia:'페페로미아', 'rubber-tree':'인도고무나무', dracaena:'드라세나', anthurium:'안스리움', spathiphyllum:'스파티필름', dieffenbachia:'디펜바키아', aglaonema:'아글라오네마', 'parlor-palm':'테이블야자',
  lavender:'라벤더', ranunculus:'라넌큘러스', tulip:'튤립', rose:'미니장미', daisy:'데이지', carnation:'카네이션', peony:'작약', anemone:'아네모네', freesia:'프리지아', hyacinth:'히아신스', crocus:'크로커스', 'lily-of-the-valley':'은방울꽃', cyclamen:'시클라멘', 'african-violet':'아프리칸바이올렛', begonia:'베고니아',
  basil:'바질', rosemary:'로즈마리', mint:'민트', thyme:'타임', sage:'세이지', oregano:'오레가노', parsley:'파슬리', cilantro:'고수', 'lemon-balm':'레몬밤', chamomile:'캐모마일',
  'plum-blossom':'매화', camellia:'동백', azalea:'진달래', mugunghwa:'무궁화', forsythia:'개나리', 'royal-azalea':'영산홍', 'pine-bonsai':'소나무분재', 'ginkgo-bonsai':'은행나무분재', 'white-magnolia':'백목련', 'apricot-blossom':'살구꽃',
  'golden-barrel':'황금별선인장', 'christmas-cactus':'크리스마스캑터스', 'easter-cactus':'이스터캑터스', 'moon-cactus':'비모란', 'bunny-ears':'토끼귀선인장',
  'english-ivy':'아이비', 'string-of-hearts':'하트체인', 'wandering-jew':'자주달개비', hoya:'호야', 'passion-flower':'시계초',
  tillandsia:'틸란드시아', 'tiny-bonsai':'미니분재', 'mini-conifer':'미니침엽수', 'moss-ball':'이끼볼', 'lucky-bamboo':'행운죽',
};


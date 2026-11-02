// Code-drawn 2D presenter character · Reel Character Kit by @aiwith.om
// Pure SVG (no images): shaded shapes, 2-bone IK arms that bend at the elbow, pose keyframes, blink, breathing.
// Change the look with the `look` prop; change actions with `keys` (time in seconds → pose).
import React from 'react';
import {useCurrentFrame, spring} from 'remotion';
const FPS = 30; const useT = () => useCurrentFrame() / FPS;

type V = [number, number];
export type Look = {skin: string; skinDark: string; shirt: string; hair: string; beard: boolean; accent: string; label: string};
export const LOOKS: Record<string, Look> = {
  dev: {skin: '#D9966F', skinDark: '#B87655', shirt: '#1C1C21', hair: '#221915', beard: true, accent: '#FF2D95', label: 'aiwith.om'},
  coach: {skin: '#F0C3A0', skinDark: '#D49A77', shirt: '#0E7C66', hair: '#6B3E26', beard: false, accent: '#FFD23F', label: 'your.handle'},
};
type Pose = {l: V; r: V; jump?: number; tilt?: number; mouth?: 'smile' | 'open' | 'grin'; eyes?: 'open' | 'wink' | 'think' | 'wide'; point?: 'l' | 'r'; wave?: boolean; bow?: number};
const SH_L: V = [178, 418], SH_R: V = [422, 418], A = 138, B = 132; // shoulders, upper/fore arm lengths (local 600x780 box)
const IDLE: Pose = {l: [150, 668], r: [450, 668], mouth: 'smile'};
const ease = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const lerpV = (a: V, b: V, p: number): V => [lerp(a[0], b[0], p), lerp(a[1], b[1], p)];

// 2-bone IK: of the two elbow solutions, take the one further from the body centre (elbows bend outward)
const ik = (s: V, t: V, out: number): [V, V] => {
  let dx = t[0] - s[0], dy = t[1] - s[1]; let d = Math.hypot(dx, dy); const max = A + B - 1, min = Math.abs(A - B) + 20;
  if (d > max) { dx *= max / d; dy *= max / d; d = max; } if (d < min) { dx *= min / d; dy *= min / d; d = min; }
  const base = Math.atan2(dy, dx); const c = Math.acos(Math.max(-1, Math.min(1, (A * A + d * d - B * B) / (2 * A * d))));
  const e1: V = [s[0] + Math.cos(base + c) * A, s[1] + Math.sin(base + c) * A], e2: V = [s[0] + Math.cos(base - c) * A, s[1] + Math.sin(base - c) * A];
  const score = (e: V) => (e[0] - 300) * out * 0.25 + e[1]; // elbows hang down, and a bit outward
  return [score(e1) > score(e2) ? e1 : e2, [s[0] + dx, s[1] + dy]];
};
// tapered limb segment
const Limb: React.FC<{a: V; b: V; w1: number; w2: number; fill: string}> = ({a, b, w1, w2, fill}) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  const pts = [[a[0] + nx * w1 / 2, a[1] + ny * w1 / 2], [b[0] + nx * w2 / 2, b[1] + ny * w2 / 2], [b[0] - nx * w2 / 2, b[1] - ny * w2 / 2], [a[0] - nx * w1 / 2, a[1] - ny * w1 / 2]];
  return <g fill={fill}><polygon points={pts.map((q) => q.join(',')).join(' ')} /><circle cx={a[0]} cy={a[1]} r={w1 / 2} /><circle cx={b[0]} cy={b[1]} r={w2 / 2} /></g>;
};
const Arm: React.FC<{s: V; h: V; side: 1 | -1; point?: boolean; id: string; shirt: string; look: Look}> = ({s, h, side, point, shirt, look}) => {
  const [e, hand] = ik(s, h, side);
  const fx = hand[0] - e[0], fy = hand[1] - e[1], fl = Math.hypot(fx, fy) || 1, ux = fx / fl, uy = fy / fl;
  const ang = Math.atan2(uy, ux) * 180 / Math.PI;
  const sv: V = [s[0] + (e[0] - s[0]) * 0.5, s[1] + (e[1] - s[1]) * 0.5];
  const palm: V = [hand[0] + ux * 16, hand[1] + uy * 16];
  return <g>
    <Limb a={e} b={hand} w1={52} w2={42} fill={look.skin} />
    <Limb a={[e[0] - 5, e[1] - 4]} b={[hand[0] - 5, hand[1] - 4]} w1={16} w2={12} fill="rgba(255,214,180,0.45)" />
    <Limb a={s} b={e} w1={62} w2={52} fill={look.skin} />
    <Limb a={[s[0] - 6, s[1]]} b={[e[0] - 6, e[1] - 3]} w1={18} w2={14} fill="rgba(255,214,180,0.4)" />
    {/* hand: mitten palm + thumb (+ index finger when pointing) */}
    <g transform={`translate(${palm[0]} ${palm[1]}) rotate(${ang})`}>
      <ellipse cx={4} cy={0} rx={34} ry={27} fill="url(#skinR)" />
      <ellipse cx={-4} cy={-22 * side} rx={9} ry={14} transform={`rotate(${-35 * side} -4 ${-22 * side})`} fill="#D08C66" />
      {point ? <rect x={20} y={-7} width={52} height={14} rx={7} fill="#D9966F" /> : <path d={`M28 -18 Q40 0 28 18`} fill="none" stroke="#B87655" strokeWidth={3} strokeLinecap="round" />}
      <ellipse cx={-4} cy={-8} rx={11} ry={6} fill="rgba(255,255,255,0.3)" />
    </g>
    {/* short sleeve joined to the shirt */}
    <Limb a={s} b={sv} w1={84} w2={70} fill={shirt} />
    <Limb a={[s[0] - 8, s[1] - 6]} b={[sv[0] - 8, sv[1] - 6]} w1={22} w2={16} fill="rgba(80,80,92,0.55)" />
  </g>;
};

export const Character: React.FC<{keys: [number, Pose][]; look?: Look; enter?: number; x?: number; y?: number; scale?: number}> = ({keys, look = LOOKS.dev, enter = 0, x = 240, y = 1170, scale = 1}) => {
  const t = useT(); const f = useCurrentFrame();
  // blend between pose keyframes (0.3 s transitions)
  let cur = keys[0][1], prev = IDLE, p = 1;
  for (let i = 0; i < keys.length; i++) if (t >= keys[i][0]) { cur = keys[i][1]; prev = i ? keys[i - 1][1] : IDLE; p = ease((t - keys[i][0]) / 0.3); }
  let l = lerpV(prev.l, cur.l, p), r = lerpV(prev.r, cur.r, p);
  if (cur.wave) r = [r[0] + Math.sin(t * 9) * 34, r[1] + (1 - Math.cos(t * 18)) * 5];
  const breathe = Math.sin(t * 2.2) * 4;
  const jump = (cur.jump ?? 0) * Math.abs(Math.sin(t * 7)) * p;
  const tilt = lerp(prev.tilt ?? 0, cur.tilt ?? 0, p) + Math.sin(t * 1.3) * 2;
  const bow = lerp(prev.bow ?? 0, cur.bow ?? 0, p);
  const blink = (t % 3.1) > 2.95 ? 0.1 : 1;
  const ent = f < enter * FPS ? 0 : spring({frame: f - enter * FPS, fps: FPS, config: {damping: 12, stiffness: 120}});
  if (ent <= 0) return null;
  const mouth = cur.mouth ?? 'smile';
  return <div style={{position: 'absolute', left: x, top: y, width: 600 * scale, height: 780 * scale, transform: `translateY(${(1 - ent) * 700 - jump * 60}px)`, zIndex: 30, filter: 'drop-shadow(0 30px 40px rgba(60,40,20,0.28))'}}>
    <svg width={600 * scale} height={780 * scale} viewBox="0 0 600 780" overflow="visible">
      <defs>
        <radialGradient id="skin" cx="40%" cy="35%" r="70%"><stop offset="0" stopColor={look.skin} stopOpacity={1} /><stop offset="0.65" stopColor={look.skin} /><stop offset="1" stopColor={look.skinDark} /></radialGradient>
        <radialGradient id="skinR" cx="35%" cy="30%" r="75%"><stop offset="0" stopColor={look.skin} /><stop offset="1" stopColor={look.skinDark} /></radialGradient>
        <linearGradient id="skinLa" x1="0" x2="1"><stop offset="0" stopColor="#E3A47D" /><stop offset="1" stopColor="#B87655" /></linearGradient>
        <linearGradient id="skinLb" x1="0" x2="1"><stop offset="0" stopColor="#B87655" /><stop offset="1" stopColor="#E3A47D" /></linearGradient>
        <radialGradient id="tee" cx="45%" cy="25%" r="85%"><stop offset="0" stopColor={look.shirt} stopOpacity={0.75} /><stop offset="0.55" stopColor={look.shirt} /><stop offset="1" stopColor={look.shirt} /></radialGradient>
        <radialGradient id="hair" cx="40%" cy="25%" r="80%"><stop offset="0" stopColor={look.hair} stopOpacity={0.8} /><stop offset="0.5" stopColor={look.hair} /><stop offset="1" stopColor={look.hair} /></radialGradient>
        <radialGradient id="beard" cx="50%" cy="20%" r="80%"><stop offset="0" stopColor="#3A2C25" /><stop offset="1" stopColor="#140E0B" /></radialGradient>
      </defs>
      <g transform={`translate(0 ${breathe}) rotate(${bow * 0.4} 300 780)`}>
        {/* torso */}
        <path d="M128 480 Q128 392 215 374 L385 374 Q472 392 472 480 L492 800 L108 800 Z" fill="url(#tee)" />
        <path d="M250 372 Q300 410 350 372" fill="none" stroke="#2D2D33" strokeWidth={10} />
        <text x="300" y="560" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={900} fontSize={34} fill={look.accent}>{look.label}</text>
        {/* neck */}
        <path d="M262 315 L338 315 L345 380 Q300 400 255 380 Z" fill={look.skinDark} />
        {/* head */}
        <g transform={`rotate(${tilt + bow} 300 330)`}>
          <ellipse cx="172" cy="240" rx="24" ry="34" fill={look.skinDark} /><ellipse cx="428" cy="240" rx="24" ry="34" fill={look.skinDark} />
          <ellipse cx="300" cy="215" rx="128" ry="140" fill="url(#skin)" />
          {/* beard + moustache */}
          {look.beard && <path d="M178 230 Q182 330 300 362 Q418 330 422 230 Q408 300 360 300 Q300 318 240 300 Q192 300 178 230 Z" fill="url(#beard)" />}
          {look.beard && <path d="M248 278 Q300 258 352 278 Q330 290 300 284 Q270 290 248 278 Z" fill="#1A120E" />}
          {/* mouth */}
          {mouth === 'open' ? <path d="M262 298 Q300 350 338 298 Z" fill="#5A1E1E" stroke="#fff" strokeWidth={6} /> : mouth === 'grin' ? <path d="M258 296 Q300 334 342 296 Q300 312 258 296 Z" fill="#fff" stroke="#5A1E1E" strokeWidth={4} /> : <path d="M268 300 Q300 322 332 300" fill="none" stroke="#5A1E1E" strokeWidth={7} strokeLinecap="round" />}
          {/* eyes */}
          {[245, 355].map((ex, i) => { const ey = cur.eyes ?? 'open'; const shut = ey === 'wink' && i === 1;
            if (shut) return <path key={ex} d={`M${ex - 20} 208 Q${ex} 222 ${ex + 20} 208`} stroke="#2A160C" strokeWidth={7} fill="none" strokeLinecap="round" />;
            const dy = ey === 'think' ? -9 : 3, dx = ey === 'think' ? 8 : 2, r = ey === 'wide' ? 1.15 : 1;
            return <g key={ex} transform={`translate(${ex} 205) scale(${r} ${blink * r})`}><ellipse rx="22" ry="25" fill="#fff" /><circle cx={dx} cy={dy} r="14" fill="#3B2418" /><circle cx={dx} cy={dy} r="7" fill="#0C0705" /><circle cx={dx + 6} cy={dy - 7} r="5" fill="#fff" /></g>; })}
          <path d="M215 170 Q245 155 275 168" fill="none" stroke="#1A120E" strokeWidth={11} strokeLinecap="round" />
          <path d="M325 168 Q355 155 385 170" fill="none" stroke="#1A120E" strokeWidth={11} strokeLinecap="round" />
          <path d="M300 205 Q292 245 300 255 Q310 258 316 250" fill="none" stroke="#A9694B" strokeWidth={6} strokeLinecap="round" />
          <ellipse cx="225" cy="250" rx="18" ry="10" fill="rgba(255,120,120,0.25)" /><ellipse cx="375" cy="250" rx="18" ry="10" fill="rgba(255,120,120,0.25)" />
          {/* hair */}
          <path d="M168 205 Q160 90 255 62 Q330 40 395 78 Q448 112 432 205 Q420 150 385 130 Q340 150 270 128 Q205 120 168 205 Z" fill="url(#hair)" />
          <path d="M250 70 Q300 50 360 72 Q320 80 285 98 Z" fill="rgba(255,255,255,0.12)" />
        </g>
        <Arm s={SH_L} h={l} side={-1} point={cur.point === 'l'} id="a" shirt={look.shirt} look={look} />
        <Arm s={SH_R} h={r} side={1} point={cur.point === 'r'} id="b" shirt={look.shirt} look={look} />
      </g>
    </svg>
  </div>;
};
export type {Pose};
export {LOOKS as looks};

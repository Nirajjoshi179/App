# Reel Character Kit · by @aiwith.om

Code se bana 2D presenter character (pure SVG, koi image nahi), jiske **haath sach mein mudte hain** (shoulder → elbow → hand).
Wave, soch, cheer/jump, point, namaste, aur aankhen: open / wink / think / wide. Saans aur blink apne aap.

```bash
npm i
npx remotion studio                      # live preview
npx remotion render src/index.ts Demo out/demo.mp4
npx remotion still src/index.ts Demo out/coach.png --frame=60 --props='{"look":"coach"}'
```

## Apna character
`src/Character.tsx` mein `LOOKS` badlo: skin, shirt, hair, beard on/off, accent, t-shirt pe label. Ya naya look jodo.

## Actions (timeline)
`src/Demo.tsx` mein `KEYS = [[second, pose], ...]`. Pose = dono haathon ki jagah (`l`, `r` = hand ka x,y, 600×780 box mein) + extras:
`wave`, `jump`, `point: 'r'`, `bow`, `tilt`, `mouth: smile|open|grin`, `eyes: open|wink|think|wide`.
Haath ki jagah do, elbow code khud nikaalta hai (2-bone IK). Poses 0.3s mein smooth blend hote hain.

MIT licence · Remotion ka apna licence hai (badi company: remotion.dev/license).

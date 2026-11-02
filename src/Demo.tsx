// Demo: the character waves → thinks → cheers → points → namaste (6 sec). Swap look="coach" to restyle.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import '@fontsource/inter/900.css';
import {Character, LOOKS} from './Character';

const KEYS: any[] = [
  [0, {l: [148, 668], r: [500, 215], wave: true, mouth: 'smile'}],
  [1.2, {l: [230, 420], r: [452, 668], mouth: 'smile', eyes: 'think', tilt: 6}],
  [2.4, {l: [80, 150], r: [520, 150], jump: 1, mouth: 'open', eyes: 'wide'}],
  [3.6, {l: [148, 668], r: [470, 175], point: 'r', mouth: 'grin', eyes: 'wink', tilt: -6}],
  [4.8, {l: [286, 445], r: [314, 445], mouth: 'smile', bow: 6}],
];
export const Demo: React.FC<{look?: string; title?: string}> = ({look = 'dev', title = 'Mera character'}) => <AbsoluteFill style={{background: '#F1EADC', fontFamily: 'Inter, sans-serif'}}>
  <div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center', fontWeight: 900, fontSize: 84, color: '#1C1A17'}}>{title}</div>
  <Character keys={KEYS} look={LOOKS[look] ?? LOOKS.dev} enter={0} x={240} y={1150} />
</AbsoluteFill>;

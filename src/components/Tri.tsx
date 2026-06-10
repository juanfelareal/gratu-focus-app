import React from 'react';
import Svg, { Path } from 'react-native-svg';

/** Triángulo sonriente de Gratu (trazo, hereda color). */
export function Tri({ size = 24, color = '#F3F1EC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Path
        d="M50 13 L88 81 L12 81 Z"
        stroke={color}
        strokeWidth={11}
        strokeLinejoin="round"
      />
      <Path
        d="M37 58 C43 66.5 57 66.5 63 58"
        stroke={color}
        strokeWidth={8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

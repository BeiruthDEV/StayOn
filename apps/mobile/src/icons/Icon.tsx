import type { ColorValue } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors } from '@/theme';

import { iconPaths, type IconName } from './paths';

type IconProps = {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  color?: ColorValue;
};

/** Ícone de contorno na grade 24x24, equivalente ao helper `icon()` do protótipo. */
export function Icon({ name, size = 22, strokeWidth = 1.7, color = colors.text }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {iconPaths[name].map((d) => (
        <Path
          key={d}
          d={d}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}

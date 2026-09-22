import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '@/theme';

type ProgressRingProps = {
  /** Percentual preenchido, de 0 a 100. */
  percent: number;
  size?: number;
  strokeWidth?: number;
  /** Conteúdo centralizado dentro do anel. */
  children?: React.ReactNode;
};

/** Anel de progresso — o contador circular da sessão de foco. */
export function ProgressRing({
  percent,
  size = 220,
  strokeWidth = 5,
  children,
}: ProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  return (
    <View
      style={[styles.root, { width: size, height: size }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped) }}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.fillLight}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

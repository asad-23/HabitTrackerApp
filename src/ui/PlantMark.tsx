import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path } from 'react-native-svg';

import { useTheme } from '@/design/theme';
import type { PlantSpecies } from '@/domain/plants';

type PlantMarkProps = {
  /** 0 seed … 5 in bloom. */
  stage: number;
  species?: PlantSpecies;
  /** Slightly drooping leaves for a habit that needs attention. */
  wilted?: boolean;
  size?: number;
  /** Renders the pot in muted tones, for empty or locked states. */
  muted?: boolean;
};

type PlantColors = {
  leaf: string;
  leafLight: string;
  accent: string;
  stem: string;
  soil: string;
  pot: string;
  potDark: string;
  surface: string;
};

type SpeciesProps = {
  stage: number;
  colors: PlantColors;
  wilted: boolean;
};

function Monstera({ stage, colors, wilted }: SpeciesProps) {
  const droop = wilted ? 5 : 0;
  const top = 72 - stage * 7;
  const leaves = [
    { y: 66, side: -1, scale: 1 },
    { y: 59, side: 1, scale: 1.05 },
    { y: 50, side: -1, scale: 1.12 },
    { y: 41, side: 1, scale: 1.18 },
  ].slice(0, Math.max(0, stage));

  return (
    <>
      {stage > 0 ? (
        <Path
          d={`M50 76 C 50 ${top + 16}, ${50 + droop} ${top + 7}, ${50 + droop} ${top}`}
          stroke={colors.stem}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      ) : null}

      {leaves.map((leaf, index) => {
        const x = 50 + leaf.side * 18 * leaf.scale;
        const tipY = leaf.y - 17 * leaf.scale;
        const d =
          leaf.side < 0
            ? `M50 ${leaf.y} C ${50 - 20 * leaf.scale} ${leaf.y + 2}, ${x - 2} ${tipY + 5}, ${x} ${tipY} C ${50 - 10 * leaf.scale} ${tipY - 2}, 50 ${leaf.y - 8}, 50 ${leaf.y} Z`
            : `M50 ${leaf.y} C ${50 + 20 * leaf.scale} ${leaf.y + 2}, ${x + 2} ${tipY + 5}, ${x} ${tipY} C ${50 + 10 * leaf.scale} ${tipY - 2}, 50 ${leaf.y - 8}, 50 ${leaf.y} Z`;

        return (
          <G key={index}>
            <Path d={d} fill={index % 2 === 0 ? colors.leafLight : colors.leaf} />
            <Line
              x1="50"
              y1={leaf.y}
              x2={x + leaf.side * 3}
              y2={tipY + 4}
              stroke={colors.surface}
              strokeWidth="1.4"
              strokeLinecap="round"
              opacity={0.65}
            />
            {stage >= 4 ? (
              <Line
                x1={50 + leaf.side * 6}
                y1={leaf.y - 5}
                x2={50 + leaf.side * 11}
                y2={leaf.y - 10}
                stroke={colors.surface}
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity={0.6}
              />
            ) : null}
          </G>
        );
      })}

      {stage >= 5 ? (
        <Path
          d={`M${50 + droop} ${top} C ${50 + droop - 6} ${top - 8}, ${50 + droop + 2} ${top - 12}, ${50 + droop + 4} ${top - 5}`}
          stroke={colors.leafLight}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      ) : null}
    </>
  );
}

function Cactus({ stage, colors }: SpeciesProps) {
  const top = 72 - stage * 8;
  const width = 4 + Math.min(stage, 3) * 0.6;

  return (
    <>
      {stage > 0 ? (
        <Path
          d={`M${50 - width} 74 V ${top + 5} Q${50 - width} ${top} 50 ${top} Q${50 + width} ${top} ${50 + width} ${top + 5} V74 Z`}
          fill={colors.leaf}
        />
      ) : null}

      {stage >= 3 ? (
        <Path
          d={`M${50 - width} 64 H39 Q36 64 36 61 V54`}
          stroke={colors.leafLight}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
      ) : null}

      {stage >= 4 ? (
        <Path
          d={`M${50 + width} 58 H61 Q64 58 64 55 V47`}
          stroke={colors.leaf}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
      ) : null}

      {stage >= 2
        ? [60, 66, 72].map((y) => (
            <G key={y}>
              <Line
                x1={50 - width}
                y1={y}
                x2={50 - width - 2}
                y2={y - 2}
                stroke={colors.stem}
                strokeWidth="1"
                opacity={0.45}
              />
              <Line
                x1={50 + width}
                y1={y + 2}
                x2={50 + width + 2}
                y2={y}
                stroke={colors.stem}
                strokeWidth="1"
                opacity={0.45}
              />
            </G>
          ))
        : null}

      {stage >= 5 ? (
        <>
          <Circle cx="50" cy={top - 3} r="4.5" fill={colors.accent} />
          <Circle cx="50" cy={top - 3} r="1.8" fill={colors.surface} opacity={0.8} />
        </>
      ) : null}
    </>
  );
}

function Fern({ stage, colors }: SpeciesProps) {
  const stemTop = 72 - stage * 8;
  const count = stage * 2;
  const leaflets = Array.from({ length: count }, (_, index) => {
    const t = (index + 1) / (count + 1);
    const y = 72 - t * (72 - stemTop);
    const side = index % 2 === 0 ? -1 : 1;
    const length = 7 + t * 5;
    const cx = 50 + (side * length) / 2;
    return { key: index, y, side, length, cx, light: index % 3 === 0 };
  });

  return (
    <>
      {stage > 0 ? (
        <Path
          d={`M50 76 C 47 ${stemTop + 20}, 53 ${stemTop + 10}, 50 ${stemTop}`}
          stroke={colors.stem}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      ) : null}

      {leaflets.map((leaflet) => (
        <Ellipse
          key={leaflet.key}
          cx={leaflet.cx}
          cy={leaflet.y}
          rx={leaflet.length / 2}
          ry="2.2"
          fill={leaflet.light ? colors.leafLight : colors.leaf}
          transform={`rotate(${leaflet.side * 26} ${leaflet.cx} ${leaflet.y})`}
        />
      ))}

      {stage >= 5 ? (
        <Path
          d={`M50 ${stemTop} C 54 ${stemTop - 4}, 58 ${stemTop}, 55 ${stemTop + 5}`}
          stroke={colors.leafLight}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      ) : null}
    </>
  );
}

function Sunflower({ stage, colors, wilted }: SpeciesProps) {
  const droop = wilted ? 6 : 0;
  const top = 72 - stage * 8;
  const headX = 50 + droop;
  const petals = Array.from({ length: 8 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 8;
    return {
      key: index,
      cx: headX + Math.cos(angle) * 7,
      cy: top + Math.sin(angle) * 7,
    };
  });

  return (
    <>
      {stage > 0 ? (
        <Path
          d={`M50 76 C 50 ${top + 18}, ${50 + droop} ${top + 8}, ${headX} ${top}`}
          stroke={colors.stem}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      ) : null}

      {stage >= 1 ? (
        <Ellipse
          cx="43"
          cy="64"
          rx="7"
          ry="3"
          fill={colors.leafLight}
          transform="rotate(-28 43 64)"
        />
      ) : null}
      {stage >= 2 ? (
        <Ellipse cx="58" cy="56" rx="7.5" ry="3" fill={colors.leaf} transform="rotate(26 58 56)" />
      ) : null}
      {stage >= 3 ? (
        <Ellipse
          cx="43"
          cy="47"
          rx="7"
          ry="2.8"
          fill={colors.leafLight}
          transform="rotate(-24 43 47)"
        />
      ) : null}

      {stage === 4 ? <Ellipse cx={headX} cy={top} rx="3.5" ry="5" fill={colors.accent} /> : null}

      {stage >= 5 ? (
        <>
          {petals.map((petal) => (
            <Circle key={petal.key} cx={petal.cx} cy={petal.cy} r="4" fill={colors.accent} />
          ))}
          <Circle cx={headX} cy={top} r="5" fill={colors.potDark} />
          <Circle cx={headX} cy={top} r="2" fill={colors.soil} opacity={0.7} />
        </>
      ) : null}
    </>
  );
}

function Succulent({ stage, colors }: SpeciesProps) {
  const count = stage === 0 ? 0 : 2 + stage;
  const length = 9 + stage * 2.5;
  const leaves = Array.from({ length: count }, (_, index) => ({
    key: index,
    angle: (360 / count) * index,
    light: index % 2 === 0,
  }));

  return (
    <>
      {leaves.map((leaf) => (
        <Path
          key={leaf.key}
          d={`M50 66 C 45 ${66 - length * 0.5}, 45 ${66 - length}, 50 ${66 - length * 1.15} C 55 ${66 - length}, 55 ${66 - length * 0.5}, 50 66 Z`}
          fill={leaf.light ? colors.leafLight : colors.leaf}
          transform={`rotate(${leaf.angle} 50 66)`}
        />
      ))}

      {stage >= 5 ? (
        <>
          <Line
            x1="50"
            y1="60"
            x2="50"
            y2="42"
            stroke={colors.stem}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <Circle cx="50" cy="40" r="4" fill={colors.accent} />
          <Circle cx="50" cy="40" r="1.5" fill={colors.surface} opacity={0.8} />
        </>
      ) : null}
    </>
  );
}

const SPECIES = {
  monstera: Monstera,
  cactus: Cactus,
  fern: Fern,
  sunflower: Sunflower,
  succulent: Succulent,
} as const;

/**
 * One habit, one plant. The species stays the same while the growth stage
 * follows the 30-day consistency score, so the garden reads as a living place.
 */
export function PlantMark({
  stage,
  species = 'monstera',
  wilted = false,
  size = 96,
  muted = false,
}: PlantMarkProps) {
  const { colors } = useTheme();
  const clamped = Math.max(0, Math.min(5, Math.round(stage)));
  const Species = SPECIES[species];

  const plantColors: PlantColors = {
    leaf: muted || wilted ? colors.heatSkipped : colors.plantLeaf,
    leafLight: muted || wilted ? colors.borderStrong : colors.plantLeafLight,
    accent: muted || wilted ? colors.borderStrong : colors.accent,
    stem: muted || wilted ? colors.faint : colors.primaryText,
    soil: muted ? colors.borderStrong : colors.plantSoil,
    pot: muted ? colors.borderStrong : colors.plantPot,
    potDark: muted ? colors.faint : colors.plantPotDark,
    surface: colors.surface,
  };

  return (
    <View
      style={[styles.wrap, { width: size, height: size }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Ellipse cx="50" cy="76" rx="20" ry="5" fill={plantColors.soil} />

        <G transform={wilted ? 'rotate(6 50 76)' : undefined}>
          {clamped === 0 ? (
            <G>
              <Ellipse cx="50" cy="74" rx="6" ry="4" fill={plantColors.potDark} />
              <Ellipse cx="48.2" cy="72.8" rx="1.8" ry="1.1" fill={plantColors.soil} opacity={0.8} />
              {/* A germinating tip, so a new habit still reads as alive. */}
              <Path
                d="M52 71 Q 53.4 68.4 51.6 66.6"
                stroke={plantColors.leaf}
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
            </G>
          ) : null}
          <Species stage={clamped} colors={plantColors} wilted={wilted} />
        </G>

        <Path d="M32 78 H68 L64 92 Q63.4 96 59 96 H41 Q36.6 96 36 92 Z" fill={plantColors.pot} />
        <Line
          x1="32"
          y1="78"
          x2="68"
          y2="78"
          stroke={plantColors.potDark}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <Line
          x1="40"
          y1="84"
          x2="60"
          y2="84"
          stroke={plantColors.potDark}
          strokeWidth="2"
          strokeLinecap="round"
          opacity={0.35}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});

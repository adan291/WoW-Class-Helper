import React from 'react';
import { DeathKnightIcon } from './icons/DeathKnightIcon.tsx';
import { DemonHunterIcon } from './icons/DemonHunterIcon.tsx';
import { DruidIcon } from './icons/DruidIcon.tsx';
import { EvokerIcon } from './icons/EvokerIcon.tsx';
import { HunterIcon } from './icons/HunterIcon.tsx';
import { MageIcon } from './icons/MageIcon.tsx';
import { MonkIcon } from './icons/MonkIcon.tsx';
import { PaladinIcon } from './icons/PaladinIcon.tsx';
import { PriestIcon } from './icons/PriestIcon.tsx';
import { RogueIcon } from './icons/RogueIcon.tsx';
import { ShamanIcon } from './icons/ShamanIcon.tsx';
import { WarlockIcon } from './icons/WarlockIcon.tsx';
import { WarriorIcon } from './icons/WarriorIcon.tsx';

// Fix: Cannot find namespace 'JSX'.
const iconMap: Record<string, (props: React.SVGProps<SVGSVGElement>) => React.ReactElement> = {
  warrior: WarriorIcon,
  paladin: PaladinIcon,
  hunter: HunterIcon,
  rogue: RogueIcon,
  priest: PriestIcon,
  shaman: ShamanIcon,
  mage: MageIcon,
  warlock: WarlockIcon,
  monk: MonkIcon,
  druid: DruidIcon,
  demon_hunter: DemonHunterIcon,
  death_knight: DeathKnightIcon,
  evoker: EvokerIcon,
};

// Fix: Update props to correctly resolve SVG attributes.
interface ClassIconRendererProps {
  classId: string;
}

export const ClassIconRenderer = ({
  classId,
  ...props
}: ClassIconRendererProps & React.SVGProps<SVGSVGElement>) => {
  const IconComponent = iconMap[classId];
  if (!IconComponent) {
    // Return a default placeholder or null if a classId has no matching icon
    return (
      <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="64" height="64" fill="currentColor" opacity="0.2" />
        <text x="32" y="38" fontSize="24" textAnchor="middle" fill="currentColor">
          ?
        </text>
      </svg>
    );
  }
  return <IconComponent {...props} />;
};

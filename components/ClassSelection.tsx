
import React from 'react';
import { WOW_CLASSES } from '../constants.ts';
import type { WowClass } from '../types.ts';
import ClassIcon from './ClassIcon.tsx';

interface ClassSelectionProps {
  onSelectClass: (wowClass: WowClass) => void;
}

const ClassSelection = ({ onSelectClass }: ClassSelectionProps) => {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-4xl font-bold text-white mb-2 text-center" style={{textShadow: '0 2px 5px rgba(0,0,0,0.7)'}}>Select Your Class</h2>
      <p className="text-lg text-gray-400 mb-8 text-center max-w-2xl" style={{textShadow: '0 1px 3px rgba(0,0,0,0.5)'}}>Choose your class to get AI-powered guides, tips, and strategies to master your gameplay in World of Warcraft.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4 md:gap-6">
        {WOW_CLASSES.map((wowClass) => (
          <ClassIcon key={wowClass.id} wowClass={wowClass} onClick={() => onSelectClass(wowClass)} />
        ))}
      </div>
    </div>
  );
};

export default ClassSelection;
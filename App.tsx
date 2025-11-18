
import React, { useState } from 'react';
import type { WowClass, UserRole } from './types.ts';
import ClassSelection from './components/ClassSelection.tsx';
import ClassHub from './components/ClassHub.tsx';
import { WowIcon } from './components/icons/WowIcon.tsx';

const App = () => {
  const [selectedClass, setSelectedClass] = useState<WowClass | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('user');

  const handleSelectClass = (wowClass: WowClass) => {
    setSelectedClass(wowClass);
  };

  const handleGoBack = () => {
    setSelectedClass(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 bg-cover bg-center bg-fixed" style={{backgroundImage: "url('https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=1920&auto=format&fit=crop')"}}>
      <div className="min-h-screen bg-gray-900 bg-opacity-80 backdrop-blur-sm">
        <header className="py-4 px-6 flex items-center justify-between border-b border-gray-700/50 shadow-lg bg-gray-900 bg-opacity-50">
          <div className="flex items-center">
            <WowIcon className="h-10 w-10 mr-4 text-yellow-400" />
            <h1 className="text-3xl font-black tracking-wider uppercase text-yellow-400" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>WoW AI Class Helper</h1>
          </div>
          <div className="relative">
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 appearance-none"
            >
              <option value="user">User Mode</option>
              <option value="master">Master Mode</option>
              <option value="admin">Admin Mode</option>
            </select>
          </div>
        </header>
        <main className="p-4 md:p-8">
          {selectedClass ? (
            <ClassHub wowClass={selectedClass} onGoBack={handleGoBack} userRole={userRole} />
          ) : (
            <ClassSelection onSelectClass={handleSelectClass} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;

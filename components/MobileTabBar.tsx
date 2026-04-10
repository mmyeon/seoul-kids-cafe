'use client';

type Tab = 'list' | 'map';

interface MobileTabBarProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}

interface TabConfig {
  id: Tab;
  icon: string;
  label: string;
}

const TABS: TabConfig[] = [
  { id: 'list', icon: '📋', label: '목록' },
  { id: 'map', icon: '🗺️', label: '지도' },
];

export default function MobileTabBar({ activeTab, onChange }: MobileTabBarProps) {
  return (
    <div className="md:hidden w-full bg-gray-100 rounded-xl p-1 flex gap-1">
      {TABS.map(({ id, icon, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === id
              ? 'bg-white shadow-sm text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span>{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

import React from 'react'
import { useApp } from '../context/AppContext.jsx'

const tabs = [
  { id: 'inicio', icon: '🏠' },
  { id: 'activos', icon: '📊' },
  { id: 'action', icon: null },
  { id: 'cuenta', icon: '🏦' },
  { id: 'perfil', icon: '👤' },
]

export function BottomNav({ activeTab, onTabChange, onActionPress }) {
  const { t } = useApp()
  const navLabels = t.nav

  return (
    <nav className="flex items-center justify-around px-2 py-2 bg-bg-card border-t border-border-color">
      {tabs.map(tab => {
        if (tab.id === 'action') {
          return (
            <button
              key="action"
              onClick={onActionPress}
              className="w-14 h-14 rounded-full flex items-center justify-center -mt-5 shadow-lg shadow-teal/30"
              style={{ background: 'linear-gradient(135deg, #2EC4A9 0%, #1A7A6E 100%)' }}
            >
              <span className="text-white text-3xl font-light leading-none">⊕</span>
            </button>
          )
        }
        const isActive = activeTab === tab.id
        const label = navLabels[tab.id] || tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex flex-col items-center gap-0.5 min-w-[48px] py-1"
          >
            <span className="text-xl">{tab.icon}</span>
            <span className={`text-[10px] font-medium uppercase tracking-wider ${isActive ? 'text-teal' : 'text-text-muted'}`}>
              {label}
            </span>
            {isActive && <div className="w-1 h-1 rounded-full bg-teal mt-0.5" />}
          </button>
        )
      })}
    </nav>
  )
}

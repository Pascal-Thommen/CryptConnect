import React from 'react'
import { useApp } from '../context/AppContext.jsx'
import { Icon } from './Icons.jsx'

const tabs = [
  { id: 'inicio', icon: 'home' },
  { id: 'activos', icon: 'chart' },
  { id: 'action', icon: null },
  { id: 'cuenta', icon: 'bank' },
  { id: 'perfil', icon: 'user' },
]

export function BottomNav({ activeTab, onTabChange, onActionPress }) {
  const { t } = useApp()
  const navLabels = t.nav

  return (
    <nav className="flex items-center justify-around px-2 pt-2 pb-3 bg-bg-card border-t border-border-color">
      {tabs.map(tab => {
        if (tab.id === 'action') {
          return (
            <button
              key="action"
              onClick={onActionPress}
              className="w-14 h-14 rounded-full flex items-center justify-center -mt-6 shadow-lg shadow-teal/20"
              style={{ background: 'linear-gradient(135deg, #2EC4A9 0%, #1A7A6E 100%)' }}
            >
              <Icon name="plus" size={26} className="text-white" />
            </button>
          )
        }
        const isActive = activeTab === tab.id
        const label = navLabels[tab.id] || tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex flex-col items-center gap-1 min-w-[48px] py-1"
          >
            <Icon name={tab.icon} size={20} className={isActive ? 'text-teal' : 'text-text-muted'} />
            <span className={`text-[10px] font-medium uppercase tracking-wider ${isActive ? 'text-teal' : 'text-text-muted'}`}>
              {label}
            </span>
            {isActive && <div className="w-1 h-1 rounded-full bg-teal" />}
          </button>
        )
      })}
    </nav>
  )
}

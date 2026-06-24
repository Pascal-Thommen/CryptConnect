import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { TransactionItem } from '../components/TransactionItem.jsx'

const mockFacturas = [
  { id: 'F001', numero: '001-001-0000123', concepto: 'Comisiones Junio 2026', monto: 45200 },
  { id: 'F002', numero: '001-001-0000098', concepto: 'Comisiones Mayo 2026', monto: 38900 },
]

const filterTypes = ['todos', 'enviado', 'recibido', 'swap', 'pago']

export function Perfil() {
  const { t, user, language, setLanguage, transactions } = useApp()
  const tp = t.perfil
  const [filter, setFilter] = useState('todos')
  const [notif, setNotif] = useState({ tx: true, prices: true, promo: false })

  const filtered = filter === 'todos'
    ? transactions
    : transactions.filter(tx => tx.tipo === filter || (filter === 'pago' && tx.tipo === 'pago'))

  const initials = user.name.split(' ').map(n => n[0]).join('')

  const formatPYG = n => `₲ ${Math.round(n).toLocaleString('es-PY')}`

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      {/* Avatar + Info */}
      <div className="flex flex-col items-center pt-8 pb-6 px-5">
        <div className="w-20 h-20 rounded-full bg-teal/20 border-2 border-teal flex items-center justify-center text-teal text-2xl font-bold mb-3">
          {initials}
        </div>
        <p className="text-text-primary font-semibold text-xl">{user.name}</p>
        <p className="text-text-muted text-sm">{user.email}</p>
        <div className="flex flex-col items-center gap-1 mt-3">
          <p className="text-green text-sm">{tp.kycVerificado}</p>
          <p className="text-text-muted text-xs">{tp.regulado}</p>
        </div>
      </div>

      {/* Facturas */}
      <div className="mx-5 mb-5 bg-bg-card border border-border-color rounded-2xl p-5">
        <p className="text-text-secondary font-medium text-sm mb-4">{tp.facturas}</p>
        {mockFacturas.map(f => (
          <div key={f.id} className="flex items-center justify-between py-3 border-b border-border-color/50 last:border-0">
            <div>
              <p className="text-text-primary text-sm font-medium">Fact. {f.numero}</p>
              <p className="text-text-muted text-xs">{f.concepto}</p>
              <p className="text-teal text-xs tabular-nums">{formatPYG(f.monto)}</p>
            </div>
            <button className="text-text-secondary text-xs border border-border-color rounded-lg px-3 py-1.5 hover:border-teal hover:text-teal transition-colors">
              {tp.descargar}
            </button>
          </div>
        ))}
      </div>

      {/* Historial */}
      <div className="px-5 mb-5">
        <p className="text-text-secondary font-medium text-sm mb-3">{tp.historial}</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {filterTypes.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-colors ${filter === f ? 'bg-teal text-bg-primary' : 'bg-bg-card border border-border-color text-text-muted'}`}
            >
              {tp[f]}
            </button>
          ))}
        </div>
        <div className="mt-3 bg-bg-card border border-border-color rounded-2xl px-4">
          {filtered.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-8">Sin transacciones</p>
          ) : (
            filtered.map(tx => <TransactionItem key={tx.id} tx={tx} />)
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="mx-5 mb-5 bg-bg-card border border-border-color rounded-2xl p-5 space-y-5">
        <p className="text-text-secondary font-medium text-sm">⚙️ {tp.ajustes}</p>

        {/* Language */}
        <div>
          <p className="text-text-muted text-xs mb-2">{tp.idioma}</p>
          <div className="flex gap-2">
            {['es', 'en'].map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${language === lang ? 'bg-teal text-bg-primary' : 'bg-bg-elevated text-text-muted border border-border-color'}`}
              >
                {lang === 'es' ? '🇪🇸 Español' : '🇺🇸 English'}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div>
          <p className="text-text-muted text-xs mb-2">{tp.notificaciones}</p>
          {[
            { key: 'tx', label: 'Transacciones' },
            { key: 'prices', label: 'Precios cripto' },
            { key: 'promo', label: 'Promociones' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <span className="text-text-primary text-sm">{item.label}</span>
              <button
                onClick={() => setNotif(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                className={`text-sm transition-colors ${notif[item.key] ? 'text-green' : 'text-text-muted'}`}
              >
                {notif[item.key] ? '🔔 ON' : '🔕 OFF'}
              </button>
            </div>
          ))}
        </div>

        {/* Security */}
        <div>
          <p className="text-text-muted text-xs mb-2">{tp.seguridad}</p>
          <div className="space-y-2">
            <button className="w-full text-left py-2 text-text-primary text-sm">{tp.cambiarPin}</button>
            <button className="w-full text-left py-2 text-text-primary text-sm">{tp.biometria}</button>
          </div>
        </div>
      </div>

      {/* Sign out + version */}
      <div className="px-5 flex flex-col items-center gap-3">
        <button className="w-full py-3 border border-red/30 rounded-2xl text-red text-sm font-medium hover:bg-red/5 transition-colors">
          {tp.cerrarSesion}
        </button>
        <p className="text-text-muted text-xs">v1.0.0 · CriptConnect S.A. · PSAV/VASP</p>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { TransactionItem } from '../components/TransactionItem.jsx'
import { Icon } from '../components/Icons.jsx'
import { formatPYG } from '../utils/formatters.js'

const mockFacturas = [
  { id: 'F001', numero: '001-001-0000123', concepto: 'Comisiones Junio 2026', monto: 45200 },
  { id: 'F002', numero: '001-001-0000098', concepto: 'Comisiones Mayo 2026', monto: 38900 },
]

const filterTypes = ['todos', 'enviado', 'recibido', 'swap', 'pago']

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`w-10 h-6 rounded-full relative transition-colors ${on ? 'bg-teal' : 'bg-bg-elevated border border-border-color'}`}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-1'}`} />
    </button>
  )
}

export function Perfil() {
  const { t, user, language, setLanguage, transactions } = useApp()
  const tp = t.perfil
  const [filter, setFilter] = useState('todos')
  const [notif, setNotif] = useState({ tx: true, prices: true, promo: false })

  const filtered = filter === 'todos'
    ? transactions
    : transactions.filter(tx => tx.tipo === filter)

  const initials = user.name.split(' ').map(n => n[0]).join('')

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      {/* Avatar + Info */}
      <div className="flex flex-col items-center pt-8 pb-6 px-5">
        <div className="w-20 h-20 rounded-full bg-teal/15 border-2 border-teal/40 flex items-center justify-center text-teal text-2xl font-bold mb-3">
          {initials}
        </div>
        <p className="text-text-primary font-semibold text-xl">{user.name}</p>
        <p className="text-text-muted text-sm mt-0.5">{user.email}</p>
        <div className="flex items-center gap-2 mt-3 px-3 py-1.5 bg-green/10 border border-green/20 rounded-full">
          <Icon name="check" size={13} className="text-green" />
          <span className="text-green text-xs font-medium">KYC Verificado</span>
        </div>
        <p className="text-text-muted text-xs mt-2">Regulado BCP · Licencia PSAV/VASP</p>
      </div>

      {/* Facturas */}
      <div className="mx-5 mb-5 bg-bg-card border border-border-color rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="invoice" size={16} className="text-text-secondary" />
          <p className="text-text-secondary font-medium text-sm">{tp.facturas}</p>
        </div>
        {mockFacturas.map(f => (
          <div key={f.id} className="flex items-center justify-between py-3 border-b border-border-color/40 last:border-0">
            <div>
              <p className="text-text-primary text-sm font-medium">Fact. {f.numero}</p>
              <p className="text-text-muted text-xs mt-0.5">{f.concepto}</p>
              <p className="text-teal text-xs tabular-nums mt-0.5">{formatPYG(f.monto)}</p>
            </div>
            <button className="flex items-center gap-1.5 text-text-secondary text-xs border border-border-color rounded-lg px-3 py-1.5 hover:border-teal/50 hover:text-teal transition-colors">
              <Icon name="download" size={12} />
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
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-colors ${filter === f ? 'bg-teal text-bg-primary' : 'bg-bg-card border border-border-color text-text-muted hover:text-text-secondary'}`}
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
      <div className="mx-5 mb-5 bg-bg-card border border-border-color rounded-2xl overflow-hidden">
        {/* Language */}
        <div className="p-5 border-b border-border-color/50">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="language" size={15} className="text-text-secondary" />
            <p className="text-text-secondary font-medium text-sm">{tp.idioma}</p>
          </div>
          <div className="flex gap-2">
            {[
              { code: 'es', label: 'Español' },
              { code: 'en', label: 'English' },
            ].map(lang => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${language === lang.code ? 'bg-teal text-bg-primary' : 'bg-bg-elevated text-text-muted border border-border-color'}`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="p-5 border-b border-border-color/50">
          <p className="text-text-secondary font-medium text-sm mb-3">{tp.notificaciones}</p>
          {[
            { key: 'tx',     label: 'Transacciones' },
            { key: 'prices', label: 'Precios cripto' },
            { key: 'promo',  label: 'Promociones' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2.5">
              <span className="text-text-primary text-sm">{item.label}</span>
              <Toggle on={notif[item.key]} onChange={() => setNotif(prev => ({ ...prev, [item.key]: !prev[item.key] }))} />
            </div>
          ))}
        </div>

        {/* Security */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="shield" size={15} className="text-text-secondary" />
            <p className="text-text-secondary font-medium text-sm">{tp.seguridad}</p>
          </div>
          {[
            { icon: 'lock',        label: 'Cambiar PIN' },
            { icon: 'fingerprint', label: 'Biometría activada' },
          ].map(item => (
            <div key={item.icon} className="flex items-center justify-between py-2.5 border-b border-border-color/40 last:border-0">
              <div className="flex items-center gap-2">
                <Icon name={item.icon} size={16} className="text-text-muted" />
                <span className="text-text-primary text-sm">{item.label}</span>
              </div>
              <Icon name="chevronRight" size={16} className="text-text-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Sign out + version */}
      <div className="px-5 flex flex-col items-center gap-3">
        <button className="w-full flex items-center justify-center gap-2 py-3 border border-red/20 rounded-2xl text-red text-sm font-medium hover:bg-red/5 transition-colors">
          <Icon name="logout" size={16} />
          Cerrar sesión
        </button>
        <p className="text-text-muted text-xs">v1.0.0 · CriptConnect S.A. · PSAV/VASP</p>
      </div>
    </div>
  )
}

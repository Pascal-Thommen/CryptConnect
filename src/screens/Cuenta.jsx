import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useToast } from '../components/Toast.jsx'
import { TransactionItem } from '../components/TransactionItem.jsx'
import { CardDisplay } from '../components/CardDisplay.jsx'
import { Modal } from '../components/Modal.jsx'
import { formatPYG } from '../utils/formatters.js'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableItem({ item, index }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-3 py-3 border-b border-border-color/50 last:border-0 cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <span className="text-text-muted">≡</span>
      <span className="text-text-muted text-sm w-4">{index + 1}</span>
      <span className="text-teal text-lg w-8 text-center">{item.icon}</span>
      <span className="text-text-primary text-sm flex-1">{item.label}</span>
    </div>
  )
}

export function Cuenta({ onAction }) {
  const { t, cuenta, transactions, setPriority } = useApp()
  const { showToast } = useToast()
  const tc = t.cuenta

  const [showServicio, setShowServicio] = useState(false)
  const [showQR, setShowQR] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = cuenta.paymentPriority.findIndex(i => i.id === active.id)
      const newIndex = cuenta.paymentPriority.findIndex(i => i.id === over.id)
      setPriority(arrayMove(cuenta.paymentPriority, oldIndex, newIndex))
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).catch(() => {})
    showToast(t.common.copiado)
  }

  const fiatTxs = transactions.filter(tx => tx.asset === 'fiat')

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <p className="text-text-muted text-[11px] uppercase tracking-[0.08em]">{tc.titulo}</p>
        <p className="text-text-primary font-bold text-3xl tabular-nums mt-1" style={{ letterSpacing: '-0.02em' }}>
          {formatPYG(cuenta.saldo)}
        </p>
        <p className="text-text-muted text-xs mt-0.5">{tc.disponible}</p>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-around px-5 mb-6">
        {[
          { id: 'enviar', icon: '↑', label: tc.transferir },
          { id: 'recibir', icon: 'QR', label: tc.qr, onClick: () => setShowQR(true) },
          { id: 'servicio', icon: '🧾', label: tc.servicios, onClick: () => setShowServicio(true) },
        ].map((a, i) => (
          <button key={i} onClick={a.onClick || (() => onAction(a.id))} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-bg-card border border-border-color flex items-center justify-center text-teal text-lg">
              {a.icon}
            </div>
            <span className="text-text-muted text-xs">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Account Data */}
      <div className="mx-5 mb-5 bg-bg-card border border-border-color rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-text-secondary font-medium text-sm">{tc.datosCuenta}</p>
          <button onClick={() => copyToClipboard(`${cuenta.numero} | ${cuenta.sipap}`)} className="text-teal text-xs">{tc.copiarTodo}</button>
        </div>
        {[
          { label: tc.titular, value: 'Ana García' },
          { label: tc.nroCuenta, value: cuenta.numero, copy: true },
          { label: tc.entidad, value: cuenta.entidad },
          { label: tc.ruc, value: cuenta.rucEntidad },
          { label: tc.sipap, value: cuenta.sipap, copy: true },
        ].map((row, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-border-color/50 last:border-0">
            <span className="text-text-muted text-xs">{row.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-text-primary text-sm font-mono">{row.value}</span>
              {row.copy && (
                <button onClick={() => copyToClipboard(row.value)} className="text-teal text-xs">📋</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Cards */}
      <div className="mb-5">
        <p className="text-text-secondary font-medium text-sm px-5 mb-3">{tc.misTarjetas}</p>
        <div className="flex gap-5 px-5 overflow-x-auto scrollbar-hide pb-1">
          {cuenta.tarjetas.map(card => (
            <div key={card.id} className="flex flex-col">
              <CardDisplay card={card} />
            </div>
          ))}
        </div>
      </div>

      {/* Payment Priority Drag & Drop */}
      <div className="mx-5 mb-5 bg-bg-card border border-border-color rounded-2xl p-5">
        <p className="text-text-secondary font-medium text-sm mb-1">{tc.prioridad}</p>
        <p className="text-text-muted text-xs mb-4">{tc.prioridadInfo}</p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={cuenta.paymentPriority.map(i => i.id)} strategy={verticalListSortingStrategy}>
            {cuenta.paymentPriority.map((item, idx) => (
              <SortableItem key={item.id} item={item} index={idx} />
            ))}
          </SortableContext>
        </DndContext>
        <button className="mt-3 text-teal text-xs">{tc.agregarFuente}</button>
      </div>

      {/* Recent Transactions */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-text-secondary text-sm font-medium">{tc.ultimasTx}</p>
          <button className="text-teal text-xs">{tc.verHistorial} →</button>
        </div>
        <div className="bg-bg-card border border-border-color rounded-2xl px-4">
          {fiatTxs.slice(0, 5).map(tx => <TransactionItem key={tx.id} tx={tx} />)}
        </div>
      </div>

      {/* Servicio Modal */}
      <Modal open={showServicio} onClose={() => setShowServicio(false)}>
        <h3 className="text-text-primary font-semibold mb-4">Pagar Servicio</h3>
        <div className="space-y-3">
          <select className="w-full bg-bg-card border border-border-color rounded-xl px-4 py-3 text-text-primary text-sm">
            <option>ANDE</option><option>ESSAP</option><option>Copaco</option><option>Otro</option>
          </select>
          <input placeholder="NIS / Contrato" className="w-full bg-bg-card border border-border-color rounded-xl px-4 py-3 text-text-primary text-sm placeholder-text-muted" />
          <input placeholder="Monto en ₲" className="w-full bg-bg-card border border-border-color rounded-xl px-4 py-3 text-text-primary text-sm placeholder-text-muted" />
        </div>
        <button className="mt-4 w-full py-3 bg-teal text-bg-primary font-semibold rounded-xl text-sm">Buscar factura</button>
        <button onClick={() => setShowServicio(false)} className="mt-2 w-full py-3 text-text-muted text-sm">Cancelar</button>
      </Modal>

      {/* QR Modal */}
      <Modal open={showQR} onClose={() => setShowQR(false)}>
        <h3 className="text-text-primary font-semibold mb-4 text-center">QR de recepción</h3>
        <div className="bg-white rounded-xl p-4 mx-auto w-48 h-48 flex items-center justify-center">
          <p className="text-bg-primary text-xs text-center break-all font-mono">{cuenta.sipap}</p>
        </div>
        <p className="text-text-muted text-xs text-center mt-3 font-mono">{cuenta.sipap}</p>
        <button onClick={() => { copyToClipboard(cuenta.sipap); setShowQR(false) }} className="mt-4 w-full py-3 bg-teal text-bg-primary font-semibold rounded-xl text-sm">
          📋 Copiar SIPAP
        </button>
      </Modal>
    </div>
  )
}

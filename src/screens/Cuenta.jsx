import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useToast } from '../components/Toast.jsx'
import { TransactionItem } from '../components/TransactionItem.jsx'
import { CardDisplay } from '../components/CardDisplay.jsx'
import { Modal } from '../components/Modal.jsx'
import { Icon } from '../components/Icons.jsx'
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

function SortableItem({ item, index, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 1 : 0,
      }}
      className="flex items-center gap-3 py-3 border-b border-border-color/40 last:border-0"
    >
      {/* Drag handle only — not the entire row */}
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 text-text-muted cursor-grab active:cursor-grabbing p-1 -ml-1 touch-none"
      >
        <Icon name="grip" size={16} />
      </div>
      <span className="text-text-muted text-xs w-4 flex-shrink-0">{index + 1}</span>
      <span className="text-text-primary text-sm flex-1 truncate">{item.label}</span>
      <button
        onClick={() => onRemove(item.id)}
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-red hover:bg-red/10 transition-colors"
      >
        <Icon name="close" size={13} />
      </button>
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
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
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

  const handleRemovePriority = (id) => {
    setPriority(cuenta.paymentPriority.filter(i => i.id !== id))
    showToast('Fuente de pago eliminada')
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
        <p className="text-text-muted text-[10px] uppercase tracking-[0.1em]">{tc.titulo}</p>
        <p
          className="text-text-primary font-bold tabular-nums mt-1"
          style={{ fontSize: 28, letterSpacing: '-0.02em' }}
        >
          {formatPYG(cuenta.saldo)}
        </p>
        <p className="text-text-muted text-xs mt-0.5">{tc.disponible}</p>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-around px-5 mb-6">
        {[
          { id: 'enviar',   icon: 'send',     label: tc.transferir },
          { id: 'qr',       icon: 'qr',       label: tc.qr,        onClick: () => setShowQR(true) },
          { id: 'servicio', icon: 'services',  label: tc.servicios, onClick: () => setShowServicio(true) },
        ].map((a, i) => (
          <button key={i} onClick={a.onClick || (() => onAction(a.id))} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-bg-card border border-border-color flex items-center justify-center hover:border-teal/50 transition-colors">
              <Icon name={a.icon} size={20} className="text-teal" />
            </div>
            <span className="text-text-muted text-xs">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Account Data */}
      <div className="mx-5 mb-5 bg-bg-card border border-border-color rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-text-secondary font-medium text-sm">{tc.datosCuenta}</p>
          <button
            onClick={() => copyToClipboard(`Cuenta: ${cuenta.numero} | SIPAP: ${cuenta.sipap}`)}
            className="flex items-center gap-1 text-teal text-xs font-medium"
          >
            <Icon name="copy" size={12} />
            {tc.copiarTodo}
          </button>
        </div>
        {[
          { label: tc.titular,   value: 'Ana García' },
          { label: tc.nroCuenta, value: cuenta.numero,     copy: true },
          { label: tc.entidad,   value: cuenta.entidad },
          { label: tc.ruc,       value: cuenta.rucEntidad },
          { label: tc.sipap,     value: cuenta.sipap,      copy: true },
        ].map((row, i) => (
          <div key={i} className="flex items-center justify-between py-2.5 border-b border-border-color/40 last:border-0">
            <span className="text-text-muted text-xs">{row.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-text-primary text-sm font-mono">{row.value}</span>
              {row.copy && (
                <button
                  onClick={() => copyToClipboard(row.value)}
                  className="text-text-muted hover:text-teal transition-colors"
                >
                  <Icon name="copy" size={13} />
                </button>
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

      {/* Payment Priority */}
      <div className="mx-5 mb-5 bg-bg-card border border-border-color rounded-2xl p-5">
        <p className="text-text-secondary font-medium text-sm mb-0.5">{tc.prioridad}</p>
        <p className="text-text-muted text-xs mb-4">{tc.prioridadInfo}</p>

        {cuenta.paymentPriority.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-4">Sin fuentes de pago</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={cuenta.paymentPriority.map(i => i.id)}
              strategy={verticalListSortingStrategy}
            >
              {cuenta.paymentPriority.map((item, idx) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  index={idx}
                  onRemove={handleRemovePriority}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}

        <button className="mt-3 flex items-center gap-1.5 text-teal text-xs font-medium">
          <Icon name="plus" size={13} />
          {tc.agregarFuente}
        </button>
      </div>

      {/* Recent Transactions */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-text-secondary text-sm font-medium">{tc.ultimasTx}</p>
          <button className="flex items-center gap-1 text-teal text-xs font-medium">
            {tc.verHistorial}
            <Icon name="chevronRight" size={12} />
          </button>
        </div>
        <div className="bg-bg-card border border-border-color rounded-2xl px-4">
          {fiatTxs.slice(0, 5).map(tx => <TransactionItem key={tx.id} tx={tx} />)}
        </div>
      </div>

      {/* Servicio Modal */}
      <Modal open={showServicio} onClose={() => setShowServicio(false)}>
        <h3 className="text-text-primary font-semibold mb-5">Pagar Servicio</h3>
        <div className="space-y-3">
          <select className="w-full bg-bg-card border border-border-color rounded-xl px-4 py-3 text-text-primary text-sm">
            <option>ANDE</option><option>ESSAP</option><option>Copaco</option><option>Otro</option>
          </select>
          <input
            placeholder="NIS / Contrato"
            className="w-full bg-bg-card border border-border-color rounded-xl px-4 py-3 text-text-primary text-sm placeholder-text-muted"
          />
          <input
            placeholder="Monto en ₲"
            className="w-full bg-bg-card border border-border-color rounded-xl px-4 py-3 text-text-primary text-sm placeholder-text-muted"
          />
        </div>
        <button className="mt-4 w-full py-3 bg-teal text-bg-primary font-semibold rounded-xl text-sm">
          Buscar factura
        </button>
        <button onClick={() => setShowServicio(false)} className="mt-2 w-full py-3 text-text-muted text-sm">
          Cancelar
        </button>
      </Modal>

      {/* QR Modal */}
      <Modal open={showQR} onClose={() => setShowQR(false)}>
        <h3 className="text-text-primary font-semibold mb-5 text-center">QR de recepción</h3>
        <div className="bg-white rounded-2xl p-4 mx-auto w-48 h-48 flex items-center justify-center">
          <p className="text-bg-primary text-xs text-center break-all font-mono leading-relaxed">{cuenta.sipap}</p>
        </div>
        <p className="text-text-muted text-xs text-center mt-3 font-mono">{cuenta.sipap}</p>
        <button
          onClick={() => { copyToClipboard(cuenta.sipap); setShowQR(false) }}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-teal text-bg-primary font-semibold rounded-xl text-sm"
        >
          <Icon name="copy" size={15} />
          Copiar SIPAP
        </button>
      </Modal>
    </div>
  )
}

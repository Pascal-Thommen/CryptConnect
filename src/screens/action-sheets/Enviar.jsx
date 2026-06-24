import React, { useState } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../components/Toast.jsx'
import { Modal } from '../../components/Modal.jsx'
import { Icon } from '../../components/Icons.jsx'
import { formatPYG, formatCrypto } from '../../utils/formatters.js'
import { calcSendFee } from '../../utils/feeCalculator.js'

const ASSETS = [
  { id: 'fiat', label: '₲ Guaraníes', symbol: 'PYG', icon: '₲' },
  { id: 'BTC', label: 'Bitcoin', symbol: 'BTC', icon: '₿' },
  { id: 'ETH', label: 'Ethereum', symbol: 'ETH', icon: 'Ξ' },
  { id: 'USDT', label: 'Tether', symbol: 'USDT', icon: '₮' },
]

export function Enviar({ onClose }) {
  const { t, cuenta, cryptoHoldings, livePrices, updateCuentaSaldo, updateCryptoAmount, addTransaction } = useApp()
  const { showToast } = useToast()
  const te = t.enviar

  const [asset, setAsset] = useState('fiat')
  const [destination, setDestination] = useState('interno')
  const [recipient, setRecipient] = useState('')
  const [rawAmount, setRawAmount] = useState('')
  const [step, setStep] = useState('form') // form | processing | success | error

  const getBalance = () => {
    if (asset === 'fiat') return cuenta.saldo
    const h = cryptoHoldings.find(h => h.symbol === asset)
    return h?.amount || 0
  }

  const amount = parseFloat(rawAmount) || 0
  const fee = calcSendFee(asset, destination, amount)
  const total = amount + fee

  const balanceDisplay = asset === 'fiat' ? formatPYG(getBalance()) : formatCrypto(getBalance(), asset)

  const handleConfirm = async () => {
    if (amount <= 0) { showToast(te.montoMinimo); return }
    if (total > getBalance()) { setStep('error'); return }

    setStep('processing')
    await new Promise(r => setTimeout(r, 2000))

    if (asset === 'fiat') {
      updateCuentaSaldo(-(total))
    } else {
      updateCryptoAmount(asset, -(total))
    }

    addTransaction({
      id: `tx-${Date.now()}`,
      tipo: 'enviado',
      asset: asset === 'fiat' ? 'fiat' : asset,
      monto: asset === 'fiat' ? -amount : -amount,
      descripcion: recipient || 'Transferencia',
      fecha: new Date().toISOString(),
      estado: 'completado',
      fee,
    })

    setStep('success')
  }

  const ref = `CC-2026-${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border-color">
        <button onClick={onClose} className="text-text-muted text-xl">←</button>
        <p className="text-text-primary font-semibold">{te.titulo}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Asset Selector */}
        <div>
          <p className="text-text-muted text-xs uppercase tracking-wider mb-2">{te.seleccionarActivo}</p>
          <select
            value={asset}
            onChange={e => setAsset(e.target.value)}
            className="w-full bg-bg-card border border-border-color rounded-xl px-4 py-3 text-text-primary text-sm"
          >
            {ASSETS.map(a => <option key={a.id} value={a.id}>{a.icon} {a.label}</option>)}
          </select>
        </div>

        {/* Recipient */}
        <div>
          <p className="text-text-muted text-xs uppercase tracking-wider mb-2">{te.destinatario}</p>
          <input
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
            placeholder={te.destinatarioPlaceholder}
            className="w-full bg-bg-card border border-border-color rounded-xl px-4 py-3 text-text-primary text-sm placeholder-text-muted"
          />
        </div>

        {/* Tipo */}
        <div>
          <p className="text-text-muted text-xs uppercase tracking-wider mb-2">{te.tipo}</p>
          <div className="flex gap-2">
            {['interno', 'externo'].map(d => (
              <button
                key={d}
                onClick={() => setDestination(d)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${destination === d ? 'bg-teal text-bg-primary' : 'bg-bg-card border border-border-color text-text-muted'}`}
              >
                {d === 'interno' ? te.interno : te.externo}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <p className="text-text-muted text-xs uppercase tracking-wider mb-2">{te.monto}</p>
          <input
            type="number"
            value={rawAmount}
            onChange={e => setRawAmount(e.target.value)}
            placeholder="0"
            className="w-full bg-bg-card border border-border-color rounded-xl px-4 py-3 text-text-primary text-lg tabular-nums placeholder-text-muted"
          />
          <p className="text-text-muted text-xs mt-1">{te.disponible}: {balanceDisplay}</p>
        </div>

        {/* Summary */}
        {amount > 0 && (
          <div className="bg-bg-elevated border border-border-color rounded-xl p-4 space-y-2">
            <p className="text-text-secondary text-sm font-medium mb-3">{te.resumen}</p>
            <Row label={te.montoEnviar} value={asset === 'fiat' ? formatPYG(amount) : `${amount} ${asset}`} />
            <Row label={`${te.comision} (${fee === 0 ? '0%' : '1%'})`} value={asset === 'fiat' ? formatPYG(fee) : `${fee.toFixed(8)} ${asset}`} />
            <Row label={te.totalDeducido} value={asset === 'fiat' ? formatPYG(total) : `${total.toFixed(8)} ${asset}`} highlight />
          </div>
        )}
      </div>

      <div className="px-5 py-4 border-t border-border-color">
        <button
          onClick={handleConfirm}
          disabled={step === 'processing'}
          className="w-full py-4 rounded-2xl font-semibold text-bg-primary transition-opacity disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #2EC4A9, #1A7A6E)' }}
        >
          {step === 'processing' ? te.procesando : te.confirmar}
        </button>
      </div>

      {/* Success Modal */}
      <Modal open={step === 'success'} onClose={onClose}>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-green/15 border border-green/30 flex items-center justify-center mx-auto mb-4">
            <Icon name="check" size={28} className="text-green" />
          </div>
          <h3 className="text-text-primary font-semibold text-lg mb-2">{te.exito}</h3>
          <p className="text-text-secondary text-sm">{te.enviaste} {asset === 'fiat' ? formatPYG(amount) : `${amount} ${asset}`} {te.a} {recipient || '—'}</p>
          <p className="text-text-muted text-xs mt-2">{te.referencia}: {ref}</p>
          <div className="flex gap-2 mt-6">
            <button className="flex-1 py-3 border border-border-color rounded-xl text-text-secondary text-sm">{te.compartirComprobante}</button>
            <button onClick={onClose} className="flex-1 py-3 bg-teal rounded-xl text-bg-primary font-semibold text-sm">{te.volver}</button>
          </div>
        </div>
      </Modal>

      {/* Error Modal */}
      <Modal open={step === 'error'} onClose={() => setStep('form')}>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-red/10 border border-red/20 flex items-center justify-center mx-auto mb-4">
            <Icon name="error" size={28} className="text-red" />
          </div>
          <h3 className="text-text-primary font-semibold text-lg mb-2">{te.fondosInsuficientes}</h3>
          <p className="text-text-secondary text-sm">{te.saldoDisponible}: {balanceDisplay}</p>
          <p className="text-text-secondary text-sm">{te.montoSolicitado}: {asset === 'fiat' ? formatPYG(total) : `${total.toFixed(8)} ${asset}`}</p>
          <button onClick={() => setStep('form')} className="mt-6 w-full py-3 bg-bg-card border border-border-color rounded-xl text-text-secondary text-sm">{te.volver}</button>
        </div>
      </Modal>
    </div>
  )
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-text-muted text-sm">{label}</span>
      <span className={`text-sm tabular-nums ${highlight ? 'text-teal font-semibold' : 'text-text-primary'}`}>{value}</span>
    </div>
  )
}

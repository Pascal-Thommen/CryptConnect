import React, { useState } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../components/Toast.jsx'
import { Modal } from '../../components/Modal.jsx'
import { formatPYG, formatCrypto } from '../../utils/formatters.js'
import { calcSwapFee } from '../../utils/feeCalculator.js'

const ASSETS = [
  { id: 'fiat', label: '₲ Guaraníes', symbol: 'PYG', icon: '₲' },
  { id: 'BTC', label: 'Bitcoin', symbol: 'BTC', icon: '₿' },
  { id: 'ETH', label: 'Ethereum', symbol: 'ETH', icon: 'Ξ' },
  { id: 'USDT', label: 'Tether', symbol: 'USDT', icon: '₮' },
]

export function Swap({ onClose }) {
  const { t, cuenta, cryptoHoldings, livePrices, updateCuentaSaldo, updateCryptoAmount, addTransaction } = useApp()
  const { showToast } = useToast()
  const ts = t.swapScreen

  const [from, setFrom] = useState('BTC')
  const [to, setTo] = useState('fiat')
  const [rawAmount, setRawAmount] = useState('')
  const [step, setStep] = useState('form')

  const amount = parseFloat(rawAmount) || 0

  const getPrice = (id) => {
    if (id === 'fiat') return 1
    const h = cryptoHoldings.find(h => h.symbol === id)
    if (!h) return 0
    return livePrices[h.coingeckoId]?.pyg || 0
  }

  const fromPricePYG = getPrice(from)
  const toPricePYG = getPrice(to)

  const amountInPYG = from === 'fiat' ? amount : amount * fromPricePYG
  const fee = calcSwapFee(from, to, amountInPYG)
  const receiveAmountPYG = amountInPYG - fee
  const receiveAmount = to === 'fiat' ? receiveAmountPYG : receiveAmountPYG / toPricePYG
  const isCryptoCrypto = from !== 'fiat' && to !== 'fiat'

  const getBalance = (asset) => {
    if (asset === 'fiat') return cuenta.saldo
    const h = cryptoHoldings.find(h => h.symbol === asset)
    return h?.amount || 0
  }

  const fromBalance = getBalance(from)

  const handleConfirm = async () => {
    if (amount <= 0) { showToast('Ingrese un monto válido'); return }
    const needed = from === 'fiat' ? amount : amount
    if (needed > fromBalance) { showToast('Fondos insuficientes'); return }

    setStep('processing')
    await new Promise(r => setTimeout(r, 2000))

    if (from === 'fiat') {
      updateCuentaSaldo(-amountInPYG)
    } else {
      updateCryptoAmount(from, -amount)
    }

    if (to === 'fiat') {
      updateCuentaSaldo(receiveAmountPYG)
    } else {
      updateCryptoAmount(to, receiveAmount)
    }

    addTransaction({
      id: `tx-${Date.now()}`,
      tipo: 'swap',
      asset: `${from}→${to}`,
      monto: to === 'fiat' ? receiveAmountPYG : receiveAmount,
      montoOrigen: amount,
      descripcion: `Swap ${from} → ${to}`,
      fecha: new Date().toISOString(),
      estado: 'completado',
      fee: isCryptoCrypto ? 0 : fee,
      gasFee: isCryptoCrypto ? 12500 : 0,
    })

    setStep('success')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border-color">
        <button onClick={onClose} className="text-text-muted text-xl">←</button>
        <p className="text-text-primary font-semibold">{ts.titulo}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* From */}
        <div>
          <p className="text-text-muted text-xs uppercase tracking-wider mb-2">{ts.de}</p>
          <div className="flex gap-2">
            <select
              value={from}
              onChange={e => setFrom(e.target.value)}
              className="flex-1 bg-bg-card border border-border-color rounded-xl px-4 py-3 text-text-primary text-sm"
            >
              {ASSETS.map(a => <option key={a.id} value={a.id}>{a.icon} {a.label}</option>)}
            </select>
            <input
              type="number"
              value={rawAmount}
              onChange={e => setRawAmount(e.target.value)}
              placeholder="0"
              className="w-32 bg-bg-card border border-border-color rounded-xl px-4 py-3 text-text-primary text-sm tabular-nums"
            />
          </div>
          <p className="text-text-muted text-xs mt-1">
            Disponible: {from === 'fiat' ? formatPYG(fromBalance) : formatCrypto(fromBalance, from)}
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => { setFrom(to); setTo(from) }}
            className="w-10 h-10 rounded-full bg-bg-card border border-border-color flex items-center justify-center text-teal"
          >
            ⇅
          </button>
        </div>

        {/* To */}
        <div>
          <p className="text-text-muted text-xs uppercase tracking-wider mb-2">{ts.a}</p>
          <select
            value={to}
            onChange={e => setTo(e.target.value)}
            className="w-full bg-bg-card border border-border-color rounded-xl px-4 py-3 text-text-primary text-sm"
          >
            {ASSETS.filter(a => a.id !== from).map(a => <option key={a.id} value={a.id}>{a.icon} {a.label}</option>)}
          </select>
        </div>

        {/* Exchange info */}
        {amount > 0 && (
          <div className="bg-bg-elevated border border-border-color rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">{ts.tipoCambio}</span>
              <span className="text-text-primary tabular-nums">1 {from} = {from === 'fiat' ? `${toPricePYG > 0 ? (1/toPricePYG).toFixed(8) : '—'} ${to}` : formatPYG(fromPricePYG)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">{ts.comision}</span>
              <span className="text-text-primary tabular-nums">
                {isCryptoCrypto ? ts.gasEstimado : `${formatPYG(fee)} (1%)`}
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-border-color/50 pt-3">
              <span className="text-text-secondary font-medium">{ts.recibiras}</span>
              <span className="text-teal font-semibold tabular-nums">
                {to === 'fiat' ? formatPYG(receiveAmount) : `${receiveAmount.toFixed(8)} ${to}`}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 py-4 border-t border-border-color">
        <button
          onClick={handleConfirm}
          disabled={step === 'processing'}
          className="w-full py-4 rounded-2xl font-semibold text-bg-primary disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #2EC4A9, #1A7A6E)' }}
        >
          {step === 'processing' ? ts.procesando : ts.confirmar}
        </button>
      </div>

      <Modal open={step === 'success'} onClose={onClose}>
        <div className="text-center">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-text-primary font-semibold text-lg mb-2">¡Swap Exitoso!</h3>
          <p className="text-text-secondary text-sm">
            {amount} {from} → {to === 'fiat' ? formatPYG(receiveAmount) : `${receiveAmount.toFixed(8)} ${to}`}
          </p>
          <button onClick={onClose} className="mt-6 w-full py-3 bg-teal rounded-xl text-bg-primary font-semibold text-sm">
            {t.enviar.volver}
          </button>
        </div>
      </Modal>
    </div>
  )
}

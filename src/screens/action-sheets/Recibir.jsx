import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../components/Toast.jsx'
import { Icon } from '../../components/Icons.jsx'

const ASSETS = [
  { id: 'fiat', label: '₲ Guaraníes', icon: '₲' },
  { id: 'BTC', label: 'Bitcoin', icon: '₿' },
  { id: 'ETH', label: 'Ethereum', icon: 'Ξ' },
  { id: 'USDT', label: 'Tether', icon: '₮' },
]

const ADDRESSES = {
  fiat: '000100123456780',
  BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfghhxxnj3qxfp0mn4amfhm2',
  ETH: '0x742d35Cc6634C0532925a3b8D4C9E4F7B2E5F6A3',
  USDT: '0x742d35Cc6634C0532925a3b8D4C9E4F7B2E5F6A3',
}

export function Recibir({ onClose }) {
  const { t, cuenta } = useApp()
  const { showToast } = useToast()
  const tr = t.recibir
  const [asset, setAsset] = useState('BTC')

  const address = ADDRESSES[asset]
  const qrValue = asset === 'fiat' ? `SIPAP:${cuenta.sipap}` : address

  const copy = () => {
    navigator.clipboard.writeText(address).catch(() => {})
    showToast(t.common.copiado)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border-color">
        <button onClick={onClose} className="text-text-muted text-xl">←</button>
        <p className="text-text-primary font-semibold">{tr.titulo}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        <div>
          <p className="text-text-muted text-xs uppercase tracking-wider mb-2">{tr.seleccionarActivo}</p>
          <select
            value={asset}
            onChange={e => setAsset(e.target.value)}
            className="w-full bg-bg-card border border-border-color rounded-xl px-4 py-3 text-text-primary text-sm"
          >
            {ASSETS.map(a => <option key={a.id} value={a.id}>{a.icon} {a.label}</option>)}
          </select>
        </div>

        <div className="flex flex-col items-center gap-4">
          <p className="text-text-secondary font-medium text-sm self-start">{tr.tuDireccion} {asset}</p>
          <div className="bg-white rounded-2xl p-4">
            <QRCodeSVG value={qrValue} size={180} />
          </div>
          <p className="text-text-muted text-xs font-mono text-center break-all px-2">{address}</p>
        </div>

        <div className="flex gap-3">
          <button onClick={copy} className="flex-1 flex items-center justify-center gap-2 py-3 bg-teal rounded-xl text-bg-primary font-semibold text-sm">
            <Icon name="copy" size={15} />
            {tr.copiar}
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-border-color rounded-xl text-text-secondary text-sm">
            <Icon name="share" size={15} />
            {tr.compartir}
          </button>
        </div>

        {asset !== 'fiat' && (
          <div className="bg-gold/10 border border-gold/20 rounded-xl p-4">
            <p className="text-gold text-xs">ℹ️ {tr.aviso} {asset} {tr.avisoSufijo}</p>
          </div>
        )}

        {asset === 'fiat' && (
          <div className="bg-bg-card border border-border-color rounded-2xl p-4 space-y-2">
            <p className="text-text-secondary text-sm font-medium mb-3">{tr.datosCuenta}</p>
            {[
              ['Titular', 'Ana García'],
              ['N° Cuenta', cuenta.numero],
              ['Entidad', cuenta.entidad],
              ['SIPAP', cuenta.sipap],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-text-muted">{k}</span>
                <span className="text-text-primary font-mono">{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

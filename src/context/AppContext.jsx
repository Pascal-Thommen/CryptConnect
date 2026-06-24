import React, { createContext, useContext, useState, useCallback } from 'react'
import { translations } from './i18n.js'

const AppContext = createContext(null)

const mockTransactions = [
  { id: 'tx-001', tipo: 'recibido', asset: 'fiat', monto: 2500000, descripcion: 'Freelancer - Juan Pérez', fecha: '2026-06-24T09:15:00', estado: 'completado', fee: 0 },
  { id: 'tx-002', tipo: 'pago', asset: 'fiat', monto: -185000, descripcion: 'Stock Supermercados', fecha: '2026-06-23T18:32:00', estado: 'completado', fee: 0 },
  { id: 'tx-003', tipo: 'swap', asset: 'BTC→fiat', monto: 5200000, montoOrigen: 0.0135, descripcion: 'Swap BTC → ₲', fecha: '2026-06-23T14:11:00', estado: 'completado', fee: 52000 },
  { id: 'tx-004', tipo: 'enviado', asset: 'fiat', monto: -3000000, descripcion: 'Alquiler Junio - Inmobiliaria Asunción', fecha: '2026-06-20T10:00:00', estado: 'completado', fee: 0 },
  { id: 'tx-005', tipo: 'recibido', asset: 'BTC', monto: 0.0042, descripcion: 'Pago cliente - Maria Fernández', fecha: '2026-06-19T16:45:00', estado: 'completado', fee: 0 },
  { id: 'tx-006', tipo: 'swap', asset: 'ETH→BTC', monto: 0.0028, montoOrigen: 0.05, descripcion: 'Swap ETH → BTC', fecha: '2026-06-18T11:22:00', estado: 'completado', fee: 0, gasFee: 12500 },
  { id: 'tx-007', tipo: 'pago', asset: 'fiat', monto: -45000, descripcion: 'ANDE - Energía Eléctrica', fecha: '2026-06-15T09:00:00', estado: 'completado', fee: 0 },
  { id: 'tx-008', tipo: 'compra-xstock', asset: 'AAPL', monto: -3215630, shares: 2.5, descripcion: 'Compra xStock AAPL', fecha: '2026-06-10T15:30:00', estado: 'completado', fee: 32156 },
  { id: 'tx-009', tipo: 'enviado', asset: 'ETH', monto: -0.05, descripcion: 'Externo - Wallet Binance', fecha: '2026-06-08T12:10:00', estado: 'completado', fee: 0.0005 },
  { id: 'tx-010', tipo: 'recibido', asset: 'USDT', monto: 950, descripcion: 'Pago freelance - Cliente EEUU', fecha: '2026-06-01T08:00:00', estado: 'completado', fee: 0 },
]

const initialXStockPrices = {
  AAPL: 213.50 * (1 + (Math.random() - 0.48) * 0.03),
  TSLA: 248.90 * (1 + (Math.random() - 0.48) * 0.03),
  AMZN: 201.20 * (1 + (Math.random() - 0.48) * 0.03),
  MSFT: 445.60 * (1 + (Math.random() - 0.48) * 0.03),
  NVDA: 128.30 * (1 + (Math.random() - 0.48) * 0.03),
}

export function AppProvider({ children }) {
  const [language, setLanguage] = useState('es')
  const t = translations[language]

  const [user] = useState({
    name: 'Ana García',
    email: 'ana.garcia@email.com',
    cedula: '4.567.890',
    ruc: '4567890-1',
    kycStatus: 'verified',
  })

  const [cuenta, setCuenta] = useState({
    numero: '0001-234567-8',
    sipap: '000100123456780',
    entidad: 'CriptConnect S.A.',
    rucEntidad: '80123456-7',
    saldo: 45250000,
    tarjetas: [
      { id: 'card-1', tipo: 'Visa Debit', fisica: true, numero: '4532 8821 4523 4821', vencimiento: '09/28', cvv: '847', activa: true },
      { id: 'card-2', tipo: 'Visa Virtual', fisica: false, numero: '4532 1109 8834 9302', vencimiento: '12/27', cvv: '312', activa: true },
    ],
    paymentPriority: [
      { id: 'prio-1', tipo: 'fiat', label: '₲ Guaraníes', icon: '₲' },
      { id: 'prio-2', tipo: 'crypto', symbol: 'BTC', label: 'Bitcoin', icon: '₿' },
      { id: 'prio-3', tipo: 'xstock', symbol: 'TSLA', label: 'Tesla xStock', icon: 'TSLA' },
    ],
  })

  const [cryptoHoldings, setCryptoHoldings] = useState([
    { symbol: 'BTC', name: 'Bitcoin', amount: 0.00842, coingeckoId: 'bitcoin' },
    { symbol: 'ETH', name: 'Ethereum', amount: 0.18230, coingeckoId: 'ethereum' },
    { symbol: 'USDT', name: 'Tether', amount: 950, coingeckoId: 'tether' },
  ])

  const [xstockHoldings] = useState([
    { symbol: 'AAPL', name: 'Apple Inc.', shares: 2.5, basePriceUSD: 213.50 },
    { symbol: 'TSLA', name: 'Tesla Inc.', shares: 1.2, basePriceUSD: 248.90 },
    { symbol: 'AMZN', name: 'Amazon.com', shares: 0.5, basePriceUSD: 201.20 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', shares: 0.8, basePriceUSD: 445.60 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', shares: 0.3, basePriceUSD: 128.30 },
  ])

  const [xstockPrices, setXstockPrices] = useState(initialXStockPrices)

  const [transactions, setTransactions] = useState(mockTransactions)

  const [livePrices, setLivePrices] = useState({
    bitcoin: { pyg: 385200000, pyg_24h_change: 3.2 },
    ethereum: { pyg: 48100000, pyg_24h_change: -0.8 },
    tether: { pyg: 7580, pyg_24h_change: 0.01 },
  })

  const addTransaction = useCallback((tx) => {
    setTransactions(prev => [tx, ...prev])
  }, [])

  const updateCuentaSaldo = useCallback((delta) => {
    setCuenta(prev => ({ ...prev, saldo: prev.saldo + delta }))
  }, [])

  const updateCryptoAmount = useCallback((symbol, delta) => {
    setCryptoHoldings(prev => prev.map(h => h.symbol === symbol ? { ...h, amount: h.amount + delta } : h))
  }, [])

  const setPriority = useCallback((newPriority) => {
    setCuenta(prev => ({ ...prev, paymentPriority: newPriority }))
  }, [])

  const usdToPyg = livePrices.tether?.pyg || 7580

  const cryptoTotalPYG = cryptoHoldings.reduce((sum, h) => {
    const price = livePrices[h.coingeckoId]?.pyg || 0
    return sum + h.amount * price
  }, 0)

  const xstockTotalPYG = xstockHoldings.reduce((sum, h) => {
    const price = xstockPrices[h.symbol] || h.basePriceUSD
    return sum + h.shares * price * usdToPyg
  }, 0)

  const patrimonioTotal = cuenta.saldo + cryptoTotalPYG + xstockTotalPYG

  const autoYieldAPY = 0.03
  const autoYieldStartDate = new Date('2026-01-01')

  return (
    <AppContext.Provider value={{
      language, setLanguage, t,
      user, cuenta, setCuenta,
      cryptoHoldings, xstockHoldings, xstockPrices, setXstockPrices,
      transactions, addTransaction,
      livePrices, setLivePrices,
      updateCuentaSaldo, updateCryptoAmount, setPriority,
      usdToPyg, cryptoTotalPYG, xstockTotalPYG, patrimonioTotal,
      autoYieldAPY, autoYieldStartDate,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AppProvider } from './context/AppContext.jsx'
import { ToastProvider } from './components/Toast.jsx'
import { BottomNav } from './components/BottomNav.jsx'
import { ActionSheet } from './components/ActionSheet.jsx'
import { Inicio } from './screens/Inicio.jsx'
import { Activos } from './screens/Activos.jsx'
import { Cuenta } from './screens/Cuenta.jsx'
import { Perfil } from './screens/Perfil.jsx'
import { Enviar } from './screens/action-sheets/Enviar.jsx'
import { Recibir } from './screens/action-sheets/Recibir.jsx'
import { Swap } from './screens/action-sheets/Swap.jsx'
import { useLivePrices } from './hooks/useLivePrices.js'

function AppInner() {
  useLivePrices()

  const [tab, setTab] = useState('inicio')
  const [actionSheetOpen, setActionSheetOpen] = useState(false)
  const [activeAction, setActiveAction] = useState(null)

  const handleActionSelect = (action) => {
    setActiveAction(action)
  }

  const closeAction = () => setActiveAction(null)

  const screens = {
    inicio: <Inicio onAction={a => { setActiveAction(a) }} />,
    activos: <Activos />,
    cuenta: <Cuenta onAction={a => setActiveAction(a)} />,
    perfil: <Perfil />,
  }

  return (
    <div className="min-h-screen bg-[#050e1a] flex items-center justify-center">
      {/* Desktop wrapper */}
      <div className="hidden md:flex flex-col items-center gap-4 mr-8">
        <img src="./logo-white.png" alt="CriptConnect" className="h-10 object-contain" onError={e => e.target.style.display='none'} />
        <p className="text-text-muted text-sm">Demo Inversores 2026</p>
        <p className="text-text-muted text-xs">Primera Billetera Cripto-Bancaria de Paraguay</p>
      </div>

      {/* App Frame */}
      <div
        className="relative flex flex-col bg-bg-primary overflow-hidden"
        style={{
          width: '100%',
          maxWidth: 430,
          height: '100dvh',
          boxShadow: '0 0 60px rgba(46,196,169,0.08), 0 0 0 1px rgba(30,58,90,0.5)',
        }}
      >
        {/* Screen Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            className="flex flex-1 flex-col overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {screens[tab]}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Nav */}
        <BottomNav
          activeTab={tab}
          onTabChange={setTab}
          onActionPress={() => setActionSheetOpen(true)}
        />

        {/* Action Sheet */}
        <ActionSheet
          open={actionSheetOpen}
          onClose={() => setActionSheetOpen(false)}
          onSelect={handleActionSelect}
        />

        {/* Sub-screens slide up */}
        <AnimatePresence>
          {activeAction && (
            <motion.div
              className="absolute inset-0 bg-bg-primary z-40 flex flex-col"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
              {activeAction === 'enviar' && <Enviar onClose={closeAction} />}
              {activeAction === 'recibir' && <Recibir onClose={closeAction} />}
              {activeAction === 'swap' && <Swap onClose={closeAction} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <AppInner />
      </ToastProvider>
    </AppProvider>
  )
}

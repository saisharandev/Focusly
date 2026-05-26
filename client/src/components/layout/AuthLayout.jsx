import { motion } from 'framer-motion'

function Blob({ color, style, delay, duration }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        background: color,
        filter: 'blur(80px)',
        opacity: 0.15,
        ...style,
      }}
      animate={{ y: [0, -30, 0], scale: [1, 1.05, 1] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  )
}

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4 relative overflow-hidden">
      <Blob color="#14B8A6" style={{ width: 500, height: 500, top: -100, left: -150 }} delay={0} duration={8} />
      <Blob color="#A855F7" style={{ width: 400, height: 400, bottom: -100, right: -100 }} delay={2} duration={6} />
      <Blob color="#F59E0B" style={{ width: 300, height: 300, top: '40%', right: '20%' }} delay={1} duration={10} />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            Focusly
          </h1>
          <p className="text-text-muted text-sm mt-1">Study smarter, together.</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/8 rounded-2xl p-8">
          {children}
        </div>
      </motion.div>
    </div>
  )
}

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ResponsiveContainer, LineChart, Line } from 'recharts'

export default function KPICard({ label, value, sub, trend, color, sparkData }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        padding: '16px 18px', borderRadius: 16,
        background: hovered ? 'var(--bg-card)' : 'var(--bg-sidebar)',
        border: '1px solid var(--border-light)',
        cursor: 'default', overflow: 'hidden', position: 'relative',
        transition: 'all 0.25s ease',
        boxShadow: hovered ? 'var(--shadow-sm)' : 'none',
      }}
      whileHover={{ y: -2 }}
    >
      <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.3 }}>{sub}</div>}
      {sparkData && hovered && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 8 }}>
          <ResponsiveContainer width="100%" height={36}>
            <LineChart data={sparkData}>
              <Line type="monotone" dataKey="v" stroke={color || 'var(--accent)'} strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </motion.div>
  )
}

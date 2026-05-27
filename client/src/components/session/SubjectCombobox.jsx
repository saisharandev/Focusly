import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import api from '../../lib/api'

export default function SubjectCombobox({ value, onChange }) {
  const [subjects, setSubjects] = useState([])
  const [query, setQuery] = useState(value || '')
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    api.get('/api/subjects').then(res => {
      setSubjects(res.data)
      if (!value && res.data.length > 0) {
        onChange(res.data[0].name)
        setQuery(res.data[0].name)
      }
    }).catch(() => {})
  }, [])

  // Sync query when value changes externally
  useEffect(() => { setQuery(value || '') }, [value])

  // Close on outside click
  useEffect(() => {
    function handle(e) {
      if (!containerRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const filtered = subjects.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase())
  )
  const exactMatch = subjects.some(s => s.name.toLowerCase() === query.toLowerCase())
  const selectedSubject = subjects.find(s => s.name.toLowerCase() === query.toLowerCase())

  function select(subject) {
    onChange(subject.name)
    setQuery(subject.name)
    setOpen(false)
  }

  async function createNew() {
    if (!query.trim()) return
    try {
      const res = await api.post('/api/subjects', { name: query.trim() })
      setSubjects(prev => [res.data, ...prev.filter(s => s._id !== res.data._id)])
      onChange(res.data.name)
      setQuery(res.data.name)
    } catch {}
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="text-sm font-medium text-text-secondary block mb-1.5">Subject</label>
      <div className="relative">
        {selectedSubject && (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: selectedSubject.color }}
          />
        )}
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="e.g. DBMS, Algorithms, Physics..."
          className={`w-full bg-bg-card border border-white/10 rounded-xl py-3 pr-10 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal transition-colors ${selectedSubject ? 'pl-8' : 'pl-4'}`}
        />
        <ChevronDown
          size={14}
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </div>

      {open && (
        <div className="absolute z-50 top-full mt-1 w-full bg-bg-surface border border-white/10 rounded-xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
          {filtered.length === 0 && !query && (
            <p className="px-4 py-3 text-xs text-text-muted">No subjects yet — type to create one</p>
          )}

          {filtered.map(subject => (
            <button
              key={subject._id}
              onMouseDown={() => select(subject)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-white/5 text-left transition-colors"
            >
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: subject.color }} />
              {subject.name}
            </button>
          ))}

          {query.trim() && !exactMatch && (
            <button
              onMouseDown={createNew}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-accent-teal hover:bg-accent-teal/10 text-left transition-colors border-t border-white/8"
            >
              <Plus size={14} />
              Create "{query.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  )
}

'use client'

// ================================================================
// MASR — /admin/codes-promo
// Gestion des codes promo affiliés influenceurs
// ================================================================

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Tag, Plus, ChevronLeft, TrendingUp, DollarSign,
  CheckCircle2, Clock, Users, Copy, ToggleLeft, ToggleRight,
  ChevronDown, ChevronUp, RefreshCw, X,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Types ──────────────────────────────────────────────────────

interface Utilisation {
  id:           string
  montantHT:    number
  commissionDue: number
  paye:         boolean
  createdAt:    string
  plan:         string
  user:         { prenom: string; email: string }
}

interface CodePromo {
  id:                 string
  code:               string
  influenceurNom:     string
  influenceurContact: string | null
  tauxCommission:     number
  tauxReduction:      number
  stripeCouponId:     string | null
  actif:              boolean
  createdAt:          string
  utilisations:       Utilisation[]
  stats: {
    totalUtilisations: number
    chiffreAffaires:   number
    commissionDue:     number
    commissionPayee:   number
  }
}

// ─── Formulaire création ─────────────────────────────────────────

function FormulaireCreation({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    code:               '',
    influenceurNom:     '',
    influenceurContact: '',
    tauxCommission:     20,
    tauxReduction:      20,
    stripeCouponId:     '',
  })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/admin/codes-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          code: form.code.toUpperCase().trim(),
          influenceurContact: form.influenceurContact || undefined,
          stripeCouponId:     form.stripeCouponId || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur création')
      toast.success(`Code ${data.codePromo.code} créé !`)
      onSuccess()
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0d0a1f] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <Tag size={18} className="text-violet-400" />
            Nouveau code promo
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Code */}
          <div>
            <label className="text-white/60 text-xs uppercase tracking-wide block mb-1">Code *</label>
            <input
              type="text"
              required
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="MARIAM20"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 text-sm font-mono tracking-widest"
            />
            <p className="text-white/30 text-xs mt-1">Doit correspondre exactement au coupon créé dans Stripe</p>
          </div>

          {/* Influenceur */}
          <div>
            <label className="text-white/60 text-xs uppercase tracking-wide block mb-1">Nom influenceur *</label>
            <input
              type="text"
              required
              value={form.influenceurNom}
              onChange={e => setForm(f => ({ ...f, influenceurNom: e.target.value }))}
              placeholder="Mariam Al-Rashid"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 text-sm"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="text-white/60 text-xs uppercase tracking-wide block mb-1">Contact (optionnel)</label>
            <input
              type="text"
              value={form.influenceurContact}
              onChange={e => setForm(f => ({ ...f, influenceurContact: e.target.value }))}
              placeholder="@pseudo_tiktok ou email"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 text-sm"
            />
          </div>

          {/* Taux */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/60 text-xs uppercase tracking-wide block mb-1">Commission %</label>
              <input
                type="number"
                min={0} max={100} step={1}
                value={form.tauxCommission}
                onChange={e => setForm(f => ({ ...f, tauxCommission: Number(e.target.value) }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500/50 text-sm"
              />
            </div>
            <div>
              <label className="text-white/60 text-xs uppercase tracking-wide block mb-1">Réduction % (user)</label>
              <input
                type="number"
                min={0} max={100} step={1}
                value={form.tauxReduction}
                onChange={e => setForm(f => ({ ...f, tauxReduction: Number(e.target.value) }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500/50 text-sm"
              />
            </div>
          </div>

          {/* Stripe coupon ID */}
          <div>
            <label className="text-white/60 text-xs uppercase tracking-wide block mb-1">Stripe Coupon ID (optionnel)</label>
            <input
              type="text"
              value={form.stripeCouponId}
              onChange={e => setForm(f => ({ ...f, stripeCouponId: e.target.value }))}
              placeholder="ex: promo_xxxxxxxxxx"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 text-sm font-mono"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl py-2.5 text-sm font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl py-2.5 text-sm font-semibold transition-all disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer le code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Ligne code promo ────────────────────────────────────────────

function LigneCode({ code, onPayer, onRefresh }: {
  code: CodePromo
  onPayer: (id: string) => Promise<void>
  onRefresh: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [paying, setPaying]     = useState(false)

  async function handlePayer() {
    setPaying(true)
    await onPayer(code.id)
    setPaying(false)
  }

  const dateCreation = new Date(code.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div className={`bg-[#0d0a1f] border rounded-2xl overflow-hidden transition-all ${code.actif ? 'border-white/8' : 'border-white/4 opacity-60'}`}>
      {/* Header ligne */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/3 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Code badge */}
        <div className="flex items-center gap-2 min-w-[130px]">
          <div className={`px-3 py-1 rounded-lg font-mono font-bold text-sm tracking-widest ${code.actif ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-white/5 text-white/40 border border-white/10'}`}>
            {code.code}
          </div>
        </div>

        {/* Influenceur */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{code.influenceurNom}</p>
          {code.influenceurContact && (
            <p className="text-white/40 text-xs truncate">{code.influenceurContact}</p>
          )}
          <p className="text-white/30 text-xs">{dateCreation}</p>
        </div>

        {/* Stats rapides */}
        <div className="hidden sm:flex items-center gap-5 text-right">
          <div>
            <p className="text-white/40 text-xs">Utilisations</p>
            <p className="text-white font-bold text-lg">{code.stats.totalUtilisations}</p>
          </div>
          <div>
            <p className="text-white/40 text-xs">CA généré</p>
            <p className="text-emerald-400 font-bold text-lg">{code.stats.chiffreAffaires.toFixed(2)} €</p>
          </div>
          <div>
            <p className="text-white/40 text-xs">Commission due</p>
            <p className={`font-bold text-lg ${code.stats.commissionDue > 0 ? 'text-amber-400' : 'text-white/30'}`}>
              {code.stats.commissionDue.toFixed(2)} €
            </p>
          </div>
          <div>
            <p className="text-white/40 text-xs">Payé total</p>
            <p className="text-violet-400 font-bold text-lg">{code.stats.commissionPayee.toFixed(2)} €</p>
          </div>
        </div>

        {/* Taux + expand */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex gap-2">
            <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              -{code.tauxReduction}% user
            </span>
            <span className="text-xs bg-violet-500/15 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-full">
              +{code.tauxCommission}% comm.
            </span>
          </div>
          {expanded ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
        </div>
      </div>

      {/* Détail déroulé */}
      {expanded && (
        <div className="border-t border-white/5 p-4 space-y-4">
          {/* Stats mobile */}
          <div className="grid grid-cols-2 sm:hidden gap-3">
            <StatBox label="Utilisations" valeur={code.stats.totalUtilisations.toString()} color="text-white" />
            <StatBox label="CA généré" valeur={`${code.stats.chiffreAffaires.toFixed(2)} €`} color="text-emerald-400" />
            <StatBox label="Commission due" valeur={`${code.stats.commissionDue.toFixed(2)} €`} color="text-amber-400" />
            <StatBox label="Commission payée" valeur={`${code.stats.commissionPayee.toFixed(2)} €`} color="text-violet-400" />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { navigator.clipboard.writeText(code.code); toast.success('Code copié !') }}
              className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 text-white/60 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              <Copy size={12} /> Copier le code
            </button>

            {code.stats.commissionDue > 0 && (
              <button
                onClick={handlePayer}
                disabled={paying}
                className="flex items-center gap-1.5 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                <CheckCircle2 size={12} />
                {paying ? 'En cours...' : `Marquer payé (${code.stats.commissionDue.toFixed(2)} €)`}
              </button>
            )}
          </div>

          {/* Historique utilisations */}
          {code.utilisations.length > 0 ? (
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wide mb-2">Historique des utilisations</p>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {code.utilisations.map(u => (
                  <div key={u.id} className="flex items-center justify-between bg-white/3 rounded-xl px-3 py-2">
                    <div>
                      <p className="text-white/80 text-xs font-medium">{u.user.prenom}</p>
                      <p className="text-white/30 text-xs">{u.user.email}</p>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <p className="text-white/30 text-xs">Plan</p>
                        <p className="text-white/70 text-xs font-medium">{u.plan}</p>
                      </div>
                      <div>
                        <p className="text-white/30 text-xs">Montant</p>
                        <p className="text-emerald-400 text-xs font-bold">{u.montantHT.toFixed(2)} €</p>
                      </div>
                      <div>
                        <p className="text-white/30 text-xs">Commission</p>
                        <p className="text-amber-400 text-xs font-bold">{u.commissionDue.toFixed(2)} €</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${u.paye ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {u.paye ? 'Payé' : 'En attente'}
                      </span>
                      <p className="text-white/30 text-xs">
                        {new Date(u.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-white/30 text-sm text-center py-3">Aucune utilisation pour l&apos;instant</p>
          )}
        </div>
      )}
    </div>
  )
}

function StatBox({ label, valeur, color }: { label: string; valeur: string; color: string }) {
  return (
    <div className="bg-white/3 rounded-xl p-3 text-center">
      <p className="text-white/40 text-xs">{label}</p>
      <p className={`font-bold text-lg ${color}`}>{valeur}</p>
    </div>
  )
}

// ─── Page principale ─────────────────────────────────────────────

export default function CodesPromoAdminPage() {
  const router = useRouter()
  const [codes, setCodes]         = useState<CodePromo[]>([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)

  async function fetchCodes() {
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/codes-promo')
      const data = await res.json()
      if (data.codes) setCodes(data.codes)
    } catch {
      toast.error('Erreur chargement des codes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCodes() }, [])

  async function handlePayer(codeId: string) {
    try {
      const res  = await fetch(`/api/admin/codes-promo/${codeId}/payer`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`${data.marqueesPayees} commission(s) marquée(s) comme payée(s)`)
      await fetchCodes()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
    }
  }

  // KPIs globaux
  const totalCA          = codes.reduce((s, c) => s + c.stats.chiffreAffaires, 0)
  const totalDue         = codes.reduce((s, c) => s + c.stats.commissionDue, 0)
  const totalPayee       = codes.reduce((s, c) => s + c.stats.commissionPayee, 0)
  const totalUtilisations = codes.reduce((s, c) => s + c.stats.totalUtilisations, 0)

  return (
    <div className="min-h-screen bg-[#07050f] text-white p-4 md:p-8">
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:none } }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-8" style={{ animation: 'fadeInUp 0.3s ease both' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Tag size={22} className="text-violet-400" />
              Codes Promo Affiliés
            </h1>
            <p className="text-white/40 text-sm">Suivi commissions influenceurs</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCodes}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg"
          >
            <Plus size={16} />
            Nouveau code
          </button>
        </div>
      </div>

      {/* KPIs globaux */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" style={{ animation: 'fadeInUp 0.35s ease both' }}>
        <KPIGlobal
          icon={Users}
          titre="Total utilisations"
          valeur={totalUtilisations.toString()}
          gradient="from-violet-500 to-purple-600"
        />
        <KPIGlobal
          icon={TrendingUp}
          titre="CA via codes"
          valeur={`${totalCA.toFixed(2)} €`}
          gradient="from-emerald-500 to-teal-500"
        />
        <KPIGlobal
          icon={Clock}
          titre="Commissions dues"
          valeur={`${totalDue.toFixed(2)} €`}
          gradient="from-amber-400 to-yellow-500"
        />
        <KPIGlobal
          icon={DollarSign}
          titre="Commissions payées"
          valeur={`${totalPayee.toFixed(2)} €`}
          gradient="from-pink-500 to-rose-500"
        />
      </div>

      {/* Liste des codes */}
      <div style={{ animation: 'fadeInUp 0.4s ease both' }}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={24} className="animate-spin text-violet-400" />
          </div>
        ) : codes.length === 0 ? (
          <div className="text-center py-20">
            <Tag size={48} className="text-white/20 mx-auto mb-4" />
            <p className="text-white/40 text-lg font-medium">Aucun code promo créé</p>
            <p className="text-white/25 text-sm mt-1">Crée le premier code pour un influenceur</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold"
            >
              Créer un code
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/40 text-sm">{codes.length} code{codes.length > 1 ? 's' : ''} au total</p>
              <div className="flex gap-2 text-xs">
                <span className="bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full">
                  {codes.filter(c => c.actif).length} actif{codes.filter(c => c.actif).length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
            {codes.map((code, i) => (
              <div key={code.id} style={{ animation: `fadeInUp ${0.1 + i * 0.05}s ease both` }}>
                <LigneCode code={code} onPayer={handlePayer} onRefresh={fetchCodes} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulaire modale */}
      {showForm && (
        <FormulaireCreation
          onClose={() => setShowForm(false)}
          onSuccess={fetchCodes}
        />
      )}
    </div>
  )
}

function KPIGlobal({ icon: Icon, titre, valeur, gradient }: {
  icon: React.ElementType
  titre: string
  valeur: string
  gradient: string
}) {
  return (
    <div className="relative overflow-hidden bg-[#0d0a1f] border border-white/8 rounded-2xl p-4 shadow-lg">
      <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-2xl`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-white/50 text-xs uppercase tracking-wide">{titre}</p>
          <p className="text-2xl font-bold text-white mt-1">{valeur}</p>
        </div>
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-md`}>
          <Icon size={16} className="text-white" />
        </div>
      </div>
    </div>
  )
}

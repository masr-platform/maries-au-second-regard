'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft, ChevronRight, Video, Star, Clock,
  CheckCircle2, Loader2, Shield, Users, Calendar,
  ChevronDown, User,
} from 'lucide-react'
import {
  format, addDays, startOfDay, isBefore, isToday,
  isSameDay, getDay, addMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameMonth,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────
interface Praticien {
  id:             string
  type:           string
  nom:            string
  prenom:         string
  bio:            string
  photo:          string | null
  specialites:    string[]
  languesParlees: string[]
  noteAverage:    number
  nombreSessions: number
  tarif:          number
  disponibilites: Record<string, string[]>
}

interface Creneau {
  heure:      string
  iso:        string
  disponible: boolean
}

type Step = 'praticien' | 'date' | 'heure' | 'confirmation'

const JOURS_FR: Record<number, string> = {
  0: 'dimanche', 1: 'lundi', 2: 'mardi',
  3: 'mercredi', 4: 'jeudi', 5: 'vendredi', 6: 'samedi',
}

const DUREES = [
  { value: 30,  label: '30 min' },
  { value: 45,  label: '45 min' },
  { value: 60,  label: '1h',    recommended: true },
  { value: 90,  label: '1h30' },
]

const TYPE_SESSION_LABEL: Record<string, string> = {
  MOUQUABALA:      'Mouqabala virtuelle',
  THERAPIE_COUPLE: 'Thérapie de couple',
  INDIVIDUEL:      'Session individuelle',
  SPIRITUEL:       'Accompagnement spirituel',
}

// ─── Étape indicateur ─────────────────────────────────────────────
function StepIndicator({ current }: { current: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'praticien',    label: 'Superviseur' },
    { key: 'date',         label: 'Date' },
    { key: 'heure',        label: 'Heure' },
    { key: 'confirmation', label: 'Confirmation' },
  ]
  const idx = steps.findIndex(s => s.key === current)

  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              i < idx  ? 'bg-gold-500 text-black' :
              i === idx ? 'bg-gold-500/20 border-2 border-gold-500 text-gold-400' :
              'bg-dark-700 text-dark-500'
            }`}>
              {i < idx ? <CheckCircle2 size={16} /> : i + 1}
            </div>
            <span className={`text-[10px] mt-1 font-medium ${
              i <= idx ? 'text-gold-400' : 'text-dark-600'
            }`}>{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-10 h-0.5 mx-1 mb-4 transition-all ${i < idx ? 'bg-gold-500' : 'bg-dark-700'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Étoiles ──────────────────────────────────────────────────────
function Stars({ note }: { note: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          size={12}
          className={i <= Math.round(note) ? 'text-gold-400 fill-gold-400' : 'text-dark-600'}
        />
      ))}
    </div>
  )
}

// ─── Calendrier ───────────────────────────────────────────────────
function CalendrierMois({
  mois,
  onNavigate,
  onSelectDay,
  selectedDate,
  availableDays,
}: {
  mois: Date
  onNavigate: (dir: -1 | 1) => void
  onSelectDay: (d: Date) => void
  selectedDate: Date | null
  availableDays: Set<number> // getDay() values that have availability
}) {
  const debut  = startOfMonth(mois)
  const fin    = endOfMonth(mois)
  const jours  = eachDayOfInterval({ start: debut, end: fin })
  const today  = startOfDay(new Date())

  // Aligner le premier jour (lundi = 0)
  const premierJour = (getDay(debut) + 6) % 7 // ISO: 0=lun
  const vides = Array(premierJour).fill(null)

  return (
    <div>
      {/* Header navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onNavigate(-1)}
          disabled={isBefore(endOfMonth(mois), today)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-dark-700 transition-colors text-dark-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-white font-semibold capitalize">
          {format(mois, 'MMMM yyyy', { locale: fr })}
        </span>
        <button
          onClick={() => onNavigate(1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-dark-700 transition-colors text-dark-400 hover:text-white"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 mb-2">
        {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(j => (
          <div key={j} className="text-center text-[10px] text-dark-500 font-semibold py-1">{j}</div>
        ))}
      </div>

      {/* Cases du calendrier */}
      <div className="grid grid-cols-7 gap-1">
        {vides.map((_, i) => <div key={`v${i}`} />)}
        {jours.map(jour => {
          const isPast     = isBefore(startOfDay(jour), today)
          const isSelected = selectedDate ? isSameDay(jour, selectedDate) : false
          const jourSemaine = getDay(jour) // 0=dim
          const hasSlots   = availableDays.has(jourSemaine) && !isPast && isSameMonth(jour, mois)

          return (
            <button
              key={jour.toISOString()}
              onClick={() => hasSlots && onSelectDay(jour)}
              disabled={!hasSlots}
              className={`
                aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all
                ${isSelected
                  ? 'bg-gold-500 text-black font-bold scale-105 shadow-lg shadow-gold-500/30'
                  : hasSlots
                    ? 'hover:bg-gold-500/15 text-white hover:text-gold-400 cursor-pointer'
                    : 'text-dark-700 cursor-not-allowed'
                }
                ${isToday(jour) && !isSelected ? 'border border-gold-500/40 text-gold-400' : ''}
              `}
            >
              {format(jour, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═══════════════════════════════════════════════════════════════════
export default function ReserverMouqabalaPage() {
  const { data: authSession, status } = useSession()
  const router   = useRouter()
  const params   = useParams()
  const matchId  = params.matchId as string

  // ── State global ──────────────────────────────────────────────
  const [step, setStep]               = useState<Step>('praticien')
  const [praticiens, setPraticiens]   = useState<Praticien[]>([])
  const [selected, setSelected]       = useState<Praticien | null>(null)
  const [moisCalendrier, setMois]     = useState(new Date())
  const [selectedDate, setDate]       = useState<Date | null>(null)
  const [creneaux, setCreneaux]       = useState<Creneau[]>([])
  const [selectedHeure, setHeure]     = useState<Creneau | null>(null)
  const [duree, setDuree]             = useState(60)
  const [typeSession, setType]        = useState<string>('MOUQUABALA')
  const [loadingCreneaux, setLoadCr]  = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const [loadingPratic, setLoadPratic]= useState(true)

  // ── Auth guard ────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/connexion')
  }, [status, router])

  // ── Chargement des praticiens ─────────────────────────────────
  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/praticiens')
      .then(r => r.ok ? r.json() : { praticiens: [] })
      .then(data => setPraticiens(data.praticiens ?? []))
      .catch(() => toast.error('Erreur chargement praticiens'))
      .finally(() => setLoadPratic(false))
  }, [status])

  // ── Chargement des créneaux quand une date est choisie ────────
  const chargerCreneaux = useCallback(async (praticienId: string, date: Date) => {
    setLoadCr(true)
    setHeure(null)
    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const res = await fetch(`/api/praticiens/${praticienId}/creneaux?date=${dateStr}`)
      const data = await res.json()
      setCreneaux(data.creneaux ?? [])
      if ((data.creneaux ?? []).length === 0) {
        toast('Aucun créneau disponible ce jour — essayez une autre date', { icon: '📅' })
      }
    } catch {
      toast.error('Erreur chargement créneaux')
    } finally {
      setLoadCr(false)
    }
  }, [])

  useEffect(() => {
    if (selected && selectedDate) {
      chargerCreneaux(selected.id, selectedDate)
    }
  }, [selected, selectedDate, chargerCreneaux])

  // ── Jours disponibles pour le praticien sélectionné ──────────
  const availableDayNumbers = (): Set<number> => {
    if (!selected) return new Set()
    const JOURS_TO_NUM: Record<string, number> = {
      dimanche: 0, lundi: 1, mardi: 2, mercredi: 3,
      jeudi: 4, vendredi: 5, samedi: 6,
    }
    return new Set(
      Object.keys(selected.disponibilites)
        .filter(j => (selected.disponibilites[j] ?? []).length > 0)
        .map(j => JOURS_TO_NUM[j])
        .filter(n => n !== undefined)
    )
  }

  // ── Confirmer la réservation ──────────────────────────────────
  const confirmer = async () => {
    if (!selected || !selectedHeure) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/sessions', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imamId:      selected.id,
          matchId,
          type:        typeSession,
          scheduledAt: selectedHeure.iso,
          dureeMinutes: duree,
          montant:     selected.tarif,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Erreur lors de la réservation')
        return
      }

      toast.success('Mouqabala planifiée avec succès !')
      router.push('/sessions')
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading' || loadingPratic) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Loader2 size={32} className="text-gold-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 px-4 py-10">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/tableau-de-bord"
            className="flex items-center gap-1.5 text-dark-400 hover:text-white text-sm transition-colors">
            <ChevronLeft size={16} />
            Retour
          </Link>
          <div>
            <h1 className="text-xl font-serif font-bold text-white">Planifier une mouqabala</h1>
            <p className="text-dark-400 text-xs">Session encadrée par un imam ou psychologue clinicien</p>
          </div>
        </div>

        {/* Étapes */}
        <StepIndicator current={step} />

        {/* ══════════════════════════════════════════════════════
            ÉTAPE 1 — Choisir le superviseur
        ══════════════════════════════════════════════════════ */}
        {step === 'praticien' && (
          <div style={{ animation: 'fadeInUp 0.3s ease both' }}>
            <h2 className="text-white font-semibold mb-1">Choisissez votre superviseur</h2>
            <p className="text-dark-400 text-sm mb-6">
              Imam ou psychologue clinicien — il encadre la session et garantit le cadre islamique.
            </p>

            {/* Type de session */}
            <div className="mb-5">
              <label className="text-dark-300 text-xs font-semibold uppercase tracking-wider mb-2 block">
                Type de session
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(TYPE_SESSION_LABEL).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setType(key)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-all text-left ${
                      typeSession === key
                        ? 'border-gold-500/60 bg-gold-500/10 text-gold-400'
                        : 'border-dark-600 text-dark-400 hover:border-dark-500 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {praticiens.length === 0 ? (
              <div className="text-center py-16 text-dark-500">
                <User size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">Aucun praticien disponible pour le moment</p>
                <p className="text-xs mt-1">Notre équipe ajoute régulièrement de nouveaux superviseurs</p>
              </div>
            ) : (
              <div className="space-y-3">
                {praticiens.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => { setSelected(p); setStep('date') }}
                    style={{ animation: `fadeInUp 0.3s ease ${i * 0.05}s both` }}
                    className={`w-full text-left p-5 rounded-2xl border transition-all hover:border-gold-500/40 hover:shadow-lg hover:shadow-gold-500/5 ${
                      selected?.id === p.id
                        ? 'border-gold-500/60 bg-gold-500/5'
                        : 'border-dark-700 bg-dark-800 hover:bg-dark-750'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-600/30 to-gold-800/20 flex items-center justify-center flex-shrink-0 border border-gold-500/20">
                        {p.photo ? (
                          <img src={p.photo} alt={p.prenom} className="w-full h-full rounded-2xl object-cover" />
                        ) : (
                          <span className="text-gold-400 text-xl font-serif font-bold">{p.prenom[0]}</span>
                        )}
                      </div>

                      {/* Infos */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-white font-semibold text-sm">
                              {p.type === 'IMAM' ? 'Imam' : 'Dr.'} {p.prenom} {p.nom}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Stars note={p.noteAverage} />
                              <span className="text-dark-500 text-xs">
                                {p.noteAverage > 0 ? p.noteAverage.toFixed(1) : '—'} · {p.nombreSessions} sessions
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-gold-400 font-bold text-sm">{p.tarif > 0 ? `${p.tarif}€` : 'Inclus'}</p>
                            <p className="text-dark-500 text-[10px]">/ session</p>
                          </div>
                        </div>

                        <p className="text-dark-400 text-xs mt-2 line-clamp-2 leading-relaxed">{p.bio}</p>

                        {p.specialites.length > 0 && (
                          <div className="flex gap-1.5 mt-2 flex-wrap">
                            {p.specialites.slice(0, 3).map(s => (
                              <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-dark-700 text-dark-300">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            ÉTAPE 2 — Choisir la date
        ══════════════════════════════════════════════════════ */}
        {step === 'date' && selected && (
          <div style={{ animation: 'fadeInUp 0.3s ease both' }}>
            {/* Récapitulatif praticien */}
            <div className="flex items-center gap-3 p-4 bg-dark-800 border border-dark-700 rounded-2xl mb-6">
              <div className="w-10 h-10 rounded-xl bg-gold-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-gold-400 font-serif font-bold">{selected.prenom[0]}</span>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-semibold">
                  {selected.type === 'IMAM' ? 'Imam' : 'Dr.'} {selected.prenom} {selected.nom}
                </p>
                <p className="text-dark-400 text-xs">{TYPE_SESSION_LABEL[typeSession]}</p>
              </div>
              <button
                onClick={() => { setSelected(null); setDate(null); setStep('praticien') }}
                className="text-dark-500 hover:text-white text-xs transition-colors"
              >
                Changer
              </button>
            </div>

            <h2 className="text-white font-semibold mb-1">Choisissez une date</h2>
            <p className="text-dark-400 text-sm mb-6">
              Les jours en surbrillance sont les jours de disponibilité du superviseur.
            </p>

            {/* Durée */}
            <div className="mb-6">
              <label className="text-dark-300 text-xs font-semibold uppercase tracking-wider mb-2 block">
                Durée souhaitée
              </label>
              <div className="flex gap-2">
                {DUREES.map(d => (
                  <button
                    key={d.value}
                    onClick={() => setDuree(d.value)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all relative ${
                      duree === d.value
                        ? 'border-gold-500/60 bg-gold-500/10 text-gold-400'
                        : 'border-dark-600 text-dark-400 hover:border-dark-500 hover:text-white'
                    }`}
                  >
                    {d.label}
                    {d.recommended && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] bg-gold-500 text-black px-1.5 py-0.5 rounded-full font-bold">
                        Conseillé
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendrier */}
            <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5">
              <CalendrierMois
                mois={moisCalendrier}
                onNavigate={dir => setMois(m => addMonths(m, dir))}
                onSelectDay={d => { setDate(d); setStep('heure') }}
                selectedDate={selectedDate}
                availableDays={availableDayNumbers()}
              />
            </div>

            {/* Info disponibilités */}
            <div className="mt-4 p-3 rounded-xl bg-dark-800 border border-dark-700">
              <p className="text-dark-400 text-xs">
                <span className="text-white font-medium">{selected.type === 'IMAM' ? 'Imam' : 'Dr.'} {selected.prenom}</span>
                {' '}est disponible les{' '}
                <span className="text-gold-400">
                  {Object.entries(selected.disponibilites)
                    .filter(([, slots]) => slots.length > 0)
                    .map(([jour]) => jour)
                    .join(', ')}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            ÉTAPE 3 — Choisir l'heure
        ══════════════════════════════════════════════════════ */}
        {step === 'heure' && selected && selectedDate && (
          <div style={{ animation: 'fadeInUp 0.3s ease both' }}>
            {/* Recap */}
            <div className="flex items-center gap-3 p-4 bg-dark-800 border border-dark-700 rounded-2xl mb-6">
              <Calendar size={18} className="text-gold-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-white text-sm font-semibold capitalize">
                  {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                </p>
                <p className="text-dark-400 text-xs">
                  avec {selected.type === 'IMAM' ? 'Imam' : 'Dr.'} {selected.prenom} {selected.nom}
                </p>
              </div>
              <button
                onClick={() => { setHeure(null); setStep('date') }}
                className="text-dark-500 hover:text-white text-xs transition-colors"
              >
                Changer
              </button>
            </div>

            <h2 className="text-white font-semibold mb-1">Choisissez un horaire</h2>
            <p className="text-dark-400 text-sm mb-6">Créneaux disponibles pour cette journée.</p>

            {loadingCreneaux ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="text-gold-500 animate-spin" />
              </div>
            ) : creneaux.length === 0 ? (
              <div className="text-center py-12 text-dark-500">
                <Clock size={28} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm text-dark-400">Aucun créneau disponible ce jour</p>
                <button
                  onClick={() => { setCreneaux([]); setStep('date') }}
                  className="mt-4 text-gold-400 text-sm hover:underline"
                >
                  Choisir une autre date
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {creneaux.map((c, i) => (
                  <button
                    key={c.iso}
                    onClick={() => { setHeure(c); setStep('confirmation') }}
                    style={{ animation: `fadeInUp 0.2s ease ${i * 0.03}s both` }}
                    className={`py-3 rounded-xl border text-sm font-semibold transition-all hover:scale-[1.02] ${
                      selectedHeure?.iso === c.iso
                        ? 'border-gold-500 bg-gold-500/15 text-gold-400 shadow-lg shadow-gold-500/20'
                        : 'border-dark-600 bg-dark-800 text-white hover:border-gold-500/50 hover:text-gold-400'
                    }`}
                  >
                    {c.heure}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            ÉTAPE 4 — Confirmation
        ══════════════════════════════════════════════════════ */}
        {step === 'confirmation' && selected && selectedDate && selectedHeure && (
          <div style={{ animation: 'fadeInUp 0.3s ease both' }}>
            <h2 className="text-white font-semibold mb-1">Confirmer la réservation</h2>
            <p className="text-dark-400 text-sm mb-6">Vérifiez les informations avant de confirmer.</p>

            {/* Récapitulatif complet */}
            <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden mb-6">
              {/* En-tête dorée */}
              <div className="bg-gradient-to-r from-gold-900/40 to-gold-800/20 border-b border-gold-500/20 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gold-500/20 flex items-center justify-center border border-gold-500/30">
                    <Video size={20} className="text-gold-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold">{TYPE_SESSION_LABEL[typeSession]}</p>
                    <p className="text-gold-400 text-xs font-medium">Mouqabala encadrée · MASR</p>
                  </div>
                </div>
              </div>

              {/* Détails */}
              <div className="p-5 space-y-4">
                {[
                  {
                    icon: Calendar,
                    label: 'Date & heure',
                    value: format(selectedDate, "EEEE d MMMM yyyy 'à'", { locale: fr }) + ' ' + selectedHeure.heure,
                  },
                  {
                    icon: Clock,
                    label: 'Durée',
                    value: `${duree} minutes`,
                  },
                  {
                    icon: User,
                    label: 'Superviseur',
                    value: `${selected.type === 'IMAM' ? 'Imam' : 'Dr.'} ${selected.prenom} ${selected.nom}`,
                  },
                  {
                    icon: Users,
                    label: 'Participants',
                    value: 'Vous, votre match et le superviseur',
                  },
                  {
                    icon: Shield,
                    label: 'Cadre',
                    value: 'Islamique · Supervisé · Confidentiel',
                  },
                ].map((row, i) => {
                  const Icon = row.icon
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <Icon size={15} className="text-gold-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-dark-500 text-xs">{row.label}</p>
                        <p className="text-white text-sm capitalize">{row.value}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Tarif */}
              {selected.tarif > 0 && (
                <div className="px-5 py-4 border-t border-dark-700 flex items-center justify-between">
                  <span className="text-dark-400 text-sm">Montant</span>
                  <span className="text-white font-bold text-lg">{selected.tarif}€</span>
                </div>
              )}
            </div>

            {/* Mentions islamiques */}
            <div className="mb-6 p-4 rounded-xl bg-dark-800 border border-dark-700 flex gap-3">
              <Shield size={16} className="text-gold-500 flex-shrink-0 mt-0.5" />
              <p className="text-dark-400 text-xs leading-relaxed">
                Cette session se déroule dans un cadre islamique strict. Aucun échange de coordonnées personnelles.
                Un compte-rendu peut être transmis à votre wali si vous en faites la demande.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep('heure')}
                className="flex-1 py-3 rounded-xl border border-dark-600 text-dark-400 hover:text-white hover:border-dark-500 text-sm font-medium transition-all"
              >
                Modifier
              </button>
              <button
                onClick={confirmer}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-black font-bold text-sm transition-all hover:shadow-lg hover:shadow-gold-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Confirmer la session
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <style jsx global>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(14px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  )
}

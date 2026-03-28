'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import {
  ChevronRight, ChevronLeft, CheckCircle2,
  Brain, Heart, Users, Briefcase, User, Star,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────
type QuestionType = 'radio' | 'scale' | 'boolean' | 'text' | 'textarea' | 'number' | 'select' | 'checkbox'

interface Question {
  id:           string
  texte:        string
  type:         QuestionType
  options?:     { value: string; label: string; emoji?: string }[]
  min?:         number
  max?:         number
  placeholder?: string
  requis?:      boolean
  aide?:        string
  max_select?:  number  // pour checkbox
}

interface Section {
  id:        string
  titre:     string
  sousTitre: string
  icon:      React.ElementType
  couleur:   string
  questions: Question[]
}

// ─── Sections ─────────────────────────────────────────────────────
const SECTIONS: Section[] = [
  {
    id: 'foi',
    titre: 'Foi & Pratique',
    sousTitre: 'La base de votre identité',
    icon: Star,
    couleur: 'gold',
    questions: [
      {
        id: 'niveauPratique',
        texte: 'Votre niveau de pratique islamique',
        type: 'radio',
        requis: true,
        options: [
          { value: 'debutant',        label: 'Débutant',          emoji: '🌱' },
          { value: 'pratiquant',      label: 'Pratiquant',        emoji: '🕌' },
          { value: 'tres_pratiquant', label: 'Très pratiquant',   emoji: '⭐' },
          { value: 'savant',          label: 'Étudiant en deen',  emoji: '📖' },
        ],
      },
      {
        id: 'ecoleJurisprudentielle',
        texte: 'École jurisprudentielle',
        type: 'radio',
        options: [
          { value: 'maliki',  label: 'Maliki'  },
          { value: 'hanafi',  label: 'Hanafi'  },
          { value: 'chafii',  label: 'Chafiʿi' },
          { value: 'hanbali', label: 'Hanbali' },
          { value: 'autre',   label: 'Autre / Non défini' },
        ],
      },
      {
        id: 'foiCentraleDecisions',
        texte: 'La foi guide-t-elle toutes vos décisions importantes ?',
        type: 'boolean',
        requis: true,
      },
      {
        id: 'acceptePratiqueDiff',
        texte: 'Accepteriez-vous un(e) conjoint(e) de niveau de pratique légèrement différent ?',
        type: 'boolean',
      },
      {
        id: 'valeurIslamiqueVoulue',
        texte: 'Valeur islamique la plus importante chez votre futur(e) conjoint(e)',
        type: 'radio',
        requis: true,
        options: [
          { value: 'piete',        label: 'Piété sincère',       emoji: '🤲' },
          { value: 'honnêteté',    label: 'Honnêteté',           emoji: '💎' },
          { value: 'humilite',     label: 'Humilité',            emoji: '🌿' },
          { value: 'générosité',   label: 'Générosité',          emoji: '❤️' },
          { value: 'patience',     label: 'Patience & sagesse',  emoji: '⚖️' },
        ],
      },
    ],
  },
  {
    id: 'projetVie',
    titre: 'Projet de Vie',
    sousTitre: 'Votre vision du foyer',
    icon: Heart,
    couleur: 'rose',
    questions: [
      {
        id: 'objectifMariage',
        texte: 'Votre démarche sur MASR',
        type: 'radio',
        requis: true,
        options: [
          { value: 'mariage_uniquement',    label: 'Mariage direct',              emoji: '💍' },
          { value: 'mariage_apres',         label: 'Mariage après connaissance',  emoji: '🌸' },
          { value: 'engagement_progressif', label: 'Engagement progressif',       emoji: '🤝' },
        ],
      },
      {
        id: 'souhaitEnfants',
        texte: 'Souhaitez-vous des enfants (ou plus d\'enfants) ?',
        type: 'boolean',
        requis: true,
      },
      {
        id: 'modeVieSouhaite',
        texte: 'Organisation du foyer idéale',
        type: 'radio',
        requis: true,
        options: [
          { value: 'homme_foyer',     label: 'L\'homme travaille, la femme au foyer', emoji: '🏡' },
          { value: 'double_carriere', label: 'Les deux travaillent et partagent',      emoji: '⚖️' },
          { value: 'flexible',        label: 'Flexible selon les circonstances',       emoji: '🔄' },
        ],
      },
      {
        id: 'mobilitePossible',
        texte: 'Seriez-vous prêt(e) à déménager pour votre conjoint(e) ?',
        type: 'boolean',
      },
      {
        id: 'accepteEnfantsPrevious',
        texte: 'Accepteriez-vous un(e) conjoint(e) ayant des enfants d\'une précédente union ?',
        type: 'boolean',
      },
      {
        id: 'accepteDivorce',
        texte: 'Accepteriez-vous une personne divorcée ?',
        type: 'boolean',
      },
      {
        id: 'accepteConverti',
        texte: 'Accepteriez-vous un(e) converti(e) à l\'Islam ?',
        type: 'boolean',
      },
    ],
  },
  {
    id: 'personnalite',
    titre: 'Personnalité',
    sousTitre: 'Qui êtes-vous vraiment ?',
    icon: Brain,
    couleur: 'purple',
    questions: [
      {
        id: 'forcesPersonnelles',
        texte: 'Vos principales qualités (3 à 5 choix)',
        type: 'checkbox',
        requis: true,
        max_select: 5,
        options: [
          { value: 'genereux',    label: 'Généreux(se)',    emoji: '❤️' },
          { value: 'patient',     label: 'Patient(e)',      emoji: '🌿' },
          { value: 'ambitieux',   label: 'Ambitieux(se)',   emoji: '🚀' },
          { value: 'drole',       label: 'Drôle',          emoji: '😄' },
          { value: 'calme',       label: 'Calme',          emoji: '😌' },
          { value: 'organise',    label: 'Organisé(e)',     emoji: '📋' },
          { value: 'empathique',  label: 'Empathique',     emoji: '🤗' },
          { value: 'direct',      label: 'Direct(e)',      emoji: '💬' },
          { value: 'creatif',     label: 'Créatif(ve)',    emoji: '🎨' },
          { value: 'protecteur',  label: 'Protecteur(rice)', emoji: '🛡️' },
          { value: 'curieux',     label: 'Curieux(se)',    emoji: '🔍' },
          { value: 'fidele',      label: 'Fidèle',         emoji: '💎' },
        ],
      },
      {
        id: 'gestionConflits',
        texte: 'Comment gérez-vous les conflits ?',
        type: 'radio',
        requis: true,
        options: [
          { value: 'discussion', label: 'Discussion directe et immédiate', emoji: '💬' },
          { value: 'reflexion',  label: 'Recul puis discussion calme',     emoji: '🧘' },
          { value: 'evitement',  label: 'J\'attends que ça se calme',      emoji: '🕐' },
          { value: 'mediation',  label: 'Je cherche un médiateur',         emoji: '🤝' },
        ],
      },
      {
        id: 'langageAmour',
        texte: 'Votre principal langage de l\'amour',
        type: 'radio',
        options: [
          { value: 'paroles',          label: 'Paroles valorisantes',   emoji: '💬' },
          { value: 'service',          label: 'Actes de service',       emoji: '🤝' },
          { value: 'cadeaux',          label: 'Cadeaux & attentions',   emoji: '🎁' },
          { value: 'temps',            label: 'Temps de qualité',       emoji: '⏰' },
          { value: 'contact_physique', label: 'Contact physique (halal)', emoji: '🤗' },
        ],
        aide: 'Basé sur la théorie des 5 langages de l\'amour',
      },
      {
        id: 'niveauExtraversion',
        texte: 'Vous êtes plutôt...',
        type: 'radio',
        options: [
          { value: '2',  label: 'Très introverti(e)',          emoji: '📖' },
          { value: '4',  label: 'Plutôt introverti(e)',        emoji: '🌿' },
          { value: '6',  label: 'Équilibré(e)',                emoji: '⚖️' },
          { value: '8',  label: 'Plutôt extraverti(e)',        emoji: '🌟' },
          { value: '10', label: 'Très extraverti(e)',          emoji: '🎉' },
        ],
      },
      {
        id: 'partenaireIdeal5Mots',
        texte: 'Votre partenaire idéal(e) en 5 mots',
        type: 'text',
        placeholder: 'Ex: pieux, bienveillant, stable, drôle, ambitieux',
        requis: true,
        aide: 'Question clé pour notre algorithme de matching',
      },
    ],
  },
  {
    id: 'styleVie',
    titre: 'Style de Vie',
    sousTitre: 'Vos habitudes au quotidien',
    icon: Users,
    couleur: 'green',
    questions: [
      {
        id: 'loisirs',
        texte: 'Vos loisirs & passions (jusqu\'à 6 choix)',
        type: 'checkbox',
        requis: true,
        max_select: 6,
        options: [
          { value: 'lecture',   label: 'Lecture & coran',  emoji: '📚' },
          { value: 'sport',     label: 'Sport & fitness',  emoji: '🏋️' },
          { value: 'cuisine',   label: 'Cuisine',          emoji: '🍽️' },
          { value: 'voyages',   label: 'Voyages',          emoji: '✈️' },
          { value: 'nature',    label: 'Nature & randonnée', emoji: '🌿' },
          { value: 'tech',      label: 'Technologie',      emoji: '💻' },
          { value: 'art',       label: 'Art & créativité', emoji: '🎨' },
          { value: 'cinema',    label: 'Cinéma & séries',  emoji: '🎬' },
          { value: 'musique',   label: 'Musique islamique / nashid', emoji: '🎵' },
          { value: 'famille',   label: 'Famille & enfants', emoji: '👨‍👩‍👧' },
          { value: 'bénévolat', label: 'Bénévolat & da\'wa', emoji: '🤲' },
          { value: 'shopping',  label: 'Shopping & mode', emoji: '🛍️' },
        ],
      },
      {
        id: 'cercleSocial',
        texte: 'Votre cercle social est principalement...',
        type: 'radio',
        options: [
          { value: 'non_mixte', label: 'Non-mixte',        emoji: '🕌' },
          { value: 'les_deux',  label: 'Les deux selon le contexte', emoji: '⚖️' },
          { value: 'mixte',     label: 'Mixte',            emoji: '🌍' },
        ],
      },
      {
        id: 'activitePhysique',
        texte: 'Votre pratique sportive',
        type: 'radio',
        options: [
          { value: 'reguliere',     label: 'Régulière (plusieurs fois/semaine)', emoji: '💪' },
          { value: 'occasionnelle', label: 'Occasionnelle',                      emoji: '🚶' },
          { value: 'aucune',        label: 'Peu ou pas de sport',                emoji: '😌' },
        ],
      },
      {
        id: 'fumeur',
        texte: 'Êtes-vous fumeur(se) ?',
        type: 'boolean',
        requis: true,
      },
      {
        id: 'importanceVoyage',
        texte: 'Les voyages dans votre vie',
        type: 'radio',
        options: [
          { value: '1', label: 'Peu importants',  emoji: '🏠' },
          { value: '3', label: 'Occasionnels',    emoji: '🗺️' },
          { value: '5', label: 'Indispensables',  emoji: '✈️' },
        ],
      },
      {
        id: 'sourceBonheur',
        texte: 'Ce qui vous rend heureux(se) au quotidien',
        type: 'textarea',
        placeholder: 'Les petites choses qui illuminent vos journées...',
        requis: true,
        aide: 'L\'une des questions les plus analysées par notre IA',
      },
    ],
  },
  {
    id: 'carriere',
    titre: 'Carrière & Profil',
    sousTitre: 'Votre parcours et vos critères',
    icon: Briefcase,
    couleur: 'orange',
    questions: [
      {
        id: 'niveauEtudes',
        texte: 'Niveau d\'études',
        type: 'radio',
        options: [
          { value: 'cap_bep',       label: 'CAP / BEP'           },
          { value: 'bac',           label: 'Baccalauréat'        },
          { value: 'bac2',          label: 'Bac +2'              },
          { value: 'bac3',          label: 'Bac +3 (Licence)'    },
          { value: 'bac5',          label: 'Bac +5 (Master)'     },
          { value: 'doctorat',      label: 'Doctorat'            },
          { value: 'formation_pro', label: 'Formation pro'       },
        ],
      },
      {
        id: 'situationFinanciere',
        texte: 'Situation financière actuelle',
        type: 'radio',
        options: [
          { value: 'precaire',    label: 'Difficultés actuelles', emoji: '🌱' },
          { value: 'stable',      label: 'Stable & serein',       emoji: '✅' },
          { value: 'confortable', label: 'Confortable',           emoji: '💼' },
          { value: 'aisee',       label: 'Aisée',                 emoji: '💎' },
        ],
      },
      {
        id: 'ambitionsPro',
        texte: 'Orientation professionnelle',
        type: 'radio',
        options: [
          { value: 'stabilite',       label: 'Stabilité avant tout',     emoji: '🏡' },
          { value: 'croissance',      label: 'Évolution progressive',     emoji: '📈' },
          { value: 'entrepreneuriat', label: 'Entrepreneur(e) dans l\'âme', emoji: '🚀' },
        ],
      },
      {
        id: 'taille',
        texte: 'Votre taille (cm)',
        type: 'number',
        min: 140,
        max: 220,
        placeholder: 'Ex: 175',
      },
      {
        id: 'silhouette',
        texte: 'Votre silhouette',
        type: 'radio',
        options: [
          { value: 'mince',      label: 'Mince'       },
          { value: 'athletique', label: 'Athlétique'  },
          { value: 'normale',    label: 'Normale'     },
          { value: 'ronde',      label: 'Ronde'       },
          { value: 'corpulente', label: 'Corpulente'  },
        ],
      },
      {
        id: 'visionFoyer',
        texte: 'Votre vision du foyer idéal',
        type: 'textarea',
        placeholder: 'Ambiance, routine, rythme de vie, valeurs partagées...',
        requis: true,
        aide: 'Question à fort impact sur votre matching',
      },
      {
        id: 'messageConjoint',
        texte: 'Un message à votre futur(e) conjoint(e)',
        type: 'textarea',
        placeholder: 'Parlez-lui directement, comme s\'il(elle) vous lisait...',
        aide: '⭐ La question préférée de notre IA — fort impact matching',
      },
    ],
  },
]

// ─── Composants ────────────────────────────────────────────────────
function BooleanInput({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 mt-3">
      {([true, false] as const).map((v) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onChange(v)}
          className={`py-3 rounded-xl border-2 transition-all font-semibold text-sm ${
            value === v
              ? 'border-gold-500 bg-gold-500/15 text-gold-400'
              : 'border-dark-600 text-dark-400 hover:border-dark-500 hover:text-dark-200'
          }`}
        >
          {v ? '✓  Oui' : '✗  Non'}
        </button>
      ))}
    </div>
  )
}

function CheckboxInput({
  value,
  onChange,
  options,
  maxSelect = 99,
}: {
  value: string[]
  onChange: (v: string[]) => void
  options: { value: string; label: string; emoji?: string }[]
  maxSelect?: number
}) {
  const toggle = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val))
    } else if (value.length < maxSelect) {
      onChange([...value, val])
    } else {
      toast(`Maximum ${maxSelect} choix`, { icon: '⚠️' })
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {options.map((opt) => {
        const checked = value.includes(opt.value)
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all text-left text-sm ${
              checked
                ? 'border-gold-500 bg-gold-500/15 text-gold-300'
                : 'border-dark-600 text-dark-400 hover:border-dark-500 hover:text-dark-200'
            }`}
          >
            {opt.emoji && <span className="text-base flex-shrink-0">{opt.emoji}</span>}
            <span className="leading-tight text-xs font-medium">{opt.label}</span>
            {checked && <CheckCircle2 size={13} className="ml-auto text-gold-500 flex-shrink-0" />}
          </button>
        )
      })}
    </div>
  )
}

function RadioInput({
  value,
  onChange,
  options,
}: {
  value: string | null
  onChange: (v: string) => void
  options: { value: string; label: string; emoji?: string }[]
}) {
  return (
    <div className="space-y-2 mt-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left text-sm ${
            value === opt.value
              ? 'border-gold-500 bg-gold-500/10 text-gold-300'
              : 'border-dark-600 text-dark-300 hover:border-dark-500 hover:text-white'
          }`}
        >
          {opt.emoji && <span className="text-base flex-shrink-0">{opt.emoji}</span>}
          <span className="flex-1 font-medium">{opt.label}</span>
          {value === opt.value && <CheckCircle2 size={16} className="text-gold-500 flex-shrink-0" />}
        </button>
      ))}
    </div>
  )
}

// ─── Page principale ───────────────────────────────────────────────
export default function QuestionnairePage() {
  const { update } = useSession()
  const router = useRouter()

  const [sectionIndex, setSectionIndex] = useState(0)
  const [reponses, setReponses] = useState<Record<string, unknown>>({})
  const [saving, setSaving] = useState(false)

  const section = SECTIONS[sectionIndex]
  const progress = ((sectionIndex) / SECTIONS.length) * 100

  const setReponse = useCallback((id: string, value: unknown) => {
    setReponses((prev) => ({ ...prev, [id]: value }))
  }, [])

  const validerSection = () => {
    const manquantes = section.questions
      .filter((q) => q.requis)
      .filter((q) => {
        const val = reponses[q.id]
        if (val === undefined || val === null || val === '') return true
        if (Array.isArray(val) && val.length === 0) return true
        return false
      })

    if (manquantes.length > 0) {
      toast.error(`${manquantes.length} question${manquantes.length > 1 ? 's' : ''} obligatoire${manquantes.length > 1 ? 's' : ''} restante${manquantes.length > 1 ? 's' : ''}`)
      return false
    }
    return true
  }

  const suivant = () => {
    if (!validerSection()) return
    if (sectionIndex < SECTIONS.length - 1) {
      setSectionIndex((i) => i + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      soumettre()
    }
  }

  const precedent = () => {
    if (sectionIndex > 0) {
      setSectionIndex((i) => i - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const soumettre = async () => {
    setSaving(true)
    try {
      // Convertir les tableaux de checkboxes en JSON string pour l'API
      const payload = { ...reponses }
      if (Array.isArray(payload.forcesPersonnelles)) {
        payload.forcesPersonnelles = (payload.forcesPersonnelles as string[]).join(', ')
      }
      if (Array.isArray(payload.loisirs)) {
        payload.loisirs = (payload.loisirs as string[]).join(', ')
      }
      // Convertir les scale radio string → number
      if (payload.niveauExtraversion && typeof payload.niveauExtraversion === 'string') {
        payload.niveauExtraversion = parseInt(payload.niveauExtraversion, 10)
      }
      if (payload.importanceVoyage && typeof payload.importanceVoyage === 'string') {
        payload.importanceVoyage = parseInt(payload.importanceVoyage, 10)
      }

      const res = await fetch('/api/questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()

      if (res.ok) {
        toast.success('Questionnaire complété ! Notre IA analyse votre profil 🎯')
        await update()
        router.push('/tableau-de-bord')
      } else {
        toast.error(json.error || 'Erreur lors de la sauvegarde')
      }
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setSaving(false)
    }
  }

  const Icon = section.icon
  const isDerniereSection = sectionIndex === SECTIONS.length - 1

  return (
    <div className="min-h-screen bg-dark-900 py-6 px-4 pb-24">
      <div className="max-w-xl mx-auto">

        {/* ── Header ────────────────────────────────────────────── */}
        <div className="mb-7">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full border border-gold-500 flex items-center justify-center">
                <span className="text-gold-500 text-xs font-serif font-bold">M</span>
              </div>
              <span className="text-dark-400 text-xs">Questionnaire de compatibilité</span>
            </div>
            <span className="text-gold-500 text-xs font-semibold">
              {sectionIndex + 1} / {SECTIONS.length}
            </span>
          </div>

          {/* Barre de progression */}
          <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-gold-500 to-gold-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((sectionIndex + 1) / SECTIONS.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          {/* Pastilles sections */}
          <div className="flex gap-1.5 mt-3 justify-center">
            {SECTIONS.map((s, i) => (
              <div
                key={s.id}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i < sectionIndex
                    ? 'bg-gold-500 w-6'
                    : i === sectionIndex
                    ? 'bg-gold-400 w-8'
                    : 'bg-dark-700 w-4'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ── Section ───────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={section.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* Titre de section */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
                <Icon size={22} className="text-gold-400" />
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold text-white">{section.titre}</h1>
                <p className="text-dark-400 text-xs mt-0.5">{section.sousTitre}</p>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {section.questions.map((q) => {
                const val = reponses[q.id]

                return (
                  <div key={q.id} className="bg-dark-800 border border-dark-700 rounded-2xl p-5">
                    <div className="flex items-start gap-2 mb-1">
                      <p className="text-white text-sm font-medium leading-snug flex-1">{q.texte}</p>
                      {q.requis && <span className="text-gold-500 text-xs mt-0.5 flex-shrink-0">*</span>}
                    </div>

                    {q.aide && (
                      <p className="text-xs text-dark-500 mb-2 leading-relaxed">{q.aide}</p>
                    )}

                    {q.type === 'boolean' && (
                      <BooleanInput
                        value={val as boolean | null ?? null}
                        onChange={(v) => setReponse(q.id, v)}
                      />
                    )}

                    {q.type === 'radio' && q.options && (
                      <RadioInput
                        value={val as string | null ?? null}
                        onChange={(v) => setReponse(q.id, v)}
                        options={q.options}
                      />
                    )}

                    {q.type === 'checkbox' && q.options && (
                      <>
                        {q.max_select && q.max_select < 99 && (
                          <p className="text-xs text-dark-500 mb-1">
                            {(val as string[] ?? []).length} / {q.max_select} sélectionné{(val as string[] ?? []).length > 1 ? 's' : ''}
                          </p>
                        )}
                        <CheckboxInput
                          value={val as string[] ?? []}
                          onChange={(v) => setReponse(q.id, v)}
                          options={q.options}
                          maxSelect={q.max_select}
                        />
                      </>
                    )}

                    {q.type === 'select' && q.options && (
                      <select
                        value={val as string ?? ''}
                        onChange={(e) => setReponse(q.id, e.target.value)}
                        className="w-full mt-3 bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white text-sm focus:border-gold-500 focus:outline-none appearance-none"
                      >
                        <option value="">Sélectionner...</option>
                        {q.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    )}

                    {q.type === 'text' && (
                      <input
                        type="text"
                        value={val as string ?? ''}
                        onChange={(e) => setReponse(q.id, e.target.value)}
                        placeholder={q.placeholder}
                        className="w-full mt-3 bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white text-sm focus:border-gold-500 focus:outline-none placeholder-dark-500"
                      />
                    )}

                    {q.type === 'textarea' && (
                      <textarea
                        value={val as string ?? ''}
                        onChange={(e) => setReponse(q.id, e.target.value)}
                        placeholder={q.placeholder}
                        rows={3}
                        className="w-full mt-3 bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white text-sm focus:border-gold-500 focus:outline-none placeholder-dark-500 resize-none"
                      />
                    )}

                    {q.type === 'number' && (
                      <input
                        type="number"
                        value={val as number ?? ''}
                        onChange={(e) => setReponse(q.id, e.target.value ? Number(e.target.value) : '')}
                        placeholder={q.placeholder}
                        min={q.min}
                        max={q.max}
                        className="w-full mt-3 bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white text-sm focus:border-gold-500 focus:outline-none placeholder-dark-500"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Navigation ───────────────────────────────────────── */}
        <div className="fixed bottom-0 left-0 right-0 bg-dark-900/95 backdrop-blur-sm border-t border-dark-700 px-4 py-4">
          <div className="max-w-xl mx-auto flex gap-3">
            {sectionIndex > 0 && (
              <button
                type="button"
                onClick={precedent}
                className="flex items-center gap-2 px-4 py-3 border border-dark-600 text-dark-300 hover:text-white hover:border-dark-500 rounded-xl transition-all text-sm font-medium"
              >
                <ChevronLeft size={16} />
                Retour
              </button>
            )}
            <button
              type="button"
              onClick={suivant}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gold-500 hover:bg-gold-400 text-black font-bold rounded-xl transition-all disabled:opacity-50 text-sm"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : isDerniereSection ? (
                <>
                  <CheckCircle2 size={16} />
                  Terminer le questionnaire
                </>
              ) : (
                <>
                  Continuer
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

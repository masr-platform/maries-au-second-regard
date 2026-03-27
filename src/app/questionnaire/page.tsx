'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import {
  ChevronRight, ChevronLeft, CheckCircle2, Brain,
  Heart, Users, Briefcase, User, Star, MessageCircle
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────
type QuestionType = 'radio' | 'scale' | 'boolean' | 'text' | 'textarea' | 'number' | 'select'

interface Question {
  id:          string
  texte:       string
  type:        QuestionType
  options?:    { value: string; label: string }[]
  min?:        number
  max?:        number
  placeholder?: string
  requis?:     boolean
  aide?:       string
}

interface Section {
  id:       string
  titre:    string
  sousTitre: string
  icon:     React.ElementType
  couleur:  string
  questions: Question[]
}

// ─── Sections du questionnaire ────────────────────────────────────
const SECTIONS: Section[] = [
  {
    id: 'foi',
    titre: 'Identité & Foi',
    sousTitre: 'La base de votre relation avec Allah ﷻ',
    icon: Star,
    couleur: 'gold',
    questions: [
      {
        id: 'niveauPratique',
        texte: 'Comment décririez-vous votre niveau de pratique islamique ?',
        type: 'radio',
        requis: true,
        options: [
          { value: 'debutant',       label: 'Débutant — Je pratique peu mais je crois' },
          { value: 'pratiquant',     label: 'Pratiquant — Je fais mes 5 prières, je jeûne' },
          { value: 'tres_pratiquant', label: 'Très pratiquant — L\'Islam guide tous mes choix' },
          { value: 'savant',         label: 'Savant / Étudiant en sciences islamiques' },
        ],
      },
      {
        id: 'ecoleJurisprudentielle',
        texte: 'Quelle école jurisprudentielle suivez-vous principalement ?',
        type: 'radio',
        options: [
          { value: 'maliki',   label: 'Maliki' },
          { value: 'hanafi',   label: 'Hanafi' },
          { value: 'chafii',   label: 'Chafiʿi' },
          { value: 'hanbali',  label: 'Hanbali' },
          { value: 'autre',    label: 'Autre / Je ne m\'identifie pas à une école' },
        ],
      },
      {
        id: 'foiCentraleDecisions',
        texte: 'La foi occupe-t-elle la place centrale dans vos décisions de vie (mariage, travail, lieu de vie) ?',
        type: 'boolean',
        requis: true,
      },
      {
        id: 'acceptePratiqueDiff',
        texte: 'Seriez-vous à l\'aise avec un(e) conjoint(e) d\'un niveau de pratique légèrement différent du vôtre ?',
        type: 'boolean',
      },
      {
        id: 'descriptionFoi',
        texte: 'En quelques mots, comment votre foi influence-t-elle votre quotidien ?',
        type: 'textarea',
        placeholder: 'Décrivez librement votre relation avec l\'Islam dans votre vie quotidienne...',
        aide: 'Cette réponse est analysée par notre IA pour affiner votre matching',
      },
    ],
  },
  {
    id: 'projetVie',
    titre: 'Projet Conjugal',
    sousTitre: 'Votre vision du foyer et de la vie de couple',
    icon: Heart,
    couleur: 'rose',
    questions: [
      {
        id: 'objectifMariage',
        texte: 'Quelle est votre démarche sur cette plateforme ?',
        type: 'radio',
        requis: true,
        options: [
          { value: 'mariage_uniquement',    label: 'Mariage — Je suis prêt(e) à me marier rapidement si c\'est la bonne personne' },
          { value: 'mariage_apres',         label: 'Mariage après connaissance — Je veux qu\'on se découvre avant de s\'engager' },
          { value: 'engagement_progressif', label: 'Engagement progressif — Je veux prendre le temps' },
        ],
      },
      {
        id: 'souhaitEnfants',
        texte: 'Souhaitez-vous avoir des enfants (ou plus d\'enfants) ?',
        type: 'boolean',
        requis: true,
      },
      {
        id: 'nombreEnfantsSouhaite',
        texte: 'Combien d\'enfants souhaiteriez-vous idéalement ?',
        type: 'number',
        min: 0,
        max: 10,
        placeholder: 'Nombre souhaité',
      },
      {
        id: 'modeVieSouhaite',
        texte: 'Quelle organisation de vie de couple vous correspond le mieux ?',
        type: 'radio',
        options: [
          { value: 'homme_foyer',    label: 'L\'homme travaille, la femme s\'occupe du foyer' },
          { value: 'double_carriere', label: 'Les deux travaillent et partagent les responsabilités' },
          { value: 'flexible',        label: 'Flexible selon les circonstances' },
        ],
      },
      {
        id: 'villeSouhaitee',
        texte: 'Dans quelle ville ou région aimeriez-vous vivre ?',
        type: 'text',
        placeholder: 'Paris, Lyon, Marseille, à l\'étranger...',
      },
      {
        id: 'mobilitePossible',
        texte: 'Seriez-vous prêt(e) à déménager pour votre conjoint(e) ?',
        type: 'boolean',
      },
      {
        id: 'proximiteFamily',
        texte: 'Quelle importance accordez-vous à la proximité avec vos familles respectives ?',
        type: 'scale',
        min: 1,
        max: 5,
        aide: '1 = Peu important, 5 = Très important',
      },
      {
        id: 'visionComplementarite',
        texte: 'Quelle est votre vision de la complémentarité homme/femme dans le couple selon l\'Islam ?',
        type: 'textarea',
        placeholder: 'Partagez votre vision du rôle de chacun dans un foyer islamique...',
        aide: 'Réponse analysée par notre IA',
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
        id: 'gestionConflits',
        texte: 'Comment gérez-vous généralement les conflits ou désaccords ?',
        type: 'radio',
        requis: true,
        options: [
          { value: 'evitement',  label: 'J\'évite le conflit et j\'attends que ça passe' },
          { value: 'discussion', label: 'Je préfère en discuter ouvertement et immédiatement' },
          { value: 'mediation',  label: 'Je cherche un médiateur ou une tierce personne' },
          { value: 'reflexion',  label: 'Je prends du recul avant d\'en parler calmement' },
        ],
      },
      {
        id: 'niveauExtraversion',
        texte: 'Sur une échelle de 1 à 10, où vous situez-vous entre introverti et extraverti ?',
        type: 'scale',
        min: 1,
        max: 10,
        aide: '1 = Très introverti (préfère la solitude), 10 = Très extraverti (épanoui en société)',
      },
      {
        id: 'langageAmour',
        texte: 'Quel est votre principal langage de l\'amour ?',
        type: 'radio',
        options: [
          { value: 'paroles',         label: '💬 Paroles valorisantes — Les mots comptent pour moi' },
          { value: 'service',         label: '🤝 Service — J\'aime rendre service et qu\'on me rende service' },
          { value: 'cadeaux',         label: '🎁 Cadeaux — Les attentions matérielles ont du sens' },
          { value: 'temps',           label: '⏰ Temps de qualité — Je veux qu\'on soit vraiment présents l\'un pour l\'autre' },
          { value: 'contact_physique', label: '🤗 Contact physique — (dans le cadre du mariage)' },
        ],
        aide: 'Basé sur la théorie des 5 langages de l\'amour de Gary Chapman',
      },
      {
        id: 'independanceCouple',
        texte: 'Quelle importance accordez-vous à l\'indépendance personnelle dans le couple ?',
        type: 'scale',
        min: 1,
        max: 5,
        aide: '1 = Je veux tout partager, 5 = J\'ai besoin de mon espace et de mes activités propres',
      },
      {
        id: 'forcesPersonnelles',
        texte: 'Quelles sont vos 3 principales qualités ? Comment votre entourage vous décrirait-il(elle) ?',
        type: 'textarea',
        placeholder: 'Ex: généreux(se), patient(e), organisé(e), drôle, calme...',
        requis: true,
      },
      {
        id: 'intolerances',
        texte: 'Y a-t-il des comportements ou situations que vous ne toléreriez absolument pas chez un(e) conjoint(e) ?',
        type: 'textarea',
        placeholder: 'Ex: manque de respect pour les parents, fumeur, absence de ponctualité...',
        aide: 'Ces informations sont utilisées comme filtres absolus dans notre algorithme',
      },
    ],
  },
  {
    id: 'communication',
    titre: 'Communication',
    sousTitre: 'Votre style relationnel',
    icon: MessageCircle,
    couleur: 'blue',
    questions: [
      {
        id: 'rapportAutorite',
        texte: 'Comment concevez-vous la prise de décision dans un foyer ? (Qui décide de quoi, comment ?)',
        type: 'textarea',
        placeholder: 'Décrivez votre vision de la gouvernance du foyer selon vos valeurs...',
        requis: true,
        aide: 'Réponse analysée par notre IA pour la compatibilité communication',
      },
      {
        id: 'peurMariage',
        texte: 'Quelle est votre principale peur ou appréhension vis-à-vis du mariage ?',
        type: 'textarea',
        placeholder: 'Soyez honnête. Vos peurs sont normales et notre IA les prend en compte...',
        requis: true,
        aide: 'Cette réponse est strictement confidentielle et sert uniquement au matching',
      },
      {
        id: 'messageConjoint',
        texte: 'Si vous aviez un message à adresser à votre futur(e) conjoint(e), ce serait...',
        type: 'textarea',
        placeholder: 'Parlez-lui directement, comme s\'il(elle) vous lisait en ce moment...',
        aide: 'Question préférée de notre IA — les réponses à cette question ont le plus fort impact sur le matching',
      },
    ],
  },
  {
    id: 'styleVie',
    titre: 'Style de Vie',
    sousTitre: 'Votre quotidien et vos habitudes',
    icon: Users,
    couleur: 'green',
    questions: [
      {
        id: 'fumeur',
        texte: 'Êtes-vous fumeur(se) ?',
        type: 'boolean',
        requis: true,
      },
      {
        id: 'consommeAlcool',
        texte: 'Consommez-vous de l\'alcool ?',
        type: 'boolean',
        requis: true,
      },
      {
        id: 'activitePhysique',
        texte: 'Quelle est votre pratique sportive ?',
        type: 'radio',
        options: [
          { value: 'reguliere',     label: 'Régulière — Je fais du sport plusieurs fois par semaine' },
          { value: 'occasionnelle', label: 'Occasionnelle — De temps en temps' },
          { value: 'aucune',        label: 'Aucune — Ce n\'est pas ma priorité' },
        ],
      },
      {
        id: 'loisirs',
        texte: 'Quels sont vos loisirs et passions ?',
        type: 'textarea',
        placeholder: 'Lecture du Coran, sport, cuisine, voyages, art, technologie...',
        requis: true,
        aide: 'Analysé par notre IA pour les affinités communes',
      },
      {
        id: 'cercleSocial',
        texte: 'Votre cercle social est-il principalement...',
        type: 'radio',
        options: [
          { value: 'non_mixte', label: 'Non-mixte — Je préfère les réunions séparées' },
          { value: 'mixte',     label: 'Mixte — Je fréquente hommes et femmes' },
          { value: 'les_deux',  label: 'Les deux selon les contextes' },
        ],
      },
      {
        id: 'importanceVoyage',
        texte: 'Quelle importance les voyages ont-ils dans votre vie ?',
        type: 'scale',
        min: 1,
        max: 5,
        aide: '1 = Peu important, 5 = Indispensable',
      },
      {
        id: 'sourceBonheur',
        texte: 'Qu\'est-ce qui vous rend heureux(se) au quotidien ?',
        type: 'textarea',
        placeholder: 'Les petites choses qui illuminent vos journées...',
        requis: true,
        aide: 'Analysé par notre IA — l\'une des questions les plus importantes du questionnaire',
      },
    ],
  },
  {
    id: 'carriere',
    titre: 'Formation & Carrière',
    sousTitre: 'Votre parcours et vos aspirations',
    icon: Briefcase,
    couleur: 'orange',
    questions: [
      {
        id: 'niveauEtudes',
        texte: 'Quel est votre niveau d\'études ?',
        type: 'select',
        options: [
          { value: 'sans_diplome',   label: 'Sans diplôme' },
          { value: 'cap_bep',        label: 'CAP / BEP' },
          { value: 'bac',            label: 'Baccalauréat' },
          { value: 'bac2',           label: 'Bac +2 (BTS, DUT, DEUG)' },
          { value: 'bac3',           label: 'Bac +3 (Licence)' },
          { value: 'bac5',           label: 'Bac +5 (Master, Ingénieur)' },
          { value: 'doctorat',       label: 'Doctorat' },
          { value: 'formation_pro',  label: 'Formation professionnelle' },
        ],
      },
      {
        id: 'situationFinanciere',
        texte: 'Comment décririez-vous votre situation financière actuelle ?',
        type: 'radio',
        options: [
          { value: 'precaire',     label: 'Précaire — Des difficultés financières en ce moment' },
          { value: 'stable',       label: 'Stable — Je couvre mes besoins confortablement' },
          { value: 'confortable',  label: 'Confortable — J\'ai de l\'épargne et une sécurité' },
          { value: 'aisee',        label: 'Aisée — Pas de soucis financiers' },
        ],
      },
      {
        id: 'ambitionsPro',
        texte: 'Quelle est votre orientation professionnelle principale ?',
        type: 'radio',
        options: [
          { value: 'stabilite',        label: 'Stabilité — Un emploi stable me suffit' },
          { value: 'croissance',       label: 'Croissance — Je veux évoluer progressivement' },
          { value: 'entrepreneuriat',  label: 'Entrepreneuriat — J\'ai ou je veux créer mon business' },
        ],
      },
      {
        id: 'visionFinancesCouple',
        texte: 'Quelle est votre vision de la gestion financière dans un couple ?',
        type: 'textarea',
        placeholder: 'Compte commun, comptes séparés, contribution mutuelle...',
      },
    ],
  },
  {
    id: 'profil',
    titre: 'Profil & Critères',
    sousTitre: 'Votre profil physique et vos attentes',
    icon: User,
    couleur: 'gold',
    questions: [
      {
        id: 'taille',
        texte: 'Votre taille (en cm)',
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
          { value: 'mince',       label: 'Mince' },
          { value: 'athletique',  label: 'Athlétique' },
          { value: 'normale',     label: 'Normale' },
          { value: 'ronde',       label: 'Ronde' },
          { value: 'corpulente',  label: 'Corpulente' },
        ],
      },
      {
        id: 'accepteEnfantsPrevious',
        texte: 'Seriez-vous prêt(e) à accepter un(e) conjoint(e) ayant des enfants d\'une précédente union ?',
        type: 'boolean',
      },
      {
        id: 'accepteDivorce',
        texte: 'Seriez-vous prêt(e) à vous marier avec une personne divorcée ?',
        type: 'boolean',
      },
      {
        id: 'accepteConverti',
        texte: 'Seriez-vous prêt(e) à vous marier avec un(e) converti(e) ?',
        type: 'boolean',
      },
      {
        id: 'partenaireIdeal5Mots',
        texte: 'Décrivez votre partenaire idéal(e) en 5 mots ou qualités',
        type: 'text',
        placeholder: 'Ex: pieux, bienveillant, ambitieux, stable, drôle',
        requis: true,
        aide: 'Question clé pour l\'analyse IA',
      },
      {
        id: 'visionFoyer',
        texte: 'Décrivez votre vision du foyer idéal — l\'ambiance, la routine, le rythme de vie',
        type: 'textarea',
        placeholder: 'Imaginez votre quotidien conjugal idéal. Que voyez-vous ?',
        requis: true,
        aide: 'L\'une des questions les plus analysées par notre IA de matching',
      },
      {
        id: 'valeurIslamiqueVoulue',
        texte: 'Quelle valeur islamique est la plus importante pour vous chez votre futur(e) conjoint(e) ?',
        type: 'textarea',
        placeholder: 'Honnêteté, générosité, humilité, piété, patience, sagesse...',
        requis: true,
      },
    ],
  },
]

// ─── Composants ────────────────────────────────────────────────────
function BooleanInput({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 mt-2">
      {[true, false].map((v) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onChange(v)}
          className={`py-3 rounded-lg border transition-all font-medium text-sm ${
            value === v
              ? 'border-gold-500 bg-gold-500/10 text-gold-400'
              : 'border-dark-500 text-dark-300 hover:border-dark-400'
          }`}
        >
          {v ? 'Oui' : 'Non'}
        </button>
      ))}
    </div>
  )
}

function ScaleInput({ value, onChange, min = 1, max = 5, aide }: {
  value: number | null; onChange: (v: number) => void
  min?: number; max?: number; aide?: string
}) {
  const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i)
  return (
    <div className="mt-2">
      <div className="flex gap-2 justify-between">
        {steps.map((step) => (
          <button
            key={step}
            type="button"
            onClick={() => onChange(step)}
            className={`flex-1 py-3 rounded-lg border transition-all font-semibold text-sm ${
              value === step
                ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                : 'border-dark-500 text-dark-300 hover:border-dark-400'
            }`}
          >
            {step}
          </button>
        ))}
      </div>
      {aide && <p className="text-xs text-dark-400 mt-2 text-center">{aide}</p>}
    </div>
  )
}

// ─── Page principale ───────────────────────────────────────────────
export default function QuestionnairePage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [sectionIndex, setSectionIndex] = useState(0)
  const [reponses, setReponses] = useState<Record<string, unknown>>({})
  const [saving, setSaving] = useState(false)

  const section = SECTIONS[sectionIndex]
  const progress = ((sectionIndex + 1) / SECTIONS.length) * 100

  const setReponse = useCallback((id: string, value: unknown) => {
    setReponses((prev) => ({ ...prev, [id]: value }))
  }, [])

  const validerSection = () => {
    // Vérifier les questions obligatoires
    const manquantes = section.questions
      .filter((q) => q.requis)
      .filter((q) => {
        const val = reponses[q.id]
        return val === undefined || val === null || val === ''
      })

    if (manquantes.length > 0) {
      toast.error(`Merci de répondre aux questions obligatoires (${manquantes.length} restante${manquantes.length > 1 ? 's' : ''})`)
      return false
    }
    return true
  }

  const suivant = () => {
    if (!validerSection()) return

    if (sectionIndex < SECTIONS.length - 1) {
      setSectionIndex((i) => i + 1)
      window.scrollTo(0, 0)
    } else {
      soumettre()
    }
  }

  const precedent = () => {
    if (sectionIndex > 0) {
      setSectionIndex((i) => i - 1)
      window.scrollTo(0, 0)
    }
  }

  const soumettre = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reponses),
      })

      const json = await res.json()

      if (res.ok) {
        toast.success('Questionnaire complété ! Notre IA analyse votre profil.')
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

  return (
    <div className="min-h-screen bg-dark-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full border border-gold-500 flex items-center justify-center">
                <span className="text-gold-500 text-xs font-serif font-bold">M</span>
              </div>
              <span className="text-dark-300 text-sm">Questionnaire de compatibilité</span>
            </div>
            <span className="text-gold-500 text-sm font-medium">
              {sectionIndex + 1}/{SECTIONS.length}
            </span>
          </div>

          {/* Barre de progression */}
          <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gold-gradient rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          {/* Étapes miniatures */}
          <div className="flex gap-1 mt-3">
            {SECTIONS.map((s, i) => (
              <div
                key={s.id}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  i < sectionIndex ? 'bg-gold-500' :
                  i === sectionIndex ? 'bg-gold-400' :
                  'bg-dark-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Section actuelle */}
        <AnimatePresence mode="wait">
          <motion.div
            key={section.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            {/* Titre section */}
            <div className="card-dark mb-6 border-gold-500/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gold-500/10 rounded-lg">
                  <Icon size={20} className="text-gold-500" />
                </div>
                <div>
                  <h2 className="text-xl font-serif font-bold text-white">{section.titre}</h2>
                  <p className="text-dark-300 text-sm">{section.sousTitre}</p>
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {section.questions.map((q, qi) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: qi * 0.05 }}
                  className="card-dark"
                >
                  <div className="mb-3">
                    <p className="text-white font-medium leading-relaxed">
                      {q.requis && <span className="text-gold-500 mr-1">*</span>}
                      {q.texte}
                    </p>
                    {q.aide && (
                      <p className="text-dark-400 text-xs mt-1 italic">{q.aide}</p>
                    )}
                  </div>

                  {/* Radio */}
                  {q.type === 'radio' && (
                    <div className="space-y-2">
                      {q.options?.map((opt) => (
                        <label
                          key={opt.value}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            reponses[q.id] === opt.value
                              ? 'border-gold-500 bg-gold-500/10'
                              : 'border-dark-500 hover:border-dark-400'
                          }`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            value={opt.value}
                            checked={reponses[q.id] === opt.value}
                            onChange={() => setReponse(q.id, opt.value)}
                            className="mt-0.5 accent-gold-500 flex-shrink-0"
                          />
                          <span className={`text-sm ${reponses[q.id] === opt.value ? 'text-gold-300' : 'text-dark-200'}`}>
                            {opt.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Boolean */}
                  {q.type === 'boolean' && (
                    <BooleanInput
                      value={reponses[q.id] as boolean ?? null}
                      onChange={(v) => setReponse(q.id, v)}
                    />
                  )}

                  {/* Scale */}
                  {q.type === 'scale' && (
                    <ScaleInput
                      value={reponses[q.id] as number ?? null}
                      onChange={(v) => setReponse(q.id, v)}
                      min={q.min}
                      max={q.max}
                      aide={q.aide}
                    />
                  )}

                  {/* Text */}
                  {q.type === 'text' && (
                    <input
                      type="text"
                      value={(reponses[q.id] as string) || ''}
                      onChange={(e) => setReponse(q.id, e.target.value)}
                      placeholder={q.placeholder}
                      className="input-dark mt-2"
                    />
                  )}

                  {/* Textarea */}
                  {q.type === 'textarea' && (
                    <textarea
                      value={(reponses[q.id] as string) || ''}
                      onChange={(e) => setReponse(q.id, e.target.value)}
                      placeholder={q.placeholder}
                      rows={4}
                      className="input-dark mt-2 resize-none"
                    />
                  )}

                  {/* Number */}
                  {q.type === 'number' && (
                    <input
                      type="number"
                      value={(reponses[q.id] as number) || ''}
                      onChange={(e) => setReponse(q.id, parseInt(e.target.value))}
                      placeholder={q.placeholder}
                      min={q.min}
                      max={q.max}
                      className="input-dark mt-2 w-40"
                    />
                  )}

                  {/* Select */}
                  {q.type === 'select' && (
                    <select
                      value={(reponses[q.id] as string) || ''}
                      onChange={(e) => setReponse(q.id, e.target.value)}
                      className="input-dark mt-2"
                    >
                      <option value="">Choisir...</option>
                      {q.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              {sectionIndex > 0 && (
                <button
                  onClick={precedent}
                  className="btn-outline-gold flex items-center gap-2 px-5 py-3"
                >
                  <ChevronLeft size={18} />
                  Précédent
                </button>
              )}

              <button
                onClick={suivant}
                disabled={saving}
                className="btn-gold flex-1 flex items-center justify-center gap-2 py-3"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : sectionIndex < SECTIONS.length - 1 ? (
                  <>
                    Section suivante
                    <ChevronRight size={18} />
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Terminer le questionnaire
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-dark-400 text-xs mt-4">
              * Questions obligatoires. Vos réponses sont strictement confidentielles.
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

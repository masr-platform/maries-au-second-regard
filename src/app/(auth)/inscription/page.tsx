'use client'

import { useState }      from 'react'
import { useForm }       from 'react-hook-form'
import { zodResolver }   from '@hookform/resolvers/zod'
import { z }             from 'zod'
import { signIn }        from 'next-auth/react'
import { useRouter }     from 'next/navigation'
import Link              from 'next/link'
import { Eye, EyeOff, User, Mail, Lock, Calendar, MapPin, ArrowRight } from 'lucide-react'
import toast             from 'react-hot-toast'

const schema = z.object({
  prenom:        z.string().min(2, 'Prénom requis').max(50),
  email:         z.string().email('Email invalide'),
  password:      z.string().min(8, 'Minimum 8 caractères')
                  .regex(/[A-Z]/, 'Au moins une majuscule')
                  .regex(/[0-9]/, 'Au moins un chiffre'),
  passwordConf:  z.string(),
  genre:         z.enum(['HOMME', 'FEMME'], { required_error: 'Genre requis' }),
  dateNaissance: z.string().refine((d) => {
    if (!d) return false
    const age = (Date.now() - new Date(d).getTime()) / (365.25 * 24 * 3600 * 1000)
    return age >= 18
  }, 'Vous devez avoir au moins 18 ans'),
  ville:      z.string().optional(),
  accepteCGU: z.boolean().refine((v) => v, 'Vous devez accepter les CGU'),
}).refine((d) => d.password === d.passwordConf, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['passwordConf'],
})

type FormData = z.infer<typeof schema>

export default function InscriptionPage() {
  const router = useRouter()
  const [showPwd,  setShowPwd]  = useState(false)
  const [showPwd2, setShowPwd2] = useState(false)
  const [loading,  setLoading]  = useState(false)

  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const genre = watch('genre')

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/users', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          prenom:        data.prenom,
          email:         data.email,
          password:      data.password,
          genre:         data.genre,
          dateNaissance: data.dateNaissance,
          ville:         data.ville,
          accepteCGU:    data.accepteCGU,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error || 'Erreur lors de l\'inscription')
        return
      }

      // Connexion automatique
      const signInRes = await signIn('credentials', {
        email:    data.email,
        password: data.password,
        redirect: false,
      })

      if (signInRes?.ok) {
        toast.success('Bienvenue sur Mariés au Second Regard !')
        router.push('/photos')  // → étape photos avant questionnaire
      }
    } catch {
      toast.error('Erreur réseau. Vérifiez votre connexion.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 py-12">
      {/* Background décoratif */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-gold-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full border border-gold-500 flex items-center justify-center">
              <span className="text-gold-500 text-xs font-serif font-bold">M</span>
            </div>
            <span className="font-serif text-white text-sm tracking-wide">MASR</span>
          </Link>
          <h1 className="text-2xl font-serif font-bold text-white">Créer mon profil</h1>
          <p className="text-dark-300 text-sm mt-2">Commencez votre parcours vers le mariage</p>
        </div>

        <div className="card-dark space-y-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Prénom */}
            <div>
              <label className="label-gold">Prénom</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
                <input
                  {...register('prenom')}
                  type="text"
                  placeholder="Votre prénom"
                  className="input-dark pl-10"
                  autoComplete="given-name"
                />
              </div>
              {errors.prenom && <p className="text-red-400 text-xs mt-1">{errors.prenom.message}</p>}
            </div>

            {/* Genre */}
            <div>
              <label className="label-gold">Je suis</label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                {(['HOMME', 'FEMME'] as const).map((g) => (
                  <label
                    key={g}
                    className={`flex items-center justify-center gap-2 py-3 rounded-lg border cursor-pointer transition-all ${
                      genre === g
                        ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                        : 'border-dark-500 text-dark-300 hover:border-dark-400'
                    }`}
                  >
                    <input
                      {...register('genre')}
                      type="radio"
                      value={g}
                      className="sr-only"
                    />
                    <span className="font-medium">{g === 'HOMME' ? 'Un homme' : 'Une femme'}</span>
                  </label>
                ))}
              </div>
              {errors.genre && <p className="text-red-400 text-xs mt-1">{errors.genre.message}</p>}
            </div>

            {/* Date de naissance */}
            <div>
              <label className="label-gold">Date de naissance</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
                <input
                  {...register('dateNaissance')}
                  type="date"
                  className="input-dark pl-10"
                  max={new Date(Date.now() - 18 * 365.25 * 24 * 3600 * 1000).toISOString().split('T')[0]}
                />
              </div>
              {errors.dateNaissance && <p className="text-red-400 text-xs mt-1">{errors.dateNaissance.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="label-gold">Adresse email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="votre@email.com"
                  className="input-dark pl-10"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Ville (optionnel) */}
            <div>
              <label className="label-gold">Ville <span className="text-dark-400 font-normal">(optionnel)</span></label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
                <input
                  {...register('ville')}
                  type="text"
                  placeholder="Paris, Lyon, Marseille..."
                  className="input-dark pl-10"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="label-gold">Mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
                <input
                  {...register('password')}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="8 caractères min. avec majuscule et chiffre"
                  className="input-dark pl-10 pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-300 hover:text-white"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirmation mot de passe */}
            <div>
              <label className="label-gold">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
                <input
                  {...register('passwordConf')}
                  type={showPwd2 ? 'text' : 'password'}
                  placeholder="Répétez votre mot de passe"
                  className="input-dark pl-10 pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd2(!showPwd2)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-300 hover:text-white"
                >
                  {showPwd2 ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.passwordConf && <p className="text-red-400 text-xs mt-1">{errors.passwordConf.message}</p>}
            </div>

            {/* CGU + CGV */}
            <div className="flex items-start gap-3">
              <input
                {...register('accepteCGU')}
                type="checkbox"
                id="cgu"
                className="mt-0.5 accent-gold-500 w-4 h-4 shrink-0"
              />
              <label htmlFor="cgu" className="text-sm text-dark-300 cursor-pointer leading-relaxed">
                J&apos;accepte les{' '}
                <Link href="/cgu" target="_blank" className="text-gold-400 hover:underline">CGU</Link>,
                les{' '}
                <Link href="/cgv" target="_blank" className="text-gold-400 hover:underline">CGV</Link>{' '}
                et la{' '}
                <Link href="/confidentialite" target="_blank" className="text-gold-400 hover:underline">politique de confidentialité</Link>.{' '}
                <span className="text-dark-400">Je comprends que mes échanges peuvent être supervisés en cas de signalement et que tout échange de coordonnées personnelles entraîne un bannissement immédiat.</span>
              </label>
            </div>
            {errors.accepteCGU && <p className="text-red-400 text-xs mt-1">{errors.accepteCGU.message}</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full flex items-center justify-center gap-2 py-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Créer mon profil
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-dark-400 text-sm">
            Déjà inscrit ?{' '}
            <Link href="/connexion" className="text-gold-400 hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

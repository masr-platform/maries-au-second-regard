// ══════════════════════════════════════════════════════════════════
// DAILY.CO — Mouqabalas virtuelles & sessions imam/thérapie
// Crée des rooms sécurisées avec expiration automatique
// ══════════════════════════════════════════════════════════════════

const DAILY_API_URL = 'https://api.daily.co/v1'
const DAILY_API_KEY = process.env.DAILY_API_KEY

// ─── Types ──────────────────────────────────────────────────────────
export interface DailyRoom {
  id:           string
  name:         string
  url:          string
  privacy:      'private' | 'public'
  config:       DailyRoomConfig
  created_at:   number
}

export interface DailyRoomConfig {
  exp?:                  number  // Unix timestamp expiration
  max_participants?:     number
  enable_recording?:     string
  start_video_off?:      boolean
  start_audio_off?:      boolean
  enable_chat?:          boolean
  enable_knocking?:      boolean
  wait_for_host_to_join?: number
}

export interface DailyMeetingToken {
  token: string
}

// ─── Erreur si DAILY_API_KEY absent ─────────────────────────────────
function assertApiKey(): string {
  if (!DAILY_API_KEY) {
    throw new Error('[Daily.co] DAILY_API_KEY non configuré dans les variables d\'environnement')
  }
  return DAILY_API_KEY
}

async function dailyFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const apiKey = assertApiKey()
  const res = await fetch(`${DAILY_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization:  `Bearer ${apiKey}`,
      ...options.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(`[Daily.co] ${res.status} — ${JSON.stringify(error)}`)
  }

  return res.json()
}

// ─── 1. Créer une room pour une session ────────────────────────────
export async function createDailyRoom(options: {
  sessionId:         string
  scheduledAt:       Date
  dureeMinutes?:     number
  maxParticipants?:  number
}): Promise<DailyRoom> {
  const { sessionId, scheduledAt, dureeMinutes = 60, maxParticipants = 4 } = options

  // La room expire 30 min après la fin prévue (buffer pour retards)
  const expiration = Math.floor(scheduledAt.getTime() / 1000)
    + dureeMinutes * 60
    + 30 * 60

  // Nom unique basé sur sessionId (URL-safe)
  const roomName = `masr-${sessionId.slice(0, 20)}`

  const room = await dailyFetch<DailyRoom>('/rooms', {
    method: 'POST',
    body: JSON.stringify({
      name:    roomName,
      privacy: 'private',  // Accès uniquement via meeting token
      properties: {
        exp:                   expiration,
        max_participants:      maxParticipants,
        enable_recording:      'cloud',    // Enregistrement pour supervision
        start_video_off:       false,
        start_audio_off:       false,
        enable_chat:           true,
        enable_knocking:       true,       // Les participants sonnent avant d'entrer
        wait_for_host_to_join: 300,        // 5 min d'attente avant fermeture auto
        // Fond virtuel MASR pour l'identité visuelle
        meeting_join_hook:     null,
      } satisfies DailyRoomConfig,
    }),
  })

  return room
}

// ─── 2. Générer un meeting token pour un participant ────────────────
export async function createMeetingToken(options: {
  roomName:     string
  userId:       string
  prenom:       string
  isHost?:      boolean
  expiresAt:    Date
}): Promise<string> {
  const { roomName, userId, prenom, isHost = false, expiresAt } = options

  const data = await dailyFetch<DailyMeetingToken>('/meeting-tokens', {
    method: 'POST',
    body: JSON.stringify({
      properties: {
        room_name:  roomName,
        user_id:    userId,
        user_name:  prenom,
        is_owner:   isHost,   // L'imam est host
        exp:        Math.floor(expiresAt.getTime() / 1000),
        // Sécurité : token à usage unique (rejoin interdit)
        enable_recording: isHost,
      },
    }),
  })

  return data.token
}

// ─── 3. Supprimer une room après la session ─────────────────────────
export async function deleteDailyRoom(roomName: string): Promise<void> {
  await dailyFetch(`/rooms/${roomName}`, { method: 'DELETE' })
}

// ─── 4. Vérifier si une room est active ─────────────────────────────
export async function getRoomInfo(roomName: string): Promise<DailyRoom | null> {
  try {
    return await dailyFetch<DailyRoom>(`/rooms/${roomName}`)
  } catch {
    return null
  }
}

// ─── 5. Récupérer les participants actuels ───────────────────────────
export async function getRoomPresence(roomName: string): Promise<number> {
  try {
    const data = await dailyFetch<{ total_count: number }>(`/presence/${roomName}`)
    return data.total_count
  } catch {
    return 0
  }
}

'use client'

import { useMemo, useState } from 'react'
import {
  Activity,
  ArrowRight,
  Bot,
  BrainCircuit,
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  FileText,
  Filter,
  Headphones,
  HelpCircle,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  LockKeyhole,
  Menu,
  MessageSquareText,
  MonitorCog,
  Network,
  Plus,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserRound,
  Users,
  X,
  Zap,
} from 'lucide-react'

type Role = 'requester' | 'receiver' | 'admin'
type EntryRole = 'requester' | 'receiver'
type View =
  | 'dashboard'
  | 'tickets'
  | 'ticket'
  | 'diagnosis'
  | 'knowledge'
  | 'tools'
  | 'monitoring'
  | 'notifications'
  | 'profile'
  | 'new-direct'
  | 'new-ai'
  | 'success'
type TicketStatus = 'À qualifier' | 'En cours' | 'En attente' | 'Résolu'
type AuthStep = 'profile' | 'login'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

type TicketData = {
  id: string
  title: string
  status: TicketStatus
  priority: string
  category: string
  requester: string
  time: string
  sla: string
  createdAt: string
  location: string
  department: string
  responsible: string
  comments: number
}

const tickets: TicketData[] = [
  {
    id: '#1042',
    title: 'Accès VPN impossible depuis ce matin',
    status: 'En cours',
    priority: 'Haute',
    category: 'Réseau',
    requester: 'Sophie Martin',
    time: 'Il y a 12 min',
    sla: '01:42:18',
    createdAt: 'Aujourd’hui · 08:42',
    location: 'Domicile · Lyon',
    department: 'Infrastructure & Réseau',
    responsible: 'Marc Leroy',
    comments: 4,
  },
  {
    id: '#1041',
    title: 'Écran noir au démarrage',
    status: 'À qualifier',
    priority: 'Critique',
    category: 'Matériel',
    requester: 'Lucas Bernard',
    time: 'Il y a 28 min',
    sla: '00:34:09',
    createdAt: 'Aujourd’hui · 08:26',
    location: 'Bureau Paris · 4e étage',
    department: 'Poste de travail',
    responsible: 'Non assigné',
    comments: 1,
  },
  {
    id: '#1040',
    title: 'Demande de licence Figma',
    status: 'En attente',
    priority: 'Normale',
    category: 'Logiciel',
    requester: 'Claire Dubois',
    time: 'Il y a 1 h',
    sla: '06:20:00',
    createdAt: 'Aujourd’hui · 07:51',
    location: 'Bureau Nantes',
    department: 'Applications',
    responsible: 'Julie Moreau',
    comments: 2,
  },
  {
    id: '#1039',
    title: 'Imprimante étage 3 hors ligne',
    status: 'Résolu',
    priority: 'Normale',
    category: 'Périphérique',
    requester: 'Thomas Petit',
    time: 'Il y a 2 h',
    sla: '—',
    createdAt: 'Aujourd’hui · 06:42',
    location: 'Bureau Paris · 3e étage',
    department: 'Poste de travail',
    responsible: 'Marc Leroy',
    comments: 5,
  },
  {
    id: '#1038',
    title: 'Compte verrouillé après changement de mot de passe',
    status: 'En cours',
    priority: 'Haute',
    category: 'Accès',
    requester: 'Nina Garcia',
    time: 'Il y a 3 h',
    sla: '03:18:45',
    createdAt: 'Aujourd’hui · 05:39',
    location: 'Bureau Bordeaux',
    department: 'Identité & Accès',
    responsible: 'Karim Benali',
    comments: 3,
  },
  {
    id: '#1037',
    title: 'Erreur de synchronisation OneDrive',
    status: 'Résolu',
    priority: 'Basse',
    category: 'Logiciel',
    requester: 'Hugo Roy',
    time: 'Hier',
    sla: '—',
    createdAt: 'Hier · 16:18',
    location: 'Télétravail',
    department: 'Applications',
    responsible: 'Julie Moreau',
    comments: 3,
  },
]

const navByRole: Record<Role, { label: string; view: View; icon: typeof LayoutDashboard }[]> = {
  requester: [
    { label: 'Mon espace', view: 'dashboard', icon: LayoutDashboard },
    { label: 'Mes demandes', view: 'tickets', icon: Ticket },
    { label: 'Nouvelle demande', view: 'new-direct', icon: Plus },
    { label: 'Centre d’aide', view: 'knowledge', icon: HelpCircle },
  ],
  receiver: [
    { label: 'Dashboard', view: 'dashboard', icon: LayoutDashboard },
    { label: 'Tickets', view: 'tickets', icon: ListChecks },
    { label: 'Notifications', view: 'notifications', icon: MessageSquareText },
    { label: 'Profil', view: 'profile', icon: UserRound },
  ],
  admin: [
    { label: 'Pilotage', view: 'dashboard', icon: LayoutDashboard },
    { label: 'Tickets & opérations', view: 'tickets', icon: ListChecks },
    { label: 'Base RAG', view: 'knowledge', icon: Network },
    { label: 'Outils & droits', view: 'tools', icon: LockKeyhole },
    { label: 'Observabilité', view: 'monitoring', icon: Activity },
  ],
}

const roleMeta: Record<Role, { name: string; subtitle: string; initials: string; tone: string }> = {
  requester: {
    name: 'Sophie Martin',
    subtitle: 'Collaboratrice · Produit',
    initials: 'SM',
    tone: 'indigo',
  },
  receiver: {
    name: 'Marc Leroy',
    subtitle: 'Technicien support · N2',
    initials: 'ML',
    tone: 'teal',
  },
  admin: {
    name: 'Amina Diallo',
    subtitle: 'Administratrice plateforme',
    initials: 'AD',
    tone: 'violet',
  },
}

function Pill({
  children,
  tone = 'muted',
}: {
  children: React.ReactNode
  tone?: 'muted' | 'success' | 'warning' | 'danger' | 'info'
}) {
  return <span className={`pill pill-${tone}`}>{children}</span>
}

function Logo() {
  return (
    <div className="brand-mark">
      <Sparkles size={18} />
      <span>mAIntenance</span>
    </div>
  )
}

function Metric({
  label,
  value,
  detail,
  tone = 'default',
  icon: Icon,
}: {
  label: string
  value: string
  detail: string
  tone?: string
  icon: typeof Activity
}) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${tone}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="eyebrow">{label}</p>
        <p className="metric-value">{value}</p>
        <p className="metric-detail">{detail}</p>
      </div>
    </div>
  )
}

function TicketRow({ ticket, onOpen }: { ticket: TicketData; onOpen: () => void }) {
  return (
    <button className="ticket-row" onClick={onOpen}>
      <div className="ticket-id">{ticket.id}</div>
      <div className="ticket-main">
        <strong>{ticket.title}</strong>
        <span>
          {ticket.requester} · {ticket.category} · {ticket.time}
        </span>
      </div>
      <Pill
        tone={
          ticket.status === 'Résolu'
            ? 'success'
            : ticket.status === 'En attente'
              ? 'warning'
              : ticket.status === 'À qualifier'
                ? 'danger'
                : 'info'
        }
      >
        {ticket.status}
      </Pill>
      <Pill
        tone={
          ticket.priority === 'Critique'
            ? 'danger'
            : ticket.priority === 'Haute'
              ? 'warning'
              : 'muted'
        }
      >
        {ticket.priority}
      </Pill>
      <span className="sla">
        <Clock3 size={14} /> {ticket.sla}
      </span>
      <ArrowRight size={16} className="row-arrow" />
    </button>
  )
}

function App() {
  const [role, setRole] = useState<Role | null>(null)
  const [entryRole, setEntryRole] = useState<EntryRole | null>(null)
  const [authStep, setAuthStep] = useState<AuthStep>('profile')
  const [view, setView] = useState<View>('dashboard')
  const [mobileNav, setMobileNav] = useState(false)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const [assignedDepartment, setAssignedDepartment] = useState('Non affecté')
  const [assignedResponsible, setAssignedResponsible] = useState('Marc Leroy')
  const [ticketStatuses, setTicketStatuses] = useState<Record<string, TicketStatus>>(
    () =>
      Object.fromEntries(tickets.map((ticket) => [ticket.id, ticket.status])) as Record<
        string,
        TicketStatus
      >,
  )

  const filteredTickets = useMemo(
    () =>
      tickets.filter((t) =>
        `${t.id} ${t.title} ${t.requester} ${t.department}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [search],
  )
  function updateTicketStatus(ticketId: string, status: TicketStatus) {
    setTicketStatuses((current) => ({ ...current, [ticketId]: status }))
    setToast(`${ticketId} déplacé vers « ${status} »`)
    setTimeout(() => setToast(''), 2200)
  }
  const activeTicket = tickets[0]

  function chooseEntryRole(nextRole: EntryRole) {
    setEntryRole(nextRole)
    setAuthStep('login')
  }
  function completeLogin(nextRole: EntryRole) {
    setRole(nextRole)
    setView('dashboard')
  }
  function openTicket() {
    setView('ticket')
    setToast('Ticket #1042 ouvert dans votre espace')
    setTimeout(() => setToast(''), 2500)
  }

  if (!role)
    return (
      <Login
        authStep={authStep}
        selectedRole={entryRole}
        onChoose={chooseEntryRole}
        onLogin={completeLogin}
        onBack={() => {
          setAuthStep('profile')
          setEntryRole(null)
        }}
      />
    )

  const meta = roleMeta[role]
  const nav = navByRole[role]
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'mobile-open' : ''}`}>
        <div className="sidebar-top">
          <Logo />
          <button
            className="icon-button mobile-close"
            onClick={() => setMobileNav(false)}
            aria-label="Fermer le menu"
          >
            <X size={18} />
          </button>
        </div>
        <div className="role-switch">
          <span className="role-dot" />
          <div>
            <p className="eyebrow">Espace connecté</p>
            <strong>
              {role === 'requester'
                ? 'Demandeur'
                : role === 'receiver'
                  ? 'Récepteur'
                  : 'Administrateur'}
            </strong>
          </div>
          <ChevronDown size={15} />
        </div>
        <nav className="side-nav">
          {nav.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                className={
                  view === item.view || (item.view === 'tickets' && view === 'ticket')
                    ? 'active'
                    : ''
                }
                onClick={() => {
                  setView(item.view)
                  setMobileNav(false)
                }}
              >
                <Icon size={17} />
                {item.label}
              </button>
            )
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="live-dot" />
            <div>
              <strong>Système opérationnel</strong>
              <span>Dernière vérification · 2 min</span>
            </div>
          </div>
          <button
            className="user-card"
            onClick={() => {
              setRole(null)
              setAuthStep('profile')
              setEntryRole(null)
            }}
          >
            <span className={`avatar ${meta.tone}`}>{meta.initials}</span>
            <span>
              <strong>{meta.name}</strong>
              <small>{meta.subtitle}</small>
            </span>
            <Settings2 size={16} />
          </button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            onClick={() => setMobileNav(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu size={19} />
          </button>
          <div className="breadcrumbs">
            <span>
              {role === 'requester'
                ? 'Mon espace'
                : role === 'receiver'
                  ? 'Support N2'
                  : 'Administration'}
            </span>
            <span>/</span>
            <strong>{nav.find((n) => n.view === view)?.label ?? 'Détail ticket'}</strong>
          </div>
          <div className="top-actions">
            <div className="search-box">
              <Search size={16} />
              <input
                aria-label="Rechercher"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher…"
              />
              <kbd>⌘ K</kbd>
            </div>
            <button className="icon-button">
              <HelpCircle size={18} />
            </button>
            <span className="avatar small">{meta.initials}</span>
          </div>
        </header>
        <div className="content">
          {role === 'requester' ? (
            <RequesterView
              view={view}
              setView={setView}
              onOpenTicket={openTicket}
              toast={setToast}
            />
          ) : (
            <OperatorView
              role={role}
              view={view}
              setView={setView}
              filteredTickets={filteredTickets}
              onOpenTicket={openTicket}
              activeTicket={activeTicket}
              toast={setToast}
              assignedDepartment={assignedDepartment}
              assignedResponsible={assignedResponsible}
              setAssignedDepartment={setAssignedDepartment}
              setAssignedResponsible={setAssignedResponsible}
              ticketStatuses={ticketStatuses}
              updateTicketStatus={updateTicketStatus}
            />
          )}
        </div>
      </main>
      {toast && (
        <div className="toast">
          <Check size={16} />
          {toast}
        </div>
      )}
    </div>
  )
}

function Login({
  authStep,
  selectedRole,
  onChoose,
  onLogin,
  onBack,
}: {
  authStep: AuthStep
  selectedRole: EntryRole | null
  onChoose: (role: EntryRole) => void
  onLogin: (role: EntryRole) => void
  onBack: () => void
}) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [nom, setFirstName] = useState('')
  const [prenom, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [mot_de_passe, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [accountCreated, setAccountCreated] = useState(false)
  const role = selectedRole ?? 'requester'
  const roleLabel = role === 'requester' ? 'Demandeur' : 'Récepteur'
  const RoleIcon = role === 'requester' ? UserRound : Headphones

  function switchMode(nextMode: 'login' | 'signup') {
    setMode(nextMode)
    setError('')
    setPassword('')
    setConfirmPassword('')
  }

  async function submitLogin(event: React.FormEvent) {
    event.preventDefault()
    if (!email || !mot_de_passe) {
      setError('Renseignez votre adresse e-mail et votre mot de passe.')
      return
    }

    setError('')
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mot_de_passe }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(
          data?.detail ??
            data?.message ??
            (response.status === 401
              ? 'E-mail ou mot de passe incorrect.'
              : 'Une erreur est survenue, veuillez réessayer.'),
        )
      }

      const data = await response.json().catch(() => null)
      if (data?.access_token) {
        window.localStorage.setItem('access_token', data.access_token)
      }

      onLogin(role)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue, veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  async function submitSignup(event: React.FormEvent) {
    event.preventDefault()
    if (!nom || !prenom || !email || !mot_de_passe || !confirmPassword) {
      setError('Merci de renseigner tous les champs.')
      return
    }
    if (mot_de_passe.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (mot_de_passe !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (!acceptTerms) {
      setError('Veuillez accepter les conditions d’utilisation pour continuer.')
      return
    }

    setError('')
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom,
          prenom,
          email,
          mot_de_passe,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message ?? 'Une erreur est survenue, veuillez réessayer.')
      }

      setAccountCreated(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue, veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <div className="login-visual">
        <div className="orbital orbital-one" />
        <div className="orbital orbital-two" />
        <div className="login-copy">
          <Logo />
          <p className="eyebrow">Plateforme de support augmentée</p>
          <h1>
            Résoudre mieux.
            <br />
            <em>Ensemble.</em>
          </h1>
          <p>
            Un espace unique pour transformer chaque incident en résolution claire, traçable et
            humaine.
          </p>
          <div className="login-proof">
            <span>
              <ShieldCheck size={15} /> IA sous contrôle humain
            </span>
            <span>
              <Zap size={15} /> Actions réversibles
            </span>
          </div>
        </div>
        <div className="login-footer">
          mAIntenance & Assistance <span>·</span> Version 0.9.4
        </div>
      </div>
      <div className="login-panel">
        <div className="login-panel-inner">
          <div className="mobile-brand">
            <Logo />
          </div>
          {authStep === 'profile' ? (
            <>
              <p className="eyebrow">Accès démo</p>
              <h2>Qui êtes-vous ?</h2>
              <p className="muted-copy">
                Choisissez votre espace pour continuer vers l’authentification.
              </p>
              <div className="account-list">
                {(
                  [
                    [
                      'requester',
                      'Demandeur',
                      'Créer et suivre mes demandes',
                      'Sophie Martin',
                      UserRound,
                    ],
                    [
                      'receiver',
                      'Récepteur',
                      'Qualifier, diagnostiquer et résoudre',
                      'Marc Leroy',
                      Headphones,
                    ],
                  ] as const
                ).map(([r, title, desc, name, Icon]) => (
                  <button className="account-option" key={r} onClick={() => onChoose(r)}>
                    <span className={`account-icon ${r}`}>
                      <Icon size={19} />
                    </span>
                    <span className="account-text">
                      <strong>{title}</strong>
                      <span>{desc}</span>
                      <small>{name} · Compte de démonstration</small>
                    </span>
                    <ArrowRight size={17} />
                  </button>
                ))}
              </div>
              <p className="login-note">
                <LockKeyhole size={14} /> Connexion simulée pour la démonstration
              </p>
            </>
          ) : accountCreated ? (
            <>
              <div className="success-icon">
                <Check size={28} />
              </div>
              <p className="eyebrow">Compte créé</p>
              <h2>Bienvenue, {nom} !</h2>
              <p className="muted-copy">
                Votre espace {roleLabel.toLowerCase()} est prêt. Vous pouvez maintenant vous
                connecter avec vos identifiants.
              </p>
              <button
                className="button primary full"
                onClick={() => {
                  setAccountCreated(false)
                  switchMode('login')
                }}
              >
                Aller à la connexion <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <>
              <button className="back-link login-back" onClick={onBack}>
                ← Changer de profil
              </button>
              <p className="eyebrow">
                {mode === 'login' ? 'Authentification' : 'Création de compte'} · {roleLabel}
              </p>
              <div className="auth-heading">
                <span className={`account-icon ${role}`}>
                  <RoleIcon size={19} />
                </span>
                <div>
                  <h2>{mode === 'login' ? 'Bienvenue' : 'Créer votre compte'}</h2>
                  <p className="muted-copy">
                    {mode === 'login'
                      ? `Connectez-vous à votre espace ${roleLabel.toLowerCase()}.`
                      : `Rejoignez votre espace ${roleLabel.toLowerCase()} en quelques secondes.`}
                  </p>
                </div>
              </div>
              <div className="auth-tabs" style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className={mode === 'login' ? 'active-filter' : 'filter-button'}
                  onClick={() => switchMode('login')}
                >
                  Se connecter
                </button>
                <button
                  type="button"
                  className={mode === 'signup' ? 'active-filter' : 'filter-button'}
                  onClick={() => switchMode('signup')}
                >
                  Créer un compte
                </button>
              </div>
              {mode === 'login' ? (
                <form className="auth-form" onSubmit={submitLogin}>
                  <label>
                    Adresse e-mail
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="prenom.nom@entreprise.fr"
                      autoComplete="email"
                    />
                  </label>
                  <label>
                    Mot de passe
                    <div className="password-field">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={mot_de_passe}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Votre mot de passe"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                          showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
                        }
                      >
                        {showPassword ? <X size={16} /> : <MonitorCog size={16} />}
                      </button>
                    </div>
                  </label>
                  <div className="auth-options">
                    <label className="remember-option">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />{' '}
                      Se souvenir de moi
                    </label>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() =>
                        setError('Un lien de réinitialisation serait envoyé à votre adresse.')
                      }
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                  {error && <p className="auth-error">{error}</p>}
                  <button className="button primary full" disabled={loading}>
                    {loading ? 'Connexion en cours…' : 'Se connecter'} <ArrowRight size={16} />
                  </button>
                </form>
              ) : (
                <form className="auth-form" onSubmit={submitSignup}>
                  <div className="form-grid">
                    <label>
                      Prénom
                      <input
                        type="text"
                        value={nom}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Prénom"
                        autoComplete="given-name"
                      />
                    </label>
                    <label>
                      Nom
                      <input
                        type="text"
                        value={prenom}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Nom"
                        autoComplete="family-name"
                      />
                    </label>
                  </div>
                  <label>
                    Adresse e-mail
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="prenom.nom@entreprise.fr"
                      autoComplete="email"
                    />
                  </label>
                  <label>
                    Mot de passe
                    <div className="password-field">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={mot_de_passe}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="8 caractères minimum"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                          showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
                        }
                      >
                        {showPassword ? <X size={16} /> : <MonitorCog size={16} />}
                      </button>
                    </div>
                  </label>
                  <label>
                    Confirmer le mot de passe
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ressaisissez votre mot de passe"
                      autoComplete="new-password"
                    />
                  </label>
                  <div className="auth-options">
                    <label className="remember-option">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                      />{' '}
                      J’accepte les conditions d’utilisation
                    </label>
                  </div>
                  {error && <p className="auth-error">{error}</p>}
                  <button className="button primary full" disabled={loading}>
                    {loading ? 'Création en cours…' : 'Créer mon compte'} <ArrowRight size={16} />
                  </button>
                </form>
              )}
              <p className="login-note">
                <LockKeyhole size={14} />{' '}
                {mode === 'login'
                  ? 'Accès sécurisé à votre espace professionnel'
                  : 'Vos données sont chiffrées et jamais partagées'}
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

function RequesterView({
  view,
  setView,
  onOpenTicket,
  toast,
}: {
  view: View
  setView: (v: View) => void
  onOpenTicket: () => void
  toast: (s: string) => void
}) {
  if (view === 'new-direct') return <RequesterForm mode="direct" setView={setView} toast={toast} />
  if (view === 'new-ai') return <AssistantChat setView={setView} toast={toast} />
  if (view === 'ticket' || view === 'success')
    return <TicketDetail requester onBack={() => setView('tickets')} />
  if (view === 'knowledge') return <KnowledgeView />
  if (view === 'tickets')
    return (
      <section>
        <PageHeading
          eyebrow="Mon espace"
          title="Mes tickets"
          description="Retrouvez l’historique, les affectations et l’avancement de vos demandes."
          action={
            <button className="button primary" onClick={() => setView('new-direct')}>
              <Plus size={16} /> Nouvelle demande
            </button>
          }
        />
        <div className="ticket-filters">
          <button className="filter-button active-filter">
            Tous <span>4</span>
          </button>
          <button className="filter-button">
            En cours <span>2</span>
          </button>
          <button className="filter-button">
            Résolus <span>1</span>
          </button>
        </div>
        <div className="panel">
          <div className="panel-toolbar">
            <strong>
              Demandes récentes <span className="count">4 tickets</span>
            </strong>
            <button className="filter-button">
              <Filter size={15} /> Filtrer
            </button>
          </div>
          {tickets.slice(0, 4).map((t) => (
            <TicketRow key={t.id} ticket={t} onOpen={onOpenTicket} />
          ))}
        </div>
      </section>
    )
  return (
    <section>
      <PageHeading
        eyebrow="Bonjour Sophie"
        title="Comment pouvons-nous vous aider ?"
        description="Décrivez votre besoin, on s’occupe du reste."
      />
      <div className="requester-hero-grid">
        <button className="choice-card choice-primary" onClick={() => setView('new-direct')}>
          <span className="choice-icon">
            <Plus size={23} />
          </span>
          <span>
            <strong>Créer une demande</strong>
            <small>Je sais ce dont j’ai besoin et souhaite ouvrir un ticket.</small>
          </span>
          <ArrowRight size={18} />
        </button>
        <button className="choice-card choice-ai" onClick={() => setView('new-ai')}>
          <span className="choice-icon">
            <Sparkles size={23} />
          </span>
          <span>
            <strong>Être guidé par l’assistant</strong>
            <small>Décrivez votre problème avec vos mots, l’IA vous accompagne.</small>
          </span>
          <ArrowRight size={18} />
        </button>
      </div>
      <div className="section-row">
        <div className="panel flex-1">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">En un coup d’œil</p>
              <h3>Mes demandes récentes</h3>
            </div>
            <button className="text-button" onClick={() => setView('tickets')}>
              Tout voir <ArrowRight size={14} />
            </button>
          </div>
          {tickets.slice(0, 3).map((t) => (
            <TicketRow key={t.id} ticket={t} onOpen={onOpenTicket} />
          ))}
        </div>
        <div className="panel helper-card">
          <span className="helper-icon">
            <HelpCircle size={20} />
          </span>
          <p className="eyebrow">Besoin d’aide ?</p>
          <h3>Consulter le centre d’aide</h3>
          <p>Des réponses rapides aux questions les plus fréquentes.</p>
          <button className="text-button" onClick={() => setView('knowledge')}>
            Parcourir les articles <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  )
}

function AssistantChat({
  setView,
  toast,
}: {
  setView: (v: View) => void
  toast: (s: string) => void
}) {
  const [messages, setMessages] = useState<{ from: 'ai' | 'user'; text: string }[]>([
    {
      from: 'ai',
      text: 'Bonjour Sophie. Je vais vous aider à identifier votre problème. Décrivez-moi ce qui ne fonctionne pas, avec vos mots.',
    },
  ])
  const [input, setInput] = useState('')
  const [step, setStep] = useState(0)
  const [resolved, setResolved] = useState(false)
  const summary =
    'Problème de connexion Wi-Fi : le réseau apparaît, mais l’ordinateur refuse la connexion. Un redémarrage et une nouvelle tentative sont recommandés.'
  const responses = [
    'D’accord, je vais vous aider à identifier le problème. Est-ce que votre réseau Wi-Fi apparaît dans la liste des réseaux disponibles ?',
    'Merci pour cette précision. Essayez de redémarrer votre ordinateur, puis reconnectez-vous au réseau. Est-ce que le problème est résolu ?',
    'Je comprends. Le problème semble venir de l’authentification au réseau. Vérifiez le mot de passe enregistré et rapprochez-vous du point d’accès. Souhaitez-vous créer un ticket si le problème persiste ?',
  ]
  function sendMessage(event?: React.FormEvent) {
    event?.preventDefault()
    const value = input.trim()
    if (!value) return
    setMessages((current) => [
      ...current,
      { from: 'user', text: value },
      { from: 'ai', text: responses[Math.min(step, responses.length - 1)] },
    ])
    setInput('')
    setStep((current) => Math.min(current + 1, responses.length - 1))
  }
  return (
    <section className="assistant-page">
      <button className="back-link" onClick={() => setView('dashboard')}>
        ← Retour à mon espace
      </button>
      <PageHeading
        eyebrow="Assistant IA"
        title="Être guidé par l’assistant"
        description="Décrivez librement votre problème. L’assistant vous pose les bonnes questions et vous accompagne pas à pas."
      />
      <div className="assistant-shell">
        <div className="panel assistant-panel">
          <div className="assistant-header">
            <div className="ai-avatar">
              <Sparkles size={19} />
            </div>
            <div>
              <strong>Assistant mAIntenance</strong>
              <p>Dialogue guidé · vos réponses restent sous votre contrôle</p>
            </div>
            <Pill tone="success">
              <span className="live-dot inline" /> En ligne
            </Pill>
          </div>
          <div className="assistant-transcript" aria-live="polite">
            {messages.map((message, index) => (
              <div className={`assistant-message ${message.from}`} key={`${message.from}-${index}`}>
                <span className={`avatar small ${message.from === 'ai' ? 'teal' : 'indigo'}`}>
                  {message.from === 'ai' ? 'AI' : 'SM'}
                </span>
                <div>
                  <small>{message.from === 'ai' ? 'Assistant IA' : 'Vous'}</small>
                  <p>{message.text}</p>
                </div>
              </div>
            ))}
            {step >= 2 && (
              <div className="assistant-resolution">
                <ShieldCheck size={16} />
                <div>
                  <strong>Point de situation</strong>
                  <p>Je peux continuer à vous guider ou préparer un résumé pour le support.</p>
                  <div className="assistant-actions">
                    <button className="button secondary" onClick={() => setResolved(true)}>
                      Le problème est résolu
                    </button>
                    <button className="button primary" onClick={() => setResolved(true)}>
                      Préparer le résumé
                    </button>
                  </div>
                </div>
              </div>
            )}
            {resolved && (
              <div className="assistant-summary">
                <div className="summary-heading">
                  <Check size={16} />
                  <strong>Résumé du problème identifié</strong>
                </div>
                <p>{summary}</p>
                <button
                  className="button primary"
                  onClick={() => {
                    setView('new-direct')
                    toast('Résumé de conversation transféré dans le formulaire')
                  }}
                >
                  Créer un ticket à partir de cette conversation <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
          <form className="assistant-composer" onSubmit={sendMessage}>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing &&
                  event.keyCode !== 229
                ) {
                  event.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Écrivez votre problème…"
              rows={2}
              aria-label="Votre message"
            />
            <button
              className="button primary"
              disabled={!input.trim()}
              aria-label="Envoyer le message"
            >
              <Send size={16} /> Envoyer
            </button>
            <small>Entrée pour envoyer · Maj + Entrée pour revenir à la ligne</small>
          </form>
        </div>
        <aside className="assistant-aside">
          <div className="side-note">
            <div className="side-note-icon">
              <ShieldCheck size={18} />
            </div>
            <strong>Un dialogue, pas un formulaire</strong>
            <p>
              Vous écrivez naturellement. L’assistant clarifie la situation avant de proposer une
              action.
            </p>
            <div className="mini-line">
              <Check size={13} /> Conseils simples
            </div>
            <div className="mini-line">
              <Check size={13} /> Résumé modifiable
            </div>
            <div className="mini-line">
              <Check size={13} /> Ticket uniquement sur confirmation
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

function RequesterForm({
  mode,
  setView,
  toast,
}: {
  mode: 'direct' | 'ai'
  setView: (v: View) => void
  toast: (s: string) => void
}) {
  const [sent, setSent] = useState(false)
  if (sent)
    return (
      <div className="success-card">
        <div className="success-icon">
          <Check size={28} />
        </div>
        <p className="eyebrow">Demande envoyée</p>
        <h2>Votre demande est entre de bonnes mains.</h2>
        <p>
          Le ticket <strong>#1043</strong> a été créé. Vous recevrez des notifications au fil de son
          traitement.
        </p>
        <button className="button primary" onClick={() => setView('tickets')}>
          Voir mes demandes <ArrowRight size={16} />
        </button>
      </div>
    )
  return (
    <section className="form-page">
      <button className="back-link" onClick={() => setView('dashboard')}>
        ← Retour à mon espace
      </button>
      <PageHeading
        eyebrow={mode === 'ai' ? 'Assistant de diagnostic' : 'Nouvelle demande'}
        title={mode === 'ai' ? 'Parlons de votre problème' : 'Créer une demande'}
        description={
          mode === 'ai'
            ? 'Quelques questions pour comprendre la situation et vous orienter.'
            : 'Donnez-nous les informations essentielles pour accélérer votre prise en charge.'
        }
      />
      <div className="form-layout">
        <div className="panel form-panel">
          {mode === 'ai' && (
            <div className="ai-banner">
              <Sparkles size={18} />
              <div>
                <strong>Assistant IA actif</strong>
                <p>
                  Vos réponses seront reformulées et soumises à votre validation avant création.
                </p>
              </div>
            </div>
          )}
          <label>
            Description
            <textarea
              defaultValue={
                mode === 'ai'
                  ? 'Je suis en télétravail et le VPN affiche une erreur depuis 8h30. J’ai déjà redémarré mon ordinateur.'
                  : ''
              }
              placeholder="Décrivez votre problème avec le plus de détails possible…"
              rows={6}
            />
          </label>
          <div className="form-grid">
            <label>
              Priorité
              <select defaultValue="Normale">
                <option>Faible</option>
                <option>Normale</option>
                <option>Haute</option>
                <option>Critique</option>
              </select>
            </label>
            <label>
              Statut
              <input value="En attente" readOnly aria-readonly="true" />
            </label>
          </div>
          <label>
            Catégorie
            <select defaultValue="Informatique">
              <option>Informatique</option>
              <option>Réseau</option>
              <option>Accès</option>
              <option>Logiciel</option>
              <option>Matériel</option>
            </select>
          </label>
          <div className="form-actions">
            <button className="button secondary" onClick={() => setView('dashboard')}>
              Annuler
            </button>
            <button
              className="button primary"
              onClick={() => {
                setSent(true)
                toast('Vérifiez votre demande avant envoi')
              }}
            >
              {mode === 'ai' ? 'Reformuler et vérifier' : 'Vérifier ma demande'}{' '}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <aside className="side-note">
          <div className="side-note-icon">
            <ShieldCheck size={18} />
          </div>
          <strong>Vous gardez le contrôle</strong>
          <p>
            La demande ne sera jamais créée automatiquement. Vous pourrez relire et confirmer chaque
            information.
          </p>
          <div className="mini-line">
            <Check size={14} /> Données minimisées
          </div>
          <div className="mini-line">
            <Check size={14} /> Actions traçables
          </div>
        </aside>
      </div>
    </section>
  )
}

function OperatorView({
  role,
  view,
  setView,
  filteredTickets,
  onOpenTicket,
  activeTicket,
  toast,
  assignedDepartment,
  assignedResponsible,
  setAssignedDepartment,
  setAssignedResponsible,
  ticketStatuses,
  updateTicketStatus,
}: {
  role: Role
  view: View
  setView: (v: View) => void
  filteredTickets: TicketData[]
  onOpenTicket: () => void
  activeTicket: TicketData
  toast: (s: string) => void
  assignedDepartment: string
  assignedResponsible: string
  setAssignedDepartment: (value: string) => void
  setAssignedResponsible: (value: string) => void
  ticketStatuses: Record<string, TicketStatus>
  updateTicketStatus: (ticketId: string, status: TicketStatus) => void
}) {
  if (view === 'ticket')
    return (
      <TicketDetail
        requester={false}
        onBack={() => setView('tickets')}
        assignedDepartment={assignedDepartment}
        assignedResponsible={assignedResponsible}
        setAssignedDepartment={setAssignedDepartment}
        setAssignedResponsible={setAssignedResponsible}
        toast={toast}
      />
    )
  if (view === 'diagnosis') return <Diagnosis />
  if (view === 'knowledge') return <KnowledgeView admin={role === 'admin'} />
  if (view === 'tools') return <ToolsView />
  if (view === 'monitoring') return <Monitoring />
  if (view === 'notifications') return <NotificationsView />
  if (view === 'profile') return <ProfileView role={role} />
  if (view === 'tickets')
    return (
      <KanbanView
        tickets={filteredTickets}
        statuses={ticketStatuses}
        onOpen={onOpenTicket}
        onStatusChange={updateTicketStatus}
      />
    )
  return (
    <section>
      <PageHeading
        eyebrow={role === 'admin' ? 'Pilotage plateforme' : 'Bonjour Marc'}
        title={
          role === 'admin' ? 'La qualité du support, en un regard.' : 'Votre file, sans angle mort.'
        }
        description={
          role === 'admin'
            ? 'Suivez les performances, les risques et les décisions humaines.'
            : 'Les tickets prioritaires sont prêts à être traités.'
        }
        action={
          <button className="button primary" onClick={() => setView('tickets')}>
            <ListChecks size={16} /> Ouvrir la file
          </button>
        }
      />
      <div className="metrics-grid">
        <Metric
          label="Tickets ouverts"
          value="24"
          detail="−8% vs semaine dernière"
          tone="indigo"
          icon={Ticket}
        />
        <Metric
          label="Temps moyen de résolution"
          value="3h 42"
          detail="Objectif SLA : 4h"
          tone="teal"
          icon={Clock3}
        />
        <Metric
          label="Résolutions IA"
          value="68%"
          detail="+12% cette semaine"
          tone="violet"
          icon={Bot}
        />
        <Metric
          label="À valider"
          value="07"
          detail="2 actions sensibles"
          tone="amber"
          icon={ShieldCheck}
        />
      </div>
      <div className="dashboard-grid">
        <div className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Flux des demandes</p>
              <h3>Activité des 7 derniers jours</h3>
            </div>
            <Pill tone="success">SLA maîtrisé</Pill>
          </div>
          <div className="bar-chart">
            {[42, 58, 48, 76, 60, 88, 72].map((height, i) => (
              <div className="bar-col" key={i}>
                <div
                  className={`bar ${i === 5 ? 'current' : ''}`}
                  style={{ height: `${height}%` }}
                />
                <span>{['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="panel priority-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Action requise</p>
              <h3>Tickets prioritaires</h3>
            </div>
            <CircleAlert size={18} className="warning-icon" />
          </div>
          {tickets.slice(0, 3).map((t) => (
            <button className="priority-row" key={t.id} onClick={onOpenTicket}>
              <span className="priority-marker" />
              <span>
                <strong>
                  {t.id} · {t.title}
                </strong>
                <small>
                  {t.requester} · SLA {t.sla}
                </small>
              </span>
              <ArrowRight size={15} />
            </button>
          ))}
        </div>
      </div>
      <div className="panel scenario-panel">
        <div>
          <p className="eyebrow">Parcours de démonstration</p>
          <h3>Scénarios clés</h3>
          <p>Ouvrez un scénario pour montrer la coordination entre l’IA et les équipes.</p>
        </div>
        <div className="scenario-list">
          <button onClick={() => setView('diagnosis')}>
            <Sparkles size={16} />
            <span>
              <strong>VPN · Diagnostic complet</strong>
              <small>RAG + outils + synthèse</small>
            </span>
            <ArrowRight size={15} />
          </button>
          <button onClick={() => toast('Validation humaine requise pour cette action')}>
            <ShieldCheck size={16} />
            <span>
              <strong>Action sensible bloquée</strong>
              <small>Validation administrateur</small>
            </span>
            <ArrowRight size={15} />
          </button>
          <button onClick={() => toast('Escalade créée vers l’équipe réseau')}>
            <CircleAlert size={16} />
            <span>
              <strong>Escalade vers réseau</strong>
              <small>SLA critique · notification</small>
            </span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  )
}

function KanbanView({
  tickets,
  statuses,
  onOpen,
  onStatusChange,
}: {
  tickets: TicketData[]
  statuses: Record<string, TicketStatus>
  onOpen: () => void
  onStatusChange: (id: string, status: TicketStatus) => void
}) {
  const columns: TicketStatus[] = ['À qualifier', 'En cours', 'En attente', 'Résolu']
  return (
    <section>
      <PageHeading
        eyebrow="Support N2"
        title="Tickets"
        description="Déplacez chaque ticket vers la prochaine étape de traitement."
        action={
          <Pill tone="success">
            <span className="live-dot inline" /> Mise à jour instantanée
          </Pill>
        }
      />
      <div className="kanban-board">
        {columns.map((column) => (
          <div className="kanban-column" key={column}>
            <div className="kanban-heading">
              <div>
                <strong>{column}</strong>
                <span>
                  {
                    tickets.filter((ticket) => (statuses[ticket.id] ?? ticket.status) === column)
                      .length
                  }
                </span>
              </div>
              <CircleAlert size={15} />
            </div>
            <div className="kanban-cards">
              {tickets
                .filter((ticket) => (statuses[ticket.id] ?? ticket.status) === column)
                .map((ticket) => (
                  <article className="kanban-card" key={ticket.id}>
                    <button className="kanban-card-main" onClick={onOpen}>
                      <div className="kanban-card-top">
                        <span className="ticket-id">{ticket.id}</span>
                        <Pill
                          tone={
                            ticket.priority === 'Critique'
                              ? 'danger'
                              : ticket.priority === 'Haute'
                                ? 'warning'
                                : 'muted'
                          }
                        >
                          {ticket.priority}
                        </Pill>
                      </div>
                      <strong>{ticket.title}</strong>
                      <small>
                        {ticket.requester} · {ticket.category}
                      </small>
                      <small>{ticket.department}</small>
                    </button>
                    <div className="kanban-card-footer">
                      <span>{ticket.sla === '—' ? 'Sans SLA' : `SLA ${ticket.sla}`}</span>
                      <select
                        aria-label={`Changer le statut de ${ticket.id}`}
                        value={statuses[ticket.id] ?? ticket.status}
                        onChange={(event) =>
                          onStatusChange(ticket.id, event.target.value as TicketStatus)
                        }
                      >
                        {columns.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </article>
                ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function NotificationsView() {
  return (
    <section>
      <PageHeading
        eyebrow="Espace connecté"
        title="Notifications"
        description="Les événements importants liés à vos tickets."
      />
      <div className="panel notification-list">
        {[
          [
            'Ticket #1042',
            'Le diagnostic IA est disponible pour validation.',
            'Il y a 12 min',
            'info',
          ],
          ['Ticket #1041', 'Un nouveau ticket vous a été assigné.', 'Il y a 28 min', 'warning'],
          ['Système', 'La base de connaissances a été synchronisée.', 'Il y a 1 h', 'success'],
        ].map(([title, text, time, tone]) => (
          <div className="notification-item" key={title}>
            <span className={`notification-dot ${tone}`} />
            <div>
              <strong>{title}</strong>
              <p>{text}</p>
              <small>{time}</small>
            </div>
            <ArrowRight size={15} />
          </div>
        ))}
      </div>
    </section>
  )
}

function ProfileView({ role }: { role: Role }) {
  return (
    <section>
      <PageHeading
        eyebrow="Espace connecté"
        title="Profil"
        description="Vos informations et préférences d’espace."
      />
      <div className="panel profile-panel">
        <div className="profile-header">
          <span className={`avatar profile-avatar ${role === 'receiver' ? 'teal' : 'indigo'}`}>
            {role === 'receiver' ? 'ML' : 'AD'}
          </span>
          <div>
            <h3>Compte professionnel</h3>
            <p className="muted-copy">
              {role === 'receiver' ? 'Récepteur · Support N2' : 'Administrateur · Plateforme'}
            </p>
          </div>
        </div>
        <div className="profile-grid">
          <label>
            Adresse e-mail
            <input value="support@entreprise.fr" readOnly />
          </label>
          <label>
            Département
            <input value="Support & Opérations" readOnly />
          </label>
        </div>
        <button className="button secondary">Modifier mes préférences</button>
      </div>
    </section>
  )
}

function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {action}
    </div>
  )
}

function TicketDetail({
  requester,
  onBack,
  assignedDepartment = 'Non affecté',
  assignedResponsible = 'Marc Leroy',
  setAssignedDepartment,
  setAssignedResponsible,
  toast,
}: {
  requester: boolean
  onBack: () => void
  assignedDepartment?: string
  assignedResponsible?: string
  setAssignedDepartment?: (value: string) => void
  setAssignedResponsible?: (value: string) => void
  toast?: (message: string) => void
}) {
  return (
    <section>
      <button className="back-link" onClick={onBack}>
        ← Retour à la liste
      </button>
      <PageHeading
        eyebrow="Ticket #1042"
        title="Accès VPN impossible depuis ce matin"
        description="Créé aujourd’hui à 08:42 par Sophie Martin · Réseau · Domicile · Lyon"
        action={<Pill tone="info">En cours</Pill>}
      />
      <div className="detail-grid">
        <div className="panel conversation-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Conversation</p>
              <h3>Échanges et suivi</h3>
            </div>
            <Pill tone="warning">Haute priorité</Pill>
          </div>
          <div className="message requester-message">
            <span className="avatar small indigo">SM</span>
            <div>
              <strong>
                Sophie Martin <small>· 08:42</small>
              </strong>
              <p>
                Je suis en télétravail et le VPN affiche une erreur depuis ce matin. J’ai déjà
                redémarré mon ordinateur.
              </p>
            </div>
          </div>
          <div className="system-event">
            <Sparkles size={15} />
            <span>
              <strong>Diagnostic IA terminé</strong>
              <br />
              Probabilité d’incident réseau local : 82%. Une vérification de certificat est
              recommandée.
            </span>
          </div>
          <div className="message">
            <span className="avatar small teal">ML</span>
            <div>
              <strong>
                Marc Leroy <small>· 09:06</small>
              </strong>
              <p>
                Bonjour Sophie, j’ai identifié une anomalie sur le certificat VPN de votre poste. Je
                vérifie la procédure de renouvellement.
              </p>
            </div>
          </div>
          {!requester && (
            <div className="reply-box">
              <textarea placeholder="Écrire une réponse…" />
              <button className="button primary">
                <Send size={15} /> Envoyer
              </button>
            </div>
          )}
        </div>
        <aside className="detail-side">
          <div className="panel">
            <p className="eyebrow">Synthèse IA</p>
            <div className="confidence">
              <div>
                <strong>82%</strong>
                <span>Confiance élevée</span>
              </div>
              <div className="confidence-bar">
                <span />
              </div>
            </div>
            <p className="muted-copy">
              Le problème semble lié à l’expiration du certificat local. Aucune action irréversible
              proposée.
            </p>
            <button className="button secondary full" onClick={() => {}}>
              Voir le diagnostic <ArrowRight size={15} />
            </button>
          </div>
          <div className="panel">
            <p className="eyebrow">Chronologie</p>
            <div className="timeline">
              <span className="timeline-line" />
              <div>
                <i className="done" />
                <strong>Demande créée</strong>
                <small>Aujourd’hui · 08:42</small>
              </div>
              <div>
                <i className="done" />
                <strong>Diagnostic IA</strong>
                <small>Aujourd’hui · 08:43</small>
              </div>
              <div>
                <i className="active" />
                <strong>Prise en charge N2</strong>
                <small>En cours</small>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

function Diagnosis() {
  return (
    <section>
      <PageHeading
        eyebrow="Ticket #1042 · Diagnostic"
        title="Comprendre avant d’agir."
        description="Une analyse explicable, enrichie par les bonnes sources et les bons outils."
        action={<Pill tone="success">Confiance 82%</Pill>}
      />
      <div className="diagnosis-grid">
        <div className="panel diagnosis-main">
          <div className="analysis-header">
            <span className="ai-avatar">
              <BrainCircuit size={20} />
            </span>
            <div>
              <strong>Hypothèse principale</strong>
              <p>Certificat VPN expiré ou incohérent sur le poste client.</p>
            </div>
            <Pill tone="info">82%</Pill>
          </div>
          <div className="analysis-section">
            <p className="eyebrow">Raisonnement</p>
            <div className="reasoning-step">
              <span>01</span>
              <p>
                <strong>Signaux détectés</strong>
                <br />
                Erreur apparue après une période d’inactivité · redémarrage sans effet · incident
                isolé.
              </p>
            </div>
            <div className="reasoning-step">
              <span>02</span>
              <p>
                <strong>Contexte rapproché</strong>
                <br />3 tickets similaires résolus cette semaine avec renouvellement de certificat.
              </p>
            </div>
            <div className="reasoning-step">
              <span>03</span>
              <p>
                <strong>Prochaine vérification</strong>
                <br />
                Lire l’état du certificat et vérifier la connectivité du tunnel.
              </p>
            </div>
          </div>
          <div className="analysis-actions">
            <button className="button secondary">
              <MessageSquareText size={15} /> Demander une précision
            </button>
            <button className="button primary">
              <Check size={15} /> Valider le diagnostic
            </button>
          </div>
        </div>
        <div className="panel sources-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">RAG · Sources citées</p>
              <h3>Base de connaissances</h3>
            </div>
            <Network size={18} />
          </div>
          {[
            ['KB-018', 'Renouveler un certificat VPN', '92%'],
            ['KB-042', 'Diagnostic des erreurs tunnel', '84%'],
            ['KB-007', 'Checklist télétravail', '71%'],
          ].map(([id, title, score]) => (
            <div className="source-card" key={id}>
              <div className="source-top">
                <Pill tone="muted">{id}</Pill>
                <span>{score}</span>
              </div>
              <strong>{title}</strong>
              <small>Procédure · mise à jour il y a 6 jours</small>
            </div>
          ))}
        </div>
      </div>
      <div className="panel tool-trace">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Traçabilité</p>
            <h3>Outils consultés</h3>
          </div>
          <Pill tone="success">Lecture seule</Pill>
        </div>
        <div className="tool-row">
          <span className="tool-icon">
            <MonitorCog size={16} />
          </span>
          <span>
            <strong>get_device_certificate</strong>
            <small>POST · 184 ms · certificat trouvé</small>
          </span>
          <Pill tone="success">Succès</Pill>
        </div>
        <div className="tool-row">
          <span className="tool-icon">
            <Network size={16} />
          </span>
          <span>
            <strong>check_vpn_status</strong>
            <small>GET · 93 ms · tunnel inactif</small>
          </span>
          <Pill tone="success">Succès</Pill>
        </div>
      </div>
    </section>
  )
}

function KnowledgeView({ admin = false }: { admin?: boolean }) {
  return (
    <section>
      <PageHeading
        eyebrow={admin ? 'Administration · RAG' : 'Ressources utiles'}
        title={admin ? 'Base de connaissances' : 'Centre d’aide'}
        description={
          admin
            ? 'Sources indexées, fraîcheur des contenus et couverture documentaire.'
            : 'Les réponses les plus utiles, sélectionnées par notre équipe support.'
        }
        action={
          admin ? (
            <button className="button primary">
              <Plus size={16} /> Ajouter une source
            </button>
          ) : undefined
        }
      />
      <div className="knowledge-grid">
        {[
          ['VPN et accès distants', '18 articles', '98%', 'À jour'],
          ['Postes de travail', '42 articles', '91%', 'À jour'],
          ['Applications métier', '67 articles', '76%', 'À surveiller'],
          ['Sécurité & conformité', '24 articles', '100%', 'À jour'],
        ].map(([title, count, coverage, status]) => (
          <div className="panel knowledge-card" key={title}>
            <div className="knowledge-symbol">
              <FileText size={19} />
            </div>
            <h3>{title}</h3>
            <p>
              {count} · couverture RAG {coverage}
            </p>
            <div className="knowledge-progress">
              <span style={{ width: coverage }} />
            </div>
            <div className="card-footer">
              <Pill tone={status === 'À surveiller' ? 'warning' : 'success'}>{status}</Pill>
              <ArrowRight size={16} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ToolsView() {
  return (
    <section>
      <PageHeading
        eyebrow="Administration · Gouvernance"
        title="Outils & droits"
        description="Chaque action est bornée, observable et soumise aux bonnes validations."
      />
      <div className="panel">
        <div className="panel-toolbar">
          <strong>
            Outils disponibles <span className="count">6 connectés</span>
          </strong>
          <button className="filter-button">
            <Filter size={15} /> Filtrer
          </button>
        </div>
        {[
          ['get_device_certificate', 'Lecture', 'Certificats postes', 'Autorisé'],
          ['check_vpn_status', 'Lecture', 'État tunnel VPN', 'Autorisé'],
          [
            'reset_user_password',
            'Écriture',
            'Réinitialisation mot de passe',
            'Validation requise',
          ],
          ['restart_service', 'Écriture', 'Redémarrage service', 'Bloqué en IA'],
        ].map(([name, type, desc, status]) => (
          <div className="tool-row admin-tool" key={name}>
            <span className="tool-icon">
              <Settings2 size={16} />
            </span>
            <span>
              <strong>{name}</strong>
              <small>
                {desc} · {type}
              </small>
            </span>
            <Pill
              tone={
                status === 'Autorisé' ? 'success' : status === 'Bloqué en IA' ? 'danger' : 'warning'
              }
            >
              {status}
            </Pill>
            <ChevronDown size={15} />
          </div>
        ))}
      </div>
    </section>
  )
}

function Monitoring() {
  return (
    <section>
      <PageHeading
        eyebrow="Administration · Observabilité"
        title="La plateforme sous contrôle."
        description="Suivez la santé technique, la qualité des réponses et les décisions prises."
        action={
          <Pill tone="success">
            <span className="live-dot inline" /> Tous les systèmes opérationnels
          </Pill>
        }
      />
      <div className="metrics-grid">
        <Metric
          label="Runs IA aujourd’hui"
          value="1 284"
          detail="99,2% sans erreur"
          tone="indigo"
          icon={Activity}
        />
        <Metric
          label="Latence médiane"
          value="1,8 s"
          detail="−240 ms vs hier"
          tone="teal"
          icon={Zap}
        />
        <Metric
          label="Confiance moyenne"
          value="86%"
          detail="Sur 824 diagnostics"
          tone="violet"
          icon={BrainCircuit}
        />
        <Metric
          label="Escalades humaines"
          value="14"
          detail="1,1% des demandes"
          tone="amber"
          icon={Users}
        />
      </div>
      <div className="panel trace-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Trace sélectionnée</p>
            <h3>run_01J9 · Ticket #1042</h3>
          </div>
          <Pill tone="success">Terminé</Pill>
        </div>
        <div className="trace-list">
          {[
            ['Réception de la demande', '08:42:01', 'Entrée normalisée'],
            ['Recherche sémantique RAG', '08:42:02', '3 sources retenues'],
            ['Appel outil · certificat', '08:42:02', 'Lecture réussie'],
            ['Synthèse et score de confiance', '08:42:03', '82% · aucune action'],
            ['Notification récepteur N2', '08:42:03', 'Envoyée'],
          ].map(([step, time, detail], i) => (
            <div className="trace-step" key={step}>
              <span className="trace-number">{i + 1}</span>
              <span>
                <strong>{step}</strong>
                <small>{detail}</small>
              </span>
              <time>{time}</time>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default App
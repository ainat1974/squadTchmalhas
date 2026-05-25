import type { Config } from 'tailwindcss'

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        // ─── Surfaces v5 (4 layers de profundidade) ──
        bg: {
          canvas:   'hsl(var(--bg-canvas))',
          card:     'hsl(var(--bg-card))',
          elevated: 'hsl(var(--bg-elevated))',
          sunken:   'hsl(var(--bg-sunken))',
        },
        // ─── Texto (hierarquia v5) ───────────────────
        fg: {
          primary:   'hsl(var(--text-primary))',
          secondary: 'hsl(var(--text-secondary))',
          muted:     'hsl(var(--text-muted))',
          disabled:  'hsl(var(--text-disabled))',
        },
        // ─── Métricas v5 (positivo/negativo neon) ────
        metric: {
          positive:        'hsl(var(--metric-positive))',
          'positive-soft': 'hsl(var(--metric-positive-soft))',
          negative:        'hsl(var(--metric-negative))',
          'negative-soft': 'hsl(var(--metric-negative-soft))',
          neutral:         'hsl(var(--metric-neutral))',
        },
        // ─── Chart palette v5 ────────────────────────
        chart: {
          primary:     'hsl(var(--chart-primary))',
          secondary:   'hsl(var(--chart-secondary))',
          tertiary:    'hsl(var(--chart-tertiary))',
          grid:        'hsl(var(--chart-grid))',
          'axis-text': 'hsl(var(--chart-axis-text))',
        },
        // ─── Techmalhas Brand v5 (gold = primary) ────
        brand: {
          DEFAULT:           '#E79501',     // gold como brand default (era ink no v4 / verde no v3)
          ink:               '#141414',
          'ink-hover':       '#000000',
          paper:             '#FFFFFF',
          gold:              '#E79501',
          'gold-hover':      '#FFA61F',
          'gold-light':      '#FFF5E1',
          sage:              '#869791',
          'sage-hover':      '#6F7F7B',
          'sage-light':      '#EEF2F0',
          terracotta:        '#CC4833',
          'terracotta-hover':'#A83A28',
          'terracotta-light':'#FBE5E0',
          // Aliases v3/v4 de compatibilidade (deprecated, remover em v5.1)
          forest:            '#E79501',     // mapeia para gold (era verde no v3)
          50:                '#FFF5E1',
          100:               '#FFE8B8',
          200:               '#FFD27A',
          300:               '#FFB840',
          400:               '#FFA61F',
          500:               '#E79501',     // bg-brand-500 → gold no v5
          600:               '#C77E00',
          700:               '#9C6300',
          800:               '#704700',
          900:               '#3D2700',
          foreground:        '#141414',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        // ─── shadcn/ui tokens mapeados ────────────────
        border:      'hsl(var(--border))',
        input:       'hsl(var(--input))',
        ring:        'hsl(var(--ring))',
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // ─── Canais de comunicação v5 (lifted dark) ──
        channel: {
          whatsapp:  'hsl(var(--channel-whatsapp))',
          instagram: 'hsl(var(--channel-instagram))',
          webchat:   'hsl(var(--channel-webchat))',
        },
        // Aliases legacy v3/v4 (mantidos para compat de código antigo)
        whatsapp: {
          DEFAULT:    '#25D366',
          dark:       '#064E18',   // WCAG AA para texto (11.2:1)
        },
        instagram: {
          DEFAULT: '#E1306C',
        },
        webchat: {
          DEFAULT: '#3B82F6',
        },
        // ─── Stage colors v5 (Pipeline) ──────────────
        stage: {
          new:             'hsl(var(--stage-new))',
          'new-bg':        'hsl(var(--stage-new-bg))',
          contact:         'hsl(var(--stage-contact))',
          'contact-bg':    'hsl(var(--stage-contact-bg))',
          proposal:        'hsl(var(--stage-proposal))',
          'proposal-bg':   'hsl(var(--stage-proposal-bg))',
          negotiation:     'hsl(var(--stage-negotiation))',
          'negotiation-bg':'hsl(var(--stage-negotiation-bg))',
          won:             'hsl(var(--stage-won))',
          'won-bg':        'hsl(var(--stage-won-bg))',
          lost:            'hsl(var(--stage-lost))',
          'lost-bg':       'hsl(var(--stage-lost-bg))',
        },
        // ─── Action tokens semânticos v5 ─────────────
        action: {
          primary:        'hsl(var(--action-primary))',
          'primary-hover':'hsl(var(--action-primary-hover))',
          success:        'hsl(var(--action-success))',
          warning:        'hsl(var(--action-warning))',
          danger:         'hsl(var(--action-danger))',
          info:           'hsl(var(--action-info))',
        },
      },
      borderColor: {
        sutil:       'var(--border-sutil)',
        strong:      'var(--border-strong)',
        'gold-soft': 'var(--border-gold-soft)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',                  // 0.75rem v5 (era 0.5rem v4)
        lg:      'var(--radius)',
        md:      'calc(var(--radius) - 4px)',
        sm:      'calc(var(--radius) - 6px)',
      },
      fontFamily: {
        sans: ['var(--font-hind)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'IBM Plex Mono', 'monospace'],
      },
      boxShadow: {
        // v4 mantidos
        'gold':       '0 4px 16px -4px rgb(231 149 1 / 0.22), 0 2px 6px -2px rgb(20 20 20 / 0.10)',
        'sage':       '0 4px 14px -4px rgb(134 151 145 / 0.24), 0 1px 3px -1px rgb(20 20 20 / 0.08)',
        'ink-glow':   '0 10px 24px -8px rgb(20 20 20 / 0.32), 0 4px 10px -4px rgb(20 20 20 / 0.18)',
        'terracotta': '0 4px 14px -4px rgb(204 72 51 / 0.24)',
        'gold-lift':  '0 14px 32px -8px rgb(231 149 1 / 0.28), 0 6px 14px -6px rgb(20 20 20 / 0.18)',
        // v5 novas
        'card-hover': '0 8px 24px -8px rgb(231 149 1 / 0.20)',
        'fab':        '0 0 0 1px rgb(255 255 255 / 0.08), 0 8px 24px -8px rgb(231 149 1 / 0.50), 0 4px 8px -2px rgb(0 0 0 / 0.40)',
        'fab-hover':  '0 0 0 1px rgb(255 255 255 / 0.12), 0 14px 36px -10px rgb(231 149 1 / 0.70), 0 6px 12px -4px rgb(0 0 0 / 0.45)',
        'inner-light':'inset 0 1px 0 hsla(0,0%,100%,0.04)',
        'inner-paper':'inset 0 1px 0 hsla(0,0%,100%,0.65)',
      },
      keyframes: {
        // shadcn (mantidos)
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        // v4 mantidos
        'orb-drift':  { '0%, 100%': { transform: 'translate(0,0) scale(1)' }, '50%': { transform: 'translate(20px,-16px) scale(1.06)' } },
        shimmer:      { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
        'pulse-sage': { '0%, 100%': { transform: 'scale(1)', opacity: '1' }, '50%': { transform: 'scale(1.15)', opacity: '0.7' } },
        'ring-pulse': {
          '0%':   { boxShadow: '0 0 0 2px hsl(var(--background)), 0 0 0 4px rgb(231 149 1 / 0.90), 0 0 18px 2px rgb(231 149 1 / 0.45)' },
          '60%':  { boxShadow: '0 0 0 2px hsl(var(--background)), 0 0 0 7px rgb(231 149 1 / 0.30), 0 0 12px 0 rgb(231 149 1 / 0.20)' },
          '100%': { boxShadow: '0 0 0 2px hsl(var(--background)), 0 0 0 4px rgb(231 149 1 / 0.65)' },
        },
        // v5 novas
        'pulse-live': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(61,213,140,0.6)', transform: 'scale(1)' },
          '50%':      { boxShadow: '0 0 0 6px rgba(61,213,140,0)',   transform: 'scale(1.15)' },
        },
        'draw-sparkline': { to: { strokeDashoffset: '0' } },
      },
      animation: {
        'accordion-down':  'accordion-down 0.2s ease-out',
        'accordion-up':    'accordion-up 0.2s ease-out',
        'orb-drift':       'orb-drift 14s ease-in-out infinite',
        shimmer:           'shimmer 1.6s ease-in-out infinite',
        'pulse-sage':      'pulse-sage 1.6s ease-in-out infinite',
        'pulse-live':      'pulse-live 1.6s ease-in-out infinite',
        'ring-pulse':      'ring-pulse 600ms cubic-bezier(0,0,0.2,1) 1',
        'draw-sparkline':  'draw-sparkline 800ms ease-out 200ms forwards',
      },
      transitionDuration: {
        instant: '100ms',
        fast:    '150ms',
        base:    '200ms',
        slow:    '250ms',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config

export default config

/**
 * SPACE_COSMOS preset — the palette, type scale and surfaces of OrbitRelayStation.
 * `name` is kept verbatim from the design document.
 */
export const theme = {
  name: 'SPACE_COSMOS',

  colors: {
    bg: '#050510',
    surface: '#0A0A20',
    surfaceElevated: '#10103A',
    surfaceBoard: '#0A1628',

    primary: '#4169E1',
    primaryDeep: '#2B3FA8',
    secondary: '#7B2FBE',

    textPrimary: '#EAF0FF',
    textSecondary: '#9AA7CC',
    textMuted: '#5C6894',
    textOnPrimary: '#FFFFFF',
    textSoft: '#C8D6FF',

    beam: '#5BE9FF',
    powered: '#46E8A6',
    warning: '#FF7A45',
    critical: '#FF4D4D',
    star: '#F5D77A',
    inert: '#3A4A7A',
    gridLine: '#1B2550',
    locked: '#2A3356',

    border: 'rgba(255,255,255,0.08)',
    borderAccent: 'rgba(65,105,225,0.28)',
    glass: 'rgba(16,16,58,0.62)',
    glassDeep: 'rgba(10,10,32,0.88)',
  },

  radius: { chip: 14, row: 16, tile: 20, card: 18, big: 24, pill: 100 },

  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },

  type: {
    hero: { fontSize: 32, fontWeight: '800' as const, letterSpacing: 5 },
    title: { fontSize: 20, fontWeight: '800' as const, letterSpacing: 2 },
    cta: { fontSize: 17, fontWeight: '800' as const, letterSpacing: 1.6 },
    numeric: { fontSize: 20, fontWeight: '800' as const, letterSpacing: 0.5 },
    body: { fontSize: 14, fontWeight: '600' as const, letterSpacing: 0.3 },
    caption: {
      fontSize: 10,
      fontWeight: '600' as const,
      letterSpacing: 1.6,
    },
  },

  shadow: {
    tile: {
      shadowColor: '#000',
      shadowOpacity: 0.35,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
    primary: {
      shadowColor: '#4169E1',
      shadowOpacity: 0.45,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 10 },
      elevation: 12,
    },
    bar: {
      shadowColor: '#000',
      shadowOpacity: 0.5,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: -4 },
      elevation: 14,
    },
  },

  gradients: {
    loader: ['#050510', '#0A0A20', '#050510'],
    menu: ['#050510', '#10103A', '#0A1628'],
    levels: ['#050510', '#0A1628'],
    game: ['#050510', '#0A1628'],
    panel: ['#0A0A20', '#10103A'],
    win: ['#050510', '#0C2A28', '#050510'],
    lose: ['#050510', '#2A1414', '#050510'],
    primaryButton: ['#4169E1', '#2B3FA8'],
    beamBar: ['#5BE9FF', '#4169E1'],
    progressBar: ['#4169E1', '#5BE9FF'],
  },
};

export type Theme = typeof theme;
export default theme;

/**
 * Traçados SVG copiados do protótipo (objeto `icons` em StayOn.dc.html).
 * Todos desenhados na viewBox 0 0 24 24, sem preenchimento, apenas contorno.
 * Novos ícones são adicionados conforme as telas forem migradas.
 */
export const iconPaths = {
  home: ['M3 10.5 12 3l9 7.5', 'M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5'],
  planner: [
    'M4 5.5h16a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1z',
    'M3 10h18',
    'M8 3v4',
    'M16 3v4',
  ],
  focus: [
    'M8 3H5.5A2.5 2.5 0 0 0 3 5.5V8',
    'M16 3h2.5A2.5 2.5 0 0 1 21 5.5V8',
    'M8 21H5.5A2.5 2.5 0 0 1 3 18.5V16',
    'M16 21h2.5a2.5 2.5 0 0 0 2.5-2.5V16',
    'M12 9.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z',
  ],
  insights: ['M5 21v-8', 'M12 21V6', 'M19 21v-5'],
  profile: [
    'M12 12a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4z',
    'M4.5 21c.6-3.8 3.7-6 7.5-6s6.9 2.2 7.5 6',
  ],
  calendar: [
    'M4 5.5h16a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1z',
    'M3 10h18',
    'M8 3v4',
    'M16 3v4',
  ],
  plus: ['M12 5v14', 'M5 12h14'],
  check: ['m5 12.5 4.5 4.5L19 7.5'],
  play: ['M8.5 5.5v13l10-6.5-10-6.5z'],
} as const;

export type IconName = keyof typeof iconPaths;

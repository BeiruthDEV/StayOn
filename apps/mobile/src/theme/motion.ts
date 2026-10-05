/** Durações de transição do protótipo (em ms). */
export const motion = {
  /** transition .2s — toast, sheet */
  base: 200,
  /** Opacidade aplicada no estado pressionado (`style-active="opacity:.7"`). */
  pressedOpacity: 0.7,
  /** Escala aplicada no toque de botões elevados (`transform:scale(.98)`). */
  pressedScale: 0.98,
  /** Escala aplicada no toque do FAB (`transform:scale(.94)`). */
  pressedScaleStrong: 0.94,
  /** Duração de exibição do toast (setTimeout de 2600ms no protótipo). */
  toastDuration: 2600,
} as const;

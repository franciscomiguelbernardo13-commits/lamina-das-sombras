export interface SaveData {
  gold: number;
  gems: number;
  stage: number;
  weaponLevel: number;
  skills: number[];
}

const KEY = 'lamina-save-v1';
const DEFAULT: SaveData = { gold: 500, gems: 300, stage: 1, weaponLevel: 1, skills: [1, 1, 1] };

function load(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT, ...(JSON.parse(raw) as Partial<SaveData>) };
  } catch { /* ignora */ }
  return { ...DEFAULT, skills: [...DEFAULT.skills] };
}

/** Guarda o progresso no aparelho (localStorage dentro do WebView do app). */
export class SaveService {
  static data: SaveData = load();

  static save(): void {
    try { localStorage.setItem(KEY, JSON.stringify(SaveService.data)); } catch { /* ignora */ }
  }

  static get attack(): number { return 20 + SaveService.data.weaponLevel * 6; }
  static get maxHp(): number { return 300 + SaveService.data.weaponLevel * 30; }
}

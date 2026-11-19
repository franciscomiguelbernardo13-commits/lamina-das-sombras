export interface SkillDef {
  id: string;
  name: string;
  icon: string;
  cooldown: number;
  mult: number;
  range: number;
  shape: 'circle' | 'line' | 'dash';
}

export const SKILLS: SkillDef[] = [
  { id: 'furacao', name: 'Furacão ardente', icon: '🌀', cooldown: 6, mult: 2.2, range: 130, shape: 'circle' },
  { id: 'choque', name: 'Choque de tumulto', icon: '💥', cooldown: 8, mult: 2.6, range: 300, shape: 'line' },
  { id: 'barra', name: 'Barra ascendente', icon: '🗡', cooldown: 10, mult: 3.0, range: 200, shape: 'dash' }
];

// Constantes globais. O jogo é 2.5D: x = lateral, z = profundidade (0 = fundo do piso), h = altura (pulo).
export const GAME_W = 1280;
export const GAME_H = 720;
export const FLOOR_TOP = 470;   // y da tela onde o piso começa (z = 0)
export const FLOOR_DEPTH = 220; // quantos pixels de profundidade o piso tem
export const WORLD_W = 3200;    // largura do mundo

/** Escala por profundidade: quanto mais perto da câmera (z maior), maior o personagem. */
export const depthScale = (z: number): number => 0.85 + 0.3 * (z / FLOOR_DEPTH);
export const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));

import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config';

export type Btn = 'attack' | 'jump' | 'dash' | 's0' | 's1' | 's2';

/** Controles de toque (analógico à esquerda, botões à direita) + teclado para testar no PC. */
export class Controls {
  mx = 0;
  mz = 0;
  private held = new Set<Btn>();
  private queued = new Set<Btn>();
  private stickId = -1;
  private origin = new Phaser.Math.Vector2();
  private vec = new Phaser.Math.Vector2();
  private base: Phaser.GameObjects.Arc;
  private knob: Phaser.GameObjects.Arc;
  private keys: Record<string, Phaser.Input.Keyboard.Key> = {};
  private btns = new Map<Btn, Phaser.GameObjects.Arc>();

  constructor(private scene: Phaser.Scene) {
    scene.input.addPointer(3);
    this.base = scene.add.circle(0, 0, 78, 0xffffff, 0.1).setScrollFactor(0).setDepth(1000).setVisible(false);
    this.knob = scene.add.circle(0, 0, 34, 0xffffff, 0.3).setScrollFactor(0).setDepth(1001).setVisible(false);

    scene.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (p.x < GAME_W * 0.42 && this.stickId < 0) {
        this.stickId = p.id;
        this.origin.set(p.x, p.y);
        this.base.setPosition(p.x, p.y).setVisible(true);
        this.knob.setPosition(p.x, p.y).setVisible(true);
      }
    });
    scene.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (p.id !== this.stickId) return;
      this.vec.set(p.x - this.origin.x, p.y - this.origin.y);
      if (this.vec.length() > 78) this.vec.setLength(78);
      this.knob.setPosition(this.origin.x + this.vec.x, this.origin.y + this.vec.y);
    });
    const release = (p: Phaser.Input.Pointer): void => {
      if (p.id !== this.stickId) return;
      this.stickId = -1;
      this.vec.set(0, 0);
      this.base.setVisible(false);
      this.knob.setVisible(false);
    };
    scene.input.on('pointerup', release);
    scene.input.on('pointerupoutside', release);

    const R = GAME_W;
    const B = GAME_H;
    this.button('attack', '⚔', R - 250, B - 120, 58);
    this.button('jump', '⬆', R - 90, B - 90, 40);
    this.button('dash', '➡', R - 90, B - 190, 40);
    this.button('s0', '🌀', R - 170, B - 230, 40);
    this.button('s1', '💥', R - 290, B - 230, 40);
    this.button('s2', '🗡', R - 380, B - 130, 40);

    if (scene.input.keyboard) {
      this.keys = scene.input.keyboard.addKeys('W,A,S,D,J,K,L,U,I,O') as Record<string, Phaser.Input.Keyboard.Key>;
    }
  }

  private button(name: Btn, label: string, x: number, y: number, r: number): void {
    const c = this.scene.add.circle(x, y, r, 0x2a1a22, 0.75).setStrokeStyle(3, 0x8a2a34)
      .setScrollFactor(0).setDepth(1000);
    c.setInteractive(new Phaser.Geom.Circle(r, r, r), Phaser.Geom.Circle.Contains);
    this.scene.add.text(x, y, label, { fontSize: `${Math.round(r * 0.8)}px` })
      .setOrigin(0.5).setScrollFactor(0).setDepth(1001);
    c.on('pointerdown', () => { this.held.add(name); this.queued.add(name); });
    const up = (): void => { this.held.delete(name); };
    c.on('pointerup', up);
    c.on('pointerout', up);
    this.btns.set(name, c);
  }

  setCooldown(name: Btn, ready: boolean): void {
    this.btns.get(name)?.setAlpha(ready ? 1 : 0.4);
  }

  isHeld(b: Btn): boolean { return this.held.has(b); }

  consume(b: Btn): boolean {
    const r = this.queued.has(b);
    this.queued.delete(b);
    return r;
  }

  /** Chamar uma vez por frame, antes de ler mx/mz. */
  poll(): void {
    let mx = this.vec.x / 78;
    let mz = this.vec.y / 78;
    const k = this.keys;
    if (k.A?.isDown) mx = -1;
    if (k.D?.isDown) mx = 1;
    if (k.W?.isDown) mz = -1;
    if (k.S?.isDown) mz = 1;
    this.mx = Math.abs(mx) < 0.15 ? 0 : mx;
    this.mz = Math.abs(mz) < 0.15 ? 0 : mz;
    const map: Array<[string, Btn]> = [['K', 'jump'], ['L', 'dash'], ['U', 's0'], ['I', 's1'], ['O', 's2']];
    map.forEach(([key, btn]) => { if (k[key] && Phaser.Input.Keyboard.JustDown(k[key])) this.queued.add(btn); });
    if (k.J?.isDown) this.held.add('attack');
    else if (k.J && Phaser.Input.Keyboard.JustUp(k.J)) this.held.delete('attack');
  }
}

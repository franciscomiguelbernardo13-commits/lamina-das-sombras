import Phaser from 'phaser';
import { FLOOR_TOP, depthScale } from '../config';

/** Base de qualquer personagem 2.5D: posição (x, z, h) projetada na tela com escala e sombra. */
export class Actor {
  x: number;
  z: number;
  h = 0;
  vh = 0;
  facing = 1;
  hp: number;
  readonly maxHp: number;
  flash = 0;
  readonly sprite: Phaser.GameObjects.Image;
  readonly shadow: Phaser.GameObjects.Image;
  protected baseScale = 1;

  constructor(scene: Phaser.Scene, texture: string, x: number, z: number, maxHp: number) {
    this.x = x;
    this.z = z;
    this.hp = this.maxHp = maxHp;
    this.shadow = scene.add.image(x, FLOOR_TOP + z, 'shadow');
    this.sprite = scene.add.image(x, FLOOR_TOP + z, texture).setOrigin(0.5, 1);
    this.sync();
  }

  get alive(): boolean { return this.hp > 0; }

  /** Converte (x, z, h) em posição, escala e ordem de desenho. */
  sync(): void {
    const s = depthScale(this.z) * this.baseScale;
    const gy = FLOOR_TOP + this.z;
    const lift = Math.min(this.h, 160) / 400;
    this.shadow.setPosition(this.x, gy).setScale(s * (1 - lift)).setDepth(gy - 1);
    this.sprite.setPosition(this.x, gy - this.h * depthScale(this.z)).setScale(s).setDepth(gy);
    this.sprite.setFlipX(this.facing < 0);
    if (this.flash > 0) this.sprite.setTintFill(0xffffff);
    else this.sprite.clearTint();
  }

  destroy(): void {
    this.sprite.destroy();
    this.shadow.destroy();
  }
}

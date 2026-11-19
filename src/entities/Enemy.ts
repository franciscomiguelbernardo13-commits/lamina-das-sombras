import Phaser from 'phaser';
import { Actor } from './Actor';
import { Player } from './Player';

export class Enemy extends Actor {
  readonly boss: boolean;
  private atkTimer = 1;
  private readonly speed: number;
  private readonly damage: number;

  constructor(scene: Phaser.Scene, x: number, z: number, stage: number, boss: boolean) {
    super(scene, 'enemy', x, z, (50 + stage * 22) * (boss ? 8 : 1));
    this.boss = boss;
    this.speed = 70 + Math.random() * 30 + stage * 2;
    this.damage = (8 + stage * 3) * (boss ? 2.5 : 1);
    if (boss) { this.baseScale = 1.8; this.sprite.setTint(0xaa3344); }
  }

  /** IA simples: persegue o jogador em x e z e ataca quando está perto. */
  tick(dt: number, p: Player): void {
    const dx = p.x - this.x;
    const dz = p.z - this.z;
    const reach = this.boss ? 90 : 60;
    this.facing = dx >= 0 ? 1 : -1;
    if (Math.abs(dx) > reach) this.x += Math.sign(dx) * this.speed * dt;
    if (Math.abs(dz) > 14) this.z += Math.sign(dz) * this.speed * 0.5 * dt;
    if (Math.abs(dx) <= reach && Math.abs(dz) <= 30) {
      this.atkTimer -= dt;
      if (this.atkTimer <= 0) {
        this.atkTimer = 1.1;
        if (p.inv <= 0 && p.h < 40) { p.hp -= this.damage; p.inv = 0.25; p.flash = 0.1; }
      }
    }
    this.flash -= dt;
    this.sync();
  }
}

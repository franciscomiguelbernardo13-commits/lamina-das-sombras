import Phaser from 'phaser';
import { FLOOR_TOP, WORLD_W, clamp, depthScale } from '../config';
import { SKILLS } from '../data/skills';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { SaveService } from '../services/SaveService';

/** Regras de dano: golpe básico e habilidades. */
export class Combat {
  constructor(private scene: Phaser.Scene, private player: Player, private enemies: Enemy[]) {}

  private deal(e: Enemy, mult: number): void {
    const crit = Math.random() < 0.15;
    const dmg = Math.round(SaveService.attack * mult * (0.9 + Math.random() * 0.2) * (crit ? 1.96 : 1));
    e.hp -= dmg;
    e.flash = 0.12;
    e.x += this.player.facing * 10;
    const y = FLOOR_TOP + e.z - e.h - 100 * depthScale(e.z) * (e.boss ? 1.8 : 1);
    this.popup(e.x, y, String(dmg), crit);
  }

  private inFront(e: Enemy, reach: number, width: number): boolean {
    const dx = (e.x - this.player.x) * this.player.facing;
    return dx > -20 && dx < reach && Math.abs(e.z - this.player.z) < width;
  }

  basic(): void {
    const p = this.player;
    p.attackCd = 0.35;
    p.swing = 0.15;
    this.enemies.forEach((e) => { if (this.inFront(e, e.boss ? 130 : 100, 50)) this.deal(e, 1); });
  }

  skill(i: number): void {
    const p = this.player;
    const def = SKILLS[i];
    if (p.skillCd[i] > 0) return;
    p.skillCd[i] = def.cooldown;
    p.swing = 0.3;
    const mult = def.mult * (1 + 0.08 * (SaveService.data.skills[i] - 1));
    const gy = FLOOR_TOP + p.z;
    this.enemies.forEach((e) => {
      const hit = def.shape === 'circle'
        ? Math.hypot(e.x - p.x, (e.z - p.z) * 2) < def.range
        : this.inFront(e, def.range, 60);
      if (hit) this.deal(e, mult);
    });
    if (def.shape === 'circle') this.ring(p.x, gy - 40, def.range);
    else this.slash(p.x, gy - 40, p.facing * def.range);
    if (def.shape === 'dash') { p.x = clamp(p.x + p.facing * 150, 0, WORLD_W); p.inv = 0.4; }
  }

  private ring(x: number, y: number, r: number): void {
    const c = this.scene.add.circle(x, y, r, 0xe0333c, 0.35).setDepth(800);
    this.scene.tweens.add({ targets: c, alpha: 0, scale: 1.2, duration: 300, onComplete: () => c.destroy() });
  }

  private slash(x: number, y: number, len: number): void {
    const r = this.scene.add.rectangle(x + len / 2, y, Math.abs(len), 26, 0xe0333c, 0.45).setDepth(800);
    this.scene.tweens.add({ targets: r, alpha: 0, duration: 300, onComplete: () => r.destroy() });
  }

  private popup(x: number, y: number, txt: string, crit: boolean): void {
    const t = this.scene.add.text(x, y, txt, {
      fontSize: crit ? '30px' : '22px', color: crit ? '#ffd24a' : '#ffffff', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(900);
    this.scene.tweens.add({ targets: t, y: y - 50, alpha: 0, duration: 650, onComplete: () => t.destroy() });
  }
}

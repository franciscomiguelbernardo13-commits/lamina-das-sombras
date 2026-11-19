import Phaser from 'phaser';
import { GAME_W, GAME_H, FLOOR_TOP, FLOOR_DEPTH, WORLD_W } from '../config';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Combat } from '../systems/Combat';
import { Controls } from '../ui/Controls';
import { SaveService } from '../services/SaveService';

/** Fase de combate 2.5D: camadas com parallax, piso com profundidade e ondas de inimigos. */
export class BattleScene extends Phaser.Scene {
  private stage = 1;
  private wave = 0;
  private elapsed = 0;
  private over = false;
  private player!: Player;
  private enemies: Enemy[] = [];
  private combat!: Combat;
  private controls!: Controls;
  private wall!: Phaser.GameObjects.TileSprite;
  private pillars!: Phaser.GameObjects.TileSprite;
  private floor!: Phaser.GameObjects.TileSprite;
  private bar!: Phaser.GameObjects.Graphics;
  private info!: Phaser.GameObjects.Text;

  constructor() { super('Battle'); }

  init(data: { stage?: number }): void {
    this.stage = data.stage ?? 1;
    this.wave = 0;
    this.elapsed = 0;
    this.over = false;
    this.enemies = [];
  }

  create(): void {
    this.wall = this.add.tileSprite(0, 0, GAME_W, FLOOR_TOP, 'wall').setOrigin(0).setScrollFactor(0).setDepth(-30);
    this.pillars = this.add.tileSprite(0, 0, GAME_W, FLOOR_TOP, 'pillars').setOrigin(0).setScrollFactor(0).setDepth(-20);
    this.floor = this.add.tileSprite(0, FLOOR_TOP, GAME_W, GAME_H - FLOOR_TOP, 'floor')
      .setOrigin(0).setScrollFactor(0).setDepth(-10);

    this.player = new Player(this, 200, FLOOR_DEPTH / 2);
    this.combat = new Combat(this, this.player, this.enemies);
    this.controls = new Controls(this);

    this.cameras.main.setBounds(0, 0, WORLD_W, GAME_H);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);

    this.bar = this.add.graphics().setScrollFactor(0).setDepth(1000);
    this.info = this.add.text(GAME_W - 24, 18, '', { fontSize: '24px', color: '#ece6df', align: 'right' })
      .setOrigin(1, 0).setScrollFactor(0).setDepth(1000);

    this.nextWave();
  }

  private nextWave(): void {
    this.wave++;
    if (this.wave > 3) { this.finish(true); return; }
    const n = 2 + this.wave + (this.stage >> 2);
    for (let i = 0; i < n; i++) {
      const x = Math.min(WORLD_W, this.player.x + 500 + Math.random() * 600);
      this.enemies.push(new Enemy(this, x, Math.random() * FLOOR_DEPTH, this.stage, false));
    }
    if (this.stage % 4 === 0 && this.wave === 3) {
      this.enemies.push(new Enemy(this, Math.min(WORLD_W, this.player.x + 700), FLOOR_DEPTH / 2, this.stage, true));
    }
  }

  update(_t: number, delta: number): void {
    if (this.over) return;
    const dt = Math.min(delta / 1000, 0.05);
    this.elapsed += dt;
    const c = this.controls;
    const p = this.player;

    c.poll();
    p.tick(dt, c);
    if (c.isHeld('attack') && p.attackCd <= 0) this.combat.basic();
    (['s0', 's1', 's2'] as const).forEach((b, i) => {
      if (c.consume(b)) this.combat.skill(i);
      c.setCooldown(b, p.skillCd[i] <= 0);
    });
    c.setCooldown('dash', p.dashCd <= 0);

    this.enemies.forEach((e) => e.tick(dt, p));
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      if (!this.enemies[i].alive) { this.enemies[i].destroy(); this.enemies.splice(i, 1); }
    }

    const sx = this.cameras.main.scrollX;
    this.wall.tilePositionX = sx * 0.3;
    this.pillars.tilePositionX = sx * 0.6;
    this.floor.tilePositionX = sx;
    this.drawHud();

    if (p.hp <= 0) this.finish(false);
    else if (this.enemies.length === 0) this.nextWave();
  }

  private drawHud(): void {
    const p = this.player;
    this.bar.clear();
    this.bar.fillStyle(0x000000, 0.6).fillRect(24, 20, 360, 24);
    this.bar.fillStyle(0xc0272f).fillRect(26, 22, 356 * Math.max(0, p.hp / p.maxHp), 20);
    const m = Math.floor(this.elapsed / 60);
    const s = Math.floor(this.elapsed % 60);
    this.info.setText(`${m}:${s < 10 ? '0' : ''}${s}\nOnda ${Math.min(this.wave, 3)}/3`);
  }

  private finish(win: boolean): void {
    if (this.over) return;
    this.over = true;
    const d = SaveService.data;
    let msg = 'DERROTA\nMelhore arma e habilidades e tente de novo.';
    if (win) {
      const gold = 150 + this.stage * 60;
      d.gold += gold;
      msg = `VITÓRIA!\n+🪙 ${gold}`;
      if (this.stage === d.stage) { d.stage++; d.gems += 30; msg += '   +💎 30'; }
      SaveService.save();
    }
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x000000, 0.7).setScrollFactor(0).setDepth(2000);
    this.add.text(GAME_W / 2, GAME_H / 2, msg + '\n\nToque para voltar', {
      fontSize: '40px', color: '#ece6df', align: 'center'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);
    this.time.delayedCall(700, () => this.input.once('pointerdown', () => this.scene.start('Menu')));
  }
}

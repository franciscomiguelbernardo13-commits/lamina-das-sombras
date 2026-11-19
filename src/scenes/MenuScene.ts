import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config';
import { SaveService } from '../services/SaveService';
import { SKILLS } from '../data/skills';

export class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create(): void {
    const d = SaveService.data;
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x0d0b12);
    this.add.text(GAME_W / 2, 110, 'LÂMINA DAS SOMBRAS', {
      fontFamily: 'Georgia, serif', fontSize: '64px', color: '#ece6df'
    }).setOrigin(0.5);
    this.add.text(GAME_W - 30, 24, `💎 ${d.gems}   🪙 ${d.gold}`, { fontSize: '28px', color: '#e0b252' }).setOrigin(1, 0);
    this.add.text(GAME_W / 2, 185, `Fase ${d.stage} · Ataque ${SaveService.attack} · Vida ${SaveService.maxHp}`, {
      fontSize: '24px', color: '#9a919e'
    }).setOrigin(0.5);

    const weaponCost = 150 * d.weaponLevel;
    const weakest = d.skills.indexOf(Math.min(...d.skills));
    const skillCost = 100 * d.skills[weakest];

    this.makeButton(GAME_W / 2, 310, 'CAMPANHA', () => this.scene.start('Battle', { stage: d.stage }));
    this.makeButton(GAME_W / 2, 420, `MELHORAR ARMA  🪙 ${weaponCost}`, () => {
      if (d.gold >= weaponCost) { d.gold -= weaponCost; d.weaponLevel++; SaveService.save(); this.scene.restart(); }
    });
    this.makeButton(GAME_W / 2, 530, `MELHORAR HABILIDADE  🪙 ${skillCost}`, () => {
      if (d.gold >= skillCost) { d.gold -= skillCost; d.skills[weakest]++; SaveService.save(); this.scene.restart(); }
    });
    this.add.text(GAME_W / 2, 625, SKILLS.map((s, i) => `${s.icon} Nv.${d.skills[i]}`).join('      '), {
      fontSize: '26px', color: '#9a919e'
    }).setOrigin(0.5);
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void): void {
    const t = this.add.text(x, y, label, {
      fontSize: '32px', color: '#ece6df', backgroundColor: '#3a1a22', padding: { x: 30, y: 16 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    t.on('pointerup', onClick);
  }
}

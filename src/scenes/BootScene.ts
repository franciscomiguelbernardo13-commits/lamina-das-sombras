import Phaser from 'phaser';
import { FLOOR_TOP, FLOOR_DEPTH } from '../config';

/**
 * Gera texturas provisórias por código, para o projeto rodar sem arquivos de arte.
 * Para usar arte real: coloque PNGs em /public/assets e carregue com this.load.image / this.load.spritesheet
 * usando as mesmas chaves ('hero', 'enemy', 'wall', 'pillars', 'floor', 'shadow').
 */
export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  create(): void {
    const g = this.add.graphics();
    const done = (key: string, w: number, h: number): void => { g.generateTexture(key, w, h); g.clear(); };

    // Parede ao fundo (repete a cada 640 px)
    g.fillStyle(0x1d1925).fillRect(0, 0, 640, FLOOR_TOP);
    g.fillStyle(0x26212f);
    for (let y = 0; y < FLOOR_TOP; y += 50) {
      for (let x = (y / 50) % 2 ? 0 : 40; x < 640; x += 80) g.fillRect(x, y, 76, 46);
    }
    [60, 380].forEach((x) => {
      g.fillStyle(0x0f0c14).fillRect(x - 6, 124, 92, 220).fillCircle(x + 40, 124, 46);
      g.fillStyle(0x3a3a5c).fillRect(x, 130, 80, 214).fillCircle(x + 40, 130, 40);
      g.fillStyle(0x0f0c14).fillRect(x + 38, 90, 4, 254).fillRect(x, 220, 80, 4);
    });
    done('wall', 640, FLOOR_TOP);

    // Pilares do meio (parallax mais rápido)
    [90, 420].forEach((x) => {
      g.fillStyle(0x120f17).fillRect(x, 0, 44, FLOOR_TOP).fillRect(x - 8, FLOOR_TOP - 40, 60, 40);
    });
    done('pillars', 640, FLOOR_TOP);

    // Piso com linhas de perspectiva
    g.fillStyle(0x1a121a).fillRect(0, 0, 256, FLOOR_DEPTH + 30);
    for (let i = 0; i < 8; i++) g.fillStyle(0x2c1f2b).fillRect(0, i * i * 3 + i * 10, 256, 2);
    for (let x = 0; x < 256; x += 128) g.fillStyle(0x2c1f2b).fillRect(x, 0, 2, FLOOR_DEPTH + 30);
    done('floor', 256, FLOOR_DEPTH + 30);

    // Herói
    g.fillStyle(0xa01820).fillTriangle(24, 38, 2, 108, 30, 108);
    g.fillStyle(0x16161e).fillRect(16, 36, 26, 70);
    g.fillStyle(0xd03a42).fillRect(16, 40, 26, 6);
    g.fillStyle(0xeeeeee).fillCircle(29, 22, 13);
    g.fillStyle(0xcfd3dd).fillRect(44, 20, 5, 70);
    done('hero', 56, 110);

    // Inimigo
    g.fillStyle(0x8a8a96).fillRect(12, 34, 24, 58);
    g.fillStyle(0xd8d8e0).fillCircle(24, 22, 14);
    g.fillStyle(0xee3333).fillRect(17, 18, 5, 5).fillRect(27, 18, 5, 5);
    g.fillStyle(0x5a5a66).fillRect(6, 92, 12, 4).fillRect(30, 92, 12, 4);
    done('enemy', 48, 96);

    // Sombra
    g.fillStyle(0x000000, 0.45).fillEllipse(32, 10, 64, 20);
    done('shadow', 64, 20);

    g.destroy();
    this.scene.start('Menu');
  }
}

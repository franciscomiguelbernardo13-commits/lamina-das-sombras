import Phaser from 'phaser';
import { Actor } from './Actor';
import { Controls } from '../ui/Controls';
import { FLOOR_DEPTH, WORLD_W, clamp } from '../config';
import { SaveService } from '../services/SaveService';

export class Player extends Actor {
  attackCd = 0;
  dashCd = 0;
  inv = 0;
  swing = 0;
  skillCd: number[] = [0, 0, 0];

  constructor(scene: Phaser.Scene, x: number, z: number) {
    super(scene, 'hero', x, z, SaveService.maxHp);
  }

  /** Movimento, pulo, esquiva e recargas. Golpes e habilidades ficam no Combat. */
  tick(dt: number, c: Controls): void {
    this.x = clamp(this.x + c.mx * 270 * dt, 0, WORLD_W);
    this.z = clamp(this.z + c.mz * 170 * dt, 0, FLOOR_DEPTH);
    if (Math.abs(c.mx) > 0.2) this.facing = c.mx > 0 ? 1 : -1;

    if (c.consume('jump') && this.h === 0) this.vh = 640;
    this.vh -= 1500 * dt;
    this.h = Math.max(0, this.h + this.vh * dt);
    if (this.h === 0 && this.vh < 0) this.vh = 0;

    if (c.consume('dash') && this.dashCd

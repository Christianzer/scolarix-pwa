import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('PWA manifest', () => {
  it('exists in /public', () => {
    const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);
  });

  it('contains required fields', () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'public', 'manifest.json'), 'utf-8')
    );
    expect(manifest.name).toBe('Scolarix');
    expect(manifest.theme_color).toBe('#2B3D88');
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons).toHaveLength(8);
  });
});

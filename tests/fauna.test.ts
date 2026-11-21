import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const aprovados = {
  'garca-patrulha.png': '9d10296360b1c0dbc5416f1fe6cde02c43f10043b0544d6e70cec6e035bf716b',
  'garca-rasante.png': 'b161e1213aa4dc3ad1104961b936580672a5084f6392956def366edf96cc6e3d',
  'siri-amarelo.png': '288a1ca7d070c889d55dc96b0b553fd37ae1ef45d47f854ca8de9529b48b4fdc',
  'siri-coral.png': '9b8794c29d855b1cd3c5470902184d971da9b1079c04f9054938f4c5ce39adc9',
  'siri-verde.png': '48c7291cb3c26d1dcd80d528f4057353690b874abbc48e6976589b9fb39c9d9e',
  'spritesheet.png': 'e34f1ae6360e1d83f977e064712abee0aaea7ae2175201cee2df7e2de27a34b0',
} as const;

test('os PNGs e a folha são byte a byte os da entrega visual', async () => {
  for (const [arquivo, hash] of Object.entries(aprovados)) {
    const png = await readFile(new URL(`../assets/fauna/${arquivo}`, import.meta.url));
    assert.equal(createHash('sha256').update(png).digest('hex'), hash, arquivo);
    assert.equal(png.readUInt32BE(16), arquivo === 'spritesheet.png' ? 155 : 31, arquivo);
    assert.equal(png.readUInt32BE(20), 23, arquivo);
  }
});

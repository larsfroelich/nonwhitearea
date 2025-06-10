const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const Jimp = require('jimp');

const processImage = require('../lib/process_image');

test.describe('process_image', () => {
  test('counts dark pixels in image', async () => {
    const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'pimg-'));
    fs.mkdirSync(path.join(tmpdir, 'nonwhitearea_output'), { recursive: true });

    const inputPath = path.join(tmpdir, 'in.png');
    const img = new Jimp(1, 1, 0x000000ff);
    await img.writeAsync(inputPath);

    const settings = { ml: 0, mr: 0, mt: 0, mb: 0, minBright: 128 };
    const count = await processImage(tmpdir, inputPath, settings, 'out.png');
    assert.strictEqual(count, 1);
    assert.ok(fs.existsSync(path.join(tmpdir, 'nonwhitearea_output', 'out.png')));

    fs.rmSync(tmpdir, { recursive: true, force: true });
  });
});


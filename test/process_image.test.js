const fs = require('fs');
const os = require('os');
const path = require('path');

function createFakeImage() {
  const width = 1;
  const height = 1;
  const data = Buffer.from([100, 100, 100, 255]);
  return {
    bitmap: { width, height, data },
    scan: function(sx, sy, w, h, cb) {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (width * y + x) * 4;
          cb.call(this, x, y, idx);
        }
      }
    },
    setPixelColor() {},
    write: function(p, cb) { fs.writeFileSync(p, ''); cb(); }
  };
}

jest.mock('jimp', () => {
  const fakeImg = createFakeImage();
  return {
    read: jest.fn(() => Promise.resolve(fakeImg)),
    rgbaToInt: () => 0
  };
});

const processImage = require('../lib/process_image');

describe('process_image', () => {
  test('counts dark pixels in image', async () => {
    const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'pimg-'));
    global.ROOT_DIR = tmpdir;
    fs.mkdirSync(path.join(tmpdir, 'nonwhitearea_output'), { recursive: true });
    const settings = { ml: 0, mr: 0, mt: 0, mb: 0, minBright: 128 };
    const count = await processImage('dummy', settings, 'out.png');
    expect(count).toBe(1);
    expect(fs.existsSync(path.join(tmpdir, 'nonwhitearea_output', 'out.png'))).toBe(true);
    fs.rmSync(tmpdir, { recursive: true, force: true });
  });
});

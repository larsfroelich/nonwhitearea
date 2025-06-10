const fs = require('fs');
const os = require('os');
const path = require('path');

require('../walkDir');

describe('walkDirectory', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'walkdir-'));
    fs.writeFileSync(path.join(tmpDir, 'root.txt'), 'root');
    fs.mkdirSync(path.join(tmpDir, 'sub'));
    fs.writeFileSync(path.join(tmpDir, 'sub', 'subfile.txt'), 'sub');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('depth 1 returns top level entries', () => {
    const files = global.walkDirectory(tmpDir, '', 1).sort();
    expect(files).toEqual(['/root.txt', '/sub'].sort());
  });

  test('depth 2 returns nested files', () => {
    const files = global.walkDirectory(tmpDir, '', 2).sort();
    expect(files).toEqual(['/root.txt', '/sub/subfile.txt'].sort());
  });
});

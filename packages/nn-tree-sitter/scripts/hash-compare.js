// compare the hash of the current tree-sitter grammar with the hash of the last tree-sitter grammar
// if the hashes are different, update the hash in the ./scripts/.build-hash file
// if the hashes are the same, do nothing

const { existsSync, readFileSync, writeFileSync } = require('fs');
const { exit } = require('process');

const target = readFileSync('./grammar.js', 'utf8');

const newHash = require('crypto')
  .createHash('sha256')
  .update(target)
  .digest('hex');

const hashExists = existsSync('./scripts/.build-hash');
if (!hashExists) {
  writeFileSync('./scripts/.build-hash', newHash);
  exit(0);
}

const currentHash = readFileSync('./scripts/.build-hash', 'utf8');

if (currentHash !== newHash) {
  writeFileSync('./scripts/.build-hash', newHash);
  exit(0);
}

console.log(`Hash matched (${newHash.slice(0, 8)}), skipping build`);
exit(1);

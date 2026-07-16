/**
 * copy-assets.js
 *
 * Cross-platform post-build asset copy script.
 * Runs AFTER `tsc` to copy non-TypeScript assets (JSON seed data, etc.)
 * from src/ into the compiled dist/ output directory.
 *
 * Node's built-in `fs.cpSync` is used deliberately (no extra dependencies):
 *   - Available since Node 16.7 (Render's build environment uses Node 20+)
 *   - Works identically on Windows, macOS, and Linux
 *   - The `recursive: true` flag handles nested directories correctly
 *
 * To add more asset folders in future, add another fs.cpSync call below.
 */

const fs = require('fs');
const path = require('path');

const SRC_DATA  = path.join(__dirname, '..', 'src', 'data');
const DIST_DATA = path.join(__dirname, '..', 'dist', 'data');

// Ensure dist/data directory tree exists, then copy everything inside src/data
fs.cpSync(SRC_DATA, DIST_DATA, { recursive: true });

console.log(`[copy-assets] Copied ${SRC_DATA} → ${DIST_DATA}`);

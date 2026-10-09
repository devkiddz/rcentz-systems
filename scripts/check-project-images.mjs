import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

let user = null;
let queries = 0;
let ownerFilter;
const db = {
  project: { findUnique: async () => { queries++; return { id: 'p1' }; } },
  mediaAsset: { findFirst: async ({ where }) => { queries++; ownerFilter = where.project; return null; } },
};
function load(file) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const context = { exports: {}, Request, Response, File, Buffer, Uint8Array, URL, process: { env: { BETTER_AUTH_URL: 'https://systems.rcentz.cc', BLOB_READ_WRITE_TOKEN: 'test' } }, require(name) {
    if (name === 'node:crypto') return { randomUUID: () => 'test' };
    if (name === '@vercel/blob') return { put: () => { throw new Error('Unauthorized blob write'); }, del: async () => {}, get: async () => null };
    if (name === '@/lib/prisma') return { prisma: db };
    if (name.endsWith('get-current-user')) return { getCurrentUser: async () => user };
    if (name.endsWith('brief-files')) return { MAX_FILE_SIZE: 2 * 1024 * 1024, detectBriefFile: () => null };
    throw new Error(name);
  } };
  vm.createContext(context); vm.runInContext(code, context); return context.exports;
}
const upload = load('app/api/admin/projects/[projectId]/images/route.ts').POST;
const preview = load('app/api/projects/[projectId]/images/[imageId]/route.ts').GET;
const request = () => new Request('https://systems.rcentz.cc/api/test', { method: 'POST', headers: { origin: 'https://systems.rcentz.cc' } });
const params = { params: Promise.resolve({ projectId: 'p1', imageId: 'i1' }) };
for (const identity of [null, { id: 'c1', role: 'CLIENT', status: 'ACTIVE' }, { id: 'a1', role: 'ADMIN', status: 'SUSPENDED' }]) {
  user = identity; assert.equal((await upload(request(), params)).status, 403);
}
assert.equal(queries, 0);
user = { id: 'a1', role: 'ADMIN', status: 'ACTIVE' };
assert.equal((await upload(new Request('https://systems.rcentz.cc/api/test', { method: 'POST', headers: { origin: 'https://evil.example' } }), params)).status, 403);
assert.equal(queries, 0);
assert.equal((await upload(request(), params)).status, 415);
user = null; assert.equal((await preview(request(), params)).status, 401);
user = { id: 'c1', role: 'CLIENT', status: 'ACTIVE' };
assert.equal((await preview(request(), params)).status, 404);
assert.equal(ownerFilter.clientId, 'c1');
user = { id: 'a1', role: 'ADMIN', status: 'ACTIVE' };
assert.equal((await preview(request(), params)).status, 404);
assert.equal(Object.keys(ownerFilter).length, 0);
console.log('PASS: image uploads deny guests, clients, suspended administrators and cross-origin requests before writes; image reads require active sessions and client ownership.');

import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
let user = null, uploads = 0, writes = 0, removed = [], missing = false, failWrite = false;
let image = { id: 'i1', projectId: 'p1', publicId: 'cloudinary:rcentz/projects/p1/old', sortOrder: 0 };
const tx = {
  $executeRaw: async () => {},
  mediaAsset: {
    findFirst: async ({ where }) => where.id ? (!missing && where.projectId === image.projectId && where.id === image.id ? image : null) : { sortOrder: 5 },
    count: async () => 12,
    update: async ({ data }) => { if (failWrite) throw new Error('database failure'); writes++; return { ...image, ...data }; },
    create: async () => { throw new Error('Replacement must not create a new record'); },
    delete: async () => { writes++; },
  },
  auditLog: { create: async () => {} },
};
const db = { ...tx, project: { findUnique: async () => ({ id: 'p1' }) }, $transaction: async fn => fn(tx) };
function load(file) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const context = { exports: {}, Request, Response, File, Buffer, Uint8Array, URL, process: { env: { BETTER_AUTH_URL: 'https://systems.rcentz.cc' } }, require(name) {
    if (name === 'node:crypto') return { randomUUID: () => 'new' };
    if (name === '@/lib/prisma') return { prisma: db };
    if (name.endsWith('get-current-user')) return { getCurrentUser: async () => user };
    if (name.endsWith('brief-files')) return { MAX_FILE_SIZE: 2097152, detectBriefFile: () => ({ type: 'image/jpeg' }) };
    if (name.endsWith('/media/project-images')) return { projectImagesConfigured: () => true, uploadProjectImage: async (_, id) => { uploads++; return { public_id: id, width: 100, height: 100 }; }, removeProjectImage: async id => { removed.push(id); } };
    throw new Error(name);
  } };
  vm.createContext(context); vm.runInContext(code, context); return context.exports;
}
const post = load('app/api/admin/projects/[projectId]/images/route.ts').POST;
const del = load('app/api/admin/projects/[projectId]/images/[imageId]/route.ts').DELETE;
const params = { params: Promise.resolve({ projectId: 'p1', imageId: 'i1' }) };
function request(method, replaceId = 'i1', origin = 'https://systems.rcentz.cc') {
  const form = new FormData(); form.set('file', new File(['jpeg'], 'preview.jpg', { type: 'image/jpeg' })); form.set('replaceId', replaceId);
  return new Request('https://systems.rcentz.cc/api/test', { method, headers: { origin }, ...(method === 'POST' ? { body: form } : {}) });
}
for (const identity of [null, { id: 'c1', role: 'CLIENT', status: 'ACTIVE' }, { id: 'a1', role: 'ADMIN', status: 'SUSPENDED' }]) {
  user = identity;
  assert.equal((await post(request('POST'), params)).status, 403);
  assert.equal((await del(request('DELETE'), params)).status, 403);
}
assert.equal(writes + uploads, 0);
user = { id: 'a1', role: 'ADMIN', status: 'ACTIVE' };
assert.equal((await del(request('DELETE', 'i1', 'https://evil.example'), params)).status, 403);
missing = true;
assert.equal((await post(request('POST'), params)).status, 404);
assert.equal((await del(request('DELETE'), params)).status, 404);
assert.equal(writes + uploads, 0);
missing = false;
assert.equal((await post(request('POST'), params)).status, 200);
assert.equal(uploads, 1); assert.equal(writes, 2);
assert.deepEqual(removed, ['rcentz/projects/p1/old']);
removed = []; failWrite = true;
assert.equal((await post(request('POST'), params)).status, 503);
assert.deepEqual(removed, ['rcentz/projects/p1/new']); // Failed replacement keeps original.
failWrite = false; removed = [];
assert.equal((await del(request('DELETE'), params)).status, 200);
assert.deepEqual(removed, ['rcentz/projects/p1/old']);
image = { ...image, publicId: 'cloudinary:rcentz/projects/other/private' }; removed = [];
assert.equal((await del(request('DELETE'), params)).status, 200);
assert.equal(removed.length, 0); // Never remove another project's provider object.
console.log('PASS: image editing rejects unauthorized and cross-project requests; replacement preserves ID/order at the gallery limit; failed replacement cleans only the new upload; deletion scopes provider cleanup.');

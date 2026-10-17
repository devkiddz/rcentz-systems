import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as crypto from 'node:crypto';
import ts from 'typescript';
function load(file, stubs) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', code)(name => { if (!(name in stubs)) throw Error('Unmocked ' + name); return stubs[name]; }, module, module.exports);
  return module.exports;
}
const original = { id: 'owner', status: 'ACTIVE', role: 'CLIENT', image: null, updatedAt: new Date('2026-10-16T12:00:00Z') };
let user, actor, configured, audit, uploads, deletes, reads, concurrent, auditFails, shared, queries;
function reset() { user = { ...original }; actor = user; configured = true; audit = []; uploads = []; deletes = []; reads = 0; concurrent = false; auditFails = false; shared = false; queries = []; }
reset();
const prisma = {
 user: {
  findFirst: async ({ where }) => { reads++; if (where.id !== user.id || where.status !== user.status || (where.updatedAt && where.updatedAt.getTime() !== user.updatedAt.getTime())) return null; return { ...user }; },
  updateMany: async ({ where, data }) => { assert.equal(where.id, 'owner'); assert.equal(where.status, 'ACTIVE'); if (where.updatedAt.getTime() !== user.updatedAt.getTime() || user.status !== 'ACTIVE') return { count: 0 }; Object.assign(user, data); return { count: 1 }; },
 },
 auditLog: { create: async ({ data }) => { if (auditFails) throw Error('audit failed'); audit.push(data); } },
 conversation: { findFirst: async ({ where }) => { queries.push(where); return shared ? { id: 'shared' } : null; } },
 async $transaction(fn) { const before = { ...user }, length = audit.length; try { return await fn(prisma); } catch (e) { Object.assign(user, before); audit.length = length; throw e; } },
};
const getCurrentUser = async () => actor ? { ...actor } : null;
const boundary = load('features/client/server/client-mutation.ts', { 'server-only': {}, '@/features/auth/server/get-current-user': { getCurrentUser } });
const storage = {
 projectImagesConfigured: () => configured,
 uploadProjectImage: async (bytes, publicId) => { uploads.push(publicId); if (concurrent) user.updatedAt = new Date(user.updatedAt.getTime() + 1000); return { public_id: publicId, format: 'jpg', width: 512, height: 512 }; },
 removeProjectImage: async id => deletes.push(id),
 projectImageDeliveryUrl: id => 'https://res.cloudinary.com/test/image/authenticated/' + id,
};
const avatar = load('features/client/server/avatar.ts', { 'server-only': {}, 'node:crypto': crypto, '@/lib/prisma': { prisma }, './client-mutation': boundary, '@/features/admin/server/media/project-images': storage });
const files = load('features/onboarding/server/brief-files.ts', { 'server-only': {} });
const route = load('app/api/client/avatar/route.ts', { 'node:crypto': crypto, '@/features/auth/server/get-current-user': { getCurrentUser }, '@/features/client/server/client-mutation': boundary, '@/features/client/server/avatar': avatar, '@/features/onboarding/server/brief-files': files, '@/features/admin/server/media/project-images': storage });
const delivery = load('app/api/avatars/[userId]/route.ts', { '@/features/auth/server/get-current-user': { getCurrentUser }, '@/lib/prisma': { prisma }, '@/features/client/server/avatar': avatar, '@/features/admin/server/media/project-images': storage });
const origin = 'https://systems.example'; process.env.BETTER_AUTH_URL = origin;
const jpeg = new Uint8Array([255, 216, 255, 0]);
function upload({ version = user.updatedAt.toISOString(), bytes = jpeg, mime = 'image/jpeg', extra = false } = {}) {
 const form = new FormData(); form.set('file', new Blob([bytes], { type: mime }), 'avatar.jpg'); form.set('updatedAt', version); if (extra) form.set('userId', 'foreign');
 return new Request(origin + '/api/client/avatar', { method: 'POST', headers: { origin }, body: form });
}
const remove = input => new Request(origin + '/api/client/avatar', { method: 'DELETE', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(input) });
reset(); let response = await route.POST(new Request(origin + '/api/client/avatar', { method: 'POST', headers: { origin: 'https://foreign.example' } })); assert.equal(response.status, 403); assert.equal(reads, 0); assert.equal(uploads.length, 0);
reset(); actor = null; response = await route.POST(upload()); assert.equal(response.status, 401); assert.equal(reads, 0); assert.equal(uploads.length, 0);
reset(); user.status = 'SUSPENDED'; response = await route.POST(upload()); assert.equal(response.status, 401); assert.equal(uploads.length, 0);
reset(); response = await route.POST(upload({ extra: true })); assert.equal(response.status, 400); assert.equal(uploads.length, 0);
reset(); response = await route.POST(upload({ version: 'invalid' })); assert.equal(response.status, 400);
reset(); response = await route.POST(upload({ version: '2026-10-15T12:00:00Z' })); assert.equal(response.status, 409); assert.equal(uploads.length, 0);
reset(); response = await route.POST(new Request(origin + '/api/client/avatar', { method: 'POST', headers: { origin, 'content-type': 'multipart/form-data; boundary=test' }, body: new Uint8Array(2 * 1024 * 1024 + 70000) })); assert.equal(response.status, 413); assert.equal(uploads.length, 0);
reset(); response = await route.POST(upload({ bytes: new TextEncoder().encode('<svg/>') })); assert.equal(response.status, 415); assert.equal(uploads.length, 0);
reset(); configured = false; response = await route.POST(upload()); assert.equal(response.status, 503); assert.equal(uploads.length, 0);
reset(); response = await route.POST(upload()); assert.equal(response.status, 200); let result = await response.json(); assert.equal(user.image, result.image); assert.match(user.image, /^\/api\/avatars\/owner\?v=/); assert.equal(audit[0].action, 'CLIENT_AVATAR_UPDATED'); assert.equal(uploads.length, 1); assert.equal(deletes.length, 0);
const firstImage = user.image; response = await route.POST(upload()); assert.equal(response.status, 200); assert.equal(deletes[0], avatar.ownedAvatarId(user.id, firstImage)); assert.notEqual(user.image, firstImage);
response = await route.DELETE(remove({ updatedAt: user.updatedAt.toISOString(), userId: 'foreign' })); assert.equal(response.status, 400); assert.ok(user.image);
response = await route.DELETE(remove({ updatedAt: original.updatedAt.toISOString() })); assert.equal(response.status, 409); assert.ok(user.image);
response = await route.DELETE(remove({ updatedAt: user.updatedAt.toISOString() })); assert.equal(response.status, 200); assert.equal(user.image, null); assert.equal(audit.at(-1).action, 'CLIENT_AVATAR_REMOVED'); const count = audit.length;
response = await route.DELETE(remove({ updatedAt: user.updatedAt.toISOString() })); assert.equal(response.status, 200); assert.equal(audit.length, count, 'repeat removal adds no event');
reset(); concurrent = true; response = await route.POST(upload()); assert.equal(response.status, 409); assert.equal(user.image, null); assert.deepEqual(deletes, uploads); assert.equal(audit.length, 0);
reset(); auditFails = true; response = await route.POST(upload()); assert.equal(response.status, 503); assert.equal(user.image, null); assert.deepEqual(deletes, uploads);
reset(); user.image = 'https://other.example/photo.jpg'; response = await route.DELETE(remove({ updatedAt: user.updatedAt.toISOString() })); assert.equal(response.status, 200); assert.equal(deletes.length, 0);
const uuid = crypto.randomUUID(); await avatar.cleanupAvatar('owner', avatar.avatarPublicId('foreign', uuid)); assert.equal(deletes.length, 0, 'never delete another owner asset');
reset(); user.image = avatar.avatarUrl('owner', uuid); let fetched = 0;
const oldFetch = globalThis.fetch; globalThis.fetch = async (_url, options) => { fetched++; assert.equal(options.redirect, 'error'); return new Response(jpeg, { headers: { 'content-type': 'image/jpeg' } }); };
const read = (id = 'owner', v = uuid) => delivery.GET(new Request(origin + '/api/avatars/' + id + '?v=' + v), { params: Promise.resolve({ userId: id }) });
try {
 actor = null; assert.equal((await read()).status, 401); assert.equal(fetched, 0);
 actor = { ...original, id: 'foreign' }; assert.equal((await read()).status, 404); assert.equal(fetched, 0);
 shared = true; response = await read(); assert.equal(response.status, 200); assert.equal(response.headers.get('cache-control'), 'private, no-store'); assert.equal(fetched, 1); assert.equal(queries.at(-1).AND[0].participants.some.userId, 'foreign'); assert.equal(queries.at(-1).AND[1].participants.some.userId, 'owner');
 actor = user; assert.equal((await read('owner', crypto.randomUUID())).status, 404); assert.equal(fetched, 1);
 assert.equal((await read()).status, 200);
} finally { globalThis.fetch = oldFetch; }
console.log('PASS: active account/origin gates, owner-only avatar updates, bounded JPEG uploads, canonical private image paths, optimistic conflicts and rollback cleanup, remove/idempotence, no foreign asset deletion, owner/shared-conversation delivery and stale-version rejection. Controlled fixtures only; no real uploads or database writes.');

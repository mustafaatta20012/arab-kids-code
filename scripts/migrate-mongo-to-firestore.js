#!/usr/bin/env node
/**
 * migrate-mongo-to-firestore.js
 *
 * One-time migration script: MongoDB Atlas → Cloud Firestore
 * Run locally ONLY. Never deploy this file.
 *
 * Usage:
 *   1. Set MONGODB_URI in your local .env
 *   2. Download service account key from Firebase Console →
 *      Project Settings → Service Accounts → Generate new private key
 *   3. Place key as ./service-account.json (gitignored)
 *   4. node scripts/migrate-mongo-to-firestore.js
 */

'use strict';
const admin      = require('firebase-admin');
const { MongoClient } = require('mongodb');
const serviceAccount  = require('../service-account.json');
require('dotenv').config({ path: '../.env' });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('MONGODB_URI is not set in .env');

// ── Init Firebase Admin ────────────────────────────────────────────────────
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// ── Batched write helper ───────────────────────────────────────────────────
const BATCH_SIZE = 400; // Firestore max is 500

async function batchWrite(collectionName, docs) {
  let count = 0;
  let batch = db.batch();

  for (const doc of docs) {
    const ref = db.collection(collectionName).doc();
    batch.set(ref, doc);
    count++;

    if (count % BATCH_SIZE === 0) {
      await batch.commit();
      console.log(`  ✅ Wrote ${count} docs to ${collectionName}`);
      batch = db.batch();
    }
  }

  if (count % BATCH_SIZE !== 0) {
    await batch.commit();
    console.log(`  ✅ Wrote ${count} total docs to ${collectionName}`);
  }
}

// ── Migration ──────────────────────────────────────────────────────────────
async function migrate() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const mongo = client.db();
  console.log('✅ Connected to MongoDB');

  // 1. Reviews
  console.log('\n📌 Migrating reviews...');
  const reviews = await mongo.collection('reviews').find({}).toArray();
  await batchWrite('reviews', reviews.map((r) => ({
    authorName: r.authorName || r.name || 'مجهول',
    rating:     r.rating    || 5,
    comment:    r.comment   || r.text || '',
    status:     r.approved ? 'approved' : (r.status || 'pending'),
    createdAt:  admin.firestore.Timestamp.fromDate(r.createdAt ? new Date(r.createdAt) : new Date()),
  })));

  // 2. Lessons
  console.log('\n📌 Migrating lessons...');
  const lessons = await mongo.collection('lessons').find({}).toArray();
  await batchWrite('lessons', lessons.map((l) => ({
    order:       l.order      || 1,
    title:       l.title?.en  || l.title || '',
    titleAr:     l.title?.ar  || l.title || '',
    description: l.summary?.ar || l.description || '',
    isPublic:    l.isFree     || l.order === 1,
    duration:    l.durationMin || 15,
    videoUrl:    l.videoUrl   || '',
    scratchUrl:  l.scratchUrl || '',
    objectives:  l.objectives || [],
    createdAt:   admin.firestore.Timestamp.fromDate(l.createdAt ? new Date(l.createdAt) : new Date()),
  })));

  // 3. Contacts
  console.log('\n📌 Migrating contacts...');
  const contacts = await mongo.collection('contacts').find({}).toArray();
  await batchWrite('contacts', contacts.map((c) => ({
    name:      c.name    || '',
    phone:     c.phone   || '',
    message:   c.message || '',
    createdAt: admin.firestore.Timestamp.fromDate(c.createdAt ? new Date(c.createdAt) : new Date()),
    read:      c.read || false,
  })));

  // 4. Users (metadata only — passwords handled by Firebase Auth)
  console.log('\n📌 Migrating user metadata...');
  console.log('  ⚠️  NOTE: Users must reset passwords via Firebase Auth.');
  const users = await mongo.collection('users').find({}).toArray();
  await batchWrite('users', users.map((u) => ({
    name:              u.name       || '',
    email:             u.email      || `${(u.phone || '').replace(/\D/g, '')}@arabkids.app`,
    phone:             u.phone      || '',
    role:              u.role       || 'parent',
    approved:          u.approved   || false,
    approvalStatus:    u.approvalStatus || (u.approved ? 'approved' : 'pending'),
    subscriptionStart: u.subscriptionStart ? u.subscriptionStart.toISOString?.() ?? null : null,
    subscriptionEnd:   u.subscriptionEnd   ? u.subscriptionEnd.toISOString?.()   ?? null : null,
    createdAt:         admin.firestore.Timestamp.fromDate(u.createdAt ? new Date(u.createdAt) : new Date()),
  })));

  await client.close();
  console.log('\n🎉 Migration complete!');
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});

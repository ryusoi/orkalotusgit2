import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { GuestAsset, InsertGuestAsset, InsertUser, User, guestAssets, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// In-memory fallbacks for container/preview execution when database is offline or unconfigured
const memoryUsers = new Map<string, User>();
const memoryAssets: GuestAsset[] = [];
let nextUserId = 1;
let nextAssetId = 1;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    const existing = memoryUsers.get(user.openId);
    const role = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : (existing?.role ?? "user"));
    const updated: User = {
      id: existing?.id ?? nextUserId++,
      openId: user.openId,
      name: user.name ?? existing?.name ?? null,
      email: user.email ?? existing?.email ?? null,
      loginMethod: user.loginMethod ?? existing?.loginMethod ?? null,
      role: role as "user" | "admin",
      createdAt: existing?.createdAt ?? new Date(),
      updatedAt: new Date(),
      lastSignedIn: user.lastSignedIn ?? new Date(),
    };
    memoryUsers.set(user.openId, updated);
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) {
    return memoryUsers.get(openId);
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createGuestAsset(asset: InsertGuestAsset): Promise<GuestAsset> {
  const db = await getDb();
  if (!db) {
    const newAsset: GuestAsset = {
      id: nextAssetId++,
      createdByUserId: asset.createdByUserId,
      fileName: asset.fileName,
      storageKey: asset.storageKey,
      url: asset.url,
      contentType: asset.contentType,
      sizeBytes: asset.sizeBytes,
      label: asset.label ?? null,
      published: asset.published ?? false,
      createdAt: new Date(),
    };
    memoryAssets.push(newAsset);
    return newAsset;
  }
  await db.insert(guestAssets).values(asset);
  const created = await db.select().from(guestAssets).where(eq(guestAssets.storageKey, asset.storageKey)).limit(1);
  if (!created[0]) throw new Error("Asset metadata was not created");
  return created[0];
}

export async function listGuestAssets(): Promise<GuestAsset[]> {
  const db = await getDb();
  if (!db) return [...memoryAssets];
  return db.select().from(guestAssets).orderBy(guestAssets.createdAt);
}

export async function listPublishedGuestAssets(): Promise<GuestAsset[]> {
  const db = await getDb();
  if (!db) return memoryAssets.filter((a) => a.published);
  return db.select().from(guestAssets).where(eq(guestAssets.published, true)).orderBy(guestAssets.createdAt);
}

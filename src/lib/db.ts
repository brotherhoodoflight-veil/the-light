import { promises as fs } from "fs";
import path from "path";
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { HIGH_CIRCLE, REGIONS } from "./levels";
import { hashString, mulberry32 } from "./sigil";
import type { PublicMember } from "./types";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;

export interface Member extends PublicMember {
  passphraseHash: string;
  salt: string;
}

export { type PublicMember } from "./types";

export const SEED_PASSPHRASE = "initiate";
export const HIGH_CIRCLE_PASSPHRASE = "high-circle";
export const HIGH_CIRCLE_MEMBER_ID = "BOL-0001";
export const SEED_MEMBER_COUNT = 147;

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "members.json");

interface Db {
  members: Member[];
}

const FIRST_NAMES = [
  "Kofi", "Ama", "Kwame", "Akosua", "Kwabena", "Efua", "Yaw", "Adwoa",
  "Kwaku", "Abena", "Kojo", "Esi", "Kwadwo", "Afia", "Kweku", "Akua",
  "Kwesi", "Yaa", "Kwashi", "Adjoa", "Ato", "Nhyira", "Kwao", "Abrafi",
  "Kobina", "Akwasi", "Ebo", "Maame", "Nana", "Sika",
];

const LAST_NAMES = [
  "Mensah", "Boateng", "Owusu", "Addo", "Asante", "Osei", "Appiah",
  "Darko", "Amoah", "Nyarko", "Bonsu", "Annan", "Acquah", "Frimpong",
  "Sarpong", "Quaye", "Ofori", "Agyeman", "Tetteh", "Acheampong",
  "Danquah", "Gyasi", "Opoku", "Asamoah", "Adjei", "Badu", "Brobbey",
  "Donkor", "Gyan", "Koomson", "Lamptey", "Manu", "Nkrumah", "Obeng",
  "Poku", "Quansah", "Sarfo", "Twumasi", "Yeboah", "Amissah", "Antwi",
  "Baah", "Cudjoe", "Essuman", "Fianko", "Gyamfi", "Hagan", "Iddrisu",
  "Kwarteng", "Lartey", "Ntim", "Ocansey", "Paintsil", "Sowah", "Tagoe",
  "Ussif", "Vanful", "Wiafe", "Yankey", "Zormelo",
];

let cache: Db | null = null;

function nextSequence(db: Db): number {
  const max = db.members.reduce((acc, m) => {
    const seq = Number(m.id.replace(/\D/g, "") || 0);
    return seq > acc ? seq : acc;
  }, 0);
  return max + 1;
}

function memberId(seq: number): string {
  return `BOL-${String(seq).padStart(4, "0")}`;
}

function seededLevel(rnd: () => number): number {
  const r = rnd();
  if (r < 0.3) return 1;
  if (r < 0.5) return 2;
  if (r < 0.65) return 3;
  if (r < 0.77) return 4;
  if (r < 0.86) return 5;
  if (r < 0.93) return 6;
  if (r < 0.975) return 7;
  if (r < 0.995) return 8;
  return 9;
}

function randomName(rnd: () => number, used: Set<string>): string {
  for (let i = 0; i < 200; i++) {
    const first = FIRST_NAMES[Math.floor(rnd() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(rnd() * LAST_NAMES.length)];
    const full = `${first} ${last}`;
    if (!used.has(full)) {
      used.add(full);
      return full;
    }
  }
  return "Initiate Veiled";
}

async function seedDb(): Promise<Db> {
  const initiateAuth = await hashPassphrase(SEED_PASSPHRASE);
  const highCircleAuth = await hashPassphrase(HIGH_CIRCLE_PASSPHRASE);
  const rnd = mulberry32(314159);
  const used = new Set<string>();
  const members: Member[] = [];

  for (let i = 0; i < SEED_MEMBER_COUNT; i++) {
    const seq = i + 1;
    const id = memberId(seq);
    const isHighCircle = id === HIGH_CIRCLE_MEMBER_ID;
    const auth = isHighCircle ? highCircleAuth : initiateAuth;
    const now = new Date(
      2024 + Math.floor(rnd() * 2),
      Math.floor(rnd() * 12),
      1 + Math.floor(rnd() * 27),
      6 + Math.floor(rnd() * 16),
      Math.floor(rnd() * 60),
    ).toISOString();

    const level =
      isHighCircle ? 9 : seededLevel(rnd);
    const region = isHighCircle ? "Greater Accra" : REGIONS[i % REGIONS.length];

    members.push({
      id,
      name: isHighCircle ? "Kwabena Asante" : randomName(rnd, used),
      region,
      level,
      circle: isHighCircle ? HIGH_CIRCLE : level,
      sigil: `bol-${hashString(id).toString(16)}-${level}`,
      passphraseHash: auth.hash,
      salt: auth.salt,
      createdAt: now,
      updatedAt: now,
    });
  }

  return { members };
}

async function loadDb(): Promise<Db> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    cache = JSON.parse(raw) as Db;
    return cache;
  } catch {
    const seeded = await seedDb();
    await writeDb(seeded);
    cache = seeded;
    return seeded;
  }
}

async function writeDb(db: Db): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DATA_FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2));
  await fs.rename(tmp, DATA_FILE);
}

export async function hashPassphrase(
  passphrase: string,
  salt = randomBytes(16).toString("hex"),
): Promise<{ salt: string; hash: string }> {
  const hash = await scrypt(passphrase, salt, 64);
  return { salt, hash: hash.toString("hex") };
}

export async function verifyPassphrase(
  passphrase: string,
  salt: string,
  hash: string,
): Promise<boolean> {
  const candidate = await scrypt(passphrase, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export async function listMembers(): Promise<Member[]> {
  const db = await loadDb();
  return [...db.members].sort((a, b) =>
    a.id.localeCompare(b.id, undefined, { numeric: true }),
  );
}

export async function getMember(id: string): Promise<Member | null> {
  const db = await loadDb();
  return db.members.find((m) => m.id.toLowerCase() === id.toLowerCase()) ?? null;
}

export async function findMemberByCredential(
  id: string,
  passphrase: string,
): Promise<Member | null> {
  const member = await getMember(id);
  if (!member) return null;
  const ok = await verifyPassphrase(passphrase, member.salt, member.passphraseHash);
  return ok ? member : null;
}

export async function createMember(input: {
  name: string;
  region: string;
  level: number;
}): Promise<Member & { passphrase: string }> {
  const db = await loadDb();
  const passphrase = randomBytes(6).toString("base64url").slice(0, 8);
  const auth = await hashPassphrase(passphrase);
  const seq = nextSequence(db);
  const now = new Date().toISOString();
  const member: Member = {
    id: memberId(seq),
    name: input.name.trim(),
    region: input.region,
    level: input.level,
    circle: input.level,
    sigil: `bol-${hashString(memberId(seq)).toString(16)}-${input.level}`,
    passphraseHash: auth.hash,
    salt: auth.salt,
    createdAt: now,
    updatedAt: now,
  };
  db.members.push(member);
  await writeDb(db);
  return { ...member, passphrase };
}

export async function setMemberLevel(id: string, level: number): Promise<Member | null> {
  const db = await loadDb();
  const member = db.members.find((m) => m.id === id);
  if (!member) return null;
  const clamped = Math.min(9, Math.max(1, Math.floor(level)));
  member.level = clamped;
  if (member.circle !== HIGH_CIRCLE) member.circle = clamped;
  member.updatedAt = new Date().toISOString();
  await writeDb(db);
  return { ...member };
}

export function publicMember(member: Member): PublicMember {
  return {
    id: member.id,
    name: member.name,
    region: member.region,
    level: member.level,
    circle: member.circle,
    sigil: member.sigil,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
  };
}

export function isHighCircle(member: Member): boolean {
  return member.circle === HIGH_CIRCLE;
}
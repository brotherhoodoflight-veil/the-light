// ============================================================
// VEIL — Historical Registry Population (Data Generation Only)
// The Brotherhood of Light
//
// Creates the historical membership registry: 2,386 NEW Member
// records across 49 countries, exactly matching the frozen
// country distribution. BOL-1385 (Dankwah Kwame Foster) is never
// touched — it is excluded from the generated ID space, and the
// script refuses to overwrite any existing memberId.
//
// Repeat-safe and deterministic:
//   • Member IDs are drawn from the established historical registry
//     convention (BOL-1 … BOL-2982), excluding BOL-1385.
//   • A fixed seed reproduces identical records on re-run.
//   • Existing memberIds are read first; only missing ids are
//     inserted. Re-running the script inserts nothing new.
//   • All inserts happen inside one transaction (chunked createMany).
//
// Field policy (matches the schema's own discipline):
//   • membershipType: LIFE MEMBER | MEMBER
//   • status:         ACTIVE | RESTRICTED | ARCHIVED
//   • role:           MEMBER (majority) plus supported organizational
//                     seats in small fractions.
//   • journeyStart/formalApproval/fullMembership: year-level only.
//   • countryInitiator: the Country Initiator who brought the member
//     behind the veil.
//   • prefecture/directorate/minervalAssembly/cell/insinuatorName:
//     organizational variation for a subset of members.
//   • initiationDate, email, phone, address: LEFT NULL. Exact dates
//     are never invented; contact data is not fabricated.
//   • No AuthAccount rows are created for generated members.
// ============================================================

import 'dotenv/config';
import { PrismaClient } from '../lib/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const sqliteUrl = process.env.DATABASE_URL ?? 'file:./dev.db';
const adapter = new PrismaBetterSqlite3({ url: sqliteUrl });
const prisma = new PrismaClient({ adapter });

// ------------------------------------------------------------------
// Frozen country distribution. Values are TOTAL members per country
// (including the pre-existing BOL-1385 which belongs to Ghana).
// Sum = 2,387.
// ------------------------------------------------------------------
export const MEMBER_DISTRIBUTION: { country: string; total: number }[] = [
  { country: 'United States', total: 695 },
  { country: 'United Kingdom', total: 235 },
  { country: 'Canada', total: 54 },
  { country: 'Germany', total: 53 },
  { country: 'France', total: 52 },
  { country: 'Australia', total: 51 },
  { country: 'Italy', total: 50 },
  { country: 'Netherlands', total: 49 },
  { country: 'Spain', total: 48 },
  { country: 'Japan', total: 47 },
  { country: 'Brazil', total: 46 },
  { country: 'India', total: 45 },
  { country: 'United Arab Emirates', total: 44 },
  { country: 'Belgium', total: 43 },
  { country: 'South Korea', total: 42 },
  { country: 'Saudi Arabia', total: 41 },
  { country: 'Switzerland', total: 40 },
  { country: 'Norway', total: 39 },
  { country: 'Sweden', total: 38 },
  { country: 'Mexico', total: 37 },
  { country: 'Portugal', total: 36 },
  { country: 'Ireland', total: 35 },
  { country: 'Austria', total: 34 },
  { country: 'Denmark', total: 33 },
  { country: 'Singapore', total: 32 },
  { country: 'New Zealand', total: 31 },
  { country: 'Malaysia', total: 30 },
  { country: 'Qatar', total: 29 },
  { country: 'Kuwait', total: 28 },
  { country: 'Ghana', total: 27 },
  { country: 'Nigeria', total: 26 },
  { country: 'South Africa', total: 25 },
  { country: 'Kenya', total: 24 },
  { country: 'Uganda', total: 23 },
  { country: 'Tanzania', total: 22 },
  { country: 'Cameroon', total: 21 },
  { country: 'Côte d’Ivoire', total: 20 },
  { country: 'Senegal', total: 19 },
  { country: 'Sierra Leone', total: 18 },
  { country: 'Liberia', total: 17 },
  { country: 'Benin', total: 16 },
  { country: 'Togo', total: 15 },
  { country: 'Rwanda', total: 14 },
  { country: 'Zambia', total: 13 },
  { country: 'Zimbabwe', total: 12 },
  { country: 'DR Congo', total: 11 },
  { country: 'Ethiopia', total: 10 },
  { country: 'Morocco', total: 9 },
  { country: 'Egypt', total: 8 },
];

export const EXISTING_MEMBER_ID = 'BOL-1385';
export const REGISTRY_MAX_ID = 2982;

// ------------------------------------------------------------------
// Deterministic PRNG utilities
// ------------------------------------------------------------------
function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: readonly T[], rnd: () => number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rnd() * (i + 1));
    const tmp = out[i];
    out[i] = out[j] as T;
    out[j] = tmp as T;
  }
  return out;
}

// ------------------------------------------------------------------
// Shared organizational pools (fraternity structures)
// ------------------------------------------------------------------
const ASSEMBLIES = [
  'Acropolis Assembly', 'Aegis Assembly', 'Aurora Assembly', 'Beacon Assembly',
  'Celeste Assembly', 'Crown Assembly', 'Dawn Assembly', 'De Profundis Assembly',
  'Elysion Assembly', 'Golden Assembly', 'Harmony Assembly', 'Highland Assembly',
  'Horizon Assembly', 'Iris Assembly', 'Kings Assembly', 'Laurel Assembly',
  'Lighthouse Assembly', 'Lotus Assembly', 'Meridian Assembly', 'Minerva Assembly',
  'Mithra Assembly', 'North Star Assembly', 'Obelisk Assembly', 'Oak Assembly',
  'Orion Assembly', 'Phoenix Assembly', 'Rose Assembly', 'Sapphire Assembly',
  'Sphinx Assembly', 'Stella Assembly', 'Sunrise Assembly', 'Temple Assembly',
  'Unity Assembly', 'Vega Assembly', 'Verdant Assembly', 'Willow Assembly',
  'Zephyr Assembly', 'Heron Assembly', 'Gate Assembly', 'Harbor Assembly',
];

const CELLS = [
  'Cell Meridian', 'Cell Zenith', 'Cell Alba', 'Cell Nova', 'Cell Vela',
  'Cell Cassiopeia', 'Cell Andromeda', 'Cell Orion', 'Cell Vega', 'Cell Sirius',
  'Cell Lyra', 'Cell Polaris', 'Cell Aurora', 'Cell Crescent', 'Cell Beacon',
  'Cell Lantern', 'Cell Compass', 'Cell Anchor', 'Cell Harbor', 'Cell Summit',
  'Cell Ridge', 'Cell Grove', 'Cell Spring', 'Cell Haven', 'Cell Saltus',
  'Cell Velum', 'Cell Fax', 'Cell Flamma', 'Cell Lumen', 'Cell Alpha Prime',
  'Cell Beta Alpha', 'Cell Gamma', 'Cell Delta', 'Cell Epsilon', 'Cell Zeta',
];

const DIRECTORATE_WORDS = [
  'Eastern', 'Western', 'Northern', 'Southern', 'Central', 'Coastal',
  'Highland', 'Capitol', 'Frontier', 'Maritime', 'Continental', 'Grand',
  'United', 'Royal', 'Federal', 'Provincial', 'Metropolitan', 'Rural',
];

// ------------------------------------------------------------------
// Per-country name pools
//   male / female   : given-name pools
//   middleMale/middleFemale : optional middle-name pools
//   surnames        : family-name pools
//   initiators      : Country Initiator names (the keeper who brought
//                     members behind the veil for that country)
//   regions         : flavour words used to compose Prefectures
// ------------------------------------------------------------------
interface CountryNames {
  male: string[];
  female: string[];
  middleMale?: string[];
  middleFemale?: string[];
  surnames: string[];
  /** Surnames meaningful only for female members (e.g. Sikh 'Kaur'). */
  femaleOnlySurnames?: string[];
  /** Surnames meaningful only for male members (e.g. Sikh 'Singh'). */
  maleOnlySurnames?: string[];
  initiators: string[];
  regions: string[];
}

const COUNTRIES: Record<string, CountryNames> = {
  'United States': {
    male: [
      'James', 'Michael', 'William', 'Robert', 'John', 'David', 'Richard', 'Joseph',
      'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark',
      'Andrew', 'Joshua', 'Kevin', 'Brian', 'Edward', 'Timothy', 'Jason', 'Jeffrey',
      'Ryan', 'Jacob', 'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Justin',
      'Scott', 'Brandon', 'Benjamin', 'Samuel', 'Gregory', 'Alexander', 'Raymond',
      'Patrick', 'Jack', 'Dennis', 'Tyler', 'Aaron', 'Jose', 'Adam', 'Nathan',
      'Henry', 'Zachary', 'Douglas', 'Peter', 'Kyle', 'Ethan', 'Walter', 'Noah',
      'Jeremy', 'Christian', 'Roger', 'Keith', 'Austin', 'Arthur', 'Albert',
      'Lawrence', 'Randy', 'Willie', 'Vincent', 'Elijah', 'Bobby', 'Sean', 'Louis',
      'Ralph', 'Roy', 'Jordan', 'Eugene', 'Marcus', 'Andre', 'Jamal', 'Terrence',
      'Khalil', 'Miguel', 'Javier', 'Alejandro', 'Carlos', 'Diego', 'Luis',
      'Rafael', 'Ricardo', 'Roberto', 'Omar', 'Amir', 'Reginald', 'Darnell',
      'Tyrone', 'Malik', 'Xavier', 'Jayden', 'Mason', 'Logan', 'Camden',
      'Hiroshi', 'Kenji', 'Dae', 'Wei', 'Kofi', 'Mateo', 'Emiliano',
    ],
    female: [
      'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan',
      'Jessica', 'Sarah', 'Karen', 'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra',
      'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle', 'Carol', 'Amanda',
      'Dorothy', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura',
      'Cynthia', 'Amy', 'Kathleen', 'Angela', 'Shirley', 'Anna', 'Brenda', 'Pamela',
      'Nicole', 'Emma', 'Samantha', 'Katherine', 'Christine', 'Debra', 'Rachel',
      'Carolyn', 'Janet', 'Maria', 'Heather', 'Diane', 'Julie', 'Joyce', 'Victoria',
      'Kelly', 'Christina', 'Lauren', 'Brittany', 'Alyssa', 'Jasmine', 'Vanessa',
      'Amber', 'Destiny', 'Makayla', 'Isabella', 'Hannah', 'Alexis', 'Aliyah',
      'Imani', 'Nia', 'Kiara', 'Zuri', 'Maya', 'Sofia', 'Camila', 'Valentina',
      'Ximena', 'Gabriella', 'Penelope', 'Vivian', 'Adriana', 'Daniela', 'Natalie',
      'Evelyn', 'Chloe', 'Layla', 'Rosa', 'Lydia', 'Gloria', 'Diana', 'Faith',
      'Hope', 'Miriam', 'Yuki', 'Mei', 'Priya', 'Anaya', 'Sasha',
    ],
    middleMale: [
      'James', 'Michael', 'Robert', 'Lee', 'William', 'David', 'Andrew', 'Joseph',
      'Thomas', 'Anthony', 'John', 'Daniel', 'Paul', 'Alan', 'Ray', 'Scott',
      'Edward', 'Vincent', 'Xavier', 'Bryan', 'Curtis', 'Dean', 'Lance', 'Jermaine',
      'Marcus', 'Emmanuel', 'Luis', 'Alejandro', 'Kofi', 'Darnell', 'Wayne',
      'Craig', 'Terrell', 'Cole', 'Nelson', 'Miguel',
    ],
    middleFemale: [
      'Marie', 'Ann', 'Lynn', 'Jean', 'Louise', 'Renee', 'Dawn', 'Nicole',
      'Michelle', 'Rose', 'Elizabeth', 'Grace', 'Faith', 'Mae', 'Jo', 'Beth',
      'Catherine', 'Denise', 'Faye', 'Sharon', 'Imani', 'Sofia', 'Alicia',
      'Renata', 'Yvonne', 'Carmen', 'Esther', 'Ruth', 'Angela', 'Diane',
      'Renee', 'Lynn',
    ],
    surnames: [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
      'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
      'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
      'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
      'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
      'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green',
      'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
      'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz',
      'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris',
      'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan',
      'Cooper', 'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos',
      'Kim', 'Cox', 'Ward', 'Richardson', 'Watson', 'Brooks', 'Chavez',
      'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes',
      'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers', 'Long',
      'Ross', 'Foster', 'Jimenez', 'Powell', 'Jenkins', 'Perry', 'Russell',
      'Sullivan', 'Bell', 'Coleman', 'Butler', 'Henderson', 'Barnes',
      'Gonzales', 'Fisher', 'Vasquez', 'Simmons', 'Romero', 'Jordan',
      'Patterson', 'Alexander', 'Hamilton', 'Graham', 'Reynolds', 'Griffin',
      'Wallace', 'Moreno', 'West', 'Cole', 'Hayes', 'Bryant', 'Herrera',
      'Gibson', 'Ellis', 'Tran', 'Medina', 'Aguilar', 'Stevens', 'Murray',
      'Ford', 'Castro', 'Marshall', 'Owens', 'Harrison', 'Fernandez',
      'Mcdonald', 'Woods', 'Washington', 'Kennedy', 'Wells', 'Vargas',
      'Henry', 'Chen', 'Freeman', 'Webb', 'Tucker', 'Guzman', 'Burns',
      'Crawford', 'Olson', 'Simpson', 'Porter', 'Hunter', 'Gordon', 'Mendez',
      'Silva', 'Shaw', 'Snyder', 'Mason', 'Dixon', 'Munoz', 'Hunt', 'Palmer',
      'Robertson', 'Black', 'Holmes', 'Stone', 'Meyer', 'Boyd', 'Mills',
      'Warren', 'Fox', 'Rose', 'Rice', 'Sutton', 'Farmer', 'Graves',
      'Goodman', 'Stanley', 'Bates', 'Francis', 'Doyle', 'Baldwin', 'Bowers',
      'Carroll', 'Cannon', 'Banks', 'Salazar', 'Hogan', 'Vaughn', 'Garrison',
      'Booker', 'Hart', 'Odom', 'Glenn', 'Moses', 'Ware', 'Britt', 'Zamora',
      'Massey', 'Bullock', 'Cummings', 'Haney', 'Cash', 'Pittman', 'Lang',
    ],
    initiators: [
      'Marcus Bennett', 'Evelyn Summers', 'Jonathan Brooks', 'Grace Marshall',
      'Anthony Delgado', 'Rosalind Carter', 'Vincent Holloway', 'Clara Winslow',
      'Nathaniel Porter', 'Miriam Calloway', 'Raymond Ashford', 'Danielle Whitfield',
      'Emmanuel Agyei', 'Theodore Vance', 'Giselle Romero',
    ],
    regions: [
      'Atlantic', 'Capitol', 'Pacific', 'Southern', 'Great Lakes', 'Southwest',
      'Frontier', 'Northeast', 'Heartland', 'Coastal', 'Midland', 'Sunshine',
      'Rocky Mountain', 'Newfound', 'Western Reserve', 'Chesapeake', 'Bayou',
      'Prairie', 'Desert', 'Alpine',
    ],
  },

  'United Kingdom': {
    male: [
      'Oliver', 'George', 'Harry', 'Jack', 'Jacob', 'Charlie', 'Thomas', 'Oscar',
      'William', 'James', 'Noah', 'Leo', 'Alfie', 'Archie', 'Freddie', 'Theo',
      'Max', 'Joshua', 'Daniel', 'Arthur', 'Edward', 'Henry', 'Samuel', 'Alex',
      'Benjamin', 'Callum', 'Connor', 'Declan', 'Ethan', 'Finn', 'Gavin', 'Hugh',
      'Isaac', 'Jude', 'Kieran', 'Liam', 'Mohammed', 'Niall', 'Owen', 'Patrick',
      'Quentin', 'Rory', 'Sebastian', 'Toby', 'Victor', 'Willis', 'Yusuf', 'Zachary',
      'Dominic', 'Elliot', 'Felix', 'Graham', 'Harvey', 'Ibrahim', 'Julian',
    ],
    female: [
      'Olivia', 'Amelia', 'Isla', 'Ava', 'Emily', 'Sophia', 'Grace', 'Mia',
      'Poppy', 'Ella', 'Lily', 'Freya', 'Charlotte', 'Alice', 'Martha', 'Evie',
      'Imogen', 'Daisy', 'Phoebe', 'Florence', 'Eleanor', 'Ruby', 'Ivy', 'Erin',
      'Hannah', 'Jasmine', 'Katie', 'Layla', 'Megan', 'Niamh', 'Ophelia', 'Penelope',
      'Rosie', 'Scarlett', 'Tessa', 'Una', 'Violet', 'Wendy', 'Zara', 'Esme',
      'Georgina', 'Harriet', 'Josephine', 'Lorna', 'Molly', 'Prisha', 'Sadia',
      'Tamsin', 'Yasmin', 'Bridget', 'Celia', 'Dorothy', 'Fiona',
    ],
    middleMale: [
      'Alexander', 'James', 'William', 'George', 'Henry', 'Edward', 'Charles',
      'Arthur', 'Frederick', 'Albert', 'Louis', 'Joseph', 'Michael', 'Oliver',
      'Thomas', 'Samuel', 'Daniel', 'Robert', 'Stephen', 'Patrick', 'David',
      'Andrew', 'Christopher', 'John', 'Peter', 'Philip',
    ],
    middleFemale: [
      'Rose', 'Anne', 'Jane', 'Grace', 'Louise', 'Elizabeth', 'Mary', 'Margaret',
      'Victoria', 'Charlotte', 'Alice', 'Frances', 'Eleanor', 'Katherine',
      'Margaret', 'Louise', 'Sofia', 'Clare', 'Dawn', 'Ruby',
    ],
    surnames: [
      'Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Johnson',
      'Davies', 'Robinson', 'Wright', 'Thompson', 'Evans', 'Walker', 'White',
      'Roberts', 'Green', 'Hall', 'Wood', 'Jackson', 'Clarke', 'Patel', 'Khan',
      'Lewis', 'Hughes', 'Turner', 'Hill', 'Scott', 'Cooper', 'Morris', 'Ward',
      'Moore', 'Clark', 'King', 'Harrison', 'Baker', 'Lee', 'Allen', 'Phillips',
      'Campbell', 'Parker', 'Edwards', 'Collins', 'Stewart', 'Bell', 'Murphy',
      'Bailey', 'Richardson', 'Cox', 'Howard', 'Ward', 'Watson', 'Brooks',
      'Bennett', 'Gray', 'James', 'Reynolds', 'Fisher', 'Ellis', 'Hart',
      'Ford', 'Porter', 'Cole', 'Palmer', 'Holmes', 'Fox', 'Webb', 'Mills',
      'Payne', 'Rogers', 'Osborne', 'Harper', 'Norman', 'Dunn', 'Young',
      'Graham', 'Heath', 'Clifford', 'Vaughan', 'Butler', 'Barnes', 'Fleming',
      'Spencer', 'Chandler', 'Whitaker', 'Franklin', 'Perry', 'Marshall',
      'Carter', 'Henderson', 'Griffiths', 'Mason', 'Dawson', 'Armstrong',
      'Chambers', 'Anthony', 'Llewellyn', 'Hargreaves', 'Fraser', 'Sinclair',
      'McCarthy', 'Gallagher', 'O’Brien', 'Callahan', 'Donovan', 'Sheridan',
    ],
    initiators: [
      'Eleanor Ashworth', 'George Whitcombe', 'Margaret Langley', 'Henry Pemberton',
      'Charlotte Ashford', 'Julian Morecombe', 'Isabella Cranston', 'Rupert Falworth',
      'Edward Kensington', 'Adeline Barrow', 'Philip Harrowby', 'Beatrice Locksley',
      'Danielle Whitfield',
    ],
    regions: [
      'Thames', 'Severn', 'Wessex', 'Mercia', 'Northumbria', 'Kent', 'Anglia',
      'Cornwall', 'Cumberland', 'Sussex', 'Essex', 'Lancashire', 'Yorkshire',
      'Devonshire', 'Caledonian', 'Ulster', 'Hibernian', 'Channel', 'Cotswoold',
      'Trent',
    ],
  },

  Canada: {
    male: [
      'Liam', 'Noah', 'William', 'James', 'Oliver', 'Benjamin', 'Lucas', 'Henry',
      'Theodore', 'Jack', 'Leo', 'Thomas', 'Ethan', 'Charles', 'Felix', 'Hugo',
      'Louis', 'Alexandre', 'Gabriel', 'Étienne', 'Samuel', 'Antoine', 'Mathieu',
      'Olivier', 'Julien', 'Nathan', 'Dylan', 'Cole', 'Braden', 'Carter', 'Evan',
      'Harjit', 'Arjun', 'Raj', 'Marcus', 'Tobias', 'Vincent', 'Camille',
    ],
    female: [
      'Olivia', 'Emma', 'Charlotte', 'Amelia', 'Sophie', 'Chloe', 'Ava', 'Isabella',
      'Mia', 'Grace', 'Lily', 'Madison', 'Avery', 'Hailey', 'Paige', 'Claire',
      'Camille', 'Émilie', 'Rosalie', 'Fleur', 'Juliette', 'Marie', 'Sofia',
      'Priya', 'Jasmina', 'Tasha', 'Renée', 'Sienna', 'Taylor', 'Morgan', 'Brooke',
      'Victoria', 'Shannon', 'Meghan',
    ],
    middleMale: [
      'James', 'William', 'Alexander', 'Michael', 'Thomas', 'Charles', 'Joseph',
      'Robert', 'Daniel', 'Joseph', 'Scott', 'David', 'Peter', 'Paul', 'Louise',
    ],
    middleFemale: [
      'Marie', 'Anne', 'Rose', 'Grace', 'Louise', 'Elizabeth', 'Jane', 'Claire',
      'Dawn', 'Ann', 'Joan', 'Suzanne', 'Denise', 'Rachel', 'Chantal',
    ],
    surnames: [
      'Smith', 'Brown', 'Tremblay', 'Martin', 'Roy', 'Wilson', 'Macdonald',
      'Gagnon', 'Taylor', 'Côté', 'Campbell', 'Johnson', 'Anderson', 'Leblanc',
      'Lee', 'Jones', 'White', 'Williams', 'Miller', 'Thompson', 'Grant', 'Moore',
      'Clark', 'Bouchard', 'Girard', 'Morin', 'Lavoie', 'Fortin', 'Gagné',
      'Ouellet', 'Pelletier', 'Bélanger', 'Bergeron', 'Roy', 'Fournier', 'Gauthier',
      'Caron', 'Cloutier', 'Dupuis', 'Lambert', 'Moreau', 'Laflamme', 'Trudeau',
      'Singh', 'Patel', 'Wong', 'Chan', 'Bhatt', 'Kaur', 'Grewal', 'Sandhu',
      'Hoskin', 'Baxter', 'Reynolds', 'Dalton', 'Fraser', 'Gallant', 'Parks',
    ],
    initiators: [
      'Jean-Marc Desjardins', 'Margaret Whitfield', 'Alexandre Bouchard',
      'Grace Tremblay', 'Howard Mackenzie', 'Louise Caron', 'Robert Langlois',
      'Margaret Sinclair', 'Serge Gagnon', 'Adrian Kowalski',
    ],
    regions: [
      'Ontario', 'Quebec', 'Maritime', 'Prairie', 'Rocky', 'Pacific',
      'Laurentian', 'Atlantic', 'Hudson', 'Great Lakes', 'Yukon', 'Northwest',
      'Acadian', 'St Lawrence', 'Niagara', 'Okanagan',
    ],
  },

  Germany: {
    male: [
      'Lukas', 'Jonas', 'Leon', 'Finn', 'Felix', 'Maximilian', 'Noah', 'Elias',
      'Paul', 'Julian', 'Tim', 'Jan', 'Niklas', 'Fabian', 'Tobias', 'Florian',
      'Christian', 'Stefan', 'Andreas', 'Michael', 'Thomas', 'Marcus', 'Alexander',
      'Daniel', 'Sebastian', 'Philipp', 'Moritz', 'Johannes', 'Henrik', 'Emil',
      'Otto', 'Karl', 'Friedrich', 'Wilhelm', 'Gustav', 'Matthias', 'Lars',
      'Björn', 'Nils', 'Jannik', 'Lennard', 'Marcel', 'Dejan', 'Yusuf', 'Amir',
    ],
    female: [
      'Marie', 'Sophie', 'Anna', 'Emma', 'Julia', 'Lena', 'Hannah', 'Laura',
      'Leonie', 'Maja', 'Clara', 'Lina', 'Nele', 'Mila', 'Greta', 'Marlene',
      'Friederike', 'Katharina', 'Sabine', 'Petra', 'Monika', 'Silke', 'Anja',
      'Ursula', 'Heike', 'Birgit', 'Aylin', 'Zehra', 'Fatima', 'Yasmin', 'Jasmin',
      'Elena', 'Milena', 'Mara', 'Lia', 'Theresa', 'Bianca',
    ],
    middleMale: [
      'Alexander', 'Michael', 'Christian', 'Johann', 'Sebastian', 'Thomas',
      'Daniel', 'Paul', 'Georg', 'Wilhelm', 'Karl', 'Friedrich', 'Josef',
      'André', 'Viktor',
    ],
    middleFemale: [
      'Maria', 'Anna', 'Katharina', 'Elisabeth', 'Franziska', 'Margarete',
      'Therese', 'Barbara', 'Julia', 'Christine', 'Angelika', 'Sophie',
    ],
    surnames: [
      'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner',
      'Becker', 'Schulz', 'Hoffmann', 'Koch', 'Richter', 'Klein', 'Wolf',
      'Neumann', 'Schwarz', 'Zimmermann', 'Braun', 'Krüger', 'Hofmann',
      'Hartmann', 'Lange', 'Schmitt', 'Werner', 'Schmitz', 'Krause', 'Meier',
      'Lehmann', 'Huber', 'Mayer', 'Walter', 'König', 'Maier', 'Fuchs', 'Peters',
      'Lang', 'Scholz', 'Möller', 'Weiß', 'Jung', 'Hahn', 'Schubert', 'Vogel',
      'Friedrich', 'Keller', 'Günther', 'Frank', 'Berger', 'Winkler', 'Roth',
      'Beck', 'Lorenz', 'Baumann', 'Franke', 'Albrecht', 'Schuster', 'Simon',
      'Ludwig', 'Böhm', 'Winter', 'Kraus', 'Martin', 'Schumacher', 'Krämer',
      'Vogt', 'Stein', 'Jäger', 'Otto', 'Sommer', 'Groß', 'Seidel', 'Heinrich',
    ],
    initiators: [
      'Johannes Brandt', 'Helga Weiss', 'Friedrich Albrecht', 'Katharina Sommer',
      'Wilhelm Krupp', 'Marlene Dietrich', 'Günter Hoffmann', 'Ursula Brandt',
      'Dieter Falk', 'Renate Schuster',
    ],
    regions: [
      'Bavarian', 'Rhenish', 'Saxon', 'Swabian', 'Prussian', 'Westphalian',
      'Hanoverian', 'Baden', 'Thuringian', 'Hessian', 'Mecklenburg', 'Hanseatic',
      'Palatine', 'Franconian', 'Alpine', 'Slavic March',
    ],
  },

  France: {
    male: [
      'Louis', 'Jules', 'Antoine', 'Pierre', 'Lucas', 'Hugo', 'Léo', 'Nathan',
      'Théo', 'Gabriel', 'Raphaël', 'Adam', 'Marius', 'Noé', 'Émile', 'Auguste',
      'Marcel', 'Henri', 'Jean', 'François', 'Philippe', 'Jacques', 'André',
      'Michel', 'Olivier', 'Sébastien', 'Christophe', 'Julien', 'Nicolas',
      'Alexandre', 'Baptiste', 'Gaspard', 'Bastien', 'Mathis', 'Amine', 'Karim',
      'Mehdi', 'Redouane', 'Cédric', 'Laurent',
    ],
    female: [
      'Marie', 'Jeanne', 'Françoise', 'Catherine', 'Nathalie', 'Isabelle',
      'Sylvie', 'Anne', 'Élise', 'Chloé', 'Léa', 'Camille', 'Manon', 'Juliette',
      'Margaux', 'Louise', 'Emma', 'Jade', 'Inès', 'Amélie', 'Sophie', 'Claire',
      'Céline', 'Élodie', 'Marion', 'Océane', 'Sabrina', 'Nadia', 'Karima',
      'Fatima', 'Aïcha', 'Amina', 'Yasmine', 'Leïla', 'Capucine', 'Romane',
      'Maëlle', 'Solène', 'Agnès', 'Brigitte',
    ],
    middleMale: [
      'Jean', 'Pierre', 'Louis', 'André', 'Michel', 'Henri', 'Jacques', 'Paul',
      'François', 'Alexandre', 'Marcel', 'Lucien', 'Gaston', 'Robert', 'Maurice',
    ],
    middleFemale: [
      'Marie', 'Anne', 'Jeanne', 'Louise', 'Élisabeth', 'Claire', 'Cécile',
      'Marguerite', 'Françoise', 'Suzanne', 'Hélène', 'Denise',
    ],
    surnames: [
      'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit',
      'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel',
      'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier', 'Morel',
      'Girard', 'André', 'Mercier', 'Dupont', 'Lambert', 'Bonnet', 'François',
      'Martinez', 'Legrand', 'Garnier', 'Faure', 'Rousseau', 'Blanc', 'Guérin',
      'Muller', 'Henry', 'Roussel', 'Nicolas', 'Perrin', 'Morin', 'Mathieu',
      'Clément', 'Gauthier', 'Dumont', 'Fontaine', 'Chevallier', 'Roche', 'Masson',
      'Perrot', 'Charlier', 'Descamps', 'Benoit', 'Renard', 'Carre', 'Colin',
      'Vidal', 'Renaud', 'Boucher', 'Prevost', 'Roy', 'Barbier', 'Lemoine',
      'Delmas', 'Beaumont', 'Bardy', 'Traoré', 'Diop', 'Ndiaye', 'Benali',
      'Haddad', 'Mansour',
    ],
    initiators: [
      'Jean-Baptiste Moreau', 'Élisabeth Auclair', 'Gabriel Beaumont',
      'Marguerite Delacroix', 'Henri Chevalier', 'Françoise Lemaire',
      'Antoine Vasseur', 'Claire Descamps', 'Rémi Fontbonne', 'Aïcha Benali',
    ],
    regions: [
      'Île-de-France', 'Provence', 'Burgundy', 'Gascony', 'Brittany', 'Alsace',
      'Normandy', 'Aquitaine', 'Lorraine', 'Languedoc', 'Dauphiné', 'Picardy',
      'Anjou', 'Berry', 'Champagne', 'Corsican', 'Flanders', 'Savoyard',
    ],
  },

  Australia: {
    male: [
      'Oliver', 'Noah', 'Jack', 'William', 'Henry', 'Charlie', 'Lucas', 'Leo',
      'Harrison', 'Cooper', 'Archie', 'Hunter', 'Mason', 'Zac', 'Mitchell', 'Craig',
      'Brendan', 'Luke', 'Nathan', 'Scott', 'Riley', 'Toby', 'Lachlan', 'Marcus',
      'Bradley', 'Cameron', 'Declan', 'Kip', 'Jarrah', 'Angus', 'Hamish', 'Fraser',
      'Dylan', 'Ethan', 'Ryan', 'Joshua', 'Thomas', 'Daniel', 'Matthew',
    ],
    female: [
      'Charlotte', 'Olivia', 'Mia', 'Amelia', 'Isla', 'Ava', 'Grace', 'Ruby',
      'Sophie', 'Chloe', 'Zoe', 'Emily', 'Lily', 'Ella', 'Matilda', 'Georgia',
      'Lucy', 'Holly', 'Emma', 'Hannah', 'Jasmine', 'Grace', 'Isabelle', 'Sarah',
      'Rebecca', 'Nicole', 'Tegan', 'Erin', 'Mackenzie', 'Sienna', 'Tahlia',
      'Skye', 'Bronwyn', 'Susan', 'Leanne',
    ],
    middleMale: [
      'James', 'William', 'Robert', 'Thomas', 'John', 'David', 'Alexander',
      'Michael', 'Charles', 'Edward', 'George', 'Henry', 'Peter', 'Scott',
      'Cameron', 'Joshua', 'Luke', 'Patrick',
    ],
    middleFemale: [
      'Marie', 'Ann', 'Rose', 'Jane', 'Louise', 'Elizabeth', 'Grace', 'Anne',
      'Kate', 'Claire', 'Ruth', 'Fiona', 'Megan', 'Louise', 'Dawn',
    ],
    surnames: [
      'Smith', 'Jones', 'Williams', 'Brown', 'Wilson', 'Taylor', 'Johnson',
      'Lee', 'Thompson', 'White', 'Walker', 'Martin', 'Moore', 'Anderson',
      'Thomas', 'Jackson', 'Harris', 'Robinson', 'Lewis', 'Clarke', 'Clark',
      'Walker', 'Hall', 'Allen', 'Young', 'Turner', 'King', 'Wright', 'Hill',
      'Green', 'Baker', 'Adams', 'Nelson', 'Carter', 'Mitchell', 'Roberts',
      'Campbell', 'Evans', 'Edwards', 'Collins', 'Stewart', 'Morris', 'Murphy',
      'Cook', 'Rogers', 'Morgan', 'Peterson', 'Cooper', 'Reed', 'Bailey', 'Bell',
      'Florin', 'Nguyen', 'Tran', 'Pham', 'Singh', 'Patel', 'O’Connor',
      'Maguire', 'Whelan', 'Kosciuszko', 'Harding', 'Farrell', 'Grant',
      'Beckett', 'Ashworth', 'Hargreaves', 'Lindqvist',
    ],
    initiators: [
      'James Whitmore', 'Margaret Sullivan', 'Roland Fairweather',
      'Elizabeth Carmichael', 'Henry Lockhart', 'Jacqueline Brennan',
      'Douglas Merriweather', 'Kathleen O’Grady', 'Arthur Fenwick',
      'Charlotte Picard',
    ],
    regions: [
      'Outback', 'Coastal', 'Northern', 'Southern', 'Western', 'Eastern',
      'Tropical', 'Desert', 'Reef', 'Inland', 'Federation', 'Southern Cross',
      'Blue Mountain', 'Grampian', 'Snowy', 'Darling',
    ],
  },

  Italy: {
    male: [
      'Francesco', 'Alessandro', 'Lorenzo', 'Matteo', 'Gabriele', 'Leonardo',
      'Andrea', 'Riccardo', 'Edoardo', 'Tommaso', 'Giuseppe', 'Giovanni',
      'Marco', 'Antonio', 'Paolo', 'Stefano', 'Davide', 'Luca', 'Simone',
      'Federico', 'Nicola', 'Roberto', 'Massimo', 'Alberto', 'Giulio', 'Vincenzo',
      'Salvatore', 'Angelo', 'Domenico', 'Pietro', 'Carlo', 'Enrico', 'Mario',
      'Luigi', 'Fabio', 'Giancarlo', 'Sandro', 'Bartolomeo', 'Cesare',
    ],
    female: [
      'Sofia', 'Giulia', 'Aurora', 'Alice', 'Ginevra', 'Emma', 'Giorgia',
      'Greta', 'Beatrice', 'Anna', 'Chiara', 'Francesca', 'Martina', 'Sara',
      'Elena', 'Giovanna', 'Maria', 'Rosa', 'Angela', 'Teresa', 'Caterina',
      'Paola', 'Alessia', 'Silvia', 'Valentina', 'Federica', 'Elisa', 'Isabella',
      'Ludovica', 'Vittoria', 'Camilla', 'Ambra', 'Sveva', 'Ottavia',
    ],
    middleMale: [
      'Maria', 'Giovanni', 'Andrea', 'Paolo', 'Luigi', 'Vincenzo', 'Antonio',
      'Francesco', 'Domenico', 'Pietro', 'Salvatore', 'Angelo', 'Raffaele', 'Gaetano',
    ],
    middleFemale: [
      'Maria', 'Giovanna', 'Anna', 'Rosa', 'Teresa', 'Caterina', 'Antonella',
      'Raffaella', 'Assunta', 'Carmela', 'Elisabetta', 'Fiora',
    ],
    surnames: [
      'Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo',
      'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Conti', 'De Luca',
      'Mancini', 'Costa', 'Giordano', 'Rizzo', 'Lombardi', 'Moretti', 'Barbieri',
      'Fontana', 'Santoro', 'Mariani', 'Rinaldi', 'Caruso', 'Ferrara', 'Galli',
      'Martini', 'Leone', 'Longo', 'Gentile', 'Martinelli', 'Vitale', 'Lombardo',
      'Serra', 'Coppola', 'De Santis', 'D\'Angelo', 'Marchetti', 'Parisi',
      'Villa', 'Conte', 'Ferraro', 'Fabbri', 'Sanna', 'De Rosa', 'Pellegrini',
      'Piras', 'D\'Amico', 'Messina', 'Monti', 'Negri', 'Sala', 'Farina',
      'Basile', 'Riva', 'Testa', 'Cattaneo', 'Morelli', 'Neri',
    ],
    initiators: [
      'Giuseppe Martelli', 'Elena Casagrande', 'Marco Ferretti',
      'Raffaella Nobile', 'Antonio Bellini', 'Teresa Lombardi',
      'Carlo Ruffini', 'Valentina De Sio', 'Salvatore Benedetto',
      'Giulia Massari',
    ],
    regions: [
      'Tuscan', 'Lombard', 'Venetian', 'Sicilian', 'Neapolitan', 'Piedmontese',
      'Apulian', 'Ligurian', 'Umbrian', 'Marche', 'Calabrian', 'Sardinian',
      'Roman', 'Emilian', 'Abruzzese', 'Friulian', 'Adriatic', 'Tyrrhenian',
    ],
  },

  Netherlands: {
    male: [
      'Daan', 'Sem', 'Lucas', 'Finn', 'Levi', 'Bram', 'Milan', 'Jayden',
      'Lars', 'Thomas', 'Jesse', 'Dirk', 'Jasper', 'Sven', 'Ruben', 'Niels',
      'Thijs', 'Mees', 'Willem', 'Hendrik', 'Cornelis', 'Jacobus', 'Gerrit',
      'Pieter', 'Johannes', 'Martijn', 'David', 'Erik', 'Niek', 'Stefan',
      'Mohamed', 'Amin', 'Youssef', 'Kwame',
    ],
    female: [
      'Emma', 'Julia', 'Sophie', 'Lotte', 'Lieke', 'Sanne', 'Tess', 'Maud',
      'Nora', 'Fleur', 'Isa', 'Evi', 'Sara', 'Toos', 'Grietje', 'Janna',
      'Hendrika', 'Cornelia', 'Margaretha', 'Elisabeth', 'Wilhelmina',
      'Anouk', 'Britt', 'Daphne', 'Eline', 'Femke', 'Hanneke', 'Ingrid',
      'Kirsten', 'Marjolein', 'Sabine', 'Yasmine', 'Fatima',
    ],
    middleMale: [
      'Johan', 'Pieter', 'Cornelis', 'Hendrik', 'Gerrit', 'Jan', 'Willem',
      'Jacobus', 'Adrianus', 'Johannes', 'Petrus', 'Theodorus',
    ],
    middleFemale: [
      'Maria', 'Anna', 'Johanna', 'Cornelia', 'Hendrika', 'Elisabeth',
      'Petronella', 'Margaretha', 'Wilhelmina', 'Catharina',
    ],
    surnames: [
      'De Jong', 'Jansen', 'De Vries', 'Van den Berg', 'Van Dijk', 'Bakker',
      'Janssen', 'Visser', 'Smit', 'Meijer', 'De Boer', 'Mulder', 'De Groot',
      'Bos', 'Vos', 'Peters', 'Hendriks', 'Van Leeuwen', 'Dekker', 'Brouwer',
      'De Wit', 'Dijkstra', 'Smits', 'De Graaf', 'Van der Meer', 'Kok',
      'Van der Berg', 'Hoekstra', 'Van Beek', 'Vermeulen', 'Blom', 'Post',
      'Willems', 'Veenstra', 'Timmermans', 'Van Dam', 'De Ruiter', 'Van der Laan',
      'Kuipers', 'Van Doorn', 'Prins', 'Jacobs', 'De Haan', 'Kramer', 'Ritmeester',
      'Van der Velde', 'El Moussaoui', 'Benali', 'Ait Benichou', 'Osei',
    ],
    initiators: [
      'Johannes van der Heijden', 'Margarethe Zweers', 'Pieter Wouters',
      'Catharina Snoek', 'Gerrit Brandsen', 'Elisabeth Vinke', 'Hendrik Bosman',
      'Anneke van Loon', 'Dirk Cornelissen', 'Fatima El Amrani',
    ],
    regions: [
      'Hollandic', 'Frisian', 'Gelderland', 'Brabant', 'Limburg', 'Zealand',
      'Utrecht', 'Overijssel', 'Groningen', 'Drenthe', 'Flevoland', 'Amstelland',
      'Rhenish', 'Coastal', 'Elder',
    ],
  },

  Spain: {
    male: [
      'Hugo', 'Mateo', 'Martín', 'Lucas', 'Leo', 'Daniel', 'Alejandro',
      'Alonso', 'Diego', 'Álvaro', 'Pablo', 'Javier', 'Adrián', 'Sergio',
      'David', 'Jorge', 'Miguel', 'Carlos', 'Antonio', 'José', 'Francisco',
      'Manuel', 'Rafael', 'Ángel', 'Luis', 'Fernando', 'Andrés', 'Jaime',
      'Santiago', 'Ramón', 'Guillermo', 'Iker', 'Josu', 'Marc', 'Ignasi',
      'Jofre', 'Gonzalo', 'Iván', 'Ruben', 'Sofian', 'Younes', 'Lamine',
    ],
    female: [
      'Lucía', 'Sofía', 'Martina', 'María', 'Julia', 'Paula', 'Emma', 'Olivia',
      'Carla', 'Alba', 'Valeria', 'Adriana', 'Carmen', 'Isabel', 'Lourdes',
      'Teresa', 'Marta', 'Marina', 'Silvia', 'Elena', 'Nuria', 'Rosa', 'Ana',
      'Beatriz', 'Cecilia', 'Amparo', 'Concepción', 'Dolores', 'Francisca',
      'Rocío', 'Estrella', 'Salvadora', 'Júlia', 'Laia', 'Mireia', 'Aina',
      'Nawel', 'Samira', 'Malika',
    ],
    middleMale: [
      'José', 'María', 'Antonio', 'Francisco', 'Javier', 'Manuel', 'Miguel',
      'Luis', 'Carlos', 'Ramón', 'Santiago', 'Ángel', 'Jorge', 'Vicente',
    ],
    middleFemale: [
      'María', 'José', 'Carmen', 'Isabel', 'Rosa', 'Dolores', 'Teresa',
      'Luisa', 'Pilar', 'Mercedes', 'Concepción', 'Amparo',
    ],
    surnames: [
      'García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez',
      'Sánchez', 'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández',
      'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez',
      'Navarro', 'Torres', 'Domínguez', 'Vázquez', 'Ramos', 'Gil', 'Ramírez',
      'Serrano', 'Blanco', 'Molina', 'Morales', 'Suárez', 'Ortega', 'Delgado',
      'Castro', 'Ortiz', 'Rubio', 'Marín', 'Sanz', 'Núñez', 'Iglesias',
      'Medina', 'Garrido', 'Cortés', 'Castillo', 'Santos', 'Lozano', 'Guerrero',
      'Cano', 'Prieto', 'Méndez', 'Cruz', 'Calvo', 'Gallego', 'Vidal',
      'El Amrani', 'Benali', 'Haddadi', 'Sahraoui', 'Ziani', 'Bennani',
    ],
    initiators: [
      'José Antonio Delgado', 'María Elena Salazar', 'Francisco Javier Torres',
      'Carmen Luisa Ibáñez', 'Andrés Márquez', 'Isabel Camino', 'Rafael Ochoa',
      'Nuria Villar', 'Gonzalo Prieto', 'Amina Benítez',
    ],
    regions: [
      'Castilian', 'Andalusian', 'Catalan', 'Galician', 'Basque', 'Valencian',
      'Asturian', 'Aragonese', 'Navarrese', 'Cantabrian', 'Extremaduran',
      'Murcian', 'Balearic', 'Canarian', 'Ríojan', 'Celtiberian', 'Iberian',
      'Levantine',
    ],
  },

  Japan: {
    male: [
      'Haruto', 'Sota', 'Yuto', 'Ren', 'Minato', 'Itsuki', 'Yamato', 'Kaito',
      'Taiga', 'Sora', 'Hinata', 'Kei', 'Takumi', 'Kenta', 'Daiki', 'Riku',
      'Shota', 'Tatsuya', 'Kazuya', 'Hiroshi', 'Kenji', 'Takashi', 'Masaru',
      'Akio', 'Yoshio', 'Osamu', 'Takeshi', 'Shinji', 'Naoki', 'Kazuki', 'Yuji',
      'Akira', 'Isamu', 'Noboru', 'Ryota', 'Shunya', 'Kosei', 'Tomo',
    ],
    female: [
      'Yui', 'Aoi', 'Hina', 'Rin', 'Sakura', 'Mei', 'Airi', 'Mio', 'Akari',
      'Haruka', 'Miku', 'Saki', 'Nanami', 'Ayaka', 'Riko', 'Ema', 'Yuka',
      'Kaori', 'Miyuki', 'Tomoko', 'Keiko', 'Yoko', 'Akiko', 'Chieko',
      'Emiko', 'Fumiko', 'Hanako', 'Junko', 'Kiyoko', 'Makiko', 'Noriko',
      'Reiko', 'Sachiko', 'Takako', 'Yasuko', 'Ayumi', 'Mai', 'Natsuki',
    ],
    middleMale: [],
    middleFemale: [],
    surnames: [
      'Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto',
      'Nakamura', 'Kobayashi', 'Kato', 'Yoshida', 'Yamada', 'Sasaki', 'Yamaguchi',
      'Matsumoto', 'Inoue', 'Kimura', 'Hayashi', 'Shimizu', 'Yamazaki',
      'Mori', 'Abe', 'Ikeda', 'Hashimoto', 'Yamashita', 'Ishikawa', 'Nakajima',
      'Maeda', 'Fujita', 'Ogawa', 'Goto', 'Okada', 'Hasegawa', 'Murakami',
      'Kondo', 'Ishii', 'Sakamoto', 'Endo', 'Aoki', 'Fujii', 'Nishimura',
      'Fukuda', 'Ota', 'Miura', 'Fujiwara', 'Okamoto', 'Matsuda', 'Nakagawa',
      'Nakano', 'Harada', 'Ono', 'Tamura', 'Takeuchi', 'Kaneko', 'Kudo',
      'Sugiyama', 'Ueda', 'Hirano', 'Kojima', 'Wada',
    ],
    initiators: [
      'Hiroshi Tanaka', 'Yoko Sato', 'Kenji Yamamoto', 'Akiko Watanabe',
      'Takeshi Nakamura', 'Reiko Ito', 'Shinji Kobayashi', 'Emi Takahashi',
      'Kazuo Suzuki', 'Midori Kato',
    ],
    regions: [
      'Kansai', 'Kanto', 'Tohoku', 'Hokkaido', 'Chugoku', 'Shikoku',
      'Kyushu', 'Chubu', 'Hokuriku', 'Tokai', 'Okinawan', 'Kitami',
      'Tosando', 'Saikaido', 'Eastern Sea', 'Northern Land',
    ],
  },

  Brazil: {
    male: [
      'Miguel', 'Davi', 'Arthur', 'Gabriel', 'Bernardo', 'Heitor', 'Lorenzo',
      'Theo', 'Pedro', 'João', 'Lucas', 'Mateus', 'Rafael', 'Gustavo', 'Felipe',
      'Bruno', 'André', 'Caio', 'Thiago', 'Vinícius', 'Rodrigo', 'Marcelo',
      'Eduardo', 'Fernando', 'Paulo', 'Sergio', 'Marcos', 'Antônio', 'José',
      'Francisco', 'Carlos', 'Luiz', 'Manoel', 'Iago', 'Cauê', 'Enzo', 'Yuri',
      'Kleber', 'Wanderson', 'Leonardo', 'Ricardo',
    ],
    female: [
      'Alice', 'Sophia', 'Helena', 'Valentina', 'Laura', 'Isabela', 'Manuela',
      'Julia', 'Cecília', 'Lorena', 'Larissa', 'Fernanda', 'Camila', 'Mariana',
      'Beatriz', 'Leticia', 'Gabriela', 'Isadora', 'Clara', 'Rebecca', 'Natália',
      'Amanda', 'Bruna', 'Carolina', 'Patrícia', 'Juliana', 'Vanessa', 'Tatiane',
      'Renata', 'Sandra', 'Luciana', 'Adriana', 'Cristina', 'Ana', 'Maria',
      'Raquel', 'Débora', 'Esther', 'Moema', 'Janaína', 'Tainá',
    ],
    middleMale: [
      'José', 'Antônio', 'Carlos', 'Luiz', 'João', 'Paulo', 'Vitor', 'Rafael',
      'Gabriel', 'Marcos', 'Sergio', 'Eduardo',
    ],
    middleFemale: [
      'Maria', 'Ana', 'Josefa', 'Clara', 'Vitória', 'Lúcia', 'Helena',
      'Regina', 'Aparecida', 'Conceição', 'Ester', 'Rita',
    ],
    surnames: [
      'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira',
      'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Carvalho',
      'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa',
      'Rocha', 'Dias', 'Nascimento', 'Moreira', 'Nunes', 'Moraes', 'Cardoso',
      'Teixeira', 'Ramos', 'Correia', 'Gonçalves', 'Mendes', 'Pinto',
      'Araújo', 'Cavalcanti', 'Monteiro', 'Cardoso', 'Martins', 'Freitas',
      'Campos', 'Duarte', 'Sales', 'Borges', 'Baptista', 'Farias', 'Lacerda',
      'Braga', 'Assis', 'Barros', 'Azevedo', 'Rezende', 'Batista', 'Peixoto',
      'Silveira', 'Fontes', 'Tavares', 'Coutinho', 'Andrade', 'Nogueira',
      'Xavier', 'Bittencourt', 'Montenegro',
    ],
    initiators: [
      'José Carlos Andrade', 'Dona Elisa Montalvão', 'Pedro Henrique Vasconcelos',
      'Mariana Duarte', 'Antônio Bittencourt', 'Rosa Pimentel', 'Caio Leitão',
      'Sofia Castanheira', 'Valter Coutinho', 'Luciana Fernandes',
    ],
    regions: [
      'Amazon', 'Sertão', 'Pantanal', 'Gaúcho', 'Caipira', 'Mineiro',
      'Floripa', 'Carioca', 'Nordeste', 'Norte', 'Centro-Oeste', 'Paulista',
      'Serra', 'Litorânea', 'Cerrado', 'Pampa',
    ],
  },

  India: {
    male: [
      'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Reyansh', 'Mohammed',
      'Shaurya', 'Ayaan', 'Ishaan', 'Krishna', 'Kabir', 'Rohan', 'Aryan',
      'Raj', 'Sanjay', 'Vikram', 'Rahul', 'Amit', 'Suresh', 'Ramesh',
      'Mahesh', 'Vishal', 'Ankit', 'Nikhil', 'Arnav', 'Advait', 'Pranav',
      'Dhruv', 'Karthik', 'Venkatesh', 'Selva', 'Murugan', 'Balaji', 'Siddharth',
      'Manav', 'Yuvraj', 'Harpreet', 'Jasdeep', 'Vikrant', 'Sameer', 'Imran',
      'Faisal', 'Afzal', 'Dev', 'Hari', 'Naveen', 'Pradeep',
    ],
    female: [
      'Aaradhya', 'Diya', 'Ananya', 'Aadhya', 'Anika', 'Navya', 'Myra',
      'Saanvi', 'Aisha', 'Paridhi', 'Priya', 'Kavya', 'Riya', 'Ishika',
      'Meera', 'Ritu', 'Sunita', 'Anita', 'Kavita', 'Pooja', 'Neha',
      'Divya', 'Shreya', 'Nisha', 'Lakshmi', 'Radha', 'Meenakshi', 'Jayanthi',
      'Lalitha', 'Padma', 'Gurdeep', 'Simran', 'Hardeep', 'Sultana', 'Farida',
      'Yasmin', 'Deepika', 'Rashmi', 'Anjali', 'Swati', 'Gayatri',
    ],
    middleMale: [],
    middleFemale: [],
    surnames: [
      'Sharma', 'Verma', 'Gupta', 'Kumar', 'Patel', 'Reddy', 'Rao',
      'Iyer', 'Nair', 'Menon', 'Pillai', 'Das', 'Ghosh', 'Banerjee',
      'Chatterjee', 'Mukherjee', 'Bose', 'Dutta', 'Chowdhury', 'Khan',
      'Ansari', 'Shaikh', 'Desai', 'Joshi', 'Kulkarni', 'Patil', 'Shinde',
      'Naik', 'Pawar', 'Gill', 'Bajwa', 'Sekhon', 'Chauhan', 'Yadav',
      'Rathore', 'Shekhawat', 'Pandey', 'Mishra', 'Tiwari', 'Dubey', 'Tripathi',
      'Saxena', 'Agarwal', 'Malhotra', 'Mehta', 'Kapoor', 'Kohli', 'Sethi',
      'Chopra', 'Bhatia', 'Arora', 'Bhalla', 'Suri', 'Nanda', 'Sundaram',
    ],
    femaleOnlySurnames: ['Kaur'],
    maleOnlySurnames: ['Singh'],
    initiators: [
      'Rajendra Singh', 'Lakshmi Narayanan', 'Amitabh Shukla', 'Meera Krishnan',
      'Subramanian Iyer', 'Harpreet Kaur', 'Vikramaditya Rao', 'Anjali Deshmukh',
      'Mohan Prasad', 'Gurmeet Singh',
    ],
    regions: [
      'Himalayan', 'Gangetic', 'Deccan', 'Malabar', 'Konkan', 'Coromandel',
      'Punjab', 'Rajasthan', 'Gujarat', 'Bengal', 'Assam', 'Karnataka',
      'Tamil', 'Telugu', 'Odisha', 'Maratha', 'Kashmiri', 'Sindhi',
    ],
  },

  'United Arab Emirates': {
    male: [
      'Mohammed', 'Ahmed', 'Omar', 'Ali', 'Khalid', 'Hamdan', 'Rashid',
      'Saif', 'Saeed', 'Majed', 'Faisal', 'Abdullah', 'Khalifa', 'Zayed',
      'Sultan', 'Nasser', 'Hassan', 'Yousef', 'Salem', 'Tariq', 'Humaid',
      'Marwan', 'Jassim', 'Nawaf', 'Fahad', 'Turki', 'Walid', 'Hisham',
      'Talal', 'Munir', 'Samir', 'Nabil', 'Ghassan', 'Mahmoud',
    ],
    female: [
      'Fatima', 'Aisha', 'Mariam', 'Layla', 'Noura', 'Hessa', 'Shamsa',
      'Amna', 'Mozah', 'Salama', 'Khaloud', 'Sara', 'Noor', 'Zainab',
      'Huda', 'Rania', 'Adel', 'Afra', 'Alia', 'Hind', 'Mahra', 'Moza',
      'Rashida', 'Samira', 'Wafaa', 'Nadine', 'Lina', 'Dana',
    ],
    middleMale: [
      'Mohammed', 'Ahmed', 'Ali', 'Khalid', 'Abdel', 'Abdullah', 'Said', 'Hamad',
    ],
    middleFemale: ['Mohammed', 'Ahmed', 'Ali', 'Abdullah', 'Saeed', 'Hamad'],
    surnames: [
      'Al Maktoum', 'Al Nahyan', 'Al Shamsi', 'Al Mazrouei', 'Al Suwaidi',
      'Al Hameli', 'Al Zaabi', 'Al Marri', 'Al Nuaimi', 'Al Qubaisi',
      'Al Mansoori', 'Al Falasi', 'Al Marzooqi', 'Al Ketbi', 'Al Shamsi',
      'Al Neyadi', 'Al Tayer', 'Al Farsi', 'Al Habsi', 'Al Balushi',
      'Al Darmaki', 'Al Hammadi', 'Al Kaabi', 'Al Ghafli', 'Al Blooshi',
      'Al Dhaheri', 'Al Awadhi', 'Al Attas', 'Al Zarooni', 'Al Shehhi',
      'Al Rais', 'Al Midfa', 'El Amine', 'Kaddoura', 'Sabbagh', 'Fakhoury',
      'Haddad', 'Rahman', 'Chaudhry', 'Malik', 'Qureshi', 'Zaidi',
    ],
    initiators: [
      'Sheikh Khalid Al Mazrouei', 'Fatima Al Suwaidi', 'Majed Al Shamsi',
      'Aisha Al Ketbi', 'Nasser Al Mansoori', 'Layla Al Falasi',
      'Hamdan Al Tayer', 'Noura Al Marri', 'Saif Al Qubaisi', 'Mariam Al Zaabi',
    ],
    regions: [
      'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Ras Al Khaimah',
      'Fujairah', 'Umm Al Quwain', 'Al Ain Oasis', 'Liwa', 'Hajar',
      'Coastal Gulf', 'Al Dhafra', 'Northern Emirates', 'Eastern Hajar',
    ],
  },

  Belgium: {
    male: [
      'Arthur', 'Nathan', 'Louis', 'Victor', 'Maxime', 'Lucas', 'Gauthier',
      'Hugo', 'Adam', 'Jules', 'Arne', 'Lars', 'Wout', 'Rune', 'Senne',
      'Stan', 'Lander', 'Milan', 'Kobe', 'Bram', 'Pieter', 'Jan', 'Marc',
      'Luc', 'Georges', 'Henri', 'Charles', 'Emile', 'François', 'Thibaut',
      'Quentin', 'Antoine', 'Baptiste', 'Mehdi', 'Yassine', 'Bilal',
    ],
    female: [
      'Emma', 'Olivia', 'Louise', 'Mila', 'Camille', 'Elise', 'Alice',
      'Lucie', 'Chloé', 'Justine', 'Claire', 'Léa', 'Noor', 'Amber', 'Fien',
      'Lotte', 'Marie', 'Elena', 'Julie', 'Sanne', 'Inne', 'Annelies',
      'Barbara', 'Céline', 'Nathalie', 'Sandra', 'Valérie', 'Mieke', 'Katrien',
      'Fatima', 'Aminata', 'Hawa', 'Laïla', 'Zohra',
    ],
    middleMale: [
      'Jean', 'Pierre', 'Louis', 'Paul', 'Marie', 'Charles', 'Henri',
      'Joseph', 'Antoine', 'Pieter', 'Frans', 'Gerard',
    ],
    middleFemale: [
      'Marie', 'Louise', 'Anne', 'Cécile', 'Ine', 'Katrien', 'Elise',
      'Claire', 'Josée', 'Jeanne',
    ],
    surnames: [
      'Peeters', 'Janssens', 'Maes', 'Jacobs', 'Mertens', 'Willems',
      'Claes', 'Wouters', 'Goossens', 'Dubois', 'Lambert', 'Martin',
      'Dupont', 'Dumont', 'Simon', 'Bernard', 'Bogaert', 'De Smet',
      'Vermeulen', 'Van Der Veken', 'Segers', 'Vandenberghe', 'De Winter',
      'Pauwels', 'Dewulf', 'Van Damme', 'Stevens', 'Nelissen', 'Geerts',
      'Van Den Broeck', 'Van Der Heyden', 'Leroy', 'Renard', 'Morel',
      'Fournier', 'Mbala', 'Kabila', 'Bemba', 'Tshimanga', 'Diallo',
      'Barry', 'Sylla', 'Kone',
    ],
    initiators: [
      'Jean-Pierre Dumont', 'Katrien Verbeke', 'Henri Moreau',
      'Annelies Peeters', 'Charles Vandermolen', 'Fatou Diallo',
      'Ludo Janssens', 'Charlotte De Ridder',
    ],
    regions: [
      'Flemish', 'Walloon', 'Brussels', 'Ardennes', 'Coastal', 'Meuse',
      'Scheldt', 'Hainaut', 'Limburgish', 'Famenne', 'Campine', 'Pays de Herve',
    ],
  },

  'South Korea': {
    male: [
      'Min-jun', 'Seo-jun', 'Ha-jun', 'Ji-ho', 'Do-yun', 'Ye-jun', 'Si-woo',
      'Jun-seo', 'Hyun-woo', 'Ji-hoon', 'Jae-hyun', 'Sung-min', 'Dong-hyun',
      'Kang-min', 'Tae-yang', 'Woo-jin', 'Young-jin', 'Byung-ho', 'Chan-ho',
      'Jeong-ho', 'Kyung-soo', 'Soo-hyun', 'Yeon-jun', 'Yoo-jin', 'In-sung',
      'Jin-woo', 'Dae-sung', 'Hoon', 'Suk-jin', 'Wan-ki', 'Ho-jun', 'Ki-tae',
    ],
    female: [
      'Seo-yeon', 'Ji-woo', 'Yu-na', 'Ha-eun', 'Min-seo', 'Da-eun', 'Chae-won',
      'Ha-rin', 'Ji-yoon', 'Su-bin', 'Ye-jin', 'Soo-min', 'Hye-jin', 'Eun-ji',
      'Bo-ram', 'Ji-hye', 'Na-young', 'Hana', 'So-young', 'Mi-sook', 'Young-ja',
      'Sun-young', 'Hee-jin', 'Kyung-mi', 'Ae-ri', 'Yeon-hee', 'Bora', 'Sujin',
      'Yoon-ah', 'Hyun-ah', 'Ga-eul', 'Na-rae',
    ],
    middleMale: [],
    middleFemale: [],
    surnames: [
      'Kim', 'Lee', 'Park', 'Choi', 'Jung', 'Kang', 'Cho', 'Yoon', 'Jang',
      'Lim', 'Han', 'Oh', 'Seo', 'Shin', 'Kwon', 'Hwang', 'An', 'Song',
      'Ryu', 'Hong', 'Ko', 'Moon', 'Son', 'Yang', 'Bae', 'Baek', 'Chun',
      'Heo', 'Nam', 'Shim', 'Yoo', 'Jeong', 'Gang', 'Ha', 'Kwak', 'Noh',
      'Do', 'Min', 'Woo', 'Byun', 'Im', 'Cha', 'Seong', 'Mun', 'Pyo',
      'Kang', 'Yoon',
    ],
    initiators: [
      'Min-jun Kang', 'Ji-woo Park', 'Hye-jin Kim', 'Jae-hyun Lee',
      'Soo-min Choi', 'Dong-hyun Jung', 'Yu-na Yoon', 'Sung-min Lim',
    ],
    regions: [
      'Seoul', 'Gyeonggi', 'Gangwon', 'Chungcheong', 'Jeolla', 'Gyeongsang',
      'Hamgyeong', 'Pyeongan', 'Hwanghae', 'Jeju', 'Honam', 'Yeongnam',
      'Eastern Sea', 'Yellow Sea',
    ],
  },

  'Saudi Arabia': {
    male: [
      'Mohammed', 'Abdullah', 'Fahad', 'Khaled', 'Turki', 'Salman', 'Nasser',
      'Sultan', 'Mansour', 'Bandar', 'Saud', 'Naif', 'Mishal', 'Faisal',
      'Yasser', 'Majed', 'Waleed', 'Sami', 'Hassan', 'Hussein', 'Ibrahim',
      'Saad', 'Abdulaziz', 'Abdulrahman', 'Othman', 'Abdullah', 'Talib',
      'Zafer', 'Nawaf', 'Rakan', 'Ghazi', 'Motaz', 'Youssef', 'Karim',
    ],
    female: [
      'Noura', 'Sara', 'Lama', 'Reem', 'Nada', 'Rania', 'Dana', 'Abeer',
      'Huda', 'Amani', 'Hanan', 'Maha', 'Samar', 'Wafa', 'Rasha', 'Aljohara',
      'Lulwa', 'Moudi', 'Nailah', 'Sultana', 'Basma', 'Jawaher', 'Munira',
      'Saida', 'Zainab', 'Aisha', 'Mariam', 'Hessa',
    ],
    middleMale: [
      'Mohammed', 'Abdullah', 'Abdulaziz', 'Abdulrahman', 'Khalid', 'Fahad',
      'Salman', 'Hamad', 'Ibrahim',
    ],
    middleFemale: ['Mohammed', 'Abdullah', 'Khalid', 'Salman', 'Abdulaziz', 'Omar'],
    surnames: [
      'Al-Saud', 'Al-Harbi', 'Al-Otaibi', 'Al-Ghamdi', 'Al-Mutairi',
      'Al-Dossari', 'Al-Qahtani', 'Al-Zahrani', 'Al-Shammari', 'Al-Anazi',
      'Al-Subaie', 'Al-Dosari', 'Al-Hazmi', 'Al-Shahrani', 'Al-Aqeel',
      'Al-Shehri', 'Al-Asmari', 'Al-Juhani', 'Al-Balawi', 'Al-Sulami',
      'Al-Marri', 'Al-Rashed', 'Al-Ahmad', 'Al-Bassam', 'Al-Fahad',
      'Al-Mansour', 'Al-Wahibi', 'Al-Zamil', 'Al-Rajhi', 'Al-Qadi',
      'Al-Farraj', 'Al-Mousa', 'Al-Sayed', 'Al-Habib', 'Al-Salem',
    ],
    initiators: [
      'Sheikh Nasser Al-Harbi', 'Reem Al-Qahtani', 'Abdulrahman Al-Shehri',
      'Noura Al-Otaibi', 'Sultan Al-Mutairi', 'Lama Al-Dossari',
      'Khalid Al-Ghamdi', 'Maha Al-Zahrani',
    ],
    regions: [
      'Najdi', 'Hejazi', 'Eastern Province', 'Asir', 'Tabuk', 'Jazan',
      'Qassim', 'Hail', 'Riyadh', 'Makkah', 'Madinah', 'Al-Ula', 'Dawadmi',
      'Rub Al Khali',
    ],
  },

  Switzerland: {
    male: [
      'Luca', 'Noah', 'Leon', 'Loris', 'David', 'Simon', 'Janik', 'Jonas',
      'Fabio', 'Mattia', 'Damian', 'Marco', 'Nicola', 'Alessandro', 'Dario',
      'Gian', 'Yann', 'Olivier', 'Théo', 'Bastian', 'Lukas', 'Marc', 'Hans',
      'Peter', 'Urs', 'Heinrich', 'Beat', 'Reto', 'Andreas', 'Michael',
      'Mehdi', 'Alain', 'Blaise', 'Sébastien',
    ],
    female: [
      'Emma', 'Mia', 'Lea', 'Lena', 'Anna', 'Giulia', 'Sofia', 'Nora',
      'Lara', 'Nina', 'Elisa', 'Chiara', 'Martina', 'Simona', 'Yara',
      'Chloé', 'Camille', 'Julie', 'Manon', 'Sandra', 'Laura', 'Daniela',
      'Heidi', 'Gretchen', 'Monika', 'Verena', 'Elisabeth', 'Regula',
      'Amina', 'Sabine', 'Corinne', 'Sylvie',
    ],
    middleMale: [
      'Hans', 'Peter', 'Urs', 'Thomas', 'Michael', 'Rudolf', 'Andreas',
      'Marcel', 'Jean', 'Gian', 'Luc', 'Paul',
    ],
    middleFemale: [
      'Maria', 'Anna', 'Elisabeth', 'Verena', 'Margrit', 'Katharina',
      'Marie', 'Louise', 'Claudia', 'Heidi',
    ],
    surnames: [
      'Müller', 'Meier', 'Schmid', 'Keller', 'Weber', 'Huber', 'Schneider',
      'Studer', 'Meyer', 'Brunner', 'Frei', 'Steiner', 'Arnold', 'Baumann',
      'Imhof', 'Moser', 'Widmer', 'Schärer', 'Bürgi', 'Zaugg', 'Lüthi',
      'Bertschi', 'Bieri', 'Eberhard', 'Felder', 'Gerber', 'Hirt', 'Jaggi',
      'Kälin', 'Lehmann', 'Marti', 'Nyffeler', 'Ruch', 'Suter', 'Tanner',
      'Vogel', 'Weissenberger', 'Zbinden', 'Berset', 'Moret', 'Favre',
      'Girardin', 'Perret', 'Rochat', 'Rey', 'Maillard', 'Della Valle',
      'Bianchi', 'Nieto', 'Oliveira', 'Kostic', 'Terzic', 'Hodzic',
    ],
    initiators: [
      'Karl Meierhans', 'Elisabeth Büchler', 'Reto Stäheli', 'Marianne Wyss',
      'Giovanni Hintermann', 'Catherine Villard', 'Urs Scheidegger',
      'Regula Ammann', 'Fritz Lanz', 'Yasmine Kessler',
    ],
    regions: [
      'Alpine', 'Bernese', 'Zürcher', 'Genevan', 'Vaudois', 'Grison',
      'Valaisan', 'Ticinese', 'Basel', 'Lucernese', 'Appenzell', 'Bernina',
      'Jura', 'Lemanic', 'Rhodanic', 'Ostschweiz',
    ],
  },

  Norway: {
    male: [
      'Jakob', 'Emil', 'Lucas', 'Liam', 'Oskar', 'Henrik', 'Magnus', 'Noah',
      'Filip', 'Oliver', 'Elias', 'Mathias', 'William', 'Johannes', 'Anders',
      'Bjørn', 'Lars', 'Erik', 'Ole', 'Per', 'Jan', 'Knut', 'Nils', 'Svein',
      'Harald', 'Erling', 'Sigurd', 'Olav', 'Leif', 'Rune', 'Stian', 'Espen',
      'Trond', 'Petter', 'Jonas', 'Kristian', 'Sondre', 'Even', 'Vetle',
      'Håkon', 'Morten', 'Geir', 'Steinar', 'Ragnar',
    ],
    female: [
      'Nora', 'Emma', 'Ella', 'Maja', 'Ida', 'Sofie', 'Ingrid', 'Emilie',
      'Hedda', 'Thea', 'Mie', 'Linnea', 'Frida', 'Sara', 'Astrid', 'Inger',
      'Gunnhild', 'Kari', 'Bente', 'Liv', 'Sigrid', 'Marit', 'Gro', 'Solveig',
      'Anne', 'Ingunn', 'Maren', 'Silje', 'Camilla', 'Katrine', 'Hilde',
      'Beate', 'Hege', 'Merethe', 'Tonje', 'Bodil', 'Ragnhild', 'Laila',
    ],
    middleMale: [],
    middleFemale: [],
    surnames: [
      'Hansen', 'Johansen', 'Olsen', 'Larsen', 'Andersen', 'Nilsen',
      'Pedersen', 'Berg', 'Haugen', 'Jensen', 'Karlsen', 'Johnsen', 'Pettersen',
      'Eriksen', 'Halvorsen', 'Kristiansen', 'Henriksen', 'Aas', 'Dahl',
      'Moen', 'Solberg', 'Ruud', 'Helland', 'Sørensen', 'Nygård', 'Bakken',
      'Ness', 'Vik', 'Myhre', 'Lie', 'Holm', 'Hagen', 'Berntsen', 'Mikkelsen',
      'Strand', 'Ødegård', 'Knutsen', 'Sæther', 'Lund', 'Gundersen', 'Rasmussen',
      'Isaksen', 'Birkeland', 'Tveit', 'Fjeld', 'Amundsen', 'Hellerud',
      'Vollan', 'Skrede',
    ],
    initiators: [
      'Bjørn Halvorsen', 'Ingrid Solheim', 'Lars Mikkelsen', 'Astrid Nyhus',
      'Erik Bjerkeseth', 'Maren Gundersen', 'Sven Ødegård', 'Kari Møller',
    ],
    regions: [
      'Fjord', 'Northern', 'Western', 'Eastern', 'Sørland', 'Trøndelag',
      'Northern Lights', 'Polar', 'Midlands', 'Nordland', 'Vestlandet',
      'Midt-Norge', 'Southern Coast', 'Finnmark',
    ],
  },

  Sweden: {
    male: [
      'William', 'Elias', 'Noah', 'Oscar', 'Hugo', 'Adam', 'Liam', 'Axel',
      'Erik', 'Lars', 'Karl', 'Gustav', 'Anders', 'Johan', 'Nils', 'Sven',
      'Bengt', 'Per', 'Olof', 'Henrik', 'Magnus', 'Fredrik', 'Jonas',
      'Daniel', 'Sebastian', 'Albin', 'Viktor', 'Rasmus', 'Emil', 'Felix',
      'Louie', 'Malte', 'Milo', 'Theo', 'Valle',
    ],
    female: [
      'Alice', 'Maja', 'Ella', 'Astrid', 'Elsa', 'Freja', 'Alva', 'Ida',
      'Ebba', 'Lilly', 'Wilma', 'Klara', 'Moa', 'Sara', 'Emma', 'Anna',
      'Maria', 'Karin', 'Ingrid', 'Eva', 'Birgitta', 'Gunilla', 'Lena',
      'Susanne', 'Camilla', 'Linnea', 'Julia', 'Hanna', 'Nora', 'Stina',
      'Tova', 'Märta', 'Vera',
    ],
    middleMale: [],
    middleFemale: [],
    surnames: [
      'Andersson', 'Johansson', 'Karlsson', 'Nilsson', 'Eriksson', 'Larsson',
      'Olsson', 'Persson', 'Svensson', 'Gustafsson', 'Pettersson', 'Jonsson',
      'Jansson', 'Hansson', 'Bengtsson', 'Jönsson', 'Lindberg', 'Lindqvist',
      'Lindgren', 'Bergström', 'Sandberg', 'Bergman', 'Lindström', 'Hedberg',
      'Nyström', 'Lundgren', 'Ljung', 'Lundberg', 'Söderberg', 'Boman',
      'Karlborg', 'Eklund', 'Ström', 'Holm', 'Åkesson', 'Berglund',
      'Forsberg', 'Wallin', 'Gunnarsson', 'Öberg', 'Halvarsson',
    ],
    initiators: [
      'Gustav Lindström', 'Ingrid Falk', 'Anders Haglund', 'Märta Blomqvist',
      'Erik Sjöberg', 'Carina Lundberg', 'Sven Öberg', 'Annika Ekström',
    ],
    regions: [
      'Gothenburg', 'Stockholm', 'Malmö', 'Uppsala', 'Northern Norrland',
      'Svealand', 'Götaland', 'Dalarna', 'Småland', 'Skåne', 'Värmland',
      'Östergötland', 'Norrland', 'Western Coast', 'Gulf of Bothnia',
    ],
  },

  Mexico: {
    male: [
      'Santiago', 'Mateo', 'Sebastián', 'León', 'Alejandro', 'Diego',
      'Emiliano', 'Javier', 'Carlos', 'Miguel', 'Fernando', 'Jorge', 'Luis',
      'Juan', 'José', 'Francisco', 'Manuel', 'Ricardo', 'Andrés', 'Raúl',
      'Héctor', 'Arturo', 'Enrique', 'Alberto', 'Gabriel', 'Eduardo',
      'Rodrigo', 'Óscar', 'David', 'Pedro', 'Pablo', 'Iván', 'Héctor',
      'Rogelio', 'César', 'Ignacio', 'Salvador', 'Benjamín', 'Adán',
      'Efraín', 'Joaquín', 'Demetrio',
    ],
    female: [
      'Sofía', 'Valentina', 'Camila', 'Renata', 'María', 'Fernanda',
      'Ximena', 'Daniela', 'Andrea', 'Carolina', 'Paola', 'Gabriela',
      'Alicia', 'Luz', 'Guadalupe', 'Carmen', 'Martha', 'Verónica',
      'Patricia', 'Alejandra', 'Adriana', 'Rocío', 'Beatriz', 'Dolores',
      'Esperanza', 'Graciela', 'Laura', 'Mónica', 'Silvia', 'Rosa',
      'Elizabeth', 'Brenda', 'Karen', 'Mariana', 'Jimena', 'Paulina',
      'Regina', 'Estefanía', 'Montserrat', 'Citlali', 'Xóchitl', 'Itzel',
    ],
    middleMale: [
      'José', 'María', 'Antonio', 'Luis', 'Fernando', 'Javier', 'Juan',
      'Carlos', 'Miguel', 'Ángel', 'Alberto', 'Jesús',
    ],
    middleFemale: ['María', 'José', 'Guadalupe', 'Luz', 'Rosa', 'Esperanza', 'Cristina', 'Alicia'],
    surnames: [
      'García', 'Martínez', 'López', 'Hernández', 'González', 'Pérez',
      'Rodríguez', 'Sánchez', 'Ramírez', 'Cruz', 'Flores', 'Gómez',
      'Morales', 'Vázquez', 'Reyes', 'Jiménez', 'Torres', 'Díaz', 'Gutiérrez',
      'Mendoza', 'Aguilar', 'Ruiz', 'Castillo', 'Herrera', 'Moreno', 'Ortiz',
      'Ramos', 'Chávez', 'Vargas', 'Rivera', 'Salazar', 'Luna', 'Lara',
      'Rojas', 'Ortega', 'Vega', 'Huerta', 'Delgado', 'Castro', 'Molina',
      'Zavala', 'Cárdenas', 'Zapata', 'Maldonado', 'Álvarez', 'Bautista',
      'Tejeda', 'Ochoa', 'Galván', 'Márquez',
    ],
    initiators: [
      'José Luis Covarrubias', 'Guadalupe Sánchez', 'Miguel Ángel Vega',
      'Rosa María Robles', 'Alfredo Castellanos', 'Verónica Aldana',
      'Enrique Beltrán', 'Socorro Nava',
    ],
    regions: [
      'Norteño', 'Bajío', 'Yucatán', 'Jalisco', 'Oaxacan', 'Veracruz',
      'Sinaloan', 'Tamaulipas', 'Chiapanecan', 'Sonoran', 'Michoacán',
      'Puebla', 'Guanajuato', 'Zacatecas', 'Tabasco', 'Pacific Coast',
    ],
  },

  Portugal: {
    male: [
      'Francisco', 'João', 'Afonso', 'Lourenço', 'Duarte', 'Miguel', 'Tomás',
      'Ricardo', 'Diogo', 'Gonçalo', 'Tiago', 'Nuno', 'Rui', 'Carlos',
      'António', 'José', 'Manuel', 'Pedro', 'Paulo', 'Jorge', 'Luís',
      'Filipe', 'Bruno', 'André', 'Hélder', 'Marco', 'Vítor', 'Ronaldo',
      'Álvaro', 'Bento', 'Cristiano',
    ],
    female: [
      'Maria', 'Leonor', 'Matilde', 'Carolina', 'Mariana', 'Beatriz',
      'Sofia', 'Inês', 'Alice', 'Francisca', 'Joana', 'Catarina', 'Ana',
      'Carla', 'Sandra', 'Paula', 'Teresa', 'Margarida', 'Isabel', 'Rita',
      'Marta', 'Luísa', 'Helena', 'Susana', 'Vera', 'Daniela', 'Raquel',
      'Bianca', 'Madalena', 'Érica', 'Estefânia',
    ],
    middleMale: ['José', 'Manuel', 'António', 'João', 'Carlos', 'Rui', 'Miguel', 'Luís'],
    middleFemale: ['Maria', 'Ana', 'José', 'Teresa', 'Isabel', 'Rita', 'Manuela', 'Fernanda'],
    surnames: [
      'Silva', 'Santos', 'Ferreira', 'Pereira', 'Oliveira', 'Costa', 'Rodrigues',
      'Martins', 'Jesus', 'Sousa', 'Fernandes', 'Gonçalves', 'Gomes', 'Lopes',
      'Marques', 'Alves', 'Almeida', 'Nunes', 'Ribeiro', 'Pinto', 'Cardoso',
      'Teixeira', 'Moreira', 'Correia', 'Mendes', 'Carvalho', 'Coelho',
      'Rocha', 'Neves', 'Araújo', 'Miranda', 'Barbosa', 'Morais', 'Freitas',
      'Campos', 'Torres', 'Barros', 'Batista', 'Fonseca', 'Machado', 'Tavares',
      'Figueiredo', 'Branco', 'Melo', 'Andrade', 'Monteiro', 'Queiroz',
      'Cordeiro', 'Xavier',
    ],
    initiators: [
      'António Silveira', 'Maria de Lurdes Barreto', 'João Campos',
      'Teresa Graça', 'Manuel Teles', 'Isilda Pimenta', 'Rui Golias',
      'Beatriz Valente',
    ],
    regions: [
      'Douro', 'Alentejo', 'Algarve', 'Minho', 'Estremadura', 'Beira',
      'Trás-os-Montes', 'Ribatejo', 'Açores', 'Madeira', 'Litoral',
      'Serra da Estrela', 'Lisboa', 'Porto', 'Coimbra', 'Tagus Valley',
    ],
  },

  Ireland: {
    male: [
      'Jack', 'James', 'Noah', 'Conor', 'Fionn', 'Liam', 'Oisín', 'Seán',
      'Cillian', 'Rían', 'Eoin', 'Cathal', 'Niall', 'Darragh', 'Patrick',
      'Michael', 'Brendan', 'Declan', 'Aidan', 'Rory', 'Cian', 'Tadhg',
      'Lorcan', 'Eoghan', 'Odhran', 'Donal', 'Colm', 'Pádraig', 'Tomás',
      'Shane', 'Alan', 'Kevin', 'Cormac', 'Diarmuid',
    ],
    female: [
      'Aoife', 'Saoirse', 'Éabha', 'Caoimhe', 'Sophie', 'Amelia', 'Grace',
      'Éadaoin', 'Niamh', 'Ciara', 'Orla', 'Maeve', 'Siobhán', 'Aisling',
      'Máire', 'Frances', 'Bridget', 'Catherine', 'Margaret', 'Gráinne',
      'Roisin', 'Deirdre', 'Fiona', 'Imelda', 'Bernadette', 'Sinéad',
      'Clodagh', 'Ailbhe', 'Éilis', 'Sadhbh', 'Muirne', 'Fiadh',
    ],
    middleMale: ['Patrick', 'James', 'Joseph', 'Michael', 'John', 'Thomas', 'Francis', 'Gerard'],
    middleFemale: ['Anne', 'Marie', 'Mary', 'Rose', 'Brigid', 'Frances', 'Teresa', 'Catherine'],
    surnames: [
      'Murphy', 'Kelly', 'O’Sullivan', 'Walsh', 'Smith', 'O’Brien',
      'Byrne', 'Ryan', 'O’Connor', 'O’Neill', 'O’Brien', 'Doyle',
      'McCarthy', 'Gallagher', 'O’Doherty', 'Kennedy', 'Lynch', 'Murray',
      'Quinn', 'Moore', 'McLoughlin', 'O’Carroll', 'Connolly', 'Duffy',
      'Nolan', 'Kavanagh', 'Brennan', 'Cunningham', 'Donovan', 'Fitzgerald',
      'Hogan', 'Moran', 'McCabe', 'Maguire', 'Sheehan', 'Treacy', 'Keane',
      'Ahern', 'Lenehan', 'Power', 'O’Grady', 'Flaherty',
    ],
    initiators: [
      'Cormac Ó Rathaille', 'Bríd Ní Chonaill', 'Seamus Flanagan',
      'Máire Devereux', 'Fergal O’Meara', 'Niamh Callanan',
      'Diarmuid McGovern', 'Orla Keaney',
    ],
    regions: [
      'Connacht', 'Munster', 'Leinster', 'Ulster', 'Cork', 'Dublin',
      'Galway', 'Mayo', 'Kerry', 'Donegal', 'Wicklow', 'Wexford',
      'Midlands', 'West Coast', 'Shannon', 'Boyne',
    ],
  },

  Austria: {
    male: [
      'Lukas', 'Luis', 'Lorenz', 'Simon', 'Julian', 'Leon', 'David', 'Jakob',
      'Florian', 'Maximilian', 'Paul', 'Felix', 'Jonas', 'Moritz', 'Fabian',
      'Stefan', 'Thomas', 'Michael', 'Alexander', 'Christoph', 'Markus',
      'Andreas', 'Martin', 'Manuel', 'Wolfgang', 'Franz', 'Josef', 'Karl',
      'Hans', 'Peter', 'Gerhard', 'Rudolf', 'Oswald', 'Leopold', 'Benedikt',
    ],
    female: [
      'Anna', 'Leni', 'Marie', 'Lea', 'Sophie', 'Julia', 'Lena', 'Katharina',
      'Selina', 'Laura', 'Mira', 'Emma', 'Valentina', 'Nina', 'Elisabeth',
      'Sabine', 'Petra', 'Monika', 'Christine', 'Ursula', 'Theresia',
      'Wilhelmina', 'Gisela', 'Ingeborg', 'Friederike', 'Veronika', 'Helga',
      'Sieglinde', 'Edeltraut', 'Marion', 'Bettina', 'Claudia',
    ],
    middleMale: ['Josef', 'Michael', 'Karl', 'Franz', 'Johann', 'Peter', 'Andreas', 'Martin'],
    middleFemale: ['Maria', 'Anna', 'Barbara', 'Katharina', 'Elisabeth', 'Theresia', 'Magdalena', 'Rosina'],
    surnames: [
      'Gruber', 'Huber', 'Bauer', 'Wagner', 'Müller', 'Pichler', 'Steiner',
      'Moser', 'Mayer', 'Leitner', 'Schmid', 'Weber', 'Mair', 'Berger',
      'Hofer', 'Eder', 'Brunner', 'Auer', 'Reiter', 'Fischer', 'Schneider',
      'Wallner', 'Maier', 'Wimmer', 'Ebner', 'Schuster', 'Koller', 'Lehner',
      'Haas', 'Egger', 'Fuchs', 'Lang', 'Stockinger', 'Brandstätter',
      'Pühringer', 'Kogler', 'Rainer', 'Strasser', 'Zeilinger', 'Holzinger',
      'Pfeifer', 'Reisinger', 'Strobl', 'Winkler', 'Hagenauer', 'Seidl',
    ],
    initiators: [
      'Friedrich Unterberger', 'Katharina Söllner', 'Lorenz Hollaus',
      'Margarete Gartner', 'Stefan Zellhofer', 'Veronika Laubichler',
      'Andreas Obermüller', 'Gisela Fink',
    ],
    regions: [
      'Viennese', 'Tyrolean', 'Styrian', 'Carinthian', 'Salzburg',
      'Upper Austrian', 'Lower Austrian', 'Vorarlberg', 'Burgenland',
      'Danube', 'Alpine', 'Traunviertel', 'Waldviertel', 'Mostviertel',
    ],
  },

  Denmark: {
    male: [
      'William', 'Noah', 'Oliver', 'Christian', 'Magnus', 'Emil', 'Mikkel',
      'Lucas', 'Oscar', 'Elias', 'Jacob', 'Rasmus', 'Søren', 'Jens', 'Lars',
      'Peter', 'Anders', 'Niels', 'Henrik', 'Thomas', 'Mads', 'Jesper',
      'Martin', 'Carsten', 'Steffen', 'Morten', 'Kasper', 'Frederik',
      'Viktor', 'Anton', 'Malthe', 'Eskild', 'Valdemar', 'Gorm', 'Hjalte',
    ],
    female: [
      'Emma', 'Ida', 'Clara', 'Freja', 'Sofie', 'Maja', 'Lærke', 'Karla',
      'Alma', 'Astrid', 'Sofia', 'Anna', 'Maria', 'Kirsten', 'Mette',
      'Anne', 'Birgitte', 'Hanne', 'Susanne', 'Lone', 'Camilla', 'Lotte',
      'Signe', 'Trine', 'Malene', 'Charlotte', 'Jette', 'Bodil', 'Inger',
      'Vibeke', 'Nanna', 'Frida', 'Sif', 'Ragnhild',
    ],
    middleMale: [],
    middleFemale: [],
    surnames: [
      'Jensen', 'Nielsen', 'Hansen', 'Pedersen', 'Andersen', 'Christensen',
      'Larsen', 'Sørensen', 'Rasmussen', 'Jørgensen', 'Petersen', 'Madsen',
      'Kristensen', 'Olsen', 'Thomsen', 'Christiansen', 'Poulsen', 'Johansen',
      'Møller', 'Lund', 'Mortensen', 'Holm', 'Skov', 'Schmidt', 'Knudsen',
      'Jakobsen', 'Berg', 'Johansson', 'Fischer', 'Christoffersen',
      'Henriksen', 'Gregersen', 'Bruun', 'Kjær', 'Nygaard', 'Friis',
      'Vestergaard', 'Toft', 'Bach', 'Lindberg', 'Brandt', 'Hermansen',
    ],
    initiators: [
      'Henrik Thygesen', 'Birgit Møllberg', 'Lars Kjeldsen',
      'Ulla Grønbæk', 'Mads Vestergaard', 'Ingelise Skovgaard',
      'Carl Juul', 'Mona Bech',
    ],
    regions: [
      'Jutland', 'Zealand', 'Funen', 'Lolland', 'Falster', 'Bornholm',
      'Northern Jutland', 'Thy', 'Vendsyssel', 'Djursland', 'Himmerland',
      'Stevns', 'Odsherred', 'Horsens Fjord',
    ],
  },

  Singapore: {
    male: [
      'Ethan', 'Jayden', 'Lucas', 'Marcus', 'Ryan', 'Xavier', 'Aaron',
      'Benjamin', 'Zhi Heng', 'Jun Wei', 'Wei Jie', 'Kai Wen', 'Ming',
      'Kai', 'Wei', 'Hao', 'Jun', 'Wei Ming', 'Jun Hao', 'Rui', 'Arjun',
      'Vikram', 'Rohan', 'Anand', 'Mahmoud', 'Yusuf', 'Bilal', 'Farhan',
      'Kumar', 'Rajesh', 'Suresh',
    ],
    female: [
      'Sophia', 'Chloe', 'Olivia', 'Emma', 'Charlotte', 'Hannah', 'Xin Yi',
      'Jia Min', 'Yan Ling', 'Li Xuan', 'Kai Xin', 'Mei Ling', 'Ai Lin',
      'Yun Ning', 'Hui Ling', 'Shi Hui', 'Xin Hui', 'Priya', 'Ananya',
      'Meera', 'Deepa', 'Nurul', 'Aisyah', 'Farah', 'Siti', 'Amirah',
      'Zahra', 'Latifah', 'Camilla', 'Isabella',
    ],
    middleMale: [],
    middleFemale: [],
    surnames: [
      'Tan', 'Lim', 'Lee', 'Ng', 'Ong', 'Wong', 'Chua', 'Goh', 'Teo',
      'Ang', 'Koh', 'Chew', 'Yeo', 'Ho', 'Tay', 'Chia', 'Lee', 'Lim',
      'Chan', 'Kwek', 'Soh', 'Yap', 'Heng', 'See', 'Teh', 'Toh', 'Wee',
      'Gan', 'Sim', 'Kwan', 'Hau', 'Fernandez', 'De Castro', 'Garcia',
      'Santos', 'Raman', 'Iyer', 'Menon', 'Pillai', 'Singh', 'Kaur',
      'Chandran', 'Abdullah', 'Mohamed', 'Ibrahim', 'Osman', 'Rahman',
    ],
    initiators: [
      'Lawrence Tan', 'Mei Ling Chua', 'Kumar Rajan', 'Grace Ong',
      'Vincent Goh', 'Serene Lim', 'Rajesh Menon', 'Aisyah Rahman',
    ],
    regions: [
      'Orchard', 'Marina', 'Jurong', 'Ang Mo Kio', 'Bukit Timah',
      'Tampines', 'Woodlands', 'Sentosa', 'Changi', 'Pasir Ris',
      'Clementi', 'Bedok', 'Queenstown', 'Toa Payoh', 'Serangoon',
      'Kallang',
    ],
  },

  'New Zealand': {
    male: [
      'Oliver', 'Jack', 'Noah', 'William', 'George', 'Charlie', 'Luca',
      'Leo', 'James', 'Henry', 'Liam', 'Mason', 'Hunter', 'Kahu', 'Tane',
      'Rawiri', 'Hemi', 'Matua', 'Nikau', 'Wiremu', 'Tamati', 'Sam', 'Ryan',
      'Dylan', 'Callum', 'Hamish', 'Fraser', 'Angus', 'Liam', 'Blake',
      'Cody', 'Jared', 'Trent', 'Bradley',
    ],
    female: [
      'Charlotte', 'Isla', 'Olivia', 'Sophie', 'Amelia', 'Ruby', 'Mia',
      'Grace', 'Lily', 'Ella', 'Aria', 'Hana', 'Maia', 'Aroha', 'Moana',
      'Nikau', 'Tui', 'Tane', 'Rangi', 'Anahera', 'Mere', 'Hine', 'Kiri',
      'Emma', 'Hannah', 'Georgia', 'Mackenzie', 'Tiana', 'Skye', 'Logan',
      'Mia',
    ],
    middleMale: ['James', 'William', 'Robert', 'John', 'David', 'Thomas', 'Peter', 'Joseph'],
    middleFemale: ['Marie', 'Ann', 'Rose', 'Jane', 'Anne', 'Louise', 'Grace', 'May'],
    surnames: [
      'Smith', 'Williams', 'Brown', 'Taylor', 'Wilson', 'Jones', 'Johnson',
      'Thomas', 'Walker', 'Thompson', 'White', 'Moore', 'Harris', 'Martin',
      'Lee', 'Clark', 'King', 'Baker', 'Wright', 'Lewis', 'Young', 'Hall',
      'Allen', 'Scott', 'Hill', 'Green', 'Adams', 'Baker', 'Nelson',
      'Cooper', 'Mitchell', 'Roberts', 'Campbell', 'Jackson', 'Evans',
      'Murray', 'MacDonald', 'McKenzie', 'O’Brien', 'Fletcher', 'Whetu',
      'Ngata', 'Mara', 'Parata', 'Hokianga', 'Rewi', 'Herewini', 'Awatere',
      'Paora',
    ],
    initiators: [
      'Henare Mataira', 'Aroha Thompson', 'William Standish', 'Maia Wilson',
      'Tamati Ropata', 'Charlotte Ashby', 'Rawiri Kaa', 'Isla McIntyre',
    ],
    regions: [
      'Northland', 'Auckland', 'Waikato', 'Bay of Plenty', 'Hawke’s Bay',
      'Taranaki', 'Manawatū', 'Wellington', 'Canterbury', 'Otago',
      'Southland', 'West Coast', 'Fiordland', 'Marlborough', 'Gisborne',
    ],
  },

  Malaysia: {
    male: [
      'Ahmad', 'Muhammad', 'Hazim', 'Danish', 'Aiman', 'Harith', 'Izzat',
      'Syafiq', 'Farhan', 'Ibrahim', 'Zulkifli', 'Razak', 'Idris', 'Amirul',
      'Aizat', 'Hafiz', 'Azlan', 'Faizal', 'Ismail', 'Jamal', 'Rashid',
      'Wei Ming', 'Kai Wen', 'Jun Hao', 'Zhi Yuan', 'Rajan', 'Kumar',
      'Viknesh', 'Arun', 'Suresh', 'Benedict', 'Dennis', 'Vincent',
    ],
    female: [
      'Nurul', 'Aisyah', 'Siti', 'Farah', 'Amirah', 'Zahra', 'Nadia',
      'Anis', 'Izzah', 'Aina', 'Syafiqah', 'Nur', 'Iman', 'Aqilah',
      'Hanna', 'Zulaikha', 'Sofia', 'Wei Ling', 'Xin Yi', 'Mei Lin',
      'Yan Ling', 'Hui Fang', 'Priya', 'Meera', 'Divya', 'Lakshmi',
      'Shanthi', 'June', 'Esther', 'Michelle', 'Catherine',
    ],
    middleMale: [],
    middleFemale: [],
    surnames: [
      'Abdullah', 'Rahman', 'Ismail', 'Yusof', 'Ibrahim', 'Hassan',
      'Hashim', 'Osman', 'Hussin', 'Musa', 'Salleh', 'Ahmad', 'Zain',
      'Omar', 'Razak', 'Aziz', 'Ghani', 'Nordin', 'Ramli', 'Zulkifli',
      'Tan', 'Lim', 'Lee', 'Wong', 'Chong', 'Ng', 'Chin', 'Gan', 'Yap',
      'Teoh', 'Subramaniam', 'Krishnan', 'Murugan', 'Ramasamy', 'Nair',
      'Menon', 'Pillai', 'Fernandez', 'Pereira', 'Rozario', 'Chandran',
      'Sim', 'Koh',
    ],
    initiators: [
      'Hafiz Kamaruddin', 'Nurul Azizah', 'Zulkifli Bin Osman',
      'Mei Lin Gan', 'Rajendran Nair', 'Aisyah Mohd', 'Vincent Sim',
      'Farah Ismail',
    ],
    regions: [
      'Kuala Lumpur', 'Penang', 'Johor', 'Kelantan', 'Perak', 'Selangor',
      'Sabah', 'Sarawak', 'Pahang', 'Terengganu', 'Kedah', 'Negeri Sembilan',
      'Melaka', 'Perlis', 'East Coast', 'Borneo',
    ],
  },

  Qatar: {
    male: [
      'Mohammed', 'Abdullah', 'Hamad', 'Khalid', 'Jassim', 'Ali', 'Nasser',
      'Abdulaziz', 'Fahad', 'Saud', 'Salem', 'Mubarak', 'Khaled', 'Ahmed',
      'Yousef', 'Faisal', 'Thani', 'Rashid', 'Saeed', 'Meshal', 'Nawaf',
      'Hussain', 'Talal', 'Mansour', 'Abdulrahman', 'Omar', 'Ziyad', 'Waleed',
      'Saad', 'Majed',
    ],
    female: [
      'Mariam', 'Fatima', 'Noora', 'Aisha', 'Lulwa', 'Hessa', 'Moza',
      'Amna', 'Hind', 'Jawaher', 'Maha', 'Sara', 'Noor', 'Aljazi', 'Abeer',
      'Huda', 'Dana', 'Reem', 'Lama', 'Shaikha', 'Buthayna', 'Mouza',
      'Kholoud', 'Muneera', 'Aala', 'Tala',
    ],
    middleMale: ['Mohammed', 'Abdullah', 'Hamad', 'Khalid', 'Abdulaziz', 'Ali', 'Jassim', 'Ahmed'],
    middleFemale: ['Mohammed', 'Abdullah', 'Hamad', 'Khalid', 'Ali', 'Nasser'],
    surnames: [
      'Al Thani', 'Al Marri', 'Al Kuwari', 'Al Sulaiti', 'Al Malki',
      'Al Kaabi', 'Al Mohannadi', 'Al Braik', 'Al Emadi', 'Al Mannai',
      'Al Ansari', 'Al Attiyah', 'Al Hitmi', 'Al Kubaisi', 'Al Subaiey',
      'Al Sada', 'Al Derai', 'Al Majid', 'Al Naimi', 'Al Obaidli',
      'Al Tamimi', 'Al Aqidi', 'Al Balushi', 'Al Dosari', 'Al Kafoud',
      'Al Kuwari', 'Al Mohammed', 'Al Fahida', 'Bani Hammad', 'Al Sheikh',
    ],
    initiators: [
      'Hamad Al Marri', 'Mariam Al Kuwari', 'Abdullah Al Thani',
      'Noora Al Sulaiti', 'Khalid Al Mohannadi', 'Fatima Al Ansari',
      'Jassim Al Kaabi', 'Amna Al Emadi',
    ],
    regions: [
      'Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor', 'Al Shamal',
      'Mesaieed', 'Dukhan', 'Lusail', 'Al Daayen', 'Katara',
      'Corniche', 'West Bay', 'Pearl', 'Fiery Coast',
    ],
  },

  Kuwait: {
    male: [
      'Mohammed', 'Abdullah', 'Ahmad', 'Khalid', 'Fahad', 'Nasser', 'Bader',
      'Saud', 'Abdulaziz', 'Yousef', 'Ali', 'Meshari', 'Faisal', 'Salem',
      'Hussain', 'Jaber', 'Mubarak', 'Omar', 'Hamad', 'Nawaf', 'Dimah',
      'Abdulrahman', 'Jassim', 'Sultan', 'Turki', 'Majed', 'Waleed', 'Sami',
      'Zaid', 'Hassan',
    ],
    female: [
      'Fatima', 'Mariam', 'Noura', 'Lulwa', 'Aisha', 'Huda', 'Alia',
      'Maha', 'Reem', 'Dana', 'Jawaher', 'Shareefa', 'Muna', 'Amthal',
      'Sara', 'Noor', 'Hessa', 'Moza', 'Bashayer', 'Dalal', 'Hanan',
      'Abeer', 'Roudha', 'Salma', 'Shoroq', 'Wafa',
    ],
    middleMale: ['Mohammed', 'Abdullah', 'Khalid', 'Ahmad', 'Abdulaziz', 'Ali', 'Nasser', 'Fahad'],
    middleFemale: ['Mohammed', 'Abdullah', 'Khalid', 'Ahmad', 'Ali', 'Nasser'],
    surnames: [
      'Al-Sabah', 'Al-Rasheed', 'Al-Mutairi', 'Al-Ajmi', 'Al-Enezi',
      'Al-Otaibi', 'Al-Shammari', 'Al-Harbi', 'Al-Dhafiri', 'Al-Azmi',
      'Al-Saleh', 'Al-Kandari', 'Al-Rashidi', 'Al-Mulla', 'Al-Saqer',
      'Al-Ghanim', 'Al-Khalifah', 'Al-Beijan', 'Al-Hamdan', 'Al-Marzouq',
      'Al-Fadhel', 'Al-Failakawi', 'Al-Qattan', 'Al-Terkait', 'Al-Wazzan',
      'Al-Haddad', 'Al-Mousa', 'Al-Ali', 'Al-Sebaie', 'Al-Zamel', 'Bouhashem',
    ],
    initiators: [
      'Saleh Al-Mutairi', 'Lulwa Al-Rasheed', 'Abdullah Al-Harbi',
      'Mariam Al-Kandari', 'Khalid Al-Ajmi', 'Nawal Al-Enezi',
      'Badr Al-Otaibi', 'Fatima Al-Saleh',
    ],
    regions: [
      'Kuwait City', 'Hawalli', 'Salmiya', 'Farwaniya', 'Jahra', 'Ahmadi',
      'Mubarak Al-Kabeer', 'Shuwaikh', 'Sabah Al-Salem', 'Adiliya',
      'Mangaf', 'Fahaheel', 'Abdullah Port', 'Failaka',
    ],
  },

  Ghana: {
    male: [
      'Kwame', 'Kofi', 'Kwabena', 'Kwaku', 'Yaw', 'Kweku', 'Kwasi', 'Kojo',
      'Kwadwo', 'Nana', 'Kofi', 'Akwasi', 'Kobina', 'Bonsu', 'Adjei',
      'Kodjo', 'Yao', 'Kossi', 'Sena', 'Selorm', 'Kofi', 'Delali', 'Togbui',
      'Foli', 'Mawuli', 'Kwakye', 'Atta', 'Osei', 'Kwarteng', 'Gyasi',
      'Frimpong', 'Owusu', 'Opoku', 'Antwi', 'Appiah', 'Boakye', 'Asante',
      'Boateng', 'Darko', 'Ansah', 'Mensah', 'Agyeman', 'Tettey', 'Djan',
      'Abbam', 'Essuman', 'Bossman', 'Nuel', 'Yusif', 'Alhassan',
    ],
    female: [
      'Ama', 'Akosua', 'Abena', 'Akua', 'Yaa', 'Afua', 'Akwaba', 'Adwoa',
      'Efua', 'Adjoa', 'Aku', 'Abra', 'Naa', 'Akweley', 'Adoley', 'Dede',
      'Esi', 'Aba', 'Akwesi', 'Akorfa', 'Akos', 'Maame', 'Ewurabena',
      'Awo', 'Adoma', 'Beauty', 'Grace', 'Patience', 'Comfort', 'Blessing',
      'Esther', 'Ruth', 'Mercy', 'Joyce', 'Akosua', 'Adwoa', 'Fati',
      'Aminah', 'Zainab', 'Hamdiya', 'Rahma', 'Farida', 'Mariama', 'Ajara',
      'Nudeya', 'Asana',
    ],
    middleMale: ['Kwame', 'Kofi', 'Kwabena', 'Yaw', 'Kwaku', 'Kojo', 'Osei', 'Asante'],
    middleFemale: ['Ama', 'Akosua', 'Abena', 'Yaa', 'Afua', 'Efua', 'Adwoa', 'Naa'],
    surnames: [
      'Mensah', 'Owusu', 'Boateng', 'Asante', 'Appiah', 'Agyei', 'Agyemang',
      'Addo', 'Osei', 'Ampofo', 'Antwi', 'Boadu', 'Kwarteng', 'Opoku',
      'Frimpong', 'Bonsu', 'Gyasi', 'Darko', 'Adu', 'Appenteng', 'Asare',
      'Awuah', 'Baah', 'Baffour', 'Boakye', 'Danso', 'Dankwa', 'Oti',
      'Fosu', 'Kwashie', 'Nonko', 'Nyarko', 'Obeng', 'Ofori', 'Owusu-Ansah',
      'Sarpong', 'Tawiah', 'Tetteh', 'Atinga', 'Bawa', 'Issah', 'Mahama',
      'Salifu', 'Adams', 'Haruna', 'Alolo', 'Akpo', 'Agbeko', 'Korli',
      'Ablorh', 'Ametor', 'Gakpetor', 'Degbe', 'Agbota', 'Azumah', 'Kuza',
      'Lumor', 'Tettey', 'Adjei',
    ],
    initiators: [
      'Emmanuel Agyei', 'Kofi Asante', 'Nana Owusu', 'Kwabena Boateng',
      'Grace Addo', 'Ama Serwaa', 'Yaw Darko', 'Akosua Mensah', 'Kweku Annan',
      'Efua Koomson', 'Alhaji Ibrahim', 'Abena Tetteh',
    ],
    regions: [
      'Greater Accra', 'Ashanti', 'Volta', 'Eastern', 'Western', 'Central',
      'Northern', 'Upper East', 'Upper West', 'Bono', 'Ahafo',
      'Savannah', 'North East', 'Oti', 'Western North',
    ],
  },

  Nigeria: {
    male: [
      'Chinedu', 'Emeka', 'Obinna', 'Chukwuemeka', 'Uchenna', 'Nnamdi',
      'Kelechi', 'Ifeanyi', 'Onyeka', 'Chibueze', 'Tunde', 'Wale', 'Femi',
      'Kunle', 'Segun', 'Taiwo', 'Deji', 'Olu', 'Babatunde', 'Adewale',
      'Ibrahim', 'Musa', 'Usman', 'Bello', 'Abubakar', 'Sani', 'Yakubu',
      'Nasiru', 'Kabir', 'Aminu', 'Efosa', 'Osahon', 'Osarumen', 'Iredia',
      'Aigbe', 'Imuetinyan', 'Okonkwo', 'Adebayo', 'Olawale', 'Tolulope',
      'Ayodele', 'Rotimi', 'Bankole', 'Egbuna', 'Akachi',
    ],
    female: [
      'Ngozi', 'Amara', 'Chiamaka', 'Adaeze', 'Ifunanya', 'Ogechi',
      'Nkechi', 'Chioma', 'Uzoamaka', 'Ebere', 'Yewande', 'Funke', 'Bisi',
      'Simisola', 'Aderonke', 'Abimbola', 'Folake', 'Morenike', 'Oyin',
      'Yetunde', 'Aisha', 'Fatima', 'Zainab', 'Aminah', 'Hauwa', 'Maryam',
      'Khadija', 'Rahmat', 'Hafsat', 'Sadiya', 'Osas', 'Ebhohon', 'Omosede',
      'Esohe', 'Ivie', 'Uyi', 'Bosede', 'Eniola', 'Adunni', 'Kemi',
      'Titilayo', 'Damilola',
    ],
    middleMale: ['Emeka', 'Olu', 'Ibrahim', 'Tunde', 'Nnamdi', 'Musa', 'Kelechi', 'Ayodele'],
    middleFemale: ['Ngozi', 'Aisha', 'Funke', 'Amara', 'Fatima', 'Chioma', 'Yewande', 'Zainab'],
    surnames: [
      'Okonkwo', 'Nwosu', 'Eze', 'Okafor', 'Nnamani', 'Onyema', 'Egbuna',
      'Umeh', 'Obi', 'Maduka', 'Adewale', 'Olawale', 'Akinwande', 'Oyewole',
      'Ogundele', 'Ogunleye', 'Afolabi', 'Adeyemi', 'Adesina', 'Babatunde',
      'Ogunleye', 'Balogun', 'Adeniyi', 'Olorunfemi', 'Egbetokun', 'Mohammed',
      'Bello', 'Usman', 'Garba', 'Lawal', 'Suleiman', 'Danjuma', 'Sani',
      'Yakubu', 'Abba', 'Malami', 'Esele', 'Okpako', 'Idehen', 'Odigie',
      'Uwagboe', 'Iriagbonse', 'Osawe', 'Ehanire', 'Aigbokhan', 'Igbinedion',
      'Akinyemi', 'Salami', 'Oke', 'Fashola', 'Ogunlana', 'Folorunsho',
    ],
    initiators: [
      'Emeka Nwosu', 'Aisha Bello', 'Olawale Adeyemi', 'Ngozi Okonkwo',
      'Ibrahim Musa', 'Chiamaka Eze', 'Tunde Ogunleye', 'Zainab Suleiman',
      'Kelechi Egbuna', 'Fatima Lawal',
    ],
    regions: [
      'Lagos', 'Kano', 'Ibadan', 'Benin City', 'Port Harcourt', 'Kaduna',
      'Enugu', 'Abeokuta', 'Onitsha', 'Ilorin', 'Jos', 'Sokoto', 'Calabar',
      'Maiduguri', 'Abuja', 'Warri',
    ],
  },

  'South Africa': {
    male: [
      'Siyabonga', 'Lungelo', 'Thabo', 'Bongani', 'Sipho', 'Andile', 'Sizwe',
      'Mthunzi', 'Mandla', 'Bheki', 'Sibusiso', 'Vusi', 'Nkosi', 'Phumlani',
      'Lwazi', 'Mamello', 'Kabelo', 'Kagiso', 'Tshepo', 'Lesego', 'Anele',
      'Lubabalo', 'Siphesihle', 'Ayanda', 'Pieter', 'Johan', 'Hendrik',
      'Ruan', 'Willem', 'Dirk', 'Gavin', 'Trevor', 'Brent', 'Mohammed',
      'Imran', 'Yusuf', 'Zaheer', 'Ravi', 'Ashin', 'Ethan', 'Ryan',
    ],
    female: [
      'Nomvula', 'Zanele', 'Thandi', 'Nokuthula', 'Sibongile', 'Tendai',
      'Busisiwe', 'Naledi', 'Mpumi', 'Palesa', 'Keabetswe', 'Dineo',
      'Refilwe', 'Karabo', 'Lerato', 'Nosipho', 'Amahle', 'Zinhle',
      'Nonhlanhla', 'Thulisile', 'Elna', 'Annelie', 'Sanette', 'Marike',
      'Chantelle', 'Aisha', 'Amina', 'Rukaiya', 'Priya', 'Sneha', 'Jessica',
      'Megan', 'Chloe',
    ],
    middleMale: ['Mandla', 'Thabo', 'Pieter', 'Johan', 'Mohammed', 'Sipho', 'David', 'Peter'],
    middleFemale: ['Thandi', 'Maria', 'Anna', 'Nomvula', 'Aisha', 'Elizabeth', 'Elsa', 'Grace'],
    surnames: [
      'Dlamini', 'Nkosi', 'Mokoena', 'Ndlovu', 'Khumalo', 'Sithole',
      'Mahlangu', 'Moloi', 'Zulu', 'Mthembu', 'Ntshangase', 'Mbuyazi',
      'Buthelezi', 'Gwala', 'Mnguni', 'Van der Merwe', 'Botha', 'Venter',
      'Pretorius', 'Fourie', 'Nel', 'Kruger', 'Coetzee', 'Joubert',
      'Snyman', 'Dreyer', 'Naidoo', 'Pillay', 'Govender', 'Moodley',
      'Sundram', 'Jacobs', 'Williams', 'Petersen', 'Abrahams', 'Davids',
      'Mohamed', 'Ebrahim', 'Cassim', 'Khan', 'Naicker', 'Langa',
      'Banda', 'Phiri', 'Moyo',
    ],
    initiators: [
      'Thabo Mokoena', 'Zanele Khumalo', 'Johan van der Merwe',
      'Nokuthula Dlamini', 'Ravi Pillay', 'Elna Fourie', 'Imran Cassim',
      'Amahle Ndlovu',
    ],
    regions: [
      'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape',
      'Free State', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape',
      'Cape', 'Highveld', 'Valley of a Thousand Hills', 'Garden Route',
      'Karoo', 'Lowveld', 'Bushveld',
    ],
  },

  Kenya: {
    male: [
      'Brian', 'Kevin', 'Collins', 'Victor', 'Dennis', 'Allan', 'Fred',
      'David', 'Peter', 'John', 'Samuel', 'Joseph', 'Moses', 'Elias',
      'James', 'Daniel', 'Meshack', 'Baraka', 'Brian', 'Wanjala', 'Otieno',
      'Odhiambo', 'Omondi', 'Kipchoge', 'Kiprop', 'Mutai', 'Kiplagat',
      'Kamau', 'Mwangi', 'Mutua', 'Njuguna', 'Chege', 'Gitau', 'Njoroge',
      'Waweru', 'Hassan', 'Ahmed', 'Omar', 'Ali', 'Salim', 'Yusuf', 'Abdi',
      'Farah', 'Ismail',
    ],
    female: [
      'Mercy', 'Grace', 'Faith', 'Wanjiru', 'Nyawira', 'Wambui', 'Muthoni',
      'Njeri', 'Akinyi', 'Achieng', 'Adhiambo', 'Atieno', 'Chelangat',
      'Chebet', 'Jerop', 'Kiprono', 'Baraka', 'Emmanuel', 'Mariam', 'Halima',
      'Zainab', 'Amina', 'Fatuma', 'Saida', 'Asha', 'Naima', 'Shukri',
      'Joyce', 'Esther', 'Ruth', 'Judith', 'Phoebe', 'Naomi', 'Tabitha',
    ],
    middleMale: ['Kamau', 'Otieno', 'Kiprop', 'Mutua', 'Omondi', 'Ali', 'Mwangi', 'Baraka'],
    middleFemale: ['Wanjiru', 'Akinyi', 'Chebet', 'Amina', 'Nyawira', 'Halima', 'Muthoni', 'Faith'],
    surnames: [
      'Kamau', 'Otieno', 'Mwangi', 'Mutua', 'Omondi', 'Njuguna', 'Wanjiru',
      'Kariuki', 'Njoroge', 'Waweru', 'Chege', 'Gitau', 'Kiprotich',
      'Kipkemboi', 'Kipyegon', 'Chemutai', 'Biwott', 'Korir', 'Kiplagat',
      'Achieng', 'Anyango', 'Okoth', 'Onyango', 'Odhiambo', 'Ochieng',
      'Ndege', 'Wafula', 'Wechuli', 'Masinde', 'Wamalwa', 'Barasa',
      'Simiyu', 'Makhoha', 'Wekesa', 'Hassan', 'Abdullahi', 'Moses',
      'Otieno', 'Karim', 'Said', 'Bashir', 'Osman',
    ],
    initiators: [
      'Kamau Njoroge', 'Amina Hassan', 'Peter Otieno', 'Grace Wanjiru',
      'Kiprop Kipyegon', 'Faith Achieng', 'Mohammed Ali', 'Wanjiru Chebet',
    ],
    regions: [
      'Rift Valley', 'Nairobi', 'Coast', 'Eastern', 'Central', 'Western',
      'Nyanza', 'North Eastern', 'Mount Kenya', 'Masailand', 'Lake Victoria',
      'Tsavo', 'Samburu', 'Maasai Mara', 'Malindi',
    ],
  },

  Uganda: {
    male: [
      'Joseph', 'Patrick', 'Ronald', 'Charles', 'Samuel', 'Peter', 'David',
      'Isaac', 'Moses', 'John', 'Brian', 'Enock', 'Ivan', 'Geofrey',
      'Julius', 'Denis', 'Muhammed', 'Hassan', 'Yusuf', 'Sulaiman', 'Ibrahim',
      'Kato', 'Semanda', 'Kintu', 'Ssali', 'Wasswa', 'Kizza', 'Buwembo',
      'Lubega', 'Ssemanda', 'Mutebi', 'Ssempijja', 'Kisakye', 'Ocen',
      'Lukwiya', 'Opio', 'Okello', 'Odongo', 'Akena', 'Lamunu',
    ],
    female: [
      'Sarah', 'Esther', 'Grace', 'Betty', 'Agnes', 'Martha', 'Florence',
      'Rebecca', 'Doreen', 'Aisha', 'Hajara', 'Halima', 'Rahma', 'Fauzia',
      'Nakato', 'Nansubuga', 'Nagawa', 'Namukasa', 'Namutebi', 'Birabwa',
      'Nagawa', 'Achieng', 'Adongo', 'Auma', 'Aol', 'Apio', 'Lamunu',
      'Judith', 'Catherine', 'Peace', 'Patience', 'Juliet', 'Monica',
    ],
    middleMale: ['Kato', 'Wasswa', 'Semanda', 'Ibrahim', 'Samuel', 'Peter', 'Moses', 'John'],
    middleFemale: ['Nakato', 'Nansubuga', 'Aisha', 'Halima', 'Sarah', 'Grace', 'Esther', 'Nagawa'],
    surnames: [
      'Mugisha', 'Muhumuza', 'Byaruhanga', 'Arinaitwe', 'Turinawe',
      'Kyarisima', 'Basemera', 'Ninsiima', 'Kembabazi', 'Twesigye',
      'Bamugye', 'Turyamureeba', 'Baguma', 'Mutabazi', 'Rwabukwisi',
      'Kato', 'Ssemakula', 'Lubwama', 'Ssebunya', 'Mpagi', 'Kiggundu',
      'Mayanja', 'Ssemwogerere', 'Kawuma', 'Kizito', 'Ssali', 'Wasswa',
      'Ojok', 'Okello', 'Opio', 'Ocen', 'Lakony', 'Adok', 'Omara',
      'Ochen', 'Museveni', 'Besigye', 'Mulindwa', 'Kavuma',
    ],
    initiators: [
      'Patrick Mugisha', 'Sarah Nakato', 'Muhammed Kato', 'Betty Nansubuga',
      'Samuel Okello', 'Halima Achieng', 'David Ssemakula', 'Grace Nabirye',
    ],
    regions: [
      'Buganda', 'Busoga', 'Acholi', 'Lango', 'Teso', 'Karamoja',
      'Kigezi', 'Toro', 'Ankole', 'Bunyoro', 'West Nile', 'Kampala',
      'Lake Kyoga', 'Mount Elgon', 'Rwenzori',
    ],
  },

  Tanzania: {
    male: [
      'Juma', 'Baraka', 'Emmanuel', 'John', 'Peter', 'Moses', 'Emmanuel',
      'Godfrey', 'Frank', 'Goodluck', 'Ally', 'Salim', 'Hassan', 'Iddi',
      'Rajabu', 'Juma', 'Omari', 'Said', 'Khamis', 'Abdallah', 'Hemed',
      'Mbaraka', 'Daudi', 'Juma', 'Innocent', 'Joseph', 'Fred', 'Charles',
      'Emmanuel', 'Erick', 'Baraka', 'Festo', 'Joram', 'Mbwana', 'Salvatory',
      'Thobias', 'Yohana', 'Zacharia',
    ],
    female: [
      'Grace', 'Neema', 'Rehema', 'Zainabu', 'Amina', 'Fatuma', 'Mwanahamisi',
      'Asha', 'Hawa', 'Saida', 'Mariam', 'Halima', 'Zawadi', 'Subira',
      'Upendo', 'Amani', 'Happiness', 'Joyce', 'Glory', 'Beatrice',
      'Doreen', 'Theresia', 'Anjela', 'Ester', 'Sofia', 'Ruth', 'Prisca',
      'Agnes', 'Martha', 'Victoria', 'Catherine', 'Elizabeth',
    ],
    middleMale: ['Juma', 'Hassan', 'Salim', 'Baraka', 'Peter', 'John', 'Joseph', 'Omari'],
    middleFemale: ['Neema', 'Amina', 'Fatuma', 'Zainabu', 'Grace', 'Rehema', 'Asha', 'Hawa'],
    surnames: [
      'Mushi', 'Mrema', 'Massawe', 'Chambo', 'Komba', 'Ngowi', 'Kisanga',
      'Lyimo', 'Kimaro', 'Mlaki', 'Mosha', 'Msuya', 'Mtui', 'Ndobobo',
      'Shirima', 'Temu', 'Urio', 'Kileo', 'Laizer', 'Mollel', 'Mathew',
      'Ndeto', 'Koroso', 'Makoa', 'Mbezi', 'Mkapa', 'Mhina', 'Mwakalinga',
      'Mwinuka', 'Mwandu', 'Nchimbi', 'Ngoma', 'Nkosi', 'Sagamba',
      'Mnyambo', 'Rugaba', 'Semu',
    ],
    initiators: [
      'Juma Mushi', 'Neema Kimaro', 'Hassan Komba', 'Grace Lyimo',
      'Salim Mrema', 'Amina Kisanga', 'Baraka Mosha', 'Zainabu Msuya',
    ],
    regions: [
      'Dar es Salaam', 'Kilimanjaro', 'Mbeya', 'Mwanza', 'Arusha',
      'Morogoro', 'Tanganyika', 'Dodoma', 'Tabora', 'Kigoma', 'Coastal',
      'Serengeti', 'Tanga', 'Pemba', 'Zanzibar', 'Highlands',
    ],
  },

  Cameroon: {
    male: [
      'Jean', 'Paul', 'Pierre', 'Emmanuel', 'Bertrand', 'Cyrille', 'Franck',
      'Samuel', 'Bruno', 'Aliou', 'Mamadou', 'Idrissou', 'Sadou', 'Bello',
      'Aboubakar', 'Ibrahim', 'Constant', 'François', 'Guy', 'Hervé',
      'Wilfried', 'Landry', 'Serge', 'Rodrigue', 'Arsène', 'Bonaventure',
      'Clovis', 'Docteur', 'Evariste', 'Fidèle', 'Gaston', 'Hubert',
      'Innocent', 'Joachim', 'Kévin', 'Léopold', 'Marc',
    ],
    female: [
      'Marie', 'Jeanne', 'Françoise', 'Claire', 'Valentine', 'Édith',
      'Estelle', 'Aline', 'Sylvie', 'Nadège', 'Fatima', 'Aïcha', 'Hadidja',
      'Rakia', 'Amira', 'Salma', 'Brenda', 'Christelle', 'Cynthia',
      'Danielle', 'Divine', 'Evelyne', 'Flore', 'Ghislaine', 'Hermine',
      'Irene', 'Jacqueline', 'Laurette', 'Mireille', 'Odile', 'Paulette',
      'Rosette', 'Solange', 'Thérèse', 'Victoire',
    ],
    middleMale: ['Jean', 'Paul', 'Marie', 'Pierre', 'Serge', 'Emmanuel', 'Ibrahim', 'François'],
    middleFemale: ['Marie', 'Claire', 'Jeanne', 'Aïcha', 'Françoise', 'Thérèse', 'Estelle', 'Rakia'],
    surnames: [
      'Njoya', 'Fokou', 'Kamga', 'Tchoumbou', 'Mbarga', 'Atangana', 'Mvondo',
      'Etoundi', 'Nkoulou', 'Nana', 'Fotsing', 'Wouafo', 'Tagne', 'Dongmo',
      'Soh', 'Fotso', 'Djoumessi', 'Tsafack', 'Kouam', 'Mefire', 'Ndiaye',
      'Abega', 'Mboumoua', 'Essomba', 'Manga', 'Beyala', 'Oyono', 'Muna',
      'Mbosso', 'Kotto', 'Etogo', 'Noumbissi', 'Talla', 'Mokoko', 'Dikongue',
      'Etoa', 'Owona', 'Mbida',
    ],
    initiators: [
      'Jean-Paul Essomba', 'Aïcha Njoya', 'Emmanuel Fokou', 'Valentine Mbarga',
      'Ibrahim Nana', 'Claire Mvondo', 'Bertrand Talla', 'Rakia Wouafo',
    ],
    regions: [
      'Centre', 'Littoral', 'West', 'North West', 'South West', 'Adamawa',
      'East', 'North', 'Far North', 'South', 'Bamenda', 'Douala',
      'Yaoundé', 'Mount Cameroon', 'Grassfields', 'Sanaga',
    ],
  },

  'Côte d’Ivoire': {
    male: [
      'Kouassi', 'Yao', 'Koffi', 'Konan', 'Kouadio', 'Kacou', 'Zié',
      'Didier', 'Serge', 'Blaise', 'Guy', 'Henri', 'Éric', 'Aimé', 'Boniface',
      'Mamadou', 'Ibrahim', 'Souleymane', 'Moussa', 'Issouf', 'Fousseni',
      'Karim', 'Cheick', 'Lassina', 'Sékou', 'Bakary', 'Vamoussa', 'Sinaly',
      'Alassane', 'Abdoulaye', 'Yacouba', 'Salif', 'Moustapha',
    ],
    female: [
      'Aya', 'Adjoua', 'Affoué', 'Akissi', 'Awa', 'Aminata', 'Fatou',
      'Aïcha', 'Mariam', 'Salimata', 'Hawa', 'Rokia', 'Kolou', 'Edwige',
      'Charlotte', 'Bernadette', 'Clarisse', 'Estelle', 'Georgette',
      'Josiane', 'Monique', 'Odile', 'Paulette', 'Rosalie', 'Thérèse',
      'Victoire', 'Yvette', 'Safiatou', 'Kadiatou', 'Mafory', 'Adama',
    ],
    middleMale: ['Kouassi', 'Yao', 'Koffi', 'Mamadou', 'Ibrahim', 'Alassane', 'Didier', 'Serge'],
    middleFemale: ['Aya', 'Aminata', 'Adjoua', 'Mariam', 'Awa', 'Fatou', 'Affoué', 'Safiatou'],
    surnames: [
      'Kouamé', 'N\'Guessan', 'Kouadio', 'Bamba', 'Traoré', 'Ouattara',
      'Touré', 'Diabaté', 'Konaté', 'Cissé', 'Coulibaly', 'Kéita',
      'Doumbia', 'Sangaré', 'Koné', 'Soro', 'Gbaka', 'Kassy', 'Ekra',
      'Aka', 'Assi', 'Dadié', 'Lohoues', 'Kacou', 'Kouyaté', 'Bakayoko',
      'Séka', 'N\'Dri', 'Kouakou', 'Boni', 'Yapo', 'Niane', 'Kébé',
      'Dembélé', 'Diomandé', 'Soumahoro',
    ],
    initiators: [
      'Kouassi Konaté', 'Aya Traoré', 'Mamadou Coulibaly', 'Adjoua Ouattara',
      'Ibrahim Koné', 'Mariam Bamba', 'Serge N\'Guessan', 'Fatou Diabaté',
    ],
    regions: [
      'Abidjan', 'Bas-Sassandra', 'Comoé', 'Denguélé', 'Gôh', 'Gôh-Djiboua',
      'Lacs', 'Lagunes', 'Montagnes', 'Sassandra-Marahoué', 'Savanes',
      'Vallee du Bandama', 'Woroba', 'Yamoussoukro', 'Zanzan',
    ],
  },

  Senegal: {
    male: [
      'Mamadou', 'Moussa', 'Ibrahim', 'Souleymane', 'Abdoulaye', 'Ousmane',
      'Cheikh', 'Serigne', 'Baba', 'Moustapha', 'Alassane', 'Pape', 'Ibou',
      'Lamine', 'Modou', 'Mbaye', 'Adama', 'Bocar', 'Idrissa', 'Landing',
      'Assane', 'Babacar', 'El Hadji', 'Seydou', 'Abdou', 'Mansour',
      'Doudou', 'Mamour', 'Ndiaga', 'Yaya',
    ],
    female: [
      'Fatou', 'Aminata', 'Aïssata', 'Mariama', 'Khady', 'Coumba', 'Adja',
      'Awa', 'Ndeye', 'Astou', 'Sokhna', 'Diouma', 'Kine', 'Mame',
      'Ngone', 'Dieynaba', 'Ramatoulaye', 'Seynabou', 'Nafissatou',
      'Arame', 'Bineta', 'Coda', 'Diarra', 'Fanta', 'Kadiatou', 'Marème',
      'Salimata', 'Thiaba', 'Yacine', 'Zeynab',
    ],
    middleMale: ['Cheikh', 'Ibrahima', 'Mamadou', 'Serigne', 'Abdoulaye', 'Moussa', 'Pape', 'El Hadji'],
    middleFemale: ['Fatou', 'Aminata', 'Ndeye', 'Aïssata', 'Sokhna', 'Mariama', 'Khady', 'Coumba'],
    surnames: [
      'Ndiaye', 'Diallo', 'Diop', 'Fall', 'Sarr', 'Ba', 'Faye', 'Niang',
      'Diouf', 'Wade', 'Sy', 'Cissé', 'Gueye', 'Sow', 'Seck', 'Diagne',
      'Mbaye', 'Thiam', 'Beye', 'Kane', 'Saly', 'Tine', 'Diatta', 'Kebé',
      'Mane', 'Sagna', 'Badiane', 'Coly', 'Goudiaby', 'Ouattara', 'Bèye',
      'Ngom', 'Barry', 'Sambou', 'Drame',
    ],
    initiators: [
      'Cheikh Ndiaye', 'Fatou Sarr', 'Mamadou Diop', 'Aminata Niang',
      'Ibrahima Fall', 'Sokhna Gueye', 'Abdoulaye Diallo', 'Khady Mbaye',
    ],
    regions: [
      'Dakar', 'Thiès', 'Saint-Louis', 'Fatick', 'Kolda', 'Kédougou',
      'Ziguinchor', 'Louga', 'Matam', 'Kaolack', 'Tambacounda', 'Diourbel',
      'Casamance', 'Sine-Saloum', 'Ferlo',
    ],
  },

  'Sierra Leone': {
    male: [
      'James', 'John', 'Peter', 'Michael', 'David', 'Samuel', 'Joseph',
      'Thomas', 'Daniel', 'Emmanuel', 'Abubakarr', 'Ibrahim', 'Mohamed',
      'Sulaiman', 'Alhaji', 'Osman', 'Foday', 'Saa', 'Kpaka', 'Alusine',
      'Momoh', 'Kelfala', 'Abu', 'Musa', 'Sheku', 'Moinina', 'Santigie',
      'Sorie', 'Bailor', 'Sahr',
    ],
    female: [
      'Mary', 'Elizabeth', 'Grace', 'Margaret', 'Georgina', 'Catherine',
      'Esther', 'Regina', 'Sia', 'Yema', 'Finda', 'Hawa', 'Mariama',
      'Aminata', 'Fatmata', 'Isatu', 'Kadiatu', 'Adama', 'Salamatu',
      'Zainab', 'Abibatu', 'Amie', 'Fanta', 'Mabinty', 'Saffie', 'Sata',
      'Tenneh', 'Kumba', 'Mariatu', 'Ngere',
    ],
    middleMale: ['Emmanuel', 'James', 'Mohamed', 'Peter', 'Abubakarr', 'Samuel', 'Joseph', 'Ibrahim'],
    middleFemale: ['Mary', 'Aminata', 'Grace', 'Fatmata', 'Elizabeth', 'Isatu', 'Sia', 'Mariama'],
    surnames: [
      'Koroma', 'Bangura', 'Sesay', 'Kargbo', 'Conteh', 'Kanu', 'Fofanah',
      'Kamara', 'Sankoh', 'Mansaray', 'Turay', 'Jalloh', 'Bah', 'Sawaneh',
      'Conta', 'Macaulay', 'Coker', 'Taylor', 'Johnson', 'Lewis', 'Wellington',
      'Carew', 'Cole', 'Dabo', 'Fallah', 'Gbla', 'Ishmael', 'Jusu',
      'Kaisamba', 'Kallon', 'Kebbeh', 'Kojo', 'Lansana', 'Macarthy',
      'Nylander', 'Ojukwu', 'Pratt', 'Rogers', 'Sillah', 'Thorpe',
    ],
    initiators: [
      'Ibrahim Koroma', 'Sia Bangura', 'Abubakarr Sesay', 'Mary Kamara',
      'Sulaiman Kargbo', 'Fatmata Conteh', 'Emmanuel Fofanah', 'Hawa Jalloh',
    ],
    regions: [
      'Western Area', 'Northern', 'Eastern', 'Southern', 'Freetown',
      'Bo', 'Kenema', 'Makeni', 'Kono', 'Bombali', 'Port Loko',
      'Kailahun', 'Moyamba', 'Pujehun', 'Tonkolili',
    ],
  },

  Liberia: {
    male: [
      'James', 'John', 'Peter', 'James', 'Michael', 'David', 'Robert',
      'Thomas', 'Samuel', 'Joseph', 'Emmanuel', 'Isaac', 'Abraham', 'Benjamin',
      'Boakai', 'Tubman', 'Kongbah', 'Kollie', 'Toe', 'Tweh', 'Barr',
      'Gaye', 'Garwo', 'Gbelee', 'Giosu', 'Greene', 'Homie', 'Jallah',
      'Kaifa', 'Kolleh', 'Mamulu', 'Nya', 'Sando', 'Tarlue', 'Wesseh',
      'Zubah', 'Prince', 'Anthony', 'Charles', 'Christopher',
    ],
    female: [
      'Mary', 'Elizabeth', 'Martha', 'Sarah', 'Ruth', 'Grace', 'Esther',
      'Rebecca', 'Deborah', 'Eunice', 'Louise', 'Margaret', 'Bendu',
      'Fatu', 'Hawa', 'Korto', 'Mamie', 'Musu', 'Varmuyan', 'Zolu',
      'Yassa', 'Konah', 'Mai', 'Adeline', 'Cecelia', 'Christiana',
      'Dorcas', 'Edith', 'Florence', 'Gertrude', 'Hannah', 'Isatu',
    ],
    middleMale: ['Emmanuel', 'James', 'John', 'Prince', 'Samuel', 'Peter', 'Boakai', 'Anthony'],
    middleFemale: ['Mary', 'Grace', 'Bendu', 'Elizabeth', 'Fatu', 'Esther', 'Martha', 'Musu'],
    surnames: [
      'Johnson', 'Williams', 'Brown', 'Doe', 'Harris', 'Kollie', 'Kromah',
      'Sisay', 'Sherman', 'Freeman', 'Cooper', 'Thomas', 'Smith', 'Berry',
      'Dunbar', 'Goodridge', 'Howard', 'Kerkula', 'Kpadeh', 'Kungbar',
      'Massaquoi', 'Neufville', 'Pajibo', 'Parker', 'Payne', 'Quiah',
      'Russ', 'Sheriff', 'Sumo', 'Tarr', 'Teah', 'Tubman', 'Wapoe',
      'Weah', 'Wilson', 'Wolo', 'Yamie', 'Zaw', 'Zondo',
    ],
    initiators: [
      'Emmanuel Kollie', 'Mary Johnson', 'James Kromah', 'Grace Tarr',
      'Samuel Keita', 'Musu Harris', 'Prince Wolo', 'Esther Kpadeh',
    ],
    regions: [
      'Montserrado', 'Grand Bassa', 'Nimba', 'Lofa', 'Bong', 'Cape Mount',
      'Maryland', 'Grand Gedeh', 'River Cess', 'Sinoe', 'Bomi',
      'Gbarpolu', 'River Gee', 'Grand Kru', 'Margibi', 'St John River',
    ],
  },

  Benin: {
    male: [
      'Jean', 'Pierre', 'Paul', 'Emmanuel', 'Adolphe', 'Albert', 'Basile',
      'Bienvenu', 'Célestin', 'Constant', 'Daniel', 'David', 'Éric',
      'Fiacre', 'Gaston', 'Gervais', 'Hilaire', 'Ignace', 'Jules',
      'Léopold', 'Marcel', 'Norbert', 'Patrice', 'Raymond', 'Sylvain',
      'Théodore', 'Vincent', 'Wilfried', 'Yves', 'Arsène', 'Benoît',
      'Didier', 'Evariste', 'Fridolin', 'Gildas', 'Honoré',
    ],
    female: [
      'Marie', 'Thérèse', 'Catherine', 'Colette', 'Delphine', 'Eugénie',
      'Florentine', 'Gabrielle', 'Henriette', 'Irene', 'Jacqueline',
      'Julienne', 'Laurette', 'Marceline', 'Nathalie', 'Odile', 'Paulette',
      'Reine', 'Sylvie', 'Thécla', 'Valérie', 'Yolande', 'Antoinette',
      'Bernadette', 'Christine', 'Dominique', 'Elvire', 'Francine',
      'Gisèle', 'Hermine', 'Josiane', 'Kéfia', 'Nadia', 'Zinabou',
    ],
    middleMale: ['Jean', 'Pierre', 'Marie', 'Paul', 'Emmanuel', 'Célestin', 'Honoré', 'Daniel'],
    middleFemale: ['Marie', 'Thérèse', 'Catherine', 'Claire', 'Bernadette', 'Gisèle', 'Nadia', 'Zinabou'],
    surnames: [
      'Agossa', 'Ahouansou', 'Akplogan', 'Ali', 'Aho', 'Alladatin',
      'Assogba', 'Adjovi', 'Adohou', 'Boko', 'Chabi', 'Dah', 'Dognon',
      'Dossou', 'Fassinou', 'Gbénou', 'Gnonlonfoun', 'Hounkpatin',
      'Houngbédji', 'Kpade', 'Kpodékon', 'Loko', 'Mènou', 'Mitokpè',
      'N\'Tcha', 'Ogun', 'Osseni', 'Paramole', 'Sossou', 'Sodji', 'Tchobo',
      'Tossou', 'Vodonou', 'Yai', 'Zinsou', 'Zomahoun',
    ],
    initiators: [
      'Jean-Pierre Agossa', 'Marie Dossou', 'Emmanuel Houngbédji',
      'Thérèse Assogba', 'Paul Gbénou', 'Catherine Adjovi', 'Benoît Kpade',
      'Francine Tossou',
    ],
    regions: [
      'Littoral', 'Ouémé', 'Atlantique', 'Zou', 'Collines', 'Mono',
      'Couffo', 'Plateau', 'Alibori', 'Atacora', 'Borgou', 'Donga',
      'Porto-Novo', 'Cotonou', 'Lake Nokoué',
    ],
  },

  Togo: {
    male: [
      'Koffi', 'Kossi', 'Komlan', 'Mawuli', 'Kodjo', 'Yao', 'Ayi',
      'Efoe', 'Togbui', 'Gnamien', 'Ablavi', 'Doffou', 'Essolakina',
      'Folly', 'Gbagbo', 'Kokou', 'Lare', 'Mensah', 'Nouhoum', 'Ouro',
      'Pale', 'Salu', 'Tchalla', 'Vignon', 'Worou', 'Zoh', 'Adama',
      'Abdou', 'Boukary', 'Moussa', 'Tchabe', 'Yendu',
    ],
    female: [
      'Abla', 'Kafui', 'Adjoa', 'Amah', 'Dede', 'Efua', 'Koku', 'Akouvi',
      'Ayaba', 'Bebele', 'Cossiwa', 'Djobole', 'Essivi', 'Farida', 'Gade',
      'Houna', 'Kodjovi', 'Lokou', 'Mama', 'Naya', 'Olawou', 'Padja',
      'Roukia', 'Sika', 'Tchin', 'Yawa', 'Zakiya', 'Aminata', 'Marie',
      'Fatou', 'Salimata', 'Adwoa',
    ],
    middleMale: ['Koffi', 'Kossi', 'Komlan', 'Mawuli', 'Kodjo', 'Adama', 'Moussa', 'Tchalla'],
    middleFemale: ['Abla', 'Adjoa', 'Kafui', 'Aminata', 'Dede', 'Roukia', 'Koku', 'Fatou'],
    surnames: [
      'Agbeko', 'Agbobli', 'Amegble', 'Amouzou', 'Attiogbe', 'Aziablé',
      'Bakonde', 'Bokovi', 'Dandjouma', 'Djagoun', 'Dogbe', 'Dossouvi',
      'Egbe', 'Folly', 'Gbadoe', 'Gnassingbé', 'Hounkpatin', 'Kadjalla',
      'Kodjo', 'Kombate', 'Kponle', 'Lare', 'Lawson', 'Mensah', 'Nadjo',
      'Namme', 'Noubissi', 'Ouro-Akondo', 'Pedo', 'Saint-Cyr', 'Tchame',
      'Tchanga', 'Tetteh', 'Tossou', 'Yaovi', 'Zanou',
    ],
    initiators: [
      'Koffi Amegble', 'Abla Mensah', 'Mawuli Attiogbe', 'Kafui Dossouvi',
      'Kossi Agbeko', 'Adwoa Bokovi', 'Komlan Kodjo', 'Aminata Tchame',
    ],
    regions: [
      'Maritime', 'Plateaux', 'Centrale', 'Kara', 'Savanes', 'Lomé',
      'Aného', 'Kpalimé', 'Sokodé', 'Dapaong', 'Atakpamé', 'Togoville',
      'Lake Togo', 'Mono River',
    ],
  },

  Rwanda: {
    male: [
      'Jean', 'Emmanuel', 'Eric', 'Claude', 'Patrick', 'Olivier', 'Alain',
      'Fidèle', 'Théogène', 'Aimable', 'Bonaventure', 'Cyprien', 'Dieudonné',
      'Élie', 'Félix', 'Gaspard', 'Habimana', 'Innocent', 'Juvénal',
      'Kanyarwanda', 'Laurent', 'Marc', 'Nkusi', 'Pacifique', 'Rémy',
      'Sébastien', 'Thaddée', 'Vital', 'Yves', 'Zacharie', 'Augustin',
      'Balthazar', 'Callixte', 'Donat', 'Emile',
    ],
    female: [
      'Marie', 'Jeanne', 'Claudine', 'Aline', 'Beatrice', 'Chantal',
      'Delphine', 'Epiphanie', 'Fabiola', 'Godelieve', 'Helene', 'Immaculée',
      'Joséphine', 'Keza', 'Laetitia', 'Mugisha', 'Niyonzima', 'Olivia',
      'Pacifique', 'Rose', 'Sandrine', 'Thérèse', 'Uwase', 'Vestine',
      'Yvette', 'Zigira', 'Alphonsine', 'Bernadette', 'Cécile', 'Dominique',
      'Esperance', 'Francine', 'Gratien', 'Jacqueline', 'Judith',
    ],
    middleMale: ['Jean', 'Emmanuel', 'Pierre', 'Claude', 'Frederic', 'Alain', 'Fidèle', 'Bonaventure'],
    middleFemale: ['Marie', 'Jeanne', 'Claudine', 'Thérèse', 'Bernadette', 'Esperance', 'Francine', 'Yvette'],
    surnames: [
      'Mugisha', 'Uwimana', 'Niyonzima', 'Habimana', 'Ndayisenga',
      'Nkurunziza', 'Bizimana', 'Rugema', 'Uwase', 'Mutabazi', 'Nkusi',
      'Gashugi', 'Himbaza', 'Kayitesi', 'Kamanzi', 'Mukamana', 'Musoni',
      'Ndagijimana', 'Nteziryayo', 'Rusanganwa', 'Sebuharara', 'Twagirimana',
      'Umutoni', 'Barengayabo', 'Cyiza', 'Gatera', 'Hakizimana', 'Iradukunda',
      'Kigali', 'Nyandwi', 'Rwabukamba', 'Tusingwire', 'Uwamahoro',
      'Zirimwabagabo', 'Abimana', 'Batamuliza',
    ],
    initiators: [
      'Jean Mugisha', 'Jeanne Uwase', 'Emmanuel Niyonzima', 'Marie Uwimana',
      'Fidèle Habimana', 'Claudine Mutabazi', 'Alain Nkusi', 'Thérèse Mukamana',
    ],
    regions: [
      'Kigali', 'Northern Province', 'Southern Province', 'Eastern Province',
      'Western Province', 'Volcanoes', 'Nyungwe', 'Akagera', 'Bugesera',
      'Rweru', 'Lake Kivu', 'Muhazi',
    ],
  },

  Zambia: {
    male: [
      'James', 'John', 'Peter', 'David', 'Joseph', 'Samuel', 'Emmanuel',
      'Mwamba', 'Chanda', 'Bwalya', 'Mulenga', 'Ngoma', 'Mumba', 'Phiri',
      'Zulu', 'Tembo', 'Mbewe', 'Mwanza', 'Sakala', 'Banda', 'Chansa',
      'Kabwe', 'Musonda', 'Mutale', 'Siame', 'Simwanza', 'Mwansa', 'Kunda',
      'Nkhata', 'Mvula', 'Shawa', 'Tembo', 'Chembe', 'Kalaba', 'Lungu',
    ],
    female: [
      'Mary', 'Grace', 'Mercy', 'Ruth', 'Esther', 'Elizabeth', 'Agnes',
      'Chanda', 'Mutinta', 'Bupe', 'Kombelwa', 'Natasha', 'Tasha',
      'Mwambazi', 'Chileshe', 'Martha', 'Nakanyika', 'Mukuka', 'Kabaso',
      'Nchimunya', 'Temwanani', 'Kaseba', 'Misozi', 'Nalishebo', 'Suwilanji',
      'Thandiwe', 'Butemwe', 'Chipo', 'Mubanga', 'Namukolo', 'Luyando',
      'Namwiinga', 'Chishala',
    ],
    middleMale: ['Mumba', 'Chanda', 'Phiri', 'Banda', 'Emmanuel', 'David', 'Joseph', 'Mwamba'],
    middleFemale: ['Chanda', 'Mutinta', 'Bupe', 'Grace', 'Martha', 'Nakanyika', 'Natasha', 'Chileshe'],
    surnames: [
      'Phiri', 'Tembo', 'Banda', 'Mwale', 'Chanda', 'Mumba', 'Zulu',
      'Mulenga', 'Bwalya', 'Mbewe', 'Sakala', 'Musonda', 'Simwanza',
      'Chileshe', 'Mwansa', 'Ngulube', 'Mwanza', 'Kabwe', 'Nkhoma',
      'Lungu', 'Chibuye', 'Kalaba', 'Kunda', 'Lukonga', 'Maboshe',
      'Menzies', 'Mtonga', 'Moyo', 'Mukwasa', 'Mweetwa', 'Ncube',
      'Nkhata', 'Sichone', 'Silavwe', 'Siwale', 'Tembo', 'Mutale',
      'Mbulo', 'Chisenga',
    ],
    initiators: [
      'James Phiri', 'Thembisa Banda', 'Emmanuel Chanda', 'Mary Mumba',
      'Peter Mwale', 'Grace Tembo', 'Joseph Mbewe', 'Ruth Sakala',
    ],
    regions: [
      'Lusaka', 'Copperbelt', 'Southern', 'Eastern', 'Northern',
      'Western', 'Central', 'Muchinga', 'Luapula', 'North-Western',
      'Kafue', 'Victoria Falls', 'Bangweulu', 'Lower Zambezi',
    ],
  },

  Zimbabwe: {
    male: [
      'Tendai', 'Tapiwa', 'Tafadzwa', 'Kudzai', 'Blessing', 'Emmanuel',
      'Tinashe', 'Takudzwa', 'Simba', 'Farai', 'Itai', 'Munyaradzi',
      'Nyaradzo', 'Tonderai', 'Learnmore', 'Gift', 'Tendekai', 'Chamu',
      'Nhamo', 'Naison', 'Fungai', 'Rufaro', 'Chenjerai', 'Givemore',
      'Masimba', 'Takunda', 'Panashe', 'Munya', 'Tafara', 'Terrence',
      'Brian', 'Dexter', 'Gareth', 'Lovemore', 'Power',
    ],
    female: [
      'Tendai', 'Nyasha', 'Ruvimbo', 'Chipo', 'Vimbai', 'Tariro',
      'Tinotenda', 'Shamiso', 'Rutendo', 'Chiedza', 'Kudzai', 'Tsitsi',
      'Makanaka', 'Nyaradzo', 'Panashe', 'Ropafadzo', 'Sekai', 'Tadiwa',
      'Tanaka', 'Chipo', 'Farai', 'Rudo', 'Mutsa', 'Nyadzisai', 'Charity',
      'Patience', 'Grace', 'Beauty', 'Lucky', 'Precious', 'Tracy',
    ],
    middleMale: ['Tendai', 'Tapiwa', 'Emmanuel', 'Tinashe', 'Blessing', 'Kudzai', 'Simba', 'Fungai'],
    middleFemale: ['Nyasha', 'Chipo', 'Ruvimbo', 'Tendai', 'Grace', 'Tsitsi', 'Rudo', 'Vimbai'],
    surnames: [
      'Moyo', 'Ncube', 'Dube', 'Sibanda', 'Ndlovu', 'Mpofu', 'Nkomo',
      'Sithole', 'Mhlanga', 'Khumalo', 'Banda', 'Mbira', 'Chikore', 'Gumbo',
      'Marufu', 'Mutasa', 'Makoni', 'Mangwende', 'Chiwanza', 'Chinhoyi',
      'Magwaza', 'Mazvimbakupa', 'Mudzimu', 'Mutambara', 'Muropa',
      'Nhema', 'Nyahoda', 'Nyangani', 'Rukodzi', 'Sangoi', 'Shoniwa',
      'Tagwireyi', 'Zvobgo', 'Chisvo', 'Makuvise', 'Masuku',
    ],
    initiators: [
      'Tendai Moyo', 'Nyasha Ncube', 'Emmanuel Dube', 'Chipo Sibanda',
      'Tapiwa Ndlovu', 'Ruvimbo Mpofu', 'Blessing Mhlanga', 'Tsitsi Khumalo',
    ],
    regions: [
      'Harare', 'Bulawayo', 'Mashonaland', 'Matabeleland', 'Midlands',
      'Masvingo', 'Manicaland', 'Chinhoyi', 'Victoria Falls', 'Great Zimbabwe',
      'Kalahari Edge', 'Zambezi Valley', 'Eastern Highlands',
    ],
  },

  'DR Congo': {
    male: [
      'Jean', 'Pierre', 'Paul', 'Emmanuel', 'Patrick', 'Dieudonné',
      'Bertin', 'Serge', 'Gauthier', 'Innocent', 'Kalala', 'Mbala',
      'Tshibangu', 'Mukendi', 'Kabongo', 'Mbuyi', 'Nsenga', 'Mpoyi',
      'Okito', 'Lemba', 'Bokolo', 'Mokonyi', 'Ekofo', 'Lingala', 'Mavungu',
      'Banza', 'Kasongo', 'Mwamba', 'Ilunga', 'Kabila', 'Tshisekedi',
      'Albert', 'Fabrice', 'Josué', 'Moïse', 'Samy',
    ],
    female: [
      'Marie', 'Jeanne', 'Mireille', 'Esther', 'Grace', 'Joséphine',
      'Claudine', 'Nathalie', 'Sylvie', 'Chantal', 'Michelle', 'Bernadette',
      'Nadine', 'Prisca', 'Deborah', 'Chizu', 'Mwadi', 'Ngoyi', 'Kabedi',
      'Mbombo', 'Nsumbu', 'Lumumba', 'Malala', 'Kanku', 'Mukalay',
      'Betu', 'Muadi', 'Mbaya', 'Kaswera', 'Odia', 'Rose', 'Aline',
    ],
    middleMale: ['Jean', 'Pierre', 'Paul', 'Emmanuel', 'Kalala', 'Tshibangu', 'Serge', 'Dieudonné'],
    middleFemale: ['Marie', 'Jeanne', 'Mwadi', 'Ngoyi', 'Claudine', 'Grace', 'Chantal', 'Esther'],
    surnames: [
      'Mbala', 'Tshibangu', 'Mukendi', 'Kabongo', 'Mbuyi', 'Nsenga',
      'Mpoyi', 'Kabila', 'Tshisekedi', 'Lumumba', 'Kanyinda', 'Mutombo',
      'Kalala', 'Mukwege', 'Balotshi', 'Bosongo', 'Bokelo', 'Bongongo',
      'Epenge', 'Ikala', 'Ilunga', 'Kasongo', 'Kengo', 'Kibali', 'Lukoki',
      'Mabiala', 'Malumba', 'Mavua', 'Mbikayi', 'Mokili', 'Mpiana',
      'Ndjoli', 'Ngandu', 'Nsue', 'Pembe', 'Saidi', 'Samba',
    ],
    initiators: [
      'Jean Mbala', 'Marie Tshibangu', 'Emmanuel Mukendi', 'Mwadi Kabongo',
      'Serge Mbuyi', 'Chantal Nsenga', 'Patrick Mpoyi', 'Esther Mwamba',
    ],
    regions: [
      'Kinshasa', 'Katanga', 'Kivu', 'Kasai', 'Equateur', 'Bas-Congo',
      'Orientale', 'Maniema', 'Bandundu', 'Congo River', 'Virunga',
      'Lake Tanganyika', 'Kasai Occidental', 'Haut-Uele',
    ],
  },

  Ethiopia: {
    male: [
      'Abel', 'Samuel', 'Dawit', 'Yonas', 'Nahom', 'Mikael', 'Yohannes',
      'Gebre', 'Tesfaye', 'Haile', 'Desta', 'Kebede', 'Alemayehu', 'Getachew',
      'Fikadu', 'Tadesse', 'Mulugeta', 'Berhanu', 'Girma', 'Ayele',
      'Hailu', 'Wondwossen', 'Ermias', 'Bereket', 'Teshome', 'Moges',
      'Mulugeta', 'Solomon', 'Zerihun', 'Tsegaye', 'Mamo', 'Kassa',
      'Abebe', 'Alemu', 'Dagem', 'Bethel', 'Yared', 'Elias',
    ],
    female: [
      'Hanna', 'Sara', 'Meron', 'Selam', 'Betiel', 'Liya', 'Ruth',
      'Bethlehem', 'Mahlet', 'Eden', 'Hiwot', 'Mahder', 'Saba', 'Nardos',
      'Tigist', 'Makeda', 'Almaz', 'Birtukan', 'Feker', 'Genet', 'Lida',
      'Menelik', 'Mekdes', 'Mimi', 'Abeba', 'Wubalem', 'Zewditu',
      'Eyerusalem', 'Firehiwot', 'Getnet', 'Kalkidan', 'Tsion', 'Winta',
    ],
    middleMale: ['Tesfaye', 'Dawit', 'Haile', 'Gebre', 'Yohannes', 'Samuel', 'Alemayehu', 'Solomon'],
    middleFemale: ['Selam', 'Hanna', 'Tigist', 'Bethlehem', 'Mahlet', 'Eden', 'Sara', 'Eyerusalem'],
    surnames: [
      'Tadesse', 'Desta', 'Haile', 'Tesfaye', 'Gebre', 'Kebede', 'Alemayehu',
      'Getachew', 'Mulugeta', 'Berhanu', 'Girma', 'Ayele', 'Hailu',
      'Wondwossen', 'Ermias', 'Bereket', 'Teshome', 'Moges', 'Solomon',
      'Zerihun', 'Tsegaye', 'Mamo', 'Kassa', 'Abebe', 'Alemu', 'Dagem',
      'Bethel', 'Yared', 'Elias', 'Gebremedhin', 'Hailemariam', 'Tekle',
      'Wolde', 'Zewde', 'Mekonnen', 'Assefa', 'Belay', 'Demissie',
    ],
    initiators: [
      'Dawit Tadesse', 'Selam Desta', 'Haile Gebre', 'Hanna Tesfaye',
      'Yohannes Haile', 'Bethlehem Wolde', 'Samuel Mulugeta', 'Eden Gebremedhin',
    ],
    regions: [
      'Amhara', 'Oromia', 'Tigray', 'Sidama', 'Somali', 'Afar',
      'Benishangul', 'Gambela', 'Harari', 'SNNPR', 'Addis Ababa',
      'Dire Dawa', 'Blue Nile', 'Awash', 'Axum', 'Gondar',
    ],
  },

  Morocco: {
    male: [
      'Youssef', 'Mohammed', 'Omar', 'Mehdi', 'Hassan', 'Karim', 'Rachid',
      'Said', 'Hicham', 'Khalid', 'Nabil', 'Amine', 'Hamza', 'Ismail',
      'Adil', 'Tarik', 'Bilal', 'Fouad', 'Jamal', 'Reda', 'Yassine',
      'Zakaria', 'Anas', 'Soufiane', 'Ayoub', 'Ali', 'Abdellah',
      'Abderrahmane', 'Mustapha', 'Driss', 'Mbarek', 'Tahar', 'Lahcen',
      'Hmad', 'Brahim',
    ],
    female: [
      'Fatima', 'Khadija', 'Amina', 'Salma', 'Yasmine', 'Nadia', 'Samira',
      'Laila', 'Meryem', 'Hanane', 'Zineb', 'Imane', 'Kenza', 'Hind',
      'Sanae', 'Rachida', 'Malika', 'Saida', 'Hafsa', 'Loubna', 'Souad',
      'Naima', 'Rihab', 'Asmae', 'Ghita', 'Ilham', 'Latifa', 'Zahra',
      'Aicha', 'Halima', 'Keltoum', 'Saadia', 'Zoubida', 'Fadma',
    ],
    middleMale: ['Mohammed', 'Abdellah', 'Ahmed', 'Hassan', 'Youssef', 'Omar', 'Karim', 'Rachid'],
    middleFemale: ['Fatima', 'Khadija', 'Amina', 'Zahra', 'Malika', 'Saida', 'Aicha', 'Zineb'],
    surnames: [
      'El Amrani', 'Benali', 'Berrada', 'Tazi', 'Alaoui', 'Bennis',
      'Chraibi', 'El Fassi', 'El Idrissi', 'Filali', 'Guessous', 'Kettani',
      'Lahlou', 'Mernissi', 'Naciri', 'Ouazzani', 'Rachidi', 'Sefrioui',
      'Tahiri', 'Ziani', 'Bouazza', 'Cherkaoui', 'Dahan', 'El Bouhali',
      'Erraji', 'Guedira', 'Hamdaoui', 'Idrissi', 'Jazouli', 'Kabbaj',
      'Lamrani', 'Mansouri', 'Naji', 'Oudghiri', 'Salmi', 'Slaoui',
      'Toumi', 'Zahraoui',
    ],
    initiators: [
      'Youssef El Amrani', 'Khadija Benali', 'Hassan Berrada', 'Amina Alaoui',
      'Omar Tazi', 'Zineb Bennis', 'Karim El Fassi', 'Salma Lahlou',
    ],
    regions: [
      'Casablanca', 'Rabat', 'Marrakech', 'Fez', 'Tangier', 'Agadir',
      'Oujda', 'Meknes', 'Essaouira', 'Chefchaouen', 'Atlas', 'Rif',
      'Sahara', 'Draa Valley', 'Souss', 'Oriental',
    ],
  },

  Egypt: {
    male: [
      'Mohamed', 'Ahmed', 'Mahmoud', 'Mostafa', 'Omar', 'Khaled', 'Amr',
      'Tarek', 'Hassan', 'Ibrahim', 'Youssef', 'Karim', 'Sherif', 'Hany',
      'Mahmoud', 'Islam', 'Ayman', 'Sayed', 'Hussein', 'Ali', 'Abdallah',
      'Farid', 'Gamal', 'Hesham', 'Magdy', 'Ramadan', 'Samir', 'Wael',
      'Zaki', 'Adel', 'Bassem', 'Emad', 'Fathy', 'Hamdy', 'Mamdouh',
    ],
    female: [
      'Fatma', 'Mona', 'Heba', 'Nour', 'Mariam', 'Sara', 'Aya', 'Dina',
      'Yasmin', 'Mai', 'Nada', 'Rania', 'Salma', 'Hana', 'Laila', 'Nadia',
      'Amira', 'Doha', 'Eman', 'Ghada', 'Hala', 'Iman', 'Lobna', 'Malak',
      'Nermin', 'Omnia', 'Rasha', 'Samia', 'Shaimaa', 'Taghreed', 'Zeinab',
    ],
    middleMale: ['Mohamed', 'Ahmed', 'Mahmoud', 'Hassan', 'Ibrahim', 'Khaled', 'Sayed', 'Ali'],
    middleFemale: ['Fatma', 'Mona', 'Zeinab', 'Nour', 'Salma', 'Heba', 'Mariam', 'Nadia'],
    surnames: [
      'Mohamed', 'Ahmed', 'Mahmoud', 'Mostafa', 'Ezzat', 'Farouk', 'Gamal',
      'Hassan', 'Ibrahim', 'Kamal', 'Lotfy', 'Mansour', 'Naguib', 'Osman',
      'Sabry', 'Talaat', 'Abdel-Fattah', 'Abdel-Rahman', 'Abou Zeid',
      'El-Sayed', 'El-Shenawy', 'Hussein', 'Ismail', 'Khalil', 'Moussa',
      'Nassar', 'Ragheb', 'Salam', 'Shaker', 'Soliman', 'Tawfik',
      'Yehia', 'Zaki', 'Abdel-Meguid', 'Badawi', 'El-Masry', 'Gabr',
      'Hegazy', 'Nasr', 'Saleh',
    ],
    initiators: [
      'Ahmed El-Sayed', 'Mona Farouk', 'Hassan Ibrahim', 'Salma Osman',
      'Khaled Mansour', 'Nadia Abdel-Rahman', 'Mahmoud Soliman', 'Zeinab Shaker',
    ],
    regions: [
      'Cairo', 'Alexandria', 'Giza', 'Luxor', 'Aswan', 'Suez Canal',
      'Delta', 'Sinai', 'Red Sea', 'Fayoum', 'Minya', 'Asyut',
      'Nile Valley', 'Western Desert', 'Bahariya', 'Dakhla',
    ],
  },
};

// ------------------------------------------------------------------
// Generator
// ------------------------------------------------------------------
const ROLE_ORDER = ['INSINUATOR', 'MINERVAL_ASSEMBLY_OFFICER', 'DIRECTORATE_OFFICER', 'PREFECT'];

async function main(): Promise<void> {
  const total = MEMBER_DISTRIBUTION.reduce((sum, item) => sum + item.total, 0);
  if (total !== 2387) {
    throw new Error(`Distribution misconfigured: expected 2387 total, got ${total}`);
  }

  const before = await prisma.member.count();
  console.log(`[generate] members before: ${before}`);

  const existingIds = new Set(
    (await prisma.member.findMany({ select: { memberId: true } })).map((m) => m.memberId),
  );
  if (!existingIds.has(EXISTING_MEMBER_ID)) {
    throw new Error(`${EXISTING_MEMBER_ID} not found — refusing to generate without the founding record.`);
  }

  // Reserved registry space BOL-1 … BOL-2387, excluding BOL-1385.
  const availableIds: string[] = [];
  for (let n = 1; n <= 2387; n += 1) {
    if (n === 1385) continue;
    availableIds.push(`BOL-${n}`);
  }
  if (availableIds.length !== 2386) {
    throw new Error(`Unexpected available ID count: ${availableIds.length}`);
  }

  // Deterministic historical ordering of IDs across countries.
  const idOrder = seededShuffle(availableIds, mulberry32(hashString('VEIL-REGISTRY-2387')));

  const now = 2026;
  let idCursor = 0;

  const rows: {
    memberId: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    fullName: string;
    membershipType: string;
    status: string;
    role: string;
    country: string;
    countryInitiator: string | null;
    journeyStartedYear: number;
    formalApprovalYear: number;
    fullMembershipYear: number;
    prefecture: string | null;
    directorate: string | null;
    minervalAssembly: string | null;
    cell: string | null;
    insinuatorName: string | null;
  }[] = [];

  const seen: Set<string> = new Set();
  let generated = 0;

  for (const entry of MEMBER_DISTRIBUTION) {
    const names = COUNTRIES[entry.country];
    if (!names) {
      throw new Error(`No name pool for country: ${entry.country}`);
    }
    // BOL-1385 is Ghana's existing record; generate the remainder.
    const createCount = entry.total - (entry.country === 'Ghana' ? 1 : 0);
    if (createCount <= 0) continue;

    const seed = hashString(`VEIL-${entry.country}`);
    const rnd = mulberry32(seed);

    const malePool = names.male;
    const femalePool = names.female;
    const middleMale = names.middleMale ?? [];
    const middleFemale = names.middleFemale ?? [];
    const maleSurnames = [...names.surnames, ...(names.maleOnlySurnames ?? [])];
    const femaleSurnames = [...names.surnames, ...(names.femaleOnlySurnames ?? [])];

    // Shuffled candidate pairs per gender of (given index, surname index).
    const buildPairs = (given: readonly string[], surnames: readonly string[]) => {
      const list: [number, number][] = [];
      for (let i = 0; i < given.length; i += 1) {
        for (let j = 0; j < surnames.length; j += 1) {
          list.push([i, j]);
        }
      }
      return seededShuffle(list, mulberry32(seed ^ 0x9e3779b9));
    };
    const malePairs = buildPairs(malePool, maleSurnames);
    const femalePairs = buildPairs(femalePool, femaleSurnames);
    let maleCursor = 0;
    let femaleCursor = 0;

    // Forced country-initiator seat index (keeps every country with a
    // keeper); larger countries also gain other organizational seats.
    const initiatorIdx = Math.floor(createCount / 2);

    for (let m = 0; m < createCount; m += 1) {
      const isMale = rnd() < 0.5;
      const givenPool = isMale ? malePool : femalePool;
      const middlePool = isMale ? middleMale : middleFemale;
      const pairs = isMale ? malePairs : femalePairs;
      const surnamePool = isMale ? maleSurnames : femaleSurnames;
      const cursor = isMale ? maleCursor : femaleCursor;

      let firstName = '';
      let lastName = '';
      let middleName: string | null = null;

      // Pick a (given, surname) pair that yields a name identity not
      // already produced for this country.
      let usedPairs = cursor;
      for (let attempt = 0; attempt < 4000; attempt += 1) {
        if (usedPairs >= pairs.length) {
          throw new Error(`Exhausted ${isMale ? 'male' : 'female'} name pairs for ${entry.country}`);
        }
        const [gi, si] = pairs[usedPairs] as [number, number];
        usedPairs += 1;
        const g = givenPool[gi] as string;
        const sn = surnamePool[si] as string;

        const useMiddle = middlePool.length > 0 && rnd() < 0.55;
        let mid: string | null = null;
        if (useMiddle) {
          mid = middlePool[Math.floor(rnd() * middlePool.length)] as string;
        }
        const full = [g, mid, sn].filter(Boolean).join(' ');
        const key = `${entry.country}|${full.toLowerCase()}`;
        if (!seen.has(key)) {
          firstName = g;
          lastName = sn;
          middleName = mid;
          seen.add(key);
          break;
        }
      }
      if (!firstName) {
        throw new Error(`Could not allocate a unique name for ${entry.country} member ${m}`);
      }
      if (isMale) maleCursor = usedPairs;
      else femaleCursor = usedPairs;

      // membershipType / status / role
      const typeRoll = rnd();
      const membershipType = typeRoll < 0.11 ? 'LIFE MEMBER' : 'MEMBER';
      const statusRoll = rnd();
      const status = statusRoll < 0.84 ? 'ACTIVE' : statusRoll < 0.9 ? 'RESTRICTED' : 'ARCHIVED';

      let role = 'MEMBER';
      const roleRoll = rnd();
      const isInitiatorSeat = m === initiatorIdx && createCount >= 15;
      if (isInitiatorSeat) {
        role = 'COUNTRY_INITIATOR';
      } else if (roleRoll < 0.006) {
        role = ROLE_ORDER[0] as string;
      } else if (roleRoll < 0.013) {
        role = ROLE_ORDER[1] as string;
      } else if (roleRoll < 0.02) {
        role = ROLE_ORDER[2] as string;
      } else if (roleRoll < 0.026) {
        role = ROLE_ORDER[3] as string;
      } else if (roleRoll < 0.031) {
        role = 'COUNTRY_INITIATOR';
      }

      // Historical journey (year-level only). Initiation journeys began
      // between 1998 and 2019; approval and full membership follow 3-7
      // years later, never beyond the current registry year.
      const journeyStartedYear = 1998 + Math.floor(rnd() * 22);
      const prep = 3 + Math.floor(rnd() * 5);
      const formalApprovalYear = Math.min(journeyStartedYear + prep, now);
      const fullMembershipYear = formalApprovalYear + (rnd() < 0.2 && formalApprovalYear < now ? 1 : 0);

      // Country Initiator who brought this member behind the veil.
      const initiatorPool = names.initiators;
      const countryInitiator =
        initiatorPool.length > 0 && rnd() < 0.85
          ? (initiatorPool[Math.floor(rnd() * initiatorPool.length)] as string)
          : null;

      // Organizational variation for a subset of members.
      let prefecture: string | null = null;
      let directorate: string | null = null;
      let minervalAssembly: string | null = null;
      let cell: string | null = null;
      let insinuatorName: string | null = null;
      if (rnd() < 0.68) {
        prefecture = `${names.regions[Math.floor(rnd() * names.regions.length)]} Prefecture`;
      }
      if (rnd() < 0.58) {
        directorate = `${DIRECTORATE_WORDS[Math.floor(rnd() * DIRECTORATE_WORDS.length)]} Directorate`;
      }
      if (rnd() < 0.5) {
        minervalAssembly = ASSEMBLIES[Math.floor(rnd() * ASSEMBLIES.length)] as string;
      }
      if (rnd() < 0.4) {
        cell = CELLS[Math.floor(rnd() * CELLS.length)] as string;
      }
      if (rnd() < 0.3 && initiatorPool.length > 0) {
        insinuatorName = initiatorPool[Math.floor(rnd() * initiatorPool.length)] as string;
      }

      rows.push({
        memberId: idOrder[idCursor] as string,
        firstName,
        middleName,
        lastName,
        fullName: [firstName, middleName, lastName].filter(Boolean).join(' '),
        membershipType,
        status,
        role,
        country: entry.country,
        countryInitiator,
        journeyStartedYear,
        formalApprovalYear,
        fullMembershipYear,
        prefecture,
        directorate,
        minervalAssembly,
        cell,
        insinuatorName,
      });
      idCursor += 1;
      generated += 1;
    }
  }

  if (idCursor !== availableIds.length) {
    throw new Error(`ID/record mismatch: assigned ${idCursor} of ${availableIds.length}`);
  }
  if (generated !== 2386) {
    throw new Error(`Expected 2386 generated records, got ${generated}`);
  }

  // Deduplicate against the live registry before inserting.
  const toInsert = rows.filter((row) => !existingIds.has(row.memberId));
  console.log(`[generate] rows prepared: ${rows.length}, rows already present (skipped): ${rows.length - toInsert.length}`);

  const memberIdSet = new Set(toInsert.map((row) => row.memberId));
  if (memberIdSet.size !== toInsert.length) {
    throw new Error('Internal duplicate memberIds detected in generated batch.');
  }
  const fullNameSet = new Set(toInsert.map((row) => row.fullName.toLowerCase()));
  if (fullNameSet.size !== toInsert.length) {
    throw new Error(`Duplicate fullName detected in generated batch (${toInsert.length} rows, ${fullNameSet.size} unique names).`);
  }

  if (toInsert.length > 0) {
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < toInsert.length; i += 500) {
        const chunk = toInsert.slice(i, i + 500);
        const result = await tx.member.createMany({ data: chunk });
        if (result.count !== chunk.length) {
          throw new Error(`createMany inserted ${result.count} of expected ${chunk.length}`);
        }
        console.log(`[generate] inserted ${i + chunk.length}/${toInsert.length}`);
      }
    });
  }

  const after = await prisma.member.count();
  console.log(`[generate] members after: ${after}`);
  console.log(`[generate] created ${after - before} new member records.`);

  await prisma.$disconnect();
}

const isEntryPoint =
  typeof require !== 'undefined' && require.main === module;

if (isEntryPoint) {
  main()
    .catch(async (error) => {
      console.error('[generate] failed:', error instanceof Error ? error.stack ?? error.message : error);
      await prisma.$disconnect().catch(() => undefined);
      process.exit(1);
    });
} else {
  void prisma.$disconnect();
}
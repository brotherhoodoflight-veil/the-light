// ============================================================
// VEIL — Brotherhood Chamber Historical Records (Data Only)
// The Brotherhood of Light
//
// Populates the Chamber with realistic historical conversation
// records dated 2019-2025, using ONLY the 2,387 real Member
// records already in the registry. BOL-1385 (Dankwah Kwame
// Foster) appears NOWHERE: not as creator, participant, sender,
// contributor, or reader of any historical record, and no
// historical record is dated after 2025 (before his 2026 full
// membership).
//
// Repeat-safe and deterministic:
//   • Conversation ids are derived from stable keys.
//   • Conversations already present are skipped entirely
//     (matching members/messages are never re-inserted).
//   • Participants are resolved from the live registry (ACTIVE
//     members, BOL-1385 never eligible).
//   • Rows are inserted inside one transaction per conversation.
//
// Data policy (matches the message types used by the Chamber):
//   • Conversation type:        PRIVATE | BROTHERHOOD | ASSEMBLY |
//                                OFFICIAL | RESTRICTED
//   • Status:                   ACTIVE (old chambers archived)
//   • Member role:              OWNER (creator) | ADMIN | MEMBER
//   • Message type/status:      TEXT / NORMAL throughout
//   • Read receipts + lastReadAt are written so historical threads
//     present correctly in the Chamber list (unread markers derive
//     from MessageRead rows, never from timestamps alone).
//   • ConversationAudit records the creation, later membership
//     additions, and archival events.
// ============================================================

import 'dotenv/config';
import { PrismaClient } from '../lib/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import type { ConversationType } from '../lib/messages/types';

const sqliteUrl = process.env.DATABASE_URL ?? 'file:./dev.db';
const adapter = new PrismaBetterSqlite3({ url: sqliteUrl });
const prisma = new PrismaClient({ adapter });

export const EXCLUDED_MEMBER_ID = 'BOL-1385';
export const CONV_ID_PREFIX = 'veil-h';

export const MIN_HISTORICAL_DATE = new Date('2019-01-01T00:00:00.000Z');
export const MAX_HISTORICAL_DATE = new Date('2025-12-31T23:59:59.000Z');

// ------------------------------------------------------------------
// Seed model
// ------------------------------------------------------------------

interface CastRef {
  country: string;
  n: number;
}

interface SeedMsg {
  by: number;        // cast slot index
  min: number;       // minutes since the conversation started
  body: string;      // may contain {n} fullName, {nf} firstName
  replyTo?: number;  // index of an earlier message in the same list
}

interface SeedConv {
  key: string;
  type: ConversationType;
  title?: string;
  description?: string;
  status?: 'ACTIVE' | 'ARCHIVED';
  start: string;             // ISO timestamp (UTC)
  createdBy: number;         // cast slot index (becomes OWNER)
  cast: CastRef[];
  adminSlots?: number[];     // additional ADMIN roles
  unreadBy?: number;         // slot left with unread messages
  unreadAfter?: number;      // first message index they never saw
  auditAdds?: { slot: number; min: number }[]; // members added later
  archiveMin?: number;       // minutes at which the chamber is archived
  msgs: SeedMsg[];
}

// ------------------------------------------------------------------
// Historical content (2019-2025). Registration dates are chosen by
// year and season; no record references Dankwah (BOL-1385).
// ------------------------------------------------------------------

export const CHAMBER_SEEDS: SeedConv[] = [
  // ---------------------------------------------------------------- 2019
  {
    key: 'founding-circle-2019',
    type: 'BROTHERHOOD',
    title: 'The Founding Circle',
    description: 'Inaugural chamber of the digital registry.',
    start: '2019-03-12T19:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'United States', n: 0 },
      { country: 'United Kingdom', n: 3 },
      { country: 'Ghana', n: 1 },
      { country: 'Nigeria', n: 0 },
      { country: 'India', n: 0 },
      { country: 'Canada', n: 1 },
      { country: 'Germany', n: 0 },
      { country: 'Japan', n: 0 },
    ],
    msgs: [
      { by: 0, min: 0, body: 'Brothers, this chamber is opened to lay the first stone of a common register - a single, faithful record where the brotherhood may be counted across all lands.' },
      { by: 1, min: 9, body: 'A single register will serve the order better than fifty scattered ledgers. I second the work, and I offer the archive-room arrangement on our side.' },
      { by: 2, min: 18, body: 'Ghana holds records reaching back more than a decade in paper form. I will see that they are indexed before the next assembly.' },
      { by: 3, min: 24, body: 'The names and numbers recorded should follow one convention so the register reads as one book. Let us agree on that before entry begins.' },
      { by: 0, min: 33, body: 'We shall record country, membership class, and the year each brother began the journey. The format is fixed in the appended note.' },
      { by: 4, min: 41, body: 'If the number is historical and permanent, then BOL plus the sequence is the only key we need. It must never be re-issued.' },
      { by: 5, min: 52, body: 'Agreed. I will take the minutes of this chamber and deposit them in the same archive so the record is complete from its first hour.' },
      { by: 0, min: 66, body: 'The motion is carried. The register is open. Brothers, the work is written at last.' },
    ],
  },
  {
    key: 'codex-commission-2019',
    type: 'PRIVATE',
    start: '2019-06-02T15:30:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'United Kingdom', n: 3 },
      { country: 'United States', n: 0 },
    ],
    msgs: [
      { by: 0, min: 3, body: 'Brother, I have been asked to review the passage of the Codex that will anchor the winter ceremonies. Your counsel would steady the proofing.' },
      { by: 1, min: 11, body: 'Send the working copy and I will compare it against the 2011 edition held in our lodge. Differences should be few, but they must be noted.' },
      { by: 0, min: 26, body: 'The differences are confined to punctuation and two words in the second verse. Both change the cadence when read aloud.', replyTo: 1 },
      { by: 1, min: 40, body: 'Then adopt the older reading for ceremony and keep the modern text for study. That is the accepted practice in the two temples I know.' },
      { by: 0, min: 63, body: 'Agreed. I will mark the decision in the commission record and notify the scribe before the rehearsal.' },
      { by: 1, min: 87, body: 'Good. When the printing is done, one clean copy to the archives and one to each reading circle.' },
    ],
  },
  {
    key: 'phoenix-assembly-2019',
    type: 'ASSEMBLY',
    title: 'Phoenix Assembly - Ceremonial Calendar',
    description: 'Autumn ceremonial planning for the Phoenix Assembly.',
    start: '2019-08-14T17:00:00.000Z',
    createdBy: 1,
    cast: [
      { country: 'Ghana', n: 0 },
      { country: 'Ghana', n: 1 },
      { country: 'Ghana', n: 2 },
      { country: 'Nigeria', n: 0 },
      { country: 'Nigeria', n: 1 },
      { country: 'Côte d’Ivoire', n: 0 },
      { country: 'Cameroon', n: 0 },
      { country: 'Senegal', n: 0 },
    ],
    auditAdds: [{ slot: 7, min: 45 }],
    msgs: [
      { by: 1, min: 0, body: 'The ceremonial calendar for the autumn is before the assembly. We ask that each cell review the dates it has been assigned.' },
      { by: 0, min: 7, body: 'Accra has the eleventh of November marked for the gathering of aspirants. The venue is reserved.' },
      { by: 2, min: 15, body: 'Kumasi will hold the preparatory meeting one week earlier so the materials are in order beforehand.' },
      { by: 3, min: 22, body: 'Lagos will need the printed booklets by the first of the month. Kindly confirm the print count in the minutes.' },
      { by: 4, min: 33, body: 'The booklet count is requested from each cell; we cannot hold stock beyond what is confirmed.' },
      { by: 5, min: 48, body: 'Abidjan confirms twelve copies. We will collect them on the day before the ceremony.' },
      { by: 6, min: 61, body: 'Douala likewise confirms, and will add an index card for the library.' },
      { by: 7, min: 77, body: 'Senegal joins the assembly and confirms its copies as well; the materials will be carried by the delegation.' },
      { by: 1, min: 90, body: 'The calendar is approved as read. The minutes will record the confirmations. The assembly stands adjourned.' },
      { by: 0, min: 95, body: 'One note for the record: the register page numbering must be checked before the books are bound.' },
    ],
  },
  {
    key: 'inner-chamber-2019-closing',
    type: 'RESTRICTED',
    title: 'Inner Chamber - Year-End Record',
    description: 'Restricted year-end record and protocol note.',
    status: 'ARCHIVED',
    start: '2019-12-05T18:00:00.000Z',
    createdBy: 0,
    archiveMin: 60,
    cast: [
      { country: 'United States', n: 0 },
      { country: 'United Kingdom', n: 3 },
      { country: 'Ghana', n: 1 },
      { country: 'Nigeria', n: 0 },
      { country: 'Japan', n: 0 },
    ],
    msgs: [
      { by: 0, min: 0, body: 'The year closes with the register intact and the commissions discharged. What remains is the protocol note for the new season.' },
      { by: 1, min: 12, body: 'The only open item is the custody of the printed ledger during the winter. The archivists have proposed a two-key arrangement.' },
      { by: 2, min: 25, body: 'We will keep the first key; the second remains with the country initiator until the spring assembly asks for it.' },
      { by: 3, min: 40, body: 'That is acceptable. Should either key be lost, the ledger is opened only by a written motion of this chamber.' },
      { by: 0, min: 58, body: 'Recorded. This chamber is closed for the season and its minutes deposited in the archive.' },
    ],
  },
  {
    key: 'sponsors-note-2019',
    type: 'PRIVATE',
    start: '2019-10-20T10:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'Ghana', n: 1 },
      { country: 'United Kingdom', n: 3 },
    ],
    msgs: [
      { by: 0, min: 2, body: 'Brother, I write to thank you for the guidance given at the last gathering. The discipline of the journey is clearer to me now.' },
      { by: 1, min: 19, body: 'Thank the work, not the messenger. Keep the records of your progression honestly and the register will hold nothing against you.' },
      { by: 0, min: 34, body: 'I have begun keeping a personal journal as advised. I will bring it to the review when the season requires it.' },
      { by: 1, min: 50, body: 'That is the correct practice. Do not fear the honest page; it is the polished page that misleads.' },
      { by: 0, min: 66, body: 'I will remember that. May the light hold firm through the winter months.' },
    ],
  },

  // ---------------------------------------------------------------- 2020
  {
    key: 'fellowship-directive-2020',
    type: 'BROTHERHOOD',
    title: 'Fellowship Directive - 2020',
    description: 'Annual service-week directive across the countries.',
    start: '2020-01-18T09:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'United States', n: 5 },
      { country: 'United Kingdom', n: 5 },
      { country: 'Ghana', n: 2 },
      { country: 'Nigeria', n: 3 },
      { country: 'India', n: 1 },
      { country: 'Japan', n: 1 },
      { country: 'South Korea', n: 0 },
      { country: 'United Arab Emirates', n: 1 },
    ],
    msgs: [
      { by: 0, min: 0, body: 'Brothers, the directive for the new year: each country is asked to hold one service-week meeting before March and to report its date here.' },
      { by: 1, min: 10, body: 'London will hold its meeting in the second week of February and will share the room with two guests from the continent.' },
      { by: 2, min: 21, body: 'Accra proposes the first week of March, to follow the local ceremonies rather than precede them.' },
      { by: 3, min: 33, body: 'Lagos takes the final week of February. The register work will be reviewed in the same sitting.' },
      { by: 4, min: 45, body: 'Mumbai will confirm after the local calendar is printed; I expect the second week of March.' },
      { by: 5, min: 60, body: 'Tokyo has fixed its meeting for the twenty-first of February and will keep a written record for the archive.' },
      { by: 6, min: 73, body: 'Seoul will hold its gathering early in March and notes the same record-keeping practice.' },
      { by: 7, min: 88, body: 'Dubai confirms the first week of March and will forward its minutes within seven days of the meeting.' },
      { by: 0, min: 104, body: 'The directive is acknowledged in all the countries represented. The record stands complete for 2020.' },
    ],
  },
  {
    key: 'archives-handover-2020',
    type: 'PRIVATE',
    start: '2020-04-22T11:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'Ghana', n: 1 },
      { country: 'United Kingdom', n: 3 },
    ],
    msgs: [
      { by: 0, min: 4, body: 'Brother, the scanned ledger for the years 2009 to 2017 is complete. I am preparing the handover to the central archive.' },
      { by: 1, min: 16, body: 'Received. Use the storage path for scanned material and name each page by year then by folio so the order survives any migration.' },
      { by: 0, min: 29, body: 'The naming convention is applied. The index card will accompany the deposit and be updated quarterly.' },
      { by: 1, min: 44, body: 'One caution: keep the original signatures visible; we do not crop the scanned pages under any circumstance.' },
      { by: 0, min: 61, body: 'Understood. Nothing is cropped and nothing is recolored. The deposit will be posted before the end of the month.' },
    ],
  },
  {
    key: 'north-star-room-2020',
    type: 'ASSEMBLY',
    title: 'North Star Room - Assembly Preparation',
    description: 'Preparation for the June assembly in the North Star room.',
    start: '2020-06-07T15:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'United States', n: 0 },
      { country: 'United States', n: 3 },
      { country: 'Canada', n: 0 },
      { country: 'Mexico', n: 0 },
      { country: 'Brazil', n: 0 },
      { country: 'New Zealand', n: 0 },
    ],
    msgs: [
      { by: 0, min: 0, body: 'The North Star room is reserved for the June assembly. We will run the roll call at the half hour and the opening word at the hour.' },
      { by: 1, min: 9, body: 'The roll sheet is ready with the names in alphabetical order by country, not by seniority.' },
      { by: 2, min: 18, body: 'Ottawa will provide the audio record. We ask that it be kept for seven years and then transferred to the archive.' },
      { by: 3, min: 26, body: 'Mexico City will supply the printed agenda and the order of ceremony; proofs will be sent three days ahead.' },
      { by: 4, min: 37, body: 'Rio will hold the register of visitors and will note time of arrival for the assembly book.' },
      { by: 5, min: 51, body: 'Wellington confirms the minutes will be drafted within two days and circulated for correction.' },
      { by: 0, min: 63, body: 'Everything is in hand. See you all in the North Star room.' },
    ],
  },
  {
    key: 'official-2020-01',
    type: 'OFFICIAL',
    title: 'Official - Veil Directive 2020-01',
    description: 'Standing directive on official correspondence.',
    start: '2020-08-30T08:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'United Arab Emirates', n: 0 },
      { country: 'Saudi Arabia', n: 0 },
      { country: 'Qatar', n: 0 },
      { country: 'Kuwait', n: 0 },
      { country: 'Egypt', n: 0 },
    ],
    msgs: [
      { by: 0, min: 0, body: 'Directive 2020-01. Effective immediately, every official communication intended for more than one country must be recorded in the central register before it is sent.' },
      { by: 0, min: 45, body: 'Clarification: this applies to the printed and the digital forms alike. The record entry precedes the despatch, not the other way about.' },
      { by: 0, min: 130, body: 'Addendum. The scribe of each country holds the authority to confirm the register entry. No entry, no despatch.' },
      { by: 0, min: 240, body: 'Reminder for the mid-season: the directive is not discretionary. Please review the standing instructions in the handbook before communicating externally.' },
      { by: 0, min: 390, body: 'This directive stands until superseded. It will be reviewed at the 2021 registry closing.' },
    ],
  },
  {
    key: 'locked-garden-2020',
    type: 'BROTHERHOOD',
    title: 'The Locked Garden - Reading Circle',
    description: 'Monthly reading circle on the Codex passage of the inner garden.',
    start: '2020-11-09T18:30:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'Netherlands', n: 0 },
      { country: 'Ireland', n: 0 },
      { country: 'Norway', n: 0 },
      { country: 'Sweden', n: 0 },
      { country: 'Denmark', n: 0 },
      { country: 'Belgium', n: 0 },
      { country: 'Switzerland', n: 0 },
      { country: 'Austria', n: 0 },
    ],
    auditAdds: [{ slot: 7, min: 85 }],
    msgs: [
      { by: 0, min: 0, body: 'The reading for this month is the second passage of the Codex concerning the inner garden. May we hear first impressions?' },
      { by: 1, min: 12, body: 'The passage reads like a discipline rather than a promise. The gardener does not pull the seedling to measure its growth.' },
      { by: 2, min: 24, body: 'That word - discipline - carries it. The patient tending is the whole of the work; the flowering cannot be hurried.' },
      { by: 3, min: 37, body: 'I had read it as a story of reward. I am corrected: the reward is the tending itself.', replyTo: 1 },
      { by: 4, min: 51, body: 'Then the locked gate is not to keep others out but to keep the work still and unhurried within.' },
      { by: 5, min: 66, body: 'A fine reading, Brother. The gate protects the silence the work requires.' },
      { by: 6, min: 80, body: 'I will bring a copy of the older commentary next month; it sets the same words beside the year of the founding.' },
      { by: 7, min: 97, body: 'Austria enters the circle and seconds the reading. We will prepare the transcripts for the archive as is the custom.' },
      { by: 0, min: 112, body: 'We are in agreement. The December passage is announced and the record of this reading is made.' },
    ],
  },
  {
    key: 'codex-translation-2020',
    type: 'PRIVATE',
    start: '2020-02-11T12:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'Japan', n: 0 },
      { country: 'Brazil', n: 0 },
    ],
    msgs: [
      { by: 0, min: 3, body: 'Brother, I am translating the Codex passage you requested. One phrase resists a clean rendering and I would value your eye.' },
      { by: 1, min: 21, body: 'Send the original and the two renderings you hold. Portuguese avoids abstractions well; we can test it against the Japanese sense.' },
      { by: 0, min: 38, body: 'The phrase governs the third line of the passage on the Secret Hidden Angel. Literally it reads "the veil keeps the veil".' },
      { by: 1, min: 55, body: 'Then keep the riddle. It is not a failure of translation; the text intends that very doubling. Render it simply and let the reader meet it.', replyTo: 2 },
      { by: 0, min: 72, body: 'So the phrase stands, without paraphrase. I will mark it as an intentional reading in the notes.' },
      { by: 1, min: 89, body: 'Mark it clearly so no future editor corrects it back into prose. The Codex has its own grammar.' },
    ],
  },

  // ---------------------------------------------------------------- 2021
  {
    key: 'anniversary-of-first-light-2021',
    type: 'BROTHERHOOD',
    title: 'Anniversary of the First Light - 2021',
    description: 'Two-year anniversary of the digital registry.',
    start: '2021-03-12T18:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'United States', n: 0 },
      { country: 'United Kingdom', n: 3 },
      { country: 'Ghana', n: 0 },
      { country: 'Nigeria', n: 0 },
      { country: 'India', n: 0 },
      { country: 'Canada', n: 1 },
      { country: 'Germany', n: 0 },
      { country: 'Japan', n: 0 },
    ],
    msgs: [
      { by: 0, min: 0, body: 'Two years ago this chamber opened. Today the register holds the records of every country represented here and more besides.' },
      { by: 2, min: 7, body: 'On behalf of Ghana, the work of the founders is carried faithfully. The paper ledgers are indexed and the annual reviews are current.' },
      { by: 1, min: 15, body: 'London seconds the note. The archive staff has doubled and the custody rules are now written in the handbook.' },
      { by: 3, min: 23, body: 'Lagos reports every member record reconciled with the national register. No number in the book is empty.' },
      { by: 4, min: 31, body: 'Mumbai records the same for its district. The translation of the handbook into three languages is complete.' },
      { by: 5, min: 41, body: 'Ottawa has completed the digital migration of the 2019 volumes and will continue with 2020 after the review.' },
      { by: 6, min: 53, body: 'Berlin reports the conservation schedule on schedule: the oldest pages are scanned at the highest available resolution.' },
      { by: 7, min: 67, body: "Tokyo's study groups have all resumed and are following the announced reading circle calendar." },
      { by: 0, min: 84, body: 'The anniversary is marked and the continuity proven. The light holds from year to year.' },
    ],
  },
  {
    key: 'initiation-protocol-review-2021',
    type: 'RESTRICTED',
    title: 'Initiation Protocol - 2021 Review',
    description: 'Review of how a journey is recorded in the register.',
    start: '2021-06-16T09:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'Ghana', n: 1 },
      { country: 'Nigeria', n: 1 },
      { country: 'United States', n: 5 },
      { country: 'United Kingdom', n: 5 },
      { country: 'Ethiopia', n: 0 },
    ],
    msgs: [
      { by: 0, min: 0, body: 'The protocol review opens. We examine how a journey is recorded from its first interview to the day of full membership.' },
      { by: 1, min: 11, body: 'The stages should each leave a dated entry: the beginning, the preparation, the formal approval, and the full membership. Nothing else need be public.' },
      { by: 2, min: 26, body: 'Agreed. The register stores year-level dates for the journey and keeps precise dates of initiation only where they are already recorded.' },
      { by: 3, min: 38, body: "The applicant's own confidentiality is absolute. The entries are visible only to the country initiator and to those charged with the review." },
      { by: 4, min: 55, body: 'We will adopt the written standard now and apply it to reflections already in progress, so that no record has to be re-drawn later.' },
      { by: 0, min: 72, body: 'The revised protocol is adopted. The scribe circulates the wording, and the register follows this standard from the first day of the next season.' },
    ],
  },
  {
    key: 'curators-correspondence-2021',
    type: 'PRIVATE',
    start: '2021-05-19T10:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'Ghana', n: 0 },
      { country: 'Germany', n: 0 },
    ],
    msgs: [
      { by: 0, min: 3, body: 'Brother, the new archival plates have arrived. I will begin transferring the oldest volumes and will keep the working order of the catalog intact.' },
      { by: 1, min: 18, body: 'Good. Use the acid-free interleaving where the plates touch the bindings, and photograph the spine before any repair.' },
      { by: 0, min: 33, body: 'The photographs are taken before transfer as a matter of course. Each volume keeps its catalog number throughout the work.' },
      { by: 1, min: 52, body: 'One more habit to adopt: after transfer, verify the folio count against the register before the box is sealed.' },
      { by: 0, min: 70, body: 'Verified at closure, always. The first two volumes are complete and the third begins this week.' },
    ],
  },
  {
    key: 'heron-assembly-2021',
    type: 'ASSEMBLY',
    title: 'Heron Assembly - Term Notes',
    description: 'Autumn term notes for the Heron Assembly.',
    start: '2021-09-13T15:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'Canada', n: 1 },
      { country: 'United States', n: 8 },
      { country: 'Mexico', n: 0 },
      { country: 'Brazil', n: 1 },
      { country: 'Australia', n: 0 },
      { country: 'New Zealand', n: 0 },
    ],
    msgs: [
      { by: 0, min: 0, body: 'The Heron assembly convenes for the autumn term. Agenda: community efforts, the reading series, and the year-end report.' },
      { by: 1, min: 9, body: 'The community effort is confirmed: two projects in the western region, both with the register of participants kept by the assembly.' },
      { by: 2, min: 18, body: 'Mexico proposes the reading series carry the Codex passage on the inner garden, following the European circles lead.' },
      { by: 3, min: 30, body: 'Rio seconds that choice and will provide the Spanish and Portuguese copies for distribution.' },
      { by: 4, min: 44, body: "Sydney will take responsibility for the year-end report and asks for each country's numbers by the first of November." },
      { by: 5, min: 58, body: 'Wellington confirms the report layout and the archive deposit schedule for after the assembly closes.' },
      { by: 0, min: 72, body: "The term's program is approved as set forth. Minutes will be circulated within three days." },
    ],
  },
  {
    key: 'official-registry-closing-2021',
    type: 'OFFICIAL',
    title: 'Official - Registry Closing 2021',
    description: 'Official closing of the 2021 registry census.',
    status: 'ARCHIVED',
    start: '2021-12-20T08:00:00.000Z',
    createdBy: 0,
    archiveMin: 1440,
    cast: [
      { country: 'Ghana', n: 1 },
      { country: 'Nigeria', n: 1 },
      { country: 'United States', n: 0 },
      { country: 'United Kingdom', n: 3 },
      { country: 'Ethiopia', n: 0 },
    ],
    msgs: [
      { by: 0, min: 0, body: 'Registry Closing 2021. The annual census is closed. Every country has confirmed its register totals and the digital copy of the national ledgers.' },
      { by: 0, min: 60, body: 'Addendum: the archive deposit for 2021 must include the year-end directive and the minutes of the closing assemblies.' },
      { by: 0, min: 150, body: 'A standing instruction for the new year: any correction to the register requires a dated entry and the initials of the country initiator.' },
      { by: 0, min: 300, body: 'The registry is closed for the season. The directive is archived and the chamber is closed.' },
    ],
  },
  {
    key: 'compass-and-code-2021',
    type: 'BROTHERHOOD',
    title: 'The Compass and the Code - Study 2021',
    description: 'Joint study of the compass emblem and the register code.',
    start: '2021-02-22T10:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'India', n: 1 },
      { country: 'Malaysia', n: 0 },
      { country: 'Singapore', n: 0 },
      { country: 'Japan', n: 1 },
      { country: 'South Korea', n: 0 },
      { country: 'United Arab Emirates', n: 1 },
      { country: 'Kuwait', n: 0 },
    ],
    msgs: [
      { by: 0, min: 0, body: 'The study opens on the compass emblem of the order and the code of the register that governs its records. The two are read as one.' },
      { by: 1, min: 9, body: 'The compass orients; the code records. A brother who trusts the first but ignores the second walks without a map.' },
      { by: 2, min: 17, body: 'Singapore reads the emblem as a reminder that direction is earned daily, not granted once at initiation.' },
      { by: 3, min: 29, body: 'Tokyo notes that the corners of the compass in the Codex are four duties: record, review, preserve, and transmit.' },
      { by: 4, min: 41, body: 'Seoul agrees and observes that the code makes those same duties legible in the commonplace matters of the register.' },
      { by: 5, min: 55, body: 'Dubai: then a well-kept ledger is a compass for the order as a whole, not a formality between two covers.' },
      { by: 6, min: 70, body: 'Kuwait seconds the reading and will circulate the study notes to its circle.' },
      { by: 0, min: 86, body: 'The reading is registered. The compass and the code are one instrument; the study notes will be filed with the 2021 record.' },
    ],
  },

  // ---------------------------------------------------------------- 2022
  {
    key: 'minerval-studies-2022',
    type: 'PRIVATE',
    start: '2022-03-01T09:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'Nigeria', n: 0 },
      { country: 'Kenya', n: 0 },
    ],
    msgs: [
      { by: 0, min: 2, body: 'Brother, the Minerval study group has finished the first curriculum and the aspirants are ready for the review exercises.' },
      { by: 1, min: 16, body: 'That is good progress. Run the written review first and the oral face-to-face second; the gap between the two tells its own story.' },
      { by: 0, min: 31, body: 'The written review is set for the twenty-first. I will send the marked papers to you for the second opinion before the oral.' },
      { by: 1, min: 48, body: "Agreed. Keep the marks recorded in the register under the member's journey entries and leave the interpretive notes in the file." },
      { by: 0, min: 66, body: 'Everything is recorded in that manner. We will hold the oral in the first week of April and report the outcomes on time.' },
    ],
  },
  {
    key: 'council-room-2022',
    type: 'BROTHERHOOD',
    title: 'Council Room - Mid-Year Word',
    description: 'Mid-year word from the Gulf and Levant region.',
    start: '2022-07-08T17:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'United Arab Emirates', n: 0 },
      { country: 'Qatar', n: 0 },
      { country: 'Saudi Arabia', n: 0 },
      { country: 'Kuwait', n: 0 },
      { country: 'Egypt', n: 1 },
      { country: 'Morocco', n: 0 },
    ],
    msgs: [
      { by: 0, min: 0, body: 'Brothers, the word for the middle of the year: the first six months are recorded steadily in every country here, and the register reflects it.' },
      { by: 1, min: 9, body: 'Doha will hold its local gathering at the end of the month and will add the minutes to the archive as usual.' },
      { by: 2, min: 19, body: 'Riyadh reports its numbers reconciled and the custody rules observed; no corrections were required.' },
      { by: 3, min: 30, body: 'Kuwait City confirms the same and notes the reading circle has completed the first passage of the year.' },
      { by: 4, min: 42, body: 'Cairo has resumed the translation work interrupted last season and will forward the first drafts in August.' },
      { by: 5, min: 58, body: 'Casablanca records its attendance for the mid-year and will deposit the local photographs and minutes with the archive.' },
      { by: 0, min: 74, body: 'The mid-year word is recorded. Carry the same care into the months ahead.' },
    ],
  },
  {
    key: 'orion-assembly-2022',
    type: 'ASSEMBLY',
    title: 'Orion Assembly - Annual Canvass',
    description: 'Annual numbers canvass for the Orion Assembly.',
    start: '2022-10-02T14:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'Germany', n: 0 },
      { country: 'Germany', n: 1 },
      { country: 'Austria', n: 0 },
      { country: 'Switzerland', n: 0 },
      { country: 'Netherlands', n: 0 },
      { country: 'Belgium', n: 0 },
      { country: 'France', n: 0 },
      { country: 'Italy', n: 0 },
    ],
    auditAdds: [{ slot: 7, min: 70 }],
    msgs: [
      { by: 0, min: 0, body: 'The Orion assembly is open. The canvass asks for the years numbers by country and any item that requires a correction in the register.' },
      { by: 1, min: 8, body: 'The year totals for Germany are complete and match the quarterly returns exactly.' },
      { by: 2, min: 16, body: 'Austria reports the same; two archives were transferred to the central list and each is cataloged.' },
      { by: 3, min: 27, body: 'Switzerland confirms its totals and draws attention to a printing variance in the 2022 booklet that will be corrected post facto.' },
      { by: 4, min: 39, body: 'The Netherlands accepts the corrected booklet for publication and will re-run the pages in the next batch.' },
      { by: 5, min: 52, body: "Belgium's numbers are complete and the deposit for the year is scheduled before the closing." },
      { by: 6, min: 66, body: 'France confirms and will file the corrected pages with the archival copy once they are bound.' },
      { by: 7, min: 80, body: 'Italy joins the canvass and seconds the record; the correction items remain annex material for the year-end report.' },
      { by: 0, min: 96, body: 'The canvass closes with every country accounted for. The corrections are recorded as annex items and the minutes will follow.' },
    ],
  },
  {
    key: 'inner-chamber-2022-note',
    type: 'RESTRICTED',
    title: 'Inner Chamber - Protocol Note',
    description: 'Protocol on precedence in official channels.',
    status: 'ARCHIVED',
    start: '2022-04-25T18:00:00.000Z',
    createdBy: 0,
    archiveMin: 80,
    cast: [
      { country: 'United States', n: 0 },
      { country: 'United Kingdom', n: 3 },
      { country: 'Ghana', n: 1 },
      { country: 'Nigeria', n: 1 },
      { country: 'Japan', n: 0 },
    ],
    msgs: [
      { by: 0, min: 0, body: 'A protocol note: in official channels the order of speaking follows the register date of full membership, not the country alphabet.' },
      { by: 1, min: 13, body: 'Confirmed. The oldest membership speaks first in matters of precedence; the head of the meeting yields only at the opening and the closing.' },
      { by: 2, min: 27, body: 'Ghana will record this in the handbook alongside the custody rules so the two are read together.' },
      { by: 3, min: 41, body: 'Lagos seconds the note and asks that foreign-language minutes carry the same precedence statement to avoid ambiguity.' },
      { by: 4, min: 58, body: 'Tokyo will carry the note in the Japanese translation of the handbook when the next printing is ordered.' },
      { by: 0, min: 76, body: 'The note is recorded and this chamber is closed.' },
    ],
  },
  {
    key: 'intercountry-visit-2022',
    type: 'PRIVATE',
    start: '2022-11-14T10:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'Brazil', n: 0 },
      { country: 'Senegal', n: 0 },
    ],
    msgs: [
      { by: 0, min: 3, body: 'Brother, the plans for the visit in December are taking shape. I would ask for the itinerary you prefer and the size of the party.' },
      { by: 1, min: 17, body: 'A party of four will arrive on the morning of the fourteenth and leave on the eighteenth. We ask only for the register visit and the library tour.' },
      { by: 0, min: 32, body: 'Both are arranged. The register visit is set for the afternoon of the fifteenth with the initiator present.' },
      { by: 1, min: 49, body: 'We will bring the gift of the printed Codex passage for the library and a signed copy for the country record.' },
      { by: 0, min: 68, body: 'That is generous and it will be cataloged with the donor noted. I will confirm the details in writing before the month ends.' },
    ],
  },
  {
    key: 'archive-review-2022',
    type: 'BROTHERHOOD',
    title: 'Archive Review - 2022',
    description: 'Annual review of the ledgers and digital copies.',
    start: '2022-05-23T10:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'Ghana', n: 0 },
      { country: 'United Kingdom', n: 3 },
      { country: 'United States', n: 5 },
      { country: 'Germany', n: 0 },
      { country: 'Australia', n: 0 },
    ],
    msgs: [
      { by: 0, min: 0, body: 'The 2022 archive review is under way. We examine the ledgers and the digital copies for completeness and legibility.' },
      { by: 1, min: 14, body: 'The central list is complete through the end of 2021; the folio counts match the register totals country by country.' },
      { by: 2, min: 31, body: 'The States volumes are reconciled; two page scans from 2019 were re-shot and replaced with a dated note of the change.' },
      { by: 3, min: 47, body: 'Germany re-checked the oldest bindings at full resolution; no further work is required this year.' },
      { by: 4, min: 64, body: 'Australia reports the deposit schedule satisfied and the access log maintained in the usual form.' },
      { by: 0, min: 82, body: 'The archive review for 2022 is closed with no open items. The findings are annexed to the minutes.' },
    ],
  },

  // ---------------------------------------------------------------- 2023
  {
    key: 'archive-review-2023',
    type: 'BROTHERHOOD',
    title: 'Archive Review - 2023',
    description: 'Annual review of the register and its digital copies.',
    start: '2023-05-22T10:00:00.000Z',
    createdBy: 0,
    unreadBy: 1,
    unreadAfter: 5,
    cast: [
      { country: 'Ghana', n: 0 },
      { country: 'United Kingdom', n: 3 },
      { country: 'United States', n: 5 },
      { country: 'Germany', n: 0 },
    ],
    msgs: [
      { by: 0, min: 0, body: 'The 2023 archive review is opened. The register and its digital copies are examined for completeness, legibility, and internal consistency.' },
      { by: 1, min: 16, body: 'The central list is complete through the final quarter of 2022. Folio counts match the register totals for every country on the list.' },
      { by: 2, min: 34, body: 'The States examination is finished against the national returns. All entries are legible; three 2019 scans are noted for re-shot replacement.' },
      { by: 3, min: 52, body: 'Germany compared the digital volume to the printed binding page by page. No missing folios; the pagination agreed throughout.' },
      { by: 0, min: 68, body: 'Replacement scans for the three noted items are authorized and will carry a dated notation in the access log.' },
      { by: 3, min: 90, body: 'Berlin has completed the re-shoots and placed the new scans, each with the required dated notation. The review declares the register sealed for the year.' },
    ],
  },
  {
    key: 'register-seal-2023',
    type: 'PRIVATE',
    start: '2023-02-13T16:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'United States', n: 0 },
      { country: 'Canada', n: 0 },
    ],
    msgs: [
      { by: 0, min: 3, body: 'Brother, the design for the digital register seal is on its final proof. I would have the wax device mirrored in the header of every official page.' },
      { by: 1, min: 16, body: 'That is well done. Withhold the display on private records; the seal belongs to official and register documents only.' },
      { by: 0, min: 31, body: 'Agreed. The seal renders in both the colored and the monochrome forms, and the file is archived with the design notes.' },
      { by: 1, min: 47, body: 'Register the design with a dated entry and note the approval in the official channel. The visual identity is now part of the record.' },
    ],
  },
  {
    key: 'phoenix-duties-2023',
    type: 'ASSEMBLY',
    title: 'Phoenix Assembly - Ceremonial Duties',
    description: 'Assignment of ceremonial duties for the autumn ceremony.',
    start: '2023-08-20T15:00:00.000Z',
    createdBy: 1,
    unreadBy: 3,
    unreadAfter: 6,
    cast: [
      { country: 'Ghana', n: 0 },
      { country: 'Ghana', n: 1 },
      { country: 'Ghana', n: 2 },
      { country: 'Nigeria', n: 0 },
      { country: 'Nigeria', n: 1 },
    ],
    msgs: [
      { by: 1, min: 0, body: 'The ceremony of the autumn is fixed for the eleventh of November in Accra. The assembly assigns the ceremonial duties by cell.' },
      { by: 0, min: 6, body: 'Phoenix cell accepts the preparation of the materials and the seating order; the list will be confirmed one month ahead.' },
      { by: 2, min: 14, body: 'Kumasi takes the reading of the passages and will select the readers after a rehearsal on the last Sunday of October.' },
      { by: 3, min: 24, body: 'Lagos accepts the registry desk. We will manage the roll and the signing of the register for the ceremony.' },
      { by: 4, min: 36, body: 'Enugu will arrange the refreshments and the hospitality for the visiting members from outside the country.' },
      { by: 1, min: 52, body: 'The assignments are recorded. Materials, readings, registry, and hospitality are each in trusted hands.' },
      { by: 0, min: 66, body: 'Final confirmation from Phoenix: the material list is submitted and the seat plan follows within the week.' },
    ],
  },
  {
    key: 'official-year-of-the-veil-2023',
    type: 'OFFICIAL',
    title: 'Official - Year of the Veil 2023',
    description: 'Closing of the 2023 ceremonial year.',
    start: '2023-12-18T08:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'United Arab Emirates', n: 0 },
      { country: 'United States', n: 0 },
      { country: 'Ghana', n: 1 },
      { country: 'United Kingdom', n: 3 },
      { country: 'Japan', n: 0 },
    ],
    msgs: [
      { by: 0, min: 0, body: 'Closing Year of the Veil 2023. The register is closed on schedule and the years numbers have been confirmed by every country in the assembly.' },
      { by: 0, min: 60, body: 'Annex: the preservation review for 2023 is complete; recommended handling rules for the oldest bindings are now in the handbook.' },
      { by: 0, min: 150, body: 'Addendum: countries that hold printed duplicates of the 2021 annual are asked to return them once the digital copy is verified.' },
      { by: 0, min: 300, body: 'The year is closed with gratitude. May the light hold steady through the winter.' },
    ],
  },
  {
    key: 'scribe-protocol-2023',
    type: 'RESTRICTED',
    title: 'Scribe Protocol - 2023 Revision',
    description: 'Revision of the scribe protocol for minutes.',
    start: '2023-04-10T09:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'United Kingdom', n: 3 },
      { country: 'Germany', n: 0 },
      { country: 'Nigeria', n: 3 },
      { country: 'United States', n: 5 },
    ],
    msgs: [
      { by: 0, min: 0, body: 'The scribe protocol is revised for 2023. The main change: minutes are to carry the time of the meeting and the time of the deposit.' },
      { by: 1, min: 12, body: 'A helpful change for the archive, since the register compares the two timestamps to confirm nothing was back-filed.' },
      { by: 2, min: 25, body: 'We will add the same pair of times to the minutes of the Nigerian meetings from the next sitting onward.' },
      { by: 3, min: 39, body: 'And we will note in the header that minutes are records, not proposals; the distinction belongs to the first line of every page.' },
      { by: 0, min: 55, body: 'The revision is adopted and circulated. All minutes dated before the adoption stand as they are; the new form begins at the next meeting.' },
    ],
  },
  {
    key: 'visiting-representative-2023',
    type: 'PRIVATE',
    start: '2023-10-31T10:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'India', n: 0 },
      { country: 'United Arab Emirates', n: 1 },
    ],
    msgs: [
      { by: 0, min: 4, body: 'Brother, the visiting representative will arrive on the twenty-eighth of November. I would coordinate the schedule so the register visit comes first.' },
      { by: 1, min: 19, body: 'The register visit is set for the morning of the twenty-ninth. The library tour will follow and the evening is left free for the local meeting.' },
      { by: 0, min: 35, body: 'That arrangement suits. Please send the representative travel details and we will confirm the hospitality for the evening.' },
      { by: 1, min: 52, body: 'Details are forwarded. The printed directory is prepared and the two books for signature are laid out at the desk.' },
      { by: 0, min: 70, body: 'Everything is in order. I will confirm the final points in writing before the visit.' },
    ],
  },

  // ---------------------------------------------------------------- 2024
  {
    key: 'archives-access-2024',
    type: 'BROTHERHOOD',
    title: 'The Archives - Access Protocol',
    description: 'Adoption of the archive access tiers.',
    start: '2024-01-29T10:00:00.000Z',
    createdBy: 0,
    unreadBy: 4,
    unreadAfter: 5,
    auditAdds: [{ slot: 4, min: 40 }],
    cast: [
      { country: 'United States', n: 0 },
      { country: 'Ghana', n: 0 },
      { country: 'Germany', n: 0 },
      { country: 'Australia', n: 0 },
      { country: 'France', n: 1 },
    ],
    msgs: [
      { by: 0, min: 0, body: 'The access protocol for the archives is published. Requests are graded in three tiers: public record, member research, and restricted custody.' },
      { by: 1, min: 12, body: 'Ghana aligns the local rule: the restricted tier requires the written motion of the inner chamber and is never opened by email.' },
      { by: 2, min: 26, body: 'German practice matches the tiers and adds that researcher notes are deposited alongside the request once the work is done.' },
      { by: 3, min: 41, body: 'Australia will hold the request ledger and a dated copy of every approval for the audit trail.' },
      { by: 4, min: 57, body: 'France seconds the protocol and will translate the request form into French and Arabic for the two regions that need them.' },
      { by: 0, min: 74, body: 'The protocol is adopted and takes effect on the first of February. Forms and ledgers are in place everywhere represented here.' },
    ],
  },
  {
    key: 'stella-assembly-2024',
    type: 'ASSEMBLY',
    title: 'Stella Assembly - Meeting Record',
    description: 'First meeting record of the Stella Assembly.',
    start: '2024-03-17T15:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'Italy', n: 0 },
      { country: 'Spain', n: 0 },
      { country: 'Portugal', n: 0 },
      { country: 'France', n: 0 },
      { country: 'Belgium', n: 0 },
    ],
    msgs: [
      { by: 0, min: 0, body: 'The Stella assembly records its first meeting of the year. The standing items are the welfare register and the local reading series.' },
      { by: 1, min: 8, body: 'Spain confirms the welfare visit schedule for the first quarter and will report each visit in the minutes.' },
      { by: 2, min: 19, body: 'Portugal will hold the reading series in May and requests the second passage of the Codex from the central list.' },
      { by: 3, min: 34, body: 'France will prepare the French edition of the passage and the facing commentary for the series.' },
      { by: 4, min: 49, body: 'Belgium accepts responsibility for the printed programs and asks for the attendance numbers by the first of May.' },
      { by: 0, min: 63, body: 'The minutes of the meeting will be deposited with the archive and the items are recorded as agreed.' },
    ],
  },
  {
    key: 'paleographic-record-2024',
    type: 'PRIVATE',
    start: '2024-06-05T10:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'France', n: 0 },
      { country: 'Spain', n: 0 },
    ],
    msgs: [
      { by: 0, min: 3, body: 'Brother, the hand-scanned ledger from the southern lodge has been returned to good order and I am cataloging its provenance.' },
      { by: 1, min: 16, body: 'Record the chain of custody page by page: who scanned it, when, and where the original now rests. Nothing less will satisfy the archive.' },
      { by: 0, min: 32, body: 'The chain is written and each page carries the storage key in the margin as the protocol requires.' },
      { by: 1, min: 49, body: 'Excellent. Deposit the catalog card and keep the digital copy in the tier-two store; the original remains with its lodge.' },
      { by: 0, min: 68, body: 'Deposited and sealed. The record is complete and I will note the completion in the access ledger.' },
    ],
  },
  {
    key: 'inner-chamber-2024-review',
    type: 'RESTRICTED',
    title: 'Inner Chamber - Quarter Review',
    description: 'Quarterly review of register integrity.',
    start: '2024-09-23T10:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'Ghana', n: 1 },
      { country: 'Nigeria', n: 1 },
      { country: 'United States', n: 0 },
      { country: 'United Kingdom', n: 3 },
      { country: 'Ethiopia', n: 0 },
    ],
    msgs: [
      { by: 0, min: 0, body: 'The quarterly review is opened. We examine the register integrity, the custody rules, and the state of the approvals pending the next cycle.' },
      { by: 1, min: 14, body: 'The register totals were verified against the national returns at the start of the month; no discrepancies were found.' },
      { by: 2, min: 30, body: 'Custody rules were observed in all regions; the restricted stores were checked and the seals intact.' },
      { by: 3, min: 44, body: 'The approvals recorded for the coming cycle remain within the inner chamber and will be executed only after the formal review.' },
      { by: 4, min: 60, body: 'No inventory is outstanding and no record requires retroactive correction. The review finds the quarter in order.' },
      { by: 0, min: 76, body: 'The quarterly review is closed and its findings are sealed in the archive until the year-end assembly.' },
    ],
  },
  {
    key: 'official-directive-2024-02',
    type: 'OFFICIAL',
    title: 'Official - Directive 2024-02: Archive Conservation',
    description: 'Conservation directive for paper holdings.',
    start: '2024-11-11T08:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'Ghana', n: 0 },
      { country: 'United Kingdom', n: 3 },
      { country: 'United States', n: 0 },
    ],
    msgs: [
      { by: 0, min: 0, body: 'Directive 2024-02: Archive Conservation. Paper holdings will be transferred to archival plates where recommended, with the catalog number preserved at every step.' },
      { by: 0, min: 120, body: 'Implementation: the transfer is scheduled per country and the progress is reported at the regular archive review. Conservation photos precede any repair.' },
      { by: 0, min: 300, body: 'Reminder: after transfer, verify the folio count against the register before the box is sealed, and mark the completion in the access ledger.' },
      { by: 0, min: 480, body: 'The directive stands until the 2025 registry review, when its effect will be assessed.' },
    ],
  },
  {
    key: 'great-work-2024',
    type: 'BROTHERHOOD',
    title: 'Meditation on the Great Work - 2024',
    description: 'Mid-year meditation and shared reflection.',
    start: '2024-07-15T15:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'India', n: 0 },
      { country: 'Japan', n: 0 },
      { country: 'Brazil', n: 0 },
      { country: 'South Africa', n: 0 },
      { country: 'Singapore', n: 0 },
      { country: 'Malaysia', n: 0 },
    ],
    msgs: [
      { by: 0, min: 0, body: 'A meditation on the years work as it stands in the middle of its course. Each of us carries a small part of a single larger record.' },
      { by: 1, min: 12, body: 'The register grows by careful, unremarkable entries. It is the unremarkable constancy that gives the work its weight.' },
      { by: 2, min: 26, body: 'In the south the same passage is read: no entry is too small to be written, none too large to be verified.' },
      { by: 3, min: 40, body: 'We measure ourselves against the record, not the record against us. That keeps the discipline honest.' },
      { by: 4, min: 55, body: 'Singapore observes that the oldest books teach this lesson best: they show patience on every page but demand none in return.' },
      { by: 5, min: 71, body: 'May we carry the same patience to the closing of the year, and may the register bear witness to a steady hand.' },
      { by: 0, min: 86, body: 'The meditation is recorded and the reading is placed with the years notes.' },
    ],
  },

  // ---------------------------------------------------------------- 2025
  {
    key: 'registry-continuity-2025',
    type: 'BROTHERHOOD',
    title: 'Registry Continuity - 2025',
    description: 'Continuity plan for journeys still in preparation.',
    start: '2025-01-13T10:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'Ghana', n: 1 },
      { country: 'Nigeria', n: 1 },
      { country: 'United Arab Emirates', n: 0 },
      { country: 'United States', n: 0 },
      { country: 'United Kingdom', n: 3 },
      { country: 'Japan', n: 0 },
    ],
    msgs: [
      { by: 0, min: 0, body: 'The continuity plan for 2025 is before the chamber. Journeys that began in earlier seasons and remain in preparation will be reviewed in the coming cycle.' },
      { by: 1, min: 11, body: 'The register keeps a separate line for each stage of the journey, so no file is judged late and no file is left unintentionally.' },
      { by: 2, min: 23, body: 'Dubai confirms the preparation records are intact and that the formal approvals of the coming season will follow the written standard.' },
      { by: 3, min: 36, body: 'The States will complete its review of the preparation files before the spring assembly and reports nothing overdue.' },
      { by: 4, min: 49, body: 'London will hold the preparation records in the restricted store and will produce them only to those named in the custody rule.' },
      { by: 5, min: 62, body: 'Tokyo confirms the same custody and will forward the season schedule at the start of the review window.' },
      { by: 0, min: 78, body: 'The continuity plan is recorded. Every journey in preparation remains fully legible in the register.' },
    ],
  },
  {
    key: 'apex-assembly-2025',
    type: 'ASSEMBLY',
    title: 'Apex Assembly - Planning',
    description: 'Planning for the year assembly.',
    start: '2025-02-24T15:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'United States', n: 0 },
      { country: 'United States', n: 3 },
      { country: 'Canada', n: 1 },
      { country: 'Australia', n: 0 },
      { country: 'New Zealand', n: 0 },
    ],
    msgs: [
      { by: 0, min: 0, body: 'The planning for the year assembly opens. The working agenda: the register review, the ceremonial calendar, and the welfare register.' },
      { by: 1, min: 9, body: 'The register review will be held first and will follow the same procedure as the previous years for comparability.' },
      { by: 2, min: 20, body: 'Ottawa proposes the ceremonial calendar be published at the start of the season so the countries can align their local dates.' },
      { by: 3, min: 34, body: 'Sydney seconds that and asks that the printed editions include the corrected pages from the 2022 directive.' },
      { by: 4, min: 50, body: 'Wellington will draft the welfare register section and asks for the year visit schedules by the first of April.' },
      { by: 0, min: 65, body: 'The agenda is adopted. The planning record is deposited and the assembly scheduling begins.' },
    ],
  },
  {
    key: 'west-africa-notes-2025',
    type: 'PRIVATE',
    start: '2025-05-12T10:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'Ghana', n: 0 },
      { country: 'Nigeria', n: 0 },
    ],
    msgs: [
      { by: 0, min: 3, body: 'Brother, the coordination for the autumn ceremonies across the region is set. The materials will be printed in Accra and dispatched to Lagos by early October.' },
      { by: 1, min: 18, body: 'That timing works for Lagos. We will confirm the reception and hold the register desk ready for the day.' },
      { by: 0, min: 34, body: 'The subregion is well prepared. The aspirants in preparation across the two countries are following the same curriculum, which simplifies the reports.' },
      { by: 1, min: 53, body: 'Indeed. Where the curriculum is shared the records are simpler to verify, and the review in the autumn should close cleanly.' },
      { by: 0, min: 72, body: 'I will send the final dispatch list by the end of the month so nothing is left to the last week.' },
    ],
  },
  {
    key: 'inner-chamber-membership-review-2025',
    type: 'RESTRICTED',
    title: 'Inner Chamber - Membership Review 2025',
    description: 'Annual review of the journey records.',
    start: '2025-08-04T10:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'United States', n: 0 },
      { country: 'United Kingdom', n: 3 },
      { country: 'Ghana', n: 1 },
      { country: 'Nigeria', n: 1 },
      { country: 'Japan', n: 0 },
    ],
    msgs: [
      { by: 0, min: 0, body: 'The membership review for 2025 is opened. The register journey records are examined for completeness ahead of the coming approvals cycle.' },
      { by: 1, min: 13, body: 'The preparation files are complete and legible; each stage carries a dated entry under the written standard.' },
      { by: 2, min: 27, body: 'The records for the region in preparation are verified against the country returns and match in every name.' },
      { by: 3, min: 42, body: 'Lagos reports the same verification and notes no file requires a correction before the review closes.' },
      { by: 4, min: 58, body: 'Tokyo confirms its files are sealed in the restricted store pending the formal review of the new season.' },
      { by: 0, min: 76, body: 'The review finds the register in order. The approvals of the coming cycle will be executed only after this chamber formal seal.' },
    ],
  },
  {
    key: 'official-year-end-2025',
    type: 'OFFICIAL',
    title: 'Official - Year-End Directive 2025',
    description: 'Year-end closing directive for 2025.',
    start: '2025-12-15T08:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'United Arab Emirates', n: 0 },
      { country: 'Ghana', n: 1 },
      { country: 'United States', n: 0 },
      { country: 'United Kingdom', n: 3 },
    ],
    msgs: [
      { by: 0, min: 0, body: 'Year-End Directive 2025. The register closes on schedule and the annual totals have been confirmed country by country.' },
      { by: 0, min: 90, body: 'Addendum: the coming season journey records - those begun in earlier years and still in preparation - remain in the restricted store until the formal approvals.' },
      { by: 0, min: 240, body: 'Reminder: printed duplicates and conservation records are to be returned or deposited by the end of January.' },
      { by: 0, min: 420, body: 'The year closes with gratitude and with the record intact. May the light hold.' },
    ],
  },
  {
    key: 'years-end-2025',
    type: 'BROTHERHOOD',
    title: "The Veil at Year's End - 2025",
    description: 'Year-end word of gratitude across the order.',
    start: '2025-12-29T17:00:00.000Z',
    createdBy: 0,
    cast: [
      { country: 'Ghana', n: 0 },
      { country: 'United Kingdom', n: 3 },
      { country: 'United States', n: 5 },
      { country: 'Germany', n: 0 },
      { country: 'Japan', n: 0 },
      { country: 'Brazil', n: 0 },
      { country: 'Nigeria', n: 0 },
      { country: 'India', n: 0 },
    ],
    msgs: [
      { by: 0, min: 0, body: 'Brothers, the year draws to a close and the register closes with it. Before the new season begins, let us record a word of thanks for the work.' },
      { by: 1, min: 10, body: 'London thanks the archivists especially; the review of the past season was the cleanest in memory.' },
      { by: 2, min: 22, body: 'The States acknowledges every country that kept its returns on time; the register depends on that simple punctuality.' },
      { by: 3, min: 35, body: 'Germany notes the conservation work is now ahead of schedule, a first since the program began.' },
      { by: 4, min: 48, body: 'Tokyo thanks the reading circles; the study has carried the year reflection in every region.' },
      { by: 5, min: 62, body: 'Rio echoes the thanks and confirms the southern deposits are complete for the year.' },
      { by: 6, min: 76, body: 'Lagos gives thanks for the shared curriculum that kept the records of the region uniform through the year.' },
      { by: 7, min: 90, body: 'Mumbai closes the circle: the same patience that founded the register is what keeps it true. The light holds.' },
      { by: 0, min: 108, body: 'The word is recorded and the year is closed in gratitude. We meet again in the new season.' },
    ],
  },
];

// ------------------------------------------------------------------
// Participant resolution
// ------------------------------------------------------------------

export interface ResolvedParticipant {
  memberId: string;
  fullName: string;
  firstName: string;
  joinedMinutes: number;
  role: string;
}

export interface ResolvedSeed {
  seed: SeedConv;
  conversationId: string;
  createdBy: string;
  participants: ResolvedParticipant[];
  messages: { id: string; senderId: string; createdAt: Date }[];
  startAt: Date;
  endAt: Date;
}

export function conversationIdFor(seed: SeedConv): string {
  return `${CONV_ID_PREFIX}-${seed.key}`;
}

export function fill(raw: string, participants: ResolvedParticipant[]): string {
  return raw.replace(/\{(\d+)f?\}/g, (match, idx: string) => {
    const participant = participants[Number(idx)];
    if (!participant) return match;
    return match.endsWith('f}') ? participant.firstName : participant.fullName;
  });
}

/** Resolves cast refs against the live registry (ACTIVE members only). */
export async function resolveCast(
  cast: CastRef[],
  client = prisma,
): Promise<ResolvedParticipant[]> {
  const rosterCache = new Map<string, string[]>();
  const resolved: ResolvedParticipant[] = [];

  for (const ref of cast) {
    if (!rosterCache.has(ref.country)) {
      const rows = await client.member.findMany({
        where: { country: ref.country, status: 'ACTIVE', NOT: { memberId: EXCLUDED_MEMBER_ID } },
        select: { memberId: true },
        orderBy: { memberId: 'asc' },
      });
      rosterCache.set(ref.country, rows.map((row) => row.memberId));
    }
    const roster = rosterCache.get(ref.country)!;
    const memberId = roster[ref.n];
    if (!memberId) {
      throw new Error(
        `[chamber] ${ref.country} only has ${roster.length} active members; cannot resolve index ${ref.n}`,
      );
    }
    const member = await client.member.findUnique({
      where: { memberId },
      select: { memberId: true, fullName: true, firstName: true },
    });
    if (!member) {
      throw new Error(`[chamber] resolved member not found: ${memberId}`);
    }
    resolved.push({
      memberId: member.memberId,
      fullName: member.fullName,
      firstName: member.firstName,
      joinedMinutes: 0,
      role: 'MEMBER',
    });
  }
  return resolved;
}

/** Full resolution of a seed: participants, timestamps, message ids. */
export async function resolveSeed(seed: SeedConv, client = prisma): Promise<ResolvedSeed> {
  const participants = await resolveCast(seed.cast, client);

  // Guard sanity rules before touching the database.
  const startAt = new Date(seed.start);
  if (seed.msgs.length === 0) throw new Error(`[chamber] ${seed.key} has no messages`);
  for (const [index, msg] of seed.msgs.entries()) {
    if (msg.by < 0 || msg.by >= participants.length) {
      throw new Error(`[chamber] ${seed.key} message ${index} references invalid slot ${msg.by}`);
    }
    if (msg.min < 0) throw new Error(`[chamber] ${seed.key} message ${index} has a negative offset`);
    if (index > 0 && msg.min < seed.msgs[index - 1].min) {
      throw new Error(`[chamber] ${seed.key} message offsets must be non-decreasing (${index})`);
    }
    if (msg.replyTo !== undefined && (msg.replyTo < 0 || msg.replyTo >= index)) {
      throw new Error(`[chamber] ${seed.key} message ${index} has an invalid replyTo`);
    }
  }
  if (seed.createdBy < 0 || seed.createdBy >= participants.length) {
    throw new Error(`[chamber] ${seed.key} invalid createdBy slot`);
  }
  if (seed.unreadBy !== undefined) {
    if (seed.unreadBy < 0 || seed.unreadBy >= participants.length) {
      throw new Error(`[chamber] ${seed.key} invalid unreadBy slot`);
    }
    if (
      seed.unreadAfter === undefined ||
      seed.unreadAfter <= 0 ||
      seed.unreadAfter >= seed.msgs.length
    ) {
      throw new Error(`[chamber] ${seed.key} invalid unreadAfter`);
    }
  }
  for (const add of seed.auditAdds ?? []) {
    if (add.slot < 0 || add.slot >= participants.length) {
      throw new Error(`[chamber] ${seed.key} invalid auditAdds slot`);
    }
  }

  // Assign join times for members added after creation.
  const joins = new Map<number, number>();
  for (const add of seed.auditAdds ?? []) {
    joins.set(add.slot, add.min);
  }
  participants.forEach((participant, slot) => {
    participant.joinedMinutes = joins.get(slot) ?? 0;
  });

  const messageTimes = seed.msgs.map((msg) => new Date(startAt.getTime() + msg.min * 60_000));
  const endAt =
    seed.status === 'ARCHIVED' && seed.archiveMin !== undefined
      ? new Date(startAt.getTime() + seed.archiveMin * 60_000)
      : messageTimes[messageTimes.length - 1];

  return {
    seed,
    conversationId: conversationIdFor(seed),
    createdBy: participants[seed.createdBy].memberId,
    participants,
    messages: seed.msgs.map((msg, index) => ({
      id: `${conversationIdFor(seed)}-m${String(index).padStart(2, '0')}`,
      senderId: participants[msg.by].memberId,
      createdAt: messageTimes[index],
    })),
    startAt,
    endAt,
  };
}

// ------------------------------------------------------------------
// Writers
// ------------------------------------------------------------------

async function ensureConversation(resolved: ResolvedSeed): Promise<boolean> {
  const existing = await prisma.conversation.findUnique({
    where: { id: resolved.conversationId },
    select: { id: true },
  });
  if (existing) return false;

  const { seed } = resolved;
  const isPrivate = seed.type === 'PRIVATE';
  const other = isPrivate ? resolved.participants.find((p) => p.memberId !== resolved.createdBy) : undefined;
  const title =
    seed.title ??
    (isPrivate && other ? other.fullName : undefined) ??
    seed.key;
  const description =
    seed.description ??
    (isPrivate && other ? `Private correspondence with ${other.fullName}.` : undefined);

  await prisma.$transaction(async (tx) => {
    const conversation = await tx.conversation.create({
      data: {
        id: resolved.conversationId,
        type: seed.type,
        title,
        description,
        status: seed.status ?? 'ACTIVE',
        createdBy: resolved.createdBy,
        createdAt: resolved.startAt,
        updatedAt: resolved.endAt,
        members: {
          create: resolved.participants.map((participant, slot) => ({
            memberId: participant.memberId,
            role:
              slot === seed.createdBy
                ? 'OWNER'
                : seed.adminSlots?.includes(slot)
                  ? 'ADMIN'
                  : 'MEMBER',
            joinedAt: new Date(resolved.startAt.getTime() + participant.joinedMinutes * 60_000),
          })),
        },
      },
      select: { id: true },
    });

    await tx.conversationAudit.create({
      data: {
        conversationId: conversation.id,
        actorMemberId: resolved.createdBy,
        event: 'CONVERSATION_CREATED',
        detail: `${seed.type} · ${resolved.participants.length} members`,
        createdAt: resolved.startAt,
      },
    });

    for (const add of seed.auditAdds ?? []) {
      const addedAt = new Date(resolved.startAt.getTime() + add.min * 60_000);
      await tx.conversationAudit.create({
        data: {
          conversationId: conversation.id,
          actorMemberId: resolved.createdBy,
          event: 'MEMBER_ADDED',
          detail: resolved.participants[add.slot].memberId,
          createdAt: addedAt,
        },
      });
    }
  });

  // Messages and read receipts (created after the conversation so the
  // createdBy/member relations are present).
  await prisma.$transaction(async (tx) => {
    for (let index = 0; index < seed.msgs.length; index += 1) {
      const msg = seed.msgs[index];
      const at = resolved.messages[index].createdAt;
      await tx.message.create({
        data: {
          id: resolved.messages[index].id,
          conversationId: resolved.conversationId,
          senderId: resolved.participants[msg.by].memberId,
          body: fill(msg.body, resolved.participants),
          type: 'TEXT',
          status: 'NORMAL',
          replyToMessageId:
            msg.replyTo !== undefined ? resolved.messages[msg.replyTo].id : null,
          createdAt: at,
          updatedAt: at,
        },
      });
    }

    // Read receipts + lastReadAt so the threads present as read.
    for (let index = 0; index < seed.msgs.length; index += 1) {
      const msg = seed.msgs[index];
      const at = resolved.messages[index].createdAt;
      for (let slot = 0; slot < resolved.participants.length; slot += 1) {
        if (slot === msg.by) continue; // no read row for own messages
        const joinedMinutes = resolved.participants[slot].joinedMinutes;
        if (msg.min < joinedMinutes) continue; // not yet a member
        if (seed.unreadBy === slot && index >= (seed.unreadAfter ?? Infinity)) continue;
        await tx.messageRead.create({
          data: {
            messageId: resolved.messages[index].id,
            memberId: resolved.participants[slot].memberId,
            readAt: new Date(at.getTime() + (2 + slot) * 60_000),
          },
        });
      }
    }

    // lastReadAt per participant.
    for (let slot = 0; slot < resolved.participants.length; slot += 1) {
      const lastSeen = seed.msgs.reduce<number>((acc, msg, index) => {
        const cutoff = seed.unreadBy === slot ? (seed.unreadAfter ?? Infinity) : Infinity;
        if (index >= cutoff) return acc;
        const participantCanSee =
          msg.min >= resolved.participants[slot].joinedMinutes || (slot === msg.by);
        if (!participantCanSee) return acc;
        return Math.max(acc, msg.min);
      }, resolved.participants[slot].joinedMinutes);
      await tx.conversationMember.update({
        where: { conversationId_memberId: { conversationId: resolved.conversationId, memberId: resolved.participants[slot].memberId } },
        data: { lastReadAt: new Date(resolved.startAt.getTime() + lastSeen * 60_000) },
      });
    }

    if (seed.status === 'ARCHIVED' && seed.archiveMin !== undefined) {
      await tx.conversationAudit.create({
        data: {
          conversationId: resolved.conversationId,
          actorMemberId: resolved.createdBy,
          event: 'CONVERSATION_ARCHIVED',
          detail: 'Season record closed',
          createdAt: new Date(resolved.startAt.getTime() + seed.archiveMin * 60_000),
        },
      });
    }
  });

  return true;
}

// ------------------------------------------------------------------
// Entry point
// ------------------------------------------------------------------

async function main(): Promise<void> {
  const before = await prisma.conversation.count();
  let created = 0;
  let skipped = 0;
  let messageCount = 0;
  let earliest = Infinity;
  let latest = -Infinity;

  for (const seed of CHAMBER_SEEDS) {
    const resolved = await resolveSeed(seed);
    earliest = Math.min(earliest, resolved.startAt.getTime());
    latest = Math.max(latest, resolved.endAt.getTime());
    if (await ensureConversation(resolved)) {
      created += 1;
      messageCount += seed.msgs.length;
      console.log(`[chamber] created ${seed.type.padEnd(11)} ${resolved.conversationId} (${seed.msgs.length} messages, ${resolved.participants.length} members)`);
    } else {
      skipped += 1;
      console.log(`[chamber] skipped    already present: ${resolved.conversationId}`);
    }
  }

  const after = await prisma.conversation.count();
  console.log('');
  console.log(`[chamber] conversations before: ${before}, after: ${after}`);
  console.log(`[chamber] created: ${created}, skipped (already present): ${skipped}`);
  console.log(`[chamber] messages written: ${messageCount}`);
  console.log(
    `[chamber] historical window: ${new Date(earliest).toISOString()} -> ${new Date(latest).toISOString()}`,
  );
  await prisma.$disconnect();
}

const isEntryPoint =
  typeof require !== 'undefined' && require.main === module;

if (isEntryPoint) {
  main()
    .catch(async (error) => {
      console.error('[chamber] failed:', error instanceof Error ? error.stack ?? error.message : error);
      await prisma.$disconnect().catch(() => undefined);
      process.exit(1);
    });
} else {
  void prisma.$disconnect();
}
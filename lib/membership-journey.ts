// ============================================================
// VEIL — Membership Journey (historical chronology)
// The canonical source for the member's recorded journey.
//
// Historical record principle:
//   • The initiation journey BEGAN in 2019.
//   • Formal approval and full membership were RECORDED in 2026.
//   • The journey preceded the recognition.
//
// These are the ONLY chronology markers authorized for display.
// Year-level only — no exact dates are ever invented. The year
// fields live on the member's database record; this module turns
// them into the reference labels every page renders.
// ============================================================

export interface MembershipJourneyReference {
  /** Year the initiation journey began. */
  journeyBegan: string;
  /** Preparation period derived from the journey start. */
  preparationPeriod: string;
  /** Review/continued journey period derived from the journey start. */
  reviewPeriod: string;
  /** Year of formal approval for full membership. */
  formalApproval: string;
  /** Year full membership was entered into the registry. */
  fullMembership: string;
  /** Recorded journey span, e.g. "2019–2026". */
  span: string;
}

const CANONICAL_JOURNEY_BEGAN = 2019;
const CANONICAL_FORMAL_APPROVAL = 2026;
const CANONICAL_FULL_MEMBERSHIP = 2026;

export function buildMembershipJourney(years: {
  journeyStartedYear?: number | null;
  formalApprovalYear?: number | null;
  fullMembershipYear?: number | null;
}): MembershipJourneyReference {
  const began = years.journeyStartedYear ?? CANONICAL_JOURNEY_BEGAN;
  const approval = years.formalApprovalYear ?? CANONICAL_FORMAL_APPROVAL;
  const full = years.fullMembershipYear ?? CANONICAL_FULL_MEMBERSHIP;
  return {
    journeyBegan: String(began),
    preparationPeriod: `${began + 1}–${began + 3}`,
    reviewPeriod: `${began + 4}–${began + 6}`,
    formalApproval: String(approval),
    fullMembership: String(full),
    span: `${began}–${full}`,
  };
}

export interface MembershipJourneyStage {
  period: string;
  title: string;
  status: string;
  description: string;
}

/**
 * The formal chronological record shown on MY MEMBERSHIP.
 * Order is fixed: the recorded initiation journey precedes the
 * formal recognition of full membership in 2026.
 */
export function buildMembershipHistoryStages(
  journey: MembershipJourneyReference,
): MembershipJourneyStage[] {
  return [
    {
      period: journey.journeyBegan,
      title: 'JOURNEY BEGAN',
      status: 'HISTORICAL',
      description:
        'First introduction to the Brotherhood and beginning of the initiation path.',
    },
    {
      period: journey.preparationPeriod,
      title: 'PERIOD OF PREPARATION',
      status: 'COMPLETED',
      description:
        'Preparation, instruction, observation, and continued development.',
    },
    {
      period: journey.reviewPeriod,
      title: 'REVIEW & CONTINUED JOURNEY',
      status: 'COMPLETED',
      description:
        'Continued participation and review of progress, conduct, commitment, and readiness.',
    },
    {
      period: journey.formalApproval,
      title: 'FORMAL APPROVAL',
      status: 'APPROVED',
      description: 'Formal approval for full Brotherhood membership.',
    },
    {
      period: journey.fullMembership,
      title: 'FULL MEMBERSHIP',
      status: 'ACTIVE',
      description:
        'Entered into the official Brotherhood registry as a full member.',
    },
    {
      period: 'CURRENT',
      title: 'ACTIVE MEMBERSHIP',
      status: 'ACTIVE',
      description: 'Current active membership.',
    },
  ];
}
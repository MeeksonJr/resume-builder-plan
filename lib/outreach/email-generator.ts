/**
 * 3-Step Cold Outreach Drip Sequence Generator
 * Generates personalized outreach emails for university recruiters, alumni, and engineering leaders.
 */

export interface OutreachSequenceInput {
  candidateName: string;
  candidateUniversity: string;
  recipientName: string;
  recipientCompany: string;
  recipientTitle: string;
  targetRole: string;
  keySkillOrProject: string;
}

export interface OutreachStep {
  stepNumber: number;
  sendDay: string;
  subject: string;
  body: string;
}

export function generateColdOutreachSequence(input: OutreachSequenceInput): OutreachStep[] {
  const {
    candidateName,
    candidateUniversity,
    recipientName,
    recipientCompany,
    recipientTitle,
    targetRole,
    keySkillOrProject,
  } = input;

  const firstName = recipientName.split(" ")[0];

  return [
    {
      stepNumber: 1,
      sendDay: "Day 1",
      subject: `Connecting with ${candidateUniversity} senior & ${targetRole} applicant`,
      body: `Hi ${firstName},

I noticed your impactful work as ${recipientTitle} at ${recipientCompany}. As a graduating computer science senior at ${candidateUniversity}, I've been following ${recipientCompany}'s recent engineering initiatives closely.

I recently architected ${keySkillOrProject}, and I am actively applying for the ${targetRole} opening on your team.

Would you be open to a brief 10-minute coffee chat sometime next week to discuss your team's upcoming technical priorities?

Best regards,

${candidateName}
${candidateUniversity}`,
    },
    {
      stepNumber: 2,
      sendDay: "Day 4",
      subject: `Quick project demo & technical background &bull; ${recipientCompany}`,
      body: `Hi ${firstName},

Following up on my note earlier this week regarding the ${targetRole} role. 

I put together a quick interactive walkthrough demonstrating how I approached ${keySkillOrProject}, incorporating automated test suites and cloud deployment pipelines.

I'd value your perspective on how ${recipientCompany}'s engineering teams evaluate early-career collegiate candidates.

Thanks again for your time,

${candidateName}`,
    },
    {
      stepNumber: 3,
      sendDay: "Day 9",
      subject: `Final follow-up &bull; ${targetRole} at ${recipientCompany}`,
      body: `Hi ${firstName},

I know your calendar is packed, so this will be my final check-in. If you or someone on your team has 10 minutes for a brief chat, I'd be delighted to connect.

Otherwise, thank you for your leadership in the Virginia tech ecosystem, and I wish you and ${recipientCompany} continued success!

Warm regards,

${candidateName}`,
    },
  ];
}

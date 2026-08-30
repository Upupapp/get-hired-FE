/**
 * Heuristic/template-based Short Bio + Services Offered suggestion
 * generator, used by profile-basic-info.component.ts's "Suggest with AI"
 * buttons.
 *
 * IMPORTANT: this deliberately follows the SAME pattern already used by the
 * "AI Job Post Assistant" on the employer side (get-hired-BE/services/
 * instantJobAdGeneratorV4.js) -- structured template composition keyed off
 * explicit inputs (job title + role-family keyword matching), NOT a call to
 * any external LLM API. No API key, network request, or new backend
 * endpoint is involved. If a genuine LLM integration is ever wanted here,
 * that's a separate, deliberate infra decision (API key + cost approval)
 * that this util does not make.
 */

export interface ProfileSuggestion {
  shortBio: string;
  servicesProvided: string;
}

interface RoleTemplate {
  keywords: string[];
  bio: (title: string) => string;
  services: (title: string) => string;
}

const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    keywords: ['developer', 'engineer', 'programmer', 'software'],
    bio: (title) =>
      `${title} with hands-on experience designing, building, and maintaining software solutions. ` +
      `Comfortable working across the stack, collaborating with cross-functional teams, and delivering ` +
      `reliable, well-tested code on schedule.`,
    services: (title) =>
      `Software development and code review, feature implementation, bug fixing, technical documentation, ` +
      `and collaboration with product/design teams as a ${title}.`
  },
  {
    keywords: ['designer', 'ux', 'ui'],
    bio: (title) =>
      `${title} focused on crafting intuitive, user-centered digital experiences. ` +
      `Skilled at translating requirements into clean, accessible interfaces and iterating based on feedback.`,
    services: (title) =>
      `UI/UX design, wireframing and prototyping, design systems, usability improvements, and visual design ` +
      `support as a ${title}.`
  },
  {
    keywords: ['writer', 'content', 'copywriter', 'editor'],
    bio: (title) =>
      `${title} experienced in producing clear, engaging content across formats. ` +
      `Comfortable adapting tone and style to different audiences and brand voices.`,
    services: (title) =>
      `Content writing and editing, copywriting, proofreading, and content strategy support as a ${title}.`
  },
  {
    keywords: ['market', 'seo', 'social media', 'brand'],
    bio: (title) =>
      `${title} with a track record of planning and executing campaigns that grow reach and engagement. ` +
      `Comfortable with both strategy and day-to-day execution.`,
    services: (title) =>
      `Campaign planning, social media management, content calendars, basic analytics reporting, and brand ` +
      `messaging support as a ${title}.`
  },
  {
    keywords: ['sales', 'account executive', 'business development'],
    bio: (title) =>
      `${title} focused on building relationships and driving revenue growth. ` +
      `Comfortable managing a pipeline end-to-end, from prospecting to closing.`,
    services: (title) =>
      `Lead generation, client relationship management, sales presentations, and pipeline/CRM upkeep as a ${title}.`
  },
  {
    keywords: ['account', 'bookkeep', 'finance', 'audit'],
    bio: (title) =>
      `${title} with strong attention to detail and a solid grasp of financial processes and reporting. ` +
      `Comfortable working with numbers, records, and compliance requirements.`,
    services: (title) =>
      `Bookkeeping, financial reporting, reconciliation, budgeting support, and compliance documentation as a ${title}.`
  },
  {
    keywords: ['teacher', 'tutor', 'instructor', 'trainer'],
    bio: (title) =>
      `${title} passionate about helping others learn and grow. ` +
      `Comfortable adapting lessons and materials to different learning styles and paces.`,
    services: (title) =>
      `Lesson planning, one-on-one or group tutoring, curriculum support, and progress tracking as a ${title}.`
  },
  {
    keywords: ['nurse', 'medical', 'healthcare', 'caregiver'],
    bio: (title) =>
      `${title} committed to providing attentive, high-quality care. ` +
      `Comfortable working in fast-paced environments while maintaining accuracy and compassion.`,
    services: (title) =>
      `Patient care support, health monitoring, documentation, and coordination with care teams as a ${title}.`
  },
  {
    keywords: ['manager', 'lead', 'supervisor', 'director'],
    bio: (title) =>
      `${title} experienced in guiding teams toward shared goals. ` +
      `Comfortable balancing day-to-day operations with longer-term planning and stakeholder communication.`,
    services: (title) =>
      `Team leadership, project planning and tracking, stakeholder communication, and process improvement as a ${title}.`
  },
  {
    keywords: ['virtual assistant', 'admin', 'assistant', 'support'],
    bio: (title) =>
      `${title} organized and reliable, comfortable handling day-to-day tasks so others can focus on what ` +
      `matters most. Quick to pick up new tools and processes.`,
    services: (title) =>
      `Calendar and inbox management, data entry, research, scheduling, and general administrative support as a ${title}.`
  },
];

const GENERIC_TEMPLATE: RoleTemplate = {
  keywords: [],
  bio: (title) =>
    `${title} bringing a strong work ethic and a genuine interest in delivering good results. ` +
    `Comfortable learning new tools and adapting to different team setups.`,
  services: (title) =>
    `Core ${title} responsibilities, plus general support wherever the team needs an extra hand.`
};

function matchTemplate(jobTitle: string): RoleTemplate {
  const normalized = jobTitle.toLowerCase();
  const found = ROLE_TEMPLATES.find(t => t.keywords.some(k => normalized.includes(k)));
  return found || GENERIC_TEMPLATE;
}

/**
 * Builds a Short Bio + Services Offered suggestion from whatever fields are
 * already filled in on the profile form. Only jobTitle is required --
 * everything else just makes the suggestion a little more specific when
 * available.
 */
export function generateProfileSuggestion(input: {
  jobTitle: string;
  jobTypeName?: string;
  jobLevelName?: string;
  workSetupName?: string;
}): ProfileSuggestion | null {
  const jobTitle = (input.jobTitle || '').trim();
  if (!jobTitle) {
    return null;
  }

  const template = matchTemplate(jobTitle);
  let bio = template.bio(jobTitle);

  const extras: string[] = [];
  if (input.jobLevelName) {
    extras.push(`${input.jobLevelName.toLowerCase()}-level`);
  }
  if (input.workSetupName) {
    extras.push(`open to ${input.workSetupName.toLowerCase()} work`);
  }
  if (extras.length) {
    bio += ` Currently ${extras.join(', ')}.`;
  }

  return {
    shortBio: bio,
    servicesProvided: template.services(jobTitle)
  };
}

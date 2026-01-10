# Jira Ticket Generation Prompt

> **Purpose:** Generate well-structured, outcome-focused Jira tickets for the Payload CMS Boilerplate project.
> **Usage:** Provide this prompt to an AI assistant along with a development plan or feature request.

---

## System Role

You are a **Senior Technical Project Manager** with expertise in:

- Agile/Scrum methodologies
- Technical project planning
- Payload CMS and Next.js ecosystems
- Writing clear, actionable user stories

Your task is to transform development plans into properly structured Jira tickets that development teams can execute without ambiguity.

---

## Project Context

<project_context>
**Project:** Payload CMS Boilerplate
**Tech Stack:** Next.js 15, React 19, Payload CMS 3.62, MongoDB, TypeScript
**Localization:** Ukrainian (default), English, Spanish
**Current State:**

- 7 collections: Pages, News, NewsTags, Navigation, Media, MediaFolders, Users
- 2 globals: SiteSettings, Footer
- 4 custom fields: SEOValidationField, MarkdownEditorField, IconSelectField, GradientSelectField
- 11 block components (9 complete, 2 incomplete: RichTextBlock, ImageBlock)
- Role system: admin/user only
- SMTP: disabled/commented out
- 2FA: not implemented
- CI/CD: not configured
  </project_context>

---

## Core Principles

### 1. Outcome-Focused Writing

| DO                                 | DON'T                            |
| ---------------------------------- | -------------------------------- |
| Describe WHAT should be achieved   | Describe HOW to code it          |
| Define success criteria            | Include code snippets            |
| Focus on user/business value       | Specify technical implementation |
| Use verifiable acceptance criteria | Use vague requirements           |

### 2. INVEST Criteria for Stories

Every story must be:

- **I**ndependent: Can be developed separately
- **N**egotiable: Details can be discussed
- **V**aluable: Delivers user/business value
- **E**stimable: Team can size it
- **S**mall: Fits in one sprint (1-13 points)
- **T**estable: Has clear pass/fail criteria

### 3. Spike Before Complexity

Create a Spike ticket when:

- Technical approach is uncertain
- Multiple valid solutions exist
- Risk is high and needs investigation
- Research is required before commitment

---

## Ticket Templates

### Epic Template

```markdown
### [EPIC] {Title}

**Priority:** {Critical | High | Medium | Low}
**Labels:** `{label1}`, `{label2}`

**Vision:**
{One sentence describing the end state when this epic is complete}

**Success Metrics:**

- {Measurable outcome 1}
- {Measurable outcome 2}

**Included Stories:**

- [ ] Story 1
- [ ] Story 2
```

### Story Template

```markdown
### [STORY] {Title}

**Priority:** {Critical | High | Medium | Low}
**Points:** {1 | 2 | 3 | 5 | 8 | 13}
**Labels:** `{label1}`, `{label2}`
**Parent Epic:** {Epic name}

**User Story:**
As a {persona}, I want {goal} so that {benefit}.

**Current State:** (if applicable)
{Brief description of existing functionality or gap}

**Acceptance Criteria:**

- [ ] GIVEN {context} WHEN {action} THEN {outcome}
- [ ] GIVEN {context} WHEN {action} THEN {outcome}
- [ ] {Simple criterion if Given/When/Then is overkill}

**Out of Scope:** (if needed)

- {Explicit exclusion 1}
- {Explicit exclusion 2}

**Dependencies:** {None | List of blocking tickets}

**Risks:** (if any)

- {Risk and mitigation}

**Subtasks:** (if 3+ distinct deliverables)

- [ ] {Subtask 1}
- [ ] {Subtask 2}
```

### Spike Template

```markdown
### [SPIKE] {Title}

**Time-box:** {X hours | X days}
**Priority:** {High | Medium}
**Labels:** `spike`, `research`
**Parent Epic:** {Epic name}

**Context:**
{Why this research is needed}

**Questions to Answer:**

1. {Specific question 1}?
2. {Specific question 2}?
3. {Specific question 3}?

**Expected Output:**

- {Deliverable 1: e.g., Decision document}
- {Deliverable 2: e.g., POC or prototype}
- {Deliverable 3: e.g., Risk assessment}

**Unblocks:**

- {Story or Epic that depends on this spike}
```

---

## Estimation Guidelines

| Points | Complexity   | Examples                             |
| ------ | ------------ | ------------------------------------ |
| 1      | Trivial      | Config change, copy update           |
| 2      | Simple       | Single component, clear requirements |
| 3      | Moderate     | Multiple files, some unknowns        |
| 5      | Complex      | Cross-cutting, integration work      |
| 8      | Very Complex | New system, multiple integrations    |
| 13     | Epic-level   | Should be broken down further        |

---

## Priority Framework (MoSCoW + Business Value)

| Priority     | Criteria                                | Action                      |
| ------------ | --------------------------------------- | --------------------------- |
| **Critical** | Blocks release or other work            | Do first, no exceptions     |
| **High**     | Core functionality, high business value | Do in current/next sprint   |
| **Medium**   | Important but not urgent                | Plan for upcoming sprints   |
| **Low**      | Nice-to-have, optional features         | Backlog, do if time permits |

---

## Definition of Done

A ticket is complete when:

- [ ] All acceptance criteria pass
- [ ] Code reviewed and approved
- [ ] Tests written and passing
- [ ] No TypeScript/ESLint errors
- [ ] Works in all supported locales (UK/EN/ES)
- [ ] Documentation updated (if applicable)
- [ ] Deployed to test environment

---

## Output Format

When generating tickets, structure your response as:

1. **Summary Table** - Quick overview of all tickets
2. **Dependency Graph** - Visual representation of blocking relationships
3. **Epic Breakdown** - Epics with their child stories
4. **Detailed Tickets** - Full ticket content using templates above
5. **Sprint Recommendation** - Suggested groupings for execution

---

## Examples

### Good vs Bad Acceptance Criteria

**BAD (implementation-focused):**

```
- [ ] Create AuthService class with TOTP library
- [ ] Add QR code generation endpoint
- [ ] Store encrypted secrets in user.twoFactorSecret field
```

**GOOD (outcome-focused):**

```
- [ ] GIVEN an admin user WHEN they enable 2FA THEN they see a QR code to scan
- [ ] GIVEN 2FA is enabled WHEN admin logs in THEN they must enter a 6-digit code
- [ ] GIVEN admin loses authenticator WHEN they use backup code THEN they regain access
```

### Good vs Bad Story Scope

**BAD (too vague):**

```
[STORY] Improve CMS performance
- Make it faster
- Optimize queries
```

**GOOD (specific and measurable):**

```
[STORY] Optimize News Collection Query Performance

**Acceptance Criteria:**
- [ ] News list page loads in under 2 seconds with 1000+ articles
- [ ] Database queries use proper indexes (verified via explain())
- [ ] No N+1 query patterns in news fetching
```

---

## Guardrails

When creating tickets, NEVER:

- Include code snippets or pseudo-code
- Specify libraries, packages, or technical tools
- Describe database schemas or API contracts
- Mention file paths or function names
- Add implementation notes or developer hints

ALWAYS:

- Focus on observable outcomes
- Use business/user language
- Make criteria independently verifiable
- Consider edge cases and error states
- Identify dependencies explicitly

---

## Current Backlog

<backlog>
The following items need tickets created:

1. **Complete All Remaining Payload Components** - RichTextBlock and ImageBlock need implementation
2. **CI/CD Pipeline on Test Server** - GitHub Actions, automated deployment
3. **Optimize CMS Structure** - Streamline collections and fields
4. **CMS Tutorial Inside CMS (UI Guides)** - In-app onboarding for editors
5. **Two-Factor Authentication for Admins** - Optional security enhancement
6. **AI Integration for Content Improvement** - Optional, needs spike first
7. **CMS Built-In Developer Documentation** - Technical docs in/alongside CMS
8. **Advanced Role Management** - Beyond admin/user roles
9. **Unify User Experience in Content Creation** - Consistent workflows
10. **Built-In SMTP Support** - Enable email functionality
11. **Complete Ukrainian Translation** - Full admin UI localization
    </backlog>

---

## Execution Instructions

1. **Analyze** - Review each backlog item against project context
2. **Identify Spikes** - Flag items needing research first
3. **Create Hierarchy** - Group into Epics, break into Stories
4. **Apply Templates** - Use the templates above consistently
5. **Map Dependencies** - Identify what blocks what
6. **Estimate** - Assign story points based on guidelines
7. **Prioritize** - Apply MoSCoW framework
8. **Validate** - Ensure all tickets meet INVEST criteria

---

## Generated Tickets

<!-- AI: Generate tickets below this line following all guidelines above -->

### Summary Table

| ID  | Type  | Title                      | Priority | Points | Dependencies |
| --- | ----- | -------------------------- | -------- | ------ | ------------ |
| E1  | Epic  | CMS Foundation Enhancement | High     | 18     | -            |
| E2  | Epic  | Admin Security Enhancement | High     | 16     | -            |
| E3  | Epic  | DevOps & Infrastructure    | High     | 13     | -            |
| E4  | Epic  | Documentation & Training   | Medium   | 13     | -            |
| E5  | Epic  | Complete Localization      | Medium   | 5      | -            |
| E6  | Epic  | AI-Powered Content Tools   | Low      | 13     | -            |
| S1  | Story | Complete Block Components  | High     | 8      | -            |
| S2  | Story | Optimize CMS Structure     | Medium   | 5      | -            |
| S3  | Story | Unify Content Creation UX  | Medium   | 5      | S1           |
| S4  | Story | Two-Factor Authentication  | Low      | 8      | S7           |
| S5  | Story | Advanced Role Management   | High     | 8      | -            |
| S6  | Story | CI/CD Pipeline             | Critical | 8      | -            |
| S7  | Story | Built-In SMTP Support      | High     | 5      | -            |
| S8  | Story | CMS UI Tutorials           | Medium   | 8      | -            |
| S9  | Story | Developer Documentation    | Medium   | 5      | -            |
| S10 | Story | Ukrainian Translation      | Medium   | 5      | -            |
| SP1 | Spike | AI Integration Research    | Medium   | 3d     | -            |
| S11 | Story | AI Content Tools           | Low      | 13     | SP1, S7      |

**Total:** 78 Story Points + 1 Spike (3 days)

---

### Dependency Graph

```
                    ┌─────────────────────────────────────────┐
                    │           INDEPENDENT TRACKS            │
                    └─────────────────────────────────────────┘
                                        │
        ┌───────────────┬───────────────┼───────────────┬───────────────┐
        ▼               ▼               ▼               ▼               ▼
    ┌───────┐       ┌───────┐       ┌───────┐       ┌───────┐       ┌───────┐
    │  S6   │       │  S5   │       │  S1   │       │  S8   │       │  S10  │
    │ CI/CD │       │ Roles │       │Blocks │       │Tutorials       │  i18n │
    └───────┘       └───────┘       └───┬───┘       └───────┘       └───────┘
                                        │
                                        ▼
                                    ┌───────┐
                                    │  S3   │
                                    │  UX   │
                                    └───────┘

    ┌───────┐       ┌───────┐
    │  S7   │       │  SP1  │
    │ SMTP  │       │AI Spike
    └───┬───┘       └───┬───┘
        │               │
        ▼               ▼
    ┌───────┐       ┌───────┐
    │  S4   │       │  S11  │◄─────┐
    │  2FA  │       │  AI   │      │
    └───────┘       └───────┘      │
                        ▲          │
                        └──────────┘
                        (also needs S7)
```

---

## Epic 1: CMS Core Improvements

### [EPIC] CMS Foundation Enhancement

**Priority:** High
**Labels:** `cms`, `core`, `foundation`

**Vision:**
A production-ready CMS with complete block components, optimized structure, and consistent editor experience.

**Success Metrics:**

- All page blocks render dynamic content correctly
- Editor workflow is consistent across all content types
- No redundant or unused fields in collections

**Included Stories:**

- [S1] Complete Remaining Payload Block Components
- [S2] Optimize CMS Structure
- [S3] Unify User Experience in Content Creation Actions

---

### [STORY] S1: Complete Remaining Payload Block Components

**Priority:** High
**Points:** 8
**Labels:** `blocks`, `components`, `frontend`
**Parent Epic:** CMS Foundation Enhancement

**User Story:**
As a content editor, I want all page blocks to display content correctly so that I can build complete pages without workarounds.

**Current State:**

- 9 of 11 blocks fully implemented
- RichTextBlock shows hardcoded placeholder content
- ImageBlock renders gray placeholder instead of actual images

**Acceptance Criteria:**

- [ ] GIVEN a page with RichTextBlock WHEN editor adds rich text content THEN it renders with proper formatting on frontend
- [ ] GIVEN a page with ImageBlock WHEN editor selects an image THEN it displays with proper optimization and responsive sizing
- [ ] GIVEN an image fails to load WHEN page renders THEN a graceful fallback appears (not broken image icon)
- [ ] GIVEN blocks with localized content WHEN switching locale THEN correct translation displays
- [ ] GIVEN live preview mode WHEN editor changes block content THEN preview updates in real-time

**Out of Scope:**

- New block types beyond RichText and Image
- Animation or transition effects

**Dependencies:** None

**Subtasks:**

- [ ] Implement RichTextBlock dynamic content rendering
- [ ] Implement ImageBlock with Next.js Image optimization
- [ ] Add fallback states for missing/failed images
- [ ] Verify all blocks work with UK/EN/ES locales
- [ ] Test live preview functionality

---

### [STORY] S2: Optimize CMS Structure

**Priority:** Medium
**Points:** 5
**Labels:** `optimization`, `architecture`, `cms`
**Parent Epic:** CMS Foundation Enhancement

**User Story:**
As a CMS administrator, I want a streamlined collection structure so that editors can find and manage content efficiently.

**Current State:**

- 7 collections, 2 globals, 4 custom fields
- Some field configurations may be redundant
- No content relationship tracking between pages

**Acceptance Criteria:**

- [ ] GIVEN an editor in admin panel WHEN navigating collections THEN related items are logically grouped
- [ ] GIVEN any collection WHEN viewing fields THEN only necessary fields are visible (no unused fields)
- [ ] GIVEN collection descriptions WHEN editor reads them THEN purpose and usage is clear
- [ ] GIVEN a content query WHEN executed THEN it uses efficient database access patterns

**Out of Scope:**

- Creating new collections
- Breaking schema changes requiring data migration

**Dependencies:** None

---

### [STORY] S3: Unify User Experience in Content Creation Actions

**Priority:** Medium
**Points:** 5
**Labels:** `ux`, `admin`, `content-creation`
**Parent Epic:** CMS Foundation Enhancement

**User Story:**
As a content editor, I want consistent workflows across all content types so that I can work efficiently without relearning patterns.

**Current State:**

- Pages have Draft/Published/Archived states
- News has only Draft/Published states
- Field ordering varies between collections
- No content templates or quick-start patterns

**Acceptance Criteria:**

- [ ] GIVEN any content collection WHEN viewing status options THEN same statuses are available consistently
- [ ] GIVEN draft content WHEN viewing in list THEN visual indicator clearly distinguishes from published
- [ ] GIVEN a new content item WHEN creating THEN sensible defaults reduce manual entry
- [ ] GIVEN save/publish actions WHEN clicking THEN behavior is identical across collections
- [ ] GIVEN validation errors WHEN displayed THEN messages are clear and actionable

**Dependencies:** S1 (Complete Block Components)

---

## Epic 2: Authentication & Security

### [EPIC] Admin Security Enhancement

**Priority:** High
**Labels:** `security`, `authentication`, `admin`

**Vision:**
Admin accounts are protected with enterprise-grade security including granular permissions and optional 2FA.

**Success Metrics:**

- Multiple role types with distinct permission levels
- 2FA available for security-conscious admins
- Role changes take effect immediately

**Included Stories:**

- [S4] Two-Factor Authentication for Admins
- [S5] Advanced Role Management in CMS

---

### [STORY] S4: Two-Factor Authentication for Admins (Optional)

**Priority:** Low
**Points:** 8
**Labels:** `security`, `2fa`, `authentication`, `optional`
**Parent Epic:** Admin Security Enhancement

**User Story:**
As an admin user, I want to enable two-factor authentication so that my account is protected even if my password is compromised.

**Current State:**

- Email/password authentication with JWT (2-hour expiration)
- Account lockout after 5 failed attempts
- No 2FA capability
- Email verification disabled

**Acceptance Criteria:**

- [ ] GIVEN admin account settings WHEN user navigates to security THEN 2FA enable option is visible
- [ ] GIVEN 2FA setup WHEN user scans QR code with authenticator app THEN setup completes successfully
- [ ] GIVEN 2FA enabled WHEN admin logs in with correct password THEN second factor is required
- [ ] GIVEN 2FA enabled WHEN admin loses authenticator THEN backup codes allow account recovery
- [ ] GIVEN super-admin role WHEN user is locked out of 2FA THEN super-admin can reset their 2FA

**Out of Scope:**

- 2FA for non-admin (regular user) accounts
- Hardware security keys (YubiKey, FIDO2)
- SMS-based 2FA

**Dependencies:** S7 (Built-In SMTP Support) - needed for backup code delivery

**Risks:**

- Users locked out if backup codes are lost
- Mitigation: Super-admin reset capability

---

### [STORY] S5: Advanced Role Management in CMS

**Priority:** High
**Points:** 8
**Labels:** `roles`, `permissions`, `access-control`
**Parent Epic:** Admin Security Enhancement

**User Story:**
As a CMS administrator, I want granular role management so that I can give team members appropriate access levels.

**Current State:**

- Only 2 roles: admin (full access), user (limited access)
- No editor, moderator, or viewer roles
- No field-level permissions

**Acceptance Criteria:**

- [ ] GIVEN admin panel WHEN managing users THEN multiple role options are available (Admin, Editor, Author, Viewer)
- [ ] GIVEN a role assignment WHEN user logs in THEN they see only permitted collections and actions
- [ ] GIVEN Author role WHEN user creates content THEN they can only edit their own content
- [ ] GIVEN Editor role WHEN user views content THEN they can edit any content but not delete
- [ ] GIVEN role change WHEN admin updates user role THEN new permissions apply immediately (no re-login)
- [ ] GIVEN admin panel WHEN viewing roles THEN permission matrix is documented and visible

**Out of Scope:**

- Custom role creation (predefined roles only)
- Field-level permissions within collections

**Dependencies:** None

**Subtasks:**

- [ ] Define role hierarchy and permissions matrix
- [ ] Implement access control per collection per role
- [ ] Update admin UI for role assignment
- [ ] Document role capabilities for administrators

---

## Epic 3: Infrastructure & DevOps

### [EPIC] DevOps & Infrastructure

**Priority:** High
**Labels:** `devops`, `infrastructure`, `cicd`

**Vision:**
Automated, reliable deployment pipeline with essential infrastructure services for production readiness.

**Success Metrics:**

- Code changes deploy automatically to test server
- Email notifications work for all user management flows
- Build failures notify team within 5 minutes

**Included Stories:**

- [S6] CI/CD Pipeline on Test Server
- [S7] Built-In SMTP Support/Service

---

### [STORY] S6: CI/CD Pipeline on Test Server

**Priority:** Critical
**Points:** 8
**Labels:** `cicd`, `devops`, `deployment`, `github-actions`
**Parent Epic:** DevOps & Infrastructure
**Platform:** GitHub Actions

**User Story:**
As a developer, I want automated deployments so that tested code reaches the test server without manual intervention.

**Acceptance Criteria:**

- [ ] GIVEN code pushed to main branch WHEN push completes THEN GitHub Actions workflow triggers automatically
- [ ] GIVEN workflow running WHEN linting fails THEN build stops and team is notified
- [ ] GIVEN workflow running WHEN type-check fails THEN build stops and team is notified
- [ ] GIVEN all checks pass WHEN build completes THEN application deploys to test server automatically
- [ ] GIVEN deployment fails WHEN error occurs THEN rollback to previous version is possible
- [ ] GIVEN GitHub Secrets WHEN workflow runs THEN environment variables are securely injected
- [ ] GIVEN workflow status WHEN viewing GitHub THEN PR checks and Actions UI show current state

**Out of Scope:**

- Production deployment pipeline
- Blue-green or canary deployment strategies
- Performance testing in pipeline

**Dependencies:** None

**Subtasks:**

- [ ] Create GitHub Actions workflow file
- [ ] Configure test server environment
- [ ] Set up SSH keys/deployment credentials in GitHub Secrets
- [ ] Implement build, lint, type-check, test stages
- [ ] Configure deployment step (SSH, Docker, or platform-specific)
- [ ] Set up notification on failure (Slack/Discord/Email)

---

### [STORY] S7: Built-In SMTP Support/Service

**Priority:** High
**Points:** 5
**Labels:** `email`, `smtp`, `infrastructure`
**Parent Epic:** DevOps & Infrastructure

**User Story:**
As a system administrator, I want email functionality so that password resets and notifications work properly.

**Current State:**

- SMTP configuration commented out in payload.config.ts
- No SMTP environment variables defined
- Email verification disabled in Users collection
- No password reset flow

**Acceptance Criteria:**

- [ ] GIVEN SMTP environment variables WHEN application starts THEN connection is validated and logged
- [ ] GIVEN missing SMTP config WHEN application starts THEN clear warning indicates email is disabled
- [ ] GIVEN user clicks "forgot password" WHEN email is configured THEN reset email is sent
- [ ] GIVEN email send fails WHEN error occurs THEN failure is logged with actionable details
- [ ] GIVEN admin panel WHEN testing email THEN test email functionality is available
- [ ] GIVEN email templates WHEN customizing THEN templates can be modified without code changes

**Out of Scope:**

- Marketing email campaigns
- Email analytics/open tracking
- Multiple SMTP provider support

**Dependencies:** None

---

## Epic 4: Documentation & Onboarding

### [EPIC] Documentation & Training

**Priority:** Medium
**Labels:** `documentation`, `onboarding`, `training`

**Vision:**
Comprehensive documentation and in-app guidance enable self-service onboarding for editors and developers.

**Success Metrics:**

- New editors can create content without external training
- Developers can extend the CMS using built-in docs
- Tutorial completion rate > 80% for new users

**Included Stories:**

- [S8] CMS Tutorial Inside CMS (UI Guides)
- [S9] CMS Built-In Developer Documentation

---

### [STORY] S8: CMS Tutorial Inside CMS (UI Guides)

**Priority:** Medium
**Points:** 8
**Labels:** `tutorial`, `onboarding`, `ux`
**Parent Epic:** Documentation & Training

**User Story:**
As a new CMS editor, I want in-app tutorials so that I can learn the system without external documentation.

**Current State:**

- No in-CMS tutorial system
- Demo content exists via seed script (not training material)
- Field descriptions exist but no guided tours

**Acceptance Criteria:**

- [ ] GIVEN first login WHEN user enters admin panel THEN welcome guide appears
- [ ] GIVEN tutorial active WHEN following steps THEN each step highlights relevant UI elements
- [ ] GIVEN complex feature (blocks, SEO, localization) WHEN user accesses it THEN contextual help is available
- [ ] GIVEN completed tutorial WHEN user wants to review THEN tutorials are replayable from help menu
- [ ] GIVEN user progress WHEN viewing profile THEN completed tutorials are tracked
- [ ] GIVEN locale set to UK/EN/ES WHEN viewing tutorials THEN content appears in selected language

**Out of Scope:**

- Video tutorials
- External learning management system
- Certification or assessments

**Dependencies:** None

**Subtasks:**

- [ ] Design tutorial flow and content structure
- [ ] Implement tutorial UI overlay component
- [ ] Create tutorial content for core features
- [ ] Localize tutorials to UK/EN/ES
- [ ] Add progress tracking

---

### [STORY] S9: CMS Built-In Developer Documentation

**Priority:** Medium
**Points:** 5
**Labels:** `documentation`, `developer`, `technical`
**Parent Epic:** Documentation & Training

**User Story:**
As a developer extending the CMS, I want accessible technical documentation so that I can understand patterns and APIs without reading source code.

**Current State:**

- README.md: quick start and commands
- CLAUDE.md: project patterns for AI
- scripts/README.md: utility documentation
- No integrated developer documentation

**Acceptance Criteria:**

- [ ] GIVEN developer needs API info WHEN accessing docs THEN endpoints are documented with examples
- [ ] GIVEN developer creating blocks WHEN reading docs THEN component patterns are explained
- [ ] GIVEN developer adding custom fields WHEN reading docs THEN field creation is documented
- [ ] GIVEN developer setting up environment WHEN reading docs THEN all env vars are explained
- [ ] GIVEN common error WHEN troubleshooting THEN solution is documented
- [ ] GIVEN admin panel WHEN accessing help THEN developer docs are linked or embedded

**Out of Scope:**

- Video tutorials
- External developer portal
- Interactive API playground

**Dependencies:** None

---

## Epic 5: Localization

### [EPIC] Complete Localization

**Priority:** Medium
**Labels:** `localization`, `i18n`, `ukrainian`

**Vision:**
CMS is fully localized for all supported languages, enabling native-language administration.

**Success Metrics:**

- 100% of admin UI strings translated to Ukrainian
- No English fallbacks visible when Ukrainian locale is selected

**Included Stories:**

- [S10] CMS Complete Translation to Ukrainian

---

### [STORY] S10: CMS Complete Translation to Ukrainian

**Priority:** Medium
**Points:** 5
**Labels:** `localization`, `ukrainian`, `i18n`
**Parent Epic:** Complete Localization

**User Story:**
As a Ukrainian-speaking administrator, I want the CMS in Ukrainian so that I can work in my native language.

**Current State:**

- 3 locales configured: Ukrainian (default), English, Spanish
- Content fields support localization
- Seed content exists in Ukrainian and English
- Admin interface may have untranslated strings

**Acceptance Criteria:**

- [ ] GIVEN admin panel WHEN locale is Ukrainian THEN all labels appear in Ukrainian
- [ ] GIVEN validation error WHEN locale is Ukrainian THEN error message is in Ukrainian
- [ ] GIVEN collection/field descriptions WHEN viewing THEN descriptions are in Ukrainian
- [ ] GIVEN dates/times WHEN displayed THEN format follows Ukrainian conventions
- [ ] GIVEN tooltips/help text WHEN hovering THEN content is in Ukrainian

**Out of Scope:**

- Spanish translation completion
- RTL language support
- Translation management UI

**Dependencies:** None

---

## Epic 6: AI Integration (Optional)

### [EPIC] AI-Powered Content Tools

**Priority:** Low
**Labels:** `ai`, `content`, `optional`

**Vision:**
AI tools assist content creators with improvement suggestions and translation, increasing productivity.

**Success Metrics:**

- AI suggestions accepted in >50% of uses
- Translation quality rated acceptable by editors
- AI costs remain within budget thresholds

**Included Stories:**

- [SP1] AI Integration Research (Spike)
- [S11] AI Integration for Content Improvement and Translation

---

### [SPIKE] SP1: AI Integration Research

**Priority:** Medium
**Time-box:** 3 days
**Labels:** `spike`, `research`, `ai`
**Parent Epic:** AI-Powered Content Tools

**Context:**
AI integration involves multiple provider options, cost implications, and privacy considerations. Research is needed before committing to implementation approach.

**Questions to Answer:**

1. Which providers best support Ukrainian language (OpenAI, Anthropic Claude, Azure, Gemini, Ollama)?
2. What content improvement features deliver most value (grammar, SEO, readability, tone)?
3. How should AI translation integrate with existing UK/EN/ES localization workflow?
4. What are cost implications per provider at different usage levels?
5. How should AI-generated content be tracked in version history?
6. What privacy/data handling requirements apply per provider?
7. Can local models (Ollama) provide acceptable quality for sensitive content?

**Expected Output:**

- Provider comparison matrix (cost, quality, API features, language support)
- Recommended provider with justification
- Cost projection for typical usage patterns
- Privacy/security assessment per provider
- Technical feasibility assessment

**Unblocks:**

- S11: AI Integration for Content Improvement and Translation

---

### [STORY] S11: AI Integration for Content Improvement and Translation (Optional)

**Priority:** Low
**Points:** 13
**Labels:** `ai`, `content`, `translation`, `optional`
**Parent Epic:** AI-Powered Content Tools

**User Story:**
As a content editor, I want AI-powered suggestions so that I can improve content quality and translate quickly.

**Acceptance Criteria:**

- [ ] GIVEN rich text editor WHEN user requests improvement THEN AI suggestions appear inline
- [ ] GIVEN content in one language WHEN user requests translation THEN AI translates to selected locale
- [ ] GIVEN AI suggestion WHEN displayed THEN it is clearly marked as AI-generated
- [ ] GIVEN AI suggestion WHEN reviewing THEN user can accept, modify, or reject
- [ ] GIVEN AI usage WHEN admin views reports THEN usage and costs are tracked
- [ ] GIVEN user role WHEN accessing AI features THEN features respect role permissions

**Out of Scope:**

- Fully automated content generation (without human review)
- AI-generated images or media
- Real-time co-writing assistance

**Dependencies:**

- SP1: AI Integration Research (must complete first)
- S7: Built-In SMTP Support (for API key management notifications)

**Risks:**

- AI costs may exceed budget
- Mitigation: Usage limits per role, cost alerts
- Ukrainian language quality may be poor
- Mitigation: Spike will evaluate providers for Ukrainian support

---

## Sprint Planning Recommendations

### Sprint 1: Foundation (Critical Path)

| Ticket             | Points | Rationale                      |
| ------------------ | ------ | ------------------------------ |
| S6: CI/CD Pipeline | 8      | Enables all future deployments |
| S7: SMTP Support   | 5      | Unblocks 2FA and notifications |
| **Total**          | **13** |                                |

### Sprint 2: Core Features

| Ticket              | Points | Rationale                      |
| ------------------- | ------ | ------------------------------ |
| S1: Complete Blocks | 8      | High priority, no dependencies |
| S5: Role Management | 8      | High priority, no dependencies |
| **Total**           | **16** |                                |

### Sprint 3: Polish & UX

| Ticket              | Points | Rationale       |
| ------------------- | ------ | --------------- |
| S2: Optimize CMS    | 5      | Medium priority |
| S3: Unify UX        | 5      | Depends on S1   |
| S10: Ukrainian i18n | 5      | Medium priority |
| **Total**           | **15** |                 |

### Sprint 4: Documentation

| Ticket           | Points | Rationale       |
| ---------------- | ------ | --------------- |
| S8: UI Tutorials | 8      | Medium priority |
| S9: Dev Docs     | 5      | Medium priority |
| **Total**        | **13** |                 |

### Sprint 5: Optional Features

| Ticket        | Points        | Rationale              |
| ------------- | ------------- | ---------------------- |
| SP1: AI Spike | 3d            | Must precede S11       |
| S4: 2FA       | 8             | Optional, low priority |
| **Total**     | **8 + Spike** |                        |

### Sprint 6: AI Integration (if approved)

| Ticket        | Points | Rationale           |
| ------------- | ------ | ------------------- |
| S11: AI Tools | 13     | Depends on SP1 + S7 |
| **Total**     | **13** |                     |

---

## Appendix: Labels Reference

| Label            | Usage                              |
| ---------------- | ---------------------------------- |
| `blocks`         | Block component work               |
| `components`     | React component work               |
| `frontend`       | Frontend/UI changes                |
| `cms`            | CMS configuration                  |
| `core`           | Core functionality                 |
| `optimization`   | Performance/structure improvements |
| `ux`             | User experience                    |
| `admin`          | Admin panel changes                |
| `security`       | Security features                  |
| `2fa`            | Two-factor authentication          |
| `authentication` | Auth system changes                |
| `roles`          | Role/permission changes            |
| `cicd`           | CI/CD pipeline                     |
| `devops`         | DevOps/infrastructure              |
| `github-actions` | GitHub Actions specific            |
| `email`          | Email functionality                |
| `smtp`           | SMTP configuration                 |
| `tutorial`       | Tutorial/onboarding                |
| `documentation`  | Documentation                      |
| `localization`   | i18n/l10n                          |
| `i18n`           | Internationalization               |
| `ukrainian`      | Ukrainian language                 |
| `ai`             | AI features                        |
| `spike`          | Research/investigation             |
| `research`       | Research work                      |
| `optional`       | Nice-to-have features              |

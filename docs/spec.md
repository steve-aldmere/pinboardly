# Pinboardly v1 – Product Specification

## Pinboardly v1: Functional and Non-Functional Requirements Checklist

### 1. Data Model
1. Each **Group** has:
   - A unique identifier (**slug**)
   - Ownership of one or more boards
   - Control over board visibility
2. **Boards** exist in three types:
   - **Notes** (for lists and written info)
   - **Calendar** (for upcoming events)
   - **Links** (for important URLs)
3. Users may belong to multiple groups.

### 2. Auth
4. A **User** must be able to sign in to Pinboardly.

### 3. Permissions
5. There are only two roles in v1: **Group Admin** and **Member**.
6. **Group Admins** can:
   - Create boards
   - Edit boards
   - Delete boards
   - Edit board content

### 4. Boards (Notes/Calendar/Links)
7. Each group has separate, dedicated spaces for:
   - Notes
   - Calendar
   - Links

### 5. Routing/URLs
8. Each group is accessible at a dedicated URL:
   - Format: `https://pinboardly.com/{group}`

### 6. UI/UX
9. Product must prioritize:
   - Clarity
   - Predictability
   - Calm use
   - Minimal feature breadth (simplicity is favored)
10. There is no global feed.

### 7. Non-goals (Explicit Non-Functional Requirements)
11. No features or changes outside this specification are in scope, unless explicitly agreed.
12. Any change outside the specification is considered out of scope for v1.

---

## 1. Product Summary

Pinboardly is a simple online noticeboard for groups.

Each group gets a dedicated space with three clear board types:
- **Notes** – for lists and written information
- **Calendar** – for upcoming events
- **Links** – for important URLs

The product prioritises clarity, predictability, and calm use over feature breadth.

---

## 2. Core Concepts
| Requirement ID | Requirement Summary | Implemented? | Evidence (file paths) | Notes / Risks |
|----------------|--------------------|--------------|-----------------------|---------------|
| 2.4            | User must be able to sign in | No | | No explicit sign-in functionality or logic present in code or evidence supplied. |
| 3.5            | Only two roles in v1: Group Admin and Member | No | | There is no code or schema for roles, permissions, or mention of Group Admin/Member in code. |
| 3.6            | Group Admins can create, edit, delete boards & edit board content | Partial | app/boards/[id]/BoardPageClient.tsx | Only board deletion is implemented; creation/editing and board content editing are not present in supplied code. No explicit admin role checks. |
| 4.7            | Each group has separate spaces: Notes, Calendar, Links | No | | The UI and logic to support separate spaces for Notes, Calendar, and Links are missing; placeholder in BoardPageClient.tsx. |
| 5.8            | Each group accessible at URL format /{group} | Partial | app/boards/[id]/BoardPageClient.tsx | Board data fetch uses org_slug, and computed backHref; group-level routing and enforcement not directly evidenced. |
| 6.9            | Product prioritizes clarity, predictability, calm use, simplicity | Partial | app/boards/[id]/BoardPageClient.tsx | UI is simple and clear but this is a subjective measure and can't be strictly validated at code level. |
| 6.10           | No global feed | Yes | | Absence of feed functionality in UI/code. |
| 7.11           | No features/changes outside specification scope | Partial | | No violations found, but cannot assert definitively without seeing full codebase. |
| 7.12           | Changes outside spec are out of scope | Partial | | See above; full compliance cannot be established from data provided. |


### 2.1 Group

A **Group** represents a real organisation (for example, a Scout group, lodge, or club).

- Each group has a unique identifier (slug)
- Each group is accessible at:
  
  `https://pinboardly.com/{group}`

- Groups own boards and control visibility
- There is no global feed

---

### 2.2 User

A **User** is an individual who can sign in to Pinboardly.

Users may belong to one or more groups.

---

### 2.3 Roles

There are only two roles in v1:

#### Group Admin
Admins can:
- create boards
- edit boards
- delete boards
- edit board content
- control board visibility (group-only or public)
- authorise members to access the group

There may be **one or more admins per group**.

---

#### Group Member
Members can:
- view boards they are authorised to access
- view public boards

Members cannot:
- create boards
- edit boards
- manage visibility
- invite other users

---

## 3. Board Visibility Rules

Each board has exactly one visibility state.

### 3.1 Group-only Boards
- Visible only to authorised group members
- Requires sign-in
- Used for internal information

---

### 3.2 Public Boards
- Visible to anyone with the group URL
- Does not require sign-in to view
- Read-only for non-members
- Editable only by group admins

---

## 4. Board Types (Locked)

Pinboardly v1 supports **exactly three board types**.

No custom board types are allowed.

---

### 4.1 Notes Board

**Purpose:** Store written information that should not get lost.

Each note entry contains:
- **Title** (required)
- **Text** (required, short)

Rules:
- No date field
- No structured link field
- Plain text only

---

### 4.2 Links Board

**Purpose:** Store important links in a consistent, findable place.

Each link entry contains:
- **Title** (required)
- **URL** (required)
- **Description** (optional, short)

Rules:
- URL must be valid
- Description is optional and brief

---

### 4.3 Calendar Board

**Purpose:** Show upcoming events and important dates.

Each calendar entry contains:
- **Title** (required)
- **Date** (required)
- **Text** (optional, short)
- **URL** (optional)

Rules:
- Date is mandatory
- Entries are sorted by upcoming date
- Maximum of one optional link per entry
- Text must remain short and practical

---

## 5. Group Page (`/{group}`)

Each group has a landing page at:

`https://pinboardly.com/{group}`

This page:
- displays all **public boards**
- clearly labels boards as public
- does not expose private content

If a signed-in user is authorised:
- group-only boards are also visible

---

## 6. Authentication

### 6.1 Preferred Method: Magic Sign-in Links

- User enters email address
- Receives a sign-in link
- No password required

This is the preferred method if implementation remains simple and reliable.

---

### 6.2 Acceptable Fallback: Email and Password

- Standard email and password authentication
- No social login required

**Rule:** Authentication must be boring and reliable.

---

## 7. Editing Rules

- Only **group admins** may create, edit, or delete boards
- Only **group admins** may edit board entries
- There are no per-post permissions

---

## 8. Explicit Exclusions (Out of Scope for v1)

The following are explicitly excluded from Pinboardly v1:

- comments or chat
- per-board or per-post permissions
- tagging systems
- notifications
- analytics
- subscriptions or payments
- public posting
- integrations
- custom domains
- theming
- mobile apps

---

## 9. Guiding Principle

> **Admins control content. Members consume it. The public sees only what admins allow.**

If a feature breaks this principle, it does not belong in v1.

---

## 10. Change Control

This document is the single source of truth for Pinboardly v1.

Any change must:
- be explicitly agreed
- be reflected in this document
- not introduce additional scope by default


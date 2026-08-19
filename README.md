# Help Desk Spark

Lovable Prompt — HelpDesk Lite V1
Implement Published Figma Design + Fast Working Demo + Real Backend

Build HelpDesk Lite V1 as a fully functional responsive web application.

I already created the UI/UX design in Figma.

IMPORTANT — USE MY PUBLISHED FIGMA DESIGN

Use the published Figma design that I provide as the primary visual source of truth.
https://stir-salon-03167062.figma.site/

Do NOT redesign the application from scratch.

Do NOT replace the Figma layout with a generic dashboard template.

Do NOT invent a different visual style.

Your job is to:

Take the published Figma design and turn it into a real working application.

Preserve as closely as possible:

Layout
Navigation
Sidebar
Header
Typography
Colors
Spacing
Cards
Tables
Buttons
Forms
Badges
Status indicators
Priority indicators
Modals
Drawers
Dashboard structure
Responsive behavior
Visual hierarchy
Icons
Component styling

If something in the Figma design is visually specified, follow the Figma design rather than replacing it with your own design.

1. First Priority — Make the Figma Design Work Quickly

I want to be able to open the application and immediately see a realistic working HelpDesk system.

Therefore, do NOT wait until the entire backend is finished before populating the interface.

Implement the application in this order:

Phase 1 — Working UI with realistic seed/demo data

Immediately populate the Figma screens with realistic fake data.

Phase 2 — Connect the UI to the real database/backend

Replace the fake data layer with persistent database data while keeping the exact same UI.

The fake data should therefore be structured exactly like the eventual database/API responses.

2. Fake Data Is REQUIRED Initially

Create realistic demo data so that every important screen looks populated.

Do NOT use:

"Lorem ipsum"
"Test User"
"Test Ticket"
"Example"
random meaningless values

Use realistic HelpDesk data.

For example:

Users
Ahmed Hassan — Employee
Sara Mohamed — Employee
Omar Khaled — Support Staff
Mariam Adel — Support Staff
Youssef Ali — Manager
Nour Ahmed — Product Operations
Karim Samir — Engineer
Teams
IT Support
Infrastructure
Software Support
Network Operations
Business Operations
Categories
Hardware
Software
Network
Access & Accounts
Infrastructure
Business Request
Priorities
Low
Medium
High
Critical
Statuses
New
Assigned
In Progress
Resolved
Closed
3. Realistic Demo Tickets

Create at least 15–25 realistic tickets.

Example tickets:

HD-1001

Laptop cannot connect to company Wi-Fi

Category:
Network

Priority:
High

Status:
In Progress

Created by:
Ahmed Hassan

Assigned Team:
Network Operations

Assigned User:
Omar Khaled

HD-1002

Request access to Finance shared folder

Category:
Access & Accounts

Priority:
Medium

Status:
Assigned

Created by:
Sara Mohamed

Assigned Team:
IT Support

Assigned User:
Mariam Adel

HD-1003

Microsoft Excel crashes when opening large files

Category:
Software

Priority:
Medium

Status:
New

Created by:
Ahmed Hassan

Assigned Team:
Unassigned

HD-1004

Replace damaged keyboard

Category:
Hardware

Priority:
Low

Status:
Resolved

Created by:
Sara Mohamed

Assigned Team:
IT Support

Assigned User:
Omar Khaled

HD-1005

VPN connection unavailable

Category:
Network

Priority:
Critical

Status:
In Progress

Created by:
Ahmed Hassan

Assigned Team:
Infrastructure

Assigned User:
Karim Samir

Create enough variety to demonstrate:

New tickets
Assigned tickets
In-progress tickets
Resolved tickets
Closed tickets
Low priority
Medium priority
High priority
Critical priority
Different categories
Different teams
Assigned and unassigned tickets
4. IMPORTANT — Fake Data Must Behave Like Real Data

Do not make the demo a static screenshot.

The user should be able to interact with it.

For example:

Search

If I search:

VPN

show only relevant tickets.

Status filter

If I select:

In Progress

show only in-progress tickets.

Priority filter

If I select:

Critical

show only critical tickets.

Category filter

If I select:

Network

show network tickets.

Combined filters

Allow:

Status = In Progress
Priority = High

and show the appropriate tickets.

5. Ticket Creation Must Work Immediately

The Create Request form must actually work using the demo data layer.

When I submit:

Title:
Printer not working

Description:
The printer on the second floor is not responding.

Category:
Hardware

Priority:
Medium

the application should:

Validate the form
Create a new ticket
Generate a ticket number
Add it to the ticket list
Show a success message
Redirect/open the ticket details
Display the new ticket in the dashboard/list

For the first quick demo, this can use an in-memory/local demo data store.

However, structure the code so it can later be replaced by the real API/database without changing the UI.

6. Ticket Details Must Work

Clicking a ticket should open the corresponding ticket details page/drawer defined by the Figma design.

Show:

Ticket ID
Title
Description
Category
Priority
Status
Created by
Created date
Assigned team
Assigned user
Updated date
Progress

Use the actual selected ticket's data.

Do NOT show the same hard-coded ticket for every row.

7. Assignment Must Work

For Support/Operations users:

Allow:

Assign Team

and, where applicable:

Assign User

When assignment is confirmed:

Update the ticket
Update the UI
Show confirmation
Update the ticket list
Update dashboard counts if necessary

Example:

Before:

Assigned Team:
Unassigned

After:

Assigned Team:
Infrastructure

Assigned User:
Karim Samir

8. Status Changes Must Work

Allow authorized users to change:

New

→ Assigned

→ In Progress

→ Resolved

→ Closed

When status changes:

Update the ticket
Update the badge
Update the progress tracker
Update dashboard statistics
Update filtered lists
Add a status-history entry

For the quick demo, this can initially be handled by the demo data layer.

9. Dashboard Must Use Actual Data

Do NOT hard-code dashboard statistics.

Calculate them from the current ticket dataset.

For example:

Total Requests:
25

New:
5

Assigned:
6

In Progress:
8

Resolved:
4

Closed:
2

If I create a new ticket, the numbers should update.

If I change a ticket from:

New → In Progress

the corresponding statistics should update.

10. Employee Dashboard

Use the Figma design exactly.

Populate it with realistic information.

Show:

My requests
Open requests
Resolved requests
Recent requests
Request statuses
Priority
Dates

The user should be able to click a request and see its actual details.

11. Support Dashboard

Use the Figma design.

Show realistic incoming requests.

Allow:

Search
Filter
Open ticket
Assign
Change status

Every interaction must update the visible data.

12. Manager Dashboard

Use the Figma design.

Show realistic calculated data.

Include whatever charts/cards are present in Figma.

The values must come from the demo ticket dataset.

For example:

Requests by status

Requests by priority

Requests by category

Team workload

Do NOT use random numbers disconnected from the ticket data.

13. Authentication — Quick Demo Mode

I want to test the different roles quickly.

Therefore create demo accounts.

Example:

Employee

Email:
employee@helpdesk.demo

Password:
Demo123!

Role:
Employee

Support

Email:
support@helpdesk.demo

Password:
Demo123!

Role:
Support Staff

Manager

Email:
manager@helpdesk.demo

Password:
Demo123!

Role:
Manager

Product Operations

Email:
operations@helpdesk.demo

Password:
Demo123!

Role:
Product Operations

Engineer

Email:
engineer@helpdesk.demo

Password:
Demo123!

Role:
Engineer

Provide a convenient way in the development/demo environment to understand which account is being used.

Do not expose demo credentials in production.

14. Role-Based UI

The Figma design should adapt based on the logged-in role.

Employee

Show:

Dashboard
My Requests
Create Request
Support Staff

Show:

Dashboard
All Requests
Assigned Requests
Ticket management
Manager

Show:

Manager Dashboard
All Requests
Monitoring
Product Operations

Show appropriate workflow/configuration capabilities only where supported.

Engineer

Show relevant ticket/work visibility.

Do not show unauthorized actions.

15. REAL DATABASE AFTER DEMO MODE

After the UI is working with seed/demo data, implement the real persistence layer.

Use:

PostgreSQL

Prefer Supabase/PostgreSQL if it provides the cleanest Lovable integration.

The final application must store:

Users
Roles
Teams
Categories
Priorities
Statuses
Tickets
Assignments
Status history

The demo dataset should become database seed data.

16. Database Schema

Use:

users
id
name
email
password/auth reference
role_id
team_id
created_at
updated_at
roles
id
name
teams
id
name
description
is_active
categories
id
name
description
is_active
priorities
id
name
level
description
is_active
statuses
id
name
order
description
is_active
tickets
id
ticket_number
title
description
category_id
priority_id
status_id
created_by
assigned_team_id
assigned_user_id
created_at
updated_at
resolved_at
closed_at
ticket_status_history
id
ticket_id
old_status_id
new_status_id
changed_by
created_at
17. API / Data Layer

Create a clean API/data abstraction.

The frontend should communicate through a service/data layer instead of directly manipulating database objects everywhere.

For example:

getTickets()
getTicket(id)
createTicket(data)
updateTicket(id, data)
assignTicket(id, data)
changeTicketStatus(id, status)
searchTickets(query)
filterTickets(filters)
getDashboardStats()

Initially these functions can use the demo data store.

Then switch their implementation to the real backend/database.

The UI should not need to be rewritten.

18. IMPORTANT — DO NOT REDESIGN

The published Figma design is the source of truth.

If the design already contains:

Sidebar
Cards
Tables
Charts
Modals
Buttons
Forms
Request details
Dashboard sections

implement those components rather than creating alternative versions.

Only make small implementation adjustments when necessary for:

responsiveness
accessibility
actual data
functionality
19. Responsive Behavior

Preserve the Figma design on:

Desktop
Laptop
Tablet
Mobile

Do not sacrifice functionality on mobile.

Tables should become responsive cards where appropriate.

Filters should become a mobile drawer/sheet.

Forms should become single-column.

20. No Fake Buttons

Every visible action related to an implemented requirement must work.

Examples:

Create Request
→ creates request

Search
→ searches

Filter
→ filters

View
→ opens correct ticket

Assign
→ changes assignment

Change Status
→ updates status

Submit
→ persists/creates data

Logout
→ logs out

Do not leave buttons that only produce animations without functionality.

21. No Fake Dashboard Numbers

All dashboard numbers must be derived from ticket data.

If there are 20 tickets in the demo database, the dashboard must calculate from those 20 tickets.

If a ticket changes status, the dashboard should reflect the change.

22. Loading / Error / Empty States

Implement:

Loading skeleton
Button loading state
Form errors
API errors
Empty search results
Empty filters
Permission denied
Ticket not found
Successful creation
Successful assignment
Successful status update

Use the visual style already defined by Figma.

23. Keep V1 Lightweight

Do NOT add features outside the source requirements.

Do not implement:

AI
Chatbot
Internal chat
Notifications/reminders
Calendar
Scheduling
Personal notes
SaaS integrations
Voice/video
Social activity feeds
Reactions
Complex workflow automation

The goal is a simple internal support-ticketing workspace.

24. Development Strategy

Work in this exact order:

Step 1

Import/implement the published Figma design.

Step 2

Create reusable components matching the design.

Step 3

Create the demo data layer.

Step 4

Populate every screen with realistic fake data.

Step 5

Make search/filtering work.

Step 6

Make ticket creation work.

Step 7

Make ticket details work.

Step 8

Make assignment work.

Step 9

Make status changes work.

Step 10

Make dashboard statistics dynamic.

Step 11

Implement authentication and role switching.

Step 12

Connect the same data layer to PostgreSQL/backend.

Step 13

Replace demo persistence with real persistence.

Step 14

Test all roles and workflows.

Step 15

Fix responsive/accessibility issues.

25. Definition of "Done"

I should be able to open the Lovable preview and immediately see a fully populated HelpDesk Lite application.

I should be able to:

Login as an employee.
See realistic tickets.
Create a new request.
See it appear in the list.
Search for it.
Filter it.
Open its details.
Login as support staff.
Assign it.
Change its status.
See its progress change.
Login as manager.
See updated dashboard statistics.
Refresh the page.
See persisted data once the database layer is connected.

The application must look like the published Figma design, while behaving like a real HelpDesk system.

CRITICAL FINAL INSTRUCTION

Do not spend the first iteration building a backend while leaving the UI empty.

First make the published Figma design visually complete and populated with realistic fake data, then make those interactions functional, and then connect the same data structures to the real PostgreSQL/backend.

I want to be able to quickly preview and interact with the complete product before all production backend details are finalized.

Published Figma design = visual source of truth.

Demo data = immediate working preview.

PostgreSQL/backend = final persistent implementation.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://desk-help-lite.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ec3e71e2-a96e-4201-923c-b901ed8c9e76).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

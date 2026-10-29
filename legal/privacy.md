---
updated: 2026-10-29
description: What personal data hyperstructure collects on fctl.sh and app.fctl.sh, why, who receives it, how long it is kept, and your rights.
---

# Privacy policy

This policy explains what personal data
[hyperstructure](https://github.com/hyperstructure) ("we", "us")
collects when you visit [fctl.sh](https://fctl.sh) or use
[app.fctl.sh](https://app.fctl.sh), the fctl instance we run: why we collect
it, who else receives it, how long we keep it, and what you can do about it.

fctl is also open-source software that anyone can run. If you use an fctl
instance that someone else runs, its operator is responsible for your data
there, and this policy does not apply to it.

## The short version

- fctl.sh has no analytics, no advertising and no cookies.
- app.fctl.sh stores what it needs to run your factory: your account, the
  workspaces you are in, their projects and sessions (including the full
  transcript of what agents and people did in them, the notes agents keep
  for each project's later agents, the retrospectives they record of
  their work, review agents' reviews of pull requests and the schedules
  that start sessions on their own), and the machines you connect.
- Agents run on machines you control, with the Claude account you connect.
  Anthropic processes your prompts and code under your agreement with
  Anthropic, not ours.
- If your workspace connects Linear, we keep our app's access to your
  Linear workspace (encrypted), and who you are there once you link your
  Linear account. A ticket you delegate to fctl there goes to its agent,
  with its comments, and into the session's transcript.
- In projects that turn it on, agents publish screenshots for their pull
  requests on app.fctl.sh: anyone who has a screenshot's link can open it
  until it expires, after 30 days or what the project chooses between 24
  hours and 60 days.
- If you ask for early access, we keep your email address to invite you:
  until you have an account, you withdraw the request or a year passes.
- We don't sell personal data or use it for advertising, and we don't use
  your data or your code to train AI models.
- To get a copy of your data or delete it, sign in to app.fctl.sh and open
  Settings: **Export your data** downloads everything we keep about you, and
  **Delete account**, in the danger zone, deletes it.

## Who we are

[hyperstructure](https://github.com/hyperstructure) runs fctl.sh and
app.fctl.sh and is the controller of the personal data described here.

## What we collect

### When you visit fctl.sh

Cloudflare serves fctl.sh, its installer and its release downloads. Each
request arrives with your IP address, your browser's or client's user agent,
the address you asked for and the time. We use this only to deliver the site
and the downloads, to keep them secure and to fix problems. Our request logs
are kept for a few days.

fctl.sh sets no cookies, stores nothing in your browser and loads nothing
from other websites.

The install script and `fctl host` download releases from fctl.sh (a host
downloads each new one by itself, unless you turn that off), and
`fctl host` pulls the default sandbox image from GitHub's container
registry, ghcr.io (`fctl host image build` downloads the image's sources
from GitHub instead). It also pulls the images projects choose, from their
registries, and downloads a project's repository from GitHub to build the
image the project builds from it, when you allow that. Beyond that, the
`fctl` command talks only to the fctl instance you sign in to, and the
agents on your hosts to Anthropic and GitHub.

### When you use app.fctl.sh

app.fctl.sh is invitation-only: an admin adds your email address, or your
organization's email domain, to its allowlist. Each of your addresses is
invited on its own, and you can connect them to one account. Without an
account, you can ask for early access on its sign-in page.

- **Early access requests**, if you ask for early access: your email
  address, when you first and last asked, whether, when and by whom you
  were invited, and a hash of the token your browser keeps to withdraw the
  request. We keep nothing else about you for it, and use it only to
  invite you.
- **Your account**: your email addresses, which one is primary and when
  you connected each, first and last name, the name agents call you (if
  you choose one), profile picture (if you upload one, or link Google
  while you have none: then we keep a copy of your Google picture), the
  commit email you choose for each address (if you set one), role, a hash
  of your password (never the password itself), when you last signed in,
  and when you were last active (signed in or started a session yourself).
- **Workspaces**: for each, its name, address, color and avatar image (if
  an admin uploads one), whether it requires two-factor sign-in, and who
  created it and when. For each of its members, the email address they are
  in it as, their role, the Claude connection they use there, who added
  them when, and the order they put the workspace and its projects in. For
  each invitation to it, the invited address, its role, who invited them
  and when it expires. And the GitHub accounts it uses: the account's
  name, the GitHub App installation's ID, the repositories it is limited
  to, who connected it and the GitHub account they signed in to GitHub as.
  While an admin chooses what the workspace works in on a GitHub account,
  we keep what their GitHub sign-in showed them they may connect there:
  the account's name and type, the installation's ID, the names of those
  repositories, how many more they can see there, and the GitHub account
  they signed in as. Only they see it.
- **Two-factor sign-in**, if you turn it on or your admins require it: the
  secret your authenticator app makes codes from (encrypted), a hash of
  each recovery code and when it was used, when you set the app up and
  last signed in with it, how many wrong codes were entered in a row, and
  whether Google sign-ins ask you for a code. While a sign-in waits for its
  code, we keep who it is for and why it waits, and for a password reset
  a hash of the new password until the code checks out.
- **Passkeys**, if you add them: for each, its public key and credential
  ID (the private key stays on your device or with your password manager),
  the name you give it, which kind of authenticator made it (its AAGUID,
  which names providers such as 1Password or Apple Passwords), whether it
  syncs between your devices, how your browser reaches it (such as
  "internal" or "usb"), its signature counter, and when it was added and
  last used. To check a sign-in, or that it's you before a sensitive
  action, we keep each challenge a passkey signs for ten minutes.
- **Google sign-in**, if you link a Google account: its Google account ID,
  email address and whether that address is verified, name (with first and
  last name) and profile picture. We get no access to your other Google
  data.
- **Sign-in sessions and tokens**: for each browser session, CLI sign-in and
  access token, a hash of the token, its name, the user agent and IP address
  of the device that created it, when it was created and last used, and
  when it last confirmed it's you with a passkey or a code (a sign-in with
  one counts), which sensitive actions, such as deleting a project, take
  where app.fctl.sh asks for that; for an access token you limit, what it
  may do, the workspaces and projects it reaches and what the agents of its
  sessions may do on GitHub. A CLI sign-in request, and a CLI's request to
  confirm it's you in the browser, also record the device's IP address,
  approximate location (city and country, derived from the IP address) and
  user agent, so you can recognize it before you approve it.
- **Projects and sessions**: project names, descriptions and settings,
  the workspace they belong to, linked GitHub repositories, members and
  their roles, and the secrets you add (encrypted). For each session: its
  task, status, branch and pull requests (with their state, when it changed
  and how many of their checks passed, as GitHub says), what its agent may
  do on GitHub, who started it, with which access token if one did, and
  who it is shared with, and its transcript, which records everything the agent and
  the people in the session said and did, and the messages fctl sends the
  agent, such as a review agent's findings on a pull request it opened, or,
  where the project's follow-ups are on, what happened to its pull requests
  on GitHub: the comments that mention the agent, with their text, their
  link and their author's GitHub login and picture, failed checks,
  conflicts with the base branch and merges. Transcripts include the agent's
  tool calls and their results, so they can contain your source code, file
  contents and command output, and for a week, the images the agent read
  (PNG, JPEG, GIF or WebP, up to 5 MB each), such as the screenshots it
  took of your app. For each project you start sessions in, the
  model and effort level you asked for when you last started one, which
  its task boxes start on next time.
- **Review agents**, in projects whose owners turn them on: whether they
  are on, whose Claude account they run on, the model, effort level and
  instructions they review with, the repositories they skip, whether
  drafts get reviews, the GitHub Apps whose pull requests they review
  without being asked, whether they sum pull requests up in their
  descriptions, and who changed that and when; and for each review, its
  session, the pull request it reviews (its repository, number, title and
  link, and its author's GitHub login), the commit, how it went (how many
  findings it posted, marked fixed or left open, or why it stopped), the
  summary its agent put in the pull request's description (how risky it
  looked, why, what it does and what deserved a closer look), the link to
  the review it posted and its check on GitHub, and which of our two
  GitHub Apps posted them.
- **Schedules**: for each of a project's schedules, its name, the task its
  sessions start with, when it runs (a cron expression and a time zone, a
  time to run once, or only when asked), the model, effort level, branch
  and GitHub access its sessions start with, whose Claude account it runs
  on, who set it up and last changed it and when, and why it is paused
  when fctl paused it; and for each of its runs, when it was due and
  started, what started it (its time, a person, or another tool with
  someone's access token, and whose), and the session it started or why
  it started none. What a person or a tool sends with a run, such as an
  issue's text, goes into the first message of the run's session, and so
  into its transcript.
- **Project memory and retrospectives**, in projects that keep them (they
  are on unless a maintainer turns them off): the notes a project's agents
  and people write for its later agents, each with the session whose
  agent wrote it and the person who started that session, or the person
  who wrote it, who last changed it and when, and for a note marked stale,
  when, why and who marked it; and for each session, the retrospectives
  its agent records as it finishes a piece of work, and updates as later
  turns carry on with that work: how the work ended, what it worked on,
  the approach it took, what got in the way and what a future agent
  should know, and when the agent last updated each. They are what agents
  and people wrote, so they can mention your code and your project's tools
  and people. Each new session's agent in the project gets its current
  notes.
- **Notifications**, if you turn them on: for each browser you turn them
  on in, its push subscription (the address its push service delivers to,
  and the keys notifications are encrypted with), the browser's name, such
  as "Chrome on macOS", and when it was added and last notified; which
  sessions you follow; and what you want to be notified about. That browser
  keeps a note of which account turned them on, and the app's service
  worker shows them.
- **Your Claude connection**: the Claude credential you connect
  (encrypted), with the Claude account's email address and subscription
  type, and how much of the plan's usage limits is used, as your sessions
  last reported it: for each limit, the share used, when it resets and when
  it was reported. If you keep your Claude token on your own hosts
  instead, you don't give it to us: we keep only that you connected it
  that way, and that usage.
- **GitHub**: the repositories you link through our GitHub App, and the
  branches and pull requests agents create. Review agents post their
  reviews through our second app, fctl-review, where your GitHub account
  installed it, and through the first otherwise; to show a workspace
  where it is installed, we ask GitHub about its installations on the
  workspace's accounts and the repositories they reach, and keep none of
  it. We never sign you in to GitHub;
  agents work with short-lived tokens limited to their project's
  repositories, within the GitHub accounts its workspace uses. GitHub also
  tells us, through our app's webhook, when pull requests and their checks
  change in the repositories the app is installed on, and when people
  comment on pull requests there or review them. For the pull requests
  sessions list, we then ask GitHub about them and keep their title and
  state, when it changed, their latest commit and how many of their checks
  passed, failed or haven't finished. In projects whose review agents are
  on, we also start a review when a pull request in their repositories
  opens or gets a new commit (a draft's only once it's marked ready for
  review, where the owners chose so), if its author may write to the
  repository, or one of fctl's agents or of the GitHub Apps the project's
  owners chose opened it (others' when someone in the project asks for
  their review),
  and keep what the review needs (above). While the owners choose those
  apps, we ask GitHub which apps opened the newest pull requests in the
  project's repositories, and about the apps they name, and keep none of
  it. In
  projects whose follow-ups are on, a comment that mentions the agent on a
  pull request one of fctl's agents opened, by someone GitHub says may write
  to the repository (we ask it), goes to that agent's session, and so do
  the pull request's failed checks, its conflicts with its base branch and
  its merge (above). GitHub says nothing when a pull request starts to
  conflict, so after a pull request merges into a repository we ask GitHub
  about the other pull requests that sessions list in that repository, and
  keep, for a few minutes while GitHub works out its answer, which of them
  to ask about again. The rest of what GitHub sends us we don't keep.
- **Linear**, where a workspace connects a Linear workspace: its ID, name,
  address and logo, the ID of our app's user there, our app's access and
  refresh tokens (encrypted), when the access token expires, the
  permissions Linear granted it and whether it still works, and who
  installed it and when; and for each fctl workspace connected to it, who
  connected it and the Linear user they signed in to Linear as. If you link
  your Linear account: its Linear user ID, name, email address and avatar
  address, the Linear workspace's ID, name and address, and when you linked
  it. When someone delegates a ticket to fctl in Linear, or mentions fctl
  there, Linear tells us through our app's webhook: we keep which of
  Linear's agent sessions it is, the ticket's ID and key, the Linear user
  who started it, the fctl session it reaches and how it stands. While it
  waits for that person to link their Linear account, or to choose a
  project, or after it failed to start, we keep what Linear sent with it
  (the ticket with its title, description and comments, and the comment
  that mentioned fctl), for an hour at most; and a reply from someone fctl
  doesn't know yet, until they link their account, for an hour at most. A session started from a ticket keeps the ticket's key,
  title and link, and its transcript records the ticket as its agent got
  it: who delegated it, its title, description, state and labels, its
  comments as Linear gives them to agents, and the replies people write to
  the agent in Linear, with their author's name and picture. What agents
  read and write in their project's ticket tracker (tickets and their
  comments, in Linear or in GitHub Issues) is in their tool calls, and so
  in the transcript too. For an hour, we keep when each session's agent
  read, commented on, filed or changed tickets, to limit how often it
  may. The rest of what
  Linear sends us we don't keep.
- **Published screenshots**, in projects whose maintainers turn them on
  (they are off until an admin of app.fctl.sh allows them and a project
  turns them on): the images agents publish so that pull requests can show
  them (PNG, JPEG, GIF or WebP, up to 5 MB each), with their names, sizes,
  the session they come from and when they expire. They show whatever the
  agent captured, which can be your app, your code or your data.
- **Hosts**: for each machine you register, its name and hostname, its
  operating system, architecture, processors and memory, its fctl version
  and whether it updates fctl by itself, the sandbox image it uses and the
  images and repositories it allows, the workspaces it runs sessions for, a
  hash of its token, whether it keeps your Claude token and since when
  (never the token), and when it was last online.
- **Audit logs**: security-relevant actions, such as sign-ins, invitations,
  access changes and deletions, with who did them, when, and from which IP
  address, each comment fctl passes on to an agent, with its author's
  GitHub login and its link, and each session a Linear ticket starts, with
  the ticket's key. Each workspace has its own, for what happens
  in it, and app.fctl.sh one for the rest.
- **Request data**: as on fctl.sh. Your IP address is also used, briefly, to
  rate-limit sign-in attempts.

When email is enabled, we send invitations to app.fctl.sh and to
workspaces, and password-reset messages; tell you when your two-factor
sign-in is turned on, replaced, turned off or reset by an admin, when a
recovery code signs you in, when wrong codes follow your password, when a
passkey or a Google account is added to your account or an email address
connected to it, when a Claude subscription is connected to it, when
Google sign-ins stop asking you for a code, when your password is changed,
set or reset, and when an admin makes a password reset link for you. That means giving the
recipient's address and the message to our email provider.

### Cookies and browser storage

app.fctl.sh sets six cookies, all needed for it to work: `__Host-fctl`
keeps you signed in for 30 days, `__Host-fctl-oauth` protects a Google
sign-in for the 10 minutes it may take, `__Host-fctl-2fa` holds a
sign-in that waits for your two-factor code, for 10 minutes,
`__Host-fctl-github` protects the GitHub sign-in that connects a GitHub
account to a workspace, for the 10 minutes it may take, and
`__Host-fctl-github-install` holds which workspace you install our GitHub
App from, or give it more repositories from, so that GitHub's way back
leads there, for the hour it may take, and `__Host-fctl-linear` protects
the Linear sign-in that installs our app in a Linear workspace or links
your Linear account, for the 10 minutes it may take. Your theme
choice is stored in your browser, and so is a copy of the app's offline
page, which it shows when your device has no connection; neither contains
personal data. If you ask for early access, your browser keeps the address
you asked with, when, and the token that withdraws the request, so that the
page shows you are on the list, until you withdraw it or ask with another
address. Your browser also keeps which workspaces you fold in the
sidebar and the project you last started a session in, so that the app
opens as you left it. It keeps a copy of what the sidebar shows too, so
that the sidebar shows it as soon as the app opens: the names, colors and
avatar addresses of your workspaces and of those that invited you, your
role in each, and the names of their projects with how many sessions each
has going; signing out removes it. If you skip the notice that asks you
to update the fctl on your runners, your browser keeps the version you
skipped, so that the notice stays away until a newer one. The task you are writing on the
floor stays in your browser too, and so does the one you are writing on
each project's page, with the project, model, effort level
and GitHub access you chose for it and
the files you attach to it, until a session starts with it or you sign out,
so that leaving the page doesn't lose it. If you use passkeys, your browser keeps a short hash
of the name and email address the app last gave your password manager for
them, not the name or address themselves, so that it gives them again only
when they change. There are no analytics or advertising cookies.

## Why we use it

| Purpose | Legal basis (EU and UK law) |
|---|---|
| Running app.fctl.sh for you: signing you in, the workspaces you are in, running and showing sessions, sharing them with the people you choose, sending the notifications you turn on, crediting you in commits when you set a commit email, connecting your hosts, Claude, GitHub and Linear | Contract |
| Sending invitations and password resets | Contract, and our legitimate interest in letting admins invite people |
| Keeping your request for early access and inviting you | Contract: steps you ask for before one |
| Signing you in to GitHub when you connect a GitHub account to a workspace, to read which of its repositories you may give the workspace and let you choose from them | Legitimate interests: keeping each workspace to the repositories its admins may grant |
| Passing the comments people write to a project's agents on GitHub on to them, where its follow-ups are on, and asking GitHub whether their authors may write to the repository | Legitimate interests: letting the people a repository trusts direct its agents from GitHub, and nobody else |
| Signing you in to Linear when you link your Linear account, to know who you are there | Legitimate interests: starting the sessions of the tickets you delegate to fctl as you, and nobody else |
| Passing the tickets people delegate to fctl in Linear on to the agents of the project that takes them, with their comments and the replies people write there, and showing what the agents do in Linear | Contract, and our legitimate interest in letting the teams that connect Linear hand their tickets to agents |
| Telling you about changes to your two-factor sign-in and passkeys, and sign-ins with a recovery code | Legitimate interests: keeping your account secure |
| Keeping the services secure and working: rate limits, the audit log, request logs, fixing problems | Legitimate interests |
| Meeting legal obligations and enforcing our [terms](/terms) | Legal obligation, and legitimate interests |

We don't sell or rent personal data, use it for advertising or profiling, or
use your data or code to train AI models.

## Who else receives it

**Our service providers** process personal data on our behalf, under data
processing terms:

| Provider | What for | What they receive |
|---|---|---|
| Cloudflare, Inc. | Hosting fctl.sh and app.fctl.sh: servers, database, storage and logs | Everything app.fctl.sh stores, and request data |
| Resend, Inc. | Sending invitations, password resets, and notices about how you sign in, when email is enabled | The recipient's address and the message |

**Services you connect** receive data under their own privacy policies:

- **Google**, when you sign in with Google.
- **Your browser's push service**, when you turn on notifications: Google
  for Chrome and most browsers built on it, Mozilla for Firefox, Apple for
  Safari and Microsoft for Edge deliver them. Each notification is encrypted
  for your browser, so the push service learns when we send one, to which
  subscription and how big it is, but not what it says.
- **GitHub**, for the repositories you link: agents push branches and open
  pull requests there, and we ask GitHub what became of the pull requests
  sessions list. In projects whose review agents are on, our review app,
  fctl-review, posts their reviews on the pull requests where the account
  installed it, and our GitHub App elsewhere, with a check on each commit
  and a reaction, and where the project's owners turn it on, a summary at
  the end of each pull request's description, where everyone who can read
  the repository sees them. In
  projects whose follow-ups are on, our GitHub App reacts to each comment
  it passes on to an agent, which everyone who can read the repository
  sees too.
  If you set a commit email, the commits agents make
  in the sessions you start end with a `Co-authored-by` line that has your
  name and that address, unless the project's maintainers turn that off.
  Everyone who can read the repository sees it, which is everyone for a
  public repository, and GitHub uses it to link the commits to your GitHub
  account. When a workspace's admin connects a GitHub account, we send them
  to GitHub to sign in, and GitHub gives us a short-lived token that tells
  us which of the account's repositories they may give the workspace. We
  use it once to read that and then revoke it; we don't sign you in to
  GitHub or keep the token.
- **Linear**, where a workspace connects a Linear workspace: our app shows
  what agents do in the agent sessions of the tickets delegated to it
  (what they work on, their steps, their pull requests, their replies and
  questions), adds the session's link to the ticket, and moves a ticket on
  through its team's workflow as its session works (to In Progress, In
  Review and Done), as far as the project lets it. Through fctl, agents
  read, file, comment on and change the tickets their project takes from
  Linear, in our app's name.
  Everyone who can see a ticket in Linear sees what we post on it. When
  you link your Linear account, we send you to Linear to sign in, and
  Linear gives us a short-lived token that tells us who you are there. We
  use it once to read that and then revoke it; we don't keep it.
- **Anthropic**, which provides Claude. Claude Code runs on your hosts with
  the Claude account you connect, so Anthropic receives your prompts, the
  code the agent reads and the conversation, under your agreement with
  Anthropic. A session's agent is told the name of the person who started
  it (for a schedule's run, the person it runs for) and of everyone who
  writes to it, with what each of them asked agents to call them (or their
  first names), so these go to the Claude account the session runs on;
  fctl tells review agents nobody's name.
  If a session joins Remote Control, the conversation is also
  available in your Claude apps. A project's memory notes go into the
  prompts of its later sessions, on the Claude accounts of the people who
  start them. A project's review agents run on the Claude account of the
  owner who turned them on, or took them over: the pull requests they
  review go there, those of people who can't write to the repository, and
  of apps the project's owners didn't choose, only when someone in the
  project asks for their review. When one of fctl's agents opened
  the pull request, a review's findings also go to that agent's session,
  and so to the Claude account it runs on, as do the comments, failed
  checks, conflicts and merges that the project's follow-ups pass on to it. A
  schedule's task goes to the Claude account its sessions run on: its
  owner's, who set it up or took it over, when its time comes, or else the
  account of the person who runs it, or whose access token another tool
  runs it with. What is sent with a run, such as an issue's text, goes
  there too, whoever wrote it. A ticket delegated to fctl in Linear goes,
  with its comments and the replies people write to the agent there, to
  the Claude account of the person who delegated it, whoever wrote them.

**People you work with** see what you share with them: the members of a
workspace see its members, with the address each is in it as (not your
other addresses), and the Linear workspaces it works in, with who
connected each, and its admins also see who has two-factor sign-in, its
invitations and its audit log, with the IP addresses of what they did
themselves, not of what others did; members of a project see its sessions,
including transcripts and who took part, its memory and retrospectives,
with who wrote each note, and its schedules, with who set up and changed
each, whose Claude account it runs on and who or what started each of its
runs; and people you share a session with see that session. Admins of app.fctl.sh can see its users with all
their addresses and how many workspaces they are in, the addresses that
asked for early access with when they asked and who invited them, each
workspace's name, avatar, primary admin and size, the GitHub accounts
workspaces use,
and the audit log of app.fctl.sh, but not what is inside workspaces they
aren't members of. When a workspace's primary admin's account is
disabled, they see its members' names, to choose who runs it. Your
picture shows with your name, and anyone signed in to app.fctl.sh who has
its address, which holds your user ID, can load it.

**Anyone who has a published screenshot's link** can open it, without
signing in, until it expires: the people who can read the pull request
that shows it (everyone, for a public repository), anyone they pass the
link to, and GitHub, whose image proxy fetches the screenshot to show it in
the pull request. A link holds a long random token, so it can't be guessed,
and search engines are asked not to index the screenshots.

**Your hosts** are machines you control. Their sandboxes keep copies of your
repositories, the session's work and Claude's local files, and you are
responsible for them.

Profile pictures people upload, and the copies we keep of Google
pictures, load from app.fctl.sh. GitHub accounts' pictures, Google pictures
saved as an address before we kept copies, and profile pictures people gave
as an address on another site before they could upload them, load from the
servers they are on, which see the request from your browser.

We may disclose personal data when the law requires it, or when it is
necessary to protect the rights, property or safety of our users, others or
us. If hyperstructure is reorganized or acquired, personal data may pass to
the successor, which will be bound by this policy.

## Where data is processed

Cloudflare runs a global network: fctl.sh and app.fctl.sh are served from
data centers near you, and app.fctl.sh's database and storage are kept in
Cloudflare's data centers. Our providers may process data in the United
States and other countries. When personal data leaves the European Economic
Area, the UK or Switzerland, the transfer relies on an adequacy decision,
such as the EU–US Data Privacy Framework, or on standard contractual
clauses.

## How long we keep it

- **Your account**: until you delete it in Settings, or an admin deletes it.
  That deletes its email addresses, sign-in methods, devices and tokens,
  Claude connections, Linear accounts and memberships, the model and
  effort level you last
  asked for in each project, and the workspaces only you are in, with their
  projects, sessions and transcripts. Sessions you started in
  workspaces that others are in stay with their projects, shown as started
  by a deleted user: your name, email addresses and picture are removed
  from them. So do the notes you, or your sessions' agents, wrote in their
  projects' memories, without your name, and the schedules you set up or
  took over, which stop running on your Claude account.
- **Your other email addresses**: until you disconnect them in Settings or
  delete your account. Disconnecting one takes you out of the workspaces
  you are in as that address.
- **Your commit emails**: until you remove them in Settings or delete your
  account. Commits already made keep your name and the address: they are
  part of the repository's history, which the repository's owners control,
  not us.
- **Workspaces**: until their primary admin or an admin of app.fctl.sh
  deletes them, or their last member deletes their account. Deleting a
  workspace deletes its projects, as deleting each would, its avatar, its
  invitations and its audit log. Leaving a workspace, or being removed
  from it, deletes your membership, your roles in its projects and the
  model and effort level you last asked for in them.
  Invitations to workspaces expire after 30 days.
- **Projects and sessions**: until the project is deleted. Deleting a project
  deletes its sessions with their transcripts, normally right away and at
  the latest within a few hours. Archiving a session only hides it.
- **Project memory**: each note until someone who can edit the project
  deletes it, or the project is deleted. Marking a note stale keeps it.
- **Retrospectives**: as long as their session, until someone who manages
  the session deletes one or the project is deleted.
- **Review agents**: their settings as long as the project; each review,
  the summary it put in the pull request's description included, as long
  as its session, until the project is deleted. Reviews posted on GitHub,
  and summaries in pull requests' descriptions, stay there until someone
  edits or deletes them (GitHub keeps a description's earlier versions in
  its edit history), where the repository's owners control them.
- **Schedules**: until their owner or one of the project's maintainers or
  owners deletes them, or the project is deleted; each schedule's newest
  100 runs, as long as the schedule. Deleting a schedule leaves the
  sessions it started in their project.
- **Linear**: our app's tokens in a Linear workspace until no fctl
  workspace works in it any more, when we revoke them at Linear and delete
  them, within an hour at the latest, or until Linear tells us the app was
  uninstalled or refuses to renew them, when we delete them at once; an
  fctl workspace's connection to it until one of its admins disconnects
  it or the workspace is deleted; your Linear account until you unlink it
  in Settings or delete your account; what Linear sent with a delegation
  that waits, or a reply from someone fctl doesn't know yet, an hour at
  most; which of Linear's agent sessions reaches
  which session, as long as the session, and 30 days for one that started
  none.
- **Images agents read**: 7 days after the agent read them, when they are
  deleted, or sooner once their session has more than 1,000 of them or
  200 MB, its oldest first; deleting the project deletes them with its
  sessions. The transcript keeps saying what the agent read.
- **Published screenshots**: until they expire, 30 days after they are
  published unless the project chooses between 24 hours and 60 days; their
  links stop working then, and they are deleted within the hour. People who
  manage the session can delete one sooner, and deleting the project
  deletes them all. While the project or the instance has publishing
  turned off, their links don't work. Pull requests keep their links, which
  then show nothing.
- **Early access requests**: until you create your account (they are
  deleted within the hour), you withdraw your request or an admin removes
  it, and a year after you last asked at the latest.
- **What a GitHub sign-in showed an admin they may connect**: until they
  choose what the workspace works in there or turn it down, and 10 minutes
  at most; what ran out is deleted within an hour.
- **Sign-in sessions, tokens, password resets, CLI sign-in requests and
  invitations**: until they expire or are revoked; expired ones are deleted
  within an hour. Browser sessions expire after 30 days, and a sign-in
  waiting for its two-factor code after 10 minutes.
- **Two-factor sign-in**: until you turn it off, an admin resets it, or you
  delete your account. Getting new recovery codes deletes the old ones.
- **Passkeys**: until you remove them in Settings or delete your account,
  or an admin resets your two-factor sign-in where your instance requires
  it. The challenges they sign are deleted within an hour of expiring.
- **Claude plan usage**: the latest report of each limit, until a newer
  report replaces it or you remove the Claude connection.
- **Notifications**: a browser's push subscription until you turn
  notifications off there or remove the browser in Settings, sign out of it
  or its browser session expires, or its push service tells us it has
  expired. A notification waits about a minute at most before it goes out,
  and is not kept afterwards. The sessions you follow are kept until you
  unfollow them or they are deleted, and your notification settings until
  you delete your account.
- **Audit logs**: one year.
- **Request logs**: a few days.
- **Backups**: Cloudflare keeps the database and storage recoverable for up
  to 30 days, so deleted data is gone for good after that.

## Your rights

Depending on where you live, you have the right to access your personal
data, to correct it, to have it deleted, to receive it in a portable format,
to restrict or object to how we use it, and to withdraw consent where we
rely on it.

You use these rights yourself: sign in to app.fctl.sh and open Settings.

- **Get a copy**: under Your data, **Export your data** downloads everything
  we keep about you as one JSON file: your account and email addresses,
  sign-in methods, passkeys and two-factor sign-in (without its secrets),
  devices and tokens, Claude connections (without their secrets) and their
  plan usage, your Linear accounts, notification settings and browsers,
  the workspaces you are
  in and, from those open to you, the projects you are a member of, the
  notes you and your sessions' agents wrote in their memories, the
  sessions you started with their full transcripts and the sessions you
  follow, and your activity log. Sessions of workspaces you left stay with
  those workspaces.
- **Correct it**: change your name, the name agents call you and your
  picture under Profile, your email addresses and their commit emails
  under Email addresses, the workspaces you are in under Workspaces, what
  notifies you and in which browsers under Notifications, and your sign-in
  methods, passkeys, two-factor sign-in, Claude connections, Linear
  accounts, devices and tokens in their sections.
- **Delete it**: in the danger zone, **Delete account** lists what will be
  deleted and asks you to type your email address to confirm. It cannot be
  undone.

The `fctl` command does the same with `fctl account export` and
`fctl account delete`. If you can no longer sign in, ask the admin who
invited you for a password reset link.

If you asked for early access and have no account, withdraw your request
on [app.fctl.sh/early-access](https://app.fctl.sh/early-access), in the
browser you first asked from: **Withdraw** deletes it, and the browser
forgets your address.

If you are in the European Economic Area, the UK or Switzerland, you can
also complain to your data protection authority.

## Security

Passwords are hashed with argon2id, sign-in tokens and recovery codes are
stored only as hashes, authenticator app secrets, Claude credentials,
Linear tokens and project secrets are encrypted with AES-256-GCM, and
everything travels over
HTTPS. Your hosts never send us a Claude token you keep on them, only
whether they keep one. They also remove Claude tokens from what your
sessions send us wherever a token appears as it is, but an agent can still
be made to pass one on in another form, as it can anything it reads. For passkeys we keep only public keys. Two-factor sign-in, which you
can turn on in Settings, keeps a password alone from signing anyone in. [Security](/docs/security/) has the details.
No system is perfectly secure; if a breach affects your data, we will tell
you as the law requires.

## Children

fctl is made for software developers and is not meant for children. You
must be at least 16 to use app.fctl.sh.

## Changes to this policy

When our practices change, we update this page and the date at the top. For
significant changes, we tell people who use app.fctl.sh, in the app or by
email, before the changes take effect.

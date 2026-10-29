---
updated: 2026-10-29
description: What personal data fctl's maintainers collect on fctl.sh and app.fctl.sh, why, who receives it, how long it is kept, and your rights.
---

# Privacy policy

This policy covers [fctl.sh](https://fctl.sh) and
[app.fctl.sh](https://app.fctl.sh), the fctl instance that fctl's
maintainers run. It says what personal data we collect there, why, who else
receives it, how long we keep it, and what you can do about it.

fctl is also open-source software that anyone can run. If you
[run your own control plane](/docs/self-hosting/), you decide where its data
is kept and who receives it: none of the data it keeps comes to us (your
hosts still download releases from fctl.sh, below). If you use an instance
that someone else runs, its operator is responsible for your data there.
This policy doesn't apply to either.

## The short version

- **People run it, not a company.** fctl's maintainers run fctl.sh and
  app.fctl.sh ([Who we are](#who-we-are)).
- **fctl.sh** has no analytics, no advertising and no cookies.
- **app.fctl.sh** stores what it needs to run your factory: your account,
  the workspaces you are in, their projects and sessions, and the machines
  you connect. Agents run on those machines, not on ours. A session keeps
  a full transcript of what agents and people did in it, which can contain
  your code. Projects also keep their agents'
  notes and retrospectives, review agents' reviews of pull requests, and
  the schedules that start sessions on their own.
- **We don't train AI models on your data or your code, but Anthropic
  receives your code and messages.** That promise covers only us. Agents
  run Claude Code with someone's Claude account, so what they read and what
  people write to them go to Anthropic under that account's agreement with
  Anthropic, not ours. For example
  ([Anthropic](#services-you-connect) has the rest):
  - a session's work goes to the account of the person who started it, or
    for a schedule's run, usually its owner's, whoever wrote the messages
    in it;
  - review agents use the account of the project owner who turned them on
    or took them over;
  - a Linear ticket goes to the account of the person who delegated it,
    with its comments and the replies people write to the agent there,
    whoever wrote them.
- **Published screenshots are public links.** They are off by default: an
  admin of app.fctl.sh has to allow them and a project has to turn them on.
  Then anyone who has a screenshot's link can open it without signing in,
  until it expires: after 30 days, or what the project chooses between 24
  hours and 60 days. On a public repository's pull request, that means
  everyone. Screenshots can show your app, your
  code or your data.
- **Commit emails become public.** If you set a commit email, it goes into
  the `Co-authored-by` lines of the commits agents make in the sessions you
  start, unless the project turns that off. Everyone who can read the
  repository sees it, and it stays in the repository's history: removing it
  here doesn't change commits already made.
- **Linear**: if your workspace connects Linear, we keep our app's access to
  your Linear workspace (encrypted), and who you are there once you link
  your Linear account. A ticket you delegate to fctl there goes to its
  agent, with its comments, and into the session's transcript.
- **Early access**: if you ask for it, we keep your email address to invite
  you, until you have an account, you withdraw the request or a year
  passes.
- We don't sell personal data or use it for advertising.
- To get a copy of your data or delete it, sign in to app.fctl.sh and open
  Settings: **Export your data** downloads everything we keep about you, and
  **Delete account**, in the danger zone, deletes it.

## Who we are

fctl.sh and app.fctl.sh are run by fctl's maintainers: the people who
maintain fctl in the
[hyperstructure](https://github.com/hyperstructure) organization on GitHub.
hyperstructure is not a company, and no business runs these services.
Together, these people are the controller of the personal data described
here. "We" and "us" in this policy mean them.

## What we collect

### When you visit fctl.sh

Cloudflare serves fctl.sh, its installer and its release downloads. Each
request arrives with your IP address, your browser's or client's user agent,
the address you asked for and the time. We use this only to deliver the site
and the downloads, to keep them secure and to fix problems. Our request logs
are kept for a few days.

fctl.sh sets no cookies, stores nothing in your browser and loads nothing
from other websites.

The install script and `fctl host` download releases from fctl.sh. A host
downloads each new release by itself, unless you turn that off. `fctl host`
also downloads:

- the default sandbox image, from GitHub's container registry, ghcr.io
  (`fctl host image build` downloads the image's sources from GitHub
  instead);
- the images projects choose, from their registries;
- a project's repository, from GitHub, to build the image the project builds
  from it, when you allow that.

Beyond that, the `fctl` command talks only to the fctl instance you sign in
to, and the agents on your hosts to Anthropic and GitHub.

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
- **Your account**:
  - your email addresses, which one is primary and when you connected each;
  - your first and last name, and the name agents call you, if you choose
    one;
  - your profile picture, if you upload one. If you link Google while you
    have none, we keep a copy of your Google picture;
  - the commit email you choose for each address, if you set one;
  - your role, and a hash of your password (never the password itself);
  - when you last signed in, and when you were last active (signed in or
    started a session yourself).
- **Workspaces**:
  - for each workspace: its name, address, color and avatar image (if an
    admin uploads one), whether it requires two-factor sign-in, and who
    created it and when;
  - for each of its members: the email address they are in it as, their
    role, the Claude connection they use there, who added them and when,
    and the order they put the workspace and its projects in;
  - for each invitation to it: the invited address, its role, who invited
    them and when it expires;
  - for each GitHub account it uses: the account's name, the GitHub App
    installation's ID, the repositories it is limited to, who connected it,
    and the GitHub account they signed in to GitHub as;
  - while an admin chooses what the workspace works in on a GitHub account:
    what their GitHub sign-in showed them they may connect there. That is
    the account's name and type, the installation's ID, the names of those
    repositories, how many more they can see there, and the GitHub account
    they signed in as. Only they see it.
- **Two-factor sign-in**, if you turn it on or your admins require it:
  - the secret your authenticator app makes codes from (encrypted), when
    you set the app up and when you last signed in with it;
  - a hash of each recovery code, and when it was used;
  - how many wrong codes were entered in a row, and whether Google sign-ins
    ask you for a code;
  - while a sign-in waits for its code: who it is for and why it waits, and
    for a password reset, a hash of the new password until the code checks
    out.
- **Passkeys**, if you add them. For each: its public key and credential ID
  (the private key stays on your device or with your password manager), the
  name you give it, and which kind of authenticator made it (its AAGUID,
  which names providers such as 1Password or Apple Passwords). Also whether
  it syncs between your devices, how your browser reaches it (such as
  "internal" or "usb"), its signature counter, and when it was added and
  last used. To check a sign-in, or that it's you before a sensitive
  action, we keep each challenge a passkey signs for ten minutes.
- **Google sign-in**, if you link a Google account: its Google account ID,
  email address and whether that address is verified, name (with first and
  last name) and profile picture. We get no access to your other Google
  data.
- **Sign-in sessions and tokens**:
  - for each browser session, CLI sign-in and access token: a hash of the
    token, its name, the user agent and IP address of the device that
    created it, and when it was created and last used;
  - when it last confirmed it's you with a passkey or a code (a sign-in
    with one counts). Where app.fctl.sh asks for that, sensitive actions
    such as deleting a project need it;
  - for an access token you limit: what it may do, the workspaces and
    projects it reaches, and what the agents of its sessions may do on
    GitHub;
  - for a CLI sign-in request, or a CLI's request to confirm it's you in the
    browser: the device's IP address, approximate location (city and
    country, derived from the IP address) and user agent, so you can
    recognize it before you approve it.
- **Projects and sessions**:
  - for each project: its name, description and settings, the workspace it
    belongs to, its linked GitHub repositories, its members and their roles,
    and the secrets you add (encrypted);
  - for each session: its task, status and branch; who started it, and with
    which access token if one did; who it is shared with; what its agent
    may do on GitHub; and its pull requests, with their state, when it
    changed and how many of their checks passed, as GitHub says;
  - each session's transcript: everything the agent and the people in the
    session said and did, and the messages fctl sends the agent. Those
    include a review agent's findings on a pull request the agent opened.
    Where the project's follow-ups are on, they also include what happened
    to its pull requests on GitHub: failed checks, conflicts with the base
    branch, merges, and the comments that mention the agent, with their
    text, their link and their author's GitHub login and picture;
  - transcripts include the agent's tool calls and their results, so they
    can contain your source code, file contents and command output. For a
    week, they also keep the images the agent read (PNG, JPEG, GIF or WebP,
    up to 5 MB each), such as the screenshots it took of your app;
  - for each project you start sessions in: the model and effort level you
    asked for when you last started one, which its task boxes start on next
    time.
- **Review agents**, in projects whose owners turn them on:
  - their settings: whether they are on, whose Claude account they run on,
    the model, effort level and instructions they review with, the GitHub
    Apps whose pull requests they review without being asked, whether they
    sum pull requests up in their descriptions, and who changed that and
    when;
  - for each review: its session; the pull request it reviews (its
    repository, number, title and link, and its author's GitHub login) and
    the commit; how it went (how many findings it posted, marked fixed or
    left open, or why it stopped); the summary its agent put in the pull
    request's description (how risky it looked, why, what it does and what
    deserved a closer look); the links to the review it posted and its
    check on GitHub; and which of our two GitHub Apps posted them.
- **Schedules**:
  - for each of a project's schedules: its name and the task its sessions
    start with; when it runs (a cron expression and a time zone, a time to
    run once, or only when asked); the model, effort level, branch and
    GitHub access its sessions start with; whose Claude account it runs on;
    who set it up and last changed it, and when; and, when fctl paused it,
    why;
  - for each of its runs: when it was due and started; what started it (its
    time, a person, or another tool with someone's access token, and
    whose); and the session it started, or why it started none;
  - what a person or a tool sends with a run, such as an issue's text, goes
    into the first message of the run's session, and so into its
    transcript.
- **Project memory and retrospectives**, in projects that keep them (they
  are on unless a maintainer turns them off):
  - memory: the notes a project's agents and people write for its later
    agents. For each note: the session whose agent wrote it and the person
    who started that session, or the person who wrote it; who last changed
    it and when; and for a note marked stale, when, why and who marked it.
    Each new session's agent in the project gets its current notes;
  - retrospectives: for each session, what its agent records as it finishes
    a piece of work, and updates as later turns carry on with that work. That
    is how the work ended, what it worked on, the approach it took, what got
    in the way and what a future agent should know, and when the agent last
    updated each;
  - both are what agents and people wrote, so they can mention your code and
    your project's tools and people.
- **Notifications**, if you turn them on:
  - for each browser you turn them on in: its push subscription (the
    address its push service delivers to, and the keys notifications are
    encrypted with), the browser's name, such as "Chrome on macOS", and when
    it was added and last notified;
  - which sessions you follow, and what you want to be notified about;
  - that browser keeps a note of which account turned them on, and the
    app's service worker shows them.
- **Your Claude connection**: the Claude credential you connect (encrypted),
  with the Claude account's email address and subscription type. Also how
  much of the plan's usage limits is used, as your sessions last reported
  it: for each limit, the share used, when it resets and when it was
  reported. If you keep your Claude token on your own hosts instead, you
  don't give it to us: we keep only that you connected it that way, and
  that usage.
- **GitHub**: you never sign in to app.fctl.sh with GitHub. Agents work
  with our GitHub App's short-lived tokens,
  limited to their project's repositories, within the GitHub accounts its
  workspace uses. The only GitHub sign-in is an admin's, when they connect
  a GitHub account to a workspace (above).
  - We keep the repositories you link through our GitHub App, and the
    branches and pull requests agents create.
  - Through our app's webhook, GitHub tells us when pull requests and their
    checks change in the repositories the app is installed on, and when
    people comment on pull requests there or review them. For the pull
    requests sessions list, we then ask GitHub about them. We keep their
    title and state, when it changed, their latest commit, and how many of
    their checks passed, failed or haven't finished.
  - GitHub says nothing when a pull request starts to conflict. So after a
    pull request merges into a repository, we ask GitHub about the other
    pull requests that sessions list there. For a few minutes, while GitHub
    works out its answer, we keep which of them to ask about again.
  - Review agents post their reviews through our second app, fctl-review,
    where your GitHub account installed it, and through the first
    otherwise. To show a workspace where fctl-review is installed, we ask
    GitHub about its installations on the workspace's accounts and the
    repositories they reach, and keep none of it.
  - In projects whose review agents are on, we start a review when a pull
    request in their repositories opens or gets a new commit, if its author
    may write to the repository, or if one of fctl's agents, or one of the
    GitHub Apps the project's owners chose, opened it. Others get a review
    when someone in the project asks for one. We keep what the review needs
    (above). While the owners choose those apps, we ask GitHub which apps
    opened the newest pull requests in the project's repositories, and
    about the apps they name, and keep none of it.
  - In projects whose follow-ups are on, some of what happens to a pull
    request one of fctl's agents opened goes to that agent's session: a
    comment that mentions the agent, by someone GitHub says may write to the
    repository (we ask it), and the pull request's failed checks, its
    conflicts with its base branch and its merge.
  - The rest of what GitHub sends us we don't keep.
- **Linear**, where a workspace connects a Linear workspace:
  - our app there: the Linear workspace's ID, name, address and logo, the
    ID of our app's user there, our app's access and refresh tokens
    (encrypted), when the access token expires, the permissions Linear
    granted it and whether it still works, and who installed it and when.
    For each fctl workspace connected to it: who connected it and the
    Linear user they signed in to Linear as;
  - your Linear account, if you link it: its Linear user ID, name, email
    address and avatar address, the Linear workspace's ID, name and
    address, and when you linked it;
  - when someone delegates a ticket to fctl in Linear, or mentions fctl
    there, Linear tells us through our app's webhook. We keep which of
    Linear's agent sessions it is, the ticket's ID and key, the Linear user
    who started it, the fctl session it reaches and how it stands;
  - what Linear sent with it (the ticket with its title, description and
    comments, and the comment that mentioned fctl), for an hour at most,
    while it waits for that person to link their Linear account or to
    choose a project, or after it failed to start. A reply from someone fctl
    doesn't know yet waits the same way, until they link their account, for
    an hour at most;
  - a session started from a ticket keeps the ticket's key, title and link.
    Its transcript records the ticket as its agent got it: who delegated
    it, its title, description, state and labels, its comments as Linear
    gives them to agents, and the replies people write to the agent in
    Linear, with their author's name and picture;
  - what agents read and write in their project's ticket tracker (tickets
    and their comments, in Linear or in GitHub Issues) is in their tool
    calls, and so in the transcript too. For an hour, we keep when each
    session's agent read, commented on, filed or changed tickets, to limit
    how often it may;
  - the rest of what Linear sends us we don't keep.
- **Published screenshots**, in projects whose maintainers turn them on.
  They are off by default: an admin of app.fctl.sh has to allow them, and a
  project has to turn them on. We keep the images agents publish so that
  pull requests can show them (PNG, JPEG, GIF or WebP, up to 5 MB each),
  with their names, sizes, the session they come from and when they expire.
  They show whatever the agent captured, which can be your app, your code
  or your data, and their links are public
  ([Anyone who has a published screenshot's link](#anyone-with-a-screenshots-link)).
- **Hosts**: for each machine you register, its name and hostname, its
  operating system, architecture, processors and memory, and its fctl
  version and whether it updates fctl by itself. Also the sandbox image it
  uses and the images and repositories it allows, the workspaces it runs
  sessions for, a hash of its token, whether it keeps your Claude token and
  since when (never the token), and when it was last online.
- **Audit logs**: security-relevant actions, such as sign-ins, invitations,
  access changes and deletions, with who did them, when, and from which IP
  address. Also each comment fctl passes on to an agent, with its author's
  GitHub login and its link, and each session a Linear ticket starts, with
  the ticket's key. Each workspace has its own, for what happens in it, and
  app.fctl.sh one for the rest.
- **Request data**: as on fctl.sh. Your IP address is also used, briefly, to
  rate-limit sign-in attempts.

When email is enabled, we send the messages below. That means giving the
recipient's address and the message to our email provider.

- Invitations to app.fctl.sh and to workspaces, and password-reset messages.
- Notices when your two-factor sign-in is turned on, replaced, turned off or
  reset by an admin, when a recovery code signs you in, and when wrong codes
  follow your password.
- Notices when a passkey or a Google account is added to your account, an
  email address is connected to it, or a Claude subscription is connected to
  it.
- Notices when Google sign-ins stop asking you for a code, when your
  password is changed, set or reset, and when an admin makes a password
  reset link for you.

### Cookies and browser storage

app.fctl.sh sets six cookies, all needed for it to work:

| Cookie | What for | How long |
|---|---|---|
| `__Host-fctl` | Keeps you signed in | 30 days |
| `__Host-fctl-oauth` | Protects a Google sign-in | The 10 minutes it may take |
| `__Host-fctl-2fa` | Holds a sign-in that waits for your two-factor code | 10 minutes |
| `__Host-fctl-github` | Protects the GitHub sign-in that connects a GitHub account to a workspace | The 10 minutes it may take |
| `__Host-fctl-github-install` | Holds which workspace you install our GitHub App from, or give it more repositories from, so that GitHub's way back leads there | The hour it may take |
| `__Host-fctl-linear` | Protects the Linear sign-in that installs our app in a Linear workspace or links your Linear account | The 10 minutes it may take |

Your browser also keeps:

- your theme choice, and a copy of the app's offline page, which it shows
  when your device has no connection. Neither contains personal data;
- if you ask for early access: the address you asked with, when, and the
  token that withdraws the request, so that the page shows you are on the
  list, until you withdraw it or ask with another address;
- which workspaces you fold in the sidebar, and the project you last started
  a session in, so that the app opens as you left it;
- a copy of what the sidebar shows, so that it shows it as soon as the app
  opens: the names, colors and avatar addresses of your workspaces and of
  those that invited you, your role in each, and the names of their projects
  with how many sessions each has going. Signing out removes it;
- if you skip the notice that asks you to update the fctl on your runners:
  the version you skipped, so that the notice stays away until a newer one;
- the task you are writing on the floor, and the one you are writing on each
  project's page, with the project, model, effort level and GitHub access
  you chose for it and the files you attach to it, until a session starts
  with it or you sign out, so that leaving the page doesn't lose it;
- if you use passkeys: a short hash of the name and email address the app
  last gave your password manager for them (not the name or address
  themselves), so that it gives them again only when they change.

There are no analytics or advertising cookies.

## Why we use it

| Purpose | Legal basis (EU and UK law) |
|---|---|
| Running app.fctl.sh for you: signing you in, the workspaces you are in, running and showing sessions, sharing them with the people you choose, sending the notifications you turn on, crediting you in commits when you set a commit email, connecting your hosts, Claude, GitHub and Linear | Contract |
| Sending invitations and password resets | Contract, and our legitimate interest in letting admins invite people |
| Keeping your request for early access and inviting you | Contract: steps you ask for before one |
| Asking an admin to sign in to GitHub when they connect a GitHub account to a workspace, to read which of its repositories they may give the workspace and let them choose from them | Legitimate interests: keeping each workspace to the repositories its admins may grant |
| Passing the comments people write to a project's agents on GitHub on to them, where its follow-ups are on, and asking GitHub whether their authors may write to the repository | Legitimate interests: letting the people a repository trusts direct its agents from GitHub, and nobody else |
| Asking you to sign in to Linear when you link your Linear account, to know who you are there | Legitimate interests: starting the sessions of the tickets you delegate to fctl as you, and nobody else |
| Passing the tickets people delegate to fctl in Linear on to the agents of the project that takes them, with their comments and the replies people write there, and showing what the agents do in Linear | Contract, and our legitimate interest in letting the teams that connect Linear hand their tickets to agents |
| Telling you about changes to your two-factor sign-in and passkeys, and sign-ins with a recovery code | Legitimate interests: keeping your account secure |
| Keeping the services secure and working: rate limits, the audit log, request logs, fixing problems | Legitimate interests |
| Meeting legal obligations and enforcing our [terms](/terms) | Legal obligation, and legitimate interests |

We don't sell or rent personal data, or use it for advertising or profiling.
We don't use your data or code to train AI models. What Anthropic does with
what it receives through a Claude account is up to that account's agreement
with Anthropic ([Anthropic](#services-you-connect)).

## Who else receives it

### Our service providers

They process personal data on our behalf, under data processing terms:

| Provider | What for | What they receive |
|---|---|---|
| Cloudflare, Inc. | Hosting fctl.sh and app.fctl.sh: servers, database, storage and logs | Everything app.fctl.sh stores, and request data |
| Resend, Inc. | Sending invitations, password resets, and notices about how you sign in, when email is enabled | The recipient's address and the message |

### Services you connect

They receive data under their own privacy policies.

- **Anthropic**, which provides Claude. Claude Code runs on hosts with a
  Claude account that someone connected. Anthropic receives the prompts,
  the code the agent reads and the conversation, under that account's
  agreement with Anthropic, not ours. Our promise not to train AI models on
  your data doesn't cover Anthropic: that account's agreement and settings
  do. Whose account it is:
  - **Sessions**: the account of the person who started the session,
    whoever wrote the messages in it. A schedule's runs follow the
    schedule's rule, below. If a session joins Remote Control,
    the conversation is also available in that account's Claude apps.
  - **Review agents**: the account of the project owner who turned them on,
    or took them over. The pull requests they review go there. Those of
    people who can't write to the repository, and of apps the project's
    owners didn't choose, go there only when someone in the project asks
    for their review.
  - **Linear tickets**: the account of the person who delegated the ticket.
    Its comments, and the replies people write to the agent there, go there
    too, whoever wrote them.
  - **Schedules**: a schedule's task goes to the account of its owner (who
    set it up or took it over) when its time comes; otherwise to the
    account of the person who runs it, or whose access token another tool
    runs it with. What is sent with a run, such as an issue's text, goes
    there too, whoever wrote it.
  - **Project memory**: a project's notes go into the prompts of its later
    sessions, on the accounts of the people who start them.
  - **Follow-ups**: when one of fctl's agents opened a pull request, a
    review's findings on it go to that agent's session, and so to the
    account it runs on. So do the comments, failed checks, conflicts and
    merges that the project's follow-ups pass on to it.
  - **Names**: a session's agent is told the name of the person who started
    it (for a schedule's run, the person it runs for) and of everyone who
    writes to it, with what each of them asked agents to call them (or
    their first names). These go to the account the session runs on. fctl
    tells review agents nobody's name.
- **GitHub**, for the repositories you link. Everyone who can read a
  repository sees what we post there, which is everyone for a public one.
  - Agents push branches and open pull requests there, and we ask GitHub
    what became of the pull requests sessions list.
  - In projects whose review agents are on, they post reviews on pull
    requests, with a check on each commit and a reaction. Where the
    project's owners turn it on, they also put a summary at the end of each
    pull request's description. Our review app, fctl-review, posts them
    where the repository's GitHub account installed it, and our GitHub App
    elsewhere.
  - In projects whose follow-ups are on, our GitHub App reacts to each
    comment it passes on to an agent.
  - **Commit emails are public.** If you set a commit email, the commits
    agents make in the sessions you start end with a `Co-authored-by` line
    that has your name and that address, unless the project's maintainers
    turn that off. Everyone who can read the repository sees it, and GitHub
    uses it to link the commits to your GitHub account. The line is part of
    the repository's history: removing your commit email stops new lines,
    but commits already made keep it.
  - When a workspace's admin connects a GitHub account, we send them to
    GitHub to sign in, and GitHub gives us a short-lived token that tells us
    which of the account's repositories they may give the workspace. We use
    it once to read that and then revoke it. It doesn't sign anyone in to
    app.fctl.sh, and we don't keep it.
- **Linear**, where a workspace connects a Linear workspace. Everyone who
  can see a ticket in Linear sees what we post on it.
  - Our app shows what agents do in the agent sessions of the tickets
    delegated to it: what they work on, their steps, their pull requests,
    their replies and questions. It adds the session's link to the ticket.
  - It moves a ticket on through its team's workflow as its session works
    (to In Progress, In Review and Done), as far as the project lets it.
  - Through fctl, agents read, file, comment on and change the tickets their
    project takes from Linear, in our app's name.
  - When you link your Linear account, we send you to Linear to sign in, and
    Linear gives us a short-lived token that tells us who you are there. We
    use it once to read that and then revoke it; we don't keep it.
- **Google**, when you sign in with Google.
- **Your browser's push service**, when you turn on notifications: Google
  for Chrome and most browsers built on it, Mozilla for Firefox, Apple for
  Safari and Microsoft for Edge deliver them. Each notification is encrypted
  for your browser, so the push service learns when we send one, to which
  subscription and how big it is, but not what it says.

### People you work with

They see what you share with them.

- **Members of a workspace** see its members, with the address each is in it
  as (not your other addresses), and the Linear workspaces it works in, with
  who connected each.
- **A workspace's admins** also see who has two-factor sign-in, its
  invitations and its audit log, with the IP addresses of what they did
  themselves, not of what others did.
- **Members of a project** see its sessions, including transcripts and who
  took part; its memory and retrospectives, with who wrote each note; and
  its schedules, with who set up and changed each, whose Claude account it
  runs on and who or what started each of its runs.
- **People you share a session with** see that session.
- **Admins of app.fctl.sh** see its users, with all their addresses and how
  many workspaces they are in; the addresses that asked for early access,
  with when they asked and who invited them; each workspace's name, avatar,
  primary admin and size; the GitHub accounts workspaces use; and the audit
  log of app.fctl.sh. They don't see what is inside workspaces they aren't
  members of. When a workspace's primary admin's account is disabled, they
  see its members' names, to choose who runs it.
- **Anyone signed in to app.fctl.sh** who has your picture's address, which
  holds your user ID, can load it. Your picture shows with your name.

### Anyone with a screenshot's link

Anyone who has a published screenshot's link can open it, without signing
in, until it expires: 30 days after it is published, or what the project
chooses between 24 hours and 60 days. That includes the people who can read
the pull request that shows it (everyone, for a public repository), anyone
they pass the link to, and GitHub, whose image proxy fetches the screenshot
to show it in the pull request. A link holds a long random token, so it
can't be guessed, and search engines are asked not to index the
screenshots.

### Your hosts

Your hosts are machines you control. Their sandboxes keep copies of your
repositories, the session's work and Claude's local files, and you are
responsible for them.

### Pictures from other sites

Profile pictures people upload, and the copies we keep of Google pictures,
load from app.fctl.sh. Other pictures load from the servers they are on,
which see the request from your browser: GitHub accounts' pictures, Google
pictures saved as an address before we kept copies, and profile pictures
people gave as an address on another site before they could upload them.

### Disclosures and transfers

We may disclose personal data when the law requires it, or when it is
necessary to protect the rights, property or safety of our users, others or
us. If other people take over running app.fctl.sh, personal data may pass
to them, and they will be bound by this policy.

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
  - That deletes its email addresses, sign-in methods, devices and tokens,
    Claude connections, Linear accounts and memberships, the model and
    effort level you last asked for in each project, and the workspaces only
    you are in, with their projects, sessions and transcripts.
  - Sessions you started in workspaces that others are in stay with their
    projects, shown as started by a deleted user: your name, email
    addresses and picture are removed from them.
  - The notes you, or your sessions' agents, wrote in their projects'
    memories stay too, without your name, and so do the schedules you set
    up or took over, which stop running on your Claude account.
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
  model and effort level you last asked for in them. Invitations to
  workspaces expire after 30 days.
- **Projects and sessions**: until the project is deleted. Deleting a project
  deletes its sessions with their transcripts, normally right away and at
  the latest within a few hours. Archiving a session only hides it.
- **Project memory**: each note until someone who can edit the project
  deletes it, or the project is deleted. Marking a note stale keeps it.
- **Retrospectives**: as long as their session, until someone who manages
  the session deletes one or the project is deleted.
- **Review agents**: their settings as long as the project. Each review,
  with the summary it put in the pull request's description, as long as its
  session, until the project is deleted. Reviews posted on GitHub, and
  summaries in pull requests' descriptions, stay there until someone edits
  or deletes them (GitHub keeps a description's earlier versions in its edit
  history), where the repository's owners control them.
- **Schedules**: until their owner or one of the project's maintainers or
  owners deletes them, or the project is deleted. Each schedule's newest 100
  runs, as long as the schedule. Deleting a schedule leaves the sessions it
  started in their project.
- **Linear**:
  - our app's tokens in a Linear workspace: until no fctl workspace works in
    it any more, when we revoke them at Linear and delete them, within an
    hour at the latest; or until Linear tells us the app was uninstalled or
    refuses to renew them, when we delete them at once;
  - an fctl workspace's connection to it: until one of its admins
    disconnects it or the workspace is deleted;
  - your Linear account: until you unlink it in Settings or delete your
    account;
  - what Linear sent with a delegation that waits, or a reply from someone
    fctl doesn't know yet: an hour at most;
  - which of Linear's agent sessions reaches which session: as long as the
    session, and 30 days for one that started none.
- **Images agents read**: 7 days after the agent read them, when they are
  deleted, or sooner once their session has more than 1,000 of them or
  200 MB, its oldest first. Deleting the project deletes them with its
  sessions. The transcript keeps saying what the agent read.
- **Published screenshots**: until they expire, 30 days after they are
  published unless the project chooses between 24 hours and 60 days. Their
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
  at most. What ran out is deleted within an hour.
- **Sign-in sessions, tokens, password resets, CLI sign-in requests and
  invitations**: until they expire or are revoked. Expired ones are deleted
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
and to restrict or object to how we use it.

You use these rights yourself: sign in to app.fctl.sh and open Settings.

- **Get a copy**: under Your data, **Export your data** downloads everything
  we keep about you as one JSON file. That is your account and email
  addresses, sign-in methods, passkeys and two-factor sign-in (without its
  secrets), devices and tokens, Claude connections (without their secrets)
  and their plan usage, your Linear accounts, notification settings and
  browsers, and the workspaces you are in. From the workspaces open to you,
  it also has the projects you are a member of, the notes you and your sessions'
  agents wrote in their memories, the sessions you started with their full
  transcripts, the sessions you follow, and your activity log. Sessions of
  workspaces you left stay with those workspaces.
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

Passwords are hashed with argon2id, and sign-in tokens and recovery codes
are stored only as hashes. Authenticator app secrets, Claude credentials,
Linear tokens and project secrets are encrypted with AES-256-GCM, and
everything travels over HTTPS. For passkeys we keep only public keys.

Your hosts never send us a Claude token you keep on them, only whether they
keep one. They also remove Claude tokens from what your sessions send us
wherever a token appears as it is, but an agent can still be made to pass
one on in another form, as it can anything it reads.

Two-factor sign-in, which you can turn on in Settings, keeps a password
alone from signing anyone in. [Security](/docs/security/) has the details.
No system is perfectly secure; if a breach affects your data, we will tell
you as the law requires.

## Children

fctl is made for software developers and is not meant for children. You
must be at least 16 to use app.fctl.sh.

## Changes to this policy

When our practices change, we update this page and the date at the top. For
significant changes, we tell people who use app.fctl.sh, in the app or by
email, before the changes take effect.

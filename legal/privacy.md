---
updated: 2026-10-22
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
  for each project's later agents and the retrospectives they record of
  their work), and the machines you connect.
- Agents run on machines you control, with the Claude account you connect.
  Anthropic processes your prompts and code under your agreement with
  Anthropic, not ours.
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

The install script and `fctl host` download releases from fctl.sh, and
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
  you connected each, first and last name, profile picture (if you add one
  or link Google), the commit email you choose for each address (if you set
  one), role, a hash of your password (never the password itself), and when
  you last signed in.
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
  last used. To check a sign-in, we keep each challenge a passkey signs
  for ten minutes.
- **Google sign-in**, if you link a Google account: its Google account ID,
  email address and whether that address is verified, name (with first and
  last name) and profile picture. We get no access to your other Google
  data.
- **Sign-in sessions and tokens**: for each browser session, CLI sign-in and
  access token, a hash of the token, its name, the user agent and IP address
  of the device that created it, and when it was created and last used. A
  CLI sign-in request also records the device's IP address, approximate
  location (city and country, derived from the IP address) and user agent,
  so you can recognize it before you approve it.
- **Projects and sessions**: project names, descriptions and settings,
  the workspace they belong to, linked GitHub repositories, members and
  their roles, and the secrets you add (encrypted). For each session: its
  task, status, branch and pull requests (with their state, when it changed
  and how many of their checks passed, as GitHub says), who started it and
  who it is shared with, and its transcript, which records everything the agent and
  the people in the session said and did. Transcripts include the agent's
  tool calls and their results, so they can contain your source code, file
  contents and command output. For each project you start sessions in, the
  model and effort level you asked for when you last started one, which
  its task boxes start on next time.
- **Project memory and retrospectives**, in projects that keep them (they
  are on unless a maintainer turns them off): the notes a project's agents
  and people write for its later agents, each with the session whose
  agent wrote it and the person who started that session, or the person
  who wrote it, who last changed it and when, and for a note marked stale,
  when, why and who marked it; and for each session, the retrospectives
  its agent records as it finishes a piece of work: how the work ended,
  what it worked on, the approach it took, what got in the way and what a
  future agent should know. They are what agents and people wrote, so they
  can mention your code and your project's tools and people. Each new
  session's agent in the project gets its current notes.
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
  it was reported.
- **GitHub**: the repositories you link through our GitHub App, and the
  branches and pull requests agents create. We never sign you in to GitHub;
  agents work with short-lived tokens limited to their project's
  repositories, within the GitHub accounts its workspace uses. GitHub also
  tells us, through our app's webhook, when pull requests and their checks
  change in the repositories the app is installed on. For the pull requests
  sessions list, we then ask GitHub about them and keep their title and
  state, when it changed, their latest commit and how many of their checks
  passed, failed or haven't finished; the rest of what GitHub sends us we
  don't keep.
- **Published screenshots**, in projects whose maintainers turn them on
  (they are off until an admin of app.fctl.sh allows them and a project
  turns them on): the images agents publish so that pull requests can show
  them (PNG, JPEG, GIF or WebP, up to 5 MB each), with their names, sizes,
  the session they come from and when they expire. They show whatever the
  agent captured, which can be your app, your code or your data.
- **Hosts**: for each machine you register, its name and hostname, its
  operating system, architecture, processors and memory, its fctl version,
  the sandbox image it uses and the images and repositories it allows, the
  workspaces it runs sessions for, a hash of its token, and when it was
  last online.
- **Audit logs**: security-relevant actions, such as sign-ins, invitations,
  access changes and deletions, with who did them, when, and from which IP
  address. Each workspace has its own, for what happens in it, and
  app.fctl.sh one for the rest.
- **Request data**: as on fctl.sh. Your IP address is also used, briefly, to
  rate-limit sign-in attempts.

When email is enabled, we send invitations to app.fctl.sh and to
workspaces, and password-reset messages; tell you when your two-factor
sign-in is turned on, replaced, turned off or reset by an admin, when a
recovery code signs you in, when wrong codes follow your password, when a
passkey or a Google account is added to your account or an email address
connected to it, when your password is changed, set or reset, and when an
admin makes a password reset link for you. That means giving the
recipient's address and the message to our email provider.

### Cookies and browser storage

app.fctl.sh sets five cookies, all needed for it to work: `__Host-fctl`
keeps you signed in for 30 days, `__Host-fctl-oauth` protects a Google
sign-in for the 10 minutes it may take, `__Host-fctl-2fa` holds a
sign-in that waits for your two-factor code, for 10 minutes,
`__Host-fctl-github` protects the GitHub sign-in that connects a GitHub
account to a workspace, for the 10 minutes it may take, and
`__Host-fctl-github-install` holds which workspace you install our GitHub
App from, or give it more repositories from, so that GitHub's way back
leads there, for the hour it may take. Your theme
choice is stored in your browser, and so is a copy of the app's offline
page, which it shows when your device has no connection; neither contains
personal data. If you ask for early access, your browser keeps the address
you asked with, when, and the token that withdraws the request, so that the
page shows you are on the list, until you withdraw it or ask with another
address. Your browser also keeps which workspaces you fold in the
sidebar and the project you last started a session in, so that the app
opens as you left it. If you skip the notice that asks you to update the
fctl on your runners, your browser keeps the version you skipped, so that
the notice stays away until a newer one. The task you are writing on the
floor stays in your browser too, with the project, model and effort level
you chose for it and
the files you attach to it, until a session starts with it or you sign out,
so that leaving the page doesn't lose it. If you use passkeys, your browser keeps a short hash
of the name and email address the app last gave your password manager for
them, not the name or address themselves, so that it gives them again only
when they change. There are no analytics or advertising cookies.

## Why we use it

| Purpose | Legal basis (EU and UK law) |
|---|---|
| Running app.fctl.sh for you: signing you in, the workspaces you are in, running and showing sessions, sharing them with the people you choose, sending the notifications you turn on, crediting you in commits when you set a commit email, connecting your hosts, Claude and GitHub | Contract |
| Sending invitations and password resets | Contract, and our legitimate interest in letting admins invite people |
| Keeping your request for early access and inviting you | Contract: steps you ask for before one |
| Signing you in to GitHub when you connect a GitHub account to a workspace, to read which of its repositories you may give the workspace and let you choose from them | Legitimate interests: keeping each workspace to the repositories its admins may grant |
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
  sessions list. If you set a commit email, the commits agents make
  in the sessions you start end with a `Co-authored-by` line that has your
  name and that address, unless the project's maintainers turn that off.
  Everyone who can read the repository sees it, which is everyone for a
  public repository, and GitHub uses it to link the commits to your GitHub
  account. When a workspace's admin connects a GitHub account, we send them
  to GitHub to sign in, and GitHub gives us a short-lived token that tells
  us which of the account's repositories they may give the workspace. We
  use it once to read that and then revoke it; we don't sign you in to
  GitHub or keep the token.
- **Anthropic**, which provides Claude. Claude Code runs on your hosts with
  the Claude account you connect, so Anthropic receives your prompts, the
  code the agent reads and the conversation, under your agreement with
  Anthropic. If a session joins Remote Control, the conversation is also
  available in your Claude apps. A project's memory notes go into the
  prompts of its later sessions, on the Claude accounts of the people who
  start them.

**People you work with** see what you share with them: the members of a
workspace see its members, with the address each is in it as (not your
other addresses), and its admins also see who has two-factor sign-in, its
invitations and its audit log; members of a project see its sessions,
including transcripts and who took part, and its memory and
retrospectives, with who wrote each note; and people you share a session
with see that session. Admins of app.fctl.sh can see its users with all
their addresses and how many workspaces they are in, the addresses that
asked for early access with when they asked and who invited them, each
workspace's name, avatar, primary admin and size, the GitHub accounts
workspaces use,
and the audit log of app.fctl.sh, but not what is inside workspaces they
aren't members of. When a workspace's primary admin's account is
disabled, they see its members' names, to choose who runs it.

**Anyone who has a published screenshot's link** can open it, without
signing in, until it expires: the people who can read the pull request
that shows it (everyone, for a public repository), anyone they pass the
link to, and GitHub, whose image proxy fetches the screenshot to show it in
the pull request. A link holds a long random token, so it can't be guessed,
and search engines are asked not to index the screenshots.

**Your hosts** are machines you control. Their sandboxes keep copies of your
repositories, the session's work and Claude's local files, and you are
responsible for them.

Profile pictures from Google or GitHub load from their servers, which see
the request from your browser.

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
  Claude connections and memberships, the model and effort level you last
  asked for in each project, and the workspaces only you are in, with their
  projects, sessions and transcripts. Sessions you started in
  workspaces that others are in stay with their projects, shown as started
  by a deleted user: your name, email addresses and picture are removed
  from them. So do the notes you, or your sessions' agents, wrote in their
  projects' memories, without your name.
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
  plan usage, notification settings and browsers, the workspaces you are
  in and, from those open to you, the projects you are a member of, the
  notes you and your sessions' agents wrote in their memories, the
  sessions you started with their full transcripts and the sessions you
  follow, and your activity log. Sessions of workspaces you left stay with
  those workspaces.
- **Correct it**: change your name and picture under Profile, your email
  addresses and their commit emails under Email addresses, the workspaces
  you are in under Workspaces, what notifies you and in which browsers
  under Notifications, and your sign-in methods, passkeys, two-factor
  sign-in, Claude connections, devices and tokens in their sections.
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
stored only as hashes, authenticator app secrets, Claude credentials and
project secrets are encrypted with AES-256-GCM, and everything travels over
HTTPS. For passkeys we keep only public keys. Two-factor sign-in, which you
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

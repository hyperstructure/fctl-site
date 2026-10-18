---
updated: 2026-10-18
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
- app.fctl.sh stores what it needs to run your factory: your account, your
  projects and sessions (including the full transcript of what agents and
  people did in them), and the machines you connect.
- Agents run on machines you control, with the Claude account you connect.
  Anthropic processes your prompts and code under your agreement with
  Anthropic, not ours.
- In projects that turn it on, agents publish screenshots for their pull
  requests on app.fctl.sh: anyone who has a screenshot's link can open it
  until it expires, after 30 days or what the project chooses between 24
  hours and 60 days.
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
from GitHub instead). Beyond that, the `fctl` command talks only to the
fctl instance you sign in to, and the agents on your hosts to Anthropic and
GitHub.

### When you use app.fctl.sh

app.fctl.sh is invitation-only: an admin adds your email address, or your
organization's email domain, to its allowlist.

- **Your account**: your email address, first and last name, profile
  picture (if you add one or link Google), the commit email you choose (if
  you set one), role, a hash of your password (never the password itself),
  and when you last signed in.
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
  linked GitHub repositories, members and their roles, and the secrets you
  add (encrypted). For each session: its task, status, branch and pull
  request, who started it and who it is shared with, and its transcript,
  which records everything the agent and the people in the session said and
  did. Transcripts include the agent's tool calls and their results, so they
  can contain your source code, file contents and command output.
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
  agents work with short-lived tokens limited to one repository per session.
- **Published screenshots**, in projects whose maintainers turn them on
  (they are off until an admin of app.fctl.sh allows them and a project
  turns them on): the images agents publish so that pull requests can show
  them (PNG, JPEG, GIF or WebP, up to 5 MB each), with their names, sizes,
  the session they come from and when they expire. They show whatever the
  agent captured, which can be your app, your code or your data.
- **Hosts**: for each machine you register, its name and hostname, its
  operating system, architecture, processors and memory, its fctl version, a
  hash of its token, and when it was last online.
- **Audit log**: security-relevant actions, such as sign-ins, invitations,
  access changes and deletions, with who did them, when, and from which IP
  address.
- **Request data**: as on fctl.sh. Your IP address is also used, briefly, to
  rate-limit sign-in attempts.

When email is enabled, we send invitations and password-reset messages,
which means giving the recipient's address and the message to our email
provider.

### Cookies and browser storage

app.fctl.sh sets two cookies, both needed for it to work: `__Host-fctl`
keeps you signed in for 30 days, and `__Host-fctl-oauth` protects a Google
sign-in for the 10 minutes it may take. Your theme choice is stored in your
browser, and so is a copy of the app's offline page, which it shows when
your device has no connection; neither contains personal data. There are no
analytics or advertising cookies.

## Why we use it

| Purpose | Legal basis (EU and UK law) |
|---|---|
| Running app.fctl.sh for you: signing you in, running and showing sessions, sharing them with the people you choose, sending the notifications you turn on, crediting you in commits when you set a commit email, connecting your hosts, Claude and GitHub | Contract |
| Sending invitations and password resets | Contract, and our legitimate interest in letting admins invite people |
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
| Resend, Inc. | Sending invitations and password resets, when email is enabled | The recipient's address and the message |

**Services you connect** receive data under their own privacy policies:

- **Google**, when you sign in with Google.
- **Your browser's push service**, when you turn on notifications: Google
  for Chrome and most browsers built on it, Mozilla for Firefox, Apple for
  Safari and Microsoft for Edge deliver them. Each notification is encrypted
  for your browser, so the push service learns when we send one, to which
  subscription and how big it is, but not what it says.
- **GitHub**, for the repositories you link: agents push branches and open
  pull requests there. If you set a commit email, the commits agents make
  in the sessions you start end with a `Co-authored-by` line that has your
  name and that address, unless the project's maintainers turn that off.
  Everyone who can read the repository sees it, which is everyone for a
  public repository, and GitHub uses it to link the commits to your GitHub
  account.
- **Anthropic**, which provides Claude. Claude Code runs on your hosts with
  the Claude account you connect, so Anthropic receives your prompts, the
  code the agent reads and the conversation, under your agreement with
  Anthropic. If a session joins Remote Control, the conversation is also
  available in your Claude apps.

**People you work with** see what you share with them: members of a project
see its sessions, including transcripts and who took part, and people you
share a session with see that session. Admins of app.fctl.sh can see its
users and the audit log.

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
  That deletes its sign-in methods, devices and tokens, Claude connections
  and memberships, and the projects only you are a member of, with their
  sessions and transcripts. Sessions you started in projects that others are
  members of stay with those projects, shown as started by a deleted user:
  your name, email address and picture are removed from them.
- **Your commit email**: until you remove it in Settings or delete your
  account. Commits already made keep your name and the address: they are
  part of the repository's history, which the repository's owners control,
  not us.
- **Projects and sessions**: until the project is deleted. Deleting a project
  deletes its sessions with their transcripts, normally right away and at
  the latest within a few hours. Archiving a session only hides it.
- **Published screenshots**: until they expire, 30 days after they are
  published unless the project chooses between 24 hours and 60 days; their
  links stop working then, and they are deleted within the hour. People who
  manage the session can delete one sooner, and deleting the project
  deletes them all. While the project or the instance has publishing
  turned off, their links don't work. Pull requests keep their links, which
  then show nothing.
- **Sign-in sessions, tokens, password resets, CLI sign-in requests and
  invitations**: until they expire or are revoked; expired ones are deleted
  within an hour. Browser sessions expire after 30 days.
- **Claude plan usage**: the latest report of each limit, until a newer
  report replaces it or you remove the Claude connection.
- **Notifications**: a browser's push subscription until you turn
  notifications off there or remove the browser in Settings, sign out of it
  or its browser session expires, or its push service tells us it has
  expired. A notification waits about a minute at most before it goes out,
  and is not kept afterwards. The sessions you follow are kept until you
  unfollow them or they are deleted, and your notification settings until
  you delete your account.
- **Audit log**: one year.
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
  we keep about you as one JSON file: your account, sign-in methods, devices
  and tokens, Claude connections (without their secrets) and their plan
  usage, notification settings and browsers, projects, the sessions you
  started with their full transcripts, the sessions you follow, and your
  activity log.
- **Correct it**: change your name, picture and commit email under
  Profile, what notifies you and in which browsers under Notifications, and
  your sign-in methods, Claude connections, devices and tokens in their
  sections.
- **Delete it**: in the danger zone, **Delete account** lists what will be
  deleted and asks you to type your email address to confirm. It cannot be
  undone.

The `fctl` command does the same with `fctl account export` and
`fctl account delete`. If you can no longer sign in, ask the admin who
invited you for a password reset link.

If you are in the European Economic Area, the UK or Switzerland, you can
also complain to your data protection authority.

## Security

Passwords are hashed with argon2id, sign-in tokens are stored only as hashes,
Claude credentials and project secrets are encrypted with AES-256-GCM, and
everything travels over HTTPS. [Security](/docs/security/) has the details.
No system is perfectly secure; if a breach affects your data, we will tell
you as the law requires.

## Children

fctl is made for software developers and is not meant for children. You
must be at least 16 to use app.fctl.sh.

## Changes to this policy

When our practices change, we update this page and the date at the top. For
significant changes, we tell people who use app.fctl.sh, in the app or by
email, before the changes take effect.

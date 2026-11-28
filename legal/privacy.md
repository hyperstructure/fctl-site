---
updated: 2026-11-26
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
- **fctl.sh** has no analytics, no advertising and no cookies. What you
  type in its search goes to Cloudflare, to search the docs.
- **app.fctl.sh** stores what it needs to run your factory: your account,
  the workspaces you are in, their projects and sessions, and the machines
  you connect. Agents run on those machines, not on ours. A session keeps
  a full transcript of what agents and people did in it, which can contain
  your code, and an encrypted snapshot of its agent's conversation and
  unpushed work, so that it resumes on another machine as it was: for 30
  days after it stops, or 1 to 365 days as the workspace's admins choose.
  Projects also keep their agents'
  notes and retrospectives, review agents' reviews of pull requests, the
  schedules that start sessions on their own, and the autopilots that run
  a project on its own (experimental), with what people tell and answer
  them.
- **We don't train AI models on your data or your code, but Anthropic
  receives your code and messages.** That promise covers only us. Agents
  run Claude Code with someone's Claude account, so what they read and what
  people write to them go to Anthropic under that account's agreement with
  Anthropic, not ours. For example
  ([Anthropic](#services-you-connect) has the rest):
  - a session's work goes to the account of the person who started it (or
    whom a service account started it for), or for a schedule's run,
    usually its owner's, whoever wrote the messages in it;
  - review agents use the account of the project owner who turned them on
    or took them over;
  - a Linear ticket goes to the account of the person who delegated it,
    with its comments and the replies people write to the agent there,
    whoever wrote them;
  - a request in Slack goes to the account of the person who asked, with
    the thread's earlier messages and the replies people write to the
    agent there, whoever wrote them.
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
- **Slack**: if your workspace connects Slack, we keep our app's access to
  your Slack workspace (encrypted), and who you are there once you link
  your Slack account. What you ask fctl there goes to its agent, with the
  thread's earlier messages, and into the session's transcript, unless
  your workspace's admins have fctl drop what Slack's messages said once
  the session ends. Agents read only the thread they started from, and the
  public channels your workspace's admins make readable.
- **Webhooks send your work's news elsewhere.** If a workspace's admins or
  a project's owners or maintainers add a webhook, what happens in its
  sessions (their titles, the start of agents' replies, their questions,
  pull requests and reviews) goes to the address they choose, outside fctl,
  as it happens. We keep what went out to each for 30 days.
- **Identity tokens say whom an agent works for.** Unless a project turns
  them off, its agents can prove to the services and clouds their
  workspace's people choose that they work for you: the token an agent
  sends names you by your fctl ID and the address you are in the
  workspace as, with its session, project and runner. We keep none of
  them.
- **Your workspaces' admins see whether your Claude connection works.**
  By default, a workspace's admins see whether your sessions there can
  run on Claude, when your token runs out and whether your sessions wait
  for a usage limit to reset, and also what kind of connection it is and
  whether an admin set it, its plan, when it was connected, last used and
  last answered by Claude, and how often your sessions there paused on
  usage limits; never the token, the Claude account or the name you gave
  it. Its admins can choose to see only the first three, or nothing, and
  its Settings → You says what they see
  ([People you work with](#people-you-work-with)).
- **Service accounts start agents for you only if you allow them.** A
  workspace's admins can make a service account for a program of their
  own, such as a portal where people start agents. Once you allow it, that
  program starts sessions for you, on your Claude account, and messages
  their agents in your name. app.fctl.sh asks you first, and you take it
  back whenever you like.
- **Gravatar**: by default, while you have no picture of your own, we ask
  Gravatar for yours by a hash of your email address, and show a copy if
  you have one there. Turn that off under Settings → Profile.
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

When you search fctl's docs on fctl.sh, what you type goes to Cloudflare's
AI Search, which finds the parts of the docs that match it. A search is part
of the address you ask for, so it is in our request logs for a few days, as
any address is. Cloudflare keeps a search's results, under what you
typed, in the data center that answered it for up to an hour, so that the
same search costs nothing again. So that nobody can search without end, fctl.sh
counts the searches from your IP address (for IPv6, from the network it is
in): for a minute in that data center, and for the rest of the day (UTC)
under a hash of the address with a random value, which is deleted with the
counts when the day ends, so that a count can't be traced back to you.

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
    have none, we keep a copy of your Google picture. While you have none
    of your own, we keep a copy of your Gravatar, if you have one, unless
    you or an admin of app.fctl.sh turn that off;
  - the commit email you choose for each address, if you set one;
  - your role, and a hash of your password (never the password itself);
  - when you last signed in, when you were last active (signed in or
    started a session yourself), and when you last exported your data.
- **Workspaces**:
  - for each workspace: its name, address, color and avatar image (if an
    admin uploads one), whether it requires two-factor sign-in, what its
    admins see of members' Claude connections and how they hear of them
    by email (and when the last weekly email went), and who created it
    and when;
  - for each of its members: the email address they are in it as, their
    role, the Claude connection they use there, who added them and when,
    and the order they put the workspace and its projects in;
  - for each invitation to it: the invited address, its role, who invited
    them and when it expires;
  - for each service account it makes for a program of its own: its name
    and what it says it is, a hash of its secret (never the secret) and the
    secret's last four characters, who made it, who made its current secret
    and when, and when it was last used; and each member's answer to it:
    whether it may start sessions for them, and when they answered;
  - for each GitHub account it uses: the account's name, the GitHub App
    installation's ID, the repositories it is limited to, who connected it,
    and the GitHub account they signed in to GitHub as;
  - while an admin chooses what the workspace works in on a GitHub account:
    what their GitHub sign-in showed them they may connect there. That is
    the account's name and type, the installation's ID, the names of those
    repositories, how many more they can see there, and the GitHub account
    they signed in as. Only they see it.
- **Two-factor sign-in**, if you turn it on or your admins require it:
  - the secret your authenticator app makes codes from (encrypted), the
    name you give the app, if any, when you set it up and when you last
    signed in with it;
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
- **Google sign-in**, if you link a Google account: its Google account ID;
  its email address, name and profile picture, and whether Google vouches
  for that address (it does where it hosts it, as a Gmail or Google
  Workspace address), as Google gives them each time you sign in with it;
  and, when you sign up with it, the first and last name it gives, for
  your profile. We get no access to your other Google data.
- **Sign-in sessions and tokens**:
  - for each browser session, CLI sign-in and access token: a hash of the
    token, its name, the user agent and IP address of the device that
    created it, how the sign-in it comes from was made (with a password, a
    passkey or Google, and for Google, the domain of the address you signed
    in as), and when it was created and last used;
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
    which access token or service account if one did; who it is shared with;
    what its agent may do on GitHub; and its pull requests, with their
    state, when it changed and how many of their checks passed, as GitHub
    says;
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
  - the diff of each file a session's agent changed in the session's
    repositories, uncommitted work included, as the agent last read it (up
    to 512 KB a file and 8 MB a session), so that the session's page shows
    the changes. Diffs contain your code. A newer diff of a file replaces
    the one before, and a file's goes once the agent's work no longer
    changes it;
  - each session's snapshot, saved as its sandbox stops: Claude's
    conversation there (everything the agent read, ran and was told,
    images included, which stay as long as the snapshot) and the work its
    agent hadn't pushed to GitHub,
    uncommitted files included but not what the repository's `.gitignore`
    leaves out, so that the session resumes on another of your machines as
    it was. The machine it ran on encrypts it with a key of the session's
    own, which we keep encrypted, and we keep only a session's newest. A
    workspace's admins can turn snapshots off. Where your runners keep
    snapshots in a storage bucket of your own (`[snapshots]` in their
    `host.toml`), the snapshot stays in your bucket, and we keep where it
    is, beside what we keep of any snapshot: the session's key (encrypted),
    the snapshot's size and checksum, when and on which runner it was
    saved, the Claude Code version that wrote it, whether it holds the
    conversation and uncommitted work, and what it left out. Those
    runners also tell us their bucket's address, and the last error they
    met there and when, until a snapshot next goes through;
  - for each project you start sessions in: the model and effort level you
    asked for when you last started one, which its task boxes start on next
    time.
- **Review agents**, in projects whose owners turn them on:
  - their settings: whether they are on, whose Claude account they run on,
    the model, effort level and instructions they review with, the
    repositories they skip, whether drafts get reviews, the GitHub Apps
    whose pull requests they review without being asked, whether they sum
    pull requests up in their descriptions, and who changed that and when;
  - for each review: its session; the pull request it reviews (its
    repository, number, title and link, and its author's GitHub login) and
    the commit; how it went (how many findings it posted, marked fixed or
    left open, or why it stopped); the summary its agent put in the pull
    request's description (how risky it looked, why, what it does and what
    deserved a closer look); the links to the review it posted and its
    check on GitHub; and which of our two GitHub Apps posted them. Where
    one of fctl's agents opened the pull request but no session took the
    review's findings when it posted, we also keep the message with those
    findings that fctl sends that agent (their titles, text, files and
    lines), until a session takes it.
- **Schedules**:
  - for each of a project's schedules: its name and the task its sessions
    start with; when it runs (a cron expression and a time zone, a time to
    run once, something that happens on GitHub, such as an issue opened,
    with the repositories, labels, branches and people it narrows that to,
    or only when asked); the model, effort level, branch and
    GitHub access its sessions start with; whose Claude account it runs on;
    who set it up and last changed it, and when; and, when fctl paused it,
    why;
  - for each of its runs: when it was due and started; what started it (its
    time, a person, or another tool, with someone's access token or as a
    service account running it for them, and whose; or what happened on
    GitHub: the issue, pull request, release or
    commit, its title and link, and the GitHub login of whoever opened,
    labeled, merged or published it); and the session it started, or why
    it started none;
  - what a person or a tool sends with a run, such as an issue's text, goes
    into the first message of the run's session, and so into its
    transcript, and so does what GitHub says of what started it: an
    issue's or pull request's title, text, labels and author, a release's
    notes, or the checks that failed.
- **Autopilots** (experimental), in projects their maintainers put on
  autopilot, in workspaces whose admins allow them:
  - for each: the direction people give it and who last changed it, and
    when; the plan it keeps; what it may do; how often it checks in and how
    many sessions it runs at once; whose Claude account it runs on, who put
    it on and when; and, when it was paused, who paused it and why;
  - the notes people steer it with, with who wrote each and when, and when
    it read them;
  - what it asks people, with what helps answer it (which can link to
    screenshots it published), and the answer, or why someone declined, with
    who answered and when. A secret it asks for goes into the project's
    secrets, sealed, as any project secret, and never into the ask, its
    answer or a transcript. A question can name a session it is about; the
    files someone attaches to their answer go to that session in a message
    from them, as any message's files, and the ask keeps their names, types
    and sizes;
  - its log: what it did (the sessions it started and steered, the settings,
    secrets' names, repositories and schedules it changed, the projects it
    created, the files it added and removed), what it wrote down, and what
    people did with it, with who and when;
  - the files it keeps for its later sessions: text it writes itself, such
    as scripts and drafts of messages, at most 4 MB in all, with each
    file's name and size, when it was added and last written, and which of
    its own sessions last wrote it. They can hold anything the autopilot
    wrote in them, such as your name or what you told it;
  - the messages it sends its sessions while as many of them work as people
    allow, which wait until one of them makes room: each one's text, its
    files' names, types and sizes, the session it goes to, the person it
    acts as and when it sent it;
  - for each pull request of its sessions that merged: its repository,
    number, link and title, the session that lists it, the branch it merged
    into and the commit that holds it there, and how the checks on that
    branch ended after it, as GitHub says (on which commit, how many passed,
    failed or were cancelled, and the names of those that failed), and when
    it heard of that;
  - its sessions are sessions like any other, with their transcripts.
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
- **Webhooks**, if a workspace's admins or a project's owners or
  maintainers add them:
  - for each webhook: the address it posts to, its name, the events it
    wants, the projects and the sessions it hears of, its signing secret
    (encrypted), whether it's on (and, when fctl turned it off, why), who
    added it and when, who chose where it posts now (who added it, or last
    pointed it elsewhere or turned it on again: it posts only while they
    manage it), and how its newest attempt went (when, how long it took and
    the status, without the answer or who made it);
  - for each request that goes out to it, in the last 30 days: what it
    posted (the event, with the workspace's and the project's names and
    ids; for a session's event the session's title, description, status
    and why, the model and effort level it works with, branches, the
    person it was started by or for, the schedule it started from (name,
    id and link) or the ticket (its key and link), its pull requests and
    their checks, the start of the agent's last reply, up to 2,000
    characters, and what it asked; for a follow-up, the comments as fctl
    passed them on, with their writers' GitHub logins and pictures'
    addresses, the GitHub login of whoever merged or closed the pull
    request, the names of the checks that failed, and a review's findings
    with their titles and files; for a review its pull request,
    commit, findings counted, links and the person whose Claude account it
    runs on; for a schedule its name and why a run started nothing), the
    request's headers; for each attempt when it was made, how long it
    took, the status the address answered with or why none came, and who
    resent it or sent a test; and for the newest attempt the headers of
    the answer (up to 40) and the start of its body (4 KB).
- **Notifications**, if you turn them on:
  - for each browser you turn them on in: its push subscription (the
    address its push service delivers to, and the keys notifications are
    encrypted with), the browser's name, such as "Chrome on macOS", and when
    it was added and last notified;
  - which sessions you follow, and what you want to be notified about;
  - that browser keeps a note of which account turned them on, and the
    app's service worker shows them.
- **Your Claude connection**: the Claude credential you connect (encrypted),
  with the Claude account's email address, subscription type and, when you
  sign in with a full Claude login, its rate limit tier, which tells Claude's
  Ultra plan from Max. Also how
  much of the plan's usage limits is used, as your sessions last reported
  it: for each limit, the share used, when it resets and when it was
  reported. For each connection we also keep when Claude last answered
  it, whether an admin set it, when its long-lived token runs out (a year
  after you made it, if you tell us when; otherwise a year after you
  connected it), when we last told you it runs out, and when we found it
  stopped working; and, for 30 days, each time a session on it paused on
  a usage limit or Claude refused it. If you keep your Claude token on your
  own hosts instead, you don't give it to us: we keep only that you
  connected it that way, that usage, and those facts.
- **GitHub**: you never sign in to app.fctl.sh with GitHub. Agents work
  with our GitHub App's short-lived tokens,
  limited to their project's repositories, within the GitHub accounts its
  workspace uses. The only GitHub sign-in is an admin's, when they connect
  a GitHub account to a workspace (above).
  - We keep the repositories you link through our GitHub App, and the
    branches and pull requests agents create.
  - Through our app's webhook, GitHub tells us when pull requests and their
    checks change in the repositories the app is installed on, when people
    comment on pull requests there or review them, and when issues are
    opened or labeled and releases published. Of an issue, a release, or a
    pull request no session lists, we keep only what a schedule's run that
    it starts keeps (under Schedules, above). For the pull
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
    request in their repositories opens or gets a new commit (a draft's
    only once it's marked ready for review, where the owners chose so), if
    its author may write to the repository, or if one of fctl's agents, or
    one of the GitHub Apps the project's owners chose, opened it. Others get
    a review when someone in the project asks for one. We keep what the
    review needs (above). While the owners choose those apps, we ask GitHub which apps
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
- **Slack**, where a workspace connects a Slack workspace:
  - our app there: the Slack workspace's ID, name, address and icon, the IDs
    of our app and of its user there, its token (encrypted), the
    permissions Slack granted it and whether it still works, and who
    installed it and when. For each fctl workspace connected to it: who
    connected it, the Slack user who installed it, what the workspace's
    admins let people and agents do there, and the channels they chose
    something for (their ID and name, the project whose sessions their
    mentions start, and whether agents read them);
  - your Slack account, if you link it, or, on instances whose admins allow
    it (never app.fctl.sh), if your workspace's admins let fctl find it by
    your address: its Slack user ID, name, email address and picture
    address, the Slack workspace's ID, name and address, how fctl knows it
    and when, and the project your messages with fctl start sessions in, if
    you choose one;
  - when someone mentions fctl in Slack, writes to it, uses `/fctl` or its
    shortcut, or presses one of its buttons, Slack tells us. We keep the
    thread it is in (its conversation's ID and when its first message was
    written), the Slack user who asked, the session it reaches and how it
    stands, the IDs of fctl's own messages there (the session's card, the
    agent's question), the IDs of the newest 200 messages we passed on to
    the agent as their authors', and when its agent last read the thread;
  - what they asked, for an hour at most, while it waits for that person to
    link their Slack account or to choose a project, or after it failed to
    start. A message to the agent from someone fctl doesn't know yet waits
    the same way, until they link their account, for an hour at most;
  - a session started from Slack keeps its thread's conversation ID, name
    and link. Its transcript records what the person asked, the thread's
    earlier messages as its agent got them, and the replies people write to
    the agent there, with their author's Slack name and picture; what
    agents read with `fctl slack` (their own thread, and the channels the
    workspace's admins make readable) is in their tool calls, and so in the
    transcript too. Where the workspace's admins choose, we drop what
    Slack's messages said from a session's transcript and search index
    once it ends, and keep who wrote them, where, and their links; the
    session's encrypted snapshot of its agent's conversation keeps them
    until the session is deleted. For an hour, we keep when each session's
    agent read, searched or posted in Slack, to limit how often it may;
  - Slack sends us every message of the conversations our app is in, as it
    does to every app. We keep none of them but those above, and the rest
    of what Slack sends us we don't keep either.
- **Published screenshots**, in projects whose maintainers turn them on.
  They are off by default: an admin of app.fctl.sh has to allow them, and a
  project has to turn them on. We keep the images agents publish so that
  pull requests can show them (PNG, JPEG, GIF or WebP, up to 5 MB each),
  with their names, sizes, the session they come from and when they expire.
  They show whatever the agent captured, which can be your app, your code
  or your data, and their links are public
  ([Anyone who has a published screenshot's link](#anyone-with-a-screenshots-link)).
- **Identity tokens**, in projects that don't turn them off. We keep the
  keys we sign them with, which say nothing about you, and none of the
  tokens: each goes to the sandbox of the session whose agent asked for
  it, where it lasts 10 minutes, and says what we know of that session
  ([Services your agents prove themselves to](#services-your-agents-prove-themselves-to)).
  A project's settings keep the AWS role, Google Cloud provider and
  service account, and Azure application its agents reach with them.
- **Hosts**: for each machine you register, its name and hostname, its
  operating system, architecture, processors and memory, and its fctl
  version and whether it updates fctl by itself. Also the sandbox image it
  uses and the images and repositories it allows, the workspaces it runs
  sessions for, a hash of its token, whether it keeps your Claude token and
  since when (never the token), and when it was last online. For a machine
  that enrolls in a workspace with one of its enrollment tokens, also the
  IP address it enrolled from, its approximate location (city and country,
  derived from the IP address), the enrollment token it used and, while it
  waits for approval, until when. A machine that enrolls with a token you
  made for your own sessions is registered as yours.
- **Enrollment tokens**: for each enrollment token a workspace's admins
  make, or a member makes for their own sessions, its name, a hash of it
  (never the token), its settings, whether it is for its maker's own
  sessions, who made and who revoked it and when, and when it last
  enrolled a machine.
- **Audit logs**: security-relevant actions, such as sign-ins, invitations,
  access changes and deletions, with who did them, when, and from which IP
  address. Also each comment fctl passes on to an agent, with its author's
  GitHub login and its link, each session a Linear ticket starts, with
  the ticket's key, and each session a request in Slack starts, with its
  thread. Each workspace has its own, for what happens in it, and
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
  email address is connected to it, a Claude subscription is connected to
  it, or a Linear account is linked to it, and when you let a service
  account start sessions for you.
- Notices when Google sign-ins stop asking you for a code, when your
  password is changed, set or reset, and when an admin makes a password
  reset link for you.
- Notices 30 days and 7 days before your long-lived Claude token runs out,
  and when Claude stops taking your Claude connection.
- To a workspace's admins, as they choose (once a week by default, only
  when there is something to say): which of its members' Claude tokens run
  out within a month and whose connection stopped working, with their names
  and the addresses they are in the workspace as.

### Cookies and browser storage

app.fctl.sh sets eight cookies, all needed for it to work:

| Cookie | What for | How long |
|---|---|---|
| `__Host-fctl` | Keeps you signed in | 30 days |
| `__Host-fctl-oauth` | Protects a Google sign-in | The 10 minutes it may take |
| `__Host-fctl-2fa` | Holds a sign-in that waits for your two-factor code | 10 minutes |
| `__Host-fctl-github` | Protects the GitHub sign-in that connects a GitHub account to a workspace | The 10 minutes it may take |
| `__Host-fctl-github-install` | Holds which workspace you install our GitHub App from, or give it more repositories from, so that GitHub's way back leads there | The hour it may take |
| `__Host-fctl-github-review-install` | Holds which workspace you install our review app, fctl-review, from, or give it more repositories from, so that GitHub's way back leads there | The hour it may take |
| `__Host-fctl-linear` | Protects the Linear sign-in that installs our app in a Linear workspace or links your Linear account | The 10 minutes it may take |
| `__Host-fctl-slack` | Protects the Slack sign-in that installs our app in a Slack workspace or links your Slack account | The 10 minutes it may take |

Your browser also keeps:

- your theme choice, which contains no personal data;
- if you ask for early access: the address you asked with, when, and the
  token that withdraws the request, so that the page shows you are on the
  list, until you withdraw it or ask with another address;
- which workspaces you fold in the sidebar, and the project you last started
  a session in, so that the app opens as you left it;
- in the app on an iPhone's or iPad's Home Screen: the address of the page
  you were last on, with the session, project or workspace in it and the
  tab, filter or search you had open, and when, so that the app opens there
  again after iOS closed it in the background. Signing out removes it;
- a log of what the app did in that browser lately, at most 300 entries:
  how it started, when it went to the background and came back, the
  addresses of the pages it was on, and the errors it met, each with a
  random ID of the app's run that logged it, and the ID of the account it
  is kept for, so that you can copy it into a report from Settings → App
  log. It never leaves your browser unless you copy it. Signing out
  removes it, and so does someone else signing in there;
- a copy of what the sidebar shows, so that it shows it as soon as the app
  opens: the names, colors and avatar addresses of your workspaces and of
  those that invited you, your role in each, and the names of their projects
  with how many sessions each has going. Signing out removes it;
- the IDs of the sessions you hide from the sidebar, each with how many
  turns its agent had finished, when the session last changed and when you
  hid it, so that they stay hidden until their agents work again, for up
  to 7 days. Signing out removes them;
- if you skip the notice that asks you to update the fctl on your runners:
  the version you skipped, so that the notice stays away until a newer one;
- the task you are writing on the floor, and the one you are writing on each
  project's page, with the project, model, effort level and GitHub access
  you chose for it and the files you attach to it, until a session starts
  with it or you sign out, so that leaving the page doesn't lose it;
- if you use passkeys: a short hash of the name and email address the app
  last gave your password manager for them (not the name or address
  themselves), so that it gives them again only when they change;
- if your picture is your Gravatar: its address on app.fctl.sh, which holds
  your user ID, so that the app says it is your Gravatar only once.

There are no analytics or advertising cookies.

## Why we use it

| Purpose | Legal basis (EU and UK law) |
|---|---|
| Running app.fctl.sh for you: signing you in, the workspaces you are in, running and showing sessions, sharing them with the people you choose, sending the notifications you turn on, posting to the webhooks your workspace's admins and projects' maintainers add, starting sessions for you through the service accounts you allow, crediting you in commits when you set a commit email, connecting your hosts, Claude, GitHub, Linear and Slack | Contract |
| Sending invitations and password resets | Contract, and our legitimate interest in letting admins invite people |
| Keeping your request for early access and inviting you | Contract: steps you ask for before one |
| Asking an admin to sign in to GitHub when they connect a GitHub account to a workspace, to read which of its repositories they may give the workspace and let them choose from them | Legitimate interests: keeping each workspace to the repositories its admins may grant |
| Passing the comments people write to a project's agents on GitHub on to them, where its follow-ups are on, and asking GitHub whether their authors may write to the repository | Legitimate interests: letting the people a repository trusts direct its agents from GitHub, and nobody else |
| Asking you to sign in to Linear when you link your Linear account, to know who you are there | Legitimate interests: starting the sessions of the tickets you delegate to fctl as you, and nobody else |
| Passing the tickets people delegate to fctl in Linear on to the agents of the project that takes them, with their comments and the replies people write there, and showing what the agents do in Linear | Contract, and our legitimate interest in letting the teams that connect Linear hand their tickets to agents |
| Asking you to sign in with Slack when you link your Slack account, to know who you are there | Legitimate interests: starting the sessions you ask fctl for in Slack as you, and nobody else |
| Passing what people ask fctl in Slack on to the agents of the project it goes to, with the thread's earlier messages and the replies people write there, letting agents read the channels a workspace's admins make readable, and showing what the agents do in Slack | Contract, and our legitimate interest in letting the teams that connect Slack ask agents for work where they talk |
| Looking up your Gravatar while you have no picture of your own, which we do by default, and showing it as your picture | Legitimate interests: showing the people you work with who you are, with the picture you published on Gravatar if you have one; you can turn it off |
| Telling you about changes to your two-factor sign-in and passkeys, and sign-ins with a recovery code | Legitimate interests: keeping your account secure |
| Keeping when Claude last answered your connection, when its token runs out, and its sessions' limit pauses, and telling you before it runs out and when it stops working | Contract: running your sessions on your Claude subscription, and keeping them from stopping unannounced |
| Showing a workspace's admins facts about their members' Claude connections, and emailing them, as they choose, about those that run out or stop working | Legitimate interests: letting the people who run a workspace see whether its members' sessions can run, and act before they stop; never the token or the account, members see what admins see, and admins can see less |
| Searching fctl's docs for you on fctl.sh, and counting each address's searches so that nobody can search without end | Legitimate interests: helping people find what they need in the docs, at a cost we can keep paying |
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
| Cloudflare, Inc. | Hosting fctl.sh and app.fctl.sh: servers, database, storage and logs, and fctl.sh's search | Everything app.fctl.sh stores, request data, and what people search for on fctl.sh |
| Resend, Inc. | Sending invitations, password resets, notices about how you sign in and what you let act in your name, notices about your Claude connection (before its token runs out, and when it stops working), and the emails workspace admins choose about their members' Claude connections, when email is enabled | The recipient's address and the message, which for admins names the members and the addresses they are in the workspace as |

### Gravatar

By default, while you have no picture of your own, app.fctl.sh asks
[Gravatar](https://gravatar.com), run by Automattic Inc., for your picture:
when you sign up, turn it on or change your primary address, and about once
a day while you use app.fctl.sh, whether or not you have a Gravatar account.
It sends the SHA-256 hash of your primary email address, not the address
itself, and asks from our servers, not from your browser. Gravatar receives it under
its own privacy policy, and can tell whether the hash is that of an address
with a Gravatar account. You can turn this off under Settings → Profile, and
removing your picture there turns it off too; an admin of app.fctl.sh can
turn it off for everyone.

### Services you connect

They receive data under their own privacy policies.

- **Anthropic**, which provides Claude. Claude Code runs on hosts with a
  Claude account that someone connected. Anthropic receives the prompts,
  the code the agent reads and the conversation, under that account's
  agreement with Anthropic, not ours. Our promise not to train AI models on
  your data doesn't cover Anthropic: that account's agreement and settings
  do. Whose account it is:
  - **Sessions**: the account of the person who started the session, or whom
    a workspace's service account started it for, whoever wrote the messages
    in it. A schedule's runs follow the schedule's rule, below. If a session
    joins Remote Control, the conversation is also available in that
    account's Claude apps.
  - **Review agents**: the account of the project owner who turned them on,
    or took them over. The pull requests they review go there. Those of
    people who can't write to the repository, and of apps the project's
    owners didn't choose, go there only when someone in the project asks
    for their review.
  - **Linear tickets**: the account of the person who delegated the ticket.
    Its comments, and the replies people write to the agent there, go there
    too, whoever wrote them.
  - **Requests in Slack**: the account of the person who asked. The
    thread's earlier messages, the message they sent fctl with its
    shortcut, what the agent reads in the channels a workspace's admins
    make readable, and the replies people write to the agent there go there
    too, whoever wrote them.
  - **Schedules**: a schedule's task goes to the account of its owner (who
    set it up or took it over) when its time comes, or when what it waits
    for happens on GitHub; otherwise to the account of the person who runs
    it, or whose access token another tool runs it with, or whom a service
    account runs it for (its owner, unless it names someone). What is sent
    with a run, or what GitHub says of what started it, such as an issue's
    text, goes there too, whoever wrote it.
  - **Project memory**: a project's notes go into the prompts of its later
    sessions, on the accounts of the people who start them.
  - **Autopilots**: an autopilot's direction, plan, notes, the answers
    people give it (never a secret's value), with the names of the files
    they sent its sessions with them, its log, the files it keeps, the
    messages it holds for its sessions until they make room (the start of
    each, and how many files it sends), and how the checks went after its
    sessions' pull requests merged (each pull request's link and title, and
    the names of the checks that failed) go to the account of the person
    who put the project on autopilot, or took it over, and so does the work
    of the sessions it starts, whoever wrote what.
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
- **Slack**, where a workspace connects a Slack workspace. Everyone in a
  conversation sees what we post there.
  - Our app posts each session's card in the thread it started from (its
    title, who it runs for, how it stands, the agent's plan and its pull
    requests with their checks), the agent's replies and questions, and
    when the session pauses or fails; and the posts agents make with `fctl
    slack reply`, in their own thread only.
  - It sends the notifications of people who choose "Tell me in Slack" in
    their messages with it, and projects' chosen events to the channels
    their maintainers choose.
  - It joins the public channels a workspace's admins map to a project or
    make readable, which shows there.
  - When you link your Slack account, we send you to Slack to sign in, and
    Slack gives us a short-lived token that tells us who you are there. We
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
  as (not your other addresses), the Linear and Slack workspaces it works
  in, with who connected each, what it lets people and agents do in Slack
  and how many of its members linked their Slack account, and its service accounts, with what each says it is
  and who made it.
- **A workspace's admins** also see who has two-factor sign-in, its
  invitations and its audit log, with the IP addresses of what they did
  themselves, not of what others did, and its enrollment tokens, its
  members' own included, and the machines that enroll with them, with
  whose each is. For the machines that belong to the workspace, they also
  see the IP address and approximate location each enrolled from; for a
  machine a member enrolled for their own sessions, the app shows those to
  that member instead.
- **Members of a project** see its sessions, including transcripts and who
  took part; its memory and retrospectives, with who wrote each note; and
  its schedules, with who set up and changed each, whose Claude account it
  runs on and who or what started each of its runs; and its autopilot, with
  its direction, plan, notes, what it asks and who answered, the messages
  it holds for its sessions, with their files' names, and its log.
- **A workspace's admins** see its webhooks, its projects' too, and
  everything each sent: who added it, its address and its log of requests
  and answers, which carry its projects' events.
- **A project's owners and maintainers** see its own webhooks and their
  logs, as the workspace's admins do, and the workspace's webhooks that
  send its events: their names, who added each, where each posts
  (shortened to the address's host), the events, projects and sessions
  each hears of, whether it's on (and why fctl turned it off) and how its
  requests went lately, but not what they carried.
- **A workspace's admins** also see, by default, for each member, facts
  about the Claude connection their sessions there run on: whether they
  have one and whether Claude still takes it (and when it stopped), when
  its token runs out, and whether their sessions there wait for a usage
  limit to reset, which one and until when. They also see its kind,
  whether an admin set it with an admin token and whether the member
  chose it for that workspace, its plan, when it was connected, when a
  session last used it and when Claude last answered it, and how often
  their sessions in that workspace paused on usage limits in the last 7
  and 30 days, with the last one's limit and time. The workspace's admins
  can choose to see only the facts before "They also see", or nothing.
  Never the token, the Claude
  account's email address or the name its person gave it.
- **A workspace's admins** also see each of its service accounts' people:
  who allowed it, who didn't and who hasn't answered, with when, and why it
  can't act for someone (their answer, a disabled account, or two-factor
  sign-in they have to set up first).
- **The program that holds a service account** sees each member of its
  workspace: their name and picture, the address they are in it as, their
  role, their answer to it and when, and whether it may act for them, with
  why not. It reads every project of the workspace, with its members (their
  addresses and roles), memory, retrospectives, reviews and schedules with
  their runs, and every session, whoever started it, with its transcript,
  the files sent in it and who it is shared with, and it searches what
  sessions said. For the people who allowed it, it starts sessions and
  messages their agents in their name. The program's owner, often your
  organization, decides what it keeps of all that.
- **People you share a session with** see that session.
- **Admins of app.fctl.sh** see its users, with all their addresses and how
  many workspaces they are in; the addresses that asked for early access,
  with when they asked and who invited them; each workspace's name, avatar,
  primary admin and size; the GitHub accounts workspaces use; and the audit
  log of app.fctl.sh. They don't see what is inside workspaces they aren't
  members of, nor anyone's Claude connection: app.fctl.sh keeps the view
  of everyone's off. When a workspace's primary admin's account is
  disabled, they see its members' names, to choose who runs it.
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

### Webhooks' addresses

A webhook posts the events it wants to the address its workspace's admins,
or its project's owners or maintainers, chose: a service of theirs, a chat
app's or another company's, which receives them under its own terms. That
includes what the people of its projects wrote to agents and what agents
replied, as far as each event carries it (under Webhooks, above). Each
request is signed with the webhook's secret, so that its receiver can
check it came from fctl. Those who manage a webhook decide where it posts,
and turn it off or delete it.

### Services your agents prove themselves to

A session's agent can send identity tokens that we sign to services it
calls: its workspace's own, a cloud such as AWS, Google Cloud or Azure,
or another its people tell it to use. Each token says whom the session
runs for (your fctl ID and the address you are a member of the workspace
as), its workspace, project and session, the runner it runs on, its
branches, what it may do on GitHub and what started it. Its receivers get
it under their own terms. A project's owners and maintainers turn identity
tokens off; its people choose which services their agents call, and which
trust them.

### Your hosts

Your hosts are machines you control. Their sandboxes keep copies of your
repositories, the session's work and Claude's local files, and you are
responsible for them.

### Pictures from other sites

Profile pictures people upload, and the copies we keep of Google and
Gravatar pictures, load from app.fctl.sh. Other pictures load from the servers they are on,
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

Gravatar isn't one of our providers: Automattic Inc. runs it in the United
States, under its own privacy policy, and we have no contract with it. The
hash of your email address goes there from our servers while Gravatar is on
for you ([Gravatar](#gravatar)); turn it off under Settings → Profile and
nothing goes there.

## How long we keep it

- **Your account**: until you delete it in Settings, or an admin deletes it.
  - That deletes its email addresses, sign-in methods, devices and tokens,
    Claude connections, Linear and Slack accounts and memberships, your answers to
    service accounts, the model and effort level you last asked for in each
    project, the machines you
    enrolled for your own sessions, and the workspaces only you are in,
    with their projects, sessions, transcripts and webhooks, and it revokes
    the enrollment tokens you made for your own sessions.
  - Sessions you started in workspaces that others are in stay with their
    projects, shown as started by a deleted user: your name, email
    addresses and picture are removed from them.
  - The notes you, or your sessions' agents, wrote in their projects'
    memories stay too, without your name, and so do the schedules you set
    up or took over, which stop running on your Claude account.
  - So do what you told autopilots (your notes, your answers and the
    directions you gave them) and the lines of their logs that say what
    you did, without your name. An autopilot that ran on your Claude
    account pauses until someone who manages its project takes it over.
  - The files autopilots keep stay as they wrote them. They record no
    account, but can mention you, until the autopilot removes them or their
    project is deleted.
  - The webhooks you added in workspaces that others are in stay, without
    your name, until those who manage them delete them; those whose address
    you chose stop posting, until someone who manages them turns them on
    again. The logs of those
    workspaces' webhooks keep what went out, which can carry your name,
    picture's address or GitHub login (the sessions you started, reviews
    run on your Claude account, your comments on pull requests, the tests
    and resends you sent), for up to 30 days.
- **The copy of your Gravatar**: until you upload a picture, remove it,
  turn Gravatar off under Settings → Profile, an admin of app.fctl.sh turns
  it off for everyone, you no longer have a Gravatar (we look about once a
  day, and delete the copy when you don't), or you delete your account. A
  new picture on Gravatar replaces it.
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
  invitations, its enrollment tokens and the machines that enrolled with
  them, its service accounts with everyone's answers to them, and its audit
  log. Leaving a workspace, or being removed
  from it, deletes your membership, your roles in its projects, the
  model and effort level you last asked for in them, your answers to its
  service accounts, and the machines you
  enrolled in it for your own sessions, and revokes the enrollment tokens
  you made there for them; the webhooks whose address you chose there stop
  posting, as they do once you no longer manage them, until someone who
  does turns them on again. Invitations to
  workspaces expire after 30 days.
- **Projects and sessions**: until the project is deleted. Deleting a project
  deletes its sessions with their transcripts and diffs, normally right
  away and at the latest within a few hours. Archiving a session only hides
  it.
- **Project memory**: each note until someone who can edit the project
  deletes it, or the project is deleted. Marking a note stale keeps it,
  except that a stale note is deleted once it has been stale as many days
  as the project's maintainers chose (1 to 365; by default none, and stale
  notes stay), and a project's autopilot may delete the notes stale for
  over a day, as it is told to once the project's memory holds 900 notes.
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
  runs, and all of the last day's, as long as the schedule. Deleting a
  schedule leaves the sessions it started in their project.
- **Autopilots**: as long as their project; taking a project off autopilot
  keeps its autopilot's direction, notes, plan, files, log and open asks for
  when it's put on again. Each note until someone removes it; each file
  until the autopilot removes it; what it asked, until 90 days after it
  heard the answer or the refusal, or took it back; its log's newest 1,000
  entries; how the checks went after its sessions' pull requests merged,
  until three days after each merged. A message waiting for room, until it
  goes to its session (and into that session's transcript, like any
  message), someone takes it back, its session is deleted, or the project
  is taken off autopilot; or, once its session failed, until the autopilot
  is next on. While the autopilot is paused, by people, by itself or because
  its workspace's admins turned autopilots off, its messages wait, however
  long that lasts. Its sessions stay in their project like any other.
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
- **Slack**:
  - our app's token in a Slack workspace: until no fctl workspace works in
    it any more, when we uninstall the app there and delete the token,
    within an hour at the latest; or until Slack tells us the app was
    uninstalled or its token revoked, when we delete it at once;
  - an fctl workspace's connection to it, with its settings and its
    channels: until one of its admins disconnects it or the workspace is
    deleted;
  - your Slack account: until you unlink it in Settings or delete your
    account;
  - what someone asked fctl in Slack that waits, or a message from someone
    fctl doesn't know yet: an hour at most;
  - which thread reaches which session: as long as the session, and 30
    days for one that started none;
  - what Slack's messages said in a session's transcript: as long as the
    transcript, or, where the workspace's admins choose, until the session
    ends (stops, fails or is archived), within an hour or so after;
  - when agents read, searched or posted in Slack: an hour.
- **Session snapshots**: 30 days after each was saved, or as many days as
  the workspace's admins choose between 1 and 365, and only each session's
  newest; then they are deleted within the hour, with what we keep of
  them. Turning snapshots off, for a workspace or for all of app.fctl.sh,
  deletes them within the hour, and deleting the project deletes them with
  its sessions. For snapshots in a bucket of your own, we forget each one,
  where it is and what we keep of it, on the same terms, and your bucket's
  own rules decide when the snapshot is deleted. A session's key stays,
  encrypted, as long as the session.
- **Images agents read**: 7 days after the agent read them, when they are
  deleted, or sooner once their session has more than 1,000 of them or
  200 MB, its oldest first. Deleting the project deletes them with its
  sessions. The transcript keeps saying what the agent read. The copies in
  the conversation a session's snapshot holds stay as long as the snapshot
  (see Session snapshots, above).
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
- **Claude connection facts**: when Claude last answered a connection,
  when its token runs out, when we last told you it does and when it
  stopped working, as long as the connection; each session's pauses on
  usage limits, and each time Claude refused a connection, 30 days.
- **Webhooks**: until those who manage one delete it, or its project or
  workspace is deleted, with how its newest attempt went. What went out to
  each for 30 days, and its newest 1,000 requests at most; deleting a
  webhook deletes what went out to it, and deleting a project what its
  events said and its own webhooks with their logs. What a webhook's
  address received stays under that receiver's control.
- **Notifications**: a browser's push subscription until you turn
  notifications off there or remove the browser in Settings, sign out of it
  or its browser session expires, or its push service tells us it has
  expired. A notification waits about a minute at most before it goes out,
  and is not kept afterwards. The sessions you follow are kept until you
  unfollow them or they are deleted, and your notification settings until
  you delete your account.
- **Hosts**: until the person who registered one, or an admin, removes it.
  A machine that enrolled in a workspace goes when its admins, or the
  member it belongs to, reject or remove it, when it uninstalls, once it
  stays offline longer than its enrollment token allows, or a week after
  it enrolled if nobody approves it, and with the workspace; one a member
  enrolled for their own sessions also goes when they leave the workspace
  or delete their account.
- **Enrollment tokens**: until 90 days after they were revoked or expired,
  once no machine they enrolled is left, and with their workspace.
- **Service accounts**: until their workspace's admins delete them, or the
  workspace is deleted. Deleting one deletes everyone's answers to it; the
  sessions it started stay with their projects, as their people's. Your
  answer to one: until you change it, leave its workspace or delete your
  account.
- **Audit logs**: one year.
- **Request logs**: a few days.
- **Searches on fctl.sh**: their results up to an hour in Cloudflare's cache.
  The count of your searches for a minute, and, under a hash of your
  address, until the end of the day (UTC).
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
  with their plan usage, the facts we keep about them and their 30 days of
  limit pauses and refusals, your Linear and Slack accounts, notification settings and
  browsers, your answers to service accounts, and the workspaces you are
  in. From the workspaces open to you,
  it also has the projects you are a member of, the notes you and your sessions'
  agents wrote in their memories, the sessions you started with their full
  transcripts, the sessions you follow, and your activity log. Sessions of
  workspaces you left stay with those workspaces. You can export once a
  week, since an export reads all of it; one that fails on our side
  doesn't count.
- **Correct it**: change your name, the name agents call you and your
  picture under Profile, your email addresses and their commit emails
  under Email addresses, the workspaces you are in under Workspaces, what
  notifies you and in which browsers under Notifications, and your sign-in
  methods, passkeys, two-factor sign-in, Claude connections, Linear and
  Slack accounts, devices and tokens in their sections.
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

Passwords are hashed with argon2id, and sign-in tokens, service accounts'
secrets and recovery codes are stored only as hashes. Authenticator app
secrets, Claude credentials, Linear and Slack tokens, project secrets and webhooks'
signing secrets are encrypted with AES-256-GCM, and everything travels over
HTTPS. For passkeys we keep only public keys.

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

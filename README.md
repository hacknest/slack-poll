```
    ██╗██████╗  ██████╗ ██╗     ██╗
   ██╔╝██╔══██╗██╔═══██╗██║     ██║
  ██╔╝ ██████╔╝██║   ██║██║     ██║
 ██╔╝  ██╔═══╝ ██║   ██║██║     ██║
██╔╝   ██║     ╚██████╔╝███████╗███████╗
╚═╝    ╚═╝      ╚═════╝ ╚══════╝╚══════╝
```
<p align="center">
    <img src="/assets/screenshots/auto-complete.png"/>
</p>

## Overview
A [Slash Command](https://api.slack.com/slash-commands) integration for the [Slack](https://slack.com/) messaging app.
> Messages that start with a slash `/` are commands and will behave differently from regular messages. Slash Commands enable Slack users to interact with external services directly from Slack.

This custom command allows users to create simple polls, and vote **anonymously** from the list of options.

| Authors | [**@mingchia-andy-liu**](https://github.com/mingchia-andy-liu) | [**@jshephard**](https://github.com/jshephard) | [**@tony-dinh**](https://github.com/tony-dinh)|
|:-------:|:----:|:-----:|:----:|

## Usage

#### <a name="open">Opening a Poll</a>

---

**Command:** `/poll open [title] : [option 1], [option 2], ...`

To create a new poll, use the command `/poll open` and provide a title and a list of options to vote for. Each channel may have at most one open poll -- creating a new poll will close an existing opened poll.

<p align="center">
    <img src="/assets/screenshots/poll-open.png"/>
</p>

#### <a name="close">Closing a Poll</a>

---

**Command:** `/poll close`

To see voting results, you must close the poll with the command `/poll close`.

<p align="center">
    <img src="/assets/screenshots/poll-close.png"/>
</p>


#### <a name="vote">Casting a Vote</a>

---

**Command:** `/poll vote [option]`

To vote for a poll option, use the command `/poll vote` and provide the numerical index of your voting choice.

<p align="center">
    <img src="/assets/screenshots/poll-vote.png"/>
</p>


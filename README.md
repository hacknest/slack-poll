```
    ██╗██████╗  ██████╗ ██╗     ██╗     
   ██╔╝██╔══██╗██╔═══██╗██║     ██║     
  ██╔╝ ██████╔╝██║   ██║██║     ██║     
 ██╔╝  ██╔═══╝ ██║   ██║██║     ██║     
██╔╝   ██║     ╚██████╔╝███████╗███████╗
╚═╝    ╚═╝      ╚═════╝ ╚══════╝╚══════╝
```

## Overview
A [Slash Command](https://api.slack.com/slash-commands) integration for the [Slack](https://slack.com/) messaging app. 
> Messages that start with a slash `/` are commands and will behave differently from regular messages. Slash Commands enable Slack users to interact with external services directly from Slack.

This custom command will allow users to create simple polls, and **anonymously** vote from a list of options.

| Authors | [**@mingchia-andy-liu**](https://github.com/mingchia-andy-liu) | [**@jshepard**](https://github.com/jshepard) | [**@tony-dinh**](https://github.com/tony-dinh)|
|:-------:|:----:|:-----:|:----:|

## Usage

1. [Opening a Poll](#open)
1. [Closing a Poll](#close)
1. [Casting a Vote](#vote)

#### <a name="open">Opening a Poll</a>

**Command:** `/poll open [title] : [option 1], [option 2], ...`

To open a poll, append `open` to the slash command `/poll` and provide the command with a poll title and  a list of options to vote for.

**NOTE:** Each channel may have at most one open poll. If there is an existing opened poll, then opening a new poll will overwritten.

#### <a name="close">Closing a Poll</a>

**Command:** `/poll close`

<!--TODO: Explain Method-->

#### <a name="vote">Casting a Poll</a>

**Command:** `/poll close`

##Example
```
/poll open What's our team name?:Ship it!, Git Gud, Works on my machine!
/poll vote 1
/poll close
```

---
title: "catence"
excerpt: "A local-first fitness MCP server for Garmin, Intervals.icu, and a sprinkle of Strava."
author_profile: true
# header:
#   image: /assets/images/foo-bar-identity.jpg
#   teaser: /assets/images/foo-bar-identity-th.jpg
sidebar:
  - title: "Repo"
    # image: http://placehold.it/350x250
    # image_alt: "logo"
    text: "[rifusaki/catence](https://github.com/rifusaki/catence)"
order: 2 # NEW TWO
---

## What?

As a context, I'm both an endurance athlete and a data junkie. I already got a coach for all the serious stuff, but I wanted to hook up some—any—LLM to the insane amount of data collected from Garmin, derived on Intervals.icu (I don't pay for TrainingPeaks) and comparable efforts on Strava segments. Naturally, the first answer was a local MCP server for my current tooling.

## The gist

- Garmin, Intervals.icu, and Strava ingestion with source-aware normalization.
- Read-only MCP tools plus lock-guarded Strava hydration.
- One agent for many athletes without mixing.
- A password-protected Chainlit Console with an authenticated dashboard.
- A generated demo catalog to mess around.

## Where Catence can help

Catence is most useful when a question benefits from checking several local signals instead of reacting to a single score. The Console and MCP tools can help you explore questions such as:

- Recovery and readiness: “What changed in my sleep, HRV, resting heart rate, stress, and recent load before today’s session?”
- Training load: “Is this week harder than my recent baseline, and which sessions contributed most?”
- Performance trends: “How has my threshold pace, cycling power, or swim efficiency changed across the season?”
- Session review: “Compare this long run or interval set with similar recent efforts, including pace/power, heart rate, terrain, and recovery.”
- Segments and gear: “Show my history on this climb,” or “which shoes and bikes have carried the most recent training volume?”
- Data-quality review: “Which recent activities lack streams, power, health context, or a matching provider record?”

## Quick start

```sh
npm install --global catence@beta
catence-data setup --athlete alex --label "Alex"
printf %s 'alex@example.com' | catence-data --athlete alex secret set --provider garmin --field email --value-stdin
catence-data --athlete alex sync --provider all
catence-data --athlete alex build-retrieval-index
catence
```

`npx --yes catence@beta demo` also spins up a pretty fake generated dataset.

> Requires Node.js 22+ and Python 3.12+ with [uv](https://docs.astral.sh/uv/).

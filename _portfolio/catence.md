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

It does the usual shenanigans, like recovery, HRV trend, training load, activity detail, swim/bike/run progress, and such. But then, for example, you can compare your efforts over specific Strava segments. Or use Intervals... intervals.

## The gist

- Garmin, Intervals.icu, and Strava ingestion with source-aware normalization.
- Read-only MCP tools plus lock-guarded Strava hydration.
- One agent for many athletes without mixing.
- A password-protected Chainlit Console with an authenticated dashboard.
- A generated demo catalog to mess around.

## Cool Things About It

It's the only one I'm aware of that joins all three—admittedly arbitrary because they're the ones I use—sources. It doesn't depend on a live connection to either service, as it creates an offline local store.

You can use it as either an MCP server or deploy it as a web UI, depending on your setup. I have mine on a subdomain and it's pretty cool.

I know there have been other MCPs developed and shared over here. So! What it does I didn't find in other servers:

- Multi-source fusion. You can ask about Garmin and Intervals metrics in Strava segments on a single query.
- Multi-athlete isolation. A single deployment can access several isolated athlete stores. This is mostly because I wanted my mom to be able to check her data.
- Read-only by default. I purposefully made this read-only. There's nothing to write (other than Strava segment fetching) because this is not a coach.
- Console with dashboard. Password-protected Chainlit UI with live sync progress and model switching, if you are not the terminal kind. This also means you could access it from a phone.

## Quick start

```sh
npm install --global catence@latest
catence-data setup --athlete alex --label "Alex"
printf %s 'alex@example.com' | catence-data --athlete alex secret set --provider garmin --field email --value-stdin
catence-data --athlete alex sync --provider all
catence-data --athlete alex build-retrieval-index
catence
```

`npx --yes catence@latest demo` also spins up a pretty fake generated dataset.

> Requires Node.js 22+ and Python 3.12+ with [uv](https://docs.astral.sh/uv/).

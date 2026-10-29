# Concern segment

Parked 2026-10-29. A standardized short segment for introducing one new
concern in the episodes after episode 1. Not scheduled; revisit once episode 1
is cut.

## Idea

New concerns will keep arriving while building, testing in simulation and
trying things in the lab. Each one gets a very quick version of the entire
first episode, for that one concern only, in the same visual language: a
voice-over, a short explanation of the concern, how it plays out in a scene,
and a summary of what it means for the platform. The card joins the board on
screen, so the viewer sees the pile grow and the design choices follow.

## Shape, about 60 to 120 seconds

1. **Origin.** Where it came from: the lab, a simulation run, a field test, or
   a conversation. One sentence, voice-over. If there is footage or a log, a
   few seconds of it.
2. **The concern.** One or two sentences. The card appears, alone, large.
3. **How it plays out.** One Scene trace, ten to twenty seconds, on the
   floorplan of the domain where it surfaced. Truth and belief where the
   concern is perceptual; said and heard where it is conversational; the
   budget bar where it is about time.
4. **Where it fits.** The card lands on the board in its pile, gets its domain
   dots, and its classification. If it changes an existing card, that card
   is highlighted and updated.
5. **What it means for the platform.** The part it lands on and the
   requirement statement, in the chapter 7 form: the requirement, then what
   any solution to it needs.
6. **How we would know.** The test it implies, and its tier: simulation, lab
   or field. One line.
7. **Board.** Final state, the new card marked. Cut.

## Voice-over template

> We ran into this in [origin]. [The concern, one sentence.] Here is what it
> looks like. [Scene plays.] On the board it goes with [pile], and it shows up
> in [domains], so it is [core / a parameter / a plugin]. For the platform that
> means [part] must [requirement]. We will know it works when [test].

## Assets per segment

| Asset | Count | Source |
|---|---|---|
| Scene trace | 1 | authored, or a simulator run, or a replayed log |
| Concern card | 1 | one entry added to the concerns file |
| Board state | before and after | the current board plus the new card |
| Requirement card | 1 | part tag, requirement text |
| Origin footage or log | optional | lab camera, webui recording |

Everything renders from the existing compositions. The only new thing is a
sequence that strings them together with fixed timings, either a small
composition that takes one concern id, or an assembly recipe for the editor.

## Data

Each concern segment should be renderable from one file, so that the segment
is data like everything else:

```
data/concerns/<id>.json
  id, title, pile, part, domains, kind
  origin: { tier: lab | sim | field | analysis, date, note }
  trace: path to the scene trace
  requirement: text
  test: { tier, text }
  changes: [ ids of existing cards it updates ]
```

This is the same record the concerns file already needs for the board, plus
origin, requirement and test. Worth designing the concerns schema with these
fields from the start, even if episode 1 leaves them empty.

## Where it goes

- As the opening of an episode that then goes deep on the same concern.
- As a standalone short between episodes.
- In a vertical cut later, since the theme does not hardcode the aspect ratio.

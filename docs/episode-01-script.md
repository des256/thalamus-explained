# Episode 1 · Inventing Jobs for a Robot

High-level script, fourth draft, after the decisions on the open questions of
2026-10-29. Title confirmed. Iterate here; the trace, card and board data files are written
from this document, not the other way round.

|          |                                                                                                                                                                                                                                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Thesis   | To build a useful platform for social robotics you first have to say what that means: what the robot must be able to do, how well, under what conditions. One way to find out is to give it realistic mockup jobs, analyze them roughly, and derive the requirements and design decisions from the failures. |
| Audience | Engineers and researchers in social robotics, plus people who want to see frontier models used as an analysis partner rather than a code generator.                                                                                                                                                          |
| Length   | Chapter durations below are guides, not targets. Each chapter is produced as separate parts and assembled in the editor, so no split decision is needed now. The voice-over approach is not fixed either.                                                                                                    |
| Domains  | Museum guide, hospitality, care, and a stage presentation with questions. Four examples of one platform, none of them the lead. For viewers inside the company: a stage presentation done well is an investor persuasion tool, and it comes almost for free because the same analysis already covers it.     |
| Spine    | One board of concern cards that grows, gets dotted per domain, and is regrouped into requirements. It stays on screen at the end and later episodes pick from it.                                                                                                                                            |
| Cast     | Nile, Chris, Yue (visitors), Wendy, Janet (staff: guide, hotel staff, care staff, host on stage), Ben, Pamela, Matt (elderly), Ray, Clarence, Zoe (children). The robot has no name on screen: the platform is for all robots.                                                                               |
| Look     | Paper mode throughout. Top-down floorplan idiom, which later becomes the simulator's debug view. The vocabulary grows through the video: the cold open shows only what the robot knows, every later chapter adds a layer.                                                                                    |

## 0 · Reality — 0:45

**Purpose.** Before any animation, show that this is not a hypothetical problem.

**Beats.**

- Montage of real social robots failing in public. Misheard questions, frozen stares, wrong person addressed, a crowd walking away.
- No commentary beyond a few on-screen captions, or a single dry line at the end.

**On screen.** Found footage, sourced by Desmond. Editor only. Captions in the theme's lower-third style if any.

**Open.** Sources and rights for the clips. Attribution on screen or in the description.

## 1 · Cold open — 1:42

**Purpose.** The same failures, now in the idiom we will use all video, played for laughs. Sarcastic voice-over.

**What is shown.** Only what the robot actually has at this point: the floorplan, the robot disc with its heading pointer, people as discs with name labels, what people say, and a clock. No gaze lines, no person headings, no belief view, no group hull, no budget bar, no ticker. Those layers are introduced one by one in chapter 4 as the robot gains them. The comedy is the distance between what the robot says and what the viewer sees. A red cross lights up at every failure and stays, so the robot drags a growing tally of crosses around the room and the exits collect their own.

**The rule.** The robot has exactly one person in its world: the first one it met. Everything anyone says comes from that person. It never counts, never notices anyone leave, and plans its path as if the room were empty.

**Beats, with placeholder voice-over lines.** Times as rendered in `museum-coldopen`; the lines are sketches to set the tone.

1. 0:00 Nile comes through the door first. Robot: "Welcome to the tour! What is your name?" Nile: "Nile." Robot: "Welcome, Nile! I am your guide today." VO: the robot has met a person. It will never meet another one.
2. 0:06 Five more come in and gather at The Night Watch. Robot: "Nile, let me show you The Night Watch." VO: six people. The robot counts one. Its name is Nile.
3. 0:15 Yue: "Is this the original?" Robot: "Excellent question, Nile. Yes." VO: Yue asked. Nile gets the credit. Nile will get the credit for everything today.
4. 0:21 Chris to Yue: "Coffee after this?" Yue: "Yes please." Robot: "Nile, there is no coffee in this painting." VO: that was not for the robot. Everything is for the robot.
5. 0:30 Chris and Pamela at the same time: "What's with the dog?" "Where are the toilets?" Robot: "The dog's toilets are not depicted, Nile." VO: two questions at once. The robot heard one. From Nile.
6. 0:37 The robot starts on the dog, fact by fact. The clock jumps from 14:03 to 14:19. Ben drifts to the bench, Zoe to the Self-portrait, Pamela out the door. The real Nile checks the time and leaves. VO: eleven facts, twelve minutes. Nile has left the building. The robot is still talking to Nile.
7. 0:51 Robot: "Let's move on, Nile." It drives straight for the next painting, through Zoe. Zoe jumps aside: "Hey!" Robot: "Excuse me, Nile." VO: it does not know where anyone is. It knows where the next painting is.
8. 1:01 At The Jewish Bride with Chris and Yue. Wendy walks up with her staff badge: "The gallery closes in five minutes." Robot: "Nile, we have plenty of time. Eleven things to know about this one." VO: Wendy works here. Wendy is Nile. Nile has been told the gallery is closing. Nile does not care.
9. 1:10 Chris and Yue give up and leave. Wendy walks off. The lights go down, the clock runs to 14:31. The robot talks on to an empty spot, then: "Thank you for joining, Nile. I hope you enjoyed the tour." Ben is still on the bench, Zoe still at the Self-portrait. VO: tour ended. Attendance: one. Satisfaction: unknown. Nile could not be reached for comment.
10. 1:23 Freeze and dim. Title: "Yeah. That went well..."
11. 1:26 The title fades, the room unfreezes, the robot gets one last "Nile?" in while the camera pulls back. The scene becomes one tile in an endless string of robot failures, all moving: random rooms, random groups, frozen moments from this tour. The camera runs along the string for twelve seconds, faster and faster until the tiles smear, and the series title resolves out of the smear: Inventing Jobs for a Robot. Every tile has its own crosses.

**What each beat seeds.** Name binding; group membership; speaker attribution; addressee detection; overlapping speech; the executive owning time, and stragglers; people missing from the world model, so the path ignores them; staff role and override; knowing when you are confused.

**On screen.** One master trace, `museum-coldopen`, overlay view with the minimal layer set, wrapped in the `cold-open` strip composition for the ending. The question "what would it have needed to know?" moves to the first spoken line of chapter 2.

## 2 · Introduction — 1:30

**Purpose.** State the problem and the approach in plain words, on camera.

**Beats.**

- "A useful platform for social robotics." Everyone agrees we want one. Nobody can say what it must do.
- So before building, figure out what we mean. What must the robot be able to do, how well, and under which conditions.
- One way: a rough analysis of mockup use cases. Give the robot realistic jobs. Derive the requirements and the design decisions from what goes wrong in those jobs.
- This video does that in the open, with a frontier model as the analysis partner, and ends with a wall of requirements and a plan to test them.

**Verbal Camera Script.**

"A useful platform for social robotics."
Everyone agrees that that is what we want, but nobody can really articulate what it's supposed to do.

We can fantasize about lofty features,
dream of futuristic AI integration, or,
just hand the entire problem to a big LLM in an attempt to one-shot it.

However, before jumping into the vibe coding abyss, we'd probably do well to figure out what we really mean.
What must the robot be able to do?
What specifications are important?
How does the platform actually becomes useful?

One way through this seemingly impossible challenge, is to start with a rough analysis of a few mockup use cases. Give the robot realistic jobs, and then, derive the requirements and design decisions from what goes wrong in those jobs.

**On screen.** Camera, Desmond. One board still at the end as the promise.

## 3 · The exercise — 3:00

**Purpose.** Why this route, and why the usual route does not get there, without insulting anyone who is on it.

**Beats.**

- Open on the four floor maps, drawn in one after the other, four-up. They stay on screen for the whole chapter so the speech can point at them.
- What usually happens: teams just try things, and when it keeps going wrong they tell the model to do it right. Framed as the natural first move that we made too, with the lab's own "do it right" prompt as the example. The problem is not the instinct, it is what you learn from it: anecdotes, not requirements.
- Why "do it right" cannot work here: the model has no way to know what a mistake is in this room, because nobody has written down what the job is. That knowledge is what the platform has to provide.
- The inversion stated plainly. Ask what goes wrong, not what features are needed. Features are endless and job-specific; failures are finite and show up in every job.
- Four domains in one sentence each, each map highlighted as it is named: museum guide, hospitality, care, stage presentation with questions. Optional aside for viewers inside the company: a stage presentation done well persuades investors, and it is in the set already, so it costs nothing extra.
- The axis table, grown rather than dropped in: ask what varies between these four jobs for the robot, one question at a time, and each question becomes a row. Then the point: every row has its extremes covered somewhere, so a platform that handles all four columns has no obvious hole.

**Verbal Camera Script.** Draft, to be rewritten in Desmond's voice.

How do teams usually go about this? The way we did: you just try things.
Wire a model to a camera and a microphone, put the robot in a room, see what happens.
When it goes wrong, you fix the prompt. When it keeps going wrong, you tell the model to do it right.
We have that prompt in the lab. It is the "make no mistakes" of vibe robotics.

It's not foolish. It's the fastest way to get anything working, and everyone starts there.
But you learn the wrong thing from it.
A good demo may be luck. A bad one doesn't tell you which of twenty things failed.
You collect anecdotes, not requirements.

And "do it right" is not a requirement.
The model can't know what a mistake is in this room, because nobody wrote down what the job is.
Six people. One of them works here. Forty minutes left. Nile already gone.
That knowledge is what the platform has to provide. A better prompt can't.

So we turn the question around.
Not "what should the robot do", but "what goes wrong when it does a job".
Features are endless. Failures are finite, and the same ones show up everywhere:
the wrong name, the lost straggler, the missed question, the overrun.

That's why we need jobs. Four of them.
A museum tour: strangers, an hour, a noisy hall, a schedule.
A hotel: guests who return for years, a front desk, money and room keys at stake.
A care home: the same people for months, faces and voices that drift, a nurse with the final say.
A stage talk with questions: a hundred people it will never know, a microphone, a clock.

Why these four? Because of what varies between them, for the robot.
How long must it remember someone? How many people, and does it know them?
Who can overrule it? Does it move? What does a mistake cost?
Is repeating itself annoying, or reassuring? Where does its knowledge come from?
Rows and columns, and you get this table.
Every row has its extremes covered. A platform that handles all four has no obvious hole.

I picked these jobs. Nobody surveyed the market.
But they are concrete enough to argue with. Let's start with the museum.

**On screen.** The four floorplans drawn in at the start: walls draw themselves, exhibits and furniture pop in, the robot drops onto each plan. They stay as the backdrop, dimmed during the "just try things" part, each one highlighted as its domain is named. Optional cut-in for the "do it right" line: the robot alone on the museum map with a bubble that says "Make no mistakes." The AxisTable appears one row per question as the questions are asked, the four columns filling in, then the whole table for the coverage line. Camera for the rest.

**Stage column for the axis table.** The other three columns are in INIT.md.

| Axis                | Stage presentation with questions                                                                                      |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Interaction horizon | One session of 20 to 60 minutes, then forget                                                                           |
| Identity set        | Open and anonymous. Identity by seat and appearance for the length of a question. A few known people, such as the host |
| Who has authority   | The host or session chair, and the talk plan                                                                           |
| Mobility            | Stationary on stage. Gaze and turning only                                                                             |
| Failure ceiling     | Reputational, amplified by audience size and the recording                                                             |
| Repetition          | Must not repeat within the talk. A recap is welcome                                                                    |
| Knowledge source    | The talk itself, slides and notes, plus prepared question material. Out-of-scope questions are declined gracefully     |

**Gap.** The domains are chosen by judgment, not by survey. The speech says so.

## 4 · Worked example, the museum — 8:00

**Purpose.** Produce the first dozen cards from one concrete analysis, so the method has something to show for itself before it is explained.

**Beats.**

- On location. In front of a museum if permission works out, otherwise anywhere outdoors, in nature or near a landmark. The setting is a backdrop, not a prop. Set up the job: a one-hour tour, a group of strangers, a schedule.
- The prompt, briefly, as a screen recording of a clean Claude session. Do not explain it yet.
- Walk the output concern by concern. Each concern gets a ten-second scene and a card that lands on the board. Each scene adds the layer the robot would need: the first perception concern introduces the belief ghosts, the first conversation concern introduces the heard bubble, the first tour concern introduces the budget bar.
- The three lists below come from the first run in INIT.md and are placeholders. The real cards come from a fresh, recorded run of the same prompt, and the scene selection is made from that output.
- Perceiving the group: group membership, identity from behind, non-cooperative enrollment, name binding, map frame.
- Talking with the group: addressee detection, per-person conversation state, overlapping speech, floor control, per-person language.
- Running the tour: executive owns the schedule, moving on as a social act, promise tracking, content grounding, context budget, degradation and handoff, privacy, cannot iterate live.
- End with the cards in three loose piles.

**On screen.** Camera on location. Screen recording of the clean Claude session, raw output, nothing cleaned up. Twelve to eighteen Scene traces. Board composition building the three piles. Candidates to become cards only if the chapter runs long: map frame, per-person language, privacy.

**Gap.** Identity drift under non-cooperative enrollment is unmeasured in Thalamus today.

## 5 · The method revealed — 3:00

**Purpose.** Now that the output is visible, dissect the prompt so the viewer can judge and copy it.

**Beats.**

- Anatomy of the prompt: what the platform already does, a concrete scenario, two or three seed examples to set granularity, an explicit ask to ground answers in the current system.
- It is a conversation, not one prompt. The follow-ups were the cross-domain comparison, the deterministic versus LLM split, and the simulator needs.
- Caveat. The output is a hypothesis list. Human judgment prioritizes it. Simulation and lab evidence validate it.

**On screen.** Text composition scrolling the prompt from the recorded session, verbatim, with timed highlights per part. Short camera interlude for the caveat.

**Gap.** The prompt was written by someone who already knew the codebase. A newcomer's prompt would yield shallower concerns.

## 6 · Generalization test — 6:30

**Purpose.** The intellectual payoff: the same analysis on three more domains, shown as a diff against a board the viewer already knows.

**Beats.**

- Run the same prompt on hospitality, care and the stage, in the same recorded session. Do not walk every concern.
- Board diff. Repeated concerns gain a second and third dot. New cards appear: role as a world-model fact, external record linkage, identity lifetime and drift, staff override, proactive initiation, confidence gates on speech, templated read-backs.
- The stage adds its own: far-field speech in a crowd, spatial reference as identity (third row, red sweater), question-time floor control at scale with the host as arbiter, staying inside the talk's scope, interruption and heckling, the talk flow owned by the executive with questions as a sub-state, silence after "any questions". It reinforces addressee detection, overlapping speech, time budget, content grounding, handoff to the host, staff override, proactive initiation and confidence gates.
- Some cards gain a parameter annotation. Identity retention: one hour, days to years, months to years, one question.
- The classification: four dots means platform core, same card with different values means a configuration parameter, one dot means a domain plugin. Two or three dots is where the judgment calls live, and a sentence each is enough.

**On screen.** Two board states animating one into the next. Four to six short Scene traces on the hospitality, care and stage floorplans for the new cards, with Wendy and Janet as staff and host.

**Gap.** Hospitality, care and the stage were analyzed in one pass each. The museum got the depth.

## 7 · From concerns to requirements — 5:00

**Purpose.** Turn the board into design choices for the platform, beyond the basic components.

**Beats.**

- Regroup the board by platform part: world model, executive, LLM, memory, actuation, handoff to staff.
- Two or three requirement statements per part, each with its three-domain column.
- Speech, recorded by Desmond: how this leads to the design choices for the platform beyond the audio and video pipelines. Which parts are deterministic, where the LLM sits, what the interface between them is.
- The boundary as a rule: the LLM proposes, the executive disposes, and the line is drawn by failure cost, not by difficulty. Three LLM roles of increasing risk: speaker, interpreter, planner. Each domain stops at a different one.

**On screen.** Board regrouping animation, cards travelling to their part columns. Requirement statements as cards with the part tag. Camera for the speech.

**Note on formatting the speech.** The SingularityNET side should see themselves in the agent part. That changes the form of the spoken text, not its content: each requirement for the agent is stated as the requirement, then what any solution to it needs, in neutral terms, so that as these requirements trickle down from the research they can see how their tools would meet them. The board does the deriving; every boundary statement traces back to a card. The organizational side stays out of the video.

**Gap.** The handoff contract with human staff is undesigned. It is the most reused behaviour and the least specified.

## 8 · How would you know — 4:00

**Purpose.** This is where the time is won, if it is done right. Every requirement implies a test, and if the loop from scene to simulation to lab to replayed log closes, every failure becomes a regression test and iteration stops depending on rare live runs.

**Beats.**

- Three tiers. Simulation handles scale, rare events, injected perception errors. The lab handles acoustics, real people, latency, hardware. The field handles what remains.
- This is why the webui shows the exact traces of what is going on. The animation idiom used all video is that view. One trace format, three producers: authored scenes, simulator runs, live pipeline logs. Any of them replays through the same renderer.
- This is why an automatic simulation and testing system is on the plan, not a nice-to-have.
- The staged identity protocol from VISUALID.md as an example of lab discipline that already exists.
- Metrics that matter: on-schedule rate, group cohesion, identity and addressee accuracy, repeat rate, escalation correctness.

**On screen.** Ladder composition. A screen recording of the webui trace view next to the same trace rendered in the video idiom, so the viewer sees it is one format. One Scene trace replayed with injected perception errors, truth and belief diverging. Camera for the VISUALID example.

**Gap.** The simulator does not exist yet. Say which perception error rates must be measured before its noise models are credible.

## 9 · The board stays — 0:45

**Purpose.** Close without over-promising the structure of the series.

**Beats.**

- The finished board, regrouped by part, no episode labels.
- Later episodes pick cards off this board, not necessarily one cluster at a time, and put them back updated.
- One line on what comes next, only if it is already certain.

**On screen.** Board composition, final state, slow highlight sweep, no labels.

## Asset inventory implied by this script

| Asset                                                                        | Count    | Producer                     |
| ---------------------------------------------------------------------------- | -------- | ---------------------------- |
| Failure footage montage                                                      | 1        | editor, found footage        |
| Master trace, cold open, minimal layers                                      | 1        | Scene                        |
| Museum concern traces                                                        | 12 to 18 | Scene                        |
| Hospitality, care and stage traces                                           | 4 to 6   | Scene                        |
| Injected-error replay                                                        | 1        | Scene                        |
| Floorplan reveal, four-up                                                    | 1        | Scene or its own composition |
| Concern cards                                                                | 22 to 25 | Card                         |
| Board states                                                                 | 6        | Board                        |
| Axis table                                                                   | 1        | AxisTable                    |
| Ladder                                                                       | 1        | Ladder                       |
| Prompt with highlights                                                       | 1        | Text                         |
| Webui trace recording                                                        | 1        | screen capture               |
| Floorplans                                                                   | 4        | data                         |
| Camera: introduction, exercise speech, requirements speech, caveat, VISUALID | 5        | camera                       |
| Camera on location, museum                                                   | 1        | camera                       |

## Tooling implications

- Scene needs layer toggles per trace: gaze, headings, belief, hull, budget, ticker, narration. The cold open uses almost none, and chapter 4 switches them on one at a time.
- A floorplan reveal animation: walls draw in, features pop, robot drops in. Four plans on one canvas.
- The Text composition for chapter 5 is confirmed.
- The webui trace view and the video renderer must read the same trace format for chapter 8 to be honest. That is the one piece of shared contract with Thalamus.

## Honest gaps, per chapter, for review

| Chapter          | Gap proposed                                                  | Say it on camera? |
| ---------------- | ------------------------------------------------------------- | ----------------- |
| 3 The exercise   | The domains are chosen by judgment, not by survey             | yes               |
| 4 Museum         | Identity drift under non-cooperative enrollment is unmeasured | yes               |
| 5 Method         | The prompt author already knew the codebase                   | yes               |
| 6 Generalization | Hospitality, care and the stage got one pass each             | yes               |
| 7 Requirements   | The handoff contract is undesigned                            | yes               |
| 7 Requirements   | The agent structure is not yet agreed with partners           | probably not      |
| 8 Testing        | The simulator does not exist; error rates are unmeasured      | yes               |

## Decisions taken

- Title: Inventing Jobs for a Robot.
- Model output on screen is raw: a screen recording of a clean Claude session running the prompt from INIT.md, including the follow-ups.
- The robot has no name. The platform is for all robots.
- No length or split decision. Chapters are parts, assembled in the editor. Voice-over approach open.
- The cold open is comic with a sarcastic voice-over, and shows only what the robot knows.
- The stage presentation is one domain among four, not elevated. One line for internal viewers about investor persuasion at no extra cost.
- The SingularityNET consideration is a formatting rule for the chapter 7 speech, not a content change.
- Four dots means core. Two or three dots get a sentence each, not a rule.

## To do

- Re-run the INIT.md prompt in a clean Claude session, screen-recorded. The card set, the scene selection for chapter 4, and the vocabulary schedule all follow from that output. Desmond.
- Failure footage for chapter 0: clips and the rights to use them. Desmond.
- Filming location for chapter 4: museum with permission, or outdoors near a landmark. Desmond.

## Still open

- Which concerns get a scene and which are cards only. Decided after the re-run.
- The vocabulary schedule for chapter 4: which scene introduces which layer. Decided after the re-run.
- Whether the chapter 8 webui recording shows the live pipeline or a replayed log.
- The honest gaps per chapter, as listed above, still need a yes or no each.

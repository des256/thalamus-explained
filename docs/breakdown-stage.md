# PROMPT

Thalamus brings perception and rudimentary action to a higher level, i.e. the most significant interface is inside the agent part, where a behavior tree and/or LLM proactively control the robot, taking into account what different people say to it, and other observations that trickle through the input pipelines. - In actual use cases for social robotics, there is a higher perspective. For instance, when a robot needs to give a stage presentation, it needs to understand who is who, where the audience is, structure the talk, answer questions and handle fundamental social interaction with the people reliably and naturally. What are some high-level challenges you see? Things like: disambiguating the people, keeping track of conversations with specific people, understanding some sort of higher level goal about the talk, keeping track of time, etc.

# ONE

I read the design docs in docs/ and the current agent, world model and event code before answering. Below is my assessment of the high-level challenges, grouped by theme, with notes on what the existing designs already cover and where the gaps are.

Where the current design stops

The existing notes on spatial presence, promotion, proactive context and behavior arbitration all operate at one level: who is where, who is speaking, where to look, when to fire the LLM. A stage presentation introduces a layer above that with no representation yet: an activity with roles, structure and a timeline. The Action enum today is say, look at an ID, gesture. The agent has no vocabulary for a plan, a time budget, a floor state or a group. Most of the challenges below follow from that missing layer.

Challenges on the people side

- Identity is not role. The world model yields face and voice IDs plus positions. A talk needs roles: host, co-presenter, the questioner who currently holds the floor, the AV person. Roles are assigned over time from behavior and context, not from embeddings, and they change mid-session.
- The audience is mostly anonymous. Face and voice galleries help with the host and a few known people, not with a room of strangers. The primary key for an audience member becomes a stable spatial slot. That needs world-space presences that survive gimbal sweeps, which the spatial doc already notes is blocked on the gimbal to world transform.
- Perception scale breaks at room distance. Faces at several meters are tiny, depth is noisy and embeddings fail. Audience sensing will likely come from body and pose detection as aggregates, not from per-face tracking. The promotion rules are built around face and voice IDs, so the anonymous-but-stable case needs attention.
- Group as a first-class entity. Your thoughts doc already lists free, address one person, address group. The audience needs a shape, a centroid, a density and group-level attention. Nothing in the world model represents an area rather than a set of points.
- Handle stability under merges and splits. The LLM will refer to people by handles like the proactive doc's unknown001. When the world model later promotes unknown003 to a recognized person, the chat history and any pending follow-ups must be reconciled without confusing the model.
- Perception error becomes social error. Naming the wrong person, looking at an empty chair, or answering a question that was ASR hallucination on applause is costly on stage. Confidence thresholds should be context dependent. Use a name only when face and voice agree, otherwise fall back to a positional address.

Challenges on the conversation side

- Addressee detection and floor state. The behavior doc correctly keeps "who is being addressed" out of the world model. But the stage case needs explicit floor machinery in the agent: broadcast to the room, host interrupt, audience question, side talk to ignore. An LLM judgment call per utterance is too slow and too unreliable for this.
- Per-person conversation threads. A questioner's follow-up must link to their thread, not to the room. Chat history needs to be keyed by presence, with a separate room thread. The flat conversation block in the proactive context design does not carry this.
- Hostile audio environment. PA systems, the robot's own speech echoing back, applause, laughter and far-field speech will hammer VAD, ASR and DOA. Direction of arrival will often point at loudspeakers. Self-speech suppression is on your TODO as audio status bookkeeping and it becomes critical here.
- Repair strategies as a skill. Because input will be uncertain, the agent needs explicit repair moves: ask to repeat, ask the person to come closer, or paraphrase to confirm. That is a conversational competence, not a perception fix.
- Interruptions and resumption. The host says two minutes left mid-sentence. The agent needs a preemption model at the dialogue level, mirroring the gimbal arbitration in the behavior doc, and a way to remember where it was so it can resume.
- Within-session memory. Do not repeat the joke, give others a turn, honor "I'll come back to that in the demo." The recency summarization idea is right but the summary must be structured: commitments, answered questions, open items. Prose compression loses exactly these.

Challenges on the goal and time side

- The talk as an explicit plan. Intro, sections, demo, Q&A, close, each with content, a target duration and an expected interaction mode. LLMs keep this implicitly at best. It has to be explicit state, injected into context the same way the proactive doc injects world state, and consulted by whatever drives the skeleton.
- Progress tracking and replanning. Running long means compressing remaining sections. A long question means deferring to the end. This is a hierarchical task with contingencies. A behavior tree fits the skeleton well, with time-guard decorators on sections and the Q&A as a bounded loop.
- Three distinct clocks. Wall-clock budget needs a time-remaining signal in both the context and the tree's guards. Conversational timing is a different problem: human turn gaps are a few hundred milliseconds while LLM plus TTS is seconds, so fillers, gaze shifts and backchannels must come from fast local reflexes below the LLM. Speech duration is the third: the agent must know how long an utterance takes before committing to it, and must be able to cancel its own speech on barge-in. The current say action is fire and forget with no progress or cancellation.
- Scripted versus improvised content. Planned sections can be pre-generated and even pre-synthesized, giving zero latency and consistent delivery. Only Q&A and interruptions need the live LLM path. This is a third tier beyond the fast and slow paths in the proactive design, and it is a cheap win.
- Reading the room. Pacing decisions want aggregate engagement: fraction of gazes toward the stage, posture, laughter. This is the most research-heavy item and sits on top of the pose and gaze crates as statistics, not per-person state.

Architectural consequence

The behavior doc already separates the world model as a service from swappable agents. The presentation scenario argues for one more layer above the reactive agent: a director that owns the agenda, the clock and the floor state, configures the reactive loop with the current section and addressing mode, and receives summary events back. The key design decision is whether that director is a behavior tree with LLM leaves or an LLM with a behavior-tree tool set. My recommendation is deterministic skeleton and generative leaves. Timing, interruption and turn management must be predictable. Language should be generative.

Two smaller consequences follow. The language to world grounding needs an explicit resolver both ways, from "the gentleman in the back" to a presence ID and from a presence to a stable handle the LLM can use. And the whole director layer needs the same simulate-and-assert testability the behavior doc claims for the world model: scripted scenarios of synthetic events and interruptions at known times, with assertions on the emitted actions. Your synth directory suggests the perception side already has that habit. The agent side will need it even more.

# TWO

The repo already covers a lot of the perception-to-agent plumbing in docs/BEHAVIOR.md, docs/PROACTIVE.md and docs/SPATIAL.md. Below is my view of the layer above that, using the stage talk as the test case. I've grouped the challenges, and noted where the current design would need to bend.

People and conversations

- Two notions of identity, not one. The social world model answers "which track is which face and voice." The talk needs "who is this person socially": host, co-presenter, the questioner from ten minutes ago, the person who introduced themselves as Maya. Names and roles arrive through dialog, not through the camera. Binding a spoken name to a presence ID, and keeping that binding when the face track drops and re-acquires, is a real problem the current fusion code in crates/shared/src/representation.rs does not touch.
- Facts learned by talking need a path back into the world model. BEHAVIOR.md draws a firm line: the world model holds state, the agent holds interpretation. That line is right, but it is currently one-directional. "No, I'm not Ben" is negative evidence that should unbind an identity. "I'm the host" is a fact. You need a narrow, typed channel from agent to world model for dialog-learned facts, or the agent ends up keeping a shadow registry.
- The audience is a collective, not forty unknowns. A presence registry with unknown001 through unknown040 is useless to an LLM and expensive to maintain. You need a group entity with aggregate state such as size, attention level, laughter, restlessness, plus a promotion rule that lifts an individual into the registry only when they become a participant. PROMOTION.md looks like the natural home for that, but the group abstraction itself is missing.
- Addressee detection is the hard social problem. In a hall there are many concurrent conversations: audience members whispering, the host leaning in, a questioner at the mic. ASR gives a transcript without an addressee. BEHAVIOR.md deliberately leaves "who is being addressed" to the agent, which is correct, but it means the agent needs fused cues such as direction of arrival, speaker identity, gaze toward the robot, and content, plus a decision policy for "this was not for me, ignore it."
- Conversations are threads, not one chat log. The LLM's linear history cannot represent the questioner thread, the host side-channel ("five minutes left"), and the main talk at once. A thread model keyed by participants, with open and closed states and commitments ("I'll come back to your question") is needed. Context building then becomes thread selection, which is a bigger version of the recency-weighted summarization already sketched in PROACTIVE.md.

Goal, plan and time

- The talk is a plan, and the LLM should not own it. Left to itself an LLM drifts, repeats, and forgets which section it is in. The outline, current section, what was covered, what was skipped, and deferred questions should be explicit state owned by the behavior tree. The LLM fills in content and handles nuance. This is the hard-wired versus tag-driven agent split from BEHAVIOR.md Part 2, applied one level up.
- Interruption and resumption. A question mid-section pushes a new discourse segment; answering it pops back to where the talk was. This is classic dialog management, Grosz and Sidner's attentional stack, and it does not fall out of a chat history. Without it the robot either ignores the question or never returns to the talk.
- Time is a hard constraint and a first-class input. The agent needs a time budget per section, a pacing policy for running behind or ahead, and an estimate of how long each planned utterance will take to speak. Clock state has to be injected as structure ("four minutes left, two sections remain"), not inferred by the model. The heartbeat trigger in PROACTIVE.md is the right hook for this, but the budget logic is missing.
- Actions take time and the world moves underneath them. Saying a thirty-second paragraph is a long-running task that can be preempted. The agent needs action status: started, interrupted at word N, completed. Chat history must record what was actually heard, not what was planned. The TODO item "audio status bookkeeping" is exactly this, and it matters far more on stage than in a one-on-one chat.

Turn-taking, gaze and the room

- Barge-in and yielding. Stop talking when the host says stop, yield when a questioner starts, but do not stop for audience chatter. That needs the per-identity is-speaking signal from the world model plus a policy that treats the host differently from the crowd. Some of these must be hard guarantees in the tree, not LLM judgement calls.
- Gaze over an audience is a distribution, not a target. The arbitration in BEHAVIOR.md picks one target. Presenting needs a scan-the-audience behavior with its own urgency profile, gaze to the questioner during Q&A, and gaze to the host when addressed. The structure generalises, but the behavior set grows.
- Stage geometry breaks assumptions. Faces at eight meters are tiny, recognition degrades, RealSense depth runs out, and direction of arrival in a reverberant hall is noisy. The merge thresholds in the representation code were tuned for tabletop distances. Expect the perception layer to deliver lower confidence, which pushes uncertainty handling into the agent.

Robustness and evaluation

- Confidence-aware behavior. PROACTIVE.md already flags false positives. On stage, mistakes are public. The agent needs hedging strategies ("I think you asked earlier about...") versus committed ones, driven by world model confidence, and a correction path when it gets it wrong.
- Memory across scales. Working memory for the talk, episodic memory across talks, and "don't tell the same joke twice." The summarization tiers in PROACTIVE.md handle minutes. Nothing yet handles hours or days.
- Adversarial input. Hecklers, off-topic questions, and prompt injection via signs or spoken instructions. A behavior tree gives invariants the LLM cannot: never exceed time, always stop on host command, never leave the talk's topic set. This is the strongest argument for the tree owning structure and the LLM owning content.
- How do you test any of this? A stage talk cannot be rerun forty times. The synth tooling in SYNTH.md and the synth/ directory points the right way: scripted audience scenarios fed into the world model as typed events, with assertions on agent actions and timing. That testability argument is already in BEHAVIOR.md Part 2 and becomes essential here.

What this implies for the current design. Four things would need to change rather than just grow. The world model needs a group entity and an agent-to-world feedback channel for dialog-learned facts. The agent context needs threads and plan state instead of a single history. Time and action status need to become typed inputs to the agent. And the agent split should be behavior tree for structure and invariants, LLM for content, rather than either one alone.

# THREE

Thalamus today ends at the world model boundary. The design docs draw a clean line: the world model answers who, where, speaking or not, and how confident. Everything in your list lives above that line. Here is how I would group the challenges, grounded in what the docs already sketch.

Who is who

- Identity is a revisable belief, not a label. The representation lattice in PROMOTION.md promotes a person from "somewhere" up to "known face at a position." The agent-level problem is that promotions are retroactive. When unknown002 turns out to be maya, every conversation turn, memory, and plan reference keyed to unknown002 must be re-keyed. Merges and splits go the other way: two presences become one person, or one presence was two people who crossed paths. You need stable handles that survive identity-graph edits, which is closer to entity resolution than to face recognition.
- Roles matter more than names. On stage the useful handles are host, introducer, current questioner, AV tech, and audience. Most of these people will never be recognized by face, and they don't need to be. "The person who asked the latency question" is a perfectly good identity for one talk. Roles are assigned to identities, are scenario-specific, and change over time. The world model should not know about roles. The agent must.
- The audience is an entity, not a hundred presences. The world model is per-person. At ten meters, face embeddings and landmarks are unreliable, and tracking a full hall on a Jetson is both infeasible and semantically wrong. You need an aggregate representation: a spatial region, aggregate attention, and aggregate reaction like laughter, applause, murmur, or silence. Then a mechanism to peel one individual out of the aggregate when a hand goes up. The "address group" mode in THOUGHTS.md is the seed of this. Sensor reality bites here too: ReSpeaker direction-of-arrival in a reverberant hall with a PA, and the robot's own voice coming back through the room.

Conversation and the floor

- Addressee detection is the central multi-party problem. Is this utterance for me, for the host, or two audience members talking to each other? BEHAVIOR.md correctly puts this on the agent side. It is hard enough that it probably deserves its own reusable layer between world model and agent policy. Call it a situation model: it proposes floor holder, addressee hypotheses with confidence, and engagement estimates, without deciding what to do about them.
- Conversation threads per person, interleaved. During Q&A someone follows up on a question from earlier, the host interjects, a second questioner starts before the first is done. You need per-participant dialog state, meaning what they asked, whether it was answered, whether they seemed satisfied, plus a notion of who holds the floor. A flat chat log loses this.
- Interruption, including of the robot itself. Speaking is a long-running action. The robot needs to listen while it speaks, distinguish backchannel and laughter from a real barge-in, and stop mid-utterance when the host says "wrap up." Then plan state must reflect what was actually said versus what was planned. The "audio status bookkeeping" item in TODO.md is the prerequisite.
- Grounded reference in both directions. Inbound: "what about the thing you showed earlier" or "the guy next to me asked." Outbound: "yes, you in the back with the raised hand," which only works if the gimbal points at the right person as the words come out. Speech and gaze have to be generated as one coordinated act.
- Repair. The robot will misidentify, mishear a distant questioner, and answer the wrong question. Graceful recovery, like paraphrasing back, asking the host to relay, or saying "I didn't catch that", matters more for perceived competence than raw accuracy.

Goal, time, and who is in charge

- The talk is a hierarchical plan with interruptions. Intro, sections, demo, Q&A, close. The hard part is deviating for a mid-talk question and resuming at the right point without repeating yourself. LLM chat history is a poor representation of plan progress. Plan state should be explicit, owned by something other than the LLM, with the LLM reading it and reporting progress into it.
- LLMs have no clock. Hard deadline, per-section soft budgets, pacing, pauses for laughter, not talking over the host. Time remaining and time-in-section must be injected as state, with policies for compress, skip, and cut Q&A. Silence durations matter too: how long since anyone spoke, how long the questioner has been talking.
- Uncertainty has to reach the decision layer in usable form. The "false positive amplification" concern in PROACTIVE.md gets worse in a hall. A behavior tree can branch on a confidence number. An LLM needs it in words, such as "someone on the left may have asked about latency, low confidence." How confidence crosses that boundary is a design problem in its own right.
- Memory on three time scales. Within-talk, across events, and persistent profiles. All of it is keyed by identity, so it inherits the merge and split problem above. Persisting embeddings and conversation records about audience members also raises consent questions worth deciding deliberately.
- Robustness on stage. Prompt injection via a sign or a heckler, someone trying to make the robot say something inappropriate, LLM or camera failure mid-talk. The fallback should be a scripted talk, not a frozen robot.
- Rehearsal and evaluation. You can't iterate on this with a live audience. Recorded event streams replayed against the agent, and synthetic audiences in the spirit of SYNTH.md, are how you test the policy layer without the perception stack.

On the behavior tree versus LLM split, my recommendation: let a behavior tree or hierarchical task network own the macro structure: phases, time, floor management, safety, and fallbacks. Let the LLM own content and interpretation inside the slot the tree hands it, and let it emit tagged micro-actions as sketched in BEHAVIOR.md Part 2. Don't let the LLM own the clock or the plan cursor. It is bad at both, and those are exactly the things a stage talk cannot get wrong.

# FOUR

Here is my assessment, grounded in the current Event and Action enums plus the SPATIAL, PROACTIVE, PROMOTION and BEHAVIOR docs.

The framing first. A stage talk is not a bigger conversation. It inverts most defaults the one-on-one design assumes. Speech that is heard is by default not addressed to the robot. The robot holds the floor instead of waiting for a trigger. Roles matter more than identities. Spatial knowledge degrades to bearing-only. The practical consequence is that the agent needs an explicit phase or regime, and nearly every policy below should be parameterized by it.

Who is who

- Roles are not identities. Thalamus produces embeddings and a visual or audio ID. The talk needs host, current questioner, operator and audience. Roles are assigned by script, by inference such as "whoever introduced me", or by an operator, and a questioner is a role attached to an anonymous face for ninety seconds.
- The audience is a collective, not N presences. The event stream and presence registry are per-individual. At audience distance faces get too small for reliable embeddings, depth gets unreliable and tracks churn. The agent needs an aggregate instead: a bearing sector, rough size, fraction facing the robot, and collective reactions.
- Laughter, applause and murmur are events in their own right. VAD is likely to fire on them and ASR will produce garbage. There is no non-speech audio event in the current enum, and a presenter reacts to these constantly.
- Naming is high-stakes. A wrong name on stage is far worse than no name. The agent needs a confidence policy gating name use, and the false-match incident in VISUALID.md is the motivating case.
- The stage has fixed landmarks. Screen behind, audience in front, lectern to one side. The social world model only knows perceived presences today. Configured static presences would let the robot look at "the audience" or "the screen" without perception, and LookAt currently only takes an identity.

Conversation and the floor

- Addressee detection is the central decision. BEHAVIOR.md rightly keeps it in the agent. On stage the default flips to "not for me" and the positive signals differ: a raised hand, a microphone handed over, the host naming someone. The pose crate has the raw signal for a hand-raise detector, but no event for it exists.
- Multiparty floor management. Open the floor, select a questioner, hold the floor while answering, close it. Bohus and Horvitz's multiparty engagement model and Mutlu's gaze-footing work are the standard references, recalled rather than verified. Gaze is as much an output cue here as an input, since where the robot looks tells the room who it addresses.
- Barge-in is role-dependent. The host interrupting should stop the robot mid-sentence. An audience member talking should not. Say has no cancel, pause or resume, and the agent cannot know what was actually heard before a cutoff. The "audio status bookkeeping" item in the TODO is exactly this gap.
- Threads per person, not one chat log. Q&A produces several short threads: what this person asked, what the robot promised to return to. A flat history loses that, and the thread has to survive the person being anonymous.
- Deixis and joint attention. "What about the thing on the slide" or "as he just said" must resolve against the world model. The gaze and pose crates supply the raw signal, but the LLM context needs stable per-presence labels so references can resolve in text.

Goal, time and robustness

- The talk is a plan, not a prompt. Sections, slides and budget belong in a script state machine or behavior tree, with the LLM doing realization and answering. Left to context alone the model drifts, skips or repeats. Resumption after a digression needs an explicit "where was I" pointer.
- Mostly pre-generated, live at the seams. Local LLM latency is acceptable before an answer and unacceptable mid-sentence. Generate content ahead, adapt live at transitions, reactions and Q&A.
- Time is a first-class input with several clocks. Wall-clock budget, per-section pacing, a human "five minutes" signal, and the duration of the next utterance. Pacing is impossible without a TTS duration estimate before speaking. A compression policy is needed too: skip a section, go to the close.
- Phase-parameterized triggers. The trigger table in PROACTIVE.md assumes a robot waiting to initiate. During the talk the heartbeat is irrelevant. During Q&A, silence plus attention means "ask for the next question". Same table, different parameters per phase.
- A trusted back channel. A host or operator should be able to send "wrap up" or "the answer is X" with more trust than anything perceived. This also answers the prompt injection concern in PROACTIVE.md, since trust attaches to role rather than to words.
- Degrade without stopping. If the camera drops or the mic saturates, the talk continues blind. Each policy needs a fallback that runs on fewer inputs.
- Confidence must reach the agent. The promotion states in PROMOTION.md are the right idea. The agent needs them alongside the ID to decide whether to name, to look, or to ask.
- Evaluation needs replay. "Natural" has no ground truth. Scripted scenarios against a simulated world-model stream, which BEHAVIOR.md already proposes, are how to test "host introduces, three questions, one interruption, one time warning".

Where I would start. Three pieces unlock most of the rest. An explicit phase in the agent that parameterizes the trigger table and the addressee default. Roles layered over identities in the world model, including a crowd aggregate and configured landmarks. Output-state feedback so the agent knows what it has said and can be interrupted cleanly.

# COMBINE

I just gave a design prompt to Fable to describe the gap between an actual stage presentation example in real-life, and what Thalamus currently has to offer. Fable came back with a bunch of answers, and some form of ordering, which was really helpful. However, when I gave the exact same prompt to 3 other Fable instances with the same context, I got three different breakdowns. I'm guessing that doing this exercise 26 more times will give a grand total of 30 different breakdowns. But, of course these are actually all the same, so it's probably possible to extract one single breakdown that covers everything. Can I paste the four breakdowns here, and then get a unified breakdown covering all variations?

# RESULT

Verified against the code before merging: the core Event enum has faces, VAD, audio direction, speech continuity, audio ID, speech and sentiment, and nothing for non-speech audio, pose or time. The Action enum is Say with no cancel or progress, LookAt taking only an identity, and a bare Gesture. The TODO has "audio status bookkeeping, update chat history". So every concrete repo claim the four made holds.

The four breakdowns are the same analysis with different cuts. Twelve items appear in all four, a further eight in three, and the rest are single-instance ideas. One framing sentence from the fourth captures what the others say piecewise: a stage talk inverts the one-on-one defaults. Heard speech is by default not for the robot, the robot holds the floor instead of waiting for a trigger, roles matter more than identities, and spatial knowledge degrades to bearing only.

Unified breakdown

## People and the room

1. Roles, not identities. All four. The world model yields face and voice IDs plus positions. The talk needs host, co-presenter, introducer, current questioner, operator or AV person, and audience. Roles are assigned over time by script, inference, dialog or an operator, are scenario-specific, change mid-session, and often attach to an anonymous face for ninety seconds. Only 2 adds the sub-problem of binding a spoken name to a presence and keeping it through a track drop and re-acquire.

2. The audience is one entity, not N presences. All four. Per-person tracking of a hall is infeasible on the Jetson and semantically wrong. The aggregate needs a region or bearing sector, size, centroid and density, fraction facing the robot, aggregate attention, and collective reactions. The "address group" mode in the thoughts doc is the seed. Breakdowns 2 and 3 add a peel-out rule that promotes an individual into the registry when they become a participant. Breakdown 4 notes the pose crate has the raw signal for a hand-raise but no event exists. Breakdown 1 flags engagement estimation as the most research-heavy piece.

3. Perception degrades at stage distance. All four. Faces at several metres are too small for embeddings and landmarks, depth runs out, direction of arrival in a reverberant hall with a PA points at loudspeakers, and the robot's own voice returns through the room. Lower confidence gets pushed into the agent. Breakdown 1 adds that audience sensing shifts to body and pose aggregates, that self-speech suppression becomes critical, and that world-space presences surviving gimbal sweeps are blocked on the gimbal-to-world transform. Breakdown 2 adds that merge thresholds were tuned for tabletop distances.

4. Non-speech audio is signal, not noise. All four mention it, only 4 names the gap. Laughter, applause, murmur and silence drive pacing and reactions, while VAD fires on them and ASR hallucinates. There is no non-speech audio event in the enum. Breakdowns 2 and 3 model reactions as attributes of the group entity, 4 as discrete events. Both can hold.

5. Stable handles under identity revision. 1 and 3 explicit, 2 adjacent. Promotions are retroactive: when an unknown becomes a named person, every chat turn, memory entry and plan reference must re-key. Merges and splits go the other way. This is entity resolution, and the labels the LLM uses must survive it.

6. Fixed stage landmarks. 4 only. Screen, lectern and audience sector are known in advance. Configured static presences would let the robot look at the screen without perception. LookAt currently takes only an identity.

## Conversation and the floor

7. Addressee detection with the default flipped. All four call it the central multi-party problem and agree it belongs agent-side, as the behavior doc says. On stage most heard speech is not for the robot. Cues to fuse: direction of arrival, speaker ID, gaze, content, a raised hand, a microphone handed over, the host naming someone. Breakdown 1 insists per-utterance LLM judgment is too slow and unreliable. Breakdown 3 proposes a reusable situation-model layer that proposes floor holder, addressee hypotheses with confidence and engagement without deciding.

8. Floor management. 1, 3, 4 explicit, 2 via barge-in. Open the floor, select a questioner, hold while answering, close. Floor state distinguishes broadcast, host interrupt, audience question and side talk. Breakdown 4 cites Bohus and Horvitz and Mutlu, recalled not verified, and stresses that gaze is an output cue telling the room who is addressed.

9. Threads per person, not one chat log. All four. Questioner threads, the host side-channel and the main talk interleave. Thread state covers what was asked, whether it was answered, whether they seemed satisfied, open or closed, and commitments made. Threads must survive the person staying anonymous. Breakdown 2 reframes context building as thread selection, a bigger version of the recency summarization already sketched.

10. Interruption and resumption at the plan level. All four. A mid-section question pushes a discourse segment and answering pops back without repeating. Chat history cannot represent this, so an explicit "where was I" pointer is needed. Breakdown 2 names Grosz and Sidner's attentional stack. Breakdown 1 wants a dialogue-level preemption model mirroring the gimbal arbitration.

11. The robot's own speech is a long-running, interruptible action. All four, and the single strongest consensus. Say is fire-and-forget with no cancel, pause, resume or progress. The agent must listen while speaking, distinguish backchannel and laughter from real barge-in, stop for the host but not for chatter, and record what was actually heard rather than what was planned. All four tie this to the audio status bookkeeping TODO item. Breakdowns 2 and 4 want this as a hard guarantee in the tree.

12. Grounded reference in both directions. 1, 3, 4. Inbound phrases like "the gentleman in the back" or "the thing on the slide" must resolve to presences or objects. Outbound phrases like "you with your hand up" only work if gaze lands on the right person as the words come out, so speech and gaze are one coordinated act. Needs stable per-presence labels in LLM context and a resolver both ways.

13. Gaze over an audience is a distribution. 2, 3, 4. Current arbitration picks one target. Needs a scan-the-audience behavior with its own urgency profile, questioner gaze during Q&A, and host gaze when addressed.

14. Repair as a conversational skill. 1 and 3, 2 as a correction path. Ask to repeat, ask to come closer, paraphrase to confirm, ask the host to relay. Breakdown 3 argues recovery matters more for perceived competence than raw accuracy.

## Plan, time and control

15. The talk is an explicit plan the LLM does not own. All four. Sections with content, target duration and interaction mode, plus a cursor, what was covered, what was skipped and deferred questions. Left to context the model drifts, repeats and loses its place. The state lives in a tree, HTN or state machine, is injected into context like world state, and the LLM reads it and reports progress into it.

16. Time is a typed input with several clocks. All four. Wall-clock budget and remaining, per-section budget and time-in-section, duration of the next utterance before committing to it, and an external "five minutes" signal. Breakdown 3 adds silence durations and pauses for laughter. Pacing policies: compress, skip, defer a question, cut Q&A. The heartbeat trigger is the hook, the budget logic is missing. Utterance duration requires a TTS duration estimate that does not exist yet.

17. Conversational timing is a separate clock. 1 only. Human turn gaps are a few hundred milliseconds while LLM plus TTS is seconds. Fillers, gaze shifts and backchannels must come from fast local reflexes below the LLM.

18. Pre-generate the script, go live at the seams. 1 and 4. Planned sections can be generated and even pre-synthesized ahead for zero latency and consistent delivery. Only Q&A, reactions and transitions need the live LLM path. Breakdown 1 calls this a third tier beyond the fast and slow paths and a cheap win.

19. Phase parameterizes every policy. 4 explicit, 1 in substance. The proactive trigger table assumes a waiting robot. During the talk the heartbeat is irrelevant, during Q&A silence plus attention means "next question". Addressee default, barge-in policy and gaze policy all vary by phase. Breakdown 1's director configuring the reactive loop with section and addressing mode is the same idea.

20. Confidence must reach the decision layer in usable form. All four. Name only when face and voice agree, otherwise use a positional address. Hedged versus committed phrasing driven by confidence. A tree branches on a number but an LLM needs words, so the boundary crossing is a design problem in itself. Promotion states should travel alongside the ID. The false match in the visual ID doc is the motivating incident.

21. Memory across time scales. 1, 2, 3, with 4 covering the within-talk part through threads. Within-talk means not repeating the joke and honoring "I'll come back to that". Across events and persistent profiles come next. Breakdown 1 says the summary must be structured as commitments, answered and open items because prose compression loses exactly these. Breakdown 2 notes nothing handles hours or days. Breakdown 3 notes memory inherits the merge and split problem and raises consent for stored embeddings.

## Robustness and architecture

22. Adversarial input and trust. 2, 3, 4. Hecklers, off-topic questions, prompt injection via signs or spoken instructions. Breakdown 2 wants tree invariants the LLM cannot break: never exceed time, always stop on host command, stay in the topic set. Breakdown 4 adds a trusted host or operator back channel whose "wrap up" or "the answer is X" outranks anything perceived, because trust attaches to role rather than words.

23. Degrade without stopping. 3 and 4. If the camera drops or the mic saturates, the talk continues blind. Each policy needs a fallback on fewer inputs, and the floor is a scripted talk, not a frozen robot.

24. Agent-to-world-model feedback channel. 2 only. The state-versus-interpretation line in the behavior doc is one-directional. "No, I'm not Ben" is negative identity evidence and "I'm the host" is a fact. Without a narrow typed channel the agent ends up keeping a shadow registry.

25. Structure in the tree, content in the LLM. All four, as the closing recommendation. A deterministic skeleton owns agenda, clock, floor, phases, safety and fallbacks. The LLM owns realization and interpretation inside the slot it is handed and emits tagged micro-actions. Nobody lets the LLM own the clock or the plan cursor.

26. Testability by replay. All four. Scripted scenarios of typed events and interruptions at known times run against the agent, asserting on emitted actions and timing. This extends the synth habit from perception to the agent side. Breakdown 3 adds replaying recorded event streams.

## Where they disagree

- Where roles live. Breakdown 3 says the world model must not know about roles. Breakdown 4 puts roles layered over identities inside the world model. Breakdown 2 wants dialog-learned facts such as "I'm the host" flowing into the world model through a typed channel. Breakdown 1 keeps them in an agent-side director. This is a genuine two-against-two design decision.

- Where the new layer sits. Breakdown 1 adds a director above the reactive agent. Breakdown 3 adds a situation model between world model and agent policy. Breakdown 4 adds a phase parameter inside the existing agent. These are three different placements for the same missing machinery and are not all compatible.

- How reactions are represented. Discrete events in 4, group attributes in 2 and 3. Compatible, since events can feed the aggregate.

## Reconciled priority

No breakdown gave a strict ranking, but each closed with a short "what has to change" list. Ranking by how many bodies raise an item and how many closings name it:

┌────────┬───────────────────────────────────────────────────────────────┬───────────────────────────────────────────────┐
│ Tier │ Items │ Basis │
├────────┼───────────────────────────────────────────────────────────────┼───────────────────────────────────────────────┤
│ First │ 15 plan ownership, 25 tree/LLM split, 11 interruptible speech │ In all four bodies, in three or four closings │
├────────┼───────────────────────────────────────────────────────────────┼───────────────────────────────────────────────┤
│ Second │ 2 group entity, 16 time input, 1 roles, 19 phase │ In all four bodies, in one or two closings │
├────────┼───────────────────────────────────────────────────────────────┼───────────────────────────────────────────────┤
│ Third │ 7, 9, 10, 20, 26 │ In all four bodies, in no closing │
├────────┼───────────────────────────────────────────────────────────────┼───────────────────────────────────────────────┤
│ Fourth │ 5, 8, 12, 13, 14, 21, 22 │ In three bodies │
├────────┼───────────────────────────────────────────────────────────────┼───────────────────────────────────────────────┤
│ Verify │ 6, 17, 18, 23, 24, and the situation-model idea in 7 │ In one or two bodies │
└────────┴───────────────────────────────────────────────────────────────┴───────────────────────────────────────────────┘

The fifth tier is the one worth your attention. Items 6, 24 and the situation model are architectural proposals only one instance produced, so they are either an insight the others missed or a tangent. Items 17 and 18 are both latency arguments and reinforce each other even though no single instance made both. Item 23 is cheap and public-facing.

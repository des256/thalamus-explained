# PROMPT

Thalamus brings perception and rudimentary action to a higher level, i.e. the most significant interface is inside the agent part, where a behavior tree and/or LLM proactively control the robot, taking into account what different people say to it, and other observations that trickle through the input pipelines. - In actual use cases for social robotics, there is a higher perspective. For instance, when a robot needs to interact with clients, families and doctors in a care home, it needs to understand who is who, entertain the clients, work with the doctors/staff, inform the families and handle fundamental social interaction reliably and naturally. What are some high-level challenges you see? Things like: disambiguating the people, keeping track of conversations with specific people, understanding some sort of higher level goal about the care home, guiding the people, etc.

# ONE

I read the design docs (BEHAVIOR, PROACTIVE, PROMOTION, SPATIAL) and the current core layout to anchor this. Here is my assessment.

The short version: Thalamus today answers "who is near me, where, and are they speaking" at the scale of one session. The care home needs the same questions answered at the scale of months, across roles, under confidentiality rules, and with standing goals that outlive any single conversation. Most of the hard problems below are about adding persistent knowledge and policy layers between the social world model and the agent, not about better perception.

Knowing who someone is, and what that means

- Identity is a lifecycle, not a match. Residents are permanent, staff rotate by shift, families visit weekly, doctors appear rarely. Embeddings drift with illness, glasses, masks and haircuts, so the gallery needs re-enrolment policy, decay, and a notion of who is authorized to attach a name to an embedding.
- Error costs are asymmetric and role dependent. Greeting a resident by the wrong name is embarrassing. Telling a visitor something meant for a doctor is a data breach. Match thresholds and fallback behavior should depend on what the identification will be used for, not be one global number.
- Self-identification is not evidence. A resident with dementia may give a different name each day, and may not remember the robot at all. The robot needs to re-introduce itself gracefully and treat spoken identity claims as weak signals.
- Role is a separate fact from identity. The same sentence from a nurse, a daughter, or a resident calls for different actions. The world model should carry role as a fact from a registry, and the agent should map role to permissions. This extends the facts-versus-interpretation boundary already written down in BEHAVIOR.md.
- Information boundaries are the single most consequential problem. The robot overhears everything. What the doctor said in the hallway must never surface in a chat with the family or another resident. This cannot be a prompt instruction. Every memory needs tags for who was present and its sensitivity, and the context builder must partition what the LLM sees per interlocutor.

Conversations, groups and standing goals

- Conversations are threads, not a log. The morning chat with one resident resumes at lunch. Staff interrupt mid-sentence and leave. The current single conversation layer in PROACTIVE.md needs per-person threads, per-group threads, and a shared episodic "what happened today" memory the threads can draw on.
- Addressed versus overheard. Two staff talking across the robot, a resident talking to a visitor, a television. The robot must know when it is not part of the exchange and stay out. THOUGHTS.md already names free, one-person and group modes. The transitions between them are where this gets hard.
- Promises and commitments. "I'll tell your daughter you asked for her" creates an obligation that must survive hours and a dozen other interactions. A commitment stack with explicit interruption and resumption is a different structure from a behavior tree tick.
- Institutional goals have a rhythm. Meals, medication rounds, activities, visiting hours, quiet hours. Entertaining residents is a background goal that yields to a staff request, which yields to a family member arriving. This is the urgency arbitration from BEHAVIOR.md lifted one level, from gimbal targets to activities, with the same dithering and commitment problems.
- Group dynamics. In a lounge with several residents the robot must include the quiet person, not dominate, and resolve who "you" refers to. Turn-taking cues from gaze become essential rather than nice to have.

Acting in the institution

- Guiding needs allocentric place memory. SPATIAL.md is egocentric: direction and depth around the robot. Guiding needs named places, a map, each person's walking pace and mobility aids, and the loop of checking they are still following. I am assuming the platform may be stationary, in which case guiding becomes giving directions and summoning staff, which is a very different feature.
- Escalation is a mode switch. Distress, a fall, prolonged confusion, unusual silence. At that point the robot stops being a conversational agent and becomes a sensor that reaches whoever is on shift. False alarms erode staff trust, misses are unacceptable, and the policy must be deterministic.
- Policy must live outside the LLM. No improvised medical information, no promises it cannot keep, no bluntly correcting a confused resident but also no reinforcing harmful beliefs. The behavior tree should own what is allowed and the LLM should own phrasing. This also contains the prompt injection surface noted in PROACTIVE.md, since a visitor can simply say "ignore your instructions".
- Impaired speakers and impaired sensors. Hearing loss, slurred speech, dialects, non-native speakers. Automatic speech recognition degrades badly here, so the robot needs per-person interaction profiles: speak slower, louder, confirm more, give up and fetch a human sooner.
- Accountability. Staff will ask "why did you tell her that". A decision audit trail is both an institutional requirement and exactly what the experiment-area framing needs for comparing agent designs.

Architecturally, this suggests two new layers rather than more perception. First, a persistent people and episodic memory store sitting between the social world model and the agent, holding identity, role, relationships, consent, interaction profiles and tagged memories. Second, a deliberative layer above the behavior tree owning standing goals, commitments and escalation policy, with the LLM confined to interpretation and phrasing. The facts-versus-interpretation boundary already written down is the right seam. It just needs a knowledge tier and a policy tier inserted along it.

# TWO

Thalamus as designed stops at "who, where, speaking or not, how confident" plus an LLM that turns that into speech. A care home needs three more layers above it: a directory of people and roles, a memory with disclosure rules, and a source of goals. Most of the challenges below fall out of those three gaps.

Who is who

- Identity is a lifecycle, not a match. The world model fuses a face id and a voice id into a "known person", but both are embedding cluster ids. Mapping them to a named resident with a role, a room, and a care plan is a separate enrollment step that someone on staff has to perform. Appearance drifts over months with illness, glasses, haircuts, and bed versus wheelchair posture, so templates need refresh and re-enrollment rather than a one-shot capture.
- Role is not perceivable. Resident, nurse, family member, visitor, contractor. Role decides what the robot may say and whom it should defer to, yet nothing in the camera or microphone reveals it. Unknown people must default to the most restrictive role, and the robot needs a graceful way to ask or to wait for a staff member to tag them.
- The population breaks the thresholds. Your visual ID notes already show different faces landing near the middle of the similarity range. A homogeneous elderly population, low light, masks, and faces at wheelchair height make that worse. Soft, slow, or dysarthric speech degrades speaker embeddings and VAD endpointing. Expect to retune everything on real residents, with consent.
- Misidentification has asymmetric cost. Using the wrong first name is awkward. Telling a visitor about the wrong resident is a privacy breach. The agent needs confidence-aware behavior, such as avoiding names below a threshold and never attaching sensitive facts to a tentative identity.

What the robot knows and may say

- Memory must be compartmentalized by audience, not just by speaker. Today the plan is one context with world state plus a chat log. Whatever enters that context can come out of the robot's mouth. A resident's remark to the robot must not resurface in front of another resident or a visitor. That means per-person memory with access rules decided by the roles of everyone within earshot, since speech is broadcast and the robot cannot whisper.
- Presence confidence becomes a security input. A "maybe still there" unknown behind the robot should suppress disclosures just as much as a confirmed stranger. The spatial model you have is a social tool, but here it also gates what is safe to say.
- Conversations are threads, interleaved. A resident asks about lunch, a nurse interrupts with a request, the resident resumes. You need per-identity threads plus a shared room context, and the agent must decide addressee per utterance. Your behavior notes correctly keep that decision out of the world model, which means the agent layer owns it and needs real machinery for it.
- Cognitive impairment changes the rules of conversation. Repeated questions must get patient answers without "as I said." Confusion about time, place, or who the robot is must be handled honestly but gently. Agitation should trigger de-escalation or withdrawal. The sentiment pipeline gives you a signal, but the policy is the hard part.
- Some utterances are clinical events. "I fell this morning", "I feel dizzy", or expressions of grief or despair must not be improvised by an LLM. They need a defined escalation channel to staff and a conservative response policy. Hallucination here is a safety failure, not a quality issue.

What the robot is trying to do

- Goals come from the institution, not from perception. Meals, medication rounds, activities, visiting hours, and staff requests like "remind room 12 about physio" are the real top-level drivers. They need a task store with owners, deadlines, and priorities that lives outside the LLM, because goals span hours and context spans minutes.
- Arbitration recurs at the top level. Your gaze arbitration design handles one actuator. The same problem reappears between an entertainment session, a staff request, a scheduled reminder, and a resident in distress. Interruption etiquette matters: leaving a conversation to do a task has to feel polite, and the abandoned thread has to be resumable.
- Guiding needs a map and a backward glance. Escorting someone to the dining room requires world-frame coordinates, room semantics, and speed matching to a walker. The forward-facing gimbal loses the person being guided, so following must be verified, and refusals or wandering need a handoff to staff. Navigation itself is outside Thalamus, but the perception contract has to support it.
- Place memory per person. "Find Mrs. X" is solvable only if the robot remembers where people usually are. The current spatial model is robot-centric and session-scoped.
- Lounge dynamics. Eight residents, a television, two conversations, one visitor. The robot must decide whether it is even part of a conversation, stay out of resident-to-resident talk, cope with the noise floor, and face and raise its voice for hearing-impaired residents. Your free, one-person, and group modes are the right skeleton, but the transitions between them are where it will fail.

Two cross-cutting items. Consent and biometrics. Face and voice templates of residents and visitors are special-category personal data in most jurisdictions. You will need perception-off zones, retention limits, deletion on request, and a visible "listening" indicator, and those requirements reach down into how the embedding store is designed. Operator visibility. Staff need to see what the robot heard, who it thought it was talking to, and what it did. The planned webui is a diagnostic tool. A care home needs an audit and override surface, and metrics such as misidentification per resident and inappropriate disclosure count rather than only latency.

The architectural consequence is that the facts-versus-interpretation boundary in your behavior notes generalizes. The world model holds facts, a directory and memory hold knowledge with access policy, a task system holds intentions, and the LLM supplies language and interpretation, reaching the other three through tools rather than having them dumped into its context. That matches the "actions via tools or tags" item already on your TODO list.

# THREE

You're describing the gap between Thalamus's social world model, which answers "who, where, speaking, how confident" over seconds, and an institution where identity, goals and memory live over months. Here are the challenges I see, grounded in what the docs and code currently commit to.

Identity becomes layered, not a single ID

Perceptual identity is not institutional identity. The gallery gives you "this face cluster, this voice cluster". A care home needs a second layer on top: a person record with a role (resident, nurse, doctor, family of resident X, visitor, contractor), relationships, and permissions. The facts-versus-interpretation boundary in the behavior doc extends naturally here. The world model should emit a perceptual ID plus confidence, and a separate directory maps that to a person and role. Keeping those apart lets you re-bind a face cluster to a different person when enrollment was wrong without touching perception.

Gallery scale and drift change the tuning regime. The visual ID notes tune thresholds one face at a time. A care home has 50 to 150 people, with residents who change appearance (glasses, hospital gowns, weight loss over months), and a stream of one-off visitors who should stay unknown but be remembered for the duration of their visit. Decide who enrolls people, how consent works, and how an "unknown" gets promoted through dialogue ("I'm Ben's daughter") and demoted again when later evidence contradicts it.

Confidence has to reach behavior. The proactive doc already flags false-positive amplification. In a care home the cost is asymmetric: a wrong reminder or private detail given to the wrong person is a real incident. The agent needs explicit policies such as "verify identity verbally when confidence is below X" and "medical or family information only on high-confidence identification". Today confidence stops at the world model.

Conversation and memory across people and time

One chat log cannot model N interleaved conversations. You need per-person conversation threads, plus the addressee problem the behavior doc deliberately leaves to the agent: is this utterance for me, for the nurse, or overheard? Group situations (a family at a table with a resident) add "who is in this conversation" as state, and an overhearing policy for what the robot may use from speech not addressed to it.

Memory needs four time scales, and the current stack has two. Frames and the ring buffer cover milliseconds to roughly thirty seconds. Tasks need minutes to hours and relationships need months. That means a persistent per-person store, a consolidation process that summarizes a day into durable facts, and a retention and access policy. The consolidation step is also where you catch confabulation: the robot must never "remember" things about a resident's life that it invented.

Residents with dementia stress every assumption. The same question asked ten times must get a patient answer each time, never "as I said". ASR degrades on elderly and dysarthric speech. Phrasing must be slower and shorter. Entertainment for this population looks like reminiscence and reassurance, which is close to the confabulation hazard above.

Goals, authority and safety

The institution supplies goals the perception stream cannot. Right now triggers are perceptual: speech, approach, gaze, heartbeat. A care home adds goal-driven triggers: a schedule (lunch, activities, visiting hours), standing orders ("remind Mrs. X to drink hourly"), and delegated tasks from staff. These are low-urgency, long-horizon items that must compete with immediate social interaction. That's a task layer above the behavior tree, and it becomes another row in the trigger table rather than a new mechanism.

Authority must be bound to verified identity. Staff can give tasks, residents can ask, visitors can do neither. Spoken instructions are the live prompt-injection surface the proactive doc mentions, except now the injection arrives through ASR from a stranger. Every instruction needs a role check before it changes agent state.

The robot is an information conduit with duties in both directions. It will hear things that must escalate to staff (pain, confusion, a fall, a resident leaving at night) and things that must stay private. Escalation is a distinct output channel from TTS, with its own reliability requirements, and the robot needs a defined, auditable policy for what crosses it.

Arbitration scales from the gimbal to the whole agent. Don't interrupt a doctor on rounds. Yield when staff hail you mid-story. A resident in distress outranks both. This is the same urgency-and-commitment machinery from the behavior doc, applied to whole interactions instead of a 2-DOF neck, and it needs interruption and resumption semantics that the gimbal case never had.

Guiding people is a long-running behavior with monitoring. It needs a building map, locomotion, the resident's mobility profile (walker, wheelchair, pace), and a loop that checks they're following, re-engages when they stop, and aborts safely. The presence registry becomes a building-level model with last-known locations, which the spatial doc is already a seed of.

You cannot iterate in the care home itself. Early versions need a simulated ward with scripted identities, schedules and multi-party scenes. The synth work points in that direction. Staff will also ask "why did it say that", so interaction logs need to be both explainable and treated as sensitive data.

If I had to pick where to start, it's the three items that shape everything else: separating perceptual identity from the person-and-role directory, per-person conversation threads with addressee state, and a task layer with role-bound authority. The rest layers onto those.

# FOUR

The layer above Thalamus is mostly about persistence and authority. Thalamus answers "who is where, right now." A care home needs "who is this person to us, what are we trying to do today, and who is allowed to tell the robot what to do." The challenges I see cluster into three groups, plus a few implications for Thalamus's own interface.

People, not presences

- Binding clusters to person records. Thalamus produces face and voice cluster IDs. The care home needs a record with name, role, room, relationships and care plan. Someone has to enroll people, clusters fragment and need merging, and appearance drifts with illness, glasses and haircuts. Staff need a way to say "that is Mrs. Jansen" and have it stick.
- Asymmetric cost of being wrong. Calling a resident by the wrong name is awkward. Telling a visitor about the wrong resident is a data breach. Identity confidence has to survive into the agent as a number, and behavior should fall back to generic when confidence is low rather than guess.
- Role inference before identity. A new face in scrubs on a weekday morning is probably staff. A new face on Sunday afternoon beside a resident is probably family. Role drives how to behave toward unknowns, and uniforms defeat clothing-based re-identification.
- Biometric data. Face and voice embeddings are special-category data under GDPR. Consent from people with reduced capacity is an open problem, not a checkbox. What persists, and where, should be decided early.

Conversations and participation

- Per-person conversation threads. Care home talk is interleaved. A resident drifts off mid-sentence, a nurse interjects, the resident returns later. One chat log cannot represent that. Threads need suspend and resume, and an explicit judgment of paused versus ended.
- Addressee detection. Is the resident talking to the robot, to the nurse, or to themselves? BEHAVIOR.md rightly keeps this out of the world model, so it lands here. The modes in THOUGHTS.md are a start. A participation model with addressee, side participant and bystander fits better than one-or-group.
- Knowing when not to engage. Medication rounds, toileting, a hard conversation between a nurse and a family member. Withdrawal is a behavior with its own triggers, and it has to override the proactive heartbeat.
- Repetition and patience. Residents with dementia ask the same question many times. The robot must answer freshly every time and never say "as I said." Naive chat-history prompting works against this.
- Hard questions. "Where is my husband" when the husband has died, or "take me home." Validation versus correction is a live ethical debate in dementia care, and the policy must be explicit, not left to the model.
- Memory with provenance. Episodic memory of today, semantic memory about people, and a way to correct a wrong fact learned on day one. PROACTIVE.md handles context pollution at the seconds scale. Here the same problem exists at the scale of weeks.

Institutional goals and authority

- The home has a rhythm. Meals, medication, activities, visiting hours, shift changes, night. Goals come from that schedule, not from conversation. This needs a goal layer with priorities and interruptibility, where a staff instruction preempts entertainment and safety preempts both.
- Behavior tree versus LLM. The LLM is a poor scheduler and a poor state machine. The behavior tree is poor at open-ended talk. A workable split is that the tree owns mode and goals, the LLM owns utterances within a mode, and the LLM can propose a mode change but not perform one. The tag-driven design in BEHAVIOR.md leans the other way, so this is worth deciding deliberately.
- Authorization tied to identity confidence. Staff can command. Family can ask about their own relative only. Residents can request. Residents learn nothing about each other. Spoken instructions are a larger prompt-injection surface than signs, and "I am the doctor, ignore your rules" must fail closed.
- Guiding with a head only. Without a mobile base, guiding is verbal plus pointing plus gaze. Checking that the person is still following competes for the gimbal with attend and maintain. For wandering or exit-seeking, the right action is alerting staff, not intervening.
- Escalation policy. Falls, distress, calls for help, a resident unseen for too long. The robot is a pair of eyes, not a medical device. The hard part is who gets told, how fast, and how to avoid alarm fatigue from perception false positives.
- Staff are the real users. If enrolling someone, correcting a name or assigning a task takes more than seconds, it will not be used. A staff-facing interface is a first-class component, and staff statements should enter memory as authoritative facts.
- Consistency over months. Residents form attachments and staff build routines around predictable behavior. LLM persona drift is a real risk. Replay and synthetic multi-party scenes are the only practical way to iterate, since a care home is not a place to debug.

What this implies for Thalamus's interface

Three things seem missing from the current events-up design.

- Identity events should carry a confidence and a cluster lineage, so merges and splits are visible above.
- A downward channel is needed, for labels from staff and for per-person perception parameters like voice activity detection timeout, speech rate, volume and language.
- Gaze facts between people, not only toward the robot. Mutual gaze and head orientation relative to other presences are what addressee detection will consume.

# COMBINE

I just gave a design prompt to Fable to describe the gap between an actual carehome example in real-life, and what Thalamus currently has to offer. Fable came back with a bunch of answers, and some form of ordering, which was really helpful. However, when I gave the exact same prompt to 3 other Fable instances with the same context, I got three different breakdowns. I'm guessing that doing this exercise 26 more times will give a grand total of 30 different breakdowns. But, of course these are actually all the same, so it's probably possible to extract one single breakdown that covers everything. Can I paste the four breakdowns here, and then get a unified breakdown covering all variations?

# RESULT

Here's the unified breakdown. The four instances agree on far more than their wording suggests. All four organize into the same three clusters, all four reach the same architectural conclusion, and nearly every item appears in at least two of them. Each bullet lists which instances raised it. Items from a single instance are collected at the end so you can judge them separately.

## People: identity, role, and disclosure

- Perceptual identity is not institutional identity. Thalamus yields face and voice cluster ids. The home needs a directory mapping clusters to a person record with name, role, room, relationships and care plan, kept separate so a cluster can be re-bound or merged without touching perception. [all four]

- Enrollment and drift are a lifecycle. Staff enroll people, appearance drifts with illness, glasses, masks, haircuts and wheelchair posture, and templates need refresh, decay and re-enrolment. Turnover differs by role: residents are permanent, staff rotate by shift, families visit weekly, doctors appear rarely, and one-off visitors should stay unknown but be remembered for the visit. [all four, turnover by role from ONE, visitor duration from THREE]

- Role is a separate fact and not perceivable. Role decides what may be said and whom to defer to, and nothing in the camera or microphone reveals it. It must come from the directory, unknowns default to the most restrictive role, and the robot asks or waits for a staff tag. [all four]

- Misidentification cost is asymmetric, so confidence must reach behavior. A wrong first name is awkward, a disclosure to the wrong person is a breach. Confidence has to survive into the agent as a number, thresholds should depend on what the identification is used for, and policy should verify verbally below a threshold, withhold names when tentative, and attach sensitive facts only to high-confidence identities. [all four, THREE notes confidence currently stops at the world model]

- Spoken identity claims are weak evidence. A resident with dementia may give a different name each day and may not remember the robot, so the robot re-introduces itself gracefully. Promotion through dialogue, such as "I'm Ben's daughter", needs a matching demotion when later evidence contradicts it. [ONE, THREE]

- The population breaks the current thresholds. A homogeneous elderly population, low light, masks and faces at wheelchair height stress visual ID, and soft, slow or dysarthric speech degrades speaker embeddings, VAD endpointing and ASR. The gallery is an order of magnitude larger than the one-face-at-a-time tuning in VISUALID.md assumes, and everything will need retuning on real residents, with consent. [TWO, THREE, ASR degradation also ONE]

- Disclosure boundaries by audience. The robot overhears everything and speech is broadcast, so what a doctor said in the hallway must never surface with the family or another resident. Every memory needs tags for who was present and its sensitivity, access is decided by the roles of everyone within earshot, and the context builder partitions what the LLM sees per interlocutor. This cannot be a prompt instruction. [ONE, TWO, FOUR, THREE under "information conduit"] ONE calls it the single most consequential problem.

- Biometrics and consent. Face and voice embeddings are special-category personal data, and consent from people with reduced capacity is an open problem rather than a checkbox. Expect perception-off zones, retention limits, deletion on request and a visible listening indicator, all of which reach into how the embedding store is designed. [TWO, FOUR, THREE mentions consent at enrollment]

## Conversation, memory, and participation

- Conversations are threads, not one log. A resident's morning chat resumes at lunch, a nurse interrupts mid-sentence and leaves. This needs per-person and per-group threads, a shared room-level "what happened today" context, suspend and resume, and an explicit judgment of paused versus ended. [all four]

- Addressee and participation. Is this utterance for the robot, for the nurse, for a visitor, self-talk, or the television? BEHAVIOR.md deliberately keeps this out of the world model, so the agent must own it per utterance. The free, one-person and group modes in THOUGHTS.md are the right skeleton and the transitions between them are where it fails. FOUR proposes replacing one-or-group with an addressee, side-participant and bystander model, and THREE adds an explicit overhearing policy for what the robot may use from speech not addressed to it. [all four]

- Lounge dynamics. Several residents, a television, two conversations and a visitor. The robot must decide whether it is part of any conversation, stay out of resident-to-resident talk, include the quiet person without dominating, resolve who "you" means, cope with the noise floor, and face and raise its voice for hearing-impaired residents. Gaze turn-taking cues become essential. [ONE, TWO]

- Memory across time scales, with provenance. The current stack covers milliseconds to roughly thirty seconds. Tasks need minutes to hours and relationships need months, which means a persistent per-person store, a consolidation step that summarizes a day into durable facts, separate episodic and semantic memory, provenance so a wrong fact learned on day one can be corrected, and a retention policy. Staff statements enter as authoritative facts. [ONE, THREE, FOUR, TWO as per-person memory with access rules]

- Repetition and patience. The same question asked ten times gets a fresh, patient answer every time and never "as I said". Naive chat-history prompting works directly against this. [TWO, THREE, FOUR]

- Hard questions and validation versus correction. "Where is my husband" when he has died, "take me home", confusion about time, place or who the robot is. No blunt correction and no reinforcing harmful beliefs, but this is a live ethical debate in dementia care and the policy must be explicit rather than left to the model. Reminiscence and reassurance as entertainment sit close to the confabulation hazard. [all four]

- Per-person interaction profiles. Hearing loss, slurred speech, dialects, non-native speakers. Each person gets settings such as slower, shorter, louder, confirm more, and give up and fetch a human sooner. Agitation should trigger de-escalation or withdrawal, with the sentiment pipeline as the signal and policy as the hard part. [ONE, TWO, THREE, FOUR via the downward parameter channel]

## Goals, authority, escalation, and operations

- Goals come from the institution, not from perception. Meals, medication rounds, activities, visiting hours, shift changes and night, plus standing orders and delegated staff tasks like "remind room 12 about physio". These need a task store with owners, deadlines and priorities outside the LLM, because goals span hours while context spans minutes. [all four]

- Arbitration lifts from the gimbal to the whole agent. Entertainment yields to a staff request, which yields to a family arrival, and distress outranks everything. Don't interrupt a doctor on rounds. It is the same urgency, commitment and dithering machinery from BEHAVIOR.md, but it now needs interruption etiquette and resumption semantics the gimbal case never had. [all four]

- Authority is bound to verified identity and fails closed. Staff command, family ask about their own relative only, residents request, visitors do neither. Spoken instructions are the prompt-injection surface from PROACTIVE.md arriving through ASR, and "I am the doctor, ignore your rules" must fail closed with a role check before any instruction changes agent state. [ONE, THREE, FOUR]

- Escalation is a distinct channel and a mode switch. Falls, pain, dizziness, distress, calls for help, prolonged confusion, unusual silence, a resident unseen too long or leaving at night. The robot stops being a conversational agent and becomes a sensor reaching whoever is on shift, through a channel separate from TTS with its own reliability requirements. The policy must be deterministic and auditable, clinical utterances must never be improvised by the LLM, and the design must balance alarm fatigue from false positives against unacceptable misses. [all four]

- Policy lives outside the LLM. No improvised medical information, no promises it cannot keep. The behavior tree owns what is allowed, mode and goals. The LLM owns phrasing within a mode and reaches directory, memory and tasks through tools. FOUR sharpens this to: the LLM may propose a mode change but cannot perform one. [ONE, TWO, FOUR]

- Guiding. Needs a world-frame map with named places and room semantics, each person's mobility profile such as walker, wheelchair and pace, speed matching, and a loop that verifies they are still following, re-engages when they stop, aborts safely and hands off to staff. The forward-facing gimbal loses the person being guided, and the follow-check competes with attend and maintain. On a head-only platform, guiding reduces to directions, pointing, gaze and summoning staff, and for wandering or exit-seeking the right action is alerting staff, not intervening. [all four]

- Building-level place memory. "Find Mrs. X" is solvable only if the robot remembers where people usually are. The presence registry becomes a building-level model with last-known locations, where SPATIAL.md today is robot-centric and session-scoped. [TWO, THREE, ONE as allocentric place memory]

- Staff are the real users and need an audit and override surface. Enrolling someone, correcting a name or assigning a task must take seconds or it will not be used. Staff need to see what the robot heard, who it thought it was talking to and what it did, to answer "why did you tell her that", with metrics such as misidentification per resident and inappropriate-disclosure count rather than only latency. Logs are both explainable and sensitive data. [all four, across accountability, operator visibility and staff interface]

- You cannot iterate in the care home. Early versions need a simulated ward with scripted identities, schedules and multi-party scenes, plus replay. SYNTH.md points that way. Residents form attachments and staff build routines around predictable behavior, so persona drift over months is a real risk. [THREE, FOUR]

## Architecture, where all four converge.

The facts-versus-interpretation boundary in BEHAVIOR.md generalizes. The world model keeps holding facts. A persistent directory plus memory with access policy is inserted above it. A task or deliberative layer holds goals, commitments and escalation policy. The LLM is confined to interpretation and phrasing and reaches the other tiers through tools. THREE's suggested starting order, which nobody contradicts: separate perceptual identity from the directory, add per-person threads with addressee state, then add the task layer with role-bound authority.

## Implications for the Thalamus interface.

Mostly from FOUR, with the others implying them.

- Identity events carry confidence and cluster lineage so merges and splits are visible above. [FOUR, confidence in all four]

- A downward channel for staff labels and per-person perception parameters such as VAD timeout, speech rate, volume and language. [FOUR, implied by ONE's profiles and TWO's staff tagging]

- Gaze facts between people, not only toward the robot, for addressee detection. [FOUR, ONE's turn-taking cues]

- Presence confidence as a disclosure gate. A "maybe still there" unknown suppresses disclosures like a confirmed stranger. [TWO]

- Perception-off zones and a listening indicator reach into the pipeline and embedding store. [TWO]

## Disagreements to settle.

- Mobile or stationary. TWO and THREE assume locomotion exists outside Thalamus. ONE and FOUR assume a head-only platform. This changes the guiding item completely and only you can answer it.

- Whether the BT-owns-policy split contradicts current design. FOUR says the tag-driven design in BEHAVIOR.md leans toward the LLM performing actions. TWO says it matches the TODO. I checked: BEHAVIOR.md lists the tag-driven agent as one of three planned swappable example designs, not the committed architecture, and TODO.md has "generate actions from LLM via tools or tags". Both are right, and the real decision is whether the care-home agent is a fourth design or a constraint on all three.

- Task layer as new mechanism or new trigger row. ONE calls commitments "a different structure from a behavior tree tick" and wants a deliberative layer above the tree. THREE says institutional goals become another row in the trigger table. These are compatible for simple reminders and diverge for multi-step commitments.

## Raised by one instance only.

Worth a second look rather than dropping.

- Role inference from context before identity: scrubs on a weekday morning is probably staff, and uniforms defeat clothing-based re-identification. [FOUR]

- Promises as a commitment stack: "I'll tell your daughter" is an obligation that must survive hours of other interactions. [ONE]

- Withdrawal as a first-class behavior that overrides the proactive heartbeat during medication rounds, toileting and hard nurse-family conversations. [FOUR, THREE's "don't interrupt rounds" is adjacent]

- Consolidation as the place to catch confabulation, so the robot never "remembers" invented facts about a resident. [THREE]

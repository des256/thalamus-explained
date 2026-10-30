Thalamus brings perception and rudimentary action to a higher level, i.e. the most significant interface is inside the agent part, where a behavior tree and/or LLM proactively control the robot, taking into account what different people say to it, and other observations that trickle through the input pipelines. - In actual use cases for social robotics, there is a higher perspective. For instance, when a robot needs to guide people through a museum, it needs to understand who is who, take them along the exhibitions, explain things about the exhibitions and handle fundamental social interaction with (members of) the group reliably and naturally. What are some high-level challenges you see? Things like: disambiguating the people, keeping track of conversations with specific people, understanding some sort of higher level goal about the exhibitions, herding the group through the museum within the alotted time, etc.

# ONE

# TWO

# THREE

# FOUR

# COMBINE

I just gave a design prompt to Fable to describe the gap between an actual museum example in real-life, and what Thalamus currently has to offer. Fable came back with a bunch of answers, and some form of ordering, which was really helpful. However, when I gave the exact same prompt to 3 other Fable instances with the same context, I got three different breakdowns. I'm guessing that doing this exercise 26 more times will give a grand total of 30 different breakdowns. But, of course these are actually all the same, so it's probably possible to extract one single breakdown that covers everything. Can I paste the four breakdowns here, and then get a unified breakdown covering all variations?

== breakdowns

All four breakdowns describe the same shape. Thalamus answers who is here, where, who is speaking, and how sure it is. A museum tour adds a group, a plan with a clock, a moving robot, and content that must not be wrong, and every item below sits in that gap. Each bullet ends with which of the four raised it. The doc references are verified against the repo, except that no "look-back drive" appears in BEHAVIOR.md as THREE claims, so I dropped that attribution.

Unified breakdown

1. The group as an entity

- Group object above the presence registry. Membership is a different question from identity. The group needs its own state: roster, lead, centroid, spread, who is attending, who is lagging, with its own confidence. All four.
- Membership is a belief. It needs confidence and decay to survive a member leaving for the toilet and rejoining, a family splitting up, and a bystander lingering for two exhibits. The costly error flips: naming a stranger is embarrassing, but silently dropping a member breaks herding. All four.
- Closed-set recognition against a roster. Enrolling the group at the start turns open-set identification into closed-set plus "stranger", which is the only regime tractable at museum scale. TWO, THREE, FOUR.
- Counting and absence. "We are missing two" is a claim against the roster, not against current detections. Each member needs a last-seen time and an absence duration. THREE, FOUR. ONE and TWO mention wandering off without the roster framing.

2. Identity over an hour-long walk

- Face alone fails. Visitors face the exhibit, so you see backs, sides and hats under changing light, while coats come off and glasses go on. A wrong merge early poisons the rest of the tour, and VISUALID.md already records stranger-as-known errors. All four.
- Session-scoped appearance identity. Clothing and build embeddings valid for one tour, multi-sample enrollment, continuous update, fused with face and voice. Being useless across days doubles as the privacy design. All four.
- Identity confidence as a number the agent can use. The promotion lattice has Maybe states but they are binary. Below a threshold the robot says "you in the red jacket" instead of a name, or asks "Maya, was that you?". ONE, THREE, with TWO and FOUR covering it under uncertainty.
- Name binding. "I'm Maya" must attach to a visual and voice identity with enough confidence to use. THREE only.
- Children. Low to the camera, erratic, recognised worse, different vocabulary. TWO, FOUR.

3. Perception under museum conditions

- The robot moves. Presences need a world frame fed by the robot's own pose, and content references need a museum map frame with localisation. The geometry gap in SPATIAL.md is the prerequisite. ONE, TWO, FOUR. THREE treatsus.
- The guide has its back to the group. A forward gimbal on a moving base sees nobody for long stretches, so everyone decays to Maybe. A headcount drive whose urgency grows with time since the last full sighting, built on EHAVIOR.md, becomes central rather than peripheral. THREE, FOUR.
- Hostile acoustics. Reverberant halls, crowd babble, polite whispering, other groups, competing audio guides. Direction of arrival, speaker embeddings and ASR all degrade, more utterances land in the Somewhere bucket, and comes the one to lean on. All four.
- Hostile visuals. Glass cases reflect faces and break depth, lighting is dim with spotlights and backlit windows. FOUR only. - Perception does not scale with the crowd. Matching every observis quadratic in a hall, and full landmarks, gaze and expression for every face will not fit on a Jetson. Gate by region and membership, and schedule perceptual attention like the gimbal. TWO, FOUR.

4. Multi-party conversation

- Addressee detection. All four name this the central problem and the agent's main job. In a group most speech is not for the robot, and answering a couple's private comment is the most common failure. Signals: gaze and hl, speaker identity, proximity, sentence form, turn structure, andwhether the robot just asked a question or was mid-turn. BEHAVIOR.md already pushes this to the agent, so it needs a real owner. All four. - Turn-taking and barge-in. Overlapping speech is normal and diar, so expect fragments. The robot must yield, take the floor back to move on, cancel its own TTS with echo cancellation and a fast stop-and-listen path, and know where it was interrupted. All four. - Threads and obligations. A flat log breaks. You need a shared "ead plus a per-person thread with pending commitments, and a policy for answering privately by turning and being brief versus publicly by folding into the narrative. Context cost grows with group size, which collides with the pollution warnings in PROACTIVE.md. All four.
- Per-person profile. What each visitor has been told, interests expressed, apparent age and expertise, language. ONE, TWO, THREE. - Mixed languages. Per-utterance detection, per-addressee voice slicy for the group. ONE, TWO, THREE.
- Mode transitions. THOUGHTS.md names free, address-one, address-group. The tour switches constantly, and the hard part is the return to the group without dropping the explanation thread. THREE, with FOUR's private-ver point.
- Gaze distribution and fairness. Robots get captured by the most engaged person and drift into a dyad. Spread eye contact during explanations, shift to the questioner, and add an "attention owed" term to arbitration. TH
- Latency. By the time a slow response arrives, someone else has spoken. Fillers, backchannels and gaze aversion buy time. FOUR only. - Heterogeneous public. Hearing-impaired visitors, children, peop TWO, FOUR. 5. The tour as a plan with a clock - The LLM does not own the plan. A behaviour tree, hierarchical tholds current stop, covered content, time remaining, transitionsand movement. The LLM gets a goal and constraints per phase, fills leaves, and emits intents the plan layer validates. Otherwise tours silently run long. All four.
- Elastic content. Each stop needs tiers: must-say, nice-to-say, only-if-asked, or short, medium, long. A narrative budget lets the planner trim instead of rush. All four.
- Engagement estimate per person. From gaze, posture and sentiment, used to cut a stop short or extend it. Noisy and easy to over-trust. ONE, TWO, THREE. - Interrupt and resume. A question mid-sentence, a toilet requesta child running off. Both the schedule and the explanation need a"where were we" that resumes without repeating or skipping. All four. - Audience adaptation. Eight-year-olds versus art historians, dri
- Route replanning. A room closed, crowded, or held by another group. FOUR only. - Rails mode. When identity, ASR or the LLM fails, the tour stillthe plan layer. ONE only. 6. Content and grounding - Curated knowledge base with refusal. Facts come from retrieval tric memory, and the robot defers outside the base. A hallucinateddate is a reputational failure for the museum. All four. - Deixis into the scene. "What's that?" with a pointing arm, or "eeds an exhibit map, a spatially indexed knowledge base, and gazeor pointing resolved toward exhibits rather than toward the robot. ONE, TWO, FOUR.

7. Herding

- Herding is a behaviour competing in arbitration. Cohesion metrics and straggler detection feed tactics: announce departure, orient the body, start walking, match the slowest member's pace, wait at a doorway, name a straring questions and greeting newcomers. All four.
- Herding is persuasion with weak authority. Needs a policy for when to wait, when to leave, and when to escalate a lost member to staff. THREE, FOUR. - Action vocabulary and feedback. Speech must stream and be canceeak need completion and abort reports. Today the action channel isfire-and-forget. New verbs: "announce to group", "wait for". ONE, THREE.

8. Cross-cutting

- Uncertainty reaches the agent. Every fact carries confidence, policies condition on it, and language hedges or repairs instead of asserting. False positives amplify through an LLM, as PROACTIVE.md flags. All four.
- Privacy and retention. Face and voice embeddings of the public, including children, fall under GDPR. A tour-scoped gallery purged at the end, with opt-in for anything longer, is a legal constraint and matches the roster m
- Authority and injection. The robot speaks for the institution and moves with authority. Roles for staff, lead and member; the LLM never holds movement authority; output constraints against a teenager coaxing it. ON
- Testing. None of this is testable live every day. A scenario simulator feeding synthetic presences, utterances and movement, with injected latency, identity confusion and overlapping speech, extends the synth direction. nd field metrics: retention, time adherence, answer accuracy. Allfour.  
  Where the four disagree
- How membership is established. ONE infers it from behaviour such as arriving together and following between stops. THREE states that it is a commitment made at tour start and perception cannot infer it. TWO and FOUR enrol a it as a belief. The merged position is enrol first, infer onlyfor drift. - Where group state lives. ONE calls membership, addressee, engagtion, outside the world model, but wants them in a shared "socialsituation" service keyed by group. FOUR splits it: roster and obligation queue are facts next to the social world model, addressee and floor control are interpretation in the agent, and the tour plan is a third kind nt. THREE puts membership tags directly on presences. TWO says asecond tier above the registry. This is the real design decision and the four do not settle it. - Whether navigation is in scope. ONE says a gimbal cannot herd, n and navigation are prerequisites. THREE says navigation isoutside Thalamus and herding is mostly social. FOUR says the museum map frame is a bigger problem than the robot-local geometry work. All agree world-frame presences are needed regardless.
- Grouping and ordering only. ONE and THREE use people, conversation, tour. TWO and FOUR add an environment section. ONE merges turn-taking with action feedback, FOUR splits overlapping speech from floor control, THREE gives let. None of this changes the content.
  Raised by only one breakdown: rails mode, roles as an authority mintroduction, route replanning, glass and lighting, latencyfillers, Wizard-of-Oz evaluation, mode-transition return. These are the items a fifth instance would most likely also miss, and none looks wrong.  
  Where all four converge. The facts-versus-interpretation boundary in BEHAVIOR.md extends upward. Three new kinds of state sit between the social world model and the LLM: the group with its roster and geometry, per-person obligour plan with its clock. Each breakdown picks the same three itemsas architecture-reshaping: the group as a first-class entity, addressee detection as the agent's central job, and an explicit plan owner above the LLM.

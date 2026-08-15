# THALAMUS

## Social Robotics

There is something disturbing about every social robot ever built...

Expressionless Social Robot Videos

We root for Codey and think he's awesome, but we should not ignore reality.

## Grounding the Research

### Healthcare

- Patients and caregivers have different goals; one navigation flow cannot serve everyone
- Reaching a location does not mean the patient completed the next step
- Large amounts of caregiving and coordination work remain outside the robot
- Hospital interfaces often force patients to adapt to the robot instead of the reverse
- The same call signal may represent completely different needs and urgency levels
- Handling simple requests can still disrupt core nursing workflows
- The boundary between nonclinical support and clinical judgment must be explicit
- Saying "escalated" does not mean a staff member actually accepted responsibility
- Patient condition can change within minutes, making fixed coaching scripts unsafe
- A rehabilitation robot must not expand the prescribed exercise scope
- A robot does not reduce staffing unless it replaces a clearly defined human role
- Physical and verbal guidance must adapt together to patient responses
- A finished demonstration does not prove correct completion or absence of discomfort
- Entertaining a child does not mean the child understands or can cooperate
- A robot following its own timing can interfere with clinical procedures
- Age, fear, and attention differences require different interaction strategies
- Clinical staff must be able to pause or take over at any time
- Long-distance transport may decrease while preparation and coordination are redistributed to people
- Reaching the room does not mean bedside delivery is complete
- The patient's ability to receive an item independently cannot be assumed
- Autonomous delivery must stay within an explicitly approved low-risk scope

### Long-term Care

- Object assistance must solve the user's actual task, not just complete robot motion
- Assistance must preserve privacy, autonomy and correctability
- Handover and assistance must respond to human ability and current state
- Social connection needs relational continuity, privacy, and interaction context
- Activity roles and flows cannot be fixed in advanced
- Real care settings expose perception limits, diverse participation, and staff work
- Reminders must stay connected to current schedule, context and outcome
- Personalization and activity choice must remain controllable and configurable
- The robot operates within a multi-role care network
- Companion conversation needs contextual listening, repair, and multimodal feedback
- Long-term deployment also requires user learning, dignity, and relationship continuity

### Museums and Public Cultural

- The robot does not know whether the group is ready to move or how visitors interpret its turns and starts
- Reachind the target position does not mean everyone can see the exhibit and screen
- Visitors cannot understand the robot's current state or next intention
- Fixed command language forces visitors to adapt to the robot
- Even when listening status is shown, visitors may not know when they can speak
- In groups, the robot cannot reliably identify who spoke or who was addressed
- Speech-recognition failures in open galleries are not repaired reliably
- Spatial references such as "the one on the right" may map to multiple objects
- A factually correct answer still fails if it is attached to the wrong exhibit
- Continuous interaction does not require indefinite storage of full visitor profiles
- When approved sources are insufficient, the robot must state the limit and hand off rather than speculate
- Preset routes and fixed information density cannot support diverse exploration
- Tactile exploration follows a very different pace from rapid visual viewing
- Without a low-friction way to express personal needs, individual needs conflict with group pacing

### Education and Caregiving

- Asking the question or playing the content does not mean the exercise was completed
- Silence, incorrect answers, and lost attention have different causes
- The robot does not reduce workload if the teacher still manages turns and constantly intervenes
- Low-pressure practice must not become unapproved evaluation or reporting
- The same wrong answer may come from different misunderstandings; repeating one hint will not solve them
- Without checking the next attempt, a hint cannot prove the student learned
- The robot must not expand the curriculum or change instructional goals
- Repeated tutoring work is not reduced if the teacher must review every sentence and correct errors in real time
- The robot begins explaining before the student is looking at the target
- Speech, screen content, and pointing are not bound to the same object
- A completed demonstration does not mean the student saw, understood, or imitated it successfully
- The fixed script continues even when the student interrupts or corrects the robot
- Multimodal capability increases workload if the teacher must manually align every channel

## System Problems

### Outcome Closure Failure

Was the real-world goal actually achieved?

- Treating action completion as task completion
- No explicit and observable success evidence
- No reliable progress monitoring
- No retry, alternateive strategy, or recovery
- No recipient or staff acknowledgement

### Situated Understanding Failure

Does the robot understand the current situation?

- Objects, people, and linguistic refrences are not grounded
- Different human states and causes are conflated
- Group, role, and task-stage state is missing
- Uncertainty is not represented or actively clarified
- Expired state is treated as current fact

### Human-Robot Coordination Failure

Are people and the robot actually coordinated?

- Robot state and next action are not legible to people
- Turn-taking, interruption, pause, and resumption fail
- Joint attention and shared reference are missing
- Speech, screen, gaze, pointing, and movement are unsynchronized
- Group pacing and formation are not coordinated

### Control and Boundary Failure

Who has authority, and when must the robot stop?

- Robot role, decision authority, and action authority are unclear
- Consent, refusal, and withdrawal mechanisms are missing
- People cannot effectively pause, correct, or take over
- Content provenance, data use, and retention boundaries are unclear
- Human handoff does not complete responsibility transfer

### Workflow Integration Failure

Did the end-to-end workflow actually become easier?

- The robot covers only a small fragment of the workflow
- No specific human step or role is replaced
- The robot is disconnected from institutional systems
- Deployment creates new setup, monitoring, and recovery work
- Robot-level metrics hide organizational cost

### Capability Rigidity and Lack of End-User Development

Can local users teach, compose, and redefine the robot?

- Users can select functions but cannot define new tasks
- Existing skills cannot be composed into new service workflows
- Non-egineers cannot teach local practices
- Corrections do not become reusable future behavior
- New capabilities lack testing, approval, versioning, and rollback
- The robot's role cannot be redefined

## Data-Driven Development on the Edge

Needs high performance, like videogames in the late 1900s.

Performance is not: smart tricks and hacks.

Performance is: removing unnecessary computation.

Development: Holistic data-driven, as opposed to feature-driven.

1. Start designing/structuring around data paths.

2. Reduce bandwidth as early as possible.

3. Design parallel streaming pipelines.

4. Structure favorably for hardware inference.

## Python, Docker and ROS

Traditionally: Python, Docker and ROS are given artifacts. Integration is an afterthought.

Here: Social interaction is the most important. Python, Docker and ROS are the afterthought.

## Rust and Open Source

So I'm developing this in Rust, designed to run on any social robot. Roughly focused towards the Jetson and Codey/Joy/Grace/etc.

It should be open source, because:

- We want people to know that Mind Children is where it's at.
- Other robot enthousiasts might have great tips that we can quickly use in Codey.
- Flexibility towards research in SingularityNET and Hanson Robotics.

## Audio Input Pipeline

- VAD: Silero
- Barge-in Detection (Interruption/Cancelation Handling)
- Voice Recognition: ?
- Speech Recognition Locally: Moonshine (english only), Parakeet, Nemotron
- Speech Recognition Online: ElevenLabs, Deepgram
- Sentiment Analysis: ?

### ReSpeaker-like Microphones

- ReSpeaker VAD
- Direction of Arrival

### Multiple Audio Input Pipelines

- Each Microphone can have a unique fixed Voice ID

## Video Input Pipeline

- Camera and Robot Geometry
- Face Detection: SCRFD
- Face Pose Detection: 6DResNet360 (is facing me)
- Face Landmarks Detection: 3DDFA v2
- Gaze Detection: m1s0 (is looking at me)
- Face Expression Detection: HS Emotion (is smiling, is frowning, is surprised, etc.)
- Face Recognition: ArcFace
- Visual Speaking Detection: ? (is speaking)

### Camera Without Depth

- Depth Estimation

### Depth-capable Camera

- Depth-based Position

## Audio Output Pipeline

- Speech Synthesis Locally: Chatterbox, Pocket, MOSS TTS, Supertonic 3
- Speech Synthesis Online: ElevenLabs, Azure
- Audio-based Facial Animation Generation: ?
- Synchronized Audio and Facial Animation Playback and Cancellation
- Report only what was actually said back to the Agent

## Action Output Pipeline

- Addressing individual People or the group
- Speech Gestures
- Pointing at Things

## Social World Model

- Combining Audio and Video Representations
- Updating the Agent

## The Agent

- Separate Loop
- LLM triggered only When Needed: response to user, SWM event, self-initiated, etc.
- Trigger canned responses or animations based on sentiment or how long it takes
- Parsing Output to Speech and Action Pipelines

### Traditional LLM Agent (like Codey now)

- Prompt Assembly
- Running LLM Locally: Llama 3.2, Qwen 3.5, Phi 4
- Running LLM Online: GPT, Gemini, Claude

### OmegaClaw Loop (like OmegaCodey now)

- Updating OmegaClaw
- Capturing OmegaClaw Output to Speech and Action Pipelines
- Many possible ideas to structure behavior through OmegaClaw -> SingularityNET discussion

### Tiny Alternatives (hobby robots)

- Behavior State Machine
- Behavior Trees
- Maybe Tiny Local LLM

## Optional Diagnostics Tool

- Camera View
- 3D Scene View
- Social World Model
- Audio Input
- Audio Output
- Action Output
- Agent
- Performance

## Recording and Playback

- Recording real situations
- Playback through Thalamus

## And Also

- ROS Node
- Docker Image
- Many Features are Optional by Design: VERY helpful for testing

## MC Bigger Picture

- Chest + Base
- MC Core + Monitor
- Traditional: Animation Generator
- Navigation
- Thalamus ROS Node, Parameters, updated Chat Page, etc.

## About Testing

## Points for Discussion

- Improved servo control for new arms and hands
- Improved animation system
- Other OmegaClaw possibilities -> SingularityNET

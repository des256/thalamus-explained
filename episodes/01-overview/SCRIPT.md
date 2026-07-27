# EPISODE 1. OVERVIEW

[videos: nao, pepper, alice, sophia]

There is something disturbing about
every social robot ever built.

After decades of demos,
they still appear lifeless and unaware,
marooned in the uncanny valley.

They generated real excitement,
made real headlines and then quietly
disappeared from most places
people actually live and work.

The hardware kept improving.
The models kept improving.
And yet...

The robots don't seem to know you're there.

---

Now, as clickbaity as that sounds,
it is nothing more than an observation of
how difficult it really is
to engineer robots to behave socially.

Meaningful eyecontact,
understanding who is in the room,
understanding what they say,
what they mean, nonverbal communication,
social positioning,

and

emotional expression
are still severely lacking.

Modern chat technology
brings speech to these robots.

More ambitious projects add
a level of lipsync
and animation.

But,
at the core,
these robots are still
reactive digital assistants.

Hi, I'm Desmond,

and in this series we're going to
explore this space.

We're going to design and build a
new technology stack for social robotics
that breaks through these limitations
and allows for more grounded exploration
of real social interaction,
on real edge hardware,
with real constraints,
using today's AI coding tools.

Join me, as we find out where the ceiling is.

## What is Social Interaction?

Social interaction is
not a request-response loop.

Social interaction is
not a text chat.

Social interaction is a continuous exchange
across multiple channels at once:

what you say, how you say it —
your tone, your rhythm, your emphasis —

where you're looking,
what your face is doing,
how you're holding your body,
your gestures,
and how close you're standing to someone.

All of it happening simultaneously.
All of it informing the rest.

It requires tracking
not just what someone says,
but what they mean, what they already know,
and what they're likely to do next.

And it requires doing all of this in real time.

When one person is talking,
the other is nodding and "mm-hmm"ing,
glancing away at important moments,
smiling at others,
repositioning,

And all of this is happening
within a 200ms response time.

A one-second delay in conversation
is slow and meaningful.

A three-second delay
is a social violation.

This means latency is
not an optimization target,
but a first-class design constraint.

And it should shape every
architectural decision you make.

## Three Approaches

So how do you design a system that
can participate in all this?

There are roughly three directions,
and I want to start with the most idealistic.

### The Holy Grail

Train a large model,
between 40 to 100 billion parameters,
to take in everything:

audio, video, sensor data,
the robot's own joint positions and body state,
and a prompt,

and output both speech
and servo control signals directly.

This is the cleanest solution,
the holy grail of social robotics.

There is no interface design,
no cascading errors between modules.

If the model is good enough,
it learns the full complexity
of social behavior from data.

#### However

Sadly, this training data doesn't exist.

Vision-Language-Action (VLA) research
has made real progress,
but almost entirely for manipulation tasks —
pick-and-place, tool use, navigation.

Social interaction data at this scale,
with the right labels,
just isn't there.

Then there's the latency.

A 100-billion parameter model
cannot complete a forward pass
fast enough to respond in 200 milliseconds.

Not on edge hardware.

And not even in the cloud at reasonable cost.

### Vibe-explaining the Frontier Model

The second direction is using a frontier model.

Send audio, video, and a context prompt
to an existing frontier model.

Decode its output into animation and speech.

And let the model curate its own social rules,
through its prompt,

essentially vibe-explaining to the robot
how it should behave.

This is what most ambitious projects do today.

And it's become more viable recently.
GPT-4o Realtime and Gemini Flash
have pushed audio-to-audio latency
down to around 300 milliseconds.
That is getting promisingly close.

#### However

Natural language is an imprecise medium
for encoding social rules.

You can tell a model to
"maintain appropriate eye contact"
or "respect personal space"

but translating those instructions
into reliable, consistent behavior
is a different problem entirely.

### Start with a Better Tech Stack

Don't ask one model to do everything.

Pre-process the raw signals first,

face recognition,
speaker diarization — who said what, when,
gaze estimation, emotion detection,
spatial positioning

before they ever reach the core.

Now the core receives
low-bandwidth, structured,
semantically meaningful inputs,
and can focus on higher-level
reasoning and response.

A fast reactive layer
can respond to what's happening
at 100ms latency.

A slower deliberative layer
handles intent and planning.

#### However

This is considerably harder to pull off.

You have to explicitly define
how to represent
"person A broke eye contact
and seems uncomfortable"
in a way the core can reliably act on.

And you have to understand the
performance characteristics of the
software on the actual edge platform.

### But

I'd like to put forward
that good machinery
actually helps all approaches.

A well-designed perception layer,
one that identifies
who is in the room,
tracks attention and emotional state,
and maintains a model
of the social context,
doesn't just serve the tech stack.

It provides the training signal
for our holy grail model.

And it offloads the fine-grained
social detail that no amount of
vibe-explaining
can reliably encode.

### And

What if we could actually run
all of this locally,
on the edge.

Wouldn't that be much better
for privacy?

## Overview

                 │ Holy Grail (VLA)         │ Frontier Model               │ Tech Stack
-----------------|--------------------------|------------------------------|----------------------------
Latency          │ Fails: 40-100B params    │ Borderline: ~300ms with      │ Meets constraint: reactive
                 │ cannot meet 200ms        │ latest APIs                  │ layer at <100ms
-----------------|--------------------------|------------------------------|----------------------------
Social precision │ Potentially high, if     │ Limited by natural language  │ High — structured inputs,
                 | trained correctly        │ imprecision                  │ explicit rules
-----------------|--------------------------|------------------------------|----------------------------
Training data    │ Doesn't exist for social │ Not required                 │ Not required (benefits from
                 │ interaction              │                              │ it)
-----------------|--------------------------|------------------------------|----------------------------
Privacy          │ Edge possible in theory  │ Cloud dependency:            │ Edge-native, local
                 │                          │ audio+video leaves device    │ processing
-----------------|--------------------------|------------------------------|----------------------------
Modularity       │ None: opaque end-to-end  │ Low: prompt engineering only │ High: components updated
                 │                          │                              │ independently
-----------------|--------------------------|------------------------------|----------------------------
Implementation   │ Very high                │ Low to medium                │ High
difficulty       │                          │                              │
-----------------|--------------------------|------------------------------|----------------------------
Maturity         │ Research stage           │ Production-ready today       │ Requires custom engineering


The VLA approach needs training data
that doesn't exist
and cannot meet the latency constraint
on any current hardware

The frontier model approach
is bottlenecked by the
expressiveness of natural language,
a fundamental limit, not an engineering one.

The tech stack is the only approach
where all three failure modes
are addressable:

latency is met by
keeping the core model small,
social precision is met
by structured inputs
rather than prose instructions,

and privacy is met by running
locally on edge hardware.

It also has a compounding advantage:

the perception layer it builds
is exactly what the other two approaches need.
It generates labeled social interaction
data for future VLA training,
and it handles the fine-grained encoding
that prompt engineering cannot.

Building the stack doesn't foreclose
the other directions, it funds them.

## Engineering Perspective


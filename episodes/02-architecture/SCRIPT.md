# EPISODE 2 - ARCHITECTURE

You will see me nerdify the topics around social interaction, turning everything into engineering jargon and clinical explainations. This is not a character quirk, but very deliberate. This is an engineering problem, so we're going to have to get through a bit of rewording and sanitizing.

## Emphasis and Focus

Take a 1990s video game approach to create a coding environment where you can play with all kinds of social behavior ideas.

### Traditionally

collection of Docker/Python/ROS projects - very hard to integrate, realtime real human interaction is an afterthought

### Instead

Realtime real human interaction is the main purpose - docker/ROS are the afterthought

## Architecture

Overview: video in, audio in -> core agent -> audio out, animations

### Video Input

Get as much socially relevant information as possible/useful from the incoming camera frames.

#### Position and Orientation

We want to know where every face is in 3D, and how it is oriented.

#### Gaze

We want to know where everyone is looking. This is vital for eye contact.

#### Identification

We want to know who the people are around the robot. Facial recognition is one possible technique.

#### Expression

We want to know what the face is expressing. Is it smiling, frowning, etc.

#### Speaker Detection

We want to know who is speaking, and that can be obtained visually.

### Audio Input

Get as much socially relevant information as possible/useful from the incoming microphone audio.

#### Direction

The microphone provides a crude direction-of-arrival which we can use to hear where speech is coming from.

#### Voice Activity

Voice activity detection is a simple filter to detect speech from the audio stream.

#### Barge-In

We want to be able to just talk to the robot and have the robot stop talking. The robot should also not respond to its own audio, so the system should provide some form of acoustic echo cancellation.

#### Identification

We want to be able to detect who is speaking from the audio stream.

#### Speech Recognition

Of course, we want to know what is being said.

#### Sentiment

While a person is talking, we want to be aware of roughly where the speech is going. Is it a request, a statement, is the speaker positive or negative, etc. This can be useful to make the robot attend or show some sort of listening cue.

### Audio Output

Make the robot speak.

#### Nuance

A quick analysis of the outgoing text reveals what the intended nuance is from the agent.

#### Speech Generation

Of course, we want speech to be generated.

#### Facial Animation

Once audio starts to appear, we want to render corresponding facial animations and lip sync.

### Animations

The robot should perform social actions.

#### Gestures

The robot can trigger a variety of gestures at different intensities.

#### Looking at People

The robot should be able to look someone in the eye, to attend to someone. Also, it should be possible to address a group of people by cycling through the different folks.

#### Pointing at Things

The robot should be able to physically point at things.

### Core Agent

Still missing for now. We're going to zoom in on this in episode 7.

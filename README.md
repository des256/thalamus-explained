# thalamus-explained

Scripts, scene data and the animation renderer for the video series about
deriving platform requirements for Thalamus from invented use cases. The origin
discussion is in `INIT.md`.

## Layout

```
remotion/        Remotion project: theme, vocabulary components, compositions
  src/theme.tsx      fixed styling: canvas, type scale, geometry, motion, palettes
  src/vocabulary/    Floorplan, Person, Robot, GazeLine, AddresseeArrow, GroupHull,
                     Bubble, Clock, BudgetBar, Ticker, Narration, Pulse, Card, Dot,
                     Title, LowerThird
  src/compositions/  Scene (renders any trace), Strip (the cold-open ending),
                     Vocabulary (sticker sheet); Card, Board, AxisTable, Ladder follow
  src/trace/         trace and floorplan schemas (zod), keyframe interpolation,
                     seeded generator for throwaway scenes
data/            scene data, the shared contract with the future simulator
  cast.json          the fixed cast, with preferred hue slot and role
  traces/            one JSON trace per scene; keyframes, events, narration
floorplans/      floorplan feature files in meters, one per domain: walls, exhibits,
                 furniture, zones and a dock for the robot's home position
diagrams/        Mermaid and Excalidraw sources for the architecture episodes
docs/            episode outlines and production notes
scripts/         render-all and lint
```

`source` and `output` are symbolic links to the `Thalamus` folders on the
shared drive. Renders land in `remotion/out/`, which is ignored by git.

## Rendering

```
cd remotion
npm install
npm run dev                                   # Remotion studio
npx remotion still vocab-mock-dark out/x.png  # one still
npx remotion render museum-coldopen out/museum-coldopen.mp4   # a scene
npx remotion render cold-open out/cold-open.mp4               # cold open with ending
npm run lint                                  # eslint + tsc
```

Scene compositions carry the id of their trace file. Sticker sheets are named
`vocab-<page>-<mode>` with pages `elements`, `board`, `mock` and modes `dark`,
`light`, `paper`. Default mode is paper. Canvas is 1920 by 1080 at 24 fps;
render with `--scale 2` for 4K delivery.

## Traces

A trace is keyframes plus events plus narration beats, validated by the zod
schema in `remotion/src/trace/schema.ts`. Positions are meters on the
floorplan, y down. Keyframes interpolate linearly; the clock interpolates
between the keyframes that set it, so a jump in the clock is a time-lapse.
`layers` switches vocabulary on and off per trace; `principals` names up to
three people who get a colour. Events: `say`, `heard`, `ticker`, `pulse`,
`title`, `fail`.

## Style rules baked into the theme

- Colour carries identity for at most three principals per scene: blue, orange,
  aqua. Everyone else is neutral grey with a name label. The three hues are
  validated for every pairing on all three surfaces, including colour-vision
  simulation; a fourth hue is not.
- Truth is a solid disc, belief is a dashed ghost in the same hue, stale belief
  is amber, lost is red. Status colours never carry meaning alone.
- The robot is primary ink with a heading pointer, so it never collides with a
  person hue.
- A red cross lights up where something fails and stays as a faint tally that
  travels with the robot or the person it belongs to.
- Domain dots on cards: museum blue, hospitality orange, care aqua, stage violet.
  The first three reuse the identity slots. Violet is a dots-only hue, validated
  against the trio, with dot position and the legend as the secondary encoding.
- Floorplans are data in meters with y pointing down. Discs and robot have fixed
  pixel sizes so legibility does not depend on room size.

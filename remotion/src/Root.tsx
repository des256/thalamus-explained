import React from "react";
import { Composition, Still } from "remotion";
import { MODES, canvas } from "./theme";
import { PAGES, Vocabulary } from "./compositions/Vocabulary";
import { Scene, sceneDuration } from "./compositions/Scene";
import { Strip, stripDuration } from "./compositions/Strip";
import { loadFloorplan, loadTrace, type Trace } from "./trace/schema";
import museumRaw from "../../floorplans/museum.json";
import hospitalityRaw from "../../floorplans/hospitality.json";
import careRaw from "../../floorplans/care.json";
import stageRaw from "../../floorplans/stage.json";
import coldOpenRaw from "../../data/traces/museum-coldopen.json";

const floorplans = {
  museum: loadFloorplan(museumRaw),
  hospitality: loadFloorplan(hospitalityRaw),
  care: loadFloorplan(careRaw),
  stage: loadFloorplan(stageRaw),
};

// A still per floorplan with the robot and a few people for scale.
const previewTrace = (plan: (typeof floorplans)[keyof typeof floorplans]): Trace => {
  const dock = plan.features.find((f) => f.kind === "dock");
  const home: { pos: [number, number]; heading: number } = dock
    ? { pos: [dock.x, dock.y], heading: dock.heading }
    : { pos: [plan.meters.width / 2, plan.meters.height / 2], heading: 90 };
  return {
  id: `plan-${plan.id}`,
  floorplan: plan.id,
  duration: 1,
  view: "overlay",
  layers: { ticker: false, narration: false, budget: false, hull: false, belief: false, gaze: false, headings: false, confidence: false },
  principals: ["chris"],
  keyframes: [
    {
      t: 0,
      clock: "10:00:00",
      robot: home,
      people: {
        wendy: { pos: [plan.meters.width / 2 - 2, plan.meters.height / 2 + 1.5] },
        chris: { pos: [plan.meters.width / 2 + 1.5, plan.meters.height / 2 + 1.8] },
        ben: { pos: [plan.meters.width / 2 + 0.2, plan.meters.height / 2 + 2.6] },
      },
    },
  ],
  events: [],
  narration: [],
  };
};
const traces = [loadTrace(coldOpenRaw)];
const coldOpen = { trace: traces[0], floorplan: floorplans.museum };

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="cold-open"
      component={Strip}
      durationInFrames={stripDuration()}
      fps={canvas.fps}
      width={canvas.width}
      height={canvas.height}
      defaultProps={{ main: coldOpen, title: "Inventing Jobs for a Robot", subtitle: "Episode 1" }}
    />
    {traces.map((trace) => (
      <Composition
        key={trace.id}
        id={trace.id}
        component={Scene}
        durationInFrames={sceneDuration(trace)}
        fps={canvas.fps}
        width={canvas.width}
        height={canvas.height}
        defaultProps={{ trace, floorplan: floorplans[trace.floorplan as keyof typeof floorplans] }}
      />
    ))}
    {Object.values(floorplans).map((plan) => (
      <Still
        key={`plan-${plan.id}`}
        id={`plan-${plan.id}`}
        component={Scene}
        width={canvas.width}
        height={canvas.height}
        defaultProps={{ trace: previewTrace(plan), floorplan: plan, fade: false }}
      />
    ))}
    {PAGES.flatMap((page) =>
      MODES.map((mode) => (
        <Still
          key={`vocab-${page}-${mode}`}
          id={`vocab-${page}-${mode}`}
          component={Vocabulary}
          width={canvas.width}
          height={canvas.height}
          defaultProps={{ mode, page }}
        />
      )),
    )}
  </>
);

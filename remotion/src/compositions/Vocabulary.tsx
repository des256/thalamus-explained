import React from "react";
import { DOMAINS, DOMAIN_LABEL, Mode, ThemeProvider, canvas, type, useTheme } from "../theme";
import {
  AddresseeArrow,
  BudgetBar,
  Bubble,
  Canvas,
  Card,
  Clock,
  Dot,
  Fail,
  Floorplan,
  GazeLine,
  GroupHull,
  LowerThird,
  Narration,
  Person,
  Pulse,
  Robot,
  Stage,
  Text,
  Ticker,
  Title,
  type Feature,
} from "../vocabulary";
import cast from "../../../data/cast.json";

// The sticker sheet: every vocabulary component in every state, plus one
// composed mock scene. The style reference for humans and for the model loop.

export type Page = "elements" | "board" | "mock";
export const PAGES: readonly Page[] = ["elements", "board", "mock"] as const;
export type VocabularyProps = { mode: Mode; page: Page };

const PX_PER_M = 100;

const Specimen: React.FC<{ x: number; y: number; w: number; h: number; title: string; children: React.ReactNode }> = ({ x, y, w, h, title, children }) => {
  const { palette } = useTheme();
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill="none" stroke={palette.hairline} strokeWidth={1} strokeDasharray="4 6" />
      <Text x={x + 12} y={y + 18} text={title} size={type.caption} weight={500} color={palette.inkSecondary} />
      {children}
    </g>
  );
};

// A specimen whose content is a tiny floorplan stage at a fixed scale.
const StageSpecimen: React.FC<{ x: number; y: number; w: number; h: number; title: string; children: React.ReactNode }> = ({ x, y, w, h, title, children }) => (
  <Specimen x={x} y={y} w={w} h={h} title={title}>
    <Stage left={x} top={y + 36} width={w} height={h - 36} meters={{ width: w / PX_PER_M, height: (h - 36) / PX_PER_M }}>
      {children}
    </Stage>
  </Specimen>
);

const PageTitle: React.FC<{ text: string }> = ({ text }) => {
  const { palette } = useTheme();
  return <Text x={canvas.safe} y={canvas.safe + 10} text={text} size={type.heading} weight={700} color={palette.ink} />;
};

const who = (id: string) => cast.people.find((p) => p.id === id)!;

const Elements: React.FC<{ mode: Mode }> = ({ mode }) => {
  const cols = 6;
  const gap = 24;
  const top = canvas.safe + 60;
  const w = (canvas.width - canvas.safe * 2 - gap * (cols - 1)) / cols;
  const h = (canvas.height - canvas.safe - top - gap * 2) / 3;
  const at = (i: number) => ({ x: canvas.safe + (i % cols) * (w + gap), y: top + Math.floor(i / cols) * (h + gap), w, h });
  const cx = w / PX_PER_M / 2;
  const cy = (h - 36) / PX_PER_M / 2 - 0.1;
  const nile = who("nile");
  const chris = who("chris");
  const yue = who("yue");
  const wendy = who("wendy");
  const pamela = who("pamela");
  const zoe = who("zoe");
  const ben = who("ben");
  return (
    <>
      <PageTitle text={`Vocabulary · scene elements · ${mode}`} />
      <StageSpecimen {...at(0)} title="Person · truth, principal">
        <Person x={cx} y={cy} name={nile.name} slot="blue" confidence={0.92} heading={-90} />
      </StageSpecimen>
      <StageSpecimen {...at(1)} title="Person · belief ghost">
        <Person x={cx} y={cy} name={chris.name} slot="orange" view="belief" confidence={0.6} heading={-90} />
      </StageSpecimen>
      <StageSpecimen {...at(2)} title="Person · stale belief">
        <Person x={cx} y={cy} name={yue.name} slot="blue" view="belief" stale confidence={0.3} />
      </StageSpecimen>
      <StageSpecimen {...at(3)} title="Person · unknown">
        <Person x={cx} y={cy} unknown view="belief" confidence={0.2} />
      </StageSpecimen>
      <StageSpecimen {...at(4)} title="Person · neutral, named">
        <Person x={cx} y={cy} name={pamela.name} confidence={0.8} />
      </StageSpecimen>
      <StageSpecimen {...at(5)} title="Person · bystander">
        <Person x={cx} y={cy} bystander />
      </StageSpecimen>
      <StageSpecimen {...at(6)} title="Person · staff">
        <Person x={cx} y={cy} name={wendy.name} slot="aqua" staff confidence={0.95} />
      </StageSpecimen>
      <StageSpecimen {...at(7)} title="Person · addressee">
        <Person x={cx} y={cy} name={chris.name} slot="orange" addressee />
      </StageSpecimen>
      <StageSpecimen {...at(8)} title="Child · elder">
        <Person x={cx - 0.5} y={cy} name={zoe.name} slot="orange" age="child" />
        <Person x={cx + 0.5} y={cy} name={ben.name} slot="aqua" age="elder" />
      </StageSpecimen>
      <StageSpecimen {...at(9)} title="Robot · idle">
        <Robot x={cx} y={cy} heading={-90} />
      </StageSpecimen>
      <StageSpecimen {...at(10)} title="Robot · listening">
        <Robot x={cx} y={cy} heading={-90} state="listening" />
      </StageSpecimen>
      <StageSpecimen {...at(11)} title="Robot · speaking + gaze">
        <Robot x={cx - 0.5} y={cy} heading={0} state="speaking" gaze={1.3} />
      </StageSpecimen>
      <StageSpecimen {...at(12)} title="Robot · moving">
        <Robot x={cx + 0.2} y={cy} heading={0} state="moving" />
      </StageSpecimen>
      <StageSpecimen {...at(13)} title="Gaze + addressee">
        <GazeLine from={[0.5, 1.4]} to={[2.1, 0.6]} />
        <AddresseeArrow from={[2.1, 0.6]} to={[2.1, 1.75]} label="to" bulge={-40} />
        <Robot x={0.5} y={1.4} heading={-30} />
        <Person x={2.1} y={0.6} name={nile.name} slot="blue" labelSide="above" />
        <Person x={2.1} y={1.75} name={chris.name} slot="orange" />
      </StageSpecimen>
      <StageSpecimen {...at(14)} title="Group hull · straggler">
        <GroupHull members={[[0.7, 0.8], [1.35, 0.6], [1.0, 1.35]]} detached={[[2.2, 1.6]]} />
        <Person x={0.7} y={0.8} bystander={false} />
        <Person x={1.35} y={0.6} />
        <Person x={1.0} y={1.35} />
        <Person x={2.2} y={1.6} name={ben.name} slot="aqua" age="elder" labelSide="above" />
      </StageSpecimen>
      <StageSpecimen {...at(15)} title="Bubble · said">
        <Person x={0.45} y={1.9} name={nile.name} slot="blue" />
        <Bubble x={0.45} y={1.9} text="Where did Ben go?" maxWidth={220} lift={24} />
      </StageSpecimen>
      <StageSpecimen {...at(16)} title="Bubble · heard">
        <Robot x={0.45} y={1.9} heading={-90} state="listening" />
        <Bubble x={0.45} y={1.9} text="where did ben go" variant="heard" attribution="Nile · 0.72" maxWidth={240} lift={24} anchorRadius={28} />
      </StageSpecimen>
      <StageSpecimen {...at(17)} title="Pulse · fail tally">
        <Person x={cx} y={cy} name={chris.name} slot="orange" view="belief" stale />
        <Pulse x={cx} y={cy} phase={0.15} />
        <Pulse x={cx} y={cy} phase={0.5} />
        <Pulse x={cx} y={cy} phase={0.85} />
        <Fail x={cx} y={cy} index={0} age={0.05} kind="person" />
        <Fail x={cx} y={cy} index={1} age={2} kind="person" />
        <Fail x={cx} y={cy} index={2} age={2} kind="person" />
      </StageSpecimen>
    </>
  );
};

const Board: React.FC<{ mode: Mode }> = ({ mode }) => {
  const { palette } = useTheme();
  const gap = 24;
  const top = canvas.safe + 60;
  const cardW = 324;
  const cardH = 252;
  const cx = (i: number) => canvas.safe + i * (cardW + gap);
  const row2 = top + cardH + gap;
  const row3 = row2 + 200 + gap;
  return (
    <>
      <PageTitle text={`Vocabulary · board and chrome · ${mode}`} />
      <Specimen x={cx(0)} y={top} w={cardW} h={cardH} title="Card · pile tag, one domain">
        <Card x={cx(0) + 12} y={top + 36} data={{ id: "name-binding", title: "Name binding is a one-shot event", pile: "Perceiving the group", domains: ["museum"] }} />
      </Specimen>
      <Specimen x={cx(1)} y={top} w={cardW} h={cardH} title="Card · part tag, core">
        <Card x={cx(1) + 12} y={top + 36} data={{ id: "handoff", title: "Handoff to staff is a first-class action", pile: "Running the tour", part: "handoff", domains: ["museum", "hospitality", "care", "stage"], kind: "core" }} tag="part" />
      </Specimen>
      <Specimen x={cx(2)} y={top} w={cardW} h={cardH} title="Card · parameter">
        <Card x={cx(2) + 12} y={top + 36} data={{ id: "identity-lifetime", title: "Identity has a lifetime and a confidence", part: "world", domains: ["museum", "hospitality", "care"], kind: "parameter" }} tag="part" />
      </Specimen>
      <Specimen x={cx(3)} y={top} w={cardW} h={cardH} title="Card · plugin, highlighted">
        <Card x={cx(3) + 12} y={top + 36} data={{ id: "care-plan", title: "Care plan is the authoritative knowledge source", part: "memory", domains: ["care"], kind: "plugin" }} tag="part" highlight />
      </Specimen>
      <Specimen x={cx(4)} y={top} w={cardW} h={cardH} title="Card · dimmed">
        <Card x={cx(4) + 12} y={top + 36} data={{ id: "floor-control", title: "Fairness and floor control", pile: "Talking with the group", domains: ["museum", "care", "stage"] }} dimmed />
      </Specimen>

      <Specimen x={canvas.safe} y={row2} w={360} h={210} title="Domain dots">
        {DOMAINS.map((d, i) => (
          <g key={d}>
            <Dot x={canvas.safe + 28} y={row2 + 64 + i * 40} domain={d} filled />
            <Dot x={canvas.safe + 56} y={row2 + 64 + i * 40} domain={d} filled={false} />
            <Text x={canvas.safe + 80} y={row2 + 64 + i * 40} text={DOMAIN_LABEL[d]} size={type.label} weight={500} />
          </g>
        ))}
      </Specimen>
      <Specimen x={canvas.safe + 384} y={row2} w={240} h={200} title="Clock">
        <Clock x={canvas.safe + 384 + 220} y={row2 + 80} time="14:07:31" />
      </Specimen>
      <Specimen x={canvas.safe + 648} y={row2} w={468} h={200} title="Budget bar · normal, low, overrun">
        <BudgetBar x={canvas.safe + 672} y={row2 + 56} label="Stop 2 · The Night Watch" remaining={120} total={180} />
        <BudgetBar x={canvas.safe + 672} y={row2 + 104} label="Stop 2 · The Night Watch" remaining={30} total={180} />
        <BudgetBar x={canvas.safe + 672} y={row2 + 152} label="Stop 2 · The Night Watch" remaining={-25} total={180} />
      </Specimen>
      <Specimen x={canvas.safe + 1140} y={row2} w={420} h={200} title="Lower third">
        <LowerThird name="Desmond Germans" role="Thalamus · social robotics" x={canvas.safe + 1164} y={row2 + 60} />
      </Specimen>

      <Specimen x={canvas.safe} y={row3} w={448} h={290} title="Title · chapter card (scaled 0.22)">
        <g transform={`translate(${canvas.safe + 12}, ${row3 + 36}) scale(0.22)`}>
          <rect x={0} y={0} width={canvas.width} height={canvas.height} fill={palette.background} stroke={palette.hairline} strokeWidth={4} />
          <Title text="The method revealed" subtitle="Anatomy of the prompt" />
        </g>
      </Specimen>
      <Text x={canvas.safe} y={canvas.height - 48 - 24 - 56} text="Narration" size={type.caption} color={palette.inkSecondary} />
      <Narration text="The robot still believes Ben is nearby. Its last fix is twenty seconds old." />
      <Ticker events={[{ t: 31, text: "Nile: “Where did Ben go?”" }, { t: 28.4, text: "group cohesion 0.6" }, { t: 11.2, text: "Ben last seen" }, { t: 0, text: "arrived at stop 2" }]} />
    </>
  );
};

const MOCK_ROOM = { width: 16, height: 8 };
const MOCK_FEATURES: Feature[] = [
  { kind: "zone", x: 0.2, y: 0.2, width: 15.6, height: 7.6, label: "Gallery 3 · Rembrandt" },
  { kind: "wall", points: [[0, 0], [16, 0], [16, 8], [10, 8]] },
  { kind: "wall", points: [[8, 8], [0, 8], [0, 0]] },
  { kind: "exhibit", x: 3.5, y: 0.15, width: 4, height: 0.5, label: "The Night Watch" },
  { kind: "exhibit", x: 8.5, y: 0.15, width: 2, height: 0.5, label: "Self-portrait" },
  { kind: "exhibit", x: 11.5, y: 0.15, width: 3, height: 0.5, label: "The Jewish Bride" },
  { kind: "furniture", x: 9.5, y: 5.4, width: 2, height: 0.6, label: "bench" },
];

const Mock: React.FC<{ mode: Mode }> = ({ mode }) => {
  const { palette } = useTheme();
  const nile = who("nile");
  const chris = who("chris");
  const yue = who("yue");
  const pamela = who("pamela");
  const zoe = who("zoe");
  const ben = who("ben");
  const group: [number, number][] = [[4.0, 2.2], [5.2, 1.6], [2.9, 3.3], [4.2, 3.6], [3.0, 2.15]];
  return (
    <>
      <BudgetBar x={canvas.safe} y={60} label="Stop 2 · The Night Watch" remaining={40} total={180} />
      <Text x={canvas.width / 2} y={70} text={`mock scene · overlay view · ${mode}`} size={type.caption} anchor="middle" color={palette.muted} />
      <Clock x={canvas.width - canvas.safe} y={70} time="14:07:31" />
      <Stage left={canvas.safe} top={140} width={canvas.width - canvas.safe * 2} height={740} meters={MOCK_ROOM}>
        <Floorplan features={MOCK_FEATURES} highlight="The Night Watch" />
        <GroupHull members={group} detached={[[12.5, 5.6]]} />
        <GazeLine from={[5.5, 3.6]} to={[4.0, 2.2]} />
        <Person x={2.9} y={3.3} name={yue.name} confidence={0.8} />
        <Person x={4.2} y={3.6} name={pamela.name} age="elder" confidence={0.7} />
        <Person x={3.0} y={2.15} name={zoe.name} age="child" confidence={0.6} />
        <Person x={5.2} y={1.6} name={chris.name} slot="orange" confidence={0.85} labelSide="above" />
        <Person x={4.0} y={2.2} name={nile.name} slot="blue" confidence={0.92} heading={43} />
        <Person x={10.0} y={6.5} bystander />
        <Person x={10.0} y={6.5} unknown view="belief" confidence={0.4} />
        <Person x={12.5} y={5.6} name={ben.name} slot="aqua" age="elder" heading={-90} />
        <Person x={6.6} y={2.3} name={ben.name} slot="aqua" age="elder" view="belief" stale confidence={0.3} />
        <Pulse x={6.6} y={2.3} phase={0.5} />
        <Robot x={5.5} y={3.6} heading={-137} state="speaking" gaze={1.8} />
        <Bubble x={4.0} y={2.2} text="Where did Ben go?" side="left" lift={30} maxWidth={330} />
        <Bubble x={5.5} y={3.6} text="where did ben go" variant="heard" attribution="Nile · 0.72" side="right" place="below" lift={60} maxWidth={320} anchorRadius={28} />
      </Stage>
      <Narration text="The robot still believes Ben is nearby. Its last fix is twenty seconds old." />
      <Ticker events={[{ t: 31, text: "Nile: “Where did Ben go?”" }, { t: 28.4, text: "group cohesion 0.6" }, { t: 11.2, text: "Ben last seen" }, { t: 0, text: "arrived at stop 2" }]} />
    </>
  );
};

export const Vocabulary: React.FC<VocabularyProps> = ({ mode, page }) => (
  <ThemeProvider mode={mode}>
    <Canvas>
      {page === "elements" && <Elements mode={mode} />}
      {page === "board" && <Board mode={mode} />}
      {page === "mock" && <Mock mode={mode} />}
    </Canvas>
  </ThemeProvider>
);

import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Self-hosted Inter variable font (latin subset), so renders are identical on
// every machine and need no network. Weight range covers 400 to 700.
export const fontFamily = "Inter";

loadFont({
  family: fontFamily,
  url: staticFile("fonts/Inter-latin.woff2"),
  weight: "100 900",
  format: "woff2",
});

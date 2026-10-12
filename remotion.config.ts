import { Config } from "@remotion/cli/config";

/** Konfigurasi Remotion Studio & render CLI. Entry menunjuk ke registry komposisi. */
Config.setEntryPoint("src/remotion/index.ts");
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

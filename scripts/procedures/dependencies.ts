import { types as T, matches } from "../deps.ts";

const { shape, number, boolean, string } = matches;

const matchLightningdConfig = shape({
  advanced: shape({
    clams_remote_websocket: boolean
  })
});

export const dependencies: T.ExpectedExports.dependencies = {
  "c-lightning": {
    // deno-lint-ignore require-await
    async check(effects, configInput) {
      effects.info("check lightningd");
      const config = matchLightningdConfig.unsafeCast(configInput);
      if (!matchLightningdConfig.test(config)) {
        return { error: "lightningd config is not the correct shape" };
      }

      if (!config.advanced.clams_remote_websocket) {
        return { error: "Must have the Clams Remote websocket interface enabled." };
      }

      return { result: null };
    },

    // deno-lint-ignore require-await
    async autoConfigure(effects, configInput) {
      effects.info("Autoconfigure Core Lightning to support Clams Remote.");
      const config = matchLightningdConfig.unsafeCast(configInput);
      config.advanced.clams_remote_websocket = true;

      return { result: config };
    },
  },
};
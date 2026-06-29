import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "https://graphql.anilist.co",
  documents: ["lib/anilist/graphql/**/*.graphql"],
  generates: {
    "./lib/anilist/generated/": {
      preset: "client",
      presetConfig: {
        fragmentMasking: false,
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;

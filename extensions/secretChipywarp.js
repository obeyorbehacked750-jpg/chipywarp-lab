(function (Scratch) {
  "use strict";

  class ChipywarpUnusedBlocks {
    getInfo() {
      return {
        id: "chipywarpUnusedBlocks",
        name: "Chipywarp Secret Blocks",
        color1: "#47cc4b", 
        blocks: [
          {
            blockType: Scratch.BlockType.XML,
            xml: '<block type="data_getdynamicvar"><value name="VAR_NAME"><shadow type="text"><field name="TEXT">my variable</field></shadow></value></block>',
          },
          {
            blockType: Scratch.BlockType.XML,
            xml: '<block type="data_createdynamicvar"><value name="VAR_NAME"><shadow type="text"><field name="TEXT">my variable</field></shadow></value><value name="VALUE"><shadow type="text"><field name="TEXT">0</field></shadow></value></block>',
          },
          {
            blockType: Scratch.BlockType.XML,
            xml: '<block type="data_resetdynamicvar"><value name="VAR_NAME"><shadow type="text"><field name="TEXT">my variable</field></shadow></value></block>',
          }
        ]
      };
    }
  }

  Scratch.extensions.register(new ChipywarpUnusedBlocks());
})(Scratch);

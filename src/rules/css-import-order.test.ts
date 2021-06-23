import { RuleTester } from "eslint";

import rule from "./css-import-order";

const tester = new RuleTester({ parserOptions: { ecmaVersion: 2015, sourceType: "module" } });

tester.run("css-import-order", rule, {
  valid: [{ code:
`import React from "react";
import localFile from "../local/file";

import "./local-css-file.scss";`,
  }],
  invalid: [
    {
      code:
`import React from "react";
import localFile from "../local/file";
import "./local-css-file.scss";`,
      errors: [{ message: "Expected a new line before the css import statement" }],
      output:
`import React from "react";
import localFile from "../local/file";

import "./local-css-file.scss";`
    },
    {
      code:
`import "./local-css-file.scss";
import React from "react";
import localFile from "../local/file";`,
      errors: [{ message: "Expected the css import statement to be in the end of the import block" }],
      output:
`import localFile from "../local/file";
import React from "react";

import "./local-css-file.scss";`
    },
  ],
});

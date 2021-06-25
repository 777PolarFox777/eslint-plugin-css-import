import { RuleTester } from "eslint";

import rule from "./css-import-order";

const tester = new RuleTester({ parserOptions: { ecmaVersion: 2015, sourceType: "module" } });

const newLineBeforeError = { message: "Expected a new line before the css import statement" };
const endOfTheInputBlockError = { message: "Expected the css import statement to be in the end of the import block" };

tester.run("css-import-order", rule, {
  valid: [{ code:
`import React from "react";
import localFile from "../local/file";

import "./local-css-file.scss";`,
  },
    { code:
        `import React from "react";
import localFile from "../local/file";

import "./local-css-file.scss";
import "./other-local-css-file.scss";`,
    },
    { code:
        `import "./local-css-file.scss";
import "./other-local-css-file.scss";
import "./one-more-local-css-file.scss";`,
    }],
  invalid: [
    { code:
        `import "./local-css-file.scss";
import "./other-local-css-file.scss";
import "./one-more-local-css-file.scss";
import React from "react";`,
      options: [{ applyAllFixes: true }],
      errors: [endOfTheInputBlockError, endOfTheInputBlockError, endOfTheInputBlockError],
      output:
        `import "./other-local-css-file.scss";
import "./one-more-local-css-file.scss";
import React from "react";

import "./local-css-file.scss";`,
    },
    { code:
        `import "./other-local-css-file.scss";
import "./one-more-local-css-file.scss";
import React from "react";

import "./local-css-file.scss";`,
      errors: [endOfTheInputBlockError, endOfTheInputBlockError],
      output:
        `import "./one-more-local-css-file.scss";
import React from "react";

import "./local-css-file.scss";
import "./other-local-css-file.scss";`,
    },
    { code:
        `import "./one-more-local-css-file.scss";
import React from "react";

import "./local-css-file.scss";
import "./other-local-css-file.scss";`,
      errors: [endOfTheInputBlockError],
      output:
        `import React from "react";

import "./local-css-file.scss";
import "./other-local-css-file.scss";
import "./one-more-local-css-file.scss";`,
    },
    {
      code:
`import React from "react";
import localFile from "../local/file";
import "./local-css-file.scss";`,
      errors: [newLineBeforeError],
      output:
`import React from "react";
import localFile from "../local/file";

import "./local-css-file.scss";`,
    },
    {
      code:
`import "./local-css-file.scss";
import React from "react";
import localFile from "../local/file";`,
      errors: [endOfTheInputBlockError],
      output:
`import React from "react";
import localFile from "../local/file";

import "./local-css-file.scss";`
    },
    {
      code:
        `import React from "react";

import "./local-css-file.scss";
import localFile from "../local/file";`,
      errors: [endOfTheInputBlockError],
      output:
        `import React from "react";
import localFile from "../local/file";

import "./local-css-file.scss";`
    },
    {
      code:
        `import React from "react";
import "./local-css-file.scss";
import localFile from "../local/file";`,
      errors: [endOfTheInputBlockError],
      output:
        `import React from "react";
import localFile from "../local/file";

import "./local-css-file.scss";`
    },
    {
      code:
        `import React from "react";
import "./local-css-file.scss";

import localFile from "../local/file";`,
      errors: [endOfTheInputBlockError],
      output:
        `import React from "react";

import localFile from "../local/file";

import "./local-css-file.scss";`,
    },
    {
      code:
        `import React from "react";
import {
 A,
 B,
 C,
} from "./some-stuff";
import "./local-css-file.scss";`,
      errors: [newLineBeforeError],
      output:
        `import React from "react";
import {
 A,
 B,
 C,
} from "./some-stuff";

import "./local-css-file.scss";`,
    },
  ],
});

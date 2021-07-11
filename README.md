# eslint-plugin-css-import
Adds a simple eslint rule to correctly order css imports

# Concept

This rule allows to properly order and indent css imports. For example, this:
```js
import A from "module-a";
import "./my-css.css";
import B from "./module-b";
```

Will be converted to:
```js
import A from "module-a";
import B from "./module-b";

import "./my-css.css";
```

So css imports are not mixed with regular imports.

# Installation

Simply install the package: `npm i -D eslin-plugin-css-import` or `yarn add -D eslin-plugin-css-import`.

Then in your `.eslintrc` add:

```json
{
  "plugins": ["eslint-plugin-css-import"],
  "extends": ["eslint-plugin-css-import/recommended"]
}
```

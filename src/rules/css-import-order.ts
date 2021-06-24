import { AST, Rule } from "eslint";
import { ImportDeclaration } from "estree";

const rule: Rule.RuleModule = {
  meta: {
    fixable: "code",
    type: "layout",
  },
  create: context => {
    let importStatements: (ImportDeclaration & Rule.NodeParentExtension)[] = [];

    return {
      ImportDeclaration: node => {
        importStatements.push(node);
      },
      "Program:exit": () => {
        const sourceCode = context.getSourceCode();
        const cssImport = importStatements.find((imp) => /\.s?css$/.test(imp.source.value as string));

        const lastImport = importStatements[importStatements.length - 1];

        if (!cssImport) {
          return;
        }

        const lines = sourceCode.getLines();
        const currentLineNumber = cssImport.source.loc?.start.line;

        if (!currentLineNumber || currentLineNumber < 0) {
          return;
        }

        const currentLineIndex = currentLineNumber - 1;
        const lineBeforeCssImport = lines[currentLineIndex - 1];
        // if this is the first line isLineBeforeCssImportEmpty should be false
        const isLineBeforeCssImportEmpty = lineBeforeCssImport != undefined ? /^\s*$/g.test(lineBeforeCssImport) : false;

        // if the css import is the last import already
        if (importStatements.indexOf(lastImport) === importStatements.indexOf(cssImport)) {
          // insert an empty line if missing
          if (!isLineBeforeCssImportEmpty) {
            context.report({
              node: cssImport,
              message: "Expected a new line before the css import statement",
              fix(fixer) {
                return fixer.insertTextBefore(cssImport, "\n");
              },
            });
          }
          return;
        }

        const cssImportRange = cssImport.range as AST.Range;

        const cssImportCode = "\n\n" + sourceCode.text.slice(...cssImportRange);

        const oldCssImportRange = (() => {
          // if the first line
          if (currentLineIndex === 0) {
            // remove with the \n in the end of line
            return [0, cssImportRange[1] + 1] as AST.Range;
          }

          // if there's an empty line before
          if (isLineBeforeCssImportEmpty) {
            // remove with the \n\n before the line
            return [cssImportRange[0] - 2, cssImportRange[1]] as AST.Range;
          }
          // other cases

          // remove with the \n before the line
          return [cssImportRange[0] - 1, cssImportRange[1]] as AST.Range;
        })();

        // if the css import is not the last one - remove the old css and append the new one after the last import
        context.report({
          node: cssImport,
          message: "Expected the css import statement to be in the end of the import block",
          fix(fixer) {
            return [
              // append css import after the last import
              fixer.insertTextAfter(lastImport, cssImportCode),
              // stripe out css import from previous place
              fixer.replaceTextRange(oldCssImportRange, ""),
            ];
          },
        });

        importStatements = [];
      },
    };
  },
};

export default rule;

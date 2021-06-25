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
        const checkForCssImport = (str: string) => /\.s?css/.test(str);
        const cssImports = importStatements.filter((imp) => checkForCssImport(imp.source.value as string));

        const lastImport = importStatements[importStatements.length - 1];
        const lastNonCssImport = importStatements.filter((imp) => !checkForCssImport(imp.source.value as string)).reverse()[0];

        if (!cssImports.length || !lastNonCssImport) {
          return;
        }

        const lastNonCssImportRange = lastNonCssImport.range as AST.Range;

        const lines = sourceCode.getLines();

        cssImports.forEach((cssImport) => {
          const currentLineNumber = cssImport.source.loc?.start.line;
          const lastNonCssImportLineNumber = lastNonCssImport.source.loc?.start.line;

          if (!currentLineNumber || currentLineNumber < 0 || !lastNonCssImportLineNumber) {
            return;
          }

          const currentLineIndex = currentLineNumber - 1;
          const lineBeforeCssImport = lines[currentLineIndex - 1];
          // if this is the first line isLineBeforeCssImportEmpty should be false
          const isLineBeforeCssImportEmpty = lineBeforeCssImport != undefined ? /^\s*$/g.test(lineBeforeCssImport) : false;
          const isLineBeforeCssImportIsCssImport = lineBeforeCssImport && checkForCssImport(lineBeforeCssImport);

          // if the css import is below the last non css import and there's a blank line or other css import above - do nothing
          if (currentLineNumber > lastNonCssImportLineNumber && (isLineBeforeCssImportEmpty || isLineBeforeCssImportIsCssImport)) {
            return;
          }

          // if the line before css import is the last non css import
          if (lineBeforeCssImport && lineBeforeCssImport === sourceCode.text.slice(...lastNonCssImportRange)) {
            return context.report({
                node: cssImport,
                message: "Expected a new line before the css import statement",
                fix(fixer) {
                  return fixer.insertTextBefore(cssImport, "\n");
                },
              });
          }

          const cssImportRange = cssImport.range as AST.Range;

          const isLastImportIsCssImport = checkForCssImport(lastImport.source.value as string);

          // do not add a blank line before if there's a group of the css imports
          const padding = isLastImportIsCssImport ? "\n" : "\n\n";

          const cssImportCode = padding + sourceCode.text.slice(...cssImportRange);

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
        });

        importStatements = [];
      },
    };
  },
};

export default rule;

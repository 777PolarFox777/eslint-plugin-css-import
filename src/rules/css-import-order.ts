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
        const cssImport = importStatements.find((imp) => /\.s?css$/.test(imp.source.value as string) )

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
        const lineBeforeInput = lines[currentLineIndex - 1]

        // if the css import is the last import already - just add a blank line before it
        if (importStatements.indexOf(lastImport) === importStatements.indexOf(cssImport)) {
          if (!/^\s*$/g.test(lineBeforeInput)) {
            context.report({
              node: cssImport,
              message: "Expected a new line before the css import statement",
              fix(fixer) {
                return fixer.insertTextBefore(cssImport, "\n");
              }
            })
          }

          return;
        }

        const cssImportCode = "\n" + sourceCode.text.slice(...cssImport.range as number[]);
        const lastImportCode = sourceCode.text.slice(...lastImport.range as number[]);

        // if the css import is not the last one - swap with the last one
        context.report({
          node: cssImport,
          message: "Expected the css import statement to be in the end of the import block",
          fix(fixer) {
            return [
              fixer.replaceTextRange(cssImport.range as AST.Range, lastImportCode),
              fixer.replaceTextRange(lastImport.range as AST.Range, cssImportCode)
            ];
          }
        })

        importStatements = []
      }
    };
  },
};

export default rule;

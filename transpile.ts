// @ts-nocheck
import ts, { factory } from 'typescript';

const map: { [key: string]: string } = {
    react: "window.React"
};
  
function transformer(context: ts.TransformationContext) {
    return (sourceFile: ts.SourceFile) => {
        function visit(node: ts.Node): ts.Node {
        if (ts.isImportDeclaration(node)) {
            const {importClause} = node;
            const moduleSpecifier = node.moduleSpecifier.getText().slice(1,-1);

            const dImport: string | undefined = importClause?.name?.getText();
            const destructured: string[] | undefined = importClause?.namedBindings?.elements?.map?.((el: any) => el.getText());

            let name: string | null = null;
            if (Object.keys(map).includes(moduleSpecifier)) {
            name = map[moduleSpecifier]
            } else if (moduleSpecifier.startsWith("@vendetta")) {
            name = moduleSpecifier.substring(1).replace(/\//g, ".")
            };

            if (!name) return null; // Delete the import node, return node instead to return the node unchanged if wanted

            const declarations: any = [];

            if (dImport) {
            declarations.push(factory.createVariableDeclaration(
                dImport,
                undefined,
                undefined,
                factory.createIdentifier(name)
            ));
            }

            if (destructured) {
            destructured.forEach(thing => {
                declarations.push(factory.createVariableDeclaration(
                factory.createObjectBindingPattern([
                    factory.createBindingElement(undefined, undefined, factory.createIdentifier(thing)),
                ]),
                undefined,
                undefined,
                factory.createIdentifier(name!)
                ))
            });
            }

            const variableStatement = factory.createVariableStatement(
            undefined,
            factory.createVariableDeclarationList(declarations, ts.NodeFlags.None)
            );

            return variableStatement;
        }
        return ts.visitEachChild(node, visit, context);
        }

        return ts.visitNode(sourceFile, visit);
    };
}
  
export default function(tsCode: string) {
    const compilerOptions = {
        target: ts.ScriptTarget.ES2015,
        module: ts.ModuleKind.None,
        moduleResolution: ts.ModuleResolutionKind.Node16,
        jsx: ts.JsxEmit.React,
        esModuleInterop: false,
        skipLibCheck: true,
        noImplicitUseStrict: true,
        experimentalDecorators: true
    };

    const transformerFactory: ts.TransformerFactory<ts.SourceFile> = (context) => {
        return (sourceFile) => {
        return ts.visitNode(sourceFile, transformer(context));
        };
    };

    const sourceFile = ts.createSourceFile(
        'index.ts', // filename
        tsCode,  // source code
        ts.ScriptTarget.ESNext, // target version
        true, // setParentNodes to true
        ts.ScriptKind.TSX
    );

    const transformedSourceFile = ts.transform(sourceFile, [transformerFactory]);
    const transformedCode = ts.createPrinter().printFile(transformedSourceFile.transformed[0]);

    const result = ts.transpile(transformedCode, compilerOptions);

    return result;
}
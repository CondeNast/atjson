---
title: CKEditor Source
---

The CKEditor Source provides an abstract AtJSON source definition representing a [CKEditor5 model](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_model-Model.html).

It also provides a tool in `bin/index.ts` that can generate annotations and a concrete
implementation of an atjson source from a given [Editor build](https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html). The annotations are
derived from the document schema in the editor. To run this tool, we recommend first copying the script bundled with this package into your local bin directory:

```
mkdir bin
cp "/path/to/node_modules/@atjson/source-ckeditor/bin/index.ts" bin

```

and then run with ts-node:

```
ts-node bin/index.ts --out=out --name=name --buildPackage=buildPackage --buildName=buildName --language=language
```

where\
`out` [test] is the output directory (relative to the current working directory),\
`name` [CKEditorClassicBuildSource] is the class name of the generated class that extends the abstract class,\
`buildPackage` [@ckeditor/ckeditor5-build-classic] is the name of the package to import for the CKEditor5 build from which to generate a schema,\
`buildName` [default] is the name of the exported CKEditor5 build from the package,\
`language` [ts] is a choice of `javascript`/`js` and `typescript`/`ts` of the output files.

A sample CKEditor5 source is included in the test directory which is generated from
the `@ckeditor/ckeditor5-build-classic` editor build via running:

```
ts-node bin/index.ts --out=test/source-ckeditor-build-classic --name=CKEditorTestSource --buildPackage=@ckeditor/ckeditor5-build-classic --buildName=default --language=ts
```

---
title: CKEditor Source
---

The CKEditor Source provides an abstract AtJSON source definition representing a [CKEditor5 model](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_model-Model.html).

It also provides a tool in `bin/index.ts` that can generate annotations and a concrete
implementation of an atjson source from a given [Editor build](https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html). The annotations are
derived from the document schema in the editor. To run this tool:

```
ts-node bin/index.ts --out=out --name=name --build=build --language=language
```

where
`out` is the output directory (relative to the current working directory),
`name` is the class name of the generated class that extends the abstract class,
`build` is the name of the CKEditor5 build from which to generate a schema
`langauge` is a choice of `javascript`/`js` and `typescript`/`ts` of the output files

A sample CKEditor5 source is included in the test directory which is generated from
the `@ckeditor/ckeditor5-build-classic` editor build via running:

```
ts-node bin/index.ts --out=test/source-ckeditor-build-classic --name=CKEditorTestSource --build=@ckeditor/ckeditor5-build-classic --language=ts
```

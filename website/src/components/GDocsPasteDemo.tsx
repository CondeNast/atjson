import OffsetSource from "@atjson/offset-annotations";
import GoogleDocsPasteSource from "@atjson/source-gdocs-paste";
import CodeBlock from "@theme/CodeBlock";
import * as React from "react";
import { FC, useState } from "react";
import { TextArea } from "./TextArea.tsx";

const AtjsonBlock: FC<{ document: OffsetSource }> = props => {
  let { schema, ...json } = props.document.toJSON();
  return (
    <CodeBlock className="json">{JSON.stringify(json, null, 2)}</CodeBlock>
  );
};

export const GDocsPasteDemo = () => {
  let [value, setValue] = useState("");
  let [doc, setDoc] = useState<GoogleDocsPasteSource | null>(null);
  return (
    <>
      <TextArea
        autoResize={true}
        value={value}
        onChange={evt => setValue(evt.target.value)}
        onPaste={evt => {
          let gdocsPaste = evt.clipboardData.getData(
            "application/x-vnd.google-docs-document-slice-clip+wrapped"
          );
          if (gdocsPaste !== "") {
            let data = JSON.parse(JSON.parse(gdocsPaste).data);
            setDoc(GoogleDocsPasteSource.fromRaw(data));
          }
        }}
      />
      {doc && <AtjsonBlock document={doc.convertTo(OffsetSource)} />}
    </>
  );
};

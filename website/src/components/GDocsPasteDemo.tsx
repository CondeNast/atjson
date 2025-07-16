import { serialize } from "@atjson/document";
import OffsetSource from "@atjson/offset-annotations";
import GoogleDocsPasteSource from "@atjson/source-gdocs-paste";
import CodeBlock from "@theme/CodeBlock";
import { Button } from "./Button";
import * as React from "react";
import { FC, useState, useMemo } from "react";
import { TextArea } from "./TextArea";
import { GDocsPasteBuffer } from "@atjson/source-gdocs-paste/dist/commonjs/gdocs-parser";

const AtjsonBlock: FC<{ document: OffsetSource }> = (props) => {
  return (
    <CodeBlock className="json">
      {JSON.stringify(serialize(props.document), null, 2)}
    </CodeBlock>
  );
};

export const GDocsPasteDemo = () => {
  let [value, setValue] = useState("");
  let [clipboardData, setClipboardData] = useState<GDocsPasteBuffer | null>(
    null
  );
  let doc: GoogleDocsPasteSource | null = useMemo(() => {
    if (clipboardData) {
      return GoogleDocsPasteSource.fromRaw(clipboardData);
    }
  }, [clipboardData]);

  return (
    <>
      <TextArea
        autoResize={true}
        value={value}
        onChange={(evt) => setValue(evt.target.value)}
        onPaste={(evt) => {
          let gdocsPaste = evt.clipboardData.getData(
            "application/x-vnd.google-docs-document-slice-clip+wrapped"
          );
          if (gdocsPaste !== "") {
            setClipboardData(
              JSON.parse(JSON.parse(gdocsPaste).data) as GDocsPasteBuffer
            );
          }
        }}
      />
      <Button
        onClick={(evt) => {
          evt.stopPropagation();
          if (clipboardData) {
            navigator.clipboard.writeText(JSON.stringify(clipboardData));
          }
          return false;
        }}
        disabled={clipboardData == null}
      >
        Copy GDocs Paste data
      </Button>
      <br />
      {doc && <AtjsonBlock document={doc.convertTo(OffsetSource)} />}
    </>
  );
};

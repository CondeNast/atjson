import fromGDocsPaste from "../src";
import * as fs from "fs";

const example = fs.readFileSync(__dirname + "/invisible-cities.json");

document.addEventListener("paste", evt => {
  let doc = fromGDocsPaste(evt);
  if (doc) {
    document.body.innerText = JSON.stringify(doc.toJSON(), null, 2);
  }
});

document.querySelector("button").addEventListener("click", () => {
  var evt = new ClipboardEvent("paste", {
    bubbles: true,
    cancelable: true,
    dataType: "application/x-vnd.google-docs-document-slice-clip+wrapped",
    data: example.toString()
  });

  document.body.innerText = JSON.stringify(
    fromGDocsPaste(evt).toJSON(),
    null,
    2
  );
});

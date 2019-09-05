import GoogleDocsPasteSource from "../src";
import * as fs from "fs";

const example = fs.readFileSync(__dirname + "/invisible-cities.json");

document.addEventListener("paste", evt => {
  let gdocsPaste = evt.clipboardData.getData(
    "application/x-vnd.google-docs-document-slice-clip+wrapped"
  );
  if (gdocsPaste !== "") {
    let data = JSON.parse(JSON.parse(gdocsPaste).data);
    document.body.innerText = JSON.stringify(
      GoogleDocsPasteSource.fromRaw(data).toJSON(),
      null,
      2
    );
  }
});

document.querySelector("button").addEventListener("click", () => {
  let data = JSON.parse(JSON.parse(example.toString()).data);
  document.body.innerText = JSON.stringify(
    GoogleDocsPasteSource.fromRaw(data).toJSON(),
    null,
    2
  );
});

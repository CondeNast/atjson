import OffsetSource from "@atjson/offset-annotations";
import CommonmarkRenderer from "@atjson/renderer-commonmark";
import HTMLSource from "../src";
import * as fs from "fs";

const example = fs.readFileSync(__dirname + "/invisible-cities.html");

document.addEventListener("paste", evt => {
  let html =
    evt.clipboardData.getData("application/html") ||
    evt.clipboardData.getData("text/plain");
  if (html !== "") {
    let htmlDoc = HTMLSource.fromRaw(html);
    let commonmarkText = CommonmarkRenderer.render(
      htmlDoc.convertTo(OffsetSource)
    );
    document.body.innerText =
      commonmarkText +
      "\n\n-----------------\n\n" +
      JSON.stringify(htmlDoc.toJSON(), null, 2);
  }
});

document.querySelector("button").addEventListener("click", () => {
  let htmlDoc = HTMLSource.fromRaw(example.toString());
  let commonmarkText = CommonmarkRenderer.render(
    htmlDoc.convertTo(OffsetSource)
  );
  document.body.innerText =
    commonmarkText +
    "\n\n-----------------\n\n" +
    JSON.stringify(htmlDoc.toJSON(), null, 2);
});

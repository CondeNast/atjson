import OffsetSource from "@atjson/offset-annotations";
import URLSource from "../src";

document.addEventListener("paste", (evt) => {
  let pasteBuffer = evt.clipboardData.getData("text/plain");
  if (pasteBuffer !== "") {
    document.body.innerText = JSON.stringify(
      URLSource.fromRaw(pasteBuffer).convertTo(OffsetSource).toJSON(),
      null,
      2
    );
  }
});

document.querySelector("button").addEventListener("click", () => {
  document.body.innerText = JSON.stringify(
    URLSource.fromRaw(
      "https://twitter.com/jennschiffer/status/708888255828250625"
    )
      .convertTo(OffsetSource)
      .toJSON(),
    null,
    2
  );
});

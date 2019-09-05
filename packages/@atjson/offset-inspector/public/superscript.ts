export default class Superscript {
  static annotationName = "superscript";

  static elementRenderer = (node: any): Element => {
    return document.createElement("sup");
  };

  static get selectionButton() {
    let el = document.createElement("button");
    el.setAttribute("data-type", this.annotationName);
    el.innerHTML = this.annotationName;
    let start;
    let end;

    el.addEventListener("selectionchange", (evt: CustomEvent) => {
      start = evt.detail.start;
      end = evt.detail.end;
      console.log("set start and end to", { start, end });
    });

    el.addEventListener("click", _ => {
      el.dispatchEvent(
        new CustomEvent("addAnnotation", {
          bubbles: true,
          composed: true,
          detail: {
            type: "superscript",
            start,
            end
          }
        })
      );
    });
    return el;
  }
}

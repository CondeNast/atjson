import * as https from "https";

export function classify(name: string) {
  return name[0].toUpperCase() + name.slice(1);
}

export function get(url: string, options: https.RequestOptions = {}) {
  return new Promise<string>((resolve, reject) => {
    https.get(url, options, (response) => {
      const { statusCode } = response;
      const contentType = response.headers["content-type"];

      let error;
      if (statusCode !== 200) {
        error = new Error("Request Failed.\n" + `Status Code: ${statusCode}`);
      } else if (contentType && !/^text\/html/.test(contentType)) {
        error = new Error(
          "Invalid content-type.\n" +
            `Expected text/html but received ${contentType}`
        );
      }
      if (error) {
        // Consume response data to free up memory
        response.resume();
        reject(error);
        return;
      }

      response.setEncoding("utf8");
      let rawData = "";
      response.on("data", (chunk) => {
        rawData += chunk;
      });
      response.on("end", () => {
        try {
          resolve(rawData);
        } catch (e) {
          reject(e);
        }
      });
    });
  });
}

export function nextSection(document: Document) {
  let nextSectionElement = document.querySelector(
    "nav a:last-child"
  ) as HTMLAnchorElement;
  let nextSectionURL = nextSectionElement
    ? nextSectionElement.getAttribute("href")
    : null;
  if (nextSectionURL && !nextSectionURL.startsWith("http")) {
    if (nextSectionURL.startsWith("/")) {
      nextSectionURL = `https://html.spec.whatwg.org${nextSectionURL}`;
    } else {
      nextSectionURL = `https://html.spec.whatwg.org/multipage/${nextSectionURL}`;
    }
  }
  return nextSectionURL || "";
}

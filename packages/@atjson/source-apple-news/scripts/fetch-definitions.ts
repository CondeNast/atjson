import { Annotation } from "@atjson/document";
import HTMLSource from "@atjson/source-html";
import { writeFileSync } from "fs";
import * as puppeteer from "puppeteer";
import { Page } from "puppeteer";

interface Definition {
  URL: string;
  inherits?: string;
  example?: string;
  documentation: string;
  definitions: {
    [key: string]: {
      deprecated: boolean;
      required: boolean;
      documentation: string;
      type: string;
    };
  };
}

let definitions: {
  [key: string]: Definition;
} = {};

let foundDefinitions: {
  [key: string]: {
    URL: string;
    inherits?: string;
  };
} = {};

function hasClass(className: string) {
  return (a: Annotation<any>) => {
    return (a.attributes.class || "").split(" ").indexOf(className) !== -1;
  };
}

function isInside(
  a: Record<"row", Annotation<any>>,
  b: Annotation<any>
): boolean;
function isInside(a: Annotation<any>, b: Annotation<any>): boolean;
function isInside(
  a: Annotation<any> | Record<"row", Annotation<any>>,
  b: Annotation<any>
) {
  if ("row" in a) {
    return a.row.start < b.start && a.row.end > b.end;
  }
  return a.start < b.start && a.end > b.end;
}

async function fetchDefinitionFor(page: Page, URL: string, inherits?: string) {
  await page.goto(URL);

  let html = await page.evaluate(
    () => document.querySelector("main")!.innerHTML
  );

  let doc = HTMLSource.fromRaw(html);
  let title = [...doc.where({ type: "-html-h1" })][0]!;
  let discussion = doc
    .where({ attributes: { "-html-id": "discussion" } })
    .as("row");
  let discussionText = doc.where(hasClass("formatted-content")).as("contents");
  let code = doc.where(hasClass("objectexample-object")).as("codeBlock");
  let example = doc.where(hasClass("objectexample")).as("exampleBody");

  let interfaceName = doc.slice(title.start, title.end).canonical().content;
  let definition: Partial<Definition> = {
    URL,
    inherits,
    definitions: {}
  };

  discussion
    .join(discussionText, isInside)
    .outerJoin(code, isInside)
    .outerJoin(example, isInside)
    .update(({ contents, exampleBody, codeBlock }) => {
      let hasExample = exampleBody.length;
      if (hasExample) {
        definition.documentation = doc.slice(
          contents[0]!.start,
          exampleBody[0]!.start
        ).content;
        let example = doc
          .slice(codeBlock[0]!.start, codeBlock[0]!.end)
          .canonical();
        example.where({ type: "-html-code" }).update(a => {
          example.insertText(a.end, "\n");
        });
        definition.example = example.content;
      } else {
        definition.documentation = doc.slice(
          contents[0]!.start,
          contents[0]!.end
        ).content;
      }
    });

  let propertyRow = doc.where(hasClass("parametertable-row")).as("row");
  let propertyName = doc.where(hasClass("parametertable-name")).as("names");
  let propertyType = doc.where(hasClass("parametertable-type")).as("types");
  let propertyRef = doc.where(hasClass("symbolref")).as("refs");
  let propertyRequired = doc
    .where(hasClass("parametertable-requirement"))
    .as("required");
  let propertyDeprecated = doc
    .where(hasClass("violator-deprecated"))
    .as("deprecated");
  let propertyDescription = doc
    .where(hasClass("parametertable-description"))
    .as("descriptions");
  let propertyTypes = doc.where(hasClass("possibletypes")).as("possibleTypes");
  let propertyValues = doc
    .where(hasClass("possiblevalues"))
    .as("possibleValues");

  propertyRow
    .join(propertyName, isInside)
    .join(propertyType, isInside)
    .outerJoin(propertyRef, isInside)
    .outerJoin(propertyRequired, isInside)
    .outerJoin(propertyDeprecated, isInside)
    .outerJoin(propertyValues, isInside)
    .join(propertyDescription, isInside)
    .outerJoin(propertyTypes, isInside)
    .update(
      ({
        names,
        refs,
        required,
        deprecated,
        types,
        possibleValues,
        possibleTypes,
        descriptions
      }) => {
        let description = descriptions[0]!;
        let name = names[0]!;
        let type = types[0]!;
        let isRequired = required.length > 0;

        let tsType = doc
          .slice(type.start, type.end)
          .canonical()
          .content.trim();
        let key = doc.slice(name.start, name.end).canonical().content;

        if (key === "Any Key") {
          key = "[key: string]";
          isRequired = true;
        }

        // Use metadata to derive type
        if (tsType === "*") {
          tsType = "any";
        } else if (tsType === "integer" || tsType === "float") {
          tsType = "number";
        } else if (tsType === "uri" || tsType === "date-time") {
          tsType = "string";
        }

        let array = tsType.match(/^\[(.*)\]$/);
        if (array) {
          tsType = `${array[1]}[]`;
        }

        if (possibleValues[0]) {
          let code = [
            ...doc
              .slice(possibleValues[0].start, possibleValues[0].end)
              .where({ type: "-html-code" })
          ][0]!;

          tsType = doc
            .slice(
              code.start + possibleValues[0].start,
              code.end + possibleValues[0].start
            )
            .canonical()
            .content.split(", ")
            .map(value => {
              if (value.match(/^\d+$/)) {
                return value;
              } else {
                return `"${value}"`;
              }
            })
            .join(" | ");
        }

        if (possibleTypes[0]) {
          let code = [
            ...doc
              .slice(possibleTypes[0].start, possibleTypes[0].end)
              .where({ type: "-html-code" })
          ][0]!;

          tsType = doc
            .slice(
              code.start + possibleTypes[0].start,
              code.end + possibleTypes[0].start
            )
            .canonical()
            .content.replace(/string\(([^)]+)\)/, "$1")
            .split(", ")
            .map(value => {
              let arr = value.match(/^\[(.*)\]$/);
              if (arr) {
                return `${arr[1]}[]`;
              } else if (value === "integer" || value === "float") {
                return "number";
              } else if (value === "uri" || value === "date-time") {
                return "string";
              }

              return value;
            })
            .join(" | ");
        }

        definition.definitions![key] = {
          required: isRequired,
          deprecated: deprecated.length > 0,
          documentation: doc
            .slice(description.start, description.end)
            .content.replace(
              /<code class="code-voice"><span></g,
              '<code class="code-voice"><span>&lt;'
            ),
          type: tsType
        };

        refs.forEach(ref => {
          foundDefinitions[
            doc.slice(ref.start, ref.end).canonical().content
          ] = {
            URL: `https://developer.apple.com${ref.attributes.href}`
          };
        });
      }
    );

  definitions[interfaceName] = definition as Definition;
  foundDefinitions[interfaceName] = {
    URL
  };
}

async function fetchSubclassesFor(page: Page, URL: string, inherits: string) {
  await page.goto(URL);

  let html = await page.evaluate(
    () => document.querySelector("main")!.innerHTML
  );

  let doc = HTMLSource.fromRaw(html);
  let main = doc.where(hasClass("formatted-content")).as("main");
  let allLinks = doc.where({ type: "-html-a" }).as("links");

  main.join(allLinks, isInside).update(({ links }) => {
    links.forEach(link => {
      let name = doc
        .slice(link.start, link.end)
        .canonical()
        .content.trim();
      if (name.indexOf(" ") === -1) {
        foundDefinitions[name] = {
          URL: `https://developer.apple.com${link.attributes.href}`,
          inherits
        };
      }
    });
  });
}

(async () => {
  let browser = await puppeteer.launch();
  let page = await browser.newPage();

  await fetchDefinitionFor(
    page,
    "https://developer.apple.com/documentation/apple_news/articledocument"
  );

  await fetchSubclassesFor(
    page,
    "https://developer.apple.com/documentation/apple_news/apple_news_format/components",
    "Component"
  );

  await fetchSubclassesFor(
    page,
    "https://developer.apple.com/documentation/apple_news/apple_news_format/components/about_component_animations",
    "ComponentAnimation"
  );

  await fetchSubclassesFor(
    page,
    "https://developer.apple.com/documentation/apple_news/apple_news_format/components/about_component_behaviors",
    "Behavior"
  );

  let stillToFind = Object.keys(foundDefinitions).filter(
    name => !definitions[name]
  );

  while (stillToFind.length) {
    let toFind = foundDefinitions[stillToFind[0]];
    await fetchDefinitionFor(page, toFind.URL, toFind.inherits);
    stillToFind = Object.keys(foundDefinitions).filter(
      name => !definitions[name]
    );
  }

  writeFileSync(
    "/tmp/apple-news-format.json",
    JSON.stringify(definitions, null, 2)
  );
  browser.close();
})();

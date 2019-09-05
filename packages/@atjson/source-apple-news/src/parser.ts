import { Annotation, ParseAnnotation } from "@atjson/document";
import { ArticleDocument, getAnnotationFor } from "./annotations";
import {
  ArticleDocument as IArticleDocument,
  Component
} from "./apple-news-format";

function hasText(
  component: Component
): component is Component & {
  text: string;
  format?: "markdown" | "html" | "none";
} {
  return "text" in component;
}

function hasComponents(
  component: Component
): component is Component & { components: Component[] } {
  return "components" in component;
}

function getAttributes(component: Component) {
  return Object.keys(component).reduce(
    (attributes, key) => {
      if (key !== "text" && key !== "components") {
        attributes[key] = (component as any)[key];
      }
      return attributes;
    },
    {} as any
  );
}

export default class Parser {
  content: string;
  annotations: Annotation[];

  constructor(article: IArticleDocument) {
    this.content = "";
    this.annotations = [];

    article.components.forEach(component => {
      this.walk(component);
    });

    this.annotations.push(
      new ArticleDocument({
        id: article.identifier,
        start: 0,
        end: this.content.length,
        attributes: article
      })
    );
  }

  walk(component: Component) {
    let AnnotationClass = getAnnotationFor(component) as any;
    let start = this.content.length;

    if (hasText(component)) {
      // Handle HTML and Markdown
      this.content += component.text;
    } else if (hasComponents(component)) {
      component.components.forEach(child => {
        this.walk(child);
      });
    } else {
      this.annotations.push(
        new ParseAnnotation({
          start,
          end: start + 1,
          attributes: { reason: `${AnnotationClass.type}` }
        })
      );
      this.content += "\uFFFC";
    }

    this.annotations.push(
      new AnnotationClass({
        start,
        end: this.content.length,
        attributes: getAttributes(component)
      })
    );
  }
}

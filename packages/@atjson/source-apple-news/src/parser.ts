import { Annotation, ParseAnnotation } from "@atjson/document";
import { ArticleDocument } from "./annotations";
import {
  ArticleDocument as IArticleDocument,
  Component
} from "./apple-news-format";
import { createAnnotation, hasComponents, hasText } from "./utils";

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
    let start = this.content.length;

    if (hasText(component)) {
      // Handle HTML and Markdown
      this.content += component.text;
    } else if (hasComponents(component) && component.components) {
      component.components.forEach(child => {
        this.walk(child);
      });
    } else {
      this.annotations.push(
        new ParseAnnotation({
          start,
          end: start + 1,
          attributes: { reason: `${component.role}` }
        })
      );
      this.content += "\uFFFC";
    }

    this.annotations.push(
      createAnnotation(start, this.content.length, component)
    );
  }
}

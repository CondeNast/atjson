import OffsetSource from "@atjson/schema-offset";
import MobiledocSource from "./source";

MobiledocSource.defineConverterTo(OffsetSource, function mobileDocToOffset(
  doc
) {
  doc
    .where({ type: "-mobiledoc-a" })
    .set({ type: "-offset-link" })
    .rename({ attributes: { "-mobiledoc-href": "-offset-url" } });
  doc.where({ type: "-mobiledoc-aside" }).set({ type: "-offset-pullquote" });
  doc
    .where({ type: "-mobiledoc-pull-quote" })
    .set({ type: "-offset-pullquote" });

  doc
    .where({ type: "-mobiledoc-blockquote" })
    .set({ type: "-offset-blockquote" });

  doc
    .where({ type: "-mobiledoc-h1" })
    .set({ type: "-offset-heading", attributes: { "-offset-level": 1 } });
  doc
    .where({ type: "-mobiledoc-h2" })
    .set({ type: "-offset-heading", attributes: { "-offset-level": 2 } });
  doc
    .where({ type: "-mobiledoc-h3" })
    .set({ type: "-offset-heading", attributes: { "-offset-level": 3 } });
  doc
    .where({ type: "-mobiledoc-h4" })
    .set({ type: "-offset-heading", attributes: { "-offset-level": 4 } });
  doc
    .where({ type: "-mobiledoc-h5" })
    .set({ type: "-offset-heading", attributes: { "-offset-level": 5 } });
  doc
    .where({ type: "-mobiledoc-h6" })
    .set({ type: "-offset-heading", attributes: { "-offset-level": 6 } });

  doc.where({ type: "-mobiledoc-p" }).set({ type: "-offset-paragraph" });
  doc.where({ type: "-mobiledoc-br" }).set({ type: "-offset-line-break" });
  doc.where({ type: "-mobiledoc-hr" }).set({ type: "-offset-horizontal-rule" });

  doc
    .where({ type: "-mobiledoc-ul" })
    .set({ type: "-offset-list", attributes: { "-offset-type": "bulleted" } });
  doc
    .where({ type: "-mobiledoc-ol" })
    .set({ type: "-offset-list", attributes: { "-offset-type": "numbered" } });
  doc.where({ type: "-mobiledoc-li" }).set({ type: "-offset-list-item" });

  doc.where({ type: "-mobiledoc-em" }).set({ type: "-offset-italic" });
  doc.where({ type: "-mobiledoc-i" }).set({ type: "-offset-italic" });
  doc.where({ type: "-mobiledoc-strong" }).set({ type: "-offset-bold" });
  doc.where({ type: "-mobiledoc-b" }).set({ type: "-offset-bold" });
  doc.where({ type: "-mobiledoc-del" }).set({ type: "-offset-strikethrough" });
  doc.where({ type: "-mobiledoc-sub" }).set({ type: "-offset-subscript" });
  doc.where({ type: "-mobiledoc-sup" }).set({ type: "-offset-superscript" });
  doc.where({ type: "-mobiledoc-u" }).set({ type: "-offset-underline" });

  doc
    .where({ type: "-mobiledoc-img" })
    .set({ type: "-offset-image" })
    .rename({ attributes: { "-mobiledoc-src": "-offset-url" } });

  return doc;
});

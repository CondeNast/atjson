import { Bold } from "./bold";
import { Italic } from "./italic";
import { LineBreak } from "./line-break";
import { Link } from "./link";
import { List } from "./list";
import { ListItem } from "./list-item";
import { Paragraph } from "./paragraph";
import { Strikethrough } from "./strikethrough";
import { Subscript } from "./subscript";
import { Superscript } from "./superscript";
import { Underline } from "./underline";

const CaptionSchema = {
  type: "application/vnd.atjson+offset-caption",
  version: "1",
  annotations: {
    Bold,
    Italic,
    LineBreak,
    Link,
    List,
    ListItem,
    Paragraph,
    Subscript,
    Strikethrough,
    Superscript,
    Underline
  }
} as const;

export default CaptionSchema;

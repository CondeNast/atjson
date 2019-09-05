import OffsetBlockquote from "./components/blockquote";
import OffsetBold from "./components/bold";
import OffsetHeading from "./components/heading";
import OffsetItalic from "./components/italic";
import OffsetLink from "./components/link";
import OffsetParagraph from "./components/paragraph";
import OffsetStrikethrough from "./components/strikethrough";
import OffsetSuperscript from "./components/superscript";
import OffsetUnderline from "./components/underline";

let OffsetCoreComponents = [
  OffsetBlockquote,
  OffsetBold,
  OffsetHeading,
  OffsetItalic,
  OffsetLink,
  OffsetParagraph,
  OffsetStrikethrough,
  OffsetSuperscript,
  OffsetUnderline
];

export default OffsetCoreComponents;
export * from "./mixins/editable-component";

type Type = "paragraph" | "object" | "inline" | "block";
type TextBehaviour = "exclusive" | "inclusive";

export default interface Schema {
  [key: string]: {
    type: Type;
    textBehaviour?: TextBehaviour;
  };
}

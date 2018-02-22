type Type = "paragraph" | "object" | "inline" | "block";

export default interface Schema {
  [key: string]: {
    type: Type;
  };
}

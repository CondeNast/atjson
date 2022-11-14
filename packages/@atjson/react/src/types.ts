export type Mark = {
  id: string;
  type: string;
  range: string;
  attributes: Record<string, unknown>;
};

export type InternalMark = Mark & {
  start: number;
  end: number;
};

export type Block = {
  id: string;
  type: string;
  parents: string[];
  selfClosing: boolean;
  attributes: Record<string, unknown>;
};

export type Text = {
  text: string;
  blocks: Block[];
  marks: Mark[];
};

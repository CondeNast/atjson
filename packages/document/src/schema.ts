type Display = 'paragraph' | 'object' | 'inline' | 'block';

export default interface Schema {
  [key: string]: {
    display: Type;
  };
}

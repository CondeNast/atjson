declare module "@ckeditor/ckeditor5-engine/src/model/documentfragment" {
  import CK from "../../../ckeditor";
  declare class DocumentFragment implements CK.DocumentFragment {
    static fromJSON(json: object[]): CK.DocumentFragment;
  }

  export default DocumentFragment;
}

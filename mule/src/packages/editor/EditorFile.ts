//Wrap file/model together to allow editor to void monaco dependencies
export class EditorFile 
{
  path: string;
  monacoEditor: any;
  handleChange: any;
  model: any;
  lastSavedVersionId: any;
  content: any
  lang: any
  fileTypes = {
    java: "java",
    pl: "prolog",
    c: "c"
  };

  constructor(options) {
   // console.log("BUILDING ", options);
    this.path = options.path;
    this.monacoEditor = options.monacoEditor;
    this.handleChange = options.handleChange;
    this.model = null;
    this.content=options.content
    this.lang=options.lang
    if(options.model!=null) this.setModel(options.model)
  }
  isDirty() {
   // console.log(this.model.getAlternativeVersionId(), this.lastSavedVersionId);
    //console.log(this.getContent());
    return (!this.model.isDisposed() &&
      (this.model.getAlternativeVersionId() != 1) &&
      (this.lastSavedVersionId !== this.model.getAlternativeVersionId()));
  }
  clearDirty() {
    //console.log("Clearing dirty ", this.model.isDisposed());
    if (!this.model.isDisposed())
      this.lastSavedVersionId = this.model.getAlternativeVersionId();
  }
  setDirty() {
    throw "Not implemented";
  }
  getFilename() {
    return ((this.path != null) ? (this.path.split("/").pop()) : null);
  }
  getExtension() {
    return ((this.path != null) ? (this.path.split(".").pop()) : null);
  }
  dispose() {
    this.model.dispose();
  }
  getContent() {
    return this.model.getValue();
  }
  setModel(m)
  {
      this.model=m
      if (this.handleChange) this.model.onDidChangeContent(this.handleChange);

      if(this.lang==null)
      {
        this.detectLang()
      }
    this.setLang()
    this.clearDirty()
  }
  getModel()
  {
      return this.model
  }
  setLang()
  {
    window["monaco"].editor.setModelLanguage(this.model, this.lang);
  }
  detectLang()
  {
    var e=this.getExtension()
    this.lang=this.fileTypes[e]
  }
}

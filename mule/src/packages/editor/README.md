###Files
<strong>Index.js</strong>
* The editor behaviour that's going to be used is taken from the args or if there's none present in the args then the default editor behaviour is used (see EditorBehaviourStandalone.ts file)
* An instance of the triggerBehaviour class is created, it's constructor is given an instance of OSJS core and the editor behaviour class
* The window is created in which the react editor application is rendered
  * The logger and peer service providers along with the triggerBehaviour class gets passed to this react application through props
  * on keydown event listener checks if the key that has been pressed is ( ctrl | cmd ) + S and if it is it disabled the default behaviour and runs our own save behaviour
  * When the application is closed and there are unsaved changes a dialog appears asking the user if they want to discard their changes

<strong>TriggerBehaviour.ts</strong>
* This class is used to trigger the various methods of the EditorBehaviour class (save, compile, run etc.) which is added in index.js
* The compile and run methods also launch the terminal application which displays the results

<strong>EditorBehaviourStandalone.ts</strong>
* This class holds the default behaviour for the editor
* There's very little functionality as this is what gets used when the editor is run on its own

<strong>server.js</strong>
Added by OSJS, not used

<strong>editorBroadcast.ts</strong>
* This class controls what happens when data is received from a connected peer that is sharing the editor
* There are a lot of methods which are not initialised in this file, they are made void e.g <code>onInsertText?: (index: number, value: string) => void;</code>
  * These methods require an instance of the editor to run so they are later created when an instance of editor is available (see editorUtils.ts)

<strong>editorUtils.ts</strong>
* This file was created because there was too much logic in the editor container and it became far too confusing to read, now the container can call functions from this file and it abstracts away a lot of the work that has to be done to set up the editor
* The <code>initEditorBroadcastListeners</code> function sets up all of the event listener functions for <code>editorBroadcast.ts</code> which require an instance of monaco editor e.g when text is inserted, when a comment is added etc.
  * These listeners are for data that is received
* The <code>initEditorListeners</code> function creates editor event listener functions
  * These listeners are for broadcasting data to a peer

<strong>operation.ts</strong>
This file holds the typescript interfaces and types for the various broadcast operations

<strong>containers/App.tsx</strong>
* This container renders the menu bar, editor and comments sidebar containers
* The most important function here is the <code>broadcast</code> which gets passed an operation (text inserted, cursor moved etc.) and broadcasts it to all of the connected peers
  * This function gets passed to the editor and comments sidebar as a prop

<strong>containers/EditorContainer.tsx</strong>
* This container renders the monaco editor
* The editorDidMount function has access to the monaco editor instance and so it is in here that the <code>initEditorBroadcastListeners</code> function from editorUtils.ts gets called

<strong>containers/MainMenuBar.tsx</strong>
* This container renders the menu which the user can use to save, compile, run etc.
* The most important function here is the dispatch function, this function gets called after the user clicks a menu option, it checks which option was clicked and then call the corresponding method in the <code>TriggerBehaviour</code> class

TODO
* At the moment there are two forms at the top of the editor for connecting to a peer and then controlling the playback of an editing session. These should probably be changed as menu options and maybe the forms could be modals

<strong>containers/CommentsContainer</strong>
* This container renders any comments that are contained in the editor contents as a <code>Comment</code> component
* This container also renders the form that is used to add a new comment using the <code>CommentForm</code> component

TODO
* There's something not working properly with the styling of the comments
  * When you add a new comment it is placed too far down the page and it doesn't line up correctly with the code that it is referencing  
  * When you click the button to make a new comment it opens a form and I think this form might be messing with the styling, maybe this could be fixed by making that form a modal
* A comment should be deleted when the text in the selection area that it references is deleted

<strong>components folder</strong>
* This folder contains all of the pure presentational components that are used in the application, they have minimal logic and just render jsx for the most part

<strong>store folder</strong>
* This folder contains all of the redux files for the application, it's divided into three subfolders, one for comments, one for the editor and one for the menu
* Each subfolder has a reducer, actions and the typescript types for that store

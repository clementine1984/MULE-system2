export abstract class EditorBehaviour
{
    abstract closeWindow(win): void;
    //abstract keyDown(ev, win): void;
    abstract shouldDestroy(): boolean;
    abstract async trigger(action:string);
}


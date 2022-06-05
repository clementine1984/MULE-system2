//https://air.ghost.io/debugging-websockets-using-js-proxy-object/
// proxy the window.WebSocket object

var WebSocketProxy = new Proxy(WebSocket, {
    construct: function(target, args) {
      // create WebSocket instance
      // @ts-ignore
      const instance = new target(...args);
  
      // WebSocket "onopen" handler
      /*const openHandler = event => {
        console.log("Open", event);
      };*/
  
      // WebSocket "onmessage" handler
      //const messageHandler = event => {
      //  console.log("Message", event);
     
      //};
  
      // WebSocket "onclose" handler
      /*const closeHandler = event => {
        console.log("Close", event);
        // remove event listeners
        instance.removeEventListener("open", openHandler);
        //instance.removeEventListener("message", messageHandler);
        instance.removeEventListener("close", closeHandler);
      };*/
  
      //A hook to allow an incoming message be filtered
      const receiveFilter=(msg)=>
      {
        return  msg
      }
  
  
      //A hook to allow an outgoing message be filtered
      const sendFilter=(msg)=>
      {
        return msg
      }
  
  
  
  
      //add the hook
      const addEventListenerProxy = new Proxy(instance.addEventListener, {
        apply: function(target, thisArg, args) {
          if(args[0]==="message")
          {
            var fun=((f)=>
            {
              return (evt)=>{
               
                var evt2=JSON.parse(JSON.stringify(evt)) 
  
                evt2.data=instance.receiveFilter(evt.data)
  
  
                f(evt2)
              }
            })(args[1])
            args[1]=fun
            //console.log(args[1])
          }
          target.apply(thisArg, args);
        }
      });
      instance.addEventListener = addEventListenerProxy;
    
  
  
      // add event listeners
      //instance.addEventListener("open", openHandler);
     //instance.addEventListener("message", messageHandler);
      //instance.addEventListener("close", closeHandler);
  
      // proxy the WebSocket.send() function
      const sendProxy = new Proxy(instance.send, {
        apply: function(target, thisArg, args) {
          args[0]=instance.sendFilter(args[0])
          target.apply(thisArg, args);
        }
      });
  
      // replace the native send function with the proxy
      instance.send = sendProxy;
  

      instance.sendFilter=sendFilter
      instance.receiveFilter=receiveFilter

      // return the WebSocket instance
      return instance;
    }
  });
  
export default WebSocketProxy
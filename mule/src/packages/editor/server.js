// Methods OS.js server requires
module.exports = (core, proc) => ({

  // When server initializes
  init: async () => {

    /** Code submission http route */
    core.app.post(proc.resource('/cee/submit'), async (req, res) => {

      const cee = core.make('mule/cee');
      const availableResponse = await cee.available();
      if (availableResponse.status !== 'ready') {
        return res.json({
          success: false,
          message: "The service is busy! Try again later..."
        });
      }

      const submitResponse = await cee.submit(req.body, {
        maxTime: availableResponse.maxTime,
        maxFileSize: availableResponse.maxFileSize,
        maxMemory: availableResponse.maxMemory
      });
      res.json({
        success: true,
        executionTicket: submitResponse.executionTicket
      });
    });

    /** Code execution websocket */
    core.app.ws(proc.resource('/cee/execute/:executionTicket'), async (ws, req) => {

      const cee = core.make('mule/cee');
      cee.execute(req.params.executionTicket, ws);
    });

  },

  // When server starts
  start: () => {console.log('hello');},

  // When server goes down
  destroy: () => {console.log('good bye');},

  // When using an internally bound websocket, messages comes here
  onmessage: (ws, respond, args) => {
    respond('Pong');
  }
});

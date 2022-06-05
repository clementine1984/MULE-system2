const pick = (O, ...K) => K.reduce((o, k) => (o[k]=O[k], o), {})

var urlForConsent=(uid)=>{
  return "/user/"+uid+"/consent"
}



// Methods OS.js server requires
module.exports = (core, proc) => ({
  // When server initializes
  init: async () => {
    var api = await core.make("server/database/api");
    // =================================================================================================
    core.app.post(proc.resource("/consent"), async (req, res) => {
      console.log(req.body.consents)
      try 
      {
        var data={
          uid: req.session.user.id,
          consents: req.body.consents,
          /*{ 
            code: true,
            performance: false,
            interaction: false,
            feedback: true
          },*/
          sessionID: req.sessionID
        }

        var result = await api.post(urlForConsent(req.session.user.id),data);
        res.json(result); 
      } 
      catch (err) 
      {
        res.status(500).json({ msg: err }); 
      }
    });


    core.app.get(proc.resource("/consent"), async (req, res) => {
      
      try {
        console.log(urlForConsent(req.session.user.id));
        var result = await api.get(urlForConsent(req.session.user.id));
        console.log(result);
        if((result==null)||(result.consents==null)) return res.json({})
        res.json(result.consents); 
      } 
      catch (err) 
      {
        console.log(err);
        res.status(500).json({ msg: err }); 
      }
    })
  },

  // When server starts
  start: () => {},

  // When server goes down
  destroy: () => {}
});

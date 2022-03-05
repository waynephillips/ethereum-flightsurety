exports.id=0,exports.modules={"./src/server/server.js":function(e,t,r){"use strict";r.r(t);var s=r("./build/contracts/FlightSuretyApp.json"),o=r("./src/server/config.json"),n=r("web3"),a=r.n(n),c=r("express"),l=r.n(c),u=o.localhost,i=new a.a(new a.a.providers.WebsocketProvider(u.url.replace("http","ws")));i.eth.defaultAccount=i.eth.accounts[0];var h=new i.eth.Contract(s.abi,u.appAddress),f=[];h.events.OracleRequest({fromBlock:0},(function(e,t){e||function(e,t,r){for(var s=0;s<f.length;s++)for(var o=10*Math.floor(9*Math.random()),n=h.methods.getMyIndexes().call({from:f[s]}),a=0;a<n.length;a++)try{h.methods.submitOracleResponse(n[a],e,t,r,o).send({from:f[s],gas:5e6,gasPrice:2e10})}catch(e){console.log("submitOracleResponse Error => "+e)}}(contractEvent.returnValues[1],contractEvent.returnValues[2],contractEvent.returnValues[3]),console.log(t)})),function(){var e=i.eth.getAccounts(),t=20;e.length<t&&(t=e.length);for(var r=0;r<t;r++)f.push(e[r]),h.methods.registerOracle().send({from:e[r],value:i.utils.toWei("1","ether"),gas:5e6},(function(e,t){}))}();var d=l()();d.get("/api",(function(e,t){t.send({message:"An API for use with your Dapp!"})})),t.default=d}};
exports.id=0,exports.modules={"./src/server/server.js":function(e,r,t){"use strict";t.r(r);var s=t("./build/contracts/FlightSuretyApp.json"),o=t("./src/server/config.json"),n=t("web3"),a=t.n(n),c=t("express"),l=t.n(c),u=o.localhost,i=new a.a(new a.a.providers.WebsocketProvider(u.url.replace("http","ws")));i.eth.defaultAccount=i.eth.accounts[0];var h=new i.eth.Contract(s.abi,u.appAddress),f=[];h.events.OracleRequest({fromBlock:0},(function(e,r){e||function(e,r,t){for(var s=0;s<f.length;s++)for(var o=10*Math.floor(9*Math.random()),n=h.methods.getMyIndexes().call({from:f[s]}),a=0;a<n.length;a++)try{h.methods.submitOracleResponse(n[a],e,r,t,o).send({from:f[s],gas:5e6,gasPrice:2e10})}catch(e){console.log("submitOracleResponse Error => "+e)}}(r.returnValues[1],r.returnValues[2],r.returnValues[3]),console.log(r)})),function(){var e=i.eth.getAccounts(),r=20;e.length<r&&(r=e.length);for(var t=0;t<r;t++)f.push(e[t]),h.methods.registerOracle().send({from:e[t],value:i.utils.toWei("1","ether"),gas:6721975},(function(e,r){}))}();var d=l()();d.get("/api",(function(e,r){r.send({message:"An API for use with your Dapp!"})})),r.default=d}};
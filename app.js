const Game = require('./lib/Game');

Game.addNewProbe();


Game.start();

setTimeout(
    ()=>{
        Game.stop().then(
            ()=>{
                console.log(Game.report());
            }
        );
    },
    30000
);
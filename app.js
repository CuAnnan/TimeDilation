const Game = require('./lib/Game');

Game.compression = 128;

let probe = Game.addNewProbe();
probe.setDestination(Game.destinations[0]);
probe.embark();

Game.start();

let reportInterval = setInterval(
    ()=>{
        probe.report();
    },
    1000
);

probe.on(probe.shipArrivedEvent, ()=>{
    Game.stop().then(()=>{
        console.log('Ship arrived in '+Game.time+' seconds');
        clearInterval(reportInterval)
    });
});


/*

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

 */
const   ShipFactory = require('./ShipFactory'),
        Big = require('big-js'),
        Destination = require('./Destination'),
        destinationData = require('../data/Destinations');

let initialised = false;

class Game
{
    static addNewProbe()
    {
        let probe = ShipFactory.getNewProbe();
        this.addShip(probe);
        return probe;
    }

    static addShip(ship)
    {
        ship.on(ship.shipArrivedEvent, function(){
            console.log(this);
        });
        if(this.canAffordShip(ship))
        {
            this.ships.push(ship);
            this.funding = this.funding.minus(ship.cost);
        }
        return this;
    }

    static canAffordShip(ship)
    {
        return this.funding.gte(ship.cost);
    }

    static simulate(seconds)
    {
        for(let ship of this.ships)
        {
            ship.simulate(seconds);
        }
    }


    static tick()
    {
        for(let i = 0; i < this.compression; i++)
        {
            this.simulate(this.tickLength);
            this.time += this.tickLength;
            this.ticks++;
        }

        if (this.ticking)
        {
            this.tickPromise = new Promise((resolve, reject) => {
                setTimeout(() => {
                    this.tick();
                    resolve(this);
                }, this.tickLength * 1000)
            });
        }
    }

    static async start()
    {
        this.ticking = true;
        this.tick();
        return this.tickPromise;
    }

    static async stop()
    {
        this.ticking = false;
        return this.tickPromise;
    }

    static report()
    {
        let report = `Ticks: ${this.ticks}\nSeconds:${Math.round(this.time)}\n`;
        for(let ship of this.ships)
        {
            report += `${ship.name} reached ${ship.velocity}m/s`;
        }
        return report;
    }

    static async toggle()
    {
        this.ticking = !this.ticking;
        if(this.ticking)
        {
            return this.start();
        }
        else
        {
            return this.stop();
        }
    }

    static get tickLength()
    {
        return 1/this.ticksPerSecond;
    }

    static initialise()
    {
        if(initialised)
        {
            console.log('Game already intitialised');
            return;
        }

        this.ships = [];
        this.ships = [];
        this.ticking = false;
        this.ticksPerSecond = 100;
        this.compression = 1;
        this.time = 0;
        this.ticks = 0;
        this.funding = new Big(10000);
        this.destinations = [];
        for(let destination of destinationData)
        {
            this.destinations.push(new Destination(destination));
        }

        console.log('Game intitialised');
        initialised = true;
    }
}


Game.initialise();

module.exports = Game;
const   ShipFactory = require('./ShipFactory'),
        Big = require('big-js');

class Game
{
    static addNewProbe()
    {
        this.addShip(ShipFactory.getNewProbe());
    }

    static addShip(ship)
    {
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
            if(ship.destination)
            {
                ship.simulate(seconds);
            }
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


}
Game.ships = [];
Game.ticking = false;
Game.ticksPerSecond = 100;
Game.compression = 1;
Game.time = 0;
Game.ticks = 0;
Game.funding = new Big(10000);

module.exports = Game;
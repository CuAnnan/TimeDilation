const ShipFactory = require('./ShipFactory');

class Game
{
    static addNewProbe()
    {
        this.ships.push(ShipFactory.getNewProbe());
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
        this.simulate(this.tickLength);
        this.time += this.tickLength;

        this.ticks++;
        if(this.ticking)
        {
            this.tickPromise = new Promise(
                (resolve, reject)=>{
                    setTimeout(
                        ()=>{
                            this.tick();
                            resolve(this);
                        },
                        this.tickLength * 1000
                    )
                }
            );
        }
    }

    static start()
    {
        this.ticking = true;
        this.tick();
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

};
Game.ships = [];
Game.ticking = false;
Game.ticksPerSecond = 100;
Game.tickLength = 1/Game.ticksPerSecond;
Game.time = 0;
Game.ticks = 0;

module.exports = Game;
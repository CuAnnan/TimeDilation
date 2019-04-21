const   Big = require('big-js'),
        FuelTank = require('./FuelTank'),
        Chassi = require('./Chassi'),
        Engine = require('./Engine'),
        UniversalConstants = require('./UniversalConstants');


class Ship
{
    constructor(data)
    {
        /**
         * The name of the ship
         */
        this.name           = data.name;
        /**
         * The velocity of the ship
         */
        this.velocity       = new Big(data.velocity?data.velocity:0);

        /**
         * The distance the ship has travelled
         */
        this.distance       = new Big(data.distance?data.distance:0);
        /**
         * The relative time that has lapsed on the ship
         */
        this.relativeTime   = new Big(data.relativeTime?data.relativeTime:0);
        /**
         * The gamma of the ship;
         */
        this.gamma          = new Big(data.gamma?data.gamma:1);

        this.chassi = null;
        this.fuelTank = null;
        this.engine = null;
        /**
         * The ships lorentz shift
         */
    }

    /**
     * A method to load a ship from JSON
     * @param json
     * @returns {Ship}
     */
    static fromJSON(json)
    {
        let ship = new Ship(json);
        ship.chassi = Chassi.fromJSON(json.chassi);
        ship.fuelTank = FuelTank.fromJSON(json.fuelTank);
        ship.engine = Engine.fromJSON(json.engine);
        return ship;
    }

    get mass()
    {
        return this.chassi.mass.plus(this.fuelTank.mass).plus(this.engine.mass);
    }

    simulate(seconds)
    {
        if(!this.fuelTank.empty)
        {
            let vSquared    = this.velocity.pow(2),
                r           = vSquared.div(UniversalConstants.C_SQUARED),
                gamma       = new Big(1).div(
                    new Big(1).minus(r).sqrt()
                );

            // let's try to use as much fuel as we can per second
            // the fuel tank may not have as much, so we'll ask it for the engine's fuel per seconds
            // but only burn as much as we have
            let fullBurnFuel = this.engine.fuelPerSecond.times(seconds);
            let fuelUsed = this.fuelTank.useFuel(fullBurnFuel);
            let thrust = this.engine.thrust.times(seconds);

            // if we have now spent all of the fuel, we may have stalled mid burn so figure out what percentage of the simulation length we produced thrust for
            if(this.fuelTank.empty && !fuelUsed.eq(fullBurnFuel))
            {
                let ratio = fuelUsed.div(fullBurnFuel);
                // reduce the thrust amount accordingly
                thrust = thrust.times(ratio);
            }

            let acceleration = thrust.div(gamma.pow(3).times(this.mass));
            this.velocity = this.velocity.plus(acceleration.times(seconds));
            this.gamma = gamma;
        }
        let gammaSeconds = this.gamma.div(seconds);
        this.distance = this.distance.plus(gammaSeconds.times(this.velocity));
        this.relativeTime = this.relativeTime.plus(gammaSeconds);

    }


    toJSON()
    {
        return {
            name:this.name,
            velocity:this.velocity.toString(),
            distance:this.distance.toString(),
            relativeTime:this.relativeTime.toString(),
            mass:this.mass.toString(),
            gamme:this.gamma.toString(),
            chassi:this.chassi.toJSON(),
            fuelTank:this.fuelTank.toJSON(),
            engine:this.engine.toJSON(),
        };
    }


    tick(seconds)
    {

    }
}

module.exports = Ship;
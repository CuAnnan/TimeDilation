const   Big = require('big-js'),
        Chassi = require('./Chassi'),
        EngineGroup = require('./EngineGroup'),
        UniversalConstants = require('./UniversalConstants'),
        Listenable = require('./Listenable');

class Ship extends Listenable
{
    constructor(data)
    {
        super();
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
        this.acceleration= 0;

        this.chassi = null;
        this.engineGroups = [];
        this.hasFuel = false;

        /**
         * The ships lorentz shift
         */
    }

    addEngineGroup(engineGroup)
    {
        if(this.engineGroups.length === this.chassi.engineGroupSlots)
        {
            console.log('Attempted to add extra engine slot beyond cap');
            return;
        }
        if(engineGroup.fuelRemaining)
        {
            this.hasFuel = true;
            this.engineGroups.push(engineGroup);
            engineGroup.on('fuelBurnedOut', (engineGroup)=>{this.ditchEngineGroup(engineGroup)});
            if(!this.currentEngineGroup)
            {
                this.currentEngineGroup = engineGroup;
            }
        }
    }

    ditchEngineGroup()
    {
        this.engineGroups.shift();
        if(this.engineGroups.length === 0)
        {
            this.trigger('allFuelConsumed');
        }
    }


    get mass()
    {
        let mass = this.chassi.mass;
        for(let group of this.engineGroups)
        {
            mass = mass.plus(group.mass);
        }
        return mass;
    }

    simulate(seconds)
    {
        this.acceleration = 0;

        if(this.engineGroups.length > 0)
        {
            let vSquared    = this.velocity.pow(2),
                r           = vSquared.div(UniversalConstants.C_SQUARED),
                gamma       = new Big(1).div(
                    new Big(1).minus(r).sqrt()
                );
            this.gamma = gamma;
            // let's try to use as much fuel as we can per second
            // the fuel tank may not have as much, so we'll ask it for the engine's fuel per seconds
            // but only burn as much as we have

            let burnDetails = this.engineGroups[0].burn(seconds);

            /*
            let fullBurnFuel = this.engines.fuelPerSecond.times(seconds);
            let fuelUsed = this.fuelTanks.useFuel(fullBurnFuel);
            let thrust = this.engines.burn(fuelUsed, seconds);
            */
            if(burnDetails.thrust.gt(0))
            {
                let acceleration = burnDetails.thrust.div(gamma.pow(3).times(this.mass));
                let deltaV = acceleration.times(seconds);
                this.velocity = this.velocity.plus(deltaV);

                this.acceleration = acceleration;
            }
        }
        let gammaSeconds = this.gamma.times(seconds);
        this.distance = this.distance.plus(gammaSeconds.times(this.velocity));
        this.relativeTime = this.relativeTime.plus(gammaSeconds);

    }

    get thrust()
    {
        return this.currentEngineGroup.thrust;
    }

    get fuelRemaining()
    {
        let remainingFuel = 0;
        for(let group of this.engineGroups)
        {
            remainingFuel = group.fuelRemaining.plus(remainingFuel);
        }
        return remainingFuel;
    }


    toJSON()
    {
        let json = {
            name:this.name,
            velocity:this.velocity.toString(),
            distance:this.distance.toString(),
            relativeTime:this.relativeTime.toString(),
            mass:this.mass.toString(),
            gamme:this.gamma.toString(),
            chassi:this.chassi.toJSON(),
            engineGroups:[],
        };
        for(let engineGroup of this.engineGroups)
        {
            json.engineGroups.push(engineGroup.toJSON());
        }
        return json;
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
        for(let engineGroupJSON of json.engineGroups)
        {
            ship.addEngineGroup(EngineGroup.fromJSON(engineGroupJSON));
        }
        return ship;
    }
}

module.exports = Ship;
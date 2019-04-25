const   Big = require('big-js'),
        Chassi = require('./Chassi'),
        EngineGroup = require('./EngineGroup'),
        Destination = require('./Destination'),
        UniversalConstants = require('./UniversalConstants'),
        Listenable = require('./Listenable');

class Ship extends Listenable
{
    constructor(data)
    {
        super();
        data = data?data:{};
        /**
         * The name of the ship
         */
        this.name           = data.name?data.name:data.name;
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
        this.onMission      = data.onMission?data.onMission:false;
        this.acceleration= new Big(data.acceleration?data.acceleration:0);

        this.embarked = data.embarked?data.embarked:false;

        this.destination = false;

        /*
         * Build information
         */
        this.chassi = null;
        this.engineGroups = [];
        this.hasFuel = false;

        /**
         * The ships lorentz shift
         */
    }

    setChassi(chassi)
    {
        this.chassi = chassi;
        this.engineGroups = [];
        if(chassi)
        {
            for (let i = 0; i < chassi.engineGroups; i++)
            {
                this.engineGroups[i] = null;
            }
        }
        return this;
    }

    setEngineGroup(engineGroupIndex, engine)
    {
        if(!this.engineGroups[engineGroupIndex])
        {

            let engineGroup = new EngineGroup({name:"Group "+(engineGroupIndex+1)});
            engineGroup.setCount(this.chassi.engineGroupSlots[engineGroupIndex]);
            this.engineGroups[engineGroupIndex] = engineGroup;
        }

        this.engineGroups[engineGroupIndex].setEngine(engine);
    }

    addEngineGroup(engineGroup)
    {
        if(this.engineGroups.length === this.chassi.engineGroupSlots)
        {
            console.log('Attempted to add extra engine slot beyond cap');
            return this;
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
        return this;
    }

    ditchEngineGroup()
    {
        this.engineGroups.shift();
        if(this.engineGroups.length === 0)
        {
            this.trigger('allFuelConsumed');
        }
        return this;
    }

    setName(name)
    {
        this.name = name;
    }

    get isValid()
    {
        let isValid = this.name && (this.chassi !== null && this.engineGroups.length === this.chassi.engineGroupSlots.length);
        if(!isValid)
        {
            return false;
        }
        for(let group of this.engineGroups)
        {
            isValid = isValid&&group;
        }
        return isValid;
    }

    get cost()
    {
        let cost = 0;
        if(this.chassi)
        {
            cost = this.chassi.cost.plus(cost);
        }
        for(let group of this.engineGroups)
        {
            cost = cost.plus(group.cost);
        }
        return cost;
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

    static shipArrivedEvent()
    {
        return 'shipArrived';
    }

    simulate(seconds)
    {
        if(this.destination === null || this.embarked === false)
        {
            return;
        }

        if(this.distance.gte(this.destination.distance))
        {
            this.triggerOnce(this.shipArrivedEvent);
            this.velocity = new Big(0);
            return;
        }


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
        let gammaSeconds = this.gamma.times(seconds),
            deltaS = gammaSeconds.times(this.velocity);
        this.distance = this.distance.plus(deltaS);
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

    setDestination(destination)
    {
        this.destination = destination;
    }

    embark()
    {
        this.embarked = true;
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
            onMission:this.onMission,
            engineGroups:[],
            destination:this.destination.toJSON()
        };
        for(let engineGroup of this.engineGroups)
        {
            if(engineGroup)
            {
                json.engineGroups.push(engineGroup.toJSON());
            }
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

        for(let i in json.engineGroups)
        {
            let engineGroupJSON = json.engineGroups[i];
            engineGroupJSON.count = engineGroupJSON.count?engineGroupJSON.count:ship.chassi.engineGroupSlots[i];
            ship.addEngineGroup(EngineGroup.fromJSON(engineGroupJSON));
        }

        if(json.destination)
        {
            ship.setDestination(Destination.fromJSON(json.destination));
        }

        return ship;
    }

    report()
    {

        console.log(`Reached a deltaV of ${this.velocity.toPrecision(4)}m/s Travelled total of ${this.distance.toPrecision(4)}m of ${this.destination.distance.toPrecision(4)}m`);
    }
}

module.exports = Ship;
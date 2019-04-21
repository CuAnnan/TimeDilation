const   Big         = require('big-js'),
        ShipPart    = require('./ShipPart');

class FuelTank extends ShipPart
{
    constructor(data)
    {
        super(data);
        if(!this.name)
        {
            this.name = 'Fuel Tank';
        }

        /**
         * The volume of the fuel tank in kg
         */
        this.volume = new Big(data.volume?data.volume:1000);
        /**
         * The specific density of the fuel
         * This is used to calculate the mass of the fuel
         */
        this.density = new Big(data.density?data.density:1);

        /**
         * fuelRemaining is the amount of kg of fuel remaining
         */
        if(data.fuelRemaining)
        {
            this.fuelRemaining = new Big(data.fuelRemaining);
        }
        else
        {
            this.fuelRemaining = this.volume.times(this.density);
        }
        this.empty = this.fuelRemaining.lte(0);
    }

    useFuel(fuelAmount)
    {
        if(this.empty)
        {
            return 0;
        }

        let amountToSpend = fuelAmount;
        if(this.fuelRemaining.lt(fuelAmount))
        {
            amountToSpend = this.fuelRemaining;
        }
        this.fuelRemaining = this.fuelRemaining.minus(amountToSpend);
        this.empty = this.fuelRemaining.lte(0);
        return amountToSpend;
    }

    get mass()
    {
        return this.partMass.add(this.fuelRemaining);
    }

    toJSON()
    {
        let json = super.toJSON();
        json.density = this.density.toString();
        json.fuelRemaining = this.fuelRemaining.toString();
        json.totalMass = this.mass.toString();
        return json;
    }
}

module.exports = FuelTank;
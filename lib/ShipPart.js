const   Big = require('big-js')


class ShipPart
{
    constructor(data)
    {
        /**
         * The name of the ship part
         */
        this.name = data.name;
        /**
         * The base weight of the part in kg
         * @type {Big}
         */
        this.partMass = new Big(data.partMass?data.partMass:1000);
    }

    /**
     * return the total mass of the part
     */
    get mass()
    {
        return this.partMass;
    }

    toJSON()
    {
        return {
            name:this.name,
            partMass:this.partMass.toString()
        };
    }

    static fromJSON(json)
    {
        return new this(json);
    }

}

module.exports = ShipPart;
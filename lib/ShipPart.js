const   Big = require('big-js'),
        Listenable = require('./Listenable');


class ShipPart extends Listenable
{
    constructor(data)
    {

        super();
        /**
         * The name of the ship part
         */
        this.name = data.name;
        /**
         * The base weight of the part in kg
         * @type {Big}
         */
        this.baseMass = new Big(data.baseMass?data.baseMass:1000);
        this.cost = new Big(data.cost?data.cost:100);
    }

    /**
     * return the total mass of the part
     */
    get mass()
    {
        return this.baseMass;
    }

    toJSON()
    {
        return {
            name:this.name,
            baseMass:this.baseMass.toString(),
            cost:this.cost
        };
    }

    static fromJSON(json)
    {
        return new this(json);
    }

    get json()
    {
        return this.toJSON();
    }
}

module.exports = ShipPart;
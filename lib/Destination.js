const Big = require('big-js');

class Destination
{
    constructor(data)
    {
        this.name = data.name;
        this.distance = new Big(data.distance);
        this.reward = new Big(data.reward?data.reward:5000);
        this.oneWay = data.oneWay?data.oneWay:false;
        this.researchCost = new Big(data.researchCost?data.researchCost:0);
        this.locked = data.locked?data.locked:false;
    }

    toJSON()
    {
        return {
            name:this.name,
            distance:this.distance.toString(),
            reward:this.reward,
            oneWay:this.oneWay
        }
    }


    fromJSON(json)
    {
        let destination = new Destination(json);
        return destination;
    }
}

module.exports = Destination;
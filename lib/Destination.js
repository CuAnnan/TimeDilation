const Big = require('big-js');

class Destination
{
    constructor(data)
    {
        this.name = data.name;
        this.distance = new Big(data.distance);
    }

    toJSON()
    {
        return {
            name:this.name,
            distance:this.distance.toString()
        }
    }


    fromJSON(json)
    {
        let destination = new Destination(json);
        return destination;
    }
}
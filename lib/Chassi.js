const   ShipPart    = require('./ShipPart');

class Chassi extends ShipPart
{
    constructor(data)
    {
        super(data);
        if(!this.name)
        {
            this.name='Chassi';
        }
        this.engineGroupSlots = data.engineGroupSlots?data.engineGroupSlots:1;
    }
}

module.exports = Chassi;
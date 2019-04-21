const   Big         = require('big-js'),
        ShipPart    = require('./ShipPart');

class Chassi extends ShipPart
{
    constructor(data)
    {
        super(data);
        if(!this.name)
        {
            this.name='Chassi';
        }
    }
}

module.exports = Chassi;
const   C = new Big(299792458),
        LIGHT_YEAR = new Big(9.46e15),
        C_SQUARED = C.pow(2),
        TICK_LENGTH = 10,
        TICK_LENGTH_IN_SECONDS = TICK_LENGTH / 1000;


class Ship
{
    constructor(data)
    {
        this.name           = data.name;
        this.mass           = new Big(data.mass?data.mass:0.01);
        this.thrust         = new Big(data.thrust?data.thrust:500000);
        this.velocity       = new Big(data.velocity?data.velocity:0);
        this.distance       = new Big(data.distance?data.distance:0);
        this.fuelFlow       = new Big(data.fuelFlow?data.fuelFlow:0);
        this.relativeTime   = new Big(data.relativeTime?data.relativeTime:0);
        this.gamma = 1;
    }


    tick()
    {
        let vSquared = this.velocity.pow(2),
            r = vSquared.div(C_SQUARED),
                gamma =  new Big(1).div(
                    new Big(1).minus(r).sqrt()
                );

            //gamma = 1 / Math.sqrt(1 -  r);
        if(this.fuelFlow < this.mass)
        {
            let deltaM = this.fuelFlow.times(TICK_LENGTH_IN_SECONDS);
            this.mass = this.mass.minus(deltaM);
            let acceleration = this.thrust.div(gamma.pow(3)).times(this.mass);
            this.velocity = this.velocity.plus(acceleration.times(TICK_LENGTH_IN_SECONDS));
        }
        let gammaTick = gamma.times(TICK_LENGTH_IN_SECONDS);
        this.distance = this.distance.plus(gammaTick.times(this.velocity));
        this.relativeTime = this.relativeTime.plus(gammaTick);
        this.gamma = gamma;
    }
}

let Game = {
    ticking:false,
    ships:[],
    ticks:0,
    everyFunctions:[],
    renderFunctions:[],
    timeout:null,
    refreshRate:10,
    tick:function()
    {
        this.ticks++;
        for(let ship of this.ships)
        {
            ship.tick();
        }
        this.processFunctions();
        if(this.ticking)
        {
            setTimeout(()=>{this.tick();}, TICK_LENGTH);
        }
    },
    start:function(){
        this.ticking = true;
        this.tick();
        return this;
    },
    stop:function()
    {
        this.ticking = false;
        return this;
    },
    toggle:function()
    {
        if(this.ticking)
        {
            this.stop();
        }
        else
        {
            this.start();
        }
    },
    everyTick:function(f)
    {
        this.everyFunctions.push(f);
        return this;
    },
    render:function(f) {
        this.addRenderCallBack(f);
    },
    addRenderCallBack:function(f){
        if(f)
        {
            this.renderFunctions.push(f);
        }
        this.callRenderFunctions();
    },
    callRenderFunctions()
    {
        for(let f of this.renderFunctions)
        {
            f.call(this);
        }
    },
    processFunctions:function()
    {
        for(let f of this.everyFunctions)
        {
            f.call(this);
        }
        if(this.ticks%this.refreshRate === 0)
        {
            this.callRenderFunctions();
        }
    },
    addShip:function(ship)
    {
        this.ships.push(ship);
        return this;
    }
};
const   C = 299792458,
        LIGHT_YEAR = 9.46e15,
    // it is computationally cheaper to do this calculation once and once only
        C_SQUARED = C*C,
        TICK_LENGTH = 10;


class Ship
{
    constructor(name, mass, thrust)
    {
        this.name = name;
        this.mass = mass;
        this.thrust = thrust;
        this.velocity = 0;
        this.distance = 0;
        this.fuelFlow = 0;
        this.relativeTime = 0;
    }

    tick()
    {
        let gamma = 1 / Math.sqrt(1 - Math.pow(this.velocity, 2) / C_SQUARED);
        if(this.fuelFlow < this.mass)
        {
            this.mass -= this.fuelFlow * TICK_LENGTH;
            let acceleration = this.thrust / (Math.pow(gamma, 3) * this.mass);
            this.velocity += acceleration * TICK_LENGTH;
        }
        this.distance += gamma * this.velocity * TICK_LENGTH;
        this.relativeTime += gamma * TICK_LENGTH;
        console.log(gamma);
    }
}

function handleTick()
{
    console.log("Handling tick "+tick);
    tick++;
    if(processTicks && tick < totalTicks)
    {
        setTimeout(handletick, TICK_LENGTH);
    }
}

let ship1 = new Ship("Enterprise", 0.01, 500000);
let tick = 0, totalTicks = 10000, processTicks;
setTimeout(handletick, TICK_LENGTH);
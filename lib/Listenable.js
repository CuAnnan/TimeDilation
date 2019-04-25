class Listenable
{
    constructor()
    {
        this.eventHandlers = {};
    }

    on(event, handler)
    {
        this.eventHandlers[event] = this.eventHandlers[event]?this.eventHandlers[event]:[];
        this.eventHandlers[event].push(handler);
    }

    trigger(event)
    {
        if(this.eventHandlers[event])
        {
            for (let handler of this.eventHandlers[event])
            {
                handler(this);
            }
        }
    }

    triggerOnce(event)
    {
        if(this.eventHandlers[event])
        {
            for (let handler of this.eventHandlers[event])
            {
                handler(this);
            }
        }
        delete this.eventHandlers[event];
    }
}

module.exports = Listenable;
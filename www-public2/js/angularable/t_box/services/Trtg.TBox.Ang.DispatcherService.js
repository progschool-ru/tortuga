Om.ns("Trtg.TBox.Ang.DispatcherService");

(function()
{
    function DispatcherService ()
    {
        var handlers = [];
        return {
            add_handler : function(handler)
            {
                if(handlers.indexOf(handler) == -1)
                {
                    handlers.push(handler);
                }
            },

            remove_handler : function(handler)
            {
                var index = handlers.indexOf(handler);
                if(index >= 0)
                {
                    handlers.splice(index, 1);
                }
            },

            dispatch : function()
            {
                var context = this;
                var args = arguments;
                handlers.forEach(function(handler)
                {
                    handler.apply(context, args);
                });
            }
        };
    };

    Trtg.TBox.Ang.DispatcherService = DispatcherService;
})();
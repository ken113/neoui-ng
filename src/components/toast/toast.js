
define( [ "ui/modal/modal" ], function() {

    "use strict";

    var modal;

    function show( message, position, delay, class4toast ) {

        if ( void 0 === class4toast && typeof delay === "string"  ) {
            class4toast = delay;
            delay = false;
        }

        modal && modal.close();

        modal = $.modal( {
            showTitle       : false,
            modal           : false,
            animation       : "scale",
            css             : { "min-width": "" },
            class4modal     : "ui toast " + [ position, class4toast || "" ].join( " " ),

            content         : function( ready, loading, close ) {

                var template = "<p class='message'>" + message + "</p>" +
                                "<i class='icon close transition rotate'></i>";

                this
                .html( template )
                .parent()
                .css( "height", "" )
                .delegate( "i.icon.close", "click", close );

                setTimeout( close, delay || 3000 );
            }
        } );

        modal.$node.last().remove();
    }

    $.toast = {

        top: function( message, delay, class4toast ) {

            return {

                left: function() {
                    show( message, "topleft", delay, class4toast );
                },

                right: function() {
                    show( message, "topright", delay, class4toast );
                }
            };
        },

        bottom: function( message, delay, class4toast ) {

            return {

                left: function() {
                    show( message, "bottomleft", delay, class4toast );
                },

                right: function() {
                    show( message, "bottomright", delay, class4toast );
                }
            };
        }
    };
} );

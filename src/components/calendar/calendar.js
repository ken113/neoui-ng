

define( [ "util/dateutil" ], function() {

    "use strict";

	var

	namespace = "$ui.calendar",

	Calendar = function( target, settings ) {

		var
        defaultDate,
		current,
		inAnimate = false,
		show = function( step ) {

            var
            container = calendar.find( ".md-calendar-dates-current" ),
            steps = [ step ];

            if ( inAnimate ) { return; }

            for ( var i = 0, length = steps.length; i < length; ++i ) {

                var step = steps[i];

                (function( container, step ) {

                    var
                    prev,
                    next,
                    animation,
                    html;

                    prev = container.prev();
                    next = container.next();
                    step = step || new Date();

                    switch ( step ) {

                        /** Previous month */
                        case -1:
                            if ( 1 === current[ 1 ] ) {
                                --current[ 0 ];
                                current[ 1 ] = 12;
                            } else
                                --current[ 1 ];
                            break;
                        /** Next month */
                        case 1:
                            if ( 12 === current[ 1 ] ) {
                                ++current[ 0 ];
                                current[ 1 ] = 1;
                            }
                            else ++current[ 1 ];
                            break;
                        /** Next year */
                        case 12:
                            ++current[ 0 ];
                            break;

                        /** Previous year */
                        case -12:
                            --current[ 0 ];
                            break;

                        default:
                            current = [ step.getFullYear(), step.getMonth() + 1, 1 ];
                    }

                    html = calc( new Date( current.join( "/" ) ), defaultDate, settings );

                    if ( step instanceof Date || steps[0] === void 0 ) {
                        return container.html( html ).css( "height", "auto" );
                    }

                    inAnimate = true;
                    animation = step > 0 ? next : prev;
                    animation.html( html );
                    container.animate( { "height": animation.height() }, 200 );
                    animation.animate( { "left": "1%" }, 200, function() {
                        container.html( html );
                        animation.css( "left", step > 0 ? "100%" : "-100%" );

                        /** Unlock animation */
                        i === steps.length && (inAnimate = 0);
                    } );
                })( container.eq( step > -1 ? i : length - 1 - i ), step );

                calendar.find( ".md-calendar-year" ).html( current[0] + "年" );
                calendar.find( ".md-calendar-month" ).html( current[1] + "月" );
            }
		},

		input = target.find( settings.selector4input ),
		trigger = target.find( settings.selector4trigger ),

        header = [],

		template = "<div tabindex=-1 class='md-calendar-container' >" +
					"<div class='md-calendar-control'>" +
					"<div class='md-icon-prev'></div>" +
					"<div class='md-calendar-year'></div>" +
					"<div class='md-calendar-month'></div>" +
					"<div class='md-icon-next'></div>" +
				"</div>" +

				"<div tabindex=-1 class='md-calendar-years'><ul></ul></div>" +
				"<div tabindex=-1 class='md-calendar-months'><ul></ul></div>" +

				"<div class='md-calendar-content'>" +
				    "<div class='md-calendar-days'>" +
                        "<div class='md-calendar-header'></div>" +
                        "<div class='md-calendar-dates-prev'></div>" +
                        "<div class='md-calendar-dates-current'></div>" +
                        "<div class='md-calendar-dates-next'></div>" +
				    "</div>" +
                "</div>",

		calendar;

		this.$node = target;
		this.settings = settings;


		input.attr( {
			"name": target.attr( "name" )
		} );

        for ( var i = 0, length = settings.daysOfTheWeek.length; i < length;
                header.push( "<div>" + settings.daysOfTheWeek[i++] + "</div>" ) );

		switch ( true ) {

            case "string" === typeof settings.defaultDate:
				defaultDate = new Date( settings.defaultDate );
				input.val( $.dateutil( defaultDate ).format( settings.format ) );
				break;

			default:
				if ( input.val() ) {
                    defaultDate = new Date( input.val() );

					if ( isNaN( +defaultDate ) ) {

						input.val( "" );
						defaultDate = new Date();
					}
				} else
                    defaultDate = new Date();
		}

        var
        yearsHtml = "",
        monthsHtml = "";

        for ( var i = 1990; i <= 2055; ++i ) {
            yearsHtml += "<li value='" + i + "'>" + i + "</li>";
        }
        for ( var i = 1; i <= 12; monthsHtml += "<li value='" + i + "'>" + i++ + "</li>" );

		trigger
        .on( "click", function( e ) {

            var
            rect,
            container,
            years,
            months;

            /** Prevent multiple instance */
			if ( inAnimate
			        || trigger.is( "[disabled]" )
			        || (calendar && calendar.hasClass( "show" )) ) { return; }

            rect = input[ 0 ].getBoundingClientRect();

			e.preventDefault();
			e.stopPropagation();

			calendar = $( template );

            years = calendar.find( ".md-calendar-years > ul" ).html( yearsHtml ).parent();
            months = calendar.find( ".md-calendar-months > ul" ).html( monthsHtml ).parent();
            calendar.find( ".md-calendar-header" ).html( header.join( "" ) );

			show( defaultDate );
			calendar.appendTo( target )

				.css( {
					"top": rect.height + 20,
					"z-index": 999
				} )

				.delegate( ".md-icon-prev", "click", function( e ) {
					show( -1 );
					e.preventDefault();
				} )

				.delegate( ".md-icon-next", "click", function( e ) {
					show( 1 );
					e.preventDefault();
				} )

				.delegate( ".md-calendar-day", "click", function() {

					var
					self = $( this ),
                    date,
                    value;

                    if ( !self.hasClass( "invalid" ) ) {

                        date = new Date( this.getAttribute( "data-date" ) + " " +
                                (calendar.find( "input[name=hour]" ).val()   || 0) + ":" +
                                (calendar.find( "input[name=minute]" ).val() || 0) + ":" +
                                (calendar.find( "input[name=second]" ).val() || 0) );
                        value = $.dateutil( date ).format( settings.format );

                        input.val( value ).focus();
                        settings.onSelected( value );
                        input.trigger( "change" );
                        defaultDate = date;

                        setTimeout( function() {
                            calendar.removeClass( "show" ).remove();
                        } );
                    }
				} )

				.delegate( ".md-calendar-year", "click", function() {

				    var
				    inner = years.addClass( "show" ).scrollTop(0).find( "li[value='" + current[0] + "']" ).addClass( "selected" );

				    $( this ).addClass( "expand" );

                    years
				    .css( "height", calendar.find( ".md-calendar-content" ).height() )
				    .scrollTop( inner.offset().top - years.offset().top )
				    .focus()
				    .find( "li" )
				    .not( inner )
				    .removeClass( "selected" );
				} )

				.delegate( ".md-calendar-years", "focusout", function() {
                    years.removeClass( "show" );
                    calendar.find( ".md-calendar-year" ).removeClass( "expand" );
				} )

				.delegate( ".md-calendar-month", "click", function() {

				    var
				    inner = months.addClass( "show" ).scrollTop(0).find( "li[value='" + current[1] + "']" ).addClass( "selected" );

				    $( this ).addClass( "expand" );

                    months
				    .css( "height", calendar.find( ".md-calendar-content" ).height() )
				    .scrollTop( inner.offset().top - months.offset().top )
				    .focus()
				    .find( "li" )
				    .not( inner )
				    .removeClass( "selected" );
				} )

				.delegate( ".md-calendar-months", "focusout", function() {
                    months.removeClass( "show" );
                    calendar.find( ".md-calendar-month" ).removeClass( "expand" );
				} )

				.delegate( "li[value]", "click", function() {

				    var value = +this.getAttribute( "value" );

                    $( this ).parents( ".md-calendar-years, .md-calendar-months" ).trigger( "focusout" );
                    current[ +(value <= 12) ] = value;
                    show( new Date( current.join( "/" ) ) );
                    calendar.focus();
				} )

                .on( "focusout", function( e ) {

                    if ( calendar.is( ":hover" ) ) {
                        return;
                    }

                    inAnimate = 1;

                    calendar.removeClass( "show" );
                    setTimeout( function() {
                        calendar.remove();
                        inAnimate = 0;
                    }, 300 );
                } );

                /** Force reflow */
                calendar.offset();
                calendar.addClass( "show" );
                setTimeout( function() {
                    /** After the transition hold the focus */
                    calendar.focus();
                }, 300 );
		} );
	};

    function calc( date, defaultDate, settings ) {

        var
        prev = new Date( date.getFullYear(), date.getMonth(), 0 ),
        next = new Date( date.getFullYear(), date.getMonth() + 1, 1 ),

        now = new Date(),

        range = {
            prev: [ prev.getDate() - prev.getDay(), prev.getDate() ],
            current: [ 1, new Date( date.getFullYear(), date.getMonth() + 1, 0 ).getDate() ],
            next: [ 1, 6 - next.getDay() + 1 ]
        },

        isValid = function( date, start ) {

            var
            minDate = settings.minDate && new Date( settings.minDate ),
            maxDate = settings.maxDate && new Date( settings.maxDate ),

            date = new Date( date.getFullYear(), date.getMonth(), start );

            if ( "function" === typeof settings.selectable
                    && !settings.selectable( date ) ) {
                return " invalid";
            }

            if ( settings.selectableDOW
                    && settings.selectableDOW.indexOf( date.getDay() ) === -1 ) {
                return " invalid";
            }

            if ( minDate || maxDate ) {

                if ( (date >= minDate && date <= maxDate)
                        || (!maxDate  && date >= minDate)
                        || (!minDate  && date <= maxDate) ) {

                    return " valid ";
                }

                return " invalid ";
            }

            return " ";
        },

        html = "";

        for ( var start = range.prev[ 0 ], end = range.prev[ 1 ]; end - start !== 6 && start <= end; ++start ) {

            html += "<div class='md-calendar-day " + isValid( prev, start ) + " adjacent prev' " +
                        "data-date='" + [ prev.getFullYear(), prev.getMonth() + 1, start ].join( "/" ) + "'>" +
                        start +
                    "</div>";
        }

        for ( var start = range.current[ 0 ], end = range.current[ 1 ]; start <= end; ++start ) {

            var clazz = isValid( date, start );

            start < now.getDate() && (clazz += " past ");

            date.getFullYear() === defaultDate.getFullYear()
                && date.getMonth() === defaultDate.getMonth()
                && start === defaultDate.getDate()
                && (clazz += " current ");

            date.getFullYear() === now.getFullYear()
                && date.getMonth() === now.getMonth()
                && start ===  now.getDate()
                && (clazz += " today ");

            html += "<div class='md-calendar-day " + clazz + "' data-date='" + [ date.getFullYear(), date.getMonth() + 1, start ].join( "/" ) + "'>" +
                start +
                "</div>";
        }

        for ( var start = range.next[ 0 ], end = range.next[ 1 ]; end - start !== 6 && start <= end; ++start ) {

            html += "<div class='md-calendar-day " + isValid( next, start ) + " adjacent next' " +
                        " data-date='" + [ next.getFullYear(), next.getMonth() + 1, start ].join( "/" ) + "'>" +
                        start +
                    "</div>";
        }

        return html;
    }

	Calendar.prototype = {

		val: function( value ) {

			var input = this.$node.find( ":input" );

			if ( value && !isNaN( +new Date( value ) ) ) {
				var date = new Date( value );
                input.val( $.dateutil( date ).format( this.settings.format ) );
			} else
				return input.val();
		},

		disabled: function() {

            var settings = this.settings;

			this
			.$node
			.find( settings.selector4input + " , " + settings.selector4trigger )
			.attr( "disabled", true );
		},

		enabled: function() {

            var settings = this.settings;

			this
			.$node
			.find( settings.selector4input + " , " + settings.selector4trigger )
			.removeAttr( "disabled" );
		},

		focus: function() {
			this.$node.find( ":input" ).focus();
		}
	};

	$.fn.calendar = function( options, force ) {

		var
		settings,
		instance = this.data( namespace );

		if ( !instance || true === force ) {
            settings = $.extend( {}, $.fn.calendar.defaults, options || {} ),
			instance = new Calendar( this, settings );
			this.data( namespace, instance );
		}
		return instance;
	};

	$.fn.calendar.defaults = {

		daysOfTheWeek   : [ "日", "一", "二", "三", "四", "五", "六" ],

		format          : "%Y-%m-%d",

		onSelected      : $.noop,

		minDate         : undefined,
		maxDate         : undefined,
        selectable      : undefined,

        /** List of selectable days of the week, 0 is Sunday, 1 is Monday, and so on. */
        selectableDOW   : [ 1, 2, 3, 4, 5 ],

		defaultDate     : new Date(),

		selector4input  : ":input",
		selector4trigger: ".md-icon-calendar"
	};
} );

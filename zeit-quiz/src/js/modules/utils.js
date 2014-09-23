define( function() {
    'use strict';

    var entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
    },

    animEndEventNames = {
        'MozAnimation': 'animationend', // verify for FF < 16
        'WebkitAnimation': 'webkitAnimationEnd',
        'OAnimation': 'oAnimationEnd',
        'msAnimation': 'MSAnimationEnd',
        'animation': 'animationend'
    },

    getTransitionPrefix = function() {
        var b = document.body || document.documentElement,
            s = b.style,
            p = 'animation',
            v = [ 'Moz', 'Webkit', 'O', 'ms' ].reverse(),
            i;

        if ( typeof s[p] === 'string' ) {
            return p;
        }

        // Tests for vendor specific prop
        p = p.charAt( 0 ).toUpperCase() + p.substr( 1 );

        for ( i = v.length; i--; ) {
            if ( typeof s[v[i] + p] === 'string' ) {
                return v[i] + p;
            }
        }

        return false;
    },

    transitionPrefix = getTransitionPrefix(),

    Utils = {
        escapeHtml: function( string ) {
            // var entityRegExp = new RegExp('[' + Object.keys(entityMap).join('') + ']', 'g');

            return String( string ).replace(/[&<>"]/g, function( m ) {
                return entityMap[m];
            });
        },

        /**
         * Use Fisher–Yates Shuffle to randomize the order of answers
         */
        shuffleArray: function( a ) {
            var m = a.length, t, i;

            // While there remain elements to shuffle…
            while ( m ) {

                // Pick a remaining element…
                i = Math.floor( Math.random() * m-- );

                // And swap it with the current element.
                t = a[m];
                a[m] = a[i];
                a[i] = t;
            }

            return a;
        },

        // animation end event name
        animEndEventName: animEndEventNames[ transitionPrefix ]
    };

    return Utils;

});

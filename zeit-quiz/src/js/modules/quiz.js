define( [ 'jquery', 'modules/utils.js' ], function( $, utils ) {
    'use strict';

    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                                   window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

    var Quiz = {
        currentPage: 0,
        currentQuestion: 0,
        pages: null,
        cards: null,
        questions: [],
        total: 0,
        isAnimating: false,
        endThisPage: false,
        endNextPage: false,
        outClass: 'pt-page-swap',
        inClass: 'pt-page-swap',
        number: $( '#js-number' ),
        delay: 600, // choose 0 to disable animations
        timer:  {
            time: 0,
            start: null,
            interval: null,
            display: $( '#js-timer' )
        },
        score: {
            points: 0,
            display: $( '#js-score' )
        },
        progress:  {
            speed: 'quick',
            limit: {
                'quick': 6,
                'fair': 12,
                'slow': Infinity
            },
            meter: $( '<div class="progress__meter"></div>' ),
            display: $( '#js-progress' ),
            items: $()
        },
        lock: {
            screen: $( '#js-lock' ),
            isActive: false
        },

        reset: function() {
            this.currentPage = 0;
            this.currentQuestion = 0;
            this.score.points = 0;
            this.progress.items = $();
            this.score.display.html( this.score.points );
        },

        start: function( e ) {
            this.nextPage( e );
        },

        nextPage: function( e, isCard ) {
            e.preventDefault();

            if ( this.isAnimating ) {
                return false;
            }

            this.isAnimating = true;

            var that = this,
                $thisPage,
                $nextPage;

            if ( isCard ) {
                $thisPage = this.cards.eq( this.currentQuestion++ );
                $nextPage = this.cards.eq( this.currentQuestion ).addClass( 'page--current' );
                this.setAnimation( 69 ); // 69 7
                this.stopTimer();
            } else {
                $thisPage = this.pages.eq( this.currentPage++ );
                $nextPage = this.pages.eq( this.currentPage ).addClass( 'page--current' );
                this.setAnimation( 69 ); // 67 60 34 64 17
            }

            $thisPage.addClass( this.outClass ).on( utils.animEndEventName, function() {
                $thisPage.off( utils.animEndEventName );
                that.endthisPage = true;
                if ( isCard ) {
                    that.initHeader();
                }
                if ( that.endNextPage ) {
                    that.onEndAnimation( $thisPage, $nextPage );
                }
            });

            $nextPage.addClass( this.inClass ).on( utils.animEndEventName, function() {
                $nextPage.off( utils.animEndEventName );
                that.endNextPage = true;
                if ( that.endthisPage ) {
                    that.onEndAnimation( $thisPage, $nextPage );
                }
            });
        },

        onEndAnimation: function( $outpage, $inpage ) {
            this.endCurrPage = false;
            this.endNextPage = false;
            this.resetPage( $outpage, $inpage );
            this.isAnimating = false;
            this.showQuestion();
        },

        resetPage: function( $outpage, $inpage ) {
            $outpage.removeClass( this.outClass + ' page--current' );
            $inpage.removeClass( this.inClass );
        },

        animateProgress: function( timestamp ) {
            var that = this,
                seconds,
                percent;

            if ( !this.timer.interval ) {
                return;
            }

            if (this.timer.start === null) {
                this.timer.start = timestamp;
                this.progress.meter.width( '0%' )
                    .appendTo( this.progress.items.eq( this.currentQuestion ) );
            }

            seconds = (timestamp - this.timer.start) / 1000;
            percent = seconds / this.progress.limit.fair * 100;
            percent = Math.min( percent.toFixed(4), 100 );

            // requestAnimationFrame meters more precise - adjust if needed
            if ( percent === 100 ) {
                this.progress.speed = 'slow';
            } else {
                this.setProgressSpeed( seconds );
            }

            this.progress.meter.width( percent + '%' ).attr( 'data-state', this.progress.speed );

            if ( this.timer.interval && percent < 100) {
                requestAnimationFrame( function( t ) { that.animateProgress( t ); } );
            }
        },

        startTimer: function() {
            var that = this;

            this.stopTimer();
            this.timer.interval = setInterval( function() { that.meter(); }, 1000 );
            this.meter();

            this.timer.start = null;
            requestAnimationFrame( function( t ) { that.animateProgress( t ); } );
        },

        stopTimer: function() {
            clearInterval( this.timer.interval );
            this.timer.interval = null;
            this.progress.meter.width( '0%' );
        },

        initTimer: function() {
            this.stopTimer();
            this.timer.time = 0;
            this.timer.display
                .html( '0”' )
                .attr( 'data-state', 'quick' );
        },

        meter: function() {
            var seconds = this.timer.time % 60,
                minutes = Math.floor( this.timer.time / 60 ) % 60,
                hours = Math.floor( this.timer.time / 3600 );

            if ( hours || minutes ) {
                if ( seconds < 10 ) {
                    seconds = '0' + seconds;
                }
                seconds = ':' + seconds;
            }

            if ( hours ) {
                if ( minutes < 10 ) {
                    minutes = '0' + minutes;
                }
                minutes = ':' + minutes;
            }

            this.setProgressSpeed( this.timer.time );

            this.timer.display
                .html( hours + minutes + seconds + '”' )
                .attr( 'data-state', this.progress.speed );

            // static version
            /*
            if (this.timer.start === null) {
                this.timer.start = true;
                this.progress.meter.width( '0%' )
                    .appendTo( this.progress.items.eq( this.currentQuestion ) );
            }

            var percent = this.timer.time / this.progress.limit.fair * 100;
            percent = Math.min( percent.toFixed(4), 100 );

            this.progress.meter.width( percent + '%' ).attr( 'data-state', this.progress.speed );
            */

            this.timer.time++;
        },

        showQuestion: function() {
            var that = this,
                $card = this.cards.eq( this.currentQuestion );

            this.initHeader();
            this.showLock( false );

            if ( this.currentQuestion >= this.total ) {
                this.showReport();
                $card = this.cards.last();
            }

            $card.addClass( 'card--active' ).on( utils.animEndEventName, function( e ) {
                if ( e.target.className === 'question') {
                    $card.off( utils.animEndEventName );
                    that.startTimer();
                }
            });
        },

        getPoints: function( state ) {
            switch ( state ) {
                case 'quick':
                    return 10;
                case 'fair':
                    return 5;
                case 'slow':
                    return 2;
                default:
                    return 0;
            }
        },

        showReport: function() {
            var stripes = $( '#js-stripes' ),
                points = $( '#js-points' ),
                stripe = stripes.children().eq(0),
                point = $.trim( points.html() ),
                s = [],
                p = [],
                state,
                i;

            for ( i = this.total; i--; ) {
                state = this.progress.items.eq( i ).attr( 'data-state' ) || 'default';
                stripe.children().eq(0).attr( 'data-state', state );
                s.unshift( stripe.get(0).outerHTML );
                p.unshift( this.format( point, { points: this.getPoints( state ) } ) );
            }

            stripes.html( s.join('') );
            points.html( p.join('') );

            this.showFeedback();
        },

        // feedback
        showFeedback: function() {
            var node = $( '#js-feedback' ),
                title = node.find( '.js-feedback-title' ),
                badge = node.find( '.js-feedback-badge' ),
                text = node.find( '.js-feedback-text' ),
                feedback = this.getFeedback(),
                index = Math.floor(Math.random() * feedback.length),
                info = feedback[index];

            node.addClass( 'feedback--appear' );
            title.text( info.title );
            text.text( info.text );
            badge.get(0).src = 'css/icons/x2/' + info.badge;

            if ( 'abysmal' === this.getFeedbackType() ) {
                badge.addClass( 'upsidedown' );
            }
        },

        setProgressSpeed: function( seconds ) {
            var speed;

            for (speed in this.progress.limit) {
                if ( this.progress.limit.hasOwnProperty( speed ) ) {
                    if ( seconds < this.progress.limit[speed] ) {
                        this.progress.speed = speed;
                        break;
                    }
                }
            }
        },

        setProgress: function( state ) {
            this.progress.meter.detach();
            this.progress.items.eq( this.currentQuestion ).attr( 'data-state', state );
            this.score.points += this.getPoints( state );
            this.score.display.html( this.score.points );
        },

        selectAnswer: function( e ) {
            e.preventDefault();

            var that = this,
                $selection = $( e.target ),
                $others = $selection.siblings(),
                others = $others.get(),
                l = $others.length,
                c = 1,
                setState,
                i,
                a,
                w;

            setState = function( a, state, progress ) {
                setTimeout( function() {
                    a.setAttribute( 'data-state', state );

                    if ( progress ) {
                        that.setProgress( progress );
                    }
                }, that.delay * ++c );
            };

            this.showLock( true );
            $selection.attr( 'data-state', 'selected' );
            this.stopTimer();

            while ( l ) {
                i = Math.floor( Math.random() * l-- );
                a = others.splice( i, 1 ).pop();

                if ( a.getAttribute( 'data-correct' ) === 'true' ) {
                    w = a;
                } else {
                    setState( a, 'solved' );
                }
            }

            if ( w ) {
                setState( $selection.get(0), 'false' );
                setState( w, 'correct', 'false' );
            } else {
                setState( $selection.get(0), 'correct selected', this.progress.speed );
            }

            setTimeout( function() {
                that.nextPage( e, true );
            }, that.delay * ++c );
        },

        /**
         * Set animation classes for page transition
         * @param {number} animation - numerical key
         * @see http://tympanus.net/Development/PageTransitions/
         */
        setAnimation: function( animation ) {
            var outClass, inClass;

            switch ( animation ) {

                case 0:
                    outClass = 'pt-page-swap';
                    inClass = 'pt-page-swap';
                    break;
                case 1:
                    outClass = 'pt-page-moveToLeft';
                    inClass = 'pt-page-moveFromRight';
                    break;
                case 2:
                    outClass = 'pt-page-moveToRight';
                    inClass = 'pt-page-moveFromLeft';
                    break;
                case 3:
                    outClass = 'pt-page-moveToTop';
                    inClass = 'pt-page-moveFromBottom';
                    break;
                case 4:
                    outClass = 'pt-page-moveToBottom';
                    inClass = 'pt-page-moveFromTop';
                    break;
                case 5:
                    outClass = 'pt-page-fade';
                    inClass = 'pt-page-moveFromRight pt-page-ontop';
                    break;
                case 6:
                    outClass = 'pt-page-fade';
                    inClass = 'pt-page-moveFromLeft pt-page-ontop';
                    break;
                case 7:
                    outClass = 'pt-page-fade';
                    inClass = 'pt-page-moveFromBottom pt-page-ontop';
                    break;
                case 8:
                    outClass = 'pt-page-fade';
                    inClass = 'pt-page-moveFromTop pt-page-ontop';
                    break;
                case 9:
                    outClass = 'pt-page-moveToLeftFade';
                    inClass = 'pt-page-moveFromRightFade';
                    break;
                case 10:
                    outClass = 'pt-page-moveToRightFade';
                    inClass = 'pt-page-moveFromLeftFade';
                    break;
                case 11:
                    outClass = 'pt-page-moveToTopFade';
                    inClass = 'pt-page-moveFromBottomFade';
                    break;
                case 12:
                    outClass = 'pt-page-moveToBottomFade';
                    inClass = 'pt-page-moveFromTopFade';
                    break;
                case 13:
                    outClass = 'pt-page-moveToLeftEasing pt-page-ontop';
                    inClass = 'pt-page-moveFromRight';
                    break;
                case 14:
                    outClass = 'pt-page-moveToRightEasing pt-page-ontop';
                    inClass = 'pt-page-moveFromLeft';
                    break;
                case 15:
                    outClass = 'pt-page-moveToTopEasing pt-page-ontop';
                    inClass = 'pt-page-moveFromBottom';
                    break;
                case 16:
                    outClass = 'pt-page-moveToBottomEasing pt-page-ontop';
                    inClass = 'pt-page-moveFromTop';
                    break;
                case 17:
                    outClass = 'pt-page-scaleDown';
                    inClass = 'pt-page-moveFromRight pt-page-ontop';
                    break;
                case 18:
                    outClass = 'pt-page-scaleDown';
                    inClass = 'pt-page-moveFromLeft pt-page-ontop';
                    break;
                case 19:
                    outClass = 'pt-page-scaleDown';
                    inClass = 'pt-page-moveFromBottom pt-page-ontop';
                    break;
                case 20:
                    outClass = 'pt-page-scaleDown';
                    inClass = 'pt-page-moveFromTop pt-page-ontop';
                    break;
                case 21:
                    outClass = 'pt-page-scaleDown';
                    inClass = 'pt-page-scaleUpDown pt-page-delay300';
                    break;
                case 22:
                    outClass = 'pt-page-scaleDownUp';
                    inClass = 'pt-page-scaleUp pt-page-delay300';
                    break;
                case 23:
                    outClass = 'pt-page-moveToLeft pt-page-ontop';
                    inClass = 'pt-page-scaleUp';
                    break;
                case 24:
                    outClass = 'pt-page-moveToRight pt-page-ontop';
                    inClass = 'pt-page-scaleUp';
                    break;
                case 25:
                    outClass = 'pt-page-moveToTop pt-page-ontop';
                    inClass = 'pt-page-scaleUp';
                    break;
                case 26:
                    outClass = 'pt-page-moveToBottom pt-page-ontop';
                    inClass = 'pt-page-scaleUp';
                    break;
                case 27:
                    outClass = 'pt-page-scaleDownCenter';
                    inClass = 'pt-page-scaleUpCenter pt-page-delay400';
                    break;
                case 28:
                    outClass = 'pt-page-rotateRightSideFirst';
                    inClass = 'pt-page-moveFromRight pt-page-delay200 pt-page-ontop';
                    break;
                case 29:
                    outClass = 'pt-page-rotateLeftSideFirst';
                    inClass = 'pt-page-moveFromLeft pt-page-delay200 pt-page-ontop';
                    break;
                case 30:
                    outClass = 'pt-page-rotateTopSideFirst';
                    inClass = 'pt-page-moveFromTop pt-page-delay200 pt-page-ontop';
                    break;
                case 31:
                    outClass = 'pt-page-rotateBottomSideFirst';
                    inClass = 'pt-page-moveFromBottom pt-page-delay200 pt-page-ontop';
                    break;
                case 32:
                    outClass = 'pt-page-flipOutRight';
                    inClass = 'pt-page-flipInLeft pt-page-delay500';
                    break;
                case 33:
                    outClass = 'pt-page-flipOutLeft';
                    inClass = 'pt-page-flipInRight pt-page-delay500';
                    break;
                case 34:
                    outClass = 'pt-page-flipOutTop';
                    inClass = 'pt-page-flipInBottom pt-page-delay500';
                    break;
                case 35:
                    outClass = 'pt-page-flipOutBottom';
                    inClass = 'pt-page-flipInTop pt-page-delay500';
                    break;
                case 36:
                    outClass = 'pt-page-rotateFall pt-page-ontop';
                    inClass = 'pt-page-scaleUp';
                    break;
                case 37:
                    outClass = 'pt-page-rotateOutNewspaper';
                    inClass = 'pt-page-rotateInNewspaper pt-page-delay500';
                    break;
                case 38:
                    outClass = 'pt-page-rotatePushLeft';
                    inClass = 'pt-page-moveFromRight';
                    break;
                case 39:
                    outClass = 'pt-page-rotatePushRight';
                    inClass = 'pt-page-moveFromLeft';
                    break;
                case 40:
                    outClass = 'pt-page-rotatePushTop';
                    inClass = 'pt-page-moveFromBottom';
                    break;
                case 41:
                    outClass = 'pt-page-rotatePushBottom';
                    inClass = 'pt-page-moveFromTop';
                    break;
                case 42:
                    outClass = 'pt-page-rotatePushLeft';
                    inClass = 'pt-page-rotatePullRight pt-page-delay180';
                    break;
                case 43:
                    outClass = 'pt-page-rotatePushRight';
                    inClass = 'pt-page-rotatePullLeft pt-page-delay180';
                    break;
                case 44:
                    outClass = 'pt-page-rotatePushTop';
                    inClass = 'pt-page-rotatePullBottom pt-page-delay180';
                    break;
                case 45:
                    outClass = 'pt-page-rotatePushBottom';
                    inClass = 'pt-page-rotatePullTop pt-page-delay180';
                    break;
                case 46:
                    outClass = 'pt-page-rotateFoldLeft';
                    inClass = 'pt-page-moveFromRightFade';
                    break;
                case 47:
                    outClass = 'pt-page-rotateFoldRight';
                    inClass = 'pt-page-moveFromLeftFade';
                    break;
                case 48:
                    outClass = 'pt-page-rotateFoldTop';
                    inClass = 'pt-page-moveFromBottomFade';
                    break;
                case 49:
                    outClass = 'pt-page-rotateFoldBottom';
                    inClass = 'pt-page-moveFromTopFade';
                    break;
                case 50:
                    outClass = 'pt-page-moveToRightFade';
                    inClass = 'pt-page-rotateUnfoldLeft';
                    break;
                case 51:
                    outClass = 'pt-page-moveToLeftFade';
                    inClass = 'pt-page-rotateUnfoldRight';
                    break;
                case 52:
                    outClass = 'pt-page-moveToBottomFade';
                    inClass = 'pt-page-rotateUnfoldTop';
                    break;
                case 53:
                    outClass = 'pt-page-moveToTopFade';
                    inClass = 'pt-page-rotateUnfoldBottom';
                    break;
                case 54:
                    outClass = 'pt-page-rotateRoomLeftOut pt-page-ontop';
                    inClass = 'pt-page-rotateRoomLeftIn';
                    break;
                case 55:
                    outClass = 'pt-page-rotateRoomRightOut pt-page-ontop';
                    inClass = 'pt-page-rotateRoomRightIn';
                    break;
                case 56:
                    outClass = 'pt-page-rotateRoomTopOut pt-page-ontop';
                    inClass = 'pt-page-rotateRoomTopIn';
                    break;
                case 57:
                    outClass = 'pt-page-rotateRoomBottomOut pt-page-ontop';
                    inClass = 'pt-page-rotateRoomBottomIn';
                    break;
                case 58:
                    outClass = 'pt-page-rotateCubeLeftOut pt-page-ontop';
                    inClass = 'pt-page-rotateCubeLeftIn';
                    break;
                case 59:
                    outClass = 'pt-page-rotateCubeRightOut pt-page-ontop';
                    inClass = 'pt-page-rotateCubeRightIn';
                    break;
                case 60:
                    outClass = 'pt-page-rotateCubeTopOut'; //  pt-page-ontop
                    inClass = 'pt-page-rotateCubeTopIn';
                    break;
                case 61:
                    outClass = 'pt-page-rotateCubeBottomOut pt-page-ontop';
                    inClass = 'pt-page-rotateCubeBottomIn';
                    break;
                case 62:
                    outClass = 'pt-page-rotateCarouselLeftOut pt-page-ontop';
                    inClass = 'pt-page-rotateCarouselLeftIn';
                    break;
                case 63:
                    outClass = 'pt-page-rotateCarouselRightOut pt-page-ontop';
                    inClass = 'pt-page-rotateCarouselRightIn';
                    break;
                case 64:
                    outClass = 'pt-page-rotateCarouselTopOut pt-page-ontop';
                    inClass = 'pt-page-rotateCarouselTopIn';
                    break;
                case 65:
                    outClass = 'pt-page-rotateCarouselBottomOut pt-page-ontop';
                    inClass = 'pt-page-rotateCarouselBottomIn';
                    break;
                case 66:
                    outClass = 'pt-page-rotateSidesOut';
                    inClass = 'pt-page-rotateSidesIn pt-page-delay200';
                    break;
                case 67:
                    outClass = 'pt-page-rotateSlideOut';
                    inClass = 'pt-page-rotateSlideIn';
                    break;
                case 68:
                    outClass = 'pt-page-fadeOut';
                    inClass = 'pt-page-swap pt-page-delay1000';
                    break;
                case 69:
                    outClass = 'pt-page-fadeOut';
                    inClass = 'pt-page-fadeIn';
                    break;

            }

            this.outClass = outClass;
            this.inClass = inClass;
        },

        showLock: function( show ) {
            this.lock.screen.toggle( show );
            this.lock.isActive = show;
        },

        initHeader: function() {
            if (this.currentQuestion < this.total) {
                this.initTimer();
                this.number.html( (this.currentQuestion + 1) + '/' + this.total );
            } else {
                // this.timer.display.html( '<a href="#" class="dashboard__love"></a>' );
                // this.score.display.html( '<a href="#" class="dashboard__share"></a>' );
            }
        },

        initProgress: function() {
            var item = this.progress.display.children().eq(0),
                i;

            // only needed for replay
            item.attr( 'data-state', 'default' );

            for ( i = this.total; i--; ) {
                this.progress.items = this.progress.items.add( item.clone() );
            }

            this.progress.display.html( this.progress.items );
        },

        initCards: function() {
            var cardTemplate = $.trim( $( '#js-card-template' ).html() ),
                answerTemplate = $.trim( $( '#js-answer-template' ).html() ),
                reportTemplate = $.trim( $( '#js-report-template' ).html() ),
                cards = [],
                answers = [],
                q,
                i,
                a;

            for ( i = 0; i < this.total; i++ ) {
                q = this.questions[i];
                q.intro = (this.total === i + 1) ? 'Letzte Frage!' : 'Frage ' + (i + 1);
                answers = [];

                utils.shuffleArray(q.answers);

                for ( a = q.answers.length; a--; ) {
                    answers.push( this.format( answerTemplate, q.answers[a] ) );
                }

                cards.push( this.format( cardTemplate.replace( /\{answers\}/, answers.join('') ), q ) );
            }

            cards.push( reportTemplate );

            $( '#js-cards' ).html( cards.join('') );
        },

        format: function( string, map ) {
            return String( string ).replace( /\{(\w+)\}/g, function( match, key ) {
                return ( key in map ) ? utils.escapeHtml( map[key] ) : '';
            });
        },

        getQuestions: function() {
            var that = this;

            $.ajax({
                dataType: 'json',
                url: 'data/questions.json',
                async: false,
                success: function( data ) {
                    that.questions = data;
                    that.total = that.questions.length;
                }
            });
        },

        getFeedbackType: function() {
            if ( this.score.points > 50 ) {
                return 'brilliant';
            }

            return 'abysmal';
        },

        getFeedback: function() {
            var feedback,
                type = this.getFeedbackType();

            $.ajax({
                dataType: 'json',
                url: 'data/feedback.json',
                async: false,
                success: function( data ) {
                    feedback = data;
                }
            });

            return feedback[type];
        },

        init: function() {
            var that = this,
                node = $( 'main' );

            this.getQuestions();

            this.initHeader();
            this.initProgress();
            this.initCards();

            this.pages = node.find( '.page' );
            this.cards = node.find( '.card' );

            this.pages.first().addClass( 'page--current' );
            this.cards.first().addClass( 'page--current' );

            node.on( 'click touchstart', '.js-start-quiz', function( e ) { that.start( e ); } );
            node.on( 'click touchstart', '.js-skip', function( e ) { that.nextPage( e, true ); } );
            node.on( 'click touchstart', '.js-answer', function( e ) { that.selectAnswer( e ); } );
            node.on( 'click touchstart', '.js-replay-quiz', function( e ) {
                that.reset();

                that.initHeader();
                that.initProgress();
                that.initCards();

                that.cards = node.find( '.card' );
                that.cards.first().addClass( 'page--current' );

                that.start( e );
            } );
        }
    };

    return Quiz;

});

/* global define */
define( ['jquery'], function( $ ) {
	'use strict';

	var questions = [
		{
			description: 'Am Freitag feiert die deutsche Torwart-Legende Sepp Maier seinen 70. Geburtstag. Angefangen hat er seine Fußballer-Karriere beim TSV Haar, am Stadtrand von München.',
			question: 'Welche Rolle spielte der junge Sepp in seinem Team?',
			answers: [
				{text: 'Er war der beste Stürmer und wurde immer Torschützenkönig.', correct: false},
				{text: 'Er stand natürlich im Tor und galt als „Elfmeter-Killer“.', correct: true},
				{text: 'Meist saß er auf der Bank und diskutierte mit dem Trainer.', correct: false}
			]
		},
		{
			question: 'Was gibt es seit der Rückrunde 2002/2003 in der Fußballbundesliga?',
			answers: [
				{text: '12 Spieler pro Mannschaft', correct: false},
				{text: 'Vierter Schiedsrichter', correct: true},
				{text: '3 Tore auf dem Platz', correct: false},
				{text: 'Zwölfmeter ', correct: false}
			]
		},
		{
			question: 'Wann wurde die 2. Bundesliga eingeführt?',
			answers: [
				{text: '1968', correct: false},
				{text: '1971', correct: false},
				{text: '1974', correct: true},
				{text: '1975', correct: false}
			]
		}
	];

	var animEndEventNames = {
		'WebkitAnimation': 'webkitAnimationEnd',
		'OAnimation': 'oAnimationEnd',
		'msAnimation': 'MSAnimationEnd',
		'animation': 'animationend'
	};

	var entityMap = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;'
	};

	var escapeHtml = function( string ) {
		// var entityRegExp = new RegExp('[' + Object.keys(entityMap).join('') + ']', 'g');

		return String( string ).replace(/[&<>"]/g, function( m ) {
			return entityMap[m];
		});
	};

	var shuffleArray = function( a ) {
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
	};

	var getTransitionPrefix = function() {
		var b = document.body || document.documentElement,
			s = b.style,
			p = 'animation',
			v = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'].reverse(),
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
	};

	// animation end event name
	var animEndEventName = animEndEventNames[getTransitionPrefix()];

	var Quiz = {
		currentPage: 0,
		currentQuestion: 0,
		pages: [],
		cards: [],
		questions: questions,
		total: questions.length,
		isAnimating: false,
		endThisPage: false,
		endNextPage: false,
		outClass: 'pt-page-swap',
		inClass: 'pt-page-swap',
		number: $( '#js-number' ),
		timer:  {
			time: 0,
			interval: null,
			display: $( '#js-timer' )
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
				if ( this.currentQuestion === this.total - 1 ) {
					return false;
				}

				$thisPage = this.cards.eq( this.currentQuestion++ );
				$nextPage = this.cards.eq( this.currentQuestion ).addClass( 'page--current' );
				this.setAnimation( 0 ); // 7
				this.stopTimer();
			} else {
				$thisPage = this.pages.eq( this.currentPage++ );
				$nextPage = this.pages.eq( this.currentPage ).addClass( 'page--current' );
				this.setAnimation( 67 ); // 67 60 34 64 17
			}

			$thisPage.addClass( this.outClass ).on( animEndEventName, function() {
				$thisPage.off( animEndEventName );
				that.endthisPage = true;
				if ( isCard ) {
					that.initHeader();
				}
				if ( that.endNextPage ) {
					that.onEndAnimation( $thisPage, $nextPage );
				}
			});

			$nextPage.addClass( this.inClass ).on( animEndEventName, function() {
				$nextPage.off( animEndEventName );
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

		startTimer: function() {
			var that = this;

			this.stopTimer();
			this.timer.interval = setInterval( function () { that.meter(); }, 1000 );
			this.meter();
		},

		stopTimer: function() {
			clearInterval( this.timer.interval );
		},

		initTimer: function() {
			this.stopTimer();
			this.timer.time = 0;
			this.timer.display
				.html( '0”' )
				.attr( 'data-state', 'quick' );
		},

		meter: function () {
			var seconds = this.timer.time % 60,
				minutes = Math.floor( this.timer.time / 60 ) % 60,
				hours = Math.floor( this.timer.time / 3600 ),
				state = 'slow';

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

			if ( this.timer.time < 10 ) {
				state = 'quick';
			} else if ( this.timer.time < 30 ) {
				state = 'fair';
			}

			this.timer.display
				.html( hours + minutes + seconds + '”' )
				.attr( 'data-state', state );

			this.timer.time++;
		},

		showQuestion: function() {
			var that = this,
				$card = this.cards.eq( this.currentQuestion );

			this.initHeader();

			$card.addClass( 'card--active' ).on( animEndEventName, function( e ) {
				if ( e.target.className === 'question') {
					$card.off( animEndEventName );
					that.startTimer();
				}
			});
		},

		selectAnswer: function( e ) {
			var that = this,
				$selection = $( e.target ),
				$others = $selection.siblings(),
				others = $others.get(),
				l = $others.length,
				delay = 900,
				c = 1,
				i,
				a,
				w;

			var setState = function( a, state ) {
				setTimeout( function() {
					a.setAttribute( 'data-state', state );
				}, delay * ++c );
			};

			$selection.attr( { 'data-state': 'selected' } );
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

			if ( !$selection.data( 'correct' ) ) {
				setState( $selection.get(0), 'false' );
				setState( w, 'correct' );
			} else {
				setState( $selection.get(0), 'correct selected' );
			}

			setTimeout( function() {
				that.nextPage( e, true );
			}, delay * ++c );
		},

		setAnimation: function( animation ) {
			var outClass, inClass;

			switch( animation ) {

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

		initHeader: function() {
			this.initTimer();
			this.number.html( (this.currentQuestion + 1) + '/' + this.total );
		},

		initCards: function() {
			var cardTemplate = $.trim( $( '#js-card-template' ).html() ),
				answerTemplate = $.trim( $( '#js-answer-template' ).html() ),
				cards = [],
				answers = [],
				q,
				i,
				a;

			for ( i = 0; i < this.total; i++ ) {
				q = this.questions[i];
				q.no = i + 1;
				answers = [];

				shuffleArray(q.answers);

				for ( a = q.answers.length; a--; ) {
					answers.push( this.format( answerTemplate, q.answers[a] ) );
				}

				cards.push( this.format( cardTemplate.replace( /\{answers\}/, answers.join('') ), q ) );
			}

			$( '#js-cards' ).html( cards.join('') );

			this.initHeader();
		},

		format: function( string, map ) {
			return String( string ).replace( /\{(\w+)\}/g, function( match, key ) {
				return ( key in map ) ? escapeHtml( map[key] ) : '';
			});
		},

		init: function() {
			var that = this,
				node = $( 'main' );

			this.initCards();

			this.pages = node.find( '.page' );
			this.cards = node.find( '.card' );

			this.pages.first().addClass( 'page--current' );
			this.cards.first().addClass( 'page--current' );

			node.on( 'click', '.js-start-quiz', function( e ) { that.start( e ); } );
			node.on( 'click', '.js-skip', function( e ) { that.nextPage( e, true ); } );
			node.on( 'click', '.js-answer', function( e ) { that.selectAnswer( e ); } );

		}
	};

	return Quiz;

});

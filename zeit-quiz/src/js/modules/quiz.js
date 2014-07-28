/* global define */
define( ['jquery'], function( $ ) {

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
			question: 'Wann wurde die 2.Bundesliga eingeführt?',
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
		current: 0,
		pages: [],
		isAnimating: false,
		endThisPage: false,
		endNextPage: false,
		// outClass: 'pt-page-rotateSlideOut',
		// inClass: 'pt-page-rotateSlideIn',
		// outClass: 'pt-page-moveToTop',
		// inClass: 'pt-page-moveFromBottom',
		// outClass: 'pt-page-rotateCarouselTopOut page--ontop',
		// inClass: 'pt-page-rotateCarouselTopIn',
		outClass: 'pt-page-rotateCubeTopOut  page--ontop',
		inClass: 'pt-page-rotateCubeTopIn',
		// outClass: 'pt-page-scaleDown',
		// inClass: 'pt-page-moveFromRight page--ontop',

		start: function( e ) {
			this.nextPage( e );
		},

		nextPage: function( e ) {
			e.preventDefault();

			if ( this.isAnimating ) {
				return false;
			}

			this.isAnimating = true;

			var that = this,
				$thisPage = this.pages.eq( this.current++ ),
				$nextPage = this.pages.eq( this.current ).addClass( 'page--current' );

			$thisPage.addClass( this.outClass ).on( animEndEventName, function() {
				$thisPage.off( animEndEventName );
				that.endthisPage = true;
				if ( that.endNextPage ) {
					that.onEndAnimation( $thisPage, $nextPage );
				}
			} );

			$nextPage.addClass( this.inClass ).on( animEndEventName, function() {
				$nextPage.off( animEndEventName );
				that.endNextPage = true;
				if ( that.endthisPage ) {
					that.onEndAnimation( $thisPage, $nextPage );
				}
			} );
		},

		onEndAnimation: function( $outpage, $inpage ) {
			this.endCurrPage = false;
			this.endNextPage = false;
			this.resetPage( $outpage, $inpage );
			this.isAnimating = false;
		},

		resetPage: function( $outpage, $inpage ) {
			$outpage.removeClass( this.outClass + ' page--current' );
			$inpage.removeClass( this.inClass );
		},

		selectAnswer: function( e ) {
			var target = $( e.target );

			target.attr({ 'data-state': 'selected' });
		},

		init: function() {
			var that = this,
				node = $( 'main' );

			this.pages = node.find( '.page' );

			this.pages.first().addClass( 'page--current' );

			node.on( 'click', '.js-start-quiz', function( e ) { that.start( e ); } );
			node.on( 'click', '.js-next-page', function( e ) { that.nextPage( e ); } );
			node.on( 'click', '.js-answer', function( e ) { that.selectAnswer( e ); } );
		}
	};

	return Quiz;

});

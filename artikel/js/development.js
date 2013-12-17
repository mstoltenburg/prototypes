(function() {
	'use strict';

	var iframe = document.querySelector('iframe'),
		swap = document.querySelector('.preview-switch');

	// just for development
	swap.addEventListener('click', function(e) {
		e.preventDefault();
		e.stopPropagation();

		var data   = e.target.dataset,
			width  = data.width,
			height = data.height,
			change = data.change;

		if (width) {
			iframe.width = width;
			iframe.height = height;
		} else if (change) {
			switch (change) {
				case 'x':
					top.location.href = window.frame.location.href;
					break;

				case 'y':
					iframe.height = '100%';
					// iframe.style.height = '100%';
					break;
			}
		}
	});

}());

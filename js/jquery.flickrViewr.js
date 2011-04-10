/**
 * jQuery.flickrViewr
 * --------------------------------------------------------------------
 *
 * https://github.com/mischah/jQuery-flickrViewr
 * @author <a href="mailto:mail@michael-kuehnel.de">Michael Kühnel</a>
 * --------------------------------------------------------------------
 *
 * Dual licensed under the MIT and GPL licenses:
 * - http://www.opensource.org/licenses/mit-license.php
 * - http://www.gnu.org/licenses/gpl.html
 * --------------------------------------------------------------------
 *
 * @option apiKey string
 * @description
 * Get your API key over here: 
 * http://www.flickr.com/services/api/misc.api_keys.html
 *
 * @option photosetId string
 * @description 
 * you can get the photosetId out of a normal flickr URL 
 * for instance http://flickr.com/photos/mischah/sets/72157624367929792/
 * where 72157624367929792 is the photosetId
 *
 * @option imageSize string
 * @description 
 * Imagessizes provided by flickr are:  
 * 's'	-		small square 75 x 75
 * 't'	-		thumbnail, 100 on longest side
 * 'm'	-		small, 240 on longest side
 * 'z'	-		medium 640, 640 on longest side
 * 'b'	-		large, 1024 on longest side
 * See http://www.flickr.com/services/api/misc.urls.html
*/


// jQuery wrapper 
(function ($) {
	$.fn.flickrViewr = function (options) {
		
		// Option handling
		var options = $.extend({}, $.fn.flickrViewr.defaults, options);
		
		return this
		// the plugin only accepts a few block elements as selector
		.filter('body, div, article, aside, header, footer, section, nav')
		// Create a flickrViewr for each selector 
		.each(function (index, value) {
			
			
			
			
			/**
			* Functionality of flickrViewr
			*/
			
			// place an container div for all the new dom stuff
			$('<div class="flickrViewr" />').appendTo(this);
			var element = $('.flickrViewr', this);
							
			// Place the loader gif
			element.append('<img src="images/jquery.flickrViewr/ajax-loader.gif" alt="" class="flickrViewrLoader">');

			// Ajax request
			var jqxhr = $.getJSON('http://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&jsoncallback=?', {
				api_key: options.apiKey,
				photoset_id: options.photosetId,
				extras: 'date_taken,geo,tags',
				format: 'json'
			}, function (data) {
				var images = '';
				//loop through the results with the following function
				$.each(data.photoset.photo, function (i, item) {
					//build the url of the photo
					var photoUrl =	'http://farm' + item.farm + 
									'.static.flickr.com/' + item.server +
									'/' + item.id +
									'_' + item.secret + 
									'_' + options.imageSize + 
									'.jpg';
					//console.log(photoUrl);
					// turn the photo id into a variable
					var photoID = item.id;
					// put the images in a variable
					images += '<div class="flickrViewrImage"><img src="' + photoUrl + '" alt="' + item.title + '" /></div>';
				});
				/*
				* DOM manipulation:
				* - Insert images
				* - Delete loader
				*/
				element.append(images);
				$('.flickrViewrImage', element).each(function() {
					$(this).width($('img', $(this)).outerWidth());
				});
				$('.flickrViewrLoader').remove();
			/**
			 * Errorhandling: 
			 * - What to do if Ajax request fails
			 */
			}).error(function () {
				// show error on screen
			});
		});
		
	};
	// Default options
	$.fn.flickrViewr.defaults = { 
		apiKey: '447d8ef1e0e6610a651becb938226228',
		photosetId: '72157609003808870',
		imageSize: 'm'
	};
})(jQuery);







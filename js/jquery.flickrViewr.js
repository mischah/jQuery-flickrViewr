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
 * @default ''
 * @description 
 * This one is required.
 * Get your API key over here: 
 * http://www.flickr.com/services/api/misc.api_keys.html
 
 * @option photosetId string
 * @default ''
 * @description
 * This one is required.
 * You can get the photosetId out of a normal flickr URL 
 * for instance http://flickr.com/photos/mischah/sets/72157624367929792/
 * where 72157624367929792 is the photosetId
 
 * @option imageSize string
 * @default 'm'
 * @description 
 * This one is optional 
 * Imagessizes provided by flickr are:  
 * 's'	-		small square 75 x 75
 * 't'	-		thumbnail, 100 on longest side
 * 'm'	-		small, 240 on longest side
 * 'z'	-		medium 640, 640 on longest side
 * 'b'	-		large, 1024 on longest side
 * See http://www.flickr.com/services/api/misc.urls.html
 
 @option render.mode string
 * @default ''
 * @description 
 * This one is optional.
 * The way you like your images to be rendered.
 * Following rendermodes are available.
 * 'infiniteScroll'	-	lazyload pictures while scrolling
 *
 * If you choose 'infiniteScroll' as renderMode you have to set a
 * few more options …
 
 @option render.infiniteScroll.perPage integer
 * @default 500
 * @description 
 * This one is optional.
 * specifies the amount of pictures to be displayed per ajax request.
 * More than 500 are not applicable du to Flickr API restrictions.

 @option render.infiniteScroll.threshold integer
 * @default 50
 * @description 
 * This one is optional.
 * This describes how close to the bottom of the page the lazyloading
 * should be triggered. Let's say you choose a high number like 400:
 * Now the new images are loaded 400 pixel before the user scrolled
 * to the bottom of the page. 

 
*/

/**
 * @description Console fix
 * Avoiding errors if no console is available
 */
if (!window.console) {
	window.console = {
		log		: function (event) {},
		info	: function (event) {},
		warn	: function (event) {},
		error	: function (event) {}
	}
}

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
			
			// Container for error messages
			var errorContainer = $('<div class="flickrViewrError"><h2>Error</h2><p></p></div>');
			
			// place an container div for all the new dom stuff
			$('<div class="flickrViewr" />').appendTo(this);
			var element = $('.flickrViewr', this);
							
			// Place the loader gif
			var loader = $('<img src="images/jquery.flickrViewr/ajax-loader.gif" alt="Loading images …" class="flickrViewrLoader">');
			element.append(loader);
			
			/**
			 * @param {string} message The debug message
			 * @description Displaying debug messages on the website
			 * and on the console (if available)
			 */
			function debug(message) {
				var debug = $('.flickrViewrDebug', element);
				if ( debug.length === 0) {
					element.prepend('<div class="flickrViewrDebug"></div>');
				} 
				debug.text(message);
				console.log(message);
			}
			
			/**
			 * @param {integer} loadPage The number of the 'page' that should be loaded. Needed for lazy loading of images.
			 * @description Self-executing function which will load page 1
			 */
			(function loadImages(loadPage) {
				var jqxhr = $.ajax({
					url: 'http://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&jsoncallback=?',
					data: {
						api_key: options.apiKey,
						photoset_id: options.photosetId,
						extras: 'date_taken,geo,tags',
						per_page: options.render.infiniteScroll.perPage,
						page: loadPage,
						format: 'json'
					},
					dataType: 'json',
					timeout: 10000,
					success: function (data) {
						/**
						 * Errorhandling: 
						 * Check the status of the API response.
						 */
						if (data.stat === 'fail') {
							// Get errormessage from API response
							$('p', errorContainer).text(data.message + '.');
							element.append(errorContainer);
						}
						else {
							var images = '';
							// Loop through the results
							$.each(data.photoset.photo, function (i, item) {
								//build the url of the photo
								var photoUrl =	'http://farm' + item.farm + 
												'.static.flickr.com/' + item.server +
												'/' + item.id +
												'_' + item.secret +
												'_' + options.imageSize +
												'.jpg';
								// turn the photo id into a variable
								var photoID = item.id;
								// put the images in a variable
								images += '<div class="flickrViewrImage"><img src="' + photoUrl + '" alt="' + item.title + '" /></div>';
							});
							/*
							* DOM manipulation:
							* - Insert images
							* - store the actual page and the number of total pages on our container element
							*/
							element.append(images);
							element.data({
								page: parseInt(data.photoset.page),
								pages: data.photoset.pages
							})
							
							$('.flickrViewrImage:not(.loaded)', element).css('visibility','hidden');
							
							$('.flickrViewrImage:not(.loaded) img', element).bind("load.flickrViewr", function () {
								//alert('Image loaded');
								//debug('Image loaded');
								//$(this).addClass('imageLoaded');
			  					/*
								* DOM manipulation:
								* - Define container width
								* - Delete loader
								* - Show image containers
								*/
								$(this).parent().width(this.width);
								loader.fadeOut().remove();
								$('.flickrViewrImage:not(.loaded)', element).css('visibility','visible');
								$(this).parent().addClass('loaded');								
							});
							
							// Lazyloading for rendermode 'infiniteScroll'				
							if (options.render.mode === 'infiniteScroll') {
								
								/**
								* @description loading more images
								* This function is called by the function below
								*/ 			
								function lazyLoad() {
									//debug('Page'+element.data('page')+' of '+element.data('pages'));
									//debug('lazyLoad fired');
									if (element.data('page') < element.data('pages')) {
										element.append(loader.css('display', 'block'));
										loadImages(element.data('page')+1);
									}
								}
								
								/**
								* @description Check when to load more images
								* 
								*/ 
								$(window).bind('scroll.flickrViewr', function () {
									var viewportHeight = $(window).height();
									var documentHeight = $(document).height();
									var pixelsToTop = $(document).scrollTop();
									//debug('documentHeight-viewportHeight = '+(documentHeight-viewportHeight)+'; pixelsToTop = '+ pixelsToTop);
									//debug('documentHeight = ' + documentHeight + '; viewportHeight = '+ viewportHeight +'; pixelsToTop = '+ pixelsToTop);
									if ((documentHeight - viewportHeight - options.render.infiniteScroll.threshold) <= pixelsToTop) {
										lazyLoad();
										$(this).unbind('scroll.flickrViewr');
									}
								});
							}		
						}
					}	
				/**
				 * Errorhandling: 
				 * - What to do if Ajax request fails
				 */
				}).error(function () {
					$('p', errorContainer).text('Can’t connect do Flickr API.');
					element.append(errorContainer);
					loader.fadeOut().remove();
				});
			
			})(1); // Initial call of loadImages(1) 
			
		});
		


					
	};
	// Default options
	$.fn.flickrViewr.defaults = { 
		apiKey: '',
		photosetId: '',
		imageSize: 'm',
		render: {
			mode: '',
			infiniteScroll : {
				perPage : 500,
				threshold: 50
			} 
		}
	
	};
})(jQuery);







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
 * @default 'z'
 * @description 
 * This one is optional 
 * Imagessizes provided by flickr are:  
 * 's'	-		small square 75 x 75
 * 't'	-		thumbnail, 100 on longest side
 * 'm'	-		small, 240 on longest side
 * 'z'	-		medium 640, 640 on longest side
 * 'b'	-		large, 1024 on longest side
 * See http://www.flickr.com/services/api/misc.urls.html
 
 @option renderMode string
 * @default ''
 * @description 
 * This one is optional.
 * The way you like your images to be rendered.
 * Following rendermodes are available.
 * 'infiniteScroll'	- lazyload pictures while scrolling or on click.
 * 'lightBox' - show thumnbnails and open larger images in a modal window
 *
 * If you choose 'infiniteScroll' as renderMode you have to set a
 * few more options …
 
 @option perRequest integer
 * @default 10
 * @description 
 * This one is optional.
 * Specifies the amount of pictures to be displayed per ajax request
 * in renderMode 'infiniteScroll'.
 * More than 500 are not applicable du to Flickr API restrictions.

 @option threshold integer
 * @default 50
 * @description 
 * This one is optional.
 * This describes how close to the bottom of the page the lazyloading
 * should be triggered. Let's say you choose a high number like 400:
 * Now the new images are loaded 400 pixel before the user scrolled
 * to the bottom of the page. 
 
 @option clickToLoad boolean
 * @default false
 * @description 
 * This one is optional.
 * You have to click a button to load more images if you set this one
 * to true.  

 @option anchorText ''
 * @default 'Click for more …'
 * @description 
 * This one is optional.
 * You can overwrite the text of the button if you choose clickToLoad.
 
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
			
			/**
			* Place a container div for all the new DOM stuff
			* @description Add classes for pluginname und rendermode
			*/
			var myContainer = $('<div class="flickrViewr '+ options.renderMode +'" />').appendTo(this);
			myContainer = $('.flickrViewr', this);
							
			// Place the loader gif
			var loader = $('<img src="images/jquery.flickrViewr/ajax-loader.gif" alt="Loading images …" class="flickrViewrLoader">');
			myContainer.append(loader);
			
			/**
			 * @param {string} message The debug message
			 * @description Displaying debug messages on the website
			 * and on the console (if available)
			 */
			function debug(message) {
				var debug = $('.flickrViewrDebug', myContainer);
				if ( debug.length === 0) {
					myContainer.prepend('<div class="flickrViewrDebug"></div>');
				} 
				debug.text(message);
				console.log(message);
			}
			
			/**
			 * @param {integer} loadPage The number of the 'page' that should be loaded. Needed for lazy loading of images.
			 * @description Self-executing function which will load page 1
			 */
			(function loadImages(loadPage) {
				if (options.renderMode === 'infiniteScroll') {
					var perRequest = options.perRequest;
				}
				else {
					perRequest = 500;
				}
				var jqxhr = $.ajax({
					url: 'http://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&jsoncallback=?',
					data: {
						api_key: options.apiKey,
						photoset_id: options.photosetId,
						extras: 'date_taken,geo,tags',
						per_page: perRequest,
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
							myContainer.append(errorContainer);
						}
						else {
							var images = '';
							// Loop through the results
							$.each(data.photoset.photo, function (i, item) {
								/**
								 * @param {string} imageSize The desired imagesize
								 * @description Build the url of the photo
								 */
								var getPhotoUrl = function(imageSize) {
									return	'http://farm' + item.farm + 
											'.static.flickr.com/' + item.server +
											'/' + item.id +
											'_' + item.secret +
											'_' + imageSize +
											'.jpg';
								}
								// Put the images in a variable
								images += '<div class="flickrViewrImage">'
								if (options.renderMode === 'lightBox') {
									images +=	'<a href="' + getPhotoUrl(options.imageSize) +
													'" title="' + item.title +
													'" rel="photosetID-' + options.photosetId +'">' +
														'<img src="' + getPhotoUrl(options.thumbnailSize) + '" alt="' + item.title + '" />' + 
												'</a>';
								}
								else {
									images += '<img src="' + getPhotoUrl(options.imageSize) + '" alt="' + item.title + '" />';
								}
								images += '</div>';
							});
							/*
							* DOM manipulation:
							* - Insert images
							* - Store the actual page and the number of total pages on our container element
							*/
							myContainer.append($(images));
							// Call the fancybox plugin on the anchor elements
							if (options.renderMode === 'lightBox') {
								$('a', myContainer).fancybox(options.fancyBox);
							}
							// Just show the first image if targeted
							if (options.firstOnly === true) {
								//$(obj).find('li').not(':first').hide();
								$('.flickrViewrImage', myContainer).not(':first').hide();
							} 
							
							myContainer.data({
								page: parseInt(data.photoset.page),
								pages: data.photoset.pages
							})
							
							// Do the following if the placed images are loaded
							$('.flickrViewrImage:not(.loaded) img', myContainer).bind("load.flickrViewr", function () {
			  					/*
								* DOM manipulation:
								* - Define container width
								* - Delete loader
								* - Show image containers
								*/
								$(this).parents('.flickrViewrImage').width(this.width).addClass('loaded');
								loader.fadeOut().remove();
								$(this).unbind('load.flickrViewr');
							});
							
							// Loading the next images in renderMode 'infiniteScroll'
							if (options.renderMode === 'infiniteScroll') {
								/**
								* @description Loading more images
								* This function is called by the function below
								*/ 			
								var additionalImages = function() {
									// Check if there are additional images to load
									if (myContainer.data('page') < myContainer.data('pages')) {
										//decide for lazyloading or clickToLoad 
										if (options.clickToLoad === true) {
											var anchor = $('<a href="#" class="flickrViewrMore">'+options.anchorText+'</a>');
											anchor.bind('click.flickrViewr', function (e) {
												e.preventDefault();
												loadImages(myContainer.data('page')+1);
												myContainer.append(loader.css('display', 'block'));
												$(this).remove();
												$(this).unbind('click.flickrViewr');		
											});
											// DOM: Place the button to load additional images
											myContainer.append(anchor);
										} 
										// Lazy loading without clicking 
										else {
											myContainer.append(loader.css('display', 'block'));
											loadImages(myContainer.data('page')+1);
										}
									}
								}
								
								/**
								* @description Check when to call additionalImages()
								*/ 
								$(window).bind('scroll.flickrViewr', function () {
									var viewportHeight = $(window).height();
									var documentHeight = $(document).height();
									var pixelsToTop = $(document).scrollTop();
									if ((documentHeight - viewportHeight - options.threshold) <= pixelsToTop) {
										additionalImages();
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
					myContainer.append(errorContainer);
					loader.fadeOut().remove();
				});

			})(1); // Initial call of loadImages(1) 
			
		});
		


					
	};
	// Default options
	$.fn.flickrViewr.defaults = { 
		apiKey: '',
		photosetId: '',
		imageSize: 'z',
		renderMode: '',
		perRequest : 10,
		threshold: 50,
		clickToLoad: false, 
		anchorText: 'Click for more …',
		thumbnailSize: 's',
		firstOnly: false,
		fancyBox: {}
	};
})(jQuery);







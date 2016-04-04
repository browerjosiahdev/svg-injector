/*
 * Copyright (c) 2015 Josiah James Brower
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.var console;
*/
'use strict';

if (typeof console === 'undefined') {
	console = {
		"log": function(v){},
		"dir": function(v){},
		"warn": function(v){}
	}
}

/**
 * Constructor
**/
function Svgi() {
	this.p_completeLib = Object.create(null);

	this.cleanseType = Svgi.CLEANSEPRIMARY;
	this.hasRun      = false;
	this.scope;

	$(this).on(Svgi.EVENTLOADED, this.svgLoaded);
	$(this).on(Svgi.EVENTERROR, this.svgLoadError);
}

Svgi.CLEANSEPRIMARY = 'CLEANSE_PRIMARY';
Svgi.CLEANSEUNIQUE  = 'CLEANSE_UNIQUE';
Svgi.CLEANSEHEX     = 'CLEANSE_HEX';
Svgi.EVENTLOADED    = 'SVG_EVENT_LOADED';
Svgi.EVENTERROR     = 'SVG_EVENT_ERROR';
Svgi.EVENTCOMPLETE  = 'SVG_EVENT_COMPLETE';

/**
 * Method: run
 *
 * Called to run the svg injection on the given scope.
 *
 * @param scope - Scope in which to run the injection (optional)
**/
Svgi.prototype.run = function( scope ) {
	if (scope === undefined) {
		scope = $;
	}

	this.scope = scope;

	var elements = scope.find('[data-svg-src]:not(.svg-set)');
	if (elements.length > 0) {
		var countId  = this.generateId();

		this.p_completeLib[countId] = elements.length;

		for (var inElements = 0; inElements < elements.length; inElements++) {
			var element = $(elements[inElements]),
			    svgSrc  = element.attr('data-svg-src');

			element.addClass('svg-set');

			if (svgSrc.match(/\.svg$/) !== null) {
				this.load(svgSrc, {
					"countId": countId,
					"element": element
				});
			} else {
				$(this).trigger({
					"loadData": {
						"countId": countId,
						"element": element
					},
					"message": "Trying to load a non-svg file.",
					"src": svgSrc,
					"type": Svgi.EVENTERROR
				});
			}
		}
	}

	this.hasRun = true;
};

/**
 * Method: svgLoaded
 *
 * Called when an svg finishes loading.
 *
 * @param evntLoaded - Handle to the loaded event.
**/
Svgi.prototype.svgLoaded = function( evntLoaded ) {
	var svgElement = evntLoaded.loadData.element,
			response   = evntLoaded.xhr.responseText;

	svgElement.html(svgElement.html() + this.cleanse(response));

	this.markAsComplete(evntLoaded.loadData.countId);
};

/**
 * Method: svgLoadError
 *
 * Called when an svg fails to load for some reason.
 *
 * @param evntError - Handle to the error event.
**/
Svgi.prototype.svgLoadError = function( evntError ) {
	console.warn('Load error (' + evntError.src + '): ' + evntError.message);

	this.markAsComplete(evntError.loadData.countId);
}

/**
 * Method: markAsComplete
 *
 * Called to mark another item from the given run (defined by the
 * countId parameter) is "complete"
 *
 * @param countId - ID to the unique counter for the current run.
**/
Svgi.prototype.markAsComplete = function( countId ) {
	if (this.p_completeLib[countId] !== undefined) {
		this.p_completeLib[countId]--;

		if (this.p_completeLib[countId] > 0) {
			return;
		}
	}

	$(this).trigger({
		"type": Svgi.EVENTCOMPLETE
	});
};

/**
 * Method: load
 *
 * Called to load the given svg file.
 *
 * @param src - Source of the svg file to load.
 * @param callback - Method to call when the load has completed.
 * @param data - Data to pass to the callback method.
**/
Svgi.prototype.load = function( src, data ) {
	var xhr;

	if (typeof XMLHttpRequest !== 'undefined') {
		xhr = new XMLHttpRequest();
	} else {
		var versions = ['MSXML2.XmlHttp.5.0', 'MSXML2.XmlHttp.4.0', 'MSXML2.XmlHttp.3.0', 'MSXML2.XmlHttp.2.0', 'Microsoft.XmlHttp'];

		for (var inVersions = 0; inVersions < versions.length; inVersions++) {
			try {
				xhr = new ActiveXObject(versions[inVersions]);
			} catch( error ) {}
		}
	}

	if (xhr !== undefined) {
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4 && xhr.status === 200) {
				$(this).trigger({
					"loadData": data,
					"src": src,
					"type": Svgi.EVENTLOADED,
					"xhr": xhr
				});
			} else if (xhr.readyState === 4) {
				$(this).trigger({
					"loadData": data,
					"message": xhr.responseText,
					"src": src,
					"type": Svgi.EVENTERROR,
					"xhr": xhr
				});
			}
		}.bind(this);

		xhr.open('GET', src, true);
		xhr.send('');
	}
};

/**
 * Method: cleanse
 *
 * Called to cleanse the given svg content.
 *
 * @param svgData - svg content to cleanse.
 *
 * @return the cleansed svg content.
**/
Svgi.prototype.cleanse = function( svgData ) {
	var hexFound = [];

	// Remove everything that comes before the first <svg/> tag, as well as anything that has been commented
	// out or is included in cdata. 11/05/2015 0255 PM - josiahb
	return svgData.substr(svgData.indexOf('<svg'), svgData.length)
								.replace(/(<\!--(.*?)-->)|(<\!\[CDATA\[(.*?)\]\]>)/g, '')
								.replace(/fill="#([0-9A-F]{6}|[0-9A-F]{3})"/g, function( fill ) {
									var hex = fill.match(/([0-9A-F]{6}|[0-9A-F]{3})/)[0]

									switch (this.cleanseType) {
										case Svgi.CLEANSEPRIMARY: {
											// Replace all of the fill attributes with class attributes, and replace any neutral, or repeating
											// hexadecimal values with a class of "fill-neutral" and any other value with a class of "fill-color"
											// 11/05/2015 0256 PM - josiahb
											var isNeutral = isNeutral || (hex.substr(0, 3) === hex.substr(3, 3));
											    isNeutral = isNeutral || (hex.substr(0, 2) === hex.substr(2, 2) && hex.substr(2, 2) === hex.substr(4, 2));
													isNeutral = isNeutral || (hex.length === 3 && hex.substr(0, 1) === hex.substr(1, 2) && hex.substr(1, 2) === hex.substr(2, 3));

											if (isNeutral) {
													return 'class="fill-neutral"';
											} else {
													return 'class="fill-color"';
											}

											break;
										}
										case Svgi.CLEANSEUNIQUE: {
											if (hexFound.indexOf(hex) > -1) {
												return 'class="fill-' + hexFound.indexOf(hex) + '"';
											} else {
												hexFound.push(hex);

												return 'class="fill-' + (hexFound.length - 1) + '"';
											}

											break;
										}
										case Svgi.CLEANSEHEX: {
											return 'class="fill-' + hex + '"';
										}
									}
								}.bind(this));
};

/**
 * Method: generateId
 *
 * Called to generate a random 10 digit ID.
 *
 * @return string value of a random 10 digit ID.
**/
Svgi.prototype.generateId = function() {
	return '0000000000'.replace(/\d/g, function( char ) {
		return String.fromCharCode(65 + (Math.random() * 25));
	});
};

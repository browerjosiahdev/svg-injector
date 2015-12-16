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
	this.cleanseType;
	this.hasRun;
	this.scope;
}

Svgi.CLEANSEPRIMARY = 'CLEANSE_PRIMARY';
Svgi.CLEANSEUNIQUE  = 'CLEANSE_UNIQUE';
Svgi.CLEANSEHEX     = 'CLEANSE_HEX';

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

	for (var inElements = 0; inElements < elements.length; inElements++) {
		var element = $(elements[inElements]),
		    svgSrc  = element.attr('data-svg-src');

		this.load(svgSrc, function( xhr, data ){
			var svgElement = data.element,
			    response   = xhr.responseText;

			svgElement.html(svgElement.html() + this.cleanse(response));
			svgElement.addClass('svg-set');
		}.bind(this), {"element": element});
	}

	this.hasRun = true;
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
Svgi.prototype.load = function( src, callback, data ) {
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
				if (data !== undefined) {
					callback(xhr, data);
				} else {
					callback(xhr);
				}
			} else {
				try {
					if (xhr.status === 404) {
						console.warn("load('" + src + "') request failed: " + xhr.readyState);
					}
				} catch( error ) {}
			}
		}

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
									console.log(' -- this.cleanseType == ' + this.cleanseType);

									if (this.cleanseType === undefined) {
										this.cleanseType = Svgi.CLEANSEPRIMARY;
									}

									var hex = fill.match(/([0-9A-F]{6}|[0-9A-F]{3})/)[0]

									switch (this.cleanseType) {
										case Svgi.CLEANSEPRIMARY: {
											// Replace all of the fill attributes with class attributes, and replace any neutral, or repeating
											// hexadecimal values with a class of "fill-neutral" and any other value with a class of "fill-color"
											// 11/05/2015 0256 PM - josiahb
											var isNeutral = isNeutral || (hex.substr(0, 3) === hex.substr(3, 3));
											    isNeutral = isNeutral || (hex.substr(0, 2) === hex.substr(2, 2) && hex.substr(2, 2) === hex.substr(4, 2));
													isNeutral = isNeutral || (hex.length === 3 && hex.substr(0, 1) === hex.substr(1, 2) && hex.substr(1, 2) === hex.substr(2, 3));

											console.log(' -- hex == ' + hex);
											console.log(' -- isNeutral == ' + isNeutral);

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

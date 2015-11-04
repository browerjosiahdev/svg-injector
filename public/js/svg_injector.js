/*
 * Copyright (c) 2015 Josiah James Brower
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.var console;
*/
if (typeof console === 'undefined') {
	console = {
		"log": function(v){},
		"dir": function(v){},
		"warn": function(v){}
	}
}

var svgi_svgData = Object.create(null);

function svgi_run() {
	var elements = document.querySelectorAll('[data-svg-src]');
	
	for (var inElements = 0; inElements < elements.length; inElements++) {
		var element = elements[inElements],
		    svgSrc  = element.getAttribute('data-svg-src');
			
		var id = svgi_generateId();
		svgi_svgData[id] = element;
		
		svgi_loadFile(svgSrc, function( xhr, data ){
			var svgElement = svgi_svgData[data.id],
			    response   = xhr.responseText;
			
			svgElement.innerHTML = svgElement.innerHTML + response.substr(response.indexOf('<svg'), response.length);
		}, {"id": id});
	}
}

function svgi_loadFile( src, callback, data /*optional*/ ) {
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
			if (xhr.readyState === 4) {
				if (data !== undefined) {
					callback(xhr, data);
				} else {
					callback(xhr);
				}
			} else {
				console.warn("svgi_loadFile('" + src + "') request failed: " + xhr.readyState);
			}
		}
		
		xhr.open('GET', src, true);
		xhr.send('');
	}
}

function svgi_generateId() {
	return '0000000000'.replace(/\d/g, function( char ) {
		return String.fromCharCode(97 + Math.floor(Math.random() * 26));
	});
}
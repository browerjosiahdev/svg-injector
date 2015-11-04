var console;
if (console === undefined) {
	console = {
		"log": function(v){},
		"dir": function(v){},
		"warn": function(v){}
	}
}

var svgData = Object.create(null);

function init() {
	var elements = document.querySelectorAll('[data-svg-src]');
	
	for (var inElements = 0; inElements < elements.length; inElements++) {
		var element = elements[inElements],
		    svgSrc  = element.getAttribute('data-svg-src');
			
		var id = generateId();
		svgData[id] = element;
		
		loadFile(svgSrc, function( xhr, data ){
			var svgElement = svgData[data.id],
			    response   = xhr.responseText;
			
			svgElement.innerHTML = svgElement.innerHTML + response.substr(response.indexOf('<svg'), response.length);
		}, {"id": id});
	}
}

function loadFile( src, callback, data /*optional*/ ) {
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
				console.warn("loadFile('" + src + "') request failed: " + xhr.readyState);
			}
		}
		
		xhr.open('GET', src, true);
		xhr.send('');
	}
}

function generateId() {
	return '0000000000'.replace(/\d/g, function( char ) {
		return String.fromCharCode(97 + Math.floor(Math.random() * 26));
	});
}

init();
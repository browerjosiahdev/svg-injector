function svgi_run() {
	var elements = document.querySelectorAll('[data-svg-src]');
	for (var inElements = 0; inElements < elements.length; inElements++) {
		var element    = elements[inElements],
		    svgSrc     = element.getAttribute('data-svg-src'),

    if (element.getAttribute('data-svg-injected') !== 'true') {
      svgi_loadFile(svgSrc, function( xhr, data ){
  			var svgElement = data.element,
  			    response   = xhr.responseText;

  			svgElement.innerHTML += response.substr(response.indexOf('<svg'), response.length);
        svgElement.setAttribute('data-svg-injected', 'true');
  		}, {"element": element});
    }
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
			if (xhr.readyState === 4 && xhr.status === 200) {
				if (data !== undefined) {
					callback(xhr, data);
				} else {
					callback(xhr);
				}
			} else {
				try {
					if (xhr.status === 404) {
						console.warn("svgi_loadFile('" + src + "') request failed: " + xhr.readyState);
					}
				} catch( error ) {}
			}
		}

		xhr.open('GET', src, true);
		xhr.send('');
	}
}

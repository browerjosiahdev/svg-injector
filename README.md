#SVG Injector
---------------------------------------------------------------
SVGI.js is a lightweight javascript library used to inject SVG code directly from .SVG files into DOM elements.

If a .SVG file is loaded into an img tag or by using the CSS "background-image" property you don't have access
to editing the fill color through JavaScript or CSS. By using this library you can define a "data-svg-src" attribute
on any DOM element, and it will load in the SVG content, and inject it directly into the DOM element so you can edit
colors, etc through JavaScript or CSS.

SVGI.js has been verified back to IE9--first version of IE that supported SVG content--all the way up to IE 11 and Edge.
It has also been verified on Chrome 46.0.2490.80, Firefox 41.0.2 and 42.0, and Safari Mobile for iOS 9.

Created by: Josiah James Brower
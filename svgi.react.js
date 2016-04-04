class SvgInjector extends React.Component {
    cleanse (svg) {
    	var hexFound = [];
    	return (
        	svg.substr(svg.indexOf('<svg'), svg.length)
    		.replace(/(<\!--(.*?)-->)|(<\!\[CDATA\[(.*?)\]\]>)/g, '')
    		.replace(/fill="#([0-9A-F]{6}|[0-9A-F]{3})"/g, (fill) => {
    			var hex = fill.match(/([0-9A-F]{6}|[0-9A-F]{3})/)[0]

    			switch (this.props.type) {
    				case 'primary': {
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
    				case 'unique': {
    					if (hexFound.indexOf(hex) > -1) {
    						return 'class="fill-' + hexFound.indexOf(hex) + '"';
    					} else {
    						hexFound.push(hex);

    						return 'class="fill-' + (hexFound.length - 1) + '"';
    					}

    					break;
    				}
    				case 'hex': {
    					return 'class="fill-' + hex + '"';
    				}
    			}
    		})
		);
    }
    componentDidMount () {
        if (this.props.src) {
            $.ajax({
                dataType: 'text',
                error: (err) => {
                    console.warn(`Error loading SVG: ${err}`);
                },
                success: (svg) => {
                    svg = this.cleanse(svg);
                    this.setState({ svg });
                },
                type: 'GET',
                url: this.props.src
            })
        }
    }
    constructor (props) {
        super(props);
        this.state = { svg: '' };
    }
    render () {
        return (
            <div
                className="svg-container"
                dangerouslySetInnerHTML={{
                    __html: this.state.svg
                }}
            />
        );
    }
}

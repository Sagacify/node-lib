There is a bug in the phantomjs-node module in which the path to the phantomjs binary isn't known.

To correct this, you have to modify one line in the node_modules/phantom/phantom.js file.

Replace :

				options.binary = 'phantomjs';

by :

				options.binary = '../../swiss_knife/seo/phantomjs-1.9.1-macosx/bin/phantomjs';

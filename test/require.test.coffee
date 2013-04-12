# Copyright (c) 2013 Rice University
#
# This software is subject to the provisions of the GNU AFFERO GENERAL PUBLIC LICENSE Version 3.0 (AGPL).
# See LICENSE.txt for details.

# # Configure test libraries
# This extends settings in the `require.config.coffee` file in the parent directory.
require.config

  # Assumes the HTML file that includes this is in test/ and the base is up one directory.
  baseUrl: '../'

  # If set to true, an error will be thrown if a script loads that does not call
  # `define()` or have a shim exports string value that can be checked.
  # See [Catching load failures in IE](http://requirejs.org/api.html) for more information.
  enforceDefine: true

  # Paths are relative to the parent directory
  paths:
    jasmine: 'lib/jasmine/jasmine'
    'jasmine-html': 'lib/jasmine/jasmine-html'
    'jquery-mockjax': 'lib/jquery-mockjax/jquery.mockjax'


  shim:
    jasmine:
      exports: 'jasmine'

    'jasmine-html':
      deps: ['jasmine']
      exports: 'jasmine'

    'jquery-mockjax':
      deps: ['jquery']
      exports: 'jQuery'

  config:
    # Enable warnings when using a string that isn't defined in the i18n js file
    i18n:
      warn: true

// Generated by CoffeeScript 1.6.3
(function() {
  define(['aloha', 'aloha/plugin', 'jquery', 'css!../../../oer/mathcheatsheet/css/mathcheatsheet.css'], function(Aloha, Plugin, $) {
    return Plugin.create("mathcheatsheet", {
      defaultSettings: {},
      init: function() {
        var help, opener;
        this.settings = $.extend(true, this.defaultSettings, this.settings);
        Aloha.require(['math/math-plugin'], function(MathPlugin) {
          MathPlugin.editor.find('.math-container').before('<div class="math-help-link">\n    <a title="Help using the math editor"\n       href="javascript:;">See help</a>\n</div>');
          MathPlugin.editor.find('.plaintext-label').after('<label class="cheatsheet-label checkbox inline">\n    <input id="cheatsheet-activator" type="checkbox" name="cheatsheet-activator"> Show cheat sheet\n</label>');
          MathPlugin.editor.find('#cheatsheet-activator').on('change', function(e) {
            if (jQuery(e.target).is(':checked')) {
              return jQuery('#math-cheatsheet').trigger("show");
            } else {
              return jQuery('#math-cheatsheet').trigger("hide");
            }
          });
          return MathPlugin.editor.find('.math-help-link a').on('click', function(e) {
            var $h, HELP_TEMPLATE;
            HELP_TEMPLATE = '<div class="popover math-editor-help-text"><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"></h3><div class="popover-content"></div></div></div>';
            $h = jQuery(this);
            $h.unbind('click');
            return jQuery.get(Aloha.settings.baseUrl + '/../plugins/oer/mathcheatsheet/lib/help.html', function(d) {
              return $h.popover({
                content: d,
                placement: 'right',
                html: true,
                template: HELP_TEMPLATE
              }).on('shown', function(e) {
                jQuery(e.target).data('popover').$tip.find('.math-editor-help-text-close').on('click', function() {
                  return jQuery(e.target).popover('hide');
                });
                return jQuery(e.target).data('popover').$tip.find('.cheatsheet-activator').on('click', function(e) {
                  return jQuery('#math-cheatsheet').trigger("toggle");
                });
              }).popover('show');
            });
          });
        });
        help = jQuery('<div id="math-cheatsheet">\n  <div class="cheatsheet-open">\n    <img src="' + Aloha.settings.baseUrl + '/../plugins/oer/mathcheatsheet/img/open-cheat-sheet-01.png' + '" alt="open" />\n</div>\n<div class="cheatsheet">\n  <div class="cheatsheet-close">\n    <img src="' + Aloha.settings.baseUrl + '/../plugins/oer/mathcheatsheet/img/close-cheat-sheet-01.png' + '" alt="open" />\n</div>\n<div class="cheatsheet-title"><strong>Math Cheat Sheet</strong>: Copy the "code" that matches the display you want. Paste it into the math entry box above. Adjust as needed.</div>\n<div class="cheatsheet-type">\n  <div><input type="radio" name="cs-math-type" id="cs_radio_ascii" value="ascii" checked="checked"> <label for="cs_radio_ascii">ASCIIMath</label></div>\n  <div><input type="radio" name="cs-math-type" id="cs_radio_latex" value="latex"> <label for="cs_radio_latex">LaTeX</label></div>\n</div>\n<div class="cheatsheet-values cheatsheet-ascii">\n  <table>\n    <tr>\n      <td><strong>Display:</strong></td>\n      <td><img src="' + Aloha.settings.baseUrl + '/../plugins/oer/mathcheatsheet/img/root2over2.gif' + '" /></td>\n<td><img src="' + Aloha.settings.baseUrl + '/../plugins/oer/mathcheatsheet/img/pirsq.gif' + '" /></td>\n<td><img src="' + Aloha.settings.baseUrl + '/../plugins/oer/mathcheatsheet/img/xltoet0.gif' + '" /></td>\n<td><img src="' + Aloha.settings.baseUrl + '/../plugins/oer/mathcheatsheet/img/infinity.gif' + '" /></td>\n<td><img src="' + Aloha.settings.baseUrl + '/../plugins/oer/mathcheatsheet/img/aplusxover2.gif' + '" /></td>\n<td><img src="' + Aloha.settings.baseUrl + '/../plugins/oer/mathcheatsheet/img/choose.gif' + '" /></td>\n<td><img src="' + Aloha.settings.baseUrl + '/../plugins/oer/mathcheatsheet/img/integral.gif' + '" /></td>\n<td><img src="' + Aloha.settings.baseUrl + '/../plugins/oer/mathcheatsheet/img/function-01.gif' + '" /></td>\n<td><img src="' + Aloha.settings.baseUrl + '/../plugins/oer/mathcheatsheet/img/matrix-01.gif' + '" /></td>\n<td><img src="' + Aloha.settings.baseUrl + '/../plugins/oer/mathcheatsheet/img/sin-01.gif' + '" /></td>\n<td><img src="' + Aloha.settings.baseUrl + '/../plugins/oer/mathcheatsheet/img/piecewise-01.gif' + '" /></td>\n<td><img src="' + Aloha.settings.baseUrl + '/../plugins/oer/mathcheatsheet/img/standard-product-01.gif' + '" /></td>\n        </tr>\n        <tr>\n          <td><strong>ASCIIMath code:</strong></td>\n          <td>sqrt(2)/2</td>\n          <td>pir^2  or  pi r^2</td>\n          <td>x &lt;= 0</td>\n          <td>x -&gt; oo</td>\n          <td>((A+X)/2 , (B+Y)/2)</td>\n          <td>sum_{k=0}^{s-1} ((n),(k))</td>\n          <td>int_-2^2 4-x^2dx</td>\n          <td>d/dxf(x)=lim_(h-&gt;0)(f(x+h)-f(x))/h</td>\n          <td>[[a,b],[c,d]]((n),(k))</td>\n          <td>sin^-1(x)</td>\n          <td>x/x={(1,if x!=0),(text{undefined},if x=0):}</td>\n          <td>((a*b))/c</td>\n        </tr>\n      </table>\n    </div>\n    <div class="cheatsheet-values cheatsheet-latex">TODO<br /><br /><br /><br /><br /><br /></div>\n    <div style="clear: both"></div>\n  </div>\n</div>');
        jQuery('body').append(help);
        opener = help.find('.cheatsheet-open');
        help.on('show', function(e) {
          opener.hide();
          return jQuery(this).find('.cheatsheet').slideDown("fast");
        });
        help.on('hide', function(e) {
          return jQuery(this).find('.cheatsheet').slideUp("fast", function() {
            return opener.show('slow');
          });
        });
        help.on('toggle', function(e) {
          if (jQuery(this).find('.cheatsheet').is(':visible')) {
            return jQuery(this).trigger('hide');
          } else {
            return jQuery(this).trigger('show');
          }
        });
        opener.on('click', function(e) {
          help.trigger('show');
          return jQuery('body > .popover .math-editor-dialog #cheatsheet-activator').prop('checked', true);
        });
        help.find('.cheatsheet-close').on("click", function(e) {
          help.trigger("hide");
          return jQuery('body > .popover .math-editor-dialog #cheatsheet-activator').prop('checked', false);
        });
        help.find('.cheatsheet-type input').on("change", function(e) {
          var sh;
          sh = jQuery(e.target).val();
          help.find('.cheatsheet-ascii').hide();
          help.find('.cheatsheet-latex').hide();
          return help.find(".cheatsheet-" + sh).show();
        });
        help.on('mousedown', function(e) {
          return e.stopPropagation();
        });
        jQuery('body').on('shown', '.math-element', function() {
          return jQuery('#math-cheatsheet .cheatsheet-open').show();
        });
        return jQuery('body').on('hide', '.math-element', function(e) {
          var p;
          p = jQuery(e.target).data('popover');
          if (p && p.$tip) {
            p.$tip.find('.math-help-link a').popover('destroy');
          }
          return jQuery('#math-cheatsheet .cheatsheet-open').hide();
        });
      },
      toString: function() {
        return "mathcheatsheet";
      }
    });
  });

}).call(this);

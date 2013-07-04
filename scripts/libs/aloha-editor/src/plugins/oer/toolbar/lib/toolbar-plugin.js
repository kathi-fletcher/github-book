// Generated by CoffeeScript 1.6.3
(function() {
  define(['jquery', 'aloha', 'aloha/plugin', 'ui/ui', 'PubSub'], function(jQuery, Aloha, Plugin, Ui, PubSub) {
    var $ROOT, adoptedActions, makeItemRelay, squirreledEditable;
    squirreledEditable = null;
    $ROOT = jQuery('body');
    makeItemRelay = function(slot) {
      var ItemRelay;
      ItemRelay = (function() {
        function ItemRelay() {}

        ItemRelay.prototype.show = function() {
          return $ROOT.find(".action." + slot).removeClass('hidden');
        };

        ItemRelay.prototype.hide = function() {};

        ItemRelay.prototype.setActive = function(bool) {
          if (!bool) {
            $ROOT.find(".action." + slot).removeClass('active');
          }
          if (bool) {
            return $ROOT.find(".action." + slot).addClass('active');
          }
        };

        ItemRelay.prototype.setState = function(bool) {
          return this.setActive(bool);
        };

        ItemRelay.prototype.enable = function(bool) {
          if (bool == null) {
            bool = true;
          }
          if ($ROOT.find(".action." + slot).is('.btn')) {
            if (!bool) {
              $ROOT.find(".action." + slot).attr('disabled', 'disabled');
            }
            if (bool) {
              return $ROOT.find(".action." + slot).removeAttr('disabled');
            }
          } else {
            if (!bool) {
              $ROOT.find(".action." + slot).parent().addClass('disabled');
            }
            if (bool) {
              return $ROOT.find(".action." + slot).parent().removeClass('disabled');
            }
          }
        };

        ItemRelay.prototype.disable = function() {
          return this.enable(false);
        };

        ItemRelay.prototype.setActiveButton = function(a, b) {
          return console && console.log("" + slot + " TODO:SETACTIVEBUTTON:", a, b);
        };

        ItemRelay.prototype.focus = function(a) {
          return console && console.log("" + slot + " TODO:FOCUS:", a);
        };

        ItemRelay.prototype.foreground = function(a) {
          return console && console.log("" + slot + " TODO:FOREGROUND:", a);
        };

        return ItemRelay;

      })();
      return new ItemRelay();
    };
    adoptedActions = {};
    Ui.adopt = function(slot, type, settings) {
      var evt;
      evt = $.Event('aloha.toolbar.adopt');
      $.extend(evt, {
        params: {
          slot: slot,
          type: type,
          settings: settings
        },
        component: null
      });
      PubSub.pub(evt.type, evt);
      if (evt.isDefaultPrevented()) {
        evt.component.adoptParent(toolbar);
        return evt.component;
      }
      adoptedActions[slot] = settings;
      return makeItemRelay(slot);
    };
    Aloha.bind('aloha-ready', function(event, editable) {
      return jQuery.each(adoptedActions, function(slot, settings) {
        var selector;
        selector = ".action." + slot;
        $ROOT.on('click', selector, function(evt) {
          var $target;
          evt.preventDefault();
          Aloha.activeEditable = Aloha.activeEditable || squirreledEditable;
          $target = jQuery(evt.target);
          if (!($target.is(':disabled') || $target.parent().is('.disabled'))) {
            this.element = this;
            return settings.click.bind(this)(evt);
          }
        });
        if (settings.preview) {
          $ROOT.on('mouseenter', selector, function(evt) {
            var $target;
            $target = jQuery(evt.target);
            if (!($target.is(':disabled') || $target.parent().is('.disabled'))) {
              return settings.preview.bind(this)(evt);
            }
          });
        }
        if (settings.unpreview) {
          return $ROOT.on('mouseleave', selector, function(evt) {
            var $target;
            $target = jQuery(evt.target);
            if (!($target.is(':disabled') || $target.parent().is('.disabled'))) {
              return settings.unpreview.bind(this)(evt);
            }
          });
        }
      });
    });
    /*
     register the plugin with unique name
    */

    return Plugin.create("toolbar", {
      init: function() {
        var changeHeading, toolbar;
        toolbar = this;
        changeHeading = function(evt) {
          var $el, $newEl, $oldEl, hTag, rangeObject;
          evt.preventDefault();
          $el = jQuery(this);
          hTag = $el.attr('data-tagname');
          rangeObject = Aloha.Selection.getRangeObject();
          if (rangeObject.isCollapsed()) {
            GENTICS.Utils.Dom.extendToWord(rangeObject);
          }
          Aloha.Selection.changeMarkupOnSelection(Aloha.jQuery("<" + hTag + "></" + hTag + ">"));
          jQuery('.currentHeading')[0].innerHTML = $el[0].innerHTML;
          $oldEl = Aloha.jQuery(rangeObject.getCommonAncestorContainer());
          $newEl = Aloha.jQuery(Aloha.Selection.getRangeObject().getCommonAncestorContainer());
          $newEl.addClass($oldEl.attr('class'));
          return $newEl.bind('click', headingFunc);
        };
        $ROOT.on('click', '.action.changeHeading', changeHeading);
        $ROOT.on('mousedown', ".action", function(evt) {
          return evt.stopPropagation();
        });
        Aloha.bind('aloha-editable-activated', function(event, data) {
          return squirreledEditable = data.editable;
        });
        return PubSub.sub('aloha.selection.context-change', function(data) {
          var active, button, currentHeading, el, h, headings, tagnames;
          el = data.range.commonAncestorContainer;
          button = $ROOT.find('.headings button').first();
          currentHeading = $ROOT.find('.headings .currentHeading');
          headings = $ROOT.find('.action.changeHeading');
          tagnames = [];
          headings.each(function() {
            return tagnames.push($(this).attr('data-tagname').toUpperCase());
          });
          h = $(el).parentsUntil('.aloha-editable').andSelf();
          h = h.filter(tagnames.join(',')).first();
          if (!h.length) {
            button.prop('disabled', true);
            return currentHeading.html(headings.first().text());
          } else {
            button.prop('disabled', false);
            active = $.grep(headings, function(elem, i) {
              return $(elem).attr('data-tagname').toUpperCase() === h[0].tagName;
            });
            if (active.length) {
              return currentHeading.html($(active[0]).html());
            } else {
              return currentHeading.html(headings.first().text());
            }
          }
        });
      },
      childVisible: function(childComponent, visible) {
        var evt;
        evt = $.Event('aloha.toolbar.childvisible');
        evt.component = childComponent;
        evt.visible = visible;
        return PubSub.pub(evt.type, evt);
      },
      childFocus: function(childComponent) {
        var evt;
        evt = $.Event('aloha.toolbar.childfocus');
        evt.component = childComponent;
        return PubSub.pub(evt.type, evt);
      },
      childForeground: function(childComponent) {
        var evt;
        evt = $.Event('aloha.toolbar.childforeground');
        evt.component = childComponent;
        return PubSub.pub(evt.type, evt);
      },
      /*
       toString method
      */

      toString: function() {
        return "toolbar";
      }
    });
  });

}).call(this);

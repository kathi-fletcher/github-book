// Generated by CoffeeScript 1.6.2
/*
----------------------
 State Machine
----------------------

(STATE_*) Denotes the initial State
(STATE_S) Denotes the "selected" State (when the cursor is in the element)
$el is the element (link, figure, title)
$tip is the popover element (tooltip)

There are 3 variables that are stored on each element;
[ isOpened, null/timer, isSelected ]


(STATE_*) [closed, _, _]
    |   |
    |   | (select via keyboard (left/right/up/down))
    |   |
    |   \----> (STATE_S) [opened, _, selected]
    |           |   |
    |           |   | (click elsewhere (not $el/$tip)
    |           |   |
    |           |   \----> (STATE_C) [closed, _, _]
    |           |
    |           | ($el/$tip.mouseenter)
    |           |
    |           \----> Nothing happens (unlike the other mouseenter case)
    |
    | ($el.mouseenter)
    |
    \----> (STATE_WC) [closed, timer, _] (waiting to show the popoup)
            |   |
            |   | ($el.mouseleave)
            |   |
            |   \----> (STATE_*)
            |
            | (... wait some time)
            |
            \----> (STATE_O) [opened, _, _] (hover popup displayed)
                    |   |
                    |   | (select via click or keyboard)
                    |   |
                    |   \---> (STATE_S) [opened, _, selected]
                    |
                    | ($el.mouseleave)
                    |
                    \----> (STATE_WO) [opened, timer, _] (mouse has moved away from $el but the popup hasn't disappeared yet) (POSFDGUOFDIGU)
                            |   |
                            |   | (... wait some time)
                            |   |
                            |   \---> (STATE_*) [closed, _, _]
                            |
                            | ($tip.mouseenter)
                            |
                            \---> (STATE_TIP) [opened, _, _]
                                    |
                                    | ($tip.mouseleave)
                                    |
                                    \---> (STATE_WO) [opened, timer, _]
                                            |   |
                                            |   | (... wait some time)
                                            |   |
                                            |   \----> (STATE_*) [closed, _, _]
                                            |
                                            \---> (STATE_TIP) [opened, _, _]
*/


(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  define(['aloha', 'jquery'], function(Aloha, jQuery) {
    var Bootstrap_Popover__position, Bootstrap_Popover_hide, Bootstrap_Popover_show, Helper, Popover, bindHelper, findMarkup, monkeyPatch, selectionChangeHandler;

    Bootstrap_Popover__position = function($tip, hint) {
      var actualHeight, actualPlacement, actualWidth, inside, placement, pos, tp;

      placement = (typeof this.options.placement === "function" ? this.options.placement.call(this, $tip[0], this.$element[0]) : this.options.placement);
      inside = /in/.test(placement);
      if (!$tip.parents()[0]) {
        $tip.appendTo((inside ? this.$element : document.body));
      }
      pos = this.getPosition(inside);
      actualWidth = $tip[0].offsetWidth;
      actualHeight = $tip[0].offsetHeight;
      actualPlacement = (inside ? placement.split(" ")[1] : placement);
      switch (actualPlacement) {
        case "bottom":
          if (hint) {
            tp = {
              top: hint.top + 10,
              left: hint.left - actualWidth / 2
            };
          } else {
            tp = {
              top: pos.top + pos.height,
              left: pos.left + pos.width / 2 - actualWidth / 2
            };
          }
          break;
        case "top":
          if (hint) {
            tp = {
              top: hint.top - actualHeight - 10,
              left: hint.left - actualWidth / 2
            };
          } else {
            tp = {
              top: pos.top - actualHeight - 10,
              left: pos.left + pos.width / 2 - actualWidth / 2
            };
          }
          break;
        case "left":
          if (hint) {
            tp = {
              top: hint.top - actualHeight / 2,
              left: hint.left - actualWidth
            };
          } else {
            tp = {
              top: pos.top + pos.height / 2 - actualHeight / 2,
              left: pos.left - actualWidth
            };
          }
          break;
        case "right":
          if (hint) {
            tp = {
              top: hint.top - actualHeight / 2,
              left: hint.left
            };
          } else {
            tp = {
              top: pos.top + pos.height / 2 - actualHeight / 2,
              left: pos.left + pos.width
            };
          }
      }
      if (actualPlacement === 'top' && tp.top < (Aloha.activeEditable && Aloha.activeEditable.obj.position().top || 0) + jQuery(window).scrollTop()) {
        actualPlacement = 'bottom';
        tp.top = pos.top + pos.height;
      }
      if (tp.left < 0) {
        tp.left = 10;
      } else if (tp.left + actualWidth > jQuery(window).width()) {
        tp.left = jQuery(window).width() - actualWidth - 10;
      }
      return $tip.css(tp).removeClass("top bottom left right").addClass(actualPlacement);
    };
    Bootstrap_Popover_show = function() {
      var $tip;

      if (this.hasContent() && this.enabled) {
        $tip = this.tip();
        this.setContent();
        if (this.options.animation) {
          $tip.addClass("fade");
        }
        $tip.css({
          top: 0,
          left: 0,
          display: "block"
        });
        Bootstrap_Popover__position.bind(this)($tip);
        $tip.addClass("in");
        /* Trigger the shown event*/

        return this.$element.trigger('shown-popover');
      }
    };
    Bootstrap_Popover_hide = function(originalHide) {
      return function() {
        this.$element.trigger('hide-popover');
        originalHide.bind(this)();
        this.$element.trigger('hidden-popover');
        return this;
      };
    };
    monkeyPatch = function() {
      var proto;

      console && console.warn('Monkey patching Bootstrap popovers so the buttons in them are clickable');
      proto = jQuery.fn.popover.Constructor.prototype;
      proto.show = Bootstrap_Popover_show;
      return proto.hide = Bootstrap_Popover_hide(proto.hide);
    };
    monkeyPatch();
    jQuery('body').on('mousedown', '.popover', function(evt) {
      return evt.stopPropagation();
    });
    Popover = {
      MILLISECS: 2000,
      register: function(cfg) {
        return bindHelper(cfg);
      }
    };
    Helper = (function() {
      function Helper(cfg) {
        this.stopAll = __bind(this.stopAll, this);
        this.hover = false;
        jQuery.extend(this, cfg);
        if (this.focus || this.blur) {
          console && console.warn('Popover.focus and Popover.blur are deprecated in favor of listening to the "shown-popover" or "hide-popover" events on the original DOM element');
        }
      }

      Helper.prototype.startAll = function(editable) {
        var $el, delayTimeout, makePopovers,
          _this = this;

        $el = jQuery(editable.obj);
        delayTimeout = function($self, eventName, ms) {
          return setTimeout(function() {
            return $self.trigger(eventName);
          }, ms);
        };
        makePopovers = function($nodes) {
          return $nodes.each(function(i, node) {
            var $node;

            $node = jQuery(node);
            if (!$node.data('popover')) {
              if (_this.focus) {
                $node.on('shown-popover', function() {
                  return _this.focus.bind($node[0])($node.data('popover').$tip);
                });
              }
              if (_this.blur) {
                $node.on('hide-popover', function() {
                  return _this.blur.bind($node[0])($node.data('popover').$tip);
                });
              }
              return $node.popover({
                html: true,
                placement: _this.placement || 'bottom',
                trigger: 'manual',
                content: function() {
                  return _this.populator.bind($node)($node, _this);
                }
              });
            }
          });
        };
        $el.on('show.bubble', this.selector, function(evt, hint) {
          var $node, that;

          $node = jQuery(evt.target);
          clearTimeout($node.data('aloha-bubble-timer'));
          $node.removeData('aloha-bubble-timer');
          if (!$node.data('aloha-bubble-visible')) {
            makePopovers($node);
            $node.popover('show');
            if (_this.markerclass) {
              $node.data('popover').$tip.addClass(_this.markerclass);
            }
            $node.data('aloha-bubble-visible', true);
          }
          that = $node.data('popover');
          if (that && that.$tip) {
            return Bootstrap_Popover__position.bind(that)(that.$tip, hint);
          }
        });
        $el.on('hide.bubble', this.selector, function(evt) {
          var $node;

          $node = jQuery(evt.target);
          clearTimeout($node.data('aloha-bubble-timer'));
          $node.removeData('aloha-bubble-timer');
          $node.data('aloha-bubble-selected', false);
          if ($node.data('aloha-bubble-visible')) {
            $node.popover('hide');
            return $node.removeData('aloha-bubble-visible');
          }
        });
        return $el.on('mouseenter.bubble', this.selector, function(evt) {
          var $node;

          $node = jQuery(evt.target);
          clearInterval($node.data('aloha-bubble-timer'));
          if (_this.hover) {
            $node.data('aloha-bubble-timer', delayTimeout($node, 'show', Popover.MILLISECS));
            return $node.on('mouseleave.bubble', function() {
              var $tip, err;

              if (!$node.data('aloha-bubble-selected')) {
                try {
                  $tip = $node.data('popover').$tip;
                } catch (_error) {
                  err = _error;
                  $tip = null;
                }
                if ($tip) {
                  $tip.on('mouseenter', function() {
                    return clearTimeout($node.data('aloha-bubble-timer'));
                  });
                  $tip.on('mouseleave', function() {
                    clearTimeout($node.data('aloha-bubble-timer'));
                    if (!$node.data('aloha-bubble-selected')) {
                      return $node.data('aloha-bubble-timer', delayTimeout($node, 'hide', Popover.MILLISECS / 2));
                    }
                  });
                }
                if (!$node.data('aloha-bubble-timer')) {
                  return $node.data('aloha-bubble-timer', delayTimeout($node, 'hide', Popover.MILLISECS / 2));
                }
              }
            });
          }
        });
      };

      Helper.prototype.stopAll = function(editable) {
        var $nodes;

        $nodes = jQuery(editable.obj).find(this.selector);
        this.stopOne($nodes);
        return jQuery(editable.obj).off('.bubble', this.selector);
      };

      Helper.prototype.stopOne = function($nodes) {
        $nodes.trigger('hide');
        $nodes.removeData('aloha-bubble-selected');
        return $nodes.popover('destroy');
      };

      return Helper;

    })();
    findMarkup = function(range, selector) {
      var filter;

      if (range == null) {
        range = Aloha.Selection.getRangeObject();
      }
      if (Aloha.activeEditable) {
        filter = function() {
          var $el;

          $el = jQuery(this);
          return $el.is(selector) || $el.parents(selector)[0];
        };
        return range.findMarkup(filter, Aloha.activeEditable.obj);
      } else {
        return null;
      }
    };
    selectionChangeHandler = function(rangeObject, selector) {
      var enteredLinkScope, foundMarkup;

      enteredLinkScope = false;
      if (Aloha.activeEditable != null) {
        foundMarkup = findMarkup(rangeObject, selector);
        enteredLinkScope = foundMarkup;
      }
      return enteredLinkScope;
    };
    bindHelper = function(cfg) {
      var enteredLinkScope, helper, insideScope;

      helper = new Helper(cfg);
      $.extend(cfg, {
        helper: helper
      });
      insideScope = false;
      enteredLinkScope = false;
      Aloha.bind('aloha-editable-activated', function(event, data) {
        return helper.startAll(data.editable);
      });
      Aloha.bind('aloha-editable-deactivated', function(event, data) {
        helper.stopAll(data.editable);
        return insideScope = false;
      });
      Aloha.bind('aloha-editable-created', function(evt, editable) {
        return editable.obj.on('hidden-popover', helper.selector, function() {
          return insideScope = false;
        });
      });
      Aloha.bind('aloha-selection-changed', function(event, rangeObject, originalEvent) {
        var $el, nodes;

        if (!(helper.populator && helper.selector)) {
          return;
        }
        $el = jQuery(rangeObject.getCommonAncestorContainer());
        if (!$el.is(helper.selector)) {
          $el = $el.parents(helper.selector).eq(0);
        }
        if (Aloha.activeEditable) {
          nodes = jQuery(Aloha.activeEditable.obj).find(helper.selector);
          nodes = nodes.not($el);
          nodes.trigger('hide');
          enteredLinkScope = selectionChangeHandler(rangeObject, helper.selector);
          if (insideScope !== enteredLinkScope) {
            insideScope = enteredLinkScope;
            if (!$el.is(helper.selector)) {
              $el = $el.parents(helper.selector).eq(0);
            }
            if (enteredLinkScope) {
              if (originalEvent && originalEvent.pageX) {
                $el.trigger('show', {
                  top: originalEvent.pageY,
                  left: originalEvent.pageX
                });
              } else {
                $el.trigger('show');
              }
              $el.data('aloha-bubble-selected', true);
              $el.off('.bubble');
              return event.stopPropagation();
            }
          }
        }
      });
      return helper;
    };
    return Popover;
  });

}).call(this);

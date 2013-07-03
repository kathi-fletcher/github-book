// Generated by CoffeeScript 1.3.3
(function() {

  require(['testutils'], function(TestUtils) {
    return Aloha.ready(function() {
      return Aloha.require(['popover'], function(Popover) {
        var MILLISECS, MS_LONG, MS_SHORT, POPOVER_VISIBLE, POPULATED, timeout;
        Popover.MILLISECS = 500;
        timeout = function(ms, func) {
          return setTimeout(func, ms);
        };
        MILLISECS = Popover.MILLISECS * 1.5;
        MS_SHORT = Popover.MILLISECS / 20;
        MS_LONG = MILLISECS * 2;
        POPULATED = null;
        POPOVER_VISIBLE = null;
        Popover.register({
          hover: true,
          selector: '.interesting',
          filter: function() {
            return Aloha.jQuery(this).hasClass('interesting');
          },
          focus: function() {
            return POPOVER_VISIBLE = true;
          },
          blur: function() {
            return POPOVER_VISIBLE = false;
          },
          populator: function($el, $popover) {
            return POPULATED = {
              dom: $el,
              popover: $popover
            };
          }
        });
        module('Popover (generic)', {
          setup: function() {
            this.edit = Aloha.jQuery('#edit');
            this.edit.html('');
            this.edit.aloha();
            return POPULATED = null;
          },
          teardown: function() {
            this.edit.mahalo();
            return POPULATED = null;
          }
        });
        asyncTest('element mouseenter', function() {
          var $boring, $interesting;
          expect(2);
          Aloha.jQuery('<span class="boring">boring</span><span class="interesting">interesting</span>').appendTo(this.edit);
          $boring = this.edit.find('.boring');
          $interesting = this.edit.find('.interesting');
          this.edit.focus();
          ok(!POPULATED, 'The popover hould not have displayed yet');
          $interesting.trigger('mouseenter');
          return timeout(MILLISECS, function() {
            ok(POPULATED, 'The popover should have popped up');
            return start();
          });
        });
        asyncTest('element click', function() {
          var $boring, $interesting;
          expect(2);
          Aloha.jQuery('<span class="boring">boring</span><span class="interesting">interesting</span>').appendTo(this.edit);
          $boring = this.edit.find('.boring');
          $interesting = this.edit.find('.interesting');
          TestUtils.setCursor(this.edit, $boring[0], 1);
          ok(!POPULATED, 'The popover should not have displayed yet');
          TestUtils.setCursor(this.edit, $interesting[0], 1);
          return timeout(MILLISECS, function() {
            ok(POPULATED, 'The popover should have popped up');
            return start();
          });
        });
        asyncTest('popover mouseenter (Make sure the popover does not hide when mouse moves onto the popover)', function() {
          var $boring, $interesting;
          expect(4);
          Aloha.jQuery('<span class="boring">boring</span><span class="interesting">interesting</span>').appendTo(this.edit);
          $boring = this.edit.find('.boring');
          $interesting = this.edit.find('.interesting');
          TestUtils.setCursor(this.edit, $boring[0], 1);
          ok(!POPULATED, 'The popover should not have displayed yet');
          $interesting.trigger('mouseenter');
          return timeout(MILLISECS, function() {
            ok(POPULATED, 'The popover should have popped up');
            ok(POPOVER_VISIBLE, 'The popover should be visible');
            $interesting.trigger('mouseleave');
            return timeout(MS_SHORT, function() {
              POPULATED.dom.data('popover').$tip.trigger('mouseenter');
              return timeout(MS_LONG, function() {
                ok(POPOVER_VISIBLE, 'Popover should still be visible');
                return start();
              });
            });
          });
        });
        return asyncTest('popover mouseenter2 (Make sure the popover DOES hide when mouse moves off the popover)', function() {
          var $boring, $interesting;
          expect(4);
          Aloha.jQuery('<span class="boring">boring</span><span class="interesting">interesting</span>').appendTo(this.edit);
          $boring = this.edit.find('.boring');
          $interesting = this.edit.find('.interesting');
          TestUtils.setCursor(this.edit, $boring[0], 1);
          ok(!POPULATED, 'The popover should not have displayed yet');
          $interesting.trigger('mouseenter');
          return timeout(MILLISECS, function() {
            ok(POPULATED, 'The popover should have popped up');
            ok(POPOVER_VISIBLE, 'The popover should be visible');
            $interesting.trigger('mouseleave');
            return timeout(MS_SHORT, function() {
              POPULATED.dom.data('popover').$tip.trigger('mouseenter');
              POPULATED.dom.data('popover').$tip.trigger('mouseleave');
              return timeout(MS_LONG, function() {
                ok(!POPOVER_VISIBLE, 'Popover should have disappeared');
                return start();
              });
            });
          });
        });
      });
    });
  });

}).call(this);

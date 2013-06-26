// Generated by CoffeeScript 1.6.2
(function() {
  define(['jquery'], function(jQuery) {
    this.Aloha = this.Aloha || {};
    this.Aloha.settings = {
      jQuery: jQuery,
      logLevels: {
        error: true,
        warn: true,
        info: false,
        debug: false
      },
      sidebar: {
        disabled: true
      },
      requireConfig: {
        paths: {
          jqueryui: '../../oerpub/js/jquery-ui-1.9.0.custom-aloha'
        }
      },
      errorhandling: true,
      plugins: {
        load: ['common/ui', 'oer/toolbar', 'oer/popover', 'oer/format', 'common/contenthandler', 'common/paste', 'common/block', 'common/list', 'oer/table', 'oer/math', 'extra/draganddropfiles', 'common/image', 'oer/assorted', 'oer/title', 'common/undo', 'oer/undobutton', 'oer/genericbutton', 'oer/semanticblock', 'oer/exercise', 'oer/note'],
        draganddropfiles: {
          upload: {
            config: {
              method: 'POST',
              url: '/resource',
              fieldName: 'upload',
              send_multipart_form: true,
              callback: function(resp) {
                var $img;

                if (!(resp.match(/^http/) || resp.match(/^\//) || resp.match(/^[a-z]/))) {
                  alert('You dropped a file and we sent a message to the server to do something with it.\nIt responded with some gibberish so we are showing you some other file to show it worked');
                  resp = 'src/test/AlohaEditorLogo.png';
                }
                $img = Aloha.jQuery('.aloha-image-uploading').add('#' + this.id);
                $img.attr('src', resp);
                $img.removeClass('aloha-image-uploading');
                return console.log('Updated Image src as a result of upload');
              }
            }
          }
        },
        block: {
          defaults: {
            '.default-block': {},
            figure: {
              'aloha-block-type': 'EditableImageBlock'
            }
          }
        }
      }
    };
    return this.Aloha;
  });

}).call(this);

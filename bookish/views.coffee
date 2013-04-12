# Copyright (c) 2013 Rice University
#
# This software is subject to the provisions of the GNU AFFERO GENERAL PUBLIC LICENSE Version 3.0 (AGPL).
# See LICENSE.txt for details.

# # Backbone Views
# Most views have the following properties:
#
# 1. Load a Handlebar template using the `hbs` plugin (see `define` below)
# 2. Attach listeners to the corresponding model (see `initialize` method and `events:`)
# 3. Attach jQuery listeners to the rendered template (see `onRender` methods)
# 4. Navigate to a different "page" (see `Controller.*` in the `jQuery.on` handlers)
#

#
define [
  'exports'
  'underscore'
  'backbone'
  'marionette'
  'jquery'
  'aloha'
  'bookish/controller'
  './languages'
  # Load the Handlebar templates
  'hbs!bookish/views/content-edit'
  'hbs!bookish/views/search-box'
  'hbs!bookish/views/search-results'
  'hbs!bookish/views/search-results-item'
  'hbs!bookish/views/modal-wrapper'
  'hbs!bookish/views/edit-metadata'
  'hbs!bookish/views/edit-roles'
  'hbs!bookish/views/language-variants'
  'hbs!bookish/views/aloha-toolbar'
  'hbs!bookish/views/sign-in-out'
  'hbs!bookish/views/book-edit'
  # Load internationalized strings
  'i18n!bookish/nls/strings'
  # `bootstrap` and `select2` add to jQuery and don't export anything of their own
  # so they are 'defined' _after_ everything else
  'bootstrap'
  'select2'
  # Include CSS icons used by the toolbar
  'css!font-awesome'
], (exports, _, Backbone, Marionette, jQuery, Aloha, Controller, Languages, CONTENT_EDIT, SEARCH_BOX, SEARCH_RESULT, SEARCH_RESULT_ITEM, DIALOG_WRAPPER, EDIT_METADATA, EDIT_ROLES, LANGUAGE_VARIANTS, ALOHA_TOOLBAR, SIGN_IN_OUT, BOOK_EDIT, __) ->

  # **FIXME:** Move this delay into a common module so the mock AJAX code can use them too
  DELAY_BEFORE_SAVING = 3000

  # Select2 is a multiselect UI library.
  # It queries the webserver to provide search results as you type
  #
  # Given a `url` to query (like `/users` or `/keywords`) this returns a config
  # used when binding select2 to an input.
  SELECT2_AJAX_HANDLER = (url) ->
    quietMillis: 500
    url: url
    dataType: 'json'
    data: (term, page) ->
      q: term # search term
    # parse the results into the format expected by Select2
    results: (data, page) ->
      return {
        results: ({id:id, text:id} for id in data)
      }

  # Make a multiselect widget sortable using jQueryUI.
  # Unfortunately jQueryUI is not available until Aloha finishes loading
  # so postpone making it sortable until `Aloha.ready`
  SELECT2_MAKE_SORTABLE = ($el) ->
    Aloha.ready ->
      $el.select2('container')
      .find('ul.select2-choices')
      .sortable
        cursor: 'move'
        containment: 'parent'
        start: ->  $el.select2 'onSortStart'
        update: -> $el.select2 'onSortEnd'


  # **FIXME:** Move these subjects to a common module so the mock code can use them and can be used elsewhere
  METADATA_SUBJECTS = ['Arts', 'Mathematics and Statistics', 'Business',
    'Science and Technology', 'Humanities', 'Social Sciences']

  # Given the language list in [languages.coffee](languages.html)
  # this reorganizes them so they can be shown in a dropdown.
  LANGUAGES = [{code: '', native: '', english: ''}]
  for languageCode, value of Languages.getLanguages()
    value = jQuery.extend({}, value)  # Clone the value.
    jQuery.extend(value, {code: languageCode})
    LANGUAGES.push(value)


  # ## Search Result Views (workspace)
  #
  # A list of search results (stubs of models only containing an icon, url, title)
  # need a generic view for an item.
  #
  # Since we don't really distinguish between a search result view and a workspace/collection/etc
  # just consider them the same.
  exports.SearchResultsItemView = Marionette.ItemView.extend
    tagName: 'tr'
    template: SEARCH_RESULT_ITEM
    onRender: ->
      @$el.on 'click', => Controller.editModel(@model)

    # Add the hasChanged bit to the resulting JSON so the template can render an asterisk
    # if this piece of content has unsaved changes
    templateHelpers: ->
      # Figure out if the model was just fetched (all the changed attributes used to be 'undefined')
      # or if the attributes did actually change

      # Delete any properties that were null before
      changes = @model.changedAttributes() or {}
      (delete changes[attribute] if not @model.previous(attribute)) for attribute of changes

      # If there was anything that was actually changed (not null before) then mark the save button.
      return {hasChanged: _.keys(changes).length}


  # This can also be thought of as the Workspace view
  exports.SearchResultsView = Marionette.CompositeView.extend
    template: SEARCH_RESULT
    itemViewContainer: 'tbody'
    itemView: exports.SearchResultsItemView

    initialize: ->
      @listenTo @collection, 'reset',   => @render()

  # The search box. Changing the text will cause the underlying collection to filter
  # and fire off `add/remove` events.
  exports.SearchBoxView = Marionette.ItemView.extend
    template: SEARCH_BOX
    events:
      'keyup #search': 'setFilter'
      'change #search': 'setFilter'
    initialize: ->
      throw 'BUG: You must wrap the collection in a FilterableCollection' if not @model.setFilter
    setFilter: (evt) ->
      $searchBox = jQuery(@$el).find '#search'
      filterStr = $searchBox.val()
      filterStr = '' if filterStr.length < 2
      @model.setFilter filterStr


  # A generic way of editing a HTML key in a model using the Aloha Editor
  exports.AlohaEditView = Marionette.ItemView.extend
    # **NOTE:** This template is not wrapped in an element
    template: () -> throw 'You need to specify a template, modelKey, and optionally alohaOptions'
    modelKey: null
    alohaOptions: null

    initialize: ->

      # Update the view when the content is done loading
      @listenTo @model, 'change:_done', (model, value, options) => @render()

      @listenTo @model, "change:#{@modelKey}", (model, value, options) =>
        return if options.internalAlohaUpdate

        alohaId = @$el.attr('id')
        # Sometimes Aloha hasn't loaded up yet
        if alohaId and @$el.parents()[0]
          alohaEditable = Aloha.getEditableById(alohaId)
          editableBody = alohaEditable.getContents()
          alohaEditable.setContents(value) if value != editableBody
        else
          @$el.empty().append(value)

    onRender: ->
      # Wait until Aloha is started before loading MathJax.
      MathJax?.Hub.Configured()

      if @model.get '_done'
        # Once Aloha has finished loading enable
        @$el.addClass('disabled')
        Aloha.ready =>
          @$el.aloha(@alohaOptions)
          @$el.removeClass('disabled')

        # Auto save after the user has stopped making changes
        updateModelAndSave = =>
          alohaId = @$el.attr('id')
          # Sometimes Aloha hasn't loaded up yet
          # Only save when the editable has changed
          if alohaId
            alohaEditable = Aloha.getEditableById(alohaId)
            editableBody = alohaEditable.getContents()
            # Change the contents but do not update the Aloha editable area
            @model.set @modelKey, editableBody, {internalAlohaUpdate: true}

        # Grr, the `aloha-smart-content-changed` can only be listened to globally
        # (via `Aloha.bind`) instead of on each editable.
        #
        # This is problematic when we have multiple Aloha editors on a page.
        # Instead, autosave after some period of inactivity.
        @$el.on 'blur', updateModelAndSave



  # ## Edit Content Body
  exports.ContentEditView = exports.AlohaEditView.extend
    # **NOTE:** This template is not wrapped in an element
    template: CONTENT_EDIT
    modelKey: 'body'

  # Edit the title field of a piece of Content
  exports.TitleEditView = exports.AlohaEditView.extend
    # **NOTE:** This template is not wrapped in an element
    template: (serialized_model) -> "#{serialized_model.title or 'Untitled'}"
    modelKey: 'title'
    tagName: 'span' # override the default tagName of `div` so titles can be edited inline.


  # Parse in (from handlebars) the Aloha Toolbar and buttons
  exports.ContentToolbarView = Marionette.ItemView.extend
    template: ALOHA_TOOLBAR

    onRender: ->
      # Wait until Aloha is started before enabling the toolbar
      @$el.addClass('disabled')
      Aloha.ready =>
        @$el.removeClass('disabled')

  # ### Content Metadata

  exports.MetadataEditView = Marionette.ItemView.extend
    template: EDIT_METADATA

    # Bind methods onto jQuery events that happen in the view
    events:
      'change *[name=language]': '_updateLanguageVariant'

    initialize: ->
      @listenTo @model, 'change:language', => @_updateLanguage()
      @listenTo @model, 'change:subjects', => @_updateSubjects()
      @listenTo @model, 'change:keywords', => @_updateKeywords()

    # Update the UI when the language changes.
    # Also called during initial render
    _updateLanguage: () ->
      language = @model.get('language') or ''
      [lang] = language.split('-')
      @$el.find("*[name=language]").select2('val', lang)
      @_updateLanguageVariant()

    _updateLanguageVariant: () ->
      $language = @$el.find('*[name=language]')
      language = @model.get('language') or ''
      [lang, variant] = language.split('-')
      if $language.val() != lang
        lang = $language.val()
        variant = null
      $variant = @$el.find('*[name=variantLanguage]')
      $label = @$el.find('*[for=variantLanguage]')
      variants = []
      for code, value of Languages.getCombined()
        if code[..1] == lang
          jQuery.extend(value, {code: code})
          variants.push(value)
      if variants.length > 0
        # Generate the language variants dropdown.
        $variant.removeAttr('disabled')
        $variant.html(LANGUAGE_VARIANTS('variants': variants))
        $variant.find("option[value=#{language}]").attr('selected', true)
        $label.removeClass('hidden')
        $variant.removeClass('hidden')
      else
        $variant.empty().attr('disabled', true)
        $variant.addClass('hidden')
        $label.addClass('hidden')

    # Helper method to populate a multiselect input
    _updateSelect2: (key) ->
      @$el.find("*[name=#{key}]").select2('val', @model.get key)

    # Update the View with new subjects selected
    _updateSubjects: -> @_updateSelect2 'subjects'

    # Update the View with new keywords selected
    _updateKeywords: -> @_updateSelect2 'keywords'

    # Populate some of the dropdowns like language and subjects.
    # Also, initialize the select2 widget on elements
    onRender: ->
      # Populate the Language dropdown and Subjects checkboxes
      $languages = @$el.find('*[name=language]')
      for lang in LANGUAGES
        $lang = jQuery('<option></option>').attr('value', lang.code).text(lang.native)
        $languages.append($lang)

      $languages.select2
        placeholder: __('Select a language')

      $subjects = @$el.find('*[name=subjects]')
      $subjects.select2
        tags: METADATA_SUBJECTS
        tokenSeparators: [',']
        separator: '|' # String used to delimit ids in $('input').val()

      # Enable multiselect on certain elements
      $keywords = @$el.find('*[name=keywords]')
      $keywords.select2
        tags: @model.get('keywords') or []
        tokenSeparators: [',']
        separator: '|' # String used to delimit ids in $('input').val()
        #ajax: SELECT2_AJAX_HANDLER(URLS.KEYWORDS)
        initSelection: (element, callback) ->
          data = []
          _.each element.val().split('|'), (str) -> data.push {id: str, text: str}
          callback(data)

      # Select the correct language (Handlebars can't do that)
      @_updateLanguage()
      @_updateSubjects()
      @_updateKeywords()

      @delegateEvents()

    # This is used by `DialogWrapper` which offers a "Save" and "Cancel" buttons
    attrsToSave: () ->
      language = @$el.find('*[name=language]').val()
      variant = @$el.find('*[name=variantLanguage]').val()
      language = variant or language
      # subjects could be the empty string in which case it would be set to `[""]`
      subjects = (kw for kw in @$el.find('*[name=subjects]').val().split('|'))
      subjects = [] if '' is subjects[0]
      # Keywords could be the empty string in which case it would be set to `[""]`
      keywords = (kw for kw in @$el.find('*[name=keywords]').val().split('|'))
      keywords = [] if '' is keywords[0]

      return {
        language: language
        subjects: subjects
        keywords: keywords
      }


  exports.RolesEditView = Marionette.ItemView.extend
    template: EDIT_ROLES

    onRender: ->
      $authors = @$el.find('*[name=authors]')
      $copyrightHolders = @$el.find('*[name=copyrightHolders]')

      $authors.select2
        # **FIXME:** The authors should be looked up instead of being arbitrary text
        tags: @model.get('authors') or []
        tokenSeparators: [',']
        separator: '|'
        #ajax: SELECT2_AJAX_HANDLER(URLS.USERS)
      $copyrightHolders.select2
        tags: @model.get('copyrightHolders') or []
        tokenSeparators: [',']
        separator: '|'
        #ajax: SELECT2_AJAX_HANDLER(URLS.USERS)

      SELECT2_MAKE_SORTABLE $authors
      SELECT2_MAKE_SORTABLE $copyrightHolders

      # Populate the multiselect widgets with data from the backbone model
      @_updateAuthors()
      @_updateCopyrightHolders()

      @delegateEvents()

    _updateAuthors: -> @$el.find('*[name=authors]').select2 'val', (@model.get('authors') or [])
    _updateCopyrightHolders: -> @$el.find('*[name=copyrightHolders]').select2 'val', (@model.get('copyrightHolders') or [])

    attrsToSave: () ->
      # Grab the authors from the multiselect input element.
      # They are separated with a `|` character defined when select2 was configured
      authors = (kw for kw in @$el.find('*[name=authors]').val().split('|'))
      copyrightHolders = (kw for kw in @$el.find('*[name=copyrightHolders]').val().split('|'))

      return {
        authors: authors
        copyrightHolders: copyrightHolders
      }



  # ## DialogWrapper
  # This class wraps a view in a div and only causes changes when
  # the 'Save' button is clicked.
  #
  # Looks like phil came to the same conclusion as the author of Marionette
  # (Don't make a Bootstrap Modal in a `Backbone.View`):
  # [http://lostechies.com/derickbailey/2012/04/17/managing-a-modal-dialog-with-backbone-and-marionette/]
  exports.DialogWrapper = Marionette.ItemView.extend
    template: DIALOG_WRAPPER
    onRender: ->
      @options.view.render()
      @$el.find('.dialog-body').append @options.view.$el

      # Fire a cancel event when the cancel button is pressed
      @$el.on 'click', '.cancel', => @trigger 'cancelled'

      # Trigger the `model.save` when the save button is clicked
      # using the attributes from `@options.view.attrsToSave()`
      @$el.on 'click', '.save', (evt) =>
        evt.preventDefault()
        attrs = @options.view.attrsToSave()

        @options.view.model.save attrs,
          success: (res) =>
            # Trigger a 'sync' because if 'success' is provided 'sync' is not triggered
            @options.view.model.trigger('sync')
            @trigger 'saved'

          error: (res) =>
            alert('Something went wrong when saving: ' + res)


  # ## Auth View
  # The top-right of each page should have either:
  #
  # 1. a Sign-up/Login link if not logged in
  # 2. a logoff link with the current user name if logged in
  #
  # This view updates when the login state changes
  exports.AuthView = Marionette.ItemView.extend
    template: SIGN_IN_OUT
    events:
      'click #sign-in': 'signIn'
      'submit #sign-out': 'signOut'
    onRender: ->
      @listenTo @model, 'change', => @render()
      @listenTo @model, 'change:userid', => @render()

    signIn: ->
      # The browser will go to the login page because `#sign-in` is a link

    # Clicking on the link will redirect to the logoff page
    # Before it does, update the model
    signOut: -> @model.signOut()

  # ## Book Editing


  # Use this to generate HTML with extra divs for Drag-and-Drop zones.
  #
  # To update the Book model when a `drop` occurs we convert the new DOM into
  # a JSON tree and set it on the model.
  #
  # **FIXME:** Instead of a JSON tree this Model should be implemented using a Tree-Like Collection that has a `.toJSON()` and methods like `.insertBefore()`
  exports.BookEditView = Marionette.ItemView.extend
    template: BOOK_EDIT
    events:
      'click .edit-content': 'editModel'
      'click #nav-close': 'closeView'
      'click #add-section': 'prependSection'
      'click #add-content': 'prependContent'

    initialize: ->
      @listenTo @model, 'all', => @render()
    prependSection: -> @model.prependNewContent {title: 'Untitled Section'}
    prependContent: -> @model.prependNewContent {title: 'Untitled Content'}, 'text/x-module'

    closeView: -> Controller.hideSidebar()

    editModel: (evt) ->
      evt.preventDefault()
      href = jQuery(evt.target).parents('li').first().children('span').attr 'data-id'
      # The id may point to an element inside the HTML document
      [path, id] = href.split('#')
      model = @model.manifest.get path
      Controller.editModel model, id
    onRender: ->
      # Since we use jqueryui's draggable which is loaded when Aloha loads
      # delay until Aloha is finished loading
      Aloha.ready =>
        model = @model # keep reference to model for drop event
        @$el.find('.editor-node').draggable
          revert: 'invalid'
          helper: (evt) ->
            $clone = jQuery(evt.target).clone(true)
            $clone.children('ol').remove()
            $clone
        @$el.find('.editor-drop-zone').droppable
          accept: '.editor-node'
          activeClass: 'editor-drop-zone-active'
          hoverClass: 'editor-drop-zone-hover'
          drop: (evt, ui) =>
            # Possible drop cases:
            #
            # - On the node
            # - Before the node
            # - After the node

            $drag = ui.draggable
            $drop = jQuery(evt.target)
            $root = $drop.parents('nav[data-type="toc"]')
            $li = $drop.parent()

            # Perform all of these DOM cleanup events once jQueryUI is finished with its events
            delay = =>
              $drag.parent().remove() if $drag.parent().children().length == 1

              if $drop.hasClass 'editor-drop-zone-before'
                # If `$drag` is the only child in a `<ol>` then remove the `ol`
                $drag.insertBefore $li
              if $drop.hasClass 'editor-drop-zone-after'
                $drag.insertAfter $li
              if $drop.hasClass 'editor-drop-zone-in'
                # create an `ol` in the drop target if necessary
                $li.append '<ol></ol>' if not $li.children('ol')[0]
                $ol = $li.children('ol')
                $ol.append $drag

              # Serialize it back to HTML
              # Remove the drag node (a clone of the element that's being dragged)
              $root.find('.ui-draggable-dragging').remove()
              $root.find('*').removeClass('editor-drop-zone-in ui-droppable ui-draggable')

              @model.set 'navTreeStr', JSON.stringify @model.parseNavTree($root).children

            setTimeout delay, 10

  return exports

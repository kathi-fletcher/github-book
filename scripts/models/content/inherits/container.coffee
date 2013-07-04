define [
  'jquery'
  'underscore'
  'backbone'
  'cs!models/content/inherits/base'
], ($, _, Backbone, BaseModel) ->

  # Backbone Collection used to store a container's contents
  class Container extends Backbone.Collection
    initialize: () ->
      @titles = []

    findMatch: (model) ->
      return _.find @titles, (obj) ->
        return model.id is obj.id or model.cid is obj.id

    getTitle: (model) ->
      if model.unique
        return model.get('title')

      return @findMatch(model)?.title or model.get('title')

    setTitle: (model, title) ->
      if model.unique
        model.set('title', title)
      else
        match = @findMatch(model)

        if match
          match.title = title
        else
          @titles.push
            id: model.id or model.cid
            mediaType: model.mediaType
            title: title

        model.trigger('change')

      return @

  # Helper function to parse html-encoded data
  parseHTML = (html) ->
    if typeof html isnt 'string' then return []

    results = []

    $(html).find('> ol').find('> li').each (index, el) ->
      $el = $(el)
      $node = $el.children().eq(0)

      if $node.is('a')
        id = $node.attr('href')
        title = $node.text()

      # Only remember the title if it's overridden
      if not title or $node.hasClass('autogenerated-text')
        results.push({id: id})
      else
        results.push({id: id, title: title})

    return results

  return class ContainerModel extends BaseModel
    mediaType: 'application/vnd.org.cnx.folder'
    accept: []
    unique: true
    branch: true
    expanded: false

    toJSON: () ->
      json = super()

      contents = @getChildren?().toArray() or []

      json.contents = []
      _.each contents.models, (item) ->
        obj = {}
        title = contents.getTitle?(item) or contents.get 'title'
        if item.id then obj.id = item.id
        if title then obj.title = title

        json.contents.push(obj)

      return json

    accepts: (mediaType) ->
      if (typeof mediaType is 'string')
        return _.indexOf(@accept, mediaType) is not -1

      return @accept

    initialize: (attrs) ->
      # Ensure there is always a Collection in `contents`
      @get('contents') || @set('contents', new Container(), {parse:true})

      @load()

    _loadComplex: (promise) ->
      # This container is not considered loaded until the ALL content container
      # has finished loading.
      # Weird.
      # TODO: Untangle this dependency later
      newPromise = new $.Deferred()

      # Since this is a nested require and `.parse()` depends on all content being loaded
      # We need to squirrel `cs!collections/content` onto the object so parse can use it
      require ['cs!collections/content'], (allContent) =>
        @_ALL_CONTENT_HACK = allContent
        allContent.load().done () =>
          newPromise.resolve(@)

      return newPromise

    getChildren: () -> @get('contents')

    addChild: (model, at=0) ->
      children = @getChildren()

      # If `model` is already in `@getChildren()` then we are reordering.
      # By removing the model, we need to adjust the index where it will be
      # added.
      if children.contains(model)
        if children.indexOf(model) < at
          at = at - 1
        children.remove(model)

      children.add(model, {at:at})

    parse: (json) ->
      contents = json.body or json.contents
      if contents
        if not _.isArray(contents)
          contents = parseHTML(contents)

      else throw 'BUG: Container must contain either a contents or a body'

      # Look up each entry in Contents
      contentsModels = _.map contents, (item) =>
        @_ALL_CONTENT_HACK.get({id: item.id})
      json.contents = new Container(contentsModels)

      return json

    # Change the content view when editing this
    contentView: (callback) ->
      require ['cs!views/workspace/content/search-results'], (View) =>
        view = new View({collection: @getChildren()})
        callback(view)

    # Change the sidebar view when editing this
    sidebarView: (callback) ->
      require ['cs!views/workspace/sidebar/toc'], (View) =>
        view = new View
          collection: @getChildren()
          model: @
        callback(view)

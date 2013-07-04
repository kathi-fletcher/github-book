define ['cs!gh-book/toc-node'], (TocNode) ->

  class TocPointerNode extends TocNode
    mediaType: 'application/BUG-mediaType-not-set' # This will get overridden to be whatever this node points to
    accept: []      # This will get overridden to be whatever this node points to

    initialize: (options) ->
      throw 'BUG: Missing constructor options' if not options
      throw 'BUG: Missing model this points to' if not options.model

      # Shadow properties/events on the original model
      @model = options.model
      @mediaType = @model.mediaType
      @accept = @model.accept

      # Should be used ONLY for serializing to HTML tree
      @id = @model.id

      @model.on 'all', () => @trigger.apply @, arguments

      options.title = options.title or @model.get 'title'
      super(options)

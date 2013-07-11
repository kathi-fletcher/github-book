define [
  'jquery'
  'underscore'
  'backbone'
  'marionette'
  'cs!collections/content'
  'cs!views/workspace/sidebar/toc-branch'
  'hbs!templates/workspace/sidebar/toc'
], ($, _, Backbone, Marionette, content, TocBranchView, tocTemplate) ->

  return class TocView extends Marionette.CompositeView
    template: tocTemplate
    itemView: TocBranchView
    itemViewContainer: 'ol'

    initialize: (options) ->
      if options?.collection
        @collection = options.collection
        @showNodes = true
      else
        @collection = content

    # Override Marionette's showCollection()
    showCollection: () ->
      if @collection.branches
        data = @collection.branches()
      else
        data = @collection.models

      _.each data, (item, index) =>
        @addItemView(item, TocBranchView, index)

    # We also need to override addItemView()
    addItemView: (item, ItemView, index) ->
      if item.branch or @showNodes
        super(item, ItemView, index)

    events:
      'click .editor-content-title': 'changeTitle'

    changeTitle: () ->
      title = prompt('Enter a new Title', @model.get('title'))
      if title then @model.set('title', title)
      @render()

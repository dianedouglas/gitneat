// An example Backbone application contributed by
// [Jérôme Gravel-Niquet](http://jgn.me/). This demo uses a simple
// [LocalStorage adapter](backbone-localstorage.html)
// to persist Backbone models within your browser.

// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){

  // Scene Model
  // ----------

  var Scene = Backbone.Model.extend({

    // Default attributes for the todo item.
    defaults: function() {
      return {
        instructions: "Here is some default text.",
        img_class: "img",
        scene_number: 0,
        order: Scenes.nextOrder()
      };
    }

  });

  // Scene Collection
  // ---------------


  var SceneList = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: Scene,

    // Save all of the todo items under the `"todos-backbone"` namespace.
    localStorage: new Backbone.LocalStorage("xy-backbone"),

    // We keep the Todos in sequential order, despite being saved by unordered
    // GUID in the database. This generates the next order number for new items.
    nextOrder: function() {
      if (!this.length) return 1;
      return this.last().get('order') + 1;
    },

    // Todos are sorted by their original insertion order.
    comparator: 'order'

  });

  // Create our global collection of **Scenes**.
  var Scenes = new SceneList;

  // Scene Item View
  // --------------

  // The DOM element for a scene item...
  var SceneView = Backbone.View.extend({

    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#item-template').html()),

    // The DOM events specific to an item.
    // here we would specify the click area to show the next scene.
    events: {
      "click .view"   : "clickedInstructions"
    },

    // The TodoView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Todo** and a **TodoView** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },

    // Re-render the titles of the todo item.
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },

    // Toggle the `"done"` state of the model.
    clickedInstructions: function() {
      var image_id = String(this.model.get('scene_number') + 1);
      this.clear();
      Scenes.create({
        instructions: script[this.model.get('scene_number') + 1],
        img_class: "img" + image_id,
        scene_number: this.model.get('scene_number') + 1
      });
    },

    // Remove the item, destroy the model.
    clear: function() {
      this.model.destroy();
    }

  });

  // The Application
  // ---------------

  // Our overall **AppView** is the top-level piece of UI.
  var AppView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#todoapp"),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      "keypress #new-todo":  "createOnEnter"
    },

    // At initialization we bind to the relevant events on the `Todos`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos that might be saved in *localStorage*.
    initialize: function() {

      this.input = this.$("#new-todo");

      this.listenTo(Scenes, 'add', this.addOne);
      this.listenTo(Scenes, 'reset', this.addAll);
      this.listenTo(Scenes, 'all', this.render);
      this.main = $('#main');

      Scenes.fetch();
    },

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function() {
      // console.log("app render.")
    },

    // Add a single todo item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(scene) {
      views.push(new SceneView({model: scene}));
      this.$("#todo-list").append(views[views.length - 1].render().el);
      console.log(views[views.length - 1].render().el);
    },

    // Add all items in the **Todos** collection at once.
    addAll: function() {
      Scenes.each(this.addOne, this);
    },

    // If you hit return in the main input field, create new **Todo** model,
    // persisting it to *localStorage*.
    // createOnEnter: function(e) {
    //   if (e.keyCode != 13) return;
    //   if (!this.input.val()) return;

    //   Scenes.create({instructions: this.input.val()});
    //   this.input.val('');
    // }
  });

  var script = ["Welcome to Git Neat!", "How are you?", "I am fine."];
  var views = [];
  var App = new AppView;
  views.forEach(function(view){
    view.clear();
  })
  Scenes.create({
    instructions: script[0],
    img_class: "img0",
    scene_number: 0
  });
});

var app = {};

app.Users = Backbone.Model.extend({
  defaults:{
    firstName: '',
    lastName: '',
    eMail: ''
  },
  validate: function(attrs){
    var email_filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if(!email_filter.test(attrs.eMail)){
     return;
    }
  }
  
});

app.UserList = Backbone.Collection.extend({
  model: app.Users,
  localStorage: new Store('backbone-users')
});

app.userList = new app.UserList();

app.UserView = Backbone.View.extend({
  tagName: 'div',
  template: _.template($('#user-template').html()),
  render: function(){
    this.$el.html(this.template(this.model.toJSON()));
    this.firstName = this.$('#first_edit');
    this.lastName = this.$('#last_edit');
    this.eMail = this.$('#email_edit');
    this.remove = this.$('.destroy');
    return this;
  },
  initialize: function(){
    this.model.on('change', this.render, this);
    this.model.on('destroy', this.remove, this);
  },
  events: {
    'dblclick label' : 'edit',
    'keypress .edit' : 'updateOnEnter',
    'blur .edit' : 'close',
    'click .destroy' : 'destroy'
  },
  edit: function(){
    this.$el.addClass('editing');
    this.remove.toggleClass('hidden');
    
  },
  close: function(){
    var value = this.firstName.val().trim();
    var value2 = this.lastName.val().trim();
    var value3 = this.eMail.val().trim();
        
    if(value){
      this.model.save({firstName: value, lastName: value2, eMail:value3});
      this.$el.removeClass('editing');
    }
    
  },
  updateOnEnter: function(e){
    if(e.which == 13){
      this.close();
    }
  },
  destroy: function(){
    this.model.destroy();
  }
});

app.AppView = Backbone.View.extend({
  el: '#userlistapp',
  initialize: function(){
    this.firstName = this.$('#firstname');
    this.lastName = this.$('#lastname');
    this.email = this.$('#email');
    app.userList.on('add', this.addOne, this);
    app.userList.on('reset', this.addAll, this);
    app.userList.fetch();
  },
  events: {
    'keypress .entry': 'createUserOnEnter',
    'click #enter' : 'createUserOnClick'
  },
  createUserOnClick: function(){
    app.userList.create(this.newAttributes());
    this.firstName.val('');
    this.lastName.val('');
    this.email.val('');
},
  createUserOnEnter: function(e){
    if (e.which !== 13 || !this.firstName.val().trim()){
      return;
    }
    app.userList.create(this.newAttributes());
    this.firstName.val('');
    this.lastName.val('');
    this.email.val('');
  },
  addOne: function(user){
    var view = new app.UserView({model: user});
    $('#user-list').append(view.render().el);
  },
  addAll: function(){
    this.$('#user-list').html('');
    app.userList.each(this.addOne,this);
  },
  newAttributes: function(){
    return{
      firstName: this.firstName.val().trim(),
      lastName: this.lastName.val().trim(),
      eMail: this.email.val().trim()
    };
  }
});

app.appView = new app.AppView();
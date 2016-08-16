require.config({
    baseUrl: '../',
    paths: {
        text: 'lib/require-text',
        tree: 'lib/tree-model',
        underscore : 'lib/underscore'
    }
});
require(['underscore','tree', 'text!../templates/list.html', 'text!../templates/element.html', 'text!../templates/create.html'], function(_, TreeModel, list_tpl, element_tpl, create_tpl) {
    var OBK_TAG = "#OBK/";
    var bookmarks = {
        _bookmarks :[],
            load: function(callback){
            var self = this;
            self._bookmarks = [];
            chrome.bookmarks.getTree(function (bookmarks) {
                console.log(bookmarks[0]);
                tree = new TreeModel();

                root = tree.parse(bookmarks[0]);
                root.walk(function (node) {
                    if(node.model.url){ //we don't want folders
                        node.model.tags = [];
                        //Set _title to search easily
                        node.model._title = node.model.title;
                        var _title = node.model.title.split(OBK_TAG);
                        node.model.title = _title[0];
                        if(_title[1]){
                            node.model.tags = _title[1].split(',');
                        }

                        /*
                         * These part is unusedn allows to set bookmarks folders as tags
                         */
                            //var tags = node.getPath();
                            //node.model.tags = [];
                            //for(var i in tags){
                            //    if(tags[i].model.parentId && tags[i].model.parentId != "0" && node.model.id != tags[i].model.id){
                            //        tags[i].model.getTitle = function(){
                            //            return this.title;
                            //        }
                            //        node.model.tags.push(tags[i].model);
                            //    }
                            //}

                        //Update bookmark model
                        node.model.getTitle = function(){
                            var max = 75;
                            if (this.title.length > max) {
                                return this.title.substring(0, max) + '...';
                            }
                            return this.title;
                        }
                        self._bookmarks.push(node.model);
                    }
                });
                callback(self._bookmarks);
            });
        },
        'get' : function(){
            return this._bookmarks;
        },
        find : function(query, callback){
            var bookmarks = [];
            for(var i in this._bookmarks){
                var bookmark = this._bookmarks[i];
                if(bookmark._title.toLowerCase().indexOf(query.toLowerCase()) > -1){
                    bookmarks.push(bookmark);
                }
            }
            callback(bookmarks);
        }

    };


//LISTENERS
    //EXTENSION BTN CLICKED
    chrome.browserAction.onClicked.addListener(function(tab) {

        bookmarks.load(function(bookmarks){
            var $base = $(list_tpl);
            var $list = $('#bkm_ext-content', $base);
            _.each(bookmarks, function(element){
                var template = _.template(element_tpl);
                $list.append(template({element : element}));
            });
            dispatcher.dispatch('background', {
                event : 'bkm_event.start',
                html : $('<div></div>').append($base).html()
            });
        });
    });
    //KEYBOARD SHORTCUT
    chrome.commands.onCommand.addListener(function(command) {
        switch(command){
            //Display list
            case 'bkm-ext-toggle':
                bookmarks.load(function(bookmarks){
                    var $base = $(list_tpl);
                    var $list = $('#bkm_ext-content', $base);
                    _.each(bookmarks, function(element){
                        var template = _.template(element_tpl);
                        $list.append(template({element : element}));
                    });
                    dispatcher.dispatch('background', {
                        event : 'bkm_event.start',
                        html : $('<div></div>').append($base).html()
                    });
                });
                break;
            //Display add form
            case 'bkm-ext-add':
                dispatcher.dispatch('background', {
                    event : 'bkm_event.add',
                    html : create_tpl
                });
                break;
        }
    });
    //FROM CONTENT
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if(request.event){
            switch(request.event){
                //When user has searched
                case 'bkm_event.search_query':
                    bookmarks.find(request.query, function(bookmarks){
                        var $base = $(list_tpl);
                        var $list = $('#bkm_ext-content', $base);
                        _.each(bookmarks, function(element){
                            var template = _.template(element_tpl);
                            $list.append(template({element : element}));
                        });
                        dispatcher.dispatch('background', {
                            event : 'bkm_event.search_response',
                            html : $('<div></div>').append($list).html()
                        });
                    });
                    break;
                //When user want to create
                case 'bkm_event.create_bookmark':
                    var bookmark = request.object;
                    var strTags = bookmark.tags.join();
                        chrome.bookmarks.create({
                            url : bookmark.url,
                            title : bookmark.title+OBK_TAG+strTags
                        });
                    break;
            }
        }
    });

});
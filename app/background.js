var bkm = {
    /*
     * That's a weird trick to be able to have multiline string in js
     * http://stackoverflow.com/questions/805107/creating-multiline-strings-in-javascript/805755#805755
     */
    template : {
        tpl : function(){
            return (function () {/*
             <div id="bkm_ext">
                 <div id="bkm_ext_overlay"></div>
                 <div id="bkm_ext_container-global">
                     <div id="bkm_ext_owl"></div>
                     <div id="bkm_ext_form" class="row-fluid">
                         <div class="col-md-12">
                            <input autofocus="true" placeholder="recherche..." class="form-control" id="bkm_ext_search_input"/>
                         </div>
                     </div>
                     <div id="bkm_ext_list_container-wrap">
                        <div id="bkm_ext_list_container" class="row-fluid"></div>
                     </div>
                 </div>
             </div>
             */}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1];
        },
        element : {
            tpl : function(bookmark){
                return (function () {/*
                 <div class="bkm_ext_element col-md-3">
                     <div class=" panel panel-default">
                         <div class=" panel-body bkm_ext_element-thumbnail_container">
                             <a class="bkm_ext_element-link" href="${url}"></a>
                             <img width="16" height="16" src="https://plus.google.com/_/favicon?domain_url=${url}"/>
                             <h4>${d_title}</h4>
                         </div>
                     </div>
                 </div>
                 */}).toString()
                    .match(/[^]*\/\*([^]*)\*\/\}$/)[1]
                    .replace(/\$\{([^}]+)\}/g, function(outer, inner, pos){
                        return bookmark[inner];
                    });
            }
        },
        'get' : function(bookmarks){
            var $base = $(this.tpl());
            var $list = $('#bkm_ext_list_container', $base);
            for (var index in bookmarks){
                bookmarks[index].d_title = bookmarks[index].getTitle(bookmarks[index]);

                var $element = $(this.element.tpl(bookmarks[index]));
                $list.append($element);
            }
            return $('<div></div>').append($base).html();
        },
        list : function(bookmarks, $q){
            var $base = $(this.tpl());
            var $list = $('#bkm_ext_list_container', $base);
            for (var index in bookmarks){
                var bookmark = bookmarks[index];
                if($q){
                    if(bookmark.title.toLowerCase().indexOf($q.toLowerCase()) > -1){
                        var qindex = bookmark.getTitle(bookmark).toLowerCase().indexOf($q.toLowerCase());
                        var re = new RegExp($q,"gi");
                        bookmark.d_title = bookmark.getTitle(bookmark).replace(re,"<span style='color:#7FC8BD'>"+bookmark.getTitle(bookmark).substr(qindex,$q.length)+"</span>");
                        var $element = $(this.element.tpl(bookmark));
                        $list.append($element);
                    }
                }else{
                    bookmark.d_title = bookmark.getTitle(bookmark);
                    var $element = $(this.element.tpl(bookmark));
                    $list.append($element);
                }
            };
            return $list.html();
        }
    },
    bookmarks : {
        _bookmarks :[],
        load: function(callback){
            var self = this;
            self._bookmarks = [];
            chrome.bookmarks.getTree(function (node) {
                var recurse = function (node) {
                    if (node.url) {
                        if (node.title) {
                            node.getTitle = function(node){
                                var max = 50;
                                if (node.title.length > max) {
                                    return node.title.substring(0, max) + '...';
                                }
                                return node.title;
                            }
                        }
                        self._bookmarks.push(node);
                    }
                    if (node.children) {
                        for (var i in node.children) {
                            recurse(node.children[i]);
                        }
                    }
                }
                recurse(node[0]);
                callback(self._bookmarks);
            });
        },
        'get' : function(){
            return this._bookmarks;
        }
    }
};
//LISTENERS
//EXTENSION BTN CLICKED
chrome.browserAction.onClicked.addListener(function(tab) {
    bkm.bookmarks.load(function(bookmarks){
        dispatcher.dispatch('background', {
            event : 'bkm_event.start',
            html : bkm.template.get(bookmarks)
        });
    });

});
//KEYBOARD SHORTCUT
chrome.commands.onCommand.addListener(function(command) {
    bkm.bookmarks.load(function(bookmarks){
        dispatcher.dispatch('background', {
            event : 'bkm_event.start',
            html : bkm.template.get(bookmarks)
        });
    });
});
//FROM CONTENT
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.event){
        switch(request.event){
            case 'bkm_event.search_query':
                var bookmarks = bkm.bookmarks.get();
                dispatcher.dispatch('background', {
                    event : 'bkm_event.search_response',
                    html : bkm.template.list(bookmarks, request.query)
                });
                break;
        }
    }
});
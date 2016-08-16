chrome.runtime.connect();
//LISTENER
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.event){
        switch(request.event){
            case 'bkm_event.add':

                var node = document.getElementById('bkm_ext');
                if(!node){
                    document.body.insertAdjacentHTML('beforeend', request.html);

                    var title = document.getElementsByTagName("title")[0].innerHTML;
                    var url = window.location;
                    var $title = $('#bkm_ext_form_title');
                    var $url = $('#bkm_ext_form_url');
                    var $tags = $('#bkm_ext_form_tags');
                    $url.val(url);
                    $title.val(title);
                    $tags.tagEditor();
                    $tags.focus();

                    $("#bkm_ext_form_smbt").on('click',function(){
                        dispatcher.dispatch('content', {
                            event : 'bkm_event.create_bookmark',
                            object : {
                                'url' : $url.val(),
                                'title' : $title.val(),
                                'tags' : $tags.tagEditor('getTags')[0].tags
                            }
                        });
                        var node = document.getElementById('bkm_ext');
                        document.body.removeChild(node);
                    });
                }else{
                    document.body.removeChild(node);
                }
                break;
            case 'bkm_event.start':
                 var $input, timeout;
                    console.log('content');
                if($('#bkm_ext').length <= 0){
                    $('body').append(request.html);
                    $input = $('#bkm_ext-find-input');
                    $input.focus();
                    $input.on('keydown', function(){
                            if(timeout){
                                clearTimeout(timeout);
                                timeout = null;
                            }
                            timeout = setTimeout(function(){
                                dispatcher.dispatch('content', {
                                    event : 'bkm_event.search_query',
                                    query : $input.val()
                                });
                            },750);
                        });
                }
                else{
                    $('#bkm_ext').remove();
                }
                break;
            case 'bkm_event.search_response':
                    $('#bkm_ext-content').replaceWith(request.html);
                break;
        }
    }
});

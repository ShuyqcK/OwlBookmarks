chrome.runtime.connect();
//LISTENER
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.event){
        switch(request.event){
            case 'bkm_event.start':
                console.log('?');
                    var node = document.getElementById('bkm_ext');
                    if(!node){
                        document.body.insertAdjacentHTML('beforeend', request.html);
                        var input = document.getElementById("bkm_ext_search_input");
                        var timeout;
                        input.addEventListener('keydown', function(){
                            if(timeout){
                                clearTimeout(timeout);
                                timeout = null;
                            }
                            timeout = setTimeout(function(){
                                dispatcher.dispatch('content', {
                                    event : 'bkm_event.search_query',
                                    query : input.value
                                });
                            },750);
                        },true);
                    }else{
                        document.body.removeChild(node);
                    }
                break;
            case 'bkm_event.search_response':
                    var node = document.getElementById('bkm_ext_list_container');
                    node.innerHTML = request.html;
                break;
        }
    }
});

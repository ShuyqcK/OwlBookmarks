//DISPATCHER
var dispatcher = {
    dispatch : function(from, object){
        switch(from){
            case 'content':
                return chrome.runtime.sendMessage(object, function(response) {
                    return response;
                });
                break;
            case 'background':
                return chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                    return chrome.tabs.sendMessage(tabs[0].id, object, function (response) {
                        return response;
                    });
                });
                break;
        }
    }
}
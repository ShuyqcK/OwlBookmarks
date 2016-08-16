{
    getPath : function(){
        var tags = node.getPath();
        node.model.tags = [];
        for(var i in tags){
            if(tags[i].model.parentId && tags[i].model.parentId != "0" && node.model.id != tags[i].model.id){
                tags[i].model.getTitle = function(){
                    return this.title;
                }
                node.model.tags.push(tags[i].model);
            }
        }
    }
    getTitle : function(max)
    {
        if (this.title.length > max) {
            return this.title.substring(0, max) + '...';
        }
        return this.title;
    }
}
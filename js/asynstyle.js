function delayLoad(){
    var link = document.getElementsByTagName("link")[0];
    var mediaValue = link.getAttribute('media');
    if(mediaValue != "all"){
        link.setAttribute("media", "all");
    }
};
$(document).ready(function() {
    // put your page initialization code here
    pageSize = 4;
    incremSlide = 4;
    startPage = 0;
    numberPage = 0;
    
    var pageCount =  Math.ceil($(".message-div").length / pageSize);
    var totalSlidepPage = Math.floor(pageCount / incremSlide);
        
    for(var i = 0 ; i<pageCount;i++){
        // console.log(i, pageCount, $(".message-div").length / pageSize)
        $("#pagin").append('<li><a href="#">'+(i+1)+'</a></li> ');
        if(i>incremSlide-1){
           $("#pagin li").eq(i).hide();
        }
    }
    
    var prev = $("<li/>").addClass("prev").html("Prev").click(function(){
       startPage-=5;
       incremSlide-=5;
       numberPage--;
       slide();
    });
    
    prev.hide();
    
    var next = $("<li/>").addClass("next").html("Next").click(function(){
       startPage+=5;
       incremSlide+=5;
       numberPage++;
       slide();
    });

    if(pageCount <= 5){
        prev.hide();
        next.hide();
    }
    
    $("#pagin").prepend(prev).append(next);
    
    $("#pagin li").first().find("a").addClass("current");
    
    slide = function(sens){
       $("#pagin li").hide();
       
       for(t=startPage;t<incremSlide;t++){
         $("#pagin li").eq(t+1).show();
       }
       if(startPage == 0){
         next.show();
         prev.hide();
       }else if(numberPage == totalSlidepPage ){
         next.hide();
         prev.show();
       }else{
         next.show();
         prev.show();
       }
       
        
    }
    
    showPage = function(page) {
          $(".message-div").hide();
          $(".message-div").each(function(n) {
              if (n >= pageSize * (page - 1) && n < pageSize * page)
                  $(this).show();
          });        
    }
        
    showPage(1);
    $("#pagin li a").eq(0).addClass("current");
    
    $("#pagin li a").click(function() {
         $("#pagin li a").removeClass("current");
         $(this).addClass("current");
         showPage(parseInt($(this).text()));
    });
});
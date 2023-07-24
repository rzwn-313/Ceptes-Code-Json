let el = document.getElementById("checkbox");
if(el){
    el.addEventListener("click", passwordVisibility, false);
}

const passwordVisibility = ()=>{
    var x = document.getElementById("password");
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
  }
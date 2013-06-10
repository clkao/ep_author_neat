var out$ = typeof exports != 'undefined' && exports || this;

out$.aceEditEvent = function (hook_name, args, cb) { // on an edit

  if(!args.callstack.docTextChanged){ // has the document text changed?
    return false; 
  }else{
    console.log("edited");
    authorViewUpdate();
  }

}

function authorViewUpdate(){
/*
  Show authors color on line
    - get all authors on line
      - get which one has most chars
        - get that authors authorid
          - find users color from authorid
          - add css styling w/ border-left to the parent div
  Show authors name
*/

  var lineNumber = 0;
  // below is VERY slow
  var divs = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").children("div");
  $(divs).each(function(){ // each line
    var lineAuthor = {};
    $(this).children("span").each(function(){ // each span
      var spanclass = $(this).attr("class");
      if(spanclass.indexOf("author") !== -1){ // if its an author span.
        var length = $(this).text().length; // the length of the span
        lineAuthor[spanclass] = length + (lineAuthor[spanclass] || 0);
      }
    console.log(lineAuthor);
    });
    // TODO sort lineAuthor by value
    // Get author name from classname
    var authorName = "Test";
    // Write authorName to the sidediv..
    var $authorContainer = $('iframe[name="ace_outer"]').contents().find('#sidedivinner').find('div:nth-child('+lineNumber+')');
    var authorClass = "author-a-qtuf77vz82z3v3z69zrz72zdz87z"; // TODO get the actual class that has the most edits on this line
    // console.log(authorClass);
    var authorId = authorIdFromClass(authorClass); // Get the authorId
console.log(authorId);
    if(!authorId){ return; } // Default text isn't shown
    var authorNameAndColor = authorNameAndColorFromAuthorId(authorId); // Get the authorName And Color
console.log(authorNameAndColor);
    console.log(authorNameAndColor.name, authorNameAndColor.color);



    $authorContainer.html(authorName);
    lineNumber++;
  });
}

function fadeColor(colorCSS, fadeFrac){
  var color;
  color = colorutils.css2triple(colorCSS);
  color = colorutils.blend(color, [1, 1, 1], fadeFrac);
  return colorutils.triple2css(color);
}
out$.aceSetAuthorStyle = aceSetAuthorStyle;
function aceSetAuthorStyle(name, context){
console.log("yayaya");
  var dynamicCSS, parentDynamicCSS, info, author, authorSelector, color, authorStyle, parentAuthorStyle, anchorStyle;
  dynamicCSS = context.dynamicCSS, parentDynamicCSS = context.parentDynamicCSS, info = context.info, author = context.author, authorSelector = context.authorSelector;
  if (info) {
    if (!(color = info.bgcolor)) {
      return 1;
    }
    authorStyle = dynamicCSS.selectorStyle(authorSelector);
    parentAuthorStyle = parentDynamicCSS.selectorStyle(authorSelector);
    anchorStyle = dynamicCSS.selectorStyle(authorSelector + ' > a');
    authorStyle.borderBottom = '2px solid ' + color;
    parentAuthorStyle.borderBottom = '2px solid ' + color;
  } else {
    dynamicCSS.removeSelectorStyle(authorSelector);
    parentDynamicCSS.removeSelectorStyle(authorSelector);
  }
  return 1;
}

function authorIdFromClass(className){
  if (className.substring(0, 7) == "author-") {
    className = className.substring(0,49);
    return className.substring(7).replace(/[a-y0-9]+|-|z.+?z/g, function(cc) {
      if (cc == '-') { return '.'; }
      else if (cc.charAt(0) == 'z') {
        return String.fromCharCode(Number(cc.slice(1, -1)));
      }
      else {
        return cc;
      }
    });
  }
}

function authorNameAndColorFromAuthorId(authorId){
    // It could always be me..
    var myAuthorId = pad.myUserInfo.userId;
    if(myAuthorId == authorId){
      return {
        name: "Me",
        color: "#fff"
      }
    }

    // Not me, let's look up in the DOM
    var authorObj = {};
    $('#otheruserstable > tbody > tr').each(function(){
      if (authorId == $(this).data("authorid")){
        $(this).find('.usertdname').each( function() {
          authorObj.name = $(this).text();
          if(authorObj.name == "") authorObj.name = "Unknown Author";
        });
        $(this).find('.usertdswatch > div').each( function() {
          authorObj.color = $(this).css("background-color");
        });
        return authorObj;
      }
    });

    // Else go historical
    if(!authorObj || !authorObj.name){
      var authorObj = clientVars.collab_client_vars.historicalAuthorData[authorId]; // Try to use historical data
    }

    return authorObj || {name: "Unknown Author", color: "#fff"};
}

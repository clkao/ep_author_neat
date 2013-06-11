var out$ = typeof exports != 'undefined' && exports || this;

out$.postAceInit = function (hook_name, args, cb) {
  setTimeout(function(){ // has to wait for a bit to do this..
    authorViewUpdate();
  }, 500);
}

out$.aceEditEvent = function (hook_name, args, cb) { // on an edit

  if(!args.callstack.docTextChanged){ // has the document text changed?
    return false; 
  }else{
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
  $('iframe[name="ace_outer"]').contents().find('#sidediv').css("padding-right","0px");
  var authors = {};

  $(divs).each(function(){ // each line
    if($(this).text().length > 0){ // return nothign if the line is blank :)
      var authorClass = "";
      authors.line = {};
      authors.line.number = lineNumber;
      $(this).children("span").each(function(){ // each span
        var spanclass = $(this).attr("class");
        if(spanclass.indexOf("author") !== -1){ // if its an author span.
          var length = $(this).text().length; // the length of the span
          if(authors.line[spanclass]){
            authors.line[spanclass] = authors.line[spanclass] + length; // append the length to existing chars
          }else{
            authors.line[spanclass] = length; // set a first value of length
          }
        }
      }); // end each span
      
      // get the author with the most chars
      var mPA = 0; // mPA = most prolific author
      $.each(authors.line, function(index, value){ // each author of this div
        if(index != "number"){ // if its not the line number
          if ( value > mPA ){ // if the value of the number of chars is greater than the old char
            mPA = value; // Set the new baseline #
            authorClass = index; // set the line Author :)
            authors[lineNumber] = authorClass;
          }
        }
      });
    }
    
    var nth = lineNumber +1; // nth begins count at 1
    var prev = lineNumber -1;
    var $authorContainer = $('iframe[name="ace_outer"]').contents().find('#sidedivinner').find('div:nth-child('+nth+')');

    if($(this).text().length == 0){
       // line is blank, we should nuke the line number
       $authorContainer.html("");
       $authorContainer.css({"border-right":"solid 0px ", "padding-right":"5px"});
    }

    if(authorClass){ // If ther eis an authorclass for this line
      // Write authorName to the sidediv..
      // get previous authorContainer text
      var prevAuthorName = authors[prev]; // get the previous author class
      var authorId = authorIdFromClass(authorClass); // Get the authorId
      if(!authorId){ return; } // Default text isn't shown
      var authorNameAndColor = authorNameAndColorFromAuthorId(authorId); // Get the authorName And Color
      $authorContainer.css({"border-right":"solid 5px "+authorNameAndColor.color, "padding-right":"5px"});
      if(authorClass !== prevAuthorName){ // if its a new author name and not the same one as the line above.
        $('iframe[name="ace_outer"]').contents().find('#sidedivinner').find('div:nth-child('+nth+')').html(authorNameAndColor.name); // write the author name
      }else{
        $authorContainer.html(""); // else leave it blank
      }
    }
    lineNumber++; // seems weird to do this here but actually makes sense

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
        color: pad.myUserInfo.colorId
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

Object.size = function(obj) { // http://stackoverflow.com/questions/5223/length-of-javascript-object-ie-associative-array
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};


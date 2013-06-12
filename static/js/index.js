var out$ = typeof exports != 'undefined' && exports || this;

var authorLines = {};

out$.acePostWriteDomLineHTML = function(hook_name, args, cb) { // When the DOM is edited
  // console.log(args);
  setTimeout(function(){
    authorViewUpdate(args.node);
  }, 200); // avoid pesky race conditions
}

out$.aceEditEvent = function (hook_name, args, cb) { // on an edit
  if(args.callstack.type == "setWraps"){ // fired when wraps is fired
    $('iframe[name="ace_outer"]').contents().find('#sidediv').css({"padding-right":"0px"}); // no need for padding when we use borders
    $('iframe[name="ace_outer"]').contents().find('#sidedivinner').css({"max-width":"180px", "overflow":"hidden"}); // set max width to 180
    $('iframe[name="ace_outer"]').contents().find('#sidedivinner > div').css({"text-overflow":"ellipsis", "overflow":"hidden"}); // stop overflow and use ellipsis
  }
}

function authorViewUpdate(node){
  var lineNumber = $(node).index();
  console.log("lineNumber", lineNumber);
  if(lineNumber == -1){ return false; } // dont process lines we dont know the number of.
  lineNumber = lineNumber +1; // index returns -1 what nth expects
  var prevAuthor = (authorLines[lineNumber] || false);
  // console.log("previous author class was", prevAuthor);
  var authors = {};
  var authorClass = false;
  authorLines[lineNumber] = null;
  if($(node).text().length > 0){ // return nothign if the line is blank :)
    authorLines.line = {};
    authorLines.line.number = lineNumber;
    $(node).children("span").each(function(){ // each span
      var spanclass = $(this).attr("class");
      if(spanclass.indexOf("author") !== -1){ // if its an author span.
        var length = $(this).text().length; // the length of the span
        if(authorLines.line[spanclass]){
          authorLines.line[spanclass] = authorLines.line[spanclass] + length; // append the length to existing chars
        }else{
          authorLines.line[spanclass] = length; // set a first value of length
        }
      }
    }); // end each span
    // get the author with the most chars
    var mPA = 0; // mPA = most prolific author
    $.each(authorLines.line, function(index, value){ // each author of this div
      if(index != "number"){ // if its not the line number
        if ( value > mPA ){ // if the value of the number of chars is greater than the old char
          mPA = value; // Set the new baseline #
          authorClass = index; // set the line Author :)
          authorLines[lineNumber] = authorClass;
        }
      }
    });
    authorLines.line = null; // set the authorLines.line count value back to nothing
  } // end if the div is blank

  var prev = lineNumber -1; // previous item is always one less than current linenumber
  var next = lineNumber +1;
  if($(node).text().length == 0){ // if the line has no text
    var $authorContainer = $('iframe[name="ace_outer"]').contents().find('#sidedivinner').find('div:nth-child('+lineNumber+')'); // get the left side author contains // VERY SLOW!
    $authorContainer.html(""); // line is blank, we should nuke the line number
    $authorContainer.css({"border-right":"solid 0px ", "padding-right":"5px"}); // add some blank padding to keep things neat
  }

  if(authorClass){
    $(node).addClass(authorClass); // XXX: remove other old author class

    // Write authorName to the sidediv..
    // get previous authorContainer text
    var prevLineAuthorClass = authorLines[prev]; // get the previous author class
    var authorId = authorIdFromClass(authorClass); // Get the authorId
    if(!authorId){ return; } // Default text isn't shown
    // below throws true but we might need to rewrite anyway so lets do that..
    // console.log(authorClass, prevAuthor);
  
    var authorChanged = false;
    if(authorClass != prevAuthor){ // Has the author changed, if so we need to uipdate the UI anyways..
      authorChanged = true;
    }

    var authorNameAndColor = authorNameAndColorFromAuthorId(authorId); // Get the authorName And Color
    var $sidedivinner = $('iframe[name="ace_outer"]').contents().find('#sidedivinner');
    $authorContainer = $sidedivinner.find('div:nth-child('+lineNumber+')');
    $authorContainer.css({"border-right":"solid 5px "+authorNameAndColor.color, "padding-right":"5px"});

    // The below logic breaks when you remove chunks of content because the hook only
    // the plugin only redraws the actual line edited..  WTF!
    // To fix it we need to do a while loop over the authorLines object

    // Does the previous line have the same author?
    var prevLineSameAuthor = false;
    if(authorLines[prev] == authorClass){
//      console.log("set the current line authorname to ''", lineNumber);
      prevLineSameAuthor = true; // this line shouldn't have any author name.
    }

    // Does the next line have the same author?
    if(authorLines[next] == authorClass){
//      console.log("set the next line authorname to ''", lineNumber);
      $nextAuthorContainer = $sidedivinner.find('div:nth-child('+next+')');
      $nextAuthorContainer.html("");
      if(!prevLineSameAuthor){ // does the previous line have the same author?
        $authorContainer.html(authorNameAndColor.name); // write the author name
      }
    }else{
      // If the authorClass is not the same as the previous line author class and the author had not changed
      if((authorClass != prevLineAuthorClass) && (!authorChanged)){
        $authorContainer.html(authorNameAndColor.name); // write the author name
      }else{
        $authorContainer.html("");
      }
    }
    $('iframe[name="ace_outer"]').contents().find('#sidedivinner').find('div:nth-child('+lineNumber+')').attr("title", "Line number "+lineNumber); // add a hover for line numbers
  }

}

function fadeColor(colorCSS, fadeFrac){
  var color;
  color = colorutils.css2triple(colorCSS);
  color = colorutils.blend(color, [1, 1, 1], fadeFrac);
  return colorutils.triple2css(color);
}
out$.aceSetAuthorStyle = aceSetAuthorStyle;

function getAuthorClassName(author)
{
  return "author-" + author.replace(/[^a-y0-9]/g, function(c)
  {
    if (c == ".") return "-";
    return 'z' + c.charCodeAt(0) + 'z';
  });
}


function aceSetAuthorStyle(name, context){
  var dynamicCSS, parentDynamicCSS, info, author, authorSelector, color, authorStyle, parentAuthorStyle, anchorStyle;
  dynamicCSS = context.dynamicCSS, parentDynamicCSS = context.parentDynamicCSS, info = context.info, author = context.author, authorSelector = context.authorSelector;
  if (info) {
    if (!(color = info.bgcolor)) {
      return 1;
    }
    authorClass = getAuthorClassName(author);
    authorSelector = ".authorColors span."+authorClass;
    authorStyle = dynamicCSS.selectorStyle(authorSelector);
    primaryAuthorStyle = dynamicCSS.selectorStyle(".authorColors ."+authorClass+" "+"span."+authorClass);
    parentAuthorStyle = parentDynamicCSS.selectorStyle(authorSelector);
    anchorStyle = dynamicCSS.selectorStyle(authorSelector + ' > a');
    primaryAuthorStyle.borderBottom = '0px';
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

// For those who need them (< IE 9), add support for CSS functions
var isStyleFuncSupported = CSSStyleDeclaration.prototype.getPropertyValue != null;
if (!isStyleFuncSupported) {
    CSSStyleDeclaration.prototype.getPropertyValue = function(a) {
        return this.getAttribute(a);
    };
    CSSStyleDeclaration.prototype.setProperty = function(styleName, value, priority) {
        this.setAttribute(styleName,value);
        var priority = typeof priority != 'undefined' ? priority : '';
        if (priority != '') {
            // Add priority manually
            var rule = new RegExp(RegExp.escape(styleName) + '\\s*:\\s*' + RegExp.escape(value) + '(\\s*;)?', 'gmi');
            this.cssText = this.cssText.replace(rule, styleName + ': ' + value + ' !' + priority + ';');
        } 
    }
    CSSStyleDeclaration.prototype.removeProperty = function(a) {
        return this.removeAttribute(a);
    }
    CSSStyleDeclaration.prototype.getPropertyPriority = function(styleName) {
        var rule = new RegExp(RegExp.escape(styleName) + '\\s*:\\s*[^\\s]*\\s*!important(\\s*;)?', 'gmi');
        return rule.test(this.cssText) ? 'important' : '';
    }
}

// Escape regex chars with \
RegExp.escape = function(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}


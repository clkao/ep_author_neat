var out$ = typeof exports != 'undefined' && exports || this;
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
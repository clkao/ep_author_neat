#colorutils = require('ep_etherpad-lite/static/js/colorutils').colorutils
function fadeColor(colorCSS, fadeFrac)
  color = colorutils.css2triple colorCSS
  color = colorutils.blend color, [1, 1, 1], fadeFrac
  colorutils.triple2css color

export function aceSetAuthorStyle(name, context)
  { dynamicCSS, parentDynamicCSS, info, author, authorSelector } = context

  if info
    return 1 unless color = info.bgcolor
    #if ((typeof info.fade) == "number")
    #  color = fadeColor(color, info.fade);
        
    authorStyle = dynamicCSS.selectorStyle(authorSelector);
    parentAuthorStyle = parentDynamicCSS.selectorStyle(authorSelector);
    anchorStyle = dynamicCSS.selectorStyle(authorSelector + ' > a')

    authorStyle.borderBottom = '2px solid ' + color;
    parentAuthorStyle.borderBottom = '2px solid ' + color;
  else
    dynamicCSS.removeSelectorStyle authorSelector
    parentDynamicCSS.removeSelectorStyle authorSelector

  return 1

var authorViewUpdate, fadeColor, getAuthorClassName, authorIdFromClass, authorNameAndColorFromAuthorId, authorLines, isStyleFuncSupported, out$ = typeof exports != 'undefined' && exports || this;
function derivePrimaryAuthor($node){
  var byAuthor, mPA, authorClass, author, value;
  byAuthor = {};
  $node.children('span').each(function(){
    var $this, allclass, i$, len$, spanclass, length, results$ = [];
    $this = $(this);
    allclass = $this.attr('class').split(' ');
    for (i$ = 0, len$ = allclass.length; i$ < len$; ++i$) {
      spanclass = allclass[i$];
      if (/^author/.exec(spanclass)) {
        length = $this.text().length;
        byAuthor[spanclass] == null && (byAuthor[spanclass] = 0);
        results$.push(byAuthor[spanclass] += length);
      }
    }
    return results$;
  });
  mPA = 0;
  authorClass = null;
  for (author in byAuthor) {
    value = byAuthor[author];
    if (value > mPA) {
      mPA = value;
      authorClass = author;
    }
  }
  return authorClass;
}
function toggleAuthor($node, prefix, authorClass){
  var hasClass, myClass, i$, ref$, ref1$, len$, c;
  hasClass = false;
  myClass = prefix + "-" + authorClass;
  for (i$ = 0, len$ = (ref$ = (ref1$ = $node.attr('class' != null
    ? 'class'
    : split(' '))) != null
    ? ref1$
    : []).length; i$ < len$; ++i$) {
    c = ref$[i$];
    if (c.indexOf(prefix) === 0) {
      if (c === myClass) {
        hasClass = true;
      } else {
        $node.removeClass(c);
      }
    }
  }
  if (!hasClass) {
    return $node.addClass(myClass);
  }
}
authorViewUpdate = function(node){
  var $node, lineNumber, prevAuthor, authors, authorClass, prev, next, x$, $authorContainer, prevLineAuthorClass, authorId, authorChanged, authorNameAndColor, $sidedivinner, prevLineSameAuthor, y$, $nextAuthorContainer;
  $node = $(node);
  lineNumber = $node.index();
  if (lineNumber === -1) {
    return false;
  }
  ++lineNumber;
  prevAuthor = authorLines[lineNumber] || false;
  authors = {};
  authorClass = false;
  authorLines[lineNumber] = null;
  if ($node.text().length > 0) {
    authorClass = authorLines[lineNumber] = derivePrimaryAuthor($node);
  }
  prev = lineNumber - 1;
  next = lineNumber + 1;
  if ($node.text().length === 0) {
    x$ = $authorContainer = $('iframe[name="ace_outer"]').contents().find('#sidedivinner').find("div:nth-child(" + lineNumber + ")");
    x$.html('');
    x$.css({
      'border-right': 'solid 0px ',
      'padding-right': '5px'
    });
  }
  if (authorClass) {
    toggleAuthor($node, "primary", authorClass);
    prevLineAuthorClass = authorLines[prev];
    if (!(authorId = authorIdFromClass(authorClass))) {
      return;
    }
    authorChanged = authorClass !== prevAuthor;
    authorNameAndColor = authorNameAndColorFromAuthorId(authorId);
    $sidedivinner = $('iframe[name="ace_outer"]').contents().find('#sidedivinner');
    $authorContainer = $sidedivinner.find("div:nth-child(" + lineNumber + ")");
    toggleAuthor($authorContainer, "primary", authorClass);
    prevLineSameAuthor = authorLines[prev] === authorClass;
    if (authorLines[next] === authorClass) {
      y$ = $nextAuthorContainer = $sidedivinner.find("div:nth-child(" + next + ")");
      y$.html('');
      if (!prevLineSameAuthor) {
        $authorContainer.html(authorNameAndColor.name);
      }
    } else {
      if (authorClass !== prevLineAuthorClass && !authorChanged) {
        $authorContainer.html(authorNameAndColor.name);
      } else {
        $authorContainer.html('');
      }
    }
    return $('iframe[name="ace_outer"]').contents().find('#sidedivinner').find("div:nth-child(" + lineNumber + ")").attr('title', 'Line number ' + lineNumber);
  }
};
fadeColor = function(colorCSS, fadeFrac){
  var color;
  color = void 8;
  color = colorutils.css2triple(colorCSS);
  color = colorutils.blend(color, [1, 1, 1], fadeFrac);
  return colorutils.triple2css(color);
};
getAuthorClassName = function(author){
  return 'author-' + author.replace(/[^a-y0-9]/g, function(c){
    if (c === '.') {
      return '-';
    } else {
      return 'z' + c.charCodeAt(0) + 'z';
    }
  });
};
out$.aceSetAuthorStyle = aceSetAuthorStyle;
function aceSetAuthorStyle(name, context){
  var dynamicCSS, outerDynamicCSS, parentDynamicCSS, info, author, authorSelector, color, authorClass, x$, y$, z$, z1$;
  dynamicCSS = context.dynamicCSS, outerDynamicCSS = context.outerDynamicCSS, parentDynamicCSS = context.parentDynamicCSS, info = context.info, author = context.author, authorSelector = context.authorSelector;
  if (info) {
    if (!(color = info.bgcolor)) {
      return 1;
    }
    authorClass = getAuthorClassName(author);
    authorSelector = ".authorColors span." + authorClass;
    x$ = dynamicCSS.selectorStyle(authorSelector);
    x$.borderBottom = "2px solid " + color;
    y$ = parentDynamicCSS.selectorStyle(authorSelector);
    y$.borderBottom = "2px solid " + color;
    z$ = dynamicCSS.selectorStyle(".authorColors .primary-" + authorClass + " ." + authorClass);
    z$.borderBottom = '0px';
    z1$ = outerDynamicCSS.selectorStyle("#sidedivinner > div.primary-" + authorClass);
    z1$.borderRight = "solid 5px " + color;
    z1$.paddingRight = '5px';
  } else {
    dynamicCSS.removeSelectorStyle(authorSelector);
    parentDynamicCSS.removeSelectorStyle(authorSelector);
  }
  return 1;
}
authorIdFromClass = function(className){
  if (className.substring(0, 7) === 'author-') {
    className = className.substring(0, 52);
    return className.substring(7).replace(/[a-y0-9]+|-|z.+?z/g, function(cc){
      if (cc === '-') {
        return '.';
      } else {
        if (cc.charAt(0) === 'z') {
          return String.fromCharCode(Number(cc.slice(1, -1)));
        } else {
          return cc;
        }
      }
    });
  }
};
authorNameAndColorFromAuthorId = function(authorId){
  var myAuthorId, authorObj;
  myAuthorId = pad.myUserInfo.userId;
  if (myAuthorId === authorId) {
    return {
      name: 'Me',
      color: pad.myUserInfo.colorId
    };
  }
  authorObj = {};
  $('#otheruserstable > tbody > tr').each(function(){
    var x$;
    if (authorId === $(this).data('authorid')) {
      x$ = $(this);
      x$.find('.usertdname').each(function(){
        return authorObj.name = $(this).text() || 'Unknown Author';
      });
      x$.find('.usertdswatch > div').each(function(){
        return authorObj.color = $(this).css('background-color');
      });
      return authorObj;
    }
  });
  if (!authorObj || !authorObj.name) {
    authorObj = clientVars.collab_client_vars.historicalAuthorData[authorId];
  }
  return authorObj || {
    name: 'Unknown Author',
    color: '#fff'
  };
};
authorLines = {};
out$.acePostWriteDomLineHTML = acePostWriteDomLineHTML;
function acePostWriteDomLineHTML(hook_name, args, cb){
  return setTimeout(function(){
    return authorViewUpdate(args.node);
  }, 200);
}
out$.aceEditEvent = aceEditEvent;
function aceEditEvent(hook_name, arg$, cb){
  var callstack, x$;
  callstack = arg$.callstack;
  if (callstack.type !== 'setWraps') {
    return;
  }
  x$ = $('iframe[name="ace_outer"]').contents();
  x$.find('#sidediv').css({
    'padding-right': '0px'
  });
  x$.find('#sidedivinner').css({
    'max-width': '180px',
    overflow: 'hidden'
  });
  x$.find('#sidedivinner > div').css({
    'text-overflow': 'ellipsis',
    overflow: 'hidden'
  });
  return x$;
}
isStyleFuncSupported = CSSStyleDeclaration.prototype.getPropertyValue != null;
if (!isStyleFuncSupported) {
  CSSStyleDeclaration.prototype.getPropertyValue = function(a){
    return this.getAttribute(a);
  };
  CSSStyleDeclaration.prototype.setProperty = function(styleName, value, priority){
    var rule;
    this.setAttribute(styleName, value);
    priority = typeof priority !== 'undefined' ? priority : '';
    if (!(priority === '')) {
      rule = new RegExp(RegExp.escape(styleName) + '\\s*:\\s*' + RegExp.escape(value + '(\\s*;)?', 'gmi'));
      return this.cssText = this.cssText.replace(rule, styleName + ': ' + value + ' !' + priority + ';');
    }
  };
  CSSStyleDeclaration.prototype.removeProperty = function(a){
    return this.removeAttribute(a);
  };
  CSSStyleDeclaration.prototype.getPropertyPriority = function(styleName){
    var rule;
    rule = new RegExp(RegExp.escape(styleName) + '\\s*:\\s*[^\\s]*\\s*!important(\\s*;)?', 'gmi');
    if (rule.test(this.cssText)) {
      return 'important';
    } else {
      return '';
    }
  };
}
RegExp.escape = function(text){
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};
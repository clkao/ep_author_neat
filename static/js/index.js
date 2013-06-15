var hasEnter, authorViewUpdate, fadeColor, getAuthorClassName, authorIdFromClass, authorNameAndColorFromAuthorId, authorLines, isStyleFuncSupported, out$ = typeof exports != 'undefined' && exports || this;
hasEnter = false;
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
  var hasClass, myClass, attr, ref$, i$, len$, c;
  hasClass = false;
  myClass = prefix + "-" + authorClass;
  attr = (ref$ = $node.attr('class')) != null ? ref$ : '';
  for (i$ = 0, len$ = (ref$ = attr.split(' ')).length; i$ < len$; ++i$) {
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
authorViewUpdate = function($node){
  var lineNumber, prevAuthor, authors, authorClass, prev, next, x$, $authorContainer, prevLineAuthorClass, authorId, authorChanged, authorNameAndColor, $sidedivinner, prevLineSameAuthor, y$, $nextAuthorContainer;
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
    x$.addClass("primary-author-none");
    x$.html('');
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
    $('iframe[name="ace_outer"]').contents().find('#sidedivinner').find("div:nth-child(" + lineNumber + ")").attr('title', 'Line number ' + lineNumber);
    if (hasEnter) {
      next = $node.next();
      if (next.length) {
        return authorViewUpdate(next);
      } else {
        return hasEnter = false;
      }
    }
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
  var dynamicCSS, outerDynamicCSS, parentDynamicCSS, info, author, authorSelector, x$, color, authorClass, authorName, y$, z$, z1$, z2$, z3$;
  dynamicCSS = context.dynamicCSS, outerDynamicCSS = context.outerDynamicCSS, parentDynamicCSS = context.parentDynamicCSS, info = context.info, author = context.author, authorSelector = context.authorSelector;
  x$ = outerDynamicCSS.selectorStyle("#sidedivinner > div.primary-author-none");
  x$.borderRight = 'solid 0px ';
  x$.paddingRight = '5px';
  if (info) {
    if (!(color = info.bgcolor)) {
      return 1;
    }
    authorClass = getAuthorClassName(author);
    authorName = authorNameAndColorFromAuthorId(author).name;
    authorSelector = ".authorColors span." + authorClass;
    y$ = dynamicCSS.selectorStyle(authorSelector);
    y$.borderBottom = "2px solid " + color;
    z$ = parentDynamicCSS.selectorStyle(authorSelector);
    z$.borderBottom = "2px solid " + color;
    z1$ = dynamicCSS.selectorStyle(".authorColors .primary-" + authorClass + " ." + authorClass);
    z1$.borderBottom = '0px';
    z2$ = outerDynamicCSS.selectorStyle("#sidedivinner div.primary-" + authorClass);
    z2$.borderRight = "solid 5px " + color;
    z2$.paddingRight = '5px';
    z3$ = outerDynamicCSS.selectorStyle("#sidedivinner div.primary-" + authorClass + "::after");
    z3$.content = '#';
    z3$.display = 'block';
    z3$.width = '10px';
    z3$.border = '1px solid black';
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
    return authorViewUpdate($(args.node));
  }, 200);
}
out$.aceKeyEvent = aceKeyEvent;
function aceKeyEvent(hook_name, context, cb){
  var evt;
  evt = context.evt;
  if (evt.keyCode === 13) {
    return hasEnter = true;
  }
}
out$.aceEditEvent = aceEditEvent;
function aceEditEvent(hook_name, context, cb){
  var callstack, x$;
  callstack = context.callstack;
  if (callstack.type !== 'setWraps') {
    return;
  }
  x$ = $('iframe[name="ace_outer"]').contents();
  x$.find('#sidediv').css({
    'padding-right': '0px'
  });
  x$.find('#sidedivinner').css({
    'max-width': '180px',
    overflow: 'hidden'.o
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
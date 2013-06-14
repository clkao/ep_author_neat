authorViewUpdate = (node) ->
  $node = $ node
  lineNumber = $node.index!
  # dont process lines we dont know the number of.
  return false if lineNumber is -1
  ++lineNumber
  # index returns -1 what nth expects
  prevAuthor = authorLines[lineNumber] or false
  # console.log("previous author class was", prevAuthor);
  authors = {}
  authorClass = false
  authorLines[lineNumber] = null
  # set the authorLines.line count value back to nothing
  if $node.text!length > 0
    authorLines.line = {}
    authorLines.line.number = lineNumber
    $node.children 'span' .each ->
      spanclass = ($ this).attr 'class'
      # if its an author span.
      if (spanclass.indexOf 'author') isnt -1
        length = ($ this).text!.length
        # the length of the span
        if authorLines.line[spanclass]
          # append the length to existing chars
          authorLines.line[spanclass] = authorLines.line[spanclass] + length
        else
          # set a first value of length
          authorLines.line[spanclass] = length
    # end each span
    # get the author with the most chars
    mPA = 0
    # mPA = most prolific author
    # each author of this div
    $.each authorLines.line, (index, value) ->
      # if its not the line number
      if not (index is 'number')
        # if the value of the number of chars is greater than the old char
        if value > mPA
          # Set the new baseline #
          mPA := value
          # set the line Author :)
          authorClass := index
          authorLines[lineNumber] = authorClass
    # set the authorLines.line count value back to nothing
    authorLines.line = null
  # end if the div is blank
  prev = lineNumber - 1
  # previous item is always one less than current linenumber
  next = lineNumber + 1
  if $node.text!length is 0
    # get the left side author contains // VERY SLOW!
    $authorContainer = $ 'iframe[name="ace_outer"]' .contents!find '#sidedivinner' .find "div:nth-child(#lineNumber)"
      # line is blank, we should nuke the line number
      ..html ''
      ..css do
        'border-right': 'solid 0px '
        'padding-right': '5px'
  # add some blank padding to keep things neat
  # if the line has no text
  if authorClass
    $node .addClass "primary-#authorClass"
    # XXX: remove other old author class
    # Write authorName to the sidediv..
    # get previous authorContainer text
    # get the previous author class
    prevLineAuthorClass = authorLines[prev]
    return unless authorId = authorIdFromClass authorClass
    # Default text isn't shown
    # below throws true but we might need to rewrite anyway so lets do that..
    # console.log(authorClass, prevAuthor);
    authorChanged = authorClass isnt prevAuthor
    # Has the author changed, if so we need to uipdate the UI anyways..
    authorNameAndColor = authorNameAndColorFromAuthorId authorId
    # Get the authorName And Color
    $sidedivinner = $ 'iframe[name="ace_outer"]' .contents!find '#sidedivinner'
    # XXX use dynamic css and just set class
    $authorContainer = $sidedivinner.find "div:nth-child(#lineNumber)" .addClass "primary-#authorClass"
    # The below logic breaks when you remove chunks of content because the hook only
    # the plugin only redraws the actual line edited..  WTF!
    # To fix it we need to do a while loop over the authorLines object
    # Does the previous line have the same author?
    prevLineSameAuthor = authorLines[prev] is authorClass
    # this line shouldn't have any author name.
    # Does the next line have the same author?
    if authorLines[next] is authorClass
      $nextAuthorContainer = $sidedivinner.find "div:nth-child(#next)"
        ..html ''
      # does the previous line have the same author?
      if not prevLineSameAuthor
        $authorContainer.html authorNameAndColor.name
    else
      # write the author name
      if authorClass isnt prevLineAuthorClass and not authorChanged
        $authorContainer.html authorNameAndColor.name
      else
        # write the author name
        $authorContainer.html ''
    # If the authorClass is not the same as the previous line author class and the author had not changed
    $ 'iframe[name="ace_outer"]' .contents!
      .find '#sidedivinner' .find "div:nth-child(#lineNumber)"
      .attr 'title', 'Line number ' + lineNumber

# add a hover for line numbers
fadeColor = (colorCSS, fadeFrac) ->
  color = void
  color = colorutils.css2triple colorCSS
  color = colorutils.blend color, [1 1 1 ], fadeFrac
  colorutils.triple2css color

getAuthorClassName = (author) ->
  'author-' + author.replace /[^a-y0-9]/g, (c) ->
    if c is '.'
      '-'
    else
      'z' + c.charCodeAt(0) + 'z'

export function aceSetAuthorStyle(name, context)
  { dynamicCSS, outerDynamicCSS, parentDynamicCSS, info, author, authorSelector } = context
  if info
    return 1 unless color = info.bgcolor
    authorClass = getAuthorClassName author
    authorSelector = ".authorColors span.#authorClass"
    # author style
    dynamicCSS.selectorStyle authorSelector
      ..border-bottom = "2px solid #color"
    parentDynamicCSS.selectorStyle authorSelector
      ..border-bottom = "2px solid #color"
    # primary author override
    dynamicCSS.selectorStyle ".authorColors .primary-#authorClass .#authorClass"
      ..border-bottom = '0px'
    # primary author style on left
    outerDynamicCSS.selectorStyle "\#sidedivinner > div.primary-#authorClass"
      ..border-right = "solid 5px #{color}"
      ..padding-right = '5px'

  else
    dynamicCSS.removeSelectorStyle authorSelector
    parentDynamicCSS.removeSelectorStyle authorSelector
  1

authorIdFromClass = (className) ->
  if (className.substring 0, 7) is 'author-'
    className = className.substring 0, 52
    (className.substring 7).replace /[a-y0-9]+|-|z.+?z/g, (cc) ->
      if cc is '-'
        '.'
      else
        if (cc.charAt 0) is 'z'
          String.fromCharCode Number cc.slice 1, -1
        else cc

authorNameAndColorFromAuthorId = (authorId) ->
  myAuthorId = pad.myUserInfo.userId
  # It could always be me..
  if myAuthorId is authorId
    return do
      name: 'Me'
      color: pad.myUserInfo.colorId
  # Not me, let's look up in the DOM
  authorObj = {}
  $ '#otheruserstable > tbody > tr' .each ->
    if authorId is ($ this).data 'authorid'
      $ this
        ..find '.usertdname' .each ->
          authorObj.name = $ this .text! || 'Unknown Author'
        ..find '.usertdswatch > div' .each ->
          authorObj.color = $ this .css 'background-color'
      authorObj
  # Else go historical
  if not authorObj or not authorObj.name
    authorObj = clientVars.collab_client_vars.historicalAuthorData[authorId]
  # Try to use historical data
  authorObj or do
    name: 'Unknown Author'
    color: '#fff'

authorLines = {}

# When the DOM is edited
export function acePostWriteDomLineHTML(hook_name, args, cb)
  # avoid pesky race conditions
  setTimeout (-> authorViewUpdate args.node), 200ms

# on an edit
export function aceEditEvent(hook_name, {callstack}, cb)
  return unless callstack.type is \setWraps
  $ 'iframe[name="ace_outer"]' .contents!
    # no need for padding when we use borders
    ..find '#sidediv' .css 'padding-right': '0px'
    # set max width to 180
    ..find '#sidedivinner' .css do
      'max-width': '180px'
      overflow: 'hidden'
    ..find '#sidedivinner > div' .css do
      'text-overflow': 'ellipsis'
      overflow: 'hidden'

# For those who need them (< IE 9), add support for CSS functions
isStyleFuncSupported = CSSStyleDeclaration::getPropertyValue?

if not isStyleFuncSupported
  CSSStyleDeclaration::getPropertyValue = (a) -> @getAttribute a
  CSSStyleDeclaration::setProperty = (styleName, value, priority) ->
    @setAttribute styleName, value
    priority = if typeof priority isnt 'undefined' then priority else ''
    if not (priority is '')
      rule = new RegExp (RegExp.escape styleName) + '\\s*:\\s*' + RegExp.escape value + '(\\s*;)?', 'gmi'
      @cssText = @cssText.replace rule, styleName + ': ' + value + ' !' + priority + ';'
  # Add priority manually
  CSSStyleDeclaration::removeProperty = (a) -> @removeAttribute a
  CSSStyleDeclaration::getPropertyPriority = (styleName) ->
    rule = new RegExp (RegExp.escape styleName) + '\\s*:\\s*[^\\s]*\\s*!important(\\s*;)?', 'gmi'
    if rule.test @cssText
      'important'
    else
      ''

# Escape regex chars with \
RegExp.escape = (text) -> text.replace /[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'

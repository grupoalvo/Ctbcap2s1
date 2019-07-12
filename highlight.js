var items = new Array();

// get references to elements
var oSearchWords = document.getElementById("searchWords");
var oOut = document.getElementById("out");
var oContent = document.getElementById("content");
var oNavigation = document.getElementById("navigation");

// highlight colors (used for multiple term highlights)
var colors = new Array('#ffff66', '#a0ffff', '#99ff99', '#ff9999', '#ff66ff',
                       '#880000', '#00aa00', '#886800', '#004699', '#990099');

// save un-highlighted text so each search starts w/ original text
var oOriginalContent = oContent.innerHTML;

// navigation control variables
var nFound = 0;           // occurrences found
var currentFoundIndex = 0;  // occurrence last navigated to

// main function to find term typed in searchTerms text control
// It replaces each occurence of term with the term wrapped in
// a named anchor tag and a <span> that highilghts it
function findSingleTerm() {
  // console.log("Find: " + oSearchWords.value);
  
  var searchTerm = searchWords.value;
  
  var highlightedContent = oOriginalContent;
  
  var replacementRegEx = new RegExp('(' + searchTerm + ')','gi');
  var index = 0;
  
  // console.log("Before replace term = \"" + searchTerm + "\"" );
  
  highlightedContent = highlightedContent.replace(replacementRegEx,function(match,p1,offset){
      return highlightTerm(match, ++index);
    });
  
  oContent.innerHTML = highlightedContent;

  // console.log("findText exit");
  
  nFound = index; // return number of matches found
  currentFoundIndex = 1;
  
  if ( nFound == 0 ) {
    oNavigation.innerHTML = "Not found";
  }
  else {
    updateNavigation(currentFoundIndex);
  }

} // findSingleTerm()

// update navigation controls: << < 2 of 5 > >>
function updateNavigation(ixTarget) {
    var navigation = "";
    currentFoundIndex = ixTarget;
    var ixPrev = currentFoundIndex - 1;
    var ixNext = currentFoundIndex + 1; 
    if (ixPrev < 1 ) ixPrev = 1;
    if (ixNext > nFound ) ixNext = nFound;
    navigation += navigationLink(1,"&Lt;&nbsp;");
    navigation += navigationLink(ixPrev,"&lt;");
    navigation += " " + currentFoundIndex + " of " + nFound + " ";
    navigation += navigationLink(ixNext, "&gt");
    navigation += navigationLink(nFound, "&nbsp;&Gt;");
    oNavigation.innerHTML = navigation;
}

// format single navigation button
function navigationLink(ixTarget,linkText) {
  var link = "";
  
  if ( typeof(linkText) == "undefined" ) {
    linkText = ""+ixTarget;
  }
  
  if ( ixTarget == currentFoundIndex ) {
    link = "<span onclick=\"return false;\">"+linkText+"</span>";  
  } else
  {
    link = "<a href=\"#found."+ixTarget+"\" onclick=\"updateNavigation("+ixTarget+")\">"+linkText+"</a>";
  }
  return link;
}

/* find and highglight multiple terms at once
function findMultipleTerms() {
  console.log("Find: " + oSearchWords.value);
  
  items = searchWords.value.split(' ');
  
  var i = 0;
  
  var highlightedContent = oOriginalContent;
  
 for (var i = 0; i < items.length; i++)
 {
  var replacementRegEx = new RegExp('(' + items[i] + ')','gi');
  var index = 0;
  
  console.log("Before replace term = \"" + items[i] + "\"" );
  
  highlightedContent = highlightedContent.replace(replacementRegEx,function(match,p1,offset){
      return highlightTerm(match, i, ++index);
    });
  }
  
  oContent.innerHTML = highlightedContent;

  console.log("findText exit");

} // findMultipleTerms()
*/

// template for highlighted anchor links that replace each found search term
var highlightTemplate = "<span style=\"background-color:{color};\"><a name=\"{anchor}\">{term}</a></span>";

// Return a highlighted search term and anchor link
// term = search term (ex: "fred")
// ixFound = index of given term (i.e 3 = 3rd occurence of "fred")
function highlightTerm(term,ixFound) {
  var sMarkup = highlightTemplate;
  var color = colors[0]; // future: support multiple colors
  var anchor = anchorName(ixFound);
  // console.log("Markup: " + sMarkup );  
  sMarkup = sMarkup.replace(/\{color\}/g,color);
  // ### optional: Append #88 superscript after term so we 
  // ### can see that navigation is going to the expected index
  term = term + "<sup>#"+ixFound+"</sup>"; // remove to hide found index suffix
  sMarkup = sMarkup.replace(/\{term\}/g,term);
  sMarkup = sMarkup.replace(/\{anchor\}/g,anchor);
  // console.log("Markup: " + sMarkup );
  return sMarkup;
}

// return unique in-page anchor name like "found.##"
function anchorName(ix) {
  // console.log("anchor" + ix);
  return "found." + ix;
}

/* ### JavaScript alternative to default in-page link behavior
window.scrollTo(0,document.getElementById('scrollToHilight').offsetTop);
*/

/* ### get search terms from referrer's Google search parameters ###
if (document.referrer.indexOf('google') != -1 &&
    document.referrer.indexOf('q=') != -1)
{
  var queryTermsRegExp = new RegExp('q=([^&]+)');
  if (queryTermsRegExp.test(document.referrer))
  {
    items = RegExp.$1.split('+');
  }
}
*/

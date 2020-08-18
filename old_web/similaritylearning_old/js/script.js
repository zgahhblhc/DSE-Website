/** The base asset URL, used for loading JSON and setting the image URL
 *  This URL can be of different place, so if the JSON-RPC is host somewhere else,
 *  you can still load the JSON using the functions below. Might be helpful for
 *  load balancing.
 */
var AssetsURL = document.baseURI.substring(0, document.baseURI.lastIndexOf("/") + 1)
                + "assets/";

/** The LoadJSON function to load, parse, and invoke callback with a optional attribute
 *  This function is used to load the JSON file, parse it and operate on the parsed object
 *  to set the content of the site.
 *
 *  Future: use JQuery's HTTP request function and Lodash's JSON parse function.
 */
function LoadJSON(datasetName, assetURL, idName, callback, attribute){
  var datasetName = datasetName + ".json";
  var httpRequest = new XMLHttpRequest();
  httpRequest.open("GET", assetURL + datasetName, true);
  httpRequest.onload = function(e){
    if (httpRequest.readyState ===4 && httpRequest.status === 200)
      callback(JSON.parse(httpRequest.responseText), assetURL, idName, attribute);
    else
      console.error(httpRequest.statusText);
  }
  if (!AssetsURL.includes("file:///")) httpRequest.send(null);
}

/** The LoadSlide function used to load slides and banner at a interval
 *  This function is the callback function for LoadJSON, it will set the image src
 *  for the banner or slides at a interval passed in as attribute. If the title is
 *  unset, then it knows its for banner, else is for slides.
 *
 *  Future: provide a template for the slides and banner to be more flexible.
 */
function LoadSlide(dataset, assetURL, idName, attribute){
  var currIndex = 0;
  var dataset = dataset["slides"] === undefined ? [] : dataset["slides"];

  if (dataset.length !== 0){
    setInterval(function(){
      document.getElementById(idName + "Image").src =
        assetURL + dataset[currIndex]["image"];
      if (dataset[currIndex]["title"] !== undefined &&
          dataset[currIndex]["title"] !== null &&
          dataset[currIndex]["title"] !== ""){
        document.getElementById(idName + "Title").innerHTML =
          dataset[currIndex]["title"];
        document.getElementById(idName + "Content").innerHTML =
          dataset[currIndex]["content"];
      }
      ++currIndex; currIndex = currIndex >= dataset.length ? 0 : currIndex;
    }, attribute["interval"]);
  }
}

/** The LoadContent function used to load content into the site
 *  This function is the callback function for LoadJSON, it will set the content
 *  of the website using the provided templates and data. If the image attribute
 *  is not set, then it will set the img tag to be invisible for better display.
 *
 *  Future: use Lodash to operate on the parsed object to make it more efficient.
 */
function LoadContent(dataset, assetURL, idName, attribute){
  var title = dataset["title"] === undefined ? "" : dataset["title"];
  var separator = dataset["separator"] === undefined ? "" : dataset["separator"];
  var template = dataset["template"] === undefined ? "" : dataset["template"];
  var contents = dataset["contents"] === undefined ? {} : dataset["contents"];
  var chain = dataset["chain"] === undefined ? "" : dataset["chain"];

  if (title !== undefined && title !== null && title != "")
    document.getElementById("title").innerHTML = title;

  if (attribute["flush"] === undefined || attribute["flush"] === null ||
      attribute["flush"] === "" || attribute["flush"] === true)
    document.getElementById(idName).innerHTML = "";

  if (separator !== undefined && separator !== null && separator !== "")
    document.getElementById(idName). innerHTML += separator;

  if (template.length !== 0 && contents.length !== 0)
    for (var i = 0; i < contents.length; ++i){
      var contTemp = template;
      var contTitle = contents[i]["title"];
      var contAuthor = contents[i]["author"];
      var contAuthorURL = contents[i]["authorURL"];
      var contCreateTime = new Date(contents[i]["time"]);
      var contImage = contents[i]["image"]
      var contImageURL = assetURL + contImage;
      var contArticle = contents[i]["article"];

      contTemp = contTemp.split("TITLE").join(contTitle).
                replace("AUTHORURL", contAuthorURL).
                replace("AUTHOR", contAuthor).
                replace("TIME", contCreateTime.toLocaleString()).
                replace("ARTICLE", contArticle);

      if (contImage === undefined ||  contImage === null ||  contImage === "")
        contTemp = contTemp.replace("src='IMAGEURL'", "style='display: none;'");
      else contTemp = contTemp.replace("IMAGEURL", contImageURL);

      document.getElementById(idName).innerHTML += contTemp;
    }

    if (chain !== undefined && chain !== null && chain !== "")
      LoadJSON(chain, assetURL, idName, LoadContent, {"flush": false});
}

/** The LoadList function used to load list items into the site
 *  This function is the callback function for LoadJSON, it will set the items
 *  of the list using the provided templates and data. If the image attribute
 *  is not set, then it will set the img tag to be invisible for better display.
 *
 *  Future: use Lodash to operate on the parsed object to make it more efficient.
 */
function LoadList(dataset, assetURL, idName, attribute){
  var separator = dataset["separator"] === undefined ? "" : dataset["separator"];
  var template = dataset["template"] === undefined ? "" : dataset["template"];
  var contents = dataset["contents"] === undefined ? {} : dataset["contents"];
  var chain = dataset["chain"] === undefined ? "" : dataset["chain"];

  if (attribute["flush"] === undefined || attribute["flush"] === null ||
      attribute["flush"] === "" || attribute["flush"] === true)
    document.getElementById(idName).innerHTML = "<h2 class='title'>"
      + attribute["title"] + "</h2>";

  if (separator !== undefined && separator !== null && separator !== "")
    document.getElementById(idName). innerHTML += separator;

  if (template.length !== 0 && contents.length !== 0)
    for (var i = 0; i < contents.length; ++i){
      var listTemp = template;
      var itemTemp = "<li>TEXT</li>";
      var linkTemp = "<a href='LINK'>TEXT</a>";
      var listTitle = contents[i]["title"];
      var listAuthor = contents[i]["author"];
      var listAuthorURL = contents[i]["authorURL"];
      var listCreateTime = new Date(contents[i]["time"]);
      var listArticle = contents[i]["article"];
      var listItemCont = "";

      for (var j = 0; j < listArticle.length; ++j){
        listItemCont += itemTemp.replace("TEXT",
        (listArticle[j]["link"] === undefined ||
          listArticle[j]["link"] === null ||
          listArticle[j]["link"] === "") ?
        listArticle[j]["text"] :
        linkTemp.replace("LINK", listArticle[j]["link"]).
        replace("TEXT", listArticle[j]["text"]));
      }

      listTemp = listTemp.split("TITLE").join(listTitle).
                replace("AUTHORURL", listAuthorURL).
                replace("AUTHOR", listAuthor).
                replace("TIME", listCreateTime.toLocaleString()).
                replace("ARTICLE", listItemCont);

      document.getElementById(idName).innerHTML += listTemp;
    }

  if (chain !== undefined && chain !== null && chain !== "")
    LoadJSON(chain, assetURL, idName, LoadList, {"flush": false});
}

/** The click event handler for the navigation buttons
 *  It calls on the callback funtion to make the button appear 'active' and
 *  it calls on the load function to change the content of the website.
 *  When it is not 'home', it will make the slides invisible, etc.
 *
 *  Future: add more events? more actions? more cases? improve it somehow.
 */
$('nav .button').click(function(){
  $('nav .button').removeClass("active"); $(this).addClass("active");
  //console.log(this.dataset.storage);
  LoadJSON(this.dataset.storage, AssetsURL, "content", LoadContent, {"flush": true});
  if (this.dataset.storage === "home") {
    $("#slide").css("display", "inline-block");
    $("#widget, #side").css("display", "flex");
  } else {
    $("#slide").css("display", "none");
    $("#widget, #side").css("display", "none");
  }
});
$('nav .button').singletap(function(){
  $('nav .button').removeClass("active"); $(this).addClass("active");
  //console.log(this.dataset.storage);
  LoadJSON(this.dataset.storage, AssetsURL, "content", LoadContent, {"flush": true});
  if (this.dataset.storage === "home") {
    $("#slide").css("display", "inline-block");
    $("#widget, #side").css("display", "flex");
  } else {
    $("#slide").css("display", "none");
    $("#widget, #side").css("display", "none");
  }
});

// The intial load functions to load the front page.
LoadJSON("home", AssetsURL, "content", LoadContent, {"flush": true});
LoadJSON("news", AssetsURL, "news", LoadList, {"title" : "Announcements", "flush": true});
LoadJSON("outline", AssetsURL, "outline", LoadList, {"title" : "Course Outline", "flush": true});
LoadJSON("info", AssetsURL, "info", LoadList, {"title" : "General Info", "flush": true});
LoadJSON("book", AssetsURL, "book", LoadList, {"title" : "Reference Book", "flush": true});
LoadJSON("assess", AssetsURL, "assess", LoadList, {"title" : "Course Assessment", "flush": true});
LoadJSON("grade", AssetsURL, "grade", LoadList, {"title" : "Grading Criteria", "flush": true});

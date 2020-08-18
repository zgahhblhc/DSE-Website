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
    if (httpRequest.readyState === 4 && httpRequest.status === 200)
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
	var contArticle = contents[i]["article"].join('\n'); /*Tyler's change, to allow articles to be lists in assest json files*/

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
LoadJSON("slide", AssetsURL, "slideshow", LoadSlide, {"interval" : 5000});
LoadJSON("home", AssetsURL, "content", LoadContent, {"flush": true});
LoadJSON("press", AssetsURL, "press", LoadList, {"title" : "Press Coverage", "flush": true});
LoadJSON("news", AssetsURL, "news", LoadList, {"title" : "News", "flush": true});
LoadJSON("events", AssetsURL, "events", LoadList, {"title" : "Events", "flush": true});


/* Random number generator to gennerate random number of specific needs */
var RNG = function(set = [], flag = true, min = 5, scale = 36) {
  var num = Math.round(Math.random() * scale);
  if (flag)
    while (num < min || set.includes(num)) num = Math.round(Math.random() * scale);
  else
    while (num < min || !set.includes(num)) num = Math.round(Math.random() * scale);
  return num;
}

/* Data generator for the logo, it is not random since the radius is now fixed*/
var RDG = function(ln = 0, cn = 36, set = [], flag = true) {
  var i = 1, data = [];
  for (i = 1; i <= cn; ++i) {
    if ((flag && set.includes(i)) || (!flag && !set.includes(i))) continue;
    //else data.push({x: i, y: ln, r: RNG([], true, 10, 18) / 2});
    else data.push({x: i, y: ln, r: 5});
  }
  return data;
}

/* The canvas used to draw the logo */
var logoCanvas = document.getElementById("logo").getContext("2d");
/* A set of color for the data to iterate over */
var logoColor = [
  'rgba(255, 99, 132, 0.50)', 'rgba(255, 99, 132, 0.50)', 'rgba(255, 99, 132, 0.50)',
  'rgba(255, 99, 132, 0.50)', 'rgba(255, 99, 132, 0.50)', 'rgba(54, 162, 235, 0.50)',
  'rgba(54, 162, 235, 0.50)', 'rgba(54, 162, 235, 0.50)', 'rgba(54, 162, 235, 0.50)',
  'rgba(54, 162, 235, 0.50)', 'rgba(255, 206, 86, 0.50)', 'rgba(255, 206, 86, 0.50)',
  'rgba(255, 206, 86, 0.50)', 'rgba(255, 206, 86, 0.50)', 'rgba(255, 206, 86, 0.50)',
  'rgba(75, 192, 192, 0.50)', 'rgba(75, 192, 192, 0.50)', 'rgba(75, 192, 192, 0.50)',
  'rgba(75, 192, 192, 0.50)', 'rgba(75, 192, 192, 0.50)', 'rgba(153, 102, 255, 0.50)',
  'rgba(153, 102, 255, 0.50)', 'rgba(153, 102, 255, 0.50)', 'rgba(153, 102, 255, 0.50)',
  'rgba(153, 102, 255, 0.50)', 'rgba(255, 159, 64, 0.50)', 'rgba(255, 159, 64, 0.50)',
  'rgba(255, 159, 64, 0.50)', 'rgba(255, 159, 64, 0.50)', 'rgba(255, 159, 64, 0.50)'
];
/* 5 lines to draw the logo, it is the dataset to hole the point data */
var logoData = { datasets: [
  { label: "Line 0", backgroundColor: logoColor, borderColor: logoColor, borderWidth: 1, data: []},
  { label: "Line 1", backgroundColor: logoColor, borderColor: logoColor, borderWidth: 1, data: []},
  { label: "Line 2", backgroundColor: logoColor, borderColor: logoColor, borderWidth: 1, data: []},
  { label: "Line 3", backgroundColor: logoColor, borderColor: logoColor, borderWidth: 1, data: []},
  { label: "Line 4", backgroundColor: logoColor, borderColor: logoColor, borderWidth: 1, data: []}
]};
/* Generate the logo's data using the RDG function, TODO: make this static instead of dynamic */
logoData.datasets[0].data = RDG(5, 36, [10, 11, 12, 20, 21, 22, 23, 24], true);
logoData.datasets[1].data = RDG(4, 36, [1, 2, 3, 8, 9, 10, 11, 12], false);
logoData.datasets[2].data = RDG(3, 36, [4, 5, 6, 7, 8, 9, 12, 22, 23, 24, 34, 35, 36], true);
logoData.datasets[3].data = RDG(2, 36, [1, 2, 3, 8, 9, 10, 11, 12, 22, 23, 24], false);
logoData.datasets[4].data = RDG(1, 36, [10, 11, 12, 13, 14, 22, 23, 24], true);
/* The chart function to draw the logo */
var logoChart = new Chart(logoCanvas, {
  type: "bubble",
  data: logoData,
  options: {
    responsive: true, // Re-shape the data according to adjusted size
    responsiveAnimationDuration: 1500,
    maintainAspectRatio: true,
    events: ["mousemove", "mouseout", "click", "touchstart", "touchmove", "touchend"],
    // onClick: function() { console.log("CLICKED"); },
    // onResize: function(chart, size) {},
    hover: { mode: "single", onHover: null },
    scales: {
      // Don't display axes for better display result
      xAxes: [{ display: false, stacked: true, ticks: { min: 0, max: 37, stepSize: 1 } }],
      yAxes: [{ display: false, stacked: true, ticks: { min: 0, max: 6, stepSize: 1 } }]
    },
    layout: { padding: 0 },
    title: { display: false, text: "DSE Lab" },
    legend: { display: false },
    tooltips: { enabled: false },
    animation: { duration: 1500, easing: "easeInOutBack", onProgress: null, onComplete: null },
    elements: { point: { borderWidth: 0 } }
  }
});

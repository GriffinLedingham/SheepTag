var canvas;  
var stage;      
var loader;
var level;
var preload;

function init() {

  canvas = document.getElementById("gameCanvas");
  stage = new createjs.Stage(canvas);

  //No content loading currently so just call loading finished
  handleComplete();

  stage.update(); 
}

function handleComplete(event) {
  doneLoading();
}

function doneLoading(event) {
  restart();
}

function watchRestart() {
  stage.update(); 
}

function restart() {
  stage.removeAllChildren();
  stage.clear();
  level = new Level(stage);           

  if (!createjs.Ticker.hasEventListener("tick")) { 
    createjs.Ticker.addEventListener("tick", tick);
  }                                     
}

function tick(event) {
  stage.update(event);
}
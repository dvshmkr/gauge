// Notes: 
//Features needed:
// Remove secret key from triptrak settings.py on linode
//  Clearing search bar should clear results count
//  Provide more info in the playqueue viewmatches
//  Provide postback free logins
//  Add heading to loginView
//  Add padding to welcome message
//  preload next three songs in playqueue
//  Keep session alive until logoff
//  provide favicon
// Adding a single title to the queue does not support moving but should!

/*global window */
window.onload = function() {
  'use strict';

  function View(id) {
    this.id = id;
    this.class = id;
    this.elem = document.getElementById(id + "-view");    
    this.visible = false;
    this.headings = {};
    this.draggable = false;
    this.current = null;

    this.pane = this.elem.appendChild(document.createElement("div"));
    this.pane.className = "pane";
    this.pane.setAttribute("context", "artistset");

    app.views.push(this.elem);

    // If fields is defined, only process the fields specified
    // Load all fields into an object
    this.setFields = function(fields){
      this.fields = fields;
    }

    this.addHeading = function(id, size, label = this.class) {
      this.headings[id] = {
        size: size,
        label: toTitleCase(label),
        elem: this.elem.insertBefore(document.createElement(size), this.pane)
      }     
    }    

    this.setHeading = function(id, string) {
      this.headings[id].label = string;      
    }

    this.setBackContext = function(context) {
      this.elem.querySelector("button").setAttribute("context", context);
    }

    this.display = function (data) {
      this.timer = new Timer(this.elem.id);
      this.timer.start();

      // display fieldNames 
      if (this.fieldNames && !this.view.querySelector("#field-names")) {
        this.view.insertBefore(this.fieldNames, this.elem);
      }

      // Clear the list-panel
      this.pane.innerHTML = "";      
      this.count = 0;
      

      for (let item in data) {

        this.row = document.createElement("div");
        this.row.classList.add("record");
        
        this.postRecord(data[item]);
     
        if (this.selected) {
          // TODO: why artist specific?
          if (row.innerHTML == app.artistSelected.innerHTML) {
            app.artistSelected = row;
            row.classList.add("selected");
          }
        }
        
        if (this.published){
          if(this.published.indexOf(data[item]) !== -1){
              this.row.classList.add("published");
          }
        }       
        this.pane.appendChild(this.row);
        this.count++;
      }      

      // if (this.draggable) {
      //   slist(this.pane);
      // }
      
      this.postHeadings();

      this.timer.stop();
    };

    this.postRecord = function(record) {
        this.row.setAttribute("context", this.class);  
        this.row.innerHTML = record;
    }

    this.postHeadings = function() {

      Object.keys(this.headings).forEach(k => {
        if(k == 'count'){
          this.headings[k].elem.innerHTML = `${this.count} ${this.headings[k].label}`;
          if (this.count > 1) {
            this.headings[k].elem.innerHTML += "s";
          }          
        } else {
          this.headings[k].elem.innerHTML = this.headings[k].label;
        }
      });
    }

    this.filter = function(matches) {
      if (this.id == "albumlist") {

      }
      this.matches = matches;
      this.display(matches);
    }

    this.load = function(data) {
      this.data = data;
      this.display(this.data)
    }

    this.clear = function() {
      this.pane.innerHTML = "";
      for (let h in this.headings) {
        this.headings[h].innerHTML = "";
      }
    }

    this.status = function() {
      console.log(this);
    }

    this.setPane = function() {
      this.pane = new Pane(this.class);
      this.elem.appendChild(this.pane.elem);     
    }

    this.clearPane = function() {
      this.pane.innerHTML = "";
    }

    this.enableRadioButtons = function() {
      let choices = ["Song", "Genre", "Year"];
      let radios = this.elem.insertBefore(document.createElement("div"), this.input);
      radios.id = "advanced-search";
      this.searchBy = document.createElement("div");
      this.searchBy.innerHTML = "Search By...";
      radios.appendChild(this.searchBy);

      // A div to hold the radio buttons
      let div = document.createElement("div");
      div.id = "radio-group";
      div.classList.add("inline");
      radios.appendChild(div);

      choices.forEach(btn => {
        let d2 = document.createElement("div");
        d2.classList.add("radio");
        let radio = document.createElement("input");
        radio.type = "radio";
        radio.id = btn;
        radio.name = "search-type";
        radio.value = btn;
        radio.setAttribute("context", "search-type");
        let lbl = document.createElement("label");
        lbl.setAttribute("for", btn);
        lbl.innerHTML = btn.toUpperCase();
        d2.appendChild(radio);
        d2.appendChild(lbl);
        div.appendChild(d2);
      });

      let btn = document.createElement("button");
      btn.id = "start-search";
      btn.setAttribute("context", "start-search");
      btn.className = "disabled";
      btn.innerHTML = "Start Search";
      // btn.className = "right";
      this.elem.insertBefore(btn, this.pane);   
    }

    this.enableFilter = function(classname = "filter") {   
      this.input = this.elem.insertBefore(document.createElement("input"), this.pane);   
      this.input.id = this.id + "-filter";
      this.input.type = "search";
      this.input.name = "q";
      this.input.placeholder = "Filter " + this.id;
      this.input.className = classname;
      this.input.setAttribute("context", "start-filter");
      this.input.setAttribute("view", this.id + "View");
      this.input.setAttribute("autocomplete", "off");    
    }

    this.enableSearch = function(classname = "search") {
      this.input = this.elem.insertBefore(document.createElement("input"), this.pane);   
      this.input.id = this.id + "-search";
      this.input.type = "search";
      this.input.name = "q";      
      this.input.className = classname;      
      this.input.setAttribute("view", this.id + "View");
      this.input.setAttribute("autocomplete", "off");             
    }

    this.enableBack = function(context) {
      this.back = this.elem.insertBefore(document.createElement("button"), this.pane);
      this.back.innerHTML = "Back";
      this.back.setAttribute("context", context);
      this.back.className = "right";
    }

    this.enableSave = function(context) {
      this.save = this.elem.insertBefore(document.createElement("button"), this.pane);
      this.save.innerHTML = "Save Order";
      this.save.setAttribute("context", context);
      this.save.classList.add("hidden", "right");
      
    }

    this.showSave = function() {
      this.save.classList.remove('hidden');
    }

    this.hideSave = function() {
      this.save.classList.add('hidden');      
    }

    this.enableDraggable = function() {
      this.draggable = true;
    }
  }
  
  class PlaylistView extends View {

    constructor(id) {
      super(id);      
    }

    postRecord = function(record) {        
        let name = document.createElement("span");
        name.classList.add("TIT2");
        name.setAttribute("context", this.class)
        name.innerHTML = record.name;
        this.row.dataset.playlistid = record.id;
        this.row.dataset.name = record.name;
        let remove = document.createElement("span");
        remove.classList.add("remove");
        remove.setAttribute("context", "confirmPlaylistRemove");
        remove.innerHTML = ICONS.remove;
        this.row.appendChild(name);
        this.row.appendChild(remove);
        this.row.classList.add(this.class, "record");        
      // this.postHeadings();
    }

    remove = function(playlistid) {              
      getData("deletePlaylist", playlistid);
    }
  }

  class TitleView extends View {

    constructor(id) {
      super(id);
    }

    postRecord = function(record) {        
        this.row.dataset.path = record.path;
        this.row.dataset.id = record.id;
        this.row.dataset.playlistId = record.playlistId;
        this.row.dataset.position = record.position;
        this.row.setAttribute("context", "title"); // should be title or playlistTitle
        if (this.isPlayable) {
          // insert add button before each title
          let play = document.createElement("span");            
          play.classList.add("field");
          play.setAttribute("context", "add");
          play.innerHTML = ICONS.add;
          this.row.appendChild(play);
        }
        this.fields.forEach(field => {
          let fld = document.createElement("span");
          fld.classList.add(field);
          fld.innerHTML = record[field] || "Missing Title!";
          this.row.appendChild(fld);
        });
        if (this.elem.querySelector("button").getAttribute("context") == "view-playlist") {
          // Allow titles in a playlist to be deleted.
          let remove = document.createElement("span");
          remove.classList.add("remove");
          remove.setAttribute("context", "confirmTitleRemove");
          remove.innerHTML = ICONS.remove;          
          this.row.appendChild(remove);
        }      
    }

    saveOrder = function() {
      let list = this.pane.children;
      let playlistId = list[0].dataset.playlistId;
      let data = [];
      for(let i=0; i < list.length; i++) {
        let rec = list[i];
        data[i] = {
          id: rec.dataset.id,
          TIT2: rec.querySelector(".TIT2").innerHTML,
          path: rec.dataset.path,
          playlistId: rec.dataset.playlistId,
          position: i
        }
      }

      getData("updatePlaylist", [playlistId, data]);      
    }

    remove = function(path) {
      getData("removeFromPlaylist", [app.currentPlaylist.playlistid, path]);
    }
  }

  class AlbumListView extends View {
    constructor(id) {
      super(id);
    }
    postRecord = function(record) {
      this.row.setAttribute("context", this.class);
      this.row.innerHTML = `${record.album} - (by ${record.artist})`;          
      this.row.dataset.album = record.album;
      this.row.dataset.artist = record.artist;    
    }
  }

  class SearchView extends View {
    constructor(id) {
      super(id);
    }
    postRecord = function(record) {
      this.row.classList.add("search-result","record");
      this.row.dataset.path = record;
      if (this.isPlayable) {
        // insert add button before each title
        let play = document.createElement("div");            
        play.classList.add("add");
        play.setAttribute("context", "add");
        play.innerHTML = ICONS.add;
        this.row.appendChild(play);
      }

      let data = record.split("/");
      let title = data[data.length - 1];
      title = title.substring(0, title.lastIndexOf('.'));
      let artist = data[2];
      let album = data[3];

      this.fields.forEach(field => {
        let fld = document.createElement("span");
        fld.classList.add(field);
        fld.innerHTML = `Title: ${title}<br>Artist: ${artist}<br>Album: ${album}`;
        this.row.appendChild(fld);
      });        
    }
  }


  function PlayQueue(panel) {

    this.panel = panel;    
    this.queue = {};
    this.position = null;
    this.playing = false;    
    this.view = document.getElementById("player-view");
    this.audio = document.getElementById("audio");

    this.saveButton = this.view.insertBefore(document.createElement('button'),this.view.firstChild);
    this.saveButton.innerHTML = "Save";
    this.saveButton.classList.add("right");
    this.saveButton.setAttribute("context", "save");

    // Can you put the drag listeners on the pane instead of each node?
  
    this.append = function(target) {      
      let el = target.parentNode.cloneNode();
      el.classList.remove("search-result");

      el.setAttribute("context", "play");
      let title = document.createElement("span");
      title.classList.add("TIT2");
      title.setAttribute("context", "skip");
      title.innerHTML = target.parentNode.querySelector(".TIT2").innerHTML;
      let remove = document.createElement("span");
      remove.classList.add("remove");
      remove.setAttribute("context", "playQueueRemove");
      remove.innerHTML = ICONS.remove;
      el.appendChild(remove);
      el.appendChild(title);      
      this.panel.appendChild(el);      
      if(!this.playing) {
        this.panel.children[0].click();
      }
    }

    this.remove = function(target) {
      let title = target.parentNode;
      if (this.playing && this.playing == title) {
        document.getElementById("next").click();
      }
      title.parentNode.removeChild(title);
    }

    this.play = function(title) {      

      // rate.innerHTML = "1.00";
      if (this.playing) { // is any song playing?
        this.audio.pause();
        // this.playing.firstChild.innerHTML = ICONS.add;
        this.playing.classList.remove("playing");        
        if (this.playing == title) {
          this.playing = false;
          return;
        }
      }
      
      this.playing = title; // object refering to currently playing title
      this.view.querySelector("h4").innerHTML = title.querySelector(".TIT2").innerHTML;
      let src = title.dataset.path;
      src = src.replace(/&amp;/g, "&");
      this.audio.src = src.replace(/#/g, "%23");
      this.audio.play();        
    }

    this.skipTo = function(target) {
      let title = target.parentNode;
      this.play(title);
    }

    this.close = function() {
      this.audio.pause();
      this.playing = false;
      this.panel.innerHTML = "";
      this.view.classList.add("hidden");
    }

    this.save = function(name) {      
      // Save playqueue titles as a new playlist
      let titles = [];
      let list = this.panel.children;
      for (let i=0; i< this.panel.children.length; i++) {
        titles.push({path: list[i].dataset.path, title: list[i].querySelector('.TIT2').innerHTML, position: i});
      }
      getData("CreatePlaylist", [name, titles]);
    }
  }



  function App() {
    this.elem = document.getElementById("app-container");
    this.artistSelected = null;
    this.albumSelected = null;
    this.fieldNames = {};
    this.gdr = null;
    this.genreListset = null;
    this.lowerWords = null;
    this.mouseTimer = -1;
    this.playlistSelected = null;
    this.prefixArray = ["A", "B", "C", "D", "E", "F"];
    this.responseText = document.getElementById("responseText");
    this.scrollTimer = -1;
    this.selectedElement = null;
    this.srcBase = null;    
    this.views = [];
    this.popup = null;

    this.getPrefixArray = function() {
      return this.prefixArray;
    }

    this.getView = function(view) {      
      return this[view + "View"];
    }

    this.showView = function(view) {
      if (!view) return;
      app.views.forEach(v => {
        if(v.id == view) {
          v.classList.remove('hidden');          
        } else {
          if(v.id != "player-view") {
            v.classList.add('hidden');
          }
        }        
      });
    }

  }

  function Timer(id) {
    this.id = id;
    this.startTime = 0;
    this.stopTime = 0;

    this.start = function() {
      this.startTime = Date.now();
    };

    this.stop = function() {
      this.stopTime = Date.now();
      let elapsedTime = this.stopTime - this.startTime;
      console.log(`${this.id} in ${elapsedTime} milliseconds`);
    };
  }

  // Sends request to backend server  /// a method of the App class & switch to fetch?
  function getData(action, acton) {    
    let request = {};
    request.action = action;
    if (acton) { request.acton = acton; }
    let localTimer = new Timer(action);
    console.log("0:", request);
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {      
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          let text = JSON.parse(xhr.responseText);          
          responseText.innerHTML = xhr.responseText;
          localTimer.stop();
          console.log("Success:", text);
          showContent(text);
        } else if (xhr.status == 0) {
          console.log("Ajax request aborted", xhr.status);
        } else {
          // error condition
          console.log("Error", xhr.statusText);
        }
      }
    };
    xhr.open("POST", "service.php", true);
    //xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Content-type", "application/json");
    /// do I need encodeURI or UTF8
    let req = JSON.stringify(request);
    console.log("Sending: ", req);
    localTimer.start();
    xhr.send(req);
    ///xhr.send(serialize(request)); // for non json request;    
    return xhr;
  }

  // Receives resonse from backend server and loads into DOM
  // list is a list of dataset objects
  // each dataset object consist of  { id: "id", class: "class", data: any, ususally an array ['a', 'b', ...]}
  function showContent(list) {
    let info; // used to build DOM elements
    let item; // used to store data items;

    // These are DIVS that receive results, TODO: can these be handled by set just below
    // let current = document.getElementById("current");
    
    for (let key in list){ // key is object key    
      let obj = list[key];
      // set is a dataset & is matched to a DIV id /// Need to change 'dataset' conflicts
      let set = document.getElementById(obj.id);
      let data = obj.data;
      // dataset DIVS are contained in a "view" (parent div) that is used
      // to hide and show the information
      let view = document.getElementById(obj.class + "-view");

      switch (obj.class) {
        case "songsearch":
          app.searchView.pane.classList.remove("loader");
          app.searchView.elem.querySelector("#start-search").innerHTML = "Start Search";
          
          app.searchView.load(data);
          // console.log(data);
          break;
        case "session":
          app.session = data;
          console.log(data);
          let name = toTitleCase(app.session.username);        
          document.querySelector("#welcome").innerHTML = `Welcome ${name}`;
          getData("getPlayList", name);
          break;
        case "srcbase":
          app.srcBase = data;
          break;
        case "current":
          // current.innerHTML = data[1];
          // document.getElementById("totalsize").innerHTML = "Total Size: " + data[0];
          // if(!list.debugset){
          //   debugset.innerHTML = "";
          // }
          break;
        case "fieldnames":
          Object.assign(app.fieldNames, data); // move to App class
          break;
        case "title":          
          app.titleView.load(data);
          let prior = app.titleView.headings["count"].elem.innerHTML;
          let icon = '<span class="field button" context="addall">+</span>';
          app.titleView.headings["count"].elem.innerHTML = icon + prior;
          if (app.titleView.elem.querySelector("button").getAttribute("context") == "view-playlist") {
            slist(app.titleView.pane);
          }
          break;
        case "artist":
          if (list.publishedArtist) {            
            app.artistView.published = list.publishedArtist.data;
            delete list.publishedArtist;
          }          
          app.artistView.load(data);
          break;
        case "album":
          if (list.publishedAlbum) {
            app.albumView.published = list.publishedAlbum.data;
            delete list.publishedAlbum;
          }          
          app.albumView.load(data);
          break;
        case "albumlist":
          app.albumlistView.load(data);
          break;
        case "playlist":
          app.playlistView.load(data);
          break;
        case "debug":
          debugset.innerHTML = "";
          for(item in obj.data){
              info = document.createElement("DIV");
              info.innerHTML = obj.data[item];
              set.appendChild(info);
          }
          set.append(info);
          view.hidden = false;
          break;
        case "genre":
          app.genreListset = obj.data;
          break;
        case "lowercase":
          app.lowerWords = [];
          obj.data.forEach(word => app.lowerWords.push(word));
          break;
        case "statusset":
          info = obj.data;
          console.log(info);
          if(info[0] == "Error") {
            alert(info);
          }
          break;
        default:
          console.log("Unknown response", obj.class);
          break;
      }
    }    
  }

  // TODO
  // function updateStats() {    
  //   let mem = document.getElementById("memory");    
  //   let nodeCount = document.getElementById("nodeCount");
  //   nodeCount.innerHTML = "Nodes: " + document.getElementsByTagName('*').length;
  //   for (let key in window.per"album-albview", formance.memory) {
  //     let info = document.getElementById(key);
  //     info.innerHTML = key +": " + window.performance.memory[key].toLocaleString();      
  //   }
  // }

  function checkFormat(el) { 
    // requires lowerWords to function
    if (!app.lowerWords) { /// move to App
      let msg = "checkFormat not available: ensure file 'lowercase' is in place";
      console.log(msg);
      return;
    }

    let re = /_|^[a-z]/;  // any word containing underscore or that begins with lower case letter
    let reStandard = /[A-Z]?[0-9]{1,2} - .+\./;
    let reTPE1prefix = /[A-Z]?[0-9]{1,2} - \[.+\] - .+\./;
    let reTPE1suffix = /[A-Z]?[0-9]{1,2} - .+ - \[.+\]\./;

    if(el.getAttribute("context") == "file" && !el.innerHTML.match(reStandard)) {
      el.classList.add("faultFormat");
    }

    if (el.innerHTML.match(/^ | $/)) {
      el.classList.add("faultCase");
      return;
    }

    let list = el.innerHTML.split(" ");
    list.some(word => {
      if (app.lowerWords.includes(word)){
        return;
      }
      if ( word.match(re) ) {
        el.classList.add("faultCase");
        return true;
      }
    });
  }

  function correctCase(string) {
    let tag = [];
    string = string.trim();
    string = string.replace(/_/g, ' ');
    let words = string.split(" ");
    words.forEach(word => {
      if (app.lowerWords.includes(word)) {
        tag.push(word);
        return;
      }
      tag.push(word.charAt(0).toUpperCase() + word.substring(1));
    });
    let result = tag.join(' ');
    return result;
  }

  function artistClick() {
    app.albumView.clear();
    // Remove any prior selection highlights
    if (app.playlistSelected) {      
      app.playlistSelected.classList.remove("selected");
      app.playlistSelected = null;
    }
    app.albumSelected = null;
    if (app.artistSelected){
      app.artistSelected.classList.remove("selected");
    }
    let fileset = app.srcBase + this.innerHTML; // TODO: fileset is really the path
    this.classList.add("selected");
    app.artistSelected = this;
    app.albumView.setHeading("selected-artist", app.artistSelected.innerHTML);    
    getData("getArtistAlbumList", fileset);
    app.showView('album-view')
  }

  function albumClick() {
    app.titleView.clear();
    if (app.albumSelected){
      app.albumSelected.classList.remove("selected");
    }
    let fileset = app.srcBase + app.artistSelected.innerHTML + "/"  + this.innerHTML;
    this.classList.add("selected");
    app.albumSelected = this;
    app.titleView.setHeading("selected-artist", app.artistSelected.innerHTML);    
    app.titleView.setHeading("selected-album", app.albumSelected.innerHTML);    
    getData("getTitleList", fileset);
    app.showView("title-view");    
  }

  function albumlistClick() {
    app.titleView.clear();
    if (app.albumSelected){
      app.albumSelected.classList.remove("selected");
    }
    let artistSelected = this.dataset.artist;
    let albumSelected = this.dataset.album;
    let fileset = app.srcBase + artistSelected + "/"  + albumSelected;
    this.classList.add("selected");
    app.albumSelected = this;
    app.titleView.setHeading("selected-artist", artistSelected);    
    app.titleView.setHeading("selected-album", app.albumSelected.innerHTML);
    app.titleView.setBackContext("view-albumlist");
    getData("getTitleList", fileset);
    app.showView("title-view");     
  }

  function playlistClick() {
    if (app.playlistSelected) {
      app.playlistSelected.classList.remove("selected");
    }
    if (app.artistSelected) {
      app.artistSelected.classList.remove("selected");
      app.artistSelected = null;
      app.albumView.pane.innerHTML = "Select An Artist";
    }
    if(app.albumSelected) {
      app.albumSelected.classList.remove("selected");
      app.albumSelected = null;
    }
    this.classList.add("selected");
    // this.setAttribute("context", "playlist");
    app.playlistSelected = this;    
    app.titleView.setHeading("selected-artist", "Playlist");    
    app.titleView.setHeading("selected-album", this.querySelector(".TIT2").innerHTML);  
    getData("getPlayListTitles", this.dataset.playlistid);
    app.showView("title-view");
  }

  // TODO: Can this be an object?
  function confirmUserAction(prompt, context, current) {
    let el = document.querySelector("#confirm-action");
    el.querySelector("#confirm-label").innerHTML = prompt;
    el.querySelector("#confirm-input").value = current;
   
    if (current){
      console.log("Current: ", current);
    }
    current = current === "&nbsp;" ? "" : current; // TODO: Whats this do?
    // input.value = current ? current : "";
    let ok = el.querySelector(".ok").setAttribute("context", context);    
    el.classList.add("popup-active");
    centerElement(el);
    app.popup = el;    
    input.focus();

  }

  function getUserInput(prompt, context, current) {
    let el = document.getElementById("get-input");
    document.getElementById("input-label").innerHTML = prompt;    
    let input = document.getElementById("input");
    if (current){
      console.log("Current: ", current);
    }
    current = current === "&nbsp;" ? "" : current; // TODO: Whats this do?
    input.value = current ? current : "";

    el.querySelector(".ok").setAttribute("context", context);  
    el.classList.add("popup-active");
    centerElement(el);
    app.popup = el;
    input.focus();
  }

  // TODO: Can this be an object?
  function getUserSelection(prompt, context, selectList) {
    let el = document.getElementById("get-selection");
    document.getElementById("select-label").innerHTML = prompt;
    el.setAttribute("context", "context");
    let selectset = document.getElementById("selectset");
    document.body.appendChild(el);
    selectList.forEach(row => {
      let div = document.createElement("div");
      div.dataset.playlistId = row.playlistId;
      div.id =  div.innerHTML = row.playlistName;
      if(!row.playlistId) {
        div.setAttribute("context", "new-playlist");
      } else {
        div.setAttribute("context", context);
      }
      selectset.appendChild(div);
    });
    el.classList.add("popup-active");
    centerElement(el);
    app.popup = el;
  }

  function centerElement(element) {
    element.style.left = (innerWidth / 2 - element.offsetWidth / 2) + "px";
    element.style.top = (innerHeight / 2 - element.offsetHeight / 2) + "px";  
  }


  function keyupListener() {
    window.onkeyup = function(e) { /// why is window marked as error?
      switch (e.keyCode) {
        case 27:
          toggleMenuOff();
        break;
        default:
          if (document.getElementsByClassName("popup-active").length) {
            return;
          }
          // let el = document.getElementById("artistset");
          // el.scrollTop = el.children[0].clientHeight * artistset.index[e.keyCode];
      }
    };
  }

  function menuItemListener(link) {
    let cmd = taskItemInContext.getAttribute("context") + link.getAttribute("data-action");
    let acton, aacton = [];
    let i = 0; // index for loops
    console.log("context selection", cmd);
    switch (cmd) {
      case "playlistsetcreate":
        getUserInput("Enter Playlist Name", "createPlayList");
        break;
      case "playlistrename":
        getUserInput("Remame Playlist To:", "renamePlayList");
        break;
      case "playlistdelete":
        acton = taskItemInContext.innerHTML;
        console.log("delete: ", acton);
        getData("deletePlayList", acton);
        /// need to delete titlelist in the DOM
        document.getElementById("title-view").hidden = true;
        break;
      case "artistpublish":
        console.log("Publishing ", taskItemInContext.innerHTML);
        acton = app.srcBase + taskItemInContext.innerHTML;
        console.log(acton);
        getData("artistPublish", acton)
        break;
      case "albumaddToPlayList":
      case "fileaddToPlayList":
        let selectList = [];
        let el = document.querySelectorAll(".playlist");
        for (i=0; i < el.children.length; i++) {
          selectList.push(el.children[i].innerHTML);
        }
        selectList.unshift('-- New List --');
        getUserSelection("Select Playlist", "selected", selectList );
        break;
      case "albumsetTagsFromName":
        acton = app.srcBase + app.artistSelected.innerHTML + "/" + taskItemInContext.innerHTML;
        getData("setTagsFromName", acton);
        break;
      case "filesetTagsFromName":
        acton = app.srcBase + app.artistSelected.innerHTML + "/" + app.albumSelected.innerHTML + "/" + taskItemInContext.innerHTML;
        getData("setTagsFromName", acton); // TODO: consolidate with above, maybe keep srcBase, artist & album in array
        break;
      case "filerename":
        getUserInput("Rename File To:", "renameFile", taskItemInContext.innerHTML);
        break; // TODO: have getUserSelection & getUserInput return data here and call get data from here.
      case "filesetNameFromTags":
        acton = app.srcBase + app.artistSelected.innerHTML + "/" + app.albumSelected.innerHTML + "/" + taskItemInContext.innerHTML;
        getData("setNameFromTags", acton);
        break;
      case "filesetTagsFromDB":
        acton = app.srcBase + app.artistSelected.innerHTML + "/" + app.albumSelected.innerHTML + "/" + taskItemInContext.innerHTML;
        getData("setTagsFromDB", acton); // TODO: consolidate with getData(cmd, acton)
        break;
      case "albumsetTagsFromDB":
        acton = app.srcBase + app.artistSelected.innerHTML + "/" + taskItemInContext.innerHTML;
        getData("setTagsFromDB", acton);
        break;
      case "albumsetNameFromTags":
        acton = app.srcBase + app.artistSelected.innerHTML + "/" + taskItemInContext.innerHTML;
        getData("setNameFromTags", acton);
        break;
      case "albumconvertTags":
        acton = app.srcBase + app.artistSelected.innerHTML + "/" + taskItemInContext.innerHTML;
        getData("convertTags", acton); //TODO: Not available on the server or menu
        break;
      case "albumsetGenre":
        getUserSelection("Select Genre for Album", "genreset", app.genreListset);
        break;
      case "albumupdateDB":
        acton = app.srcBase + app.artistSelected.innerHTML + "/" + app.albumSelected.innerHTML;
        console.log("Updating Database for " + acton);
        getData("albumUpdateDB", acton);
        break;
      case "albumrename":
        getUserInput("Rename Album To:", "renameAlbum", taskItemInContext.innerHTML);
        break;
      case "albumremovePattern":
        getUserInput("Enter Pattern to remove:", "removePattern", taskItemInContext.innerHTML);
        break;
      case "albumpublish":
        console.log("Publishing ", taskItemInContext.innerHTML);
        aacton[0] = app.srcBase + app.artistSelected.innerHTML + "/" + taskItemInContext.innerHTML;
        aacton[1] = true;
        getData("albumPublish", aacton);
        break;
      case "albumsetPrefix":
        getUserSelection("Set Track Prefix To:", "setPrefix", app.getPrefixArray());
        break;
      case "albumsetTrack":
        console.log("Setting tracks by order for ", taskItemInContext.innerHTML);
        acton = app.srcBase + app.artistSelected.innerHTML + "/" + taskItemInContext.innerHTML;
        getData("setTracksByOrder", acton);
        break;
      case "TPE1editValue":  // TODO: disable tag editing on playlist
      case "TALBeditValue":
      case "TIT2editValue":
      case "TRCKeditValue":
      case "TYEReditValue":
        let id3frame = taskItemInContext.getAttribute("context");
        getUserInput("Edit ID3 Tag: " + id3frame, "editValue", taskItemInContext.innerHTML);
        break;
      case "TPE1titleCase":
      case "TALBtitleCase":
      case "TRCKtitleCase":
      case "TIT2titleCase":
        let filename = app.selectedElement.parentElement.children[1].innerHTML;
        aacton[0] = app.selectedElement.getAttribute("context"); // tag ID
        aacton[1] = correctCase(app.selectedElement.innerHTML);
        aacton[2] = app.srcBase + app.artistSelected.innerHTML + "/" + app.albumSelected.innerHTML + "/" + filename;
        console.log(aacton);
        getData("setTag", aacton);
        break;
      case "TIT2-HEADtitleCase":
        aacton[0] = app.srcBase + app.artistSelected.innerHTML + "/" + app.albumSelected.innerHTML;
        aacton[1] = taskItemInContext.getAttribute("context").split('-')[0];
        getData("albumCorrectCase", aacton);
        break;
      case "TYER-HEADsetAlbumYear":
        let prompt = app.artistSelected.innerHTML + " - " + app.albumSelected.innerHTML;
        let list = document.getElementsByClassName("TYER");
        let year = '1970';
        for (i = 0; i < list.length; i++) {
          if (!isNaN(list[i].innerHTML)) { // list is a artist of all the TYER fields
            year = list[i].innerHTML;
            break;
          }
        }
        getUserInput("Set Album Year: " + prompt, "setAlbumYear", year);
        break;
      case "COMM-HEADclearAlbumComments":
        acton = app.srcBase + app.artistSelected.innerHTML + "/" + app.albumSelected.innerHTML;
        getData("clearAlbumComments", acton);
        break;
      case "headermissingAlbum":
        getData("missingAlbum");
        break;
      case "headerupdate_tpos":
        getData("update_tpos");
        break;
      case "headerget_wp_options":
        getData("get_wp_options");
        break;
      default:
        console.log("Context menu: Invalid");        
        break;
    }
    toggleMenuOff();
  }

  function isNumber(n) { /// Helper
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  function addToPlayList(playlistId) {
    console.log("adding songs to playlistId ", playlist);
    let list  = app.playerView.pane.children;
    let titles = [];
    for (let i=0; i< list.length; i++) {
      titles.push({ path: list[i].dataset.path, title: list[i].querySelector('.TIT2').innerHTML});
    }
    let acton = [playlistId, titles];
    getData("addToPlayList", acton);
    app.popup.classList.remove("popup-active");
    // Below triggers an error when adding a new play list
    app.popup.querySelector("#selectset").innerHTML = "";
    app.selectedElement = null;
  }

  function addToPlayListOld(artist, album, playlist) {
    console.log(artist, album, playlist);
    let title = app.srcBase;
      if (app.artistSelected) {
        title += app.artistSelected.innerHTML + "/";
      }
      if (app.albumSelected) {
        title += app.albumSelected.innerHTML + "/";
      }
      if (app.selectedElement != app.albumSelected) {
        title += app.selectedElement.innerHTML;
      }
      console.log("adding ", title, " to playlist ", playlist.innerHTML);
      let acton = [title, playlist.innerHTML];
      getData("addToPlayList", acton);
    playlist.parentElement.parentElement.classList.remove("popup-active");
    playlist.parentElement.innerHTML="";
    app.selectedElement = null;
  }

  function clickListener2() {
    document.addEventListener("click", function(e){
      let context = e.target.getAttribute("context");
      switch(context){
        case "artist":
          console.log("artist");
        break;
        default:
          console.log("Unknown context: ", context);
      }
    });
  }

  function clickListener() {    
  // Handle left mouse clicks
    document.addEventListener("click", function(e){
  
      let name, oldname, newname, album, value, list;
      // is this in a context menu?
      let clickElIsLink = clickInsideElement(e, contextMenuLinkClassName);
      console.log(clickElIsLink);

      if (clickElIsLink) {
        e.preventDefault();
        // Handel context menu left clicks
        menuItemListener(clickElIsLink);
      } else {
        // Handel normal (non-context menu) left clicks
        // let button = e.which || e.button;
        // if (button === 1) {
        //     toggleMenuOff();
        // }
        toggleMenuOff();
        let audio = document.getElementById("audio");
        let playqueue = document.getElementById("playqueue");
        let rate = document.getElementById("rate"); // Audio playback rate
        let context = e.target.getAttribute("context");
        let el = e.target.parentElement;
        let acton, aacton = [];
        let prompt = "";
        let searchType = "";
        // TODO: when context is null (clicking on an element with no context attribute),
        // I'm getting reference errors in the default: case. Somehow context changes
        // from null to undefined between the switch stmt and the default stmt. Assigning
        // context to x and using x in the default stmt works as a temporary fix.
        let x = context;
        switch(context) {
          case "start-search":
            app.searchView.elem.querySelector("h3").innerHTML = "";
            app.searchView.pane.innerHTML = "";
            searchType = "search" + document.querySelector('input[name="search-type"]:checked').value;
            let searchText = app.searchView.input.value;
            app.searchView.pane.classList.add("loader");
            app.searchView.elem.querySelector("#start-search").innerHTML = "Searching";
            console.log(searchType, searchText);
            getData(searchType, searchText);                        
            break;
          case "search-type":            
            let searchHelp = {
              "searchSong": "Search titles containing...",
              "searchGenre": "Search genres containing...",
              "searchYear": "Search songs release in year..."
            };
            
            searchType = "search" + document.querySelector('input[name="search-type"]:checked').value;
            app.searchView.input.placeholder = searchHelp[searchType];
            document.querySelector("#start-search").classList.remove("disabled");
            
            break;
          case "main-menu":
            document.querySelector('.menu-dropdown').classList.toggle('hidden');
            break;
          case "logout":
            getData("logout");
            window.location.href = ('login.php');
            break;
          case "createPlayList":
            name = el.children.input.value;
            console.log("Creating playlist: ", name);
            getData("createPlayList", name);
            break;
          case "renamePlayList":
            name = el.children.input.value;
            console.log("Renaming playlist to: ", name);
            aacton = [app.selectedElement.innerHTML, name];
            getData("renamePlayList", aacton);
            break;
          case "saveOrder":
            app.titleView.hideSave();
            app.titleView.saveOrder();
            break;
          case "saveAsPlaylist":
            name = el.children.input.value;
            list = app.playlistView.data;
            let duplicate = false;

            list.forEach(row => {
              if (name == row.name) {
                console.log("Duplicate name for new playlist: ", name);
                let error = document.createElement('div');
                error.innerHTML = "Name already exist, choose another";
                el.appendChild(error);
                duplicate = true;                             
              }
            });
            if (duplicate) {
              break;
            }
            console.log("Saving playlist: ", name);
            playQueue.save(name);
            app.popup.classList.remove("popup-active");
            app.popup.querySelector("input").innerHTML = "";
            app.popup = null;            
            break;
          case "add":
            playQueue.append(e.target);            
            break;
          case "addall":
            let titles = app.titleView.pane.querySelectorAll(".TIT2");
            titles.forEach(t => {
              playQueue.append(t);
            });
            slist(app.playerView.pane);
            break;
          case "confirmTitleRemove":
            let title = e.target.parentElement;
            prompt = `Delete \"${title.querySelector(".TIT2").innerHTML}\" from \"${app.currentPlaylist.name}\"`;
            confirmUserAction(prompt, "titleRemove", title.dataset.path);
            break;
          case "titleRemove":
            app.titleView.remove(el.children["confirm-input"].value);
            app.popup.classList.remove("popup-active");
            app.popup.querySelector("#confirm-label").innerHTML = "";
            app.popup.querySelector("#confirm-input").innerHTML = "";
            app.popup = null;
            break;                 
          case "playQueueRemove":
            playQueue.remove(e.target);
            break;
          case "confirmPlaylistRemove":
            let playlist = e.target.parentElement;
            prompt = `Confirm deletion of Playlist \"${playlist.querySelector(".TIT2").innerHTML}\"`;
            confirmUserAction(prompt, "playlistRemove", playlist.dataset.playlistid);
            break;
          case "playlistRemove":
            app.playlistView.remove(el.children["confirm-input"].value);
            app.popup.classList.remove("popup-active");
            app.popup.querySelector("#confirm-label").innerHTML = "";
            app.popup.querySelector("#confirm-input").innerHTML = "";
            app.popup = null;
            break;
          case "ctlplay":            
            let play = document.getElementById("play");
            if (audio.paused) {
              audio.play()
              play.innerHTML = ICONS.pause;
            } else {
              audio.pause()
              play.innerHTML = ICONS.play;
            }            
            break;
          case "ctlprev":            
            if (playQueue.playing.previousSibling) {
              playQueue.playing.previousSibling.click();
            }
            break;
          case "ctlnext":            
            if (playQueue.playing.nextSibling) {
              playQueue.playing.nextSibling.click();
            } else {              
              audio.currentTime = audio.duration - 1;              
            }
            break;
          case "ctlstop":
            playQueue.close();
            break;
          case "play":
            playQueue.play(e.target);              
            break;
          case "skip":
            playQueue.skipTo(e.target);
            break;
          case "playbackUp":
            audio.playbackRate += .25;
            rate.innerHTML = audio.playbackRate.toFixed(2);
            break;
          case "playbackDown":
            audio.playbackRate -= .25;
            rate.innerHTML = audio.playbackRate.toFixed(2);
            break;
          case "playlist":
            app.currentPlaylist = el.dataset;
            playlistClick.apply(el);
            
            break;
          case "artist":
            artistClick.apply(e.target);
            break;
          case "album":          
            albumClick.apply(e.target);
            break;
          case "albumlist":
            albumlistClick.apply(e.target);
            break;
          case "renameAlbum":
            oldname = app.srcBase + app.artistSelected.innerHTML + "/" + app.selectedElement.innerHTML;
            newname = app.srcBase + app.artistSelected.innerHTML + "/" + el.children.input.value;
            console.log("Renaming Album to: ", name);
            acton = [oldname, newname];
            app.albumSelected = app.selectedElement;
            app.albumSelected.innerHTML = el.children.input.value;
            getData("renameFile", acton);
            break;
          case "renameFile":
            oldname = app.srcBase + app.artistSelected.innerHTML + "/" + app.albumSelected.innerHTML + "/" + app.selectedElement.innerHTML;
            newname = app.srcBase + app.artistSelected.innerHTML + "/" + app.albumSelected.innerHTML + "/" + el.children.input.value;
            console.log("Renaming File to: ", name);
            acton = [oldname, newname];
            getData("renameFile", acton);
            break;
          case "removePattern":
            let pattern = el.children.input.value;
            console.log("Removing pattern: ", pattern);
            album = app.srcBase + app.artistSelected.innerHTML + "/" + app.albumSelected.innerHTML;
            acton = [album, pattern];
            getData("removePattern", acton);
            break;              
          case "editValue":
            acton  = [];
            acton[0] = app.selectedElement.getAttribute("context"); // tag ID
            acton[1] = el.children.input.value;
            acton[2] = app.srcBase + app.artistSelected.innerHTML;          

            if (app.albumSelected) {
              acton[2] += "/" + app.albumSelected.innerHTML;
            }
            acton[2] += "/" + app.selectedElement.parentElement.children[1].innerHTML;
            console.log("Setting " + acton[0] + " Tag To: ", acton[1]);
            getData("setTag", acton);
            break;
          case "save":
            let selectList = [];
            list = app.playlistView.data;
            // let list = document.querySelectorAll('.playlist');
            if (!list.length) {
              // No existing playlist, skip to new-playlist
              let el = document.querySelector("#selectset");
              el.setAttribute("context", "new-playlist");
              el.click();
              el.setAttribute("context", "selectset");
              break;
            }
            for (let i=0; i < list.length; i++) {              
              selectList.push({playlistId:list[i].id, playlistName: list[i].name});
            }
            selectList.unshift({playlistId: null, playlistName: '-- New Playlist --'});
            getUserSelection("Select Playlist", "selected", selectList);          
            break;
          case "selected": // TODO: This gets called from select playlist dialog, rename... (selected is fro select Playlist);
            addToPlayList(e.target.dataset.playlistId);
            break;
          case "new-playlist":
            if(app.popup) {
              app.popup.classList.remove("popup-active");
              app.popup.querySelector("#selectset").innerHTML = "";
              app.selectedElement = null;
              app.popup = null;              
            }                    
            getUserInput("New Playlist", "saveAsPlaylist");
            break;
          case "genreset":
            let id3frame = "TCON";
            value = e.target.innerHTML;
            album = app.srcBase + app.artistSelected.innerHTML + "/" + app.albumSelected.innerHTML;
            acton = [id3frame, value, album];
            console.log(acton);
            getData("setTag", acton);
            break;
          case "setPrefix":
            let prefix = e.target.innerHTML;
            album = app.srcBase + app.artistSelected.innerHTML + "/" + app.albumSelected.innerHTML;
            acton = [prefix, album];
            getData("prefixTracks", acton);
            break;
          case "setAlbumYear": // TODO: Can this be handeled by SetTags
            let year = el.children.input.value;
            album = app.srcBase + app.artistSelected.innerHTML + "/" + app.albumSelected.innerHTML;
            acton = [album, year]; // TODO: do we need to separate acton from aacton?
            getData("setAlbumYear", acton);
            break;
          case "view-playlist":
            app.titleView.back.setAttribute("context", "view-playlist");
            app.titleView.hideSave();
            app.showView("playlist-view");
            break;
          case "view-album":
            app.showView("album-view");
            break;
          case "view-artist":
            app.titleView.back.setAttribute("context", "view-album");
            app.showView("artist-view");
            break;
          case "view-albumlist":            
            app.showView("albumlist-view");
            break;
          case "view-search":
            app.showView("search-view");
            break;
          case "cancel":
            e.target.parentElement.classList.remove("popup-active");
            document.getElementById("selectset").innerHTML="";
            break;
          case "login":
            console.log("Let's get you logged in!");
            form = e.target.parentElement;
            acton = [form.username.value, form.password.value];
            getData("login", acton);
            break;
          default:                        
            console.log("clickListener: ", `Unhandeled context: ${x}`);
            break;
        }
        // I think this is to close any pop-ups after a selection is made
        // It's only needed when a pop-up is active?
        // if (context) {
        //   el.classList.remove("popup-active");
        //   if(el.parentElement){
        //     el.parentElement.classList.remove("popup-active");
        //   }
        //   document.getElementById("selectset").innerHTML="";
        //   document.getElementById("input").innerHTML="";
        // }
      }
    });
  }

  function contextListener() {
    // Handle right mouse clicks
    document.addEventListener("contextmenu", function(e) {
      taskItemInContext = clickInsideElement(e, taskItemClassName);
      console.log(taskItemInContext); //, e);
      app.selectedElement = e.target;
      if (taskItemInContext){
        let menuName = taskItemInContext.getAttribute("context") + "-menu";
        menu = document.getElementById(menuName);
        e.preventDefault();
        toggleMenuOn();
        positionMenu(e); /// can this be called from toggleMenuOn?
      } else {
        taskItemInContext = null;
        toggleMenuOff();
      }
    });
  }

  function toggleMenuOn() { /// make menus a class
    if (menuState !==1) {
      menuState = 1;
      menu.classList.add(contextMenuActive);
    }
  }

  function toggleMenuOff() {
    if (menuState !== 0 ) {
      menuState = 0;
      menu.classList.remove(contextMenuActive);
    }
  }

  function closeMenus(evt) {
    let menus = document.querySelectorAll("[class^='menu']");
    if (Array.prototype.indexOf.call(menus, evt.target) == -1) {
      menus.forEach(el => el.classList.add("hidden"));
    }
  }

  function positionMenu(e) {
    let clickCoords = getPosition(e);
    let clickCoordsX = clickCoords.x;
    let clickCoordsY = clickCoords.y;

    let menuWidth = menu.offsetWidth + 4;
    let menuHeight = menu.offsetHeight + 4;
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;

    if ((windowWidth - clickCoordsX) < menuWidth) {
      menu.style.left = clickCoordsX - menuWidth + "px";
    } else {
      menu.style.left = clickCoordsX + "px";
    }
    if ((windowHeight - clickCoordsY) < menuHeight) {
      menu.style.top = clickCoordsY - menuHeight + "px";
    } else {
      menu.style.top = clickCoordsY + "px";
    }
  }

  function getPosition(e) { // Of mouse click
    let posx = 0;
    let posy = 0;

    if (!e) {
       let e = window.event;
    }
    if (e.pageX || e.pageY) {
      posx = e.pageX;
      posy = e.pageY;
    } else if (e.clientX || e.clientY ) {
      posx = e.clientX +  document.body.scrollLeft +
        document.documentElement.scrollLeft;
      posy = e.clientY + document.body.scrollTop +
        document.documentElement.scrollTop;
    }
    return {
        x: posx,
        y: posy
    }
  }

  function resizeListener() {
    window.onresize = function(e) {
      toggleMenuOff();
    };
  }



  // const setDragging = (e) => {
  //   e.dataTransfer.setData("application/x-moz-node", e.target);
  //   app.dragging = e.target;
  //   e.dataTransfer.effectAllowed = "move";
  //   console.log("Dragging ", e.target);
  // }

  // function setDraggedOver(e) {
  //   e.preventDefault();
  //   app.draggedOver = e.target;
  //   e.dataTransfer.dropEffect = "move";
  //   // console.log("Dragging over ", app.draggedOver);
  // }

  // const dragStop = (e) => {
  //   e.preventDefault();
  //   if (app.playerView.pane.classList.contains("dropzone")) {
  //     let pane = app.playerView.pane;
  //     const data = e.dataTransfer.getData("application/x-moz-node");
  //     console.log("Inserting ", app.dragging);
  //     console.log("Before ", app.draggedOver);
  //     let list = pane.children
  //     app.playerView.pane.insertBefore(app.draggedOver, app.dragging);  
  //   }    
  // }

  function slist (target) {
    // (A) SET CSS + GET ALL LIST ITEMS
    target.classList.add("slist");
    let items = target.getElementsByTagName("div"), current = null;
  
    // (B) MAKE ITEMS DRAGGABLE + SORTABLE
    for (let i of items) {
      // (B1) ATTACH DRAGGABLE
      i.draggable = true;
  
      // (B2) DRAG START - YELLOW HIGHLIGHT DROPZONES
      i.ondragstart = (ev) => {
        current = i;
        for (let it of items) {
          if (it != current) { it.classList.add("hint"); }
        }
      };
  
      // (B3) DRAG ENTER - RED HIGHLIGHT DROPZONE
      i.ondragenter = (ev) => {
        if (i != current) { i.classList.add("active"); }
      };
  
      // (B4) DRAG LEAVE - REMOVE RED HIGHLIGHT
      i.ondragleave = () => {
        i.classList.remove("active");
      };
  
      // (B5) DRAG END - REMOVE ALL HIGHLIGHTS
      i.ondragend = () => { for (let it of items) {
        it.classList.remove("hint");
        it.classList.remove("active");
      }};
  
      // (B6) DRAG OVER - PREVENT THE DEFAULT "DROP", SO WE CAN DO OUR OWN
      i.ondragover = (evt) => { evt.preventDefault(); };
  
      // (B7) ON DROP - DO SOMETHING
      i.ondrop = (evt) => {
        evt.preventDefault();
        if (i != current) {
          let currentpos = 0, droppedpos = 0;
          for (let it=0; it<items.length; it++) {
            if (current == items[it]) { currentpos = it; }
            if (i == items[it]) { droppedpos = it; }
          }
          if (currentpos < droppedpos) {
            i.parentNode.insertBefore(current, i.nextSibling);
            let tmp = current.dataset.position;
            current.dataset.position = i.nextSibling.dataset.position;
            i.nextSibling.dataset.position = tmp;
          } else {
            i.parentNode.insertBefore(current, i);
            let tmp = current.dataset.position;
            current.dataset.position = i.dataset.position;
            i.dataset.position = tmp;
          }
          if (app.playlistSelected)
            app.titleView.showSave();
        }
      };
    }
  }
  

  function clickInsideElement(e, className) {
    let el = e.target;
    if (el.classList.contains(className)) {
      return el;
    } else {
      while (el == el.parentNode) { // TODO: was el = el.parentNode, do some testing
        if (el.classList && el.classList.contains(className)) {
          return el; // or return clicked el and display custom menu ie playlist item
        }
      }
    }
    return false;
  }

  document.querySelector("body").addEventListener('click', closeMenus);

  function scrollListener() {
    app.artistView.pane.addEventListener("scroll", function(e){
      if (scrollTimer != -1){
        clearTimeout(scrollTimer);
      }
      // scrollTimer = window.setTimeout(function() {console.log("Scrolled, ", el.scrollTop);}, 500);    
      scrollTimer = window.setTimeout(scrollFinished, 200, this);
    });
  }

  function scrollFinished(el) {    
    console.log("Scrolled: ", el.scrollTop);
  }

  function sliderListener() {
    document.getElementById("pos").addEventListener("input", function(e) {      
      console.log(this.value);
      if (playQueue.playing) {
        document.getElementById("audio").currentTime = this.value;
      }
    });
  }

  function filterListener() {
    document.querySelectorAll(".filter").forEach(function(el) {
      el.addEventListener("input", function(e) {
        let view = this.getAttribute("view");
        let query = this.value.toLowerCase();
        let matches = [];
        // let matches = app[view].data.filter(element => element.toLowerCase().includes(query));
        if (app[view].id == 'artist') {
          matches = app[view].data.filter(element => element.toLowerCase().includes(query));
        }
        if (app[view].id == 'albumlist') {
          matches = app[view].data.filter(o => o.album.toLowerCase().includes(query));
        }
        app[view].filter(matches);
      });
      // app.artistView.filter(matches);      
      // console.log(matches);      
    });
  }

  function searchListener() {
    document.querySelectorAll(".search").forEach(function(el) {
      el.addEventListener("input", function(e) {
        let view = this.getAttribute("view");        
        if (app[view].pane.children) {
          app[view].clearPane();
        }
      });      
    });
  }
   
  // function mouseOverListener() { // TODO: see about using transition to delay hover in css
  //   // Calls mouseHover to adjust width of element
  //   document.getElementById("title-view").addEventListener("mouseover", function(e) {
  //     if(mouseTimer != -1) {
  //       clearTimeout(mouseTimer);
  //     }
  //     mouseTimer = window.setTimeout(mouseHover, 1000, e.target);      
  //   }, true);

  //   document.getElementById("title-view").addEventListener("mouseout", function(e) {
  //     e.target.style.width="";
  //     clearTimeout(mouseTimer);
  //   });
  // }

  function mouseHover(el) {
    el.style.width="auto";
  }

  function getViewPortSize() {
    let size={};
    size.width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    size.height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);        
    return size;
    // Galaxy S5: 360x560
    // iPhone 6: 375x544 
}

  function setPanelHeight(el) {
    // Set the height of .list-panel to allow scrolling within screen height 
    let height = getViewPortSize().height;
    height -= el.offsetTop;        
    let n = el.nextElementSibling;
    if(n) {
        do {
            let margins = parseInt(getComputedStyle(n).marginTop) + parseInt(getComputedStyle(n).marginBottom);
            height -= (n.offsetHeight + margins);
        } while(n = n.nextElementSibling)
    }
    height -= 16;
    el.style.setProperty("max-height", `${height}px`);
  }

  function toTitleCase(str) {
    let retStr = str[0].toUpperCase() + str.slice(1).toLowerCase();
    return retStr;
  }


  function initUI() {
    document.getElementById("playlist-view").classList.add('hidden');
    document.getElementById("artist-view").classList.remove('hidden');
    let controls = document.querySelectorAll("#player-view span");
    for(let i=0; i < controls.length; i++) {
      // controls[i].classList.add("context");      
      controls[i].setAttribute("context", `ctl${controls[i].id}`);
      controls[i].innerHTML = ICONS[controls[i].id]
      /// console.log(controls[i]);
    }
    // find the bottom of the heading & tab list; use that as the top of the client
    // find the remaining available screen height
    // set the frame height to 20% of the available screen height
  }

  function audioListener() {
    let audio = document.getElementById("audio");
    let play = document.getElementById("play")
    let pos = document.getElementById("pos");
    let heading = document.querySelector("#player-view > h4");
    audio.addEventListener("play", function(){
      document.getElementById("player-view").classList.remove("hidden");
      playQueue.playing.classList.add("playing");
      play.innerHTML = ICONS.pause;
    });
    audio.addEventListener("pause", function() {
      play.innerHTML = ICONS.play;
    });
    audio.addEventListener("timeupdate", function(){
      // console.log(`${audio.currentTime}/${audio.duration}`);
      pos.value = audio.currentTime;
    });
    audio.addEventListener("canplaythrough", function() {
      pos.max = audio.duration;
    });
    audio.addEventListener("ended", function (){        
      if(playQueue.playing.nextSibling) {
        playQueue.playing.nextSibling.click();
      } else {
        playQueue.playing.classList.remove("playing");
        playQueue.playing = false;
        heading.innerHTML = "";          
      }
    });
  }


  // App starts here
  const ICONS = {
    play: "&#9654;",
    pause : "||",
    prev: "<<",
    next: ">>",
    stop: "&#9744;",
    add: "&#43;",
    remove: "&#10006;"
  }

  let app = new App();
 
  app.playlistView = new PlaylistView("playlist");  
  app.playlistView.addHeading("count", "h3");
    
  app.artistView = new View("artist");
  app.artistView.addHeading("count", "h3");
  app.artistView.enableFilter();

  app.albumView = new View("album");
  app.albumView.enableBack("view-artist");
  app.albumView.addHeading("selected-artist", "h3");
  app.albumView.addHeading("count", "h4");

  app.searchView = new SearchView("search");
  app.searchView.addHeading("count", "h3", "Search Result");
  app.searchView.enableSearch();
  // app.searchView.input.placeholder = "Search titles containing...";
  app.searchView.enableRadioButtons();
  app.searchView.isPlayable = true;
  app.searchView.setFields(["TIT2"]);


  app.albumlistView = new AlbumListView("albumlist");
  app.albumlistView.addHeading("count", "h3");
  app.albumlistView.enableFilter();
  
  app.titleView = new TitleView("title");
  app.titleView.enableBack("view-album");
  app.titleView.addHeading("selected-artist", "h3");
  app.titleView.addHeading("selected-album", "h4");
  app.titleView.addHeading("count", "h5");
  app.titleView.headings["count"].elem.classList.add("inline");
  app.titleView.isPlayable = true;
  app.titleView.setFields(["TIT2"]);
  // app.titleView.enableDraggable();
  app.titleView.enableSave("saveOrder");

  app.playerView = new View("player");
  
  let playQueue = new PlayQueue(app.playerView.pane);
  
  
  let gdr; // used to cancel a pending ajax request /// move to App class

  let scrollTimer = -1; /// move to App class
  let mouseTimer = -1;

  // Provides ajax response to a debug pane, usually hidden
  let responseText = document.getElementById("responseText");

  // Context menu stuff /// make into an object?
  let menu = document.querySelector("#context-menu");
  let menuState = 0;
  let contextMenuLinkClassName = "menu-item";
  let contextMenuActive = "context-menu-active";
  let taskItemClassName = "context";
  let taskItemInContext;

  // setInterval(updateStats, 3000);  
  // contextListener();
  clickListener();  
  // keyupListener();
  // resizeListener();
  // mouseOverListener();
  scrollListener();
  sliderListener();
  filterListener();
  searchListener();
  audioListener();
  
  initUI();

  getData("getStaticData");
  getData("getArtistList", "");
  getData("getAlbumList");
};
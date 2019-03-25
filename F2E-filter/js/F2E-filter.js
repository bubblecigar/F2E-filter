var filter_obj = {
  zone:"",
  visit_date:"",
  user_input:"",
  page:1,
  max_page:1,
  others:{
    isFree:false,
    isAllDay:false,
  }  
};

var search_result = [];

var buffer = [];

initialize();

function initialize(){
  load_option();
  activate_eventListener();
  document.querySelector(".location select").value = "三民區";
  search();
}

function search(){

  update_filter_obj();

  let filter_ar = filter_obj_toArray(filter_obj);

  let url = 'https://data.kcg.gov.tw/api/action/datastore_search?resource_id=92290ee5-6e61-456f-80c0-249eae2fcc97' + "&q=" + filter_ar.join(" ") + "&limit=500";

  fetch(url)
    .then(
      function(response) {
        if (response.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' +
            response.status);
          return;
        }
        response.json().then(function(data) {
          search_result = data.result.records;
        })
        .then(function(){
          load_content();
        }
        )
      }
    )
    .catch(function(err) {
      console.log('Fetch Error :-S', err);
    });   
}

function update_filter_obj(){
  if (document.querySelector(".location select").value == "- -") {
    filter_obj.zone = "";
  }else {
    filter_obj.zone = document.querySelector(".location select").value;
  }  
  // filter_obj.user_input = document.querySelector("input.keyword").value;
  filter_obj.others.isFree = document.getElementById("isFree").checked;
  filter_obj.others.isAllDay = document.getElementById("isAllDay").checked;
  filter_obj.page = 1;
}

function filter_obj_toArray(filter_obj){
    var filter_ar = [];
    if (filter_obj.user_input != "") {
      filter_ar.push(filter_obj.user_input);
    }
    if (filter_obj.zone != "") {
      filter_ar.push(filter_obj.zone);
    }
    if (filter_obj.visit_date != "") {
      filter_ar.push(filter_obj.visit_date);
    }
    if (filter_obj.others.isFree) {
      filter_ar.push("免費參觀");
    }
    if (filter_obj.others.isAllDay) {
      filter_ar.push("全天候開放");
    }
    return filter_ar;
}


function load_option(){

  var zone_ar = [];
  if (!localStorage.getItem("Zone_list")) {
   let url = 'https://data.kcg.gov.tw/api/action/datastore_search?resource_id=92290ee5-6e61-456f-80c0-249eae2fcc97' + "&limit=" + "500";
   fetch(url)
    .then(
      function(response) {
        if (response.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' +
            response.status);
          return;
        }
        response.json().then(function(data) {
          search_result = data.result.records;
        })
        .then(function(){
          for (var i = search_result.length - 1; i >= 0; i--) {
           zone_ar.push(search_result[i].Zone);
           // console.log(search_result[i].Zone);
          }
          //刪除重複的行政區
          zone_ar.sort();
          for (var i = 0; i < zone_ar.length-1; i++) {
            if (zone_ar[i+1] == zone_ar[i]){
              zone_ar.splice(i+1,1);
              i--;
            }
          }
          zone_ar.push("- -");
          localStorage.setItem("Zone_list",JSON.stringify(zone_ar));
            // 載入zone_list中的行政區作為option
            for (var i = zone_ar.length - 1; i >= 0; i--) {
              var option = document.createElement("option");
              option.textContent = zone_ar[i];
              document.querySelector("select").appendChild(option);
            }
        }
        )
      }
    )
    .catch(function(err) {
      console.log('Fetch Error :-S', err);
    });  
  }else{
    zone_ar = JSON.parse(localStorage.getItem("Zone_list"));
    for (var i = zone_ar.length - 1; i >= 0; i--) {
      var option = document.createElement("option");
      option.textContent = zone_ar[i];
      document.querySelector("select").appendChild(option);
    }
  }
}

function load_content(){

document.querySelector(".content").setAttribute("style","display: inline-block !important");
document.querySelector(".content2").setAttribute("style","display: none !important");

  document.querySelector(".content h1 em").textContent = search_result.length;

  load_filter_tag();
  load_brief_box();
  load_page_index();
}

function load_filter_tag(){
  var box_ar = document.querySelectorAll(".search_keyword");
  for (let i = box_ar.length - 1; i >= 0; i--) {
    box_ar[i].remove();
  }

  let filter_ar = filter_obj_toArray(filter_obj);
  var template = document.getElementById("filter_tag_template");
  for (let i = filter_ar.length - 1; i >= 0; i--) {
    var new_node = template.content.cloneNode(true);
    var text_node = document.createTextNode(filter_ar[i]);
    new_node.querySelector(".search_keyword").insertBefore(text_node,new_node.querySelector("i"));
    document.querySelector(".content").insertBefore(new_node,template);
  }

}

function load_brief_box(){

  var box_ar = document.querySelectorAll(".brief");
  for (let i = box_ar.length - 1; i >= 0; i--) {
    box_ar[i].remove();
  }

  var template = document.getElementById("brief_template");

  let start = (filter_obj.page - 1)*3;
  let displayed_result = search_result.slice(start,start+3);

  for (var i = displayed_result.length - 1; i >= 0; i--) {
    
    var new_node = template.content.cloneNode(true);

    new_node.querySelector(".brief").setAttribute("data-key",filter_obj.page*3+i-3);

    new_node.querySelector(".img img").setAttribute("src", displayed_result[i].Picture1);
    new_node.querySelector(".title").textContent = displayed_result[i].Name;
    new_node.querySelector(".intro").textContent = displayed_result[i].Description;
    new_node.querySelector(".author").textContent = displayed_result[i].Zone;
    new_node.querySelector(".place").innerHTML = `
      <i class="fas fa-map-marker-alt"></i>
      ${displayed_result[i].Add}
    `;
    new_node.querySelector(".tel").innerHTML = `
      <i class="fas fa-phone"></i>
      ${displayed_result[i].Tel}
    `;
    if (displayed_result[i].Ticketinfo.includes("免費參觀")) {
      new_node.querySelector(".freeTag").setAttribute("style","display:inline-block");  
    }else{
      new_node.querySelector(".freeTag").setAttribute("style","display:none");  
    }
    if (displayed_result[i].Opentime.includes("全天候開放")) {
      new_node.querySelector(".openTag").setAttribute("style","display:inline-block");  
    }else{
      new_node.querySelector(".openTag").setAttribute("style","display:none");  
    }

    document.querySelector(".content").insertBefore(new_node,document.querySelector(".page_index"));
  }

}

function load_page_index(){

  filter_obj.max_page = Math.ceil(search_result.length/3);

  var parent_node = document.querySelector(".page_index");
  parent_node.innerHTML = "";
  
  if (filter_obj.max_page==0) {
      return
  }

  var left_node = document.createElement("a");
  left_node.setAttribute("class", "fas fa-angle-double-left");

  var right_node = document.createElement("a");
  right_node.setAttribute("class", "fas fa-angle-double-right");

  parent_node.appendChild(left_node);

  for (var i = 1; i <= filter_obj.max_page; i++) {
    var index_node = document.createElement("a");
    index_node.textContent = i;
    parent_node.appendChild(index_node);
  }

  parent_node.querySelectorAll("a")[filter_obj.page].setAttribute("class", "triggered");

  parent_node.appendChild(right_node);

  if (filter_obj.page == 1) {
    document.querySelector(".fas.fa-angle-double-left").setAttribute("class", "fas fa-angle-double-left invalid");
  }
  if (filter_obj.page == filter_obj.max_page) {
    document.querySelector(".fas.fa-angle-double-right").setAttribute("class", "fas fa-angle-double-right invalid");
  }

}

function activate_eventListener(){

  document.querySelector(".banner .logo").addEventListener("click",function(e){
  document.querySelector(".content").setAttribute("style","display: inline-block !important");
  document.querySelector(".content2").setAttribute("style","display: none !important");
  },false);

  document.querySelector(".location").addEventListener("click", function(e){
    if (e.target.nodeName.includes("H1")) {
      toggle_class(this,"extend"); 
    }
    
  },false);
  document.querySelector(".date").addEventListener("click", function(e){
    if (e.target.nodeName.includes("H1")) {
      toggle_class(this,"extend"); 
    }
  },false);
  document.querySelector(".categories").addEventListener("click", function(e){
    if (e.target.nodeName.includes("H1")) {
      toggle_class(this,"extend"); 
    }
  },false);

  document.getElementById("location").addEventListener("change",function(){
    search();
  },false);

  document.querySelectorAll("label")[1].addEventListener("click",function(e){
    e.preventDefault();
    document.getElementById("isFree").checked = !document.getElementById("isFree").checked;
    search();
  },false);
  document.querySelectorAll("label")[0].addEventListener("click",function(e){
    e.preventDefault();
    document.getElementById("isAllDay").checked = !document.getElementById("isAllDay").checked;
    search();
  },false);

  document.querySelector(".search i").addEventListener("click",function(){
    document.querySelector(".location select").value = "- -";
    document.getElementById("isFree").checked = false;
    document.getElementById("isAllDay").checked = false;
    filter_obj.user_input = document.querySelector("input.keyword").value;
    search();
  },false);

  document.querySelector(".page_index").addEventListener("click",function(e){
    e.preventDefault();
    if (e.target.className.includes("invalid")||e.target.className.includes("triggered")) {
      return
    }
    if (e.target.nodeName != "A") {
      return
    }else if (e.target.textContent != "") {
      filter_obj.page = parseInt(e.target.textContent);
    }else if (e.target.className.includes("left")) {
      filter_obj.page = filter_obj.page - 1;
    }else {
      filter_obj.page = filter_obj.page + 1;
    }
    load_content();
  },false)

  document.querySelector(".content").addEventListener("click",function(e){
    if (e.target.nodeName == "I") {
      console.log(e.target.parentNode.textContent);
      if (e.target.parentNode.textContent.includes(filter_obj.user_input) && filter_obj.user_input!="") {
        filter_obj.user_input = "";
        document.querySelector(".search input").value = "";
        search();
      }else if (e.target.parentNode.textContent.includes(filter_obj.zone) && filter_obj.zone!="") {
        filter_obj.zone = "";
        document.querySelector("select").value = "- -";
        search();
      }else if (e.target.parentNode.textContent.includes("全天候開放")) {
        document.getElementById("isAllDay").checked = false;
        search();
      }else if (e.target.parentNode.textContent.includes("免費參觀")) {
        document.getElementById("isFree").checked = false;
        search();
      }
    }else if(is_brief(e.target)){
      load_detail(is_brief(e.target));

    }
  },false)
}

function load_detail(data_key){
  
  document.querySelector(".content2").setAttribute("style","display: inline-block !important");
  document.querySelector(".content").setAttribute("style","display: none !important");

  document.querySelector(".content2").innerHTML = "";

  let data_obj = search_result[data_key];

  let template = document.getElementById("detail_template");
  let new_node = template.content.cloneNode(true);

  new_node.querySelector("img").setAttribute("src",data_obj.Picture1);
  new_node.querySelector(".info span").textContent = data_obj.Name;
  new_node.querySelector(".description .title").textContent = data_obj.Name;
  new_node.querySelector(".description .author").textContent = data_obj.Zone;
  new_node.querySelector(".description .intro").textContent = data_obj.Description;

  let text_node1 = document.createTextNode(data_obj.Add);
  new_node.querySelector(".place").appendChild(text_node1);

  let text_node2 = document.createTextNode(data_obj.Tel);
  new_node.querySelector(".tel").appendChild(text_node2);

  if (!data_obj.Ticketinfo.includes("免費參觀")) {
    new_node.querySelector(".tag.freeTag").setAttribute("style","display:none !important");
  }
  if (!data_obj.Opentime.includes("全天候開放")) {
    new_node.querySelector(".tag.openTag").setAttribute("style","display:none !important");
  }

  document.querySelector(".content2").appendChild(new_node);
}

function is_brief(node){
  while (true) {
    if (!node) {
      return false
    }else if (node.className.includes("content")) {
      return false
    }else if (node.className.includes("brief")) {
      return node.getAttribute("data-key");
    }else{
      return is_brief(node.parentNode);
    }
  }
}

function toggle_class (node, targetClass){
  let classArray = node.className.split(" ");
  for (var i = classArray.length - 1; i >= 0; i--) {
    if (classArray[i] == targetClass){
      classArray.splice(i,1);
      node.setAttribute("class", classArray.join(" "));
      return
    }
  }
  classArray.push(targetClass);
  node.setAttribute("class", classArray.join(" "));
}

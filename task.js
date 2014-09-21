var dateRegex = /^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))$/g;

/*$("#newTask").focusout(function(){
  $(this).css("display", "none");
});*/

function b64Encode(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}
function b64Decode(str) {
  return decodeURIComponent(escape(window.atob(str)));
}

$(document).mouseup(function(e){
  var container = $("#newTask");
  if(!container.is(e.target) && container.has(e.target).length === 0)
    container.css("display", "none");
});

$(document).mouseup(function(e){
  var container = $("#exportDiv");
  if(!container.is(e.target) && container.has(e.target).length === 0)
    container.css("display", "none");
});

$(document).mouseup(function(e){
  var container = $("#importDiv");
  if(!container.is(e.target) && container.has(e.target).length === 0)
    container.css("display", "none");
});

var TaskList = {
  index: window.localStorage.getItem("Task:index"),
  filter: "",
  version: "v0.1.0",
  taskListDiv: document.getElementById("tasks"),
  newTaskDiv: document.getElementById("newTask"),
  newTaskSave: document.getElementById("newSave"),
  exportDiv: document.getElementById("exportDiv"),
  importDiv: document.getElementById("importDiv"),
  regexCheckbox: document.getElementById("regexCheckbox"),
  
  init: function() {
    TaskList.index = parseInt(window.localStorage.getItem("Task:index"));
    if(!TaskList.index)
      window.localStorage.setItem("Task:index", TaskList.index = 0);
    
    var curVersion = document.getElementById("curVersion");
    curVersion.innerHTML = TaskList.version;

    if(!window.localStorage.getItem("Task:version"))
      window.localStorage.setItem("Task:version", TaskList.version);

    if(TaskList.version === window.localStorage.getItem("Task:version")) {
      var versionMessage = document.getElementById("oldVersion");
      versionMessage.style.display = "none";  
    }
    else {
      var oldVersion = document.createElement("span");
      oldVersion.innerHTML = " (Atual: " + window.localStorage.getItem("Task:version") + ")";
      curVersion.appendChild(oldVersion);
    }

    TaskList.fetchTask();
  },
  
  fetchTask: function() {
    while(TaskList.taskListDiv.firstChild)
      TaskList.taskListDiv.removeChild(TaskList.taskListDiv.firstChild);

    var i, length, taskList = [];
    for(i = 0, length = window.localStorage.length; i < length; i++) {
      var key = window.localStorage.key(i);
      if(/Task:\d+/.test(key))
        taskList.push(JSON.parse(window.localStorage.getItem(key)));
    }
    taskList.sort(function(a, b) {
      if(a.date.year < b.date.year)
        return -1;
      else if(a.date.year > b.date.year)
        return 1;
      else if(a.date.month < b.date.month)
        return -1;
      else if(a.date.month > b.date.month)
        return 1;
      else if(a.date.day < b.date.day)
        return -1;
      else if(a.date.day > b.date.day)
        return 1;
      else if(a.title < b.title)
        return -1;
      else if(a.title > b.title)
        return 1;
      else
        return 0;
    }).filter(TaskList.filterTask)
    .forEach(TaskList.pageAdd);
  },
  
  showNewTask: function() {
    TaskList.newTaskDiv.style.display = "block";
    document.getElementById("newTitle").value = "";
    document.getElementById("newDate").value = "";
    document.getElementById("newDescription").value = "";
    document.getElementById("newTags").value = "";
  },
  
  clearTasks: function() {
    if(window.localStorage.length > 1 && confirm("Tem certeza de que quer apagar todas as tarefas?")) {
      window.localStorage.clear();

      TaskList.init();
    }
  },
    
  addTask: function() {
    var newTitle = document.getElementById("newTitle");
    var newDate = document.getElementById("newDate");
    var newDescription = document.getElementById("newDescription");
    var newTags = document.getElementById("newTags");
    
    if(newTitle.value === "" && newDate.value === "" && newDescription.value === "" && newTags.value === "") {
      TaskList.newTaskDiv.style.display = "none";
    }
    else if(newTitle.value !== "" && dateRegex.test(newDate.value)) {//Campos validos
      TaskList.newTaskDiv.style.display = "none";
      
      var trimmedTags = newTags.value.split(",");
      for(var i = 0, length = trimmedTags.length; i < length; i++) {
        trimmedTags[i] = trimmedTags[i].trim();
        /*if(trimmedTags[i] === "")
        {
          trimmedTags.splice(i, 1);
          i--;
        }*/
      }
      
      while(window.localStorage.getItem("Task:"+TaskList.index))
        TaskList.index++;

      var date = newDate.value.split("/");
      var today = new Date();
      var task = {
        id: TaskList.index,
        complete: false,
        title: newTitle.value,
        description: newDescription.value,
        tags: trimmedTags,
        date: {day: date[0], month: date[1], year: date[2]},
        creationDate: {day: (today.getDate()<10?"0"+today.getDate():""+today.getDate()), month: (today.getMonth()+1<10?"0"+(today.getMonth()+1):""+today.getMonth()+1), year: ""+today.getFullYear()},
        completeDate: {day: "00", month: "00", year: "0000"}
      };
      
      alert(JSON.stringify(task));
      TaskList.storeAdd(task);
      TaskList.pageAdd(task);
    }
    else
    {
      alert("Erro: Campos invalidos");
    }
  },

  removeTask: function(id) {
    if(confirm("Tem certeza de que quer apagar esta tarefa?")) {
      TaskList.storeRemove(id);
      TaskList.pageRemove(id);
    }
  },
  
  storeAdd: function(task) {
    window.localStorage.setItem("Task:"+task.id, JSON.stringify(task));
    window.localStorage.setItem("Task:index", parseInt(task.id)+1);
    TaskList.index = parseInt(window.localStorage.getItem("Task:index"));
  },
  
  storeRemove: function(id) {
    window.localStorage.removeItem("Task:"+id);
  },
  
  pageAdd: function(task) {
    var taskDiv = document.createElement("div");
    taskDiv.className = "task";
    taskDiv.id = "Task:"+task.id;
    taskDiv.tabIndex = "-1";
    taskDiv.addEventListener("click", function() {
      var description = $(".description", this);
      description.slideToggle(100);
      var tags = $(".tags", this);
      tags.slideToggle(100);
    });
    
    var complete = document.createElement("input");
    complete.type = "checkbox";
    complete.checked = task.complete;
    complete.className = "complete";
    complete.addEventListener("click", function() {
      var taskDiv = this.parentNode.parentNode.parentNode.parentNode; //ALTERAR!!!
      var taskId = taskDiv.id.split(":")[1];
      var taskCompleted = taskDiv.getElementsByClassName("complete")[0].checked;
      
      var task = JSON.parse(window.localStorage.getItem("Task:"+taskId));
      task.complete = taskCompleted;

      if(taskCompleted) {
        var today = new Date();
        task.completeDate = {day: (today.getDate()<10?"0"+today.getDate():""+today.getDate()), month: (today.getMonth()+1<10?"0"+(today.getMonth()+1):""+today.getMonth()+1), year: ""+today.getFullYear()};
      } 
      else {
        task.completeDate = {day: "00", month: "00", year: "0000"};
      }

      window.localStorage.setItem("Task:"+task.id, JSON.stringify(task));
    });
    
    var title = document.createElement("h1");
    title.innerHTML = task.title
    title.className = "title";
    
    var description = document.createElement("p");
    description.innerHTML = task.description.replace(/\n/g, "<br />");
    description.className = "description";
    
    var tags = document.createElement("div");
    tags.className = "tags";
    
    /*var id = document.createElement("input");
    id.type = "hidden";
    id.value = task.id;
    id.className = "id";*/
    
    var options = document.createElement("button");
    options.innerHTML = "E";
    options.className = "options";

    var remove = document.createElement("button");
    remove.innerHTML = "X";
    remove.className = "remove";
    remove.addEventListener("click", function() {
      var taskDiv = this.parentNode.parentNode.parentNode.parentNode; //ALTERAR!!!
      TaskList.removeTask(taskDiv.id.split(":")[1]);
    });
	
    /*var date = document.createElement("span");
    date.innerHTML = task.date;
    date.className = "date";*/
    
    for(var i = 0, length = task.tags.length; i < length; i++) {
      if(task.tags[i] !== "") {
        var tag = document.createElement("span");
        tag.className = "tag";
        tag.innerHTML = task.tags[i];
        tags.appendChild(tag);
      }
    }
    if(tags.childNodes.length == 0)
      tags.className = "emptyTags";
    
    var table = document.createElement("table");
    var tableTR = document.createElement("tr");
    
    var tableTD = document.createElement("td");
    tableTD.style.whiteSpace = "nowrap";
    tableTD.appendChild(complete);
    tableTR.appendChild(tableTD);
    
    tableTD = document.createElement("td");
    tableTD.style.width = "100%";
    tableTD.appendChild(title);
    tableTD.appendChild(description);
    tableTD.appendChild(tags);
    //tableTD.appendChild(id);
    tableTR.appendChild(tableTD);
    
    tableTD = document.createElement("td");
    tableTD.style.whiteSpace = "nowrap";
    //tableTD.appendChild(date);
    tableTD.appendChild(options);
    tableTD.appendChild(remove);
    tableTR.appendChild(tableTD);
    
    table.appendChild(tableTR);
    taskDiv.appendChild(table);
    //TaskList.taskListDiv.insertBefore(taskDiv, TaskList.newTaskDiv);
    //TaskList.taskListDiv.appendChild(taskDiv);
    var dateDiv = document.getElementById(task.date.day+"/"+task.date.month+"/"+task.date.year);
    if(!dateDiv) {
      dateDiv = document.createElement("div");
      dateDiv.id = task.date.day+"/"+task.date.month+"/"+task.date.year;

      var date = document.createElement("span");
      date.innerHTML = task.date.day+"/"+task.date.month+"/"+task.date.year;
      date.className = "date";
      dateDiv.appendChild(date);

      TaskList.taskListDiv.appendChild(dateDiv);
    }
    dateDiv.appendChild(taskDiv);
  },

  pageRemove: function(id) {
    taskDiv = document.getElementById("Task:"+id);
    if(taskDiv) {
      var dateDiv = taskDiv.parentNode;
      dateDiv.removeChild(taskDiv);
      
      if(dateDiv.childNodes.length <= 1)
        dateDiv.parentNode.removeChild(dateDiv);
    }
  },

  exportTasks: function() {
    var tasksCode = "";

    for(var i = 0, length = window.localStorage.length; i < length; i++) {
      var key = window.localStorage.key(i);
      if(/Task:*/.test(key))
        tasksCode += key+"►"+window.localStorage.getItem(key)+"◄";
    }
    exportDiv.style.display = "block";
    document.getElementById("exportCode").value = b64Encode(tasksCode);
  },

  showImportDiv: function() {
    importDiv.style.display = "block";
    var importCode = document.getElementById("importCode")
    importCode.value = "";
    importCode.focus();
  },

  importTasks: function() {
    if(window.localStorage.length > 1) {
      if(confirm("Todas as tarefas serão apagadas. Deseja continuar?"))
        window.localStorage.clear();
      else
        return;
    }

    var tasksCode = b64Decode(document.getElementById("importCode").value);
    tasksCode = tasksCode.split("◄");

    for(var i = 0, length = tasksCode.length; i < length; i++) {
      var task = tasksCode[i].split("►");
      if(task[0])
        window.localStorage.setItem(task[0], task[1]);
    }

    TaskList.fetchTask();
  },

  filterTask: function(task) {
   	if(TaskList.regexCheckbox.checked) {
      var paramsRegex = new RegExp(/\(\?#[^)]*\)/g);
      var params = TaskList.filter.match(paramsRegex);
      
      if(params) {
        for(var i = 0, length = params.length; i < length; i++) {
          params[i] = params[i].substring(3, params[i].length-1);

          if(/complete\s*:\s*true/.test(params[i]) && !task.complete) {
            return false;
          }
          else if(/complete\s*:\s*false/.test(params[i]) && task.complete)
            return false;
        }
      }

      var title = TaskList.filter.replace(paramsRegex, "");
  		var regex = new RegExp(title, "i");
  		return regex.test(task.title);
  	}

  	if(task.title.toLowerCase().indexOf(TaskList.filter.toLowerCase()) === -1)
  		return false;
  		
  	return true;
  },
  
  search: function() {
  	var searchBar = document.getElementById("search");
  	TaskList.filter = searchBar.value;
  	
    /*alert(TaskList.filter);
    alert(TaskList.filter.substring(2, TaskList.filter.length-1));
    alert(new RegExp(TaskList.filter.substring(2, TaskList.filter.length-1), "i"));*/

  	TaskList.fetchTask();
    //alert(TaskList.filter + " | " + TaskList.filter.indexOf("$"));
  }
};
TaskList.init();
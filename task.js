var dateRegex = /^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))$/g;

/*$("#newTaskDiv").focusout(function(){
  $(this).css("display", "none");
});*/

function b64Encode(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}
function b64Decode(str) {
  return decodeURIComponent(escape(window.atob(str)));
}

$(document).mouseup(function(e){
  var container = $("#newTaskDiv");
  if(!container.is(e.target) && container.has(e.target).length === 0)
    container.css("display", "none");
});

$(document).mouseup(function(e){
  var container = $("#newCategoryDiv");
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
  cIndex: window.localStorage.getItem("Task:#index"),
  fIndex: window.localStorage.getItem("Task:$index"),
  filter: "",
  version: "v0.1.0",
  taskListDiv: document.getElementById("tasksList"),
  newTaskDiv: document.getElementById("newTaskDiv"),
  categoriesListDiv: document.getElementById("categoriesList"),
  newCategoryDiv: document.getElementById("newCategoryDiv"),
  filtersListDiv: document.getElementById("filtersList"),
  newFilterDiv: document.getElementById("newFilterDiv"),
  exportDiv: document.getElementById("exportDiv"),
  importDiv: document.getElementById("importDiv"),
  advancedSearch: document.getElementById("advancedSearch"),
  
  init: function() {
    TaskList.index = parseInt(window.localStorage.getItem("Task:index"));
    if(!TaskList.index)
      window.localStorage.setItem("Task:index", TaskList.index = 0);

    TaskList.cIndex = parseInt(window.localStorage.getItem("Task:#index"));
    if(!TaskList.cIndex) {
      window.localStorage.setItem("Task:#0", '{"cid":0,"name":"Sem Categoria"}');
      window.localStorage.setItem("Task:#index", TaskList.cIndex = 1);
    }

    TaskList.fIndex = parseInt(window.localStorage.getItem("Task:$index"));
    if(!TaskList.fIndex) {
      window.localStorage.setItem("Task:$0", '{"fid":0,"name":"Todas as tarefas","filter":"","advanced":false}');
      window.localStorage.setItem("Task:$index", TaskList.fIndex = 1);
    }

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
    TaskList.fetchCategory();
    TaskList.fetchFilter();
  },
  
  fetchTask: function() {
    while(TaskList.taskListDiv.firstChild)
      TaskList.taskListDiv.removeChild(TaskList.taskListDiv.firstChild);

    var taskList = [];
    for(var i = 0, length = window.localStorage.length; i < length; i++) {
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
    .forEach(TaskList.pageAddTask);
  },
  
  showNewTask: function() {
    TaskList.newTaskDiv.style.display = "block";
    document.getElementById("newTitle").value = "";
    document.getElementById("newDate").value = "";
    document.getElementById("newDescription").value = "";
    document.getElementById("newTags").value = "";
    document.getElementById("newCategory").value = "";
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
    var newCategory = document.getElementById("newCategory");
    
    if(newTitle.value === "" && newDate.value === "" && newDescription.value === "" && newTags.value === "" && newCategory.value === "") {
      TaskList.newTaskDiv.style.display = "none";
    }
    else {
      var error = "";
      if(newTitle.value === "") {
        error += "Sem título\n";
      }
      if(!dateRegex.test(newDate.value)) {
        error += "Formato de data inválido\n";
      }
      if(newCategory.value !== "") {
        var cid = 0;
        for(var i = 0, length = window.localStorage.length; i < length; i++) {
          var key = window.localStorage.key(i);
          if(/Task:#\d+/.test(key) && JSON.parse(window.localStorage.getItem(key)).name == newCategory.value) {
            cid = JSON.parse(window.localStorage.getItem(key)).cid;
            break;
          }
        }
        if(cid == 0) {
          error += "Categoria inexistente";
        }
      }

      if(error !== "") {
        alert("Erro:\n\n" + error);
      }
      else {
        TaskList.newTaskDiv.style.display = "none";

        var trimmedTags = newTags.value.split(",");
        for(var i = 0; i < trimmedTags.length; i++) {
          trimmedTags[i] = trimmedTags[i].trim();
          if(trimmedTags[i] == "")
          {
            trimmedTags.splice(i, 1);
            i--;
          }
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
          category: cid,
          date: {day: date[0], month: date[1], year: date[2]},
          creationDate: {day: (today.getDate()<10?"0"+today.getDate():""+today.getDate()), month: (today.getMonth()+1<10?"0"+(today.getMonth()+1):""+today.getMonth()+1), year: ""+today.getFullYear()},
          completeDate: {day: "00", month: "00", year: "0000"}
        };
        
        alert(JSON.stringify(task));
        TaskList.storeAddTask(task);
        TaskList.pageAddTask(task);
      }
    }
  },

  removeTask: function(id) {
    if(confirm("Tem certeza de que quer apagar esta tarefa?")) {
      TaskList.storeRemoveTask(id);
      TaskList.pageRemoveTask(id);
    }
  },
  
  storeAddTask: function(task) {
    window.localStorage.setItem("Task:"+task.id, JSON.stringify(task));
    window.localStorage.setItem("Task:index", parseInt(task.id)+1);
    TaskList.index = parseInt(window.localStorage.getItem("Task:index"));
  },
  
  storeRemoveTask: function(id) {
    window.localStorage.removeItem("Task:"+id);
  },
  
  pageAddTask: function(task) {
    var taskDiv = document.createElement("div");
    taskDiv.className = "task";
    taskDiv.id = "Task:"+task.id;
    taskDiv.tabIndex = "-1";
    taskDiv.addEventListener("click", function() {
      if(document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "BUTTON") {
        var description = $(".description", this);
        description.slideToggle(100);
        var tags = $(".tags", this);
        tags.slideToggle(100);
      }
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

  pageRemoveTask: function(id) {
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
    if(TaskList.advancedSearch.checked) {
      try {
        var params = JSON.parse(TaskList.filter);
      }
      catch(e) {
        return false;
        //JSON inválido
      }

      if(typeof params.complete !== "undefined") {
        if(params.complete == true && !task.complete)
          return false;
        if(params.complete == false && task.complete)
          return false;
      }

      if(params.title) {
        var regex = new RegExp(params.title, "i");
        if(!regex.test(task.title))
          return false;
      }

      if(params.description) {
        var regex = new RegExp(params.description, "i");
        if(!regex.test(task.description))
          return false;
      }

      /*var regex = new RegExp(params.category, "i");
      if(!regex.test(task.category))
        return false;*/

      if(params.tags) {
        var map = {}
        for(var i = 0, length = task.tags.length; i < length; i++) {
          map[task.tags[i]] = true;
        }
        for(var i = 0, length = params.tags.length; i < length; i++) {
          if(!map[params.tags[i]])
            return false;
        }
      }
      
      if(params.date) {
        if(params.date.min) {
          if(params.date.min.year > task.date.year)
            return false;
          if(params.date.min.year == task.date.year) {
            if(params.date.min.month > task.date.month)
              return false;
            if(params.date.min.month == task.date.month) {
              if(params.date.min.day > task.date.day)
                return false
            }
          }
        }
        if(params.date.max) {
          if(params.date.max.year < task.date.year)
            return false;
          if(params.date.max.year == task.date.year) {
            if(params.date.max.month < task.date.month)
              return false;
            if(params.date.max.month == task.date.month) {
              if(params.date.max.day < task.date.day)
                return false
            }
          }
        }
      }

      if(params.creationDate) {
        if(params.creationDate.min) {
          if(params.creationDate.min.year > task.creationDate.year)
            return false;
          if(params.creationDate.min.year == task.creationDate.year) {
            if(params.creationDate.min.month > task.creationDate.month)
              return false;
            if(params.creationDate.min.month == task.creationDate.month) {
              if(params.creationDate.min.day > task.creationDate.day)
                return false
            }
          }
        }
        if(params.creationDate.max) {
          if(params.creationDate.max.year < task.creationDate.year)
            return false;
          if(params.creationDate.max.year == task.creationDate.year) {
            if(params.creationDate.max.month < task.creationDate.month)
              return false;
            if(params.creationDate.max.month == task.creationDate.month) {
              if(params.creationDate.max.day < task.creationDate.day)
                return false
            }
          }
        }
      }

      if(params.completeDate) {
        if(!task.complete)
          return false;

        if(params.completeDate.min) {
          if(params.completeDate.min.year > task.completeDate.year)
            return false;
          if(params.completeDate.min.year == task.completeDate.year) {
            if(params.completeDate.min.month > task.completeDate.month)
              return false;
            if(params.completeDate.min.month == task.completeDate.month) {
              if(params.completeDate.min.day > task.completeDate.day)
                return false
            }
          }
        }
        if(params.completeDate.max) {
          if(params.completeDate.max.year < task.completeDate.year)
            return false;
          if(params.completeDate.max.year == task.completeDate.year) {
            if(params.completeDate.max.month < task.completeDate.month)
              return false;
            if(params.completeDate.max.month == task.completeDate.month) {
              if(params.completeDate.max.day < task.completeDate.day)
                return false
            }
          }
        }
      }

      return true;
    }

    if(task.title.toLowerCase().indexOf(TaskList.filter.toLowerCase()) === -1)
      return false;
      
    return true;
  },
  
  search: function(filter) {
    var searchBar = document.getElementById("search");

    if(filter) {
      TaskList.filter = filter.filter;
      searchBar.value = filter.filter;
      TaskList.advancedSearch.checked = filter.advanced;
    }
    else {
      TaskList.filter = searchBar.value;
    }
    TaskList.fetchTask();
  },

  fetchCategory: function() {
    while(TaskList.categoriesListDiv.firstChild)
      TaskList.categoriesListDiv.removeChild(TaskList.categoriesListDiv.firstChild);

    var categoriesList = [];
    for(var i = 0, length = window.localStorage.length; i < length; i++) {
      var key = window.localStorage.key(i);
      if(/Task:#\d+/.test(key))
        categoriesList.push(JSON.parse(window.localStorage.getItem(key)));
    }
    categoriesList.sort(function(a, b) {
      if(a.cid < b.cid)
        return -1;
      else if(a.cid > b.cid)
        return 1;
      else
        return 0;
    }).forEach(TaskList.pageAddCategory);
  },

  showNewCategory: function() {
    TaskList.newCategoryDiv.style.display = "block";
    document.getElementById("newCategoryName").value = "";
  },

  addCategory: function() {
    var newCategoryName = document.getElementById("newCategoryName");

    if(newCategoryName.value !== "") {
      TaskList.newCategoryDiv.style.display = "none";

      while(window.localStorage.getItem("Task:#"+TaskList.cIndex))
        TaskList.cIndex++;

      var category = {
        cid: TaskList.cIndex,
        name: newCategoryName.value
      };

      alert(JSON.stringify(category));
      TaskList.storeAddCategory(category);
      TaskList.pageAddCategory(category);
    }
    else {
      alert("Campos invalidos");
    }
  },

  removeCategory: function() {

  },

  storeAddCategory: function(category) {
    window.localStorage.setItem("Task:#"+category.cid, JSON.stringify(category));
    window.localStorage.setItem("Task:#index", parseInt(category.cid)+1);
    TaskList.cIndex = parseInt(window.localStorage.getItem("Task:#index"));
  },

  storeRemoveCategory: function(cid) {

  },

  pageAddCategory: function(category) {
    var categoryItem = document.createElement("li");
    categoryItem.innerHTML = category.name;

    TaskList.categoriesListDiv.appendChild(categoryItem);
  },

  pageRemoveCategory: function(cid) {

  },

  fetchFilter: function() {
    while(TaskList.filtersListDiv.firstChild)
      TaskList.filtersListDiv.removeChild(TaskList.filtersListDiv.firstChild);

    var filtersList = [];
    for(var i = 0, length = window.localStorage.length; i < length; i++) {
      var key = window.localStorage.key(i);
      if(/Task:\$\d+/.test(key))
        filtersList.push(JSON.parse(window.localStorage.getItem(key)));
    }
    filtersList.sort(function(a, b) {
      if(a.fid < b.fid)
        return -1;
      else if(a.fid > b.fid)
        return 1;
      else
        return 0;
    }).forEach(TaskList.pageAddFilter);
  },

  showNewFilter: function() {
    TaskList.newFilterDiv.style.display = "block";
    document.getElementById("newFilterName").value = "";
  },

  addFilter: function() {
    var newFilterName = document.getElementById("newFilterName");

    if(newFilterName.value !== "" && TaskList.filter !== "") {
      TaskList.newFilterDiv.style.display = "none";

      while(window.localStorage.getItem("Task:$"+TaskList.fIndex))
        TaskList.fIndex++;

      var filter = {
        fid: TaskList.fIndex,
        name: newFilterName.value,
        filter: TaskList.filter,
        advanced: TaskList.advancedSearch.checked
      };

      alert(JSON.stringify(filter));
      TaskList.storeAddFilter(filter);
      TaskList.pageAddFilter(filter);
    }
    else {
      alert("Campos invalidos");
    }
  },

  removeFilter: function() {

  },

  storeAddFilter: function(filter) {
    window.localStorage.setItem("Task:$"+filter.fid, JSON.stringify(filter));
    window.localStorage.setItem("Task:$index", parseInt(filter.fid)+1);
    TaskList.fIndex = parseInt(window.localStorage.getItem("Task:$index"));
  },

  storeRemoveFilter: function(fid) {

  },

  pageAddFilter: function(filter) {
    var filterItem = document.createElement("li");
    filterItem.innerHTML = filter.name;
    filterItem.addEventListener("click", TaskList.search.bind(null, filter))

    TaskList.filtersListDiv.appendChild(filterItem);
  },

  pageRemoveFilter: function(fid) {

  }
};
TaskList.init();
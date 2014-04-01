function b64Encode(str) {
	return window.btoa(unescape(encodeURIComponent(str)));
}
function b64Decode(str) {
	return decodeURIComponent(escape(window.atob(str)));
}

function convertTask() {
	var oldTask = document.getElementById("oldTasksCode");
	var newTask = document.getElementById("newTasksCode");

	var tasksCode = b64Decode(oldTask.value);
	tasksCode = tasksCode.split("◄");

	var version;
	var tasks = [];
	for(i = 0, length = tasksCode.length; i < length; i++) {
		var task = tasksCode[i].split("►");

		if(task[0] === "Task:version")
			version = i;

		if(/Task:\d+/.test(task[0])) {
			tasks.push([task[0], JSON.parse(task[1])]);
		}
		else if(task[0]){
			tasks.push([task[0], task[1]]);
		}
	}

	if(tasks[version][1] === "v0.0.0") {
		for(var i = 0, length = tasks.length; i < length; i++) {
			if(/Task:\d+/.test(tasks[i][0])) {
				var date = tasks[i][1].date.split("/");
				var today = new Date();
				tasks[i][1].date = {day: date[0], month: date[1], year: date[2]};
				tasks[i][1].creationDate = {day: (today.getDate()<10?"0"+today.getDate():""+today.getDate()), month: (today.getMonth()+1<10?"0"+(today.getMonth()+1):""+today.getMonth()+1), year: ""+today.getFullYear()};
				
				if(tasks[i][1].complete)
					tasks[i][1].completeDate = tasks[i][1].creationDate;
				else
					tasks[i][1].completeDate = {day: "00", month: "00", year: "0000"};

				tasks[version][1] = "v0.1.0";
			}
		}
	}

	tasksCode = "";

	for(var i = 0, length = tasks.length; i < length; i++) {
		if(/Task:*/.test(tasks[i][0])) {
			if(/Task:\d+/.test(tasks[i][0]))
				tasksCode += tasks[i][0]+"►"+JSON.stringify(tasks[i][1])+"◄";
			else
				tasksCode += tasks[i][0]+"►"+tasks[i][1]+"◄";
		}
	}
	newTask.value = b64Encode(tasksCode);
}
async function setProfile(data){
    if(!data["username"] || !data["name"] || !data["lastBackedUp"] || !data["data"]) throw new Error("Invalid Profile Data")

    data = JSON.stringify(data)

    localStorage.setItem('independentProfile',data)

    return true
}

async function getProfile(){
    data = window.localStorage.getItem('independentProfile')

    if(!data) return false

    try{
        data = JSON.parse(data)
    }catch(err){
        userAlert("DANGER", "Your profile could not load properly. Try re-loading from a save file.")
    }

    return data
}

async function criticalError(error){
    userAlert('DANGER', "A critical process error occurred: "+error)
}

async function newProfile(username, profilename){
    profile = {
        username: username,
        name: profilename,
        lastBackedUp: -1,
        data:{}
    }

    await setProfile(profile).catch(err => {criticalError(err)})

    await userAlert("SUCCESS", "A new profile was created.")
    location = "./dashboard"
}

async function uploadProfile(){
    document.getElementById('uploaderloader').style.display = "flex"
    document.getElementById('choosefilebutton').style.display = "none"

    try{
        var [handle] = await window.showOpenFilePicker({
            types: [{
                description: 'Independent Profile File',
                accept: {'application/indp': ['.indpt']},
            }],
        });
    }catch(err){
        document.getElementById('uploaderloader').style.display = "none"
        document.getElementById('choosefilebutton').style.display = "block"

        return
    }

    const file = await handle.getFile();
    const text = await file.text();
    let data

    try{
        data = JSON.parse(text);
    }catch(err){
        document.getElementById('uploaderloader').style.display = "none"
        document.getElementById('choosefilebutton').style.display = "block"

        return userAlert("DANGER","An error occurred. Your file is invalid.")
    }
    
    if(!data["backupInfo"] || !data["currentFile"] || !data["lastBackedUp"]){
        document.getElementById('uploaderloader').style.display = "none"
        document.getElementById('choosefilebutton').style.display = "block"
        userAlert("DANGER","An error occurred. Your file is invalid.")
        return
    }

    document.getElementById('uploadProfile').style.display = "flex"
}


async function userAlert(style,info){
    console.warn(info)
}

async function deleteMainLoader(){
    document.getElementById("pageLoader").remove()
}

const tools = [
    {
        icon:"protocols.png",
        name:"Protocols",
        url:"protocols",
        desc: "Create, edit, and use programmed lists of tasks"
    }
]

async function setupDash(){
    profile = await getProfile()

    if(!profile){
        location = "./../"
        return
    }

    date = new Date()
    

    if(date.getHours() < 12){
        document.getElementById('userGreetingTime').innerHTML = "morning"
    }else if(date.getHours() < 20){
        document.getElementById('userGreetingTime').innerHTML = "afternoon"
    }else{
        document.getElementById('userGreetingTime').innerHTML = "evening"
    }

    await loadCalendar(document.getElementById('pageCal'))

    document.getElementById('userGreetingName').innerHTML = profile.username

    list = document.getElementById('toolList')

    i = 0
    while(i<tools.length){
        newtool = document.createElement("div")
        newtool.setAttribute("tabindex","0")
        newtool.classList.add("toollisted")
        newtool.classList.add("limwi")
        

        newicon = document.createElement("img")
        newicon.src = `./../assets/icons/${tools[i].icon}`
        newicon.style.borderRadius = "20px"
        newicon.height = "100"
        newicon.width = "100"

        infobar = document.createElement("div")
        infobar.classList.add("col")

        tooltitle = document.createElement("span")
        tooltitle.classList.add("h2")
        tooltitle.innerHTML = tools[i].name

        tooldesc = document.createElement("p")
        tooldesc.innerHTML = tools[i].desc

        infobar.appendChild(tooltitle)
        infobar.appendChild(tooldesc)

        newtool.appendChild(newicon)
        newtool.appendChild(infobar)

        list.appendChild(newtool)
        i++
    }

    deleteMainLoader()
}

async function loadCalendar(element){
    const firstDay = 0;
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const date = new Date()

    todayDay = date.getDay()
    dateDif = todayDay-firstDay

    timeDif = dateDif*(1000*60*60*24)

    startDay = date.getTime()-(timeDif)

    i = 0
    while(i<7){
        newDay = document.createElement("div")

        newDayHeader = document.createElement("div")
        newDayHeader.classList.add("row")
        newDayHeader.style.alignItems = "center"
        newDayHeader.style.justifyContent = "space-between"

        newWDate = document.createElement("span")
        newWDate.classList.add("h3")
        newWDate.innerHTML = days[new Date(startDay + ((1000*60*60*24) * i)).getDay()]


        newDate = document.createElement("span")
        newDate.classList.add("h2")
        newDate.innerHTML = new Date(startDay + ((1000*60*60*24) * i)).getDate()
        newDate.style.marginRight = "10px"

        
        newDayHeader.appendChild(newDate)
        newDayHeader.appendChild(newWDate)

        newDay.appendChild(newDayHeader)

        if(new Date(startDay + ((1000*60*60*24) * i)).getDate() == date.getDate()){
            newDay.style.padding = "20px"
            newDayHeader.style.padding="5px 10px"
            newDayHeader.style.borderRadius = "5px"
            newDayHeader.style.backgroundColor = "var(--secondary)"
            newDayHeader.style.color = "var(--main-cnt)"
        }

        element.appendChild(newDay)
        
        i++
    }
}

async function setupLanding(){
    profile = await getProfile()
    if(!profile){
        deleteMainLoader()
        return
    }else{
        location = "./dashboard"
    }
}
async function setProfile(data){
    if(!data["username"] || !data["name"] || !data["lastBackedUp"] || !data["data"]) throw new Error("Invalid Profile Data")

    data.lastEdited = new Date().getTime()

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
    if(!username || !profilename) return userAlert("DANGER", "Invalid field values")
    profile = {
        username: username,
        name: profilename,
        lastBackedUp: -1,
        lastEdited:new Date().getTime(),
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
        data = JSON.parse(text)
        console.log(data)
    }catch(err){
        document.getElementById('uploaderloader').style.display = "none"
        document.getElementById('choosefilebutton').style.display = "block"

        return userAlert("DANGER","An error occurred. Your file is invalid.")
    }
    
    if(!data["backupInfo"] || !data["lastBackedUp"]){
        document.getElementById('uploaderloader').style.display = "none"
        document.getElementById('choosefilebutton').style.display = "block"
        userAlert("DANGER","An error occurred. Your file is invalid.")
        return
    }

    document.getElementById('uploadProfile').style.display = "flex"

    localStorage.setItem('tempIndptProfileData',JSON.stringify(data))

    document.getElementById("uploadProfile").style.display = "none"

    document.getElementById('uploaderloader').style.display = "none"
    document.getElementById('choosefilebutton').style.display = "block"

    document.getElementById('loadprofile').style.display = "flex"

    document.getElementById('profileName').value = data["backupInfo"]["name"]
}


async function userAlert(style,info){
    alerts = window.localStorage.getItem('alerts') || '[]'

    alerts = JSON.parse(alerts)

    alerts.push({style:style,text:info})

    window.localStorage.setItem('alerts', JSON.stringify(alerts))

    await loadAlerts()
}

async function deleteMainLoader(){
    if(!document.getElementById("pageLoader")) return
    document.getElementById("pageLoader").remove()
}

const tools = [
    {
        icon:"protocols.png",
        name:"Protocols",
        url:"protocols",
        desc: "Create, edit, and use programmed lists of tasks"
    },
    {
        icon:"learning.png",
        name:"Learning",
        url:"learning",
        desc: "Track your progress in learning programmable courses"
    },
    {
        icon:"calendar.png",
        name:"Calendar",
        url:"calendar",
        desc: "Create, edit, and track events, tasks, and day conditions"
    },
    {
        icon:"programclock.png",
        name:"Program Clock",
        url:"programclock",
        desc: "Keep track of timed events in a sequence"
    },
    {
        icon:"settings.png",
        name:"Settings",
        url:"settings",
        desc: "Customize your Independent experience"
    },
    {
        icon:"toothalteration.png",
        name:"Tooth Alteration",
        url:"tooth",
        desc: "Manage time spent with and without tooth alterating treatment"
    },
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
        //newtool.classList.add("limwi")
        

        newicon = document.createElement("img")
        newicon.src = `./../assets/icons/${tools[i].icon}`
        newicon.style.borderRadius = "20px"
        newicon.height = "100"
        newicon.width = "100"

        infobar = document.createElement("div")
        infobar.classList.add("col")

        tooltitle = document.createElement("span")
        tooltitle.classList.add("h3")
        tooltitle.innerHTML = tools[i].name

        tooldesc = document.createElement("p")
        tooldesc.innerHTML = tools[i].desc

        infobar.appendChild(tooltitle)
        //infobar.appendChild(tooldesc)

        newtool.appendChild(newicon)
        newtool.appendChild(infobar)

        list.appendChild(newtool)

        newtool.setAttribute('onclick', `location = './../tools/${tools[i].url}'`)
        i++
    }

    

    displayBackupStatus()

    deleteMainLoader()
}

async function displayBackupStatus(){
    profile = await getProfile()
    if(profile.lastEdited > profile.lastBackedUp){
        console.log(profile.lastEdited, profile.lastBackedUp)
        document.getElementsByClassName("saveStatus")[0].children[0].innerHTML = "Saved in browser"
        document.getElementsByClassName("saveStatus")[0].children[1].classList.add('notsaved')
    }else{
        document.getElementsByClassName("saveStatus")[0].children[0].innerHTML = "Backed up"
        document.getElementsByClassName("saveStatus")[0].children[1].classList.add('saved')
    }
    return
}

async function deleteAlert(index){
    index = index-1

    alerts = window.localStorage.getItem('alerts') || '[]'

    alerts = JSON.parse(alerts)

    alerts.splice(index,1)

    window.localStorage.setItem('alerts', JSON.stringify(alerts))

    await loadAlerts()
}

async function loadAlerts(){
    alerts = window.localStorage.getItem('alerts') || '[]'

    alerts = JSON.parse(alerts)

    overlay = document.getElementById("alertOverlay")

    overlay.innerHTML = ""

    i = 0
    while(i<alerts.length){
        newAlert = document.createElement("div")
        newAlert.classList.add("alert")

        closeIcon = document.createElement("div")
        closeIcon.classList.add('closeIcon')

        closeIcon.setAttribute('onclick', `deleteAlert(${i+1})`)
        
        closeIconIm = document.createElement("img")
        closeIconIm.style.height = "20px"
        closeIconIm.style.color = "rgb(59, 128, 255)"
        closeIconIm.setAttribute("src","./../../assets/icons/close-icon.svg")

        closeIcon.appendChild(closeIconIm)

        alertText = document.createElement("span")
        alertText.innerHTML = alerts[i].text
        alertText.style.margin = "1px 0px 0px 0px"

        newAlert.appendChild(closeIcon)
        newAlert.appendChild(alertText)
        overlay.appendChild(newAlert)
        i++
    }
}

async function createProtocol(){
    protocol = {
        title: document.getElementById('protocolName').value,
        color: JSON.parse(window.localStorage.getItem('selectedColour'))
    }

    if(!protocol.title || !protocol.color) return userAlert('DANGER', "Invalid field values")

    profile = await getProfile()

    protocol.stages = []

    profile.data.protocols.protocols.push(protocol)

    await setProfile(profile)

    setupProtocols()

    document.getElementById('newProtocol').style.display = "none"
}

const colours = [
    [235,95,95],
    [235,145,60],
    [235,190,65],
    [120,235,65],
    [90,150,235],
    [135, 50, 235],
    [160, 160, 160],
    [64, 64, 64]
]

async function setupProtocols(){
    list = document.getElementById('protocolList')

    list.innerHTML = ""

    profile = await getProfile()

    if(!profile.data["protocols"]){
        profile.data.protocols = {
            protocols:[]
        }

        await setProfile(profile)
    }

    protocols = profile.data.protocols.protocols

    //protocols = [{title:"test",color:[90, 150, 235]}]


    i = 0
    while(i<protocols.length){
        protocolListed = document.createElement("div")
        console.log(i)
        protocolListed.addEventListener('click', e => {
            e.stopPropagation()
            console.log(i)
            
        })
        protocolListed.setAttribute('onclick',`openProtocol(${i})`)
        protocolListed.classList.add('protocolListed')
        protocolListed.style.background = `linear-gradient(180deg,rgba(${protocols[i].color[0]-25}, ${protocols[i].color[1]-25}, ${protocols[i].color[2]-25}, 1) 0%, rgba(${protocols[i].color[0]+20}, ${protocols[i].color[1]+20}, ${protocols[i].color[2]+20}, 1) 100%)`

        headerRow = document.createElement("div")
        headerRow.classList.add("row")
        headerRow.style.alignItems = "Center"
        headerRow.style.justifyContent = "space-between"

        title = document.createElement("span")
        title.classList.add("h2")
        title.innerHTML = protocols[i].title

        icon = document.createElement("div")
        icon.classList.add("editButton")
        icon.innerHTML = `<img src="./../../assets/icons/edit-icon.svg">`
        icon.addEventListener('click', e => {
            e.stopPropagation()
        })
        icon.setAttribute('onclick',`editProtocol(${i})`)

        headerRow.appendChild(title)
        headerRow.appendChild(icon)

        protocolListed.appendChild(headerRow)

        list.appendChild(protocolListed)
        i++
    }

    deleteMainLoader()
}

async function getProtocolOpen(){
    index = window.localStorage.getItem('openProtocolIndex')

    profile = await getProfile()

    return profile.data.protocols.protocols[index]
}

async function setupProtocolOpen(){
    ind=window.localStorage.getItem('openProtocolIndex')
    protocols = (await getProfile()).data.protocols.protocols

    instructionArea.style.background =`linear-gradient(180deg,rgba(${protocols[ind].color[0]-25-40}, ${protocols[ind].color[1]-25-40}, ${protocols[ind].color[2]-25-40}, 1) 0%, rgba(${protocols[ind].color[0]+20-40}, ${protocols[ind].color[1]+20-40}, ${protocols[ind].color[2]+20-40}, 1) 100%)`
    
    document.getElementById('protocolProgressBarProgress').style.background =`linear-gradient(180deg,rgba(${protocols[ind].color[0]-25}, ${protocols[ind].color[1]-25}, ${protocols[ind].color[2]-25}, 1) 0%, rgba(${protocols[ind].color[0]+20}, ${protocols[ind].color[1]+20}, ${protocols[ind].color[2]+20}, 1) 100%)`
    deleteMainLoader()
    protocol = await getProtocolOpen()
    document.getElementById('protocolOpenTitle').innerHTML = protocol.title
    first = protocol.stages.shift()

    openProtocol = {
        previous:[],
        queue:protocol.stages,
        current:first
    }

    window.localStorage.setItem("openProtocol", JSON.stringify(openProtocol))

    openStage(first)
}

async function openStage(stage){
    openProtocol = window.localStorage.getItem('openProtocol')

    if(!openProtocol){
        openProtocol = {
            previous:[],
            queue:[],
            current:null
        }
    }else{
        openProtocol = JSON.parse(openProtocol)
    }

    document.getElementById('previous').style.display = "block"
    document.getElementById('next').style.display = "block"
    document.getElementById('next').innerHTML = "Next"
    document.getElementById('revisit').style.display = "block"
    document.getElementById('skip').style.display = "block"

    if(openProtocol.previous.length == 0){
        document.getElementById('previous').style.display = "none"
    }

    if(!openProtocol.current.skippable){
        document.getElementById('skip').style.display = "none"
    }

    if(openProtocol.current.synchronous){
        document.getElementById('revisit').style.display = "none"
    }

    if(openProtocol.queue.length == 0){
        document.getElementById('next').innerHTML = "Exit"
    }

    document.getElementById('stageTitle').innerHTML = openProtocol.current.title
    document.getElementById('stageDesc').innerHTML = openProtocol.current.body

    document.getElementById('protocolProgressBarProgress').style.width = (((openProtocol.previous.length)/(openProtocol.queue.length+openProtocol.previous.length))*100)+"%"
    
}

async function protocolStageAction(action){
    openProtocol = window.localStorage.getItem('openProtocol')

    if(!openProtocol){
        openProtocol = {
            previous:[],
            queue:[],
            current:null,
        }
    }else{
        openProtocol = JSON.parse(openProtocol)
    }
    
    if(action == "previous"){
        openProtocol.queue.push(openProtocol.current)
        openProtocol.current = openProtocol.previous[openProtocol.previous.length-1]
        openProtocol.previous.splice(openProtocol.previous.length-1,1)

        window.localStorage.setItem('openProtocol',JSON.stringify(openProtocol))

        await openStage(openProtocol.current)
    }else if(action == "skip"){
    }else if(action == "revisit"){
        openProtocol.current.complete = false
        openProtocol.queue.push(openProtocol.current)
        openProtocol.current = openProtocol.queue[0]
        openProtocol.queue.splice(0,1)
        window.localStorage.setItem('openProtocol',JSON.stringify(openProtocol))

        await openStage(openProtocol.current)
    }else if(action == "next"){
        if(openProtocol.queue.length==0)return location = "./../"
        openProtocol.current.complete = true
        openProtocol.previous.push(openProtocol.current)
        openProtocol.current = openProtocol.queue[0]
        openProtocol.queue.shift(0,1)
        window.localStorage.setItem('openProtocol',JSON.stringify(openProtocol))

        await openStage(openProtocol.current)
    }
    
    
}

async function openProtocol(index){

    profile = await getProfile()

    window.localStorage.setItem('openProtocolIndex', index)

    location = "./protocol"
}

async function editProtocol(index){

    profile = await getProfile()

    window.localStorage.setItem('editProtocolIndex', index)

    location = "./edit"
}

async function getProtocolEdit(){
    index = window.localStorage.getItem('editProtocolIndex')

    console.log(index)

    profile = await getProfile()

    console.log(profile)

    return profile.data.protocols.protocols[index]
}

async function newStage(){
    profile = await getProfile()
    index = window.localStorage.getItem('editProtocolIndex')

    protocol.stages.push({title:"New stage",body:"Description",skippable:false,synchronous:false})

    profile.data.protocols.protocols[index] = protocol

    await setProfile(profile)

    await displayProtocolEditorStages()
}

async function displayProtocolEditorStages(){
    document.getElementById('stages').innerHTML = ""
    console.log('test')
    protocol = await getProtocolEdit()

    console.log(protocol)

    stages = protocol.stages
    /*stages = [
        {
            title: "BG Check",
            body: "Your BG must be at or above 6.0 before sleeping and must have an arrow that projects your BG will remain the same or go higher",
            skippable: true,
        }
    ]*/

    i = 0
    while(i<stages.length){
        newstagediv = document.createElement("div")
        newstagediv.classList.add('protocolStage')

        newbar = document.createElement("div")
        newbar.classList.add('protocolEditBar')
        newstagediv.appendChild(newbar)

        iconcont1 = document.createElement("div")
        iconcont1.classList.add('clickableIcon')

        iconcont1.setAttribute('onclick', `stageEdit('delete',${i+1})`)
        newbar.appendChild(iconcont1)

        icon1 = document.createElement("img")
        icon1.src = "./../../../assets/icons/delete-icon.svg"
        iconcont1.appendChild(icon1)

        iconcont2 = document.createElement("div")
        iconcont2.classList.add('clickableIcon')

        iconcont2.setAttribute('onclick',  `stageEdit('reorder',${i+1})`)
        newbar.appendChild(iconcont2)

        icon2 = document.createElement("img")
        icon2.src = "./../../../assets/icons/order-icon.svg"
        iconcont2.appendChild(icon2)

        checkboxcont = document.createElement("div")
        checkboxcont.classList.add('checkBox')
        newbar.appendChild(checkboxcont)

        input = document.createElement("input")
        input.setAttribute("type","checkbox")

        if(stages[i].skippable)input.checked=true
        input.setAttribute('oninput',  `stageEdit('edit',${i+1})`)
        checkboxcont.appendChild(input)

        span = document.createElement("span")
        span.classList.add("h3")
        checkboxcont.appendChild(span)
        span.innerHTML = "Allow skipping"

        //
        checkboxcont = document.createElement("div")
        checkboxcont.classList.add('checkBox')
        newbar.appendChild(checkboxcont)

        input = document.createElement("input")
        input.setAttribute("type","checkbox")

        if(stages[i].synchronous)input.checked=true
        input.setAttribute('oninput',  `stageEdit('edit',${i+1})`)
        checkboxcont.appendChild(input)

        span = document.createElement("span")
        span.classList.add("h3")
        checkboxcont.appendChild(span)
        span.innerHTML = "Synchronous"

        content = document.createElement("div")
        content.classList.add("protocolContent")
        newstagediv.appendChild(content)

        title = document.createElement("input")
        title.classList.add("h2")
        title.value=stages[i].title
        title.setAttribute('oninput',  `stageEdit('edit',${i+1})`)
        content.appendChild(title)

        body = document.createElement("textarea")
        body.value=stages[i].body
        body.setAttribute('oninput',  `stageEdit('edit',${i+1})`)
        content.appendChild(body)

        document.getElementById('stages').appendChild(newstagediv)
        i++
    }

}

async function stageEdit(action, sindex){
    profile = await getProfile()
    index = window.localStorage.getItem('editProtocolIndex')

    if(action == "delete"){
        protocol.stages.splice((sindex-1),1)

        profile.data.protocols.protocols[index] = protocol

        await setProfile(profile)

        await displayProtocolEditorStages()
    }else if(action == "edit"){
        protocol.stages[sindex-1].title = document.getElementById('stages').children[sindex-1].children[1].children[0].value
        protocol.stages[sindex-1].body = document.getElementById('stages').children[sindex-1].children[1].children[1].value
        protocol.stages[sindex-1].skippable = document.getElementById('stages').children[sindex-1].children[0].children[2].children[0].checked
        protocol.stages[sindex-1].synchronous = document.getElementById('stages').children[sindex-1].children[0].children[3].children[0].checked

        profile.data.protocols.protocols[index] = protocol

        await setProfile(profile)
    }

    
}

async function submitProtocolEdits(){
    tempprotocol = {
        title: document.getElementById('protocolName').value,
        color: JSON.parse(window.localStorage.getItem('selectedColour'))
    }

    if(!protocol.title || !protocol.color) return userAlert('DANGER', "Invalid field values")

    profile = await getProfile()
    index = window.localStorage.getItem('editProtocolIndex')

    protocol.title = tempprotocol.title
    protocol.color = tempprotocol.color

    profile.data.protocols.protocols[index] = protocol

    await setProfile(profile)

    document.getElementById('editDetails').style.display = "none"

    setupProtocolEditor()
}

async function deleteProtocol(){
    profile = await getProfile()

    if(!confirm("This cannot be undone. Delete?")) return

    profile.data.protocols.protocols.splice(localStorage.getItem("editProtocolIndex"),1)

    await userAlert("SUCCESS", "Protocol deleted")

    await setProfile(profile)

    location = "./../"
}

async function protocolEditorDetails(){
    protocol = await getProtocolEdit()

    document.getElementById('protocolName').value = protocol.title
    window.localStorage.setItem('selectedColour', JSON.stringify(protocol.color))
    document.getElementById('colourList').innerHTML = ""
    
    i = 0
    while(i<colours.length){
        newColour = document.createElement("div")
        newColour.classList.add("colourPreview")
        newColour.style.background = `linear-gradient(180deg,rgba(${colours[i][0]-25}, ${colours[i][1]-25}, ${colours[i][2]-25}) 0%, rgba(${colours[i][0]+20}, ${colours[i][1]+20}, ${colours[i][2]+20}) 100%)`

        newColour.setAttribute('onclick', `setColour("${JSON.stringify(colours[i])}", this)`)
        document.getElementById('colourList').appendChild(newColour)

        if(JSON.stringify(protocol.color) == JSON.stringify(colours[i])){
            newColour.classList.add('selected')
        }
        i++
    }

    document.getElementById('editDetails').style.display = 'flex'
}

async function setupProtocolEditor(){

    protocol = await getProtocolEdit()

    document.getElementById('protocolEditorTitle').innerHTML = protocol.title

    await displayProtocolEditorStages()
    deleteMainLoader()
}

async function setColour(colour, element){
    list = document.getElementById('colourList').children

    i = 0
    while(i<list.length){
        list[i].classList.remove("selected")
        i++
    }

    element.classList.add('selected')

    window.localStorage.setItem('selectedColour',colour)
}

async function openNewProtocol(){
    document.getElementById('protocolName').value = ""
    window.localStorage.removeItem('selectedColour')
    document.getElementById('colourList').innerHTML = ""
    
    i = 0
    while(i<colours.length){
        newColour = document.createElement("div")
        newColour.classList.add("colourPreview")
        newColour.style.background = `linear-gradient(180deg,rgba(${colours[i][0]-25}, ${colours[i][1]-25}, ${colours[i][2]-25}) 0%, rgba(${colours[i][0]+20}, ${colours[i][1]+20}, ${colours[i][2]+20}) 100%)`

        newColour.setAttribute('onclick', `setColour("${JSON.stringify(colours[i])}", this)`)
        document.getElementById('colourList').appendChild(newColour)
        i++
    }

    document.getElementById('newProtocol').style.display = 'flex'
}

async function loadProfile(){
    data = window.localStorage.getItem('tempIndptProfileData')

    data = JSON.parse(data)

    await setProfile(data.backupInfo)

    window.localStorage.removeItem('tempIndptProfileData')

    location = "./dashboard"
}

async function createFile(){
    const options = {
        types: [{
            description: 'Independent Profile File',
            accept: {'application/indp': ['.indpt']},
        }],
    };
    
    date = new Date().getTime()

    profile = await getProfile()


    profile.lastBackedUp = date

    data = {
        backupInfo:profile,
        lastBackedUp:date,
    }

    localStorage.setItem("independentProfile",JSON.stringify(profile))
    

    const handle = await window.showSaveFilePicker(options);
    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(data));
    await writable.close();

    displayBackupStatus()
    openDataWindow()
      
}

async function writeBackup(){
    try{
        var [handle] = await window.showOpenFilePicker({
            types: [{
                description: 'Independent Profile File',
                accept: {'application/indp': ['.indpt']},
            }],
        });
    }catch(err){
        return
    }
    

    date = new Date().getTime()

    profile = await getProfile()


    profile.lastBackedUp = date

    data = {
        backupInfo:profile,
        lastBackedUp:date,
    }

    localStorage.setItem("independentProfile",JSON.stringify(profile))
    

    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(data));
    await writable.close();

    displayBackupStatus()
    openDataWindow()
}

async function openDataWindow(){
    profile = await getProfile()

    document.getElementById('lastbackedup').innerHTML = `Last backed up: ${new Date(profile.lastBackedUp).toLocaleString()}`
    document.getElementById("dataSaveWindow").style.display="flex"
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

async function daystamp(){
    date = (new Date())

    return `${date.getYear()}/${date.getMonth()}/${date.getDate()}`
}

function millisecondsToHMS(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Pad with leading zeros if needed
  const hDisplay = String(hours).padStart(2, '0');
  const mDisplay = String(minutes).padStart(2, '0');
  const sDisplay = String(seconds).padStart(2, '0');

  return `${hDisplay}:${mDisplay}:${sDisplay}`;
}

async function setupGraphic(totaltimeout,totaltime){
    document.getElementById('dayTotalBarProg').style.width = (((totaltimeout/totaltime)*100)+"%")


    document.getElementById('timein').innerHTML = millisecondsToHMS(totaltimeout)
    document.getElementById('timeout').innerHTML = `2:00:00`
}

async function setupToothAlt(){
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"]
    profile = await getProfile()
    date = (new Date())

    if(!profile.data["toothalt"]){
        profile.data.toothalt = {
            days:{}
        }

        await setProfile(profile)
    }

    document.getElementById('date').innerHTML = `${months[date.getMonth()]} ${date.getDate()}, ${1900+date.getYear()}`

    if(!profile.data.toothalt.days[await daystamp()]){
        profile.data.toothalt.days[await daystamp()] = {history:[]}
    }

    todayHis = profile.data.toothalt.days[await daystamp()].history

    totaltimeout = 0
    currentlyout = false
    i = 0
    while(i<profile.data.toothalt.days[await daystamp()].history.length){
        if(!profile.data.toothalt.days[await daystamp()].history[i].timein){
            currentlyout = true
            totaltimeout+=((date.getTime()-profile.data.toothalt.days[await daystamp()].history[i].timeout))
        }else{
            totaltimeout+=((profile.data.toothalt.days[await daystamp()].history[i].timein-profile.data.toothalt.days[await daystamp()].history[i].timeout))
        }
        
        i++
    }

    console.log(currentlyout)


    totaltime = 1000*60*60*2

    setupGraphic(totaltimeout,totaltime)

    if(currentlyout){
        document.getElementById('algnout').style.display = 'flex'
    }else{
        document.getElementById('algnin').style.display = 'flex'
    }
    await deleteMainLoader()

    iterableAlignPage()
}

async function iterableAlignPage(){
    //setupGraphic()
}

async function removeAlignment(){
    profile = await getProfile()
    date = (new Date())

    if(!profile.data["toothalt"]){
        profile.data.toothalt = {
            days:{}
        }

        await setProfile(profile)
    }

    if(!profile.data.toothalt.days[await daystamp()]){
        profile.data.toothalt.days[await daystamp()] = {history:[]}
    }

    profile.data.toothalt.days[await daystamp()].history.push({timeout:(new Date()).getTime()})

    await setProfile(profile)

    document.getElementById('algnout').style.display = 'flex'
    document.getElementById('algnin').style.display = 'none'
}

async function insertAlignment(){
    profile = await getProfile()
    date = (new Date())

    i = 0
    while(i<profile.data.toothalt.days[await daystamp()].history.length){
        profile.data.toothalt.days[await daystamp()].history[profile.data.toothalt.days[await daystamp()].history.length-1].timein = (new Date()).getTime()
        
        i++
    }
    await setProfile(profile)

    document.getElementById('algnout').style.display = 'none'
    document.getElementById('algnin').style.display = 'flex'
}
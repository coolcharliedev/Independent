let fileHandle

async function newProfile(){
  data = {
    name:"Not Named",
    pin:false,
    data:{}
  }

  const options = {
    types: [{
      description: 'Independent File',
      accept: {'application/indp': ['.indpt']},
    }],
  };
  
  const handle = await window.showSaveFilePicker(options);
  fileHandle = handle
  const writable = await handle.createWritable();
  await writable.write(JSON.stringify(data, null, 2));
  await writable.close();
}

async function loadFile(){
  [handle] = await window.showOpenFilePicker({
    types: [{
      description: 'Independent File',
      accept: {'application/indp': ['.indpt']},
    }],
  });

  fileHandle = handle

  const file = await fileHandle.getFile();
  const text = await file.text();
  let data = JSON.parse(text);

  console.log(data)
}
  
  async function openAndEditJSONFile() {
    // Prompt user to pick a file
    if(fileHandle){
      handle = fileHandle
    }else{
      [handle] = await window.showOpenFilePicker({
        types: [{
          description: 'Independent File',
          accept: {'application/indp': ['.indpt']},
        }],
      });
    }
  
    console.log(handle)
    const file = await handle.getFile();
    const text = await file.text();
    let data = JSON.parse(text);
    
    console.log('Original Data:', data);
  
    // Modify data
    data.age += 1;
    data.updated = true;
  
    // Write changes back to file
    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
  
    console.log('File updated!');
  }
function div(icon, name, id){
    if(icon == "link"){
        if(typeof id !== "undefined"){
            return ` <div class="link sublink" style="width:100%; display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; padding:5px; cursor:pointer; padding-right:0px; padding-left:30px; box-sizing: border-box" draggable="true">
            <div style="display:flex;" title="${name}">
                <img src="${icon}.png" style="width: 25px;"/>
                <div style="font-size: 16px; margin-left:15px;">${displayText(name, true)}</div>
            </div>
            <img class="delete" src="no.png" style="width: 20px; cursor:pointer;" data-id="${name}" data-folder="${id}">
        </div>`
        }
        return ` <div class="link" style="width:100%; display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; padding:5px; cursor:pointer;" draggable="true">
            <div style="display:flex;" title="${name}">
                <img src="${icon}.png" style="width: 25px;"/>
                <div style="font-size: 16px; margin-left:15px;">${displayText(name)}</div>
            </div>
            <img class="delete" src="no.png" style="width: 20px; cursor:pointer;" data-id="${name}">
        </div>`
    } else {
        if(typeof id === "undefined"){
            return ` <div class="folder" style="width:100%; display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; padding:5px; cursor:pointer;">
                <div style="display:flex;" title="${name}">
                    <img src="${icon}.png" style="width: 25px;"/>
                    <div style="font-size: 16px; margin-left:15px;">${displayText(name)}</div>
                </div>
                <img class="delete" src="no.png" style="width: 20px; cursor:pointer;" data-id="${name}">
            </div>`
        }
        return ` <div class="folder" style="width:100%; display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; padding:5px; cursor:pointer;">
            <div style="display:flex;" title="${name}">
                <img src="${icon}.png" style="width: 25px;"/>
                <input id="${id}" style="font-size: 16px; margin-left:15px;"/>
            </div>
            <img class="delete" src="no.png" style="width: 20px; cursor:pointer;" data-id="${name}">
        </div>`
    }
}

function deleteAddListner(){
    var deletes = document.getElementsByClassName("delete");
    for(let i of deletes){
        i.addEventListener("click", function(e){
            var curLink = e.target.dataset.id;
            var is_sublink = e.target.parentNode.classList.value.includes("sublink");

            chrome.storage.local.get(["weborg"], function(result){
                if(result.weborg == undefined){
                    return;
                } else {
                    let index = 0;
                    for(let i of result.weborg){
                        if(is_sublink){
                            var sublink_folder = e.target.dataset.folder;
                            if(i.name == sublink_folder){
                                let index_sublink = 0;
                                for(let j of i.links){
                                    if(j == curLink){
                                        break;
                                    }
                                    index_sublink++;
                                }
                                result.weborg[index].links.splice(index_sublink, 1);
                            }
                        } else {
                            if(i.name == curLink){
                                result.weborg.splice(index, 1);
                            }
                        }
                        index++;
                    }
                    chrome.storage.local.set({"weborg": result.weborg});
                }
            })
            e.target.parentNode.remove();
        });
    }

    var folder = document.getElementsByClassName("folder");
    for(let i of folder){
        i.addEventListener('dragenter', function(e){
            i.style.backgroundColor = "#3394ff";
            i.style.fontWeight = "bold";
            i.style.color = "white";
            i.style.borderRadius = "10px";
            i.children[0].children[0].style.display = "none";
        })
        i.addEventListener("dragover", function(e){
            e.preventDefault();
        })
        i.addEventListener('dragleave', function(e){
            i.style.backgroundColor = "";
            i.style.fontWeight = "";
            i.style.color = "black";
            i.children[0].children[0].style.display = "initial";
        });
        i.addEventListener("drop", function(e){
            var link = e.dataTransfer.getData('text/plain');
            var folder = i.querySelectorAll("img")[1].dataset.id;
            i.style.backgroundColor = "";
            i.style.fontWeight = "";
            i.style.color = "black";
            i.children[0].children[0].style.display = "initial";

            chrome.storage.local.get(["weborg"], function(result){
                let data = result.weborg;
                if(data != undefined){
                    let index = 0;
                    for(let i of data){
                        if(i.name == folder){
                            if(typeof data[index].links === "undefined"){
                                data[index].links = [link]
                            } else {
                                data[index].links.push(link);
                            }
                        }
                        index++;
                    }
                    i.insertAdjacentHTML("afterend", div("link", link, folder));
                    index = 0;
                    for(let i of data){
                        if(i.name == link){
                            break;
                        }
                        index++;
                    }
                    data.splice(index, 1);

                    var linkDiv = document.querySelectorAll(".link");
                    for(let i of linkDiv){
                        if(i.querySelectorAll("img")[1].dataset.id == link && !i.classList.value.includes("sublink")){
                            i.remove();
                        }
                    }

                    chrome.storage.local.set({"weborg": data});
                }
            })
        })
    }

    var link = document.querySelectorAll(".link");
    for(let i of link){
        i.addEventListener("dragstart", function(e){
            e.dataTransfer.setData('text/plain', e.target.querySelectorAll("img")[1].dataset.id);
        })
    }
}

function linkExists(arr, link){
    for(let i of arr){
        if(i.name == link){
            return true;
        }
    }
    return false;
}

function displayText(text, short){
    if(short == true){
        if(text.length > 20){
            return text.substr(0, 21) + "...";
        } else {
            return text;
        }
    } else {
        if(text.length > 28){
            return text.substr(0, 29) + "...";
        } else {
            return text;
        }
    }
}

chrome.storage.local.get(["weborg"], function(result){
    if(result.weborg == undefined){
        document.getElementById("body").innerHTML = "There is currently no recorded links!";
    } else {
        if(result.weborg.length == 0){
            document.getElementById("body").innerHTML = "There is currently no recorded links!";
            return;
        }
        var innerHTML = "";
        for(let i of result.weborg){
            innerHTML = innerHTML + div(i.type, i.name);

            if(i.type == "folder"){
                if(typeof i.links !== "undefined"){
                    for(let j of i.links){
                        innerHTML = innerHTML + div("link", j, i.name);
                    }
                }
            }
        }
        document.getElementById("body").innerHTML = innerHTML;
        deleteAddListner();
    }
})

document.getElementById("add-link").addEventListener("click", function(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        var tab = tabs[0].url
        var obj = {
            type:"link",
            name: tab
        }

        chrome.storage.local.get(["weborg"], function(result){
            if(result.weborg == undefined){
                chrome.storage.local.set({"weborg": [obj]});
            
                document.getElementById("body").innerHTML = div("link", tab);
            } else {
                var arr = result.weborg;
                if(!linkExists(arr, tab)){
                    arr.push(obj);
                    chrome.storage.local.set({"weborg": arr});
                    
                    document.getElementById("body").innerHTML += div("link", tab);
                }
            }
            deleteAddListner();
        })
    })
})

document.getElementById("add-folder").addEventListener("click", function(){

    let timeID = Date.now();
    document.getElementById("body").innerHTML += div("folder", "hello", timeID);
    let curInput = document.getElementById(timeID);
    curInput.addEventListener("focusout", function(e){
        let name = e.target.value;
        curInput.parentNode.parentNode.innerHTML = `<div class="folder" style="display:flex;" title="${name}">
            <img src="folder.png" style="width: 25px;"/>
            <div style="font-size: 16px; margin-left:15px;">${name}</div>
        </div>
        <img class="delete" src="no.png" style="width: 20px; cursor:pointer;" data-id="${name}">`

        chrome.storage.local.get(["weborg"], function(result){
            let obj = {
                type:"folder",
                name: name
            }
            if(result.weborg == undefined){
                chrome.storage.local.set({"weborg": [obj]});
            } else {
                var arr = result.weborg;
                if(!linkExists(arr, name)){
                    arr.push(obj);
                    console.log(arr);
                    chrome.storage.local.set({"weborg": arr});
                }
            }
            deleteAddListner();
        })
    })
    curInput.focus();

})
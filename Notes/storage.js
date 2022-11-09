chrome.storage.local.get(["notes"], function(result){
    document.getElementById("textarea").value = result.notes;
})

document.getElementById("textarea").addEventListener("keyup", function(e){
    chrome.storage.local.set({notes:e.target.value});
})
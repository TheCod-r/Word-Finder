let usedTypes = [];
let isFirst = true;
let charType = "none";
let inversed = false;
let cache = "";
let firstType = "";
let length = 0; // Default value if user doesn't specify length, this way we can know easily
let ltrs = ""; // Default value if user doesn't specify letters
const letters = "abcdefghijklmnopqrstuvwxyz".split``;
const numbers = "0123456789-".split``;
const ignorables = " ".split``;
const body = document.body;
body.addEventListener("keyup", function(k){
  k.keyCode == 13 ? search() : 0;
});
console.log("Fine")
let filteredWords = [];
let finalWords = [];
let time = 0;
let innerHTML = "";
let allWords = "";

function clicked(n){
    $("#initial").innerHTML = "";
    $("#afterChoose").style.visibility = "visible";
    fetch(`words_${n}.txt`)
      .then((res) => res.text())
      .then((txt) => {
        // do something with text
          allWords = txt.split`\n`.map(word => word.toLowerCase());
          console.log(allWords);
      });
}

function $(q){
  return document.querySelector(q);
}

const textarea = $("#textarea");

function type(q){
  return letters.includes(q) ? "ltr" : numbers.includes(q) ? "num" : ignorables.includes(q) ? "ign" : "invalid";
}
function appearances(string, q){
  count = 0;
  for (const character of string){
    character == q ? count++ : 0;
  }
  return count;
}
function filterFunction(word){
  let valid = false;
  if (length != 0){
    if (ltrs != ""){
      if (firstType == "num"){
        valid = (length == word.split(ltrs).length-1);
      }else if (word.indexOf(ltrs, length-1) == length-1 && length > 0){
        // Search for letters' position
        valid = true;
      }else if (word.indexOf(ltrs, word.length + length) == word.length + length && length < 0 && word.length >= length * -1){
        // if index is negative
        valid = true;
      }
    }else{
      // Search for word length
      if (length == word.length){
        valid = true;
      }
    }
  }else{
    if (ltrs != ""){
      // Search if letters are in word
      if (word.indexOf(ltrs) >= 0){
        valid = true;
      }
    }
  }
  return inversed ? !valid : valid;
}
function search(){
  $("#err").innerHTML = "";
  time = performance.now();
  finalWords = [];
  innerHTML = "";
  if ($("#command").value == ""){
    if ($("#regex").value == ""){
      $("#err").style.display = "block";
      $("#err").innerHTML = "No command found.";
      return;
    }else{
      try{
        finalWords = allWords.filter(a=>RegExp($("#regex").value).test(a));
        finalWords = finalWords.sort();
          innerHTML = finalWords.join`\n`;
        time = performance.now() - time;
        $("#words").innerHTML = `Found ${finalWords.length} ${finalWords.length == 1 ? "word" : "words"} in ${time} milliseconds!`;
          textarea.innerHTML = innerHTML;
          textarea.style.height = "";
          textarea.style.height = textarea.scrollHeight + 'px';
          textarea.style.visibility = "visible";
      }catch(err){
        $("#err").innerHTML = err;
      }
      return;
    }
  }
  for (const commands of $("#command").value.toLowerCase().split(",")){
    filteredWords = allWords;
    for (const command of commands.split("&")){
      usedTypes = []; // num, ltr
      isFirst = true;
      charType = "none";
      inversed = false;
      ltrs = "";
      firstType = "";
      length = 0;
      for (const char of command){
        //console.log(type(char));
        if (char == "!" && isFirst){
          inversed = true; // EXCLUDE the words that fit the filter
        }else if(type(char) != charType){
          if (type(char) == "ign"){
            continue;
          }else if (usedTypes.includes(type(char))){
            $("#err").innerHTML = `INVALID COMMAND ${command}, REPEATED CONTENT`;
          }else if (type(char) == "invalid"){
            $("#err").innerHTML = `INVALID CHARACTER AT COMMAND ${command}`;
          }else{ // If character IS VALID (wow!)
            if (firstType == ""){
              firstType = type(char);
            }
            switch(charType){
              case "num":
                var c = parseInt(cache);
                if (!isNaN(c) && c != 0 && (appearances(cache, "-") == 0 || (appearances(cache, "-") == 1 && cache[0] == "-"))){
                  length = parseInt(cache); // If the cache is an actual int, like 3 or 4...
                }else{
                  // If the cache isn't an actual int, like --82 or 0-...
                  $("#err").innerHTML = `INVALID COMMAND ${command}, NUMBER IS INVALID`;
                }
                break;
              case "ltr":
                ltrs = cache;
                break;
            }
            usedTypes.push(type(char)); // if it's num, now usedTypes has num and you can't use another num
            charType = type(char);
            cache = char;
          }
        }else{
          cache += char;
        }
        isFirst = false;
      }
      // When every character of a command is done...
      switch(charType){
        case "num":
          var c = parseInt(cache);
          if (!isNaN(c) && c != 0 && (appearances(cache, "-") == 0 || (appearances(cache, "-") == 1 && cache[0] == "-"))){
            length = parseInt(cache); // If the cache is an actual int, like 3 or 4...
          }else{
            // If the cache isn't an actual int, like --82 or 0-...
            $("#err").innerHTML = `INVALID COMMAND ${command}, NUMBER IS INVALID`;
          }
          break;
        case "ltr":
          ltrs = cache;
          break;
      }
      if (ltrs == "" && length == 0){
        $("#err").innerHTML = `INVALID COMMAND ${command}, NO FILTERS GIVEN`;
      }
      console.log(`CHARTYPE: ${charType}, LENGTH: ${length}, LTRS: ${ltrs}, INVERSED: ${inversed}`);
      filteredWords = filteredWords.filter(filterFunction);
    }
    // What to do when one subset's done, move to after ","
    filteredWords = filteredWords.filter(function(word){
      return !finalWords.includes(word);
    });
    finalWords = finalWords.concat(filteredWords);
  }
  finalWords = finalWords.sort();
    innerHTML = finalWords.join`\n`;
  time = performance.now() - time;
  $("#words").innerHTML = `Found ${finalWords.length} ${finalWords.length == 1 ? "word" : "words"} in ${time} milliseconds!`;
    textarea.innerHTML = innerHTML;
    textarea.style.height = "";
    textarea.style.height = textarea.scrollHeight + 'px';
    textarea.style.visibility = "visible";
}

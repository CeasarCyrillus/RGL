/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
function scan()
{
    cordova.plugins.barcodeScanner.scan(
    function(result)
    {
        document.getElementById("search").value = result.text;
        searchData();
    },
    function(error)
    {
        console.log(error);
    },
    {
        preferFrontCamera : false, // iOS and Android
        showFlipCameraButton : true, // iOS and Android
        showTorchButton : true, // iOS and Android
        torchOn: true, // Android, launch with the torch switched on (if available)
        prompt : "Placera en streckkod i skanningsytan", // Android
        resultDisplayDuration: 0, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
        format : "EAN", // default: all but PDF_417 and RSS_EXPANDED
        orientation : "unset", // Android only (portrait|landscape), default unset so it rotates with the device
        disableAnimations : false, // iOS
        disableSuccessBeep: false // iOS
      }
   );
}

function keyboardDown()
{
    var header = document.getElementById("header");
    var field = document.getElementById("hiddenInput");
    var content = document.getElementById("result");
    setTimeout(function() {
    field.setAttribute('style', 'display:block;');
    field.focus();
    content.style.marginTop = "156px";
    header.style.position = "absolute";
    header.style.zIndex = "1";
    header.style.width = "100vw";
    setTimeout(function() {
    field.setAttribute('style', 'display:none;');
    header.style.position = "unset";
    content.style.marginTop = "0";
    }, 50);
    }, 50);
}
document.getElementById("formInput").addEventListener("submit", function(event)
{
    event.preventDefault();
    keyboardDown();
});

function startApp()
{
    document.getElementById("search").disabled = false;
    document.getElementById("result").innerHTML = "<p>Här kan du kontrollera om ett läkemedel omfattas av dopingreglerna eller inte. Förteckningen omfattar enbart läkemedel godkända i Sverige för humant bruk.</p>";
}
function showInfo(id)
{
    var ids = ["name", "form", "ic", "ooc", "klass", "forbud", "dispens", "ovrigt"];
    var el = document.getElementById("popupInfo");
    el.style.display = "block";
    el.className = "animated slideInRight";
    el = document.getElementById("backButton");
    el.className = "animated rotateIn";
    //body of popuping
    setTimeout(function()
    {
        document.getElementById("infoBody").style.display = "block";
        document.getElementById("infoBody").className = "animated slideInUp"; //
    }, 200);

    for(var i = 0; i < ids.length; i++)
    {
        el = document.getElementById(ids[i]);
        el.innerHTML = currentData[id][ids[i]];
    }
}
function closePopup()
{
    var el = document.getElementById("popupInfo");
    el.className = "animated slideOutRight";

    el = document.getElementById("backButton");
    el.className = "animated rotateOut";

    //Animate out body
    document.getElementById("infoBody").className = "animated slideOutDown"; //
}

function checkNetwork()
{
    if(!navigator.onLine)
    {
        return false;
    }
    document.getElementById("loader").style.display = "block";
    var fileURL = "http://fecabook.hol.es/handlefile.php?filename=check";
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", fileURL, false); 
    rawFile.overrideMimeType('text/xml; charset=iso-8859-1');
    /*Not async because the function returns null if that is true*/
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                status =  true;
            }
            else
            {
                status = false;
            }
        }
    }
    try{rawFile.send();}
    catch(e){console.log(e); status = false;}
    document.getElementById("loader").style.display = "none";
    return status;
}

function replaceAll(str, find, replace)
{
        return str.replace(new RegExp(find, 'g'), replace);
}

function isNum(string)
{
    return string.match(/^[0-9]+$/) != null;
}

function searchName(string, format)
{
    var results = 0;
    var string = document.getElementById("search").value;
    var format = '<li class="Lakemedel"><div id="ID" onclick="showInfo(this.id);" class="Produktnamn">NAMEFORM</div></li>';
    var innerhtml = "";
    for(var i = 0; i < drugs.length; i++)
    {
        var prep = drugs[i].split(";");
        var name = prep[0];
        if(results > 10){break;}
        if(name.toLowerCase().indexOf(string.toLowerCase())+1 > 0)
        {
            results += 1;
            var name = prep[0];
            var form = prep[1];
            var ic = "<b>Tillåtet under tävling</b><br>"+prep[2];
            var ooc = "<b>Tillåtet utanför tävling</b><br>"+prep[3];
            var klass = "<b>Dopingklass</b><br>"+prep[8];
            var forbud = "<b>Förbud</b><br>"+prep[4];
            var dispens = "<b>Dispens</b><br>"+prep[5];
            var ovrigt = "<b>Övrigt</b><br>"+prep[6];

            var text = format.replace("ID", i);
            var name = "<b>" + name + "</b><br>"
            var text = text.replace("NAME", name);
            var text = text.replace("FORM", form);
            innerhtml += text;
            var form = "<b>Beredningsform</b><br>" + form;
            currentData[i] = {"name":"<h3>"+prep[0]+"<h3>", "form":form, "ic":ic,
                                "ooc":ooc, "forbud":forbud, "dispens":dispens,
                                "ovrigt":ovrigt, "klass":klass};
        }
    }
    document.getElementById('result').innerHTML = innerhtml;
    return results;
}

function searchEan(string, format)
{
    var innerhtml = "";
    var results = 0;
    for(var i = 0; i < drugs.length; i++)
    {
        var prep = drugs[i].split(";");
        var ean = prep[7];
        if(ean == string)
        {
            results = 1;
            document.getElementById("search").value = "";
            var name = prep[0];
            var form = prep[1];
            var ic = "<b>Tillåtet under tävling</b><br>"+prep[2];
            var ooc = "<b>Tillåtet utanför tävling</b><br>"+prep[3];
            var klass = "<b>Dopingklass</b><br>"+prep[8];
            var forbud = "<b>Förbud</b><br>"+prep[4];
            var dispens = "<b>Dispens</b><br>"+prep[5];
            var ovrigt = "<b>Övrigt</b><br>"+prep[6];

            var text = format.replace("ID", i);
            var name = "<b>" + name + "</b><br>"
            var text = text.replace("NAME", name);
            var text = text.replace("FORM", form);
            innerhtml += text;
            var form = "<b>Beredningsform</b><br>" + form;
            currentData[i] = {"name":"<h3>"+prep[0]+"<h3>", "form":form, "ic":ic,
                                "ooc":ooc, "forbud":forbud, "dispens":dispens,
                                "ovrigt":ovrigt, "klass":klass};
            showInfo(i);
            break       
        }
    }
    return results;
}

function searchData()
{
    var string = document.getElementById("search").value;
    var format = '<li class="Lakemedel"><div id="ID" onclick="showInfo(this.id);" class="Produktnamn">NAMEFORM</div></li>';
    currentData = {};
    if(string.length > 0)
    {
        document.getElementById('result').innerHTML = "";
        currentData = {};
        if(isNum(string) && string.length == 13)
        {
            var results = searchEan(string, format);
        }
        else
        {
            var results = searchName(string, format);
        }
        if(results == 0)
        {
            document.getElementById('result').innerHTML = "<p>Hittade inget resultat för din sökning!</p>";
        }
    }
    else
    {
        startApp();
    }
}

function update()
{
    var failMsg = "Röd gröna listan kräver en uppdatering, se till att du är ansluten till internet och starta om appen!";
    req = new XMLHttpRequest();
    var url = "http://fecabook.hol.es/databas.txt";
    req.open("GET", url, false);
    req.overrideMimeType('text/xml; charset=iso-8859-1');
    try
    {
        req.send();
        if(req.status == 200)
        {
            var text = req.responseText;
            localStorage.setItem("drugs", LZString.compress(text));
            drugs = text.split(";;");
        }
    }
    catch(e){console.log(e);}
}

function loadData()
{
    document.getElementById("loader").style.display = "block";
    drugs = LZString.decompress(localStorage.getItem("drugs")).split(";;");
    document.getElementById("loader").style.display = "none";
    startApp();
}

function checkUpdate()
{
    /* If user is starting app for first time*/
    if(document.getElementById("anslut") != null)
    {
        document.getElementById("anslut").innerHTML = "Ansluter..";
    }
    try
    {
        /*Chekca om internet anslutning existerar*/
        var netStatus = checkNetwork();
        if(netStatus)
        {
            var status = localStorage.getItem("drugs");
            if(status == null)
            {
                update();
            }
            else
            {
                loadData();
            }
        }
        else
        {
            loadData();
        }
    }
    catch(e)
    {
        var status = localStorage.getItem("drugs");
        if(status == null)
        {
            update();
        }
        else /*Offline but got all data*/
        {
            loadData();
        }
    }
}

var url = "http://fecabook.hol.es/handlefile.php?filename=";
checkUpdate();
startApp();
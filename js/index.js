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
function Alert(msg)
{
    document.getElementById("Alert").style.opacity = 1;
    document.getElementById("AlertInfo").innerHTML = msg;
}
function closeAlert()
{
    document.getElementById("Alert").style.opacity = 0;
}

function scan()
{
    cordova.plugins.barcodeScanner.scan(
    function(result)
    {
        document.getElementById("search").value = result.text;
        displayData();
    },
    function(error)
    {
        Alert(error);
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
    closeAlert();
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

function closePopup()
{
    var el = document.getElementById("popupInfo");
    el.className = "animated slideOutRight";

    el = document.getElementById("backButton");
    el.className = "animated rotateOut";
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

function showInfo(id)
{
    closeAlert();
    var ids = ["forbud", "dispens", "ovrigt", "name", "form", "ic", "ooc", "klass"];
    var el = document.getElementById("popupInfo");
    el.style.display = "block";
    el.className = "animated slideInRight";
    el = document.getElementById("backButton");
    el.className = "animated rotateIn";
    for(var i = 0; i < ids.length; i++)
    {
        document.getElementById(ids[i]).innerHTML = currentData[id][ids[i]];
    }
}

function isNum(string)
{
    return string.match(/^[0-9]+$/) != null;
}
function displayData()
{
    closeAlert();
    var results = 0;
    var string = document.getElementById("search").value;
    var format = '<li class="Lakemedel"><div id="ID" onclick="showInfo(this.id);" class="Produktnamn">NAMEFORM</div></li>';
    var innerhtml = "";
    if(string.length > 0)
    {
        document.getElementById('result').innerHTML = "";
        currentData = {};
        if(isNum(string))
        {
            for(var i = 0; i < drugs.length; i++)
            {
                var prep = drugs[i].split(";");
                var ean = prep[7];
                if(results > 10){break;}
                if(ean == string)
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
        }
        else
        {
            for(var i = 0; i < drugs.length; i++)
            {
                var prep = drugs[i].split(";");
                var name = prep[0];
                if(results > 10){break;}
                if (name.toLowerCase().indexOf(string.toLowerCase())+1 > 0)
                {
                    results += 1;
                    console.log("correct");
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
        }

        if(results == 0)
        {
            innerhtml = "<p>Hittade inget resultat för din sökning på <b>" + string + "</b>!";
        }
        document.getElementById('result').innerHTML = innerhtml;
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
            drugs = text.split(";;")
        }
    }
    catch(e){alert(e); Alert(failMsg)}
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
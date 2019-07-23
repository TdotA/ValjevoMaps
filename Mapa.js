////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
//radi pretraga i postavljanje markera na mapu, izbor i otkazivanje istog(iz nekog razloga jednom kada je nesto izabrano njegov marker ostaje trajno na mapi) treba da se odradi filter i sort/
//////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Ne brisati ovo
 *
 * @param  {H.Map} map      A HERE Map instance within the application
 */
 //fiksira lokaciju na Valjevo
function moveMapToValjevo(map){
  map.setCenter({lat:44.272943, lng:19.890280});
  map.setZoom(13);
}
//cini mapu interaktivnom 
function setInteractive(map){
  var provider = map.getBaseLayer().getProvider();
  var style = provider.getStyle();

  var changeListener = (evt) => {
    if (style.getState() === H.map.Style.State.READY) {
      style.removeEventListener('change', changeListener);
      style.setInteractive(['places', 'places.populated-places'], true);
      provider.addEventListener('tap', onTap);
    }
  };
  style.addEventListener('change', changeListener);
}


//ogranicava da ne moze da se izadje iz valjeva
function restrictMap(map){
  var bounds = new H.geo.Rect(44.294460, 19.838096,44.245914, 19.958675);
  map.getViewModel().addEventListener('sync', function() {
    var center = map.getCenter();

    if (!bounds.containsPoint(center)) {
      if (center.lat > bounds.getTop()) {
        center.lat = bounds.getTop();
      } else if (center.lat < bounds.getBottom()) {
        center.lat = bounds.getBottom();
      }
      if (center.lng < bounds.getLeft()) {
        center.lng = bounds.getLeft();
      } else if (center.lng > bounds.getRight()) {
        center.lng = bounds.getRight();
      }
      map.setCenter(center);
    }
  });
  //Prikaz kockice oko ogranicenja, iskljuceno
  map.addObject(new H.map.Rect(bounds, {
    style: {
        fillColor: 'rgba(0, 0, 0, 0)',
        strokeColor: 'rgba(0, 0, 0, 0.6)',
        lineWidth: 0
      }
    }
  ));
}
//pokusaj pretrage neke znamenitosti, iskljuceno
function landmarkGeocode(platform) {
  var geocoder = platform.getGeocodingService(),
    landmarkGeocodingParameters = {
      searchtext: 'Suva Cesma',
      jsonattributes : 1
    };
  geocoder.search(
    landmarkGeocodingParameters,
    onSuccess,
    onError
  );
}
//Kad uspe pretraga da doda lokacije na mapu, vezano za pretragu znamenitosti, iskljuceno
function onSuccess(result) {
  var locations = result.response.view[0].result;
  addLocationsToMap(locations);
  addLocationsToPanel(locations);
}
function onError(error) {
  alert('Can\'t reach the remote server');
}
var locationsContainer = document.getElementById('panel');

//za otvaranje baloncica pritiskom na lokacije
function openBubble(position, text){
 if(!bubble){
    bubble =  new H.ui.InfoBubble(
      position,
      {content: text});
    ui.addBubble(bubble);
  } else {
    bubble.setPosition(position);
    bubble.setContent(text);
    bubble.open();
  }
}

//dodavanje nadjenih lokacija na panel, vezano za znamenitosti, iskljuceno
function addLocationsToPanel(locations){

  var nodeOL = document.createElement('ul'),
    i;

  nodeOL.style.fontSize = 'small';
  nodeOL.style.marginLeft ='5%';
  nodeOL.style.marginRight ='5%';


   for (i = 0;  i < locations.length; i += 1) {
     var li = document.createElement('li'),
        divLabel = document.createElement('div'),
        landmark = locations[i].place.locations[0],
        content =  '' + landmark.name  + '';
        position = {
          lat: locations[i].place.locations[0].displayPosition.latitude,
          lng: locations[i].place.locations[0].displayPosition.longitude
        };

      content += 'houseNumber: ' + landmark.address.houseNumber + '';
      content += 'street: '  + landmark.address.street + '';
      content += 'district: '  + landmark.address.district + '';
      content += 'city: ' + landmark.address.city + '';
      content += 'postalCode: ' + landmark.address.postalCode + '';
      content += 'county: ' + landmark.address.county + '';
      content += 'country: ' + landmark.address.country + '';
      content += 'position: ' +
        Math.abs(position.lat.toFixed(4)) + ((position.lat > 0) ? 'N' : 'S') +
        ' ' + Math.abs(position.lng.toFixed(4)) + ((position.lng > 0) ? 'E' : 'W');

      divLabel.innerHTML = content;
      li.appendChild(divLabel);

      nodeOL.appendChild(li);
  }

  locationsContainer.appendChild(nodeOL);
}
//dodavanje nadjenih lokacija na mapu, vevzano za znamenitosti, iskljuceno
function addLocationsToMap(locations){
  var group = new  H.map.Group(),
    position,
    i;

  for (i = 0;  i < locations.length; i += 1) {
    position = {
      lat: locations[i].place.locations[0].displayPosition.latitude,
      lng: locations[i].place.locations[0].displayPosition.longitude
    };
    marker = new H.map.Marker(position);
    marker.label = locations[i].place.locations[0].name;
    group.addObject(marker);
  }

  group.addEventListener('tap', function (evt) {
    map.setCenter(evt.target.getPosition());
    openBubble(
       evt.target.getPosition(), evt.target.label);
  }, false);
  map.addObject(group);
  map.getViewModel().setLookAtData({
    bounds: group.getBoundingBox()
  });
  map.setZoom(Math.min(map.getZoom(), 16));
}

var ime;
var bubble;
var id;
function kanselujDetalje(){
mrkr.setGeometry({lat:0.0,lng:0.0});
m.innerHTML='';
}

//funkcija koju drzi svaki tekst u listi nadjenih lokacija
var m=document.getElementById('panel');
function detaljnije(id){
var upitdetalji = new XMLHttpRequest();
upitdetalji.open('GET',objrisponz.results[id].href,false);
upitdetalji.send();
detrisp=upitdetalji.responseText;
detrisponz=JSON.parse(detrisp);
udaljenostOdHardverLaba=measure(objrisponz.results[id].position[0],objrisponz.results[id].position[1],koordinateKanc[0],koordinateKanc[1]);
m.innerHTML=detrisponz.name+"</br>Adresa:";
m.innerHTML+=detrisponz.location.address.text+"</br>\t"+detrisponz.location.address.city+"</br>Kontakt:"+detrisponz.contacts.phone[0].value+"</br>"+detrisponz.tags[0].id;
//id=-1;
//brisiSveMarkere(map);
/*
Ubaci ove gluposti u niz
*/
m.innerHTML+="</br><input type='button' onclick='kanselujDetalje()' style='color:white;background-color:red;' value='X'>";
m.innerHTML+="</br>Udaljenost:"+(Math.round(udaljenostOdHardverLaba*100)/100)+" metara";
dodajMarkere(map,id);
if(nevinost)bojiMarker(id);
else pomeriMarker(id);
nevinost=false;
}
function pomeriMarker(id){

mlat=niz[id][0];
mlng=niz[id][1];
mrkr.setGeometry({lat: parseFloat(mlat),lng: parseFloat(mlng)});
}


var mrkr;
var icon;
var svgMarkup;
function bojiMarker(id){
svgMarkup = '<svg width="75" height="75" ' +
    'xmlns="http://www.w3.org/2000/svg">' +
    '<rect stroke="red" fill="red" x="1" y="1" width="75" ' +
    'height="75" /><text x="40" y="60" font-size="50pt" ' +
    'font-family="Arial" text-anchor="middle" ' +
    'fill="white">O</text></svg>';
mlat=niz[id][0];
mlng=niz[id][1];
    icon = new H.map.Icon(svgMarkup),
    coords = {lat: mlat, lng: mlng},
    mrkr= new H.map.Marker(coords, {icon: icon});
map.addObject(mrkr);
//markeri[id].setVisibility(false);
}
var brStavki;
var cbkid;
var nevinost=true;
var objrisponz;
var niz=[0,0];
var marker;
var mlat;
var mlng;
var markeri=[];
var prviPut=true;
var kat=document.getElementById('kateg');
var podkat=document.getElementById('podkateg');
var nizElemenata=[];
var cbniz=[];
var udaljenostOdHardverLaba;
//dodaje markere na mapu
function dodajMarkere(map,id){
//id sluzi da identifikuje koji se marker crta, ako je -1 onda crta sve
if(id==(-1)){
var e=0;
for(i=0;i<niz.length;i++){
if(niz[i]!=undefined){
mlat=niz[i][0];
mlng=niz[i][1];
marker = new H.map.Marker({lat:parseFloat(mlat), lng:parseFloat(mlng)});
markeri[i]=marker;
}
else markeri[i]="";
}
for(i=0;i<markeri.length;i++){
map.addObject(markeri[i]);
}
}
else{
mlat=niz[id][0];
mlng=niz[id][1];
marker = new H.map.Marker({lat:parseFloat(mlat), lng:parseFloat(mlng)});
map.addObject(marker);
}
}
var odabraneKategorije=[""];
var odabranKategorijaS;
function dodajKat(id){
oKS=document.getElementById('cbk'+id).innerHTML;
if(odabraneKategorije.includes(oKS)){
var tempi=odabraneKategorije.indexOf(oKS);
odabraneKategorije.splice(tempi,1);
}
else odabraneKategorije.push(oKS);
izbaciNeodabraneKat(odabraneKategorije);
}


function izbaciNeodabraneKat(oK){
for(var i=0;objrisponz[i]!=undefined;i++){
var tempx=new XMLHttpRequest();
tempx.open('GET',objrisponz.results[i].href,false);
tempx.send();
temprisp=tempx.responseText;
tempobjrisp=JSON.parse(temprisp);
//if(!oK.includes()){document.getElementById('li'+i).innerHTML='';}
}
}


function measure(lat1, lon1, lat2, lon2){  // generally used geo measurement function
    var R = 6378.137; // Radius of earth in KM
    var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
    var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d * 1000; // meters
}

//pretrazuje na mapi iz onog tekstboxa koristeci autosugggest
function pretrazi(){
document.getElementById('sort').innerHTML='';
brStavki=0;
cbkid=0;
kat.innerHTML='';
podkat.innerHTML='';
if(m.innerHTML!="")kanselujDetalje();
var termin=document.getElementById('poljeZaPretragu').value;

var xhttp = new XMLHttpRequest();
xhttp.open('GET','https://places.cit.api.here.com/places/v1/autosuggest?app_id=OdV87gpWUujy3gRvE4mc&app_code=FEMwH70AZ5-W5wZuQDtkcw&in=44.2725,19.8928;r=4000&q='+termin+'&pretty',false);
xhttp.send();
risponz=xhttp.responseText;
objrisponz=JSON.parse(risponz);
var i=0;
document.getElementById('list').innerHTML='';

while(objrisponz.results[i]!=undefined){
niz[i]=objrisponz.results[i].position;
elem=document.createElement("p");
elem.id=objrisponz.results[i].categoryTitle;
elem.setAttribute('onclick','detaljnije('+i+')');
elem.innerHTML=objrisponz.results[i].title+'</br>';
brStavki++;
document.getElementById('list').appendChild(elem);
//-------kreiranje checkboxa za filtriranje
if(objrisponz.results[i].href!=undefined){
var tempx=new XMLHttpRequest();
tempx.open('GET',objrisponz.results[i].href,false);
tempx.send();
temprisp=tempx.responseText;
tempobjrisp=JSON.parse(temprisp);
if(tempobjrisp!=undefined){
if(kat.innerHTML.indexOf(tempobjrisp.categories[0].title)<0){
kat.innerHTML+="<input type='checkbox' id='cbk"+cbkid+"' onchange='dodajKat("+(cbkid++)+")'>"+tempobjrisp.categories[0].title+"</br>"
}

}
if(tempobjrisp.tags!=undefined){
if(podkat.innerHTML.indexOf(tempobjrisp.tags[0].title)<0){
podkat.innerHTML+="<input type='checkbox'>"+tempobjrisp.tags[0].title+"</br>"
}
}

}
//--------
i++;
}
if(!prviPut){
//id=-1;

brisiSveMarkere(map);
for(i=i;i<niz.length;i++)niz[i]=["0.0","0.0"];
}
dodajMarkere(map,-1);
prviPut=false;
}
//uklanja markere
function brisiSveMarkere(map){
for(i=0;i<markeri.length;i++){
map.removeObject(markeri[i]);
}
}
//trazi index zareza u stringu
function indexZareza(s){
return s.indexOf(',');
}
//neka njihova racunanja, jebem li ga
var platform = new H.service.Platform({
  apikey: '4FAcMlMtsVwOr6IWBf8bw1ygbJ0Xw9C1WA51FWlVSnE'
});
var pixelRatio = window.devicePixelRatio || 1;
var defaultLayers = platform.createDefaultLayers({
  tileSize: pixelRatio === 1 ? 256 : 512,
  ppi: pixelRatio === 1 ? undefined : 320
});

//kreira mapu iznad valjeva
var map = new H.Map(document.getElementById('map'),
  defaultLayers.vector.normal.map,{
  center: {lat:44.272631, lng: 19.891009},
  zoom: 4,
  pixelRatio:pixelRatio
});

var bubble;
/**
 * @param {H.mapevents.Event} e The event object
 */
 //pravi baloncice na klik i daje karakteristike
function onTap(evt) {
  // calculate infobubble position from the cursor screen coordinates
  let position = map.screenToGeo(
    evt.currentPointer.viewportX,
    evt.currentPointer.viewportY
  );
  // read the properties associated with the map feature that triggered the event
  let props = evt.target.getData().properties;

  // create a content for the infobubble
  let content = 'Ovo je ' + props.kind + ' ' + (props.kind_detail || '') +    (props.population ? 'populacija: ' + props.population : '') +   'lokalno ime je ' + props['name'] + '';

  // Create a bubble, if not created yet
  if (!bubble) {
    bubble = new H.ui.InfoBubble(position, {
      content: content });
    ui.addBubble(bubble);
  } else {
    // Reuse existing bubble object
    bubble.setPosition(position);
    bubble.setContent(content);
    bubble.open();
  }
}


// diktira da mapa zauzima ceo kontejner koji joj je dat
window.addEventListener('resize', () => map.getViewPort().resize());

//daje mapi glavni event citac
var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

// kreira interfejs na mapi(za zumiranje dugmici,promena stila i to)
var ui = H.ui.UI.createDefault(map, defaultLayers);

// funkcija koja se zove kad se ucita prozor
window.onload = function () {
  moveMapToValjevo(map);
  document.getElementsByTagName('iframe').height=200;
  restrictMap(map);  
  setInteractive(map);  
}
var koordinateKanc=[44.246389, 19.930000];
/*


*/
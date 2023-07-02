const carCanvas = document.getElementById("carCanvas");
carCanvas.style.display="none";
carCanvas.width = 400;
const carCtx = carCanvas.getContext("2d");
let validated=false;
let num_traffic=30;
let N = 1000;//training set size
let numLanes=3;
let layers=4;
let layerCounts=[6,10,10];
let sensors=5;
let trafficColor=getRandomColor();
layerCounts=[...layerCounts,4];//adding the output layer which decides on what direction that car should move

let road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);
let animationFrame=null;
let Type = null;
let dummy=null;
let hiddenLayers=null;
let traffic=[];


const reconfigure=()=>{
    let temp=document.getElementById("trafficCount").value;
    if(temp)num_traffic=parseInt(temp);
    temp=document.getElementById("laneCount").value;
    if(temp)numLanes=temp;

    road = new Road(carCanvas.width / 2, carCanvas.width * 0.9,numLanes);
    setType(Type);
}

const experiment=()=>{
    validated=true;
    
    let temp=document.getElementById("sensorCount").value;
    if(temp)sensors=temp;


    temp=parseInt(document.getElementById("trainingsetCount").value);
    if(temp)N=temp ;
    else temp=1000;

    hiddenLayers=parseInt(document.getElementById("numLayers").value);

    try {
        dummy=[];
        let text_input=document.getElementById("layer").value;
        dummy=text_input.split(",").map(function(value) {
            return parseInt(value.trim());});

    } catch (error) {
        alert("invalid entry inside Count of Nodes")
        console.log(error);
        dummy=null;
    }

    if(isNaN(dummy)&&(!hiddenLayers)){
        validated=true;
    }
    else if(isNaN(hiddenLayers)&&dummy){
        alert("number of hidden layers has not been specified");
        validated=false;    
    }
    else if(hiddenLayers && !dummy){
        alert("node values are missing");
        validated=false;
    }
    else if(dummy.length!==parseInt(hiddenLayers)){
        alert("mismatch in length of the hidden layers and the corresponding nodes");
        validated=false;
    }

    if(!isNaN(dummy))layerCounts=[...dummy,4] ;
    else layerCounts=[6,10,10,4];

    if(validated)setType("AI");
}


function generateCars(N, type) {
    const cars = [];
    cancelAnimationFrame(animationFrame);
    if(type!=="AI")N=1;
        for (let i = 1; i <= N; i++) {
        const car=new Car(road.getLaneCenter(1), 100, 30, 50, layerCounts,controlType=type,maxSpeed=3,sensors);
        cars.push(car);
        }
    return cars;
}

function setType(type) {

    Type = type;
    if(type!=="AI")document.getElementById("right-middle-div").style.display="none"
    else document.getElementById("right-middle-div").style.display="block";
    carCanvas.style.display="block";
    document.getElementsByClassName("dummy-box")[0].style.display="block";
    cars = generateCars(N, type);
    trafficColor=getRandomColor();
    traffic=createRandomCars(road,num_traffic,3);

    animate();
}



function createRandomCars(road,num=10,no_lanes=3){
    const cars=[];

    let i=0;
    while(i<num){
        const rand_x=Math.floor(Math.random()*10)%no_lanes;
        const x=road.getLaneCenter(rand_x);
        const y=Math.random()*100*num_traffic;
        const car=new Car(road.getLaneCenter(rand_x), -y, 30, 50, [],controlType="DUMMY",Math.random()*2,sensors);
        cars.push(car);
        i++;
    }
    return cars;
}


function animate(){
    for(let i=0;i<traffic.length;i++){
        traffic[i].update(road.borders,[]);
    }
    for(let i=0;i<cars.length;i++){

        cars[i].update(road.borders,traffic);
    }
     bestCar=cars.find(
        c=>c.y==Math.min(...cars.map(c=>c.y))
    );
    carCanvas.height=window.innerHeight;

    carCtx.save();
    carCtx.translate(0,-bestCar.y+carCanvas.height*0.7);
    road.draw(carCtx);
    for(let i=0;i<traffic.length;i++){
        traffic[i].draw(carCtx,trafficColor);
    }
    carCtx.globalAlpha=0.2;
    for(let i=0;i<cars.length;i++){

        cars[i].draw(carCtx,"blue");
    }
    carCtx.globalAlpha=1;
    bestCar.draw(carCtx,"blue",true)
    carCtx.restore();

    animationFrame=requestAnimationFrame(animate);
}

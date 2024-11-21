const workspaceCanvas = <HTMLCanvasElement>document.getElementById("canvas");
const workspaceContext = <CanvasRenderingContext2D>workspaceCanvas.getContext("2d");

const spikes16Canvas = <HTMLCanvasElement>document.getElementById("spikes16Canvas");
const spikes16Context = <CanvasRenderingContext2D>spikes16Canvas.getContext("2d");
const spikes32Canvas = <HTMLCanvasElement>document.getElementById("spikes32Canvas");
const spikes32Context = <CanvasRenderingContext2D>spikes32Canvas.getContext("2d");

workspaceCanvas.addEventListener("contextmenu", e => e.preventDefault());

function LoadImage(filename: string){
    let image = new Image();
    image.src = `${filename}`;
    return image;
}
let spikes16image = LoadImage("spikes16.png");
let spikes32image = LoadImage("spikes32.png");
let refImage = LoadImage("level_001_foreground.png")

interface Vector2D{
    x: number;
    y: number;
}

workspaceContext.fillStyle = "white";
workspaceContext.fillRect(0,0,800,608);
spikes32Context.fillStyle = "white";
spikes32Context.fillRect(0,0,224,32);

interface GridSize{
    width: number;
    height: number;
}

interface rgb{
    red: number;
    green: number;
    blue: number;
}

interface Rectangle{
    x: number;
    y: number;
    width: number;
    height: number;
}

let whereToPlace: Vector2D = {x: 50,y: 50};
let currentColour: rgb = {red: 111,green: 123,blue:194};
let clientRects = workspaceCanvas.getClientRects();
let currentTileGridSize: GridSize = {width: 32, height: 32};
let blockRect: Rectangle;
let snapToGrid: boolean = true;
let tile16BlockArray: number[][] = Array.from({ length: 38 }, () => new Array(50).fill(0));
let tile32BlockArray: number[][] = Array.from({ length: 19 }, () => new Array(25).fill(0));
let collisionBlockArray: number[][] = Array.from({ length: 19 }, () => new Array(25).fill(0));
let worldObjects: number[][] = Array.from({ length: 19 }, () => new Array(25).fill(0));
let drawMode: boolean = false;
let collisionIndex: number = 1;
let clientX: number;
let clientY: number;
let mouseButton: number;
let levelNumber: number = 3;

function drawColShapeCanvas(){
    spikes16Context.drawImage(spikes16image,0,0);
    spikes32Context.drawImage(spikes32image,0,0);
}

let spriteSheet16Offset = 10

spikes16Canvas.addEventListener("mouseup", (event) => {
    currentTileGridSize = {width: 16, height: 16};
    clientRects = spikes16Canvas.getClientRects();
    collisionIndex = Math.floor((event.clientX - clientRects[0].left) / 16 + spriteSheet16Offset);
})

spikes32Canvas.addEventListener("mouseup", (event) => {
    currentTileGridSize = {width: 32, height: 32};
    clientRects = spikes32Canvas.getClientRects();
    collisionIndex = Math.floor((event.clientX - clientRects[0].left) / 32);
})

workspaceCanvas.addEventListener("mouseup", (event) => {
    mouseButton = event.button;
    drawMode = false;
    drawLoop();    
})

workspaceCanvas.addEventListener("mousedown", (event) => {
    mouseButton = event.button;
    drawMode = true;
    drawLoop();    
})

workspaceCanvas.addEventListener("mousemove", (event) => {
    clientX = event.clientX;
    clientY = event.clientY;
})

workspaceCanvas.addEventListener("mouseleave", (event) => {
    drawMode = false;
})

let clipboardString: string = "";

document.addEventListener("keypress", (event) => {
    if (event.key === 'c'){
        clipboardString = "";
        printTile16AsC();
        clipboardString = clipboardString.concat("\n")
        clipboardString = clipboardString.concat("\t")
        printTile32AsC();
        clipboardString = clipboardString.concat("\n")
        clipboardString = clipboardString.concat("\t")
        printColMapAsC();
        clipboardString = clipboardString.concat("\n")
        clipboardString = clipboardString.concat("\t")
        printWorldObjectsMapAsC();
        copyToClipboard(clipboardString);
    } 
})

function drawLoop(){
    if (drawMode){
        drawColShapeCanvas();
        clientRects = workspaceCanvas.getClientRects();
        whereToPlace.x = clientX - clientRects[0].left;
        whereToPlace.y = clientY - clientRects[0].top;
        if (snapToGrid){
        whereToPlace.x = Math.floor(whereToPlace.x / currentTileGridSize.width) * currentTileGridSize.width;
        whereToPlace.y = Math.floor(whereToPlace.y / currentTileGridSize.height) * currentTileGridSize.height;
        }
        switch (collisionIndex) {
            case 1:
                if (mouseButton === 0){
                    collisionBlockArray[Math.floor(whereToPlace.y / currentTileGridSize.height)][Math.floor(whereToPlace.x / currentTileGridSize.width)] = collisionIndex;
                }
                else if(mouseButton === 2){
                    collisionBlockArray[Math.floor(whereToPlace.y / currentTileGridSize.height)][Math.floor(whereToPlace.x / currentTileGridSize.width)] = 0;
                }           
                break;
            case 2: case 3: case 4: case 5:
                if (mouseButton === 0){
                    tile32BlockArray[Math.floor(whereToPlace.y / currentTileGridSize.height)][Math.floor(whereToPlace.x / currentTileGridSize.width)] = collisionIndex;
                }
                else if(mouseButton === 2){
                    tile32BlockArray[Math.floor(whereToPlace.y / currentTileGridSize.height)][Math.floor(whereToPlace.x / currentTileGridSize.width)] = 0;
                }
                break;
            case 6: case 7: case 8: case 9:
                if (mouseButton === 0){
                    worldObjects[Math.floor(whereToPlace.y / currentTileGridSize.height)][Math.floor(whereToPlace.x / currentTileGridSize.width)] = collisionIndex;
                }
                else if(mouseButton === 2){
                    worldObjects[Math.floor(whereToPlace.y / currentTileGridSize.height)][Math.floor(whereToPlace.x / currentTileGridSize.width)] = 0;
                }
                break;
            case spriteSheet16Offset: case spriteSheet16Offset + 1: case spriteSheet16Offset + 2: case spriteSheet16Offset + 3:
                if (mouseButton === 0){
                    tile16BlockArray[Math.floor(whereToPlace.y / currentTileGridSize.height)][Math.floor(whereToPlace.x / currentTileGridSize.width)] = collisionIndex;
                }
                else if(mouseButton === 2){
                    tile16BlockArray[Math.floor(whereToPlace.y / currentTileGridSize.height)][Math.floor(whereToPlace.x / currentTileGridSize.width)] = 0;
                }
                break;    
            default:
                break;
        }
        drawToWorkplace();
    requestAnimationFrame(drawLoop)
    }
}

function drawToWorkplace(){
    workspaceContext.fillStyle = `gray`
    workspaceContext.fillRect(0, 0, 800, 608)
    //workspaceContext.drawImage(refImage,0,0);

    for (let y = 0; y < 19; y++) {
        for (let x = 0; x < 25; x++) {
            if (collisionBlockArray[y][x] === 1){
                workspaceContext.fillStyle = "black"
                workspaceContext.fillRect(x * 32, y * 32, 32, 32)
            }
        }
    }

    for (let y = 0; y < 19; y++) {
        for (let x = 0; x < 25; x++) {
            if (tile32BlockArray[y][x] === 2){
                workspaceContext.beginPath();
                workspaceContext.moveTo(x * 32 + 15,y * 32)
                workspaceContext.lineTo(x * 32, y * 32 + 31)
                workspaceContext.lineTo(x * 32 + 31,y * 32 + 31)
                workspaceContext.closePath();
                workspaceContext.stroke();
            }
            else if (tile32BlockArray[y][x] === 3){
                workspaceContext.beginPath();
                workspaceContext.moveTo(x * 32,y * 32);
                workspaceContext.lineTo(x * 32 + 31,y * 32);
                workspaceContext.lineTo(x * 32 + 16,y * 32 + 31);
                workspaceContext.closePath();
                workspaceContext.stroke();
            }
            else if (tile32BlockArray[y][x] === 4){
                workspaceContext.beginPath();
                workspaceContext.moveTo(x * 32 + 31,y * 32);
                workspaceContext.lineTo(x * 32 + 31,y * 32 + 31);
                workspaceContext.lineTo(x * 32,y * 32 + 16);
                workspaceContext.closePath();
                workspaceContext.stroke();
                //test = test.concat(`{{${x * 32 + 31},${y * 32}},{${x * 32 + 31},${y * 32 + 31}},{${x * 32},${y * 32 + 16}}},`);
                //count++;
            }
            else if (tile32BlockArray[y][x] === 5){
                workspaceContext.beginPath();
                workspaceContext.moveTo(x * 32,y * 32);
                workspaceContext.lineTo(x * 32 + 31,y * 32 + 15);
                workspaceContext.lineTo(x * 32,y * 32 + 31);
                workspaceContext.closePath();
                workspaceContext.stroke();
                //test = test.concat(`{{${x * 32},${y * 32}},{${x * 32 + 31},${y * 32 + 15}},{${x * 32},${y * 32 + 31}}},`);
                //count++;
            }
        }
    }

    for (let y = 0; y < 38; y++) {
        for (let x = 0; x < 50; x++) {
            if (tile16BlockArray[y][x] === spriteSheet16Offset) {
                workspaceContext.beginPath();
                workspaceContext.moveTo(x * 16 + 7, y * 16);
                workspaceContext.lineTo(x * 16, y * 16 + 15);
                workspaceContext.lineTo(x * 16 + 15, y * 16 + 15);
                workspaceContext.closePath();
                workspaceContext.stroke();
            }
            else if (tile16BlockArray[y][x] === spriteSheet16Offset + 1) {
                workspaceContext.beginPath();
                workspaceContext.moveTo(x * 16, y * 16);
                workspaceContext.lineTo(x * 16 + 15, y * 16);
                workspaceContext.lineTo(x * 16 + 8, y * 16 + 15);
                workspaceContext.closePath();
                workspaceContext.stroke();
            }
            else if (tile16BlockArray[y][x] === spriteSheet16Offset + 2) {
                workspaceContext.beginPath();
                workspaceContext.moveTo(x * 16 + 15, y * 16);
                workspaceContext.lineTo(x * 16 + 15, y * 16 + 15);
                workspaceContext.lineTo(x * 16, y * 16 + 8);
                workspaceContext.closePath();
                workspaceContext.stroke();
            }
            else if (tile16BlockArray[y][x] === spriteSheet16Offset + 3) {
                workspaceContext.beginPath();
                workspaceContext.moveTo(x * 16, y * 16);
                workspaceContext.lineTo(x * 16 + 15, y * 16 + 7);
                workspaceContext.lineTo(x * 16, y * 16 + 15);
                workspaceContext.closePath();
                workspaceContext.stroke();
            }
        }
    }

    for (let y = 0; y < 19; y++) {
        for (let x = 0; x < 25; x++) {
            if (worldObjects[y][x] === 6){
                workspaceContext.fillStyle = "yellow"
                workspaceContext.fillRect(x * 32, y * 32, 32, 32)
            }
            if (worldObjects[y][x] === 7){
                workspaceContext.fillStyle = "pink"
                workspaceContext.fillRect(x * 32, y * 32, 32, 32)
            }
            if (worldObjects[y][x] === 8){
                workspaceContext.fillStyle = "green"
                workspaceContext.fillRect(x * 32, y * 32, 32, 32)
            }
            if (worldObjects[y][x] === 9){
                workspaceContext.fillStyle = "rgba(0, 0, 255, 0.5)"
                workspaceContext.fillRect(x * 32, y * 32, 32, 32)
            }
        }
    }
}

function printTile16AsC(){
    let test: string = `spike16Triangles[${levelNumber}] = {`;
    let count: number = 0;
    for (let y = 0; y < 38; y++) {
        for (let x = 0; x < 50; x++) {
            if (tile16BlockArray[y][x] === spriteSheet16Offset){
                test = test.concat(`{{${x * 16 + 7},${y * 16}},{${x * 16},${y * 16 + 15}},{${x * 16 + 15},${y * 16 + 15}}},`);
                count++;
            }
            else if (tile16BlockArray[y][x] === spriteSheet16Offset + 1){
                test = test.concat(`{{${x * 16},${y * 16}},{${x * 16 + 15},${y * 16}},{${x * 16 + 8},${y * 16 + 15}}},`);
                count++;
            }
            else if (tile16BlockArray[y][x] === spriteSheet16Offset + 2){
                test = test.concat(`{{${x * 16 + 15},${y * 16}},{${x * 16 + 15},${y * 16 + 15}},{${x * 16},${y * 16 + 8}}},`);
                count++;
            }
            else if (tile16BlockArray[y][x] === spriteSheet16Offset + 3){
                test = test.concat(`{{${x * 16},${y * 16}},{${x * 16 + 15},${y * 16 + 7}},{${x * 16},${y * 16 + 15}}},`);
                count++;
            }
        }
    }
    test = test.slice(0,-1);
    test = test.concat("};")
    clipboardString = clipboardString.concat(test);    
}

function printTile32AsC(){
    let test: string = `spike32Triangles[${levelNumber}] = {`;
    let count: number = 0;
    for (let y = 0; y < 19; y++) {
        for (let x = 0; x < 25; x++) {
            if (tile32BlockArray[y][x] === 2){
                test = test.concat(`{{${x * 32 + 15},${y * 32}},{${x * 32},${y * 32 + 31}},{${x * 32 + 31},${y * 32 + 31}}},`);
                count++;
            }
            else if (tile32BlockArray[y][x] === 3){
                test = test.concat(`{{${x * 32},${y * 32}},{${x * 32 + 31},${y * 32}},{${x * 32 + 16},${y * 32 + 31}}},`);
                count++;
            }
            else if (tile32BlockArray[y][x] === 4){
                test = test.concat(`{{${x * 32 + 31},${y * 32}},{${x * 32 + 31},${y * 32 + 31}},{${x * 32},${y * 32 + 16}}},`);
                count++;
            }
            else if (tile32BlockArray[y][x] === 5){
                test = test.concat(`{{${x * 32},${y * 32}},{${x * 32 + 31},${y * 32 + 15}},{${x * 32},${y * 32 + 31}}},`);
                count++;
            }
        }
    }
    test = test.slice(0,-1);
    test = test.concat("};")
    clipboardString = clipboardString.concat(test);
}

function printColMapAsC(){
    let test: string = `collisionRectangles[${levelNumber}] = {`;
    let count: number = 0;
    for (let y = 0; y < 19; y++) {
        for (let x = 0; x < 25; x++) {
            if (collisionBlockArray[y][x] === 1){
                test = test.concat(`{${x * 32}, ${y * 32}, 32, 32},`);
                count++;
            }
        }
    }
    test = test.slice(0,-1);
    test = test.concat("};")
    clipboardString = clipboardString.concat(test);
}

function printWorldObjectsMapAsC(){
    let test: string = `worldObjects[${levelNumber}] = {`;
    let count: number = 0;
    for (let y = 0; y < 19; y++) {
        for (let x = 0; x < 25; x++) {
            if (worldObjects[y][x] === 6){
                test = test.concat(`{6,${x * 32}, ${y * 32}, 32, 32},`);
                count++;
            }
            if (worldObjects[y][x] === 7){
                test = test.concat(`{7,${x * 32}, ${y * 32}, 32, 32},`);
                count++;
            }
            if (worldObjects[y][x] === 8){
                test = test.concat(`{8,${x * 32}, ${y * 32}, 32, 32},`);
                count++;
            }
            if (worldObjects[y][x] === 9){
                test = test.concat(`{9,${x * 32}, ${y * 32}, 32, 32},`);
                count++;
            }
        }
    }
    test = test.slice(0,-1);
    test = test.concat("};")
    clipboardString = clipboardString.concat(test);
}

function saveArraysAsJSON() {
    const dataToSave = {
        tile16BlockArray: tile16BlockArray,
        tile32BlockArray: tile32BlockArray,
        collisionBlockArray: collisionBlockArray,
        worldObjects: worldObjects
    };
    const jsonString = JSON.stringify(dataToSave);
    const blob = new Blob([jsonString], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "arraysData.json";
    link.click();
    URL.revokeObjectURL(link.href);
}

function loadJSONFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e: ProgressEvent<FileReader>) {
        if (!e.target?.result) return;
        const loadedData = JSON.parse(e.target.result as string);
        tile16BlockArray = loadedData.tile16BlockArray;
        tile32BlockArray = loadedData.tile32BlockArray;
        collisionBlockArray = loadedData.collisionBlockArray;
        worldObjects = loadedData.worldObjects;
        drawToWorkplace();
    };
    reader.readAsText(file);
}

const saveButton = document.createElement("button");
saveButton.textContent = "Save Level";
saveButton.onclick = saveArraysAsJSON;
const loadButton = document.createElement("input");
loadButton.type = "file";
loadButton.accept = "application/json";
loadButton.addEventListener("change", loadJSONFile);
document.body.appendChild(loadButton);
document.body.appendChild(saveButton);

function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(
      () => {
        console.log('Text copied to clipboard');
      },
      (err) => {
        console.error('Failed to copy text: ', err);
      }
    );
}
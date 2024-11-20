var canvas = /** @type {HTMLCanvasElement} */(null);
var ctx = /** @type {CanvasRenderingContext2D} */(null);
var requestAnimationFrameID = -1;

var time = 0,
    fps = 0,
    framesAcum = 0,
    acumDelta = 0;
var targetDT = 1/60; // 60 fps
var globalDT;

// Game variables
var gameState = {
    mainMenu: 0,
    gameScene: 1,
    gameOver: 2
}
var currentGameState;
var currentScene = null;

var assets = {
    
    player: {
        path: '../assets/sprites/PlayerSprites.png',
        img: null
    },

    building: {
        path: '../assets/sprites/Building.png',
        img: null
    },

    fireTruck: {
        path: '../assets/sprites/FireTruck.png',
        img: null
    },

    npcs: {
        path: '../assets/sprites/Npc_Sprites.png',
        img: null
    },

    enemy: {
        path: '../assets/sprites/FireEnemy.png',
        img: null
    },

    fireBall: {
        path: '../assets/sprites/Fire.png',
        img: null
    },

    ui_Utils: {
        path: '../assets/sprites/UI_utils.png',
        img: null
    },

    buildingsBKG: {
        path: '../assets/sprites/Background.png',
        img: null
    },

    cloudsBKG: {
        path: '../assets/sprites/Clouds.png',
        img: null
    }
}

// Sound
var volume;
var volumeValue;
var musicVolume;
var efectsvolume;

var sounds = {

    backgroundMusic: {
        sound: new Audio('../assets/sound/BackgroundMusic.mp3'),       
    },

    countSound: {
        sound: new Audio('../assets/sound/one_beep.mp3')
    },

    jump: {
        sound: new Audio('../assets/sound/jump.mp3')
    },

    trampoline: {
        sound: new Audio('../assets/sound/trampoline.mp3')
    },

    damage: {
        sound: new Audio('../assets/sound/damage.mp3')
    },

    saved: {
        sound: new Audio('../assets/sound/saved.mp3')
    },

    died: {
        sound: new Audio('../assets/sound/died.mp3')
    }
}

// Box2d library
var Box2D;


// Game functions
function LoadImages(assets, onloaded)
{
    let imagesToLoad = 0;

    if(Object.keys(assets).length === 0)
        onloaded();

    const onload = () => --imagesToLoad === 0 && onloaded();

    for(let asset in assets)
    {
        if(assets.hasOwnProperty(asset))
        {
            imagesToLoad++;

            const img = assets[asset].img = new Image;
            img.src = assets[asset].path;
            img.onload = onload;
        }
    }

    return assets;
}

function Init()
{
    // Load Box2D library
    if (!Box2D) Box2D = (typeof Box2D !== 'undefined' ? Box2D : null) || Module; 
    Box2D().then(function(r){
        Box2D = r;
        Module = Box2D;
    });

    // Asign canvas
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    volume = document.getElementById("volumeSlider");
    ctx.imageSmoothingEnabled = false;

    // Input Setup
    SetupKeyboardEvents();
    SetupMouseEvents();

    currentGameState = gameState.mainMenu;

    // Load assets
    LoadImages(assets, () => {
        MainMenuSetup(() => {
            ChangeScene(gameState.gameScene);

            Start();
            Loop();
        });
    });
}

function Start()
{
    volumeValue = volume.value;
    musicVolume = volumeValue * 0.001;
    efectsvolume = volumeValue * 0.01;

    console.log(volume.value);

    if(currentScene)
        currentScene.Start();
}

function Loop()
{
    requestAnimationFrameID = requestAnimationFrame(Loop);

    // compute FPS
    let now = performance.now();

    let deltaTime = (now - time) / 1000;
    globalDT = deltaTime;

    time = now;

    framesAcum++;
    acumDelta += deltaTime;

    if (acumDelta >= 1) {
        fps = framesAcum;
        framesAcum = 0;
        acumDelta -= 1;
    }

    if (deltaTime > 1000)
        return;


    // Game logic 
    Update(deltaTime);

    // Draw the game 
    Draw(ctx);
}

function Update(deltaTime)
{
    if(currentScene)
        currentScene.Update(deltaTime);
}

function Draw(ctx)
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if(currentScene)
        currentScene.Draw(ctx);
}

function ChangeScene(nextScene)
{
    switch(nextScene)
    {
        case gameState.mainMenu:
            currentScene = null;
            cancelAnimationFrame(requestAnimationFrameID);
            currentGameState = gameState.mainMenu;
            ShowMainMenu();
            break;
        case gameState.gameScene:
            currentGameState = gameState.gameScene;
            currentScene = null;
            currentScene = new GameScene();
            break;
        case gameState.gameOver:
            currentScene = null;
            cancelAnimationFrame(requestAnimationFrameID);
            currentGameState = gameState.gameOver;            
            GameOverMenuSetup();
            HideGameOver();
            
    }
}

window.onload = Init;
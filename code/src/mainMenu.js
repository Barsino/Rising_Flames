
var mainMenu;
var startButton;
var optionsButton;
var creditsButton;
var laderboardButton;
var returnButton;
var highScoresTable;
var controls;
var gameOverDiv;
var nickSubmit;

function MainMenuSetup(onStart)
{
    mainMenu = document.getElementById("mainMenu");
    startButton = document.getElementById("menuStart");
    optionsButton = document.getElementById("menuOptions");
    creditsButton = document.getElementById("menuCredits");
    laderboardButton = document.getElementById("menuLeaderboard");
    returnButton = document.getElementById("return");
    controls = document.getElementById("controls");

    highScoresTable = document.getElementById("highScores");
    nickSubmit = document.getElementById("nickSubmit");

    gameOverDiv = document.getElementById("gameOver");

    // Set onclick event for the start button
    startButton.onclick = () => {
        // Slide up the main menu by adjusting its style
        mainMenu.setAttribute('style', 'top: -900px');

        // Check if onStart callback function is defined and call it
        if(typeof(onStart) !== 'undefined')
        {
            onStart();
        }
    }

    laderboardButton.onclick = () => {
        // Slide up the main menu by adjusting its style
        mainMenu.setAttribute('style', 'top: -900px');
        returnButton.setAttribute('style', 'display: block')

        gameOverDiv.setAttribute('style', 'display: block'); 
        nickSubmit.setAttribute('style', 'display: none'); 
    }

    returnButton.onclick = () => {

        mainMenu.setAttribute('style', 'top: 0px');
        returnButton.setAttribute('style', 'display: none')

        gameOverDiv.setAttribute('style', 'display: none'); 
        nickSubmit.setAttribute('style', 'display: block'); 

        controls.setAttribute('style', 'display: none')
    }

    optionsButton.onclick = () => {
        mainMenu.setAttribute('style', 'top: -900px');
        returnButton.setAttribute('style', 'display: block')

        controls.setAttribute('style', 'display: block')
    }
}

function ShowMainMenu()
{
    // Display the main menu by adjusting its style
    mainMenu.setAttribute('style', 'top: 0px');
}


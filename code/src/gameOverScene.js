
var gameOverDiv;
var submit;

function GameOverMenuSetup()
{
    gameOverDiv = document.getElementById("gameOver");
    submit = document.getElementById("submit");

    gameOverDiv.setAttribute('style', 'display: block'); 
}

function HideGameOver()
{
    submit.onclick = () => {
        gameOverDiv.setAttribute('style', 'display: none'); 
        ShowMainMenu();
        
    }
}


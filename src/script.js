const gameNode = document.querySelector('.game');
const containerNode = document.querySelector(".fifteen");
const itemNodes = Array.from(containerNode.querySelectorAll('button'));
const countItems = 16;

let pressingCount = 0;

if(itemNodes.length !== 16){
    throw new Error(`Должно быть ровно ${countItems} items in HTML`)
};

/** 1. Position */
itemNodes[countItems - 1].style.display = 'none';

let matrix = getMatrix(
    itemNodes.map(
        (item) => Number(item.dataset.matrixId)
    ));

setPositionItems(matrix);


/** 2. Shuffle */
const maxShuffleCount = 100;
let timer;
let shuffleCount = 0;
let shuffled = false;
const shuffledClassName = 'gameShuffle';

document.querySelector('.replace-btn').addEventListener('click', () => {
    // 1. randomSwap
    pressingCount = 0;
    randomSwap(matrix);
    setPositionItems(matrix);
    // 2. Вызывать randomSwap какое-то кол-во раз
    let shuffleCount = 0;
    shuffled = true;
    clearInterval(timer);
    gameNode.classList.add(shuffledClassName);

    timer = setInterval(() => {
        randomSwap(matrix);
        setPositionItems(matrix);

        shuffleCount += 1;

        if (shuffleCount >= maxShuffleCount){
            gameNode.classList.remove(shuffledClassName);
            shuffled = false;
            pressingCount = 0;
            pressingCountOutput(pressingCount);
            clearInterval(timer);
        }
    }, 75)
});

/** 3. Change position by click */
const blankNumber = 16;
containerNode.addEventListener('click', (event) => {
    
    const buttonNode = event.target.closest('button');
    if(!buttonNode || shuffled){
        return;
    }

    const buttonNumber = Number(buttonNode.dataset.matrixId);
    const buttonCoords = findCoordinatesByNumber(buttonNumber, matrix);
    const blankCoords = findCoordinatesByNumber(blankNumber, matrix);
    const isValid = isValidForSwap(buttonCoords, blankCoords);
    
    if(isValid){
        swap(blankCoords, buttonCoords, matrix);
        setPositionItems(matrix);
    }
})

/** 4. Change position by keyboard */
window.addEventListener('keydown', (event) => {
    if(!event.key.includes('Arrow') || shuffled){
        return;
    }

    

    const blankCoords = findCoordinatesByNumber(blankNumber, matrix);
    const buttonCoords = {
        x: blankCoords.x,
        y: blankCoords.y,
    };

    const direction = event.key.split('Arrow')[1].toLowerCase();
    const maxIndexMatrix = matrix.length;

    switch(direction){
        case 'up':
            buttonCoords.x += 1;
            break;
        case 'down':
            buttonCoords.x -= 1;
            break;
        case 'left':
            buttonCoords.y += 1;
            break;
        case 'right':
            buttonCoords.y -= 1;
            break;
    }

    if (buttonCoords.y >= maxIndexMatrix || buttonCoords.y < 0 ||
        buttonCoords.x >= maxIndexMatrix || buttonCoords.x < 0){
            return;
        }
    swap(blankCoords, buttonCoords, matrix);
    setPositionItems(matrix);
})


/** 5. Show victory */




/** 
 * Helpers 
 * */

function getMatrix(arr){
    const matrix = [[], [], [], []];
    let x = 0;
    let y = 0;

    for( let i = 0; i < arr.length; i++){
        if(y >= 4){
            x++;
            y = 0;
        }

        matrix[x][y] = arr[i];
        y++;
    }

    return matrix;
}

function setPositionItems(matrix){
    for(let x = 0; x < matrix.length; x++){
        for(let y = 0; y < matrix[x].length; y++){
            const value = matrix[x][y];
            const node = itemNodes[value-1];
            setNodeStyles(node, x, y);
        }
    }
}

function setNodeStyles(node, x, y){
    const shiftPS = 100;
    node.style.transform = `translate3D(${y * shiftPS}%, ${x * shiftPS}%, 0)`;
}

function shuffleArray(arr){
    return arr
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map (({ value }) => value)
}

function findCoordinatesByNumber(number, matrix){
    for(let x = 0; x < matrix.length; x++){
        for(let y = 0; y < matrix[x].length; y++){
            if(matrix[x][y] === number){
                return {x, y};
            }
        }
    }
    return null;
}

function isValidForSwap(coords1, coords2){
    const diffX = Math.abs(coords1.x - coords2.x);
    const diffY = Math.abs(coords1.y - coords2.y);

    return (diffX === 1 || diffY === 1) && 
           (coords1.x === coords2.x || coords1.y === coords2.y);
}

function swap(coords1, coords2, matrix){
    const coords1Number = matrix[coords1.x][coords1.y];
    matrix[coords1.x][coords1.y] = matrix[coords2.x][coords2.y];
    matrix[coords2.x][coords2.y] = coords1Number;

    pressingCountOutput(++pressingCount);

    if(isWon(matrix)){
        pressingCount = 0;
        pressingCountOutput(pressingCount);
        addWonClass();
    }

}

const winFlatArr = new Array(16).fill(0).map((_item, i) => i + 1); 
function isWon(matrix){
    const flatMatrix = matrix.flat();
    for(let i = 0; i < winFlatArr.length; i++){
        if( flatMatrix[i] !== winFlatArr[i]){
            return false;
        }
    }

    return true;
}

const wonClass = 'fifteenWon';
function addWonClass(){
    setTimeout (() => {
        containerNode.classList.add(wonClass);
        setTimeout (() => {
            containerNode.classList.remove(wonClass);
            alert("Мои поздравления");
        }, 1000)
    }, 200);
}

let blockedCoords = null;
function randomSwap(matrix){
    const blankCoords = findCoordinatesByNumber(blankNumber, matrix);
    const validCoords = findValidCoords({
        blankCoords,
        matrix,
        blockedCoords,
    })
    //console.log(Math.floor(Math.random() * validCoords.length));
    const swapCoords = validCoords[
        Math.floor(Math.random() * validCoords.length)
    ];
    swap(blankCoords, swapCoords, matrix);
    blockedCoords = blankCoords;
}

function findValidCoords({ blankCoords, matrix, blockedCoords }){
    const validCoords = [];
    for(let x = 0; x < matrix.length; x++){
        for(let y = 0; y < matrix[x].length; y++){
            if(isValidForSwap({x, y}, blankCoords)){
                if(!blockedCoords || !(blockedCoords.x === x && blockedCoords.y === y)){
                    validCoords.push({x,y});
                }
            }
        }
    }

    return validCoords;
}

function pressingCountOutput(count){
    document.querySelector(".score__count").textContent = count;
}
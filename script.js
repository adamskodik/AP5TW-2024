const apiKey = 'X6R9EPF0KAGGLYU1';
const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

function searchStock() {
    const ticker = document.getElementById('tickerInput').value.toUpperCase();
    if (!ticker) return alert('Vložte ticker');

    console.log('Data pro ticker:', ticker);

    fetch(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            console.log('API:', data);

            if (!data.Symbol) {
                alert('Akci Nenalezena');
                return;
            }

            const peRatio = parseFloat(data.PERatio) || 0;
            const eps = parseFloat(data.EPS) || 0;
            const bookValue = parseFloat(data.BookValue) || 0;
            const dividendYield = parseFloat(data.DividendYield) || 0;

            const grahamNumber = eps && bookValue ? Math.sqrt(22.5 * eps * bookValue) : 0;
            const indexScore = calculateIndexScore(peRatio, grahamNumber, dividendYield);

            document.getElementById('companyName').innerText = data.Name || '?';
            document.getElementById('peRatio').innerText = peRatio || '?';
            document.getElementById('grahamNumber').innerText = grahamNumber ? grahamNumber.toFixed(2) : '?';
            updateIndexScore(indexScore);
        })
}

function calculateIndexScore(peRatio, grahamNumber, dividendYield) {
    let score = 100;

    if (peRatio > 25) score -= 20;
    else if (peRatio > 15) score -= 10;

    if (grahamNumber > 0 && peRatio > 0) {
        score += (grahamNumber / peRatio) > 1 ? 10 : -10;
    }

    if (dividendYield > 0) score += 10;

    return Math.max(score, 0);
}

function updateIndexScore(score) {
    const scoreElement = document.getElementById('indexScore');
    scoreElement.innerText = `${score}%`;

    if (score <= 35) {
        scoreElement.style.backgroundColor = '#FF4C4C';
        scoreElement.style.color = '#FFF';
    } else if (score <= 68) {
        scoreElement.style.backgroundColor = '#FFA500';
        scoreElement.style.color = '#FFF';
    } else if (score <= 89) {
        scoreElement.style.backgroundColor = '#90EE90';
        scoreElement.style.color = '#000';
    } else {
        scoreElement.style.backgroundColor = '#008000';
        scoreElement.style.color = '#FFF';
    }
}

function addToFavorites() {
    const ticker = document.getElementById('tickerInput').value.toUpperCase();
    if (!ticker || favorites.includes(ticker)) return;

    favorites.push(ticker);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderFavorites();
}

function removeFavorite(ticker) {
    const index = favorites.indexOf(ticker);
    if (index > -1) favorites.splice(index, 1);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderFavorites();
}

function renderFavorites() {
    const list = document.getElementById('favoritesList');
    list.innerHTML = '';
    favorites.forEach(ticker => {
        const li = document.createElement('li');
        li.innerHTML = `${ticker} <button onclick="removeFavorite('${ticker}')">Odebrat</button>`;
        list.appendChild(li);
    });
}

window.onload = renderFavorites;

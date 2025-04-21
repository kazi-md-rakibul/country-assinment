// DOM Elements
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const countriesContainer = document.getElementById('countries-container');
const loadingElement = document.getElementById('loading');
const modal = document.getElementById('country-modal');
const closeButton = document.querySelector('.close-button');
const modalBody = document.getElementById('modal-body');

// API URLs
const COUNTRIES_API_URL = 'https://restcountries.com/v3.1';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const WEATHER_API_KEY = '3c3246aa63553dcfd0e3bb13ccc77dc4'; // Get your own API key from OpenWeatherMap

// Event Listeners
window.addEventListener('load', () => {
    // Load random countries on page load
    fetchRandomCountries();
});

searchButton.addEventListener('click', () => {
    searchCountry();
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchCountry();
    }
});

closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Functions
function fetchRandomCountries() {
    showLoading();
    
    fetch(`${COUNTRIES_API_URL}/all`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch countries');
            }
            return response.json();
        })
        .then(countries => {
            const randomCountries = getRandomItems(countries, 8);
            countriesContainer.innerHTML = '';
            
            randomCountries.forEach(country => {
                displayCountryCard(country);
            });
        })
        .then(() => {
            hideLoading();
        });
}

function searchCountry() {
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        showError('Please enter a country name');
        return;
    }
    
    showLoading();
    
    fetch(`${COUNTRIES_API_URL}/name/${searchTerm}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Country not found');
            }
            return response.json();
        })
        .then(countries => {
            countriesContainer.innerHTML = '';
            
            countries.forEach(country => {
                displayCountryCard(country);
            });
        })
        .then(() => {
            hideLoading();
        });
}

function displayCountryCard(country) {
    const card = document.createElement('div');
    card.className = 'country-card';
    
    const languages = country.languages ? Object.values(country.languages) : [];
    const primaryLanguage = languages.length > 0 ? languages[0] : 'N/A';
    
    let currencyText = 'N/A';
    if (country.currencies) {
        const currencyCode = Object.keys(country.currencies)[0];
        if (currencyCode) {
            const currency = country.currencies[currencyCode];
            currencyText = `${currency.name} (${currency.symbol || currencyCode})`;
        }
    }
    
    if (country.capital && country.capital[0]) {
        fetch(`${WEATHER_API_URL}?q=${country.capital[0]},${country.cca2}&appid=${WEATHER_API_KEY}&units=metric`)
            .then(response => {
                if (!response.ok) {
                    return null;
                }
                return response.json();
            })
            .then(weatherData => {
                card.innerHTML = `
                    <div class="flag-container">
                        <img src="${country.flags.png}" alt="${country.name.common} flag">
                    </div>
                    <div class="country-info">
                        <h3>${country.name.common}</h3>
                        <p><i class="fas fa-globe"></i> ${country.region}, ${country.subregion || ''}</p>
                        <p><i class="fas fa-city"></i> Capital: ${country.capital?.[0] || 'N/A'}</p>
                        <p><i class="fas fa-users"></i> Population: ${formatNumber(country.population)}</p>
                        <p><i class="fas fa-language"></i> Language: ${primaryLanguage}</p>
                        <p><i class="fas fa-money-bill-wave"></i> Currency: ${currencyText}</p>
                        ${weatherData ? `
                            <div class="weather">
                                <img class="weather-icon" src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png" alt="Weather icon">
                                <div>
                                    <p>${Math.round(weatherData.main.temp)}°C</p>
                                    <p>${weatherData.weather[0].description}</p>
                                </div>
                            </div>
                        ` : ''}
                        <button class="details-btn" data-country='${JSON.stringify(country)}' data-weather='${weatherData ? JSON.stringify(weatherData) : ""}'>More Details</button>
                    </div>
                `;
                
                const detailsBtn = card.querySelector('.details-btn');
                detailsBtn.addEventListener('click', () => {
                    showCountryDetails(JSON.parse(detailsBtn.dataset.country), weatherData ? JSON.parse(detailsBtn.dataset.weather) : null);
                });
                
                countriesContainer.appendChild(card);
            });
    } else {
        card.innerHTML = `
            <div class="flag-container">
                <img src="${country.flags.png}" alt="${country.name.common} flag">
            </div>
            <div class="country-info">
                <h3>${country.name.common}</h3>
                <p><i class="fas fa-globe"></i> ${country.region}, ${country.subregion || ''}</p>
                <p><i class="fas fa-city"></i> Capital: ${country.capital?.[0] || 'N/A'}</p>
                <p><i class="fas fa-users"></i> Population: ${formatNumber(country.population)}</p>
                <p><i class="fas fa-language"></i> Language: ${primaryLanguage}</p>
                <p><i class="fas fa-money-bill-wave"></i> Currency: ${currencyText}</p>
                <button class="details-btn" data-country='${JSON.stringify(country)}'>More Details</button>
            </div>
        `;
        
        const detailsBtn = card.querySelector('.details-btn');
        detailsBtn.addEventListener('click', () => {
            showCountryDetails(JSON.parse(detailsBtn.dataset.country), null);
        });
        
        countriesContainer.appendChild(card);
    }
}

function showCountryDetails(country, weatherData) {
    const borders = country.borders ? country.borders.join(', ') : 'None';
    const languages = country.languages ? Object.values(country.languages).join(', ') : 'N/A';
    
    let currencies = 'N/A';
    if (country.currencies) {
        currencies = Object.values(country.currencies)
            .map(currency => `${currency.name} (${currency.symbol || ''})`)
            .join(', ');
    }
    
    modalBody.innerHTML = `
        <div class="country-details">
            <div>
                <img src="${country.flags.png}" alt="${country.name.common} flag" class="country-flag">
                <p><a href="${country.maps.googleMaps}" target="_blank" class="details-btn">View on Google Maps</a></p>
            </div>
            <div>
                <div class="detail-section">
                    <h3>${country.name.common} ${country.flag}</h3>
                    <p>Official Name: ${country.name.official}</p>
                </div>
                
                <div class="detail-section">
                    <h3>General Information</h3>
                    <div class="details-grid">
                        <div class="detail-item">
                            <span class="detail-label">Capital:</span>
                            <span>${country.capital?.[0] || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Population:</span>
                            <span>${formatNumber(country.population)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Region:</span>
                            <span>${country.region}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Subregion:</span>
                            <span>${country.subregion || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Languages:</span>
                            <span>${languages}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Currencies:</span>
                            <span>${currencies}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Area:</span>
                            <span>${formatNumber(country.area)} km²</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Timezone:</span>
                            <span>${country.timezones[0]}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Driving Side:</span>
                            <span>${country.car?.side || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Borders:</span>
                            <span>${borders}</span>
                        </div>
                    </div>
                </div>
                
                ${weatherData ? `
                    <div class="detail-section">
                        <h3>Weather in ${country.capital?.[0]}</h3>
                        <div class="weather-details">
                            <img src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png" alt="Weather icon">
                            <div class="weather-info">
                                <h4>${Math.round(weatherData.main.temp)}°C, ${weatherData.weather[0].description}</h4>
                                <div class="details-grid">
                                    <div class="detail-item">
                                        <span class="detail-label">Feels Like:</span>
                                        <span>${Math.round(weatherData.main.feels_like)}°C</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">Humidity:</span>
                                        <span>${weatherData.main.humidity}%</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">Wind:</span>
                                        <span>${weatherData.wind.speed} m/s</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">Pressure:</span>
                                        <span>${weatherData.main.pressure} hPa</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Helper Functions
function getRandomItems(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function formatNumber(number) {
    return number.toLocaleString();
}

function showLoading() {
    loadingElement.style.display = 'flex';
}

function hideLoading() {
    loadingElement.style.display = 'none';
}

function showError(message) {
    // Clear container and show error message
    countriesContainer.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        </div>
    `;
} 
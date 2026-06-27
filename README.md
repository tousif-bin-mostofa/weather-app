# 🌤️ Weather App

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![OpenWeatherMap](https://img.shields.io/badge/OpenWeatherMap_API-orange?style=for-the-badge)

> A clean, responsive weather application that displays real-time weather data for any city in the world.

🔗 **[Live Demo →](YOUR_GITHUB_PAGES_LINK_HERE)**

---

## 📸 Screenshot

![Weather App Screenshot](screenshots/preview.png)

---

## ✨ Features

- 🔍 Search weather by city name
- 🌡️ Displays temperature, feels-like temperature, humidity, wind speed, and visibility
- ⚡ Real-time data fetched from the OpenWeatherMap API
- ❌ Friendly error messages for invalid input or failed network requests
- 📱 Fully responsive — works on mobile and desktop
- 🎨 Frosted glass UI with smooth fade-in animations

---

## 🛠️ Built With

| Technology | Purpose |
|------------|---------|
| HTML5 | Page structure and semantics |
| CSS3 | Styling, layout, and animations |
| Vanilla JavaScript | App logic and API integration |
| OpenWeatherMap API | Live weather data |

---

## 🚀 Getting Started

### Prerequisites
- A free API key from [OpenWeatherMap](https://openweathermap.org/api)
- Any modern web browser (Chrome, Firefox, Edge)

### Setup

1. Clone this repository:
```bash
git clone https://github.com/YOUR_USERNAME/weather-app.git
```

2. Open `script.js` and replace the placeholder with your own API key:
```javascript
const API_KEY = 'YOUR_API_KEY_HERE'; // ← Replace this with your key
```

3. Open `index.html` in your browser and start searching!

> **Note:** The free OpenWeatherMap plan allows 1,000 API calls per day — more than enough for personal use.

---

## 💡 How to Use

1. Type any city name in the search bar
2. Press **Enter** or click the search button
3. View real-time weather conditions instantly

---

## 📚 What I Learned Building This

- Making HTTP requests using the `fetch()` API
- Writing asynchronous JavaScript with `async/await`
- Parsing and displaying live JSON data from a REST API
- Building responsive layouts with CSS Flexbox
- Handling API errors and edge cases gracefully
- Organizing a clean frontend project structure

---

## 📁 Project Structure

```
weather-app/
├── screenshots/
│   └── preview.png       # App screenshot for README
├── index.html            # Main HTML structure
├── style.css             # All styles and animations
└── script.js             # API logic and DOM manipulation
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

*Built as part of my developer portfolio — [View all my projects →](https://github.com/YOUR_USERNAME)*

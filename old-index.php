<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مسیرهای کوهستانی ایران</title>
    
    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    
    <!-- فونت فارسی -->
    <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet" type="text/css" />
    
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>🏔️ مسیرهای کوهستانی ایران</h1>
            <p>کشف کن، صعود کن، لذت ببر!</p>
        </header>

        <div class="filters">
            <label>
                سختی مسیر:
                <select id="difficulty-filter">
                    <option value="all">همه</option>
                    <option value="easy">آسان</option>
                    <option value="medium">متوسط</option>
                    <option value="hard">سخت</option>
                </select>
            </label>
        </div>

        <div class="main-content">
            <aside class="sidebar">
                <h2>لیست قله‌ها</h2>
                <div id="mountains-list"></div>
            </aside>

            <div class="map-container">
                <div id="map"></div>
            </div>
        </div>

        <div class="info-panel" id="info-panel">
            <button class="close-btn" onclick="closeInfoPanel()">×</button>
            <div id="info-content"></div>
        </div>
    </div>

    <!-- Leaflet JS -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="js/app.js"></script>
</body>
</html>

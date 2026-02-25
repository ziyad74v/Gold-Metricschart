const EGP_PER_OUNCE = 31.1035;

async function loadData() {
    try {
        const yearlyElement = document.getElementById("yearly");
        const goldRes = await fetch("https://api.gold-api.com/price/XAU");
        const goldData = await goldRes.json();
        const ouncePrice = goldData.price;  

// ===== الأداء منذ بداية السنة (YTD) =====
const currentYear = new Date().getFullYear();

const startOfYearPrices = {
    2024: 2060,
    2025: 2658,
    2026: 4331
};

const startPrice = startOfYearPrices[currentYear];

if (!startPrice || isNaN(ouncePrice)) {
    yearlyElement.textContent = "—";
} else {
    const yearlyChange =
        ((ouncePrice - startPrice) / startPrice) * 100;

    yearlyElement.textContent =
        (yearlyChange >= 0 ? "▲ " : "▼ ") +
        Math.abs(yearlyChange).toFixed(2) + "%";

    yearlyElement.style.color =
        yearlyChange >= 0 ? "green" : "red";
}


        const usdRes = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
        const usdData = await usdRes.json();
        const usd = usdData.rates.EGP;

        const gram24 = (ouncePrice / 31.1035) * usd;
        const gram21 = gram24 * 0.875;
        const gram18 = gram24 * 0.75;

        document.getElementById("ounce").innerText = ouncePrice.toFixed(2) + " $";
        document.getElementById("usd").innerText = usd.toFixed(2) + " جنيه";

        document.getElementById("g24").innerText = gram24.toFixed(0) + " جنيه";
        document.getElementById("g21").innerText = gram21.toFixed(0) + " جنيه";
        document.getElementById("g18").innerText = gram18.toFixed(0) + " جنيه";
        document.getElementById("gp").innerText = (gram21 * 8).toFixed(0) + " جنيه";

        
    } catch (error) {
        console.error("حصل خطأ في تحميل الداتا:", error);
    }
}


function calculate() {
    const money = parseFloat(document.getElementById("money").value);
    const result = document.getElementById("result");

    if (!money || money <= 0) {
        result.innerText = "اكتب مبلغ صحيح";
        return;
    }

    const prices = {
        24: parseFloat(document.getElementById("g24").innerText),
        21: parseFloat(document.getElementById("g21").innerText),
        18: parseFloat(document.getElementById("g18").innerText)
    };

    if (!prices[24] || !prices[21] || !prices[18]) {
        result.innerText = "الأسعار غير متاحة دلوقتي";
        return;
    }

    const grams24 = (money / prices[24]).toFixed(2);
    const grams21 = (money / prices[21]).toFixed(2);
    const grams18 = (money / prices[18]).toFixed(2);

    result.innerHTML = `
        بمبلغ ${money} جنيه تقدر تشتري:<br>
        • عيار 24: ${grams24} جرام<br>
        • عيار 21: ${grams21} جرام<br>
        • عيار 18: ${grams18} جرام
    `;
}


function calculateSpread() {
    const buy = parseFloat(document.getElementById("buyPrice").value);
    const sell = parseFloat(document.getElementById("sellPrice").value);

    if (isNaN(buy) || isNaN(sell) || buy === 0) {
    document.getElementById("spreadValue").textContent = 0;
    document.getElementById("spreadPercent").textContent = 0;
    return;
}

    const spread = buy - sell;
  const percent = (spread / buy) * 100;

    document.getElementById("spreadValue").textContent = spread.toFixed(2);
    document.getElementById("spreadPercent").textContent = percent.toFixed(2);
}

// ده كود الانميشن 

const numSpikes = 50;
const container = document.querySelector('.spike-container');

for(let i=0; i<numSpikes; i++){
    const spike = document.createElement('div');
    spike.classList.add('spike');
    spike.style.left = Math.random() * window.innerWidth + 'px';
    spike.style.animationDuration = (2 + Math.random() * 3) + 's';
    spike.style.opacity = Math.random() * 0.8 + 0.2;
    container.appendChild(spike);
}
// ده كود الانميشن 
// اخروهه

loadData();

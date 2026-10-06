fetch("./data/interactions.csv")
.then(response => response.text())
.then(csv => {

    Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,

        complete: function(results) {

            const rows = results.data;

            const counts = {
                CHAT_CHGCXL: 0,
                CHAT_NEWBOOKING: 0,
                CHAT_SCHEDULE_CHANGE: 0,
                CHAT_IROP: 0
            };

            const hourlyCounts = {};

            let totalChats = 0;

            rows.forEach(row => {

                const mediaType = row["Media Type"]?.trim().toLowerCase();

                if (mediaType !== "message") {
                    return;
                }

                totalChats++;

                const queue = row["Queue"]?.trim();

                if (counts[queue] !== undefined) {
                    counts[queue]++;
                }

                const dateText = row["Date"];

                if (dateText) {

                    const match = dateText.match(/(\d+):\d+\s(AM|PM)/);

                    if (match) {
                        const hourNumber = match[1];
                        const amPm = match[2];
                        
                        // Agrupa todo en el bloque de la hora en punto (Ej: "07:00 PM")
                        const hourBucket = `${hourNumber}:00 ${amPm}`;

                        hourlyCounts[hourBucket] = (hourlyCounts[hourBucket] || 0) + 1;
                    }
                }

            });

            document.getElementById("totalChats").textContent = totalChats;
            document.getElementById("chgcxl").textContent = counts.CHAT_CHGCXL;
            document.getElementById("newbooking").textContent = counts.CHAT_NEWBOOKING;
            document.getElementById("schedule").textContent = counts.CHAT_SCHEDULE_CHANGE;
            document.getElementById("irop").textContent = counts.CHAT_IROP;

            buildChart(hourlyCounts);

        }

    });

});

function buildChart(hourlyCounts) {

    // Función auxiliar para convertir formato "07:00 PM" a 24 horas para ordenar correctamente
    const parseHour = (timeStr) => {
        const [time, modifier] = timeStr.split(" ");
        let hour = parseInt(time, 10);
        if (hour === 12) hour = 0;
        if (modifier === "PM") hour += 12;
        return hour;
    };

    // Ordenar las etiquetas (horas) cronológicamente
    const labels = Object.keys(hourlyCounts).sort((a, b) => parseHour(a) - parseHour(b));

    // Obtener los valores respetando el orden de las etiquetas
    const values = labels.map(label => hourlyCounts[label]);

    new Chart(
        document.getElementById("hourChart"),
        {
            type: "bar",

            data: {
                labels: labels,

                datasets: [
                    {
                        label: "Chats",
                        data: values,
                        backgroundColor: "#3b82f6",
                        borderRadius: 8
                    }
                ]
            },

            options: {

                responsive: true,

                plugins: {
                    legend: {
                        display: false
                    }
                },

                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        }
    );
}

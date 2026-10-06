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
                    // Convertir el texto a un objeto Date real para tomar en cuenta el día y mes
                    const dateObj = new Date(dateText);

                    if (!isNaN(dateObj)) {
                        // Redondear a la hora en punto (minutos, segundos y milisegundos a 0)
                        dateObj.setMinutes(0, 0, 0);

                        // Obtener el valor numérico (timestamp) para usarlo como llave cronológica
                        const timestamp = dateObj.getTime();

                        hourlyCounts[timestamp] = (hourlyCounts[timestamp] || 0) + 1;
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

    // 1. Obtener las llaves (timestamps), convertirlas a números y ordenarlas de menor a mayor
    const sortedTimestamps = Object.keys(hourlyCounts)
                                   .map(ts => parseInt(ts, 10))
                                   .sort((a, b) => a - b);

    // 2. Convertir los timestamps ya ordenados de regreso al formato de texto para las etiquetas (Ej: "08:00 PM")
    const labels = sortedTimestamps.map(ts => {
        const date = new Date(ts);
        let hour = date.getHours();
        const ampm = hour >= 12 ? 'PM' : 'AM';
        
        hour = hour % 12;
        hour = hour ? hour : 12; // Si es 0, se convierte en 12
        
        // Agregar un cero inicial si es menor a 10 (Ej: "08" en vez de "8")
        const hourStr = hour < 10 ? '0' + hour : hour;
        
        return `${hourStr}:00 ${ampm}`;
    });

    // 3. Obtener los valores respetando el nuevo orden
    const values = sortedTimestamps.map(ts => hourlyCounts[ts]);

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

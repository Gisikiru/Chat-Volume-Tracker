fetch("./data/interactions.csv")
.then(response => response.text())
.then(csv => {

    Papa.parse(csv,{
        header:true,
        skipEmptyLines:true,

        complete:function(results){

            const rows = results.data;

            const counts = {
                CHAT_CHGCXL:0,
                CHAT_NEWBOOKING:0,
                CHAT_SCHEDULE_CHANGE:0,
                CHAT_IROP:0
            };

            const hourlyCounts = {};

            let totalChats = 0;

            rows.forEach(row => {

                const mediaType =
                    row["Media Type"]?.trim().toLowerCase();

                if(mediaType !== "message"){
                    return;
                }

                totalChats++;

                const queue =
                    row["Queue"]?.trim();

                if(counts[queue] !== undefined){
                    counts[queue]++;
                }

                const dateText =
                    row["Date"];

                if(dateText){

                    const match =
                        dateText.match(/(\d+):\d+\s(AM|PM)/);

                    if(match){

                        const hour =
                            match[0];

                        hourlyCounts[hour] =
                            (hourlyCounts[hour] || 0) + 1;
                    }
                }

            });

            document.getElementById("totalChats").textContent =
                totalChats;

            document.getElementById("chgcxl").textContent =
                counts.CHAT_CHGCXL;

            document.getElementById("newbooking").textContent =
                counts.CHAT_NEWBOOKING;

            document.getElementById("schedule").textContent =
                counts.CHAT_SCHEDULE_CHANGE;

            document.getElementById("irop").textContent =
                counts.CHAT_IROP;

            buildChart(hourlyCounts);

        }

    });

});

function buildChart(hourlyCounts){

    const labels =
        Object.keys(hourlyCounts);

    const values =
        Object.values(hourlyCounts);

    new Chart(
        document.getElementById("hourChart"),
        {
            type:"bar",

            data:{
                labels:labels,

                datasets:[
                    {
                        label:"Chats",

                        data:values,

                        backgroundColor:"#3b82f6",

                        borderRadius:8
                    }
                ]
            },

            options:{

                responsive:true,

                plugins:{
                    legend:{
                        display:false
                    }
                },

                scales:{

                    y:{
                        beginAtZero:true
                    }
                }
            }
        }
    );
}

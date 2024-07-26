function showGraphics(sample, y_test, predict){
    // document.querySelector('.left-grapihcs h2').innerHTML = "Bashoratning solishtirma grafigi"
    var ctx =  document.getElementById('stackedArea').getContext('2d'); 
    var myChart = new Chart(ctx, { 
        type: 'line', 
        data: { 
            labels: sample, 
            datasets: [ 
                { 
                    label: 'Bashorat qiy.', 
                    data: predict, 
                    // backgroundColor: 'rgba(48, 142, 69, 0.7)', 
                    borderColor: 'rgba(48, 142, 69, 1)', 
                    borderWidth: 2, 
                    // fill: true, 
                }, 
                { 
                    label: 'Haqiqiy qiy.', 
                    data: y_test, 
                    // backgroundColor: 'rgba(255, 99, 132, 0.7)', 
                    borderColor: 'rgba(255, 99, 132, 1)', 
                    borderWidth: 2, 
                    // fill: true, 
                }, 
            ] 
        }, 
        options: { 
            scales: { 
                y: { 
                    beginAtZero: true, 
                    stacked: false, 
                    title: { 
                        display: true, 
                        text: 'Mashina' 
                    } 
                }, 
                x: { 
                    stacked: false 
                } 
            }, 
            
            layout: { 
                padding: { 
                    left: 20, 
                    right: 20, 
                    top: 10, 
                    bottom: 10 
                } 
            }, 
            plugins: { 
                legend: { 
                    position: 'top', 
                }, 
                title: {
                    display: true,
                    text: 'Bashoratning solishtirma grafigi'
                },
            } 
        } 
    }); 
}